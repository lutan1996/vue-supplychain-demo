/**
 * 原型统一交互（演示）：弹窗底「保存草稿」「提交*」提示；「删除/批量删除」自定义确认（确认/取消）后提示。
 * 通过 capture 优先于各页原有逻辑；采购信息台账等页可挂 window.__mapDemoUnifiedDeleteRow 同步内存数据。
 */
(function () {
  if (typeof document === "undefined") return;
  /* 与 js/map-demo-toast.js 同源 */
  (function (global) {
    if (!global || typeof global.mapDemoToast === "function") return;
    var _tid = "map-demo-result-toast";
    var _sid = "map-demo-result-toast-style-v2";
    function _ensureToastStyle() {
      var legacy = document.getElementById("map-demo-result-toast-style");
      if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
      if (document.getElementById(_sid)) return;
      var s = document.createElement("style");
      s.id = _sid;
      s.textContent =
        "#" +
        _tid +
        "{position:fixed;left:50%;top:18%;transform:translate3d(-50%,-6px,0);z-index:2147483647;max-width:min(92vw,440px);background:#f2f2f2;color:#000;font-weight:400;font-size:14px;line-height:1.45;padding:10px 20px;border-radius:10px;text-align:center;box-sizing:border-box;opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;font-family:system-ui,-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;}" +
        "#" +
        _tid +
        ".is-visible{opacity:1;transform:translate3d(-50%,0,0);}";
      (document.head || document.documentElement).appendChild(s);
    }
    function _hideToastEl(el) {
      if (!el) return;
      el.classList.remove("is-visible");
      clearTimeout(el._hideAfterTrans);
      el._hideAfterTrans = setTimeout(function () {
        el.textContent = "";
      }, 230);
    }
    global.mapDemoToast = function (msg, durationMs) {
      _ensureToastStyle();
      var el = document.getElementById(_tid);
      if (!el) {
        el = document.createElement("div");
        el.id = _tid;
        el.setAttribute("role", "status");
        el.setAttribute("aria-live", "polite");
        document.body.appendChild(el);
      }
      clearTimeout(el._autoHide);
      el.textContent = String(msg == null ? "" : msg);
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
      var dur = typeof durationMs === "number" && durationMs > 0 ? durationMs : 2400;
      el._autoHide = setTimeout(function () {
        _hideToastEl(el);
      }, dur);
    };
  })(typeof window !== "undefined" ? window : null);

  try {
    if (window.__mapDemoUnifiedFormActionsV1) return;
    window.__mapDemoUnifiedFormActionsV1 = true;
  } catch (e0) {}

  function toastOk(msg) {
    try {
      if (typeof window.mapDemoToast === "function") {
        window.mapDemoToast(msg);
        return;
      }
    } catch (eT) {}
    alert(msg);
  }

  /** 关闭当前操作所在的业务弹窗（与 toast 配套；采购/合同/申请/库存等原型 mask 类名） */
  function closeNearestDemoDialog(fromEl) {
    try {
      if (!fromEl || !fromEl.closest) return;
      var sel =
        ".ppm-modal-mask, .cm-modal-mask, .pa-modal-mask, .modal-mask, .proc-modal-mask, .ni-modal-mask, .pmim-modal-mask, .pph-modal-mask, .pph-track-mask, .qa-modal-mask, .wm-modal-mask, .ai-modal-mask, .rx-modal-mask, .rd-modal-mask, .perf-modal-mask";
      var node = fromEl.closest(sel);
      if (!node) return;
      node.classList.remove("show", "is-open");
      node.setAttribute("aria-hidden", "true");
    } catch (eC) {}
  }

  function skipHost(el) {
    return !!(el && el.closest && el.closest("[data-skip-demo-unify]"));
  }

  function visibleText(el) {
    if (!el) return "";
    try {
      var c = el.cloneNode(true);
      c.querySelectorAll('.fa, .fa-solid, .fa-regular, [class*="fa-"], svg, i').forEach(function (n) {
        n.remove();
      });
      return String(c.textContent || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    } catch (e) {
      return String(el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  function inDialogFooter(el) {
    return !!(
      el &&
      el.closest &&
      el.closest(
        ".ppm-dialog-ft, .cm-dialog-ft, .modal-ft, .pa-ft, .pph-modal-ft, .pph-track-ft, .qa-modal-ft, .pa-modal-ft, .s-ft, .ni-ft, .plan-ft, .gto-ft, .wh-modal-ft, .rs-modal-ft"
      )
    );
  }

  var confirmRoot = null;

  function ensureConfirmUi() {
    if (confirmRoot) return;
    confirmRoot = document.createElement("div");
    confirmRoot.id = "map-demo-unify-confirm";
    confirmRoot.setAttribute("role", "dialog");
    confirmRoot.setAttribute("aria-modal", "true");
    confirmRoot.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;";
    confirmRoot.innerHTML =
      "<div style=\"background:#fff;border-radius:8px;min-width:300px;max-width:92vw;box-shadow:0 8px 32px rgba(0,0,0,.22);overflow:hidden\">" +
      "<div id=\"map-demo-unify-confirm-msg\" style=\"padding:18px 20px;font-size:15px;color:#333;line-height:1.55\"></div>" +
      "<div style=\"padding:12px 16px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap\">" +
      "<button type=\"button\" id=\"map-demo-unify-confirm-cancel\" style=\"padding:7px 18px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;font-size:14px\">取消</button>" +
      "<button type=\"button\" id=\"map-demo-unify-confirm-ok\" style=\"padding:7px 18px;border:1px solid #1677ff;border-radius:6px;background:#1677ff;color:#fff;cursor:pointer;font-size:14px\">确认</button>" +
      "</div></div>";
    document.body.appendChild(confirmRoot);
    confirmRoot.addEventListener("click", function (ev) {
      if (ev.target === confirmRoot) {
        finishConfirm(false);
      }
    });
    function finishConfirm(ok) {
      confirmRoot.style.display = "none";
      var cb = confirmRoot._cb;
      confirmRoot._cb = null;
      if (typeof cb === "function") cb(!!ok);
    }
    confirmRoot.querySelector("#map-demo-unify-confirm-ok").addEventListener("click", function () {
      finishConfirm(true);
    });
    confirmRoot.querySelector("#map-demo-unify-confirm-cancel").addEventListener("click", function () {
      finishConfirm(false);
    });
  }

  function showConfirm(message, cb) {
    ensureConfirmUi();
    confirmRoot.querySelector("#map-demo-unify-confirm-msg").textContent = message || "是否确认删除？";
    confirmRoot._cb = cb;
    confirmRoot.style.display = "flex";
  }

  try {
    if (typeof window !== "undefined") window.mapDemoUnifiedShowConfirm = showConfirm;
  } catch (eW) {}

  function tryAfterDelete(el, tr) {
    try {
      if (typeof window.__mapDemoUnifiedDeleteRow === "function") {
        if (window.__mapDemoUnifiedDeleteRow(el, tr) === true) return;
      }
    } catch (e1) {}
    try {
      if (tr && tr.parentNode && String(tr.parentNode.tagName || "").toLowerCase() === "tbody") {
        tr.parentNode.removeChild(tr);
      }
    } catch (e2) {}
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.__mapDemoUnifiedHandled) return;
      var el = e.target && e.target.closest ? e.target.closest("a,button,[role='button']") : null;
      if (!el || el.disabled || skipHost(el)) return;

      var txt = visibleText(el);
      if (!txt || txt === "取消" || txt === "关闭" || txt.indexOf("确认删除") >= 0) return;

      /* —— 删除 / 批量删除 —— */
      if (el.id === "ppmBtnDeleteBatch") return;
      if (txt === "删除" || txt === "批量删除") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.__mapDemoUnifiedHandled = true;
        showConfirm("是否确认删除？", function (ok) {
          if (!ok) return;
          toastOk("已删除！");
          tryAfterDelete(el, el.closest("tr"));
        });
        return;
      }

      if (!inDialogFooter(el)) return;

      /* 采购信息台账：保留原有校验与列表写入，仅由各页脚本改文案；此处不拦截 */
      if (
        el.closest("#ppmModalEdit, #ppmModalSubmit") &&
        (txt === "保存草稿" || txt === "提交审批" || txt === "确认提交")
      ) {
        return;
      }

      /* 保存草稿 */
      if (txt === "保存草稿") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.__mapDemoUnifiedHandled = true;
        closeNearestDemoDialog(el);
        toastOk("已保存！");
        return;
      }

      /* 提交类（含二次确认按钮「确认提交」） */
      if (txt === "提交" || txt === "提交审批" || txt === "确认提交") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.__mapDemoUnifiedHandled = true;
        closeNearestDemoDialog(el);
        toastOk("已提交！");
        return;
      }
    },
    true
  );
})();
