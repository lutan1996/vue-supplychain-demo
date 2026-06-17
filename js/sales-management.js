(function () {
  if (typeof document === "undefined") return;

  var page = document.body.getAttribute("data-sales-page") || "";
  var D = window.DemoProductCatalogData || null;
  var ICONS = {
    plus: '<svg viewBox="0 0 16 16"><path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    order: '<svg viewBox="0 0 16 16"><path d="M3 4h10v8H3z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5 7h6M5 10h4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    view: '<svg viewBox="0 0 16 16"><path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    check: '<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3L13 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    upload: '<svg viewBox="0 0 16 16"><path d="M8 12V3M4.5 6.5L8 3l3.5 3.5M3 13h10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    truck: '<svg viewBox="0 0 16 16"><path d="M1.5 10.5h8V5h-8v5.5zM9.5 7h2.5l2 2.5v1h-4.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="4" cy="12" r="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="12" r="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    receive: '<svg viewBox="0 0 16 16"><path d="M3 3h10v10H3z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5 8l2 2 4-5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    track: '<svg viewBox="0 0 16 16"><path d="M3 3v10M3 4h7l-1 2 1 2H3M6 13h7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  var cartItems = [];
  var orderDraftMaterials = [];
  var orderMap = {};
  var purchasedMap = {};
  var reportMap = {};
  var SALES_CART_RESET_KEY = "salesCartResetV1";

  try {
    cartItems = JSON.parse(localStorage.getItem("salesCartItems") || "[]") || [];
  } catch (eCartStore) {
    cartItems = [];
  }

  try {
    if (localStorage.getItem(SALES_CART_RESET_KEY) !== "done") {
      localStorage.removeItem("salesCartItems");
      localStorage.setItem(SALES_CART_RESET_KEY, "done");
      cartItems = [];
    }
  } catch (eCartReset) {}

  function cartTypeKey(item) {
    if (!item) return "";
    return String(
      item.cartKey ||
      item.typeCode ||
      item.a ||
      item.typeName ||
      item.productName ||
      item.id ||
      item.b ||
      item.code ||
      ""
    );
  }

  function migrateCartItems(list) {
    if (!Array.isArray(list) || !list.length) return [];
    var merged = [];
    list.forEach(function (raw) {
      if (!raw) return;
      var key = cartTypeKey(raw);
      if (!key) return;
      var found = merged.find(function (item) {
        return item.cartKey === key;
      });
      if (!found) {
        found = {
          cartKey: key,
          id: raw.id || raw.code || key,
          productName: raw.productName || raw.typeName || "",
          mfrName: raw.mfrName || "",
          model: raw.model || "",
          category: raw.category || "销售类",
          typeCode: raw.typeCode || raw.a || "",
          typeName: raw.typeName || "",
          code: raw.code || raw.b || "",
          stockQty: raw.stockQty || "",
          refPrice: raw.refPrice || "",
          features: raw.features || {},
          qty: 0
        };
        merged.push(found);
      }
      found.qty += Math.max(1, Number(raw.qty || 1));
      if (!found.typeCode && (raw.typeCode || raw.a)) found.typeCode = raw.typeCode || raw.a;
      if (!found.typeName && raw.typeName) found.typeName = raw.typeName;
      if ((!found.productName || found.productName === found.typeName) && raw.productName) found.productName = raw.productName;
      if (!found.code && (raw.code || raw.b)) found.code = raw.code || raw.b;
      if (!found.refPrice && raw.refPrice) found.refPrice = raw.refPrice;
      if (!found.features || !Object.keys(found.features).length) found.features = raw.features || {};
    });
    return merged;
  }

  cartItems = migrateCartItems(cartItems);

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function toNumber(v) {
    if (typeof v === "number") return v;
    var text = String(v == null ? "" : v).replace(/,/g, "").replace(/[^\d.-]/g, "");
    var n = Number(text);
    return isNaN(n) ? 0 : n;
  }

  function money(v) {
    var n = toNumber(v);
    return n.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function moneyYuan(v) {
    return money(v) + " 元";
  }

  function textOrDash(v) {
    if (v == null) return "—";
    var text = String(v).trim();
    return text ? text : "—";
  }

  function tag(text) {
    var cls = "sales-tag";
    if (/已完成|已收货|已执行|在用|已通过/.test(text)) cls += " sales-tag-green";
    else if (/待|部分|未执行|未上传/.test(text)) cls += " sales-tag-orange";
    else if (/驳回/.test(text)) cls += " sales-tag-red";
    else cls += " sales-tag-blue";
    return '<span class="' + cls + '">' + esc(text) + "</span>";
  }

  function dotDate(v) {
    var text = String(v == null ? "" : v).trim();
    if (!text || text === "—") return "";
    var m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return Number(m[1]) + "." + Number(m[2]) + "." + Number(m[3]);
    return text.replace(/-/g, ".");
  }

  function shiftDotDate(v, days) {
    var text = String(v == null ? "" : v).trim();
    var m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return dotDate(v);
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    d.setDate(d.getDate() + Number(days || 0));
    return d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate();
  }

  function salesTrackItemHtml(color, main, sub) {
    return '<div class="sales-track-item"><span class="sales-track-dot" style="background:' + color + '"></span><div><div class="sales-track-main">' + esc(main) + '</div><div class="sales-track-sub">' + esc(sub) + "</div></div></div>";
  }

  function salesBaseTrackHtml(productName, productCode) {
    return [
      salesTrackItemHtml("#2563eb", "2026.4.20 入库：" + textOrDash(productName) + "（" + textOrDash(productCode) + "）", "入库时间：2026.4.20 10:18；入库地点：山东风电中心仓库001货位；办理人：仓储管理员王敏"),
      salesTrackItemHtml("#10b981", "2026.5.10 被电控所领用", "领用时间：2026.5.10 15:08；领用单：LY-2026-0510（演示）；领用部门：电控所；办理人：成明锴"),
      salesTrackItemHtml("#6366f1", "2026.5.12 使用人变更（成明锴 → 张三）", "变更时间：2026.5.12 09:20；原保管地点：山东风电中心仓库001货位；变更人：电控所管理员成明锴；接收人：张三；变更原因：岗位调整"),
      salesTrackItemHtml("#f59e0b", "2026.5.18 使用人变更（张三 → 李四）", "变更时间：2026.5.18 14:36；所在地点：山东风电中心仓库001货位；变更人：张三；接收人：李四；变更原因：岗位调动")
    ].join("");
  }

  function orderTrackTimelineHtml(order, item) {
    var status = String(order.status || "").trim();
    var approvedDone = ["待签订合同", "待发货", "已发货", "已收货", "已完成"].indexOf(status) >= 0;
    var contractDone = ["待发货", "已发货", "已收货", "已完成"].indexOf(status) >= 0;
    var shipDone = ["已发货", "已收货", "已完成"].indexOf(status) >= 0;
    var receiveDone = ["已收货", "已完成"].indexOf(status) >= 0;
    var currentColor = /已完成|已收货|已发货/.test(status) ? "#14b8a6" : /待|未/.test(status) ? "#94a3b8" : "#2563eb";
    var html = salesBaseTrackHtml(item.productName, item.productCode);

    html += salesTrackItemHtml(
      "#0ea5e9",
      dotDate(order.orderDate) + " 电控所物资专责发起销售下单",
      "下单时间：" + dotDate(order.orderDate) + " 09:12；下单人：" + textOrDash(order.requester) + "；订单编号：" + textOrDash(order.orderNo) + "；下单公司：" + textOrDash(order.company) + "；场站：" + textOrDash(order.station) + "；产品：" + textOrDash(item.productName) + "；购买数量：" + textOrDash(item.qty)
    );

    if (approvedDone) {
      html += salesTrackItemHtml(
        "#22c55e",
        shiftDotDate(order.orderDate, 1) + " 电控所负责人审核通过",
        "审核时间：" + shiftDotDate(order.orderDate, 1) + " 10:03；审核人：" + textOrDash(order.handler) + "；审核地点：" + textOrDash(order.company) + "销售管理岗；已核对购买数量、订单金额、收货单位及场站信息。"
      );
    }

    if (contractDone) {
      html += salesTrackItemHtml(
        "#8b5cf6",
        shiftDotDate(order.orderDate, 2) + " 销售合同登记完成",
        "登记时间：" + shiftDotDate(order.orderDate, 2) + " 14:26；登记人：王卿明；销售合同编号：" + textOrDash(order.contractNo) + "；办理地点：经营发展中心合同岗。"
      );
    }

    if (shipDone) {
      html += salesTrackItemHtml(
        "#f97316",
        dotDate(order.shipDate || shiftDotDate(order.orderDate, 4)) + " 安排发货",
        "发货时间：" + dotDate(order.shipDate || shiftDotDate(order.orderDate, 4)) + " 11:08；发货人：李哲；发货路径：" + textOrDash(order.route) + "；物流单号：" + textOrDash(order.waybillNo) + "；发往场站：" + textOrDash(order.station) + "。"
      );
    }

    if (receiveDone) {
      html += salesTrackItemHtml(
        "#14b8a6",
        dotDate(order.receiveDate || shiftDotDate(order.shipDate || order.orderDate, 1)) + " 项目公司收货确认",
        "收货时间：" + dotDate(order.receiveDate || shiftDotDate(order.shipDate || order.orderDate, 1)) + " 16:20；收货人：" + textOrDash(order.requester) + "；收货单位：" + textOrDash(order.receiverCompany) + "；场站：" + textOrDash(order.station) + "。"
      );
    }

    return html;
  }

  function purchasedTrackTimelineHtml(summary, row) {
    var linkedOrder = orderMap[row.orderNo] || {};
    var orderDate = linkedOrder.orderDate || "2026-06-10";
    var route = linkedOrder.route || "供应商直发";
    var requester = linkedOrder.requester || "成明锴";
    var handler = linkedOrder.handler || "电控所负责人";
    var receiverCompany = linkedOrder.receiverCompany || (textOrDash(row.company) + "新能源有限公司");
    var currentSub =
      row.usageStatus === "在用"
        ? "物资已在场站投入使用；当前使用/存放位置：" + textOrDash(row.location) + "。"
        : row.usageStatus === "库存中"
          ? "物资已完成收货入库，暂存于 " + textOrDash(row.location) + "，等待后续使用。"
          : "当前存放/使用位置：" + textOrDash(row.location) + "；可继续通过订单编号追溯来源。";

    return salesBaseTrackHtml(row.productName, row.productCode) +
      salesTrackItemHtml(
        "#0ea5e9",
        dotDate(orderDate) + " 电控所物资专责发起销售下单",
        "下单时间：" + dotDate(orderDate) + " 09:12；下单人：" + textOrDash(requester) + "；订单编号：" + textOrDash(row.orderNo) + "；下单公司：" + textOrDash(row.company) + "；场站：" + textOrDash(row.station) + "；购买数量：" + textOrDash(row.qty)
      ) +
      salesTrackItemHtml(
        "#22c55e",
        shiftDotDate(orderDate, 1) + " 电控所负责人审核通过",
        "审核时间：" + shiftDotDate(orderDate, 1) + " 10:03；审核人：" + textOrDash(handler) + "；审核地点：" + textOrDash(row.company) + "销售管理岗；确认该产品可按销售流程流转，并保留前序领用与使用人变更记录。"
      ) +
      salesTrackItemHtml(
        "#8b5cf6",
        shiftDotDate(orderDate, 2) + " 销售合同登记完成",
        "登记时间：" + shiftDotDate(orderDate, 2) + " 14:26；登记人：王卿明；销售合同编号：" + textOrDash(row.contractNo) + "；已与订单 " + textOrDash(row.orderNo) + " 关联，可用于后续发货和收货反查。"
      ) +
      salesTrackItemHtml(
        "#f97316",
        shiftDotDate(orderDate, 3) + " 安排发货",
        "发货时间：" + shiftDotDate(orderDate, 3) + " 11:08；发货人：李哲；发货路径：" + textOrDash(route) + "；发往场站：" + textOrDash(row.station) + "；同步维护收货准备信息。"
      ) +
      salesTrackItemHtml(
        "#14b8a6",
        dotDate(row.receiveDate) + " 项目公司收货确认",
        "收货时间：" + dotDate(row.receiveDate) + " 16:20；收货人：" + textOrDash(requester) + "；收货单位：" + textOrDash(receiverCompany) + "；收货地点：" + textOrDash(row.location) + "；已纳入购入物资统计。"
      ) +
      salesTrackItemHtml(
        "#06b6d4",
        "当前状态：" + textOrDash(row.usageStatus),
        "状态时间：" + dotDate(row.receiveDate) + "；当前处理人：" + textOrDash(handler) + "；" + currentSub + " 订单编号：" + textOrDash(row.orderNo) + "；物资类型：" + textOrDash(summary.typeName) + "。"
      );
  }

  function toast(msg) {
    if (window.mapDemoToast) window.mapDemoToast(msg);
    else alert(msg);
  }

  function iconBtn(icon, title, action, id) {
    return '<button type="button" class="sales-action-link" data-action="' + esc(action) + '" data-id="' + esc(id || "") + '">' + esc(title) + "</button>";
  }

  function qtyStepperHtml(value, key, attrName, stepAttrName) {
    var attr = attrName || "data-qty-key";
    var stepAttr = stepAttrName || "data-qty-step";
    var qty = Math.max(1, Number(value || 1));
    return '<span class="sales-qty-stepper">' +
      '<button type="button" ' + stepAttr + '="' + esc(key) + '" data-step="-1">-</button>' +
      '<input type="number" min="1" value="' + qty + '" ' + attr + '="' + esc(key) + '">' +
      '<button type="button" ' + stepAttr + '="' + esc(key) + '" data-step="1">+</button>' +
      "</span>";
  }

  function getProducts() {
    return D ? D.flattenAllProducts() : [];
  }

  function uniqueBy(items, pickKey) {
    var seen = {};
    return (items || []).filter(function (item) {
      var key = String(pickKey(item) || "");
      if (!key || seen[key]) return false;
      seen[key] = 1;
      return true;
    });
  }

  function productCandidatesByName(name) {
    var target = String(name || "").trim();
    if (!target) return [];
    return getProducts().filter(function (product) {
      var productName = String(product.productName || "").trim();
      var typeName = String(product.typeName || "").trim();
      return productName === target || typeName === target;
    });
  }

  function productCandidateByCodes(productCode, typeCode) {
    var pCode = String(productCode || "").trim();
    var tCode = String(typeCode || "").trim();
    var list = getProducts();
    if (pCode) {
      var foundByProduct = list.find(function (product) {
        return String(product.b || "").trim() === pCode;
      });
      if (foundByProduct) return foundByProduct;
    }
    if (tCode) {
      var foundByType = list.find(function (product) {
        return String(product.a || "").trim() === tCode;
      });
      if (foundByType) return foundByType;
    }
    return null;
  }

  function productMetaLookup(item) {
    item = item || {};
    var matches = [];
    var direct = productCandidateByCodes(item.productCode || item.code || item.b, item.typeCode || item.a || item.materialCode);
    if (direct) matches.push(direct);
    matches = matches.concat(productCandidatesByName(item.productName || item.materialName || item.name || item.typeName || item.materialTypeName));
    matches = uniqueBy(matches, function (product) {
      return String(product.id || product.b || product.a || product.productName || "");
    });
    var primary = matches[0] || null;
    return {
      primary: primary,
      typeName: primary ? primary.typeName : "",
      typeDef: primary ? primary.typeDef : "",
      manufacturer: primary ? primary.mfrName : "",
      model: primary ? primary.model : "",
      productCode: primary ? primary.b : "",
      typeCode: primary ? primary.a : "",
      category: primary ? primary.category : "",
      stockQty: primary ? primary.stockQty : "",
      refPrice: primary ? primary.refPrice : "",
      products: matches
    };
  }

  function patchOrderMaterials(order) {
    order = order || {};
    var materials = Array.isArray(order.materials) ? order.materials : [];
    order.materials = materials.map(function (raw, idx) {
      var item = raw ? Object.assign({}, raw) : {};
      var meta = productMetaLookup(item);
      var primary = meta.primary;
      if ((!item.productName || item.productName === "—") && primary) item.productName = primary.productName;
      if ((!item.productCode || item.productCode === "—") && meta.productCode) item.productCode = meta.productCode;
      if ((!item.model || item.model === "—") && meta.model) item.model = meta.model;
      if ((!item.manufacturer || item.manufacturer === "—") && meta.manufacturer) item.manufacturer = meta.manufacturer;
      if ((!item.typeCode || item.typeCode === "—") && meta.typeCode) item.typeCode = meta.typeCode;
      if ((!item.typeName || item.typeName === "—") && meta.typeName) item.typeName = meta.typeName;
      if ((!item.category || item.category === "—") && meta.category) item.category = meta.category;
      if ((item.price == null || item.price === "" || item.price === "—") && meta.refPrice !== "") item.price = toNumber(meta.refPrice);
      if ((item.subtotal == null || item.subtotal === "" || item.subtotal === "—") && item.price != null && item.qty != null) item.subtotal = toNumber(item.price) * toNumber(item.qty);
      if (!item.id) item.id = item.itemId || item.productCode || item.typeCode || ("order-item-" + idx);
      return item;
    });
    return order;
  }

  function patchPurchasedSummary(summary) {
    summary = summary || {};
    var details = Array.isArray(summary.details) ? summary.details : [];
    summary.details = details.map(function (raw, idx) {
      var row = raw ? Object.assign({}, raw) : {};
      var meta = productMetaLookup({
        productName: row.productName,
        materialName: row.productName,
        productCode: row.productCode,
        materialCode: row.materialCode
      });
      var primary = meta.primary;
      if ((!row.productName || row.productName === "—") && primary) row.productName = primary.productName;
      if ((!row.materialCode || row.materialCode === "—") && meta.typeCode) row.materialCode = meta.typeCode;
      if ((!row.productCode || row.productCode === "—") && meta.productCode) row.productCode = meta.productCode;
      if ((!row.spec || row.spec === "—") && meta.model) row.spec = meta.model;
      if ((!row.manufacturer || row.manufacturer === "—") && meta.manufacturer) row.manufacturer = meta.manufacturer;
      if (!row.company || row.company === "—") row.company = "河北龙源";
      if (!row.station || row.station === "—") row.station = summary.mainStation || "麒麟山风电场";
      if (!row.orderNo || row.orderNo === "—") row.orderNo = "XSORD-2026-001";
      if (!row.contractNo || row.contractNo === "—") row.contractNo = "XSHT-2026-001";
      if (row.qty == null || row.qty === "" || row.qty === "—") row.qty = 1;
      if (!row.receiveDate || row.receiveDate === "—") row.receiveDate = summary.latestReceiveDate || "2026-06-15";
      if (!row.location || row.location === "—") row.location = (summary.mainStation || "麒麟山风电场") + "库房";
      if (!row.usageStatus || row.usageStatus === "—") row.usageStatus = "库存中";
      if (!row.id) row.id = row.productCode || row.materialCode || ("purchased-item-" + idx);
      return row;
    });
    if ((!summary.typeName || summary.typeName === "—") && summary.details.length) {
      var meta = productMetaLookup({ materialCode: summary.details[0].materialCode, productName: summary.details[0].productName });
      if (meta.typeName) summary.typeName = meta.typeName;
    }
    if ((!summary.typeCode || summary.typeCode === "—") && summary.details.length) {
      summary.typeCode = summary.details[0].materialCode || "—";
    }
    if (!summary.mainStation || summary.mainStation === "—") {
      summary.mainStation = summary.details[0] ? summary.details[0].station : "—";
    }
    if (!summary.latestReceiveDate || summary.latestReceiveDate === "—") {
      summary.latestReceiveDate = summary.details[0] ? summary.details[0].receiveDate : "—";
    }
    if (summary.productKinds == null || summary.productKinds === "" || summary.productKinds === "—") {
      summary.productKinds = uniqueBy(summary.details, function (row) { return row.productCode || row.productName; }).length || 0;
    }
    if (summary.orderCount == null || summary.orderCount === "" || summary.orderCount === "—") {
      summary.orderCount = uniqueBy(summary.details, function (row) { return row.orderNo; }).length || 0;
    }
    if (summary.totalQty == null || summary.totalQty === "" || summary.totalQty === "—") summary.totalQty = summary.details.reduce(function (sum, row) { return sum + toNumber(row.qty); }, 0);
    if (summary.totalAmount == null || summary.totalAmount === "" || summary.totalAmount === "—") summary.totalAmount = summary.details.reduce(function (sum, row) { return sum + toNumber(row.amount || row.totalAmount); }, 0);
    return summary;
  }

  function expandPurchasedDetails(summary) {
    var details = Array.isArray(summary.details) ? summary.details : [];
    var expanded = [];
    details.forEach(function (row, detailIdx) {
      var qty = Math.max(1, Math.round(toNumber(row.qty || 1)));
      var unitAmount = row.unitAmount != null ? toNumber(row.unitAmount) : (qty ? toNumber(row.amount || row.totalAmount) / qty : 0);
      for (var i = 0; i < qty; i++) {
        var seq = expanded.length + 1;
        expanded.push(Object.assign({}, row, {
          id: row.id + "-unit-" + (i + 1),
          unitCode: row.unitCode || ("C" + String(seq).padStart(11, "0")),
          qty: 1,
          amount: unitAmount,
          usageStatus: row.usageStatus || "库存中"
        }));
      }
    });
    return expanded;
  }

  function patchReportRows(rows) {
    return (rows || []).map(function (raw) {
      var row = raw ? Object.assign({}, raw) : {};
      row.lines = Array.isArray(row.lines) ? row.lines.map(function (line) {
        var next = line ? Object.assign({}, line) : {};
        if (!next.orderNo || next.orderNo === "—") next.orderNo = "XSORD-2026-001";
        var linkedOrder = orderMap[next.orderNo] || {};
        if ((!next.company || next.company === "—") && linkedOrder.company) next.company = linkedOrder.company;
        if ((!next.station || next.station === "—") && linkedOrder.station) next.station = linkedOrder.station;
        if ((next.amount == null || next.amount === "" || next.amount === "—") && linkedOrder.totalAmount != null) next.amount = linkedOrder.totalAmount;
        if (!next.status || next.status === "—") next.status = linkedOrder.status || row.status || "未执行";
        if (!next.date || next.date === "—") next.date = linkedOrder.orderDate || row.signDate || "2026-06-10";
        return next;
      }) : [];
      if ((!row.orderNo || row.orderNo === "—") && row.lines.length) {
        row.orderNo = row.lines.map(function (line) { return line.orderNo; }).filter(Boolean).join("、");
      }
      return row;
    });
  }

  function ensureModal() {
    var mask = document.getElementById("salesModalMask");
    if (mask) return mask;
    mask = document.createElement("div");
    mask.id = "salesModalMask";
    mask.className = "sales-modal-mask";
    mask.innerHTML = '<div class="sales-modal"><div class="sales-modal-hd"><span id="salesModalTitle"></span><button type="button" class="sales-modal-close" data-close aria-label="关闭">×</button></div><div class="sales-modal-bd" id="salesModalBody"></div><div class="sales-modal-ft" id="salesModalFoot"></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeModal();
    });
    return mask;
  }

  function openModal(title, body, foot, size) {
    var mask = ensureModal();
    var box = mask.querySelector(".sales-modal");
    box.classList.remove("sales-modal--small", "sales-modal--wide");
    if (size === "wide") box.classList.add("sales-modal--wide");
    else if (size) box.classList.add("sales-modal--small");
    var oldHeadAction = mask.querySelector(".sales-modal-head-action");
    if (oldHeadAction) oldHeadAction.remove();
    document.getElementById("salesModalTitle").textContent = title;
    document.getElementById("salesModalBody").innerHTML = body;
    document.getElementById("salesModalFoot").innerHTML = foot || '<button type="button" class="sales-btn" data-close>关闭</button>';
    mask.classList.add("show");
    mask.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    var mask = document.getElementById("salesModalMask");
    if (!mask) return;
    mask.classList.remove("show");
    mask.setAttribute("aria-hidden", "true");
  }

  function setModalHeadAction(text, handler) {
    var mask = ensureModal();
    var head = mask.querySelector(".sales-modal-hd");
    var close = mask.querySelector(".sales-modal-close");
    if (!head || !close) return;
    var old = head.querySelector(".sales-modal-head-action");
    if (old) old.remove();
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sales-flow-link sales-modal-head-action";
    btn.textContent = text;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      handler();
    });
    head.insertBefore(btn, close);
  }

  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("click", function (e) {
    var close = e.target && e.target.closest ? e.target.closest("[data-sales-flow-close]") : null;
    if (close) closeSalesFlowModal();
    var tab = e.target && e.target.closest ? e.target.closest(".sales-flow-tab") : null;
    if (!tab) return;
    var mask = document.getElementById("salesFlowMask");
    if (!mask) return;
    var key = tab.getAttribute("data-tab");
    mask.querySelectorAll(".sales-flow-tab").forEach(function (x) {
      x.classList.toggle("is-active", x === tab);
    });
    mask.querySelectorAll(".sales-flow-pane").forEach(function (x) {
      x.classList.toggle("is-active", x.getAttribute("data-pane") === key);
    });
  });

  function ensureSalesFlowModal() {
    var mask = document.getElementById("salesFlowMask");
    if (mask && mask.parentNode) mask.parentNode.removeChild(mask);
    mask = document.createElement("div");
    mask.id = "salesFlowMask";
    mask.className = "sales-flow-mask";
    var nodes = [
      "电控所物资专责从本部门所属销售类物资中选取产品并提交订单",
      "电控所负责人审核订单",
      "上传或登记销售合同",
      "安排发货并维护物流信息",
      "项目公司收货并确认验收",
      "流程归档结束"
    ];
    mask.innerHTML = '<div class="sales-flow-dialog" role="dialog" aria-label="流程进度">' +
      '<div class="sales-flow-hd"><span>流程进度</span><button type="button" class="sales-flow-close" data-sales-flow-close="1">&times;</button></div>' +
      '<div class="sales-flow-body"><div class="sales-flow-tabs"><button type="button" class="sales-flow-tab is-active" data-tab="flow">流程图</button><button type="button" class="sales-flow-tab" data-tab="info">审批信息</button></div>' +
      '<div class="sales-flow-pane is-active" data-pane="flow"><div class="sales-flow-track"><div class="sales-flow-row">' +
      nodes.map(function (n, i) {
        return (i === 0 ? '<span class="sales-flow-dot"></span>' : '<span class="sales-flow-arrow">→</span>') +
          '<span class="sales-flow-node' + (i === nodes.length - 1 ? " end" : "") + '">' + esc(n) + '</span>' +
          (i === nodes.length - 1 ? '<span class="sales-flow-dot end"></span>' : "");
      }).join("") +
      '</div></div></div>' +
      '<div class="sales-flow-pane" data-pane="info"><div class="sales-flow-info">' +
      '<div>1、电控所物资专责成明锴在物资列表中录入加购数量并提交订单（2026-06-10 09:12）</div>' +
      '<div>2、电控所负责人陈亮审批：审核订单明细、购买数量、订单金额以及场站收货信息，同意（2026-06-10 10:03）</div>' +
      '<div>3、经营发展中心合同专责王卿明登记销售合同编号并补充合同附件（2026-06-11 14:26）</div>' +
      '<div>4、物流专责李哲维护物流单号、发货日期和发货说明，安排发货（2026-06-14 11:08）</div>' +
      '<div>5、项目公司收货人张明完成收货确认，购入物资自动关联订单编号并纳入购入物资统计（2026-06-15 16:20）</div>' +
      '<div>6、流程归档结束（2026-06-15 16:35）</div>' +
      '</div></div></div><div class="sales-flow-ft"><button type="button" data-sales-flow-close="1">关闭</button></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeSalesFlowModal();
    });
    return mask;
  }

  function openSalesFlowModal() {
    ensureSalesFlowModal().classList.add("show");
  }

  function closeSalesFlowModal() {
    var mask = document.getElementById("salesFlowMask");
    if (mask) mask.classList.remove("show");
  }

  function productDetailHtml(product) {
    product = product || {};
    var meta = productMetaLookup(product);
    if ((!product.typeName || product.typeName === "—") && meta.typeName) product.typeName = meta.typeName;
    if ((!product.typeDef || product.typeDef === "—") && meta.typeDef) product.typeDef = meta.typeDef;
    if ((!product.mfrName || product.mfrName === "—") && meta.manufacturer) product.mfrName = meta.manufacturer;
    if ((!product.model || product.model === "—") && meta.model) product.model = meta.model;
    if ((!product.b || product.b === "—") && meta.productCode) product.b = meta.productCode;
    if ((!product.a || product.a === "—") && meta.typeCode) product.a = meta.typeCode;
    if ((!product.category || product.category === "—") && meta.category) product.category = meta.category;
    if ((product.stockQty == null || product.stockQty === "" || product.stockQty === "—") && meta.stockQty !== "") product.stockQty = meta.stockQty;
    if ((product.refPrice == null || product.refPrice === "" || product.refPrice === "—") && meta.refPrice !== "") product.refPrice = meta.refPrice;
    var feats = product.features || {};
    var rows = [
      ["产品名称", textOrDash(product.productName)],
      ["制造商名称", textOrDash(product.mfrName)],
      ["产品型号", textOrDash(product.model)],
      ["产品编码", textOrDash(product.b)],
      ["库存数量", textOrDash(product.stockQty)],
      ["单价（元）", textOrDash(product.refPrice)],
      ["类型说明", textOrDash(product.typeDef)]
    ];
    var featureRows = [];
    for (var i = 1; i <= 8; i++) {
      var name = feats["f" + i + "_name"];
      var val = feats["f" + i];
      if (name || val) featureRows.push([
        name || ("特征值" + i),
        textOrDash(val || name)
      ]);
    }
    return '<table class="sales-detail-table"><tbody>' + rows.map(function (row) {
      return "<tr><th>" + esc(row[0]) + "</th><td>" + esc(textOrDash(row[1])) + "</td></tr>";
    }).join("") + "</tbody></table>" +
      '<div class="sales-section-title">产品特征明细</div>' +
      '<div class="sales-table-wrap sales-modal-table-wrap"><table class="sales-table sales-modal-table"><thead><tr><th>特征项</th><th>特征值</th></tr></thead><tbody>' +
      (featureRows.length ? featureRows.map(function (row) {
        return "<tr><td>" + esc(textOrDash(row[0])) + "</td><td>" + esc(textOrDash(row[1])) + "</td></tr>";
      }).join("") : '<tr><td colspan="2" class="sales-empty">暂无产品特征数据</td></tr>') +
      "</tbody></table></div>";
  }

  function cartKey(product) {
    if (!product) return "";
    return String(
      product.a ||
      product.typeCode ||
      product.typeName ||
      product.productName ||
      product.id ||
      product.b ||
      product.code ||
      ""
    );
  }

  function normalizeCartSnapshot(product) {
    return {
      cartKey: cartKey(product),
      id: product.id,
      productName: product.productName,
      mfrName: product.mfrName,
      model: product.model,
      category: product.category,
      typeCode: product.a,
      typeName: product.typeName,
      code: product.b,
      stockQty: product.stockQty,
      refPrice: product.refPrice,
      features: product.features || {}
    };
  }

  function saveCart() {
    try {
      localStorage.setItem("salesCartItems", JSON.stringify(cartItems));
    } catch (eCartStore) {}
    updateCartButton();
  }

  function updateCartButton() {
    var btn = document.getElementById("salesCartBtn");
    if (!btn) return;
    var total = cartItems.reduce(function (sum, item) {
      return sum + Number(item.qty || 0);
    }, 0);
    btn.innerHTML = '<svg class="sales-cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-2 8H8L6 3H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="18" cy="20" r="1.6" fill="currentColor"/></svg>' +
      (total ? '<span class="sales-cart-count">' + total + '</span>' : "");
  }

  function addToCart(product, qty) {
    var snapshot = normalizeCartSnapshot(product);
    var old = cartItems.find(function (item) {
      return item.cartKey === snapshot.cartKey;
    });
    if (old) {
      old.qty = Number(old.qty || 0) + qty;
      old.typeCode = snapshot.typeCode;
      old.typeName = snapshot.typeName;
      old.category = snapshot.category;
    } else {
      snapshot.qty = qty;
      cartItems.push(snapshot);
    }
    saveCart();
  }

  function openAddCartModal(product) {
    openModal(
      "加购数量",
      '<div class="sales-qty-box"><div class="sales-field"><label>产品名称</label><input readonly value="' + esc(product.productName) + '"></div><div class="sales-field"><label>加购数量</label><input id="salesAddQty" type="number" min="1" value="1"></div></div>',
      '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesAddCartOk">确定</button>',
      true
    );
    var ok = document.getElementById("salesAddCartOk");
    if (ok) ok.addEventListener("click", function () {
      var qty = Math.max(1, Number(document.getElementById("salesAddQty").value || 1));
      addToCart(product, qty);
      closeModal();
      toast("已加入购物车");
    });
  }

  function cartProduct(item) {
    var products = getProducts().filter(function (p) {
      return item.cartKey && cartKey(p) === item.cartKey;
    });
    if (products.length) {
      products.sort(function (a, b) {
        return toNumber(b.stockQty) - toNumber(a.stockQty);
      });
      return products[0];
    }
    return {
      id: item.id,
      productName: item.productName,
      mfrName: item.mfrName,
      model: item.model,
      category: item.category || "销售类",
      a: item.typeCode || "",
      typeName: item.typeName || "",
      b: item.code || "",
      stockQty: item.stockQty || "",
      refPrice: item.refPrice || "",
      features: item.features || {}
    };
  }

  function featureText(product, idx) {
    var features = product.features || {};
    var name = features["f" + idx + "_name"] || "";
    var value = features["f" + idx] || "";
    return name && value ? name + "：" + value : name || value || "—";
  }

  function materialFeatureCells(product) {
    return [featureText(product, 1), featureText(product, 2), featureText(product, 3), featureText(product, 4)];
  }

  function materialLineTableHtml(rows, opts) {
    opts = opts || {};
    var editable = !!opts.editable;
    var removable = !!opts.removable;
    var qtyAttr = opts.qtyAttr || "data-cart-qty";
    var stepAttr = opts.stepAttr || "data-qty-step";
    var trackOrder = opts.trackOrder || "";
    if (!rows.length) return '<div class="sales-empty">暂无物资明细数据</div>';
    return '<div class="sales-table-wrap sales-modal-table-wrap"><table class="sales-cart-table"><thead><tr>' +
      ["序号", "产品名称", "制造商名称", "产品型号", "产品编码", "购买数量", "单价（元）", "合计金额（元）", "特征值1", "特征值2", "特征值3", "特征值4", "操作"].map(function (head) {
        return "<th>" + esc(head) + "</th>";
      }).join("") +
      "</tr></thead><tbody>" +
      rows.map(function (row) {
        var qtyCell = editable ? qtyStepperHtml(row.qty, row.id, qtyAttr, stepAttr) : esc(textOrDash(row.qty));
        var op = "—";
        if (removable) op = '<button type="button" class="sales-cart-remove" data-cart-remove="' + esc(row.id) + '">删除</button>';
        else if (trackOrder) op = '<button type="button" class="sales-inline-link" data-modal-action="order-track" data-order="' + esc(trackOrder) + '" data-item="' + esc(row.id) + '">物资跟踪</button>';
        return "<tr>" +
          "<td>" + esc(row.seq) + "</td>" +
          "<td>" + esc(textOrDash(row.productName)) + "</td>" +
          "<td>" + esc(textOrDash(row.mfrName || row.manufacturer)) + "</td>" +
          "<td>" + esc(textOrDash(row.model)) + "</td>" +
          "<td>" + esc(textOrDash(row.code || row.productCode)) + "</td>" +
          "<td>" + qtyCell + "</td>" +
          "<td>" + money(row.price) + "</td>" +
          "<td>" + money(row.subtotal) + "</td>" +
          "<td>" + esc(textOrDash(row.features[0])) + "</td>" +
          "<td>" + esc(textOrDash(row.features[1])) + "</td>" +
          "<td>" + esc(textOrDash(row.features[2])) + "</td>" +
          "<td>" + esc(textOrDash(row.features[3])) + "</td>" +
          "<td>" + op + "</td>" +
          "</tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  function cartRows() {
    return cartItems.map(function (item, idx) {
      var product = cartProduct(item);
      var unitPrice = toNumber(product.refPrice);
      var qty = Math.max(1, Number(item.qty || 1));
      var subtotal = unitPrice * qty;
      return {
        seq: idx + 1,
        id: item.cartKey,
        productName: product.productName || product.typeName || item.productName || item.typeName || "—",
        mfrName: product.mfrName,
        model: product.model,
        code: product.b,
        typeCode: product.a || item.typeCode,
        typeName: product.typeName || item.typeName,
        category: product.category,
        qty: qty,
        price: unitPrice,
        subtotal: subtotal,
        features: materialFeatureCells(product)
      };
    });
  }

  function summaryTableHtml(totalQty, totalAmount) {
    return '<div class="sales-form-grid sales-form-grid--spaced">' +
      '<div class="sales-field"><label>购买总数量</label><input readonly value="' + esc(totalQty || "—") + '"></div>' +
      '<div class="sales-field"><label>订单总金额</label><input readonly value="' + (totalQty ? moneyYuan(totalAmount) : "—") + '"></div>' +
      '</div>';
  }

  function cartTableHtml() {
    if (!cartItems.length) return '<div class="sales-empty">暂无加购物资</div>';
    var rows = cartRows();
    var totalQty = rows.reduce(function (sum, row) { return sum + row.qty; }, 0);
    var totalAmount = rows.reduce(function (sum, row) { return sum + row.subtotal; }, 0);
    return '<div class="sales-section-title">订单物资明细表</div>' +
      materialLineTableHtml(rows, { editable: true, removable: true }) +
      summaryTableHtml(totalQty, totalAmount);
  }

  function cartHtml() {
    return cartTableHtml() +
      '<div class="sales-form-grid" style="margin-top:12px">' +
      '<div class="sales-field"><label>订单编号</label><input readonly value="XSORD-2026-009"></div>' +
      '<div class="sales-field"><label>订单状态</label><input readonly value="待确认"></div>' +
      '<div class="sales-field"><label>下单人</label><input value="张明"></div>' +
      '<div class="sales-field"><label>下单公司</label><select><option>河北龙源</option><option>天津龙源</option><option>甘肃龙源</option></select></div>' +
      '<div class="sales-field"><label>收货单位</label><input readonly value="山西龙源新能源有限公司"></div>' +
      '<div class="sales-field"><label>场站名称</label><input readonly value="忻州风电场"></div>' +
      '<div class="sales-field"><label>物资所属部门</label><input readonly value="电控所"></div>' +
      '<div class="sales-field"><label>下单日期</label><input type="date" value="2026-06-17"></div>' +
      '<div class="sales-field"><label>发货路径</label><select id="salesCartPath"><option>工程技术公司发货</option><option>供应商直发</option></select></div>' +
      '<div class="sales-field"><label>当前处理人</label><input value="电控所负责人"></div>' +
      '<div class="sales-field"><label>销售合同编号</label><input readonly value="—"></div>' +
      '<div class="sales-field"><label>物流单号</label><input readonly value="—"></div>' +
      '<div class="sales-field"><label>期望发货日期</label><input type="date" value="2026-06-30"></div>' +
      '<div class="sales-field"><label>收货日期</label><input readonly value="—"></div>' +
      '<div class="sales-field sales-field--full"><label>订单备注</label><textarea placeholder="请输入订单备注"></textarea></div>' +
      "</div>";
  }

  function refreshCartModal() {
    var body = document.getElementById("salesModalBody");
    var foot = document.getElementById("salesModalFoot");
    if (!body || !foot) return;
    body.innerHTML = cartHtml();
    foot.innerHTML = cartItems.length ?
      '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesCartSubmit">提交订单</button>' :
      '<button class="sales-btn" data-close>关闭</button>';
    bindCartModalEvents();
  }

  function changeCartQty(id, nextQty) {
    var item = cartItems.find(function (row) { return row.cartKey === id; });
    if (!item) return;
    item.qty = Math.max(1, Number(nextQty || 1));
    saveCart();
    refreshCartModal();
  }

  function removeCartItem(id) {
    cartItems = cartItems.filter(function (item) { return item.cartKey !== id; });
    saveCart();
    refreshCartModal();
  }

  function bindCartModalEvents() {
    var body = document.getElementById("salesModalBody");
    if (body) {
      body.querySelectorAll("[data-cart-qty]").forEach(function (input) {
        input.addEventListener("change", function () {
          changeCartQty(input.getAttribute("data-cart-qty"), input.value);
        });
      });
      body.querySelectorAll("[data-qty-step]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-qty-step");
          var input = body.querySelector('[data-cart-qty="' + CSS.escape(id) + '"]');
          var next = Math.max(1, Number(input && input.value || 1) + Number(btn.getAttribute("data-step") || 0));
          changeCartQty(id, next);
        });
      });
      body.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          removeCartItem(btn.getAttribute("data-cart-remove"));
        });
      });
    }
    var submit = document.getElementById("salesCartSubmit");
    if (submit) submit.addEventListener("click", function () {
      toast("订单已提交（演示）");
      closeModal();
    });
  }

  function openCartModal() {
    saveCart();
    var foot = cartItems.length ?
      '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesCartSubmit">提交订单</button>' :
      '<button class="sales-btn" data-close>关闭</button>';
    openModal("购物车", cartHtml(), foot, "wide");
    setModalHeadAction("流程进度", openSalesFlowModal);
    bindCartModalEvents();
  }

  function orderSummary(order) {
    return order.materials.map(function (item) {
      return item.productName + "×" + item.qty;
    }).join("、");
  }

  function normalizeOrderMaterial(item) {
    item = item || {};
    var productName = item.productName || item.materialName || item.name || item.typeName || "—";
    var productCode = item.productCode || item.code || item.b || item.materialCode || "—";
    var model = item.model || item.spec || item.productModel || "—";
    var manufacturer = item.manufacturer || item.mfrName || item.supplier || "—";
    var typeCode = item.typeCode || item.a || item.materialTypeCode || "—";
    var typeName = item.typeName || item.materialTypeName || item.categoryName || productName || "—";
    var category = item.category || item.materialCategory || item.className || "—";
    var qty = item.qty != null ? item.qty : (item.purchaseQty != null ? item.purchaseQty : (item.count != null ? item.count : "—"));
    var price = item.price != null ? item.price : (item.unitPrice != null ? item.unitPrice : item.refPrice);
    var subtotal = item.subtotal != null ? item.subtotal : (item.total != null ? item.total : (item.totalAmount != null ? item.totalAmount : (Number(price || 0) * Number(qty || 0))));
    return {
      id: item.id || item.itemId || productCode,
      productName: productName,
      productCode: productCode,
      model: model,
      manufacturer: manufacturer,
      typeCode: typeCode,
      typeName: typeName,
      category: category,
      qty: qty,
      price: price,
      subtotal: subtotal,
      features: item.features || []
    };
  }

  function orderMaterialRows(order) {
    var materials = Array.isArray(order.materials) ? order.materials.map(normalizeOrderMaterial) : [];
    return materials.map(function (item, idx) {
      var meta = productMetaLookup(item);
      var product = meta.primary || {};
      return {
        seq: idx + 1,
        id: item.id,
        productName: item.productName,
        code: item.productCode,
        model: item.model,
        mfrName: item.manufacturer,
        typeCode: item.typeCode,
        typeName: item.typeName,
        category: item.category,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
        features: Array.isArray(item.features) && item.features.length ? item.features : materialFeatureCells(product)
      };
    });
  }

  function orderMaterialsTableHtml(order, withTrack) {
    var rows = orderMaterialRows(order);
    return materialLineTableHtml(rows, { trackOrder: withTrack ? order.orderNo : "" });
  }

  function orderBaseFieldsHtml(order, includeRemark) {
    return '<div class="sales-form-grid sales-form-grid--spaced">' +
      '<div class="sales-field"><label>购买总数量</label><input readonly value="' + esc(order.totalQty) + '"></div>' +
      '<div class="sales-field"><label>订单总金额</label><input readonly value="' + moneyYuan(order.totalAmount) + '"></div>' +
      '<div class="sales-field"><label>订单编号</label><input readonly value="' + esc(order.orderNo) + '"></div>' +
      '<div class="sales-field"><label>订单状态</label><input readonly value="' + esc(order.status) + '"></div>' +
      '<div class="sales-field"><label>下单人</label><input readonly value="' + esc(order.requester) + '"></div>' +
      '<div class="sales-field"><label>下单公司</label><input readonly value="' + esc(order.company) + '"></div>' +
      '<div class="sales-field"><label>收货单位</label><input readonly value="' + esc(order.receiverCompany) + '"></div>' +
      '<div class="sales-field"><label>场站名称</label><input readonly value="' + esc(order.station) + '"></div>' +
      '<div class="sales-field"><label>物资所属部门</label><input readonly value="' + esc(order.owningDept) + '"></div>' +
      '<div class="sales-field"><label>下单日期</label><input readonly value="' + esc(order.orderDate) + '"></div>' +
      '<div class="sales-field"><label>发货/销售路径</label><input readonly value="' + esc(order.route) + '"></div>' +
      '<div class="sales-field"><label>当前处理人</label><input readonly value="' + esc(order.handler) + '"></div>' +
      '<div class="sales-field"><label>销售合同编号</label><input readonly value="' + esc(order.contractNo) + '"></div>' +
      '<div class="sales-field"><label>物流单号</label><input readonly value="' + esc(order.waybillNo) + '"></div>' +
      '<div class="sales-field"><label>发货日期</label><input readonly value="' + esc(order.shipDate) + '"></div>' +
      '<div class="sales-field"><label>收货日期</label><input readonly value="' + esc(order.receiveDate) + '"></div>' +
      (includeRemark ? '<div class="sales-field sales-field--full"><label>备注</label><textarea readonly>' + esc(textOrDash(order.remark)) + '</textarea></div>' : "") +
      '</div>';
  }

  function orderDetailHtml(order) {
    order = patchOrderMaterials(Object.assign({}, order));
    return '<div class="sales-section-title">订单物资明细表</div>' + orderMaterialsTableHtml(order, true) +
      orderBaseFieldsHtml(order, true);
  }

  function orderTrackHtml(order, item) {
    order = patchOrderMaterials(Object.assign({}, order));
    item = normalizeOrderMaterial(item);
    return '<div class="sales-detail-head">' +
      '<div class="sales-detail-card"><div class="sales-detail-label">订单编号</div><div class="sales-detail-value">' + esc(order.orderNo) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">产品名称</div><div class="sales-detail-value">' + esc(item.productName) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">场站名称</div><div class="sales-detail-value">' + esc(order.station) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">当前订单状态</div><div class="sales-detail-value">' + esc(order.status) + '</div></div>' +
      '</div><table class="sales-detail-table"><tbody>' +
      '<tr><th>下单公司</th><td>' + esc(order.company) + '</td><th>收货单位</th><td>' + esc(order.receiverCompany) + '</td></tr>' +
      '<tr><th>物资所属部门</th><td>' + esc(order.owningDept) + '</td><th>购买数量</th><td>' + esc(item.qty) + '</td></tr>' +
      '<tr><th>发货路径</th><td>' + esc(order.route) + '</td><th>销售合同编号</th><td>' + esc(order.contractNo) + '</td></tr>' +
      '</tbody></table><div class="sales-section-title">订单物资明细表</div>' + orderMaterialsTableHtml(order, false) +
      '<div class="sales-section-title">物资跟踪</div><div class="sales-track">' + orderTrackTimelineHtml(order, item) + '</div>';
  }

  function openOrderDetail(order) {
    order = patchOrderMaterials(Object.assign({}, order));
    openModal("查看订单 - " + order.orderNo, orderDetailHtml(order), '<button class="sales-btn" data-close>关闭</button>', "wide");
    setModalHeadAction("流程进度", openSalesFlowModal);
  }

  function openOrderTrack(orderNo, itemId) {
    var order = orderMap[orderNo];
    if (!order) return;
    order = patchOrderMaterials(Object.assign({}, order));
    var item = order.materials.find(function (row) { return row.id === itemId; });
    if (!item) return;
    openModal("物资跟踪 - " + item.productName, orderTrackHtml(order, item), '<button class="sales-btn" data-close>关闭</button>', "wide");
    setModalHeadAction("流程进度", openSalesFlowModal);
  }

  function openOrderFirstTrack(orderNo) {
    var order = orderMap[orderNo];
    if (!order) return;
    order = patchOrderMaterials(Object.assign({}, order));
    var item = order.materials && order.materials[0];
    if (!item) return;
    openOrderTrack(orderNo, item.id);
  }

  function openOrderApproval(order) {
    order = patchOrderMaterials(Object.assign({}, order));
    openModal(
      "订单审核 - " + order.orderNo,
      '<div class="sales-section-title">订单物资明细表</div>' + orderMaterialsTableHtml(order, false) +
      orderBaseFieldsHtml(order, true) +
      '<div class="sales-section-title">审批信息</div><div class="sales-form-grid">' +
      '<div class="sales-field"><label>审批结论</label><select><option>同意</option><option>驳回</option></select></div>' +
      '<div class="sales-field sales-field--full"><label>审批意见</label><textarea>订单信息完整，物资明细与购买数量一致，同意进入合同签订环节。</textarea></div>' +
      '</div>',
      '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>确认提交</button>',
      "wide"
    );
    setModalHeadAction("流程进度", openSalesFlowModal);
  }

  function openUploadContract(order) {
    openModal(
      "签订销售合同 - " + order.orderNo,
      '<div class="sales-form-grid"><div class="sales-field"><label>订单编号</label><input readonly value="' + esc(order.orderNo) + '"></div><div class="sales-field"><label>销售合同编号</label><input placeholder="请输入销售合同编号"></div><div class="sales-field sales-field--full"><label>合同附件</label><input type="file"></div></div>',
      '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>确认签订</button>',
      true
    );
    setModalHeadAction("流程进度", openSalesFlowModal);
  }

  function openShipOrder(order) {
    var needsContract = !order.contractNo || order.contractNo === "—";
    var contractTip = needsContract ? '<div class="sales-inline-tip">请先补充销售合同信息，再继续填写发货信息。</div>' : "";
    openModal(
      "安排发货 - " + order.orderNo,
      contractTip + '<table class="sales-detail-table"><tbody>' +
      '<tr><th>下单公司</th><td>' + esc(order.company) + '</td><th>场站名称</th><td>' + esc(order.station) + '</td></tr>' +
      '<tr><th>物资所属部门</th><td>' + esc(order.owningDept) + '</td><th>发货路径</th><td>' + esc(order.route) + '</td></tr>' +
      '</tbody></table><div class="sales-section-title">销售合同信息</div>' +
      '<div class="sales-form-grid">' +
      '<div class="sales-field"><label>订单编号</label><input readonly value="' + esc(order.orderNo) + '"></div>' +
      '<div class="sales-field"><label>销售合同编号</label><input placeholder="请输入销售合同编号"></div>' +
      '<div class="sales-field sales-field--full"><label>销售合同附件</label><input type="file"></div>' +
      '</div><div class="sales-section-title">发货信息</div>' +
      '<div class="sales-form-grid">' +
      '<div class="sales-field"><label>物流单号</label><input placeholder="请输入物流单号"></div>' +
      '<div class="sales-field"><label>发货日期</label><input type="date"></div>' +
      '<div class="sales-field"><label>发货部门</label><input placeholder="请输入发货部门"></div>' +
      '<div class="sales-field"><label>发货人</label><input placeholder="请输入发货人"></div>' +
      '<div class="sales-field sales-field--full"><label>发货备注</label><textarea placeholder="请输入发货备注"></textarea></div>' +
      '</div>',
      '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>确认发货</button>'
    );
    setModalHeadAction("流程进度", openSalesFlowModal);
  }

  function orderFormHtml(materials) {
    var rows = materials && materials.length ? materials : [];
    var totalQty = rows.reduce(function (sum, row) { return sum + toNumber(row.qty); }, 0);
    var totalAmount = rows.reduce(function (sum, row) { return sum + toNumber(row.subtotal); }, 0);
    var materialTable = rows.length ? materialLineTableHtml(orderMaterialRows({ materials: rows.map(function (row, idx) {
        return {
          id: row.id || ("tmp-" + idx),
          productName: row.productName,
          productCode: row.productCode || row.code,
          model: row.model,
          manufacturer: row.manufacturer || row.mfrName,
          typeCode: row.typeCode,
          typeName: row.typeName,
          category: row.category,
          qty: row.qty,
          price: row.price,
          subtotal: row.subtotal
        };
      }) }), { editable: true, qtyAttr: "data-order-qty", stepAttr: "data-order-qty-step" }) : '<div class="sales-empty">暂无物资，请从物资列表中选择产品后下单。</div>';
    return '<div class="sales-section-title">订单物资明细表</div>' +
      materialTable +
      '<div class="sales-form-grid sales-form-grid--spaced">' +
      '<div class="sales-field"><label>购买总数量</label><input readonly value="' + esc(totalQty || "—") + '"></div>' +
      '<div class="sales-field"><label>订单总金额</label><input readonly value="' + (totalQty ? moneyYuan(totalAmount) : "—") + '"></div>' +
      '<div class="sales-field"><label>订单编号</label><input readonly value="XSORD-2026-009"></div>' +
      '<div class="sales-field"><label>订单状态</label><input readonly value="待确认"></div>' +
      '<div class="sales-field"><label>下单人</label><input value="张明"></div>' +
      '<div class="sales-field"><label>下单公司</label><select><option>河北龙源</option><option>天津龙源</option><option>甘肃龙源</option></select></div>' +
      '<div class="sales-field"><label>收货单位</label><input value="山西龙源新能源有限公司"></div>' +
      '<div class="sales-field"><label>场站名称</label><input value="忻州风电场"></div>' +
      '<div class="sales-field"><label>物资所属部门</label><input value="电控所"></div>' +
      '<div class="sales-field"><label>下单日期</label><input type="date" value="2026-06-17"></div>' +
      '<div class="sales-field"><label>发货路径</label><select><option>工程技术公司发货</option><option>供应商直发</option></select></div>' +
      '<div class="sales-field"><label>当前处理人</label><input value="电控所负责人"></div>' +
      '<div class="sales-field"><label>销售合同编号</label><input readonly value="—"></div>' +
      '<div class="sales-field"><label>物流单号</label><input readonly value="—"></div>' +
      '<div class="sales-field"><label>期望发货日期</label><input type="date" value="2026-06-30"></div>' +
      '<div class="sales-field"><label>收货日期</label><input readonly value="—"></div>' +
      '<div class="sales-field sales-field--full"><label>订单备注</label><textarea placeholder="请输入订单备注"></textarea></div>' +
      '</div>';
  }

  function openOrderForm(product) {
    var materials = [];
    if (product) {
      materials.push({
        id: product.id,
        productName: product.productName,
        productCode: product.b,
        model: product.model,
        manufacturer: product.mfrName,
        typeCode: product.a,
        typeName: product.typeName,
        category: product.category,
        qty: 1,
        price: toNumber(product.refPrice),
        subtotal: toNumber(product.refPrice)
      });
    } else if (page === "orders") {
      materials.push({
        id: "new-order-m1",
        productName: "工业级交换机",
        productCode: "B00000006",
        model: "V2.0",
        manufacturer: "联合动力",
        typeCode: "A0200100001",
        typeName: "工业控制与通讯设备",
        category: "工业通讯",
        qty: 1,
        price: 2030.00,
        subtotal: 2030.00
      }, {
        id: "new-order-m2",
        productName: "通讯管理机",
        productCode: "B00000016",
        model: "CMU-V3",
        manufacturer: "联合动力",
        typeCode: "A0200100002",
        typeName: "工业控制与通讯设备",
        category: "工业通讯",
        qty: 2,
        price: 2050.00,
        subtotal: 4100.00
      });
    }
    orderDraftMaterials = materials;
    openModal("新增订单", orderFormHtml(orderDraftMaterials), '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesSubmitOrder">提交订单</button>', "wide");
    bindOrderFormEvents();
  }

  function refreshOrderFormModal() {
    var body = document.getElementById("salesModalBody");
    var foot = document.getElementById("salesModalFoot");
    if (!body || !foot) return;
    body.innerHTML = orderFormHtml(orderDraftMaterials);
    foot.innerHTML = '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesSubmitOrder">提交订单</button>';
    bindOrderFormEvents();
  }

  function changeOrderDraftQty(id, nextQty) {
    var item = orderDraftMaterials.find(function (row) { return String(row.id) === String(id); });
    if (!item) return;
    item.qty = Math.max(1, Number(nextQty || 1));
    item.subtotal = toNumber(item.price) * item.qty;
    refreshOrderFormModal();
  }

  function bindOrderFormEvents() {
    var body = document.getElementById("salesModalBody");
    if (body) {
      body.querySelectorAll("[data-order-qty]").forEach(function (input) {
        input.addEventListener("change", function () {
          changeOrderDraftQty(input.getAttribute("data-order-qty"), input.value);
        });
      });
      body.querySelectorAll("[data-order-qty-step]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-order-qty-step");
          var input = body.querySelector('[data-order-qty="' + CSS.escape(id) + '"]');
          var next = Math.max(1, Number(input && input.value || 1) + Number(btn.getAttribute("data-step") || 0));
          changeOrderDraftQty(id, next);
        });
      });
    }
    var ok = document.getElementById("salesSubmitOrder");
    if (ok) ok.addEventListener("click", function () {
      toast("订单已提交（演示）");
      closeModal();
    });
  }

  var orders = [
    {
      orderNo: "XSORD-2026-001",
      requester: "张明",
      company: "河北龙源",
      receiverCompany: "河北龙源新能源有限公司",
      station: "麒麟山风电场",
      owningDept: "电控所",
      orderDate: "2026-06-10",
      route: "供应商直发",
      totalQty: 4,
      totalAmount: 125.00,
      status: "待确认",
      handler: "电控所负责人",
      contractNo: "—",
      waybillNo: "—",
      shipDate: "—",
      receiveDate: "—",
      remark: "用于麒麟山风电场整机与叶片补充采购。",
      materials: [
        { id: "ord1-m1", productName: "风力发电机组整机", productCode: "B00000001", model: "GW66-1500", manufacturer: "联合动力", typeCode: "A010010001", typeName: "风力发电机组整机", category: "风机整机", qty: 1, price: 98.00, subtotal: 98.00 },
        { id: "ord1-m2", productName: "叶片", productCode: "B00000005", model: "SW64-2.0", manufacturer: "中材科技", typeCode: "A010020001", typeName: "叶片", category: "风机叶片", qty: 3, price: 9.00, subtotal: 27.00 }
      ]
    },
    {
      orderNo: "XSORD-2026-002",
      requester: "李芳",
      company: "天津龙源",
      receiverCompany: "天津龙源新能源有限公司",
      station: "沙井子风电场",
      owningDept: "电控所",
      orderDate: "2026-06-12",
      route: "工程技术公司发货",
      totalQty: 3,
      totalAmount: 92.00,
      status: "待签订合同",
      handler: "机械所发货专责",
      contractNo: "—",
      waybillNo: "—",
      shipDate: "—",
      receiveDate: "—",
      remark: "机舱和附件按销售合同统一发货。",
      materials: [
        { id: "ord2-m1", productName: "机舱", productCode: "B00000008", model: "YJ-NAC-3.0", manufacturer: "远景能源", typeCode: "A010030001", typeName: "机舱", category: "风机机舱", qty: 1, price: 80.00, subtotal: 80.00 },
        { id: "ord2-m2", productName: "机舱附件包", productCode: "B00000012", model: "NAC-AUX-V1", manufacturer: "远景能源", typeCode: "A010030099", typeName: "机舱附件", category: "风机机舱", qty: 2, price: 6.00, subtotal: 12.00 }
      ]
    },
    {
      orderNo: "XSORD-2026-003",
      requester: "王宁",
      company: "甘肃龙源",
      receiverCompany: "甘肃龙源新能源有限公司",
      station: "酒泉场站",
      owningDept: "电控所",
      orderDate: "2026-06-14",
      route: "供应商直发",
      totalQty: 6,
      totalAmount: 12.20,
      status: "已发货",
      handler: "项目公司收货人",
      contractNo: "XSHT-2026-003",
      waybillNo: "WL2026061401",
      shipDate: "2026-06-15",
      receiveDate: "—",
      remark: "工业级交换机按订单一次性发运至酒泉场站。",
      materials: [
        { id: "ord3-m1", productName: "工业级交换机", productCode: "B00000006", model: "V2.0", manufacturer: "联合动力", typeCode: "A0200100001", typeName: "工业控制与通讯设备", category: "工业通讯", qty: 6, price: 2.03, subtotal: 12.18 }
      ]
    }
  ];

  orders.forEach(function (order) {
    patchOrderMaterials(order);
    orderMap[order.orderNo] = order;
  });

  function initMaterialList() {
    if (!D) return;
    var tree = D.getClassTree();
    var selected = { big: "A01", mid: "01", small: "001" };
    var qTree = "";
    var qProduct = "";
    var qMfr = "";
    var qStock = "";
    var treeEl = document.getElementById("salesTree");
    var tbody = document.getElementById("salesProductBody");
    var head = document.getElementById("salesProductHead");

    function match(text) {
      return !qTree || String(text || "").toLowerCase().indexOf(qTree) >= 0;
    }

    function renderTree() {
      function renderSmall(big, mid, small) {
        var active = selected.big === big.code && selected.mid === mid.code && selected.small === small.code;
        if (!match(small.code + small.name + small.a) && qTree) return "";
        return '<div class="sales-tree-row ' + (active ? "is-active" : "") + '" data-tree="small" data-big="' + esc(big.code) + '" data-mid="' + esc(mid.code) + '" data-small="' + esc(small.code) + '"><span style="width:22px"></span><span>' + esc(small.code + " " + small.name) + "</span></div>";
      }
      function renderMid(big, mid) {
        var children = (mid.children || []).map(function (small) { return renderSmall(big, mid, small); }).join("");
        if (!match(mid.code + mid.name) && !children && qTree) return "";
        return '<div class="sales-tree-row" data-tree="mid" data-big="' + esc(big.code) + '" data-mid="' + esc(mid.code) + '"><button class="sales-tree-toggle" data-toggle="mid" data-big="' + esc(big.code) + '" data-mid="' + esc(mid.code) + '">' + (mid.open ? "▾" : "▸") + '</button><span>' + esc(mid.code + " " + mid.name) + '</span></div>' +
          '<div style="margin-left:18px;display:' + (mid.open ? "block" : "none") + '">' + children + "</div>";
      }
      function renderBig(big) {
        var children = (big.children || []).map(function (mid) { return renderMid(big, mid); }).join("");
        if (!match(big.code + big.name) && !children && qTree) return "";
        return '<div class="sales-tree-row" data-tree="big" data-big="' + esc(big.code) + '"><button class="sales-tree-toggle" data-toggle="big" data-big="' + esc(big.code) + '">' + (big.open ? "▾" : "▸") + '</button><span>' + esc(big.code + " " + big.name) + '</span></div>' +
          '<div style="margin-left:18px;display:' + (big.open ? "block" : "none") + '">' + children + "</div>";
      }
      treeEl.innerHTML = tree.map(renderBig).join("") || '<div class="sales-empty">无匹配节点</div>';
    }

    function currentSmall() {
      return D.findSmall(selected.big, selected.mid, selected.small);
    }

    function featureCols(rows) {
      var seen = {};
      rows.forEach(function (product) {
        var features = product.features || {};
        for (var i = 1; i <= 6; i++) {
          if (features["f" + i + "_name"] || features["f" + i]) seen[i] = 1;
        }
      });
      return Object.keys(seen).map(Number).filter(function (idx) {
        var sample = rows.find(function (product) {
          return product.features && product.features["f" + idx + "_name"];
        });
        var name = sample && sample.features ? sample.features["f" + idx + "_name"] : "";
        return !/制造商名称|制造商型号|产品型号/.test(name);
      }).slice(0, 4);
    }

    function rowsForSelection() {
      var meta = currentSmall();
      var rows = (D.ensureDemoProducts()[D.catKey(selected.big, selected.mid, selected.small)] || []).map(function (item) {
        return D.normalizeProduct(item, meta);
      });
      return rows.filter(function (product) {
        var haystack = (product.productName + product.b + product.model + product.mfrName).toLowerCase();
        if (qProduct && haystack.indexOf(qProduct) < 0) return false;
        if (qMfr && product.mfrName !== qMfr) return false;
        if (qStock === "有库存" && Number(product.stockQty) <= 0) return false;
        if (qStock === "无库存" && Number(product.stockQty) > 0) return false;
        return true;
      });
    }

    function renderProducts() {
      var rows = rowsForSelection();
      var cols = featureCols(rows);
      head.innerHTML = '<tr><th>产品名称</th><th>制造商名称</th><th>产品型号</th><th>产品编码</th><th>库存数量</th>' +
        cols.map(function (_, idx) { return "<th>特征值" + (idx + 1) + "</th>"; }).join("") +
        "<th>操作</th></tr>";
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (6 + cols.length) + '" class="sales-empty">暂无销售类物资</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(function (product) {
        return '<tr data-product="' + esc(JSON.stringify(product)) + '">' +
          "<td>" + esc(product.productName) + "</td>" +
          "<td>" + esc(product.mfrName) + "</td>" +
          "<td>" + esc(product.model) + "</td>" +
          "<td>" + esc(product.b) + "</td>" +
          "<td>" + esc(product.stockQty) + "</td>" +
          cols.map(function (idx) { return "<td>" + esc(featureText(product, idx)) + "</td>"; }).join("") +
          '<td><span class="sales-op-row">' +
          iconBtn("plus", "加购", "cart", product.id) +
          iconBtn("order", "直接下单", "direct", product.id) +
          iconBtn("view", "查看", "view-product", product.id) +
          "</span></td></tr>";
      }).join("");
    }

    function productFromButton(btn) {
      var row = btn && btn.closest ? btn.closest("tr[data-product]") : null;
      if (!row) return null;
      try {
        return JSON.parse(row.getAttribute("data-product") || "{}");
      } catch (eProduct) {
        return null;
      }
    }

    treeEl.addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-toggle]");
      if (toggle) {
        var big = tree.find(function (item) { return item.code === toggle.getAttribute("data-big"); });
        if (!big) return;
        if (toggle.getAttribute("data-toggle") === "big") big.open = !big.open;
        else {
          var mid = (big.children || []).find(function (item) {
            return item.code === toggle.getAttribute("data-mid");
          });
          if (mid) mid.open = !mid.open;
        }
        renderTree();
        return;
      }
      var row = e.target.closest('[data-tree="small"]');
      if (!row) return;
      selected.big = row.getAttribute("data-big");
      selected.mid = row.getAttribute("data-mid");
      selected.small = row.getAttribute("data-small");
      renderTree();
      renderProducts();
    });

    document.getElementById("salesTreeSearch").addEventListener("input", function () {
      qTree = String(this.value || "").toLowerCase();
      renderTree();
    });

    document.getElementById("salesMaterialQuery").addEventListener("click", function () {
      qProduct = String(document.getElementById("salesProductKeyword").value || "").toLowerCase();
      qMfr = document.getElementById("salesMfrFilter").value || "";
      qStock = document.getElementById("salesStockFilter").value || "";
      renderProducts();
    });

    document.getElementById("salesMaterialReset").addEventListener("click", function () {
      document.getElementById("salesProductKeyword").value = "";
      document.getElementById("salesMfrFilter").value = "";
      document.getElementById("salesStockFilter").value = "";
      qProduct = "";
      qMfr = "";
      qStock = "";
      renderProducts();
    });

    document.getElementById("salesCartBtn").addEventListener("click", openCartModal);

    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var product = productFromButton(btn);
      if (!product) return;
      var action = btn.getAttribute("data-action");
      if (action === "view-product") openModal("查看物资", productDetailHtml(product), '<button class="sales-btn" data-close>关闭</button>');
      if (action === "cart") openAddCartModal(product);
      if (action === "direct") openOrderForm(product);
    });

    renderTree();
    renderProducts();
    updateCartButton();
  }

  function initOrders() {
    var tbody = document.getElementById("salesOrderBody");

    function render() {
      tbody.innerHTML = orders.map(function (order) {
        var ops = iconBtn("view", "查看", "view-order", order.orderNo);
        if (order.status === "待确认") ops += iconBtn("check", "确认/审核", "approve-order", order.orderNo);
        if (order.status === "待签订合同") ops += iconBtn("upload", "签订合同", "upload-contract", order.orderNo);
        if (order.status === "待发货") ops += iconBtn("truck", "发货", "ship-order", order.orderNo);
        return "<tr>" +
          "<td>" + esc(order.orderNo) + "</td>" +
          "<td>" + esc(order.requester) + "</td>" +
          "<td>" + esc(order.company) + "</td>" +
          "<td>" + esc(order.station) + "</td>" +
          "<td>" + esc(order.orderDate) + "</td>" +
          "<td>" + esc(orderSummary(order)) + "</td>" +
          "<td>" + esc(order.totalQty) + "</td>" +
          "<td>" + money(order.totalAmount) + "</td>" +
          "<td>" + tag(order.status) + "</td>" +
          "<td>" + esc(order.handler) + "</td>" +
          "<td>" + esc(order.contractNo) + "</td>" +
          "<td>" + esc(order.waybillNo) + "</td>" +
          "<td>" + esc(order.shipDate) + "</td>" +
          "<td>" + esc(order.receiveDate) + "</td>" +
          "<td>" + esc(order.route) + "</td>" +
          '<td><span class="sales-op-row">' + ops + "</span></td>" +
          "</tr>";
      }).join("");
    }

    var orderAdd = document.getElementById("salesOrderAdd");
    if (orderAdd) orderAdd.addEventListener("click", function () {
      openOrderForm(null);
    });
    document.getElementById("salesOrderQuery").addEventListener("click", function () {
      toast("已按条件查询订单（演示）");
    });
    document.getElementById("salesOrderReset").addEventListener("click", function () {
      toast("已重置筛选条件（演示）");
    });

    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var order = orderMap[btn.getAttribute("data-id")];
      if (!order) return;
      var action = btn.getAttribute("data-action");
      if (action === "view-order") openOrderDetail(order);
      if (action === "approve-order") openOrderApproval(order);
      if (action === "upload-contract") openUploadContract(order);
      if (action === "ship-order") openShipOrder(order);
      if (action === "track-order") openOrderFirstTrack(order.orderNo);
    });

    render();
  }

  var purchasedSummaries = [
    {
      typeCode: "A020010000",
      typeName: "工业控制与通讯设备",
      productKinds: 2,
      totalQty: 14,
      totalAmount: 28580.00,
      orderCount: 2,
      latestReceiveDate: "2026-06-15",
      mainStation: "酒泉场站",
      details: [
        { id: "pur1-d1", productName: "工业级交换机", materialCode: "A0200100001", productCode: "B00000006", spec: "V2.0", manufacturer: "联合动力", company: "甘肃龙源", station: "酒泉场站", orderNo: "XSORD-2026-003", contractNo: "XSHT-2026-003", qty: 6, amount: 12180.00, receiveDate: "2026-06-15", location: "酒泉场站库房", usageStatus: "库存中" },
        { id: "pur1-d2", productName: "通讯管理机", materialCode: "A0200100002", productCode: "B00000016", spec: "CMU-V3", manufacturer: "联合动力", company: "甘肃龙源", station: "酒泉场站", orderNo: "XSORD-2026-008", contractNo: "XSHT-2026-008", qty: 8, amount: 16400.00, receiveDate: "2026-06-13", location: "酒泉场站二级库", usageStatus: "库存中" }
      ]
    },
    {
      typeCode: "A010020000",
      typeName: "风机叶片",
      productKinds: 2,
      totalQty: 5,
      totalAmount: 450000.00,
      orderCount: 2,
      latestReceiveDate: "2026-06-13",
      mainStation: "麒麟山风电场",
      details: [
        { id: "pur2-d1", productName: "叶片", materialCode: "A0100200001", productCode: "B00000005", spec: "SW64-2.0", manufacturer: "中材科技", company: "河北龙源", station: "麒麟山风电场", orderNo: "XSORD-2026-004", contractNo: "XSHT-2026-004", qty: 3, amount: 270000.00, receiveDate: "2026-06-13", location: "麒麟山风电场露天区", usageStatus: "库存中" },
        { id: "pur2-d2", productName: "备用叶片", materialCode: "A0100200002", productCode: "B00000018", spec: "SW70-3.0", manufacturer: "中材科技", company: "河北龙源", station: "麒麟山风电场", orderNo: "XSORD-2026-006", contractNo: "XSHT-2026-006", qty: 2, amount: 180000.00, receiveDate: "2026-06-11", location: "麒麟山风电场备件区", usageStatus: "库存中" }
      ]
    }
  ];

  purchasedSummaries.forEach(function (item) {
    patchPurchasedSummary(item);
    purchasedMap[item.typeCode] = item;
  });

  function purchasedDetailsTableHtml(summary, withTrack) {
    var details = expandPurchasedDetails(summary);
    return '<div class="sales-table-wrap sales-modal-table-wrap"><table class="sales-table sales-modal-table" style="min-width:1720px"><thead><tr><th>序号</th><th>C码</th><th>产品名称</th><th>物资编码</th><th>产品编码</th><th>规格型号</th><th>制造商名称</th><th>下单公司</th><th>场站名称</th><th>订单编号</th><th>销售合同编号</th><th>收货日期</th><th>存放地点</th><th>使用状态</th><th>操作</th></tr></thead><tbody>' +
      (details.length ? details.map(function (row, idx) {
        return "<tr>" +
          "<td>" + (idx + 1) + "</td>" +
          "<td>" + esc(textOrDash(row.unitCode)) + "</td>" +
          "<td>" + esc(textOrDash(row.productName)) + "</td>" +
          "<td>" + esc(textOrDash(row.materialCode)) + "</td>" +
          "<td>" + esc(textOrDash(row.productCode)) + "</td>" +
          "<td>" + esc(textOrDash(row.spec)) + "</td>" +
          "<td>" + esc(textOrDash(row.manufacturer)) + "</td>" +
          "<td>" + esc(textOrDash(row.company)) + "</td>" +
          "<td>" + esc(textOrDash(row.station)) + "</td>" +
          "<td>" + esc(textOrDash(row.orderNo)) + "</td>" +
          "<td>" + esc(textOrDash(row.contractNo)) + "</td>" +
          "<td>" + esc(textOrDash(row.receiveDate)) + "</td>" +
          "<td>" + esc(textOrDash(row.location)) + "</td>" +
          "<td>" + tag(row.usageStatus) + "</td>" +
          "<td>" + (withTrack ? '<button type="button" class="sales-inline-link" data-modal-action="purchased-track" data-type="' + esc(summary.typeCode) + '" data-item="' + esc(row.id) + '">物资跟踪</button>' : "—") + "</td>" +
          "</tr>";
      }).join("") : '<tr><td colspan="15" class="sales-empty">暂无购入物资明细数据</td></tr>') +
      "</tbody></table></div>";
  }

  function purchasedDetailHtml(summary) {
    summary = patchPurchasedSummary(Object.assign({}, summary));
    return '<div class="sales-section-title">购入物资明细表</div>' + purchasedDetailsTableHtml(summary, true) +
      '<div class="sales-form-grid sales-form-grid--spaced">' +
      '<div class="sales-field"><label>物资类型编码</label><input readonly value="' + esc(summary.typeCode) + '"></div>' +
      '<div class="sales-field"><label>物资类型名称</label><input readonly value="' + esc(summary.typeName) + '"></div>' +
      '<div class="sales-field"><label>购入总数量</label><input readonly value="' + esc(summary.totalQty) + '"></div>' +
      '<div class="sales-field"><label>关联订单数</label><input readonly value="' + esc(summary.orderCount) + '"></div>' +
      '<div class="sales-field"><label>物资总价</label><input readonly value="' + moneyYuan(summary.totalAmount) + '"></div>' +
      '<div class="sales-field"><label>最新收货日期</label><input readonly value="' + esc(summary.latestReceiveDate) + '"></div>' +
      '<div class="sales-field"><label>主要场站</label><input readonly value="' + esc(summary.mainStation) + '"></div>' +
      '</div>';
  }

  function purchasedTrackHtml(summary, row) {
    summary = patchPurchasedSummary(Object.assign({}, summary));
    row = patchPurchasedSummary({ details: [Object.assign({}, row)], typeName: summary.typeName, typeCode: summary.typeCode, mainStation: summary.mainStation, latestReceiveDate: summary.latestReceiveDate }).details[0];
    return '<div class="sales-detail-head">' +
      '<div class="sales-detail-card"><div class="sales-detail-label">产品名称</div><div class="sales-detail-value">' + esc(row.productName) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">订单编号</div><div class="sales-detail-value">' + esc(row.orderNo) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">销售合同编号</div><div class="sales-detail-value">' + esc(row.contractNo) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">使用状态</div><div class="sales-detail-value">' + esc(row.usageStatus) + '</div></div>' +
      '</div><table class="sales-detail-table"><tbody>' +
      '<tr><th>下单公司</th><td>' + esc(row.company) + '</td><th>场站名称</th><td>' + esc(row.station) + '</td></tr>' +
      '<tr><th>购入数量</th><td>' + esc(row.qty) + '</td><th>存放地点</th><td>' + esc(row.location) + '</td></tr>' +
      '<tr><th>物资类型名称</th><td>' + esc(summary.typeName) + '</td><th>收货日期</th><td>' + esc(row.receiveDate) + '</td></tr>' +
      '</tbody></table><div class="sales-section-title">购入物资明细表</div>' + purchasedDetailsTableHtml(summary, true) +
      '<div class="sales-section-title">物资跟踪</div><div class="sales-track">' + purchasedTrackTimelineHtml(summary, row) + '</div>';
  }

  function openPurchasedDetail(summary) {
    summary = patchPurchasedSummary(Object.assign({}, summary));
    openModal("查看购入物资 - " + summary.typeName, purchasedDetailHtml(summary), '<button class="sales-btn" data-close>关闭</button>', "wide");
    setModalHeadAction("流程进度", openSalesFlowModal);
  }

  function initPurchased() {
    var tbody = document.getElementById("salesPurchasedBody");
    tbody.innerHTML = purchasedSummaries.map(function (summary, idx) {
      return "<tr>" +
        "<td>" + (idx + 1) + "</td>" +
        "<td>" + esc(summary.typeCode) + "</td>" +
        "<td>" + esc(summary.typeName) + "</td>" +
        "<td>" + money(summary.totalAmount) + "</td>" +
        "<td>" + esc(summary.totalQty) + "</td>" +
        '<td><span class="sales-op-row">' + iconBtn("view", "查看", "view-purchased", summary.typeCode) + "</span></td>" +
        "</tr>";
    }).join("");

    document.getElementById("salesPurchasedQuery").addEventListener("click", function () {
      toast("已按条件查询购入物资（演示）");
    });
    document.getElementById("salesPurchasedExport").addEventListener("click", function () {
      toast("已导出购入物资统计（演示）");
    });

    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var summary = purchasedMap[btn.getAttribute("data-id")];
      if (!summary) return;
      openPurchasedDetail(summary);
    });
  }

  var reportRows = patchReportRows([
    {
      orderNo: "XSORD-2026-001、XSORD-2026-005",
      contractNo: "XSHT-2026-001",
      contractName: "河北龙源风机备件销售合同",
      supplier: "联合动力",
      progress: "40%",
      totalAmount: 410.00,
      executedAmount: 164.00,
      remainingAmount: 246.00,
      signDate: "2026-05-20",
      term: "2026-05-20 ~ 2026-12-31",
      status: "部分执行",
      lines: [
        { orderNo: "XSORD-2026-001", company: "河北龙源", station: "麒麟山风电场", amount: 82.00, status: "已收货", date: "2026-06-10" },
        { orderNo: "XSORD-2026-005", company: "河北龙源", station: "麒麟山风电场", amount: 82.00, status: "已发货", date: "2026-06-14" }
      ]
    },
    {
      orderNo: "XSORD-2026-002",
      contractNo: "XSHT-2026-002",
      contractName: "天津龙源机舱销售合同",
      supplier: "远景能源",
      progress: "20%",
      totalAmount: 460.00,
      executedAmount: 92.00,
      remainingAmount: 368.00,
      signDate: "2026-05-28",
      term: "2026-05-28 ~ 2026-12-31",
      status: "部分执行",
      lines: [
        { orderNo: "XSORD-2026-002", company: "天津龙源", station: "沙井子风电场", amount: 92.00, status: "待发货", date: "2026-06-12" }
      ]
    },
    {
      orderNo: "XSORD-2026-003",
      contractNo: "XSHT-2026-003",
      contractName: "甘肃龙源网络设备销售合同",
      supplier: "联合动力",
      progress: "100%",
      totalAmount: 12.20,
      executedAmount: 12.20,
      remainingAmount: 0,
      signDate: "2026-06-01",
      term: "2026-06-01 ~ 2026-09-30",
      status: "已执行",
      lines: [
        { orderNo: "XSORD-2026-003", company: "甘肃龙源", station: "酒泉场站", amount: 12.20, status: "已发货", date: "2026-06-15" }
      ]
    }
  ]);

  reportRows.forEach(function (row) {
    reportMap[row.contractNo] = row;
  });

  function reportDetailHtml(report) {
    report = report || {};
    var lines = Array.isArray(report.lines) ? report.lines : [];
    return '<div class="sales-detail-head">' +
      '<div class="sales-detail-card"><div class="sales-detail-label">销售合同编号</div><div class="sales-detail-value">' + esc(report.contractNo) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">关联订单</div><div class="sales-detail-value">' + esc(report.orderNo) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">已执行金额</div><div class="sales-detail-value">' + money(report.executedAmount) + ' 万元</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">执行状态</div><div class="sales-detail-value">' + esc(report.status) + '</div></div>' +
      '</div><table class="sales-detail-table"><tbody>' +
      '<tr><th>合同名称</th><td>' + esc(report.contractName) + '</td><th>供应商</th><td>' + esc(report.supplier) + '</td></tr>' +
      '<tr><th>执行率</th><td>' + esc(report.progress) + '</td><th>合同金额</th><td>' + money(report.totalAmount) + ' 万元</td></tr>' +
      '<tr><th>剩余金额</th><td>' + money(report.remainingAmount) + ' 万元</td><th>签订日期</th><td>' + esc(report.signDate) + '</td></tr>' +
      '<tr><th>合同有效期</th><td colspan="3">' + esc(report.term) + '</td></tr>' +
      '</tbody></table><div class="sales-section-title">合同执行明细</div><table class="sales-table" style="min-width:980px"><thead><tr><th>订单编号</th><th>购买公司</th><th>场站名称</th><th>执行金额（万元）</th><th>执行状态</th><th>执行时间</th></tr></thead><tbody>' +
      lines.map(function (line) {
        return "<tr><td>" + esc(line.orderNo) + "</td><td>" + esc(line.company) + "</td><td>" + esc(line.station) + "</td><td>" + money(line.amount) + "</td><td>" + tag(line.status) + "</td><td>" + esc(line.date) + "</td></tr>";
      }).join("") +
      "</tbody></table>";
  }

  function reportAmountChartHtml(title, amount, total, color) {
    var percent = total ? Math.round(toNumber(amount) / total * 100) : 0;
    var barHeight = Math.max(8, Math.min(100, percent));
    return '<article class="sales-amount-chart">' +
      '<div class="sales-amount-chart-top"><span>' + esc(title) + '</span><strong>' + money(amount) + ' 万元</strong></div>' +
      '<div class="sales-amount-chart-visual">' +
      '<div class="sales-mini-bars"><span style="height:' + barHeight + '%;background:' + esc(color) + '"></span><i></i><i></i></div>' +
      '<div class="sales-mini-donut" style="background:conic-gradient(' + esc(color) + ' 0 ' + percent + '%,#edf2f7 ' + percent + '% 100%)"><b>' + percent + '%</b></div>' +
      '</div>' +
      '<div class="sales-amount-chart-meta">占合同总金额 ' + percent + '%</div>' +
      '</article>';
  }

  function initReport() {
    document.getElementById("salesReportBody").innerHTML = reportRows.map(function (row) {
      return "<tr>" +
        "<td>" + esc(row.orderNo) + "</td>" +
        "<td>" + esc(row.contractNo) + "</td>" +
        "<td>" + esc(row.contractName) + "</td>" +
        "<td>" + esc(row.supplier) + "</td>" +
        "<td>" + esc(row.progress) + "</td>" +
        "<td>" + money(row.totalAmount) + "</td>" +
        "<td>" + money(row.executedAmount) + "</td>" +
        "<td>" + money(row.remainingAmount) + "</td>" +
        "<td>" + esc(row.signDate) + "</td>" +
        "<td>" + esc(row.term) + "</td>" +
        "<td>" + tag(row.status) + "</td>" +
        '<td><span class="sales-op-row">' + iconBtn("view", "查看执行明细", "report-detail", row.contractNo) + "</span></td>" +
        "</tr>";
    }).join("");

    document.getElementById("salesReportQuery").addEventListener("click", function () {
      toast("已按条件更新销售合同报表（演示）");
    });
    document.getElementById("salesReportExport").addEventListener("click", function () {
      toast("已导出销售合同报表（演示）");
    });

    var totalAmount = reportRows.reduce(function (sum, row) { return sum + row.totalAmount; }, 0);
    var executedTotal = reportRows.reduce(function (sum, row) { return sum + row.executedAmount; }, 0);
    var remainingTotal = reportRows.reduce(function (sum, row) { return sum + row.remainingAmount; }, 0);
    document.getElementById("salesAmountCharts").innerHTML = [
      reportAmountChartHtml("全部执行金额", totalAmount, totalAmount, "#1677ff"),
      reportAmountChartHtml("已执行金额", executedTotal, totalAmount, "#16a34a"),
      reportAmountChartHtml("剩余执行金额", remainingTotal, totalAmount, "#f59e0b")
    ].join("");

    document.getElementById("salesReportBody").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var report = reportMap[btn.getAttribute("data-id")];
      if (!report) return;
      openModal("合同执行明细 - " + report.contractNo, reportDetailHtml(report), '<button class="sales-btn" data-close>关闭</button>', "wide");
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-modal-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-modal-action");
    if (action === "order-track") {
      openOrderTrack(btn.getAttribute("data-order"), btn.getAttribute("data-item"));
    }
    if (action === "purchased-track") {
      var summary = purchasedMap[btn.getAttribute("data-type")];
      if (!summary) return;
      var row = expandPurchasedDetails(summary).find(function (item) { return item.id === btn.getAttribute("data-item"); });
      if (!row) return;
      openModal("物资跟踪 - " + row.productName, purchasedTrackHtml(summary, row), '<button class="sales-btn" data-close>关闭</button>', "wide");
      setModalHeadAction("流程进度", openSalesFlowModal);
    }
  });

  if (page === "material-list") initMaterialList();
  if (page === "orders") initOrders();
  if (page === "purchased") initPurchased();
  if (page === "report") initReport();
})();
