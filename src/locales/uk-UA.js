import component from './uk-UA/component';
import globalHeader from './uk-UA/globalHeader';
import menu from './uk-UA/menu';
import pwa from './uk-UA/pwa';
import settingDrawer from './uk-UA/settingDrawer';
import settings from './uk-UA/settings';
import lable from "./uk-UA/labels";
import validateMessages from "./uk-UA/validateMessages";
import afcmbErrors from "@/locales/uk-UA/afcmbErrors";
import buttons from "@/locales/uk-UA/buttons";

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
