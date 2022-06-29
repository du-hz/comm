import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import { momentFormat, acquireSelectData, JointDebugging, agencyCodeData, acquireSelectDataExtend} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal,Tabs} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//日志
    CloudDownloadOutlined,//下载
    ReloadOutlined,
} from '@ant-design/icons'

// ------------------------------------------------未报账查询-------------------------------------------------------
const { TabPane } = Tabs;

const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 公司
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [spinflag,setSpinflag] = useState(false)
    const [agencyFlag,setAgencyFlag] = useState(true);//代理编码的背景颜色
    const [reason, setReason] = useState({});    // 原因
    const [commissionMode, setCommissionMode] = useState([]);    // 佣金模式
    const [tabTotal,setTabTotal] = useState([]);//表格数据的个数
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
   
    const [tableData,setTableData] = useState([])//表格数据
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    
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
        acquireSelectData('REPORT.REASON.AUTO',setReason,$apiUrl);//原因
        com()
    }, [])

    //佣金类型
    const com = async()=>{
       await request.post($apiUrl.COMMON_SEARCH_COMM_TYPE)
        .then((resul) => {
            if(resul.success){
                // console.log(resul)
                let data = resul.data;
                data.map((v,i)=>{
                    v['values']=v.value
                    v['labels']=v.label
                    v.value=v.values
                    v.label=v.labels
                })
                // console.log(data)
                setCommissionMode(data);
            }
        })
    }

    //未报账单表格文本
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
            title:<FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataIndex: 'activityDate',
            key:'COMPANY_CDE',
            sorter: false,
            align:'left',
            width: 100
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
            title: <FormattedMessage id="lbl.The-Commission" />,//佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            sorter: false,
            key:'AGMT_STATUS',
            width:80,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Short-haul-cargo-mark" /> ,//短程货标志
            dataIndex: 'shortDistanceIndicator',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.BIZ-SVVD" /> ,//BIZ_SVVD
            dataIndex: 'businessSvvdId',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.biz-port" /> ,//BIZ港口
            dataIndex: 'businessPortCode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Agreement-currency" /> ,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额  
            dataIndex: 'totalAmount',
            sorter: false,
            key:'CHECK_FAD_STATUS',
            width:80,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Whether-it-actually-happens-comm" />,//是否实际发生
            dataIndex: 'actualFlag',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.FE-FLAG" />,//FE_FLAG
            dataIndex: 'excludeFlag',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.cause" />,//原因
            dataType:reason.values,
            dataIndex: 'reason',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
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
        let query = queryForm.getFieldsValue()
        search?pagination.current=1:null
        setAgencyFlag(true)
        setTableData([])
        if(!query.agencyCode){
            setAgencyFlag(false)
            //代理编码必须输入
            Toast('', formatMessage({id: 'lbl.The-proxy-code-must-be-entered'}), 'alert-error', 5000, false)
        }else{
            if(!query.activeDate&&!query.Svvd&&!query.billReferenceCode){
                setBackFlag(false)
                //业务日期/提单号 不能同时为空
                Toast('',formatMessage({id: 'lbl.activeDate-billReferenceCode'}), 'alert-error', 5000, false)
            }else{
                setSpinflag(true)
                setBackFlag(true)
                let localsearch=await request($apiUrl.COMM_CROSSBOOKING_QUERY_OFFLINE_LCR,{
                    method:'POST',
                    data:{
                        "page": pagination,
                        "params":{
                            'shipownerCompanyCode': query.shipownerCompanyCode,
                            'agencyCode':query.agencyCode,
                            'commissionType':query.commissionType,
                            'billReferenceCode':query.billReferenceCode,
                            'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                            'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                        },
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    setSpinflag(false)
                    let data=localsearch.data ? localsearch.data.resultList : null
                    // let datas=localsearch.data.resultList
                    data ? data.map((v,i)=>{
                        v['id'] = i
                    }) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    setTabTotal(localsearch.data.totalCount)
                    data ? setTableData([...data]) : null
                    // setTabTotal(data.totalCount)
                }else{
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
                }
            }
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
        setBackFlag(true)
        setAgencyFlag(true)
    }

     //下载
     const downlod = async () =>{
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.COMM_CROSSBOOKING_EXP_OFFLINE_LCR,{
            method:"POST",
            data:{
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'commissionType':query.commissionType,
                    'billReferenceCode':query.billReferenceCode,
                    'activeDateFrom':query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':query.activeDate?momentFormat(query.activeDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            activityDate: formatMessage({id:"lbl.argue.biz-date" }),
                            billReferenceCode: formatMessage({id:"lbl.bill-of-lading-number" }),
                            commissionMode: formatMessage({id:"lbl.The-Commission" }),
                            commissionType: formatMessage({id:"lbl.Commission-type" }),
                            cargoTradeLaneCode: formatMessage({id:"lbl.Trade-line" }),
                            shortDistanceIndicator: formatMessage({id:"lbl.Short-haul-cargo-mark" }),
                            businessSvvdId: formatMessage({id:"lbl.BIZ-SVVD" }),
                            businessPortCode: formatMessage({id:"lbl.biz-port" }),
                            rateCurrencyCode: formatMessage({id:"lbl.Agreement-currency" }),
                            totalAmount: formatMessage({id:"lbl.Agreement-currency-amount" }),
                            clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                            totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                            actualFlag: formatMessage({id:"lbl.Whether-it-actually-happens" }),
                            excludeFlag: formatMessage({id:"lbl.FE-FLAG" }),
                            reason: formatMessage({id:"lbl.cause" }),
                        },
                        sumCol: {//汇总字段
                        
                        },
                    'sheetName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}),
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.un-qry'}) + '.xlsx'; // 下载后文件名
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
                        <SelectVal disabled={company.companyType == 0 ? true : false} span={6} name='shipownerCompanyCode'  label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' styleFlag={agencyFlag} label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true} name='agencyCode' options={agencyCode} style={{background: agencyFlag ? "white" : "yellow"}}  label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 佣金类型 */}
                        <SelectVal name='commissionType' flag={true} label={<FormattedMessage id='lbl.Commission-type'/>} span={6} options={commissionMode}/>
                        {/* 业务日期 */}
                        <DoubleDatePicker span={6} style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='activeDate'  label={<FormattedMessage id='lbl.argue.bizDate'/>}   />
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6}/>
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <Button onClick={downlod} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                     <Button onClick={()=>{pageChange(page,'','search')} } > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'>
            <Tabs type="card">
                    {/* 明细信息 */}
                    <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="1">
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
                    </TabPane>
                </Tabs>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;