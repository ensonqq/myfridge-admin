<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(save)">
      <!-- Classic Modal -->
      <modal :show.sync="addItemModal" header Classes="justify-content-center">
        <h4 slot="header" class="title title-up">增加物品到訂單</h4>
        <div>
          <div class="row">
            <div class="col-12">
              <ValidationProvider name="required" rules="required" v-slot="{ passed, failed }">
                <fg-input label="選擇物品">
                  <el-select :error="failed ? '不能留空': null"
                             placeholder=""
                             :hasSuccess="passed"
                             class="select-normal w-100" v-model="item.product" filterable>
                    <el-option v-for="item in products"
                               :key="item.id"
                               :label="item.name.zh"
                               :value="JSON.stringify(item)">
                    </el-option>
                  </el-select>
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="col-12">
              <ValidationProvider name="required"
                                  rules="required"
                                  v-slot="{ passed, failed }">
                <fg-input :error="failed ? '不能留空': null"
                          :hasSuccess="passed"
                          type="number"
                          label="設定數量"
                          v-model="item.quantity">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="col-12" v-if="getAddons.length">
              <ValidationProvider name="required" rules="required" v-slot="{ passed, failed }">
                <fg-input label="選擇附加">
                  <el-select :error="failed ? '不能留空': null"
                             placeholder=""
                             :hasSuccess="passed"
                             class="select-normal w-100" v-model="item.addons" filterable>
                    <el-option v-for="item in getAddons"
                               :key="item.name.zh"
                               :label="item.name.zh"
                               :value="JSON.stringify(item)">
                    </el-option>
                  </el-select>
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

export default {
  components : {
    Modal,
    [Option.name] : Option,
    [Select.name] : Select,
  },
  name       : "AddItemModal",
  computed   : {
    getAddons () {
      if (this.item.product) {
        const product = JSON.parse(this.item.product)
        return product.addons && product.addons.length ? product.addons.map(item => ({ ...item, _id : undefined })) : []
      }
      return []
    }

  },
  data       : () => ({
    item         : { product : null, quantity : null, unitPrice : null, addons : undefined },
    addItemModal : false,
    resolve      : null,
    reject       : null,
    products     : []
  }),
  methods    : {
    async getProducts () {
      const loading = Loading.service({ fullscreen : false });
      try {
        const result = await this.$api.get('/v1/products')
        this.products = result.data.results
      } catch (error) {
        console.log(error)
      } finally {
        loading.close()
      }
    },

    async open (editAddressIndex) {
      await this.getProducts()
      this.addItemModal = true

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
        const product = JSON.parse(this.item.product)
        const addons = this.item.addons ? JSON.parse(this.item.addons) : undefined
        const item = {
          product, quantity : this.item.quantity, unitPrice : product.discountPrice || product.price, addons
        }
        this.resolve(item)
      } catch (error) {

      } finally {
        this.reset()
      }
    },

    reset () {
      this.addItemModal = false
      this.item = { category : null, quantity : null, unitPrice : null }
    }
  }
}
</script>
