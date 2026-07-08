/**
 * 演示用：各模块灰字角色说明（合并页全部展示，不隐藏）
 */
(function (root) {
  var L = {
    engRolesView:
      "可见角色：工程技术公司采购专责、部门物资专责、部门负责人、主管领导、公司采购主管、董事/总经理（仅查看）",
    engRolesFilter:
      "可筛选角色：工程技术公司采购专责、部门物资专责、部门负责人、主管领导、公司采购主管",
    engRolesFilterDept: "可筛选角色：工程技术公司采购专责、部门物资专责、部门负责人",
    engRolesOperate: "可操作角色：工程技术公司采购专责、部门物资专责",
    engRolesOperatePurchase: "可操作角色：工程技术公司采购专责",
    engRolesExport: "可操作角色：工程技术公司采购专责、部门负责人、主管领导、公司采购主管",
    projRolesView:
      "可见角色：项目公司物资专责、项目公司部门负责人、项目公司领导（仅查看）",
    projRolesFilter:
      "可筛选角色：项目公司物资专责、项目公司部门负责人、项目公司领导（仅查看）",
    projRolesOperate: "可操作角色：项目公司物资专责",
    projRolesExport: "可操作角色：项目公司物资专责、项目公司部门负责人",
    projRolesDeleteDraft: "可操作角色：项目公司物资专责（仅草稿）",
    projDeliveryFilter:
      "可筛选角色：项目公司物资专责（区分向供应商直采 / 向工程技术公司采购）",
    bothRolesFilter: "可筛选角色：工程技术公司全体角色、项目公司全体角色",
    bothRolesSearch: "可操作角色：工程技术公司全体角色、项目公司全体角色",
    deliveryColHint: "仅项目公司自采行填写；工程技术公司内部采购显示「—」"
  };
  root.PROC_ROLE_LABELS = L;
})(typeof window !== "undefined" ? window : globalThis);
