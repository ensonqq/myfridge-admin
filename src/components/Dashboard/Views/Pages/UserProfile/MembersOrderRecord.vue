<template>
  <div class="card pb-5">
    <div class="card-header">
      <h4 class="title">{{ title }}</h4>
    </div>
    <div class="card-body">
      <h5 class="title">購物訂單</h5>
      <el-table :data="orders"
                empty-text="load緊，唔好急…"
                header-row-class-name="text-primary">
        <el-table-column label="訂單號碼" prop="orderNumber" sortable min-width="180">
          <template #default="scope">
            <div>{{ scope.row.orderNumber }} <span v-if="scope.row.printed" class="text-danger">(已印)</span></div>
          </template>
        </el-table-column>
        <el-table-column prop="email"
                         label="用戶" min-width="210">
        </el-table-column>
        <el-table-column label="訂單物品">
          <template #default="scope">
            <template>
              <div v-html="'總數: ' + getOrderTotalItemCnt(scope.row.items)"></div>
              <div v-html="scope.row.items.map(item=> item.quantity + 'x' + item.product.internalName).join('<br>')">
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="fullAddress"
                         label="詳細地址" min-width="300">
        </el-table-column>
        <el-table-column label="收貨日" prop="deliveryDay" sortable min-width="120">
          <template #default="scope">
            <div>{{ scope.row.deliveryDay }} <span v-if="scope.row.isWeekEndDelivery" class="text-danger">(末)</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryTimeSlot"
                         sortable
                         label="收貨時段" min-width="120">
        </el-table-column>
        <el-table-column label="折扣" min-width="200">
          <template #default="scope">
            <div><b>使用積分:</b>
              <template v-if="scope.row.creditsUsed">{{ scope.row.creditsUsed }}</template>
              <template v-else>--</template>
            </div>
            <hr class="my-0">
            <div><b>優惠碼</b>:
              <template v-if="scope.row.voucherUsed">code: {{ scope.row.voucherUsed.code }}, {{ scope.row.voucherUsed.name.zh }}, -${{ scope.row.voucherDiscountTotal * -1 }}</template>
              <template v-else>--</template>
            </div>
            <hr class="my-0">
            <div><b>多買多減</b>:<br>
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
                         label="付款" min-width="150">
          <template #default="scope">
              <span :class="{'text-danger': scope.row.payment.paymentType==='admin'}">
                {{ scope.row.paidTotal }} ({{ scope.row.orderStatus === 'confirmed' ? scope.row.payment.paymentType : '未付款' }})
              </span>
          </template>
        </el-table-column>
        <el-table-column label="落單時間" prop="createdAt" sortable min-width="150">
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

      <h5 class="title mt-5">積分增值</h5>
      <el-table :data="topups"
                empty-text="load緊，唔好急…"
                header-row-class-name="text-primary">
        <el-table-column label="訂單號碼" prop="orderNumber" min-width="250"></el-table-column>
        <el-table-column label="執行者"
                         min-width="180">
          <template #default="scope">
            <div v-if="scope.row.createdBy" class="text-success" @click.stop="openUserProfile(scope.row.createdBy.id)">
              <span v-if="scope.row.createdBy.vipTier === 'gold'" style="color: #f88f02">(金)</span>
              <span v-if="['admin','super'].includes(scope.row.createdBy.role)" style="color: #9d0000">(管)</span>
              {{ scope.row.createdBy.email }}
            </div>
            <div v-else>{{ scope.row.email }}</div>
          </template>
        </el-table-column>
        <el-table-column label="獲取者"
                         min-width="180">
          <template #default="scope">
            <div v-if="scope.row.issuedTo" class="text-success" @click.stop="openUserProfile(scope.row.issuedTo.id)">
              <span v-if="scope.row.issuedTo.vipTier === 'gold'" style="color: #f88f02">(金)</span>
              {{ scope.row.issuedTo.email }}
            </div>
            <div v-else>{{ scope.row.email }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="topupCard.title.zh"
                         label="簡稱">
        </el-table-column>

        <el-table-column label="積分卡" min-width="150">
          <template #default="scope">
            <img width="80" v-if="scope.row.topupCard && scope.row.topupCard.images[0]" @click="openTopupDetail(scope.row.topupCard.id)" :src="scope.row.topupCard.images[0].small.path"></img>
            <span v-else>[沒有圖片]</span>
          </template>
        </el-table-column>
        <el-table-column label="獲得積分" prop="topupValue" min-width="130"></el-table-column>
        <el-table-column label="收款" prop="price" min-width="150" sortable>
          <template #default="scope">
            {{ scope.row.orderStatus !== 'confirmed' ? `(${ orderStatusesMapper[scope.row.orderStatus] })` : '' }}{{ scope.row.payment.paymentType }}:<br>
            <b>${{ scope.row.price }}</b>
          </template>
        </el-table-column>


        <el-table-column label="落單時間" min-width="150" sortable>
          <template #default="scope">
            <div>{{ moment(scope.row.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
          </template>
        </el-table-column>

        <el-table-column class-name="action-buttons td-actions" min-width="100" align="right">
          <template slot-scope="props">
            <div class="d-flex">
              <p-button type="success" icon @click.stop="openTopupDetail(props.row.orderNumber)">
                <i class="fa fa-edit" aria-hidden="true"></i>
              </p-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <OrderDetail ref="OrderDetail"></OrderDetail>
    <TopupOrderDetail ref="TopupOrderDetail"></TopupOrderDetail>
  </div>
</template>
<script>
import {Button}         from 'src/components/UIComponents'
import moment           from 'moment'
import _                from "lodash";
import OrderDetail      from "@/components/Dashboard/Views/Orders/OrderDetail";
import TopupOrderDetail from "@/components/Dashboard/Views/Topup/components/TopupOrderDetail";

export default {
  components : {
    TopupOrderDetail,
    [Button.name] : Button,
    OrderDetail
  },
  props      : ['orders', 'topups'],
  data () {
    return {
      title : '用戶訂單記錄',
      moment
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
    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
    },


    async openTopupDetail (orderNumber) {
      const result = await this.$refs.TopupOrderDetail.open(orderNumber)
      if (result) {
        //DO STH
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
