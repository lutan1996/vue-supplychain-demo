<template>
  <div class="topbar">
    <div class="navbar-ruoyi">
      <div class="navbar-ruoyi__left">
        <div class="navbar-ruoyi__logo">
          <img src="../assets/logo-chenergy.png" alt="" width="182" height="40" />
        </div>
        <div class="navbar-ruoyi__title">
          <p>新能源供应链管理系统</p>
        </div>
      </div>
      <div class="navbar-ruoyi__center">
        <div class="current">{{ currentTitle }}</div>
      </div>
      <div class="navbar-ruoyi__right">
        <span class="navbar-ruoyi__clock">{{ clock }}</span>
        <div class="actions">
          <div id="shellOrgRoleWrap" aria-label="角色切换"></div>
          <button type="button" aria-label="隐藏侧栏" title="隐藏侧栏" @click="toggleSidebar">
            <span class="bars" aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
          </button>
          <button type="button" @click="goPrev">上一页</button>
          <button type="button" @click="goNext">下一页</button>
          <a href="#" @click.prevent="openNewTab">新标签打开当前页</a>
        </div>
        <div class="navbar-ruoyi__avatar" title="用户">用</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useDemoShell } from '../composables/useDemoShell';

const {
  currentTitle,
  toggleSidebar,
  goPrev,
  goNext,
  openNewTab,
  currentPage,
} = useDemoShell();

const clock = ref('');

function updateClock() {
  const now = new Date();
  clock.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

let timer = null;
onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

watch(
  () => currentPage.value,
  (page) => {
    if (page) {
      const qs = page.file.includes('?') ? page.file.split('?')[1] : '';
      if (qs) {
        try {
          const sp = new URLSearchParams(qs);
          const tab = sp.get('tab');
          if (tab) sessionStorage.setItem('demoTab', tab);
          const scene = sp.get('scene');
          if (scene) sessionStorage.setItem('demoScene', scene);
          const ps = sp.get('pageSub');
          if (ps) sessionStorage.setItem('pageSub', ps);
        } catch (e) {
          // ignore
        }
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.topbar {
  padding: 0;
  border-bottom: 0;
  background: #0a3382;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  min-height: 3.75rem;
}

.navbar-ruoyi {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-height: 3.75rem;
  color: #fff;
}

.navbar-ruoyi__left {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  padding-left: 8px;
}

.navbar-ruoyi__logo img {
  height: 40px;
  width: auto;
  max-width: 182px;
  display: block;
  object-fit: contain;
}

.navbar-ruoyi__title {
  border-left: 1px solid rgba(252, 252, 252, 0.17);
  margin-left: 12px;
  padding-left: 18px;
  height: 100%;
  display: flex;
  align-items: center;
}

.navbar-ruoyi__title p {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
}

.navbar-ruoyi__center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.navbar-ruoyi__center .current {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #e9f2ff;
  max-width: 100%;
}

.navbar-ruoyi__right {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 12px;
  flex: 0 0 auto;
}

.navbar-ruoyi__clock {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.92);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.navbar-ruoyi__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  user-select: none;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.actions a,
.actions button {
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(0, 0, 0, 0.15);
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.actions a:hover,
.actions button:hover {
  background: rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.55);
}

.bars {
  display: inline-flex;
  flex-direction: column;
  gap: 3px;
  vertical-align: middle;
}

.bars i {
  display: block;
  width: 14px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
}
</style>
