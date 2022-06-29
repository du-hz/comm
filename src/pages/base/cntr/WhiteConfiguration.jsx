// 白名单配置
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, momentFormat, acquireCompanyData, acquireSelectDataExtend, allCompany } from '@/utils/commonDataInterface';

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
import CosModal from '@/components/Common/CosModal'

const confirm = Modal.confirm;
import {
    SearchOutlined,// 查询
    ReloadOutlined,// 重置    
    FileSearchOutlined,//查看详情
    FormOutlined,//编辑
    CloseCircleOutlined, // 删除
    FileAddOutlined, // 新增
    CloudDownloadOutlined, // 下载
} from '@ant-design/icons'

const Configuration = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tableData, setTableData] = useState([]) // 列表
    const [tabTabTotal, setTabTotal] = useState([]) // 列表条数
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [title, setTitle] = useState('');     // 编辑  ||  查看详情
    const [checked, setChecked] = useState([]);
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象

    const [type, setType] = useState({});     // 类型

    const [whiteList, setWhiteList] = useState({});     // 是否是白名单
    const [uuid, setUuid] = useState(true);     // 编辑data的uuid
    const [selData, setSelData] = useState([]);     // 删除数据
    const [disFlag, setDisFlag] = useState(true);     // 区分查看或编辑
    const [perhaps, setPerhaps] = useState(true);     // 区分新建和编辑

    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })

    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode": null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
    // from 数据
    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        console.log(queryForm.getFieldValue())
    }

    // 初始化
    useEffect(() => {
        Toast('', '', '', 5000, false);
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东

        // acquireCompanyData(setCompanysData, $apiUrl, true);   // 公司
        allCompany(setCompanysData, $apiUrl, true);
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     // 佣金类型
        acquireSelectData('AFCM.ADJ.MANUAL', setWhiteList, $apiUrl);// 是否是白名单
        acquireSelectData('COMMAG.LOCK.HRCHY_TYPE', setType, $apiUrl);// 类型

    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    // 编辑查看详情公用
    const commonBtn = (record, index, flag) => {
        // 查看详情为true，编辑为false
        flag ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
        setDisFlag(flag);
        setIsModalVisible(true);
        setPerhaps(false);
        setUuid(record.commagLockUuid);
        queryForm.setFieldsValue({
            popup: {
                shipownerCompanyCode: record.shipownerCompanyCode,
                companyCode: record.companyCode,
                agencyCode: record.agencyCode,
                hierarchyType: record.hierarchyType,
                referenceType: record.referenceType,
                whiteFlag: record.whiteFlag,
                enableFlag: record.enableFlag,
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
                return <div className='operation'>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        {/* <a onClick={() => { deleteTableData(record, true) }}><CloseCircleOutlined /></a>&nbsp; */}
                        <a><CosButton auth='AFCM-BASE-CMS-003-B02' onClick={() => { deleteTableData(record, true) }}><CloseCircleOutlined style={{ color: 'red', fontSize: '15px' }} /></CosButton></a>
                    </Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-003-B02' onClick={() => { commonBtn(record, index, false) }}><FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></CosButton></a>
                    </Tooltip>
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(record, index, true) }}><FileSearchOutlined /></a>
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.carrier" />,// 船东
            dataType: acquireData.values,
            dataIndex: 'shipownerCompanyCode',
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
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.ac.field.field-type-short" />,// 类型
            dataType: type.values,
            dataIndex: 'hierarchyType',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,// 费用类型
            dataIndex: 'referenceType',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id='lbl.effective-date' />,// 生效日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.expiration-date" />,// 失效日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.WhiteList" />,// 是否是白名单
            dataType: whiteList.values,
            dataIndex: 'whiteFlag',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Enable" />,// 是否启用
            dataType: whiteList.values,
            dataIndex: 'enableFlag',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Record-update-time" />,// 记录更新时间
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Record-update-by" />,// 记录更新人员
            dataIndex: 'recordUpdateUser',
            align: 'left',
            // sorter: true,
            width: 120,
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
        const result = await request($apiUrl.CONFIG_SEARCH_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    entryCode: "AFCM_B_COMMAG_LOCK",
                    paramEntity: {
                        shipownerCompanyCode: formData.shipownerCompanyCode,
                        companyCode: formData.companyCode,
                        agencyCode: formData.agencyCode,
                        whiteFlag: formData.whiteFlag,
                        hierarchyType: formData.hierarchyType,
                        referenceType: formData.referenceType,
                        enableFlag: formData.enableFlag,
                        dateFrom_fromDate: formData.fromDate ? momentFormat(formData.fromDate) : undefined,
                        dateTo_fromDate: formData.toDate ? momentFormat(formData.toDate) : undefined,
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
            Toast('', result.errorMessage, 'alert-error', 5000, false)
        }
        // }
    }

    // 多选
    // const setSelectedRows = (val) =>{
    //     let data = [];
    //     val.map((v,i) => {
    //         data.push({commagLockUuid: v.commagLockUuid})
    //     })
    //     setSelData(data);
    //     console.log(selData);
    // }

    // 新建
    const addBtn = () => {
        Toast('', '', '', 5000, false);
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
                const result = await request($apiUrl.CONFIG_DELETEBATCH,
                    {
                        method: 'POST',
                        data: {
                            params: {
                                entryCode: "AFCM_B_COMMAG_LOCK"
                            },
                            paramsList: flag ? [{ commagLockUuid: record.commagLockUuid }] : selData
                        }
                    })
                if (result.success) {
                    setSpinflag(false);
                    setSelData([]);
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
        let queryFormData = queryForm.getFieldValue().popup;
        let fromDate = queryFormData ? queryFormData.fromDate : undefined;
        const toDate = queryFormData ? queryFormData.toDate : undefined;
        // console.log(queryFormData)
        // console.log(queryFormData.shipownerCompanyCode)
        if (!queryFormData) {
            setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.white-query' }) });
        } else {
            if (queryFormData.shipownerCompanyCode &&
                queryFormData.companyCode &&
                queryFormData.hierarchyType &&
                queryFormData.referenceType &&
                queryFormData.whiteFlag &&
                queryFormData.enableFlag &&
                fromDate &&
                toDate) {
                await request.post($apiUrl['COMMAGLOCK_ADDCOMMAGLOCK'], {
                    method: "POST",
                    data: {
                        page: {
                            "current": 0,
                            "pageSize": 0
                        },
                        params: {
                            ...queryFormData,
                            commagLockUuid: perhaps ? undefined : uuid,
                            fromDate: fromDate ? momentFormat(fromDate) : undefined,
                            toDate: toDate ? momentFormat(toDate) : undefined
                        }
                    }
                })
                    .then((result) => {
                        if (result.success) {
                            // setIsModalVisible(false)
                            // queryBtn(page);
                            // Toast('',result.message, 'alert-success', 5000, false);
                            // queryForm.setFieldsValue({
                            //     popup: null
                            // })
                            setObjMessage({ alertStatus: 'alert-success', message: result.message });
                        } else {
                            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
                        }
                    })
            } else {
                setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.white-query' }) });
            }
        };
    }

    // 关闭弹窗
    const handleCancel = () => {
        setObjMessage({});
        setIsModalVisible(false);
        queryForm.setFieldsValue({
            popup: null
        })
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.CONFIG_EXP_LIST, {
            method: "POST",
            data: {
                excelFileName: intl.formatMessage({ id: 'menu.afcm.base.cntr.whiteConfiguration' }), //文件名
                params: {
                    entryCode: 'AFCM_B_COMMAG_LOCK',
                    paramEntity: {
                        shipownerCompanyCode: queryData.shipownerCompanyCode,
                        companyCode: queryData.companyCode,
                        agencyCode: queryData.agencyCode,
                        whiteFlag: queryData.whiteFlag,
                        hierarchyType: queryData.hierarchyType,
                        referenceType: queryData.referenceType,
                        enableFlag: queryData.enableFlag,
                        dateFrom_fromDate: queryData.fromDate ? momentFormat(queryData.fromDate) : undefined,
                        dateTo_fromDate: queryData.toDate ? momentFormat(queryData.toDate) : undefined,
                    }
                },
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        shipownerCompanyCode: intl.formatMessage({ id: "lbl.carrier" }),     // 船东
                        companyCode: intl.formatMessage({ id: "lbl.company" }),     // 公司
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        hierarchyType: intl.formatMessage({ id: "lbl.ac.field.field-type-short" }),     // 类型
                        referenceType: intl.formatMessage({ id: "lbl.ac.invoice.fee-type" }),     // 费用类型
                        fromDate: intl.formatMessage({ id: "lbl.effective-date" }),     // 生效日期
                        toDate: intl.formatMessage({ id: "lbl.expiration-date" }),     // 失效日期
                        whiteFlag: intl.formatMessage({ id: "lbl.WhiteList" }),     // 是否是白名单
                        enableFlag: intl.formatMessage({ id: "lbl.Enable" }),     // 是否启用
                        recordUpdateDatetime: intl.formatMessage({ id: "lbl.Record-update-time" }),     // 记录更新时间
                        recordUpdateUser: intl.formatMessage({ id: "lbl.Record-update-by" }),     // 记录更新人员
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.base.cntr.whiteConfiguration' }),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: {
                "biz-source-param": "BLG"
            },
            // headers: {
            //     'Content-Type': 'application/json;charset=UTF-8'
            // },
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
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.base.cntr.whiteConfiguration' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.base.cntr.whiteConfiguration' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
        setTableData([]);
        setTabTotal([]);
        setChecked([]);
        setSelData([]);
    }

    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}
                    normalize={(value, prevValue, prevValues) => {
                        return value.toUpperCase();
                    }}
                >
                    <Row>
                        {/* 船东 */}
                        <Select disabled={company.companyType == 0} span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                        {/* 公司 */}
                        <Select showSearch={true} flag={true} span={6} name='companyCode' label={<FormattedMessage id='lbl.company' />} options={companysData} />
                        {/* 代理编码 */}
                        {/* <Select name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} /> */}
                        <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} />
                        {/* 生效日期 */}
                        <DatePicker span={6} name='fromDate' label={<FormattedMessage id='lbl.effective-date' />} />
                        {/* 失效日期 */}
                        <DatePicker span={6} name='toDate' label={<FormattedMessage id='lbl.expiration-date' />} />
                        {/* 是否是白名单 */}
                        <Select flag={true} name='whiteFlag' label={<FormattedMessage id='lbl.WhiteList' />} span={6} options={whiteList.values} />
                        {/* <Select style={{background: backFlag ? "white" : "yellow"}} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} /> */}
                        {/* 类型 */}
                        <Select flag={true} name='hierarchyType' options={type.values} span={6} label={<FormattedMessage id='lbl.ac.field.field-type-short' />} />
                        {/* 费用类型 */}
                        <InputText name='referenceType' label={<FormattedMessage id='lbl.ac.invoice.fee-type' />} span={6} />
                        {/* 是否启用 */}
                        <Select flag={true} name='enableFlag' options={whiteList.values} span={6} label={<FormattedMessage id='lbl.Enable' />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    <CosButton auth='AFCM-BASE-CMS-003-B01' onClick={addBtn}>
                        <FileAddOutlined />
                        <FormattedMessage id='lbl.new-btn' />
                    </CosButton>
                    {/* 删除 */}
                    <CosButton auth='AFCM-BASE-CMS-003-B02' onClick={deleteTableData} disabled={selData.length ? false : true}> <CloseCircleOutlined /><FormattedMessage id='btn.delete' /></CosButton>
                    {/* 下载按钮 */}
                    <CosButton disabled={tableData.length ? false : true} onClick={downloadBtn}><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></CosButton>
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
                    rowKey='commagLockUuid'
                    pageChange={queryBtn}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
                    // setSelectedRows={setSelectedRows}
                    // rowSelection={null}
                    rowSelection={{
                        selectedRowKeys: checked,
                        onChange: (key, row) => {
                            setChecked(key);
                            let data = [];
                            row.map((v, i) => {
                                data.push({ commagLockUuid: v.commagLockUuid })
                            })
                            setSelData(data);
                        }
                    }}
                    pageSize={page.pageSize}
                    current={page.current}
                />
            </div>
            <CosModal cbsWidth={600} cbsVisible={isModalVisible} cbsTitle={title} cbsFun={() => handleCancel()}>
                {/* <Modal title={title} visible={isModalVisible} footer={null} width={600} height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
                <CosToast toast={objMessage} />
                <div className="topBox" style={{ minWidth: '425px' }}>
                    <Form
                        form={queryForm}
                        name='add'
                        preserve={false}
                    >
                        <Row>
                            <Col span={12}>
                                {/* 船东 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'shipownerCompanyCode']} label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 公司 */}
                                <Select showSearch={true} isSpan={true} disabled={disFlag} span={24} name={['popup', 'companyCode']} label={<FormattedMessage id='lbl.company' />} options={companysData} />
                            </Col>
                            <Col span={12}>
                                {/* 代理编码 */}
                                {/* <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'agencyCode']} label={<FormattedMessage id='lbl.agency' />} options={agencyCode} /> */}
                                <InputText isSpan={true} disabled={disFlag} span={24} name={['popup', 'agencyCode']} label={<FormattedMessage id='lbl.agency' />} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 类型 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'hierarchyType']} label={<FormattedMessage id='lbl.ac.field.field-type-short' />} options={type.values} />
                            </Col>
                            <Col span={12}>
                                {/* 费用类型 */}
                                <InputText isSpan={true} span={24} disabled={disFlag} name={['popup', 'referenceType']} label={<FormattedMessage id='lbl.ac.invoice.fee-type' />} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 生效日期 */}
                                <DatePicker isSpan={true} disabled={disFlag} span={24} name={['popup', 'fromDate']} label={<FormattedMessage id='lbl.effective-date' />} />
                            </Col>
                            <Col span={12}>
                                {/* 失效日期 */}
                                <DatePicker isSpan={true} disabled={disFlag} span={24} name={['popup', 'toDate']} label={<FormattedMessage id='lbl.expiration-date' />} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 是否是白名单 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'whiteFlag']} label={<FormattedMessage id='lbl.WhiteList' />} options={whiteList.values} />
                            </Col>
                            <Col span={12}>
                                {/* 是否启用 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'enableFlag']} label={<FormattedMessage id='lbl.Enable' />} options={whiteList.values} />
                            </Col>
                        </Row>
                    </Form>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 保存 */}
                            <CosButton disabled={disFlag} auth='AFCM-BASE-CMS-003-B03' onClick={() => GroupSave()}><FormattedMessage id='lbl.save' /></CosButton>
                            {/* 取消 */}
                            <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></CosButton>
                        </div>
                    </div>
                </div>
            </CosModal>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default Configuration