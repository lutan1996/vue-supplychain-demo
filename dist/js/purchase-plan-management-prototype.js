/**
 * 采购计划管理页原型：搜索、列表、角色权限、新建/编辑/审批/进度等弹窗
 */
(function () {
  var STEPS = ["部门专责提报", "部门主管审核", "主管领导审核", "公司采购主管审核", "公司采购专责汇总"];

  var DEPT_HEAD_DEPT = "经营发展中心";
  var SUPERVISED_DEPTS = ["运维一部", "工程管理部", "运维二部", "数字化中心"];

  var ROLE_META = {
    dept_asset_specialist: { name: "宋中波", label: "部门资产专责" },
    dept_material_specialist: { name: "宋中波", label: "部门物资专责" },
    corp_purchase_specialist: { name: "王卿明", label: "公司采购专责（王卿明）" },
    dept_head: { name: "王超", label: "部门主管（仅本部门：" + DEPT_HEAD_DEPT + "）" },
    supervisor_leader: { name: "曾繁礼", label: "主管领导（曾繁礼）" },
    corp_purchase_head: { name: "王超", label: "公司采购主管（王超）" },
    director: { name: "冯江哲", label: "董事（仅查看）" },
    gm: { name: "曾繁礼", label: "总经理（仅查看）" }
  };

  var CTX = {
    list: [],
    editingId: null,
    editBuffer: null,
    viewMode: false,
    pendingWithdrawId: null,
    pendingDeleteId: null,
    pendingSubmitAfterSave: false,
    inlineEdit: false,
    inlineSnapshot: null,
    formMode: "view"
  };

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

  function demoResultToast(msg) {
    try {
      if (typeof window.mapDemoToast === "function") {
        window.mapDemoToast(msg);
        return;
      }
    } catch (e) {}
    alert(msg);
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

  function hint(text) {
    return (
      '<span class="ppm-hint" tabindex="0" aria-label="说明">?<span class="ppm-hint-tip">' +
      escapeHtml(text) +
      "</span></span>"
    );
  }

  var PPM_FLOW_PROGRESS_LS = "ppm_flow_progress_options_v2";

  function getDefaultFlowProgressOptions() {
    return [
      "未报送",
      "龙源OA采购计划审批中",
      "采购部备案",
      "准备上传SRM",
      "询价编制文件",
      "神华推送招标文件",
      "亿泰推送采购文件",
      "SRM审批中",
      "SRM审批完成",
      "挂网",
      "等待上会",
      "公示",
      "准备签订合同",
      "合同签订中",
      "流程完毕",
      "二次挂网",
      "项目终止",
      "计划终止"
    ];
  }

  function getFlowProgressOptions() {
    try {
      var raw = localStorage.getItem(PPM_FLOW_PROGRESS_LS);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          var out = [];
          arr.forEach(function (s) {
            var t = String(s || "").trim();
            if (t && out.indexOf(t) < 0) out.push(t);
          });
          if (out.length) return out;
        }
      }
    } catch (e) {}
    return getDefaultFlowProgressOptions();
  }

  function saveFlowProgressOptions(lines) {
    try {
      localStorage.setItem(PPM_FLOW_PROGRESS_LS, JSON.stringify(lines));
    } catch (e) {}
  }

  function pickFlowProgressValue(v) {
    var opts = getFlowProgressOptions();
    var s = String(v || "").trim();
    if (s && opts.indexOf(s) >= 0) return s;
    return opts[0] || "未报送";
  }

  function normalizeListFlowProgress() {
    var opts = getFlowProgressOptions();
    if (!opts.length) return;
    CTX.list.forEach(function (r) {
      if (opts.indexOf(r.flowProgress) < 0) r.flowProgress = opts[0];
    });
  }

  function buildFlowProgressSelectHtml(row, selRo) {
    var opts = getFlowProgressOptions();
    var cur = pickFlowProgressValue(row.flowProgress);
    var optsHtml = opts
      .map(function (x) {
        return "<option" + (cur === x ? " selected" : "") + ">" + escapeHtml(x) + "</option>";
      })
      .join("");
    return (
      '<div><label>采购流程进度 ' +
      hint("候选项可在列表上方「字段配置」入口维护。") +
      '</label><select id="ppmFlowProgress" class="carrier-select"' +
      selRo +
      ">" +
      optsHtml +
      "</select></div>"
    );
  }

  function openFieldConfigModal() {
    renderFieldCfgFlowRows(getFlowProgressOptions());
    showModal("ppmModalFieldCfg", true);
  }

  function renderFieldCfgFlowRows(lines) {
    var list = document.getElementById("ppmFieldCfgList");
    if (!list) return;
    var arr = Array.isArray(lines) && lines.length ? lines : getFlowProgressOptions();
    list.innerHTML = arr
      .map(function (text) {
        return (
          '<div class="ppm-field-cfg-row">' +
          '<input type="text" class="carrier-search ppm-field-cfg-input" value="' +
          escapeHtml(text) +
          '" placeholder="请输入采购流程进度名称" />' +
          '<button type="button" class="carrier-btn-add ppm-field-cfg-del" title="删除" aria-label="删除">−</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function appendFieldCfgEmptyRow() {
    var list = document.getElementById("ppmFieldCfgList");
    if (!list) return;
    var wrap = document.createElement("div");
    wrap.className = "ppm-field-cfg-row";
    wrap.innerHTML =
      '<input type="text" class="carrier-search ppm-field-cfg-input" value="" placeholder="请输入采购流程进度名称" />' +
      '<button type="button" class="carrier-btn-add ppm-field-cfg-del" title="删除" aria-label="删除">−</button>';
    list.appendChild(wrap);
    var inp = wrap.querySelector(".ppm-field-cfg-input");
    if (inp) inp.focus();
  }

  function collectFieldCfgFlowLines() {
    var list = document.getElementById("ppmFieldCfgList");
    if (!list) return [];
    var out = [];
    Array.prototype.forEach.call(list.querySelectorAll(".ppm-field-cfg-input"), function (inp) {
      var t = String(inp.value || "").trim();
      if (t && out.indexOf(t) < 0) out.push(t);
    });
    return out;
  }

  function bindFieldCfgModalActions() {
    var mask = document.getElementById("ppmModalFieldCfg");
    if (!mask || mask.getAttribute("data-field-cfg-bound") === "1") return;
    mask.setAttribute("data-field-cfg-bound", "1");
    mask.addEventListener("click", function (e) {
      if (e.target.closest("#ppmFieldCfgAdd")) {
        e.preventDefault();
        appendFieldCfgEmptyRow();
        return;
      }
      var del = e.target.closest(".ppm-field-cfg-del");
      if (del) {
        e.preventDefault();
        var row = del.closest(".ppm-field-cfg-row");
        if (row && row.parentNode) row.parentNode.removeChild(row);
      }
    });
  }

  function closeFieldConfigModal() {
    showModal("ppmModalFieldCfg", false);
  }

  function renderFlowProgressFilterOptions() {
    var sel = document.getElementById("ppmFFlow");
    if (!sel) return;
    var prev = String(sel.value || "");
    var opts = getFlowProgressOptions();
    var html = '<option value="">全部</option>';
    opts.forEach(function (o) {
      html += "<option>" + escapeHtml(o) + "</option>";
    });
    sel.innerHTML = html;
    if (prev && opts.indexOf(prev) >= 0) sel.value = prev;
    else sel.selectedIndex = 0;
  }

  function daysBetween(start, end) {
    if (!start || !end) return null;
    var s = new Date(start + "T00:00:00");
    var e = new Date(end + "T00:00:00");
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    return Math.floor((e - s) / 86400000);
  }

  function currentRole() {
    var sel = document.getElementById("ppmRole");
    return sel ? sel.value : "corp_purchase_specialist";
  }

  function roleGroup() {
    var role = currentRole();
    if (role === "dept_asset_specialist" || role === "dept_material_specialist") return "filler";
    if (role === "dept_head" || role === "supervisor_leader" || role === "corp_purchase_head") return "approver";
    if (role === "corp_purchase_specialist") return "owner";
    if (role === "director" || role === "gm") return "viewer";
    return "filler";
  }

  function normalizeFillStatus(s) {
    if (s === "草稿") return "暂存未提交";
    if (s === "审批中") return "提交未审核";
    if (s === "已通过") return "已审核锁定";
    if (s === "已驳回") return "退回未提交";
    return "未开始";
  }

  function currentUserName() {
    return ROLE_META[currentRole()].name;
  }

  function initData() {
    CTX.list = [
      {
        id: "p1",
        projectName: "华北风场主机备件采购",
        method: "招标",
        targetType: "物资",
        bizDept: "经营发展中心",
        handler: "宋中波",
        budget: 520,
        isFrame: "是",
        oaApprove: "2026-01-10",
        committeeNo: "2026-01期",
        flowStatus: "草稿",
        currentNode: "—",
        submitter: "宋中波",
        submitTime: "—",
        flowIndex: 0,
        oaMinutes: "2026-01-14",
        projectType: "生产",
        isLimit: "是",
        isSci: "否",
        sciName: "",
        wbs: "WBS-HB-001",
        isXiAn: "否",
        srmDate: "2026-01-20",
        flowProgress: "SRM审批中",
        publishDate: "2026-02-01",
        publishUrl: "https://srm.ly/ab12",
        basis: "年度计划+故障率分析",
        pkgNo: "PKG-HB-01",
        procCode: "PROC-2026-001",
        openDate: "2026-02-18",
        awardDate: "2026-02-25",
        publicDate: "2026-02-26",
        noticeDate: "2026-03-01",
        dealAmount: 486,
        supplier: "联合动力",
        isAnnual: "是",
        stampDate: "2026-03-12",
        remark: "执行顺畅",
        kpiRemark: ""
      },
      {
        id: "p2",
        projectName: "西北场站电缆改造服务",
        method: "询价",
        targetType: "服务",
        bizDept: "经营发展中心",
        handler: "王卿明",
        budget: 180,
        isFrame: "否",
        oaApprove: "2026-02-02",
        committeeNo: "2026-02期",
        flowStatus: "审批中",
        currentNode: "部门主管审核",
        submitter: "宋中波",
        submitTime: "2026-04-18 09:30",
        flowIndex: 1,
        oaMinutes: "2026-02-07",
        projectType: "基建",
        isLimit: "否",
        isSci: "否",
        sciName: "",
        wbs: "WBS-XB-118",
        isXiAn: "是",
        srmDate: "2026-02-10",
        flowProgress: "准备签订合同",
        publishDate: "2026-02-15",
        publishUrl: "https://srm.ly/cd33",
        basis: "设备改造专项",
        pkgNo: "PKG-XB-05",
        procCode: "PROC-2026-033",
        openDate: "2026-02-24",
        awardDate: "2026-02-28",
        publicDate: "2026-03-01",
        noticeDate: "2026-03-03",
        dealAmount: 172,
        supplier: "华科工程",
        isAnnual: "否",
        stampDate: "2026-04-10",
        remark: "跨区协同",
        kpiRemark: ""
      },
      {
        id: "p3",
        projectName: "甘肃风场塔筒工程",
        method: "招标",
        targetType: "工程",
        bizDept: "运维一部",
        handler: "陈浩",
        budget: 1380,
        isFrame: "否",
        oaApprove: "2026-01-05",
        committeeNo: "2026-01期",
        flowStatus: "审批中",
        currentNode: "主管领导审核",
        submitter: "王卿明",
        submitTime: "2026-04-10 11:00",
        flowIndex: 2,
        oaMinutes: "2026-01-09",
        projectType: "基建",
        isLimit: "是",
        isSci: "否",
        sciName: "",
        wbs: "WBS-GS-701",
        isXiAn: "是",
        srmDate: "2026-01-12",
        flowProgress: "询价编制文件",
        publishDate: "2026-01-18",
        publishUrl: "https://srm.ly/gs77",
        basis: "新建项目",
        pkgNo: "PKG-GS-11",
        procCode: "PROC-2026-018",
        openDate: "2026-02-02",
        awardDate: "",
        publicDate: "",
        noticeDate: "",
        dealAmount: 0,
        supplier: "—",
        isAnnual: "是",
        stampDate: "",
        remark: "开标后评审中",
        kpiRemark: ""
      },
      {
        id: "p4",
        projectName: "华东光伏站逆变器采购",
        method: "招标",
        targetType: "物资",
        bizDept: "运维二部",
        handler: "王芳",
        budget: 760,
        isFrame: "是",
        oaApprove: "2025-12-12",
        committeeNo: "2025-12期",
        flowStatus: "已通过",
        currentNode: "已完成",
        submitter: "王卿明",
        submitTime: "2025-12-01 08:00",
        flowIndex: 5,
        oaMinutes: "2025-12-20",
        projectType: "生产",
        isLimit: "是",
        isSci: "否",
        sciName: "",
        wbs: "WBS-HD-222",
        isXiAn: "否",
        srmDate: "2025-12-25",
        flowProgress: "流程完毕",
        publishDate: "2026-01-08",
        publishUrl: "https://srm.ly/ef81",
        basis: "年度备件计划",
        pkgNo: "PKG-HD-08",
        procCode: "PROC-2025-288",
        openDate: "2026-01-20",
        awardDate: "2026-01-28",
        publicDate: "2026-01-30",
        noticeDate: "2026-02-03",
        dealAmount: 702,
        supplier: "东风",
        isAnnual: "是",
        stampDate: "2026-02-08",
        remark: "提前完成",
        kpiRemark: "按期归档"
      },
      {
        id: "p5",
        projectName: "总部办公网络升级服务",
        method: "单一来源",
        targetType: "服务",
        bizDept: "综合管理部",
        handler: "刘静",
        budget: 120,
        isFrame: "否",
        oaApprove: "2026-02-08",
        committeeNo: "2026-03期",
        flowStatus: "已驳回",
        currentNode: "已驳回",
        submitter: "刘静",
        submitTime: "2026-04-05 14:20",
        flowIndex: 1,
        oaMinutes: "2026-02-12",
        projectType: "综合",
        isLimit: "是",
        isSci: "是",
        sciName: "智联办公2.0",
        wbs: "WBS-ZH-035",
        isXiAn: "否",
        srmDate: "2026-02-14",
        flowProgress: "神华推送招标文件",
        publishDate: "",
        publishUrl: "",
        basis: "信息化升级",
        pkgNo: "PKG-ZH-03",
        procCode: "PROC-2026-055",
        openDate: "",
        awardDate: "",
        publicDate: "",
        noticeDate: "",
        dealAmount: 0,
        supplier: "—",
        isAnnual: "否",
        stampDate: "",
        remark: "预算科目需调整",
        kpiRemark: ""
      },
      {
        id: "p6",
        projectName: "海上风场无人机巡检",
        method: "单一来源",
        targetType: "服务",
        bizDept: "数字化中心",
        handler: "周宁",
        budget: 95,
        isFrame: "否",
        oaApprove: "2026-02-15",
        committeeNo: "2026-03期",
        flowStatus: "审批中",
        currentNode: "公司采购主管审核",
        submitter: "周宁",
        submitTime: "2026-04-16 10:00",
        flowIndex: 3,
        oaMinutes: "2026-02-18",
        projectType: "综合",
        isLimit: "是",
        isSci: "是",
        sciName: "海风AI巡检",
        wbs: "WBS-IT-023",
        isXiAn: "否",
        srmDate: "2026-02-20",
        flowProgress: "等待上会",
        publishDate: "",
        publishUrl: "",
        basis: "科技立项",
        pkgNo: "PKG-IT-02",
        procCode: "PROC-2026-071",
        openDate: "",
        awardDate: "",
        publicDate: "",
        noticeDate: "",
        dealAmount: 0,
        supplier: "—",
        isAnnual: "是",
        stampDate: "",
        remark: "科技项目",
        kpiRemark: ""
      }
    ];
  }

  function rowVisible(row) {
    var rg = roleGroup();
    var role = currentRole();
    if (rg === "viewer" || rg === "owner") return true;
    if (rg === "approver") {
    if (role === "dept_head") return row.bizDept === DEPT_HEAD_DEPT;
    if (role === "supervisor_leader") return SUPERVISED_DEPTS.indexOf(row.bizDept) >= 0;
      if (role === "corp_purchase_head") return true;
    }
    if (rg === "filler") {
      return row.bizDept === DEPT_HEAD_DEPT;
    }
    return false;
  }

  function canApproveRow(row) {
    var u = currentUserName();
    var role = currentRole();
    if (row.flowStatus !== "审批中") return false;
    if (role === "dept_head" && row.currentNode === "部门主管审核" && row.bizDept === DEPT_HEAD_DEPT) return u === "王超";
    if (role === "supervisor_leader" && row.currentNode === "主管领导审核" && SUPERVISED_DEPTS.indexOf(row.bizDept) >= 0)
      return true;
    if (role === "corp_purchase_head" && row.currentNode === "公司采购主管审核") return u === "王超";
    if (role === "corp_purchase_specialist" && row.currentNode === "公司采购专责汇总") return u === "王卿明";
    return false;
  }

  function opButtons(row) {
    var html = [];

    function add(label, act) {
      html.push('<button type="button" class="carrier-btn-add ppm-btn-op" data-act="' + act + '" data-id="' + row.id + '">' + label + "</button>");
    }
    add("编辑", "fill");
    add("查看", "view");
    add("删除", "delete");
    return '<span class="ppm-ops">' + html.join("") + "</span>";
  }

  function getFilters() {
    return {
      name: (document.getElementById("ppmFName") && document.getElementById("ppmFName").value.trim()) || "",
      dept: (document.getElementById("ppmFDept") && document.getElementById("ppmFDept").value) || "",
      method: (document.getElementById("ppmFMethod") && document.getElementById("ppmFMethod").value) || "",
      flow: (document.getElementById("ppmFFlow") && document.getElementById("ppmFFlow").value) || ""
    };
  }

  function applySearch(list) {
    var f = getFilters();
    return list.filter(function (row) {
      if (!rowVisible(row)) return false;
      if (f.name && row.projectName.indexOf(f.name) < 0) return false;
      if (f.dept && row.bizDept !== f.dept) return false;
      if (f.method && row.method !== f.method) return false;
      if (f.flow && String(row.flowProgress || "") !== f.flow) return false;
      return true;
    });
  }

  function renderTable() {
    var tbody = document.getElementById("ppmTableBody");
    if (!tbody) return;
    var rows = applySearch(CTX.list);
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td class="ppm-empty" colspan="38">暂无数据（可切换演示角色或调整筛选条件）</td></tr>';
      return;
    }
    tbody.innerHTML = rows
      .map(function (row, idx) {
        var kpi = calcKpi(row);
        return (
          "<tr data-row-id='" + escapeHtml(row.id) + "'>" +
          '<td><input type="checkbox" class="ppm-row-chk" data-id="' + escapeHtml(row.id) + '"></td>' +
          '<td class="cell-num">' +
          (idx + 1) +
          "</td>" +
          "<td>" +
          escapeHtml(getOwningCompanyLabel()) +
          "</td>" +
          "<td>" +
          escapeHtml(row.projectName) +
          "</td>" +
          "<td>" +
          escapeHtml(row.method) +
          "</td>" +
          "<td>" +
          escapeHtml(row.targetType) +
          "</td>" +
          "<td>" +
          escapeHtml(row.bizDept) +
          "</td>" +
          "<td>" +
          escapeHtml(row.handler) +
          "</td>" +
          "<td>" +
          escapeHtml(row.isFrame || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.projectType || "—") +
          "</td>" +
          '<td class="cell-num">' +
          (row.budget != null ? Number(row.budget).toFixed(2) : "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.isLimit || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.isSci || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.sciName || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.wbs || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.isXiAn || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.oaApprove || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.oaMinutes || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.committeeNo || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.srmDate || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.flowProgress || row.flowStatus || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.publishDate || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.publishUrl || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.basis || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.pkgNo || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.procCode || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.openDate || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.awardDate || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.publicDate || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.noticeDate || "—") +
          "</td>" +
          "<td class='cell-num'>" +
          (row.dealAmount != null && row.dealAmount !== "" ? Number(row.dealAmount).toFixed(2) : "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.supplier || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.isAnnual || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.stampDate || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(kpi.k1s) +
          "</td>" +
          "<td>" +
          escapeHtml(kpi.k2s) +
          "</td>" +
          "<td>" +
          escapeHtml(row.kpiRemark || "—") +
          "</td>" +
          "<td>" +
          escapeHtml(row.remark || "—") +
          "</td>" +
          "<td>" +
          (CTX.inlineEdit ? '<span style="color:#1677ff;font-weight:600">编辑中</span>' : opButtons(row)) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    if (CTX.inlineEdit) applyInlineEditors();
  }

  function bindInlineInput(input, row, field, parser) {
    if (!input) return;
    input.addEventListener("change", function () {
      row[field] = parser ? parser(input.value) : input.value;
      if (field === "srmDate" || field === "stampDate" || field === "noticeDate") renderTable();
    });
  }

  function makeTextInput(val) {
    var i = document.createElement("input");
    i.className = "carrier-search";
    i.style.minWidth = "120px";
    i.style.border = "0";
    i.style.boxShadow = "none";
    i.style.background = "transparent";
    i.style.padding = "4px 6px";
    i.value = val == null ? "" : String(val);
    return i;
  }

  function makeDateInput(val) {
    var i = document.createElement("input");
    i.type = "date";
    i.className = "carrier-search";
    i.style.border = "0";
    i.style.boxShadow = "none";
    i.style.background = "transparent";
    i.style.padding = "4px 6px";
    i.value = val || "";
    return i;
  }

  function makeNumberInput(val) {
    var i = document.createElement("input");
    i.type = "number";
    i.step = "0.01";
    i.className = "carrier-search";
    i.style.minWidth = "96px";
    i.style.border = "0";
    i.style.boxShadow = "none";
    i.style.background = "transparent";
    i.style.padding = "4px 6px";
    i.value = val == null || val === "" ? "" : String(val);
    return i;
  }

  function makeSelect(value, options) {
    var s = document.createElement("select");
    s.className = "carrier-select";
    s.style.border = "0";
    s.style.boxShadow = "none";
    s.style.background = "transparent";
    s.style.padding = "4px 6px";
    options.forEach(function (op) {
      var o = document.createElement("option");
      o.value = op;
      o.textContent = op;
      if (String(value || "") === op) o.selected = true;
      s.appendChild(o);
    });
    return s;
  }

  function putEditor(td, el) {
    if (!td || !el) return;
    td.innerHTML = "";
    td.appendChild(el);
  }

  function applyInlineEditors() {
    var tbody = document.getElementById("ppmTableBody");
    if (!tbody) return;
    var rows = tbody.querySelectorAll("tr[data-row-id]");
    rows.forEach(function (tr) {
      var row = findRow(tr.getAttribute("data-row-id"));
      if (!row) return;
      var tds = tr.querySelectorAll("td");
      if (tds.length < 38) return;
      var el;

      tds[2].textContent = getOwningCompanyLabel();
      el = makeTextInput(row.projectName); putEditor(tds[3], el); bindInlineInput(el, row, "projectName");
      el = makeSelect(row.method, ["招标", "询价", "单一来源"]); putEditor(tds[4], el); bindInlineInput(el, row, "method");
      el = makeSelect(row.targetType, ["物资", "服务", "工程"]); putEditor(tds[5], el); bindInlineInput(el, row, "targetType");
      el = makeTextInput(row.bizDept); putEditor(tds[6], el); bindInlineInput(el, row, "bizDept");
      el = makeTextInput(row.handler); putEditor(tds[7], el); bindInlineInput(el, row, "handler");
      el = makeSelect(row.isFrame || "否", ["是", "否"]); putEditor(tds[8], el); bindInlineInput(el, row, "isFrame");
      el = makeSelect(row.projectType || "生产", ["生产", "综合", "基建"]); putEditor(tds[9], el); bindInlineInput(el, row, "projectType");
      el = makeNumberInput(row.budget); putEditor(tds[10], el); bindInlineInput(el, row, "budget", function (v) { return parseFloat(v) || 0; });
      el = makeSelect(row.isLimit || "否", ["是", "否"]); putEditor(tds[11], el); bindInlineInput(el, row, "isLimit");
      el = makeSelect(row.isSci || "否", ["是", "否"]); putEditor(tds[12], el); bindInlineInput(el, row, "isSci");
      el = makeTextInput(row.sciName || ""); putEditor(tds[13], el); bindInlineInput(el, row, "sciName");
      el = makeTextInput(row.wbs || ""); putEditor(tds[14], el); bindInlineInput(el, row, "wbs");
      el = makeSelect(row.isXiAn || "否", ["是", "否"]); putEditor(tds[15], el); bindInlineInput(el, row, "isXiAn");
      el = makeDateInput(row.oaApprove || ""); putEditor(tds[16], el); bindInlineInput(el, row, "oaApprove");
      el = makeDateInput(row.oaMinutes || ""); putEditor(tds[17], el); bindInlineInput(el, row, "oaMinutes");
      el = makeTextInput(row.committeeNo || ""); putEditor(tds[18], el); bindInlineInput(el, row, "committeeNo");
      el = makeDateInput(row.srmDate || ""); putEditor(tds[19], el); bindInlineInput(el, row, "srmDate");
      el = makeSelect(pickFlowProgressValue(row.flowProgress), getFlowProgressOptions()); putEditor(tds[20], el); bindInlineInput(el, row, "flowProgress");
      el = makeDateInput(row.publishDate || ""); putEditor(tds[21], el); bindInlineInput(el, row, "publishDate");
      el = makeTextInput(row.publishUrl || ""); putEditor(tds[22], el); bindInlineInput(el, row, "publishUrl");
      el = makeTextInput(row.basis || ""); putEditor(tds[23], el); bindInlineInput(el, row, "basis");
      el = makeTextInput(row.pkgNo || ""); putEditor(tds[24], el); bindInlineInput(el, row, "pkgNo");
      el = makeTextInput(row.procCode || ""); putEditor(tds[25], el); bindInlineInput(el, row, "procCode");
      el = makeDateInput(row.openDate || ""); putEditor(tds[26], el); bindInlineInput(el, row, "openDate");
      el = makeDateInput(row.awardDate || ""); putEditor(tds[27], el); bindInlineInput(el, row, "awardDate");
      el = makeDateInput(row.publicDate || ""); putEditor(tds[28], el); bindInlineInput(el, row, "publicDate");
      el = makeDateInput(row.noticeDate || ""); putEditor(tds[29], el); bindInlineInput(el, row, "noticeDate");
      el = makeNumberInput(row.dealAmount || 0); putEditor(tds[30], el); bindInlineInput(el, row, "dealAmount", function (v) { return parseFloat(v) || 0; });
      el = makeTextInput(row.supplier || ""); putEditor(tds[31], el); bindInlineInput(el, row, "supplier");
      el = makeSelect(row.isAnnual || "否", ["是", "否"]); putEditor(tds[32], el); bindInlineInput(el, row, "isAnnual");
      el = makeDateInput(row.stampDate || ""); putEditor(tds[33], el); bindInlineInput(el, row, "stampDate");
      tds[34].textContent = calcKpi(row).k1s;
      tds[35].textContent = calcKpi(row).k2s;
      el = makeTextInput(row.kpiRemark || ""); putEditor(tds[36], el); bindInlineInput(el, row, "kpiRemark");
      el = makeTextInput(row.remark || ""); putEditor(tds[37], el); bindInlineInput(el, row, "remark");
    });
  }

  function findRow(id) {
    return CTX.list.find(function (r) {
      return r.id === id;
    });
  }

  function showModal(id, show) {
    var el = document.getElementById(id);
    if (!el) return;
    function setDialogHeaderText(mask, text) {
      if (!mask) return;
      var hd = mask.querySelector(".ppm-dialog-hd");
      if (!hd) return;
      var closeBtn = hd.querySelector("[data-close]");
      var titleSpan = hd.querySelector("[data-ppm-title='1']");
      if (!titleSpan) {
        titleSpan = document.createElement("span");
        titleSpan.setAttribute("data-ppm-title", "1");
        if (closeBtn) hd.insertBefore(titleSpan, closeBtn);
        else hd.insertBefore(titleSpan, hd.firstChild);
      }
      titleSpan.textContent = text || "采购信息台帐";
      Array.prototype.forEach.call(hd.childNodes, function (n) {
        if (n && n.nodeType === 3 && String(n.textContent || "").trim()) n.textContent = "";
      });
    }
    if (show) {
      el.classList.add("show");
      if (id === "ppmModalSubmit") setDialogHeaderText(el, "采购信息台帐-提交确认");
      if (id === "ppmModalWithdraw") setDialogHeaderText(el, "采购信息台帐-撤回确认");
      if (id === "ppmModalProgress") setDialogHeaderText(el, "采购信息台帐-审批进度");
      if (id === "ppmModalApprove") setDialogHeaderText(el, "采购信息台帐-采购计划审批");
      if (id === "ppmModalFieldCfg") setDialogHeaderText(el, "采购信息台帐-字段配置");
      if (id === "ppmModalDelete") {
        setDialogHeaderText(el, "采购信息台帐-删除确认");
        var titleEl = el.querySelector("#ppmDeleteTitle");
        if (titleEl) titleEl.textContent = "采购信息台帐-删除确认";
        var bd = el.querySelector(".ppm-dialog-bd");
        if (bd) {
          var p = bd.querySelector("#ppmDeleteText") || bd.querySelector("p");
          if (!p) {
            p = document.createElement("p");
            p.id = "ppmDeleteText";
            p.style.margin = "0";
            p.style.lineHeight = "1.6";
            bd.innerHTML = "";
            bd.appendChild(p);
          }
          p.textContent = "是否确认删除该条数据？";
        }
      }
    } else {
      el.classList.remove("show");
    }
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

  function bindModalClose() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t.getAttribute && t.getAttribute("data-close") !== null) {
        var mask = t.closest(".ppm-modal-mask");
        if (mask) mask.classList.remove("show");
      }
      if (t.classList && t.classList.contains("ppm-modal-mask")) {
        t.classList.remove("show");
      }
    });
  }

  function calcKpi(row) {
    var k1 = daysBetween(row.srmDate, row.stampDate);
    var k2 = daysBetween(row.noticeDate, row.stampDate);
    return {
      k1: k1,
      k2: k2,
      k1s: k1 === null ? "待计算" : k1 + "天",
      k2s: k2 === null ? "待计算" : k2 + "天"
    };
  }

  function buildEditForm(row, readOnly) {
    var k = calcKpi(row);
    var ro = readOnly ? " readonly disabled" : "";
    var selRo = readOnly ? " disabled" : "";
    var depts = [
      "经营发展中心",
      "运维一部",
      "运维二部",
      "运维三部",
      "工程管理部",
      "数字化中心",
      "综合管理部",
      "项目公司支持部"
    ];
    var deptOpts = depts
      .map(function (d) {
        return '<option value="' + escapeHtml(d) + '"' + (row.bizDept === d ? " selected" : "") + ">" + escapeHtml(d) + "</option>";
      })
      .join("");

    return (
      '<div class="ppm-form">' +
      '<div class="ppm-form-seg">项目基础信息</div>' +
      '<div class="ppm-form-grid ppm-form-grid-2">' +
      '<div class="ppm-form-full"><label>所属公司</label><input id="ppmOwningCompany" class="carrier-search" readonly value="' +
      escapeHtml(getOwningCompanyLabel()) +
      '" /></div>' +
      "<div><label>项目名称 " +
      (readOnly ? "" : '<span class="ppm-req">*</span>') +
      "</label><input id=\"ppmProjName\" class=\"carrier-search\" placeholder=\"请输入项目名称\" value=\"" +
      escapeHtml(row.projectName) +
      '"' +
      ro +
      " /></div>" +
      '<div><label>采购方式 ' +
      (readOnly ? "" : '<span class="ppm-req">*</span>') +
      " " +
      hint("下拉选项：招标/询价/单一来源") +
      '</label><select id="ppmMethod" class="carrier-select"' +
      selRo +
      "><option>招标</option><option>询价</option><option>单一来源</option></select></div>" +
      '<div><label>采购标的类别 ' +
      (readOnly ? "" : '<span class="ppm-req">*</span>') +
      " " +
      hint("下拉选项：物资/服务/工程") +
      '</label><select id="ppmTargetType" class="carrier-select"' +
      selRo +
      "><option>物资</option><option>服务</option><option>工程</option></select></div>" +
      '<div><label>业务部门 ' +
      (readOnly ? "" : '<span class="ppm-req">*</span>') +
      " " +
      hint("下拉菜单，从部门列表选择") +
      '</label><select id="ppmBizDept" class="carrier-select"' +
      selRo +
      ">" +
      deptOpts +
      "</select></div>" +
      '<div><label>业务经办人 ' +
      (readOnly ? "" : '<span class="ppm-req">*</span>') +
      '</label><input id="ppmHandler" type="text" class="carrier-search" placeholder="请输入业务经办人" value="' +
      (row.handler || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>是否框架 ' +
      hint("开关：是/否") +
      '</label><select id="ppmIsFrame" class="carrier-select"' +
      selRo +
      "><option>是</option><option>否</option></select></div>" +
      '<div><label>项目类别 ' +
      hint("下拉选项：生产/综合/基建") +
      '</label><select id="ppmProjCat" class="carrier-select"' +
      selRo +
      "><option>生产</option><option>综合</option><option>基建</option></select></div>" +
      '<div><label>预算（万元） ' +
      (readOnly ? "" : '<span class="ppm-req">*</span>') +
      '</label><input id="ppmBudget" type="number" step="0.01" class="carrier-search" placeholder="请输入预算金额" value="' +
      row.budget +
      '"' +
      ro +
      " /></div>" +
      '<div><label>是否限价 ' +
      hint("开关：是/否") +
      '</label><select id="ppmIsLimit" class="carrier-select"' +
      selRo +
      "><option>是</option><option>否</option></select></div>" +
      '<div><label>是否科技项目 ' +
      hint("开关：是/否") +
      '</label><select id="ppmIsSci" class="carrier-select"' +
      selRo +
      "><option>否</option><option>是</option></select></div>" +
      '<div id="ppmSciWrap" class="ppm-form-full" style="display:' +
      (row.isSci === "是" ? "block" : "none") +
      '"><label>科技项目名称</label><input id="ppmSciName" class="carrier-search" placeholder="请输入科技项目名称" value="' +
      escapeHtml(row.sciName || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>项目/WBS编码</label><input id="ppmWbs" class="carrier-search" placeholder="请输入项目/WBS编码" value="' +
      escapeHtml(row.wbs || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>是否西安公司 ' +
      hint("开关：是/否") +
      '</label><select id="ppmIsXian" class="carrier-select"' +
      selRo +
      "><option>否</option><option>是</option></select></div>" +
      "</div>" +
      '<div class="ppm-form-seg">审批信息</div>' +
      '<div class="ppm-form-grid ppm-form-grid-2">' +
      "<div><label>龙源OA审批表时间</label><input id=\"ppmOaDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.oaApprove || "") +
      '"' +
      ro +
      " /></div>" +
      "<div><label>龙源OA审查纪要时间</label><input id=\"ppmOaMinutes\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.oaMinutes || "") +
      '"' +
      ro +
      " /></div>" +
      '<div class="ppm-form-full"><label>采委会计划通过期数</label><input id="ppmCommitteeNo" class="carrier-search" placeholder="请输入采委会计划通过期数" value="' +
      escapeHtml(row.committeeNo || "") +
      '"' +
      ro +
      " /></div>" +
      "</div>" +
      '<div class="ppm-form-seg">采购流程跟踪</div>' +
      '<div class="ppm-form-grid ppm-form-grid-2">' +
      "<div><label>SRM提报时间</label><input id=\"ppmSrmDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.srmDate || "") +
      '"' +
      ro +
      ' /></div>' +
      buildFlowProgressSelectHtml(row, selRo) +
      "<div><label>挂网时间</label><input id=\"ppmPubDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.publishDate || "") +
      '"' +
      ro +
      " /></div>" +
      '<div class="ppm-form-full"><label>挂网网址</label><input id="ppmPubUrl" class="carrier-search" placeholder="请输入挂网网址" value="' +
      escapeHtml(row.publishUrl || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>采购依据</label><input id="ppmBasis" class="carrier-search" placeholder="请输入采购依据" value="' +
      escapeHtml(row.basis || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>采购标包号</label><input id="ppmPkgNo" class="carrier-search" placeholder="请输入采购标包号" value="' +
      escapeHtml(row.pkgNo || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>招标/采购编码</label><input id="ppmProcCode" class="carrier-search" placeholder="请输入招标/采购编码" value="' +
      escapeHtml(row.procCode || "") +
      '"' +
      ro +
      " /></div>" +
      "<div><label>开标时间</label><input id=\"ppmOpenDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.openDate || "") +
      '"' +
      ro +
      " /></div>" +
      "<div><label>定标时间</label><input id=\"ppmAwardDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.awardDate || "") +
      '"' +
      ro +
      " /></div>" +
      "<div><label>招标公示时间</label><input id=\"ppmPublicDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.publicDate || "") +
      '"' +
      ro +
      " /></div>" +
      "<div><label>中标/成交通知书下发时间</label><input id=\"ppmNoticeDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.noticeDate || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>中标/成交金额（万元）</label><input id="ppmDealAmount" type="number" step="0.01" class="carrier-search" placeholder="请输入中标/成交金额" value="' +
      (row.dealAmount || 0) +
      '"' +
      ro +
      " /></div>" +
      '<div><label>中标/成交供应商</label><input id="ppmSupplier" class="carrier-search" placeholder="请输入中标/成交供应商" value="' +
      escapeHtml(row.supplier || "") +
      '"' +
      ro +
      " /></div>" +
      '<div><label>是否关联年度计划 ' +
      hint("开关：是/否") +
      '</label><select id="ppmAnnual" class="carrier-select"' +
      selRo +
      "><option>是</option><option>否</option></select></div>" +
      "<div><label>合同用印时间</label><input id=\"ppmStampDate\" type=\"date\" class=\"carrier-search\" value=\"" +
      (row.stampDate || "") +
      '"' +
      ro +
      " /></div>" +
      '<div class="ppm-form-full"><label>备注</label><textarea id="ppmRemark" rows="3" style="width:100%;box-sizing:border-box;border:1px solid #d9d9d9;border-radius:6px;padding:8px" placeholder="请输入备注"' +
      ro +
      ">" +
      escapeHtml(row.remark || "") +
      "</textarea></div>" +
      "</div>" +
      '<div class="ppm-form-seg">考核点（只读，自动计算）</div>' +
      '<div class="ppm-form-grid ppm-form-grid-2">' +
      '<div><label>考核点1：采购时长 ' +
      hint("等于：SRM提报时间 - 采购合同签订时间") +
      '</label><input id="ppmKpi1" class="carrier-search" value="' +
      k.k1s +
      '" readonly /></div>' +
      '<div><label>考核点2：合同签订时长 ' +
      hint("等于：合同用印时间 - 中标/成交通知书下发时间") +
      '</label><input id="ppmKpi2" class="carrier-search" value="' +
      k.k2s +
      '" readonly /></div>' +
      '<div class="ppm-form-full"><label>考核点备注</label><input id="ppmKpiRemark" class="carrier-search" placeholder="请输入考核点备注" value="' +
      escapeHtml(row.kpiRemark || "") +
      '"' +
      ro +
      " /></div>" +
      "</div>" +
      "</div>"
    );
  }

  function syncSelectsFromRow(row) {
    var oc = document.getElementById("ppmOwningCompany");
    if (oc) oc.value = getOwningCompanyLabel();
    var m = document.getElementById("ppmMethod");
    if (m) m.value = row.method;
    var tt = document.getElementById("ppmTargetType");
    if (tt) tt.value = row.targetType;
    var pc = document.getElementById("ppmProjCat");
    if (pc) pc.value = row.projectType || "生产";
    var fr = document.getElementById("ppmIsFrame");
    if (fr) fr.value = row.isFrame || "否";
    var lim = document.getElementById("ppmIsLimit");
    if (lim) lim.value = row.isLimit || "否";
    var sci = document.getElementById("ppmIsSci");
    if (sci) sci.value = row.isSci || "否";
    var xa = document.getElementById("ppmIsXian");
    if (xa) xa.value = row.isXiAn || "否";
    var an = document.getElementById("ppmAnnual");
    if (an) an.value = row.isAnnual || "否";
    var h = document.getElementById("ppmHandler");
    if (h) h.value = row.handler;
  }

  function wireEditForm(row) {
    var sci = document.getElementById("ppmIsSci");
    var wrap = document.getElementById("ppmSciWrap");
    if (sci && wrap) {
      sci.addEventListener("change", function () {
        wrap.style.display = sci.value === "是" ? "block" : "none";
      });
    }
    var recalc = function () {
      var r = Object.assign({}, row, {
        srmDate: (document.getElementById("ppmSrmDate") && document.getElementById("ppmSrmDate").value) || "",
        stampDate: (document.getElementById("ppmStampDate") && document.getElementById("ppmStampDate").value) || "",
        noticeDate: (document.getElementById("ppmNoticeDate") && document.getElementById("ppmNoticeDate").value) || ""
      });
      var k = calcKpi(r);
      var k1 = document.getElementById("ppmKpi1");
      var k2 = document.getElementById("ppmKpi2");
      if (k1) k1.value = k.k1s;
      if (k2) k2.value = k.k2s;
    };
    ["ppmSrmDate", "ppmStampDate", "ppmNoticeDate"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", recalc);
    });
  }

  function collectForm(row) {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value : "";
    };
    row.projectName = get("ppmProjName");
    row.method = get("ppmMethod");
    row.targetType = get("ppmTargetType");
    row.bizDept = get("ppmBizDept");
    row.handler = get("ppmHandler");
    row.isFrame = get("ppmIsFrame");
    row.projectType = get("ppmProjCat");
    row.budget = parseFloat(get("ppmBudget")) || 0;
    row.isLimit = get("ppmIsLimit");
    row.isSci = get("ppmIsSci");
    row.sciName = get("ppmSciName");
    row.wbs = get("ppmWbs");
    row.isXiAn = get("ppmIsXian");
    row.oaApprove = get("ppmOaDate");
    row.oaMinutes = get("ppmOaMinutes");
    row.committeeNo = get("ppmCommitteeNo");
    row.srmDate = get("ppmSrmDate");
    row.flowProgress = get("ppmFlowProgress");
    row.publishDate = get("ppmPubDate");
    row.publishUrl = get("ppmPubUrl");
    row.basis = get("ppmBasis");
    row.pkgNo = get("ppmPkgNo");
    row.procCode = get("ppmProcCode");
    row.openDate = get("ppmOpenDate");
    row.awardDate = get("ppmAwardDate");
    row.publicDate = get("ppmPublicDate");
    row.noticeDate = get("ppmNoticeDate");
    row.dealAmount = parseFloat(get("ppmDealAmount")) || 0;
    row.supplier = get("ppmSupplier");
    row.isAnnual = get("ppmAnnual");
    row.stampDate = get("ppmStampDate");
    row.remark = get("ppmRemark");
    row.kpiRemark = get("ppmKpiRemark");
  }

  function getEditingRow() {
    return findRow(CTX.editingId) || CTX.editBuffer;
  }

  function renderFormFooter(mode) {
    var ft = document.getElementById("ppmModalEditFt");
    if (!ft) return;
    if (mode === "view") {
      ft.style.display = "flex";
      ft.innerHTML =
        '<button type="button" class="carrier-btn-add" data-close style="background:#fff;color:#595959;border:1px solid #d9d9d9">取消</button>';
      return;
    }
    if (mode === "approve") {
      ft.style.display = "flex";
      ft.innerHTML =
        '<button type="button" class="carrier-btn-add" data-form-act="approvePass" style="background:#f6ffed;color:#389e0d;border:1px solid #b7eb8f">审批通过</button>' +
        '<button type="button" class="carrier-btn-add" data-form-act="approveReject" style="background:#fff1f0;color:#cf1322;border:1px solid #ffccc7">驳回</button>' +
        '<button type="button" class="carrier-btn-add" data-close style="background:#fff;color:#595959;border:1px solid #d9d9d9">取消</button>';
      return;
    }
    ft.style.display = "flex";
    ft.innerHTML =
      '<button type="button" class="carrier-btn-add" data-form-act="submit">保存</button>' +
      '<button type="button" class="carrier-btn-add" data-close style="background:#fff;color:#595959;border:1px solid #d9d9d9">取消</button>';
  }

  function openEdit(row, mode) {
    CTX.editBuffer = row;
    CTX.editingId = row.id;
    CTX.formMode = mode || "view";
    CTX.viewMode = CTX.formMode !== "fill";
    var title = document.getElementById("ppmModalEditTitle");
    if (title) {
      if (CTX.formMode === "view") title.textContent = "采购信息台帐-查看";
      else if (CTX.formMode === "approve") title.textContent = "采购信息台帐-审核";
      else if (CTX.formMode === "fill" && findRow(row.id)) title.textContent = "采购信息台帐-编辑";
      else title.textContent = "采购信息台帐-新增";
      if (!String(title.textContent || "").trim()) title.textContent = "采购信息台帐";
    }
    var body = document.getElementById("ppmModalEditBody");
    if (body) body.innerHTML = buildEditForm(row, CTX.viewMode);
    ensureFormLabelText();
    syncSelectsFromRow(row);
    wireEditForm(row);
    renderFormFooter(CTX.formMode);
    showModal("ppmModalEdit", true);
  }

  function ensureFormLabelText() {
    var body = document.getElementById("ppmModalEditBody");
    if (!body) return;
    var textByFieldId = {
      ppmOwningCompany: "所属公司",
      ppmProjName: "项目名称",
      ppmMethod: "采购方式",
      ppmTargetType: "采购标的类别",
      ppmBizDept: "业务部门",
      ppmHandler: "业务经办人",
      ppmIsFrame: "是否框架",
      ppmProjCat: "项目类别",
      ppmBudget: "预算（万元）",
      ppmIsLimit: "是否限价",
      ppmIsSci: "是否科技项目",
      ppmSciName: "科技项目名称",
      ppmWbs: "项目/WBS编码",
      ppmIsXian: "是否西安公司",
      ppmOaDate: "龙源OA审批表时间",
      ppmOaMinutes: "龙源OA审查纪要时间",
      ppmCommitteeNo: "采委会计划通过期数",
      ppmSrmDate: "SRM提报时间",
      ppmFlowProgress: "采购流程进度",
      ppmPubDate: "挂网时间",
      ppmPubUrl: "挂网网址",
      ppmBasis: "采购依据",
      ppmPkgNo: "采购标包号",
      ppmProcCode: "招标/采购编码",
      ppmOpenDate: "开标时间",
      ppmAwardDate: "定标时间",
      ppmPublicDate: "招标公示时间",
      ppmNoticeDate: "中标/成交通知书下发时间",
      ppmDealAmount: "中标/成交金额（万元）",
      ppmSupplier: "中标/成交供应商",
      ppmAnnual: "是否关联年度计划",
      ppmStampDate: "合同用印时间",
      ppmRemark: "备注",
      ppmKpi1: "考核点1：采购时长",
      ppmKpi2: "考核点2：合同签订时长",
      ppmKpiRemark: "考核点备注"
    };
    var labels = body.querySelectorAll("label");
    Array.prototype.forEach.call(labels, function (lb) {
      var clone = lb.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll(".ppm-req,.ppm-hint,.ppm-hint-tip"), function (n) {
        n.parentNode && n.parentNode.removeChild(n);
      });
      var plain = (clone.textContent || "").replace(/\s+/g, "");
      if (plain) return;
      var wrap = lb.closest("div");
      var field = wrap && wrap.querySelector ? wrap.querySelector("input,select,textarea") : null;
      if (!field || !field.id || !textByFieldId[field.id]) return;
      var textSpan = document.createElement("span");
      textSpan.className = "ppm-label-fix";
      textSpan.textContent = textByFieldId[field.id] + " ";
      lb.insertBefore(textSpan, lb.firstChild);
    });
  }

  function newRowTemplate() {
    return {
      id: "n" + Date.now(),
      projectName: "",
      method: "招标",
      targetType: "物资",
      bizDept: "经营发展中心",
      handler: "宋中波",
      budget: 0,
      isFrame: "否",
      oaApprove: "",
      committeeNo: "",
      flowStatus: "草稿",
      currentNode: "—",
      submitter: currentUserName(),
      submitTime: "—",
      flowIndex: 0,
      oaMinutes: "",
      projectType: "生产",
      isLimit: "否",
      isSci: "否",
      sciName: "",
      wbs: "",
      isXiAn: "否",
      srmDate: "",
      flowProgress: pickFlowProgressValue(""),
      publishDate: "",
      publishUrl: "",
      basis: "",
      pkgNo: "",
      procCode: "",
      openDate: "",
      awardDate: "",
      publicDate: "",
      noticeDate: "",
      dealAmount: 0,
      supplier: "",
      isAnnual: "否",
      stampDate: "",
      remark: "",
      kpiRemark: ""
    };
  }

  function renderProgress(row) {
    var stepsHost = document.getElementById("ppmProgressSteps");
    if (stepsHost && stepsHost.parentNode) {
      var meta = document.getElementById("ppmProgressOwning");
      if (!meta) {
        meta = document.createElement("p");
        meta.id = "ppmProgressOwning";
        meta.style.cssText = "font-size:13px;margin:0 0 8px;color:#1f3551";
        stepsHost.parentNode.insertBefore(meta, stepsHost);
      }
      meta.innerHTML = "<strong>所属公司：</strong>" + escapeHtml(getOwningCompanyLabel());
    }
    var idx = Math.min(row.flowIndex, STEPS.length);
    if (row.flowStatus === "已通过") idx = STEPS.length;
    var stepsEl = document.getElementById("ppmProgressSteps");
    if (stepsEl) {
      stepsEl.innerHTML = STEPS.map(function (s, i) {
        var cls = "ppm-step";
        if (row.flowStatus === "已驳回" && i === idx - 1) cls += " is-reject";
        else if (i < idx) cls += " done";
        else if (i === idx && row.flowStatus === "审批中") cls += " active";
        return '<span class="' + cls + '">' + escapeHtml(s) + "</span>";
      }).join("");
    }
    var tb = document.getElementById("ppmProgressRecords");
    if (tb) {
      var records = [
        { node: "部门专责提报", user: row.submitter, time: row.submitTime, res: "提交", opinion: "—" },
        { node: "部门主管审核", user: "王超", time: "2026-04-18 10:00", res: "通过", opinion: "同意" },
        { node: "主管领导审核", user: "曾繁礼", time: "—", res: "—", opinion: "—" },
        { node: "公司采购主管审核", user: "王超", time: "—", res: "—", opinion: "—" },
        { node: "公司采购专责汇总", user: "王卿明", time: "—", res: "—", opinion: "—" }
      ];
      if (row.flowStatus === "草稿") records = [];
      tb.innerHTML = records
        .map(function (r) {
          return (
            "<tr><td>" +
            escapeHtml(r.node) +
            "</td><td>" +
            escapeHtml(r.user) +
            "</td><td>" +
            escapeHtml(r.time) +
            "</td><td>" +
            escapeHtml(r.res) +
            "</td><td>" +
            escapeHtml(r.opinion) +
            "</td></tr>"
          );
        })
        .join("");
    }
  }

  function fillApprovePreview(row) {
    var el = document.getElementById("ppmApprPreview");
    if (el) {
      el.innerHTML =
        "<p><strong>" +
        escapeHtml(row.projectName) +
        "</strong>　" +
        escapeHtml(row.bizDept) +
        "　预算 " +
        row.budget +
        " 万元</p>" +
        "<p style=\"font-size:12px;color:#62788f;margin-top:6px\">采购方式：" +
        escapeHtml(row.method) +
        "　标的类别：" +
        escapeHtml(row.targetType) +
        "　经办人：" +
        escapeHtml(row.handler) +
        "</p>";
    }
    var det = document.getElementById("ppmApprDetail");
    if (det) {
      det.innerHTML =
        '<table class="carrier-table" style="font-size:12px"><tbody>' +
        "<tr><th>所属公司</th><td colspan=\"3\">" +
        escapeHtml(getOwningCompanyLabel()) +
        "</td></tr>" +
        "<tr><th>项目名称</th><td>" +
        escapeHtml(row.projectName) +
        "</td><th>预算（万元）</th><td>" +
        row.budget +
        "</td></tr>" +
        "<tr><th>采购方式</th><td>" +
        escapeHtml(row.method) +
        "</td><th>标的类别</th><td>" +
        escapeHtml(row.targetType) +
        "</td></tr>" +
        "<tr><th>业务部门</th><td>" +
        escapeHtml(row.bizDept) +
        "</td><th>业务经办人</th><td>" +
        escapeHtml(row.handler) +
        "</td></tr>" +
        "<tr><th>是否框架</th><td>" +
        escapeHtml(row.isFrame) +
        "</td><th>项目类别</th><td>" +
        escapeHtml(row.projectType || "") +
        "</td></tr>" +
        "<tr><th>SRM提报时间</th><td>" +
        escapeHtml(row.srmDate || "—") +
        "</td><th>采购流程进度</th><td>" +
        escapeHtml(row.flowProgress || "—") +
        "</td></tr>" +
        "<tr><th>备注</th><td colspan=\"3\">" +
        escapeHtml(row.remark || "—") +
        "</td></tr></tbody></table>";
    }
    var info = document.getElementById("ppmApprInfo");
    if (info) {
      info.innerHTML =
        "当前流程：<strong>采购计划审批</strong>　申请人：" +
        escapeHtml(row.submitter) +
        "　申请时间：" +
        escapeHtml(row.submitTime) +
        "　当前节点：" +
        escapeHtml(row.currentNode);
    }
  }

  function onTableClick(e) {
    if (CTX.inlineEdit) return;
    var btn = e.target.closest(".ppm-btn-op, .map-op-action-link, .js-op, a, button");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    var id = btn.getAttribute("data-id");
    if (!id) {
      var tr0 = btn.closest("tr");
      if (tr0) id = tr0.getAttribute("data-row-id");
    }
    if (!act) {
      var txt0 = (btn.textContent || "").replace(/\s+/g, "");
      if (txt0.indexOf("编辑") >= 0) act = "fill";
      else if (txt0.indexOf("查看") >= 0) act = "view";
      else if (txt0.indexOf("删除") >= 0) act = "delete";
    }
    if (!act || !id) return;
    var row = findRow(id);
    if (!row) return;

    if (act === "view") {
      openEdit(row, "view");
      return;
    }
    if (act === "fill") {
      openEdit(row, "fill");
      return;
    }
    if (act === "new") {
      var cp = JSON.parse(JSON.stringify(row));
      cp.id = "N" + Date.now();
      cp.projectName = "新建采购项目";
      cp.flowStatus = "草稿";
      cp.currentNode = "未提交";
      cp.flowIndex = 0;
      cp.submitTime = "";
      CTX.list.unshift(cp);
      renderTable();
      openEdit(cp, "fill");
      return;
    }
    if (act === "history") {
      openUnifiedProgressModal();
      return;
    }
    if (act === "return") {
      row.flowStatus = "已驳回";
      row.currentNode = "已退回";
      renderTable();
      alert("已退回为退回未提交状态（演示）");
      return;
    }
    if (act === "delete") {
      CTX.pendingDeleteId = id;
      showModal("ppmModalDelete", true);
      return;
    }
    if (act === "withdraw") {
      CTX.pendingWithdrawId = id;
      showModal("ppmModalWithdraw", true);
      return;
    }
    if (act === "submit") {
      CTX.pendingSubmitAfterSave = true;
      showModal("ppmModalSubmit", true);
      return;
    }
    if (act === "approve") {
      openEdit(row, "approve");
      return;
    }
  }

  function init() {
    initData();
    normalizeListFlowProgress();
    try {
      window.__mapDemoUnifiedDeleteRow = function (el, tr) {
        if (!tr) return false;
        var id = tr.getAttribute("data-row-id");
        if (!id) return false;
        var idx = CTX.list.findIndex(function (r) {
          return String(r.id) === String(id);
        });
        if (idx < 0) return false;
        CTX.list.splice(idx, 1);
        renderTable();
        return true;
      };
    } catch (eDelHook) {}
    bindModalClose();

    var deptSel = document.getElementById("ppmFDept");
    if (deptSel) {
      var depts = [
        "",
        "经营发展中心",
        "运维一部",
        "运维二部",
        "工程管理部",
        "数字化中心",
        "综合管理部"
      ];
      deptSel.innerHTML = depts
        .map(function (d, i) {
          return i === 0
            ? '<option value="">全部部门</option>'
            : '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + "</option>";
        })
        .join("");
    }

    renderFlowProgressFilterOptions();

    bindFieldCfgModalActions();

    document.getElementById("ppmBtnSearch") &&
      document.getElementById("ppmBtnSearch").addEventListener("click", renderTable);
    document.getElementById("ppmBtnReset") &&
      document.getElementById("ppmBtnReset").addEventListener("click", function () {
        document.getElementById("ppmFName").value = "";
        document.getElementById("ppmFDept").selectedIndex = 0;
        document.getElementById("ppmFMethod").selectedIndex = 0;
        var flowSel = document.getElementById("ppmFFlow");
        if (flowSel) flowSel.selectedIndex = 0;
        renderTable();
      });
    document.getElementById("ppmRole") &&
      document.getElementById("ppmRole").addEventListener("change", renderTable);

    document.getElementById("ppmBtnFieldSettings") &&
      document.getElementById("ppmBtnFieldSettings").addEventListener("click", function (e) {
        e.preventDefault();
        openFieldConfigModal();
      });
    document.getElementById("ppmFieldCfgSave") &&
      document.getElementById("ppmFieldCfgSave").addEventListener("click", function () {
        var lines = collectFieldCfgFlowLines();
        if (!lines.length) {
          demoResultToast("请至少保留一条有效的采购流程进度名称");
          return;
        }
        saveFlowProgressOptions(lines);
        normalizeListFlowProgress();
        renderFlowProgressFilterOptions();
        demoResultToast("已保存采购流程进度配置");
        closeFieldConfigModal();
        renderTable();
        var editMask = document.getElementById("ppmModalEdit");
        if (editMask && editMask.classList.contains("show")) {
          var row = getEditingRow();
          if (row) openEdit(row, CTX.formMode);
        }
      });

    var ppmBtnInlineEdit = document.getElementById("ppmBtnInlineEdit");
    var ppmBtnInlineSave = document.getElementById("ppmBtnInlineSave");
    var ppmBtnInlineCancel = document.getElementById("ppmBtnInlineCancel");
    function syncInlineEditToolbar() {
      if (ppmBtnInlineEdit) ppmBtnInlineEdit.style.display = CTX.inlineEdit ? "none" : "";
      if (ppmBtnInlineSave) ppmBtnInlineSave.style.display = CTX.inlineEdit ? "" : "none";
      if (ppmBtnInlineCancel) ppmBtnInlineCancel.style.display = CTX.inlineEdit ? "" : "none";
    }
    if (ppmBtnInlineEdit) {
      ppmBtnInlineEdit.addEventListener("click", function () {
        CTX.inlineSnapshot = JSON.parse(JSON.stringify(CTX.list));
        CTX.inlineEdit = true;
        syncInlineEditToolbar();
        renderTable();
      });
    }
    if (ppmBtnInlineSave) {
      ppmBtnInlineSave.addEventListener("click", function () {
        CTX.inlineEdit = false;
        CTX.inlineSnapshot = null;
        syncInlineEditToolbar();
        renderTable();
        alert("采购信息台帐已批量保存（演示）");
      });
    }
    if (ppmBtnInlineCancel) {
      ppmBtnInlineCancel.addEventListener("click", function () {
        if (CTX.inlineSnapshot) CTX.list = JSON.parse(JSON.stringify(CTX.inlineSnapshot));
        CTX.inlineEdit = false;
        CTX.inlineSnapshot = null;
        syncInlineEditToolbar();
        renderTable();
        alert("已取消编辑并恢复修改前数据（演示）");
      });
    }
    syncInlineEditToolbar();

    document.getElementById("ppmBtnImport") &&
      document.getElementById("ppmBtnImport").addEventListener("click", function () {
        var inp = document.getElementById("ppmFileImport");
        if (inp) inp.click();
      });
    document.getElementById("ppmBtnTpl") &&
      document.getElementById("ppmBtnTpl").addEventListener("click", function () {
        downloadTemplateCsv("采购信息台帐导入模板.csv", [
          "项目名称",
          "采购方式",
          "采购标的类别",
          "业务部门",
          "业务经办人",
          "预算（万元）",
          "采购标包号",
          "招标/采购编码",
          "中标/成交金额",
          "中标/成交供应商",
          "备注"
        ]);
      });
    document.getElementById("ppmBtnExport") &&
      document.getElementById("ppmBtnExport").addEventListener("click", function () {
        alert("已导出当前筛选数据（演示）");
      });
    document.getElementById("ppmBtnSubmitBatch") &&
      document.getElementById("ppmBtnSubmitBatch").addEventListener("click", function () {
        var rows = applySearch(CTX.list);
        rows.forEach(function (r) {
          var st = normalizeFillStatus(r.flowStatus);
          if (st === "暂存未提交" || st === "退回未提交" || st === "未开始") {
            r.flowStatus = "审批中";
            r.currentNode = "部门主管审核";
            r.flowIndex = 1;
            r.submitTime = new Date().toISOString().slice(0, 16).replace("T", " ");
          }
        });
        renderTable();
        alert("已批量提交审批（演示）");
      });
    document.getElementById("ppmBtnDeleteBatch") &&
      document.getElementById("ppmBtnDeleteBatch").addEventListener("click", function () {
        var ids = Array.prototype.slice
          .call(document.querySelectorAll(".ppm-row-chk:checked"))
          .map(function (el) { return el.getAttribute("data-id"); });
        if (!ids.length) { alert("请先勾选要删除的数据"); return; }
        function doBatchDel() {
          CTX.list = CTX.list.filter(function (r) { return ids.indexOf(r.id) < 0; });
          renderTable();
          demoResultToast("已删除！");
        }
        if (typeof window.mapDemoUnifiedShowConfirm === "function") {
          window.mapDemoUnifiedShowConfirm("是否确认删除？", function (ok) {
            if (ok) doBatchDel();
          });
        } else if (window.confirm("是否确认删除？")) {
          doBatchDel();
        }
      });
    document.getElementById("ppmChkAll") &&
      document.getElementById("ppmChkAll").addEventListener("change", function () {
        var ck = !!this.checked;
        Array.prototype.forEach.call(document.querySelectorAll(".ppm-row-chk"), function (el) { el.checked = ck; });
      });
    document.getElementById("ppmBtnAddRow") &&
      document.getElementById("ppmBtnAddRow").addEventListener("click", function () {
        CTX.list.push(newRowTemplate());
        renderTable();
      });
    document.getElementById("ppmBtnTopAdd") &&
      document.getElementById("ppmBtnTopAdd").addEventListener("click", function () {
        var row = newRowTemplate();
        CTX.editingId = row.id;
        CTX.formMode = "fill";
        openEdit(row, "fill");
      });
    var ppmModalEditFt = document.getElementById("ppmModalEditFt");
    if (ppmModalEditFt) {
      ppmModalEditFt.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-form-act]");
        if (!btn) return;
        var act = btn.getAttribute("data-form-act");
        var row = getEditingRow();
        if (act === "tplExport") {
          downloadTemplateCsv("采购信息台帐填报模板.csv", ["项目名称", "采购方式", "采购标的类别", "业务部门", "业务经办人", "预算（万元）"]);
          return;
        }
        if (!row) return;
        if (act === "submit") {
          collectForm(row);
          row.flowStatus = "审批中";
          row.currentNode = "部门主管审核";
          row.flowIndex = 1;
          row.submitTime = new Date().toISOString().slice(0, 16).replace("T", " ");
          if (CTX.list.indexOf(row) < 0) CTX.list.push(row);
          showModal("ppmModalEdit", false);
          renderTable();
          demoResultToast("已保存！");
          return;
        }
        if (act === "approvePass") {
          row.flowStatus = "已通过";
          row.currentNode = "已完成";
          row.flowIndex = STEPS.length;
          showModal("ppmModalEdit", false);
          renderTable();
          return;
        }
        if (act === "approveReject") {
          row.flowStatus = "已驳回";
          row.currentNode = "已驳回";
          showModal("ppmModalEdit", false);
          renderTable();
        }
      });
    }
    document.getElementById("ppmFileImport") &&
      document.getElementById("ppmFileImport").addEventListener("change", function () {
        if (!this.files || !this.files.length) return;
        alert("已选择文件：" + this.files[0].name + "（演示：此处接入模板校验与导入）");
        this.value = "";
      });

    document.getElementById("ppmTableBody") &&
      document.getElementById("ppmTableBody").addEventListener("click", onTableClick);

    document.getElementById("ppmModalSubmitOk") &&
      document.getElementById("ppmModalSubmitOk").addEventListener("click", function () {
        var row = getEditingRow();
        if (!row) return;
        collectForm(row);
        row.flowStatus = "审批中";
        row.currentNode = "部门主管审核";
        row.flowIndex = 1;
        row.submitTime = new Date().toISOString().slice(0, 16).replace("T", " ");
        if (row.submitter === "—" || !row.submitter) row.submitter = currentUserName();
        showModal("ppmModalSubmit", false);
        showModal("ppmModalEdit", false);
        renderTable();
        demoResultToast("已提交！");
      });

    document.getElementById("ppmModalWithdrawOk") &&
      document.getElementById("ppmModalWithdrawOk").addEventListener("click", function () {
        var row = findRow(CTX.pendingWithdrawId);
        if (row) {
          row.flowStatus = "草稿";
          row.currentNode = "—";
          row.flowIndex = 0;
        }
        showModal("ppmModalWithdraw", false);
        renderTable();
      });

    document.getElementById("ppmModalDeleteOk") &&
      document.getElementById("ppmModalDeleteOk").addEventListener("click", function () {
        var idx = CTX.list.findIndex(function (r) {
          return r.id === CTX.pendingDeleteId;
        });
        if (idx >= 0) CTX.list.splice(idx, 1);
        showModal("ppmModalDelete", false);
        renderTable();
        demoResultToast("已删除！");
      });

    document.getElementById("ppmApprPass") &&
      document.getElementById("ppmApprPass").addEventListener("click", function () {
        document.getElementById("ppmApprOpinion").value = "同意";
      });
    document.getElementById("ppmApprReject") &&
      document.getElementById("ppmApprReject").addEventListener("click", function () {
        document.getElementById("ppmApprOpinion").value = "驳回：";
      });
    document.getElementById("ppmApprOk") &&
      document.getElementById("ppmApprOk").addEventListener("click", function () {
        var op = (document.getElementById("ppmApprOpinion") && document.getElementById("ppmApprOpinion").value.trim()) || "";
        if (!op) {
          alert("请填写审批意见");
          return;
        }
        var row = findRow(CTX.editingId);
        if (row) {
          if (op.indexOf("驳回") >= 0) {
            row.flowStatus = "已驳回";
            row.currentNode = "已驳回";
          } else {
            var ni = (row.flowIndex || 0) + 1;
            row.flowIndex = ni;
            if (ni >= 5) {
              row.flowStatus = "已通过";
              row.currentNode = "已完成";
            } else {
              row.flowStatus = "审批中";
              row.currentNode = STEPS[ni];
            }
          }
        }
        showModal("ppmModalApprove", false);
        renderTable();
        alert("审批已提交（演示）");
      });

    document.getElementById("ppmApprToggle") &&
      document.getElementById("ppmApprToggle").addEventListener("click", function () {
        var box = document.getElementById("ppmApprDetail");
        if (box) box.style.display = box.style.display === "none" ? "block" : "none";
      });

    renderTable();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
