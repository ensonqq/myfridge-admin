<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}{{ filters.deliveryDay }} (共{{ result.results.length }}張訂單)
        <el-button @click="getOrders" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body">
      <div class="row">
        <h6 class="col-12">訂單總數: {{ result.totalResults }}, 件貨總數: {{ totalSkuCount }}</h6>
        <div class="col-12">{{ skuSummary }}</div>
      </div>
      <div class="row mt-2">
        <div class="col-lg-8 col-12 row">
          <div class="col-lg-5 col-12" v-show="$route.name === 'OrdersByCheckOutDate'">
            <fg-input label="落單日(區間)">
              <el-date-picker v-model="datePicker"
                              class="pb-1 pt-1"
                              type="daterange"
                              range-separator="至"
                              start-placeholder="Start date"
                              end-placeholder="End date">
              </el-date-picker>
            </fg-input>
          </div>

          <div class="col-lg-2 col-12" v-show="$route.name === 'OrdersByDeliveryDateV1' || nav === 'deliveryDay'">
            <fg-input label="收貨日">
              <el-date-picker v-model="date"
                              type="date"
                              placeholder="">
              </el-date-picker>
            </fg-input>
          </div>

          <div class="col-lg-2 col-6">
            <fg-input label="訂單狀態">
              <el-select size="small" class="select-normal" v-model="filters.orderStatus">
                <el-option v-for="option in orderStatuses"
                           :value="option.value"
                           :label="option.label"
                           :key="option.value">
                </el-option>
              </el-select>
            </fg-input>
          </div>

          <div class="col-lg-8 col-12 row align-items-center print-controls" v-show="$route.name === 'OrdersByDeliveryDateV1'">
            <div class="mt-3">
              <el-button @click="print('allUnprinted')">列印所有未印({{ getUnprintedCnt }})</el-button>
            </div>
            <div class="mt-3">
              <el-button @click="print('selected')">列印已選({{ multipleSelection.length }})</el-button>
            </div>
            <!-- removed on 14 Apr -->
            <!--<div class="mt-3">
                          <el-button @click="courierExcel">新夏暉</el-button>
            </div>-->
            <div class="mt-3">
              <el-button @click="courierExcelSF">順豐</el-button>
            </div>
            <div class="mt-3">
              <el-button @click="adminExcel">Mark數</el-button>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-12">
          <div class="pull-right d-flex">
            <div class="mr-3">
              <el-button @click="openDetail()">＋建立新訂單</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getOrders"
                      addon-right-icon="nc-icon nc-zoom-split">
            </fg-input>
          </div>
        </div>
      </div>
      <div class="col-sm-12">
        <el-table v-loading="loading"
                  empty-text="load緊，唔好急…"
                  ref="multipleTableRef"
                  :data="result.results"
                  :default-sort="this.sort"
                  :row-class-name="({row, rowIndex})=> row.printed? 'printed': 'unprint'"
                  @sort-change="sortChange"
                  @row-click="rowClick"
                  @selection-change="handleSelectionChange"
                  header-row-class-name="text-primary">
          <el-table-column type="selection" width="55"/>
          <el-table-column label="訂單號碼" min-width="250">
            <template #default="scope">
              <div class="d-flex justify-content-center">
                <div>{{ scope.row.orderNumber }}</div>
                <div v-if="scope.row.printed" class="text-danger">(已印)</div>
                <p-button v-if="scope.row.delivery.billNo" type="info" size="sm" :class="'ml-2 order-routes-'+scope.row.id+'-button'" icon @click.stop="showOrderRoute(scope.row.orderNumber)">
                  <i class="fa fa-location-arrow" aria-hidden="true"></i>
                </p-button>
              </div>
              <span class="weekendDelivery" v-if="scope.row.isWeekEndDelivery"></span>
            </template>
          </el-table-column>
          <el-table-column prop="recipient"
                           label="名稱">
          </el-table-column>
          <el-table-column prop="email"
                           label="電郵"
                           min-width="180">
            <template #default="scope">
              <div v-if="scope.row.createdBy" class="text-success" @click.stop="openUserProfile(scope.row.createdBy.id)">
                <span v-if="scope.row.createdBy.vipTier === 'gold'" style="color: #f88f02">(金)</span>
                {{ scope.row.createdBy.email }}
              </div>
              <div v-else>{{ scope.row.email }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="phone"
                           label="電話" min-width="100">
          </el-table-column>
          <el-table-column label="訂單物品" min-width="130">
            <template #default="scope">
              <template>
                <span v-html="'總數: ' + getOrderTotalItemCnt(scope.row.items)"></span>
                <p-button :class="'ml-2 order-items-'+scope.row.id+'-button'" icon @click.stop="showOrderItems('order-items-'+scope.row.id)">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </p-button>
                <div :class="'hidden order-items-'+scope.row.id">
                  <div v-html="scope.row.items.map(item=> item.quantity + 'x' + item.product.internalName).join('<br>')">
                  </div>
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="fullAddress"
                           label="詳細地址" min-width="200">
            <template #default="scope">
              <div>{{ scope.row.deliveryType === 'pickup' ? '(自取) ' : '' }}{{ scope.row.fullAddress }}</div>
            </template>
          </el-table-column>
          <el-table-column label="使用積分" min-width="200">
            <template #default="scope">
              <div>
                <b v-if="scope.row.creditsUsed">-${{ scope.row.creditsUsed }}</b>
                <template v-else>--</template>
              </div>
            </template>
          </el-table-column>


          <el-table-column label="會員Discount" min-width="200">
            <template #default="scope">
              <div>
                <template v-if="scope.row.vipTierDiscount.length">
                  <b>-${{ scope.row.vipTierDiscountTotal * -1 }}</b>
                  <div v-for="autoTier in scope.row.vipTierDiscount">
                    {{ autoTier.desc }}
                  </div>
                </template>
                <template v-else>--</template>
              </div>
            </template>
          </el-table-column>


          <el-table-column label="多買多減Tier" min-width="200">
            <template #default="scope">
              <div>
                <template v-if="scope.row.autoDiscountTiersAdopted.length">
                  <b>-${{ scope.row.autoDiscountTotal * -1 }}</b>
                  <div v-for="autoTier in scope.row.autoDiscountTiersAdopted">
                    {{ autoTier.desc }}
                  </div>
                </template>
                <template v-else>--</template>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="優惠碼" min-width="220">
            <template #default="scope">
              <b v-if="scope.row.voucherDiscountTotal">
                -${{ scope.row.voucherDiscountTotal * -1 }}
              </b>
              <div>
                <template v-if="scope.row.voucherUsed">code: {{ scope.row.voucherUsed.code }}, {{ scope.row.voucherUsed.name.zh }}</template>
                <template v-else>沒有使用優惠碼</template>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="收款" prop="paidTotal" min-width="150" sortable>
            <template #default="scope">
              {{ scope.row.orderStatus !== 'confirmed' ? `(${ orderStatusesMapper[scope.row.orderStatus] })` : '' }}{{ scope.row.payment.paymentType }}:<br>
              <b>${{ scope.row.paidTotal }}</b>
            </template>
          </el-table-column>

          <el-table-column label="落單時間" min-width="150" sortable>
            <template #default="scope">
              <div>{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryTimeSlot"
                           label="送貨時間" min-width="200s">
            <template #default="scope">
              {{ scope.row.deliveryDay }},
              {{ scope.row.deliveryTimeSlot }}
            </template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" min-width="100" align="right">
            <template slot-scope="props">
              <div class="d-flex">
                <p-button type="success" icon @click.stop="openDetail(props.row.orderNumber)">
                  <i class="fa fa-edit" aria-hidden="true"></i>
                </p-button>
                <p-button type="success" icon @click.stop="resendReceipt(props.row.orderNumber)">
                  <i class="fa fa-envelope" aria-hidden="true"></i>
                </p-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="col-12 mt-3 row">
        <div class="col-sm-6 pagination-info">
          <p class="category">{{ (result.page - 1) * result.limit + 1 }} 至 {{ result.page * result.limit }} (共{{ result.totalResults }}個結果)</p>
        </div>
        <div class="col-sm-6">
          {{ filters.page }}
          <p-pagination class="pull-right"
                        v-model="filters.page"
                        :per-page="result.limit"
                        :total="result.totalResults">
          </p-pagination>
        </div>
      </div>
    </div>
    <CourierExcel :data="result.results" ref="CourierExcel"></CourierExcel>
    <CourierExcelSF :data="result.results" ref="CourierExcelSF"></CourierExcelSF>
    <AdminExcel :data="result.results" ref="AdminExcel"></AdminExcel>
    <OrderDetail ref="OrderDetail"></OrderDetail>
    <UserProfile ref="UserProfile"></UserProfile>
    <div style="position: fixed; height: 1px; width: 1px; left: -10000px; top: -10000px;">
      <embed :src="pdfsrc" id="printPDF" type="application/pdf" width="100%" height="600px"/>
    </div>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
    <OrderRoute ref="OrderRoute"></OrderRoute>
  </div>
</template>

<script>
import UserProfile                   from "@/components/Dashboard/Views/Pages/UserProfile";
import OrderDetail                   from './OrderDetail'
import CourierExcel                  from './components/CourierExcel'
import CourierExcelSF                from './components/CourierExcelSF'
import AdminExcel                    from './components/AdminExcel'
import Vue                           from 'vue'
import {Loading, Table, TableColumn} from 'element-ui'
import PSwitch                       from 'src/components/UIComponents/Switch.vue'
import PPagination                   from 'src/components/UIComponents/Pagination.vue'
import moment                        from 'moment'
import _                             from 'lodash'
import printOrders                   from '../../../../util/printOrders'

import {DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option} from 'element-ui'
import {mapState}                                                           from "vuex";
import ConfirmDialog                                                        from '../Components/ConfirmDialog'
import OrderRoute
                                                                            from "@/components/Dashboard/Views/Orders/OrderRoute"

Vue.use(Table)
Vue.use(TableColumn)
export default {
  props      : ['nav'],
  components : {
    PSwitch,
    PPagination,
    OrderDetail,
    UserProfile,
    CourierExcel,
    CourierExcelSF,
    AdminExcel,
    ConfirmDialog,
    OrderRoute,
    [DatePicker.name] : DatePicker,
    [Select.name]     : Select,
    [Option.name]     : Option,
    [Button.name]     : Button,
  },
  computed   : {
    ...mapState(['skuSorting']),
    totalSkuCount () {
      return _.sumBy(this.result.results, function (order) {
        // return o.quantity
        return _.sumBy(order.items, function (item) {
          let qty = 0

          if (item.product.isBundled) {
            item.product.bundleItems.forEach(bundleItem => {
              qty += item.quantity * bundleItem.quantity
            })
          } else {
            qty = item.quantity
          }
          return qty
        })
      })
    },

    skuSummary () {
      const summary = this.getSort()
      this.result.results.forEach(order => {
        order.items.forEach(item => {
          if (item.product.isBundled) {
            summary[item.product.id].quantity += item.quantity
            item.product.bundleItems.forEach(bundleItem => {
              summary[bundleItem.product.id].quantity += item.quantity * bundleItem.quantity
            })
          } else {
            summary[item.product.id].quantity += item.quantity
          }
        })
      })
      return Object.values(summary).map(item => `${ item.name }: ${ item.quantity }`).join(', ')
    },

    getUnprintedCnt () {
      return this.result.results.filter(item => !item.printed).length
    },
  },
  watch      : {
    $route (to, from) {
      this.queryByRoute()
    },
    datePicker (val) {
      this.filters.createdAtFrom = null
      this.filters.createdAtTo = null
      if (val && val.length) {
        this.filters.createdAtFrom = moment(val[0]).startOf('day').format()
        this.filters.createdAtTo = moment(val[1]).endOf('day').format()
      }
    },
    date (val) {
      this.filters.deliveryDay = null
      if (val) {
        this.filters.deliveryDay = moment(val).format('YYYY-MM-DD')
      }
    },
    filters : {
      deep    : true,
      handler : function () {
        this.getOrders()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getOrders()
      }
    },
  },

  async created () {
    this.queryByRoute()
    await this.getProducts()
    await this.getCategoriesWithProducts()
  },

  methods : {
    showOrderItems (tag) {
      document.getElementsByClassName(tag)[0].classList.remove('hidden')
      document.getElementsByClassName(tag + '-button')[0].remove()
    },
    async showOrderRoute (orderNumber) {
      const result = await this.$refs.OrderRoute.open(orderNumber)
      if (result) {
        //DO STH
      }
    },
    async resendReceipt (orderNumber) {
      try {

        const dialog = await this.$refs.ConfirmDialog.open('重新發送收據', '你確定要重新發送收據嗎？')
        if (dialog.isConfirmed) {
          const result = await this.$api.get('/v1/orders/resendReceipt/' + orderNumber)
          if (result.data) {
            this.$notify({ title : '成功', message : '重新發送成功', type : 'success', })
          }
        }
      } catch (error) {
        this.$notify.error({ title : '错误', message : '發送失敗' });
      }
    },

    getSort () {
      const t = this
      return _.reduce(this.skuSorting, (accumulator, value) => {
        return { ...accumulator, [value] : { name : t.getProductsInternalName(value), quantity : 0 } }
      }, {})
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
    getProductsInternalName (id) {
      const find = this.products.filter(item => item.id === id)
      return find[0] ? find[0].internalName : ''
    },
    rowClick (row) {
      this.$refs.multipleTableRef.toggleRowSelection(row)
    },
    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
    },

    async openDetail (orderNumber) {
      const result = await this.$refs.OrderDetail.open(orderNumber)
      if (result) {
        //DO STH
      }
    },

    queryByRoute () {
      switch (this.$route.name) {
        case 'OrdersByCheckOutDate':
          this.date = null
          this.datePicker = [new Date(), new Date()]
          break
        case 'OrdersByDeliveryDateV1':
          this.date = new moment().add(2, 'days').toDate()
          // this.date = new moment('2022-10-31').toDate()
          this.datePicker = null
          break
        default:
          break
      }
      this.getOrders()
    },

    sortChange ({ prop, order }) {
      this.sort = { prop, order }
    },

    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    async getCategoriesWithProducts () {
      try {
        const t = this
        const categories = await t.$api.get('/v1/categories?products=1')
        if (categories && categories.data) {
          this.categories = categories.data.results
        }
      } catch (e) {
        console.log(e)
      }
    },

    async print (type) {
      try {
        const printItems = type === 'allUnprinted' ? this.result.results.filter(item => !item.printed) : this.multipleSelection
        if (printItems.length) {
          this.pdfsrc = printOrders(printItems, this.getSort(), this.categories)
          const ids = printItems.map(item => item.id)
          await this.$api.post('/v1/orders/updateOrderToPrinted', ids)
          this.result.results.forEach(item => {
            if (ids.includes(item.id)) {
              item.printed = true
            }
          })
        }
      } catch (e) {
        console.log(e)
      }
    },
    courierExcel () {
      this.$refs.CourierExcel.ExportToExcel(this.filters.deliveryDay)
    },
    courierExcelSF () {
      this.$refs.CourierExcelSF.ExportToExcel(this.filters.deliveryDay)
    },
    adminExcel () {
      this.$refs.AdminExcel.ExportToExcel(this.filters.deliveryDay)
    },
    getOrders () {
      // if (this.result.results.length) return true
      this.loading = true
      this.result.results = []
      this.debounceData()
    },

    debounceData : _.debounce(async function () {
      try {
        const params = _.omitBy(this.filters, val => !val)
        if (this.sort.order) {
          params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
        }

        const orders = await this.$api.get('/v1/orders', { params })
        if (orders && orders.data) {
          this.result = orders.data
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.loading = false
      }
    }, 1000),
    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
    handleDelete (index, row) {
      alert(`Delete user is prohibited!`)
    },
  },
  data () {
    return {
      categories : null,
      pdfsrc     : '',

      // pending_payment payment_failed confirmed cancelled
      orderStatuses       : [{ label : '未付款', value : 'pending_payment' }, { label : '已付款', value : 'confirmed' },
        { label : '已取消', value : 'cancelled' }, { label : '付款失敗', value : 'payment_failed' }],
      orderStatusesMapper : {
        pending_payment : '未付款',
        confirmed       : '已付款',
        cancelled       : '已取消',
        payment_failed  : '付款失敗'
      },
      multipleSelection   : [],
      datePicker          : null,
      date                : null,
      loading             : false,
      sort                : { prop : 'orderNumber', order : 'descending' },
      filters             : {
        search        : '',
        deliveryDay   : '',
        createdAtFrom : null,
        createdAtTo   : null,
        limit         : 1000,
        page          : 1,
        orderStatus   : 'confirmed'
      },
      result              : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
      moment,
      products            : []
    }
  }
}
</script>
<style lang="scss" scoped>
.weekendDelivery {
  position: absolute;
  top: 5px;
  right: 20px;
  font-size: 10px;
  color: darkorange;
  transform: rotate(-10deg);

  &:after {
    content: "周未送貨";
  }
}
</style>
