// LC报表任务管理
import React, { useEffect, useState, $apiUrl } from 'react'
import { Form, Button, Row, Tabs, Tooltip, Modal, Col } from 'antd'
import { FormattedMessage, formatMessage, useIntl, connect } from 'umi'
import { CosInputText, CosSelect, CosDatePicker, CosButton, CosPaginationTable, CosLoading, CosToast, CosDoubleDatePicker, CosOnceDatePicker } from '@/components/Common/index'
import { acquireSelectDataExtend, agencyCodeData, momentFormat, acquireCompanyData } from '@/utils/commonDataInterface'
import moment from 'moment';
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'

import {
    FileAddOutlined,//新增
    CloudUploadOutlined,//上载
    CloseCircleOutlined,//删除
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SaveOutlined,//保存
    FormOutlined,   //编辑
    PlaySquareOutlined,    // 运行
} from '@ant-design/icons'
const confirm = Modal.confirm

const formlayout1 = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
};

const LCreportForm = (props) => {
    const [queryForm] = Form.useForm();
    const [objMessage, setObjMessage] = useState({})
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableDatas, setTableDatas] = useState([])
    const [tabTotal, setTabTotal] = useState(0)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [loading, setLoading] = useState(false);   // 加载
    const [titlePopup, setTitlePopup] = useState(<FormattedMessage id='btn.add' />); // 弹窗title    
    const [flag, setFlag] = useState(true); // 判断是新增的保存还是编辑的保存
    const [editUuid, setEditUuid] = useState(undefined);   // 编辑的uuid
    const [page, setPage] = useState({
        pageSize: 10,
        current: 1
    })
    useEffect(() => {
        acquireCompanyData(setCompanysData, $apiUrl);   // 公司
    }, [])
    useEffect(() => {
        const { currentUser } = props.user
        queryForm.setFieldsValue({
            search: { companyCode: currentUser.companyCode }
        })
    }, [companysData])

    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    {record.show != 'edit' ? <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { FunctionData(record, 'BASE_LCRTASK_DELETE') }}><CloseCircleOutlined style={{ color: 'red', fontSize: '15px' }} /></a>&nbsp;
                    </Tooltip> : null}&nbsp;
                    {/* 编辑 */}
                    {record.show != 'add' && record.show != 'edit' ? <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => { OpenPopup('btn.edit', record, index) }}><FormOutlined /></a>&nbsp;
                    </Tooltip> : null}&nbsp;
                    {/* 运行 */}
                    {<Tooltip title={<FormattedMessage id='lbl.afcm_LC_Form' />}>
                        <a onClick={() => { FunctionData(record, 'BASE_LCRTASK_EXECUTE') }}><PlaySquareOutlined /></a>&nbsp;
                    </Tooltip>}&nbsp;
                    {/* 生成 */}
                    <Tooltip title={<FormattedMessage id='lbl.download' />}>
                        <a onClick={() => { FunctionData(record, 'BASE_LCRTASK_GENERTERPORT') }}><CloudDownloadOutlined /></a>&nbsp;
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.task_name' />,//任务名称
            dataIndex: 'taskName',
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.LC_fromM' />,//统计开始月份
            dataIndex: 'fromDate',
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.LC_toM' />,//统计结束月份
            dataIndex: 'toDate',
            align: 'left',
            width: 120,
        },
        {
            title: <FormattedMessage id='lbl.LC_taskStatus' />,//任务状态
            dataIndex: 'status',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.LC_implementFromDate' />,//执行开始时间
            dataIndex: 'runSt',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.LC_implementToDate' />,//执行结束时间
            dataIndex: 'runEt',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.LC_enclosureUUID' />,//附件UUID
            dataIndex: 'attUuid',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.ac.pymt.claim-note' />,//备注
            dataIndex: 'note',
            align: 'left',
            width: 120,
        }, {
            title: <FormattedMessage id='lbl.LC_currentLogin_company' />,//当前登陆公司
            dataIndex: 'loginCompanyCode',
            align: 'left',
            width: 120,
        }
    ]

    // 查询
    const pageChange = async (pagination, options, search, mess) => {
        Toast('', '', '', 5000, false);
        setLoading(true);
        if (search) pagination.current = 1
        let formData = queryForm.getFieldValue().search;
        let fromDate = formData.Date ? momentFormat(formData.Date[0]).slice(0, 7) : undefined;
        let newFromDate = fromDate ? fromDate.replace('-', '') : undefined;
        let toDate = formData.Date ? momentFormat(formData.Date[1]).slice(0, 7) : undefined;
        let newToDate = toDate ? toDate.replace('-', '') : undefined;
        const result = await request($apiUrl.BASE_LCRTASK_QUERY, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    ...formData,
                    Date: undefined,
                    fromDate: newFromDate,
                    toDate: newToDate
                }
            }
        })
        if (result.success) {
            setLoading(false);
            setPage({ ...pagination })
            let data = result.data;
            setTableDatas(data.resultList);      // 列表
            setTabTotal(data.totalCount);      // 条数
        } else {
            setLoading(false);
            setTableDatas([]);      // 列表
            setTabTotal(0);      // 条数
            mess ? undefined : Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
        mess ? Toast('', formatMessage({ id: mess }), 'alert-success', 5000, false) : undefined;
    }

    // 新增/修改
    const OpenPopup = (title, record, index) => {
        Toast('', '', '', 5000, false);
        setObjMessage({});
        queryForm.setFieldsValue({
            add: null
        })
        setEditUuid(undefined);     // 编辑的UUid
        title == 'btn.edit' ? setFlag(false) : setFlag(true);      // 控制新增保存和修改的保存
        setAddModalVisible(true);   // 弹窗
        setTitlePopup(<FormattedMessage id={title} />); // 弹窗title 
        if (title == 'btn.edit') {
            setEditUuid(record.taskUuid);
            queryForm.setFieldsValue({
                add: {
                    taskName: record.taskName,
                    fromDate: moment(record.fromDate),
                    note: record.note,
                }
            })
        }
    }

    // 新增保存、修改保存      保存并运行
    const SaveBtn = async (type) => {
        Toast('', '', '', 5000, false);
        let url = flag ? 'BASE_LCRTASK_CREATE' : 'BASE_LCRTASK_UPDATE';
        const formData = queryForm.getFieldValue().add;
        let date = formData ? momentFormat(formData.fromDate).slice(0, 7) : undefined;
        let newDate = date ? date.replace('-', '') : undefined;
        setLoading(true);
        let result = await request.post($apiUrl[url], {
            method: "POST",
            data: {
                page: {
                    current: 0,
                    pageSize: 0
                },
                params: {
                    ...formData,
                    fromDate: newDate,
                    taskUuid: editUuid,
                    withExecute: type == 'submit' ? 'Y' : undefined,
                }
            }
        })
        if (result.success) {
            setLoading(false);
            setAddModalVisible(false);   // 弹窗
            pageChange(page, null, 'search', 'lbl.save-successfully');
        } else {
            setLoading(false);
            setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
        }
    }

    // 删除、运行、生成
    const FunctionData = async (record, url) => {
        const funT = async (mess) => {
            Toast('', '', '', 5000, false);
            setLoading(true);
            let result = await request.post($apiUrl[url], {
                method: "POST",
                data: {
                    uuid: record.taskUuid
                }
            })
            if (result.success) {
                setLoading(false);
                pageChange(page, null, 'search', mess);
            } else {
                setLoading(false);
                Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
        }
        if (url == 'BASE_LCRTASK_DELETE') {      // 删除
            const confirmModal = confirm({
                title: formatMessage({ id: 'lbl.delete' }),
                content: formatMessage({ id: 'lbl.Confirm-deletion' }),
                okText: formatMessage({ id: 'lbl.confirm' }),
                okType: 'danger',
                closable: true,
                cancelText: '',
                async onOk() {
                    confirmModal.destroy()
                    funT('lbl.successfully-delete');
                }
            })
        } else {    // 运行
            funT(url == 'BASE_LCRTASK_EXECUTE' ? "lbl.afcm_LC_Form_Fun" : "lbl.afcm_LC_Form_generate");
        }
    }

    // 重置 
    const resetSearch = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        const { currentUser } = props.user
        queryForm.setFieldsValue({
            search: { companyCode: currentUser.companyCode }
        })
        setTableDatas([]);      // 列表
        setTabTotal(0);      // 条数
        setPage({
            pageSize: 10,
            current: 1
        })

    }

    return <div className='parent-box'>
        {/* <CosToast toast={objMessage} style={{ marginTop: '-20px' }} /> */}
        <div className='header-from'>
            <Form form={queryForm} name='func'>
                <Row>
                    {/* 公司 */}
                    <CosSelect name={['search', 'companyCode']} span={6} label={<FormattedMessage id='lbl.company' />} options={companysData} isSpan={false} />
                    {/*任务名称 */}
                    <CosInputText name={['search', 'taskName']} label={<FormattedMessage id='lbl.task_name' />} span={6} capitalized={false} isSpan={false} />
                    {/* 统计月份 */}
                    <CosDoubleDatePicker name={['search', 'Date']} label={<FormattedMessage id="lbl.LC_statisticaloMnth" />} span={6} isSpan={false} picker='month' />
                    {/* 有效结束日期 */}
                    {/* <CosDatePicker name={['search', 'TO_DTE']} label={<FormattedMessage id="lbl.effective-end-date" />} span={6} isSpan={false} picker='month' /> */}
                </Row>
            </Form>
            {/* 查询条件 */}
            <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
        </div>
        <div className="main-button">
            <div className="button-left">
                {/* 新增 */}
                <CosButton onClick={() => { OpenPopup('btn.add') }}><FileAddOutlined /><FormattedMessage id='btn.add' /></CosButton>
            </div>
            <div className="button-right">
                <CosButton onClick={() => { resetSearch() }}>< ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                <CosButton onClick={() => { pageChange(page, null, 'search') }}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
            </div>
        </div>
        <div className="footer-table budget-tracking">
            <Form form={queryForm} name='func'>
                <CosPaginationTable
                    dataSource={tableDatas}
                    columns={columns}
                    rowKey='taskUuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={null}
                />
            </Form>
        </div>
        <Modal title={titlePopup} maskClosable={false} visible={addModalVisible} onOk={() => { setAddModalVisible(false) }} onCancel={() => { setAddModalVisible(false) }} width={400}>
            <CosToast toast={objMessage} />
            <Form form={queryForm} name='func'>
                <Row>
                    <Col span={24}>
                        {/*任务名称 */}
                        <CosInputText name={['add', 'taskName']} label={<FormattedMessage id='lbl.task_name' />} span={24} capitalized={false} isSpan={true} formlayouts={formlayout1} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        {/* 统计月份 */}
                        <CosOnceDatePicker name={['add', 'fromDate']} label={<FormattedMessage id="lbl.LC_statisticaloMnth" />} span={24} picker='month' isSpan={true} formlayouts={formlayout1} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        {/* 备注 */}
                        <CosInputText name={['add', 'note']} label={<FormattedMessage id='lbl.ac.pymt.claim-note' />} span={24} capitalized={false} isSpan={true} formlayouts={formlayout1} />
                    </Col>
                </Row>
            </Form>
            <div style={{ textAlign: 'center' }}>
                <CosButton onClick={() => { SaveBtn('save') }} style={{ marginRight: '10px' }}><FormattedMessage id='lbl.save' /></CosButton>
                <CosButton onClick={() => { SaveBtn('submit') }}><FormattedMessage id='btn.save.statistical.report' /></CosButton>
            </div>
        </Modal>
        <CosLoading spinning={loading} />
    </div>
}
export default connect(({ user, global }) => ({
    user: user
}))(LCreportForm);