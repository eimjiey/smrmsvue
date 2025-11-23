<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '@/services/api';
import { useRouter } from 'vue-router';
import UserNavbar from '@/components/UserNavbar.vue'; 

// --- Setup ---
const router = useRouter();

// --- Component State ---
const user = reactive({
    id: null,
    name: '',
    email: '',
    profilePictureUrl: null,
    role: '',
    // Fields for optional updates:
    newPassword: '',
    newPasswordConfirmation: '',
    originalName: '', // Used for reset/tracking changes
    originalEmail: '', // Used for reset/tracking changes
});

const profileImageFile = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const statusMessage = ref(null);
const statusType = ref(''); // 'success' or 'error'
const isEditingDetails = ref(false); // NEW: State to control Name/Email fields

// --- Constants ---
const DEFAULT_AVATAR = 'https://placehold.co/100x100/A0AEC0/ffffff?text=User';
const STORAGE_PATH = 'http://192.168.8.50:8000/storage/'; 

// --- Helper Functions ---

const getImagePath = (path) => {
    if (path && !path.startsWith('http')) {
        return STORAGE_PATH + path;
    }
    return DEFAULT_AVATAR;
};

// --- Profile Details Logic ---

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
        user.profilePictureUrl = getImagePath(data.profile_picture); 

        // Store original values for comparison/reset
        user.originalName = data.name;
        user.originalEmail = data.email;

    } catch (error) {
        statusType.value = 'error';
        statusMessage.value = error.response?.data?.message || 'Failed to load profile data.';
        console.error('Fetch profile error:', error);
    } finally {
        isLoading.value = false;
    }
};

const toggleEditDetails = () => {
    isEditingDetails.value = !isEditingDetails.value;
    // If cancelling, revert changes
    if (!isEditingDetails.value) {
        user.name = user.originalName;
        user.email = user.originalEmail;
    }
};

