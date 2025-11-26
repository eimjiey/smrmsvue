<template>
  <div :style="containerStyle">
    <div :style="backgroundOverlayStyle"></div> 
    
    <div :style="welcomeSectionStyle">
      <div :style="logoWrapStyle">
        <img :src="logoSrc" :alt="'Logo'" :style="logoStyle" />
      </div>
      
      <h1 :style="welcomeTextStyle">HELLO, WELCOME!</h1>
      
      <div :style="descStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</div>
      
      <div :style="registerBoxStyle">
        <div :style="registerPromptStyle">Don't have an account?</div>
        <button :style="registerButtonStyle" @click="goToRegister">Register</button>
      </div>
    </div>
    
    <div :style="loginSectionStyle">
      <div :style="loginBoxStyle">
        <h2 :style="loginHeaderStyle">LOG IN</h2>
        <div v-if="errorMessage" :style="errorStyle">{{ errorMessage }}</div>
        <form @submit.prevent="login">
          <div :style="formGroupStyle">
            <input 
              v-model="user.email" 
              type="email" 
              placeholder="Email"
              :style="inputStyle"
              required
              :disabled="isLoading"
            />
          </div>
          <div :style="formGroupStyle">
            <input 
              v-model="user.password" 
              type="password" 
              placeholder="Password"
              :style="inputStyle"
              required
              :disabled="isLoading"
            />
          </div>
          <div :style="forgotStyle" @click="goToForgot">Forgot Password</div>
          <button :style="loginButtonStyle" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// NOTE: axios import is removed as we are using the configured 'api' instance
import api from '@/services/api'; //api link - THIS is the instance with the base URL configured
import background from '@/assets/BACKGROUND.jpg'; 
import logo from '@/assets/ISULOGO.png'; 


export default {
  name: 'LoginPage',
  data() {
    return {
      user: {
        email: '',
        password: ''
      },
      logoSrc: logo,
      backgroundSrc: background,
      errorMessage: '',
      isLoading: false
    };
  },
  methods: {
    async login() {
      this.errorMessage = '';
      this.isLoading = true;

      try {
        if (!this.user.email || !this.user.password) {
          this.errorMessage = 'Please enter email and password';
          this.isLoading = false;
          return;
        }

        // CORRECTED: Use the imported 'api' instance for the POST request
        const response = await api.post('/login', {
          email: this.user.email,
          password: this.user.password
        });

        if (response.data.token && response.data.user) {
          const user = response.data.user;
          
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(user));
          
          const userRole = user.role ? user.role.toLowerCase() : 'default';

          if (userRole === 'admin') {
            this.$router.push({ name: 'AdminDashboard' });
          } else {
            this.$router.push({ name: 'UserDashboard' });
          }
        } else {
          this.errorMessage = 'Login failed: No token or user data received';
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else if (error.response && error.response.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.code === 'ERR_NETWORK') {
          this.errorMessage = 'Unable to connect to the server. Please check your network connection and ensure the backend server is running.';
        } else {
          this.errorMessage = 'Login failed. Please check network connection.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    goToRegister() {
      this.$router.push('/register');
    },
    goToForgot() {
      // Optional: route to forgot page or show modal
    }
  },
  computed: {
    containerStyle() {
      return {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundImage: `url(${this.backgroundSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      };
    },
    backgroundOverlayStyle() {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      };
    },
    welcomeSectionStyle() {
      // The main container for the left side is now transparent, relying on the logo and a pseudo-element for the color overlay
      return {
        background: 'transparent', // Set main background to transparent
        color: '#fff',
        flex: '0.45',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        borderRadius: '0',
        zIndex: 3,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden', 
        position: 'relative', 
        '--dark-green-overlay': '#1d3e21e0',
      };
    },
    logoWrapStyle() {
      return {
        position: 'absolute',
        top: '0',
        left: '0', 
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 1, 
        background: '#1d3e21e0', 
      };
    },
    logoStyle() {
      return {
        maxWidth: 'auto',
        maxHeight: '100%',
        height: '100%',
        width: 'auto',
        opacity: 0.18, 
        zIndex: 2,
        filter: 'blur(3px)',
        transform: 'scale(1.5) translateX(-25%)',
      };
    },
    welcomeTextStyle() {
      return {
        fontSize: '2.5rem',
        marginTop: '0',
        fontWeight: 'bold',
        letterSpacing: '1px',
        zIndex: 4,
      };
    },
    descStyle() {
      return {
        fontSize: '1.2rem',
        fontWeight: 'normal',
        margin: '18px 0 10px 0',
        zIndex: 4,
        textAlign: 'center',
        color: '#ccc',
      };
    },
    registerBoxStyle() {
      return {
        zIndex: 4,
        marginTop: '30px',
        textAlign: 'center'
      };
    },
    registerPromptStyle() {
      return {
        marginBottom: '10px',
        fontSize: '0.95rem'
      };
    },
    registerButtonStyle() {
      return {
        padding: '10px 30px',
        background: '#e3e3e3',
        color: '#1d3e21',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      };
    },
    loginSectionStyle() {
      return {
        flex: '0.35',
        background: '#f8fff8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        padding: '20px',
        borderRadius: '20px',
        zIndex: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        marginLeft: '-30px',
      };
    },
    loginBoxStyle() {
      return {
        width: '320px',
        background: 'transparent',
        padding: '0',
        display: 'flex',
        flexDirection: 'column'
      };
    },
    loginHeaderStyle() {
      return {
        color: '#1d3e21',
        fontWeight: '900',
        fontSize: '2.5rem',
        marginBottom: '40px',
        textAlign: 'center',
        letterSpacing: '3px'
      };
    },
    formGroupStyle() {
      return {
        marginBottom: '20px',
        width: '100%'
      };
    },
    inputStyle() {
      return {
        width: '100%',
        padding: '14px 16px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '10px',
        background: '#e6f0e7',
        outline: 'none',
        color: '#333',
        fontWeight: 'normal',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
      };
    },
    forgotStyle() {
      return {
        color: '#1d3e21',
        fontSize: '0.9rem',
        cursor: 'pointer',
        textAlign: 'right',
        margin: '0 5px 25px 0'
      };
    },
    loginButtonStyle() {
      return {
        width: '100%',
        padding: '12px 0',
        background: '#1d3e21',
        color: '#fff',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        opacity: this.isLoading ? 0.7 : 1,
        transition: 'opacity 0.2s',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
      };
    },
    errorStyle() {
      return {
        color: '#d32f2f',
        fontSize: '0.9rem',
        marginBottom: '16px',
        padding: '8px 10px',
        background: '#ffebee',
        borderRadius: '4px',
        border: '1px solid #ef5350'
      };
    }
  }
};
</script>

<style scoped>
/* Scoped CSS for the form styling */
</style>