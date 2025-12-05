<template>
  <div :style="containerStyle">
    <div :style="backgroundOverlayStyle"></div> 
    
    <div :style="registerSectionStyle">
      <div :style="registerBoxStyle">
        <h2 :style="registerHeaderStyle">REGISTRATION</h2>
        
        <div v-if="registrationSuccessMessage" :style="successStyle">{{ registrationSuccessMessage }}</div>
        <div v-if="errorMessage" :style="errorStyle">{{ errorMessage }}</div>
        
        <form @submit.prevent="register">
          
          <div :style="formGroupStyle">
            <input 
              v-model="user.name" 
              type="text" 
              placeholder="Name"
              :style="inputStyle"
              required
              :disabled="isLoading"
            />
          </div>
          
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

          <div :style="formGroupStyle">
            <input 
              v-model="user.password_confirmation" 
              type="password" 
              placeholder="Confirm Password"
              :style="inputStyle"
              required
              :disabled="isLoading"
            />
          </div>

          <button :style="registerButtonStyle" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </form>
      </div>
    </div>
    
    <div :style="welcomeSectionStyle">
      <div :style="logoWrapStyle">
        <img :src="logoSrc" :alt="'Logo'" :style="logoStyle" />
      </div>
      
      <h1 :style="welcomeTextStyle">WELCOME BACK!</h1>
      
      <div :style="descStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</div>
      
      <div :style="loginBoxStyle">
        <div :style="loginPromptStyle">Already have an account?</div>
        <button :style="loginButtonStyle" @click="goToLogin">Login</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import background from '@/assets/BACKGROUND.jpg'; 
import logo from '@/assets/SMRMS.png'; 

axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://127.0.0.1:8000/api';

export default {
  name: 'RegisterPage',
  data() {
    return {
      user: {
        name: '', 
        email: '',
        password: '',
        password_confirmation: '' 
      },
      logoSrc: logo,
      backgroundSrc: background,
      errorMessage: '',
      registrationSuccessMessage: '', 
      isLoading: false
    };
  },
  methods: {
    async register() {
      this.errorMessage = '';
      this.registrationSuccessMessage = ''; 
      this.isLoading = true;
      
      const payload = {
        name: this.user.name, 
        email: this.user.email,
        password: this.user.password,
        password_confirmation: this.user.password_confirmation
      };
      
      if (payload.password !== payload.password_confirmation) {
        this.errorMessage = "Passwords do not match.";
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post('/register', payload); 

        if (response.status === 201) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          console.log('Registration successful:', response.data.user);
          
          // Clear form fields
          this.user.name = '';
          this.user.email = '';
          this.user.password = '';
          this.user.password_confirmation = '';

          // Set success message
          this.registrationSuccessMessage = "User successfully registered! You can now log in.";
          
          // *** FIX: Use path '/register' to prevent "No match for name" error ***
          this.$router.push('/register'); 
        }
      } catch (error) {
        // Handle errors
        const message = error.response?.data?.message || 'Registration failed due to a server error.';
        this.errorMessage = message;
        console.error('Registration failed:', error.response?.data || error);
      } finally {
        this.isLoading = false;
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  },
  computed: {
    // --- General Container Styles (Background Fit) ---
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
    // --- 1. Registration Form Section (Left, Light Green) ---
    registerSectionStyle() {
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
    registerBoxStyle() {
      return {
        width: '320px',
        background: 'transparent',
        padding: '0',
        display: 'flex',
        flexDirection: 'column'
      };
    },
    registerHeaderStyle() {
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
        marginBottom: '15px', 
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
    registerButtonStyle() {
      return {
        width: '100%',
        padding: '12px 0',
        background: '#1d3e21',
        color: '#fff',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        cursor: this.isLoading ? 'not-allowed' : 'pointer',
        marginTop: '20px',
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
    },
    // Style for success message
    successStyle() {
      return {
        color: '#1d3e21',
        fontSize: '0.9rem',
        marginBottom: '16px',
        padding: '8px 10px',
        background: '#e8f5e9',
        borderRadius: '4px',
        border: '1px solid #4caf50'
      };
    },
    // --- 2. Welcome Back Section (Right, Dark Green) ---
    welcomeSectionStyle() {
      return {
        flex: '0.4',
        background: 'transparent',
        color: '#fff',
        minHeight: '600px', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        borderRadius: '0 20px 20px 0',
        zIndex: 3, 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden', 
        position: 'relative', 
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
        transform: 'scale(1.5) translateX(25%)',
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
    loginBoxStyle() {
      return {
        zIndex: 4,
        marginTop: '30px',
        textAlign: 'center'
      };
    },
    loginPromptStyle() {
      return {
        marginBottom: '10px',
        fontSize: '0.95rem'
      };
    },
    loginButtonStyle() {
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
  }
};
</script>

<style scoped>
/* Scoped CSS is empty as all styling is handled via computed properties */
</style>