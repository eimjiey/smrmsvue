<template>
  <header class="topbar">
    <div class="topbar-inner">
      <!-- Left: logo block -->
      <div class="logo-block" @click="$router.push('/user/dashboard')">
        <div class="logo-icon"></div>
        <span class="logo-text">SMRMS</span>
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

<script>
export default {
  name: 'UserNavbar',
};
</script>

<style scoped>
.topbar {
  width: 100%;
  background-color: transparent; /* header background from parent */
}

/* row with logo, menu pill, profile button */
.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 0;
}

/* logo block */
.logo-block {
  display: flex;
  align-items: center;
  background-color: #00361d;
  border-radius: 4px;
  padding: 10px 22px;
  cursor: pointer;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background-color: #78ae63;
  border-radius: 4px;
  margin-right: 10px;
}

.logo-text {
  color: #e4f4df;
  font-weight: bold;
  letter-spacing: 1px;
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

/* links */
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
    justify-content: center;
    gap: 12px;
    height: auto;
  }
}
</style>
