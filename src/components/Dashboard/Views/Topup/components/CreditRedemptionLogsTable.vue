<template>
  <div>
    <el-dialog :title="'領取詳情: ' + creditRedemption && creditRedemption.name && creditRedemption.name.zh? creditRedemption.name.zh: '...'"
               :visible.sync="dialogVisible"
               @close="close"
               fullscreen>
      <div class="row">
        <div class="col-12">
          <el-table v-loading="loading"
                    empty-text="load緊，唔好急…"
                    :data="result.results"
                    :default-sort="this.sort"
                    header-row-class-name="text-primary">
            <el-table-column prop="email"
                             label="用戶">
              <template #default="scope">
                <div @click.stop="openUserProfile(scope.row.redeemedBy.id)" class="text-success">{{ scope.row.redeemedBy.email }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="credits"
                             label="積分">
            </el-table-column>
            <el-table-column label="領取時間" prop="createdAt" sortable>
              <template #default="scope">
                <div>{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
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
      <span slot="footer" class="dialog-footer">
      <el-button @click="close">關閉</el-button>
    </span>
    </el-dialog>
    <UserProfile ref="UserProfile"></UserProfile>
  </div>
</template>
<script>
import moment            from 'moment'
import _                 from "lodash";
import {Dialog, Button}  from "element-ui";
import OrderRecordsTable from "@/components/Dashboard/Views/Voucher/components/OrderRecordsTable";
import PPagination       from "@/components/UIComponents/Pagination";
import UserProfile       from "@/components/Dashboard/Views/Pages/UserProfile";

export default {
  components : {
    [Button.name] : Button,
    [Dialog.name] : Dialog,
    OrderRecordsTable,
    PPagination,
    UserProfile,
  },
  data () {
    return {
      moment,
      loading          : false,
      dialogVisible    : false,
      resolve          : null,
      reject           : null,
      creditRedemption : {},
      sort             : { prop : 'createdAt', order : 'descending' },

      filters : {
        search : '',
        limit  : 50,
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
    }
  },
  methods : {
    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },
    getStatusClass (status) {
      switch (status) {
        case 'Offline':
          return 'text-muted'
        case 'Available':
          return 'text-success'
        case 'Busy':
          return 'text-danger'
        default:
          return 'text-success'
      }
    },

    async open (creditRedemption) {
      this.creditRedemption = creditRedemption
      this.dialogVisible = true
      const logs = await this.$api.get('/v1/creditRedemptions/logs/' + creditRedemption.id)
      if (logs.data) {
        this.result = logs.data
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
    },

    close () {
      this.dialogVisible = false
      this.result = {

        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      }
      this.resolve(false)
    },
  }
}

</script>
<style>

</style>
