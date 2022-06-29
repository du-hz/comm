/*
 * @Author: Du hongzheng
 * @Date: 2022-03-31 14:11:58
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-04-06 02:03:19
 * @Description: file content
 * @FilePath: /afcm-web/src/pages/base/TrainComm.jsx
 */


// 班列佣金
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

import TeainEdit from './TrainEdit';

const confirm = Modal.confirm;
import {
    SearchOutlined,// 查询
    ReloadOutlined,// 重置   
    ReadOutlined,
    FileSearchOutlined,//查看详情
    FormOutlined,//编辑
    CloseCircleOutlined,// 删除
    FileAddOutlined,// 新增
    CloudDownloadOutlined, // 下载
} from '@ant-design/icons'

const TrainComm = () => {
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [tableData, setTableData] = useState([{}]) // 列表
    const [tabTabTotal, setTabTotal] = useState([]) // 列表条数
    const [spinflag, setSpinflag] = useState(false);     // 加载


    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [title, setTitle] = useState('');     // 弹窗标题
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    const [queryForm] = Form.useForm();

    // 初始化
    useEffect(() => {
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码

    }, [])

    //localcharge表格文本
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation'>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a> <CosButton auth='AFCM_AGMT_COMM_001_B04'><CloseCircleOutlined /> </CosButton></a>
                    </Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CONFIG-001-B03'><FormOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></CosButton> </a>
                    </Tooltip>&nbsp;&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}>
                        <a><FileSearchOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></a> {/* 查看详情 */}
                    </Tooltip>&nbsp;&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}>
                        <a><ReadOutlined style={{ color: '#2795f5', fontSize: '15px' }} /></a>
                    </Tooltip>
                </div>
            }
        }, {
            title: <FormattedMessage id="lbl.protocol" />,// 协议号
            dataIndex: 'standardCurrencyCode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.carrier" />,// 船东
            dataIndex: 'clearingCurrencyCode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id='lbl.route' />,// 航线
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Loading-port" />,// 装港
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Unloading-port" />,// 卸港
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.start-date" />,// 开始日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.over-date" />,// 结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ProtocolState" />,// 协议状态
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Take-effect-sign" />,// 有效标识
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.ac.pymt.claim-note" />,// 备注
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.train-comm-001" />,// 创建用户
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.train-comm-002" />,// 创建时间
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.Update-users-comm" />,// 更新用户
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.update-date" />,// 更新时间
            dataType: 'dateTime',
            dataIndex: 'toDate',
            align: 'left',
            // sorter: true,
            width: 120,
        },
    ]

    // 查询
    const queryBtn = async (pagination, options, search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        if (search) {
            pagination.current = 1
        }
        let queryData = queryForm.getFieldValue();
        // /afcm/api/banlie/agmt/agmt/search/banlie-head-list
        const result = await request($apiUrl.COMM_AGMT_SEARCH_CALC_HEAD_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    ...queryData,
                }
            }
        })

        if (result.success) {

        } else {

            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    // 新增
    const addBtn = () => {
        true ? setTitle(<FormattedMessage id='lbl.ViewDetails' />) : setTitle(<FormattedMessage id='btn.edit' />);
        setIsModalVisible(true);
    }

    // 重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        // queryForm.setFieldsValue({
        //     agencyCode: company.agencyCode,
        // }, [company])
    }

    const initData = {
        isModalVisible,      // 弹出框显示隐藏
        setIsModalVisible,   // 关闭弹窗
        title,				// 弹窗标题
        acquireData,        // 船东
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
                        {/* 航线 */}
                        <Select span={6} name='shipperOwner' label={<FormattedMessage id='lbl.route' />} options={acquireData.values} />
                        {/* 装港 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.Loading-port' />} />
                        {/* 卸港 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.Unloading-port' />} />
                        {/* 协议状态 */}
                        <Select span={6} name='shipperOwner' label={<FormattedMessage id='lbl.ProtocolState' />} options={acquireData.values} />
                        {/* 协议号 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.protocol' />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CONFIG-001-B01'>
                        <FileAddOutlined />
                        <FormattedMessage id='lbl.add' />
                    </CosButton>
                    {/* 下载按钮 */}
                    <CosButton><CloudDownloadOutlined /> <FormattedMessage id='lbl.download' /></CosButton>
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
                    pageSize={page.pageSize}
                    current={page.current}
                />
            </div>
            <TeainEdit initData={initData} />
            <Loading spinning={spinflag} />
        </div>
    )
}
export default TrainComm


