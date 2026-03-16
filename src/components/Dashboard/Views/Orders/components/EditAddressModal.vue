<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(save)">
      <!-- Classic Modal -->
      <modal :show.sync="editAddressModal" header Classes="justify-content-center">
        <h4 slot="header" class="title title-up">编辑地址</h4>
        <div>
          <div class="row">
            <div class="col-12">
              <ValidationProvider name="recipient" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          label="收貨人"
                          name="recipient"
                          v-model="address.recipient">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="col-12">
              <ValidationProvider name="phone" rules="required|numeric" v-slot="{ passed, failed }">
                <fg-input type="text"
                          :error="failed ? '錯電話': null"
                          :hasSuccess="passed"
                          label="電話"
                          name="phone"
                          v-model="address.phone">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="col-12">
              <ValidationProvider name="area" rules="required" v-slot="{ passed, failed }">
                <fg-input :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          label="港九新界"
                          name="area">
                  <el-select class="select-normal"
                             size="large"
                             placeholder=""
                             v-model="address.area">
                    <el-option v-for="option in areas"
                               :value="option.value"
                               :label="option.text"
                               :key="option.value">
                    </el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>
            </div>
            <div class="col-12">
              <ValidationProvider name="district" rules="required" v-slot="{ passed, failed }">
                <fg-input :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          label="18區"
                          name="district">
                  <el-select class="select-normal"
                             size="large"
                             placeholder=""
                             v-model="address.district">
                    <el-option v-for="option in getDistricts"
                               :value="option"
                               :label="option"
                               :key="option">
                    </el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>
            </div>


            <div class="col-12">
              <ValidationProvider name="subDistrict" rules="required" v-slot="{ passed, failed }">
                <fg-input :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          label="地區"
                          name="subDistrict">
                  <el-select class="select-normal"
                             size="large"
                             placeholder=""
                             v-model="address.subDistrict">
                    <el-option v-for="option in getSubDistricts"
                               :value="option"
                               :label="option"
                               :key="option">
                    </el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="col-12">
              <ValidationProvider name="fullAddress" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="詳細地址"
                          :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          name="fullAddress"
                          v-model="address.fullAddress">
                </fg-input>
              </ValidationProvider>
            </div>
          </div>
        </div>
        <template slot="footer">
          <div class="left-side">
            <p-button type="default" link @click="close">取消</p-button>
          </div>
          <div class="divider"></div>
          <div class="right-side">
            <p-button type="danger" native-type="submit" link>確定</p-button>
          </div>
        </template>
      </modal>
    </form>
  </ValidationObserver>
</template>

<script>
import {Modal}                   from "@/components/UIComponents";
import {Loading, Select, Option} from "element-ui";
import {mapState}                from "vuex";

export default {
  components : {
    Modal,
    [Option.name] : Option,
    [Select.name] : Select,
  },
  name       : "AddItemModal",
  data       : () => ({
    areas            : [{ text : '港島', value : 'hk' }, { text : '九龍', value : 'kln' },
      { text : '新界', value : 'nt' }],
    item             : { product : null, quantity : null, unitPrice : null },
    editAddressModal : false,
    resolve          : null,
    reject           : null,
    products         : [],
    address          : {
      area        : "",
      district    : "",
      fullAddress : "",
      phone       : "",
      recipient   : "",
      subDistrict : ""
    }
  }),
  computed   : {
    ...mapState(['locations']),
    getDistricts () {
      const area = this.address.area
      if (this.locations && area) {
        return Object.keys(this.locations.locations[area])
      }
      return []
    },
    getSubDistricts () {
      const area = this.address.area
      const district = this.address.district
      if (this.locations && area && district) {
        return this.locations.locations[area][district]
      }
      return []
    }
  },
  methods    : {
    async open (address) {
      this.editAddressModal = true
      this.address = _.cloneDeep(address)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    close () {
      this.reset()
      this.resolve(false)
    },

    async save () {
      try {
        return this.resolve(_.cloneDeep(this.address))
      } catch (error) {
        console.log(error)
        this.close()
      } finally {
        this.reset()
      }
    },

    reset () {
      this.editAddressModal = false
      this.address = {
        area        : "",
        district    : "",
        fullAddress : "",
        phone       : "",
        recipient   : "",
        subDistrict : ""
      }
    }
  }
}
</script>
