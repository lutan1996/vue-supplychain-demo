/**
 * 左侧栏蓝色二级菜单 data-action → 页面路径（与子页 subpage-clock.js、驾驶舱、仓库页共用）
 */
(function (global) {
  var __lastHumanNavTs = 0;
  function markHumanNavIntent() {
    __lastHumanNavTs = Date.now();
  }
  try {
    window.addEventListener("pointerdown", markHumanNavIntent, true);
    window.addEventListener("keydown", markHumanNavIntent, true);
    window.addEventListener("touchstart", markHumanNavIntent, true);
  } catch (eNavIntent) {}

  var SIDEBAR_ACTION_HREF = {
    // 我的资产
    "asset-personal": "assets-personal.html",
    "asset-dept": "assets-department.html",
    "asset-company": "assets-company.html",
    "asset-transfer-manage": "asset-transfer-management.html",
    "asset-nature-change-manage": "asset-nature-change-management.html",
    "asset-inventory-manage": "asset-inventory-management.html",
    // 我的任务 → 独立任务中心（?tab= 与蓝框子项一致）
    "task-center": "my-tasks-prototype-list.html?scene=todo",
    "task-approval": "my-tasks-prototype-list.html?scene=todo",
    "task-mine": "my-tasks-prototype-list.html?scene=initiated",
    "task-track": "my-tasks-prototype-list.html?scene=todo",
    "task-initiated": "my-tasks-prototype-list.html?scene=initiated",
    "task-todo": "my-tasks-prototype-list.html?scene=todo",
    "task-done": "my-tasks-prototype-list.html?scene=done",
    "task-cc": "my-tasks-prototype-list.html?scene=cc",
    "home-portal": "index-portal-screen-alt.html",
    "home-system": "index-portal-screen-alt.html",
    // 驾驶舱：统一单页 cockpit.html（集团/省级/首页入口都指向此页）
    "go-cockpit": "cockpit.html",
    "go-cockpit-copy": "cockpit.html",
    "go-app-hub": "index-portal-screen-alt.html",
    "go-cockpit-kpi": "cockpit.html",
    "go-cockpit-map": "cockpit.html",
    "logistics-integration": "logistics-tracking.html",
    "purchase-accept-confirm": "proc-quality-accept.html#flow-warehouse",
    // 物资采购（侧栏「物资采购」）
    "purchase-plan-manage": "purchase-plan-management.html",
    "purchase-plan-table": "purchase-plan-table.html",
    "purchase-order-demand": "order-demand-management.html",
    "purchase-sourcing": "material-procurement-hub.html?tab=m4",
    "purchase-contract-mgmt": "contract-management.html",
    "purchase-summary-report": "purchase-summary-report.html",
    "proj-company-plan-manage": "purchase-plan-management.html",
    "proj-company-contract-mgmt": "contract-management.html",
    "proj-company-summary-report": "purchase-summary-report.html",
    "purchase-contract-mgmt": "contract-management.html",
    "purchase-bid": "material-procurement-hub.html?tab=m7",
    "purchase-pay": "material-procurement-hub.html?tab=m8",
    "purchase-return-exchange": "return-exchange-management.html",
    "purchase-quality-accept": "material-procurement-hub.html?tab=m10",
    "purchase-material-info-manage": "purchase-material-info-management.html",
    "purchase-supplier": "material-procurement-hub.html?tab=m5",
    "purchase-order": "order-demand-management.html",
    // 采购管理（侧栏「采购管理」）— 与物资采购子菜单一致，进入聚合页仅展示对应区块
    "purchase-apply": "material-procurement-hub.html?tab=m2",
    "purchase-nonbid-review": "purchase-pm-nonbid.html",
    "purchase-plan-approval": "purchase-pm-plan.html",
    "purchase-longterm-use-approval": "purchase-pm-longterm-result.html",
    "purchase-reapply": "purchase-pm-repurchase.html",
    "purchase-file-review-minutes": "purchase-pm-minutes.html",
    "purchase-bid-committee-review": "purchase-pm-bid.html",
    "purchase-terminate-approval": "purchase-pm-terminate.html",
    "purchase-group-plan-approval": "purchase-pm-group-plan.html",
    "purchase-under15-review": "purchase-pm-under15.html",
    "purchase-monthly-bid-plan": "purchase-pm-monthly-bid.html",
    "purchase-monthly-nonbid-plan": "purchase-pm-monthly-nonbid.html",
    "purchase-result-notice-nonbid": "purchase-pm-notice-nonbid.html",
    "purchase-longterm-use-manage": "purchase-pm-longterm-use.html",
    "purchase-plan": "purchase-management-hub.html?tab=p6",
    "purchase-bid-pm": "purchase-management-hub.html?tab=p7",
    "purchase-order-pm": "purchase-management-hub.html?tab=p8",
    "purchase-supplier-pm": "purchase-management-hub.html?tab=p8",
    "purchase-contract": "contract-management.html",
    "purchase-receipt": "proc-acceptance-inbound.html",
    "purchase-settlement": "proc-use-approval.html",
    "proc-acceptance-inbound": "proc-acceptance-inbound.html",
    "proj-company-inbound": "proj-company-inbound.html",
    "proj-company-inventory": "proj-company-inbound.html",
    "proc-use-approval": "proc-use-approval.html",
    "proc-sales-contract": "proc-sales-contract.html?v=20260616-fix-v3",
    "proc-shipment": "proc-shipment.html",
    "proc-quality-accept": "proc-quality-accept.html",
    "proc-project-accept": "proc-quality-accept.html",
    "purchase-data-maintain": "purchase-pm-data-maintain.html",
    "purchase-archive-catalog": "purchase-pm-archive.html",
    "material-catalog": "base-data-material-ledger.html",
    "material-price": "base-data-material-ledger.html",
    "material-ledger": "purchase-ledger.html?tab=ledger&allowPurchaseJump=1",
    "purchase-ledger": "purchase-data-ledger.html",
    "cargo-ledger": "cargo-ledger.html",
    "purchase-summary-report": "purchase-summary-report.html?v=20260616-fix-v3",
    "sales-material-list": "sales-material-list.html?v=20260616-fix-v6",
    "sales-order-manage": "sales-order-management.html?v=20260616-fix-v6",
    "sales-purchase-material": "sales-purchased-materials.html?v=20260616-fix-v6",
    "sales-contract-report": "sales-contract-report.html?v=20260616-fix-v6",
    "inventory-task-manage": "inventory-task-management.html",
    "inventory-company-task-manage": "inventory-task-management.html?scope=company",
    "inventory-difference-handle": "inventory-difference-handling.html",
    // 物流
    "logistics-carrier": "carrier-management.html",
    "logistics-contract": "logistics-contract.html",
    "logistics-track": "logistics-tracking.html",
    "logistics-pay": "logistics-payment.html",
    "logistics-waybill": "logistics-tracking.html",
    "logistics-sign": "logistics-tracking.html",
    "logistics-dispatch": "logistics-contract.html",
    "logistics-ledger": "logistics-ledger.html",
    // 仓储
    slot: "slot-management.html",
    receive: "receipt-inbound.html",
    scan: "scan-pick.html",
    "inventory-check": "inventory-check.html",
    stock: "material-procurement-hub.html?tab=m10",
    maintenance: "warehouse-maintenance.html",
    idle: "idle-materials.html",
    warehouse: "warehouse.html",
    "warehouse-checkin": "receipt-inbound.html",
    "warehouse-checkout": "inventory-management.html",
    "warehouse-transfer": "inventory-management.html",
    "warehouse-io-ledger": "warehouse-io-ledger.html",
    "warehouse-stock-ledger": "warehouse-stock-ledger.html",
    // 退役及废旧
    "retired-apply-main": "retire-scrap-application.html",
    "retired-brand": "retired-prototype-list.html?scene=brand",
    "retired-model": "retired-prototype-list.html?scene=model",
    "retired-line": "retired-prototype-list.html?scene=line",
    "retired-wind": "retired-prototype-list.html?scene=wind",
    "retired-requisition": "retired-prototype-list.html?scene=requisition",
    "retired-project": "retired-prototype-list.html?scene=project",
    "retired-big-small-reuse": "big-small-reuse.html",
    "retired-transfer": "goods-transfer-out.html",
    // 绩效 / 公告 / 综合 / 数据
    "performance-board": "performance-hub.html?tab=login",
    "performance-kpi": "performance-hub.html?tab=flow",
    "performance-rule": "performance-hub.html?tab=flow",
    "performance-login-frequency": "performance-hub.html?tab=login",
    "performance-flow-frequency": "performance-hub.html?tab=flow",
    "notice-bid": "notice-bid-fixed.html",
    "notice-nonbid": "notice-prototype-list.html?scene=nonbid",
    "notice-system": "notice-hub.html?tab=nonbid",
    "notice-company": "notice-hub.html?tab=nonbid",
    "notice-policy": "notice-hub.html?tab=nonbid",
    "notice-training": "notice-hub.html?tab=nonbid",
    "notice-ops": "notice-hub.html?tab=nonbid",
    "biz-overview": "integrated-business-hub.html?tab=fin",
    "biz-center": "procurement-application.html",
    "biz-process": "integrated-business-hub.html?tab=flow",
    "biz-collab": "carrier-management.html",
    "biz-finance": "integrated-business-hub.html?tab=fin",
    "biz-repair": "warehouse-maintenance.html",
    "biz-transfer": "integrated-business-hub.html?tab=adj",
    "biz-emergency": "integrated-business-hub.html?tab=emg",
    "biz-standard": "biz-standard-list.html",
    "biz-process-design": "integrated-business-hub.html?tab=flow",
    "biz-claim": "integrated-business-hub.html?tab=claim",
    "biz-domestic-substitute": "domestic-substitution.html",
    "biz-expert": "integrated-business-hub.html?tab=exp",
    "data-ledger": "base-data-material-ledger.html",
    "data-stock": "material-procurement-hub.html?tab=m10",
    "data-report": "subpage-template.html",
    "data-audit": "scrap-identification-approval.html",
    "data-master": "base-data-material-ledger.html",
    "data-quality": "asset-value-management.html",
    "data-base": "base-data-material-ledger.html",
    "data-supplier": "base-data-material-ledger.html?tab=supplier",
    "data-manufacturer": "base-data-material-ledger.html?tab=manufacturer",
    "data-product": "base-data-material-ledger.html?tab=product",
    "data-personnel": "base-data-material-ledger.html?tab=personnel",
    "data-department": "base-data-material-ledger.html?tab=department",
    "data-company": "base-data-material-ledger.html?tab=company",
    "data-station": "base-data-material-ledger.html?tab=station",
    "data-dict": "base-data-material-ledger.html?tab=dict",
    "data-carrier": "base-data-material-ledger.html?tab=carrier",
    "data-rate-tax": "base-data-material-ledger.html?tab=rateTax",
    "data-code-rule": "base-data-material-ledger.html?tab=codeRule",
    /* cockpit / subpage-clock 蓝框「数据」子项：与离线壳 actionToFile 一致 */
    "data-catalog": "base-data-material-ledger.html?tab=product",
    "data-code": "data-code-fixed.html",
    "data-contract": "data-contract-fixed.html",
    "data-decision": "cockpit-analytics.html",
    "data-model": "equipment-evaluation.html",
    "asset-ledger": "asset-ledger.html",
    "asset-value-manage": "asset-value-management.html",
    "asset-scrap-identify": "scrap-identification-approval.html",
    "tool-template": "devtools-prototype-list.html?scene=notFound404",
    "tool-demo": "demo-all-pages-interactive.html",
    "tool-api": "system-prototype-list.html?scene=client",
    "dev-admin-monitor": "devtools-prototype-list.html?scene=cacheMonitor",
    "dev-task-dispatch": "devtools-prototype-list.html?scene=pendingTask",
    "dev-plus-home": "devtools-prototype-list.html?scene=plusSite",
    "setting-profile": "index-portal-screen-alt.html",
    "setting-security": "index-portal-screen-alt.html",
    "setting-theme": "index-portal-screen-alt.html",
    "setting-login": "index-portal-screen-alt.html",
    "setting-password": "index-portal-screen-alt.html",
    "setting-user": "system-prototype-list.html?scene=user",
    "setting-department": "system-prototype-list.html?scene=dept",
    "setting-permission": "system-prototype-list.html?scene=post",
    "system-user": "system-prototype-list.html?scene=user",
    "system-role": "system-prototype-list.html?scene=role",
    "system-codegen": "system-prototype-list.html?scene=codegen",
    "system-menu": "system-prototype-list.html?scene=menu",
    "system-department": "system-prototype-list.html?scene=dept",
    "system-position": "system-prototype-list.html?scene=post",
    "system-dict": "system-prototype-list.html?scene=dict",
    "system-params": "system-prototype-list.html?scene=params",
    "system-notice": "system-prototype-list.html?scene=notice",
    "system-file": "system-prototype-list.html?scene=file",
    "system-client": "system-prototype-list.html?scene=client",
    "system-log": "system-prototype-list.html?scene=notice",
    "oa-integration": "oa-flow-center.html?tab=sso",
    "oa-flow-style": "oa-flow-center.html?tab=style",
    "flow-print-pdf": "oa-flow-center.html?tab=print",
    "flow-return-withdraw": "oa-flow-center.html?tab=return",
    "flow-notify": "oa-flow-center.html?tab=notify",
    "finance-export": "oa-flow-center.html?tab=export",
    "dev-online-user": "devtools-prototype-list.html?scene=onlineUser",
    "dev-tenant": "devtools-prototype-list.html?scene=tenant",
    "dev-tenant-package": "devtools-prototype-list.html?scene=tenantPackage",
    "dev-model-manage": "devtools-prototype-list.html?scene=modelManage",
    "dev-process-define": "devtools-prototype-list.html?scene=processDefine",
    "dev-test-form": "devtools-prototype-list.html?scene=testForm",
    "dev-test-tree": "devtools-prototype-list.html?scene=testTree",
    "dev-flow-category": "devtools-prototype-list.html?scene=flowCategory",
    "dev-leave": "devtools-prototype-list.html?scene=leave",
    "dev-flow-instance": "devtools-prototype-list.html?scene=flowInstance",
    "dev-pending-task": "devtools-prototype-list.html?scene=pendingTask",
    "dev-cache-monitor": "devtools-prototype-list.html?scene=cacheMonitor",
    "dev-form-manage": "devtools-prototype-list.html?scene=formManage",
  };

  global.SIDEBAR_ACTION_HREF = SIDEBAR_ACTION_HREF;

  function canonicalPurchaseNavHref(action) {
    var map = {
      "purchase-apply": "material-procurement-hub.html?tab=m2",
      "purchase-order-demand": "order-demand-management.html",
      "purchase-contract-mgmt": "contract-management.html",
      "purchase-quality-accept": "proc-project-accept.html",
      "purchase-ledger": "purchase-data-ledger.html",
      "purchase-plan-manage": "purchase-plan-management.html",
      "material-ledger": "purchase-ledger.html?tab=ledger&allowPurchaseJump=1",
      "cargo-ledger": "cargo-ledger.html",
      "purchase-summary-report": "purchase-summary-report.html",
      "proc-acceptance-inbound": "proc-acceptance-inbound.html",
      "proj-company-inbound": "proj-company-inbound.html",
      "proj-company-inventory": "proj-company-inbound.html",
      "proc-use-approval": "proc-use-approval.html",
    "proc-sales-contract": "proc-sales-contract.html?v=20260616-fix-v2",
      "proc-shipment": "proc-shipment.html",
      "proc-quality-accept": "proc-quality-accept.html",
      "purchase-return-exchange": "return-exchange-management.html"
    };
    return map[action] || "";
  }


  function appendPageSub(href, label) {
    if (!href || !label) return href;
    var s = String(href);
    var hashIdx = s.indexOf("#");
    var base = hashIdx >= 0 ? s.slice(0, hashIdx) : s;
    var frag = hashIdx >= 0 ? s.slice(hashIdx) : "";
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    return base + sep + "pageSub=" + encodeURIComponent(label) + frag;
  }

  function sceneFromRetiredAction(action) {
    var map = {
      "retired-brand": "brand",
      "retired-model": "model",
      "retired-line": "line",
      "retired-wind": "wind",
      "retired-requisition": "requisition",
      "retired-project": "project"
    };
    return map[action] || "";
  }

  function sceneFromSystemAction(action) {
    var map = {
      "setting-user": "user",
      "setting-department": "dept",
      "setting-permission": "post",
      "system-user": "user",
      "system-role": "role",
      "system-codegen": "codegen",
      "system-menu": "menu",
      "system-department": "dept",
      "system-position": "post",
      "system-dict": "dict",
      "system-params": "params",
      "system-notice": "notice",
      "system-file": "file",
      "system-client": "client",
      "system-log": "notice"
    };
    return map[action] || "";
  }

  function sceneFromDevtoolsAction(action) {
    var map = {
      "dev-online-user": "onlineUser",
      "dev-tenant": "tenant",
      "dev-test-form": "testForm",
      "dev-test-tree": "testTree",
      "dev-flow-category": "flowCategory",
      "dev-leave": "leave",
      "dev-tenant-package": "tenantPackage",
      "dev-model-manage": "modelManage",
      "dev-process-define": "processDefine",
      "dev-flow-instance": "flowInstance",
      "dev-pending-task": "pendingTask",
      "dev-cache-monitor": "cacheMonitor",
      "dev-form-manage": "formManage"
    };
    return map[action] || "";
  }

  function sceneFromPurchaseAction(action) {
    var map = {
      "purchase-nonbid-review": "nonbid",
      "purchase-plan-approval": "plan",
      "purchase-longterm-use-approval": "longtermResult",
      "purchase-reapply": "repurchase",
      "purchase-file-review-minutes": "minutes",
      "purchase-bid-committee-review": "bid",
      "purchase-terminate-approval": "terminate",
      "purchase-group-plan-approval": "groupPlan",
      "purchase-under15-review": "under15",
      "purchase-monthly-bid-plan": "monthlyBid",
      "purchase-monthly-nonbid-plan": "monthlyNonbid",
      "purchase-result-notice-nonbid": "noticeNonbid",
      "purchase-data-maintain": "dataMaintain",
      "purchase-archive-catalog": "archive",
      "purchase-longterm-use-manage": "longtermUse"
    };
    return map[action] || "";
  }

  function tabFromMaterialPurchaseAction(action) {
    var map = {
      "purchase-plan-manage": "m1",
      "purchase-apply": "m2",
      "purchase-order-demand": "m3",
      "purchase-sourcing": "m4",
      "purchase-supplier": "m5",
      "purchase-bid": "m7",
      "purchase-pay": "m8",
      "purchase-return-exchange": "m9",
      "purchase-quality-accept": "m10",
      "purchase-order": "m3"
    };
    return map[action] || "";
  }

  /** 绩效考核聚合页 performance-hub.html：login / flow */
  function tabFromPerformanceAction(action) {
    var map = {
      "performance-board": "login",
      "performance-kpi": "flow",
      "performance-rule": "flow",
      "performance-login-frequency": "login",
      "performance-flow-frequency": "flow"
    };
    return map[action] || "";
  }

  /** 采购管理聚合页 purchase-management-hub.html：p1–p10 */
  function tabFromPurchaseMgmtAction(action) {
    var map = {
      "purchase-plan": "p6",
      "purchase-bid-pm": "p7",
      "purchase-order-pm": "p8",
      "purchase-supplier-pm": "p8",
      "purchase-contract": "p8",
      "purchase-receipt": "p9",
      "purchase-settlement": "p9"
    };
    return map[action] || "";
  }

  /** 离线总演示：iframe(blob) 与父页 file:// 常跨源，无法直接调 parent.__demoOpenPage，改由 postMessage 让壳切换 */
  function postMessageDemoNav(href) {
    try {
      if (window.self === window.top) return false;
      if (!window.parent || !window.parent.postMessage) return false;
      window.parent.postMessage({ type: "map-demo-nav", href: String(href) }, "*");
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * @param {string} action data-action 键名
   * @param {{ label?: string }} [ctx] 蓝框子功能文案，写入 URL pageSub 供目标页标题与 document.title 一致
   * @returns {boolean} 是否已跳转
   */
  function resolveDemoShell() {
    var shell = null;
    try {
      if (window.top && window.top !== window && typeof window.top.__demoOpenPage === "function") {
        shell = window.top;
      } else if (window.parent && window.parent !== window && typeof window.parent.__demoOpenPage === "function") {
        shell = window.parent;
      }
    } catch (err) {}
    return shell;
  }

  global.navigateBySidebarAction = function (action, ctx) {
    if (!action) return false;
    if (action === "material-ledger" || action === "purchase-ledger") {
      var allowAuto = false;
      try {
        var now = Date.now();
        if (__lastHumanNavTs && now - __lastHumanNavTs <= 1500) allowAuto = true;
      } catch (eTs) {}
      if (!allowAuto) return false;
    }
    if (typeof window.orgCanNavigateAction === "function" && !window.orgCanNavigateAction(action)) {
      try {
        alert("当前角色无该功能权限，请切换角色后操作。");
      } catch (eAcl) {}
      return false;
    }
    var href = canonicalPurchaseNavHref(action) || SIDEBAR_ACTION_HREF[action];
    if (href) {
      var performanceTab = "";
      // 兜底：先写入退役模块场景，避免离线演示壳丢 query 时退回到品牌页
      try {
        var retiredScene = sceneFromRetiredAction(action);
        if (retiredScene) {
          sessionStorage.setItem("demoRetiredScene", retiredScene);
          sessionStorage.setItem("demoScene", retiredScene);
        }
        var systemScene = sceneFromSystemAction(action);
        if (systemScene) {
          sessionStorage.setItem("demoSystemScene", systemScene);
          sessionStorage.setItem("demoScene", systemScene);
        }
        var purchaseScene = sceneFromPurchaseAction(action);
        if (purchaseScene) {
          sessionStorage.setItem("demoPurchaseScene", purchaseScene);
          sessionStorage.setItem("demoScene", purchaseScene);
        }
        var purchaseTab = tabFromMaterialPurchaseAction(action);
        if (purchaseTab) {
          sessionStorage.setItem("demoPurchaseTab", purchaseTab);
        }
        performanceTab = tabFromPerformanceAction(action);
        if (performanceTab) {
          sessionStorage.setItem("demoPerformanceTab", performanceTab);
        }
        var purchaseMgmtTab = tabFromPurchaseMgmtAction(action);
        if (purchaseMgmtTab) {
          sessionStorage.setItem("demoPurchaseMgmtTab", purchaseMgmtTab);
        }
        var devtoolsScene = sceneFromDevtoolsAction(action);
        if (devtoolsScene) {
          sessionStorage.setItem("demoDevtoolsScene", devtoolsScene);
          sessionStorage.setItem("demoScene", devtoolsScene);
        }
      } catch (eStore) {}
      var label = ctx && ctx.label ? String(ctx.label).trim() : "";
      // 绩效考核页内二级菜单切换：同页直接切 panel，避免离线壳不重载导致仍停在登录频次
      if (performanceTab) {
        try {
          var hasPerfPanels =
            document.querySelector('.module-hub-panel[data-panel="login"]') &&
            document.querySelector('.module-hub-panel[data-panel="flow"]');
          if (hasPerfPanels) {
            sessionStorage.setItem("demoPerformanceTab", performanceTab);
            sessionStorage.setItem("demoTab", performanceTab);
            if (window.history && typeof window.history.replaceState === "function" && typeof URL !== "undefined") {
              var u = new URL(window.location.href);
              u.searchParams.set("tab", performanceTab);
              if (label) u.searchParams.set("pageSub", label);
              window.history.replaceState(null, "", u.toString());
            }
            try {
              window.dispatchEvent(
                new CustomEvent("demo-performance-tab-change", {
                  detail: { tab: performanceTab, label: label }
                })
              );
            } catch (eEvt) {}
            return true;
          }
        } catch (ePerf) {}
      }
      if (label) href = appendPageSub(href, label);
      var inIframe = false;
      try {
        inIframe = window.self !== window.top;
      } catch (e0) {
        inIframe = true;
      }

      /*
       * 离线总演示：先让父壳 __demoOpenPage（switchTo、注入 scene/tab）。
       * 若壳层 fileToIndex 未收录该 html，__demoOpenPage 会返回 false，必须再对本 iframe assign location；
       * 不能把 postMessage 放在 location 之前：postMessage 会 return true，父壳同样无法切换，导致「点了不跳转」。
       * postMessage 仅作无法读 parent / assign location 失败时的兜底。
       */
      if (inIframe) {
        var shellIf = resolveDemoShell();
        if (shellIf && typeof shellIf.__demoOpenPage === "function") {
          try {
            if (shellIf.__demoOpenPage(href) === true) return true;
          } catch (eOpen) {}
        }
        // 在离线壳/iframe 场景中，优先让父层处理，避免本 iframe 相对路径跳转到空白页
        if (postMessageDemoNav(href)) return true;
        try {
          if (window.top && window.top !== window) {
            window.top.location.href = href;
            return true;
          }
        } catch (eTopNav) {}
        try {
          window.location.href = href;
          return true;
        } catch (eLocIframe) {}
        return false;
      }

      var shell = resolveDemoShell();
      if (shell) {
        try {
          if (shell.__demoOpenPage(href) === true) return true;
        } catch (eShell) {}
      }
      try {
        window.location.href = href;
        return true;
      } catch (eTop) {}
      return false;
    }
    return false;
  };
})(typeof window !== "undefined" ? window : this);

/**
 * XQ-037 任务弹窗：右下角定期提醒（采购计划、报废计划等）。
 * 关闭仅隐藏当前页实例，刷新或进入其他页面会再次显示（演示不持久化关闭状态）。
 * 加载顺序：须在 subpage-clock.js 之前执行，以便子页尾部可调用 mapDemoMountTaskReminder。
 */
(function (global) {
  var LEGACY_DISMISS_KEYS = ["mapDemoTaskReminderDismissed_v1", "mapDemoTaskReminderDismissed_v2"];

  /**
   * 离线总演示：子页在 iframe 里时，弹窗若只挂在 iframe 内，会挤在 iframe 右下角（甚至被当成「没出来」）。
   * 同源父页（demo-all-pages / index 壳）则挂到 top.document，占整个浏览器视口右下角。
   */
  function getTaskReminderHostDocument() {
    try {
      if (typeof window !== "undefined" && window.self !== window.top) {
        var t = window.top;
        if (t && t.document) {
          return t.document;
        }
      }
    } catch (eIso) {}
    return document;
  }

  function removeTaskReminderInstances() {
    function removeFromDoc(doc) {
      if (!doc) return;
      try {
        var n = doc.getElementById("globalTaskReminder");
        if (n && n.parentNode) n.parentNode.removeChild(n);
      } catch (e) {}
    }
    removeFromDoc(document);
    try {
      if (window.top && window.top.document) removeFromDoc(window.top.document);
    } catch (eTop) {}
  }

  function mountTaskReminderPopup() {
    /* 按需求：全局不再展示「任务提醒」弹窗；仍清理已存在的实例（含 iframe 父页）。 */
    try {
      removeTaskReminderInstances();
    } catch (eDis) {}
  }

  global.mapDemoMountTaskReminder = mountTaskReminderPopup;
  global.mapDemoResetTaskReminder = function () {
    try {
      if (typeof localStorage !== "undefined") {
        LEGACY_DISMISS_KEYS.forEach(function (k) {
          try {
            localStorage.removeItem(k);
          } catch (eRm) {}
        });
      }
      removeTaskReminderInstances();
    } catch (eReset) {}
    mountTaskReminderPopup();
  };

  /* 延后到当前文档内联脚本执行完之后，确保 subpage-clock.js 已挂上 window.getCurrentRole */
  setTimeout(function () {
    if (typeof global.mapDemoMountTaskReminder !== "function") return;
    global.mapDemoMountTaskReminder();
  }, 0);
  /* 部分页面/iframe 内首帧布局未稳定时 setTimeout(0) 仍可能抢跑，短延迟再试一次（已挂载或已关闭则内部直接 return） */
  setTimeout(function () {
    if (typeof global.mapDemoMountTaskReminder !== "function") return;
    global.mapDemoMountTaskReminder();
  }, 200);
})(typeof window !== "undefined" ? window : this);

/**
 * 与 js/demo-unified-form-actions.js 同源：内联于此以便在 sidebar 之后、各页业务脚本之前执行，
 * 避免 mapDemoUnifiedShowConfirm 等挂载竞态。修改逻辑时请同步更新独立文件（供未走 sidebar 的页面引用）。
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

      if (
        el.closest("#ppmModalEdit, #ppmModalSubmit") &&
        (txt === "保存草稿" || txt === "提交审批" || txt === "确认提交")
      ) {
        return;
      }

      if (txt === "保存草稿") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.__mapDemoUnifiedHandled = true;
        closeNearestDemoDialog(el);
        toastOk("已保存！");
        return;
      }

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
