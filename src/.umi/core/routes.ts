// @ts-nocheck
import React from 'react';
import { ApplyPluginsType, dynamic } from '/Users/duhongzheng/Documents/deyuan/afcm-web/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';
import LoadingComponent from '@/components/PageLoading/index';

export function getRoutes() {
  const routes = [
  {
    "path": "/user",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'layouts__BlankLayout' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/layouts/BlankLayout'), loading: LoadingComponent}),
    "routes": [
      {
        "name": "guide",
        "path": "/user/guide",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__user__guide' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/user/guide'), loading: LoadingComponent}),
        "exact": true
      },
      {
        "name": "dev-login",
        "path": "/user/dev-login",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__user__devLogin' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/user/devLogin'), loading: LoadingComponent}),
        "exact": true
      },
      {
        "name": "comm-page",
        "path": "/user/comm-page",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__trainCommission__trainAgreement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/trainCommission/trainAgreement'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  },
  {
    "path": "/",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'layouts__SecurityLayout' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/layouts/SecurityLayout'), loading: LoadingComponent}),
    "routes": [
      {
        "path": "/",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'layouts__BasicLayout' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/layouts/BasicLayout'), loading: LoadingComponent}),
        "routes": [
          {
            "path": "/",
            "redirect": "/welcome",
            "exact": true
          },
          {
            "path": "/welcome",
            "name": "welcome",
            "icon": "SmileOutlined",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__CosWelcome' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/CosWelcome'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/language",
            "name": "afcm.language",
            "icon": "UnorderedListOutlined",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__language__language' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/language/language'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/base",
            "name": "afcm.base",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/base/commConfig",
                "name": "commConfig",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__commConfig' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/commConfig'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/base/agFeeConfig",
                "name": "agFeeConfig",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__agFeeConfig' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/agFeeConfig'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/base/cntr",
                "name": "cntr",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/base/cntr/discount",
                    "name": "discount",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__cntr__discount__discount' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/cntr/discount/discount'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/base/cntr/contacts",
                    "name": "bkgParty",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__cntr__contacts__bkgParty' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/cntr/contacts/bkgParty'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/base/cntr/agmt-mail",
                    "name": "agmtMail",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__cntr__agmtMail__searchPreAgreementMailFeeAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/cntr/agmtMail/searchPreAgreementMailFeeAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/base/cntr/agt-area-conf",
                    "name": "agtAreaConf",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__cntr__agtAreaConf__searchPreAgencyAreaAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/cntr/agtAreaConf/searchPreAgencyAreaAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/base/cntr/white-configuration",
                    "name": "whiteConfiguration",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__cntr__WhiteConfiguration' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/cntr/WhiteConfiguration'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/base/cstm",
                "name": "cstm",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/base/cstm/cntc-port",
                    "name": "cntcPort",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__cstm__cntcPort__agcCntcPort' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/cstm/cntcPort/agcCntcPort'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/base/configuration",
                "name": "configuration",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__configuration' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/configuration'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/base/agent-data",
                "name": "agentData",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__agentData' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/agentData'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/base/generate-reimbur",
                "name": "generateReimburConfig",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__generateReimburConfig' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/generateReimburConfig'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/base/port-agent",
                "name": "portAgent",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__portAgent' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/portAgent'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/base/office-agent",
                "name": "officeAgent",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__base__officeAgent' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/base/officeAgent'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/agreement",
            "name": "afcm.agreement",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/agreement/comm-stl",
                "name": "commission",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/user/comm-page",
                    "name": "maintenance",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__agmt__searchPreCommissionAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/agmt/searchPreCommissionAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/agreement/comm-stl/agmt/cacl-comm-stl-agmtList",
                    "name": "search-cacl-commission-agmtList",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__agmt__searchCaclCommissionAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/agmt/searchCaclCommissionAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/agreement/comm-stl/agmt/Demurrage",
                    "name": "Demurrage",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__agmt__Demurrage' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/agmt/Demurrage'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/agreement/loc-cha",
                "name": "local-charge",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/agreement/loc-cha/sea-pre-loc-cha-agmt",
                    "name": "local-charge-agreement",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LocalChargeAgreementView__subpage__searchPreLocalChargeAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/LocalChargeAgreementView/subpage/searchPreLocalChargeAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/agreement/loc-cha/sea-cal-loc-cha-agmt",
                    "name": "local-charge-computation-protocol",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LocalChargeAgreementView__subpage__searchCaclLocalChargeAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/LocalChargeAgreementView/subpage/searchCaclLocalChargeAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/agreement/loc-cha/IBS-Comis-Agrent",
                    "name": "IBS-return-commission-agreement",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LocalChargeAgreementView__commissionAgreementt__searchCaclIBSCommissionAgreementt' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/LocalChargeAgreementView/commissionAgreementt/searchCaclIBSCommissionAgreementt'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/agreement/agen",
                "name": "agency",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/agreement/agen/agmt/index",
                    "name": "agencyFee",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__agmt__searchPreAgencyFeeAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/agmt/searchPreAgencyFeeAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/agreement/agen/agmt/sea-agen-agmt",
                    "name": "searchCaclAgencyFeeAgmtList",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__agmt__searchCaclAgencyFeeAgmtList' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/agmt/searchCaclAgencyFeeAgmtList'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/agreement/protocolGroup",
                "name": "protocolGroup",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/agreement/protocolGroup/index",
                    "name": "maintain",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__protocolGroup__index' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/protocolGroup/index'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/agreement/inspireAgFee",
                "name": "inspireAgFee",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/agreement/inspireAgFee/calcProtocol",
                    "name": "calcProtocol",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__inspireAgFee__calcProtocol' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/inspireAgFee/calcProtocol'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/agreement/croossBooking",
                "name": "croossBooking",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/agreement/croossBooking/totalCSOuploaded",
                    "name": "totalCSOuploaded",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__croossBooking__totalCSOuploaded' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/croossBooking/totalCSOuploaded'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              }
            ]
          },
          {
            "path": "/settlement",
            "name": "afcm.comm",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/settlement/comm-stl/er",
                "name": "er",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/settlement/comm-stl/er/esti-unlock",
                    "name": "unlock",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__er__EstimatedUnlock' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/er/EstimatedUnlock'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/er/generate-estimate",
                    "name": "gen-comm",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__er__GenerateCommissionEstimate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/er/GenerateCommissionEstimate'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/er/in-process",
                    "name": "pending-comm",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__er__PendingCommissionEstimate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/er/PendingCommissionEstimate'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/er/query-estimated",
                    "name": "est-cost",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__er__QueryEstimatedCost' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/er/QueryEstimatedCost'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/er/query-sheet",
                    "name": "est-sheet",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__er__QueryEstimateSheet' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/er/QueryEstimateSheet'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/settlement/comm-stl/ar",
                "name": "ar",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/settlement/comm-stl/ar/gener-invoice",
                    "name": "gen-inv",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__ar__GenerateaPInvoice' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/ar/GenerateaPInvoice'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/ar/query-ap",
                    "name": "qy-comm",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__ar__QueryaPCommission' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/ar/QueryaPCommission'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/ar/query-invoice",
                    "name": "qy-inv",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__ar__QueryaPInvoice' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/ar/QueryaPInvoice'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/settlement/comm-stl/cr",
                "name": "cr",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/settlement/comm-stl/cr/generate-carry",
                    "name": "gen-reimb",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__cr__GenerateCarryForwardReimbursement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/cr/GenerateCarryForwardReimbursement'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/cr/payment-Bills",
                    "name": "pending-reimb",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__cr__PaymentBillsPendingSettlement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/cr/PaymentBillsPendingSettlement'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/cr/paid-commission",
                    "name": "paid-comm",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__cr__PaidCommission' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/cr/PaidCommission'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/comm-stl/cr/bill-paid",
                    "name": "bill-paid",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__cr__BillPaid' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/cr/BillPaid'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/settlement/commissions/bas-sement",
                "name": "bas-ver",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/settlement/commissions/bas-sement/gen-bill",
                    "name": "gen-ret-bl",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__basicVersionReimbursement__generatingReportBill' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/basicVersionReimbursement/generatingReportBill'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/bas-sement/local-billing",
                    "name": "lal-chrge-gen-bl",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__basicVersionReimbursement__LocalChargeGeneratesBilling' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/basicVersionReimbursement/LocalChargeGeneratesBilling'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/bas-sement/bill-processed",
                    "name": "bill-be-pro",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__basicVersionReimbursement__BillsToBeProcessed' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/basicVersionReimbursement/BillsToBeProcessed'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/bas-sement/re-inquiry",
                    "name": "rep-bl-deta-iqry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__basicVersionReimbursement__ReportTheBillDetailsForInquiry' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/basicVersionReimbursement/ReportTheBillDetailsForInquiry'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/bas-sement/un-query",
                    "name": "un-qry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__basicVersionReimbursement__UnclaimedQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/basicVersionReimbursement/UnclaimedQuery'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/settlement/commissions/end-ser-bus-set",
                "name": "ext-stl",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/settlement/commissions/end-ser-bus-set/index",
                    "name": "qry-cal-rst",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__extendedServicesBusinessSettlement__extendedServicesBusinessSettlement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/extendedServicesBusinessSettlement/extendedServicesBusinessSettlement'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/end-ser-bus-set/que-his-query",
                    "name": "qry-his-qry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__extendedServicesBusinessSettlement__QueryHistoryQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/extendedServicesBusinessSettlement/QueryHistoryQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/end-ser-bus-set/ope-inco-sta",
                    "name": "ope-fee-sta",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__extendedServicesBusinessSettlement__operationFeeIncomeStatement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/extendedServicesBusinessSettlement/operationFeeIncomeStatement'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/end-ser-bus-set/ope-cost-stan",
                    "name": "ope-fee-cost-sta",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__extendedServicesBusinessSettlement__operationFeeCostStatement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/extendedServicesBusinessSettlement/operationFeeCostStatement'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/end-ser-bus-set/ope-cha-der",
                    "name": "ope-chrg-der",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__extendedServicesBusinessSettlement__operationChargeDerivation' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/extendedServicesBusinessSettlement/operationChargeDerivation'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/settlement/commissions/end-ser-bus-set/ex-his-que",
                    "name": "exp-his-qry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__extendedServicesBusinessSettlement__exportingAHistoryQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/extendedServicesBusinessSettlement/exportingAHistoryQuery'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              }
            ]
          },
          {
            "path": "/Cal-query",
            "name": "afcm.CalFeeQy",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/Cal-query/Query-comm",
                "name": "qyComm",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/Cal-query/Query-comm/Comm-Results",
                    "name": "qy-comm-cal-fee",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__comprehensive__QueryCommissionCalculationResults' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/comprehensive/QueryCommissionCalculationResults'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/Cal-query/comm-sive",
                "name": "comp",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/Cal-query/comm-sive/Comm-History",
                    "name": "qy-comm-hist-info",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__comprehensive__QueryCommissionHistoryInformation' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/comprehensive/QueryCommissionHistoryInformation'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/Cal-query/comm-sive/Comm-Status",
                    "name": "qy-comm-st",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__comprehensive__QueryCommissionStatus' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/comprehensive/QueryCommissionStatus'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/Cal-query/comm-sive/Histor-Edition",
                    "name": "bas-hist-info",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__comprehensive__HistoricalInformationOfBasicEdition' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/comprehensive/HistoricalInformationOfBasicEdition'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/Cal-query/comm-sive/OfBasic",
                    "name": "bas-iuu-qy",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__commissions__comprehensive__QueryOfBasicVersionNotReported' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/commissions/comprehensive/QueryOfBasicVersionNotReported'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/Cal-query/age-query",
                "name": "qy-AF",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/Cal-query/age-query/que-result",
                    "name": "qy-cal",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__agentFeeCalculationResultsQuery__queryCalculationResult' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/agentFeeCalculationResultsQuery/queryCalculationResult'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/Cal-query/agent-historical",
                "name": "qy-AF-hist",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/Cal-query/agent-historical/query-Historical",
                    "name": "qy-hist-info",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__agentFeeHistoricalDataQuery__queryHistoricalInformation' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/agentFeeHistoricalDataQuery/queryHistoricalInformation'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/Cal-query/agent-historical/query-base",
                    "name": "qy-bas-hist-info",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__agentFeeHistoricalDataQuery__queryTheBaseVersionHistoryInformation' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/agentFeeHistoricalDataQuery/queryTheBaseVersionHistoryInformation'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              }
            ]
          },
          {
            "path": "/ag-fee",
            "name": "afcm.agfee-stl",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/ag-fee/estm-fee",
                "name": "estimateFee",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/estm-fee/estm-unlock",
                    "name": "unlock",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__estimateFee__estimateUnlock' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/estimateFee/estimateUnlock'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/estm-fee/gen-cost-estm",
                    "name": "generateCost",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__estimateFee__generateCostEstimate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/estimateFee/generateCostEstimate'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/estm-fee/pd-cost-estm",
                    "name": "pendingCost",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__estimateFee__pendingCostEstimate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/estimateFee/pendingCostEstimate'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/estm-fee/estm-cost-query",
                    "name": "costQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__estimateFee__estimateCostQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/estimateFee/estimateCostQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/estm-fee/estm-sheet-query",
                    "name": "sheetQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__estimateFee__estimateSheetQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/estimateFee/estimateSheetQuery'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/ag-fee/acc-cha",
                "name": "acc-chrg",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/acc-cha/gen-invo-rec",
                    "name": "gen-inv-rec",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accruedCharge__generateInvoiceReceivable' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accruedCharge/generateInvoiceReceivable'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/acc-cha/inq-about-expen-rec",
                    "name": "inq-but-ex-rec",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accruedCharge__inquireAboutExpensesReceivable' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accruedCharge/inquireAboutExpensesReceivable'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/acc-cha/inq-of-inv-rec",
                    "name": "inq-inv-rec",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accruedCharge__inquiryOfInvoiceReceivable' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accruedCharge/inquiryOfInvoiceReceivable'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/ag-fee/cfd-pay-exps",
                "name": "carryFwdPay",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/cfd-pay-exps/gen-cfd-bill",
                    "name": "generateBill",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__carryForwardPayExpenses__generateCarryForwardBill' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/carryForwardPayExpenses/generateCarryForwardBill'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/cfd-pay-exps/pay-bill-set",
                    "name": "PendingBill",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__carryForwardPayExpenses__payBillsPendingSettlement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/carryForwardPayExpenses/payBillsPendingSettlement'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/cfd-pay-exps/query-pay-exps",
                    "name": "queryExpenses",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__carryForwardPayExpenses__queryPayExpenses' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/carryForwardPayExpenses/queryPayExpenses'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/cfd-pay-exps/query-pay-reimb",
                    "name": "queryReimbur",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__carryForwardPayExpenses__queryPayReimbursement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/carryForwardPayExpenses/queryPayReimbursement'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/ag-fee/in-fee",
                "name": "in-fee",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/in-fee/kpl-query",
                    "name": "kpl-cal-reu-qry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__incentiveFee__kplCalculationResultQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/incentiveFee/kplCalculationResultQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/in-fee/kpl-bill",
                    "name": "kpl-gen-rep-bl",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__incentiveFee__kplGeneratesTheReportBill' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/incentiveFee/kplGeneratesTheReportBill'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/in-fee/kpl-reported",
                    "name": "kpl-be-proce-rep",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__incentiveFee__kpltoBeProcessedAndReported' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/incentiveFee/kpltoBeProcessedAndReported'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/in-fee/kpl-inquiry",
                    "name": "kpl-rep-bl-deta-iqry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__incentiveFee__kplReportBillDetailsInquiry' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/incentiveFee/kplReportBillDetailsInquiry'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/ag-fee/bas-bursement",
                "name": "bas-ver-rei",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/bas-bursement/gen-reportBill",
                    "name": "gen-rep-bl",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__basicVersionReimbursement__generatingReportBill' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/basicVersionReimbursement/generatingReportBill'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/bas-bursement/bill-processed",
                    "name": "bl-pro",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__basicVersionReimbursement__BillsToBeProcessed' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/basicVersionReimbursement/BillsToBeProcessed'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/bas-bursement/re-inquiry",
                    "name": "rep-bl-bet-iqry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__basicVersionReimbursement__ReportTheBillDetailsForInquiry' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/basicVersionReimbursement/ReportTheBillDetailsForInquiry'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/bas-bursement/un-query",
                    "name": "un-qry",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__basicVersionReimbursement__UnclaimedQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/basicVersionReimbursement/UnclaimedQuery'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/ag-fee/acc-monitor",
                "name": "checkMonitor",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/acc-monitor/check-month",
                    "name": "checkMonth",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accountCheckMonitor__checkAccountSameMonth' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accountCheckMonitor/checkAccountSameMonth'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/acc-monitor/sap-distribute",
                    "name": "sapUserRecord",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accountCheckMonitor__sapBillUserDistribute' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accountCheckMonitor/sapBillUserDistribute'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/acc-monitor/afs-not",
                    "name": "afsRecord",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accountCheckMonitor__afsHeadquartersAccountDistribute' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accountCheckMonitor/afsHeadquartersAccountDistribute'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/acc-monitor/afs-distribute",
                    "name": "afsNoRecord",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__accountCheckMonitor__afsHeadquartersNoAccountDistribute' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/accountCheckMonitor/afsHeadquartersNoAccountDistribute'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/ag-fee/clr-clearance",
                "name": "cla-acc-exp",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/ag-fee/clr-clearance/whld-withholding",
                    "name": "wit-exp-cle",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__clearingOfAccruedExpenses__withheldExpensesToBeCleared' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/clearingOfAccruedExpenses/withheldExpensesToBeCleared'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/clr-clearance/in-expenses",
                    "name": "inq-bout-with-exp",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__clearingOfAccruedExpenses__inquireAboutWithholdingExpenses' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/clearingOfAccruedExpenses/inquireAboutWithholdingExpenses'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/ag-fee/clr-clearance/sta-balance",
                    "name": "stat-with-bal",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__agencyFee__clearingOfAccruedExpenses__statisticsOfWithholdingBalance' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/agencyFee/clearingOfAccruedExpenses/statisticsOfWithholdingBalance'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              }
            ]
          },
          {
            "path": "/rpt-form",
            "name": "afcm.reportForm",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/rpt-form/unreportedQuery",
                "name": "unreportedQuery",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__unreportedQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/unreportedQuery'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/rpt-form/statisticsReport",
                "name": "statisticsReport",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__statisticsReport' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/statisticsReport'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/rpt-form/monitor-rpt-cn",
                "name": "comm",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/rpt-form/monitor-rpt-cn/no-estm-query",
                    "name": "noEstimateQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__monitorReportCommission__noEstimateQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/monitorReportCommission/noEstimateQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/rpt-form/monitor-rpt-cn/no-bill-query",
                    "name": "noBillQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__monitorReportCommission__noBillingQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/monitorReportCommission/noBillingQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/rpt-form/monitor-rpt-cn/no-rbsm-query",
                    "name": "noReimburQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__monitorReportCommission__noReimbursementQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/monitorReportCommission/noReimbursementQuery'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/rpt-form/monitor-rpt-agfee",
                "name": "agFee",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/rpt-form/monitor-rpt-agfee/no-estm-query",
                    "name": "noEstimateQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__monitorReportAgencyFee__noEstimateQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/monitorReportAgencyFee/noEstimateQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/rpt-form/monitor-rpt-agfee/no-bill-query",
                    "name": "noBillQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__monitorReportAgencyFee__noBillingQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/monitorReportAgencyFee/noBillingQuery'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/rpt-form/monitor-rpt-agfee/no-rbsm-query",
                    "name": "noReimburQuery",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__reportForm__monitorReportAgencyFee__noReimbursementQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/reportForm/monitorReportAgencyFee/noReimbursementQuery'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              }
            ]
          },
          {
            "path": "/err-query",
            "name": "afcm.errQuery",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/err-query/err-type",
                "name": "errType",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__errorQuery__errType__errorType' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/errorQuery/errType/errorType'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/err-query/err-ress-grp",
                "name": "errChargeGroup",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__errorQuery__errResponsibleGroup__errorResponsibleGroup' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/errorQuery/errResponsibleGroup/errorResponsibleGroup'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/err-query/sp-run-log-type",
                "name": "spRunLogType",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__errorQuery__spRunLogType__spRunLogType' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/errorQuery/spRunLogType/spRunLogType'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/err-query/sp-run-log",
                "name": "spRunLog",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__errorQuery__spRunLog__spRunLog' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/errorQuery/spRunLog/spRunLog'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/err-query/err-query",
                "name": "errQuery",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__errorQuery__errorQuery__errorQuery' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/errorQuery/errorQuery/errorQuery'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/sent-Servants",
            "name": "afcm.sentServants",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/sent-Servants/con-guration",
                "name": "sentServantsConfiguration",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__penaltyCommission__commissionAllocation__commissionAllocation' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/penaltyCommission/commissionAllocation/commissionAllocation'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/sent-Servants/sent-computation",
                "name": "searchCaclSentServantsAgmtList",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__penaltyCommission__commissionCalculationResults' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/penaltyCommission/commissionCalculationResults'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/sent-Servants/sent-confirm",
                "name": "sentServantsToConfirm",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__penaltyCommission__confirmationCommission' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/penaltyCommission/confirmationCommission'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/sent-Servants/sent-returned",
                "name": "sentServantsReturned",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__penaltyCommission__refundCommission' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/penaltyCommission/refundCommission'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/sent-Servants/pen-query",
                "name": "penaltyStatusQuery",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__penaltyCommission__commissionStatusInquiry' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/penaltyCommission/commissionStatusInquiry'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/budgetTracking",
            "name": "afcm.budgetTracking",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/budgetTracking/volume",
                "name": "volume",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__budgetTracking__bussiness__businessVolume' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/budgetTracking/bussiness/businessVolume'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/budgetTracking/diff",
                "name": "diff",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__budgetTracking__bussiness__businessVolumeDiff' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/budgetTracking/bussiness/businessVolumeDiff'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/preCalc",
            "name": "afcm.calculation",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/preCalc/operation",
                "name": "operation",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__calculation__calculation_operation' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/calculation/calculation_operation'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/preCalc/operation/edit/:id",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__calculation__calculation_edits' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/calculation/calculation_edits'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/preCalc/search-comm",
                "name": "calc-comm",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__calculation__calc_search_comm' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/calculation/calc_search_comm'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/preCalc/search-agfee",
                "name": "calc-agfee",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__calculation__calc_search_agfee' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/calculation/calc_search_agfee'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/trainComm",
            "name": "afcm.trainComm",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/trainComm/trainRoute",
                "name": "trainRoute",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__trainCommission__trainRoute' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/trainCommission/trainRoute'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/trainComm/trainAgreement",
                "name": "trainAgreement",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__trainCommission__trainAgreement' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/trainCommission/trainAgreement'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/trainComm/trainCommOperate",
                "name": "trainCommOperate",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__trainCommission__trainCommOperate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/trainCommission/trainCommOperate'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "path": "/accrued",
            "name": "afcm.accrued",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/accrued/not-accrued",
                "name": "notAccrued",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/accrued/not-accrued/ag-fee",
                    "name": "notAccruedAgFee",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__withHolding__notAccrued__notAccruedAgFee' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/withHolding/notAccrued/notAccruedAgFee'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/accrued/not-accrued/comm",
                    "name": "notAccruedComm",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__withHolding__notAccrued__notAccruedComm' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/withHolding/notAccrued/notAccruedComm'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              },
              {
                "path": "/accrued/accrued-diff",
                "name": "diff",
                "icon": "UnorderedListOutlined",
                "routes": [
                  {
                    "path": "/accrued/accrued-diff/ag-fee",
                    "name": "diffAgFee",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__withHolding__accruedDiff__accruedDiffAgFee' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/withHolding/accruedDiff/accruedDiffAgFee'), loading: LoadingComponent}),
                    "exact": true
                  },
                  {
                    "path": "/accrued/accrued-diff/comm",
                    "name": "diffComm",
                    "icon": "tag",
                    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__withHolding__accruedDiff__accruedDiffComm' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/withHolding/accruedDiff/accruedDiffComm'), loading: LoadingComponent}),
                    "exact": true
                  }
                ]
              }
            ]
          },
          {
            "path": "/lc",
            "name": "afcm.localCharge",
            "icon": "UnorderedListOutlined",
            "routes": [
              {
                "path": "/lc/unconvertedRate",
                "name": "unconvertedRate",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LCconfigure__unconvertedRate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/LCconfigure/unconvertedRate'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/lc/convertedRate",
                "name": "convertedRate",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LCconfigure__convertedRate' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/LCconfigure/convertedRate'), loading: LoadingComponent}),
                "exact": true
              },
              {
                "path": "/lc/LCreportForm",
                "name": "LCreportForm",
                "icon": "tag",
                "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LCconfigure__LCreportForm' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/LCconfigure/LCreportForm'), loading: LoadingComponent}),
                "exact": true
              }
            ]
          },
          {
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__404' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/404'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__404' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/404'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  },
  {
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__404' */'/Users/duhongzheng/Documents/deyuan/afcm-web/src/pages/404'), loading: LoadingComponent}),
    "exact": true
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
