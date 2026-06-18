/**
 * 物资采购聚合页：.js-op + data-op → 演示弹窗（静态表单/只读详情）
 */
(function () {
  var mask = null;
  var titleEl = null;
  var bodyEl = null;
  var footEl = null;

  function $(id) {
    return document.getElementById(id);
  }

  function echoFieldVal(el) {
    if (!el) return "";
    if (el.tagName === "DIV" || el.tagName === "SPAN") return String(el.textContent || "").trim();
    return String(el.value || "").trim();
  }

  function setEchoField(el, v) {
    if (!el) return;
    var s = v == null || v === undefined ? "" : String(v);
    if (el.tagName === "DIV" || el.tagName === "SPAN") el.textContent = s;
    else el.value = s;
  }

  function toast(msg) {
    var id = "procDemoToast";
    var el = $(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.setAttribute(
        "style",
        "position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:1300;background:rgba(0,0,0,.75);color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;max-width:90%;pointer-events:none;opacity:0;transition:opacity .2s;"
      );
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.opacity = "0";
    }, 2200);
  }

  function cleanText(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** 入库记录表列索引（0 起算，不含勾选列） */
  var M10_INBOUND_COL = {
    acceptNo: 0,
    contractNo: 1,
    executionNo: 2,
    supplier: 3,
    productName: 4,
    inboundType: 5,
    status: 6,
    inboundTime: 7,
    inboundBy: 8,
    remark: 9
  };
  var M10_INBOUND_STATUS_TD = M10_INBOUND_COL.status;
  var M10_INBOUND_DETAIL_OMIT = {
    物资名称: 1,
    产品名称: 1,
    物资类别: 1,
    物资类型: 1,
    物资类型编码: 1,
    物资编码: 1,
    规格型号: 1,
    发货数量: 1,
    验收数量: 1,
    收货时间: 1,
    收货人: 1,
    保管人: 1,
    物流单号: 1,
    "存放仓库/货位": 1,
    仓库: 1
  };
  var M10_INBOUND_TBODY_SEL = "#proc-m10-inbound-tbody";

  function ensureRefs() {
    mask = $("procModalMask");
    titleEl = $("procModalTitle");
    bodyEl = $("procModalBody");
    footEl = $("procModalFoot");
    return !!(mask && titleEl && bodyEl && footEl);
  }

  /** 顶栏常驻 #procModalFlow，避免仅靠动态插入时被布局/缓存吞掉 */
  function setProcModalFlowVisible(v) {
    var fb = $("procModalFlow");
    if (!fb) return;
    fb.hidden = !v;
    fb.setAttribute("aria-hidden", v ? "false" : "true");
  }

  function setFoot(html) {
    footEl.innerHTML = html || '<button type="button" class="proc-btn" id="procModalClose">取消</button>';
    var closeBtn = $("procModalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeProcModal, { once: true });
    var x = $("procModalX");
    if (x) x.onclick = closeProcModal;
  }

  function clearHeadActions() {
    if (!ensureRefs()) return;
    var head = titleEl.parentNode;
    if (!head) return;
    Array.prototype.slice.call(head.querySelectorAll(".proc-modal-head-action")).forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function setHeadAction(label, onClick) {
    setHeadActions(label && typeof onClick === "function" ? [{ label: label, onClick: onClick }] : []);
  }

  function setHeadActions(actions) {
    if (!ensureRefs()) return;
    var head = titleEl.parentNode;
    if (!head) return;
    clearHeadActions();
    var list = Array.isArray(actions) ? actions : [];
    if (!list.length) return;
    var xBtn = $("procModalX");
    for (var i = list.length - 1; i >= 0; i--) {
      var item = list[i];
      if (!item || !item.label || typeof item.onClick !== "function") continue;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carrier-btn-add proc-modal-head-action";
      if (item.label === "流程进度") {
        btn.setAttribute("data-map-open-progress", "1");
      }
      btn.textContent = item.label;
      btn.style.cssText =
        "border:none;background:transparent;color:#1677ff;font-size:12px;font-weight:600;line-height:1;padding:0;min-height:auto;height:auto;box-shadow:none;cursor:pointer;margin-left:" +
        (i === list.length - 1 ? "auto" : "10px") +
        ";";
      (function (handler) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (item.label === "流程进度") syncProgressFlowScopeFromCurrentModal();
          handler();
        });
      })(item.onClick);
      head.insertBefore(btn, xBtn);
    }
  }

  function openUnifiedProgress() {
    if (typeof window.openUnifiedProgressModal === "function" && window.openUnifiedProgressModal()) {
      return;
    }
    var flowMask = document.getElementById("mapUnifiedProgressModal");
    if (!flowMask && typeof window.ensureUnifiedProgressModal === "function") {
      flowMask = window.ensureUnifiedProgressModal();
    }
    if (!flowMask) {
      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.style.display = "none";
      trigger.setAttribute("data-act", "progress");
      trigger.textContent = "查看进度";
      document.body.appendChild(trigger);
      trigger.click();
      document.body.removeChild(trigger);
      return;
    }
    flowMask.classList.add("show");
  }

  function setProgressFlowScope(scope) {
    window.__mapProgressFlowScope = scope || "";
  }

  function syncProgressFlowScopeFromCurrentModal() {
    var t = cleanText(titleEl ? titleEl.textContent || "" : "");
    if (mask && mask.classList && mask.classList.contains("qa-accept-mode")) {
      setProgressFlowScope("m10-inbound-initiate");
    } else if (t.indexOf("库存台账") >= 0 && t.indexOf("详情") >= 0) {
      setProgressFlowScope("m10-ledger-detail");
    } else if (t.indexOf("入库记录") >= 0 && t.indexOf("详情") >= 0) {
      setProgressFlowScope("m10-inbound-detail");
    }
  }

  function openProcModal(title, bodyHtml, footHtml, opts) {
    if (!ensureRefs()) return;
    mask.classList.remove("qa-accept-mode");
    var boxReset = mask.querySelector(".proc-modal-box");
    if (boxReset) boxReset.classList.remove("fullscreen");
    titleEl.textContent = title || "提示";
    bodyEl.innerHTML = bodyHtml || "";
    setHeadAction("", null);
    mask.classList.add("is-open");
    mask.setAttribute("aria-hidden", "false");
    setFoot(footHtml);
    setProcModalFlowVisible(!!(opts && opts.showFlowProgress));
    var closeBtn = $("procModalClose");
    if (closeBtn) closeBtn.textContent = "取消";
    mask.onclick = function (ev) {
      if (ev.target === mask) closeProcModal();
    };
  }

  function closeProcModal() {
    if (!ensureRefs()) return;
    if (mask && mask._qaContractNameDdTeardown) {
      try {
        mask._qaContractNameDdTeardown();
      } catch (eTd3) {}
      mask._qaContractNameDdTeardown = null;
    }
    if (mask && mask._qaInboundTypeDdTeardown) {
      try {
        mask._qaInboundTypeDdTeardown();
      } catch (eTd4) {}
      mask._qaInboundTypeDdTeardown = null;
    }
    mask.classList.remove("is-open", "qa-accept-mode");
    mask.setAttribute("aria-hidden", "true");
    mask.onclick = null;
    var box = mask.querySelector(".proc-modal-box");
    if (box) box.classList.remove("fullscreen");
    clearHeadActions();
    setProcModalFlowVisible(false);
    setProgressFlowScope("");
    if (titleEl) titleEl.textContent = "提示";
    if (footEl) footEl.innerHTML = '<button type="button" class="proc-btn" id="procModalClose">取消</button>';
    bodyEl.innerHTML = "";
    qaInboundModalMode = null;
    qaInboundContextTr = null;
  }

  /** 库存管理（m10）· 合同下拉关联字段（灰色只读为系统自动带入） */
  var QA_ACCEPT_BY_CONTRACT = {
    HT2026301: {
      contractMode: "framework_exec",
      contractName: "变流器框架",
      frameworkNo: "KJ-2026-301",
      executionNo: "ZX-2026-301-01",
      executionNos: ["ZX-2026-301-01", "ZX-2026-301-02", "ZX-2026-301-03"],
      normalNo: "CG-2026-301-01",
      material: "变流器模块",
      supplier: "远景能源",
      spec: "V2.0",
      recvTime: "2026-04-10 09:40",
      receiver: "宋中波",
      keeper: "李文涛",
      logisticsNo: "WL20260411",
      warehouse: "center-a01",
      materialLines: [
        {
          name: "风力发电机组整机",
          typeCode: "A0100100001",
          spec: "GW66-1500",
          category: "生产类",
          unitPrice: "410.00",
          qty: "2",
          tax: "13",
          remark: "",
          recvTime: "2026-04-10 09:40",
          receiver: "宋中波",
          keeper: "李文涛"
        },
        {
          name: "叶片",
          typeCode: "A0100200001",
          spec: "SW64-2.0",
          category: "生产类",
          unitPrice: "35.00",
          qty: "8",
          tax: "13",
          remark: "叶片批次A",
          recvTime: "2026-04-10 11:00",
          receiver: "宋中波",
          keeper: "李文涛"
        }
      ]
    },
    HT2026315: {
      contractMode: "normal_only",
      contractName: "IGBT年度备件",
      frameworkNo: "KJ-2026-315",
      executionNo: "ZX-2026-315-02",
      normalNo: "CG-2026-315-09",
      material: "IGBT驱动板",
      supplier: "联合动力",
      spec: "V3.1",
      recvTime: "2026-04-12 14:20",
      receiver: "李泽",
      keeper: "张海龙",
      logisticsNo: "WL20260412",
      warehouse: "east-c03",
      materialLines: [
        {
          name: "机舱",
          typeCode: "A0100100002",
          spec: "JC-2.5MW",
          category: "生产类",
          unitPrice: "88.00",
          qty: "5",
          tax: "13",
          remark: "",
          recvTime: "2026-04-12 14:20",
          receiver: "李泽",
          keeper: "张海龙"
        },
        {
          name: "机舱",
          typeCode: "A0100100002",
          spec: "YJ-NAC-3.0",
          category: "生产类",
          unitPrice: "92.00",
          qty: "3",
          tax: "13",
          remark: "机舱备件",
          recvTime: "2026-04-12 15:00",
          receiver: "李泽",
          keeper: "张海龙"
        }
      ]
    },
    HT2026002: {
      contractMode: "framework_exec",
      contractName: "IGBT驱动板框架合同",
      frameworkNo: "KJ-2026-002",
      executionNo: "ZX-2026-002-01",
      executionNos: ["ZX-2026-002-01"],
      normalNo: "",
      material: "IGBT驱动板",
      supplier: "远景能源",
      spec: "GW66-1500",
      recvTime: "2026-04-29 10:12",
      receiver: "宋波",
      keeper: "宋波",
      logisticsNo: "WL2026-012",
      warehouse: "center-a01",
      materialLines: [
        {
          name: "IGBT驱动板",
          typeCode: "A0100100002",
          spec: "GW66-1500",
          category: "生产类",
          unitPrice: "23891.59",
          qty: "100",
          tax: "13",
          remark: "流程已办结回到发起人，补录入库明细（演示）",
          recvTime: "2026-04-29 10:12",
          receiver: "宋波",
          keeper: "宋波"
        }
      ]
    }
  };

  function qaMaterialLinesFor(contractKey) {
    var m = contractKey ? QA_ACCEPT_BY_CONTRACT[contractKey] : null;
    if (!m) return [];
    if (m.materialLines && m.materialLines.length) return m.materialLines;
    return [
      {
        name: m.material,
        spec: m.spec,
        recvTime: m.recvTime,
        receiver: m.receiver,
        keeper: m.keeper || ""
      }
    ];
  }

  function qaContractMaterialPickerRows(contractKey) {
    var ck = String(contractKey || "").trim();
    return qaMaterialLinesFor(ck).map(function (ln, i) {
      var matType = ln.category || normalizeMaterialCategory(ln.name || "", ln.name || "");
      var typeCode = String(ln.typeCode || "").trim() || materialTypeCodeFromType(matType, ln.name);
      var meta = qaLineCatalogMeta(ck, ln.name, typeCode, ln.spec);
      return {
        id: "qa-cm-" + ck + "-" + i,
        name: String(ln.name || ""),
        productCode: meta.productCode,
        spec: String(ln.spec || meta.matType || ""),
        typeName: meta.typeName,
        category: matType,
        typeCode: typeCode,
        unitPrice: ln.unitPrice != null ? String(ln.unitPrice) : "",
        qty: ln.qty != null ? String(ln.qty) : "",
        tax: ln.tax != null ? String(ln.tax) : ln.taxRate != null ? String(ln.taxRate) : "",
        remark: ln.remark != null ? String(ln.remark) : "",
        recvTime: ln.recvTime || "",
        receiver: ln.receiver || "",
        keeper: ln.keeper || "",
        logisticsNo: ln.logisticsNo || "",
        warehouse: ln.warehouse || ""
      };
    });
  }

  function qaMaterialDdRows(contractKey) {
    var lines = qaMaterialLinesFor(contractKey);
    if (!lines.length) {
      return [{ value: "", c2: "请先选择合同编号", placeholder: true }];
    }
    var rows = [{ value: "", c2: "请选择物资", placeholder: true }];
    lines.forEach(function (ln) {
      var matType = normalizeMaterialCategory(ln.name || ln.spec || "", ln.name || ln.spec || "");
      var typeCode = String(ln.typeCode || "").trim() || materialTypeCodeFromType(matType, ln.name);
      rows.push({ value: String(ln.name || ""), c1: typeCode, c2: String(ln.name || "") });
    });
    return rows;
  }

  function rebuildQaMaterialSelect(contractKey) {
    var mountRoot = $("qaAutoMaterialDdMount");
    var hidden = $("qaAutoMaterial");
    if (!mountRoot || !hidden || !window.DemoTwoColDd) return;
    if (mountRoot._qaMatDd && mountRoot._qaMatDd.destroy) {
      mountRoot._qaMatDd.destroy();
      mountRoot._qaMatDd = null;
    }
    hidden.value = "";
    var lines = qaMaterialLinesFor(contractKey);
    var ph = lines.length ? "请选择物资" : "请先选择合同编号";
    mountRoot._qaMatDd = DemoTwoColDd.mount({
      root: mountRoot,
      hiddenInput: hidden,
      placeholder: ph,
      searchPlaceholder: "搜索物资类型编码或名称",
      col1: "物资类型编码",
      col2: "物资名称",
      rows: qaMaterialDdRows(contractKey),
      onChange: function () {}
    });
  }

  /** 执行合同编号：演示始终用合同数据里的主执行号自动带入（只读灰底），不提供多选 */
  function qaRefreshExecutionField(contractKey) {
    var m = contractKey ? QA_ACCEPT_BY_CONTRACT[contractKey] : null;
    var hidden = $("qaFldExecutionNo");
    var ro = $("qaFldExecutionReadonly");
    if (!hidden || !ro) return;

    ro.style.display = "";
    if (!m) {
      hidden.value = "";
      ro.value = "";
      return;
    }
    if (String(m.contractMode || "") === "normal_only") {
      hidden.value = "";
      ro.value = "";
      return;
    }
    var run = String(m.executionNo || "").trim();
    hidden.value = run;
    ro.value = run;
  }

  var QA_MAT_TYPE_OPTS = ["生产类", "办公类", "销售类"];
  var QA_PERSON_OPTS = ["宋中波", "李泽", "李文涛", "张海龙", "成明锴"];
  var QA_RECV_TIME_OPTS = [
    "2026-04-10 09:40",
    "2026-04-10 11:00",
    "2026-04-12 14:20",
    "2026-04-12 15:00",
    "2026-04-29 10:12"
  ];

  /** 「选择物资」下拉候选（双列：类型编码 + 名称） */
  var QA_PICKER_MATERIALS = [
    { typeCode: "A0100100001", name: "智能风机控制器", spec: "V2.0", label: "智能风机控制器 (V2.0)" },
    { typeCode: "A0100100002", name: "高压配电柜", spec: "V3.1", label: "高压配电柜 (V3.1)" },
    { typeCode: "A0200100001", name: "工业级交换机", spec: "V2.0", label: "工业级交换机 (V2.0)" },
    { typeCode: "A0200100001", name: "移动式检修电源", spec: "V3.1", label: "移动式检修电源 (V3.1)" },
    { typeCode: "A0100100002", name: "机舱温控模块", spec: "V2.0", label: "机舱温控模块 (V2.0)" },
    { typeCode: "A0200100001", name: "主控信号采集单元", spec: "V3.1", label: "主控信号采集单元 (V3.1)" }
  ];

  function qaResolveCatalogProduct(nameOrValue) {
    if (!window.DemoProductCatalogData || !nameOrValue) return null;
    var key = String(nameOrValue || "").trim();
    if (!key) return null;
    var list = DemoProductCatalogData.flattenAllProducts();
    var i;
    for (i = 0; i < list.length; i++) {
      var p = list[i];
      if (String(p.productName) === key || String(p.b) === key) return p;
    }
    return null;
  }

  function qaLineCatalogMeta(contractKey, materialName, typeCode, spec) {
    var p = qaResolveCatalogProduct(materialName);
    var productCode = p ? String(p.b || "") : "";
    var typeName = p ? String(p.typeName || p.productName || "") : String(materialName || "");
    if (!productCode && typeCode && window.MaterialCodeScheme) {
      productCode = materialCodeFromTypeCode(typeCode);
    }
    return {
      productCode: productCode,
      typeName: typeName,
      matType: spec || (p ? p.model : "")
    };
  }

  function qaFindPickerMaterial(nameOrValue) {
    var key = String(nameOrValue || "").trim();
    if (!key) return null;
    var i;
    for (i = 0; i < QA_PICKER_MATERIALS.length; i++) {
      var p = QA_PICKER_MATERIALS[i];
      if (String(p.name) === key || String(p.typeCode) === key) return p;
    }
    return null;
  }

  function qaPickerMaterialDdRows() {
    var rows = [{ value: "", c2: "请选择物资", placeholder: true }];
    QA_PICKER_MATERIALS.forEach(function (p) {
      rows.push({
        value: String(p.name),
        c1: String(p.typeCode),
        c2: String(p.label || p.name)
      });
    });
    return rows;
  }

  function bindQaMatPickBtn() {
    var btn = $("qaBtnPickMaterial");
    if (!btn || btn.getAttribute("data-qa-pick-bound") === "1") return;
    btn.setAttribute("data-qa-pick-bound", "1");
    btn.addEventListener("click", function () {
      var ck = $("qaFldContractSel") ? String($("qaFldContractSel").value || "").trim() : "";
      if (!ck) {
        toast("请先选择合同");
        return;
      }
      if (!window.DemoProductCatalogPicker) return;
      var rows = qaContractMaterialPickerRows(ck);
      if (!rows.length) {
        toast("当前合同无可选物资");
        return;
      }
      var m = QA_ACCEPT_BY_CONTRACT[ck];
      DemoProductCatalogPicker.open({
        title: "选择物资",
        listType: "contractMaterials",
        mode: "multi",
        contractLabel: m && m.contractName ? m.contractName : "",
        contractMaterials: rows,
        onConfirm: function (picked) {
          (picked || []).forEach(function (ln) {
            qaAddMaterialLineRow(ck, ln);
          });
        }
      });
    });
  }

  function qaSelectFromList(className, options, selected, withPlaceholder) {
    var html =
      '<select class="' +
      escHtml(className || "qa-select") +
      '">';
    if (withPlaceholder !== false) {
      html += '<option value="">' + escHtml("请选择") + "</option>";
    }
    (options || []).forEach(function (o) {
      var v = Array.isArray(o) ? o[0] : o;
      var label = Array.isArray(o) ? o[1] : o;
      v = v == null ? "" : String(v);
      label = label == null ? v : String(label);
      html +=
        '<option value="' +
        escHtml(v) +
        '"' +
        (v === String(selected || "") ? " selected" : "") +
        ">" +
        escHtml(label) +
        "</option>";
    });
    return html + "</select>";
  }

  function qaLineTypeCodeOptions(contractKey) {
    var seen = {};
    var out = [];
    qaMaterialLinesFor(contractKey).forEach(function (ln) {
      var matType = normalizeMaterialCategory(ln.name || "", ln.name || "");
      var tc = String(ln.typeCode || "").trim() || materialTypeCodeFromType(matType, ln.name);
      if (tc && !seen[tc]) {
        seen[tc] = 1;
        out.push(tc);
      }
    });
    QA_PICKER_MATERIALS.forEach(function (p) {
      var tc = String(p.typeCode || "").trim();
      if (tc && !seen[tc]) {
        seen[tc] = 1;
        out.push(tc);
      }
    });
    return out;
  }

  var QA_WAREHOUSE_LABELS = {
    "center-b02": "公司中心库 / B区-02",
    "center-a01": "公司中心库 / A区-01",
    "east-c03": "华东分仓 / C区-03",
    "north-d06": "华北备件库 / D区-06"
  };

  function qaWarehouseDisplay(warehouseKey) {
    var k = String(warehouseKey || "").trim();
    return QA_WAREHOUSE_LABELS[k] || k;
  }

  /** 物资行：收货时间/人/保管人/物流单号/仓库 — 随合同编号系统自动带入 */
  function qaInboundAutoFromContract(contractKey, materialLine) {
    var m = contractKey ? QA_ACCEPT_BY_CONTRACT[contractKey] : null;
    var ln = materialLine || {};
    var warehouse = String(ln.warehouse || (m && m.warehouse) || "center-a01").trim();
    return {
      recvTime: String(ln.recvTime || (m && m.recvTime) || "").trim(),
      receiver: String(ln.receiver || (m && m.receiver) || "").trim(),
      keeper: String(ln.keeper || (m && m.keeper) || "").trim(),
      logisticsNo: String(ln.logisticsNo || (m && m.logisticsNo) || "").trim(),
      warehouse: warehouse,
      warehouseLabel: qaWarehouseDisplay(warehouse)
    };
  }

  function qaWarehouseSelectHtml(className, selected) {
    var opts = [
      ["", "请选择仓库"],
      ["center-b02", "公司中心库 / B区-02"],
      ["center-a01", "公司中心库 / A区-01"],
      ["east-c03", "华东分仓 / C区-03"],
      ["north-d06", "华北备件库 / D区-06"]
    ];
    return (
      '<select class="' +
      escHtml(className || "qa-select") +
      '">' +
      opts
        .map(function (o) {
          return (
            '<option value="' +
            escHtml(o[0]) +
            '"' +
            (String(selected || "") === o[0] ? " selected" : "") +
            ">" +
            escHtml(o[1]) +
            "</option>"
          );
        })
        .join("") +
      "</select>"
    );
  }

  function resolveQaQtyForLineRow(tr) {
    if (!tr) return 1;
    var shipEl = tr.querySelector(".qa-line-shipqty");
    var recvEl = tr.querySelector(".qa-line-recvqty");
    var shipQty = shipEl ? Number(String(shipEl.value || "").trim()) : 0;
    var recvQty = recvEl ? Number(String(recvEl.value || "").trim()) : 0;
    if (isFinite(shipQty) && shipQty > 0) return shipQty;
    if (isFinite(recvQty) && recvQty > 0) return recvQty;
    return 1;
  }

  function syncQaLineMaterialCode(tr) {
    if (!tr) return;
    var typeCodeEl = tr.querySelector(".qa-line-typecode");
    var materialCodeEl = tr.querySelector(".qa-line-matcode");
    if (!typeCodeEl || !materialCodeEl) return;
    var typeCode = echoFieldVal(typeCodeEl);
    materialCodeEl.value = materialCodeRangeFromTypeCode(typeCode, resolveQaQtyForLineRow(tr));
  }

  function applyQaMaterialLineToRow(tr, contractKey, materialName) {
    if (!tr) return;
    var lines = qaMaterialLinesFor(contractKey);
    var ln = null;
    var i;
    for (i = 0; i < lines.length; i++) {
      if (String(lines[i].name) === String(materialName || "")) {
        ln = lines[i];
        break;
      }
    }
    if (!ln) {
      var pick = qaFindPickerMaterial(materialName);
      if (pick) {
        ln = {
          name: pick.name,
          typeCode: pick.typeCode,
          spec: pick.spec
        };
      }
    }
    if (!ln) return;
    var matType = normalizeMaterialCategory(ln.name || ln.spec || "", ln.name || ln.spec || "");
    var typeCode = String(ln.typeCode || "").trim() || materialTypeCodeFromType(matType, ln.name);
    var meta = qaLineCatalogMeta(contractKey, ln.name, typeCode, ln.spec);
    var auto = qaInboundAutoFromContract(contractKey, ln);
    function setRo(cls, v) {
      var el = tr.querySelector(cls);
      if (!el) return;
      setEchoField(el, v);
    }
    setRo(".qa-line-matname", ln.name || "");
    setRo(".qa-line-productcode", meta.productCode);
    setRo(".qa-line-mattype", matType);
    setRo(".qa-line-typename", meta.typeName);
    setRo(".qa-line-typecode", typeCode);
    setRo(".qa-line-spec", ln.spec || meta.matType || "");
    syncQaLineMaterialCode(tr);
  }

  function qaMatLineMaterialOptionsHtml(contractKey, selectedName) {
    var seen = {};
    var names = [];
    qaMaterialLinesFor(contractKey).forEach(function (ln) {
      var n = String(ln.name || "").trim();
      if (n && !seen[n]) {
        seen[n] = 1;
        names.push(n);
      }
    });
    QA_PICKER_MATERIALS.forEach(function (p) {
      var n = String(p.name || "").trim();
      if (n && !seen[n]) {
        seen[n] = 1;
        names.push(n);
      }
    });
    var html = '<option value="">请选择</option>';
    names.forEach(function (n) {
      html +=
        '<option value="' +
        escHtml(n) +
        '"' +
        (n === String(selectedName || "") ? " selected" : "") +
        ">" +
        escHtml(n) +
        "</option>";
    });
    return html;
  }

  function qaLineReadonlyInput(val, className) {
    return (
      '<div class="qa-inp qa-inp--auto ' +
      escHtml(className || "") +
      '" tabindex="-1">' +
      escHtml(val == null ? "" : String(val)) +
      "</div>"
    );
  }

  function qaMatLineRowHtml(lineId, contractKey, data) {
    data = data || {};
    var matName = data.materialName || "";
    var matType = data.matType || "";
    var typeCode = data.typeCode || "";
    var spec = data.spec || "";
    var productCode = data.productCode || "";
    var typeName = data.typeName || "";
    var recvDate = "";
    if (data.recvTime) {
      recvDate = String(data.recvTime).slice(0, 10);
    }
    return (
      '<tr data-qa-line-id="' +
      escHtml(lineId) +
      '" data-qa-mat-name="' +
      escHtml(matName) +
      '">' +
      "<td>" +
      qaLineReadonlyInput(matName, "qa-line-matname") +
      "</td>" +
      "<td>" +
      qaLineReadonlyInput(spec, "qa-line-spec") +
      "</td>" +
      "<td>" +
      qaLineReadonlyInput(productCode, "qa-line-productcode") +
      "</td>" +
      "<td>" +
      qaLineReadonlyInput(matType, "qa-line-mattype") +
      "</td>" +
      "<td>" +
      qaLineReadonlyInput(typeName, "qa-line-typename") +
      "</td>" +
      "<td>" +
      qaLineReadonlyInput(typeCode, "qa-line-typecode") +
      "</td>" +
      '<td><input class="qa-inp qa-line-shipqty" type="text" value="' +
      escHtml(data.shipQty != null && String(data.shipQty) !== "" ? data.shipQty : "") +
      '" placeholder="请输入发货数量" autocomplete="off" /></td>' +
      '<td><input class="qa-inp qa-line-recvqty" type="text" value="' +
      escHtml(data.recvQty != null && String(data.recvQty) !== "" ? data.recvQty : "") +
      '" placeholder="请输入验收数量" autocomplete="off" /></td>' +
      '<td><input class="qa-inp qa-line-recvtime" type="date" value="' +
      escHtml(recvDate) +
      '" autocomplete="off" placeholder="请选择收货时间" /></td>' +
      '<td><input class="qa-inp qa-line-receiver" type="text" value="' +
      escHtml(data.receiver || "") +
      '" autocomplete="off" placeholder="请填写收货人" /></td>' +
      '<td><input class="qa-inp qa-line-keeper" type="text" value="' +
      escHtml(data.keeper || "") +
      '" autocomplete="off" placeholder="请填写保管人" /></td>' +
      '<td><input class="qa-inp qa-line-logistics" type="text" value="' +
      escHtml(data.logisticsNo || "") +
      '" autocomplete="off" placeholder="请输入单号" /></td>' +
      "<td>" +
      qaWarehouseSelectHtml("qa-select qa-line-warehouse", data.warehouse || "") +
      "</td>" +
      '<td>' +
      '<select class="qa-inp qa-line-asset-type" style="min-width:90px">' +
      '<option value="">请选择</option>' +
      '<option value="固定资产">固定资产</option>' +
      '<option value="无形资产">无形资产</option>' +
      '<option value="存货">存货</option>' +
      "</select>" +
      "</td>" +
      '<td class="qa-line-ops"></td>' +
      "</tr>"
    );
  }

  function qaMountMatLineOpsCell(tr) {
    if (!tr) return;
    var td = tr.querySelector("td.qa-line-ops");
    if (!td) {
      td = document.createElement("td");
      td.className = "qa-line-ops";
      tr.appendChild(td);
    }
    td.innerHTML = "";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qa-line-del";
    btn.textContent = "删除";
    td.appendChild(btn);
  }

  var qaMatLineSeq = 0;

  function qaClearMaterialLines() {
    var tbody = $("qaMatLinesTbody");
    if (tbody) tbody.innerHTML = "";
    qaMatLineSeq = 0;
    renderQaInboundMatDetailList();
  }

  function qaBindMatLineRow(tr, contractKey) {
    if (!tr) return;
    ["qa-line-shipqty", "qa-line-recvqty"].forEach(function (cls) {
      var el = tr.querySelector("." + cls);
      if (!el) return;
      el.addEventListener("input", function () {
        syncQaLineMaterialCode(tr);
      });
      el.addEventListener("change", function () {
        syncQaLineMaterialCode(tr);
      });
    });
    var del = tr.querySelector(".qa-line-del");
    if (del) {
      del.addEventListener("click", function (e) {
        e.preventDefault();
        if (tr.parentNode) tr.parentNode.removeChild(tr);
      });
    }
  }

  function qaAddMaterialLineRow(contractKey, pickNameArg) {
    var tbody = $("qaMatLinesTbody");
    if (!tbody) return null;
    var ck = String(contractKey || "").trim();
    if (!ck) {
      toast("请先选择合同");
      return null;
    }
    if (pickNameArg && typeof pickNameArg === "object" && pickNameArg.productName) {
      return qaAddMaterialLineFromProduct(ck, pickNameArg);
    }
    if (pickNameArg && typeof pickNameArg === "object" && pickNameArg.name && pickNameArg.id) {
      return qaAddMaterialLineFromContractLine(ck, pickNameArg);
    }
    var pickItem = pickNameArg ? qaFindPickerMaterial(pickNameArg) : null;
    var lines = qaMaterialLinesFor(ck);
    if (!pickItem && !lines.length) {
      toast("当前合同无可选物资");
      return null;
    }
    var ln = null;
    if (pickItem) {
      ln = {
        name: pickItem.name,
        typeCode: pickItem.typeCode,
        spec: pickItem.spec
      };
    } else if (pickNameArg) {
      var j;
      for (j = 0; j < lines.length; j++) {
        if (String(lines[j].name) === String(pickNameArg)) {
          ln = lines[j];
          break;
        }
      }
    }
    if (!ln) ln = lines[qaMatLineSeq % lines.length];
    qaMatLineSeq += 1;
    var pickName = String(ln.name || "");
    var matType = normalizeMaterialCategory(pickName, pickName);
    var typeCode = String(ln.typeCode || "").trim() || materialTypeCodeFromType(matType, pickName);
    var meta = qaLineCatalogMeta(ck, pickName, typeCode, ln.spec);
    var lineId = "qa-line-" + Date.now() + "-" + qaMatLineSeq;
    var wrap = document.createElement("tbody");
    wrap.innerHTML = qaMatLineRowHtml(lineId, ck, {
      materialName: pickName,
      productCode: meta.productCode,
      matType: matType,
      typeName: meta.typeName,
      typeCode: typeCode,
      materialCode: materialCodeRangeFromTypeCode(typeCode, 100),
      spec: ln.spec || meta.matType || ""
    });
    var tr = wrap.querySelector("tr");
    if (!tr) return null;
    qaMountMatLineOpsCell(tr);
    tbody.appendChild(tr);
    qaBindMatLineRow(tr, ck);
    applyQaMaterialLineToRow(tr, ck, pickName);
    renderQaInboundMatDetailList();
    return tr;
  }

  function qaAddMaterialLineFromContractLine(contractKey, line) {
    if (!line) return null;
    var tbody = $("qaMatLinesTbody");
    if (!tbody) return null;
    var ck = String(contractKey || "").trim();
    if (!ck) {
      toast("请先选择合同");
      return null;
    }
    qaMatLineSeq += 1;
    var matType = line.category || normalizeMaterialCategory(line.name, line.name);
    var typeCode = String(line.typeCode || "").trim() || materialTypeCodeFromType(matType, line.name);
    var meta = qaLineCatalogMeta(ck, line.name, typeCode, line.spec);
    var lineId = "qa-line-" + Date.now() + "-" + qaMatLineSeq;
    var wrap = document.createElement("tbody");
    wrap.innerHTML = qaMatLineRowHtml(lineId, ck, {
      materialName: line.name,
      productCode: line.productCode || meta.productCode,
      matType: matType,
      typeName: line.typeName || meta.typeName,
      typeCode: typeCode,
      materialCode: materialCodeFromTypeCode(typeCode),
      spec: line.spec || meta.matType || "",
      shipQty:
        qaInboundModalMode === "returnInitiator"
          ? line.shipQty != null
            ? line.shipQty
            : line.qty != null
              ? line.qty
              : ""
          : "",
      recvQty:
        qaInboundModalMode === "returnInitiator"
          ? line.recvQty != null
            ? line.recvQty
            : line.qty != null
              ? line.qty
              : ""
          : ""
    });
    var tr = wrap.querySelector("tr");
    if (!tr) return null;
    qaMountMatLineOpsCell(tr);
    tbody.appendChild(tr);
    qaBindMatLineRow(tr, ck);
    syncQaLineMaterialCode(tr);
    renderQaInboundMatDetailList();
    return tr;
  }

  function qaAddMaterialLineFromProduct(contractKey, product) {
    if (!product) return null;
    var tbody = $("qaMatLinesTbody");
    if (!tbody) return null;
    var ck = String(contractKey || "").trim();
    if (!ck) {
      toast("请先选择合同");
      return null;
    }
    qaMatLineSeq += 1;
    var matType = product.category || normalizeMaterialCategory(product.productName, product.productName);
    var typeCode = String(product.a || "").trim() || materialTypeCodeFromType(matType, product.productName);
    var meta = qaLineCatalogMeta(ck, product.productName, typeCode, product.model);
    var lineId = "qa-line-" + Date.now() + "-" + qaMatLineSeq;
    var wrap = document.createElement("tbody");
    wrap.innerHTML = qaMatLineRowHtml(lineId, ck, {
      materialName: product.productName,
      productCode: product.b || meta.productCode,
      matType: matType,
      typeName: product.typeName || meta.typeName,
      typeCode: typeCode,
      materialCode: product.b || materialCodeFromTypeCode(typeCode),
      spec: product.model || ""
    });
    var tr = wrap.querySelector("tr");
    if (!tr) return null;
    qaMountMatLineOpsCell(tr);
    tbody.appendChild(tr);
    qaBindMatLineRow(tr, ck);
    syncQaLineMaterialCode(tr);
    renderQaInboundMatDetailList();
    return tr;
  }

  function bindQaMatLinesTable() {
    bindQaMatPickBtn();
    var tbody = $("qaMatLinesTbody");
    if (tbody && !tbody._qaDelDelegated) {
      tbody._qaDelDelegated = true;
      tbody.addEventListener("click", function (e) {
        var del = e.target && e.target.closest ? e.target.closest(".qa-line-del") : null;
        if (!del) return;
        e.preventDefault();
        var tr = del.closest ? del.closest("tr") : null;
        if (tr && tr.parentNode) tr.parentNode.removeChild(tr);
        renderQaInboundMatDetailList();
      });
      if (!tbody._qaDetailRefreshDelegated) {
        tbody._qaDetailRefreshDelegated = true;
        tbody.addEventListener("input", function (e) {
          if (!e.target || !e.target.classList) return;
          if (
            e.target.classList.contains("qa-line-shipqty") ||
            e.target.classList.contains("qa-line-recvqty")
          ) {
            renderQaInboundMatDetailList();
          }
        });
        tbody.addEventListener("change", function (e) {
          if (!e.target || !e.target.classList) return;
          if (e.target.classList.contains("qa-line-warehouse")) {
            renderQaInboundMatDetailList();
          }
        });
      }
    }
  }

  function applyQaAcceptContract(contractKey) {
    var m = contractKey ? QA_ACCEPT_BY_CONTRACT[contractKey] : null;
    function set(id, v) {
      var el = $(id);
      if (!el) return;
      el.value = v == null || v === undefined ? "" : String(v);
    }
    if (!m) {
      set("qaFldContractName", "");
      set("qaFldFrameworkNo", "");
      set("qaFldExecutionNo", "");
      set("qaFldNormalContractNo", "");
      set("qaAutoSupplier", "");
      qaClearMaterialLines();
      qaRefreshExecutionField("");
      return;
    }
    set("qaFldContractName", m.contractName || "");
    var mode = String(m.contractMode || "");
    if (mode === "normal_only") {
      set("qaFldFrameworkNo", "");
      set("qaFldExecutionNo", "");
      set("qaFldNormalContractNo", m.normalNo || "");
    } else {
      set("qaFldFrameworkNo", m.frameworkNo || "");
      set("qaFldExecutionNo", String(m.executionNo || "").trim());
      set("qaFldNormalContractNo", "");
    }
    set("qaAutoSupplier", m.supplier);
    qaClearMaterialLines();
    qaRefreshExecutionField(contractKey);
  }

  function materialTypeCodeFromType(typeText, nameText) {
    var t = normalizeMaterialCategory(typeText, typeText);
    var MCS = window.MaterialCodeScheme;
    if (MCS) {
      return MCS.materialTypeCode(t, nameText || "", MCS.DATE_TAG);
    }
    var p = "QT";
    if (t === "生产类") p = "SC";
    else if (t === "办公类") p = "BG";
    else if (t === "销售类") p = "SW";
    return (MCS && MCS.DEFAULT_A) || "A0100100001";
  }

  function materialCodeFromTypeCode(typeCode) {
    var MCS = window.MaterialCodeScheme;
    if (MCS) return MCS.materialInstanceCode(typeCode, 1, 3);
    var base = String(typeCode || "").trim();
    if (!base) return "";
    return base;
  }

  function materialCodeRangeFromTypeCode(typeCode, qty) {
    var MCS = window.MaterialCodeScheme;
    var n = Number(qty);
    if (!isFinite(n) || n <= 0) n = 1;
    n = Math.floor(n);
    if (MCS) {
      var start = MCS.materialInstanceCode(typeCode, 1, 3);
      var end = MCS.materialInstanceCode(typeCode, n, 3);
      return n <= 1 ? start : start + "～" + end;
    }
    var base = String(typeCode || "").trim();
    if (!base) return "";
    return base;
  }

  function validateQaAcceptFields() {
    var tbody = $("qaMatLinesTbody");
    var rows = tbody ? tbody.querySelectorAll("tr[data-qa-line-id]") : [];
    if (!rows.length) {
      toast("请点击「选择物资」添加至少一行物资");
      return false;
    }
    var i;
    for (i = 0; i < rows.length; i++) {
      var tr = rows[i];
      var matName = tr.querySelector(".qa-line-matname");
      if (matName && !echoFieldVal(matName)) {
        toast("第 " + (i + 1) + " 行：请选择物资名称");
        return false;
      }
      var ship = tr.querySelector(".qa-line-shipqty");
      if (ship && !String(ship.value || "").trim()) {
        toast("第 " + (i + 1) + " 行：请填写发货数量");
        return false;
      }
      var recv = tr.querySelector(".qa-line-recvqty");
      if (recv && !String(recv.value || "").trim()) {
        toast("第 " + (i + 1) + " 行：请填写验收数量");
        return false;
      }
      var wh = tr.querySelector(".qa-line-warehouse");
      if (wh && !String(wh.value || "").trim()) {
        toast("第 " + (i + 1) + " 行：仓库未带入，请重新选择合同编号");
        return false;
      }
    }
    var it = $("qaFldInboundType");
    if (it && !String(it.value || "").trim()) {
      toast("请选择入库类型");
      return false;
    }
    return true;
  }

  /** 库存管理 · 发起验收（与审批单页一致布局） */
  function htmlQaAcceptInitiateSheet() {
    var labAuto = '<span class="qa-auto-mark" title="选择合同编号后自动带入">●</span>';
    return (
      '<div class="qa-accept-wrap">' +
        '<div class="qa-accept-toolbar">' +
        '<div class="qa-accept-toolbar-left">' +
        '<button type="button" class="qa-accept-link-flow" id="qaAcceptBtnFlow">流程进度</button>' +
        "</div>" +
        '<div class="qa-accept-toolbar-title">入库审批单</div>' +
        '<button type="button" class="qa-accept-btn-close" id="qaAcceptBtnBack" aria-label="关闭" title="关闭">×</button>' +
        "</div>" +
        '<p class="qa-accept-legend"><span class="qa-legend-dot" aria-hidden="true"></span>灰色背景为选择「合同编号」后<strong>系统自动带入</strong>；白框为手填。</p>' +
        '<div class="qa-accept-form-shell">' +
        '<table class="qa-accept-grid" role="presentation">' +
        "<tbody>" +
        "<tr>" +
        '<td class="qa-lab"><span class="req">*</span>供应商' +
        labAuto +
        "</td>" +
        '<td class="qa-val"><textarea class="qa-inp qa-inp--auto" id="qaAutoSupplier" readonly tabindex="-1" rows="1"></textarea></td>' +
        '<td class="qa-lab">选择合同</td>' +
        '<td class="qa-val">' +
        '<input type="hidden" id="qaFldContractSel" value="" />' +
        '<input type="hidden" id="qaFldContractName" value="" />' +
        '<div class="qa-cname-dd" id="qaFldContractNameDd">' +
        '<button type="button" class="qa-contract-dd__btn qa-cname-dd__btn" id="qaFldContractNameDdBtn" aria-label="选择合同" aria-haspopup="listbox" aria-expanded="false">请选择合同名称</button>' +
        '<div class="qa-contract-dd__panel qa-cname-dd__panel" id="qaFldContractNameDdPanel" hidden>' +
        '<div class="qa-cname-dd__search">' +
        '<input type="text" class="qa-cname-dd__search-inp" id="qaFldContractNameSearch" placeholder="搜索合同名称或编号" autocomplete="off" />' +
        "</div>" +
        '<div class="qa-cname-dd__table-wrap">' +
        '<table class="qa-cname-dd__table" role="list">' +
        '<thead><tr><th>合同名称</th><th>合同编号</th></tr></thead>' +
        '<tbody id="qaFldContractNameDdTbody"></tbody>' +
        "</table></div></div></div></td>" +
        "</tr>" +
        "<tr>" +
        '<td class="qa-lab">框架协议编号</td>' +
        '<td class="qa-val"><textarea class="qa-inp qa-inp--auto" id="qaFldFrameworkNo" readonly tabindex="-1" rows="1"></textarea></td>' +
        '<td class="qa-lab">选择执行合同编号</td>' +
        '<td class="qa-val">' +
        '<input type="hidden" id="qaFldExecutionNo" value="" />' +
        '<textarea class="qa-inp qa-inp--auto" id="qaFldExecutionReadonly" readonly tabindex="-1" rows="1"></textarea>' +
        "</td>" +
        "</tr>" +
        "<tr>" +
        '<td class="qa-lab">常规合同编号</td>' +
        '<td class="qa-val" colspan="3"><textarea class="qa-inp qa-inp--auto" id="qaFldNormalContractNo" readonly tabindex="-1" rows="1"></textarea></td>' +
        "</tr>" +
        "<tr>" +
        '<td class="qa-lab"><span class="req">*</span>入库类型</td>' +
        '<td class="qa-val">' +
        '<input type="hidden" id="qaFldInboundType" value="" />' +
        '<div class="qa-inbound-type-dd" id="qaInboundTypeDd">' +
        '<button type="button" class="qa-contract-dd__btn" id="qaInboundTypeDdBtn" aria-label="入库类型" aria-haspopup="listbox" aria-expanded="false">请选择入库类型</button>' +
        '<div class="qa-contract-dd__panel qa-inbound-type-dd__panel" id="qaInboundTypeDdPanel" hidden>' +
        '<button type="button" class="qa-inbound-type-dd__opt qa-inbound-type-dd__opt--full" data-value="">请选择入库类型</button>' +
        '<div class="qa-inbound-type-dd__row">' +
        '<button type="button" class="qa-inbound-type-dd__opt" data-value="采购入库">采购入库</button>' +
        '<span class="qa-inbound-type-dd__help" tabindex="0" aria-label="采购入库说明">' +
        '<span class="qa-inbound-type-dd__qm">?</span>' +
        '<span class="qa-inbound-type-dd__bubble">从外面采购进来入库的物资</span>' +
        "</span></div>" +
        '<div class="qa-inbound-type-dd__row">' +
        '<button type="button" class="qa-inbound-type-dd__opt" data-value="自研入库">自研入库</button>' +
        '<span class="qa-inbound-type-dd__help" tabindex="0" aria-label="自研入库说明">' +
        '<span class="qa-inbound-type-dd__qm">?</span>' +
        '<span class="qa-inbound-type-dd__bubble">自己生产研发入库的物资</span>' +
        "</span></div>" +
        '<div class="qa-inbound-type-dd__row">' +
        '<button type="button" class="qa-inbound-type-dd__opt" data-value="调拨入库">调拨入库</button>' +
        '<span class="qa-inbound-type-dd__help" tabindex="0" aria-label="调拨入库说明">' +
        '<span class="qa-inbound-type-dd__qm">?</span>' +
        '<span class="qa-inbound-type-dd__bubble">从别的部门流转入库的物资</span>' +
        "</span></div>" +
        "</div></div></td>" +
        '<td class="qa-lab"><span class="req">*</span>入库人</td>' +
        '<td class="qa-val"><input class="qa-inp" id="qaFldInbound" type="text" value="" autocomplete="off" /></td>' +
        "</tr>" +
        "<tr>" +
        '<td class="qa-lab">备注</td>' +
        '<td class="qa-val" colspan="3"><textarea class="qa-ta" id="qaFldRemark" rows="2"></textarea></td>' +
        "</tr>" +
        "</tbody></table>" +
        '<div class="qa-mat-lines-block">' +
        '<div class="qa-mat-lines-toolbar">' +
        '<button type="button" class="carrier-btn-add" id="qaBtnPickMaterial">选择物资</button>' +
        "</div>" +
        '<div style="font-weight:600;margin:12px 0 8px;color:#1f3551">物资列表</div>' +
        '<div class="qa-mat-lines-table-wrap">' +
        '<table class="qa-mat-lines-table" role="grid">' +
        "<thead><tr>" +
        "<th>产品名称</th>" +
        "<th>产品型号</th>" +
        "<th>产品编码</th>" +
        "<th>物资类别</th>" +
        "<th>物资类型名称</th>" +
        "<th>物资类型编码</th>" +
        '<th><span class="req">*</span>发货数量</th>' +
        '<th><span class="req">*</span>验收数量</th>' +
        "<th>收货时间</th>" +
        "<th>收货人</th>" +
        "<th>保管人</th>" +
        "<th>物流单号</th>" +
        "<th>仓库</th>" +
        "<th>资产类型</th>" +
        "<th>操作</th>" +
        "</tr></thead>" +
        '<tbody id="qaMatLinesTbody"></tbody>' +
        "</table></div>" +
        '<div class="qa-mat-detail-list-block" id="qaMatDetailListBlock" hidden>' +
        '<div style="font-weight:600;margin:14px 0 8px;color:#1f3551">物资明细列表</div>' +
        '<div class="qa-mat-lines-table-wrap">' +
        '<table class="qa-mat-lines-table proc-mini-table" role="grid">' +
        '<thead><tr id="qaMatDetailListHead"></tr></thead>' +
        '<tbody id="qaMatDetailListTbody"></tbody>' +
        "</table></div></div></div>" +
        "</div></div>"
    );
  }

  function applyQaInboundMatLinesReadonly(readonly) {
    var block = document.querySelector(".qa-mat-lines-block");
    if (block) block.classList.toggle("qa-mat-lines-block--readonly", !!readonly);
    var pickBtn = $("qaBtnPickMaterial");
    if (pickBtn) pickBtn.style.display = readonly ? "none" : "";
    var tbody = $("qaMatLinesTbody");
    if (!tbody) return;
    tbody.querySelectorAll("input, select, textarea, div.qa-inp--auto, button.qa-line-del").forEach(function (el) {
      if (el.classList && el.classList.contains("qa-line-del")) {
        el.style.display = readonly ? "none" : "";
        return;
      }
      if (el.tagName === "DIV") return;
      if (el.tagName === "SELECT") {
        el.disabled = !!readonly;
      } else {
        el.readOnly = !!readonly;
      }
      if (readonly) el.classList.add("qa-inp--auto");
      else el.classList.remove("qa-inp--auto");
    });
  }

  function qaPrefillInboundReturnDemo() {
    var ck = "HT2026002";
    var csel = $("qaFldContractSel");
    if (csel) csel.value = ck;
    applyQaAcceptContract(ck);
    var cName = $("qaFldContractName");
    if (cName) cName.value = (QA_ACCEPT_BY_CONTRACT[ck] && QA_ACCEPT_BY_CONTRACT[ck].contractName) || "";
    var cNameBtn = $("qaFldContractNameDdBtn");
    if (cNameBtn) cNameBtn.textContent = cName.value || "请选择合同名称";
    var ro = $("qaFldContractReadonly");
    if (ro) ro.value = ck;
    var inboundBy = $("qaFldInbound");
    if (inboundBy) inboundBy.value = "李泽";
    var inboundType = $("qaFldInboundType");
    var inboundTypeBtn = $("qaInboundTypeDdBtn");
    if (inboundType) inboundType.value = "采购入库";
    if (inboundTypeBtn) inboundTypeBtn.textContent = "采购入库";
    var remark = $("qaFldRemark");
    if (remark) remark.value = "各级审批已完成，发起人补录入库（演示）";
    qaClearMaterialLines();
    var line = (QA_ACCEPT_BY_CONTRACT[ck].materialLines || [])[0];
    if (line) {
      qaAddMaterialLineFromContractLine(ck, {
        name: line.name || "IGBT驱动板",
        typeCode: line.typeCode || "A0100100002",
        spec: line.spec || "GW66-1500",
        category: line.category || "生产类",
        qty: line.qty || "100",
        productCode: "B00000001"
      });
    }
  }

  function bindQaAcceptSheetAfterOpen() {
    var csel = $("qaFldContractSel");
    qaRefreshExecutionField(csel ? String(csel.value || "").trim() : "");
    bindQaMatLinesTable();
    if (qaInboundModalMode === "returnInitiator") {
      qaPrefillInboundReturnDemo();
      applyQaInboundMatLinesReadonly(true);
    } else {
      applyQaInboundMatLinesReadonly(false);
    }
    renderQaInboundMatDetailList();
  }

  function openQaAcceptInitiateModal(mode) {
    if (!ensureRefs()) return;
    qaInboundModalMode = mode === "returnInitiator" ? "returnInitiator" : "initiate";
    setProgressFlowScope("m10-inbound-initiate");
    qaInboundContextTr = null;
    if (mask && mask._qaContractNameDdTeardown) {
      try {
        mask._qaContractNameDdTeardown();
      } catch (eOpenCn) {}
      mask._qaContractNameDdTeardown = null;
    }
    if (mask && mask._qaInboundTypeDdTeardown) {
      try {
        mask._qaInboundTypeDdTeardown();
      } catch (eOpenIb) {}
      mask._qaInboundTypeDdTeardown = null;
    }
    titleEl.textContent = "";
    bodyEl.innerHTML = htmlQaAcceptInitiateSheet();
    setHeadAction("", null);
    setProcModalFlowVisible(false);
    footEl.innerHTML =
      '<button type="button" class="proc-btn" id="qaAcceptFootCancel">取消</button>' +
      '<button type="button" class="proc-btn proc-btn-primary" id="qaAcceptFootOk">确定</button>';
    mask.classList.add("is-open", "qa-accept-mode");
    mask.setAttribute("aria-hidden", "false");
    var box = mask.querySelector(".proc-modal-box");
    if (box) box.classList.add("fullscreen");
    mask.onclick = function (ev) {
      if (ev.target === mask) closeProcModal();
    };
    var back = $("qaAcceptBtnBack");
    if (back) back.addEventListener("click", closeProcModal);
    var fc = $("qaAcceptFootCancel");
    if (fc) fc.addEventListener("click", closeProcModal);
    var fo = $("qaAcceptFootOk");
    if (fo) {
      fo.addEventListener("click", function () {
        if (!validateQaAcceptFields()) return;
        toast("已保存（演示）");
        closeProcModal();
      });
    }
    var fl = $("qaAcceptBtnFlow");
    if (fl) {
      fl.addEventListener("click", function (e) {
        e.preventDefault();
        syncProgressFlowScopeFromCurrentModal();
        openUnifiedProgress();
      });
    }
    var csel = $("qaFldContractSel");
    var cName = $("qaFldContractName");
    function syncContractComboUi() {
      var ro = $("qaFldContractReadonly");
      if (!csel || !ro) return;
      ro.value = String(csel.value || "").trim();
    }
    function syncContractNameComboUi() {
      var btn = $("qaFldContractNameDdBtn");
      if (!cName || !btn) return;
      var n = String(cName.value || "").trim();
      btn.textContent = n ? n : "请选择合同名称";
    }
    function syncContractNameByCode(code) {
      if (!cName) return;
      var m = code ? QA_ACCEPT_BY_CONTRACT[code] : null;
      cName.value = m && m.contractName ? m.contractName : "";
      syncContractNameComboUi();
    }
    function syncContractCodeByName(name) {
      if (!csel) return;
      var code = "";
      Object.keys(QA_ACCEPT_BY_CONTRACT).some(function (k) {
        if (String(QA_ACCEPT_BY_CONTRACT[k].contractName || "") === String(name || "")) {
          code = k;
          return true;
        }
        return false;
      });
      csel.value = code;
      syncContractComboUi();
      applyQaAcceptContract(code);
      syncContractNameComboUi();
    }
    (function bindQaContractNameDd() {
      var wrap = $("qaFldContractNameDd");
      var btn = $("qaFldContractNameDdBtn");
      var panel = $("qaFldContractNameDdPanel");
      var searchInp = $("qaFldContractNameSearch");
      var tbody = $("qaFldContractNameDdTbody");
      if (!wrap || !btn || !panel || !searchInp || !tbody || !cName) return;

      function renderNameRows(filterText) {
        var q = cleanText(filterText).toLowerCase();
        var dataRows = Object.keys(QA_ACCEPT_BY_CONTRACT).map(function (k) {
          return { code: k, name: String(QA_ACCEPT_BY_CONTRACT[k].contractName || "") };
        });
        var filtered = dataRows.filter(function (r) {
          if (!q) return true;
          return (
            cleanText(r.name).toLowerCase().indexOf(q) >= 0 ||
            String(r.code || "").toLowerCase().indexOf(q) >= 0
          );
        });
        var trs = [];
        trs.push(
          '<tr class="qa-cname-dd__tr qa-cname-dd__tr--ph" role="option" data-code="" data-name="">' +
            '<td colspan="2">' +
            escHtml("请选择合同名称") +
            "</td>" +
            "</tr>"
        );
        filtered.forEach(function (r) {
          trs.push(
            '<tr class="qa-cname-dd__tr" role="option" data-code="' +
              escHtml(r.code) +
              '" data-name="' +
              escHtml(r.name) +
              '"><td>' +
              escHtml(r.name) +
              "</td><td>" +
              escHtml(r.code) +
              "</td></tr>"
          );
        });
        tbody.innerHTML = trs.join("");
      }

      function closeNamePanel() {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        searchInp.value = "";
        renderNameRows("");
      }

      searchInp.addEventListener("input", function () {
        renderNameRows(searchInp.value);
      });

      tbody.addEventListener("click", function (e) {
        var tr = e.target && e.target.closest ? e.target.closest(".qa-cname-dd__tr") : null;
        if (!tr) return;
        e.preventDefault();
        var name = String(tr.getAttribute("data-name") || "");
        syncContractCodeByName(name);
        closeNamePanel();
      });

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (panel.hidden) {
          panel.hidden = false;
          btn.setAttribute("aria-expanded", "true");
          searchInp.value = "";
          renderNameRows("");
          try {
            searchInp.focus();
          } catch (eFoc) {}
        } else {
          closeNamePanel();
        }
      });

      function onDocN(ev) {
        if (!wrap.contains(ev.target)) closeNamePanel();
      }
      function onKeyN(ev) {
        if (ev.key === "Escape") closeNamePanel();
      }
      document.addEventListener("click", onDocN, true);
      document.addEventListener("keydown", onKeyN, true);
      if (mask) {
        mask._qaContractNameDdTeardown = function () {
          document.removeEventListener("click", onDocN, true);
          document.removeEventListener("keydown", onKeyN, true);
        };
      }
      renderNameRows("");
    })();
    (function bindQaInboundTypeDd() {
      var wrap = $("qaInboundTypeDd");
      var btn = $("qaInboundTypeDdBtn");
      var panel = $("qaInboundTypeDdPanel");
      var hidden = $("qaFldInboundType");
      if (!wrap || !btn || !panel || !hidden) return;

      function closeIt() {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
      function openIt() {
        panel.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }

      function syncBtn() {
        var v = String(hidden.value || "").trim();
        btn.textContent = v ? v : "请选择入库类型";
      }

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (panel.hidden) openIt();
        else closeIt();
      });

      panel.addEventListener("click", function (e) {
        if (e.target && e.target.closest && e.target.closest(".qa-inbound-type-dd__help")) {
          e.stopPropagation();
          return;
        }
        var opt = e.target && e.target.closest ? e.target.closest(".qa-inbound-type-dd__opt") : null;
        if (!opt) return;
        e.preventDefault();
        hidden.value = String(opt.getAttribute("data-value") || "");
        syncBtn();
        closeIt();
      });

      function onDocI(ev) {
        if (!wrap.contains(ev.target)) closeIt();
      }
      function onKeyI(ev) {
        if (ev.key === "Escape") closeIt();
      }
      document.addEventListener("click", onDocI, true);
      document.addEventListener("keydown", onKeyI, true);
      if (mask) {
        mask._qaInboundTypeDdTeardown = function () {
          document.removeEventListener("click", onDocI, true);
          document.removeEventListener("keydown", onKeyI, true);
        };
      }
      syncBtn();
    })();
    syncContractComboUi();
    syncContractNameComboUi();
    bindQaAcceptSheetAfterOpen();
  }

  function openQaInboundReturnInitiatorModal() {
    openQaAcceptInitiateModal("returnInitiator");
  }

  function footTriple(cancelOnly) {
    return (
      '<button type="button" class="proc-btn" id="procModalCancel">取消</button>' +
      (cancelOnly
        ? ""
        : '<button type="button" class="proc-btn proc-btn-ghost" id="procSaveDraft">保存草稿</button>' +
          '<button type="button" class="proc-btn proc-btn-primary" id="procSubmitFlow">提交审批</button>')
    );
  }

  function footDoubleSave() {
    return (
      '<button type="button" class="proc-btn" id="procModalCancel">取消</button>' +
      '<button type="button" class="proc-btn proc-btn-primary" id="procSaveOnly">保存</button>'
    );
  }

  function bindFootActions(extra) {
    var c = $("procModalCancel");
    if (c) c.addEventListener("click", closeProcModal);
    var sd = $("procSaveDraft");
    if (sd)
      sd.addEventListener("click", function () {
        toast("已保存草稿（演示）");
        closeProcModal();
      });
    var sb = $("procSubmitFlow");
    if (sb)
      sb.addEventListener("click", function () {
        toast("已提交审批（演示）");
        closeProcModal();
      });
    var sv = $("procSaveOnly");
    if (sv)
      sv.addEventListener("click", function () {
        toast("已保存（演示）");
        closeProcModal();
      });
    if (typeof extra === "function") extra();
  }

  var DEPT = "供应链管理部";
  /** 采购计划新增/编辑弹窗「编制部门」演示默认值 */
  var PLAN_COMPILE_DEPT = "经营发展中心";

  function qtyInput(val) {
    return (
      '<input type="number" min="1" step="1" value="' +
      val +
      '" class="proc-qty-input" style="width:72px;height:26px;border:1px solid #dbe6f3;border-radius:2px;padding:0 6px;box-sizing:border-box;font-size:12px" />'
    );
  }

  function miniTablePlanLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资编码</th><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>预算单价</th><th>预算总价</th><th>操作</th></tr></thead><tbody>' +
        "<tr><td>WZ-001</td><td>齿轮箱</td><td>GW-2MW</td><td>" +
        qtyInput("2") +
        "</td><td>台</td><td>43,000</td><td>86,000</td><td><a href=\"#\" class=\"js-op\" data-op=\"删除明细行\">删除</a></td></tr>" +
      "</tbody></table>" +
      '<p style="margin:8px 0 0"><button type="button" class="proc-btn proc-btn-primary js-op" data-op="物资选择">添加物资</button></p>'
    );
  }

  function miniTableApplyLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>物资类别</th><th>计划数量</th><th>单位</th><th>预算单价（元）</th><th>预算总价（元）</th><th>备注</th><th>操作</th></tr></thead><tbody>' +
        "<tr><td>主轴轴承</td><td>SKF-7320</td><td>生产类</td><td>" +
        qtyInput("4") +
        "</td><td>套</td><td>30,000</td><td>120,000</td><td>备件更换</td><td><a href=\"#\" class=\"js-op\" data-op=\"删除明细行\">删除</a></td></tr>" +
      "</tbody></table>" +
      '<p style="margin:8px 0 0"><button type="button" class="proc-btn proc-btn-primary js-op" data-op="物资选择">添加物资</button></p>'
    );
  }

  function miniTableSourcingLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资编码</th><th>物资名称</th><th>规格</th><th>数量</th><th>单位</th></tr></thead><tbody>' +
        "<tr><td>WZ-011</td><td>电缆</td><td>YJV-3×120</td><td>500</td><td>米</td></tr>" +
      "</tbody></table>" +
      '<p style="margin:8px 0 0"><button type="button" class="proc-btn proc-btn-primary js-op" data-op="物资选择">添加物资</button></p>'
    );
  }

  function miniTableBidLines() {
    return (
      '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th></tr></thead><tbody>' +
        "<tr><td>主轴总成</td><td>定制</td><td>6</td><td>套</td></tr>" +
      "</tbody></table>"
    );
  }

  function htmlPlanForm(edit) {
    return (
      '<div class="field-row"><label>计划名称 <span style="color:#cf1322">*</span></label><input type="text" value="' +
        (edit ? "年度备件采购计划" : "") +
        '" placeholder="请输入计划名称" /></div>' +
      '<div class="field-row"><label>计划年度 <span style="color:#cf1322">*</span></label><select><option>2026</option><option>2025</option><option>2024</option></select></div>' +
      '<div class="field-row"><label>编制部门</label><input type="text" value="' +
        PLAN_COMPILE_DEPT +
        '" readonly style="background:#f5f5f5" /></div>' +
      "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
      miniTablePlanLines() +
      '<div class="field-row" style="margin-top:12px"><label>附件</label><input type="file" /></div>'
    );
  }

  function getApplyRowData(el) {
    var tr = el && el.closest ? el.closest("tr") : null;
    if (!tr) return null;
    var tds = tr.querySelectorAll("td");
    return {
      applyNo: cleanText(tds[0] ? tds[0].textContent : ""),
      projectName: cleanText(tds[1] ? tds[1].textContent : ""),
      demandDate: cleanText(tds[9] ? tds[9].textContent : ""),
      dept: cleanText(tds[10] ? tds[10].textContent : ""),
      applicant: cleanText(tds[11] ? tds[11].textContent : ""),
      applyTime: cleanText(tds[12] ? tds[12].textContent : ""),
      urgent: cleanText(tds[13] ? tds[13].textContent : ""),
      annual: cleanText(tds[14] ? tds[14].textContent : ""),
      remark: cleanText(tds[16] ? tds[16].textContent : "")
    };
  }

  function htmlApplyForm(edit, rowData) {
    var d = rowData || {};
    var applyNo = (edit && d.applyNo) ? d.applyNo : (edit ? "PA20260321001" : "PA" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "001");
    var applyTime = new Date().toISOString().slice(0, 19).replace("T", " ");
    return (
      '<div class="field-row"><label>申请单号</label><input type="text" value="' +
        applyNo +
        '" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>项目名称 <span style="color:#cf1322">*</span></label><input type="text" value="' +
        (edit ? (d.projectName || "检修保障采购") : "") +
        '" placeholder="请输入项目名称" /></div>' +
      '<div class="field-row"><label>需求日期 <span style="color:#cf1322">*</span></label><input type="date" value="' + (d.demandDate || "2026-04-10") + '" /></div>' +
      '<div class="field-row"><label>申请部门 <span style="color:#cf1322">*</span></label><select><option>' +
        (d.dept || DEPT) +
        "</option><option>运维中心</option><option>华北场站</option></select></div>" +
      '<div class="field-row"><label>申请人</label><input type="text" value="' +
        (edit ? (d.applicant || "张明") : "当前用户") +
        '" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>申请时间</label><input type="text" value="' +
        (edit ? (d.applyTime || applyTime) : applyTime) +
        '" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>紧急程度</label><select><option>' + (d.urgent || "普通") + '</option><option>普通</option><option>紧急</option><option>特急</option></select></div>' +
      '<div class="field-row"><label>是否关联年度计划</label><select><option>' + (d.annual || "是") + "</option><option>是</option><option>否</option></select></div>" +
      "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
      miniTableApplyLines() +
      '<div class="field-row"><label>备注</label><textarea placeholder="请输入备注">' +
        (edit ? (d.remark || "备件更换") : "") +
        "</textarea></div>" +
      '<div class="field-row" style="margin-top:12px"><label>附件</label><input type="file" /></div>' +
      '<p style="margin:8px 0 0;color:#64748b;font-size:12px">物资明细中已包含：物资名称、规格型号、物资类别、计划数量、单位、预算单价（元）、预算总价（元）、备注。</p>'
    );
  }

  function htmlMaterialPicker() {
    return (
      '<div class="field-row"><label>搜索</label><input type="search" placeholder="物资名称" /></div>' +
      '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>单位</th><th>数量</th><th>参考单价</th><th>操作</th></tr></thead><tbody>' +
        "<tr><td>螺栓套件</td><td>M16×80</td><td>套</td><td>" +
        qtyInput("1") +
        "</td><td>120</td><td><button type=\"button\" class=\"proc-btn proc-btn-primary proc-pick-row\">选择</button></td></tr>" +
        "<tr><td>冷却液</td><td>乙二醇型</td><td>桶</td><td>" +
        qtyInput("1") +
        "</td><td>680</td><td><button type=\"button\" class=\"proc-btn proc-btn-primary proc-pick-row\">选择</button></td></tr>" +
      "</tbody></table>"
    );
  }

  function htmlOrderDetail(orderId) {
    var M = {
      ORD2026001: {
        pending: true,
        supplier: "远景能源",
        planNo: "PL2026001",
        total: "410,000",
        d1: "2026-03-20",
        d2: "2026-04-20",
        lineRow:
          "<tr><td>风机备件包</td><td>标准</td><td>1</td><td>批</td><td>410,000</td><td>410,000</td></tr>",
        contract: "CGHT-2026-001"
      },
      ORD2026002: {
        pending: false,
        supplier: "金风科技",
        planNo: "PL2026002",
        total: "180,000",
        d1: "2026-03-25",
        d2: "2026-04-25",
        lineRow:
          "<tr><td>备件套装</td><td>定制</td><td>2</td><td>套</td><td>90,000</td><td>180,000</td></tr>",
        contract: "HT-2026-088"
      }
    };
    if (M[orderId]) {
      var x = M[orderId];
      var statusTag = x.pending
        ? '<span class="tag-soft tag-pending">待确认</span>'
        : '<span class="tag-soft tag-blue">已确认</span>';
      var foot =
        '<button type="button" class="proc-btn" id="procModalClose">取消</button>' +
        (x.pending
          ? '<button type="button" class="proc-btn proc-btn-primary js-op" data-op="订单确认">确认订单</button>'
          : '<a class="proc-btn proc-btn-primary" href="receipt-inbound.html" style="text-decoration:none;display:inline-flex;align-items:center">收货入库</a>');
      return {
        body:
          '<p style="margin:0 0 10px"><strong>订单信息</strong></p>' +
          '<div class="field-row"><label>订单号</label><span>' +
          orderId +
          "</span></div>" +
          '<div class="field-row"><label>采购计划编号</label><span>' +
          x.planNo +
          "</span></div>" +
          '<div class="field-row"><label>供应商</label><span>' +
          x.supplier +
          "</span></div>" +
          '<div class="field-row"><label>下单日期</label><span>' +
          x.d1 +
          "</span></div>" +
          '<div class="field-row"><label>交货日期</label><span>' +
          x.d2 +
          "</span></div>" +
          '<div class="field-row"><label>状态</label><span>' +
          statusTag +
          "</span></div>" +
          "<p style=\"margin:14px 0 8px\"><strong>采购清单</strong></p>" +
          '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>单价</th><th>总价</th></tr></thead><tbody>' +
          x.lineRow +
          "</tbody></table>" +
          '<p style="margin:12px 0 0;font-size:12px;color:#516a87">采购部门：' +
          DEPT +
          "　合同编号：" +
          x.contract +
          "　<strong>原值合计（元）：" +
          x.total +
          "</strong></p>",
        foot: foot
      };
    }
    var pending = orderId === "PO-2026-0099";
    var statusTag = pending
      ? '<span class="tag-soft tag-pending">待确认</span>'
      : '<span class="tag-soft tag-blue">已确认</span>';
    var supplier = pending ? "联程供应链" : "远景能源";
    var planNo = pending ? "CGJH-2026-001" : "CGJH-2026-003";
    var total = pending ? "126,000" : "410,000";
    var d1 = pending ? "2026-03-22" : "2026-04-01";
    var d2 = pending ? "2026-04-02" : "2026-04-15";
    var foot =
      '<button type="button" class="proc-btn" id="procModalClose">取消</button>' +
      (pending
        ? '<button type="button" class="proc-btn proc-btn-primary js-op" data-op="订单确认">确认订单</button>'
        : '<a class="proc-btn proc-btn-primary" href="receipt-inbound.html" style="text-decoration:none;display:inline-flex;align-items:center">收货入库</a>');
    return {
      body:
        '<p style="margin:0 0 10px"><strong>订单信息</strong></p>' +
        '<div class="field-row"><label>订单号</label><span>' +
        orderId +
        "</span></div>" +
        '<div class="field-row"><label>采购计划编号</label><span>' +
        planNo +
        "</span></div>" +
        '<div class="field-row"><label>供应商</label><span>' +
        supplier +
        "</span></div>" +
        '<div class="field-row"><label>下单日期</label><span>' +
        d1 +
        "</span></div>" +
        '<div class="field-row"><label>交货日期</label><span>' +
        d2 +
        "</span></div>" +
        '<div class="field-row"><label>状态</label><span>' +
        statusTag +
        "</span></div>" +
        "<p style=\"margin:14px 0 8px\"><strong>采购清单</strong></p>" +
        '<table class="proc-mini-table"><thead><tr><th>物资名称</th><th>规格型号</th><th>数量</th><th>单位</th><th>单价</th><th>总价</th></tr></thead><tbody>' +
        (pending
          ? "<tr><td>齿轮箱配件</td><td>定制</td><td>2</td><td>套</td><td>63,000</td><td>126,000</td></tr>"
          : "<tr><td>风机备件包</td><td>标准</td><td>1</td><td>批</td><td>410,000</td><td>410,000</td></tr>") +
        "</tbody></table>" +
        '<p style="margin:12px 0 0;font-size:12px;color:#516a87">采购部门：' +
        DEPT +
        "　合同编号：" +
        (pending ? "HT-待签" : "CGHT-2026-001") +
        "　<strong>原值合计（元）：" +
        total +
        "</strong></p>",
      foot: foot
    };
  }

  function htmlOrderDevicePicker(opts) {
    var o = opts || {};
    var ro = !!o.readonly;
    var applicant = o.applicant || "当前用户";
    var dept = o.dept || "经营发展中心";
    var company = o.company || "河南能源";
    var site = o.site || "新安风电场";
    var applyDate = o.applyDate || "2026-04-15";
    var confirmer = o.confirmer || "张敏（经营发展中心）";
    var logisticsNo = o.logisticsNo || "WL20260430001";
    var salesContractNo = o.salesContractNo || "";
    var roInput = ro ? " readonly " : "";
    var roSelect = ro ? " disabled " : "";
    var roCheckbox = ro ? " disabled " : "";
    var roBg = ro ? "background:#f5f5f5" : "";
    function pickOpt(v, t) {
      return String(v || "") === String(t || "") ? " selected" : "";
    }
    var salesNoOptions = '<option value="">请选择销售合同编号</option>'
      + '<option value="XSHT-2026-001"'+pickOpt(salesContractNo, "XSHT-2026-001")+'>XSHT-2026-001</option>'
      + '<option value="XSHT-2026-002"'+pickOpt(salesContractNo, "XSHT-2026-002")+'>XSHT-2026-002</option>'
      + '<option value="XSHT-2026-003"'+pickOpt(salesContractNo, "XSHT-2026-003")+'>XSHT-2026-003</option>';
    return (
      '<div class="field-row"><label>提报人</label><input id="ordApplicant" type="text" value="' + applicant + '" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>部门</label><input id="ordApplicantDept" type="text" value="' + dept + '" readonly style="background:#f5f5f5" /></div>' +
      '<div class="field-row"><label>公司</label><select id="ordCompany" ' + roSelect + ' style="' + roBg + '">' +
        '<option' + pickOpt(company, "河南能源") + '>河南能源</option><option' + pickOpt(company, "天津能源") + '>天津能源</option><option' + pickOpt(company, "甘肃能源") + '>甘肃能源</option></select></div>' +
      '<div class="field-row"><label>场站名称</label><select id="ordSite" ' + roSelect + ' style="' + roBg + '">' +
        '<option' + pickOpt(site, "新安风电场") + '>新安风电场</option><option' + pickOpt(site, "滨海场站") + '>滨海场站</option><option' + pickOpt(site, "酒泉场站") + '>酒泉场站</option></select></div>' +
      '<div class="field-row"><label>提报日期</label><input id="ordDate" type="date" value="' + applyDate + '" ' + roInput + ' style="' + roBg + '" /></div>' +
      '<div class="field-row"><label>物流单号</label><input id="ordLogisticsNo" type="text" value="' + logisticsNo + '" ' + roInput + ' style="' + roBg + '" /></div>' +
      '<div class="field-row"><label>销售合同编号</label><select id="ordSalesContractNo" ' + roSelect + ' style="' + roBg + '">' + salesNoOptions + "</select></div>" +
      '<div class="field-row"><label>指定业务部门</label><select id="ordBizDept" ' + roSelect + ' style="' + roBg + '">' +
        '<option' + pickOpt(dept, "经营发展中心") + '>经营发展中心</option><option' + pickOpt(dept, "运维业务一部") + '>运维业务一部</option><option' + pickOpt(dept, "运维业务二部") + '>运维业务二部</option></select></div>' +
      '<div class="field-row"><label>确认人</label><select id="ordConfirmer" ' + roSelect + ' style="' + roBg + '">' +
        '<option' + pickOpt(confirmer, "张敏（经营发展中心）") + '>张敏（经营发展中心）</option><option' + pickOpt(confirmer, "李哲（运维业务一部）") + '>李哲（运维业务一部）</option><option' + pickOpt(confirmer, "周宁（运维业务二部）") + '>周宁（运维业务二部）</option></select></div>' +
      '<p style="margin:12px 0 6px;font-weight:600;color:#1f3551">设备清单筛选</p>' +
      '<div class="field-row"><label>物资类别</label><select ' + roSelect + ' style="' + roBg + '"><option>全部</option><option>风机整机</option><option>齿轮箱</option><option>变流器</option></select></div>' +
      '<div class="field-row"><label>供应商</label><select ' + roSelect + ' style="' + roBg + '"><option>全部</option><option>联合动力</option><option>东风</option></select></div>' +
      '<div class="field-row"><label>规格型号</label><input type="text" placeholder="请输入规格型号" ' + roInput + ' style="' + roBg + '" /></div>' +
      '<div class="field-row"><label>关键字</label><input type="search" placeholder="货物编号/物资名称" ' + roInput + ' style="' + roBg + '" /></div>' +
      '<table class="proc-mini-table"><thead><tr><th></th><th>物资编码</th><th>合同编号</th><th>采购部门</th><th>物资名称</th><th>规格型号</th><th>物资类别</th><th>采购平均单价（不含税）</th><th>领用总数</th><th>库存数量</th><th>当前状态</th><th>开票时间</th><th>保管部门</th><th>保管人</th><th>存放地点</th><th>固定资产编码</th><th>原值</th><th>当前净值</th><th>折旧方法</th><th>入库日期</th><th>供应商</th><th>最后盘点时间</th><th>最后盘点结果</th></tr></thead><tbody>' +
      '<tr><td><input type="checkbox" class="proc-order-pick" checked ' + roCheckbox + ' /></td><td data-col="code">A0100100001</td><td>HT-2026-100</td><td>经营发展中心</td><td data-col="name">智能风机控制器</td><td data-col="spec">V2.0</td><td>办公类</td><td>18,500.00</td><td data-col="qty">2</td><td>10</td><td data-col="status">在库</td><td>2026-04-29</td><td>经营发展中心</td><td>宋中波</td><td>中心库1-01</td><td>FA-2026-0001</td><td>80,000</td><td>76,800</td><td>年限平均法</td><td>2026-04-10</td><td>东风</td><td>2026-04-29 10:00</td><td>账实一致</td></tr>' +
      '<tr><td><input type="checkbox" class="proc-order-pick" ' + roCheckbox + ' /></td><td data-col="code">A0100100002</td><td>HT-2026-101</td><td>电控所</td><td data-col="name">高压配电柜</td><td data-col="spec">V3.1</td><td>生产类</td><td>19,420.00</td><td data-col="qty">3</td><td>11</td><td data-col="status">在库</td><td>2026-04-29</td><td>电控所</td><td>成明锴</td><td>中心库2-02</td><td>FA-2026-0002</td><td>86,500</td><td>83,300</td><td>年限平均法</td><td>2026-04-11</td><td>联合动力</td><td>2026-04-29 10:20</td><td>账实一致</td></tr>' +
      '<tr><td><input type="checkbox" class="proc-order-pick" checked ' + roCheckbox + ' /></td><td data-col="code">A0200100001</td><td>HT-2026-102</td><td>经营发展中心</td><td data-col="name">工业级交换机</td><td data-col="spec">V2.0</td><td>销售类</td><td>20,340.00</td><td data-col="qty">4</td><td>12</td><td data-col="status">在库</td><td>2026-04-29</td><td>经营发展中心</td><td>宋中波</td><td>中心库3-03</td><td>FA-2026-0003</td><td>92,000</td><td>88,700</td><td>年限平均法</td><td>2026-04-12</td><td>联合动力</td><td>2026-04-29 10:40</td><td>账实一致</td></tr>' +
      "</tbody></table>" +
      '<p id="orderPickTip" style="margin:8px 0 0;font-size:12px;color:#516a87">已勾选 2 项设备</p>'
    );
  }

  function getOrderRowData(el) {
    var tr = el && el.closest ? el.closest("tr") : null;
    if (!tr) return null;
    var tds = tr.querySelectorAll("td");
    return {
      orderNo: tr.getAttribute("data-order-row") || "",
      applicant: cleanText(tds[0] ? tds[0].textContent : "当前用户"),
      dept: cleanText(tds[1] ? tds[1].textContent : "经营发展中心"),
      company: cleanText(tds[2] ? tds[2].textContent : "河南能源"),
      applyDate: cleanText(tds[3] ? tds[3].textContent : "2026-04-15"),
      site: cleanText(tds[4] ? tds[4].textContent : "新安风电场"),
      summary: cleanText(tds[5] ? tds[5].textContent : ""),
      status: cleanText(tds[6] ? tds[6].textContent : ""),
      confirmer: cleanText(tds[7] ? tds[7].textContent : "张敏（经营发展中心）"),
      logisticsNo: cleanText(tds[8] ? tds[8].textContent : ""),
      salesContractNo: cleanText(tds[9] ? tds[9].textContent : "")
    };
  }

  function nowYmdCompact() {
    var d = new Date();
    function p(n) {
      return String(n).padStart(2, "0");
    }
    return String(d.getFullYear()) + p(d.getMonth() + 1) + p(d.getDate());
  }

  function bindOrderSalesContractRelation(root) {
    if (!root) return;
    var sel = root.querySelector("#ordSalesContractNo");
    if (!sel) return;
  }

  function openOrderApproveHandleModal(rowData, tr) {
    var salesNo = rowData && rowData.salesContractNo ? rowData.salesContractNo : "";
    openProcModal(
      "订单需求管理审批办理",
      '<div class="field-row"><label>订单编号</label><span>' + escHtml((rowData && rowData.orderNo) || "—") + "</span></div>" +
        '<div class="field-row"><label>审批结论</label><select id="ordApproveResult"><option value="pass">同意</option><option value="reject">驳回</option></select></div>' +
        '<div class="field-row"><label>销售合同编号</label><select id="ordSalesContractNo"><option value="">请选择销售合同编号</option><option value="XSHT-2026-001"' + (salesNo==="XSHT-2026-001"?" selected":"") + '>XSHT-2026-001</option><option value="XSHT-2026-002"' + (salesNo==="XSHT-2026-002"?" selected":"") + '>XSHT-2026-002</option><option value="XSHT-2026-003"' + (salesNo==="XSHT-2026-003"?" selected":"") + '>XSHT-2026-003</option></select></div>' +
        '<div class="field-row"><label>审批意见 <span style="color:#cf1322">*</span></label><textarea id="ordApproveOpinion" rows="3" placeholder="请输入审批意见"></textarea></div>',
      '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="ordApproveOk">确认提交</button>'
    );
    bindOrderSalesContractRelation(document.getElementById("procModalBody"));
    var cancel = $("procModalCancel");
    if (cancel) cancel.addEventListener("click", closeProcModal);
    var ok = $("ordApproveOk");
    if (!ok) return;
    ok.addEventListener("click", function () {
      var opinionEl = $("ordApproveOpinion");
      if (opinionEl && !String(opinionEl.value || "").trim()) {
        toast("请填写审批意见");
        return;
      }
      var result = $("ordApproveResult") ? $("ordApproveResult").value : "pass";
      var sn = $("ordSalesContractNo") ? $("ordSalesContractNo").value : "";
      if (result === "pass" && !sn) {
        toast("请选择销售合同编号");
        return;
      }
      if (tr) {
        var statusCell = tr.querySelector("[data-order-status-text]");
        if (statusCell) statusCell.textContent = result === "pass" ? "已确认" : "待确认";
        var ownerCell = tr.querySelector("[data-order-owner]");
        if (ownerCell && result === "pass") ownerCell.textContent = "业务部门专责";
        var salesNoCell = tr.querySelector("[data-order-sales-no]");
        if (salesNoCell) salesNoCell.textContent = sn;
      }
      toast(result === "pass" ? "审批通过并已关联销售合同（演示）" : "已驳回（演示）");
      closeProcModal();
    });
  }

  function buildNextOrderNo() {
    var nodes = document.querySelectorAll("[data-order-row]");
    var max = 6000;
    Array.prototype.forEach.call(nodes, function (n) {
      var id = n.getAttribute("data-order-row") || "";
      var num = Number((id.match(/\d+$/) || [0])[0]);
      if (num > max) max = num;
    });
    return "ORD" + String(max + 1);
  }

  function markOrderConfirmed(orderNo, confirmer) {
    var row = document.querySelector('[data-order-row="' + orderNo + '"]');
    if (!row) return;
    var statusCell = row.querySelector("[data-order-status]");
    var opCell = row.querySelector("[data-order-op]");
    if (statusCell) statusCell.innerHTML = '<span class="tag-soft tag-blue">已确认</span>';
    if (opCell) {
      opCell.innerHTML = '<a href="#" class="js-op" data-op="订单查看详情">查看</a>';
    }
  }

  function rowM10InboundStatus(tr) {
    var c = tr.children[M10_INBOUND_STATUS_TD];
    if (!c) return "";
    var t = cleanText(c.textContent || "");
    if (t.indexOf("已验收") >= 0 || t.indexOf("已入库") >= 0) return "已验收";
    if (t.indexOf("验收中") >= 0 || t.indexOf("入库中") >= 0) return "入库中";
    if (t.indexOf("待验收") >= 0 || t.indexOf("待入库") >= 0 || t.indexOf("待确认") >= 0 || t.indexOf("草稿") >= 0) return "待验收";
    return t || "";
  }

  function ledgerAggregatedStatusHtml(posted, pending) {
    if (posted > 0 && pending === 0) {
      return '<span class="tag-soft tag-done">已入库</span>';
    }
    if (posted > 0 && pending > 0) {
      return '<span class="tag-soft tag-pending">部分入库</span>';
    }
    if (posted === 0 && pending > 0) {
      return '<span class="tag-soft tag-pending">待入库</span>';
    }
    return '<span class="tag-soft tag-draft">—</span>';
  }

  /** 库存台账汇总行操作列（仅「详情」） */
  function ledgerLedgerOpsCellHtml(posted, pending) {
    return (
      '<td class="proc-ops-cell"><span class="proc-ops-row">' +
      '<a href="#" class="js-op" data-op="验收查看详情">详情</a>' +
      "</span></td>"
    );
  }

  function ensureInboundTableColumns() {
    var tb = document.querySelector(M10_INBOUND_TBODY_SEL);
    if (!tb) return;
    Array.prototype.forEach.call(tb.querySelectorAll("tr"), function (tr) {
      if (!tr || !tr.children || tr.children.length >= 18) return;
    });
  }

  function renderM10ContractCellHtml(frameworkCode) {
    var c = String(frameworkCode || "—");
    var splitAt = c.lastIndexOf("-");
    var top = splitAt > 0 ? c.slice(0, splitAt + 1) : c;
    var bottom = splitAt > 0 ? c.slice(splitAt + 1) : "";
    return '<td><span class="m10-contract-code" data-contract-toggle aria-expanded="false">' + escHtml(top) + (bottom ? "<br>" + escHtml(bottom) : "") + "</span></td>";
  }

  function renderMaterialCategoryWithHelp(category) {
    return escHtml(normalizeMaterialCategory(category, category));
  }

  function extractM10CellDisplayText(td) {
    if (!td) return "—";
    var contractMain = td.querySelector && td.querySelector(".m10-contract-code");
    if (contractMain) return cleanText(contractMain.textContent || "") || "—";
    var clone = td.cloneNode(true);
    if (clone.querySelectorAll) {
      clone
        .querySelectorAll(".m10-contract-help,.m10-category-help-trigger,.m10-help-tip,[data-contract-toggle]")
        .forEach(function (el) {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }
    var text = cleanText((clone.textContent || "").replace(/\?/g, ""));
    return text || "—";
  }

  function m10InboundTrAttr(tr, key, fallback) {
    if (!tr) return fallback == null ? "" : String(fallback);
    var v = tr.getAttribute(key);
    if (v != null && String(v).trim() !== "") return String(v).trim();
    return fallback == null ? "" : String(fallback);
  }

  function m10InboundLineDataFromTr(tr) {
    var map = rowMapFromTableRow(tr);
    var typeCode = m10InboundTrAttr(tr, "data-m10-type-code", map["物资类型编码"] || "");
    var recvQty = m10InboundTrAttr(tr, "data-m10-recv-qty", map["验收数量"] || "100");
    var shipQty = m10InboundTrAttr(tr, "data-m10-ship-qty", map["发货数量"] || "100");
    var nRecv = Number(recvQty) || 1;
    return {
      matType: m10InboundTrAttr(tr, "data-m10-mat-type", map["物资类别"] || "生产类"),
      typeCode: typeCode,
      matCode: typeCode ? materialCodeRangeFromTypeCode(typeCode, nRecv) : "",
      spec: m10InboundTrAttr(tr, "data-m10-spec", map["规格型号"] || ""),
      shipQty: shipQty,
      recvQty: recvQty,
      recvTime: m10InboundTrAttr(tr, "data-m10-recv-time", map["入库时间"] || ""),
      receiver: m10InboundTrAttr(tr, "data-m10-receiver", map["收货人"] || ""),
      keeper: m10InboundTrAttr(tr, "data-m10-keeper", map["保管人"] || ""),
      logistics: m10InboundTrAttr(tr, "data-m10-logistics", "WL20260418"),
      warehouse: m10InboundTrAttr(tr, "data-m10-warehouse", map["存放仓库/货位"] || "")
    };
  }

  function m10DetailDisabledSelect(val, label) {
    var v = val == null ? "" : String(val);
    var lb = label == null || label === "" ? v || "—" : String(label);
    return (
      '<div class="qa-inp qa-inp--auto" tabindex="-1">' +
      escHtml(lb || "—") +
      "</div>"
    );
  }

  function m10DetailDisabledInput(val) {
    return (
      '<div class="qa-inp" tabindex="-1">' +
      escHtml(val == null ? "" : String(val)) +
      "</div>"
    );
  }

  function m10InboundProductsFromTr(tr) {
    var raw = m10InboundTrAttr(tr, "data-m10-products", "");
    if (!raw) {
      var map = rowMapFromTableRow(tr);
      raw = map["产品名称"] || map["物资名称"] || "";
    }
    var names = String(raw)
      .split(/[.．·]/)
      .map(function (s) {
        return cleanText(s);
      })
      .filter(Boolean);
    return names.length ? names : ["—"];
  }

  function buildM10InboundDetailLinesTableHtml(tr) {
    var d = m10InboundLineDataFromTr(tr);
    var whLabel = d.warehouse;
    if (d.warehouse.indexOf("A区") >= 0) whLabel = "公司中心库 / A区-01";
    else if (d.warehouse.indexOf("B区") >= 0) whLabel = "公司中心库 / B区-02";
    else if (d.warehouse.indexOf("C-01") >= 0 || d.warehouse.indexOf("华东") >= 0) whLabel = "华东分仓 / C-01";
    else if (d.warehouse.indexOf("D-03") >= 0 || d.warehouse.indexOf("华北") >= 0) whLabel = "华北备件库 / D区-06";
    var map = rowMapFromTableRow(tr);
    var productCode = map["产品编码"] || (d && d.typeCode ? materialCodeFromTypeCode(d.typeCode) : "");
    var products = m10InboundProductsFromTr(tr);
    var bodyRows = products
      .map(function (productName) {
        var typeName = map["物资类型名称"] || productName || "";
        return (
          "<tr>" +
          "<td>" +
          m10DetailDisabledSelect(productName) +
          "</td><td>" +
          m10DetailDisabledSelect(d.spec) +
          "</td><td>" +
          m10DetailDisabledSelect(productCode) +
          "</td><td>" +
          m10DetailDisabledSelect(d.matType) +
          "</td><td>" +
          m10DetailDisabledSelect(typeName) +
          "</td><td>" +
          m10DetailDisabledSelect(d.typeCode) +
          "</td><td>" +
          m10DetailDisabledInput(d.shipQty) +
          "</td><td>" +
          m10DetailDisabledInput(d.recvQty) +
          "</td><td>" +
          m10DetailDisabledSelect(d.recvTime) +
          "</td><td>" +
          m10DetailDisabledSelect(d.receiver) +
          "</td><td>" +
          m10DetailDisabledSelect(d.keeper) +
          "</td><td>" +
          m10DetailDisabledInput(d.logistics) +
          "</td><td>" +
          m10DetailDisabledSelect(d.warehouse, whLabel) +
          "</td><td>" +
          m10DetailDisabledSelect(materialDetailAssetType(d.matType || typeName || productName)) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<div class="qa-mat-lines-block" style="margin-top:14px">' +
      '<div class="qa-mat-lines-table-wrap">' +
      '<table class="qa-mat-lines-table" role="grid">' +
      "<thead><tr>" +
      "<th>产品名称</th>" +
      "<th>产品型号</th>" +
      "<th>产品编码</th>" +
      "<th>物资类别</th>" +
      "<th>物资类型名称</th>" +
      "<th>物资类型编码</th>" +
      "<th>发货数量</th>" +
      "<th>验收数量</th>" +
      "<th>收货时间</th>" +
      "<th>收货人</th>" +
      "<th>保管人</th>" +
      "<th>物流单号</th>" +
      "<th>仓库</th>" +
      "<th>资产类型</th>" +
      "</tr></thead><tbody>" +
      bodyRows +
      "</tbody></table></div></div>"
    );
  }

  function buildM10InboundDetailHtml(tr) {
    return buildDetailHtmlFromTableRow(tr) + buildM10InboundDetailLinesTableHtml(tr);
  }

  function buildDetailHtmlFromTableRow(tr) {
    if (!tr) return "";
    var table = tr.closest ? tr.closest("table") : null;
    if (!table) return "";
    var headRow = table.querySelector("thead tr");
    if (!headRow) return "";
    var ths = Array.prototype.slice.call(headRow.children || []);
    var tds = Array.prototype.slice.call(tr.children || []);
    var parts = [];
    function headerLabel(th) {
      if (!th) return "";
      var clone = th.cloneNode(true);
      if (clone.querySelectorAll) {
        clone.querySelectorAll(".m10-help-wrap, .m10-category-help-trigger").forEach(function (el) {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        });
      }
      return cleanText((clone.textContent || "").replace(/\?/g, ""));
    }
    ths.forEach(function (th, idx) {
      var label = headerLabel(th);
      if (!label || label === "操作") return;
      if (table.id === "proc-m10-inbound-table" && M10_INBOUND_DETAIL_OMIT[label]) return;
      var value = extractM10CellDisplayText(tds[idx]);
      if (label === "备注" && (value === "—" || !cleanText(value))) {
        value = "";
      }
      parts.push('<div class="field-row"><label>' + escHtml(label) + "</label><span>" + escHtml(value) + "</span></div>");
    });
    return parts.join("");
  }

  function rowMapFromTableRow(tr) {
    var map = {};
    if (!tr) return map;
    var table = tr.closest ? tr.closest("table") : null;
    if (!table) return map;
    var headRow = table.querySelector("thead tr");
    if (!headRow) return map;
    var ths = Array.prototype.slice.call(headRow.children || []);
    var tds = Array.prototype.slice.call(tr.children || []);
    function headerLabel(th) {
      if (!th) return "";
      var clone = th.cloneNode(true);
      if (clone.querySelectorAll) {
        clone.querySelectorAll(".m10-help-wrap, .m10-category-help-trigger").forEach(function (el) {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        });
      }
      return cleanText((clone.textContent || "").replace(/\?/g, ""));
    }
    ths.forEach(function (th, idx) {
      var label = headerLabel(th);
      if (!label || label === "操作") return;
      map[label] = extractM10CellDisplayText(tds[idx]);
    });
    return map;
  }

  function buildMiniTableHtml(title, headers, rows) {
    var head = headers.map(function (h) { return "<th>" + escHtml(h) + "</th>"; }).join("");
    var body = rows.map(function (row) {
      return "<tr>" + headers.map(function (h) { return "<td>" + escHtml(row[h] == null ? "—" : row[h]) + "</td>"; }).join("") + "</tr>";
    }).join("");
    return (
      '<div style="margin-top:14px">' +
      '<div style="font-weight:600;margin:0 0 8px;color:#1f3551;">' + escHtml(title) + "</div>" +
      '<table class="proc-mini-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table>" +
      "</div>"
    );
  }

  function buildMaterialTraceTimelineHtml(trackCode, materialName) {
    var code = cleanText(trackCode || "A0100100001");
    var name = cleanText(materialName || "智能风机控制器");
    var lineDot = function (active) {
      return (
        '<span style="display:inline-block;width:12px;height:12px;border-radius:999px;vertical-align:middle;background:' +
        (active ? "#21a366" : "#d7dbe2") +
        ';"></span>'
      );
    };
    function row(dot, title, time) {
      return (
        '<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;">' +
        '<div style="width:16px;display:flex;justify-content:center;line-height:1;padding-top:4px;">' +
        dot +
        "</div>" +
        '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:18px;color:#1f2937;line-height:1.4;">' + escHtml(title) + "</div>" +
        '<div style="margin-top:2px;color:#6b7280;font-size:15px;">' + escHtml(time) + "</div>" +
        "</div>" +
        "</div>"
      );
    }
    return (
      '<div style="padding:4px 2px 2px;">' +
      row(lineDot(false), name + "（" + code + "）完成入库", "2026-04-20 09:30 · 山东风电中心仓库001货位") +
      row(lineDot(true), name + "被电控所领用", "2026-05-10 14:20 · 领用单号 LY-2026-0510") +
      "</div>"
    );
  }

  function renderInlineTrackTimeline(el) {
    var code = el && el.getAttribute ? el.getAttribute("data-track-code") : "";
    var name = el && el.getAttribute ? el.getAttribute("data-track-name") : "";
    var box = document.getElementById("procInlineTrackBox");
    if (!box) return;
    box.innerHTML = buildMaterialTraceTimelineHtml(code, name);
    box.style.display = "";
  }

  /** 库存台账详情 / 新增入库（流程回到发起人）共用物资明细表头 */
  var MATERIAL_DETAIL_TABLE_HEADERS = [
    "序号",
    "产品名称",
    "产品型号",
    "产品编码",
    "C码",
    "设备出厂唯一码",
    "财务固定资产编码",
    "物资类型名称",
    "物资类型编码",
    "采购部门",
    "供应商",
    "采购单价（含税）",
    "入库时间",
    "经办人",
    "使用人",
    "资产类型",
    "仓库名称",
    "是否在库",
    "是否开票",
    "操作"
  ];

  var QA_INBOUND_RETURN_INITIATOR_KEY = "map_m10_inbound_flow_return_initiator_v1";
  var qaInboundContextTr = null;
  /** initiate=新增入库发起；returnInitiator=流程回到发起人（我的待办·办理） */
  var qaInboundModalMode = null;

  function factoryDeviceUniqueCode(seq) {
    return "F" + String(Math.max(1, Number(seq) || 1)).padStart(11, "0");
  }

  function financialFixedAssetCode(seq) {
    return "FA-2026-" + String(Math.max(1, Number(seq) || 1)).padStart(3, "0");
  }

  function qaInboundFlowReturnTr() {
    if (
      qaInboundContextTr &&
      qaInboundContextTr.getAttribute &&
      qaInboundContextTr.getAttribute("data-m10-flow-return") === "1"
    ) {
      return qaInboundContextTr;
    }
    var tb = document.querySelector(M10_INBOUND_TBODY_SEL);
    if (!tb) return null;
    return tb.querySelector('tr[data-m10-flow-return="1"]');
  }

  function qaInboundFlowReturnedToInitiator() {
    return qaInboundModalMode === "returnInitiator";
  }

  function qaContractKeyForInboundTr(tr) {
    if (!tr || !tr.children) return "";
    function cell(i) {
      var td = tr.children[i];
      return td ? cleanText(td.textContent || "") : "";
    }
    var fw = cell(M10_INBOUND_COL.contractNo);
    var ex = cell(M10_INBOUND_COL.executionNo);
    var k;
    for (k in QA_ACCEPT_BY_CONTRACT) {
      if (!Object.prototype.hasOwnProperty.call(QA_ACCEPT_BY_CONTRACT, k)) continue;
      var m = QA_ACCEPT_BY_CONTRACT[k];
      if (fw && String(m.frameworkNo || "") === fw) return k;
      if (ex && String(m.executionNo || "") === ex) return k;
      if (fw && String(m.normalNo || "") === fw) return k;
    }
    return "";
  }

  function qaPrefillFromInboundReturnTr(tr) {
    if (!tr || tr.getAttribute("data-m10-flow-return") !== "1") return;
    qaInboundContextTr = tr;
    function cell(i) {
      var td = tr.children[i];
      return td ? cleanText(td.textContent || "") : "";
    }
    var ck = qaContractKeyForInboundTr(tr);
    var csel = $("qaFldContractSel");
    var cName = $("qaFldContractName");
    if (ck && csel) {
      csel.value = ck;
      applyQaAcceptContract(ck);
      if (cName) {
        var m = QA_ACCEPT_BY_CONTRACT[ck];
        cName.value = m && m.contractName ? m.contractName : "";
      }
      var cNameBtn = $("qaFldContractNameDdBtn");
      if (cNameBtn) {
        cNameBtn.textContent = cName && cName.value ? cName.value : "请选择合同名称";
      }
      var ro = $("qaFldContractReadonly");
      if (ro) ro.value = ck;
    } else {
      function set(id, v) {
        var el = $(id);
        if (el) el.value = v == null ? "" : String(v);
      }
      set("qaFldFrameworkNo", cell(M10_INBOUND_COL.contractNo));
      set("qaFldExecutionReadonly", cell(M10_INBOUND_COL.executionNo));
      set("qaAutoSupplier", cell(M10_INBOUND_COL.supplier));
      qaClearMaterialLines();
    }
    var inboundBy = $("qaFldInbound");
    if (inboundBy) inboundBy.value = cell(M10_INBOUND_COL.inboundBy) || "宋波";
    var inboundType = $("qaFldInboundType");
    var inboundTypeBtn = $("qaInboundTypeDdBtn");
    var typeLabel = cell(M10_INBOUND_COL.inboundType) || "采购入库";
    if (inboundType) inboundType.value = typeLabel;
    if (inboundTypeBtn) inboundTypeBtn.textContent = typeLabel;
    var remark = $("qaFldRemark");
    if (remark) remark.value = cell(M10_INBOUND_COL.remark) || "各级审批已完成，发起人补录入库（演示）";
    var d = m10InboundLineDataFromTr(tr);
    var primary =
      m10InboundTrAttr(tr, "data-m10-primary-name", "") ||
      String(cell(M10_INBOUND_COL.productName))
        .split(/[.．·]/)[0]
        .trim() ||
      cell(M10_INBOUND_COL.productName) ||
      "IGBT驱动板";
    if (ck) {
      qaClearMaterialLines();
      var line = (QA_ACCEPT_BY_CONTRACT[ck].materialLines || [])[0];
      if (line) {
        qaAddMaterialLineFromContractLine(ck, {
          name: line.name || primary,
          typeCode: line.typeCode || d.typeCode,
          spec: line.spec || d.spec,
          category: line.category || d.matType,
          qty: String(d.recvQty || line.qty || "100"),
          productCode: "B00000001"
        });
        var matBody = $("qaMatLinesTbody");
        var matTr = matBody ? matBody.querySelector("tr[data-qa-line-id]") : null;
        if (matTr) {
          var ship = matTr.querySelector(".qa-line-shipqty");
          var recv = matTr.querySelector(".qa-line-recvqty");
          var wh = matTr.querySelector(".qa-line-warehouse");
          if (ship) ship.value = String(d.shipQty || "100");
          if (recv) recv.value = String(d.recvQty || "100");
          if (wh && d.warehouse) {
            Array.prototype.some.call(wh.options || [], function (opt, idx) {
              if (cleanText(opt.text).indexOf(cleanText(d.warehouse).slice(0, 6)) >= 0) {
                wh.selectedIndex = idx;
                return true;
              }
              return false;
            });
          }
          var rt = matTr.querySelector(".qa-line-recvtime");
          if (rt && d.recvTime) rt.value = String(d.recvTime).slice(0, 16);
          var rcv = matTr.querySelector(".qa-line-receiver");
          var kpr = matTr.querySelector(".qa-line-keeper");
          if (rcv) rcv.value = d.receiver || "宋波";
          if (kpr) kpr.value = d.keeper || "宋波";
          var log = matTr.querySelector(".qa-line-logistics");
          if (log) log.value = d.logistics || "";
        }
      } else {
        qaAddMaterialLineRow(ck, primary);
      }
    }
  }

  function materialDetailDeviceCode(seq) {
    var MCS = window.MaterialCodeScheme;
    return MCS ? MCS.deviceUniqueCode(seq) : "C" + String(Math.max(1, Number(seq) || 1)).padStart(11, "0");
  }

  function materialDetailProductCode(base, idx) {
    var MCS = window.MaterialCodeScheme;
    if (MCS && /^B\d{8}$/i.test(String(base || ""))) {
      return MCS.instanceCodeWithOffset(base, idx - 1);
    }
    if (MCS && /^B\d{7}$/i.test(String(base || ""))) {
      return MCS.instanceCodeWithOffset(MCS.migrateBCode7(base), idx - 1);
    }
    var b = String(base || "");
    var m = b.match(/^(B)(\d+)$/i);
    if (m) return m[1] + String((Number(m[2]) || 0) + (idx - 1)).padStart(8, "0");
    return b;
  }

  function materialDetailAssetType(name) {
    var s = String(name || "");
    if (s.indexOf("无形") >= 0 || s.indexOf("软件") >= 0 || s.indexOf("许可") >= 0) return "无形资产";
    if (s.indexOf("存货") >= 0 || s.indexOf("耗材") >= 0 || s.indexOf("备品") >= 0) return "存货";
    return "固定资产";
  }

  function buildMaterialDetailRowsFromSource(source) {
    source = source || {};
    var baseName = source.baseName || "智能风机控制器";
    var typeCodeRaw = source.typeCode || materialTypeCodeFromType("生产类", baseName);
    var baseCode = source.baseCode || materialCodeFromTypeCode(typeCodeRaw);
    var baseSpec = source.baseSpec || "GW66-1500";
    var unitPrice = source.unitPrice || "—";
    var dept = source.dept || "—";
    var supplier = source.supplier || "—";
    var inboundTime = source.inboundTime || "2026-04-20 09:30";
    var handlerRaw = source.handler || "宋中波";
    var warehouse = source.warehouse || "公司中心库 / 山东风电中心001货位";
    var inStockFlag = source.inStock != null ? source.inStock : "否";
    var count = Math.max(1, Math.min(50, Number(source.count) || 10));
    var rows = [];
    var i;
    for (i = 1; i <= count; i++) {
      var code = materialDetailProductCode(baseCode, i);
      var name = baseName;
      rows.push({
        序号: String(i),
        产品名称: name,
        产品型号: baseSpec,
        产品编码: code,
        C码: materialDetailDeviceCode(i),
        设备出厂唯一码: factoryDeviceUniqueCode(i),
        财务固定资产编码: financialFixedAssetCode(i),
        物资类型名称: baseName,
        物资类型编码: typeCodeRaw,
        采购部门: dept,
        供应商: supplier,
        采购单价: unitPrice,
        入库时间: inboundTime,
        经办人: handlerRaw,
        使用人: handlerRaw,
        资产类型: materialDetailAssetType(baseName),
        仓库名称: warehouse,
        是否在库: inStockFlag,
        是否开票: i % 4 === 0 ? "已开票" : "未开票",
        物资跟踪:
          '<a href="#" class="m10-material-track-link" data-track-action="material-track" data-track-code="' +
          escHtml(code) +
          '" data-track-name="' +
          escHtml(name) +
          '">物资跟踪</a>'
      });
    }
    return rows;
  }

  function buildMaterialDetailRowsFromQaMatLines() {
    var matBody = $("qaMatLinesTbody");
    if (!matBody) return [];
    var supplier = $("qaAutoSupplier") ? String($("qaAutoSupplier").value || "").trim() : "";
    var handler = $("qaFldInbound") ? String($("qaFldInbound").value || "").trim() : "宋中波";
    var rows = [];
    var seq = 0;
    Array.prototype.forEach.call(matBody.querySelectorAll("tr[data-qa-line-id]"), function (tr) {
      var name = tr.querySelector(".qa-line-matname");
      var spec = tr.querySelector(".qa-line-spec");
      var productCode = tr.querySelector(".qa-line-productcode");
      var typeName = tr.querySelector(".qa-line-typename");
      var typeCode = tr.querySelector(".qa-line-typecode");
      var recvEl = tr.querySelector(".qa-line-recvqty");
      var whEl = tr.querySelector(".qa-line-warehouse");
      var recvTimeEl = tr.querySelector(".qa-line-recvtime");
      var baseName = echoFieldVal(name);
      var typeCodeRaw = echoFieldVal(typeCode);
      if (!typeCodeRaw) typeCodeRaw = materialTypeCodeFromType("生产类", baseName);
      var baseCode = echoFieldVal(productCode) || materialCodeFromTypeCode(typeCodeRaw);
      var qty = recvEl ? Number(String(recvEl.value || "").trim()) : 0;
      if (!isFinite(qty) || qty < 1) qty = 1;
      qty = Math.min(qty, 50);
      var whLabel = whEl ? String(whEl.options[whEl.selectedIndex] ? whEl.options[whEl.selectedIndex].text : whEl.value || "") : "";
      var recvTime = recvTimeEl ? String(recvTimeEl.value || "").trim() : "";
      if (recvTime && recvTime.length === 10) recvTime += " 09:30";
      var j;
      for (j = 1; j <= qty; j++) {
        seq += 1;
        var code = materialDetailProductCode(baseCode, j);
        var displayName = baseName || echoFieldVal(typeName);
        rows.push({
          序号: String(seq),
          产品名称: displayName,
          产品型号: echoFieldVal(spec),
          产品编码: code,
          C码: materialDetailDeviceCode(seq),
          设备出厂唯一码: factoryDeviceUniqueCode(seq),
          财务固定资产编码: financialFixedAssetCode(seq),
          物资类型名称: echoFieldVal(typeName) || displayName,
          物资类型编码: typeCodeRaw,
          采购部门: "经营发展中心",
          供应商: supplier || "—",
          采购单价: "—",
          入库时间: recvTime || "2026-04-20 09:30",
          经办人: handler,
          使用人: handler,
          资产类型: materialDetailAssetType(echoFieldVal(typeName) || displayName),
          仓库名称: whLabel || "公司中心库 / 山东风电中心001货位",
          是否在库: "否",
          是否开票: seq % 4 === 0 ? "已开票" : "未开票",
          物资跟踪:
            '<a href="#" class="m10-material-track-link" data-track-action="material-track" data-track-code="' +
            escHtml(code) +
            '" data-track-name="' +
            escHtml(displayName) +
            '">物资跟踪</a>'
        });
      }
    });
    return rows;
  }

  function materialDetailReadonlyCell(val) {
    return (
      '<span class="qa-detail-ro">' + escHtml(val == null || val === "" ? "—" : String(val)) + "</span>"
    );
  }

  function materialDetailRowTrHtml(row, editableHandfill) {
    var factoryVal = row.设备出厂唯一码 || row["出厂设备唯一码"] || "";
    var faVal = row.财务固定资产编码 || "";
    var factoryCell = editableHandfill
      ? '<input class="qa-inp qa-detail-factory-code" type="text" value="' +
        escHtml(factoryVal) +
        '" placeholder="如电子产品序列号，sn码等" autocomplete="off" />'
      : materialDetailReadonlyCell(factoryVal);
    var faCell = editableHandfill
      ? '<input class="qa-inp qa-detail-fa-code" type="text" value="' +
        escHtml(faVal) +
        '" placeholder="" autocomplete="off" />'
      : materialDetailReadonlyCell(faVal);
    return (
      "<tr>" +
      "<td>" + materialDetailReadonlyCell(row.序号) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.产品名称) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.产品型号) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.产品编码) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.C码) + "</td>" +
      "<td>" + factoryCell + "</td>" +
      "<td>" + faCell + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.物资类型名称) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.物资类型编码) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.采购部门) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.供应商) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.采购单价) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.入库时间) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.经办人) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.使用人) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.资产类型) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.仓库名称) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.是否在库) + "</td>" +
      "<td>" + materialDetailReadonlyCell(row.是否开票) + "</td>" +
      "<td>" + (editableHandfill ? materialDetailReadonlyCell("物资跟踪") : row.物资跟踪) + "</td>" +
      "</tr>"
    );
  }

  function renderQaInboundMatDetailList() {
    var block = $("qaMatDetailListBlock");
    var thead = $("qaMatDetailListHead");
    var tbody = $("qaMatDetailListTbody");
    if (!block || !thead || !tbody) return;
    var show = qaInboundFlowReturnedToInitiator();
    block.hidden = !show;
    if (!show) {
      tbody.innerHTML = "";
      return;
    }
    thead.innerHTML = MATERIAL_DETAIL_TABLE_HEADERS.map(function (h) {
      return "<th>" + escHtml(h) + "</th>";
    }).join("");
    var rows = buildMaterialDetailRowsFromQaMatLines();
    if (!rows.length) {
      var retTr = qaInboundFlowReturnTr();
      if (retTr) {
        var mapRet = rowMapFromTableRow(retTr);
        var dRet = m10InboundLineDataFromTr(retTr);
        rows = buildMaterialDetailRowsFromSource({
          baseName:
            m10InboundTrAttr(retTr, "data-m10-primary-name", "") ||
            mapRet["产品名称"] ||
            "IGBT驱动板",
          typeCode: dRet.typeCode || "A0100100002",
          baseCode: "B00000001",
          baseSpec: dRet.spec || "GW66-1500",
          unitPrice: "23,891.59",
          dept: "运维中心",
          supplier: mapRet["供应商"] || "远景能源",
          warehouse: dRet.warehouse || "公司中心库 / 山东风电中心001货位",
          handler: mapRet["入库人"] || "宋波",
          inboundTime: dRet.recvTime || "2026-04-20 09:30",
          count: Math.max(10, Math.min(50, Number(dRet.recvQty) || 10))
        });
      } else {
        rows = buildMaterialDetailRowsFromSource({ count: 10 });
      }
    }
    var handfill = qaInboundModalMode === "returnInitiator";
    if (handfill) {
      rows = rows.map(function (r) {
        var copy = {};
        var k;
        for (k in r) {
          if (Object.prototype.hasOwnProperty.call(r, k)) copy[k] = r[k];
        }
        copy["设备出厂唯一码"] = "";
        copy["财务固定资产编码"] = "";
        return copy;
      });
    }
    tbody.innerHTML = rows
      .map(function (r) {
        return materialDetailRowTrHtml(r, handfill);
      })
      .join("");
  }

  function buildLedgerExtraTablesHtml(tr) {
    var map = rowMapFromTableRow(tr);
    var baseName = map["物资类型名称"] || map["物资名称"] || "智能风机控制器";
    var typeCodeRaw = map["物资类型编码"] || materialTypeCodeFromType("生产类", baseName);
    var baseCode = materialCodeFromTypeCode(typeCodeRaw);
    var baseSpec = cleanText((tr && tr.getAttribute && tr.getAttribute("data-m10-spec")) || map["产品型号"] || map["规格型号"] || "");
    if (!baseSpec) baseSpec = "GW66-1500";
    var unitPrice = map["采购单价（含税）"] || map["采购平均单价（含税）"] || "—";
    var dept = (tr && tr.getAttribute && tr.getAttribute("data-m10-dept")) || map["采购部门"] || "—";
    var supplier = (tr && tr.getAttribute && tr.getAttribute("data-m10-supplier")) || map["供应商"] || "—";
    var inboundTime = cleanText((tr && tr.getAttribute && tr.getAttribute("data-m10-inbound-time")) || "");
    if (!inboundTime) inboundTime = "2026-04-20 09:30";
    var handlerRaw = cleanText((tr && tr.getAttribute && tr.getAttribute("data-m10-handler")) || "");
    if (!handlerRaw) handlerRaw = "宋中波";
    var warehouse = cleanText((tr && tr.getAttribute && tr.getAttribute("data-m10-warehouse")) || "");
    if (!warehouse) warehouse = "公司中心库 / 山东风电中心001货位";
    var rows = buildMaterialDetailRowsFromSource({
      baseName: baseName,
      typeCode: typeCodeRaw,
      baseCode: baseCode,
      baseSpec: baseSpec,
      unitPrice: unitPrice,
      dept: dept,
      supplier: supplier,
      inboundTime: inboundTime,
      handler: handlerRaw,
      warehouse: warehouse,
      inStock: "否",
      count: 10
    });
    var head = MATERIAL_DETAIL_TABLE_HEADERS.map(function (h) {
      return "<th>" + escHtml(h) + "</th>";
    }).join("");
    var body = rows
      .map(function (r) {
        return materialDetailRowTrHtml(r, false);
      })
      .join("");
    return (
      '<div style="margin-top:14px">' +
      '<div style="font-weight:600;margin:0 0 8px;color:#1f3551;">物资明细表</div>' +
      '<div class="proc-ledger-detail-table-wrap">' +
      '<table class="proc-mini-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table>" +
      "</div>" +
      '<div id="procInlineTrackWrap" style="margin-top:14px">' +
      '<div style="font-weight:600;margin:0 0 8px;color:#1f3551;">物资跟踪</div>' +
      '<div id="procInlineTrackBox" style="display:none;border:1px solid #e6edf5;border-radius:8px;padding:12px;background:#fff"></div>' +
      '<div id="procInlineTrackHint" style="font-size:12px;color:#8a94a6;margin-top:6px">点击上方“物资跟踪”在当前弹窗内展开节点轨迹。</div>' +
      "</div>" +
      "</div>"
    );
  }

  function switchM10SubTab(key) {
    var sec = document.getElementById("proc-m10");
    if (!sec) return;
    var btn = sec.querySelector('[data-m10-sub-tab="' + key + '"]');
    if (btn) btn.click();
  }

  function ledgerHashSeed(s) {
    var h = 0;
    var str = String(s || "");
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function normalizeMaterialCategory(value, seedKey) {
    var t = cleanText(value || "");
    if (!t) t = "";
    if (t.indexOf("生产") >= 0) return "生产类";
    if (t.indexOf("办公") >= 0) return "办公类";
    if (t.indexOf("销售") >= 0) return "销售类";
    if (/电子|变流|驱动|风机|齿轮|发电|模块|叶片/.test(t)) return "生产类";
    if (/展示|客户|市场|营销|样机|售前/.test(t)) return "销售类";
    if (/行政|文具|电脑|工位|办公/.test(t)) return "办公类";
    var categories = ["生产类", "办公类", "销售类"];
    var idx = ledgerHashSeed(seedKey || t || "default") % categories.length;
    return categories[idx];
  }

  function materialCategoryDescMap() {
    return {
      生产类: "用于生产制造、设备运维、核心备件等物资。",
      办公类: "用于行政办公、后勤保障、通用办公耗材等物资。",
      销售类: "用于销售交付、客户展示、售前支持等物资。"
    };
  }

  var m10CategoryFloatingTipEl = null;
  var m10CategoryTipAnchor = null;
  var m10CategoryTipHideTimer = null;

  function getM10CategoryFloatingTip() {
    if (m10CategoryFloatingTipEl) return m10CategoryFloatingTipEl;
    m10CategoryFloatingTipEl = document.createElement("div");
    m10CategoryFloatingTipEl.id = "m10CategoryFloatingTip";
    m10CategoryFloatingTipEl.className = "m10-category-floating-tip";
    m10CategoryFloatingTipEl.setAttribute("role", "tooltip");
    document.body.appendChild(m10CategoryFloatingTipEl);
    return m10CategoryFloatingTipEl;
  }

  function hideM10CategoryFloatingTip() {
    if (m10CategoryFloatingTipEl) m10CategoryFloatingTipEl.style.display = "none";
  }

  function htmlMaterialCategoryTipBody(categoryDisplay) {
    var map = materialCategoryDescMap();
    var desc = map[categoryDisplay] || "用于库存管理分类的标准物资类别。";
    return (
      '<div class="m10-category-floating-tip__title">物资类别说明</div>' +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">当前类别</span>' +
      escHtml(categoryDisplay) +
      "</div>" +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">类别说明</span>' +
      escHtml(desc) +
      "</div>" +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">可选范围</span>生产类 / 办公类 / 销售类</div>'
    );
  }

  function htmlMaterialCategoryTipHeaderBody() {
    var map = materialCategoryDescMap();
    return (
      '<div class="m10-category-floating-tip__title">物资类别说明</div>' +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">生产类</span>' +
      escHtml(map["生产类"]) +
      "</div>" +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">办公类</span>' +
      escHtml(map["办公类"]) +
      "</div>" +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">销售类</span>' +
      escHtml(map["销售类"]) +
      "</div>" +
      '<div class="m10-category-floating-tip__row"><span class="m10-category-floating-tip__k">可选范围</span>生产类 / 办公类 / 销售类</div>'
    );
  }

  function positionM10CategoryTip(anchor, tip) {
    var r = anchor.getBoundingClientRect();
    var pad = 8;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var top = r.bottom + pad;
    var left = r.left;
    if (top + th > vh - 12) {
      top = Math.max(12, r.top - th - pad);
    }
    left = Math.max(12, Math.min(left, vw - tw - 12));
    tip.style.top = top + "px";
    tip.style.left = left + "px";
  }

  function showM10CategoryFloatingTip(anchor) {
    if (!anchor) return;
    var tip = getM10CategoryFloatingTip();
    var scope = anchor.getAttribute("data-m10-category-scope");
    if (scope === "header") {
      tip.innerHTML = htmlMaterialCategoryTipHeaderBody();
    } else {
      var cat = normalizeMaterialCategory(anchor.getAttribute("data-category") || "", "default");
      tip.innerHTML = htmlMaterialCategoryTipBody(cat);
    }
    tip.style.display = "block";
    requestAnimationFrame(function () {
      positionM10CategoryTip(anchor, tip);
    });
  }

  function bindM10CategoryHoverTips() {
    if (bindM10CategoryHoverTips._done) return;
    bindM10CategoryHoverTips._done = true;

    document.body.addEventListener(
      "mouseover",
      function (e) {
        var btn = e.target && e.target.closest && e.target.closest(".m10-category-help-trigger");
        if (!btn) return;
        if (btn === m10CategoryTipAnchor) return;
        m10CategoryTipAnchor = btn;
        clearTimeout(m10CategoryTipHideTimer);
        showM10CategoryFloatingTip(btn);
      },
      true
    );
    document.body.addEventListener(
      "mouseout",
      function (e) {
        var btn = e.target && e.target.closest && e.target.closest(".m10-category-help-trigger");
        if (!btn || btn !== m10CategoryTipAnchor) return;
        var rel = e.relatedTarget;
        if (rel && btn.contains(rel)) return;
        m10CategoryTipAnchor = null;
        m10CategoryTipHideTimer = setTimeout(function () {
          hideM10CategoryFloatingTip();
        }, 60);
      },
      true
    );
    function onScrollOrResize() {
      hideM10CategoryFloatingTip();
      m10CategoryTipAnchor = null;
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
  }

  /** 演示：按汇总维度生成采购部门与单价/总价（采购数量取合同侧上限 maxDue） */
  function demoLedgerPurchaseMeta(seedKey, purchaseQty) {
    var h = ledgerHashSeed(seedKey);
    var depts = ["经营发展中心", "电控所", "供应链管理部", "运维中心"];
    var purchaseDept = depts[h % depts.length];
    var unitExcl = 12000 + (h % 18000);
    var rate = 1.13;
    var unitIncl = Math.round(unitExcl * rate * 100) / 100;
    var pq = Math.max(0, Number(purchaseQty) || 0);
    var totalExcl = unitExcl * pq;
    var totalIncl = Math.round(unitIncl * pq * 100) / 100;
    function fmt(n) {
      return Number(n).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return {
      purchaseDept: purchaseDept,
      unitExcl: fmt(unitExcl),
      unitIncl: fmt(unitIncl),
      totalExcl: fmt(totalExcl),
      totalIncl: fmt(totalIncl)
    };
  }

  function refreshM10LedgerFromInbound() {
    var tbIn = document.querySelector(M10_INBOUND_TBODY_SEL);
    var tbOut = document.getElementById("proc-m10-ledger-tbody");
    if (!tbIn || !tbOut) return;
    var groups = {};
    Array.prototype.forEach.call(tbIn.querySelectorAll("tr"), function (tr) {
      function cell(i) {
        var td = tr.children[i];
        return td ? cleanText(td.textContent || "") : "";
      }
      var mergedMain = cell(M10_INBOUND_COL.contractNo);
      var executionZx = cell(M10_INBOUND_COL.executionNo);
      var supplier = cell(M10_INBOUND_COL.supplier);
      var name =
        m10InboundTrAttr(tr, "data-m10-primary-name", "") ||
        String(cell(M10_INBOUND_COL.productName))
          .split(/[.．·]/)[0]
          .trim() ||
        cell(M10_INBOUND_COL.productName);
      var spec = m10InboundTrAttr(tr, "data-m10-spec", "");
      if (!mergedMain && !name) return;
      var key = [mergedMain, executionZx, supplier, name, spec].join("\u0001");
      var st = cell(M10_INBOUND_STATUS_TD);
      var shipQty = Number(m10InboundTrAttr(tr, "data-m10-ship-qty", "0")) || 0;
      var recvQty = Number(m10InboundTrAttr(tr, "data-m10-recv-qty", "0")) || 0;
      var inboundType = cell(M10_INBOUND_COL.inboundType);
      var timeIn = cell(M10_INBOUND_COL.inboundTime);
      var wh = m10InboundTrAttr(tr, "data-m10-warehouse", "");
      var keeper = m10InboundTrAttr(tr, "data-m10-keeper", "");
      var receiver = m10InboundTrAttr(tr, "data-m10-receiver", "");
      var inboundBy = cell(M10_INBOUND_COL.inboundBy);
      var mtype = normalizeMaterialCategory(m10InboundTrAttr(tr, "data-m10-mat-type", ""), key);
      var rk = cell(M10_INBOUND_COL.acceptNo);
      if (!groups[key]) {
        groups[key] = {
          mergedMain: mergedMain,
          executionZx: executionZx,
          supplier: supplier,
          name: name,
          spec: spec,
          maxDue: 0,
          sumDue: 0,
          posted: 0,
          pending: 0,
          lastPosted: "",
          warehouse: "",
          matType: "",
          postedOrderNos: [],
          lastReceiver: "",
          lastInboundPerson: "",
          inboundType: ""
        };
      }
      var g = groups[key];
      g.sumDue += shipQty;
      if (shipQty > g.maxDue) g.maxDue = shipQty;
      if (st.indexOf("已入库") >= 0) {
        g.posted += recvQty || shipQty;
        if (rk && g.postedOrderNos.indexOf(rk) < 0) g.postedOrderNos.push(rk);
        if (timeIn && timeIn >= g.lastPosted) {
          g.lastPosted = timeIn;
          g.warehouse = wh || g.warehouse;
          g.lastReceiver = receiver || keeper || g.lastReceiver;
          g.lastInboundPerson = inboundBy || g.lastInboundPerson;
          g.inboundType = inboundType || g.inboundType;
        }
      } else {
        g.pending += Math.max(shipQty - recvQty, 0);
      }
      if (!g.inboundType && inboundType) g.inboundType = inboundType;
      if (mtype) g.matType = mtype;
    });
    var keys = Object.keys(groups).sort(function (a, b) {
      var ga = groups[a];
      var gb = groups[b];
      var c = String(ga.mergedMain).localeCompare(String(gb.mergedMain), "zh");
      if (c !== 0) return c;
      return String(ga.executionZx).localeCompare(String(gb.executionZx), "zh");
    });
    var html = keys
      .map(function (k) {
        var g = groups[k];
        var purchaseQty = g.maxDue || 0;
        var stockQty = String(g.posted);
        var meta = demoLedgerPurchaseMeta(k, purchaseQty);
        var typeCode = materialTypeCodeFromType(g.matType || "生产类", g.name);
        var inboundTime = g.lastPosted || "";
        var handler = g.lastInboundPerson || g.lastReceiver || "";
        var wh = g.warehouse || "";
        return (
          '<tr class="m10-ledger-row"' +
          ' data-m10-supplier="' +
          escHtml(g.supplier) +
          '"' +
          ' data-m10-dept="' +
          escHtml(meta.purchaseDept) +
          '"' +
          ' data-m10-unit-incl="' +
          escHtml(meta.unitIncl) +
          '"' +
          ' data-m10-inbound-time="' +
          escHtml(inboundTime) +
          '"' +
          ' data-m10-handler="' +
          escHtml(handler) +
          '"' +
          ' data-m10-warehouse="' +
          escHtml(wh) +
          '"' +
          ">" +
          "<td>" +
          escHtml(typeCode) +
          "</td><td>" +
          escHtml(g.name) +
          "</td><td>" +
          renderMaterialCategoryWithHelp(g.matType || "生产类") +
          "</td><td>" +
          escHtml(meta.unitIncl) +
          "</td><td>" +
          escHtml(meta.totalIncl) +
          "</td><td>" +
          stockQty +
          "</td><td>" +
          (purchaseQty ? String(purchaseQty) : "—") +
          "</td><td></td>" +
          ledgerLedgerOpsCellHtml(g.posted, g.pending) +
          "</tr>"
        );
      })
      .join("");
    tbOut.innerHTML =
      html ||
      '<tr><td colspan="10" style="text-align:center;color:#8c8c8c;padding:20px">暂无数据</td></tr>';
  }

  function syncM10InboundListToStorage() {
    var tb = document.querySelector(M10_INBOUND_TBODY_SEL);
    if (!tb) return;
    var out = [];
    Array.prototype.forEach.call(tb.querySelectorAll("tr"), function (tr) {
      if (rowM10InboundStatus(tr) !== "已入库") return;
      function cell(i) {
        var td = tr.children[i];
        return td ? cleanText(td.textContent || "") : "";
      }
      out.push({
        acceptNo: cell(M10_INBOUND_COL.acceptNo),
        contractNo: cell(M10_INBOUND_COL.contractNo),
        executionNo: cell(M10_INBOUND_COL.executionNo),
        supplier: cell(M10_INBOUND_COL.supplier),
        name:
          m10InboundTrAttr(tr, "data-m10-primary-name", "") ||
          String(cell(M10_INBOUND_COL.productName))
            .split(/[.．·]/)[0]
            .trim() ||
          cell(M10_INBOUND_COL.productName),
        spec: m10InboundTrAttr(tr, "data-m10-spec", ""),
        qty: m10InboundTrAttr(tr, "data-m10-recv-qty", "") || m10InboundTrAttr(tr, "data-m10-ship-qty", ""),
        warehouse: m10InboundTrAttr(tr, "data-m10-warehouse", ""),
        materialType: m10InboundTrAttr(tr, "data-m10-mat-type", "")
      });
    });
    try {
      localStorage.setItem("map_m10_inbound_list_v1", JSON.stringify(out));
    } catch (e) {}
  }

  function renderM10Ops() {
    var tb = document.querySelector(M10_INBOUND_TBODY_SEL);
    if (!tb) return;
    Array.prototype.forEach.call(tb.querySelectorAll("tr"), function (tr) {
      var wrap = tr.querySelector("[data-m10-op]");
      if (!wrap) return;
      var st = rowM10InboundStatus(tr);
      var statusCell = tr.children[M10_INBOUND_STATUS_TD];
      if (statusCell) {
        var cls = st === "已验收" ? "tag-done" : "tag-pending";
        statusCell.innerHTML = '<span class="tag-soft ' + cls + '">' + st + "</span>";
      }
      if (tr.getAttribute("data-m10-flow-return") === "1") {
        wrap.innerHTML =
          '<a href="#" class="js-op" data-op="验收查看详情">查看</a>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<a href="#" class="js-op" data-op="库存管理编辑">编辑</a>';
      } else {
        wrap.innerHTML = '<a href="#" class="js-op" data-op="验收查看详情">查看</a>';
      }
    });
    syncM10InboundListToStorage();
    refreshM10LedgerFromInbound();
  }

  function bindM10SubTabs() {
    var sec = document.getElementById("proc-m10");
    if (!sec) return;
    sec.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-m10-sub-tab]");
      if (!btn) return;
      var key = btn.getAttribute("data-m10-sub-tab");
      if (!key) return;
      sec.querySelectorAll("[data-m10-sub-tab]").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      sec.querySelectorAll("[data-m10-sub-pane]").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-m10-sub-pane") === key);
      });
    });
  }

  var OP = {
    新增计划: function () {
      openProcModal("新增采购计划", htmlPlanForm(false), footTriple(false));
      bindFootActions();
    },
    计划编辑: function () {
      openProcModal("编辑采购计划", htmlPlanForm(true), footTriple(false));
      bindFootActions();
    },
    计划查看详情: function () {
      openProcModal(
        "计划详情",
        '<div class="field-row"><label>计划编号</label><span>CGJH-2026-001</span></div>' +
          '<div class="field-row"><label>计划名称</label><span>年度备件采购计划</span></div>' +
          '<div class="field-row"><label>计划年度</label><span>2026</span></div>' +
          '<div class="field-row"><label>编制部门</label><span>经营发展中心</span></div>' +
          '<div class="field-row"><label>编制人</label><span>张三</span></div>' +
          '<div class="field-row"><label>总金额</label><span>5,200,000 元</span></div>' +
          '<div class="field-row"><label>审批状态</label><span><span class="tag-soft tag-pending">审批中</span></span></div>' +
          "<p style=\"margin-top:12px\"><strong>物资明细</strong></p>" +
          miniTablePlanLines().replace(
            /<a href[^>]+>删除<\/a>/,
            '<span style="color:#999">—</span>'
          ),
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    计划删除: function () {
      openProcModal(
        "删除确认",
        '<p>是否确认删除该采购计划？删除后不可恢复（演示）。</p>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procDelOk">确定</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procDelOk").addEventListener("click", function () {
        toast("已删除（演示）");
        closeProcModal();
      });
    },
    计划提交审批: function () {
      openProcModal(
        "提交审批",
        '<p>确认将该采购计划提交审批？提交后将进入审批流（演示）。</p>' +
          '<div class="field-row"><label>提交说明</label><textarea id="procPlanSubmitRemark" rows="3" placeholder="可填写补充说明"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPlanSubmitOk">确认提交</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPlanSubmitOk").addEventListener("click", function () {
      toast("已提交审批（演示）");
        closeProcModal();
      });
    },
    计划撤回: function () {
      openProcModal(
        "撤回确认",
        '<p>确认撤回该采购计划？撤回后状态将回到草稿（演示）。</p>' +
          '<div class="field-row"><label>撤回原因</label><textarea id="procPlanWithdrawReason" rows="3" placeholder="请输入撤回原因"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPlanWithdrawOk">确认撤回</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPlanWithdrawOk").addEventListener("click", function () {
      toast("已撤回（演示）");
        closeProcModal();
      });
    },
    查询计划: function () {
      toast("已按条件查询（演示）");
    },
    新增申请: function () {
      openProcModal("新增采购申请", htmlApplyForm(false), footTriple(false));
      bindFootActions();
    },
    申请编辑: function (el) {
      var rowData = getApplyRowData(el);
      openProcModal("修改采购申请", htmlApplyForm(true, rowData), footTriple(false));
      bindFootActions();
    },
    申请删除: function () {
      openProcModal(
        "删除确认",
        '<p>确认删除该采购申请吗？删除后不可恢复（演示）。</p>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procApplyDeleteOk">确定删除</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procApplyDeleteOk").addEventListener("click", function () {
        toast("已删除采购申请（演示）");
        closeProcModal();
      });
    },
    申请查看详情: function () {
      openProcModal(
        "申请详情",
        '<div class="field-row"><label>申请单号</label><span>PA20260321001</span></div>' +
          '<div class="field-row"><label>项目名称</label><span>检修保障采购</span></div>' +
          '<div class="field-row"><label>需求日期</label><span>2026-04-10</span></div>' +
          '<div class="field-row"><label>申请部门</label><span>供应链管理部</span></div>' +
          '<div class="field-row"><label>申请人</label><span>张明</span></div>' +
          '<div class="field-row"><label>申请时间</label><span>2026-03-15 10:20</span></div>' +
          '<div class="field-row"><label>紧急程度</label><span>普通</span></div>' +
          '<div class="field-row"><label>是否关联年度计划</label><span>是</span></div>' +
          '<div class="field-row"><label>审批状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>' +
          '<div class="field-row"><label>当前审批节点</label><span>部门主管审核</span></div>' +
          '<div class="field-row"><label>备注</label><span>备件更换</span></div>' +
          "<p style=\"margin-top:12px\"><strong>物资明细</strong></p>" +
          miniTableApplyLines().replace(
            /<a href[^>]+>删除<\/a>/,
            '<span style="color:#999">—</span>'
          ).replace(
            /<p style="margin:8px 0 0"><button[^>]*>添加物资<\/button><\/p>/,
            ""
          ),
        null
      );
      setProcModalFlowVisible(true);
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    申请撤回: function () {
      openProcModal(
        "撤回确认",
        '<p>确认撤回该采购申请？撤回后将回到草稿状态（演示）。</p>' +
          '<div class="field-row"><label>撤回原因</label><textarea id="procApplyWithdrawReason" rows="3" placeholder="请输入撤回原因"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procApplyWithdrawOk">确认撤回</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procApplyWithdrawOk").addEventListener("click", function () {
      toast("已撤回（演示）");
        closeProcModal();
      });
    },
    申请提交审批: function () {
      openProcModal(
        "审批办理",
        '<div class="field-row"><label>审批结论</label><select id="procApplyApproveResult"><option value="pass">同意</option><option value="reject">驳回</option></select></div>' +
          '<div class="field-row"><label>审批意见</label><textarea id="procApplyApproveOpinion" rows="3" placeholder="请输入审批意见"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procApplyApproveOk">确认提交</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procApplyApproveOk").addEventListener("click", function () {
        var op = $("procApplyApproveOpinion");
        if (op && !String(op.value || "").trim()) {
          toast("请填写审批意见");
          return;
        }
        var resultEl = $("procApplyApproveResult");
        var result = resultEl ? resultEl.value : "pass";
        toast(result === "pass" ? "审批通过（演示）" : "已驳回（演示）");
        closeProcModal();
      });
    },
    查询申请: function () {
      toast("已按条件查询（演示）");
    },
    查询采购订单: function () {
      toast("已按条件查询（演示）");
    },
    生成订单: function () {
      OP["新增订单"]();
    },
    新增订单: function () {
      openProcModal(
        "新增订单（设备清单全屏选择）",
        htmlOrderDevicePicker(),
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procCreateOrder">确认生成订单</button>'
      );
      var box = $("procModalMask").querySelector(".proc-modal-box");
      if (box) box.classList.add("fullscreen");
      bindFootActions(function () {
        var body = $("procModalBody");
        bindOrderSalesContractRelation(body);
        if (body) {
          body.addEventListener("change", function (ev) {
            if (!(ev.target && ev.target.classList && ev.target.classList.contains("proc-order-pick"))) return;
            var c = body.querySelectorAll(".proc-order-pick:checked").length;
            var tip = $("orderPickTip");
            if (tip) tip.textContent = "已勾选 " + c + " 项设备";
          });
        }
        var ok = $("procCreateOrder");
        if (ok) {
          ok.addEventListener("click", function () {
            var c = document.querySelectorAll(".proc-order-pick:checked").length;
            if (!c) {
              toast("请至少勾选一项设备");
              return;
            }
            var company = body.querySelector("#ordCompany") ? body.querySelector("#ordCompany").value : "河南能源";
            var site = body.querySelector("#ordSite") ? body.querySelector("#ordSite").value : "新安风电场";
            var dept = body.querySelector("#ordBizDept") ? body.querySelector("#ordBizDept").value : "经营发展中心";
            var confirmer = body.querySelector("#ordConfirmer") ? body.querySelector("#ordConfirmer").value : "张敏（经营发展中心）";
            var applicant = body.querySelector("#ordApplicant") ? body.querySelector("#ordApplicant").value : "当前用户";
            var applyDate = body.querySelector("#ordDate") ? body.querySelector("#ordDate").value : "2026-04-15";
            var logisticsNo = body.querySelector("#ordLogisticsNo") ? body.querySelector("#ordLogisticsNo").value : ("WL" + nowYmdCompact());
            var salesContractNo = body.querySelector("#ordSalesContractNo") ? body.querySelector("#ordSalesContractNo").value : "";
            var picked = Array.prototype.slice.call(body.querySelectorAll(".proc-order-pick:checked")).map(function (x) {
              var tr = x.closest("tr");
              if (!tr) return "";
              var nameCell = tr.querySelector('[data-col="name"]');
              var specCell = tr.querySelector('[data-col="spec"]');
              var qtyCell = tr.querySelector('[data-col="qty"]');
              var name = nameCell ? cleanText(nameCell.textContent) : "";
              var spec = specCell ? cleanText(specCell.textContent) : "";
              var qty = qtyCell ? cleanText(qtyCell.textContent) : "";
              return name ? (name + (spec ? ("(" + spec + ")") : "") + (qty ? (" x" + qty) : "")) : "";
            }).filter(Boolean);
            var summary = picked.length > 1 ? (picked[0] + " 等" + picked.length + "项") : (picked[0] || ("设备清单共" + c + "项"));
            var newNo = buildNextOrderNo();
            var tbody = document.querySelector("#proc-m3 tbody");
            if (tbody) {
              var tr = document.createElement("tr");
              tr.setAttribute("data-order-row", newNo);
              tr.innerHTML =
                "<td>" + applicant + "</td>" +
                '<td data-order-dept>' + dept + "</td>" +
                "<td>" + company + "</td>" +
                "<td>" + applyDate + "</td>" +
                "<td>" + site + "</td>" +
                "<td>" + summary + "</td>" +
                '<td data-order-status><span class="tag-soft tag-pending">待确认</span></td>' +
                "<td>" + confirmer + "</td>" +
                '<td data-order-logistics-no>' + logisticsNo + "</td>" +
                '<td data-order-sales-no>' + salesContractNo + "</td>" +
                '<td class="proc-ops-cell" data-order-op><a href="#" class="js-op" data-op="订单查看详情" data-order="' + newNo + '">查看</a></td>';
              tbody.insertBefore(tr, tbody.firstChild);
            }
            toast("已生成订单并回填设备清单，可继续推送确认（演示）");
            closeProcModal();
          });
        }
      });
    },
    订单编辑: function (el) {
      var rowData = getOrderRowData(el) || {};
      openProcModal(
        "编辑订单",
        htmlOrderDevicePicker({
          applicant: rowData.applicant,
          dept: rowData.dept,
          company: rowData.company,
          site: rowData.site,
          applyDate: rowData.applyDate,
          confirmer: rowData.confirmer,
          logisticsNo: rowData.logisticsNo,
          salesContractNo: rowData.salesContractNo
        }),
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procSaveOrderEdit">保存</button>'
      );
      var box = $("procModalMask").querySelector(".proc-modal-box");
      if (box) box.classList.add("fullscreen");
      bindFootActions(function () {
        var body = $("procModalBody");
        bindOrderSalesContractRelation(body);
        var ok = $("procSaveOrderEdit");
        if (!ok || !body) return;
        ok.addEventListener("click", function () {
          var tr = el && el.closest ? el.closest("tr") : null;
          if (!tr) return closeProcModal();
          var company = body.querySelector("#ordCompany") ? body.querySelector("#ordCompany").value : rowData.company || "河南能源";
          var site = body.querySelector("#ordSite") ? body.querySelector("#ordSite").value : rowData.site || "新安风电场";
          var dept = body.querySelector("#ordBizDept") ? body.querySelector("#ordBizDept").value : rowData.dept || "经营发展中心";
          var confirmer = body.querySelector("#ordConfirmer") ? body.querySelector("#ordConfirmer").value : rowData.confirmer || "张敏（经营发展中心）";
          var applyDate = body.querySelector("#ordDate") ? body.querySelector("#ordDate").value : rowData.applyDate || "2026-04-15";
          var logisticsNo = body.querySelector("#ordLogisticsNo") ? body.querySelector("#ordLogisticsNo").value : (rowData.logisticsNo || "");
          var salesContractNo = body.querySelector("#ordSalesContractNo") ? body.querySelector("#ordSalesContractNo").value : (rowData.salesContractNo || "");
          var c = body.querySelectorAll(".proc-order-pick:checked").length;
          var summary = rowData.summary || ("设备清单共" + c + "项");
          var tds = tr.querySelectorAll("td");
          if (tds[1]) tds[1].textContent = dept;
          if (tds[2]) tds[2].textContent = company;
          if (tds[3]) tds[3].textContent = applyDate;
          if (tds[4]) tds[4].textContent = site;
          if (tds[5]) tds[5].textContent = summary;
          if (tds[7]) tds[7].textContent = confirmer;
          if (tds[8]) tds[8].textContent = logisticsNo;
          if (tds[9]) tds[9].textContent = salesContractNo;
          toast("订单已保存（演示）");
          closeProcModal();
        });
      });
    },
    订单删除: function (el) {
      openProcModal(
        "删除确认",
        '<p>是否确认删除该订单？</p>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procDeleteOrderOk">确认删除</button>'
      );
      bindFootActions(function () {
        var ok = $("procDeleteOrderOk");
        if (!ok) return;
        ok.addEventListener("click", function () {
          var tr = el && el.closest ? el.closest("tr") : null;
          if (tr && tr.parentNode) tr.parentNode.removeChild(tr);
          toast("订单已删除（演示）");
          closeProcModal();
        });
      });
    },
    订单查看物流: function () {
      openProcModal(
        "物流轨迹",
        '<div style="font-size:13px;line-height:1.8;color:#1f2d3d">' +
          "<div>2026-04-20 08:10 已出库</div>" +
          "<div>2026-04-20 14:35 运输中（豫A-9K281）</div>" +
          "<div>2026-04-21 09:12 已签收（项目公司库房）</div>" +
        "</div>",
        '<button type="button" class="proc-btn" id="procModalClose">取消</button>'
      );
      var closeBtn = $("procModalClose");
      if (closeBtn) closeBtn.addEventListener("click", closeProcModal, { once: true });
    },
    订单查看详情: function (el) {
      var rowData = getOrderRowData(el) || {};
      var tr = el && el.closest ? el.closest("tr") : null;
      openProcModal(
        "订单详情",
        htmlOrderDevicePicker({
          applicant: rowData.applicant,
          dept: rowData.dept,
          company: rowData.company,
          site: rowData.site,
          applyDate: rowData.applyDate,
          confirmer: rowData.confirmer,
          logisticsNo: rowData.logisticsNo,
          salesContractNo: rowData.salesContractNo,
          readonly: true
        }),
        '<button type="button" class="proc-btn" id="procModalClose">取消</button>'
      );
      var box = $("procModalMask").querySelector(".proc-modal-box");
      if (box) box.classList.add("fullscreen");
      var role = "";
      var roleSel = document.getElementById("m3Role");
      if (roleSel) role = String(roleSel.value || "");
      if (role === "biz") {
        setHeadActions([
          { label: "流程进度", onClick: openUnifiedProgress },
          { label: "审批", onClick: function () { openOrderApproveHandleModal(rowData, tr); } }
        ]);
      } else {
        setProcModalFlowVisible(true);
      }
      var closeBtn = $("procModalClose");
      if (closeBtn) closeBtn.addEventListener("click", closeProcModal, { once: true });
    },
    订单确认: function (el) {
      var orderNo = (el && el.getAttribute("data-order")) || "ORD2026001";
      var defaultConfirmer = (el && el.getAttribute("data-confirmer")) || "张敏（经营发展中心）";
      openProcModal(
        "订单确认推送",
        '<div class="field-row"><label>订单编号</label><span>' + orderNo + "</span></div>" +
          '<div class="field-row"><label>确认人</label><select id="procOrderConfirmer"><option>' + defaultConfirmer + "</option><option>李哲（运维业务一部）</option><option>周宁（运维业务二部）</option></select></div>" +
          '<div class="field-row"><label>推送说明</label><textarea id="procOrderPushMsg" placeholder="请输入推送说明">请尽快确认订单需求并安排后续执行。</textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procConfirmOrderPush">确认并推送</button>'
      );
      var cancel = $("procModalCancel");
      if (cancel) cancel.addEventListener("click", closeProcModal);
      var ok = $("procConfirmOrderPush");
      if (ok) {
        ok.addEventListener("click", function () {
          var conf = $("procOrderConfirmer") ? $("procOrderConfirmer").value : defaultConfirmer;
          markOrderConfirmed(orderNo, conf);
          toast("订单已推送并确认生效（演示）");
          closeProcModal();
        });
      }
    },
    查询寻源: function () {
      toast("已按条件查询（演示）");
    },
    新增寻源: function () {
      openProcModal(
        "新增寻源项目",
        '<div class="field-row"><label>项目名称 <span style="color:#cf1322">*</span></label><input type="text" placeholder="请输入项目名称" /></div>' +
          '<div class="field-row"><label>寻源方式</label><select><option>询价</option><option>招标</option></select></div>' +
          '<div class="field-row"><label>发布日期</label><input type="date" /></div>' +
          '<div class="field-row"><label>截止日期</label><input type="date" /></div>' +
          "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
          miniTableSourcingLines(),
        footDoubleSave()
      );
      bindFootActions();
    },
    寻源查看详情: function () {
      openProcModal(
        "寻源详情",
        '<div class="field-row"><label>寻源编号</label><span>XY-2026-011</span></div>' +
          '<div class="field-row"><label>项目名称</label><span>齿轮箱采购寻源</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-blue">进行中</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    寻源编辑: function () {
      OP["新增寻源"]();
      titleEl.textContent = "编辑寻源项目";
    },
    寻源发布询价: function () {
      openProcModal(
        "发布询价单",
        '<div class="field-row"><label>选择供应商</label><span><label><input type="checkbox" checked /> 远景能源</label>　<label><input type="checkbox" checked /> 联程供应链</label>　<label><input type="checkbox" /> 华通物流</label></span></div>' +
          '<div class="field-row"><label>询价说明</label><textarea placeholder="说明技术要求、交货期等"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procSendRf">发送</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procSendRf").addEventListener("click", function () {
        toast("询价单已发送（演示）");
        closeProcModal();
      });
    },
    寻源查看报价: function () {
      openProcModal(
        "供应商报价",
        '<table class="proc-mini-table"><thead><tr><th>供应商名称</th><th>报价金额</th><th>报价日期</th><th>报价附件</th></tr></thead><tbody>' +
          '<tr><td>远景能源</td><td>428,000 元</td><td>2026-03-18</td><td><a href="#">报价单.pdf</a></td></tr>' +
          '<tr><td>联程供应链</td><td>415,000 元</td><td>2026-03-19</td><td><a href="#">报价单.xlsx</a></td></tr>' +
          "</tbody></table>" +
          '<p style="margin-top:12px"><button type="button" class="proc-btn proc-btn-primary" id="procCompare">比价</button></p>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
      $("procCompare").addEventListener("click", function () {
        toast("已进入比价视图（演示）");
      });
    },
    寻源比价决标: function () {
      openProcModal(
        "比价决标",
        '<div class="field-row"><label>中标供应商</label><select><option>联程供应链</option><option>远景能源</option></select></div>' +
          '<div class="field-row"><label>中标理由</label><textarea placeholder="综合价格、交期、质量评价"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procAward">确认决标</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procAward").addEventListener("click", function () {
        toast("决标已确认（演示）");
        closeProcModal();
      });
    },
    查询供应商: function () {
      toast("已按条件查询（演示）");
    },
    新增供应商: function () {
      openProcModal(
        "新增供应商",
        '<div class="field-row"><label>供应商名称 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>统一社会信用代码 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>法定代表人</label><input type="text" /></div>' +
          '<div class="field-row"><label>注册资本</label><input type="text" /></div>' +
          '<div class="field-row"><label>注册地址</label><input type="text" /></div>' +
          '<div class="field-row"><label>联系人 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>联系电话 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>经营范围</label><textarea></textarea></div>' +
          '<div class="field-row"><label>资质文件</label><input type="file" multiple /></div>' +
          '<div class="field-row"><label>备注</label><textarea></textarea></div>' +
          '<div class="field-row"><label>合作状态</label><select><option>合作中</option><option>已终止</option></select></div>',
        footDoubleSave()
      );
      bindFootActions();
    },
    供应商查看详情: function () {
      openProcModal(
        "供应商详情",
        '<p><strong>基本信息</strong></p>' +
          '<div class="field-row"><label>供应商编码</label><span>GYS001</span></div>' +
          '<div class="field-row"><label>供应商名称</label><span>华通物流有限公司</span></div>' +
          '<div class="field-row"><label>统一社会信用代码</label><span>91310110MA1G8T9X2P</span></div>' +
          '<div class="field-row"><label>联系人</label><span>刘倩</span></div>' +
          "<p style=\"margin:14px 0 8px\"><strong>资质文件</strong></p><ul style=\"margin:0;padding-left:18px\"><li><a href=\"#\">营业执照.pdf</a></li><li><a href=\"#\">道路运输许可.pdf</a></li></ul>" +
          "<p style=\"margin:14px 0 8px\"><strong>合作历史订单</strong></p>" +
          '<table class="proc-mini-table"><thead><tr><th>订单号</th><th>金额（元）</th><th>日期</th></tr></thead><tbody>' +
          "<tr><td>PO-2025-088</td><td>320,000</td><td>2025-11-02</td></tr></tbody></table>" +
          "<p style=\"margin:14px 0 8px\"><strong>绩效评价记录</strong></p>" +
          '<table class="proc-mini-table"><thead><tr><th>评价周期</th><th>得分</th><th>等级</th></tr></thead><tbody>' +
          "<tr><td>2025 Q4</td><td>92</td><td>A</td></tr></tbody></table>",
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    供应商编辑: function () {
      OP["新增供应商"]();
      titleEl.textContent = "编辑供应商";
    },
    供应商禁用: function () {
      toast("已禁用供应商（演示）");
    },
    供应商启用: function () {
      toast("已启用供应商（演示）");
    },
    查询合同: function () {
      toast("已按条件查询（演示）");
    },
    新增合同: function () {
      openProcModal(
        "新增合同",
        '<div class="field-row"><label>合同编号</label><input type="text" placeholder="可留空自动生成" /></div>' +
          '<div class="field-row"><label>合同名称 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>供应商 <span style="color:#cf1322">*</span></label><select><option>宏达物资有限公司</option><option>远景能源</option><option>华通物流有限公司</option><option>联程供应链</option></select></div>' +
          '<div class="field-row"><label>关联采购订单</label><select><option value="">无</option><option>CG-2026-001</option><option>PO-2026-0099</option></select></div>' +
          '<div class="field-row"><label>合同金额 <span style="color:#cf1322">*</span></label><input type="number" placeholder="元" /></div>' +
          '<div class="field-row"><label>签订日期 <span style="color:#cf1322">*</span></label><input type="date" /></div>' +
          '<div class="field-row"><label>生效日期 <span style="color:#cf1322">*</span></label><input type="date" /></div>' +
          '<div class="field-row"><label>失效日期 <span style="color:#cf1322">*</span></label><input type="date" /></div>' +
          '<div class="field-row"><label>合同附件</label><input type="file" multiple /></div>' +
          '<div class="field-row"><label>主要条款</label><textarea></textarea></div>',
        footDoubleSave()
      );
      bindFootActions();
    },
    合同查看详情: function () {
      openProcModal(
        "合同详情",
        '<div class="field-row"><label>合同编号</label><span>HT-2025-001</span></div>' +
          '<div class="field-row"><label>合同名称</label><span>办公用品年度框架协议</span></div>' +
          '<div class="field-row"><label>供应商</label><span>宏达物资有限公司</span></div>' +
          '<div class="field-row"><label>签订日期</label><span>2025-01-08</span></div>' +
          '<div class="field-row"><label>生效日期</label><span>2025-01-10</span></div>' +
          '<div class="field-row"><label>失效日期</label><span>2025-12-31</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-reject">已过期</span></span></div>' +
          '<div class="field-row"><label>合同金额</label><span>125,000 元</span></div>' +
          "<p style=\"margin:12px 0 8px\"><strong>主要条款</strong></p><p style=\"line-height:1.6;margin:0\">办公用品年度集中采购，价格与供货周期按协议执行。</p>" +
          "<p style=\"margin:12px 0 8px\"><strong>附件</strong></p><ul style=\"margin:0;padding-left:18px\"><li><a href=\"#\">合同正文.pdf</a></li></ul>",
        '<button type="button" class="proc-btn" id="procModalClose">取消</button>'
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    合同编辑: function () {
      OP["新增合同"]();
      titleEl.textContent = "编辑合同";
    },
    合同删除: function () {
      openProcModal("删除确认", "<p>是否确认删除该合同？（演示）</p>", '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procDelOk">确定</button>');
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procDelOk").addEventListener("click", function () {
        toast("已删除（演示）");
        closeProcModal();
      });
    },
    合同下载附件: function () {
      toast("开始下载附件（演示）");
    },
    查询招标: function () {
      toast("已按条件查询（演示）");
    },
    新增招标项目: function () {
      openProcModal(
        "新增招标项目",
        '<div class="field-row"><label>项目名称 <span style="color:#cf1322">*</span></label><input type="text" /></div>' +
          '<div class="field-row"><label>招标方式</label><select><option>公开</option><option>邀请</option></select></div>' +
          '<div class="field-row"><label>预算金额 <span style="color:#cf1322">*</span></label><input type="number" placeholder="元" /></div>' +
          '<div class="field-row"><label>投标截止日期</label><input type="datetime-local" /></div>' +
          '<div class="field-row"><label>开标日期</label><input type="datetime-local" /></div>' +
          '<div class="field-row"><label>招标文件</label><input type="file" /></div>' +
          "<p style=\"margin:12px 0 4px;font-weight:600;color:#1f3551\">物资明细</p>" +
          miniTableBidLines(),
        footDoubleSave()
      );
      bindFootActions();
    },
    招标查看详情: function () {
      openProcModal(
        "招标项目详情",
        '<div class="field-row"><label>项目编号</label><span>ZB-2026-004</span></div>' +
          '<div class="field-row"><label>项目名称</label><span>风机主轴备件采购</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-blue">进行中</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    招标发布公告: function () {
      openProcModal(
        "发布公告",
        '<div class="field-row"><label>公告标题</label><input type="text" value="ZB-2026-004 公开招标公告" /></div>' +
          '<div class="field-row"><label>公告内容</label><textarea style="min-height:120px">（富文本）项目概况、投标人资格、文件获取方式…</textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPub">发布</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPub").addEventListener("click", function () {
        toast("公告已发布（演示）");
        closeProcModal();
      });
    },
    招标查看投标: function () {
      openProcModal(
        "投标列表",
        '<table class="proc-mini-table"><thead><tr><th>供应商名称</th><th>投标金额</th><th>投标日期</th><th>投标文件</th><th>操作</th></tr></thead><tbody>' +
          '<tr><td>远景能源</td><td>2,750,000</td><td>2026-03-26</td><td><a href="#">标书.zip</a></td><td><button type="button" class="proc-btn proc-btn-ghost">查看详情</button></td></tr>' +
          "</tbody></table>",
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    招标开标记录: function () {
      openProcModal(
        "开标记录",
        '<div class="field-row"><label>开标时间</label><span>2026-04-02 09:30</span></div>' +
          "<p><strong>投标情况汇总</strong></p><p style=\"line-height:1.6\">共 3 家有效投标，最低报价 2,720,000 元。</p>" +
          "<p><strong>中标候选人</strong></p><p>第一候选人：远景能源；第二候选人：联程供应链。</p>",
        '<button type="button" class="proc-btn" id="procModalClose">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procBidWin">确认中标</button>'
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
      $("procBidWin").addEventListener("click", function () {
        toast("中标已确认（演示）");
        closeProcModal();
      });
    },
    查询采购付款: function () {
      toast("已按条件查询（演示）");
    },
    新增付款申请: function () {
      openProcModal(
        "新增付款申请",
        '<div class="field-row"><label>采购订单</label><select><option>CG-2026-001（已完成收货）</option><option>PO-2026-0099（已完成收货）</option></select></div>' +
          '<div class="field-row"><label>供应商</label><input type="text" value="远景能源" readonly style="background:#f5f5f5" /></div>' +
          '<div class="field-row"><label>应付金额</label><input type="text" value="410,000" readonly style="background:#f5f5f5" /></div>' +
          '<div class="field-row"><label>实付金额</label><input type="number" value="410000" /></div>' +
          '<div class="field-row"><label>付款说明</label><textarea></textarea></div>' +
          '<div class="field-row"><label>发票</label><input type="file" /></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPaySubmit">提交审批</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPaySubmit").addEventListener("click", function () {
        toast("付款申请已提交审批（演示）");
        closeProcModal();
      });
    },
    付款查看详情: function () {
      openProcModal(
        "付款申请详情",
        '<div class="field-row"><label>付款申请号</label><span>FK-CG-2026-002</span></div>' +
          '<div class="field-row"><label>采购订单号</label><span>CG-2026-001</span></div>' +
          '<div class="field-row"><label>申请金额</label><span>410,000 元</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    付款审批: function () {
      openProcModal(
        "审批付款申请",
        '<div class="field-row"><label>付款申请号</label><span>FK-CG-2026-002</span></div>' +
          '<div class="field-row"><label>申请金额</label><span>410,000 元</span></div>' +
          '<div class="field-row"><label>审批意见</label><select id="procApprVer"><option value="pass">通过</option><option value="reject">驳回</option></select></div>' +
          '<div class="field-row"><label>驳回原因</label><textarea id="procRejectReason" placeholder="驳回时必填"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procApprOk">确认</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procApprOk").addEventListener("click", function () {
        var v = $("procApprVer").value;
        if (v === "reject" && !($("procRejectReason").value || "").trim()) {
          toast("请填写驳回原因");
          return;
        }
        toast(v === "pass" ? "审批通过（演示）" : "已驳回（演示）");
        closeProcModal();
      });
    },
    付款编辑: function () {
      OP["新增付款申请"]();
      titleEl.textContent = "编辑付款申请";
    },
    付款撤回: function () {
      toast("已撤回（演示）");
    },
    付款确认付款: function () {
      openProcModal(
        "确认付款",
        '<div class="field-row"><label>付款金额</label><input type="number" value="50000" /></div>' +
          '<div class="field-row"><label>付款日期</label><input type="date" /></div>' +
          '<div class="field-row"><label>付款凭证</label><input type="file" /></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procPayDone">确认付款</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procPayDone").addEventListener("click", function () {
        toast("付款已确认（演示）");
        closeProcModal();
      });
    },
    查询退换货: function () {
      toast("已按条件查询（演示）");
    },
    新增退货申请: function () {
      openProcModal(
        "新增退货申请",
        '<div class="field-row"><label>采购订单</label><select><option>PO-2026-0099</option></select></div>' +
          '<div class="field-row"><label>供应商</label><input type="text" value="联程供应链" readonly style="background:#f5f5f5" /></div>' +
          "<p style=\"margin:12px 0 4px\"><strong>物资明细</strong>（勾选退货行并填写数量）</p>" +
          '<table class="proc-mini-table"><thead><tr><th>物资</th><th>可退数量</th><th>退货数量</th></tr></thead><tbody>' +
          "<tr><td>齿轮箱配件</td><td>2</td><td><input type=\"number\" value=\"2\" style=\"width:80px\" /></td></tr></tbody></table>" +
          '<div class="field-row" style="margin-top:10px"><label>退货原因</label><textarea placeholder="质检不合格等"></textarea></div>' +
          '<div class="field-row"><label>附件</label><input type="file" /></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procRetSubmit">提交审批</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procRetSubmit").addEventListener("click", function () {
        toast("退货申请已提交（演示）");
        closeProcModal();
      });
    },
    退货查看详情: function () {
      openProcModal(
        "退货详情",
        '<div class="field-row"><label>退货单号</label><span>TH-2026-001</span></div>' +
          '<div class="field-row"><label>采购订单</label><span>PO-2026-0099</span></div>' +
          '<div class="field-row"><label>状态</label><span><span class="tag-soft tag-pending">待审批</span></span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    退货审批: function () {
      openProcModal(
        "审批退货申请",
        '<div class="field-row"><label>退货单号</label><span>TH-2026-001</span></div>' +
          '<div class="field-row"><label>审批意见</label><select id="procRetVer"><option value="pass">通过</option><option value="reject">驳回</option></select></div>' +
          '<div class="field-row"><label>驳回原因</label><textarea id="procRetReason"></textarea></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procRetOk">确认</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procRetOk").addEventListener("click", function () {
        if ($("procRetVer").value === "reject" && !($("procRetReason").value || "").trim()) {
          toast("请填写驳回原因");
          return;
        }
        toast("审批已处理（演示）");
        closeProcModal();
      });
    },
    退货撤回: function () {
      toast("已撤回（演示）");
    },
    新增: function () {
      openQaAcceptInitiateModal();
    },
    库存台账在途明细: function () {
      switchM10SubTab("inbound");
      toast("已切换到「入库记录」，可查看在途分批（演示）");
    },
    库存台账待入库处理: function () {
      switchM10SubTab("inbound");
      toast("已切换到「入库记录」，请办理待入库单据（演示）");
    },
    库存台账已结追溯: function () {
      switchM10SubTab("inbound");
      toast("已切换到「入库记录」查看分批入库明细（演示）");
    },
    库存管理导入: function () {
      toast("导入（演示）");
    },
    库存管理下载模版: function () {
      toast("下载模版（演示）");
    },
    库存管理导出: function () {
      toast("导出（演示）");
    },
    库存合同编号说明: function () {
      openProcModal(
        "合同编号说明",
        '<div class="field-row"><label>展示规则</label><span>库存台账的合同编号支持按行展开，查看关键采购信息（演示）。</span></div>' +
          '<div class="field-row"><label>展开内容</label><span>采购部门、供应商、规格型号；用于快速核对台账来源。</span></div>' +
          '<div class="field-row"><label>提示</label><span>点击合同编号右侧下拉箭头可展开/收起。</span></div>',
        null
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    库存物资类别说明: function () {
      /* 已改为「物资类别」列问号悬停黑底说明（m10-category-help-trigger），此处保留占位避免旧 data-op 报错 */
    },
    查询质量验收: function () {
      toast("已按条件查询（演示）");
    },
    库存管理编辑: function () {
      toast("编辑入库申请（演示）");
    },
    库存管理删除: function () {
      toast("已删除草稿（演示）");
    },
    库存管理提交: function (el) {
      var tr = el && el.closest ? el.closest("tr") : null;
      if (!tr || !tr.children[M10_INBOUND_STATUS_TD]) return;
      tr.children[M10_INBOUND_STATUS_TD].innerHTML = '<span class="tag-soft tag-pending">入库中</span>';
      toast("已提交，入库流程进行中（演示）");
      renderM10Ops();
    },
    库存管理办结: function (el) {
      var tr = el && el.closest ? el.closest("tr") : null;
      if (!tr || !tr.children[M10_INBOUND_STATUS_TD]) return;
      tr.children[M10_INBOUND_STATUS_TD].innerHTML = '<span class="tag-soft tag-done">已入库</span>';
      toast("流程已办结，货物确认无误，已入库（演示）");
      renderM10Ops();
    },
    验收查看详情: function (el) {
      var tr = el && el.closest ? el.closest("tr") : null;
      var table = tr && tr.closest ? tr.closest("table") : null;
      var title = table && table.id === "proc-m10-ledger-table" ? "库存台账 · 详情" : "入库记录 · 详情";
      setProgressFlowScope(table && table.id === "proc-m10-ledger-table" ? "m10-ledger-detail" : "m10-inbound-detail");
      var body =
        table && table.id === "proc-m10-inbound-table"
          ? buildM10InboundDetailHtml(tr)
          : buildDetailHtmlFromTableRow(tr);
      if (table && table.id === "proc-m10-ledger-table") {
        body += buildLedgerExtraTablesHtml(tr);
      }
      openProcModal(
        title,
        body || '<div class="field-row"><label>提示</label><span>未获取到行数据</span></div>',
        null,
        { showFlowProgress: true }
      );
      $("procModalClose").addEventListener("click", closeProcModal, { once: true });
    },
    验收录入: function () {
      openProcModal(
        "录入验收结果",
        '<div class="field-row"><label>采购订单</label><span>PO-2026-0099（只读）</span></div>' +
          '<div class="field-row"><label>实收数量</label><input type="number" value="2" /></div>' +
          '<div class="field-row"><label>合格数量</label><input type="number" value="2" /></div>' +
          '<div class="field-row"><label>不合格数量</label><input type="number" value="0" /></div>' +
          '<div class="field-row"><label>不合格原因</label><textarea></textarea></div>' +
          '<div class="field-row"><label>质检报告</label><input type="file" /></div>' +
          '<div class="field-row"><label>验收结论</label><select><option>合格</option><option>不合格</option></select></div>',
        '<button type="button" class="proc-btn" id="procModalCancel">取消</button><button type="button" class="proc-btn proc-btn-primary" id="procQcOk">确认</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      $("procQcOk").addEventListener("click", function () {
        toast("验收结果已保存；不合格时将触发退货流程（演示）");
        closeProcModal();
      });
    },
    重置筛选: function () {
      toast("筛选条件已重置（演示）");
    },
    物资选择: function () {
      openProcModal(
        "选择物资",
        htmlMaterialPicker(),
        '<button type="button" class="proc-btn proc-btn-primary" id="procPickerSubmitFlow">提交审批</button><button type="button" class="proc-btn" id="procModalCancel">取消</button>'
      );
      $("procModalCancel").addEventListener("click", closeProcModal);
      var subFlow = $("procPickerSubmitFlow");
      if (subFlow) {
        subFlow.addEventListener("click", function () {
          var firstPlanRow = document.querySelector("#proc-m1 tbody tr");
          if (firstPlanRow && firstPlanRow.cells[7]) {
            firstPlanRow.cells[7].innerHTML = '<span class="tag-soft tag-pending">待审批</span>';
          }
          toast("已提交审批，列表状态已更新为待审批（演示）");
          closeProcModal();
        });
      }
      bodyEl.querySelectorAll(".proc-pick-row").forEach(function (btn) {
        btn.addEventListener("click", function () {
          toast("已加入物资明细（演示）");
          closeProcModal();
        });
      });
    },
    删除明细行: function () {
      toast("已删除该行（演示）");
    }
  };

  try {
    window.M10QaInboundModal = {
      openInitiate: function () {
        openQaAcceptInitiateModal();
      },
      openReturnInitiator: function () {
        openQaInboundReturnInitiatorModal();
      }
    };
  } catch (eM10Export) {}

  function init() {
    if (!ensureRefs()) return;
    var x = $("procModalX");
    if (x) x.addEventListener("click", closeProcModal);
    var flowTop = $("procModalFlow");
    if (flowTop) {
      flowTop.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (flowTop.hidden) return;
        openUnifiedProgress();
      });
    }
    bindM10SubTabs();
    ensureInboundTableColumns();
    renderM10Ops();
    bindM10CategoryHoverTips();

    document.addEventListener(
      "click",
      function (e) {
        if (!document.getElementById("procModalMask")) return;
        var helpBtn = e.target.closest("[data-contract-help-toggle]");
        if (helpBtn) {
          e.preventDefault();
          e.stopPropagation();
          var wraps = document.querySelectorAll(".m10-help-wrap.is-open");
          Array.prototype.forEach.call(wraps, function (w) {
            if (!w.contains(helpBtn)) w.classList.remove("is-open");
          });
          var wrapHelp = helpBtn.closest(".m10-help-wrap");
          if (wrapHelp) wrapHelp.classList.toggle("is-open");
          return;
        }
        if (!e.target.closest(".m10-help-wrap")) {
          var openWraps = document.querySelectorAll(".m10-help-wrap.is-open");
          Array.prototype.forEach.call(openWraps, function (w) { w.classList.remove("is-open"); });
        }
        var toggleBtn = e.target.closest("[data-contract-toggle]");
        if (toggleBtn) {
          e.preventDefault();
          var row = toggleBtn.closest(".m10-ledger-row");
          if (!row) return;
          var open = row.classList.toggle("is-open");
          toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
          return;
        }
        var trackBtn = e.target.closest("[data-track-action='material-track']");
        if (trackBtn) {
          e.preventDefault();
          renderInlineTrackTimeline(trackBtn);
          var trackHint = document.getElementById("procInlineTrackHint");
          if (trackHint) trackHint.textContent = "已展开该物资轨迹，可继续点其它“物资跟踪”切换。";
          return;
        }
        var t = e.target.closest(".js-op");
        if (!t) return;
        var op = t.getAttribute("data-op");
        if (!op || !OP[op]) return;
        var href = t.getAttribute("href");
        if (t.tagName === "BUTTON" || (t.tagName === "A" && (!href || href === "#"))) e.preventDefault();
        OP[op](t);
      },
      true
    );
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
