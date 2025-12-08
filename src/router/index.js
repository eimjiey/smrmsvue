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
import UserReportHistory from '@/pages/user/UserReportHistory.vue'
import UserStudents from '@/pages/user/UserStudents.vue'
import ReportDetails from '@/pages/user/ReportDetails.vue' 
import CertificateGenerator from '@/pages/admin/CertificateGenerator.vue';
import ViewPrescriptive from '@/pages/admin/ViewPrescriptive.vue';
// 🔑 NEW IMPORT: Incident Trash Component (assuming filename is IncidentTrash.vue in the admin folder)
import IncidentTrash from '@/pages/admin/IncidentTrash.vue'; 

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
    { path: '/user/dashboard', name: 'UserDashboard', component: UserDashboard, meta: { requiresAuth: true } },
    { path: '/user/profile', name: 'UserProfile', component: () => import('@/pages/user/UserProfile.vue'), meta: { requiresAuth: true } },
    { path: '/file-incident-report', name: 'FileIncidentReport', component: FileIncidentReport, meta: { requiresAuth: true } },

    // User Reports
    {
        path: '/user/my-reports',
        name: 'UserReportHistory',
        component: UserReportHistory,
        meta: { requiresAuth: true }
    },
    {
        path: '/reports/:id',
        name: 'ReportDetails', // This is the correct route name
        component: ReportDetails,
        props: true,
        meta: { requiresAuth: true }
    },

    // User Student Directory
    {
        path: '/user/students',
        name: 'UserStudents',
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

    // 🔑 NEW ROUTE: Incident Trash View (Soft Deleted Reports)
    {
        path: '/admin/incidents/trash',
        name: 'IncidentTrash', // This name resolves the runtime error
        component: IncidentTrash, // Component imported above
        meta: { requiresAuth: true, isAdmin: true }
    },

    // EDIT INCIDENT ROUTE (Admin)
    {
        path: '/admin/incidents/edit/:id',
        name: 'EditIncident',
        component: EditIncident,
        props: true,
        meta: { requiresAuth: true, isAdmin: true }
    },

    {
        path: '/admin/certificate-generator',
        name: 'AdminCertificateGenerator',
        component: CertificateGenerator,
        meta: { requiresAuth: true }
    },

    {
        path: '/certificates',
        name: 'CertificateGenerator',
        component: CertificateGenerator
    },
    

    {
        path: '/admin/profile',
        name: 'AdminProfile',
        component: () => import('@/pages/admin/AdminProfile.vue')
    },

    {
        path: '/incident/view/:id', // The URL structure you want (e.g., /incident/view/38)
        name: 'ViewPrescriptive', 
        component: ViewPrescriptive,
        props: true 
    },
    {
    path: '/about-us',
    name: 'AboutUs',
    component: () => import('@/pages/AboutUs.vue'),
    }


]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router