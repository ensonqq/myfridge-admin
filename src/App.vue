<template>
  <div :class="{'nav-open': $sidebar.showSidebar}" v-if="user">
    <notifications transition-name="notification-list" transition-mode="out-in">

    </notifications>
    <router-view name="header"></router-view>
    <transition name="fade"
                mode="out-in">
      <router-view></router-view>
    </transition>
    <router-view name="footer"></router-view>
  </div>
  <Login v-else></Login>
</template>

<script>
// Loading some plugin css asynchronously
import 'sweetalert2/dist/sweetalert2.css'
import 'vue-notifyjs/themes/default.css'
import Login      from './components/Dashboard/Views/Pages/Login'
import {mapState} from 'vuex'

export default {
  created () {
    this.$api.myProfile()
    this.$api.locations()
    this.$api.holidays()
    this.$api.skuSorting()
  },
  components : {
    Login
  },
  computed   : {
    ...mapState(['user'])
  }
}
</script>
<style lang="scss">

</style>
