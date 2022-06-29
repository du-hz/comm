import React, { useState,useEffect, $apiUrl,createContext ,useContext } from 'react'
import {FormattedMessage, formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import SelectVal from '@/components/Common/Select';
import { acquireSelectData,momentFormat, agencyCodeData, acquireSelectDataExtend, KeepDecimalPlace} from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal,Tabs} from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { createFromIconfontCN } from '@ant-design/icons';
import CosModal from '@/components/Common/CosModal'

import {
    SearchOutlined,//日志
    FileAddOutlined,//新增
    CloudDownloadOutlined,//下载
    ReloadOutlined,
} from '@ant-design/icons'
export const NumContext = createContext();

const confirm = Modal.confirm
const { TabPane } = Tabs;
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_dkztm8notr4.js', // 在 iconfont.cn 上生成
  });
//------------------------------------------------------ 报账单明细----------------------------------------------
const searchPreAgreementMailFeeAgmtList =()=> {
    const [agencyCode, setAgencyCode] = useState([]);   // 公司
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [checkStatus,setCheckStatus] = useState({});//审核状态
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [defaultKey, setDefaultKey] = useState('1');
    const [adjustFlag, setadjustFlag] = useState({});    // 新增/调整标志
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [tabTabTotals,setTabTotals ] = useState([])//
    const [spinflag,setSpinflag] = useState(false)
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner": null,
    });
    
    const [tableData,setTableData] = useState([])//表格数据
    const [tableDatas,setTableDatas] = useState([])//LocalCharge表格数据
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [verifyStatus,setVerifyStatus] = useState({})//状态
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
        acquireSelectData('COMM0001',setadjustFlag,$apiUrl);//新增/调整标志
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类 and 佣金小类
        acquireSelectData('AFCM.ER.VERIFY.RECEIPT.STATUS',setCheckStatus,$apiUrl)//审核状态
        acquireSelectData('AFCM.CR.VERIFY.STATUS',setVerifyStatus,$apiUrl)//状态
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
    }, [])

    //报账单明细表格文本
    const columns=[
        {
            title:<FormattedMessage id="lbl.bill-of-lading-number" />,//提单号码
            dataIndex: 'billReferenceCode',
            sorter: false,
            key:'COMPANY_NME_ABBR',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,
        },
        {
            title:<FormattedMessage id="lbl.The-amount-of-commission" />,//佣金金额
            dataType: 'dataAmount',
            dataIndex: 'commissionAmount',
            key:'COMPANY_CDE',
            sorter: false,
            align:'right',
            width: 100,
            
        },
        {
            title: <FormattedMessage id="lbl.Receipt-Code" />,//Receipt Code
            dataIndex: 'sfListCodeUpload',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
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
            title: <FormattedMessage id="lbl.Ccy" />,//Ccy
            dataIndex: 'currencyCode',
            sorter: false,
            key:'FM_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.commission-big-type" /> ,//佣金大类
            dataIndex: 'commissionClass',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.Adjust-statu" />,//Adjust statu
            dataIndex: 'adjustStatus',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.argue.ttlAmt" />,//总金额
            dataIndex: 'totalAmountManual',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            
        },
        {
            title:<FormattedMessage id="lbl.VVD" /> ,//VVD
            dataIndex: 'vvdIdSystem',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.port" /> ,//港口
            dataIndex: 'portCodeSystem',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.The-Commission" /> ,//佣金模式
            dataIndex: 'commissionMode',
            sorter: false,
            key:'TO_DTE',
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.The-withholding-lock-flag" />,//预提锁定标志  
            dataIndex: 'ytLockFlag',
            sorter: false,
            key:'CHECK_FAD_STATUS',
            width: 80,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Withholding-state" />,//预提状态
            dataIndex: 'ytStatusSystem',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.The-paid-lock-flag" />,//实付锁定标志
            dataIndex: 'sfLockFlag',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.status" />,//status
            dataType:checkStatus.values,
            dataIndex: 'verifyStatus',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Adjust-Flag" />,//Adjust Flag
            dataIndex: 'adjustFlag',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
    ]
    //LocalChange明细
    const columnss=[
        {
            title: <FormattedMessage id="lbl.Provisional-bill-number" />,//临时报账单号
            dataIndex: 'tmpSfListCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'COMM_AGMT_CDE',
            sorter: false,
            align:'left',
            width: 120,   
        },
        {
            title: <FormattedMessage id="lbl.bill-no" />,//提单号
            dataIndex: 'billReferenceCode',
            sorter: false,
            key:'AGMT_STATUS',
            width: 80,
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
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.chargeCode" />,//Charge code
            dataIndex: 'chargeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.act-flag" />,//Act flag
            dataIndex: 'actualFlag',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.versions" />,//版本
            dataIndex: 'versionNumber',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.Return-the-currency" />,//返还币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.refund" />,//返还金额
            // dataType: 'dataAmount',
            dataIndex: 'refund',
            sorter: false,
            key:'AGENCY_CDE',
            width: 120,
            align:'right',
            render: (text, record) => {
				return <div>
					{text ? KeepDecimalPlace(text) : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id="lbl.Refund-of-adjustment" />,//返还调整金额
            dataIndex: 'reviseAmount',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'right',
            render: (text, record) => {
				return <div>
					{text ? KeepDecimalPlace(text) : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id="lbl.return-the-proportion" />,//返还比例
            dataIndex: 'refundRate',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'right',
            render: (text, record) => {
				return <div>
					{text ? KeepDecimalPlace(text) : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataIndex: 'reviseAmountInClearing',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'right',
            
        },
        {
            title: <FormattedMessage id="lbl.Return-the-base" />,//返还基数
            dataIndex: 'commissionBase',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left',
            render: (text, record) => {
				return <div>
					{text ? KeepDecimalPlace(text) : text}
				</div>
			}
        },
        {
            title: <FormattedMessage id="lbl.office" />,//office
            dataIndex: 'officeCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.Record-update-time" />,//记录更新时间
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.Record-the-uploaded-lot" />,//记录上载批次
            dataIndex: 'recordLoadDate',
            sorter: false,
            key:'AGENCY_CDE',
            width: 150,
            align:'left',
            
        }

    ]

    //初始化下拉框数据
    useEffect(()=>{
        queryForm.setFieldsValue({
            ...lastCondition,
        });
        
    },[])
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
        console.log(key)
    }
    
    //报账单表格数据
    const pageChange= async(pagination,options,search) =>{
        Toast('', '', '', 5000, false);
        setTableData([])
        setTableDatas([])
        search?pagination.current=1:null
        let query = queryForm.getFieldsValue()
        // if(!query.crReceiptCode&&!query.billReferenceCode&&!query.vvd&&!query.checkDate&&!query.generateDate&&!query.portCode){
        //     setBackFlag(false)
        //     // 提单号码/VVD/港口/报账单号/生成日期/确认日期 至少输入一项
        //     Toast('',formatMessage({id: 'lbl.crReceipt-Date-must-enter'}), 'alert-error', 5000, false)
        // }else{
            setSpinflag(true)
        //     setBackFlag(true)
            let localsearch=await request($apiUrl.COMM_CROSSBOOKING_QUERY_OFFLINE_CR,{
                method:'POST',
                data:{
                    "page": pagination,
                    "params":{
                        'shipownerCompanyCode': query.shipownerCompanyCode,
                        'agencyCode':query.agencyCode,
                        'uploadPortCode':query.uploadPortCode,
                        'verifyStatus':query.verifyStatus,
                        'commissionType':query.commissionType,
                        'currencyCode':query.currencyCode,
                        'adjustFlag':query.adjustFlag,
                        'crReceiptCode':query.crReceiptCode,
                        'uploadVVD':query.uploadVVD,
                        'billReferenceCode':query.billReferenceCode,
                        'checkDateFrom':query.checkDate?momentFormat(query.checkDate[0]):null,
                        'checkDateTo':query.checkDate?momentFormat(query.checkDate[1]):null,
                        'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                        'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                    }
                },
            })
            console.log(localsearch)
            if(localsearch.success){
                setSpinflag(false)
                let datasTotal = localsearch.data ? localsearch.data.cResult : null
                let LocalChargeTotal = localsearch.data ? localsearch.data.lResult : null
                let datas = localsearch.data ? localsearch.data.cResult.resultList : null
                let LocalCharge = localsearch.data ? localsearch.data.lResult.resultList : null
                setTabTotals(LocalChargeTotal.totalCount)
                LocalCharge ? setTableDatas([...LocalCharge]) : null
                datas ? setTableData([...datas]) : null
                setTabTotal(datasTotal.totalCount)
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
            }else{
                setSpinflag(false)
                Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
            }
        }
    // }

    const mailing = () =>{
        setIsModalVisible(true)
    }
    const handleCancel = () =>{
        setIsModalVisible(false)

    }

    //重置
    const reset = () =>{
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        },[company, acquireData])
        setBackFlag(true)
        setTableData([])
        setTableDatas([])
    }
    
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        setSpinflag(true)
        let downData = await request($apiUrl.COMM_CROSSBOOKING_EXP_OFFLINE_CR,{
            method:"POST",
            data:{
                "params":{
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'agencyCode':query.agencyCode,
                    'uploadPortCode':query.uploadPortCode,
                    'verifyStatus':query.verifyStatus,
                    'commissionType':query.commissionType,
                    'currencyCode':query.currencyCode,
                    'adjustFlag':query.adjustFlag,
                    'crReceiptCode':query.crReceiptCode,
                    'uploadVVD':query.uploadVVD,
                    'billReferenceCode':query.billReferenceCode,
                    'checkDateFrom':query.checkDate?momentFormat(query.checkDate[0]):null,
                    'checkDateTo':query.checkDate?momentFormat(query.checkDate[1]):null,
                    'generateDateFrom':query.generateDate?momentFormat(query.generateDate[0]):null,
                    'generateDateTo':query.generateDate?momentFormat(query.generateDate[1]):null,
                },
                'excelFileName':formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            billReferenceCode: formatMessage({id:"lbl.bill-of-lading-number" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            commissionAmount: formatMessage({id:"lbl.The-amount-of-commission" }),
                            sfListCodeUpload: formatMessage({id:"lbl.Receipt-Code" }),
                            versionNumber: formatMessage({id:"lbl.version-number" }),
                            currencyCode: formatMessage({id:"lbl.Ccy" }),
                            commissionClass: formatMessage({id:"lbl.commission-big-type" }),
                            adjustStatus: formatMessage({id:"lbl.Adjust-statu" }),
                            totalAmountManual: formatMessage({id:"lbl.argue.ttlAmt" }),
                            vvdIdSystem: formatMessage({id:"lbl.VVD" }),
                            portCodeSystem: formatMessage({id:"lbl.port" }),
                            commissionMode: formatMessage({id:"lbl.The-Commission" }),
                            ytLockFlag: formatMessage({id:"lbl.The-withholding-lock-flag" }),
                            ytStatusSystem: formatMessage({id:"lbl.Withholding-state" }),
                            sfLockFlag: formatMessage({id:"lbl.The-paid-lock-flag" }),
                            verifyStatus: formatMessage({id:"lbl.status" }),
                            adjustFlag: formatMessage({id:"lbl.Adjust-Flag" }),
                        },
                        sumCol: {//汇总字段
                        
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0025'}),
                },
                {//sheetList列表
                    dataCol: {//列表字段
                        tmpSfListCode: formatMessage({id:"lbl.Provisional-bill-number" }),
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        billReferenceCode: formatMessage({id:"lbl.bill-no" }),
                        commissionMode: formatMessage({id:"lbl.The-Commission" }),
                        commissionType: formatMessage({id:"lbl.Commission-type" }),
                        chargeCode: formatMessage({id:"lbl.chargeCode" }),
                        actualFlag: formatMessage({id:"lbl.act-flag" }),
                        versionNumber: formatMessage({id:"lbl.versions" }),
                        rateCurrencyCode: formatMessage({id:"lbl.Return-the-currency" }),
                        refund: formatMessage({id:"lbl.refund" }),
                        reviseAmount: formatMessage({id:"lbl.Refund-of-adjustment" }),
                        refundRate: formatMessage({id:"lbl.return-the-proportion" }),
                        clearingCurrencyCode: formatMessage({id:"lbl.settlement-currency" }),
                        totalAmountInClearing: formatMessage({id:"lbl.amount-of-settlement-currency" }),
                        reviseAmountInClearing: formatMessage({id:"lbl.adjustment-amount-in-settlement-currency" }),
                        commissionBase: formatMessage({id:"lbl.Return-the-base" }),
                        officeCode: formatMessage({id:"lbl.office" }),
                        shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                        activityDate: formatMessage({id:"lbl.argue.bizDate" }),
                        recordUpdateDatetime: formatMessage({id:"lbl.Record-update-time" }),
                        recordLoadDate: formatMessage({id:"lbl.Record-the-uploaded-lot" }),
                    },
                    sumCol: {//汇总字段
                    
                    },
                'sheetName':formatMessage({id:'lbl.afcm-0026'}),
            }
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
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.rep-bl-bet-iqry'}) + '.xlsx'; // 下载后文件名
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
            <div className='header-from' style={{marginTop:'15px'}}>
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
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <SelectVal showSearch={true} style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 提单号码 */}
                        <InputText name='billReferenceCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.bill-of-lading-number'/>} span={6}/>
                        {/* 报账单号码 */}
                        <InputText name='crReceiptCode'  styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>
                        {/* VVD */}
                        <InputText name='uploadVVD' styleFlag={backFlag} label={<FormattedMessage id='lbl.VVD'/>} span={6}/>
                        {/* 审核日期 */}
                        <DoubleDatePicker span={6}  style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='checkDate'  label={<FormattedMessage id='lbl.audit-date'/>}   />
                        {/* 生成日期 */}
                        <DoubleDatePicker span={6}  style={{background:backFlag?'white':'yellow'}} disabled={[false, false]} name='generateDate'  label={<FormattedMessage id='lbl.generation-date'/>}  />
                        {/* 港口 */}
                        <InputText name='uploadPortCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.port'/>} span={6}/>
                        {/* 审核状态 */}
                        <SelectVal name='verifyStatus'flag={true} label={<FormattedMessage id='lbl.audit-status'/>} span={6} options={checkStatus.values} />
                        {/* 币种 */}
                        <InputText name='currencyCode'  label={<FormattedMessage id='lbl.ccy'/>} span={6}/>
                        {/* 佣金类型*/}
                        <SelectVal name='commissionType' flag={true}  label={<FormattedMessage id='lbl.Commission-type'/>} span={6} options={commissionCategories.values} />
                        {/* 新增/调整标志 */}
                        <SelectVal name='adjustFlag' flag={true} label={<FormattedMessage id='lbl.New-adjustment-mark'/>} span={6} options={adjustFlag.values} />
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/> </Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载 */}
                    <Button onClick={downlod}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                    {/* 邮件发送 */}
                    <Button onClick={mailing} ><MyIcon type="icon-email-success"  /><FormattedMessage id='lbl.mailing'/></Button>
                  </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=>{pageChange(page,'','search')} } > <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className='footer-table'> 
                <Tabs type="card" onChange={callback}>
                    {/* 报账单明细查询 */}
                    <TabPane tab={<FormattedMessage id='lbl.Report-your-bill-details' />} key="1">
                        <PaginationTable
                            dataSource={tableData}
                            columns={columns}
                            rowKey='billBasicUuid'
                            pageChange={pageChange}
                            pageSize={page.pageSize}
                            current={page.current}
                            scrollHeightMinus={200}
                            total={tabTabTotal}
                            rowSelection={null}
                            // selectionType='radio'
                            // setSelectedRows={setSelectedRows}
                        />
                    </TabPane>
                    {/* Local Charge明细 */}
                    <TabPane tab={<FormattedMessage id='lbl.The-Local-Charge-details' />} key="2">
                        <PaginationTable
                            dataSource={tableDatas}
                            columns={columnss}
                            rowKey='billBasicUuid'
                            pageChange={pageChange}
                            pageSize={page.pageSize}
                            current={page.current}
                            scrollHeightMinus={200}
                            total={tabTabTotals}
                            rowSelection={null}
                            // selectionType='radio'
                            // setSelectedRows={setSelectedRows}
                        />
                    </TabPane>
                </Tabs>
            </div>  
            {/* <Modal title="mailbox" visible={isModalVisible} onOk={handleCancel} onCancel={handleCancel}>
                <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery} 
                >
                    <Row>
                        {/* 邮箱 
                        <InputText name='agencyName'  span={24}/>
                    </Row>
                </Form>
                <div className="copy-from-btn">
                    {/* 按钮 
                    <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-ok" /> </Button>
                    <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-cancel" /></Button>
                </div>
            </Modal> */}
            
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default searchPreAgreementMailFeeAgmtList;