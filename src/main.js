/*!

 =========================================================
 * MyFridge Admin - V2.4.0
 =========================================================

 * Author: Enson
 * Copyright 2022 Enson (https://creatives.expert)
 * License (https://creatives.expert)

 =========================================================

 */

import Vue            from 'vue'
import './pollyfills'
import VueRouter      from 'vue-router'
import VueNotify      from 'vue-notifyjs'
import lang           from 'element-ui/lib/locale/lang/en'
import locale         from 'element-ui/lib/locale'
import App            from './App.vue'
import {Notification} from 'element-ui';

// Plugins
import GlobalComponents from './globalComponents'
import GlobalDirectives from './globalDirectives'
import SideBar          from './components/UIComponents/SidebarPlugin'
import initProgress     from './progressbar';

// router setup
import routes from './routes/routes'

// vuex setup
import store from './store'

// api setup
import api from './api/api'

// library imports

import './assets/sass/paper-dashboard.scss'
import './assets/sass/demo.scss'

import sidebarLinks from './sidebarLinks'
// import './registerServiceWorker'
// plugin setup
Vue.use(VueRouter)
Vue.use(GlobalDirectives)
Vue.use(GlobalComponents)
Vue.use(VueNotify)
Vue.use(SideBar, { sidebarLinks : sidebarLinks })
Vue.prototype.$api = api
Vue.prototype.$notify = Notification
locale.use(lang)

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  mode            : "history",
  linkActiveClass : 'active',
  scrollBehavior  : (to) => {
    if (to.hash) {
      return { selector : to.hash }
    } else {
      return { x : 0, y : 0 }
    }
  }
})

initProgress(router);

/* eslint-disable no-new */
new Vue({
  el     : '#app',
  store,
  render : h => h(App),
  router
})
