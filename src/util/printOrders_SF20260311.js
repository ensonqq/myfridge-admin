/**
 * Author: Enson
 * Created At: 2022-11-24
 * Desc: this function returns a pdf "urlstring" to be embed in html
 * ----------------------
 * jsPdf:
 * lib is required, located in /public/static/js/jspdf.debug.js
 * font is required, located in /public/static/js/optmeal-normal.js
 */
import PDFMerger from 'pdf-merger-js/browser';

export default async function (orders, _sort, categories, $api) {
  try {
    const merger = new PDFMerger();

    // add category name to _sort
    _.forOwn(categories, function (cat, id) {
      cat.products.forEach(item => {
        if (_sort[item.id]) {
          _sort[item.id].category = item.category.name.zh
        }
      })
    })

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
      doc.setFontSize(17);
      if (order.isWeekEndDelivery) {
        doc.text('末', 60, 5.5);
        doc.circle(62.5, 3.5, 3.5);
      }

      doc.text(order.orderNumber, 1, 5.5);

      doc.setFontSize(15.5);
      //delivery date
      if (order.deliveryDay) {
        const _deliveryDay = new Date(order.deliveryDay)
        doc.text((_deliveryDay.getMonth() + 1) + '月' + _deliveryDay.getDate() + '日', 1, 15);
      }

      //quantity
      let y = 22
      let x = 1

      let print_y = 22
      let print_x = 1

      let totalQty = 0

      let max_y = 0
      let length = 0 //controls a new line & group
      let sort = _.cloneDeep(_sort)

      // change sort category
      for (let i in sort) {
        if (sort[i].name === '麻辣吞' || sort[i].name === '韭菜吞') {
          sort[i].category = '雲吞'
        }

      }

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
          if ((catName === '甜品') && length % 2 == 0 && length > 1) {
            print_y = y
            print_x += 24
          } else if ((catName === '雲吞' || catName === '小菜' || catName === '奶粉') && length % 1 == 0 && length > 0) {
            print_y = y
            print_x += 24
          } else if (length % 4 == 0 && length > 3) {
            print_y = y
            print_x += 24
          }
          doc.text(item.name + ": " + (item.quantity || '－'), print_x, print_y);
          length++;
          print_y += 6;
          if (max_y <= print_y) max_y = print_y
          totalQty += item.quantity
        })

        if (catName === '雲吞' || catName === '甜品' || catName === '小菜' || catName === '奶粉') {
          y += 8
        } else {
          y += 25
        }
        print_y = y
        print_x = 1
        length = 0
        doc.line(1, print_y - 5, 100, print_y - 5);
      })

      if (order.prize && order.prize.type === 'item') {
        doc.setFontSize(15)
        doc.text(`送${ order.prize.product.internalName }x${ order.prize.amount }`, 1, max_y + 15)
        doc.rect(1, max_y + 9, 32, 10)
      }
      // test print prize
      // doc.text(`送黑椒雞x3`, 60, max_y - 24)
      // doc.rect(58, max_y - 30, 32, 10)

      if (order.gift) {
        doc.setFontSize(15)
        if (order.gift.type === 'item') {
          doc.text(`送${ order.gift.product.internalName }x${ order.gift.amount }`, 1, max_y + 5)
        } else {
          doc.text(`送${ order.gift.giftRef.name.zh.substring(0, 3) }x${ order.gift.amount }`, 1, max_y + 5)
        }
        doc.rect(1, max_y - 1, 32, 10)
      }
      //test print gift
      // doc.text(`送番茄雞x3`, 60, max_y - 10)
      // doc.rect(58, max_y - 16, 32, 10)

      if (order.dups) {
        doc.setFontSize(8.5)
        doc.text(`*併單:`, 60, 78)
        let joinOrderY = 81
        order.dups.forEach(item => {
          doc.text(item, 60, joinOrderY)
          joinOrderY += 3
        })
      }

      //test combine orders
      // doc.setFontSize(8.5)
      // doc.text(`*併單:`, 60, 78)
      // let joinOrderY = 81
      // const test_arr = ['OPT1234567890123', 'OPT1234567890123', 'OPT1234567890123', 'OPT1234567890123']
      // test_arr.forEach(item => {
      //   doc.text(item, 60, joinOrderY)
      //   joinOrderY += 3
      // })

      doc.setFontSize(15.5)
      // update api & admin to have dynamic changes
      //free 500g whey protein campaign
      // const campaignStartDay = moment('2023-04-26').startOf('day')
      // if (moment(order.createdAt).isAfter(campaignStartDay) && order.paidTotal >= 1000) {
      //   console.log(order.paidTotal, order.orderNumber, order.createdAt, 'free whey protein')
      //   doc.text('(送500G隨機口味奶粉1包)', 40, max_y);
      // }

      //total
      doc.text('total: ' + totalQty, 60, max_y + 8);
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
  } catch (e) {
    console.log(e)
  }
}
