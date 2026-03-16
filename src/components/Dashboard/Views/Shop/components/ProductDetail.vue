<template>
  <el-dialog title="產品資料"
             class="fix-footer"
             :visible.sync="dialogVisible"
             fullscreen>
    <div class="row justify-content-center">
      <div class="col-sm-8 col-12 justify-content-center" v-if="dialogVisible">
        <ValidationObserver v-slot="{ handleSubmit }" ref="form">
          <form @submit.prevent="handleSubmit(submit)">

            <div class="row">
              <div class="col-12 col-sm-6">
                <h5>圖片</h5>
                <div class="col-sm-12">
                  <el-upload class="picture w-100 h-100"
                             drag
                             ref="image"
                             action=""
                             :on-change="onImageChange"
                             :auto-upload="false"
                             :show-file-list="false">
                    <img v-if="productImg" :src="productImg" class="picture-src">
                  </el-upload>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="product.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ product.id }}
                    </div>
                  </div>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="category" rules="required" v-slot="{ passed, failed }">
                    <fg-input label="類別"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed">
                      <el-select size="small"
                                 placeholder=""
                                 class="select-normal"
                                 v-model="product.category">
                        <el-option v-for="option in categories"
                                   :value="option.id"
                                   :label="option.name.zh"
                                   :key="option.id">
                        </el-option>
                      </el-select>
                    </fg-input>
                  </ValidationProvider>
                </div>

                <div class="mb-2">
                  <ValidationProvider name="zhname" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="產品名稱(中)"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="zhname"
                              v-model="product.name.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="mb-2">
                  <ValidationProvider name="enname" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="產品名稱(Eng)"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="enname"
                              v-model="product.name.en">
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="mb-2">
                  <ValidationProvider name="internalName" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="產品內部名（縮寫2個字）"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="internalName"
                              v-model="product.internalName">
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="row">
                  <div class="mb-2 col-6">
                    <ValidationProvider name="price" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="價錢"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="price"
                                v-model="product.price">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                  <div class="mb-2 col-6">
                    <ValidationProvider name="discountPrice" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="折扣價錢"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="discountPrice"
                                v-model="product.discountPrice">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                </div>
                <div class="row">
                  <div class="mb-2 col-6">
                    <ValidationProvider name="price" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="製造地(中文)"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="madeInZh"
                                v-model="product.madeIn.zh">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                  <div class="mb-2 col-6">
                    <ValidationProvider name="discountPrice" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="製造地(Eng)"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="madeInEn"
                                v-model="product.madeIn.en">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                </div>
                <div class="col-12 px-0">
                  <ValidationProvider name="servingText.zh" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="產品說明（中）"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="description.zh"
                              v-model="product.description.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="col-12 px-0">
                  <ValidationProvider name="servingText.en" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="產品說明（Eng）"
                              :error="failed ? '錯名': null"
                              :hasSuccess="passed"
                              name="description.en"
                              v-model="product.description.en">
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="row">
                  <div class="mb-2 col-6">
                    <label class="col-form-label">發佈</label>
                    <div class="form-group pa-10">
                      <el-switch v-model="product.publish"
                                 active-color="#13ce66"
                                 inactive-color="#ff4949">
                      </el-switch>
                      {{ product.publish ? '已發佈' : '未發佈' }}
                    </div>
                  </div>

                  <div class="mb-2 col-6">
                    <label class="col-form-label">售罄</label>
                    <div class="form-group pa-10">
                      <el-switch v-model="product.soldOut"
                                 active-color="#ff4949"
                                 inactive-color="#13ce66">
                      </el-switch>
                      {{ product.soldOut ? '已售罄' : '可購買' }}
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="mb-2 col-6">
                    <label class="col-form-label">組合套裝 (適用於試食裝／套裝組合，需要從產品列表選取并加入)</label>
                    <div class="form-group pa-10">
                      <el-switch v-model="product.isBundled"
                                 active-color="#13ce66"
                                 inactive-color="#ff4949">
                      </el-switch>
                      {{ product.isBundled ? '組合套裝' : '非組合' }}
                    </div>
                  </div>
                  <div class="mb-2 col-6">
                    <label class="col-form-label">精選貨品</label>
                    <div class="form-group pa-10">
                      <el-switch v-model="product.featured"
                                 active-color="#13ce66"
                                 inactive-color="#ff4949">
                      </el-switch>
                      {{ product.featured ? '精選' : '普通' }}
                    </div>
                  </div>
                  <div class="mb-2 col-12" v-if="product.isBundled">
                    <el-button type="info" @click="addItem">＋加入物品</el-button>
                    <div class="row align-items-center" v-for="(item,index) in product.bundleItems" :key="index">
                      <div class="col-12">
                        <hr>
                      </div>
                      <div class="col-12 d-flex align-items-center">
                        <div class="col-7">
                          {{ item.product.name.zh }}:
                        </div>
                        <div class="col-5 position-relative d-flex align-items-center">
                          <div class="form-group mb-0 col-8">
                            <ValidationProvider :name="item.product.name.zh" rules="required" v-slot="{ passed, failed }" :key="index">
                              <fg-input type="text"
                                        :name="item.product.name.zh"
                                        :error="failed ? '不能留空': null"
                                        :hasSuccess="passed"
                                        v-model="product.bundleItems[index].quantity">
                              </fg-input>
                            </ValidationProvider>
                          </div>
                          <div class="col-4 removeBundleItem mb-2 px-0" @click="removeItem(index)">刪除</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <hr>
              <div class="col-12 pl-0"><h4>產品附加收款項目</h4></div>
              <draggable v-model="product.addons" class="row" style="position: relative">
                <div class="col-12 col-md-6 col-lg-4 mb-2" v-for="(addon,index) in product.addons">
                  <div class="form-group pa-10">
                    <div class="form-control d-flex flex-wrap">
                      <div class="col-12">
                        <h5>項: {{ index + 1 }}</h5>
                      </div>
                      <div class="col-9">
                        <ValidationProvider :name="'addonsZh' + index" rules="required" v-slot="{ passed, failed }">
                          <fg-input type="text"
                                    label="選項(中文)"
                                    :error="failed ? '錯名': null"
                                    :hasSuccess="passed"
                                    :name="'addonsZh' + index"
                                    v-model="product.addons[index].name.zh">
                          </fg-input>
                        </ValidationProvider>
                      </div>
                      <ValidationProvider class="col-3" :name="'addonsPrice'+ index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="價錢"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'addonsPrice' + index"
                                  v-model="product.addons[index].price">
                        </fg-input>
                      </ValidationProvider>
                      <div class="col-9">
                        <ValidationProvider :name="'addonsEn'+ index" rules="required" v-slot="{ passed, failed }">
                          <fg-input type="text"
                                    label="選項(英文)"
                                    :error="failed ? '錯名': null"
                                    :hasSuccess="passed"
                                    :name="'addonsEn' + index"
                                    v-model="product.addons[index].name.en">
                          </fg-input>
                        </ValidationProvider>
                      </div>

                      <div class="col-3" style="align-self: center; text-align: right;">
                        <p-button @click="deleteAddons(index)">刪除</p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </draggable>
              <div class="col-12 mb-2">
                <div class="form-group pa-10 w-100 h-100 d-flex justify-content-center align-items-center">
                  <el-button @click="product.addons.push({name: {zh:'', en: ''}, price: 0})">＋增加選項</el-button>
                </div>
              </div>
            </div>
            <!--            <div class="row">
                          <div class="col-12">
                            <hr>
                            <h5>食用方式</h5>
                          </div>
                          <div class="col-12">
                            <div>中文</div>
                            <fg-input type="text"
                                      name="edibleMethods"
                                      v-model="product.edibleMethods">
                            </fg-input>
                          </div>
                          <div class="col-12">
                            <div>Eng</div>
                            <fg-input type="text"
                                      name="edibleMethods"
                                      v-model="product.edibleMethodsEn">
                            </fg-input>
                          </div>
                        </div>-->
            <!--            <div class="row">
                          <div class="col-12">
                            <hr>
                            <h5>食用份量文字</h5>
                          </div>
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="servingText.zh" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="食用份量文字（中）"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="servingText.zh"
                                        v-model="product.nutritionInfo.servingText.zh">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="servingText.en" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="食用份量文字（Eng）"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="servingText.en"
                                        v-model="product.nutritionInfo.servingText.en">
                              </fg-input>
                            </ValidationProvider>
                          </div>
                        </div>-->

            <!--            <div class="row">
                          <div class="col-12">
                            <hr>
                            <h5>營養標簽</h5>
                          </div>
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="calories" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="卡路里"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="calories"
                                        v-model="product.nutritionInfo.calories">
                              </fg-input>
                            </ValidationProvider>
                          </div>
                          <div class="col-6 col-sm-4">
                            &lt;!&ndash; protein &ndash;&gt;
                            <ValidationProvider name="protein" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="蛋白質"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="protein"
                                        v-model="product.nutritionInfo.protein">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          &lt;!&ndash; sodium &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="sodium" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="鈉"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="sodium"
                                        v-model="product.nutritionInfo.sodium">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          <hr class="col-12">

                          &lt;!&ndash; carbohydrate &ndash;&gt;
                          &lt;!&ndash; total &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="totalCarbohydrate" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="總碳水"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="totalCarbohydrate"
                                        v-model="product.nutritionInfo.carbohydrate.total">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          &lt;!&ndash; fibre &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="fibre" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="纖維"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="fibre"
                                        v-model="product.nutritionInfo.carbohydrate.fibre">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          &lt;!&ndash; sugars &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="sugars" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="糖"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="sugars"
                                        v-model="product.nutritionInfo.carbohydrate.sugars">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          <hr class="col-12">

                          &lt;!&ndash; fat &ndash;&gt;
                          &lt;!&ndash; total &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="totalFat" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="總脂肪"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="totalFat"
                                        v-model="product.nutritionInfo.fat.total">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          &lt;!&ndash; saturatedFat &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="saturatedFat" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="飽和脂肪"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="saturatedFat"
                                        v-model="product.nutritionInfo.fat.saturatedFat">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          &lt;!&ndash; transFat &ndash;&gt;
                          <div class="col-6 col-sm-4">
                            <ValidationProvider name="transFat" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="反式脂肪"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="transFat"
                                        v-model="product.nutritionInfo.fat.transFat">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          <hr class="col-12">

                          &lt;!&ndash; ingredients zh &ndash;&gt;
                          <div class="col-6 col-sm-6">
                            <ValidationProvider name="ingredientszh" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="成份（中）"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="ingredientszh"
                                        v-model="product.ingredients.zh">
                              </fg-input>
                            </ValidationProvider>
                          </div>

                          &lt;!&ndash; ingredients en &ndash;&gt;
                          <div class="col-6 col-sm-6">
                            <ValidationProvider name="ingredientsen" rules="required" v-slot="{ passed, failed }">
                              <fg-input type="text"
                                        label="成份（英）"
                                        :error="failed ? '錯名': null"
                                        :hasSuccess="passed"
                                        name="ingredientsen"
                                        v-model="product.ingredients.en">
                              </fg-input>
                            </ValidationProvider>
                          </div>


                        </div>-->
          </form>
        </ValidationObserver>
      </div>
    </div>
    <addItemModal ref="addItemModal"></addItemModal>
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
import addItemModal                                                          from './AddItemModal'
import Vue                                                                   from "vue";
import UserProfile
                                                                             from "@/components/Dashboard/Views/Pages/UserProfile";
