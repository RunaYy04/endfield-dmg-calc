<template>
  <div class="app-layout">
    <header class="glass-header">
      <div class="nav-container">
        <div class="nav-brand">
          <span class="brand-text">Endfield Dmg Calc</span>
        </div>

        <nav class="nav-links">
          <router-link to="/" class="nav-item">伤害计算器</router-link>
          <router-link to="/add-equipment" class="nav-item">添加装备</router-link>
          <router-link to="/add-buff" class="nav-item">添加增益</router-link>
          <router-link to="/add-skill" class="nav-item">添加技能</router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="footer-side left-side">
        <p>数据及逻辑来源 <a href="https://space.bilibili.com/112745" target="_blank" rel="noopener noreferrer">@片雲</a><br>项目地址: <a href="https://github.com/RunaYy04/endfield-dmg-calc" target="_blank" rel="noopener noreferrer">https://github.com/RunaYy04/endfield-dmg-calc</a></p>
      </div>
      <div class="footer-side right-side">
        <p><strong>免责声明</strong></p>
        <p>本站为《明日方舟：终末地》二创作品，<br class="desktop-br">网站所涉及数据其版权属于 上海鹰角网络科技有限公司。</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
/* ================= 全局布局 ================= */
.app-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* ================= 导航栏美化 ================= */
.glass-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px -10px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ================= 标志 ================= */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.brand-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ================= 导航链接 ================= */
.nav-links {
  display: flex;
  gap: 8px;
}

.nav-item {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  color: #0f172a;
  background-color: rgba(241, 245, 249, 0.8);
}

.nav-item.router-link-active {
  color: #4f46e5;
  background-color: #e0e7ff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
}

/* ================= 主内容区 ================= */
.main-content {
  flex: 1;
  padding: 24px 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* ================= 页面切换动画 ================= */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ================= 底部声明样式 (悬浮两侧) ================= */
.app-footer {
  /* 让 footer 本身不阻挡点击事件 */
  pointer-events: none;
}

.footer-side {
  position: fixed;
  bottom: 20px;
  z-index: 90;
  pointer-events: auto; /* 恢复卡片本身的点击能力 */
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.5;
  
  /* 添加与整体风格一致的毛玻璃效果 */
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.footer-side p {
  margin: 0;
}

.left-side {
  left: 20px;
}

.right-side {
  right: 20px;
  text-align: right;
}

.app-footer a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.app-footer a:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* ================= 适配 ================= */

/* 屏幕较小（放不下左右两侧悬浮框）时，恢复底部常规文档流布局 */
@media (max-width: 1600px) {
  .app-footer {
    position: static;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    /* 留出足够的高度，使得页面拉到最底部时，免责声明在计算器悬浮窗的正上方 */
    padding-bottom: 130px;
    margin-top: auto;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .footer-side {
    position: static;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    text-align: center;
    padding: 0;
  }

  .right-side {
    text-align: center;
  }

  .desktop-br {
    display: none; /* 小屏幕取消强行换行 */
  }
}

/* 移动端适配 */
@media (max-width: 600px) {
  .nav-container {
    padding: 0 12px;
  }
  .nav-links {
    gap: 4px;
  }
  .nav-item {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
  .brand-text {
    display: none; 
  }
}
</style>
