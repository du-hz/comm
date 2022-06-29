{/*佣金利润中心配置*/ }
import React, { useEffect, useState, $apiUrl } from 'react'
import { FormattedMessage, useIntl } from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { momentFormat, getStatus, acquireSelectData } from '@/utils/commonDataInterface';
import Selects from '@/components/Common/Select';
import { Button, Form, Row, Tooltip, Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { Toast } from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import moment from 'moment';
import Loading from '@/components/Common/Loading';
import LogPopUp from '../commissions/agmt/LogPopUp';
import { CosToast } from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    CloseCircleOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    FileAddOutlined,//新增
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载 
    SaveOutlined, //保存
    ReadOutlined,//日志
    FileProtectOutlined, //提交
} from '@ant-design/icons'

const confirm = Modal.confirm

const commConfig = () => {
    const [tableData, setTableData] = useState([]);     // table数据
    const [tabTotal, setTabTotal] = useState([]);//table条数
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [txt, setTxt] = useState(''); //新增
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [spinflag, setSpinflag] = useState(false);     // 加载
    const [writeFlag, setWriteFlag] = useState(false);  //编辑修改权限
    const [buttonFlag, setButtonFlag] = useState(true)//保存按钮是否禁用
    const [submitFlag, setSubmitFlag] = useState(true)//提交按钮是否禁用
    const [isModalVisibleLog, setIsModalVisibleLog] = useState(false);  // 日志弹窗
    const [journalData, setJournalData] = useState([]); // 日志数据
    const [department, setDepartment] = useState([]); // 责任部门
    const [backFlag1, setBackFlag1] = useState(true);//背景颜色
    const [backFlag2, setBackFlag2] = useState(true);//背景颜色
    const [backFlag3, setBackFlag3] = useState(true);//背景颜色
    const [backFlag4, setBackFlag4] = useState(true);//背景颜色
    const [uid, setUid] = useState(""); // 获取uid
    const [companysData, setCompanysData] = useState([]);    // 公司
    const [infoTips, setInfoTips] = useState({});   //message info
    const [status, setStatus] = useState({});    // 状态
    const [page, setPage] = useState({
        current: 1,
        pageSize: 10
    });

    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue(),
        })
    }
    const [lastCondition, setLastCondition] = useState({
        "cargoTradeLaneCode": null,
        "commissionType": null,
        "departmentCode": null,
        "activeDate": null,
    });
    {/*初始化*/ }
    useEffect(() => {
        depart()
        searchCompanyCode($apiUrl, setCompanysData)  //公司代码
        acquireSelectData('AFCM.KPI.AGMT.STATUS', setStatus, $apiUrl);// 状态
    }, [])
    {/* 公司代码 */ }
    const searchCompanyCode = async (apiUrl, setCompanysData) => {
        const result = await request(apiUrl.COMMON_COMPANY_CURRENTUSER, {
            method: "POST",
        })
        if (result.success) {
            let companyCodeData = result.data.companyCode
            setCompanysData(companyCodeData)
        }
    }

    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align: 'center',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.delete' />}><a onClick={() => { deleteBtn(record, index) }} disabled={record.show ? false : true} style={{ color: record.show ? 'red' : '#ccc' }}><CloseCircleOutlined /></a>&nbsp;</Tooltip>&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a><CosButton auth='AFCM-CMS-PROFIT-001-B02' onClick={() => {deleteBtn(record, index)}} disabled={record.show?false:true} ><CloseCircleOutlined style={{color:record.show?'red':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={() => { editViewBtn(record, false) }} disabled={record.show ? false : true}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-CMS-PROFIT-001-B01' onClick={() => {editViewBtn(record, false)}} disabled={record.show?false:true} ><FormOutlined style={{color:record.show?'#1890ff':'#ccc',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看详情 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}> <a onClick={() => { editViewBtn(record, true) }}><FileSearchOutlined /></a>&nbsp; </Tooltip>&nbsp;
                    {/* 日志 */}
                    <Tooltip title={<FormattedMessage id='btn.log' />}><a onClick={() => { logBtn(record) }}><ReadOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.cargo-trade' />,//CargoTradeLaneCode
            dataIndex: 'cargoTradeLaneCode',
            sorter: false,
            width: 100,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.argue.chargeCode' />,//费用代码
            dataIndex: 'commissionType',
            sorter: false,
            width: 60,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.effective-date' />,//生效日期
            dataIndex: 'fromDate',
            sorter: false,
            width: 60,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.expiration-date' />,//失效日期
            dataIndex: 'toDate',
            sorter: false,
            width: 60,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.ac.fee.department' />,//责任部门
            dataIndex: 'departmentCode',
            dataType: department,
            sorter: false,
            width: 60,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.state' />,//状态
            dataIndex: 'status',
            dataType: status.values,
            sorter: false,
            width: 40,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.update-people' />,//更新人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 60,
            align: 'left',
        },
        {
            title: <FormattedMessage id='lbl.update-date' />,//更新日期
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 60,
            align: 'left',
        },
    ]
    {/* 责任部门数据 */ }
    const depart = async () => {
        const result = await request($apiUrl.BASE_COMM_CONFIG_SEARCH_DEPART_DATA,
            {
                method: 'POST',
            }
        )
        if (result.success) {
            let data = result.data
            if(data!=null){
                data.map((v,i)=>{
                    v['value']=v.value;
                    v['label']=v.value + '(' + v.label +')';
                })
            }
            setDepartment(data)
        }
    }

    {/*清空*/ }
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setTableData([]);
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
    }

    {/*查询表格数据*/ }
    const pageChange = async (pagination, search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue()
        if (search) {
            pagination.current = 1
            pagination.pageSize = 10
        }
        if (pagination.pageSize != page.pageSize) {
            pagination.current = 1
        }
        const result = await request($apiUrl.BASE_COMM_CONFIG_SEARCH_LIST, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    cargoTradeLaneCode: queryData.cargoTradeLaneCode,
                    commissionType: queryData.commissionType,
                    departmentCode: queryData.departmentCode,
                    fromDate: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : null,
                    toDate: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : null,
                }
            }
        })
        let data = result.data
        if (result.success) {
            setSpinflag(false);
            let datas = result.data.resultList
            if (datas != null) {
                datas.map((v, i) => {
                    v.fromDate ? v["fromDate"] = v.fromDate.substring(0, 10) : null;
                    v.toDate ? v["toDate"] = v.toDate.substring(0, 10) : null;
                    // v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
                })
            }
            setPage({ ...pagination })
            setTabTotal(data.totalCount)
            setTableData([...datas])
            getStatus(datas, setTableData)
            if (datas.length == 0) {
                setTableData([])
                Toast('', intl.formatMessage({ id: 'lbl.query-warn' }), 'alert-error', 5000, false);
            }
        } else {
            setSpinflag(false);
            setTableData([])
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 新建 */ }
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        // setTxt(intl.formatMessage({ id: 'lbl.add' }));
        setTxt(intl.formatMessage({ id: 'menu.afcm.base.commConfig' }));
        setWriteFlag(false);
        setButtonFlag(false);
        setSubmitFlag(false);
        setUid("")
        queryForm.setFieldsValue({
            popData: {
                cargoTradeLaneCode: null,
                commissionType: null,
                departmentCode: null,
                activeDate: null,
            }
        })
        setTimeout(() => {
            setSpinflag(false);
            setIsModalVisible(true);
        }, 500);
    }
    {/* 编辑/查看明细 */ }
    const editViewBtn = async (record, flag) => {
        setInfoTips({})
        setSpinflag(true);
        setUid(record.cbsCommissionProfitCenterUuid)
        const result = await request($apiUrl.BASE_COMM_CONFIG_SEARCH_DETAIL,
            {
                method: 'POST',
                data: {
                    uuid: record.cbsCommissionProfitCenterUuid,
                }
            }
        )
        if (result.success) {
            setTxt(intl.formatMessage({ id: 'menu.afcm.base.commConfig' }));
            setSpinflag(false);
            setButtonFlag(flag);
            setSubmitFlag(flag);
            setWriteFlag(flag);
            let data = result.data;
            queryForm.setFieldsValue({
                popData: {
                    cargoTradeLaneCode: data.cargoTradeLaneCode,
                    commissionType: data.commissionType,
                    departmentCode: data.departmentCode,
                    activeDate: [moment(data.fromDate), moment(data.toDate)],
                }
            })
            // if (flag) {
            //     setTxt(intl.formatMessage({ id: 'lbl.ViewDetails' }));

            // } else {
                if (data.status == "Submit") {
                    setWriteFlag(true);
                    setButtonFlag(true);
                    setSubmitFlag(true);
                }
            //     setTxt(intl.formatMessage({ id: 'lbl.edit' }));
            // }
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/*删除*/ }
    const deleteBtn = async (record) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({ id: 'lbl.afcm-delete' }),
            content: intl.formatMessage({ id: 'lbl.delete.select.content' }),
            okText: intl.formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true);
                const deleteData = await request($apiUrl.BASE_COMM_CONFIG_DELETE_UUID, {
                    method: 'POST',
                    data: {
                        uuid: record.cbsCommissionProfitCenterUuid,
                    }
                })
                if (deleteData.success) {
                    setSpinflag(false);
                    pageChange(page);
                    Toast('', deleteData.message, 'alert-success', 5000, false)
                } else {
                    setSpinflag(false);
                    Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                }
            }
        })
    }
    {/* 日志展示 */ }
    const logData = {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,            // 日志数据
    }
    {/* 日志 */ }
    const logBtn = async (record) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_SEARCH_LOG,
            {
                method: 'POST',
                data: {
                    params: {
                        referenceType: "COMM_PROFIT_CENTER",
                        referenceUuid: record.cbsCommissionProfitCenterUuid
                    }

                }
            }
        )
        if (result.success) {
            setSpinflag(false);
            setJournalData(result.data)
            setIsModalVisibleLog(true);
            Toast('', result.message, 'alert-success', 5000, false)
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 取消 */ }
    const handleCancel = () => {
        setInfoTips({});
        setIsModalVisible(false)
        queryForm.setFieldsValue({
            popData: null
        })
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
    }
    {/* 保存 */ }
    const handleSave = async () => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if (!queryData.cargoTradeLaneCode) { setBackFlag1(false) } else { setBackFlag1(true) }
        if (!queryData.commissionType) { setBackFlag2(false) } else { setBackFlag2(true) }
        if (!queryData.activeDate) { setBackFlag3(false) } else { setBackFlag3(true) }
        if (!queryData.departmentCode) { setBackFlag4(false) } else { setBackFlag4(true) }
        if (!queryData.cargoTradeLaneCode || !queryData.commissionType || !queryData.departmentCode ||
            !queryData.activeDate) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.comm-config-warn' }) });
            return;
        } else {
            setSpinflag(true);
            const save = await request($apiUrl.BASE_COMM_CONFIG_SAVE_DATA, {
                method: "POST",
                data: {
                    "operateType": "SAVE",
                    "params": {
                        cbsCommissionProfitCenterUuid: uid,
                        cargoTradeLaneCode: queryData.cargoTradeLaneCode,
                        commissionType: queryData.commissionType,
                        departmentCode: queryData.departmentCode,
                        fromDate: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : null,
                        toDate: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : null,
                    },
                }
            })
            if (save.success) {
                setSpinflag(false);
                setButtonFlag(true);   //保存按钮
                setWriteFlag(true);    //是否可读写
                pageChange(page)
                setIsModalVisible(false)
                setInfoTips({ alertStatus: 'alert-success', message: save.message });
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: save.errorMessage });
            }
        }
    }
    {/* 提交 */ }
    const submitBtn = async () => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if (!queryData.cargoTradeLaneCode) { setBackFlag1(false) } else { setBackFlag1(true) }
        if (!queryData.commissionType) { setBackFlag2(false) } else { setBackFlag2(true) }
        if (!queryData.activeDate) { setBackFlag3(false) } else { setBackFlag3(true) }
        if (!queryData.departmentCode) { setBackFlag4(false) } else { setBackFlag4(true) }
        if (!queryData.cargoTradeLaneCode || !queryData.commissionType || !queryData.departmentCode ||
            !queryData.activeDate) {
            setInfoTips({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.comm-config-warn' }) });
            return;
        } else {
            setSpinflag(true);
            const submit = await request($apiUrl.BASE_COMM_CONFIG_SAVE_DATA, {
                method: "POST",
                data: {
                    "operateType": "SUBMIT",
                    "params": {
                        cbsCommissionProfitCenterUuid: uid,
                        cargoTradeLaneCode: queryData.cargoTradeLaneCode,
                        commissionType: queryData.commissionType,
                        departmentCode: queryData.departmentCode,
                        fromDate: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : null,
                        toDate: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : null,
                    },
                }
            })
            if (submit.success) {
                setSpinflag(false);
                setButtonFlag(true);
                setWriteFlag(true);
                setSubmitFlag(true);
                pageChange(page)
                setIsModalVisible(false)
                Toast('', submit.message, 'alert-success', 5000, false)
            } else {
                setSpinflag(false);
                setInfoTips({ alertStatus: 'alert-error', message: submit.errorMessage });
            }
        }
    }
    {/* 下载 */ }
    const downloadBtn = async () => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.BASE_COMM_PROFIT_CENTER_CONFIG_DOWNLOAD, {
            method: "POST",
            data: {
                params: {
                    // entryCode:"CBS_B_COMM_PROFIT_CENTER",
                    cargoTradeLaneCode: queryData.cargoTradeLaneCode,
                    commissionType: queryData.commissionType,
                    departmentCode: queryData.departmentCode,
                    companyCode: companysData,
                    fromDate: queryData.activeDate ? momentFormat(queryData.activeDate[0]) : null,
                    toDate: queryData.activeDate ? momentFormat(queryData.activeDate[1]) : null,
                },
                excelFileName: intl.formatMessage({ id: 'menu.afcm.base.commConfig' }), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        cargoTradeLaneCode: intl.formatMessage({ id: "lbl.cargo-trade" }),
                        commissionType: intl.formatMessage({ id: "lbl.argue.chargeCode" }),
                        fromDate: intl.formatMessage({ id: "lbl.effective-date" }),
                        toDate: intl.formatMessage({ id: "lbl.expiration-date" }),
                        departmentCode: intl.formatMessage({ id: "lbl.ac.fee.department" }),
                        status: intl.formatMessage({ id: "lbl.state" }),
                        recordUpdateUser: intl.formatMessage({ id: "lbl.update-people" }),
                        recordUpdateDatetime: intl.formatMessage({ id: "lbl.update-date" }),
                    },
                    sumCol: {},  //汇总字段
                    sheetName: intl.formatMessage({ id: 'menu.afcm.base.commConfig' }),//sheet名称
                }],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size<1){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false);
                navigator.msSaveBlob(blob, intl.formatMessage({ id: 'menu.afcm.base.commConfig' }))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({ id: 'menu.afcm.base.commConfig' }) + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form onFinish={handleQuery} form={queryForm} name='search'>
                    <Row>
                        {/* CargoTradeLaneCode */}
                        <InputText span={6} name='cargoTradeLaneCode' label={<FormattedMessage id='lbl.cargo-trade' />} />
                        {/* 费用代码 */}
                        <InputText span={6} name='commissionType' label={<FormattedMessage id='lbl.argue.chargeCode' />} />
                        {/* 责任部门 */}
                        <Selects span={6} name='departmentCode' label={<FormattedMessage id='lbl.ac.fee.department' />} options={department} flag={true} />
                        {/* 有效日期 */}
                        <DoubleDatePicker name='activeDate' flag={false} label={<FormattedMessage id='lbl.valid-date' />} span={6} />
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
                    {/* 新增  */}
                    <CosButton onClick={addBtn} auth='AFCM-CMS-PROFIT-001-B03'><FileAddOutlined /><FormattedMessage id='lbl.new-btn' /></CosButton>
                    {/* 下载 */}
                    <CosButton onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download' /></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(page, 'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '70%'}}>
                    <PaginationTable
                        dataSource={tableData}
                        columns={columns}
                        rowKey='cbsCommissionProfitCenterUuid'
                        pageChange={pageChange}
                        pageSize={page.pageSize}
                        current={page.current}
                        scrollHeightMinus={200}
                        total={tabTotal}
                        rowSelection={null}
                    />
                </div>
            </div>
            {/* 弹窗 */}
            {/* <CosModal title={txt} visible={isModalVisible} footer={null} width="50%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
                <CosToast toast={infoTips} />
                <div className='modalContent' style={{minWidth: '300px'}}>
                    <Form form={queryForm} name='add' onFinish={handleSave}>
                        <Row>
                            {/* CargoTradeLaneCode */}
                            <InputText disabled={writeFlag} styleFlag={backFlag1} span={12} name={['popData', 'cargoTradeLaneCode']} label={<FormattedMessage id='lbl.cargo-trade' />} isSpan={true} />
                            {/* 费用代码 */}
                            <InputText disabled={writeFlag} styleFlag={backFlag2} span={12} name={['popData', 'commissionType']} label={<FormattedMessage id='lbl.argue.chargeCode' />} isSpan={true} />
                            {/* 有效日期 */}
                            <DoubleDatePicker disabled={writeFlag} style={{ background: backFlag3 ? 'white' : 'yellow' }} name={['popData', 'activeDate']} flag={false} label={<FormattedMessage id='lbl.valid-date' />} span={12} isSpan={true} />
                            {/* 责任部门 */}
                            <Selects disabled={writeFlag} style={{ background: backFlag4 ? 'white' : 'yellow' }} span={12} name={['popData', 'departmentCode']} label={<FormattedMessage id='lbl.ac.fee.department' />} options={department} isSpan={true} flag={true} />
                        </Row>
                    </Form>
                    <div className='main-button'>
                        <div className='button-left'></div>
                        <div className='button-right'>
                            {/* 保存 */}
                            <CosButton disabled={buttonFlag ? true : false} onClick={() => handleSave()} auth='AFCM-CMS-PROFIT-001-B05'><FormattedMessage id='lbl.save' /></CosButton>
                            {/* 提交 */}
                            <CosButton onClick={submitBtn} disabled={submitFlag ? true : false} style={{ marginLeft: '10px' }} auth='AFCM-CMS-PROFIT-001-B04'><FormattedMessage id='lbl.Submit' /></CosButton>
                        </div>
                    </div>
                </div>
            </CosModal>
            <LogPopUp logData={logData} />
            <Loading spinning={spinflag} />
        </div>
    )
}

export default commConfig;