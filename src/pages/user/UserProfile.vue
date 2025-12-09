<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '@/services/api';
import { useRouter } from 'vue-router';
import UserNavbar from '@/components/UserNavbar.vue';

const router = useRouter();

const user = reactive({
    id: null,
    name: '',
    email: '',
    profilePicturePath: '',
    profilePictureUrl: null,
    profilePictureTimestamp: Date.now(),
    role: '',
    newPassword: '',
    newPasswordConfirmation: '',
    originalName: '',
    originalEmail: '',
});

const profileImageFile = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const statusMessage = ref(null);
const statusType = ref('');
const isEditingDetails = ref(false);
// NEW: State for the Logout Confirmation Modal
const isLogoutModalOpen = ref(false); 

// --- Constants ---
const DEFAULT_AVATAR = 'https://placehold.co/120x120/f4eef1/f4eef1?text='; // Adjusted size and color
const STORAGE_PATH = '/storage/';

// --- Helpers ---
const getImagePath = (path) => {
    if (!path || path.startsWith('http')) {
        return DEFAULT_AVATAR;
    }
    let fullUrl = STORAGE_PATH + path;
    if (user.profilePictureTimestamp) {
        fullUrl += `?t=${user.profilePictureTimestamp}`;
    }
    return fullUrl;
};

// --- Profile Logic ---
const fetchProfile = async () => {
    isLoading.value = true;
    statusMessage.value = null;
    try {
        const response = await api.get('/me');
        const data = response.data;

        user.id = data.id;
        user.name = data.name;
        user.email = data.email;
        user.role = data.role;

        user.profilePicturePath = data.profile_picture;
        user.profilePictureTimestamp = Date.now();
        user.profilePictureUrl = getImagePath(data.profile_picture);

        user.originalName = data.name;
        user.originalEmail = data.email;
    } catch (error) {
        statusType.value = 'error';
        const networkError =
            error.message && error.message.toLowerCase().includes('network');
        statusMessage.value = networkError
            ? 'Network error: Unable to connect to the server. Please check your network connection and ensure the backend server is running.'
            : error.response?.data?.message || 'Failed to load profile data.';
        console.error('Fetch profile error:', error);
    } finally {
        isLoading.value = false;
    }
};

const toggleEditDetails = () => {
    isEditingDetails.value = !isEditingDetails.value;
    if (!isEditingDetails.value) {
        user.name = user.originalName;
        user.email = user.originalEmail;
        user.newPassword = '';
        user.newPasswordConfirmation = '';
        profileImageFile.value = null;
        user.profilePictureUrl = getImagePath(user.profilePicturePath); // Revert image preview
    }
};

const handleFileUpload = (event) => {
    profileImageFile.value = event.target.files[0];
    if (profileImageFile.value) {
        user.profilePictureUrl = URL.createObjectURL(profileImageFile.value);
    }
};

const handleProfileUpdate = async (event) => {
    event.preventDefault();
    isSubmitting.value = true;
    statusMessage.value = null;

    try {
        const formData = new FormData();
        formData.append('name', user.name);
        formData.append('email', user.email);
        formData.append('_method', 'PUT');

        if (profileImageFile.value) {
            formData.append('profile_picture', profileImageFile.value);
        }

        if (user.newPassword) {
            formData.append('password', user.newPassword);
            formData.append('password_confirmation', user.newPasswordConfirmation);
        }

        const response = await api.post('/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        statusType.value = 'success';
        statusMessage.value =
            response.data.message || 'Profile updated successfully!';

        const updatedUser = response.data.user;

        user.name = updatedUser.name;
        user.email = updatedUser.email;
        user.role = updatedUser.role;

        user.profilePicturePath = updatedUser.profile_picture;
        user.profilePictureTimestamp = Date.now();
        user.profilePictureUrl = getImagePath(updatedUser.profile_picture);

        user.originalName = updatedUser.name;
        user.originalEmail = updatedUser.email;

        user.newPassword = '';
        user.newPasswordConfirmation = '';
        profileImageFile.value = null;

        isEditingDetails.value = false;

        localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
        statusType.value = 'error';
        let errorMessage =
            error.response?.data?.message || 'Failed to update profile.';
        if (error.response?.data?.errors) {
            errorMessage +=
                ': ' +
                Object.values(error.response.data.errors).flat().join('; ');
        }
        statusMessage.value = errorMessage;
        console.error('Profile update error:', error);
    } finally {
        isSubmitting.value = false;
        setTimeout(() => {
            statusMessage.value = null;
        }, 7000);
    }
};

// Function to show the logout confirmation modal
const showLogoutConfirmation = () => {
    isLogoutModalOpen.value = true;
};

// Function to perform the actual logout (CORRECTED TYPO)
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    // CORRECTED: Close the modal after logging out
    isLogoutModalOpen.value = false; 
};

