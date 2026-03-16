<template>
  <div class="user">
    <div class="photo">
      <img src="/static/img/faces/face-1.jpg" alt="user avatar"/>
    </div>
    <div class="info">
      <a data-toggle="collapse" :aria-expanded="!isClosed" @click="toggleMenu" href="#">
         <span>
           {{ user.name }}
           <b class="caret"></b>
        </span>
      </a>
      <div class="clearfix"></div>
      <div>
        <collapse-transition>
          <ul class="nav nav-menu" v-show="!isClosed">
            <li>
              <a href="#" @click.stop="openUserProfile(user.id)">
                <span class="sidebar-mini-icon"><i class="nc-icon nc-single-02"></i></span>
                <span class="sidebar-normal">我的帳號</span>
              </a>
            </li>
            <li>
              <a href="#" @click.stop="logout">
                <span class="sidebar-mini-icon"><i class="nc-icon nc-user-run"></i></span>
                <span class="sidebar-normal">登出</span>
              </a>
            </li>
          </ul>
        </collapse-transition>
      </div>
    </div>
    <UserProfile ref="UserProfile"></UserProfile>
  </div>
</template>
<script>
import {CollapseTransition}     from 'vue2-transitions'
import {mapMutations, mapState} from "vuex";
import UserProfile              from '../../Dashboard/Views/Pages/UserProfile'

export default {
  components : {
    CollapseTransition,
    UserProfile
  },
  data () {
    return {
      isClosed : true
    }
  },
  methods  : {
    ...mapMutations(['logout']),
    toggleMenu () {
      this.isClosed = !this.isClosed
    },
    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
  },
  computed : {
    ...mapState(['user'])
  }
}
</script>
<style scoped>
.nav.nav-menu {
  margin-top: 0;
}
</style>
