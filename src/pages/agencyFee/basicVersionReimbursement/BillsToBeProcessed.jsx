import React, { useState, useEffect, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDataExtend, momentFormat, acquireSelectDatas, agencyCodeData,formatCurrencyNew} from '@/utils/commonDataInterface';
import moment from 'moment';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form, Button, Row, Tabs, Modal} from 'antd'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import DatePicker from '@/components/Common/DatePicker'
import SelectVal from '@/components/Common/Select';
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import { createFromIconfontCN } from '@ant-design/icons';
import CosModal from '@/components/Common/CosModal'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SaveOutlined,
    FileProtectOutlined ,//选择生成发票
    FileExclamationOutlined,//全部生成发票
    ImportOutlined
} from '@ant-design/icons'
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_dkztm8notr4.js', // 在 iconfont.cn 上生成
  });

//---------------------------------------------- 待处理报账单-------------------------------------------------
const { TabPane } = Tabs;
const confirm = Modal.confirm
const LocalChargeComputationProtocol =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);   // 代理编码
    const [tableData,setTableData] = useState([])//
    const [tableDatas,setTableDatas] = useState([])//
    const [tabTotal,setTabTotal ] = useState([])//
    const [tabTabTotal,setTabTabTotal ] = useState([])//
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [verifyStatus,setVerifyStatus] = useState({})//审核状态
    const [verifyStatuss,setVerifyStatuss] = useState({})//列表审核状态
    const [postStatus,setPostStatus] = useState({})//记账状态
    const [defaultKey, setDefaultKey] = useState('1');
    const [checked, setChecked] = useState([]); //选择
    const [uuidData, setUuidData] = useState('');   // uuid  
    const [selectedRowKeys, setSelectedRowKeys] = useState([])//明细的选择
    const [cancel,setCancel] = useState(false) // 取消报账单  
    const [checkAll,setCheckAll] = useState(false) // 全选  
    const [checkDontAll,setCheckDontAll] = useState(false) // 全不选  
    const [save,setSave] = useState(false) // 保存  
    const [businessThrough,setBusinessThrough] = useState(false) // 业务审核通过  
    const [businessBack,setBusinessBack] = useState(false) // 业务审核退回
    const [financeThrough,setFinanceThrough] = useState(false) // 财务审核通过 
    const [financeBack,setFinanceBack] = useState(false) // 财务审核退回
    const [tableFlag,setTableFlag] = useState(true) // 明细表格选择是否禁用
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [spinflag,setSpinflag] = useState(false)
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [flag,setFlag] = useState(false)
    const [detailDate,setDetailDate] = useState([])
    const [tabTabTotalDetail,setTabTabTotalDetail] = useState([])//明细表格总数
    const [downFlag,setDownFlag] = useState(false)
    const Intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [pageDetail,setPageDetail]=useState({
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
    const [queryForms] = Form.useForm();
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
        acquireSelectDatas('AFCM.OFFCR.DTL.VERIFYSTATUS',setVerifyStatuss,$apiUrl)//列表审核状态
        acquireSelectDatas('AG.OFFCR.POSTSTATUS',setPostStatus,$apiUrl)//记账状态
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY','CB0068',setAcquireData, $apiUrl);// 船东
    },[])
   
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
    }

    //待处理报账单表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.Reimbursement-number" />,//报账单号码
            dataIndex: 'sfListCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE',
        },
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
            dataIndex: 'feeClass',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataType:verifyStatus.values,
            dataIndex: 'verifyStatus',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.State-of-charge-to-an-account" />,//记账状态
            dataType:postStatus.values,
            dataIndex: 'postStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            dataType: 'dateTime',
            dataIndex: 'generateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Generation-personnel" />,//生成人员
            dataIndex: 'generateUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.audit-date" />,//审核日期
            dataType: 'dateTime',
            dataIndex: 'checkDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.auditor" />,//审核人员 
            dataIndex: 'checkUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.accounting-date" />,//记账日期
            dataType: 'dateTime',
            dataIndex: 'postDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'currency',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Cal-cur-adt-tal-amt" />,//结算币调整总金额
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE'
        }
    ]

    //报账单明细表格文本 
    const columnss=[
        {
            title: <FormattedMessage id="lbl.audit-status" />,//审核状态
            dataIndex: 'verifyStatus',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC',
            render: (text, record) => {
				return <div>
                    {
                        verifyStatuss.values.map((v, i) => {
                            return text == v.value ? <span>{v.label}</span> : '';
                        })
                    }
				</div>
			}
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'sysSvvdId',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'sysPortCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
            dataType: 'dateTime',
            dataIndex: 'actvyDte',
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
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurr',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataIndex: 'rateAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'currency',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND',
            render:(text,record)=>{
                return text ? text.toUpperCase() : null
            }
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'POST_CALC_FLAG',
            
        },
        {
            title: <FormattedMessage id="lbl.Settlement-currency-exchange-rate" />,//结算币种汇率 
            dataIndex: 'clerRate',
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
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.Settlement-currency-amount" />,//结算币总金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmountManual',
            sorter: false,
            width: 120,
            align:'right',
            key:'SF_SIDE',
            
        },
        {
            title: <FormattedMessage id="lbl.version-number" />,//版本号
            dataIndex: 'versionNumber',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        }
    ]
    const mailing = () =>{
        setIsModalVisible(true)
    }
    const handleCancel = () =>{
        setIsModalVisible(false)

    }
    //表格数据
    const pageChange= async (pagination,options,search) => {
        Toast('','', '', 5000, false)
        let query = queryForm.getFieldsValue()
        setTableData([]) 
        setBackFlag(true)
        setDownFlag(false)
        search?pagination.current=1:null
        setTableDatas([])
        queryForms.resetFields()
        if(!query.agencyCode){
            setBackFlag(false)
            Toast('', Intl.formatMessage({id: 'lbl.The-proxy-code-must-be-entered'}), 'alert-error', 5000, false)
        }else{
            if(!query.agencyCode||(!query.buildDate&&!query.checkDate&&!query.postDate&&!query.sfListCode)){
                // 代理编码/报帐单号/生成日期/确认日期/记帐日期  必须输入一项 
                setBackFlag(false)
                Toast('', Intl.formatMessage({id: 'lbl.agency-postDate-must-enter'}), 'alert-error', 5000, false)
            }else{
                setBackFlag(true)
                setSpinflag(true)
                const localsearch=await request($apiUrl.AG_FEE_OFFCR_SEARCH_CR_RECEIPT_BILL,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            'soCompanyCode': query.soCompanyCode,
                            'agencyCode':query.agencyCode,
                            'sfListCode':query.sfListCode,
                            'verifyStatus':query.verifyStatus,
                            'postStatus':query.postStatus,
                            'checkDateFrom':query.checkDate ? momentFormat(query.checkDate[0]) : null,
                            'checkDateTo':query.checkDate ? momentFormat(query.checkDate[1]) : null,
                            'buildDateFrom':query.buildDate ? momentFormat(query.buildDate[0]) : null,
                            'buildDateTo':query.buildDate ? momentFormat(query.buildDate[1]) : null,
                            'postDateFrom':query.postDate ? momentFormat(query.postDate[0]) : null,
                            'postDateTo':query.postDate ? momentFormat(query.postDate[1]) : null,
                        }
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    let data=localsearch.data
                    let datas=data ? data.resultList : null
                    datas ? datas.map((v,i)=>{
                        v['id']=i
                    }) : null
                    setSpinflag(false)
                    data ? setTabTotal(data.totalCount) : null
                    datas ? setTableData([...datas]) : null
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    setFlag(true)
                }else{
                    setSpinflag(false)
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                }
            }
        }
            
    }
     // 双击 明细数据
    const doubleClickRow = (parameter) => {
        Toast('','', '', 5000, false)
        setDefaultKey('2')
        // parameter['soCompanyCode']=parameter.companyCode
        setDetailDate(parameter)
        detail(pageDetail,parameter)
       
    }
    const detail = async(pagination,parameter)=>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const result = await request($apiUrl.AG_FEE_OFFCR_SEARCH_IN_PROCESS_BILL_DTL,{
            method:"POST",
            data:{
                page:pagination,
                params: {
                    sfListCode:parameter? parameter.sfListCode:detailDate.sfListCode,
                    soCompanyCode: parameter? parameter.soCompanyCode:detailDate.soCompanyCode,
                }
            }
        })
        console.log(result)
        if(result.success) {
            setDownFlag(true)
            Toast('', result.message, 'alert-success', 5000, false)
            setSpinflag(false)
            let datass =result.data.list.length;
            let data = result.data.headData;
            let datas = result.data.list;
            datas.map((v,i)=>{
                v['id']=i
            })
            setTabTabTotal(datass)
            setTableDatas([...datas])
            if(pagination.pageSize!=pageDetail.pageSize){
                pagination.current=1
            }
            setPageDetail({...pagination})
            setTabTabTotalDetail(result.data.totalCount)
            let checkedUuid = [];
            datas.map((v, i) => {
                if(v.verifyStatus == verifyStatuss.values[0].value) {
                    checkedUuid.push(v.id);
                }
            })
            setChecked(checkedUuid);
            if(data){
                if(data.verifyStatus == 'W'){
                    setTableFlag(true)
                    setCancel(false);//取消报账单
                    setBusinessThrough(true);//业务审核通过
                    setBusinessBack(true);//业务审核退回
                    setCheckAll(true);//全选
                    setCheckDontAll(true);//全不选
                    setSave(true);//保存
                    setFinanceBack(false);//财务审核退回
                    setFinanceThrough(false);//财务审核通过
                }else if(data.verifyStatus == 'C'){
                    setTableFlag(false)
                    // detailListGrid.getTableViewer().setAllChecked(true);
                    // detailListGrid.getTableViewer().setAllGrayed(true);
                    setCancel(false);//取消报账单
                    setBusinessThrough(false);//业务审核通过
                    setBusinessBack(false);//业务审核退回
                    setCheckAll(false);//全选
                    setCheckDontAll(false);//全不选
                    setSave(false);//保存
                    setFinanceBack(true);//财务审核退回
                    setFinanceThrough(true);//财务审核通过
                }else if(data.verifyStatus == 'Q' || data.verifyStatus == 'R'){
                    setTableFlag(false)
                    // detailListGrid.getTableViewer().setAllChecked(true);
                    // detailListGrid.getTableViewer().setAllGrayed(true);
                    setBusinessThrough(false);//业务审核通过
                    setBusinessBack(false);//业务审核退回 
                    setFinanceBack(false);//财务审核退回
                    setFinanceThrough(false);//财务审核通过
                    setCheckAll(false);//全选
                    setCheckDontAll(false);//全不选
                    setSave(false);//保存
                    setCancel(true);//取消报账单
                }else if(data.verifyStatus == 'P'){
                    setTableFlag(false)
                    // detailListGrid.getTableViewer().setAllChecked(true);
                    // detailListGrid.getTableViewer().setAllGrayed(true);
                    setBusinessThrough(false);//业务审核通过
                    setBusinessBack(false);//业务审核退回 
                    setFinanceBack(false);//财务审核退回
                    setFinanceThrough(false);//财务审核通过
                    setCheckAll(false);//全选
                    setCheckDontAll(false);//全不选
                    setSave(false);//保存
                    setCancel(false);//取消报账单
                }
                verifyStatus.values.map((v, i) => {
                    data.verifyStatus == v.value ? data.verifyStatus = v.label : '';
                })
                postStatus.values.map((v, i) => {
                    data.postStatus == v.value ? data.postStatus = v.label : '';
                })
                queryForms.setFieldsValue({
                    sfListCode: data.sfListCode? data.sfListCode.toUpperCase():null,
                    agencyCode: data.agencyCode,
                    verifyStatus: data.verifyStatus,
                    postStatus: data.postStatus,
                    generateUser: data.generateUser?data.generateUser.toUpperCase():null,
                    checkUser: data.checkUser?data.checkUser.toUpperCase():null,
                    currency: data.currency,
                    totalAmount: data.totalAmount,
                    generateDate:data.generateDate? moment(data.generateDate):null,
                    checkDate:data.checkDate?moment(data.checkDate):null,
                    postDate:data.postDate?moment(data.postDate): moment(Date()),
                })
            }
            
           
            // console.log(moment(Date()))
            
        }else{
            Toast('',result.errorMessage, 'alert-error', 5000, false)
            setSpinflag(false)
            queryForms.resetFields();
            setTableDatas([])
        }
    }
    const setSelectedRowss =(value) =>{
        console.log(value)  
        // setDetailDate([...value])
    }
    //保存
    const Save = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        const save =await request($apiUrl.AG_FEE_OFFCR_MODIFY_CR,{
            method:"POST",
            data:{
                paramsList:[...tableDatas]
            }
        })
        console.log(save)
        if(save.success){
            setSpinflag(false)
            Toast('', save.message, 'alert-success', 5000, false)
        }else{
            setSpinflag(false)
            Toast('', save.errorMessage, 'alert-error', 5000, false)
        }
    }
    //   选择和状态的联动
     const selectFun = (tableDatas, row) => {
        //取消
        tableDatas.map((v, i) => {
            v.verifyStatus = verifyStatuss.values[1].value;
        })
        //确认
        row.map((v, i) => {
            v.verifyStatus = verifyStatuss.values[0].value;
        })
    }
     //   全选/全不选 
     const allSelect = (flag) => {
        Toast('', '', '', 5000, false);
        let data = tableDatas.map((v, i) => {
            return v.id;
        })
        flag ? setChecked(data) : setChecked([]);
        flag ? selectFun(tableDatas, tableDatas) : selectFun(tableDatas, []);
    }
    
    //待处理报账单---审核
    const business= async (operate)=>{
        Toast('', '', '', 5000, false);
        if(!queryForms.getFieldsValue().postDate){
            // 记账日期必须输入
            Toast('',Intl.formatMessage({id: 'lbl.postDate-must-enter'}), 'alert-error', 5000, false)
        }else{
            setSpinflag(true)
            let business=await request($apiUrl.AG_FEE_OFFCR_REVIEW_CR_RECEIP,{
                method:'POST',
                data:{
                    'params':{
                        "sfListCode":queryForms.getFieldsValue().sfListCode,
                        "postDate":momentFormat(queryForms.getFieldsValue().postDate),
                    },
                    "paramsList":[...tableDatas],
                    "operateType":operate //处理模式
                }
            })
            console.log(business)
            if(business.success){
                setSpinflag(false)
                Toast('', business.message, 'alert-success', 5000, false)
                setDefaultKey('1')
                setTableDatas([])
                queryForms.resetFields();
                pageChange(page)
            }else{
                setSpinflag(false)
                Toast('', business.errorMessage, 'alert-error', 5000, false)
            }
        }
        
    }

     //取消报账单
     const CancelBill = async () =>{
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        const save =await request($apiUrl.AG_FEE_OFFCR_CANCEL_CR_RECEIPT,{
            method:"POST",
            data:{
                params:{
                    sfListCode:queryForms.getFieldsValue().sfListCode
                }
            }
        })
        console.log(save)
        if(save.success){
            setSpinflag(false)
            Toast('', save.message, 'alert-success', 5000, false)
            setDefaultKey('1')
            setTableDatas([])
            queryForms.resetFields();
            pageChange(page)
        }else{
            setSpinflag(false)
            Toast('', save.errorMessage, 'alert-error', 5000, false)
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
        queryForms.resetFields();
        setTableDatas([])
        setFlag(false)
        setDownFlag(true)
    }

    //下载报账单
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        setSpinflag(true)
        const query = queryForm.getFieldsValue()
        let downData = await request($apiUrl.AG_FEE_OFFCR_EXP_CR_RECEIPT_BILL,{
            method:"POST",
            data:{
                "params":{
                    'soCompanyCode':query.soCompanyCode,
                    'agencyCode':  query.agencyCode,
                    'feeClass':  query.feeClass,
                    'feeType':  query.feeType,
                    'vesselProperty':  query.vesselProperty,
                    'activeDateFrom':  query.activeDate?momentFormat(query.activeDate[0]):null,
                    'activeDateTo':  query.activeDate?momentFormat(query.activeDate[1]):null,
                    'buildDateFrom':  query.buildDate?momentFormat(query.buildDate[0]):null,
                    'buildDateTo':  query.buildDate?momentFormat(query.buildDate[1]):null,
                    'tradeZoneCode':  query.tradeZoneCode,
                    'itsTradeCode':  query.itsTradeCode,
                    'tradeLaneCode':  query.tradeLaneCode,
                    'officeCode':  query.officeCode,
                    'exFlag':  query.exFlag,
                    'serviceLoopCode':  query.serviceLoopCode,
                    'vesselCode':  query.vesselCode,
                    'voyageNumber':  query.voyageNumber,
                    'bargeType':  query.bargeType,
                    'svvd':  query.svvd,
                    'portCode':  query.portCode,
                    'eovStatus':  query.eovStatus,
                },
                'excelFileName':Intl.formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        sfListCode: Intl.formatMessage({id:"lbl.Reimbursement-number" }),
                        agencyCode: Intl.formatMessage({id:"lbl.agency" }),
                        feeClass: Intl.formatMessage({id:"lbl.Big-class-fee" }),
                        verifyStatus: Intl.formatMessage({id:"lbl.audit-status" }),
                        postStatus: Intl.formatMessage({id:"lbl.State-of-charge-to-an-account" }),
                        generateDate: Intl.formatMessage({id:"lbl.generation-date" }),
                        generateUser: Intl.formatMessage({id:"lbl.Generation-personnel" }),
                        checkDate: Intl.formatMessage({id:"lbl.audit-date" }),
                        checkUser: Intl.formatMessage({id:"lbl.auditor" }),
                        postDate: Intl.formatMessage({id:"lbl.accounting-date" }),
                        currency: Intl.formatMessage({id:"lbl.settlement-currency" }),
                        totalAmount: Intl.formatMessage({id:"lbl.Cal-cur-adt-tal-amt" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':Intl.formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}),
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
            Toast('', Intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = Intl.formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}); // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    
    const download = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        let tddata = {}
        columnss.map((v, i) => {
            tddata[v.dataIndex] = Intl.formatMessage({id: v.title.props.id})
        })
        setSpinflag(true)
        let downData = await request($apiUrl.AG_FEE_OFFCR_EXP_CR_RECEIPT_BILL_DTL,{
            method:"POST",
            data:{
                "params":{
                    ...detailDate
                },
                'excelFileName':Intl.formatMessage({id:'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {
                            sfListCode:Intl.formatMessage({id:'lbl.Reimbursement-number'}),
                            agencyCode:Intl.formatMessage({id:'lbl.agency'}),
                            verifyStatus:Intl.formatMessage({id:'lbl.audit-status'}),
                            postStatus:Intl.formatMessage({id:'lbl.State-of-charge-to-an-account'}),
                            generateDate:Intl.formatMessage({id:'lbl.generation-date'}),
                            generateUser:Intl.formatMessage({id:'lbl.Generation-personnel'}),
                            checkDate:Intl.formatMessage({id:'lbl.audit-date'}),
                            checkUser:Intl.formatMessage({id:'lbl.auditor'}),
                            postDate:Intl.formatMessage({id:'lbl.accounting-date'}),
                            currency:Intl.formatMessage({id:'lbl.settlement-currency'}),
                            totalAmount:Intl.formatMessage({id:'lbl.Cal-cur-adt-tal-amt'}),
                        },
                        sumCol: {},
                        'sheetName':Intl.formatMessage({id:'lbl.Head-info'}),
                    },
                    {//sheetList列表
                        dataCol: tddata,
                        sumCol: {},
                        'sheetName':Intl.formatMessage({id:'lbl.afcm-0065'}),
                    }
                ]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.size){
            setSpinflag(false)
            if(downData.size<1){
                Toast('', Intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, Intl.formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = Intl.formatMessage({id: 'menu.afcm.agfee-stl.bas-ver-rei.bl-pro'}) + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        }else{
            setSpinflag(false)
            Toast('', downData.errorMessage, 'alert-error', 5000, false);
        }
       
    }
    return (
        <div className='parent-box'>
            <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                {/* 代理费列表 */}
                <TabPane tab={<FormattedMessage id='lbl.List-agency' />} key="1">
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
                                {/* <Select name='agencyCode' showSearch={true}style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id='lbl.agency'/>} span={6} options={agencyCode} />   */}
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' styleFlag={backFlag} label={<FormattedMessage id='lbl.Reimbursement-number'/>}  span={6} />
                                {/* 生成日期 */}
                                <DoubleDatePicker span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}} name='buildDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                                {/* 审核日期 */}
                                <DoubleDatePicker span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}} name='checkDate' label={<FormattedMessage id='lbl.audit-date'/>} />
                                {/* 记账日期 */}
                                <DoubleDatePicker span={6} disabled={[false, false]} style={{background:backFlag?'white':'yellow'}} name='postDate' label={<FormattedMessage id='lbl.accounting-date'/>}   />
                                {/* 审核状态 */}
                                <Select name='verifyStatus' flag={true} label={<FormattedMessage id='lbl.audit-status'/>} span={6} options={verifyStatus.values}/>  
                                {/* 记账状态 */}
                                <Select name='postStatus' flag={true} label={<FormattedMessage id='lbl.State-of-charge-to-an-account'/>} span={6} options={postStatus.values} />
                            </Row>
                        </Form>
                        {/* 查询条件 */}
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 下载报账单按钮 */}
                            <Button disabled={flag?false:true} onClick={downlod}><CloudDownloadOutlined/> <FormattedMessage id='lbl.Download-the-bill-aff'/></Button>
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
                            total={tabTotal}
                            handleDoubleClickRow={doubleClickRow}
                            rowSelection={null}
                            selectWithClickRow={true}
                        />
                    </div>
                </TabPane>
                {/* 明细列表 */}
                <TabPane tab={<FormattedMessage id='lbl.Detailed-information' />} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForms}
                            name='func'
                            onFinish={handleQuery} 
                        >
                            <Row>
                                {/* 报账单号码 */}
                                <InputText name='sfListCode' disabled={true} label={<FormattedMessage id='lbl.Reimbursement-number'/>} span={6}/>
                                {/* 代理编码 */} 
                                <InputText name='agencyCode' disabled={true}  label={<FormattedMessage id='lbl.agency'/>} span={6}/>
                                {/* 费用大类 */}
                                {/* <SelectVal name='feeClass' label={<FormattedMessage id='lbl.Big-class-fee'/>} span={6}/> */}
                                {/* 审核状态 */}
                                <InputText name='verifyStatus' disabled={true} label={<FormattedMessage id='lbl.audit-status'/>} span={6}/>
                                {/* 记账状态 */}
                                <InputText name='postStatus' disabled={true} label={<FormattedMessage id='lbl.State-of-charge-to-an-account'/>} span={6}/>
                                {/* 生成日期 */}
                                <DatePicker span={6} disabled={true} name='generateDate' label={<FormattedMessage id='lbl.generation-date'/>}   />
                                {/* 生成人员 */}
                                <InputText name='generateUser' disabled={true} label={<FormattedMessage id='lbl.Generation-personnel'/>} span={6}/>
                                {/* 审核日期 */}
                                <DatePicker span={6} disabled={true} name='checkDate' label={<FormattedMessage id='lbl.audit-date'/>}  />
                                {/* 审核人员 */}
                                <InputText name='checkUser' disabled={true} label={<FormattedMessage id='lbl.auditor'/>} span={6}/>
                                {/* 记账日期 */}
                                <DatePicker span={6} disabled={true} name='postDate' label={<FormattedMessage id='lbl.accounting-date'/>}  />
                                {/* 结算币种 */}
                                <InputText name='currency' disabled={true}  label={<FormattedMessage id='lbl.settlement-currency'/>} span={6}/>
                                {/* 结算币调整总金额 */}
                                <InputText name='totalAmount' disabled={true} label={<FormattedMessage id='lbl.Cal-cur-adt-tal-amt'/>} span={6}/>
                            </Row>
                        </Form> 
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Reimbursement-header-information'/> </Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left' style={{margin:'0px 1px',width:'90%'}}>
                            {/* 全选 */}
                            <CosButton onClick={()=>{allSelect(true)}}  disabled={checkAll?false:true}><MyIcon type='icon-quanbuxuan1' />  <FormattedMessage id='lbl.check-all'/></CosButton>
                            {/* 全不选 */}
                            <CosButton onClick={()=>{allSelect(false)}}  disabled={checkDontAll?false:true}><MyIcon type='icon-quanxuan2' /> <FormattedMessage id='lbl.All-dont-choose'/></CosButton>
                            {/* 保存 */}
                            <CosButton onClick={Save} disabled={save?false:true}  auth='AFCM-AG-OFFCR-002-B01'><SaveOutlined /><FormattedMessage id='lbl.save'/></CosButton>
                            {/* 业务审核通过 */}
                            <CosButton onClick={()=>{business('C')} } disabled={businessThrough?false:true}  auth='AFCM-AG-OFFCR-002-B02'><FileProtectOutlined   /><FormattedMessage id='lbl.Passed-the-business-audit'/></CosButton>
                            {/* 业务审核退回 */}
                            <CosButton onClick={()=>{business('Q')} } disabled={businessBack?false:true}  auth='AFCM-AG-OFFCR-002-B03'><ImportOutlined  /><FormattedMessage id='lbl.Business-review-return'/></CosButton>
                            {/* 财务审核通过 */}
                            <CosButton onClick={()=>{business('P')} } disabled={financeThrough?false:true}  auth='AFCM-AG-OFFCR-002-B04'><FileProtectOutlined    /><FormattedMessage id='lbl.Passed-financial-audit'/></CosButton>
                            {/* 财务审核退回 */}
                            <CosButton onClick={()=>{business('R')} } disabled={financeBack?false:true} auth='AFCM-AG-OFFCR-002-B05'><ImportOutlined    /><FormattedMessage id='lbl.Financial-audit-return'/></CosButton>
                            {/* 取消报账单 */}
                            <CosButton onClick={CancelBill} disabled={cancel?false:true} auth='AFCM-AG-OFFCR-002-B06'><FileExclamationOutlined /><FormattedMessage id='lbl.Cancel-reimbursement'/></CosButton>
                            {/* 下载 */}
                            <Button onClick={download} disabled={downFlag?false:true}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                            {/* 邮件发送 onClick={mailing}*/}
                            <Button ><MyIcon type="icon-email-success"  /><FormattedMessage id='lbl.mailing'/></Button>   
                        </div>
                        <div className='button-right'  style={{width:'10%'}}>
                        </div>
                    </div>
                    <div className='footer-table'>
                            <PaginationTable
                                dataSource={tableDatas}
                                columns={columnss}
                                rowKey='id'
                                pageChange={detail}
                                pageSize={pageDetail.pageSize}
                                current={pageDetail.current}
                                scrollHeightMinus={200}
                                total={tabTabTotalDetail}
                                setSelectedRows={setSelectedRowss}
                                selectedRowKeys = {selectedRowKeys}
                                rowSelection={
                                    tableFlag?{
                                        selectedRowKeys:checked,
                                        onChange:(key, row)=>{
                                            setChecked(key);
                                            setUuidData(row);
                                            selectFun(tableDatas, row);
                                        }
                                    }:null
                                }
                            />
                        </div>
                        <CosModal cbsTitle="mailbox" cbsVisible={isModalVisible} cbsFun={handleCancel} cbsWidth='30%'>
                            <div style={{minWidth:'300px'}}>
                                <Form 
                                form={queryForm}
                                name='func'
                                onFinish={handleQuery}  
                                >
                                    <Row>
                                        {/* 邮箱 */}
                                        <InputText name='agencyName' span={24}/>
                                    </Row>
                                </Form>
                            </div>
                        
                        <div className="copy-from-btn" style={{minWidth:'300px'}}>
                            {/* 按钮 */}
                            <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-ok" /> </Button>
                            <Button onClick={handleCancel}><FormattedMessage id="lbl.confirm-cancel" /></Button>
                        </div>
                    </CosModal>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol