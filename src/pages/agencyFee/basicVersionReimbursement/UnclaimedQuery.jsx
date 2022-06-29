import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, acquireSelectDataExtend, costCategories, agencyCodeData, momentFormat, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- 未报账查询 -------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([])
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [subclass,setSubclass] = useState([]);    // 费用类型
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [reason,setReason] = useState(true);//原因
    const [spinflag,setSpinflag] = useState(false)
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode":null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
            // soCompanyCode: company.companyType == 0 ? company.companyCode : defVal.shipownerCompanyCode
        })
    }, [company, acquireData])

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDatas('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDatas('AFCM.AG.YT.REASON', setReason, $apiUrl);// 原因
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
        
    },[])

    // 费用大类和费用小类联动
    const selectChangeBtn = () =>{
        costKey.map((v,i)=>{
        if(queryForm.getFieldsValue().feeClass==v.feeCode){
            let list=v.listAgTypeToClass
                list.map((v,i)=>{
                    v['value']=v.feeCode
                    v['label']=v.feeName+'(' + v.feeCode +')';
                })
                if(v.listAgTypeToClass.length==list.length){
                    setSubclass('')
                    setSubclass(list)
                }
            }
        })
    }

    //localcharge表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvd',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataIndex: 'activityDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrency',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_CALC_FLAG',
            
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种 
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'YG_SIDE',
            
        },
        {
            title: <FormattedMessage id="lbl.Whether-it-actually-happens" />,//是否实际发生
            dataIndex: 'actFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.EXFLAG" />,//EX_FLAG
            dataIndex: 'exFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.cause" />,//原因
            dataType:reason.values,
            dataIndex: 'reason',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setTableData([]) 
        setSpinflag(false)
        if(!query.activeDate&&!query.svvd){
            // 业务日期/SVVD必须输入一项
            setBackFlag(false)
            Toast('', formatMessage({id: 'lbl.activityDate-svvd'}), 'alert-error', 5000, false)
        }else{
            setBackFlag(true)
            setSpinflag(true)
            const localsearch=await request($apiUrl.AG_FEE_OFFCR_SEARCH_MONITORAUTO,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params":{
                        'soCompanyCode': query.soCompanyCode,
                        "agencyCode":query.agencyCode,
                        'feeClass':  query.feeClass,
                        'feeType':  query.feeType,
                        'portCode':  query.portCode,
                        'svvd':  query.svvd,
                        'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                        'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                    },
                }
            })
            console.log(localsearch)
            if(localsearch.success){
                let data=localsearch.data
                let datas=data ? data.resultList : null
                setTabTotal(data.totalCount)
                datas ? setTableData([...datas]) : null
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
                setSpinflag(false)
            }else if(localsearch.errorMessage == formatMessage({id: 'lbl.activityDate-svvd'})){
                setBackFlag(false)
                setSpinflag(false)
            }else if(localsearch.errorMessage == formatMessage({id: 'lbl.activityDate-Interval-cannot-exceed'})){
                setBackFlag(false)
                setSpinflag(false)
            }else{
                setTableData([]) 
                setBackFlag(true)
                setSpinflag(false)
                Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
            }
        }
    }

    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
        setBackFlag(true)
        setTableData([])
        
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_OFFCR_EXP_MONITORAUTO,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                        "agencyCode":query.agencyCode,
                        'feeClass':  query.feeClass,
                        'feeType':  query.feeType,
                        'portCode':  query.portCode,
                        'svvd':  query.svvd,
                        'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                        'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        svvd: formatMessage({id:"lbl.SVVD" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        companyCode:formatMessage({id:"lbl.carrier" }),
                        activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        feeType: formatMessage({id:"lbl.ac.invoice.fee-type" }),
                        rateCurrency: formatMessage({id:"lbl.Agreement-currency" }),
                        totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                        actFlag: formatMessage({id:"lbl.Whether-it-actually-happens" }),
                        exFlag: formatMessage({id:"lbl.EXFLAG" }),
                        reason: formatMessage({id:"lbl.cause" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}),
                }]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.size<1){
            setSpinflag(false)
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.un-qry'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
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
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* <Select name='agencyCode' showSearch={true}  label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}/>
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true}  label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} selectChange={selectChangeBtn } />
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>}  span={6} options={subclass} />
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode'  label={<FormattedMessage id='lbl.port'/>} span={6}/>
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
                </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='lcrAgreementHeadUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
					rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol