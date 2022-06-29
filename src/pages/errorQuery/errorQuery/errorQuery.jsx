{/*错误查询*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { momentFormat} from '@/utils/commonDataInterface';
import { Button, Form, Row, Modal} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading';
import Select from '@/components/Common/Select'
import CosModal from '@/components/Common/CosModal'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'
let formlayouts={
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
}

const errorQuery =()=> {
    const [tableData, setTableData] = useState([]);     // 表格的数据
    const [tabTotal,setTabTotal] = useState([]);// 表格的条数
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [isModalVisible, setIsModalVisible] = useState(false);   // 控制弹窗
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });

	const [lastCondition, setLastCondition] = useState({
        "companyCode": null,
        "errorCde": null,
        "entryReferenceCode": null,
        "moduleName": null,
        "programId": null,
    });
    {/*初始化*/}
	useEffect(()=>{
      
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
        setBackFlag(true);
    }
    const columns=[
        {
            title: <FormattedMessage id='lbl.error-code'/>,//错误代码
            dataIndex: 'errorCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Error-description'/>,//错误描述
            dataIndex: 'errorDescription',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Produce-date'/>,//产生日期
            dataIndex: 'errorLogDatetime',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Responsible-group'/>,//负责组 
            dataIndex: 'errorLogUser',
            sorter: false,
            width: 60,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Modular'/>,//模块
            dataIndex: 'moduleName',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.state'/>,//状态
            dataIndex: 'status',
            sorter: false,
            width: 40,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Prepositional-error'/>,//前置错误   ----暂无字段
            dataIndex: 'prepositionErr',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Error-type'/>,//错误类型   ---暂无字段
            dataIndex: 'errorType',
            sorter: false,
            width: 80,
            align:'left', 
        },
        {
            title: <FormattedMessage id='lbl.Ref-code'/>,//Ref cde
            dataIndex: 'entryReferenceCode',
            sorter: false,
            width: 80,
            align:'left', 
        },
    ]
    {/*查询表格数据*/}
    // 错误代码---AG_CAL_E002  AG_CAL_E013
    const pageChange = async (pagination,search) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        let queryData = queryForm.getFieldValue();
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
        if(!queryData.errorCde){
            setSpinflag(false);
            setBackFlag(false);
        }else{
            setBackFlag(true);
        }
        const result = await request($apiUrl.ERROR_SEARCH_ERR_QUERY_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    companyCode: queryData.companyCode,
                    errorCde: queryData.errorCde,
                    programId: queryData.programId,
                    entryReferenceCode: queryData.entryReferenceCode,
                    moduleName: queryData.moduleName,
                    recordUpdateDatetimeFrom: queryData.recordUpdateDate?momentFormat(queryData.recordUpdateDate[0]):null,
                    recordUpdateDatetimeTo: queryData.recordUpdateDate?momentFormat(queryData.recordUpdateDate[1]):null,
                }
            }
        })
        let data=result.data
        if(result.success){
            setBackFlag(true);
            setSpinflag(false);
            let datas=result.data.resultList
            // if(datas!=null){
            //     datas.map((v,i)=>{
            //         v.errorLogDatetime ? v["errorLogDatetime"] = v.errorLogDatetime.substring(0, 10) : null;
            //     })
            // }
            setPage({...pagination})
            setTabTotal(data.totalCount)
            setTableData([...datas])
        }else {
            setTableData([])
            // setBackFlag(false);
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 双击列表弹出明细 */}
    const handleDoubleClickRow = async (parameter) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result =await request($apiUrl.AGENCY_FEE_ACCOUNT_CHECK_MONITOR_SEARCH_LIST,{
            method:"POST",
            data:{
                "params": {
                    "entryCode": "AFCM_ERR_LOG",
                    "paramEntity": 
                    {
                        errorLogUuid: parameter.errorLogUuid,
                        entryUuid: parameter.entryUuid,
                    },
                },
            },
        })
        let data=result.data
        if(result.success) {
            setSpinflag(false);
            let detailData=data.resultList[0]
            queryForm.setFieldsValue({
                popData:{
                    programId: detailData.programId,
                    errorCode: detailData.errorCode,
                    errorDescription: detailData.errorDescription,
                    entryUuid: detailData.entryUuid,
                    entryReferenceCode: detailData.entryReferenceCode,
                    moduleName: detailData.moduleName,
                    status: detailData.status,
                    errorLogDatetime: detailData.errorLogDatetime ? detailData.errorLogDatetime.substring(0,10) : null,
                    recordUpdateDatetime: detailData.recordUpdateDatetime ? detailData.recordUpdateDatetime.substring(0,10) : null,
                    errorLogUser: detailData.errorLogUser,
                    solution: detailData.solution,   //暂无字段
                    voucherNum: detailData.voucherNum,   //暂无字段
                    voucherUuid: detailData.voucherUuid,   //暂无字段
                }
            })
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 取消 */}
    const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false);
    }
    {/* 下载 */}
    //    AG_PRE_E005  AG_CAL_E006  数据量较小     AG_CAL_E013  AG_CAL_E010 数据量较大
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        if(!queryData.errorCde){
            setBackFlag(false);
            Toast('',intl.formatMessage({id:'lbl.Err-save-warn'}), 'alert-error', 5000, false)
            return
        }
        setSpinflag(true);
        setBackFlag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_ERR_LOG",
                    paramEntity:{
                        companyCode: queryData.companyCode,
                        errorCode: queryData.errorCde,
                        programId: queryData.programId,
                        entryReferenceCode: queryData.entryReferenceCode,
                        moduleName: queryData.moduleName,
                        dateFrom_errorLogDatetime: queryData.recordUpdateDate?momentFormat(queryData.recordUpdateDate[0]):null,
                        dateTo_errorLogDatetime: queryData.recordUpdateDate?momentFormat(queryData.recordUpdateDate[1]):null,
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.errQuery.errQuery'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        errorCode: intl.formatMessage({id: "lbl.error-code"}),
                        errorDescription: intl.formatMessage({id: "lbl.Error-description"}),
                        errorLogDatetime: intl.formatMessage({id: "lbl.Produce-date"}),
                        errorLogUser: intl.formatMessage({id: "lbl.Responsible-group"}),
                        moduleName: intl.formatMessage({id: "lbl.Modular"}),
                        status: intl.formatMessage({id: "lbl.state"}),
                        // prepositionErr: intl.formatMessage({id: "lbl.Prepositional-error"}),  //暂无字段
                        // errorType: intl.formatMessage({id: "lbl.Error-type"}),  //暂无字段
                        entryReferenceCode: intl.formatMessage({id: "lbl.Ref-code"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.errQuery.errQuery'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.errQuery.errQuery'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.errQuery.errQuery'})+ '.xlsx'; // 下载后文件名
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
                        {/* 公司代码*/}
						<InputText span={6} name='companyCode' label={<FormattedMessage id='lbl.company-code'/>}  formlayouts={formlayouts}/> 
                        {/* 错误代码 */}
						<InputText span={6} name='errorCde' styleFlag={backFlag} label={<FormattedMessage id='lbl.error-code'/>}  formlayouts={formlayouts}/> 
                        {/* Program id */}
						<InputText span={6} name='programId' label={<FormattedMessage id='lbl.Program-id'/>}  formlayouts={formlayouts}/> 
                        {/* Ref Cde */}
						<InputText span={6} name='entryReferenceCode' label={<FormattedMessage id= 'lbl.Ref-code'/>}  formlayouts={formlayouts}/> 
                        {/* 模块*/}
						<InputText span={6} name='moduleName' flag={true} label={<FormattedMessage id='lbl.Modular'/>} formlayouts={formlayouts}/> 
                        {/* 错误产生日期*/} 
						<DoubleDatePicker span={6} name='recordUpdateDate' disabled={[false, false]} label={<FormattedMessage id='lbl.Error-produce-date'/>} formlayouts={formlayouts}/> 
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
                <div style={{width: '80%'}}>
                    <PaginationTable
                        dataSource={tableData}
                        columns={columns}
                        rowKey='errorLogUuid'
                        pageChange={pageChange}
                        pageSize={page.pageSize}
                        current={page.current}
                        scrollHeightMinus={200}
                        total={tabTotal}
                        rowSelection={null}
                        selectWithClickRow={true}
                        handleDoubleClickRow={handleDoubleClickRow}
                    />
                </div>
            </div>
            {/* <Modal title={intl.formatMessage({id: 'lbl.ViewDetails'})} visible={isModalVisible} footer={null} width="65%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={800} cbsVisible={isModalVisible} cbsTitle={intl.formatMessage({id: 'lbl.ViewDetails'})} cbsFun={() => handleCancel()}>
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form form={queryForm} name='add' onFinish={handleCancel}>
                            <Row>
                                {/* Program ID */}
						        <InputText name={['popData','programId']} label={<FormattedMessage id='lbl.Program-id'/>} span={8} isSpan={true} disabled={true}/>
                                {/* 错误代码 */}
                                <InputText name={['popData','errorCode']} label={<FormattedMessage id='lbl.error-code'/>} span={8} isSpan={true} disabled={true}/>   
                                {/* 错误描述 */}
                                <InputText name={['popData','errorDescription']} label={<FormattedMessage id='lbl.Error-description'/>} span={8} isSpan={true} disabled={true} /> 
                                {/* UUID */}
                                <InputText name={['popData','entryUuid']} label={<FormattedMessage id='lbl.Uuid'/>} span={8} isSpan={true} disabled={true}/>  
                                {/* Ref cde */}
                                <InputText name={['popData','entryReferenceCode']} label={<FormattedMessage id='lbl.Ref-code'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* 模块 */}
                                <InputText name={['popData','moduleName']} label={<FormattedMessage id='lbl.Modular'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* 状态 */}
                                <InputText name={['popData','status']} label={<FormattedMessage id='lbl.state'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* 生成日期 */}
                                <InputText name={['popData','errorLogDatetime']} label={<FormattedMessage id="lbl.generation-date"/>} span={8} isSpan={true} disabled={true}/> 
                                {/* 修改日期 */}
                                <InputText name={['popData','recordUpdateDatetime']} label={<FormattedMessage id='lbl.modification-date'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* 负责组 */}
                                <InputText name={['popData','errorLogUser']} label={<FormattedMessage id='lbl.Responsible-group'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* 解决方案 ---暂无字段*/}
                                <InputText name={['popData','solution']} label={<FormattedMessage id='lbl.Solution'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* VOUCHER NUM ---暂无字段*/}
                                <InputText name={['popData','voucherNum']} label={<FormattedMessage id='lbl.Voucher-num'/>} span={8} isSpan={true} disabled={true}/> 
                                {/* VOUCHER UUID ---暂无字段*/}
                                <InputText name={['popData','voucherUuid']} label={<FormattedMessage id='lbl.Voucher-uuid'/>} span={8} isSpan={true} disabled={true}/> 
                            </Row>
                        </Form>
                    <div className='add-save-button'> 
                        {/* 取消 */}
                        <Button onClick={() => handleCancel()} ><FormattedMessage id= 'lbl.cancel'/></Button>
                    </div>
                </div>  
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default errorQuery;