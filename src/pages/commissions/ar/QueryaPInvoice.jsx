// 查询应收发票
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, company, momentFormat, agencyCodeData, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Tooltip } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import QueryaPInvoicePopup from './QueryaPInvoicePopup';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileSearchOutlined, // 详情
} from '@ant-design/icons'
import { set } from 'lodash';

let formlayouts = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}
// 预估解锁
const QueryaPInvoice = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const [tableData, setTableData] = useState([]) // table数据
    const [tabTabTotal, setTabTotal] = useState([]) // table条数
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [detailedHeader, setDetailedHeader] = useState([]);// 明细头
    const [detailedList, setDetailedList] = useState([]);// 明细列表
    const [detailedStatistics, setDetailedStatistics] = useState([]);// 明细统计列表
    const [detailedListTotal, setDetailedListTotal] = useState([]);
    const [headerTitle, setHeaderTitle] = useState();  // title信息
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [verifyStatus, setverifyStatus] = useState([])//费用状态
    const [uuid, setUuid] = useState('');   // id

    const [packageData, setPackage] = useState({}); // 是否生成数据包
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [excludeFlag, setExcludeFlag] = useState({}) //是否边界内
    const [commissionType, setCommissionType] = useState({}) //佣金类型
    const [priceIncludingTax, setPriceIncludingTax] = useState({}); // 是否含税价
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode": null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
    // from 数据
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    // 初始化
    useEffect(() => {
        acquireSelectData('AGMT.VAT.FLAG', setPriceIncludingTax, $apiUrl);// 是否含税价
        acquireSelectData('AFCM.PACKAGE.FLAG', setPackage, $apiUrl);// 是否生成数据包
        acquireSelectData('AFCM.BOUNDARY.FLAG', setExcludeFlag, $apiUrl);// 是否边界内
        acquireSelectData('COMM.TYPE', setCommissionType, $apiUrl);// 佣金类型
        acquireSelectData('AFCM.ER.RECEIPT.STATUS', setverifyStatus, $apiUrl);// 费用状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     //    佣金类型
        allCommissionTypes()
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    // useEffect(() => {
    //     queryForm.setFieldsValue({
    //         shipownerCompanyCode: '2000',
    //         agencyCode: agencyCode.length > 0 ? Object.values(agencyCode[0])[0] : undefined
    //     })
    // }, [agencyCode])

    // 全部佣金小类(佣金类型)
    const allCommissionTypes = async () => {
        await request.post($apiUrl.COMMON_SEARCH_COMM_TYPE)
            .then((resul) => {
                if (!resul.data) return
                let data = resul.data
                data.map((v, i) => {
                    let labels = v.label
                    let values = v.value
                    v.label = values + '(' + labels + ')'
                    v.value = labels
                })
                setCommissionType(resul.data)
            })
    }

    // 表头
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            // sorter: false,
            width: 100,
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(page, null, 'search', record) }}><FileSearchOutlined /></a>&nbsp; {/* 查看详情 */}
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataIndex: 'companyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Invoice-number" />,// 发票号码
            dataIndex: 'yfListCode',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.argue.invDate" />,// 开票日期
            dataType: 'dateTime',
            dataIndex: 'generateDatetime',
            // sorter: false,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Personnel-of-make-out-an-invoice" />,// 开票人员
            dataIndex: 'generateUser',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.generate-package" />,// 是否生成数据包
            dataType: packageData.values,
            dataIndex: 'pkgFlag',
            // sorter: false,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Generating-packets" />,// 生成数据包的批次
            dataIndex: 'pkgProcessId',
            // sorter: false,
            width: 130,
            render: (text, record) => {
                return text ? text : 0;
            }
        }
    ]

    // 查看详情弹窗
    const commonBtn = async (pagination, options, search, record) => {
        Toast('', '', '', 5000, false);
        // if(search){
        //     pagination.current=1
        // }
        setSpinflag(true);
        setIsModalVisible(true);
        setHeaderTitle(record.yfListCode);
        setUuid(record.yfListUuid);
        const result = await request($apiUrl.COMM_AR_SEARCH_AR_INVOICE_DETAIL, {
            method: "POST",
            data: {
                uuid: record.yfListUuid,
                page: {
                    current: 1,
                    pageSize: 10
                }
            }
        })
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            // setPage({...pagination});
            setDetailedHeader(data.commissionYfList[0]);    // 明细头
            setDetailedList(data.commissionYfListDetail);   // 明细列表
            setDetailedStatistics(data.commissionStatistics);// 明细统计列表
            setDetailedListTotal(data.totalCount);
            // let listdata = data.commissionSfListDetails;
        } else {
            setSpinflag(false);
            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }

    // 查询
    const queryBtn = (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        setSpinflag(true);
        let formData = queryForm.getFieldValue();
        console.log(queryForm.getFieldValue())
        if (!formData.agencyCode || !formData.invoiceNo && !formData.billReferenceCode && !formData.generateDate) {
            setBackFlag(false)
            setSpinflag(false);
            !formData.agencyCode ? Toast('', formatMessage({ id: 'lbl.The-proxy-code-must-be-entered' }), 'alert-error', 5000, false) : Toast('', formatMessage({ id: 'lbl.query-plnvice-null' }), 'alert-error', 5000, false)
        } else {
            setBackFlag(true)
            queryFun(formData, pagination);
            // if((formData.generateDateFrom&&!formData.generateDateTo)||(!formData.generateDateFrom&&formData.generateDateTo)){
            //     Toast('','开始时间和结束时间不能只填一个!!!', 'alert-warning', 5000, false);
            //     setSpinflag(false);
            // }else{
            // queryFun(formData, pagination);
            // }
        }
        // let data=result.data
        // let datas=result.data.resultList
        // setTabTotal(data.totalCount)
        // setTableData([...datas])
    }

    // 查询函数
    const queryFun = async (formData, pagination) => {
        const result = await request($apiUrl.COMM_AR_SEARCH_AR_INVOICE_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    ...formData,
                    generateDate: undefined,
                    generateDateFrom: formData.generateDate ? momentFormat(formData.generateDate[0]) : undefined,
                    generateDateTo: formData.generateDate ? momentFormat(formData.generateDate[1]) : undefined,
                },
            }
        })
        if (result.success) {
            setSpinflag(false);
            let data = result.data;
            setTableData([]);
            setTabTotal([]);
            setTableData(data.commissionYfList);
            setTabTotal(data.totalCount);
            // if(pagination.pageSize!=page.pageSize){
            //     pagination.current=1
            // }
            setPage({ ...pagination })

            // let listdata = data.commissionYfList;
            // afcmCommonController(setTableData, listdata, {
            //     packageData: packageData,
            // });
        } else {
            setSpinflag(false);
            setTableData([]);
            setTabTotal([]);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.COMM_AR_EXP_AR_INVOICE_LIST, {
            method: "POST",
            data: {
                page: {
                    current: 0,
                    pageSize: 0
                },
                params: {
                    ...queryData,
                    generateDate: undefined,
                    generateDateFrom: queryData.generateDate ? momentFormat(queryData.generateDate[0]) : undefined,
                    generateDateTo: queryData.generateDate ? momentFormat(queryData.generateDate[1]) : undefined,
                },
                excelFileName: intl.formatMessage({ id: 'menu.afcm.comm.ar.qy-inv' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        yfListCode: intl.formatMessage({ id: "lbl.Invoice-number" }),    // 发票号码  
                        generateDatetime: intl.formatMessage({ id: "lbl.argue.invDate" }),  // 开票日期
                        generateUser: intl.formatMessage({ id: "lbl.Personnel-of-make-out-an-invoice" }),    // 开票人员  
                        pkgFlag: intl.formatMessage({ id: "lbl.generate-package" }),     // 是否生成数据包
                        pkgProcessId: intl.formatMessage({ id: "lbl.Generating-packets" }),    // 生成数据包的批次  
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.comm.ar.qy-inv' }),//sheet名称
                }],
            },
            headers: {
                "biz-source-param": "BLG"
            },
            responseType: 'blob',
        })
        // if (result && result.success == false) {  //若无数据，则不下载
        //     setSpinflag(false);
        //     Toast('', result.errorMessage, 'alert-error', 5000, false);
        //     return
        // } else {
        if (result.size < 1) {
            setSpinflag(false)
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            setSpinflag(false);
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            let blob = new Blob([result], { type: "application/x-xls" });
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.comm.ar.qy-inv' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.comm.ar.qy-inv' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 多选
    const setSelectedRows = (val) => {
        console.log(val);
    }

    const initData = {
        isModalVisible,
        setIsModalVisible,
        detailedHeader,
        detailedList,
        detailedStatistics,
        detailedListTotal,
        headerTitle,
        excludeFlag,//是否边界内
        commType,//佣金类型
        priceIncludingTax,// 是否含税价
        verifyStatus,//费用状态
        page,
        setPage,
        setDetailedHeader,   // 明细头
        setDetailedList,   // 明细列表
        setDetailedStatistics,  // 明细统计列表
        setDetailedListTotal,
        uuid,
        setObjMessage,
        objMessage,
        setSpinflag,
    }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        setBackFlag(true);
        setTableData([]);
        setTabTotal(0);
    }

    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}
                >
                    <Row>
                        {/* 船东 */}
                        <Select disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 代理编码 */}
                        {/* <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6}/> */}
                        {/* <InputText disabled name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>   */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} style={{ background: backFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 发票号码 */}
                        <InputText name='invoiceNo' styleFlag={backFlag} label={<FormattedMessage id='lbl.Invoice-number' />} span={6} />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number' />} span={6} />
                        {/* 是否生成数据包 */}
                        <Select flag={true} name='packageFlag' label={<FormattedMessage id='lbl.generate-package' />} options={packageData.values} span={6} />
                        {/* 确认日期 */}
                        <DoubleDatePicker flag={false} disabled={[false, false]} span={6} name='generateDate' style={{ background: backFlag ? "white" : "yellow" }} label={<FormattedMessage id="lbl.argue.invDate" />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置按钮 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                    <CosButton onClick={() => queryBtn(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='yfListUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={queryBtn}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    setSelectedRows={setSelectedRows}
                    rowSelection={null}
                />
            </div>
            <QueryaPInvoicePopup initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default QueryaPInvoice