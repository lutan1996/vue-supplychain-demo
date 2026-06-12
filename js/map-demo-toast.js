/**
 * 演示反馈：浅灰圆角 Toast（已提交！/已保存！/已删除！），数秒后淡出。
 * 与 demo-unified-form-actions / sidebar-actions 内联定义保持同步。
 */
(function (global) {
  if (!global || typeof document === "undefined") return;
  if (typeof global.mapDemoToast === "function") return;

  var ID = "map-demo-result-toast";
  var STYLE_ID = "map-demo-result-toast-style-v2";

  function ensureStyle() {
    var legacy = document.getElementById("map-demo-result-toast-style");
    if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent =
      "#" +
      ID +
      "{position:fixed;left:50%;top:18%;transform:translate3d(-50%,-6px,0);z-index:2147483647;max-width:min(92vw,440px);background:#f2f2f2;color:#000;font-weight:400;font-size:14px;line-height:1.45;padding:10px 20px;border-radius:10px;text-align:center;box-sizing:border-box;opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;font-family:system-ui,-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;}" +
      "#" +
      ID +
      ".is-visible{opacity:1;transform:translate3d(-50%,0,0);}";
    (document.head || document.documentElement).appendChild(s);
  }

  function hide(el) {
    if (!el) return;
    el.classList.remove("is-visible");
    clearTimeout(el._hideAfterTrans);
    el._hideAfterTrans = setTimeout(function () {
      el.textContent = "";
    }, 230);
  }

  function mapDemoToast(msg, durationMs) {
    ensureStyle();
    var el = document.getElementById(ID);
    if (!el) {
      el = document.createElement("div");
      el.id = ID;
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
      hide(el);
    }, dur);
  }

  global.mapDemoToast = mapDemoToast;
})(typeof window !== "undefined" ? window : this);
