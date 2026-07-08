(function () {
  if (document.body.getAttribute("data-sales-page") !== "proj-inbound") return;

  function stripInboundEditOps() {
    document.querySelectorAll('[data-op="库存管理编辑"]').forEach(function (el) {
      var pipe = el.previousElementSibling;
      if (pipe && pipe.classList && pipe.classList.contains("warehouse-secondary-pipe")) pipe.remove();
      el.remove();
    });
  }

  function patchInboundOpsRefresh() {
    if (!window.M10InboundUi || typeof window.M10InboundUi.refreshOps !== "function") return;
    var orig = window.M10InboundUi.refreshOps;
    window.M10InboundUi.refreshOps = function () {
      orig();
      stripInboundEditOps();
    };
  }

  function init() {
    patchInboundOpsRefresh();
    if (window.M10InboundUi && typeof window.M10InboundUi.refreshOps === "function") {
      window.M10InboundUi.refreshOps();
    }
    stripInboundEditOps();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
