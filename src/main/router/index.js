import Vue                   from 'vue'
import Router                from 'vue-router'
import MainPage              from '../pages/main-page'
import CraftingPage          from '../pages/crafting-page'
import ErrorPage             from '../pages/error-page'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'MainPage',
      component: MainPage,
      meta: { pageTitle: 'Main'}
    },
    {
      path: '/crafting',
      name: 'CraftingPage',
      component: CraftingPage,
      meta: { pageTitle: 'Crafting'}
    },
    {
      path: '*',
      name: 'ErrorPage',
      component: ErrorPage,
      meta: { loginRequired: false, pageTitle: 'Error' }
    }
  ]
})