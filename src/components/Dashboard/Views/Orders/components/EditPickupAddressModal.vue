<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(save)">
      <!-- Classic Modal -->
      <modal :show.sync="editPickupAddressModal" header Classes="justify-content-center">
        <h4 slot="header" class="title title-up">選擇自取點</h4>
        <div>
          <div class="row">
            <div class="col-12" v-if="address.recipient">
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

            <div class="col-12" v-if="address.phone">
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
                          label="選擇自取點"
                          :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          name="fullAddress"
                          class="hidden"
                          v-model="address.fullAddress">

                </fg-input>
              </ValidationProvider>

              <div class="col-12 pl-0 d-flex flex-wrap" v-if="address.subDistrict">
                <div class="col-12 pl-0 pb-2">
                  <div class="mb-1 black--text">
                    <i class="fa fa-map-marker"></i>選取自取點
                  </div>
                </div>
                <div class="col-12 px-0">
                  <div v-for="(point,index) in pickupPoints[address.subDistrict]"
                       :key="index" class="pickup-address py-2"
                       :class="{selected: index === selected}"
                       @click.prevent="selectPickupPoint(point, index)">
                    <hr v-if="index > 0">
                    <div class="col-12">
                      <ul style="list-style: none" class="pl-0">
                        <li>{{ index + 1 }}. {{ point.shortAddress }} {{ selected === index ? '(已選取)' : '' }}</li>
                        <li class="text-12 d-flex align-start">
                          <i class="fa fa-map-marker"></i>
                          <div class="ml-1">{{ point.fullAddress }}</div>
                        </li>
                        <li class="text-12 d-flex align-start">
                          <i class="fa fa-time"></i>
                          <div class="ml-1" v-html="point.workingHour.split(' ').join('<br>')"></div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="d-flex justify-center align-center">
                <span class="grey--text text--darken-2">請先選擇區域，地區及分區</span>
              </div>
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
import _                         from 'lodash'
import {Modal}                   from "@/components/UIComponents";
import {Loading, Select, Option} from "element-ui";
import {mapState}                from "vuex";

export default {
  components : {
    Modal,
    [Option.name] : Option,
    [Select.name] : Select,
  },
  name       : "EditPickupAddressModal",
  data       : () => ({
    selected               : null,
    areas                  : [{ text : '港島', value : 'hk' }, { text : '九龍', value : 'kln' },
      { text : '新界', value : 'nt' }],
    item                   : { product : null, quantity : null, unitPrice : null },
    editPickupAddressModal : false,
    resolve                : null,
    reject                 : null,
    pickupPoints           : null,
    products               : [],
    address                : {
      area        : '',
      district    : '',
      subDistrict : '',
      fullAddress : '',
      code        : '',
      workingHour : '',
      recipient   : '',
      phone       : '',
    }
  }),
  computed   : {
    ...mapState(['locations']),
    getDistricts () {
      const area = this.address.area
      if (this.locations && area) {
        const locations = this.locations.locations
        const availableAreas = []
        for (let district in locations[area]) {
          const availableSubDistricts = Object.keys(this.pickupPoints)
          const subDistrictsInSelectedArea = locations[area][district]
          const presents = _.intersectionWith(availableSubDistricts, subDistrictsInSelectedArea, _.isEqual);
          if (presents.length) {
            availableAreas.push(district)
          }
        }
        return availableAreas
      }
      return []
    },
    getSubDistricts () {
      const area = this.address.area
      const district = this.address.district
      if (this.locations && area && district) {
        const availableSubDistricts = Object.keys(this.pickupPoints)
        return _.intersectionWith(availableSubDistricts, this.locations.locations[area][district], _.isEqual);
      }
      return []
    }
  },
  methods    : {
    selectPickupPoint (point, index) {
      this.selected = index
      this.address.fullAddress = point.fullAddress
      this.address.code = point.code
      this.address.workingHour = point.workingHour
    },
    async open (address) {
      const pickupPoints = await this.$api.get('/v1/settings/pickupPoints')
      this.pickupPoints = pickupPoints.data
      if (address) {
        this.address = _.cloneDeep(address)
      }
      this.editPickupAddressModal = true
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
        this.resolve(_.cloneDeep(this.address))
      } catch (error) {
        console.log(error)
        this.close()
      } finally {
        this.reset()
      }
    },

    reset () {
      this.editPickupAddressModal = false
      this.address = {
        area        : '',
        district    : '',
        subDistrict : '',
        fullAddress : '',
        code        : '',
        workingHour : ''
      }
    }
  }
}
</script>
<style lang="scss">
.selected {
  background-color: #eee;
}
</style>
