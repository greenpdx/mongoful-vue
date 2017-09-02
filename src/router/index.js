import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Hacking from '@/components/Hacking'
import Main from '@/components/Main'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/Login',
      name: 'Login',
      component: Login
    },
    {
      path: 'hacking',
      name: 'Hacking',
      component: Hacking
    },
    {
      path: '/',
      name: 'Main',
      component: Main
    }
  ]
})
