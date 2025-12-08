<template>
  <div class="admin-layout" :class="{ 'admin-layout--collapsed': isSidebarCollapsed }">
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__brand">
          <!-- Mobile hamburger (toggle sidebar on small screens) -->
          <button
            class="topbar__hamburger"
            @click="isSidebarOpenMobile = !isSidebarOpenMobile"
          >
            <span :class="['bar', { 'bar--open': isSidebarOpenMobile }]"></span>
            <span :class="['bar', { 'bar--open': isSidebarOpenMobile }]"></span>
            <span :class="['bar', { 'bar--open': isSidebarOpenMobile }]"></span>
          </button>

          <!-- Collapse / expand icon (desktop), BEFORE logo -->
          <button
            class="topbar__collapse-icon"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            :aria-label="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <v-icon name="la-bars-solid" scale="1.1" />
          </button>

          <img
            src="@/assets/SMRMSLOGO.png"
            alt="SMRMS Logo"
            class="topbar__logo"
          />
          <span class="topbar__title">
            STUDENT MISCONDUCT REPORT MANAGEMENT
          </span>
        </div>

        <div class="topbar__right">
          <button
            class="topbar__profile"
            :class="{ 'topbar__profile--active': $route.name === 'AdminProfile' }"
            @click="$router.push({ name: 'AdminProfile' })"
          >
            PROFILE
          </button>
        </div>
      </div>
    </header>

    <div class="admin-main">
      <!-- Sidebar -->
      <aside
        class="sidebar"
        :class="{
          'sidebar--collapsed': isSidebarCollapsed,
          'sidebar--open-mobile': isSidebarOpenMobile
        }"
      >
        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AdminDashboard' }"
          @click="$router.push({ name: 'AdminDashboard' }); closeSidebarOnMobile()"
        >
          <span class="sidebar__icon">
            <v-icon name="md-dashboard-twotone" scale="1.1" />
          </span>
          <span class="sidebar__label">DASHBOARD</span>
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AdminIncidents' }"
          @click="$router.push({ name: 'AdminIncidents' }); closeSidebarOnMobile()"
        >
          <span class="sidebar__icon">
            <v-icon name="md-featuredplaylist-twotone" scale="1.1" />
          </span>
          <span class="sidebar__label">INCIDENT REPORT</span>
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AddStudent' }"
          @click="$router.push({ name: 'AddStudent' }); closeSidebarOnMobile()"
        >
          <span class="sidebar__icon">
            <v-icon name="md-addbox-twotone" scale="1.1" />
          </span>
          <span class="sidebar__label">ADD STUDENT</span>
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AdminStudents' }"
          @click="$router.push({ name: 'AdminStudents' }); closeSidebarOnMobile()"
        >
          <span class="sidebar__icon">
            <v-icon name="md-people-twotone" scale="1.1" />
          </span>
          <span class="sidebar__label">STUDENT LIST</span>
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AboutUs' }"
          @click="$router.push({ name: 'AboutUs' }); closeSidebarOnMobile()"
        >
          <span class="sidebar__icon">
            <v-icon name="md-info-twotone" scale="1.1" />
          </span>
          <span class="sidebar__label">ABOUT US</span>
        </button>

        <!-- Logout directly under About Us -->
        <button
          class="sidebar__logout"
          @click="showLogoutModal = true"
        >
          <span class="sidebar__icon">
            <v-icon name="md-logout-outlined" scale="1.1" />
          </span>
          <span class="sidebar__label">LOG OUT</span>
        </button>
      </aside>

      <!-- Content -->
      <main class="content">
        <slot />
      </main>
    </div>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" :style="modalOverlayStyle">
      <div :style="modalContainerStyle">
        <h3 :style="modalTitleStyle">Confirm Logout</h3>
        <p :style="modalMessageStyle">
          Are you sure you want to Logout?
        </p>
        <div :style="modalActionsStyle">
          <button @click="showLogoutModal = false" :style="modalCancelButtonStyle">
            Cancel
          </button>
          <button @click="confirmLogout" :style="modalConfirmButtonStyle">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminLayout',
  setup() {
    const showLogoutModal = ref(false);
    const isSidebarCollapsed = ref(false);
    const isSidebarOpenMobile = ref(false);
    const router = useRouter();

    const confirmLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    };

    const closeSidebarOnMobile = () => {
      if (window.innerWidth <= 900) {
        isSidebarOpenMobile.value = false;
      }
    };

    return {
      showLogoutModal,
      isSidebarCollapsed,
      isSidebarOpenMobile,
      confirmLogout,
      closeSidebarOnMobile,
    };
  },
  computed: {
    modalOverlayStyle() {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      };
    },
    modalContainerStyle() {
      return {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
      };
    },
    modalTitleStyle() {
      return {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#0b3a23',
        marginBottom: '10px',
      };
    },
    modalMessageStyle() {
      return {
        fontSize: '0.95rem',
        color: '#4b5563',
        marginBottom: '20px',
      };
    },
    modalActionsStyle() {
      return {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
      };
    },
    modalCancelButtonStyle() {
      return {
        flex: 1,
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #74a765',
        backgroundColor: '#f5ffec',
        color: '#0b3a23',
        fontWeight: '600',
        cursor: 'pointer',
      };
    },
    modalConfirmButtonStyle() {
      return {
        flex: 1,
        padding: '10px 15px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#dc2626',
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(220, 38, 38, 0.3)',
      };
    },
  },
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #EAF9E7;
  display: flex;
  flex-direction: column;
}