const handleFileUpload = (event) => {
    profileImageFile.value = event.target.files[0];
    if (profileImageFile.value) {
        // Show local file preview
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

        if (profileImageFile.value) {
            formData.append('profile_picture', profileImageFile.value);
        }

        if (user.newPassword) {
            formData.append('password', user.newPassword);
            formData.append('password_confirmation', user.newPasswordConfirmation);
        }
        
        // Headers manually set for file upload
        const response = await api.post('/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        statusType.value = 'success';
        statusMessage.value = response.data.message || 'Profile updated successfully!';
        
        // Update local state with fresh data from server
        user.originalName = response.data.user.name;
        user.originalEmail = response.data.user.email;
        user.newPassword = '';
        user.newPasswordConfirmation = '';
        profileImageFile.value = null;
        isEditingDetails.value = false; // Disable editing mode on successful save

        if (response.data.user.profile_picture) {
             user.profilePictureUrl = getImagePath(response.data.user.profile_picture);
        }
        
        localStorage.setItem('user', JSON.stringify(response.data.user));


    } catch (error) {
        statusType.value = 'error';
        let errorMessage = error.response?.data?.message || 'Failed to update profile.';
        if (error.response?.data?.errors) {
             errorMessage += ': ' + Object.values(error.response.data.errors).flat().join('; ');
        }
        statusMessage.value = errorMessage;
        console.error('Profile update error:', error);
    } finally {
        isSubmitting.value = false;
        setTimeout(() => { statusMessage.value = null; }, 7000);
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
};


onMounted(fetchProfile);
</script>

<template>
    <div class="user-profile-container min-h-screen bg-gray-50">
        <UserNavbar />
        
        <div class="profile-content max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-8">
            <h1 class="text-3xl font-extrabold text-indigo-700 mb-6 border-b-4 border-indigo-200 pb-3">
                Your Profile Settings
            </h1>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center p-12 text-indigo-600 font-semibold text-xl">
                Loading profile...
            </div>

            <form v-else @submit="handleProfileUpdate" class="space-y-8">
                <!-- Status Message Display -->
                <div v-if="statusMessage" 
                     :class="{'bg-green-100 border-green-500 text-green-700': statusType === 'success', 'bg-red-100 border-red-500 text-red-700': statusType === 'error'}" 
                     class="border p-4 rounded-lg shadow-md font-semibold transition-opacity duration-500">
                    <p class="font-bold">{{ statusType === 'success' ? 'Success' : 'Error' }}:</p>
                    <p>{{ statusMessage }}</p>
                </div>

                <!-- Section 1: Profile Picture Upload -->
                <div class="border border-gray-200 p-4 rounded-xl bg-gray-50">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Profile Picture</h2>
                    <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <!-- Current/Preview Avatar -->
                        <img 
                            :src="user.profilePictureUrl" 
                            alt="Profile Avatar" 
                            class="w-24 h-24 object-cover rounded-full border-4 border-indigo-500 shadow-lg"
                            @error="user.profilePictureUrl = DEFAULT_AVATAR"
                        />
                        
                        <!-- File Input -->
                        <div class="flex flex-col space-y-2 w-full">
                            <label class="block text-sm font-medium text-gray-700">Change Avatar (Max 2MB)</label>
                            <input 
                                type="file" 
                                @change="handleFileUpload"
                                accept="image/png, image/jpeg, image/gif"
                                :disabled="isSubmitting"
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <p v-if="profileImageFile" class="text-xs text-indigo-600">
                                File selected: {{ profileImageFile.name }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Section 2: Account Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-indigo-200 p-4 rounded-xl bg-indigo-50/50">
                    <div class="md:col-span-2 flex justify-between items-center">
                        <h2 class="text-xl font-semibold text-indigo-600">Account Information</h2>
                        <!-- NEW EDIT BUTTON -->
                        <button 
                            type="button" 
                            @click="toggleEditDetails" 
                            :disabled="isSubmitting"
                            class="py-1 px-3 text-sm font-medium rounded-lg transition"
                            :class="isEditingDetails ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-500 text-white hover:bg-indigo-600'">
                            {{ isEditingDetails ? 'Cancel Edit' : 'Edit Details' }}
                        </button>
                    </div>

                    <div class="col-span-1">
                        <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="name" v-model="user.name" required 
                            :disabled="isSubmitting || !isEditingDetails"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{ 'bg-gray-100 cursor-not-allowed': !isEditingDetails }"
                            >
                    </div>

                    <div class="col-span-1">
                        <label for="email" class="block text-sm font-medium text-gray-700">Email Address (Login)</label>
                        <input type="email" id="email" v-model="user.email" required 
                            :disabled="isSubmitting || !isEditingDetails"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{ 'bg-gray-100 cursor-not-allowed': !isEditingDetails }"
                            >
                    </div>

                    <div class="md:col-span-2 text-sm text-gray-500">
                        <p>User Role: <span class="font-bold text-indigo-700">{{ user.role }}</span></p>
                    </div>
                </div>

                <!-- Section 3: Change Password -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-yellow-300 p-4 rounded-xl bg-yellow-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-yellow-700 mb-3">Change Password</h2>
                        <p class="text-sm text-gray-600 mb-3">Leave fields blank if you do not wish to change your password.</p>
                    </div>

                    <div class="col-span-1">
                        <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" id="newPassword" v-model="user.newPassword" :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="col-span-1">
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input type="password" id="confirmPassword" v-model="user.newPasswordConfirmation" :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2.5 border transition duration-150">
                    </div>
                </div>

                <!-- Submission Button and Logout -->
                <div class="pt-4 flex justify-between space-x-4">
                    <button type="button" @click="logout" class="py-3 px-4 rounded-lg shadow-md text-lg font-bold bg-red-600 text-white hover:bg-red-700 transition duration-300">
                        Logout
                    </button>
                    <button type="submit" :disabled="isSubmitting"
                        class="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-xl text-lg font-bold text-white bg-green-600 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                        :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }">
                        {{ isSubmitting ? 'Saving Profile...' : 'Update Profile' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.user-profile-container {
    min-height: 100vh;
    padding: 40px 20px;
    background: #f8f9fa; 
}

.profile-content {
    max-width: 600px;
    margin: 0 auto;
}
</style>