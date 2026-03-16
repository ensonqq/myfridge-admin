<template>
  <div class="card">
    <div class="card-header">
      <h4 class="title">{{ userDetail.id ? '用戶資料' : '建立用戶' }}</h4>
    </div>
    <div class="card-body">
      <ValidationObserver v-slot="{ handleSubmit }" ref="userForm">
        <form @submit.prevent="handleSubmit(saveUser)">
          <div class="row">
            <div class="col-md-12 mb-2">
              ID: {{ userDetail.id }}
            </div>
          </div>

          <div class="row">
            <div class="col-md-12 mb-2" v-if="userDetail.vipTier">
              等級:
              <span :style="'color: '+vipTiers[userDetail.vipTier].color">{{ vipTiers[userDetail.vipTier].tier }}</span> | 訂單量: {{ profile.totalOrders }} | 總銷費: ${{ profile.totalSpent }}
            </div>
          </div>

          <div class="row">
            <div class="col-md-12 mb-2">
              註冊日: {{ moment(userDetail.createdAt).format('YYYY-MM-DD') }}
            </div>
          </div>

          <div class="row" v-if="userDetail.isStudent">
            <div class="col-md-12 mb-2">
              學生脹號: {{
                userDetail.student.verified ? moment(userDetail.student.endAt).format('YYYY-MM-DD') : '等待驗證'
              }}
            </div>
          </div>

          <div class="row">
            <div class="col-md-5">
              <fg-input type="text"
                        label="公司"
                        :disabled="true"
                        placeholder="MyFridge">
              </fg-input>
            </div>
          </div>

          <div class="row">
            <div class="col-md-12">
              <ValidationProvider name="name"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="name"
                          type="text"
                          label="名稱"
                          v-model="profile.name"></fg-input>
              </ValidationProvider>
            </div>
          </div>


          <div class="row">
            <div class="col-md-12">
              <ValidationProvider name="email"
                                  rules="required|email"
                                  v-slot="{ passed, failed }">
                <fg-input :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          type="text"
                          name="email"
                          label="Email"
                          v-model="profile.email"></fg-input>
              </ValidationProvider>
            </div>
          </div>

          <!-- password, only appears if creating a new user -->
          <div class="row" v-if="!profile.id">
            <div class="col-md-12">
              <ValidationProvider name="password"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          type="text"
                          name="password"
                          label="密碼"
                          placeholder=""
                          v-model="profile.password"></fg-input>
              </ValidationProvider>
            </div>
          </div>


          <div class="row">
            <div class="col-md-4">
              <ValidationProvider name="gender"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input label="性別" :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="gender">
                  <el-select class="select-normal"
                             size="large"
                             placeholder=""
                             v-model="profile.gender">
                    <el-option v-for="option in gender"
                               :value="option.value"
                               :label="option.label"
                               :key="option.value">
                    </el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>
            </div>
            <div class="col-md-4">
              <ValidationProvider name="credits"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          type="text"
                          label="積分"
                          placeholder=""
                          v-model="profile.credits">
                </fg-input>
              </ValidationProvider>
            </div>
            <div class="col-md-4">
              <ValidationProvider name="caseReward"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          type="number"
                          label="Cash 獎金"
                          placeholder=""
                          v-model="profile.cashReward">
                </fg-input>
              </ValidationProvider>
            </div>
          </div>

          <div class="row">
            <div class="col-md-12">
              <label>所有地址</label>
              <div class="d-flex align-items-center" v-for="(address,index) in profile.addresses">
                {{ areas[address.area] }},{{ address.district }},{{ address.subDistrict }} {{ address.fullAddress }} {{ address.phone }} ({{ address.recipient }}收)
                <p-button style="margin-left: 10px;" size="sm" icon @click.stop="editAddress(address, index)">
                  <i class="fa fa-edit" aria-hidden="true"></i>
                </p-button>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-12">
              <label>自取點</label>
              <div class="d-flex align-items-center" v-for="(address,index) in profile.pickupAddresses">
                {{ areas[address.area] }},{{ address.district }},{{ address.subDistrict }} {{ address.fullAddress + '^' + address.code + '^' }} {{ address.phone }} ({{ address.recipient }}收)
                <p-button style="margin-left: 10px;" size="sm" icon @click.stop="editPickupAddress(address, index)">
                  <i class="fa fa-edit" aria-hidden="true"></i>
                </p-button>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <ValidationProvider name="status"
                                    rules="required"
                                    v-slot="{ passed, failed }">
                  <fg-input label="用戶狀態" name="status" :error="failed ? '錯誤': null" :hasSuccess="passed">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="profile.status">
                      <el-option v-for="option in userStatus"
                                 :value="option.value"
                                 :label="option.label"
                                 :key="option.value">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="col-md-4">
              <div class="form-group">
                <ValidationProvider name="status"
                                    rules="required"
                                    v-slot="{ passed, failed }">
                  <fg-input label="用戶權限" name="status" :error="failed ? '錯誤': null" :hasSuccess="passed">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="profile.role">
                      <el-option v-for="option in userRoles"
                                 :value="option.value"
                                 :label="option.label"
                                 :key="option.value">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="col-md-4">
              <ValidationProvider name="isEmailVerified"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input name="isEmailVerified"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          label="Email認證">
                  <p-checkbox v-model="profile.isEmailVerified">{{ profile.isEmailVerified ? '已認證' : '未認證' }}</p-checkbox>
                </fg-input>
              </ValidationProvider>
            </div>
          </div>

          <div class="row py-4 my-2" style="background-color: rgba(40,71,230,0.3);">
            <div class="col-md-12">
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
            <template v-if="profile.isStudent">
              <div class="col-md-4">
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

              <div class="col-md-12">
                <el-upload class="picture w-100 h-100 text-center"
                           drag
                           ref="image"
                           action=""
                           :on-change="onImageChange"
                           :auto-upload="false"
                           :show-file-list="false">
                  <img v-if="studentImg" :src="studentImg" class="picture-src">
                </el-upload>
              </div>
            </template>
          </div>

          <div class="row">
            <div class="col-md-12">
              <fg-input name="remarks"
                        type="text"
                        label="備注"
                        v-model="profile.remarks"></fg-input>
            </div>
          </div>

          <div class="text-center">
            <p-button native-type="submit" :loading="loading" type="primary" class="mb-3">儲存</p-button>
          </div>
          <div class="clearfix"></div>

        </form>
      </ValidationObserver>
    </div>

    <div v-if="userDetail.id === user.id">
      <div class="card-header">
        <h4 class="title">更改密碼</h4>
      </div>
      <div class="card-body">
        <ValidationObserver v-slot="{ handleSubmit }" ref="passwordForm">
          <form @submit.prevent="handleSubmit(changePassword)">
            <div class="row">
              <div class="col-md-12">
                <ValidationProvider name="old"
                                    rules="required"
                                    v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '此為必填': null"
                            :hasSuccess="passed"
                            type="password"
                            label="現時的密碼"
                            placeholder=""
                            v-model="password.old"></fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12">
                <ValidationProvider name="password"
                                    rules="required"
                                    v-slot="{ passed, failed }"
                                    vid="confirmation">
                  <fg-input :error="failed ? '輸入新密碼': null"
                            :hasSuccess="passed"
                            type="password"
                            label="新密碼"
                            placeholder=""
                            v-model="password.new"></fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12">
                <ValidationProvider name="new"
                                    rules="required|confirmed:confirmation"
                                    v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '新密碼不相同': null"
                            :hasSuccess="passed"
                            type="password"
                            label="重新輸入新密碼"
                            placeholder=""
                            v-model="password.new2"></fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="text-center">
              <p-button native-type="submit" :loading="loadingChangePassword" type="primary" class="mb-3">儲存</p-button>
            </div>
            <div class="clearfix"></div>

          </form>
        </ValidationObserver>
      </div>
    </div>
    <EditAddressModal ref="EditAddressModal"></EditAddressModal>
    <EditPickupAddressModal ref="EditPickupAddressModal"></EditPickupAddressModal>
  </div>
