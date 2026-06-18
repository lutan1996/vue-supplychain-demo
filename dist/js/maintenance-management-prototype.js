/**
 * 维修管理（物料库存台账 / 小料消耗品）演示逻辑
 */
(function () {
  var SYNC_TIME_IDS = ["wmSyncTime", "wmSyncTimeTip"];
  var INV_DATA = [
    { code: "Z000003", name: "绝缘膜", spec: "ACS800-导热棉", cat: "组件", qty: 14, unit: "个", loc: "1号货架", th: 10, st: "ok", price: "—" },
    { code: "JYM0002", name: "电容器", spec: "LYJS-JY-1-L-13空", cat: "电容", qty: 5, unit: "个", loc: "2号货架", th: 10, st: "low", price: "—" },
    { code: "FS000029", name: "散热风扇", spec: "JF0825H1U-R", cat: "风扇", qty: 0, unit: "个", loc: "3号货架", th: 5, st: "out", price: "—" },
    { code: "Z000004", name: "电缆", spec: "加热器组件", cat: "组件", qty: 23, unit: "根", loc: "4号货架", th: 10, st: "ok", price: "—" },
    { code: "JYM00059", name: "绝缘膜", spec: "外壳背板", cat: "组件", qty: 8, unit: "个", loc: "1号货架", th: 10, st: "low", price: "—" }
  ];

  var SMALL_DATA = [
    { name: "贴片电容", spec: "104 50V", cat: "电子元件", mode: "按包", qty: 5, unit: "包", loc: "小料盒A1", th: 2, st: "ok" },
    { name: "润滑油", spec: "壳牌10W-40", cat: "润滑剂", mode: "按桶", qty: 2, unit: "桶", loc: "货架5", th: 1, st: "ok" },
    { name: "精密清洁剂", spec: "CRC 精密电子清洁剂", cat: "清洁剂", mode: "按瓶", qty: 8, unit: "瓶", loc: "货架5", th: 3, st: "ok" }
  ];

  var SMALL_PICK_HISTORY = {};

  var TODO_TASKS = [
    { title: "小料采购申请-润滑油", applicant: "赵六", time: "2026-04-18 09:20" },
    { title: "工具借用申请-万用表T002", applicant: "李四", time: "2026-04-17 14:05" },
    { title: "国产化发货审批-GD-001", applicant: "宋中波", time: "2026-04-16 11:30" }
  ];

  function stDot(st) {
    if (st === "ok") return '<span style="color:#52c41a">● 正常</span>';
    if (st === "low") return '<span style="color:#fa8c16">● 低库存</span>';
    return '<span style="color:#ff4d4f">● 缺货</span>';
  }

  function smallStDot(st) {
    return st === "ok" ? '<span style="color:#52c41a">● 正常</span>' : st;
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (m) {
      m.classList.add("show");
      m.setAttribute("aria-hidden", "false");
    }
  }

  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) {
      m.classList.remove("show");
      m.setAttribute("aria-hidden", "true");
    }
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.setAttribute("role", "status");
    t.style.cssText =
      "position:fixed;left:50%;bottom:88px;transform:translateX(-50%);background:rgba(0,0,0,.78);color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:10050;max-width:90vw;text-align:center;";
    document.body.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 2400);
  }

  function detailGrid(rows) {
    return (
      '<div class="wm-detail-grid">' +
      rows
        .map(function (pair) {
          return (
            '<div class="wm-detail-item"><div class="wm-detail-label">' +
            pair[0] +
            '</div><div class="wm-detail-value">' +
            pair[1] +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderInvTable() {
    var tb = document.getElementById("wmTblInvBody");
    if (!tb) return;
    tb.innerHTML = INV_DATA.map(function (r) {
      return (
        "<tr data-code=\"" +
        r.code +
        "\"><td>" +
        r.code +
        "</td><td>" +
        r.name +
        "</td><td>" +
        r.spec +
        "</td><td>" +
        r.cat +
        "</td><td>" +
        r.qty +
        "</td><td>" +
        r.unit +
        "</td><td>" +
        r.loc +
        "</td><td>" +
        r.th +
        "</td><td>" +
        stDot(r.st) +
        '</td><td><button type="button" class="carrier-btn-add wm-btn-link" data-act="inv-detail" data-code="' +
        r.code +
        '">查看详情</button></td></tr>'
      );
    }).join("");
  }

  function renderSmallTable() {
    var tb = document.getElementById("wmTblSmallBody");
    if (!tb) return;
    tb.innerHTML = SMALL_DATA.map(function (r, idx) {
      return (
        "<tr data-idx=\"" +
        idx +
        "\"><td>" +
        r.name +
        "</td><td>" +
        r.spec +
        "</td><td>" +
        r.cat +
        "</td><td>" +
        r.mode +
        "</td><td class=\"wm-qty\">" +
        r.qty +
        "</td><td>" +
        r.unit +
        "</td><td>" +
        r.loc +
        "</td><td>" +
        r.th +
        "</td><td>" +
        smallStDot(r.st) +
        '</td><td><span class="wm-ops"><button type="button" class="carrier-btn-add wm-btn-link" data-act="pick" data-idx="' +
        idx +
        '">领用登记</button><button type="button" class="carrier-btn-add wm-btn-link" data-act="purchase" data-idx="' +
        idx +
        '">采购申请</button><button type="button" class="carrier-btn-add wm-btn-link" data-act="small-detail" data-idx="' +
        idx +
        '">查看详情</button></span></td></tr>'
      );
    }).join("");
  }

  function findInv(code) {
    return INV_DATA.find(function (x) {
      return x.code === code;
    });
  }

  function openInvDetail(code) {
    var row = findInv(code);
    if (!row) return;
    document.getElementById("wmInvDetailTitle").textContent = "物料详情 - " + row.name;
    document.getElementById("wmInvDetailBody").innerHTML =
      detailGrid([
        ["编码", row.code],
        ["名称", row.name],
        ["型号", row.spec],
        ["分类", row.cat],
        ["存放", row.loc],
        ["单价", row.price],
        ["库存", row.qty],
        ["低库存阈值", row.th]
      ]) +
      "<div style=\"margin-top:12px;font-weight:600;margin-bottom:6px\">出入库流水（最近10条）</div>" +
      "<div class=\"carrier-table-wrap\"><table class=\"carrier-table\"><thead><tr><th>时间</th><th>业务类型</th><th>数量</th><th>经手人</th></tr></thead><tbody>" +
      Array.from({ length: 10 })
        .map(function (_, i) {
          var day = 10 + i;
          var t = "2026-04-" + (day > 30 ? 30 : day) + " 0" + (8 + (i % 3)) + ":00:00";
          return (
            "<tr><td>" +
            t +
            "</td><td>" +
            (i % 2 ? "出库" : "入库") +
            "</td><td>" +
            (i + 1) +
            "</td><td>用户" +
            (i % 4) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";
    openModal("wmModalInvDetail");
  }

  function switchTab(which) {
    document.querySelectorAll(".wm-tab").forEach(function (b) {
      var on = b.getAttribute("data-wm-tab") === which;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    var p1 = document.getElementById("wmPanelInv");
    var p2 = document.getElementById("wmPanelSmall");
    if (p1) p1.hidden = which !== "inv";
    if (p2) p2.hidden = which !== "small";
  }

  function bind() {
    document.querySelectorAll(".wm-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-wm-tab"));
      });
    });

    document.getElementById("wmBtnSync") &&
      document.getElementById("wmBtnSync").addEventListener("click", function () {
        var ts = new Date().toISOString().slice(0, 19).replace("T", " ");
        SYNC_TIME_IDS.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.textContent = ts;
        });
        toast("同步完成（演示）");
      });

    document.getElementById("wmInvSearch") &&
      document.getElementById("wmInvSearch").addEventListener("click", function () {
        toast("已按条件筛选（演示）");
      });
    document.getElementById("wmInvReset") &&
      document.getElementById("wmInvReset").addEventListener("click", function () {
        document.getElementById("wmFInvName").value = "";
        document.getElementById("wmFInvCat").value = "";
        document.getElementById("wmFInvSt").value = "";
        toast("已重置");
      });

    document.getElementById("wmTblInv") &&
      document.getElementById("wmTblInv").addEventListener("click", function (e) {
        var b = e.target.closest("[data-act=inv-detail]");
        if (!b) return;
        openInvDetail(b.getAttribute("data-code"));
      });

    document.getElementById("wmModalInvDetailClose") &&
      document.getElementById("wmModalInvDetailClose").addEventListener("click", function () {
        closeModal("wmModalInvDetail");
      });
    document.getElementById("wmInvDetailCloseFt") &&
      document.getElementById("wmInvDetailCloseFt").addEventListener("click", function () {
        closeModal("wmModalInvDetail");
      });
    document.getElementById("wmModalInvDetail") &&
      document.getElementById("wmModalInvDetail").addEventListener("click", function (e) {
        if (e.target.id === "wmModalInvDetail") closeModal("wmModalInvDetail");
      });

    document.getElementById("wmSmallSearch") &&
      document.getElementById("wmSmallSearch").addEventListener("click", function () {
        toast("已按条件筛选（演示）");
      });
    document.getElementById("wmSmallReset") &&
      document.getElementById("wmSmallReset").addEventListener("click", function () {
        document.getElementById("wmFSmName").value = "";
        document.getElementById("wmFSmCat").value = "";
        document.getElementById("wmFSmMode").value = "";
      });
    document.getElementById("wmBtnSmImport") &&
      document.getElementById("wmBtnSmImport").addEventListener("click", function () {
        toast("导入 Excel（演示）");
      });
    document.getElementById("wmBtnSmAdd") &&
      document.getElementById("wmBtnSmAdd").addEventListener("click", function () {
        toast("新增物料（演示）");
      });

    var pickIdx = null;
    document.getElementById("wmTblSmall") &&
      document.getElementById("wmTblSmall").addEventListener("click", function (e) {
        var bp = e.target.closest("[data-act=pick]");
        var bpur = e.target.closest("[data-act=purchase]");
        var bd = e.target.closest("[data-act=small-detail]");
        if (bp) {
          pickIdx = parseInt(bp.getAttribute("data-idx"), 10);
          var r = SMALL_DATA[pickIdx];
          document.getElementById("wmPickName").value = r.name;
          document.getElementById("wmPickQty").value = "";
          document.getElementById("wmPickUser").value = "宋中波";
          document.getElementById("wmPickUse").value = "维修消耗";
          document.getElementById("wmPickRm").value = "";
          openModal("wmModalPick");
          return;
        }
        if (bpur) {
          pickIdx = parseInt(bpur.getAttribute("data-idx"), 10);
          var r2 = SMALL_DATA[pickIdx];
          document.getElementById("wmPurName").value = r2.name;
          document.getElementById("wmPurQty").value = "";
          document.getElementById("wmPurUrgent").value = "普通";
          document.getElementById("wmPurReason").value = "";
          openModal("wmModalPurchase");
          return;
        }
        if (bd) {
          var ix = parseInt(bd.getAttribute("data-idx"), 10);
          var name = SMALL_DATA[ix].name;
          var hist = SMALL_PICK_HISTORY[name] || [];
          var rows =
            hist.length > 0
              ? hist
                  .map(function (h) {
                    return "<tr><td>" + h.t + "</td><td>" + h.qty + "</td><td>" + h.user + "</td></tr>";
                  })
                  .join("")
              : "<tr><td colspan=\"3\" style=\"text-align:center;color:#8c8c8c\">暂无领用记录</td></tr>";
          document.getElementById("wmHistTitle").textContent = "领用记录 - " + name;
          document.getElementById("wmHistBody").innerHTML =
            detailGrid([
              ["物料名称", SMALL_DATA[ix].name],
              ["规格型号", SMALL_DATA[ix].spec],
              ["分类", SMALL_DATA[ix].cat],
              ["管理方式", SMALL_DATA[ix].mode],
              ["当前库存", SMALL_DATA[ix].qty + SMALL_DATA[ix].unit],
              ["存放位置", SMALL_DATA[ix].loc]
            ]) +
            "<div style=\"margin-top:12px;font-weight:600;margin-bottom:6px\">领用历史</div>" +
            "<table class=\"carrier-table\"><thead><tr><th>时间</th><th>数量</th><th>领用人</th></tr></thead><tbody>" +
            rows +
            "</tbody></table>";
          openModal("wmModalHist");
        }
      });

    document.getElementById("wmPickCancel") &&
      document.getElementById("wmPickCancel").addEventListener("click", function () {
        closeModal("wmModalPick");
      });
    document.getElementById("wmPickOk") &&
      document.getElementById("wmPickOk").addEventListener("click", function () {
        var q = parseInt(document.getElementById("wmPickQty").value, 10);
        if (!q || q < 1) {
          toast("请填写领用数量");
          return;
        }
        if (pickIdx == null) return;
        var r = SMALL_DATA[pickIdx];
        r.qty = Math.max(0, r.qty - q);
        var name = r.name;
        if (!SMALL_PICK_HISTORY[name]) SMALL_PICK_HISTORY[name] = [];
        SMALL_PICK_HISTORY[name].unshift({
          t: new Date().toISOString().slice(0, 19).replace("T", " "),
          qty: q,
          user: document.getElementById("wmPickUser").value || "宋中波"
        });
        renderSmallTable();
        closeModal("wmModalPick");
        toast("领用登记成功");
      });

    document.getElementById("wmPurCancel") &&
      document.getElementById("wmPurCancel").addEventListener("click", function () {
        closeModal("wmModalPurchase");
      });
    document.getElementById("wmPurOk") &&
      document.getElementById("wmPurOk").addEventListener("click", function () {
        var q = parseInt(document.getElementById("wmPurQty").value, 10);
        var reason = (document.getElementById("wmPurReason").value || "").trim();
        if (!q || q < 1) {
          toast("请填写申请数量");
          return;
        }
        if (!reason) {
          toast("请填写申请原因");
          return;
        }
        closeModal("wmModalPurchase");
        toast("采购申请已提交，等待审批");
      });

    document.getElementById("wmHistClose") &&
      document.getElementById("wmHistClose").addEventListener("click", function () {
        closeModal("wmModalHist");
      });

    document.getElementById("wmFabTodo") &&
      document.getElementById("wmFabTodo").addEventListener("click", function () {
        var rows = TODO_TASKS.map(function (t, i) {
          return (
            "<tr><td>" +
            t.title +
            "</td><td>" +
            t.applicant +
            "</td><td>" +
            t.time +
            '</td><td><button type="button" class="carrier-btn-add wm-todo-go" data-ti="' +
            i +
            '">去审批</button></td></tr>'
          );
        }).join("");
        document.getElementById("wmTodoBody").innerHTML =
          "<table class=\"carrier-table\"><thead><tr><th>任务名称</th><th>申请人</th><th>申请时间</th><th>操作</th></tr></thead><tbody>" +
          rows +
          "</tbody></table>";
        openModal("wmModalTodo");
        document.getElementById("wmTodoBody").querySelectorAll(".wm-todo-go").forEach(function (btn) {
          btn.onclick = function () {
            var ti = parseInt(btn.getAttribute("data-ti"), 10);
            var t = TODO_TASKS[ti];
            document.getElementById("wmApprTitle").textContent = "审批 - " + t.title;
            document.getElementById("wmApprDetail").innerHTML =
              "<p>申请详情（演示）：" + t.title + "</p><p>申请人：" + t.applicant + " &nbsp; 时间：" + t.time + "</p>";
            document.getElementById("wmApprOpinion").value = "同意。";
            closeModal("wmModalTodo");
            openModal("wmModalAppr");
          };
        });
      });

    document.getElementById("wmTodoClose") &&
      document.getElementById("wmTodoClose").addEventListener("click", function () {
        closeModal("wmModalTodo");
      });
    document.getElementById("wmApprCancel") &&
      document.getElementById("wmApprCancel").addEventListener("click", function () {
        closeModal("wmModalAppr");
        openModal("wmModalTodo");
      });
    document.getElementById("wmApprOk") &&
      document.getElementById("wmApprOk").addEventListener("click", function () {
        toast("审批已提交（演示）");
        closeModal("wmModalAppr");
      });

    ["wmModalInvDetail", "wmModalPick", "wmModalPurchase", "wmModalHist", "wmModalTodo", "wmModalAppr"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", function (e) {
        if (e.target === el) closeModal(id);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      ["wmModalInvDetail", "wmModalPick", "wmModalPurchase", "wmModalHist", "wmModalTodo", "wmModalAppr"].forEach(function (id) {
        var m = document.getElementById(id);
        if (m && m.classList.contains("show")) closeModal(id);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  function init() {
    renderInvTable();
    renderSmallTable();
    switchTab("inv");
    bind();
  }
})();
