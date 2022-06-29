import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = path => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);
/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname) => {
  const authority = router.find(
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};
export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach(route => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

// 尝试将后台返回的语言，转换成前台识别的语言种类
// 比如后台返回的zh_CN, 就只是简单的替换成zh-CN即可,但是后台返回en则转换成前台的en-US,每增加一套语言，都要在这里做下适配
export const getLang = (language) => {
  // 暂时除了zh-CN之外，没有提供其他语言的翻译，所以第一期国内推广暂时都锁定用中文
  console.log(`第一期暂时锁定为zh-CN，未来国外使用修改utils.getLang完成适配即可。`);
  console.log('测试', !language, language == 'en', language == 'el')
  if (!language) return 'zh-CN';
  if (language.indexOf('_') > 0) {
    return language.replace('_','-');
  }
  if (language === 'en') {
    return 'en-US';
  } else if(language === 'el') {
    return 'el-GR';
  } else if(language === 'uk') {
    return 'uk-UA';
  }
  return language;
};
