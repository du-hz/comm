// 查询结转实付报账单-弹窗
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Modal, Button, Card, Input, Form, Row, Col, Transfer, Tabs, Table, Tooltip, InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { Toast } from '@/utils/Toast'
import request from '@/utils/request';
// import { CosToast } from '@/components/Common/index'
// import CosButton from '@/components/Common/CosButton'
import { CosDownLoadBtn, CosButton, CosToast } from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'

const BillPaidDetails = (props) => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const {
        isModalVisible,
        setIsModalVisible,
        headerTitle,
        detailsList,
        detailsStatisticsList,
        messageHeader,
        detailsListTotal,
        commType,
        withinBoundary,
        priceIncludingTax,
        uuid,
        setSpinflag,
        setDetailsList,
        setDetailsListTotal,
        setMessageHeader,
        setHeaderTitle,
        setDetailsStatisticsList,
        reimbursementState,
        setTableData,
    } = props.initData;

    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    useEffect(() => {
        queryForm.setFieldsValue({
            sfListCode: messageHeader.sfListCode,
            companyCode: messageHeader.companyCode,
            agencyCode: messageHeader.agencyCode,
            generateDatetime: messageHeader.generateDatetime ? messageHeader.generateDatetime.substring(0, 10) : '',
            generateUser: messageHeader.generateUser,
            verifyStatus: messageHeader.verifyStatus,
            userNote: messageHeader.userNote,
            recordUpdateDate: messageHeader.recordUpdateDate ? messageHeader.recordUpdateDate.substring(0, 10) : '',
            recordUpdateUser: messageHeader.recordUpdateUser,
        })
    }, [messageHeader])

    // 明细列表
    const columns = [
        {
            //     title: <FormattedMessage id="lbl.Estimated-order-number" />,// 预估单号码
            //     dataIndex: 'ygListCode',
            //     sorter: false,
            //     width: 120
            // },{
            title: <FormattedMessage id='lbl.argue.bizDate' />,// 业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.bill-of-lading-number" />,// 提单号码
            dataIndex: 'billReferenceCode',
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
            title: <FormattedMessage id="lbl.Trade-line" />,// 贸易线
            dataIndex: 'cargoTradeLaneCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.pdr-fnd" />,// POR/FND
            dataIndex: 'porFndQskey',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.SVVD" />,// SVVD
            dataIndex: 'svvdId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,// 是否含税价
            dataType: priceIncludingTax.values,
            dataIndex: 'vatFlag',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,// 协议币税金(参考）
            dataIndex: 'vatAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,// 协议币调整税金（参考）
            dataIndex: 'vatReviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets' />,// 应付网点金额
            dataIndex: 'paymentAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.AP-outlets' />,// 应付网点
            dataIndex: 'customerSapId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Agency-net-income' />,// 代理净收入
            dataIndex: 'updatedTotalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.submitanexpenseaccount' />,// 向谁报账
            dataIndex: 'sfSide',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.profit-center' />,// 利润中心
            dataIndex: 'profitCenterCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Booking-Party' />,// Booking Party
            dataIndex: 'bookingPartyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Amount-in-base-currency' />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Tax-in-local-currency' />,// 本位币税金（参考）
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency' />,// 本位币调整税金（参考）
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency' />,// 结算币税金（参考）
            dataIndex: 'vatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency' />,// 结算币调整税金（参考）
            dataIndex: 'reviseVatAmountInClearing',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id='lbl.within-boundary' />,// 是否边界内
            dataType: withinBoundary.values,
            dataIndex: 'excludeFlag',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Main-voyage' />,// 主航次
            dataIndex: 'trnPrimarySvvdId',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Main-voyage-loading-port' />,// 主航次装港
            dataIndex: 'primaryPolCode',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.Contract-No' />,// 合约号
            dataIndex: 'agmtId',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Return-flag' />,// 退回标志位
            dataIndex: 'checkStatus',
            // sorter: false,
            width: 120
        }
    ]

    // 明细统计列表
    const columnsdata = [
        {
            title: <FormattedMessage id="lbl.The-Commission" />,// 佣金模式
            dataIndex: 'commissionMode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency" />,// 协议币种
            dataIndex: 'rateCurrencyCode',
            // sorter: false,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,// 协议币调整金额
            dataIndex: 'reviseAmount',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,// 协议币税金(参考）
            dataIndex: 'vatAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,// 协议币调整税金（参考）
            dataIndex: 'vatReviseAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150,
        }, {
            title: <FormattedMessage id='lbl.Amount-payable-to-outlets' />,// 应付网点金额
            dataIndex: 'pymtAmtSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Agency-net-income' />,// 代理净收入
            dataIndex: 'recAmtSum',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.submitanexpenseaccount' />,// 向谁报账
            dataIndex: 'sfSide',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Standard-currency' />,// 本位币种
            dataIndex: 'agencyCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Amount-in-base-currency' />,// 本位币金额
            dataIndex: 'totalAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Adjustment-amount-in-base-currency' />,// 本位币调整金额
            dataIndex: 'reviseAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Tax-in-local-currency' />,// 本位币税金（参考）
            dataIndex: 'vatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.Tax-adjustment-in-base-currency' />,// 本位币调整税金（参考）
            dataIndex: 'reviseVatAmountInAgency',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        }, {
            title: <FormattedMessage id='lbl.settlement-currency' />,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency' />,// 结算币金额
            dataIndex: 'totalAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.adjustment-amount-in-settlement-currency' />,// 结算币调整金额
            dataIndex: 'reviseAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.tax-in-settlement-currency' />,// 结算币税金（参考）
            dataIndex: 'vatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.tax-adjustment-in-settlement-currency' />,// 结算币调整税金（参考）
            dataIndex: 'reviseVatAmountInClearingSum',
            dataType: 'dataAmount',
            align: 'right',
            // sorter: false,
            width: 150
        },
    ]

    // 分页
    const pageChange = async (pagination) => {
        setObjMessage({});
        setSpinflag(true);
        const result = await request($apiUrl.COMM_CR_SEARCH_ER_RECEIPT_BILL, {
            method: "POST",
            data: {
                params: {
                    pageSize: pagination.pageSize,
                    start: pagination.current,
                    sfListUuid: uuid,
                    // billReferenceCode: formData.billReferenceCode,
                }
            }
        })

        console.log(result)
        if (result.success) {
            setSpinflag(false);
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            console.log(pagination)
            setPage({ ...pagination })
            let data = result.data;
            let setIpt = data.commissionSfLists[0];
            setDetailsList(data.commissionSfListDetail);   //  列表
            setDetailsListTotal(data.totalCount);  // 列表条数
            reimbursementState.values.map((v, i) => {
                setIpt.verifyStatus == v.value ? setIpt.verifyStatus = v.label : '';
            })
            setMessageHeader(data.commissionSfLists[0]);   //  头信息
            setHeaderTitle(data.commissionSfLists[0].sfListCode);
            setDetailsStatisticsList(data.commissionStatistics);    // 统计列表

            // let listdata = data.commissionSfLists;
            // setTableData(listdata);
        } else {
            setSpinflag(false);
            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }

    // 关闭弹窗
    const handleCancel = () => {
        setIsModalVisible(false);
        setPage({
            current: 1,
            pageSize: 10
        })
    }

    return (
        <CosModal cbsWidth={'80%'} cbsVisible={isModalVisible} cbsTitle={headerTitle + formatMessage({ id: 'lbl.Estimated-Commission-details' })} cbsFun={() => handleCancel()}>
            {/* <Modal title={headerTitle + formatMessage({ id: 'lbl.Estimated-Commission-details' })} visible={isModalVisible} footer={null} width="80%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosToast toast={objMessage} style={{ minWidth: '945px' }} />
            <Form
                form={queryForm}
                name='func'
                onFinish={handleQuery}
                style={{ minWidth: '945px' }}
            >
                <Row>
                    {/* 报账单号码 */}
                    <InputText disabled name='sfListCode' label={<FormattedMessage id='lbl.Reimbursement-number' />} span={6} />
                    {/* 公司 */}
                    <InputText disabled name='companyCode' label={<FormattedMessage id='lbl.company' />} span={6} />
                    {/* 代理编码 */}
                    <InputText disabled name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} />
                    {/* 报账日期 */}
                    <InputText disabled name='generateDatetime' label={<FormattedMessage id='lbl.Reimbursement-date' />} span={6} />
                    {/* 报账人员 */}
                    <InputText disabled name='generateUser' label={<FormattedMessage id='lbl.Reimbursement-personnel' />} span={6} />
                    {/* 最后确认单状态 */}
                    <InputText disabled name='verifyStatus' label={<FormattedMessage id='lbl.Final-confirmation-status' />} span={6} />
                    {/* 备注 */}
                    <InputText disabled name='userNote' label={<FormattedMessage id='lbl.ac.pymt.claim-note' />} span={6} />
                    {/* 最后确认日期 */}
                    <InputText disabled name='recordUpdateDate' label={<FormattedMessage id='lbl.Final-confirmation-date' />} span={6} />
                    {/* 最后确认人员 */}
                    <InputText disabled name='recordUpdateUser' label={<FormattedMessage id='lbl.Final-confirmation-personnel' />} span={6} />
                </Row>
            </Form>
            <div className='footer-table' style={{ minWidth: '945px' }}>
                <PaginationTable
                    dataSource={detailsList}
                    columns={columns}
                    rowKey='lcrAgreementHeadUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    rowSelection={null}
                    total={detailsListTotal}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', minWidth: '945px' }}>
                <PaginationTable
                    rowKey="lcrAgreementHeadUuid"
                    columns={columnsdata}
                    dataSource={detailsStatisticsList}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <div className='bottom_btn' style={{ minWidth: '945px' }}>
                {/* 打印 */}
                <CosButton><FormattedMessage id='lbl.Printing' /></CosButton>
                {/* 下载 */}
                {/* <CosButton onClick={downloadBtn}><FormattedMessage id='lbl.download' /></CosButton> */}
                <CosDownLoadBtn
                    downMessage={setObjMessage}
                    messFlag={true}
                    disabled={detailsList.length ? false : true}
                    downLoadTitle={'menu.afcm.comm.cr.bill-paid-detail'}
                    downColumns={[{
                        dataHead: {
                            sfListCode: intl.formatMessage({ id: 'lbl.Reimbursement-number' }), // 报账单号码 
                            companyCode: intl.formatMessage({ id: 'lbl.company' }), // 公司 
                            agencyCode: intl.formatMessage({ id: 'lbl.agency' }), // 代理编码 
                            generateDatetime: intl.formatMessage({ id: 'lbl.Reimbursement-date' }), // 报账日期 
                            generateUser: intl.formatMessage({ id: 'lbl.Reimbursement-personnel' }), // 报账人员 
                            verifyStatus: intl.formatMessage({ id: 'lbl.Final-confirmation-status' }), // 最后确认单状态 
                            userNote: intl.formatMessage({ id: 'lbl.ac.pymt.claim-note' }), // 备注 
                            recordUpdateDate: intl.formatMessage({ id: 'lbl.Final-confirmation-date' }), // 最后确认日期 
                            recordUpdateUser: intl.formatMessage({ id: 'lbl.Final-confirmation-personnel' }), // 最后确认人员
                        },
                        dataCol: columns,
                        sumCol: columnsdata
                    }]}
                    downLoadUrl={'COMM_CR_EXP_CR_RECEIPT_DETAIL'}
                    queryData={{
                        sfListUuid: uuid,
                    }}
                    setSpinflag={setSpinflag}
                    btnName={'lbl.download'} />
                {/* 关闭 */}
                <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.close' /></CosButton>
            </div>
            {/* </Modal> */}
        </CosModal>
    )
}
export default BillPaidDetails


    // // 下载
    // const downloadBtn = async() => {
    //     setObjMessage({});
    //     let queryData = queryForm.getFieldValue();
    //     const result = await request($apiUrl.COMM_CR_EXP_CR_RECEIPT_DETAIL,{
    //         method:"POST",
    //         data:{
    //             page: {
    //                 current: 0,
    //                 pageSize: 0
    //             },
    //             sfListUuid: uuid,
    //             excelFileName: intl.formatMessage({id: 'menu.afcm.comm.cr.bill-paid-detail'}), //文件名
    //             sheetList: [{//sheetList列表
    //                 dataCol: {//列表字段
    //                     activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),    // 业务日期
    //                     billReferenceCode: intl.formatMessage({id: "lbl.bill-of-lading-number"}),     // 提单号码
    //                     commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),     // 佣金模式
    //                     commissionType: intl.formatMessage({id: "lbl.Commission-type"}),     // 佣金类型
    //                     cargoTradeLaneCode: intl.formatMessage({id: "lbl.Trade-line"}),     // 贸易线
    //                     porFndQskey: intl.formatMessage({id: "lbl.pdr-fnd"}),    // POR/FND
    //                     svvdId: intl.formatMessage({id: "lbl.SVVD"}),    // SVVD
    //                     portCode: intl.formatMessage({id: "lbl.port"}),    // 港口
    //                     officeCode: intl.formatMessage({id: "lbl.office"}),     // OFFICE
    //                     rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),    // 协议币种
    //                     totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),    // 协议币金额
    //                     reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),    // 协议币调整金额
    //                     vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),    // 是否含税价
    //                     vatAmount: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),    // 协议币税金(参考)
    //                     vatReviseAmount: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),    // 协议币调整税金(参考)
    //                     paymentAmount: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),    // 应付网点金额
    //                     customerSapId: intl.formatMessage({id: "lbl.AP-outlets"}),    // 应付网点
    //                     updatedTotalAmount: intl.formatMessage({id: "lbl.Agency-net-income"}),    // 代理净收入
    //                     sfSide: intl.formatMessage({id: "lbl.submitanexpenseaccount"}),    // 向谁报账
    //                     profitCenterCode: intl.formatMessage({id: "lbl.profit-center"}),    // 利润中心
    //                     bookingPartyCode: intl.formatMessage({id: "lbl.Booking-Party"}),    // Booking Party
    //                     agencyCurrencyCode: intl.formatMessage({id: "lbl.Standard-currency"}),    // 本位币种
    //                     totalAmountInAgency: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),    // 本位币金额
    //                     reviseAmountInAgency: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),    // 本位币调整金额
    //                     vatAmountInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),    // 本位币税金(参考)
    //                     reviseVatAmountInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),    // 本位币调整税金(参考)
    //                     clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),    // 结算币种
    //                     totalAmountInClearing: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),    // 结算币金额
    //                     reviseAmountInClearing: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),    // 结算币调整金额
    //                     vatAmountInClearing: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),    // 结算币税金(参考)
    //                     reviseVatAmountInClearing: intl.formatMessage({id: "lbl.tax-adjustment-in-settlement-currency"}),    // 结算币调整税金(参考)
    //                     excludeFlag: intl.formatMessage({id: "lbl.within-boundary"}),    // 是否边界内
    //                     trnPrimarySvvdId: intl.formatMessage({id: "lbl.Main-voyage"}),    // 主航次
    //                     primaryPolCode: intl.formatMessage({id: "lbl.Main-voyage-loading-port"}),    // 主航次装港
    //                     agmtId: intl.formatMessage({id: "lbl.Contract-No"}),    // 合约号
    //                     vatFlag: intl.formatMessage({id: "lbl.Return-flag"}),    // 退回标志位
    //                 },
    //                 sumCol: {//汇总字段
    //                     commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),   // 佣金模式
    //                     rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),   // 协议币种
    //                     totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),   // 协议币金额
    //                     reviseAmount: intl.formatMessage({id: "lbl.Agreement-currency-adjustment-amount"}),   // 协议币调整金额
    //                     vatAmtSum: intl.formatMessage({id: "lbl.Agreement-currency-tax-reference"}),   // 协议币税金(参考）
    //                     vatReviseAmtSum: intl.formatMessage({id: "lbl.Tax-adjustment-in-agreement-currency-reference"}),   // 协议币调整税金（参考）
    //                     pymtAmtSum: intl.formatMessage({id: "lbl.Amount-payable-to-outlets"}),   // 应付网点金额
    //                     recAmtSum: intl.formatMessage({id: "lbl.Agency-net-income"}),   // 代理净收入
    //                     sfSide: intl.formatMessage({id: "lbl.submitanexpenseaccount"}),   // 向谁报账
    //                     agencyCurrencyCode: intl.formatMessage({id: "lbl.Standard-currency"}),   // 本位币种
    //                     totalAmountInAgency: intl.formatMessage({id: "lbl.Amount-in-base-currency"}),   // 本位币金额
    //                     reviseAmountInAgency: intl.formatMessage({id: "lbl.Adjustment-amount-in-base-currency"}),   // 本位币调整金额
    //                     vatAmountInAgency: intl.formatMessage({id: "lbl.Tax-in-local-currency"}),   // 本位币税金(参考)
    //                     reviseVatAmountInAgency: intl.formatMessage({id: "lbl.Tax-adjustment-in-base-currency"}),   // 本位币调整税金(参考)
    //                     clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),  // 结算币种
    //                     totalAmountInClearingSum: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),   // 结算币金额
    //                     reviseAmountInClearingSum: intl.formatMessage({id: "lbl.adjustment-amount-in-settlement-currency"}),  // 结算币调整金额
    //                     vatAmountInClearingSum: intl.formatMessage({id: "lbl.tax-in-settlement-currency"}),    // 结算币税金(参考)
    //                     reviseVatAmountInClearingSum: intl.formatMessage({id: 'lbl.tax-adjustment-in-settlement-currency'}),   // 结算币调整税金(参考)
    //                 },
    //                 sheetName: intl.formatMessage({id: 'menu.afcm.comm.cr.bill-paid-detail'}),//sheet名称
    //             }],
    //         },
    //         headers: {
    //             "biz-source-param": "BLG"
    //         },
    //         responseType: 'blob',
    //     })
    //     if(result && result.success == false){  //若无数据，则不下载
    //         setObjMessage({alertStatus: 'alert-error', message: result.errorMessage});
    //         return
    //     }else{
    //         // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
    //         let blob = new Blob([result], { type: "application/x-xls" });
    //         if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
    //             navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.comm.cr.bill-paid-detail'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
    //         } else {
    //             let downloadElement = document.createElement('a');  //创建元素节点
    //             let href = window.URL.createObjectURL(blob); // 创建下载的链接
    //             downloadElement.href = href;
    //             downloadElement.download = intl.formatMessage({id: 'menu.afcm.comm.cr.bill-paid-detail'}) + '.xlsx'; // 下载后文件名
    //             document.body.appendChild(downloadElement); //添加元素
    //             downloadElement.click(); // 点击下载
    //             document.body.removeChild(downloadElement); // 下载完成移除元素
    //             window.URL.revokeObjectURL(href); // 释放掉blob对象
    //         }
    //     }
    // }