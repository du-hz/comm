import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { Redirect, connect, setLocale, getLocale } from 'umi';
import { getLang } from "@/utils/utils";
import { stringify } from 'querystring';

const checkLang = { flag: true };

class SecurityLayout extends React.Component {
  state = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;

    if (dispatch) {
      console.log('获取当前用户');
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { currentUser } = this.props;
    // TODO CBS中对外语的语言配置，似乎没有严格按照国际化标准，除了中文zh_CN，其他语种可能需要做一些调整，等用到再调整
    if (checkLang.flag && currentUser && currentUser.userCode) {
      // console.log(`FBSSO中获取到的用户语言 = ${currentUser.language}` );
      const lang = getLang("zh-CN");
      // const lang = getLang("en-US");
      // const lang = getLang("el-GR");  // 希腊
      // const lang = getLang("uk-UA");  // 乌克兰
      // const lang = getLang(currentUser.language);
      console.log(`前台设置的语言${lang}`);
      setLocale(lang);
      checkLang.flag = false;
    }
  }

  render() {
    // console.log(`SecurityLayout render`);
    const { isReady } = this.state;

    const { children, loading, currentUser } = this.props; // You can replace it to your authentication rule (such as check token exists)
    // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）

    const isLogin = currentUser && currentUser.userCode;
    const queryString = stringify({
      redirect: window.location.href,
    });
    // console.log(`isReady = ${isReady} , queryString = ${queryString}, loading = ${loading}, user = ${currentUser.userCode}`);

    if ((!isLogin && loading) || !isReady) {
      console.log(`显示loading...`);
      return <PageLoading />;
    }

    // TODO PCM项目的特殊性，这段需要改造，如果发现用户未登陆，应该直接进404或者提醒用户在CBS内完成登陆
    if (!isLogin && window.location.pathname !== '/user/login') {
      console.log(`跳转提示页`);
      return <Redirect to='/user/guide' />;
    }
    return children;
  }
}

export default connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))(SecurityLayout);
