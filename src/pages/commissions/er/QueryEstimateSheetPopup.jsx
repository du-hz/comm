// 查询预估单-弹窗
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Modal, Button, Card, Input, Form, Row, Col, Transfer, Tabs, Table, Tooltip, InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData } from '@/utils/commonDataInterface';
import { Toast } from '@/utils/Toast'
import request from '@/utils/request';
import { CosToast } from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import Loading from '@/components/Common/Loading'
import CosModal from '@/components/Common/CosModal'

const { TabPane } = Tabs;
const EstimatedCommissionDetails = (props) => {
    const {
        isModalVisible,
        setIsModalVisible,
        headerTitle,
        detailsList,
        detailsStatisticsList,
        messageHeader,
        detailsListTotal,
        receipt,
        withinBoundary,
        commType,
        parameter,
        setDetailsList,   //  列表
        setDetailsListTotal,  // 列表条数
        setMessageHeader,   //  头信息
        setHeaderTitle,
        setDetailsStatisticsList,    // 统计列表
        setObjMessage,
        objMessage,
    } = props.initData;

    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [queryForm] = Form.useForm();
    const [priceIncludingTax, setPriceIncludingTax] = useState([]); // 是否含税价
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    const handleCancel = () => {
        setPage({
            current: 1,
            pageSize: 10
        })
        setIsModalVisible(false)
    }

    useEffect(() => {
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        receipt.values ? receipt.values.map((v, i) => {
            if (messageHeader.verifyStatus == v.value) {
                messageHeader.verifyStatus = v.label
            }
        }) : null


        queryForm.setFieldsValue({
            companyCode: messageHeader.companyCode,
            tmpYgListCode: messageHeader.tmpYgListCode,
            generateUser: messageHeader.generateUser,
            generateDatetime: messageHeader.generateDatetime ? messageHeader.generateDatetime.substring(0, 10) : null,
            verifyStatus: messageHeader.verifyStatus,
            pkgProcessId: messageHeader.pkgProcessId ? messageHeader.pkgProcessId : 0,
            checkUser: messageHeader.checkUser,
            checkDatetime: messageHeader.checkDatetime ? messageHeader.checkDatetime.substring(0, 10) : null,
        })
    }, [messageHeader])

    // 明细列表
    const columns = [
        {
            //     title: <FormattedMessage id="lbl.Estimated-order-number" />,// 预估单号码
            //     dataIndex: 'ygListCode',
            // sorter: false,
            //     width: 120
            // },{
            title: <FormattedMessage id="lbl.Cost-status" />,// 费用状态
            dataType: receipt.values,
            dataIndex: 'verifyStatus',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id='lbl.generation-date' />,// 生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.argue.bizDate" />,// 业务日期
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
            dataIndex: 'vatFlag',
            dataType: priceIncludingTax,
            align: 'right',
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
            // render:(text,record) => {
            //     return <div>
            //         {
            //             withinBoundary.map((v, i) => {
            //                 return text == v.value ? <span>{v.label}</span> : '';
            //             })
            //         }
            //     </div>
            // }
        }, {
            title: <FormattedMessage id='lbl.Contract-No' />,// 合约号
            dataIndex: 'agmtId',
            align: 'left',
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
            title: <FormattedMessage id="lbl.Cost-status" />,// 费用状态
            dataType: receipt.values,
            dataIndex: 'verifyStatus',
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



    const pageChangeFun = async (pagination, options, search) => {

        const result = await request($apiUrl.COMM_ER_LOAD_ER_RECEIPT, {
            method: "POST",
            data: {
                params: {
                    uuid: parameter.ygListUuid,
                    pageSize: pagination.pageSize,
                    start: pagination.current,
                }
            }
        })
        console.log(result)
        if (result.success) {
            // Toast('', result.message, 'alert-success', 5000, false)
            setObjMessage({ alertStatus: 'alert-success', message: result.message });
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            setPage({ ...pagination })
            let data = result.data;
            setDetailsList([]);   //  列表
            setDetailsStatisticsList([]);    // 统计列表
            setDetailsList(data.commissionYgDetailList);   //  列表
            setDetailsStatisticsList(data.commissionStatistics);    // 统计列表
        } else {
            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }

    const pageChange = (pagination, options,) => {
        setObjMessage({});
        pageChangeFun(pagination, null, 'search');
    }

    // 下载
    const dataColData = {};
    const sumColData = {};
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setObjMessage({});
        let queryData = queryForm.getFieldValue();
        setSpinflag(true);  // 加载

        columns.map((v, i) => {
            dataColData[v.dataIndex] = intl.formatMessage({ id: v.title.props.id })
        })
        columnsdata.map((v, i) => {
            sumColData[v.dataIndex] = intl.formatMessage({ id: v.title.props.id })
        })

        const result = await request($apiUrl.COMM_ER_EXP_ER_RECEIPT, {
            method: "POST",
            data: {
                page: {
                    pageSize: 0,
                    current: 0
                },
                params: {
                    uuid: parameter.ygListUuid
                },
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet-popup' }), //文件名
                sheetList: [{//sheetList列表
                    dataHead: {
                        companyCode: intl.formatMessage({ id: 'lbl.company' }),    // 公司 
                        tmpYgListCode: intl.formatMessage({ id: 'lbl.Temporary.estimated-order-number' }),  // 临时预估单号码 
                        generateUser: intl.formatMessage({ id: 'lbl.Generation-personnel' }),    // 生成人员
                        generateDatetime: intl.formatMessage({ id: 'lbl.generation-date' }),   // 生成日期 
                        verifyStatus: intl.formatMessage({ id: 'lbl.Estimated-single-state' }),  // 预估单状态 
                        pkgProcessId: intl.formatMessage({ id: 'lbl.Generating-packets' }),   // 生成数据包的批次 
                        checkUser: intl.formatMessage({ id: 'lbl.confirmation-personnel' }),   // 确认人员 
                        checkDatetime: intl.formatMessage({ id: 'lbl.confirmation-date' }),     // 确认日期
                    },
                    dataCol: dataColData,   //列表字段
                    sumCol: sumColData,     //汇总字段
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet-popup' }),//sheet名称
                }],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
        })
        // if (result && result.success == false) {  //若无数据，则不下载
        //     setSpinflag(false);  // 加载
        //     Toast('', result.errorMessage, 'alert-error', 5000, false);
        //     return
        // } else {
        if (result.size < 1) {
            setSpinflag(false)
            setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Unclock-agFee-download' }) })
            return
        } else {
            setSpinflag(false);  // 加载
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            let blob = new Blob([result], { type: "application/x-xls" });
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet-popup' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.er.est-sheet-popup' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 打印
    const printFun = async () => {
        // Toast('', '', '', 5000, false);
        // 通过id选择需要打印的区域
        // window.document.body.innerHTML = window.document.getElementById('footer-table').innerHTML;
        // 调用打印
        // const win = window.open('', 'printwindow');
        // win.document.write(<div>12345</div>);
        // win.print();
        // win.close();
        // 刷新页面
        // window.location.reload();
    }

    return (
        <CosModal cbsWidth={'80%'} cbsVisible={isModalVisible} cbsTitle={headerTitle + formatMessage({ id: 'lbl.Estimated-Commission-details' })} cbsFun={() => handleCancel()}>
            {/* <Modal title={headerTitle + formatMessage({ id: 'lbl.Estimated-Commission-details' })} visible={isModalVisible} footer={null} width="80%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosToast toast={objMessage} style={{ minWidth: '1050px' }} />
            <Form
                form={queryForm}
                name='func'
                onFinish={handleQuery}
                style={{ minWidth: '1050px' }}
            >
                <Row>
                    {/* 公司 */}
                    <InputText disabled name='companyCode' label={<FormattedMessage id='lbl.company' />} span={6} />
                    {/* 临时预估单号码 */}
                    <InputText disabled name='tmpYgListCode' label={<FormattedMessage id='lbl.Temporary.estimated-order-number' />} span={6} />
                    {/* 生成人员 */}
                    <InputText disabled name='generateUser' label={<FormattedMessage id='lbl.Generation-personnel' />} span={6} />
                    {/* 生成日期 */}
                    <InputText disabled name='generateDatetime' label={<FormattedMessage id='lbl.generation-date' />} span={6} />
                    {/* 预估单状态 */}
                    <InputText disabled name='verifyStatus' label={<FormattedMessage id='lbl.Estimated-single-state' />} span={6} />
                    {/* 生成数据包的批次 */}
                    <InputText disabled name='pkgProcessId' label={<FormattedMessage id='lbl.Generating-packets' />} span={6} />
                    {/* 确认人员 */}
                    <InputText disabled name='checkUser' label={<FormattedMessage id='lbl.confirmation-personnel' />} span={6} />
                    {/* 确认日期 */}
                    <InputText disabled name='checkDatetime' label={<FormattedMessage id='lbl.confirmation-date' />} span={6} />
                </Row>
            </Form>
            <div id="footer-table" className='footer-table' style={{ minWidth: '1050px' }}>
                <PaginationTable
                    dataSource={detailsList}
                    columns={columns}
                    rowKey='billBasicUuid'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={detailsListTotal}
                    pageSize={page.pageSize}
                    current={page.current}
                    rowSelection={null}
                />
            </div>
            <div className='footer-table' style={{ marginTop: '10px', minWidth: '1050px' }}>
                <PaginationTable
                    rowKey="billBasicUuid"
                    columns={columnsdata}
                    dataSource={detailsStatisticsList}
                    pagination={false}
                    rowSelection={null}
                    scrollHeightMinus={200}
                />
            </div>
            <div className='bottom_btn' style={{ minWidth: '1050px' }}>
                {/* 打印 */}
                <CosButton onClick={printFun}><FormattedMessage id='lbl.Printing' /></CosButton>
                {/* 下载 */}
                <CosButton disabled={detailsList.length ? false : true} onClick={() => downloadBtn()}><FormattedMessage id='lbl.download' /></CosButton>
                {/* 关闭 */}
                <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.close' /></CosButton>
            </div>
            <Loading spinning={spinflag} />
            {/* </Modal> */}
        </CosModal>
    )
}
export default EstimatedCommissionDetails