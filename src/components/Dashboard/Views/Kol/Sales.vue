<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getSales" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row" v-if="user.role === 'super'">
      <div class="col-12 row">
        <div class="col-8 row">
          <div class="col-12 col-lg-5">
            <fg-input label="選擇月份">
              <el-date-picker v-model="filters.date"
                              type="month"
                              value-format="yyyy-MM"
                              placeholder="">
              </el-date-picker>
            </fg-input>
          </div>
          <div class="col-4 mt-4">
            <el-button type="danger" @click="regenerateMonthReport()">重新計算本月業積</el-button>
          </div>
        </div>
      </div>

      <div class="col-sm-12">
        <el-table v-loading="loading"
                  :data="result.results"
                  :default-sort="this.sort"
                  empty-text="load緊，唔好急…"
                  @sort-change="sortChange"
                  header-row-class-name="text-primary">
          <el-table-column class-name="action-buttons td-actions" align="left" min-width="120">
            <template #default="scope">
              <p-button type="success" @click="openSettlement(scope.row.id)" v-if="scope.row.settlement">
                <div class="btn-icon">
                  <i class="fa fa-check text--14"></i>已結算
                </div>
              </p-button>

              <p-button type="warning" @click="openSettlement(scope.row.id)" v-else>
                <div class="btn-icon">
                  <i class="fa fa-exclamation-sign text--14"></i>未結算
                </div>
              </p-button>
            </template>
          </el-table-column>
          <el-table-column label="Code" prop="kolCode" min-width="120">
            <template #default="scope">
              <div class="text-primary" @click="openVoucherDetail(scope.row.kolCode.id)">{{ scope.row.kolCode.code }}</div>
            </template>
          </el-table-column>
          <el-table-column label="Kol用戶" prop="kol" min-width="250">
            <template #default="scope">
              <div class="text-primary" @click="openUserProfile(scope.row.kol.id)">{{ scope.row.kol.name }}, {{ scope.row.kol.email }}</div>
            </template>
          </el-table-column>
          <el-table-column label="月份" prop="date" min-width="120"></el-table-column>
          <el-table-column sortable
                           prop="turnover"
                           label="營業額" min-width="130">
            <template #default="scope">
              <b v-if="scope.row.turnover >= 30000 && scope.row.reportType === 'daily'">
                {{ toDollar(scope.row.turnover) }}
              </b>
              <template v-else>
                {{ toDollar(scope.row.turnover) }}
              </template>
            </template>
          </el-table-column>
          <el-table-column label="獲得Bonus" prop="bonus" sortable min-width="130">
            <template #default="scope">
              {{ toDollar(scope.row.bonus) }}
            </template>
          </el-table-column>
          <el-table-column label="訂單量" sortable prop="orders" min-width="100"></el-table-column>
          <el-table-column label="平均訂單$" min-width="100">
            <template #default="scope">
              <b v-if="scope.row.turnover/scope.row.orders >= 400">
                {{ (scope.row.turnover / scope.row.orders).toFixed(1) }}
              </b>
              <span v-else>
              {{ (scope.row.turnover / scope.row.orders).toFixed(1) }}
            </span>
            </template>
          </el-table-column>
          <!--          <el-table-column label="總訂單" sortable prop="totalOrders" min-width="100"></el-table-column>-->
          <el-table-column label="產品數量" sortable prop="quantity" min-width="135"></el-table-column>

          <el-table-column label="雞胸" prop="雞胸"></el-table-column>
          <el-table-column label="點心" prop="點心"></el-table-column>
          <el-table-column label="餐盒" prop="餐盒"></el-table-column>
          <el-table-column label="奶粉" prop="奶粉"></el-table-column>
          <el-table-column label="試食" prop="試食"></el-table-column>
          <el-table-column label="訂單明細" min-width="200">
            <template #default="scope">
              <div>會員: {{ scope.row.memberOrders }}, 非會員: {{ scope.row.nonMemberOrders }}, 未完成: {{ scope.row.incompleteOrders }}, 取消: {{ scope.row.cancelledOrders }}</div>
            </template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" label="動作" align="left" min-width="120">
            <template #default="scope">
              <p-button type="danger" @click="deleteSettlement(scope.row.id)">
                <div class="btn-icon">
                  <i class="fa fa-remove"></i>刪除
                </div>
              </p-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="col-12 mt-3 row">
        <div class="col-sm-6 pagination-info">
          <p class="category">{{ (result.page - 1) * result.limit + 1 }} 至 {{ result.page * result.limit }} (共{{ result.totalResults }}個結果)</p>
        </div>
        <div class="col-sm-6">
          <p-pagination class="pull-right"
                        v-model="filters.page"
                        :per-page="result.limit"
                        :total="result.totalResults">
          </p-pagination>
        </div>
      </div>
    </div>
    <div class="card-body row" v-else>
      <div class="col-12">
        <h3>沒有權限，你老母臭閪係咪行撚錯路</h3>
      </div>
    </div>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
    <Settlement ref="Settlement"></Settlement>
    <VoucherDetail ref="VoucherDetail"></VoucherDetail>
    <UserProfile ref="UserProfile"></UserProfile>
  </div>
</template>

<script>
import {Button, Select, Option, Switch, Loading, Table, TableColumn, DatePicker} from 'element-ui'
import Vue                                                                       from 'vue'
import PSwitch
                                                                                 from 'src/components/UIComponents/Switch.vue'
