import Cookies from 'js-cookie'
import _       from 'lodash'
import api     from "@/api/api";
import moment  from 'moment'

export default {
  // set user object
  // control login status
  setUser (state, payload) {
    state.user = payload
  },

  // set access & refresh token in cookies for accessing apis
  setTokens (state, payload) {
    // 14days for access-token, synced with api
    Cookies.set('admin-access-token', payload.access.token, { expires : 14 })

    // 30 days for refresh-token, synced with api
    Cookies.set('admin-refresh-token', payload.refresh.token, { expires : 30 })
  },

  // logout, clear tokens & remove user object in state
  logout (state) {
    state.user = null
    Cookies.remove('admin-access-token')
    Cookies.remove('admin-refresh-token')
  },

  // location data from server
  setLocations (state, payload) {
    state.locations = payload
  },

  // location data from server
  setHolidays (state, payload) {
    state.holidays = payload.map(item => moment(item).format('YYYY-MM-DD'))
  },

  // sku sorting data from server
  setSkuSorting (state, payload) {
    state.skuSorting = payload
  }
}
