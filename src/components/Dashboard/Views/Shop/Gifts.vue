<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getGifts" class="pull-right"><i class="fa fa-refresh"></i></el-button>
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
              <el-button @click="openGiftDetail()">＋新禮品</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getGifts"
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
              <img width="80" v-if="scope.row.images[0]" :src="scope.row.images[0].small.path"></img>
              <span v-else>[沒有圖片]</span>
            </template>
          </el-table-column>

          <el-table-column label="名稱" sortable prop="name.zh" min-width="200"></el-table-column>
          <el-table-column label="禮品" prop="item" min-width="200">
            <template #default="scope">
              {{ scope.row.item.type === 'item' ? scope.row.item.product.name.zh : scope.row.name.zh }} x{{ scope.row.item.amount }}
            </template>
          </el-table-column>

          <el-table-column label="條件" prop="item" min-width="200">
            <template #default="scope">
              <div v-if="scope.row.rules.total > 0">
                *需購滿${{ scope.row.rules.total }}
              </div>
              <div v-if="scope.row.rules.quantity > 0">
                *需購滿{{ scope.row.rules.quantity }}件貨
              </div>
            </template>
          </el-table-column>

          <el-table-column sortable
                           label="生效期" min-width="150">
            <template #default="scope">
              ({{ moment(scope.row.endAt).diff(moment(scope.row.startAt), 'days') }}日)<br>
              {{ moment(scope.row.startAt).format('YYYY.MM.DD') }}至{{ moment(scope.row.endAt).format('YYYY.MM.DD') }}
            </template>
          </el-table-column>

          <el-table-column sortable
                           prop="createdAt"
                           label="建立時間" min-width="150">
            <template #default="scope">{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</template>
          </el-table-column>

          <el-table-column prop="published"
                           sortable
                           label="發佈" min-width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.published"
                         @change="changeActive(scope.row.id, $event)"
                         active-color="#13ce66"
                         inactive-color="#ff4949">
              </el-switch>
              {{ scope.row.active ? '已發佈' : '未發佈' }}
            </template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" label="" min-width="110">
            <template #default="scope">
              <p-button type="success" icon @click.stop="openGiftDetail(scope.row.id)">
                <i class="fa fa-edit" aria-hidden="true"></i>
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
    <GiftDetail ref="GiftDetail"></GiftDetail>
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
import GiftDetail                                                    from './components/GiftDetail'
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
    GiftDetail,
    ConfirmDialog
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getGifts()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getGifts()
      }
    },
  },

  created () {
    this.getGifts()
  },

  methods : {
    sortChange ({ prop, order }) {
      this.sort = { prop, order : order }
    },

    async openGiftDetail (giftId) {
      const result = await this.$refs.GiftDetail.open(giftId)
      if (result) {
        //DO STH
        this.getGifts()
      }
    },

    async changeActive (giftId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/gifts/' + giftId, { published : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    getGifts () {
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
        const gifts = await t.$api.get('/v1/gifts', { params })
        if (gifts && gifts.data) {
          t.result = gifts.data
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
      activeStatus : [{ label : '全部', value : '' }, { label : '已發佈', value : 'published' },
        { label : '未發佈', value : 'unpublished' }],
      gifts        : [{ id : '', name : { zh : '全部', en : 'all' } }],
      loading      : false,
      sort         : { prop : 'createdAt', order : 'descending' },
      filters      : {
        search : '',
        status : '',
        limit  : 100,
        page   : 1,
      },
      result       : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
      areas        : {
        hk  : '香港',
        kln : '九龍',
        nt  : '新界'
      },
      moment
    }
  }
}
</script>
