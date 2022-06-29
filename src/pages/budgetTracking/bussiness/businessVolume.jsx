import React,{useState, useEffect, $apiUrl,$menuRender} from 'react';
import { Form, Button, Row, Tabs, Modal,Tooltip,InputNumber,Col,Input,Select  } from 'antd'
import {FormattedMessage, formatMessage,connect,useIntl} from 'umi'
import {CosDatePicker,CosInputText,CosSelect,CosButton,CosPaginationTable,CosLoading} from '@/components/Common/index'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast'
import {formlayout2} from '@/utils/commonLayoutSetting'
import { acquireCompanyData, trackingAgencyList, momentFormat,acquireSelectDataExtend } from '@/utils/commonDataInterface';
import {CosToast}  from '@/components/Common/index'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import CosModal from '@/components/Common/CosModal'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileAddOutlined,//新增预算
    SaveOutlined,//保存
    CloseCircleOutlined, //删除
    FileProtectOutlined, //提交
    FileSearchOutlined, 
    FormOutlined,
} from '@ant-design/icons'
const { TabPane } = Tabs;
const { Option } = Select;
const confirm = Modal.confirm
const BussinessVolume = (props) => {
    const [queryForm] = Form.useForm();
    const [exchangeRate,setExchangeRate] = useState([])
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode,setAgencyCode] = useState([])
    const [loading,setLoading] = useState(false)
    const [infoTips, setInfoTips] = useState({});   //message info
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [txt, setTxt] = useState(''); //弹窗标题
    const [tableData,setTableData] = useState([])  //数据
    const [defaultKeys, setDefaultKeys] = useState('1');  //Tab key
    const [rateNum,setRateNum] = useState() //汇率
    const [defaultRate,setDefaultRate] = useState('0')
    const [uid,setUid] = useState({})
    const [tabFlag, setTabFlag] = useState(true); // tab禁用
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [tabTotal,setTabTotal ] = useState([]) // table条数
    useEffect(()=>{
        acquireCompanyData(setCompanysData, $apiUrl);   // 公司
        trackingAgencyList({apiUrl:$apiUrl,companyCode:2000}, setAgencyCode);     // 代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
    },[])
    useEffect(()=>{
        queryForm.setFieldsValue({
            search:{
                // companyCode:props.currentUser.companyCode+'-'+props.currentUser.companyNameCn,
                shipownerCompanyCode: acquireData.defaultValue
            }
        })
    },[acquireData])
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'center',
            fixed: false,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => {deleteBtn(record)}} style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => {searchDetail(record)}}><FormOutlined/></a>&nbsp; 
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.afcm-002'/>,//业务开始时间   
            dataIndex: 'fromMonthDate',
            dataType: 'dateTime',
            sorter: false,
            width: 90,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.afcm-003'/>,//业务结束时间   
            dataIndex: 'toMonthDate',
            dataType: 'dateTime',
            sorter: false,
            width: 90,
            align:'left', 
        },  {
            title: <FormattedMessage id='lbl.carrier'/>,//船东   
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 50,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.company'/>,//公司   
            dataIndex: 'companyCode',
            sorter: false,
            width: 50,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.business-submit-time'/>,//第几次提交   
            dataIndex: 'predictSubmit',
            sorter: false,
            width: 90,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.update-date'/>,//更新时间   
            dataIndex: 'recordUpdateDatetime',
            // dataType: 'dateTime',
            sorter: false,
            width: 60,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.update-by'/>,//更新用户   
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 60,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.state'/>,//状态   
            dataIndex: 'status',
            sorter: false,
            width: 40,
            align:'left', 
        },
    ]
    // 佣金
    const crColumns = [
        { 
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            align:'center',
            width: 60,
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => {deleteRecord(record)}} style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}>
                        <a onClick={() => {saveRecord(record)}}><SaveOutlined/></a>
                    </Tooltip>
                </div>
            }
        },
        // {
        //     title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
        //     dataIndex: 'monthDate',
        //     align:'center',
        //     width: 120,
        //     render:()=>{
        //         return saveHeader&&saveHeader.monthDate.split(' ')[0]
        //     }
        // },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            width: 50,
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            align:'left',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'companyCode',
            align:'left',
            width: 60,
        },
        {
            title: 'COMM_TYPE',//COMM_TYPE
            dataIndex: 'chargeCode',
            align:'left',
            width: 100,
        },
        {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'chargeCodeName',
            align:'left',
            width: 60,
        },
        {
            title: 'POR,FND',//POR,FND
            dataIndex: 'porFnd',
            align:'left',
            width: 70,
        },
        {
            title: <FormattedMessage id="lbl.To-pay-in-advance" />,//预到付
            dataIndex: 'oftPc',
            align:'left',
            width: 50,
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.empty-box" />,//空箱
            dataIndex: 'socEmptyIndicator',
            align:'left',
            width: 40,
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.type-goods" />,//货物类型
            dataIndex: 'cargoNatureCode',
            align:'left',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currency',
            align:'left',
            width: 40,
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.agment-num" />,//佣金协议编号
            dataIndex: 'commissionAgreementCode',
            align:'left',
            width: 100,
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            align:'left',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.agreement-rate" />,//协议费率
            dataIndex: 'price',
            dataType: 'dataAmount',
            align:'right',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.price-unit" />,//价格单位
            dataIndex: 'priceUnit',
            align:'left',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.expected-amount" />,//预期金额
            align:'center',
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    width: 80,
                    dataIndex:'predictAmount1',
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    width: 80,
                    dataIndex:'predictAmount2',
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    width: 80,
                    dataIndex:'predictAmount3',
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    width: 80,
                    dataIndex:'predictAmount4',
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    width: 80,
                    dataIndex:'predictAmount5',
                    align:'right',
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.business-volume" />,//预期计算单位--预期业务量
            align:'center',
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    dataIndex: 'predictSubmit',
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit == 1
                            ?<InputNumber defaultValue={record.predictVol1} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol1', index, 'predictAmount1')} />
                            :record.predictVol1
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit == 2
                            ?<InputNumber defaultValue={record.predictVol2} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol2', index,'predictAmount2')} />
                            :record.predictVol2
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit == 3
                            ?<InputNumber defaultValue={record.predictVol3} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol3', index,'predictAmount3')} />
                            :record.predictVol3
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit == 4
                            ?<InputNumber defaultValue={record.predictVol4} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol4', index,'predictAmount4')} />
                            :record.predictVol4
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit == 5
                            ?<InputNumber defaultValue={record.predictVol5} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol5', index,'predictAmount5')} />
                            :record.predictVol5
                    }
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            align:'left',
            width: 60,
        },
        {
            title: <FormattedMessage id="lbl.Update-users" />,//更新用户
            dataIndex: 'recordUpdateUser',
            align:'left',
            width: 60,
        }
    ]
    // 代理
    const agColumns = [
        { 
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            align:'center',
            width: 60,
            fixed: true,
            render:(text,record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => {deleteRecord(record)}} style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}>
                        <a onClick={() => {saveRecord(record)}}><SaveOutlined/></a>&nbsp;  {/* 删除 */}
                    </Tooltip>
                </div>
            }
        },
        // {
        //     title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
        //     dataIndex: 'trackingDte',
        //     width: 120,
        //     render:()=>{
        //         return saveHeader&&saveHeader.monthDate.split(' ')[0]
        //     }
        // },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            width: 50,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'companyCode',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'heryCode',
            width: 60,
            align:'left',
        },
        {
            title: 'FEE_TYPE',//FEE_TYPE
            dataIndex: 'chargeCode',
            width: 70,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'chargeCodeName',
            width: 80,
            align:'left',
        },
        {
            title: 'HERY_TYPE',//HERY_TYPE
            dataIndex: 'heryType',
            width: 100,
            align:'left',
        },
        {
            title: 'HERY_CDE',//HERY_CDE
            dataIndex: 'heryCode',
            width: 70,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.ship-marking" />,//船舶标记
            dataIndex: 'vesselIndicator',
            width: 80,
            align:'left',
        },
        {
            title: 'SVC_GRP',//SVC_GRP
            dataIndex: 'serviceGroup',
            width: 80,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.empty-box" />,//空箱
            dataIndex: 'emptyFullIndicator',
            width: 40,
            align:'left',
        },
        {
            title: 'TRANSMIT_IND',//TRANSMIT_IND
            dataIndex: 'transmitIndicator',
            width: 100,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.type-goods" />,//货物类型
            dataIndex: 'cargoNatureCode',
            width: 80,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.own-box" />,//自有箱
            dataIndex: 'socIndicator',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.ccy" />,//币种
            dataIndex: 'currency',
            width: 40,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.calculation-agment-id" />,//代理协议编号
            dataIndex: 'feeAgmtCode',
            width: 90,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法
            dataIndex: 'calculationMethod',
            width: 80,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.price" />,//价格
            dataIndex: 'price',
            width: 40,
            align:'right',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.price-unit" />,//价格单位
            dataIndex: 'priceUnit',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.expected-amount" />,//预期金额
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    width: 80,
                    align:'right',
                    dataIndex:'predictAmount1'
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    width: 80,
                    align:'right',
                    dataIndex:'predictAmount2'
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    width: 80,
                    align:'right',
                    dataIndex:'predictAmount3',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    width: 80,
                    align:'right',
                    dataIndex:'predictAmount4'
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    width: 80,
                    align:'right',
                    dataIndex:'predictAmount5'
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.unit-account" />,//预期计算单位--预期业务量
            dataIndex: 'priceUnit',
            width: 90,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.business-volume" />,//预期业务量
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit==1
                            ?<InputNumber defaultValue={record.predictVol1} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol1', index,'predictAmount1')} />
                            :record.predictVol1
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit==2
                            ?<InputNumber defaultValue={record.predictVol2} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol2', index,'predictAmount2')} />
                            :record.predictVol2
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit==3
                            ?<InputNumber defaultValue={record.predictVol3} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol3', index,'predictAmount3')} />
                            :record.predictVol3
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit==4
                            ?<InputNumber defaultValue={record.predictVol4} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol4', index,'predictAmount4')} />
                            :record.predictVol4
                    }
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    width: 80,
                    render:(text,record,index)=>{
                        return saveHeader&&saveHeader.predictSubmit==5
                            ?<InputNumber defaultValue={record.predictVol5} min={0} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'predictVol5', index,'predictAmount5')} />
                            :record.predictVol5
                    }
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            width: 80,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Update-users" />,//更新用户
            dataIndex: 'recordUpdateUser',
            width: 80,
            align:'left',
        },
    ]
    {/* 查询 */}
    const pageChange = async(pagination,query) =>{
        Toast('','', '', 5000, false)
        const params = queryForm.getFieldsValue().search
        if(query){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        if(!params.companyCode){
            Toast('',intl.formatMessage({id: "lbl.business-company-search"}), 'alert-error', 5000, false)
            return
        }
        setLoading(true)
        let result = await request($apiUrl.BUDGET_TRACKING_SEARCH_HEAD_LIST,{
            method:"POST",
            data:{
                page: pagination,
                params:{
                    shipownerCompanyCode : params.shipownerCompanyCode,
                    // rate : params.rate,
                    companyCode: params.companyCode&&params.companyCode.split('-')[0],
                    fromDate: params.trackingDte?momentFormat(params.trackingDte[0]):null,
                    toDate: params.trackingDte?momentFormat(params.trackingDte[1]):null,
                }
            }
        })
        let data = result.data
        if(result.success) {
            let datas = result.data.resultList
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
            // setExchangeRate(result.data.exchangeRate)
            // if(result.data.exchangeRate=[]){
            //     setLoading(false)
            //     return
            // }
            // else{
            //     queryForm.setFieldsValue({
            //         search:{
            //             rate:result.data.exchangeRate[0].rate
            //         }
            //     })
            // }
            setLoading(false)
        }else{
            setTableData([])
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }

    {/* 删除 */}
    const deleteBtn = async(record) => {
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.delete.select.content'}),
            okText: intl.formatMessage({id: 'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setLoading(true)
                confirmModal.destroy()
                let result = await request($apiUrl.BUDGET_TRACKING_DELETE_DATA,{
                        method:'POST',
                        data: {
                            uuid: record.budgetUuid
                        }
                    })
                if(result.success) {
                    setLoading(false)
                    pageChange(page);
                    Toast('',result.message, 'alert-success', 5000, false)
                } else {
                    Toast('', result.errorMessage, 'alert-error', 5000, false);
                    setLoading(false)
                }
            }
        })
    }
    const selectChangeBtn = (value, all) => {
		trackingAgencyList({apiUrl:$apiUrl,companyCode:value.split('-')[0]}, setAgencyCode);     // 代理编码
	}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        setTabFlag(true)
        queryForm.resetFields();
        setTableData([])
        queryForm.setFieldsValue({
            search:{
                // companyCode:props.currentUser.companyCode+'-'+props.currentUser.companyNameCn,
                shipownerCompanyCode: acquireData.defaultValue
            }
        })
    }
    {/* 取消 */}
    const handleCancel = () => {
        setInfoTips({});
        setIsModalVisible(false)
        queryForm.setFieldsValue({
            popData: null
        })
    }
    {/* 新增测算 */}
    const createCr = async() => {
        Toast('', '', '', 5000, false);
        setLoading(true)
        setInfoTips({})
        setTxt(intl.formatMessage({id:'btn.businessvolume.add'})); 
        queryForm.setFieldsValue({
            popData: null
        })
        setTimeout(()=>{
            setLoading(false)
            setIsModalVisible(true);
        } ,500);
    }
    const handleSave = async() => {
        setInfoTips({})
        const params = queryForm.getFieldsValue().popData
        if(!params.trackingDte && !params.shipownerCompanyCode && !params.companyCode){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.business-volum-save'})});
            return
        }
        setLoading(true)
        const result = await request($apiUrl.BUDGET_TRACKING_CREATE_POST,       
            {
                method:'POST',
                data: {
                    params: {
                        companyCode: params.companyCode&&params.companyCode.split('-')[0],
                        shipownerCompanyCode: params.shipownerCompanyCode,
                        fromDate: params.trackingDte?momentFormat(params.trackingDte[0]):null,
                        toDate: params.trackingDte?momentFormat(params.trackingDte[1]):null,
                    }
                }
            }
        )
        if(result.success) {
            let data = result.data
            // setTableData(data.header)
            // setExchangeRate(result.data.exchangeRate)
            // if(result.data.exchangeRate=[]){
            //     Toast('',result.message||formatMessage({id:'lbl.operate-success'}), 'alert-success', 5000, false)
            //     setLoading(false)
            //     return
            // }
            // else{
            //     queryForm.setFieldsValue({
            //         search:{
            //             rate:result.data.exchangeRate[0].rate
            //         }
            //     })
            // }
            Toast('',result.message||intl.formatMessage({id:'lbl.operate-success'}), 'alert-success', 5000, false)
            setLoading(false)
            setIsModalVisible(false)
            pageChange(page)
        }else{
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    {/* 查看预估明细 */}
    const searchDetail = async(record) => {
        Toast('', '', '', 5000, false);
        setLoading(true)
        setUid(record)
        const result=await request($apiUrl.BUDGET_TRACKING_SEARCH_DETAIL,{
            method:"POST",
            data:{
                params: {
                    headerId: record.budgetUuid
                }
            }
        })
        if(result.success){
            setTabFlag(false)
            setLoading(false)
            setDefaultKeys('2')
            let data = result.data
            setExchangeRate(data.exchangeRate)
            setAgList(data.ag)
            setCrList(data.cr)
            setSaveHeader(data.header)
            if(data.exchangeRate!=null){
                setDefaultRate(data.exchangeRate[0] && data.exchangeRate[0].detailUuid)
            }
            // props.history.push('/budgetTracking/volume/businessDetail')
        }else{
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    {/* 回调 */}
    const callback = (key) => {
		Toast('', '', '', 5000, false);
		setDefaultKeys(key);
	}
    {/* 明细保存 */}
    const saveData = async() => {
        Toast('','', '', 5000, false)
        setLoading(true)
        let result
        if(defaultKey == '1'){
            if(crList.length==0){
                setLoading(false)
                Toast('',intl.formatMessage({id: "lbl.business-warn"}), 'alert-error', 5000, false)
                return
            }
            result = await request($apiUrl.BUDGET_TRACKING_SAVECRDATA_POST,{
                method:"POST",
                data:{
                    paramsList:crList,
                    uuid:saveHeader.budgetUuid,
                }
            })
        }else{
            if(agList.length==0){
                setLoading(false)
                Toast('',intl.formatMessage({id: "lbl.business-warn"}), 'alert-error', 5000, false)
                return
            }
            result = await request($apiUrl.BUDGET_TRACKING_SAVEAGDATA_POST,{
                method:"POST",
                data:{
                    paramsList:agList,
                    uuid:saveHeader.budgetUuid,
                }
            })
        }
        
        if(result.success) {
            searchDetail(uid);
            Toast('',result.message, 'alert-success', 5000, false)
            setLoading(false)
        }else{
            Toast('',result.errorMessage, 'alert-error', 5000, false)
            setLoading(false)
        }
    }
    {/* 提交 */}
    const submitCr = async() => {
        Toast('','', '', 5000, false)
        setLoading(true)
        if(!saveHeader){
            setLoading(false)
            Toast('',intl.formatMessage({id: "lbl.business-warn"}), 'alert-error', 5000, false)
            return
        }
        const result = await request($apiUrl.BUDGET_TRACKING_SUBMIT_POST,{
            method:"POST",
            data:{
                uuid:saveHeader.budgetUuid
            }
        })
        if(result.success){
            setLoading(false)
            setSaveHeader(undefined)
            searchDetail(uid);
            Toast('',intl.formatMessage({id: "lbl.operate-success"}), 'alert-success', 5000, false)
        }else{
            Toast('',result.errorMessage, 'alert-error', 5000, false)
            setLoading(false)
        }
    }
    const [defaultKey,setDefaultKey] = useState('1')
    const [crList,setCrList] = useState([])  //佣金数据
    const [agList,setAgList] = useState([])  //代理费数据
    const [saveHeader,setSaveHeader] = useState(undefined)
    const tabsChange = (activeKey) => {
        setLoading(true);
        setDefaultKey(activeKey)
        if(activeKey==1 && crList.length==0){
            setLoading(false);
        }else if(activeKey==2 && agList.length==0){
            setLoading(false);
        }else{ 
            setTimeout(()=>{
                setLoading(false);
            } ,1000);
        }
    }
    const getCommonIptVal = (e, record, name, index, mount) => {
        record[name] = e
        const predictAmount = record.price * e
        record[mount] = predictAmount.toFixed(6)
        if(defaultKey == '1'){
            crList[index] = record
            setCrList([...crList])
        }else{
            agList[index] = record
            setAgList([...agList])
        }
	}
    {/* 明细--删除 */}
    const deleteRecord = async(record) => {//删除CR单行
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.delete.select.content'}),
            okText: intl.formatMessage({id: 'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setLoading(true)
                confirmModal.destroy()
                let result
                if(defaultKey == '1'){
                    result = await request($apiUrl.BUDGET_TRACKING_DELETECR_RECORD_POST,{
                        method:'POST',
                        data: {
                            uuid: record.itemUuid
                        }
                    })
                }else{
                    result = await request($apiUrl.BUDGET_TRACKING_DELETEAG_RECORD_POST,{
                        method:'POST',
                        data: {
                            uuid: record.itemUuid
                        }
                    })
                }
                if(result.success) {
                    setLoading(false)
                    searchDetail(record);
                    Toast('', result.message, '', 5000, false);
                } else {
                    Toast('', result.errorMessage, '', 5000, false);
                    setLoading(false)
                }
            }
        })
    }

    {/* 明细---保存 */}
    const saveRecord = async(record) => {//保存CR单行
        Toast('','', '', 5000, false)
        setLoading(true)
        let result
        if(defaultKey == '1'){
            result = await request($apiUrl.BUDGET_TRACKING_SAVECR_RECORD_POST,{
                method:"POST",
                data:{
                    params:record
                }
            })
        }else{
            result = await request($apiUrl.BUDGET_TRACKING_SAVEAG_RECORD_POST,{
                method:"POST",
                data:{
                   params:record
                }
            })
        }
        if(result.success) {
            searchDetail(record);
            Toast('',result.message||intl.formatMessage({id: "lbl.operate-success"}), 'alert-success', 5000, false)
            setLoading(false)
        }else{
            setLoading(false)
        }
    }
    const rateChange = (e) => {
        let rate
        exchangeRate.map((item,index) => {
            if(item.detailUuid == e){
                rate = item.rate
            }
        })
        setRateNum(rate)
    }
    return  <div className='parent-box'>
        <Tabs type="card" activeKey={defaultKeys} onChange={callback}>
                <TabPane tab={<FormattedMessage id='lbl.budgetTracking-tab-name' />} key="1">
                <div className='header-from'>
                    <Form form={queryForm} name='func'>
                        <Row>
                            {/*船东 */}
                            <CosSelect  name={['search','shipownerCompanyCode']} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values||[]}/>
                            {/*代理公司 */}
                            {/* <CosSelect name={['search','companyCode']} selectChange={selectChangeBtn} disabled={props.currentUser.companyCode != 2000?true:false} showSearch={true} flag={true} label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData}/> */}
                            <CosSelect name={['search','companyCode']} selectChange={selectChangeBtn} showSearch={true} flag={true} label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData}/>
                            {/* 代理编码 */}
                            {/* <CosSelect name={['search','agencyCode']} showSearch={true} label={<FormattedMessage id='lbl.agency'/>} options={agencyCode}/> */}
                            {/* 业务时间 */}
                            <DoubleDatePicker name={['search','trackingDte']}  picker="month"  label={<FormattedMessage id='lbl.argue.biz-date'/>}/> 
                            {/*汇率 */}
                            {/* {exchangeRate.length?<CosInputText name={['search','rate']} label={formatMessage({id: "lbl.budgetTracking.rate"}) + `${exchangeRate[0].fromCur}|${exchangeRate[0].toCur}`}/>:null} */}
                        </Row>
                    </Form>
                    {/* 查询条件 */}
                    <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                </div>
                <div className='main-button'>
                    <div className='button-left'>
                        {/* 新增预算 */}
                        <CosButton auth='AFCM-BUDGET-001-B03' onClick={() => {createCr()}} icon={<FileAddOutlined />}><FormattedMessage id='btn.businessvolume.add'/></CosButton>
                    </div>
                    <div className='button-right'>
                        {/* 重置 */}
                        <Button onClick={() => clearBtn()} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                        {/* 查询按钮 */}
                        <Button onClick={()=> pageChange(page,'query')} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
                    </div>
                </div>
                <div className="footer-table budget-tracking">
                    <div style={{width: '80%'}}>
                        <CosPaginationTable
                            columns={columns}
                            dataSource={tableData}
                            rowKey='budgetUuid'
                            pageSize={page.pageSize}
                            current={page.current}
                            pageChange={pageChange}
                            total={tabTotal}
                            scrollHeightMinus={250}
                            rowSelection={null}/>
                    </div>
                </div>
                {/* 弹窗 */}
                {/* <Modal title={txt} visible={isModalVisible} footer={null} width={"50%"} height={"50%"} onCancel={() => handleCancel()} maskClosable={false}> */}
                <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
                    <CosToast toast={infoTips}/>  
                        <div className='modalContent' style={{minWidth: '300px'}}>    
                                <Form form={queryForm} name='add' onFinish={handleSave}>
                                    <Row>
                                        {/*船东 */}
                                        <CosSelect  name={['popData','shipownerCompanyCode']} flag={true} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values||[]} span={12} isSpan={true}/>
                                        {/*代理公司 */}
                                        <CosSelect name={['popData','companyCode']} selectChange={selectChangeBtn} flag={true} showSearch={true} label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData} span={12} isSpan={true}/>
                                        {/* 业务时间 */}
                                        {/* <CosDatePicker name={['popData','trackingDte']}  label={<FormattedMessage id="lbl.argue.biz-date" />}  message={<FormattedMessage id="lbl.argue.biz-date" />} span={12}/> */}
                                        <DoubleDatePicker name={['popData','trackingDte']}  picker="month" label={<FormattedMessage id='lbl.argue.biz-date'/>} span={12} isSpan={true} message={<FormattedMessage id="lbl.argue.biz-date" />}/> 
                                    </Row>
                                </Form>
                                <div className='main-button'>
                                    <div className='button-left'></div>
                                    <div className='button-right'>
                                        {/* 保存 */}
                                        <CosButton onClick={() => handleSave()} auth='AFCM-CMS-BANLIE-001-B01'><FormattedMessage id='lbl.save' /></CosButton>
                                        {/* 取消 */}
                                        <Button onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></Button>
                                    </div>
                                </div>
                        </div>
                </CosModal>
                </TabPane>
                {/* ================================================================================================== */}
                <TabPane  tab={<FormattedMessage id='lbl.budgetTracking-tab-del'/>} key="2" disabled={tabFlag}>
                    {/* <div className='header-from'> */}
                        <Form form={queryForm} name='func'>
                            <Row >
                                {/* 汇率 */}
                                {exchangeRate.length?<Col span={$menuRender.menuRender?6:null} className={$menuRender.menuRender?'':'colWidth'}>
                                    <Form.Item name={['search','rate']} label={intl.formatMessage({id: "lbl.budgetTracking.rate"})} {...formlayout2}>
                                        <Input.Group compact>
                                            <Select defaultValue={defaultRate} onChange={(e)=>{rateChange(e)}} style={{width:'41%'}}>
                                                <Option value="0">请选择</Option>
                                                {
                                                    exchangeRate.map((item,idnex) => {
                                                        return <Option key={item.detailUuid} value={item.detailUuid}>{item.fromCur}|{item.toCur}</Option>
                                                    })
                                                }
                                            </Select>
                                            <Input style={{ width: '59%' }} value={rateNum} />
                                        </Input.Group>
                                    </Form.Item>
                                </Col>:null}
                            </Row>
                        </Form>
                    {/* </div> */}
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 保存 */}
                            <CosButton auth='AFCM-BUDGET-001-B02' onClick={() => {saveData()}} icon={<SaveOutlined/>}><FormattedMessage id='btn.save'/></CosButton>
                            {/* 提交本次 */}
                            <CosButton auth='AFCM-BUDGET-001-B01' onClick={() => {submitCr()}} icon={<FileProtectOutlined/>}><FormattedMessage id='btn.businessvolume.submit'/></CosButton>
                        </div>
                        <div className='button-right'>
                            {/* 重置 */}
                            {/* <Button onClick={() => clearBtn()} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button> */}
                            {/* 查询按钮 */}
                            {/* <Button onClick={()=> pageChange()} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button> */}
                        </div>
                    </div>
                    <div className="footer-table budget-tracking">
                        <Tabs type="card" activeKey={defaultKey} onChange={(activeKey) => {tabsChange(activeKey)}}>
                            <TabPane tab={<FormattedMessage id='lbl.budgetTracking.cr' />} key="1">
                                <CosPaginationTable
                                    columns={crColumns}
                                    dataSource={crList}
                                    rowKey='itemUuid'
                                    pagination={false}
                                    scrollHeightMinus={250}
                                    rowSelection={null}/>
                            </TabPane>
                            <TabPane tab={<FormattedMessage id='lbl.budgetTracking.ag' />} key="2">
                                <CosPaginationTable
                                    columns={agColumns}
                                    dataSource={agList}
                                    rowKey='itemUuid'
                                    pagination={false}
                                    scrollHeightMinus={250}
                                    rowSelection={null}/>
                            </TabPane>
                        </Tabs>
                    </div>
                </TabPane>
        </Tabs>
        <CosLoading spinning={loading}/>
    </div>
}
export default connect(({ user, loading }) => ({
    currentUser: user.currentUser,
  }))(BussinessVolume);