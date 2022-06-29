import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage, formatMessage,connect} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData,momentFormat,acquireSelectDataExtend, agencyCodeData,TimesFun} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tooltip} from 'antd'
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import AgencyFeeAgmtEdit from "./agencyFeeAgmtEdit"
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileSearchOutlined,//查看详情
    InfoCircleOutlined
} from '@ant-design/icons'
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}


const LocalChargeComputationProtocol =(props)=> {
    const [agencyCode,setAgencyCode] = useState([])//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
    const [way,setWay] = useState ({})//记账方式
    const [arithmetic,seArithmetic] = useState ({})//记账算法  
    const [whether,setWhether] = useState ({})//通用的是否
    const [spinflag,setSpinflag] = useState(false)
    const [AIsModalVisible, setAIsModalVisible] = useState(false);//新增编辑弹框开关
    const [itemFlag,setItemFlag] = useState (false);//弹框item是否禁用
    const [compileData,setCompileData] = useState([]);//编辑数据
    const [buttonFlag,setButtonFlag] = useState(false)//新增、编辑、查看详情的弹框按钮是否禁用
    const [flag,setFlag] = useState(false)//表格删除保存新增是否禁用
    const [detailsFlag,setdetailsFlag] = useState(true);//查看详情禁用
    const [title, setTitle] = useState('');
    const [permissionsButton,setPermissionsButton] = useState([])//按钮权限数据
    const [shipperFlag,setShipperFlag] = useState(false)//船东禁用
    const [groupFlag, setGroupFlag] = useState(false);	// 仅供编辑group信息箱型尺寸组编辑修改尺寸组用
    const [airlineFlag,setairlineFlag] = useState (false)//航线组新增按钮是否禁用
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [uuid,setUuid] = useState([])
    const [copyShow,setCopyShow] = useState(false)//复制
    const titTooltip = <span style={{color:'#000'}}><FormattedMessage id='lbl.afcm-0089' /></span>
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "shipperOwner":null,
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

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        companys() 
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE',setWay,$apiUrl);//记账方式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG',seArithmetic,$apiUrl);//记账算法
        acquireSelectData('AFCM.AGMT.YF.BUSINESS',setWhether,$apiUrl);//应付实付是否记账
    },[])

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [companyData, setCompanyData] = useState('')
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            companyCode:props.user.currentUser.companyCode,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData,companyData])

     //公司
     const companys = async() =>{
        await request.post($apiUrl.AG_FEE_AGMT_SEARCH_INIT)
        .then((resul) => {
            if(!resul.data)return
            var data = resul.data.companys;
            data.map((val, idx)=> {
                val['value'] = val.companyCode 
                val['label'] = val.companyCode + '-' + val.companyName;

            })
            setCompanysData(data);
        })
        let company = await request($apiUrl.CURRENTUSER,{
            method:"POST",
            data:{}
        })
        if(company.success){
            setCompanyData(company.data.companyCode)
        }
    }
   
    //代理费计算协议表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a><CosButton onClick={()=>detail(record,index,true)}><FileSearchOutlined style={{color:'#2795f5',fontSize: '15px'}} /></CosButton></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号码
            dataIndex: 'feeAgreementCode',
            sorter: true,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司代码
            dataIndex: 'companyCode',
            sorter: true,
            align:'left',
            width: 60,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: true,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.agent-described" />,//代理描述
            dataIndex: 'agencyDescription',
            sorter: true,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Son-agency-code" />,//子代理编码
            dataIndex: 'subAgencyCode',
            sorter: true,
            width: 80,
            align:'left',
            key:'AGENCY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            sorter: true,
            width: 100,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            sorter: true,
            width: 100,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.productbility" />,//是否生产性
            dataIndex: 'prdIndicator',
            sorter: true,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.keep-account-arithmetic" />,//记帐算法
            dataType:arithmetic.values,
            dataIndex: 'postCalculationFlag',
            sorter: true,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-way" />,//记帐方式 
            dataType:way.values,
            dataIndex: 'postMode',
            sorter: true,
            width: 120,
            align:'left',
            key:'POST_MODE',
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: true,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: true,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报帐
            dataIndex: 'sfSide',
            sorter: true,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType:whether.values,
            dataIndex: 'isBill',
            sorter: true,
            width: 120,
            align:'left',
            key:'IS_BILL' ,
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType:whether.values,
            dataIndex: 'isYt',
            sorter: true,
            width: 120,
            align:'left',
            key:'IS_YT',
        },
        {
            title: <FormattedMessage id="lbl.last-modifier" />,//最后修改人
            dataIndex: 'recordUpdateUser',
            sorter: true,
            width: 120,
            align:'left',
            key:'REC_CHECK_HQ_USR'
        },
        {
            title: <FormattedMessage id="lbl.last-modification-date" />,//最后修改日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: true,
            width: 120,
            align:'left',
            key:'REC_UPD_DTE'
        },
    ]
    const detail = async(record) =>{
        setAIsModalVisible(true)
        // return
        setSpinflag(true)
        let detail = await request($apiUrl.AG_FEE_AGMT_SEARCH_CACL_AGMT_DETAIL,{
            method:"POST",
            data:{
                'uuid':record.agreementHeadUuid,
            }
        })
        console.log(detail)
        if(detail.success){
            let data=detail.data
            setSpinflag(false)
            setAIsModalVisible(true)
            setFlag(flag)
            setPermissionsButton(data)
            setItemFlag(false)
            setairlineFlag(false)
            setGroupFlag(false)
            setShipperFlag(true)
            data.prdIndicator = data.prdIndicator+''
            data.postCalculationFlag = data.postCalculationFlag+''
            data.postMode = data.postMode+''
            data.isYt = data.isYt+''
            data.isBill = data.isBill+''
            setCompileData(data)
            setTitle(<FormattedMessage id='lbl.ViewDetails' />)
        }else{
            setSpinflag(false)
        }
    }
     //新增,编辑,查看详情父传子数据
     const addEdit = {
        //新增传的数据
        // toDate,//结束日期
        AIsModalVisible,//弹框开关
        itemFlag,//弹框item是否禁用
        airlineFlag,//航线组新增按钮是否禁用
        setairlineFlag,//航线组新增按钮是否禁用
        setItemFlag,
        setAIsModalVisible,
        buttonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        setButtonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        companysData,
        //编辑传的数据
        compileData,
        setCompileData,
        flag,//表格删除保存新增是否禁用
        detailsFlag,//查看详情禁用
        title,
        permissionsButton,
        groupFlag, 
        setGroupFlag,
        companyData,//公司默认值
        company,//船东默认值
        acquireData,
        shipperFlag,//船东禁用
    }

    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        setCopyShow(false)
        setChecked([])
        const query = queryForm.getFieldsValue()
        if(search){
            pagination.current=1
        }
        let sorter
            if(!options){
                console.log(111111111111111111,options)
            }else{
                console.log(options)
                if(options&&options.sorter.order){
                    sorter={
                        "field": options.sorter.columnKey,
                        "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
                    }
                }   
            }
            console.log(sorter)
            if((query.fromDate&&!query.toDate)||(!query.fromDate&&query.toDate)){
                Toast('', formatMessage({id:'lbl.date-null'}) , 'alert-error', 5000, false)
            }else {
                // let str = query ? query.companyCode : '';
                // let we = str ? str.substring(0, str.indexOf('-')) : null;
                const localsearch=await request($apiUrl.AG_FEE_AGMT_SEARCH_CALC_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params":{
                            ...query,
                            Date:undefined,
                            'fromDate':query.Date?momentFormat(query.Date[0]):null,
                            'toDate':query.Date?momentFormat(query.Date[1]):null,
                            // "companyCode": we
                            },
                        'sorter':sorter
                    }
                })
                console.log(localsearch)
                if(localsearch.success){
                    setSpinflag(false)
                    let data=localsearch.data
                    let datas=localsearch.data.resultList
                    datas.map((v,i)=>{
                        v['id'] = i
                    })
                    setTabTotal(data.totalCount)
                    setTableData([...datas])
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                }else{
                    setSpinflag(false)
                    setTableData([])
                    Toast('', localsearch.errorMessage , 'alert-error', 5000, false)
                }
            
        } 
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            companyCode:companyData,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        setTableData([])
        setCopyShow(false)
        setChecked([])
    }
   
    const setSelectedRows = (val) =>{
        let uuidRidow = [] 
        if(val.length>0){
            val.map((v,i)=>{
                uuidRidow.push(v.agreementHeadUuid)
            })
            setUuid(uuidRidow)
        }
        setCopyShow(true)
        // val.length>0?val.map((v,i)=>{
        //     uuid.push={
        //         'uuid':v.agreementHeadUuid
        //     }
        //     setUuid(uuid)//下载要的数据
        // }):
        // val.length==1?setCopyShow(true):setCopyShow(false)
   }

    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        console.log(uuid)
        let id =uuid.map((v,i)=>{
           return {'uuid':v}
        })
          
        // if(copydata.length==1){
            let downData = await request($apiUrl.AG_FEE_AGMT_EXP_CALC_AGMT_SELECT,{
            method:"POST",
            data:{
                'paramsList':id,
                // 'operateType':'CALC_AGMT',
                'excelFileName':formatMessage({id:'menu.afcm.agreement.agency.searchCaclAgencyFeeAgmtList'}),
                sheetList: [
                    {//Head头
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            companyCode: formatMessage({id:"lbl.company" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            agencyDescription: formatMessage({id:"lbl.agent-described" }),
                            feeAgreementCode: formatMessage({id:"lbl.agreement" }),
                            fromDate: formatMessage({id:"lbl.effective-start-date" }),
                            toDate: formatMessage({id:"lbl.effective-end-date" }),
                            prdIndicator: formatMessage({id:"lbl.productbility" }),
                            postCalculationFlag: formatMessage({id:"lbl.arithmetic" }),
                            postMode: formatMessage({id:"lbl.bookkeeping" }),
                            ygSide: formatMessage({id:"lbl.estimate" }),
                            yfSide: formatMessage({id:"lbl.make" }),
                            sfSide: formatMessage({id:"lbl.submitanexpenseaccount" }),
                            isYt: formatMessage({id:"lbl.withholding" }),
                            isBill: formatMessage({id:"lbl.actually" }),
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0033'}),//head头
                    },
                    {//item列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            fromDate:formatMessage({id:"lbl.effective-start-date"}),
                            toDate:formatMessage({id:"lbl.effective-end-date"}),

                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            heryType: formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode: formatMessage({id:"lbl.identifying-code" }),
                            feeClass: formatMessage({id:"lbl.Big-class-fee" }),
                            feeType: formatMessage({id:"lbl.Small-class-fee" }),
                            vesselIndicator: formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            calculationMethod: formatMessage({id:"lbl.Computing-method" }),
                            compareIndicator: formatMessage({id:"lbl.Whether-to-vote-for-an-election" }),
                            compareCalculationMethod: formatMessage({id:"lbl.Choose-a-large-calculation-method" }),
                            tsIndicator: formatMessage({id:"lbl.Is-it-a-special-rate" }),
                            modifyFlag: formatMessage({id:"lbl.Whether-or-not-tiered-rates" }),
                            vatFlag: formatMessage({id:"lbl.Whether-the-price-includes-tax" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0034'}),//代理费协议item
                    },
                    {//CALL/CALL2/MCALL/VOY/VOY2
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            calculationMethod:formatMessage({id:"lbl.Computing-method" }),
                            feeType:formatMessage({id:"lbl.Small-class-fee" }),
                            serviceGroupCode:formatMessage({id:"lbl.afcm-0085"}),
                            vesselIndicator:formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            heryType:formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode:formatMessage({id:"lbl.identifying-code" }),

                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            callNumber: formatMessage({id:"lbl.Port-number" }),
                            feeCurrencyCode: formatMessage({id:"lbl.ccy" }),
                            feePrice: formatMessage({id:"lbl.price" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.CALL-particulars'}) + '-' + formatMessage({id:'lbl.CALL2-particulars'})+ '-' + formatMessage({id:'lbl.MCALL-particulars'})+ '-' + formatMessage({id:'lbl.VOY-particulars'})+ '-' + formatMessage({id:'lbl.VOY2-particulars'}),//代理费计算方法明细
                    },
                    {//箱量计算法表格文本
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            calculationMethod:formatMessage({id:"lbl.Computing-method" }),
                            feeType:formatMessage({id:"lbl.Small-class-fee" }),
                            serviceGroupCode:formatMessage({id:"lbl.afcm-0085"}),
                            vesselIndicator:formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            heryType:formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode:formatMessage({id:"lbl.identifying-code" }),

                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            emptyFullIndicator: formatMessage({id:"lbl.empty-container-mark" }),
                            transmitIndicator: formatMessage({id:"lbl.lnward-outward-transit" }),
                            containerSizeTypeGroup: formatMessage({id:"lbl.Box-size-group" }),
                            socIndicator: formatMessage({id:"lbl.empty-box-mark" }),
                            cargoProperty: formatMessage({id:"lbl.Domestic-trade-foreign-trade" }),
                            unitPrice: formatMessage({id:"lbl.price" }),
                            feeCurrencyCode: formatMessage({id:"lbl.ccy" }),
                            unitPriceType: formatMessage({id:"lbl.price-type" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.CNT1-particulars'}) + '-' + formatMessage({id:'lbl.CNT2-particulars'}),//代理费计算方法明细
                    },
                    {//时间(DATE)计算方法
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            calculationMethod:formatMessage({id:"lbl.Computing-method" }),
                            feeType:formatMessage({id:"lbl.Small-class-fee" }),
                            serviceGroupCode:formatMessage({id:"lbl.afcm-0085"}),
                            vesselIndicator:formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            heryType:formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode:formatMessage({id:"lbl.identifying-code" }),

                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            calculationPeriod: formatMessage({id:"lbl.Date-of-the-period" }),
                            feeCurrencyCode: formatMessage({id:"lbl.ccy" }),
                            feePrice: formatMessage({id:"lbl.price" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.DATE-particulars'}),//代理费计算方法明细
                    },
                    {//北美箱量累进(AGG)
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            calculationMethod:formatMessage({id:"lbl.Computing-method" }),
                            feeType:formatMessage({id:"lbl.Small-class-fee" }),
                            serviceGroupCode:formatMessage({id:"lbl.afcm-0085"}),
                            vesselIndicator:formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            heryType:formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode:formatMessage({id:"lbl.identifying-code" }),

                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            groupCode: formatMessage({id:"lbl.Group-number" }),
                            startTeu: formatMessage({id:"lbl.volume-point" }),
                            endTeu: formatMessage({id:"lbl.Volume-as-point" }),
                            fromDate: formatMessage({id:"lbl.Start-date-Carton-quantity" }),
                            toDate: formatMessage({id:"lbl.Container-volume-deadline" }),
                            unitPrice:formatMessage({id:"lbl.teu-price"}),
                            feeCurrencyCode:formatMessage({id:"lbl.ccy"}),
                            unitPriceType:formatMessage({id:"lbl.price-type"}),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.AGG-particulars'}),//代理费计算方法明细
                    },
                    {//提单法(BL)计算方法
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            calculationMethod:formatMessage({id:"lbl.Computing-method" }),
                            feeType:formatMessage({id:"lbl.Small-class-fee" }),
                            serviceGroupCode:formatMessage({id:"lbl.afcm-0085"}),
                            vesselIndicator:formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            heryType:formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode:formatMessage({id:"lbl.identifying-code" }),

                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            feePrice: formatMessage({id:"lbl.price" }),
                            feeCurrencyCode: formatMessage({id:"lbl.ccy" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.VSHP-particulars'}) + '-' + formatMessage({id:'lbl.BL-particulars'}) ,//代理费计算方法明细
                    },
                    {//VTEU计算方法表格文本
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            calculationMethod:formatMessage({id:"lbl.Computing-method" }),
                            feeType:formatMessage({id:"lbl.Small-class-fee" }),
                            serviceGroupCode:formatMessage({id:"lbl.afcm-0085"}),
                            vesselIndicator:formatMessage({id:"lbl.Whether-or-not-their-own" }),
                            heryType:formatMessage({id:"lbl.Reference-code-class" }),
                            heryCode:formatMessage({id:"lbl.identifying-code" }),

                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            startTeu: formatMessage({id:"lbl.Starting-point-tonnage" }),
                            endTeu: formatMessage({id:"lbl.Tonnage-cut-off-point" }),
                            feeCurrencyCode: formatMessage({id:"lbl.ccy" }),
                            feePrice: formatMessage({id:"lbl.price" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.VSHP-particulars'}) + '-' + formatMessage({id:'lbl.VTEU-particulars'}),//代理费计算方法明细
                    },
                    {//箱型尺寸组
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            
                            containerSizeTypeGroup: formatMessage({id:"lbl.Box-size-name" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            containerSizeType: formatMessage({id:"lbl.Box-size" }),
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0035'}),//代理费箱型尺寸组明细
                    },
                    {//航线组
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            
                            serviceLoopCode: formatMessage({id:"lbl.Airline-code" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            fromDate: formatMessage({id:"lbl.start-date" }),
                            toDate: formatMessage({id:"lbl.over-date" }),
                            serviceGroupCode: formatMessage({id:"lbl.airlines-group" }),
                            groupDescription: formatMessage({id:"lbl.route-group-description" }),
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0036'}),//代理费航线组明细
                    },
                    {//特殊费率
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            agencyCode: formatMessage({id:"lbl.agency" }),
                            subAgencyCode:formatMessage({id:"lbl.Son-agency-code"}),
                            productInd:formatMessage({id:"lbl.productbility"}),
                            
                            agreementHeadUuid:formatMessage({id:"lbl.afcm-0042" }),
                            feeAgreementCode:formatMessage({id:'lbl.agreement'}),
                            agreementItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                            startTeu: formatMessage({id:"lbl.volume-point" }),
                            endTeu: formatMessage({id:"lbl.Volume-as-point" }),
                            feePrice: formatMessage({id:"lbl.price" }),
                            feeCurrencyCode: formatMessage({id:"lbl.ccy" }),
                            percentage: formatMessage({id:"lbl.percentage" }),
                        },
                        sumCol: {//汇总字段
                        },
                    'sheetName':formatMessage({id:'lbl.afcm-0079'}) ,//代理费计算方法明细
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
                Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                console.log(blob)
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agreement.agency.searchCaclAgencyFeeAgmtList'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({id: 'menu.afcm.agreement.agency.searchCaclAgencyFeeAgmtList'})+ '/'+ TimesFun() + '.xlsx'; // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        // }else{
        //     Toast('',formatMessage({id:'lbl.afcm-0038'}), 'alert-error', 5000, false)
        // }
        
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
                        <Select name='shipperOwner' disabled={company.companyType == 0 ? true : false} span={6} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 公司 */}
                        <Select span={6} showSearch={true}  name='companyCode' flag={true} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
                        <a style={{color:'orange'}}><Tooltip color='#e6f7ff' style={{color:'#000'}} className="tipsContent" title={titTooltip}><InfoCircleOutlined /></Tooltip></a>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select flag={true} showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 船东 */}
                        {/* <SelectVal span={6}  name='shipperOwner'  flag={true} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/> */}
                        {/* 公司 */}
                        {/* <Select showSearch={true} name='companyCode' flag={true} label={<FormattedMessage id='lbl.company'/>}  span={6} options={companysData} /> */}
                        {/* 代理编码 */}
                        {/* <SelectVal name='agencyCode' showSearch={true} label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 协议代码 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.agreement'/>}/>
                        {/* 代理描述 */}
                        <InputText capitalized={false} name='agencyName' label={<FormattedMessage id='lbl.agent-described'/>} span={6}/>  
                        {/* 有效日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='Date'  label={<FormattedMessage id='lbl.valid-date'/>}   />          
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod} disabled={copyShow?false:true}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
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
                    // selectionType='radio'
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                            setSelectedRows(row);
                        }
                    }}
                />
            </div>
            <Loading spinning={spinflag} />
            <AgencyFeeAgmtEdit addEdit={addEdit} />
        </div>
    )
}
export default connect(({user, global}) => ({
    user: user
}))(LocalChargeComputationProtocol) 