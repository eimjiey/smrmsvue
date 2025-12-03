<template>
  <div class="admin-profile">
    <!-- Page header -->
    <header class="admin-profile__header">
      <h1>Admin Profile</h1>
      <p>Manage your account information and security.</p>
    </header>

    <section class="admin-profile__content">
      <!-- Left: basic info card -->
      <div class="admin-profile__card">
        <h2>Account Details</h2>

        <div class="admin-profile__avatar-wrapper">
          <!-- use your own avatar image or initials -->
          <div class="admin-profile__avatar">
            <span>A</span>
          </div>
          <div>
            <p class="admin-profile__name">Admin Name</p>
            <p class="admin-profile__role">System Administrator</p>
          </div>
        </div>

        <form class="admin-profile__form" @submit.prevent="updateProfile">
          <div class="admin-profile__field">
            <label for="fullName">Full Name</label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              placeholder="Enter full name"
              required
            />
          </div>

          <div class="admin-profile__field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter email"
              required
            />
          </div>

          <div class="admin-profile__field">
            <label for="phone">Phone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="text"
              placeholder="Enter phone number"
            />
          </div>

          <div class="admin-profile__buttons">
            <button type="submit" class="btn btn--primary">
              Save Changes
            </button>
            <button type="button" class="btn btn--ghost" @click="resetProfile">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Right: password and other settings -->
      <div class="admin-profile__card">
        <h2>Security</h2>
        <p class="admin-profile__hint">
          Update your password regularly to keep your account secure.
        </p>

        <form class="admin-profile__form" @submit.prevent="updatePassword">
          <div class="admin-profile__field">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="passwordForm.current"
              type="password"
              placeholder="Enter current password"
              required
            />
          </div>

          <div class="admin-profile__field">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="passwordForm.new"
              type="password"
              placeholder="Enter new password"
              required
            />
          </div>

          <div class="admin-profile__field">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirm"
              type="password"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div class="admin-profile__buttons">
            <button type="submit" class="btn btn--primary">
              Update Password
            </button>
          </div>
        </form>

        <hr class="admin-profile__divider" />

        <div class="admin-profile__danger">
          <h3>Danger Zone</h3>
          <p>Log out of this device or all devices.</p>
          <div class="admin-profile__buttons">
            <button type="button" class="btn btn--ghost" @click="logout">
              Log out
            </button>
            <button
              type="button"
              class="btn btn--danger"
              @click="logoutAllDevices"
            >
              Log out on all devices
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminProfile',
  data() {
    return {
      // mock data – replace with API data when you connect backend
      form: {
        fullName: 'Admin Name',
        email: 'admin@example.com',
        phone: '+63 900 000 0000'
      },
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      }
    }
  },
  methods: {
    updateProfile() {
      // TODO: call your API here
      console.log('Saving profile', this.form)
      alert('Profile saved (demo).')
    },
    resetProfile() {
      // TODO: reset from original values / API data
      window.location.reload()
    },
    updatePassword() {
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        alert('New passwords do not match.')
        return
      }
      // TODO: call your API here
      console.log('Updating password', this.passwordForm)
      alert('Password updated (demo).')
      this.passwordForm.current = ''
      this.passwordForm.new = ''
      this.passwordForm.confirm = ''
    },
    logout() {
      // TODO: clear auth + redirect
      alert('Logging out from this device (demo).')
    },
    logoutAllDevices() {
      // TODO: API call to invalidate all sessions
      alert('Logging out from all devices (demo).')
    }
  }
}
</script>

<style scoped>
.admin-profile {
  padding: 24px 32px;
  background-color: #f5f7f2;
  min-height: calc(100vh - 64px); /* adjust based on navbar height */
  box-sizing: border-box;
}

/* header */
.admin-profile__header h1 {
  margin: 0;
  font-size: 24px;
  color: #0b3a23;
}

.admin-profile__header p {
  margin-top: 4px;
  color: #5c6b63;
  font-size: 14px;
}

/* layout */
.admin-profile__content {
  margin-top: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 24px;
}

/* card */
.admin-profile__card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.admin-profile__card h2 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #0b3a23;
}

.admin-profile__hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7b73;
}

/* avatar + name */
.admin-profile__avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.admin-profile__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #0b3a23;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
}

.admin-profile__name {
  margin: 0;
  font-weight: 600;
  color: #0b3a23;
}

.admin-profile__role {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6b7b73;
}

/* form */
.admin-profile__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-profile__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-profile__field label {
  font-size: 13px;
  color: #41514a;
}

.admin-profile__field input {
  border-radius: 8px;
  border: 1px solid #c5d2cb;
  padding: 8px 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.admin-profile__field input:focus {
  border-color: #0b3a23;
}

/* buttons */
.admin-profile__buttons {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
}

.btn--primary {
  background-color: #0b3a23;
  color: #ffffff;
}

.btn--ghost {
  background-color: transparent;
  color: #0b3a23;
  border: 1px solid #0b3a23;
}

.btn--danger {
  background-color: #e53935;
  color: #ffffff;
}

/* extra */
.admin-profile__divider {
  margin: 20px 0 16px;
  border: none;
  border-top: 1px solid #e0e6e2;
}

.admin-profile__danger h3 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #a12826;
}

.admin-profile__danger p {
  margin: 0 0 10px;
  font-size: 13px;
  color: #6b7b73;
}

/* responsive */
@media (max-width: 900px) {
  .admin-profile__content {
    grid-template-columns: 1fr;
  }
}
</style>
