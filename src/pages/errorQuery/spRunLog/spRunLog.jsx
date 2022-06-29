{/*SP运行日志*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { acquireSelectData, } from '@/utils/commonDataInterface';
import Selects from '@/components/Common/Select';
import { Button, Form, Row,  } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const spRunLog =()=> {
    const [messages, setMessages] = useState({}); //消息编码
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [tableData, setTableData] = useState([]);     // 表格的数据
    const [tabTotal,setTabTotal] = useState([]);//  表格的条数
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
	const [lastCondition, setLastCondition] = useState({
        "messageCode": null,
        "processId": null,
        "programId": null,
    });
    {/*初始化*/}
	useEffect(()=>{
        acquireSelectData('MSG.CODE', setMessages, $apiUrl);   //消息编码
    },[])
    {/*查询*/}
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setTableData([])
    }

    const columns=[
        {
            title: <FormattedMessage id='lbl.Process-id'/>,//Process ID
            dataIndex: 'processId',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Program-id'/>,//Program ID
            dataIndex: 'programId',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Message-code'/>,//消息代码
            dataIndex: 'messageCode',
            dataType: messages.values,
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Message-desc'/>,//消息描述
            dataIndex: 'messageDescription',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Params-A'/>,//参数A
            dataIndex: 'programParameter1',
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Params-B'/>,//参数B
            dataIndex: 'programParameter2',
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Params-C'/>,//参数C
            dataIndex: 'programParameter3',
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Params-D'/>,//参数D
            dataIndex: 'programParameter4',
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Params-E'/>,//参数E
            dataIndex: 'programParameter5',
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Params-F'/>,//参数F
            dataIndex: 'programParameter6',
            align:'left', 
            sorter: false,
            width: 60,
        },
        {
            title: <FormattedMessage id='lbl.Record-time'/>,//记录时间
            dataIndex: 'logDatetime',
            align:'left', 
            sorter: false,
            width: 80,
        },
    ]
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
            const result = await request($apiUrl.ERROR_SEARCH_SP_RUN_LOG_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        ...queryForm.getFieldValue(),
                    },
                }
            })
            let data=result.data
            if(result.success){
                let datas=result.data.resultList
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setSpinflag(false);
            }else {
                setTableData([])
                Toast('',result.errorMessage, 'alert-error', 5000, false)
                setSpinflag(false);
            }
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_PROG_STATUS_LOG",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.errQuery.spRunLog'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        processId: intl.formatMessage({id: "lbl.Process-id"}),
                        programId: intl.formatMessage({id: "lbl.Program-id"}),
                        messageCode: intl.formatMessage({id: "lbl.Message-code"}),
                        messageDescription: intl.formatMessage({id: "lbl.Message-desc"}),
                        programParameter1: intl.formatMessage({id: "lbl.Params-A"}),
                        programParameter2: intl.formatMessage({id: "lbl.Params-B"}),
                        programParameter3: intl.formatMessage({id: "lbl.Params-C"}),
                        programParameter4: intl.formatMessage({id: "lbl.Params-D"}),
                        programParameter5: intl.formatMessage({id: "lbl.Params-E"}),
                        programParameter6: intl.formatMessage({id: "lbl.Params-F"}),
                        logDatetime: intl.formatMessage({id: "lbl.Record-time"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.errQuery.spRunLog'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.errQuery.spRunLog'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.errQuery.spRunLog'})+ '.xlsx'; // 下载后文件名
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
                        {/* Process id */}
						<InputText span={6} name='processId' label={<FormattedMessage id='lbl.Process-id'/>} /> 
                        {/* Program id */}
						<InputText span={6} name='programId' label={<FormattedMessage id='lbl.Program-id'/>} /> 
                        {/* Message code */}
						<Selects span={6} flag={true} options={messages.values} name='messageCode' label={<FormattedMessage id='lbl.Message-code'/>} /> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 下载 */}
                    <Button  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    <Button onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '95%'}}>
                    <PaginationTable
                        dataSource={tableData}
                        columns={columns}
                        rowKey='logUuid'
                        pageChange={pageChange}
                        pageSize={page.pageSize}
                        current={page.current}
                        scrollHeightMinus={200}
                        total={tabTotal}
                        rowSelection={null}
                    />
                </div>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default spRunLog;