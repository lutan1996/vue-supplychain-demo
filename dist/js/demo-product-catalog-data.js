/**
 * 产品目录演示数据（与 data-code-fixed.html 共用 localStorage）
 */
(function (global) {
  var STORAGE_PRODUCTS = "map-demo-pd-products-v1";
  var STORAGE_BSEQ = "map-demo-pd-bseq-v1";
  var STORAGE_FEATURES = "map-demo-pd-features-v1";
  var STORAGE_CODE_SCHEMA = "map-demo-code-schema-v2";
  var STORAGE_SALES_MATERIAL_FIX = "map-demo-sales-material-fix-v1";

  var CLASS_TREE = [
    {
      code: "A01",
      name: "大型成套设备",
      open: true,
      children: [
        {
          code: "01",
          name: "风力发电机组",
          open: true,
          children: [
            {
              code: "001",
              name: "风力发电机组整机",
              a: "A0100100001",
              category: "生产类",
              def: "指风电机组整机，包含机舱、叶片、塔筒等整套机组设备。",
              typeCode: "001",
              features: [
                { key: "f1", name: "制造商名称", required: true },
                { key: "f2", name: "制造商型号", required: true },
                { key: "f3", name: "额定功率", required: true },
                { key: "f4", name: "叶轮直径", required: false }
              ]
            },
            {
              code: "002",
              name: "机舱",
              a: "A0100100002",
              category: "生产类",
              def: "不包含叶片、轮毂、塔筒。",
              typeCode: "002",
              features: [
                { key: "f1", name: "制造商名称", required: true },
                { key: "f2", name: "制造商型号", required: true }
              ]
            }
          ]
        },
        {
          code: "02",
          name: "叶片",
          open: false,
          children: [
            {
              code: "001",
              name: "叶片",
              a: "A0100200001",
              category: "生产类",
              def: "",
              typeCode: "001",
              features: [
                { key: "f1", name: "制造商名称", required: true },
                { key: "f2", name: "制造商型号", required: true }
              ]
            }
          ]
        }
      ]
    },
    { code: "A02", name: "小型设备", open: false, children: [] },
    { code: "A03", name: "工器具", open: false, children: [] },
    { code: "A04", name: "消防安防设备", open: false, children: [] }
  ];

  var PRODUCT_SEEDS = {
    "A01|01|001": [
      {
        id: "demo-1",
        b: "B00000001",
        a: "A0100100001",
        productName: "风力发电机组整机",
        mfrName: "金风科技",
        model: "GW66-1500",
        category: "生产类",
        stockQty: 2,
        refPrice: "410.00",
        features: {
          f1_name: "制造商名称",
          f1: "金风科技",
          f2_name: "制造商型号",
          f2: "GW66-1500",
          f3_name: "额定功率",
          f3: "1500kW",
          f4_name: "叶轮直径",
          f4: "66m"
        }
      },
      {
        id: "demo-2",
        b: "B00000002",
        a: "A0100100001",
        productName: "叶片",
        mfrName: "金风科技",
        model: "GW70-1500",
        category: "生产类",
        stockQty: 1,
        refPrice: "420.00",
        features: {
          f1_name: "制造商名称",
          f1: "金风科技",
          f2_name: "制造商型号",
          f2: "GW70-1500",
          f3_name: "额定功率",
          f3: "1500kW",
          f4_name: "叶轮直径",
          f4: "70.34m"
        }
      }
    ],
    "A01|01|002": [
      {
        id: "demo-c1",
        b: "B00000003",
        a: "A0100100002",
        productName: "机舱",
        mfrName: "中车电气",
        model: "JC-2.5MW",
        category: "生产类",
        stockQty: 5,
        refPrice: "88.00",
        features: {
          f1_name: "制造商名称",
          f1: "中车电气",
          f2_name: "制造商型号",
          f2: "JC-2.5MW",
          f3_name: "尺寸（长×宽×高，mm）",
          f3: "12000×4000×4000",
          f4_name: "重量（t）",
          f4: "85"
        }
      },
      {
        id: "demo-c2",
        b: "B00000004",
        a: "A0100100002",
        productName: "机舱",
        mfrName: "远景能源",
        model: "YJ-NAC-3.0",
        category: "生产类",
        stockQty: 3,
        refPrice: "92.00",
        features: {
          f1_name: "制造商名称",
          f1: "远景能源",
          f2_name: "制造商型号",
          f2: "YJ-NAC-3.0",
          f3_name: "尺寸（长×宽×高，mm）",
          f3: "13500×4200×4100",
          f4_name: "重量（t）",
          f4: "92"
        }
      }
    ],
    "A01|02|001": [
      {
        id: "demo-b1",
        b: "B00000005",
        a: "A0100200001",
        productName: "叶片",
        mfrName: "中材科技",
        model: "SW64-2.0",
        category: "生产类",
        stockQty: 8,
        refPrice: "35.00",
        features: {
          f1_name: "制造商名称",
          f1: "中材科技",
          f2_name: "制造商型号",
          f2: "SW64-2.0",
          f3_name: "叶片长度",
          f3: "64m",
          f4_name: "材质",
          f4: "玻璃纤维复合材料"
        }
      }
    ]
  };

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function catKey(big, mid, small) {
    return String(big) + "|" + String(mid) + "|" + String(small);
  }

  function migrateTreeACodes(nodes) {
    var MCS = global.MaterialCodeScheme;
    if (!MCS || !nodes || !nodes.length) return;
    nodes.forEach(function (n) {
      if (n.a) n.a = MCS.parseTypeCode(n.a);
      if (n.children && n.children.length) migrateTreeACodes(n.children);
    });
  }

  function migrateStoredProducts(allProducts) {
    var MCS = global.MaterialCodeScheme;
    if (!MCS || !allProducts) return false;
    var changed = false;
    Object.keys(allProducts).forEach(function (k) {
      var rows = allProducts[k];
      if (!rows || !rows.length) return;
      allProducts[k] = rows.map(function (p) {
        var np = MCS.normalizeProductRecord(p);
        if (np.b !== p.b || np.a !== p.a) changed = true;
        return np;
      });
    });
    return changed;
  }

  function migrateSalesMaterialDemoRows(allProducts) {
    if (!allProducts) return false;
    var changed = false;
    var key = "A01|01|001";
    var rows = allProducts[key];
    if (!Array.isArray(rows) || rows.length < 2) return false;
    var second = rows[1] || {};
    var marker = loadJson(STORAGE_SALES_MATERIAL_FIX, "");
    var shouldFix = marker !== "done";
    if (!shouldFix) shouldFix = String(second.productName || "").trim() !== "叶片";
    if (!shouldFix) shouldFix = String(second.b || "").trim() !== "B00000005";
    if (!shouldFix) shouldFix = String(second.a || "").trim() !== "A0100200001";
    if (!shouldFix) shouldFix = String(second.mfrName || "").trim() !== "中材科技";
    if (!shouldFix) shouldFix = String(second.model || "").trim() !== "SW64-2.0";
    if (!shouldFix) shouldFix = String(second.typeName || "").trim() !== "叶片";
    if (!shouldFix) return false;
    rows[1] = {
      id: "demo-b1",
      b: "B00000005",
      a: "A0100200001",
      productName: "叶片",
      typeName: "叶片",
      typeDef: "",
      mfrName: "中材科技",
      model: "SW64-2.0",
      category: "生产类",
      stockQty: 8,
      refPrice: "35.00",
      features: {
        f1_name: "制造商名称",
        f1: "中材科技",
        f2_name: "制造商型号",
        f2: "SW64-2.0",
        f3_name: "叶片长度",
        f3: "64m",
        f4_name: "材质",
        f4: "玻璃纤维复合材料"
      }
    };
    try {
      localStorage.setItem(STORAGE_SALES_MATERIAL_FIX, "done");
    } catch (eFlag) {}
    changed = true;
    return changed;
  }

  function ensureDemoProducts() {
    migrateTreeACodes(CLASS_TREE);
    var allProducts = loadJson(STORAGE_PRODUCTS, {});
    var changed = false;
    Object.keys(PRODUCT_SEEDS).forEach(function (k) {
      if (!allProducts[k] || !allProducts[k].length) {
        allProducts[k] = PRODUCT_SEEDS[k].slice();
        changed = true;
      }
    });
    if (migrateStoredProducts(allProducts)) changed = true;
    if (migrateSalesMaterialDemoRows(allProducts)) changed = true;
    try {
      if (localStorage.getItem(STORAGE_CODE_SCHEMA) !== "2") {
        localStorage.setItem(STORAGE_CODE_SCHEMA, "2");
        changed = true;
      }
    } catch (eSet) {}
    if (changed) saveJson(STORAGE_PRODUCTS, allProducts);
    var bseq = Number(loadJson(STORAGE_BSEQ, 0)) || 0;
    if (bseq < 6) saveJson(STORAGE_BSEQ, 6);
    return allProducts;
  }

  function normalizeProduct(p, smallMeta) {
    var MCS = global.MaterialCodeScheme;
    var raw = p || {};
    if (MCS) raw = MCS.normalizeProductRecord(raw);
    var feats = raw.features || {};
    var category = raw.category || (smallMeta && smallMeta.category) || "生产类";
    var aCode = raw.a || (smallMeta && smallMeta.a) || "";
    var bCode = raw.b || "";
    if (MCS) {
      if (aCode) aCode = MCS.parseTypeCode(aCode);
      if (bCode) bCode = MCS.parseInstanceCode(bCode);
    }
    return {
      id: raw.id || "",
      b: bCode,
      a: aCode,
      productName: raw.productName || raw.name || "",
      mfrName: raw.mfrName || feats.f1 || "",
      model: raw.model || feats.f2 || "",
      category: category,
      stockQty: raw.stockQty != null ? raw.stockQty : 0,
      refPrice: raw.refPrice != null ? String(raw.refPrice) : "",
      features: feats,
      treeBig: raw.treeBig || "",
      treeMid: raw.treeMid || "",
      treeSmall: raw.treeSmall || "",
      typeName: raw.typeName || (smallMeta && smallMeta.name) || "",
      typeDef: raw.typeDef || (smallMeta && smallMeta.def) || ""
    };
  }

  function findSmall(big, mid, small) {
    var b = CLASS_TREE.find(function (x) {
      return x.code === big;
    });
    if (!b) return null;
    var m = (b.children || []).find(function (x) {
      return x.code === mid;
    });
    if (!m) return null;
    return (m.children || []).find(function (x) {
      return x.code === small;
    });
  }

  function flattenAllProducts() {
    var allProducts = ensureDemoProducts();
    var list = [];
    CLASS_TREE.forEach(function (b) {
      (b.children || []).forEach(function (m) {
        (m.children || []).forEach(function (s) {
          var key = catKey(b.code, m.code, s.code);
          var rows = allProducts[key] || [];
          rows.forEach(function (p) {
            var item = normalizeProduct(
              Object.assign({}, p, {
                treeBig: b.code,
                treeMid: m.code,
                treeSmall: s.code,
                typeName: p.typeName || s.name,
                typeDef: p.typeDef || s.def || ""
              }),
              s
            );
            list.push(item);
          });
        });
      });
    });
    return list;
  }

  function productDisplayLabel(p) {
    if (!p) return "";
    var parts = [p.productName, p.mfrName, p.model].filter(Boolean);
    return parts.join(" · ");
  }

  function productToLedgerRow(p) {
    return {
      code: p.a,
      assetNo: p.a,
      name: p.productName,
      spec: p.model,
      category: p.category,
      productCode: p.b,
      mfrName: p.mfrName,
      stockQty: p.stockQty,
      unitPriceIncl: p.refPrice,
      _product: p
    };
  }

  function filterByContractLines(products, materialLines) {
    if (!materialLines || !materialLines.length) return products;
    var typeCodes = {};
    var names = {};
    materialLines.forEach(function (ln) {
      var tc = String((ln && ln.typeCode) || "").trim();
      var nm = String((ln && ln.name) || "").trim();
      if (tc) typeCodes[tc] = 1;
      if (nm) names[nm] = 1;
    });
    var filtered = products.filter(function (p) {
      if (typeCodes[p.a]) return true;
      if (names[p.productName]) return true;
      var hay = (p.productName + p.typeName).toLowerCase();
      return Object.keys(names).some(function (n) {
        return n && hay.indexOf(String(n).toLowerCase()) >= 0;
      });
    });
    return filtered.length ? filtered : products;
  }

  global.DemoProductCatalogData = {
    STORAGE_PRODUCTS: STORAGE_PRODUCTS,
    STORAGE_BSEQ: STORAGE_BSEQ,
    STORAGE_FEATURES: STORAGE_FEATURES,
    getClassTree: function () {
      return CLASS_TREE;
    },
    loadJson: loadJson,
    saveJson: saveJson,
    catKey: catKey,
    ensureDemoProducts: ensureDemoProducts,
    findSmall: findSmall,
    normalizeProduct: normalizeProduct,
    flattenAllProducts: flattenAllProducts,
    productDisplayLabel: productDisplayLabel,
    productToLedgerRow: productToLedgerRow,
    filterByContractLines: filterByContractLines
  };
})(typeof window !== "undefined" ? window : this);
