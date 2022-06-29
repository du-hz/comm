{/**当月记核对台账 */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { Button, Form, Row, } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const checkAccountSameMonth =()=> {
    const [tableData, setTableData] = useState([]);  // 表格的数据
    const [tabTotal,setTabTotal] = useState([]);//数据总数
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [lastCondition, setLastCondition] = useState({
        "dataSource": null,
        "itemType": null,
        "checkMonth": null,
    });
    {/*查询*/}
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    {/*初始化*/}
	useEffect(()=>{

    },[])
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id='lbl.Data-source'/>,//数据源
            dataIndex: 'dataSource',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Modular'/>,//模块
            dataIndex: 'itemType',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Book-keeping-month'/>,//记账月
            dataIndex: 'checkMonth',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Calculate-result-month'/>,//当月计算结果
            dataIndex: 'monthCalculationAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 100,
            align:'right', 
        },
        {
            title: <FormattedMessage id='lbl.Monthly-cost-plus'/>,//当月成本加成
            dataIndex: 'monthCostAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 100,
            align:'right', 
        },
        {
            title: <FormattedMessage id='lbl.SAP-bookkeeping-amount-month'/>,//当月SAP累计记账金额
            dataIndex: 'monthSapAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 140,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.SAP-calculate-result-diff-month'/>,//当月SAP与计算结果差异
            dataIndex: 'monthDifferenceAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 150,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.Calculate-result-year'/>,//当年计算结果
            dataIndex: 'yearCalculationAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 100,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.year-cost-plus'/>,//当年成本加成
            dataIndex: 'yearCostAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 100,
            align:'right', 
        },
        {
            title: <FormattedMessage id='lbl.SAP-bookkeeping-amount-year'/>,//当年SAP累计记账金额
            dataIndex: 'yearSapAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 140,
            align:'right'
        },
        {
            title: <FormattedMessage id='lbl.SAP-calculate-result-diff-year'/>,//当年SAP与计算结果差异
            dataIndex: 'yearDifferenceAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 150,
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
                    "entryCode": "AFCM_LEDGER_SUMMARY",
                    "paramEntity":{
                        "checkMonth": queryData.checkMonth,
                        "dataSource": queryData.dataSource,
                        "itemType": queryData.itemType,
                    }
                },
                "sorter":{
                    "field":"recordUpdateDate",
                    "order":"ASC"
               }
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
    {/* 下载  */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode: "AFCM_LEDGER_SUMMARY",
                    paramEntity:{
                        checkMonth: queryData.checkMonth,
                        dataSource: queryData.dataSource,
                        itemType: queryData.itemType,
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.checkMonth'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        dataSource: intl.formatMessage({id: "lbl.Data-source"}),
                        itemType: intl.formatMessage({id: "lbl.Modular"}),
                        checkMonth: intl.formatMessage({id: "lbl.Book-keeping-month"}),
                        monthCalculationAmount: intl.formatMessage({id: "lbl.Calculate-result-month"}),
                        monthCostAmount: intl.formatMessage({id: "lbl.Monthly-cost-plus"}),
                        monthSapAmount: intl.formatMessage({id: "lbl.SAP-bookkeeping-amount-month"}),
                        monthDifferenceAmount: intl.formatMessage({id: "lbl.SAP-calculate-result-diff-month"}),
                        yearCalculationAmount: intl.formatMessage({id: "lbl.Calculate-result-year"}),
                        yearCostAmount: intl.formatMessage({id: "lbl.year-cost-plus"}),
                        yearSapAmount: intl.formatMessage({id: "lbl.SAP-bookkeeping-amount-year"}),
                        yearDifferenceAmount: intl.formatMessage({id: "lbl.SAP-calculate-result-diff-year"}),
                        recordUpdateDate: intl.formatMessage({id: "lbl.update-date"}),
                        recordLoadDate: intl.formatMessage({id: "lbl.update-batch"}),
                    },
                    sumCol: {},//汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.checkMonth'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.checkMonth'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.checkMonitor.checkMonth'})+ '.xlsx'; // 下载后文件名
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
                        {/* 数据源 */}
						<InputText span={6} name='dataSource' label={<FormattedMessage id='lbl.Data-source'/>} /> 
                        {/* 模块 */}
                        <InputText span={6} name='itemType' label={<FormattedMessage id='lbl.Modular'/>} /> 
                        {/* 记账月 */}
                        <InputText span={6} name='checkMonth' label={<FormattedMessage id='lbl.Book-keeping-month'/>} /> 
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
export default checkAccountSameMonth