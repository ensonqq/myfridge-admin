<template>
  <el-dialog title="增值卡資料"
             :visible.sync="dialogVisible"
             class="fix-footer"
             fullscreen>
    <div class="row justify-content-center">

      <div class="col-sm-8 col-12 justify-content-center" v-if="dialogVisible">
        <ValidationObserver v-slot="{ handleSubmit }" ref="form">
          <form @submit.prevent="handleSubmit(submit)">

            <div class="row">
              <div class="col-12 col-sm-6">
                <h5>圖片 (500x500)</h5>
                <div class="col-sm-12">
                  <el-upload clas
                             s="picture w-100 h-100"
                             drag
                             ref="image"
                             action=""
                             :on-change="onImageChange"
                             :auto-upload="false"
                             :show-file-list="false">
                    <img v-if="topupCardImg" :src="topupCardImg" class="picture-src">
                  </el-upload>
                </div>


                <div class="mb-2">
                  <ValidationProvider name="titlezh" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="簡稱(中)*"
                              :error="failed ? '錯簡稱': null"
                              :hasSuccess="passed"
                              name="titlezh"
                              v-model="topup.title.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="titleen" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="簡稱(Eng)*"
                              :error="failed ? '錯簡稱': null"
                              :hasSuccess="passed"
                              name="titleen"
                              v-model="topup.title.en">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="desczh" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="說明(中)*"
                              :error="failed ? '錯說明': null"
                              :hasSuccess="passed"
                              name="desczh"
                              v-model="topup.desc.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="descen" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="說明(Eng)*"
                              :error="failed ? '錯說明': null"
                              :hasSuccess="passed"
                              name="descen"
                              v-model="topup.desc.en">
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="topup.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ topup.id }}
                    </div>
                  </div>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="namezh" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="名稱(中)*"
                              :error="failed ? '錯中文名': null"
                              :hasSuccess="passed"
                              name="namezh"
                              v-model="topup.name.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="nameen" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="名稱(Eng)*"
                              :error="failed ? '錯英文Eng名': null"
                              :hasSuccess="passed"
                              name="nameen"
                              v-model="topup.name.en">
                    </fg-input>
                  </ValidationProvider>
                </div>


                <div class="mb-2">
                  <ValidationProvider name="gender"
                                      rules="required"
                                      v-slot="{ passed, failed }">
                    <fg-input label="有效時限" :error="failed ? '錯誤': null"
                              :hasSuccess="passed"
                              name="gender">
                      <el-select class="select-normal"
                                 size="large"
                                 placeholder=""
                                 v-model="topup.validity">
                        <el-option v-for="option in validities"
                                   :value="option.value"
                                   :label="option.label"
                                   :key="option.value">
                        </el-option>
                      </el-select>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="price" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="number"
                              label="購買價錢"
                              :error="failed ? '錯購買價錢，必需為數字': null"
                              :hasSuccess="passed"
                              name="price"
                              v-model="topup.price">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="credits" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="number"
                              label="獲得積分"
                              :error="failed ? '錯獲得積分，必需為數字': null"
                              :hasSuccess="passed"
                              name="credits"
                              v-model="topup.credits">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="maxQtyPerUser" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="number"
                              label="每人最多購買量"
                              :error="failed ? '錯每人最多購買量，必需為數字': null"
                              :hasSuccess="passed"
                              name="maxQtyPerUser"
                              v-model="topup.maxQtyPerUser">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <label class="col-form-label">發佈狀態</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="topup.publish"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ topup.publish ? '已發佈' : '未發佈' }}
                  </div>
                </div>
              </div>
            </div>
          </form>

        </ValidationObserver>
      </div>
    </div>
    <!-- Classic Modal -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">關閉</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {Card, Modal}                                                         from 'src/components/UIComponents'
import {extend}                                                              from "vee-validate";
import {required, numeric, regex, confirmed}                                 from "vee-validate/dist/rules";
import {Loading, Option, Select, Button, DatePicker, Dialog, Upload, Switch} from 'element-ui';
import moment                                                                from 'moment'
import {mapState}                                                            from "vuex";
import Vue                                                                   from "vue";
import UserProfile
                                                                             from "@/components/Dashboard/Views/Pages/UserProfile";

extend("required", required);
extend("numeric", numeric);
extend("regex", regex);
extend("confirmed", confirmed);

export default {
  components : {
    Card,
    [Option.name]     : Option,
    [Select.name]     : Select,
    [Button.name]     : Button,
    [DatePicker.name] : DatePicker,
    [Dialog.name]     : Dialog,
    [Upload.name]     : Upload,
    [Switch.name]     : Switch,
    UserProfile
  },
  data () {
    return {
      validities    : [{ label : '永久有效', value : 'permanent' }],
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      moment,

      topup        : {
        name          : {
          zh : '',
          en : ''
        },
        title         : {
          zh : '',
          en : ''
        },
        desc          : {
          zh : '',
          en : ''
        },
        validity      : 'permanent',
        maxQtyPerUser : null,
        price         : null,
        credits       : null,
        remarks       : '',
        publish       : false,
      },
      topupCardImg : ''
    };
  },
  watch   : {},
  methods : {
    onImageChange (file) {
      this.topupCardImg = URL.createObjectURL(file.raw);
    },

    async open (topupId) {
      this.dialogVisible = true

      if (topupId) {
        this.getTopupDetail(topupId)
      } else {
        this.newTopup()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newTopup () {

      this.topupCardImg = "//placehold.co/600x350?text=600x350"
      this.topup = {
        name          : {
          zh : '',
          en : ''
        },
        title         : {
          zh : '',
          en : ''
        },
        desc          : {
          zh : '',
          en : ''
        },
        validity      : 'permanent',
        maxQtyPerUser : null,
        price         : null,
        credits       : null,
        remarks       : '',
        images        : [],
        publish       : false,
      }
    },


    async getTopupDetail (topupId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/topups/' + topupId)
        this.topupCardImg = detail.data.images[0] ? detail.data.images[0].large.path : '//placehold.co/600x350?text=600x350'
        this.topup = detail.data
        this.topup.images = detail.data.images.map(item => item.id)

        delete this.topup.createdAt
        delete this.topup.updatedAt
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async submit () {
      if (!await this.$refs.form.validate()) return

      const loading = new Loading.service({ fullscreen : false });
      try {
        const valid = await this.$refs.form.validate()
        if (!valid) return

        await this.uploadAndSetImage()

        const topup = _.clone(this.topup)

        // product.promotion = this.ca
        delete topup.id
        const result = this.topup.id ? await this.$api.patch('/v1/topups/' + this.topup.id, topup) : await this.$api.post('/v1/topups/', topup)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
          this.dialogVisible = false
          this.resolve(true)
          this.reset()
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新失敗' });
      } finally {
        loading.close()
      }
    },

    async uploadAndSetImage () {
      //process images
      const file = this.$refs.image.uploadFiles
      try {
        if (file && file.length) {
          let bodyFormData = new FormData()

          bodyFormData.append('file', file[0].raw)

          let result = await this.$api.post('/v1/uploads/image', bodyFormData)
          if (result.data) {
            this.topup.images = [result.data.id]
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
      }
      return true
    },

    close () {
      this.dialogVisible = false
      this.resolve(false)
      this.reset()
    },
    reset () {
      this.newTopup()
      this.topupCardImg = ''
    }
  }
}
</script>
<style lang="scss">
.no-edit {
  background-color: #eee !important;
}

.el-upload-dragger {
  width: inherit;
  height: inherit;
}

.image-container {
  cursor: pointer;
}
</style>
