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
                  <div class="multi-image-grid">
                    <draggable
                      v-model="imageList"
                      class="multi-image-grid__draggable"
                      :options="{ animation: 150, ghostClass: 'image-tile--ghost' }">
                      <div
                        v-for="(img, index) in imageList"
                        :key="img.key"
                        class="image-tile"
                        :class="{ 'image-tile--pending': img.isPending }">
                        <img
                          :src="img.url"
                          class="image-tile__img"
                          :alt="img.isPending ? '待上傳圖片' : '產品圖片'"
                          @click="openLightbox(img.url)">
                        <span v-if="img.isPending" class="image-tile__badge">未上傳</span>
                        <div class="image-tile__drag-handle"><i class="fa fa-arrows"></i></div>
                        <el-button
                          size="mini"
                          type="danger"
                          class="image-tile__remove"
                          @click="removeImage(index)">✕</el-button>
                      </div>
                    </draggable>
                    <!-- add new image tile -->
                    <el-upload
                      ref="imageUpload"
                      action=""
                      drag
                      :multiple="true"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="onImageAdd"
                      accept="image/*"
                      class="image-tile image-tile--add">
                      <div class="image-tile__add-inner">
                        <i class="fa fa-plus fa-lg mb-1"></i>
                        <span>加圖片</span>
                      </div>
                    </el-upload>
                  </div>
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
    <!-- Lightbox overlay -->
    <transition name="lightbox-fade">
      <div v-if="lightboxUrl" class="lightbox-overlay" @click="closeLightbox">
        <img :src="lightboxUrl" class="lightbox-img" alt="圖片預覽" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">✕</button>
      </div>
    </transition>
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
      categories  : [],
      imageList   : [], // { key, id, url, isPending, file }
      lightboxUrl : null,
      product        : {
        ingredients   : {
          zh : '',
          en : ''
        },
        description   : {
          zh : '',
          en : ''
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
      }
    };
  },

  methods : {
    deleteAddons (index) {
      this.product.addons.splice(index, 1)
    },

    openLightbox (url) {
      this.lightboxUrl = url
    },

    closeLightbox () {
      this.lightboxUrl = null
    },

    onImageAdd (file) {
      this.imageList.push({
        key       : `pending-${ Date.now() }-${ Math.random() }`,
        id        : null,
        url       : URL.createObjectURL(file.raw),
        isPending : true,
        file      : file.raw
      })
    },

    removeImage (index) {
      this.imageList.splice(index, 1)
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
      this.imageList = []
      this.product = {
        ingredients   : {
          zh : '',
          en : ''
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
        this.imageList = detail.data.images
          .filter(item => item && item.id)
          .map(item => ({
            key       : `existing-${ item.id }`,
            id        : item.id,
            url       : (item.large && item.large.path) || (item.original && item.original.path) || '',
            isPending : false,
            file      : null
          }))
        this.product = detail.data
        this.product.images = this.imageList.map(i => i.id)
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

        await this.uploadImages()

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

    async uploadImages () {
      try {
        const orderedIds = []
        for (const img of this.imageList) {
          if (img.isPending) {
            // upload new file and get its ID
            const formData = new FormData()
            formData.append('file', img.file)
            const result = await this.$api.post('/v1/uploads/image', formData)
            if (result.data && result.data.id) {
              orderedIds.push(result.data.id)
            }
          } else {
            // existing image, keep in current position
            orderedIds.push(img.id)
          }
        }
        this.product.images = orderedIds
      } catch (e) {
        console.log(e)
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
      this.imageList = []
      if (this.$refs.imageUpload) this.$refs.imageUpload.clearFiles()
      this.newProduct()
    }
  }
}
</script>
<style lang="scss">
.no-edit {
  background-color: #eee !important;
}

.removeBundleItem {
  cursor: pointer;

  &:hover {
    color: #aaa;
  }
}

/* Lightbox overlay */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  cursor: default;
}

.lightbox-close {
  position: fixed;
  top: 20px;
  right: 28px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 24px;
  line-height: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-fade-enter,
.lightbox-fade-leave-to {
  opacity: 0;
}

/* image tile cursor */
.image-tile__img {
  cursor: zoom-in;
}

.image-tile {
  // ...existing code...

  &__drag-handle {
    position: absolute;
    bottom: 4px;
    right: 4px;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.35);
    border-radius: 3px;
    padding: 2px 5px;
    font-size: 12px;
    cursor: grab;
    line-height: 1.4;

    &:active {
      cursor: grabbing;
    }
  }

  &--ghost {
    opacity: 0.4;
    border: 2px dashed #409eff;
  }
}
.multi-image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

/* make draggable wrapper transparent so tiles flow directly in the flex grid */
.multi-image-grid__draggable {
  display: contents;
}

.image-tile {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
  background: #f5f5f5;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__remove {
    position: absolute !important;
    top: 4px;
    right: 4px;
    padding: 2px 6px !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
    opacity: 0.85;

    &:hover {
      opacity: 1;
    }
  }

  &__badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: #e6a23c;
    color: #fff;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
  }

  &--pending {
    border: 1px dashed #e6a23c;
  }

  &--add {
    border: 2px dashed #c0c4cc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    /* make the el-upload wrapper and dragger fill the tile */
    .el-upload,
    .el-upload-dragger {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 0;
    }

    .el-upload-dragger:hover {
      border: none;
    }

    .el-upload-dragger.is-dragover {
      border: none;
      background: rgba(64, 158, 255, 0.08);
    }
  }

  &__add-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 12px;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
