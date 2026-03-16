<template>
  <el-dialog title="積分領取資料"
             :visible.sync="dialogVisible"
             class="fix-footer"
             fullscreen>
    <div class="row justify-content-center">

      <div class="col-sm-8 col-12 justify-content-center" v-if="dialogVisible">
        <ValidationObserver v-slot="{ handleSubmit }" ref="form">
          <form @submit.prevent="handleSubmit(submit)">

            <div class="row">
              <div class="col-12">
                <div class="col-12 pl-0">
                  <h5>基本資料</h5>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-2" v-if="creditRedemption.uniqueId">
                  <label class="col-form-label">ID</label>
                  <div class="form-group pa-10">
                    <div class="form-control no-edit">
                      {{ creditRedemption.uniqueId }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6 col-12">
                <div class="mb-2">
                  <ValidationProvider name="namezh" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="名稱(中)*"
                              :error="failed ? '錯中文名': null"
                              :hasSuccess="passed"
                              name="namezh"
                              v-model="creditRedemption.name.zh">
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>
              <div class="col-sm-6 col-12">
                <div class="mb-2">
                  <ValidationProvider name="nameen" rules="required" v-slot="{ passed, failed }">
                    <fg-input type="text"
                              label="名稱(Eng)*"
                              :error="failed ? '錯英文Eng名': null"
                              :hasSuccess="passed"
                              name="nameen"
                              v-model="creditRedemption.name.en">
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>
              <div class="col-sm-6 col-12">
                <div class="mb-2">
                  <ValidationProvider name="credits" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="number"
                              label="獲得積分"
                              :error="failed ? '錯獲得積分，必需為數字': null"
                              :hasSuccess="passed"
                              name="credits"
                              v-model="creditRedemption.credits">
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>
              <div class="col-sm-6 col-12">
                <div class="mb-2">
                  <ValidationProvider name="maxRedeemQty" rules="required|numeric" v-slot="{ passed, failed }">
                    <fg-input type="number"
                              label="領取上限"
                              :error="failed ? '錯領取上限，必需為數字': null"
                              :hasSuccess="passed"
                              name="maxRedeemQty"
                              v-model="creditRedemption.maxRedeemQty">
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>
              <div class="col-sm-6 col-12">
                <div class="mb-2">
                  <label class="col-form-label">發佈狀態</label>
                  <div class="form-group pa-10">
                    <el-switch v-model="creditRedemption.publish"
                               active-color="#13ce66"
                               inactive-color="#ff4949">
                    </el-switch>
                    {{ creditRedemption.publish ? '已發佈' : '未發佈' }}
                  </div>
                </div>
              </div>
            </div>
          </form>

        </ValidationObserver>
      </div>
    </div>
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
import {required, numeric, regex, confirmed}                                 from "vee-validate/dist/rules";
import {Loading, Option, Select, Button, DatePicker, Dialog, Upload, Switch} from 'element-ui';
import moment                                                                from 'moment'
import {mapState}                                                            from "vuex";
import Vue                                                                   from "vue";

extend("required", required);
extend("numeric", numeric);
extend("regex", regex);
extend("confirmed", confirmed);

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
  },
  data () {
    return {
      dialogVisible : false,
      resolve       : null,
      reject        : null,
      moment,

      creditRedemption : {
        name         : {
          zh : '',
          en : ''
        },
        credits      : null,
        maxRedeemQty : null,
        remarks      : '',
        publish      : false,
        images       : []
      },
    };
  },
  watch   : {},
  methods : {

    async open (creditRedemptionId) {
      this.dialogVisible = true

      if (creditRedemptionId) {
        await this.getCreditRedemptionDetail(creditRedemptionId)
      } else {
        this.newCreditRedemption()
      }

      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    newCreditRedemption () {
      this.creditRedemption = {
        name         : {
          zh : '',
          en : ''
        },
        credits      : null,
        maxRedeemQty : null,
        remarks      : '',
        publish      : false,
        images       : []
      }
    },


    async getCreditRedemptionDetail (creditRedemptionId) {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const detail = await this.$api.get('/v1/creditRedemptions/' + creditRedemptionId)
        this.creditRedemption = detail.data
        this.creditRedemption.images = detail.data.images.map(item => item.id)

        delete this.creditRedemption.createdAt
        delete this.creditRedemption.updatedAt
        delete this.creditRedemption.redeemQty
        delete this.creditRedemption.uniqueId
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

        const creditRedemption = _.clone(this.creditRedemption)

        // product.promotion = this.ca
        delete creditRedemption.id
        const result = this.creditRedemption.id ? await this.$api.patch('/v1/creditRedemptions/' + this.creditRedemption.id, creditRedemption) : await this.$api.post('/v1/creditRedemptions/', creditRedemption)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
          this.dialogVisible = false
          this.resolve(true)
          this.reset()
        }
      } catch (e) {
        console.log(e)
        this.$notify.error({ title : '错误', message : '更新失敗' });
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
      this.newCreditRedemption()
    }
  }
}
</script>
<style lang="scss">
.no-edit {
  background-color: #eee !important;
}
</style>
