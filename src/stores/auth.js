import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null, 
  }),
  getters: {
    // Crucial getter: checks if the user is authenticated and has the 'admin' role
    isAdmin: (state) => {
      return state.user && state.user.role === 'admin';
    }
  },
  actions: {
    setAuthUser(userData) {
      this.user = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    // ...
  }
});