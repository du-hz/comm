
import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react';
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import { momentFormat, company, agencyCodeData, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import SelectVal from '@/components/Common/Select';
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { //日志
    CloudDownloadOutlined,
    ReloadOutlined, //查看详情
    SearchOutlined
} from '@ant-design/icons';

let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}

//===================================================== 操作费成本报表==========================================
const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 公司
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
   
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [spinflag,setSpinflag] = useState(false)
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    useEffect(() => {
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
    }, [])

    //操作成本报表表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            // sortDirections:[store],
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'billReferenceCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.office-code" />,//office code
            dataIndex: 'officeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100
        },
        {
            title: <FormattedMessage id="lbl.version-number-comm" />,//版本号
            dataIndex: 'versionNumber',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.VTM-CODE" />,//VTM CODE
            dataIndex: 'serviceTypeCode',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.amount" /> ,//金额
            dataIndex: 'vtmTotalAmountInCny',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.The-amount-of-adjustment" /> ,//调整金额
            dataIndex: 'reviseVtmTotalAmountInCny',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.generated-time" /> ,//生成时间
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left'
        }
    ]

    //初始化下拉框数据
    useEffect(()=>{
        queryForm.setFieldsValue({
            ...lastCondition,
        });
        
    },[])
    
    //表格数据
    const pageChange= async(pagination,options,search) =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        setTableData([])
        search?pagination.current=1:null
        let query = queryForm.getFieldsValue()
        let localsearch= await request($apiUrl.COMM_EXTENSION_QUERYCR_EXTENSION_VTM_REPORT,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'billReferenceCode':query.billReferenceCode,
                    'cmbVatFlag':query.cmbVatFlag,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data=localsearch.data 
            let datas=data ? data.resultList : null
            datas ? datas.map((v,i)=>{
                v['id'] = i
            }) : null
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
            datas ? setTableData([...datas]) : null
            setTabTotal(data.totalCount)
            setSpinflag(false)
        }else{
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
            setSpinflag(false)
        }
        
    }
    //重置
    const reset = () =>{
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        },[company, acquireData])
        setTableData([])
    }
     //下载
     const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        let query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.COMM_EXTENSION_EXP_EXTENSION_VTM_REPORT,{
            method:"POST",
            data:{
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'billReferenceCode':query.billReferenceCode,
                    'cmbVatFlag':query.cmbVatFlag,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.comm.ext-stl.ope-fee-cost-sta'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            billReferenceCode: formatMessage({id:"lbl.bill-of-lading-number" }),
                            officeCode: formatMessage({id:"lbl.office-code" }),
                            activityDate: formatMessage({id:"lbl.argue.biz-date" }),
                            versionNumber: formatMessage({id:"lbl.version-number" }),
                            serviceTypeCode: formatMessage({id:"lbl.VTM-CODE" }),
                            vtmTotalAmountInCny: formatMessage({id:"lbl.amount" }),
                            reviseVtmTotalAmountInCny: formatMessage({id:"lbl.The-amount-of-adjustment" }),
                            recordUpdateDatetime: formatMessage({id:"lbl.generated-time" }),
                        },
                        sumCol: {//汇总字段
                        
                        },
                    'sheetName':formatMessage({id:'menu.afcm.comm.ext-stl.ope-fee-cost-sta'}),
                },
            ]
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
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.comm.ext-stl.ope-fee-cost-sta'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.comm.ext-stl.ope-fee-cost-sta'}) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
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
                        <SelectVal disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='activeDate' label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6}/>
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <Button onClick={downlod}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                     <Button  onClick={()=>{pageChange(page,'','search')}} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                <div style={{width:'60%'}}>
                   <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={null}
                    // selectionType='radio'
                    // setSelectedRows={setSelectedRows}
                /> 
                </div>
                
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;