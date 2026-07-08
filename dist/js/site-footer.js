/**
 * 全站统一页脚：Copyright + 数据最后更新时间（演示占位）
 */
(function () {
  var MARKER = "data-site-footer";
  var STYLE_ID = "map-demo-site-footer-style";

  function ensureFooterStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent =
      ".app-site-footer{flex:0 0 auto;box-sizing:border-box;width:100%;margin:0;text-align:center;font-size:11px;line-height:1.55;color:#8c8c8c;padding:8px 12px 10px;background:#eef2f6;border-top:1px solid #e4e9ef;}" +
      ".app-site-footer__inner{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 20px;max-width:100%;}" +
      ".app-site-footer__copy{color:#8c8c8c;}" +
      ".app-site-footer__sync{color:#8c8c8c;font-weight:400;}" +
      ".app-site-footer__sync time{font-variant-numeric:tabular-nums;}" +
      "body.map-demo-site-footer--shell{display:flex;flex-direction:column;min-height:100%;height:100%;overflow:hidden;}" +
      "body.map-demo-site-footer--shell>.shell{flex:1 1 0;min-height:0;height:auto;max-height:none;}";
    document.head.appendChild(st);
  }

  function defaultSyncText() {
    return "2026-04-19 10:30:25";
  }

  function buildInnerHtml() {
    return (
      '<div class="app-site-footer__inner">' +
      '<span class="app-site-footer__copy">Copyright © 2026 国家能源集团 · 龙源电力 · 新能源物资供应链管理系统</span>' +
      '<span class="app-site-footer__sync">数据最后更新时间：<time id="demoGlobalDataSyncAt">' +
      defaultSyncText() +
      "</time></span>" +
      "</div>"
    );
  }

  function installSiteFooter() {
    try {
      // 若在 iframe 内运行，跳过生成（由壳层父页面负责）
      if (window && window.self !== window.top) return;

      ensureFooterStyles();

      // 清理可能遗留的无标记页脚，防止重复
      var existing = document.querySelectorAll("footer.app-site-footer:not([" + MARKER + "])");
      for (var i = 0; i < existing.length; i++) {
        var parent = existing[i].parentNode;
        if (parent) parent.removeChild(existing[i]);
      }

      if (document.querySelector("[" + MARKER + "]")) return;

      var portal = document.querySelector("footer.portal-footer");
      if (portal) {
        portal.setAttribute(MARKER, "");
        portal.classList.add("app-site-footer");
        portal.innerHTML = buildInnerHtml();
        return;
      }

      var app = document.querySelector(".app");
      if (app) {
        var footer = document.createElement("footer");
        footer.className = "app-site-footer";
        footer.setAttribute(MARKER, "");
        footer.innerHTML = buildInnerHtml();
        app.appendChild(footer);
        return;
      }

      var shell = document.querySelector("body > .shell");
      if (shell && shell.parentNode) {
        var fShell = document.createElement("footer");
        fShell.className = "app-site-footer";
        fShell.setAttribute(MARKER, "");
        fShell.innerHTML = buildInnerHtml();
        shell.parentNode.appendChild(fShell);
        try {
          document.body.classList.add("map-demo-site-footer--shell");
        } catch (e1) {}
      }
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installSiteFooter);
  } else {
    installSiteFooter();
  }

  /* 未引用 sidebar-actions 的页面：补全「保存草稿 / 提交 / 删除确认」演示交互（与 sidebar 内联块互斥） */
  try {
    if (!window.__mapDemoUnifiedFormActionsV1) {
      var cur = document.currentScript && document.currentScript.src;
      var base = cur ? cur.replace(/[^/]+$/, "") : "js/";
      var s = document.createElement("script");
      s.src = base + "demo-unified-form-actions.js";
      s.async = false;
      (document.head || document.documentElement).appendChild(s);
    }
  } catch (eU) {}

  /* 全站角色可见说明（浅蓝提示条） */
  function loadRoleHintBannerCss() {
    if (document.getElementById("role-hint-banner-css")) return;
    var cur2 = document.currentScript && document.currentScript.src;
    var cssBase = cur2 ? cur2.replace(/[^/]+$/, "").replace(/js\/?$/, "css/") : "css/";
    var link = document.createElement("link");
    link.id = "role-hint-banner-css";
    link.rel = "stylesheet";
    link.href = cssBase + "role-hint-banner.css?v=20260707-hint-banner-v1";
    (document.head || document.documentElement).appendChild(link);
  }

  try {
    loadRoleHintBannerCss();
  } catch (eHint) {}
})();
