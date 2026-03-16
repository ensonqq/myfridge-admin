<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getCategories" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-lg-8 col-12 row">
          <div class="col-lg-3 col-12">
            <fg-input label="發佈狀態">
              <el-select size="small"
                         class="select-normal"
                         v-model="filters.status">
                <el-option v-for="option in publishStatus"
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
              <el-button @click="openKeyAccountDetail()">＋建立商業客戶</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getCategories"
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
          <el-table-column label="客戶">
            <template #default="scope">
              <div>{{ scope.row.name.zh }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="discount"
                           label="格扣" min-width="200">
            <template #default="scope">
              <!--              <el-switch v-model="scope.row.discountTierEnabled"-->
              <!--                         @change="changeDiscountTierEnabled(scope.row.id, $event)"-->
              <!--                         active-color="#13ce66"-->
              <!--                         inactive-color="#ff4949">-->
              <!--              </el-switch>-->
              <!--              {{ scope.row.discountTierEnabled ? '啟用' : '停用' }}-->
              <!--              <br>-->
              <template v-if="scope.row.discount[0]">
                <div v-for="(item, index) in scope.row.discount" :key="index" :class="{'text-gray': !scope.row.discountTierEnabled}">
                  Tier{{ index + 1 }}: 滿{{ item.quantity }}件每件減${{ item.value * -1 }}
                  <hr class="mt-0 mb-0" v-if="index < scope.row.discount.length - 1">
                </div>
              </template>
              <template v-else>
                <span class="text-danger" :class="{'text-gray': !scope.row.discountTierEnabled}">-未有折扣Tiers</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="skuPrice"
                           label="價錢" min-width="200">
            <template #default="scope">
              {{ scope.row.skuPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="publish"
                           sortable
                           label="狀態" min-width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.publish"
                         @change="changePublish(scope.row.id, $event)"
                         active-color="#13ce66"
                         inactive-color="#ff4949">
              </el-switch>
              {{ scope.row.publish ? '啟用' : '停用' }}
            </template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" label="">
            <template #default="scope">
              <p-button type="success" icon @click.stop="openKeyAccountDetail(scope.row.id)">
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
    <KeyAccountDetail ref="KeyAccountDetail"></KeyAccountDetail>
  </div>
</template>

<script>
import {Button, Select, Option, Switch, Loading, Table, TableColumn} from 'element-ui'
import Vue                                                           from 'vue'
import PSwitch
                                                                     from 'src/components/UIComponents/Switch.vue'
import PPagination
                                                                     from 'src/components/UIComponents/Pagination.vue'
import moment                                                        from 'moment'
import _                                                             from 'lodash'
import KeyAccountDetail                                                from './components/KeyAccountDetail'

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
    KeyAccountDetail
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getCategories()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getCategories()
      }
    },
  },

  created () {
    this.getCategories()
  },

  methods : {
    sortChange ({ prop, order }) {
      this.sort = { prop, order }
    },

    async openKeyAccountDetail (keyAccountId) {
      const result = await this.$refs.KeyAccountDetail.open(keyAccountId)
      if (result) {
        //DO STH
        this.getCategories()
      }
    },

    async changePublish (keyAccountId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/categories/' + keyAccountId, { publish : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    async changeDiscountTierEnabled (keyAccountId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/categories/' + keyAccountId, { discountTierEnabled : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    async changeBuyXGetYFreeEnabled (keyAccountId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/categories/' + keyAccountId, { buyXGetYFreeEnabled : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    getCategories () {
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
        const categories = await t.$api.get('/v1/categories', { params })
        if (categories && categories.data) {
          t.result = categories.data
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
      publishStatus : [{ label : '全部', value : '' }, { label : '啟用', value : 'published' },
        { label : '停用', value : 'unpublished' }],
      categories    : [{ id : '', name : { zh : '全部', en : 'all' } }],
      loading       : false,
      sort          : { prop : 'orderNumber', order : 'descending' },
      filters       : {
        search   : '',
        category : '',
        status   : '',
        limit    : 100,
        page     : 1,
      },
      result        : {
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
