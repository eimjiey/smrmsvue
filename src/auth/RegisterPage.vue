<template>
  <div :style="containerStyle">
    <div :style="backgroundOverlayStyle"></div>

    <div :style="cardStyle">
      <div :style="registerSectionStyle">
        <div :style="registerBoxStyle">
          <h2 :style="registerHeaderStyle">REGISTRATION</h2>

          <div v-if="registrationSuccessMessage" :style="successStyle">
            {{ registrationSuccessMessage }}
          </div>
          <div v-if="errorMessage" :style="errorStyle">
            {{ errorMessage }}
          </div>

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
                @input="checkPasswordValidity"
              />
              <div :style="validationListStyle">
                <ul :style="ulStyle">
                  <li :style="getRuleStyle(validation.length)">
                    8 - 20 characters
                  </li>
                  <li :style="getRuleStyle(validation.capital)">
                    At least one capital letter (A to Z)
                  </li>
                  <li :style="getRuleStyle(validation.lower)">
                    At least one lowercase letter (a to z)
                  </li>
                  <li :style="getRuleStyle(validation.number)">
                    At least one number (0 to 9)
                  </li>
                  <li :style="getRuleStyle(validation.special)">
                    At least one special character (e.g., !@#$...)
                  </li>
                  <li :style="getRuleStyle(validation.noForbidden)">
                    Don't use : . ' " / \
                  </li>
                  <li :style="getRuleStyle(validation.noSpaces)">
                    No spaces
                  </li>
                </ul>
              </div>
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

            <button
              :style="registerButtonStyle"
              type="submit"
              :disabled="isLoading || !isPasswordValid"
            >
              {{ isLoading ? 'Registering...' : 'Register' }}
            </button>
          </form>
        </div>
      </div>

      <div :style="welcomeSectionStyle">
        <div :style="logoWrapStyle">
          <img :src="logoSrc" alt="Logo" :style="logoStyle" />
        </div>

        <h1 :style="welcomeTextStyle">WELCOME BACK!</h1>

      <div :style="descStyle">MISCONTRACK </div>
      <div :style="desStyle">"Providing a Smarter Approach and Secure Reporting You Can Rely On."</div>

        <div :style="loginBoxStyle">
          <div :style="loginPromptStyle">Already have an account?</div>
          <button :style="loginButtonStyle" @click="goToLogin">
            Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import background from '@/assets/BACKGROUND.jpg';
import logo from '@/assets/SMRMS.png';

// Import the API service methods instead of configuring axios globally
import api from '@/services/api'; 

export default {
  name: 'RegisterPage',
  data() {
    return {
      user: {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      },
      logoSrc: logo,
      backgroundSrc: background,
      errorMessage: '',
      registrationSuccessMessage: '',
      isLoading: false,
      validation: {
        length: false,
        capital: false,
        lower: false,
        number: false,
        special: false,
        noForbidden: false,
        noSpaces: false,
      },
    };
  },
  methods: {
    checkPasswordValidity() {
      const p = this.user.password || '';

      this.validation.length = p.length >= 8 && p.length <= 20;
      this.validation.capital = /[A-Z]/.test(p);
      this.validation.lower = /[a-z]/.test(p);
      this.validation.number = /[0-9]/.test(p);
      this.validation.special = /[^\w\s]/.test(p);
      this.validation.noForbidden = !/[:.'"/\\]/.test(p);
      this.validation.noSpaces = !/\s/.test(p);

      if (
        this.errorMessage &&
        this.errorMessage === 'Passwords do not match.'
      ) {
        this.errorMessage = '';
      }
    },

    getRuleStyle(isValid) {
      return {
        color: isValid ? '#1d3e21' : '#a94442',
        fontWeight: isValid ? 'bold' : 'normal',
        listStyleType: 'none',
        paddingLeft: '15px',
        position: 'relative',
        fontSize: '0.9rem',
        marginBottom: '5px',
      };
    },

    async register() {
      this.errorMessage = '';
      this.registrationSuccessMessage = '';
      this.isLoading = true;

      const payload = {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        password_confirmation: this.user.password_confirmation,
      };

      if (!this.isPasswordValid) {
        this.errorMessage =
          'Password does not meet all security requirements.';
        this.isLoading = false;
        return;
      }

      if (payload.password !== payload.password_confirmation) {
        this.errorMessage = 'Passwords do not match.';
        this.isLoading = false;
        return;
      }

      try {
        // Use the 'post' method from the imported API service
        const response = await api.post('/register', payload);

        if (response.status === 201) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          // Clear form and validation
          this.user.name = '';
          this.user.email = '';
          this.user.password = '';
          this.user.password_confirmation = '';
          this.checkPasswordValidity();

          this.registrationSuccessMessage =
            'User successfully registered! You can now log in.';

          // Note: Pushing to /register again might be a typo, usually it's /login or /dashboard
          // Keeping it as you wrote, but it should probably be this.$router.push('/login');
          this.$router.push('/register'); 
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          'Registration failed due to a server error.';
        this.errorMessage = message;
        console.error('Registration failed:', error.response?.data || error);
      } finally {
        this.isLoading = false;
      }
    },

    goToLogin() {
      this.$router.push('/login');
    },
  },
  computed: {
    isPasswordValid() {
      return Object.values(this.validation).every((rule) => rule === true);
    },

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
        zIndex: 1,
      };
    },

    /* NEW: outer card so both sides share height, radius, and shadow */
    cardStyle() {
      return {
        display: 'flex',
        width: '70%',
        minHeight: '600px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 3,
        background: '#f8fff8',
      };
    },

    registerSectionStyle() {
      return {
        flex: 1,
        background: '#f8fff8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      };
    },

    registerBoxStyle() {
      return {
        width: '320px',
        background: 'transparent',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
      };
    },

    registerHeaderStyle() {
      return {
        color: '#1d3e21',
        fontWeight: '900',
        fontSize: '2.5rem',
        marginBottom: '40px',
        textAlign: 'center',
        letterSpacing: '3px',
      };
    },

    formGroupStyle() {
      return {
        marginBottom: '15px',
        width: '100%',
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
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
      };
    },

    registerButtonStyle() {
      const disabled = this.isLoading || !this.isPasswordValid;
      return {
        width: '100%',
        padding: '12px 0',
        background: '#1d3e21',
        color: '#fff',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: '20px',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.2s',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
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
        border: '1px solid #ef5350',
      };
    },

    successStyle() {
      return {
        color: '#1d3e21',
        fontSize: '0.9rem',
        marginBottom: '16px',
        padding: '8px 10px',
        background: '#e8f5e9',
        borderRadius: '4px',
        border: '1px solid #4caf50',
      };
    },

    validationListStyle() {
      return {
        marginTop: '10px',
        padding: '10px',
        background: '#f1f1f1',
        borderRadius: '5px',
        border: '1px solid #ddd',
      };
    },

    ulStyle() {
      return {
        listStyle: 'none',
        padding: '0',
        margin: '0',
      };
    },

    welcomeSectionStyle() {
      return {
        flex: 1,
        background: '#1d3e21',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        position: 'relative',
      };
    },

    logoWrapStyle() {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
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
        marginTop: 0,
        fontWeight: 'bold',
        letterSpacing: '1px',
        zIndex: 4,
      };
    },

    descStyle() {
      return {
        fontSize: '1.8rem',
        fontWeight: 'Bold',
        margin: '10px 0 10px 0',
        zIndex: 1,
        textAlign: 'center',
        color: '#ccc',
      };

          },
    desStyle() {
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
        textAlign: 'center',
      };
    },

    loginPromptStyle() {
      return {
        marginBottom: '10px',
        fontSize: '0.95rem',
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
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      };
    },
  },
};
</script>

<style scoped>
/* All layout handled with inline styles */
</style>