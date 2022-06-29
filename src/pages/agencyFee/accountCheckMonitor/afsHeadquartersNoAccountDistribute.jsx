{/**AFS总部未记账分布 */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { Button, Form, Row, } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';
import { acquireSelectDataExtend,agencyCodeData } from '@/utils/commonDataInterface';
import Select from '@/components/Common/Select'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const afsNoAccountDistribute =()=> {
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [tableData, setTableData] = useState([]);     // 表格的数据
    const [tabTotal,setTabTotal] = useState([]);//数据总数
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [lastCondition, setLastCondition] = useState({
        "feeType": null,
        "currentMonth": null,
    });
    {/*查询*/}
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            bukrs: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    
    {/*初始化*/}
	useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany);  
        acquireSelectDataExtend('COMMON_DICT_ITEM_KEY', 'CB0068',setAcquireData, $apiUrl);// 船东
    },[])
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id='lbl.Cost-owner'/>,//费用所属
            dataIndex: 'feeType',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'bukrs',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Curren-month'/>,//当前月
            dataIndex: 'currentMonth',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Modular'/>,//模块
            dataIndex: 'moduleid',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Bookkeeping-amount-month-no'/>,//当月累计未记账金额
            dataIndex: 'curMonthAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 140,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.No-bookkeeping-amount-month-no'/>,//非当月累计未记账金额
            dataIndex: 'noncurMonthAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 140,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.Bookkeeping-amount-year-no'/>,//当年累计未记账金额
            dataIndex: 'currentYearAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 140,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.update-date'/>,//更新时间
            dataIndex: 'recordUpdateDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.update-batch'/>,//更新批次
            dataIndex: 'recordLoadDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
    ]
    {/*清空*/}
    const clearBtn = () => {
        queryForm.resetFields()
        setTableData([])
        queryForm.setFieldsValue({
            bukrs: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        }, [company, acquireData])
    }

    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        const result = await request($apiUrl.AGENCY_FEE_ACCOUNT_CHECK_MONITOR_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    "entryCode": "AFCM_LEDGER_AFS_COST_NON",
                    "paramEntity":{
                        "feeType": queryData.feeType,
                        "currentMonth": queryData.currentMonth,
                        'bukrs':queryData.bukrs
                    }
                },
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            let datas=result.data.resultList
            if(datas!=null){
                // datas.map((v,i)=>{
                //     v.recordUpdateDate ? v["recordUpdateDate"] = v.recordUpdateDate.substring(0, 10) : null;
                // })
                datas.map((v,i)=>{
                    v.Uuid=i
                })
            }
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
        }else {
            setSpinflag(false);
            setTableData([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode: "AFCM_LEDGER_AFS_COST_NON",
                    paramEntity:{
                        feeType: queryData.feeType,
                        currentMonth: queryData.currentMonth,
                        bukrs:queryData.bukrs
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.afsNoRecord'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        feeType: intl.formatMessage({id: "lbl.Cost-owner"}),
                        bukrs: intl.formatMessage({id: "lbl.carrier"}),
                        currentMonth: intl.formatMessage({id: "lbl.Curren-month"}),
                        moduleid: intl.formatMessage({id: "lbl.Modular"}),
                        curMonthAmount: intl.formatMessage({id: "lbl.Bookkeeping-amount-month"}),
                        noncurMonthAmount: intl.formatMessage({id: "lbl.No-bookkeeping-amount-month"}),
                        currentYearAmount: intl.formatMessage({id: "lbl.Bookkeeping-amount-year"}),
                        recordUpdateDate: intl.formatMessage({id: "lbl.update-date"}),
                        recordLoadDate: intl.formatMessage({id: "lbl.update-batch"}),       
                    },
                    sumCol: {},//汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.afsNoRecord'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.afsNoRecord'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.afsNoRecord'})+ '.xlsx'; // 下载后文件名
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
                        {/* 船东 */}
                        <Select name='bukrs' span={6}  disabled={company.companyType == 0 ? true : false}  label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/>
                        {/* 费用所属 */}
						<InputText span={6} name='feeType' label={<FormattedMessage id='lbl.Cost-owner'/>} /> 
                        {/* 当前月 */}
                        <InputText span={6} name='currentMonth' label={<FormattedMessage id='lbl.Curren-month'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 下载 */}
                    <Button onClick={downloadBtn} ><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    <Button onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className="footer-table">
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='Uuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    rowSelection={null}
                />
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default afsNoAccountDistribute