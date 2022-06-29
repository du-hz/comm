{/* 待预提与实际预提差异比对(佣金) */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import request from '@/utils/request';
import Select from '@/components/Common/Select';
import InputText from '@/components/Common/InputText';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import { acquireSelectData, acquireSelectDataExtend, agencyCodeData, momentFormat } from '@/utils/commonDataInterface';
import { Button, Form, Row,  } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const notAccruedComm =()=> {
    const [tableData, setTableData] = useState([]);  // 表格的数据
    const [tabTotal,setTabTotal] = useState([]); //数据总数
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [currencyCode, setCurrencyCode] = useState({}); // 币种
    const [commClass,setCommClass] = useState ({}) //佣金类型
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [lastCondition, setLastCondition] = useState({
        "soCompanyCode": null,
        "agencyCode": null,
        "rateCurrencyCode": null,
        "commClass": null,
        "billReferenceCode": null,
        "activityDate": null,
    });
    {/*查询*/}
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    {/*初始化*/}
	useEffect(()=>{
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setCurrencyCode, $apiUrl);// 币种
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        // acquireSelectData('COMMISSION.CLASS', setCommClass, $apiUrl);     // 佣金类型
        acquireSelectData('COMM.TYPE',setCommClass, $apiUrl);// 佣金类型
    },[])
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'soCompanyCode',
            sorter: false,
            width: 120,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.agency'/>,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.Commission-type'/>,//佣金类型
            dataIndex: 'commissionClass',
            dataType: commClass.values,
            sorter: false,
            width: 120,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.ccy'/>,//币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.bill-no'/>,//提单号
            dataIndex: 'billReferenceCode',
            sorter: false,
            width: 120,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.To-be-accrued-amount'/>,//待预提金额
            dataIndex: 'calcTotalAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 120,
            align:'right',
        },{
            title: <FormattedMessage id='lbl.Actual-accrued-amount'/>,//实际预提金额
            dataIndex: 'ytTotalAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 120,
            align:'right',
        },
    ]
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields()
        setTableData([])
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
    }

    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.ACCRUED_DIFF_COMM_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    soCompanyCode: queryData.soCompanyCode,
                    agencyCode: queryData.agencyCode,
                    rateCurrencyCode: queryData.rateCurrencyCode,
                    commClass: queryData.commClass,
                    billReferenceCode: queryData.billReferenceCode,
                    activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            let datas=result.data.resultList
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
        }else {
            setSpinflag(false);
            setTableData([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.ACCRUED_DIFF_COMM_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    ...queryData,
                    activeDateFrom: queryData.activeDate?momentFormat(queryData.activeDate[0]):null,
                    activeDateTo: queryData.activeDate?momentFormat(queryData.activeDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.accrued.diff.diffComm'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        soCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        commissionClass: intl.formatMessage({id: "lbl.Commission-type"}),
                        rateCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),
                        billReferenceCode: intl.formatMessage({id: "lbl.bill-no"}),
                        calcTotalAmount: intl.formatMessage({id: "lbl.To-be-accrued-amount"}),
                        ytTotalAmount: intl.formatMessage({id: "lbl.Actual-accrued-amount"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.accrued.diff.diffComm'}),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size==0){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.accrued.diff.diffComm'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.accrued.diff.diffComm'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form onFinish={handleQuery} form={queryForm} name='search'>
                    <Row>
                        {/* 船东 */}
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} formlayouts={formlayouts}/>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} formlayouts={formlayouts}/> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} formlayouts={formlayouts}/>
                        }
                        {/* 币种 */}
						<Select span={6} name='rateCurrencyCode' label={<FormattedMessage id='lbl.ccy'/>} options={currencyCode.values} flag={true} formlayouts={formlayouts}/> 
                        {/* 佣金类型 */}
                        <Select span={6} name='commClass' label={<FormattedMessage id='lbl.Commission-type'/>} options={commClass.values} flag={true} formlayouts={formlayouts}/> 
                        {/* 提单号 */}
						<InputText span={6} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-no'/>} formlayouts={formlayouts}/> 
                        {/* 业务时间 */}
                        <DoubleDatePicker span={6}  name='activeDate' flag={false} disabled={[false, false]} label={<FormattedMessage id='lbl.argue.biz-date'/>} formlayouts={formlayouts}/> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 下载 */}
                    <Button  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    <Button onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '85%'}}>
                   <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='uid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={null}
                    />
                </div>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default notAccruedComm