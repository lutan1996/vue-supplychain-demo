/**
 * 产品目录选择弹窗：左物资类型树 + 右产品表（参考「选择办公设备」）
 */
(function (global) {
  var STYLE_ID = "demo-pd-picker-style";
  var D = global.DemoProductCatalogData;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function ensureStyle() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent =
      ".pd-pick-mask{position:fixed;inset:0;background:rgba(0,0,0,.42);display:none;align-items:center;justify-content:center;z-index:4500}" +
      ".pd-pick-mask.show{display:flex}" +
      ".pd-pick{width:min(1120px,96vw);height:min(640px,88vh);background:#fff;border-radius:4px;border:1px solid #d9e2ef;box-shadow:0 18px 48px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden;border-top:3px solid #1890ff}" +
      ".pd-pick-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #e8eef5;font-size:15px;font-weight:600;color:#1f3551}" +
      ".pd-pick-bd{flex:1;min-height:0;display:flex}" +
      ".pd-pick-side{width:240px;flex-shrink:0;border-right:1px solid #e8eef5;background:#fafbfc;display:flex;flex-direction:column}" +
      ".pd-pick-side-hd{padding:10px 12px;font-size:13px;font-weight:600;color:#334155;border-bottom:1px solid #e8eef5}" +
      ".pd-pick-tree-search{padding:8px 10px;border-bottom:1px solid #eef2f6}" +
      ".pd-pick-tree-search input{width:100%;height:30px;border:1px solid #d9d9d9;border-radius:4px;padding:0 8px;font-size:12px;box-sizing:border-box}" +
      ".pd-pick-tree{flex:1;overflow:auto;padding:6px 0}" +
      ".pd-pick-tree-row{display:flex;align-items:center;gap:4px;padding:6px 10px;font-size:13px;color:#334155;cursor:pointer;border:none;background:transparent;width:100%;text-align:left}" +
      ".pd-pick-tree-row:hover{background:#eef4ff}" +
      ".pd-pick-tree-row.is-active{background:#e6f4ff;color:#1677ff;font-weight:600}" +
      ".pd-pick-tree-toggle{width:22px;height:22px;border:1px solid #dbe6f3;border-radius:2px;background:#fff;font-size:11px;cursor:pointer;flex-shrink:0;padding:0}" +
      ".pd-pick-main{flex:1;min-width:0;display:flex;flex-direction:column}" +
      ".pd-pick-toolbar{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 12px;border-bottom:1px solid #eef2f6}" +
      ".pd-pick-search{width:240px;height:32px;border:1px solid #d9d9d9;border-radius:4px;padding:0 10px;font-size:13px}" +
      ".pd-pick-table-wrap{flex:1;min-height:0;overflow:auto;padding:0 12px}" +
      ".pd-pick-table{width:100%;border-collapse:collapse;font-size:12px;min-width:880px;table-layout:fixed}" +
      ".pd-pick-table th,.pd-pick-table td{border:1px solid #e8eef5;padding:8px 10px;white-space:normal;text-align:left;word-break:break-word;overflow-wrap:anywhere;line-height:1.35}" +
      ".pd-pick-table th:first-child,.pd-pick-table td:first-child{width:40px;text-align:center}" +
      ".pd-pick-table th{background:#e8f4fc;color:#334155;font-weight:600}" +
      ".pd-pick-table tbody tr{cursor:pointer}" +
      ".pd-pick-table tbody tr:hover td{background:#f8fbff}" +
      ".pd-pick-table tbody tr.is-checked td{background:#f0f7ff}" +
      ".pd-pick-table tbody tr.is-locked td{background:#f5f7fa;color:#94a3b8;cursor:not-allowed}" +
      ".pd-pick-table tbody tr.is-locked input{pointer-events:none;opacity:.85}" +
      ".pd-pick-ft{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-top:1px solid #e8eef5;background:#fafbfc;font-size:12px;color:#64748b}" +
      ".pd-pick-pager{display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
      ".pd-pick-pager button{min-width:28px;height:28px;border:1px solid #d9d9d9;border-radius:4px;background:#fff;cursor:pointer;font-size:12px}" +
      ".pd-pick-pager button:disabled{opacity:.45;cursor:not-allowed}" +
      ".pd-pick-actions{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #e8eef5;justify-content:flex-end}" +
      ".pd-pick-btn{height:32px;padding:0 14px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#334155}" +
      ".pd-pick-btn.primary{background:#1890ff;border-color:#1890ff;color:#fff}" +
      ".pd-pick,.pd-pick .pd-pick-tree,.pd-pick .pd-pick-tree span,.pd-pick .pd-pick-tree div{color:#000}" +
      ".pd-pick .pd-pick-tree-toggle{color:#000}" +
      ".pd-pick .pd-pick-table tbody td{color:#000}" +
      ".pd-pick .pd-pick-ft,.pd-pick .pd-pick-ft span{color:#000}" +
      ".pd-pick .pd-pick-pager button{color:#000}" +
      ".pd-pick-contract-hint{padding:8px 10px;border-bottom:1px solid #eef2f6;font-size:11px;color:#64748b;line-height:1.55;background:#fff}" +
      ".pd-pick-contract-hint strong{color:#334155;font-weight:600}";
  }

  function ensureMask() {
    ensureStyle();
    var mask = document.getElementById("demoPdPickerMask");
    if (mask) return mask;
    mask = document.createElement("div");
    mask.id = "demoPdPickerMask";
    mask.className = "pd-pick-mask";
    mask.setAttribute("aria-hidden", "true");
    mask.innerHTML =
      '<div class="pd-pick" role="dialog" aria-modal="true">' +
      '<div class="pd-pick-hd"><span id="demoPdPickerTitle">选择产品</span><button type="button" class="pd-pick-btn" id="demoPdPickerClose" aria-label="关闭">×</button></div>' +
      '<div class="pd-pick-bd">' +
      '<aside class="pd-pick-side">' +
      '<div class="pd-pick-side-hd" id="demoPdPickerSideHd">物资类型</div>' +
      '<div class="pd-pick-contract-hint" id="demoPdPickerContractHint" hidden></div>' +
      '<div class="pd-pick-tree-search"><input type="search" id="demoPdPickerTreeQ" placeholder="搜索类型编码或名称" autocomplete="off" /></div>' +
      '<div class="pd-pick-tree" id="demoPdPickerTree"></div>' +
      "</aside>" +
      '<div class="pd-pick-main">' +
      '<div class="pd-pick-toolbar"><input type="search" class="pd-pick-search" id="demoPdPickerSearch" placeholder="搜索产品编码/名称/制造商/产品型号" autocomplete="off" /></div>' +
      '<div class="pd-pick-table-wrap"><table class="pd-pick-table"><thead><tr id="demoPdPickerThead"></tr></thead><tbody id="demoPdPickerTbody"></tbody></table></div>' +
      '<div class="pd-pick-ft"><span id="demoPdPickerCount">共0条</span><div class="pd-pick-pager">' +
      '<select id="demoPdPickerPageSize" style="height:28px;border:1px solid #d9d9d9;border-radius:4px;font-size:12px"><option value="20">20</option><option value="50">50</option></select>' +
      '<span id="demoPdPickerPageInfo">共1页</span>' +
      '<button type="button" id="demoPdPickerFirst" title="首页">«</button>' +
      '<button type="button" id="demoPdPickerPrev" title="上一页">‹</button>' +
      '<span>第 <input type="text" id="demoPdPickerPageInp" value="1" style="width:36px;height:26px;text-align:center;border:1px solid #d9d9d9;border-radius:4px" /> 页</span>' +
      '<button type="button" id="demoPdPickerNext" title="下一页">›</button>' +
      '<button type="button" id="demoPdPickerLast" title="末页">»</button>' +
      '<button type="button" id="demoPdPickerGo">GO</button>' +
      "</div></div></div></div>" +
      '<div class="pd-pick-actions"><button type="button" class="pd-pick-btn" id="demoPdPickerCancel">取消</button><button type="button" class="pd-pick-btn primary" id="demoPdPickerOk">确定</button></div>' +
      "</div>";
    document.body.appendChild(mask);
    bindMaskEvents(mask);
    return mask;
  }

  var state = {
    title: "选择产品",
    mode: "single",
    listType: "product",
    products: [],
    contractMaterials: [],
    contractLabel: "",
    treeFilter: "",
    search: "",
    selTree: { big: "", mid: "", small: "" },
    page: 1,
    pageSize: 20,
    pending: {},
    pendingSingle: null,
    onConfirm: null,
    lockedIds: {}
  };

  function isLockedPid(pid) {
    return !!(state.lockedIds && state.lockedIds[String(pid)]);
  }

  function bindMaskEvents(mask) {
    if (mask.getAttribute("data-pd-pick-bound") === "1") return;
    mask.setAttribute("data-pd-pick-bound", "1");

    mask.addEventListener("click", function (e) {
      if (e.target === mask) close();
    });
    document.getElementById("demoPdPickerClose").addEventListener("click", close);
    document.getElementById("demoPdPickerCancel").addEventListener("click", close);
    document.getElementById("demoPdPickerOk").addEventListener("click", function () {
      var picked = [];
      if (state.mode === "single") {
        if (state.pendingSingle) picked.push(state.pendingSingle);
      } else {
        Object.keys(state.pending).forEach(function (k) {
          if (state.pending[k]) picked.push(state.pending[k]);
        });
      }
      var cb = state.onConfirm;
      close();
      if (typeof cb === "function") cb(picked);
    });

    document.getElementById("demoPdPickerTreeQ").addEventListener("input", function () {
      state.treeFilter = String(this.value || "").trim().toLowerCase();
      renderTree();
    });
    document.getElementById("demoPdPickerSearch").addEventListener("input", function () {
      state.search = String(this.value || "").trim().toLowerCase();
      state.page = 1;
      renderTable();
    });
    document.getElementById("demoPdPickerPageSize").addEventListener("change", function () {
      state.pageSize = Math.max(1, Number(this.value) || 20);
      state.page = 1;
      renderTable();
    });
    ["demoPdPickerFirst", "demoPdPickerPrev", "demoPdPickerNext", "demoPdPickerLast", "demoPdPickerGo"].forEach(function (id) {
      document.getElementById(id).addEventListener("click", function () {
        var all = filteredProducts();
        var totalPages = Math.max(1, Math.ceil(all.length / state.pageSize) || 1);
        if (id === "demoPdPickerFirst") state.page = 1;
        else if (id === "demoPdPickerPrev") state.page = Math.max(1, state.page - 1);
        else if (id === "demoPdPickerNext") state.page = Math.min(totalPages, state.page + 1);
        else if (id === "demoPdPickerLast") state.page = totalPages;
        else {
          var inp = document.getElementById("demoPdPickerPageInp");
          state.page = Math.max(1, Math.min(totalPages, Number(inp && inp.value) || 1));
        }
        renderTable();
      });
    });

    document.getElementById("demoPdPickerTbody").addEventListener("click", function (e) {
      var tr = e.target.closest ? e.target.closest("tr[data-pid]") : null;
      if (!tr) return;
      var pid = tr.getAttribute("data-pid");
      var p = null;
      if (isContractList()) {
        p = (state.contractMaterials || []).find(function (x) {
          return rowKey(x) === String(pid);
        });
      } else {
        p = state.products.find(function (x) {
          return String(x.id) === String(pid);
        });
      }
      if (!p) return;
      if (isLockedPid(pid)) return;
      if (state.mode === "single" && !isContractList()) {
        state.pendingSingle = p;
        renderTable();
      } else {
        var chk = e.target.closest ? e.target.closest('input[type="checkbox"]') : null;
        if (chk) {
          if (chk.checked) state.pending[pid] = p;
          else delete state.pending[pid];
          tr.classList.toggle("is-checked", chk.checked);
        } else {
          var on = !state.pending[pid];
          if (on) state.pending[pid] = p;
          else delete state.pending[pid];
          renderTable();
        }
      }
    });

    document.getElementById("demoPdPickerTree").addEventListener("click", function (e) {
      var tgl = e.target.closest ? e.target.closest("[data-pd-tgl]") : null;
      if (tgl) {
        e.stopPropagation();
        var tree = D.getClassTree();
        var kind = tgl.getAttribute("data-pd-tgl");
        var code = tgl.getAttribute("data-code");
        var big = tgl.getAttribute("data-big");
        if (kind === "big") {
          var b = tree.find(function (x) {
            return x.code === code;
          });
          if (b) b.open = !b.open;
        } else if (kind === "mid" && big) {
          var b2 = tree.find(function (x) {
            return x.code === big;
          });
          if (b2) {
            var m = (b2.children || []).find(function (x) {
              return x.code === code;
            });
            if (m) m.open = !m.open;
          }
        }
        renderTree();
        return;
      }
      var row = e.target.closest ? e.target.closest("[data-pd-sel]") : null;
      if (!row) return;
      var selKind = row.getAttribute("data-pd-sel");
      if (selKind === "small") {
        state.selTree = {
          big: row.getAttribute("data-big") || "",
          mid: row.getAttribute("data-mid") || "",
          small: row.getAttribute("data-code") || ""
        };
        state.page = 1;
        renderTree();
        renderTable();
        return;
      }
      if (isContractList() && (selKind === "big" || selKind === "mid")) {
        state.selTree =
          selKind === "big"
            ? { big: row.getAttribute("data-code") || "", mid: "", small: "" }
            : {
                big: row.getAttribute("data-big") || "",
                mid: row.getAttribute("data-code") || "",
                small: ""
              };
        state.page = 1;
        renderTree();
        renderTable();
      }
    });
  }

  function close() {
    var mask = document.getElementById("demoPdPickerMask");
    if (mask) {
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }
    state.onConfirm = null;
  }

  function treeMatchesFilter(label) {
    if (!state.treeFilter) return true;
    return String(label || "").toLowerCase().indexOf(state.treeFilter) >= 0;
  }

  function renderTree() {
    var el = document.getElementById("demoPdPickerTree");
    if (!el || !D) return;
    var tree = D.getClassTree();
    var html = "";
    tree.forEach(function (b) {
      var bLabel = b.code + b.name;
      var bShow = treeMatchesFilter(bLabel);
      var midHtml = "";
      (b.children || []).forEach(function (m) {
        var mLabel = m.code + m.name;
        var mShow = treeMatchesFilter(mLabel) || treeMatchesFilter(bLabel);
        var smallHtml = "";
        (m.children || []).forEach(function (s) {
          var sLabel = s.code + s.name + (s.a || "");
          var sShow = treeMatchesFilter(sLabel) || mShow;
          if (!sShow && state.treeFilter) return;
          mShow = true;
          bShow = true;
          var active =
            state.selTree.big === b.code && state.selTree.mid === m.code && state.selTree.small === s.code;
          smallHtml +=
            '<button type="button" class="pd-pick-tree-row' +
            (active ? " is-active" : "") +
            '" data-pd-sel="small" data-big="' +
            esc(b.code) +
            '" data-mid="' +
            esc(m.code) +
            '" data-code="' +
            esc(s.code) +
            '" style="padding-left:42px">' +
            esc(s.code + s.name) +
            "</button>";
        });
        if (!mShow && state.treeFilter && !smallHtml) return;
        midHtml +=
          '<div style="display:flex;align-items:center;gap:4px;padding-left:18px">' +
          '<button type="button" class="pd-pick-tree-toggle" data-pd-tgl="mid" data-big="' +
          esc(b.code) +
          '" data-code="' +
          esc(m.code) +
          '">' +
          (m.open ? "▾" : "▸") +
          "</button>" +
          '<span style="font-size:13px;cursor:pointer' +
          (isContractList() && state.selTree.big === b.code && state.selTree.mid === m.code && !state.selTree.small
            ? ";color:#1677ff;font-weight:600"
            : "") +
          '" data-pd-sel="mid" data-big="' +
          esc(b.code) +
          '" data-code="' +
          esc(m.code) +
          '">' +
          esc(m.code + m.name) +
          "</span></div>" +
          '<div style="display:' +
          (m.open ? "block" : "none") +
          '">' +
          smallHtml +
          "</div>";
      });
      if (!bShow && state.treeFilter && !midHtml) return;
      html +=
        '<div style="display:flex;align-items:center;gap:4px;padding:4px 8px">' +
        '<button type="button" class="pd-pick-tree-toggle" data-pd-tgl="big" data-code="' +
        esc(b.code) +
        '">' +
        (b.open ? "▾" : "▸") +
        "</button>" +
        '<span style="font-size:13px;font-weight:600;cursor:pointer' +
        (isContractList() && state.selTree.big === b.code && !state.selTree.mid && !state.selTree.small
          ? ";color:#1677ff"
          : "") +
        '" data-pd-sel="big" data-code="' +
        esc(b.code) +
        '">' +
        esc(b.code + b.name) +
        "</span></div>" +
        '<div style="display:' +
        (b.open ? "block" : "none") +
        '">' +
        midHtml +
        "</div>";
    });
    el.innerHTML = html || '<p style="padding:12px;color:#94a3b8;font-size:12px">无匹配类型</p>';
  }

  function isContractList() {
    return state.listType === "contractMaterials";
  }

  function rowKey(row) {
    return String((row && row.id) || "");
  }

  function contractRowMatchesTree(r) {
    var sel = state.selTree;
    if (!sel || !sel.big) return true;
    var tc = String((r && r.typeCode) || "");
    if (sel.small) {
      var sm = D.findSmall(sel.big, sel.mid, sel.small);
      if (sm && sm.a) return tc === sm.a;
    } else if (sel.mid) {
      return tc.indexOf(String(sel.big) + String(sel.mid)) === 0;
    } else {
      return tc.indexOf(String(sel.big)) === 0;
    }
    return true;
  }

  function filteredRows() {
    if (isContractList()) {
      var list = (state.contractMaterials || []).filter(contractRowMatchesTree);
      var q = state.search;
      if (!q) return list;
      return list.filter(function (r) {
        var hay = [r.name, r.spec, r.category, r.typeCode, r.unitPrice, r.qty, r.tax, r.remark]
          .join(" ")
          .toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    }
    var list = state.products || [];
    var st = state.selTree;
    if (st && st.small) {
      list = list.filter(function (p) {
        return p.treeBig === st.big && p.treeMid === st.mid && p.treeSmall === st.small;
      });
    }
    var q = state.search;
    if (!q) return list;
    return list.filter(function (p) {
      var hay = [p.b, p.a, p.productName, p.mfrName, p.model, p.category, p.typeName].join(" ").toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function renderThead() {
    var tr = document.getElementById("demoPdPickerThead");
    if (!tr) return;
    if (isContractList()) {
      tr.innerHTML =
        '<th style="width:40px"><input type="checkbox" id="demoPdPickerChkAll" title="全选本页" /></th>' +
        "<th>产品名称</th><th>产品编码</th><th>产品型号</th><th>物资类别</th><th>物资类型名称</th><th>物资类型编码</th><th>采购单价(含税)</th><th>采购数量</th><th>税率%</th><th>备注</th>";
      return;
    }
    if (state.mode === "single") {
      tr.innerHTML =
        '<th style="width:40px"></th><th>产品名称</th><th>产品编码</th><th>制造商</th><th>产品型号</th><th>物资类型编码</th><th>物资类别</th>';
    } else {
      tr.innerHTML =
        '<th style="width:40px"><input type="checkbox" id="demoPdPickerChkAll" title="全选本页" /></th><th>产品名称</th><th>产品编码</th><th>制造商</th><th>产品型号</th><th>物资类型编码</th><th>物资类别</th>';
    }
  }

  function renderTable() {
    renderThead();
    var tbody = document.getElementById("demoPdPickerTbody");
    if (!tbody) return;
    var all = filteredRows();
    var pageSize = Math.max(1, state.pageSize || 20);
    var totalPages = Math.max(1, Math.ceil(all.length / pageSize) || 1);
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * pageSize;
    var pageRows = all.slice(start, start + pageSize);

    if (isContractList()) {
      tbody.innerHTML = pageRows
        .map(function (r) {
          var id = rowKey(r);
          var checked = !!state.pending[id];
          return (
            '<tr data-pid="' +
            esc(id) +
            '"' +
            (checked ? ' class="is-checked"' : "") +
            '><td><input type="checkbox"' +
            (checked ? " checked" : "") +
            " /></td><td>" +
            esc(r.name || "") +
            "</td><td>" +
            esc(r.productCode || "") +
            "</td><td>" +
            esc(r.spec || "") +
            "</td><td>" +
            esc(r.category || "") +
            "</td><td>" +
            esc(r.typeName || "") +
            "</td><td>" +
            esc(r.typeCode || "") +
            "</td><td>" +
            esc(r.unitPrice != null ? r.unitPrice : "") +
            "</td><td>" +
            esc(r.qty != null ? r.qty : "") +
            "</td><td>" +
            esc(r.tax != null ? r.tax : "") +
            "</td><td>" +
            esc(r.remark != null ? r.remark : "") +
            "</td></tr>"
          );
        })
        .join("");
    } else if (state.mode === "single") {
      tbody.innerHTML = pageRows
        .map(function (p) {
          var checked = state.pendingSingle && String(state.pendingSingle.id) === String(p.id);
          return (
            '<tr data-pid="' +
            esc(p.id) +
            '"' +
            (checked ? ' class="is-checked"' : "") +
            "><td><input type=\"radio\" name=\"pdPickRadio\"" +
            (checked ? " checked" : "") +
            " /></td><td>" +
            esc(p.productName) +
            "</td><td>" +
            esc(p.b) +
            "</td><td>" +
            esc(p.mfrName) +
            "</td><td>" +
            esc(p.model) +
            "</td><td>" +
            esc(p.a) +
            "</td><td>" +
            esc(p.category) +
            "</td></tr>"
          );
        })
        .join("");
    } else {
      tbody.innerHTML = pageRows
        .map(function (p) {
          var locked = isLockedPid(p.id);
          var checked = locked || !!state.pending[p.id];
          var cls = checked ? "is-checked" : "";
          if (locked) cls = (cls ? cls + " " : "") + "is-locked";
          return (
            '<tr data-pid="' +
            esc(p.id) +
            '"' +
            (cls ? ' class="' + cls + '"' : "") +
            '><td><input type="checkbox"' +
            (checked ? " checked" : "") +
            (locked ? " disabled" : "") +
            " /></td><td>" +
            esc(p.productName) +
            "</td><td>" +
            esc(p.b) +
            "</td><td>" +
            esc(p.mfrName) +
            "</td><td>" +
            esc(p.model) +
            "</td><td>" +
            esc(p.a) +
            "</td><td>" +
            esc(p.category) +
            "</td></tr>"
          );
        })
        .join("");
    }

    if (!isContractList() || state.mode === "multi" || isContractList()) {
      var chkAll = document.getElementById("demoPdPickerChkAll");
      if (chkAll && (state.mode === "multi" || isContractList())) {
        chkAll.onchange = function () {
          var on = chkAll.checked;
          pageRows.forEach(function (p) {
            var k = isContractList() ? rowKey(p) : p.id;
            if (isLockedPid(k)) return;
            if (on) state.pending[k] = p;
            else delete state.pending[k];
          });
          renderTable();
        };
        var selectable = pageRows.filter(function (p) {
          var k = isContractList() ? rowKey(p) : p.id;
          return !isLockedPid(k);
        });
        var allOn =
          selectable.length > 0 &&
          selectable.every(function (p) {
            var k = isContractList() ? rowKey(p) : p.id;
            return !!state.pending[k];
          });
        chkAll.checked = allOn;
        chkAll.indeterminate =
          !allOn &&
          selectable.some(function (p) {
            var k = isContractList() ? rowKey(p) : p.id;
            return !!state.pending[k];
          });
      }
    }

    if (!pageRows.length) {
      tbody.innerHTML =
        '<tr><td colspan="9" style="padding:24px;text-align:center;color:#94a3b8">' +
        (isContractList() ? "该合同暂无物资明细" : "暂无产品，请调整左侧类型或搜索条件") +
        "</td></tr>";
    }
    var countEl = document.getElementById("demoPdPickerCount");
    if (countEl) countEl.textContent = "每页显示 " + pageSize + " 条 / 共 " + all.length + " 条记录";
    var pageInfo = document.getElementById("demoPdPickerPageInfo");
    if (pageInfo) pageInfo.textContent = "共 " + totalPages + " 页";
    var pageInp = document.getElementById("demoPdPickerPageInp");
    if (pageInp) pageInp.value = String(state.page);
    ["demoPdPickerFirst", "demoPdPickerPrev"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.disabled = state.page <= 1;
    });
    ["demoPdPickerNext", "demoPdPickerLast"].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.disabled = state.page >= totalPages;
    });
  }

  function open(cfg) {
    if (!D) return;
    cfg = cfg || {};
    D.ensureDemoProducts();
    ensureMask();
    state.listType = cfg.listType === "contractMaterials" ? "contractMaterials" : "product";
    state.title = cfg.title || (state.listType === "contractMaterials" ? "选择物资" : "选择产品");
    state.mode = cfg.mode === "multi" ? "multi" : "single";
    state.products = Array.isArray(cfg.products) ? cfg.products.slice() : D.flattenAllProducts();
    state.contractMaterials = Array.isArray(cfg.contractMaterials) ? cfg.contractMaterials.slice() : [];
    state.contractLabel = cfg.contractLabel || "";
    state.treeFilter = "";
    state.search = "";
    state.page = 1;
    state.pageSize = 20;
    state.pending = {};
    state.pendingSingle = null;
    state.onConfirm = cfg.onConfirm || null;
    state.lockedIds = {};
    (cfg.lockedProductIds || []).forEach(function (id) {
      if (id != null && id !== "") state.lockedIds[String(id)] = true;
    });
    state.selTree = { big: "", mid: "", small: "" };
    if (cfg.initialProducts && cfg.initialProducts.length) {
      if (state.mode === "single") state.pendingSingle = cfg.initialProducts[0];
      else {
        cfg.initialProducts.forEach(function (p) {
          if (p && p.id) state.pending[p.id] = p;
        });
      }
    }
    document.getElementById("demoPdPickerTitle").textContent = state.title;
    var tq = document.getElementById("demoPdPickerTreeQ");
    var sq = document.getElementById("demoPdPickerSearch");
    if (tq) tq.value = "";
    if (sq) {
      sq.value = "";
      sq.placeholder =
        state.listType === "contractMaterials"
          ? "搜索产品名称、物资类型或类型编码"
          : "搜索产品编码/名称/制造商/产品型号";
    }
    var mask = document.getElementById("demoPdPickerMask");
    var sideHd = document.getElementById("demoPdPickerSideHd");
    var contractHint = document.getElementById("demoPdPickerContractHint");
    var side = document.querySelector(".pd-pick-side");
    if (side) side.style.display = state.listType === "contractMaterials" ? "none" : "";
    if (sideHd) {
      sideHd.textContent = state.listType === "contractMaterials" ? "产品目录 · 物资类型" : "物资类型";
    }
    if (contractHint) {
      if (state.listType === "contractMaterials") {
        contractHint.hidden = false;
        contractHint.innerHTML =
          (state.contractLabel ? "<strong>当前合同：</strong>" + esc(state.contractLabel) + "<br/>" : "") +
          "左侧按产品目录类型筛选；右侧为合同物资明细。";
      } else {
        contractHint.hidden = true;
        contractHint.innerHTML = "";
      }
    }
    if (state.listType === "contractMaterials") {
      state.mode = "multi";
      state.selTree = { big: "", mid: "", small: "" };
    }
    var tree = D.getClassTree();
    if (tree[0]) {
      tree[0].open = true;
      var c0 = (tree[0].children || [])[0];
      if (c0) {
        c0.open = true;
        if (!isContractList()) {
          var s0 = (c0.children || [])[0];
          if (s0) state.selTree = { big: tree[0].code, mid: c0.code, small: s0.code };
        }
      }
    }
    renderTree();
    renderTable();
    mask.classList.add("show");
    mask.setAttribute("aria-hidden", "false");
  }

  global.DemoProductCatalogPicker = { open: open, close: close };
})(typeof window !== "undefined" ? window : this);
