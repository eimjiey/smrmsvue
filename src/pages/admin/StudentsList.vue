<template>
  <div class="students-list">
    <h2>Students List (Placeholder)</h2>
    <p>This is a placeholder for the Students List (CRUD).</p>
    <button @click="$router.push({ name: 'AddStudent' })">Add Student</button>
  </div>
</template>

<script>
export default {
  name: 'StudentsList'
}
</script>

<style scoped>
.students-list { max-width:800px; margin:32px auto; padding:20px; background:#fff; border-radius:8px }
.students-list h2 { margin-bottom:12px }
</style>
