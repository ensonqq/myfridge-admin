<template>
  <div class="content">
    <transition name="fade" mode="out-in">
      <router-view v-if="hasPermission"></router-view>
      <div v-else class="no-permission">
        <i class="fa fa-lock no-permission__icon"></i>
        <p class="no-permission__text">沒有櫂限</p>
      </div>
    </transition>
  </div>
</template>
<script>
import {mapState}   from 'vuex'
import sidebarLinks from "@/sidebarLinks";

export default {
  data () {
    return {
      hasPermission : true
    }
  },
  computed : {
    ...mapState(['user']),
  },
  watch : {
    '$route' () {
      this.checkPermission()
    },
    user () {
      this.checkPermission()
    }
  },
  created () {
    this.checkPermission()
  },
  methods : {
    checkPermission () {
      if (!this.user) {
        this.hasPermission = true
        return
      }

      const currentPath = this.$route.path

      // Flatten all sidebar links (top-level paths + children paths)
      const allLinks = []
      sidebarLinks.forEach(link => {
        if (link.path) allLinks.push({ path : link.path, roleRequired : link.roleRequired })
        if (link.children) {
          link.children.forEach(child => {
            if (child.path) allLinks.push({ path : child.path, roleRequired : child.roleRequired || link.roleRequired })
          })
        }
      })

      // Find the best matching link for the current route
      const matched = allLinks.find(link =>
        currentPath === link.path || currentPath.startsWith(link.path + '/')
      )

      this.hasPermission = !(matched && matched.roleRequired === 'super' && this.user.role !== 'super')
    }
  }
}
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .15s
}

.fade-enter,
.fade-leave-to
  /* .fade-leave-active in <2.1.8 */

{
  opacity: 0
}

.no-permission {
  display        : flex;
  flex-direction : column;
  align-items    : center;
  justify-content: center;
  height         : 60vh;
  color          : #aaa;
}

.no-permission__icon {
  font-size    : 64px;
  margin-bottom: 16px;
}

.no-permission__text {
  font-size  : 24px;
  font-weight: 600;
  margin     : 0;
}
</style>
