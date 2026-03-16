<template>
  <el-dialog title="驗證學生"
             :visible.sync="dialogVisible"
             @close="close"
             fullscreen>
    <div class="row" v-if="userDetail">
      <div class="col-lg-12 col-md-12">
        <VerifyStudentForm @refresh="refresh" :userDetail="userDetail"/>
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
import VerifyStudentForm         from "@/components/Dashboard/Views/Pages/UserProfile/VerifyStudentForm";

export default {
  name       : "UserProfile",
  components : {
    VerifyStudentForm,
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
      dialogVisible : false,
      resolve       : null,
      reject        : null,
    }
  },
  methods : {
    refresh () {
      this.close(true)
    },
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

    close (refresh) {
      this.dialogVisible = false
      this.resolve(!!refresh)
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
        cashReward      : 0
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
