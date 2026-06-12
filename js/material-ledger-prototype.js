(function(){
  var TAB_DEF={
    cargo:{name:'货物台账',status:['未入库','部分入库','完全入库']},
    asset:{name:'自用资产',status:['在用','维修中','闲置','已报废']},
    sales:{name:'销售物资',status:['在库','已销售','已发货']},
    idle:{name:'闲置物资',status:['待调剂','待销售','待报废']},
    scrap:{name:'废旧物资',status:['待处置','已处置']}
  };
  var DEPTS=['经营发展中心','运维一部','运维二部','工程管理部','数字化中心','综合管理部'];
  var CTX={tab:'cargo',cur:null,list:{cargo:[],asset:[],sales:[],idle:[],scrap:[]}};

  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  var CAT_DESC={
    '生产类':'【生产类】用于生产运营的物资，包括设备备件、维修材料、消耗性工具、安全防护用品等。此类物资采购后主要用于风电场日常运维、设备检修等生产活动。',
    '办公类':'【办公类】用于日常办公的物资，包括办公设备（电脑、打印机）、办公用品、办公家具等。此类物资采购后由行政部门统一管理，供员工日常办公使用。',
    '销售类':'【销售类】用于对外销售的物资，即存货。此类物资采购后入库存储，后续通过销售方式转出公司。销售类物资后续可申请转为固定资产。'
  };
  function role(){var el=document.getElementById('mlRole'); return el ? el.value : 'corp_material_specialist';}
  function isFinanceRole(){var r=role();return r==='finance'||r==='value_role';}
  function canEdit(){return role()==='corp_material_specialist';}

  function initData(){
    CTX.list.cargo=[
      {id:'c1',code:'WZ-GC-20250110-0001',contract:'CG-HT-2026-001',purchaseDept:'经营发展中心',name:'齿轮箱',spec:'GW-GX-3.2MW',cls:'生产类',qty:12,unit:'台',priceIn:280000,tax:0.13,date:'2026-01-12',inStatus:'部分入库',inQty:8,remark:'合同管理同步',supplier:'远景能源'},
      {id:'c2',code:'WZ-GC-20250110-0002',contract:'CG-HT-2026-010',purchaseDept:'运维一部',name:'办公电脑',spec:'ThinkPad P16',cls:'办公类',qty:30,unit:'台',priceIn:9800,tax:0.13,date:'2026-02-02',inStatus:'完全入库',inQty:30,remark:'',supplier:'联想'},
      {id:'c3',code:'WZ-GC-20250110-0003',contract:'CG-HT-2026-019',purchaseDept:'运维二部',name:'连接器套件',spec:'CN-88',cls:'销售类',qty:400,unit:'件',priceIn:220,tax:0.13,date:'2026-02-19',inStatus:'未入库',inQty:0,remark:'待到货',supplier:'华科工程'}
    ];
    CTX.list.asset=[
      {id:'a1',code:'WZ-ZC-20250201-0001',name:'巡检终端',spec:'DJI-RC',cls:'工具类',dept:'运维一部',keeper:'王芳',loc:'库房A-03',origin:32000,net:21000,years:'5年',status:'在用',date:'2026-02-10',remark:''},
      {id:'a2',code:'WZ-ZC-20250201-0002',name:'会议投影仪',spec:'EPSON-620',cls:'办公类',dept:'综合管理部',keeper:'刘静',loc:'会议室2F',origin:12000,net:4000,years:'5年',status:'维修中',date:'2025-12-01',remark:'灯泡故障'}
    ];
    CTX.list.sales=[
      {id:'s1',code:'WZ-XSWZ-20250305-0001',name:'电缆',spec:'YJV-10kV',cls:'销售类',stock:1800,unit:'米',cost:620,sale:780,supplier:'远景能源',status:'在库',date:'2026-03-05',remark:''},
      {id:'s2',code:'WZ-XSWZ-20250305-0002',name:'连接器',spec:'CN-88',cls:'销售类',stock:400,unit:'件',cost:210,sale:288,supplier:'华科工程',status:'已发货',date:'2026-03-06',remark:'订单OD-338'}
    ];
    CTX.list.idle=[
      {id:'i1',code:'WZ-XZ-20250401-0001',name:'旧工装夹具',spec:'JG-21',originCls:'自用资产',originDept:'运维二部',reason:'工艺替换',time:'2026-04-01',suggest:'调剂',status:'待调剂'},
      {id:'i2',code:'WZ-XZ-20250401-0002',name:'备用显示器',spec:'27寸',originCls:'销售物资',originDept:'经营发展中心',reason:'库存周转低',time:'2026-04-03',suggest:'销售',status:'待销售'}
    ];
    CTX.list.scrap=[
      {id:'f1',code:'WZ-FW-20250312-0001',name:'报废电机',spec:'MTR-2.0',originCls:'自用资产',reason:'绝缘失效',time:'2026-03-12',salvage:1200,status:'待处置',method:'回收'},
      {id:'f2',code:'WZ-FW-20250312-0002',name:'损坏终端',spec:'DJI-RC',originCls:'闲置物资',reason:'跌落损坏',time:'2026-03-22',salvage:300,status:'已处置',method:'销毁'}
    ];
  }

  function calcCargo(r){
    r.priceEx=Number((Number(r.priceIn||0)/(1+Number(r.tax||0.13))).toFixed(2));
    r.totalIn=Number((Number(r.qty||0)*Number(r.priceIn||0)).toFixed(2));
    r.totalEx=Number((Number(r.qty||0)*Number(r.priceEx||0)).toFixed(2));
    r.remain=Math.max(0,Number(r.qty||0)-Number(r.inQty||0));
  }

  function setup(){
    CTX.list.cargo.forEach(calcCargo);
    bindTabs();
    bindCards();
    bindFilters();
    bindModalClose();
    bindTableOps();
    bindDetailTabs();
    bindEditSync();
    refreshCards();
    render();
  }

  function refreshCards(){
    var all=0,stock=0,usingN=0,dispose=0;
    Object.keys(CTX.list).forEach(function(k){
      var arr=CTX.list[k]||[]; all+=arr.length;
      arr.forEach(function(r){
        if((r.status||r.inStatus)==='在库' || (r.inStatus==='部分入库'||r.inStatus==='完全入库')) stock++;
        if((r.status||'')==='在用') usingN++;
        if((r.status||'').indexOf('待')===0 || k==='idle' || (k==='scrap'&&r.status==='待处置')) dispose++;
      });
    });
    if(document.getElementById('mlCardAll')) document.getElementById('mlCardAll').textContent=all;
    if(document.getElementById('mlCardStock')) document.getElementById('mlCardStock').textContent=stock;
    if(document.getElementById('mlCardUsing')) document.getElementById('mlCardUsing').textContent=usingN;
    if(document.getElementById('mlCardDispose')) document.getElementById('mlCardDispose').textContent=dispose;
  }

  function bindCards(){
    document.querySelectorAll('.ml-card').forEach(function(c){
      c.addEventListener('click',function(){
        var t=this.getAttribute('data-card');
        if(t==='stock') switchTab('cargo');
        else if(t==='using') switchTab('asset');
        else if(t==='dispose') switchTab('idle');
        else switchTab('cargo');
      });
    });
  }

  function switchTab(tab){
    CTX.tab=tab;
    document.querySelectorAll('.ml-tab').forEach(function(b){ b.classList.toggle('is-active', b.getAttribute('data-tab')===tab);});
    var stSel=document.getElementById('mlFStatus');
    stSel.innerHTML='<option value="">全部</option>'+TAB_DEF[tab].status.map(function(s){return '<option>'+s+'</option>';}).join('');
    render();
  }

  function bindTabs(){ document.querySelectorAll('.ml-tab').forEach(function(b){ b.addEventListener('click',function(){switchTab(this.getAttribute('data-tab'));});}); }

  function bindFilters(){
    switchTab('cargo');
    document.getElementById('mlBtnSearch').addEventListener('click', render);
    document.getElementById('mlBtnReset').addEventListener('click', function(){
      ['mlFName','mlFCode','mlFKeeper','mlFDate0','mlFDate1'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value='';});
      ['mlFClass','mlFStatus','mlFDept'].forEach(function(id){ var el=document.getElementById(id); if(el) el.selectedIndex=0;});
      render();
    });
    document.getElementById('mlBtnExport').addEventListener('click', function(){
      var d=new Date(),f='物资台账_'+TAB_DEF[CTX.tab].name+'_'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'.xlsx';
      alert('已导出：'+f);
    });
    var b1=document.getElementById('mlBtnBatchExport');
    if(b1) b1.addEventListener('click',function(){ alert('批量导出（演示）'); });
    var b2=document.getElementById('mlBtnBatchKeeper');
    if(b2) b2.addEventListener('click',function(){ alert('批量修改保管人（演示）'); });
    var b3=document.getElementById('mlBtnBatchLoc');
    if(b3) b3.addEventListener('click',function(){ alert('批量修改存放地点（演示）'); });
    var addBtn=document.getElementById('mlBtnAdd');
    if(addBtn) addBtn.addEventListener('click', function(){ alert('新增产品（演示）'); });
  }

  function listFiltered(){
    var arr=(CTX.list[CTX.tab]||[]).slice();
    var fn=(document.getElementById('mlFName').value||'').trim();
    var fc=((document.getElementById('mlFCode')&&document.getElementById('mlFCode').value)||'').trim();
    var fcl=document.getElementById('mlFClass').value||'';
    var fs=document.getElementById('mlFStatus').value||'';
    var fd=((document.getElementById('mlFDept')&&document.getElementById('mlFDept').value)||'');
    var fk=((document.getElementById('mlFKeeper')&&document.getElementById('mlFKeeper').value)||'').trim();
    var d0=((document.getElementById('mlFDate0')&&document.getElementById('mlFDate0').value)||''), d1=((document.getElementById('mlFDate1')&&document.getElementById('mlFDate1').value)||'');
    return arr.filter(function(r){
      var code=r.code||'', name=r.name||'', cls=r.cls||'', st=(r.status||r.inStatus||''), dept=r.dept||r.purchaseDept||r.originDept||'', kp=r.keeper||'', dt=r.date||r.time||'';
      if(fn&&name.indexOf(fn)<0) return false;
      if(fc&&code.indexOf(fc)<0) return false;
      if(fcl&&cls!==fcl) return false;
      if(fs&&st!==fs) return false;
      if(fd&&dept!==fd) return false;
      if(fk&&kp.indexOf(fk)<0) return false;
      if(d0&&dt<d0) return false;
      if(d1&&dt>d1) return false;
      if(role()==='dept_material_specialist' && dept!=='经营发展中心') return false;
      return true;
    });
  }

  function thCargo(){
    return '<tr><th>产品编码</th><th>产品名称</th><th>产品分类</th><th>规格型号</th><th>生产数量</th><th>已发</th><th>用于售</th><th>剩余库存</th><th>单价(元)</th><th>状态</th><th>操作</th></tr>';
  }
  function catTagHtml(cls){
    var map={ '生产类':'sc', '办公类':'office', '销售类':'sales' };
    var skin=map[cls]||'sc';
    var tip=esc(CAT_DESC[cls]||'');
    return '<span class=\"ml-cat-wrap\"><span class=\"ml-cat '+skin+'\">'+esc(cls)+'</span><span class=\"ml-hint\" tabindex=\"0\">?<span class=\"ml-tip\">'+tip+'</span></span></span>';
  }
  function thAsset(){ return '<tr><th>序号</th><th>资产编码</th><th>资产名称</th><th>规格型号</th><th>资产类别</th><th>保管部门</th><th>保管人</th><th>存放地点</th><th>原值(元)</th><th>净值(元)</th><th>使用年限</th><th>资产状态</th><th>采购时间</th><th>操作</th></tr>'; }
  function thSales(){ return '<tr><th>序号</th><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>物资类别</th><th>库存数量</th><th>单位</th><th>成本单价(元)</th><th>销售单价(元)</th><th>供应商名称</th><th>库存状态</th><th>入库时间</th><th>操作</th></tr>'; }
  function thIdle(){ return '<tr><th>序号</th><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>原物资分类</th><th>原保管部门</th><th>闲置原因</th><th>闲置时间</th><th>处置建议</th><th>闲置状态</th><th>操作</th></tr>'; }
  function thScrap(){ return '<tr><th>序号</th><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>原物资分类</th><th>报废原因</th><th>报废时间</th><th>残值(元)</th><th>处置状态</th><th>处置方式</th><th>操作</th></tr>'; }

  function render(){
    var th=document.getElementById('mlThead');
    th.innerHTML = CTX.tab==='cargo'?thCargo():CTX.tab==='asset'?thAsset():CTX.tab==='sales'?thSales():CTX.tab==='idle'?thIdle():thScrap();
    var rows=listFiltered();
    var tb=document.getElementById('mlTbody');
    if(!rows.length){tb.innerHTML='<tr><td colspan="20" class="ml-empty">暂无数据</td></tr>';return;}
    tb.innerHTML=rows.map(function(r,i){
      if(CTX.tab==='cargo') {
        var shipped = Number(r.inQty||0);
        var forSale = Math.floor(shipped * 0.25);
        var remain = Math.max(0, Number(r.qty||0) - shipped);
        return '<tr><td>'+esc(r.code)+'</td><td>'+esc(r.name)+'</td><td>'+catTagHtml(r.cls)+'</td><td>'+esc(r.spec)+'</td><td>'+r.qty+'</td><td>'+shipped+'</td><td>'+forSale+'</td><td>'+remain+'</td><td>'+r.priceIn.toFixed(2)+'</td><td>在库</td><td>'+opsCargo(r)+'</td></tr>';
      }
      if(CTX.tab==='asset') return '<tr><td>'+(i+1)+'</td><td>'+esc(r.code)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.spec)+'</td><td>'+esc(r.cls)+'</td><td>'+esc(r.dept)+'</td><td>'+esc(r.keeper)+'</td><td>'+esc(r.loc)+'</td><td>'+r.origin.toFixed(2)+'</td><td>'+r.net.toFixed(2)+'</td><td>'+esc(r.years)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.date)+'</td><td>'+opsAsset(r)+'</td></tr>';
      if(CTX.tab==='sales') return '<tr><td>'+(i+1)+'</td><td>'+esc(r.code)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.spec)+'</td><td>'+esc(r.cls)+'</td><td>'+r.stock+'</td><td>'+esc(r.unit)+'</td><td>'+r.cost.toFixed(2)+'</td><td>'+r.sale.toFixed(2)+'</td><td>'+esc(r.supplier)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.date)+'</td><td>'+opsSales(r)+'</td></tr>';
      if(CTX.tab==='idle') return '<tr><td>'+(i+1)+'</td><td>'+esc(r.code)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.spec)+'</td><td>'+esc(r.originCls)+'</td><td>'+esc(r.originDept)+'</td><td>'+esc(r.reason)+'</td><td>'+esc(r.time)+'</td><td>'+esc(r.suggest)+'</td><td>'+esc(r.status)+'</td><td>'+opsIdle(r)+'</td></tr>';
      return '<tr><td>'+(i+1)+'</td><td>'+esc(r.code)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.spec)+'</td><td>'+esc(r.originCls)+'</td><td>'+esc(r.reason)+'</td><td>'+esc(r.time)+'</td><td>'+Number(r.salvage||0).toFixed(2)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.method)+'</td><td>'+opsScrap(r)+'</td></tr>';
    }).join('');
  }

  function btn(lbl,act,id,style){return '<button type="button" class="carrier-btn-add ml-op" data-act="'+act+'" data-id="'+id+'"'+(style?' style="'+style+'"':'')+'>'+lbl+'</button>';}
  function opsCargo(r){ return '<span class="ml-ops">'+btn('查看','detail',r.id)+'</span>'; }
  function opsAsset(r){ var s='<span class="ml-ops">'+btn('查看','detail',r.id); if(canEdit()) s+=btn('编辑','edit',r.id)+btn('发起维修','repair',r.id)+btn('发起报废','scrapApply',r.id)+btn('发起调拨','transfer',r.id); return s+'</span>'; }
  function opsSales(r){ var s='<span class="ml-ops">'+btn('查看','detail',r.id); if(canEdit()) s+=btn('编辑','edit',r.id); return s+'</span>'; }
  function opsIdle(r){ return '<span class="ml-ops">'+btn('查看','detail',r.id)+btn('发起调拨','toTransfer',r.id)+btn('发起报废','toScrap',r.id)+'</span>'; }
  function opsScrap(r){ return '<span class="ml-ops">'+btn('查看','detail',r.id)+'</span>'; }

  function findById(id){
    var arr=CTX.list[CTX.tab]||[];
    var f=arr.find(function(x){return x.id===id;});
    if(f) return f;
    for(var k in CTX.list){var t=CTX.list[k].find(function(x){return x.id===id;}); if(t) return t;}
    return null;
  }

  function bindTableOps(){
    document.getElementById('mlTbody').addEventListener('click',function(e){
      var b=e.target.closest('.ml-op'); if(!b) return;
      var act=b.getAttribute('data-act'), id=b.getAttribute('data-id'), r=findById(id); if(!r) return;
      CTX.cur=r;
      if(act==='detail') return openDetail(r);
      if(act==='edit') return openEdit(r);
      if(act==='sync') return openSync(r);
      if(act==='shipReg') return alert('发货登记（演示）');
      if(act==='maintenanceReg') return alert('维修领用登记（演示）');
      if(act==='repair') return alert('已跳转维修管理模块（演示）');
      if(act==='scrapApply') return alert('已跳转报废申请流程（演示）');
      if(act==='transfer') return alert('已跳转调剂管理模块（演示）');
      if(act==='markSale'){ r.status='已销售'; render(); return; }
      if(act==='toTransfer') return alert('已发起调剂流程（演示）');
      if(act==='toSale') return alert('已转入销售物资分类（演示）');
      if(act==='toScrap') return alert('已发起报废流程（演示）');
      if(act==='dispose') return alert('处置结果已记录（演示）');
    });
  }

  function openDetail(r){
    document.getElementById('mlFinanceTab').style.display = isFinanceRole() ? 'inline-block' : 'none';
    document.getElementById('mlPaneBase').innerHTML = '<div class="ml-form-grid ml-form-grid-2"><div><label>物资编码</label><input class="carrier-search" readonly value="'+esc(r.code||'')+'"></div><div><label>物资名称</label><input class="carrier-search" readonly value="'+esc(r.name||'')+'"></div><div><label>规格型号</label><input class="carrier-search" readonly value="'+esc(r.spec||'')+'"></div><div><label>物资类别</label><input class="carrier-search" readonly value="'+esc(r.cls||r.originCls||'')+'"></div><div><label>当前分类</label><input class="carrier-search" readonly value="'+esc(TAB_DEF[CTX.tab].name)+'"></div><div><label>当前状态</label><input class="carrier-search" readonly value="'+esc(r.status||r.inStatus||'')+'"></div><div><label>保管部门</label><input class="carrier-search" readonly value="'+esc(r.dept||r.purchaseDept||r.originDept||'')+'"></div><div><label>保管人</label><input class="carrier-search" readonly value="'+esc(r.keeper||'')+'"></div><div><label>存放地点</label><input class="carrier-search" readonly value="'+esc(r.loc||'')+'"></div><div class="ml-form-full"><label>备注</label><textarea rows="2" readonly style="width:100%;box-sizing:border-box;border:1px solid #d9d9d9;border-radius:6px;padding:8px">'+esc(r.remark||'')+'</textarea></div></div>';
    document.getElementById('mlPaneBuy').innerHTML = '<div class="ml-form-grid ml-form-grid-2"><div><label>合同编号</label><input class="carrier-search" readonly value="'+esc(r.contract||'—')+'"></div><div><label>供应商名称</label><input class="carrier-search" readonly value="'+esc(r.supplier||'—')+'"></div><div><label>采购部门</label><input class="carrier-search" readonly value="'+esc(r.purchaseDept||r.dept||'—')+'"></div><div><label>采购数量</label><input class="carrier-search" readonly value="'+esc(r.qty||r.stock||'—')+'"></div><div><label>采购单价(含税)</label><input class="carrier-search" readonly value="'+esc(r.priceIn||r.cost||'—')+'"></div><div><label>采购平均单价(不含税)</label><input class="carrier-search" readonly value="'+esc(r.priceEx||'—')+'"></div><div><label>采购总价(含税)</label><input class="carrier-search" readonly value="'+esc(r.totalIn||'—')+'"></div><div><label>采购总价(不含税)</label><input class="carrier-search" readonly value="'+esc(r.totalEx||'—')+'"></div><div><label>采购时间</label><input class="carrier-search" readonly value="'+esc(r.date||r.time||'—')+'"></div></div>';
    document.getElementById('mlPaneLife').innerHTML = '<div class="ml-timeline"><div class="it"><b>'+(r.date||r.time||'2026-01-01')+'</b> · 采购入库 · 经办部门：'+esc(r.purchaseDept||r.dept||'经营发展中心')+' · 经办人：'+esc(r.keeper||'李哲')+' · 关联单号：'+esc(r.contract||r.code)+'</div><div class="it"><b>2026-03-02</b> · 调拨/维修记录（示例） · 经办部门：运维一部 · 经办人：王芳 · 关联单号：YW-20260302-01</div><div class="it"><b>2026-04-01</b> · 状态更新：'+esc(r.status||r.inStatus||'在库')+' · 经办部门：资产管理</div></div>';
    document.getElementById('mlPaneFinance').innerHTML = '<div class="ml-form-grid ml-form-grid-2"><div><label>原值</label><input class="carrier-search" readonly value="'+esc(r.origin||r.totalIn||'—')+'"></div><div><label>累计折旧</label><input class="carrier-search" readonly value="'+esc(r.origin&&r.net? (r.origin-r.net).toFixed(2):'—')+'"></div><div><label>净值</label><input class="carrier-search" readonly value="'+esc(r.net||'—')+'"></div><div><label>残值</label><input class="carrier-search" readonly value="'+esc(r.salvage||'—')+'"></div><div class="ml-form-full"><label>入账凭证号</label><input class="carrier-search" readonly value="PZ-2026-'+esc((r.code||'').slice(-4))+'"></div></div>';
    document.querySelectorAll('.ml-subtab').forEach(function(x){x.classList.remove('is-active');});
    document.querySelector('[data-pane="base"]').classList.add('is-active');
    ['Base','Buy','Life','Finance'].forEach(function(s){document.getElementById('mlPane'+s).classList.remove('show');}); document.getElementById('mlPaneBase').classList.add('show');
    show('mlModalDetail',true);
  }

  function bindDetailTabs(){
    document.querySelectorAll('.ml-subtab').forEach(function(b){ b.addEventListener('click', function(){
      var p=this.getAttribute('data-pane');
      document.querySelectorAll('.ml-subtab').forEach(function(x){x.classList.remove('is-active');}); this.classList.add('is-active');
      ['Base','Buy','Life','Finance'].forEach(function(s){document.getElementById('mlPane'+s).classList.remove('show');});
      var map={base:'Base',buy:'Buy',life:'Life',finance:'Finance'}; document.getElementById('mlPane'+map[p]).classList.add('show');
    });});
    document.getElementById('mlDetailEdit').addEventListener('click', function(){ if(!CTX.cur) return; if(!canEdit()) return alert('当前角色无编辑权限'); show('mlModalDetail',false); openEdit(CTX.cur);});
    document.getElementById('mlDetailPrint').addEventListener('click', function(){ alert('打印台账（演示）');});
    document.getElementById('mlDetailExport').addEventListener('click', function(){ alert('导出台账（演示）');});
  }

  function openEdit(r){
    document.getElementById('mleName').value=r.name||'';
    document.getElementById('mleSpec').value=r.spec||'';
    document.getElementById('mleClass').value=r.cls||'生产类';
    document.getElementById('mleDept').value=r.dept||r.purchaseDept||r.originDept||'';
    document.getElementById('mleKeeper').value=r.keeper||'';
    document.getElementById('mleLoc').value=r.loc||'';
    document.getElementById('mleStatus').value=r.status||r.inStatus||'';
    document.getElementById('mleRemark').value=r.remark||'';
    show('mlModalEdit',true);
  }

  function openSync(r){
    document.querySelector('input[name="syncTarget"][value="asset"]').checked=true;
    document.getElementById('mlSyncAsset').style.display='grid';
    document.getElementById('mlSyncSales').style.display='none';
    document.getElementById('mlSyncQty').value=r.remain||r.qty||0;
    show('mlModalSync',true);
  }

  function bindEditSync(){
    document.getElementById('mlEditSave').addEventListener('click', function(){
      if(!CTX.cur) return;
      var logs=[];
      function upd(k,v){ if(String(CTX.cur[k]||'')!==String(v||'')){ logs.push(k+': '+(CTX.cur[k]||'')+' → '+v); CTX.cur[k]=v; } }
      upd('name',document.getElementById('mleName').value);
      upd('spec',document.getElementById('mleSpec').value);
      upd('cls',document.getElementById('mleClass').value);
      upd('dept',document.getElementById('mleDept').value);
      upd('keeper',document.getElementById('mleKeeper').value);
      upd('loc',document.getElementById('mleLoc').value);
      upd('status',document.getElementById('mleStatus').value);
      upd('remark',document.getElementById('mleRemark').value);
      show('mlModalEdit',false); render();
      alert('保存成功。修改日志：'+(logs.length?logs.join('；'):'无字段变化')+'。');
    });

    document.querySelectorAll('input[name="syncTarget"]').forEach(function(r){r.addEventListener('change',function(){
      var v=this.value; document.getElementById('mlSyncAsset').style.display=v==='asset'?'grid':'none'; document.getElementById('mlSyncSales').style.display=v==='sales'?'grid':'none';
    });});

    document.getElementById('mlSyncOk').addEventListener('click', function(){
      if(!CTX.cur) return;
      var qty=Number(document.getElementById('mlSyncQty').value||0); if(qty<=0){ alert('同步数量需大于0'); return; }
      if(CTX.cur.remain!=null && qty>CTX.cur.remain){ alert('同步数量不能超过剩余数量'); return; }
      var target=document.querySelector('input[name="syncTarget"]:checked').value;
      if(target==='asset'){
        CTX.list.asset.push({id:'a'+Date.now(),code:CTX.cur.code.replace('-GC-','-ZC-'),name:CTX.cur.name,spec:CTX.cur.spec,cls:CTX.cur.cls==='销售类'?'生产类':CTX.cur.cls,dept:document.getElementById('mlSyncDept').value||'经营发展中心',keeper:document.getElementById('mlSyncKeeper').value||'李哲',loc:document.getElementById('mlSyncLoc').value||'仓库A',origin:qty*Number(CTX.cur.priceIn||0),net:qty*Number(CTX.cur.priceIn||0),years:(document.getElementById('mlSyncYears').value||'5')+'年',status:'在用',date:new Date().toISOString().slice(0,10),remark:document.getElementById('mlSyncRemark').value||''});
      }else{
        CTX.list.sales.push({id:'s'+Date.now(),code:CTX.cur.code.replace('-GC-','-XSWZ-'),name:CTX.cur.name,spec:CTX.cur.spec,cls:'销售类',stock:qty,unit:CTX.cur.unit,cost:Number(CTX.cur.priceIn||0),sale:Number(document.getElementById('mlSyncSalePrice').value||CTX.cur.priceIn||0),supplier:CTX.cur.supplier||'供应商',status:'在库',date:new Date().toISOString().slice(0,10),remark:document.getElementById('mlSyncRemark').value||''});
      }
      if(CTX.cur.inQty!=null){ CTX.cur.inQty += qty; calcCargo(CTX.cur); CTX.cur.inStatus = CTX.cur.inQty<=0?'未入库':(CTX.cur.inQty<CTX.cur.qty?'部分入库':'完全入库'); }
      show('mlModalSync',false); refreshCards(); render();
      alert('同步成功，已更新货物台账并新增目标分类记录。');
    });
  }

  function bindModalClose(){
    document.addEventListener('click', function(e){
      var t=e.target;
      if(t.getAttribute&&t.getAttribute('data-close')!==null){ var m=t.closest('.ml-modal-mask'); if(m) m.classList.remove('show'); }
      if(t.classList&&t.classList.contains('ml-modal-mask')) t.classList.remove('show');
    });
  }

  function show(id,yes){ var el=document.getElementById(id); if(!el) return; if(yes) el.classList.add('show'); else el.classList.remove('show'); }

  initData();
  setup();
})();
