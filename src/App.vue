<template>
  <div class="shell map-demo-hide-shell-topbar demo-shell-collapsed" :class="{ 'topbar-collapsed': isTopbarCollapsed }">
    <Sidebar />
    <main class="main">
      <TopBar />
      <DemoFrame />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
import DemoFrame from './components/DemoFrame.vue';

const isTopbarCollapsed = ref(true);

onMounted(() => {
  document.body.classList.add('map-demo-hide-shell-topbar', 'demo-shell-collapsed');
});
</script>

<style>
@import './assets/main.css';

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 0;
}

.main {
  display: grid;
  grid-template-rows: 3.75rem 1fr;
  min-width: 0;
  min-height: 0;
  height: 100%;
  align-self: stretch;
}

/* 侧栏折叠 */
.demo-shell-collapsed .sidebar {
  width: 0;
  padding: 0;
  border-right: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.demo-shell-collapsed .main {
  min-width: 0;
}

/* 顶栏紧凑模式 */
.topbar-collapsed .topbar {
  min-height: 38px !important;
  height: 38px !important;
  background: #0a1730 !important;
}

.topbar-collapsed .navbar-ruoyi {
  min-height: 38px !important;
  height: 38px !important;
}

.topbar-collapsed .navbar-ruoyi__left {
  display: none !important;
}

.topbar-collapsed .navbar-ruoyi__center {
  display: flex !important;
  justify-content: flex-start !important;
  padding: 0 10px !important;
}

.topbar-collapsed .navbar-ruoyi__center .current {
  font-size: 12px !important;
  color: #d6e6ff !important;
  font-weight: 600 !important;
}

.topbar-collapsed .navbar-ruoyi__right {
  padding-right: 8px !important;
  gap: 6px !important;
}

.topbar-collapsed .navbar-ruoyi__avatar {
  display: none !important;
}

.topbar-collapsed .actions a,
.topbar-collapsed .actions button {
  height: 24px !important;
  padding: 0 8px !important;
  font-size: 11px !important;
  border-radius: 4px !important;
}
</style>
