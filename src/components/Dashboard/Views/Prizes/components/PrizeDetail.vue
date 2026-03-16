<template>
  <el-dialog title="活動資料"
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
                    <img v-if="prizeImg" :src="prizeImg" class="picture-src">
                  </el-upload>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="prize.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ prize.id }}
                    </div>
                  </div>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                    <fg-input label="活動類別">
                      <el-select placeholder="輸入搜尋或建立"
                                 class="select-normal w-100"
                                 v-model="prize.festival"
                                 allow-create
                                 clearable
                                 filterable>
                        <el-option v-for="internalName in festivals"
                                   :key="internalName"
                                   :label="internalName"
                                   :value="internalName">
                        </el-option>
                      </el-select>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="中文名稱（前端按钮）"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="namezh"
                              v-model="prize.name.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="mb-2">
                  <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="Eng Name（前端按钮）"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="nameen"
                              v-model="prize.name.en">
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
                      <textarea v-model="prize.description.zh" class="form-control" rows="3"></textarea>
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
                      <textarea v-model="prize.description.en" class="form-control" rows="3"></textarea>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <label class="col-form-label">發佈</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="prize.published"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ prize.published ? '已發佈' : '未發佈' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12 pl-0">
                <h4>獎品池(8款)</h4>
              </div>
              <div class="row">
                <div class="col-12 col-lg-6 mb-2" v-for="(discount,index) in prize.items">
                  <div class="form-group pa-10">
                    <div class="form-control d-flex flex-wrap">
                      <div class="col-12">
                        <h5>獎品: {{ index + 1 }}</h5>
                      </div>
                      <div class="row px-3">
                        <ValidationProvider class="col-lg-2 col-6"
                                            :name="'type' + index"
                                            rules="required"
                                            v-slot="{ passed, failed }">
                          <fg-input label="獎品類別" :name="'type' + index" :error="failed ? '請選擇類別': null" :hasSuccess="passed">
                            <el-select class="select-normal"
                                       size="large"
                                       placeholder=""
                                       v-model="prize.items[index].type">
                              <el-option v-for="option in prizeTypes"
                                         :value="option.value"
                                         :label="option.label"
                                         :key="option.value">
                              </el-option>
                            </el-select>
                          </fg-input>
                        </ValidationProvider>
                        <ValidationProvider class="col-lg-4 col-6" :name="'product' + index" rules="required" v-slot="{ passed, failed }">
                          <fg-input label="選擇物品" v-if="prize.items[index].type === 'item'" :name="'product' + index" :error="failed ? '請選擇物品': null"
                                    :hasSuccess="passed">
                            <el-select placeholder=""
                                       class="select-normal w-100" v-model="prize.items[index].product" filterable>
                              <el-option v-for="item in products"
                                         :key="item.id"
                                         :label="item.name.zh"
                                         :value="item.id">
                              </el-option>
                            </el-select>
                          </fg-input>
                          <fg-input v-else-if="prize.items[index].type === 'cash'" label="選擇物品" value="現金紅包" disabled="" :prefix="12">
                          </fg-input>
                          <fg-input v-else label="選擇物品" value="請先選擇獎品類別" disabled="" :prefix="12">
                          </fg-input>
                        </ValidationProvider>
                        <ValidationProvider class="col-lg-2 col-6" :name="'amount' + index" rules="required|numeric" v-slot="{ passed, failed }">
                          <fg-input type="text"
                                    label="數量"
                                    :error="failed ? '數量必需為數字': null"
                                    :hasSuccess="passed"
                                    :name="'amount' + index"
                                    v-model="prize.items[index].amount">
                          </fg-input>
                        </ValidationProvider>
                      </div>
                      <div class="col-12 text-info" v-if="prize.items[index].type">
                        <template v-if="prize.items[index].type === 'cash'">
                          <b>{{ prize.items[index].amount }}蚊利是</b>
                        </template>
                        <template v-if="prize.items[index].type === 'item'">
                          <b>{{ getProductName(prize.items[index].product) }} x{{ prize.items[index].amount }}</b>
                        </template>
                      </div>
                    </div>
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
  data () {
    return {
      festivals     : null,
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      prizeTypes    : [{ value : 'cash', label : '現金', }, { value : 'item', label : '產品' }],
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
      prize         : {
        name        : { zh : '', en : '' },
        festival    : '',
        items       : [
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
        ],
        published   : false,
        description : { zh : '', en : '' }
      },
      prizeImg      : '',
      products      : []
    };
  },

  methods : {
    onImageChange (file) {
      this.prizeImg = URL.createObjectURL(file.raw);
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


    async open (prizeId) {
      this.dialogVisible = true

      await this.getProducts()
      await this.getFestivals()

      if (prizeId) {
        this.getPrizeDetail(prizeId)
      } else {
        this.newPrize()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newPrize () {
      this.prizeImg = "//placehold.co/600x600?text=128x128"
      this.prize = {
        name        : {
          zh : '',
          en : ''
        },
        festival    : '',
        items       : [
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
          { type : null, product : null, amount : 1 },
        ],
        published   : false,
        description : { zh : '', en : '' },
      }
    },

    async getFestivals () {
      return true
      const loading = new Loading.service({ fullscreen : false });
      try {
        const festivals = await this.$api.get('/v1/prizes/festivals')
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async getPrizeDetail (prizeId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/prizes/' + prizeId)
        this.prizeImg = detail.data.images[0] ? detail.data.images[0].large.path : '//placehold.co/600x600?text=128x128'
        this.prize = detail.data
        this.prize.images = detail.data.images.map(item => item.id)
        delete this.prize.createdAt
        delete this.prize.updatedAt
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

        const prize = _.clone(this.prize)

        // product.prize = this.ca
        delete prize.id
        const result = this.prize.id ? await this.$api.patch('/v1/prizes/' + this.prize.id, prize) : await this.$api.post('/v1/prizes/', prize)
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
            this.prize.images = [result.data.id]
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
      this.festivals = []
      this.newPrize()
      this.prizeImg = ''
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
