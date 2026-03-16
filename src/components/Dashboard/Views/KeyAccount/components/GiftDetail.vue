<template>
  <el-dialog title="禮品資料"
             :visible.sync="dialogVisible"
             class="fix-footer"
             fullscreen>
    <div class="row justify-content-center">
      <div class="col-sm-8 col-12 justify-content-center" v-if="dialogVisible">
        <ValidationObserver v-slot="{ handleSubmit }" ref="form">
          <form @submit.prevent="handleSubmit(submit)">
            <div class="row">
              <div class="col-12 col-sm-6">
                <h5>圖片 (128x128)</h5>
                <div class="col-sm-12">
                  <el-upload clas
                             s="picture w-100 h-100"
                             drag
                             ref="image"
                             action=""
                             :on-change="onImageChange"
                             :auto-upload="false"
                             :show-file-list="false">
                    <img v-if="giftImg" :src="giftImg" class="picture-src">
                  </el-upload>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="gift.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ gift.id }}
                    </div>
                  </div>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="中文名稱"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="namezh"
                              v-model="gift.name.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="Eng Name"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="nameen"
                              v-model="gift.name.en">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2 d-flex">
                  <ValidationProvider class="col-6 px-0 pr-1" name="startAt" rules="required" v-slot="{ passed, failed }">
                    <fg-input label="生效日"
                              :error="failed ? '錯誤': null"
                              :hasSuccess="passed"
                              name="startAt">
                      <el-date-picker v-model="date.startAt"
                                      type="date">
                      </el-date-picker>
                    </fg-input>
                  </ValidationProvider>

                  <ValidationProvider class="col-6 px-0" name="endAt" rules="required" v-slot="{ passed, failed }">
                    <fg-input label="到期日"
                              :error="failed ? '錯誤': null"
                              :hasSuccess="passed"
                              name="endAt">
                      <el-date-picker v-model="date.endAt"
                                      type="date">
                      </el-date-picker>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2 d-flex flex-wrap">
                  <ValidationProvider class="col-6 col-lg-4 px-0 pr-1"
                                      name="type"
                                      rules="required"
                                      v-slot="{ passed, failed }">
                    <fg-input label="禮品類別" name="type" :error="failed ? '請選擇類別': null" :hasSuccess="passed">
                      <el-select class="select-normal"
                                 size="large"
                                 placeholder=""
                                 v-model="gift.item.type">
                        <el-option v-for="option in giftTypes"
                                   :value="option.value"
                                   :label="option.label"
                                   :key="option.value">
                        </el-option>
                      </el-select>
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider class="col-6 col-lg-4 px-0 pr-1" name="product" rules="required" v-slot="{ passed, failed }">
                    <fg-input label="選擇物品" v-if="gift.item.type === 'item'" name="product" :error="failed ? '請選擇物品': null"
                              :hasSuccess="passed">
                      <el-select placeholder=""
                                 class="select-normal w-100" v-model="gift.item.product" filterable>
                        <el-option v-for="item in products"
                                   :key="item.id"
                                   :label="item.name.zh"
                                   :value="item.id">
                        </el-option>
                      </el-select>
                    </fg-input>
                    <fg-input v-else-if="gift.item.type === 'other'" label="選擇物品" value="其他物品" disabled="" :prefix="12">
                    </fg-input>
                    <fg-input v-else label="選擇物品" value="請先選擇獎品類別" disabled="" :prefix="12">
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider class="col-6 col-lg-4 px-0" name="amount" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="數量"
                              :error="failed ? '數量必需為數字': null"
                              :hasSuccess="passed"
                              name="amount"
                              v-model="gift.item.amount">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2 d-flex flex-wrap">
                  <ValidationProvider class="col-6 px-0 pr-1" name="rules.total" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="條件:最低訂單付款"
                              :error="failed ? '數量必需為數字': null"
                              :hasSuccess="passed"
                              name="rules.total"
                              v-model="gift.rules.total">
                    </fg-input>
                  </ValidationProvider>
                  <ValidationProvider class="col-6 px-0" name="rules.quantity" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="條件:最低訂單產品量"
                              :error="failed ? '數量必需為數字': null"
                              :hasSuccess="passed"
                              name="rules.quantity"
                              v-model="gift.rules.quantity">
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="descriptionzh" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="說明(中文)"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="descriptionzh">
                      <textarea v-model="gift.description.zh" class="form-control" rows="3"></textarea>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="descriptionen" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="說明(Eng)"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="descriptionen">
                      <textarea v-model="gift.description.en" class="form-control" rows="3"></textarea>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <label class="col-form-label">發佈</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="gift.published"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ gift.published ? '已發佈' : '未發佈' }}
                  </div>
                </div>
                <div class="mb-2">
                  <label class="col-form-label">前台選取</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="gift.autoChecked"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ gift.autoChecked ? '自動選取' : '非自動選取' }}
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
import draggable                                                             from "vuedraggable";

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
  watch      : {
    date : {
      deep    : true,
      handler : function (val) {
        if (val.startAt) {
          this.gift.startAt = moment(val.startAt).startOf('day').toISOString()
        }
        if (val.endAt) {
          this.gift.endAt = moment(val.endAt).endOf('day').toISOString()
        }
      }
    },
  },
  data () {
    return {
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      moment,
      areas         : [
        {
          value : 'hk',
          label : '香港'
        },
        {
          value : 'kln',
          label : '九龍'
        },
        {
          value : 'nt',
          label : '新界'
        }
      ],
      date          : {
        startAt : null,
        endAt   : null,
      },
      giftTypes     : [{ value : 'other', label : '其他', }, { value : 'item', label : '產品' }],
      gift          : {
        name        : { zh : '', en : '' },
        item        : { type : null, product : null, amount : 1 },
        rules       : {
          total    : null,
          quantity : null,
        },
        startAt     : null,
        endAt       : null,
        published   : false,
        autoChecked : false,
        description : { zh : '', en : '' }
      },
      giftImg       : '',
      products      : []
    };
  },

  methods : {
    onImageChange (file) {
      this.giftImg = URL.createObjectURL(file.raw);
    },

    getProductName (id) {
      if (id) {
        return this.products.filter(item => item.id === id)[0].name.zh
      }
      return ''
    },

    handleInputConfirm (data, val) {
      let inputValue = this[data].inputValue
      if (inputValue && this[data].dynamicTags.indexOf(val) === -1) {
        this[data].dynamicTags.push(val)
      }
      this[data].inputValue = ''
    },


    async open (giftId) {
      this.dialogVisible = true

      await this.getProducts()

      if (giftId) {
        this.getGiftDetail(giftId)
      } else {
        this.newGift()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newGift () {
      this.giftImg = "//placehold.co/600x600?text=128x128"
      this.date = {
        startAt : moment().startOf('day').toDate(),
        endAt   : moment().add(30, 'days').toDate(),
      }
      this.gift = {
        name        : { zh : '', en : '' },
        item        : { type : null, product : null, amount : 1 },
        rules       : {
          total    : null,
          quantity : null,
        },
        startAt     : null,
        endAt       : null,
        published   : false,
        autoChecked : false,
        description : { zh : '', en : '' }
      }
    },

    async getGiftDetail (giftId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/gifts/' + giftId)
        this.giftImg = detail.data.images[0] ? detail.data.images[0].large.path : '//placehold.co/600x600?text=128x128'
        this.gift = detail.data
        this.date.startAt = detail.data.startAt
        this.date.endAt = detail.data.endAt
        this.gift.images = detail.data.images.map(item => item.id)
        delete this.gift.createdBy
        delete this.gift.createdAt
        delete this.gift.updatedAt
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

        const gift = _.clone(this.gift)

        // product.gift = this.ca
        delete gift.id
        const result = this.gift.id ? await this.$api.patch('/v1/gifts/' + this.gift.id, gift) : await this.$api.post('/v1/gifts/', gift)
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

    async getProducts () {
      const loading = Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.get('/v1/products')
        this.products = result.data.results
      } catch (error) {
        console.log(error)
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
            this.gift.images = [result.data.id]
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
      this.newGift()
      this.giftImg = ''
      this.products = []
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
