// 查询佣金计算结果-弹窗
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Modal, Button, Card, Input, Form, Row, Col, Transfer, Tabs, Table, Tooltip, InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn } from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'
const QueryCommissionHistoryInformationDetails = (props) => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning  
    const [queryForm] = Form.useForm();
    const {
        isModalVisible,
        setIsModalVisible,
        messageHeader,
        detailsList,
        detailsStatisticsList,
        detaUuid,    // 详情uuid
        setSpinflag,    // 加载
    } = props.initData;

    useEffect(() => {
        queryForm.setFieldsValue({
            keyBillReferenceCode: messageHeader.keyBillReferenceCode,
            cargoTradeLaneCode: messageHeader.cargoTradeLaneCode,
            por: messageHeader.por,
            outBoundDoorCyIndicator: messageHeader.outBoundDoorCyIndicator,
            inboundDoorCyIndicator: messageHeader.inboundDoorCyIndicator,
            fnd: messageHeader.fnd,
            firstLoadingSvvdId: messageHeader.firstLoadingSvvdId,
            firstBaseLoadingSvvdId: messageHeader.firstBaseLoadingSvvdId,
            lastBaseLoadingSvvdId: messageHeader.lastBaseLoadingSvvdId,
            lastLoadingSvvdId: messageHeader.lastLoadingSvvdId,
            firstPolCode: messageHeader.firstPolCode,
            firstBasePolCode: messageHeader.firstBasePolCode,
            lastBasePodCode: messageHeader.lastBasePodCode,
            lastPodCode: messageHeader.lastPodCode,
        })
    }, [messageHeader])

    // 明细列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.ac.cntr-num' />,// 箱号
            dataIndex: 'containerNumber',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Box-size' />,// 箱型尺寸
            dataIndex: 'containerSizeType',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Computing-method' />,// 计算方法
            dataIndex: 'calculationMethod',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.The-Commission' />,// 佣金模式
            dataIndex: 'commissionMode',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Contract-No' />,// 合约号
            dataIndex: 'agreementId',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Percentage-rate" />,// 百分比/费率
            dataIndex: 'commissionRate',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            align: 'center',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
            dataIndex: 'activityDate',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-agreement" />,// 佣金协议
            dataIndex: 'commissionAgreementCode',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.WhetherItActuallyHappenedOrNot" />,// 实际是否发生
            dataIndex: 'actualFlag',
            align: 'center',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.empty-box" />,// SOC空箱
            dataIndex: 'socEmptyIndicator',
            align: 'center',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'commissionCurrencyCode',
            align: 'center',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Commission-freight" />,// 计佣运费
            dataIndex: 'commissionBase',
            align: 'center',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.amount" />,// 金额
            dataIndex: 'commissionAmount',
            align: 'center',
            // sorter: false,
            width: 120,
        }
    ]

    // 明细统计列表
    const columnsdata = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Box-size" />,// 箱型尺寸
            dataIndex: 'containerSizeType',
            align: 'center',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataIndex: 'commissionType',
            align: 'center',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Container-capacity" />,// 箱量
            dataIndex: 'commissionBase',
            align: 'center',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ccy" />,// 币种
            dataIndex: 'commissionCurrencyCode',
            align: 'center',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.The-amount-of-commission" />,// 佣金金额
            dataIndex: 'amount',
            align: 'center',
            // sorter: false,
            width: 150,
        }
    ]

    //关闭弹窗
    const handleCancel = () => {
        setIsModalVisible(false)
    }
    return (
        <CosModal cbsWidth={'80%'} cbsVisible={isModalVisible} cbsTitle={formatMessage({ id: 'lbl.query_comm_bl_box' })} cbsFun={() => handleCancel()}>
            {/* <Modal title={formatMessage({ id: 'lbl.query_comm_bl_box' })} visible={isModalVisible} footer={null} width="80%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <Form form={queryForm} name='func' style={{ minWidth: '830px' }}>
                <Row>
                    {/* 提单号码 */}
                    <InputText disabled name='keyBillReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                    {/* 贸易线 */}
                    <InputText disabled name='cargoTradeLaneCode' label={<FormattedMessage id='lbl.Trade-line' />} span={6} />
                    {/* Por */}
                    <InputText disabled name='por' label={<FormattedMessage id='lbl.Por' />} span={6} />
                    {/* 出口协议 */}
                    <InputText disabled name='outBoundDoorCyIndicator' label={<FormattedMessage id='lbl.Export-agreement' />} span={6} />
                    {/* 进口协议 */}
                    <InputText disabled name='inboundDoorCyIndicator' label={<FormattedMessage id='lbl.Import-agreement' />} span={6} />
                    {/* Fnd */}
                    <InputText disabled name='fnd' label={<FormattedMessage id='lbl.Fnd' />} span={6} />
                    {/* First Svvd */}
                    <InputText disabled name='firstLoadingSvvdId' label={<FormattedMessage id='lbl.comm-result-1' />} span={6} />
                    {/* First Base Svvd */}
                    <InputText disabled name='firstBaseLoadingSvvdId' label={<FormattedMessage id='lbl.comm-result-2' />} span={6} />
                    {/* Last Base Svvd */}
                    <InputText disabled name='lastBaseLoadingSvvdId' label={<FormattedMessage id='lbl.comm-result-3' />} span={6} />
                    {/* Last Svvd */}
                    <InputText disabled name='lastLoadingSvvdId' label={<FormattedMessage id='lbl.comm-result-4' />} span={6} />
                    {/* First POL */}
                    <InputText disabled name='firstPolCode' label={<FormattedMessage id='lbl.comm-result-5' />} span={6} />
                    {/* First Base POL */}
                    <InputText disabled name='firstBasePolCode' label={<FormattedMessage id='lbl.comm-result-6' />} span={6} />
                    {/* Last Base POD  */}
                    <InputText disabled name='lastBasePodCode' label={<FormattedMessage id='lbl.comm-result-7' />} span={6} />
                    {/* Last POD  */}
                    <InputText disabled name='lastPodCode' label={<FormattedMessage id='lbl.comm-result-8' />} span={6} />
                </Row>
            </Form>
            <div className='footer-table' style={{ minWidth: '830px' }}>
                <PaginationTable
                    rowKey='lcrAgreementHeadUuid'
                    columns={columns}
                    dataSource={detailsList}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', minWidth: '830px' }}>
                <PaginationTable
                    rowKey="lcrAgreementHeadUuid"
                    columns={columnsdata}
                    dataSource={detailsStatisticsList}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <div className='bottom_btn' style={{ minWidth: '830px' }}>
                {/* 打印 */}
                <CosButton><FormattedMessage id='lbl.Printing' /></CosButton>
                {/* 下载 */}
                <CosDownLoadBtn
                    disabled={detailsList.length ? false : true}
                    downLoadTitle={'lbl.query_comm_bl_box'}
                    downColumns={[
                        {
                            dataHead: {
                                keyBillReferenceCode: intl.formatMessage({ id: "lbl.bill-of-lading-number" }),     // 提单号码
                                cargoTradeLaneCode: intl.formatMessage({ id: 'lbl.Trade-line' }),   // 贸易线
                                por: intl.formatMessage({ id: 'lbl.Por' }),   // Por
                                outBoundDoorCyIndicator: intl.formatMessage({ id: 'lbl.Export-agreement' }),   // 出口协议
                                inboundDoorCyIndicator: intl.formatMessage({ id: 'lbl.Import-agreement' }),   // 进口协议
                                fnd: intl.formatMessage({ id: 'lbl.Fnd' }),   // Fnd
                                firstLoadingSvvdId: intl.formatMessage({ id: 'lbl.ac.pymt.claim-note' }),   // First Svvd
                                firstBaseLoadingSvvdId: intl.formatMessage({ id: 'lbl.Final-confirmation-date' }),   // First Base Svvd
                                lastBaseLoadingSvvdId: intl.formatMessage({ id: 'lbl.Final-confirmation-date' }),   // Last Base Svvd
                                lastLoadingSvvdId: intl.formatMessage({ id: 'lbl.Final-confirmation-date' }),   // Last Svvd
                                firstPolCode: intl.formatMessage({ id: 'lbl.Final-confirmation-date' }),   // First POL
                                firstBasePolCode: intl.formatMessage({ id: 'lbl.Final-confirmation-date' }),   // First Base POL
                                lastBasePodCode: intl.formatMessage({ id: 'lbl.Final-confirmation-personnel' }),   // Last Base POD 
                                lastPodCode: intl.formatMessage({ id: 'lbl.Final-confirmation-personnel' }),   // Last POD 

                            },
                            dataCol: columns,
                            sumCol: columnsdata,
                            sheetName: 'lbl.query_comm_bl_box'
                        }
                    ]}
                    downLoadUrl={'COMM_QUERY_EXP_LOAD_COMM_BILL'}
                    queryData={detaUuid}
                    setSpinflag={setSpinflag}
                    btnName={'btn.download'} />
                {/* 关闭 */}
                <CosButton onClick={handleCancel}><FormattedMessage id='lbl.close' /></CosButton>
            </div>
            {/* </Modal> */}
        </CosModal >
    )
}
export default QueryCommissionHistoryInformationDetails