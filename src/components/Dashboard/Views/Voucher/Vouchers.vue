<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getVouchers" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-lg-8 col-12 row align-items-end">
          <div class="col-lg-3 col-12">
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
          <div class="col-lg-2 col-6">
            <fg-input>
              <p-checkbox v-model="filters.kolUser">KOL優惠碼</p-checkbox>
            </fg-input>
          </div>
          <!--          <div class="col-lg-2 col-6">-->
          <!--            <fg-input>-->
          <!--              <p-checkbox :disabled="!filters.kolUser" v-model="unsigned">只顯示未簽約</p-checkbox>-->
          <!--            </fg-input>-->
          <!--          </div>-->
        </div>

        <div class="col-lg-4 col-12">
          <div class="pull-right d-flex">
            <div class="mr-3">
              <el-button @click="openVoucherDetail()">＋建立新優惠碼</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getVouchers"
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

          <el-table-column label="優惠碼" sortable prop="code" min-width="150">
            <template #default="scope">
              <div class="text-success" v-if="scope.row.kolUser" @click.stop="openVoucherDetail(scope.row.id)">{{ scope.row.code }}
                <b class="text-danger">(KOL)</b>
              </div>
              <div v-else @click.stop="openVoucherDetail(scope.row.id)">{{ scope.row.code }}</div>
            </template>
          </el-table-column>

          <!--          <el-table-column label="所屬用戶" min-width="200">-->
          <!--            <template #default="scope">-->
          <!--              <div class="text-success" v-if="scope.row.kolUser" @click.stop="openUserProfile(scope.row.kolUser.id)">{{ scope.row.kolUser.name }}, {{ scope.row.kolUser.email }}-->
          <!--              </div>-->
          <!--              <div v-else>&#45;&#45;</div>-->
          <!--            </template>-->
          <!--          </el-table-column>-->

          <el-table-column label="前台名稱" min-width="100">
            <template #default="scope">
              {{ moment().isAfter(moment(scope.row.endAt)) ? '(已過期)' : '' }}
              <template v-if="scope.row.name">{{ scope.row.name.zh }}</template>
              <template v-else>--</template>
            </template>
          </el-table-column>

          <el-table-column label="折扣詳情" prop="type" min-width="100">
            <template #default="scope">
              <template v-if="scope.row.type === 'percent'">
                打折：
                -{{ scope.row.value * -1 }}%
              </template>
              <template v-else-if="scope.row.type === 'fixed'">
                實扣：
                -${{ scope.row.value * -1 }}
              </template>
              <template v-else>
                {{ scope.row.type }}, {{ scope.row.value }}
              </template>
            </template>
          </el-table-column>

          <el-table-column prop="startAt"
                           sortable
                           label="生效日" min-width="150">
            <template #default="scope">
              {{ moment(scope.row.startAt).format('YY年M月D') }} 至 {{ moment(scope.row.endAt).format('YY年M月D') }}
            </template>
          </el-table-column>

          <el-table-column prop="kolContracts"
                           label="合約期(只限KOL)" min-width="220">
            <template #default="scope">
              <ol type="1" v-if="scope.row.kolContracts && scope.row.kolContracts.length">
                <li v-for="(contract,index) in scope.row.kolContracts" :key="index">
                  <div :class="[moment(contract.endAt).isBefore(moment())? 'text-gray' : contract.signed? 'text-success':'text-danger']">
                    {{ moment(contract.startAt).format('YY年M月D') }} - {{
                      moment(contract.endAt).format('YY年M月D')
                    }}
                    <span>
                    {{ contract.signed ? '(已簽)' : '(未簽)' }}
                    </span>
                    <span>
                    {{
                        moment(contract.endAt).isBefore(moment()) ? '(完約)' : contract.signed ? '(進行中)' : '(等待中)'
                      }}
                    </span>
                  </div>
                </li>
              </ol>
              <div v-else>--</div>
            </template>
          </el-table-column>

          <el-table-column prop="usageCnt"
                           sortable
                           label="使用量" min-width="100">
          </el-table-column>

          <el-table-column label="MOV及MOQ" min-width="150">
            <template #default="scope">
              <div v-if="scope.row.moq"><b>最低訂購量MOQ:</b> {{ scope.row.moq }}</div>
              <div v-if="scope.row.mov"><b>最低銷費MOV:</b> {{ scope.row.mov }}</div>
              <div v-if="!scope.row.mov && !scope.row.moq">沒有限制</div>
            </template>
          </el-table-column>

          <el-table-column sortable
                           label="剩餘次數" min-width="120">
            <template #default="scope">
              {{ scope.row.limited ? scope.row.availableUsageCnt : '無限' }}
            </template>
          </el-table-column>

          <el-table-column label="總收額" sortable prop="turnover" min-width="100">
            <template #default="scope">
              {{ scope.row.turnover || 0 }}
            </template>
          </el-table-column>

          <el-table-column sortable
                           prop="createdAt"
                           label="建立日" min-width="150">
            <template #default="scope">{{ moment(scope.row.createdAt).format('YYYY-MM-DD') }}</template>
          </el-table-column>

          <el-table-column prop="publish"
                           sortable
                           label="發佈" min-width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.active"
                         @change="changeActive(scope.row.id, $event)"
                         active-color="#13ce66"
                         inactive-color="#ff4949">
              </el-switch>
              {{ scope.row.active ? '已發佈' : '未發佈' }}
            </template>
          </el-table-column>
          <el-table-column class-name="action-buttons td-actions" label="" min-width="110">
            <template #default="scope">
              <p-button type="success" icon @click.stop="openVoucherDetail(scope.row.id)">
                <i class="fa fa-edit" aria-hidden="true"></i>
              </p-button>
              <p-button type="success" icon @click.stop="openVoucherOrders(scope.row)">
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
          {{ result.totalPages }}
          <p-pagination class="pull-right"
                        v-model="filters.page"
                        :per-page="result.limit"
                        :total="result.totalResults">
          </p-pagination>
        </div>
      </div>
    </div>
    <VoucherDetail ref="VoucherDetail"></VoucherDetail>
    <VoucherOrderRecords ref="VoucherOrderRecords"></VoucherOrderRecords>
    <UserProfile ref="UserProfile"></UserProfile>
  </div>
