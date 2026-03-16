<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(save)">
      <!-- Classic Modal -->
      <modal :show.sync="showModal" header Classes="justify-content-center">
        <h4 slot="header" class="title title-up">一次過更改當前產品折扣價錢</h4>
        <div class="px-0">
          <div class="row">
            <div class="col-12">共會更改以下{{ products.length }}件產品折扣價錢</div>
            <el-tag :key="index"
                    v-for="(product,index) in products"
                    type="primary"
                    :closable="true"
                    class="pointer"
                    :close-transition="false"
                    @close="removeItem(index)">
              <!--              <img width="20" v-if="product.images[0]" :src="product.images[0].small.path"></img>-->
              {{ product.name.zh }}
            </el-tag>
          </div>
          <div class="row">
            <div class="col-12">
              <ValidationProvider name="required" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="折扣價錢"
                          :error="failed ? '錯名': null"
                          :hasSuccess="passed"
                          name="name"
                          v-model="price">
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
    <ConfirmDialog ref="ConfirmDialog"></ConfirmDialog>
  </ValidationObserver>
</template>

<script>
import {Modal}                        from "@/components/UIComponents";
import {Loading, Select, Option, Tag} from "element-ui";
import ConfirmDialog                  from "@/components/Dashboard/Views/Components/ConfirmDialog";
import _                              from 'lodash'

export default {
  components : {
    Modal,
    [Option.name] : Option,
    [Select.name] : Select,
    [Tag.name]    : Tag,
    ConfirmDialog
  },
  name       : "BulkUpdateProductPriceModal",
  data       : () => ({
    products  : [],
    price     : 0,
    showModal : false,
    resolve   : null,
    reject    : null,
  }),
  methods    : {
    removeItem (index) {
      this.products.splice(index, 1)
    },
    async open (products) {
      this.showModal = true
      this.products = _.cloneDeep(products)

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
      const loading = new Loading.service({ fullscreen : false });
      try {
        const confirmation = await this.$refs.ConfirmDialog.open(`更改折扣價錢`, `確定將當前商品(${ this.products.length }件貨)的折扣價改為 $${ this.price } 嗎？`)

        if (confirmation.isConfirmed) {
          const productIds = this.products.map(item => item.id)
          const updateBody = { discountPrice : this.price }
          const result = await this.$api.patch('/v1/products/bulkUpdateDiscountPrice', { productIds, updateBody })
          if (result.data) {
            this.resolve(true)
            this.reset()
          }
        } else {
          return false
        }
      } catch (e) {
        console.log(e)
        if (e.response && e.response.data) {
          this.$notify.error({ title : '错误', message : e.response.data.message });
        } else {
          this.$notify.error({ title : '错误', message : '這是一條错誤的提示訊息！' });
        }
        // this.reset()
      } finally {
        loading.close()
      }
    },

    reset () {
      this.showModal = false
      this.products = []
      this.price = 0
    }
  }
}
</script>
