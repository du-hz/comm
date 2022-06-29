import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import lable from "./zh-CN/labels";
import validateMessages from "./zh-CN/validateMessages";
import afcmbErrors from "@/locales/zh-CN/afcmbErrors";
import buttons from "@/locales/zh-CN/buttons";

export default {
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...lable,
  ...validateMessages,
  ...afcmbErrors,
  ...buttons,
};
