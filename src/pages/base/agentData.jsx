/*
 * @Author: Du hongzheng
 * @Date: 2022-02-21 15:52:39
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-03-03 17:44:32
 * @Description: file content
 * @FilePath: /afcm-web/src/pages/base/agentData.jsx
 */
{/*代理主数据*/ }
import React, { useEffect, useState, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import { agencyCodeData, allCompany } from '@/utils/commonDataInterface';
import { Form, Button, Row, Col, Modal, Tooltip } from 'antd'
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import CosButton from '@/components/Common/CosButton'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading'

import {
    SearchOutlined,// 查询
    ReloadOutlined,// 重置 
} from '@ant-design/icons'

const agentData = () => {
    const [queryForm] = Form.useForm();

    const [tableData, setTableData] = useState([]);     // table数据
    const [tabTotal, setTabTotal] = useState([]);//table条数
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    })
    // 初始化
    useEffect(() => {
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        Toast('', '', '', 5000, false);
    }, [])

    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode
        })
    }, [company])

    // 列表
    const columns = [
        {
            title: <FormattedMessage id="lbl.agency" />,// 代理编码
            dataIndex: 'agencyCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.companyCode" />,// 公司编码
            dataIndex: 'agencyCompanyCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.afcm-0096" />,// 数据包对应代理编码
            dataIndex: 'pkgAgencyCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.afcm-0090" />,// 对应船代的公司代码
            dataIndex: 'feeCompanyCode',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Agent-name" />,// 代理名称
            dataIndex: 'agencyName',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.afcm-0091" />,// 代理名称（EN）
            dataIndex: 'agencyNameEn',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.standard-money" />,// 本位币
            dataIndex: 'standardCurrencyCode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id="lbl.afcm-0092" />,// 结算币
            dataIndex: 'clearingCurrencyCode',
            align: 'left',
            // sorter: true,
            width: 130
        }, {
            title: <FormattedMessage id='lbl.afcm-0093' />,// EP mode
            dataIndex: 'epMode',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.afcm-0094" />,// Profit center mode
            dataIndex: 'profitCenterMode',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.afcm-0095" />,// Batch id
            dataIndex: 'batchId',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Counry-area" />,// 国家/地区
            dataIndex: 'agencyCn',
            align: 'left',
            // sorter: true,
            width: 120
        }, {
            title: <FormattedMessage id="lbl.Date-of-entry" />,// 录入日期
            dataIndex: 'recordUpdateDatetime',
            align: 'left',
            // sorter: true,
            width: 120,
        }, {
            title: <FormattedMessage id="lbl.data-entry-clerk" />,// 录入人
            dataIndex: 'recordUpdateUser',
            align: 'left',
            // sorter: true,
            width: 120,
        }
    ]

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
                page: pagination,
                params: {
                    entryCode: "AFCM_B_AGENCY",
                    paramEntity: {
                        ...formData
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
                        {/* <Select showSearch={true} flag={true} span={6} name='agencyCompanyCode' label={<FormattedMessage id='lbl.carrier' />} options={acquireData} /> */}
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} /> : <Select flag={true} showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency' />} span={6} />
                        }
                        {/* 代理描述 */}
                        <InputText capitalized={false} span={6} name='like_agencyName' label={<FormattedMessage id='lbl.Agent-name' />} />
                        {/* 代理描述 */}
                        <InputText capitalized={false} span={6} name='like_agencyNameEn' label={<FormattedMessage id='lbl.afcm-0091' />} />
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'></div>
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
                    total={tabTotal}
                    rowSelection={null}
                    pageSize={page.pageSize}
                    current={page.current}
                />
            </div>
            <Loading spinning={spinflag} />
        </div>
    )
}

export default agentData;