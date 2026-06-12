<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <h1 class="title">离线演示总入口</h1>
    <p class="desc">
      单文件入口，点击左侧任一页面即可切换，适合线下演示。<strong style="color:#7ec8ff;">「核心页面」最上为账号密码登录页。</strong>
    </p>

    <div v-for="(items, group) in sortedGroups" :key="group" class="group-section">
      <div class="group-title">{{ groupLabel(group) }}</div>
      <div class="page-list">
        <button
          v-for="(item, index) in items"
          :key="item.file"
          type="button"
          class="page-btn"
          :class="{ active: currentIndex === globalIndex(item) }"
          @click="onSelect(globalIndex(item))"
        >
          {{ item.title }}
        </button>
      </div>
    </div>

    <p class="hint">
      若某页面内部还有按钮跳转，会在 iframe 中继续打开；也可点右上角“新标签打开当前页”独立展示。
      <strong style="color:#7ec8ff;display:block;margin-top:8px;">演示提速：</strong>
      请复制整个项目文件夹（含 assets/、css/、js/ 与各 .html），勿只拷单文件；U 盘或远程盘可改用本机磁盘目录，或在目录下执行 python3 -m http.server 8080 用浏览器打开 http://127.0.0.1:8080/demo-all-pages-interactive.html。
    </p>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useDemoShell } from '../composables/useDemoShell';

const {
  groupedPages,
  currentIndex,
  switchTo,
} = useDemoShell();

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: true,
  },
});

const isCollapsed = computed(() => props.collapsed);

const groupOrder = ['core', 'logistics', 'warehouse', 'retired', 'data', 'other', 'purchase', 'asset'];

const sortedGroups = computed(() => {
  const groups = Object.keys(groupedPages);
  groups.sort((a, b) => {
    const ai = groupOrder.indexOf(a);
    const bi = groupOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return groups;
});

const groupLabelMap = {
  core: '核心页面',
  logistics: '物流页面',
  warehouse: '仓储页面',
  retired: '退役废旧',
  data: '基础数据',
  other: '其他演示',
  purchase: '采购管理',
  asset: '资产管理',
};

function groupLabel(group) {
  return groupLabelMap[group] || group;
}

function globalIndex(item) {
  const list = useDemoShell().pagesList.value;
  return list.findIndex((p) => p.file === item.file && p.title === item.title);
}

function onSelect(index) {
  switchTo(index);
}
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(130, 186, 255, 0.25);
  background: linear-gradient(180deg, #0a1730 0%, #091224 100%);
  padding: 14px 12px;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 260px;
  min-width: 260px;
  transition: width 0.2s ease, padding 0.2s ease, opacity 0.2s ease;
}

.sidebar::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.sidebar.collapsed {
  width: 0;
  padding: 0;
  border-right: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #e9f2ff;
}

.desc {
  margin: 0 0 14px;
  font-size: 12px;
  color: #9ab2d6;
  line-height: 1.4;
}

.group-section {
  margin-bottom: 4px;
}

.group-title {
  margin: 14px 4px 8px;
  font-size: 12px;
  color: #b6cced;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.page-list {
  display: grid;
  gap: 8px;
}

.page-btn {
  width: 100%;
  padding: 10px 10px;
  border: 1px solid rgba(130, 186, 255, 0.25);
  border-radius: 8px;
  background: linear-gradient(180deg, #0b1a36 0%, #12264b 100%);
  color: #e9f2ff;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: 0.18s ease;
}

.page-btn:hover {
  border-color: rgba(74, 199, 255, 0.55);
  transform: translateY(-1px);
}

.page-btn.active {
  border-color: #00d4ff;
  box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.25);
}

.hint {
  margin-top: 14px;
  font-size: 12px;
  color: #9ab2d6;
  line-height: 1.5;
}
</style>