import _                                                                     from "lodash";
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
    addItemModal,
    draggable
  },
  data () {
    return {
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      moment,
      categories    : [],
      product       : {
        ingredients   : {
          zh : '',
          en : ''
        },
        description   : {
          zh : '',
          en : ''
        },
        nutritionInfo : {
          servingText  : {
            zh : '每食用份量100g',
            en : 'Per serving size 100g'
          },
          calories     : null,
          protein      : null,
          fat          : {
            saturatedFat : null,
            transFat     : null,
            total        : null
          },
          carbohydrate : {
            fibre  : null,
            sugars : null,
            total  : null
          },
          sodium       : null
        },
        edibleMethods : '',
        soldOut       : false,
        publish       : false,
        name          : {
          zh : '',
          en : ''
        },
        madeIn        : {
          zh : '香港',
          en : 'Hong Kong'
        },
        isBundled     : false,
        bundleItems   : []
      },
      productImg    : ''
    };
  },

  methods : {
    deleteAddons (index) {
      this.product.addons.splice(index, 1)
    },
    onImageChange (file) {
      this.productImg = URL.createObjectURL(file.raw);
    },

    async getCategories () {
      try {
        const categories = await this.$api.get('/v1/categories')
        this.categories = categories.data.results.map(item => ({ id : item.id, name : item.name }))
      } catch (e) {
        console.log(e)
      } finally {

      }
    },

    async open (productId) {
      this.dialogVisible = true
      await this.getCategories()
      if (productId) {
        await this.getProductDetail(productId)
      } else {
        this.newProduct()
      }


      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newProduct () {
      this.productImg = "//placehold.co/700x800"
      this.product = {
        ingredients   : {
          zh : '',
          en : ''
        },
        nutritionInfo : {
          servingText  : {
            zh : '每食用份量100g',
            en : 'Per serving size 100g'
          },
          calories     : null,
          protein      : null,
          fat          : {
            saturatedFat : null,
            transFat     : null,
            total        : null
          },
          carbohydrate : {
            fibre  : null,
            sugars : null,
            total  : null
          },
          sodium       : null
        },
        edibleMethods : '',
        soldOut       : false,
        publish       : false,
        name          : {
          zh : '',
          en : ''
        },
        description   : {
          zh : '',
          en : ''
        },
        madeIn        : {
          zh : '香港',
          en : 'Hong Kong'
        },
        isBundled     : false,
        bundleItems   : []
      }
    },

    async addItem () {
      const item = await this.$refs.addItemModal.open()
      if (item) {
        this.product.bundleItems.push(item)
      }
    },

    removeItem (index) {
      this.product.bundleItems.splice(index, 1)
    },

    async getProductDetail (productId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/products/' + productId)
        this.productImg = detail.data.images[0] ? detail.data.images[0].large.path : '//placehold.co/700x800'
        this.product = detail.data
        if (this.product.images.length) {
          this.product.images = detail.data.images.filter(item => item && item.id).map(item => item.id)
        }
        if (!this.product.nutritionInfo.servingText) {
          this.product.nutritionInfo.servingText = {
            zh : '每食用份量100g', en : 'Per serving size 100g'
          }
        }
        delete this.product.reviews
        delete this.product.lastEditBy
        delete this.product.createdAt
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

        const product = _.clone(this.product)

        product.bundleItems = product.bundleItems.filter(item => item.quantity)
                                     .map(item => ({
                                       product : item.product.id, quantity : item.quantity,
                                     })).filter(item => parseInt(item.quantity) > 0)

        // product.category = this.ca
        delete product.id
        //delete addon id
        if (product.addons && product.addons.length) {
          for (let i in product.addons) {
            delete product.addons[i]._id
          }
        }
        const result = this.product.id ? await this.$api.patch('/v1/products/' + this.product.id, product) : await this.$api.post('/v1/products/', product)
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
            this.product.images = [result.data.id]
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
      this.newProduct()
      this.productImg = ''
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

.removeBundleItem {
  cursor: pointer;

  &:hover {
    color: #aaa;
  }
}

.image-container {
  cursor: pointer;
}
</style>
