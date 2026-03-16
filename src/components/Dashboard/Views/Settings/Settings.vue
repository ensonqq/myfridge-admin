<template>
  <div class="extended-forms">
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-12">
            <h4 class="card-title">網站公告(深藍色橫額) : <b>myfridge.com</b></h4>
            <ValidationProvider name="alert"
                                rules="required"
                                v-slot="{ passed, failed }">
              <fg-input :error="failed ? '錯誤': null"
                        :hasSuccess="passed"
                        name="alert"
                        type="text"
                        label="公告"
                        v-model="alertData.alert"></fg-input>
            </ValidationProvider>
          </div>
          <div class="col-12">
            <el-button class="pull-right" @click="saveAlert">儲存</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-12">
            <h4 class="card-title">學生網站公告(深藍色橫額) : <b>student.myfridge.com</b></h4>
            <ValidationProvider name="alert"
                                rules="required"
                                v-slot="{ passed, failed }">
              <fg-input :error="failed ? '錯誤': null"
                        :hasSuccess="passed"
                        name="alert"
                        type="text"
                        label="公告"
                        v-model="studentAlertData.alert"></fg-input>
            </ValidationProvider>
          </div>
          <div class="col-12">
            <el-button class="pull-right" @click="saveStudentAlert">儲存</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-12">
            <h4 class="card-title">關閉送貨日(提交的日子不派貨)</h4>
            <el-tag v-for="(holiday, index) in holidayTags.dynamicTags"
                    :key="holiday"
                    type="primary"
                    :closable="true"
                    :close-transition="false"
                    @close="removeTag('holidayTags',holiday)">
              {{ holiday }}
            </el-tag>

            <el-date-picker type="date"
                            class="ml-3"
                            value-format="yyyy-MM-dd"
                            @change="handleInputConfirm('holidayTags', $event)"
                            v-model="holidayTags.inputValue"
                            placeholder="">
            </el-date-picker>
            <br/>
          </div>
          <div class="col-12">
            <el-button class="pull-right" @click="saveHolidays">儲存</el-button>
          </div>
        </div>
      </div>
    </div> <!-- end card -->

<!--    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-12">
            <h4 class="card-title">列印排板 (拖拽標簽排序)</h4>
            <p>*控制Print單的產品排序／訂單總結的產品排序</p>
            <draggable v-model="skuSortTags.dynamicTags">
              <el-tag :key="index"
                      v-for="(tag,index) in skuSortTags.dynamicTags"
                      type="primary"
                      :closable="true"
                      class="pointer"
                      :close-transition="false"
                      @close="removeTag('skuSortTags',tag)">
                {{ index + 1 }}: {{ products[tag] }}
              </el-tag>

              &lt;!&ndash;              <input type="text" placeholder="加入產品進行排板" class="form-control input-new-tag"&ndash;&gt;
              &lt;!&ndash;                     v-model="skuSortTags.inputValue"&ndash;&gt;
              &lt;!&ndash;                     ref="saveTagInput"&ndash;&gt;
              &lt;!&ndash;                     size="mini"&ndash;&gt;
              &lt;!&ndash;                     @keyup.enter="handleInputConfirm('skuSortTags', skuSortTags.inputValue)"&ndash;&gt;
              &lt;!&ndash;                     @blur="handleInputConfirm('skuSortTags', skuSortTags.inputValue)"/>&ndash;&gt;

              <div class="d-inline-block ml-3">
                <el-select placeholder="加入產品進行排板"
                           class="select-normal w-100"
                           clearable
                           v-model="skuSortTags.inputValue"
                           @change="handleInputConfirm('skuSortTags', skuSortTags.inputValue)"
                           filterable>
                  <el-option v-for="(internalName, id) in products"
                             :key="id"
                             v-if="skuSortTags.dynamicTags.indexOf(id) === -1"
                             :label="internalName"
                             :value="id">
                  </el-option>
                </el-select>
              </div>
            </draggable>
          </div>
          <div class="col-12">
            <el-button class="pull-right" @click="saveSkuSortTags">儲存</el-button>
          </div>
        </div>
      </div>
    </div>-->

    <!--  user registration settings  -->
    <div class="card">
      <div class="card-body">
        <ValidationObserver v-slot="{ handleSubmit }" ref="registerCredits">
          <form @submit.prevent="handleSubmit(setRegisterCredits)">
            <div class="row">
              <div class="col-md-12">
                <h4 class="card-title">新用戶註冊驗證獲得積分</h4>
                <ValidationProvider name="registerCredits"
                                    rules="required|numeric"
                                    v-slot="{ passed, failed }">
                  <fg-input :error="failed ? '錯誤': null"
                            :hasSuccess="passed"
                            name="registerCredits"
                            type="number"
                            label="註冊驗證積分"
                            v-model="registerCredits"></fg-input>
                </ValidationProvider>
              </div>
              <div class="col-12">
                <el-button class="pull-right" @click="setRegisterCredits">儲存</el-button>
              </div>
            </div>
          </form>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>
