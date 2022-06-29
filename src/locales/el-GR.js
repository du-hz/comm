import component from './el-GR/component';
import globalHeader from './el-GR/globalHeader';
import menu from './el-GR/menu';
import pwa from './el-GR/pwa';
import settingDrawer from './el-GR/settingDrawer';
import settings from './el-GR/settings';
import lable from "./el-GR/labels";
import validateMessages from "./el-GR/validateMessages";
import afcmbErrors from "@/locales/el-GR/afcmbErrors";
import buttons from "@/locales/el-GR/buttons";

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
