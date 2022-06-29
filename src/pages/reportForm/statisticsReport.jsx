{/*佣金代理费计算费用统计报表*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi';
import request from '@/utils/request';
import { Button, Form, Row, Tabs, } from 'antd';
import Select from '@/components/Common/Select';
import { acquireSelectData, momentFormat,acquireSelectDataExtend,agencyCodeData,costCategories} from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const { TabPane } = Tabs;
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const statisticsReport =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tabTotal,setTabTotal ] = useState([])         // 汇总条数
    const [afsAgfeeTabTotal,setAfsAgfeeTabTotal ] = useState([]) // afs代理费条数
    const [afsCommTabTotal,setAfsCommTabTotal ] = useState([])  // afs佣金条数
    const [afsLocalTabTotal,setAfsLocalTabTotal ] = useState([]) // afs LocalCharge条数
    const [cbsAgfeeTabTotal,setCbsAgfeeTabTotal ] = useState([]) // cbs代理费条数
    const [cbsCommTabTotal,setCbsCommTabTotal ] = useState([])  // cbs佣金条数
    const [cbsLocalTabTotal,setCbsLocalTabTotal ] = useState([]) // cbs LocalCharge条数
    const [tableData,setTableData] = useState([]);   //  汇总
    const [afsAgfeeData,setAfsAgfeeData] = useState([]);   //  AFS代理费
    const [afsCommData,setAfsCommData] = useState([]);   //  AFS佣金
    const [afsLocalData,setAfsLocalData] = useState([]);   //  AFS LocalCharge
    const [cbsAgfeeData,setCbsAgfeeData] = useState([]);   //  CBS代理费
    const [cbsCommData,setCbsCommData] = useState([]);   //  CBS佣金
    const [cbsLocalData,setcbsLocalData] = useState([]);   //  CBS LocalCharge
    const [choose,setChoose] = useState({});   //  是否统计美加澳新
    const [defaultKey, setDefaultKey] = useState('1');
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [searchflag,setSearchflag] = useState("SUM_CALC_REPORT");   //查询类型
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [commissionType, setCommissionType] = useState({});    // 佣金类型
    const [commissionCategories, setCommissionCategories] = useState({});    // 佣金大类
    const [feeClass,setFeeClass] = useState ([]) //费用大类
    const [feeCategory,setFeeCategory] = useState ([]) //费用小类
    const [page,setPage]=useState({  //汇总分页
        current: 1,
        pageSize: 10
    })
    const [page1,setPage1]=useState({  //AFS代理费分页
        current: 1,
        pageSize: 10
    })
    const [page2,setPage2]=useState({  //AFS佣金分页
        current: 1,
        pageSize: 10
    })
    const [page3,setPage3]=useState({  //AFS localCharge分页
        current: 1,
        pageSize: 10
    })
    const [page4,setPage4]=useState({  //CBS代理费分页
        current: 1,
        pageSize: 10
    })
    const [page5,setPage5]=useState({  //CBS佣金分页
        current: 1,
        pageSize: 10
    })
    const [page6,setPage6]=useState({  //CBS LocalCharge分页
        current: 1,
        pageSize: 10
    })
    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('COMM0001', setChoose, $apiUrl);  // 是否统计美加澳新 
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        acquireSelectData('COMM.TYPE', setCommissionType, $apiUrl);  // 佣金类型 
        acquireSelectData('COMMISSION.CLASS', setCommissionCategories, $apiUrl);     // 佣金大类
        costCategories(feeClass,setFeeClass,$apiUrl)//费用大小类联动
    },[])
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    useEffect(()=>{
        felList()
    },[feeClass])
    const felList = ()=>{
        if(feeClass!=null){
            let listAgTypeToClassall = feeClass.map((v,i)=>{
                return v.listAgTypeToClass
            })
            let listAgTypeToClass = listAgTypeToClassall.reduce((pre,cur)=>{
                return pre.concat(cur)
            },[])
            listAgTypeToClass.map((v,i)=>{
                v['value']=v.feeCode
                v['label']=v.feeCode+'(' + v.feeName +')';
            })
            setFeeCategory(listAgTypeToClass)
        }
    }
    const [queryForm] = Form.useForm();
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "shipownerCompanyCode": null,
        "actualFlag": null,
        "activityDate": null,
    });
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    {/* 汇总 */}
    const columns = [
        {
            title: <FormattedMessage id='lbl.Data-source'/>,// 数据源
            dataIndex: 'dataSource',
            align:'left',
            sorter: false,
            width: 50,
        },
        {
            title: <FormattedMessage id='lbl.Classify' />,// 分类
            dataIndex: 'type',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agency-chn-name'/>,// 代理中文名称
            dataIndex: 'agencyCn',
            align:'left',
            sorter: false,
            width: 90,
        },
        {
            title: <FormattedMessage id='lbl.Counry-area'/>,// 国家/地区
            dataIndex: 'countryCn',
            align:'left',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Ship-agfee-cny'/>,// 船舶代理费CNY
            dataIndex: 'agfAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 110,
        },
        {
            title: <FormattedMessage id='lbl.Box-pipe-agfee-cny'/>,// 箱管代理费CNY
            dataIndex: 'cgfAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 110,
        },
        {
            title: <FormattedMessage id='lbl.Lump-sum-cny'/>,// 包干杂费CNY
            dataIndex: 'mgfAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.transfer-agfee-cny'/>,// 中转代理费CNY
            dataIndex: 'tgfAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 110,
        },
        {
            title: <FormattedMessage id='lbl.Agfee-cny'/>,// 代理费CNY
            dataIndex: 'agAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Comm-cny'/>,// 佣金CNY
            dataIndex: 'creditAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Local-charge-cny'/>,// Local charge CNY
            dataIndex: 'lcrAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 110,
        },
        {
            title: <FormattedMessage id='lbl.Total'/>,// 合计
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 40,
        },
    ]
    {/* AFS代理费 */}
    const afsAgfeeColumns = [
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Year'/>,// 年
            dataIndex: 'year',
            align:'left',
            sorter: false,
            width: 30,
        },
        {
            title: <FormattedMessage id='lbl.Month'/>,// 月
            dataIndex: 'month',
            align:'left',
            sorter: false,
            width: 30,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee'/>,// 费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee'/>,// 费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Rmb-currency'/>,// 人民币金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
    ]
    {/* AFS佣金 */}
    const afsCommColumns = [
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Year'/>,// 年
            dataIndex: 'year',
            align:'left',
            sorter: false,
            width: 30,
        },
        {
            title: <FormattedMessage id='lbl.Month'/>,// 月
            dataIndex: 'month',
            align:'left',
            sorter: false,
            width: 30,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Commission-type'/>,// 佣金类型
            dataIndex: 'commissionType',
            dataType: commissionType.values,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Rmb-currency'/>,// 人民币金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
    ]
    {/* AFS LocalCharge */}
    const afsLocalColumns = [
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Year'/>,// 年
            dataIndex: 'year',
            align:'left',
            sorter: false,
            width: 30,
        },
        {
            title: <FormattedMessage id='lbl.Month'/>,// 月
            dataIndex: 'month',
            align:'left',
            sorter: false,
            width: 30,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Commission-type'/>,// 佣金类型
            dataIndex: 'commissionType',
            dataType: commissionType.values,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.settlement-currency'/>,// 结算币种
            dataIndex: 'clearingCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.amount-of-settlement-currency'/>,// 结算币金额
            dataIndex: 'totalAmountInClearing',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Rmb-currency'/>,// 人民币金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
    ]
    {/* CBS代理费 */}
    const cbsAgfeeColumns = [
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Date'/>,// 年 月
            dataIndex: 'month',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Big-class-fee'/>,// 费用大类
            dataIndex: 'feeClass',
            dataType: feeClass,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Small-class-fee'/>,// 费用小类
            dataIndex: 'feeType',
            dataType: feeCategory,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Rmb-currency'/>,// 人民币金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
    ]
    {/* CBS佣金 */}
    const cbsCommColumns = [
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Date'/>,// 年 月
            dataIndex: 'month',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.commission-big-type'/>,// 佣金大类
            dataIndex: 'commissionClass',
            dataType: commissionCategories.values,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Commission-type'/>,// 佣金类型
            dataIndex: 'commissionType',
            dataType: commissionType.values,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Rmb-currency'/>,// 人民币金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
    ]
    {/* CBS LocalCharge */}
    const cbsLocalColumns = [
        {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Date'/>,// 年 月
            dataIndex: 'month',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },
        {
            title: <FormattedMessage id='lbl.Agent-name'/>,// 代理名称
            dataIndex: 'agencyName',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.commission-big-type'/>,// 佣金大类
            dataIndex: 'commissionClass',
            dataType: commissionCategories.values,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Commission-type'/>,// 佣金类型
            dataIndex: 'commissionType',
            dataType: commissionType.values,
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency'/>,// 协议币种
            dataIndex: 'rateCurrencyCode',
            align:'left',
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Agreement-currency-amount'/>,// 协议币金额
            dataIndex: 'totalAmount',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
        {
            title: <FormattedMessage id='lbl.Rmb-currency'/>,// 人民币金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 70,
        },
    ]
    {/* 下载 */}
    const downloadBtn =async () => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(searchflag != 'SUM_CALC_REPORT' && !queryData.activityDate ){
            Toast('', intl.formatMessage({id: 'lbl.activeDate-can-not-be-empty'}), 'alert-error', 5000, false);
            setBackFlag(false)
            return;
        } 
        setBackFlag(true)
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_DOWNLOAD,{
            method:"POST",
            data:{
                "page": {
                    "current": 0,
                    "pageSize": 0
                },
                params: {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                operateType: searchflag,
                excelFileName: intl.formatMessage({id: 'menu.afcm.reportForm.statisticsReport'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            dataSource: intl.formatMessage({id: "lbl.Data-source"}),
                            type: intl.formatMessage({id: "lbl.Classify"}),
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyCn: intl.formatMessage({id: "lbl.Agency-chn-name"}),
                            countryCn: intl.formatMessage({id: "lbl.Counry-area"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            agfAmount: intl.formatMessage({id: "lbl.Ship-agfee-cny"}),
                            cgfAmount: intl.formatMessage({id: "lbl.Box-pipe-agfee-cny"}),
                            mgfAmount: intl.formatMessage({id: "lbl.Lump-sum-cny"}),
                            tgfAmount: intl.formatMessage({id: "lbl.transfer-agfee-cny"}),
                            agAmount: intl.formatMessage({id: "lbl.Agfee-cny"}),
                            creditAmount: intl.formatMessage({id: "lbl.Comm-cny"}),
                            lcrAmount: intl.formatMessage({id: "lbl.Local-charge-cny"}),
                            totalAmount: intl.formatMessage({id: "lbl.Total"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Statistics-all'}),//汇总
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            year: intl.formatMessage({id: "lbl.Year"}),
                            month: intl.formatMessage({id: "lbl.Month"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            totalAmountInClearing: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Rmb-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Afs-agfee'}),//AFS代理费
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            year: intl.formatMessage({id: "lbl.Year"}),
                            month: intl.formatMessage({id: "lbl.Month"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            commissionType: intl.formatMessage({id: "lbl.Commission-type"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            totalAmountInClearing: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Rmb-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Afs-comm'}),//AFS佣金
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            year: intl.formatMessage({id: "lbl.Year"}),
                            month: intl.formatMessage({id: "lbl.Month"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            commissionType: intl.formatMessage({id: "lbl.Commission-type"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            clearingCurrencyCode: intl.formatMessage({id: "lbl.settlement-currency"}),
                            totalAmountInClearing: intl.formatMessage({id: "lbl.amount-of-settlement-currency"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Rmb-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Afs-local-charge'}),//AFS LocalCharge
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            month: intl.formatMessage({id: "lbl.Date"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            feeClass: intl.formatMessage({id: "lbl.Big-class-fee"}),
                            feeType: intl.formatMessage({id: "lbl.Small-class-fee"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Rmb-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Cbs-agfee'}),//CBS代理费
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            month: intl.formatMessage({id: "lbl.Date"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            commissionClass: intl.formatMessage({id: "lbl.commission-big-type"}),
                            commissionType: intl.formatMessage({id: "lbl.Commission-type"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Rmb-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Cbs-comm'}),//CBS佣金
                    },
                    {//sheetList列表
                    dataCol: {//列表字段
                            shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            month: intl.formatMessage({id: "lbl.Date"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                            commissionClass: intl.formatMessage({id: "lbl.commission-big-type"}),
                            commissionType: intl.formatMessage({id: "lbl.Commission-type"}),
                            rateCurrencyCode: intl.formatMessage({id: "lbl.Agreement-currency"}),
                            totalAmount: intl.formatMessage({id: "lbl.Agreement-currency-amount"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Rmb-currency"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Cbs-local-charge'}),//CBS LocalCharge
                    },
                ],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size<=0){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.reportForm.statisticsReport'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.reportForm.statisticsReport'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 重置 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields()
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        page1.current=1
        page2.current=1
        page3.current=1
        page4.current=1
        page5.current=1
        page6.current=1
        page1.pageSize=10
        page2.pageSize=10
        page3.pageSize=10
        page4.pageSize=10
        page5.pageSize=10
        page6.pageSize=10
        setTableData([]);      //  汇总
        setAfsAgfeeData([]);   //  AFS代理费
        setAfsCommData([]);    //  AFS佣金
        setAfsLocalData([]);   //  AFS LocalCharge
        setCbsAgfeeData([]);   //  CBS代理费
        setCbsCommData([]);    //  CBS佣金
        setcbsLocalData([]);   //  CBS LocalCharge
        setBackFlag(true);
    }

    {/* 查询表格数据 */}
    const pageChange = async (pagination,search) =>{
        console.log(pagination)
        console.log(page)
        Toast('', '', '', 5000, false);
        setTableData([]);      
        setAfsAgfeeData([]);  
        setAfsCommData([]);   
        setAfsLocalData([]);  
        setCbsAgfeeData([]);  
        setCbsCommData([]);   
        setcbsLocalData([]);
        let queryData = queryForm.getFieldValue();
        console.log(queryData)
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){pagination.current=1}
        if(searchflag != 'SUM_CALC_REPORT' && !queryData.activityDate){
            Toast('', intl.formatMessage({id: 'lbl.activeDate-can-not-be-empty'}), 'alert-error', 5000, false);
            setBackFlag(false)
            return;
        }else{
            setSpinflag(true);
            setBackFlag(true)
            const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        agencyCode: queryData.agencyCode,
                        actualFlag: queryData.actualFlag,
                        activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                        activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                    },
                    "operateType": searchflag,
                }
            })
            console.log(result)
            let data=result.data
            if(result.success){
                setSpinflag(false);
                setPage({...pagination}) 
                let sumCalcResult=data.sumCalcResult.resultList       //汇总
                let agCalcResult=data.agCalcResult.resultList         //AFS代理费
                let crCalcResult=data.crCalcResult.resultList         //AFS佣金
                let lcrCalcResult=data.lcrCalcResult.resultList       //AFS LocalCharge
                let agCbsCalcResult=data.agCbsCalcResult.resultList   //CBS代理费
                let crCbsCalcResult=data.crCbsCalcResult.resultList   //CBS佣金
                let lcrCbsCalcResult=data.lcrCbsCalcResult.resultList //CBS LocalCharge
                if(sumCalcResult!=null){
                    sumCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setTableData([...sumCalcResult]); 
                    setTabTotal(data.sumCalcResult.totalCount) 
                }
                if(agCalcResult!=null) {
                    agCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setAfsAgfeeData([...agCalcResult]); 
                    setAfsAgfeeTabTotal(data.agCalcResult.totalCount)
                }
                if(crCalcResult!=null){
                    crCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setAfsCommData([...crCalcResult]); 
                    setAfsCommTabTotal(data.crCalcResult.totalCount)
                }
                if(lcrCalcResult!=null){
                    lcrCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setAfsLocalData([...lcrCalcResult]); 
                    setAfsLocalTabTotal(data.lcrCalcResult.totalCount)
                }
                if(agCbsCalcResult!=null){
                    agCbsCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setCbsAgfeeData([...agCbsCalcResult]);  
                    setCbsAgfeeTabTotal(data.agCbsCalcResult.totalCount)
                }
                if(crCbsCalcResult!=null){
                    crCbsCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setCbsCommData([...crCbsCalcResult]);  
                    setCbsCommTabTotal(data.crCbsCalcResult.totalCount)
                }
                if(lcrCbsCalcResult!=null){
                    lcrCbsCalcResult.map((v,i)=>{
                        v.uid=i
                    })
                    setcbsLocalData([...lcrCbsCalcResult]);  
                    setCbsLocalTabTotal(data.lcrCbsCalcResult.totalCount)
                }
            }else{
                setSpinflag(false);
                setTableData([]);      
                setAfsAgfeeData([]);  
                setAfsCommData([]);   
                setAfsLocalData([]);  
                setCbsAgfeeData([]);  
                setCbsCommData([]);   
                setcbsLocalData([]);
                Toast('',result.errorMessage, 'alert-error', 5000, false)
            }
        }
    }
    {/* 汇总分页查询 */}
    const searchSumCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setTableData([]);
        console.log(queryData)
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "SUM_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let sumCalcResult=data.sumCalcResult.resultList
            if(sumCalcResult!=null){
                sumCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage({...pagination}) 
            setTableData([...sumCalcResult]); 
            setTabTotal(data.sumCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setTableData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* AFS代理费分页查询 */}
    const searchAgCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setAfsAgfeeData([]);
        console.log(queryData)
        if(pagination.pageSize!=page1.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "AG_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let agCalcResult=data.agCalcResult.resultList
            if(agCalcResult!=null){
                agCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage1({...pagination}) 
            setAfsAgfeeData([...agCalcResult]); 
            setAfsAgfeeTabTotal(data.agCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setAfsAgfeeData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* AFS佣金分页查询 */}
    const searchCrCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setAfsCommData([]);
        console.log(queryData)
        if(pagination.pageSize!=page2.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "CR_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let crCalcResult=data.crCalcResult.resultList
            if(crCalcResult!=null){
                crCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage2({...pagination}) 
            setAfsCommData([...crCalcResult]); 
            setAfsCommTabTotal(data.crCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setAfsCommData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* AFS LocalCharge分页查询 */}
    const searchLcrCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setAfsLocalData([]);
        console.log(queryData)
        if(pagination.pageSize!=page3.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "LCR_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let lcrCalcResult=data.lcrCalcResult.resultList
            if(lcrCalcResult!=null){
                lcrCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage3({...pagination}) 
            setAfsLocalData([...lcrCalcResult]); 
            setAfsLocalTabTotal(data.lcrCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setAfsLocalData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* CBS代理费分页查询 */}
    const searchAgCbsCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        setCbsAgfeeData([]);
        let queryData = queryForm.getFieldValue();
        console.log(queryData)
        if(pagination.pageSize!=page4.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "AG_CBS_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let agCbsCalcResult=data.agCbsCalcResult.resultList
            if(agCbsCalcResult!=null){
                agCbsCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage4({...pagination}) 
            setCbsAgfeeData([...agCbsCalcResult]); 
            setCbsAgfeeTabTotal(data.agCbsCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setCbsAgfeeData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* CBS佣金分页查询 */}
    const searchCrCbsCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        setCbsCommData([]);
        let queryData = queryForm.getFieldValue();
        console.log(queryData)
        if(pagination.pageSize!=page5.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "CR_CBS_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let crCbsCalcResult=data.crCbsCalcResult.resultList
            if(crCbsCalcResult!=null){
                crCbsCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage5({...pagination}) 
            setCbsCommData([...crCbsCalcResult]); 
            setCbsCommTabTotal(data.crCbsCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setCbsCommData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* CBS LocalCharge分页查询 */}
    const searchLcrCbsCalcResult = async (pagination) =>{
        Toast('', '', '', 5000, false);
        setcbsLocalData([]);
        let queryData = queryForm.getFieldValue();
        console.log(queryData)
        if(pagination.pageSize!=page6.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_STATISTICS_REPORT_SEARCH_SUMMARY_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    shipownerCompanyCode: queryData.shipownerCompanyCode,
                    agencyCode: queryData.agencyCode,
                    actualFlag: queryData.actualFlag,
                    activityDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activityDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                "operateType": "LCR_CBS_CALC_REPORT",
            }
        })
        console.log(result)
        let data=result.data
        if(result.success){
            let lcrCbsCalcResult=data.lcrCbsCalcResult.resultList
            if(lcrCbsCalcResult!=null){
                lcrCbsCalcResult.map((v,i)=>{
                    v.uid=i
                })
            }
            setSpinflag(false);
            setPage6({...pagination}) 
            setcbsLocalData([...lcrCbsCalcResult]); 
            setCbsLocalTabTotal(data.lcrCbsCalcResult.totalCount) 
        }else {
            setSpinflag(false);
            setcbsLocalData([]);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* tab页点击 */}
    const callback = (key) => {
		Toast('', '', '', 5000, false);
        setSpinflag(true);
		console.log(key);
		setDefaultKey(key);
        if(key=="1"){
            setSearchflag("SUM_CALC_REPORT") //汇总
        }else if(key=="2"){
            setSearchflag("AG_CALC_REPORT")  //AFS代理费
        }else if(key=="3"){
            setSearchflag("CR_CALC_REPORT")  //AFS佣金
        }else if(key=="4"){
            setSearchflag("LCR_CALC_REPORT")  //AFS LocalCharge
        }else if(key=="5"){
            setSearchflag("AG_CBS_CALC_REPORT")  //CBS代理费
        }else if(key=="6"){
            setSearchflag("CR_CBS_CALC_REPORT")  //CBS佣金
        }else if(key=="7"){
            setSearchflag("LCR_CBS_CALC_REPORT")  //CBS LocalCharge
        }
        if(key==1 && tableData.length==0){  //对应tab页无数据则不显示loading
            setSpinflag(false);
        }else if(key==2 && afsAgfeeData.length==0){
            setSpinflag(false);
        }else if(key==3 && afsCommData.length==0){
            setSpinflag(false);
        }else if(key==4 && afsLocalData.length==0){
            setSpinflag(false);
        }else if(key==5 && cbsAgfeeData.length==0){
            setSpinflag(false);
        }else if(key==6 && cbsCommData.length==0){
            setSpinflag(false);
        }else if(key==7 && cbsLocalData.length==0){
            setSpinflag(false);
        }else{ 
            setTimeout(()=>{
                setSpinflag(false);
            } ,1000);
        }
	}

    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form form={queryForm} name='search' onFinish={handleQuery}>
                    <Row>
                        {/* 船东 */}
                        <Select name='shipownerCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} span={6}/>
                        {/* 是否统计美加澳新 */}
                        <Select name='actualFlag' label={<FormattedMessage id='lbl.Statistics-country'/>} options={choose.values} flag={true} span={6} /> 
                        {/* 业务日期 */}
                        <DoubleDatePicker name='activityDate' style={{background:backFlag?'white':'yellow'}} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6}  formlayouts={formlayouts}/>
                    </Row>
                </Form>
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
                    {/* 下载 */}
                    <Button onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    {/* 重置 */}
                    <Button onClick={clearBtn}><ReloadOutlined/><FormattedMessage id='btn.reset' /></Button>
                    {/* 查询 */}
                    <Button onClick={()=>pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search'/></Button>
                </div>
            </div>
            <div className="groupBox">
                <Tabs onChange={callback} activeKey={defaultKey} type="card" defaultActiveKey="1">
                    {/* 汇总 */}
                    <TabPane tab={<FormattedMessage id='lbl.Statistics-all'/>} key="1">
                        <div className="table">
                            <PaginationTable
                                dataSource={tableData}
                                columns={columns}
                                rowKey='uid'
                                pageSize={page.pageSize}
                                current={page.current}
                                total={tabTotal}
                                pageChange={searchSumCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* AFS代理费 */}
                    <TabPane tab={<FormattedMessage id='lbl.Afs-agfee'/>} key="2">
                        <div className="table">
                            <PaginationTable
                                dataSource={afsAgfeeData}
                                columns={afsAgfeeColumns}
                                rowKey='uid'
                                pageSize={page1.pageSize}
                                current={page1.current}
                                total={afsAgfeeTabTotal}
                                pageChange={searchAgCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* AFS佣金 */}
                    <TabPane tab={<FormattedMessage id='lbl.Afs-comm'/>} key="3">
                        <div className="table">
                            <PaginationTable
                                dataSource={afsCommData}
                                columns={afsCommColumns}
                                rowKey='uid'
                                pageSize={page2.pageSize}
                                current={page2.current}
                                total={afsCommTabTotal}
                                pageChange={searchCrCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* AFS Local Charge */}
                    <TabPane tab={<FormattedMessage id='lbl.Afs-local-charge'/>} key="4">
                        <div className="table">
                            <PaginationTable
                                dataSource={afsLocalData}
                                columns={afsLocalColumns}
                                rowKey='uid'
                                pageSize={page3.pageSize}
                                current={page3.current}
                                total={afsLocalTabTotal}
                                pageChange={searchLcrCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* CBS代理费 */}
                    <TabPane tab={<FormattedMessage id='lbl.Cbs-agfee'/>} key="5">
                        <div className="table">
                            <PaginationTable
                                dataSource={cbsAgfeeData}
                                columns={cbsAgfeeColumns}
                                rowKey='uid'
                                pageSize={page4.pageSize}
                                current={page4.current}
                                total={cbsAgfeeTabTotal}
                                pageChange={searchAgCbsCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* CBS佣金 */}
                    <TabPane tab={<FormattedMessage id='lbl.Cbs-comm'/>} key="6">
                        <div className="table">
                            <PaginationTable
                                dataSource={cbsCommData}
                                columns={cbsCommColumns}
                                rowKey='uid'
                                pageSize={page5.pageSize}
                                current={page5.current}
                                total={cbsCommTabTotal}
                                pageChange={searchCrCbsCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* CBS Local Charge */}
                    <TabPane tab={<FormattedMessage id='lbl.Cbs-local-charge'/>} key="7">
                        <div className="table">
                            <PaginationTable
                                dataSource={cbsLocalData}
                                columns={cbsLocalColumns}
                                rowKey='uid'
                                pageSize={page6.pageSize}
                                current={page6.current}
                                total={cbsLocalTabTotal}
                                pageChange={searchLcrCbsCalcResult}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default statisticsReport