onMounted(fetchProfile);
</script>

<template>
    <div class="profile-page">
        <UserNavbar />

        <div class="profile-card">
            <header class="card-header">
                <h1 class="header-title">PROFILE</h1>
                <button
                    type="button"
                    @click="toggleEditDetails"
                    :disabled="isSubmitting"
                    class="edit-btn"
                >
                    EDIT
                </button>
            </header>

            <form v-if="!isLoading" @submit="handleProfileUpdate" class="profile-form">
                <div class="info-section">
                    <div class="avatar-wrapper">
                        <img
                            :src="user.profilePictureUrl"
                            alt="Profile Avatar"
                            class="avatar-img"
                            @error="user.profilePictureUrl = DEFAULT_AVATAR"
                        />
                         <div v-if="isEditingDetails" class="image-upload-area">
                            <label for="file-upload" class="file-upload-label">
                                <input
                                    id="file-upload"
                                    type="file"
                                    @change="handleFileUpload"
                                    accept="image/png, image/jpeg, image/gif"
                                    :disabled="isSubmitting"
                                    class="file-input-hidden"
                                />
                                Change Photo
                            </label>
                            <p v-if="profileImageFile" class="file-hint">
                                Selected: {{ profileImageFile.name }}
                            </p>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="input-group">
                            <label for="name" class="field-label">NAME</label>
                            <input
                                id="name"
                                type="text"
                                v-model="user.name"
                                required
                                :disabled="isSubmitting || !isEditingDetails"
                                class="profile-input"
                            />
                        </div>

                        <div class="input-group">
                            <label for="role" class="field-label">ROLE</label>
                            <input
                                id="role"
                                type="text"
                                :value="user.role"
                                disabled
                                class="profile-input"
                            />
                        </div>

                        <div class="input-group input-full-width">
                            <label for="email" class="field-label">EMAIL ADDRESS</label>
                            <input
                                id="email"
                                type="email"
                                v-model="user.email"
                                required
                                :disabled="isSubmitting || !isEditingDetails"
                                class="profile-input"
                            />
                        </div>
                        
                        <template v-if="isEditingDetails">
                            <div class="input-group input-full-width password-notice">
                                <p>Enter new password below to change it.</p>
                            </div>
                            <div class="input-group">
                                <label for="newPassword" class="field-label">NEW PASSWORD</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    v-model="user.newPassword"
                                    :disabled="isSubmitting"
                                    class="profile-input"
                                />
                            </div>
                            <div class="input-group">
                                <label for="confirmPassword" class="field-label">CONFIRM PASSWORD</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    v-model="user.newPasswordConfirmation"
                                    :disabled="isSubmitting"
                                    class="profile-input"
                                />
                            </div>
                        </template>
                    </div>
                </div>

                <div
                    v-if="statusMessage"
                    :class="{
                        'status-success': statusType === 'success',
                        'status-error': statusType === 'error',
                    }"
                    class="status-message"
                >
                    <p>{{ statusMessage }}</p>
                </div>

                <div class="actions-row">
                    <button
                        type="button"
                        @click="showLogoutConfirmation"
                        class="action-btn logout-btn"
                    >
                        LOGOUT
                    </button>
                    <button
                        v-if="isEditingDetails"
                        type="submit"
                        :disabled="isSubmitting"
                        class="action-btn update-btn"
                        :class="{ 'btn-disabled': isSubmitting }"
                    >
                        {{ isSubmitting ? 'SAVING PROFILE...' : 'UPDATE PROFILE' }}
                    </button>
                    <div v-else class="action-btn-placeholder"></div>
                </div>
            </form>
            <div v-else-if="isLoading" class="loading-message">
                Loading profile...
            </div>
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
    </div>
</template>

<style scoped>
/* --- Design Variables --- */
:root {
    --color-dark-green: #205634;
    --color-light-green: #86c478;
    --color-pale-bg: #e6f1e3;
    --color-avatar-border: #f4eef1; /* The pale pinkish white from the image */
}

/* --- Global Container & Background --- */
.profile-page {
    min-height: 100vh;
    padding: 0;
    background: var(--color-light-green); /* Light green background */
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* --- Main Profile Card --- */
.profile-card {
    width: 90%;
    max-width: 600px;
    margin: 40px auto;
    background:#84BE78; /* Dark green main background */
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
    padding: 10px; /* Padding for the inner card layout */
}

/* --- Header Section (Title and Edit Button) --- */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
}

.header-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-light-green); /* Text color contrast */
    letter-spacing: 0.1em;
}

.edit-btn {
    background-color: var(--color-light-green);
    color: var(--color-dark-green);
    padding: 8px 18px;
    border-radius: 6px; 
    font-weight: 700;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
}

.edit-btn:hover {
    background-color: #a3d49b; /* Slightly lighter on hover */
}

