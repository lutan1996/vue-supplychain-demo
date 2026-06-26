/**
 * 物资类型编码（A码）：A + 3位大类 + 3位中类 + 4位小类（共 11 位）
 * 产品编码（B码）：B + 8 位流水（00000001 起递增）
 * 物资唯一码：C + 11 位流水
 * 仅被：合同信息管理、库存管理、物资领用 等页引用
 */
(function (global) {
  var TYPE_A_BY_NAME = {
    风力发电机组整机: "A0100100001",
    智能风机控制器: "A0100100001",
    机舱: "A0100100002",
    机舱温控模块: "A0100100002",
    叶片: "A0100200001",
    风机叶片: "A0100200001",
    变桨轴承: "A0100300001",
    变流器: "A0100100001",
    变流器模块: "A0100100001",
    变流器散热组件: "A0100100001",
    齿轮箱: "A0100100002",
    主轴轴承: "A0100100002",
    支架组件: "A0100100002",
    高压配电柜: "A0100100002",
    IGBT驱动板: "A0100100002",
    IGBT散热模组: "A0100100002",
    预制连接子: "A0100200001",
    汇流箱: "A0100200001",
    工业级交换机: "A0200100001",
    交换机: "A0200100001",
    主控信号采集单元: "A0200100001",
    移动式检修电源: "A0200100001",
    防雷监测终端: "A0200100001",
    箱变状态采集器: "A0200100001",
    场站通信网关: "A0200100001",
    功率调节执行器: "A0200100001",
    电能质量分析仪: "A0200100001",
    远程维护工控机: "A0200100001",
    继电保护测试仪: "A0200100001",
    电缆: "A0400100001",
    服务器: "A0200100001",
    CPU服务器: "A0200100001",
    GPU服务器: "A0200100001"
  };

  var DEFAULT_A = "A0100100001";

  function cleanRaw(v) {
    return String(v == null ? "" : v)
      .toUpperCase()
      .replace(/[‐‑‒–—]/g, "-")
      .replace(/[^A-Z0-9-]/g, "")
      .trim();
  }

  function digitSeg(s, len) {
    return String(s || "")
      .replace(/\D/g, "")
      .padStart(len, "0")
      .slice(-len);
  }

  function buildACode(majorPart, mediumPart, smallPart) {
    return (
      "A" +
      digitSeg(majorPart, 3) +
      digitSeg(mediumPart, 3) +
      digitSeg(smallPart, 4)
    );
  }

  function migrateACode8(s) {
    var x = cleanRaw(s);
    if (!/^A\d{8}$/.test(x)) return x;
    var d = x.slice(1);
    return buildACode(d.slice(0, 2), d.slice(2, 4), d.slice(4, 7));
  }

  /** 旧版 A+7 位数字（如 A0101001 = 大类2+中类2+小类3）→ A+3+3+4 */
  function migrateACode7(s) {
    var x = cleanRaw(s);
    if (!/^A\d{7}$/.test(x)) return x;
    var d = x.slice(1);
    return buildACode(d.slice(0, 2) + "0", d.slice(2, 4) + "0", d.slice(4, 7));
  }

  function isTypeACode(s) {
    return /^A\d{10}$/.test(cleanRaw(s));
  }

  function isMaterialBCode(s) {
    return /^B\d{8}$/.test(cleanRaw(s));
  }

  function isDeviceCCode(s) {
    return /^C\d{11}$/.test(cleanRaw(s));
  }

  function materialTypeCode(category, name) {
    var n = String(name || "").trim();
    if (TYPE_A_BY_NAME[n]) return TYPE_A_BY_NAME[n];
    return DEFAULT_A;
  }

  function materialInstanceCode(typeCode, seq) {
    var n = Math.max(1, parseInt(seq, 10) || 1);
    return "B" + String(n).padStart(8, "0");
  }

  function deviceUniqueCode(seq) {
    var n = Math.max(1, Number(seq) || 1);
    return "C" + String(n).padStart(11, "0");
  }

  function parseTypeCode(code) {
    var s = cleanRaw(code);
    if (isTypeACode(s)) return s;
    if (/^A\d{7}$/.test(s)) return migrateACode7(s);
    if (/^A\d{8}$/.test(s)) return migrateACode8(s);
    var m = s.match(/^(A\d{10})/);
    if (m) return m[1];
    var m8 = s.match(/^(A\d{8})/);
    if (m8) return migrateACode8(m8[1]);
    var m7 = s.match(/^(A\d{7})/);
    if (m7) return migrateACode7(m7[1]);
    return DEFAULT_A;
  }

  function normalizeProductRecord(p) {
    if (!p || typeof p !== "object") return p;
    var out = p;
    var a = p.a != null ? String(p.a).trim() : "";
    var b = p.b != null ? String(p.b).trim() : "";
    var na = a ? parseTypeCode(a) : "";
    var nb = b ? parseInstanceCode(b) : "";
    if (na !== a || nb !== b) {
      out = Object.assign({}, p);
      if (a) out.a = na;
      if (b) out.b = nb;
    }
    return out;
  }

  function migrateBCode7(s) {
    var x = cleanRaw(s);
    if (!/^B\d{7}$/.test(x)) return x;
    return "B" + x.slice(1).padStart(8, "0");
  }

  function parseInstanceCode(code) {
    var s = cleanRaw(code);
    if (isMaterialBCode(s)) return s;
    if (/^B\d{7}$/.test(s)) return migrateBCode7(s);
    var m = s.match(/^(B\d{8})/);
    if (m) return m[1];
    if (isTypeACode(s) || /^A\d{8}$/.test(s)) return materialInstanceCode(parseTypeCode(s), 1);
    return materialInstanceCode(DEFAULT_A, 1);
  }

  function instanceCodeWithOffset(baseInstanceCode, offset) {
    var s = parseInstanceCode(baseInstanceCode);
    if (!/^B\d{8}$/.test(s)) return s;
    var n = parseInt(s.slice(1), 10) || 0;
    var next = n + (Number(offset) || 0);
    return "B" + String(Math.max(1, next)).padStart(8, "0");
  }

  function parseDeviceCode(code) {
    var s = cleanRaw(code);
    if (isDeviceCCode(s)) return s;
    if (/^C\d{1,10}$/.test(s)) return "C" + s.slice(1).padStart(11, "0");
    var m = s.match(/^C(\d{11})/);
    if (m) return "C" + m[1];
    return deviceUniqueCode(1);
  }

  global.MaterialCodeScheme = {
    TYPE_A_BY_NAME: TYPE_A_BY_NAME,
    DEFAULT_A: DEFAULT_A,
    buildACode: buildACode,
    materialTypeCode: materialTypeCode,
    materialInstanceCode: materialInstanceCode,
    deviceUniqueCode: deviceUniqueCode,
    parseTypeCode: parseTypeCode,
    parseInstanceCode: parseInstanceCode,
    parseDeviceCode: parseDeviceCode,
    instanceCodeWithOffset: instanceCodeWithOffset,
    isTypeACode: isTypeACode,
    isMaterialBCode: isMaterialBCode,
    isDeviceCCode: isDeviceCCode,
    migrateACode8: migrateACode8,
    migrateACode7: migrateACode7,
    migrateBCode7: migrateBCode7,
    normalizeProductRecord: normalizeProductRecord
  };
})(typeof window !== "undefined" ? window : this);
