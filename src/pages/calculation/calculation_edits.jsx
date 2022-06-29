import React, { useState,useEffect, $apiUrl } from 'react';
import { Modal, Button, Form, Row, Tabs, Tooltip } from 'antd';
import { FormattedMessage,connect,useIntl } from 'umi';
import request from '@/utils/request';
import {CosDatePicker, CosDoubleDatePicker, CosInputText, CosSelect, CosButton, CosPaginationTable, CosLoading, CosRadio} from '@/components/Common/index'
import { momentFormat, acquireSelectData, acquireSelectDataExtend,dictionary } from '@/utils/commonDataInterface';
import moment from 'moment';
import CrEdit from './cr_edit'
import AgEdit from './ag_edit'
import LogPopUp from '../commissions/agmt/LogPopUp'
import { Toast } from '@/utils/Toast'
import {
	CloseCircleOutlined,//删除
	FormOutlined,//编辑
	FileDoneOutlined,//保存
	SaveOutlined,//保存
	FileProtectOutlined,//保存并提交审核
	ImportOutlined,//协议退回
    UnlockOutlined,//解锁
    ReadOutlined,
	ReloadOutlined,
	SearchOutlined,
    FileSearchOutlined
} from '@ant-design/icons'
const { TabPane } = Tabs;
const confirm = Modal.confirm

