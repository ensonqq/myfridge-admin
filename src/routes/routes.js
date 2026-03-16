//TOBE removed
import testSF          from '../components/Test/testSF'
import DashboardLayout from '../components/Dashboard/Layout/DashboardLayout.vue'
// GeneralViews
import NotFound        from '../components/GeneralViews/NotFoundPage.vue'
// Dashboard pages
const Overview = () => import(/* webpackChunkName: "widgets" */ 'src/components/Dashboard/Views/Dashboard/Overview.vue')
const Widgets = () => import(/* webpackChunkName: "widgets" */ 'src/components/Dashboard/Views/Dashboard/Widgets.vue')

// Pages
import User     from 'src/components/Dashboard/Views/Pages/UserProfile.vue'
import TimeLine from 'src/components/Dashboard/Views/Pages/TimeLinePage.vue'
import Login    from 'src/components/Dashboard/Views/Pages/Login.vue'
import Register from 'src/components/Dashboard/Views/Pages/Register.vue'
import Lock     from 'src/components/Dashboard/Views/Pages/Lock.vue'

// Users
import Users from 'src/components/Dashboard/Views/Users/Users.vue'

// Orders
import Orders      from 'src/components/Dashboard/Views/Orders/Orders.vue'
import OrdersOld   from 'src/components/Dashboard/Views/Orders/OrdersOld.vue'
import OrderDetail from 'src/components/Dashboard/Views/Orders/OrderDetail.vue'

// Invoices
import Invoices from 'src/components/Dashboard/Views/Invoices/Invoices.vue'

// Shop
import Products   from 'src/components/Dashboard/Views/Shop/Products.vue'
import Categories from 'src/components/Dashboard/Views/Shop/Categories.vue'
import Gifts      from '@/components/Dashboard/Views/Shop/Gifts.vue'

// Key Accounts
import KeyAccounts      from 'src/components/Dashboard/Views/KeyAccount/Accounts.vue'
import KeyAccountOrders from 'src/components/Dashboard/Views/KeyAccount/Orders.vue'

// Vouchers
import Vouchers from 'src/components/Dashboard/Views/Voucher/Vouchers.vue'

// KOL Sales
import KOLSales from 'src/components/Dashboard/Views/Kol/Sales.vue'

// Promotions
import Promotions from 'src/components/Dashboard/Views/Promotions/Promotions.vue'

// Promotions
import Retails from 'src/components/Dashboard/Views/Retails/Retails.vue'

// Prizes
import Prizes       from 'src/components/Dashboard/Views/Prizes/Prizes.vue'
import PrizeRecords from 'src/components/Dashboard/Views/Prizes/PrizeRecords.vue'

// Sales
import Sales      from 'src/components/Dashboard/Views/Sales/Sales.vue'
import TopupSales from 'src/components/Dashboard/Views/Sales/TopupSales.vue'


// Sales
import MonthlyRank from 'src/components/Dashboard/Views/MonthlyRank/MonthlyRank.vue'

// Settings
import Settings from 'src/components/Dashboard/Views/Settings/Settings.vue'

// Imports
import VoucherImport from 'src/components/Dashboard/Views/Import/VoucherImport.vue'

// Components pages
import Buttons       from 'src/components/Dashboard/Views/Components/Buttons.vue'
import GridSystem    from 'src/components/Dashboard/Views/Components/GridSystem.vue'
import Panels        from 'src/components/Dashboard/Views/Components/Panels.vue'
import SweetAlert    from 'src/components/Dashboard/Views/Components/SweetAlert.vue'
import Notifications from 'src/components/Dashboard/Views/Components/Notifications.vue'
import Icons         from 'src/components/Dashboard/Views/Components/Icons.vue'
import Typography    from 'src/components/Dashboard/Views/Components/Typography.vue'

