<template>
	<div class="admin-dashboard">
		<header class="header">
			<h1>Admin Dashboard</h1>
			<div class="user-info">Welcome, <strong>{{ userName }}</strong></div>
		</header>

		<section class="quick-stats">
			<div class="stat">
				<div class="stat-value">{{ stats.students }}</div>
				<div class="stat-label">Students</div>
			</div>
			<div class="stat">
				<div class="stat-value">{{ stats.reports }}</div>
				<div class="stat-label">Reports</div>
			</div>
			<div class="stat">
				<div class="stat-value">{{ stats.pending }}</div>
				<div class="stat-label">Pending</div>
			</div>
		</section>

    <section class="actions">
      <button @click="$router.push({ name: 'AdminStudents' })">Students List</button>
      <button @click="$router.push({ name: 'AddStudent' })">Add Student</button>
      <button class="danger" @click="logout">Logout</button>
    </section>		<footer class="footer">© {{ new Date().getFullYear() }} SMRMS</footer>
	</div>
</template>

<script>
export default {
	name: 'AdminDashboard',
	data() {
		return {
			userName: this.getUserName(),
			stats: {
				students: 0,
				reports: 0,
				pending: 0
			}
		}
	},
	methods: {
		getUserName() {
			try {
				const u = localStorage.getItem('user')
				if (u) {
					const parsed = JSON.parse(u)
					return parsed.name || parsed.first_name || 'Admin'
				}
			} catch (e) {
				// ignore parse errors
			}
			return 'Admin'
		},
		logout() {
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			this.$router.push('/login')
		}
	},
	mounted() {
		// Lightweight stub: try to read counts from localStorage if available
		// In a real app, fetch from API endpoints and replace these values
		const s = localStorage.getItem('adminStats')
		if (s) {
			try {
				this.stats = JSON.parse(s)
			} catch (e) {
				console.warn('Failed to parse adminStats from localStorage:', e)
			}
		} else {
			// default demo values
			this.stats = { students: 124, reports: 37, pending: 5 }
		}
	}
}
</script>

<style scoped>
.admin-dashboard { max-width: 900px; margin: 32px auto; padding: 20px; font-family: Arial, Helvetica, sans-serif }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px }
.header h1 { margin:0; color:#2c3e50 }
.user-info { color:#4b5563 }
.quick-stats { display:flex; gap:16px; margin-bottom:20px }
.stat { flex:1; background:#fff; border:1px solid #e5e7eb; padding:18px; border-radius:8px; text-align:center }
.stat-value { font-size:28px; font-weight:700; color:#111827 }
.stat-label { color:#6b7280; margin-top:6px }
.actions { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px }
.actions button { padding:10px 14px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer }
.actions button:hover { background:#f8fafc }
.actions button.danger { background:#dc2626; color:#fff; border-color:#dc2626 }
.footer { text-align:center; color:#9ca3af; margin-top:24px }
</style>
