<template>
  <div>
    <table id="tbl_exporttable_to_xls" style="display:none" border="1">
      <tr>
        <td colspan="18">MyFridge -> 新夏暉批量導入訂單</td>
      </tr>
      <tr>
        <td colspan="18">【特别说明】<br>
          1. 標*為必填項。<br>
          2. 每次導入限制100条收件人信息。<br>
          3. 手機號碼和固網號電話必須填寫一個。<br>
          4. 每票重量上限≤ 20Kg。如超過20Kg，請致電客服熱線(852) 2731 2300 聯絡。<br>
          5. 代收貨款：如欲了解代收貨款詳情，請致電客服熱線查詢。
        </td>
      </tr>
      <tr>
        <td>序號</td>
        <td>*姓名</td>
        <td>公司名稱</td>
        <td>*手機號碼</td>
        <td>固網電話</td>
        <td>地區</td>
        <td>區域</td>
        <td>*詳細地址</td>
        <td>*冷運產品</td>
        <td>*溫區</td>
        <td>*重量</td>
        <td>參考派送時間</td>
        <td>托寄物類別</td>
        <td>*申報價值(HKD)</td>
        <td>寄方訂單號</td>
        <td>寄方備註</td>
        <td>*訂單類型</td>
        <td>*派送日期</td>
      </tr>
      <tr v-for="(order, index) in data || []" :key="index">
        <td>{{ index + 1 }}</td>
        <td>{{ order.recipient }}</td>
        <td></td>
        <td>{{ order.phone }}</td>
        <td></td>
        <td>{{ order.district }}</td>
        <td>{{ order.subDistrict }}</td>
        <td>{{ order.fullAddress }}</td>
        <td>香港冷運到家≤60cm</td>
        <td>急凍類（-18℃ — -15℃ ）</td>
        <td>5</td>
        <td>{{ order.deliveryTimeSlot }}</td>
        <td>肉類</td>
        <td>400</td>
        <td>{{ order.orderNumber }}</td>
        <td>{{ order.orderNumber }},數量: {{ getOrderTotalItemCnt(order.items) }},送貨日: {{ order.deliveryDay }}</td>
        <td>次日達</td>
        <td>{{ moment(order.deliveryDay).format('YYYY/M/D') }}</td>
      </tr>
    </table>
  </div>
</template>
<script>
import moment from 'moment'
import _      from "lodash";

export default {
  props : ['data'],
  data () {
    return {
      moment,
    }
  },
  methods : {
    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
    },
    ExportToExcel (day) {
      if (this.data.length) {
        var elt = document.getElementById('tbl_exporttable_to_xls');
        var wb = XLSX.utils.table_to_book(elt, { sheet : "sheet1", raw : true });
        return XLSX.writeFile(wb, 'sf' + (day || moment().format('YYYY-MM-DD')) + '.xlsx')
      }
    },
  }
}
</script>
