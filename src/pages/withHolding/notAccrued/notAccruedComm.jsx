{/* 未预提原因查询(佣金) */}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import request from '@/utils/request';
import Select from '@/components/Common/Select';
import InputText from '@/components/Common/InputText';
import { acquireSelectData, acquireSelectDataExtend, agencyCodeData } from '@/utils/commonDataInterface';
import { Button, Form, Row, Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast'
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    ExportOutlined,
    SelectOutlined,
} from '@ant-design/icons'

const notAccruedComm =()=> {
    const [tableData, setTableData] = useState([]);  // 表格的数据
    const [tabTotal,setTabTotal] = useState([]); //数据总数
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [currencyCode, setCurrencyCode] = useState({}); // 币种
    const [commClass,setCommClass] = useState ({}) //佣金类型
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [infoTips, setInfoTips] = useState({});   //message info
    const [calcModal, setCalcModal] = useState(false);//弹框
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
    const [lastCondition, setLastCondition] = useState({
        "soCompanyCode": null,
        "agencyCode": null,
        "rateCurrencyCode": null,
        "commClass": null,
        "billReferenceCode": null,
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
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])
    {/*初始化*/}
	useEffect(()=>{
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setCurrencyCode, $apiUrl);// 币种
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        // acquireSelectData('COMMISSION.CLASS', setCommClass, $apiUrl);     // 佣金类型
        acquireSelectData('COMM.TYPE',setCommClass, $apiUrl);// 佣金类型
    },[])
    {/* 列表 */}
    const columns=[
        {
            title: <FormattedMessage id='lbl.Bill-of-lading'/>,//提单UUID
            dataIndex: 'billBasicUuid',
            sorter: false,
            width: 80,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.bill-no'/>,//提单号
            dataIndex: 'billReferenceCode',
            sorter: false,
            width: 50,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.carrier'/>,//船东
            dataIndex: 'soCompanyCode',
            sorter: false,
            width: 40,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.agency'/>,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            width: 60,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.Commission-type'/>,//佣金类型
            dataIndex: 'commissionClass',
            dataType: commClass.values,
            sorter: false,
            width: 60,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.ccy'/>,//币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 40,
            align:'left',
        },{
            title: <FormattedMessage id='lbl.History-amount-calc'/>,//历史计算金额
            dataIndex: 'historyTotalAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 90,
            align:'right',
        },{
            title: <FormattedMessage id='lbl.Actual-accrued-amount'/>,//实际预提金额
            dataIndex: 'ytTotalAmount',
            dataType: 'dataAmount',
            sorter: false,
            width: 90,
            align:'right',
        },{
            title: <FormattedMessage id='lbl.No-accrued-reason-analysis'/>,//未预提原因分析
            dataIndex: 'reasonMessage',
            sorter: false,
            width: 100,
            align:'left',
        },
    ]
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields()
        setTableData([])
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        },[company,agencyCode])
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
        const result = await request($apiUrl.NOT_ACCRUED_COMM_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    ...queryForm.getFieldValue()
                },
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            let datas=result.data.resultList
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
        setInfoTips({});
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        const result = await request($apiUrl.CONFIG_DOWNLOADTEMP,{
            method:"POST",
            data:{
                excelFileName: "feeCommYt.xlsx"
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
        if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
            setSpinflag(false);
            navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.accrued.notAccrued.notAccruedComm'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
        } else {
            setSpinflag(false);
            let downloadElement = document.createElement('a');  //创建元素节点
            let href = window.URL.createObjectURL(blob); // 创建下载的链接
            downloadElement.href = href;
            downloadElement.download = intl.formatMessage({id: 'menu.afcm.accrued.notAccrued.notAccruedComm'})+ '.xlsx'; // 下载后文件名
            document.body.appendChild(downloadElement); //添加元素
            downloadElement.click(); // 点击下载
            document.body.removeChild(downloadElement); // 下载完成移除元素
            window.URL.revokeObjectURL(href); // 释放掉blob对象
        }
    }
    {/* 导入Excel查询 */}
    const excelBtn = ()=>{
        setData({})
        setSpinflag(true);
        setTimeout(()=>{
            setSpinflag(false);
            setCalcModal(true)
        } ,500);
    }
    {/* 关闭 */}
    const cancelBtn = ()=>{
        setInfoTips({});
        setCalcModal(false)
    }
    const [data,setData] = useState({})
    const changeBtn = ()=>{
        setInfoTips({});
        const file = document.getElementById('file').files[0]
        if(file){
            setData(file)
            let reader = new FileReader();
            reader.readAsBinaryString(file)
            reader.onload=function(){
            }
            console.log(file)
        }
    }
    const exportExcel = async()=>{
        setInfoTips({});
        setSpinflag(true);
        if(data.name==null){
            setSpinflag(false);
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.afcm-0076'})});
            return
        }
        let uploadData = new FormData()
        let paramList = {
            excelFileName: intl.formatMessage({id: 'menu.afcm.accrued.notAccrued.notAccruedComm'}), //文件名
            sheetList: [{//sheetList列表
                dataCol: {//列表字段
                    billBasicUuid: intl.formatMessage({id: "lbl.Bill-of-lading"}),
                    billReferenceCode: intl.formatMessage({id: "lbl.bill-no"}),
                    soCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                    agencyCode: intl.formatMessage({id: "lbl.agency"}),
                    commissionClass: intl.formatMessage({id: "lbl.Commission-type"}),
                    rateCurrencyCode: intl.formatMessage({id: "lbl.ccy"}),
                    historyTotalAmount: intl.formatMessage({id: "lbl.History-amount-calc"}),
                    ytTotalAmount: intl.formatMessage({id: "lbl.Actual-accrued-amount"}),
                    reasonMessage: intl.formatMessage({id: "lbl.No-accrued-reason-analysis"}),
                },
                sumCol: { },  //汇总字段
                sheetName: intl.formatMessage({id: 'menu.afcm.accrued.notAccrued.notAccruedComm'}),//sheet名称
            }],
        }
        console.log(paramList)
        uploadData.append('params', JSON.stringify(paramList))
        uploadData.append('file',data)
        console.log(uploadData)
        let result = await request($apiUrl.NOT_ACCRUED_COMM_DOWNLOAD,{
            method:'POST',
            data: uploadData,
            // requestType:'application/form-data',
            responseType: 'blob',
        })
        // setData({})
        if(result.size<1){
            setSpinflag(false)
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Unclock-agFee-download'})});
            return
        }else{
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false);
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.accrued.notAccrued.notAccruedComm'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.accrued.notAccrued.notAccruedComm'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 取消 */}
    const cancel = ()=>{
        setInfoTips({});
        // setData({})
        setCalcModal(false)
    }
    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form onFinish={handleQuery} form={queryForm} name='search'>
                    <Row>
                        {/* 船东 */}
                        <Select span={6} name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 币种 */}
						<Select span={6} name='rateCurrencyCode' label={<FormattedMessage id='lbl.ccy'/>} options={currencyCode.values} flag={true}/> 
                        {/* 佣金类型 */}
                        <Select span={6} name='commClass' label={<FormattedMessage id='lbl.Commission-type'/>} options={commClass.values} flag={true}/> 
                        {/* 提单号 */}
						<InputText span={6} name='billReferenceCode' label={<FormattedMessage id='lbl.bill-no'/>}/> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 导入Excel查询 */}
                    <Button  onClick={excelBtn}><ExportOutlined  /><FormattedMessage id='lbl.excel'/></Button>
                </div>
                <div className="button-right">
                    <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                    <Button onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
            </div>
            <div className="footer-table">
                <div style={{width: '85%'}}>
                <PaginationTable
                        dataSource={tableData}
                        columns={columns}
                        rowKey='billBasicUuid;'
                        pageChange={pageChange}
                        pageSize={page.pageSize}
                        current={page.current}
                        scrollHeightMinus={200}
                        total={tabTotal}
                        rowSelection={null}
                    />
                </div>
            </div>
            {/* <Modal title={<FormattedMessage id='lbl.upload' />} maskClosable={false}  visible={calcModal} footer={null} width="32%" onCancel={() => cancelBtn()}> */}
            <CosModal cbsWidth={400} cbsVisible={calcModal} cbsTitle={<FormattedMessage id='lbl.upload' />} cbsFun={() => cancelBtn()}>
                <CosToast toast={infoTips}/> 
                <div className='uploadRate-button' style={{marginLeft:'10px',minWidth: '300px'}}>
                    <div className='uploadRate-button-left'>
                        <div className='uploadRate-button-left-top'>
                            {/* 选择 */}
                            <Button className='filebutton'><SelectOutlined /> <input type="file" id="file"  onChange={() =>changeBtn()}/> <FormattedMessage id='lbl.select' /></Button>
                            {/* 导入excel */}
                            <Button onClick={exportExcel}><CloudDownloadOutlined /><FormattedMessage id='lbl.excel' /></Button>
                            {/* 取消 */}
                            <Button onClick={cancel}><ReloadOutlined type="icon-quxiao" /><FormattedMessage id='lbl.cancel' /></Button>
                        </div>
                        <div className='uploadRate-button-left-bottom'>
                            {data.name}
                        </div>
                    </div>
                    <div>
                        {/* 下载*/}
                        <Button onClick={downloadBtn}><CloudDownloadOutlined/><FormattedMessage id='lbl.download-template' /></Button>
                    </div>
                
                </div>
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default notAccruedComm