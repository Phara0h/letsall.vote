<template>
  <div class="home">
    <h1>{{response.totalPackets}}</h1>
  </div>
</template>
<script>
export default {
  data() {
   return {
     loaded: false,
     response: 0,
   }
 },
  created() {
  fetch('/api/v1/server/metrics')
      .then(async (response) => {

        this.response = await response.json()
        this.loaded = true
      })
  },
};fetch
</script>
