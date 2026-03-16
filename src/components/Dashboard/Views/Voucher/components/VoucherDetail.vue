<template>
  <el-dialog title="優惠資料"
             :visible.sync="dialogVisible"
             fullscreen>

    <ValidationObserver v-slot="{ handleSubmit }" ref="form">
      <form @submit.prevent="handleSubmit(submit)">
        <div class="row justify-content-center">
          <div class="col-12 col-sm-6">
            <div class="col-12 pl-0">
              <h5>基本資料</h5>
            </div>
            <div class="mb-2" v-if="voucher.id">
              <label class="col-form-label">ID</label>
              <div class="form-group pa-10">
                <div class="form-control no-edit">
                  {{ voucher.id }}
                </div>
              </div>
            </div>

            <div class="mb-2">
              <ValidationProvider name="code" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="優惠碼（不可重複，無視大細楷）"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="code"
                          v-model="voucher.code">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="mb-2 d-flex flex-wrap">
              <ValidationProvider class="col-lg-3 col-12 pl-0" name="type" rules="required" v-slot="{ passed, failed }">
                <fg-input label="折扣類別"
                          :error="failed ? '錯名': null"
                          :hasSuccess="passed">
                  <el-select size="small"
                             placeholder=""
                             class="select-normal"
                             v-model="voucher.type">
                    <el-option v-for="option in voucherTypes"
                               :value="option.value"
                               :label="option.label"
                               :key="option.value">
                    </el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>

              <ValidationProvider class="col-lg-3 col-12 pl-0" name="type" rules="required|max_value:-1" v-slot="{ passed, failed }">
                <fg-input label="折扣數值（必須為負值）"
                          :error="failed ? '錯名': null"
                          :hasSuccess="passed"
                          v-model="voucher.value">
                </fg-input>
                (
                <template v-if="voucher.type === 'percent'">
                  打折：
                  -{{ voucher.value * -1 }}%
                </template>
                <template v-else-if="voucher.type === 'fixed'">
                  實扣：
                  -${{ voucher.value * -1 }}
                </template>
                <template v-else>
                  {{ voucher.type }}, {{ voucher.value }}
                </template>
                )
              </ValidationProvider>

              <ValidationProvider class="col-lg-3 col-12 pl-0" name="type" rules="required" v-slot="{ passed, failed }">
                <fg-input type="number"
                          label="最低購買量MOQ (e.g. 滿10件先用到)"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="code"
                          v-model="voucher.moq">
                </fg-input>
              </ValidationProvider>

              <ValidationProvider class="col-lg-3 col-12 pl-0" name="type" rules="required" v-slot="{ passed, failed }">
                <fg-input type="number"
                          label="最低銷費MOV (e.g. 滿$100先用到)"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="code"
                          v-model="voucher.mov">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="mb-2 d-flex flex-wrap">
              <ValidationProvider class="col-lg-6 col-12 pl-0" name="zhname" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="前台使用顯示名稱(中文)"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="zhname"
                          v-model="voucher.name.zh">
                </fg-input>
              </ValidationProvider>

              <ValidationProvider class="col-lg-6 col-12 pl-0" name="enname" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="前台使用顯示名稱(英文)"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="enname"
                          v-model="voucher.name.en">
                </fg-input>
              </ValidationProvider>
            </div>


            <div class="mb-2 d-flex">
              <ValidationProvider class="col4" name="startAt" rules="required" v-slot="{ passed, failed }">
                <fg-input label="優惠碼生效日"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="startAt">
                  <el-date-picker v-model="date.startAt"
                                  type="date">
                  </el-date-picker>
                </fg-input>
              </ValidationProvider>

              <ValidationProvider class="col-4" name="endAt" rules="required" v-slot="{ passed, failed }">
                <fg-input label="優惠碼到期日"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="endAt">
                  <el-date-picker v-model="date.endAt"
                                  type="date">
                  </el-date-picker>
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="mb-2 d-flex">
              <ValidationProvider name="limited" rules="required" v-slot="{ passed, failed }">
                <fg-input label="是否無限使用"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="limited"
                          v-model="voucher.name.en">
                  <br>
                  <el-switch v-model="voucher.limited"
                             class="mt-2"
                             active-color="#ff4949"
                             inactive-color="#13ce66">
                  </el-switch>
                  {{ !voucher.limited ? '無限' : '有限次數' }}
                </fg-input>
              </ValidationProvider>
              <ValidationProvider v-if="voucher.limited" class="col-4" name="availableUsageCnt" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="可使用次數"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="availableUsageCnt"
                          v-model="voucher.availableUsageCnt">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="mb-2">
              <ValidationProvider name="active" rules="required" v-slot="{ passed, failed }">
                <fg-input label="發佈"
                          :error="failed ? '錯誤': null"
                          :hasSuccess="passed"
                          name="publish">
                  <br>
                  <el-switch v-model="voucher.active"
                             active-color="#13ce66"
                             inactive-color="#ff4949">
                  </el-switch>
                  {{ voucher.active ? '已發佈' : '未發佈' }}
                </fg-input>
              </ValidationProvider>
            </div>
            <hr>
            <h5 class="mt-16">KOL優惠碼設定</h5>
            <div class="mb-2 d-flex">
              <ValidationProvider class="col-lg-4 col-12 pl-0" name="kol">
                <fg-input label="KOL用戶（輸入查詢）"
                          v-model="kol">
                  <el-select clearable class="select-normal" v-model="kol" filterable remote reserve-keyword placeholder="请输入关键词" :remote-method="searchKol" loading-text="...搜尋中"
                             no-data-text="沒有資料" :loading="userSearchLoading">
                    <el-option v-for="item in kolUsers" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>
            </div>
            <ol class="mb-2 px-0">
              <template v-if="contracts.length">
                <li class="d-flex align-items-center flex-wrap position-relative" v-for="(contract,index) in contracts" :key="index">
                  <div class="col-12">
                    <hr>
                  </div>
                  <b class="mr-3">合約 {{ index + 1 }}
                    <span v-if="contract.signed" class="text-success">已簽</span>
                    <span v-else class="text-danger">未簽</span>
                    : {{
                      moment(contract.endAt).add(1, 'day').diff(moment(contract.startAt), 'month')
                    }}個月<br>(rate: {{ contract.rate }}%, bonus: {{ contract.bonusPercentage }}%)</b>
                  <ValidationProvider class="col-12 col-lg-4" :name="'contractStartAt' + index" rules="required" v-slot="{ passed, failed }">
                    <fg-input :label="'KOL合約起計月 (' + moment(contract.startAt).format('YYYY-MM-DD') + ')'"
                              :error="failed ? '錯誤': null"
                              :hasSuccess="passed"
                              :name="'contractStartAt' + index">
                      <el-date-picker v-model="contract.startAt"
                                      type="month">
                      </el-date-picker>
                    </fg-input>
                  </ValidationProvider>

                  <ValidationProvider class="col-12 col-lg-4" :name="'contractEndAt' + index" rules="required" v-slot="{ passed, failed }">
                    <fg-input :label="'KOL合約完結月 (' + moment(contract.endAt).format('YYYY-MM-DD') + ')'"
                              :error="failed ? '錯誤': null"
                              :hasSuccess="passed"
                              :name="'contractEndAt' + index">
                      <el-date-picker v-model="contract.endAt"
                                      @input="setContractDate(index, 'endAt', $event)"
                                      type="month">
                      </el-date-picker>
                    </fg-input>
                  </ValidationProvider>
                  <span style="position: absolute; right: -10px;top: calc(60%);" @click="deleteContract(index, contract.id)">刪除</span>
                </li>
              </template>
              <li class="d-flex align-items-center">
                <el-button class="col-12" @click="contracts.push({startAt: null, endAt: null, kolUser: kol, code: voucher.id, active: true, signed: false})">＋增加合約</el-button>
              </li>
            </ol>
          </div>
        </div>
      </form>
    </ValidationObserver>
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>

    <!-- Classic Modal -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">關閉</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {Card, Modal}                                                         from 'src/components/UIComponents'
