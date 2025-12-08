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
const statusType = ref(''); // 'success' | 'error'
const isEditingDetails = ref(false);

// --- Constants ---
const DEFAULT_AVATAR = 'https://placehold.co/100x100/A0AEC0/ffffff?text=User';
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

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(fetchProfile);
</script>

<template>
  <div class="user-profile-container">
    <UserNavbar />

    <div class="profile-content">
      <h1>Your Profile Settings</h1>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="text-center p-10 text-indigo-700 font-semibold text-lg"
      >
        Loading profile...
      </div>

      <form v-else @submit="handleProfileUpdate" class="space-y-6">
        <!-- Status Message -->
        <div
          v-if="statusMessage"
          :class="{
            'bg-green-100 border-green-500 text-green-700':
              statusType === 'success',
            'bg-red-100 border-red-500 text-red-700': statusType === 'error',
          }"
          class="border p-4 rounded-lg shadow-sm text-sm"
        >
          <p class="font-bold mb-1">
            {{ statusType === 'success' ? 'Success' : 'Error' }}:
          </p>
          <p>{{ statusMessage }}</p>
        </div>

        <!-- Profile Picture -->
        <div class="border border-gray-200 p-4 rounded-xl bg-gray-50">
          <h2 class="section-title">Profile Picture</h2>
          <div class="avatar-row">
            <img
              :src="user.profilePictureUrl"
              alt="Profile Avatar"
              class="avatar-img"
              @error="user.profilePictureUrl = DEFAULT_AVATAR"
            />

            <div class="avatar-inputs">
              <label class="label-sm">Change Avatar (Max 2MB)</label>
              <input
                type="file"
                @change="handleFileUpload"
                accept="image/png, image/jpeg, image/gif"
                :disabled="isSubmitting"
                class="file-input"
              />
              <p v-if="profileImageFile" class="file-hint">
                File selected: {{ profileImageFile.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Account Info -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-indigo-200 p-4 rounded-xl bg-indigo-50/60"
        >
          <div class="md:col-span-2 header-row">
            <h2 class="section-title text-indigo-700">Account Information</h2>
            <button
              type="button"
              @click="toggleEditDetails"
              :disabled="isSubmitting"
              class="pill-btn"
              :class="
                isEditingDetails
                  ? 'pill-btn-danger'
                  : 'pill-btn-primary'
              "
            >
              {{ isEditingDetails ? 'Cancel Edit' : 'Edit Details' }}
            </button>
          </div>

          <div>
            <label for="name" class="label-sm">Full Name</label>
            <input
              id="name"
              type="text"
              v-model="user.name"
              required
              :disabled="isSubmitting || !isEditingDetails"
              class="text-input"
              :class="{
                'input-disabled': !isEditingDetails,
              }"
            />
          </div>

          <div>
            <label for="email" class="label-sm">Email Address (Login)</label>
            <input
              id="email"
              type="email"
              v-model="user.email"
              required
              :disabled="isSubmitting || !isEditingDetails"
              class="text-input"
              :class="{
                'input-disabled': !isEditingDetails,
              }"
            />
          </div>

          <div class="md:col-span-2 role-text">
            User Role:
            <span class="role-badge">{{ user.role }}</span>
          </div>
        </div>

        <!-- Change Password -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-yellow-300 p-4 rounded-xl bg-yellow-50/70"
        >
          <div class="md:col-span-2">
            <h2 class="section-title text-yellow-700">Change Password</h2>
            <p class="help-text">
              Leave fields blank if you do not wish to change your password.
            </p>
          </div>

          <div>
            <label for="newPassword" class="label-sm">New Password</label>
            <input
              id="newPassword"
              type="password"
              v-model="user.newPassword"
              :disabled="isSubmitting"
              class="text-input"
            />
          </div>

          <div>
            <label for="confirmPassword" class="label-sm"
              >Confirm Password</label
            >
            <input
              id="confirmPassword"
              type="password"
              v-model="user.newPasswordConfirmation"
              :disabled="isSubmitting"
              class="text-input"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-row">
          <button
            type="button"
            @click="logout"
            class="logout-btn"
          >
            Logout
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="save-btn"
            :class="{ 'btn-disabled': isSubmitting }"
          >
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
  padding: 0 0 40px;
  background: #eaf9e7;
  display: flex;
  flex-direction: column;
  position: relative;
}

.user-profile-container::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top left, #9fd49b 0, #eaf9e7 55%);
  z-index: -1;
}

/* Center card under navbar */
.profile-content {
  max-width: 720px;
  margin: 40px auto 0;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 26px 28px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  border: 4px solid #78ae63;
}

/* Title bar */
.profile-content h1 {
  text-align: center;
  background: #78ae63;
  color: #0e5821;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 1.4rem;
  margin-bottom: 18px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

/* Generic section title */
.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
}

/* Avatar section */
.avatar-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .avatar-row {
    flex-direction: row;
    align-items: center;
  }
}

.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  object-fit: cover;
  border: 4px solid #4f46e5;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.avatar-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Inputs */
.label-sm {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.text-input {
  margin-top: 4px;
  width: 100%;
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

.text-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.3);
}

.input-disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* File input */
.file-input {
  width: 100%;
  font-size: 0.85rem;
}

.file-hint {
  font-size: 0.75rem;
  color: #4f46e5;
}

/* Account header row */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Role text */
.role-text {
  font-size: 0.85rem;
  color: #4b5563;
}

.role-badge {
  font-weight: 700;
  color: #0f5132;
}

/* Pills */
.pill-btn {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
}

.pill-btn-primary {
  background-color: #4f46e5;
  color: #ffffff;
}

.pill-btn-primary:hover {
  background-color: #4338ca;
}

.pill-btn-danger {
  background-color: #dc2626;
  color: #ffffff;
}

.pill-btn-danger:hover {
  background-color: #b91c1c;
}

/* Help text */
.help-text {
  font-size: 0.8rem;
  color: #4b5563;
}

/* Actions */
.actions-row {
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.logout-btn {
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background-color: #dc2626;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(220, 38, 38, 0.35);
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;
  min-width: 130px;
}

.logout-btn:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

.save-btn {
  flex: 1;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background-color: #16a34a;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 5px 14px rgba(22, 163, 74, 0.45);
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s, box-shadow 0.15s;
}

.save-btn:hover {
  background-color: #166534;
  transform: translateY(-1px);
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-content {
    margin-top: 24px;
    padding: 22px 18px 20px;
    border-width: 3px;
  }

  .profile-content h1 {
    font-size: 1.2rem;
    padding: 8px 14px;
  }

  .actions-row {
    flex-direction: column-reverse;
  }

  .logout-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
