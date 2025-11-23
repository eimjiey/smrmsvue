// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css' // Ensure this file exists, or remove the line
import router from './router'

// 1. Create the application instance
const app = createApp(App)

// 2. Use application-level assets (plugins, routers, stores, etc.)
app.use(router)

// 3. Mount the application to a specific DOM element
app.mount('#app')