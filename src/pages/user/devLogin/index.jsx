import React,{useState} from 'react';
import { message, Button, Form, Input, Checkbox } from 'antd';
import { login } from '@/pages/user/devLogin/service';
import { UserOutlined, GlobalOutlined } from '@ant-design/icons';

const DevelopLogin = () => {
  // const handleLogin = async (values) => {
  //   console.log(values);
  //   const result = await login(values);
  //   if (result.success) {
  //     message.success('ok');
  //   }
  // };
  //
  // const onOpenWeb = () => {
  //   const w = window.open('about:blank');
  //   w.location = `${window.location.origin}/afcm/pages/welcome`;
  // };
  const [queryForm] = Form.useForm();
  const companyChange = (e) => {
    queryForm.setFieldsValue({
      companyCode:e.target.value.toUpperCase()
    })
  }
  const onFinish = async (values) => {
    console.log(values)
    const result = await login({"userCode":values.userCode,
    "companyCode":values.companyCode});
    if (result.success) {
      message.success('ok');
      const w = window.open('about:blank');
      w.location = `${window.location.origin}/afcm/pages/welcome`;
    }
  };

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  const tailLayout = {
    wrapperCol: { offset: 4, span: 20 },
  };

  return (
    <>
      {/*<Row>*/}
      {/*  <Col span={8}>*/}
      {/*    懒得重新写，复用通用组件，查询按钮就是提交，凑合用吧(账号留空模拟清除session)*/}
      {/*  </Col>*/}
      {/*  <Col span={16}>*/}
      {/*    <PcmSearchGroup*/}
      {/*      formname='rdc-dev-login-form'*/}
      {/*      config={[*/}
      {/*        {*/}
      {/*          type: 'input', name: 'userCode', span: 5, label: '账号',*/}
      {/*        },*/}
      {/*        {*/}
      {/*          type: 'input', name: 'companyCode', span: 5, label: '公司',*/}
      {/*        },*/}
      {/*      ]}*/}
      {/*      btnDisplayType='merge'*/}
      {/*      btnSpan={5}*/}
      {/*      onSearch={handleLogin}*/}
      {/*    />*/}
      {/*  </Col>*/}
      {/*  <Col span={6}>*/}
      {/*    <Button type="link" onClick={onOpenWeb}>*/}
      {/*      Open New Welcome*/}
      {/*    </Button>*/}
      {/*  </Col>*/}
      {/*</Row>*/}

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Form
          {...layout}
          form={queryForm}
          name="login_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          style={{
            width: '400px',
          }}
        >
          <Form.Item
            name="userCode"
            label='用户'
            rules={[{ required: true, message: '请输入用户编码' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="用户编码"/>
          </Form.Item>
          <Form.Item
            name="companyCode"
            label='公司'
            rules={[{ required: true, message: '请输入公司' }]}
          >
            <Input
              onChange={(e)=>companyChange(e)}
              prefix={<GlobalOutlined className="site-form-item-icon"/>}
              placeholder="公司"
            />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default DevelopLogin;
