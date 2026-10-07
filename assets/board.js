(function(){
var board=document.getElementById('board');if(!board)return;
var q=document.getElementById('q'),hit=document.getElementById('hit');
var cards=[].slice.call(document.querySelectorAll('.flow-detail__view-card-item-process'));
var cols=[].slice.call(document.querySelectorAll('.col'));var filter='all';
function apply(){var s=(q.value||'').trim().toLowerCase(),n=0;
 cards.forEach(function(c){var okS=!s||(c.dataset.search||'').indexOf(s)>=0,okF=true;
  if(filter==='delay')okF=c.dataset.delay==='1';
  else if(filter==='active')okF=['已完成','已关闭','其他'].indexOf(c.dataset.col)<0;
  else if(filter==='done')okF=['已完成','已关闭','其他'].indexOf(c.dataset.col)>=0;
  var show=okS&&okF;c.style.display=show?'':'none';if(show)n++;});
 cols.forEach(function(col){var vis=col.querySelectorAll('.flow-detail__view-card-item-process:not([style*="display: none"])').length;
  var empty=col.querySelector('.col-empty');
  if(!vis&&!empty){empty=document.createElement('div');empty.className='col-empty';empty.textContent='无匹配';col.querySelector('.flow-detail__view-card-item-body').appendChild(empty);}
  else if(vis&&empty){empty.remove();}
  var b=col.querySelector('.flow-detail__view-card-item-count');
  if(b)b.textContent=(s||filter!=='all')?String(vis):col.dataset.count;});
 hit.textContent=(s||filter!=='all')?('筛选后 '+n+' / '+cards.length+' 张卡片'):'';}
q.addEventListener('input',apply);
[].forEach.call(document.querySelectorAll('.chip[data-f]'),function(b){b.addEventListener('click',function(){
 [].forEach.call(document.querySelectorAll('.chip[data-f]'),function(x){x.classList.remove('on');});
 b.classList.add('on');filter=b.dataset.f;apply();});});
var all=document.querySelector('.chip[data-f="all"]');if(all)all.classList.add('on');
var te=document.getElementById('toggleEmpty');
if(te)te.addEventListener('click',function(){var hide=this.textContent==='隐藏空列';
 cols.forEach(function(c){if(c.dataset.count==='0')c.classList.toggle('hide',hide);});
 this.textContent=hide?'显示空列':'隐藏空列';});
var MASK=document.getElementById('pdmask');
var STEPS=window.__STEPS__||[],CRUMB=window.__CRUMB__||{};
var PERSON=window.__PERSON__||{};
var DET=window.__DETAILS__||{};
function dur(ms){if(ms===null||ms===undefined)return '—';var h=ms<86400000;var v=h?ms/3600000:ms/86400000;
 return v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+(h?'小时':'天');}
function pe(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function personOf(o){return PERSON[o]||o;}
function quillText(q){try{var d=JSON.parse(q);if(!d||!d.ops)return q||'';var t='';d.ops.forEach(function(o){t+=(typeof o.insert==='string')?o.insert:'[附件]';});return t.trim();}catch(e){return q||'';}}
function fmtDT(s){if(!s)return null;var m=String(s).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);return m?(m[2]+'月'+m[3]+'日 '+m[4]+':'+m[5]):s;}
function fileName(x){return pe(typeof x==='object'?(x.name||x.fileName||''):x);}
function fieldHtml(f){
 var val=f.value,has=val!==null&&val!==undefined&&val!=='';
 if(f.selector&&f.selector.length){var chosen=[];
  if(has){var arr=Array.isArray(val)?val:[val];chosen=arr.map(function(x){return typeof x==='object'?String(x.name||x.value||''):String(x);});}
  return '<div class="pd-checks">'+f.selector.map(function(s){
   var obj=s!==null&&typeof s==='object';var label=obj?(s.name!=null?s.name:s.value):s;
   var keys=obj?[s.value,s.id,s.name]:[s];
   var on=keys.some(function(k){return k!=null&&chosen.indexOf(String(k))>=0;});
   return '<span class="pd-check'+(on?' on':'')+'"><span class="box">'+(on?'✓':'')+'</span>'+pe(label)+'</span>';}).join('')+'</div>';}
 if(f.files&&f.files.length){return '<div class="pd-files">'+f.files.map(function(x){return '<span class="pd-file">📎 '+fileName(x)+'</span>';}).join('')+'</div>';}
 if(f.type===34){return '<span class="pd-quote">⇄ 引用字段'+(has?'：'+fileName(val):'')+'</span>';}
 if(has){return '<div class="pd-input">'+pe(typeof val==='object'?JSON.stringify(val):val)+(f.unit?' '+pe(f.unit):'')+'</div>';}
 return '<div class="pd-input empty">'+(f.placeholder?pe(f.placeholder):'— 无数据 —')+'</div>';}
var CUR=null,CUR_TAB='dynamic';
function statusLabel(st){return {doing:'进行中',pending:'未开始',passed:'已通过',over:'已结束',closed:'已关闭'}[st]||st||'';}
function railItems(det){
 if(det&&det.detail&&det.detail.steps&&det.detail.steps.length){
  return det.detail.steps.map(function(s){return {name:s.name,status:s.status,done:s.status==='passed'?1:0};});}
 return STEPS.map(function(s){return {name:s.name,status:s.done?'passed':'',done:s.done,count:s.count};});}
function findStep(det,name){if(det&&det.detail&&det.detail.steps){for(var i=0;i<det.detail.steps.length;i++){if(det.detail.steps[i].name===name)return det.detail.steps[i];}}return null;}
function renderSide(t){
 CUR_TAB=t;var box=document.getElementById('pdsidebody');if(!box)return;
 var d=CUR;if(!d){box.innerHTML='<div class="pd-side-empty">暂无内容</div>';return;}
 var det=DET[d.id]||null;var list=det&&det.comments?det.comments:[];
 if(t==='comment'){
  var cm=list.filter(function(x){return x.type===0;});
  box.innerHTML=cm.length?cm.map(function(x){return '<div class="pd-cmt"><div class="pd-cmt-h"><span class="pd-cmt-name">'+pe(personOf(x.name)||x.name||'—')+'</span><span class="pd-cmt-time">'+fmtDT(x.dateCreated)+'</span></div><div class="pd-cmt-body">'+(x.content||'')+'</div></div>';}).join(''):'<div class="pd-side-empty">暂无评论</div>';}
 else if(t==='dynamic'){
  var dy=list.filter(function(x){return x.type!==0;});
  box.innerHTML=dy.length?dy.map(function(x){return '<div class="pd-cmt"><div class="pd-cmt-h"><span class="pd-cmt-name">'+pe(personOf(x.name)||x.name||'系统')+'</span><span class="pd-cmt-time">'+fmtDT(x.dateCreated)+'</span></div><div class="pd-cmt-body">'+pe(String(x.operateContent||x.content||'').replace(/\$(\w+)=([^\s$]+)/g,function(m,k,id){return personOf(id)||id;}))+'</div></div>';}).join(''):'<div class="pd-side-empty">暂无动态</div>';}
 else{box.innerHTML='<div class="pd-side-empty">流程文件未包含在离线镜像中</div>';}}
function renderDetail(d,viewStep){
 viewStep=viewStep||d._stepInfoName;var isCur=viewStep===d._stepInfoName;
 var det=DET[d.id]||null;
 MASK.querySelector('.pd-rail').innerHTML='<div class="pd-rail-title">步骤</div>'+railItems(det).map(function(s){
  var on=s.name===viewStep;
  return '<div class="pd-step'+(on?' on':'')+(s.done?' done':'')+'" data-step="'+pe(s.name)+'"><span class="dot"></span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+pe(s.name)+'">'+pe(s.name)+'</span>'+(s.count!==undefined?'<span style="font-size:11px;color:#c9cdd4">'+s.count+'</span>':'')+'</div>';}).join('');
 var stObj=findStep(det,viewStep);
 var ex=(det&&det.form&&det.form.executor&&det.form.executor.length)?det.form.executor.map(personOf):String(d.executorNames||'').split(/[,\s、，/]+/).filter(Boolean).map(personOf);
 if(!isCur&&stObj&&stObj.users&&stObj.users.length){ex=stObj.users.map(personOf);}
 var c='<div class="pd-step-title"><span class="flag"></span><h2>'+pe(viewStep)+'</h2>';
 if(stObj&&stObj.status){c+='<span class="pd-status'+(stObj.status==='doing'?'':' off')+'">'+pe(statusLabel(stObj.status))+'</span>';}
 else if(isCur){var terminal={finished:'已完成',closed:'已关闭'}[d.status]||(['已完成','已关闭'].indexOf(d._stepInfoName)>=0?d._stepInfoName:'');
  c+=terminal?'<span class="pd-status off">'+pe(terminal)+'</span>':(d.isDelay?'<span class="pd-status delay">已延期 '+dur(d.delayTime)+'</span>':'<span class="pd-status">进行中</span>');}
 c+='</div>';
 c+='<div class="pd-meta"><span>执行人 <b>'+(ex.length?pe(ex.join('、')):'—')+'</b></span><span>创建人 <b>'+pe(personOf(d.userName)||'—')+'</b></span>';
 if(stObj&&stObj.startTime){c+='<span>开始 <b>'+fmtDT(stObj.startTime)+'</b></span>';}
 if(stObj&&stObj.overTime){c+='<span>完成 <b>'+fmtDT(stObj.overTime)+'</b></span>';}
 if(isCur&&det&&det.step&&det.step.deadTime){c+='<span>截止 <b>'+fmtDT(det.step.deadTime)+'</b></span>';}
 c+='<span>总用时 <b>'+dur(d.today)+'</b></span></div>';
 if(isCur&&det&&det.step&&det.step.description){c+='<div class="pd-desc">'+pe(quillText(det.step.description))+'</div>';}
 if(isCur){
  if(det&&det.form&&(det.form.fields||[]).length){
   c+='<div class="pd-form-title">'+pe(det.form.formName||'编辑表单')+'<span class="edit">表单数据为抓取时刻快照</span></div>'+det.form.fields.map(function(f){
    return '<div class="pd-field"><label>'+pe(f.name)+(f.isRequired?'<span class="req">*</span>':'')+'</label>'+fieldHtml(f)+'</div>';}).join('');}
  else if((d.fields||[]).length){
   c+='<div class="pd-form-title">编辑表单<span class="edit">看板字段快照（详情接口无数据）</span></div>'+d.fields.map(function(f){
    return '<div class="pd-field"><label>'+pe(f.name)+(f.isRequired?'<span class="req">*</span>':'')+'</label>'+fieldHtml(f)+'</div>';}).join('');}
  else{c+='<div class="pd-nodata">该卡片无表单字段数据。</div>';}}
 else{c+='<div class="pd-nodata">该步骤的表单字段未包含在离线镜像中（原站也仅当前步骤展示表单）。</div>';}
 MASK.querySelector('.pd-main').innerHTML=c;
 MASK.querySelector('.pd-head .pd-id').textContent='ID: '+(d.number||d.id);
 MASK.querySelector('.pd-head .pd-crumb').innerHTML='<b>'+pe(CRUMB.project||'')+'</b> / '+pe(CRUMB.module||'')+' / '+pe(d.name||'');
 var members=[];var cr=personOf(d.userName);if(cr)members.push(cr);ex.forEach(function(x){if(members.indexOf(x)<0)members.push(x);});
 MASK.querySelector('.pd-avatars').innerHTML=members.map(function(n){return '<span class="pd-ava" title="'+pe(n)+'">'+pe(n.slice(0,1))+'</span>';}).join('')||'<span class="pd-nodata">—</span>';
 renderSide(CUR_TAB);}
function openDetail(d){CUR=d;renderDetail(d);MASK.classList.add('show');}
function closeDetail(){MASK.classList.remove('show');}
function toast(msg){var t=document.getElementById('pdtoast');t.textContent=msg;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(function(){t.style.display='none';},2200);}
if(MASK){
 document.getElementById('pdx').addEventListener('click',closeDetail);
 document.getElementById('pdback').addEventListener('click',closeDetail);
 document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDetail();});
 MASK.addEventListener('click',function(e){
  if(e.target===MASK){closeDetail();return;}
  var st=e.target.closest?e.target.closest('.pd-step'):null;
  if(st&&CUR){renderDetail(CUR,st.getAttribute('data-step'));}});
 [].forEach.call(document.querySelectorAll('.pd-tab'),function(t){t.addEventListener('click',function(){
  [].forEach.call(document.querySelectorAll('.pd-tab'),function(x){x.classList.remove('on');});
  t.classList.add('on');renderSide(t.getAttribute('data-t'));});});
 document.getElementById('pdurge').addEventListener('click',function(){toast('离线镜像仅展示，不支持催办');});
 document.getElementById('pdskip').addEventListener('click',function(){toast('离线镜像仅展示，不支持跳过');});}
cards.forEach(function(c){c.addEventListener('click',function(){var d;try{d=JSON.parse(c.dataset.payload);}catch(e){return;}openDetail(d);});});
})();
