<template>
  <div>
    <el-table :data="data"
              empty-text="load緊，唔好急…"
              header-row-class-name="text-primary">
      <el-table-column label="訂單號碼" prop="orderNumber" sortable>
        <template #default="scope">
          <div>{{ scope.row.orderNumber }} <span v-if="scope.row.printed" class="text-danger">(已印)</span></div>
        </template>
      </el-table-column>
      <el-table-column prop="email"
                       label="用戶">
      </el-table-column>
      <el-table-column label="訂單物品">
        <template #default="scope">
          <div v-html="'總數: ' + getOrderTotalItemCnt(scope.row.items)"></div>
          <div v-html="scope.row.items.map(item=> item.quantity + 'x' + item.product.name.zh).join('<br>')"></div>
        </template>
      </el-table-column>
      <el-table-column prop="fullAddress"
                       label="詳細地址">
      </el-table-column>
      <el-table-column label="收貨日" prop="deliveryDay" sortable>
        <template #default="scope">
          <div>{{ scope.row.deliveryDay }}
            <span v-if="scope.row.isWeekEndDelivery" class="text-danger">(末)</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryTimeSlot"
                       sortable
                       label="收貨時段">
      </el-table-column>
      <el-table-column label="優惠碼" width="180">
        <template #default="scope">
          <div>Discount Code:<br>
            <template v-if="scope.row.voucherUsed">code: {{ scope.row.voucherUsed.code }}, {{ scope.row.voucherUsed.name.zh }}, -${{ scope.row.voucherDiscountTotal * -1 }}</template>
            <template v-else>--</template>
          </div>
          <div class="mt-3">Auto Tiers:<br>
            <template v-if="scope.row.autoDiscountTiersAdopted.length">{{
                scope.row.autoDiscountTiersAdopted.map(item => item.desc).join(`\n`)
              }}
            </template>
            <template v-else>--</template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="paidTotal"
                       sortable
                       label="付款">
      </el-table-column>
      <el-table-column label="落單時間" prop="createdAt" sortable>
        <template #default="scope">
          <div>{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
        </template>
      </el-table-column>
      <el-table-column class-name="action-buttons td-actions" align="right">
        <template slot-scope="props">
          <p-button type="success" icon @click.stop="openDetail(props.row.orderNumber)">
            <i class="fa fa-edit" aria-hidden="true"></i>
          </p-button>
        </template>
      </el-table-column>
    </el-table>
    <OrderDetail ref="OrderDetail"></OrderDetail>
  </div>
</template>

<script>
import {Button, Dialog} from "element-ui";
import OrderDetail      from "@/components/Dashboard/Views/Orders/OrderDetail";
import moment           from 'moment'
import _                from "lodash";

export default {
  name       : "OrderRecordsTable",
  props      : ['data'],
  data       : () => ({
    moment
  }),
  components : {
    [Button.name] : Button,
    [Dialog.name] : Dialog,
    OrderDetail
  },
  methods    : {
    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
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

<style scoped>

</style>