// Forms pages
const RegularForms = () => import(/* webpackChunkName: "forms" */ 'src/components/Dashboard/Views/Forms/RegularForms.vue')
const ExtendedForms = () => import(/* webpackChunkName: "forms" */ 'src/components/Dashboard/Views/Forms/ExtendedForms.vue');
const ValidationForms = () => import(/* webpackChunkName: "forms" */ 'src/components/Dashboard/Views/Forms/ValidationForms.vue')
const Wizard = () => import(/* webpackChunkName: "forms" */ 'src/components/Dashboard/Views/Forms/Wizard.vue');

// TableList pages
const RegularTables = () => import(/* webpackChunkName: "tables" */ 'src/components/Dashboard/Views/Tables/RegularTables.vue');
const ExtendedTables = () => import(/* webpackChunkName: "tables" */ 'src/components/Dashboard/Views/Tables/ExtendedTables.vue');
const PaginatedTables = () => import(/* webpackChunkName: "tables" */ 'src/components/Dashboard/Views/Tables/PaginatedTables.vue');
// Maps pages
const GoogleMaps = () => import(/* webpackChunkName: "maps" */ 'src/components/Dashboard/Views/Maps/GoogleMaps.vue')
const FullScreenMap = () => import(/* webpackChunkName: "maps" */ 'src/components/Dashboard/Views/Maps/FullScreenMap.vue')
const VectorMaps = () => import(/* webpackChunkName: "maps" */ 'src/components/Dashboard/Views/Maps/VectorMapsPage.vue');

// Calendar
import Calendar from 'src/components/Dashboard/Views/Calendar/CalendarRoute.vue'

// Top Up
import TopupCards  from "@/components/Dashboard/Views/Topup/TopupCards";
import TopupOrders from "@/components/Dashboard/Views/Topup/TopupOrders";

// Credit Redemption
import CreditRedemption from "@/components/Dashboard/Views/Topup/CreditRedemption"

// Charts
const Charts = () => import(/* webpackChunkName: "widgets" */ 'src/components/Dashboard/Views/Charts.vue')

let usersMenu = {
  path      : '/users',
  component : DashboardLayout,
  redirect  : '/users/member',
  children  : [
    {
      path      : 'admin',
      name      : 'Admins',
      component : Users,
      meta      : { title : '管理員' }
    },
    {
      path      : 'kol',
      name      : 'Kols',
      component : Users,
      meta      : { title : 'Kol' }
    },
    {
      path      : 'member',
      name      : 'Members',
      component : Users,
      meta      : { title : '會員' }
    },
    {
      path      : 'student',
      name      : 'Students',
      component : Users,
      meta      : { title : '學生' }
    },
    {
      path      : 'detail/:id',
      name      : 'UserDetail',
      component : User,
      props     : true
    },
  ]
}

let ordersMenu = {
  path      : '/orders',
  component : DashboardLayout,
  redirect  : '/orders/byCheckoutDay',
  children  : [
    {
      path      : 'byCheckoutDay',
      name      : 'OrdersByCheckOutDate',
      component : Orders,
      meta      : { title : '落單日' }
    },
    {
      path      : 'byDeliveryDayV2',
      name      : 'OrdersByDeliveryDateV2',
      component : Orders,
      meta      : { title : '送貨日(新)' }
    },
    {
      path      : 'byDeliveryDayV1',
      name      : 'OrdersByDeliveryDateV1',
      component : OrdersOld,
      meta      : { title : '送貨日(舊)' }
    },
    {
      path      : 'detail/:orderNumber',
      name      : 'OrderDetail',
      component : OrderDetail,
      props     : true
    },
  ]
}


let shopMenu = {
  path      : '/shop',
  component : DashboardLayout,
  redirect  : '/products/products',
  children  : [
    {
      path      : 'products',
      name      : 'Products',
      component : Products,
      meta      : { title : '所有產品' }
    },
    {
      path      : 'categories',
      name      : 'OrdersByDeliveryDate',
      component : Categories,
      meta      : { title : '所有類別' }
    },
    {
      path      : 'gifts',
      name      : 'Gifts',
      component : Gifts,
      meta      : { title : '購物禮品' }
    }
  ]
}