/* --- Form and Information Section (The Main Light Green Box) --- */
.profile-form {
    padding: 0 10px 10px; 
}

.info-section {
    display: flex;
    gap: 20px;
    background: var(--color-light-green); /* Light green content background */
    padding: 30px 20px;
    border-radius: 8px;
}

/* --- Avatar & Image Upload --- */
.avatar-wrapper {
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-img {
    width: 120px;
    height: 120px;
    border-radius: 999px;
    object-fit: cover;
    background: var(--color-avatar-border); /* Pale background for the circle */
    border: 5px solid var(--color-avatar-border); /* Border color for the white circle */
}

.image-upload-area {
    margin-top: 10px;
    text-align: center;
}

.file-upload-label {
    display: inline-block;
    padding: 5px 10px;
    background-color: var(--color-dark-green);
    color: var(--color-light-green);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
}

.file-input-hidden {
    display: none;
}

.file-hint {
    font-size: 0.75rem;
    color: var(--color-dark-green);
    margin-top: 5px;
}

/* --- Details Grid (Inputs) --- */
.details-grid {
    flex-grow: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    align-items: center;
}

.input-full-width {
    grid-column: 1 / 3;
}

.input-group {
    display: flex;
    flex-direction: column;
}

.field-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-dark-green);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.profile-input {
    width: 100%;
    padding: 8px 10px;
    border-radius: 4px; 
    background-color: #BFECBF; /* Very light green input background */
    font-size: 0.9rem;
    color: #BFECBF;
    transition: box-shadow 0.15s;
    /* Placeholder for the line effect */
    border-bottom: 2px solid rgba(32, 86, 52, 0.4); 
}

.profile-input:focus {
    box-shadow: 0 0 0 2px rgba(32, 86, 52, 0.5);
}

.profile-input:disabled {
    cursor: default;
    opacity: 1; 
    background-color: var(--color-pale-bg);
    color: var(--color-dark-green);
}

.password-notice {
    grid-column: 1 / 3;
    font-size: 0.8rem;
    color: #4b5563;
    padding-top: 10px;
    border-top: 1px dashed rgba(32, 86, 52, 0.4);
}

/* --- Action Buttons (Bottom) --- */
.actions-row {
    display: flex;
    justify-content: space-between; /* Space between Logout and Update */
    gap: 10px;
    margin-top: 20px;
    padding-left: 10px; /* Align with the main info section */
    padding-right: 10px;
}

.action-btn {
    padding: 10px 20px;
    border-radius: 8px; 
    font-weight: 700;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    min-width: 130px;
}

.action-btn-placeholder {
    /* To maintain layout alignment when UPDATE button is hidden */
    min-width: 130px; 
    height: 1px;
}

.logout-btn {
    background-color: var(--color-dark-green);
    color: var(--color-light-green);
}

.logout-btn:hover {
    background-color: #143a23;
}

.update-btn {
    background-color: var(--color-dark-green);
    color: var(--color-light-green);
}

.update-btn:hover {
    background-color: #143a23;
}

.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
}

/* Status Message Styling */
.status-message {
    padding: 10px;
    margin: 10px 10px 0;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
}

.status-success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.status-error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.loading-message {
    text-align: center;
    padding: 40px;
    color: var(--color-light-green);
    font-weight: 600;
}


/* --- Responsive Adjustments --- */
@media (max-width: 640px) {
    .profile-card {
        margin: 20px auto;
        padding: 5px;
    }
    
    .card-header {
        padding: 8px 10px;
    }
    
    .info-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px 15px;
    }
    
    .details-grid {
        grid-template-columns: 1fr; /* Stack inputs vertically */
        gap: 10px;
        width: 100%;
        margin-top: 15px;
    }
    
    .input-full-width {
        grid-column: 1 / 2;
    }
    
    .actions-row {
        flex-direction: column-reverse; /* Put Update on bottom, Logout on top */
        align-items: center;
        padding: 0 10px;
    }
    
    .action-btn, .action-btn-placeholder {
        width: 100%;
        min-width: unset;
    }
}


/* --- Modal Styles (Adjusted for Green Theme) --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(32, 86, 52, 0.7); /* Dark green semi-transparent overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000; 
}

.modal-content {
    background: #ffffff;
    padding: 30px 40px;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 380px;
    border: 3px solid var(--color-dark-green);
    text-align: center;
}

.modal-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--color-dark-green);
    margin-bottom: 15px;
}

.modal-message {
    font-size: 1rem;
    color: #4b5563;
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
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    flex: 1;
}

.btn-modal-cancel {
    background: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
}

.btn-modal-logout {
    background: #dc2626; 
    color: #fefefe;
    border: none;
    box-shadow: 0 4px 10px rgba(220, 38, 38, 0.35);
}
</style>