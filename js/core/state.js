'use strict';
/* Trạng thái giao diện (trang, tuần, vai trò, tab...) */
var S={page:'event',role:'member',week:CUR,q:'',sel:null,swp:[],name:'Phạm Khánh',stErr:'',vtab:'election',pick:{},ppick:{},fin:false,cf:'all',cq:'',popts:['',''],pt:'',pdsc:'',pdays:'3',perr:''};
function cur(){return C}
function admin(){return S.role==='admin'}
function manager(){return S.role==='manager'}   /* Cán sự lớp: thấp hơn admin, cao hơn thành viên */
function canManage(){return S.role==='admin'||S.role==='manager'}   /* được sửa bản tin tuần */
function roleLabel(){return admin()?'Admin lớp':manager()?'Cán sự lớp':'Thành viên'}
