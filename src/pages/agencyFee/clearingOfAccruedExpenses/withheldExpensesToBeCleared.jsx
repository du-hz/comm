import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, agencyCodeData, costCategories, acquireSelectDataExtend, momentFormat, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tabs,Modal} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SaveOutlined,//保存
} from '@ant-design/icons'

//---------------------------------------------- 待清理预提费用-------------------------------------------------
const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//
    const [tableDatas,setTableDatas] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [subclass,setSubclass] = useState([]);    // 费用类型
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [billingData,setBillingData] = useState([])//保存的数据
    const [spinflag,setSpinflag] = useState(false)
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
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
            ...query
        })
        console.log(query)
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
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        
    },[])

    useEffect(()=>{
        com()
        console.log(company)
    },[agencyCode,costKey,company])

    // 费用大类和费用小类联动
    const selectChangeBtn = () =>{
        queryForm.setFieldsValue({
            'feeType':''
        })
        costKey.map((v,i)=>{
            if(!queryForm.getFieldsValue().feeClass){
                setSubclass([])
            }else{
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
            }
        
        })
    }
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

    //待清理预提费用表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            align:'left',
            width:120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width:120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'postingMonth',
            sorter: false,
            align:'left',
            width:120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.The-agent" />,//代理号
            dataIndex: 'agencyCode',
            sorter: false,
            width:120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width:120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: false,
            align:'left',
            width:120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width:120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currencyCode',
            sorter: false,
            width:120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'amount',
            sorter: false,
            width:120,
            align:'right',
            key:'POST_CALC_FLAG',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
        },
        {
            title: <FormattedMessage id="lbl.standard-money" />,//本位币 
            dataIndex: 'standCurrencyCode',
            sorter: false,
            width:120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency"/>,//本位币金额
            dataIndex: 'currencyAmount',
            sorter: false,
            width:120,
            align:'right',
            key:'YG_SIDE',
            render:(text,record)=>{
                return text?formatCurrencyNew(text):(text==0?formatCurrencyNew(text):text) ; 
            }
        }
    ]
    

    const columnss=[
        {
            title: <FormattedMessage id="lbl.The-agent" />,//代理号
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width:120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width:120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'postingMonth',
            sorter: false,
            align:'left',
            width:120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width:120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currencyCode',
            sorter: false,
            width:120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'totalAmount',
            sorter: false,
            align:'right',
            width:120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataIndex: 'standTotalAmount',
            sorter: false,
            align:'right',
            width:120,
            key:'COMPANY_CDE'
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setTableData([])
        setChecked([])
        setTableDatas([])
        if(!query.agencyCode){
            setAgencyFlag(false)
            //代理编码必须输入
            Toast('', formatMessage({id: 'lbl.The-proxy-code-must-be-entered'}), 'alert-error', 5000, false)
        }else{
            setAgencyFlag(true)
            if(!query.activeDate&&!query.svvd&&!query.portCode){
                //业务日期/SVVD/港口必须输入一项
                setBackFlag(false)
                Toast('', formatMessage({id: 'lbl.activeDate-svvd-portCode'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_YTCLEAR_SEARCH_WYT_LIST,{
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
                            'activeDateFrom':  query.activeDate ? momentFormat(query.activeDate[0]) : null,
                            'activeDateTo':  query.activeDate ? momentFormat(query.activeDate[1]) : null,
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    setSpinflag(false)
                    let data=localsearch.data
                    let datas=data ? data.resultList : null
                    let datass=data ? data.sumList : null
                    datass ? datass.map((v,i)=>{
                        v['id'] = i
                    }) : null
                    datas ? datas.map((v,i)=>{
                        v['id'] = i 
                    }) : null
                    setTabTotal(data.totalCount)
                    datas ? setSelectedRowKeys([...datas]):null
                    datas ? setTableData([...datas]) : null
                    datass ? setTableDatas([...datass]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                }else{
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                    setSpinflag(false)
                    setTableData([])
                    setTableDatas([])
                }
            }
        }
    }
    const setSelectedRowss = (val) =>{
        setBillingData([...val])
        console.log(val)
    }

    //保存
    const Save = async () =>{
        Toast('','', '', 5000, false)
        if(billingData.length>0){
            const confirmModal = confirm({
                title: formatMessage({id:'lbl.save-all'}),
                content: formatMessage({id: 'lbl.afcm-0099'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true)
                    let save = await request($apiUrl.AG_FEE_YTCLEAR_SAVE_SELECT,{
                        method:"POST",
                        data:{
                            paramsList:[...billingData]
                        }
                    })
                    console.log(save)
                    if(save.success){
                        setSpinflag(false)
                        if(tableData.length>1){
                            pageChange(page)
                            Toast('',save.message, '', 5000, false)
                            setChecked([])
                            setCheckedRow([])
                        }else{
                            Toast('',save.message, '', 5000, false)
                            setChecked([])
                            setCheckedRow([])
                            setTableData([])
                        }
                    }else{
                        setSpinflag(false)
                    }
                }
            })
        }else{
            //请选择需要生成的记录!
            Toast('', formatMessage({id: 'lbl.Select-data'}), 'alert-error', 5000, false)
        }
       
    }

    //保存全部
    const SaveAll = () =>{
        Toast('','', '', 5000, false)
        if(tableData<1){
            Toast('', formatMessage({id: 'lbl.Generate-info'}), 'alert-error', 5000, false);
        }else{
            
            let query = queryForm.getFieldsValue()
            const confirmModal = confirm({
                title: formatMessage({id:'lbl.save-all'}),
                content: formatMessage({id: 'lbl.afcm-0098'}),
                okText: formatMessage({id: 'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true)
                    let save = await request($apiUrl.AG_FEE_YTCLEAR_SAVE_ALL,{
                        method:"POST",
                        data:{
                            "page":{
                                current: 0,
                                pageSize: 0
                            },
                            "params":{
                                'soCompanyCode':query.soCompanyCode,
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
                    console.log(save)
                    if(save.success){
                        setSpinflag(false)
                        if(tableData.length>1){
                            pageChange(page)
                            Toast('',save.message, '', 5000, false)
                            setCheckedRow([])
                        }else{
                            Toast('',save.message, '', 5000, false)
                            setCheckedRow([])
                            setTableData([])
                            setTableDatas([])
                        }
                        
                    } else{
                        setSpinflag(false)
                    }
                }
            })
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
       setChecked([])
       setTableDatas([])
       setBackFlag(true)
       setAgencyFlag(true)
       setBillingData([])
    }
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_YTCLEAR_EXP_WYT_LIST,{
            method:"POST",
            data:{
                'page':{
                    current: 0,
                    pageSize: 0
                },
                "params":{
                    'soCompanyCode': query.soCompanyCode,
                    "agencyCode":query.agencyCode,
                    'feeClass':  query.feeClass,
                    'feeType':  query.feeType,
                    'portCode':  query.portCode,
                    'svvd':  query.svvd,
                    'activeDateFrom':  query.activeDate ? momentFormat(query.activeDate[0]) : null,
                    'activeDateTo':  query.activeDate ? momentFormat(query.activeDate[1]) : null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.cla-acc-exp.wit-exp-cle'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        companyCode: formatMessage({id:"lbl.company" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        postingMonth: formatMessage({id:"lbl.argue.biz-date" }),
                        agencyCode: formatMessage({id:"lbl.The-agent" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        feeType: formatMessage({id:"lbl.Small-class-fee" }),
                        svvdId: formatMessage({id:"lbl.SVVD" }),
                        currencyCode: formatMessage({id:"lbl.ccy" }),
                        totalAmount: formatMessage({id:"lbl.amount" }),
                        standCurrencyCode: formatMessage({id:"lbl.standard-money" }),
                        currencyAmount: formatMessage({id:"lbl.Amount-in-base-currency" }),
                    },
                    sumCol: {//汇总字段
                        agencyCode: formatMessage({id:"lbl.The-agent" }),
                        portCode: formatMessage({id:"lbl.port" }),
                        postingMonth: formatMessage({id:"lbl.argue.biz-date" }),
                        feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                        currencyCode: formatMessage({id:"lbl.ccy" }),
                        totalAmount: formatMessage({id:"lbl.amount" }),
                        standTotalAmount: formatMessage({id:"lbl.Amount-in-base-currency" }),

                    },
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.cla-acc-exp.wit-exp-cle'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.cla-acc-exp.wit-exp-cle'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.cla-acc-exp.wit-exp-cle'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    
    return (
        <div className='parent-box'>
            <div className='header-from' style={{marginTop:'15px'}}>
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
                            company.companyType == 0 ? <InputText styleFlag={agencyFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: agencyFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey} selectChange={selectChangeBtn} />  
                        {/* 费用小类 */}
                        <Select name='feeType' flag={true} label={<FormattedMessage id='lbl.Small-class-fee'/>} span={6} options={subclass} />  
                        {/* SVVD */}
                        <InputText name='svvd' styleFlag={backFlag} label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                        {/* 业务时间 */}
                        <DoubleDatePicker picker="month"  span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate'  label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 港口 */}
                        <InputText name='portCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6}/> 
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 保存按钮 */}
                    <CosButton onClick={Save} auth='AFCM-AG-YT-001-B01' ><SaveOutlined/><FormattedMessage id='lbl.save'/></CosButton>
                    {/* 保存全部按钮 */}
                    <CosButton onClick={SaveAll} auth='AFCM-AG-YT-001-B01' ><SaveOutlined/><FormattedMessage id='lbl.save-all'/></CosButton>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={tableData.length>0?false:true}><CloudDownloadOutlined/><FormattedMessage id='lbl.download'/></Button>
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
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    // rowSelection={null}
                    selectedRowKeys={selectedRowKeys}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                            setSelectedRowss(row);
                        }
                    }}
                />
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableDatas}
                    columns={columnss}
                    rowKey='id'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    rowSelection={null}
                    pagination={false}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol