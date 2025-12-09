<template>
  <header class="topbar">
    <div class="topbar-inner">
      <!-- Left: hamburger + logo block -->
      <div class="left-group">
        <!-- Mobile hamburger -->
        <button class="hamburger" @click="isOpen = !isOpen">
          <span :class="['bar', { 'bar--open': isOpen }]"></span>
          <span :class="['bar', { 'bar--open': isOpen }]"></span>
          <span :class="['bar', { 'bar--open': isOpen }]"></span>
        </button>

        <!-- Logo -->
        <div class="logo-block" @click="$router.push('/user/dashboard')">
          <img src="@/assets/SMRMSLOGO.png" alt="SMRMS Logo" class="logo-img" />
          <span class="logo-text">SMRMS</span>
        </div>
      </div>

      <!-- Center: rounded dark menu pill -->
      <nav class="center-menu">
        <router-link
          to="/user/dashboard"
          class="menu-link"
          active-class="menu-link-active"
          exact
        >
          DASHBOARD
        </router-link>
        <router-link
          to="/file-incident-report"
          class="menu-link"
          active-class="menu-link-active"
        >
          REPORT INCIDENT
        </router-link>
        <router-link
          :to="{ name: 'UserReportHistory' }"
          class="menu-link"
          active-class="menu-link-active"
        >
          VIEW REPORTS
        </router-link>
      </nav>

      <!-- Right: profile pill -->
      <button class="profile-pill" @click="$router.push('/user/profile')">
        PROFILE
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
</script>

<style scoped>
.topbar {
  width: 100%;
  background-color: transparent;
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 0;
}

.left-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* hamburger (mobile only) */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: #00361d;
  cursor: pointer;
  padding: 0;
}

.hamburger .bar {
  width: 18px;
  height: 2px;
  background-color: #ffffff;
  border-radius: 999px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.hamburger .bar:nth-child(1).bar--open {
  transform: translateY(6px) rotate(45deg);
}
.hamburger .bar:nth-child(2).bar--open {
  opacity: 0;
}
.hamburger .bar:nth-child(3).bar--open {
  transform: translateY(-6px) rotate(-45deg);
}

/* logo block using real image */
.logo-block {
  display: flex;
  align-items: center;
  background-color: #00361d;
  border-radius: 999px;
  padding: 8px 18px 8px 10px;
  cursor: pointer;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-right: 8px;
}

.logo-text {
  color: #e4f4df;
  font-weight: 800;
  letter-spacing: 0.12em;
  font-size: 0.8rem;
}

/* center dark pill menu */
.center-menu {
  display: flex;
  align-items: center;
  background-color: #00361d;
  border-radius: 24px;
  padding: 10px 32px;
  gap: 30px;
}

.menu-link {
  color: #e4f4df;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.menu-link-active {
  text-decoration: underline;
}

/* profile button */
.profile-pill {
  background-color: #e1e1e1;
  color: #00361d;
  border: none;
  border-radius: 18px;
  padding: 10px 40px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
}

/* responsive */
@media (max-width: 900px) {
  .topbar-inner {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
    height: auto;
  }

  .center-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 6px;
  }

  .profile-pill {
    padding: 8px 20px;
  }

  .hamburger {
    display: flex;
  }
}
</style>
