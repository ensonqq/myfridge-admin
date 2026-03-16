<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}{{ filters.deliveryDay }} (共{{ result.results.length }}張訂單)
        <el-button @click="getTopupOrders" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body">
      <div class="row mt-2">
        <div class="col-lg-8 col-12 row">
          <div class="col-lg-5 col-12">
            <fg-input label="增值日(區間)">
              <el-date-picker v-model="datePicker"
                              class="pb-1 pt-1"
                              type="daterange"
                              range-separator="至"
                              start-placeholder="Start date"
                              end-placeholder="End date">
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
        </div>
        <div class="col-lg-4 col-12">
          <div class="pull-right d-flex">
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getTopupOrders"
                      addon-right-icon="nc-icon nc-zoom-split">
            </fg-input>
          </div>
        </div>
      </div>
      <div class="col-sm-12">
        <el-table v-loading="loading"
                  empty-text="load緊，唔好急…"
                  :data="result.results"
                  :default-sort="this.sort"
                  @sort-change="sortChange"
                  header-row-class-name="text-primary">
          <el-table-column label="訂單號碼" prop="orderNumber" min-width="250"></el-table-column>
          <el-table-column label="執行者"
                           min-width="180">
            <template #default="scope">
              <div v-if="scope.row.createdBy" class="text-success" @click.stop="openUserProfile(scope.row.createdBy.id)">
                <span v-if="scope.row.createdBy.vipTier === 'gold'" style="color: #f88f02">(金)</span>
                <span v-if="['admin','super'].includes(scope.row.createdBy.role)" style="color: #9d0000">(管)</span>
                {{ scope.row.createdBy.email }}
              </div>
              <div v-else>{{ scope.row.email }}</div>
            </template>
          </el-table-column>
          <el-table-column label="獲取者"
                           min-width="180">
            <template #default="scope">
              <div v-if="scope.row.issuedTo" class="text-success" @click.stop="openUserProfile(scope.row.issuedTo.id)">
                <span v-if="scope.row.issuedTo.vipTier === 'gold'" style="color: #f88f02">(金)</span>
                {{ scope.row.issuedTo.email }}
              </div>
              <div v-else>{{ scope.row.email }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="topupCard.title.zh"
                           label="簡稱">
          </el-table-column>

          <el-table-column label="積分卡" min-width="150">
            <template #default="scope">
              <img width="80" v-if="scope.row.topupCard && scope.row.topupCard.images[0]" @click="openInvoiceDetail(scope.row.topupCard.id)" :src="scope.row.topupCard.images[0].small.path"></img>
              <span v-else>[沒有圖片]</span>
            </template>
          </el-table-column>
          <el-table-column label="獲得積分" prop="topupValue" min-width="130"></el-table-column>
          <el-table-column label="收款" prop="price" min-width="150" sortable>
            <template #default="scope">
              {{ scope.row.orderStatus !== 'confirmed' ? `(${ orderStatusesMapper[scope.row.orderStatus] })` : '' }}{{ scope.row.payment.paymentType }}:<br>
              <b>${{ scope.row.price }}</b>
            </template>
          </el-table-column>


          <el-table-column label="落單時間" min-width="150" sortable>
            <template #default="scope">
              <div>{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
            </template>
          </el-table-column>

          <el-table-column class-name="action-buttons td-actions" min-width="100" align="right">
            <template slot-scope="props">
              <div class="d-flex">
                <p-button type="success" icon @click.stop="openDetail(props.row.orderNumber)">
                  <i class="fa fa-edit" aria-hidden="true"></i>
                </p-button>
                <p-button type="success" icon @click.stop="resendTopupReceipt(props.row.orderNumber)">
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
    <InvoiceDetail ref="InvoiceDetail"></InvoiceDetail>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </div>
</template>

<script>
import Vue              from 'vue'
import {Table, TableColumn}                                                 from 'element-ui'
import PSwitch
                                                                            from 'src/components/UIComponents/Switch.vue'
import PPagination
                                                                            from 'src/components/UIComponents/Pagination.vue'
import moment                                                               from 'moment'
import _                                                                    from 'lodash'
import {DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option} from 'element-ui'
import {mapState}                                                           from "vuex";
import ConfirmDialog                                                        from '../Components/ConfirmDialog'
import InvoiceDetail
                                                                            from "@/components/Dashboard/Views/Invoices/components/InvoiceDetail";

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "TopupOrders",
  components : {
    PSwitch,
    PPagination,
    InvoiceDetail,
    ConfirmDialog,
    [DatePicker.name] : DatePicker,
    [Select.name]     : Select,
    [Option.name]     : Option,
    [Button.name]     : Button,
  },
  computed   : {},
  watch      : {
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
        this.getTopupOrders()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getTopupOrders()
      }
    },
  },

  async created () {
    this.datePicker = [new Date(), new Date()]
  },

  methods : {
    async openInvoiceDetail (topupId) {
      const result = await this.$refs.InvoiceDetail.open(topupId)
      if (result) {
        //DO STH
        this.getTopups()
      }
    },
    async resendTopupReceipt (orderNumber) {
      try {

        const dialog = await this.$refs.ConfirmDialog.open('重新發送收據', '你確定要重新發送收據嗎？')
        if (dialog.isConfirmed) {
          const result = await this.$api.get('/v1/topups/resendTopupReceipt/' + orderNumber)
          if (result.data) {
            this.$notify({ title : '成功', message : '重新發送成功', type : 'success', })
          }
        }
      } catch (error) {
        console.log(error)
        this.$notify.error({ title : '错误', message : '發送失敗' });
      }
    },

    sortChange ({ prop, order }) {
      this.sort = { prop, order }
    },

    getTopupOrders () {
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

        const orders = await this.$api.get('/v1/topups/orders', { params })
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
  },
  data () {
    return {
      // pending_payment payment_failed confirmed cancelled
      orderStatuses       : [{ label : '未付款', value : 'pending_payment' }, { label : '已付款', value : 'confirmed' },
        { label : '已取消', value : 'cancelled' }, { label : '付款失敗', value : 'payment_failed' }],
      orderStatusesMapper : {
        pending_payment : '未付款',
        confirmed       : '已付款',
        cancelled       : '已取消',
        payment_failed  : '付款失敗'
      },
      datePicker          : null,
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
    }
  }
}
</script>
