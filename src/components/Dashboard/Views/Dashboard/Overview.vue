<template>
  <div v-if="user.role === 'super'" class="overview">

    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title text-danger"><i class="fa fa-rocket"></i> 今日戰報 ({{
                moment().format('YYYY-MM-DD')
              }})</h4>
          </div>
          <div class="card-body">
            <div class="row flex-wrap">
              <div class="col-md-2 col-12 h5">
                <i class="fa fa-dollar"></i> 營業額: {{ dashboard.today ? dashboard.today.todaySummary.turnover : '...加載中' }}
              </div>
              <div class="col-md-2 col-12 h5">
                <i class="fa fa-list-alt"></i> 訂單: {{ dashboard.today ? `${ dashboard.today.todaySummary.orders }(${ dashboard.today.reorderToday })` : '...加載中' }}
              </div>
              <div class="col-md-2 col-12 h5">
                <i class="fa fa-truck"></i> 總貨量: {{ dashboard.today ? dashboard.today.todaySummary.quantity : '...加載中' }}
              </div>
              <div class="col-md-2 col-12 h5">
                <i class="fa fa-user"></i> 新會員: {{ dashboard.newUsersToday ? dashboard.newUsersToday : 0 }}
              </div>
              <div class="col-md-2 col-12 h5">
                <i class="fa fa-glass"></i> 本月平均: {{
                  (dashboard.turnoverThisMonth / moment().date()).toFixed(1)
                }}
              </div>
              <div class="col-md-2 col-12 h5">
                <i class="fa fa-flag"></i> 本月預計: {{
                  ((dashboard.turnoverThisMonth / moment().date()) * moment().daysInMonth()).toFixed(1)
                }}
              </div>
            </div>
            <div class="row pt-5">
              <div class="col-md-12 mb-4">
                <div class="h5 text-primary">積分POOL</div>
                <div class="row" v-if="dashboard.topupGraph">
                  <div class="col-lg-3 col-md-6">
                    <div>
                      <div>*所有用戶積分總數</div>
                      <div class="h5">
                        積分池: {{ dashboard.topupGraph.creditPool }}
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6">
                    <div>
                      <div>*付費充值的訂單量</div>
                      <div class="h5">
                        總充值訂單: {{ dashboard.topupGraph.totalOrdersCnt }}
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6">
                    <div>
                      <div>*付費充值的總積分</div>
                      <div class="h5">
                        總充值積分: {{ dashboard.topupGraph.topupCreditsTotal }}
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-3 col-md-6">
                    <div>
                      <div>*付費充值的總金額</div>
                      <div class="h5">
                        總充值金額: HKD${{ dashboard.topupGraph.topupTotal }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-12 mb-4">
                <div class="h5 text-primary">送貨／自取分佈</div>
                <div class="row">
                  <div v-for="(deliveryType,index) in dashboard.deliveryTypeGraph" class="col-lg-2 col-md-6" :key="index">
                    <div>
                      <div class="h5">
                        {{ deliveryTypes[deliveryType.name] }}: {{ deliveryType.count }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-12">
                <div class="h5 text-primary">產品銷量分佈</div>
                <div class="row">
                  <template v-for="(cat,index) in categories">
                    <div class="col-lg-2 col-md-6" :key="index">
                      <div>
                        <div class="h5">{{ cat.name.zh }}: {{ catQuantities[cat.id] }}</div>
                        <table class="table">
                          <thead>
                          <tr>
                            <th></th>
                            <th>產品</th>
                            <th class="text-right">賣出</th>
                          </tr>
                          </thead>

                          <tbody>
                          <tr v-for="(product, index) in cat.products">
                            <td>
                              <div class="flag">
                                <img v-if="product.images[0]" width="27" :src="product.images[0].small.path" alt="US">
                                <span v-else>沒有圖片</span>
                              </div>
                            </td>
                            <td class="text-left">{{ product.name.zh }}</td>
                            <td class="text-right">
                              {{ itemQuantities[product.id] }}
                            </td>
                          </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title text-danger"><i class="fa fa-rocket"></i>付款方式總結</h4>
          </div>
          <div class="card-body">
            <div class="row flex-wrap justify-content-start">
              <div class="mx-3 my-3 d-flex align-items-center" v-for="(val,key) in dashboard.paymentMethodsGraph" :key="key">
                <img height="20" :src="require('/src/assets/images/' + val.name + '.png')" alt="">
                <b class="ml-1"> {{ val.name }}</b>: {{ val.count }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--Stats cards-->
    <div class="row">
      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="info"
                    v-if="reorderRate && reorderRate.reorderRate30"
                    icon='fa fa-refresh'
                    small-title="整體回購率"
                    :title="reorderRate.reorderRate30 + '%'">
          <table slot="sub-content" class="pull-right">
            <tr>
              <router-link to="/users/student" class="text-danger">
                <td>等待驗證學生:</td>
                <td>{{ dashboard.pendingStudents ? dashboard.pendingStudents : 0 }}</td>
              </router-link>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-rocket"></i>
            即時
          </div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="info"
                    icon='nc-icon nc-favourite-28'
                    small-title="7天新會員"
                    :title="'+' + dashboard.newUsersPast7Days">
          <table slot="sub-content" class="pull-right">
            <tr>
              <td>今日新會員:</td>
              <td>{{ dashboard.newUsersToday ? dashboard.newUsersToday : 0 }}</td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-rocket"></i>
            即時
          </div>
        </stats-card>
      </div>


      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="info"
                    icon='nc-icon nc-money-coins'
                    small-title="今個月營業額"
                    :title="dashboard.turnoverThisMonth">
          <table slot="sub-content" class="pull-right">
            <tr>
              <td>平均每日:</td>
              <td>{{
                  dashboard.turnoverThisMonth ? (dashboard.turnoverThisMonth / moment().format('D')).toFixed(0) : 0
                }}
              </td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-rocket"></i>
            即時
          </div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="info"
                    icon='fa fa-shopping-cart'
                    small-title="今個月總訂單"
                    :title="dashboard.ordersThisMonth">
          <table slot="sub-content" class="pull-right">
            <tr>
              <td>平均每日:</td>
              <td>{{
                  dashboard.ordersThisMonth ? (dashboard.ordersThisMonth / moment().format('D')).toFixed(0) : 0
                }}
              </td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-rocket"></i>
            即時
          </div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="danger"
                    icon='fa fa-user'
                    small-title="會員總數"
                    :title="dashboard.user? dashboard.user.total: 0">

          <table slot="sub-content" class="pull-right">
            <tr>
              <td>男|女:</td>
              <td>{{ dashboard.user ? dashboard.user.maleUsers + '|' + dashboard.user.femaleUsers : 0 }}</td>
            </tr>
            <tr>
              <td>總落單會員:</td>
              <td>{{ dashboard.user ? dashboard.user.totalPurchasedUsers : 0 }}</td>
            </tr>
            <tr>
              <td>30天新會員:</td>
              <td>{{ dashboard.user ? dashboard.user.month.total : 0 }}</td>
            </tr>
            <tr>
              <td>30天已購買:</td>
              <td>{{ dashboard.user ? dashboard.user.month.purchased : 0 }}</td>
            </tr>
            <tr>
              <td>30天未購買:</td>
              <td>{{ dashboard.user ? dashboard.user.month.notPurchased : 0 }}</td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-rocket"></i>
            即時
          </div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="danger"
                    icon='nc-icon nc-money-coins'
                    small-title="總業積"
                    :title="`$${dashboard.turnover?dashboard.turnover.total: 0}`">
          <table slot="sub-content" class="pull-right">
            <tr>
              <td>上月業積:</td>
              <td>{{ dashboard.turnover ? dashboard.turnover.lastMonth : 0 }}</td>
            </tr>
            <tr>
              <td>每月平均:</td>
              <td>{{ dashboard.turnover ? dashboard.turnover.monthAvg : 0 }}</td>
            </tr>
            <tr>
              <td style="vertical-align: top;">歷時最高月份:</td>
              <td>{{ dashboard.turnover ? dashboard.turnover.highestMonth.turnover : 0 }}<br>
                ({{ dashboard.turnover ? dashboard.turnover.highestMonth.date : '-' }})
              </td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-globe"></i>
            開業至今
          </div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="danger"
                    icon='fa fa-shopping-cart'
                    small-title="總訂單"
                    :title="dashboard.order? dashboard.order.total : 0">
          <table slot="sub-content" class="pull-right">
            <tr>
              <td>每單平均Sku:</td>
              <td>{{ dashboard.order ? dashboard.order.quantityAvg : 0 }}</td>
            </tr>
            <tr>
              <td>每月平均:</td>
              <td>{{ dashboard.order ? dashboard.order.monthAvg : 0 }}</td>
            </tr>
            <tr>
              <td style="vertical-align: top;">歷時最高月份:</td>
              <td>{{ dashboard.order ? dashboard.order.highestMonth.orders : 0 }}<br>
                ({{ dashboard.order ? dashboard.order.highestMonth.date : '-' }})
              </td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-globe"></i>
            開業至今
          </div>
        </stats-card>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card type="danger"
                    icon='fa fa-dashboard'
                    small-title="總Sku數量"
                    :title="dashboard.skuQuantities? dashboard.skuQuantities.total: 0">
          <table slot="sub-content" class="pull-right" v-if="dashboard.skuQuantities">
            <tr v-for="(qty, category) in dashboard.skuQuantities.categories">
              <td>{{ category }}:</td>
              <td>{{ qty }}</td>
            </tr>
            <tr>
              <td>每月平均:</td>
              <td>{{ dashboard.skuQuantities ? dashboard.skuQuantities.monthAvg : 0 }}</td>
            </tr>
          </table>
          <div class="stats" slot="footer">
            <i class="fa fa-globe"></i>
            開業至今
          </div>
        </stats-card>
      </div>
    </div>


    <div class="row">
      <div class="col-lg-3 col-sm-6">
        <circle-chart-card v-if="reorderRate && reorderRate.reorderRate30"
                           :percentage="reorderRate.reorderRate30"
                           chart-id="new-visitors-chart"
                           title="回購率"
                           description="30天回購率(30日內再落單的會員)"
                           color="#fcc468">
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-warning"></i> {{ reorderRate.reorderRate60 }}% (60天)
              <i class="fa fa-circle text-warning ml-3"></i> {{ reorderRate.reorderRate90 }}％ (90天)
              <i class="fa fa-circle text-warning ml-3"></i> {{ reorderRate.reorderRate120 }}％ (120天)
            </div>
            <hr>
            <div class="stats">
              <i class="fa fa-rocket"></i> 即時（所有數據）
            </div>
          </template>
        </circle-chart-card>
      </div>

      <div class="col-lg-3 col-sm-6">
        <circle-chart-card v-if="dashboard.oderRate"
                           :percentage="dashboard.oderRate"
                           chart-id="email-statistics-chart"
                           title="購買率"
                           description="已購買過的會員／所有會員"
                           color="#4acccd">
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-info"></i> 購買率
            </div>
            <hr>
            <div class="stats">
              <i class="fa fa-rocket"></i> 即時（所有數據）
            </div>
          </template>
        </circle-chart-card>
      </div>


      <div class="col-lg-3 col-sm-6">
        <circle-chart-card v-if="dashboard.completeRate"
                           :percentage="dashboard.completeRate"
                           title="訂單完成率"
                           chart-id="orders-chart"
                           description="未付款/付款"
                           color="#f17e5d">
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-danger"></i> 完成率
            </div>
            <hr>
            <div class="stats">
              <i class="fa fa-rocket"></i> 即時（所有數據）
            </div>
          </template>
        </circle-chart-card>
      </div>

      <div class="col-lg-3 col-sm-6">
        <circle-chart-card v-if="dashboard.compareToLastMonth"
                           :percentage="dashboard.compareToLastMonth"
                           title="對比上月"
                           description="本月對比上月營業額"
                           color="#6BD098">
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle text-success"></i> 對比上月
            </div>
            <hr>
            <div class="stats">
              <i class="fa fa-rocket"></i> 即時
            </div>
          </template>
        </circle-chart-card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <chart-card :chart-data="yearMonthSalesLineChart.data"
                    :chart-height="getYearMonthSalesHeight"
                    chart-id="activity-bar-chart"
                    chart-type="Line">
          <template slot="header">
            <h4 class="card-title">業積分佈(按年按月)</h4>
            <p class="card-category">詳細銷量走勢</p>
          </template>
          <template slot="footer">
            <hr>
            <div class="stats">
              <i class="fa fa-check"></i> MyFridge保密資料
            </div>
          </template>
        </chart-card>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <chart-card :chart-data="yearSalesLineChart.data"
                    :chart-height="getYearSalesHeight"
                    chart-id="activity-bar-chart2"
                    chart-type="Line">
          <template slot="header">
            <h4 class="card-title">業積走勢(每年)</h4>
            <p class="card-category">每年走勢</p>
          </template>
          <template slot="footer">
            <div class="legend">
              <i class="fa fa-circle" :style="'color: '+yearSalesLineChart.colors[0]"></i>2019至{{
                moment().format('YYYY')
              }}
            </div>
            <hr>
            <div class="stats">
              <i class="fa fa-check"></i> MyFridge保密資料
            </div>
          </template>
        </chart-card>
      </div>
    </div>
  </div>
</template>
<script>
import CircleChartCard from 'src/components/UIComponents/Cards/CircleChartCard.vue'
import ChartCard       from 'src/components/UIComponents/Cards/ChartCard';
import StatsCard       from 'src/components/UIComponents/Cards/StatsCard';
import {Badge}         from 'src/components/UIComponents'
import Loading         from 'src/components/Dashboard/Layout/LoadingMainPanel.vue'
import TaskList        from './Widgets/TaskList'
import {mapState}      from 'vuex'
import Orders          from "@/components/Dashboard/Views/Orders/Orders";
import moment          from 'moment'
import _               from "lodash";

const WorldMap = () => ({
  component : import('./../Maps/WorldMap.vue'),
  loading   : Loading,
  delay     : 200
})

export default {
  computed   : {
    ...mapState(['user']),
    getYearMonthSalesHeight () {
      return window.innerWidth >= 400 ? 150 : 300
    },

    getYearSalesHeight () {
      return window.innerWidth >= 400 ? 80 : 200
    }
  },
  components : {
    StatsCard,
    ChartCard,
    CircleChartCard,
    WorldMap,
    Badge,
    TaskList,
    Orders
  },
  async created () {
    if (this.user.role !== 'super') {
      this.$router.push('/orders/byDeliveryDayV2')
    } else {
      await this.getCategoriesWithProducts()
      this.getDashboard()
      this.getReorderRate()
    }
  },
  methods : {
    async getReorderRate () {
      try {
        const reorderRate = await this.$api.get('/v1/dashboard/reorderRate')
        if (reorderRate && reorderRate.data) {
          this.reorderRate = reorderRate.data.result
        }
      } catch (e) {
        console.log(e)
      }
    },
    async getCategoriesWithProducts () {
      try {
        const t = this
        const itemQuantities = {}
        const catQuantities = {}
        const categories = await t.$api.get('/v1/categories?products=1')
        if (categories && categories.data) {
          this.categories = categories.data.results
          const data = categories.data.results
          data.forEach(item => {
            catQuantities[item.id] = 0
            item.products.forEach(product => {
              itemQuantities[product.id] = 0
            })
          })
          this.itemQuantities = itemQuantities
          this.catQuantities = catQuantities
        }
      } catch (e) {
        console.log(e)
      }
    },

    async getDashboard () {
      try {
        const data = await this.$api.get('/v1/dashboard')
        if (data.data) {
          this.dashboard = data.data

          this.yearMonthSalesLineChart.data.years = Object.keys(this.dashboard.yearsSalesGraph).map(item => item + '年')
          this.yearMonthSalesLineChart.data.datasets = Object.values(this.dashboard.yearsSalesGraph)
                                                             .map((value, index) => ({
                                                               label           : this.yearMonthSalesLineChart.data.years[index],
                                                               borderColor     : this.yearMonthSalesLineChart.colors[index],
                                                               fill            : false,
                                                               borderWidth     : 4,
                                                               data            : value,
                                                               backgroundColor : this.yearMonthSalesLineChart.colors[index],
                                                             }))
          const datasets = []
          _.forOwn(this.dashboard.yearsSalesGraph, function (value, year) {
            datasets.push(_.sum(value))
          });
          this.yearSalesLineChart.data.labels = Object.keys(this.dashboard.yearsSalesGraph)
          this.yearSalesLineChart.data.datasets = [{
            label           : "每年走勢",
            borderColor     : this.yearSalesLineChart.colors[0],
            fill            : false,
            borderWidth     : 4,
            data            : datasets,
            backgroundColor : this.yearSalesLineChart.colors[0],
          }]

          //   today items sold table
          this.dashboard.today.todayOrders.results.forEach(order => {
            order.items.forEach(item => {
              this.itemQuantities[item.product.id] += item.quantity
              this.catQuantities[item.product.category] += item.quantity
            })
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  /**
   * Chart data used to render stats, charts. Should be replaced with server data
   */
  data () {
    return {
      reorderRate             : null,
      moment,
      deliveryTypes           : {
        delivery : '送貨上門',
        pickup   : '自取'
      },
      categories              : [],
      dashboard               : {},
      yearMonthSalesLineChart : {
        colors : ['#fcc468', '#4cbdd7', '#4cd763', '#7a4cd7', '#d74cc0', '#1e3ac8'],
        data   : {
          years    : [],
          labels   : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          datasets : []
        }
      },
      itemQuantities          : {},
      catQuantities           : {},
      yearSalesLineChart      : {
        colors : ['#4cd763'],
        data   : {
          years    : [],
          labels   : [],
          datasets : []
        }
      }
    }
  }
}

</script>
<style lang="scss" scoped>
.overview {
  table {
    tr {
      td:first-child {
        text-align: left;
      }

      td:nth-child(2) {
        text-align: right;
      }
    }
  }
}

</style>
