import React,{useState, useEffect, $apiUrl, $menuRender} from 'react';
import { Form, Button, Row, Tabs,Input,Select,Col,Tooltip } from 'antd'
import {FormattedMessage, formatMessage, connect,useIntl} from 'umi'
import {CosDoubleDatePicker,CosInputText,CosButton,CosPaginationTable,CosLoading,CosSelect} from '@/components/Common'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast'
import {formlayout2} from '@/utils/commonLayoutSetting'
import { momentFormat,acquireCompanyData,acquireSelectDataExtend } from '@/utils/commonDataInterface';
import './diff.less'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import moment from 'moment';
import Selects from '@/components/Common/Select';
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloseCircleOutlined,//删除
    SaveOutlined,//保存
    CloudDownloadOutlined,//下载
    FileSearchOutlined,
} from '@ant-design/icons'
const { TabPane } = Tabs;
const { Option } = Select;
const BussinessVolume = (props) => {
    const [queryForm] = Form.useForm();
    const [crList,setCrList] = useState([])
    const [agList,setAgList] = useState([])
    const [saveHeader,setSaveHeader] = useState([])
    const [defaultKey,setDefaultKey] = useState('1')
    const [exchangeRate,setExchangeRate] = useState([])
    const [defaultRate,setDefaultRate] = useState('0')
    const [rateNum,setRateNum] = useState()
    const [loading,setLoading] = useState(false)
    const [companysData,setCompanysData] = useState([])
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode,setAgencyCode] = useState([])
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tabFlag, setTabFlag] = useState(true); // tab禁用
    useEffect(()=>{
        acquireCompanyData(setCompanysData, $apiUrl);   // 公司
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
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => {searchDetail(record)}}><FileSearchOutlined/></a>&nbsp; 
                    </Tooltip>&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.afcm-002'/>,//业务开始时间   
            dataIndex: 'fromMonthDate',
            dataType: 'dateTime',
            sorter: false,
            width: 120,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.afcm-003'/>,//业务结束时间   
            dataIndex: 'toMonthDate',
            dataType: 'dateTime',
            sorter: false,
            width: 120,
            align:'left', 
        },  {
            title: <FormattedMessage id='lbl.carrier'/>,//船东   
            dataIndex: 'shipownerCompanyCode',
            sorter: false,
            width: 120,
            align:'left', 
        },{
            title: <FormattedMessage id='lbl.company'/>,//公司   
            dataIndex: 'companyCode',
            sorter: false,
            width: 120,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.business-submit-time'/>,//第几次提交   
            dataIndex: 'predictSubmit',
            sorter: false,
            width: 120,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.update-date'/>,//更新时间   
            dataIndex: 'recordUpdateDatetime',
            // dataType: 'dateTime',
            sorter: false,
            width: 120,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.update-by'/>,//更新用户   
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 120,
            align:'left', 
        }, {
            title: <FormattedMessage id='lbl.state'/>,//状态   
            dataIndex: 'status',
            sorter: false,
            width: 120,
            align:'left', 
        },
    ]
    const crColumns = [
        // { 
        //     title: <FormattedMessage id="lbl.operate" />,//操作
        //     dataIndex: 'operate',
        //     align:'center',
        //     width: 100,
        //     fixed: true,
        //     render:(text,record, index) => {
        //         return <div>
        //             {/* 删除 */}
        //             <Tooltip title={<FormattedMessage id='btn.delete' />}>
        //                 <a style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp;  {/* 删除 */}
        //             </Tooltip>&nbsp;
        //             {/* 保存 */}
        //             <Tooltip title={<FormattedMessage id='btn.save' />}>
        //                 <a><SaveOutlined/></a>&nbsp;  {/* 删除 */}
        //             </Tooltip>&nbsp;
        //         </div>
        //     }
        // },
        // {
        //     title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
        //     dataIndex: 'monthDate',
        //     width: 120,
        //     // render:()=>{
        //     //     console.log(saveHeader)
        //     //     return saveHeader&&saveHeader.monthDate.split(' ')[0]
        //     // }
        // },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            width: 50,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'companyCode',
            width: 69,
            align:'left',
        },
        {
            title: 'COMM_TYPE',//COMM_TYPE
            dataIndex: 'chargeCode',
            width: 100,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'chargeCodeName',
            width: 60,
            align:'left',
        },
        {
            title: 'POR,FND',//POR,FND
            dataIndex: 'porFnd',
            width: 100,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.To-pay-in-advance" />,//预到付
            dataIndex: 'oftPc',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.empty-box" />,//空箱
            dataIndex: 'socEmptyIndicator',
            width: 40,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.type-goods" />,//货物类型
            dataIndex: 'cargoNatureCode',
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
            title: <FormattedMessage id="lbl.budgetTracking.agment-num" />,//佣金协议编号
            dataIndex: 'commissionAgreementCode',
            align:'left',
            width: 90,
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
            width: 60,
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
                    dataIndex: 'predictAmount1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    dataIndex: 'predictAmount2',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    dataIndex: 'predictAmount3',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    dataIndex: 'predictAmount4',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    dataIndex: 'predictAmount5',
                    width: 80,
                    align:'right',
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.unit-account" />,//预期计算单位
            dataIndex: 'priceUnit',
            width: 100,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.actual" />,//实际
            dataIndex: 'operate',
            align:'center',
            children:[
                {
                    title: <FormattedMessage id='lbl.ccy'/>,   // 币种
                    dataIndex: 'commHeaduuid',
                    key: 'age',
                    width: 60,
                },
                {
                    title: <FormattedMessage id='lbl.amount'/>,   // 金额
                    dataIndex: 'commHeaduuid',
                    key: 'age',
                    width: 60,
                    align:'right',
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.business-volume" />,//预期业务量
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    dataIndex: 'predictVol1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.amount-diff-rate'/>,   // 金额差异率
                    dataIndex: 'differencePrecent1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    dataIndex: 'predictVol2',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.amount-diff-rate'/>,   // 金额差异率
                    dataIndex: 'differencePrecent1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    dataIndex: 'predictVol3',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.amount-diff-rate'/>,   // 金额差异率
                    dataIndex: 'differencePrecent1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    dataIndex: 'predictVol4',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.amount-diff-rate'/>,   // 金额差异率
                    dataIndex: 'differencePrecent1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    dataIndex: 'predictVol5',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.amount-diff-rate'/>,   // 金额差异率
                    dataIndex: 'differencePrecent1',
                    width: 80,
                    align:'right',
                },
            ]
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            // dataType: 'dateTime',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Update-users" />,//更新用户
            dataIndex: 'recordUpdateUser',
            width: 60,
            align:'left',
        }
    ]
    const agColumns = [
        // { 
        //     title: <FormattedMessage id="lbl.operate" />,//操作
        //     dataIndex: 'operate',
        //     align:'center',
        //     width: 100,
        //     fixed: true,
        //     render:(text,record, index) => {
        //         return <div>
        //             {/* 删除 */}
        //             <Tooltip title={<FormattedMessage id='btn.delete' />}>
        //                 <a style={{color:'red'}}><CloseCircleOutlined/></a>&nbsp;  {/* 删除 */}
        //             </Tooltip>&nbsp;
        //             {/* 保存 */}
        //             <Tooltip title={<FormattedMessage id='btn.save' />}>
        //                 <a><SaveOutlined/></a>&nbsp;  {/* 保存 */}
        //             </Tooltip>&nbsp;
        //         </div>
        //     }
        // },
        // {
        //     title: <FormattedMessage id="lbl.argue.biz-date" />,//业务时间
        //     dataIndex: '1',
        //     width: 120,
        //     // render:()=>{
        //     //     return saveHeader&&saveHeader.monthDate
        //     // }
        // },
        {
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            width: 50,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'companyCode',
            width: 60,
            align:'left',
        },
        // {
        //     title: <FormattedMessage id="lbl.agency" />,//代理编码
        //     dataIndex: 'heryCode',
        //     width: 120,
        //     align:'left',
        // },
        {
            title: 'FEE_TYPE',//FEE_TYPE
            dataIndex: 'chargeCode',
            width: 90,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'chargeCodeName',
            width: 60,
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
            width: 100,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.ship-marking" />,//船舶标记
            dataIndex: 'vesselIndicator',
            width: 60,
            align:'left',
        },
        {
            title: 'SVC_GRP',//SVC_GRP
            dataIndex: 'serviceGroup',
            width: 100,
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
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.type-goods" />,//货物类型
            dataIndex: 'cargoNatureCode',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.own-box" />,//自有箱
            dataIndex: 'socIndicator',
            width: 50,
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
            width: 60,
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
            dataIndex: '1',
            align:'center',
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    dataIndex: 'predictAmount1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    dataIndex: 'predictAmount2',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    dataIndex: 'predictAmount3',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    dataIndex: 'predictAmount4',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    dataIndex: 'predictAmount5',
                    width: 80,
                    align:'right',
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.unit-account" />,//预期计算单位
            dataIndex: 'priceUnit',
            width: 90,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.actual" />,//实际
            dataIndex: 'operate',
            align:'center',
            children:[
                {
                    title: <FormattedMessage id='lbl.ccy'/>,   // 币种
                    dataIndex: 'commHeaduuid',
                    width: 60,
                },
                {
                    title: <FormattedMessage id='lbl.amount'/>,   // 金额
                    dataIndex: 'commHeaduuid',
                    width: 60,
                    align:'right',
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.budgetTracking.business-volume" />,//预期业务量
            dataIndex: '1',
            align:'center',
            children:[
                {
                    title: <FormattedMessage id='lbl.budgetTracking.first-time'/>,   // 第一次
                    dataIndex: 'predictVol1',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.second-time'/>,   // 第二次
                    dataIndex: 'predictVol2',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.third-time'/>,   // 第三次
                    dataIndex: 'predictVol3',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fourth-time'/>,   // 第四次
                    dataIndex: 'predictVol4',
                    width: 80,
                    align:'right',
                },
                {
                    title: <FormattedMessage id='lbl.budgetTracking.fifth-time'/>,   // 第五次
                    dataIndex: 'predictVol5',
                    width: 80,
                    align:'right',
                }
            ]
        },
        {
            title: <FormattedMessage id="lbl.update-date" />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            // dataType: 'dateTime',
            width: 60,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.Update-users" />,//更新用户
            dataIndex: 'recordUpdateUser',
            width: 60,
            align:'left',
        },
    ]
    const [tableData,setTableData] = useState([])  //数据
    const [tabTotal,setTabTotal ] = useState([]) // table条数
    const [defaultKeys, setDefaultKeys] = useState('1');  //Tab key
    {/* 回调 */}
    const callback = (key) => {
		Toast('', '', '', 5000, false);
		setDefaultKeys(key);
	}
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    {/* 查询 */}
    const searchBtn = async(pagination,query) =>{
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
            if(result.data.exchangeRate=[]){
                setLoading(false)
                return
            }
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
    const resetBtn = () => {
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
    {/* 查看预估明细 */}
    const searchDetail = async(record) => {
        Toast('', '', '', 5000, false);
        setLoading(true)
        const result=await request($apiUrl.BUDGET_TRACKING_SEARCH_DETAIL,{
            method:"POST",
            data:{
                params: {
                    headerId: record.budgetUuid
                }
            }
        })
        trackingAgencyList(record.budgetUuid);     // 代理编码
        if(result.success){
            setTabFlag(false)
            setLoading(false)
            setDefaultKeys('2')
            let data = result.data
            let headerData = result.data.header
            // console.log(headerData)
            setAgList(data.ag)
            setCrList(data.cr)
            // setSaveHeader(data.header)
            setExchangeRate(data.exchangeRate)
            setDefaultRate(data.exchangeRate[0] && data.exchangeRate[0].detailUuid)
            queryForm.setFieldsValue({
                search:{
                    companyCode: headerData.companyCode,
                    agencyCode: headerData.agencyCode,
                    soCompanyCde: headerData.shipownerCompanyCode,
                    dateTime: [moment(headerData.fromMonthDate),moment(headerData.toMonthDate)],
                }
            })
        }else{
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    // =========================================================================
    const pageChange = async() =>{
        Toast('','', '', 5000, false)
        const {search} = queryForm.getFieldsValue()
        if(!search.dateTime){
            Toast('',intl.formatMessage({id: "lbl.business-volum-search"}), 'alert-error', 5000, false)
            return
        }
        setLoading(true)
        let result = await request($apiUrl.BUDGET_TRACKING_QUERYBYCARRIER_POST,{
            method:"POST",
            data:{
                params:{
                    ...search,
                    companyCode: search.companyCode&&search.companyCode.split('-')[0],
                    fromDt:search.dateTime ? momentFormat(search.dateTime[0]) : undefined,
                    toDt: search.dateTime ? momentFormat(search.dateTime[1]) : undefined,
                    dateTime:undefined
                }
            }
        })
        if(result.success) {
            setCrList(result.data.cr)
            setAgList(result.data.ag)
            // setSaveHeader(result.data.header)
            // setDefaultRate(result.data.exchangeRate[0]&&result.data.exchangeRate[0].detailUuid)
            // result.data.cr.map((v,i)=>{
            //     v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
            // })
            setLoading(false)
        }else{
            setCrList([])
            setAgList([])
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    // useEffect(()=>{
    //     setSaveHeader(saveHeader)
    // },[saveHeader])
    const rateChange = (e) => {
        // console.log(e)
        let rate
        exchangeRate.map((item,index) => {
            if(item.detailUuid == e){
                rate = item.rate
            }
        })
        setRateNum(rate)
    }
    // const trackingAgencyList = async(options,setData)=>{
    //     await request(options.apiUrl.BUDGET_TRACKING_GETACLIST_POST,{
    //         method:'POST',
    //         data: {
    //             params: dtlUid
    //         }
    //     })
    //     .then((month) => {
    //         if(!month.data)return
    //         var data = month.data;
    //         setData(data);
    //     })
    // }
    {/* 获预估明细代理编码 */}
    const trackingAgencyList = async(uuid)=>{
        const result = await request($apiUrl.BUDGET_TRACKING_GETACLIST_POST,       
            {
                method:'POST',
                data: {
                    uuid: uuid
                }
            }
        )
        if(result.success) {
            let data = result.data
            setAgencyCode(data)
        }
    }
    const selectChangeBtn = (value, all) => {
		// trackingAgencyList({apiUrl:$apiUrl,companyCode:value.split('-')[0]}, setAgencyCode);     // 代理编码
	}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        setCrList([])
        setAgList([])
    }
    let formlayouts={
        labelCol: { span: 9 },
        wrapperCol: { span: 15 }
    }
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
                                <CosSelect name={['search','companyCode']} showSearch={true} flag={true} label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData}/>
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
                    <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={() => resetBtn()} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                            {/* 查询按钮 */}
                            <Button onClick={()=> searchBtn(page,'query')} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
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
                                pageChange={searchBtn}
                                total={tabTotal}
                                scrollHeightMinus={250}
                                rowSelection={null}/>
                        </div>
                    </div>
                </TabPane>
                    {/* ================================================================================================== */}
                <TabPane  tab={<FormattedMessage id='lbl.budgetTracking-tab-del'/>} key="2" disabled={tabFlag}>
                    <div className='header-from'>
                        <Form form={queryForm} name='func'>
                            <Row>
                                {/*船东 */}
                                <CosSelect name={['search','soCompanyCde']} flag={true} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values||[]} disabled formlayouts={formlayouts}/>
                                {/*代理公司 */}
                                <CosSelect name={['search','companyCode']} disabled showSearch={true} label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} options={companysData} formlayouts={formlayouts}/>
                                {/* 代理编码 */}
                                <Selects name={['search','agencyCode']} showSearch={true} label={<FormattedMessage id='lbl.agency'/>} options={agencyCode} flag={true} formlayouts={formlayouts}/>
                                {/* 业务时间 */}
                                <CosDoubleDatePicker name={['search','dateTime']} disabled label={<FormattedMessage id="lbl.argue.biz-date" />} message={<FormattedMessage id="lbl.argue.biz-date" />} formlayouts={formlayouts}/>
                                {/* 汇率 */}
                                {exchangeRate.length?<Col span={$menuRender.menuRender?6:null} className={$menuRender.menuRender?'':'colWidth'} formlayouts={formlayouts}>
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
                        {/* 查询条件 */}
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={clearBtn} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                            {/* 查询按钮 */}
                            <Button onClick={()=> pageChange()} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
                        </div>
                    </div>
                        <div className="footer-table budget-tracking">
                            <Tabs type="card" defaultActiveKey={defaultKey}  onChange={(activeKey) => {tabsChange(activeKey)}}>
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
  }))(BussinessVolume)