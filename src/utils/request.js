/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification, message } from 'antd';
import { formatMessage, history } from 'umi';
import { Toast } from './Toast'

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * 异常处理程序
 */

const errorHandler = error => {
  const { response } = error;

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    // notification.error({
    //   message: `请求错误 ${status}: ${url}`,
    //   description: errorText,
    // });
    setTimeout(() => {
      // Toast(errorText, `请求错误 ${status}: ${url}`, 'alert-error', 5000, false)
    }, 1000)
  } else if (!response) {
    setTimeout(() => {
      // Toast('您的网络发生异常，无法连接服务器', `网络异常`, 'alert-error', 5000, false)
    }, 1000)
    // notification.error({
    //   description: '您的网络发生异常，无法连接服务器',
    //   message: '网络异常',
    // });
  }

  return response;
};
/**
 * 配置request请求时的默认参数
 */

const request = extend({
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  prefix: '/afcm',
});

request.use(async (ctx, next) => {
  // 前置处理暂不做变化，直接执行请求
  await next();
  // 后置截取返回的响应，判断是否要全局报错
  const { res } = ctx;
  // 暂不明确是否所有的响应都会是success+errorMessage+body的格式，因此暂时只判断false的报错，没有success字段忽略掉
  if (res.hasOwnProperty('success') && !res.success) {

    // 如果后台给了明细的提示信息而不仅仅是code，说明后台已经做了语言转换
    // 注意：原则上前后台分离，国际化操作是在前台实现的，后台给前台理论上永远都是错误代码
    // errorMessageInfo 原则上不应该有
    if (res.errorMessageInfo && res.errorMessage !== '') {
      // message.error(res.errorMessageInfo);
      // notification.error({
      //   description: res.errorMessageInfo,
      //   message: 'Error !!!',
      //   duration: null,
      // });
      setTimeout(() => {
        // Toast('', '', '', 5000, false);
        // Toast(res.errorMessageInfo, '', 'alert-error', 5000, false)
      }, 1000)
    } else if (res.errorMessage === 'rdc.svc.unknow-error') {
      // notification.error({
      //   description: formatMessage({id: 'rdc.svc.unknow-error-desc'}),
      //   message: formatMessage({id: 'rdc.svc.unknow-error'}),
      //   duration: null,
      // });
      setTimeout(() => {
        // Toast(formatMessage({id: 'rdc.svc.unknow-error-desc'}), formatMessage({id: 'rdc.svc.unknow-error'}), 'alert-error', 5000, false)
      }, 1000)
    } else if (res.errorMessage === 'rdc.svc.lost-auth') {
      // session超时等原因，拿不到用户身份了
      history.push('/user/guide');
    } else if (res.args && res.args.length) {
      // 夹带数据信息的消息转换
      // message.error(formatMessage({id: res.errorMessage}, res.args), 0);
      // notification.error({
      //   description: formatMessage({id: res.errorMessage}, res.args),
      //   message: 'Error !!!',
      //   duration: null,
      // });
      setTimeout(() => {
        // Toast('', '', '', 5000, false);
        // Toast(res.errorMessage, res.args, '', 'alert-error', 5000, false)
      }, 1000)
    } else {
      // 纯错误信息，不需要参数转换
      // message.error(formatMessage({id: res.errorMessage}));
      setTimeout(() => {
        // Toast('', '', '', 5000, false);
        // Toast(res.errorMessage, '', 'alert-error', 5000, false)
      }, 1000)
      // notification.error({
      //   description: formatMessage({id: res.errorMessage}),
      //   message: 'Error !!!',
      //   duration: null,
      // });
    }
  }
}, { global: true });

export default request;