</template>
<script>
import randomstring                                                                         from 'randomstring'
import {mapMutations, mapState}                                                             from "vuex";
import {DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option, Switch, Upload} from 'element-ui'
import PProgress
                                                                                            from 'src/components/UIComponents/Progress.vue'
import PSwitch
                                                                                            from 'src/components/UIComponents/Switch.vue'
import _                                                                                    from 'lodash'
import NotificationTemplate
                                                                                            from "@/components/Dashboard/Views/Components/NotificationTemplate"
import EditAddressModal
                                                                                            from "@/components/Dashboard/Views/Orders/components/EditAddressModal"
import moment                                                                               from "moment";
import EditPickupAddressModal
                                                                                            from "@/components/Dashboard/Views/Orders/components/EditPickupAddressModal";

export default {
  components : {
    EditPickupAddressModal,
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
    EditAddressModal
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
      studentEndAt          : null,
      moment,
      userStatus            : [{ label : '正常', value : 'active' }, { label : '禁止', value : 'banned' },
        { label : '刪除', value : 'deleted' }],
      userRoles             : [{ label : '會員', value : 'user' }, { label : 'KOL', value : 'kol' },
        { label : '管理員', value : 'admin' },
        { label : '超級管理員', value : 'super' }],
      gender                : [{ label : '男', value : 'm' }, { label : '女', value : 'f' }],
      loading               : false,
      loadingChangePassword : false,
      areas                 : {
        hk  : '港島',
        kln : '九龍',
        nt  : '新界',
      },
      vipTiers              : {
        normal  : {
          tier  : '普通',
          color : ''
        },
        gold    : {
          tier  : '黃金',
          color : '#f88f02'
        },
        diamond : {
          tier  : '鑽石',
          color : '#431ec8'
        }
      },
      profile               : {
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
      password              : {
        old  : '',
        new  : '',
        new2 : ''
      },
      studentImg            : ''
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
    onImageChange (file) {
      this.studentImg = URL.createObjectURL(file.raw);
    },

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

    async editAddress (address, index) {
      const modifiedAddress = await this.$refs.EditAddressModal.open(address)
      if (modifiedAddress) {
        const addresses = _.cloneDeep(this.profile.addresses)
        addresses[index] = modifiedAddress
        this.profile.addresses = addresses
      }
    },

    async editPickupAddress (address, index) {
      const modifiedAddress = await this.$refs.EditPickupAddressModal.open(address)
      if (modifiedAddress) {
        const addresses = _.cloneDeep(this.profile.addresses)
        addresses[index] = modifiedAddress
        this.profile.pickupAddresses = addresses
      }
    },

    async changePassword () {
      if (!await this.$refs.passwordForm.validate()) return

      try {
        this.loadingChangePassword = true
        const update = await this.$api.post('/v1/auth/change-password', this.password)
        if (update) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        this.loadingChangePassword = false
      }
    },

    async saveUser () {
      if (!await this.$refs.userForm.validate()) return

      try {
        this.loading = true
        const profile = _.pick(this.profile, ['name', 'email', 'gender', 'credits', 'cashReward', 'addresses',
          'isEmailVerified', 'status', 'role', 'remarks', 'student', 'isStudent', 'pickupAddresses'])

        if (profile.role !== 'user') {
          if (this.user.role !== 'super') {
            throw new Error('')
          }
        }

        await this.uploadAndSetImage()

        // for new user handle
        if (!this.profile.id) profile.password = this.profile.password

        profile.addresses = profile.addresses.map(item => {
          delete item._id
          return item
        })

        profile.pickupAddresses = profile.pickupAddresses.map(item => {
          delete item._id
          return item
        })

        const user = this.profile.id ? await this.$api.patch('/v1/users/' + this.profile.id, profile) : await this.$api.post('/v1/users/', profile)

        if (user) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
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