let KeyAccountsMenu = {
  path      : '/keyAccounts',
  component : DashboardLayout,
  children  : [
    {
      path      : 'accounts',
      name      : 'Accounts',
      component : KeyAccounts,
      meta      : { title : '客戶' }
    },
    {
      path      : 'orders',
      name      : 'Orders',
      component : KeyAccountOrders,
      meta      : { title : '訂單' }
    }
  ]
}


let topupMenu = {
  path      : '/topup',
  component : DashboardLayout,
  children  : [
    {
      path      : 'topups',
      name      : 'Topups',
      component : TopupCards,
      meta      : { title : '增值卡' }
    },
    {
      path      : 'topupOrders',
      name      : 'TopupOrders',
      component : TopupOrders,
      meta      : { title : '增值紀錄' }
    }
  ]
}

let invoiceMenu = {
  path      : '/invoices',
  component : DashboardLayout,
  children  : [
    {
      path      : '/',
      name      : 'invoices',
      component : Invoices,
      meta      : { title : 'Invoice' }
    }
  ]
}


let creditRedemptionMenu = {
  path      : '/credits',
  component : DashboardLayout,
  children  : [
    {
      path      : 'redemption',
      name      : 'CreditRemption',
      component : CreditRedemption,
      meta      : { title : '積分領取' }
    },
  ]
}


let voucherMenu = {
  path      : '/vouchers',
  component : DashboardLayout,
  children  : [
    {
      path      : '',
      name      : 'Vouchers',
      component : Vouchers,
      meta      : { title : '優惠碼' }
    },
  ]
}

let kolMenu = {
  path      : '/kol',
  component : DashboardLayout,
  children  : [
    {
      path      : 'sales',
      name      : 'KOLSales',
      component : KOLSales,
      meta      : { title : 'KOL龍虎榜' }
    },
  ]
}

let PromotionsMenu = {
  path      : '/promotions',
  component : DashboardLayout,
  children  : [
    {
      path      : '',
      name      : 'Promotions',
      component : Promotions,
      meta      : { title : '網站推廣' }
    },
  ]
}

let RetailsMenu = {
  path      : '/retails',
  component : DashboardLayout,
  children  : [
    {
      path      : '',
      name      : 'Retails',
      component : Retails,
      meta      : { title : '零售點' }
    },
  ]
}

let PrizesMenu = {
  path      : '/prizes',
  component : DashboardLayout,
  children  : [
    {
      path      : 'all',
      name      : 'Prizes',
      component : Prizes,
      meta      : { title : '抽獎活動' }
    },
    {
      path      : 'records',
      name      : 'Prizes',
      component : PrizeRecords,
      meta      : { title : '抽獎紀錄' }
    }
  ]
}

let SalesMenu = {
  path      : '/sales',
  component : DashboardLayout,
  children  : [
    {
      path      : 'sales',
      name      : 'Sales',
      component : Sales,
      meta      : { title : '業積表' }
    },
    {
      path      : 'topup',
      name      : 'TopupSales',
      component : TopupSales,
      meta      : { title : '增值表' }
    },
  ]
}

let MonthlyRankMenu = {
  path      : '/monthlyRank',
  component : DashboardLayout,
  children  : [
    {
      path      : '',
      name      : 'MonthlyRank',
      component : MonthlyRank,
      meta      : { title : '每月之星排行 (Top 50)' }
    },
  ]
}


let settingsMenu = {
  path      : '/settings',
  component : DashboardLayout,
  children  : [
    {
      path      : '',
      name      : 'Settings',
      component : Settings,
      meta      : { title : '設定' }
    },
  ]
}

let importMenu = {
  path      : '/import',
  component : DashboardLayout,
  children  : [
    {
      path      : 'VoucherImport',
      name      : 'Settings',
      component : VoucherImport,
      meta      : { title : 'VoucherImport' }
    },
  ]
}

