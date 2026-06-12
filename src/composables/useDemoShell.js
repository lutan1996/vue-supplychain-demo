import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';

export function useDemoShell() {
  const meta = [
    { title: '登录（账号密码）', file: 'demo-login-placeholder.html', group: 'core' },
    { title: '首页', file: 'index-portal-screen-alt.html', group: 'core' },
    { title: '驾驶舱', file: 'cockpit.html', group: 'core' },
    { title: '模块首页（旧）', file: 'module-home.html', group: 'other' },
    { title: '采购申请', file: 'procurement-application.html', group: 'other' },
    { title: '承运商管理', file: 'carrier-management.html', group: 'logistics' },
    { title: '物流合同', file: 'logistics-contract.html', group: 'logistics' },
    { title: '物流跟踪', file: 'logistics-tracking.html', group: 'logistics' },
    { title: '物流付款', file: 'logistics-payment.html', group: 'logistics' },
    { title: '仓储管理', file: 'warehouse.html', group: 'warehouse' },
    { title: '收货入库', file: 'receipt-inbound.html', group: 'warehouse' },
    { title: '扫码领用', file: 'scan-pick.html', group: 'warehouse' },
    { title: '货位管理', file: 'slot-management.html', group: 'warehouse' },
    { title: '盘库管理', file: 'inventory-check.html', group: 'warehouse' },
    { title: '库内保养', file: 'warehouse-maintenance.html', group: 'warehouse' },
    { title: '库存管理', file: 'inventory-management.html', group: 'warehouse' },
    { title: '闲置物资', file: 'idle-materials.html', group: 'warehouse' },
    { title: '退役及报废申请', file: 'retire-scrap-application.html', group: 'retired' },
    { title: '设备评估', file: 'equipment-evaluation.html', group: 'retired' },
    { title: '以大代小&循环再利用', file: 'big-small-reuse.html', group: 'retired' },
    { title: '基础数据配置中心', file: 'base-data-material-ledger.html', group: 'data' },
    { title: '合同管理', file: 'contract-management.html', group: 'purchase' },
    { title: '采购计划表', file: 'purchase-plan-table.html', group: 'purchase' },
    { title: '采购数据台账', file: 'purchase-ledger.html', group: 'purchase' },
    { title: '货物台账', file: 'cargo-ledger.html', group: 'purchase' },
    { title: '验收入库', file: 'proc-acceptance-inbound.html', group: 'purchase' },
    { title: '领用申请审批', file: 'proc-use-approval.html', group: 'purchase' },
    { title: '销售合同管理', file: 'proc-sales-contract.html', group: 'purchase' },
    { title: '发货管理', file: 'proc-shipment.html', group: 'purchase' },
    { title: '货物质量验收', file: 'proc-quality-accept.html', group: 'purchase' },
    { title: '采购汇总报表', file: 'purchase-summary-report.html', group: 'purchase' },
    { title: '出入库记录', file: 'warehouse-io-ledger.html', group: 'warehouse' },
    { title: '库存台账', file: 'warehouse-stock-ledger.html', group: 'warehouse' },
    { title: '物流台账', file: 'logistics-ledger.html', group: 'logistics' },
    { title: '资产台账', file: 'asset-ledger.html', group: 'asset' },
    { title: '个人资产', file: 'assets-personal.html', group: 'asset' },
    { title: '部门资产', file: 'assets-department.html', group: 'asset' },
    { title: '公司资产', file: 'assets-company.html', group: 'asset' },
    { title: '资产交接', file: 'asset-transfer-management.html', group: 'asset' },
    { title: '资产性质转变', file: 'asset-nature-change-management.html', group: 'asset' },
    { title: '盘点管理', file: 'asset-inventory-management.html', group: 'asset' },
    { title: '价值管理', file: 'asset-value-management.html', group: 'asset' },
    { title: '子页模板', file: 'subpage-template.html', group: 'other' },
    { title: '我的任务-原型列表', file: 'my-tasks-prototype-list.html', group: 'core' },
    { title: '采购计划审批单（办理）', file: 'purchase-plan-approval-handle.html', group: 'core' },
    { title: '驾驶舱分析', file: 'cockpit-analytics.html', group: 'core' },
    { title: '采购管理聚合', file: 'purchase-management-hub.html', group: 'other' },
    { title: '物资采购聚合', file: 'material-procurement-hub.html', group: 'other' },
    { title: '退役子功能聚合', file: 'retired-module-hub.html', group: 'retired' },
    { title: '绩效考核聚合', file: 'performance-hub.html', group: 'other' },
    { title: '公告管理聚合', file: 'notice-hub.html', group: 'other' },
    { title: '综合业务聚合', file: 'integrated-business-hub.html', group: 'other' },
    { title: '系统管理聚合', file: 'system-admin-hub.html', group: 'other' },
  ];

  const actionToFile = {
    'asset-company': 'assets-company.html',
    'asset-dept': 'assets-department.html',
    'asset-inventory-manage': 'asset-inventory-management.html',
    'asset-ledger': 'asset-ledger.html',
    'asset-nature-change-manage': 'asset-nature-change-management.html',
    'asset-personal': 'assets-personal.html',
    'asset-scrap-identify': 'scrap-identification-approval.html',
    'asset-transfer-manage': 'asset-transfer-management.html',
    'asset-value-manage': 'asset-value-management.html',
    'biz-center': 'procurement-application.html',
    'biz-claim': 'integrated-business-hub.html?tab=claim',
    'biz-collab': 'carrier-management.html',
    'biz-domestic-substitute': 'domestic-substitution.html',
    'biz-emergency': 'integrated-business-hub.html?tab=emg',
    'biz-expert': 'integrated-business-hub.html?tab=exp',
    'biz-finance': 'integrated-business-hub.html?tab=fin',
    'biz-overview': 'integrated-business-hub.html?tab=fin',
    'biz-process': 'integrated-business-hub.html?tab=flow',
    'biz-process-design': 'integrated-business-hub.html?tab=flow',
    'biz-repair': 'repair-domestic-hub.html',
    'biz-standard': 'biz-standard-list.html',
    'biz-transfer': 'integrated-business-hub.html?tab=adj',
    'cargo-ledger': 'purchase-ledger.html?tab=cargo',
    'data-audit': 'scrap-identification-approval.html',
    'data-base': 'base-data-material-ledger.html',
    'data-carrier': 'base-data-material-ledger.html?tab=carrier',
    'data-catalog': 'base-data-material-ledger.html?tab=product',
    'data-code': 'data-code-fixed.html',
    'data-code-rule': 'base-data-material-ledger.html?tab=codeRule',
    'data-company': 'base-data-material-ledger.html?tab=company',
    'data-contract': 'data-contract-fixed.html',
    'data-decision': 'cockpit-analytics.html',
    'data-department': 'base-data-material-ledger.html?tab=department',
    'data-dict': 'base-data-material-ledger.html?tab=dict',
    'data-ledger': 'base-data-material-ledger.html',
    'data-master': 'base-data-material-ledger.html',
    'data-model': 'equipment-evaluation.html',
    'data-personnel': 'base-data-material-ledger.html?tab=personnel',
    'data-product': 'base-data-material-ledger.html?tab=product',
    'data-quality': 'asset-value-management.html',
    'data-rate-tax': 'base-data-material-ledger.html?tab=rateTax',
    'data-report': 'subpage-template.html',
    'data-station': 'base-data-material-ledger.html?tab=station',
    'data-stock': 'inventory-management.html',
    'data-supplier': 'base-data-material-ledger.html?tab=supplier',
    'dev-admin-monitor': 'devtools-prototype-list.html?scene=cacheMonitor',
    'dev-cache-monitor': 'devtools-prototype-list.html?scene=cacheMonitor',
    'dev-flow-category': 'devtools-prototype-list.html?scene=flowCategory',
    'dev-flow-instance': 'devtools-prototype-list.html?scene=flowInstance',
    'dev-form-manage': 'devtools-prototype-list.html?scene=formManage',
    'dev-leave': 'devtools-prototype-list.html?scene=leave',
    'dev-model-manage': 'devtools-prototype-list.html?scene=modelManage',
    'dev-online-user': 'devtools-prototype-list.html?scene=onlineUser',
    'dev-pending-task': 'devtools-prototype-list.html?scene=pendingTask',
    'dev-plus-home': 'devtools-prototype-list.html?scene=plusSite',
    'dev-process-define': 'devtools-prototype-list.html?scene=processDefine',
    'dev-task-dispatch': 'devtools-prototype-list.html?scene=pendingTask',
    'dev-tenant': 'devtools-prototype-list.html?scene=tenant',
    'dev-tenant-package': 'devtools-prototype-list.html?scene=tenantPackage',
    'dev-test-form': 'devtools-prototype-list.html?scene=testForm',
    'dev-test-tree': 'devtools-prototype-list.html?scene=testTree',
    'finance-export': 'oa-flow-center.html?tab=export',
    'flow-notify': 'oa-flow-center.html?tab=notify',
    'flow-print-pdf': 'oa-flow-center.html?tab=print',
    'flow-return-withdraw': 'oa-flow-center.html?tab=return',
    'go-app-hub': 'index-portal-screen-alt.html',
    'go-cockpit': 'cockpit.html',
    'go-cockpit-copy': 'cockpit.html',
    'go-cockpit-kpi': 'cockpit.html',
    'go-cockpit-map': 'cockpit.html',
    'home-portal': 'index-portal-screen-alt.html',
    'home-system': 'index-portal-screen-alt.html',
    'idle': 'idle-materials.html',
    'inventory-check': 'inventory-check.html',
    'logistics-carrier': 'carrier-management.html',
    'logistics-contract': 'logistics-contract.html',
    'logistics-dispatch': 'logistics-contract.html',
    'logistics-integration': 'logistics-tracking.html',
    'logistics-ledger': 'logistics-ledger.html',
    'logistics-pay': 'logistics-payment.html',
    'logistics-sign': 'logistics-tracking.html',
    'logistics-track': 'logistics-tracking.html',
    'logistics-waybill': 'logistics-tracking.html',
    'maintenance': 'warehouse-maintenance.html',
    'material-catalog': 'base-data-material-ledger.html',
    'material-ledger': 'purchase-ledger.html?tab=material',
    'material-price': 'base-data-material-ledger.html',
    'notice-bid': 'notice-bid-fixed.html',
    'notice-company': 'notice-hub.html?tab=nonbid',
    'notice-nonbid': 'notice-prototype-list.html?scene=nonbid',
    'notice-ops': 'notice-hub.html?tab=nonbid',
    'notice-policy': 'notice-hub.html?tab=nonbid',
    'notice-system': 'notice-hub.html?tab=nonbid',
    'notice-training': 'notice-hub.html?tab=nonbid',
    'oa-flow-style': 'oa-flow-center.html?tab=style',
    'oa-integration': 'oa-flow-center.html?tab=sso',
    'performance-board': 'performance-hub.html?tab=login',
    'performance-flow-frequency': 'performance-hub.html?tab=flow',
    'performance-kpi': 'performance-hub.html?tab=flow',
    'performance-login-frequency': 'performance-hub.html?tab=login',
    'performance-rule': 'performance-hub.html?tab=flow',
    'proc-acceptance-inbound': 'proc-acceptance-inbound.html',
    'proc-project-accept': 'proc-quality-accept.html',
    'proc-quality-accept': 'proc-quality-accept.html',
    'proc-sales-contract': 'proc-sales-contract.html',
    'proc-shipment': 'proc-shipment.html',
    'proc-use-approval': 'proc-use-approval.html',
    'purchase-accept-confirm': 'proc-quality-accept.html#flow-warehouse',
    'purchase-apply': 'material-procurement-hub.html?tab=m2',
    'purchase-archive-catalog': 'purchase-pm-archive.html',
    'purchase-bid': 'material-procurement-hub.html?tab=m7',
    'purchase-bid-committee-review': 'purchase-pm-bid.html',
    'purchase-bid-pm': 'purchase-management-hub.html?tab=p7',
    'purchase-contract': 'contract-management.html',
    'purchase-contract-mgmt': 'contract-management.html',
    'purchase-data-maintain': 'purchase-pm-data-maintain.html',
    'purchase-file-review-minutes': 'purchase-pm-minutes.html',
    'purchase-group-plan-approval': 'purchase-pm-group-plan.html',
    'purchase-ledger': 'purchase-ledger.html',
    'purchase-longterm-use-approval': 'purchase-pm-longterm-result.html',
    'purchase-longterm-use-manage': 'purchase-pm-longterm-use.html',
    'purchase-material-info-manage': 'purchase-material-info-management.html',
    'purchase-monthly-bid-plan': 'purchase-pm-monthly-bid.html',
    'purchase-monthly-nonbid-plan': 'purchase-pm-monthly-nonbid.html',
    'purchase-nonbid-review': 'purchase-pm-nonbid.html',
    'purchase-order': 'order-demand-management.html',
    'purchase-order-demand': 'order-demand-management.html',
    'purchase-order-pm': 'purchase-management-hub.html?tab=p8',
    'purchase-pay': 'material-procurement-hub.html?tab=m8',
    'purchase-plan': 'purchase-management-hub.html?tab=p6',
    'purchase-plan-approval': 'purchase-pm-plan.html',
    'purchase-plan-manage': 'purchase-plan-management.html',
    'purchase-plan-table': 'purchase-plan-table.html',
    'purchase-quality-accept': 'material-procurement-hub.html?tab=m10',
    'purchase-reapply': 'purchase-pm-repurchase.html',
    'purchase-receipt': 'proc-acceptance-inbound.html',
    'purchase-result-notice-nonbid': 'purchase-pm-notice-nonbid.html',
    'purchase-return-exchange': 'return-exchange-management.html',
    'purchase-settlement': 'proc-use-approval.html',
    'purchase-sourcing': 'material-procurement-hub.html?tab=m4',
    'purchase-summary-report': 'purchase-summary-report.html',
    'purchase-supplier': 'material-procurement-hub.html?tab=m5',
    'purchase-supplier-pm': 'purchase-management-hub.html?tab=p8',
    'purchase-terminate-approval': 'purchase-pm-terminate.html',
    'purchase-under15-review': 'purchase-pm-under15.html',
    'receive': 'receipt-inbound.html',
    'retired-apply-main': 'retire-scrap-application.html',
    'retired-big-small-reuse': 'big-small-reuse.html',
    'retired-brand': 'retired-prototype-list.html?scene=brand',
    'retired-line': 'retired-prototype-list.html?scene=line',
    'retired-model': 'retired-prototype-list.html?scene=model',
    'retired-project': 'retired-prototype-list.html?scene=project',
    'retired-requisition': 'retired-prototype-list.html?scene=requisition',
    'retired-transfer': 'goods-transfer-out.html',
    'retired-wind': 'retired-prototype-list.html?scene=wind',
    'scan': 'scan-pick.html',
    'setting-department': 'system-prototype-list.html?scene=dept',
    'setting-login': 'index-portal-screen-alt.html',
    'setting-password': 'index-portal-screen-alt.html',
    'setting-permission': 'system-prototype-list.html?scene=post',
    'setting-profile': 'index-portal-screen-alt.html',
    'setting-security': 'index-portal-screen-alt.html',
    'setting-theme': 'index-portal-screen-alt.html',
    'setting-user': 'system-prototype-list.html?scene=user',
    'slot': 'slot-management.html',
    'stock': 'inventory-management.html',
    'system-client': 'system-prototype-list.html?scene=client',
    'system-codegen': 'system-prototype-list.html?scene=codegen',
    'system-department': 'system-prototype-list.html?scene=dept',
    'system-dict': 'system-prototype-list.html?scene=dict',
    'system-file': 'system-prototype-list.html?scene=file',
    'system-log': 'system-prototype-list.html?scene=notice',
    'system-menu': 'system-prototype-list.html?scene=menu',
    'system-notice': 'system-prototype-list.html?scene=notice',
    'system-params': 'system-prototype-list.html?scene=params',
    'system-position': 'system-prototype-list.html?scene=post',
    'system-role': 'system-prototype-list.html?scene=role',
    'system-user': 'system-prototype-list.html?scene=user',
    'task-approval': 'my-tasks-prototype-list.html?scene=todo',
    'task-cc': 'my-tasks-prototype-list.html?scene=cc',
    'task-center': 'my-tasks-prototype-list.html?scene=todo',
    'task-done': 'my-tasks-prototype-list.html?scene=done',
    'task-initiated': 'my-tasks-prototype-list.html?scene=initiated',
    'task-mine': 'my-tasks-prototype-list.html?scene=initiated',
    'task-todo': 'my-tasks-prototype-list.html?scene=todo',
    'task-track': 'my-tasks-prototype-list.html?scene=todo',
    'tool-api': 'system-prototype-list.html?scene=client',
    'tool-demo': 'demo-all-pages-interactive.html',
    'tool-template': 'devtools-prototype-list.html?scene=notFound404',
    'warehouse': 'warehouse.html',
    'warehouse-checkin': 'receipt-inbound.html',
    'warehouse-checkout': 'inventory-management.html',
    'warehouse-io-ledger': 'warehouse-io-ledger.html',
    'warehouse-stock-ledger': 'warehouse-stock-ledger.html',
    'warehouse-transfer': 'inventory-management.html',
  };

  const labelToFile = {
    '首页': 'index-portal-screen-alt.html',
    '应用大厅': 'index-portal-screen-alt.html',
    '集团驾驶舱': 'cockpit.html',
    '数据驾驶舱': 'cockpit.html',
    '省级驾驶舱': 'cockpit.html',
    '离线总演示': 'demo-all-pages-interactive.html',
    '驾驶舱': 'cockpit.html',
    '采购申请': 'procurement-application.html',
    '采购计划管理': 'purchase-plan-management.html',
    '采购信息台帐': 'purchase-plan-management.html',
    '订单/需求管理': 'order-demand-management.html',
    '订单需求管理': 'order-demand-management.html',
    '寻源管理': 'material-procurement-hub.html?tab=m4',
    '合同管理': 'contract-management.html',
    '合同信息管理': 'contract-management.html',
    '采购付款': 'material-procurement-hub.html?tab=m8',
    '退货换货管理': 'return-exchange-management.html',
    '货物质量验收': 'proc-quality-accept.html',
    '验收确认': 'proc-quality-accept.html#flow-warehouse',
    '物资采购信息管理': 'purchase-material-info-management.html',
    '采购计划': 'purchase-plan-management.html',
    '订单管理': 'order-demand-management.html',
    '驾驶舱入口': 'cockpit.html',
    '招投标管理': 'material-procurement-hub.html?tab=m7',
    '采购订单': 'order-demand-management.html',
    '采购合同': 'purchase-management-hub.html?tab=p8',
    '供应商管理': 'base-data-material-ledger.html?tab=supplier',
    '非招标零委资料审批': 'purchase-pm-nonbid.html',
    '非招标采委会资料审批': 'purchase-pm-nonbid.html',
    '采购计划审批单': 'purchase-pm-plan.html',
    '长协采购结果使用审批单': 'purchase-pm-longterm-result.html',
    '重新采购审批单': 'purchase-pm-repurchase.html',
    '本部采购文件审查纪要': 'purchase-pm-minutes.html',
    '招标零委会资料审批': 'purchase-pm-bid.html',
    '招标采委会资料审批': 'purchase-pm-bid.html',
    '终止采购审批': 'purchase-pm-terminate.html',
    '终止采购审批单': 'purchase-pm-terminate.html',
    '公司级集采计划审批': 'purchase-pm-group-plan.html',
    '公司级集采计划审批单': 'purchase-pm-group-plan.html',
    '15万以下采购结果审定(项目单位)': 'purchase-pm-under15.html',
    '本月度招标采购计划申报': 'purchase-pm-monthly-bid.html',
    '本部月度招标采购计划申报': 'purchase-pm-monthly-bid.html',
    '本月度非招标采购计划申报': 'purchase-pm-monthly-nonbid.html',
    '本部月度非招标采购计划申报': 'purchase-pm-monthly-nonbid.html',
    '采购项目审定结果通知(非招标)': 'purchase-pm-notice-nonbid.html',
    '基础数据维护': 'purchase-pm-data-maintain.html',
    '归档目录': 'purchase-pm-archive.html',
    '长协领用管理': 'purchase-pm-longterm-use.html',
    '到货验收': 'purchase-management-hub.html?tab=p9',
    '采购结算': 'purchase-management-hub.html?tab=p9',
    '承运商管理': 'carrier-management.html',
    '调度管理': 'logistics-contract.html',
    '物流合同': 'logistics-contract.html',
    '运单管理': 'logistics-tracking.html',
    '物流跟踪': 'logistics-tracking.html',
    '签收回执': 'logistics-tracking.html',
    '物流付款': 'logistics-payment.html',
    '货位管理': 'slot-management.html',
    '盘库管理': 'inventory-check.html',
    '库内保养': 'warehouse-maintenance.html',
    '收货入库': 'receipt-inbound.html',
    '出库管理': 'inventory-management.html',
    '调拨管理': 'inventory-management.html',
    '库存管理': 'inventory-management.html',
    '闲置物资': 'idle-materials.html',
    '仓库管理': 'warehouse.html',
    '物资目录': 'base-data-material-ledger.html',
    '价格库': 'base-data-material-ledger.html',
    '扫码领用': 'scan-pick.html',
    '物资台账': 'purchase-ledger.html?tab=material',
    '物资台帐': 'purchase-ledger.html?tab=material',
    '仓储管理': 'warehouse.html',
    '物流管理': 'carrier-management.html',
    '退役及报废申请': 'retire-scrap-application.html',
    '设备评估': 'equipment-evaluation.html',
    '以大代小&循环再利用': 'big-small-reuse.html',
    '以大代小循环再利用': 'big-small-reuse.html',
    '基础数据': 'base-data-material-ledger.html',
    '基础数据总览': 'base-data-material-ledger.html',
    '产品类别管理': 'base-data-material-ledger.html?tab=product',
    '物资类型': 'base-data-material-ledger.html?tab=product',
    '人员数据': 'base-data-material-ledger.html?tab=personnel',
    '公司部门数据': 'base-data-material-ledger.html?tab=department',
    '项目公司管理': 'base-data-material-ledger.html?tab=company',
    '场站管理': 'base-data-material-ledger.html?tab=station',
    '物资类别字典': 'base-data-material-ledger.html?tab=dict',
    '汇率税率配置': 'base-data-material-ledger.html?tab=rateTax',
    '编码规则管理': 'base-data-material-ledger.html?tab=codeRule',
    '基础数据-物资台账': 'base-data-material-ledger.html',
    '采购数据台账': 'purchase-ledger.html',
    '采购计划表': 'purchase-plan-table.html',
    '货物台账': 'purchase-ledger.html?tab=cargo',
    '采购汇总报表': 'purchase-summary-report.html',
    '验收入库': 'proc-acceptance-inbound.html',
    '领用申请审批': 'proc-use-approval.html',
    '销售合同管理': 'proc-sales-contract.html',
    '发货管理': 'proc-shipment.html',
    '项目公司验收': 'proc-quality-accept.html',
    '出入库记录': 'warehouse-io-ledger.html',
    '物流台账': 'logistics-ledger.html',
    '资产台账': 'asset-ledger.html',
    'OA单点集成': 'oa-flow-center.html?tab=sso',
    'OA流程样式': 'oa-flow-center.html?tab=style',
    'A4打印/PDF导出': 'oa-flow-center.html?tab=print',
    '流程退回/撤回': 'oa-flow-center.html?tab=return',
    '流程知会': 'oa-flow-center.html?tab=notify',
    '财务数据导出': 'oa-flow-center.html?tab=export',
    '绩效看板': 'performance-hub.html?tab=login',
    'KPI考核': 'performance-hub.html?tab=flow',
    '考核规则': 'performance-hub.html?tab=flow',
    '登录频次统计': 'performance-hub.html?tab=login',
    '流程频次统计': 'performance-hub.html?tab=flow',
    '招标公告': 'notice-prototype-list.html?scene=bid',
    '非招标公告': 'notice-prototype-list.html?scene=nonbid',
    '招标公示': 'notice-prototype-list.html?scene=bid',
    '公司公告': 'notice-hub.html?tab=nonbid',
    '制度公告': 'notice-hub.html?tab=nonbid',
    '系统公告': 'notice-hub.html?tab=nonbid',
    '培训公告': 'notice-hub.html?tab=nonbid',
    '运维公告': 'notice-hub.html?tab=nonbid',
    '业务总览': 'integrated-business-hub.html?tab=fin',
    '业务中心': 'procurement-application.html',
    '流程管理': 'integrated-business-hub.html?tab=flow',
    '协同平台': 'carrier-management.html',
    '财务管理': 'integrated-business-hub.html?tab=fin',
    '维修管理': 'repair-domestic-hub.html',
    '调剂管理': 'integrated-business-hub.html?tab=adj',
    '应急物资管理': 'integrated-business-hub.html?tab=emg',
    '标准规范': 'integrated-business-hub.html?tab=std',
    '业务流程设计': 'integrated-business-hub.html?tab=flow',
    '物资理赔': 'integrated-business-hub.html?tab=claim',
    '物资履历': 'base-data-material-ledger.html',
    '国产化替代': 'repair-domestic-hub.html?view=domestic',
    '专家管理': 'integrated-business-hub.html?tab=exp',
    '基础数据台账': 'base-data-material-ledger.html',
    '报表中心': 'subpage-template.html',
    '数据稽核': 'equipment-evaluation.html',
    '主数据维护': 'base-data-material-ledger.html',
    '数据质量': 'equipment-evaluation.html',
    '供应商数据': 'base-data-material-ledger.html?tab=supplier',
    '产品目录': 'data-code-fixed.html',
    '编码管理': 'data-code-fixed.html',
    '数据模型': 'equipment-evaluation.html',
    '决策分析支持': 'cockpit-analytics.html',
    '子页模板': 'subpage-template.html',
    '在线用户': 'devtools-prototype-list.html?scene=onlineUser',
    '租户管理': 'devtools-prototype-list.html?scene=tenant',
    '测试单表': 'devtools-prototype-list.html?scene=testForm',
    '测试树表': 'devtools-prototype-list.html?scene=testTree',
    '流程分类': 'devtools-prototype-list.html?scene=flowCategory',
    '请假申请': 'devtools-prototype-list.html?scene=leave',
    '租户套餐管理': 'devtools-prototype-list.html?scene=tenantPackage',
    '模型管理': 'devtools-prototype-list.html?scene=modelManage',
    '流程定义': 'devtools-prototype-list.html?scene=processDefine',
    '流程实例': 'devtools-prototype-list.html?scene=flowInstance',
    '待办任务': 'devtools-prototype-list.html?scene=pendingTask',
    '缓存监控': 'devtools-prototype-list.html?scene=cacheMonitor',
    'Admin监控': 'subpage-template.html',
    '表单管理': 'devtools-prototype-list.html?scene=formManage',
    '任务调度中心': 'subpage-template.html',
    'PLUS官网': 'subpage-template.html',
    '接口调试': 'subpage-template.html',
    '个人设置': 'index-portal-screen-alt.html',
    '安全设置': 'index-portal-screen-alt.html',
    '主题设置': 'index-portal-screen-alt.html',
    '登录': 'demo-login-placeholder.html',
    '密码管理': 'index-portal-screen-alt.html',
    '人员管理': 'system-prototype-list.html?scene=user',
    '公司部门管理': 'system-prototype-list.html?scene=dept',
    '权限管理': 'system-prototype-list.html?scene=post',
    '用户管理': 'system-prototype-list.html?scene=user',
    '角色权限': 'system-prototype-list.html?scene=role',
    '菜单管理': 'system-prototype-list.html?scene=menu',
    '角色管理': 'system-prototype-list.html?scene=role',
    '代码生成': 'system-prototype-list.html?scene=codegen',
    '部门管理': 'system-prototype-list.html?scene=dept',
    '岗位管理': 'system-prototype-list.html?scene=post',
    '字典管理': 'system-prototype-list.html?scene=dict',
    '参数设置': 'system-prototype-list.html?scene=params',
    '通知公告': 'system-prototype-list.html?scene=notice',
    '文件管理': 'system-prototype-list.html?scene=file',
    '客户端管理': 'system-prototype-list.html?scene=client',
    '系统日志': 'system-prototype-list.html?scene=notice',
    '任务中心': 'my-tasks-prototype-list.html?scene=todo',
    '待审批': 'my-tasks-prototype-list.html?scene=todo',
    '任务跟踪': 'my-tasks-prototype-list.html?scene=todo',
    '我发起的': 'my-tasks-prototype-list.html?scene=initiated',
    '我的待办': 'my-tasks-prototype-list.html?scene=todo',
    '我的已办': 'my-tasks-prototype-list.html?scene=done',
    '我的抄送': 'my-tasks-prototype-list.html?scene=cc',
    '个人资产': 'assets-personal.html',
    '部门资产': 'assets-department.html',
    '公司资产': 'assets-company.html',
    '资产交接': 'asset-transfer-management.html',
    '性质转变': 'asset-nature-change-management.html',
    '盘点管理': 'asset-inventory-management.html',
    '价值管理': 'asset-value-management.html',
    '资产性质转变': 'asset-nature-change-management.html',
  };

  const pagesList = ref([]);
  const fileToIndex = reactive({});
  const currentIndex = ref(0);
  const currentTitle = ref('当前页面：加载中…');
  const isSidebarCollapsed = ref(true);
  const isLoading = ref(false);
  const htmlExpandedCache = reactive({});

  const groupedPages = computed(() => {
    const groups = {};
    pagesList.value.forEach((item) => {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group].push(item);
    });
    return groups;
  });

  const currentPage = computed(() => pagesList.value[currentIndex.value] || null);

  function normalizeLabel(s) {
    return (s || '')
      .replace(/\s+/g, '')
      .replace(/[|｜]/g, '')
      .replace(/&amp;|＆/gi, '&');
  }

  function buildList() {
    pagesList.value = [];
    Object.keys(fileToIndex).forEach((key) => delete fileToIndex[key]);
    meta.forEach((m) => {
      pagesList.value.push(m);
      fileToIndex[m.file] = pagesList.value.length - 1;
    });
  }

  function demoStripPageSubForLookup(href) {
    const h = String(href || '').split('#')[0].trim();
    const qi = h.indexOf('?');
    if (qi < 0) return h;
    try {
      const sp = new URLSearchParams(h.slice(qi + 1));
      if (!sp.has('pageSub')) return h;
      sp.delete('pageSub');
      const rest = sp.toString();
      return rest ? h.slice(0, qi + 1) + rest : h.slice(0, qi);
    } catch (e0) {
      return h;
    }
  }

  function demoLookupCandidates(key) {
    const candidates = [];
    const seen = {};
    function add(x) {
      if (x && !seen[x]) {
        seen[x] = true;
        candidates.push(x);
      }
    }
    add(key);
    const noPs = demoStripPageSubForLookup(key);
    if (noPs !== key) add(noPs);
    const baseOnly = key.split('?')[0];
    if (!(key.indexOf('view=portal') >= 0 && baseOnly === 'index.html')) {
      add(baseOnly);
    }
    const slash = key.lastIndexOf('/');
    if (slash >= 0) {
      add(key.slice(slash + 1));
      const q = key.indexOf('?');
      if (q > slash) add(key.slice(slash + 1, q));
    }
    return candidates;
  }

  function demoAppendPageSubBeforeHash(href, label) {
    if (!href || !label) return href;
    let s = String(href);
    if (s.indexOf('pageSub=') >= 0) return href;
    const hashIdx = s.indexOf('#');
    const base = hashIdx >= 0 ? s.slice(0, hashIdx) : s;
    const frag = hashIdx >= 0 ? s.slice(hashIdx) : '';
    const sep = base.indexOf('?') >= 0 ? '&' : '?';
    return base + sep + 'pageSub=' + encodeURIComponent(String(label).trim()) + frag;
  }

  function navigateByFile(file) {
    if (!file) return false;
    const full = String(file).trim();
    const raw = full.split('#')[0].trim();
    const qPos = raw.indexOf('?');
    if (qPos >= 0) {
      try {
        const base = raw.slice(0, qPos);
        const sp = new URLSearchParams(raw.slice(qPos + 1));
        const sc = (sp.get('scope') || '').trim();
        if (sc) sessionStorage.setItem('cockpitScope', sc);
        const scene = (sp.get('scene') || '').trim();
        if (scene) {
          sessionStorage.setItem('demoScene', scene);
        }
        const tab = (sp.get('tab') || '').trim();
        if (tab) {
          sessionStorage.setItem('demoTab', tab);
        }
        const ps = sp.get('pageSub');
        if (ps !== null && ps !== undefined) sessionStorage.setItem('pageSub', ps);
      } catch (eNav) {}
    }
    const candidates = demoLookupCandidates(raw);
    for (let ci = 0; ci < candidates.length; ci++) {
      const f = candidates[ci];
      if (f && fileToIndex.hasOwnProperty(f)) {
        switchTo(fileToIndex[f], full);
        return true;
      }
    }
    return false;
  }

  function expandDemoInline(html) {
    const assets = typeof __DEMO_INLINE_ASSETS__ !== 'undefined' ? __DEMO_INLINE_ASSETS__ : null;
    if (!html || !assets || !assets.length) return html;
    return html.replace(/__DEMO_INLINE_DATA_(\d+)__/g, (_, i) => {
      const n = parseInt(i, 10);
      return assets[n] !== undefined ? assets[n] : '';
    });
  }

  function getExpandedHtmlForFile(file, raw) {
    if (htmlExpandedCache[file]) return htmlExpandedCache[file];
    const h = expandDemoInline(raw);
    htmlExpandedCache[file] = h;
    return h;
  }

  function switchTo(index, optFullHref) {
    if (index < 0 || index >= pagesList.value.length) return;
    const item = pagesList.value[index];
    currentIndex.value = index;
    const extSrc = optFullHref && String(optFullHref).trim() ? String(optFullHref).trim() : item.file;
    currentTitle.value = '当前页面：' + extSrc.replace(/\.html.*/i, '');
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
    window.__demoOpenPage && window.__demoOpenPage(extSrc);
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  }

  function goPrev() {
    const next = currentIndex.value - 1;
    if (next < 0) next = pagesList.value.length - 1;
    switchTo(next);
  }

  function goNext() {
    const next = currentIndex.value + 1;
    if (next >= pagesList.value.length) next = 0;
    switchTo(next);
  }

  function openNewTab() {
    const item = pagesList.value[currentIndex.value];
    if (!item) return;
    const url = item.file;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function resolveInitialDemoIndex() {
    const preferred = [
      'index-portal-screen-alt.html',
      'demo-login-placeholder.html',
      'index.html?view=portal',
      'index.html',
      'cockpit.html',
    ];
    for (let i = 0; i < preferred.length; i++) {
      const f = preferred[i];
      if (fileToIndex.hasOwnProperty(f)) return fileToIndex[f];
    }
    for (let j = 0; j < pagesList.value.length; j++) {
      const pf = String((pagesList.value[j] && pagesList.value[j].file) || '').toLowerCase();
      if (!pf) continue;
      if (pf === 'purchase-ledger.html' || pf.indexOf('material-ledger') >= 0) continue;
      return j;
    }
    return 0;
  }

  onMounted(() => {
    buildList();
    const initialDemoIndex = resolveInitialDemoIndex();
    switchTo(initialDemoIndex);
  });

  return {
    meta,
    actionToFile,
    labelToFile,
    pagesList,
    currentIndex,
    currentTitle,
    currentPage,
    isSidebarCollapsed,
    isLoading,
    groupedPages,
    switchTo,
    toggleSidebar,
    goPrev,
    goNext,
    openNewTab,
    navigateByFile,
  };
}
