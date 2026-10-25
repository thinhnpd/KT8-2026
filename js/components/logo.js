'use strict';
/* Logo lớp và lấy màu giao diện từ logo */
function extractColor(img){
  var cv=document.createElement('canvas');cv.width=cv.height=48;var x=cv.getContext('2d');x.drawImage(img,0,0,48,48);
  var d=x.getImageData(0,0,48,48).data,r=0,g=0,b=0,w=0;
  for(var i=0;i<d.length;i+=4){
    if(d[i+3]<128)continue;
    var R=d[i],G=d[i+1],B=d[i+2],mx=Math.max(R,G,B),mn=Math.min(R,G,B),s=mx?(mx-mn)/mx:0,l=(mx+mn)/510;
    if(s<.25||l>.92||l<.08)continue;
    var wt=s*s;r+=R*wt;g+=G*wt;b+=B*wt;w+=wt;
  }
  if(!w)return null;
  r/=w;g/=w;b/=w;var lum=.299*r+.587*g+.114*b;
  if(lum>115){var f=115/lum;r*=f;g*=f;b*=f}
  return '#'+[r,g,b].map(function(v){return('0'+Math.round(v).toString(16)).slice(-2)}).join('');
}
/* Thu nhỏ ảnh logo (tối đa 256 px) để lưu gọn trong cơ sở dữ liệu; SVG giữ nguyên */
function shrinkLogo(img,src){
  if(/^data:image\/svg/.test(src))return src;
  var m=256,w=img.naturalWidth||m,h=img.naturalHeight||m,s=Math.min(1,m/Math.max(w,h));
  var cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(w*s));cv.height=Math.max(1,Math.round(h*s));
  cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
  return cv.toDataURL('image/png');
}
function setLogo(src){
  if(!admin()){toast('Chỉ admin mới được thay đổi.');return}
  var img=new Image();
  img.onload=function(){
    var col=null;try{col=extractColor(img)}catch(e){}
    var out=src;try{out=shrinkLogo(img,src)}catch(e){}
    var c=cur(),newCol=col||c.color;
    API.saveClass({logo_url:out,color:newCol}).then(function(){
      c.logo=out;c.color=newCol;
      applyAccent();render();toast(col?'Đã đổi logo, màu giao diện lấy từ logo':'Đã đổi logo, không tìm được màu nổi bật nên giữ màu cũ');
    }).catch(function(err){console.error(err);toast(err.message==='forbidden'?'Chỉ admin mới được thay đổi.':'Không lưu được logo, vui lòng thử lại.')});
  };
  img.onerror=function(){toast('Không đọc được ảnh này, thử tệp PNG hoặc JPG khác')};
  img.src=src;
}
var SAMPLES=['#D9653B','#2F8A63','#7A55C7','#C2410C'],sampleI=0;
function sampleLogo(){
  var col=SAMPLES[sampleI++%SAMPLES.length];
  var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#fff"/><circle cx="32" cy="32" r="21" fill="'+col+'"/><path d="M23 33l7 7 12-14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  setLogo('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));
}
