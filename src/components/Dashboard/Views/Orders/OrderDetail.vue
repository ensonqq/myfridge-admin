<template>
  <el-dialog :title="order && order.id? '訂單資料' : '建立新訂單'"
             class="fix-footer"
             :visible.sync="dialogVisible"
             @close="close"
             fullscreen>
    <div class="row justify-content-center">
      <div class="col-sm-8 col-12 justify-content-center">
        <ValidationObserver v-slot="{ handleSubmit }" ref="form">
          <form @submit.prevent="handleSubmit(submit)">
            <div class="row" v-if="order.flag">
              <label class="col-sm-3 col-form-label">警告訂單⚠️</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit text-danger">
                    訂單有問題⚠️
                  </div>
                </div>
              </div>
            </div>
            <div class="row" v-if="order.orderNumber">
              <label class="col-sm-3 col-form-label">訂單號碼</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    {{ order.orderNumber }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row" v-if="order.id">
              <label class="col-sm-3 col-form-label">ID</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    {{ order.id }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">訂單狀態</label>
              <div class="col-sm-7">
                <ValidationProvider name="area" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="area">
                    <el-select class="select-normal"
                               size="large"
                               @change="changeOrderStatus"
                               v-model="order.orderStatus">
                      <el-option v-for="option in orderStatuses"
                                 :value="option.value"
                                 :label="option.label"
                                 :key="option.value">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row" v-if="order.createdBy">
              <label class="col-sm-3 col-form-label">落單用戶</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    <a href="#" @click.stop="openUserProfile(order.createdBy.id)">
                      {{ order.createdBy.email }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="row" v-else>
              <label class="col-sm-3 col-form-label">落單用戶</label>
              <div class="col-sm-7">
                <ValidationProvider name="user">
                  <fg-input v-model="createdBy">
                    <el-select clearable class="select-normal" v-model="createdBy" filterable remote reserve-keyword placeholder="请输入关键词" :remote-method="searchUser" loading-text="...搜尋中"
                               no-data-text="沒有資料" :loading="userSearchLoading">
                      <el-option v-for="item in createdByUsers" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row" v-if="order.createdAt">
              <label class="col-sm-3 col-form-label">建立時間</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">{{ moment(order.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
                </div>
              </div>
            </div>

            <div class="row" v-if="order.delivery">
              <label class="col-sm-3 col-form-label">運送商戶</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">Courier: {{ order.delivery.courier }}<br> Bill Number: {{ order.delivery.billNo }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row" v-if="order.vipTierDiscount">
              <label class="col-sm-3 col-form-label">會員Tier優惠</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    <template v-if="order.vipTierDiscount.length">
                      <div>-${{ order.vipTierDiscountTotal * -1 }}</div>
                      <div v-for="item in order.vipTierDiscount">
                        {{ item.desc }}
                      </div>
                    </template>
                    <template v-else>--</template>
                  </div>
                </div>
              </div>
            </div>

            <div class="row" v-if="order.autoDiscountTiersAdopted">
              <label class="col-sm-3 col-form-label">多買自動優惠</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    <template v-if="order.autoDiscountTiersAdopted.length">
                      <div>-${{ order.autoDiscountTotal * -1 }}</div>
                      <div v-for="item in order.autoDiscountTiersAdopted">
                        {{ item.desc }}
                      </div>
                    </template>
                    <template v-else>--</template>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">積分使用</label>
              <div class="col-sm-7">

                <!-- if existing order -->
                <div class="form-group pa-10" v-if="order.id">
                  <div class="form-control no-edit">
                    -${{ order.creditsUsed }}
                  </div>
                </div>

                <ValidationProvider v-else name="paidTotal" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '錯誤': null"
                            :hasSuccess="passed"
                            name="paidTotal"
                            v-model="order.paidTotal">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row" v-if="order.voucherUsed">
              <label class="col-sm-3 col-form-label">優惠碼使用</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    <template v-if="order.voucherUsed.code">
                      <div>-${{ order.voucherDiscountTotal * -1 }}</div>
                      code: {{ order.voucherUsed.code }}, {{ order.voucherUsed.name.zh }}
                    </template>
                    <template v-else>--</template>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">利是</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    <template v-if="order.prize">
                      <div v-if="order.prize.type === 'cash'">-${{ order.amount }}利是</div>
                      <div v-else>{{ order.prize.product.name.zh }} x{{ order.prize.amount }}件</div>
                    </template>
                    <template v-else>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">總數</label>
              <div class="col-sm-7">
                <!-- if existing order -->
                <div class="form-group pa-10" v-if="order.id">
                  <div class="form-control no-edit">
                    ${{ order.total }}
                  </div>
                </div>
                <!-- if new order -->
                <ValidationProvider v-else name="total" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '錯誤': null"
                            :hasSuccess="passed"
                            name="total"
                            v-model="order.total">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">應付總數</label>
              <div class="col-sm-7">

                <!-- if existing order -->
                <div class="form-group pa-10" v-if="order.id">
                  <div class="form-control no-edit">
                    ${{ order.paidTotal }}
                  </div>
                </div>

                <ValidationProvider v-else name="paidTotal" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '錯誤': null"
                            :hasSuccess="passed"
                            name="paidTotal"
                            v-model="order.paidTotal">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row" v-if="order.payment">
              <label class="col-sm-3 col-form-label">付款詳情 ({{ orderStatusMapper[order.orderStatus] }})
                <div class="text-info" @click="getOrderStatus()">
                  <i style="font-size: 15px" class="fa fa-refresh"></i> 按此刷新訊息
                </div>
              </label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">
                    type: {{ order.payment.paymentType }}<br>
                    status: {{ order.payment.paymentStatus }}<br>
                    ref:
                    <a target="_blank" rel="noopener" :href="getRefLink(order.payment)">{{ order.payment.paymentRef }}</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">周末送貨</label>
              <div class="col-sm-7">
                <ValidationProvider name="area" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="area">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="order.isWeekEndDelivery">
                      <el-option v-for="option in [{label: '是', value: true}, {label: '否', value: false}]"
                                 :value="option.value"
                                 :label="option.label"
                                 :key="option.value">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">電郵</label>
              <div class="col-sm-7">
                <ValidationProvider name="email" rules="required|email" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '錯Email': null"
                            :hasSuccess="passed"
                            name="email"
                            v-model="order.email">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">電話</label>
              <div class="col-sm-7">
                <ValidationProvider name="phone" rules="required|numeric" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '錯電話': null"
                            :hasSuccess="passed"
                            name="phone"
                            v-model="order.phone">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>


            <div class="row">
              <label class="col-sm-3 col-form-label">收貨人</label>
              <div class="col-sm-7">
                <ValidationProvider name="recipient" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="recipient"
                            v-model="order.recipient">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">送貨日</label>
              <div class="col-sm-7">
                <ValidationProvider name="deliveryDay" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="deliveryDay">
                    <!--                    <el-date-picker v-model="order.deliveryDay"
                                                        type="date"
                                                        value-format="yyyy-MM-dd"
                                                        :picker-options="{ disabledDate: val => holidays.indexOf(moment(val).format('YYYY-MM-DD')) !== -1 }"></el-date-picker>-->
                    <el-date-picker v-model="order.deliveryDay"
                                    type="date"
                                    value-format="yyyy-MM-dd"></el-date-picker>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">送貨時段</label>
              <div class="col-sm-7">
                <ValidationProvider name="area" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="area">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="order.deliveryTimeSlot">
                      <el-option v-for="option in getTimeSlot"
                                 :value="option"
                                 :label="option"
                                 :key="option">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">自取/送貨上門</label>
              <div class="col-sm-7">
                <ValidationProvider name="area" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="area">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="order.deliveryType">
                      <el-option v-for="option in deliveryTypes"
                                 :value="option.value"
                                 :label="option.text"
                                 :key="option.value">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">港九新界</label>
              <div class="col-sm-7">
                <ValidationProvider name="area" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="area">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="order.area">
                      <el-option v-for="option in areas"
                                 :value="option.value"
                                 :label="option.text"
                                 :key="option.value">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">18區</label>
              <div class="col-sm-7">
                <ValidationProvider name="district" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="district">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="order.district">
                      <el-option v-for="option in getDistricts"
                                 :value="option"
                                 :label="option"
                                 :key="option">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">地區</label>
              <div class="col-sm-7">
                <ValidationProvider name="subDistrict" rules="required" v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="subDistrict">
                    <el-select class="select-normal"
                               size="large"
                               placeholder=""
                               v-model="order.subDistrict">
                      <el-option v-for="option in getSubDistricts"
                                 :value="option"
                                 :label="option"
                                 :key="option">
                      </el-option>
                    </el-select>
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">詳細地址
                <div class="text-info" @click="selectAndChangeToPickupAddress()">
                  <i style="font-size: 15px" class="fa fa-edit"></i> 按此選擇，並更換為自取點
                </div>
              </label>
              <div class="col-sm-7">
                <ValidationProvider name="fullAddress" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '不能留空': null"
                            :hasSuccess="passed"
                            name="fullAddress"
                            v-model="order.fullAddress">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">備注（選填）</label>
              <div class="col-sm-7">
                <el-input type="textarea"
                          v-model="order.remarks">
                </el-input>
              </div>
            </div>


            <div class="row">
              <hr class="col-12">
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">訂單物品</label>
              <div class="col-sm-7 mt-3">
                <!--                <div class="row align-items-center" :class="{hasQuantity: parseInt(order.items[index].quantity)}" v-for="(item,index) in order.items">-->
                <div class="row align-items-center" v-for="(item,index) in order.items">
                  <div class="col-md-4 col-lg-4 col-sm-12 ml-0 pl-0">
                    <b>{{ item.product.name.zh }}:</b>
                  </div>
                  <div class="ml-1 position-relative">
                    <div class="form-group pa-10" style="display: flex;">
                      <ValidationProvider name="required" rules="required" v-slot="{ passed, failed }" v-if="item.product.addons.length">
                        <fg-input label="選擇附加">
                          <el-select :error="failed ? '不能留空': null"
                                     :disabled="!item.product.addons.length"
                                     placeholder=""
                                     value-key="name.zh"
                                     :hasSuccess="passed"
                                     class="select-normal w-100" v-model="order.items[index].addons" filterable>
                            <el-option v-for="item in item.product.addons"
                                       :key="item.name.zh"
                                       :label="item.name.zh"
                                       :value="item">
                            </el-option>
                          </el-select>
                        </fg-input>
                      </ValidationProvider>
                      <fg-input v-else label="沒有附加項目。" style="min-width: 247px" disabled></fg-input>
                      <ValidationProvider style="width: 60px; margin-left: 5px" :name="index.toString()" rules="required" v-slot="{ passed, failed }" :key="index.toString()">
                        <fg-input type="text"
                                  label="數量"
                                  :name="index.toString()"
                                  :error="failed ? '不能留空': null"
                                  :hasSuccess="passed"
                                  v-model="order.items[index].quantity">
                        </fg-input>
                      </ValidationProvider>
                    </div>
                    <div class="removeItem" @click="order.items[index].quantity = 0">刪除</div>
                  </div>
                  <hr class="col-12">
                </div>
                <el-button type="info" @click="addItem">＋加入物品</el-button>
              </div>
            </div>
          </form>
        </ValidationObserver>
      </div>
    </div>
    <!-- Classic Modal -->
    <addItemModal ref="addItemModal"></addItemModal>
    <EditPickupAddressModal ref="EditPickupAddressModal"></EditPickupAddressModal>
    <div slot="footer" class="dialog-footer d-flex justify-content-between align-items-center">
      <div>
        <el-switch v-model="order.printed"
                   active-color="#13ce66"
                   inactive-color="#ff4949"></el-switch>
        {{ order.printed ? '已列印' : '未列印' }}
      </div>
      <div>
        <el-button @click="close">關閉</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </div>
    </div>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </el-dialog>
</template>
<script>
import {Card, Modal}                                                        from 'src/components/UIComponents'
import {extend}                                                             from "vee-validate";
import {required, numeric, regex, confirmed}                                from "vee-validate/dist/rules";
import {Input, Loading, Option, Select, Button, DatePicker, Dialog, Switch} from 'element-ui';
import moment                                                               from 'moment'
import {mapState}                                                           from "vuex";
import addItemModal                                                         from './components/AddItemModal'
import _                                                                    from "lodash";
import ConfirmDialog
                                                                            from "@/components/Dashboard/Views/Components/ConfirmDialog";
import EditPickupAddressModal
                                                                            from "@/components/Dashboard/Views/Orders/components/EditPickupAddressModal";

extend("required", required);
extend("numeric", numeric);
extend("regex", regex);
extend("confirmed", confirmed);

export default {
  components : {
    Card,
    addItemModal,
    ConfirmDialog,
    EditPickupAddressModal,
    [Option.name]     : Option,
    [Select.name]     : Select,
    [Button.name]     : Button,
    [DatePicker.name] : DatePicker,
    [Dialog.name]     : Dialog,
    [Input.name]      : Input,
    [Switch.name]     : Switch,
  },
  computed   : {
    ...mapState(['locations', 'holidays', 'skuSorting']),
    getTimeSlot () {

      return ['E: 09:00-18:00']

      const subDistrict = this.order.subDistrict
      if (subDistrict) {
        if (this.locations.bOnly.includes(subDistrict)) {
          return ['B: 13:00-17:00']
        } else {
          return ['A: 09:00-13:00', 'B: 13:00-17:00', 'C: 17:00-19:00', 'D: 09:00-19:00', 'E: 09:00-18:00']
        }
      }
      return []
    },
    getDistricts () {
      const area = this.order.area
      if (this.locations && area) {
        return Object.keys(this.locations.locations[area])
      }
      return []
    },
    getSubDistricts () {
      const area = this.order.area
      const district = this.order.district
      if (this.locations && area && district) {
        return this.locations.locations[area][district]
      }
      return []
    }
  },
  data () {
    return {
      createdBy         : null,
      createdByUsers    : [],
      userSearchLoading : false,
      prevOrderStatus   : '',
      orderProducts     : {},
      orderStatuses     : [{ label : '未付款', value : 'pending_payment' }, { label : '已付款', value : 'confirmed' },
        { label : '已取消', value : 'cancelled' },],
      orderStatusMapper : {
        pending_payment : '未付款',
        confirmed       : '已付款',
        cancelled       : '已取消'
      },
      dialogVisible     : false,
      resolve           : null,
      reject            : null,
      moment,
      order             : {},
      areas             : [{ text : '港島', value : 'hk' }, { text : '九龍', value : 'kln' },
        { text : '新界', value : 'nt' }],
      deliveryTypes     : [{ text : '送貨上門', value : 'delivery' }, { text : '自取', value : 'pickup' }],
    };
  },
  watch   : {
    'order.orderStatus' : function (newval, oldval) {
      this.prevOrderStatus = oldval ? oldval : newval
    },
  },
  methods : {
    searchUser (search) {
      this.userSearchLoading = true
      this.debounceData(search)
    },

    async selectAndChangeToPickupAddress () {
      const selected = await this.$refs.EditPickupAddressModal.open({
        area : this.order.area, district : this.order.district, subDistrict : this.order.subDistrict
      })
      // deliveryType       : { type : String, default : 'delivery' },
      // pickupLocationCode : { type : String, default : null },
      if (selected) {
        this.order.area = selected.area
        this.order.district = selected.district
        this.order.fullAddress = selected.fullAddress
        this.order.subDistrict = selected.subDistrict
        this.order.pickupLocationCode = selected.code
        this.order.deliveryType = 'pickup'
      }
    },

    async getOrderStatus () {
      const loading = new Loading.service({ fullscreen : true })
      try {
        const orderStatus = await this.$api.get('/v1/orders/status/' + this.order.orderNumber, { params : { accessCode : this.order.accessCode } })
        this.order = orderStatus.data
        loading.close()
      } catch (e) {
        console.log(e)
        loading.close()
      }
    },

    debounceData : _.debounce(async function (search) {
      const t = this
      try {
        if (search !== '') {
          const result = await this.$api.get('/v1/users', {
            params : {
              search : search,
              sortBy : 'createdAt:des'
            }
          })
          this.createdByUsers = result.data.results.map(item => ({
            label : `${ item.name }, ${ item.email }`, value : item.id
          }))
        } else {
          this.createdByUsers = []
        }
      } catch (e) {
        console.log(e)
      } finally {
        t.userSearchLoading = false
      }
    }, 1000),

    async changeOrderStatus (newval) {
      if (!this.order.id) return

      const oldval = this.prevOrderStatus
      if (this.order.id && newval !== oldval) {
        const orderStatusLabel = this.orderStatuses.filter(item => item.value === newval)[0].label
        const confirmation = await this.$refs.ConfirmDialog.open('更新訂單狀態', `你確定要將訂單${ this.order.orderNumber }的狀態設定為${ orderStatusLabel }？`)
        if (!confirmation.isConfirmed) this.order.orderStatus = oldval
      }
    },

    getRefLink (payment) {
      const hostname = window.location.hostname

      const fromDate = moment(this.order.createdAt).add(-1, 'days').format('YYYY-MM-DD')
      const toDate = moment(this.order.createdAt).add(1, 'days').format('YYYY-MM-DD')
      const urls = {
        paypal : {
          sandbox : 'https://sandbox.paypal.com/activities/?fromDate=' + fromDate + '&toDate=' + toDate + '&searchType=INVOICE_ID&searchKeyword=' + this.order.orderNumber + '&transactiontype=ALL_TRANSACTIONS&archive=INCLUDE_ARCHIVED_TRANSACTIONS&amount_lower=0&amount_upper=0&currency_value=ALL_TRANSACTIONS_CURRENCY&currency_label=ALL_TRANSACTIONS_CURRENCY&none=',
          live    : 'https://paypal.com/activities/?fromDate=' + fromDate + '&toDate=' + toDate + '&searchType=INVOICE_ID&searchKeyword=' + this.order.orderNumber + '&transactiontype=ALL_TRANSACTIONS&archive=INCLUDE_ARCHIVED_TRANSACTIONS&amount_lower=0&amount_upper=0&currency_value=ALL_TRANSACTIONS_CURRENCY&currency_label=ALL_TRANSACTIONS_CURRENCY&none=',
        },
        stripe : {
          sandbox : 'https://dashboard.stripe.com/test/payments/',
          live    : 'https://dashboard.stripe.com/payments/',
        },

        octopus   : {
          sandbox : '',
          live    : '',
        },
        payme     : {
          sandbox : '',
          live    : '',
        },
        alipay    : {
          sandbox : '',
          live    : '',
        },
        wechatpay : {
          sandbox : '',
          live    : '',
        },
        fps       : {
          sandbox : '',
          live    : '',
        },

        admin : {
          sandbox : '',
          live    : '',
        },
      }

      const key = hostname.includes('localhost') || hostname.includes('192.168') ? 'sandbox'
        : hostname.includes('dev.myfridge.com') ? 'sandbox' : 'live'

      return urls[payment.paymentType][key] + payment.paymentRef

    },
    async openUserProfile (userId) {
      this.$emit('openUserProfile', userId)
    },
    async open (orderNumber) {
      this.dialogVisible = true
      this.newOrder()
      if (orderNumber) {
        await this.getOrderDetail(orderNumber)
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    newOrder () {
      this.createdBy = null
      this.createdByUsers = []
      this.order = {
        orderStatus : 'confirmed',
        createdBy   : null,
        items       : [],
        remarks     : '',
        payment     : {
          paymentType : 'admin'
        }
      }
    },

    async addItem () {
      const item = await this.$refs.addItemModal.open()
      if (item) {
        this.order.items.push(item)
      }
    },

    removeItem (index) {
      this.order.items.splice(index, 1)
    },

    async getOrderDetail (orderNumber) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/orders/' + orderNumber)
        this.order = detail.data
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async submit () {
      if (!await this.$refs.form.validate()) return

      const loading = new Loading.service({
        fullscreen : true,
        lock       : true,
        text       : '如訂單更改：港九新界/18區/地區/詳細地址/收貨人/電話， 需要於順豐重新下單，儲存後請重新打印訂單!',
        background : 'rgba(0,0,0,0.85) !important'
      });
      try {
        const valid = this.$refs.form.validate()
        if (!valid) return


        const order = this.order.id ?
          _.pick(this.order, ['email', 'phone', 'recipient', 'deliveryDay', 'deliveryTimeSlot', 'area', 'district',
            'subDistrict', 'fullAddress', 'orderStatus', 'pickupLocationCode', 'deliveryType', 'printed', 'remarks'])
          : _.clone(this.order)

        if (this.createdBy) {
          order.createdBy = this.createdBy
        }

        order.items = Object.values(this.order.items).filter(item => item.quantity)
                            .map(item => ({
                              product   : item.product.id,
                              quantity  : item.quantity,
                              unitPrice : item.unitPrice,
                              addons    : { ...item.addons, _id : undefined }
                            })).filter(item => parseInt(item.quantity) > 0)
        // console.log(order)
        // return true

        const result = this.order.id ? await this.$api.patch('/v1/orders/' + this.order.orderNumber, order) : await this.$api.post('/v1/orders/adminOrder', order)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '訂單更新成功',
            type    : 'success',
          })

          this.order = result.data
          this.resolve(this.order)
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
      this.order = {}
    },
  }
}
</script>
<style lang="scss" scoped>
.no-edit {
  background-color: #eee !important;
}

.removeItem {
  position: absolute;
  top: 35px;
  left: 101%;
  width: 50px;
  cursor: pointer;

  &:hover {
    color: #aaa;
  }
}

.hasQuantity {
  background-color: #ccc;
  padding-top: 9px;
  margin-bottom: 10px;
}

</style>
