<template>
  <div :style="containerStyle">
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
import axios from 'axios';
import logo from '@/assets/ISULOGO.png';

axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://192.168.1.243:8000/api';

export default {
  name: 'LoginPage',
  data() {
    return {
      user: {
        email: '',
        password: ''
      },
      logoSrc: logo,
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

        const response = await axios.post('/login', {
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
        background: '#181818',
        fontFamily: 'Arial, sans-serif'
      };
    },
    welcomeSectionStyle() {
      return {
        background: '#0a8805',
        color: '#fff',
        flex: '0.55',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: '40px',
        borderBottomLeftRadius: '40px',
        position: 'relative'
      };
    },
    logoWrapStyle() {
      return {
        opacity: 0.18,
        position: 'absolute',
        left: '25px',
        top: '25px',
        width: '100%',
        height: '80%',
        display: 'flex',
        justifyContent: 'center'
      };
    },
    logoStyle() {
      return {
        maxWidth: '400px',
        maxHeight: '400px',
        zIndex: 1
      };
    },
    welcomeTextStyle() {
      return {
        fontSize: '2.2rem',
        marginTop: '120px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        zIndex: 2
      };
    },
    descStyle() {
      return {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        margin: '24px 0 18px 0',
        zIndex: 2,
        textAlign: 'center'
      };
    },
    registerBoxStyle() {
      return {
        zIndex: 2,
        marginTop: '35px',
        textAlign: 'center'
      };
    },
    registerPromptStyle() {
      return {
        marginBottom: '12px'
      };
    },
    registerButtonStyle() {
      return {
        padding: '10px 22px',
        background: '#e3e3e3',
        color: '#0a8805',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1.1rem',
        cursor: 'pointer'
      };
    },
    loginSectionStyle() {
      return {
        flex: '0.45',
        background: '#f2ffee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    },
    loginBoxStyle() {
      return {
        width: '380px',
        background: 'transparent',
        borderRadius: '10px',
        padding: '44px 0 0 0',
        display: 'flex',
        flexDirection: 'column'
      };
    },
    loginHeaderStyle() {
      return {
        color: '#16802b',
        fontWeight: 'bold',
        fontSize: '2rem',
        marginBottom: '34px',
        textAlign: 'center',
        letterSpacing: '2px'
      };
    },
    formGroupStyle() {
      return {
        marginBottom: '22px',
        width: '100%'
      };
    },
    inputStyle() {
      return {
        width: '100%',
        padding: '12px',
        marginBottom: '0px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '6px',
        background: '#e8e8e8',
        outline: 'none',
        color: '#16802b',
        fontWeight: 'bold'
      };
    },
    forgotStyle() {
      return {
        color: '#15802b',
        fontSize: '1rem',
        cursor: 'pointer',
        margin: '8px 0 22px 2px'
      };
    },
    loginButtonStyle() {
      return {
        width: '100%',
        padding: '11px 0',
        background: '#15802b',
        color: '#fff',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '7px',
        fontSize: '1.09rem',
        cursor: 'pointer',
        opacity: this.isLoading ? 0.7 : 1,
        transition: 'opacity 0.2s'
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