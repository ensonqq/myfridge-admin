/**
 * Author: Enson
 * Created At: 2022-11-24
 * Desc: this function returns a pdf "urlstring" to be embed in html
 * ----------------------
 * jsPdf:
 * lib is required, located in /public/static/js/jspdf.debug.js
 * font is required, located in /public/static/js/optmeal-normal.js
 */
import moment from 'moment'

export default function (orders, _sort, categories, isBlob) {
  const doc = new jsPDF('', 'mm', 'a6');
  doc.deletePage(1);
  doc.setFont('optmeal');


  // add category name to _sort
  _.forOwn(categories, function (cat, id) {
    cat.products.forEach(item => {
      _sort[item.id].category = item.category.name.zh
    })
  })

  orders.forEach(order => {
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
      doc.setFontSize(17);
      if (order.isWeekEndDelivery) {
        doc.text('未', 1, 5.5);
        doc.circle(4.5, 4, 4);
      }

      doc.text(order.orderNumber, 1, 15);

      doc.setFontSize(15.5);
      //delivery date
      if (order.deliveryDay) {
        const _deliveryDay = new Date(order.deliveryDay)
        doc.text((_deliveryDay.getMonth() + 1) + '月' + _deliveryDay.getDate() + '日', 1, 25);
      }

      //quantity
      let y = 35
      let x = 1

      let print_y = 35
      let print_x = 1

      let totalQty = 0

      let max_y = 0
      let length = 0 //controls a new line & group
      let sort = _.cloneDeep(_sort)
      const toBeRemovedCats = {}
      order.items.forEach(item => {
        if (item.product.isBundled) {
          toBeRemovedCats[item.product.category.name.zh] = ''
          item.product.bundleItems.forEach(bundleItem => {
            sort[bundleItem.product.id].quantity += item.quantity * bundleItem.quantity
          })
        } else {
          sort[item.product.id].quantity += item.quantity
        }
      })

      let grouped = _.groupBy(Object.values(sort), "category")
      Object.keys(toBeRemovedCats).forEach(cat => {
        delete grouped[cat]
      })

      // hardcoded
      delete grouped['試食']

      doc.setFontSize(12);
      _.forOwn(grouped, function (products, catName) {
        products.forEach(item => {
          if (length % 4 == 0 && length > 3) {
            print_y = y
            print_x += 24
          }
          doc.text(item.name + ": " + (item.quantity || '－'), print_x, print_y);
          length++;
          print_y += 6;
          if (max_y <= print_y) max_y = print_y
          totalQty += item.quantity
        })

        y += 27
        print_y = y
        print_x = 1
        length = 0
      })

      if (order.dups) {
        doc.setFontSize(8.5);
        doc.text(`>>併單: ${ order.dups.join(' ,') }`, 1, max_y);
      }
      doc.setFontSize(15.5);
      //free 500g whey protein campaign
      // const campaignStartDay = moment('2023-04-26').startOf('day')
      // if (moment(order.createdAt).isAfter(campaignStartDay) && order.paidTotal >= 1000) {
      //   console.log(order.paidTotal, order.orderNumber, order.createdAt, 'free whey protein')
      //   doc.text('(送500G隨機口味奶粉1包)', 40, max_y);
      // }
      //total
      doc.text('total: ' + totalQty, 40, max_y + 10);
    }
  )
  doc.autoPrint({ variant : 'non-conform' });

  if (isBlob) {
    return new Blob([doc.output()], { type : 'application/pdf' });
  } else {
    return doc.output('datauristring');
  }
}
