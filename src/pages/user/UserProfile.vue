<template>
  <div class="user-profile-container">
    <UserNavbar />
    
    <div class="profile-content">
      <h1>User Profile</h1>
      
      <div v-if="user" class="profile-card">
        <div class="profile-info">
          <p><strong>Name:</strong> {{ user.name || 'Not set' }}</p>
          <p><strong>Email:</strong> {{ user.email || 'Not set' }}</p>
          <p><strong>Created:</strong> {{ new Date(user.created_at).toLocaleDateString() }}</p>
        </div>
        
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
      
      <div v-else class="no-user">
        <p>No user data available. Please log in.</p>
      </div>
    </div>
  </div>
</template>

<script>
import UserNavbar from '@/components/UserNavbar.vue';

export default {
  name: 'UserProfile',
  components: {
    UserNavbar
  },
  data() {
    return {
      user: null
    };
  },
  mounted() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-content {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.profile-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-info p {
  margin: 15px 0;
  font-size: 16px;
  color: #555;
}

.profile-info strong {
  color: #333;
}

.logout-btn {
  margin-top: 20px;
  padding: 12px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.no-user {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  color: #999;
}
</style>
