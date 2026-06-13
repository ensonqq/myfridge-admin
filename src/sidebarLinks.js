export default [
  {
    name         : '主板',
    icon         : 'fa fa-bar-chart',
    path         : '/admin/overview',
    roleRequired : 'super'
  },
  {
    name         : '銷售',
    icon         : 'fa fa-file-text',
    roleRequired : 'super',
    children     : [
      {
        name         : '業積表',
        path         : '/sales/sales',
        roleRequired : 'super'
      },
      {
        name         : '增值表',
        path         : '/sales/topup',
        roleRequired : 'super'
      }
    ],
  },
  // {
  //   name : '每月排行',
  //   icon : 'fa fa-gittip',
  //   path : '/monthlyRank',
  // },
  {
    name     : '用戶',
    icon     : 'nc-icon nc-circle-10',
    roleRequired : 'super',
    children : [
      {
        name : '管理員',
        path : '/users/admin',
        roleRequired : 'super'
      },
      /*{
        name : 'KOL',
        path : '/users/kol'
      },*/
      {
        name : '會員',
        path : '/users/member',
        roleRequired : 'super'
      },
      /*{
        name : '學生',
        path : '/users/student'
      }*/
    ]
  },
  {
    name     : '訂單',
    icon     : 'fa fa-list-alt',
    roleRequired : 'super',
    children : [
      {
        name : '落單日',
        path : '/orders/byCheckoutDay',
        roleRequired : 'super',
      },
      {
        name : '送貨日',
        path : '/orders/byDeliveryDayV2',
        roleRequired : 'super'
      },
      // {
      //   name : '送貨日(舊)',
      //   path : '/orders/byDeliveryDayV1'
      // }
    ]
  },
  {
    name     : '商店',
    icon     : 'nc-icon nc-basket',
    children : [
      {
        name : '產品',
        path : '/shop/products'
      },
      {
        name : '類別',
        path : '/shop/categories'
      },
      {
        name : '禮品',
        path : '/shop/gifts'
      },
    ]
  },
  /*  {
   name     : '商業客戶',
   icon     : 'nc-icon nc-air-baloon',
   children : [
   {
   name : '客戶',
   path : '/keyAccounts/accounts'
   },
   {
   name : '訂單',
   path : '/keyAccounts/orders'
   },
   ]
   },*/
  {
    name     : '積分',
    icon     : 'nc-icon nc-credit-card',
    roleRequired : 'super',
    children : [
      {
        name : '增值紀錄',
        path : '/topup/topupOrders',
        roleRequired : 'super',
      },
      {
        name : '積分卡',
        path : '/topup/topups',
        roleRequired : 'super'
      },
      // {
      //   name : '積分領取',
      //   path : '/credits/redemption'
      // },
    ]
  },
  {
    name : '優惠碼',
    icon : 'fa fa-bolt',
    path : '/vouchers',
    roleRequired : 'super'
  },
  {
    name     : '抽獎',
    icon     : 'fa fa-money',
    roleRequired : 'super',
    children : [
      {
        name : '抽獎活動',
        path : '/prizes/all',
        roleRequired : 'super'
      },
      {
        name : '抽獎紀錄',
        path : '/prizes/records',
        roleRequired : 'super'
      },
    ]

  },
  /*{
   name         : 'KOL業積',
   icon         : 'fa fa-instagram',
   path         : '/kol/sales',
   roleRequired : 'super',
   },*/
  {
    name : '優惠Banner',
    icon : 'fa fa-glass',
    path : '/promotions',
    roleRequired : 'super'
  },
  {
    name : '零售點',
    icon : 'fa fa-sitemap',
    path : '/retails',
    roleRequired : 'super'
  },
  // {
  //   name     : '帳單',
  //   icon     : 'fa fa-book',
  //   children : [
  //     {
  //       name : '所有帳單',
  //       path : '/invoices/'
  //     },
  //   ]
  //
  // },
  {
    name : '設定',
    icon : 'fa fa-cog',
    path : '/settings',
    roleRequired : 'super'
  },
  /*{
   name     : 'Pages',
   icon     : 'nc-icon nc-book-bookmark',
   children : [
   {
   name : 'Timeline',
   path : '/pages/timeline'
   },
   {
   name : 'User Profile',
   path : '/pages/user'
   },
   {
   name : 'Login',
   path : '/login'
   },
   {
   name : 'Register',
   path : '/register'
   },
   {
   name : 'Lock',
   path : '/lock'
   }
   ]
   },
   {
   name     : 'Components',
   icon     : 'nc-icon nc-layout-11',
   children : [{
   name : 'Buttons',
   path : '/components/buttons'
   },
   {
   name : 'Grid System',
   path : '/components/grid-system'
   },
   {
   name : 'Panels',
   path : '/components/panels'
   },
   {
   name : 'Sweet Alert',
   path : '/components/sweet-alert'
   },
   {
   name : 'Notifications',
   path : '/components/notifications'
   },
   {
   name : 'Icons',
   path : '/components/icons'
   },
   {
   name : 'Typography',
   path : '/components/typography'
   }]
   },
   {
   name     : 'Forms',
   icon     : 'nc-icon nc-ruler-pencil',
   children : [{
   name : 'Regular Forms',
   path : '/forms/regular'
   },
   {
   name : 'Extended Forms',
   path : '/forms/extended'
   },
   {
   name : 'Validation Forms',
   path : '/forms/validation'
   },
   {
   name : 'Wizard',
   path : '/forms/wizard'
   }
   ]
   },
   {
   name      : 'Table List',
   icon      : 'nc-icon nc-single-copy-04',
   collapsed : true,
   children  : [{
   name : 'Regular Tables',
   path : '/table-list/regular'
   },
   {
   name : 'Extended Tables',
   path : '/table-list/extended'
   },
   {
   name : 'Paginated Tables',
   path : '/table-list/paginated'
   }
   ]
   },
   {
   name     : 'Maps',
   icon     : 'nc-icon nc-pin-3',
   children : [{
   name : 'Google Maps',
   path : '/maps/google'
   },
   {
   name : 'Full Screen Maps',
   path : '/maps/full-screen'
   },
   {
   name : 'Vector Maps',
   path : '/maps/vector-map'
   }
   ]
   },
   {
   name : 'Widgets',
   icon : 'nc-icon nc-box',
   path : '/admin/widgets'
   },
   {
   name : 'Charts',
   icon : 'nc-icon nc-chart-bar-32',
   path : '/charts'
   },
   {
   name : 'Calendar',
   icon : 'nc-icon nc-calendar-60',
   path : '/calendar'
   },*/
]
