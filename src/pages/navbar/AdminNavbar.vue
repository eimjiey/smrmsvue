<template>
  <div class="admin-layout">
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__brand">
          <img
            src="@/assets/SMRMSLOGO.png"
            alt="SMRMS Logo"
            class="topbar__logo"
          />
          <span class="topbar__title">STUDENT MISCONDUCT REPORT MANAGEMENT</span>
        </div>

        <button
          class="topbar__profile"
          :class="{ 'topbar__profile--active': $route.name === 'AdminProfile' }"
          @click="$router.push({ name: 'AdminProfile' })"
        >
          PROFILE
        </button>
      </div>
    </header>

    <div class="admin-main">
      <aside class="sidebar">
        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AdminDashboard' }"
          @click="$router.push({ name: 'AdminDashboard' })"
        >
          DASHBOARD
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AdminIncidents' }"
          @click="$router.push({ name: 'AdminIncidents' })"
        >
          INCIDENT REPORT
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AddStudent' }"
          @click="$router.push({ name: 'AddStudent' })"
        >
          ADD STUDENT
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AdminStudents' }"
          @click="$router.push({ name: 'AdminStudents' })"
        >
          STUDENT LIST
        </button>

        <button
          class="sidebar__item"
          :class="{ 'sidebar__item--active': $route.name === 'AboutUs' }"
          @click="$router.push({ name: 'AboutUs' })"
        >
          ABOUT US
        </button>

        <div class="sidebar__spacer"></div>

        <button
          class="sidebar__logout"
          @click="showLogoutModal = true"
        >
          LOG OUT
        </button>
      </aside>

      <main class="content">
        <slot />
      </main>
    </div>

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
    const router = useRouter();

    const confirmLogout = () => {
      // 1. Clear session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 2. Navigate to login
      router.push('/login'); 
    };

    return {
      showLogoutModal,
      confirmLogout,
    };
  },
  computed: {
    // --- Modal Styles ---
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
        color: '#0b3a23', /* Dark Green */
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
        border: '1px solid #74a765', /* Medium Green Border */
        backgroundColor: '#f5ffec', /* Lightest Green */
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
        backgroundColor: '#dc2626', /* Red for urgency */
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(220, 38, 38, 0.3)',
      };
    },
  }
};
</script>

<style scoped>
/* Base background (The requested single color) */
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
  /* Removed background color for a single-color layout */
  background-color: transparent; 
  border-radius: 0 0 0 0;
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

.topbar__logo {
  height: 40px;
}

.topbar__title {
  font-size: 16px;
  font-weight: 700;
  color: #0b3a23;
  letter-spacing: 0.08em;
}

/* Profile button in topbar */
.topbar__profile {
  border: none;
  border-radius: 18px;
  padding: 8px 32px;
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

/* Main area: sidebar + content */
.admin-main {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding: 0 16px 16px;
  box-sizing: border-box;
  gap: 16px;
  width: 100%;
}

/* Sidebar styles */
.sidebar {
  width: 190px;
  /* Removed background color for a single-color layout */
  background-color: transparent;
  border-radius: 8px;
  padding: 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar__item {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: none;
  /* Keeping this light color for inactive buttons to provide contrast */
  background-color: #f5ffec; 
  color: #0b3a23;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  padding: 0 16px;
  cursor: pointer;
}

.sidebar__item--active {
  background-color: #0b3a23;
  color: #ffffff;
}

.sidebar__spacer {
  flex: 1;
}

/* Logout button at bottom */
.sidebar__logout {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: none;
  background-color: #0b3a23;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
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

/* Basic responsiveness */
@media (max-width: 900px) {
  .admin-main {
    flex-direction: column;
    align-items: center;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .sidebar__item,
  .sidebar__logout {
    max-width: 45%;
  }

  .content {
    width: 100%;
  }
}
</style>