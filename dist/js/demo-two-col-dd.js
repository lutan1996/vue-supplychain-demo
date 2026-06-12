/**
 * 双列表格下拉（搜索 + 表头 + 行），样式对齐入库审批单「选择合同」。
 */
(function (global) {
  var STYLE_ID = "demo-two-col-dd-style";

  function ensureStyle() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent =
      ".pl-dd{position:relative;width:100%}" +
      ".pl-dd__btn{display:block;width:100%;height:36px;line-height:34px;text-align:left;font-family:inherit;font-size:13px;color:#262626;cursor:pointer;box-sizing:border-box;border:1px solid #e9ecef;border-radius:8px;padding:0 10px;background:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".pl-dd__btn:focus{border-color:#1890ff;box-shadow:0 0 0 2px rgba(24,144,255,.12);outline:none}" +
      ".pl-dd__panel{position:absolute;left:0;right:0;top:calc(100% + 2px);z-index:5000;margin:0;padding:0;background:#fff;border:1px solid #d9d9d9;border-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,.12);box-sizing:border-box;width:100%;max-width:100%;overflow:hidden}" +
      ".pl-dd__search{padding:6px 8px;border-bottom:1px solid #e8eef5;background:#fafbfd}" +
      ".pl-dd__search-inp{width:100%;height:26px;box-sizing:border-box;border:1px solid #d9d9d9;border-radius:4px;padding:0 6px;font-size:12px;font-family:inherit;outline:none}" +
      ".pl-dd__search-inp:focus{border-color:#1890ff;box-shadow:0 0 0 2px rgba(24,144,255,.12)}" +
      ".pl-dd__list{max-height:200px;overflow-y:auto;overflow-x:hidden}" +
      ".pl-dd__grid-head,.pl-dd__row{display:grid;grid-template-columns:minmax(0,42%) minmax(0,58%);column-gap:6px;align-items:start}" +
      ".pl-dd--3col .pl-dd__grid-head,.pl-dd--3col .pl-dd__row{grid-template-columns:minmax(0,34%) minmax(0,30%) minmax(0,36%)}" +
      ".pl-dd__grid-head{position:sticky;top:0;z-index:1;background:#f5f7fa;color:#64748b;font-weight:600;font-size:11px;line-height:1.35;padding:4px 6px;border-bottom:1px solid #e8eef5}" +
      ".pl-dd__grid-head span{min-width:0;word-break:break-all}" +
      ".pl-dd__row{padding:4px 6px;border-bottom:1px solid #f0f2f5;font-size:11px;line-height:1.35;color:#262626;cursor:pointer}" +
      ".pl-dd__row span{min-width:0;word-break:break-all;display:block}" +
      ".pl-dd__row:hover{background:#f0f7ff}" +
      ".pl-dd__row--ph{display:block;color:#94a3b8;font-size:11px;padding:6px}";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function btnLabelFromRows(rows, value, fallback) {
    if (!value) return fallback || "请选择";
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].value || "") === String(value)) {
        var c1 = rows[i].c1 || "";
        var c2 = rows[i].c2 || "";
        if (c1 && c2) return c1 + "  " + c2;
        return c2 || c1 || fallback || "请选择";
      }
    }
    return fallback || "请选择";
  }

  /**
   * @param {Object} cfg
   * @param {HTMLElement} cfg.root
   * @param {HTMLInputElement} cfg.hiddenInput
   * @param {string} [cfg.placeholder]
   * @param {string} [cfg.searchPlaceholder]
   * @param {string} [cfg.col1]
   * @param {string} [cfg.col2]
   * @param {string} [cfg.col3] 可选第三列（插在 col1 与 col2 之间展示）
   * @param {Array<{value:string,c1:string,c2:string,c3?:string,placeholder?:boolean}>} cfg.rows
   * @param {Function} [cfg.onChange]
   */
  function mount(cfg) {
    ensureStyle();
    var root = cfg.root;
    var hidden = cfg.hiddenInput;
    if (!root || !hidden) return null;

    var rows = Array.isArray(cfg.rows) ? cfg.rows.slice() : [];
    var placeholder = cfg.placeholder || "请选择";
    var searchPh = cfg.searchPlaceholder || "搜索物资类型编码或名称";
    var h1 = cfg.col1 || "物资类型编码";
    var h2 = cfg.col2 || "物资名称";
    var h3 = cfg.col3 || "";
    var threeCol = !!String(h3 || "").trim();

    root.innerHTML = "";
    root.className = threeCol ? "pl-dd pl-dd--3col" : "pl-dd";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pl-dd__btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = btnLabelFromRows(rows, hidden.value, placeholder);

    var panel = document.createElement("div");
    panel.className = "pl-dd__panel";
    panel.hidden = true;
    panel.innerHTML =
      '<div class="pl-dd__search"><input type="text" class="pl-dd__search-inp" autocomplete="off" placeholder="' +
      esc(searchPh) +
      '" /></div>' +
      '<div class="pl-dd__list"><div class="pl-dd__grid-head">' +
      (threeCol
        ? "<span>" + esc(h1) + '</span><span>' + esc(h3) + '</span><span>' + esc(h2) + "</span>"
        : "<span>" + esc(h1) + '</span><span>' + esc(h2) + "</span>") +
      '</div><div class="pl-dd__tbody"></div></div>';

    root.appendChild(btn);
    root.appendChild(panel);

    var searchInp = panel.querySelector(".pl-dd__search-inp");
    var tbody = panel.querySelector(".pl-dd__tbody");

    function render(filterText) {
      var q = String(filterText || "")
        .trim()
        .toLowerCase();
      var items = [];
      rows.forEach(function (r) {
        if (r.placeholder) {
          items.push(
            '<div class="pl-dd__row pl-dd__row--ph pl-dd__tr" role="option" data-value="">' +
              esc(r.c2 || placeholder) +
              "</div>"
          );
          return;
        }
        var c1 = String(r.c1 || "");
        var c2 = String(r.c2 || "");
        var c3 = String(r.c3 || "");
        if (
          q &&
          c1.toLowerCase().indexOf(q) < 0 &&
          c2.toLowerCase().indexOf(q) < 0 &&
          (!threeCol || c3.toLowerCase().indexOf(q) < 0)
        )
          return;
        items.push(
          '<div class="pl-dd__row pl-dd__tr" role="option" data-value="' +
            esc(r.value) +
            '"><span class="pl-dd__c1">' +
            esc(c1) +
            "</span>" +
            (threeCol ? '<span class="pl-dd__c3">' + esc(c3) + "</span>" : "") +
            '<span class="pl-dd__c2">' +
            esc(c2) +
            "</span></div>"
        );
      });
      tbody.innerHTML = items.join("") || '<div class="pl-dd__row pl-dd__row--ph pl-dd__tr">无匹配结果</div>';
    }

    function closePanel() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (searchInp) searchInp.value = "";
      render("");
    }

    function setValue(val, silent) {
      hidden.value = val == null ? "" : String(val);
      btn.textContent = btnLabelFromRows(rows, hidden.value, placeholder);
      if (!silent) {
        try {
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {
          var ev = document.createEvent("Event");
          ev.initEvent("change", true, true);
          hidden.dispatchEvent(ev);
        }
        if (typeof cfg.onChange === "function") cfg.onChange(hidden.value);
      }
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (panel.hidden) {
        panel.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        render("");
        try {
          searchInp.focus();
        } catch (eF) {}
      } else {
        closePanel();
      }
    });

    searchInp.addEventListener("input", function () {
      render(searchInp.value);
    });

    tbody.addEventListener("click", function (e) {
      var tr = e.target && e.target.closest ? e.target.closest(".pl-dd__tr") : null;
      if (!tr || tr.classList.contains("pl-dd__row--ph")) return;
      e.preventDefault();
      setValue(tr.getAttribute("data-value") || "");
      closePanel();
    });

    function onDoc(ev) {
      if (!root.contains(ev.target)) closePanel();
    }
    document.addEventListener("click", onDoc);

    render("");
    btn.textContent = btnLabelFromRows(rows, hidden.value, placeholder);

    return {
      setValue: setValue,
      getValue: function () {
        return hidden.value;
      },
      destroy: function () {
        document.removeEventListener("click", onDoc);
        root.innerHTML = "";
      }
    };
  }

  global.DemoTwoColDd = { mount: mount, ensureStyle: ensureStyle };
})(typeof window !== "undefined" ? window : this);
