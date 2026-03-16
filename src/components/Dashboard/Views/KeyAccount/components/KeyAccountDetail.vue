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
              <div class="col-12 col-sm-12">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
                <div class="mb-2" v-if="keyAccount.id">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ keyAccount.id }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="mb-2 col-12">
                    <ValidationProvider name="name" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="客戶名稱(必填)"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="name"
                                v-model="keyAccount.name">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                </div>

                <div class="row">
                  <div class="mb-2 col-12">
                    <ValidationProvider name="description" rules="required" v-slot="{ passed, failed }">
                      <fg-input type="text"
                                label="Description(選填)"
                                :error="failed ? '錯名': null"
                                :hasSuccess="passed"
                                name="description"
                                v-model="keyAccount.description">
                      </fg-input>
                    </ValidationProvider>
                  </div>
                </div>

                <div class="row">
                  <label class="col=12 col-form-label">SKU單價</label>
                  <div class="col-lg-4 col-md-4 col-sm-6">
                    <div class="row align-items-center" v-for="category in categoriesWithProducts">
                      <div class="col-4">
                        {{ category.name.zh }}:
                      </div>
                      <div class="ml-1 position-relative" v-for="product in category.products">
                        <div>{{ product.name.zh }}</div>
                        <div class="form-group pa-10">
                          <ValidationProvider :name="product.name.zh" rules="required" v-slot="{ passed, failed }" :key="product.id">
                            <fg-input type="text"
                                      :name="product.name.zh"
                                      :error="failed ? '不能留空': null"
                                      :hasSuccess="passed"
                                      v-model="skuPrice[product.id]">
                            </fg-input>
                          </ValidationProvider>
                        </div>
                        <div class="removeItem" @click="orderProducts[index].quantity = 0">刪除</div>
                      </div>
                    </div>
                    <!--                <el-button type="info" @click="addItem">＋加入物品</el-button>-->
                  </div>
                </div>

                <div class="row mb-2">
                  <div class="col-md-12">
                    <label>所有分店/收貨地址</label>
                    <div class="d-flex align-items-center" v-for="(address,index) in keyAccount.addresses">
                      {{ areas[address.area] }},{{ address.district }},{{ address.subDistrict }} {{ address.fullAddress }} {{ address.phone }} ({{ address.recipient }}收)
                      <p-button style="margin-left: 10px;" size="sm" icon @click.stop="editAddress(address, index)">
                        <i class="fa fa-edit" aria-hidden="true"></i>
                      </p-button>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <p-button style="margin-left: 10px;" @click.stop="editAddress()">
                      <i class="fa fa-plus" aria-hidden="true"></i>新增地址
                    </p-button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="col-form-label">發佈</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="keyAccount.publish"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ keyAccount.publish ? '已發佈' : '未發佈' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12 pl-0">
                <h4>折扣
                  <el-switch v-model="keyAccount.discountTierEnabled"
                             active-color="#13ce66"
                             inactive-color="#ff4949">
                  </el-switch>
                  {{ keyAccount.discountTierEnabled ? '啟用' : '停用' }}
                </h4>
              </div>

              <draggable v-model="keyAccount.discount" class="row" :disabled="!keyAccount.discountTierEnabled" style="position: relative">
                <div v-show="!keyAccount.discountTierEnabled" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.5);z-index: 1"></div>
                <div class="col-6 mb-2" v-for="(discount,index) in keyAccount.discount">
                  <div class="delete text-right"><span @click="deleteDiscountTier(index)">刪除</span></div>
                  <div class="form-group pa-10">
                    <div class="form-control d-flex flex-wrap">
                      <div class="col-12">
                        <h5>Tier: {{ index + 1 }}</h5>
                      </div>
                      <ValidationProvider class="col-4" :name="'discountName' + index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="折扣名"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'discountName' + index"
                                  v-model="keyAccount.discount[index].name">
                        </fg-input>
                      </ValidationProvider>
                      <ValidationProvider class="col-4" :name="'discountQuantity' + index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="每(數量)"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'discountQuantity' + index"
                                  v-model="keyAccount.discount[index].quantity">
                        </fg-input>
                      </ValidationProvider>
                      <ValidationProvider class="col-4" :name="'discountValue'+ index" rules="required" v-slot="{ passed, failed }">
                        <fg-input type="text"
                                  label="減(價錢) *數值必須為負值"
                                  :error="failed ? '錯名': null"
                                  :hasSuccess="passed"
                                  :name="'discountValue' + index"
                                  v-model="keyAccount.discount[index].value">
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
                <div v-show="!keyAccount.discountTierEnabled" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.5);z-index: 1"></div>
                <div class="form-group pa-10 w-100 h-100 d-flex justify-content-center align-items-center">
                  <el-button @click="keyAccount.discount.push({quantity: 0, value: 0})">＋增加Tier</el-button>
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
    <EditAddressModal ref="EditAddressModal"></EditAddressModal>
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
import EditAddressModal
                                                                             from '@/components/Dashboard/Views/KeyAccount/components/EditAddressModal'
