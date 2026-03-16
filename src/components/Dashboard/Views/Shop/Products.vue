<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getProducts" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-lg-8 col-12 row">
          <div class="col-lg-3 col-12">
            <fg-input label="類別">
              <el-select size="small"
                         class="select-normal"
                         v-model="filters.category">
                <el-option v-for="option in categories"
                           :value="option.id"
                           :label="option.name.zh"
                           :key="option.id">
                </el-option>
              </el-select>
            </fg-input>
          </div>
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
        <div class="col-lg-4 col-12 d-flex flex-wrap">
          <div class="col-12 pb-2 text-right">
            <el-button type="danger" @click="changePriceOfCurrentProductList()">改更當前所有商品折扣價錢</el-button>
          </div>
          <div class="col-12 d-flex text-right">
            <div class="mr-3">
              <el-button @click="openProductDetail()">＋建立新產品</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getProducts"
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
              <img width="80" @click.stop="openProductDetail(scope.row.id)" v-if="scope.row.images[0]" :src="scope.row.images[0].small.path"></img>
              <span v-else>[沒有圖片]</span>
            </template>
          </el-table-column>
          <el-table-column label="產品" min-width="200">
            <template #default="scope">
              <div>{{ scope.row.name.zh }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="internalName"
                           label="縮寫">
          </el-table-column>
          <el-table-column label="類別"
                           prop="category">
            <template #default="scope">
              <div>{{ scope.row.category.name.zh }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="price"
                           sortable
                           label="價錢">
          </el-table-column>
          <el-table-column prop="discountPrice"
                           sortable
                           min-width="100"
                           label="折扣價錢">
          </el-table-column>
          <el-table-column prop="publish"
                           sortable
                           label="發佈" min-width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.publish"
                         @change="changePublish(scope.row.id, $event)"
                         active-color="#13ce66"
                         inactive-color="#ff4949">
              </el-switch>
              {{ scope.row.publish ? '已發佈' : '未發佈' }}
            </template>
          </el-table-column>
          <el-table-column prop="soldOut"
                           sortable
                           label="售罄狀態" min-width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.soldOut"
                         @change="changeSoldOut(scope.row.id, $event)"
                         active-color="#ff4949"
                         inactive-color="#13ce66">
              </el-switch>
              {{ scope.row.soldOut ? '已售罄' : '可購買' }}
            </template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" align="right" label="">
            <template #default="scope">
              <p-button type="success" icon @click.stop="openProductDetail(scope.row.id)">
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
    <ProductDetail ref="ProductDetail"></ProductDetail>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
    <BulkUpdateProductPriceModal ref="BulkUpdateProductPriceModal"></BulkUpdateProductPriceModal>
  </div>
</template>

<script>
import {Slider, Tag, Input, Button, Select, Option, Switch, Loading, Table, TableColumn} from 'element-ui'
import PSwitch
                                                                                         from 'src/components/UIComponents/Switch.vue'
import PPagination
                                                                                         from 'src/components/UIComponents/Pagination.vue'
import moment                                                                            from 'moment'
import _                                                                                 from 'lodash'
import ProductDetail
                                                                                         from './components/ProductDetail'
import ConfirmDialog
                                                                                         from "@/components/Dashboard/Views/Components/ConfirmDialog";
import BulkUpdateProductPriceModal
                                                                                         from "@/components/Dashboard/Views/Shop/components/BulkUpdateProductPriceModal";

export default {
  name       : "Products",
  components : {
    [Select.name]      : Select,
    [Option.name]      : Option,
    [Button.name]      : Button,
    [Switch.name]      : Switch,
    [Table.name]       : Table,
    [TableColumn.name] : TableColumn,
    PSwitch,
    PPagination,
    ProductDetail,
    ConfirmDialog,
    BulkUpdateProductPriceModal
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getProducts()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getProducts()
      }
    },
  },

  created () {
    this.getCategories()
    this.getProducts()
  },

  methods : {
    async changePriceOfCurrentProductList () {
      try {
        // const confirmation = await this.$refs.ConfirmDialog.open(`一次過更改折扣價錢`, `你確定一次過更改當前顯示商品(${this.result.results.length}件貨)折扣價錢嗎？`)
        // if (confirmation.isConfirmed) {
        const bulkUpdateDialog = await this.$refs.BulkUpdateProductPriceModal.open(this.result.results)
        if (bulkUpdateDialog) {
          await this.getProducts()
        }
        // }
      } catch (e) {
        console.log(e)
      }
    },

    sortChange ({ prop, order }) {
      this.sort = { prop, order }
    },

    async openProductDetail (productId) {
      const result = await this.$refs.ProductDetail.open(productId)
      if (result) {
        //DO STH
        this.getProducts()
      }
    },

    async changeSoldOut (productId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/products/' + productId, { soldOut : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    async changePublish (productId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/products/' + productId, { publish : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    async getCategories () {
      try {
        const categories = await this.$api.get('/v1/categories')
        categories.data.results.forEach(item => {
          this.categories.push({ id : item.id, name : item.name })
        })
      } catch (e) {
        console.log(e)
      } finally {

      }
    },

    getProducts () {
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
        const products = await t.$api.get('/v1/products', { params })
        if (products && products.data) {
          t.result = products.data
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
      publishStatus : [{ label : '全部', value : '' }, { label : '已發佈', value : 'published' },
        { label : '未發佈', value : 'unpublished' }, { label : '已移除', value : 'archived' }],
      categories    : [{ id : '', name : { zh : '全部', en : 'all' } }],
      loading       : false,
      sort          : { prop : 'orderNumber', order : 'descending' },
      filters       : {
        search   : '',
        category : '',
        status   : '',
        limit    : 100,
        page     : 1
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
