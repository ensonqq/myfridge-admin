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
                <h5>圖片 (400x400)</h5>
                <div class="col-sm-12">
                  <el-upload class="picture w-100 h-100"
                             drag
                             ref="image"
                             action=""
                             :on-change="onImageChange"
                             :auto-upload="false"
                             :show-file-list="false">
                    <img v-if="categoryImg" :src="categoryImg" class="picture-src">
                  </el-upload>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="category.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ category.id }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="mb-2 col-6">
                    <ValidationProvider name="zhname" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="類別名稱(中文)"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="zhname"
                                v-model="category.name.zh">
                      </fg-input>
                    </ValidationProvider>
                  </div>

                  <div class="mb-2 col-6">
                    <ValidationProvider name="enname" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="類別名稱(Eng)"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="enname"
                                v-model="category.name.en">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="sloganZh" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="Slogan(中文)"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="sloganZh"
                              v-model="category.slogan.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="sloganEn" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="Slogan(Eng)"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="sloganEn"
                              v-model="category.slogan.en">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <label class="col-form-label">發佈</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="category.publish"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ category.publish ? '已發佈' : '未發佈' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12 pl-0">
                <h4>折扣Tiers
                  <el-switch v-model="category.discountTierEnabled"
                             active-color="#13ce66"
                             inactive-color="#ff4949">
                  </el-switch>
                  {{ category.discountTierEnabled ? '啟用' : '停用' }}
                  <span style="font-size: 16px">(現有{{ category.discount.length }}層)</span>
                </h4>
              </div>

              <draggable v-model="category.discount" class="row" :disabled="!category.discountTierEnabled" style="position: relative">
                <div v-show="!category.discountTierEnabled" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.5);z-index: 1"></div>
                <div class="col-6 mb-2" v-for="(discount,index) in category.discount">
                  <div class="delete text-right"><span @click="deleteDicountTier(index)">刪除</span></div>
                  <div class="form-group pa-10">
                    <div class="form-control d-flex flex-wrap">
                      <div class="col-12">
                        <h5>Tier: {{ index + 1 }}</h5>
                      </div>
                      <ValidationProvider class="col-6" :name="'discountQuantity' + index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="每(數量)"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'discountQuantity' + index"
                                  v-model="category.discount[index].quantity">
                        </fg-input>
                      </ValidationProvider>
                      <ValidationProvider class="col-6" :name="'discountValue'+ index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="減(價錢) *數值必須為負值"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'discountValue' + index"
                                  v-model="category.discount[index].value">
                        </fg-input>
                      </ValidationProvider>
                      <div class="col-12 text-danger">
                        (滿{{ discount.quantity }}件每件 -${{ discount.value * -1 }})
                      </div>
                    </div>
                  </div>
                </div>
              </draggable>
              <div class="col-12 mb-2">
                <div v-show="!category.discountTierEnabled" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.5);z-index: 1"></div>
                <div class="form-group pa-10 w-100 h-100 d-flex justify-content-center align-items-center">
                  <el-button @click="category.discount.push({quantity: 0, value: 0})">＋增加Tier</el-button>
                </div>
              </div>
            </div>


            <div class="row">
              <div class="col-12 pl-0">
                <h4>買X送Y
                  <el-switch v-model="category.buyXGetYFreeEnabled"
                             active-color="#13ce66"
                             inactive-color="#ff4949">
                  </el-switch>
                  {{ category.buyXGetYFreeEnabled ? '啟用' : '停用' }}
                  <span style="font-size: 16px">(現有{{ category.discount.length }}層)</span>
                </h4>
              </div>

              <draggable v-model="category.buyXGetYFree" class="row" :disabled="!category.buyXGetYFreeEnabled" style="position: relative">
                <div v-show="!category.buyXGetYFreeEnabled" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.5);z-index: 1"></div>
                <div class="col-6 mb-2" v-for="(buyXGetYFree,index) in category.buyXGetYFree">
                  <div class="delete text-right"><span @click="deleteBuyXGetYFree(index)">刪除</span></div>
                  <div class="form-group pa-10">
                    <div class="form-control d-flex flex-wrap">
                      <div class="col-12">
                        <h5>Tier: {{ index + 1 }}</h5>
                      </div>
                      <ValidationProvider class="col-6" :name="'buyXGetYFreeQuantity' + index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="買(正值)"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'buyXGetYFreeQuantity' + index"
                                  v-model="category.buyXGetYFree[index].x">
                        </fg-input>
                      </ValidationProvider>
                      <ValidationProvider class="col-6" :name="'buyXGetYFreeValue'+ index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="送(正值)"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'buyXGetYFreeValue' + index"
                                  v-model="category.buyXGetYFree[index].y">
                        </fg-input>
                      </ValidationProvider>
                      <div class="col-12 text-danger">
                        (買{{ buyXGetYFree.x }}送{{ buyXGetYFree.y }})
                      </div>
                    </div>
                  </div>
                </div>
              </draggable>
              <div class="col-12 mb-2">
                <div v-show="!category.buyXGetYFreeEnabled" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.5);z-index: 1"></div>
                <div class="form-group pa-10 w-100 h-100 d-flex justify-content-center align-items-center">
                  <el-button @click="category.buyXGetYFree.push({x: 0, y: 0})">＋增加買X送Y</el-button>
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
import draggable                                                             from 'vuedraggable'

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
    UserProfile,
    draggable
  },
  data () {
    return {
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      moment,
      categories    : [],
      category      : {
        discount            : [],
        discountTierEnabled : false,
        buyXGetYFreeEnabled : false,
        buyXGetYFree        : {
          x : 0,
          y : 0,
        },
        name                : {
          zh : '',
          en : ''
        },
        slogan              : {
          zh : '無抗生素，不含味精，不含防腐，每日新鮮香港制造。',
          en : 'No antibiotics, no MSG, no preservatives, fresh daily made in Hong Kong.'
        },
      },
      categoryImg   : ''
    };
  },

  methods : {
    onImageChange (file) {
      this.categoryImg = URL.createObjectURL(file.raw);
    },

    async open (categoryId) {
      this.dialogVisible = true

      if (categoryId) {
        this.getCategoryDetail(categoryId)
      } else {
        this.newCategory()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newCategory () {
      this.categoryImg = "//placehold.co/400x400"
      this.category = {
        discount     : [],
        buyXGetYFree : [],
        name         : {
          zh : '',
          en : ''
        },
        slogan       : {
          zh : '無抗生素，不含味精，不含防腐，每日新鮮香港制造。',
          en : 'No antibiotics, no MSG, no preservatives, fresh daily made in Hong Kong.'
        }
      }
    },


    deleteDicountTier (index) {
      this.category.discount.splice(index, 1)
    },

    deleteBuyXGetYFree (index) {
      this.category.buyXGetYFree.splice(index, 1)
    },

    async getCategoryDetail (categoryId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/categories/' + categoryId)
        this.categoryImg = detail.data.images[0] ? detail.data.images[0].large.path : '//placehold.co/400x400'
        this.category = detail.data
        this.category.images = detail.data.images.map(item => item.id)
        this.category.discount = this.category.discount.map(({ quantity, value }) => ({ quantity, value }))
        this.category.buyXGetYFree = this.category.buyXGetYFree.map(({ x, y }) => ({ x, y }))
        delete this.category.createdAt
        delete this.category.updatedAt
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

        const category = _.clone(this.category)

        // product.category = this.ca
        delete category.id
        const result = this.category.id ? await this.$api.patch('/v1/categories/' + this.category.id, category) : await this.$api.post('/v1/categories/', category)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '產品更新成功',
            type    : 'success',
          })
          this.dialogVisible = false
          this.resolve(true)
          this.reset()
        }
      } catch (e) {
        console.log(e)
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
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
            this.category.images = [result.data.id]
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
      this.categories = []
      this.newCategory()
      this.categoryImg = ''
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
