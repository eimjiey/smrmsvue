<template>
  <nav :style="navContainerStyle">
    <div :style="navLeftStyle">
      <div :style="logoStyle">SMRMS</div> 
      
      <button 
        :style="getNavButtonStyle($route.name === 'AdminDashboard')" 
        @click="$router.push({ name: 'AdminDashboard' })"
      >
        <span :style="iconStyle">📊</span> DASHBOARD
      </button>

      <div :style="navLinksStyle">
        <span 
          @click="$router.push({ name: 'AdminStudents' })" 
          :style="getNavLinkStyle($route.name === 'AdminStudents')"
        >
          STUDENTS LIST
        </span>
        <span 
          @click="$router.push({ name: 'AdminIncidents' })" 
          :style="getNavLinkStyle($route.name === 'AdminIncidents')"
        >
          INCIDENT REPORT
        </span>
        <span 
          @click="$router.push({ name: 'AddStudent' })" 
          :style="getNavLinkStyle($route.name === 'AddStudent')"
        >
          ADD STUDENT
        </span>
      </div>
    </div>
    
    <div :style="userProfileStyle">
      <span :style="profileIconStyle">👤</span>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AdminNavbar',
  methods: {
    // Helper to dynamically set style based on the current route
    getNavButtonStyle(isActive) {
        // Base style from your original navButtonStyle
        const baseStyle = {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 15px',
            background: isActive ? '#4CAF50' : '#1d3e21', // Darker background when not active
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'background 0.3s'
        };
        // Use a slightly different background for the active dashboard button
        return isActive ? {...baseStyle, background: '#4CAF50', boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)'} : baseStyle;
    },
    // Helper to dynamically set style for the links
    getNavLinkStyle(isActive) {
        // Base style from your original navLinkStyle
        const baseStyle = {
            cursor: 'pointer',
            transition: 'color 0.2s, border-bottom 0.2s',
            paddingBottom: '2px',
            borderBottom: '2px solid transparent',
            color: '#ddd',
        };
        // Highlight active link
        return isActive ? {...baseStyle, color: '#fff', borderBottomColor: '#4CAF50'} : baseStyle;
    }
  },
  computed: {
    navContainerStyle() {
        return {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#1d3e21',
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        };
    },
    logoStyle() {
        return {
            fontSize: '1.2rem',
            fontWeight: '900',
            marginRight: '15px',
            color: '#95d2b7', // Light green logo color
        }
    },
    navLeftStyle() {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
        };
    },
    iconStyle() {
        return {
            marginRight: '8px',
        };
    },
    navLinksStyle() {
        return {
            display: 'flex',
            gap: '20px',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            color: '#ddd',
        };
    },
    userProfileStyle() {
        return {
            padding: '8px 10px',
            background: '#f8fff8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '35px',
            height: '35px',
            color: '#1d3e21',
        };
    },
    profileIconStyle() {
        return {
            fontSize: '1.2rem',
        };
    },
  }
}
</script>

<style scoped>
/* Scoped CSS is empty as all styling is handled via computed properties */
</style>