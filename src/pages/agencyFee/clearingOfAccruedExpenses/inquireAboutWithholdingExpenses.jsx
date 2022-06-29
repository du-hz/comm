import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas,agencyCodeData, acquireSelectDataExtend, momentFormat, formatCurrencyNew, costCategories} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    CloseCircleOutlined,//删除
} from '@ant-design/icons'
//---------------------------------------------- 预提费用清理查询-------------------------------------------------
const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData,setTableData] = useState([])//表格数据
    const [sumData,setSumData] = useState([])//汇总数据
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [clearingFlag, setClearingFlag] = useState({}); // 清理状态
    const [activeDateFlag,setActiveDateFlag] = useState(true);//业务日期的背景颜色
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [costKey, setCostKey] = useState([]);    // 费用大类
    const [subclassAll,setSubclassAll] = useState ([])//全部费用小类
    const [clearingFlagRow,setClearingFlagRow] = useState(true)//删除是否禁用
    const [detelData,setDetelData] = useState([])
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
        costCategories(costKey,setCostKey,$apiUrl)//费用大类
        acquireSelectDatas('AFCM.AG.YTCLEAR.CLEARFLAG', setClearingFlag, $apiUrl);// 清理状态
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
    },[])

    useEffect(()=>{
        com()
    },[costKey])
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
    
    //预提费用清理查询表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'postingMonth',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.The-agent" />,//代理号
            dataIndex: 'agencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvdId',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'totalAmount',
            sorter: false, 
            width: 120,
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
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        // {
        //     title: <FormattedMessage id="lbl.Amount-in-base-currency"/>,//本位币金额
        //     dataType: 'dataAmount',
        //     dataIndex: 'currencyTotalAmt',
        //     sorter: false,
        //     width: 120,
        //     align:'left',
        //     key:'YG_SIDE'
        // },
        {
            title: <FormattedMessage id="lbl.Clean-up-the-state"/>,//清理状态
            dataType:clearingFlag.values,
            dataIndex: 'clearingFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Headquarters-operator" />,//总部操作人员 
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.Operation-date"/>,//操作日期
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        }
    ]
    

    const columnss=[
        {
            title: <FormattedMessage id="lbl.The-agent" />,//代理号
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'postingMonth',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.amount" />,//金额
            dataIndex: 'totalAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataIndex: 'standTotalAmount',
            sorter: false,
            align:'right',
            width: 120,
            key:'COMPANY_CDE',
        }
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        setTableData([])
        setChecked([])
        setSumData([])
        console.log(page)
        if(!query.activeDate){
            //业务日期不能为空
            setActiveDateFlag(false)
            Toast('', formatMessage({id: 'lbl.activeDate-can-not-be-empty'}), 'alert-error', 5000, false)
        }else{
            setActiveDateFlag(true)
            if(!query.agencyCode&&!query.portCode){
                // 代理编号/港口不能为空
                setBackFlag(false)
                Toast('', formatMessage({id: 'lbl.agencyCode-portCode-not-empty'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_YTCLEAR_SEARCH_YT_LIST,{
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
                            'clearingFlag':query.clearingFlag,
                            'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data=localsearch.data
                    if(data){
                        let datas= data.resultList
                        let sumList = data.sumList
                        sumList ? sumList.map((v,i)=>{
                            v['id'] = i
                        }) : null
                        setSelectedRowKeys([...datas])
                        setTabTotal(data.totalCount)
                        datas ? setTableData([...datas]) : null
                        sumList ? setSumData([...sumList]) : null
                        if(pagination.pageSize!=page.pageSize){
                            pagination.current=1
                        }
                        setPage({...pagination})
                        setSpinflag(false)
                    }
                }else{
                    setSpinflag(false)
                    setTableData([])
                    setSumData([])
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                }
            }    
        } 
    }
    //选中
    const setSelectedRowss = (val) =>{
        console.log(val)
        setClearingFlagRow(false)
        val.map((v,i)=>{
            setDetelData([...val])
            if(v.clearingFlag=='Y'){
                setClearingFlagRow(true)
            }
        })
         
    }

    //删除   清理状态 clearingFlag为N是才能使用
    const detel = async()=>{
        Toast('', '', '', 5000, false);
        
        if(detelData.length>0){
            setSpinflag(true)
            let del = await request($apiUrl.AG_FEE_YTCLEAR_DELETEYT,{
                method:"POST",
                data:{
                    'paramsList':[
                        ...detelData
                    ]
                }
            })
            console.log(del)
            if(del.success){
                setSpinflag(false)
                if(tableData.length>1){
                    setDetelData([])
                    setChecked([])
                    setCheckedRow([])
                    pageChange(page)
                    Toast('',del.message, '', 5000, false)
                }else{
                    setChecked([])
                    setCheckedRow([])
                    setSumData([])
                    setTableData([])
                    Toast('',del.message, '', 5000, false)
                }
                
            }else{
                setSpinflag(false)
            }
        }else{
            setSpinflag(false)
             //请选择需要生成的记录!
             Toast('', formatMessage({id: 'lbl.Select-data'}), 'alert-error', 5000, false)
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
        setClearingFlagRow(true)
        setSumData([])
        setTableData([])
        setChecked([])
        setSumData([])
        setBackFlag(true)
        setActiveDateFlag(true)
        setDetelData([])
    }
     //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_YTCLEAR_EXP_UNLOCK_LIST,{
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
                    'clearingFlag':query.clearingFlag,
                    'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.cla-acc-exp.inq-bout-with-exp'}),
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
                        svvdId: formatMessage({id:"lbl.SVVD" }),
                        clearingFlag: formatMessage({id:"lbl.Clean-up-the-state" }),
                        recordUpdateUser: formatMessage({id:"lbl.Headquarters-operator" }),
                        recordUpdateDate: formatMessage({id:"lbl.Operation-date" }),
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
                'sheetName':formatMessage({id:'menu.afcm.agfee-stl.cla-acc-exp.inq-bout-with-exp'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.cla-acc-exp.inq-bout-with-exp'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.cla-acc-exp.inq-bout-with-exp'})+ '.xlsx'; // 下载后文件名
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
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 费用大类 */}
                        <Select name='feeClass' flag={true} label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6} options={costKey}/>  
                        {/* 港口 */}
                        <InputText name='portCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6} />  
                        {/* SVVD */}
                        <InputText name='svvd' label={<FormattedMessage id='lbl.SVVD'/>} span={6}/>  
                        {/* 清理状态 */}
                        <Select flag={true} name='clearingFlag' label={<FormattedMessage id='lbl.Clean-up-the-state'/>} span={6} options={clearingFlag.values}/> 
                        {/* 业务时间 */}
                        <DoubleDatePicker span={6} picker="month" style={{background:activeDateFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 删除按钮 */}
                    <CosButton onClick={()=> detel()} disabled={clearingFlagRow} auth='AFCM-AG-YT-002-B01' ><CloseCircleOutlined style={{color:'red'}}/><FormattedMessage id='lbl.delete'/></CosButton>
                    {/* 下载 */}
                    <Button onClick={()=>downlod()} disabled={tableData.length>0?false:true}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
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
                    rowKey='uuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    selectedRowKeys = {selectedRowKeys}
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
                    dataSource={sumData}
                    columns={columnss}
                    rowKey='id'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    pagination={false}
                    rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol