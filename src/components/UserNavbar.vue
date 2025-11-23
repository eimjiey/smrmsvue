<template>
    <nav class="navbar">
        <div class="nav-left">
        <div class="logo" @click="$router.push('/user/dashboard')">
            <i class="fas fa-search"></i>
            <div class="logo-text">
            <span class="brand">SMRMS</span>
            <span class="tagline"></span>
            </div>
        </div>

        <ul class="nav-menu">
            <li><router-link to="/user/dashboard">Home</router-link></li>
            <li><router-link to="/file-incident-report">File Incident Report</router-link></li>
            <li><router-link to="/user/profile">Profile</router-link></li>
        </ul>
        </div>

        <!-- notification bell -->
        <!-- <div class="nav-right">
        <i class="fas fa-bell" @click="$router.push('/user/notification')">
            <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </i> -->

        <div class="hamburger" @click="toggleMenu">
            <span :class="{ open: isOpen }"></span>
            <span :class="{ open: isOpen }"></span>
            <span :class="{ open: isOpen }"></span>
        </div>

    </nav>
</template>

<script>
export default {
    name: "UserNavbar",
    data() {
        return {
        isOpen: false,
        unreadCount: 3, 
        };
    },
    methods: {
        toggleMenu() {
        this.isOpen = !this.isOpen;
        },
    },
};
</script>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #3490dc;
    color: white;
    position: relative;
}

.nav-left {
    display: flex;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.logo i {
    margin-right: 8px;
}

.logo-text .brand {
    font-weight: bold;
    margin-right: 4px;
}

.nav-menu {
    display: flex;
    list-style: none;
    margin-left: 20px;
}

.nav-menu li {
    margin-right: 15px;
}

.nav-menu li a {
    color: white;
    text-decoration: none;
}

.nav-right {
    display: flex;
    align-items: center;
}

.nav-right i {
    font-size: 18px;
    cursor: pointer;
    position: relative;
}

.badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: red;
    color: white;
    font-size: 10px;
    border-radius: 50%;
    padding: 2px 5px;
}

.hamburger {
    display: none;
    flex-direction: column;
    cursor: pointer;
    margin-left: 15px;
}

.hamburger span {
    width: 25px;
    height: 3px;
    background: white;
    margin: 3px 0;
    transition: 0.3s;
}

.hamburger span.open:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger span.open:nth-child(2) {
    opacity: 0;
}

.hamburger span.open:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu {
    display: none;
    flex-direction: column;
    background-color: #3490dc;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    padding: 10px 0;
}

.mobile-menu li {
    padding: 10px 20px;
}

.mobile-menu li a {
    color: white;
    text-decoration: none;
}

@media (max-width: 768px) {
    .nav-menu {
    display: none;
    }
    .hamburger {
        display: flex;
    }
    .mobile-menu {
        display: flex;
    }
}
</style>