import PPagination
                                                                                 from 'src/components/UIComponents/Pagination.vue'
import moment                                                                    from 'moment'
import _                                                                         from 'lodash'
import ConfirmDialog                                                             from '../Components/ConfirmDialog'
import {mapState}                                                                from "vuex";
import Settlement
                                                                                 from "@/components/Dashboard/Views/Kol/Components/Settlement";
import VoucherDetail
                                                                                 from "@/components/Dashboard/Views/Voucher/components/VoucherDetail";
import UserProfile
                                                                                 from "@/components/Dashboard/Views/Pages/UserProfile";

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "KolSales",
  components : {
    [DatePicker.name] : DatePicker,
    [Select.name]     : Select,
    [Option.name]     : Option,
    [Button.name]     : Button,
    [Switch.name]     : Switch,
    [Table.name]      : Table,
    [Button.name]     : Button,
    Settlement,
    PSwitch,
    PPagination,
    ConfirmDialog,
    VoucherDetail,
    UserProfile
  },
  computed   : {
    ...mapState(['user'])
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getSales()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getSales()
      }
    },
    page    : 1,
  },

  created () {
    this.getSales()
  },

  methods : {
    async deleteSettlement (kolSalesId) {
      try {
        const confirmation = await this.$refs.ConfirmDialog.open('刪除', '你確定要此業積嗎？')
        if (confirmation.isConfirmed) {
          const result = await this.$api.delete('/v1/sales/kolSales/' + kolSalesId)
          if (result) {
            this.getSales()
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    async regenerateMonthReport () {
      try {
        this.loading = true
        const date = moment(this.filters.date).add('1', 'days').format('YYYY-MM-DD')
        const generate = await this.$api.get('/v1/sales/kolSales/regenerate', { params : { date } })
        if (generate.data) {
          await this.getSales()
        }
      } catch (e) {
        this.loading = false
      }
    },
    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
    async openVoucherDetail (voucherId) {
      const result = await this.$refs.VoucherDetail.open(voucherId)
      if (result) {
        //DO STH
        this.getVouchers()
      }
    },
    async openSettlement (kolSalesId) {
      const result = await this.$refs.Settlement.open(kolSalesId)
      if (result) {
        //DO STH
        this.getSales()
      }
    },
    getEstimatedMargin (row) {
      const isNew = moment(row.date).isAfter(moment('2022-08-01'))
      const turnOver = row.turnover * 0.972
      const deliveryCost = row.orders * 46
      let foodCost = 0
      if (isNew) {
        foodCost = _.sumBy(row.catSummary, function (item) {
          if (item.category.name.zh === '雞胸') {
            return item.quantity * 5
          } else if (item.category.name.zh === '點心') {
            return item.quantity * 7
          } else if (item.category.name.zh === '餐盒') {
            return item.quantity * 19
          } else if (item.category.name.zh === '奶粉') {
            return item.quantity * 7
          } else if (item.category.name.zh === '試食') {
            return item.quantity * 25
          }
        })
      } else {
        foodCost = _.sumBy(row.catSummary, function (item) {
          if (item.category.name.zh === '雞胸') {
            return item.quantity * 12.3
          } else if (item.category.name.zh === '點心') {
            return item.quantity * 23
          } else if (item.category.name.zh === '餐盒') {
            return item.quantity * 19
          } else if (item.category.name.zh === '奶粉') {
            return item.quantity * 7
          } else if (item.category.name.zh === '試食') {
            return item.quantity * 25
          }
        })
      }

      return (turnOver - deliveryCost - foodCost).toFixed(0)
    },
    sortChange ({ prop, order }) {
      this.sort = { prop, order : order }
    },


    getSales () {
      this.loading = true
      this.result.results = []
      this.debounceData()
    },

    toDollar (value) {
      let formatting_options = {
        style                 : 'currency',
        currency              : 'HKD',
        minimumFractionDigits : 0,
      }
      const dollarString = new Intl.NumberFormat('zh-HK', formatting_options);
      return dollarString.format(value)
    },

    async getCategories () {
      try {
        const t = this
        const categories = await t.$api.get('/v1/categories')
        if (categories && categories.data) {
          const cats = {}
          categories.data.results.forEach(item => {
            cats[item.id] = item.name.zh
          })
          this.categories = cats
        }
      } catch (e) {
        console.log(e)
      }
    },

    debounceData : _.debounce(async function () {
      const t = this
      try {
        const params = _.omitBy(t.filters, val => !val)
        if (this.sort.order) {
          params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
        }
        const sales = await t.$api.get('/v1/sales/kolSales', { params })
        if (sales && sales.data) {
          sales.data.results = sales.data.results.map(item => {
            const cat = {}
            item.catSummary.forEach(catStat => {
              cat[catStat.category.name.zh] = catStat.quantity
            })
            return { ...item, ...cat }
          })
          t.result = sales.data
        }
      } catch (e) {
        console.log(e)
      } finally {
        t.loading = false
      }
    }, 1000)
  },
  data () {
    return {
      loading : false,
      sort    : { prop : 'turnover', order : 'descending' },
      filters : {
        reportType : 'monthly',
        date       : moment().format('YYYY-MM'),
        status     : '',
        limit      : 100,
        page       : 1,
      },
      result  : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
      header  : [],
      moment
    }
  }
}
</script>
