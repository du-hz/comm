import React from 'react';
import { FormattedMessage } from 'umi';
import { Button, Col, Form, Row } from "antd";
import { formlayout, buttonLayout } from '../../utils/commonLayoutSetting';

/**
 *
 * @param props
 * formName: string // 必填
 * isSingleRow: bool // 是否单行（决定按钮布局）
 * onSearch: func // 必填，组件会将form表单的值传递出来
 * onReset: func // 可选，组件内部会先做reset，这个是回调接口以防有其他清理事项
 * onChange: func // 可选，如果存在联动或特殊处理，需要给出回调
 * @returns {*}
 * @constructor
 */
const SearchArea = (props) => {

  const [form] = Form.useForm();
  const { formName, onSearch, onReset, isSingleRow, onChange, initialValues } = props;

  // 从form表单中获取所有值，执行外部回调
  const handleQuery = (values) => {
    if (onSearch) {
      onSearch(form.getFieldsValue());
    }
  }

  // 清理form表单，执行外部回调
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset(form.getFieldsValue);
    }
  }

  // 表单值变化时，外部回调可能会做动态调整
  const handleValuesChange = (changedValues, allValues) => {
    if (onChange) {
      onChange(changedValues, allValues);
    }
  }

  return (
    <Form {...formlayout}
          layout='horizontal'
          form={form}
          name={formName}
          onFinish={handleQuery}
          onValuesChange={handleValuesChange}
          initialValues={initialValues}
    >
          { isSingleRow ?
            ( <Row>
                <Col span={18}>
                  { props.children }
                </Col>
                <Col span={6}>
                  <Row>
                    <Col span={24}>
                      <Form.Item {...buttonLayout}>
                        <Button type="primary" htmlType="button" onClick={handleQuery} >
                          <FormattedMessage id="btn.search" />
                        </Button>
                        <span> </span>
                        <Button htmlType="button" onClick={handleReset} >
                          <FormattedMessage id="btn.reset" />
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )
            :
            (
              <Row>
                <Col span={20}>
                  { props.children }
                </Col>
                <Col span={4}>
                  <Row>
                    <Col span={24}>
                      <Form.Item {...buttonLayout}>
                        <Button type="primary" htmlType="button" onClick={handleQuery} >
                          <FormattedMessage id="btn.search" />
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Form.Item {...buttonLayout}>
                        <Button htmlType="button" onClick={handleReset}>
                          <FormattedMessage id="btn.reset" />
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )
          }
    </Form>
  );
};
export default SearchArea;
