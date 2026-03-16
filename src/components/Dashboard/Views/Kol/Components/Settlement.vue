<template>
  <el-dialog title="KOL業積結算"
             :visible.sync="dialogVisible"
             @close="close"
             fullscreen>
    <div class="row card" v-if="kolSalesDetail">
      <div class="col-lg-12 col-md-12">
        <div>
          <div class="card-header">
            <h4 class="title">KOL優惠碼: {{ kolSalesDetail.kolCode.code }}({{ kolSalesDetail.date }}) 業積詳情
              <b class="text-danger" v-if="!kolSalesDetail.settlement">(未結算)</b>
              <b class="text-success" v-else>(已結算)</b>
            </h4>
          </div>
          <hr>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 col-12">
                <div class="col-md-12 mb-2 h5">
                  業積月份: {{ kolSalesDetail.date }}
                </div>
                <div class="col-md-12 mb-2">KOL用戶: {{ kolSalesDetail.kol.name }}, {{ kolSalesDetail.kol.email }}</div>
                <div class="col-md-12 mb-2">KOL合約期: {{
                    moment(kolSalesDetail.kolCode.kolStartAt).format('YYYY年M月D日')
                  }} - {{ moment(kolSalesDetail.kolCode.kolEndAt).format('YYYY年M月DD日') }}
                </div>
                <div class="col-md-12 mb-2">kol優惠碼: {{ kolSalesDetail.kolCode.code }}</div>
                <div class="col-md-12 mb-2">完成訂單: {{ kolSalesDetail.orders }}
                  <ul>
                    <li>會員: {{ kolSalesDetail.memberOrders }}</li>
                    <li>非會員: {{ kolSalesDetail.nonMemberOrders }}</li>
                    <li>未完成: {{ kolSalesDetail.incompleteOrders }}</li>
                    <li>取消: {{ kolSalesDetail.cancelledOrders }}</li>
                  </ul>
                </div>
                <div class="col-md-12 mb-2">貨量: {{ kolSalesDetail.quantity }}
                  <ul>
                    <li v-for="cat in kolSalesDetail.catSummary">
                      {{ cat.category.name.zh }} : {{ cat.quantity }}
                    </li>
                  </ul>

                </div>
                <div class="col-md-12 mb-2">完成金額: {{ kolSalesDetail.turnover }}</div>
                <div class="col-md-12 mb-2"><span class="text-success">獲得獎金: {{ kolSalesDetail.bonus }}</span>
                </div>
              </div>

              <div class="col-md-4 col-12">
                <div class="col-md-12 mb-2 h5 pl-0">
                  轉數快資料
                </div>
                <ValidationObserver v-slot="{ handleSubmit }" ref="kolProfileForm">
                  <form @submit.prevent>
                    <div class="row">
                      <div class="col-md-12">
                        <ValidationProvider name="legalName"
                                            rules="required"
                                            v-slot="{ passed, failed }"
                                            vid="confirmation">
                          <fg-input :error="failed ? '請輸入真名': null"
                                    :hasSuccess="passed"
                                    type="text"
                                    label="真實姓名"
                                    readonly
                                    placeholder=""
                                    v-model="kolProfile.legalName"></fg-input>
                        </ValidationProvider>
                      </div>

                      <div class="col-md-12">
                        <ValidationProvider name="legalName"
                                            rules="required"
                                            v-slot="{ passed, failed }"
                                            vid="confirmation">
                          <fg-input :error="failed ? '請輸入真名': null"
                                    :hasSuccess="passed"
                                    type="text"
                                    label="身份證頭5位數字"
                                    readonly
                                    placeholder=""
                                    v-model="kolProfile.id5Digits"></fg-input>
                        </ValidationProvider>
                      </div>

                      <div class="col-md-12">
                        <fg-input label="轉數快Qrcode"
                                  readonly
                                  placeholder="">
                          <div>
                            <div v-if="kolProfile.fpsQRCodeImages && kolProfile.fpsQRCodeImages[0]"
                                 style="padding-bottom: 70%; width: 80%; background-size: contain; background-repeat: no-repeat"
                                 :style="'background-image:url('+ kolProfile.fpsQRCodeImages[0].medium.path +')'">
                            </div>
                            <div v-else>KOL未上載</div>
                          </div>
                        </fg-input>
                      </div>

                      <!--                      <div class="col-md-12">
                                              <ValidationProvider name="fps_type"
                                                                  rules="required"
                                                                  v-slot="{ passed, failed }">
                                                <fg-input label="轉數快ID類別" name="fps_type" :error="failed ? '錯誤': null" :hasSuccess="passed">
                                                  <el-select class="select-normal"
                                                             size="large"
                                                             placeholder=""
                                                             v-model="kolProfile.fps_type">
                                                    <el-option v-for="option in fps_types"
                                                               :value="option.value"
                                                               :label="option.label"
                                                               :key="option.value">
                                                    </el-option>
                                                  </el-select>
                                                </fg-input>
                                              </ValidationProvider>
                                            </div>-->

                      <!--                      <div class="col-md-12" v-if="kolProfile.fps_type === 'phone_no'">
                                              <ValidationProvider name="fps_number"
                                                                  rules="required|numeric|length:8"
                                                                  v-slot="{ passed, failed }"
                                                                  vid="confirmation">
                                                <fg-input :error="failed ? '輸入8位數字電話號碼': null"
                                                          :hasSuccess="passed"
                                                          type="text"
                                                          label="8位數字電話號碼"
                                                          placeholder=""
                                                          v-model="kolProfile.fps_number"></fg-input>
                                              </ValidationProvider>
                                            </div>

                                            <div class="col-md-12" v-else-if="kolProfile.fps_type === 'fps_id'">
                                              <ValidationProvider name="fps_number"
                                                                  rules="required|numeric|length:9"
                                                                  v-slot="{ passed, failed }"
                                                                  vid="confirmation">
                                                <fg-input :error="failed ? '輸入9位轉數快號碼': null"
                                                          :hasSuccess="passed"
                                                          type="text"
                                                          label="9位轉數快號碼(ID)"
                                                          placeholder=""
                                                          v-model="kolProfile.fps_number"></fg-input>
                                              </ValidationProvider>
                                            </div>

                                            <div class="col-md-12" v-else>
                                              <ValidationProvider name="fps_number"
                                                                  rules="required|email"
                                                                  v-slot="{ passed, failed }"
                                                                  vid="confirmation">
                                                <fg-input :error="failed ? '輸入轉數登記電郵': null"
                                                          :hasSuccess="passed"
                                                          type="text"
                                                          label="轉數登記電郵"
                                                          placeholder=""
                                                          v-model="kolProfile.fps_number"></fg-input>
                                              </ValidationProvider>
                                            </div>-->

                      <!--                      <div class="col-md-12">-->
                      <!--                        <fg-input type="text"-->
                      <!--                                  label="備注"-->
                      <!--                                  placeholder=""-->
                      <!--                                  v-model="kolProfile.remarks"></fg-input>-->
                      <!--                      </div>-->
                      <!--                      <div class="col-12 text-right">-->
                      <!--                        <el-button class="text-danger" @click="saveKolProfile">儲存</el-button>-->
                      <!--                      </div>-->
                    </div>
                  </form>
                </ValidationObserver>

                <div class="row">
                  <div class="col-12">
                    <img src="" alt="">
                  </div>
                </div>
              </div>

              <div class="col-md-4 col-12">
                <ValidationObserver v-slot="{ handleSubmit }" ref="kolSalesDetailForm">
                  <form @submit.prevent>

                    <ValidationProvider name="settlement"
                                        rules="required"
                                        v-slot="{ passed, failed }">
                      <fg-input label="結算入數紙證明圖片（提交後即表示KOL此月份獲入數分紅）" :error="failed ? '錯誤': null"
                                v-model="settlementImg"
                                :hasSuccess="passed">
                        <el-upload class="picture w-100 h-100"
                                   drag
                                   ref="image"
                                   action=""
                                   :on-change="onImageChange"
                                   :auto-upload="false"
                                   :show-file-list="false">
                          <img v-if="settlementImg" :src="settlementImg" class="picture-src">
                        </el-upload>
                        <span class="clear" @click="clearSettlementImg"></span>
                      </fg-input>
                    </ValidationProvider>
                    <div class="row">
                      <div class="col-12 text-right">
                        <el-button class="text-danger" @click="saveReceipt">儲存</el-button>
                      </div>
                    </div>
                  </form>
                </ValidationObserver>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
        </div>
      </div>
      <hr>
      <div class="col-lg-12 col-md-12">
        <h5>相關訂單</h5>
        <OrderRecordsTable :data="kolSalesDetail.ordersRef"></OrderRecordsTable>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close()">關閉</el-button>
    </span>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </el-dialog>
