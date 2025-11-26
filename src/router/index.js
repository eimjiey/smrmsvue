import { createRouter, createWebHistory } from 'vue-router'

// --- Component Imports (no change) ---
import LoginPage from '@/auth/LoginPage.vue'
import RegisterPage from '@/auth/RegisterPage.vue'
import HomeView from '@/views/HomeView.vue'
import UserDashboard from '@/pages/user/UserDashboard.vue'
import FileIncidentReport from '@/pages/user/FileIncidentForm.vue'
import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AddStudent from '@/pages/admin/AddStudent.vue'
import StudentsList from '@/pages/admin/StudentsList.vue'
import AdminIncidents from '@/pages/admin/AdminIncidents.vue'
import EditIncident from '@/pages/admin/EditIncident.vue'

const routes = [
  // Default Redirect: '/' redirects to '/login'
  { path: '/', redirect: '/login' },

  // Public/Auth Routes (no change)
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },

  // Basic Views (Optional - no change)
  { path: '/home', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: () => import('@/views/AboutView.vue') },

  // User Routes (Keeping the fixed path from earlier)
  { path: '/user/dashboard', name: 'UserDashboard', component: UserDashboard }, 
  { path: '/user/profile', name: 'UserProfile', component: () => import('@/pages/user/UserProfile.vue') },
  { path: '/file-incident-report', name: 'FileIncidentReport', component: FileIncidentReport },

  // --- ADMIN ROUTE FIX/SIMPLIFICATION ---
  { 
    // Simplified path for main admin dashboard
    path: '/admin', 
    name: 'AdminDashboard', 
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true } 
  },
  // Admin student management
  { path: '/admin/students', name: 'AdminStudents', component: StudentsList, meta: { requiresAuth: true, isAdmin: true } },
  { path: '/admin/students/add', name: 'AddStudent', component: AddStudent, meta: { requiresAuth: true, isAdmin: true } },
  
  // INCIDENT ROUTE <--- ADDED THIS DEFINITION
  { 
    path: '/admin/incidents', 
    name: 'AdminIncidents', // This name is used by the AdminDashboard button
    component: AdminIncidents, 
    meta: { requiresAuth: true, isAdmin: true } 
  },

    // 2. ADD NEW EDIT ROUTE WITH DYNAMIC ID
  { 
    path: '/admin/incidents/edit/:id', 
    name: 'EditIncident', // <-- New Route Name
    component: EditIncident, 
    props: true, // Pass route params as props
    meta: { requiresAuth: true, isAdmin: true } 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router