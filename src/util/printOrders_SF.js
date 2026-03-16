/**
 * Author: Enson
 * Created At: 2026-03-11
 * Desc: this function returns a pdf "urlstring" to be embed in html
 * ----------------------
 * jsPdf:
 * lib is required, located in /public/static/js/jspdf.debug.js
 * font is required, located in /public/static/js/optmeal-normal.js
 */
import PDFMerger from 'pdf-merger-js/browser';

export default async function (orders, $api) {
  try {
    const merger = new PDFMerger();
    const element = document.querySelector(".el-loading-text")
    const initSpinnerText = element.innerHTML

    // console.log(initSpinnerText)

    for (let orderIndex in orders) {
      const doc = new jsPDF('', 'mm', 'a6');
      doc.deletePage(1);
      doc.setFont('optmeal');

      const order = orders[orderIndex]
      // check duplicated orders, for easy order combines
      const dups = orders.filter(item => {
        return (item.orderNumber !== order.orderNumber) && order.fullAddress === item.fullAddress && order.deliveryDay === item.deliveryDay
      }).map(item => item.orderNumber)
      if (dups.length) {
        order.dups = dups
      }

      doc.addPage();
      //receiver name
      //order id (top)
      // doc.setFontSize(17);
      // if (order.isWeekEndDelivery) {
      //   doc.text('末', 60, 5.5);
      //   doc.circle(62.5, 3.5, 3.5);
      // }
      doc.setFontSize(15.5);
      doc.text(order.orderNumber, 1, 5.5);

      //delivery date
      const _deliveryDay = new Date(order.deliveryDay)
      doc.text((_deliveryDay.getMonth() + 1) + '月' + _deliveryDay.getDate() + '日', 80, 5.5);
      doc.setFontSize(12);

      // Define columns (headers) and rows (body)
      const head = [['產品', '數量']];
      const body = order.items.map((item) => {
        return [item.product.name.zh + (item.addons ? ' *' + item.addons.name.zh : '--'), 'x' + item.quantity]
      });

      // prize
      if (order.prize && order.prize.type === 'item') {
        body.push([`**送${ order.prize.product.name.zh }`, `x${ order.prize.amount }`])
      }

      // gife
      if (order.gift) {
        doc.setFontSize(15)
        if (order.gift.type === 'item') {
          body.push([`**送${ order.gift.product.name.zh }`, `x${ order.gift.amount }`])
        } else {
          body.push([`**送${ order.gift.giftRef.name.zh.substring(0, 3) }`, `x${ order.gift.amount }`])
        }
      }

      // Use the autoTable method to add the table to the document
      let pageWidth = doc.internal.pageSize.getWidth();
      // The table width will be page width minus the left and right margins
      doc.autoTable({
        head       : head,
        body       : body,
        startY     : 8, // Start position of the table (optional)
        margin     : { top : 0, right : 1, bottom : 0, left : 1 },
        theme      : 'plain', // Theme can be 'striped', 'grid', or 'plain'
        styles     : { font : 'optmeal', fontStyle : 'normal' },
        tableWidth : pageWidth - 2,
        headStyles : {
          lineColor : [255, 0, 0], // Red border for the header
          lineWidth : 0,
        },
        bodyStyles : {
          lineColor : [0, 0, 0], // Black border for the body rows
          lineWidth : 0.1,
        },
      });


      //duplicates, no handling for potential duplicate orders
      // if (order.dups) {
      //   doc.setFontSize(8.5)
      //   doc.text(`*併單:`, 60, 78)
      //   let joinOrderY = 81
      //   order.dups.forEach(item => {
      //     doc.text(item, 60, joinOrderY)
      //     joinOrderY += 3
      //   })
      // }

      //total
      // doc.autoPrint({ variant : 'non-conform' });
      const orderPDF = new Blob([doc.output('blob')], { type : 'application/pdf' })
      await merger.add(orderPDF)
      // get SFWaybillPDF
      const wayBill = await $api.post('/v1/orders/sf/wayBillProxy', order.delivery.wayBillDoc, { responseType : 'blob' })
      await merger.add(wayBill.data)
      const currentIndex = parseInt(orderIndex) + 1
      element.innerHTML = `${ initSpinnerText }<b class="text-danger">(${ currentIndex }/${ orders.length })</b>`
    }

    const mergedPdf = await merger.saveAsBlob();
    return URL.createObjectURL(mergedPdf)
  } catch
    (e) {
    console.log(e)
  }
}
