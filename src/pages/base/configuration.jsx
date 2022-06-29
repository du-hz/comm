// 结算币种配置
import React, { useState, useEffect, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, momentFormat, acquireSelectDataExtend } from '@/utils/commonDataInterface';

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
    CloseCircleOutlined,// 删除
    FileAddOutlined,// 新增
    CloudDownloadOutlined, // 下载
} from '@ant-design/icons'

const Configuration = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tableData, setTableData] = useState([]) // 列表
    const [tabTabTotal, setTabTotal] = useState([]) // 列表条数
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [backFlag, setBackFlag] = useState(true);//背景颜色
    const [spinflag, setSpinflag] = useState(false);     // 加载
    // const [commType, setCommType] = useState({}); // 佣金类型数据字典
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [title, setTitle] = useState('');     // 编辑  ||  查看详情
    const [selData, setSelData] = useState([]);     // 删除数据
    const [currency, setCurrency] = useState({});     // 币种
    // const [settlement, seSettlement] = useState([]);     // 结算币种
    // const [Effectiveness, setEffectiveness] = useState({});     // 有效性
    const [disFlag, setDisFlag] = useState(true);     // 区分查看或编辑
    const [perhaps, setPerhaps] = useState(true);     // 区分新建和编辑
    const [uuid, setUuid] = useState(true);     // 编辑data的uuid
    const [checked, setChecked] = useState([]);
    const [objMessage, setObjMessage] = useState({});   // 提示信息对象
    const [whiteList, setWhiteList] = useState({});     // 是否是白名单
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
    }

    // 初始化
    useEffect(() => {
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码

        // acquireSelectData('COMM.TYPE', setCommType, $apiUrl);     // 佣金类型
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'AFCM.PUNISH.CURRENCYCODE', setCurrency, $apiUrl);// 币种
        acquireSelectData('AFCM.ADJ.MANUAL', setWhiteList, $apiUrl);// 是否是白名单
        // acquireSelectData('AFCM.PUNISH.CURRENCYCODE',seSettlement, $apiUrl);// 结算币种
        // acquireSelectData('VALID.INDICATOR',setEffectiveness, $apiUrl);// 有效性

        Toast('', '', '', 5000, false);
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode
        })
    }, [company])

    // 编辑查看详情公用
    const commonBtn = (record, index, flag) => {
        // 查看详情为true，编辑为false
        flag ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
        setDisFlag(flag);
        setIsModalVisible(true);
        setPerhaps(false);
        setUuid(record.agencyCurrencyUuid);
        queryForm.setFieldsValue({
            popup: {
                agencyCode: record.agencyCode,
                validIndicator: record.validIndicator,
                standardCurrencyCode: record.standardCurrencyCode,
                clearingCurrencyCode: record.clearingCurrencyCode,
                fromDate: moment(record.fromDate),
                toDate: moment(record.toDate)
            }
        }, [])
    }

    // 删除
    const deleteTableData = async (record, flag) => {
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            // content: formatMessage({id: 'lbl.delete-ok'}) + record.agencyCurrencyUuid + formatMessage({id: 'lbl.de-data'}),
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
                                entryCode: "AFCM_B_AGENCY_CCY"
                            },
                            paramsList: flag ? [{ agencyCurrencyUuid: record.agencyCurrencyUuid }] : selData
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
                        <a><CosButton auth='AFCM-BASE-CONFIG-001-B02' onClick={() => { deleteTableData(record, true) }}><CloseCircleOutlined style={{ color: 'red', fontSize: '15px' }} /></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        {/* <a onClick={() => { commonBtn(record, index, false) }}  ><FormOutlined /></a>&nbsp; */}
                        <a><CosButton auth='AFCM-BASE-CONFIG-001-B03' onClick={() => { commonBtn(record, index, false) }}><FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a onClick={() => { commonBtn(record, index, true) }}><FileSearchOutlined /></a>&nbsp; {/* 查看详情 */}
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.seq" />,// 序号
            dataIndex: 'agencyCurrencyUuid',
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
            title: <FormattedMessage id="lbl.Standard-currency" />,// 本位币种
            dataType: currency.values,
            dataIndex: 'standardCurrencyCode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.settlement-currency" />,// 结算币种
            dataType: currency.values,
            dataIndex: 'clearingCurrencyCode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id='lbl.valid-date' />,// 有效日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.closingDate" />,// 截止日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Effectiveness" />,// 有效性
            dataType: whiteList.values,
            dataIndex: 'validIndicator',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.update-by" />,// 更新人
            dataIndex: 'recordUpdateUser',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.update-date" />,// 更新时间
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDate',
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
        // if(!formData.agencyCode){
        //     setBackFlag(false);
        //     //代理编码必须输入
        //     Toast('',formatMessage({id: 'lbl.The-proxy-code-must-be-entered'}), 'alert-error', 5000, false);
        // }else{
        setBackFlag(true)
        setSpinflag(true);
        const result = await request($apiUrl.CONFIG_SEARCH_LIST, {
            method: "POST",
            data: {
                page: pagination,
                params: {
                    entryCode: "AFCM_B_AGENCY_CCY",
                    paramEntity: {
                        // ...formData
                        agencyCode: formData.agencyCode
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
    const setSelectedRows = (val) => {
        let data = [];
        val.map((v, i) => {
            data.push({ agencyCurrencyUuid: v.agencyCurrencyUuid })
        })
        setSelData(data);
    }

    // 新建
    const addBtn = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(true);
        setDisFlag(false);
        setPerhaps(true);
        setTitle(<FormattedMessage id='btn.add' />);
    }

    // 关闭弹窗
    const handleCancel = () => {
        setObjMessage({});
        setIsModalVisible(false);
        queryForm.setFieldsValue({
            popup: null
        })
    }

    // 保存
    const PopupSave = async () => {
        let queryFormData = queryForm.getFieldValue().popup;
        let fromDate = queryFormData ? queryFormData.fromDate : undefined;
        const toDate = queryFormData ? queryFormData.toDate : undefined;
        if (queryFormData && (queryFormData.agencyCode && queryFormData.validIndicator && queryFormData.standardCurrencyCode && queryFormData.clearingCurrencyCode && toDate && fromDate)) {
            setSpinflag(true);
            await request.post($apiUrl[perhaps ? 'AGENCYCURRENCY_ADDAGENCUCURRENCY' : 'AGENCYCURRENCY_UPDATEAGENCYCURRENCY'], {
                method: "POST",
                data: {
                    page: {
                        "current": 0,
                        "pageSize": 0
                    },
                    params: {
                        ...queryFormData,
                        agencyCurrencyUuid: perhaps ? undefined : uuid,
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
                        // queryForm.setFieldsValue({
                        //     popup: null
                        // })
                    } else {
                        setSpinflag(false);
                        setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
                    }
                })
        } else {
            setObjMessage({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.configuration-save' }) });
        }
    }

    // 下载
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.CONFIG_EXP_LIST, {
            method: "POST",
            data: {
                excelFileName: intl.formatMessage({ id: 'menu.afcm.base.configuration' }), //文件名
                params: {
                    entryCode: 'AFCM_B_AGENCY_CCY',
                    paramEntity: {
                        agencyCode: queryData.agencyCode
                    }
                },
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        agencyCurrencyUuid: intl.formatMessage({ id: "lbl.seq" }),     // 序号
                        agencyCode: intl.formatMessage({ id: "lbl.agency" }),     // 代理编码
                        standardCurrencyCode: intl.formatMessage({ id: "lbl.Standard-currency" }),    // 本位币种  
                        clearingCurrencyCode: intl.formatMessage({ id: "lbl.settlement-currency" }),    // 结算币种  
                        fromDate: intl.formatMessage({ id: "lbl.valid-date" }),    // 有效日期  
                        toDate: intl.formatMessage({ id: "lbl.closingDate" }),    // 截止日期  
                        validIndicator: intl.formatMessage({ id: "lbl.Effectiveness" }),  // 有效性
                        recordUpdateUser: intl.formatMessage({ id: "lbl.update-by" }),  // 更新人
                        recordUpdateDate: intl.formatMessage({ id: "lbl.update-date" }),  // 更新时间
                    },
                    // sumCol: {//汇总字段
                    // },
                    sheetName: intl.formatMessage({ id: 'menu.afcm.base.configuration' }),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.base.configuration' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.base.configuration' }) + '.xlsx'; // 下载后文件名
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
            agencyCode: company.agencyCode,
        }, [company])
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
                >
                    <Row>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText styleFlag={backFlag} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select showSearch={true} style={{ background: backFlag ? "white" : "yellow" }} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CONFIG-001-B01'>
                        <FileAddOutlined />
                        <FormattedMessage id='lbl.new-btn' />
                    </CosButton>
                    {/* 删除 */}
                    <CosButton onClick={deleteTableData} auth='AFCM-BASE-CONFIG-001-B02' disabled={selData.length ? false : true}> <CloseCircleOutlined /><FormattedMessage id='btn.delete' /></CosButton>
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
                    rowKey='agencyCurrencyUuid'
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
                                data.push({ agencyCurrencyUuid: v.agencyCurrencyUuid })
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
                <div className="topBox" style={{ minWidth: '367px' }}>
                    <Form
                        form={queryForm}
                        name='add'
                    // onFinish={handleQuery}
                    >
                        <Row>
                            <Col span={12}>
                                {/* 代理编码 */}
                                {/* <Select isSpan={true} disabled={disFlag} showSearch={true} span={24} name={['popup','agencyCode']} label={<FormattedMessage id='lbl.agency'/>} options={agencyCode}/> */}
                                {
                                    company.companyType == 0 ? <InputText isSpan={true} disabled={disFlag} span={24} name={['popup', 'agencyCode']} label={<FormattedMessage id='lbl.agency' />} /> : <Select isSpan={true} disabled={disFlag} showSearch={true} span={24} name={['popup', 'agencyCode']} label={<FormattedMessage id='lbl.agency' />} options={agencyCode} />
                                }
                            </Col>
                            <Col span={12}>
                                {/* 有效性 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'validIndicator']} label={<FormattedMessage id='lbl.Effectiveness' />} options={whiteList.values} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 本位币 */}
                                <Select isSpan={true} disabled={disFlag} showSearch={true} span={24} name={['popup', 'standardCurrencyCode']} label={<FormattedMessage id='lbl.standard-money' />} options={currency.values} />
                            </Col>
                            <Col span={12}>
                                {/* 结算币种 */}
                                <Select isSpan={true} disabled={disFlag} span={24} name={['popup', 'clearingCurrencyCode']} label={<FormattedMessage id='lbl.settlement-currency' />} options={currency.values} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {/* 开始日期 */}
                                <DatePicker isSpan={true} disabled={disFlag} span={24} name={['popup', 'fromDate']} label={<FormattedMessage id='lbl.start-date' />} />
                            </Col>
                            <Col span={12}>
                                {/* 截止日期 */}
                                <DatePicker isSpan={true} disabled={disFlag} span={24} name={['popup', 'toDate']} label={<FormattedMessage id='lbl.closingDate' />} />
                            </Col>
                        </Row>
                    </Form>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 保存 */}
                            <CosButton auth="AFCM-BASE-CONFIG-001-B04" disabled={disFlag} onClick={() => PopupSave()}><FormattedMessage id='lbl.save' /></CosButton>
                            {/* 取消 */}
                            <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></CosButton>
                        </div>
                    </div>
                </div>
                {/* </Modal> */}
            </CosModal>
            <Loading spinning={spinflag} />
        </div>
    )
}
export default Configuration


