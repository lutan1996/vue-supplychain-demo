/**
 * 基础数据 · 制造商数据（localStorage，供制造商数据页与产品目录下拉共用）
 */
(function (global) {
  var STORAGE = "map-demo-manufacturers-v1";
  var DEFAULTS = [
    { id: "MFR-0001", code: "MFR-0001", name: "金风科技", uscc: "911100007109302832", type: "整机制造商", contact: "赵敏", phone: "13800004444", address: "北京", source: "国产", status: "正常合作", remark: "整机供货" },
    { id: "MFR-0002", code: "MFR-0002", name: "远景能源", uscc: "91310000MA1FL5A01X", type: "整机制造商", contact: "王磊", phone: "13800003333", address: "上海", source: "国产", status: "正常合作", remark: "机舱供货" },
    { id: "MFR-0003", code: "MFR-0003", name: "明阳智能", uscc: "91442000MA4UM9X52L", type: "整机制造商", contact: "冯强", phone: "13800009999", address: "中山", source: "国产", status: "正常合作", remark: "叶片" },
    { id: "MFR-0004", code: "MFR-0004", name: "中车电气", uscc: "91430100MA4L2K8X2H", type: "零部件制造商", contact: "周婷", phone: "13800006666", address: "株洲", source: "国产", status: "正常合作", remark: "变流器" },
    { id: "MFR-0005", code: "MFR-0005", name: "联合动力", uscc: "91110108700067234R", type: "零部件制造商", contact: "吴刚", phone: "13800007777", address: "北京", source: "合资", status: "暂停合作", remark: "齿轮箱" },
    { id: "MFR-0006", code: "MFR-0006", name: "中材科技", uscc: "91320500608296912X", type: "零部件制造商", contact: "钱芳", phone: "13800010001", address: "南京", source: "国产", status: "正常合作", remark: "叶片材料" },
    { id: "MFR-0007", code: "MFR-0007", name: "西门子歌美飒", uscc: "DE1234567890123", type: "整机制造商", contact: "Hans", phone: "13800010002", address: "天津", source: "进口", status: "正常合作", remark: "进口整机" },
    { id: "MFR-0008", code: "MFR-0008", name: "维斯塔斯", uscc: "DK9876543210987", type: "整机制造商", contact: "Anna", phone: "13800010003", address: "天津", source: "进口", status: "正常合作", remark: "进口部件" },
    { id: "MFR-0009", code: "MFR-0009", name: "大华", uscc: "91330108304666302B", type: "系统集成", contact: "陈达", phone: "13800001111", address: "杭州", source: "国产", status: "正常合作", remark: "监控系统" },
    { id: "MFR-0010", code: "MFR-0010", name: "宁德时代", uscc: "91350900MA2YH9KX3A", type: "零部件制造商", contact: "钱芳", phone: "13800010000", address: "宁德", source: "国产", status: "正常合作", remark: "储能电池" }
  ];

  function load() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (eLoad) {}
    return DEFAULTS.map(function (r) {
      return Object.assign({}, r);
    });
  }

  function save(list) {
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE, JSON.stringify(list || []));
    } catch (eSave) {}
  }

  function ensureSeeded() {
    try {
      if (!global.localStorage.getItem(STORAGE)) save(load());
    } catch (eSeed) {}
  }

  function findByName(name) {
    var key = String(name || "").trim();
    if (!key) return null;
    var list = load();
    var i;
    for (i = 0; i < list.length; i++) {
      if (String(list[i].name || "") === key) return list[i];
    }
    return null;
  }

  function ddRows() {
    return load().map(function (r) {
      return {
        value: String(r.name || ""),
        c1: String(r.code || r.id || ""),
        c2: String(r.name || ""),
        source: String(r.source || "")
      };
    });
  }

  global.DemoManufacturerData = {
    STORAGE: STORAGE,
    DEFAULTS: DEFAULTS,
    load: load,
    save: save,
    ensureSeeded: ensureSeeded,
    findByName: findByName,
    ddRows: ddRows
  };
})(typeof window !== "undefined" ? window : globalThis);
