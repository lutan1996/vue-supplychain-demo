/* 顶栏时间 + 子页面统一侧栏交互（蓝色展开框） */
(function () {
  var ORG_ROLE_CATALOG = [
    { id: "director_feng", title: "董事", person: "冯江哲", dept: "董事会", modules: "all", assetScope: "global" },
    { id: "gm_zeng", title: "总经理", person: "曾繁礼", dept: "总经办", modules: "all", assetScope: "global" },
    { id: "leader_supervisor", title: "主管领导", person: "主管领导", dept: "分管条线", modules: ["asset", "purchaseMgmt", "logistics", "warehouse", "retired", "performance", "data", "notice", "biz"], assetScope: "dept" },
    { id: "dept_head", title: "部门主管", person: "部门主管", dept: "所属部门", modules: ["asset", "purchaseMgmt", "logistics", "warehouse", "retired", "performance", "data", "notice", "biz"], assetScope: "dept" },
    { id: "dept_asset_specialist", title: "部门资产专责", person: "部门资产专责", dept: "所属部门", modules: ["asset", "task", "data"], assetScope: "dept" },
    { id: "dept_material_specialist", title: "部门物资专责", person: "部门物资专责", dept: "所属部门", modules: ["warehouse", "retired", "logistics", "task", "data"], assetScope: "none" },
    { id: "corp_asset_head", title: "公司资产主管", person: "王超", dept: "公司资产管理", modules: ["asset", "task", "data", "performance"], assetScope: "global" },
    { id: "corp_material_head", title: "公司物资主管", person: "王超", dept: "公司物资管理", modules: ["warehouse", "retired", "logistics", "task", "data"], assetScope: "none" },
    { id: "corp_purchase_head", title: "公司采购主管", person: "王超", dept: "公司采购管理", modules: ["purchaseMgmt", "task", "data", "performance"], assetScope: "none" },
    { id: "corp_asset_specialist", title: "公司资产专责", person: "宋中波", dept: "公司资产管理", modules: ["asset", "task", "data"], assetScope: "global" },
    { id: "corp_material_specialist", title: "公司物资专责", person: "宋中波", dept: "公司物资管理", modules: ["warehouse", "retired", "logistics", "task", "data"], assetScope: "none" },
    { id: "corp_purchase_specialist", title: "公司采购专责", person: "王卿明", dept: "公司采购管理", modules: ["purchaseMgmt", "task", "data"], assetScope: "none" },
    { id: "value_leader", title: "价值管理主管领导", person: "刘静", dept: "价值管理中心", modules: ["asset", "warehouse", "retired", "data", "performance", "task"], assetScope: "global" },
    { id: "value_dept_head", title: "价值管理部门主管", person: "孙睿", dept: "价值管理中心", modules: ["asset", "warehouse", "retired", "data", "performance", "task"], assetScope: "global" },
    { id: "value_asset_specialist", title: "价值管理资产专责", person: "杨国卿", dept: "价值管理中心", modules: ["asset", "data", "task"], assetScope: "global" },
    { id: "value_material_specialist", title: "价值管理物资专责", person: "杜欣鑫", dept: "价值管理中心", modules: ["warehouse", "retired", "data", "task"], assetScope: "none" },
    { id: "finance_specialist", title: "财务部专责", person: "财务专责", dept: "财务部", modules: ["data", "task", "purchaseMgmt", "warehouse"], assetScope: "global" },
    { id: "mech_specialist", title: "机械研究所物资专责", person: "许学良", dept: "机械研究所", modules: ["purchaseMgmt", "warehouse", "task", "logistics"], assetScope: "dept" },
    { id: "elec_specialist", title: "电控所物资专责", person: "成明锴", dept: "电控所", modules: ["purchaseMgmt", "warehouse", "task", "logistics"], assetScope: "dept" },
    { id: "scrap_specialist", title: "公司废旧鉴定专责", person: "史秋生", dept: "废旧鉴定中心", modules: ["retired", "warehouse", "task", "data"], assetScope: "none" },
    { id: "scrap_head", title: "公司废旧鉴定主管", person: "任淮辉", dept: "废旧鉴定中心", modules: ["retired", "warehouse", "task", "data"], assetScope: "none" }
  ];

  function getDefaultRoleId() {
    return "gm_zeng";
  }

  function getCurrentRole() {
    var roleId = "";
    try {
      roleId = (sessionStorage.getItem("demoOrgRoleId") || "").trim();
    } catch (e0) {}
    if (!roleId) roleId = getDefaultRoleId();
    var role = ORG_ROLE_CATALOG.find(function (x) {
      return x.id === roleId;
    });
    if (!role) role = ORG_ROLE_CATALOG[0];
    try {
      sessionStorage.setItem("demoOrgRoleId", role.id);
    } catch (e1) {}
    return role;
  }

  try {
    window.getCurrentRole = getCurrentRole;
  } catch (eGc) {}

  /** 离线演示壳顶栏「角色切换」通过 postMessage 同步到 iframe 内子页 */
  try {
    window.addEventListener("message", function (ev) {
      var d = ev.data;
      if (!d || d.type !== "map-demo-shell-role") return;
      var roleId = String(d.roleId || "").trim();
      if (!roleId) return;
      var prevId = "";
      try {
        prevId = (sessionStorage.getItem("demoOrgRoleId") || "").trim();
      } catch (ePrev) {}
      var nextRole = ORG_ROLE_CATALOG.find(function (x) {
        return x.id === roleId;
      });
      if (!nextRole) nextRole = ORG_ROLE_CATALOG[0];
      /* 壳子 iframe 每次 load 都会投递当前角色；与 session 一致时勿再派发 demo-org-role-change，否则资产子页会 reload 死循环（闪退）。 */
      if (nextRole.id === prevId) return;
      try {
        sessionStorage.setItem("demoOrgRoleId", nextRole.id);
      } catch (e0) {}
      var btn = document.getElementById("orgRoleBtn");
      if (btn) btn.textContent = "角色切换：" + nextRole.title;
      var menu = document.getElementById("orgRoleMenu");
      if (menu) {
        menu.querySelectorAll(".org-role-item").forEach(function (x) {
          x.classList.remove("is-active");
        });
        menu.querySelectorAll("[data-role-id]").forEach(function (x) {
          if (x.getAttribute("data-role-id") === nextRole.id) x.classList.add("is-active");
        });
      }
      window.dispatchEvent(
        new CustomEvent("demo-org-role-change", {
          detail: { role: nextRole }
        })
      );
    });
  } catch (eShellRoleMsg) {}

  function roleHasModule(role, moduleKey) {
    if (!role || !moduleKey) return false;
    if (role.modules === "all") return true;
    var allowed = Array.isArray(role.modules) ? role.modules.slice() : [];
    if (allowed.indexOf("task") === -1) allowed.push("task");
    if (allowed.indexOf("cockpit") === -1) allowed.push("cockpit");
    if (moduleKey === "physicalMgmt" && allowed.indexOf("purchaseMgmt") >= 0) return true;
    if (moduleKey === "salesMgmt" && allowed.indexOf("purchaseMgmt") >= 0) return true;
    if (
      moduleKey === "inventoryMgmt" &&
      (allowed.indexOf("warehouse") >= 0 || allowed.indexOf("asset") >= 0 || allowed.indexOf("purchaseMgmt") >= 0)
    )
      return true;
    return allowed.indexOf(moduleKey) >= 0;
  }

  function actionModuleKey(action) {
    if (!action) return "";
    /* 实物管理：库存管理、物资领用 */
    if (
      action === "material-ledger" ||
      action === "purchase-ledger" ||
      action === "purchase-quality-accept"
    ) {
      return "physicalMgmt";
    }
    if (action === "cargo-ledger") return "purchaseMgmt";
    if (/^(asset-)/.test(action)) return "asset";
    if (/^(inventory-task|inventory-difference)/.test(action)) return "inventoryMgmt";
    if (/^(logistics-)/.test(action)) return "logistics";
    if (/^(sales-)/.test(action)) return "salesMgmt";
    if (/^(purchase-|cargo-|proc-|material-|purchaseMgmt)/.test(action)) return "purchaseMgmt";
    if (/^(slot|receive|scan|inventory-check|stock|maintenance|idle|warehouse)/.test(action)) return "warehouse";
    if (/^(retired-|goods-transfer)/.test(action)) return "retired";
    if (/^(performance-)/.test(action)) return "performance";
    if (/^(notice-)/.test(action)) return "notice";
    if (/^(biz-)/.test(action)) return "biz";
    if (/^(data-)/.test(action)) return "data";
    if (/^(dev-|tool-)/.test(action)) return "devtools";
    if (/^(setting-|system-)/.test(action)) return "system";
    if (/^(task-)/.test(action)) return "task";
    if (/^(go-cockpit|cockpit-|home-)/.test(action)) return "cockpit";
    return "";
  }

  function canAccessAssetScope(role, scope) {
    if (!role) return false;
    if (role.modules === "all") return true;
    if (!roleHasModule(role, "asset")) return false;
    if (scope === "personal") return role.assetScope !== "none";
    if (scope === "department") return role.assetScope === "dept" || role.assetScope === "global";
    if (scope === "company") return role.assetScope === "global";
    return false;
  }

  function ensureOrgAccessDenyStyles() {
    if (document.getElementById("orgAccessDenyStyle")) return;
    var st = document.createElement("style");
    st.id = "orgAccessDenyStyle";
    st.textContent =
      ".org-access-deny{margin:12px 0;padding:10px 12px;border:1px solid #ffd8bf;background:#fff7e6;border-radius:6px;color:#ad4e00;font-size:13px;}";
    document.head.appendChild(st);
  }

  /**
   * 子页蓝顶栏不再插入「角色切换」（与 Logo/标题左对齐）；切换入口在离线演示壳 index.html 顶栏「上一页」同栏。
   * iframe 内仍通过 postMessage（map-demo-shell-role）+ 下方 message 监听同步 sessionStorage。
   */
  function installOrgRoleSwitch() {
    return;
  }

  function installAssetScopeGuards() {
    function renderAssetScopeGuard() {
    var path = (window.location.pathname || "").split("/").pop();
    var role = getCurrentRole();
    var scope = "";
    if (path === "assets-personal.html") scope = "personal";
    else if (path === "assets-department.html") scope = "department";
    else if (path === "assets-company.html") scope = "company";
    if (!scope) return;

    var titleEl = document.querySelector(".asset-page-title");
    if (scope === "personal" && titleEl) {
      titleEl.textContent = "个人资产（" + role.person + "）";
    }

    if (canAccessAssetScope(role, scope)) return;

    ensureOrgAccessDenyStyles();
    var host = document.querySelector(".asset-inner") || document.querySelector(".main-scroll");
    if (!host) return;
    var deny = document.createElement("div");
    deny.className = "org-access-deny";
    deny.textContent =
      "当前角色无权限访问此资产层级。请使用离线演示入口（index.html）顶栏的「角色切换」后重新进入本页。";
    host.innerHTML = "";
    host.appendChild(deny);
    }
    renderAssetScopeGuard();
    window.addEventListener("demo-org-role-change", function () {
      var file = ((window.location.pathname || "").split("/").pop() || "").split("?")[0].toLowerCase();
      if (
        file === "assets-personal.html" ||
        file === "assets-department.html" ||
        file === "assets-company.html"
      ) {
        window.location.reload();
      }
    });
  }

  function installOrgAccessBridge() {
    window.getDemoOrgRole = getCurrentRole;
    window.orgRoleHasModule = function (moduleKey) {
      return roleHasModule(getCurrentRole(), moduleKey);
    };
    window.orgCanNavigateAction = function (action) {
      var mk = actionModuleKey(action);
      if (!mk) return true;
      return roleHasModule(getCurrentRole(), mk);
    };
    window.orgCanAccessAssetScope = function (scope) {
      return canAccessAssetScope(getCurrentRole(), scope);
    };
  }

  function tickClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    var d = new Date();
    var pad = function (n) {
      return n < 10 ? '0' + n : '' + n;
    };
    el.textContent =
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      '  ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds());
  }

  function installMasterNavInteractions() {
    var layout = document.querySelector('.layout');
    var sidebar = document.querySelector('.sidebar');
    if (!layout || !sidebar) return;
    if (sidebar.__masterNavInteractionsInstalled) return;
    sidebar.__masterNavInteractionsInstalled = true;

    function ensurePhysicalMgmtNavItem() {
      var items = sidebar.querySelectorAll(".nav-item");
      var hasPhysical = false;
      var purchaseNav = null;
      var i;
      for (i = 0; i < items.length; i++) {
        var labelEl = items[i].querySelector(".nav-label");
        var t = (labelEl ? labelEl.textContent : items[i].textContent || "").replace(/\s+/g, "");
        if (t === "实物管理") hasPhysical = true;
        if (t === "物资采购") purchaseNav = items[i];
      }
      if (hasPhysical || !purchaseNav || !purchaseNav.parentNode) return;
      var el = document.createElement("div");
      el.className = "nav-item";
      el.setAttribute("title", "实物管理");
      el.innerHTML = '<span class="nav-label">实物管理</span>';
      purchaseNav.parentNode.insertBefore(el, purchaseNav.nextSibling);
    }

    function ensureInventoryNavItem() {
      var items = sidebar.querySelectorAll(".nav-item");
      var hasInventory = false;
      var salesNav = null;
      var i;
      for (i = 0; i < items.length; i++) {
        var labelEl = items[i].querySelector(".nav-label");
        var t = (labelEl ? labelEl.textContent : items[i].textContent || "").replace(/\s+/g, "");
        if (t === "盘点管理") hasInventory = true;
        if (t === "销售管理") salesNav = items[i];
      }
      if (hasInventory || !salesNav || !salesNav.parentNode) return;
      var el = document.createElement("div");
      el.className = "nav-item";
      el.setAttribute("title", "盘点管理");
      el.innerHTML = '<span class="nav-label">盘点管理</span>';
      salesNav.parentNode.insertBefore(el, salesNav.nextSibling);
    }

    function normalizeRetiredNavLabel() {
      var items = sidebar.querySelectorAll(".nav-item");
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var labelEl = item.querySelector(".nav-label");
        var text = (labelEl ? labelEl.textContent : item.textContent || "").replace(/\s+/g, "");
        if (text !== "物资出库与处置") continue;
        item.setAttribute("title", "报废计划与报废申请");
        if (labelEl) labelEl.textContent = "报废计划与报废申请";
      }
    }

    // 统一左侧主菜单：首页、我的任务 + 一级业务模块（含实物管理）+ 基础数据管理
    (function ensureFullSidebar() {
      if (sidebar.getAttribute("data-demo-sidebar-master-v8") === "1") {
        ensurePhysicalMgmtNavItem();
        ensureInventoryNavItem();
        normalizeRetiredNavLabel();
        return;
      }
      sidebar.setAttribute("data-demo-sidebar-master-v8", "1");
      sidebar.innerHTML =
        '<div class="nav-item" title="首页"><span class="nav-label">首页</span></div>' +
        '<div class="nav-item" title="我的任务"><span class="nav-label">我的任务</span></div>' +
        '<div class="nav-item" title="物资采购"><span class="nav-label">物资采购</span></div>' +
        '<div class="nav-item" title="实物管理"><span class="nav-label">实物管理</span></div>' +
        '<div class="nav-item" title="销售管理"><span class="nav-label">销售管理</span></div>' +
        '<div class="nav-item" title="盘点管理"><span class="nav-label">盘点管理</span></div>' +
        '<div class="nav-item" title="资产管理"><span class="nav-label">资产管理</span></div>' +
        '<div class="nav-item" title="物流管理"><span class="nav-label">物流管理</span></div>' +
        '<div class="nav-item" title="报废计划与报废申请"><span class="nav-label">报废计划与报废申请</span></div>' +
        '<div class="nav-item" title="基础数据管理"><span class="nav-label">基础数据管理</span></div>';
      normalizeRetiredNavLabel();
    })();

    // 统一侧栏图标：补齐与驾驶舱一致的模块图标
    (function ensureSidebarIcons() {
      var ICON_SVG_BY_LABEL = {
        '我的资产':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
        '我的任务':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z"/><rect x="5" y="5" width="14" height="17" rx="1.5"/><path d="M8 9h8M8 12.5h8M8 16h6"/></svg>',
        '首页':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-7H9v7H4.5A1.5 1.5 0 0 1 3 20v-9.5z"/></svg>',
        '我的待办':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 4h13v4H8V4z"/><path d="M8 10h13v4H8v-4z"/><path d="M8 16h10v4H8v-4z"/><circle cx="5" cy="6" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="5" cy="18" r="1.5"/></svg>',
        '驾驶舱':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/></svg>',
        '采购管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h14l-1.2 9H7.2L6 6z"/><path d="M6 6V5a1 1 0 0 1 1-1h2"/><circle cx="9" cy="20" r="1.25"/><circle cx="17" cy="20" r="1.25"/></svg>',
        '物资采购':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h14l-1.2 9H7.2L6 6z"/><path d="M6 6V5a1 1 0 0 1 1-1h2"/><circle cx="9" cy="20" r="1.25"/><circle cx="17" cy="20" r="1.25"/></svg>',
        '项目公司入库':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 10v6M9 13l3-3 3 3"/><path d="M7 4V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1"/></svg>',
        '资产管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h12M6 12h8"/></svg>',
        '实物管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 8h16v12H4V8z"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M9 12h6M9 16h4"/></svg>',
        '销售管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 5h14v14H5V5z"/><path d="M8 9h8M8 13h5"/><path d="M16 16.5c1.8 0 3-1 3-2.5s-1.2-2.5-3-2.5-3-1-3-2.5 1.2-2.5 3-2.5"/><path d="M16 4v17"/></svg>',
        '盘点管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M9 3.5h6v3H9z"/><path d="M8 11l2 2 4-4"/><path d="M8 16h8"/></svg>',
        '物流管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1 16h11.5V8.5H5V7h11.5v5h2.5l3.5 4.5"/><circle cx="6.5" cy="17.5" r="1.75"/><circle cx="16.5" cy="17.5" r="1.75"/></svg>',
        '仓储管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18V10.5L12 6 3 10.5V21z"/><path d="M9 21v-7h6v7"/></svg>',
        '报废计划与报废申请':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 12a9 9 0 0 0-9-9 9.5 9.5 0 0 0-7 3"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.5 9.5 0 0 0 7-3"/><path d="M16 16h5v5"/></svg>',
        '绩效考核':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h5"/></svg>',
        '公告管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h12a2 2 0 0 1 2 2v10H6a2 2 0 0 0-2 2v2"/><path d="M4 6V5a1 1 0 0 1 1-1h2"/><path d="M8 10h8M8 14h6"/></svg>',
        '综合业务管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>',
        '基础数据管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="5" rx="9" ry="2.5"/><path d="M3 5v6c0 1.6 4 3 9 3s9-1.4 9-3V5"/><path d="M3 11v6c0 1.6 4 3 9 3s9-1.4 9-3V11"/><path d="M3 17v2c0 1.6 4 3 9 3s9-1.4 9-3v-2"/></svg>',
        '数据管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="5" rx="9" ry="2.5"/><path d="M3 5v6c0 1.6 4 3 9 3s9-1.4 9-3V5"/><path d="M3 11v6c0 1.6 4 3 9 3s9-1.4 9-3V11"/><path d="M3 17v2c0 1.6 4 3 9 3s9-1.4 9-3v-2"/></svg>',
        '开发工具':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 18l6-6-6-6"/><path d="M8 6 2 12l6 6"/></svg>',
        '设置':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"/><path d="M12 1v2.5M12 20.5V23M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1 12h2.5M20.5 12H23M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>',
        '系统管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="9" r="3.5"/><path d="M5 20.5v-1a7 7 0 0 1 14 0v1"/></svg>'
      };

      var navItems = sidebar.querySelectorAll('.nav-item');
      for (var i = 0; i < navItems.length; i++) {
        var item = navItems[i];
        if (item.querySelector('.nav-icon')) continue;
        var labelEl = item.querySelector('.nav-label');
        if (!labelEl) continue;
        var label = (labelEl.textContent || '').trim();
        var svg = ICON_SVG_BY_LABEL[label];
        if (!svg) continue;
        var icon = document.createElement('span');
        icon.className = 'nav-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = svg;
        item.insertBefore(icon, labelEl);
      }
    })();

    // 统一补充退役面板所需样式（子页母版）
    if (!document.getElementById('masterNavEnhanceStyle')) {
      var style = document.createElement('style');
      style.id = 'masterNavEnhanceStyle';
      style.textContent =
        '.retired-main-block{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}' +
        '.retired-main-title{background:none;border:none;padding:0;color:#fff;font-size:14px;line-height:1.5;text-align:left;cursor:pointer;}' +
        '.retired-main-title:hover,.retired-main-title:focus{opacity:.9;text-decoration:underline;text-underline-offset:2px;}' +
        '.retired-main-title--static{cursor:default;text-decoration:none;font-weight:600;}' +
        '.retired-sub-divider{border:none;height:1px;background:rgba(255,255,255,.2);margin:0;}' +
        '.retired-sub-pipe{font-size:13px;}' +
        '.retired-sub-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}' +
        '.retired-sub-row .warehouse-secondary-link{font-size:13px;font-weight:400;line-height:1.5;}' +
        '.retired-sub-row .warehouse-secondary-pipe{opacity:.55;}' +
        '.retired-sub-row + .retired-sub-row{margin-top:6px;}' +
        '.warehouse-secondary-sep{display:none!important;}';
      document.head.appendChild(style);
    }

    var PHYSICAL_MGMT_ROW_HTML =
      '<button type="button" class="warehouse-secondary-link" data-action="purchase-quality-accept" data-label="库存管理">库存管理</button>' +
      '<span class="warehouse-secondary-sep" aria-hidden="true">|</span>' +
      '<button type="button" class="warehouse-secondary-link" data-action="material-ledger" data-label="物资领用">物资领用</button>';

    // 驾驶舱同款：模块点击弹出蓝色框（二级功能）
    var secondaryPanel = document.getElementById('warehouseSecondaryPanel');
    if (!secondaryPanel) {
      secondaryPanel = document.createElement('aside');
      secondaryPanel.id = 'warehouseSecondaryPanel';
      secondaryPanel.className = 'warehouse-secondary-panel';
      secondaryPanel.setAttribute('aria-label', '模块子菜单');
      secondaryPanel.setAttribute('aria-hidden', 'true');
      secondaryPanel.hidden = true;
      secondaryPanel.innerHTML =
        '<div class="warehouse-secondary-inner">' +
        '  <div class="warehouse-secondary-row warehouse-secondary-row--pipe" id="masterSecondaryRow"></div>' +
        '</div>';
      layout.insertBefore(secondaryPanel, layout.querySelector('.main-scroll'));
    } else {
      /* 页面内已有仓储侧栏但未带 #masterSecondaryRow（如 warehouse.html）：补 id 以便注入子功能 */
      var existingRow = secondaryPanel.querySelector('.warehouse-secondary-inner .warehouse-secondary-row');
      if (existingRow && !existingRow.id) existingRow.id = 'masterSecondaryRow';
    }

    var physicalMgmtPanel = document.getElementById('physicalMgmtSecondaryPanel');
    if (!physicalMgmtPanel) {
      physicalMgmtPanel = document.createElement('aside');
      physicalMgmtPanel.id = 'physicalMgmtSecondaryPanel';
      physicalMgmtPanel.className = 'warehouse-secondary-panel physical-mgmt-secondary-panel';
      physicalMgmtPanel.setAttribute('aria-label', '实物管理子菜单');
      physicalMgmtPanel.setAttribute('aria-hidden', 'true');
      physicalMgmtPanel.hidden = true;
      physicalMgmtPanel.innerHTML =
        '<div class="warehouse-secondary-inner">' +
        '  <div class="warehouse-secondary-row warehouse-secondary-row--pipe" id="physicalMgmtSecondaryRow">' +
        PHYSICAL_MGMT_ROW_HTML +
        '</div></div>';
      layout.insertBefore(physicalMgmtPanel, layout.querySelector('.main-scroll'));
    }

    var retiredPanel = document.getElementById('retiredSecondaryPanel');
    if (!retiredPanel) {
      retiredPanel = document.createElement('aside');
      retiredPanel.id = 'retiredSecondaryPanel';
      retiredPanel.className = 'warehouse-secondary-panel retired-secondary-panel';
      retiredPanel.setAttribute('aria-label', '报废计划与报废申请子菜单');
      retiredPanel.setAttribute('aria-hidden', 'true');
      retiredPanel.hidden = true;
        retiredPanel.innerHTML =
        '<div class="warehouse-secondary-inner">' +
        '  <div class="retired-main-block">' +
        '    <div class="warehouse-secondary-row warehouse-secondary-row--pipe retired-sub-pipe retired-sub-row">' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-apply-main" data-label="报废计划提报">报废计划提报</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-scrap-apply" data-label="报废申请">报废申请</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
      layout.insertBefore(retiredPanel, layout.querySelector('.main-scroll'));
    }

    var assetMgmtPanel = document.getElementById('assetMgmtSecondaryPanel');
    if (!assetMgmtPanel) {
      assetMgmtPanel = document.createElement('aside');
      assetMgmtPanel.id = 'assetMgmtSecondaryPanel';
      assetMgmtPanel.className = 'warehouse-secondary-panel asset-mgmt-secondary-panel';
      assetMgmtPanel.setAttribute('aria-label', '资产管理子菜单');
      assetMgmtPanel.setAttribute('aria-hidden', 'true');
      assetMgmtPanel.hidden = true;
      assetMgmtPanel.innerHTML =
        '<div class="warehouse-secondary-inner">' +
        '  <div class="warehouse-secondary-row warehouse-secondary-row--pipe">' +
        '    <button type="button" class="warehouse-secondary-link" data-action="asset-company" data-label="公司资产">公司资产</button>' +
        '    <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '    <button type="button" class="warehouse-secondary-link" data-action="asset-dept" data-label="部门资产">部门资产</button>' +
        '    <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '    <button type="button" class="warehouse-secondary-link" data-action="asset-personal" data-label="个人资产">个人资产</button>' +
        '  </div>' +
        '</div>';
      layout.insertBefore(assetMgmtPanel, layout.querySelector('.main-scroll'));
    }

    var actionHref = window.SIDEBAR_ACTION_HREF;
    if (!actionHref) {
      console.warn('[subpage-clock] 请先引入 js/sidebar-actions.js，否则二级菜单无法跳转');
      actionHref = {};
    }

    function safeJumpMaster(href) {
      if (!href) return false;
      try {
        if (window.top && window.top !== window && typeof window.top.__demoOpenPage === "function") {
          if (window.top.__demoOpenPage(href) === true) return true;
        }
      } catch (eTop) {}
      try {
        if (window.parent && window.parent !== window && window.parent.postMessage) {
          window.parent.postMessage({ type: "map-demo-nav", href: String(href) }, "*");
        }
      } catch (eMsg) {}
      try {
        window.location.href = href;
        return true;
      } catch (eLoc) {}
      return false;
    }

    /* 蓝框仅列独立入口用例。废旧物资鉴定审批、设备评估、报废计划、净值计算等按功能列表融入报废计划与报废申请、价值管理、资产台账等页面流程，不单独占子菜单。 */
    var modules = {
      homeTop: {
        text: "首页",
        directAction: "home-portal",
        aclModuleKey: "cockpit"
      },
      taskTodoTop: {
        text: "我的任务",
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="task-initiated" data-label="我发起的">我发起的</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-todo" data-label="我的待办">我的待办</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-done" data-label="我的已办">我的已办</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-cc" data-label="我的抄送">我的抄送</button>'
      },
      asset: {
        text: '我的资产',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="asset-personal" data-label="个人资产">个人资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-dept" data-label="部门资产">部门资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-company" data-label="公司资产">公司资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-transfer-manage" data-label="资产交接">资产交接</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-nature-change-manage" data-label="资产性质转变">资产性质转变</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-inventory-manage" data-label="盘点管理">盘点管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-value-manage" data-label="价值管理">价值管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-ledger" data-label="资产台账">资产台账</button>'
      },
      task: {
        text: '我的任务',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="task-initiated" data-label="我发起的">我发起的</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-todo" data-label="我的待办">我的待办</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-done" data-label="我的已办">我的已办</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-cc" data-label="我的抄送">我的抄送</button>'
      },
      // 首页：不再弹出蓝色二级菜单，直接按侧栏映射跳转
      cockpit: {
        text: '驾驶舱',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="go-cockpit" data-label="集团驾驶舱">集团驾驶舱</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="go-cockpit-map" data-label="省级驾驶舱">省级驾驶舱</button>'
      },
      purchaseMgmt: {
        text: '物资采购',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-plan-manage" data-label="采购信息台帐">采购信息台帐</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-contract-mgmt" data-label="合同信息管理">合同信息管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-summary-report" data-label="采购合同报表管理">采购合同报表管理</button>'
      },
      assetMgmt: {
        text: '资产管理',
        panel: assetMgmtPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="asset-company" data-label="公司资产">公司资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-dept" data-label="部门资产">部门资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-personal" data-label="个人资产">个人资产</button>'
      },
      physicalMgmt: {
        text: '实物管理',
        panel: physicalMgmtPanel,
        aclModuleKey: 'purchaseMgmt',
        rowHtml: PHYSICAL_MGMT_ROW_HTML
      },
      salesMgmt: {
        text: '销售管理',
        panel: secondaryPanel,
        aclModuleKey: 'purchaseMgmt',
        rowHtml:
          '<span class="warehouse-secondary-label" aria-hidden="true" style="display:block;flex-basis:100%;padding:4px 0 2px;color:#d7e6ff;font-weight:700;">内部采购</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="sales-material-list" data-label="物资列表">物资列表</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="sales-order-manage" data-label="订单管理">订单管理</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<span class="warehouse-secondary-label" aria-hidden="true" style="display:block;flex-basis:100%;padding:4px 0 2px;color:#d7e6ff;font-weight:700;">外部采购</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="sales-purchase-material" data-label="购入物资">购入物资</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="sales-contract-report" data-label="销售合同报表管理">销售合同报表管理</button>'
      },
      inventoryMgmt: {
        text: '盘点管理',
        panel: secondaryPanel,
        aclModuleKey: 'inventoryMgmt',
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="inventory-task-manage" data-label="部门物资盘点">部门物资盘点</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="inventory-company-task-manage" data-label="公司物资盘点">公司物资盘点</button>'
      },
      logistics: {
        text: '物流管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-carrier" data-label="承运商管理">承运商管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-contract" data-label="物流合同">物流合同</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-track" data-label="物流跟踪">物流跟踪</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-pay" data-label="物流付款">物流付款</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-ledger" data-label="物流台账">物流台账</button>'
      },
      warehouse: {
        text: '仓储管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="slot" data-label="货位管理">货位管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="receive" data-label="收货入库">收货入库</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="scan" data-label="扫码领用">扫码领用</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="inventory-check" data-label="盘库管理">盘库管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="stock" data-label="库存管理">库存管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="maintenance" data-label="维修管理">维修管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-domestic-substitute" data-label="国产化替代">国产化替代</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="idle" data-label="闲置物资">闲置物资</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="warehouse" data-label="仓库管理">仓库管理</button>'
      },
      retired: {
        text: '报废计划与报废申请',
        panel: retiredPanel
      },
      performance: {
        text: '绩效考核',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="performance-login-frequency" data-label="登录频次统计">登录频次统计</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="performance-flow-frequency" data-label="流程频次统计">流程频次统计</button>'
      },
      notice: {
        text: '公告管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="notice-nonbid" data-label="非招标公告">非招标公告</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="notice-bid" data-label="招标公告">招标公告</button>'
      },
      biz: {
        text: '综合业务管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="biz-finance" data-label="财务管理">财务管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-repair" data-label="维修管理">维修管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-transfer" data-label="调剂管理">调剂管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-emergency" data-label="应急物资管理">应急物资管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-standard" data-label="标准规范">标准规范</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-process-design" data-label="业务流程设计">业务流程设计</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-claim" data-label="物资理赔">物资理赔</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-domestic-substitute" data-label="国产化替代">国产化替代</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-expert" data-label="专家管理">专家管理</button>'
      },
      dataNav: {
        text: "基础数据管理",
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="data-supplier" data-label="供应商数据">供应商数据</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-manufacturer" data-label="制造商数据">制造商数据</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-product" data-label="物资类型">物资类型</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-code" data-label="产品目录">产品目录</button>'
      },
      data: {
        text: '数据管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="data-supplier" data-label="供应商数据">供应商数据</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-manufacturer" data-label="制造商数据">制造商数据</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-product" data-label="物资类型">物资类型</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-code" data-label="产品目录">产品目录</button>'
      },
      devtools: {
        text: '开发工具',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="dev-online-user" data-label="在线用户">在线用户</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-tenant" data-label="租户管理">租户管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-test-form" data-label="测试单表">测试单表</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-test-tree" data-label="测试树表">测试树表</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-flow-category" data-label="流程分类">流程分类</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-leave" data-label="请假申请">请假申请</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-tenant-package" data-label="租户套餐管理">租户套餐管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-model-manage" data-label="模型管理">模型管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-process-define" data-label="流程定义">流程定义</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<span class="warehouse-secondary-label" aria-hidden="true" style="display:block;flex-basis:100%;padding:4px 0 2px;color:#d7e6ff;font-weight:700;">流程监控</span>' +
          '<span class="warehouse-secondary-divider" aria-hidden="true" style="display:block;flex-basis:100%;height:1px;background:rgba(112,155,255,0.45);margin:0 0 6px;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-flow-instance" data-label="流程实例">流程实例</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-pending-task" data-label="待办任务">待办任务</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-cache-monitor" data-label="缓存监控">缓存监控</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-admin-monitor" data-label="Admin监控">Admin监控</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-form-manage" data-label="表单管理">表单管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-task-dispatch" data-label="任务调度中心">任务调度中心</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-plus-home" data-label="PLUS官网">PLUS官网</button>'
      },
      setting: {
        text: '设置',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="setting-password" data-label="密码管理">密码管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="setting-user" data-label="人员管理">人员管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="setting-department" data-label="公司部门管理">公司部门管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="setting-permission" data-label="权限管理">权限管理</button>'
      },
      system: {
        text: '系统管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="system-user" data-label="用户管理">用户管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-role" data-label="角色管理">角色管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-codegen" data-label="代码生成">代码生成</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-menu" data-label="菜单管理">菜单管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-department" data-label="部门管理">部门管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-position" data-label="岗位管理">岗位管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-dict" data-label="字典管理">字典管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-params" data-label="参数设置">参数设置</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-notice" data-label="通知公告">通知公告</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-file" data-label="文件管理">文件管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-client" data-label="客户端管理">客户端管理</button>'
      }
    };
    var NAV_MODULE_KEY_BY_ID = {
      homeTop: "cockpit",
      taskTodoTop: "task",
      asset: "asset",
      task: "task",
      cockpit: "cockpit",
      purchaseMgmt: "purchaseMgmt",
      physicalMgmt: "physicalMgmt",
      salesMgmt: "salesMgmt",
      inventoryMgmt: "inventoryMgmt",
      logistics: "logistics",
      warehouse: "warehouse",
      retired: "retired",
      performance: "performance",
      notice: "notice",
      biz: "biz",
      dataNav: "data",
      data: "data",
      devtools: "devtools",
      setting: "system",
      system: "system"
    };

    function resolveSecondaryRow() {
      var row = document.getElementById('masterSecondaryRow');
      if (row) return row;
      if (secondaryPanel) {
        row = secondaryPanel.querySelector('.warehouse-secondary-inner .warehouse-secondary-row');
        if (row && !row.id) row.id = 'masterSecondaryRow';
      }
      return row || null;
    }

    var secondaryRow = resolveSecondaryRow();

    function findNavByText(label) {
      var compact = String(label).replace(/\s+/g, '');
      var items = sidebar.querySelectorAll('.nav-item');
      var i, nl, t;
      for (i = 0; i < items.length; i++) {
        nl = items[i].querySelector('.nav-label');
        t = (nl ? nl.textContent : items[i].textContent || '').replace(/\s+/g, '');
        if (t === compact) return items[i];
      }
      for (i = 0; i < items.length; i++) {
        nl = items[i].querySelector('.nav-label');
        t = (nl ? nl.textContent : items[i].textContent || '').replace(/\s+/g, '');
        if (t.indexOf(compact) > -1) return items[i];
      }
      return null;
    }

    function removeNavByText(label) {
      var nav = findNavByText(label);
      if (!nav || !nav.parentNode) return;
      nav.parentNode.removeChild(nav);
    }

    function clearNavHighlight() {
      sidebar.querySelectorAll('.nav-item').forEach(function (el) {
        el.classList.remove('active');
        el.classList.remove('nav-item--module-active');
      });
    }

    function closePanels() {
      [secondaryPanel, assetMgmtPanel, physicalMgmtPanel, retiredPanel].forEach(function (panel) {
        if (!panel) return;
        panel.classList.remove('is-open');
        panel.hidden = true;
        panel.setAttribute('aria-hidden', 'true');
      });
    }

    function openPanel(panel) {
      if (!panel) return;
      panel.hidden = false;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
    }

    function openPhysicalMgmtPanel() {
      openPanel(physicalMgmtPanel);
      bindPanelActions(physicalMgmtPanel);
    }

    function closePhysicalMgmtPanel() {
      if (!physicalMgmtPanel) return;
      physicalMgmtPanel.classList.remove('is-open');
      physicalMgmtPanel.hidden = true;
      physicalMgmtPanel.setAttribute('aria-hidden', 'true');
    }

    function isPhysicalMgmtPage(fileName, search) {
      var f = String(fileName || '').split('?')[0].toLowerCase();
      if (f === 'purchase-ledger.html' || f === 'proc-quality-accept.html') return true;
      if (f === 'material-procurement-hub.html') {
        var tab = '';
        try {
          tab = new URLSearchParams(search || location.search || '').get('tab') || '';
        } catch (eTab) {}
        if (!tab) {
          try {
            tab = String(document.documentElement.getAttribute('data-proc-tab') || '');
          } catch (eTab2) {}
        }
        if (!tab) {
          try {
            tab = String(sessionStorage.getItem('demoPurchaseTab') || '');
          } catch (eTab3) {}
        }
        return tab === 'm10';
      }
      return false;
    }

    function syncPhysicalMgmtPanelsForPage(fileName, search) {
      if (!isPhysicalMgmtPage(fileName, search)) return;
      var physRow = document.getElementById("physicalMgmtSecondaryRow");
      var mod = modules.physicalMgmt;
      if (physRow && mod && mod.rowHtml) {
        physRow.innerHTML = applyRoleAclToRowHtml(mod.rowHtml);
        bindPanelActions(physicalMgmtPanel);
      }
      openPhysicalMgmtPanel();
    }

    function bindPanelActions(panel) {
      if (!panel) return;
      function fallbackActionHref(key) {
        var map = {
          "task-initiated": "my-tasks-prototype-list.html?scene=initiated",
          "task-todo": "my-tasks-prototype-list.html?scene=todo",
          "task-done": "my-tasks-prototype-list.html?scene=done",
          "task-cc": "my-tasks-prototype-list.html?scene=cc"
        };
        return map[key] || "";
      }
      function safeJump(href) {
        return safeJumpMaster(href);
      }
      panel.querySelectorAll('[data-action]').forEach(function (btn) {
        if (btn.__boundMasterNav) return;
        btn.__boundMasterNav = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var key = btn.getAttribute('data-action');
          var label = (btn.getAttribute('data-label') || '').trim() || (btn.textContent || '').trim();
          if (typeof window.orgCanNavigateAction === 'function' && !window.orgCanNavigateAction(key)) {
            alert('当前角色无该功能权限，请切换角色后操作。');
            return;
          }
          /* 统一走 navigateBySidebarAction（内含打包演示父页 __demoOpenPage 跳转） */
          if (typeof window.navigateBySidebarAction === 'function') {
            try { window.navigateBySidebarAction(key, { label: label }); } catch (eNavTry) {}
          }
          var hrefMap = window.SIDEBAR_ACTION_HREF || actionHref || {};
          var href = hrefMap[key] || fallbackActionHref(key);
          if (href) {
            safeJump(href);
            return;
          }
        });
      });
    }

    function applyRoleAclToRowHtml(rowHtml) {
      if (!rowHtml || typeof window.orgCanNavigateAction !== 'function') return rowHtml || '';
      var box = document.createElement('div');
      box.innerHTML = rowHtml;
      box.querySelectorAll('[data-action]').forEach(function (btn) {
        var action = btn.getAttribute('data-action');
        if (window.orgCanNavigateAction(action)) return;
        var prev = btn.previousElementSibling;
        var next = btn.nextElementSibling;
        if (prev && prev.classList && prev.classList.contains('warehouse-secondary-pipe')) prev.remove();
        if (next && next.classList && next.classList.contains('warehouse-secondary-pipe')) next.remove();
        btn.remove();
      });
      return box.innerHTML;
    }

    function applyRoleAclToSidebar() {
      var role = typeof window.getDemoOrgRole === 'function' ? window.getDemoOrgRole() : null;
      if (!role || typeof window.orgRoleHasModule !== 'function') return;
      Object.keys(modules).forEach(function (k) {
        var mod = modules[k];
        var navEl = findNavByText(mod.text);
        if (!navEl) return;
        var mk = NAV_MODULE_KEY_BY_ID[k] || k;
        var can = window.orgRoleHasModule(mk);
        navEl.style.display = '';
      });
    }

    Object.keys(modules).forEach(function (k) {
      var mod = modules[k];
      var navEl = findNavByText(mod.text);
      if (!navEl) return;

      navEl.setAttribute('data-master-module', k);
      navEl.style.cursor = 'pointer';
      if (navEl.tagName === 'A') navEl.setAttribute('href', '#');

      navEl.addEventListener('click', function (e) {
        try {
          var mkAcl = mod.aclModuleKey || NAV_MODULE_KEY_BY_ID[k] || k;
          if (typeof window.orgRoleHasModule === 'function' && !window.orgRoleHasModule(mkAcl)) {
            e.preventDefault();
            alert("当前角色无该模块权限。请使用离线演示入口（index.html）顶栏的「角色切换」后重试。");
            return;
          }
          e.preventDefault();
          if (mod.directAction) {
            clearNavHighlight();
            navEl.classList.add('nav-item--module-active');
            closePanels();
            var dAct = mod.directAction;
            var dLab = mod.text || "";
            if (typeof window.navigateBySidebarAction === 'function') {
              try {
                window.navigateBySidebarAction(dAct, { label: dLab });
              } catch (eNavDir) {}
            }
            var hrefMap = window.SIDEBAR_ACTION_HREF || actionHref || {};
            var hrefDir = hrefMap[dAct] || "";
            if (hrefDir) safeJumpMaster(hrefDir);
            return;
          }
          clearNavHighlight();
          navEl.classList.add('nav-item--module-active');
          closePanels();
          if (k === 'retired') {
            openPanel(retiredPanel);
            bindPanelActions(retiredPanel);
            return;
          }
          if (k === 'physicalMgmt') {
            var physRow = document.getElementById('physicalMgmtSecondaryRow');
            if (physRow && mod.rowHtml) {
              physRow.innerHTML = applyRoleAclToRowHtml(mod.rowHtml);
              bindPanelActions(physicalMgmtPanel);
            }
            openPhysicalMgmtPanel();
            return;
          }
          closePhysicalMgmtPanel();
          var rowEl = resolveSecondaryRow();
          if (rowEl && mod.rowHtml) {
            rowEl.innerHTML = applyRoleAclToRowHtml(mod.rowHtml);
            bindPanelActions(secondaryPanel);
          }
          openPanel(secondaryPanel);
        } catch (err) {
          // 兜底：若二级菜单渲染异常，至少允许主菜单继续跳转
          try {
            var href = (navEl.getAttribute && navEl.getAttribute('href')) || '';
            if (href && href !== '#') {
              window.location.href = href;
            }
          } catch (e2) {}
        }
      });
    });
    applyRoleAclToSidebar();
    window.addEventListener('demo-org-role-change', function () {
      applyRoleAclToSidebar();
      closePanels();
    });

    // 页面加载时，根据当前文件名高亮模块
    var path = (window.location.pathname || '').split('/').pop();
    var byPath = {
      'index.html': 'home',
      'cockpit.html': 'cockpit',
      'cockpit-analytics.html': 'cockpit',
      'module-home.html': 'cockpit',
      'cockpit_副本.html': 'cockpit',
      'my-tasks.html': 'task',
      'my-tasks-prototype-list.html': 'task',
      'procurement-application.html': 'purchaseMgmt',
      'purchase-management-hub.html': 'purchaseMgmt',
      'purchase-material-info-management.html': 'purchaseMgmt',
      'sales-material-list.html': 'salesMgmt',
      'sales-order-management.html': 'salesMgmt',
      'sales-purchased-materials.html': 'salesMgmt',
      'sales-contract-report.html': 'salesMgmt',
      'inventory-task-management.html': 'inventoryMgmt',
      'inventory-difference-handling.html': 'inventoryMgmt',
      'purchase-prototype-list.html': 'purchaseMgmt',
      'purchase-pm-nonbid.html': 'purchaseMgmt',
      'purchase-pm-plan.html': 'purchaseMgmt',
      'purchase-pm-longterm-result.html': 'purchaseMgmt',
      'purchase-pm-repurchase.html': 'purchaseMgmt',
      'purchase-pm-minutes.html': 'purchaseMgmt',
      'purchase-pm-bid.html': 'purchaseMgmt',
      'purchase-pm-terminate.html': 'purchaseMgmt',
      'purchase-pm-group-plan.html': 'purchaseMgmt',
      'purchase-pm-under15.html': 'purchaseMgmt',
      'purchase-pm-monthly-bid.html': 'purchaseMgmt',
      'purchase-pm-monthly-nonbid.html': 'purchaseMgmt',
      'purchase-pm-notice-nonbid.html': 'purchaseMgmt',
      'purchase-pm-data-maintain.html': 'purchaseMgmt',
      'purchase-pm-archive.html': 'purchaseMgmt',
      'purchase-pm-longterm-use.html': 'purchaseMgmt',
      'purchase-plan-management.html': 'purchaseMgmt',
      'purchase-data-ledger.html': 'purchaseMgmt',
      'contract-management.html': 'purchaseMgmt',
      'order-demand-management.html': 'purchaseMgmt',
      'purchase-ledger.html': 'physicalMgmt',
      'proc-quality-accept.html': 'physicalMgmt',
      'cargo-ledger.html': 'purchaseMgmt',
      'material-procurement-hub.html': 'purchaseMgmt',
      'return-exchange-management.html': 'purchaseMgmt',
      'carrier-management.html': 'logistics',
      'logistics-contract.html': 'logistics',
      'logistics-tracking.html': 'logistics',
      'logistics-payment.html': 'logistics',
      'warehouse.html': 'warehouse',
      'receipt-inbound.html': 'warehouse',
      'scan-pick.html': 'warehouse',
      'slot-management.html': 'warehouse',
      'inventory-check.html': 'warehouse',
      'warehouse-maintenance.html': 'warehouse',
      'domestic-substitution.html': 'warehouse',
      'inventory-management.html': 'warehouse',
      'idle-materials.html': 'warehouse',
      'retire-scrap-application.html': 'retired',
      'equipment-evaluation.html': 'retired',
      'big-small-reuse.html': 'retired',
      'retired-module-hub.html': 'retired',
      'retired-prototype-list.html': 'retired',
      'goods-transfer-out.html': 'retired',
      'performance-hub.html': 'performance',
      'notice-hub.html': 'notice',
      'integrated-business-hub.html': 'biz',
      'repair-domestic-hub.html': 'biz',
      'system-admin-hub.html': 'system',
      'system-prototype-list.html': 'system',
      'subpage-template.html': 'devtools',
      'demo-all-in-one.html': 'devtools',
      'demo-all-pages-interactive.html': 'devtools',
      'demo-interactive-single.html': 'devtools',
      'devtools-prototype-list.html': 'devtools',
      'base-data-material-ledger.html': 'dataNav',
      'data-base-fixed.html': 'dataNav',
      'data-code-fixed.html': 'dataNav',
      'data-contract-fixed.html': 'dataNav',
      'data-supplier-fixed.html': 'dataNav',
      'data-prototype-list.html': 'dataNav',
      'assets-personal.html': 'asset',
      'assets-department.html': 'asset',
      'assets-company.html': 'asset',
      'asset-transfer-management.html': 'asset',
      'asset-nature-change-management.html': 'asset',
      'asset-inventory-management.html': 'asset'
    };
    var currentModule = byPath[path];
    var isMyTasksPage = path && String(path).indexOf("my-tasks") === 0;
    if (path === "index-portal-screen-alt.html" || path === "index-portal-screen-alt-packed.html") {
      var navHome = findNavByText("首页");
      if (navHome) navHome.classList.add("nav-item--module-active");
    } else if (isMyTasksPage) {
      var navTodo = findNavByText("我的任务");
      if (navTodo) navTodo.classList.add("nav-item--module-active");
    } else if (currentModule && modules[currentModule]) {
      var effectiveModule = currentModule;
      if (path === "material-procurement-hub.html" && isPhysicalMgmtPage(path, location.search)) {
        effectiveModule = "physicalMgmt";
      }
      var nav = findNavByText(modules[effectiveModule].text);
      if (nav) nav.classList.add("nav-item--module-active");
      if (effectiveModule === "physicalMgmt") {
        syncPhysicalMgmtPanelsForPage(path, location.search);
      }
    }

    bindPanelActions(physicalMgmtPanel);

    // 点击主内容区关闭蓝色框
    var main = document.querySelector('.main-scroll');
    if (main) {
      main.addEventListener('click', function () {
        closePanels();
      });
    }
  }

  function installShellQuickActions() {
    var body = document.body;
    var layout = document.querySelector('.layout');
    var hamburger = document.querySelector('.header-hamburger');
    var avatar = document.querySelector('.user-avatar');
    if (!body || !layout) return;

    var lockSidebarExpanded = body.classList.contains('page-screen-alt');
    if (lockSidebarExpanded) {
      body.classList.remove('sidebar-collapsed');
    }

    if (hamburger && !hamburger.__boundSidebarToggle) {
      hamburger.__boundSidebarToggle = true;
      hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        if (lockSidebarExpanded) return;
        body.classList.toggle('sidebar-collapsed');
      });
    }

    if (!avatar || avatar.__boundUserMenu) return;
    avatar.__boundUserMenu = true;
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', '用户菜单');

    var menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = '<button type="button" class="user-menu-btn" data-action="logout">退出登录</button>';
    document.body.appendChild(menu);

    function closeMenu() {
      menu.classList.remove('is-open');
    }

    function openMenu() {
      var rect = avatar.getBoundingClientRect();
      menu.style.top = rect.bottom + 8 + 'px';
      menu.style.left = Math.max(8, rect.right - 120) + 'px';
      menu.classList.add('is-open');
    }

    avatar.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    avatar.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (menu.classList.contains('is-open')) closeMenu();
        else openMenu();
      }
    });

    menu.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-action="logout"]') : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
      window.showActionConfirm("退出登录", "确定退出登录？", function () {
        try { sessionStorage.removeItem('portalLoggedIn_v1'); } catch (err) {}
        window.location.href = 'index.html';
      });
    });

    document.addEventListener('click', function (e) {
      if (e.target === avatar || avatar.contains(e.target) || menu.contains(e.target)) return;
      closeMenu();
    });
  }

  /**
   * 子页顶通栏面包屑：首页 / 模块 / 当前页（与侧栏 nav-item--module-active + document.title 一致）
   */
  function guessBreadcrumbModule(file) {
    if (!file) return "";
    var f = file.toLowerCase();
    if (f === "purchase-plan-approval-handle.html") return "我的任务";
    if (f.indexOf("my-tasks") === 0) return "我的任务";
    if (f.indexOf("scrap-identification") >= 0 || f.indexOf("retire") === 0 || f.indexOf("retired-") === 0 || f === "big-small-reuse.html" || f === "goods-transfer-out.html")
      return "报废计划与报废申请";
    if (f === "inventory-task-management.html" || f === "inventory-difference-handling.html") return "盘点管理";
    if (f.indexOf("assets-") === 0 || f.indexOf("asset-") === 0 || f === "equipment-evaluation.html") return "我的资产";
    if (f.indexOf("carrier-") === 0 || f.indexOf("logistics-") === 0) return "物流管理";
    if (
      f === "warehouse.html" ||
      f === "receipt-inbound.html" ||
      f === "scan-pick.html" ||
      f === "slot-management.html" ||
      f === "inventory-check.html" ||
      f === "warehouse-maintenance.html" ||
      f === "domestic-substitution.html" ||
      f === "inventory-management.html" ||
      f === "idle-materials.html" ||
      f.indexOf("warehouse-io-ledger") === 0 ||
      f.indexOf("warehouse-stock-ledger") === 0
    )
      return "仓储管理";
    if (
      f.indexOf("purchase-") === 0 ||
      f === "order-demand-management.html" ||
      f === "contract-management.html" ||
      f === "cargo-ledger.html" ||
      f === "procurement-application.html" ||
      f.indexOf("material-procurement") === 0 ||
      f.indexOf("purchase-management-hub") === 0 ||
      f.indexOf("proc-") === 0 ||
      f.indexOf("purchase-material") === 0 ||
      f.indexOf("purchase-plan") === 0 ||
      f === "purchase-ledger.html" ||
      f.indexOf("purchase-summary") === 0 ||
      f.indexOf("purchase-prototype") === 0 ||
      f === "return-exchange-management.html"
    )
      return "物资采购";
    if (f.indexOf("base-data") === 0 || f.indexOf("data-code") === 0 || f.indexOf("data-contract") === 0 || f.indexOf("data-supplier") === 0 || f.indexOf("data-base") === 0 || f.indexOf("data-prototype") === 0)
      return "数据管理";
    if (f.indexOf("notice-") === 0 || f.indexOf("notice-hub") === 0 || f.indexOf("notice-prototype") === 0) return "公告管理";
    if (f.indexOf("performance-hub") === 0) return "绩效考核";
    if (f === "repair-domestic-hub.html") return "综合业务管理";
    if (f.indexOf("integrated-business") === 0 || f.indexOf("biz-standard") === 0) return "综合业务管理";
    if (f.indexOf("cockpit-analytics") === 0 || f.indexOf("cockpit-hub") === 0) return "驾驶舱";
    if (f.indexOf("system-") === 0 || f.indexOf("devtools") === 0 || f.indexOf("oa-flow") === 0 || f.indexOf("system-admin-hub") === 0) return "系统管理";
    return "";
  }

  function installSubpageBreadcrumb() {
    try {
      var body = document.body;
      if (!body || body.getAttribute("data-breadcrumb") === "none") return;
      if (!body.classList.contains("page-subpage")) return;
      if (!body.classList.contains("page-source-navbar")) return;

      var main = document.querySelector(".main-scroll");
      if (!main) return;
      var existingNav = main.querySelector(".apm-breadcrumb, nav.subpage-breadcrumb");

      var path = "";
      try {
        path = (location.pathname || "").split("/").pop() || "";
      } catch (ePath) {}
      var file = (path.split("?")[0] || "").toLowerCase();
      if (
        file === "index-portal-screen-alt.html" ||
        file === "demo-login-placeholder.html" ||
        file === "module-home.html" ||
        file === "index.html"
      )
        return;

      var inner = main.querySelector(".carrier-main-inner, .apm-wrap");
      var host = inner || main;
      if (!existingNav && host !== main) {
        existingNav = host.querySelector(".apm-breadcrumb, nav.subpage-breadcrumb");
      }

      var mod = "";
      var act = document.querySelector(".sidebar .nav-item--module-active .nav-label");
      if (act) mod = (act.textContent || "").replace(/\s+/g, " ").trim();
      if (!mod) mod = guessBreadcrumbModule(file);
      if (!mod) mod = "物资采购";

      function resolvePurchaseMgmtLabel(fileName, query) {
        var pageSub = "";
        try {
          pageSub = (new URLSearchParams(query || "")).get("pageSub") || "";
        } catch (ePageSub) {}
        if (pageSub) return pageSub;
        var tab = "";
        try {
          tab = (new URLSearchParams(query || "")).get("tab") || "";
        } catch (eTab) {}
        if (fileName === "material-procurement-hub.html") {
          if (!tab) {
            try {
              tab = String(document.documentElement.getAttribute("data-proc-tab") || "");
            } catch (eTab2) {}
          }
          if (!tab) {
            try {
              tab = String(sessionStorage.getItem("demoPurchaseTab") || "");
            } catch (eTab3) {}
          }
        }
        if (fileName === "procurement-application.html") return "采购申请";
        if (fileName === "material-procurement-hub.html") {
          if (tab === "m2") return "采购申请";
          if (tab === "m3") return "订单需求管理";
          if (tab === "m10") return "库存管理";
        }
        if (fileName === "order-demand-management.html") return "订单需求管理";
        if (fileName === "sales-material-list.html") return "物资列表";
        if (fileName === "sales-order-management.html") return "订单管理";
        if (fileName === "sales-purchased-materials.html") return "购入物资";
        if (fileName === "sales-contract-report.html") return "销售合同报表管理";
        if (fileName === "contract-management.html") return "合同信息管理";
        if (fileName === "purchase-material-info-management.html") return "物资采购信息管理";
        if (fileName === "purchase-plan-management.html") return "采购信息台帐";
        if (fileName === "purchase-summary-report.html") return "采购合同报表管理";
        if (fileName === "proc-acceptance-inbound.html") return "公司层面入库";
        if (fileName === "proj-company-inbound.html") return "项目公司入库";
        if (fileName === "proc-use-approval.html") return "领用申请";
        if (fileName === "proc-sales-contract.html") return "销售合同管理";
        if (fileName === "proc-shipment.html") return "发货管理";
        if (fileName === "proc-quality-accept.html") return "库存管理";
        if (fileName === "return-exchange-management.html") return "退换货物管理";
        if (fileName === "purchase-ledger.html") {
          if (tab === "requisition") return "领用记录";
          if (tab === "ledger" || tab === "mat-physical" || tab === "material" || tab === "cargo" || tab === "mat-contract") return "物资领用";
          if (tab === "ledger-data" || tab === "plan" || tab === "data") return "采购数据台账";
          if (!tab || tab === "apply") return "物资领用";
        }
        return "";
      }

      function resolveRetiredScrapLabel(fileName, query) {
        if (fileName !== "retire-scrap-application.html") return "";
        var view = "";
        try {
          view = (new URLSearchParams(query || "")).get("view") || "";
        } catch (eView) {}
        if (view === "plan") return "报废计划提报";
        if (view === "apply") return "报废申请";
        return "报废计划提报";
      }

      function resolveMyTasksLabel(fileName, query) {
        var scene = "";
        try {
          scene = (new URLSearchParams(query || "")).get("scene") || "";
        } catch (eScene) {}
        if (!scene) {
          try {
            scene = (new URLSearchParams(query || "")).get("tab") || "";
          } catch (eTabScene) {}
        }
        if (!scene) {
          try {
            scene = String(document.body && document.body.getAttribute("data-scene") || "");
          } catch (eBodyScene) {}
        }
        if (!scene && fileName === "my-tasks-todo.html") scene = "todo";
        if (!scene && fileName === "my-tasks-done.html") scene = "done";
        if (!scene && fileName === "my-tasks-cc.html") scene = "cc";
        if (!scene && (fileName === "my-tasks-prototype-list.html" || fileName === "my-tasks.html")) scene = "initiated";
        var map = {
          initiated: "我发起的",
          todo: "我的待办",
          done: "我的已办",
          cc: "我的抄送"
        };
        return map[scene] || "";
      }

      var purchaseSub = "";
      if (mod === "物资采购" || mod === "采购管理") {
        purchaseSub = resolvePurchaseMgmtLabel(file, location.search);
      }
      var taskSub = "";
      if (file.indexOf("my-tasks") === 0) {
        taskSub = resolveMyTasksLabel(file, location.search);
      }
      var retiredSub = resolveRetiredScrapLabel(file, location.search);
      var pageLabel = taskSub || purchaseSub || retiredSub;
      if (!pageLabel && file === "base-data-material-ledger.html") {
        pageLabel = "物资类型";
      }
      if (!pageLabel) {
        var tm = document.title.match(/^(.+?)(\s*[-–]\s*)/);
        if (tm) pageLabel = tm[1].trim();
        else pageLabel = (document.title || "").split(/[-–]/)[0].trim();
      }
      if (!pageLabel) pageLabel = "当前页";

      var displayMod = mod;
      if (taskSub) displayMod = "我的任务";
      if (purchaseSub) displayMod = "物资采购";
      if (retiredSub) displayMod = "报废计划与报废申请";
      // 库存管理和物资领用显示实物管理
      if (pageLabel === "库存管理" || pageLabel === "物资领用") displayMod = "实物管理";
      if (displayMod === "业务功能") {
        var purchaseLike = [
          "物资领用",
          "领用记录",
          "流转记录",
          "物资统计",
          "采购信息台帐",
          "合同信息管理",
          "库存管理",
          "采购数据台账"
        ];
        if (purchaseLike.indexOf(pageLabel) >= 0 && pageLabel !== "库存管理" && pageLabel !== "物资领用") displayMod = "物资采购";
      }

      if (existingNav) {
        var segs = existingNav.querySelectorAll("a, span:not(.sep)");
        if (segs.length >= 3) {
          if (taskSub) {
            segs[1].textContent = "我的任务";
          } else if (purchaseSub) {
            // 库存管理和物资领用显示实物管理，其他显示物资采购
            if (pageLabel === "库存管理" || pageLabel === "物资领用") {
              segs[1].textContent = "实物管理";
            } else {
              segs[1].textContent = "物资采购";
            }
          } else if (retiredSub) {
            segs[1].textContent = "报废计划与报废申请";
          }
          segs[2].textContent = pageLabel;
        } else if (segs.length > 0) {
          segs[segs.length - 1].textContent = pageLabel;
        }
        return;
      }

      var nav = document.createElement("nav");
      nav.className = "subpage-breadcrumb";
      nav.setAttribute("aria-label", "面包屑");

      var a = document.createElement("a");
      a.href = "index-portal-screen-alt.html";
      a.textContent = "首页";
      nav.appendChild(a);

      function sep() {
        var s = document.createElement("span");
        s.className = "sep";
        s.textContent = "/";
        return s;
      }
      function spanText(t) {
        var s = document.createElement("span");
        s.textContent = t;
        return s;
      }

      nav.appendChild(sep());
      nav.appendChild(spanText(displayMod));
      nav.appendChild(sep());
      nav.appendChild(spanText(pageLabel));

      if (inner) inner.insertBefore(nav, inner.firstChild);
      else main.insertBefore(nav, main.firstChild);
    } catch (eBc) {}
  }

  function installUnifiedOpViewStyles() {
    if (!document.head || document.getElementById("mapUnifiedOpViewStyle")) return;
    var style = document.createElement("style");
    style.id = "mapUnifiedOpViewStyle";
    style.textContent =
      ".map-op-view-link,.map-op-action-link{" +
      "padding:0!important;border:none!important;background:transparent!important;box-shadow:none!important;" +
      "color:#1677ff!important;font-size:14px!important;font-weight:600!important;line-height:1.2!important;" +
      "text-decoration:none!important;cursor:pointer;" +
      "}" +
      ".carrier-op,.map-ledger-op,.map-op-cell button,.map-op-cell a,[data-ops] button,[data-ops] a,td .carrier-btn-add[data-act],td .carrier-btn-add[data-ledger-op]{" +
      "padding:0!important;border:none!important;background:transparent!important;box-shadow:none!important;outline:none!important;" +
      "color:#1677ff!important;font-size:14px!important;font-weight:600!important;line-height:1.2!important;text-decoration:none!important;cursor:pointer;" +
      "}" +
      ".carrier-op:hover,.map-ledger-op:hover,.map-op-cell button:hover,.map-op-cell a:hover,[data-ops] button:hover,[data-ops] a:hover,td .carrier-btn-add[data-act]:hover,td .carrier-btn-add[data-ledger-op]:hover{" +
      "color:#4096ff!important;text-decoration:none!important;}" +
      ".map-op-view-link:hover,.map-op-action-link:hover{color:#4096ff!important;text-decoration:none!important;}" +
      ".map-op-cell{white-space:nowrap;}" +
      ".map-op-cell button,.map-op-cell a{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;}" +
      ".map-op-cell button:not(:last-child),.map-op-cell a:not(:last-child){margin-right:16px!important;}" +
      ".map-op-cell .cm-ops,.map-op-cell .ppm-ops,.map-op-cell .ml-ops{display:inline-flex!important;align-items:center!important;gap:16px!important;flex-wrap:nowrap!important;}" +
      ".map-op-cell .cm-ops button,.map-op-cell .ppm-ops button,.map-op-cell .ml-ops button{margin-right:0!important;}" +
      ".map-flow-mask{position:fixed;inset:0;background:rgba(10,20,40,.42);z-index:2147483647;display:none;align-items:center;justify-content:center;padding:18px;}" +
      ".map-flow-mask.show{display:flex;}" +
      ".map-flow-dialog{width:min(1240px,96vw);background:#fff;border-radius:8px;box-shadow:0 20px 56px rgba(0,0,0,.26);overflow:hidden;}" +
      ".map-flow-hd{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #edf2f8;font-size:20px;font-weight:700;color:#1f2d3d;}" +
      ".map-flow-close{border:none;background:transparent;color:#8c8c8c;font-size:22px;cursor:pointer;line-height:1;}" +
      ".map-flow-body{padding:10px 14px 16px;}" +
      ".map-flow-tabs{display:flex;gap:16px;padding:2px 0 0;border-bottom:1px solid #d0d7e2;}" +
      ".map-flow-tab{border:none;background:transparent;padding:0 4px 12px;font-size:13px;color:#5f6f82;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-1px;}" +
      ".map-flow-tab.is-active{color:#1677ff;border-bottom:3px solid #1677ff;text-decoration:none;}" +
      ".map-flow-pane{display:none;padding-top:14px;}" +
      ".map-flow-pane.is-active{display:block;}" +
      ".map-flow-track{border:1px solid #f0f2f5;border-radius:8px;padding:22px 18px;overflow:visible;}" +
      ".map-flow-row{display:flex;align-items:center;flex-wrap:nowrap;gap:6px;overflow-x:auto;}" +
      ".map-flow-node{min-width:0;max-width:none;padding:8px 8px;border-radius:10px;border:1px solid #cfe8cf;background:#edf8ed;color:#315c35;font-size:11.5px;line-height:1.3;text-align:center;white-space:normal;display:flex;align-items:center;justify-content:center;word-break:break-word;grid-column:span 1;}" +
      ".map-flow-node.end{min-height:42px;font-size:11.5px;background:#fff8e6;border-color:#f0dca8;color:#7a5a14;}" +
      ".map-flow-node.is-current,.map-flow-node.is-pending{background:#fff7e6;border-color:#f6c86f;color:#8a5a00;}" +
      ".map-flow-node.is-future{background:#f4f6fa;border-color:#dde3ed;color:#8898b2;}" +
      "/* map-flow-bust:20260615-v5 */" +
      ".map-flow-dot{width:10px;height:10px;border-radius:999px;border:1px solid #7bc67b;background:#ddf5dd;flex:none;}" +
      ".map-flow-dot.end{border-color:#f0dca8;background:#fff8e8;}" +
      ".map-flow-arrow{color:#8ca0b3;font-size:16px;line-height:1;display:inline-block;flex:none;padding:0 2px;}" +
      ".map-flow-info{font-size:13px;color:#4f647a;line-height:1.9;}" +
      ".map-flow-timeline{padding:10px 0 0;}" +
      ".map-flow-tl-item{display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:12px;align-items:start;position:relative;}" +
      ".map-flow-tl-dot{grid-column:1;width:14px;height:14px;border-radius:50%;flex-shrink:0;margin-top:6px;justify-self:center;position:relative;z-index:1;box-shadow:0 0 0 4px rgba(22,119,255,.10);}" +
      ".map-flow-tl-line{position:absolute;top:18px;bottom:-8px;left:6px;width:2px;background:#d8e1ee;}" +
      ".map-flow-tl-last .map-flow-tl-line{display:none;}" +
      ".map-flow-tl-body{grid-column:2;padding:0 0 24px;min-width:0;}" +
      ".map-flow-tl-last .map-flow-tl-body{padding-bottom:0;}" +
      ".map-flow-tl-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;}" +
      ".map-flow-tl-person{font-weight:700;color:#1f3551;font-size:16px;}" +
      ".map-flow-tl-time{color:#64748b;font-size:14px;}" +
      ".map-flow-tl-badge{padding:4px 10px;border-radius:6px;font-size:13px;font-weight:700;}" +
      ".map-flow-tl-content{font-size:14px;color:#51627a;line-height:1.8;font-weight:500;}" +
      ".map-flow-info-table{width:100%;border-collapse:collapse;font-size:13px;color:#34495e;}" +
      ".map-flow-info-table th,.map-flow-info-table td{border:1px solid #e8edf3;padding:10px 12px;text-align:left;vertical-align:top;line-height:1.6;}" +
      ".map-flow-info-table th{background:#f5f7fa;color:#1f2d3d;font-weight:700;}" +
      ".map-flow-ft{padding:10px 16px;border-top:1px solid #edf2f8;display:flex;justify-content:flex-end;}" +
      ".map-flow-ft button{height:32px;padding:0 16px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:#3a4a5a;cursor:pointer;}" +
      ".map-approval-status-pill{display:inline-flex!important;align-items:center;justify-content:center;min-width:0!important;height:auto!important;padding:2px 8px!important;border-radius:999px!important;border:1px solid #d9d9d9;background:#fff;font-size:12px!important;font-weight:500!important;line-height:1.25!important;box-sizing:border-box;white-space:nowrap;vertical-align:middle;}" +
      ".map-approval-status-pending{color:#d48806!important;border-color:#f3d7a1!important;background:#fff8e6!important;}" +
      ".map-approval-status-pass{color:#1677ff!important;border-color:#91caff!important;background:#e6f4ff!important;}" +
      ".map-approval-status-reject{color:#cf1322!important;border-color:#ffb3b3!important;background:#ffffff!important;}" +
      ".map-approval-status-draft{color:#262626!important;border-color:#d9d9d9!important;background:#ffffff!important;}" +
      ".map-approval-status-withdraw{color:#262626!important;border-color:#d9d9d9!important;background:#ffffff!important;}" +
      ".map-top-btn-unified{height:34px!important;min-width:88px!important;padding:0 12px!important;border-radius:8px!important;border:1px solid #bcd7ff!important;background:#fff!important;color:#1677ff!important;font-size:14px!important;font-weight:600!important;line-height:32px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;box-sizing:border-box!important;white-space:nowrap!important;}" +
      ".map-top-btn-unified:hover{color:#4096ff!important;border-color:#91caff!important;background:#f7fbff!important;}" +
      ".map-top-btn-unified.map-top-btn-primary{background:#1677ff!important;border-color:#1677ff!important;color:#fff!important;}" +
      ".map-top-btn-unified.map-top-btn-primary:hover{background:#4096ff!important;border-color:#4096ff!important;color:#fff!important;}" +
      ".map-top-btn-unified.map-top-btn-import{border-color:#95de64!important;color:#389e0d!important;background:#fff!important;}" +
      ".map-top-btn-unified.map-top-btn-danger{border-color:#ffccc7!important;color:#cf1322!important;background:#fff5f5!important;}" +
      ".map-top-btn-unified.map-top-btn-danger:hover{border-color:#ffb3b3!important;background:#fff1f0!important;}" +
      ".map-top-btn-unified i{font-size:14px!important;line-height:1!important;}";
    document.head.appendChild(style);
  }

  function installUnifiedTopButtons() {
    var KEYWORDS = [
      { k: "新增", tone: "primary" },
      { k: "导入", tone: "import" },
      { k: "下载模板", tone: "normal" },
      { k: "下载模版", tone: "normal" },
      { k: "导出", tone: "normal" },
      { k: "删除", tone: "danger" },
      { k: "批量删除", tone: "danger" }
    ];
    function textOf(el) {
      return String((el && el.textContent) || "").replace(/\s+/g, "");
    }
    function inTopArea(el) {
      if (!el || !el.closest) return false;
      if (el.closest("tbody") || el.closest(".modal") || el.closest("[role='dialog']")) return false;
      return !!el.closest(".carrier-toolbar,.search-row,.filters,.map-ledger-actions,.toolbar,.actions");
    }
    function patchAll() {
      Array.prototype.forEach.call(document.querySelectorAll("button,a"), function (el) {
        var txt = textOf(el);
        var tone = "";
        for (var i = 0; i < KEYWORDS.length; i++) {
          if (txt.indexOf(KEYWORDS[i].k) >= 0) {
            tone = KEYWORDS[i].tone;
            break;
          }
        }
        if (!tone) return;
        if (!inTopArea(el)) return;
        el.classList.add("map-top-btn-unified");
        el.classList.remove("map-top-btn-primary", "map-top-btn-import", "map-top-btn-danger");
        if (tone === "primary") el.classList.add("map-top-btn-primary");
        if (tone === "import") el.classList.add("map-top-btn-import");
        if (tone === "danger") el.classList.add("map-top-btn-danger");
      });
    }
    patchAll();
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        patchAll();
      }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function installApprovalStatusPlainText() {
    var file = (location.pathname || "").split("/").pop();
    var targets = {
      "material-procurement-hub.html": 1,
      "procurement-application.html": 1,
      "order-demand-management.html": 1,
      "contract-management.html": 1,
      "proc-project-accept.html": 1,
      "purchase-data-ledger.html": 1,
      "purchase-plan-table.html": 1,
      "purchase-plan-management.html": 1,
      "purchase-ledger.html": 1,
      "cargo-ledger.html": 1,
      "purchase-summary-report.html": 1,
      "proc-acceptance-inbound.html": 1,
      "proc-use-approval.html": 1,
      "proc-sales-contract.html": 1,
      "proc-shipment.html": 1,
      "proc-quality-accept.html": 1,
      "return-exchange-management.html": 1,
      "proj-company-inbound.html": 1
    };
    if (!targets[file]) return;

    var STATUS_SET = {
      "草稿": "draft",
      "审批中": "pending",
      "待确认": "pending",
      "待验收": "pending",
      "验收中": "pending",
      "待入库": "pending",
      "待发货": "pending",
      "待审核": "pending",
      "已通过": "pass",
      "已确认": "pass",
      "已生效": "pass",
      "已批准": "pass",
      "已出库": "pass",
      "已发货": "pass",
      "已签收": "pass",
      "已完成": "pass",
      "审核通过": "pass",
      "已驳回": "reject",
      "不通过": "reject",
      "已拒绝": "reject",
      "已撤回": "withdraw"
    };

    function normalizeText(s) {
      return String(s || "").replace(/\s+/g, "");
    }

    function stripTagClasses(el) {
      if (!el || !el.classList) return;
      var remove = [];
      el.classList.forEach(function (cn) {
        if (/^tag-/.test(cn) || cn === "tag") remove.push(cn);
      });
      remove.forEach(function (cn) { el.classList.remove(cn); });
    }

    function patchOne(el) {
      if (!el || !el.closest) return;
      if (el.closest(".proc-ops-cell,.map-op-cell,[data-order-op]")) return;
      if (el.classList && el.classList.contains("map-approval-status-pill")) return;
      if (el.querySelector && el.querySelector(".map-approval-status-pill")) return;
      if (
        el.parentElement &&
        el.parentElement.classList &&
        el.parentElement.classList.contains("map-approval-status-pill")
      ) {
        return;
      }
      var txt = normalizeText(el.textContent || "");
      var tone = STATUS_SET[txt];
      if (!tone) return;
      if (el.querySelector("a,button,input,select,textarea")) return;
      stripTagClasses(el);
      el.classList.remove(
        "map-approval-status-pending",
        "map-approval-status-pass",
        "map-approval-status-reject",
        "map-approval-status-draft",
        "map-approval-status-withdraw"
      );
      el.classList.add("map-approval-status-pill");
      if (tone === "pending") el.classList.add("map-approval-status-pending");
      else if (tone === "pass") el.classList.add("map-approval-status-pass");
      else if (tone === "reject") el.classList.add("map-approval-status-reject");
      else if (tone === "withdraw") el.classList.add("map-approval-status-withdraw");
      else el.classList.add("map-approval-status-draft");
    }

    function patchStatusCellsByHeader(root) {
      var host = root && root.querySelectorAll ? root : document;
      var tables = host.querySelectorAll("table");
      Array.prototype.forEach.call(tables, function (table) {
        var headRows = table.querySelectorAll("thead tr");
        if (!headRows.length) return;
        var lastHead = headRows[headRows.length - 1];
        var ths = lastHead.querySelectorAll("th");
        var stIdx = -1;
        Array.prototype.forEach.call(ths, function (th, idx) {
          var t = normalizeText(th.textContent || "");
          if (t.indexOf("状态") >= 0 || t.indexOf("进度") >= 0 || t.indexOf("结论") >= 0 || t.indexOf("节点") >= 0) {
            stIdx = idx;
          }
        });
        if (stIdx < 0) return;
        var rows = table.querySelectorAll("tbody tr");
        Array.prototype.forEach.call(rows, function (tr) {
          var tds = tr.querySelectorAll("td");
          if (!tds.length || stIdx >= tds.length) return;
          var td = tds[stIdx];
          var candidate = td.querySelector("span,div") || td;
          var txt = normalizeText(candidate.textContent || td.textContent || "");
          if (!txt || txt === "—" || /\d/.test(txt)) return;
          patchOne(candidate);
        });
      });
    }

    function apply(root) {
      var box = root && root.querySelectorAll ? root : document;
      var nodes = box.querySelectorAll("td .tag-soft, td [class*='tag-'], td span, td div");
      Array.prototype.forEach.call(nodes, patchOne);
      patchStatusCellsByHeader(box);
    }

    apply(document);
    var pending = false;
    function scheduleApply(targetRoot) {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        apply(targetRoot || document);
      }, 80);
    }
    var mo = new MutationObserver(function (mutations) {
      var touched = null;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "childList") {
          if (m.addedNodes && m.addedNodes.length) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n && n.nodeType === 1) {
                touched = n;
                break;
              }
            }
          }
        }
        if (touched) break;
      }
      scheduleApply(touched || document);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function markUnifiedOpViewButtons(root) {
    var box = root && root.querySelectorAll ? root : document;
    var nodes = box.querySelectorAll("button, a");
    nodes.forEach(function (el) {
      var txt = (el.textContent || "").replace(/\s+/g, "");
      var act = (el.getAttribute("data-act") || "").toLowerCase();
      var isView =
        /^查看/.test(txt) ||
        txt.indexOf("查看详情") >= 0 ||
        txt.indexOf("查看进度") >= 0 ||
        txt.indexOf("查看物流") >= 0 ||
        txt.indexOf("流程进度") >= 0 ||
        act === "detail" ||
        act === "details" ||
        act === "details" ||
        act === "progress" ||
        act === "progresss";
      if (!isView) return;
      el.classList.add("map-op-view-link");
      if (el.style) {
        el.style.border = "none";
        el.style.background = "transparent";
        el.style.boxShadow = "none";
      }
    });
  }

  function markOperationColumnButtons(root) {
    var file = (location.pathname || "").split("/").pop();
    var host = root && root.querySelectorAll ? root : document;
    var tables = host.querySelectorAll("table");
    tables.forEach(function (table) {
      if (
        file === "purchase-ledger.html" &&
        table.closest &&
        table.closest("#detailMask")
      ) {
        return;
      }
      var headRows = table.querySelectorAll("thead tr");
      if (!headRows.length) return;
      var opIndex = -1;
      var lastHead = headRows[headRows.length - 1];
      var ths = lastHead.querySelectorAll("th");
      ths.forEach(function (th, idx) {
        var txt = (th.textContent || "").replace(/\s+/g, "");
        if (txt === "操作" || txt.indexOf("操作") === 0) opIndex = idx;
      });
      if (opIndex < 0) return;
      table.querySelectorAll("tbody tr").forEach(function (tr) {
        var tds = tr.querySelectorAll("td");
        if (!tds.length || opIndex >= tds.length) return;
        var opTd = tds[opIndex];
        opTd.classList.add("map-op-cell");
        opTd.querySelectorAll("button, a").forEach(function (btn) {
          btn.classList.add("map-op-action-link");
          if (btn.style) {
            btn.style.border = "none";
            btn.style.background = "transparent";
            btn.style.boxShadow = "none";
          }
        });
      });
    });
  }

  function getStatusColumnIndex(table) {
    var headRows = table.querySelectorAll("thead tr");
    if (!headRows.length) return -1;
    var lastHead = headRows[headRows.length - 1];
    var ths = lastHead.querySelectorAll("th");
    var idx = -1;
    ths.forEach(function (th, i) {
      var t = (th.textContent || "").replace(/\s+/g, "");
      if (!t) return;
      if (
        t.indexOf("状态") >= 0 ||
        t.indexOf("流程进度") >= 0 ||
        t.indexOf("审批") >= 0 ||
        t.indexOf("节点") >= 0 ||
        t.indexOf("结论") >= 0
      ) {
        idx = i;
      }
    });
    return idx;
  }

  function getAllowedOpsByStatus(statusText) {
    var s = String(statusText || "").replace(/\s+/g, "");
    var editableAndDeletable = ["草稿", "已驳回", "已拒绝", "已撤回"];
    var editableNoDelete = ["不通过", "待发货"];
    var viewOnly = [
      "审批中", "待确认", "已确认", "已通过", "已生效", "已批准", "已出库",
      "已发货", "已签收", "已完成", "待验收", "验收中", "待入库", "待审核", "审核通过"
    ];

    function hit(list) {
      for (var i = 0; i < list.length; i++) {
        if (s.indexOf(list[i]) >= 0) return true;
      }
      return false;
    }

    if (hit(editableAndDeletable)) return { base: ["查看", "编辑", "删除"], extra: [] };
    if (hit(editableNoDelete)) return { base: ["查看", "编辑"], extra: [] };
    if (hit(viewOnly)) return { base: ["查看"], extra: [] };
    return { base: ["查看"], extra: [] };
  }

  function applyStatusBasedOpButtons(root) {
    var file = (location.pathname || "").split("/").pop();
    if (/^sales-/.test(file)) return;
    var keepWarehouseOps = {
      "slot-management.html": 1,
      "inventory-check.html": 1,
      "inventory-management.html": 1,
      "receipt-inbound.html": 1,
      "idle-materials.html": 1,
      "warehouse.html": 1
    };
    if (keepWarehouseOps[file]) return;
    if (file === "purchase-plan-management.html" || file === "contract-management.html") return;
    var host = root && root.querySelectorAll ? root : document;
    var tables = host.querySelectorAll("table");
    tables.forEach(function (table) {
      if (
        file === "purchase-ledger.html" &&
        table.closest &&
        table.closest("#detailMask")
      ) {
        return;
      }
      var headRows = table.querySelectorAll("thead tr");
      if (!headRows.length) return;
      var opIndex = -1;
      var lastHead = headRows[headRows.length - 1];
      var ths = lastHead.querySelectorAll("th");
      ths.forEach(function (th, i) {
        var t = (th.textContent || "").replace(/\s+/g, "");
        if (t === "操作" || t.indexOf("操作") === 0) opIndex = i;
      });
      if (opIndex < 0) return;
      if (
        table.classList &&
        (table.classList.contains("sales-cart-table") || table.classList.contains("sales-modal-table"))
      ) return;
      var stIndex = getStatusColumnIndex(table);

      table.querySelectorAll("tbody tr").forEach(function (tr) {
        var tds = tr.querySelectorAll("td");
        if (!tds.length || opIndex >= tds.length) return;
        var statusText = stIndex >= 0 && stIndex < tds.length ? (tds[stIndex].textContent || "") : "";
        var rules = getAllowedOpsByStatus(statusText);
        var allowed = {};
        rules.base.concat(rules.extra).forEach(function (x) { allowed[x] = 1; });
        if (file === "purchase-summary-report.html") {
          allowed = { "查看": 1 };
        } else if (file === "cargo-ledger.html") {
          allowed = { "查看": 1, "删除": 1 };
        } else if (file === "proc-sales-contract.html") {
          allowed = { "查看": 1, "编辑": 1, "删除": 1 };
        } else if (file === "proc-quality-accept.html") {
          allowed = { "查看": 1, "编辑": 1, "删除": 1, "确认验收": 1 };
        } else if (file === "purchase-ledger.html") {
          allowed = { "查看": 1, "编辑": 1, "删除": 1 };
        } else if (file === "proc-use-approval.html") {
          allowed = { "查看": 1, "编辑": 1, "删除": 1 };
        }

        tds[opIndex].querySelectorAll("button, a").forEach(function (btn) {
          if (btn.getAttribute && btn.getAttribute("data-track-action") === "material-track") {
            btn.style.display = "";
            return;
          }
          var txt = (btn.textContent || "").replace(/\s+/g, "");
          if (!txt) return;
          var keep = false;
          Object.keys(allowed).forEach(function (key) {
            if (txt === key || txt.indexOf(key) >= 0 || key.indexOf(txt) >= 0) keep = true;
          });
          btn.style.display = keep ? "" : "none";
        });
      });
    });
  }

  function ensureUnifiedProgressModal() {
    var existing = document.getElementById("mapUnifiedProgressModal");
    if (existing) return existing;
    function esc(v) {
      return String(v == null ? "" : v).replace(/[&<>"']/g, function (s) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s];
      });
    }
    function node(text, idx, currentIdx, isEnd) {
      var cls = "map-flow-node";
      if (idx === currentIdx) cls += " is-current";
      else if (currentIdx >= 0 && idx > currentIdx) cls += " is-future";
      if (isEnd) cls += " end";
      return '<span class="' + cls + '">' + esc(text) + "</span>";
    }
    function row(steps, currentIdx) {
      var html = '<div class="map-flow-row">';
      steps.forEach(function (text, idx) {
        if (idx > 0) html += '<span class="map-flow-arrow">→</span>';
        html += node(text, idx, currentIdx, idx === steps.length - 1);
      });
      return html + "</div>";
    }
    function table(rows) {
      if (global.mapDemoRenderVerticalTimeline) {
        try {
          return global.mapDemoRenderVerticalTimeline(rows, {
            personKey: "person",
            timeKey: "time",
            statusKey: "result",
            contentKey: "content"
          });
        } catch (e) {}
      }
      return rows.map(function (item) {
        var sc = item.result === "已提交" || item.result === "已通过" || item.result === "已完成" || item.result === "已结束" || item.result === "已处理" ? "#10b981" :
                 item.result === "处理中" || item.result === "审批中" || item.result === "进行中" ? "#1677ff" :
                 item.result === "待处理" || item.result === "待审批" || item.result === "待确认" || item.result === "待知悉" || item.result === "待登记" || item.result === "驳回" || item.result === "拒绝" ? "#f59e0b" : "#64748b";
        return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f0f2f5;">' +
          '<div style="display:flex;align-items:center;gap:10px;min-width:0;">' +
            '<span style="font-weight:600;color:#1f3551;font-size:14px;">' + esc(item.person) + '</span>' +
            '<span style="color:#64748b;font-size:13px;">' + esc(item.time) + '</span>' +
          '</div>' +
          '<span style="padding:2px 10px;border-radius:4px;font-size:12px;font-weight:500;background:' + sc + '22;color:' + sc + ';">' + esc(item.result) + '</span>' +
        '</div>' +
        '<div style="padding:4px 0 0;font-size:13px;color:#51627a;line-height:1.7;">' + esc(item.content) + '</div>';
      }).join("");
    }
    var mask = document.createElement("div");
    mask.id = "mapUnifiedProgressModal";
    mask.className = "map-flow-mask";
    mask.innerHTML =
      '<div class="map-flow-dialog" role="dialog" aria-label="审批记录">' +
      '  <div class="map-flow-hd"><span>审批记录</span><button type="button" class="map-flow-close" data-close="1">&times;</button></div>' +
      '  <div class="map-flow-body">' +
      '    <div class="map-flow-tabs">' +
      '      <button type="button" class="map-flow-tab is-active" data-tab="flow">流程图</button>' +
      '      <button type="button" class="map-flow-tab" data-tab="info">审批信息</button>' +
      '    </div>' +
      '    <div class="map-flow-pane is-active" data-pane="flow">' +
      '      <div class="map-flow-track">' +
      row(["业务部门开始提报次年报废计划", "业务部门提交报废计划", "业务部门负责人审批", "财务部负责人审批", "物资管理部门的物资专责汇总且物资管理部门负责人审批", "财务部负责人审批", "物资管理部门物资专责存档，报废结束"], 4) +
      "      </div>" +
      "    </div>" +
      '    <div class="map-flow-pane" data-pane="info">' +
      '      <div class="map-flow-info">' +
      table([
        { person: "业务部门", time: "—", content: "梳理次年拟报废物资范围。", result: "已通过" },
        { person: "业务部门", time: "—", content: "提交报废计划、拟报废物资明细及报废说明。", result: "已通过" },
        { person: "业务部门负责人", time: "—", content: "确认报废计划内容完整并同意提交后续审批。", result: "已通过" },
        { person: "财务部负责人", time: "—", content: "审核资产原值、累计折旧、净值及账务处理口径。", result: "处理中" },
        { person: "物资管理部门专责", time: "—", content: "汇总拟报废物资清单并确认处置路径。", result: "待处理" },
        { person: "财务部负责人", time: "—", content: "复核财务处理口径并完成终审。", result: "待处理" },
        { person: "物资管理部门专责", time: "—", content: "归档报废计划、审批记录及资产清单。", result: "待处理" }
      ]) +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      '  <div class="map-flow-ft"><button type="button" data-close="1">关闭</button></div>' +
      "</div>";
    document.body.appendChild(mask);

    mask.addEventListener("click", function (e) {
      if (e.target === mask || (e.target && e.target.closest && e.target.closest("[data-close='1']"))) {
        mask.classList.remove("show");
      }
      var tab = e.target && e.target.closest ? e.target.closest(".map-flow-tab") : null;
      if (!tab) return;
      var key = tab.getAttribute("data-tab");
      mask.querySelectorAll(".map-flow-tab").forEach(function (x) {
        x.classList.toggle("is-active", x === tab);
      });
      mask.querySelectorAll(".map-flow-pane").forEach(function (x) {
        x.classList.toggle("is-active", x.getAttribute("data-pane") === key);
      });
    });
    return mask;
  }

  function isM10InventoryInboundFlowScope() {
    var file = (location.pathname || "").split("/").pop();
    if (file === "warehouse-stock-ledger.html" || file === "receipt-inbound.html") return true;
    if (file !== "material-procurement-hub.html") return false;
    var scope = window.__mapProgressFlowScope || "";
    return scope === "m10-ledger-detail" || scope === "m10-inbound-detail" || scope === "m10-inbound-initiate";
  }

  function patchInventoryInboundProgressFlow(mask) {
    if (!mask || !isM10InventoryInboundFlowScope()) return;
    var track = mask.querySelector(".map-flow-track");
    var info = mask.querySelector(".map-flow-info");
    if (!track) return;
    track.innerHTML =
      '<div class="map-flow-row">' +
      '<span class="map-flow-dot"></span>' +
      '<span class="map-flow-node">业务部门物资负责人录入设备清单，提交申请入库</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">业务部门负责人审批，同意入库（审核物资是否符合采购的要求）</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门物资负责人审核分类，同意入库</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门负责人审批，同意</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node end">入公司库结束</span>' +
      '<span class="map-flow-dot end"></span>' +
      '</div>';
    if (info) {
      info.innerHTML = '<div class="map-flow-timeline" style="padding:4px 0">' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所物资专责成明锴</span><span class="map-flow-tl-time">2026-03-20 09:12</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">录入设备清单，提交申请入库（附件：风机采购合同）</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所负责人陈亮</span><span class="map-flow-tl-time">2026-03-20 10:03</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">审批：同意入库，审核物资符合采购要求</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门专责宋中波</span><span class="map-flow-tl-time">2026-03-20 10:28</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">审核分类：同意入库</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门负责人王超</span><span class="map-flow-tl-time">2026-03-20 10:48</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">审批：同意</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item map-flow-tl-last">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-03-20 11:05</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">入公司库结束</div>' +
          '</div>' +
        '</div>' +
        '</div>';
    }
  }

  function isPurchaseLedgerFlowScope(scope) {
    var file = (location.pathname || "").split("/").pop();
    return file === "purchase-ledger.html" && window.__mapProgressFlowScope === scope;
  }

  function setUnifiedProgressModalTitle(mask, title) {
    if (!mask) return;
    var titleEl = mask.querySelector(".map-flow-hd span");
    if (titleEl) titleEl.textContent = title || "审批记录";
  }

  function patchRequisitionProgressFlow(mask) {
    if (!mask || !isPurchaseLedgerFlowScope("purchase-ledger-requisition")) return;
    var track = mask.querySelector(".map-flow-track");
    var info = mask.querySelector(".map-flow-info");
    if (!track) return;
    track.innerHTML =
      '<div class="map-flow-row">' +
      '<span class="map-flow-node">电控所物资专责成明锴发起领用流程，从公司库中选取物资清单</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">电控所负责人陈亮审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门专责核对清单，无误</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门负责人审核，同意</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node end">领用结束，物资归入电控所名下</span>' +
      '<span class="map-flow-dot end"></span>' +
      '</div>';
    if (info) {
      info.innerHTML = '<div class="map-flow-timeline" style="padding:4px 0">' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所物资专责成明锴</span><span class="map-flow-tl-time">2026-05-10 09:12</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">发起领用流程，从公司库中选取物资清单</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所负责人陈亮</span><span class="map-flow-tl-time">2026-05-10 10:03</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">审批：通过</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门专责宋中波</span><span class="map-flow-tl-time">2026-05-10 10:28</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">核对清单：无误</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门负责人王超</span><span class="map-flow-tl-time">2026-05-10 10:48</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">审核：同意</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item map-flow-tl-last">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-05-10 11:05</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">领用结束，物资归入电控所名下</div>' +
          '</div>' +
        '</div></div>';
    }
  }

  function patchTransferProgressFlow(mask) {
    if (!mask || !isPurchaseLedgerFlowScope("purchase-ledger-transfer")) return;
    var track = mask.querySelector(".map-flow-track");
    var info = mask.querySelector(".map-flow-info");
    if (!track) return;
    track.innerHTML =
      '<div class="map-flow-row">' +
      '<span class="map-flow-node">电控所发起申请，将机械所物资转入本部门</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">电控所负责人陈亮审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">机械研究所物资专责许学良审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">机械研究所负责人李仁堂审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门物资专责宋中波确认</span>' +
      '</div>' +
      '<div class="map-flow-row" style="margin-top:18px">' +
      '<span class="map-flow-node end">公司内部流转结束</span>' +
      '<span class="map-flow-dot end"></span>' +
      '</div>';
    if (info) {
      info.innerHTML = '<div class="map-flow-timeline" style="padding:4px 0">' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所</span><span class="map-flow-tl-time">2026-05-10 09:12</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">发起申请：将机械所物资转入本部门</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所负责人陈亮</span><span class="map-flow-tl-time">2026-05-10 10:03</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">审批：通过</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">机械研究所物资专责许学良</span><span class="map-flow-tl-time">2026-05-10 10:28</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">审批：通过</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">机械研究所负责人李仁堂</span><span class="map-flow-tl-time">2026-05-10 10:48</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">审批：通过</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门专责宋中波</span><span class="map-flow-tl-time">2026-05-10 11:05</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">确认：已确认</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item map-flow-tl-last">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-05-10 11:30</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">公司内部流转结束</div>' +
          '</div>' +
        '</div></div>';
    }
  }

  function patchPurchaseLedgerBizProgressFlow(mask) {
    if (!mask) return;
    var scope = window.__mapProgressFlowScope || "";
    var isUserChange = scope === "purchase-ledger-user-change";
    var isExternalBorrow = scope === "purchase-ledger-external-borrow";
    if (!isUserChange && !isExternalBorrow) return;
    var track = mask.querySelector(".map-flow-track");
    var info = mask.querySelector(".map-flow-info");
    if (!track) return;

    if (isUserChange) {
      setUnifiedProgressModalTitle(mask, "审批记录 - 变更使用人");
      track.innerHTML =
        '<div class="map-flow-row">' +
        '<span class="map-flow-node">发起变更</span>' +
        '<span class="map-flow-arrow">→</span>' +
        '<span class="map-flow-node">部门负责人审批</span>' +
        '<span class="map-flow-arrow">→</span>' +
        '<span class="map-flow-node">新使用人确认</span>' +
        '<span class="map-flow-arrow">→</span>' +
        '<span class="map-flow-node">物资管理部门知悉登记</span>' +
        '<span class="map-flow-arrow">→</span>' +
        '<span class="map-flow-node end">完成</span>' +
        '</div>';
      if (info) {
        info.innerHTML = '<div class="map-flow-timeline" style="padding:4px 0">' +
          '<div class="map-flow-tl-item">' +
            '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
            '<div class="map-flow-tl-body">' +
              '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">许学良</span><span class="map-flow-tl-time">2026-06-26 09:30</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
              '<div class="map-flow-tl-content">发起变更，提交新使用人及变更原因</div>' +
            '</div>' +
          '</div>' +
          '<div class="map-flow-tl-item">' +
            '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
            '<div class="map-flow-tl-body">' +
              '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">李仁堂</span><span class="map-flow-tl-time">2026-06-26 10:00</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
              '<div class="map-flow-tl-content">完成部门负责人审批，同意本次变更</div>' +
            '</div>' +
          '</div>' +
          '<div class="map-flow-tl-item">' +
            '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
            '<div class="map-flow-tl-body">' +
              '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">李四</span><span class="map-flow-tl-time">2026-06-26 10:18</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
              '<div class="map-flow-tl-content">完成新使用人确认，确认接收该物资</div>' +
            '</div>' +
          '</div>' +
          '<div class="map-flow-tl-item">' +
            '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
            '<div class="map-flow-tl-body">' +
              '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">宋中波</span><span class="map-flow-tl-time">2026-06-26 10:35</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
              '<div class="map-flow-tl-content">完成物资管理部门知悉登记，更新相关台账</div>' +
            '</div>' +
          '</div>' +
          '<div class="map-flow-tl-item map-flow-tl-last">' +
            '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
            '<div class="map-flow-tl-body">' +
              '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-06-26 10:40</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
              '<div class="map-flow-tl-content">流程完成，变更使用人生效</div>' +
            '</div>' +
          '</div></div>';
      }
      return;
    }

    setUnifiedProgressModalTitle(mask, "审批记录 - 外部借用");
    track.innerHTML =
      '<div class="map-flow-row">' +
      '<span class="map-flow-node">发起外借</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">部门负责人初审</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门物资专责登记并留痕</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node end">完成</span>' +
      '</div>';
    if (info) {
      info.innerHTML = '<div class="map-flow-timeline" style="padding:4px 0">' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">许学良</span><span class="map-flow-tl-time">2026-06-26 09:30</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已发起</span></div>' +
            '<div class="map-flow-tl-content">发起外借，填写外部借用单位、借用人及借用说明</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">李仁堂</span><span class="map-flow-tl-time">2026-06-26 09:55</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
            '<div class="map-flow-tl-content">完成部门负责人初审，同意提交公司审批</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">宋中波</span><span class="map-flow-tl-time">2026-06-26 10:20</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">物资管理部门物资专责知悉，登记借用台账并留痕</div>' +
          '</div>' +
        '</div>' +
        '<div class="map-flow-tl-item map-flow-tl-last">' +
          '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
          '<div class="map-flow-tl-body">' +
            '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-06-26 11:10</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
            '<div class="map-flow-tl-content">流程完成，外部借用生效</div>' +
          '</div>' +
        '</div></div>';
    }
  }

  function patchProgressModalForPage(mask) {
    patchInventoryInboundProgressFlow(mask);
    patchRequisitionProgressFlow(mask);
    patchTransferProgressFlow(mask);
    patchPurchaseLedgerBizProgressFlow(mask);
  }

  function openUnifiedProgressModalGlobal() {
    try {
      var mask = ensureUnifiedProgressModal();
      if (!mask) return false;
      try { patchProgressModalForPage(mask); } catch (e) {}
      mask.classList.add("show");
      return true;
    } catch (e) {
      return false;
    }
  }

  function installUnifiedProgressTrigger() {
    var file = (location.pathname || "").split("/").pop();
    if (file === "purchase-plan-approval-handle.html") return;
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target && e.target.closest ? e.target.closest("button, a, [role='button']") : null;
        if (!t) return;
        var text = (t.textContent || "").replace(/\s+/g, "");
        var act = (t.getAttribute("data-act") || "").toLowerCase();
        var isProgress =
          text.indexOf("查看进度") >= 0 ||
          text.indexOf("流程进度") >= 0 ||
          act === "progress" ||
          act === "progresss" ||
          t.hasAttribute("data-map-open-progress");
        if (!isProgress) return;
        if (t.id === "salesCartFlowBtn" || (t.closest && t.closest("#salesModalMask"))) return;
        var reqProgressType = t.getAttribute("data-open-req-progress");
        if (reqProgressType && typeof window.openReqProgressModal === "function") {
          e.preventDefault();
          e.stopPropagation();
          window.openReqProgressModal(reqProgressType);
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openUnifiedProgressModal === "function") {
          window.openUnifiedProgressModal();
          return;
        }
        var mask = ensureUnifiedProgressModal();
        if (!mask) return;
        try { patchProgressModalForPage(mask); } catch (err) {}
        mask.classList.add("show");
      },
      true
    );
  }

  function installUnifiedOpAndProgress() {
    installUnifiedOpViewStyles();
    markUnifiedOpViewButtons(document);
    markOperationColumnButtons(document);
    applyStatusBasedOpButtons(document);
    installUnifiedProgressTrigger();
    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        markUnifiedOpViewButtons(document);
        markOperationColumnButtons(document);
        applyStatusBasedOpButtons(document);
      }, 120);
    }
    var mo = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.addedNodes && m.addedNodes.length) {
          schedule();
          return;
        }
      }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  function installTopButtonPolicy() {
    var file = (location.pathname || "").split("/").pop();
    var policyPages = {
      "procurement-application.html": 1,
      "order-demand-management.html": 1,
      "purchase-plan-management.html": 1,
      "contract-management.html": 1,
      "proc-project-accept.html": 1,
      "proc-acceptance-inbound.html": 1,
      "proc-use-approval.html": 1,
      "cargo-ledger.html": 1,
      "proc-sales-contract.html": 1,
      "proc-shipment.html": 1,
      "proc-quality-accept.html": 1,
      "proj-company-inbound.html": 1,
      "return-exchange-management.html": 1,
      "purchase-data-ledger.html": 1,
      "purchase-ledger.html": 1,
      "purchase-summary-report.html": 1
    };
    if (!policyPages[file]) return;

    function normalizeActionText(t) {
      var s = String(t || "").replace(/\s+/g, "");
      if (!s) return "";
      if (s.indexOf("新增") >= 0) return "新增";
      if (s.indexOf("导入") >= 0) return "导入";
      if (s.indexOf("下载模板") >= 0 || s.indexOf("下载模版") >= 0) return "下载模板";
      if (s.indexOf("导出") >= 0) return "导出";
      if (s.indexOf("批量删除") >= 0 || s === "删除" || s.indexOf("删除") >= 0) return "删除";
      if (s.indexOf("搜索") >= 0 || s.indexOf("查询") >= 0) return "搜索";
      if (s.indexOf("重置") >= 0) return "重置";
      if (s.indexOf("提交审批") >= 0 || s.indexOf("审批") >= 0) return "审批";
      if (s.indexOf("撤回") >= 0) return "撤回";
      return "";
    }

    var allow =
      file === "purchase-summary-report.html"
        ? { "导出": 1, "搜索": 1, "重置": 1 }
        : file === "proc-quality-accept.html"
          ? { "新增": 1, "搜索": 1, "重置": 1 }
          : { "新增": 1, "导入": 1, "下载模板": 1, "导出": 1, "删除": 1, "搜索": 1, "重置": 1 };

    Array.prototype.forEach.call(document.querySelectorAll("button, a"), function (el) {
      if (!el || !el.closest) return;
      if (el.closest("tbody") || el.closest(".modal,.cm-dialog,.ppm-dialog,[role='dialog']")) return;
      if (el.closest(".sidebar,.warehouse-secondary-panel,.secondary-panel")) return;
      var act = normalizeActionText(el.textContent || "");
      if (!act) return;
      if (!allow[act]) el.style.display = "none";
    });
  }

  // proc-quality-accept 独立页：硬删除顶部“导入/下载模板/导出/删除”按钮（防止被壳页二次注入）
  // 注意：物资采购聚合 m10（库存管理）需保留导入/导出等工具栏，不在此裁剪。
  function installProcQualityAcceptHardPrune() {
    var file = (location.pathname || "").split("/").pop();
    if (file !== "proc-quality-accept.html") return;
    function normalizeActionText(t) {
      var s = String(t || "").replace(/\s+/g, "");
      if (!s) return "";
      if (s.indexOf("导入") >= 0) return "导入";
      if (s.indexOf("下载模板") >= 0 || s.indexOf("下载模版") >= 0) return "下载模板";
      if (s.indexOf("导出") >= 0) return "导出";
      if (s.indexOf("批量删除") >= 0 || s === "删除" || s.indexOf("删除") >= 0) return "删除";
      return "";
    }
    function pruneOnce() {
      Array.prototype.forEach.call(document.querySelectorAll("button, a"), function (el) {
        if (!el || !el.closest) return;
        if (el.closest("tbody") || el.closest(".modal,.cm-dialog,.ppm-dialog,[role='dialog']")) return;
        if (el.closest(".sidebar,.warehouse-secondary-panel,.secondary-panel")) return;
        var act = normalizeActionText(el.textContent || "");
        if (!act) return;
        el.style.display = "none";
      });
    }
    pruneOnce();
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        pruneOnce();
      }, 60);
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  function installLedgerPageHardUnify() {
    var file = (location.pathname || "").split("/").pop();
    var targets = {
      "purchase-plan-table.html": 1,
      "logistics-payment.html": 1
    };
    if (!targets[file]) return;
    var isReportPage = file === "purchase-summary-report.html";
    var isCargoLedger = file === "cargo-ledger.html";

    function desiredTopButtons() {
      if (isReportPage) return ["导出"];
      return ["新增", "导入", "下载模板", "导出", "删除"];
    }

    function desiredOpButtons() {
      if (isReportPage) return ["查看"];
      if (isCargoLedger) return ["查看", "删除"];
      return ["查看", "编辑", "删除"];
    }

    function ensureBatchCheckboxes() {
      var table = document.querySelector("table");
      if (!table) return;
      var headRow = table.querySelector("thead tr");
      if (headRow) {
        var firstTh = headRow.children && headRow.children[0];
        var hasAnyHeadCheckbox =
          !!(firstTh && firstTh.querySelector && firstTh.querySelector("input[type='checkbox']")) ||
          !!headRow.querySelector(".map-ledger-all");
        if (!hasAnyHeadCheckbox) {
          var th = document.createElement("th");
          th.innerHTML = '<input type="checkbox" class="map-ledger-all">';
          headRow.insertBefore(th, headRow.firstChild);
        }
      }
      Array.prototype.forEach.call(table.querySelectorAll("tbody tr"), function (tr, idx) {
        var firstTd = tr.children && tr.children[0];
        var hasAnyRowCheckbox =
          !!(firstTd && firstTd.querySelector && firstTd.querySelector("input[type='checkbox']")) ||
          !!tr.querySelector(".map-ledger-row");
        if (!hasAnyRowCheckbox) {
          var td = document.createElement("td");
          td.innerHTML = '<input type="checkbox" class="map-ledger-row">';
          tr.insertBefore(td, tr.firstChild);
        }
        tr.setAttribute("data-map-ledger-row", String(idx));
      });
    }

    function ensureTopActions() {
      if (document.querySelector(".map-ledger-actions")) return;
      var anchor =
        document.querySelector(".carrier-toolbar") ||
        document.querySelector(".filters") ||
        document.querySelector(".search-row");
      if (!anchor || !anchor.parentNode) return;
      var bar = document.createElement("div");
      bar.className = "map-ledger-actions";
      bar.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;";
      var topMap = {
        "新增": '<button type="button" class="carrier-btn-add map-ledger-top" data-ledger-top="add">新增</button>',
        "导入": '<button type="button" class="carrier-btn-add map-ledger-top" data-ledger-top="import">导入</button>',
        "下载模板": '<button type="button" class="carrier-btn-add map-ledger-top" data-ledger-top="tpl">下载模板</button>',
        "导出": '<button type="button" class="carrier-btn-add map-ledger-top" data-ledger-top="export">导出</button>',
        "删除": '<button type="button" class="carrier-btn-add map-ledger-top" data-ledger-top="delete">删除</button>'
      };
      bar.innerHTML = desiredTopButtons().map(function (x) { return topMap[x] || ""; }).join("");
      anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    }

    function normalizeOpColumn() {
      if (/^sales-/.test(file)) return;
      var ops = desiredOpButtons();
      Array.prototype.forEach.call(document.querySelectorAll("tbody tr"), function (tr, idx) {
        var tds = tr.querySelectorAll("td");
        if (!tds.length) return;
        var opCell = tds[tds.length - 1];
        var html = "";
        if (ops.indexOf("编辑") >= 0) {
          html += '<button type="button" class="carrier-btn-add map-ledger-op" data-ledger-op="edit" data-ledger-row="' + idx + '">编辑</button>';
        }
        if (ops.indexOf("查看") >= 0) {
          html += '<button type="button" class="carrier-btn-add map-ledger-op" data-ledger-op="view" data-ledger-row="' + idx + '">查看</button>';
        }
        if (ops.indexOf("删除") >= 0) {
          html += '<button type="button" class="carrier-btn-add map-ledger-op" data-ledger-op="delete" data-ledger-row="' + idx + '">删除</button>';
        }
        var key = ops.join("|") + "#" + idx;
        if (opCell.getAttribute("data-map-op-key") === key && opCell.innerHTML === html) return;
        opCell.setAttribute("data-map-op-key", key);
        opCell.innerHTML = html;
      });
    }

    function pruneExtraTopButtons() {
      var allowed = { "搜索": 1, "重置": 1 };
      desiredTopButtons().forEach(function (x) {
        allowed[x] = 1;
        if (x === "下载模板") allowed["下载模版"] = 1;
      });
      Array.prototype.forEach.call(document.querySelectorAll("button, a"), function (el) {
        if (el.classList.contains("map-ledger-top") || el.classList.contains("map-ledger-op")) return;
        if (el.closest("tbody") || el.closest(".modal") || el.closest("[role='dialog']")) return;
        var txt = (el.textContent || "").replace(/\s+/g, "");
        if (!txt) return;
        if (allowed[txt]) return;
        if (txt.indexOf("搜索") >= 0 || txt.indexOf("重置") >= 0) return;
        if (txt.indexOf("提交审批") >= 0 || txt.indexOf("编辑") >= 0 || txt.indexOf("撤回") >= 0 || txt.indexOf("审批") >= 0 || txt.indexOf("确认") >= 0) {
          el.style.display = "none";
        }
      });
    }

    function ensureGlobalAddModal() {
      var m = document.getElementById("mapGlobalAddModal");
      if (m) return m;
      m = document.createElement("div");
      m.id = "mapGlobalAddModal";
      m.className = "modal-mask";
      m.setAttribute("aria-hidden", "true");
      m.innerHTML =
        '<div class="modal" style="width:min(820px,96vw)">' +
        '  <div class="modal-header"><h3 class="modal-title" style="margin:0">新增</h3><button type="button" class="modal-close" data-map-add-close="1">×</button></div>' +
        '  <div class="modal-body" id="mapGlobalAddBody"></div>' +
        '  <div class="modal-footer"><button type="button" class="carrier-btn-add" data-map-add-close="1">取消</button><button type="button" class="carrier-btn-add" id="mapGlobalAddOk">保存</button></div>' +
        "</div>";
      document.body.appendChild(m);
      m.addEventListener("click", function (e) {
        if (e.target === m || (e.target && e.target.closest && e.target.closest("[data-map-add-close='1']"))) {
          m.classList.remove("show");
          m.setAttribute("aria-hidden", "true");
        }
      });
      var ok = m.querySelector("#mapGlobalAddOk");
      if (ok) {
        ok.addEventListener("click", function () {
          alert("新增已保存（演示）");
          m.classList.remove("show");
          m.setAttribute("aria-hidden", "true");
        });
      }
      return m;
    }

    function openAddModalByTable(table) {
      var m = ensureGlobalAddModal();
      var body = m.querySelector("#mapGlobalAddBody");
      if (!body) return;
      var ths = table ? table.querySelectorAll("thead tr:last-child th") : [];
      var fields = [];
      Array.prototype.forEach.call(ths, function (th) {
        var txt = (th.textContent || "").replace(/\s+/g, " ").trim();
        if (!txt || txt === "操作" || txt === "详情" || txt === "序号") return;
        fields.push(txt);
      });
      if (!fields.length) fields = ["名称", "编号", "状态", "备注"];
      fields = fields.slice(0, 12);
      body.innerHTML =
        '<div style="display:grid;grid-template-columns:140px 1fr;gap:10px;max-height:60vh;overflow:auto;">' +
        fields
          .map(function (f, i) {
            return (
              '<label style="color:#64748b;align-self:center">' +
              f +
              "</label>" +
              '<input class="carrier-search" placeholder="请输入' +
              f +
              '" data-map-add-field="' +
              i +
              '"/>'
            );
          })
          .join("") +
        "</div>";
      m.classList.add("show");
      m.setAttribute("aria-hidden", "false");
    }

    function applyAll() {
      ensureTopActions();
      ensureBatchCheckboxes();
      normalizeOpColumn();
      pruneExtraTopButtons();
    }

    applyAll();
    document.addEventListener("click", function (e) {
      var top = e.target && e.target.closest ? e.target.closest("[data-ledger-top]") : null;
      if (top) {
        e.preventDefault();
        var act = top.getAttribute("data-ledger-top");
        var tbody = document.querySelector("tbody");
        if (act === "add" && tbody) {
          var table = tbody.closest("table");
          openAddModalByTable(table);
          return;
        }
        if (act === "delete") {
          Array.prototype.forEach.call(document.querySelectorAll(".map-ledger-row:checked"), function (ck) {
            var row = ck.closest("tr");
            if (row && row.parentNode) row.parentNode.removeChild(row);
          });
          return;
        }
        alert((act === "tpl" ? "下载模板" : act === "import" ? "导入" : "导出") + "（演示）");
        return;
      }

      var op = e.target && e.target.closest ? e.target.closest("[data-ledger-op]") : null;
      if (!op) return;
      e.preventDefault();
      var action = op.getAttribute("data-ledger-op");
      var rowEl = op.closest("tr");
      if (!rowEl) return;
      if (action === "delete") {
        rowEl.parentNode && rowEl.parentNode.removeChild(rowEl);
        return;
      }
      if (action === "edit") {
        alert("编辑弹窗（演示）");
        return;
      }
      alert("查看弹窗（演示）");
    }, true);

    var pending = false;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        applyAll();
      }, 100);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function installModuleRowCheckboxes() {
    var file = (location.pathname || "").split("/").pop();
    var targets = {
      "procurement-application.html": 1,
      "order-demand-management.html": 1,
      "proc-project-accept.html": 1,
      "proc-use-approval.html": 1,
      "proc-sales-contract.html": 1,
      "proc-shipment.html": 1,
      "proc-quality-accept.html": 1,
      "return-exchange-management.html": 1
    };
    if (!targets[file]) return;

    function ensureRowCheckboxes() {
      Array.prototype.forEach.call(document.querySelectorAll("table"), function (table, tableIdx) {
        if (!table) return;

        var headRow = table.querySelector("thead tr:last-child") || table.querySelector("thead tr");
        if (headRow) {
          var firstTh = headRow.children && headRow.children[0];
          var hasHeadCheckbox =
            firstTh &&
            firstTh.querySelector &&
            firstTh.querySelector("input[type='checkbox'][data-map-row-check-all]");
          if (!hasHeadCheckbox) {
            var th = document.createElement("th");
            th.innerHTML = '<input type="checkbox" data-map-row-check-all="1" data-map-table="' + tableIdx + '">';
            headRow.insertBefore(th, firstTh || null);
          }
        }

        var bodyRows = table.querySelectorAll("tbody tr");
        Array.prototype.forEach.call(bodyRows, function (tr, rowIdx) {
          if (!tr || tr.classList.contains("map-fill-10")) return;
          var firstCell = tr.children && tr.children[0];
          var hasRowCheckbox =
            firstCell &&
            firstCell.querySelector &&
            firstCell.querySelector("input[type='checkbox'][data-map-row-check='1']");
          if (hasRowCheckbox) return;
          var td = document.createElement("td");
          td.innerHTML =
            '<input type="checkbox" data-map-row-check="1" data-map-table="' +
            tableIdx +
            '" data-map-row="' +
            rowIdx +
            '">';
          tr.insertBefore(td, firstCell || null);
        });
      });
    }

    ensureRowCheckboxes();

    document.addEventListener(
      "change",
      function (e) {
        var all = e.target && e.target.matches ? e.target.matches("input[type='checkbox'][data-map-row-check-all]") : false;
        if (!all) return;
        var tableIdx = e.target.getAttribute("data-map-table") || "";
        var checked = !!e.target.checked;
        Array.prototype.forEach.call(
          document.querySelectorAll("input[type='checkbox'][data-map-row-check='1'][data-map-table='" + tableIdx + "']"),
          function (el) {
            el.checked = checked;
          }
        );
      },
      true
    );

    var pending = false;
    var obs = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        ensureRowCheckboxes();
      }, 160);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function installBusinessModalFallback() {
    var file = (location.pathname || "").split("/").pop();
    var targets = {
      "material-procurement-hub.html": 1,
      "procurement-application.html": 1,
      "order-demand-management.html": 1,
      "contract-management.html": 1,
      "proc-project-accept.html": 1,
      "purchase-data-ledger.html": 1,
      "purchase-ledger.html": 1,
      "cargo-ledger.html": 1,
      "purchase-summary-report.html": 1,
      "proc-acceptance-inbound.html": 1,
      "proc-use-approval.html": 1,
      "proc-sales-contract.html": 1,
      "proc-shipment.html": 1,
      "proc-quality-accept.html": 1,
      "return-exchange-management.html": 1
    };
    if (!targets[file]) return;

    var ctx = { action: "", actionText: "", rowPairs: [], rowText: "" };

    function cleanText(s) {
      return String(s || "").replace(/\s+/g, " ").trim();
    }

    function collectRowPairs(el) {
      var tr = el && el.closest ? el.closest("tr") : null;
      var table = tr && tr.closest ? tr.closest("table") : null;
      if (!tr || !table) return [];
      var ths = table.querySelectorAll("thead tr:last-child th");
      var tds = tr.querySelectorAll("td");
      var pairs = [];
      for (var i = 0; i < tds.length; i++) {
        var key = ths[i] ? cleanText(ths[i].textContent) : "字段" + (i + 1);
        var val = cleanText(tds[i].textContent);
        if (!key || key === "操作" || key === "详情") continue;
        if (!val) continue;
        pairs.push({ k: key, v: val });
      }
      return pairs.slice(0, 12);
    }

    function collectHeaderFields(el) {
      var table = null;
      if (el && el.closest) {
        table = el.closest("table");
        if (!table) {
          var card = el.closest(".carrier-card,.card,.proc-card,.cm-card,.ppm-card");
          if (card) table = card.querySelector("table");
        }
      }
      if (!table) table = document.querySelector("table");
      if (!table) return [];
      var ths = table.querySelectorAll("thead tr:last-child th");
      var fields = [];
      Array.prototype.forEach.call(ths, function (th) {
        var txt = cleanText(th.textContent || "");
        if (!txt) return;
        if (txt === "操作" || txt === "详情" || txt === "全选") return;
        fields.push(txt);
      });
      return fields.slice(0, 16);
    }

    function ensureFooterButtons(modal, actionText) {
      var ft =
        modal.querySelector(".modal-footer, .modal-ft, .proc-modal-foot, .cm-dialog-ft, .ppm-dialog-ft, .map-flow-ft") ||
        modal.querySelector("[id$='Foot']");
      if (!ft) return;
      if (!ft.querySelector("button, a")) {
        var isView = actionText.indexOf("查看") >= 0 || actionText.indexOf("详情") >= 0;
        ft.innerHTML =
          '<button type="button" class="carrier-btn-add" data-map-modal-close="1">取消</button>' +
          (isView ? "" : '<button type="button" class="carrier-btn-add" data-map-modal-confirm="1">确认</button>');
      }
    }

    function fillModalIfEmpty(modal) {
      var bodies = modal.querySelectorAll(
        ".modal-body, .modal-bd, .proc-modal-body, .cm-dialog-bd, .ppm-dialog-bd, .q-body, .s-body, [id$='Body']"
      );
      if (!bodies.length) return;
      var hasContent = false;
      Array.prototype.forEach.call(bodies, function (b) {
        if (cleanText(b.textContent).length > 0 || b.querySelector("input,select,textarea,table,button,a")) {
          hasContent = true;
        }
      });
      if (hasContent) return;

      var rows = ctx.rowPairs || [];
      var html =
        '<div style="display:grid;grid-template-columns:120px 1fr;gap:8px;font-size:13px;line-height:1.6">' +
        '<div style="color:#64748b">当前动作</div><div>' + cleanText(ctx.actionText || ctx.action || "业务操作") + "</div>";
      if (rows.length) {
        rows.forEach(function (p) {
          html += "<div style='color:#64748b'>" + p.k + "</div><div>" + p.v + "</div>";
        });
      } else {
        html += "<div style='color:#64748b'>提示</div><div>该弹窗内容未配置，已自动回填基础业务信息。</div>";
      }
      html += "</div>";
      bodies[0].innerHTML = html;
      ensureFooterButtons(modal, cleanText(ctx.actionText || ctx.action || ""));
    }

    function ensureDeleteDialogContent(modal) {
      if (!modal || !modal.querySelector) return;
      var titleEl = modal.querySelector(
        ".modal-title, .modal-header h3, .ppm-dialog-hd, .cm-dialog-hd, .proc-modal-head span, [id$='Title']"
      );
      var titleTxt = cleanText(titleEl ? titleEl.textContent : "");
      var isDeleteTitle = titleTxt.indexOf("删除") >= 0;
      var hasDeleteBtn = !!modal.querySelector(
        "#ppmModalDeleteOk, #procApplyDeleteOk, #procDeleteOrderOk, [data-map-global-ok='1']"
      );
      if (!isDeleteTitle && !hasDeleteBtn) return;
      var body =
        modal.querySelector(".modal-body, .modal-bd, .proc-modal-body, .cm-dialog-bd, .ppm-dialog-bd, [id$='Body']") || modal;
      if (!body) return;
      var txt = cleanText(body.textContent || "");
      if (!txt) {
        body.innerHTML =
          '<div style="font-size:14px;line-height:1.8;padding:8px 2px;color:#1f2d3d">是否确认删除该条数据？</div>';
      }
      if (titleEl && !cleanText(titleEl.textContent || "")) {
        titleEl.textContent = "删除确认";
      }
    }

    /** 库存管理 m10：详情标题为「库存台账…详情 / 入库记录…详情」时补顶栏流程进度（防脚本缓存或未执行 setHeadAction）。标题分隔符可为「·」「.」或空格。 */
    function ensureProcHubM10DetailFlowProgress(modal) {
      if (!modal || !modal.querySelector) return;
      var curFile = (location.pathname || "").split("/").pop();
      if (curFile !== "material-procurement-hub.html") return;
      var titleEl = modal.querySelector("#procModalTitle");
      if (!titleEl) return;
      /* 聚合页已在 HTML 内嵌 #procModalFlow，由 hub.js 控制显隐；勿再插第二个「流程进度」 */
      if (modal.querySelector("#procModalFlow")) return;
      var t = cleanText(titleEl.textContent || "");
      var isLedgerDetail =
        (t.indexOf("库存台账") >= 0 && t.indexOf("详情") >= 0) ||
        (t.indexOf("入库记录") >= 0 && t.indexOf("详情") >= 0);
      if (!isLedgerDetail) return;
      var head = modal.querySelector(".proc-modal-head");
      var xBtn = modal.querySelector("#procModalX");
      if (!head || !xBtn) return;
      if (head.querySelector(".proc-modal-head-action")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carrier-btn-add proc-modal-head-action";
      btn.setAttribute("data-map-open-progress", "1");
      btn.textContent = "流程进度";
      btn.style.cssText =
        "border:none;background:transparent;color:#1677ff;font-size:12px;font-weight:600;line-height:1;padding:0 6px;min-height:auto;height:auto;box-shadow:none;cursor:pointer;";
      head.insertBefore(btn, xBtn);
    }

    function ensureViewCancelLabel(modal) {
      if (!modal || !modal.querySelector) return;
      var currentFile = (location.pathname || "").split("/").pop();
      var purchaseScope = {
        "procurement-application.html": 1,
        "purchase-ledger.html": 1,
        "contract-management.html": 1,
        "proc-quality-accept.html": 1,
        "proc-acceptance-inbound.html": 1,
        "proc-use-approval.html": 1,
        "cargo-ledger.html": 1,
        "material-procurement-hub.html": 1,
        "proc-sales-contract.html": 1,
        "proc-shipment.html": 1,
        "proj-company-inbound.html": 1,
        "return-exchange-management.html": 1,
        "purchase-data-ledger.html": 1,
        "purchase-summary-report.html": 1,
        "warehouse-stock-ledger.html": 1
      };
      if (!purchaseScope[currentFile]) return;
      var titleEl =
        modal.querySelector(
          ".modal-title, .modal-header h3, .ppm-dialog-hd, .cm-dialog-hd, .proc-modal-head span, .q-hd, .rx-dialog-hd, [id$='Title']"
        ) || modal;
      var titleTxt = cleanText((titleEl && titleEl.textContent) || "");
      var isViewDialog =
        titleTxt.indexOf("查看") >= 0 ||
        titleTxt.indexOf("详情") >= 0 ||
        cleanText(ctx.actionText || "").indexOf("查看") >= 0 ||
        cleanText(ctx.actionText || "").indexOf("详情") >= 0;
      if (!isViewDialog) return;
      var btns = modal.querySelectorAll("button, a");
      Array.prototype.forEach.call(btns, function (b) {
        if (!b) return;
        if (b.getAttribute && b.getAttribute("data-map-open-progress") === "1") return;
        var t = cleanText(b.textContent || "");
        if (t === "关闭") b.textContent = "取消";
      });
    }

    function hasVisibleModal() {
      return !!document.querySelector(
        ".modal-mask.show, .proc-modal-mask.show, .proc-modal-mask.is-open, .cm-modal-mask.show, .ppm-modal-mask.show, .wh-modal-mask.is-open, .map-flow-mask.show, #map-global-action-fallback.show"
      );
    }

    function resolveActionLabel(raw) {
      var t = cleanText(raw || "").replace(/\s+/g, "");
      if (!t) return "";
      if (t.indexOf("流程进度") >= 0 || t.indexOf("流程轨迹") >= 0) return "流程进度";
      if (t.indexOf("历史记录") >= 0) return "历史记录";
      if (t.indexOf("查看") >= 0) return "查看";
      if (t.indexOf("详情") >= 0) return "查看";
      if (t.indexOf("编辑") >= 0) return "编辑";
      if (t.indexOf("删除") >= 0) return "删除";
      if (t.indexOf("新增") >= 0) return "新增";
      if (t.indexOf("导入") >= 0) return "导入";
      if (t.indexOf("下载模板") >= 0 || t.indexOf("下载模版") >= 0) return "下载模板";
      if (t.indexOf("导出") >= 0) return "导出";
      if (t.indexOf("提交") >= 0) return "提交";
      if (t.indexOf("保存") >= 0) return "保存";
      if (t.indexOf("确认") >= 0) return "确认";
      if (t.indexOf("审批") >= 0) return "审批";
      if (t.indexOf("填报") >= 0) return "填报";
      if (t.indexOf("搜索") >= 0 || t.indexOf("查询") >= 0) return "搜索";
      if (t.indexOf("重置") >= 0) return "重置";
      return "";
    }

    function ensureGlobalActionFallbackModal() {
      var m = document.getElementById("map-global-action-fallback");
      if (m) return m;
      m = document.createElement("div");
      m.id = "map-global-action-fallback";
      m.className = "modal-mask";
      m.setAttribute("aria-hidden", "true");
      m.innerHTML =
        '<div class="modal" style="width:min(760px,94vw)">' +
        '  <div class="modal-header"><h3 class="modal-title" id="map-global-action-title" style="margin:0">业务操作</h3><button type="button" class="modal-close" data-map-global-close="1">×</button></div>' +
        '  <div class="modal-body" id="map-global-action-body"></div>' +
        '  <div class="modal-footer"><button type="button" class="carrier-btn-add" data-map-global-close="1">取消</button><button type="button" class="carrier-btn-add" data-map-global-ok="1">确认</button></div>' +
        "</div>";
      m.addEventListener("click", function (e) {
        if (e.target === m || (e.target && e.target.closest && e.target.closest("[data-map-global-close='1']"))) {
          m.classList.remove("show");
          m.setAttribute("aria-hidden", "true");
        }
      });
      document.body.appendChild(m);
      return m;
    }

    function openGlobalActionFallback(actionLabel) {
      var m = ensureGlobalActionFallbackModal();
      var title = m.querySelector("#map-global-action-title");
      var body = m.querySelector("#map-global-action-body");
      var headerCloseBtn = m.querySelector(".modal-header [data-map-global-close='1']");
      var cancelBtn = m.querySelector(".modal-footer [data-map-global-close='1']");
      var okBtn = m.querySelector("[data-map-global-ok='1']");
      var currentFile = (location.pathname || "").split("/").pop();
      function countCheckedRecordsForBatchDelete() {
        var btn = window.__mapLastActionBtn || null;
        var roots = [];
        if (btn && btn.closest) {
          var localRoot = btn.closest(".carrier-main-inner,.carrier-card,.main-scroll,.card,.panel,.table-wrap,.carrier-table-wrap");
          if (localRoot) roots.push(localRoot);
        }
        roots.push(document);
        var maxCount = 0;
        roots.forEach(function (root) {
          if (!root || !root.querySelectorAll) return;
          var list = root.querySelectorAll(
            "tbody input[type='checkbox']:checked, .row-chk:checked, .chkRow:checked, .cm-row-chk:checked, .rx-row-chk:checked, .row-check:checked"
          );
          var n = 0;
          Array.prototype.forEach.call(list, function (cb) {
            if (!cb || cb.disabled) return;
            var id = String(cb.id || "").toLowerCase();
            var cls = String(cb.className || "").toLowerCase();
            var name = String(cb.name || "").toLowerCase();
            if (id === "chkall" || cls.indexOf("check-all") >= 0 || name === "checkall") return;
            n += 1;
          });
          if (n > maxCount) maxCount = n;
        });
        return maxCount;
      }
      function isTopBatchDeleteAction() {
        var btn = window.__mapLastActionBtn || null;
        if (!btn || !btn.closest) return false;
        return !btn.closest("tr");
      }
      function isCompanyInboundPage() {
        if (currentFile === "proc-acceptance-inbound.html") return true;
        var h1 = document.querySelector(".carrier-page-title,h1");
        var h1Text = cleanText((h1 && h1.textContent) || "");
        return h1Text.indexOf("公司层面入库") >= 0;
      }
      function isUseApprovalPage() {
        if (currentFile === "proc-use-approval.html") return true;
        var h1 = document.querySelector(".carrier-page-title,h1");
        var h1Text = cleanText((h1 && h1.textContent) || "");
        return h1Text.indexOf("领用申请") >= 0;
      }
      function isAcceptanceConfirmPage() {
        if (currentFile === "proc-project-accept.html") return true;
        if (currentFile === "proc-quality-accept.html" && String(location.hash || "").indexOf("flow-warehouse") >= 0)
          return true;
        var h1 = document.querySelector(".carrier-page-title,h1");
        var h1Text = cleanText((h1 && h1.textContent) || "");
        return h1Text.indexOf("验收确认") >= 0;
      }
      if (headerCloseBtn) headerCloseBtn.textContent = "×";
      if (title) title.textContent = actionLabel + "业务";
      var html = "";
      function buildCrudForm(mode) {
        var fields = collectHeaderFields(window.__mapLastActionBtn || null);
        if (!fields.length && ctx.rowPairs && ctx.rowPairs.length) {
          fields = ctx.rowPairs.map(function (p) { return cleanText(p.k); }).filter(Boolean);
        }
        if (!fields.length) fields = ["项目名称", "物资名称", "规格型号", "数量", "备注"];
        var pairMap = {};
        (ctx.rowPairs || []).forEach(function (p) {
          var k = cleanText(p.k);
          if (k && pairMap[k] == null) pairMap[k] = cleanText(p.v);
        });
        var readonly = mode === "view";
        var prefill = mode === "edit" || mode === "view";
        function optionsByField(key) {
          var k = String(key || "").replace(/\s+/g, "");
          if (k.indexOf("状态") >= 0 || k.indexOf("进度") >= 0 || k.indexOf("结论") >= 0)
            return ["草稿", "审批中", "已驳回", "已通过", "待确认", "已确认", "待验收", "验收中", "不通过", "已生效", "已完成"];
          if (k.indexOf("类别") >= 0) return ["生产类", "销售类", "办公类", "服务类", "工程类"];
          if (k.indexOf("方式") >= 0) return ["电汇", "银行转账", "承兑汇票", "招标", "询价", "单一来源"];
          if (k.indexOf("部门") >= 0) return ["经营发展中心", "采购部", "物资部", "工程部", "财务部", "运维中心"];
          if (k.indexOf("公司") >= 0) return ["河南能源", "天津能源", "甘肃能源", "华北公司"];
          if (k.indexOf("人") >= 0) return ["张三", "李四", "王五", "赵六", "钱七"];
          if (k.indexOf("是否") >= 0) return ["是", "否"];
          if (k.indexOf("单位") >= 0) return ["个", "台", "套", "件", "米", "千克", "吨"];
          if (k.indexOf("紧急") >= 0) return ["普通", "紧急", "特急"];
          return null;
        }
        function inferInputType(key) {
          var k = String(key || "").replace(/\s+/g, "");
          if (k.indexOf("日期") >= 0 || k.indexOf("时间") >= 0) return "date";
          if (
            k.indexOf("数量") >= 0 ||
            k.indexOf("单价") >= 0 ||
            k.indexOf("总价") >= 0 ||
            k.indexOf("金额") >= 0 ||
            k.indexOf("税率") >= 0 ||
            k.indexOf("比例") >= 0
          ) return "number";
          return "text";
        }
        function renderSelect(key, val, readonly) {
          var opts = optionsByField(key) || [];
          if (opts.length && opts[0] !== "请选择") opts.unshift("请选择");
          var has = false;
          for (var i = 0; i < opts.length; i++) if (String(opts[i]) === String(val || "")) has = true;
          var full = has || !val ? opts.slice() : [val].concat(opts);
          return (
            "<select " +
            (readonly ? "disabled " : "") +
              "style='height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 28px 0 8px;font-size:13px;color:#1f2d3d;background-color:" +
              (readonly ? "#f5f5f5" : "#fff") +
              ";appearance:auto;-webkit-appearance:menulist;'>" +
            full
              .map(function (x) {
                var s = String(x);
                return "<option" + (String(val || "") === s ? " selected" : "") + ">" + s + "</option>";
              })
              .join("") +
            "</select>"
          );
        }
        var out =
          '<div style="max-height:56vh;overflow:auto;padding-right:4px">' +
          '<div style="display:grid;grid-template-columns:140px 1fr;gap:10px 12px;font-size:13px;line-height:1.5">';
        fields.slice(0, 24).forEach(function (field) {
          var key = cleanText(field);
          var val = prefill ? (pairMap[key] || "") : "";
          var isRemark = key.indexOf("备注") >= 0 || key.indexOf("说明") >= 0;
          var opts = optionsByField(key);
          out += "<label style='color:#64748b;align-self:center'>" + key + "</label>";
          if (isRemark) {
            out +=
              "<textarea " +
              (readonly ? "readonly " : "") +
              "style='min-height:64px;border:1px solid #d9d9d9;border-radius:6px;padding:8px 10px;font-size:13px;color:#1f2d3d;background:" +
              (readonly ? "#f5f5f5" : "#fff") +
              ";'>" + val + "</textarea>";
          } else if (opts && opts.length) {
            out += renderSelect(key, val, readonly);
          } else {
            var inputType = inferInputType(key);
            out +=
              "<input type='" + inputType + "' value=\"" + val.replace(/"/g, "&quot;") + "\" " +
              (readonly ? "readonly " : "") +
              "style='height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 10px;font-size:13px;color:#1f2d3d;background:" +
              (readonly ? "#f5f5f5" : "#fff") +
              ";'>";
          }
        });
        out += "</div></div>";
        return out;
      }
      if (actionLabel === "删除") {
        if (title) title.textContent = "删除确认";
        if (okBtn) okBtn.textContent = "确认删除";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        var checkedCount = countCheckedRecordsForBatchDelete();
        var isBatchDelete = isTopBatchDeleteAction();
        var deleteText = "是否确认删除该条数据？";
        if (isBatchDelete && checkedCount > 0) deleteText = "确定删除这" + checkedCount + "条记录么？";
        if (isBatchDelete && checkedCount <= 0) {
          deleteText = "请先勾选要删除的记录。";
          if (okBtn) okBtn.style.display = "none";
          if (cancelBtn) cancelBtn.textContent = "关闭";
        }
        html =
          '<div style="font-size:14px;line-height:1.8;padding:8px 2px;color:#1f2d3d">' +
          deleteText +
          "</div>";
      } else if (actionLabel === "新增") {
        if (title) title.textContent = currentFile === "proc-sales-contract.html" ? "新增销售合同" : "新增";
        if (okBtn) okBtn.textContent = "保存";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html = buildCrudForm("add");
      } else if (actionLabel === "编辑") {
        var file = (location.pathname || "").split("/").pop();
        if (title) title.textContent = file === "material-procurement-hub.html" ? "修改采购申请" : "编辑";
        if (okBtn) okBtn.textContent = "保存";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html = buildCrudForm("edit");
      } else if (actionLabel === "查看") {
        if (title) title.textContent = "查看";
        if (okBtn) okBtn.style.display = "none";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html =
          (isAcceptanceConfirmPage() || isCompanyInboundPage() || isUseApprovalPage()
            ? '<div style="display:flex;justify-content:flex-end;margin-bottom:10px">' +
              '<button type="button" class="carrier-btn-add" data-map-open-progress="1" ' +
              'style="padding:0 10px;height:30px;border:1px solid #91caff;border-radius:6px;background:#fff;color:#1677ff">流程进度</button>' +
              "</div>"
            : "") + buildCrudForm("view");
      } else if (actionLabel === "导入") {
        if (title) title.textContent = "导入";
        if (okBtn) okBtn.textContent = "确认导入";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html =
          '<div style="display:grid;gap:10px;font-size:13px;line-height:1.7">' +
          "<div>请上传导入文件（模板格式）。</div>" +
          "<input type='file' style='height:32px;line-height:32px'>" +
          "<div style='color:#64748b'>提示：导入成功后将自动刷新列表数据。</div>" +
          "</div>";
      } else if (actionLabel === "下载模板") {
        if (title) title.textContent = "下载模板";
        if (okBtn) okBtn.textContent = "确认";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html =
          '<div style="font-size:14px;line-height:1.8;padding:8px 2px;color:#1f2d3d">' +
          "已准备好模板文件，确认后开始下载（演示）。" +
          "</div>";
      } else if (actionLabel === "导出") {
        if (title) title.textContent = "导出";
        if (okBtn) okBtn.textContent = "确认导出";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html =
          '<div style="display:grid;gap:8px;font-size:13px;line-height:1.7">' +
          "<div>请选择导出范围：</div>" +
          "<label><input type='radio' name='mapExportRange' checked> 当前筛选结果</label>" +
          "<label><input type='radio' name='mapExportRange'> 全部数据</label>" +
          "</div>";
      } else if (actionLabel === "搜索") {
        if (title) title.textContent = "搜索";
        if (okBtn) okBtn.textContent = "确认";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html =
          '<div style="font-size:14px;line-height:1.8;padding:8px 2px;color:#1f2d3d">' +
          "已按当前筛选条件执行搜索（演示）。" +
          "</div>";
      } else if (actionLabel === "重置") {
        if (title) title.textContent = "重置筛选";
        if (okBtn) okBtn.textContent = "确认重置";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        html =
          '<div style="font-size:14px;line-height:1.8;padding:8px 2px;color:#1f2d3d">' +
          "是否重置当前筛选条件？" +
          "</div>";
      } else {
        if (okBtn) okBtn.textContent = "确认";
        if (okBtn) okBtn.style.display = "";
        if (cancelBtn) cancelBtn.textContent = "取消";
        var rows = (ctx.rowPairs || []).slice(0, 10);
        html =
          '<div style="display:grid;grid-template-columns:120px 1fr;gap:8px;font-size:13px;line-height:1.7">' +
          "<div style='color:#64748b'>操作类型</div><div>" + actionLabel + "</div>";
        if (rows.length) {
          rows.forEach(function (p) {
            html += "<div style='color:#64748b'>" + cleanText(p.k) + "</div><div>" + cleanText(p.v) + "</div>";
          });
        } else {
          html += "<div style='color:#64748b'>说明</div><div>已打开" + actionLabel + "弹窗，可按业务填写并确认。</div>";
        }
        html += "</div>";
      }
      if (body) body.innerHTML = html;
      // Hard-stop: keep delete dialog copy visible even if other scripts mutate body.
      if (actionLabel === "删除" && body) {
        var batchCount = countCheckedRecordsForBatchDelete();
        var isBatch = isTopBatchDeleteAction();
        var fixedDeleteText = "是否确认删除该条数据？";
        if (isBatch && batchCount > 0) fixedDeleteText = "确定删除这" + batchCount + "条记录么？";
        if (isBatch && batchCount <= 0) fixedDeleteText = "请先勾选要删除的记录。";
        body.innerHTML =
          '<div style="font-size:14px;line-height:1.8;padding:8px 2px;color:#1f2d3d">' + fixedDeleteText + "</div>";
      }
      m.classList.add("show");
      m.setAttribute("aria-hidden", "false");
    }

    function tryPrefillEditModalFromRow() {
      var mask = document.querySelector(
        ".modal-mask.show, .proc-modal-mask.show, .proc-modal-mask.is-open, .cm-modal-mask.show, .ppm-modal-mask.show"
      );
      if (!mask) return false;
      var modal =
        mask.querySelector(".modal, .proc-modal-box, .cm-dialog, .ppm-dialog") ||
        mask;
      var titleEl = modal.querySelector(".modal-title, .proc-modal-title, .cm-dialog-title, .ppm-dialog-title, h3, h2");
      if (titleEl) {
        var t = cleanText(titleEl.textContent || "");
        if (t.indexOf("新增") >= 0) titleEl.textContent = t.replace("新增", "编辑");
      }
      var pairMap = {};
      (ctx.rowPairs || []).forEach(function (p) {
        var k = cleanText(p.k);
        if (k && pairMap[k] == null) pairMap[k] = cleanText(p.v);
      });
      var rows = modal.querySelectorAll(".field-row");
      if (!rows.length) return true;
      Array.prototype.forEach.call(rows, function (row) {
        var labelEl = row.querySelector("label");
        var key = cleanText(labelEl ? labelEl.textContent : "");
        key = key.replace(/\*/g, "").trim();
        if (!key || pairMap[key] == null) return;
        var val = pairMap[key];
        var input = row.querySelector("input, textarea, select");
        if (!input || input.hasAttribute("readonly")) return;
        try {
          if (input.tagName === "SELECT") {
            var matched = false;
            Array.prototype.forEach.call(input.options || [], function (opt) {
              if (!matched && cleanText(opt.textContent || opt.value) === val) {
                input.value = opt.value;
                matched = true;
              }
            });
          } else {
            input.value = val;
          }
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (_) {}
      });
      return true;
    }

    function tryOpenEditUsingAddTemplate(btn) {
      if (!btn || !btn.closest) return false;
      var scope =
        btn.closest(".carrier-card,.card,.proc-card,.cm-card,.ppm-card,section,.main-scroll") || document;
      var addBtn =
        scope.querySelector("button.js-op[data-op*='新增'],a.js-op[data-op*='新增']") ||
        document.querySelector("button.js-op[data-op*='新增'],a.js-op[data-op*='新增']");
      if (!addBtn || addBtn === btn) return false;
      try {
        addBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      } catch (_) {
        return false;
      }
      setTimeout(function () {
        tryPrefillEditModalFromRow();
      }, 40);
      return true;
    }

    function closeModalFrom(btn) {
      var modal =
        btn.closest(".modal, .proc-modal-box, .cm-dialog, .ppm-dialog") ||
        btn.closest(".modal-mask, .proc-modal-mask, .cm-modal-mask, .ppm-modal-mask, .map-flow-mask");
      var mask =
        (modal && modal.closest && modal.closest(".modal-mask, .proc-modal-mask, .cm-modal-mask, .ppm-modal-mask, .map-flow-mask")) ||
        modal;
      if (mask && mask.classList) mask.classList.remove("show");
      if (mask && mask.style) {
        if (mask.style.display === "flex") mask.style.display = "none";
        if (mask.style.display === "block") mask.style.display = "none";
      }
    }

    document.addEventListener(
      "click",
      function (e) {
        // 某些页面把“导入”做成 input[type=file]/label，默认会直接拉起本地文件选择器。
        // 这里统一改为先弹导入弹窗，弹窗内再选择文件，保持“一次点击一个弹窗”的交互。
        var fileTrigger =
          e.target && e.target.closest
            ? e.target.closest("input[type='file'],label[for]")
            : null;
        if (fileTrigger) {
          var isFileInput = fileTrigger.tagName === "INPUT" && String(fileTrigger.type || "").toLowerCase() === "file";
          var isFileLabel = false;
          if (!isFileInput && fileTrigger.tagName === "LABEL") {
            var refId = fileTrigger.getAttribute("for");
            if (refId) {
              var refEl = document.getElementById(refId);
              isFileLabel =
                !!refEl && refEl.tagName === "INPUT" && String(refEl.type || "").toLowerCase() === "file";
            }
          }
          if (!isFileInput && !isFileLabel) {
            // 非文件上传触发器不处理
          } else {
          var inModalArea = !!(
            fileTrigger.closest &&
            fileTrigger.closest(".modal,.proc-modal-box,.cm-dialog,.ppm-dialog,[role='dialog']")
          );
          var inToolbarArea = !!(
            fileTrigger.closest &&
            (fileTrigger.closest("table") ||
              fileTrigger.closest(
                ".carrier-toolbar,.search-row,.filters,.map-ledger-actions,.toolbar,.toolbar-left,.toolbar-right,.actions,.carrier-head,.card"
              ))
          );
          var labelText = cleanText(fileTrigger.textContent || fileTrigger.getAttribute("aria-label") || "");
          var isImportLabel = labelText.indexOf("导入") >= 0;
          if (!inModalArea && (inToolbarArea || isImportLabel)) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
            openGlobalActionFallback("导入");
            return;
          }
          }
        }

        var progressBtn = e.target && e.target.closest ? e.target.closest("[data-map-open-progress='1']") : null;
        if (progressBtn) {
          return;
        }
        var textBtn = e.target && e.target.closest ? e.target.closest("button, a, [role='button']") : null;
        if (textBtn) {
          var text = (textBtn.textContent || "").replace(/\s+/g, "");
          var act = (textBtn.getAttribute("data-act") || "").toLowerCase();
          if (text.indexOf("流程进度") >= 0 || text.indexOf("查看进度") >= 0 || act === "progress" || act === "progresss") {
            return;
          }
        }

        var btn = e.target && e.target.closest ? e.target.closest("button,a,[data-a],[data-act],[data-op]") : null;
        if (btn) {
          if (btn.getAttribute && btn.getAttribute("data-map-open-progress") === "1") return;
          var btnText = (btn.textContent || "").replace(/\s+/g, "");
          var btnAct = (btn.getAttribute("data-act") || "").toLowerCase();
          if (btnText.indexOf("流程进度") >= 0 || btnText.indexOf("查看进度") >= 0 || btnAct === "progress" || btnAct === "progresss") return;
          if (btn.closest && btn.closest(".warehouse-secondary-panel,.secondary-panel,.sidebar")) return;
          window.__mapLastActionBtn = btn;
          ctx.action = (btn.getAttribute("data-a") || btn.getAttribute("data-act") || btn.getAttribute("data-op") || "").toLowerCase();
          ctx.actionText = cleanText(btn.textContent || "");
          ctx.rowPairs = collectRowPairs(btn);
          ctx.rowText = cleanText((btn.closest && btn.closest("tr") ? btn.closest("tr").textContent : "") || "");
          var directAction = resolveActionLabel(ctx.actionText || ctx.action || "");
          var inTableArea = !!(
            btn.closest &&
            (btn.closest("table") ||
              btn.closest(".carrier-toolbar,.search-row,.filters,.map-ledger-actions,.toolbar,.toolbar-left,.toolbar-right,.actions,.carrier-head,.card"))
          );
          var handled = {
            "新增": 1,
            "编辑": 1,
            "查看": 1,
            "删除": 1,
            "导入": 1,
            "下载模板": 1,
            "导出": 1,
            "搜索": 1,
            "重置": 1
          };
          // 统一弹窗交互：点击一次即弹一次，不走延迟兜底链路
          if (
            directAction &&
            handled[directAction] &&
            inTableArea &&
            !(btn.closest && btn.closest(".modal,.proc-modal-box,.cm-dialog,.ppm-dialog,[role='dialog']"))
          ) {
            // 销售管理页面使用自身弹窗和下单交互，不走全局兜底弹窗。
            if (/^sales-/.test(file)) return;
            // 物资采购聚合页保持原生弹窗（避免覆盖你确认过的新增/编辑/查看交互）
            if (file === "material-procurement-hub.html") return;
            // 验收入库页面走原生弹窗，避免全局通用弹窗导致展示不全
            if (file === "proc-acceptance-inbound.html") return;
            // 库存管理（proc-quality-accept）页面走原生弹窗，避免全局通用弹窗导致新增/查看/编辑展示不全
            if (file === "proc-quality-accept.html") return;
            // 项目公司入库页面走原生弹窗，避免全局通用弹窗导致新增/查看/编辑/删除展示不全
            if (file === "proj-company-inbound.html") return;
            // 采购合同管理走页面原生弹窗，确保编辑/查看与新增完全同模板
            if (file === "contract-management.html") return;
            // 退换货管理走页面原生弹窗，确保新增/编辑/查看与新增同模板
            if (file === "return-exchange-management.html") return;
            // 物资领用走页面原生弹窗（新增领用/内部流转/可选物资等）
            if (file === "purchase-ledger.html") return;
            // 盘点管理两页使用页面原生弹窗，避免全局兜底弹窗覆盖明细表操作列
            if (file === "inventory-task-management.html" || file === "inventory-difference-handling.html") return;
            // 订单需求管理（m3）走页面原生弹窗（新增同款），不使用全局统一弹窗
            if (
              file === "material-procurement-hub.html" &&
              btn.closest &&
              btn.closest("#proc-m3") &&
              (directAction === "新增" || directAction === "编辑" || directAction === "查看" || directAction === "删除")
            ) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
            openGlobalActionFallback(directAction);
            return;
          }
          setTimeout(function () {
            var opened = document.querySelectorAll(
              ".modal-mask.show, .proc-modal-mask.show, .proc-modal-mask.is-open, .cm-modal-mask.show, .ppm-modal-mask.show, .map-flow-mask.show"
            );
            Array.prototype.forEach.call(opened, function (m) {
              fillModalIfEmpty(m);
              ensureDeleteDialogContent(m);
              ensureProcHubM10DetailFlowProgress(m);
              ensureViewCancelLabel(m);
            });
          }, 0);
          setTimeout(function () {
            if (hasVisibleModal()) return;
            var actionLabel = resolveActionLabel(ctx.actionText || ctx.action || "");
            if (!actionLabel) return;
            if (file === "material-procurement-hub.html") return;
            if (file === "proc-acceptance-inbound.html") return;
            if (file === "proc-quality-accept.html") return;
            if (file === "proj-company-inbound.html") return;
            if (file === "contract-management.html") return;
            if (file === "return-exchange-management.html") return;
            if (file === "inventory-task-management.html" || file === "inventory-difference-handling.html") return;
            var inTableArea = !!(btn.closest && (btn.closest("table") || btn.closest(".carrier-toolbar,.search-row,.filters,.map-ledger-actions,.toolbar,.toolbar-left,.toolbar-right,.actions,.carrier-head,.card")));
            if (!inTableArea) return;
            if (actionLabel === "编辑" && tryOpenEditUsingAddTemplate(btn)) {
              setTimeout(function () {
                if (hasVisibleModal()) return;
                openGlobalActionFallback(actionLabel);
              }, 140);
              return;
            }
            openGlobalActionFallback(actionLabel);
          }, 120);
        }
        var closeBtn = e.target && e.target.closest ? e.target.closest("[data-map-modal-close='1']") : null;
        if (closeBtn) {
          e.preventDefault();
          closeModalFrom(closeBtn);
        }
        var okBtn = e.target && e.target.closest ? e.target.closest("[data-map-modal-confirm='1']") : null;
        if (okBtn) {
          e.preventDefault();
          closeModalFrom(okBtn);
          alert("已提交（演示）");
        }
        var globalOk = e.target && e.target.closest ? e.target.closest("[data-map-global-ok='1']") : null;
        if (globalOk) {
          e.preventDefault();
          var gm = document.getElementById("map-global-action-fallback");
          if (gm) {
            gm.classList.remove("show");
            gm.setAttribute("aria-hidden", "true");
          }
          alert("已提交（演示）");
        }
        var progressBtn = e.target && e.target.closest ? e.target.closest("[data-map-open-progress='1']") : null;
        if (progressBtn) {
          return;
        }
      },
      true
    );

    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        var opened = document.querySelectorAll(
          ".modal-mask.show, .proc-modal-mask.show, .proc-modal-mask.is-open, .cm-modal-mask.show, .ppm-modal-mask.show, .map-flow-mask.show"
        );
        Array.prototype.forEach.call(opened, function (m) {
          fillModalIfEmpty(m);
          ensureDeleteDialogContent(m);
          ensureProcHubM10DetailFlowProgress(m);
          ensureViewCancelLabel(m);
        });
      }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function installMinTenRowsForBusinessPages() {
    var file = (location.pathname || "").split("/").pop();
    var targets = {
      "procurement-application.html": 1,
      "order-demand-management.html": 1,
      "proc-project-accept.html": 1,
      "purchase-ledger.html": 1,
      "cargo-ledger.html": 1,
      "purchase-summary-report.html": 1,
      "proc-acceptance-inbound.html": 1,
      "proc-use-approval.html": 1,
      "proc-sales-contract.html": 1,
      "proc-shipment.html": 1,
      "proc-quality-accept.html": 1,
      "return-exchange-management.html": 1
    };
    if (!targets[file]) return;

    function statusTone(statusText) {
      var t = String(statusText || "").replace(/\s+/g, "");
      if (
        t === "审批中" || t === "待确认" || t === "待验收" || t === "验收中" ||
        t === "待入库" || t === "待发货" || t === "待审核" || t === "入库中"
      ) return "pending";
      if (
        t === "已通过" || t === "已确认" || t === "已生效" || t === "已批准" ||
        t === "已出库" || t === "已发货" || t === "已签收" || t === "已完成" || t === "审核通过" ||
        t === "已入库"
      ) return "pass";
      if (t === "已驳回" || t === "不通过" || t === "已拒绝") return "reject";
      if (t === "已撤回") return "withdraw";
      return "draft";
    }

    function statusPoolByFile() {
      var pool = {
        "procurement-application.html": ["草稿", "审批中", "已驳回", "已通过"],
        "order-demand-management.html": ["草稿", "待确认", "已确认", "已发货", "已完成", "已驳回"],
        "contract-management.html": ["草稿", "审批中", "已生效", "已驳回"],
        "proc-project-accept.html": ["草稿", "待验收", "验收中", "待确认", "已通过", "不通过"],
        "proc-acceptance-inbound.html": ["草稿", "入库中", "已入库"],
        "proc-use-approval.html": ["草稿", "审批中", "已批准", "已出库", "已驳回"],
        "proc-sales-contract.html": ["草稿", "审批中", "已生效", "已驳回"],
        "proc-shipment.html": ["草稿", "待发货", "已发货", "已签收"],
        "proc-quality-accept.html": ["已通过"],
        "return-exchange-management.html": ["草稿", "待审核", "审核通过", "已完成", "已拒绝"]
      };
      return pool[file] || ["草稿", "审批中", "已通过", "已驳回"];
    }

    function textByHeader(head, rowIdx, colIdx, st) {
      var h = String(head || "").replace(/\s+/g, "");
      var idx = rowIdx + 1;
      if (!h) return "";
      if (h.indexOf("状态") >= 0 || h.indexOf("进度") >= 0 || h.indexOf("结论") >= 0) return st;
      if (h.indexOf("操作") >= 0 || h.indexOf("详情") >= 0) return "__OPS__";
      if (h.indexOf("序号") >= 0) return String(idx);
      if (h.indexOf("公司") >= 0 || h.indexOf("单位") >= 0 && h !== "单位") return ["中车电气", "金风科技", "许继电气", "远景能源", "华能电力"][rowIdx % 5];
      if (h.indexOf("阶段") >= 0) return "S" + ((rowIdx % 4) + 1);
      if (h.indexOf("账期") >= 0) return String(12 + (rowIdx % 6)) + "个月";
      if (h.indexOf("税率") >= 0) return "13%";
      if (h.indexOf("比例") >= 0) return ["30%", "50%", "70%", "100%"][rowIdx % 4];
      if (h.indexOf("方式") >= 0) return ["银行转账", "承兑汇票", "电汇"][rowIdx % 3];
      if (h.indexOf("有效期") >= 0) return "2026-04-" + String(10 + (rowIdx % 18)).padStart(2, "0") + "~2027-04-" + String(10 + (rowIdx % 18)).padStart(2, "0");
      if (h.indexOf("单号") >= 0 || h.indexOf("编号") >= 0) return "NO-" + (2026000 + idx);
      if (h.indexOf("合同") >= 0 && h.indexOf("号") >= 0) return "HT-2026-" + (100 + idx);
      if (h.indexOf("项目") >= 0) return "新能源示范项目" + ((idx % 6) + 1);
      if (h.indexOf("物资") >= 0 || h.indexOf("货物") >= 0 || h.indexOf("名称") >= 0) return ["逆变器", "电缆", "汇流箱", "接线端子", "支架组件"][rowIdx % 5];
      if (h.indexOf("规格") >= 0 || h.indexOf("型号") >= 0) return "XH-" + (100 + idx);
      if (h.indexOf("数量") >= 0) return String(10 + (rowIdx % 9) * 5);
      if (h === "单位") return ["台", "件", "套", "米", "个"][rowIdx % 5];
      if (h.indexOf("单价") >= 0) return "¥" + String(800 + (rowIdx % 7) * 120);
      if (h.indexOf("总价") >= 0 || h.indexOf("金额") >= 0 || h.indexOf("价税") >= 0) return "¥" + String((800 + (rowIdx % 7) * 120) * (10 + (rowIdx % 9) * 5));
      if (h.indexOf("日期") >= 0 || h.indexOf("时间") >= 0) return "2026-04-" + String(10 + (rowIdx % 18)).padStart(2, "0");
      if (h.indexOf("部门") >= 0) return ["物资部", "工程部", "采购部", "财务部"][rowIdx % 4];
      if (h.indexOf("人") >= 0) return ["张三", "李四", "王五", "赵六", "钱七"][rowIdx % 5];
      if (h.indexOf("仓") >= 0 || h.indexOf("库位") >= 0 || h.indexOf("货位") >= 0) return "A-" + ((rowIdx % 6) + 1) + "-0" + ((rowIdx % 9) + 1);
      if (h.indexOf("备注") >= 0) return "业务正常";
      return ["正常", "已登记", "已核验", "处理中", "已归档"][((rowIdx + colIdx) % 5)];
    }

    function opsHtmlByStatus(st) {
      var t = String(st || "").replace(/\s+/g, "");
      if (file === "proc-quality-accept.html") {
        return '<a href="#" class="carrier-op">查看</a>';
      }
      if (file === "proc-acceptance-inbound.html") {
        var htmlIn = '<a href="#" class="carrier-op">查看</a>';
        if (t === "草稿") {
          htmlIn += '<a href="#" class="carrier-op" style="margin-left:16px">编辑</a>';
          htmlIn += '<a href="#" class="carrier-op" style="margin-left:16px">删除</a>';
        } else if (t === "入库中") {
          htmlIn += '<a href="#" class="carrier-op" style="margin-left:16px">确认入库</a>';
        }
        return htmlIn;
      }
      var canEditDelete = (
        t === "草稿" || t === "已驳回" || t === "已拒绝" || t === "已撤回"
      );
      var canEditNoDelete = (t === "不通过" || t === "待发货");
      var html = '<a href="#" class="carrier-op">查看</a>';
      if (canEditDelete || canEditNoDelete) html += '<a href="#" class="carrier-op" style="margin-left:16px">编辑</a>';
      if (canEditDelete) html += '<a href="#" class="carrier-op" style="margin-left:16px">删除</a>';
      return html;
    }

    function ensureRows() {
      Array.prototype.forEach.call(document.querySelectorAll("table"), function (table) {
        if (
          file === "purchase-ledger.html" &&
          table.closest &&
          table.closest("#detailMask, #actionMask, .pl-req-picker-mask")
        ) {
          var skipTbody = table.querySelector("tbody");
          if (skipTbody) {
            Array.prototype.forEach.call(skipTbody.querySelectorAll("tr.map-fill-10"), function (tr) {
              tr.parentNode && tr.parentNode.removeChild(tr);
            });
          }
          return;
        }
        var tbody = table.querySelector("tbody");
        if (!tbody) return;
        var realRows = Array.prototype.filter.call(tbody.querySelectorAll("tr"), function (tr) {
          return !tr.classList.contains("map-fill-10");
        });
        var fillRows = tbody.querySelectorAll("tr.map-fill-10");
        var current = realRows.length + fillRows.length;

        var colCount = 0;
        var firstRow = realRows[0] || tbody.querySelector("tr");
        if (firstRow) colCount = firstRow.querySelectorAll("td").length;
        if (!colCount) {
          var headRow = table.querySelector("thead tr:last-child");
          if (headRow) colCount = headRow.querySelectorAll("th").length;
        }
        if (!colCount) return;

        var headRow = table.querySelector("thead tr:last-child");
        var headCells = headRow ? headRow.querySelectorAll("th") : [];
        var heads = headRow ? Array.prototype.map.call(headCells, function (th) {
          return (th.textContent || "").trim();
        }) : [];
        var stPool = statusPoolByFile();
        var hasFlowNoCol = heads.some(function (h) {
          return String(h || "").replace(/\s+/g, "").indexOf("流转单号") >= 0;
        });

        if (hasFlowNoCol) {
          Array.prototype.forEach.call(tbody.querySelectorAll("tr.map-fill-10"), function (tr) {
            tr.parentNode && tr.parentNode.removeChild(tr);
          });
          return;
        }

        // 强制表体列数与表头一致，清除“操作列后多出一列”的脏数据
        if (headRow) {
          var headCount = headRow.querySelectorAll("th").length;
          if (headCount > 0) {
            Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (tr) {
              if (!tr || tr.classList.contains("map-fill-10")) return;
              var tdsNow = tr.querySelectorAll("td");
              if (tdsNow.length <= headCount) return;
              for (var x = tdsNow.length - 1; x >= headCount; x--) {
                var tdDrop = tdsNow[x];
                tdDrop && tdDrop.parentNode && tdDrop.parentNode.removeChild(tdDrop);
              }
            });
          }
        }

        // 只做增量调整，避免每次 mutation 都删除重建导致卡顿
        if (current < 10) {
          for (var i = current; i < 10; i++) {
            var tr = document.createElement("tr");
            tr.className = "map-fill-10";
            var status = stPool[i % stPool.length];
            var tds = "";
            for (var j = 0; j < colCount; j++) {
              var hv = heads[j] || "";
              var hCell = headCells[j];
              var isCheckboxCol = !!(hCell && hCell.querySelector && hCell.querySelector("input[type='checkbox']"));
              if (isCheckboxCol) {
                tds += '<td><input type="checkbox" class="map-fill-row-check"></td>';
                continue;
              }
              var val = textByHeader(hv, i, j, status);
              if (val === "__OPS__") {
                tds += '<td class="map-op-cell">' + opsHtmlByStatus(status) + "</td>";
                continue;
              }
              var hKey = String(hv || "").replace(/\s+/g, "");
              if (hKey.indexOf("状态") >= 0 || hKey.indexOf("进度") >= 0 || hKey.indexOf("结论") >= 0) {
                var tone = statusTone(status);
                tds += '<td><span class="map-approval-status-pill map-approval-status-' + tone + '">' + status + "</span></td>";
                continue;
              }
              tds += "<td>" + val + "</td>";
            }
            tr.innerHTML = tds;
            tbody.appendChild(tr);
          }
          return;
        }

        // 真实行数足够时，移除多余填充行
        if (realRows.length >= 10 && fillRows.length) {
          Array.prototype.forEach.call(fillRows, function (tr) {
            tr.parentNode && tr.parentNode.removeChild(tr);
          });
          return;
        }

        // 真实行 + 填充行超过10，裁剪多余填充行
        if (current > 10 && fillRows.length) {
          var needKeep = Math.max(0, 10 - realRows.length);
          for (var k = needKeep; k < fillRows.length; k++) {
            var fr = fillRows[k];
            fr.parentNode && fr.parentNode.removeChild(fr);
          }
        }
      });
    }

    ensureRows();
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        ensureRows();
      }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  try {
    window.ensureUnifiedProgressModal = ensureUnifiedProgressModal;
    window.openUnifiedProgressModal = openUnifiedProgressModalGlobal;
  } catch (eExposeProgress) {}

  tickClock();
  setInterval(tickClock, 1000);
  installOrgAccessBridge();
  installOrgRoleSwitch();
  installAssetScopeGuards();
  installMasterNavInteractions();
  installShellQuickActions();
  installSubpageBreadcrumb();
  installUnifiedOpAndProgress();
  installUnifiedTopButtons();
  installTopButtonPolicy();
  installProcQualityAcceptHardPrune();
  installApprovalStatusPlainText();
  installLedgerPageHardUnify();
  installModuleRowCheckboxes();
  installBusinessModalFallback();
  installMinTenRowsForBusinessPages();
  /* XQ-037 任务弹窗：sidebar-actions.js 内亦有 setTimeout 挂载；此处再调一次确保在侧栏/顶栏 DOM 就绪后显示，且 z-index 已生效 */
  try {
    if (typeof window.mapDemoMountTaskReminder === "function") {
      window.mapDemoMountTaskReminder();
    }
  } catch (eTaskRem) {}
})();
