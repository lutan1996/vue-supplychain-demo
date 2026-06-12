
(function(){
      var PAGE_SIZE = 10;
      function esc(v){ return String(v == null ? "" : v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
      function q(v){ return encodeURIComponent(String(v == null ? "" : v)); }

      var M10_INBOUND_FALLBACK = [
        { acceptNo: "RK-YC-20260428-01", contractNo: "KJ-2026-001", supplier: "远景能源", name: "变流器模块", spec: "V2.0", warehouse: "公司中心库 / A区-01-01", qty: "100", materialType: "生产类" },
        { acceptNo: "RK-YC-20260429-02", contractNo: "KJ-2026-001", supplier: "远景能源", name: "变流器模块", spec: "V2.0", warehouse: "公司中心库 / A区-01-01", qty: "100", materialType: "生产类" },
        { acceptNo: "RK-2026-014", contractNo: "KJ-2026-010", supplier: "华驰电力", name: "支架组件", spec: "XH-105", warehouse: "公司中心库 / B区-02", qty: "60", materialType: "生产类" }
      ];
      function formatM10InboundLabel(o) {
        var w = o.warehouse || "";
        return (o.acceptNo || "") + " · " + (o.name || "") + (w ? "（" + w + "）" : "");
      }
      function getM10InboundOptions() {
        try {
          var raw = localStorage.getItem("map_m10_inbound_list_v1");
          var arr = raw ? JSON.parse(raw) : null;
          if (Array.isArray(arr) && arr.length) return arr;
        } catch (e) {}
        return M10_INBOUND_FALLBACK.slice();
      }

      var tabs = {
        ledger: {
          name: "物资台账",
          search: [["name","产品名称"],["dept","领用部门"]],
          columns: [
            ["name","选择物资"],
            ["code","物资类型编码"],
            ["contractNo","合同编号"],
            ["purchaseDept","采购部门"],
            ["spec","规格型号"],
            ["category","物资类别"],
            ["unitPriceExcl","采购单价（不含税）"],
            ["stockQty","库存数量"],
            ["dept","领用部门"],
            ["keeper","领用人"],
            ["location","存放地点"],
            ["fixedCode","固定资产编码"],
            ["supplier","供应商"]
          ],
          rows: Array.from({length:14}).map(function(_,i){
            var categoryList = ["办公类","生产类","销售类"];
            var statusList = ["在库","在用","维修中","已转固","已销售"];
            var shipList = ["未发货","已发货","已签收"];
            var nameList = ["智能风机控制器","高压配电柜","工业级交换机","移动式检修电源","机舱温控模块","主控信号采集单元","防雷监测终端","变流器散热组件","箱变状态采集器","场站通信网关","功率调节执行器","电能质量分析仪","远程维护工控机","继电保护测试仪"];
            var origin = 80000 + i*6500;
            var net = Math.max(18000, origin - (i+1)*3200);
            var depList = ["年限平均法","双倍余额递减法","工作量法"];
            var checkResultList = ["账实一致","盘盈1台","盘亏1台","待复核"];
            var reqTot = 2 + (i % 8);
            var baseStock = 12 + (i % 11);
            return {
              code:"WZ-SW-20260420-"+String(i+1).padStart(4,"0"),
              name:nameList[i%nameList.length],
              spec:i%2?"V3.1":"V2.0",
              category:categoryList[i%3],
              purchaseDept:i%2?"电控所":"经营发展中心",
              unitPriceExcl:(18500 + i * 920).toLocaleString("zh-CN",{minimumFractionDigits:2,maximumFractionDigits:2}),
              requisitionTotal:reqTot,
              stockQty:Math.max(0, baseStock - reqTot + (i % 3)),
              status:statusList[i%5],
              invoiceStatus:i%4===0?"已开票":"未开票",
              shipStatus:shipList[i%3],
              invoiceTime:i%4===0?"2026-04-"+String((i%20)+1).padStart(2,"0"):"",
              dept:i%2?"电控所":"经营发展中心",
              keeper:i%2?"成明锴":"宋中波",
              location:"中心库"+(i%3+1)+"-0"+(i%5+1),
              fixedCode:"FA-2026-"+String(i+1).padStart(4,"0"),
              origin:origin,
              net:net,
              depreciation:depList[i%3],
              inDate:"2026-"+String((i%6)+1).padStart(2,"0")+"-"+String((i%20)+1).padStart(2,"0"),
              contractNo:"HT-2026-"+String(100+i).padStart(3,"0"),
              supplier:["中车电气","南瑞继保","许继电气","国电南自"][i%4],
              lastCheckTime:"2026-"+String((i%6)+1).padStart(2,"0")+"-"+String((i%25)+1).padStart(2,"0")+" 10:"+String((i%6)*10).padStart(2,"0"),
              lastCheckResult:checkResultList[i%4],
              receiveMode: i % 2 === 0 ? "engineering" : "project",
              from_dept:"",
              to_dept:"",
              handoff_status:"",
              handoff_at:"",
              batch_no:""
            }
          })
        },
        requisition: {
          name: "领用记录",
          search: [["reqNo","领用单号"],["name","选择物资"]],
          columns: [
            ["reqNo","领用单号"],
            ["contractNo","合同编号"],
            ["purchaseDept","采购部门"],
            ["name","选择物资"],
            ["spec","规格型号"],
            ["category","物资类别"],
            ["unitPriceExcl","采购单价（不含税）"],
            ["unitPriceIncl","采购单价（含税）"],
            ["receiveQty","领用数量"],
            ["stockQty","库存数量"],
            ["code","物资编码"],
            ["reqDate","领用日期"],
            ["applicant","领用人"],
            ["applyDept","领用部门"],
            ["status","领用状态"],
            ["remark","备注"]
          ],
          rows: Array.from({length:10}).map(function(_,i){
            var nameList = ["智能风机控制器","高压配电柜","工业级交换机","变流器散热组件","机舱温控模块"];
            var st = ["领用中","已领用"][i % 2];
            var unitPriceExclNum = 18500 + i * 920;
            var requisitionTotal = 2 + (i % 8);
            var stockQty = Math.max(0, 12 + (i % 11) - requisitionTotal + (i % 3));
            return {
              reqNo:"LY-2026-"+String(401+i).padStart(4,"0"),
              code:"WZ-SW-20260420-"+String((i%14)+1).padStart(4,"0"),
              contractNo:"HT-2026-"+String(100+(i%14)).padStart(3,"0"),
              purchaseDept:i%2?"电控所":"经营发展中心",
              name:nameList[i%nameList.length],
              spec:i%2?"V3.1":"V2.0",
              category:["生产类","办公类","销售类"][i%3],
              unitPriceExcl:unitPriceExclNum.toLocaleString("zh-CN",{minimumFractionDigits:2,maximumFractionDigits:2}),
              unitPriceIncl:(unitPriceExclNum * 1.13).toLocaleString("zh-CN",{minimumFractionDigits:2,maximumFractionDigits:2}),
              requisitionTotal:requisitionTotal,
              receiveQty:Math.max(1, requisitionTotal - (i % 2)),
              stockQty:stockQty,
              qty:2+(i%5),
              reqDate:"2026-04-"+String((i%25)+1).padStart(2,"0"),
              applicant:["王卿明","李哲","宋中波"][i%3],
              applyDept:["电控所","机械所","经营发展中心"][i%3],
              status:st,
              remark:st==="领用中"?"领用处理中":""
            }
          })
        }
      };

      function buildLedgerMaterialNameOptionsHtml(selectedName) {
        var ledgerRows = tabs.ledger.rows || [];
        var inboundDemoNames = ["变流器模块","电缆","汇流箱","IGBT驱动板","支架组件","预制连接子"];
        var nameOptSet = {};
        inboundDemoNames.forEach(function(n){ nameOptSet[n] = 1; });
        ledgerRows.forEach(function(r){
          var n = String(r.name || "").trim();
          if (n) nameOptSet[n] = 1;
        });
        var ex = String(selectedName || "").trim();
        if (ex) nameOptSet[ex] = 1;
        var nameOptions = Object.keys(nameOptSet).sort(function(a,b){ return a.localeCompare(b,"zh"); });
        return '<option value="">请选择</option>' + nameOptions.map(function(n){
          return '<option value="'+esc(n)+'">'+esc(n)+'</option>';
        }).join("");
      }

      var state = {
        current: "ledger",
        sort: { ledger: { key: "", dir: "asc" }, requisition: { key: "", dir: "asc" } },
        filters: { ledger: {}, requisition: {} },
        page: { ledger: 1, requisition: 1 }
      };

      (function initTabFromQuery(){
        try {
          var m = location.search.match(/[?&]tab=([^&]+)/);
          if (!m) return;
          var t = decodeURIComponent(m[1]);
          if (t === "requisition") state.current = "requisition";
          else if (t === "ledger" || t === "material") state.current = "ledger";
        } catch (e) {}
      })();

      function jump(type,row){
        var code = row.code || row.assetNo || "";
        var name = row.name || "";
        var query = "keyword="+q(code || name)+"&code="+q(code)+"&name="+q(name);
        if(type==="in") return "purchase-plan-management.html?from=material-in&"+query;
        if(type==="transport") return "logistics-ledger.html?from=material-transport&"+query;
        if(type==="manage") return "proc-use-approval.html?from=material-manage&"+query;
        if(type==="store") return "warehouse-stock-ledger.html?from=material-store&"+query;
        return "goods-transfer-out.html?from=material-out&"+query;
      }
      function stageIndexByStatus(status){
        if(status==="在库") return 1;      // 进 -> 存
        if(status==="在用") return 2;      // 到管
        if(status==="维修中") return 2;    // 到管
        if(status==="已转固") return 4;    // 到出
        if(status==="已销售") return 4;    // 到出
        return 0; // 默认仅进
      }
      function stageData(row){
        return [
          { key:"in", label:"采购入库", desc:"查看该物资采购/入库明细记录", href:jump("in",row) },
          { key:"store", label:"仓储/在库/台账", desc:"查看该物资库存、货位及盘点记录", href:jump("store",row) },
          { key:"manage", label:"领用/生产/内部流转", desc:"查看领用、生产及内部流转记录", href:jump("manage",row) },
          { key:"transport", label:"销售发货/直发过程", desc:"查看销售发货或直发过程记录", href:jump("transport",row) },
          { key:"out", label:"出库/处置/回收/维修/报废/再入库", desc:"查看出库、处置与全生命周期闭环记录", href:jump("out",row) }
        ];
      }
      function ledgerReceiveMode(row){
        var m = row && row.receiveMode;
        if (m === "project" || m === "直发项目" || m === "直发项目公司") return "project";
        return "engineering";
      }
      function receiveModeHint(row){
        return ledgerReceiveMode(row) === "project"
          ? "供应商直发项目公司（工程技术公司不接收实物，系统留痕）"
          : "供应商发货至工程技术公司（入公司实物库）";
      }
      function parseMoneyExcl(row){
        var s = row && row.unitPriceExcl != null ? String(row.unitPriceExcl) : "0";
        var n = parseFloat(s.replace(/,/g, "")) || 0;
        return n;
      }
      function stageDemoIds(row){
        var code = String(row.code || row.assetNo || "WZ-0000");
        var tail = (code.match(/(\d{4})$/) || ["", "1"])[1];
        var n = parseInt(tail, 10) || 1;
        var pad3 = function(x){ return String(x).padStart(3, "0"); };
        return {
          frameworkNo: "KJ-2026-" + pad3(80 + (n % 120)),
          subContractNo: "ZX-2026-" + pad3(50 + (n % 150)),
          acceptNo: "YS-RK-" + code.replace(/^WZ-SW-/, ""),
          inboundNo: "RK-" + code.replace(/^WZ-SW-/, ""),
          projRecvNo: "XM-QR-" + code.replace(/^WZ-SW-/, ""),
          virtualDeductNo: "XN-KC-" + code.replace(/^WZ-SW-/, ""),
          virtualSyncAt: (row.inDate || "2026-04-20") + " 14:30",
          propertyTag: "产权：" + (row.purchaseDept || "经营发展中心") + "统筹 / 项目现场使用权",
          salesContractNo: "XS-" + String(row.contractNo || "").replace(/^HT-/, ""),
          customerName: row.dept || "项目公司/风电场",
          orderNo: "DD-XM-2026-" + pad3(300 + n),
          shipSlipNo: "FH-GC-2026-" + pad3(400 + n),
          logisticsCo: ["中远物流","德邦供应链","顺丰大件"][n % 3],
          trackNo: "WL" + String(8800000 + n * 17),
          shipAt: (row.inDate || "2026-04-18") + " 09:00",
          eta: (row.inDate || "2026-04-22") + " 18:00",
          directShipNo: "ZF-GYS-" + code.replace(/^WZ-SW-/, ""),
          projRecvAt: (row.inDate || "2026-04-21") + " 16:20",
          recycleNo: "HS-OLD-" + code.replace(/^WZ-SW-/, ""),
          recycleDate: row.inDate || "2026-04-25",
          handoverMemo: "旧件返回交接 · " + (row.keeper || "经办人") + " 签收",
          repairApplyNo: "WX-SQ-" + pad3(600 + n),
          repairDoneAt: row.status === "维修中" ? "—" : ("2026-05-0" + (1 + (n % 5)) + " 11:00"),
          reinboundNo: "RK-WX-" + code.replace(/^WZ-SW-/, ""),
          qualityRecheck: row.status === "维修中" ? "复检中" : "合格",
          scrapApproveNo: "BF-SP-2026-" + pad3(700 + n),
          scrapResidual: "残值处置 · 已登记",
          virtualTraceNo: "XN-LH-" + code.replace(/^WZ-SW-/, ""),
          titleTransferAt: (row.inDate || "2026-04-26") + " 10:00",
          financeFlag: row.invoiceStatus === "已开票" ? "已开票 / 可核算" : "待开票 / 暂估",
          dualAcceptNo: "YS-SF-" + code.replace(/^WZ-SW-/, ""),
          shipConfirmer: row.keeper || "宋中波"
        };
      }
      function acceptanceResultLabel(row){
        var sh = String(row.shipStatus || "");
        if (sh === "已签收") return "通过";
        if (sh === "已发货") return "待联合验收";
        return "待到货";
      }
      function acceptancePassFail(row){
        var sh = String(row.shipStatus || "");
        if (sh === "已签收") return "通过";
        if (sh === "已发货") return "不通过（待验收）";
        return "不通过（未到货）";
      }
      function handoffFlowState(row){
        var h = String(row.handoff_status || "").trim();
        if (h && h.indexOf("待") >= 0) return "待签收";
        if (row.batch_no || h) return "已签收";
        return "已签收";
      }
      function requisitionsForLedgerRow(row){
        var c = String(row.code || row.assetNo || "");
        return (tabs.requisition && tabs.requisition.rows || []).filter(function(r){
          return String(r.code || "") === c;
        });
      }
      function P(html){
        return '<p class="stage-prose">' + html + "</p>";
      }
      function stageNarrativeHtml(row, key){
        var isProj = ledgerReceiveMode(row) === "project";
        var d = stageDemoIds(row);
        var excl = parseMoneyExcl(row);
        var ratePct = 13;
        var incl = excl * (1 + ratePct / 100);
        var inclStr = incl.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        var stockN = Number(row.stockQty) || 0;
        var reqTot = Number(row.requisitionTotal) || 0;
        var purchaseQty = Math.max(stockN + reqTot, stockN || 1);
        var totalStr = (excl * purchaseQty * (1 + ratePct / 100)).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        var reqs = requisitionsForLedgerRow(row);
        var cat = String(row.category || "");
        var q0 = reqs[0];
        var batchNo = row.batch_no || (row.handoff_at ? "HB-" + String(row.code || "").slice(-4) : "—");
        var flowSt = handoffFlowState(row);

        if (key === "in") {
          if (!isProj) {
            return (
              P("<strong>【采购入库】</strong>")
              + P('该批物资由 <strong>' + esc(row.purchaseDept || "—") + "</strong> 牵头采购并入库，入库时间为 <strong>" + esc(row.inDate || "—") + "</strong>。入库物资为 <strong>" + esc(row.name || "—") + "</strong>（编码 <strong>" + esc(row.code || "—") + "</strong>，规格 <strong>" + esc(row.spec || "—") + "</strong>，类别 <strong>" + esc(row.category || "—") + "</strong>），数量 <strong>" + esc(purchaseQty) + "</strong>，供应商 <strong>" + esc(row.supplier || "—") + "</strong>。")
              + P('入库与合同关联信息为：框架协议号 <strong>' + esc(d.frameworkNo) + "</strong>、子合同号 <strong>" + esc(d.subContractNo) + "</strong>、采购合同编号 <strong>" + esc(row.contractNo || "—") + "</strong>；验收单号 <strong>" + esc(d.acceptNo) + "</strong>，验收结果 <strong>" + esc(acceptanceResultLabel(row)) + "</strong>。")
              + P('本批次形成实物入库，入库单号 <strong>' + esc(d.inboundNo) + "</strong>，货位/库位为 <strong>" + esc(row.location || "—") + "</strong>，归属工程技术公司实物库。")
            );
          }
          return (
            P("<strong>【采购入库】</strong>")
            + P('该批物资由 <strong>' + esc(row.purchaseDept || "—") + "</strong> 发起采购，物资为 <strong>" + esc(row.name || "—") + "</strong>（编码 <strong>" + esc(row.code || "—") + "</strong>，规格 <strong>" + esc(row.spec || "—") + "</strong>），数量 <strong>" + esc(purchaseQty) + "</strong>，供应商 <strong>" + esc(row.supplier || "—") + "</strong>。")
            + P('合同关联信息为：框架协议号 <strong>' + esc(d.frameworkNo) + "</strong>、子合同号 <strong>" + esc(d.subContractNo) + "</strong>、采购合同编号 <strong>" + esc(row.contractNo || "—") + "</strong>；验收单号 <strong>" + esc(d.acceptNo) + "</strong>，验收结果 <strong>" + esc(acceptanceResultLabel(row)) + "</strong>。")
            + P('该批次为供应商直发项目现场，工程技术公司不接收实物库位；项目公司收货确认单号 <strong>' + esc(d.projRecvNo) + "</strong>，工程技术公司同步虚拟扣减记录 <strong>" + esc(d.virtualDeductNo) + "</strong>（同步时间 <strong>" + esc(d.virtualSyncAt) + "</strong>）。")
          );
        }
        if (key === "store") {
          if (!isProj) {
            return (
              P("<strong>【仓储/在库/台账】</strong>")
              + P('当前在库物资为 <strong>' + esc(row.name || "—") + "</strong>（编码 <strong>" + esc(row.code || "—") + "</strong>，规格 <strong>" + esc(row.spec || "—") + "</strong>，类别 <strong>" + esc(row.category || "—") + "</strong>），库存数量 <strong>" + esc(row.stockQty != null ? row.stockQty : "—") + "</strong>。")
              + P('库位为 <strong>' + esc(row.location || "—") + "</strong>，保管部门为 <strong>" + esc(row.dept || "—") + "</strong>，保管人为 <strong>" + esc(row.keeper || "—") + "</strong>；盘点时间 <strong>" + esc(row.lastCheckTime || "—") + "</strong>，盘点结果 <strong>" + esc(row.lastCheckResult || "—") + "</strong>。")
              + P("该库存口径对应工程技术公司实物库。")
            );
          }
          return (
            P("<strong>【仓储/在库/台账】</strong>")
            + P('该物资为直发项目现场，工程技术公司侧保留虚拟库存口径：物资编码 <strong>' + esc(row.code || "—") + "</strong>，物资名称 <strong>" + esc(row.name || "—") + "</strong>，规格 <strong>" + esc(row.spec || "—") + "</strong>，类别 <strong>" + esc(row.category || "—") + "</strong>，同步库存数量 <strong>" + esc(row.stockQty != null ? row.stockQty : "—") + "</strong>。")
            + P('留痕信息为：同步扣减单号 <strong>' + esc(d.virtualDeductNo) + "</strong>，同步时间 <strong>" + esc(d.virtualSyncAt) + "</strong>，产权归属标记 <strong>" + esc(d.propertyTag) + "</strong>。")
            + P("项目公司现场实物库由项目公司自行管理。")
          );
        }
        if (key === "manage") {
          if (isProj) {
            return (
              P("<strong>【领用/生产/内部流转】</strong>")
              + P('该物资为直发项目现场路径，工程技术公司侧无内部领用/流转单据。')
              + P('现场使用与安装由项目公司执行，系统仅保留合同与留痕关联信息。')
            );
          }
          var reqLine = "";
          if (q0) {
            reqLine =
              "该物资已发生领用流转：领用单号 <strong>" + esc(q0.reqNo || "—") +
              "</strong>，领用部门 <strong>" + esc(q0.applyDept || "—") +
              "</strong>，领用人 <strong>" + esc(q0.applicant || "—") +
              "</strong>，领用数量 <strong>" + esc(q0.receiveQty != null ? q0.receiveQty : "—") +
              "</strong>，领用时间 <strong>" + esc(q0.reqDate || "—") +
              "</strong>，领用事由 <strong>" + esc(q0.remark || "—") +
              "</strong>，审批状态 <strong>" + esc(q0.status || "—") +
              "</strong>。部门间流转批次号 <strong>" + esc(batchNo) +
              "</strong>，流转状态 <strong>" + esc(flowSt) + "</strong>。";
          } else {
            reqLine =
              "该物资当前未匹配到同编码领用明细，台账口径显示领用部门 <strong>" + esc(row.dept || "—") +
              "</strong>，领用人 <strong>" + esc(row.keeper || "—") +
              "</strong>，流转批次号 <strong>" + esc(batchNo) +
              "</strong>，流转状态 <strong>" + esc(flowSt) + "</strong>。";
          }
          var extra = "";
          if (cat === "生产类") {
            extra = P("生产类路径：生产任务单号 <strong>" + esc("SC-RW-" + String(row.code || "").slice(-4)) + "</strong>，生产完成后回库单号 <strong>" + esc("RK-SC-" + String(row.code || "").slice(-4)) + "</strong>。");
          } else if (cat === "销售类") {
            extra = P("销售类路径：项目订单号 <strong>" + esc(d.orderNo) + "</strong>，订单确认时间 <strong>" + esc((row.inDate || "—") + " 15:00") + "</strong>，销售合同编号 <strong>" + esc(d.salesContractNo) + "</strong>，审批结果 <strong>" + esc(row.status === "已销售" ? "通过" : "不通过") + "</strong>。");
          } else {
            extra = P("办公类路径：固定资产编号 <strong>" + esc(row.fixedCode || "—") + "</strong>，入账时间 <strong>" + esc(row.inDate || "—") + "</strong>，使用部门 <strong>" + esc(row.dept || "—") + "</strong>。");
          }
          return P("<strong>【领用/生产/内部流转】</strong>") + P(reqLine) + extra;
        }
        if (key === "transport") {
          if (!isProj) {
            return (
              P("<strong>【销售发货/直发过程】</strong>")
              + P('该物资进入销售发货环节：销售合同编号 <strong>' + esc(d.salesContractNo) + "</strong>，客户 <strong>" + esc(d.customerName) + "</strong>，订单号 <strong>" + esc(d.orderNo) + "</strong>，发货单号 <strong>" + esc(d.shipSlipNo) + "</strong>。")
              + P('物流承运为 <strong>' + esc(d.logisticsCo) + "</strong>，物流单号 <strong>" + esc(d.trackNo) + "</strong>，发货时间 <strong>" + esc(d.shipAt) + "</strong>，预计到货 <strong>" + esc(d.eta) + "</strong>。工程技术公司发货确认人 <strong>" + esc(d.shipConfirmer) + "</strong>，双方验收单号 <strong>" + esc(d.dualAcceptNo) + "</strong>，验收结果 <strong>" + esc(acceptancePassFail(row)) + "</strong>。")
            );
          }
          return (
            P("<strong>【销售发货/直发过程】</strong>")
            + P('该物资走直发项目现场：供应商直发单号 <strong>' + esc(d.directShipNo) + "</strong>，项目公司收货确认时间 <strong>" + esc(d.projRecvAt) + "</strong>，验收结果 <strong>" + esc(acceptancePassFail(row)) + "</strong>。")
            + P('关联销售信息为：销售合同编号 <strong>' + esc(d.salesContractNo) + "</strong>，客户 <strong>" + esc(d.customerName) + "</strong>，订单号 <strong>" + esc(d.orderNo) + "</strong>。该路径下工程技术公司无发货单与承运物流节点。")
          );
        }
        var stOut = String(row.status || "");
        var canRepair = stOut === "维修中" || stOut === "在库" || stOut === "在用";
        var h5 = P("<strong>【出库/处置/回收/维修/报废/再入库】</strong>")
          + P('旧物回收与维修链路信息为：回收单号 <strong>' + esc(d.recycleNo) + "</strong>，回收日期 <strong>" + esc(d.recycleDate) + "</strong>，交接记录 <strong>" + esc(d.handoverMemo) + "</strong>，维修申请单号 <strong>" + esc(d.repairApplyNo) + "</strong>，维修方式 <strong>" + esc(row.status === "维修中" ? "内部" : "内部/外部") + "</strong>，维修完成时间 <strong>" + esc(d.repairDoneAt) + "</strong>，维修后入库单号 <strong>" + esc(d.reinboundNo) + "</strong>，质量复检结果 <strong>" + esc(d.qualityRecheck) + "</strong>。");
        if (canRepair) {
          h5 += P("处置结论为可维修，维修后已重新入库，可再次领用或销售。");
        } else {
          h5 += P("处置结论为不可维修，报废审批单号 <strong>" + esc(d.scrapApproveNo) + "</strong>，报废残值处理记录 <strong>" + esc(d.scrapResidual) + "</strong>。");
        }
        h5 += P('项目公司入库环节留痕为：工程技术公司虚拟库单号 <strong>' + esc(d.virtualTraceNo) + "</strong>，产权转移确认时间 <strong>" + esc(d.titleTransferAt) + "</strong>，财务核算标记 <strong>" + esc(d.financeFlag) + "</strong>。项目公司实物库由项目公司自行管理。");
        h5 += P("<strong>【全流程闭环汇总】</strong>");
        h5 += P("报表侧关注采购率、到货及时率、库存周转率、维修率、报废率等指标，并汇总采购计划、订单需求、采购台账、货物台账、质量验收等关键信息。");
        h5 += P("当前物资可按合同号 <strong>" + esc(row.contractNo || "—") + "</strong>、物资编码 <strong>" + esc(row.code || "—") + "</strong>、批次号 <strong>" + esc(batchNo) + "</strong>进行全流程追溯。");
        return h5;
      }

      function getRows(){
        var c = state.current, cfg = tabs[c], fs = state.filters[c], st = state.sort[c];
        if (c === "ledger") applyInvoiceUpdates(cfg.rows);
        if (c === "ledger" && window.DemoCrossDeptHandoff) {
          DemoCrossDeptHandoff.applyHandoffToMaterialRows(cfg.rows);
        }
        var rows = cfg.rows.filter(function(r){
          if(c==="ledger" && fs.category && String(r.category||"") !== String(fs.category)) return false;
          if(c==="ledger" && fs.invoiceStatus && String(r.invoiceStatus||"") !== String(fs.invoiceStatus)) return false;
          if(c==="ledger" && fs.shipStatus && String(r.shipStatus||"") !== String(fs.shipStatus)) return false;
          if(c==="requisition" && fs.status && String(r.status||"") !== String(fs.status)) return false;
          return cfg.search.every(function(s){
            var k=s[0],v=String(fs[k]||"").trim();
        if(!v) return true;
            return String(r[k]==null?"":r[k]).indexOf(v)>=0;
      });
    });
        if(st.key){
          rows = rows.slice().sort(function(a,b){
            var av = a[st.key], bv = b[st.key];
            if(av==null) av=""; if(bv==null) bv="";
            var na = Number(av), nb = Number(bv);
            var cmp = (!isNaN(na)&&!isNaN(nb)) ? (na-nb) : String(av).localeCompare(String(bv),"zh");
            return st.dir==="asc" ? cmp : -cmp;
          });
        }
        return rows;
      }

      function renderTabs(){
        var el = document.getElementById("tabs");
        if (Object.keys(tabs).length <= 1) {
          el.innerHTML = "";
          el.style.display = "none";
          return;
        }
        el.style.display = "";
        el.innerHTML = Object.keys(tabs).map(function(k){
          return '<button type="button" class="tab-btn '+(k===state.current?'is-active':'')+'" data-tab="'+k+'">'+tabs[k].name+'</button>';
        }).join("");
      }

      function renderFilters(){
        var c = state.current, cfg = tabs[c], fs = state.filters[c];
        var html = cfg.search.map(function(s){
          return '<div class="field"><label>'+s[1]+'</label><input data-f="'+s[0]+'" value="'+esc(fs[s[0]]||"")+'" placeholder="请输入'+s[1]+'"/></div>';
        }).join("");
        if(c==="ledger"){
          html += '<div class="field"><label>物资类别</label><select data-f="category">'
            + '<option value="">全部</option>'
            + '<option value="办公类" '+((fs.category||"")==="办公类"?'selected':'')+'>办公类</option>'
            + '<option value="生产类" '+((fs.category||"")==="生产类"?'selected':'')+'>生产类</option>'
            + '<option value="销售类" '+((fs.category||"")==="销售类"?'selected':'')+'>销售类</option>'
            + '</select></div>';
        }
        if(c==="ledger"){
          html += '<div class="field"><label>开票状态</label><select data-f="invoiceStatus">'
          + '<option value="">全部</option>'
          + '<option value="未开票" '+((fs.invoiceStatus||"")==="未开票"?'selected':'')+'>未开票</option>'
          + '<option value="已开票" '+((fs.invoiceStatus||"")==="已开票"?'selected':'')+'>已开票</option>'
          + '</select></div>'
          + '<div class="field"><label>发货状态</label><select data-f="shipStatus">'
          + '<option value="">全部</option>'
          + '<option value="未发货" '+((fs.shipStatus||"")==="未发货"?'selected':'')+'>未发货</option>'
          + '<option value="已发货" '+((fs.shipStatus||"")==="已发货"?'selected':'')+'>已发货</option>'
          + '<option value="已签收" '+((fs.shipStatus||"")==="已签收"?'selected':'')+'>已签收</option>'
          + '</select></div>'
          + '';
        }
        if(c==="requisition"){
          html += '<div class="field"><label>领用状态</label><select data-f="status">'
            + '<option value="">全部</option>'
            + '<option value="领用中" '+((fs.status||"")==="领用中"?'selected':'')+'>领用中</option>'
            + '<option value="已领用" '+((fs.status||"")==="已领用"?'selected':'')+'>已领用</option>'
            + '</select></div>';
        }
        html += '<div class="field"><label>&nbsp;</label><div><button type="button" class="btn primary" id="btnSearch">搜索</button> <button type="button" class="btn" id="btnReset">重置</button></div></div>';
        if(c==="ledger"){
          html += '<div class="field"><label>&nbsp;</label><div><button type="button" class="btn primary" id="btnNewRequisition">新增领用</button> <button type="button" class="btn" id="btnImport">导入</button> <button type="button" class="btn" id="btnTpl">下载模板</button> <button type="button" class="btn secondary" id="btnExport">导出</button></div></div>';
        } else {
          html += '<div class="field"><label>&nbsp;</label><div></div></div>';
        }
        document.getElementById("filters").innerHTML = html;
      }

      function renderCards(rows){
        var cards = [];
        if(state.current==="ledger"){
          cards = [
            ["物资总数", rows.length],
            ["在库数量", rows.filter(function(r){return r.status==="在库";}).length],
            ["未开票数量", rows.filter(function(r){return (r.invoiceStatus||"未开票")==="未开票";}).length],
            ["已开票数量", rows.filter(function(r){return r.invoiceStatus==="已开票";}).length]
          ];
        } else if(state.current==="requisition"){
          cards = [
            ["领用单总数", rows.length],
            ["领用中", rows.filter(function(r){return r.status==="领用中";}).length],
            ["已领用", rows.filter(function(r){return r.status==="已领用";}).length],
            ["领用完成率", rows.length ? Math.round(rows.filter(function(r){return r.status==="已领用";}).length * 100 / rows.length) + "%" : "0%"]
          ];
        }
        document.getElementById("cards").innerHTML = cards.map(function(x){
          return '<div class="stat"><div class="k">'+x[0]+'</div><div class="v">'+x[1]+'</div></div>';
        }).join("");
      }

      function statusTag(v){
        var cls = "blue";
        if(v==="在库") cls="green";
        else if(v==="维修中") cls="orange";
        else if(v==="已报废") cls="red";
        return '<span class="tag '+cls+'">'+esc(v)+'</span>';
      }
      function invoiceTag(v){
        var x = String(v || "未开票");
        var cls = x === "已开票" ? "green" : "orange";
        return '<span class="tag '+cls+'">'+esc(x)+'</span>';
      }
      function shipTag(v){
        var x = String(v || "未发货");
        var cls = "blue";
        if (x === "未发货") cls = "orange";
        else if (x === "已发货") cls = "blue";
        else if (x === "已签收") cls = "green";
        return '<span class="tag '+cls+'">'+esc(x)+'</span>';
      }
      function nowDate(){
        var d = new Date();
        function p(n){ return String(n).padStart(2, "0"); }
        return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());
      }
      function loadInvoiceUpdates(){
        try { return JSON.parse(localStorage.getItem("map_invoice_updates_v1") || "[]"); } catch(e) { return []; }
      }
      function applyInvoiceUpdates(rows){
        var list = loadInvoiceUpdates();
        if(!list.length) return;
        rows.forEach(function(r){
          var rCode = String(r.code || r.assetNo || "");
          for (var i=0;i<list.length;i++){
            var x = list[i];
            var hitByCode = String(x.materialCode || "") && rCode && String(x.materialCode) === rCode;
            var hitByContract = String(x.contractNo || "") && String(r.contractNo || "") === String(x.contractNo || "");
            var hitByName = String(x.materialName || "") && String(r.name || "") === String(x.materialName || "");
            if (hitByCode || hitByContract || hitByName){
              r.invoiceStatus = x.invoiceStatus || r.invoiceStatus || "未开票";
              r.invoiceTime = x.invoiceStatus === "已开票" ? (x.invoiceTime || r.invoiceTime || "") : "";
              if (x.shipStatus) r.shipStatus = x.shipStatus;
              break;
            }
          }
        });
      }
      function persistInvoiceForRow(row){
        if(!row) return;
        var key = "map_invoice_updates_v1";
        var list = loadInvoiceUpdates();
        var item = {
          materialCode: row.code || row.assetNo || "",
          contractNo: row.contractNo || "",
          materialName: row.name || "",
          spec: row.spec || "",
          invoiceStatus: row.invoiceStatus || "未开票",
          invoiceTime: row.invoiceStatus === "已开票" ? (row.invoiceTime || "") : "",
          shipStatus: row.shipStatus || "",
          shipTime: row.inDate || "",
          customerName: row.dept || "",
          reason: row.invoiceStatus === "已开票" ? "财务确认已开票" : "发货后待财务开票确认"
        };
        var hit = false;
        list = list.map(function(x){
          var sameCode = item.materialCode && String(x.materialCode || "") === String(item.materialCode);
          var sameLegacy = (x.contractNo && x.contractNo === item.contractNo) || (x.materialName && x.materialName === item.materialName);
          if (sameCode || sameLegacy) {
            hit = true;
            return item;
          }
          return x;
        });
        if(!hit) list.push(item);
        try { localStorage.setItem(key, JSON.stringify(list)); } catch(e) {}
      }

      function rowPrimaryKey(r, tabKey){
        var t = tabKey != null ? tabKey : state.current;
        if (t === "requisition") return String(r.reqNo || "");
        return String(r.code || r.assetNo || "");
      }

      function requisitionStatusTag(v){
        var x = String(v || "");
        var cls = "blue";
        if (x === "领用中") cls = "orange";
        else if (x === "已领用") cls = "green";
        return '<span class="tag '+cls+'">'+esc(x)+'</span>';
      }

      function renderTable(rows){
        var c = state.current, cfg = tabs[c], st = state.sort[c], page = state.page[c];
        var maxPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
        if(page > maxPage){ page = maxPage; state.page[c] = page; }
        var start = (page-1)*PAGE_SIZE;
        var view = rows.slice(start, start + PAGE_SIZE);

        document.getElementById("thead").innerHTML = '<th><input type="checkbox" id="chkAll"></th>' + cfg.columns.map(function(col){
          var k = col[0], title = col[1], mark = st.key===k ? (st.dir==="asc"?" ▲":" ▼") : " ↕";
          return '<th data-sort="'+k+'">'+title+mark+'</th>';
        }).join("") + "<th>操作</th>";

        document.getElementById("tbody").innerHTML = view.map(function(r){
          var key = esc(rowPrimaryKey(r, c));
          var cells = cfg.columns.map(function(col){
            var k=col[0], v=r[k];
            if(k==="name"){
              return '<td><span class="name-link" data-op="name-detail" data-key="'+key+'" title="选择物资">'+esc(v)+'</span></td>';
            }
            if(c==="ledger" && k==="invoiceStatus"){
              return "<td>"+invoiceTag(v)+"</td>";
            }
            if(c==="ledger" && k==="shipStatus"){
              return "<td>"+shipTag(v)+"</td>";
            }
            if(c==="ledger" && k==="status"){
              return "<td>"+statusTag(v)+"</td>";
            }
            if(c==="ledger" && k==="status"){
              return "<td>"+statusTag(v)+"</td>";
            }
            if(c==="requisition" && k==="status"){
              return "<td>"+requisitionStatusTag(v)+"</td>";
            }
            return "<td>"+esc(v)+"</td>";
          }).join("");
          var opsHtml = c === "requisition"
            ? '<button class="op-btn" data-op="detail" data-key="'+key+'">查看</button>'
            : '<button class="op-btn" data-op="edit" data-key="'+key+'">编辑</button> <button class="op-btn" data-op="detail" data-key="'+key+'">查看</button> <button class="op-btn" data-op="delete" data-key="'+key+'">删除</button>';
          return "<tr>"+'<td><input type="checkbox" class="row-chk" data-key="'+key+'"></td>'+cells
            +'<td>'+opsHtml+'</td>'
            +"</tr>";
        }).join("") || '<tr><td colspan="'+(cfg.columns.length+2)+'" style="padding:24px;color:#94a3b8">暂无数据</td></tr>';

        document.getElementById("pagerInfo").textContent = "共"+rows.length+"条，每页10条";
        var pager = "";
    for(var i=1;i<=maxPage;i++){
          pager += '<button type="button" class="page-btn '+(i===page?"is-active":"")+'" data-page="'+i+'">'+i+'</button>';
        }
        document.getElementById("pager").innerHTML = pager;
      }

      function findRowByKey(key){
        var rows = tabs[state.current].rows;
        for(var i=0;i<rows.length;i++){
          var r = rows[i];
          if (state.current === "requisition") {
            if (String(r.reqNo || "") === String(key)) return r;
          } else {
            var k = r.code || r.assetNo || "";
            if (String(k) === String(key)) return r;
          }
        }
        return null;
      }

      function buildDetailGridByColumns(row, columns){
        return (columns || []).map(function(col){
          var key = col[0], label = col[1];
          var val = row && row[key] != null ? row[key] : "-";
          return '<div class="k">'+esc(label)+'</div><div class="v">'+esc(val)+'</div>';
        }).join("");
      }

      function openDetail(row){
        var body = document.getElementById("detailBody");
        if (row && row.reqNo) {
          var reqCols = (tabs.requisition && tabs.requisition.columns) || [];
          var headReq = '<div class="detail-grid">' + buildDetailGridByColumns(row, reqCols) + '</div>';
          body.innerHTML =
            '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button class="btn secondary" id="detailProgressInline">流程进度</button></div>' +
            headReq;
          document.getElementById("detailTitle").textContent = "领用记录 - " + (row.reqNo || "");
          document.getElementById("detailMask").classList.add("show");
          return;
        }
        var stageIdx = stageIndexByStatus(row.status || row.assetStatus || row.inboundStatus || "");
        var stages = stageData(row);
        var ledgerCols = (tabs.ledger && tabs.ledger.columns) || [];
        var head = '<div class="detail-grid">' + buildDetailGridByColumns(row, ledgerCols) + '</div>';
        var sceneBar = '<p style="font-size:12px;color:#64748b;margin:10px 0 0;line-height:1.6">收货方式：<strong style="color:#334155">' + esc(receiveModeHint(row)) + '</strong></p>';
        var line = '<div class="stage-wrap">' + sceneBar + '<div class="stage-line" id="stageLineWrap">'
          + stages.map(function(s,idx){
              var cls = idx < stageIdx ? "done" : (idx===stageIdx ? "active" : "");
              var dot = ["进","存","管","运","出"][idx] || "·";
              return '<div class="stage-item '+cls+'" data-stage-key="'+s.key+'"><span class="stage-dot">'+dot+'</span><span class="stage-label">'+s.label+'</span></div>';
            }).join("")
          + '</div></div>';
        var activeIdx = Math.max(0, Math.min(stages.length - 1, stageIdx));
        var activeKey = stages[activeIdx] ? stages[activeIdx].key : "in";
        var detail = '<div id="stageNarrativeBox" style="margin-top:12px;padding:12px 14px;border:1px solid #e9edf4;border-radius:10px;background:#fff;color:#1f2937;line-height:1.65">'
          + stageNarrativeHtml(row, activeKey)
          + '</div>';
        body.innerHTML =
          '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button class="btn secondary" id="detailProgressInline">流程进度</button></div>' +
          head + line + detail;
        var wrap = document.getElementById("stageLineWrap");
        var detailBox = document.getElementById("stageNarrativeBox");
        if (wrap && detailBox) {
          Array.prototype.forEach.call(wrap.querySelectorAll(".stage-item"), function(item){
            item.addEventListener("click", function(){
              Array.prototype.forEach.call(wrap.querySelectorAll(".stage-item"), function(other){
                other.classList.remove("active");
              });
              item.classList.add("active");
              detailBox.innerHTML = stageNarrativeHtml(row, item.getAttribute("data-stage-key"));
            });
          });
        }
        document.getElementById("detailTitle").textContent = "物资详情 - " + (row.name || "未命名物资");
        document.getElementById("detailMask").classList.add("show");
      }
      function closeDetail(){ document.getElementById("detailMask").classList.remove("show"); }
      var actionCtx = { mode:"", row:null };
      function openActionModal(mode, row){
        actionCtx.mode = mode;
        actionCtx.row = row || null;
        var titleEl = document.getElementById("actionTitle");
        var bodyEl = document.getElementById("actionBody");
        var okEl = document.getElementById("actionOk");
        var progressEl = document.getElementById("actionProgress");
        if (progressEl) progressEl.style.display = "none";
        if(mode==="edit"){
          if (row && row.reqNo) {
            titleEl.textContent = "编辑领用记录";
            okEl.style.display = "";
            okEl.textContent = "保存";
            if (progressEl) progressEl.style.display = "";
            bodyEl.innerHTML =
              '<div class="detail-grid">' +
                '<div class="k">领用单号</div><div class="v"><input id="acReqNo" class="carrier-search" value="'+esc(row.reqNo||"")+'" readonly style="background:#f5f5f5"/></div>' +
                '<div class="k">选择物资</div><div class="v"><input id="acName" class="carrier-search" value="'+esc(row.name||"")+'"/></div>' +
                '<div class="k">领用日期</div><div class="v"><input id="acReqDate" class="carrier-search" value="'+esc(row.reqDate||"")+'"/></div>' +
                '<div class="k">领用人</div><div class="v"><input id="acApplicant" class="carrier-search" value="'+esc(row.applicant||"")+'"/></div>' +
                '<div class="k">领用部门</div><div class="v"><input id="acApplyDept" class="carrier-search" value="'+esc(row.applyDept||"")+'"/></div>' +
                '<div class="k">领用状态</div><div class="v"><input id="acStatus" class="carrier-search" value="'+esc(row.status||"")+'"/></div>' +
                '<div class="k">备注</div><div class="v"><input id="acRemark" class="carrier-search" value="'+esc(row.remark||"")+'"/></div>' +
              '</div>';
          } else {
            titleEl.textContent = "编辑物资台账";
            okEl.style.display = "";
            okEl.textContent = "保存";
            var nameSelHtml = buildLedgerMaterialNameOptionsHtml(row.name);
            bodyEl.innerHTML =
              '<div class="detail-grid">' +
                '<div class="k">选择物资</div><div class="v"><select id="acNameSel" class="carrier-select" style="width:100%;max-width:100%;height:36px;border:1px solid #e9ecef;border-radius:8px;padding:0 10px">' + nameSelHtml + '</select></div>' +
                '<div class="k">物资编码</div><div class="v"><input id="acCode" class="carrier-search" value="'+esc(row.code||"")+'" readonly style="background:#f5f5f5"/></div>' +
                '<div class="k">合同编号</div><div class="v"><input id="acContractNo" class="carrier-search" value="'+esc(row.contractNo||"")+'"/></div>' +
                '<div class="k">采购部门</div><div class="v"><input id="acPurchaseDept" class="carrier-search" value="'+esc(row.purchaseDept||"")+'"/></div>' +
                '<div class="k">规格型号</div><div class="v"><input id="acSpec" class="carrier-search" value="'+esc(row.spec||"")+'"/></div>' +
                '<div class="k">物资类别</div><div class="v"><input id="acCategory" class="carrier-search" value="'+esc(row.category||"")+'"/></div>' +
                '<div class="k">采购单价（不含税）</div><div class="v"><input id="acUnitPriceExcl" class="carrier-search" value="'+esc(row.unitPriceExcl!=null?row.unitPriceExcl:"")+'"/></div>' +
                '<div class="k">库存数量</div><div class="v"><input id="acStockQty" class="carrier-search" value="'+esc(row.stockQty!=null?row.stockQty:"")+'"/></div>' +
                '<div class="k">领用部门</div><div class="v"><input id="acDept" class="carrier-search" value="'+esc(row.dept||row.purchaseDept||"")+'"/></div>' +
                '<div class="k">领用人</div><div class="v"><input id="acKeeper" class="carrier-search" value="'+esc(row.keeper||"")+'"/></div>' +
                '<div class="k">存放地点</div><div class="v"><input id="acLoc" class="carrier-search" value="'+esc(row.location||row.loc||"")+'"/></div>' +
                '<div class="k">固定资产编码</div><div class="v"><input id="acFixedCode" class="carrier-search" value="'+esc(row.fixedCode||"")+'"/></div>' +
                '<div class="k">供应商</div><div class="v"><input id="acSupplier" class="carrier-search" value="'+esc(row.supplier||"")+'"/></div>' +
                '<div class="k">备注</div><div class="v"><input id="acRemark" class="carrier-search" value="'+esc(row.remark||"")+'"/></div>' +
              '</div>';
            (function bindEditNameSync(){
              var nameSel = document.getElementById("acNameSel");
              var codeIn = document.getElementById("acCode");
              if (!nameSel) return;
              nameSel.value = String(row.name || "");
              nameSel.addEventListener("change", function () {
                var n = String(nameSel.value || "").trim();
                var hit = null;
                var lr = tabs.ledger.rows || [];
                for (var i = 0; i < lr.length; i++) {
                  if (String(lr[i].name || "") === n) { hit = lr[i]; break; }
                }
                if (hit && codeIn) {
                  codeIn.value = String(hit.code || hit.assetNo || "");
                }
              });
            })();
          }
        } else if(mode==="delete"){
          titleEl.textContent = "删除确认";
          okEl.style.display = "";
          okEl.textContent = "确认删除";
          if (row && row.reqNo) {
            bodyEl.innerHTML = '<div style="font-size:14px;line-height:1.8;color:#1f2d3d">是否确认删除该条领用记录？</div>'
              + '<div style="margin-top:8px;color:#64748b">领用单号：'+esc(row.reqNo||"-")+'<br>物资名称：'+esc(row.name||"-")+'</div>';
          } else {
            bodyEl.innerHTML = '<div style="font-size:14px;line-height:1.8;color:#1f2d3d">是否确认删除该条物资台账记录？</div>'
              + '<div style="margin-top:8px;color:#64748b">物资编码：'+esc(row.code||row.assetNo||"-")+'<br>物资名称：'+esc(row.name||"-")+'</div>';
          }
        } else if(mode==="requisition"){
          titleEl.textContent = "新增领用";
          okEl.style.display = "";
          okEl.textContent = "确定";
          var ledgerRows = tabs.ledger.rows || [];
          var ledgerCols = tabs.ledger.columns || [];
          var optHtml = '<option value="">请选择物资台账记录</option>' + ledgerRows.map(function(r){
            var v = String(r.code || r.assetNo || "");
            var label = (r.code || "") + " · " + (r.name || "") + (r.spec ? ("（" + r.spec + "）") : "");
            return '<option value="'+esc(v)+'">'+esc(label)+'</option>';
          }).join("");
          // 「当前状态」由系统自动生成，新增领用弹窗中禁止人工填写
          var colsForGrid = ledgerCols.filter(function(col){
            var k = col[0], t = col[1];
            return k !== "name" && k !== "status" && t !== "当前状态";
          });
          var gridHtml = colsForGrid.map(function(col){
            var key = col[0], title = col[1];
            return '<div class="k">'+esc(title)+'</div><div class="v"><input class="carrier-search req-col" data-k="'+esc(key)+'" readonly style="background:#f5f5f5" /></div>';
          }).join("");
          bodyEl.innerHTML =
            '<div class="field" style="flex-direction:column;align-items:stretch;gap:8px;max-width:100%">'
            + '<label for="reqMaterialSel" style="font-size:12px;color:#64748b">可选物资（按台账编码）</label>'
            + '<select id="reqMaterialSel" class="carrier-select" style="width:100%;max-width:100%;height:36px;border:1px solid #e9ecef;border-radius:8px;padding:0 10px;-webkit-appearance:menulist;appearance:auto">'
            + optHtml
            + "</select>"
            + '<div class="detail-grid" style="margin-top:8px">'
            + '<div class="k">领用数量</div><div class="v"><input id="reqReceiveQty" class="carrier-search" value="1" placeholder="请输入领用数量"/></div>'
            + '</div>'
            + '<div class="detail-grid" style="margin-top:8px">'+gridHtml+'</div>'
            + '<p style="margin:8px 0 0;font-size:12px;color:#94a3b8;line-height:1.5">选择台账编码后自动带出字段，请填写领用数量。</p>'
            + "</div>";
          (function bindReqPreview(){
            function sync(){
              var sel = document.getElementById("reqMaterialSel");
              var code = sel ? String(sel.value || "") : "";
              var row = null;
              for (var i=0;i<ledgerRows.length;i++){
                if (String(ledgerRows[i].code || ledgerRows[i].assetNo || "") === code) { row = ledgerRows[i]; break; }
              }
              Array.prototype.forEach.call(document.querySelectorAll(".req-col"), function(el){
                var k = el.getAttribute("data-k");
                el.value = row && row[k] != null ? String(row[k]) : "";
              });
            }
            var sel = document.getElementById("reqMaterialSel");
            if (sel) sel.addEventListener("change", sync);
            sync();
            // 双保险：即使上游列配置改动，也移除「当前状态」项
            Array.prototype.forEach.call(document.querySelectorAll("#actionBody .detail-grid .k"), function(lab){
              if ((lab.textContent || "").replace(/\s+/g, "") === "当前状态") {
                var val = lab.nextElementSibling;
                if (val && val.parentNode) val.parentNode.removeChild(val);
                if (lab.parentNode) lab.parentNode.removeChild(lab);
              }
            });
          })();
        } else {
          titleEl.textContent = "提示";
          okEl.style.display = "none";
          bodyEl.innerHTML = '<div style="font-size:14px;line-height:1.8;color:#1f2d3d">无可用操作</div>';
        }
        document.getElementById("actionMask").classList.add("show");
      }
      function closeActionModal(){ document.getElementById("actionMask").classList.remove("show"); actionCtx = { mode:"", row:null }; }

      function renderAll(){
        var rows = getRows();
        renderTabs();
        renderFilters();
        renderCards(rows);
        renderTable(rows);
      }

      document.addEventListener("click", function(e){
        var tab = e.target.closest("[data-tab]");
        if(tab){
          state.current = tab.getAttribute("data-tab");
          try {
            var u = new URL(location.href);
            u.searchParams.set("tab", state.current);
            history.replaceState(null, "", u.pathname + u.search + (u.hash || ""));
          } catch (eUrl) {}
          renderAll();
          return;
        }
        if(e.target.id==="btnSearch"){
          document.querySelectorAll("#filters [data-f]").forEach(function(input){
            state.filters[state.current][input.getAttribute("data-f")] = input.value || "";
          });
          state.page[state.current] = 1;
          renderAll();
          return;
        }
        if(e.target.id==="btnReset"){
          state.filters[state.current] = {};
          state.page[state.current] = 1;
          renderAll();
          return;
        }
        if(e.target.id==="btnNewRequisition"){
          openActionModal("requisition", null);
          return;
        }
        if(e.target.id==="btnImport"){ alert("导入（演示）"); return; }
        if(e.target.id==="btnTpl"){ alert("下载模板（演示）"); return; }
        if(e.target.id==="btnExport"){ alert("已导出当前页签数据（演示）"); return; }
        if(e.target.id==="btnDeleteBatch"){
          var ids = Array.prototype.slice.call(document.querySelectorAll(".row-chk:checked")).map(function(el){ return el.getAttribute("data-key"); });
          if(!ids.length){ alert("请先勾选要删除的数据"); return; }
          var cur = state.current;
          tabs[cur].rows = tabs[cur].rows.filter(function(r){ return ids.indexOf(rowPrimaryKey(r, cur)) < 0; });
          renderAll();
          return;
        }
        if(e.target.id==="chkAll"){
          var ck = !!e.target.checked;
          Array.prototype.forEach.call(document.querySelectorAll(".row-chk"), function(el){ el.checked = ck; });
          return;
        }
        if(e.target.id==="detailProgressInline"){
          if (typeof window.openUnifiedProgressModal === "function" && window.openUnifiedProgressModal()) return;
          alert("流程进度（演示）");
          return;
        }
        if(e.target.id==="detailClose" || e.target.id==="detailX"){ closeDetail(); return; }
        if(e.target.id==="detailMask" && e.target===document.getElementById("detailMask")){ closeDetail(); return; }
        if(e.target.id==="actionCancel" || e.target.id==="actionX"){ closeActionModal(); return; }
        if(e.target.id==="actionProgress"){
          if (typeof window.openUnifiedProgressModal === "function" && window.openUnifiedProgressModal()) return;
          alert("流程进度（演示）");
          return;
        }
        if(e.target.id==="actionMask" && e.target===document.getElementById("actionMask")){ closeActionModal(); return; }
        if(e.target.id==="actionOk"){
          if(!actionCtx.mode){ closeActionModal(); return; }
          if(actionCtx.mode==="requisition"){
            var sel = document.getElementById("reqMaterialSel");
            var hasCode = sel && String(sel.value||"").trim();
            var qtyInput = document.getElementById("reqReceiveQty");
            var qtyVal = qtyInput ? String(qtyInput.value || "").trim() : "";
            var qtyNum = Number(qtyVal);
            if(!hasCode){ alert("请选择物资台账记录"); return; }
            if(!qtyVal || isNaN(qtyNum) || qtyNum <= 0){ alert("请输入有效的领用数量"); return; }
            closeActionModal();
            var msg = hasCode && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : "未选择";
            alert("已提交领用申请（演示）：" + msg + "；领用数量：" + qtyNum);
            return;
          }
          if(!actionCtx.row){ closeActionModal(); return; }
          if(actionCtx.mode==="edit"){
            if (actionCtx.row.reqNo) {
              actionCtx.row.name = document.getElementById("acName").value || actionCtx.row.name;
              actionCtx.row.reqDate = document.getElementById("acReqDate").value || actionCtx.row.reqDate;
              actionCtx.row.applicant = document.getElementById("acApplicant").value || actionCtx.row.applicant;
              actionCtx.row.applyDept = document.getElementById("acApplyDept").value || actionCtx.row.applyDept;
              actionCtx.row.status = document.getElementById("acStatus").value || actionCtx.row.status;
              actionCtx.row.remark = document.getElementById("acRemark").value || actionCtx.row.remark;
            } else {
              function val(id){ var el=document.getElementById(id); return el ? el.value : ""; }
              var acNameSel = document.getElementById("acNameSel");
              actionCtx.row.name = (acNameSel && acNameSel.value) ? acNameSel.value : actionCtx.row.name;
              actionCtx.row.spec = document.getElementById("acSpec").value || actionCtx.row.spec;
              actionCtx.row.dept = document.getElementById("acDept").value || actionCtx.row.dept;
              actionCtx.row.keeper = document.getElementById("acKeeper").value || actionCtx.row.keeper;
              actionCtx.row.loc = document.getElementById("acLoc").value || actionCtx.row.loc;
              actionCtx.row.location = document.getElementById("acLoc").value || actionCtx.row.location;
              actionCtx.row.contractNo = val("acContractNo") || actionCtx.row.contractNo;
              actionCtx.row.purchaseDept = val("acPurchaseDept") || actionCtx.row.purchaseDept;
              actionCtx.row.category = val("acCategory") || actionCtx.row.category;
              actionCtx.row.unitPriceExcl = val("acUnitPriceExcl") || actionCtx.row.unitPriceExcl;
              actionCtx.row.stockQty = val("acStockQty") || actionCtx.row.stockQty;
              actionCtx.row.fixedCode = val("acFixedCode") || actionCtx.row.fixedCode;
              actionCtx.row.supplier = val("acSupplier") || actionCtx.row.supplier;
              actionCtx.row.remark = document.getElementById("acRemark").value || actionCtx.row.remark;
            }
            closeActionModal();
            renderAll();
            return;
          }
          if(actionCtx.mode==="delete"){
            var listDel = tabs[state.current].rows;
            var kDel = rowPrimaryKey(actionCtx.row, state.current);
            tabs[state.current].rows = listDel.filter(function(x){ return rowPrimaryKey(x, state.current) !== String(kDel); });
            closeActionModal();
            renderAll();
            return;
          }
          closeActionModal();
          return;
        }

        var th = e.target.closest("[data-sort]");
        if(th){
          var key = th.getAttribute("data-sort"), st = state.sort[state.current];
          if(st.key===key){ st.dir = st.dir==="asc"?"desc":"asc"; }
          else { st.key = key; st.dir = "asc"; }
          renderAll();
          return;
        }
        var pageBtn = e.target.closest("[data-page]");
        if(pageBtn){
          state.page[state.current] = Number(pageBtn.getAttribute("data-page")) || 1;
          renderAll();
          return;
        }
        var op = e.target.getAttribute("data-op");
        if(op){
          var row = findRowByKey(e.target.getAttribute("data-key") || "");
          if(!row) return;
          if(op==="detail" || op==="name-detail"){ openDetail(row); return; }
          if(op==="edit"){ openActionModal("edit", row); return; }
          if(op==="delete"){
            openActionModal("delete", row);
            return;
          }
          window.location.href = jump(op,row);
        }
      });

      renderAll();
})();
  