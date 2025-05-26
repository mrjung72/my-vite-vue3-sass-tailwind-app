<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const servers = ref([])
const newServer = ref({
  server_ip: '',
  title: '',
  usage_type: '',
  env_type: '',
})

const fetchServers = async () => {
  const res = await axios.get('/api/servers')
  servers.value = res.data
}

onMounted(fetchServers)
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">서버 목록</h2>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>IP</th><th>이름</th><th>용도</th><th>환경</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in servers" :key="s.server_ip">
          <td>{{ s.server_ip }}</td>
          <td>{{ s.title }}</td>
          <td>{{ s.usage_type }}</td>
          <td>{{ s.env_type }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>