const CommissionAgmtEdits = (props) => {
	const [queryForm] = Form.useForm();
    const [queryForms] = Form.useForm();
	const {
		companysData,        // 公司
        adHeaderData={},//头信息
        prepareData=[],//测算模块算法调整模式
	} = props.inits;
	const intl = useIntl();
	const [loading,setLoading] = useState(false)
	const [acquireData,setAcquireData] = useState({})//船东
	const [protocolStateData,setProtocolStateData] = useState({})//协议状态
	const [defaultKey,setDefaultKey] = useState('1')//佣金  代理费 tab
	const [calcCommonFlag,setCalcCommonFlag] = useState(false)//头信息禁用
	const [crList,setCrList] = useState([]);
    const [tabTotalCr,setTabTotalCr] = useState(0)
    const [agList,setAgList] = useState([]);
    const [tabTotalAg,setTabTotalAg] = useState(0)
    const [title,setTitle] = useState('')
    const [agentCompany,setAgentCompany] = useState([]);
	const [pageAg, setPageAg]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    const [pageCr, setPageCr]=useState({    //分页
        current: 1,
        pageSize: 10
    })

    const [agreement,setAgreementType] = useState({});  // 协议类型
    const [commission,setCommission] = useState({});  // 收取Cross Booking佣金
    const [commonFlag,setCommonFlag] = useState(false)//头信息禁用
    const [pattern,setPattern] = useState({});  // Cross Booking模式
    const [paidCommissionModel,setPaidCommissionModel] = useState({}); // setPaidCommissionModel第三地付费佣金模式
    const [accountsArithmetic,setAccountsArithmetic] = useState({});  // 记账算法
    const [accountsWay,setAccountsWay] = useState({});  // 记账方式
    const [ytBusiness, setYtBusiness] = useState({});  // 预提是否记账
    const [yfBusiness, setYfBusiness] = useState({});  // 应付实付是否记账 
    
    const [officeType, setOfficeType] = useState({});  // office类型 
    const [toPayInAdvance, setToPayInAdvance] = useState({});  // 预到付
    const [commissionBasedModel, setCommissionBasedModel] = useState({});  // 佣金模式 
    const [calcMthd, setCalcMthd] = useState({});  // 佣金计算方法 
    const [socEmptyInd, setSocEmptyInd] = useState({});  // SOC空箱标记 
    const [vatFlag, setVatFlag] = useState({});  // 是否含税价 
    const [currCode, setCurrCode] = useState({});  // 币种

    const [tableData, setTableData] = useState({});     // 编辑查看详情数据
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [dateEnd, setDateEnd] = useState();   // 结束时间
    const [addFlag, setAddFlag] = useState(true);   // 判断是新建或者编辑查看
    const [header, setHeader] = useState(true);    // table表头切换

    const [writeRead,setWriteRead] = useState(false);//区别新增编辑查看详情
    const [flag, setFlag] = useState(false);
    const [headerUuid, setHeaderUuid] = useState('');
    const [btnIdx, setBtnIdx] = useState('');   // button状态
    const [stateFlags, setStateFlag] = useState(false);     // 根据状态设置
    const [checkStatus,setCheckStatus] = useState({});//审核状态
    //代理费
    const [toDate,setToDate] = useState ({});//结束时间
    const [AIsModalVisible, setAIsModalVisible] = useState(false);//ag新增编辑弹框开关
    const [itemFlag,setItemFlag] = useState (false);//弹框item是否禁用
    const [addData,setAddData] = useState ([]);//新增初始化数据
    const [airlineFlag,setairlineFlag] = useState (false)//航线组新增按钮是否禁用
    const [buttonFlag,setButtonFlag] = useState(false)//新增、编辑、查看详情的弹框按钮是否禁用
    const [btnIndex, setBtnIndex] = useState('')
    const [compileData,setCompileData] = useState([]);//编辑数据
    const [detailsFlag,setdetailsFlag] = useState(true);//查看详情禁用
    const [isModalVisibleLog,setIsModalVisibleLog] = useState(false)//日志弹框
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [showFlag, setShowFlag] = useState(true); // 根据测算类型显示不同列
    const [showFlags, setShowFlags] = useState(true); 
    const [calcType,setCalcType] = useState({})  //测算类型
	useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0044',setToPayInAdvance, $apiUrl);// 预到付
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'COMM.CALC.MTHD.CB0050',setCalcMthd, $apiUrl);// 佣金计算方法
        acquireSelectData('AFCM.AGMT.TYPE',setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.CB.IND',setCommission, $apiUrl);// 收取Cross Booking佣金
        acquireSelectData('AFCM.AGMT.CB.MODE',setPattern, $apiUrl);// Cross Booking模式
        acquireSelectData('AFCM.AGMT.PAY.ELSWHERE.MODE', setPaidCommissionModel, $apiUrl);// setPaidCommissionModel第三地付费佣金模式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG',setAccountsArithmetic, $apiUrl);// 记账算法
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE',setAccountsWay, $apiUrl);// 记账方式
        acquireSelectData('AFCM.AGMT.YT.BUSINESS',setYtBusiness, $apiUrl);// 预提是否记账  
        acquireSelectData('AFCM.AGMT.YF.BUSINESS',setYfBusiness, $apiUrl);// 应付实付是否记账  
        acquireSelectData('AFCM.AGMT.OFFICE.TYPE',setOfficeType, $apiUrl);// office类型 
        acquireSelectData('CC0013',setCommissionBasedModel, $apiUrl);// 佣金模式
        acquireSelectData('COMM.SOC.EMPTY.IND',setSocEmptyInd, $apiUrl);// SOC空箱标记
        acquireSelectData('AGMT.VAT.FLAG',setVatFlag, $apiUrl);// 是否含税价       
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE',setCurrCode, $apiUrl);// 币种      
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setCheckStatus, $apiUrl);// 审核状态
        acquireSelectData('BANLIE.SVC.HRCHY.TYPES',setCalcType, $apiUrl);// 测算类型

		if(props.match.params.id=='edit'){
            if(adHeaderData&&(adHeaderData.runStatus==0||adHeaderData.runStatus==9)){
                setCalcCommonFlag(false)
            }else{
                setCalcCommonFlag(true)
            }
            adHeaderData.prepareType = String(adHeaderData.prepareType)
            console.log(adHeaderData)
            let companys = []
            if(adHeaderData.effectCompanies!=null){
                adHeaderData.effectCompanies.map((v,i)=>{
                    companys.push(v.effectCompanyCode )
                })
            }
			queryForm.setFieldsValue({
				header:{
					...adHeaderData,
					prepareStartDate:adHeaderData&&moment(adHeaderData.prepareStartDate),
                	prepareEndDate:adHeaderData&&moment(adHeaderData.prepareEndDate),
                    effectCompanyCode: companys
				}
			})
        }
        const params = queryForm.getFieldsValue().header
        if(params.hierarchyType=="Commission"){
            setShowFlag(false)
        }else{
            setShowFlags(false)
        }
        commonTableHeader()
        agencyFeeTableHeader()
    },[])
    // 审核table判断
    const commonTableHeader = async() => {
        // 初始化接口-船东口岸 perhaps 网点
        let result = await request($apiUrl.COMM_AGMT_SEARCH_INIT,{
            method:"POST"
        })
        if(result.success){
            // console.log(result.data.companys[0].companyType)
            let idx = result.data.companys[0] ? result.data.companys[0].companyType : 0;
            setBtnIdx(idx);
            if(idx == 0 || idx == 1) {
                setHeader(true);
            } else {
                setHeader(false);
            }
        }else {
            Toast('', '', '', 5000, false);
        }
    }
    const agencyFeeTableHeader = async() => {
        // 初始化接口-船东口岸 perhaps 网点
        let result = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_INIT,{
            method:"POST"
        })
        if(result.success){
            result.data.companys[0]?setBtnIndex(result.data.companys[0].companyType):null
        }else {
            Toast('', '', '', 5000, false);
        }
    }

	const headerAave = async() => { //保存修改
		Toast('','', '', 5000, false)
		setLoading(true)
		const isEdit = props.match.params.id
        const params = queryForm.getFieldsValue().header
        if(params.effectCompanyCode!=null){
            let companys = params.effectCompanyCode.map((item,index)=>{
                console.log(item)
                return {effectCompanyCode: item, }
            })
            console.log(companys)
            setAgentCompany(companys)
        }
        const result = await request($apiUrl.PRECALC_SAVEPRE,       
            {
                method:'POST',
                data: {
                    params: {
						// ...params,
                        prepareName: params.prepareName,
                        hierarchyType: params.hierarchyType,
                        prepareType: params.prepareType,
						prepareStartDate: params.prepareStartDate ? momentFormat(params.prepareStartDate) : undefined,
						prepareEndDate:params.prepareEndDate ? momentFormat(params.prepareEndDate) : undefined,
                        effectAllData: params.effectAllData,
                        prepareCompanyCode:adHeaderData.prepareCompanyCode,
                        prepareId:adHeaderData.prepareId,
                        // effectCompanyCode:params.effectCompanyCode&&params.effectCompanyCode.split('-')[0],
                        effectCompanies: agentCompany,
					},
					uuid:isEdit=='edit'?adHeaderData.prepareId:undefined
                }
            }
        )
        if(result.success) {
			Toast('',result.message||intl.formatMessage({id:'lbl.save-successfully'}), 'alert-success', 5000, false)
            setLoading(false)
        }else{
            setLoading(false)
        }
	}
	const headerSubmit = async(url) => { //提交测算  同步协议
        Toast('','', '', 5000, false)
		if(!adHeaderData.prepareId){
			Toast('',intl.formatMessage({id:'preCalc.lackParams'}), 'alert-error', 5000, false)
			return 
		}
        setLoading(true)
        const result = await request(url,       
            {
                method:'POST',
                data: {
					uuid:adHeaderData.prepareId
                }
            }
        )
        if(result.success) {
            setCalcCommonFlag(true)
            Toast('',result.message||intl.formatMessage({id:'lbl.operate-success'}), 'alert-success', 5000, false)
            setLoading(false)
        }else{
            setLoading(false)
        }
    }
    const deleteSubmit = async(url) => {//放弃测算任务
        if(!adHeaderData.prepareId){
			Toast('',intl.formatMessage({id:'preCalc.lackParams'}), 'alert-error', 5000, false)
			return 
        }
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Are-you-delete'}),
            okText: intl.formatMessage({id: 'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setLoading(true)
                confirmModal.destroy()
                let result = await request(url,{
                        method:'POST',
                        data: {
                            uuid: adHeaderData.prepareId
                        }
                    })
                if(result.success) {
                    setLoading(false)
                    props.history.goBack()
                    Toast('',result.message, 'alert-success', 5000, false)
                } else {
                    Toast('', '', '', 5000, false);
                    setLoading(false)
                }
            }
        })
    }
	const goBack = () => {//返回上一页
		props.history.goBack()
	}
	const tabsChange = (active) => {//切换tab
		setDefaultKey(active)
	}
	const columnsCr=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'center',
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => {deleteTableData(record, index)}} disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}}><CloseCircleOutlined/></a>  删除 */}
                        <a onClick={() => {deleteTableData(record, index)}} style={{color:'red'}}><CloseCircleOutlined/></a>  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => {comEditBtn(record, index, false)}}><FormOutlined/></a>  {/* 修改 */}
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => {comEditBtn(record, index, true)}}><FileSearchOutlined/></a>{/* 查看详情 */}
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => {journal(record,'')}}><SearchOutlined /></a>
                    </Tooltip>
                </div>
            }
        },{
            title: <FormattedMessage id="lbl.agreement" />,//协议代码
            dataIndex: 'commissionAgreementCode',
            align:'left',
            sorter: false,
            key: 'COMM_AGMT_CDE',
            width: 120
        },{
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            key: 'SO_COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            align:'left',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            key: 'AGENCY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            sorter: false,
            key: 'COMPANY_NME_ABBR',
            width: 120
        },{
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataIndex: 'status',
            dataType: protocolStateData.values,
            align:'left',
            sorter: false,
            key: 'STATUS',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.effective-start-date" />,//有效开始日期
            dataIndex: 'fromDate',
            align:'left',
            sorter: false,
            key: 'FM_DTE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.effective-end-date" />,//有效结束日期
            dataIndex: 'toDate',
            align:'left',
            sorter: false,
            key: 'TO_DTE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.payment" />,//异地支付
            dataIndex: 'payElsewherePercent',
            align:'left',
            sorter: false,
            key: 'PAY_ELSEWHERE_PCT',
            width: 120
        },{
            title:<FormattedMessage id="lbl.off-site-commission" />,//第三地付费佣金模式
            dataIndex: 'payElsewhereMode',
            align:'left',
            sorter: false,
            key: 'PAY_ELSEWHERE_MDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.all-rate-OFT" />,//All in Rate的OFT比例
            dataIndex: 'allInRate',
            align:'left',
            sorter: false,
            key: 'ALL_IN_RATE',
            width: 130
        },{
            title: <FormattedMessage id={header ? "lbl.agency-audit-status" : 'lbl.branch-audit-state'} />,// 代理审核状态
            dataIndex: 'checkAgencyStatus',
            align:'left',
            sorter: false,
            key: 'CHECK_AGENCY_STATUS',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.agency-audit-person" : 'lbl.branch-audit-person'} />,// 代理审核人
            dataIndex: 'recordCheckAgencyUser',
            align:'left',
            sorter: false,
            key: 'REC_CHECK_AGENCY_USR',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.agency-verify-date" : 'lbl.branch-audit-date'} />,// 代理审核日期
            dataIndex: 'recordCheckAgencyDate',
            align:'left',
            sorter: false,
            key: 'REC_CHECK_AGENCY_DTE',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.pmd-audit-status" : 'lbl.port-audit-state'} />,// PMD审核状态
            dataIndex: 'checkPmdStatus',
            align:'left',
            sorter: false,
            key: 'CHECK_HQ_STATUS',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.PMD-audit-person" : 'lbl.port-audit-person'} />,// PMD审核人
            dataIndex: 'recordCheckPmdUser',
            align:'left',
            sorter: false,
            key: 'REC_CHECK_HQ_USR',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.pmd-verify-date" : 'lbl.port-audit-date'} />,// PMD审核日期
            dataIndex: 'recordCheckPmdDate',
            align:'left',
            sorter: false,
            key: 'REC_CHECK_HQ_DTE',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.finance-state" : 'lbl.share-core-state'} />,// 财务审核状态
            dataIndex: 'checkFadStatus',
            align:'left',
            sorter: false,
            key: 'CHECK_FAD_STATUS',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.finance-people" : 'lbl.share-core-people'} />,// 财务审核人
            dataIndex: 'recordCheckFadUser',
            align:'left',
            sorter: false,
            key: 'REC_CHECK_FAD_USR',
            width: 120,
        },{
            title: <FormattedMessage id={header ? "lbl.finance-date" : 'lbl.share-core-date'} />,// 财务审核日期
            dataIndex: 'recordCheckFadDate',
            align:'left',
            sorter: false,
            key: 'REC_CHECK_FAD_DTE',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.operator" />,//操作人
            dataIndex: 'recordCreateUser',
            align:'left',
            sorter: false,
            key: 'REC_UPD_USR',
            width: 120
        },
    ]
    //表格文本
    const columnsAg=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'center',
            fixed: true,
            render:(text,record,index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip  title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={()=>deleteTableAg(record)} disabled={record.show?false:true}><CloseCircleOutlined style={{color:record.show?'red':'#ccc'}} /> </a> */}
                        <a onClick={() => {deleteTableAg(record, index)}} style={{color:'red'}}><CloseCircleOutlined/></a>  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={()=>editAgBtn(record,index,false)} style={{ cursor:'pointer'}}><FormOutlined /></a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={()=>editAgBtn(record,index,true)}><FileSearchOutlined /></a>
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => {journal(record)}}><SearchOutlined /></a>
                    </Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号码
            dataIndex: 'feeAgreementCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司代码
            dataIndex: 'companyCode',
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
            title: <FormattedMessage id="lbl.agent-described" />,//代理描述
            dataIndex: 'agencyDescription',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.headquarters-audit-State" />,//总部审核状态
            dataIndex: 'checkStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_CHECK_HQ_DTE',
        },
        {
            title: <FormattedMessage id="lbl.agency-audit-status" />,//代理审核状态
            dataType:checkStatus.values,
            dataIndex: 'checkAgencyStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_CHECK_HQ_DTE',
        },
        {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType:protocolStateData.values,
            dataIndex: 'agreementStatus',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGMT_STATUS',
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'fromDate',
            dataType:'dateTime',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE',
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'toDate',
            dataType:'dateTime',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE',
        },
        {
            title: <FormattedMessage id="lbl.productbility" />,//是否生产性
            dataType:socEmptyInd,
            dataIndex: 'prdIndicator',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-arithmetic" />,//记账算法
            dataType:accountsArithmetic,
            dataIndex: 'postCalculationFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-way" />,//记帐方式 
            dataType:accountsWay,
            dataIndex: 'postMode',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE',
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报帐
            dataIndex: 'sfSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType:yfBusiness,
            dataIndex: 'isBill',
            sorter: false,
            width: 120,
            align:'left',
            key:'IS_BILL' ,
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType:yfBusiness,
            dataIndex: 'isYt',
            sorter: false,
            width: 120,
            align:'left',
            key:'IS_YT',
        },
        {
            title: <FormattedMessage id="lbl.headquarters-audit-person" />,//总部审核人(PMD/FAD)
            dataIndex: 'recordCheckUserRepeat',
            sorter: false,
            width: 150,
            align:'left',
            key:'REC_CHECK_HQ_USR',
            render:(text,record)=>{
              return  <div>
                  {(record.recordCheckHqUser&&record.recordCheckFadUser)?text=(record.recordCheckFadUser+'/'+record.recordCheckHqUser):(record.recordCheckFadUser?text=record.recordCheckFadUser:text=record.recordCheckHqUser)}
              </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.headquarters-audit-date" />,//总部审核日期
            dataIndex: 'recordCheckFadDateRepeat',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_CHECK_HQ_DTE',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    {record.recordCheckFadDate? text = record.recordCheckFadDate:text = record.recordCheckHqDate}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.agency-audit-person" />,//代理审核人
            dataIndex: 'recordCheckAgencyUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_CHECK_AGENCY_USR',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    {text ? text : '!Error'}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.agency-verify-date" />,//代理审核日期
            dataIndex: 'recordCheckAgencyDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_CHECK_AGENCY_DTE',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    {text ? text.substring(0, 10) : '!Error'}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.last-modifier" />,//最后修改人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_UPD_USR'
        },
        {
            title: <FormattedMessage id="lbl.last-modification-date" />,//最后修改日期
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'REC_UPD_DTE'
        },
    ]
    
    const deleteTableAg = async(record) =>{//删除ag
        console.log(adHeaderData)
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                let result = await request($apiUrl.PRECALC_AGENCY_DELETE_HEAD_UUID,{
                    method:"POST",
                    data:{
                        params: {
                            agmtHeadUuid : record.agHeadUuid,
                            preId: adHeaderData.prepareId
                        }
                    }
                })
                if(result.success) {
                    pageChangeAg(pageAg);
                    Toast('', result.message, 'alert-success', 5000, false);
                } else {
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    } 
    //搜搜佣金
	const pageChangeCr = async(pagination, options, search) => {
        console.log('佣金')
        Toast('', '', '', 5000, false);
        setLoading(true)
        const params = queryForms.getFieldsValue().search
        if(search){
            pagination.current=1
        }
        if(pagination.pageSize!=pageCr.pageSize){
            pagination.current=1
        }
        let sorter
        if(options&&options.sorter.order){
            sorter={
                "field": options.sorter.columnKey,
                "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
            }
        }
        const result=await request($apiUrl.PRECALC_AGMT_SEARCH_CALCHEADLIST,{
            method:"POST",
            data:{
                page: pagination,
                params: {
                    ...params,
                    fromDate:params.Date ? momentFormat(params.Date[0]) : undefined,
                    toDate:params.Date ? momentFormat(params.Date[1]) : undefined,
                    preId:adHeaderData&&adHeaderData.prepareId,
                    Date:undefined
                },
                sorter:sorter
            }
        })
        if(result.success){
            let data=result.data
            setCrList(data.resultList)
            setTabTotalCr(data.totalCount)
            dictionary(data.resultList,setCrList,protocolStateData.values,checkStatus.values)
            setPageCr({...pagination}) 
            setLoading(false)
        }else{
            setCrList([])
            setLoading(false)
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    const pageChangeAg = async(pagination, options, search) => {
        console.log('代理')
        Toast('', '', '', 5000, false);
        setLoading(true)
        const params = queryForms.getFieldsValue().search
        if(search){
            pagination.current=1
        }
        if(pagination.pageSize!=pageAg.pageSize){
            pagination.current=1
        }
        let sorter
        if(options&&options.sorter.order){
            sorter={
                "field": options.sorter.columnKey,
                "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
            }
        }
        const result=await request($apiUrl.PRECALC_AGENCY_SEARCH_PREHEAD_LIST,{
            method:"POST",
            data:{
                page: pagination,
                params: {
                    ...params,
                    fromDate:params.Date ? momentFormat(params.Date) : undefined,
                    toDate:params.Date ? momentFormat(params.Date) : undefined,
                    preId:adHeaderData&&adHeaderData.prepareId,
                    Date:undefined
                },
                sorter:sorter
            }
        })
        if(result.success){
            let data=result.data
            setAgList(data.resultList)
            setTabTotalAg(data.totalCount)
            setPageAg({...pagination})
            setLoading(false)
        }else{
            setAgList([])
            setLoading(false)
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    // 删除cr
    const deleteTableData = async(record,index) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.delete-code'}) + record.commissionAgreementCode + intl.formatMessage({id: 'lbl.de-data'}),
            okText: intl.formatMessage({id: 'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                const result = await request($apiUrl.PRECALC_AGMT_DELETE_HEAD_UUID,
                {
                    method:'POST',
                    data: {
                        params: {
                            preId: record.preId,
                            agmtHeadUuid: record.agreementHeadUuid,
                        },
                    }
                })
                if(result.success) {
                    pageChangeCr(page);
                    Toast('', result.message, 'alert-success', 5000, false);
                } else {
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    }
    const radioClick = (e) => {
        const event = e.target.value
        const search = queryForm.getFieldsValue().header
        if(search&&search.effectAllData){
            queryForm.setFieldsValue({
                header:{
                    effectAllData:undefined
                }
            })
            return
        }
        queryForm.setFieldsValue({
            header:{
                effectAllData:event
            }
        })
    }
    const commissionInit = {
        acquireData,        // 船东
        companysData,       // 公司
        agreement,          // 协议类型
        commission,         // 收取Cross Booking佣金
        pattern,            // Cross Booking模式
        paidCommissionModel,// setPaidCommissionModel第三地付费佣金模式
        accountsArithmetic, // 记账算法
        accountsWay,        // 记账方式
        ytBusiness,         // 预提是否记账
        yfBusiness,         // 应付实付是否记账 
        officeType: officeType.values,         // office类型 
        toPayInAdvance: toPayInAdvance.values,     // 预到付
        commissionBasedModel: commissionBasedModel.values,  // 佣金模式 
        calcMthd: calcMthd.values,           // 佣金计算方法 
        socEmptyInd: socEmptyInd.values,        // SOC空箱标记 
        vatFlag: vatFlag.values,            // 是否含税价 
        currCode: currCode.values,           // 币种
        isModalVisible,      // 弹窗控制
        setIsModalVisible,   // 弹窗控制
        tableData,      // 编辑查看详情数据
        commonFlag,     // 控制读写
        dateEnd,        // 结束时间
        addFlag,        // 判断是新建或者编辑查看
        setTableData,   // 编辑查看详情数据
        setAddFlag,     // 判断是新建或者编辑查看
        writeRead,      //区别新增编辑查看详情
        setWriteRead,   //区别新增编辑查看详情
        flag,           // 弹窗顶部button控制       
        setHeaderUuid,  // 头uuid
        headerUuid,     // 头uuid
        title,          // 头信息
        btnIdx,         // button状态
        stateFlags,     // 根据状态设置
    }
    const comEditBtn = async(record, index, flag) => {
        console.log(record)
        setLoading(true)
        // const result = await request($apiUrl.PRECALC_AGMT_SEARCH_CALCHEADDETAIL,       
        const result = await request($apiUrl.PRECALC_AGMT_SEARCH_CALCHEADLIST,       
            {
                method:'POST',
                data: {
                    params:{
                        agmtHeadUuid: record.agreementHeadUuid,
                        preId: record.preId,
                        id:record.id
                    }
                }
            }
        )
        console.log(result)
        if(result.success) {
            setAddFlag(flag);
            setCommonFlag(flag);
            setWriteRead(false);
            let data = result.data;
            let datas = result.data.resultList[0];
            setHeaderUuid(data.agreementHeadUuid);
            datas.postCalculationFlag = datas.postCalculationFlag + '';
            datas.postMode = datas.postMode + '';
            datas.isYt = datas.isYt + '';
            datas.isBill = datas.isBill + '';
            // console.log('number改成string类型', datas.postCalculationFlag);
            flag ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
            setFlag(flag);
            datas.afcmpreCommissionAgmtItems.map((v,i)=>{
                v.saveShowHide=false
            })
            setTableData(datas);
            setIsModalVisible(true);
            console.log(record.show, record)
            flag ? setStateFlag(false) : setStateFlag(record.show);
            setLoading(false)
        } else {
            Toast('', '', '', 5000, false);
            setLoading(false)
        }
    }
    const addEdit = {
        //新增传的数据
        toDate,//结束日期
        AIsModalVisible,//弹框开关
        setAIsModalVisible,
        itemFlag,//弹框item是否禁用
        setItemFlag,
        addData,//新增数据
        setAddData,//新增数据
        airlineFlag,//航线组新增按钮是否禁用
        setairlineFlag,//航线组新增按钮是否禁用
        buttonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        setButtonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        btnIndex, 
        companysData,
        //编辑传的数据
        compileData,
        setCompileData,
        flag,//表格删除保存新增是否禁用
        detailsFlag,//查看详情禁用
    }

    //编辑
    const editAgBtn = async(record,index,flag) => {
        console.log(record)
        console.log('代理编辑')
        //编辑是false,查看详情true
        Toast('','', '', 5000, false)
        setdetailsFlag(flag)
        setButtonFlag(flag)
        setLoading(true)
        let result= await request($apiUrl.PRECALC_AGENCY_SEARCH_PRE_HEAD_DETAIL,{
            method:"POST",
            data:{
                params: {
                    agmtHeadUuid : record.agHeadUuid,
                    preId: adHeaderData.prepareId
                }
            }
        })
        if(result.success){
            let data=result.data
            setLoading(false)
            setAIsModalVisible(true)
            setFlag(flag)
            if(!flag){
                setItemFlag(true)
                setairlineFlag(true)
            }else{
                setItemFlag(false)
                setairlineFlag(false)
            }
            // data.agreementHeadUuid=Number(data.agHeadUuid)
            data.agreementHeadUuid=data.agHeadUuid
            data.prdIndicator = data.prdIndicator+''
            data.postCalculationFlag = data.postCalculationFlag+''
            data.postMode = data.postMode+''
            data.isYt = data.isYt+''
            data.isBill = data.isBill+''
            setCompileData(data)
        }else{
            setLoading(false)
        }
    }
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
		setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
    }
    // 日志
    const journal = async(record,type) => {
        setIsModalVisibleLog(true);
        const result = await request($apiUrl.LOG_SEARCH_PRE_LIST,       
            {
                method:'POST',
                data: {
                    params: {
                        referenceType: type,//"AG_FEE_AGMT",
                        referenceUuid: record.agreementHeadUuid
                    }
                    
                }
            }
        )
        if(result.success) {
            setJournalData(result.data)
        }
    }
    const resetBtn = () =>{
        queryForms.resetFields()
        setCrList([]);
        setAgList([]);
    }
	return  <div className='parent-box'>
		<div className="header-from">
			<Form form={queryForm}>
				<Row>
					{/* 测算名称 */}
                    <CosInputText name={['header','prepareName']} disabled={calcCommonFlag} capitalized={false} label={<FormattedMessage id='lbl.calculation.name'/>} placeholder={intl.formatMessage({id:'lbl.calculation.name'})}/>
                    {/* 测算类型 */}
                    <CosSelect name={['header','hierarchyType']} disabled={calcCommonFlag} label={<FormattedMessage id='lbl.calculation.type'/>} options={calcType.values}/>
                    {/* 测算调整模式 */}
                    <CosSelect name={['header','prepareType']} flag={true} disabled={calcCommonFlag} label={<FormattedMessage id='lbl.calculation.model'/>} options={prepareData} placeholder={intl.formatMessage({id:'lbl.calculation.model'})}/>
                    {/* 测算数据开始时间 */}
                    <CosDatePicker name={['header','prepareStartDate']} disabled={calcCommonFlag} label={<FormattedMessage id="lbl.calculation.startTime" />} />
                    {/* 测算数据结束时间 */}
                    <CosDatePicker name={['header','prepareEndDate']} disabled={calcCommonFlag} label={<FormattedMessage id="lbl.calculation.endTime" />} />
                    {/* 代理公司 */}
                    <CosSelect showSearch={true} flag={true} name={['header','effectCompanyCode']} disabled={calcCommonFlag}  mode="multiple" label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData} placeholder={intl.formatMessage({id:'lbl.budgetTracking.companyCode'})} />
                    {/* 数据准备 */}
                    <CosRadio onClick={radioClick} name={['header','effectAllData']} label={<FormattedMessage id="lbl.calculation.dataPreparation" />} options={[{value:1,label:'按测算时间的全部数据',disabled:calcCommonFlag},{value:2,label:'上载数据',disabled:calcCommonFlag}]} />
				</Row>
			</Form>
			<div className='query-condition'><Button type="primary" onClick={() => {goBack()}}><FormattedMessage id='btn.calculation.back'/></Button> </div>
		</div>
        <div className='more-btn'>
			{/* 同步协议 */}
			<CosButton onClick={() => headerSubmit($apiUrl.PRECALC_SYNCPREAGMT)} icon={<ReloadOutlined />}><FormattedMessage id='btn.calculation.async'/></CosButton>
			{/* 保存修改 */}
			<CosButton onClick={() => headerAave()} icon={<FormOutlined />}><FormattedMessage id='btn.save' /></CosButton>
			{/* 提交测算 */}
			<CosButton onClick={() => headerSubmit($apiUrl.PRECALC_SUBMIT)} icon={<FileDoneOutlined />}><FormattedMessage id='btn.calculation.submit' /></CosButton>
			{/* 放弃测算任务 */}
			<CosButton onClick={() => deleteSubmit($apiUrl.PRECALC_DELETE)} icon={<CloseCircleOutlined />}><FormattedMessage id='btn.calculation.giveup' /></CosButton>
        </div>
		<div className="header-from">
			<Form form={queryForms}>
				<Row>
					{/* 船东 */}
					<CosSelect span={6} flag={true} name={['search','shipperOwner']} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values||[]}/>
					{/* 公司 */}
					<CosSelect showSearch={true} span={6} flag={true} name={['search','companyCode']} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
					{/* 协议号 */}
					<CosInputText capitalized={false} span={6} name={['search','agreementCode']} label={<FormattedMessage id='lbl.protocol'/>}/>
					{/* 代理编码 */}
					<CosInputText capitalized={false} span={6} name={['search','agencyCode']} label={<FormattedMessage id='lbl.agency'/>}/>
					{/* 协议状态 */}
					<CosSelect span={6} flag={true} name={['search','agreementStatus']} label={<FormattedMessage id='lbl.ProtocolState'/>} options={protocolStateData.values||[]}/>
					{/* 生效日期 */}
					<CosDoubleDatePicker disabled={[false, false]} span={6} name={['search','Date']} label={<FormattedMessage id="lbl.effective-date" />} />
				</Row>
			</Form>
		</div>
		<div className="main-button">
			<div className="button-left"/>
			<div className="button-right">
				<Button onClick={resetBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
				<Button onClick={() => {
                    const params = queryForm.getFieldsValue().header
                    if(params.hierarchyType=='Commission'){
                        pageChangeCr(pageCr,null,'search')
                    }else{
                        pageChangeAg(pageAg,null,'search')
                    }
                }}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
			</div>
		</div>
		<div className="footer-table budget-tracking" hidden={showFlag}>
                <CosPaginationTable
                    dataSource={crList}
                    columns={columnsCr}
                    rowKey='agreementHeadUuid'
                    pageSize={pageCr.pageSize}
                    current={pageCr.current}
                    pageChange={pageChangeCr}
                    scrollHeightMinus={380}
                    total={tabTotalCr}
                    rowSelection={null}/>
		</div>
        <div className="footer-table budget-tracking" hidden={showFlags}>
            <CosPaginationTable
                dataSource={agList}
                columns={columnsAg}
                rowKey='agHeadUuid'
                pageSize={10}
                pageChange={pageChangeAg}
                pageSize={pageAg.pageSize}
                current={pageAg.current}
                scrollHeightMinus={380}
                total={tabTotalAg}
                rowSelection={null}/>
		</div>
        <CrEdit initData={commissionInit}/>
        <AgEdit addEdit={addEdit}/>
        <LogPopUp  logData={logData} />
		<CosLoading spinning={loading}/>
	</div>
}
export default connect(({user,global}) =>({
	inits:global.inits
}))(CommissionAgmtEdits) ;