<script>
import PProgress                                                                     from 'src/components/UIComponents/Progress.vue'
import PSwitch
                                                                                     from 'src/components/UIComponents/Switch.vue'
import {DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option, Loading} from 'element-ui'
import _                                                                             from 'lodash'
import {mapState}                                                                    from 'vuex'
import draggable                                                                     from 'vuedraggable'

export default {
  components : {
    [DatePicker.name] : DatePicker,
    [TimeSelect.name] : TimeSelect,
    [Slider.name]     : Slider,
    [Tag.name]        : Tag,
    [Input.name]      : Input,
    [Button.name]     : Button,
    [Option.name]     : Option,
    [Select.name]     : Select,
    draggable,
    PSwitch,
    PProgress
  },

  computed : {
    ...mapState(['holidays', 'skuSorting'])
  },

  data () {
    return {
      registerCredits  : 0,
      alertData        : { alert : null },
      studentAlertData : { alert : null },
      products         : {},
      holidayTags      : {
        dynamicTags : [],
        inputValue  : ''
      },
      skuSortTags      : {
        dynamicTags : [],
        inputValue  : ''
      },
      datePicker       : '',
      dateTimePicker   : '',
      timePicker       : ''
    }
  },

  watch : {
    // tags
    holidays : {
      deep    : true,
      handler : function (val) {
        this.holidayTags.dynamicTags = _.clone(val)
      }
    },

    // tags
    skuSorting : {
      deep    : true,
      handler : function (val) {
        this.skuSortTags.dynamicTags = _.clone(val)
      }
    }
  },

  mounted () {
    //  holidays
    this.holidayTags.dynamicTags = _.clone(this.holidays)
  },

  created () {
    this.getProducts()
    this.getAlert()
    this.getStudentAlert()
    this.getRegisterCredits()
    this.skuSortTags.dynamicTags = _.clone(this.skuSorting)
  },

  methods : {
    async saveAlert () {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.post('/v1/settings/alert', this.alertData)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
          await this.getAlert()
        }
      } catch (e) {
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
      } finally {
        loading.close()
      }
    },

    async getRegisterCredits () {
      const loading = Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.get('/v1/settings/registerCredits')
        if (result.data) {
          this.registerCredits = result.data.value
        }
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async setRegisterCredits () {
      if (!await this.$refs.registerCredits.validate()) return
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.post('/v1/settings/registerCredits', { value : this.registerCredits })
        if (result) {
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
          await this.getRegisterCredits()
        }
      } catch (e) {
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
      } finally {
        loading.close()
      }
    },

    async saveStudentAlert () {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.post('/v1/settings/studentAlert', this.studentAlertData)
        if (result) {
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
          await this.getStudentAlert()
        }
      } catch (e) {
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
      } finally {
        loading.close()
      }
    },

    async getProducts () {
      const loading = Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.get('/v1/products')
        const products = {}
        if (result.data.results) {
          result.data.results.forEach(item => {
            products[item.id] = item.internalName
          })
          this.products = products
        }
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async getAlert () {
      const loading = Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.get('/v1/settings/alert')
        if (result.data) {
          this.alertData = result.data.value
        }
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async getStudentAlert () {
      const loading = Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.get('/v1/settings/studentAlert')
        if (result.data) {
          this.studentAlertData = result.data.value
        }
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async saveHolidays () {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.post('/v1/settings/holidays', this.holidayTags.dynamicTags)
        if (result) {
          await this.$api.holidays()
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
        }
      } catch (e) {
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
      } finally {
        loading.close()
      }
    },
    async saveSkuSortTags () {
      const loading = new Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.post('/v1/settings/skuSorting', this.skuSortTags.dynamicTags)
        if (result) {
          await this.$api.skuSorting()
          this.$notify({
            title   : '成功',
            message : '更新成功',
            type    : 'success',
          })
          this.getProducts()
        }
      } catch (e) {
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
      } finally {
        loading.close()
      }
    },
    removeTag (data, tag) {
      this[data].dynamicTags.splice(this[data].dynamicTags.indexOf(tag), 1)
    },

    handleInputConfirm (data, val) {
      let inputValue = this[data].inputValue
      if (inputValue && this[data].dynamicTags.indexOf(val) === -1) {
        this[data].dynamicTags.push(val)
      }
      this[data].inputValue = ''
    }
  }
}
</script>
<style>
.extended-forms .el-select {
  width: 100%;
}

.el-tag.pointer {
  cursor: pointer !important;
}
</style>
