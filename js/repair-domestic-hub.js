/**
 * 维修管理 + 国产化替代 双模块页（repair-domestic-hub.html）
 */
(function () {
  var INV_PAGE = 1;
  var INV_SORT = { key: "code", dir: 1 };
  var SMALL_PAGE = 1;
  var PROD_PAGE = 1;

  var INV_DATA = [
    { code: "Z000003", name: "绝缘膜", spec: "ACS800-导热棉", cat: "组件", qty: 14, unit: "个", loc: "1号货架", th: 10, st: "ok" },
    { code: "JYM0002", name: "电容器", spec: "LYJS-JY-1-L-13空", cat: "电容", qty: 5, unit: "个", loc: "2号货架", th: 10, st: "low" },
    { code: "FS000029", name: "散热风扇", spec: "JF0825H1U-R", cat: "风扇", qty: 0, unit: "个", loc: "3号货架", th: 5, st: "out" },
    { code: "Z000004", name: "电缆", spec: "加热器组件", cat: "组件", qty: 23, unit: "根", loc: "4号货架", th: 10, st: "ok" },
    { code: "JYM00059", name: "绝缘膜", spec: "外壳背板", cat: "组件", qty: 8, unit: "个", loc: "1号货架", th: 10, st: "low" },
    { code: "R001", name: "精密电阻", spec: "1% 10K", cat: "电阻", qty: 120, unit: "个", loc: "A区", th: 50, st: "ok" },
    { code: "C002", name: "薄膜电容", spec: "0.1uF", cat: "电容", qty: 3, unit: "个", loc: "B区", th: 20, st: "low" },
    { code: "M003", name: "IGBT模块", spec: "1200V", cat: "组件", qty: 6, unit: "个", loc: "C区", th: 4, st: "ok" },
    { code: "W004", name: "接线端子", spec: "TB-6", cat: "其他", qty: 45, unit: "个", loc: "D区", th: 30, st: "ok" },
    { code: "W005", name: "导热硅脂", spec: "TG-1", cat: "其他", qty: 2, unit: "支", loc: "E区", th: 5, st: "low" },
    { code: "W006", name: "屏蔽线缆", spec: "3×2.5", cat: "其他", qty: 0, unit: "米", loc: "F区", th: 10, st: "out" },
    { code: "W007", name: "保险丝", spec: "10A", cat: "其他", qty: 88, unit: "个", loc: "G区", th: 40, st: "ok" }
  ];

  var SMALL_DATA = [
    { name: "贴片电容", spec: "104 50V", cat: "电子元件", mode: "按包", qty: 5, unit: "包", loc: "小料盒A1", th: 2, st: "ok" },
    { name: "润滑油", spec: "壳牌10W-40", cat: "润滑剂", mode: "按桶", qty: 2, unit: "桶", loc: "货架5", th: 1, st: "ok" },
    { name: "精密清洁剂", spec: "CRC 精密电子清洁剂", cat: "清洁剂", mode: "按瓶", qty: 8, unit: "瓶", loc: "货架5", th: 3, st: "ok" },
    { name: "酒精", spec: "99%", cat: "清洁剂", mode: "按瓶", qty: 1, unit: "瓶", loc: "货架5", th: 2, st: "low" }
  ];

  var TOOL_DATA = [
    { code: "T001", name: "电动螺丝刀", spec: "Bosch Go 2", type: "电动工具", keeper: "张三", dept: "电控所", loc: "个人工具柜", st: "在用", borrower: "-", ret: "-", idx: 0 },
    { code: "T002", name: "万用表", spec: "Fluke 17B+", type: "测量仪器", keeper: "电控所公用", dept: "电控所", loc: "仓库货架2", st: "借出", borrower: "李四", ret: "2026-04-25", idx: 1 },
    { code: "T003", name: "绝缘电阻测试仪", spec: "500V", type: "测量仪器", keeper: "电控所公用", dept: "电控所", loc: "仓库货架2", st: "在库", borrower: "-", ret: "-", idx: 2 }
  ];

  var PROD_DATA = [
    { code: "GD-001", name: "国产化变流器模块", cat: "变流器模块", spec: "V2.0", prod: 100, ship: 60, rep: 15, stock: 25, price: "35,000", st: "在库", idx: 0 },
    { code: "GD-002", name: "IGBT驱动板", cat: "电路板", spec: "V3.1", prod: 500, ship: 200, rep: 80, stock: 220, price: "280", st: "在库", idx: 1 },
    { code: "GD-003", name: "主控板", cat: "电路板", spec: "V1.2", prod: 300, ship: 150, rep: 50, stock: 100, price: "450", st: "在库", idx: 2 },
    { code: "GD-004", name: "CMS数据采集器", cat: "CMS产品", spec: "V3.0", prod: 50, ship: 30, rep: 0, stock: 20, price: "2,800", st: "在库", idx: 3 },
    { code: "GD-005", name: "变压器模块A", cat: "变压器模块", spec: "T1", prod: 80, ship: 40, rep: 10, stock: 30, price: "1,200", st: "在库", idx: 4 }
  ];

  var SHIP_REC = [
    { no: "FH-20260401-001", code: "GD-001", name: "国产化变流器模块", qty: 10, date: "2026-04-01", recv: "河北龙源", site: "麒麟山风电场", contract: "HT-2026-001", person: "宋中波", appr: "pass" },
    { no: "FH-20260415-002", code: "GD-002", name: "IGBT驱动板", qty: 50, date: "2026-04-15", recv: "天津龙源", site: "沙井子风电场", contract: "HT-2026-008", person: "宋中波", appr: "pend" }
  ];

  var PLAN_DATA = [
    { year: "2026", name: "国产化变流器模块", plan: 120, done: 100, left: 20, st: "执行中" },
    { year: "2026", name: "IGBT驱动板", plan: 600, done: 500, left: 100, st: "执行中" }
  ];

  var TODO_TASKS = [
    { title: "小料采购申请-润滑油", applicant: "赵六", time: "2026-04-18 09:20" },
    { title: "工具借用申请-万用表T002", applicant: "李四", time: "2026-04-17 14:05" },
    { title: "国产化发货审批-GD-001", applicant: "宋中波", time: "2026-04-16 11:30" }
  ];

  function stDot(st) {
    if (st === "ok") return '<span class="st-ok">● 正常</span>';
    if (st === "low") return '<span class="st-warn">● 低库存</span>';
    return '<span class="st-bad">● 缺货</span>';
  }

  function toolStDot(st) {
    if (st === "在用") return '<span style="color:#1677ff">● 在用</span>';
    if (st === "借出") return '<span class="st-warn">● 借出</span>';
    if (st === "在库") return '<span class="st-ok">● 在库</span>';
    return st;
  }

  function openModal(title, html, footHtml, large) {
    var m = document.getElementById("rdModal");
    var inner = document.getElementById("rdModalInner");
    document.getElementById("rdModalTitle").textContent = title;
    document.getElementById("rdModalBody").innerHTML = html;
    var ft = document.getElementById("rdModalFt");
    ft.innerHTML = footHtml || '<button type="button" class="carrier-btn-add" id="rdModalCloseOnly">关闭</button>';
    if (large) inner.classList.add("rd-modal--lg"); else inner.classList.remove("rd-modal--lg");
    m.classList.add("show");
    var closeBtn = document.getElementById("rdModalCloseOnly") || document.getElementById("rdModalOk");
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener("click", closeModal);
    }
    document.getElementById("rdModalX").onclick = closeModal;
    m.onclick = function (e) {
      if (e.target === m) closeModal();
    };
  }

  function closeModal() {
    document.getElementById("rdModal").classList.remove("show");
  }

  function paginate(arr, page, perPage) {
    var total = arr.length;
    var pages = Math.max(1, Math.ceil(total / perPage));
    if (page > pages) page = pages;
    var start = (page - 1) * perPage;
    return { slice: arr.slice(start, start + perPage), total: total, pages: pages, page: page };
  }

  function renderPagination(elId, page, pages, total, onChange) {
    var el = document.getElementById(elId);
    if (!el) return;
    var btns = [];
    for (var p = 1; p <= pages; p++) btns.push('<button type="button" class="page-btn' + (p === page ? " is-cur" : "") + '" data-p="' + p + '">' + p + "</button>");
    el.innerHTML = '<span>共 ' + total + " 条</span><span>每页 10 条</span>" + btns.join("");
    el.querySelectorAll("[data-p]").forEach(function (b) {
      b.onclick = function () {
        onChange(parseInt(b.getAttribute("data-p"), 10));
      };
    });
  }

  function getInvFiltered() {
    var name = (document.getElementById("fInvName") && document.getElementById("fInvName").value) || "";
    var cat = (document.getElementById("fInvCat") && document.getElementById("fInvCat").value) || "";
    var st = (document.getElementById("fInvSt") && document.getElementById("fInvSt").value) || "";
    return INV_DATA.filter(function (r) {
      if (name && r.name.indexOf(name) === -1 && r.code.indexOf(name) === -1) return false;
      if (cat && r.cat !== cat) return false;
      if (st && r.st !== st) return false;
      return true;
    });
  }

  function sortInv(arr) {
    var k = INV_SORT.key;
    var d = INV_SORT.dir;
    return arr.slice().sort(function (a, b) {
      var va = a[k];
      var vb = b[k];
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * d;
      return String(va).localeCompare(String(vb), "zh-CN") * d;
    });
  }

  function renderInvTable() {
    var filtered = sortInv(getInvFiltered());
    var p = paginate(filtered, INV_PAGE, 10);
    var tb = document.getElementById("tblInvBody");
    tb.innerHTML = p.slice
      .map(function (r) {
        return (
          "<tr>" +
          "<td>" +
          r.code +
          "</td><td>" +
          r.name +
          "</td><td>" +
          r.spec +
          "</td><td>" +
          r.cat +
          "</td><td>" +
          r.qty +
          "</td><td>" +
          r.unit +
          "</td><td>" +
          r.loc +
          "</td><td>" +
          r.th +
          "</td><td>" +
          stDot(r.st) +
          '</td><td><span class="rd-ops"><button type="button" class="carrier-btn-add btn-inv-detail" data-code="' +
          r.code +
          '">查看详情</button></span></td></tr>'
        );
      })
      .join("");
    renderPagination("pgInv", p.page, p.pages, p.total, function (np) {
      INV_PAGE = np;
      renderInvTable();
    });
    tb.querySelectorAll(".btn-inv-detail").forEach(function (btn) {
      btn.onclick = function () {
        var code = btn.getAttribute("data-code");
        var row = INV_DATA.find(function (x) {
          return x.code === code;
        });
        if (!row) return;
        var flow = "";
        for (var i = 0; i < 10; i++) {
          var t = "2026-04-" + (10 + i) + " 0" + (8 + (i % 3)) + ":00:00";
          flow +=
            "<tr><td>" +
            t +
            "</td><td>" +
            (i % 2 ? "出库" : "入库") +
            "</td><td>" +
            (i + 1) +
            "</td><td>用户" +
            (i % 4) +
            "</td></tr>";
        }
        openModal(
          "物料详情 - " + row.name,
          "<div class='rd-form-row'><strong>基础信息</strong></div>" +
            "<p>编码：" +
            row.code +
            " &nbsp; 名称：" +
            row.name +
            " &nbsp; 型号：" +
            row.spec +
            "</p>" +
            "<p>分类：" +
            row.cat +
            " &nbsp; 存放：" +
            row.loc +
            " &nbsp; 单价：— &nbsp; 库存：" +
            row.qty +
            " &nbsp; 低库存阈值：" +
            row.th +
            "</p>" +
            "<div class='rd-form-row' style='margin-top:12px'><strong>出入库流水（最近10条）</strong></div>" +
            "<div class='carrier-table-wrap'><table class='carrier-table'><thead><tr><th>时间</th><th>业务类型</th><th>数量</th><th>经手人</th></tr></thead><tbody>" +
            flow +
            "</tbody></table></div>",
          '<button type="button" class="carrier-btn-add" id="rdModalCloseOnly">关闭</button>',
          true
        );
      };
    });
  }

  function renderSmallTable() {
    var name = (document.getElementById("fSmName") && document.getElementById("fSmName").value.trim()) || "";
    var cat = (document.getElementById("fSmCat") && document.getElementById("fSmCat").value) || "";
    var mode = (document.getElementById("fSmMode") && document.getElementById("fSmMode").value) || "";
    var list = SMALL_DATA.filter(function (r) {
      if (name && r.name.indexOf(name) === -1) return false;
      if (cat && r.cat !== cat) return false;
      if (mode && r.mode !== mode) return false;
      return true;
    });
    var p = paginate(list, SMALL_PAGE, 10);
    document.getElementById("tblSmallBody").innerHTML = p.slice
      .map(function (r, i) {
        var idx = SMALL_DATA.indexOf(r);
        return (
          "<tr data-idx='" +
          idx +
          "'><td>" +
          r.name +
          "</td><td>" +
          r.spec +
          "</td><td>" +
          r.cat +
          "</td><td>" +
          r.mode +
          "</td><td class='sm-qty'>" +
          r.qty +
          "</td><td>" +
          r.unit +
          "</td><td>" +
          r.loc +
          "</td><td>" +
          r.th +
          "</td><td>" +
          stDot(r.st) +
          "</td><td><span class='rd-ops'>" +
          '<button type="button" class="carrier-btn-add sm-use">领用登记</button>' +
          '<button type="button" class="carrier-btn-add sm-po">采购申请</button>' +
          '<button type="button" class="carrier-btn-add sm-detail">查看详情</button>' +
          "</span></td></tr>"
        );
      })
      .join("");
    renderPagination("pgSmall", p.page, p.pages, p.total, function (np) {
      SMALL_PAGE = np;
      renderSmallTable();
    });
    document.getElementById("tblSmallBody").querySelectorAll("tr").forEach(function (tr) {
      var idx = parseInt(tr.getAttribute("data-idx"), 10);
      tr.querySelector(".sm-use").onclick = function () {
        var r = SMALL_DATA[idx];
        openModal(
          "领用登记 - " + r.name,
          "<div class='rd-form-row'><label>物料名称</label><input readonly value='" +
            r.name +
            "'/></div>" +
            "<div class='rd-form-row'><label>领用数量（必填）</label><input id='smUseQty' type='number' min='1' value='1'/></div>" +
            "<div class='rd-form-row'><label>领用人</label><input readonly value='宋中波'/></div>" +
            "<div class='rd-form-row'><label>用途</label><select id='smUsePur'><option>维修消耗</option><option>日常消耗</option><option>其他</option></select></div>" +
            "<div class='rd-form-row'><label>备注</label><textarea id='smUseRm'></textarea></div>",
          '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="smUseCancel">取消</button><button type="button" class="carrier-btn-add" id="smUseOk">提交</button>'
        );
        document.getElementById("smUseCancel").onclick = closeModal;
        document.getElementById("smUseOk").onclick = function () {
          var q = parseInt(document.getElementById("smUseQty").value, 10) || 0;
          if (q <= 0 || q > r.qty) {
            alert("数量无效");
            return;
          }
          r.qty -= q;
          alert("领用登记成功");
          closeModal();
          renderSmallTable();
        };
      };
      tr.querySelector(".sm-po").onclick = function () {
        var r = SMALL_DATA[idx];
        openModal(
          "采购申请 - " + r.name,
          "<div class='rd-form-row'><label>物料名称</label><input readonly value='" +
            r.name +
            "'/></div>" +
            "<div class='rd-form-row'><label>申请数量（必填）</label><input id='smPoQty' type='number' min='1' value='1'/></div>" +
            "<div class='rd-form-row'><label>紧急程度</label><select id='smPoUrg'><option>普通</option><option>紧急</option></select></div>" +
            "<div class='rd-form-row'><label>申请原因（必填）</label><textarea id='smPoWhy'>补充库存</textarea></div>",
          '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="smPoCancel">取消</button><button type="button" class="carrier-btn-add" id="smPoOk">提交</button>'
        );
        document.getElementById("smPoCancel").onclick = closeModal;
        document.getElementById("smPoOk").onclick = function () {
          if (!(document.getElementById("smPoWhy").value || "").trim()) {
            alert("请填写申请原因");
            return;
          }
          alert("采购申请已提交，等待审批");
          closeModal();
        };
      };
      tr.querySelector(".sm-detail").onclick = function () {
        openModal(
          "领用记录 - " + SMALL_DATA[idx].name,
          "<p>历史领用（演示）：</p><table class='carrier-table'><thead><tr><th>时间</th><th>数量</th><th>领用人</th></tr></thead><tbody>" +
            "<tr><td>2026-04-10</td><td>2</td><td>宋中波</td></tr><tr><td>2026-03-22</td><td>1</td><td>王五</td></tr></tbody></table>",
          null,
          true
        );
      };
    });
  }

  function renderToolTable() {
    var fn = (document.getElementById("fTlName") && document.getElementById("fTlName").value) || "";
    var tp = (document.getElementById("fTlType") && document.getElementById("fTlType").value) || "";
    var st = (document.getElementById("fTlSt") && document.getElementById("fTlSt").value) || "";
    var k = (document.getElementById("fTlKeeper") && document.getElementById("fTlKeeper").value) || "";
    var list = TOOL_DATA.filter(function (r) {
      if (fn && r.name.indexOf(fn) === -1 && r.code.indexOf(fn) === -1) return false;
      if (tp && r.type !== tp) return false;
      if (st && r.st !== st) return false;
      if (k && r.keeper.indexOf(k) === -1) return false;
      return true;
    });
    document.getElementById("tblToolBody").innerHTML = list
      .map(function (r) {
        var ops =
          '<button type="button" class="carrier-btn-add tl-detail">查看详情</button>' +
          (r.st === "在库" ? ' <button type="button" class="carrier-btn-add tl-borrow">借用申请</button>' : "") +
          (r.st === "借出" ? ' <button type="button" class="carrier-btn-add tl-ret">归还登记</button>' : "");
        return (
          "<tr data-idx='" +
          r.idx +
          "'><td>" +
          r.code +
          "</td><td>" +
          r.name +
          "</td><td>" +
          r.spec +
          "</td><td>" +
          r.type +
          "</td><td>" +
          r.keeper +
          "</td><td>" +
          r.dept +
          "</td><td>" +
          r.loc +
          "</td><td>" +
          toolStDot(r.st) +
          "</td><td>" +
          r.borrower +
          "</td><td>" +
          r.ret +
          '</td><td><span class="rd-ops">' +
          ops +
          "</span></td></tr>"
        );
      })
      .join("");
    document.getElementById("tblToolBody").querySelectorAll("tr").forEach(function (tr) {
      var idx = parseInt(tr.getAttribute("data-idx"), 10);
      var row = TOOL_DATA[idx];
      tr.querySelector(".tl-detail").onclick = function () {
        openModal(
          "借用历史 - " + row.name,
          "<table class='carrier-table'><thead><tr><th>时间</th><th>借用人</th><th>归还</th></tr></thead><tbody>" +
            "<tr><td>2026-04-01</td><td>李四</td><td>已归还</td></tr></tbody></table>",
          null,
          true
        );
      };
      var br = tr.querySelector(".tl-borrow");
      if (br)
        br.onclick = function () {
          openModal(
            "借用申请 - " + row.name,
            "<div class='rd-form-row'><label>工具名称</label><input readonly value='" +
              row.name +
              "'/></div>" +
              "<div class='rd-form-row'><label>借用天数（必填）</label><input id='tlDays' type='number' min='1' value='3'/></div>" +
              "<div class='rd-form-row'><label>预计归还日</label><input id='tlRetEst' readonly/></div>" +
              "<div class='rd-form-row'><label>用途（必填）</label><textarea id='tlWhy'>现场维修</textarea></div>",
            '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="tlBCancel">取消</button><button type="button" class="carrier-btn-add" id="tlBOk">提交</button>'
          );
          function updRet() {
            var d = parseInt(document.getElementById("tlDays").value, 10) || 1;
            var dt = new Date();
            dt.setDate(dt.getDate() + d);
            document.getElementById("tlRetEst").value = dt.toISOString().slice(0, 10);
          }
          updRet();
          document.getElementById("tlDays").oninput = updRet;
          document.getElementById("tlBCancel").onclick = closeModal;
          document.getElementById("tlBOk").onclick = function () {
            if (!(document.getElementById("tlWhy").value || "").trim()) return alert("请填写用途");
            alert("借用申请已提交，等待审批");
            closeModal();
          };
        };
      var rt = tr.querySelector(".tl-ret");
      if (rt)
        rt.onclick = function () {
          openModal(
            "归还登记 - " + row.name,
            "<div class='rd-form-row'><label>工具名称</label><input readonly value='" +
              row.name +
              "'/></div>" +
              "<div class='rd-form-row'><label>实际归还日</label><input id='tlRetAct' type='date'/></div>" +
              "<div class='rd-form-row'><label>工具状况</label><select id='tlCond'><option>正常</option><option>损坏</option><option>丢失</option></select></div>" +
              "<div class='rd-form-row'><label>备注</label><textarea id='tlRm'></textarea></div>",
            '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="tlRCancel">取消</button><button type="button" class="carrier-btn-add" id="tlROk">提交</button>'
          );
          document.getElementById("tlRetAct").value = new Date().toISOString().slice(0, 10);
          document.getElementById("tlRCancel").onclick = closeModal;
          document.getElementById("tlROk").onclick = function () {
            row.st = "在库";
            row.borrower = "-";
            row.ret = "-";
            alert("归还登记成功");
            closeModal();
            renderToolTable();
          };
        };
    });
  }

  function renderProdTable() {
    var n = (document.getElementById("fDpName") && document.getElementById("fDpName").value.trim()) || "";
    var c = (document.getElementById("fDpCat") && document.getElementById("fDpCat").value) || "";
    var s = (document.getElementById("fDpSt") && document.getElementById("fDpSt").value) || "";
    var list = PROD_DATA.filter(function (r) {
      if (n && r.name.indexOf(n) === -1 && r.code.indexOf(n) === -1) return false;
      if (c && r.cat !== c) return false;
      if (s && r.st !== s) return false;
      return true;
    });
    var p = paginate(list, PROD_PAGE, 10);
    document.getElementById("tblProdBody").innerHTML = p.slice
      .map(function (r) {
        var ops =
          '<button type="button" class="carrier-btn-add pd-d">查看详情</button> ' +
          '<button type="button" class="carrier-btn-add pd-s">发货登记</button> ';
        if (r.stock > 0) ops += '<button type="button" class="carrier-btn-add pd-r">维修领用登记</button>';
        return (
          "<tr data-idx='" +
          r.idx +
          "'><td>" +
          r.code +
          "</td><td>" +
          r.name +
          "</td><td>" +
          r.cat +
          "</td><td>" +
          r.spec +
          "</td><td>" +
          r.prod +
          "</td><td>" +
          r.ship +
          "</td><td>" +
          r.rep +
          "</td><td class='pd-stock'>" +
          r.stock +
          "</td><td>" +
          r.price +
          '</td><td><span class="st-ok">● 在库</span></td><td><span class="rd-ops">' +
          ops +
          "</span></td></tr>"
        );
      })
      .join("");
    renderPagination("pgProd", p.page, p.pages, p.total, function (np) {
      PROD_PAGE = np;
      renderProdTable();
    });
    document.getElementById("tblProdBody").querySelectorAll("tr").forEach(function (tr) {
      var idx = parseInt(tr.getAttribute("data-idx"), 10);
      var row = PROD_DATA[idx];
      tr.querySelector(".pd-d").onclick = function () {
        openModal(
          "产品详情 - " + row.name,
          "<p><strong>完整信息（演示）</strong></p><p>编码 " +
            row.code +
            "，分类 " +
            row.cat +
            "，剩余库存 " +
            row.stock +
            "</p>" +
            '<div class="rd-subtabs" style="margin-top:10px"><button type="button" class="is-active" id="pdTab1">发货历史</button><button type="button" id="pdTab2">维修领用</button></div>' +
            "<div id='pdPane1'><table class='carrier-table'><thead><tr><th>单号</th><th>数量</th><th>日期</th></tr></thead><tbody><tr><td>FH-001</td><td>10</td><td>2026-04-01</td></tr></tbody></table></div>" +
            "<div id='pdPane2' style='display:none'><table class='carrier-table'><thead><tr><th>工单</th><th>数量</th></tr></thead><tbody><tr><td>WX-001</td><td>5</td></tr></tbody></table></div>",
          null,
          true
        );
        document.getElementById("pdTab1").onclick = function () {
          document.getElementById("pdPane1").style.display = "block";
          document.getElementById("pdPane2").style.display = "none";
          document.getElementById("pdTab1").classList.add("is-active");
          document.getElementById("pdTab2").classList.remove("is-active");
        };
        document.getElementById("pdTab2").onclick = function () {
          document.getElementById("pdPane1").style.display = "none";
          document.getElementById("pdPane2").style.display = "block";
          document.getElementById("pdTab2").classList.add("is-active");
          document.getElementById("pdTab1").classList.remove("is-active");
        };
      };
      tr.querySelector(".pd-s").onclick = function () {
        openModal(
          "发货登记",
          "<div class='rd-form-row'><label>产品编码</label><input readonly value='" +
            row.code +
            "'/></div>" +
            "<div class='rd-form-row'><label>产品名称</label><input readonly value='" +
            row.name +
            "'/></div>" +
            "<div class='rd-form-row'><label>发货数量</label><input id='pdSq' type='number' min='1' max='" +
            row.stock +
            "' value='1'/></div>" +
            "<div class='rd-form-row'><label>接收单位</label><select id='pdRecv'><option>河北龙源</option><option>天津龙源</option><option>黑龙江龙源</option><option>其他</option></select></div>" +
            "<div class='rd-form-row'><label>场站名称</label><input id='pdSite' value=''/></div>" +
            "<div class='rd-form-row'><label>关联合同号</label><input id='pdCt' value=''/></div>",
          '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="pdSCancel">取消</button><button type="button" class="carrier-btn-add" id="pdSOk">提交</button>'
        );
        document.getElementById("pdSCancel").onclick = closeModal;
        document.getElementById("pdSOk").onclick = function () {
          var q = parseInt(document.getElementById("pdSq").value, 10) || 0;
          if (q < 1 || q > row.stock) return alert("数量不能超过剩余库存");
          alert("发货申请已提交，等待审批");
          closeModal();
        };
      };
      var pr = tr.querySelector(".pd-r");
      if (pr)
        pr.onclick = function () {
          openModal(
            "维修领用登记",
            "<div class='rd-form-row'><label>产品编码</label><input readonly value='" +
              row.code +
              "'/></div>" +
              "<div class='rd-form-row'><label>产品名称</label><input readonly value='" +
              row.name +
              "'/></div>" +
              "<div class='rd-form-row'><label>领用数量</label><input id='pdRq' type='number' min='1' max='" +
              row.stock +
              "' value='1'/></div>" +
              "<div class='rd-form-row'><label>维修工单号</label><input id='pdWx' value='WX-2026-099'/></div>" +
              "<div class='rd-form-row'><label>领用部门</label><input readonly value='电控所'/></div>" +
              "<div class='rd-form-row'><label>领用人</label><input readonly value='宋中波'/></div>",
            '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="pdRCancel">取消</button><button type="button" class="carrier-btn-add" id="pdROk">提交</button>'
          );
          document.getElementById("pdRCancel").onclick = closeModal;
          document.getElementById("pdROk").onclick = function () {
            alert("领用登记已提交，等待审批");
            closeModal();
          };
        };
    });
  }

  function renderShipRec() {
    document.getElementById("tblShipRecBody").innerHTML = SHIP_REC.map(function (r) {
      var ap =
        r.appr === "pass"
          ? '<span class="st-ok">已通过</span>'
          : '<span class="st-warn">审批中</span>';
      return (
        "<tr><td>" +
        r.no +
        "</td><td>" +
        r.code +
        "</td><td>" +
        r.name +
        "</td><td>" +
        r.qty +
        "</td><td>" +
        r.date +
        "</td><td>" +
        r.recv +
        "</td><td>" +
        r.site +
        "</td><td>" +
        r.contract +
        "</td><td>" +
        r.person +
        "</td><td>" +
        ap +
        "</td></tr>"
      );
    }).join("");
  }

  function renderPlan() {
    document.getElementById("tblPlanBody").innerHTML = PLAN_DATA.map(function (r, i) {
      return (
        "<tr data-pi='" +
        i +
        "'><td>" +
        r.year +
        "</td><td>" +
        r.name +
        "</td><td>" +
        r.plan +
        "</td><td>" +
        r.done +
        "</td><td>" +
        r.left +
        "</td><td><span class='st-ok'>● " +
        r.st +
        "</span></td><td><span class='rd-ops'><button type='button' class='carrier-btn-add pl-ed'>编辑</button><button type='button' class='carrier-btn-add pl-ap'>提报审批</button></span></td></tr>"
      );
    }).join("");
    document.getElementById("tblPlanBody").querySelectorAll("tr").forEach(function (tr) {
      var i = parseInt(tr.getAttribute("data-pi"), 10);
      tr.querySelector(".pl-ed").onclick = function () {
        var r = PLAN_DATA[i];
        openModal(
          "编辑计划",
          "<div class='rd-form-row'><label>计划年度</label><select id='plY'><option>2025</option><option selected>2026</option><option>2027</option></select></div>" +
            "<div class='rd-form-row'><label>产品名称</label><input id='plN' value='" +
            r.name +
            "'/></div>" +
            "<div class='rd-form-row'><label>计划生产数量</label><input id='plQ' type='number' value='" +
            r.plan +
            "'/></div>" +
            "<div class='rd-form-row'><label>备注</label><textarea id='plRm'></textarea></div>",
          '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="plECancel">取消</button><button type="button" class="carrier-btn-add" id="plEOk">提交</button>'
        );
        document.getElementById("plECancel").onclick = closeModal;
        document.getElementById("plEOk").onclick = function () {
          r.plan = parseInt(document.getElementById("plQ").value, 10) || r.plan;
          r.left = Math.max(0, r.plan - r.done);
          alert("已保存并提交审批流（演示）");
          closeModal();
          renderPlan();
        };
      };
      tr.querySelector(".pl-ap").onclick = function () {
        alert("提报审批（演示）");
      };
    });
  }

  function switchModule(which) {
    var repair = document.getElementById("moduleRepair");
    var dom = document.getElementById("moduleDomestic");
    var crumb = document.getElementById("rdCrumbLeaf");
    document.querySelectorAll("[data-rd-module]").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-rd-module") === which);
    });
    if (which === "repair") {
      repair.classList.add("is-visible");
      dom.classList.remove("is-visible");
      crumb.textContent = "维修管理";
    } else {
      repair.classList.remove("is-visible");
      dom.classList.add("is-visible");
      crumb.textContent = "国产化替代";
    }
    try {
      history.replaceState(null, "", "?view=" + which);
    } catch (e) {}
  }

  function init() {
    document.querySelectorAll(".rd-tree-head").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        var body = btn.parentNode.querySelector(".rd-tree-body");
        if (body) body.classList.toggle("is-open", !open);
      });
    });

    document.querySelectorAll("[data-rd-module]").forEach(function (el) {
      el.addEventListener("click", function () {
        switchModule(el.getAttribute("data-rd-module"));
      });
    });

    document.getElementById("rdUserChip").addEventListener("click", function (e) {
      e.stopPropagation();
      var m = document.getElementById("rdUserMenu");
      m.classList.toggle("show");
      document.getElementById("rdUserChip").setAttribute("aria-expanded", m.classList.contains("show"));
    });
    document.addEventListener("click", function () {
      document.getElementById("rdUserMenu").classList.remove("show");
    });

    var params = new URLSearchParams(window.location.search);
    var v = params.get("view") || params.get("module") || "repair";
    if (v === "domestic") switchModule("domestic");

    document.getElementById("repairMainTabs").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-repair-tab]");
      if (!b) return;
      document.querySelectorAll("#repairMainTabs button").forEach(function (x) {
        x.classList.toggle("is-active", x === b);
      });
      var tab = b.getAttribute("data-repair-tab");
      document.getElementById("repairPanelInv").classList.toggle("is-visible", tab === "inv");
      document.getElementById("repairPanelSmall").classList.toggle("is-visible", tab === "small");
      document.getElementById("repairPanelTool").classList.toggle("is-visible", tab === "tool");
    });

    document.getElementById("tblInv").addEventListener("click", function (e) {
      var th = e.target.closest("th.sortable");
      if (!th) return;
      var k = th.getAttribute("data-sort");
      if (INV_SORT.key === k) INV_SORT.dir *= -1;
      else {
        INV_SORT.key = k;
        INV_SORT.dir = 1;
      }
      INV_PAGE = 1;
      renderInvTable();
    });

    document.getElementById("fInvSearch").onclick = function () {
      INV_PAGE = 1;
      renderInvTable();
    };
    document.getElementById("fInvReset").onclick = function () {
      document.getElementById("fInvName").value = "";
      document.getElementById("fInvCat").value = "";
      document.getElementById("fInvSt").value = "";
      INV_PAGE = 1;
      renderInvTable();
    };
    document.getElementById("btnSyncManual").onclick = function () {
      document.getElementById("rdSyncTime").textContent = new Date().toISOString().slice(0, 19).replace("T", " ");
      alert("同步完成（演示）");
    };

    document.getElementById("fSmSearch").onclick = function () {
      SMALL_PAGE = 1;
      renderSmallTable();
    };
    document.getElementById("fSmReset").onclick = function () {
      document.getElementById("fSmName").value = "";
      document.getElementById("fSmCat").value = "";
      document.getElementById("fSmMode").value = "";
      SMALL_PAGE = 1;
      renderSmallTable();
    };
    document.getElementById("btnSmImport").onclick = function () {
      alert("导入Excel（演示）");
    };
    document.getElementById("btnSmAdd").onclick = function () {
      alert("新增物料（演示）");
    };

    document.getElementById("fTlSearch").onclick = renderToolTable;
    document.getElementById("fTlReset").onclick = function () {
      document.getElementById("fTlName").value = "";
      document.getElementById("fTlType").value = "";
      document.getElementById("fTlSt").value = "";
      document.getElementById("fTlKeeper").value = "";
      renderToolTable();
    };
    document.getElementById("btnTlAdd").onclick = function () {
      alert("新增工具（演示）");
    };
    document.getElementById("btnTlImport").onclick = function () {
      alert("导入Excel（演示）");
    };

    document.getElementById("fDpSearch").onclick = function () {
      PROD_PAGE = 1;
      renderProdTable();
    };
    document.getElementById("fDpReset").onclick = function () {
      document.getElementById("fDpName").value = "";
      document.getElementById("fDpCat").value = "";
      document.getElementById("fDpSt").value = "";
      PROD_PAGE = 1;
      renderProdTable();
    };
    document.getElementById("btnDpAdd").onclick = function () {
      alert("新增产品（演示）");
    };
    document.getElementById("btnDpExport").onclick = function () {
      alert("导出台账（演示）");
    };

    document.getElementById("fDsSearch").onclick = function () {
      alert("筛选发货记录（演示）");
    };
    document.getElementById("fDsReset").onclick = function () {};

    document.getElementById("fPlSearch").onclick = renderPlan;
    document.getElementById("fPlReset").onclick = function () {
      document.getElementById("fPlName").value = "";
      renderPlan();
    };
    document.getElementById("btnPlAdd").onclick = function () {
      openModal(
        "新增计划",
        "<div class='rd-form-row'><label>计划年度</label><select id='nplY'><option>2025</option><option selected>2026</option><option>2027</option></select></div>" +
          "<div class='rd-form-row'><label>产品名称</label><select id='nplN'><option>国产化变流器模块</option><option>IGBT驱动板</option></select></div>" +
          "<div class='rd-form-row'><label>计划生产数量</label><input id='nplQ' type='number' value='100'/></div>" +
          "<div class='rd-form-row'><label>备注</label><textarea id='nplRm'></textarea></div>",
        '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="nplCancel">取消</button><button type="button" class="carrier-btn-add" id="nplOk">提交</button>'
      );
      document.getElementById("nplCancel").onclick = closeModal;
      document.getElementById("nplOk").onclick = function () {
        alert("已提交审批流（演示）");
        closeModal();
      };
    };

    document.getElementById("rdFabTodo").onclick = function () {
      var rows = TODO_TASKS.map(function (t, i) {
        return (
          "<tr><td>" +
          t.title +
          "</td><td>" +
          t.applicant +
          "</td><td>" +
          t.time +
          '</td><td><button type="button" class="carrier-btn-add todo-go" data-ti="' +
          i +
          '">去审批</button></td></tr>'
        );
      }).join("");
      openModal(
        "待审批任务",
        "<table class='carrier-table'><thead><tr><th>任务名称</th><th>申请人</th><th>申请时间</th><th>操作</th></tr></thead><tbody>" +
          rows +
          "</tbody></table>",
        '<button type="button" class="carrier-btn-add" id="rdModalCloseOnly">关闭</button>',
        true
      );
      document.getElementById("rdModalBody").querySelectorAll(".todo-go").forEach(function (btn) {
        btn.onclick = function () {
          var ti = parseInt(btn.getAttribute("data-ti"), 10);
          var t = TODO_TASKS[ti];
          openModal(
            "审批 - " + t.title,
            "<p>申请详情（演示）：" +
              t.title +
              "</p>" +
              "<div class='rd-form-row'><label>审批意见</label><select id='apprSt'><option>同意</option><option>驳回</option></select></div>" +
              "<div class='rd-form-row'><label>意见说明</label><textarea id='apprRm'>同意。</textarea></div>",
            '<button type="button" class="carrier-btn-add" style="background:#fff;color:#1677ff;border:1px solid #1677ff" id="apCancel">取消</button><button type="button" class="carrier-btn-add" id="apOk">提交</button>'
          );
          document.getElementById("apCancel").onclick = closeModal;
          document.getElementById("apOk").onclick = function () {
            alert("审批已提交（演示）");
            closeModal();
            closeModal();
          };
        };
      });
    };

    renderInvTable();
    renderSmallTable();
    renderToolTable();
    renderProdTable();
    renderShipRec();
    renderPlan();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
