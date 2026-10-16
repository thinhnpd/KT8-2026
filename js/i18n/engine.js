'use strict';
/* Động cơ đa ngôn ngữ.
   - Giao diện gốc viết bằng tiếng Việt (vi). Ngôn ngữ khác (en...) được dịch ở mức DOM:
     chữ trong text node + các thuộc tính placeholder / aria-label / title / alt.
   - Mỗi ngôn ngữ đăng ký từ điển bằng I18N.add(lang, dict, patterns) (xem js/i18n/en-*.js).
   - dict: khớp nguyên câu.  patterns: [RegExp, function(...nhóm)] cho câu có số liệu / tên riêng.
   - MutationObserver tự dịch phần mới được vẽ ra khi trang render lại, thông báo, toast...
   - Chữ gốc được lưu lại nên đổi về tiếng Việt khôi phục chính xác. */
var I18N=(function(){
  var KEY='sclass.lang',ATTRS=['placeholder','aria-label','title','alt'];
  var langs={},cur='vi',obs=null,listeners=[];
  var textRec=new WeakMap(),attrRec=new WeakMap(),titleVi=null;

  function add(lang,dict,pats){
    var L=langs[lang]||(langs[lang]={dict:{},pats:[]});
    for(var k in dict)L.dict[k]=dict[k];
    L.pats=(pats||[]).concat(L.pats);   /* file nạp sau có ưu tiên cao hơn */
  }
  /* Dịch một chuỗi đã cắt khoảng trắng; không có bản dịch thì trả lại nguyên văn */
  function tr(s){
    var L=langs[cur];if(!L||!s)return s;
    if(Object.prototype.hasOwnProperty.call(L.dict,s))return L.dict[s];
    if(s.indexOf(' · ')>0)return s.split(' · ').map(tr).join(' · ');
    for(var i=0;i<L.pats.length;i++){
      var m=L.pats[i][0].exec(s);
      if(m)return L.pats[i][1].apply(null,m.slice(1));
    }
    return s;
  }
  function trWs(v){
    var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(v);
    if(!m[2])return v;
    var t=tr(m[2].replace(/\s+/g,' '));
    return t===m[2]?v:m[1]+t+m[3];
  }
  /* skip: không đụng tới cả nhánh (nút ngôn ngữ). skipText: không dịch chữ bên trong
     (script/style, nội dung ô textarea do người dùng gõ, chữ viết tắt trên avatar). */
  function skip(el){return !el||!!(el.closest&&el.closest('[data-no-i18n]'))}
  function skipText(el){return skip(el)||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(el.tagName)||!!el.closest('.av')}

  function doText(n){
    var p=n.parentElement;if(skipText(p))return;
    var r=textRec.get(n),o=n.nodeValue;
    if(r&&r.l===cur&&o===r.t)return;          /* đã dịch rồi */
    var t=trWs(o);
    if(p.tagName==='OPTION'&&!p.hasAttribute('value'))p.setAttribute('value',p.value); /* giữ giá trị gốc cho code */
    if(t!==o)n.nodeValue=t;
    textRec.set(n,{o:o,t:t,l:cur});
  }
  function doAttr(el,a){
    if(skip(el)||!el.hasAttribute(a))return;
    var rec=attrRec.get(el)||{},r=rec[a],v=el.getAttribute(a);
    if(r&&r.l===cur&&v===r.t)return;
    var t=trWs(v);
    if(t!==v)el.setAttribute(a,t);
    rec[a]={o:v,t:t,l:cur};attrRec.set(el,rec);
  }
  function walk(root,fn){
    if(root.nodeType===3){fn.text(root);return}
    if(root.nodeType!==1||skip(root))return;
    fn.el(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      return n.nodeType===1&&skip(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    var n;while(n=w.nextNode()){if(n.nodeType===3)fn.text(n);else fn.el(n)}
  }
  var APPLY={text:doText,el:function(el){ATTRS.forEach(function(a){doAttr(el,a)})}};
  var RESTORE={
    text:function(n){var r=textRec.get(n);if(r&&n.nodeValue===r.t){n.nodeValue=r.o}textRec.delete(n)},
    el:function(el){var rec=attrRec.get(el);if(!rec)return;
      ATTRS.forEach(function(a){var r=rec[a];if(r&&el.getAttribute(a)===r.t)el.setAttribute(a,r.o)});attrRec.delete(el)}
  };

  function watch(on){
    if(!obs)obs=new MutationObserver(function(list){
      obs.disconnect();
      list.forEach(function(m){
        if(m.type==='childList')m.addedNodes.forEach(function(n){walk(n,APPLY)});
        else if(m.type==='characterData')doText(m.target);
        else if(m.type==='attributes')doAttr(m.target,m.attributeName);
      });
      connect();
    });
    if(on)connect();else obs.disconnect();
  }
  function connect(){obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS})}

  function setTitle(){
    if(titleVi===null)titleVi=document.title;
    document.title=cur==='vi'?titleVi:tr(titleVi);
  }
  function set(lang,silent){
    if(lang!=='vi'&&!langs[lang])return;
    if(obs)obs.disconnect();
    walk(document.body,RESTORE);           /* về chữ gốc trước */
    cur=lang;
    document.documentElement.lang=lang;
    setTitle();
    if(lang!=='vi'){walk(document.body,APPLY);watch(true)}
    if(!silent){try{localStorage.setItem(KEY,lang)}catch(e){}}
    listeners.forEach(function(f){f(lang)});
  }
  function init(){
    var l='vi';try{l=localStorage.getItem(KEY)||'vi'}catch(e){}
    set(l,true);
  }
  return {add:add,tr:tr,set:set,init:init,get:function(){return cur},onChange:function(f){listeners.push(f)}};
})();
