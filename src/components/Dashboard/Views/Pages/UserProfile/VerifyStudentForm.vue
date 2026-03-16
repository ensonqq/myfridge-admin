<template>
  <div class="card">
    <div class="card-header">
      <h4 class="title">學生資料
        <span :class="{'text-danger': profile.student.status === 'rejected', 'text-success': profile.student.status === 'approved'}">({{ statuses[profile.student.status] }})</span>
      </h4>
    </div>
    <div class="card-body">
      <ValidationObserver v-slot="{ handleSubmit }" ref="userForm">
        <form @submit.prevent>


          <div class="row">
            <div class="col-md-4 col-12">
              <div class="col-md-12 mb-2">
                ID: {{ userDetail.id }}
              </div>
              <div class="col-md-12 mb-2">
                註冊日: {{ moment(userDetail.createdAt).format('YYYY-MM-DD') }}
              </div>

              <div class="col-md-12 mb-2">
                學生脹號: {{
                  userDetail.student.verified ? moment(userDetail.student.endAt).format('YYYY-MM-DD') : '等待驗證'
                }}
              </div>
              <div class="col-md-12 mb-2">名稱: {{ profile.name }}</div>
              <div class="col-md-12 mb-2">Email: {{ profile.email }}</div>
              <div class="col-md-12 mb-2">性別: {{ gender[profile.gender] }}</div>
              <div class="col-md-12 mb-2">積分: {{ profile.credits }}</div>
              <div class="col-md-12 mb-2">Cash 獎金: {{ profile.cashReward }}</div>
              <div class="col-md-12 mb-2">用戶權限: {{ profile.role }}</div>
              <div class="col-md-12 mb-2">備註: {{ profile.remarks || '--' }}</div>
              <div class="col-md-12 mb-2">
                <ValidationProvider name="isStudent"
                                    rules="required"
                                    v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '錯誤': null"
                            :hasSuccess="passed"
                            label="是否學生：">
                    <el-switch v-model="profile.isStudent"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ profile.isStudent ? '是' : '否' }}
                  </fg-input>
                </ValidationProvider>
              </div>
              <div class="col-md-12 mb-2">
                <ValidationProvider name="studentEndAt"
                                    rules="required"
                                    v-slot="{ passed, failed }">
                  <fg-input label="學生優惠完結日" :error="failed ? '錯誤': null"
                            :hasSuccess="passed">
                    <el-date-picker v-model="studentEndAt"
                                    type="date"
                                    placeholder="">
                    </el-date-picker>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>
            <div class="col-md-8 col-12">
              <template v-if="profile.isStudent">
                <div class="col-md-12">
                  <div class="mb-3">學生證:</div>
                  <img :src="studentImg" class="picture-src">
                </div>
              </template>
            </div>
          </div>
          <div class="text-center">
            <div class="row">
              <div class="col-6">
                <p-button block :loading="loading" @click="reject" type="danger" class="mb-3">拒絕</p-button>
              </div>
              <div class="col-6">
                <p-button block :loading="loading" @click="approve" type="primary" class="mb-3">通過</p-button>
              </div>
            </div>
          </div>
          <div class="clearfix"></div>
        </form>
      </ValidationObserver>
    </div>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </div>
</template>
<script>
import {mapMutations, mapState}                                                             from "vuex";
import {DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option, Switch, Upload} from 'element-ui'
import PProgress
                                                                                            from 'src/components/UIComponents/Progress.vue'
import PSwitch
                                                                                            from 'src/components/UIComponents/Switch.vue'
import _                                                                                    from 'lodash'
import NotificationTemplate
                                                                                            from "@/components/Dashboard/Views/Components/NotificationTemplate"
import moment                                                                               from "moment";
import ConfirmDialog
                                                                                            from '../../../Views/Components/ConfirmDialog'

export default {
  components : {
    [DatePicker.name] : DatePicker,
    [TimeSelect.name] : TimeSelect,
    [Slider.name]     : Slider,
    [Tag.name]        : Tag,
    [Input.name]      : Input,
    [Switch.name]     : Switch,
    [Button.name]     : Button,
    [Option.name]     : Option,
    [Select.name]     : Select,
    [Upload.name]     : Upload,
    PSwitch,
    PProgress,
    ConfirmDialog
  },
  computed   : {
    ...mapState(['user'])
  },
  props      : ['userDetail'],
  watch      : {
    studentEndAt (val) {
      this.profile.student.endAt = null
      if (val) {
        this.profile.student.endAt = moment(val).endOf('day').toISOString()
      }
    },
  },
  data () {
    return {
      studentEndAt : null,
      moment,
      gender       : { m : '男', f : '女' },
      loading      : false,
      statuses     : { pending : '等待驗證', approved : '已通過', rejected : '已拒絕' },
      profile      : {
        name            : null,
        email           : null,
        gender          : null,
        credits         : null,
        cashReward      : null,
        addresses       : null,
        isEmailVerified : null,
        status          : null,
        remarks         : '',
        isStudent       : null,
        student         : {
          image  : null,
          status : null,
          endAt  : null,
        }
      },
      studentImg   : ''
    }
  },
  created () {
    this.profile = _.clone(this.userDetail)
    if (this.profile.student) {
      if (this.profile.student.endAt) {
        this.studentEndAt = moment(this.profile.student.endAt).toDate()
      }
      if (this.profile.student.image) {
        this.studentImg = this.profile.student.image ? this.profile.student.image.medium.path : '//placehold.co/700x800'
      }
    }
  },
  methods : {
    async uploadAndSetImage () {
      //process images
      const file = this.$refs.image ? this.$refs.image.uploadFiles : null
      try {
        if (file && file.length) {
          let bodyFormData = new FormData()

          bodyFormData.append('file', file[0].raw)

          let result = await this.$api.post('/v1/uploads/image', bodyFormData)
          if (result.data) {
            this.profile.student.image = result.data.id
          }
        } else if (this.profile.student.image && this.profile.student.image.id) {
          this.profile.student.image = this.profile.student.image.id
        }
      } catch (e) {
        console.log(e)
      } finally {
      }
      return true
    },

    async approve () {
      if (!await this.$refs.userForm.validate()) {
        this.$notify.error({ title : '提交錯誤', message : '所有資料未填好' });
        return
      }
      const confirmation = await this.$refs.ConfirmDialog.open('通過審批', '你確定通過此帳號的學生申請？')
      if (!confirmation.isConfirmed) return
      try {
        this.loading = true
        this.profile.student.status = 'approved'
        const profile = _.pick(this.profile, ['student', 'isStudent'])
        await this.uploadAndSetImage()
        const user = await this.$api.patch('/v1/users/student/' + this.profile.id, profile)

        if (user) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
          this.$emit('refresh')
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        this.loading = false
      }
    },

    async reject () {
      try {
        const confirmation = await this.$refs.ConfirmDialog.open('拒絕審批', '確定拒絕申請？')
        if (!confirmation.isConfirmed) return
        this.loading = true
        await this.uploadAndSetImage()
        const profile = _.pick(this.profile, ['student', 'isStudent'])
        profile.student.status = 'rejected'
        delete profile.student.endAt
        const update = await this.$api.patch('/v1/users/student/' + this.profile.id, profile)
        if (update) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
          this.$emit('refresh')
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        this.loading = false
      }
    }
  }
}

</script>
<style>

</style>
