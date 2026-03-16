<template>
  <div>
    <el-dialog :title="'優惠碼訂單詳情: ' + voucher.code + '('+voucher.name.zh+')'"
               :visible.sync="dialogVisible"
               @close="close"
               fullscreen>
      <div class="row">
        <div class="col-12">
          <template v-if="orders.length">
            <OrderRecordsTable :data="orders"></OrderRecordsTable>
          </template>
          <h5 v-else>資料加載中...</h5>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="close">關閉</el-button>
    </span>
    </el-dialog>
    <OrderDetail ref="OrderDetail"></OrderDetail>
  </div>
</template>
<script>
import moment            from 'moment'
import _                 from "lodash";
import OrderDetail       from "@/components/Dashboard/Views/Orders/OrderDetail";
import {Dialog, Button}  from "element-ui";
import OrderRecordsTable from "@/components/Dashboard/Views/Voucher/components/OrderRecordsTable";

export default {
  components : {
    [Button.name] : Button,
    [Dialog.name] : Dialog,
    OrderDetail,
    OrderRecordsTable
  },
  data () {
    return {
      moment,
      orders        : [],
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      voucher       : {
        name : { zh : '' }
      }
    }
  },
  methods : {
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
    async open (voucher) {
      this.dialogVisible = true

      const orders = await this.$api.get(`/v1/vouchers/${ voucher.id }/orders`)
      this.voucher = voucher
      if (orders.data) {
        this.orders = orders.data
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
      this.resolve(false)
      this.orders = []
      this.voucher = {
        name : { zh : '' }
      }
    },

    async openDetail (orderNumber) {
      const result = await this.$refs.OrderDetail.open(orderNumber)
      if (result) {
        //DO STH
      }
    },
  }
}

</script>
<style>

</style>
