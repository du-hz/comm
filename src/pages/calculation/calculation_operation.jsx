import React,{useState, useEffect, $apiUrl} from 'react';
import { Form, Button, Row, Tabs, Modal,Tooltip  } from 'antd'
import {FormattedMessage,connect, useIntl} from 'umi'
import {CosDatePicker, CosInputText, CosSelect, CosButton, CosPaginationTable, CosLoading, CosRadio,CosDoubleDatePicker} from '@/components/Common/index'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast'
import { momentFormat,acquireSelectDatas,acquireSelectData,acquireSelectDataExtend,dictionary} from '@/utils/commonDataInterface';
import AdJustCalc from './AdjustCalc';
import LogPopUp from '../commissions/agmt/LogPopUp'
import CalcLogPopUp from './calculation_log'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import moment from 'moment';
import CrEdit from './cr_edit'
import AgEdit from './ag_edit'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    FileAddOutlined,//新增预算
    FileSearchOutlined,
    FormOutlined,
    SaveOutlined,//保存
    CloseCircleOutlined, //删除


	FileDoneOutlined,//保存
	FileProtectOutlined,//保存并提交审核
	ImportOutlined,//协议退回
    UnlockOutlined,//解锁
    ReadOutlined,
    FastBackwardOutlined,
} from '@ant-design/icons'
const { TabPane } = Tabs;
const confirm = Modal.confirm
const CalculationOperation = (props) => {
    const intl = useIntl();
    const [headForm] = Form.useForm();
    const [title, setTitle] = useState('');
    const [tableDatas,setTableDatas] = useState([])
    const [loading,setLoading] = useState(false)
    const [companysData,setCompanysData] = useState([])//公司
    const [adSPVisible,setAdSPVisible] = useState(false)
    const [status,setStatus] = useState({})
    const [prepareData,setPrepareData] = useState({})
    const [wOptions,setWoptions] = useState({})
    const [adSPData,setAdSPData] = useState({})
    const [tabTotal,setTabTotal] = useState(0)
    const [adType,setAdType] = useState('')
    const [prepareDefault,setPrepareDefault] = useState({})
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false)
    const [calcLogModal, setCalcLogMoadl] = useState(false)  //测算头日志
    const [journalData,setJournalData] = useState([])
    const [calcData,setCalcData] = useState([])  //测算头数据
    const [calcType,setCalcType] = useState({})  //测算类型
    // const [protocolStateData,setProtocolStateData] = useState({})//协议状态
    const [checkStatus,setCheckStatus] = useState({});//审核状态
    const [socEmptyInd, setSocEmptyInd] = useState({});  // SOC空箱标记 
    const [vatFlag, setVatFlag] = useState({});  // 是否含税价 
    const [currCode, setCurrCode] = useState({});  // 币种
    const [acquireData,setAcquireData] = useState({})//船东
    const [toPayInAdvance, setToPayInAdvance] = useState({});  // 预到付
    const [commissionBasedModel, setCommissionBasedModel] = useState({});  // 佣金模式 
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
    const [calcMthd, setCalcMthd] = useState({});  // 佣金计算方法 
    const [adHeaderData, setAdHeaderData] = useState({});  // 头信息 
    // const [agentCompany,setAgentCompany] = useState([]) //代理公司
    const [headFlag,setHeadFlag] = useState(false) //头部按钮是否可操作
    const [submitFlag,setSubmitFlag] = useState(false) //提交测算是否可操作
    const [saveFlag,setSaveFlag] = useState(false) //保存是否可操作
    const [agmentFlag,setAgmentFlag] = useState(false) //列表按钮
    const [editRecord, setEditRecord] = useState(true); // 储存编辑数据
    const [uploadEdit, setUploadEdit] = useState(false); // 更新-重调编辑
    const [tabFlag, setTabFlag] = useState(true); // tab禁用
    const [record, setRecord] = useState(''); 
    const [page, setPage]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    useEffect(()=>{
        getComPany()
        acquireSelectDatas('AFCMPRE.CALCULATE.PREPARETYPE',setPrepareData, $apiUrl,setPrepareDefault,'Number');// 测算模块- 算法调整模式
        acquireSelectDatas('AFCMPRE.CALCULATE.RUNSTATUS',setStatus, $apiUrl);// 测算模块- 测算状态
        acquireSelectData('BANLIE.SVC.HRCHY.TYPES',setCalcType, $apiUrl);// 测算类型
        // acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectData('AFCM.AGMT.CHECK.STATUS', setCheckStatus, $apiUrl);// 审核状态
        acquireSelectData('COMM.SOC.EMPTY.IND',setSocEmptyInd, $apiUrl);// SOC空箱标记
        acquireSelectData('AGMT.VAT.FLAG',setVatFlag, $apiUrl);// 是否含税价       
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE',setCurrCode, $apiUrl);// 币种   

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
        if(window.search){
            headForm.setFieldsValue({
                search:window.search
            })
            const wpage = window.page
            const wOptions = window.options
            pageChange(wpage,wOptions)
        }
        
    },[])
    useEffect(() => {   // 默认值
        // console.log(prepareDefault)
        headForm.setFieldsValue({
            search:{
                prepareType:prepareDefault.shipownerCompanyCode
            }
        })
    }, [prepareDefault])
    useEffect(() => {   // 重新调用编辑
        uploadEdit ? editComm(editRecord, false) : undefined;
    }, [uploadEdit])
    const columns = [
        { 
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            align:'center',
            width: 100,
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => {deleteRecord(record)}} style={{color:'red'}}><CloseCircleOutlined/></a>
                    </Tooltip>&nbsp;
                    {/* 调整协议 */}
                    <Tooltip title={<FormattedMessage id='btn.calculation.algo' />}>
                        <a onClick={() => {adParams(record)}}><FormOutlined/></a>
                    </Tooltip>&nbsp;
                    {/* 调整参数 */}
                    <Tooltip title={<FormattedMessage id='btn.calculation.adjustParams' />}>
                        <a onClick={() => {adSPModal(record)}}><SaveOutlined/></a>
                    </Tooltip>&nbsp;
                    {/* 查看差异 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.calculation.viewDiff' />}>
                        <a onClick={() => {viewException(record)}}><FileSearchOutlined/></a>
                    </Tooltip>&nbsp; */}
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.run.log'/>}>
                        <a onClick={() => {calcLodBtn(record)}}><SearchOutlined /></a>
                    </Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.calculation.name" />,//测算任务名称
            dataIndex: 'prepareName',
            width: 80,
        },{
            title: <FormattedMessage id="lbl.calculation.status" />,//测算状态
            dataIndex: 'runStatus',
            dataType:status.values,
            width: 60,
        },{
            title: <FormattedMessage id="lbl.calculation.type" />,//测算类型hierarchyType
            dataIndex: 'hierarchyType',
            width: 60,
        },{
            title: <FormattedMessage id="lbl.calculation.dataReady" />,//数据准备完成
            dataIndex: 'prepareDataDone',
            width: 90,
        },{
            title: <FormattedMessage id="lbl.calculation.logic" />,//逻辑准备完成
            dataIndex: 'prepareSpDone',
            width: 90,
        },{
            title: <FormattedMessage id="lbl.calculation.agReady" />,//算法准备完成
            dataIndex: 'prepareConfirmDone',
            width: 90,
        },{
            title: <FormattedMessage id="lbl.calculation.startTime" />,//测算数据开始时间
            dataIndex: 'prepareStartDate',
            // dataType:'dateTime',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.calculation.endTime" />,//测算数据结束时间
            dataIndex: 'prepareEndDate',
            // dataType:'dateTime',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.calculation.calucStartTime" />,//计算开始时间
            dataIndex: 'runStart',
            width: 90,
        },{
            title: <FormattedMessage id="lbl.calculation.finishTime" />,//计算完成时间
            dataIndex: 'runEnd',
            width: 90,
        },{
            title: <FormattedMessage id="lbl.calculation.timeConsuming" />,//耗时
            width: 40,
            render(text,record){
                const new_date = new Date(record.runStart); //新建一个日期对象，默认现在的时间
                const old_date = new Date(record.runEnd);
                const difftime = (old_date - new_date)/1000;
                const hours = difftime/3600
                return hours.toFixed(2) + intl.formatMessage({id:"lbl.calculation.hours"})
            }
        },{
            title: <FormattedMessage id="lbl.update-date" />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            width: 60,
        },{
            title: <FormattedMessage id="lbl.Update-users" />,//更新用户
            dataIndex: 'recordUpdateUser',
            width: 60,
        }
    ]
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
		setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
        key:'logId',
    }
    const calcLogData ={
        calcLogModal,
        setCalcLogMoadl,
        calcData,   
    }
    // 日志
    const calcLodBtn = async(record) => {
        setLoading(true)
        const result = await request($apiUrl.PRECALC_EXECUTEPRECALCLOG,       
            {
                method:'POST',
                data: {
                    uuid: record.prepareId
                }
            }
        )
        if(result.success) {
            setCalcLogMoadl(true);
            setCalcData(result.data)
            setLoading(false)
        }else{
            setLoading(false)
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    const getComPany = async() => {
        setLoading(true)
        const result=await request($apiUrl.PRECALC_GETCBSCOMPANYS,{
            method:"POST",
            data:{
                params: {},
            }
        })
        if(result.success){
            var data = result.data||[];
            data.map((val, idx)=> {
                val['value'] = val.companyCode;
                val['label'] = val.companyCode + '-' + val.companyName;
            })
            setCompanysData(data)
            setLoading(false)
        }else{
            setLoading(false)
        }
    }
    const pageChange = async(pagination, options, search) => {//查询
        Toast('', '', '', 5000, false);
        setLoading(true)
        const params = headForm.getFieldsValue().search
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        let sorter
        if(options&&options.sorter.order){
            sorter={
                "field": options.sorter.columnKey,
                "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
            }
        }
        const result=await request($apiUrl.PRECALC_SEARCHPRECALC,{
            method:"POST",
            data:{
                page: pagination,
                params: {
                    ...params,
                    // prepareStartDate: params.prepareStartDate ? momentFormat(params.prepareStartDate) : undefined,
                    // prepareEndDate:params.prepareEndDate ? momentFormat(params.prepareEndDate) : undefined,
                    prepareStartDate: params.calcDate?momentFormat(params.calcDate[0]):undefined,
                    prepareEndDate: params.calcDate?momentFormat(params.calcDate[1]):undefined,
                    effectCompanyCode:params.effectCompanyCode&&params.effectCompanyCode.split('-')[0],
                },
                sorter:sorter
            }
        })
        if(result.success){
            let data=result.data
            let datas = result.data.resultList
            datas.map((v,i)=>{
                if(v.prepareDataDone == '0'){v['prepareDataDone'] = '否'}else if(v.prepareDataDone == '1'){v['prepareDataDone'] = '是'}else{v['prepareDataDone'] = '否'}
                if(v.prepareSpDone == '0'){v['prepareSpDone'] = '否'}else if(v.prepareSpDone == '1'){v['prepareSpDone'] = '是'}else{v['prepareSpDone'] = '否'}
                if(v.prepareConfirmDone == '0'){v['prepareConfirmDone'] = '否'}else if(v.prepareConfirmDone == '1'){v['prepareConfirmDone'] = '是'}else{v['prepareConfirmDone'] = '否'}
            })
            setTableDatas(data.resultList)
            setLoading(false)
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setWoptions(options)
        }else{
            setTableDatas([])
            setLoading(false)
            Toast(result.errorMessage, '', 'alert-error', 5000, false);
        }
        
    }
    // const initData = {
    //     companysData,       // 公司
    //     prepareData:prepareData.values,//测算模块算法调整模式
    //     adHeaderData:{},
    // }
    // const viewException = (record) => {//查看差异
    //     window.exception = record
    //     props.history.push('/preCalc/search')
    // }
    const adParams = async(record) => {//调整参数
        console.log(record.effectAllData)
        Toast('', '', '', 5000, false);
        setCrList([])
        setAgList([])
        setLoading(true)
        setRecord(record)
        if(record.effectAllData == '2'){
            setTimeFlag(true)
        }else if(record.runStatus=="4" || record.runStatus=="8" || record.runStatus=="9"){
            setTimeFlag(true)
        }else{
            setTimeFlag(false)
        }
        //8已提交  0新建  9执行失败  4执行完成
        if(record.runStatus=="8" || record.runStatus=="9"){ 
            setHeadFlag(false)
            setSubmitFlag(true)
            setCalcCommonFlag(true)
            setAgmentFlag(false)
            setSaveFlag(true)
        }
        if(record.runStatus=="0"){ 
            setHeadFlag(false)
            setSubmitFlag(false)
            setCalcCommonFlag(false)
            setAgmentFlag(false)
            setSaveFlag(false)
        }
        if(record.runStatus=="4"){ 
            setHeadFlag(true)
            setSubmitFlag(true)
            setCalcCommonFlag(true)
            setAgmentFlag(true)
            setSaveFlag(true)
        }
        // if(record.runStatus=="3" && record.prepareSpDone=='0'){  //逻辑准备完成
        //     setHeadFlag(true)
        //     setSubmitFlag(true)
        //     setCalcCommonFlag(true)
        //     setAgmentFlag(true)
        // }
        if(record.hierarchyType=="Commission"){
            setShowFlag(false)
            setShowFlags(true)
        }else{
            setShowFlag(true)
            setShowFlags(false)
        }
        const result=await request($apiUrl.PRECALC_SEARCHBYID,{
            method:"POST",
            data:{
                uuid: record.prepareId
            }
        })
        let data=result.data
        if(result.success){
            setLoading(false)
            setTabFlag(false)
            setAdHeaderData(data)
                // if(data&&(data.runStatus==0||data.runStatus==9)){
                //     setCalcCommonFlag(false)
                // }else{
                //     setCalcCommonFlag(true)
                // }
                data.prepareType = String(data.prepareType)
                // console.log(data)
                let companys = []
                if(data.effectCompanies!=null){
                    data.effectCompanies.map((v,i)=>{
                        companys.push(v.effectCompanyCode )
                    })
                }
                queryForm.setFieldsValue({
                    header:{
                        ...data,
                        prepareStartDate: data.prepareStartDate ? moment(data.prepareStartDate) : null,
                        prepareEndDate: data.prepareEndDate ? moment(data.prepareEndDate) : null,
                        effectCompanyCode: companys
                    }
                })
            // initData['adHeaderData']=data//头信息
            // const params = headForm.getFieldsValue().search
            // window.search = params
            // window.page = page
            // window.options = wOptions
            // props.dispatch({
            //     type:'global/init',
            //     payload:initData
            // })
            setDefaultKey('2')
        }else{
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    const adSPInit = {
        adSPVisible,
        setAdSPVisible,
        title:title,
        record: adSPData,
        companysData,
        setLoading,
        pageChange,
        page,
        prepareData:prepareData.values||[],//测算模块算法调整模式
    }
    const adSPModal = (record) => {//调整算法
        // console.log(record)
        setAdSPData(record);
        setAdSPVisible(true);
        setAdType('adJust')
        setTitle(intl.formatMessage({id: 'lbl.calculation-adjust-algorithm'}))
    }
    const deleteRecord = (record) => {//删除
        Toast('', '', '', 5000, false);
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
                let result = await request($apiUrl.PRECALC_DELETE,{
                        method:'POST',
                        data: {
                            uuid: record.prepareId
                        }
                    })
                if(result.success) {
                    setLoading(false)
                    pageChange(page,wOptions);
                    Toast('', result.message, 'alert-success', 5000, false);
                } else {
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                    setLoading(false)
                }
            }
        })
    }
    const addCalculation = () => {
        Toast('', '', '', 5000, false);
        setAdSPVisible(true);
        setAdType('add')
        setAdSPData({});
        setTitle(intl.formatMessage({id: 'lbl.calculation-add-calc'}))
    }
    const radioClick = (e) => {
        const event = e.target.value
        const search = headForm.getFieldsValue().search
        if(event=='2'){
            setTimeFlag(true)
        }else{
            setTimeFlag(false)
        }
        if(search&&search.effectAllData){
            headForm.setFieldsValue({
                search:{
                    effectAllData:undefined
                }
            })
            return
        }
        headForm.setFieldsValue({
            search:{
                effectAllData:event
            }
        })
    }
    // ===============================================================================================================================
    {/* 佣金列表 */}
    const columnsCr=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 100,
            align:'center',
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => {deleteComm(record, index)}} disabled={record.show?false:true} style={{color:record.show?'red':'#ccc'}}><CloseCircleOutlined/></a>  删除 */}
                        <a onClick={() => {deleteComm(record, index)}} style={agmentFlag ? {color:'dove'} : {color:'red'}} disabled={agmentFlag}><CloseCircleOutlined/></a>  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => {editComm(record, false)}} disabled={agmentFlag}><FormOutlined/></a>  {/* 修改 */}
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => {editComm(record, true)}} ><FileSearchOutlined/></a>{/* 查看详情 */}
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => {readBtn(record,'PRE_COMM_AGMT')}} ><SearchOutlined /></a>
                    </Tooltip>
                </div>
            }
        },{
            title: <FormattedMessage id="lbl.agreement" />,//协议代码
            dataIndex: 'commissionAgreementCode',
            align:'left',
            sorter: true,
            key: 'COMM_AGMT_CDE',
            width: 70
        },{
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 50
        },{
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            align:'left',
            sorter: true,
            key: 'COMPANY_CDE',
            width: 50
        },{
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            align:'left',
            sorter: true,
            key: 'AGENCY_CDE',
            width: 65
        },{
            title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            sorter: true,
            key: 'COMPANY_NME_ABBR',
            width: 70
        },
        // {
        //     title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
        //     dataIndex: 'status',
        //     dataType: protocolStateData.values,
        //     align:'left',
        //     sorter: true,
        //     key: 'STATUS',
        //     width: 120,
        // },
        {
            title: <FormattedMessage id="lbl.effective-start-date" />,//有效开始日期
            dataIndex: 'fromDate',
            dataType:'dateTime',
            align:'left',
            sorter: true,
            key: 'FM_DTE',
            width: 95
        },{
            title: <FormattedMessage id="lbl.effective-end-date" />,//有效结束日期
            dataIndex: 'toDate',
            dataType:'dateTime',
            align:'left',
            sorter: true,
            key: 'TO_DTE',
            width: 95
        },{
            title: <FormattedMessage id="lbl.payment" />,//异地支付
            dataIndex: 'payElsewherePercent',
            dataType: 'dataAmount',
            align:'right',
            sorter: true,
            key: 'PAY_ELSEWHERE_PCT',
            width: 70
        },{
            title:<FormattedMessage id="lbl.off-site-commission" />,//第三地付费佣金模式
            dataIndex: 'payElsewhereMode',
            align:'left',
            sorter: true,
            key: 'PAY_ELSEWHERE_MDE',
            width: 130
        },{
            title: <FormattedMessage id="lbl.all-rate-OFT" />,//All in Rate的OFT比例
            dataIndex: 'allInRate',
            align:'left',
            sorter: true,
            key: 'ALL_IN_RATE',
            width: 135
        },
        // {
        //     title: <FormattedMessage id={header ? "lbl.agency-audit-status" : 'lbl.branch-audit-state'} />,// 代理审核状态
        //     dataIndex: 'checkAgencyStatus',
        //     align:'left',
        //     sorter: true,
        //     key: 'CHECK_AGENCY_STATUS',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.agency-audit-person" : 'lbl.branch-audit-person'} />,// 代理审核人
        //     dataIndex: 'recordCheckAgencyUser',
        //     align:'left',
        //     sorter: true,
        //     key: 'REC_CHECK_AGENCY_USR',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.agency-verify-date" : 'lbl.branch-audit-date'} />,// 代理审核日期
        //     dataIndex: 'recordCheckAgencyDate',
        //     align:'left',
        //     sorter: true,
        //     key: 'REC_CHECK_AGENCY_DTE',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.pmd-audit-status" : 'lbl.port-audit-state'} />,// PMD审核状态
        //     dataIndex: 'checkPmdStatus',
        //     align:'left',
        //     sorter: true,
        //     key: 'CHECK_HQ_STATUS',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.PMD-audit-person" : 'lbl.port-audit-person'} />,// PMD审核人
        //     dataIndex: 'recordCheckPmdUser',
        //     align:'left',
        //     sorter: true,
        //     key: 'REC_CHECK_HQ_USR',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.pmd-verify-date" : 'lbl.port-audit-date'} />,// PMD审核日期
        //     dataIndex: 'recordCheckPmdDate',
        //     align:'left',
        //     sorter: true,
        //     key: 'REC_CHECK_HQ_DTE',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.finance-state" : 'lbl.share-core-state'} />,// 财务审核状态
        //     dataIndex: 'checkFadStatus',
        //     align:'left',
        //     sorter: true,
        //     key: 'CHECK_FAD_STATUS',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.finance-people" : 'lbl.share-core-people'} />,// 财务审核人
        //     dataIndex: 'recordCheckFadUser',
        //     align:'left',
        //     sorter: true,
        //     key: 'REC_CHECK_FAD_USR',
        //     width: 120,
        // },{
        //     title: <FormattedMessage id={header ? "lbl.finance-date" : 'lbl.share-core-date'} />,// 财务审核日期
        //     dataIndex: 'recordCheckFadDate',
        //     align:'left',
        //     sorter: true,
        //     key: 'REC_CHECK_FAD_DTE',
        //     width: 120,
        // },
        {
            title: <FormattedMessage id="lbl.operator" />,//操作人
            dataIndex: 'recordCreateUser',
            align:'left',
            sorter: true,
            key: 'REC_UPD_USR',
            width: 60
        },
    ]
    {/* 代理列表 */}
    const columnsAg=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 100,
            align:'center',
            fixed: true,
            render:(text,record,index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip  title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={()=>deleteAg(record)} disabled={record.show?false:true}><CloseCircleOutlined style={{color:record.show?'red':'#ccc'}} /> </a> */}
                        <a onClick={() => {deleteAg(record, index)}} style={agmentFlag ? {color:'dove'} : {color:'red'}} disabled={agmentFlag}><CloseCircleOutlined/></a>  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={()=>editAgBtn(record,index,false)} style={{ cursor:'pointer'}} disabled={agmentFlag}><FormOutlined /></a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={()=>editAgBtn(record,index,true)} ><FileSearchOutlined /></a>
                    </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a onClick={() => {readBtn(record,'PRE_AG_FEE_AGMT')}} ><SearchOutlined /></a>
                    </Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号码
            dataIndex: 'feeAgreementCode',
            sorter: true,
            align:'left',
            width: 60,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 50
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
            width: 70,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.agent-described" />,//代理描述
            dataIndex: 'agencyDescription',
            sorter: true,
            width: 70,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        // {
        //     title: <FormattedMessage id="lbl.headquarters-audit-State" />,//总部审核状态
        //     dataIndex: 'checkStatus',
        //     sorter: true,
        //     width: 120,
        //     align:'left',
        //     key:'REC_CHECK_HQ_DTE',
        // },
        // {
        //     title: <FormattedMessage id="lbl.agency-audit-status" />,//代理审核状态
        //     dataType:checkStatus.values,
        //     dataIndex: 'checkAgencyStatus',
        //     sorter: true,
        //     width: 120,
        //     align:'left',
        //     key:'REC_CHECK_HQ_DTE',
        // },
        // {
        //     title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
        //     dataType:protocolStateData.values,
        //     dataIndex: 'agreementStatus',
        //     sorter: true,
        //     width: 120,
        //     align:'left',
        //     key:'AGMT_STATUS',
        // },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'fromDate',
            // dataType:'dateTime',
            sorter: true,
            width: 70,
            align:'left',
            key:'FM_DTE',
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'toDate',
            // dataType:'dateTime',
            sorter: true,
            width: 70,
            align:'left',
            key:'TO_DTE',
        },
        {
            title: <FormattedMessage id="lbl.productbility" />,//是否生产性
            dataType:socEmptyInd,
            dataIndex: 'prdIndicator',
            sorter: true,
            width: 85,
            align:'left',
            key:'PRD_IND',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-arithmetic" />,//记账算法
            dataType:accountsArithmetic.values,
            dataIndex: 'postCalculationFlag',
            sorter: true,
            width: 70,
            align:'left',
            key:'POST_CALC_FLAG',
        },
        {
            title: <FormattedMessage id="lbl.keep-account-way" />,//记帐方式 
            dataType:accountsWay.values,
            dataIndex: 'postMode',
            sorter: true,
            width: 70,
            align:'left',
            key:'POST_MODE',
        },
        {
            title: <FormattedMessage id="lbl.estimate" />,//向谁预估
            dataIndex: 'ygSide',
            sorter: true,
            width: 70,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: true,
            width: 70,
            align:'left',
            key:'YF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.submitanexpenseaccount" />,//向谁报帐
            dataIndex: 'sfSide',
            sorter: true,
            width: 70,
            align:'left',
            key:'SF_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.actually" />,//应付实付是否记账
            dataType:yfBusiness.values,
            dataIndex: 'isBill',
            sorter: true,
            width: 115,
            align:'left',
            key:'IS_BILL' ,
        },
        {
            title: <FormattedMessage id="lbl.withholding" />,//预提是否记账
            dataType:yfBusiness.values,
            dataIndex: 'isYt',
            sorter: true,
            width: 95,
            align:'left',
            key:'IS_YT',
        },
        // {
        //     title: <FormattedMessage id="lbl.headquarters-audit-person" />,//总部审核人(PMD/FAD)
        //     dataIndex: 'recordCheckUserRepeat',
        //     sorter: true,
        //     width: 150,
        //     align:'left',
        //     key:'REC_CHECK_HQ_USR',
        //     render:(text,record)=>{
        //       return  <div>
        //           {(record.recordCheckHqUser&&record.recordCheckFadUser)?text=(record.recordCheckFadUser+'/'+record.recordCheckHqUser):(record.recordCheckFadUser?text=record.recordCheckFadUser:text=record.recordCheckHqUser)}
        //       </div>
        //     }
        // },
        // {
        //     title: <FormattedMessage id="lbl.headquarters-audit-date" />,//总部审核日期
        //     dataIndex: 'recordCheckFadDateRepeat',
        //     sorter: true,
        //     width: 120,
        //     align:'left',
        //     key:'REC_CHECK_HQ_DTE',
        //     render:(text,record) => {
        //         return <div>
        //             {/* 修改框 */}
        //             {record.recordCheckFadDate? text = record.recordCheckFadDate:text = record.recordCheckHqDate}
        //         </div>
        //     }
        // },
        // {
        //     title: <FormattedMessage id="lbl.agency-audit-person" />,//代理审核人
        //     dataIndex: 'recordCheckAgencyUser',
        //     sorter: true,
        //     width: 120,
        //     align:'left',
        //     key:'REC_CHECK_AGENCY_USR',
        //     render:(text,record) => {
        //         return <div>
        //             {/* 修改框 */}
        //             {text ? text : '!Error'}
        //         </div>
        //     }
        // },
        // {
        //     title: <FormattedMessage id="lbl.agency-verify-date" />,//代理审核日期
        //     dataIndex: 'recordCheckAgencyDate',
        //     sorter: true,
        //     width: 120,
        //     align:'left',
        //     key:'REC_CHECK_AGENCY_DTE',
        //     render:(text,record) => {
        //         return <div>
        //             {/* 修改框 */}
        //             {text ? text.substring(0, 10) : '!Error'}
        //         </div>
        //     }
        // },
        {
            title: <FormattedMessage id="lbl.last-modifier" />,//最后修改人
            dataIndex: 'recordUpdateUser',
            sorter: true,
            width: 90,
            align:'left',
            key:'REC_UPD_USR'
        },
        {
            title: <FormattedMessage id="lbl.last-modification-date" />,//最后修改日期
            dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
            sorter: true,
            width: 100,
            align:'left',
            key:'REC_UPD_DTE'
        },
    ]
    const [queryForm] = Form.useForm();
    const [queryForms] = Form.useForm();
    const [crList,setCrList] = useState([]);
    const [tabTotalCr,setTabTotalCr] = useState(0)
    const [agList,setAgList] = useState([]);
    const [tabTotalAg,setTabTotalAg] = useState(0)
    const [defaultKey,setDefaultKey] = useState('1')  //默认选择tab
    const [showFlag, setShowFlag] = useState(true); // 根据测算类型显示不同列
    const [showFlags, setShowFlags] = useState(true); 
    const [header, setHeader] = useState(true);    // table表头切换
    const [tableData, setTableData] = useState({});     // 编辑查看详情数据
    const [timeFlag, setTimeFlag] =  useState(false)//时间禁用
    {/* 佣金 */}
    const [calcCommonFlag,setCalcCommonFlag] = useState(false)//头信息禁用
    const [headerUuid, setHeaderUuid] = useState('');
    const [addFlag, setAddFlag] = useState(true);   // 判断是新建或者编辑查看
    const [writeRead,setWriteRead] = useState(false);//区别新增编辑查看详情
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [stateFlags, setStateFlag] = useState(false);     // 根据状态设置
    const [dateEnd, setDateEnd] = useState();   // 结束时间
    const [btnIdx, setBtnIdx] = useState('');   // button状态
    const [flag, setFlag] = useState(false);
    {/* 代理 */}
    const [detailsFlag,setdetailsFlag] = useState(true);//查看详情禁用
    const [buttonFlag,setButtonFlag] = useState(false)//新增、编辑、查看详情的弹框按钮是否禁用
    const [AIsModalVisible, setAIsModalVisible] = useState(false);//ag新增编辑弹框开关
    const [itemFlag,setItemFlag] = useState (false);//弹框item是否禁用
    const [airlineFlag,setairlineFlag] = useState (false)//航线组新增按钮是否禁用
    const [compileData,setCompileData] = useState([]);//编辑数据
    const [toDate,setToDate] = useState ({});//结束时间
    const [addData,setAddData] = useState ([]);//新增初始化数据
    const [btnIndex, setBtnIndex] = useState('')
    const [pageAg, setPageAg]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    const [pageCr, setPageCr]=useState({    //分页
        current: 1,
        pageSize: 10
    })
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
        setUploadEdit,  // 调用重新编辑
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
    const callback = (key) => {
		Toast('', '', '', 5000, false);
		setDefaultKey(key);
        // setShowFlag(true)
        // setShowFlags(true)
        // queryForms.resetFields()
        // setCrList([]);
        // setAgList([]);
	}
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
    {/* 佣金删除 */}
    const deleteComm = async(record,index) => {
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
                setLoading(true)
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
                    setLoading(false)
                    pageChangeCr(page);
                    Toast('', result.message, 'alert-success', 5000, false);
                } else {
                    setLoading(false)
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    }
    {/* 佣金编辑/查看详情 */}
    const editComm = async(record, flag) => {
        Toast('', '', '', 5000, false);
        // console.log(record)
        setLoading(true)
        
        if (!flag) {
            setEditRecord(record);
            setUploadEdit(false);
        }
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
        // console.log(result)
        if(result.success) {
            setLoading(false)
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
            // console.log(record.show, record)
            // flag ? setStateFlag(false) : setStateFlag(record.show);
            flag ? setStateFlag(false) : setStateFlag(true);
        } else {
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    {/* 日志 */}
    const readBtn = async(record,type) => {
        Toast('', '', '', 5000, false);
        setLoading(true)
        const result = await request($apiUrl.LOG_SEARCH_PRE_LIST,       
            {
                method:'POST',
                data: {
                    params: {
                        referenceType: type,//"AG_FEE_AGMT",
                        referenceUuid: record.agreementHeadUuid,
                    }
                    
                }
            }
        )
        if(result.success) {
            setLoading(false)
            setJournalData(result.data)
            setIsModalVisibleLog(true);
        }else{
            Toast('',result.errorMessage, 'alert-error', 5000, false)
            setLoading(false)
        }
    }
    {/* 代理删除 */}
    const deleteAg = async(record) =>{
        // console.log(adHeaderData)
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setLoading(true)
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
                    setLoading(false)
                    pageChangeAg(pageAg);
                    Toast('', result.message, 'alert-success', 5000, false);
                } else {
                    setLoading(false)
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    } 
    {/* 代理编辑/查看明细 */}
    const editAgBtn = async(record,index,flag) => {
        // console.log(record)
        // console.log('代理编辑')
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
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    const headerSubmit = async(url,type) => { //提交测算  同步协议
        Toast('','', '', 5000, false)
        console.log(type)
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
            setLoading(false)
            pageChange(page)
            if(type == 'SUBMIT'){
                setCalcCommonFlag(true)
                setTimeFlag(true)
                setSubmitFlag(true)
                setSaveFlag(true)
                adParams(record)
            }
            const params = queryForm.getFieldsValue().header
            if(params.hierarchyType=='Commission'){
                pageChangeCr(pageCr)
            }else{
                pageChangeAg(pageAg)
            }
            Toast('',result.message||intl.formatMessage({id:'lbl.operate-success'}), 'alert-success', 5000, false)
        }else{
            Toast('',result.errorMessage, 'alert-error', 5000, false)
            setLoading(false)
        }
    }
    const headerAave = async() => { //保存修改
		Toast('','', '', 5000, false)
		setLoading(true)
		// const isEdit = props.match.params.id
        const params = queryForm.getFieldsValue().header
        // if(params.effectCompanyCode!=null){
            const companys = params.effectCompanyCode.map((item,index)=>{
                // console.log(item)
                return {effectCompanyCode: item}
            })
            // console.log(companys)
            // setAgentCompany(companys)
        // }
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
                        effectCompanies: companys,
					},
					// uuid:isEdit=='edit'?adHeaderData.prepareId:undefined
                }
            }
        )
        if(result.success) {
            setLoading(false)
            // setDefaultKey('1')
            pageChange(page)
            adParams(record)
            Toast('',result.message||intl.formatMessage({id:'lbl.save-successfully'}), 'alert-success', 5000, false)
        }else{
            Toast('',result.errorMessage, 'alert-error', 5000, false)
            setLoading(false)
        }
	}
    const deleteSubmit = async(url) => {//放弃测算任务
        if(!adHeaderData.prepareId){
			Toast('',intl.formatMessage({id:'preCalc.lackParams'}), 'alert-error', 5000, false)
			return 
        }
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.calculation-task'}),
            content: intl.formatMessage({id: 'lbl.calculation-task-tips'}),
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
                    setDefaultKey('1')
                    pageChange(page)
                    Toast('',result.message, 'alert-success', 5000, false)
                } else {
                    Toast('',result.errorMessage, 'alert-error', 5000, false)
                    setLoading(false)
                }
            }
        })
    }
    {/* 佣金查询 */}
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
                    fromDate: params.Date?momentFormat(params.Date[0]):null,
                    toDate: params.Date?momentFormat(params.Date[1]):null,
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
            // dictionary(data.resultList,setCrList,protocolStateData.values,checkStatus.values)
            setPageCr({...pagination}) 
            setLoading(false)
        }else{
            setCrList([])
            setLoading(false)
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 代理查询 */}
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
                    fromDate: params.Date?momentFormat(params.Date[0]):null,
                    toDate: params.Date?momentFormat(params.Date[1]):null,
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
    {/* 清除 */}
    const resetBtn = () =>{
        queryForms.resetFields()
        setTabFlag(true)
        setCrList([]);
        setAgList([]);
    }
    return <div className='parent-box'>
        <Tabs type="card" activeKey={defaultKey} onChange={callback}>
            <TabPane tab={<FormattedMessage id='lbl.calculation-head-info' />} key="1">
                <div className='header-from'>
                    <Form form={headForm} name='func'>
                        <Row>
                            {/* 测算名称 */}
                            <CosInputText name={['search','prepareName']} label={<FormattedMessage id='lbl.calculation.name'/>} capitalized={false} />
                            {/* 测算调整模式 */}
                            <CosSelect name={['search','prepareType']} flag={true} label={<FormattedMessage id='lbl.calculation.model'/>} options={prepareData.values} />
                            {/* 测算数据开始时间 */}
                            {/* <CosDatePicker name={['search','prepareStartDate']} label={<FormattedMessage id="lbl.calculation.startTime" />} /> */}
                            {/* 测算数据结束时间 */}
                            {/* <CosDatePicker name={['search','prepareEndDate']} label={<FormattedMessage id="lbl.calculation.endTime" />} /> */}
                            <DoubleDatePicker flag={false} name={['search','calcDate']} label={<FormattedMessage id='lbl.calculation.time'/>} isSpan={true} /> 
                            {/* 代理公司 */}
                            <CosSelect showSearch={true} flag={true} name={['search','effectCompanyCode']} label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData} />
                            {/* 数据准备 */}
                            {/* <CosRadio onClick={radioClick} name={['search','effectAllData']} label={<FormattedMessage id="lbl.calculation.dataPreparation" />} options={[{value:1,label:'按测算时间的全部数据'}]} /> */}
                        </Row>
                    </Form>
                    {/* 查询条件 */}
                    <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                </div>
                <div className='main-button'>
                    <div className='button-left'>
                        {/* 新增测算 */}
                        <CosButton onClick={() => {addCalculation()}} icon={<FileAddOutlined />}><FormattedMessage id='btn.calculation.add'/></CosButton>
                    </div>
                    <div className='button-right'>
                        {/* 重置 */}
                        <CosButton onClick={() => {
                            Toast('','', '', 5000, false)
                            headForm.resetFields()
                            setTableDatas([])
                            }} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></CosButton>
                        {/* 查询按钮 */}
                        <CosButton onClick={() => {pageChange(page, null, 'search')}} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></CosButton>
                    </div>
                </div>
                <div className="footer-table budget-tracking">
                    <CosPaginationTable
                        columns={columns}
                        dataSource={tableDatas}
                        rowKey='prepareId'
                        pageSize={page.pageSize}
                        current={page.current}
                        pageChange={pageChange}
                        total={tabTotal}
                        scrollHeightMinus={250}
                        rowSelection={null}/>
                </div>
            </TabPane>
            <TabPane  tab={<FormattedMessage id='lbl.calculation-details'/>} key="2" disabled={tabFlag}>
                <div className="header-from">
                    <Form form={queryForm}>
                        <Row>
                            {/* 测算名称 */}
                            <CosInputText name={['header','prepareName']} disabled={calcCommonFlag} capitalized={false} label={<FormattedMessage id='lbl.calculation.name'/>} placeholder={intl.formatMessage({id:'lbl.calculation.name'})}/>
                            {/* 测算类型 */}
                            <CosSelect name={['header','hierarchyType']} disabled label={<FormattedMessage id='lbl.calculation.type'/>} options={calcType.values}/>
                            {/* 测算调整模式 */}
                            <CosSelect name={['header','prepareType']} flag={true} disabled={calcCommonFlag} label={<FormattedMessage id='lbl.calculation.model'/>} options={prepareData.values} placeholder={intl.formatMessage({id:'lbl.calculation.model'})}/>
                            {/* 测算数据开始时间 */}
                            <CosDatePicker name={['header','prepareStartDate']}  disabled={timeFlag} label={<FormattedMessage id="lbl.calculation.startTime" />} />
                            {/* 测算数据结束时间 */}
                            <CosDatePicker name={['header','prepareEndDate']}  disabled={timeFlag} label={<FormattedMessage id="lbl.calculation.endTime" />} />
                            {/* 代理公司 */}
                            <CosSelect showSearch={true} flag={true} name={['header','effectCompanyCode']} disabled={calcCommonFlag}  mode="multiple" label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData} placeholder={intl.formatMessage({id:'lbl.budgetTracking.companyCode'})} />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {/* 数据准备 */}
                            <CosRadio onClick={radioClick} name={['header','effectAllData']} label={<FormattedMessage id="lbl.calculation.dataPreparation" />} options={[{value:1,label:intl.formatMessage({id: 'lbl.calculation-choose-radio'}),disabled:calcCommonFlag},{value:2,label:intl.formatMessage({id: 'lbl.calculation-upload-data'}),disabled:calcCommonFlag}]} />
                        </Row>
                    </Form>
                    {/* <div className='query-condition'><Button type="primary" onClick={() => {goBack()}}><FormattedMessage id='btn.calculation.back'/></Button> </div> */}
                </div>
                <div className='more-btn'>
                    {/* 同步协议 */}
                    <CosButton onClick={() => headerSubmit($apiUrl.PRECALC_SYNCPREAGMT,'SYNCPREAGMT')} disabled={headFlag} icon={<ReloadOutlined />} ><FormattedMessage id='btn.calculation.async'/></CosButton>
                    {/* 保存修改 */}
                    <CosButton onClick={() => headerAave()} disabled={saveFlag} icon={<SaveOutlined />}><FormattedMessage id='btn.save' /></CosButton>
                    {/* 提交测算 */}
                    <CosButton onClick={() => headerSubmit($apiUrl.PRECALC_SUBMIT,'SUBMIT')} disabled={submitFlag} icon={<FileDoneOutlined />}><FormattedMessage id='btn.calculation.submit' /></CosButton>
                    {/* 放弃测算任务 */}
                    <CosButton onClick={() => deleteSubmit($apiUrl.PRECALC_DELETE)} disabled={headFlag} icon={<CloseCircleOutlined />}><FormattedMessage id='btn.calculation.giveup' /></CosButton>
                </div>
                <div className="header-from">
                    <Form form={queryForms}>
                        <Row>
                            {/* 船东 */}
                            <CosSelect span={6} flag={true} name={['search','shipperOwner']} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/>
                            {/* 公司 */}
                            <CosSelect showSearch={true} span={6} flag={true} name={['search','companyCode']} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
                            {/* 协议号 */}
                            <CosInputText capitalized={false} span={6} name={['search','agreementCode']} label={<FormattedMessage id='lbl.protocol'/>}/>
                            {/* 代理编码 */}
                            <CosInputText capitalized={false} span={6} name={['search','agencyCode']} label={<FormattedMessage id='lbl.agency'/>}/>
                            {/* 协议状态 */}
                            {/* <CosSelect span={6} flag={true} name={['search','agreementStatus']} label={<FormattedMessage id='lbl.ProtocolState'/>} options={protocolStateData.values}/> */}
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
            </TabPane>
        </Tabs>
        <AdJustCalc adJustData={adSPInit} adType={adType}/>{/* 新增测算、算法调整 */}
        <LogPopUp  logData={logData} />{/*日志 */}
        <CalcLogPopUp  calcLogData={calcLogData} />{/*测算头-日志 */}
        <CosLoading spinning={loading}/>
        <CrEdit initData={commissionInit}/> {/* 佣金 */}
        <AgEdit addEdit={addEdit}/> {/* 代理 */}
    </div>
}
export default connect()(CalculationOperation);