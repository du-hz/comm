/*
 * @Author: your name
 * @Date: 2021-10-22 15:15:52
 * @LastEditTime: 2022-03-04 17:03:55
 * @LastEditors: Du hongzheng
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /afcm-web/src/pages/commissions/agmt/Demurrage.jsx
 */
// 滞期费/DROP OFF/LOLO佣金费率配置
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, momentFormat, acquireCompanyData, allCompany, acquireSelectDataExtend } from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import { Form, Button, Row, Col, Modal, Tooltip } from 'antd'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import { CosToast } from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import IptNumber from '@/components/Common/IptNumber';

const confirm = Modal.confirm;
import {
    SearchOutlined,// 查询
    ReloadOutlined,// 重置    
    FileSearchOutlined,//查看详情
    FormOutlined,//编辑
    CloudDownloadOutlined, // 下载
    CloseCircleOutlined, // 删除
    FileAddOutlined, // 新增
} from '@ant-design/icons'

const Demurrage = () => {
    const [tableData, setTableData] = useState([]) // 列表
    const [tabTabTotal, setTabTotal] = useState([]) // 列表条数
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [PopupAcquireData, setPopupAcquireData] = useState([]); // 弹窗船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [chargeCode, setChargeCode] = useState({}); // chargeCode数据字典
    const [chargeCodes, setChargeCodes] = useState({}); // chargeCode数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [title, setTitle] = useState('');     // 编辑  ||  查看详情
    // const [checked, setChecked] = useState([]);
    const [calcMthd, setCalcMthd] = useState({});  // 佣金计算方法 
    const [TradeType, setTradeType] = useState([]);  // 贸易类型
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const [Effectiveness, setEffectiveness] = useState({});     // 有效性
    const [whiteList, setWhiteList] = useState({});     // 是否是白名单
    const [uuid, setUuid] = useState('');     // 编辑data的uuid
    // const [selData, setSelData] = useState([]);     // 删除数据
    const [disFlag, setDisFlag] = useState(true);     // 区分查看或编辑
    const [perhaps, setPerhaps] = useState(true);     // 区分新建和编辑
    const [modeArr, setModeArr] = useState(true);     // 计算模式

    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    // from 数据
    const [queryForm] = Form.useForm();

    // 初始化
    useEffect(() => {
        Toast('', '', '', 5000, false);
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'DEM.CR.RATE.POST.TYPE', setCalcMthd, $apiUrl);// 计算基数
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'DEM.CR.RATE.CALC.MDE', setModeArr, $apiUrl);// 计算模式
        acquireSelectData('TRADE.TYPE', setTradeType, $apiUrl);     // 贸易类型
        // acquireCompanyData(setCompanysData, $apiUrl);   // 公司
        allCompany(setCompanysData, $apiUrl);
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('DEM.CR.RATE.COMM.TYPE', setCommType, $apiUrl);     // 佣金类型
        acquireSelectData('VALID.INDICATOR', setEffectiveness, $apiUrl);// 有效性
        acquireSelectData('AFCM.AG.KPI.EVO', setWhiteList, $apiUrl);// 部门
    }, [])

    useEffect(() => {   // 默认值
        carrierFun(company);   // 船东
    }, [company])

    // 船东
    const carrierFun = async (company) => {
        await request.post($apiUrl.COMMON_COMPANY_FINDCARRIERS, {
            method: "POST",
        })
            .then((result) => {
                if (result.success) {
                    let data = result.data;
                    let newData = [];   // 新船东

                    data.map((v, i) => {
                        if (v.label == company.companyCode) {
                            newData.push(v);
                            queryForm.setFieldsValue({
                                carrier: v.value
                            })
                        }
                    })

                    data.map((v, i) => {
                        v.label = v.label + `(${v.value})`;
                    })

                    newData.length > 0 ? data = newData : data;
                    data.unshift({ label: '*', value: "*" });
                    setPopupAcquireData(data);
                }
            })
    }

    // 编辑查看详情公用
    const commonBtn = (record, index, flag) => {
        // 查看详情为true，编辑为false
        flag ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
        setDisFlag(flag);
        setIsModalVisible(true);
        setPerhaps(false);
        setUuid(record.demCreditRouteUuid);
        // selectChangeBtns();
        record.commissionType ? acquireSelectData('DEM.CR.RATE.CHRG.CDE.' + record.commissionType, setChargeCodes, $apiUrl) : null;
        queryForm.setFieldsValue({
            popup: {
                carrier: record.carrier,
                companyCode: record.companyCode,
                commissionType: record.commissionType,
                calculationMode: record.calculationMode,
                tradeType: record.tradeType,
                chargeCode: record.chargeCode,
                postType: record.postType,
                customerSapId: record.customerSapId,
                // departmentCodeIndicator: record.departmentCodeIndicator,
                rate: record.rate,
                fromDate: moment(record.fromDate),
                toDate: moment(record.toDate)
            }
        }, [])
    }

    // 列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            // sorter: false,
            width: 120,
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteTableData(record, true) }}><CloseCircleOutlined /></a>&nbsp;  {/* 删除 */}
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => { commonBtn(record, index, false) }}  ><FormOutlined /></a>&nbsp;  {/* 修改 */}
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(record, index, true) }}><FileSearchOutlined /></a>&nbsp; {/* 查看详情 */}
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.carrier" />,// 船东
            dataIndex: 'carrier',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.company" />,// 公司
            dataType: companysData,
            dataIndex: 'companyCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Commission-type" />,// 佣金类型
            dataType: commType.values,
            dataIndex: 'commissionType',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.tax-rate" />,// 税率
            dataIndex: 'rate',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.CalculationMode" />,// 计算模式
            dataIndex: 'calculationMode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id='lbl.valid' />,// 是否有效
            dataIndex: 'validIndicator',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Calculation-base" />,// 计算基数
            dataIndex: 'postType',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.chargeCode" />,// chargeCode
            dataIndex: 'chargeCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.trade-type" />,// 贸易类型
            dataType: TradeType,
            dataIndex: 'tradeType',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.CUST_SAP_ID" />,// CUST_SAP_ID
            dataIndex: 'customerSapId',
            align: 'left',
            // sorter: true,
            width: 120
            // },{
            //     title: <FormattedMessage id="lbl.DEPT_CDE_IND" />,// 部门
            //     dataIndex: 'departmentCodeIndicator',
            //     align:'left',
            // sorter: true,
            //     width: 120,
        }, {
            title: <FormattedMessage id="lbl.start-date" />,// 开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.over-date" />,// 结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.create-by" />,// 创建人
            dataIndex: 'recordCreateUser',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.create-date" />,// 创建时间
            // dataType: 'dateTime',
            dataIndex: 'recordCreateDatetime',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.modifier" />,// 修改人
            dataIndex: 'recordUpdateUser',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.modification-date" />,// 修改日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            align: 'left',
            // sorter: true,
            width: 120
        }
    ]

    // 查询
    const queryBtn = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        if (search) {
            pagination.current = 1
        }
        let formData = queryForm.getFieldValue();
        setSpinflag(true);
        const result = await request($apiUrl.AFCM_API_CONFIG_SEARCH_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    entryCode: "AFCM_B_DEM_CR_RTE",
                    paramEntity: {
                        carrier: formData.carrier,
                        companyCode: formData.companyCode,
                        commissionType: formData.commissionType,
                        validIndicator: formData.validIndicator,
                        tradeType: formData.tradeType,
                        chargeCode: formData.chargeCode,
                        postType: formData.postType,
                        dateFrom_fromDate: formData.fromDate ? momentFormat(formData.fromDate) : undefined,
                        dateTo_toDate: formData.toDate ? momentFormat(formData.toDate) : undefined,
                    }
                }
            }
        })
        if (result.success) {
            setSpinflag(false);
            setPage({ ...pagination })
            let data = result.data;
            let listdata = data.resultList;
            setTableData(listdata);
            setTabTotal(data.totalCount);
        } else {
            setSpinflag(false);
            setTableData([]);
            setTabTotal(0);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 新建
    const addBtn = () => {
        Toast('', '', '', 5000, false);
        setObjMessage({});
        setIsModalVisible(true);
        setDisFlag(false);
        setPerhaps(true);
        setTitle(<FormattedMessage id='btn.add' />);
    }

    // 删除
    const deleteTableData = async (record, flag) => {
        console.log(record)
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.delete-ok' }),
            okText: formatMessage({ id: 'lbl.confirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const result = await request($apiUrl.AFCM_API_COMM_DELETECREDITROUTE,
                    {
                        method: 'POST',
                        data: {
                            // params: {
                            //     entryCode:"AFCM_B_COMMAG_LOCK",
                            //  },
                            // uuid: flag ? [{demCreditRouteUuid: record.demCreditRouteUuid}] : selData
                            uuid: record.demCreditRouteUuid
                        }
                    })
                if (result.success) {
                    setSpinflag(false);
                    // setSelData([]);
                    queryBtn({ current: 1, pageSize: 10 });
                    Toast('', result.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('', result.errorMessage, 'alert-error', 5000, false)
                }
            }
        })
    }

    // 保存
    const GroupSave = async () => {
        setObjMessage({});
        let queryFormData = queryForm.getFieldValue().popup;
        let fromDate = queryFormData ? queryFormData.fromDate : undefined;
        const toDate = queryFormData ? queryFormData.toDate : undefined;
        // console.log(!queryFormData, !fromDate, !toDate, !queryFormData.carrier)
        if (!queryFormData || (!queryFormData.carrier || !queryFormData.companyCode || !queryFormData.commissionType || !queryFormData.postType || !queryFormData.tradeType || !queryFormData.chargeCode || !queryFormData.calculationMode || !queryFormData.customerSapId || !queryFormData.rate || !fromDate || !toDate)) {
            setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm_demurrage_save' }) });
        } else {
            setSpinflag(true);
            await request.post($apiUrl.AFCM_API_COMM_AGMT_ROUTE_SAVE_OR_UPDATE, {
                method: "POST",
                data: {
                    params: {
                        demCreditRouteUuid: uuid ? uuid : undefined,    // 新增不传
                        // validIndicator: perhaps ? "Y" : undefined,    // 修改可不传
                        ...queryFormData,
                        fromDate: fromDate ? momentFormat(fromDate) : undefined,
                        toDate: toDate ? momentFormat(toDate) : undefined
                    }
                }
            })
                .then((result) => {
                    if (result.success) {
                        setSpinflag(false);
                        // setIsModalVisible(false)
                        // queryBtn(page);
                        setObjMessage({ alertStatus: 'alert-success', message: result.message });
                        // Toast('',result.message, 'alert-success', 5000, false);
                        // queryForm.setFieldsValue({
                        //     popup: null
                        // })
                    } else {
                        setSpinflag(false);
                        setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
                    }
                })
        }
    }

    // 佣金类型与chargeCode联动
    const selectChangeBtn = (value, all) => {
        setChargeCode({});  // 佣金类型
        queryForm.setFieldsValue({
            chargeCode: null
        })
        let data = all.linkage ? all.linkage.value : null;
        data ? acquireSelectData('DEM.CR.RATE.CHRG.CDE.' + data, setChargeCode, $apiUrl) : null;     // chargeCode
    }

    // 佣金类型与chargeCode联动
    const selectChangeBtns = (value, all) => {
        setChargeCodes({});  // 佣金类型
        queryForm.setFieldsValue({
            popup: {
                chargeCode: null
            }
        })
        let data = all.linkage ? all.linkage.value : null;
        console.log(data);
        data ? acquireSelectData('DEM.CR.RATE.CHRG.CDE.' + data, setChargeCodes, $apiUrl) : null;     // chargeCode
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        let formData = queryForm.getFieldValue();
        const result = await request($apiUrl.CONFIG_EXP_LIST, {
            method: "POST",
            data: {
                excelFileName: intl.formatMessage({ id: 'menu.afcm.agreement.commission.Demur' }), //文件名
                params: {
                    entryCode: 'AFCM_B_DEM_CR_RTE',
                    paramEntity: {
                        carrier: formData.carrier,
                        companyCode: formData.companyCode,
                        commissionType: formData.commissionType,
                        validIndicator: formData.validIndicator,
                        tradeType: formData.tradeType,
                        chargeCode: formData.chargeCode,
                        calculationMode: formData.calculationMode,
                        dateFrom_fromDate: formData.fromDate ? momentFormat(formData.fromDate) : undefined,
                        dateTo_toDate: formData.toDate ? momentFormat(formData.toDate) : undefined,
                    }
                },
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        carrier: intl.formatMessage({ id: "lbl.carrier" }),     // 船东
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        commissionType: intl.formatMessage({ id: "lbl.Commission-type" }),     // 佣金类型
                        rate: intl.formatMessage({ id: "lbl.tax-rate" }),     // 税率
                        calculationMode: intl.formatMessage({ id: "lbl.CalculationMode" }),     // 计算模式
                        validIndicator: intl.formatMessage({ id: "lbl.valid" }),     // 是否有效
                        postType: intl.formatMessage({ id: "lbl.postType" }),     // postType
                        chargeCode: intl.formatMessage({ id: "lbl.chargeCode" }),     // chargeCode
                        tradeType: intl.formatMessage({ id: "lbl.trade-type" }),     // 贸易类型
                        customerSapId: intl.formatMessage({ id: "lbl.CUST_SAP_ID" }),     // CUST_SAP_ID
                        // departmentCodeIndicator: intl.formatMessage({id: "lbl.DEPT_CDE_IND"}),     // DEPT_CDE_IND
                        fromDate: intl.formatMessage({ id: "lbl.Starting-time" }),    // 起始时间  
                        toDate: intl.formatMessage({ id: "lbl.Ending-time" }),    // 结束时间  
                        recordCreateDatetime: intl.formatMessage({ id: "lbl.create-date" }),     // 创建时间
                        recordCreateUser: intl.formatMessage({ id: "lbl.create-by" }),     // 创建人
                        recordUpdateDatetime: intl.formatMessage({ id: "lbl.Revision-time" }),     // 修改时间
                        recordUpdateUser: intl.formatMessage({ id: "lbl.modifier" }),     // 修改人
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.agreement.commission.Demur' }),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: { "biz-source-param": "BLG" },
        })
        if (result.size < 1) {
            setSpinflag(false)
            Toast('', formatMessage({ id: 'lbl.Unclock-agFee-download' }), 'alert-error', 5000, false);
            return
        } else {
            let blob = new Blob([result], { type: "application/x-xls" });
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.agreement.commission.Demur' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.agreement.commission.Demur' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 关闭弹窗
    const handleCancel = () => {
        setObjMessage({});
        setChargeCodes({});  // 佣金类型
        setUuid(''); // uuid修改要用
        setIsModalVisible(false);
        queryForm.setFieldsValue({
            popup: null
        })
    }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        carrierFun(company)   // 船东
        setTableData([]);
        setTabTotal([]);
        // setChecked([]);
        // setSelData([]);
        setChargeCode({});  // 佣金类型
        setPage({
            current: 1,
            pageSize: 10
        })
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
                        <Select flag={true} span={6} name='carrier' label={<FormattedMessage id='lbl.carrier' />} options={PopupAcquireData} />
                        {/* 公司 */}
                        <Select showSearch={true} flag={true} span={6} name='companyCode' label={<FormattedMessage id='lbl.company' />} options={companysData} />
                        {/* 佣金类型 */}
                        <Select flag={true} name='commissionType' options={commType.values} selectChange={selectChangeBtn} label={<FormattedMessage id='lbl.Commission-type' />} span={6} />
                        {/* 是否有效 */}
                        <Select flag={true} name='validIndicator' options={Effectiveness.values} label={<FormattedMessage id='lbl.valid' />} span={6} />
                        {/* 贸易类型 */}
                        <Select flag={true} name='tradeType' options={TradeType} label={<FormattedMessage id='lbl.trade-type' />} span={6} />
                        {/* chargeCode */}
                        <Select flag={true} name='chargeCode' options={chargeCode.values} label={<FormattedMessage id='lbl.chargeCode' />} span={6} />
                        {/* <Select style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} /> */}
                        {/* 计算基数 */}
                        <Select flag={true} name='postType' options={calcMthd.values} span={6} label={<FormattedMessage id='lbl.Calculation-base' />} />
                        {/* 有效期 */}
                        {/* <InputText name='referenceType' label={<FormattedMessage id='lbl.ac.invoice.fee-type'/>} span={6}/>   */}
                        {/* 是否启用 */}
                        {/* <Select name='enableFlag' options={Effectiveness.values} span={6}  label={<FormattedMessage id='lbl.Enable'/>}/> */}
                        {/* 生效日期 */}
                        <DatePicker span={6} name='fromDate' label={<FormattedMessage id='lbl.effective-date' />} />
                        {/* 失效日期 */}
                        <DatePicker span={6} name='toDate' label={<FormattedMessage id='lbl.expiration-date' />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    <CosButton onClick={addBtn}>
                        <FileAddOutlined />
                        <FormattedMessage id='lbl.add' />
                    </CosButton>
                    {/* 下载 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></CosButton>
                    {/* <CosButton onClick={deleteTableData} disabled={selData.length ? false : true}> <CloseCircleOutlined /><FormattedMessage id='btn.delete' /></CosButton> */}
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <CosButton onClick={reset}> <ReloadOutlined /><FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                    <CosButton onClick={() => queryBtn(page, null, 'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='demCreditRouteUuid'
                    pageChange={queryBtn}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    rowSelection={null}
                    // rowSelection={{
                    //     selectedRowKeys: checked,
                    //     onChange:(key, row)=>{
                    //         setChecked(key);
                    //         let data = [];
                    //         row.map((v,i) => {
                    //             data.push({demCreditRouteUuid: v.demCreditRouteUuid})
                    //         })
                    //         setSelData(data);
                    //     }
                    // }}
                    pageSize={page.pageSize}
                    current={page.current}
                />
            </div>
            <Modal title={title} visible={isModalVisible} footer={null} width={600} height="50%" onCancel={() => handleCancel()} maskClosable={false}>
                <CosToast toast={objMessage} />
                <div className="topBox">
                    <Form
                        form={queryForm}
                        name='add'
                        preserve={false}
                    >
                        <Row>
                            <Col span={12}>
                                {/* 船东 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'carrier']} label={<FormattedMessage id='lbl.carrier' />} options={PopupAcquireData} />
                            </Col>
                            <Col span={12}>
                                {/* 公司 */}
                                <Select showSearch={true} isSpan={true} disabled={disFlag} span={24} name={['popup', 'companyCode']} label={<FormattedMessage id='lbl.company' />} options={companysData} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 佣金类型 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'commissionType']} selectChange={selectChangeBtns} label={<FormattedMessage id='lbl.Commission-type' />} options={commType.values} />
                            </Col>
                            <Col span={12}>
                                {/* 计算基数 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'postType']} label={<FormattedMessage id='lbl.Calculation-base' />} options={calcMthd.values} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 贸易类型 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'tradeType']} label={<FormattedMessage id='lbl.trade-type' />} options={TradeType} />
                            </Col>
                            <Col span={12}>
                                {/* chargeCode */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'chargeCode']} label={<FormattedMessage id='lbl.chargeCode' />} options={chargeCodes.values} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 计算模式 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'calculationMode']} label={<FormattedMessage id='lbl.CalculationMode' />} options={modeArr.values} />
                            </Col>
                            <Col span={12}>
                                {/* SapId */}
                                <InputText isSpan={true} disabled={disFlag} span={24} name={['popup', 'customerSapId']} label={<FormattedMessage id='lbl.CUST_SAP_ID' />} />
                            </Col>
                        </Row>
                        <Row>
                            {/* <Col span={12}> */}
                            {/* 部门 */}
                            {/* <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'departmentCodeIndicator']} label={<FormattedMessage id='lbl.DEPT_CDE_IND'/>} options={whiteList.values}/>
                            </Col> */}
                            <Col span={12}>
                                {/* 税率 */}
                                {/* <InputText isSpan={true} disabled={disFlag} span={24} name={['popup','rate']} label={<FormattedMessage id='lbl.tax-rate'/>}/> */}
                                <IptNumber isSpan={true} disabled={disFlag} controls={false} span={24} name={['popup', 'rate']} label={<FormattedMessage id='lbl.tax-rate' />} />
                            </Col>
                            <Col span={12}>
                                {/* 生效日期 */}
                                <DatePicker isSpan={true} disabled={disFlag} span={24} name={['popup', 'fromDate']} label={<FormattedMessage id='lbl.effective-date' />} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 失效日期 */}
                                <DatePicker isSpan={true} disabled={disFlag} span={24} name={['popup', 'toDate']} label={<FormattedMessage id='lbl.expiration-date' />} />
                            </Col>
                        </Row>
                    </Form>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 保存 */}
                            <CosButton disabled={disFlag} onClick={() => GroupSave()}><FormattedMessage id='lbl.save' /></CosButton>
                            {/* 取消 */}
                            <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></CosButton>
                        </div>
                    </div>
                </div>
            </Modal>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default Demurrage