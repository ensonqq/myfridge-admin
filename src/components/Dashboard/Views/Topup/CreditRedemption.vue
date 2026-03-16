<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getCreditRedemptions" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-lg-8 col-12 row">
          <div class="col-lg-3 scol-12">
            <fg-input label="發佈狀態">
              <el-select size="small"
                         class="select-normal"
                         v-model="filters.status">
                <el-option v-for="option in activeStatus"
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
            <div class="mr-3">
              <el-button @click="openCreditRedemptionDetail()">＋建立積分卡</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getCreditRedemptions"
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
          <el-table-column class-name="action-buttons td-actions" label="" min-width="45">
            <template #default="scope">
              <p-button type="success" icon @click.stop="openCreditRedemptionDetail(scope.row.id)">
                <i class="fa fa-edit" aria-hidden="true"></i>
              </p-button>
            </template>
          </el-table-column>

          <el-table-column label="名稱" sortable prop="name.zh" min-width="150"></el-table-column>

          <el-table-column label="Url" min-width="240">
            <template #default="scope">
              <a :href="getUrl(scope.row.uniqueId)" target="_blank">
                {{ getUrl(scope.row.uniqueId) }}
              </a>
              <i class="fa fa-copy ml-1" @click="copyUrl(getUrl(scope.row.uniqueId))" aria-hidden="true"> 複製</i>
            </template>
          </el-table-column>

          <el-table-column label="積分值" sortable prop="credits"></el-table-column>

          <el-table-column label="領取上限" sortable prop="maxRedeemQty"></el-table-column>

          <el-table-column label="已領取" sortable prop="redeemQty">
            <template #default="scope">
              {{ scope.row.redeemQty }}/{{ scope.row.maxRedeemQty }}
            </template>
          </el-table-column>

          <el-table-column sortable
                           prop="createdAt"
                           label="建立時間" min-width="150">
            <template #default="scope">{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</template>
          </el-table-column>

          <el-table-column prop="publish"
                           sortable
                           label="發佈" min-width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.publish"
                         @change="changeActive(scope.row.id, $event)"
                         active-color="#13ce66"
                         inactive-color="#ff4949">
              </el-switch>
              {{ scope.row.active ? '已發佈' : '未發佈' }}
            </template>
          </el-table-column>

          <el-table-column label="領取列表" min-width="150">
            <template #default="scope">
              <p-button type="success" icon @click.stop="openCreditRedemptionLogsTable(scope.row)">
                <i class="fa fa-list-alt" aria-hidden="true"></i>
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
    <CreditRedemptionDetail ref="CreditRedemptionDetail"></CreditRedemptionDetail>
    <CreditRedemptionLogsTable ref="CreditRedemptionLogsTable"></CreditRedemptionLogsTable>
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
import CreditRedemptionDetail                                        from './components/CreditRedemption'
import CreditRedemptionLogsTable                                     from './components/CreditRedemptionLogsTable'
import ConfirmDialog                                                 from '../Components/ConfirmDialog'

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "Categories",
  components : {
    [Select.name] : Select,
    [Option.name] : Option,
    [Button.name] : Button,
    [Switch.name] : Switch,
    [Table.name]  : Table,
    PSwitch,
    PPagination,
    CreditRedemptionDetail,
    CreditRedemptionLogsTable,
    ConfirmDialog
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getCreditRedemptions()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getCreditRedemptions()
      }
    },
  },

  created () {
    this.getCreditRedemptions()
  },

  methods : {
    copyUrl (url) {
      navigator.clipboard.writeText(url)
      this.$notify({ title : '成功', message : '已複製', type : 'success', })
    },
    getUrl (uniqueId) {
      const hostname = window.location.hostname
      const local = 'http://localhost:3000'
      const dev = 'https://dev.myfridge.com'
      const prod = 'https://myfridge.com'

      const baseURL = hostname === 'd99oaxxazb.myfridge.com' ? prod : hostname === 'admin-dev.myfridge.com' ? dev : local
      return baseURL + '?cd=' + uniqueId
    },
    sortChange ({ prop, order }) {
      this.sort = { prop, order : order }
    },

    async openCreditRedemptionDetail (creditRedemptionId) {
      const result = await this.$refs.CreditRedemptionDetail.open(creditRedemptionId)
      if (result) {
        //DO STH
        this.getCreditRedemptions()
      }
    },

    async openCreditRedemptionLogsTable (creditRedemption) {
      await this.$refs.CreditRedemptionLogsTable.open(creditRedemption)
    },

    async changeActive (creditRedemptionId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/creditRedemptions/' + creditRedemptionId, { publish : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    getCreditRedemptions () {
      this.loading = true
      this.result.results = []
      this.debounceData()
    },

    debounceData : _.debounce(async function () {
      const t = this
      try {
        const params = _.omitBy(t.filters, val => !val)
        if (this.sort.order) {
          params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
        }
        const creditRedemptions = await t.$api.get('/v1/creditRedemptions', { params })
        if (creditRedemptions && creditRedemptions.data) {
          t.result = creditRedemptions.data
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
      activeStatus      : [{ label : '全部', value : '' }, { label : '已發佈', value : 'published' },
        { label : '未發佈', value : 'unpublished' }],
      creditRedemptions : [{ id : '', name : { zh : '全部', en : 'all' } }],
      loading           : false,
      sort              : { prop : 'createdAt', order : 'descending' },
      filters           : {
        search : '',
        status : '',
        limit  : 100,
        page   : 1,
      },
      result            : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
      moment
    }
  }
}
</script>
