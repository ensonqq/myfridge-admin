<template>
  <el-dialog title="產品資料"
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
                    <img v-if="promotionImg" :src="promotionImg" class="picture-src">
                  </el-upload>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="promotion.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ promotion.id }}
                    </div>
                  </div>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="網站優惠Banner名稱"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="name"
                              v-model="promotion.name">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <fg-input type="text"
                            label="連結"
                            name="url"
                            v-model="promotion.url">
                  </fg-input>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="status"
                                      rules="required"
                                      v-slot="{ passed, failed }">
                    <fg-input label="顯示於" name="status" :error="failed ? '錯誤': null" :hasSuccess="passed">
                      <el-select class="select-normal"
                                 size="large"
                                 placeholder=""
                                 v-model="promotion.type">
                        <el-option v-for="option in promotionTypes"
                                   :value="option.value"
                                   :label="option.label"
                                   :key="option.value">
                        </el-option>
                      </el-select>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <label class="col-form-label">發佈</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="promotion.publish"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ promotion.publish ? '已發佈' : '未發佈' }}
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
      dialogVisible  : false,
      resolve        : null,
      reject         : null,
      moment,
      promotionTypes : [
        {
          value : 'all',
          label : '全部子網站'
        },
        {
          value : 'main',
          label : 'myfridge.com'
        },
        {
          value : 'student',
          label : 'student.myfridge.com'
        }
      ],
      promotions     : [],
      promotion      : {
        type : '',
        name : {
          zh : '',
          en : ''
        },
        url  : ''
      },
      promotionImg   : ''
    };
  },

  methods : {
    onImageChange (file) {
      this.promotionImg = URL.createObjectURL(file.raw);
    },

    async open (promotionId) {
      this.dialogVisible = true

      if (promotionId) {
        this.getPromotionDetail(promotionId)
      } else {
        this.newPromotion()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newPromotion () {
      this.promotionImg = "//placehold.co/600x600?text=500x500"
      this.promotion = {
        url     : '',
        name    : '',
        type    : '',
        publish : false,
        images  : []
      }
    },


    async getPromotionDetail (promotionId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/promotions/' + promotionId)
        this.promotionImg = detail.data.images[0] ? detail.data.images[0].large.path : '//placehold.co/600x600?text=500x500'
        this.promotion = detail.data
        this.promotion.images = detail.data.images.map(item => item.id)
        delete this.promotion.createdAt
        delete this.promotion.updatedAt
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

        const promotion = _.clone(this.promotion)

        // product.promotion = this.ca
        delete promotion.id
        const result = this.promotion.id ? await this.$api.patch('/v1/promotions/' + this.promotion.id, promotion) : await this.$api.post('/v1/promotions/', promotion)
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
            this.promotion.images = [result.data.id]
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
      this.promotions = []
      this.newPromotion()
      this.promotionImg = ''
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
