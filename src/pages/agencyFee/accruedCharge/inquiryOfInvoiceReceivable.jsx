import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, momentFormat, costCategories, agencyCodeData, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import InquireInvoicePayableDetails from './inquireInvoicePayableDetails'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- 查询应收发票-------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const inquiryOfInvoiceReceivable =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode,setAgencyCode] = useState([])
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [yfListUuid,setYfListUuid] = useState('')//uuid
    const [packageFlag,setPackageFlag] = useState({})//是否生成数据包
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);//新增编辑弹框开关
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "feeClass": null,
        "yfListCode": null,
        "packageFlag": null,
        "svvd":null,
        "portCode": null,
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
        })
    }, [company, acquireData])

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectDatas('AFCM.PACKAGE.FLAG',setPackageFlag,$apiUrl);//是否生成数据包
    },[])

    //全部费用小类
    const com = ()=>{
        let listAgTypeToClassall = costKey.map((v,i)=>{
            return v.listAgTypeToClass
        })
        let listAgTypeToClass = listAgTypeToClassall.reduce((pre,cur)=>{
            return pre.concat(cur)
        },[])
        console.log(listAgTypeToClass)
        listAgTypeToClass.map((v,i)=>{
            v['value']=v.feeCode
            v['label']=v.feeName+'(' + v.feeCode +')';
        })
        setSubclassAll(listAgTypeToClass)
        console.log(listAgTypeToClass)

    }
    
    

    //查询应收发票表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Invoice-number" />,//发票号码
            dataIndex: 'yfListCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.argue.invDate" />,//开票日期
            dataIndex: 'generateDate',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC',
            render:(text,record)=>{
                return text?text.slice(0,10):text
            }
        },
        {
            title: <FormattedMessage id="lbl.Personnel-of-make-out-an-invoice" />,//开票人员
            dataIndex: 'generateUser',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.generate-package" />,//是否生成数据包
            dataType:packageFlag.values,
            dataIndex: 'pkgFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Generating-packets" />,//生成数据包的批次
            dataIndex: 'pkgProcessId',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE',
            render:(text,record)=>{
                return text==null?text=0:text
            }
        }
    ]
    
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        com()
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setTableData([])
        if(!query.yfListCode&&!query.svvd&&!query.generateDate){
            // 发票号码/SVVD/生成时间必须输入一个且时间间隔不能超过92
            setBackFlag(false)
            Toast('', formatMessage({id: 'lbl.generateDate-svvd-yfListCode'}), 'alert-error', 5000, false)
        }else{
            let dates =query.generateDate ? Math.abs((query.generateDate[0] - query.generateDate[1]))/(1000*60*60*24) : null
            if(dates>92){
                setBackFlag(false)
                Toast('',formatMessage({id: 'lbl.generateDate-Interval-cannot-exceed'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_AR_SEARCH_AR_RECEIPT_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'soCompanyCode': query.soCompanyCode,
                            "agencyCode": query.agencyCode,
                            "feeClass": query.feeClass,
                            "yfListCode": query.yfListCode,
                            "packageFlag": query.packageFlag,
                            "svvd":query.svvd,
                            "portCode": query.portCode,
                            'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                            'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                            },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data=localsearch.data ? localsearch.data:''
                    let datas=localsearch.data ? localsearch.data.resultList : null
                    datas ? datas.map((v,i)=>{
                        v['id'] = i
                    }) : ''
                    setSpinflag(false)
                    setTabTotal(data.totalCount)
                    datas ? setTableData([...datas]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                }else{
                    setTableData([])
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
                }
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
        setTableData([])
        setBackFlag(true)
    }

     // 双击  列表
    const handleDoubleClickRow = (parameter) => {
        console.log(parameter)
        Toast('', '', '', 5000, false);
        // console.log(parameter.yfListUuid)
        let uuid = parameter.yfListUuid
        setYfListUuid(uuid)
        // pageChange(parameter.ygListUuid);
        setIsModalVisible(true)
        
    }
    const detail = {
        isModalVisible,
        yfListUuid,
        costKey,  //费用大类
        subclassAll, //费用小类
        setIsModalVisible,
        setYfListUuid
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_AR_EXP_AR_RECEIPT_LIST,{
            method:"POST",
            data:{
                'page':{
                    current: 0,
                    pageSize: 10
                },
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode": query.agencyCode,
                    "feeClass": query.feeClass,
                    "yfListCode": query.yfListCode,
                    "packageFlag": query.packageFlag,
                    "svvd":query.svvd,
                    "portCode": query.portCode,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.acc-chrg.inq-inv-rec'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        yfListCode:formatMessage({id:"lbl.Invoice-number" }),
                        generateDate:formatMessage({id:"lbl.argue.invDate" }),
                        generateUser:formatMessage({id:"lbl.Personnel-of-make-out-an-invoice" }),
                        pkgFlag:formatMessage({id:"lbl.generate-package" }),
                        pkgProcessId:formatMessage({id:"lbl.Generating-packets" }),

                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.acc-chrg.inq-inv-rec'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.inq-inv-rec'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.inq-inv-rec'}) + '.xlsx'; // 下载后文件名
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
                        {/* <Select name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>}  span={6} options={costKey} />
                        {/* 发票号码 */}
                        <InputText name='yfListCode' styleFlag={backFlag} flag={true} label={<FormattedMessage id='lbl.Invoice-number'/>}  span={6} />
                        {/* 是否生成数据包 */}
                        <Select name='packageFlag' flag={true} label={<FormattedMessage id='lbl.generate-package'/>} span={6} options={packageFlag.values}/>  
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>}   span={6}/>  
                        {/* 港口 */}
                        <InputText name='portCode'  label={<FormattedMessage id='lbl.port'/>}   span={6}/>  
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='generateDate'label={<FormattedMessage id='lbl.generation-date'/>}   />
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
                <div style={{width:'60%'}}>
                    <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
					rowSelection={null}
                    handleDoubleClickRow={handleDoubleClickRow}
                    selectWithClickRow={true}
                />
                </div>
                
            </div>
            <InquireInvoicePayableDetails detail={detail}/>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default inquiryOfInvoiceReceivable