</template>

<script>
import {Button, Select, Option, Switch, Loading, Table, TableColumn} from 'element-ui'
import Vue                                                           from 'vue'
import PSwitch                                                       from 'src/components/UIComponents/Switch.vue'
import PPagination                                                   from 'src/components/UIComponents/Pagination.vue'
import moment                                                        from 'moment'
import _                                                             from 'lodash'
import VoucherDetail                                                 from './components/VoucherDetail'
import VoucherOrderRecords                                           from './components/VoucherOrderRecord'
import UserProfile
                                                                     from "@/components/Dashboard/Views/Pages/UserProfile";

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "Vouchers",
  components : {
    [Select.name] : Select,
    [Option.name] : Option,
    [Button.name] : Button,
    [Switch.name] : Switch,
    [Table.name]  : Table,
    PSwitch,
    PPagination,
    VoucherDetail,
    VoucherOrderRecords,
    UserProfile,
  },
  watch      : {
    filters : {
      deep    : true,
      handler : function () {
        this.getVouchers()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getVouchers()
      }
    },
  },

  created () {
    this.getVouchers()
  },

  methods : {
    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
    sortChange ({ prop, order }) {
      this.sort = { prop, order : order }
    },

    getPaidTotal (orders) {
      return _.sumBy(orders, function (o) {
        return o.payment.paymentStatus === 'completed' ? o.paidTotal : 0
      });
    },

    async openVoucherDetail (voucherId) {
      const result = await this.$refs.VoucherDetail.open(voucherId)
      if (result) {
        //DO STH
        this.getVouchers()
      }
    },

    async openVoucherOrders (voucher) {
      const result = await this.$refs.VoucherOrderRecords.open(voucher)
      if (result) {
        //DO STH
      }
    },

    async changeActive (voucherId, val) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.patch('/v1/vouchers/' + voucherId, { active : val })
        if (result) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
        }
      } catch (e) {
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        loading.close()
      }
    },

    getVouchers () {
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
        const vouchers = await t.$api.get('/v1/vouchers', { params })
        if (vouchers && vouchers.data) {
          t.result = vouchers.data
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
      vouchers     : [{ id : '', name : { zh : '全部', en : 'all' } }],
      loading      : false,
      sort         : { prop : 'createdAt', order : 'descending' },

      filters : {
        search   : '',
        status   : '',
        unsigned : false,
        kolUser  : false,
        limit    : 100,
        page     : 1,
      },
      result  : {
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