import {extend}                                                              from "vee-validate";
import {required, numeric, regex, confirmed, max_value}                      from "vee-validate/dist/rules";
import {Loading, Option, Select, Button, DatePicker, Dialog, Upload, Switch} from 'element-ui';
import moment                                                                from 'moment'
import {mapState}                                                            from "vuex";
import Vue                                                                   from "vue";
import UserProfile
                                                                             from "@/components/Dashboard/Views/Pages/UserProfile";
import _                                                                     from "lodash";
import ConfirmDialog
                                                                             from "@/components/Dashboard/Views/Components/ConfirmDialog";

extend("required", required);
extend("numeric", numeric);
extend("regex", regex);
extend("confirmed", confirmed);
extend("max_value", max_value);

export default {
  components : {
    Card,
    [Option.name]     : Option,
    [Select.name]     : Select,
    [Button.name]     : Button,
    [DatePicker.name] : DatePicker,
    [Dialog.name]     : Dialog,
    [Upload.name]     : Upload,
    [Switch.name]     : Switch,
    UserProfile,
    ConfirmDialog
  },
  data () {
    return {
      contracts         : [],
      userSearchLoading : false,
      kolUsers          : [],
      kol               : null,
      voucherTypes      : [{ label : '實扣', value : 'fixed' }, { label : '打折', value : 'percent' }],
      dialogVisible     : false,
      resolve           : null,
      reject            : null,
      date              : {
        startAt : null,
        endAt   : null,
      },
      moment,
      voucher           : {
        remarks : '',
        kolUser : null,
        name    : {
          zh : '將自動生成...',
          en : 'Auto complete...'
        },
        type    : 'percent',
        moq     : 0,
        mov     : 0
      },
    };
  },
  watch   : {
    date            : {
      deep    : true,
      handler : function (val) {
        if (val.startAt) {
          this.voucher.startAt = moment(val.startAt).startOf('day').toISOString()
        }
        if (val.endAt) {
          this.voucher.endAt = moment(val.endAt).endOf('day').toISOString()
        }
      }
    },
    'voucher.type'  : function (value) {
      switch (value) {
        case 'percent':
          this.voucher.name.zh = (100 - this.voucher.value * -1) + '折'
          this.voucher.name.en = (this.voucher.value * -1) + '% off'
          break
        case 'fixed':
          this.voucher.name.zh = '減$' + (this.voucher.value * -1)
          this.voucher.name.en = '$' + (this.voucher.value * -1) + ' discount'
          break
        default:
          break
      }
    },
    'voucher.value' : function (value) {
      switch (this.voucher.type) {
        case 'percent':
          this.voucher.name.zh = (100 - value * -1) + '折'
          this.voucher.name.en = (value * -1) + '% off'
          break
        case 'fixed':
          this.voucher.name.zh = '減$' + (value * -1)
          this.voucher.name.en = '$' + (value * -1) + ' discount'
          break
        default:
          break
      }
    },
    kol             : async function (newval, oldval) {
      if (newval !== oldval) {
        if (!newval && this.voucher.kolUser) {
          const confirmation = await this.$refs.ConfirmDialog.open('解綁Kol', '你確定要移除此優惠碼與KOL用戶的連結？')
          if (confirmation.isConfirmed) {
            return
          } else {
            this.kol = oldval
          }
        }
        if (newval && !this.voucher.kolUser) {
          const checkKolOccupation = await this.$api.get('/v1/vouchers/checkKolOccupation/' + newval)
          if (checkKolOccupation.data) {
            const confirmation = await this.$refs.ConfirmDialog.open('連結失敗', 'KOL已有連結的優惠碼，無法進行連結！')
            this.kol = oldval
          }
        }
      }
    },
  },
  methods : {
    setContractDate (index, key, value) {
      if (key === 'endAt') {
        this.contracts[index][key] = moment(value).endOf('month').toISOString()
      } else {
        this.contracts[index][key] = moment(value).startOf('month').toISOString()
      }
    },
    searchKol (search) {
      this.userSearchLoading = true
      this.debounceData(search)
    },

    async deleteContract (index, id) {
      if (id) {
        await this.$api.delete('/v1/vouchers/kolContracts/' + id)
      } else {
        this.contracts.splice(index, 1)
      }
    },

    debounceData : _.debounce(async function (search) {
      const t = this
      try {
        if (search !== '') {
          const result = await this.$api.get('/v1/users', {
            params : {
              role   : 'kol',
              search : search,
              sortBy : 'createdAt:des'
            }
          })
          this.kolUsers = result.data.results.map(item => ({
            label : `${ item.name }, ${ item.email }`, value : item.id
          }))
        } else {
          this.kolUsers = []
        }
      } catch (e) {
        console.log(e)
      } finally {
        t.userSearchLoading = false
      }
    }, 1000),
    async open (voucherId) {
      this.dialogVisible = true
      if (voucherId) {
        await this.getVoucherDetail(voucherId)
        if (this.kol) {
          await this.getKolContract(this.kol)
        }
      } else {
        this.newVoucher()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    async getKolContract (kol) {
      try {
        const contracts = await this.$api.get('/v1/vouchers/kolContracts/' + kol)
        if (contracts.data) {
          this.contracts = contracts.data.results
        }
      } catch (error) {
        console.log(error)
      }
    },
    newVoucher () {
      this.kol = null
      this.kolUsers = []
      this.contracts = []
      this.date = {
        startAt : moment().startOf('day').toISOString(),
        endAt   : moment('2099-12-31').endOf('day').toISOString(),
      }


      this.voucher = {
        name    : {
          zh : '將自動生成...',
          en : 'Auto complete...'
        },
        type    : 'percent',
        active  : true,
        limited : false,
        remarks : '',
        kolUser : null,
        moq     : 0,
        mov     : 0
      }
    },


    async getVoucherDetail (voucherId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        this.newVoucher()
        const detail = await this.$api.get('/v1/vouchers/' + voucherId)

        const kolUser = _.cloneDeep(detail.data.kolUser)
        if (kolUser) {
          this.kolUsers = [{
            label : `${ kolUser.name }, ${ kolUser.email }`, value : kolUser.id
          }]
          this.kol = kolUser.id
        }

        this.voucher = detail.data
        this.date.startAt = detail.data.startAt
        this.date.endAt = detail.data.endAt

        delete this.voucher.createdAt
        delete this.voucher.updatedAt
        delete this.voucher.usageCnt
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async submit () {
      if (!await this.$refs.form.validate()) return

      const loading = new Loading.service({ fullscreen : false });
      try {
        const valid = await this.$refs.form.validate()
        if (!valid) return

        const voucher = _.pick(this.voucher, ['code', 'name', 'type', 'active', 'limited', 'remarks', 'kolUser',
          'startAt', 'endAt', 'value', 'moq', 'mov', 'availableUsageCnt'])

        if (this.kol) {
          voucher.kolUser = this.kol
        } else {
          voucher.kolUser = null
        }

        // product.voucher = this.ca
        delete voucher.id

        const result = this.voucher.id ? await this.$api.patch('/v1/vouchers/' + this.voucher.id, voucher) : await this.$api.post('/v1/vouchers/', voucher)
        if (result) {
          if (result.data.kolUser) {
            const contracts = await this.$api.post('/v1/vouchers/kolContracts/' + result.data.kolUser, this.contracts)
          }
          this.$notify({
            title   : '成功',
            message : '產品更新成功',
            type    : 'success',
          })
          this.dialogVisible = false
          this.resolve(true)
          this.reset()
        }
      } catch (e) {
        console.log(e)
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
      } finally {
        loading.close()
      }
    },

    close () {
      this.dialogVisible = false
      this.resolve(false)
      this.reset()
    },
    reset () {
      this.date = { startAt : null, endAt : null }
      this.newVoucher()
    }
  }
}
</script>
<style lang="scss">
.no-edit {
  background-color: #eee !important;
}

.el-upload-dragger {
  width: inherit;
  height: inherit;
}

.image-container {
  cursor: pointer;
}
</style>