import _                                                                     from "lodash";
import products
                                                                             from "@/components/Dashboard/Views/Shop/Products";

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
    draggable,
    EditAddressModal
  },
  data () {
    return {
      areas                  : {
        hk  : '港島',
        kln : '九龍',
        nt  : '新界',
      },
      dialogVisible          : false,
      resolve                : null,
      reject                 : null,
      moment,
      categoriesWithProducts : [],
      skuPrice               : {},
      keyAccount             : {
        name                : '',
        description         : '',
        skuPrice            : {},
        addresses           : [],
        discount            : [],
        discountTierEnabled : false,
        remarks             : '',
        publish             : false,
      },
    };
  },

  methods : {
    async getCategoryWithProducts () {
      try {
        const categoriesWithProducts = await this.$api.get('/v1/categories?products=1&status=published')
        this.categoriesWithProducts = categoriesWithProducts.data.results
        for (let i in this.categoriesWithProducts) {
          const category = this.categoriesWithProducts[i]
          if (category.name.zh === '試食') continue

          for (let j in category.products) {
            const item = category.products[j]
            console.log(item.name.zh)
            if (typeof (this.skuPrice[item.id]) === 'undefined') {
              this.skuPrice[item.id] = item.price
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
    },

    async editAddress (address = {
      area        : "",
      district    : "",
      fullAddress : "",
      phone       : "",
      recipient   : "",
      subDistrict : "",
      shortName   : ""
    }, index) {

      const modifiedAddress = await this.$refs.EditAddressModal.open(address)
      index = index >= 0 ? index : this.keyAccount.addresses.length
      if (modifiedAddress) {
        const addresses = _.cloneDeep(this.keyAccount.addresses)
        addresses[index] = modifiedAddress
        this.keyAccount.addresses = addresses
      }
    },

    async open (keyAccountId) {
      this.dialogVisible = true
      await this.getCategoryWithProducts()
      if (keyAccountId) {
        await this.getKeyAccountDetail(keyAccountId)
      } else {
        this.newKeyAccount()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newKeyAccount () {
      this.keyAccount = {
        name                : '',
        description         : '',
        skuPrice            : {},
        addresses           : [],
        discount            : [],
        discountTierEnabled : false,
        remarks             : '',
        publish             : false
      }
    },

    deleteDiscountTier (index) {
      this.keyAccount.discount.splice(index, 1)
    },

    async getKeyAccountDetail (keyAccountId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/keyAccounts/' + keyAccountId)
        this.keyAccount = detail.data
        this.keyAccount.discount = this.keyAccount.discount.map(({ quantity, value, name }) => ({ quantity, value, name }))
        this.keyAccount.skuPrice.forEach(product => {
          this.skuPrice[product.item.id] = product.price
        })
        delete this.keyAccount.createdAt
        delete this.keyAccount.updatedAt
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

        const keyAccount = _.clone(this.keyAccount)

        keyAccount.addresses = keyAccount.addresses.map(item => {
          delete item._id
          return item
        })

        // product.keyAccount = this.ca
        delete keyAccount.id

        const result = this.keyAccount.id ? await this.$api.patch('/v1/keyAccounts/' + this.keyAccount.id, keyAccount) : await this.$api.post('/v1/keyAccounts/', keyAccount)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '客戶更新成功',
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

    close () {
      this.dialogVisible = false
      this.resolve(false)
      this.reset()
    },

    reset () {
      this.newKeyAccount()
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
