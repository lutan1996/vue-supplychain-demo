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
  try {
    cartItems = JSON.parse(localStorage.getItem("salesCartItems") || "[]") || [];
  } catch (eCartStore) {
    cartItems = [];
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function toast(msg) {
    if (window.mapDemoToast) window.mapDemoToast(msg);
    else alert(msg);
  }
  function iconBtn(icon, title, action, id) {
    return '<button type="button" class="sales-icon-btn" title="' + esc(title) + '" data-action="' + esc(action) + '" data-id="' + esc(id || "") + '">' + ICONS[icon] + "</button>";
  }
  function tag(text) {
    var cls = "sales-tag";
    if (/已完成|已收货|已执行|在用|已购入/.test(text)) cls += " sales-tag-green";
    else if (/待|部分|未执行/.test(text)) cls += " sales-tag-orange";
    else if (/驳回/.test(text)) cls += " sales-tag-red";
    else cls += " sales-tag-blue";
    return '<span class="' + cls + '">' + esc(text) + "</span>";
  }
  function getProducts() {
    return D ? D.flattenAllProducts() : [];
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
  function openModal(title, body, foot, small) {
    var mask = ensureModal();
    var box = mask.querySelector(".sales-modal");
    box.classList.remove("sales-modal--small", "sales-modal--wide");
    if (small === "wide") box.classList.add("sales-modal--wide");
    else if (small) box.classList.add("sales-modal--small");
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
    mask.querySelectorAll(".sales-flow-tab").forEach(function (x) { x.classList.toggle("is-active", x === tab); });
    mask.querySelectorAll(".sales-flow-pane").forEach(function (x) { x.classList.toggle("is-active", x.getAttribute("data-pane") === key); });
  });

  function productDetailHtml(p) {
    var feats = p.features || {};
    var rows = [
      ["产品名称", p.productName],
      ["制造商名称", p.mfrName],
      ["产品型号", p.model],
      ["产品编码", p.b],
      ["物资类型编码", p.a],
      ["库存数量", p.stockQty],
      ["参考单价（万元）", p.refPrice || "—"]
    ];
    for (var i = 1; i <= 8; i++) {
      var k = "f" + i;
      var name = feats[k + "_name"];
      var val = feats[k];
      if (name || val) rows.push(["特征值" + i, (name && val ? name + "：" + val : name || val)]);
    }
    return '<table class="sales-table" style="min-width:0"><tbody>' + rows.map(function (r) {
      return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1] || "—") + "</td></tr>";
    }).join("") + "</tbody></table>";
  }
  function infoGridHtml(labels, row) {
    return '<div class="sales-form-grid">' + labels.map(function (k, i) {
      return '<div class="sales-field' + (String(row[i] || "").length > 22 ? " sales-field--full" : "") + '"><label>' + esc(k) + '</label><input readonly value="' + esc(row[i] || "—") + '"></div>';
    }).join("") + "</div>";
  }
  function purchasedDetailHtml(row) {
    return '<div class="sales-detail-head">' +
      '<div class="sales-detail-card"><div class="sales-detail-label">物资名称</div><div class="sales-detail-value">' + esc(row[5]) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">购入单号</div><div class="sales-detail-value">' + esc(row[0]) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">销售合同编号</div><div class="sales-detail-value">' + esc(row[9]) + '</div></div>' +
      '<div class="sales-detail-card"><div class="sales-detail-label">当前状态</div><div class="sales-detail-value">' + esc(row[17]) + '</div></div>' +
      '</div>' +
      '<div class="sales-section-title">基础信息</div>' +
      '<table class="sales-detail-table"><tbody>' +
      '<tr><th>订单编号</th><td>' + esc(row[1]) + '</td><th>下单公司</th><td>' + esc(row[2]) + '</td></tr>' +
      '<tr><th>场站名称</th><td>' + esc(row[3]) + '</td><th>存放地点</th><td>' + esc(row[16]) + '</td></tr>' +
      '<tr><th>物资编码</th><td>' + esc(row[4]) + '</td><th>产品编码</th><td>' + esc(row[7]) + '</td></tr>' +
      '<tr><th>规格型号</th><td>' + esc(row[6]) + '</td><th>制造商</th><td>' + esc(row[8]) + '</td></tr>' +
      '<tr><th>购入数量</th><td>' + esc(row[10] + row[11]) + '</td><th>购入金额</th><td>' + esc(row[13]) + '</td></tr>' +
      '<tr><th>收货日期</th><td>' + esc(row[14]) + '</td><th>物流单号</th><td>' + esc(row[15]) + '</td></tr>' +
      '</tbody></table>' +
      '<div class="sales-section-title">业务说明</div>' +
      '<table class="sales-detail-table"><tbody>' +
      '<tr><th>销售路径</th><td>销售管理订单确认后，由工程技术公司组织发货，项目公司完成收货确认。</td></tr>' +
      '<tr><th>台账口径</th><td>收货后形成项目公司购入物资台账，可继续追踪后续在用、调拨和退换货状态。</td></tr>' +
      '</tbody></table>';
  }
  function trackHtml(row) {
    var name = row[5];
    var code = row[4];
    var orderNo = row[1];
    return '<div class="sales-track">' +
      '<div class="sales-track-map">' +
      '<svg viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true"><path d="M120 260 C 275 108, 435 118, 565 178 S 805 250, 895 124" fill="none" stroke="#1689ff" stroke-width="7" stroke-linecap="round" stroke-dasharray="12 12"/></svg>' +
      '<div class="sales-track-point sales-track-point--start">发货地</div>' +
      '<div class="sales-track-point sales-track-point--current">当前位置</div>' +
      '<div class="sales-track-point sales-track-point--end">收货地</div>' +
      '</div>' +
      '<div class="sales-track-title">物资跟踪</div>' +
      '<div class="sales-track-item"><span class="sales-track-dot" style="background:#2563eb"></span><div><div class="sales-track-main">2026.4.20 入库：' + esc(name || "销售类物资") + '（' + esc(code || "—") + '）</div><div class="sales-track-sub">存放龙源工程技术公司中心库，形成可销售库存。</div></div></div>' +
      '<div class="sales-track-item"><span class="sales-track-dot" style="background:#10b981"></span><div><div class="sales-track-main">2026.6.10 项目公司下单</div><div class="sales-track-sub">关联订单：' + esc(orderNo || "XSORD-2026-003") + '，进入销售订单管理。</div></div></div>' +
      '<div class="sales-track-item"><span class="sales-track-dot" style="background:#6366f1"></span><div><div class="sales-track-main">2026.6.14 发货确认</div><div class="sales-track-sub">物流单号 WL2026061401，发货路径：直发现场/项目公司。</div></div></div>' +
      '<div class="sales-track-item"><span class="sales-track-dot" style="background:#f59e0b"></span><div><div class="sales-track-main">2026.6.15 项目公司收货</div><div class="sales-track-sub">状态更新为已购入，进入购入物资台账。</div></div></div>' +
      '</div>';
  }
  function updateCartButton() {
    var btn = document.getElementById("salesCartBtn");
    if (!btn) return;
    var total = cartItems.reduce(function (s, x) { return s + Number(x.qty || 0); }, 0);
    btn.innerHTML = '<svg class="sales-cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h15l-2 8H8L6 3H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="18" cy="20" r="1.6" fill="currentColor"/></svg>' + (total ? '<span class="sales-cart-count">' + total + '</span>' : "");
  }
  function saveCart() {
    try { localStorage.setItem("salesCartItems", JSON.stringify(cartItems)); } catch (eCartStore) {}
    updateCartButton();
  }
  function addToCart(product, qty) {
    var old = cartItems.find(function (x) { return x.id === product.id; });
    if (old) old.qty += qty;
    else cartItems.push({
      id: product.id,
      productName: product.productName,
      mfrName: product.mfrName,
      model: product.model,
      code: product.b,
      stockQty: product.stockQty,
      qty: qty
    });
    saveCart();
  }
  function openAddCartModal(product) {
    openModal("加购数量", '<div class="sales-qty-box"><div class="sales-field"><label>物资名称</label><input readonly value="' + esc(product.productName) + '"></div><div class="sales-field"><label>加购数量</label><input id="salesAddQty" type="number" min="1" value="1"></div></div>', '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesAddCartOk">确定</button>', true);
    var ok = document.getElementById("salesAddCartOk");
    if (ok) ok.addEventListener("click", function () {
      var qtyEl = document.getElementById("salesAddQty");
      var qty = Math.max(1, Number(qtyEl && qtyEl.value || 1));
      addToCart(product, qty);
      closeModal();
      toast("已加入购物车");
    });
  }
  function cartHtml() {
    if (!cartItems.length) return '<div class="sales-empty">暂无加购物资</div>';
    var total = cartItems.reduce(function (s, x) { return s + Number(x.qty || 0); }, 0);
    return '<div class="sales-cart-summary"><span>已加购 ' + cartItems.length + ' 类物资，共 ' + total + ' 件</span></div>' +
      '<table class="sales-cart-table"><thead><tr><th>序号</th><th>物资名称</th><th>制造商</th><th>规格型号</th><th>产品编码</th><th>库存数量</th><th>加购数量</th><th>操作</th></tr></thead><tbody>' +
      cartItems.map(function (x, i) {
        return '<tr data-cart-id="' + esc(x.id) + '"><td>' + (i + 1) + '</td><td>' + esc(x.productName) + '</td><td>' + esc(x.mfrName) + '</td><td>' + esc(x.model) + '</td><td>' + esc(x.code) + '</td><td>' + esc(x.stockQty) + '</td><td><div class="sales-cart-qty"><button type="button" data-cart-minus="' + esc(x.id) + '">-</button><input type="number" min="1" value="' + esc(x.qty) + '" data-cart-qty="' + esc(x.id) + '"><button type="button" data-cart-plus="' + esc(x.id) + '">+</button></div></td><td><button type="button" class="sales-cart-remove" data-cart-remove="' + esc(x.id) + '">删除</button></td></tr>';
      }).join("") + '</tbody></table>' +
      '<div class="sales-section-title">提交信息</div>' +
      '<div class="sales-form-grid"><div class="sales-field"><label>提交部门</label><input readonly value="电控所"></div><div class="sales-field"><label>收货单位</label><input readonly value="山西龙源"></div><div class="sales-field"><label>发货路径</label><select><option>工程技术公司发货</option><option>供应商直发</option></select></div><div class="sales-field"><label>期望发货日期</label><input type="date" value="2026-06-20"></div><div class="sales-field sales-field--full"><label>备注</label><textarea>销售类物资统一加购后提交审核。</textarea></div></div>';
  }
  function refreshCartModal() {
    var body = document.getElementById("salesModalBody");
    var foot = document.getElementById("salesModalFoot");
    if (!body || !foot) return;
    body.innerHTML = cartHtml();
    foot.innerHTML = cartItems.length ? '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesCartSubmit">确定提交</button>' : '<button class="sales-btn" data-close>关闭</button>';
    bindCartModalEvents();
  }
  function changeCartQty(id, nextQty) {
    var item = cartItems.find(function (x) { return x.id === id; });
    if (!item) return;
    item.qty = Math.max(1, Number(nextQty || 1));
    saveCart();
    refreshCartModal();
  }
  function removeCartItem(id) {
    cartItems = cartItems.filter(function (x) { return x.id !== id; });
    saveCart();
    refreshCartModal();
  }
  function bindCartModalEvents() {
    var body = document.getElementById("salesModalBody");
    if (body) {
      body.querySelectorAll("[data-cart-minus]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-cart-minus");
          var item = cartItems.find(function (x) { return x.id === id; });
          if (item) changeCartQty(id, Number(item.qty) - 1);
        });
      });
      body.querySelectorAll("[data-cart-plus]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-cart-plus");
          var item = cartItems.find(function (x) { return x.id === id; });
          if (item) changeCartQty(id, Number(item.qty) + 1);
        });
      });
      body.querySelectorAll("[data-cart-qty]").forEach(function (inp) {
        inp.addEventListener("change", function () { changeCartQty(inp.getAttribute("data-cart-qty"), inp.value); });
      });
      body.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () { removeCartItem(btn.getAttribute("data-cart-remove")); });
      });
    }
    var submit = document.getElementById("salesCartSubmit");
    if (submit) submit.addEventListener("click", function () {
      toast("已提交审核");
      closeModal();
    });
  }
  function openCartModal() {
    var foot = cartItems.length ? '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesCartSubmit">确定提交</button>' : '<button class="sales-btn" data-close>关闭</button>';
    openModal("购物车", cartHtml(), foot, "wide");
    if (cartItems.length) {
      var hd = document.querySelector("#salesModalMask .sales-modal-hd");
      var close = document.querySelector("#salesModalMask .sales-modal-close");
      if (hd && close) {
        var headBtn = document.createElement("button");
        headBtn.type = "button";
        headBtn.className = "sales-flow-link sales-modal-head-action";
        headBtn.id = "salesCartFlowBtn";
        headBtn.textContent = "流程进度";
        hd.insertBefore(headBtn, close);
      }
    }
    var flow = document.getElementById("salesCartFlowBtn");
    if (flow) flow.addEventListener("click", openSalesFlowModal);
    bindCartModalEvents();
  }
  function ensureSalesFlowModal() {
    var mask = document.getElementById("salesFlowMask");
    if (mask) return mask;
    mask = document.createElement("div");
    mask.id = "salesFlowMask";
    mask.className = "sales-flow-mask";
    var nodes = [
      "电控所从本部门所属“销售类”物资中选取物资进行销售提交订单",
      "电控所负责人同意",
      "签订销售合同",
      "电控所发货",
      "山西龙源收货，验收通过",
      "销售结束，系统上传销售合同",
      "流程结束"
    ];
    mask.innerHTML = '<div class="sales-flow-dialog" role="dialog" aria-label="审批记录">' +
      '<div class="sales-flow-hd"><span>审批记录</span><button type="button" class="sales-flow-close" data-sales-flow-close="1">&times;</button></div>' +
      '<div class="sales-flow-body"><div class="sales-flow-tabs"><button type="button" class="sales-flow-tab is-active" data-tab="flow">流程图</button><button type="button" class="sales-flow-tab" data-tab="info">审批信息</button></div>' +
      '<div class="sales-flow-pane is-active" data-pane="flow"><div class="sales-flow-track"><div class="sales-flow-row">' +
      nodes.map(function (n, i) {
        return (i === 0 ? '<span class="sales-flow-dot"></span>' : '<span class="sales-flow-arrow">→</span>') + '<span class="sales-flow-node' + (i === nodes.length - 1 ? " end" : "") + '">' + esc(n) + '</span>' + (i === nodes.length - 1 ? '<span class="sales-flow-dot end"></span>' : "");
      }).join("") +
      '</div></div></div><div class="sales-flow-pane" data-pane="info"><div class="sales-flow-info">' +
      '<p>1. 电控所物资专责从本部门所属销售类物资中选取物资，填写加购数量并提交销售订单。</p>' +
      '<p>2. 电控所负责人审核销售物资清单、库存数量和销售用途，审批结论：同意。</p>' +
      '<p>3. 经营人员与山西龙源完成销售合同签订，并登记销售合同编号。</p>' +
      '<p>4. 电控所依据合同安排发货，更新物流信息。</p>' +
      '<p>5. 山西龙源完成收货和验收，验收结论：通过。</p>' +
      '<p>6. 销售结束后系统上传销售合同，流程归档结束。</p>' +
      '</div></div></div><div class="sales-flow-ft"><button type="button" data-sales-flow-close="1">关闭</button></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeSalesFlowModal(); });
    return mask;
  }
  function openSalesFlowModal() {
    ensureSalesFlowModal().classList.add("show");
  }
  function closeSalesFlowModal() {
    var mask = document.getElementById("salesFlowMask");
    if (mask) mask.classList.remove("show");
  }

  function initMaterialList() {
    if (!D) return;
    var tree = D.getClassTree();
    var sel = { big: "A01", mid: "01", small: "001" };
    var qTree = "";
    var qProduct = "";
    var qMfr = "";
    var qStock = "";
    var treeEl = document.getElementById("salesTree");
    var tbody = document.getElementById("salesProductBody");
    var head = document.getElementById("salesProductHead");

    function walkSmall(cb) {
      tree.forEach(function (b) { (b.children || []).forEach(function (m) { (m.children || []).forEach(function (s) { cb(b, m, s); }); }); });
    }
    function match(label) {
      return !qTree || String(label).toLowerCase().indexOf(qTree) >= 0;
    }
    function renderTree() {
      function big(b) {
        var kids = (b.children || []).map(function (m) { return mid(b, m); }).join("");
        if (!match(b.code + b.name) && !kids && qTree) return "";
        return '<div class="sales-tree-row" data-tree="big" data-big="' + esc(b.code) + '"><button class="sales-tree-toggle" data-toggle="big" data-big="' + esc(b.code) + '">' + (b.open ? "▾" : "▸") + '</button><span>' + esc(b.code + " " + b.name) + '</span></div>' +
          '<div style="margin-left:18px;display:' + (b.open ? "block" : "none") + '">' + kids + "</div>";
      }
      function mid(b, m) {
        var kids = (m.children || []).map(function (s) { return small(b, m, s); }).join("");
        if (!match(m.code + m.name) && !kids && qTree) return "";
        return '<div class="sales-tree-row" data-tree="mid" data-big="' + esc(b.code) + '" data-mid="' + esc(m.code) + '"><button class="sales-tree-toggle" data-toggle="mid" data-big="' + esc(b.code) + '" data-mid="' + esc(m.code) + '">' + (m.open ? "▾" : "▸") + '</button><span>' + esc(m.code + " " + m.name) + '</span></div>' +
          '<div style="margin-left:18px;display:' + (m.open ? "block" : "none") + '">' + kids + "</div>";
      }
      function small(b, m, s) {
        var active = sel.big === b.code && sel.mid === m.code && sel.small === s.code;
        if (!match(s.code + s.name + s.a) && qTree) return "";
        return '<div class="sales-tree-row ' + (active ? "is-active" : "") + '" data-tree="small" data-big="' + esc(b.code) + '" data-mid="' + esc(m.code) + '" data-small="' + esc(s.code) + '"><span style="width:22px"></span><span>' + esc(s.code + " " + s.name) + "</span></div>";
      }
      treeEl.innerHTML = tree.map(big).join("") || '<div class="sales-empty">无匹配节点</div>';
    }
    function currentSmall() {
      return D.findSmall(sel.big, sel.mid, sel.small);
    }
    function rowsForSelection() {
      var smallMeta = currentSmall();
      var all = D.ensureDemoProducts();
      var rows = (all[D.catKey(sel.big, sel.mid, sel.small)] || []).map(function (p) { return D.normalizeProduct(p, smallMeta); });
      return rows.filter(function (p) {
        var hay = (p.productName + p.b + p.model + p.mfrName).toLowerCase();
        if (qProduct && hay.indexOf(qProduct) < 0) return false;
        if (qMfr && p.mfrName !== qMfr) return false;
        if (qStock === "有库存" && Number(p.stockQty) <= 0) return false;
        if (qStock === "无库存" && Number(p.stockQty) > 0) return false;
        return true;
      });
    }
    function featureCols(rows) {
      var seen = {};
      rows.forEach(function (p) {
        var feats = p.features || {};
        for (var i = 1; i <= 6; i++) {
          if (feats["f" + i + "_name"] || feats["f" + i]) seen[i] = 1;
        }
      });
      return Object.keys(seen).map(Number).filter(function (i) {
        var sample = rows.find(function (p) { return p.features && p.features["f" + i + "_name"]; });
        var nm = sample && sample.features ? sample.features["f" + i + "_name"] : "";
        return !/制造商名称|制造商型号|产品型号/.test(nm);
      }).slice(0, 4);
    }
    function featText(p, i) {
      var f = p.features || {};
      var n = f["f" + i + "_name"] || "";
      var v = f["f" + i] || "";
      return n && v ? n + "：" + v : n || v || "—";
    }
    function renderProducts() {
      var rows = rowsForSelection();
      var cols = featureCols(rows);
      head.innerHTML = '<tr><th>产品名称</th><th>制造商名称</th><th>产品型号</th><th>产品编码</th><th>库存数量</th>' + cols.map(function (_, idx) { return "<th>特征值" + (idx + 1) + "</th>"; }).join("") + "<th>操作</th></tr>";
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (6 + cols.length) + '" class="sales-empty">暂无销售类物资</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(function (p) {
        return '<tr data-id="' + esc(p.id) + '"><td>' + esc(p.productName) + '</td><td>' + esc(p.mfrName) + '</td><td>' + esc(p.model) + '</td><td>' + esc(p.b) + '</td><td>' + esc(p.stockQty) + '</td>' +
          cols.map(function (i) { return "<td>" + esc(featText(p, i)) + "</td>"; }).join("") +
          '<td><span class="sales-op-row">' + iconBtn("plus", "加购", "cart", p.id) + iconBtn("order", "直接下单", "direct", p.id) + iconBtn("view", "查看", "view-product", p.id) + "</span></td></tr>";
      }).join("");
    }
    function findProduct(id) {
      return rowsForSelection().find(function (p) { return p.id === id; }) || getProducts().find(function (p) { return p.id === id; });
    }
    treeEl.addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-toggle]");
      if (toggle) {
        var b = tree.find(function (x) { return x.code === toggle.getAttribute("data-big"); });
        if (!b) return;
        if (toggle.getAttribute("data-toggle") === "big") b.open = !b.open;
        else {
          var m = (b.children || []).find(function (x) { return x.code === toggle.getAttribute("data-mid"); });
          if (m) m.open = !m.open;
        }
        renderTree();
        return;
      }
      var row = e.target.closest('[data-tree="small"]');
      if (!row) return;
      sel.big = row.getAttribute("data-big");
      sel.mid = row.getAttribute("data-mid");
      sel.small = row.getAttribute("data-small");
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
      qProduct = qMfr = qStock = "";
      renderProducts();
    });
    document.getElementById("salesCartBtn").addEventListener("click", function () {
      openCartModal();
    });
    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var p = findProduct(btn.getAttribute("data-id"));
      var act = btn.getAttribute("data-action");
      if (!p) return;
      if (act === "view-product") openModal("查看物资", productDetailHtml(p), '<button class="sales-btn" data-close>关闭</button>');
      if (act === "cart") openAddCartModal(p);
      if (act === "direct") openOrderForm(p);
    });
    renderTree();
    renderProducts();
    updateCartButton();
  }

  function openOrderForm(product) {
    var name = product ? product.productName + " ×1" : "请选择物资";
    openModal("新增订单", '<div class="sales-form-grid">' +
      '<div class="sales-field"><label>发货路径</label><select id="salesPath"><option>工程技术公司发货</option><option>供应商直发</option></select></div>' +
      '<div class="sales-field"><label>下单公司</label><select><option>河北龙源</option><option>天津龙源</option><option>甘肃龙源</option></select></div>' +
      '<div class="sales-field"><label>场站名称</label><input value="麒麟山风电场"></div>' +
      '<div class="sales-field"><label>期望到货日期</label><input type="date" value="2026-06-30"></div>' +
      '<div class="sales-field sales-field--full"><label>物资清单</label><textarea>' + esc(name) + '</textarea></div>' +
      '<div class="sales-field"><label>订单数量</label><input type="number" value="1"></div>' +
      '<div class="sales-field"><label>联系人</label><input value="张明"></div>' +
      '<div class="sales-field sales-field--full"><label>备注</label><textarea placeholder="请输入备注"></textarea></div>' +
      "</div>", '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" id="salesSubmitOrder">提交订单</button>');
    var ok = document.getElementById("salesSubmitOrder");
    if (ok) ok.addEventListener("click", function () { toast("订单已提交（演示）"); closeModal(); });
  }

  var orderRows = [
    ["XSORD-2026-001","张明","河北龙源","麒麟山风电场","2026-06-10","风力发电机组整机×1、叶片×3","4","1,250,000","待确认","业务部门专责","XSHT-2026-001","WL2026061001","—","—","直发现场/项目公司"],
    ["XSORD-2026-002","李芳","天津龙源","沙井子风电场","2026-06-12","机舱×1","1","920,000","待上传合同","经营发展中心","XSHT-2026-002","WL2026061201","—","—","先发龙源工程技术公司，再由龙源销售给项目公司"],
    ["XSORD-2026-003","王宁","甘肃龙源","酒泉场站","2026-06-14","工业级交换机×6","6","122,040","已发货","项目公司收货人","XSHT-2026-003","WL2026061401","2026-06-15","—","直发现场/项目公司"]
  ];
  function initOrders() {
    var tbody = document.getElementById("salesOrderBody");
    function render() {
      tbody.innerHTML = orderRows.map(function (r) {
        var ops = iconBtn("view", "查看", "view-order", r[0]);
        if (r[8] === "待确认") ops += iconBtn("check", "确认/审核", "approve-order", r[0]);
        if (r[8] === "待上传合同") ops += iconBtn("upload", "上传销售合同", "upload-contract", r[0]);
        if (r[8] === "已确认" || r[8] === "待发货") ops += iconBtn("truck", "发货", "ship-order", r[0]);
        if (r[8] === "已发货") ops += iconBtn("receive", "确认收货", "receive-order", r[0]);
        return "<tr>" + r.slice(0, 15).map(function (c, idx) { return "<td>" + (idx === 8 ? tag(c) : esc(c)) + "</td>"; }).join("") + '<td><span class="sales-op-row">' + ops + "</span></td></tr>";
      }).join("");
    }
    document.getElementById("salesOrderAdd").addEventListener("click", function () { openOrderForm(null); });
    document.getElementById("salesOrderQuery").addEventListener("click", function () { toast("已按条件查询订单（演示）"); });
    document.getElementById("salesOrderReset").addEventListener("click", function () { toast("已重置筛选条件（演示）"); });
    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      var row = orderRows.find(function (r) { return r[0] === id; });
      if (!row) return;
      var act = btn.getAttribute("data-action");
      if (act === "view-order") {
        openModal("查看订单", infoGridHtml(["订单编号","下单人","下单公司","场站名称","下单日期","物资清单","订单数量","订单金额","订单状态","当前处理人","销售合同编号","物流单号","发货日期","收货日期","发货/销售路径"], row), '<button class="sales-btn" data-close>关闭</button>');
      } else if (act === "approve-order") {
        openModal("订单审核", '<div class="sales-form-grid"><div class="sales-field"><label>审批结论</label><select><option>同意销售</option><option>驳回</option></select></div><div class="sales-field"><label>销售合同编号</label><input value="' + esc(row[10]) + '"></div><div class="sales-field sales-field--full"><label>审批意见</label><textarea>同意销售，进入合同上传及发货环节。</textarea></div></div>', '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>确认提交</button>');
      } else if (act === "upload-contract") {
        openModal("上传销售合同", '<div class="sales-form-grid"><div class="sales-field"><label>销售合同编号</label><input value="' + esc(row[10]) + '"></div><div class="sales-field sales-field--full"><label>合同附件</label><input type="file"></div></div>', '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>上传</button>', true);
      } else if (act === "ship-order") {
        openModal("发货确认", '<div class="sales-form-grid"><div class="sales-field"><label>订单编号</label><input readonly value="' + esc(row[0]) + '"></div><div class="sales-field"><label>物流单号</label><input value="' + esc(row[11] || "WL2026061801") + '"></div><div class="sales-field"><label>发货日期</label><input type="date" value="2026-06-18"></div><div class="sales-field"><label>发货人</label><input value="王立军"></div><div class="sales-field sales-field--full"><label>发货备注</label><textarea>按销售合同要求完成发货。</textarea></div></div>', '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>确认发货</button>');
      } else if (act === "receive-order") {
        openModal("确认收货", '<div class="sales-form-grid"><div class="sales-field"><label>订单编号</label><input readonly value="' + esc(row[0]) + '"></div><div class="sales-field"><label>收货日期</label><input type="date" value="2026-06-19"></div><div class="sales-field"><label>收货人</label><input value="' + esc(row[1]) + '"></div><div class="sales-field"><label>验收方式</label><input readonly value="线下验收"></div><div class="sales-field sales-field--full"><label>收货说明</label><textarea>项目公司已线下完成验收，确认收货。</textarea></div></div>', '<button class="sales-btn" data-close>取消</button><button class="sales-btn sales-btn-primary" data-close>确认收货</button>');
      }
    });
    render();
  }

  function initPurchased() {
    var rows = [
      ["GWMZ-2026-001","XSORD-2026-003","甘肃龙源","酒泉场站","A0200100001","工业级交换机","V2.0","B00000006","联合动力","XSHT-2026-003","6","台","20,340","122,040","2026-06-15","WL2026061401","酒泉场站库房","已购入"],
      ["GWMZ-2026-002","XSORD-2026-004","河北龙源","麒麟山风电场","A0100200001","叶片","SW64-2.0","B00000005","中材科技","XSHT-2026-004","3","支","350,000","1,050,000","2026-06-13","WL2026061301","麒麟山风电场","在用"]
    ];
    document.getElementById("salesPurchasedBody").innerHTML = rows.map(function (r) {
      return "<tr>" + r.map(function (c, i) { return "<td>" + (i === 17 ? tag(c) : esc(c)) + "</td>"; }).join("") + '<td><span class="sales-op-row">' + iconBtn("view", "查看", "view-purchased", r[0]) + iconBtn("track", "物资轨迹", "track", r[0]) + "</span></td></tr>";
    }).join("");
    document.getElementById("salesPurchasedQuery").addEventListener("click", function () { toast("已按条件查询购入物资（演示）"); });
    document.getElementById("salesPurchasedExport").addEventListener("click", function () { toast("已导出购入物资台账（演示）"); });
    document.getElementById("salesPurchasedBody").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var row = rows.find(function (r) { return r[0] === btn.getAttribute("data-id"); });
      if (!row) return;
      if (btn.getAttribute("data-action") === "track") {
        openModal("轨迹示意 - " + (row[15] || row[1]), trackHtml(row), '<button class="sales-btn" data-close>关闭</button>', "wide");
      } else {
        openModal("查看购入物资", purchasedDetailHtml(row), '<button class="sales-btn" data-close>关闭</button>', "wide");
      }
    });
  }

  function initReport() {
    var rows = [
      ["XSHT-2026-001","河北龙源风机备件销售合同","联合动力","风力发电机组整机","GW66-1500",10,4,"40%","4,100,000","1,640,000","2,460,000","2026-05-20","2026-05-20~2026-12-31","部分执行"],
      ["XSHT-2026-002","天津龙源机舱销售合同","远景能源","机舱","YJ-NAC-3.0",5,1,"20%","4,600,000","920,000","3,680,000","2026-05-28","2026-05-28~2026-12-31","部分执行"],
      ["XSHT-2026-003","甘肃龙源网络设备销售合同","联合动力","工业级交换机","V2.0",6,6,"100%","122,040","122,040","0","2026-06-01","2026-06-01~2026-09-30","已执行"]
    ];
    document.getElementById("salesReportBody").innerHTML = rows.map(function (r) {
      var leftQty = Number(r[5]) - Number(r[6]);
      return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + esc(r[3]) + "</td><td>" + esc(r[4]) + "</td><td>" + r[5] + "</td><td>" + r[6] + "</td><td>" + leftQty + "</td><td>" + esc(r[7]) + "</td><td>" + esc(r[8]) + "</td><td>" + esc(r[9]) + "</td><td>" + esc(r[10]) + "</td><td>" + esc(r[11]) + "</td><td>" + esc(r[12]) + "</td><td>" + tag(r[13]) + '</td><td><span class="sales-op-row">' + iconBtn("view", "查看执行明细", "report-detail", r[0]) + "</span></td></tr>";
    }).join("");
    document.getElementById("salesReportQuery").addEventListener("click", function () { toast("已按条件更新合同报表（演示）"); });
    document.getElementById("salesReportExport").addEventListener("click", function () { toast("已导出合同报表（演示）"); });
    var total = rows.reduce(function (s, r) { return s + Number(r[5]); }, 0);
    var done = rows.reduce(function (s, r) { return s + Number(r[6]); }, 0);
    document.getElementById("salesKpis").innerHTML = [
      ["销售合同数", rows.length],
      ["合同总数量", total],
      ["已执行数量", done],
      ["剩余执行数量", total - done]
    ].map(function (x) { return '<div class="sales-kpi"><div class="sales-kpi-label">' + x[0] + '</div><div class="sales-kpi-val">' + x[1] + "</div></div>"; }).join("");
    document.getElementById("salesBars").innerHTML = rows.map(function (r) {
      var h = Math.max(16, Math.round(Number(r[6]) / Math.max(1, Number(r[5])) * 130));
      return '<div class="sales-bar-col"><div class="sales-bar" style="height:' + h + 'px"></div><div class="sales-bar-label">' + esc(r[0].replace("XSHT-2026-", "")) + "</div></div>";
    }).join("");
    document.getElementById("salesPie").style.background = "conic-gradient(#52c41a 0 55%, #faad14 55% 90%, #1677ff 90% 100%)";
    document.getElementById("salesPieLegend").innerHTML = "<div>已执行：55%</div><div>部分执行：35%</div><div>未执行：10%</div>";
    document.getElementById("salesReportBody").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      openModal("合同执行明细", '<table class="sales-table" style="min-width:760px"><thead><tr><th>订单编号</th><th>购买公司</th><th>场站名称</th><th>发货数量</th><th>收货数量</th><th>执行金额</th><th>执行时间</th></tr></thead><tbody><tr><td>XSORD-2026-001</td><td>河北龙源</td><td>麒麟山风电场</td><td>2</td><td>2</td><td>820,000</td><td>2026-06-10</td></tr><tr><td>XSORD-2026-005</td><td>天津龙源</td><td>沙井子风电场</td><td>2</td><td>2</td><td>820,000</td><td>2026-06-14</td></tr></tbody></table>', '<button class="sales-btn" data-close>关闭</button>');
    });
  }

  if (page === "material-list") initMaterialList();
  if (page === "orders") initOrders();
  if (page === "purchased") initPurchased();
  if (page === "report") initReport();
})();
