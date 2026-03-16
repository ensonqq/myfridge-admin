<template>
  <el-dialog :title="userDetail && userDetail.id?'用戶資料': '建立用戶'"
             :visible.sync="dialogVisible"
             class="fix-footer"
             @close="close"
             fullscreen>
    <div class="row" v-if="userDetail">
      <template v-if="userDetail.role === 'admin' || userDetail.role === 'super'">
        <div class="col-lg-4 col-md-5" v-if="userDetail">
          <user-card :userDetail="userDetail"/>
          <!--        <members-card/>-->
        </div>
        <div class="col-lg-8 col-md-7">
          <edit-profile-form :userDetail="userDetail"/>
        </div>
      </template>
      <template v-else>
        <div class="col-lg-12 col-md-12">
          <edit-profile-form :userDetail="userDetail"/>
        </div>
      </template>


      <div class="col-lg-12 col-md-12" v-if="userDetail.id">
        <MembersOrderRecord :orders="orders" :topups="topups"/>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">關閉</el-button>
    </span>
  </el-dialog>
</template>
<script>
import EditProfileForm           from './UserProfile/EditProfileForm.vue'
import UserCard                  from './UserProfile/UserCard.vue'
import MembersCard               from './UserProfile/MembersCard.vue'
import MembersOrderRecord        from './UserProfile/MembersOrderRecord.vue'
import {mapMutations, mapState}  from "vuex";
import {Button, Dialog, Loading} from "element-ui";
import randomstring              from "randomstring";

export default {
  name       : "UserProfile",
  components : {
    EditProfileForm,
    UserCard,
    MembersCard,
    MembersOrderRecord,
    [Button.name] : Button,
    [Dialog.name] : Dialog,
  },
  data () {
    return {
      userDetail    : null,
      orders        : [],
      topups        : [],
      dialogVisible : false,
      resolve       : null,
      reject        : null,
    }
  },
  methods : {
    async getUserDetail (id) {
      if (!id) return
      const loading = new Loading.service({ fullscreen : false });
      try {
        const user = await this.$api.get('/v1/users/' + id)
        this.userDetail = user.data
      } catch (e) {
      } finally {
        loading.close()
      }
    },

    async getUserOrders (userId) {
      if (!userId) return
      const loading = new Loading.service({ fullscreen : false });
      try {
        const orders = await this.$api.get('/v1/orders/userOrder/' + userId, { params : { orderStatus : 'confirmed' } })
        this.orders = orders.data.results
      } catch (e) {
      } finally {
        loading.close()
      }
    },

    async getUserTopups (userId) {
      if (!userId) return
      const loading = new Loading.service({ fullscreen : false });
      try {
        const topups = await this.$api.get('/v1/topups/userOrder/' + userId, { params : { orderStatus : 'confirmed' } })
        this.topups = topups.data.results
      } catch (e) {
      } finally {
        loading.close()
      }
    },

    close () {
      this.dialogVisible = false
      this.resolve(false)
      this.orders = []
      this.userDetail = null
    },

    async open (userId) {
      this.dialogVisible = true
      setTimeout(() => {
        document.body.click()
      }, 500)

      if (userId) {
        this.getUserDetail(userId)
        this.getUserOrders(userId)
        this.getUserTopups(userId)
      } else {
        this.newUser()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    newUser () {
      this.userDetail = {
        isEmailVerified : false,
        role            : 'user',
        status          : 'active',
        addresses       : [],
        credits         : 0,
        cashReward      : 0,
        password        : randomstring.generate({ length : 8 }),
        isStudent       : false,
      }
    },
  },

  props : ['id'],
  created () {
    this.getUserDetail(this.id)
  },
  watch : {
    $route (to, from) {
      this.getUserDetail(to.params.id)
    }
  }
}

</script>
<style>

</style>
