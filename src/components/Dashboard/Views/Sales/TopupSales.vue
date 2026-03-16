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
            <fg-input label="選擇報表類別">
              <el-select size="small"
                         class="select-normal"
                         v-model="filters.reportType">
                <el-option v-for="option in reportTypeSelect"
                           :value="option.value"
                           :label="option.label"
                           :key="option.value">
                </el-option>
              </el-select>
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
          <el-table-column label="日期" sortable prop="date" min-width="120"></el-table-column>
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
          <el-table-column label="積分" sortable prop="totalCredits" min-width="100"></el-table-column>
          <el-table-column label="訂單量" sortable prop="orders" min-width="100"></el-table-column>

          <el-table-column label="訂單明細" sortable prop="orders" min-width="200">
            <template #default="scope">
              <div>會員: {{ scope.row.memberOrders }}, 非會員: {{ scope.row.nonMemberOrders }}, 未完成: {{ scope.row.incompleteOrders }}, 取消: {{ scope.row.cancelledOrders }}</div>
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
  </div>
</template>

<script>
import {Button, Select, Option, Switch, Loading, Table, TableColumn} from 'element-ui'
import Vue                                                           from 'vue'
import PSwitch                                                       from 'src/components/UIComponents/Switch.vue'
import PPagination                                                   from 'src/components/UIComponents/Pagination.vue'
import moment                                                        from 'moment'
import _                                                             from 'lodash'
import ConfirmDialog                                                 from '../Components/ConfirmDialog'
import {mapState}                                                    from "vuex";

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "TopupSales",
  components : {
    [Select.name] : Select,
    [Option.name] : Option,
    [Button.name] : Button,
    [Switch.name] : Switch,
    [Table.name]  : Table,
    PSwitch,
    PPagination,
    ConfirmDialog
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

    debounceData : _.debounce(async function () {
      const t = this
      try {
        const params = _.omitBy(t.filters, val => !val)
        if (this.sort.order) {
          params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
        }
        const sales = await t.$api.get('/v1/sales/topup', { params })
        if (sales && sales.data) {
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
      reportTypeSelect : [{ label : '每日', value : 'daily' }, { label : '每月', value : 'monthly' },
        { label : '每年', value : 'yearly' }],
      loading          : false,
      sort             : { prop : 'date', order : 'descending' },
      filters          : {
        reportType : 'daily',
        status     : '',
        limit      : 100,
        page       : 1,
      },
      result           : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
      header           : [],
      moment
    }
  }
}
</script>
