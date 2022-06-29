/*
 * @Author: Du hongzheng
 * @Date: 2022-04-06 01:32:55
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-04-06 13:31:21
 * @Description: file content
 * @FilePath: /afcm-web/src/pages/base/TrainEdit.jsx
 */

// 查看详情、编辑、新增
import React, { useEffect, useState, $apiUrl } from 'react';
import { Modal, Button, Input, Form, Row, Col, Transfer, Tabs, Select, Tooltip, InputNumber } from 'antd';
import { FormattedMessage, formatMessage } from 'umi';
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import IptNumber from '@/components/Common/IptNumber';
import SelectVal from '@/components/Common/Select';
import DatePicker from '@/components/Common/DatePicker'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { momentFormat, acquireSelectData, companyAgency } from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import moment from 'moment';
import CosButton from '@/components/Common/CosButton'
import { Toast } from '@/utils/Toast'
import CosModal from '@/components/Common/CosModal'
import {
    EditOutlined,
    RightCircleOutlined,
    PlusOutlined,//新增item
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileDoneOutlined,//保存
    RightOutlined,//右箭头
    DoubleRightOutlined,
    LeftOutlined,//左箭头
    DoubleLeftOutlined,
    SaveOutlined,//保存
    FileProtectOutlined,//保存并提交审核
    ImportOutlined,//协议退回
    UnlockOutlined,//解锁
    CloudDownloadOutlined,
} from '@ant-design/icons'
import Loading from '@/components/Common/Loading'
import { CosToast } from '@/components/Common/index'

// 弹出窗口需要
const confirm = Modal.confirm
// tab切换
const { TabPane } = Tabs;

const TrainEdit = (props) => {
    // 父组件拿到的数据
    const {
        isModalVisible,      // 弹出框显示隐藏
        setIsModalVisible,   // 关闭弹窗
        title,				// 弹窗标题
        acquireData,        // 船东
    } = props.initData;

    const [queryForm] = Form.useForm();

    const [defaultKey, setDefaultKey] = useState('1');  // tab默认为1
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const [spinflag, setSpinflag] = useState(false);     // 加载

    useEffect(() => {

    }, [])

    // tab切换
    const callback = (key) => {
        setObjMessage({});	// 清除弹窗
        setDefaultKey(key);
    }

    // 关闭弹窗
    const handleCancel = () => {
        // resetBoxSize();	// 调用Group信息重置功能
        // setChecked([]);		// 维护NA组uuid
        setObjMessage({});	// 清除弹窗
        // setItemUuidFlag('');
        setIsModalVisible(false); // 关闭弹窗
        // setDefaultKey('1');
        // setCommissionAgmtCntrSizeTypeGroups([]);

        // setDataSource([]);
        // setSizeDetailedTable([])
        // setTableData([]);
        // queryForm.resetFields();
        // queryForm.setFieldsValue({ // 数据清空                                  
        // toDate: moment(dateEnd),
        // })
    }

    return (
        <>
            <CosModal cbsDragCls='modal-drag-comm' cbsMoveCls='drag-move-comm' cbsVisible={isModalVisible} cbsTitle={title} cbsFun={() => handleCancel()}>
                <CosToast toast={objMessage} />
                <div className="topBox" style={{ minWidth: '850px' }}>
                    <Form form={queryForm}>
                        {/* <Form onFinish={handleQuery} form={queryForm}> */}
                        <Row>
                            {/* 船东 */}
                            <SelectVal span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                            {/* 航线 */}
                            <SelectVal showSearch={true} span={6} name='companyCode' label={<FormattedMessage id='lbl.route' />} options={[]} />
                            {/* 装港 */}
                            <InputText span={6} name='commissionAgreementCode' label={<FormattedMessage id='lbl.Loading-port' />} />
                            {/* 卸港 */}
                            <InputText span={6} name='commissionAgreementCode' label={<FormattedMessage id='lbl.Unloading-port' />} />
                            {/* 开始日期 */}
                            <DatePicker span={6} name='fromDate' label={<FormattedMessage id='lbl.start-date' />} />
                            {/* 结束日期 */}
                            <DatePicker span={6} name='fromDate' label={<FormattedMessage id='lbl.over-date' />} />
                            {/* <DoubleDatePicker span={6} name='Date' label={<FormattedMessage id="lbl.start-date" />} /> */}
                            {/* 协议号 */}
                            <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.protocol' />} />
                            {/* 备注 */}
                            <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.ac.pymt.claim-note' />} />
                        </Row>
                    </Form>
                </div>
                <div className="add-main-button">
                    {/* <div className="add-main-button" style={{ display: cssNone ? 'block' : 'none', minWidth: '850px' }}> */}
                    {/* {
                        btnData.map((val, idx) => {
                            return <CosButton auth={authData[idx]} style={{ display: authState[idx] ? 'inline-block' : 'none' }} disabled={flag} onClick={() => { allBtn(idx) }}>{val}</CosButton>
                        })
                    } */}
                    <CosButton><CloudDownloadOutlined /> <FormattedMessage id='lbl.save' /></CosButton>
                    <CosButton><CloudDownloadOutlined /> <FormattedMessage id='lbl.Submit' /></CosButton>

                </div>
                <div className="groupBox" style={{ minWidth: '850px' }}>
                    <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                        <TabPane tab={<FormattedMessage id='lbl.agreement-item' />} key="1">
                            <CosButton><PlusOutlined /></CosButton>
                            {/* <div className="table">
                                <PaginationTable
                                    dataSource={dataSource}
                                    columns={addColumns}
                                    rowKey='commissionTypeItemUuid'
                                    setSelectedRows={setSelectedRows}
                                    rowSelection={{ selectedRowKeys: [itemUuidFlag] }}
                                    pagination={false}
                                    selectionType='radio'
                                    scrollHeightMinus={200}
                                />
                            </div>
                            {disFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}><FormattedMessage id='lbl.box-calculation-detailed' /></div>
                                <CosButton disabled={!stateFlags || !tableData.authSave} style={{ margin: '0 0 10px 10px', display: cssNone ? 'block' : 'none' }} onClick={addItemDetailed}><PlusOutlined /></CosButton>
                                <PaginationTable
                                    dataSource={computingMethodData}
                                    columns={computingMethodColumns}
                                    pagination={false}
                                    rowKey="commissionContainerPriceUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null} */}
                        </TabPane>
                        <TabPane tab={<FormattedMessage id='lbl.train-comm-003' />} key="2">

                        </TabPane>
                    </Tabs>
                </div>
            </CosModal>
            <Loading spinning={spinflag} />
        </>
    )
}
export default TrainEdit
