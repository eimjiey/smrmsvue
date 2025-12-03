<template>
  <nav class="admin-nav">
    <!-- Left: logo -->
    <div class="admin-nav__logo">
      <img
        src="@/assets/SMRMSgreen.png"
        alt="SMRMS Logo"
        class="admin-nav__logo-image"
      />
      <span class="admin-nav__logo-text"> |STUDENT MISCONDUCT REPORT MANAGEMENT SYSTEM</span>
    </div>

    <!-- Center/right: dark bar + separate profile pill -->
    <div class="admin-nav__right">
      <div class="admin-nav__links">
        <button
          class="admin-nav__link"
          :class="{ 'admin-nav__link--active': $route.name === 'AdminDashboard' }"
          @click="$router.push({ name: 'AdminDashboard' })"
        >
          DASHBOARD
        </button>

        <button
          class="admin-nav__link"
          :class="{ 'admin-nav__link--active': $route.name === 'AdminIncidents' }"
          @click="$router.push({ name: 'AdminIncidents' })"
        >
          INCIDENT REPORT
        </button>

        <button
          class="admin-nav__link"
          :class="{ 'admin-nav__link--active': $route.name === 'AdminStudents' }"
          @click="$router.push({ name: 'AdminStudents' })"
        >
          STUDENTS LIST
        </button>

        <button
          class="admin-nav__link"
          :class="{ 'admin-nav__link--active': $route.name === 'AddStudent' }"
          @click="$router.push({ name: 'AddStudent' })"
        >
          ADD STUDENT
        </button>
      </div>

      <!-- separate profile pill -->
      <button
        class="admin-nav__profile"
        :class="{ 'admin-nav__profile--active': $route.name === 'AdminProfile' }"
        @click="$router.push({ name: 'AdminProfile' })"
      >
        PROFILE
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AdminNavbar'
}
</script>

<style scoped>
/* full-width background strip */
.admin-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 32px;
  background-color: #d4efe0; /* light green background similar to your Figma */
}

/* logo area */
.admin-nav__logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-nav__logo-image {
  height: 32px;
}

.admin-nav__logo-text {
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #0b3a23;
}

/* container for dark bar + profile pill */
.admin-nav__right {
  display: flex;
  align-items: center;
  gap: 12px; /* space between bar and profile pill */
}

/* dark rounded bar with main links */
.admin-nav__links {
  display: flex;
  align-items: center;
  background-color: #0b3a23;
  border-radius: 40px;
  padding: 0 24px;
  height: 44px;
  gap: 24px;
}

/* basic links */
.admin-nav__link {
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 8px 4px;
}

/* profile pill, visually separate */
.admin-nav__profile {
  border: none;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 8px 24px;
  border-radius: 40px;
  background-color: #7fe5a4; /* mint/bright green */
  color: #0b3a23;
  box-shadow: 0 0 0 2px #0b3a23; /* optional thin dark outline to match design */
}

/* active states */
.admin-nav__link--active {
  text-decoration: underline;
}

.admin-nav__profile--active {
  box-shadow: 0 0 0 2px #ffffff;
}
</style>
