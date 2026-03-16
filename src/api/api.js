import axios   from 'axios'
import Cookies from 'js-cookie'
import store   from '../store'
// initial base url by host name
const hostname = window.location.hostname
// const localApiRoot = 'https://api.myfridgehk.com'
const localApiRoot = 'http://localhost:3001'
// const localApiRoot = 'https://dev.myfridgehk.com/api'
const devApiRoot = 'https://api-dev.myfridgehk.com'
const prodApiRoot = 'https://api.myfridgehk.com'

const baseURL = hostname === 'm9sj7sd1.myfridgehk.com' ? prodApiRoot : hostname === 'admin-dev.myfridgehk.com' ? devApiRoot : localApiRoot

// api instance with interceptors
const api = axios.create({ baseURL })

// clean instance for refresh tokens
const cleanApiInstance = axios.create({ baseURL })

api.interceptors.request.use(
  async config => {
    // document.body.classList.add('loading')
    config.headers = {
      'Authorization' : `Bearer ${ Cookies.get('admin-access-token') }`,
      'Content-Type'  : 'application/json'
    }

    if (config.data) {
      delete config.data.createdAt
      delete config.data.updatedAt
    }
    return config;
  }, error => {
    // document.body.classList.remove('loading')
    return Promise.reject(error)
  }
)

api.interceptors.response.use(response => {
  // document.body.classList.remove('loading')
  return response
}, error => {
  // document.body.classList.remove('loading')
  const { response, config } = error
  if (response.status !== 401 || config.url.indexOf('/auth/login') > -1) {
    return Promise.reject(error)
  }

  // Use a 'clean' instance of axios without the interceptor to refresh the token. No more infinite refresh loop.
  return cleanApiInstance.post('/v1/auth/refresh-tokens', { refreshToken : `${ Cookies.get('admin-refresh-token') }` })
                         .then((response) => {
                           // If you are using localStorage, update the token and Authorization header here
                           if (!response.data) throw new Error("Connection Error");
                           store.commit('setTokens', response.data)
                           return api(config)
                         })
                         .catch((error) => {
                           store.commit('logout')
                           return Promise.reject(error)
                         })
})

api.myProfile = async function () {
  try {
    if (!Cookies.get('admin-access-token')) return

    const profile = await api.get('/v1/auth/me')
    if (profile) {
      store.commit('setUser', profile.data)
    }
    return true
  } catch (e) {
    console.log(e)
  }
}

api.locations = async function () {
  try {
    const locations = await api.get('/v1/settings/locations')
    if (locations) {
      store.commit('setLocations', locations.data)
    }
    return true
  } catch (e) {
    console.log(e)
  }
}

api.holidays = async function () {
  try {
    const holidays = await api.get('/v1/settings/holidays')

    if (holidays.data) {
      store.commit('setHolidays', holidays.data)
    }
    return true
  } catch (e) {
    console.log(e)
  }
}

api.skuSorting = async function () {
  try {
    const skuSorting = await api.get('/v1/settings/skuSorting')

    if (skuSorting.data) {
      store.commit('setSkuSorting', skuSorting.data)
    }
    return true
  } catch (e) {
    console.log(e)
  }
}

export default api
