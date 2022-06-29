import React, { useState,useEffect, $apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import {momentFormat, company, agencyCodeData, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal, Tabs} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import SelectVal from '@/components/Common/Select';
import DatePicker from '@/components/Common/DatePicker'
import Loading from '@/components/Common/Loading'
import moment from 'moment';
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    SearchOutlined,//日志
    CloudDownloadOutlined,//新增
    ReloadOutlined,
} from '@ant-design/icons'

const { TabPane } = Tabs;
const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
// -------------------------------------------------------查询计算结果--------------------------------------------------------------------
const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 公司
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
    
    const [tableData,setTableData] = useState([])//表格数据
    const [incomeTableData,setIncomeTableData] = useState([])//收入表格数据
    const [costTableData,setCostTableData] = useState([])//成本表格数据

    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [defaultKey, setDefaultKey] = useState('1');
    const [spinflag,setSpinflag] = useState(false)
    const [billBasicUuid,setBillBasicUuid] = useState([])
    
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();
    const [queryForms] = Form.useForm();
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

    const handleCancel = () =>{
		Toast('', '', '', 5000, false);
        setIsModalVisible(false)
        setIncomeTableData([])
        setCostTableData([])
        queryForms.resetFields();
    }
    //控制tab切换
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
        console.log(key)
    }

    //查询计算结果表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
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
            title: <FormattedMessage id="lbl.generated-time" />,//生成时间
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.income" />,//收入
            dataIndex: 'chargeTotalAmountInCny',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.cost" /> ,//成本
            dataIndex: 'vtmTotalAmountInCny',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.argue.ttlAmt" /> ,//总金额
            dataIndex: 'totalAmountInLocal',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.tax-rate" /> ,//税率
            dataIndex: 'vatPercent',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title:<FormattedMessage id="lbl.Tax-amount" /> ,//税额
            dataIndex: 'vatAmountInCny',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'right', 
        },
        {
            title: <FormattedMessage id="lbl.cost-office-code" />,//成本office code  
            dataIndex: 'vtmOfficeCodeDescription',
            sorter: false,
            key:'CHECK_FAD_STATUS',
            width: 80,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.cbs-company-code" />,//cbs company code
            dataIndex: 'cbsCompanyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        }
    ]
    //收入表格文本
    const incomecolumns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.Collection-office" />,//Collection Office
            dataIndex: 'collectionOfficeCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Charge-CODE" />,//Charge CODE
            dataIndex: 'chargeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.income" />,//收入
            dataIndex: 'chargeTotalAmountInCny',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100,
            
        }
    ]
    //成本表格文本
    const costcolumns=[
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.Match-Office" />,//Match Office
            dataIndex: 'officeCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
           
        },
        {
            title: <FormattedMessage id="lbl.VTM-CODE" />,//VTM CODE
            dataIndex: 'serviceTypeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title:<FormattedMessage id="lbl.cost" />,//成本
            dataIndex: 'vtmTotalAmountInCnyString',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100,
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
        // console.log(pagination)
        let query = queryForm.getFieldsValue()
        let localsearch= await request($apiUrl.COMM_EXTENSION_QUERYCR_EXTENSION_RESULT,{
            method:"POST",
            data:{
                "page": pagination,
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'billReferenceCode':query.billReferenceCode,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
            }
        })
        // console.log(localsearch)
        if(localsearch.success){
            let data=localsearch.data 
            let datas=data ? data.resultList : null
            datas?datas.map((v,i)=>{
                v['id'] = i
            }):null
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            console.log(pagination.pageSize!=page.pageSize)
            console.log('pagination',pagination)
            console.log('page',page)
            setPage({...pagination})
            datas ? setTableData([...datas]) : null
            setTabTotal(data.totalCount)
            setSpinflag(false)
        }else{
            setSpinflag(false)
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
        }
    }

     // 双击 明细数据
     const doubleClickRow = async(parameter) => {
        setIsModalVisible(true)
        setDefaultKey('1')
        console.log(isModalVisible)
        console.log(parameter)
        let localsearch= await request($apiUrl.COMM_EXTENSION_LOADCR_EXTENSION_RESULT,{
            method:"POST",
            data:{
                "params":parameter
            }
        })
        console.log(localsearch)
        if(localsearch.data){
            let data = localsearch.data
            let Incomedata = data.SAP_EXT_CHRG_DTL?data.SAP_EXT_CHRG_DTL.resultList:null//收入表格数据
            let Costdata = data.SAP_EXT_VTM_DTL?data.SAP_EXT_VTM_DTL.resultList:null//成本表格数据
            let headerdata = data.SAP_EXT_FEE_CALC_RESULT?data.SAP_EXT_FEE_CALC_RESULT.resultList:null//头部信息
            Incomedata?Incomedata.map((v,i)=>{
                v['id'] = i
            }):null
            Costdata?Costdata.map((v,i)=>{
                v['id'] = i
                let vt= v.vtmTotalAmountInCny + ''
                console.log(vt.indexOf('.'))
                if(vt.indexOf('.')!= '-1'){
                    let vtmTotalAmountInCny = vt.indexOf('.')
                    v['vtmTotalAmountInCnyString'] = vt.substring(0,vtmTotalAmountInCny)
                }else{
                    v['vtmTotalAmountInCnyString'] = v.vtmTotalAmountInCny
                }
            }):null
            Incomedata?setIncomeTableData([...Incomedata]):null
            Costdata?setCostTableData([...Costdata]):null
            setBillBasicUuid(parameter.billReferenceCode)
            headerdata?headerdata.map((v,i)=>{
                queryForms.setFieldsValue({
                    'billReferenceCode':v.billReferenceCode,
                    'companyCode':v.companyCode,
                    'activityDate':moment(v.activityDate),
                    'recordUpdateDatetime':moment(v.recordUpdateDatetime),
                    'officeCode':v.officeCode,
                    'chargeTotalAmountInCny':v.chargeTotalAmountInCny,
                    'vtmTotalAmountInCny':v.vtmTotalAmountInCny,
                    'totalAmountInLocal':v.totalAmountInLocal,
                })
          }):null
          
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
        page.current=1
        setTableData([])
    }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.COMM_EXTENSION_EXP_EXTENSION_RESULT,{
            method:"POST",
            data:{
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'billReferenceCode':query.billReferenceCode,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.comm.ext-stl.qry-cal-rst'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            billReferenceCode: formatMessage({id:"lbl.bill-of-lading-number" }),
                            officeCode: formatMessage({id:"lbl.office-code" }),
                            activityDate: formatMessage({id:"lbl.argue.biz-date" }),
                            recordUpdateDatetime: formatMessage({id:"lbl.generated-time" }),
                            chargeTotalAmountInCny: formatMessage({id:"lbl.income" }),
                            vtmTotalAmountInCny: formatMessage({id:"lbl.cost" }),
                            totalAmountInLocal: formatMessage({id:"lbl.argue.ttlAmt" }),
                            vatPercent: formatMessage({id:"lbl.tax-rate" }),
                            vatAmountInCny: formatMessage({id:"lbl.Tax-amount" }),
                            vtmOfficeCodeDescription: formatMessage({id:"lbl.cost-office-code" }),
                            cbsCompanyCode: formatMessage({id:"lbl.cbs-company-code" }),
                        },
                        sumCol: {//汇总字段
                        
                        },
                    'sheetName':formatMessage({id:'menu.afcm.comm.ext-stl.qry-cal-rst'}),
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
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.comm.ext-stl.qry-cal-rst'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.comm.ext-stl.qry-cal-rst'}) + '.xlsx'; // 下载后文件名
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
                        <DoubleDatePicker name='activeDate' span={6} disabled={[false, false]} label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' span={6} label={<FormattedMessage id='lbl.bill-of-lading-number'/>} />
                    </Row>
                </Form> 
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
                     <Button onClick={()=>{pageChange(page,'','search')}} > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    handleDoubleClickRow={doubleClickRow}
                    rowSelection={null}
                    selectWithClickRow={true}
                />
            </div>
            <CosModal cbsTitle={billBasicUuid+formatMessage({id:'lbl.The-details-of'})} cbsVisible={isModalVisible} cbsFun={handleCancel} cbsWidth='50%'>
                <div style={{minWidth:'500px'}}>
                   <Form 
                    form={queryForms}
                    name='func'
                    onFinish={handleQuery} 
                >
                    <Row>
                        {/* 提单号码 */}
                        <InputText  isSpan={true} name='billReferenceCode' disabled={true} label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={8}/>
                        {/* 公司代码 */}
                        <InputText isSpan={true}  name='companyCode' disabled={true} label={<FormattedMessage id='lbl.company-code'/>} span={8}/>
                        {/* 业务时间 */}
                        <DatePicker isSpan={true}  name='activityDate' disabled={true} label={<FormattedMessage id='lbl.argue.biz-date'/>} span={8}/>
                        {/* 生成时间 */}
                        <DatePicker isSpan={true}  isSpan={true}  name='recordUpdateDatetime' disabled={true} label={<FormattedMessage id='lbl.generated-time'/>} span={8}/>
                        {/* office */}
                        <InputText isSpan={true}  name='officeCode' disabled={true} label={<FormattedMessage id='lbl.office'/>} span={8}/>
                        {/* 收入 */}
                        <InputText  isSpan={true} name='chargeTotalAmountInCny' disabled={true} label={<FormattedMessage id='lbl.income'/>} span={8}/>
                        {/* 成本 */}
                        <InputText  isSpan={true} name='vtmTotalAmountInCny' disabled={true} label={<FormattedMessage id='lbl.cost'/>} span={8}/>
                        {/* 总金额 */}
                        <InputText isSpan={true}  name='totalAmountInLocal' disabled={true} label={<FormattedMessage id='lbl.argue.ttlAmt'/>} span={8}/>
                    </Row>
                </Form> 
                </div>
                
                <div className='footer-table'> 
                    <Tabs type="card" onChange={callback}>
                        {/* 收入 */}
                        <TabPane tab={<FormattedMessage id='lbl.income' />} key="1">
                            <PaginationTable
                                dataSource={incomeTableData}
                                columns={incomecolumns}
                                rowKey='id'
                                pageChange={pageChange}
                                rowSelection={null}
                                pagination={false}
                            />
                        </TabPane>
                        {/* 成本 */}
                        <TabPane tab={<FormattedMessage id='lbl.cost' />} key="2">
                            <PaginationTable
                                dataSource={costTableData}
                                columns={costcolumns}
                                rowKey='id'
                                pageChange={pageChange}
                                rowSelection={null}
                                pagination={false}
                            />
                        </TabPane>
                    </Tabs>
                </div>  
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;