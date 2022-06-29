import './toast.less';
import {
  CloseOutlined
} from '@ant-design/icons'

function addClass(obj, cls) {
  let obj_class = obj.className, //获取 class 内容.
    blank = obj_class ? ' ' : ''; //判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
  let added = obj_class + blank + cls; //组合原来的 class 和需要添加的 class.
  obj.className = added; //替换原来的 class.
}
/*className
	alert-success 成功框
	alert-warning 警告框
	alert-error 报错框
*/

// timeout: 展示时长 Number
// isAnimation: 是否自动消失 boolean
// options: 自定义样式  object
// title 提示标题 string
// text: 提示文本 string
export const Toast = function (title, text, className, timeout, isAnimation, options) {

  //如果已经弹出一个了，那么就先移除，这边只会有一个

  try {
    // document.body.removeChild(document.querySelector('div.toast-it'));
  } catch (e) {

  }
  // let toastGlobal = document.body.querySelector('div.ant-pro-page-header-wrap-children-content')
  // if(toastGlobal){
  //   toastGlobal = toastGlobal
  // }else{

  // }
  
  //开始创造
  let toastGlobal = document.querySelector('div.ant-pro-grid-content')
  if (!toastGlobal) {
    toastGlobal = document.body
  }
  let toastParent = document.createElement('div')
  if(!title&&!text){
    var tengToast = document.querySelectorAll('div.toastParent')
    if(tengToast.length>0){
      for(var i=0;i<tengToast.length;i++){
        toastGlobal.removeChild(tengToast[i]);
      }
    }
    return
  }
  addClass(toastParent, 'toastParent')
  toastParent.style['width'] = '100%'
  toastParent.style['height'] = 'auto'
  timeout = timeout || 2000;
  let toast = document.createElement('div');
  addClass(toast, 'toast-it')
  addClass(toast, 'alert')
  addClass(toast, className || 'alert-success');
  let placement = 'toast-top'
  addClass(toast, placement);
  let titleDom = document.createTextNode(title);
  let content = document.createTextNode(text);
  toast.appendChild(content);
  toast.appendChild(titleDom);

  let close = document.createElement('div')
  addClass(close, 'close-toast')
  close.innerHTML = 'X'
  toast.appendChild(close);
  toast.style.animationDuration = timeout / 1000 + 's';
  close.onclick = function () {
    toastGlobal.removeChild(this.parentNode.parentNode)
  }
  for (let prop in options) {
    toast.style[prop] = options[prop];
  }
  //别被挡住了
  // toast.style['z-index'] = 999;
  // toastParent.style['z-index'] = 999;
  toastParent.appendChild(toast);
  toastGlobal.insertBefore(toastParent, toastGlobal.childNodes[0])
  setTimeout(function () {
    try {
      if (isAnimation) {
        toastGlobal.removeChild(toastParent);
      }
    } catch (e) {}
  }, timeout);
};
