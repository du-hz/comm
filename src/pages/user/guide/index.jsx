import { Result, Row, Col } from 'antd';
import React from 'react';

const LoginGuide = () => (
  <Result
    status="warning"
    // title="公共计算模块无法确认您当前的身份"
    title="代理费用(佣金&代理费)计算模块无法确认您当前的身份"
    subTitle="导致该问题的原因可能是：您的账号可能由于长时间未操作、系统宕机、系统重启等原因，导致无法加载到您的登录信息，请按F5刷新浏览器，或者重新登录CBS后再尝试"
    extra={
      <Row>
        <Col span={24}>
          {/* 如果重新登录仍然无法解决该问题，请向公共计算模块的系统管理人员报备核查 */}
          如果重新登录仍然无法解决该问题，请向代理费用(佣金&代理费)计算模块的系统管理人员报备核查
        </Col>
        <Col span={24}>
          报备前尽量回想出现该问题之前做了哪些操作，以便管理员分析并定位原因，谢谢！
        </Col>
      </Row>
    }
  />
);

export default LoginGuide;
