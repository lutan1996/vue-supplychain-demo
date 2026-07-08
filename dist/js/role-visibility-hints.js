/**
 * 角色说明漂浮标签：由 CSS 控制移入显示/移出隐藏；本脚本仅标记动态节点供样式命中
 */
(function () {
  var SELECTOR =
    ".proc-role-hint, .proc-field-hint, .proc-section-title-hint, .proc-section-hint, .sales-role-hint, .asset-hint";

  function markHint(el) {
    if (!el || el.classList.contains("role-float-tag--wired")) return;
    el.classList.add("role-float-tag--wired");
    el.setAttribute("aria-hidden", "true");
  }

  function scan(root) {
    var base = root || document;
    if (base.matches && base.matches(SELECTOR)) markHint(base);
    if (!base.querySelectorAll) return;
    base.querySelectorAll(SELECTOR).forEach(markHint);
  }

  function init() {
    scan(document);
    try {
      var obs = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            scan(node);
          });
        });
      });
      if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    } catch (eObs) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.__roleFloatTagRescan = scan;
})();
