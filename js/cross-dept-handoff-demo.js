/**
 * 跨部门物资内部流转（方案一）离线演示：电控所先完成本部门领用，再发起内部流转；
 * localStorage 任务 + 台账字段合并 + 机械所右下角提醒。handoff_status「待领用」表示目标部门待办。
 */
(function (global) {
  var KEY = "map_handoff_tasks_v1";

  function readTasks() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeTasks(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function appendHandoffTask(rec) {
    var list = readTasks();
    var id = rec.id || "H-" + Date.now();
    var row = {
      id: id,
      fromDept: rec.fromDept || "",
      toDept: rec.toDept || "",
      batchNo: rec.batchNo || "",
      handoff_at: rec.handoff_at || "",
      handoff_status: rec.handoff_status || "待领用",
      materialName: rec.materialName || "",
      spec: rec.spec || "",
      qty: rec.qty || "",
      inboundNo: rec.inboundNo || "",
      contractNo: rec.contractNo || "",
      remark: rec.remark || ""
    };
    list.push(row);
    writeTasks(list);
    return row;
  }

  function updateHandoffStatus(idOrBatch, status) {
    var list = readTasks();
    var hit = false;
    list.forEach(function (t) {
      if (t.id === idOrBatch || t.batchNo === idOrBatch) {
        t.handoff_status = status;
        hit = true;
      }
    });
    if (hit) writeTasks(list);
    return hit;
  }

  function getPendingForMech() {
    return readTasks().filter(function (t) {
      return (
        String(t.handoff_status || "") === "待领用" &&
        String(t.toDept || "").indexOf("机械") >= 0
      );
    });
  }

  function applyHandoffToMaterialRows(rows) {
    var tasks = readTasks().slice().sort(function (a, b) {
      return String(b.handoff_at || "").localeCompare(String(a.handoff_at || ""));
    });
    rows.forEach(function (r) {
      for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        var nameOk = String(r.name || "") === String(t.materialName || "");
        var specOk = String(r.spec || "") === String(t.spec || "");
        var contractOk =
          t.contractNo &&
          String(r.contractNo || "") === String(t.contractNo);
        if ((nameOk && specOk) || (contractOk && nameOk)) {
          r.from_dept = t.fromDept || "";
          r.to_dept = t.toDept || "";
          r.handoff_status = t.handoff_status || "";
          r.handoff_at = t.handoff_at || "";
          r.batch_no = t.batchNo || "";
          break;
        }
      }
    });
  }

  function getTaskById(id) {
    var list = readTasks();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** 机械所提醒已并入 sidebar-actions.js 全局「任务提醒」；此处仅刷新挂载，避免重复弹窗。 */
  function mountReminder() {
    try {
      if (typeof window.mapDemoResetTaskReminder === "function") {
        window.mapDemoResetTaskReminder();
      } else if (typeof window.mapDemoMountTaskReminder === "function") {
        var hostDoc = document;
        try {
          if (window.top && window.top !== window && window.top.document) hostDoc = window.top.document;
        } catch (e1) {}
        var old = hostDoc.getElementById("globalTaskReminder");
        if (old && old.parentNode) old.parentNode.removeChild(old);
        window.mapDemoMountTaskReminder();
      }
    } catch (e) {}
  }

  global.DemoCrossDeptHandoff = {
    KEY: KEY,
    readTasks: readTasks,
    appendHandoffTask: appendHandoffTask,
    updateHandoffStatus: updateHandoffStatus,
    getPendingForMech: getPendingForMech,
    applyHandoffToMaterialRows: applyHandoffToMaterialRows,
    getTaskById: getTaskById,
    mountReminder: mountReminder
  };
})(typeof window !== "undefined" ? window : this);