</template>
<script>
import {mapMutations, mapState}    from "vuex";
import {
  Button,
  DatePicker,
  Dialog,
  Input,
  Loading,
  Option,
  Select,
  Slider,
  Switch,
  Tag,
  TimeSelect,
  Upload
}                                  from "element-ui";
import VerifyStudentForm           from "@/components/Dashboard/Views/Pages/UserProfile/VerifyStudentForm";
import ConfirmDialog               from "@/components/Dashboard/Views/Components/ConfirmDialog";
import PSwitch                     from "@/components/UIComponents/Switch";
import PProgress                   from "@/components/UIComponents/Progress";
import _                           from "lodash";
import moment                      from 'moment'
import OrderRecordsTable           from "@/components/Dashboard/Views/Voucher/components/OrderRecordsTable";
import {extend}                    from "vee-validate";
import {required, numeric, length} from "vee-validate/dist/rules";

extend("required", required);
extend("numeric", numeric);
extend("length", length);

export default {
  name       : "Settlement",
  components : {
    [Button.name]     : Button,
    [Dialog.name]     : Dialog,
    [DatePicker.name] : DatePicker,
    [TimeSelect.name] : TimeSelect,
    [Slider.name]     : Slider,
    [Tag.name]        : Tag,
    [Input.name]      : Input,
    [Switch.name]     : Switch,
    [Button.name]     : Button,
    [Option.name]     : Option,
    [Select.name]     : Select,
    [Upload.name]     : Upload,
    PSwitch,
    PProgress,
    ConfirmDialog,
    OrderRecordsTable
  },
  data () {
    return {
      fps_types      : [{
        value : 'fps_id',
        label : '轉數快ID (9位數字)'
      }, {
        value : 'phone_no',
        label : '電話號碼 (8位數字)'
      }, {
        value : 'email',
        label : '電郵'
      }],
      moment,
      kolProfile     : {
        legalName  : '',
        fps_type   : 'phone_no',
        fps_number : null,
        kol        : null,
        remarks    : '',
      },
      kolSalesDetail : null,
      orders         : [],
      dialogVisible  : false,
      resolve        : null,
      reject         : null,
      loading        : false,
      settlementImg  : "//placehold.co/700x800",
    }
  },
  methods : {
    resetKolProfile () {
      this.kolProfile = {
        legalName  : '',
        fps_type   : 'phone_no',
        fps_number : null,
        kol        : null,
        remarks    : '',
      }
    },
    refresh () {
      this.close(true)
    },

    async clearSettlementImg () {
      const confirmation = await this.$refs.ConfirmDialog.open('移除結算證明', '你確定移除結算證明，此結算狀態將變為「未結算」！')
      if (confirmation.isConfirmed) {
        this.settlementImg = '//placehold.co/700x800'
        this.kolSalesDetail.settlement = null
      }
    },

    async uploadAndSetImage () {
      //process images
      const file = this.$refs.image.uploadFiles
      try {
        if (file && file.length) {
          let bodyFormData = new FormData()

          bodyFormData.append('file', file[0].raw)

          let result = await this.$api.post('/v1/uploads/image', bodyFormData)
          if (result.data) {
            this.kolSalesDetail.settlement = result.data.id
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
      }
      return true
    },

    onImageChange (file) {
      this.settlementImg = URL.createObjectURL(file.raw);
    },

    async saveKolProfile () {
      try {
        if (!await this.$refs.kolProfileForm.validate()) {
          this.$notify.error({ title : '提交錯誤', message : '必需填好KOL真實資料。' });
          return
        }

        if (this.kolProfile.id) {
          const confirmation = await this.$refs.ConfirmDialog.open('刪除', '你確定要更新資料嗎？')
          if (!confirmation.isConfirmed) return
        }

        const data = _.pick(this.kolProfile, ['fps_type', 'fps_number', 'legalName', 'remarks'])
        data.kol = this.kolSalesDetail.kol.id
        const profile = await this.$api.patch('/v1/users/kolProfile/' + data.kol, data)
        if (profile && profile.data) {
          this.kolProfile = profile.data
        }
        this.$notify({ title : '成功', message : '更新成功', type : 'success', })
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新错误' });
      }
    },

    async saveReceipt () {
      if (!await this.$refs.kolSalesDetailForm.validate()) {
        this.$notify.error({ title : '提交錯誤', message : '必需上傳入數紙。' });
        return
      }
      // const confirmation = await this.$refs.ConfirmDialog.open('通過審批', '你確定通過此帳號的學生申請？')
      // if (!confirmation.isConfirmed) return
      try {
        this.loading = true
        await this.uploadAndSetImage()
        const data = _.pick(this.kolSalesDetail, ['settlement'])
        const user = await this.$api.patch('/v1/sales/kolSales/' + this.kolSalesDetail.id, data)

        if (user) {
          this.$notify({ title : '成功', message : '更新成功', type : 'success', })
          this.close(true)
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新错误' });
      } finally {
        this.loading = false
      }
    },

    async getSettlementDetail (kolSalesId) {
      if (!kolSalesId) return
      const loading = new Loading.service({ fullscreen : false });
      try {
        const kolSalesDetail = await this.$api.get('/v1/sales/kolSales/' + kolSalesId)
        this.kolSalesDetail = kolSalesDetail.data
        this.settlementImg = kolSalesDetail.data.settlement ? kolSalesDetail.data.settlement.large.path : '//placehold.co/700x800'
        if (this.kolSalesDetail.settlement) {
          this.kolSalesDetail.settlement = this.kolSalesDetail.settlement.id
        }
      } catch (e) {
      } finally {
        loading.close()
      }
    },

    close (refresh) {
      this.dialogVisible = false
      this.resolve(!!refresh)
      this.orders = []
      this.kolSalesDetail = null
    },

    async getCategories () {
      try {
        const t = this
        const categories = await t.$api.get('/v1/categories')
        if (categories && categories.data) {
          const cats = {}
          categories.data.results.forEach(item => {
            cats[item.id] = item.name.zh
          })
          this.categories = cats
        }
      } catch (e) {
        console.log(e)
      }
    },

    async getKolProfileByUserId (userId) {
      try {
        const t = this
        const kolProfile = await t.$api.get('/v1/users/kolProfile/' + userId)
        if (kolProfile && kolProfile.data) {
          this.kolProfile = kolProfile.data
        }
      } catch (e) {
        console.log(e)
      }
    },

    async open (id) {
      this.dialogVisible = true
      this.resetKolProfile()
      setTimeout(() => {
        document.body.click()
      }, 500)

      await this.getCategories()
      await this.getSettlementDetail(id)
      await this.getKolProfileByUserId(this.kolSalesDetail.kol.id)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
  },

  props : ['id'],
  created () {
  },
  watch : {}
}

</script>
<style lang="scss" scoped>
.clear {
  position: absolute;
  top: 25px;
  right: 0;

  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.4);

  &:after {
    content: 'x';
    font-size: 30px;
  }
}
</style>
