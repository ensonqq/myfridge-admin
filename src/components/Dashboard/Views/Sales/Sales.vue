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
          <div class="col-12 col-lg-4">
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
          <div class="col-12 col-lg-4">
            <fg-input label="匯出月份">
              <el-date-picker size="small"
                              v-model="exportMonth"
                              type="month"
                              value-format="yyyy-MM"
                              :clearable="false"
                              placeholder="選擇月份">
              </el-date-picker>
            </fg-input>
          </div>
          <div class="col-12 col-lg-2 d-flex align-items-center" style="padding-top: 10px;">
            <el-button size="small"
                       type="success"
                       :loading="exporting"
                       @click="exportExcel">
              <i class="fa fa-file-excel-o"></i> 匯出Excel
            </el-button>
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
          <el-table-column type="expand">
            <template #default="scope">
              <div><b>產品平均售價 ({{ filters.reportType }}) </b></div>
              <div class="d-flex justify-between">
                <div v-for="(cat,catName) in sortByCat(scope.row.skuSellingPrice)" class="mr-5">
                  <div><b>{{ catName }}: <span style="color: darkred">${{ getAvgCatPrice(cat) }}</span></b>(平圴)
                  </div>
                  <div v-for="item in cat">
                    <hr class="my-1">
                    {{ item.product.name.zh }}:
                    <span class="text-danger">{{ item.price ? '$' + item.price : '一' }}</span>
                    <span class="text-info" v-if="item.quantity">({{ item.quantity }}件)</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="日期" sortable prop="date" min-width="120">
            <template #default="scope">
              <div v-if="scope.row.reportType === 'weekly'">
                {{ scope.row.date.substring(0, 7) }}-<span class="text-danger">{{ scope.row.date.substring(8, 10) }}至{{
                  moment(scope.row.date).endOf('week').format('DD')
                }}
              </span>
              </div>
              <div v-else-if="scope.row.reportType === 'daily'">{{ scope.row.date }} ({{
                  weekdays[moment(scope.row.date).format('dddd').substring(0, 3)]
                }})
              </div>
              <div v-else>{{ scope.row.date }}</div>
            </template>
          </el-table-column>
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
          <el-table-column label="訂單量" sortable prop="orders" min-width="100"></el-table-column>
          <el-table-column label="產品數量" sortable prop="quantity" min-width="135"></el-table-column>

          <el-table-column v-for="column in categoryColumns"
                           :key="column.fieldKey"
                           :label="column.label"
                           :prop="column.fieldKey"></el-table-column>
          <el-table-column label="送貨/自取" min-width="130">
            <template #default="scope">
              {{ scope.row.deliveryTypeCtn.delivery }}/{{ scope.row.deliveryTypeCtn.pickup }}
            </template>
          </el-table-column>
          <el-table-column label="平址每單" min-width="130">
            <template #default="scope">{{ toDollar((scope.row.turnover / scope.row.orders).toFixed(1)) }}</template>
          </el-table-column>
          <el-table-column label="訂單明細" sortable prop="orders" min-width="200">
            <template #default="scope">
              <div>會員: {{ scope.row.memberOrders }}, 非會員: {{ scope.row.nonMemberOrders }}, 未完成:
                {{ scope.row.incompleteOrders }}, 取消: {{ scope.row.cancelledOrders }}
              </div>
            </template>
          </el-table-column>
          <!--          <el-table-column label="產品售價" min-width="200">

                    </el-table-column>-->
        </el-table>
      </div>
      <div class="col-12 mt-3 row">
        <div class="col-sm-6 pagination-info">
          <p class="category">{{ (result.page - 1) * result.limit + 1 }} 至 {{ result.page * result.limit }}
            (共{{ result.totalResults }}個結果)</p>
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
        <h3>沒有權限，你係咪行錯路</h3>
      </div>
    </div>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </div>
</template>

