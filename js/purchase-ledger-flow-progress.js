(function () {
  function patchRequisitionFlow(mask) {
    if (!mask || window.__mapProgressFlowScope !== "purchase-ledger-requisition") return;
    var track = mask.querySelector(".map-flow-track");
    var info = mask.querySelector(".map-flow-info");
    if (!track) return;
    track.innerHTML =
      '<div class="map-flow-row">' +
      '<span class="map-flow-node">电控所任何人发起领用流程，从公司库中选取物资清单</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">电控所负责人审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门专责核对清单，无误</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门负责人审核，同意</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node end">领用结束，物资归入电控所名下</span>' +
      '<span class="map-flow-dot end"></span>' +
      "</div>";
    if (info) {
      info.innerHTML =
        '<div class="map-flow-timeline" style="padding:4px 0">' +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">张明</span><span class="map-flow-tl-time">2026-05-10 09:12</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">发起领用流程，从公司库中选取物资清单</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所负责人陈亮</span><span class="map-flow-tl-time">2026-05-10 10:03</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">审批：通过</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门专责宋中波</span><span class="map-flow-tl-time">2026-05-10 10:28</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">核对清单：无误</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门负责人王超</span><span class="map-flow-tl-time">2026-05-10 10:48</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
        '<div class="map-flow-tl-content">审核：同意</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item map-flow-tl-last">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-05-10 11:05</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
        '<div class="map-flow-tl-content">领用结束，物资归入电控所名下</div>' +
        "</div></div></div>";
    }
  }

  function patchTransferFlow(mask) {
    if (!mask || window.__mapProgressFlowScope !== "purchase-ledger-transfer") return;
    var track = mask.querySelector(".map-flow-track");
    var info = mask.querySelector(".map-flow-info");
    if (!track) return;
    track.innerHTML =
      '<div class="map-flow-row">' +
      '<span class="map-flow-node">电控所任何人发起申请，将机械所物资转入本部门</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">电控所负责人审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">机械研究所物资专责审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">机械研究所负责人审批，通过</span>' +
      '<span class="map-flow-arrow">→</span>' +
      '<span class="map-flow-node">物资管理部门物资专责确认</span>' +
      "</div>" +
      '<div class="map-flow-row" style="margin-top:18px">' +
      '<span class="map-flow-node end">公司内部流转结束</span>' +
      '<span class="map-flow-dot end"></span>' +
      "</div>";
    if (info) {
      info.innerHTML =
        '<div class="map-flow-timeline" style="padding:4px 0">' +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所于伟</span><span class="map-flow-tl-time">2026-05-10 09:12</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">发起申请：将机械所物资转入本部门</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">电控所负责人陈亮</span><span class="map-flow-tl-time">2026-05-10 10:03</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">审批：通过</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">机械研究所物资专责许学良</span><span class="map-flow-tl-time">2026-05-10 10:28</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">审批：通过</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">机械研究所负责人李仁堂</span><span class="map-flow-tl-time">2026-05-10 10:48</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已通过</span></div>' +
        '<div class="map-flow-tl-content">审批：通过</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div><div class="map-flow-tl-line"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">物资管理部门专责宋中波</span><span class="map-flow-tl-time">2026-05-10 11:05</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
        '<div class="map-flow-tl-content">确认：已确认</div>' +
        "</div></div>" +
        '<div class="map-flow-tl-item map-flow-tl-last">' +
        '<div class="map-flow-tl-dot" style="background:#10b981"></div>' +
        '<div class="map-flow-tl-body">' +
        '<div class="map-flow-tl-meta"><span class="map-flow-tl-person">系统</span><span class="map-flow-tl-time">2026-05-10 11:30</span><span class="map-flow-tl-badge" style="background:#10b98122;color:#10b981">已完成</span></div>' +
        '<div class="map-flow-tl-content">公司内部流转结束</div>' +
        "</div></div></div>";
    }
  }

  function applyLedgerFlowPatches(mask) {
    if (!mask) return;
    patchRequisitionFlow(mask);
    patchTransferFlow(mask);
  }

  function wrapOpenUnifiedProgressModal() {
    var builtin = window.openUnifiedProgressModal;
    window.openUnifiedProgressModal = function () {
      var mask =
        (typeof window.ensureUnifiedProgressModal === "function" && window.ensureUnifiedProgressModal()) ||
        document.getElementById("mapUnifiedProgressModal");
      if (!mask) {
        return typeof builtin === "function" ? builtin() : false;
      }
      if (typeof builtin === "function") {
        try {
          builtin();
        } catch (e) {}
      }
      applyLedgerFlowPatches(mask);
      mask.classList.add("show");
      return true;
    };
  }

  wrapOpenUnifiedProgressModal();
})();
