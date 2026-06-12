/**
 * 离线演示壳（index.html / demo-*-interactive）顶栏「角色切换」：
 * 与 js/subpage-clock.js 中 ORG_ROLE_CATALOG 保持一致；置于「上一页」同一条 .actions 工具栏最左侧。
 */
(function (global) {
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
    { id: "mech_specialist", title: "机械所专责", person: "机械所专责", dept: "机械所", modules: ["purchaseMgmt", "warehouse", "task", "logistics"], assetScope: "dept" },
    { id: "elec_specialist", title: "电控所专责", person: "电控所专责", dept: "电控所", modules: ["purchaseMgmt", "warehouse", "task", "logistics"], assetScope: "dept" },
    { id: "scrap_specialist", title: "公司废旧鉴定专责", person: "史秋生", dept: "废旧鉴定中心", modules: ["retired", "warehouse", "task", "data"], assetScope: "none" },
    { id: "scrap_head", title: "公司废旧鉴定主管", person: "任淮辉", dept: "废旧鉴定中心", modules: ["retired", "warehouse", "task", "data"], assetScope: "none" }
  ];

  function getDefaultRoleId() {
    return "gm_zeng";
  }

  function getStoredRoleId() {
    try {
      var id = (sessionStorage.getItem("demoOrgRoleId") || "").trim();
      return id || getDefaultRoleId();
    } catch (e0) {
      return getDefaultRoleId();
    }
  }

  function findRole(roleId) {
    var r = ORG_ROLE_CATALOG.find(function (x) {
      return x.id === roleId;
    });
    return r || ORG_ROLE_CATALOG[0];
  }

  function postRoleToIframe(getFrame, roleId) {
    var fr = typeof getFrame === "function" ? getFrame() : null;
    if (!fr || !fr.contentWindow) return;
    try {
      fr.contentWindow.postMessage({ type: "map-demo-shell-role", roleId: roleId }, "*");
    } catch (e1) {}
  }

  /**
   * @param {() => HTMLIFrameElement | null} getFrame
   */
  function installDemoShellOrgRoleSwitch(getFrame) {
    var wrap = document.getElementById("shellOrgRoleWrap");
    if (!wrap || wrap.__demoShellOrgRoleInstalled) return;
    wrap.__demoShellOrgRoleInstalled = true;

    if (!document.getElementById("demoShellOrgRoleStyle")) {
      var st = document.createElement("style");
      st.id = "demoShellOrgRoleStyle";
      st.textContent =
        ".shell-org-role-switch{position:relative;display:inline-flex;align-items:center;margin-right:2px;vertical-align:middle;}" +
        ".shell-org-role-btn{height:24px;padding:0 8px;font-size:11px;border-radius:4px;border:1px solid rgba(255,255,255,0.45);" +
        "background:transparent;color:#e8f2ff;cursor:pointer;font-family:inherit;white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis;}" +
        ".shell-org-role-btn:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.65);color:#fff;}" +
        ".shell-org-role-menu{position:absolute;left:0;top:28px;width:min(320px,calc(100vw - 24px));max-height:min(320px,50vh);overflow:auto;" +
        "background:#fff;border:1px solid #dbe6f3;border-radius:8px;box-shadow:0 12px 30px rgba(8,27,50,0.25);padding:6px;display:none;z-index:20050;}" +
        ".shell-org-role-menu.is-open{display:block;}" +
        ".shell-org-role-item{width:100%;text-align:left;border:none;background:#fff;padding:7px 8px;border-radius:6px;color:#29405a;font-size:12px;cursor:pointer;}" +
        ".shell-org-role-item:hover{background:#f1f6ff;}" +
        ".shell-org-role-item.is-active{background:#e6f4ff;color:#0958d9;font-weight:600;}";
      document.head.appendChild(st);
    }

    var curId = getStoredRoleId();
    var role = findRole(curId);
    wrap.className = "shell-org-role-switch";
    wrap.innerHTML =
      '<button type="button" class="shell-org-role-btn" id="shellOrgRoleBtn">角色切换：' +
      role.title +
      "</button>" +
      '<div class="shell-org-role-menu" id="shellOrgRoleMenu" role="menu"></div>';

    var btn = wrap.querySelector("#shellOrgRoleBtn");
    var menu = wrap.querySelector("#shellOrgRoleMenu");
    menu.innerHTML = ORG_ROLE_CATALOG.map(function (x) {
      var label = x.title + "（" + x.person + "）";
      return (
        '<button type="button" class="shell-org-role-item' +
        (x.id === role.id ? " is-active" : "") +
        '" data-role-id="' +
        x.id +
        '" role="menuitem">' +
        label +
        "</button>"
      );
    }).join("");

    function closeMenu() {
      menu.classList.remove("is-open");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });

    menu.addEventListener("click", function (e) {
      var item = e.target.closest("[data-role-id]");
      if (!item) return;
      var roleId = item.getAttribute("data-role-id");
      var nextRole = findRole(roleId);
      try {
        sessionStorage.setItem("demoOrgRoleId", nextRole.id);
      } catch (e2) {}
      menu.querySelectorAll(".shell-org-role-item").forEach(function (x) {
        x.classList.remove("is-active");
      });
      item.classList.add("is-active");
      btn.textContent = "角色切换：" + nextRole.title;
      postRoleToIframe(getFrame, nextRole.id);
      closeMenu();
    });

    document.addEventListener("click", closeMenu);
  }

  global.installDemoShellOrgRoleSwitch = installDemoShellOrgRoleSwitch;
  global.__demoShellPostRoleToIframe = postRoleToIframe;
})(typeof window !== "undefined" ? window : this);
