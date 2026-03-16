<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getPrizeRecords" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-lg-8 col-12 row">
          <div class="col-4 mt-4">
            <el-button type="danger" @click="clearAllRecords()">清除所有抽獎紀錄</el-button>
          </div>
        </div>

        <div class="col-lg-4 col-12">
          <div class="pull-right d-flex">
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getPrizeRecords"
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
          <el-table-column label="圖片">
            <template #default="scope">
              <img width="50" v-if="scope.row.prizeRef.images[0]" :src="scope.row.prizeRef.images[0].small.path"></img>
              <span v-else>[沒有圖片]</span>
            </template>
          </el-table-column>

          <el-table-column label="名稱" min-width="120">
            <template #default="scope">
              {{ scope.row.prizeRef.name.zh }}
            </template>
          </el-table-column>
          <el-table-column label="獎品" min-width="120">
            <template #default="scope">
              <template v-if="scope.row.item.type === 'item'">
                {{ scope.row.item.product.name.zh }}x{{ scope.row.item.amount }}
              </template>
              <template v-else-if="scope.row.item.type==='cash'">${{ scope.row.item.amount }}蚊利是</template>
            </template>
          </el-table-column>

          <el-table-column label="用戶" min-width="120">
            <template #default="scope">
              {{ scope.row.createdBy.email }}
            </template>
          </el-table-column>

          <el-table-column prop="addresses" label="電話" min-width="180">
            <template slot-scope="props">
              <div v-if="props.row.createdBy.addresses.length" v-html="getPhones(props.row.createdBy.addresses).join('<br>')"></div>
              <div v-else>--</div>
            </template>
          </el-table-column>


          <el-table-column sortable
                           prop="createdAt"
                           label="建立時間" min-width="150">
            <template #default="scope">{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" label="" min-width="110">
            <template #default="scope">
              <p-button type="success" icon @click.stop="deleteRecord(scope.row.id)">
                <i class="fa fa-remove" aria-hidden="true"></i>
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
    <PrizeDetail ref="PrizeDetail"></PrizeDetail>
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
import PrizeDetail                                                   from './components/PrizeDetail'
import ConfirmDialog                                                 from '../Components/ConfirmDialog'

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "PrizeRecords",
  components : {
    [Select.name] : Select,
    [Option.name] : Option,
    [Button.name] : Button,
    [Switch.name] : Switch,
    [Table.name]  : Table,
    PSwitch,
    PPagination,
    PrizeDetail,
    ConfirmDialog
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getPrizeRecords()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getPrizeRecords()
      }
    },
  },

  created () {
    this.getPrizeRecords()
  },

  methods : {
    async clearAllRecords () {
      try {
        const confirmation = await this.$refs.ConfirmDialog.open('刪除所有紀錄', '你確定要刪除所有紀錄嗎？')
        if (confirmation.isConfirmed) {
          const result = await this.$api.delete('/v1/prizes/prizeRecords/')
          if (result) {
            this.getPrizeRecords()
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    async deleteRecord (prizeRecordId) {
      try {
        const confirmation = await this.$refs.ConfirmDialog.open('刪除', '你確定要刪除嗎？')
        if (confirmation.isConfirmed) {
          const result = await this.$api.delete('/v1/prizes/prizeRecords/' + prizeRecordId)
          if (result) {
            this.getPrizeRecords()
          }
        }
      } catch (e) {
        console.log(e)
      }
    },

    getPhones (addresses) {
      let phones = addresses.map(address => address.phone)
      phones = _.union(phones);
      return phones
    },

    sortChange ({ prop, order }) {
      this.sort = { prop, order : order }
    },

    async openPrizeDetail (prizeId) {
      const result = await this.$refs.PrizeDetail.open(prizeId)
      if (result) {
        //DO STH
        this.getPrizeRecords()
      }
    },

    getPrizeRecords () {
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
        const prizes = await t.$api.get('/v1/prizes/prizeRecords', { params })
        if (prizes && prizes.data) {
          t.result = prizes.data
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
      prizes  : [{ id : '', name : { zh : '全部', en : 'all' } }],
      loading : false,
      sort    : { prop : 'createdAt', order : 'descending' },
      filters : {
        search : '',
        limit  : 100,
        page   : 1,
      },
      result  : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
      areas   : {
        hk  : '香港',
        kln : '九龍',
        nt  : '新界'
      },
      moment
    }
  }
}
</script>
