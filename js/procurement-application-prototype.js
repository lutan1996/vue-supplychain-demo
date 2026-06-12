(function () {
  var STEPS = ["部门专责提报", "部门主管审核", "主管领导审核", "公司采购主管审核", "公司采购专责备案"];
  var DEPTS = ["经营发展中心", "运维一部", "运维二部", "工程管理部", "数字化中心", "综合管理部"];
  var ROLE = {
    dept_asset: { name: "李哲", dept: "经营发展中心" },
    dept_material: { name: "张敏", dept: "经营发展中心" },
    dept_head: { name: "张主管", dept: "经营发展中心" },
    leader: { name: "赵领导", depts: ["运维一部", "运维二部", "工程管理部", "数字化中心"] },
    corp_specialist: { name: "王卿明" },
    corp_head: { name: "王超" },
    director: { name: "周董" }
  };

  var CTX = { list: [], editing: null, pendingId: null, apprPass: true };

  function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function role(){ return document.getElementById("paRole").value; }
  function user(){ return ROLE[role()].name; }
  function pad(n){ return String(n).padStart(2,"0"); }
  function nowDate(){ var d=new Date(); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
  function nowTime(){ var d=new Date(); return nowDate()+" "+pad(d.getHours())+":"+pad(d.getMinutes()); }
  function genNo(){ var d=new Date(); return "CG-"+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"-"+Math.floor(1000+Math.random()*9000); }
  function moneyWan(yuan){ return (Number(yuan||0)/10000).toFixed(2); }

  function initData(){
    CTX.list = [
      { id:"r1", no:"CG-20260418-1201", projectName:"华北风场备件采购", dept:"经营发展中心", applicant:"李哲", applyTime:"2026-04-18 09:10", needDate:"2026-05-20", annualPlan:"是", status:"草稿", node:"—", nodeIdx:0, budgetYuan:860000, approvedBudgetWan:86, urgent:"普通", materials:[{name:"齿轮箱",spec:"GW-GX-3.2MW",cat:"生产类",qty:2,unit:"台",price:300000,remark:""},{name:"主轴轴承",spec:"BR-120",cat:"生产类",qty:4,unit:"件",price:65000,remark:""}], reason:"季度备件补库" },
      { id:"r2", no:"CG-20260417-2210", projectName:"办公设备更新项目", dept:"经营发展中心", applicant:"张敏", applyTime:"2026-04-17 14:00", needDate:"2026-05-10", annualPlan:"否", status:"审批中", node:"部门主管审核", nodeIdx:1, budgetYuan:220000, approvedBudgetWan:22, urgent:"紧急", materials:[{name:"办公电脑",spec:"ThinkPad P16",cat:"办公类",qty:4,unit:"台",price:15000,remark:""},{name:"显示器",spec:"27寸",cat:"办公类",qty:4,unit:"台",price:2500,remark:""}], reason:"办公设备更新" },
      { id:"r3", no:"CG-20260416-3318", projectName:"场站改造电缆采购", dept:"运维一部", applicant:"王芳", applyTime:"2026-04-16 10:00", needDate:"2026-05-12", annualPlan:"是", status:"审批中", node:"公司采购主管审核", nodeIdx:3, budgetYuan:1450000, approvedBudgetWan:145, urgent:"普通", materials:[{name:"电缆",spec:"YJV-10kV",cat:"生产类",qty:1800,unit:"米",price:620,remark:""},{name:"连接器",spec:"CN-88",cat:"销售类",qty:400,unit:"件",price:200,remark:""}], reason:"场站改造项目" },
      { id:"r4", no:"CG-20260410-9921", projectName:"无人机巡检能力提升", dept:"运维二部", applicant:"周宁", applyTime:"2026-04-10 11:40", needDate:"2026-05-15", annualPlan:"是", status:"已通过", node:"已完成", nodeIdx:5, budgetYuan:380000, approvedBudgetWan:37.5, urgent:"特急", materials:[{name:"无人机电池",spec:"BAT-5000",cat:"生产类",qty:12,unit:"件",price:18000,remark:""},{name:"巡检终端",spec:"DJI-RC",cat:"办公类",qty:4,unit:"台",price:42000,remark:""}], reason:"巡检能力补强" },
      { id:"r5", no:"CG-20260409-7782", projectName:"会议室改造项目", dept:"综合管理部", applicant:"刘静", applyTime:"2026-04-09 15:20", needDate:"2026-05-08", annualPlan:"否", status:"已驳回", node:"已驳回", nodeIdx:1, budgetYuan:95000, approvedBudgetWan:0, urgent:"普通", materials:[{name:"会议系统配件",spec:"MS-2",cat:"办公类",qty:5,unit:"套",price:19000,remark:""}], reason:"会议室改造" },
      { id:"r6", no:"CG-20260408-6631", projectName:"风机巡检工器具补充", dept:"运维一部", applicant:"李哲", applyTime:"2026-04-08 10:35", needDate:"2026-05-05", annualPlan:"否", status:"已撤回", node:"—", nodeIdx:0, budgetYuan:126000, approvedBudgetWan:0, urgent:"普通", materials:[{name:"绝缘工具包",spec:"INS-01",cat:"生产类",qty:6,unit:"套",price:21000,remark:""}], reason:"工具补充" },
      { id:"r7", no:"CG-20260407-5528", projectName:"数据中心网络设备采购", dept:"数字化中心", applicant:"王芳", applyTime:"2026-04-07 15:10", needDate:"2026-05-18", annualPlan:"是", status:"草稿", node:"—", nodeIdx:0, budgetYuan:460000, approvedBudgetWan:46, urgent:"紧急", materials:[{name:"核心交换机",spec:"SW-9600",cat:"办公类",qty:2,unit:"台",price:180000,remark:""},{name:"万兆模块",spec:"SFP-10G",cat:"办公类",qty:10,unit:"件",price:10000,remark:""}], reason:"网络升级" },
      { id:"r8", no:"CG-20260406-4419", projectName:"场站电气改造采购", dept:"工程管理部", applicant:"周宁", applyTime:"2026-04-06 09:50", needDate:"2026-05-25", annualPlan:"是", status:"审批中", node:"主管领导审核", nodeIdx:2, budgetYuan:780000, approvedBudgetWan:78, urgent:"普通", materials:[{name:"配电柜",spec:"PD-35kV",cat:"生产类",qty:3,unit:"台",price:220000,remark:""}], reason:"电气改造" },
      { id:"r9", no:"CG-20260405-3320", projectName:"后勤办公补给采购", dept:"综合管理部", applicant:"刘静", applyTime:"2026-04-05 13:20", needDate:"2026-05-06", annualPlan:"否", status:"已通过", node:"已完成", nodeIdx:5, budgetYuan:68000, approvedBudgetWan:6.8, urgent:"普通", materials:[{name:"打印耗材",spec:"HP-88A",cat:"办公类",qty:40,unit:"件",price:1200,remark:""}], reason:"办公补给" },
      { id:"r10", no:"CG-20260404-2217", projectName:"备件仓储优化采购", dept:"经营发展中心", applicant:"张敏", applyTime:"2026-04-04 17:05", needDate:"2026-05-12", annualPlan:"否", status:"已撤回", node:"—", nodeIdx:0, budgetYuan:215000, approvedBudgetWan:0, urgent:"普通", materials:[{name:"货架组件",spec:"RACK-02",cat:"生产类",qty:15,unit:"套",price:12000,remark:""}], reason:"仓储优化" }
    ];
    CTX.list.forEach(recalcRow);
  }

  function recalcRow(r){
    var total = 0;
    (r.materials||[]).forEach(function(m){ m.total = (Number(m.qty)||0) * (Number(m.price)||0); total += m.total; });
    r.budgetYuan = total;
  }

  function statusTag(s){
    if(s==="草稿") return '<span class="pa-tag draft">草稿</span>';
    if(s==="审批中") return '<span class="pa-tag pending">审批中</span>';
    if(s==="已通过") return '<span class="pa-tag pass">已通过</span>';
    return '<span class="pa-tag reject">已驳回</span>';
  }

  function visible(r){
    var ro=role();
    /* 采购申请页按你的验收口径：列表默认展示全量，不再按角色压缩可见行数 */
    if(ro==="dept_asset"||ro==="dept_material") return true;
    if(ro==="dept_head") return true;
    if(ro==="leader") return true;
    return true;
  }

  function canApprove(r){
    if(r.status!=="审批中") return false;
    var ro=role();
    if(ro==="dept_head" && r.node==="部门主管审核" && r.dept===ROLE[ro].dept) return true;
    if(ro==="leader" && r.node==="主管领导审核" && ROLE[ro].depts.indexOf(r.dept)>=0) return true;
    if(ro==="corp_head" && r.node==="公司采购主管审核") return true;
    return false;
  }

  function ops(r){
    var st = String(r.status || "");
    var html=[];
    function add(lbl,act,style){ html.push('<button type="button" class="carrier-btn-add pa-op-btn" data-act="'+act+'" data-id="'+r.id+'"'+(style?' style="'+style+'"':'')+'>'+lbl+'</button>'); }

    add("查看","detail");
    if(st==="草稿" || st==="已驳回" || st==="已撤回"){
      add("编辑","edit");
      add("删除","delete");
      add("提交审批","submit");
    }
    return '<span class="pa-ops">'+html.join("")+"</span>";
  }

  function summaryMaterials(ms){
    if(!ms||!ms.length) return {txt:"—",title:""};
    if(ms.length===1) return {txt:ms[0].name,title:ms[0].name};
    return {txt:ms[0].name+"等"+ms.length+"项",title:ms.map(function(x){return x.name;}).join("、")};
  }

  function query(){
    var no=(document.getElementById("paFNo").value||"").trim();
    var dept=document.getElementById("paFDept").value||"";
    var mat=(document.getElementById("paFMaterial").value||"").trim();
    var st=document.getElementById("paFStatus").value||"";
    var d0=document.getElementById("paFDate0").value||"";
    var d1=document.getElementById("paFDate1").value||"";
    return CTX.list.filter(function(r){
      if(!visible(r)) return false;
      if(no && r.no.indexOf(no)<0) return false;
      if(dept && r.dept!==dept) return false;
      if(mat){ var all=(r.materials||[]).map(function(m){return m.name;}).join("|"); if(all.indexOf(mat)<0) return false; }
      if(st && r.status!==st) return false;
      var d=(r.applyTime||"").slice(0,10);
      if(d0 && d<d0) return false;
      if(d1 && d>d1) return false;
      return true;
    });
  }

  function render(){
    var rows=query();
    var tb=document.getElementById("paTableBody");
    if(!rows.length){ tb.innerHTML='<tr><td colspan="19" class="pa-empty">暂无数据</td></tr>'; return; }
    tb.innerHTML=rows.map(function(r,i){
      var first=(r.materials&&r.materials[0])||{name:'-',spec:'-',cat:'-',qty:0,price:0,unit:'个'};
      var qty=(r.materials||[]).reduce(function(s,m){ return s + (Number(m.qty)||0); },0);
      var unitPrice=Number(first.price)||0;
      var total=(r.materials||[]).reduce(function(s,m){ return s + ((Number(m.qty)||0)*(Number(m.price)||0)); },0);
      var materialText = summaryMaterials(r.materials||[]);
      return '<tr>'+
        '<td>'+esc(r.no)+'</td>'+
        '<td>'+esc(r.projectName||"-")+'</td>'+
        '<td title="'+esc(materialText.title)+'">'+esc(materialText.txt||"-")+'</td>'+
        '<td>'+esc(first.spec||"-")+'</td>'+
        '<td>'+esc(first.cat||"-")+'</td>'+
        '<td>'+qty+'</td>'+
        '<td>'+esc(first.unit||"个")+'</td>'+
        '<td style="text-align:right">'+unitPrice.toFixed(2)+'</td>'+
        '<td style="text-align:right">'+total.toFixed(2)+'</td>'+
        '<td>'+esc(r.needDate||"-")+'</td>'+
        '<td>'+esc(r.dept||"-")+'</td>'+
        '<td>'+esc(r.applicant||"-")+'</td>'+
        '<td>'+esc(r.applyTime||"-")+'</td>'+
        '<td>'+esc(r.urgent||"普通")+'</td>'+
        '<td>'+esc(r.annualPlan||"否")+'</td>'+
        '<td>'+statusTag(r.status)+'</td>'+
        '<td>'+esc(r.node||"-")+'</td>'+
        '<td>'+esc(r.reason||"-")+'</td>'+
        '<td>'+ops(r)+'</td>'+
      '</tr>';
    }).join("");
  }

  function show(id,yes){ var el=document.getElementById(id); if(!el) return; if(yes) el.classList.add('show'); else el.classList.remove('show'); }

  function formHtml(r,readonly){
    var ro=readonly?' readonly disabled':'';
    var sel=readonly?' disabled':'';
    var mats=(r.materials||[]).map(function(m,idx){
      return '<tr data-idx="'+idx+'"><td><input class="carrier-search pa-m-name" value="'+esc(m.name)+'"'+ro+'></td><td><input class="carrier-search pa-m-spec" value="'+esc(m.spec||"")+'"'+ro+'></td><td><select class="carrier-select pa-m-cat"'+sel+'><option'+(m.cat==='生产类'?' selected':'')+'>生产类</option><option'+(m.cat==='销售类'?' selected':'')+'>销售类</option><option'+(m.cat==='办公类'?' selected':'')+'>办公类</option></select><span class="pa-hint" tabindex="0">?<span class="pa-hint-tip">用于制度分类：生产类/销售类/办公类</span></span></td><td><input type="number" min="1" class="carrier-search pa-m-qty" value="'+(m.qty||0)+'"'+ro+'></td><td><select class="carrier-select pa-m-unit"'+sel+'><option'+(m.unit==='个'?' selected':'')+'>个</option><option'+(m.unit==='台'?' selected':'')+'>台</option><option'+(m.unit==='套'?' selected':'')+'>套</option><option'+(m.unit==='件'?' selected':'')+'>件</option><option'+(m.unit==='米'?' selected':'')+'>米</option><option'+(m.unit==='千克'?' selected':'')+'>千克</option></select></td><td><input type="number" min="0" class="carrier-search pa-m-price" value="'+(m.price||0)+'"'+ro+'></td><td><input class="carrier-search pa-m-total" value="'+(m.total||0).toFixed(2)+'" readonly></td><td><input class="carrier-search pa-m-remark" value="'+esc(m.remark||"")+'"'+ro+'></td><td>'+(readonly?'—':'<button type="button" class="carrier-btn-add pa-del-m" style="background:#fff1f0;color:#cf1322;border:1px solid #ffccc7">删除</button>')+'</td></tr>';
    }).join('');
    return '<div class="pa-form-grid pa-form-grid-2">'+
      '<div><label>申请单号</label><input id="paNo" class="carrier-search" value="'+esc(r.no)+'" readonly></div>'+
      '<div><label>项目名称 <span class="pa-req">*</span></label><input id="paProjectName" class="carrier-search" value="'+esc(r.projectName||"")+'"'+(readonly?' readonly':'')+'></div>'+
      '<div><label>申请部门 <span class="pa-req">*</span></label><select id="paDept" class="carrier-select"'+sel+'>'+DEPTS.map(function(d){return '<option'+(r.dept===d?' selected':'')+'>'+d+'</option>';}).join('')+'</select></div>'+
      '<div><label>申请人</label><input id="paApplicant" class="carrier-search" value="'+esc(r.applicant)+'" readonly></div>'+
      '<div><label>申请时间</label><input id="paApplyTime" class="carrier-search" value="'+esc(r.applyTime)+'" readonly></div>'+
      '<div><label>需求日期 <span class="pa-req">*</span></label><input id="paNeedDate" type="date" class="carrier-search" value="'+esc(r.needDate||"")+'"'+ro+'></div>'+
      '<div><label>紧急程度</label><select id="paUrgent" class="carrier-select"'+sel+'><option'+(r.urgent==='普通'?' selected':'')+'>普通</option><option'+(r.urgent==='紧急'?' selected':'')+'>紧急</option><option'+(r.urgent==='特急'?' selected':'')+'>特急</option></select></div>'+
      '<div><label>是否关联年度计划</label><select id="paAnnualPlan" class="carrier-select"'+sel+'><option'+(r.annualPlan==='是'?' selected':'')+'>是</option><option'+(r.annualPlan!=='是'?' selected':'')+'>否</option></select></div>'+
      '<div><label>审批状态</label><input id="paStatus" class="carrier-search" value="'+esc(r.status||"草稿")+'" readonly></div>'+
      '<div><label>当前审批节点</label><input id="paNode" class="carrier-search" value="'+esc(r.node||"—")+'" readonly></div>'+
      '<div class="pa-form-full"><label>申请事由 <span class="pa-req">*</span></label><textarea id="paReason" rows="2" style="width:100%;box-sizing:border-box;border:1px solid #d9d9d9;border-radius:6px;padding:8px"'+(readonly?' readonly':'')+'>'+esc(r.reason||"")+'</textarea></div>'+
    '</div>'+
    '<div class="pa-sec">物资明细列表</div>'+
    (readonly?'':'<div style="margin:6px 0 8px"><button type="button" class="carrier-btn-add" id="paAddMaterial">添加物资</button></div>')+
    '<div class="carrier-table-wrap"><table class="carrier-table" style="min-width:1200px"><thead><tr><th>物资名称</th><th>规格型号</th><th>物资类别</th><th>申请数量</th><th>单位</th><th>预算单价(元)</th><th>预算总价(元)</th><th>备注</th><th>操作</th></tr></thead><tbody id="paMaterialsBody">'+mats+'</tbody></table></div>'+
    '<div class="pa-sec">预算汇总</div><div><label>申请总预算（万元）</label><input id="paBudgetWan" class="carrier-search" value="'+moneyWan(r.budgetYuan)+'" readonly></div>';
  }

  function editRowById(id){ return CTX.list.find(function(x){return x.id===id;}); }

  function openEdit(row, readonly){
    CTX.editing = row;
    document.getElementById('paModalEditTitle').textContent = readonly ? '采购申请详情' : (editRowById(row.id)?'编辑采购申请':'新建采购申请');
    document.getElementById('paModalEditBody').innerHTML = formHtml(row, readonly);
    document.getElementById('paEditFooter').style.display = readonly ? 'none' : 'flex';
    if(!readonly){ bindMaterialEditor(); }
    show('paModalEdit', true);
  }

  function bindMaterialEditor(){
    var body=document.getElementById('paMaterialsBody'); if(!body) return;
    function recalc(){
      var total=0;
      Array.prototype.slice.call(body.querySelectorAll('tr')).forEach(function(tr){
        var q=Number(tr.querySelector('.pa-m-qty').value||0), p=Number(tr.querySelector('.pa-m-price').value||0);
        var t=q*p; total+=t; tr.querySelector('.pa-m-total').value=t.toFixed(2);
      });
      document.getElementById('paBudgetWan').value=moneyWan(total);
    }
    body.addEventListener('input', function(e){ if(e.target.classList.contains('pa-m-qty')||e.target.classList.contains('pa-m-price')) recalc(); });
    body.addEventListener('click', function(e){ var b=e.target.closest('.pa-del-m'); if(!b) return; b.closest('tr').remove(); recalc(); });
    var addBtn=document.getElementById('paAddMaterial');
    if(addBtn){ addBtn.addEventListener('click', function(){
      var tr=document.createElement('tr');
      tr.innerHTML='<td><input class="carrier-search pa-m-name"></td><td><input class="carrier-search pa-m-spec"></td><td><select class="carrier-select pa-m-cat"><option>生产类</option><option>销售类</option><option>办公类</option></select></td><td><input type="number" min="1" class="carrier-search pa-m-qty" value="1"></td><td><select class="carrier-select pa-m-unit"><option>个</option><option>台</option><option>套</option><option>件</option><option>米</option><option>千克</option></select></td><td><input type="number" class="carrier-search pa-m-price" value="0"></td><td><input class="carrier-search pa-m-total" value="0.00" readonly></td><td><input class="carrier-search pa-m-remark"></td><td><button type="button" class="carrier-btn-add pa-del-m" style="background:#fff1f0;color:#cf1322;border:1px solid #ffccc7">删除</button></td>';
      body.appendChild(tr); recalc();
    }); }
    recalc();
  }

  function collectForm(){
    var r=CTX.editing; if(!r) return null;
    r.projectName=(document.getElementById('paProjectName').value||'').trim();
    r.dept=document.getElementById('paDept').value;
    r.needDate=document.getElementById('paNeedDate').value;
    r.urgent=document.getElementById('paUrgent').value;
    r.annualPlan=document.getElementById('paAnnualPlan').value;
    r.reason=document.getElementById('paReason').value.trim();
    var mats=[];
    Array.prototype.slice.call(document.querySelectorAll('#paMaterialsBody tr')).forEach(function(tr){
      var m={
        name:(tr.querySelector('.pa-m-name').value||'').trim(),
        spec:(tr.querySelector('.pa-m-spec').value||'').trim(),
        cat:tr.querySelector('.pa-m-cat').value,
        qty:Number(tr.querySelector('.pa-m-qty').value||0),
        unit:tr.querySelector('.pa-m-unit').value,
        price:Number(tr.querySelector('.pa-m-price').value||0),
        remark:(tr.querySelector('.pa-m-remark').value||'').trim()
      };
      if(m.name) mats.push(m);
    });
    r.materials=mats;
    recalcRow(r);
    return r;
  }

  function renderProgress(r){
    var s=document.getElementById('paSteps');
    s.innerHTML=STEPS.map(function(x,i){
      var cls='pa-step';
      if(r.status==='已驳回' && i===Math.max(0,r.nodeIdx-1)) cls+=' active';
      else if(i<r.nodeIdx) cls+=' done';
      else if(i===r.nodeIdx && r.status==='审批中') cls+=' active';
      return '<span class="'+cls+'">'+esc(x)+'</span>';
    }).join('');
    var rows=[
      {n:'部门专责提报',u:r.applicant,t:r.applyTime,res:'提交',op:'—'},
      {n:'部门主管审核',u:'张主管',t:r.nodeIdx>1?'2026-04-18 11:20':'—',res:r.nodeIdx>1?'通过':'—',op:r.nodeIdx>1?'同意':'—'},
      {n:'主管领导审核',u:'赵领导',t:r.nodeIdx>2?'2026-04-19 09:00':'—',res:r.nodeIdx>2?'通过':'—',op:r.nodeIdx>2?'同意':'—'}
    ];
    document.getElementById('paProgressBody').innerHTML = rows.map(function(x){ return '<tr><td>'+x.n+'</td><td>'+x.u+'</td><td>'+x.t+'</td><td>'+x.res+'</td><td>'+x.op+'</td></tr>'; }).join('');
  }

  function nextNode(idx){ return ["部门主管审核","主管领导审核","公司采购主管审核","公司采购专责备案","已完成"][idx-1] || '审批中'; }

  function bindEvents(){
    document.getElementById('paRole').addEventListener('change', render);
    document.getElementById('paBtnSearch').addEventListener('click', render);
    document.getElementById('paBtnReset').addEventListener('click', function(){
      ['paFNo','paFMaterial','paFDate0','paFDate1'].forEach(function(id){ document.getElementById(id).value='';});
      document.getElementById('paFDept').selectedIndex=0; document.getElementById('paFStatus').selectedIndex=0; render();
    });
    document.getElementById('paBtnNew').addEventListener('click', function(){
      if(role()!=='dept_asset' && role()!=='dept_material'){ alert('仅部门资产专责/物资专责可新建。'); return; }
      var r={ id:'n'+Date.now(), no:genNo(), projectName:'', dept:ROLE[role()].dept, applicant:user(), applyTime:nowTime(), needDate:'', annualPlan:'否', status:'草稿', node:'—', nodeIdx:0, urgent:'普通', materials:[{name:'',spec:'',cat:'生产类',qty:1,unit:'个',price:0,remark:''}], reason:'', budgetYuan:0 };
      openEdit(r, false);
    });

    document.getElementById('paTableBody').addEventListener('click', function(e){
      var b=e.target.closest('.pa-op-btn'); if(!b) return;
      var act=b.getAttribute('data-act'), id=b.getAttribute('data-id');
      var r=editRowById(id); if(!r) return;
      if(act==='detail') return openEdit(JSON.parse(JSON.stringify(r)), true);
      if(act==='edit') return openEdit(JSON.parse(JSON.stringify(r)), false);
      if(act==='submit'){ CTX.pendingId=id; return show('paModalSubmit', true); }
      if(act==='delete'){ CTX.pendingId=id; return show('paModalDelete', true); }
      if(act==='withdraw'){ CTX.pendingId=id; return show('paModalWithdraw', true); }
      if(act==='progress'){ renderProgress(r); return show('paModalProgress', true); }
      if(act==='approve'){
        CTX.pendingId=id;
        document.getElementById('paApprInfo').innerHTML='流程信息：采购申请审批 | 申请单号：'+r.no+' | 申请人：'+r.applicant+' | 申请时间：'+r.applyTime+' | 当前节点：'+r.node;
        document.getElementById('paApprPreview').innerHTML='申请总预算：<strong>'+moneyWan(r.budgetYuan)+'</strong> 万元；申请部门：'+r.dept+'；若预算超过部门年度预算，部门主管审核时需重点关注。';
        document.getElementById('paApprBudget').value=moneyWan(r.budgetYuan);
        document.getElementById('paApprOpinion').value='';
        document.getElementById('paApprWarn').style.display='none';
        CTX.apprPass=true;
        return show('paModalApprove', true);
      }
      if(act==='genPlan'){
        CTX.pendingId=id;
        document.getElementById('paPlanSelect').value='采购计划A-华北备件项目';
        document.getElementById('paNewPlanWrap').style.display='none';
        return show('paModalPlan', true);
      }
    });

    document.getElementById('paBtnSaveDraft').addEventListener('click', function(){
      var r=collectForm(); if(!r) return;
      if(!r.projectName || !r.needDate || !r.reason){ alert('请填写项目名称、需求日期和备注'); return; }
      if(!r.materials.length || !r.materials[0].name){ alert('请至少填写一条物资明细'); return; }
      var old=editRowById(r.id); if(old) Object.assign(old,r); else CTX.list.unshift(r);
      if(old) { old.status='草稿'; old.node='—'; old.nodeIdx=0; } else { r.status='草稿'; }
      show('paModalEdit', false); render();
    });
    document.getElementById('paBtnSubmit').addEventListener('click', function(){ var r=collectForm(); if(!r) return; if(!r.projectName||!r.needDate||!r.reason||!r.materials.length){ alert('请完善项目名称、必填项及物资明细'); return;} show('paModalSubmit', true); });

    document.getElementById('paSubmitOk').addEventListener('click', function(){
      var r=CTX.editing; if(!r) return; var old=editRowById(r.id); if(old) Object.assign(old,r); else CTX.list.unshift(r);
      r=(old||r); r.status='审批中'; r.node='部门主管审核'; r.nodeIdx=1; r.applyTime=r.applyTime||nowTime();
      show('paModalSubmit', false); show('paModalEdit', false); render();
    });

    document.getElementById('paWithdrawOk').addEventListener('click', function(){ var r=editRowById(CTX.pendingId); if(r){ r.status='草稿'; r.node='—'; r.nodeIdx=0; } show('paModalWithdraw',false); render(); });
    document.getElementById('paDeleteOk').addEventListener('click', function(){ CTX.list=CTX.list.filter(function(x){ return x.id!==CTX.pendingId;}); show('paModalDelete',false); render(); });

    document.getElementById('paApprPass').addEventListener('click', function(){ CTX.apprPass=true; document.getElementById('paApprOpinion').value='同意';});
    document.getElementById('paApprReject').addEventListener('click', function(){ CTX.apprPass=false; document.getElementById('paApprOpinion').value='驳回：';});
    document.getElementById('paApprOk').addEventListener('click', function(){
      var r=editRowById(CTX.pendingId); if(!r) return;
      var op=(document.getElementById('paApprOpinion').value||'').trim();
      var b=Number(document.getElementById('paApprBudget').value||0);
      if(!op){ alert('请填写审批意见'); return; }
      if(b > Number(moneyWan(r.budgetYuan))){ document.getElementById('paApprWarn').style.display='block'; return; }
      r.approvedBudgetWan=b;
      if(CTX.apprPass){
        r.nodeIdx += 1;
        if(r.nodeIdx>=5){ r.status='已通过'; r.node='已完成'; }
        else { r.status='审批中'; r.node=nextNode(r.nodeIdx); }
      } else {
        r.status='已驳回'; r.node='已驳回';
      }
      show('paModalApprove', false); render();
    });

    document.getElementById('paPlanSelect').addEventListener('change', function(){ document.getElementById('paNewPlanWrap').style.display=this.value==='new'?'grid':'none'; });
    document.getElementById('paPlanOk').addEventListener('click', function(){ var r=editRowById(CTX.pendingId); if(!r) return; alert('已生成采购计划并带入物资明细（演示）'); show('paModalPlan', false); });

    document.addEventListener('click', function(e){
      var t=e.target;
      if(t.getAttribute && t.getAttribute('data-close')!==null){ var m=t.closest('.pa-modal-mask'); if(m) m.classList.remove('show'); }
      if(t.classList && t.classList.contains('pa-modal-mask')) t.classList.remove('show');
    });
  }

  function init(){
    initData();
    var d=document.getElementById('paFDept');
    d.innerHTML='<option value="">全部部门</option>'+DEPTS.map(function(x){return '<option>'+x+'</option>';}).join('');
    bindEvents();
    render();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
