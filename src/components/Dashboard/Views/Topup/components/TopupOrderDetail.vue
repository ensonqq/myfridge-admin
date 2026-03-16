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
            <div class="row" v-if="order.orderNumber">
              <label class="col-sm-3 col-form-label">增值號碼</label>
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
              <label class="col-sm-3 col-form-label">狀態</label>
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

            <div class="row" v-if="order.createdAt">
              <label class="col-sm-3 col-form-label">建立時間</label>
              <div class="col-sm-7">
                <div class="form-group pa-10">
                  <div class="form-control no-edit">{{ moment(order.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
                </div>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">總數</label>
              <div class="col-sm-7">
                <!-- if existing order -->
                <div class="form-group pa-10" v-if="order.id">
                  <div class="form-control no-edit">
                    ${{ order.price }}
                  </div>
                </div>
                <!-- if new order -->
                <ValidationProvider v-else name="price" rules="required" v-slot="{ passed, failed }">
                  <fg-input type="text"
                            :error="failed ? '錯誤': null"
                            :hasSuccess="passed"
                            name="price"
                            v-model="order.price">
                  </fg-input>
                </ValidationProvider>
              </div>
            </div>


            <div class="row" v-if="order.payment">
              <label class="col-sm-3 col-form-label">付款詳情 ({{ orderStatusMapper[order.orderStatus] }})
                <div class="text-info" @click="getTopupOrderStatus()">
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
              <label class="col-sm-3 col-form-label">備注（選填）</label>
              <div class="col-sm-7">
                <el-input type="textarea"
                          v-model="order.remarks">
                </el-input>
              </div>
            </div>

            <div class="row">
              <label class="col-sm-3 col-form-label">增值卡</label>
              <div class="col-sm-7 mt-3">
                <div class="row align-items-center" v-if="order.topupCard">
                  <div class="col-12">
                    <img width="80" v-if="order.topupCard.images[0]" :src="order.topupCard.images[0].small.path"></img>
                    <span v-else>[沒有圖片]</span>
                  </div>
                  <div class="col-12">
                    名稱：{{ order.topupCard.name.zh }}
                  </div>
                  <div class="col-12">
                    簡稱：{{ order.topupCard.title.zh }}
                  </div>
                  <div class="col-12">
                    說明：{{ order.topupCard.desc.zh }}
                  </div>
                  <div class="col-12">
                    售價：{{ order.topupCard.price }}
                  </div>
                  <div class="col-12">
                    積分：{{ order.topupCard.credits }}
                  </div>
                  <div class="col-12">
                    *每位用戶最多購買{{ order.topupCard.maxQtyPerUser }}張
                  </div>
                </div>
                <!--                <el-button type="info" @click="addItem">＋加入物品</el-button>-->
              </div>
            </div>
          </form>
        </ValidationObserver>
      </div>
    </div>
    <!-- Classic Modal -->
    <EditPickupAddressModal ref="EditPickupAddressModal"></EditPickupAddressModal>
    <div slot="footer" class="dialog-footer">
      <div>
        <el-button @click="close">關閉</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </div>
    </div>
    <UserProfile ref="userProfile"></UserProfile>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </el-dialog>
</template>
<script>
import UserProfile                                                          from "@/components/Dashboard/Views/Pages/UserProfile";
import {Card, Modal}                                                        from 'src/components/UIComponents'
import {extend}                                                             from "vee-validate";
import {required, numeric, regex, confirmed}                                from "vee-validate/dist/rules";
import {Input, Loading, Option, Select, Button, DatePicker, Dialog, Switch} from 'element-ui';
import moment                                                               from 'moment'
import {mapState}                                                           from "vuex";
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
    UserProfile,
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
    async getTopupOrderStatus () {
      const loading = new Loading.service({ fullscreen : true })
      try {
        const orderStatus = await this.$api.get('/v1/topups/status/' + this.order.orderNumber, { params : { accessCode : this.order.accessCode } })
        this.order = orderStatus.data
        loading.close()
      } catch (e) {
        console.log(e)
        loading.close()
      }
    },

    async changeOrderStatus (newval) {
      if (!this.order.id) return

      const oldval = this.prevOrderStatus
      if (this.order.id && newval !== oldval) {
        const orderStatusLabel = this.orderStatuses.filter(item => item.value === newval)[0].label
        const confirmation = await this.$refs.ConfirmDialog.open('更新狀態', `你確定要將增值${ this.order.orderNumber }的狀態設定為${ orderStatusLabel }？`)
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
      const result = await this.$refs.userProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
    async open (orderNumber) {
      this.dialogVisible = true
      if (orderNumber) {
        await this.getTopupOrderDetail(orderNumber)
      } else {
        this.newTopupOrder()
      }
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    newTopupOrder () {
      this.order = {
        orderStatus : 'confirmed',
        remarks     : '',
        payment     : {
          paymentType : 'admin'
        }
      }
    },

    async getTopupOrderDetail (orderNumber) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/topups/orders/' + orderNumber)
        this.order = detail.data
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
        const valid = this.$refs.form.validate()
        if (!valid) return


        const order = this.order.id ?
          _.pick(this.order, ['email', 'remarks', 'orderStatus'])
          : _.clone(this.order)

        const result = await this.$api.patch('/v1/topups/orders/' + this.order.orderNumber, order)
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
<style lang="scss">
.no-edit {
  background-color: #eee !important;
}

.hasQuantity {
  background-color: #ccc;
  padding-top: 9px;
  margin-bottom: 10px;
}

</style>
