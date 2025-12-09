<template>
    <AdminNavbar>
        <div class="profile-page">
            <h1 class="page-title">PROFILE</h1>


            <form class="profile-layout" @submit="handleProfileUpdate">
                <div
                    v-if="statusMessage"
                    class="status-banner"
                    :class="statusType === 'success' ? 'status-banner--success' : 'status-banner--error'"
                >
                    <strong>{{ statusType === 'success' ? 'Success:' : 'Error:' }}</strong>
                    <span>{{ statusMessage }}</span>
                </div>


                <section class="card card--top">
                    <div class="card-top-inner">
                        
                        <div class="card-header-actions">
                            <button 
                                v-if="!isEditingName"
                                type="button" 
                                class="btn-edit-name" 
                                @click="toggleEditName"
                                :disabled="isLoading"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="edit-icon"><path d="M19.0858 5.08579C19.4763 4.69527 20.1095 4.69527 20.5001 5.08579C20.8906 5.47631 20.8906 6.10947 20.5001 6.50001L9.75742 17.2426C9.3669 17.6331 8.73373 17.6331 8.34321 17.2426L3.49998 12.4C3.10946 12.0095 3.10946 11.3763 3.49998 10.9858C3.8905 10.5953 4.52367 10.5953 4.91419 10.9858L9.07096 15.1425L19.0858 5.08579Z"/></svg>
                                EDIT NAME
                            </button>
                            <button 
                                v-if="isEditingName"
                                type="button" 
                                class="btn-cancel-edit" 
                                @click="cancelEditName"
                                :disabled="isSubmitting || isLoading"
                            >
                                CANCEL
                            </button>
                        </div>
                        <div class="avatar-wrapper">
                            <div class="avatar-circle">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="#999999"
                                    class="human-icon"
                                >
                                    <path d="M12 2C15.3137 2 18 4.68629 18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8C6 4.68629 8.68629 2 12 2ZM12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4ZM4 22C4 18.6863 6.68629 16 10 16H14C17.3137 16 20 18.6863 20 22H18C18 19.7909 16.2091 18 14 18H10C7.79086 18 6 19.7909 6 22H4Z" />
                                </svg>
                            </div>
                        </div>


                        <div class="info-panel">
                            <div class="info-row">
                                <div class="field-group">
                                    <label>NAME</label>
                                    <input
                                        v-model="user.name"
                                        type="text"
                                        required
                                        :disabled="!isEditingName || isSubmitting || isLoading"
                                        :class="{'field--readonly': !isEditingName}"
                                    />
                                </div>
                                <div class="field-group">
                                    <label>ROLE</label>
                                    <input
                                        :value="user.role"
                                        disabled
                                        class="field--readonly"
                                    />
                                </div>
                            </div>


                            <div class="info-row">
                                <div class="field-group field-group--full">
                                    <label>EMAIL ADDRESS</label>
                                    <input
                                        :value="user.email"
                                        type="email"
                                        required
                                        disabled
                                        class="field--readonly"
                                    />
                                </div>
                            </div>

                            <div class="inline-actions">
                                <button type="button" class="btn-utility-shared" @click="showLogoutConfirmation">
                                    LOGOUT
                                </button>
                                
                                <button
                                    type="submit"
                                    class="btn-utility-shared"
                                    :class="{'btn-utility-disabled': isUpdateDisabled}"
                                    :disabled="isUpdateDisabled"
                                >
                                    {{ isSubmitting ? 'SAVING…' : 'UPDATE PROFILE' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>


                <div class="bottom-row">
                    <div class="utility-actions">
                        <button type="button" class="btn-utility-shared" @click="goToLoginHistory">
                            LOGIN HISTORY
                        </button>
                        
                        <button type="button" class="btn-utility-shared" @click="goToAuditLogs">
                            AUDIT LOGS
                        </button>
                    </div>
                </div>


                <div v-if="isLoading" class="loading-overlay">
                    <span>Loading profile…</span>
                </div>
            </form>
        </div>


        <div v-if="isLogoutModalOpen" class="modal-overlay">
            <div class="modal-content">
                <h3 class="modal-title">Confirm Logout</h3>
                <p class="modal-message">Are you sure you want to log out of your account?</p>
                <div class="modal-actions">
                    <button class="btn-modal-cancel" @click="isLogoutModalOpen = false">
                        Cancel
                    </button>
                    <button class="btn-modal-logout" @click="logout">
                        Yes, Log Out
                    </button>
                </div>
            </div>
        </div>
        </AdminNavbar>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'; 
import api from '@/services/api';
import { useRouter } from 'vue-router';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';


const router = useRouter();


const user = reactive({
    id: null,
    name: '',
    email: '',
    role: '',
    originalName: '',
    originalEmail: '',
});


const isLoading = ref(true);
const isSubmitting = ref(false);
const statusMessage = ref(null);
const statusType = ref('');
const isLogoutModalOpen = ref(false); 

// STATE: Controls whether the Name input field is editable
const isEditingName = ref(false); 


const fetchProfile = async () => {
    isLoading.value = true;
    statusMessage.value = null;
    try {
        const { data } = await api.get('/me');


        user.id = data.id;
        user.name = data.name;
        user.email = data.email;
        user.role = data.role;


        user.originalName = data.name;
        user.originalEmail = data.email;
    } catch (error) {
        statusType.value = 'error';
        const networkError =
            error.message && error.message.toLowerCase().includes('network');
        statusMessage.value = networkError
            ? 'Network error: unable to reach the server.'
            : error.response?.data?.message || 'Failed to load profile data.';
    } finally {
        isLoading.value = false;
    }
};

// FUNCTION: Enable name editing state
const toggleEditName = () => {
    isEditingName.value = true; 
};

// FUNCTION: Cancel editing name
const cancelEditName = () => {
    user.name = user.originalName; // Revert name back to original value
    isEditingName.value = false; // Disable editing mode
};

// COMPUTED: Checks if the current name differs from the original name
const hasNameChanged = computed(() => {
    return user.name !== user.originalName;
});

// COMPUTED: Determines if the Update button should be enabled
const isUpdateDisabled = computed(() => {
    // Disabled if submitting, loading, not in edit mode, OR if in edit mode but no changes made
    return isSubmitting.value || isLoading.value || !isEditingName.value || !hasNameChanged.value;
});


const handleProfileUpdate = async (event) => {
    event.preventDefault();
    isSubmitting.value = true;
    statusMessage.value = null;

    // Only proceed if changes were made while in edit mode
    if (isUpdateDisabled.value) {
         isSubmitting.value = false;
         return; 
    }

    try {
        const formData = new FormData();
        formData.append('name', user.name);
        formData.append('_method', 'PUT');


        const response = await api.post('/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });


        statusType.value = 'success';
        statusMessage.value = response.data.message || 'Profile updated successfully.';


        const updatedUser = response.data.user;
        user.name = updatedUser.name;
        user.email = updatedUser.email;
        user.role = updatedUser.role;


        user.originalName = updatedUser.name;
        user.originalEmail = updatedUser.email;

        // Reset editing state after successful update
        isEditingName.value = false; 


        localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
        statusType.value = 'error';
        let msg = error.response?.data?.message || 'Failed to update profile.';
        if (error.response?.data?.errors) {
            msg +=
                ': ' + Object.values(error.response.data.errors).flat().join('; ');
        }
        statusMessage.value = msg;
    } finally {
        isSubmitting.value = false;
        setTimeout(() => {
            statusMessage.value = null;
        }, 6000);
    }
};


// Function to show the logout confirmation modal
const showLogoutConfirmation = () => {
    isLogoutModalOpen.value = true;
};


// Function to perform the actual logout
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    // Close the modal after logging out
    isLogoutModalOpen.value = false; 
};


/**
 * Function to navigate to the Audit Logs page.
 */
const goToAuditLogs = () => {
    router.push('/admin/audit-logs'); 
};


/**
 * Function to navigate to the Login History page.
 */
const goToLoginHistory = () => {
    router.push('/admin/login-history'); 
};


onMounted(fetchProfile);
</script>


<style scoped>
/* --- General Layout --- */
.profile-page {
    width: 100%;
    height: 100%;
    padding: 12px 18px 24px;
    box-sizing: border-box;
}

.page-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0a3318;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
}

.profile-layout {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* --- Status Banner --- */
.status-banner {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
}
.status-banner--success {
    background: #dcfce7;
    color: #166534;
}
.status-banner--error {
    background: #fee2e2;
    color: #b91c1c;
}

/* --- Card Structure --- */
.card {
    border-radius: 16px;
    background: #f3ffef;
    padding: 10px;
    box-sizing: border-box;
    border: 3px solid #004b32;
}


.card--top {
    background: #004b32;
}


.card-top-inner {
    background: #f3ffef;
    border-radius: 14px;
    padding: 18px 18px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative; /* CRITICAL: Establishes context for absolute positioning */
}

/* NEW: Absolute positioning for the edit/cancel buttons in the upper right */
.card-header-actions {
    position: absolute;
    top: 18px; 
    right: 18px; 
    z-index: 10;
}

/* Avatar */
.avatar-wrapper {
    position: relative;
    margin-bottom: 8px;
}


.avatar-circle {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: #f5f5f5;
    border: 4px solid #004b32;
    overflow: hidden;
    position: relative;
    margin-left: 18px;
    margin-top: -70px;
    /* Center the icon */
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Styling for the SVG Icon */
.human-icon {
    width: 60%; 
    height: 60%;
    fill: #999999;
}

/* Info Panel */
.info-panel {
    margin-top: 6px;
    background: #f3ffef;
    border-radius: 14px;
    padding: 12px 18px 16px;
}

.info-row {
    display: flex;
    gap: 16px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.field-group {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.field-group--full {
    flex-basis: 100%;
}

.field-group label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #0a3318;
    letter-spacing: 0.08em;
}

/* Name input is now standalone */
.field-group input {
    border-radius: 999px;
    border: none;
    padding: 9px 14px;
    background: #c8f0c4;
    font-size: 0.9rem;
    color: #05301a;
    outline: none;
}

/* Styling for the Edit/Cancel buttons (used by .card-header-actions) */
.btn-edit-name, .btn-cancel-edit {
    padding: 8px 15px; 
    height: auto; 
    border-radius: 999px;
    background: #7fbf90;
    color: #05301a;
    border: none;
    font-weight: 700;
    font-size: 0.8rem; 
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s;
}
.btn-edit-name:hover {
    background: #a9e0a0;
}
.btn-cancel-edit {
    background: #ffaaaa;
}
.btn-edit-name .edit-icon {
    width: 14px;
    height: 14px;
    fill: currentColor;
}


.field-group input:disabled.field--readonly {
    opacity: 1;
    background: #e9e9e9;
    color: #555;
    cursor: default;
}

.field-group input:disabled:not(.field--readonly) {
    opacity: 0.8;
}

.field-group input:focus {
    box-shadow: 0 0 0 2px rgba(0, 75, 50, 0.35);
}

/* --- Inline Actions (Update and Logout) --- */
.inline-actions {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-top: 10px;
    margin-bottom: 5px; 
}

/* --- Bottom Row (Utility Buttons) --- */
.bottom-row {
    display: flex;
    justify-content: center; 
    gap: 12px;
    margin-top: 4px;
    flex-wrap: wrap;
}

.utility-actions {
    display: flex;
    gap: 12px;
    flex: 0 1 auto; 
}

/* --- SHARED UTILITY BUTTON STYLE --- */
.btn-utility-shared {
    padding: 10px 18px;
    border-radius: 999px;
    border: 2px solid #7fbf90; 
    background: #c8f0c4; 
    color: #0a3318; 
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    flex: 1 1 0; 
}

/* Adjustment for UPDATE PROFILE */
.inline-actions .btn-utility-shared {
    padding: 12px 24px; 
    font-size: 0.9rem;
    font-weight: 800; 
    letter-spacing: 0.08em;
}

/* Disabled state */
.btn-utility-disabled {
    opacity: 0.6;
    cursor: default;
    box-shadow: none;
}

/* --- Loading Overlay --- */
.loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.18);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fefefe;
    font-weight: 600;
    font-size: 0.95rem;
}


/* --- Modal Styles --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #f3ffef;
    padding: 30px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
    border: 3px solid #004b32;
    text-align: center;
}

.modal-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: #0a3318;
    margin-bottom: 15px;
}

.modal-message {
    font-size: 1rem;
    color: #004b32;
    margin-bottom: 30px;
}

.modal-actions {
    display: flex;
    justify-content: space-around;
    gap: 15px;
}

.btn-modal-cancel,
.btn-modal-logout {
    padding: 10px 20px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    flex: 1;
    transition: background-color 0.2s, opacity 0.2s;
}

.btn-modal-cancel {
    background: #c8f0c4;
    color: #004b32;
    border: 2px solid #004b32;
}

.btn-modal-logout {
    background: #004b32;
    color: #fefefe;
    border: 2px solid #004b32;
}


/* --- Responsive --- */
@media (min-width: 901px) {
    .bottom-row {
        justify-content: center;
    }
    .utility-actions {
        flex: 0 1 450px; 
    }
    .inline-actions {
        justify-content: center;
    }
}


@media (max-width: 640px) {
    .profile-page {
        padding: 8px 10px 18px;
    }
    
    .inline-actions {
        flex-direction: column-reverse; 
        align-items: stretch;
        padding-top: 15px;
    }

    .utility-actions {
        flex-direction: column;
        width: 100%;
    }

    .bottom-row {
        flex-direction: column;
        align-items: stretch;
    }

    /* All inline/utility buttons take full width on mobile */
    .btn-utility-shared { 
        width: 100%;
        min-width: auto;
    }

    .modal-content {
        padding: 20px 25px;
    }
    .modal-actions {
        flex-direction: column;
    }
}
</style>