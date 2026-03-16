<template>
  <div>
    <table id="tbl_exporttable_to_xls2" style="display: none" border="1">
      <tr>
        <td>訂單號碼</td>
        <td>會員名稱</td>
        <td v-for="header in itemHeaderRow">{{ header.name }}</td>
        <td>件數</td>
      </tr>
      <tr v-for="(row, index) in table" :key="index">
        <td>{{ row.orderNumber }}</td>
        <td>{{ row.recipient }}</td>
        <td v-for="product in row.items">{{ product.quantity || '/' }}</td>
        <td>{{ row.totalQuantity }}</td>
      </tr>
    </table>
  </div>
</template>
<script>
import moment     from 'moment'
import _          from "lodash";
import {Loading}  from "element-ui";
import {mapState} from "vuex";

export default {
  props : ['data'],
  data () {
    return {
      moment,
      itemHeaderRow : {},
      table         : []
    }
  },
  computed : {
    ...mapState(['skuSorting']),
  },
  methods  : {
    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
    },
    getProductsInternalName (id) {
      const find = this.products.filter(item => item.id === id)
      return find[0] ? find[0].internalName : ''
    },
    async getProductList () {
      try {
        const t = this
        const result = await this.$api.get('/v1/products')
        this.products = result.data.results
        const sort = _.reduce(this.skuSorting, (accumulator, value) => {
          return { ...accumulator, [value] : { name : t.getProductsInternalName(value), quantity : 0 } }
        }, {})

        this.itemHeaderRow = sort

        const table = []
        this.data.forEach(order => {
          let orderItems = _.cloneDeep(sort)
          let totalQuantity = 0
          order.items.forEach(item => {
            if (item.product.isBundled) {
              item.product.bundleItems.forEach(bundleItem => {
                orderItems[bundleItem.product.id].quantity += (item.quantity * bundleItem.quantity) || 0
                totalQuantity += item.quantity * bundleItem.quantity || 0
              })
            } else {
              orderItems[item.product.id].quantity += item.quantity || 0
              totalQuantity += item.quantity || 0
            }
          })

          // lucky draw prize
          if (order.prize && order.prize.type === 'item') {
            orderItems[order.prize.product.id].quantity += order.prize.amount || 0
            totalQuantity += order.prize.amount || 0
          }

          // lucky draw prize
          if (order.gift && order.gift.type === 'item') {
            orderItems[order.gift.product.id].quantity += order.gift.amount || 0
            totalQuantity += order.gift.amount || 0
          }

          table.push({
            orderNumber : order.orderNumber, recipient : order.recipient, totalQuantity,
            items       : Object.values(orderItems).map(item => {
              item.quantity = item.quantity ? item.quantity : '/'
              return item
            })
          })
        })
        this.table = table
      } catch (e) {
        console.log(e)
      }
    },

    async ExportToExcel (day) {
      await this.getProductList()
      if (this.data.length) {
        var elt = document.getElementById('tbl_exporttable_to_xls2');
        var wb = XLSX.utils.table_to_book(elt, { sheet : "sheet1", raw : true });
        return XLSX.writeFile(wb, 'Mark數' + (day || moment().format('YYYY-MM-DD')) + '.xlsx')
      }
    },
  }
}
</script>
