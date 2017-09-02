<template>
  <div>
    <h2>Hello {{ name }}</h2>
    <router-link to="login">Login</router-link>
  </div>
</template>
<script>
import Rpc from './Rpc'

export default {
  name: 'Main',
  mixins: [
    Rpc
  ],
  props: {

  },
  data () {
    return {
      name: 'NAME'
    }
  }
}
</script>
<style scoped>
</style>
