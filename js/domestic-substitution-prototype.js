/**
 * 国产化替代：产品台账 / 发货记录 / 生产计划（演示）
 */
(function () {
  var PROD = [
    { code: "GD-001", name: "国产化变流器模块", cat: "变流器模块", spec: "V2.0", qty: 100, ship: 60, sale: 15, stock: 25, price: "35,000", st: "在库" },
    { code: "GD-002", name: "IGBT驱动板", cat: "电路板", spec: "V3.1", qty: 500, ship: 200, sale: 80, stock: 220, price: "280", st: "在库" },
    { code: "GD-003", name: "主控板", cat: "电路板", spec: "V1.2", qty: 300, ship: 150, sale: 50, stock: 100, price: "450", st: "在库" },
    { code: "GD-004", name: "CMS数据采集器", cat: "CMS产品", spec: "V3.0", qty: 50, ship: 30, sale: 0, stock: 20, price: "2,800", st: "在库" },
    { code: "GD-005", name: "变压器模块A", cat: "变压器模块", spec: "T1", qty: 80, ship: 40, sale: 10, stock: 30, price: "1,200", st: "在库" }
  ];

  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.setAttribute("role", "status");
    t.style.cssText =
      "position:fixed;left:50%;bottom:88px;transform:translateX(-50%);background:rgba(0,0,0,.78);color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:10050;";
    document.body.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 2200);
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

  function renderProd() {
    var tb = document.getElementById("dsProdBody");
    if (!tb) return;
    tb.innerHTML = PROD.map(function (r) {
      return (
        "<tr data-code=\"" +
        r.code +
        "\"><td>" +
        r.code +
        "</td><td>" +
        r.name +
        "</td><td>" +
        r.cat +
        "</td><td>" +
        r.spec +
        "</td><td>" +
        r.qty +
        "</td><td>" +
        r.ship +
        "</td><td>" +
        r.sale +
        "</td><td>" +
        r.stock +
        "</td><td>" +
        r.price +
        '</td><td><span style="color:#52c41a"><i class="fa-solid fa-circle" style="font-size:9px"></i> ' +
        r.st +
        '</span></td><td><span class="ds-ops"><button type="button" class="carrier-btn-add ds-link" data-act="detail" data-code="' +
        r.code +
        '">查看详情</button><button type="button" class="carrier-btn-add ds-link" data-act="ship" data-code="' +
        r.code +
        '">发货登记</button><button type="button" class="carrier-btn-add ds-link" data-act="maint" data-code="' +
        r.code +
        '">维修领用登记</button></span></td></tr>'
      );
    }).join("");
  }

  function findProd(code) {
    return PROD.find(function (x) {
      return x.code === code;
    });
  }

  function switchTab(which) {
    document.querySelectorAll(".ds-tab").forEach(function (b) {
      var on = b.getAttribute("data-ds-tab") === which;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.getElementById("dsPanelProd").hidden = which !== "prod";
    document.getElementById("dsPanelShip").hidden = which !== "ship";
    document.getElementById("dsPanelPlan").hidden = which !== "plan";
  }

  function bind() {
    document.querySelectorAll(".ds-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-ds-tab"));
      });
    });

    document.getElementById("dsBtnSearch") &&
      document.getElementById("dsBtnSearch").addEventListener("click", function () {
        toast("已搜索（演示）");
      });
    document.getElementById("dsBtnReset") &&
      document.getElementById("dsBtnReset").addEventListener("click", function () {
        document.getElementById("dsFName").value = "";
        document.getElementById("dsFType").selectedIndex = 0;
        document.getElementById("dsFStatus").selectedIndex = 0;
      });
    document.getElementById("dsBtnAdd") &&
      document.getElementById("dsBtnAdd").addEventListener("click", function () {
        toast("新增产品（演示）");
      });
    document.getElementById("dsBtnExport") &&
      document.getElementById("dsBtnExport").addEventListener("click", function () {
        toast("导出台账（演示）");
      });

    document.getElementById("dsTblProd") &&
      document.getElementById("dsTblProd").addEventListener("click", function (e) {
        var b = e.target.closest("[data-act]");
        if (!b) return;
        var code = b.getAttribute("data-code");
        var r = findProd(code);
        var act = b.getAttribute("data-act");
        if (act === "detail" && r) {
          document.getElementById("dsDetailTitle").textContent = "产品详情 - " + r.name;
          document.getElementById("dsDetailBody").innerHTML =
            "<p>编码：" +
            r.code +
            " &nbsp; 分类：" +
            r.cat +
            " &nbsp; 规格：" +
            r.spec +
            "</p>" +
            "<p>生产数量：" +
            r.qty +
            " &nbsp; 已发：" +
            r.ship +
            " &nbsp; 用于售：" +
            r.sale +
            " &nbsp; 剩余库存：" +
            r.stock +
            "</p>";
          openModal("dsModalDetail");
        } else if (act === "ship") {
          toast("发货登记（演示）：" + code);
        } else if (act === "maint") {
          toast("维修领用登记（演示）：" + code);
        }
      });

    document.getElementById("dsDetailClose") &&
      document.getElementById("dsDetailClose").addEventListener("click", function () {
        closeModal("dsModalDetail");
      });
    document.getElementById("dsDetailOk") &&
      document.getElementById("dsDetailOk").addEventListener("click", function () {
        closeModal("dsModalDetail");
      });
    document.getElementById("dsModalDetail") &&
      document.getElementById("dsModalDetail").addEventListener("click", function (e) {
        if (e.target.id === "dsModalDetail") closeModal("dsModalDetail");
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  function init() {
    renderProd();
    switchTab("prod");
    bind();
  }
})();
