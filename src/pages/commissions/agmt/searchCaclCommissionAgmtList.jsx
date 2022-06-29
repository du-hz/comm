/*
 * @Author: Du hongzheng
 * @Date: 2021-10-22 15:15:52
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-03-07 14:40:59
 * @Description: file content
 * @FilePath: /afcm-web/src/pages/commissions/agmt/searchCaclCommissionAgmtList.jsx
 */
// 佣金计算协议
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import CommissionAgmtEdit from './commissionAgmtEdit';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, acquireCompanyData, acquireSelectDataExtend, momentFormat, agencyCodeData, TimesFun } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Tooltip } from 'antd'
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileSearchOutlined,
    DownOutlined,
    UpOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'

let formlayouts = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}

const SearchCaclCommissionAgmtList = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [defCompany, setDefCompany] = useState('');   // 默认公司
    const [agreement, setAgreementType] = useState({});  // 协议类型
    const [commission, setCommission] = useState({});  // 收取Cross Booking佣金
    const [pattern, setPattern] = useState({});  // Cross Booking模式
    const [paidCommissionModel, setPaidCommissionModel] = useState({}); // setPaidCommissionModel第三地付费佣金模式
    const [accountsWay, setAccountsWay] = useState({});  // 记账方式
    const [accountsArithmetic, setAccountsArithmetic] = useState({});  // 记账算法
    const [ytBusiness, setYtBusiness] = useState({});  // 预提是否记账
    const [yfBusiness, setYfBusiness] = useState({});  // 应付实付是否记账 
    const [officeType, setOfficeType] = useState({});  // office类型 
    const [toPayInAdvance, setToPayInAdvance] = useState({});  // 预到付
    const [commissionBasedModel, setCommissionBasedModel] = useState({});  // 佣金模式 
    const [calcMthd, setCalcMthd] = useState({});  // 佣金计算方法 
    const [socEmptyInd, setSocEmptyInd] = useState({});  // SOC空箱标记 
    const [vatFlag, setVatFlag] = useState({});  // 是否含税价 
    const [currCode, setCurrCode] = useState({});  // 币种
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [currentIdx, setCurrentIdx] = useState(1);
    const [tableData, setTableData] = useState([]);     // 编辑查看详情数据
    const [addFlag, setAddFlag] = useState(true);   // 判断是新建或者编辑查看
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [writeRead, setWriteRead] = useState(false);//区别新增编辑查看详情
    const [flag, setFlag] = useState(false);
    const [headerUuid, setHeaderUuid] = useState('');   // 头uuid
    const [title, setTitle] = useState('');     // 弹窗标题
    const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示隐藏
    const cssNone = false;  // button控制
    // const [tableDatas,setTableDatas] = useState([]);
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码

    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [checked, setChecked] = useState([]); // 单选uuid
    const titTooltip = <span style={{ color: '#000' }}><FormattedMessage id='lbl.afcm-0089' /></span>

    // const [header, setHeader] = useState(true);    // table表头切换
    const [page, setPage] = useState({    //分页
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();

    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        acquireCompanyData(setCompanysData, $apiUrl);//公司
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.CB.IND', setCommission, $apiUrl);// 收取Cross Booking佣金
        acquireSelectData('AFCM.AGMT.CB.MODE', setPattern, $apiUrl);// Cross Booking模式
        acquireSelectData('AFCM.AGMT.PAY.ELSWHERE.MODE', setPaidCommissionModel, $apiUrl);// setPaidCommissionModel第三地付费佣金模式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG', setAccountsArithmetic, $apiUrl);// 记账算法
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE', setAccountsWay, $apiUrl);// 记账方式
        acquireSelectData('AFCM.AGMT.YT.BUSINESS', setYtBusiness, $apiUrl);// 预提是否记账  
        acquireSelectData('AFCM.AGMT.YF.BUSINESS', setYfBusiness, $apiUrl);// 应付实付是否记账  
        acquireSelectData('AFCM.AGMT.OFFICE.TYPE', setOfficeType, $apiUrl);// office类型 
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0044', setToPayInAdvance, $apiUrl);// 预到付
        acquireSelectData('CC0013', setCommissionBasedModel, $apiUrl);// 佣金模式
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'COMM.CALC.MTHD.CB0050', setCalcMthd, $apiUrl);// 佣金计算方法
        acquireSelectData('COMM.SOC.EMPTY.IND', setSocEmptyInd, $apiUrl);// SOC空箱标记
        acquireSelectData('AGMT.VAT.FLAG', setVatFlag, $apiUrl);// 是否含税价       
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setCurrCode, $apiUrl);// 币种   
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        CompanysFun();
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            companyCode: defCompany,

        })
    }, [company, acquireData, defCompany])

    // 获取登录公司
    const CompanysFun = async () => {
        let company = await request($apiUrl.CURRENTUSER, {
            method: "POST",
            data: {}
        })
        if (company.success) {
            setDefCompany(company.data.companyCode)
        }
    }

    //localcharge表格文本
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 70,
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(record, index, true) }}><FileSearchOutlined /></a>&nbsp; {/* 查看详情 */}
                    </Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.agreement" />,//协议代码
            dataIndex: 'commissionAgreementCode',
            align: 'left',
            sorter: true,
            key: 'COMM_AGMT_CDE',
            width: 180,
            // sorter: commissionAgreementCode
        }, {
            title: <FormattedMessage id='lbl.carrier' />,//船东
            dataType: acquireData.values,
            dataIndex: 'shipownerCompanyCode',
            align: 'left',
            sorter: true,
            key: 'SO_COMPANY_CDE',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataType: companysData,
            dataIndex: 'companyCode',
            align: 'left',
            sorter: true,
            key: 'COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            align: 'left',
            sorter: true,
            key: 'AGENCY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
            dataIndex: 'commpanyNameAbbr',
            sorter: true,
            key: 'COMPANY_NME_ABBR',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
            dataType: protocolStateData.values,
            dataIndex: 'status',
            align: 'left',
            sorter: true,
            key: 'STATUS',
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.start-date" />,// 开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            align: 'left',
            sorter: true,
            key: 'FM_DTE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.over-date" />,// 结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            sorter: true,
            key: 'TO_DTE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.payment" />,//异地支付
            dataIndex: 'payElsewherePercent',
            align: 'left',
            sorter: true,
            key: 'PAY_ELSEWHERE_PCT',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.off-site-commission" />,//第三地付费佣金模式
            dataIndex: 'payElsewhereMode',
            align: 'left',
            sorter: true,
            key: 'PAY_ELSEWHERE_MDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.all-rate-OFT" />,//All in Rate的OFT比例
            dataIndex: 'allInRate',
            align: 'left',
            sorter: true,
            key: 'ALL_IN_RATE',
            width: 130
        }, {
            title: <FormattedMessage id="lbl.operator" />,//操作人
            dataIndex: 'recordCreateUser',
            align: 'left',
            sorter: true,
            key: 'REC_UPD_USR',
            width: 120
        },
    ]

    // 查看详情
    const commonBtn = async (record, index, flag) => {
        console.log(record, index, flag)
        // 查看详情为true，编辑为false
        setSpinflag(true);
        const result = await request($apiUrl.COMM_SEARCH_CALC_HEAD_DETAIL,
            {
                method: 'POST',
                data: {
                    uuid: record.agreementHeadUuid
                }
            }
        )
        if (result.success) {
            setSpinflag(false);
            console.log(result.data);
            setAddFlag(flag);
            setCommonFlag(flag);
            setWriteRead(false);
            let data = result.data;
            setHeaderUuid(data.agreementHeadUuid);
            data.postCalculationFlag = data.postCalculationFlag + '';
            data.postMode = data.postMode + '';
            data.isYt = data.isYt + '';
            data.isBill = data.isBill + '';
            setIsModalVisible(true);
            // console.log('number改成string类型', data.postCalculationFlag);
            if (flag) {
                // tableData.postCalculationFlag = "1";
                // setTableData(...tableData);
                setTitle(<FormattedMessage id='lbl.ViewDetails' />);
                setFlag(true);
            }
            data.commissionAgmtItems.map((v, i) => {
                v.saveShowHide = false
            })
            setTableData(data);
            // else {
            //     setTableData(data);
            //     setFlag(false)
            // }
        } else {
            Toast('', '', '', 5000, false);
            setSpinflag(false);

        }
    }

    // 查询
    const [tabTotal, setTabTotal] = useState([]);//表格的数据
    const [tableDatas, setTableDatas] = useState([]);
    const pageChange = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);

        setSpinflag(true);
        if (search) {
            pagination.current = 1
        }
        let sorter
        if (options && options.sorter.order) {
            sorter = {
                "field": options.sorter.columnKey,
                "order": options.sorter.order === "ascend" ? 'DESC' : options.sorter.order === "descend" ? 'ASC' : undefined
            }
        }

        let shipperOwner = queryForm.getFieldValue().shipperOwner;
        let queryData = queryForm.getFieldValue();
        if (!shipperOwner) {
            Toast('', formatMessage({ id: "lbl.carrier-bull" }), 'alert-error', 5000, false)
            setSpinflag(false);
        } else {
            setChecked([]);
            const result = await request($apiUrl.COMM_AGMT_SEARCH_CALC_HEAD_LIST, {
                method: "POST",
                data: {
                    "page": pagination,
                    "params": {
                        ...queryData,
                        Date: undefined,
                        fromDate: queryData.Date ? momentFormat(queryData.Date[0]) : undefined,
                        toDate: queryData.Date ? momentFormat(queryData.Date[1]) : undefined,
                    },
                    "sorter": sorter
                }
            })

            if (result.success) {
                // setTabTotal(0);
                // setTableDatas([]);
                setSpinflag(false);
                setPage({ ...pagination })
                let data = result.data
                let datas = result.data.resultList
                setTabTotal(data.totalCount)
                setTableDatas([...datas])
            } else {
                setSpinflag(false);
                setTabTotal(0);
                setTableDatas([]);
                Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        }
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        const result = await request($apiUrl.COMM_EXP_CALC_HEAD_DETAIL, {
            method: "POST",
            data: {
                uuid: checked[0],
                excelFileName: intl.formatMessage({ id: 'menu.afcm.agreement.commission.search-cacl-commission-agmtList' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        // agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        shipownerCompanyCode: intl.formatMessage({ id: "lbl.carrier" }),     // 船东
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        commissionAgreementCode: intl.formatMessage({ id: "lbl.agreement" }),     // 协议代码
                        fromDate: intl.formatMessage({ id: "lbl.effective-start-date" }),     // 开始日期
                        toDate: intl.formatMessage({ id: "lbl.effective-end-date" }),     // 结束日期
                        agreementType: intl.formatMessage({ id: "lbl.protocol-type" }),     // 协议类型
                        crossBookingPercent: intl.formatMessage({ id: "lbl.cross" }),     // Cross Booking
                        crossBookingIndicator: intl.formatMessage({ id: "lbl.crosscommission" }),     // 收取Cross Booking佣金
                        crossBookingMode: intl.formatMessage({ id: "lbl.crosstype" }),     // Cross Booking模式
                        payElsewhereMode: intl.formatMessage({ id: "lbl.third" }),     // 第三地佣金付费模式
                        allInRate: intl.formatMessage({ id: "lbl.rate" }),     // All in Rate
                        payElsewherePercent: intl.formatMessage({ id: "lbl.payment" }),     // 异地支付
                        postCalculationFlag: intl.formatMessage({ id: "lbl.arithmetic" }),     // 记账算法
                        postMode: intl.formatMessage({ id: "lbl.bookkeeping" }),     // 记账方式
                        ygSide: intl.formatMessage({ id: "lbl.estimate" }),     // 向谁预估
                        yfSide: intl.formatMessage({ id: "lbl.make" }),     // 向谁开票
                        sfSide: intl.formatMessage({ id: "lbl.submitanexpenseaccount" }),     // 向谁报账
                        isYt: intl.formatMessage({ id: "lbl.withholding" }),     // 预提是否记账
                        isBill: intl.formatMessage({ id: "lbl.actually" }),     // 应付实付是否记账
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'lbl.afcm-head-mess' }),//sheet名称--表头
                }, {
                    dataCol: {
                        // commissionTypeItemUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        // commissionTypeItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                        calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),     // 计算方法
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        percentage: intl.formatMessage({ id: "lbl.percentage" }),     // 百分比
                        commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),     // 币种
                        crossBookingAdjustment: intl.formatMessage({ id: "lbl.Cross-Booking-adjustment-rate" }),     // Cross Booking调整比率
                        oftTaxPercent: intl.formatMessage({ id: "lbl.Freight-tax" }),     // 运输税
                        vatFlag: intl.formatMessage({ id: "lbl.Whether-the-price-includes-tax" }),     // 是否含税价
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.agreement-item' }),//sheet名称--协议Item
                }, {
                    dataCol: {
                        // commissionTypeItemUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        porCountry: intl.formatMessage({ id: "lbl.porcountry-region" }),     // POR国家/地区
                        fndCountry: intl.formatMessage({ id: "lbl.fdncountry-region" }),     // FND国家/地区
                        officeType: intl.formatMessage({ id: "lbl.office-type" }),     // Office类型
                        officeCode: intl.formatMessage({ id: "lbl.office" }),     // Office
                        oftPc: intl.formatMessage({ id: "lbl.To-pay-in-advance" }),     // 预到付
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        // commissionMode: intl.formatMessage({ id: "lbl.The-Commission" }),     // 佣金模式
                        // calculationMethod: intl.formatMessage({ id: "lbl.Computing-method" }),     // 计算方法
                        socEmptyIndicator: intl.formatMessage({ id: "lbl.empty-box-mark" }),     // SOC空箱标记
                        // commissionTypeItemUuid:formatMessage({id:"lbl.afcm-0040" }),
                        containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                        commissionCurrencyCode: intl.formatMessage({ id: "lbl.ccy" }),     // 币种
                        unitPrice: intl.formatMessage({ id: "lbl.imputed-price" }),     // 计算价格
                        unitPriceType: intl.formatMessage({ id: "lbl.imputed-type" }),     // 计算类型
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.box-calculation-detailed' }),//sheet名称--箱量计算方法明细
                }, {
                    dataCol: {
                        // agreementHeadUuid: formatMessage({ id: "lbl.afcm_comm_details_id" }),
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        containerSizeTypeGroup: intl.formatMessage({ id: "lbl.Box-size-group" }),     // 箱型尺寸组
                        containerSizeType: intl.formatMessage({ id: "lbl.Box-size" }),     // 箱型尺寸
                        cargoNatureCode: intl.formatMessage({ id: "lbl.cargo-class" }),     // 货类

                    },
                    sheetName: intl.formatMessage({ id: 'lbl.group-message' }),//sheet名称--Group信息
                }, {
                    dataCol: {
                        commissionAgreementCode: formatMessage({ id: 'lbl.agreement' }),
                        tradeLane: intl.formatMessage({ id: "lbl.Trade-line" }),     // 贸易线
                        groupCode: intl.formatMessage({ id: "lbl.group" }),     // 组
                    },
                    sheetName: intl.formatMessage({ id: 'lbl.maintain-na' }),//sheet名称---维护NA组
                }],
            },
            responseType: 'blob',
            headers: {
                "biz-source-param": "BLG"
            },
        })
        // if (result && result.success == false) {  //若无数据，则不下载
        //     Toast('', result.errorMessage, 'alert-error', 5000, false);
        //     return
        // } else {
        if (result.size < 1) {
            setSpinflag(false)
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            let blob = new Blob([result], { type: "application/x-xls" });
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.agreement.commission.search-cacl-commission-agmtList' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.agreement.commission.search-cacl-commission-agmtList' }) + '/' + TimesFun() + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setChecked([]);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            companyCode: defCompany,
        }, [company, acquireData, defCompany])
        setTableDatas([]);
    }

    let initData = {
        acquireData: acquireData,         // 船东
        companysData,        // 公司
        agreement: agreement.values,           // 协议类型
        commission: commission.values,          // 收取Cross Booking佣金
        pattern: pattern.values,             // Cross Booking模式
        paidCommissionModel: paidCommissionModel.values, // setPaidCommissionModel第三地付费佣金模式
        accountsArithmetic: accountsArithmetic.values,  // 记账算法
        accountsWay: accountsWay.values,         // 记账方式
        ytBusiness: ytBusiness.values,          // 预提是否记账  
        yfBusiness: yfBusiness.values,          // 应付实付是否记账  

        officeType: officeType.values,          // office类型
        toPayInAdvance: toPayInAdvance.values,      // 预到付
        commissionBasedModel: commissionBasedModel.values,// 佣金模式
        calcMthd: calcMthd.values,            // 佣金计算方法
        socEmptyInd: socEmptyInd.values,         // SOC空箱标记
        vatFlag: vatFlag.values,             // 是否含税价 
        currCode: currCode.values,            // 币种 
        setTableData,       // 编辑查看详情数据

        addFlag,            // 判断是新建或者编辑查看
        commonFlag,         // 控制读写
        writeRead,          // 区别新增编辑查看详情
        flag,               // 弹窗顶部button控制    
        headerUuid,         // 头uuid
        title,              // 弹窗标题
        tableData,          // 编辑查看详情数据
        isModalVisible,     // 弹出框显示隐藏
        setIsModalVisible,  // 关闭弹窗
        cssNone,            // button控制
        agencyCodeDRF: company,
    }

    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form
                    form={queryForm}
                    name='func'
                >
                    <Row>
                        {/* 船东 */}
                        <Select disabled={company.companyType == 0 ? true : false} span={6} name='shipperOwner' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 公司 */}
                        <Select showSearch={true} name='companyCode' flag={true} label={<FormattedMessage id='lbl.company' />} span={6} options={companysData} />
                        <a style={{ color: 'orange' }}><Tooltip color='#e6f7ff' style={{ color: '#000' }} className="tipsContent" title={titTooltip}><InfoCircleOutlined /></Tooltip></a>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select flag={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 协议代码 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.agreement' />} />
                        {/* 代理描述 */}
                        <InputText capitalized={false} name='agencyName' label={<FormattedMessage id='lbl.agent-described' />} span={6} />
                        {/* 生效日期 */}
                        <DoubleDatePicker disabled={[false, false]} span={6} name='Date' label={<FormattedMessage id="lbl.effective-date" />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <CosButton disabled={checked.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='btn.download' /></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <CosButton onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                    <CosButton onClick={() => pageChange(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableDatas}
                    columns={columns}
                    rowKey='agreementHeadUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    selectionType='radio'
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                        }
                    }}
                />
            </div>
            <CommissionAgmtEdit initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default SearchCaclCommissionAgmtList


//  sheetList: [{//sheetList列表
//                     dataCol: {//列表字段
//                         shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),     // 船东
//                         companyCode: intl.formatMessage({id: "lbl.company"}),     // 公司
//                         agencyCode: intl.formatMessage({id: "lbl.agency"}),     // 代理编码
//                         commissionAgreementCode: intl.formatMessage({id: "lbl.agreement"}),     // 协议代码
//                         fromDate: intl.formatMessage({id: "lbl.effective-start-date"}),     // 开始日期
//                         toDate: intl.formatMessage({id: "lbl.effective-end-date"}),     // 结束日期
//                         agreementType: intl.formatMessage({id: "lbl.protocol-type"}),     // 协议类型
//                         crossBookingPercent: intl.formatMessage({id: "lbl.cross"}),     // Cross Booking
//                         crossBookingIndicator: intl.formatMessage({id: "lbl.crosscommission"}),     // 收取Cross Booking佣金
//                         crossBookingMode: intl.formatMessage({id: "lbl.crosstype"}),     // Cross Booking模式
//                         payElsewhereMode: intl.formatMessage({id: "lbl.third"}),     // 第三地佣金付费模式
//                         allInRate: intl.formatMessage({id: "lbl.rate"}),     // All in Rate
//                         payElsewherePercent: intl.formatMessage({id: "lbl.payment"}),     // 异地支付
//                         postCalculationFlag: intl.formatMessage({id: "lbl.arithmetic"}),     // 记账算法
//                         postMode: intl.formatMessage({id: "lbl.bookkeeping"}),     // 记账方式
//                         ygSide: intl.formatMessage({id: "lbl.estimate"}),     // 向谁预估
//                         yfSide: intl.formatMessage({id: "lbl.make"}),     // 向谁开票
//                         sfSide: intl.formatMessage({id: "lbl.submitanexpenseaccount"}),     // 向谁报账
//                         isYt: intl.formatMessage({id: "lbl.withholding"}),     // 预提是否记账
//                         isBill: intl.formatMessage({id: "lbl.company"}),     // 应付实付是否记账
//                     },
//                     sheetName: intl.formatMessage({id: 'menu.afcm.agreement.commission.maintenance'}),//sheet名称--表头
//                 },{
//                     dataCol: {
//                         agreementItemUuid: formatMessage({id:"lbl.afcm_comm_item" }),
//                         porCountry: intl.formatMessage({id: "lbl.porcountry-region"}),     // POR国家/地区
//                         fndCountry: intl.formatMessage({id: "lbl.fdncountry-region"}),     // FND国家/地区
//                         officeType: intl.formatMessage({id: "lbl.office-type"}),     // Office类型
//                         officeCode: intl.formatMessage({id: "lbl.office"}),     // Office
//                         oftPc: intl.formatMessage({id: "lbl.To-pay-in-advance"}),     // 预到付
//                         commissionType: intl.formatMessage({id: "lbl.Commission-type"}),     // 佣金类型
//                         commissionMode: intl.formatMessage({id: "lbl.The-Commission"}),     // 佣金模式
//                         calculationMethod: intl.formatMessage({id: "lbl.Computing-method"}),     // 计算方法
//                         socEmptyIndicator: intl.formatMessage({id: "lbl.empty-box-mark"}),     // SOC空箱标记
//                         percentage: intl.formatMessage({id: "lbl.percentage"}),     // 百分比
//                         commissionCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),     // 币种
//                         crossBookingAdjustment: intl.formatMessage({id: "lbl.Cross-Booking-adjustment-rate"}),     // Cross Booking调整比率
//                         oftTaxPercent: intl.formatMessage({id: "lbl.Freight-tax"}),     // 运输税
//                         vatFlag: intl.formatMessage({id: "lbl.Whether-the-price-includes-tax"}),     // 是否含税价
//                     },
//                     sheetName: intl.formatMessage({id: 'lbl.agreement-item'}),//sheet名称--协议Item
//                 },{
//                     dataCol: {

//                     },
//                     sheetName: intl.formatMessage({id: 'lbl.group-message'}),//sheet名称--Group信息
//                 },{
//                     dataCol: {
//                         tradeLane: intl.formatMessage({id: "lbl.Trade-line"}),     // 贸易线
//                         groupCode: intl.formatMessage({id: "lbl.group"}),     // 组
//                     },
//                     sheetName: intl.formatMessage({id: 'lbl.maintain-na'}),//sheet名称---维护NA组
//                 }],