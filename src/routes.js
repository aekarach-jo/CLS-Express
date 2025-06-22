/* eslint-disable */
import { lazy } from 'react';
import { USER_ROLE } from 'constants.js';
import { DEFAULT_PATHS } from 'config.js';
import { hi } from 'date-fns/locale';

const importData = {
  list: lazy(() => import('views/import-data/ImportData')),
};

const parcel = {
  list: lazy(() => import('views/parcel/Parcel')),
};

const bill = {
  list: lazy(() => import('views/bill/Bill')),
  detail: lazy(() => import('views/bill-detail/BillDetail')),
};

const payment = {
  list: lazy(() => import('views/payment/Payment')),
  detail: lazy(() => import('views/payment-detail/PaymentDetail')),
};

const topup = {
  list: lazy(() => import('views/topup/Topup')),
};

const packing = {
  list: lazy(() => import('views/packing/Packing')),
  detail: lazy(() => import('views/packing-detail/PackingDetail')),
};

const incomeExpenses = {
  list: lazy(() => import('views/incomeExpenses/IncomeExpenses')),
  detail: lazy(() => import('views/incomeExpenses-detail/IncomeExpensesDetail')),
};

const report = {
  accounting: lazy(() => import('views/report/Accounting')),
  incomeExpenses: lazy(() => import('views/report/IncomeExpenses')),
  returnParcel: lazy(() => import('views/report/ReturnParcel')),
  daily: lazy(() => import('views/report/Daily')),
};

const setting = {
  currencyList: lazy(() => import('views/setting/currency/Currency')),
  currencyDetail: lazy(() => import('views/setting/currency-detail/CurrencyDetail')),
  customerLevel: lazy(() => import('views/setting/customer-level/CustomerLevel')),
  customerLevelDetail: lazy(() => import('views/setting/customer-level-detail/CustomerLevelDetail')),
  customer: lazy(() => import('views/setting/customer/Customer')),
  customerDetail: lazy(() => import('views/setting/customer-detail/CustomerDetail')),
  department: lazy(() => import('views/setting/department/Department')),
  departmentDetail: lazy(() => import('views/setting/department-detail/DepartmentDetail')),
  user: lazy(() => import('views/setting/user/User')),
  userDetail: lazy(() => import('views/setting/user-detail/UserDetail')),
  role: lazy(() => import('views/setting/role/Role')),
  roleDetail: lazy(() => import('views/setting/role-detail/RoleDetail')),
};

const appRoot = DEFAULT_PATHS.APP.endsWith('/') ? DEFAULT_PATHS.APP.slice(1, DEFAULT_PATHS.APP.length) : DEFAULT_PATHS.APP;

const routesAndMenuItems = {
  mainMenuItems: [
    {
      path: `${appRoot}/`,
      exact: true,
      redirect: true,
      to: `${appRoot}/import-data`,
    },
    {
      path: `${appRoot}/import-data`,
      component: importData.list,
      label: 'menu.import-data',
      icon: 'download',
      protected: true,
      hideInMenu: false,
      subs: [{ path: '/new', label: 'menu.new', component: importData.detail, hideInMenu: true }],
    },
    {
      path: `${appRoot}/parcel`,
      component: parcel.list,
      label: 'menu.parcel',
      icon: 'archive',
      protected: true,
      hideInMenu: false,
      // roles: [USER_ROLE.Admin],
      subs: [{ path: '/new', label: 'menu.new', component: parcel.detail, hideInMenu: true }],
    },
    {
      path: `${appRoot}/bill`,
      component: bill.list,
      label: 'menu.bill',
      icon: 'money',
      protected: true,
      hideInMenu: false,
      // roles: [USER_ROLE.Admin],
      subs: [
        { path: '/new', label: 'menu.new', component: bill.detail, hideInMenu: true },
        { path: '/:id', label: 'menu.edit', component: bill.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appRoot}/payment`,
      component: payment.list,
      label: 'menu.payment',
      icon: 'button-group',
      protected: true,
      hideInMenu: false,
      subs: [
        { path: '/new', label: 'menu.new', component: payment.detail, hideInMenu: true },
        { path: '/:id', label: 'menu.edit', component: payment.detail, hideInMenu: true },
      ],
    },

    // {
    //   path: `${appRoot}/packing`,
    //   component: packing.list,
    //   label: 'Packing',
    //   icon: 'button-group',
    //   protected: true,
    //   hideInMenu: true,
    //   subs: [
    //     { path: '/new', label: 'menu.new', component: packing.detail, hideInMenu: true },
    //     { path: '/:id', label: 'menu.edit', component: packing.detail, hideInMenu: true },
    //   ],
    // },
    {
      path: `${appRoot}/income`,
      component: incomeExpenses.list,
      label: 'menu.incomeExpenses',
      icon: 'bookmark',
      protected: true,
      hideInMenu: false,
      subs: [
        { path: '/new', label: 'menu.new', component: incomeExpenses.detail, hideInMenu: true },
        { path: '/:id', label: 'menu.edit', component: incomeExpenses.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appRoot}/topup`,
      component: topup.list,
      label: 'Topup',
      icon: 'button-group',
      protected: true,
      hideInMenu: false,
    },
    {
      path: `${appRoot}/report`,
      label: 'menu.report',
      icon: 'file-chart',
      exact: true,
      redirect: true,
      protected: true,
      hideInMenu: false,
      subs: [
        { path: '/accounting', label: 'menu.accounting', component: report.accounting, hideInMenu: false },
        { path: '/incomeExpenses', label: 'menu.incomeExpenses', component: report.incomeExpenses, hideInMenu: false },
        { path: '/returnParcel', label: 'menu.returnParcel', component: report.returnParcel, hideInMenu: false },
        { path: '/daily', label: 'menu.daily', component: report.daily, hideInMenu: false },
      ],
    },
    {
      path: `${appRoot}/setting`,
      label: 'menu.setting',
      icon: 'gear',
      exact: true,
      redirect: true,
      protected: true,
      hideInMenu: false,
      subs: [
        { path: '/currency', label: 'menu.currency', component: setting.currencyList, exact: true },
        { path: '/currency/new', component: setting.currencyDetail, hideInMenu: true },
        { path: '/currency/:id', component: setting.currencyDetail, hideInMenu: true },
        { path: '/customer-level', label: 'menu.customerLevel', component: setting.customerLevel, exact: true },
        { path: '/customer-level/new', component: setting.customerLevelDetail, hideInMenu: true },
        { path: '/customer-level/:id', component: setting.customerLevelDetail, hideInMenu: true },
        { path: '/customer', label: 'menu.customer', component: setting.customer, exact: true },
        { path: '/customer/new', component: setting.customerDetail, hideInMenu: true },
        { path: '/customer/:id', component: setting.customerDetail, hideInMenu: true },
        { path: '/role', label: 'menu.role', component: setting.role, exact: true },
        { path: '/role/new', component: setting.roleDetail, hideInMenu: true },
        { path: '/role/:id', component: setting.roleDetail, hideInMenu: true },
        { path: '/department', label: 'menu.department', component: setting.department, exact: true },
        { path: '/department/new', component: setting.departmentDetail, hideInMenu: true },
        { path: '/department/:id', component: setting.departmentDetail, hideInMenu: true },
        { path: '/user', label: 'menu.user', component: setting.user, exact: true },
        { path: '/user/new', component: setting.userDetail, hideInMenu: true },
        { path: '/user/:id', component: setting.userDetail, hideInMenu: true },
      ],
    },
  ],
  sidebarItems: [],
};
export default routesAndMenuItems;
