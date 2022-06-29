import $ from '@/utils/jquery.min.js'
// className: 弹框class名
// dragmove: 右下角拖动的小图标class名
const stretch = (className, dragMove) => {
  var leftParent = $(className).parent('div')[0];

  var def = { //宽
    maxW: $(leftParent && leftParent.clientWidth)[0], // 可伸缩的最大宽度
    minW: 100 // 可伸缩的最小宽度
  }; // 参数默认值
  var deH = { //高
    maxH: $(leftParent && leftParent.clientHeight)[0], // 可伸缩的最大高度
    minH: 80 // 可伸缩的最小宽度
  }; // 参数默认值
  var opts = $.extend(def, null); // 扩展参数，使用默认值或传参
  var optsH = $.extend(deH, null);
  //设置最大/最小宽度
  var max_width = opts.maxW,
    min_width = opts.minW;
  //设置最大/最小高度
  var max_height = optsH.maxH,
    min_height = optsH.minH;
  //记录鼠标相对left盒子x轴位置
  var mouse_x = 0;
  var mouse_y = 0;
  var left = $(className)[0]
  var leftWidth = left && left.clientWidth
  //鼠标移动事件
  left ? left.style.margin = 0 + 'px' : null;
  left ? left.style.left = (max_width - leftWidth) / 2 + 'px' : null;
  left ? left.style.top = 0 + 'px' : null;
  // left ? left.style.maxWidth = max_width-10 +'px' : null
  // left ? left.style.paddingBottom = 24 + 'px' : null
  // console.log(43232)

  function mouseMove(e) {
    var e = e || window.event;
    // x轴伸缩
    if (e.clientX < leftParent.offsetWidth) {
      var left_width = e.clientX - mouse_x; // 可伸缩div的宽度
      left_width = left_width < min_width ? min_width : left_width;
      left_width = left_width > max_width ? max_width : left_width;
      left.style.width = left_width + "px";
    }
    // y轴伸缩
    if (e.clientY < leftParent.offsetHeight) {
      var left_height = e.clientY - mouse_y; // 可伸缩div的高度
      left_height = left_height < min_height ? min_height : left_height;
      left_height = left_height > max_height ? max_height : left_height;
      left.style.height = left_height + "px";
    }
  }
  //终止事件
  function mouseUp() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
  $(dragMove).mousedown(function (e) {

    var e = e || window.event;
    //阻止默认事件
    // e.preventDefault();
    mouse_x = e.clientX - left.offsetWidth; // 可伸缩div距离左侧边界的宽度
    mouse_y = e.clientY - left.offsetHeight; // 可伸缩div距离底侧边界的高度
    document.onmousemove = function () {
      mouseMove()
    };
    document.onmouseup = function () {
      mouseUp()
    };
  })
}
// modalHeader:弹框标题class名  鼠标拖动的地方
// className:弹框class名
const drag = (modalHeader, className) => {
  var iWidth = document.documentElement.clientWidth;
  var iHeight = document.documentElement.clientHeight;
  var msgObj = $(className)[0];
  var moveX = 0;
  var moveY = 0;
  var moveTop = 0;
  var moveLeft = 0;
  var moveable = false;
  msgObj && $(modalHeader).mousedown(function (e) {
    var evt = getEvent();
    var w = msgObj && msgObj.clientWidth
    var h = msgObj && msgObj.clientHeight - 24
    moveable = true;
    moveX = evt.clientX;
    moveY = evt.clientY;
    moveTop = parseInt(msgObj.style.top);
    moveLeft = parseInt(msgObj.style.left);
    document.onmousemove = function () {
      if (moveable) {
        var evt = getEvent();
        var x = moveLeft + evt.clientX - moveX; //www.divcss5.com divcss5
        var y = moveTop + evt.clientY - moveY;
        if (x > 0 && (x + w < iWidth)) {
          msgObj.style.left = x + "px";
        }
        if (y > 0 && (y + h < iHeight)) {
          msgObj.style.top = y + "px";
        }
      }
    };
    document.onmouseup = function () {
      if (moveable) {
        document.onmousemove = null;
        document.onmouseup = null;
        moveable = false;
        moveX = 0;
        moveY = 0;
        moveTop = 0;
        moveLeft = 0;
      }
    };
  })

  function getEvent() {
    return window.event || arguments.callee.caller.arguments[0];
  }
}
export {
  stretch,
  drag,
}