/* Topbar */
.topbar {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.topbar__inner {
  width: 98%;
  max-width: 2300px;
  height: 56px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Hamburger (mobile) */
.topbar__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: #0b3a23;
  cursor: pointer;
  padding: 0;
}

.topbar__hamburger .bar {
  width: 18px;
  height: 2px;
  background-color: #ffffff;
  border-radius: 999px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.topbar__hamburger .bar:nth-child(1).bar--open {
  transform: translateY(6px) rotate(45deg);
}
.topbar__hamburger .bar:nth-child(2).bar--open {
  opacity: 0;
}
.topbar__hamburger .bar:nth-child(3).bar--open {
  transform: translateY(-6px) rotate(-45deg);
}

/* Collapse / expand icon beside logo */
.topbar__collapse-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 4px;
  border-radius: 999px;
  border: 1px solid #0b3a23;
  background-color: #f5ffec;
  cursor: pointer;
  padding: 0;
}

.topbar__collapse-icon .v-icon {
  color: #0b3a23;
}

.topbar__logo {
  height: 40px;
}

.topbar__title {
  font-size: 16px;
  font-weight: 700;
  color: #0b3a23;
  letter-spacing: 0.08em;
}

.topbar__profile {
  border: none;
  border-radius: 18px;
  padding: 8px 24px;
  background-color: #114326;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.topbar__profile--active {
  background-color: #0b3a23;
}

/* Main area */
.admin-main {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding: 0 16px 16px;
  box-sizing: border-box;
  gap: 16px;
  width: 100%;
}

/* Sidebar */
.sidebar {
  width: 190px;
  background-color: transparent;
  border-radius: 8px;
  padding: 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: width 0.25s ease;
}

/* collapsed width */
.sidebar--collapsed {
  width: 64px;
}

/* Sidebar items with icon + label */
.sidebar__item,
.sidebar__logout {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: none;
  background-color: #f5ffec;
  color: #0b3a23;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
}

.sidebar__item--active {
  background-color: #0b3a23;
  color: #ffffff;
}

.sidebar__logout {
  background-color: #0b3a23;
  color: #ffffff;
}

/* icon container */
.sidebar__icon {
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__icon .v-icon {
  color: #0b3a23;
}

.sidebar__logout .sidebar__icon .v-icon {
  color: #ffffff;
}

/* label text – hide when collapsed */
.sidebar__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* when collapsed: center icon, hide label */
.sidebar--collapsed .sidebar__item,
.sidebar--collapsed .sidebar__logout {
  justify-content: center;
  padding: 0;
}

.sidebar--collapsed .sidebar__label {
  display: none;
}

/* Content panel */
.content {
  flex: 1;
  background-color: #74a765;
  border-radius: 20px;
  padding: 24px;
  box-sizing: border-box;
  width: 100%;
}

/* Mobile */
@media (max-width: 900px) {
  .topbar__hamburger {
    display: flex;
  }

  .topbar__collapse-icon {
    display: none;
  }

  .admin-main {
    position: relative;
    padding-top: 0;
  }

  .sidebar {
    position: fixed;
    top: 72px;
    left: 0;
    bottom: 0;
    width: 220px;
    background-color: #eaf9e7;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    transform: translateX(-100%);
    z-index: 900;
  }

  .sidebar--open-mobile {
    transform: translateX(0);
  }

  .sidebar--collapsed {
    width: 220px; /* ignore collapsed state on mobile */
  }

  .content {
    width: 100%;
  }
}
</style>
