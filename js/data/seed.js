'use strict';
/* Dữ liệu mẫu (sau này thay bằng gọi API): lớp, tuần, bầu cử, thông báo */
function gen(n,off){var out=[],seen={};for(var i=0;i<n;i++){var k=i+off,t=(k*7+Math.floor(k/20)*3)%20,nm;do{nm=HO[k%10]+' '+MID[(k*3+Math.floor(k/10))%10]+' '+TEN[t];t=(t+1)%20}while(seen[nm]);seen[nm]=1;out.push(nm)}return out}
function mkInfo(s,k,used){
  var w=noDia(s).toLowerCase().split(/\s+/),last=w[w.length-1],ini=w.slice(0,-1).map(function(x){return x[0]}).join('');
  var em=last+'.'+ini,b=em,n=2;while(used[em]){em=b+n;n++}used[em]=1;
  var v=((k+5)*7919317)%100000000;
  return{email:em+'@student.edu.vn',phone:'09'+('00000000'+v).slice(-8),subj:k%3===1?SUBJ[(k*5)%SUBJ.length]:'',talent:k%3===0?TAL[(k*3)%8]:''};
}
function mkWeeks(){return{
  11:{pins:[],rem:['Thu bài kiểm tra tuần trước'],ev:[{d:0,t:'Chào cờ đầu tuần',c:'Sinh hoạt',det:'Tập trung sân trường lúc 7h00.'},{d:3,t:'Kiểm tra 15 phút môn Toán',c:'Kiểm tra',det:'Chương 1, đại số.',f:'De-cuong-Toan.pdf'}]},
  12:{pins:[{tag:'Cấp thiết',t:'Lịch thi Giữa kỳ HK1, bắt đầu từ ngày 26/10',det:'Chi tiết lịch thi và danh sách phòng thi.',f:'Lich-thi-giua-ky.pdf'}],rem:['Nộp quỹ lớp trước ngày 16/10','Hoàn thành khảo sát học tập trực tuyến'],ev:[
    {d:0,t:'Chào cờ đầu tuần',c:'Sinh hoạt',det:'Tập trung sân trường lúc 7h00, mặc đồng phục.'},
    {d:0,t:'Nộp bài tập lớn môn Ngữ Văn',c:'Bài tập',det:'Nộp bản in cho cô trước tiết 3.',f:'De-bai-Ngu-Van.pdf'},
    {d:2,t:'Kiểm tra 15 phút môn Hoá học',c:'Kiểm tra',det:'Phạm vi: chương 2, bài 5 đến bài 7. Không dùng tài liệu.',f:'On-tap-Hoa.pdf'},
    {d:3,t:'Học bù Toán (tiết 1-2)',c:'Bài tập',det:'Phòng 413, mang theo vở bài tập.'},
    {d:4,t:'Sinh hoạt lớp và phổ biến kế hoạch cắm trại',c:'Sinh hoạt',det:'Ban cán sự trình bày kế hoạch, cả lớp góp ý.',f:'Ke-hoach-cam-trai.pdf'}]},
  14:{pins:[],rem:[],ev:[{d:2,t:'Tham quan bảo tàng Lịch sử',c:'Sự kiện',det:'Tập trung 7h30 trước cổng trường.',f:'Giay-xin-phep.pdf'}]}}}

function seedEl(c){
  var st=c.students,n=st.length,g=groupsOf(c),V=[[13,9,4],[6,12,8],[10,5,11],[7,13,6],[12,8,6]],T=[[3,5,1],[5,2,1],[2,4,2],[4,3,1]],cands={};
  POSITIONS.forEach(function(r,p){
    var tg=POSG(r),names=tg<0?[st[p],st[(10+p*3)%n],st[(11+p*3)%n]]:[g[tg][2],g[tg][1],g[tg][3]],vs=tg<0?V[p]:T[tg];
    cands[r]=names.map(function(nm,i){return{n:nm,v:vs[i]}});
  });
  return{status:'open',deadline:'18/10',voted:26,me:false,cands:cands,sum:null};
}
function mkClass(){
  var st=gen(35,0);st[0]='Phạm Khánh';
  var info={},used={};st.forEach(function(s,k){info[s]=mkInfo(s,k,used)});
  var c={name:'Lớp 10A5',school:'Trường THPT Chuyên Lê Quý Đôn',color:'#3D78C0',logo:null,students:st,info:info,
    teachers:TCH.map(function(t,i){return{n:t[0],s:t[1],email:t[2],phone:t[3],gv:i===0}}),
    committee:POSITIONS.map(function(r,i){var tg=POSG(r);return{r:r,w:tg<0?st[i]:st[8+tg]}}),
    weeks:mkWeeks(),reads:{},
    feedback:[],polls:[{id:'p1',t:'Chọn địa điểm cắm trại',desc:'Cả lớp chọn một địa điểm. Kết quả chốt vào cuối tuần.',opts:[{t:'Suối Mơ',v:14},{t:'Đồi thông',v:9},{t:'Bãi biển',v:6}],my:null,end:'17/10',closed:false,by:'Cô Lê Thu Hằng'},
      {id:'p2',t:'Chọn màu áo lớp',desc:'',opts:[{t:'Xanh navy',v:18},{t:'Trắng',v:7},{t:'Xám',v:5}],my:0,end:'10/10',closed:true,by:'Phạm Khánh'}]};
  c.el=seedEl(c);
  var g=buildGrid(st,4,5,2);
  c.map={rows:4,cols:5,spd:2,mode:'confirmed',grid:g,saved:cloneG(g),ag:false,rnd:false};
  return c;
}
var C=mkClass();
var notifs=[
  {id:1,i:'calendar-event',t:'Cô Hằng đăng lịch kiểm tra 15 phút môn Hoá học',time:'2 giờ trước',pg:'event',un:true},
  {id:2,i:'pin',t:'Tin ghim mới: Lịch thi Giữa kỳ HK1',time:'5 giờ trước',pg:'event',un:true},
  {id:6,i:'vote',t:'Bầu ban cán sự đang mở, hạn bỏ phiếu 18/10',time:'Sáng nay',pg:'vote',un:true},
  {id:3,i:'clipboard-check',t:'Bạn được xếp trực nhật hôm nay (Thứ 5)',time:'Sáng nay',pg:'event',un:true},
  {id:4,i:'message-circle',t:'Góp ý của bạn về lịch học bù đã được xử lý',time:'Hôm qua',pg:'feedback',un:false},
  {id:5,i:'settings',t:'Admin cập nhật danh sách lớp',time:'2 ngày trước',pg:'settings',un:false}
];