<script>
import {Button, Select, Option, Switch, Loading, Table, TableColumn, DatePicker} from 'element-ui'
import Vue from 'vue'
import PSwitch from 'src/components/UIComponents/Switch.vue'
import PPagination from 'src/components/UIComponents/Pagination.vue'
import moment from 'moment'
import _ from 'lodash'
import ConfirmDialog from '../Components/ConfirmDialog'
import {mapState} from "vuex";

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name: "Categories",
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Button.name]: Button,
    [Switch.name]: Switch,
    [Table.name]: Table,
    [DatePicker.name]: DatePicker,
    PSwitch,
    PPagination,
    ConfirmDialog
  },
  computed: {
    ...mapState(['user'])
  },
  watch: {
    filters: {
      deep: true,
      handler: function () {
        this.getSales()
      }
    },
    sort: {
      deep: true,
      handler: function () {
        this.getSales()
      }
    },
    page: 1,
  },

  async created() {
    await this.getCategories()
    await this.getSales()
  },

  methods: {
    getCategoryFieldKey(categoryId) {
      return `cat_${String(categoryId || '').replace(/[^a-zA-Z0-9_-]/g, '_')}`
    },

    getAvgCatPrice(cat) {
      let avgPrice = 0
      let quantity = 0
      cat.forEach(item => {
        if (item.price && item.quantity) {
          avgPrice += item.price * item.quantity
          quantity += item.quantity
        }
      })

      return (avgPrice / quantity).toFixed(2)
    },

    sortByCat(skuSellingPrice) {
      const grouped = _.mapValues(_.groupBy(skuSellingPrice, 'product.category.name.zh'), clist => clist.map(item => _.omit(item, 'product.category.name.zh')));
      return grouped
    },
    sortChange({prop, order}) {
      this.sort = {prop, order: order}
    },

    getSales() {
      this.loading = true
      this.result.results = []
      this.debounceData()
    },

    toDollar(value) {
      let formatting_options = {
        style: 'currency',
        currency: 'HKD',
        minimumFractionDigits: 0,
      }
      const dollarString = new Intl.NumberFormat('zh-HK', formatting_options);
      return dollarString.format(value)
    },

    async getCategories() {
      try {
        const t = this
        const categories = await t.$api.get('/v1/categories')
        if (categories && categories.data) {
          const categoryColumns = []
          const categoryFieldById = {}
          categories.data.results.forEach((item, index) => {
            const categoryId = item.id || item._id || `unknown_${index}`
            const label = _.get(item, 'name.zh', '').trim() || `未命名分類 ${index + 1}`
            const fieldKey = this.getCategoryFieldKey(categoryId)

            categoryColumns.push({
              id: categoryId,
              label,
              fieldKey
            })
            categoryFieldById[String(categoryId)] = fieldKey
          })

          this.categoryColumns = categoryColumns
          this.categoryFieldById = categoryFieldById
        }
      } catch (e) {
        console.log(e)
      }
    },

    mapSalesRow(item) {
      const cat = {}
      item.catSummary.forEach(catStat => {
        const categoryId = _.get(catStat, 'category.id') || _.get(catStat, 'category._id')
        const fieldKey = categoryId ? this.categoryFieldById[String(categoryId)] : ''

        if (fieldKey) {
          cat[fieldKey] = catStat.quantity
        }
      })
      return {...item, ...cat}
    },

    async exportExcel() {
      if (!this.exportMonth) return
      const t = this
      t.exporting = true
      try {
        if (!t.categoryColumns.length) {
          await t.getCategories()
        }

        const rows = []
        let page = 1
        let keepGoing = true
        while (keepGoing) {
          const sales = await t.$api.get('/v1/sales', {
            params: {reportType: 'daily', limit: 100, page, sortBy: 'date:desc'}
          })
          const results = _.get(sales, 'data.results') || []
          if (!results.length) break

          results.forEach(item => {
            const rowMonth = moment(item.date).format('YYYY-MM')
            if (rowMonth === t.exportMonth) {
              rows.push(t.mapSalesRow(item))
            } else if (rowMonth < t.exportMonth) {
              keepGoing = false
            }
          })

          if (page >= _.get(sales, 'data.totalPages', page)) keepGoing = false
          page++
        }

        if (!rows.length) {
          t.$notify({title: '沒有數據', message: `${t.exportMonth} 月份沒有銷售數據`, type: 'warning'})
          return
        }

        rows.sort((a, b) => a.date < b.date ? -1 : 1)

        const aoa = [[
          '日期', '營業額', '訂單量', '產品數量',
          ...t.categoryColumns.map(col => col.label),
          '送貨', '自取', '平均每單', '會員訂單', '非會員訂單', '未完成訂單', '取消訂單'
        ]]
        rows.forEach(row => {
          aoa.push([
            `${row.date} (${t.weekdays[moment(row.date).format('dddd').substring(0, 3)]})`,
            row.turnover,
            row.orders,
            row.quantity,
            ...t.categoryColumns.map(col => row[col.fieldKey] || 0),
            _.get(row, 'deliveryTypeCtn.delivery', 0),
            _.get(row, 'deliveryTypeCtn.pickup', 0),
            row.orders ? Number((row.turnover / row.orders).toFixed(1)) : 0,
            row.memberOrders,
            row.nonMemberOrders,
            row.incompleteOrders,
            row.cancelledOrders,
          ])
        })

        const productAoa = [['日期', '類別', '產品', '售價', '數量']]
        rows.forEach(row => {
          const dateLabel = `${row.date} (${t.weekdays[moment(row.date).format('dddd').substring(0, 3)]})`
          const items = _.sortBy(row.skuSellingPrice || [], [
            item => _.get(item, 'product.category.name.zh', ''),
            item => _.get(item, 'product.name.zh', '')
          ])
          items.forEach(item => {
            productAoa.push([
              dateLabel,
              _.get(item, 'product.category.name.zh', ''),
              _.get(item, 'product.name.zh', ''),
              item.price || '',
              item.quantity || 0,
            ])
          })
        })

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), '業積表')
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(productAoa), '產品統計')
        XLSX.writeFile(wb, `業積表_${t.exportMonth}.xlsx`)
        t.$notify({title: '成功', message: '匯出成功', type: 'success'})
      } catch (e) {
        console.log(e)
        t.$notify({title: '錯誤', message: '匯出失敗', type: 'error'})
      } finally {
        t.exporting = false
      }
    },

    debounceData: _.debounce(async function () {
      const t = this
      try {
        const params = _.omitBy(t.filters, val => !val)
        if (this.sort.order) {
          params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
        }
        const sales = await t.$api.get('/v1/sales', {params})
        if (sales && sales.data) {
          sales.data.results = sales.data.results.map(item => this.mapSalesRow(item))
          t.result = sales.data
        }
      } catch (e) {
        console.log(e)
      } finally {
        t.loading = false
      }
    }, 1000)
  },
  data() {
    return {
      reportTypeSelect: [{label: '每日', value: 'daily'}, {label: '每星期', value: 'weekly'},
        {label: '每月', value: 'monthly'}, {label: '每年', value: 'yearly'}],
      loading: false,
      exporting: false,
      exportMonth: moment().format('YYYY-MM'),
      sort: {prop: 'date', order: 'descending'},
      filters: {
        reportType: 'daily',
        status: '',
        limit: 100,
        page: 1,
      },
      weekdays: {
        Mon: '一',
        Tue: '二',
        Wed: '三',
        Thu: '四',
        Fri: '五',
        Sat: '六',
        Sun: '日',
      },
      categoryColumns: [],
      categoryFieldById: {},
      result: {
        limit: 0,
        page: 0,
        total: 0,
        totalResults: 0,
        totalPages: 0,
        results: []
      },
      header: [],
      moment
    }
  }
}
</script>
