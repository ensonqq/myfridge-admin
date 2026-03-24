<template>
  <ValidationObserver v-slot="{ handleSubmit }" ref="form">
    <form @submit.prevent="handleSubmit(save)">
      <!-- Classic Modal -->
      <modal :show.sync="addCategoryGroupModal" header Classes="justify-content-center">
        <h4 slot="header" class="title title-up">建立大分類</h4>
        <div>
          <div class="row">
            <div class="col-12">
              <ValidationProvider name="zhname" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="大類別名稱(中文)"
                          :error="failed ? '錯名': null"
                          :hasSuccess="passed"
                          name="zhname"
                          v-model="categoryGroup.name.zh">
                </fg-input>
              </ValidationProvider>
            </div>

            <div class="col-12">
              <ValidationProvider name="enname" rules="required" v-slot="{ passed, failed }">
                <fg-input type="text"
                          label="大類別名稱(Eng)"
                          :error="failed ? '錯名': null"
                          :hasSuccess="passed"
                          name="enname"
                          v-model="categoryGroup.name.en">
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
  name       : "AddCategoryGroupModal",
  data       : () => ({
    categoryGroup         : { name : { zh : '', name : '' } },
    addCategoryGroupModal : false,
    resolve               : null,
    reject                : null,
  }),
  methods    : {
    async open () {
      this.addCategoryGroupModal = true

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
        const valid = await this.$refs.form.validate()
        if (!valid) return

        const result = await this.$api.post('/v1/categories/groups', this.categoryGroup).catch(e => console.log(e))
        this.resolve(result.data)
      } catch (error) {
        console.log(error)
      } finally {
        this.reset()
      }
    },

    reset () {
      this.addCategoryGroupModal = false
      this.categoryGroup = { name : { zh : '', name : '' } }
    }
  }
}
</script>
