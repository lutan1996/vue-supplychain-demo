/**
 * 各页角色分区说明（红漂浮窗，可关闭）
 */
(function (root) {
  root.ROLE_ANNOTATION_PAGES = {
    "contract-management.html": {
      title: "合同信息管理 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "列表「到货路径」列",
          items: ["仅项目公司角色可见"],
          anchor: "[data-role-annot='cm-proj-delivery-col']",
          place: "left"
        },
        {
          id: "g2",
          label: "筛选「到货路径」下拉框",
          items: ["仅项目公司角色可见"],
          anchor: "[data-role-annot='cm-proj-delivery-filter']",
          place: "left"
        }
      ]
    },
    "purchase-plan-management.html": {
      title: "采购信息台帐 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "列表「到货路径」列",
          items: ["仅项目公司角色可见"],
          anchor: "[data-role-annot='ppm-proj-delivery-col']",
          place: "left"
        },
        {
          id: "g2",
          label: "筛选「到货路径」下拉框",
          items: ["仅项目公司角色可见"],
          anchor: "[data-role-annot='ppm-proj-delivery-filter']",
          place: "left"
        }
      ]
    },
    "purchase-summary-report.html": {
      title: "采购合同报表 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "工程技术公司",
          items: ["左侧统计图区域：仅工程技术公司角色可见"],
          anchor: ".ps-analytics",
          place: "left"
        },
        {
          id: "g2",
          label: "项目公司",
          items: ["筛选「到货路径」下拉框：仅项目公司角色可见"],
          anchor: "#fDelivery",
          place: "left"
        }
      ]
    },
    "sales-order-management.html": {
      title: "订单管理 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "项目公司",
          items: ["列表订单数据及「查看」「收货确认」操作：仅项目公司角色可见"],
          anchor: "#salesOrderBody",
          place: "left"
        },
        {
          id: "g2",
          label: "工程技术公司",
          items: ["顶部「确认/审核」「签订合同」「发货」等按钮：仅工程技术公司角色可见"],
          anchor: ".sales-toolbar",
          place: "left"
        }
      ]
    },
    "sales-material-list.html": {
      title: "物资列表 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "项目公司物资专责",
          items: ["右侧物资目录与加购下单区：仅项目公司物资专责可见"],
          anchor: ".sales-product-panel",
          place: "left"
        },
        {
          id: "g2",
          label: "工程技术公司",
          items: ["左侧分类树区域：仅工程技术公司角色可见"],
          anchor: ".sales-tree-panel",
          place: "left"
        }
      ]
    },
    "sales-purchased-materials.html": {
      title: "购入物资 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "项目公司",
          items: ["筛选「采购来源」下拉框：仅项目公司角色可见"],
          anchor: "#salesPurchasedSourceFilter",
          place: "left"
        },
        {
          id: "g2",
          label: "工程技术公司",
          items: ["列表购入明细表：仅工程技术公司角色可见"],
          anchor: ".sales-table-wrap",
          place: "left"
        }
      ]
    },
    "sales-contract-report.html": {
      title: "销售合同报表 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "工程技术公司",
          items: ["顶部统计卡片与筛选区：仅工程技术公司角色可见"],
          anchor: ".sales-report-card",
          place: "left"
        },
        {
          id: "g2",
          label: "项目公司",
          items: ["下方合同执行列表：仅项目公司角色可见"],
          anchor: "#salesReportBody",
          place: "left"
        }
      ]
    },
    "sales-proj-company-inbound.html": {
      title: "项目公司实物入库 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "项目公司物资专责",
          items: ["顶部「新增入库」等操作按钮：仅项目公司物资专责可见"],
          anchor: ".proc-m10-toolbar-btns",
          place: "left"
        },
        {
          id: "g2",
          label: "工程技术公司物资专责",
          items: ["入库明细列表：仅工程技术公司物资专责可见"],
          anchor: "#proc-m10-inbound-table",
          place: "left"
        }
      ]
    },
    "purchase-ledger.html": {
      title: "物资领用 · 角色可见",
      note: "可点右上角 × 关闭",
      groups: [
        {
          id: "g1",
          label: "部门物资专责",
          items: ["页签「物资统计」「领用申请」：仅部门物资专责可见"],
          anchor: ".tabs",
          place: "left"
        },
        {
          id: "g2",
          label: "部门负责人",
          items: ["筛选条件区域：仅部门负责人可见"],
          anchor: ".filters",
          place: "left"
        },
        {
          id: "g3",
          label: "经营发展中心",
          items: ["数据列表区域：仅经营发展中心可见"],
          anchor: ".table-wrap",
          place: "left"
        }
      ]
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
