import { createRouter, createWebHistory } from 'vue-router'

// --- Component Imports ---
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
import UserReportHistory from '@/pages/user/UserReportHistory.vue';
// Assuming you have this file for the Student Directory feature:
import UserStudents from '@/pages/user/UserStudents.vue' 

const routes = [
  // Default Redirect: '/' redirects to '/login'
  { path: '/', redirect: '/login' },

  // Public/Auth Routes
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },

  // Basic Views
  { path: '/home', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: () => import('@/views/AboutView.vue') },

// --------------------------------------------------------------------------------
// ## USER ROUTES
// --------------------------------------------------------------------------------
  { path: '/user/dashboard', name: 'UserDashboard', component: UserDashboard }, 
  { path: '/user/profile', name: 'UserProfile', component: () => import('@/pages/user/UserProfile.vue') },
  { path: '/file-incident-report', name: 'FileIncidentReport', component: FileIncidentReport },

  // NEW USER ROUTES (Organized)
  { 
    path: '/user/my-reports',
    name: 'UserReportHistory', // Route for the user's filed report list
    component: UserReportHistory,
    meta: { requiresAuth: true }
  },
  { 
    path: '/user/students', 
    name: 'UserStudents', // Route for the user's student directory
    component: UserStudents,
    meta: { requiresAuth: true }
  },

// --------------------------------------------------------------------------------
// ## ADMIN ROUTES
// --------------------------------------------------------------------------------
  { 
    path: '/admin', 
    name: 'AdminDashboard', 
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true } 
  },
  // Admin student management
  { path: '/admin/students', name: 'AdminStudents', component: StudentsList, meta: { requiresAuth: true, isAdmin: true } },
  { path: '/admin/students/add', name: 'AddStudent', component: AddStudent, meta: { requiresAuth: true, isAdmin: true } },
  
  // INCIDENT ROUTES
  { 
    path: '/admin/incidents', 
    name: 'AdminIncidents',
    component: AdminIncidents, 
    meta: { requiresAuth: true, isAdmin: true } 
  },

  // EDIT INCIDENT ROUTE
  { 
    path: '/admin/incidents/edit/:id', 
    name: 'EditIncident', 
    component: EditIncident, 
    props: true, 
    meta: { requiresAuth: true, isAdmin: true } 
  },

  { 
    path: '/user/my-reports', // <-- The correct path in your router
    name: 'UserReportHistory',
    component: UserReportHistory,
    meta: { requiresAuth: true }
  },
  { 
    path: '/user/students', 
    name: 'UserStudents', // Route for the user's student directory
    component: UserStudents,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router