let componentsMenu = {
  path      : '/components',
  component : DashboardLayout,
  redirect  : '/components/buttons',
  children  : [
    {
      path      : 'buttons',
      name      : 'Buttons',
      component : Buttons
    },
    {
      path      : 'grid-system',
      name      : 'Grid System',
      component : GridSystem
    },
    {
      path      : 'panels',
      name      : 'Panels',
      component : Panels
    },
    {
      path      : 'sweet-alert',
      name      : 'Sweet Alert',
      component : SweetAlert
    },
    {
      path      : 'notifications',
      name      : 'Notifications',
      component : Notifications
    },
    {
      path      : 'icons',
      name      : 'Icons',
      component : Icons
    },
    {
      path      : 'typography',
      name      : 'Typography',
      component : Typography
    }

  ]
}

let formsMenu = {
  path      : '/forms',
  component : DashboardLayout,
  redirect  : '/forms/regular',
  children  : [
    {
      path      : 'regular',
      name      : 'Regular Forms',
      component : RegularForms
    },
    {
      path      : 'extended',
      name      : 'Extended Forms',
      component : ExtendedForms
    },
    {
      path      : 'validation',
      name      : 'Validation Forms',
      component : ValidationForms
    },
    {
      path      : 'wizard',
      name      : 'Wizard',
      component : Wizard
    }
  ]
}

let tablesMenu = {
  path      : '/table-list',
  component : DashboardLayout,
  redirect  : '/table-list/regular',
  children  : [
    {
      path      : 'regular',
      name      : 'Regular Tables',
      component : RegularTables
    },
    {
      path      : 'extended',
      name      : 'Extended Tables',
      component : ExtendedTables
    },
    {
      path      : 'paginated',
      name      : 'Paginated Tables',
      component : PaginatedTables
    }]
}

let mapsMenu = {
  path      : '/maps',
  component : DashboardLayout,
  redirect  : '/maps/google',
  children  : [
    {
      path      : 'google',
      name      : 'Google Maps',
      component : GoogleMaps
    },
    {
      path      : 'full-screen',
      name      : 'Full Screen Map',
      component : FullScreenMap
    },
    {
      path      : 'vector-map',
      name      : 'Vector Map',
      component : VectorMaps
    }
  ]
}

let pagesMenu = {
  path      : '/pages',
  component : DashboardLayout,
  redirect  : '/pages/user',
  children  : [
    {
      path      : 'user',
      name      : 'User Page',
      component : User
    },
    {
      path      : 'timeline',
      name      : 'Timeline Page',
      component : TimeLine
    }
  ]
}

let loginPage = {
  path      : '/login',
  name      : 'Login',
  component : Login
}

let registerPage = {
  path      : '/register',
  name      : 'Register',
  component : Register
}

let lockPage = {
  path      : '/lock',
  name      : 'Lock',
  component : Lock
}

const routes = [
  {
    path      : '/',
    component : DashboardLayout,
    redirect  : '/admin/overview',
    children  : [
      {
        path      : 'calendar',
        name      : 'Calendar',
        component : Calendar,
      },
      {
        path      : 'charts',
        name      : 'Charts',
        component : Charts
      }
    ],
  },
  usersMenu,
  ordersMenu,
  shopMenu,
  KeyAccountsMenu,
  topupMenu,
  invoiceMenu,
  creditRedemptionMenu,
  voucherMenu,
  kolMenu,
  PromotionsMenu,
  RetailsMenu,
  PrizesMenu,
  settingsMenu,
  // importMenu,
  SalesMenu,
  MonthlyRankMenu,

  componentsMenu,
  formsMenu,
  tablesMenu,
  mapsMenu,
  pagesMenu,
  loginPage,
  registerPage,
  lockPage,
  {
    path      : '/admin',
    component : DashboardLayout,
    redirect  : '/admin/overview',
    children  : [
      {
        path      : 'overview',
        name      : 'Overview',
        component : Overview
      },
      {
        path      : 'widgets',
        name      : 'Widgets',
        component : Widgets
      }
    ]
  },
  { path : '/test', component : testSF },
  { path : '*', component : NotFound }
];

export default routes
