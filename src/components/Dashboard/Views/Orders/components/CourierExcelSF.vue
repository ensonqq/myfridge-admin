<template>
  <div>
    <table id="tbl_exporttable_to_xls_sf" style="display:none" border="1">
      <tr>
        <td>*客戶訂單號</td>
        <td>*寄件方姓名</td>
        <td>寄件方手機號</td>
        <td>寄件方固定電話</td>
        <td>*寄件方詳細地址</td>
        <td>寄件方縣/區</td>
        <td>*寄件方城市</td>
        <td>*寄件方州/省</td>
        <td>*寄件方國家/地區</td>
        <td>*寄件方郵編</td>
        <td>寄件方郵箱</td>
        <td>寄件類型</td>
        <td>寄件方公司</td>
        <td>*收件方姓名</td>
        <td>收件方手機號</td>
        <td>收件方固定電話</td>
        <td>*收件方詳細地址</td>
        <td>道路名</td>
        <td>建築編號</td>
        <td>收件方縣/區</td>
        <td>*收件方城市</td>
        <td>*收件方州/省</td>
        <td>*收件方國家/地區</td>
        <td>*收件方郵編</td>
        <td>收件方郵箱</td>
        <td>收件類型</td>
        <td>收件方公司</td>
        <td>*商品名稱</td>
        <td>*商品數量</td>
        <td>*單位</td>
        <td>*商品單價</td>
        <td>*包裹總件數</td>
        <td>*總重量</td>
        <td>長度單位</td>
        <td>長</td>
        <td>寬</td>
        <td>高</td>
        <td>*商品貨幣</td>
        <td>*快件類型</td>
        <td>附加服務1</td>
        <td>附加服務1代收貨款卡號</td>
        <td>附加服務1內容</td>
        <td>附加服務2</td>
        <td>附加服務2內容</td>
        <td>附加服務3</td>
        <td>*寄件方式</td>
        <td>預約時間</td>
        <td>運單備註</td>
        <td>*付款方式</td>
        <td>月結卡號</td>
        <td>PO Number</td>
      </tr>
      <tr>
        <td colspan="51">MyFridge -> 順豐冷運批量導入訂單</td>
      </tr>
      <tr v-for="(order, index) in data || []" :key="index">
        <td>{{ order.orderNumber }}</td>
        <td>MyFridge</td>
        <td></td>
        <td>55703607</td>
        <td>葵涌華發工業大廈5樓503室</td>
        <td></td>
        <td>葵涌</td>
        <td>葵青區</td>
        <td>中國香港</td>
        <td>00852</td>
        <td>info@myfridge.com</td>
        <td>公司件</td>
        <td>Lean And Fresh Limited</td>
        <td>{{ order.recipient }}</td>
        <td>{{ order.phone }}</td>
        <td></td>
        <td>{{ order.fullAddress }}{{ order.deliveryType === 'pickup' ? `^${ order.pickupLocationCode }^` : '' }}</td>
        <td></td>
        <td></td>
        <td></td>
        <td>{{ order.subDistrict }}</td>
        <td>{{ order.district }}</td>
        <td>中國香港</td>
        <td>00852</td>
        <td></td>
        <td>個人件</td>
        <td></td>
        <td>即食雞胸</td>
        <td>{{ getTotalQuantity(order.items) }}</td>
        <td>bag</td>
        <td>30</td>
        <td>1</td>
        <td>5</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>HKD</td>
        <td>溫控配送上門</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>自行聯系快遞員或自寄</td>
        <td>{{ moment(order.deliveryDay).format('YYYY/MM/DD') }} {{ getTimeSlotFormat(order.deliveryTimeSlot) }}</td>
        2021/01/22 18:30
        <td>上門:急凍-15至-18度，{{ order.deliveryDay }}</td>
        <td>寄付</td>
        <td>8526895366</td>
        <td></td>
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
    getTimeSlotFormat (deliveryTimeSlot) {
      //  ['A: 09:00-13:00', 'B: 13:00-17:00', 'C: 17:00-19:00', 'D: 09:00-19:00', 'E: 09:00-18:00']
      const firstSplit = deliveryTimeSlot.split(': ')
      const secondSplit = firstSplit[1].split('-')
      return secondSplit[0]
    },
    getTotalQuantity (items) {
      return _.sumBy(items, function (item) {
        return item.quantity
      })
    },
    getOrderTotalItemCnt (items) {
      return _.sumBy(items, function (o) {
        return o.quantity
      });
    },
    ExportToExcel (day) {
      if (this.data.length) {
        var elt = document.getElementById('tbl_exporttable_to_xls_sf');
        var wb = XLSX.utils.table_to_book(elt, { sheet : "sheet1", raw : true });
        return XLSX.writeFile(wb, 'sf' + (day || moment().format('YYYY-MM-DD')) + '.xlsx')
      }
    },
  }
}
</script>
