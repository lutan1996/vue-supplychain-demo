<template>
  <div class="viewport" :class="{ 'is-loading': isLoading }">
    <iframe
      id="demoFrame"
      :src="currentSrc"
      title="离线演示页面"
      @load="onLoad"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useDemoShell } from '../composables/useDemoShell';

const { currentPage, isLoading, switchTo } = useDemoShell();

const currentSrc = ref('about:blank');

watch(
  () => currentPage.value,
  (page) => {
    if (page) {
      currentSrc.value = page.file;
    }
  }
);

onMounted(() => {
  const list = useDemoShell().pagesList.value;
  const preferred = ['index-portal-screen-alt.html', 'demo-login-placeholder.html', 'index.html?view=portal', 'index.html', 'cockpit.html'];
  let idx = 0;
  for (const file of preferred) {
    const i = list.findIndex((p) => p.file === file);
    if (i >= 0) {
      idx = i;
      break;
    }
  }
  if (list[idx]) {
    currentSrc.value = list[idx].file;
  }
});

function onLoad() {
  try {
    sessionStorage.setItem('portalLoggedIn_v1', '1');
  } catch (e) {
    // ignore
  }

  try {
    const id = (sessionStorage.getItem('demoOrgRoleId') || '').trim() || 'gm_zeng';
    const frame = document.getElementById('demoFrame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'map-demo-shell-role', roleId: id }, '*');
    }
  } catch (e) {
    // ignore
  }
}
</script>

<style scoped>
.viewport {
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: #071229;
  display: flex;
  flex-direction: column;
  position: relative;
}

.viewport iframe {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  border: 0;
  display: block;
  background: #071229;
}

.viewport.is-loading {
  position: relative;
}

.viewport.is-loading::after {
  content: '';
  position: absolute;
  right: 14px;
  top: 50%;
  width: 18px;
  height: 18px;
  margin-top: -9px;
  border: 2px solid rgba(219, 230, 243, 0.5);
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: demo-shell-spin 0.55s linear infinite;
  z-index: 10;
}

@keyframes demo-shell-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
