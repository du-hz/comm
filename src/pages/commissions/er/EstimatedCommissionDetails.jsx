// 待处理佣金预估单-弹窗
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Modal, Button, Card, Input, Form, Row, Col, Transfer, Tabs, Table, Tooltip, InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDataExtend } from '@/utils/commonDataInterface';
// import { CosToast } from '@/components/Common/index'
// import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn, CosButton, CosToast } from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'

const { TabPane } = Tabs;
const EstimatedCommissionDetails = (props) => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const {
        isModalVisible,
        setIsModalVisible,
        messageHeader,
        headerTitle,
        detailedIncome,
        aggregateRevenue,
        detailedExpenditure,
        aggregateExpenditure,
        commType,
        setObjMessage,
        objMessage,
        setSpinflag,
    } = props.initData;

    const [queryForm] = Form.useForm();
    const [tableData, setTableData] = useState([])//
    const [tabTabTotal, setTabTotal] = useState([])//
    const [calcMthd, setCalcMthd] = useState([]);  // 佣金计算方法 

    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'COMM.CALC.MTHD.CB0050', setCalcMthd, $apiUrl);// 佣金计算方法
        queryForm.setFieldsValue({
            ...messageHeader,
            // keyBillReferenceCode: messageHeader.keyBillReferenceCode,
            // companyCode: messageHeader.companyCode,
            // cargoTradeLaneCode: messageHeader.cargoTradeLaneCode,
            // cityLocalNameOp: messageHeader.cityLocalNameOp,
            cityLocalNameOp: messageHeader.cityLocalNameOp,
            // outBoundDoorCyIndicator: messageHeader.outBoundDoorCyIndicator,
            // inboundDoorCyIndicator: messageHeader.inboundDoorCyIndicator,
            // cityLocalNameOf: messageHeader.cityLocalNameOf,
            cityLocalNameOf: messageHeader.cityLocalNameOf,
            // firstLoadingSvvdId: messageHeader.firstLoadingSvvdId,
            // firstPolCode: messageHeader.firstPolCode,
            // firstBaseLoadingSvvdId: messageHeader.firstBaseLoadingSvvdId,
            // firstBasePolCode: messageHeader.firstBasePolCode,
            // lastBaseLoadingSvvdId: messageHeader.lastBaseLoadingSvvdId,
            // lastBasePolCode: messageHeader.lastBasePolCode,
            lastBasePodCode: messageHeader.lastBasePodCode,
            // lastLoadingSvvdId: messageHeader.lastLoadingSvvdId,
            // lastPolCode: messageHeader.lastPolCode,
            lastPodCode: messageHeader.lastPodCode,
        })
        // messageHeader
    }, [messageHeader])

    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    const handleCancel = () => {
        setIsModalVisible(false);
        setObjMessage({});
        // setPage({
        //     current: 1,
        //     pageSize: 10
        // })
    }

    // 明细列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编号
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Commission-agreement' />,// 佣金协议
            dataIndex: 'commissionAgreementCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ac.cntr-num" />,// 箱号
            dataIndex: 'containerNumber',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Box-size" />,// 箱型尺寸
            dataIndex: 'containerSizeType',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Contract-No" />,// 合约号
            dataIndex: 'agreementId',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.office" />,// office
            dataIndex: 'officeCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,// 实际是否发生
            dataIndex: 'actualFlag',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.amount" />,// 金额
            dataIndex: 'commissionAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'commissionCurrencyCode',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Computing-method" />,// 计算方法
            dataIndex: 'calculationMethod',
            dataType: calcMthd,
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Commission-freight" />,// 计佣运费
            dataIndex: 'commissionBase',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Percentage-rate" />,// 百分比/费率
            dataIndex: 'commissionRate',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.empty-box" />,// SOC空箱
            dataIndex: 'socEmptyIndicator',
            // sorter: false,
            width: 120,
        }
    ]

    // 汇总列表
    const columnsdata = [
        {
            title: <FormattedMessage id="lbl.Agent-number" />,// 代理编号
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Box-size' />,// 箱型尺寸
            dataIndex: 'containerSizeType',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Container-capacity" />,// 箱量
            dataIndex: 'count',
            align: 'right',
            // sorter: false,
            width: 120,
            render: (text, record) => {
                return text.toFixed(1)
            }
        }, {
            title: <FormattedMessage id="lbl.Currency-of-commission-agreement" />,// 佣金协议币种
            dataIndex: 'currencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-agreement-amount" />,// 佣金协议金额
            dataIndex: 'amount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }
    ]

    // const pageChange= async (pagination) => {
    //     Toast('', '', '', 5000, false);
    //     console.log(queryForm.getFieldValue())
    //     const localsearch=await request($apiUrl.COMM_AGMT_SEARCH_CALC_HEAD_LIST,{
    //         method:"POST",
    //         data:{
    //             "page": pagination,
    //             "params": queryForm.getFieldValue(),
    //         }
    //     })
    //     let data=localsearch.data
    //     let datas=localsearch.data.resultList
    //     setTabTotal(data.totalCount)
    //     setTableData([...datas])
    // }

    const printFun = async () => {
        // Toast('', '', '', 5000, false);
        // 通过id选择需要打印的区域
        // window.document.body.innerHTML = window.document.getElementById('footer-table').innerHTML;
        // 调用打印
        // window.print();
        // 刷新页面
        // window.location.reload();
    }

    return (
        <CosModal cbsVisible={isModalVisible} cbsTitle={headerTitle.ygListCode + formatMessage({ id: 'lbl.Estimated-Commission-details' })} cbsWidth={'80%'} cbsFun={() => handleCancel()}>
            {/* <Modal title={headerTitle.ygListCode + formatMessage({ id: 'lbl.Estimated-Commission-details' })} visible={isModalVisible} footer={null} width="80%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosToast toast={objMessage} style={{ minWidth: '905px' }} />
            <Form
                form={queryForm}
                name='func'
                onFinish={handleQuery}
                style={{ minWidth: '905px' }}
            >
                <Row>
                    {/* 提单号码 */}
                    <InputText disabled name='keyBillReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                    {/* 公司代码 */}
                    <InputText disabled name='companyCode' label={<FormattedMessage id='lbl.company-code' />} span={6} />
                    {/* Cargo Trade Lane */}
                    <InputText disabled name='cargoTradeLaneCode' label={<FormattedMessage id='lbl.cargo-trade' />} span={6} />
                    {/* POR */}
                    <InputText disabled name='cityLocalNameOp' label={<FormattedMessage id='lbl.POR' />} span={6} />
                    {/* 出口协议 */}
                    <InputText disabled name='outBoundDoorCyIndicator' label={<FormattedMessage id='lbl.Export-agreement' />} span={6} />
                    {/* 进口协议 */}
                    <InputText disabled name='inboundDoorCyIndicator' label={<FormattedMessage id='lbl.Import-agreement' />} span={6} />
                    {/* FND */}
                    <InputText disabled name='cityLocalNameOf' label={<FormattedMessage id='lbl.FND' />} span={6} />
                    {/* First SVVD */}
                    <InputText disabled name='firstLoadingSvvdId' label={<FormattedMessage id='lbl.first-svvd' />} span={6} />
                    {/* First POL */}
                    <InputText disabled name='firstPolCode' label={<FormattedMessage id='lbl.first-pol' />} span={6} />
                    {/* First Base SVVD */}
                    <InputText disabled name='firstBaseLoadingSvvdId' label={<FormattedMessage id='lbl.first-base-svvd' />} span={6} />
                    {/* First Base POL */}
                    <InputText disabled name='firstBasePolCode' label={<FormattedMessage id='lbl.first-base-pol' />} span={6} />
                    {/* Last Base SVVD */}
                    <InputText disabled name='lastBaseLoadingSvvdId' label={<FormattedMessage id='lbl.last-base-svvd' />} span={6} />
                    {/* Last Base POD */}
                    <InputText disabled name='lastBasePodCode' label={<FormattedMessage id='lbl.last-base-pod' />} span={6} />
                    {/* Last SVVD */}
                    <InputText disabled name='lastLoadingSvvdId' label={<FormattedMessage id='lbl.last-svvd' />} span={6} />
                    {/* Last POD */}
                    <InputText disabled name='lastPodCode' label={<FormattedMessage id='lbl.last-pod' />} span={6} />
                </Row>
            </Form>
            <Tabs type="card" style={{ minWidth: '905px' }} id="footer-table">
                <TabPane tab={<FormattedMessage id='lbl.Revenue-information' />} key="1">
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={detailedIncome}
                            columns={columns}
                            rowKey='lcrAgreementHeadUuid'
                            // pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={tabTabTotal}
                            pagination={false}
                            rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{ marginTop: '10px', width: '50%' }}>
                        <PaginationTable
                            rowKey="lcrAgreementHeadUuid"
                            columns={columnsdata}
                            dataSource={aggregateRevenue}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                    <div className="bottom_btn">
                        {/* 打印 */}
                        <CosButton onClick={() => printFun()}><FormattedMessage id='lbl.Printing' /></CosButton>
                        {/* 下载 */}
                        {/* <CosButton><FormattedMessage id='lbl.download' /></CosButton> */}
                        <CosDownLoadBtn
                            downMessage={setObjMessage}
                            messFlag={true}
                            // disabled={detailedIncome.length ? false : true}
                            downLoadTitle={headerTitle.ygListCode + intl.formatMessage({ id: 'lbl.Estimated-Commission-details' })}
                            downColumns={[{
                                dataHead: {
                                    keyBillReferenceCode: intl.formatMessage({ id: 'lbl.bill-of-lading-number' }),    //提单号码 
                                    companyCode: intl.formatMessage({ id: 'lbl.company-code' }),  //公司代码 
                                    cargoTradeLaneCode: intl.formatMessage({ id: 'lbl.cargo-trade' }),    //Cargo Trade Lane 
                                    cityLocalNameOp: intl.formatMessage({ id: 'lbl.POR' }),   //POR 
                                    outBoundDoorCyIndicator: intl.formatMessage({ id: 'lbl.Export-agreement' }),  //出口协议 
                                    inboundDoorCyIndicator: intl.formatMessage({ id: 'lbl.Import-agreement' }),   //进口协议 
                                    cityLocalNameOf: intl.formatMessage({ id: 'lbl.FND' }),   //FND 
                                    firstLoadingSvvdId: intl.formatMessage({ id: 'lbl.first-svvd' }),     //First SVVD 
                                    firstPolCode: intl.formatMessage({ id: 'lbl.first-pol' }),    //First POL 
                                    firstBaseLoadingSvvdId: intl.formatMessage({ id: 'lbl.first-base-svvd' }),    //First Base SVVD 
                                    firstBasePolCode: intl.formatMessage({ id: 'lbl.first-base-pol' }),   //First Base POL 
                                    lastBaseLoadingSvvdId: intl.formatMessage({ id: 'lbl.last-base-svvd' }),  //Last Base SVVD 
                                    lastBasePodCode: intl.formatMessage({ id: 'lbl.last-base-pod' }),     //Last Base POD 
                                    lastLoadingSvvdId: intl.formatMessage({ id: 'lbl.last-svvd' }),   //Last SVVD 
                                    lastPodCode: intl.formatMessage({ id: 'lbl.last-pod' }),  //Last POD 
                                },
                                dataCol: columns,
                                sumCol: columnsdata
                            }]}
                            downLoadUrl={'EXP_ER_BILL_CONTAINER_DETAIL_INCOME'}
                            queryData={{
                                agencyCode: headerTitle.agencyCode,
                                uuid: headerTitle.billBasicUuid
                            }}
                            setSpinflag={setSpinflag}
                            btnName={'lbl.download'} />
                        {/* 关闭 */}
                        <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.close' /></CosButton>
                    </div>
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.Expenditure-information' />} key="2">
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={detailedExpenditure}
                            columns={columns}
                            rowKey='lcrAgreementHeadUuid'
                            // pageChange={pageChange}
                            scrollHeightMinus={200}
                            total={tabTabTotal}
                            rowSelection={null}
                        />
                    </div>
                    <div className='footer-table' style={{ marginTop: '10px', width: '50%' }}>
                        <PaginationTable
                            rowKey="lcrAgreementHeadUuid"
                            columns={columnsdata}
                            dataSource={aggregateExpenditure}
                            pagination={false}
                            rowSelection={null}
                            scrollHeightMinus={200}
                        />
                    </div>
                    <div className="bottom_btn">
                        {/* 打印 */}
                        <CosButton><FormattedMessage id='lbl.Printing' /></CosButton>
                        {/* 下载 */}
                        {/* <CosButton><FormattedMessage id='lbl.download' /></CosButton> */}
                        <CosDownLoadBtn
                            downMessage={setObjMessage}
                            messFlag={true}
                            // disabled={detailedExpenditure.length ? false : true}
                            downLoadTitle={headerTitle.ygListCode + formatMessage({ id: 'lbl.Estimated-Commission-details' })}
                            downColumns={[{
                                dataHead: {
                                    keyBillReferenceCode: intl.formatMessage({ id: 'lbl.bill-of-lading-number' }),    //提单号码 
                                    companyCode: intl.formatMessage({ id: 'lbl.company-code' }),  //公司代码 
                                    cargoTradeLaneCode: intl.formatMessage({ id: 'lbl.cargo-trade' }),    //Cargo Trade Lane 
                                    cityLocalNameOp: intl.formatMessage({ id: 'lbl.POR' }),   //POR 
                                    outBoundDoorCyIndicator: intl.formatMessage({ id: 'lbl.Export-agreement' }),  //出口协议 
                                    inboundDoorCyIndicator: intl.formatMessage({ id: 'lbl.Import-agreement' }),   //进口协议 
                                    cityLocalNameOf: intl.formatMessage({ id: 'lbl.FND' }),   //FND 
                                    firstLoadingSvvdId: intl.formatMessage({ id: 'lbl.first-svvd' }),     //First SVVD 
                                    firstPolCode: intl.formatMessage({ id: 'lbl.first-pol' }),    //First POL 
                                    firstBaseLoadingSvvdId: intl.formatMessage({ id: 'lbl.first-base-svvd' }),    //First Base SVVD 
                                    firstBasePolCode: intl.formatMessage({ id: 'lbl.first-base-pol' }),   //First Base POL 
                                    lastBaseLoadingSvvdId: intl.formatMessage({ id: 'lbl.last-base-svvd' }),  //Last Base SVVD 
                                    lastBasePodCode: intl.formatMessage({ id: 'lbl.last-base-pod' }),     //Last Base POD 
                                    lastLoadingSvvdId: intl.formatMessage({ id: 'lbl.last-svvd' }),   //Last SVVD 
                                    lastPodCode: intl.formatMessage({ id: 'lbl.last-pod' }),  //Last POD 
                                },
                                dataCol: columns,
                                sumCol: columnsdata
                            }]}
                            downLoadUrl={'EXP_ER_BILL_CONTAINER_DETAIL_PAY'}
                            queryData={{
                                agencyCode: headerTitle.agencyCode,
                                uuid: headerTitle.billBasicUuid
                            }}
                            setSpinflag={setSpinflag}
                            btnName={'lbl.download'} />
                        {/* 关闭 */}
                        <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.close' /></CosButton>
                    </div>
                </TabPane>
            </Tabs>
            {/* </Modal> */}
        </CosModal>
    )
}
export default EstimatedCommissionDetails