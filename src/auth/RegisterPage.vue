<template>
    <div class="register-container">
        <h2>Register Account</h2>

        <form class="register-form" @submit.prevent="register">
        <div class="form-group">
            <label for="name">Name</label>
            <input v-model="user.name" type="text" id="name" required />
        </div>

        <div class="form-group">
            <label for="email">Email</label>
            <input v-model="user.email" type="email" id="email" required />
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input v-model="user.password" type="password" id="password" required />
        </div>

        <div class="form-group">
            <label for="password_confirmation">Confirm Password</label>
            <input v-model="user.password_confirmation" type="password" id="password_confirmation" required />
        </div>

        <button type="submit" class="btn btn-register">Register</button>
        </form>

        <p class="login-link">Already have an account? <router-link to="/login">Login here</router-link></p>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'RegisterPage',
    data() {
        return {
            user: {
                name: '',
                email: '',
                password: '',
                password_confirmation: '' 
            }
        };
    },
    methods: {
        async register() {
            try {
                const response = await axios.post('/register', this.user); 

                if (response.status === 201) {
                    const token = response.data.token;
                    const registeredUser = response.data.user;

                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(registeredUser));

                    console.log('Registration successful:', registeredUser);
                    
                    this.$router.push('/dashboard'); 
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Registration failed due to a server error.';
                
                console.error('Registration failed:', error.response?.data || error);
                
                alert(errorMessage);
            }
        }
    }
}
</script>