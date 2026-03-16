<template>
  <el-dialog :title="'訂單路由: '+order.orderNumber"
             :visible.sync="dialogVisible"
             class="fix-footer"
             @close="close"
             fullscreen>
    <div class="row justify-content-center">
      <div class="col-12">
        順豐單號: {{ order.delivery ? order.delivery.billNo : '--' }}
      </div>
      <div class="col-12 justify-content-center pt-4 px-1" v-if="order.delivery && order.delivery.billNo">
        <h5>信息: </h5>
        <div v-if="!routes">路由信息獲取中...</div>
        <div class="sf-routes">
          <div v-for="route in routes" class="d-flex mb-1">
            <el-tag type="primary"
                    class="mx-0 my-0">
              {{ route.acceptTime }}
            </el-tag>
            <span class="ml-1 mt-1">{{ route.remark }}</span>
          </div>
        </div>
      </div>
      <div v-else>
        訂單未有順豐單號
      </div>
    </div>
    <!-- Classic Modal -->
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="close">關閉</el-button>
    </span>
  </el-dialog>
</template>
<script>
import UserProfile                                                       from "@/components/Dashboard/Views/Pages/UserProfile";
import {Card, Modal}                                                     from 'src/components/UIComponents'
import {extend}                                                          from "vee-validate";
import {required, numeric, regex, confirmed}                             from "vee-validate/dist/rules";
import {Input, Loading, Option, Select, Button, DatePicker, Dialog, Tag} from 'element-ui';
import moment                                                            from 'moment'
import {mapState}                                                        from "vuex";
import addItemModal                                                      from './components/AddItemModal'
import _                                                                 from "lodash";
import ConfirmDialog
                                                                         from "@/components/Dashboard/Views/Components/ConfirmDialog";
import EditPickupAddressModal
                                                                         from "@/components/Dashboard/Views/Orders/components/EditPickupAddressModal";

extend("required", required);
extend("numeric", numeric);
extend("regex", regex);
extend("confirmed", confirmed);

export default {
  components : {
    Card,
    [Dialog.name] : Dialog,
    [Button.name] : Button,
    [Tag.name]    : Tag,
  },
  data () {
    return {
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      moment,
      order         : {},
      routes        : null
    };
  },
  methods : {
    async open (orderNumber, accessCode) {
      this.dialogVisible = true
      await this.getOrderDetail(orderNumber)
      await this.getOrderRouting(orderNumber, accessCode)

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    async getOrderDetail (orderNumber) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/orders/' + orderNumber)
        this.order = detail.data
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },
    async getOrderRouting (orderNumber, accessCode) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/orders/sf/routes/' + orderNumber, { params : { accessCode } })
        if (detail.data) {
          if (detail.data.apiResultData.success) {
            this.routes = _.reverse(detail.data.apiResultData.msgData.routeResps[0].routes)
          }
        }
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },
    close () {
      this.dialogVisible = false
      this.resolve(true)
      this.order = {}
      this.routes = null
    },
  }
}
</script>
<style lang="scss">
.no-edit {
  background-color: #eee !important;
}

.removeItem {
  position: absolute;
  top: 8px;
  left: 101%;
  width: 50px;
  cursor: pointer;

  &:hover {
    color: #aaa;
  }
}

.hasQuantity {
  background-color: #ccc;
  padding-top: 9px;
  margin-bottom: 10px;
}

</style>
