import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, acquireSelectDataExtend, agencyCodeData, costCategories, momentFormat, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import { createFromIconfontCN } from '@ant-design/icons';
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    MailOutlined,//邮件发送
} from '@ant-design/icons'
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_dkztm8notr4.js', // 在 iconfont.cn 上生成
  });



//---------------------------------------------- 报账单明细查询-------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([])
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData,setTableData] = useState([])//
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [verifyStatus,setVerifyStatus] = useState({})//审核状态
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
        acquireSelectDatas('AG.OFFCR.VERIFYSTATUS',setVerifyStatus,$apiUrl)//审核状态
        acquireSelectDatas('AG.ADJUSTFLAG', setProtocolStateData, $apiUrl);// 协议状态
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
    },[])

   
    //localcharge表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'sfListCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataType:verifyStatus.values,
            dataIndex: 'verifyStatus',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Manual-adjustment-or-not" />,//是否手工调整
            dataIndex: 'adjustFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.version-number" />,//版本号
            dataIndex: 'versionNumber',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Fee-amount" />,//费用金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'PRD_IND',
            
        },
        {
            title: <FormattedMessage id="lbl.Fee-amount-calculation" />,//费用金额(计算)
            dataType: 'dataAmount',
            dataIndex: 'totalAmountManual',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_CALC_FLAG',
            
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种 
            dataIndex: 'currency',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//更新日期
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.audit-date" />,//审核日期
            dataType: 'dateTime',
            dataIndex: 'checkDate',
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
        if(!query.buildDate&&!query.checkDate&&!query.sfListCode){
            // 报账单号/VVD/港口/确认日期/生成日期  至少输入一项
            setBackFlag(false)
            Toast('', formatMessage({id: 'lbl.sfList-date-must-enter'}), 'alert-error', 5000, false)
        }else{
            // let dates = query.buildDate? Math.abs((query.buildDate[0] - query.buildDate[1]))/(1000*60*60*24) : null
            // if(dates>92){
            //     setBackFlag(false)
            //     Toast('',formatMessage({id: 'lbl.generateDate-Interval-cannot-exceed'}), 'alert-error', 5000, false)
            // }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_OFFCR_SEARCH_BILL_DTL,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'soCompanyCode': query.soCompanyCode,
                            "agencyCode":query.agencyCode,
                            'feeClass':  query.feeClass,
                            'sfListCode':  query.sfListCode,
                            'adjustFlag':  query.adjustFlag,
                            'verifyStatus':  query.verifyStatus,
                            'currencyCode':  query.currencyCode,
                            'checkDateFrom':  query.checkDate?momentFormat(query.checkDate[0]):null,
                            'checkDateTo':  query.checkDate?momentFormat(query.checkDate[1]):null,
                            'buildDateFrom':  query.buildDate?momentFormat(query.buildDate[0]):null,
                            'buildDateTo':  query.buildDate?momentFormat(query.buildDate[1]):null,
                            "isManu":"N",//这个写死就行了
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
                }else{
                    setTableData([])
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                }
        //     }
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
        const query = queryForm.getFieldsValue()
        let tddata = {}
        columns.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        // let somData = {}
        // columnss.map((v, i) => {
        //     somData[v.dataIndex] = formatMessage({id: v.title.props.id})
        // })
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_OFFCR_EXP_BILL_DTL,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode":query.agencyCode,
                    'feeClass':  query.feeClass,
                    'sfListCode':  query.sfListCode,
                    'adjustFlag':  query.adjustFlag,
                    'verifyStatus':  query.verifyStatus,
                    'currencyCode':  query.currencyCode,
                    'checkDateFrom':  query.checkDate?momentFormat(query.checkDate[0]):null,
                    'checkDateTo':  query.checkDate?momentFormat(query.checkDate[1]):null,
                    'buildDateFrom':  query.buildDate?momentFormat(query.buildDate[0]):null,
                    'buildDateTo':  query.buildDate?momentFormat(query.buildDate[1]):null,
                    "isManu":"N",//这个写死就行了
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}),
                sheetList: [{//sheetList列表
                    dataCol: tddata,
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}) + '.xlsx'; // 下载后文件名
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
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>}  span={6} options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} />
                        {/* 报账单号码 */}
                        <InputText name='sfListCode' styleFlag={backFlag} flag={true} label={<FormattedMessage id='lbl.Reimbursement-number'/>}  span={6}/>
                        {/* 审核日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='checkDate' label={<FormattedMessage id='lbl.audit-date'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 新增/调整标志 */}
                        <Select name='adjustFlag' flag={true} label={<FormattedMessage id='lbl.New-adjustment-mark'/>} span={6} options={protocolStateData.values} />   
                        {/* 审核状态 */}
                        <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.audit-status'/>} span={6} options={verifyStatus.values}/>  
                        {/* 币种 */}
                        <InputText name='currencyCode'  label={<FormattedMessage id='lbl.ccy'/>} span={6}/>  
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                    {/* 邮件发送 */}
                    <Button><MyIcon type="icon-email-success"/> <FormattedMessage id='lbl.mailing'/></Button>
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