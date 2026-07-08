/**
 * 各页角色说明红漂浮窗 + 编号红圈（无箭头，可关闭，自动避开正文）
 */
(function () {
  var MARGIN = 12;
  var SIDEBAR_W = 68;
  var activeCfg = null;
  var activePanel = null;
  var repositionScheduled = false;

  function pageKey() {
    if (window.__roleAnnotPageKey) return window.__roleAnnotPageKey;
    var p = (location.pathname || "").split("/").pop() || "";
    if (!p || p === "blank" || p.indexOf("about:") === 0 || p.indexOf("srcdoc") >= 0) {
      p = "";
    }
    if (!p) {
      try {
        var title = document.title || "";
        if (title.indexOf("采购信息台帐") >= 0) return "purchase-plan-management.html";
        if (title.indexOf("合同信息管理") >= 0) return "contract-management.html";
        if (title.indexOf("采购合同报表") >= 0) return "purchase-summary-report.html";
        if (title.indexOf("订单管理") >= 0) return "sales-order-management.html";
        if (title.indexOf("物资列表") >= 0) return "sales-material-list.html";
        if (title.indexOf("购入物资") >= 0) return "sales-purchased-materials.html";
        if (title.indexOf("销售合同报表") >= 0) return "sales-contract-report.html";
        if (title.indexOf("项目公司实物入库") >= 0) return "sales-proj-company-inbound.html";
        if (title.indexOf("物资领用") >= 0) return "purchase-ledger.html";
      } catch (eTitle) {}
      if (document.querySelector(".ppm-toolbar-grid")) return "purchase-plan-management.html";
      if (document.querySelector(".cm-toolbar-grid")) return "contract-management.html";
      return "index.html";
    }
    return p.split("?")[0];
  }

  function dismissKey() {
    if (window.__roleAnnotDismissKey) return window.__roleAnnotDismissKey;
    return "roleAnnotDismissed:" + pageKey();
  }

  function isDismissed() {
    try {
      return sessionStorage.getItem(dismissKey()) === "1";
    } catch (e) {
      return false;
    }
  }

  function dismissPanel() {
    try {
      sessionStorage.setItem(dismissKey(), "1");
    } catch (e) {}
    var root = document.getElementById("role-annot-root");
    if (root) root.remove();
    activePanel = null;
    activeCfg = null;
    if (window.__roleAnnotOnDismiss) {
      try {
        window.__roleAnnotOnDismiss();
      } catch (eDismiss) {}
    }
  }

  function getConfig() {
    if (window.__roleAnnotOverride) return window.__roleAnnotOverride;
    var pages = window.ROLE_ANNOTATION_PAGES || {};
    return pages[pageKey()] || null;
  }

  function resetAnnotDom() {
    var root = document.getElementById("role-annot-root");
    if (root) root.remove();
    activePanel = null;
    activeCfg = null;
  }

  window.__setRoleAnnotationOverride = function (cfg, dismissSuffix) {
    window.__roleAnnotOverride = cfg || null;
    window.__roleAnnotDismissKey = dismissSuffix ? "roleAnnotDismissed:" + dismissSuffix : null;
    resetAnnotDom();
    mount();
  };

  window.__clearRoleAnnotationOverride = function () {
    window.__roleAnnotOverride = null;
    window.__roleAnnotDismissKey = null;
    resetAnnotDom();
  };

  window.__unmountRoleAnnotationOverlay = function () {
    window.__roleAnnotOverride = null;
    window.__roleAnnotDismissKey = null;
    window.__roleAnnotPageKey = null;
    resetAnnotDom();
  };

  function isVisibleEl(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    try {
      var st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false;
    } catch (eSt) {}
    return true;
  }

  function resolveEl(selector, scopeEl) {
    if (!selector) return null;
    var parts = String(selector)
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    for (var i = 0; i < parts.length; i++) {
      try {
        var el = scopeEl ? scopeEl.querySelector(parts[i]) : document.querySelector(parts[i]);
        if (el && isVisibleEl(el)) return el;
      } catch (e) {}
    }
    return null;
  }

  /** 红圈贴在目标控件左侧，垂直居中 */
  function markerPoint(rect, place, index) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var x;
    var y;

    if (place === "right") {
      x = rect.right + 18;
      y = rect.top + rect.height / 2;
    } else if (place === "above") {
      x = rect.left + Math.min(rect.width * 0.25, 40);
      y = rect.top - 18;
    } else {
      x = rect.left - 18;
      y = rect.top + rect.height / 2;
    }

    return {
      x: Math.min(vw - 20, Math.max(SIDEBAR_W + 8, x)),
      y: Math.min(vh - 20, Math.max(56, y))
    };
  }

  function drawMarkers() {
    if (!activeCfg) return;
    var layer = document.getElementById("role-annot-markers");
    if (!layer) return;
    layer.innerHTML = "";

    var scopeEl = null;
    if (activeCfg.scope) {
      scopeEl = resolveEl(activeCfg.scope);
    }

    activeCfg.groups.forEach(function (group, i) {
      var el = resolveEl(group.anchor, scopeEl);
      if (!el) return;
      var rect = el.getBoundingClientRect();
      if (!rect.width && !rect.height) return;

      var pt = markerPoint(rect, group.place || "left", i);
      var pin = document.createElement("div");
      pin.className = "role-annot-marker-pin";
      pin.style.left = pt.x + "px";
      pin.style.top = pt.y + "px";
      pin.setAttribute("aria-hidden", "true");
      pin.innerHTML = "<span>" + (i + 1) + "</span>";
      layer.appendChild(pin);
    });
  }

  function markEmbedMode() {
    if (window.self !== window.top) {
      try {
        document.documentElement.classList.add("demo-embed");
      } catch (e) {}
    }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildPanel(cfg) {
    var panel = document.createElement("aside");
    panel.className = "role-annot-panel";
    panel.setAttribute("aria-label", "角色分区说明");

    var html =
      '<div class="role-annot-panel__hd">' +
      '<h2 class="role-annot-panel__title">' +
      escapeHtml(cfg.title) +
      "</h2>" +
      '<button type="button" class="role-annot-panel__close" aria-label="关闭说明" title="关闭">×</button>' +
      "</div>";
    if (cfg.note) {
      html += '<p class="role-annot-panel__note">' + escapeHtml(cfg.note) + "</p>";
    }
    cfg.groups.forEach(function (g, i) {
      html +=
        '<section class="role-annot-panel__group" data-annot-group="' +
        escapeHtml(g.id) +
        '">' +
        '<div class="role-annot-panel__group-hd"><span class="role-annot-panel__badge">' +
        (i + 1) +
        "</span>" +
        escapeHtml(g.label) +
        "</div><ul class=\"role-annot-panel__list\">" +
        g.items
          .map(function (it) {
            return "<li>" + escapeHtml(it) + "</li>";
          })
          .join("") +
        "</ul></section>";
    });
    panel.innerHTML = html;

    var closeBtn = panel.querySelector(".role-annot-panel__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dismissPanel();
      });
    }
    return panel;
  }

  function contentRects() {
    var rects = [];
    var nodes = document.querySelectorAll(
      "table, .carrier-table-wrap, input, select, textarea, button, a, .header, .modal-mask.show, .ppm-modal-mask[style*='display: block'], .ppm-modal-mask.show"
    );
    nodes.forEach(function (el) {
      if (el.closest("#role-annot-root")) return;
      if (el.closest(".role-annot-panel")) return;
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      rects.push(r);
    });
    return rects;
  }

  function overlapArea(a, b) {
    var x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    var y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return x * y;
  }

  function tableWrapRect() {
    var mask = document.getElementById("materialCheckMask");
    if (mask && mask.classList.contains("is-open")) {
      var invWrap = mask.querySelector(".inv-material-table-wrap");
      if (invWrap) return invWrap.getBoundingClientRect();
    }
    var wrap = document.querySelector(".carrier-table-wrap");
    if (wrap) return wrap.getBoundingClientRect();
    var table = document.querySelector("table.carrier-table, table");
    return table ? table.getBoundingClientRect() : null;
  }

  function scoreRect(panelRect, tableRect) {
    var score = 0;
    if (tableRect && overlapArea(panelRect, tableRect) > 0) {
      score += 1000000 + overlapArea(panelRect, tableRect);
    }
    contentRects().forEach(function (r) {
      score += overlapArea(panelRect, r);
    });
    return score;
  }

  function actionToolbarRow() {
    var ids = ["ppmBtnTopAdd", "cmBtnTopAdd", "psBtnSearch"];
    for (var i = 0; i < ids.length; i++) {
      var btn = document.getElementById(ids[i]);
      if (btn && btn.parentElement) return btn.parentElement;
    }
    return null;
  }

  function applyPanelPosition(panel) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var w = panel.offsetWidth || 276;
    var h = panel.offsetHeight || 220;
    var tableRect = tableWrapRect();

    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.left = "auto";
    panel.style.top = "auto";
    panel.style.maxHeight = "min(38vh, 300px)";

    var candidates = [];
    var toolbar = actionToolbarRow();

    /* 优先：操作按钮行右侧空白（与按钮同一行，不压住表格） */
    if (toolbar && tableRect) {
      var tr = toolbar.getBoundingClientRect();
      var rowH = Math.max(32, tr.height);
      var gapTop = tr.top;
      var gapBottom = tableRect.top;
      var slotH = gapBottom - gapTop - 6;
      if (slotH >= 120) {
        panel.style.maxHeight = Math.min(300, slotH) + "px";
        h = Math.min(h, slotH);
        candidates.push({
          left: Math.min(vw - w - MARGIN, Math.max(SIDEBAR_W, tr.right + 12)),
          top: tr.top,
          priority: 0
        });
      }
    }

    /* 页眉下方左右角 */
    candidates.push({ left: vw - w - MARGIN, top: MARGIN + 52, priority: 1 });
    candidates.push({ left: SIDEBAR_W, top: MARGIN + 52, priority: 1 });

    /* 表格上方（若放得下） */
    if (tableRect) {
      var aboveTop = tableRect.top - h - 8;
      if (aboveTop >= MARGIN + 48) {
        candidates.push({ left: vw - w - MARGIN, top: aboveTop, priority: 2 });
        candidates.push({ left: SIDEBAR_W, top: aboveTop, priority: 2 });
      }
    }

    var best = null;
    var bestScore = Infinity;
    var bestPriority = Infinity;
    candidates.forEach(function (c) {
      var left = Math.max(SIDEBAR_W, Math.min(vw - w - MARGIN, c.left));
      var top = Math.max(MARGIN + 48, Math.min(vh - h - MARGIN, c.top));
      var rect = { left: left, top: top, right: left + w, bottom: top + h };
      var score = scoreRect(rect, tableRect);
      var pri = c.priority != null ? c.priority : 3;
      if (score < bestScore || (score === bestScore && pri < bestPriority)) {
        bestScore = score;
        bestPriority = pri;
        best = { left: left, top: top };
      }
    });

    if (best) {
      panel.style.left = best.left + "px";
      panel.style.top = best.top + "px";
    } else {
      panel.style.left = vw - w - MARGIN + "px";
      panel.style.top = MARGIN + 52 + "px";
    }

    if (tableRect) {
      var maxBottom = tableRect.top - 6;
      var curTop = parseFloat(panel.style.top) || MARGIN + 52;
      var allowedH = maxBottom - curTop;
      if (allowedH >= 96) {
        panel.style.maxHeight = Math.min(300, allowedH) + "px";
      } else {
        panel.style.maxHeight = "min(38vh, 300px)";
        panel.style.top = Math.max(MARGIN + 48, maxBottom - Math.min(h, 220)) + "px";
      }
    }
  }

  function repositionNow() {
    if (!activePanel || !activePanel.parentNode) return;
    applyPanelPosition(activePanel);
    drawMarkers();
  }

  function scheduleReposition() {
    if (repositionScheduled) return;
    repositionScheduled = true;
    requestAnimationFrame(function () {
      repositionScheduled = false;
      requestAnimationFrame(repositionNow);
    });
  }

  window.__roleAnnotScheduleDraw = scheduleReposition;

  function ensureDom(cfg) {
    if (isDismissed()) return null;

    var root = document.getElementById("role-annot-root");
    if (root && activeCfg === cfg && activePanel) {
      scheduleReposition();
      return root;
    }

    if (root) root.remove();
    activeCfg = cfg;

    root = document.createElement("div");
    root.id = "role-annot-root";

    var markers = document.createElement("div");
    markers.className = "role-annot-markers";
    markers.id = "role-annot-markers";

    activePanel = buildPanel(cfg);
    root.appendChild(markers);
    root.appendChild(activePanel);
    document.body.appendChild(root);

    scheduleReposition();
    setTimeout(scheduleReposition, 120);
    setTimeout(scheduleReposition, 500);
    setTimeout(scheduleReposition, 1200);
    return root;
  }

  var listenersBound = false;
  function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;
    window.addEventListener("resize", scheduleReposition);
    window.addEventListener("scroll", scheduleReposition, true);
    if (typeof MutationObserver !== "undefined") {
      var obs = new MutationObserver(scheduleReposition);
      obs.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
  }

  function mount() {
    markEmbedMode();
    var cfg = getConfig();
    if (!cfg) {
      resetAnnotDom();
      return;
    }
    if (isDismissed()) {
      resetAnnotDom();
      return;
    }
    if (!ensureDom(cfg)) return;
    bindListeners();
  }

  window.__mountRoleAnnotationOverlay = function () {
    var tries = 0;
    function attempt() {
      if (window.__roleAnnotOverride || window.ROLE_ANNOTATION_PAGES) {
        mount();
        return;
      }
      if (tries < 40) {
        tries += 1;
        setTimeout(attempt, 100);
      }
    }
    attempt();
  };

  window.__roleAnnotAssetsV1 = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.__mountRoleAnnotationOverlay();
    });
  } else {
    window.__mountRoleAnnotationOverlay();
  }
})();
