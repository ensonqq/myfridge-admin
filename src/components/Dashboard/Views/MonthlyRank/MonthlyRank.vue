<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }}
        <el-button @click="getMonthlyRank" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>
    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-8 row">
          <div class="col-12 col-lg-5">
            <fg-input label="選擇月份">
              <el-date-picker v-model="month"
                              type="month"
                              value-format="yyyy-MM"
                              placeholder="">
              </el-date-picker>
            </fg-input>
          </div>
        </div>
      </div>

      <div class="col-sm-12">
        <el-table v-loading="loading"
                  empty-text="load緊，唔好急…"
                  :data="result"
                  :default-sort="{ prop : 'totalSpent', order : 'descending' }"
                  header-row-class-name="text-primary">
          <el-table-column type="index"></el-table-column>
          <el-table-column label="電話" prop="phone" min-width="100">
            <template #default="scope">
              <div>
                <a :href="'https://wa.me/+852' + scope.row.phone" target="_blank">
                  {{ scope.row.phone }}
                </a>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="名稱" prop="recipient" min-width="100"></el-table-column>
          <el-table-column label="持有帳號(s)" prop="accs" min-width="300">
            <template #default="scope">
              <ol>
                <li v-for="acc in scope.row.accs">
                  <div class="text-success" @click.stop="openUserProfile(acc.id)">
                    {{ acc.email }}
                  </div>
                </li>
              </ol>
            </template>
          </el-table-column>
          <el-table-column label="本月總數量" sortable prop="totalSkus" min-width="120">
            <template #default="scope">
              <b>總數: {{ scope.row.totalSkus }}件</b>
              <div v-for="cat in scope.row.catSummary">{{ cat.name }}: {{ cat.quantity }}</div>
            </template>
          </el-table-column>
          <el-table-column label="本月總訂單" sortable prop="totalOrders"></el-table-column>
          <el-table-column label="本月總銷費" sortable prop="totalSpent"></el-table-column>
          <el-table-column label="相關訂單" sortable min-width="220" prop="orders">
            <template #default="scope">
              <ol>
                <li v-for="orderNumber in scope.row.orders">
                  <div class="text-success" @click.stop="openDetail(orderNumber)">
                    {{ orderNumber }}
                  </div>
                </li>

              </ol>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
    <UserProfile ref="UserProfile"></UserProfile>
    <OrderDetail ref="OrderDetail"></OrderDetail>
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
import UserProfile
                                                                                 from "@/components/Dashboard/Views/Pages/UserProfile";
import OrderDetail
                                                                                 from '@/components/Dashboard/Views/Orders/OrderDetail.vue'

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "Categories",
  components : {
    [Select.name]     : Select,
    [Option.name]     : Option,
    [Button.name]     : Button,
    [Switch.name]     : Switch,
    [Table.name]      : Table,
    [DatePicker.name] : DatePicker,
    PSwitch,
    PPagination,
    ConfirmDialog,
    UserProfile,
    OrderDetail
  },
  computed   : {
    ...mapState(['user'])
  },
  watch      : {
    month () {
      this.getMonthlyRank()
    },
  },

  created () {
    this.getMonthlyRank()
  },

  methods : {
    async openDetail (orderNumber) {
      const result = await this.$refs.OrderDetail.open(orderNumber)
      if (result) {
        //DO STH
      }
    },

    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
    getMonthlyRank () {
      this.loading = true
      this.result = []
      this.debounceData()
    },

    debounceData : _.debounce(async function () {
      const t = this
      try {
        const monthlyRank = await t.$api.get('/v1/orders/monthlyRank', { params : { month : this.month } })
        t.result = monthlyRank.data
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
      month   : moment().format('YYYY-MM'),
      result  : [],
    }
  }
}
</script>
