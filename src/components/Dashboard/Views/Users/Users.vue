<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title">{{ $route.meta.title }} （共有{{ result.totalResults }}人）
        <el-button @click="getUsers" class="pull-right"><i class="fa fa-refresh"></i></el-button>
      </h5>
    </div>

    <div class="card-body row">
      <div class="col-12 row">
        <div class="col-lg-8 col-12 row">
          <div class="col-lg-2 col-6">
            <fg-input label="訂單量超過" v-model="filters.totalOrders"></fg-input>
          </div>

          <div class="col-lg-2 col-6">
            <fg-input label="總消費超過" v-model="filters.totalSpent"></fg-input>
          </div>

          <div class="col-lg-1 col-6">
            <fg-input label="狀態">
              <el-select size="small" class="select-normal" v-model="filters.status">
                <el-option v-for="option in ['active','deleted', 'banned']"
                           :value="option"
                           :label="option"
                           :key="option">
                </el-option>
              </el-select>
            </fg-input>
          </div>

          <div class="col-lg-1 col-6">
            <fg-input label="等級">
              <el-select size="small" class="select-normal" v-model="filters.vipTier">
                <el-option v-for="option in [{value: null, text: '全部'}, {value: 'normal', text: '普通'}, {value: 'gold', text: '黃金'}, {value: 'diamond', text: '鑽石'}]"
                           :value="option.value"
                           :label="option.text"
                           :key="option.value">
                </el-option>
              </el-select>
            </fg-input>
          </div>

          <div class="col-lg-2 col-6 mt-4">
            <el-button @click="exportUsers()">Export所有用戶</el-button>
          </div>
          <div class="col-lg-2 col-6 mt-4 mb-3">
            <el-button @click="exportUsersEdm()">EDM用戶列表</el-button>
          </div>
          <div class="col-lg-2 col-6 mt-4 mb-3">
            <el-button @click="exportCurrentUsers()">當前用戶列表</el-button>
          </div>
        </div>

        <div class="col-lg-4 col-12">
          <div class="pull-right d-flex">
            <div class="mr-3">
              <el-button @click="openUserProfile()">＋建立新用戶</el-button>
            </div>
            <fg-input class="input-sm"
                      placeholder="搜尋"
                      v-model="filters.search"
                      @keydown.enter="getUsers"
                      addon-right-icon="nc-icon nc-zoom-split">
            </fg-input>
          </div>
        </div>

      </div>
      <div class="col-sm-12">
        <el-table v-loading="loading"
                  empty-text="load緊，唔好急…"
                  :data="result.results"
                  :default-sort="this.sort"
                  @sort-change="sortChange"
                  header-row-class-name="text-primary">
          <el-table-column class-name="action-buttons td-actions" align="left" min-width="100" label="審核" v-if="$route.path.includes('/users/student')">
            <template slot-scope="props">
              <p-button type="primary" @click="verifyStudent(props.row.id)" v-if="props.row.isStudent && props.row.student.status === 'pending'">未審批</p-button>
              <p-button type="success" @click="verifyStudent(props.row.id)" v-if="props.row.isStudent && props.row.student.status === 'approved'">
                <div class="btn-icon">
                  <i class="fa fa-check text--14"></i>已通過
                </div>
              </p-button>
              <p-button type="danger" @click="verifyStudent(props.row.id)" v-if="props.row.isStudent && props.row.student.status === 'rejected'">
                <div class="btn-icon">
                  <i class="fa fa-exclamation-sign text--14"></i>已拒絕
                </div>
              </p-button>
            </template>
          </el-table-column>

          <el-table-column class-name="action-buttons td-actions" align="right" min-width="60" label="">
            <template slot-scope="props">
              <!--              <p-button type="primary" @click="verifyStudent(props.row.id)" v-if="props.row.isStudent && props.row.student.status === 'pending'">未審批</p-button>
                            <p-button type="success" @click="verifyStudent(props.row.id)" v-if="props.row.isStudent && props.row.student.status === 'approved'">
                              <div class="btn-icon">
                                <i class="fa fa-check text&#45;&#45;14"></i>已通過
                              </div>
                            </p-button>
                            <p-button type="danger" @click="verifyStudent(props.row.id)" v-if="props.row.isStudent && props.row.student.status === 'rejected'">
                              <div class="btn-icon">
                                <i class="fa fa-exclamation-sign text&#45;&#45;14"></i>已拒絕
                              </div>
                            </p-button>-->
              <p-button type="success" icon @click="openUserProfile(props.row.id)">
                <i class="fa fa-user"></i>
              </p-button>
            </template>
          </el-table-column>

          <el-table-column prop="email" sortable label="Email" min-width="300">
            <template slot-scope="props">
              <span v-if="props.row.vipTier === 'gold'" style="color: #f88f02">(金)</span>
              <span v-if="props.row.vipTier === 'diamond'" style="color: #431ec8">(鑽)</span>
              {{ props.row.email }}
              <span v-if="props.row.isStudent"
                    :class="[getStatusClass(props.row.student.status, props.row.student.endAt)]">
                (學生{{ getStatus(props.row.student.status, props.row.student.endAt) }})</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" sortable label="名稱" min-width="180">
            <template slot-scope="props">
              <i v-if="props.row.gender === 'f'" style="color: #d74cc0" class="fa fa-female"></i>
              <i v-else class="fa fa-male" style="color: #1e3ac8"></i>
              {{ props.row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="addresses" label="電話" min-width="180">
            <template slot-scope="props">
              <div v-if="props.row.addresses.length" v-html="getPhones(props.row.addresses).join('<br>')"></div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column prop="credits" sortable label="積分"/>
          <el-table-column prop="totalOrders" sortable label="訂單量" min-width="100"/>
          <el-table-column prop="totalSpent" sortable label="總銷費" min-width="100">
            <template slot-scope="props">${{ props.row.totalSpent }}</template>
          </el-table-column>
          <el-table-column prop="role" label="權限"/>
          <el-table-column prop="status" label="狀態"/>
          <el-table-column prop="createdAt" sortable label="註冊日" min-width="120">
            <template slot-scope="props">{{ moment(props.row.createdAt).format('YYYY-MM-DD') }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="col-12 mt-3 row">
        <div class="col-sm-6 pagination-info">
          <p class="category">{{ (result.page - 1) * result.limit + 1 }} 至 {{ result.page * result.limit }} (共{{ result.totalResults }}個結果)</p>
        </div>
        <div class="col-sm-6">
          <p-pagination class="pull-right" v-model="filters.page" :per-page="result.limit" :total="result.totalResults"></p-pagination>
        </div>
      </div>
    </div>
    <UserProfile ref="UserProfile"></UserProfile>
    <VerifyStudent ref="VerifyStudent"></VerifyStudent>
  </div>
</template>

<script>
import {DatePicker, TimeSelect, Slider, Tag, Input, Button, Select, Option} from 'element-ui'
import Vue                                                                  from 'vue'
import {Table, TableColumn}                                                 from 'element-ui'
import PSwitch
                                                                            from 'src/components/UIComponents/Switch.vue'
import PPagination
                                                                            from 'src/components/UIComponents/Pagination.vue'
import UserProfile                                                          from '../Pages/UserProfile'
import VerifyStudent                                                        from '../Pages/VerifyStudent'
import moment                                                               from 'moment'
import _                                                                    from 'lodash'

Vue.use(Table)
Vue.use(TableColumn)
export default {
  name       : "Users",
  components : {
    [Button.name] : Button,
    [Select.name] : Select,
    [Option.name] : Option,
    PSwitch,
    PPagination,
    UserProfile,
    VerifyStudent
  },
  watch      : {
    $route (to, from) {
      this.filters.role = to.path.includes('/users/admin') ? 'admin' : 'user'
      if (this.$route.path.includes('/users/student')) {
        this.filters.isStudent = true
        this.sort = { prop : '', order : '' }
      } else {
        this.filters.isStudent = null
        this.sort = { prop : 'createdAt', order : 'descending' }
      }
    },
    filters : {
      deep    : true,
      handler : function () {
        this.getUsers()
      }
    },
    sort    : {
      deep    : true,
      handler : function () {
        this.getUsers()
      }
    },
  },
  created () {
    const path = this.$route.path
    switch (path) {
      case '/users/admin':
        this.filters.role = 'admin'
        break
      case '/users/kol':
        this.filters.role = 'kol'
        break
      case '/users/member':
        this.filters.role = 'user'
        break
      case '/users/student':
        this.filters.role = 'user'
        break
      default:
        break
    }

    if (path.includes('/users/student')) {
      this.filters.isStudent = true
      this.sort = { prop : '', order : '' }
    } else {
      this.filters.isStudent = null
      this.sort = { prop : 'createdAt', order : 'descending' }
    }
  },

  methods : {
    getPhones (addresses) {
      let phones = addresses.map(address => address.phone)
      phones = _.union(phones);
      return phones
    },
    getStatusClass (status, endAt) {
      let statusClass = ''
      switch (status) {
        case 'approved':
          statusClass = moment().isAfter(moment(endAt)) ? 'text-gray' : 'text-success'
          break
        case 'rejected':
          statusClass = 'text-danger'
          break
        default:
          statusClass = 'text-primary'
          break
      }
      return statusClass
    },

    getStatus (status, endAt) {
      if (status === 'approved' && moment().isAfter(moment(endAt))) {
        return '已完結'
      }
      return this.studentStatuses[status]
    },

    exportUsers () {
      this.$api.get('/v1/users/export/all/', { responseType : 'blob' }).then(response => {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `allusers_${ +moment().format('YYYYMMDDHHMM') }.csv`// whatever your file name .
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();// you need to remove that elelment which is created before.
      }).catch(error => {
        console.log(error)
      })
    },

    exportUsersEdm () {
      this.$api.get('/v1/users/export/all/edm', { responseType : 'blob' }).then(response => {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `edm_users_${ +moment().format('YYYYMMDDHHMM') }.csv`// whatever your file name .
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();// you need to remove that elelment which is created before.
      }).catch(error => {
        console.log(error)
      })
    },

    async exportCurrentUsers () {
      const params = { ...t.filters }
      if (this.sort.order) {
        params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
      }

      this.$api.get('/v1/users/export/current', { responseType : 'blob' }).then(response => {
      }).catch(error => {
        console.log(error)
      })
    },

    async openUserProfile (userId) {
      const result = await this.$refs.UserProfile.open(userId)
      if (result) {
        //DO STH
      }
    },

    async verifyStudent (userId) {
      const result = await this.$refs.VerifyStudent.open(userId)
      if (result) {
        //DO STH
        this.getUsers()
      }
    },

    sortChange ({ prop, order }) {
      this.sort = { prop, order }
    },

    getUsers () {
      const t = this
      t.loading = true
      t.result.results = []
      this.debounceData()
    },

    sortByArray (source, by, sourceTransformer = _.identity) {
      const indexesByElements = new Map(by.map((item, idx) => [item, idx]));
      const orderedResult = _.sortBy(source, (p) => indexesByElements.get(sourceTransformer(p)));
      return orderedResult;
    },

    debounceData : _.debounce(async function () {
      const t = this
      try {
        const params = { ...t.filters }
        if (this.sort.order) {
          params.sortBy = this.sort.prop + (this.sort.order === 'descending' ? ':desc' : '')
        }
        const users = await t.$api.get('/v1/users', { params })
        if (users && users.data) {
          const order = ["pending", "rejected", "approved"];
          const sorted = _.sortBy(users.data.results, (o) => order.indexOf(o.student.status))
          users.data.results = sorted
          t.result = users.data
        }
      } catch (e) {
        console.log(e)
      } finally {
        t.loading = false
      }
    }, 1000),

    ucFirst (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    ,
    handleDelete (index, row) {
      alert(`Delete user is prohibited!`)
    }
    ,
  },
  data () {
    return {
      studentStatuses : {
        approved : '通過',
        rejected : '被拒絕',
        pending  : '等待審批',
      },
      loading         : false,
      moment,
      sort            : { prop : 'createdAt', order : 'descending' },
      filters         : {
        role        : '',
        search      : '',
        vipTier     : null,
        isStudent   : null,
        totalOrders : null,
        totalSpent  : null,
        page        : 1,
        limit       : 100,
        status      : 'active'
      },
      result          : {
        limit        : 0,
        page         : 0,
        total        : 0,
        totalResults : 0,
        totalPages   : 0,
        results      : []
      },
    }
  }
}
</script>

<style scoped>

</style>
