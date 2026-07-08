/**
 * 合同信息管理页原型：采购合同树形列表、角色演示、弹窗
 */
(function () {
  var CTX = {
    tab: "purchase",
    role: "corp_purchase_specialist",
    purchaseRoots: null,
    salesList: null,
    inlineEdit: false,
    inlineSnapshot: null,
    formMode: "view",
    pendingNewContract: null
  };

  var ROLE_LABEL = {
    corp_purchase_specialist: "公司采购专责（王卿明）",
    dept_buyer: "部门采购专责",
    dept_head: "部门主管",
    corp_purchase_head: "公司采购主管（王超）",
    finance: "财务部",
    director: "董事/总经理"
  };

  /** 采购信息台账（演示）：项目名称、标包编号、中标/成交供应商、中标/成交金额（万元） */
  var PROCUREMENT_LEDGER_SP = [
    { project: "电控备件年度框架采购", no: "SP-CG-2026-001", supplier: "远景能源", winAmount: 486 },
    { project: "齿轮箱单次采购", no: "SP-CG-2026-050", supplier: "联合动力", winAmount: 486 },
    { project: "电缆集中采购", no: "SP-CG-2026-051", supplier: "亨通光电", winAmount: 320 },
    { project: "第一批备件执行采购", no: "SP-CG-2026-011-A", supplier: "远景能源", winAmount: 180 },
    { project: "第二批备件执行采购", no: "SP-CG-2026-011-B", supplier: "远景能源", winAmount: 130 },
    { project: "变流器框架采购项目", no: "HT2026301", supplier: "阳光电源", winAmount: 1200 },
    { project: "IGBT年度备件项目", no: "HT2026315", supplier: "斯达半导体", winAmount: 560 }
  ];

  var CM_PROC_FLOW_PREFIX = "采购流程-";

  function cmWithProcFlowLabel(value) {
    var v = String(value || "").trim();
    if (!v) return "";
    if (v.indexOf(CM_PROC_FLOW_PREFIX) === 0) return v;
    return CM_PROC_FLOW_PREFIX + v;
  }

  function cmStripProcFlowPrefix(text) {
    var s = String(text || "").trim();
    if (s.indexOf(CM_PROC_FLOW_PREFIX) === 0) return s.slice(CM_PROC_FLOW_PREFIX.length).trim();
    return s;
  }

  function cmGetProcurementSpNo() {
    var el = document.getElementById("mSpNo");
    return el ? String(el.value || "").trim() : "";
  }

  /** 无采购标包编号：供应商下拉手选；有标包编号：自动带出「采购流程-」+ 台帐中标/成交供应商并锁定 */
  function syncCmSupplierFieldMode() {
    var hasSp = !!cmGetProcurementSpNo();
    var root = document.getElementById("cmSupplierDdRoot");
    if (root) root.classList.toggle("cm-supplier-dd--locked", hasSp);
    if (!hasSp) {
      var hidden = document.getElementById("mSupplier");
      if (hidden && String(hidden.value || "").indexOf(CM_PROC_FLOW_PREFIX) === 0) {
        setCmSupplierValue(cmStripProcFlowPrefix(hidden.value), true);
      }
    }
  }

  /** 解析「486」或「采购流程-486」为数字 */
  function cmParseAmountInput(raw) {
    var s = cmStripProcFlowPrefix(String(raw || "").trim());
    var n = parseFloat(String(s).replace(/[¥,\s]/g, ""));
    return isFinite(n) ? n : NaN;
  }

  function initData() {
    CTX.purchaseRoots = [
      {
        id: "pf1",
        rowType: "framework",
        code: "CG-KJ-2026-001",
        name: "电控备件年度框架协议",
        ctype: "框架协议",
        supplier: "远景能源",
        spNo: "SP-CG-2026-001",
        amount: 82,
        executed: 80,
        remain: 2,
        signed: "2026-01-08",
        status: "已生效",
        creator: "王卿明",
        pendingApprover: "",
        inAmount: 186,
        children: [
          {
            id: "ex1",
            rowType: "exec",
            parentCode: "CG-KJ-2026-001",
            code: "CG-ZX-2026-011",
            name: "第一批备件执行合同",
            ctype: "框架协议下的执行合同",
            supplier: "远景能源",
            spNo: "SP-CG-2026-011-A",
            amount: 30,
            signed: "2026-02-01",
            status: "审批中",
            creator: "王卿明",
            pendingApprover: "王超",
            inAmount: 0
          },
          {
            id: "ex2",
            rowType: "exec",
            parentCode: "CG-KJ-2026-001",
            code: "CG-ZX-2026-018",
            name: "第二批备件执行合同",
            ctype: "框架协议下的执行合同",
            supplier: "远景能源",
            spNo: "SP-CG-2026-011-B",
            amount: 50,
            signed: "2026-03-10",
            status: "已生效",
            creator: "王卿明",
            pendingApprover: "",
            inAmount: 95
          }
        ]
      },
      {
        id: "n1",
        rowType: "normal",
        code: "CG-CG-2026-050",
        name: "齿轮箱单次采购合同",
        ctype: "常规合同",
        supplier: "联合动力",
        spNo: "SP-CG-2026-050",
        amount: 486,
        executed: 0,
        remain: 486,
        signed: "2026-02-15",
        status: "草稿",
        creator: "王卿明",
        pendingApprover: "",
        inAmount: 0,
        children: []
      },
      {
        id: "n2",
        rowType: "normal",
        code: "CG-CG-2026-051",
        name: "电缆采购合同",
        ctype: "常规合同",
        supplier: "采购流程-大华",
        spNo: "SP-CG-2026-051",
        amount: "采购流程-20",
        executed: 0,
        remain: 172,
        signed: "2026-03-01",
        status: "审批中",
        creator: "王卿明",
        pendingApprover: "部门主管",
        inAmount: 0,
        children: []
      }
    ];

    CTX.salesList = [
      {
        id: "s1",
        code: "XS-2026-001",
        name: "麒麟山风场变流器销售合同",
        ctype: "常规合同",
        customer: "河北龙源",
        amount: 1200,
        executed: 400,
        remain: 800,
        signed: "2026-02-20",
        status: "已生效",
        creator: "王卿明",
        pendingApprover: ""
      },
      {
        id: "s2",
        code: "XS-2026-002",
        name: "沙井子风场备件销售",
        ctype: "常规合同",
        customer: "天津龙源",
        amount: 360,
        executed: 0,
        remain: 360,
        signed: "2026-04-01",
        status: "审批中",
        creator: "王卿明",
        pendingApprover: "王超"
      }
    ];

    recalcFramework("pf1");
  }

  function recalcFramework(rootId) {
    var root = CTX.purchaseRoots.find(function (r) {
      return r.id === rootId;
    });
    if (!root || root.rowType !== "framework") return;
    var sum = 0;
    (root.children || []).forEach(function (c) {
      sum += Number(c.amount) || 0;
    });
    root.executed = sum;
    root.remain = Math.max(0, (Number(root.amount) || 0) - sum);
  }

  function hint(text) {
    return (
      '<span class="cm-hint" tabindex="0" aria-label="说明">?<span class="cm-hint-tip">' +
      escapeHtml(text) +
      "</span></span>"
    );
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getOwningCompanyLabel() {
    var engLabel = "工程技术公司";
    var defaultProj = "龙源山西分公司";
    try {
      var kind = (sessionStorage.getItem("demoLoginOrgKind") || "").trim();
      var company = (sessionStorage.getItem("demoLoginCompanyName") || "").trim();
      if (kind === "project") return company || defaultProj;
      if (kind === "eng") return engLabel;
      var pageSub = "";
      try {
        pageSub = (new URLSearchParams(location.search || "").get("pageSub") || "").trim();
        if (!pageSub) pageSub = (sessionStorage.getItem("pageSub") || "").trim();
      } catch (ePageSub) {}
      if (pageSub.indexOf("项目公司") >= 0) return company || defaultProj;
    } catch (eKind) {}
    return engLabel;
  }

  function syncCmOwningCompanyField() {
    var el = document.getElementById("mOwningCompany");
    if (el) el.value = getOwningCompanyLabel();
  }

  function findLedgerRowBySpNo(no) {
    var n = String(no || "").trim();
    if (!n) return null;
    for (var i = 0; i < PROCUREMENT_LEDGER_SP.length; i++) {
      if (PROCUREMENT_LEDGER_SP[i].no === n) return PROCUREMENT_LEDGER_SP[i];
    }
    return null;
  }

  /** 与采购信息台账行一致：选中标包后带出供应商、框架协议金额/常规合同金额、执行合同金额（万元） */
  function applyCmFieldsFromProcurementLedger(spNo) {
    var lr = findLedgerRowBySpNo(String(spNo || "").trim());
    var amtEl = document.getElementById("mAmount");
    var exEl = document.getElementById("mExecAmount");
    var ctypeEl = document.getElementById("mCtype");
    if (!lr) {
      setCmSupplierValue("");
      return;
    }
    var num =
      lr.winAmount != null && lr.winAmount !== ""
        ? String(Number(lr.winAmount))
        : "";
    setCmSupplierValue(lr.supplier || "");
    var isFa = ctypeEl && String(ctypeEl.value || "").trim() === "框架协议";
    if (amtEl && num !== "") {
      amtEl.value = num;
    }
    if (exEl) {
      if (isFa && num !== "") exEl.value = num;
      else exEl.value = "";
    }
    validateCmPayAmountAgainstContract();
    validateCmInAmountAgainstContract();
    validateCmExecAmountAgainstFrameworkShow();
    syncCmSupplierFieldMode();
  }

  var cmSpNoOutsideClickHandler = null;
  var SUPPLIER_STORAGE = "map-demo-suppliers-v1";
  var cmSupplierDdInst = null;

  function loadDemoSupplierRows() {
    var defaults = [
      { id: "SUP-0001", code: "SUP-0001", name: "大华" },
      { id: "SUP-0002", code: "SUP-0002", name: "东风" }
    ];
    try {
      var raw = localStorage.getItem(SUPPLIER_STORAGE);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return defaults;
  }

  function setCmSupplierValue(val, silent) {
    var v = val == null ? "" : String(val);
    if (cmSupplierDdInst && cmSupplierDdInst.setValue) {
      cmSupplierDdInst.setValue(v, !!silent);
      if (
        v &&
        (cmGetProcurementSpNo() || v.indexOf(CM_PROC_FLOW_PREFIX) === 0)
      ) {
        var root = document.getElementById("cmSupplierDdRoot");
        var btn = root && root.querySelector(".pl-dd__btn");
        if (btn) btn.textContent = v;
      }
      return;
    }
    var el = document.getElementById("mSupplier");
    if (el) el.value = v;
  }

  function initCmSupplierDd() {
    var root = document.getElementById("cmSupplierDdRoot");
    var hidden = document.getElementById("mSupplier");
    if (!root || !hidden || !window.DemoTwoColDd) return;
    if (cmSupplierDdInst && cmSupplierDdInst.destroy) {
      cmSupplierDdInst.destroy();
      cmSupplierDdInst = null;
    }
    var rows = [{ value: "", c1: "", c2: "请选择供应商", placeholder: true }];
    loadDemoSupplierRows().forEach(function (s) {
      rows.push({
        value: String(s.name || ""),
        c1: String(s.code || s.id || ""),
        c2: String(s.name || "")
      });
    });
    cmSupplierDdInst = DemoTwoColDd.mount({
      root: root,
      hiddenInput: hidden,
      placeholder: "请选择供应商",
      searchPlaceholder: "搜索供应商编号或名称",
      col1: "供应商编号",
      col2: "供应商名称",
      rows: rows,
      onChange: function (val) {
        if (cmGetProcurementSpNo()) return;
        var plain = cmStripProcFlowPrefix(val);
        if (plain !== val) setCmSupplierValue(plain, true);
      }
    });
    syncCmSupplierFieldMode();
  }

  function syncCmSpNoReqStar() {
    var star = document.getElementById("cmSpNoReqStar");
    if (star) star.style.display = "inline";
  }

  function initProcurementSpNoPicker() {
    var wrap = document.getElementById("cmSpNoPickWrap");
    var panel = document.getElementById("cmSpNoPanel");
    var toggle = document.getElementById("cmSpNoToggle");
    var search = document.getElementById("cmSpNoSearch");
    var tbody = document.getElementById("cmSpNoTbody");
    var display = document.getElementById("mSpNo");
    var proj = document.getElementById("mSpNoProject");
    if (!wrap || !panel || !tbody || !display) return;

    function closePanel() {
      wrap.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }

    function openPanel() {
      wrap.classList.add("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      if (search) {
        search.value = "";
        search.focus();
      }
      renderRows("");
    }

    function renderRows(q) {
      var qq = String(q || "").trim().toLowerCase();
      var rows = PROCUREMENT_LEDGER_SP.filter(function (r) {
        if (!qq) return true;
        return (
          String(r.project).toLowerCase().indexOf(qq) >= 0 ||
          String(r.no).toLowerCase().indexOf(qq) >= 0
        );
      });
      tbody.innerHTML =
        rows
          .map(function (r) {
            return (
              "<tr class='cm-ledger-pick-row' role='option' tabindex='0' data-no='" +
              escapeHtml(r.no) +
              "' data-project='" +
              escapeHtml(r.project) +
              "'><td>" +
              escapeHtml(r.project) +
              "</td><td>" +
              escapeHtml(r.no) +
              "</td></tr>"
            );
          })
          .join("") ||
        "<tr><td colspan='2' class='cm-empty' style='padding:12px'>无匹配数据</td></tr>";
    }

    if (search) {
      search.addEventListener("input", function () {
        renderRows(search.value);
      });
    }

    tbody.addEventListener("click", function (e) {
      var tr = e.target.closest("tr.cm-ledger-pick-row");
      if (!tr) return;
      display.value = tr.getAttribute("data-no") || "";
      if (proj) proj.value = tr.getAttribute("data-project") || "";
      syncCmSpNoReqStar();
      applyCmFieldsFromProcurementLedger(display.value);
      closePanel();
    });

    function onTrigger(e) {
      e.stopPropagation();
      if (wrap.classList.contains("is-open")) closePanel();
      else openPanel();
    }
    if (toggle) toggle.addEventListener("click", onTrigger);
    display.addEventListener("click", onTrigger);

    if (cmSpNoOutsideClickHandler) {
      document.removeEventListener("click", cmSpNoOutsideClickHandler);
    }
    cmSpNoOutsideClickHandler = function (e) {
      if (!wrap.contains(e.target)) closePanel();
    };
    document.addEventListener("click", cmSpNoOutsideClickHandler);

    syncCmSpNoReqStar();
  }

  function downloadTemplateCsv(filename, headers) {
    var line = "\ufeff" + headers.join(",") + "\n";
    var blob = new Blob([line], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * 导入交互：打开本地文件选择器 -> 选中文件 -> 二次确认 -> 提示完成
   */
  function openLocalImportPicker(options) {
    var opts = options || {};
    var title = opts.title || "导入";
    var accept = opts.accept || ".xlsx,.xls,.csv";
    var input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener(
      "change",
      function () {
        var file = input.files && input.files[0];
        if (!file) {
          document.body.removeChild(input);
          return;
        }
        var ok = window.confirm("确认导入文件「" + file.name + "」吗？");
        if (ok) {
          alert(title + "成功（演示）");
        }
        document.body.removeChild(input);
      },
      { once: true }
    );
    input.click();
  }

  function currentUserLabel() {
    if (CTX.role === "corp_purchase_specialist") return "王卿明";
    if (CTX.role === "corp_purchase_head") return "王超";
    if (CTX.role === "finance") return "孙睿";
    if (CTX.role === "dept_buyer") return "王卿明";
    if (CTX.role === "dept_head") return "王超";
    return "访客";
  }

  function contractRoleGroup() {
    if (CTX.role === "dept_buyer") return "filler";
    if (CTX.role === "dept_head" || CTX.role === "corp_purchase_head") return "approver";
    if (CTX.role === "corp_purchase_specialist") return "owner";
    if (CTX.role === "director" || CTX.role === "gm_zeng") return "viewer";
    return "filler";
  }

  function normalizeContractStatus(s) {
    if (s === "草稿") return "暂存未提交";
    if (s === "审批中") return "提交未审核";
    if (s === "已生效") return "已审核锁定";
    if (s === "已终止") return "退回未提交";
    return "未开始";
  }

  function isFinance() {
    return CTX.role === "finance";
  }

  function canShowFinanceOps() {
    return isFinance();
  }

  function percentText(part, total) {
    var p = Number(part);
    var t = Number(total);
    if (!isFinite(p) || !isFinite(t) || t <= 0) return "0%";
    var v = Math.max(0, Math.min(100, Math.round((p / t) * 100)));
    return v + "%";
  }

  /** 列表展示：与库存台账一致 — KJ/CG 在左列，执行合同 ZX 在右列（非执行合同右列为空） */
  function purchaseListMergedCell(row) {
    var c = String(row.code || "");
    if (row.rowType === "exec") {
      var pc = String(row.parentCode || "");
      return /^CG-KJ-/i.test(pc) ? pc.replace(/^CG-KJ-/i, "KJ-") : pc;
    }
    if (row.rowType === "framework") {
      return c.replace(/^CG-KJ-/i, "KJ-");
    }
    return c.replace(/^CG-CG-/i, "CG-");
  }

  function purchaseListExecCell(row) {
    if (row.rowType !== "exec") return "";
    return String(row.code || "").replace(/^CG-ZX-/i, "ZX-");
  }

  function mergeDisplayToStorageCode(rowType, display) {
    var v = String(display || "").trim();
    if (!v) return "";
    if (rowType === "framework") {
      if (/^CG-KJ-/i.test(v)) return v;
      v = v.replace(/^KJ-/i, "");
      return "CG-KJ-" + v.replace(/^CG-KJ-/i, "");
    }
    if (rowType === "normal") {
      if (/^CG-CG-/i.test(v)) return v;
      if (/^CG-/i.test(v)) return "CG-CG-" + v.replace(/^CG-/i, "");
      return "CG-CG-" + v;
    }
    return v;
  }

  function execDisplayToStorageCode(display) {
    var v = String(display || "").trim();
    if (!v) return "";
    if (/^CG-ZX-/i.test(v)) return v;
    v = v.replace(/^ZX-/i, "");
    return "CG-ZX-" + v;
  }

  function isFreshNewContractDraft(row) {
    if (!row || CTX.formMode !== "fill") return false;
    return row.status === "草稿" && /NEW/i.test(String(row.code || ""));
  }

  function formatPurchaseOwnerCell(row) {
    if (!row) return "—";
    return "相对方.王红";
  }

  function syncOwnerFieldsFromPurchaseModal(row) {
    if (!row) return;
    var hc = document.getElementById("mHandlerContract");
    var hb = document.getElementById("mHandlerBiz");
    var hp = document.getElementById("mHandlerParty");
    if (hc) row.handlerContract = String(hc.value || "").trim();
    if (hb) row.handlerBiz = String(hb.value || "").trim();
    if (hp) row.handlerParty = String(hp.value || "").trim();
    row.creator = row.handlerContract || row.handlerBiz || row.handlerParty || "";
    var sel = document.getElementById("mCtype");
    var exAmt = document.getElementById("mExecAmount");
    if (sel && sel.value === "框架协议" && exAmt) {
      var ev = String(exAmt.value || "").trim();
      var n = cmParseAmountInput(ev);
      row.execAmount = ev === "" || !isFinite(n) ? "" : n;
    } else {
      row.execAmount = "";
    }
    function parseFinNum(v) {
      var s = String(v == null ? "" : v).trim();
      if (s === "") return "";
      var n = parseFloat(s);
      return isFinite(n) ? n : "";
    }
    var inTb = document.getElementById("mInBody");
    if (inTb) {
      var inLines = [];
      inTb.querySelectorAll("tr").forEach(function (tr) {
        var a = tr.querySelector("[data-k='inAmt']");
        var d = tr.querySelector("[data-k='inDate']");
        var p = tr.querySelector("[data-k='inProg']");
        var r = tr.querySelector("[data-k='inRm']");
        inLines.push({
          inAmount: a ? parseFinNum(a.value) : "",
          inTime: d ? String(d.value || "").trim() : "",
          inProgress: p ? String(p.value || "").trim() : "",
          inRemark: r ? String(r.value || "").trim() : ""
        });
      });
      row.inLedgerLines = inLines;
      if (inLines.length) {
        var fi = inLines[0];
        row.inAmount = fi.inAmount === "" ? "" : fi.inAmount;
        row.inTime = fi.inTime || "";
        row.inProgress =
          fi.inProgress !== "" && fi.inProgress != null ? String(fi.inProgress).replace(/%/g, "") + "%" : "";
        row.inRemark = fi.inRemark || "";
      }
    }
    var payTb = document.getElementById("mPayBody");
    if (payTb) {
      var payLines = [];
      payTb.querySelectorAll("tr").forEach(function (tr) {
        var a = tr.querySelector("[data-k='payAmt']");
        var d = tr.querySelector("[data-k='payDate']");
        var p = tr.querySelector("[data-k='payProg']");
        var r = tr.querySelector("[data-k='payRm']");
        payLines.push({
          payAmount: a ? parseFinNum(a.value) : "",
          payTime: d ? String(d.value || "").trim() : "",
          payProg: p ? String(p.value || "").trim() : "",
          payRemark: r ? String(r.value || "").trim() : ""
        });
      });
      row.payLedgerLines = payLines;
      if (payLines.length) {
        var fp = payLines[0];
        row.payAmount = fp.payAmount === "" ? "" : fp.payAmount;
        row.payTime = fp.payTime || "";
        row.payRemark = fp.payRemark || "";
      }
    }
  }

  function ensureContractRowDefaults(r, isChild) {
    if (!r) return;
    if (
      (r.handlerContract == null || r.handlerContract === "") &&
      (r.handlerBiz == null || r.handlerBiz === "") &&
      (r.handlerParty == null || r.handlerParty === "") &&
      r.creator
    ) {
      r.handlerContract = r.creator;
    }
    if (!r.dept) r.dept = "经营发展中心";
    if (!r.targetType) r.targetType = "物资";
    if (!r.mdm) r.mdm = isChild ? "MDM-CG-2026-011" : "MDM-CG-2026-001";
    if (!r.payWay) r.payWay = "转账/电汇";
    if (!r.payRatio) r.payRatio = "30:60:10";
    if (!r.validPeriod) r.validPeriod = "2026-01-01~2026-12-31";
    if (!r.warranty) r.warranty = "12个月";
    if (!r.inTime) r.inTime = "2026-03-15";
    if (!r.inProgress) r.inProgress = isChild ? "40%" : "60%";
    if (!r.payAmount && r.payAmount !== 0) r.payAmount = isChild ? 120 : Number(r.executed) || 0;
    if (!r.payTime) r.payTime = isChild ? "2026-04-05" : "2026-04-10";
    if (!r.stage) r.stage = "S1";
    if (!r.materialName) r.materialName = isChild ? "IGBT驱动板" : "变流器模块";
    if (!r.spec) r.spec = isChild ? "V3.1" : "V2.0";
    if (!r.materialType) r.materialType = isChild ? "电子元件" : "电子产品";
    if (!r.unitPrice && r.unitPrice !== 0) r.unitPrice = isChild ? 280 : 35000;
    if (!r.qty && r.qty !== 0) r.qty = isChild ? 100 : 10;
    if (!r.taxRate) r.taxRate = "13%";
    if (!Array.isArray(r.materials) || !r.materials.length) {
      r.materials = [
        {
          id: "m-" + r.id + "-1",
          name: r.materialName || (isChild ? "IGBT驱动板" : "变流器模块"),
          spec: r.spec || (isChild ? "V3.1" : "V2.0"),
          type: r.materialType || (isChild ? "电子元件" : "电子产品"),
          qty: r.qty || (isChild ? 100 : 10),
          unit: "个",
          unitPrice: r.unitPrice || (isChild ? 280 : 35000),
          taxRate: r.taxRate || "13%",
          totalPrice: ((Number(r.qty || 0) || 0) * (Number(r.unitPrice || 0) || 0)).toFixed(2),
          remark: ""
        }
      ];
    }
  }

  function opButtonsPurchase(row, isChild) {
    var html = [];
    function add(label, act) {
      html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="' + act + '" data-id="' + row.id + '">' + label + "</button>");
    }
    add("编辑", "fill");
    add("查看", "view");
    add("删除", "delete");
    return '<span class="cm-ops">' + html.join("") + "</span>";
  }

  function opButtonsSales(row) {
    if (CTX.role === "director") {
      return (
        '<span class="cm-ops"><button type="button" class="carrier-btn-add cm-btn-op" data-act="detailS" data-id="' +
        row.id +
        '">查看详情</button><button type="button" class="carrier-btn-add cm-btn-op" data-act="progressS" data-id="' +
        row.id +
        '">查看进度</button></span>'
      );
    }
    var st = row.status;
    var u = currentUserLabel();
    var html = [];
    var showDetail = function () { html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="detailS" data-id="' + row.id + '">查看详情</button>'); };
    var showProgress = function () { html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="progressS" data-id="' + row.id + '">查看进度</button>'); };
    if (st === "草稿" && row.creator === u) {
      html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="editS" data-id="' + row.id + '">编辑</button>');
      html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="submitS" data-id="' + row.id + '">提交</button>');
      html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="deleteS" data-id="' + row.id + '">删除</button>');
    } else if (st === "审批中" && row.creator === u) {
      showDetail();
      html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="withdrawS" data-id="' + row.id + '">撤回</button>');
      showProgress();
    } else if (st === "审批中" && row.pendingApprover && u === "王超" && CTX.role === "corp_purchase_head") {
      showDetail();
      html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="approveS" data-id="' + row.id + '">审批</button>');
      showProgress();
    } else if (st === "已生效") {
      showDetail();
      showProgress();
      if (canShowFinanceOps()) html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="financeRecvS" data-id="' + row.id + '">填写收款信息</button>');
      if (CTX.role === "corp_purchase_specialist" || CTX.role === "dept_buyer") html.push('<button type="button" class="carrier-btn-add cm-btn-op" data-act="shipGenS" data-id="' + row.id + '">生成发货单</button>');
    } else {
      showDetail();
      showProgress();
    }
    return '<span class="cm-ops">' + html.join("") + "</span>";
  }

  function filterPurchase(rows) {
    var fc = (document.getElementById("cmFCode") && document.getElementById("cmFCode").value.trim()) || "";
    var fn = (document.getElementById("cmFName") && document.getElementById("cmFName").value.trim()) || "";
    var fs = (document.getElementById("cmFParty") && document.getElementById("cmFParty").value.trim()) || "";
    var ft = (document.getElementById("cmFCtype") && document.getElementById("cmFCtype").value) || "";
    var st = (document.getElementById("cmFStatus") && document.getElementById("cmFStatus").value) || "";
    var d0 = (document.getElementById("cmFDate0") && document.getElementById("cmFDate0").value) || "";
    var d1 = (document.getElementById("cmFDate1") && document.getElementById("cmFDate1").value) || "";

    function matchRow(r) {
      var rg = contractRoleGroup();
      if (rg === "filler" || rg === "approver") {
        if ((r.dept || "经营发展中心") !== "经营发展中心") return false;
      }
      if (fc && r.code.indexOf(fc) < 0) return false;
      if (fn && r.name.indexOf(fn) < 0) return false;
      if (fs && (r.supplier || "").indexOf(fs) < 0) return false;
      if (ft && r.ctype !== ft) return false;
      if (st && normalizeContractStatus(r.status) !== st) return false;
      if (d0 && r.signed < d0) return false;
      if (d1 && r.signed > d1) return false;
      return true;
    }

    return rows.filter(function (r) {
      if (!matchRow(r)) return false;
      return true;
    });
  }

  function renderPurchaseTable() {
    var tb = document.getElementById("cmTableBody");
    if (!tb) return;
    var roots = filterPurchase(CTX.purchaseRoots);
    var lines = [];

    roots.forEach(function (root) {
      ensureContractRowDefaults(root, false);
      var hasCh = (root.children || []).length > 0;

      lines.push(
        "<tr class='cm-tr-parent' data-rid='" +
          root.id +
          "' data-row-id='" + root.id +
          "'>" +
          "<td><input type='checkbox' class='cm-row-chk' data-id='" + escapeHtml(root.id) + "'><span class='cm-tree-leaf'></span></td>" +
          "<td>" + escapeHtml(purchaseListMergedCell(root)) + "</td>" +
          "<td>" + escapeHtml(purchaseListExecCell(root)) + "</td>" +
          "<td>" + escapeHtml(root.signed) + "</td>" +
          "<td>" + escapeHtml(getOwningCompanyLabel()) + "</td>" +
          "<td>" + escapeHtml(root.dept) + "</td>" +
          "<td>" + escapeHtml(root.supplier) + "</td>" +
          "<td>" + escapeHtml(root.name) + "</td>" +
          "<td>" + escapeHtml(formatPurchaseOwnerCell(root)) + "</td>" +
          "<td>" + escapeHtml(root.spNo || "—") + "</td>" +
          "<td>" + escapeHtml(root.targetType) + "</td>" +
          "<td>" + escapeHtml(root.mdm) + "</td>" +
          "<td class='cell-num'>" + root.amount + "</td>" +
          "<td>" + escapeHtml(root.payWay) + "</td>" +
          "<td>" + escapeHtml(root.payRatio) + "</td>" +
          "<td>" + escapeHtml(root.validPeriod) + "</td>" +
          "<td>" + escapeHtml(root.warranty) + "</td>" +
          "<td>" + (CTX.inlineEdit ? '<span style=\"color:#1677ff;font-weight:600\">编辑中</span>' : opButtonsPurchase(root, false)) + "</td>" +
          "</tr>"
      );
      if (CTX.inlineEdit) {
        lines.push(renderMaterialDetailRow(root));
      }

      if (hasCh) {
        root.children.forEach(function (ch) {
          ensureContractRowDefaults(ch, true);
          lines.push(
            "<tr class='cm-tr-child' data-row-id='" + ch.id + "'>" +
              "<td><input type='checkbox' class='cm-row-chk' data-id='" + escapeHtml(ch.id) + "'></td>" +
              "<td class='cm-indent'>" + escapeHtml(purchaseListMergedCell(ch)) + "</td>" +
              "<td class='cm-indent'>" + escapeHtml(purchaseListExecCell(ch)) + "</td>" +
              "<td>" + escapeHtml(ch.signed) + "</td>" +
              "<td>" + escapeHtml(getOwningCompanyLabel()) + "</td>" +
              "<td>" + escapeHtml(ch.dept) + "</td>" +
              "<td>" + escapeHtml(ch.supplier) + "</td>" +
              "<td>" + escapeHtml(ch.name) + "</td>" +
              "<td>" + escapeHtml(formatPurchaseOwnerCell(ch)) + "</td>" +
              "<td>" + escapeHtml(ch.spNo || "—") + "</td>" +
              "<td>" + escapeHtml(ch.targetType) + "</td>" +
              "<td>" + escapeHtml(ch.mdm) + "</td>" +
              "<td class='cell-num'>" + ch.amount + "</td>" +
              "<td>" + escapeHtml(ch.payWay) + "</td>" +
              "<td>" + escapeHtml(ch.payRatio) + "</td>" +
              "<td>" + escapeHtml(ch.validPeriod) + "</td>" +
              "<td>" + escapeHtml(ch.warranty) + "</td>" +
              "<td>" + (CTX.inlineEdit ? '<span style=\"color:#1677ff;font-weight:600\">编辑中</span>' : opButtonsPurchase(ch, true)) + "</td>" +
              "</tr>"
          );
          if (CTX.inlineEdit) {
            lines.push(renderMaterialDetailRow(ch));
          }
        });
      }
    });

    tb.innerHTML = lines.join("") || "<tr><td colspan='18' class='cm-empty'>暂无数据</td></tr>";
    if (CTX.inlineEdit) applyContractInlineEditors();
  }

  function statusTag(s) {
    var cls = "tag-status tag-status--to-shelf";
    if (s === "已生效") cls = "tag-status tag-status--in-use";
    if (s === "草稿") cls = "tag-status tag-status--isolate";
    if (s === "审批中") cls = "tag-status tag-status--to-shelf";
    if (s === "已终止") cls = "tag-status tag-status--isolate";
    return '<span class="' + cls + '">' + escapeHtml(s) + "</span>";
  }

  function renderSalesTable() {
    var tb = document.getElementById("cmTableBody");
    var list = CTX.salesList.filter(function (r) {
      var fc = (document.getElementById("cmFCode") && document.getElementById("cmFCode").value.trim()) || "";
      var fn = (document.getElementById("cmFName") && document.getElementById("cmFName").value.trim()) || "";
      var fs = (document.getElementById("cmFParty") && document.getElementById("cmFParty").value.trim()) || "";
      if (fc && r.code.indexOf(fc) < 0) return false;
      if (fn && r.name.indexOf(fn) < 0) return false;
      if (fs && r.customer.indexOf(fs) < 0) return false;
      return true;
    });
    tb.innerHTML = list
      .map(function (r) {
        return (
          "<tr>" +
          "<td></td>" +
          "<td>" + escapeHtml(r.code) + "</td>" +
          "<td>" + escapeHtml(r.name) + "</td>" +
          "<td>" + escapeHtml(r.ctype) + "</td>" +
          "<td>" + escapeHtml(r.customer) + "</td>" +
          "<td>国家能源集团</td>" +
          "<td>" + escapeHtml(r.signed) + "</td>" +
          "<td class='cell-num'>" + r.amount + "</td>" +
          "<td class='cell-num'>" + r.executed + "</td>" +
          "<td class='cell-num'>" + r.remain + "</td>" +
          "<td>银行转账</td>" +
          "<td>100%</td>" +
          "<td>2026-01-01~2026-12-31</td>" +
          "<td>12个月</td>" +
          "<td>2026-04-18</td>" +
          "<td class='cell-num'>" + r.executed + "</td>" +
          "<td>" + (r.remain === "0" ? "100%" : "进行中") + "</td>" +
          "<td>S1</td>" +
          "<td>变流器模块</td>" +
          "<td>V2.0</td>" +
          "<td>14</td>" +
          "<td class='cell-num'>91,857.14</td>" +
          "<td>13%</td>" +
          "<td class='cell-num'>" + r.amount + "</td>" +
          "<td>ORD-2026-009</td>" +
          "<td>-</td>" +
          "<td>" + opButtonsSales(r) + "</td>" +
          "</tr>"
        );
      })
      .join("") || "<tr><td colspan='27' class='cm-empty'>暂无数据</td></tr>";
  }

  function renderMaterialDetailRow(row) {
    ensureContractRowDefaults(row, row.rowType === "exec");
    var head =
      "<tr><th>物资名称</th><th>产品型号</th><th>物资类别</th><th>采购数量</th><th>单位</th><th>采购单价(含税)</th><th>税率</th><th>采购总价(含税)</th><th>备注</th>" +
      (CTX.inlineEdit ? "<th>操作</th>" : "") +
      "</tr>";
    var body = (row.materials || [])
      .map(function (m) {
        if (CTX.inlineEdit) {
          return (
            "<tr data-mat-row-id='" + row.id + "' data-mat-id='" + m.id + "'>" +
            "<td><input class='carrier-search cm-mat-input' data-k='name' value='" + escapeHtml(m.name) + "'/></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='spec' value='" + escapeHtml(m.spec) + "'/></td>" +
            "<td><select class='carrier-select cm-mat-input' data-k='type'><option" + (m.type === "生产类" ? " selected" : "") + ">生产类</option><option" + (m.type === "销售类" ? " selected" : "") + ">销售类</option><option" + (m.type === "办公类" ? " selected" : "") + ">办公类</option><option" + (m.type === "电子产品" ? " selected" : "") + ">电子产品</option><option" + (m.type === "电子元件" ? " selected" : "") + ">电子元件</option></select></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='qty' type='number' value='" + escapeHtml(m.qty) + "'/></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='unit' value='" + escapeHtml(m.unit) + "'/></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='unitPrice' type='number' value='" + escapeHtml(m.unitPrice) + "'/></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='taxRate' value='" + escapeHtml(m.taxRate) + "'/></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='totalPrice' type='number' value='" + escapeHtml(m.totalPrice) + "'/></td>" +
            "<td><input class='carrier-search cm-mat-input' data-k='remark' value='" + escapeHtml(m.remark || "") + "'/></td>" +
            "<td><button type='button' class='carrier-btn-add cm-btn-op' data-mat-del='" + m.id + "' data-row-id='" + row.id + "'>删除</button></td>" +
            "</tr>"
          );
        }
        return (
          "<tr>" +
          "<td>" + escapeHtml(m.name) + "</td>" +
          "<td>" + escapeHtml(m.spec) + "</td>" +
          "<td>" + escapeHtml(m.type) + "</td>" +
          "<td>" + escapeHtml(m.qty) + "</td>" +
          "<td>" + escapeHtml(m.unit) + "</td>" +
          "<td>" + escapeHtml(m.unitPrice) + "</td>" +
          "<td>" + escapeHtml(m.taxRate) + "</td>" +
          "<td>" + escapeHtml(m.totalPrice) + "</td>" +
          "<td>" + escapeHtml(m.remark || "—") + "</td>" +
          "</tr>"
        );
      })
      .join("");
    var addBtn = CTX.inlineEdit
      ? "<div style='margin:8px 0'><button type='button' class='carrier-btn-add cm-btn-op' data-mat-add='" + row.id + "'>添加物资行</button></div>"
      : "";
    return (
      "<tr class='cm-tr-material'><td colspan='25'>" +
      "<div style='padding:8px 12px;background:#fbfdff;border:1px dashed #d9e6f2;border-radius:8px'>" +
      "<div style='font-weight:600;color:#1f3551;margin-bottom:6px'>合同物资明细</div>" +
      addBtn +
      "<div class='carrier-table-wrap'><table class='carrier-table'>" + head + "<tbody>" + body + "</tbody></table></div>" +
      "</div></td></tr>"
    );
  }

  function findPurchaseRowById(id) {
    var hit = null;
    CTX.purchaseRoots.forEach(function (r) {
      if (r.id === id) hit = r;
      (r.children || []).forEach(function (c) {
        if (c.id === id) hit = c;
      });
    });
    return hit;
  }

  function cMakeInput(value, type) {
    var el = document.createElement("input");
    el.className = "carrier-search";
    el.style.border = "0";
    el.style.boxShadow = "none";
    el.style.background = "transparent";
    el.style.padding = "4px 6px";
    el.value = value == null ? "" : String(value);
    if (type) el.type = type;
    if (type === "number") el.step = "0.01";
    return el;
  }

  function cMakeSelect(value, options) {
    var el = document.createElement("select");
    el.className = "carrier-select";
    el.style.border = "0";
    el.style.boxShadow = "none";
    el.style.background = "transparent";
    el.style.padding = "4px 6px";
    options.forEach(function (x) {
      var o = document.createElement("option");
      o.value = x;
      o.textContent = x;
      if (String(value || "") === x) o.selected = true;
      el.appendChild(o);
    });
    return el;
  }

  function applyContractInlineEditors() {
    var tb = document.getElementById("cmTableBody");
    if (!tb || CTX.tab !== "purchase") return;
    tb.querySelectorAll("tr[data-row-id]").forEach(function (tr) {
      var id = tr.getAttribute("data-row-id");
      var row = null;
      CTX.purchaseRoots.forEach(function (r) {
        if (r.id === id) row = r;
        (r.children || []).forEach(function (c) {
          if (c.id === id) row = c;
        });
      });
      if (!row) return;
      var tds = tr.querySelectorAll("td");
      if (tds.length < 17) return;
      function put(idx, el, field, parser) {
        if (!tds[idx]) return;
        tds[idx].innerHTML = "";
        tds[idx].appendChild(el);
        el.addEventListener("change", function () {
          row[field] = parser ? parser(el.value) : el.value;
        });
      }
      if (tds[1]) {
        tds[1].innerHTML = "";
        if (row.rowType === "exec") {
          tds[1].textContent = purchaseListMergedCell(row);
        } else {
          var inMerged = cMakeInput(purchaseListMergedCell(row));
          tds[1].appendChild(inMerged);
          inMerged.addEventListener("change", function () {
            row.code = mergeDisplayToStorageCode(row.rowType, inMerged.value);
          });
        }
      }
      if (tds[2]) {
        tds[2].innerHTML = "";
        if (row.rowType === "exec") {
          var inEx = cMakeInput(purchaseListExecCell(row));
          tds[2].appendChild(inEx);
          inEx.addEventListener("change", function () {
            row.code = execDisplayToStorageCode(inEx.value);
          });
        } else {
          tds[2].textContent = "";
        }
      }
      put(3, cMakeInput(row.signed, "date"), "signed");
      put(4, cMakeInput(row.dept), "dept");
      put(5, cMakeInput(row.supplier), "supplier");
      put(6, cMakeInput(row.name), "name");
      if (tds[7]) {
        tds[7].innerHTML = "";
        var wrap = document.createElement("div");
        wrap.className = "cm-handler-row-inner";
        wrap.style.gap = "6px";
        [["合同经办", "handlerContract"], ["业务经办", "handlerBiz"], ["相对方经办", "handlerParty"]].forEach(function (pair) {
          var cell = document.createElement("div");
          cell.style.display = "flex";
          cell.style.flexDirection = "column";
          cell.style.gap = "2px";
          cell.style.minWidth = "0";
          var lab = document.createElement("span");
          lab.style.fontSize = "11px";
          lab.style.color = "#62788f";
          lab.textContent = pair[0];
          var inpH = cMakeInput(row[pair[1]] || "");
          inpH.style.fontSize = "12px";
          inpH.setAttribute("data-handler-field", pair[1]);
          inpH.addEventListener("change", function () {
            row[pair[1]] = inpH.value;
            row.creator = row.handlerContract || row.handlerBiz || row.handlerParty || "";
          });
          cell.appendChild(lab);
          cell.appendChild(inpH);
          wrap.appendChild(cell);
        });
        tds[7].appendChild(wrap);
      }
      put(8, cMakeInput(row.spNo), "spNo");
      put(9, cMakeSelect(row.targetType, ["物资", "服务", "工程"]), "targetType");
      put(10, cMakeInput(row.mdm), "mdm");
      put(11, cMakeInput(row.amount, "number"), "amount", function (v) { return parseFloat(v) || 0; });
      put(12, cMakeSelect(row.payWay, ["转账/电汇", "银行转账", "电汇", "承兑"]), "payWay");
      put(13, cMakeInput(row.payRatio), "payRatio");
      put(14, cMakeInput(row.validPeriod), "validPeriod");
      put(15, cMakeInput(row.warranty), "warranty");
    });
  }

  function refreshTable() {
    if (CTX.tab === "sales") renderSalesTable();
    else renderPurchaseTable();
  }

  function switchTab(t) {
    CTX.tab = t;
    document.querySelectorAll(".cm-tab").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-tab") === t);
    });
    var partyLab = document.getElementById("cmToolbarPartyLab");
    if (partyLab) partyLab.textContent = t === "purchase" ? "供应商名称" : "客户名称";
    var thead = document.getElementById("cmThead");
    if (thead) {
      thead.innerHTML =
        t === "purchase"
          ? "<tr><th rowspan='2' style='width:44px'></th><th colspan='11'>基础信息</th><th colspan='5'>签订信息</th><th rowspan='2' style='min-width:280px'>操作</th></tr><tr><th>框架协议号/常规合同编号</th><th>执行合同编号</th><th>签订时间</th><th>所属公司</th><th>归属部门</th><th>供应商名称</th><th>合同名称</th><th>经办人</th><th>采购标包编号</th><th>采购标的类别</th><th>法务系统MDM编码</th><th>合同金额（万元） " + hint("框架协议，如有采购标包编号，则等于:采购流程-中标/成交金额。且可手动修改并备注修改原因。框架协议下的执行合同，与框架协议具有父子关系，且之和小等于框架协议。常规合同，如有采购标包编号，则等于:采购流程-中标/成交金额。且可手动修改并备注修改原因。") + "</th><th>付款方式</th><th>付款比例%</th><th>合同有效期</th><th>质保期</th></tr>"
          : "<tr><th style='width:44px'></th><th>合同编号（XS-开头）</th><th>合同名称</th><th>合同类型</th><th>客户名称</th><th>相对方</th><th>签订时间</th><th>合同金额</th><th>已收款金额</th><th>剩余金额</th><th>付款方式</th><th>付款比例</th><th>合同有效期</th><th>质保期</th><th>收款时间</th><th>收款金额</th><th>收款进度</th><th>阶段号</th><th>物资名称</th><th>产品型号</th><th>销售数量</th><th>销售单价（含税）</th><th>税率</th><th>销售总价（含税）</th><th>关联订单号</th><th>备注</th><th style='min-width:220px'>操作</th></tr>";
    }
    refreshTable();
  }

  /* ---------- 弹窗 ---------- */
  function closeAll() {
    document.querySelectorAll(".cm-modal-mask").forEach(function (m) {
      m.classList.remove("show");
    });
    if (CTX.pendingNewContract && CTX.editingId === CTX.pendingNewContract.id) {
      CTX.pendingNewContract = null;
    }
  }

  function resolveEditingContractRow() {
    var row = findPurchaseRowById(CTX.editingId);
    if (row) return row;
    if (CTX.pendingNewContract && CTX.pendingNewContract.id === CTX.editingId) {
      return CTX.pendingNewContract;
    }
    return null;
  }

  function showCmSystemTip(message) {
    var mask = document.getElementById("cmModalSystemTip");
    var text = document.getElementById("cmSystemTipText");
    if (text) text.textContent = message || "";
    if (mask) mask.classList.add("show");
  }

  function hideCmSystemTip() {
    var mask = document.getElementById("cmModalSystemTip");
    if (mask) mask.classList.remove("show");
  }

  /** 仅显示顶层遮罩，不关闭 #cmModalEdit（用于修改原因等叠层） */
  function showModalLayer(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("show");
  }

  function hideModalLayer(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("show");
  }

  function hideCmReasonModal() {
    hideModalLayer("cmModalReason");
  }

  function showCmExecWarnStyled(message) {
    var t = document.getElementById("cmExecWarnText");
    if (t) t.textContent = message || "";
    showModalLayer("cmModalExecWarn");
  }

  function hideCmExecWarnModal() {
    hideModalLayer("cmModalExecWarn");
  }

  /** 框架协议：执行合同金额不得大于框架协议金额（#mAmount） */
  function validateCmExecAmountAgainstFrameworkShow() {
    var ctypeEl = document.getElementById("mCtype");
    var wrap = document.getElementById("mExecAmountWrap");
    var exEl = document.getElementById("mExecAmount");
    var amtEl = document.getElementById("mAmount");
    if (!ctypeEl || ctypeEl.value !== "框架协议") return;
    if (!wrap || wrap.style.display === "none") return;
    if (!exEl || !amtEl) return;
    if (String(exEl.value || "").trim() === "") return;
    var ex = cmParseAmountInput(exEl.value);
    var cap = cmParseAmountInput(amtEl.value);
    if (!isFinite(ex) || !isFinite(cap) || cap <= 0) return;
    if (ex > cap + 1e-6) {
      showCmExecWarnStyled(
        "执行合同金额（" +
          ex.toFixed(2) +
          " 万元）不能大于框架协议金额（" +
          cap.toFixed(2) +
          " 万元），请核对。"
      );
    }
  }

  function openModal(id) {
    document.querySelectorAll(".cm-modal-mask").forEach(function (m) {
      m.classList.remove("show");
    });
    var el = document.getElementById(id);
    if (el) el.classList.add("show");
  }
  function openUnifiedProgressModal() {
    if (typeof window.openUnifiedProgressModal === "function" && window.openUnifiedProgressModal()) {
      return;
    }
    var mask = document.getElementById("mapUnifiedProgressModal");
    if (!mask && typeof window.ensureUnifiedProgressModal === "function") {
      mask = window.ensureUnifiedProgressModal();
    }
    if (mask) {
      mask.classList.add("show");
      return;
    }
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.style.display = "none";
    trigger.setAttribute("data-act", "progress");
    trigger.textContent = "查看进度";
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
  }

  function renderCmFormFooter(mode) {
    var ft = document.querySelector("#cmModalEdit .cm-dialog-ft");
    if (!ft) return;
    if (mode === "view") {
      ft.innerHTML =
        '<button type="button" class="carrier-btn-add" data-close style="background:#fff;color:#595959;border:1px solid #d9d9d9">取消</button>';
      return;
    }
    if (mode === "approve") {
      ft.innerHTML =
        '<button type="button" class="carrier-btn-add" data-form-act="approvePass" style="background:#f6ffed;color:#389e0d;border:1px solid #b7eb8f">审批通过</button>' +
        '<button type="button" class="carrier-btn-add" data-form-act="approveReject" style="background:#fff1f0;color:#cf1322;border:1px solid #ffccc7">驳回</button>' +
        '<button type="button" class="carrier-btn-add" data-close style="background:#fff;color:#595959;border:1px solid #d9d9d9">取消</button>';
      return;
    }
    ft.innerHTML =
      '<button type="button" class="carrier-btn-add" data-form-act="submit">保存</button>' +
      '<button type="button" class="carrier-btn-add" data-close style="background:#fff;color:#595959;border:1px solid #d9d9d9">取消</button>';
  }

  /** 付款金额不得大于合同总金额（#mAmount：框架协议或常规合同）；多行时逐行校验 */
  function validateCmPayAmountAgainstContract() {
    var amtEl = document.getElementById("mAmount");
    var tbody = document.getElementById("mPayBody");
    if (!amtEl || !tbody) return;
    var cap = cmParseAmountInput(amtEl.value);
    if (!isFinite(cap) || cap <= 0) return;
    var warned = false;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      var payEl = tr.querySelector("[data-k='payAmt']");
      if (!payEl || warned) return;
      var rawPay = String(payEl.value || "").trim();
      if (rawPay === "") return;
      var pay = parseFloat(rawPay);
      if (!isFinite(pay)) return;
      if (pay > cap + 1e-6) {
        warned = true;
        showCmSystemTip(
          "付款金额（" +
            pay.toFixed(2) +
            " 万元）大于合同总金额（" +
            cap.toFixed(2) +
            " 万元），请核对。"
        );
      }
    });
  }

  /** 入票金额不得大于合同总金额（#mAmount）；多行时逐行校验 */
  function validateCmInAmountAgainstContract() {
    var amtEl = document.getElementById("mAmount");
    var tbody = document.getElementById("mInBody");
    if (!amtEl || !tbody) return;
    var cap = cmParseAmountInput(amtEl.value);
    if (!isFinite(cap) || cap <= 0) return;
    var warned = false;
    tbody.querySelectorAll("tr").forEach(function (tr) {
      var inEl = tr.querySelector("[data-k='inAmt']");
      if (!inEl || warned) return;
      var raw = String(inEl.value || "").trim();
      if (raw === "") return;
      var inv = parseFloat(raw);
      if (!isFinite(inv)) return;
      if (inv > cap + 1e-6) {
        warned = true;
        showCmSystemTip(
          "入票金额（" +
            inv.toFixed(2) +
            " 万元）大于合同总金额（" +
            cap.toFixed(2) +
            " 万元），请核对。"
        );
      }
    });
  }

  function buildEditModal() {
    var amountHintText =
      "框架协议，如有采购标包编号，则等于:采购流程-中标/成交金额。且可手动修改并备注修改原因。" +
      "框架协议下的执行合同，与框架协议具有父子关系，且之和小等于框架协议。" +
      "常规合同，如有采购标包编号，则等于:采购流程-中标/成交金额。且可手动修改并备注修改原因。";
    var h =
      "<div class='cm-form-grid'>" +
      "<div class='cm-form-full'><label>合同类型</label><select id='mCtype'><option>框架协议</option><option>常规合同</option></select></div>" +
      "<div id='mParentWrap' style='display:none'><label>父框架协议</label><select id='mParent'><option>CG-KJ-2026-001 电控备件年度框架协议</option></select></div>" +
      "</div>" +
      "<h4 class='cm-form-seg'>基础信息</h4>" +
      "<div class='cm-form-grid cm-form-grid-2'>" +
      "<div><label for='mCode'><span id='mCodeLabelText'>框架协议编码</span><span id='mCodeHintSlot'></span></label><input id='mCode' class='carrier-search' placeholder='请输入合同编码' /></div>" +
      "<div id='mExecCodeWrap' style='display:none'><label>执行合同编码 " + hint("与框架协议具有父子关系") + "</label><input id='mExecCode' class='carrier-search' placeholder='如：ZX-2026-001' /></div>" +
      "<div id='mDateWrap'><label>签订时间</label><input id='mDate' type='date' class='carrier-search' /></div>" +
      "<div><label>所属公司</label><input id='mOwningCompany' class='carrier-search' readonly /></div>" +
      "<div><label>归属部门</label><select class='carrier-select' id='mDept'>" +
      "<option value=''>请选择归属部门</option>" +
      "<option>龙源电力集团股份有限公司本部</option>" +
      "<option>海上项目事业部</option>" +
      "<option>财务产权部</option>" +
      "<option>科技信息部</option>" +
      "<option>党建工作部（党委宣传部、工会办公室、团委）</option>" +
      "<option>纪委办公室（党委巡察办公室）</option>" +
      "<option>审计部</option>" +
      "<option>证券事务与投资者关系部（董事会办公室）</option>" +
      "<option>企业管理与法律事务部</option>" +
      "<option>工程建设部</option>" +
      "<option>组织人事部（人力资源部）</option>" +
      "<option>综合管理部（党委办公室）</option>" +
      "<option>巡视员</option>" +
      "<option>总师总助</option>" +
      "<option>领导班子</option>" +
      "<option>巡察组</option>" +
      "<option>规划发展部（基地项目办公室、新能源政策研究和经济评价中心）</option>" +
      "<option>安全环保监督部</option>" +
      "<option>采购与物资管理部</option>" +
      "<option>财务共享中心</option>" +
      "<option>市场营销部</option>" +
      "<option>外派人员</option>" +
      "<option>新疆龙源新能源有限公司</option>" +
      "<option>甘肃龙源新能源有限公司</option>" +
      "<option>宁夏龙源新能源有限公司</option>" +
      "<option>陕西龙源新能源有限公司</option>" +
      "<option>青海龙源新能源有限公司</option>" +
      "<option>黑龙江龙源新能源发展有限公司</option>" +
      "<option>吉林龙源新能源有限公司</option>" +
      "</select></div>" +
      "<div><label>供应商名称 " +
      hint("无采购标包编号：下拉选择供应商；有采购标包编号：自动等于「采购流程-」+ 采购信息台帐该行「中标/成交供应商」") +
      "</label><input type='hidden' id='mSupplier' value=''/><div id='cmSupplierDdRoot'></div></div>" +
      "<div><label>合同名称</label><input id='mName' class='carrier-search' placeholder='请输入合同名称' /></div>" +
      "<div class='cm-form-full cm-handler-row' style='grid-column:1/-1'>" +
      "<div class='cm-handler-row-inner'>" +
      "<div style='display:grid;grid-template-rows:minmax(40px,auto) auto;gap:6px;min-width:0'>" +
      "<label for='mHandlerContract' style='align-self:start;margin:0'>合同经办人</label>" +
      "<input id='mHandlerContract' class='carrier-search' placeholder='请输入姓名' /></div>" +
      "<div style='display:grid;grid-template-rows:minmax(40px,auto) auto;gap:6px;min-width:0'>" +
      "<label for='mHandlerBiz' style='align-self:start;margin:0'>业务经办人</label>" +
      "<input id='mHandlerBiz' class='carrier-search' placeholder='请输入姓名' /></div>" +
      "<div style='display:grid;grid-template-rows:minmax(40px,auto) auto;gap:6px;min-width:0'>" +
      "<label for='mHandlerParty' style='align-self:start;margin:0'>相对方经办人</label>" +
      "<input id='mHandlerParty' class='carrier-search' placeholder='请输入姓名' /></div>" +
      "</div></div>" +
      "<div class='cm-ledger-pick' id='cmSpNoPickWrap'>" +
      "<label><span>采购标包编号</span> " +
      hint("有采购流程为首选必填项") +
      "</label>" +
      "<div class='cm-ledger-pick-trigger'>" +
      "<input type='text' id='mSpNo' readonly class='carrier-search cm-ledger-pick-display' placeholder='有采购流程为首选必填项' autocomplete='off' />" +
      "<button type='button' class='cm-ledger-pick-arrow' id='cmSpNoToggle' aria-expanded='false' aria-label='展开台账选择'>▾</button>" +
      "</div>" +
      "<div class='cm-ledger-pick-panel' id='cmSpNoPanel'>" +
      "<input type='search' id='cmSpNoSearch' class='carrier-search cm-ledger-pick-search' placeholder='搜索项目名称或标包编号' autocomplete='off' />" +
      "<div class='cm-ledger-pick-table-wrap'>" +
      "<table class='cm-ledger-pick-table' role='listbox'><thead><tr><th>项目名称</th><th>标包编号</th></tr></thead><tbody id='cmSpNoTbody'></tbody></table>" +
      "</div></div>" +
      "<input type='hidden' id='mSpNoProject' value='' />" +
      "</div>" +
      "<div><label>采购标的类别</label><select class='carrier-select' id='mTarget'><option value=''>请选择</option><option>物资</option><option>服务</option><option>工程</option></select></div>" +
      "<div><label>法务系统MDM编码</label><input id='mMdm' class='carrier-search' placeholder='请输入法务系统MDM编码' /></div>" +
      "</div>" +
      "<h4 class='cm-form-seg'>签订信息</h4>" +
      "<div class='cm-form-grid cm-form-grid-2'>" +
      "<div class='cm-form-full' style='grid-column:1/-1'>" +
      "<div id='cmSignFirstRow' style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-items:stretch'>" +
      "<div style='display:grid;grid-template-rows:minmax(52px,auto) auto;gap:6px;min-width:0'>" +
      "<label style='align-self:start;margin:0'>" +
      "<span id='mAmountLabelText'>合同金额（万元）</span> " +
      hint(amountHintText) +
      " <span id='mAmtHint'></span></label>" +
      "<input id='mAmount' type='text' class='carrier-search' inputmode='decimal' autocomplete='off' />" +
      "</div>" +
      "<div id='mExecAmountWrap' style='display:none;grid-template-rows:minmax(52px,auto) auto;gap:6px;min-width:0'>" +
      "<label for='mExecAmount' style='align-self:start;margin:0'>执行合同金额（万元）</label>" +
      "<input id='mExecAmount' type='text' class='carrier-search' inputmode='decimal' autocomplete='off' placeholder=''/>" +
      "</div>" +
      "<div style='display:grid;grid-template-rows:minmax(52px,auto) auto;gap:6px;min-width:0'>" +
      "<label style='align-self:start;margin:0'>付款方式</label>" +
      "<input id='mPayWay' class='carrier-search' placeholder='转账/电汇'/>" +
      "</div></div></div>" +
      "<div><label>付款比例%</label><input id='mPayRate' class='carrier-search' placeholder='30:60:10'/></div>" +
      "<div><label>合同有效期</label><div class='cm-inline'><input type='date' id='mV0' class='carrier-search'/><span>—</span><input type='date' id='mV1' class='carrier-search'/></div></div>" +
      "<div><label>质保期</label><input id='mWarranty' class='carrier-search' /></div>" +
      "</div>" +
      "<div id='mFinBlock'>" +
      "<h4 class='cm-form-seg'>入账信息（财务部）</h4>" +
      "<div class='cm-table-actions'><button type='button' class='carrier-btn-add' id='mAddInLine'>添加入账信息</button></div>" +
      "<div class='carrier-table-wrap' style='max-height:180px;overflow:auto'><table class='carrier-table'><thead><tr>" +
      "<th>入票金额（万元） " +
      hint("小等于合同总金额") +
      "</th><th>入票时间</th><th>单个合同入票进度(%)</th><th>备注</th><th>操作</th></tr></thead><tbody id='mInBody'></tbody></table></div>" +
      "<h4 class='cm-form-seg'>付款信息（财务部）</h4>" +
      "<div class='cm-table-actions'><button type='button' class='carrier-btn-add' id='mAddPayLine'>添加付款信息</button></div>" +
      "<div class='carrier-table-wrap' style='max-height:180px;overflow:auto'><table class='carrier-table'><thead><tr>" +
      "<th>付款金额（万元） " +
      hint("小等于合同总金额") +
      "</th><th>付款时间</th><th>单个合同付款进度(%)</th><th>备注</th><th>操作</th></tr></thead><tbody id='mPayBody'></tbody></table></div>" +
      "<h4 class='cm-form-seg'>合同物资明细</h4>" +
      "<div class='cm-table-actions'><button type='button' class='carrier-btn-add' id='mAddLine'>添加物资</button></div>" +
      "<div class='carrier-table-wrap' style='max-height:220px;overflow-x:auto;overflow-y:auto'><table class='carrier-table' style='min-width:1200px'><thead><tr><th>产品名称</th><th>产品编码</th><th>产品型号</th><th>物资类别</th><th>物资类型名称</th><th>物资类型编码</th><th>采购单价(含税)</th><th>采购数量</th><th>税率%</th><th>备注</th><th>操作</th></tr></thead><tbody id='mMatBody'></tbody></table></div></div>";

    document.getElementById("cmModalEditBody").innerHTML = h;
    syncCmOwningCompanyField();
    function cmBlankFinInRowHtml() {
      return (
        "<tr><td><input type='number' class='carrier-search' data-k='inAmt' step='0.01' placeholder='小等于合同总金额'/></td>" +
        "<td><input type='date' class='carrier-search' data-k='inDate'/></td>" +
        "<td><input type='number' class='carrier-search' data-k='inProg' min='0' max='100'/></td>" +
        "<td><input class='carrier-search' data-k='inRm' placeholder=''/></td>" +
        "<td><button type='button' class='carrier-btn-add'>删除</button></td></tr>"
      );
    }
    function cmBlankFinPayRowHtml() {
      return (
        "<tr><td><input type='number' class='carrier-search' data-k='payAmt' step='0.01' placeholder='小等于合同总金额'/></td>" +
        "<td><input type='date' class='carrier-search' data-k='payDate'/></td>" +
        "<td><input type='number' class='carrier-search' data-k='payProg' min='0' max='100'/></td>" +
        "<td><input class='carrier-search' data-k='payRm' placeholder=''/></td>" +
        "<td><button type='button' class='carrier-btn-add'>删除</button></td></tr>"
      );
    }
    document.getElementById("mInBody").innerHTML = cmBlankFinInRowHtml();
    document.getElementById("mPayBody").innerHTML = cmBlankFinPayRowHtml();
    document.getElementById("mMatBody").innerHTML = "";
    initProcurementSpNoPicker();
    initCmSupplierDd();
    function getMaterialNameValue(tr) {
      if (!tr) return "";
      var hid = tr.querySelector("input[data-k='nameSel']");
      return hid ? String(hid.value || "").trim() : "";
    }
    function cmMatLineRestHtml() {
      return (
        "<td><input class='carrier-search' data-k='spec' value=''/></td><td><select class='carrier-select' data-k='type'><option value='' selected>请选择物资类别</option><option value='生产类'>生产类</option><option value='销售类'>销售类</option><option value='办公类'>办公类</option></select></td><td><input class='carrier-search' data-k='typeName' readonly style='background:#fafafa'/></td><td><input class='carrier-search' data-k='typeCode' readonly style='background:#fafafa'/></td><td><input type='number' class='carrier-search' data-k='price'/></td><td><input type='number' class='carrier-search' data-k='qty'/></td><td><input type='number' class='carrier-search' data-k='tax'/></td><td><input class='carrier-search' data-k='remark'/></td><td><button type='button' class='carrier-btn-add'>删除</button></td>"
      );
    }
    function cmFindProductByMaterialName(name) {
      if (!window.DemoProductCatalogData || !name) return null;
      var list = DemoProductCatalogData.flattenAllProducts();
      var i;
      for (i = 0; i < list.length; i++) {
        if (String(list[i].productName) === String(name)) return list[i];
      }
      var preset = CM_MAT_NAME_PRESET[name];
      if (preset && preset.typeCode) {
        for (i = 0; i < list.length; i++) {
          if (String(list[i].a) === String(preset.typeCode)) return list[i];
        }
      }
      return null;
    }
    function applyCmProductToRow(tr, product) {
      if (!tr || !product) return;
      var hid = tr.querySelector("input[data-k='nameSel']");
      var pid = tr.querySelector("input[data-k='productId']");
      var pb = tr.querySelector("input[data-k='productCode']");
      var disp = tr.querySelector("input[data-k='matNameDisplay']");
      var specEl = tr.querySelector("input[data-k='spec']");
      var typeEl = tr.querySelector("select[data-k='type']");
      var typeCodeEl = tr.querySelector("input[data-k='typeCode']");
      var typeNameEl = tr.querySelector("input[data-k='typeName']");
      if (hid) hid.value = product.productName || "";
      if (pid) pid.value = product.id || "";
      if (pb) pb.value = product.b || "";
      if (disp) disp.value = product.productName || "";
      if (specEl) specEl.value = product.model || "";
      if (typeCodeEl) typeCodeEl.value = product.a || "";
      if (typeNameEl) typeNameEl.value = product.typeName || product.productName || "";
    }
    function cmMatNameCellHtml() {
      return (
        "<td>" +
        '<input type="hidden" data-k="productId" value=""/>' +
        '<input type="hidden" data-k="nameSel" value=""/>' +
        '<input class="carrier-search" data-k="matNameDisplay" readonly placeholder="—" value="" style="background:#fafafa"/>' +
        "</td>"
      );
    }
    function cmProductCodeCellHtml() {
      return (
        "<td>" +
        '<input class="carrier-search" data-k="productCode" readonly placeholder="—" value="" style="background:#fafafa"/>' +
        "</td>"
      );
    }
    function cmCollectMatProductsFromBody() {
      var out = [];
      if (!window.DemoProductCatalogData) return out;
      var all = DemoProductCatalogData.flattenAllProducts();
      var tb = document.getElementById("mMatBody");
      if (!tb) return out;
      tb.querySelectorAll("tr").forEach(function (tr) {
        var pidEl = tr.querySelector("input[data-k='productId']");
        if (!pidEl || !pidEl.value) return;
        var p = all.find(function (x) {
          return String(x.id) === String(pidEl.value);
        });
        if (p) out.push(p);
      });
      return out;
    }
    function syncCmMatTypeSelectColor(sel) {
      if (!sel || sel.getAttribute("data-k") !== "type") return;
      sel.style.color = String(sel.value || "").trim() ? "#334155" : "#94a3b8";
    }
    function appendCmMatRow(product) {
      var tb = document.getElementById("mMatBody");
      if (!tb || !product) return;
      var tr = document.createElement("tr");
      tr.innerHTML = cmMatNameCellHtml() + cmProductCodeCellHtml() + cmMatLineRestHtml();
      tb.appendChild(tr);
      applyCmProductToRow(tr, product);
      syncCmMatTypeSelectColor(tr.querySelector("select[data-k='type']"));
    }
    function openCmMatMultiPicker() {
      if (!window.DemoProductCatalogPicker || !window.DemoProductCatalogData) return;
      var existing = cmCollectMatProductsFromBody();
      var lockedIds = existing.map(function (p) {
        return p.id;
      });
      DemoProductCatalogPicker.open({
        title: "选择物资",
        mode: "multi",
        products: DemoProductCatalogData.flattenAllProducts(),
        initialProducts: existing,
        lockedProductIds: lockedIds,
        onConfirm: function (picked) {
          var had = {};
          existing.forEach(function (p) {
            had[String(p.id)] = true;
          });
          (picked || []).forEach(function (p) {
            if (!p || !p.id || had[String(p.id)]) return;
            had[String(p.id)] = true;
            appendCmMatRow(p);
          });
        }
      });
    }

    function yyyymmdd() {
      var d = new Date();
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      return String(y) + m + day;
    }
    function typePrefix(t) {
      var v = String(t || "").trim();
      if (v === "生产类") return "SC";
      if (v === "办公类") return "BG";
      if (v === "销售类") return "SW";
      return "SW";
    }
    var CM_MAT_NAME_PRESET = {
      齿轮箱: { spec: "GBX-220", typeCode: "A0100100002", category: "生产类" },
      变流器: { spec: "V2.0", typeCode: "A0100100001", category: "生产类" },
      交换机: { spec: "S5720-28P", typeCode: "A0200100001", category: "销售类" },
      风机叶片: { spec: "LM-75.1", typeCode: "A0100200001", category: "生产类" },
      主轴轴承: { spec: "BR-120", typeCode: "A0100100002", category: "生产类" }
    };
    function refreshCodesForRow(tr) {
      if (!tr) return;
      var pid = tr.querySelector("input[data-k='productId']");
      if (pid && String(pid.value || "").trim()) return;
      var nameEl = tr.querySelector("input[data-k='nameSel']");
      var typeEl = tr.querySelector("select[data-k='type']");
      var typeCodeEl = tr.querySelector("input[data-k='typeCode']");
      var specEl = tr.querySelector("input[data-k='spec']");
      if (!nameEl || !typeEl || !typeCodeEl) return;
      var name = getMaterialNameValue(tr);
      if (!name) {
        typeCodeEl.value = "";
        if (specEl) specEl.value = "";
        return;
      }
      var preset = CM_MAT_NAME_PRESET[name];
      if (preset) {
        if (specEl) specEl.value = preset.spec || "";
        if (preset.category) typeEl.value = preset.category;
        typeCodeEl.value = preset.typeCode || "";
      }
    }

    function syncAmtHint() {
      var el = document.getElementById("mAmtHint");
      if (!el) return;
      el.innerHTML = "";
    }
    function syncMAmountLabelsAndExec() {
      var sel = document.getElementById("mCtype");
      var lab = document.getElementById("mAmountLabelText");
      var wrap = document.getElementById("mExecAmountWrap");
      var exIn = document.getElementById("mExecAmount");
      var row = document.getElementById("cmSignFirstRow");
      if (!sel || !lab) return;
      if (sel.value === "框架协议") {
        lab.textContent = "框架协议金额（万元）";
        if (wrap) {
          wrap.style.display = "grid";
        }
        if (row) row.style.gridTemplateColumns = "1fr 1fr 1fr";
      } else {
        lab.textContent = "常规合同金额（万元）";
        if (wrap) {
          wrap.style.display = "none";
        }
        if (row) row.style.gridTemplateColumns = "1fr 1fr";
        if (exIn) exIn.value = "";
      }
    }
    function syncMContractCodeLabel() {
      var sel = document.getElementById("mCtype");
      var sp = document.getElementById("mCodeLabelText");
      var hintSlot = document.getElementById("mCodeHintSlot");
      if (!sel || !sp) return;
      var labMap = {
        框架协议: "框架协议编码",
        常规合同: "常规合同编码"
      };
      sp.textContent = labMap[sel.value] || "合同编码";
      if (hintSlot) {
        hintSlot.innerHTML = "";
      }
      var execWrap = document.getElementById("mExecCodeWrap");
      var dateWrap = document.getElementById("mDateWrap");
      var grid = dateWrap && dateWrap.parentNode ? dateWrap.parentNode : null;
      if (execWrap) execWrap.style.display = sel.value === "框架协议" ? "" : "none";
      if (grid && execWrap && dateWrap) {
        if (sel.value === "框架协议") {
          if (execWrap.nextSibling !== dateWrap) grid.insertBefore(execWrap, dateWrap);
        } else {
          if (dateWrap.nextSibling !== execWrap) grid.insertBefore(dateWrap, execWrap);
          var execInput = document.getElementById("mExecCode");
          if (execInput) execInput.value = "";
        }
      }
    }
    document.getElementById("mCtype").addEventListener("change", function () {
      var ex = false;
      document.getElementById("mParentWrap").style.display = ex ? "block" : "none";
      syncMContractCodeLabel();
      syncAmtHint();
      syncMAmountLabelsAndExec();
      var sp = document.getElementById("mSpNo");
      if (sp && String(sp.value || "").trim()) applyCmFieldsFromProcurementLedger(sp.value);
      validateCmPayAmountAgainstContract();
      validateCmInAmountAgainstContract();
      validateCmExecAmountAgainstFrameworkShow();
    });
    syncMContractCodeLabel();
    syncAmtHint();
    syncMAmountLabelsAndExec();

    function applyFieldsFromPurchaseFlow() {
      var payload = {
        ctype: "框架协议",
        parent: "CG-KJ-2026-001 电控备件年度框架协议",
        code: "CG-KJ-2026-001",
        date: "2026-04-20",
        dept: "电控所",
        supplier: "远景能源",
        name: "电控备件年度框架协议",
        owner: "王卿明",
        spNo: "SP-CG-2026-001",
        target: "物资",
        mdm: "MDM-CG-2026-001",
        amount: "486",
        payWay: "转账/电汇",
        payRate: "30:60:10",
        v0: "2026-04-20",
        v1: "2027-04-19",
        warranty: "12个月"
      };
      var mCtype = document.getElementById("mCtype");
      if (mCtype) {
        mCtype.value = payload.ctype;
        mCtype.dispatchEvent(new Event("change"));
      }
      var mParent = document.getElementById("mParent");
      if (mParent) mParent.value = payload.parent;
      var mCode = document.getElementById("mCode");
      if (mCode) mCode.value = payload.code;
      var mDate = document.getElementById("mDate");
      if (mDate) mDate.value = payload.date;
      var mDept = document.getElementById("mDept");
      if (mDept) mDept.value = payload.dept;
      setCmSupplierValue(payload.supplier || "");
      var mName = document.getElementById("mName");
      if (mName) mName.value = payload.name;
      var mHc = document.getElementById("mHandlerContract");
      var mHb = document.getElementById("mHandlerBiz");
      var mHp = document.getElementById("mHandlerParty");
      if (mHc) mHc.value = payload.owner;
      if (mHb) mHb.value = "";
      if (mHp) mHp.value = "";
      var mSpNo = document.getElementById("mSpNo");
      if (mSpNo) mSpNo.value = payload.spNo;
      var mSpNoProject = document.getElementById("mSpNoProject");
      var lrP = findLedgerRowBySpNo(String(payload.spNo || "").trim());
      if (mSpNoProject) mSpNoProject.value = lrP ? lrP.project : "";
      syncCmSpNoReqStar();
      var mTarget = document.getElementById("mTarget");
      if (mTarget) mTarget.value = payload.target;
      var mMdm = document.getElementById("mMdm");
      if (mMdm) mMdm.value = payload.mdm;
      var mAmount = document.getElementById("mAmount");
      if (mAmount) mAmount.value = payload.amount;
      var mPayWay = document.getElementById("mPayWay");
      if (mPayWay) mPayWay.value = payload.payWay;
      var mPayRate = document.getElementById("mPayRate");
      if (mPayRate) mPayRate.value = payload.payRate;
      var mV0 = document.getElementById("mV0");
      if (mV0) mV0.value = payload.v0;
      var mV1 = document.getElementById("mV1");
      if (mV1) mV1.value = payload.v1;
      var mWarranty = document.getElementById("mWarranty");
      if (mWarranty) mWarranty.value = payload.warranty;
      applyCmFieldsFromProcurementLedger(payload.spNo);
      alert("已从采购流程带入字段（合同物资明细请手填）");
    }
    var topFetchBtn = document.getElementById("cmBtnFromPurTop");
    if (topFetchBtn) {
      topFetchBtn.style.display = CTX.formMode === "fill" ? "" : "none";
      topFetchBtn.onclick = applyFieldsFromPurchaseFlow;
    }
    var amtTrack = { prev: "" };
    var amtEl = document.getElementById("mAmount");
    if (amtEl) {
    amtEl.addEventListener("change", function () {
        var ctypeEl = document.getElementById("mCtype");
        if (!ctypeEl) return;
        var ct = ctypeEl.value;
        if (ct !== "常规合同" && ct !== "框架协议") return;
        var oldV = amtTrack.prev;
        var newV = this.value;
        if (String(oldV).trim() === String(newV).trim()) return;
        showModalLayer("cmModalReason");
        document.getElementById("cmReasonOld").textContent = oldV || "—";
        document.getElementById("cmReasonNew").textContent = newV;
        amtTrack.prev = newV;
        validateCmExecAmountAgainstFrameworkShow();
      });
    }
    var mPayBodyEl = document.getElementById("mPayBody");
    if (mPayBodyEl) {
      mPayBodyEl.addEventListener("change", function (e) {
        var t = e.target;
        if (t && t.matches && t.matches("[data-k='payAmt']")) validateCmPayAmountAgainstContract();
      });
    }
    var mInBodyEl = document.getElementById("mInBody");
    if (mInBodyEl) {
      mInBodyEl.addEventListener("change", function (e) {
        var t = e.target;
        if (t && t.matches && t.matches("[data-k='inAmt']")) validateCmInAmountAgainstContract();
      });
    }
    function bindFinLedgerRowDelete(tbody) {
      if (!tbody) return;
      tbody.addEventListener("click", function (e) {
        var btn = e.target.closest("button.carrier-btn-add");
        if (!btn || (btn.textContent || "").trim() !== "删除") return;
        var tr = btn.closest("tr");
        if (!tr || !tr.parentNode) return;
        if (tr.parentNode.querySelectorAll("tr").length <= 1) return;
        tr.parentNode.removeChild(tr);
        validateCmPayAmountAgainstContract();
        validateCmInAmountAgainstContract();
      });
    }
    bindFinLedgerRowDelete(document.getElementById("mInBody"));
    bindFinLedgerRowDelete(document.getElementById("mPayBody"));
    var mAddInBtn = document.getElementById("mAddInLine");
    if (mAddInBtn) {
      mAddInBtn.addEventListener("click", function () {
        var tb = document.getElementById("mInBody");
        if (!tb) return;
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td><input type='number' class='carrier-search' data-k='inAmt' step='0.01' placeholder='小等于合同总金额'/></td>" +
          "<td><input type='date' class='carrier-search' data-k='inDate'/></td>" +
          "<td><input type='number' class='carrier-search' data-k='inProg' min='0' max='100'/></td>" +
          "<td><input class='carrier-search' data-k='inRm' placeholder=''/></td>" +
          "<td><button type='button' class='carrier-btn-add'>删除</button></td>";
        tb.appendChild(tr);
      });
    }
    var mAddPayBtn = document.getElementById("mAddPayLine");
    if (mAddPayBtn) {
      mAddPayBtn.addEventListener("click", function () {
        var tb = document.getElementById("mPayBody");
        if (!tb) return;
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td><input type='number' class='carrier-search' data-k='payAmt' step='0.01' placeholder='小等于合同总金额'/></td>" +
          "<td><input type='date' class='carrier-search' data-k='payDate'/></td>" +
          "<td><input type='number' class='carrier-search' data-k='payProg' min='0' max='100'/></td>" +
          "<td><input class='carrier-search' data-k='payRm' placeholder=''/></td>" +
          "<td><button type='button' class='carrier-btn-add'>删除</button></td>";
        tb.appendChild(tr);
      });
    }
    var exAmtFormEl = document.getElementById("mExecAmount");
    if (exAmtFormEl) {
      exAmtFormEl.addEventListener("change", function () {
        validateCmExecAmountAgainstFrameworkShow();
      });
    }

    document.getElementById("mAddLine").addEventListener("click", openCmMatMultiPicker);
    var mMatBody = document.getElementById("mMatBody");
    if (mMatBody) {
      mMatBody.addEventListener("input", function (e) {
        var el = e.target;
        if (!el) return;
        if (el.matches("input[data-k='qty']")) {
          refreshCodesForRow(el.closest("tr"));
        }
      });
      mMatBody.addEventListener("change", function (e) {
        var el = e.target;
        if (!el) return;
        if (el.matches("select[data-k='type']")) {
          syncCmMatTypeSelectColor(el);
          refreshCodesForRow(el.closest("tr"));
        }
      });
    }

    function blankNewContractModalFieldsIfDraft() {
      function setEl(id, v) {
        var el = document.getElementById(id);
        if (el) el.value = v == null ? "" : String(v);
      }
      setEl("mCode", "");
      setEl("mExecCode", "");
      setEl("mDate", "");
      setEl("mDept", "");
      setCmSupplierValue("");
      setEl("mName", "");
      setEl("mHandlerContract", "");
      setEl("mHandlerBiz", "");
      setEl("mHandlerParty", "王红");
      setEl("mSpNo", "");
      setEl("mSpNoProject", "");
      syncCmSpNoReqStar();
      syncCmSupplierFieldMode();
      setEl("mTarget", "");
      setEl("mMdm", "");
      setEl("mAmount", "");
      setEl("mExecAmount", "");
      setEl("mPayWay", "");
      setEl("mPayRate", "");
      setEl("mV0", "");
      setEl("mV1", "");
      setEl("mWarranty", "");
      var inB = document.getElementById("mInBody");
      if (inB) inB.innerHTML = cmBlankFinInRowHtml();
      var payB = document.getElementById("mPayBody");
      if (payB) payB.innerHTML = cmBlankFinPayRowHtml();
      var tb = document.getElementById("mMatBody");
      if (tb) tb.innerHTML = "";
      syncMContractCodeLabel();
      syncAmtHint();
      syncMAmountLabelsAndExec();
      syncCmOwningCompanyField();
    }

    function hydrateEditFormFromRow() {
      var row = resolveEditingContractRow();
      if (!row) return;
      ensureContractRowDefaults(row, row.rowType === "exec");

      var ctype = row.rowType === "normal" ? "常规合同" : "框架协议";
      var mCtype = document.getElementById("mCtype");
      if (mCtype) {
        mCtype.value = ctype;
        mCtype.dispatchEvent(new Event("change"));
      }

      var mCode = document.getElementById("mCode");
      if (mCode) mCode.value = purchaseListMergedCell(row);
      var mExecCode = document.getElementById("mExecCode");
      if (mExecCode) {
        if (row.rowType === "framework" && Array.isArray(row.children) && row.children.length) {
          mExecCode.value = purchaseListExecCell(row.children[0]);
        } else if (row.rowType === "exec") {
          mExecCode.value = purchaseListExecCell(row);
        } else {
          mExecCode.value = "";
        }
      }

      function setVal(id, v) {
        var el = document.getElementById(id);
        if (el) el.value = v == null ? "" : String(v);
      }
      setVal("mDate", row.signed);
      syncCmOwningCompanyField();
      setVal("mDept", row.dept);
      var supDisp = String(row.supplier || "").trim();
      var rowHasSp = !!(String(row.spNo || "").trim());
      if (rowHasSp) {
        setCmSupplierValue(
          supDisp ? cmWithProcFlowLabel(cmStripProcFlowPrefix(supDisp)) : ""
        );
      } else {
        setCmSupplierValue(cmStripProcFlowPrefix(supDisp), true);
      }
      setVal("mName", row.name);
      setVal(
        "mHandlerContract",
        row.handlerContract != null && row.handlerContract !== ""
          ? row.handlerContract
          : row.creator || ""
      );
      setVal("mHandlerBiz", row.handlerBiz != null ? row.handlerBiz : "");
      setVal("mHandlerParty", "王红");
      setVal("mSpNo", row.spNo || "");
      var lrSp = findLedgerRowBySpNo(String(row.spNo || "").trim());
      setVal("mSpNoProject", lrSp ? lrSp.project : "");
      syncCmSpNoReqStar();
      setVal("mTarget", row.targetType || "物资");
      setVal("mMdm", row.mdm);
      var amtStr = row.amount != null && row.amount !== "" ? String(row.amount) : "";
      setVal("mAmount", amtStr ? cmWithProcFlowLabel(cmStripProcFlowPrefix(amtStr)) : "");
      if (ctype === "框架协议") {
        var exStr = row.execAmount != null && row.execAmount !== "" ? String(row.execAmount) : "";
        setVal("mExecAmount", exStr ? cmWithProcFlowLabel(cmStripProcFlowPrefix(exStr)) : "");
      } else {
        setVal("mExecAmount", "");
      }
      setVal("mPayWay", row.payWay);
      setVal("mPayRate", row.payRatio);
      var vp = String(row.validPeriod || "").split("~");
      setVal("mV0", (vp[0] || "").trim());
      setVal("mV1", (vp[1] || "").trim());
      setVal("mWarranty", row.warranty);
      if (rowHasSp) applyCmFieldsFromProcurementLedger(row.spNo);
      else syncCmSupplierFieldMode();
      var inBodyH = document.getElementById("mInBody");
      if (inBodyH) {
        var inLines =
          Array.isArray(row.inLedgerLines) && row.inLedgerLines.length
            ? row.inLedgerLines
            : [
                {
                  inAmount: row.inAmount != null ? row.inAmount : "",
                  inTime: row.inTime || "",
                  inProgress: String(row.inProgress || "").replace(/%/g, ""),
                  inRemark: row.inRemark || ""
                }
              ];
        inBodyH.innerHTML = inLines
          .map(function (L) {
            var a = L.inAmount != null && L.inAmount !== "" ? escapeHtml(String(L.inAmount)) : "";
            var d = escapeHtml(L.inTime || "");
            var p = escapeHtml(String(L.inProgress != null ? L.inProgress : "").replace(/%/g, ""));
            var r = escapeHtml(L.inRemark || "");
            return (
              "<tr><td><input type='number' class='carrier-search' data-k='inAmt' step='0.01' placeholder='小等于合同总金额' value='" +
              a +
              "'/></td><td><input type='date' class='carrier-search' data-k='inDate' value='" +
              d +
              "'/></td><td><input type='number' class='carrier-search' data-k='inProg' min='0' max='100' value='" +
              p +
              "'/></td><td><input class='carrier-search' data-k='inRm' placeholder='' value='" +
              r +
              "'/></td><td><button type='button' class='carrier-btn-add'>删除</button></td></tr>"
            );
          })
          .join("");
      }
      var payBodyH = document.getElementById("mPayBody");
      if (payBodyH) {
        var payProg0 = String(percentText(row.payAmount, row.amount)).replace(/%/g, "");
        var payLines =
          Array.isArray(row.payLedgerLines) && row.payLedgerLines.length
            ? row.payLedgerLines
            : [
                {
                  payAmount: row.payAmount != null ? row.payAmount : "",
                  payTime: row.payTime || "",
                  payProg: payProg0,
                  payRemark: row.payRemark || ""
                }
              ];
        payBodyH.innerHTML = payLines
          .map(function (L) {
            var a = L.payAmount != null && L.payAmount !== "" ? escapeHtml(String(L.payAmount)) : "";
            var d = escapeHtml(L.payTime || "");
            var p = escapeHtml(String(L.payProg != null ? L.payProg : "").replace(/%/g, ""));
            var r = escapeHtml(L.payRemark || "");
            return (
              "<tr><td><input type='number' class='carrier-search' data-k='payAmt' step='0.01' placeholder='小等于合同总金额' value='" +
              a +
              "'/></td><td><input type='date' class='carrier-search' data-k='payDate' value='" +
              d +
              "'/></td><td><input type='number' class='carrier-search' data-k='payProg' min='0' max='100' value='" +
              p +
              "'/></td><td><input class='carrier-search' data-k='payRm' placeholder='' value='" +
              r +
              "'/></td><td><button type='button' class='carrier-btn-add'>删除</button></td></tr>"
            );
          })
          .join("");
      }

      var body = document.getElementById("mMatBody");
      if (!body) return;
      var mats = Array.isArray(row.materials) && row.materials.length ? row.materials : [];
      if (!mats.length) return;
      body.innerHTML = mats
        .map(function (m) {
          var name = String(m && m.name ? m.name : "");
          return (
            "<tr>" +
            cmMatNameCellHtml() +
            "<td><input class='carrier-search' data-k='productCode' readonly style='background:#fafafa' value='" +
            escapeHtml(m.productCode || "") +
            "'/></td>" +
            "<td><input class='carrier-search' data-k='spec' value='" +
            escapeHtml(m.spec || "") +
            "'/></td>" +
            "<td><select class='carrier-select' data-k='type'>" +
            (!(m.type || "")
              ? "<option value='' selected>请选择物资类别</option>"
              : "") +
            "<option value='生产类'" +
            ((m.type || "") === "生产类" ? " selected" : "") +
            ">生产类</option><option value='销售类'" +
            ((m.type || "") === "销售类" ? " selected" : "") +
            ">销售类</option><option value='办公类'" +
            ((m.type || "") === "办公类" ? " selected" : "") +
            ">办公类</option></select></td>" +
            "<td><input class='carrier-search' data-k='typeName' readonly style='background:#fafafa' value='" +
            escapeHtml(m.typeName || m.name || "") +
            "'/></td>" +
            "<td><input class='carrier-search' data-k='typeCode' readonly style='background:#fafafa' value='" +
            escapeHtml(m.typeCode || "") +
            "'/></td>" +
            "<td><input type='number' class='carrier-search' data-k='price' value='" +
            escapeHtml(m.unitPrice || "") +
            "'/></td>" +
            "<td><input type='number' class='carrier-search' data-k='qty' value='" +
            escapeHtml(m.qty || "") +
            "'/></td>" +
            "<td><input type='number' class='carrier-search' data-k='tax' value='" +
            escapeHtml(String(m.taxRate || "").replace(/%/g, "")) +
            "'/></td>" +
            "<td><input class='carrier-search' data-k='remark' value='" +
            escapeHtml(m.remark || "") +
            "'/></td>" +
            "<td><button type='button' class='carrier-btn-add'>删除</button></td></tr>"
          );
        })
        .join("");
      body.querySelectorAll("tr").forEach(function (tr, idx) {
        var m = mats[idx];
        var p = cmFindProductByMaterialName(m && m.name);
        if (p) applyCmProductToRow(tr, p);
        else if (m && m.name) {
          var hid = tr.querySelector("input[data-k='nameSel']");
          var disp = tr.querySelector("input[data-k='matNameDisplay']");
          if (hid) hid.value = m.name;
          if (disp) disp.value = m.name;
        }
        syncCmMatTypeSelectColor(tr.querySelector("select[data-k='type']"));
      });
    }
    hydrateEditFormFromRow();
    syncCmSupplierFieldMode();
    var draftChk = resolveEditingContractRow();
    if (draftChk && isFreshNewContractDraft(draftChk)) {
      blankNewContractModalFieldsIfDraft();
    }
    var amtElAfter = document.getElementById("mAmount");
    if (amtElAfter) {
      amtTrack.prev = amtElAfter.value;
    }
    validateCmPayAmountAgainstContract();
    validateCmInAmountAgainstContract();
    validateCmExecAmountAgainstFrameworkShow();

    var finBlock = document.getElementById("mFinBlock");
    if (finBlock) finBlock.style.display = "block";
  }

  function applyContractFormMode(mode) {
    var body = document.getElementById("cmModalEditBody");
    if (!body) return;
    var isView = mode === "view";
    body.querySelectorAll("input, select, textarea, button").forEach(function (el) {
      if (!el) return;
      if (isView) {
        if (el.tagName === "BUTTON") {
          el.style.display = "none";
          return;
        }
        if (el.tagName === "SELECT") {
          el.setAttribute("disabled", "disabled");
        } else {
          el.setAttribute("readonly", "readonly");
        }
        if (el.classList && (el.classList.contains("carrier-search") || el.classList.contains("carrier-select"))) {
          el.style.background = "#f5f5f5";
        }
      } else {
        if (el.tagName === "BUTTON") {
          el.style.display = "";
        }
        el.removeAttribute("readonly");
        el.removeAttribute("disabled");
        if (el.classList && (el.classList.contains("carrier-search") || el.classList.contains("carrier-select"))) {
          el.style.background = "";
        }
      }
    });
  }

  function setContractModalTitle(mode) {
    var titleEl = document.getElementById("cmModalEditTitle");
    if (!titleEl) return;
    if (mode === "view") {
      titleEl.textContent = "合同信息管理 - 查看合同";
      return;
    }
    if (mode === "edit") {
      titleEl.textContent = "合同信息管理 - 编辑合同";
      return;
    }
    if (mode === "approve") {
      titleEl.textContent = "合同信息管理 - 审批合同";
    } else {
      titleEl.textContent = "合同信息管理 - 新增合同";
    }
    // 强制保证标题可见，防止被其它全局样式/脚本清空或隐藏
    titleEl.style.display = "inline-block";
    titleEl.style.color = "#1f3551";
    titleEl.style.fontSize = "16px";
    titleEl.style.fontWeight = "600";
    titleEl.style.lineHeight = "1.3";
    titleEl.style.opacity = "1";
    titleEl.style.visibility = "visible";
    titleEl.style.textIndent = "0";
    titleEl.style.whiteSpace = "nowrap";
  }

  function ensureContractModalTitle(mode) {
    setContractModalTitle(mode);
    setTimeout(function () {
      setContractModalTitle(mode);
    }, 0);
    setTimeout(function () {
      setContractModalTitle(mode);
    }, 120);
  }

  function bind() {
    var roleSel = document.getElementById("cmRole");
    if (roleSel) {
      roleSel.addEventListener("change", function () {
        CTX.role = this.value;
        refreshTable();
      });
    }

    document.getElementById("cmBtnSearch").addEventListener("click", refreshTable);
    document.getElementById("cmBtnReset").addEventListener("click", function () {
      ["cmFCode", "cmFName", "cmFParty", "cmFDate0", "cmFDate1"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
      });
      ["cmFCtype", "cmFStatus"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
      });
      refreshTable();
    });

    var cmBtnInlineEdit = document.getElementById("cmBtnInlineEdit");
    var cmBtnInlineSave = document.getElementById("cmBtnInlineSave");
    var cmBtnInlineCancel = document.getElementById("cmBtnInlineCancel");
    function syncCmInlineToolbar() {
      if (cmBtnInlineEdit) cmBtnInlineEdit.style.display = CTX.inlineEdit ? "none" : "";
      if (cmBtnInlineSave) cmBtnInlineSave.style.display = CTX.inlineEdit ? "" : "none";
      if (cmBtnInlineCancel) cmBtnInlineCancel.style.display = CTX.inlineEdit ? "" : "none";
    }
    if (cmBtnInlineEdit) {
      cmBtnInlineEdit.addEventListener("click", function () {
        CTX.inlineSnapshot = JSON.parse(JSON.stringify(CTX.purchaseRoots));
        CTX.inlineEdit = true;
        syncCmInlineToolbar();
        refreshTable();
      });
    }
    if (cmBtnInlineSave) {
      cmBtnInlineSave.addEventListener("click", function () {
        CTX.inlineEdit = false;
        CTX.inlineSnapshot = null;
        syncCmInlineToolbar();
        refreshTable();
        alert("合同信息管理已批量保存（演示）");
      });
    }
    if (cmBtnInlineCancel) {
      cmBtnInlineCancel.addEventListener("click", function () {
        if (CTX.inlineSnapshot) CTX.purchaseRoots = JSON.parse(JSON.stringify(CTX.inlineSnapshot));
        CTX.inlineEdit = false;
        CTX.inlineSnapshot = null;
        syncCmInlineToolbar();
        refreshTable();
        alert("已取消编辑并恢复修改前数据（演示）");
      });
    }
    syncCmInlineToolbar();
    document.getElementById("cmBtnImport").addEventListener("click", function () {
      openLocalImportPicker({ title: "合同导入" });
    });
    var cmTplBtn = document.getElementById("cmBtnTpl");
    if (cmTplBtn) {
      cmTplBtn.addEventListener("click", function () {
        downloadTemplateCsv("采购合同导入模板.csv", [
          "框架协议号/常规合同编号",
          "执行合同编号",
          "签订时间",
          "归属部门",
          "供应商名称",
          "合同名称",
          "经办人",
          "采购标包编号",
          "采购标的类别",
          "法务系统MDM编码",
          "合同金额（万元）",
          "付款方式",
          "付款比例",
          "合同有效期",
          "质保期",
          "入票金额（万元）",
          "入票时间",
          "单个合同入票进度",
          "付款金额（万元）",
          "付款时间",
          "单个合同付款进度",
          "阶段号",
          "物资名称",
          "产品型号",
          "物资类别",
          "采购单价（含税）",
          "采购数量",
          "税率（%）"
        ]);
      });
    }
    var cmExportBtn = document.getElementById("cmBtnExport");
    if (cmExportBtn) cmExportBtn.addEventListener("click", function () { alert("已导出当前筛选合同数据（演示）"); });
    var cmSubmitBtn = document.getElementById("cmBtnSubmitBatch");
    if (cmSubmitBtn) {
      cmSubmitBtn.addEventListener("click", function () {
        CTX.purchaseRoots.forEach(function (r) {
          if (normalizeContractStatus(r.status) !== "已审核锁定") r.status = "审批中";
          (r.children || []).forEach(function (c) {
            if (normalizeContractStatus(c.status) !== "已审核锁定") c.status = "审批中";
          });
        });
        refreshTable();
        alert("已批量提交审批（演示）");
      });
    }
    var cmDeleteBtn = document.getElementById("cmBtnDeleteBatch");
    if (cmDeleteBtn) {
      cmDeleteBtn.addEventListener("click", function () {
        var ids = Array.prototype.slice
          .call(document.querySelectorAll(".cm-row-chk:checked"))
          .map(function (el) { return el.getAttribute("data-id"); });
        if (!ids.length) { alert("请先勾选要删除的数据"); return; }
        CTX.purchaseRoots = CTX.purchaseRoots
          .filter(function (r) { return ids.indexOf(r.id) < 0; })
          .map(function (r) {
            r.children = (r.children || []).filter(function (c) { return ids.indexOf(c.id) < 0; });
            return r;
          });
        refreshTable();
      });
    }
    var cmTopAddBtn = document.getElementById("cmBtnTopAdd");
    if (cmTopAddBtn) {
      cmTopAddBtn.addEventListener("click", function (e) {
        if (e.target.closest("i")) e.preventDefault();
        var row = {
          id: "n" + Date.now(),
          rowType: "normal",
          code: "CG-CG-" + new Date().getFullYear() + "-NEW",
          name: "新建合同",
          ctype: "常规合同",
          supplier: "",
          spNo: "",
          amount: 0,
          executed: 0,
          remain: 0,
          signed: "",
          status: "草稿",
          creator: currentUserLabel(),
          handlerContract: currentUserLabel(),
          handlerBiz: "",
          handlerParty: "",
          pendingApprover: "",
          inAmount: 0,
          children: []
        };
        ensureContractRowDefaults(row, false);
        CTX.pendingNewContract = row;
        CTX.editingId = row.id;
        CTX.formMode = "fill";
        ensureContractModalTitle("add");
        try {
          buildEditModal();
          applyContractFormMode("fill");
          renderCmFormFooter("fill");
          openModal("cmModalEdit");
        } catch (errBuild) {
          try {
            console.error("[contract-management] 新增合同弹窗失败:", errBuild);
          } catch (eLog) {}
          alert("打开新增合同弹窗失败，请刷新页面后重试。");
        }
      });
    }
    var cmAddRowBtn = document.getElementById("cmBtnAddRow");
    if (cmAddRowBtn) {
      cmAddRowBtn.addEventListener("click", function () {
        var row = {
          id: "n" + Date.now(),
          rowType: "normal",
          code: "CG-CG-" + new Date().getFullYear() + "-NEW",
          name: "新建合同",
          ctype: "常规合同",
          supplier: "",
          spNo: "",
          amount: 0,
          executed: 0,
          remain: 0,
          signed: "",
          status: "草稿",
          creator: currentUserLabel(),
          handlerContract: currentUserLabel(),
          handlerBiz: "",
          handlerParty: "",
          pendingApprover: "",
          inAmount: 0,
          children: []
        };
        ensureContractRowDefaults(row, false);
        CTX.purchaseRoots.push(row);
        refreshTable();
      });
    }

    document.getElementById("cmTableBody").addEventListener("click", function (e) {
      var addMat = e.target.closest("[data-mat-add]");
      if (addMat && CTX.inlineEdit) {
        var rid = addMat.getAttribute("data-mat-add");
        var rr = findPurchaseRowById(rid);
        if (rr) {
          ensureContractRowDefaults(rr, rr.rowType === "exec");
          rr.materials.push({
            id: "m-" + Date.now(),
            name: "",
            spec: "",
            type: "生产类",
            qty: 0,
            unit: "个",
            unitPrice: 0,
            taxRate: "13%",
            totalPrice: 0,
            remark: ""
          });
          renderPurchaseTable();
        }
        return;
      }
      var delMat = e.target.closest("[data-mat-del]");
      if (delMat && CTX.inlineEdit) {
        var rid2 = delMat.getAttribute("data-row-id");
        var mid2 = delMat.getAttribute("data-mat-del");
        var rr2 = findPurchaseRowById(rid2);
        if (rr2 && Array.isArray(rr2.materials)) {
          rr2.materials = rr2.materials.filter(function (x) { return x.id !== mid2; });
          renderPurchaseTable();
        }
        return;
      }
      if (CTX.inlineEdit) return;
      var b = e.target.closest(".cm-btn-op");
      if (!b) return;
      var act = b.getAttribute("data-act");
      var id = b.getAttribute("data-id");
      if (act === "fill" || act === "edit" || act === "editS") {
        CTX.editingId = id;
        CTX.formMode = "fill";
        ensureContractModalTitle("edit");
        buildEditModal();
        applyContractFormMode("fill");
        renderCmFormFooter("fill");
        openModal("cmModalEdit");
      } else if (act === "view" || act === "detail" || act === "detailS") {
        CTX.editingId = id;
        CTX.formMode = "view";
        ensureContractModalTitle("view");
        buildEditModal();
        applyContractFormMode("view");
        renderCmFormFooter("view");
        openModal("cmModalEdit");
      } else if (act === "new") {
        var src = findPurchaseRowById(id);
        if (src) {
          var cp = JSON.parse(JSON.stringify(src));
          cp.id = "C" + Date.now();
          cp.name = "新建采购合同";
          cp.status = "草稿";
          cp.approvalNode = "未提交";
          CTX.purchaseRoots.unshift(cp);
          refreshTable();
          CTX.editingId = cp.id;
          CTX.formMode = "fill";
          ensureContractModalTitle("add");
          buildEditModal();
          applyContractFormMode("fill");
          renderCmFormFooter("fill");
          openModal("cmModalEdit");
        }
      } else if (act === "history") {
        openUnifiedProgressModal();
      } else if (act === "return") {
        CTX.purchaseRoots.forEach(function (r) {
          if (r.id === id) r.status = "已终止";
          (r.children || []).forEach(function (c) {
            if (c.id === id) c.status = "已终止";
          });
        });
        refreshTable();
        alert("已退回为退回未提交状态（演示）");
      } else if (act === "delete" || act === "deleteS") {
        if (confirm("确认删除该合同吗？删除后不可恢复。")) alert("已删除（演示）");
      } else if (act === "submit" || act === "submitS") {
        alert("已提交审批（演示）");
      } else if (act === "withdrawS") {
        if (confirm("确认撤回该销售合同吗？撤回后状态将变为草稿。")) alert("已撤回（演示）");
      } else if (act === "approveS") {
        CTX.formMode = "approve";
        ensureContractModalTitle("approve");
        buildEditModal();
        renderCmFormFooter("approve");
        openModal("cmModalEdit");
      } else if (act === "withdraw") {
        if (confirm("确认撤回该合同吗？撤回后状态将变为草稿。")) {
          var rw = findPurchaseRowById(id);
          if (rw) rw.status = "草稿";
          refreshTable();
          alert("已撤回（演示）");
        }
      } else if (act === "progress" || act === "progressS") {
        openUnifiedProgressModal();
      } else if (act === "approve") {
        CTX.editingId = id;
        CTX.formMode = "approve";
        ensureContractModalTitle("approve");
        buildEditModal();
        renderCmFormFooter("approve");
        openModal("cmModalEdit");
      } else if (act === "financeRecvS") {
        openModal("cmModalFinancePay");
      } else if (act === "shipGenS") {
        alert("已生成发货单并跳转发货管理（演示）");
      } else if (act === "financeIn") {
        openModal("cmModalFinanceIn");
      } else if (act === "financePay") {
        openModal("cmModalFinancePay");
      }
    });
    document.getElementById("cmTableBody").addEventListener("change", function (e) {
      if (!CTX.inlineEdit) return;
      var input = e.target.closest(".cm-mat-input");
      if (!input) return;
      var tr = input.closest("tr[data-mat-row-id]");
      if (!tr) return;
      var rid = tr.getAttribute("data-mat-row-id");
      var mid = tr.getAttribute("data-mat-id");
      var row = findPurchaseRowById(rid);
      if (!row || !Array.isArray(row.materials)) return;
      var mat = row.materials.find(function (x) { return x.id === mid; });
      if (!mat) return;
      var k = input.getAttribute("data-k");
      mat[k] = input.type === "number" ? (parseFloat(input.value) || 0) : input.value;
      if (k === "qty" || k === "unitPrice") {
        mat.totalPrice = ((Number(mat.qty) || 0) * (Number(mat.unitPrice) || 0)).toFixed(2);
      }
    });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", closeAll);
    });
    document.querySelectorAll(".cm-modal-mask").forEach(function (mask) {
      mask.addEventListener("click", function (e) {
        if (e.target !== mask) return;
        if (mask.id === "cmModalSystemTip") {
          hideCmSystemTip();
          return;
        }
        if (mask.id === "cmModalReason") {
          hideCmReasonModal();
          return;
        }
        if (mask.id === "cmModalExecWarn") {
          hideCmExecWarnModal();
          return;
        }
        closeAll();
      });
    });

    function bindCmSystemTipControls() {
      function h() {
        hideCmSystemTip();
      }
      var ok = document.getElementById("cmSystemTipOk");
      var cancel = document.getElementById("cmSystemTipCancel");
      var xb = document.getElementById("cmSystemTipX");
      if (ok) ok.addEventListener("click", h);
      if (cancel) cancel.addEventListener("click", h);
      if (xb) xb.addEventListener("click", h);
    }
    bindCmSystemTipControls();

    function bindCmReasonAndExecWarnModals() {
      function dismissReason() {
        hideCmReasonModal();
      }
      var rcb = document.getElementById("cmReasonCloseBtn");
      var rca = document.getElementById("cmReasonCancelBtn");
      if (rcb) rcb.addEventListener("click", dismissReason);
      if (rca) rca.addEventListener("click", dismissReason);
      function dismissExecWarn() {
        hideCmExecWarnModal();
      }
      var ecb = document.getElementById("cmExecWarnCloseBtn");
      var eok = document.getElementById("cmExecWarnOk");
      if (ecb) ecb.addEventListener("click", dismissExecWarn);
      if (eok) eok.addEventListener("click", dismissExecWarn);
    }
    bindCmReasonAndExecWarnModals();

    document.getElementById("cmReasonOk").addEventListener("click", function () {
      var t = document.getElementById("cmReasonText").value.trim();
      if (!t) {
        alert("请填写修改原因");
        return;
      }
      hideCmReasonModal();
      validateCmPayAmountAgainstContract();
      validateCmInAmountAgainstContract();
      validateCmExecAmountAgainstFrameworkShow();
    });

    document.getElementById("cmBtnExecSave").addEventListener("click", function () {
      alert("执行合同已保存并进入审批（演示）");
      closeAll();
    });
    document.getElementById("cmFinInSave").addEventListener("click", function () {
      alert("入票信息已保存（演示）");
      closeAll();
    });
    document.getElementById("cmFinPaySave").addEventListener("click", function () {
      alert("支付信息已保存（演示）");
      closeAll();
    });
    document.getElementById("cmApprOk").addEventListener("click", function () {
      var o = document.getElementById("cmApprOpinion").value.trim();
      if (!o) {
        alert("请填写审批意见");
        return;
      }
      alert("审批已提交（演示）");
      closeAll();
    });
    var cmEditFt = document.querySelector("#cmModalEdit .cm-dialog-ft");
    if (cmEditFt) {
      cmEditFt.addEventListener("click", function (e) {
        var b = e.target.closest("[data-form-act]");
        if (!b) return;
        var act = b.getAttribute("data-form-act");
        var row = resolveEditingContractRow();
        if (act === "submit") {
          if (row) {
            syncOwnerFieldsFromPurchaseModal(row);
            row.status = "审批中";
            if (CTX.pendingNewContract && CTX.pendingNewContract.id === CTX.editingId) {
              CTX.purchaseRoots.unshift(row);
              CTX.pendingNewContract = null;
            }
          }
          alert("已保存合同（演示）");
          closeAll();
          refreshTable();
          return;
        }
        if (act === "approvePass") {
          if (row) {
            syncOwnerFieldsFromPurchaseModal(row);
            row.status = "已生效";
            if (CTX.pendingNewContract && CTX.pendingNewContract.id === CTX.editingId) {
              CTX.purchaseRoots.unshift(row);
              CTX.pendingNewContract = null;
            }
          }
          alert("审批通过（演示）");
          closeAll();
          refreshTable();
          return;
        }
        if (act === "approveReject") {
          if (row) {
            syncOwnerFieldsFromPurchaseModal(row);
            row.status = "已终止";
          }
          alert("已驳回（演示）");
          closeAll();
          refreshTable();
        }
      });
    }
  }

  function boot() {
    initData();
    try {
    bind();
    } catch (eBind) {
      try { console.error("[contract-management] bind failed:", eBind); } catch (eLog) {}
    }
    switchTab("purchase");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
