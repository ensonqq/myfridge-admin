<template>
  <div class="login-page">
    <div class="wrapper wrapper-full-page">
      <div class="full-page login-page section-image">
        <!--   you can change the color of the filter page using: data-color="blue | azure | green | orange | red | purple" -->
        <div class="content">
          <div class="container">
            <div class="col-lg-4 col-md-6 ml-auto mr-auto">
              <ValidationObserver v-slot="{ handleSubmit }">

                <form @submit.prevent="handleSubmit(login)">
                  <card type="login">
                    <div slot="header" class="header text-center">
                      <img width="70" src="/static/img/logo.png" alt="">
                      <h4>Admin Dashboard</h4>
                    </div>

                    <ValidationProvider name="email"
                                        rules="required|email"
                                        v-slot="{ passed, failed }">
                      <fg-input type="email"
                                :error="failed ? '錯Email': null"
                                :hasSuccess="passed"
                                addon-left-icon="nc-icon nc-single-02"
                                name="email"
                                v-model="form.email">
                      </fg-input>
                    </ValidationProvider>

                    <ValidationProvider name="password"
                                        rules="required"
                                        v-slot="{ passed, failed }">
                      <fg-input type="password"
                                :error="failed ? 'The Password field is required': null"
                                :hasSuccess="passed"
                                addon-left-icon="nc-icon nc-key-25"
                                name="password"
                                v-model="form.password">
                      </fg-input>
                    </ValidationProvider>
                    <!--                  <p-checkbox>-->
                    <!--                    Subscribe to newsletter-->
                    <!--                  </p-checkbox>-->
                    <div class="text-center text-danger">{{ message }}</div>
                    <el-button native-type="submit" style="width: 100%" slot="footer" :loading="loadingLogin" block class="mb-3">登入</el-button>
                  </card>
                </form>
              </ValidationObserver>
            </div>
          </div>
        </div>
        <div class="full-page-background" style="background-color: #1f305f"></div>
      </div>
    </div>
  </div>
</template>
<script>
import {Button}                     from 'element-ui'
import {Card, Checkbox}             from 'src/components/UIComponents';
import AppNavbar                    from './Layout/AppNavbar'
import AppFooter                    from './Layout/AppFooter'
import {extend}                     from "vee-validate";
import {required, email, confirmed} from "vee-validate/dist/rules";
import {mapMutations}               from 'vuex'

extend("email", email);
extend("required", required);
extend("confirmed", confirmed);

export default {
  components : {
    Card,
    AppNavbar,
    AppFooter,
    [Checkbox.name] : Checkbox,
    [Button.name]   : Button
  },
  methods : {
    ...mapMutations(['setUser', 'setTokens']),
    toggleNavbar () {
      document.body.classList.toggle('nav-open')
    },
    closeMenu () {
      document.body.classList.remove('nav-open')
      document.body.classList.remove('off-canvas-sidebar')
    },
    async login () {
      try {
        this.loadingLogin = true
        const response = await this.$api.post('/v1/auth/login', this.form)
        if (response.data) {
          if (response.data.user.role === 'admin' || response.data.user.role === 'super') {
            this.setUser(response.data.user)
            this.setTokens(response.data.tokens)
          } else {
            this.message = "錯誤的登入信息。"
          }
        }
      } catch (error) {
        if (error.response && error.response.data) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          this.message = error.response.data.message
        }
        console.log(error)
      } finally {
        this.loadingLogin = false
      }
    },
  },
  data () {
    return {
      form         : {
        email    : '',
        password : ''
      },
      loadingLogin : false,
      message      : ''
    }
  },
  beforeDestroy () {
    this.closeMenu()
  }
}
</script>
<style>
</style>
