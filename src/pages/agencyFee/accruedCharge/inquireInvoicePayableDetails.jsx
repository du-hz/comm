import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas, agencyCodeData, formatCurrencyNew} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Modal} from 'antd'
import DatePicker from '@/components/Common/DatePicker'
import { Toast } from '@/utils/Toast'
import moment from 'moment';
import Loading from '@/components/Common/Loading'
import CosModal from '@/components/Common/CosModal'
import {
    CloseOutlined,//关闭
    PrinterOutlined,//打印
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

//---------------------------------------------- 查询应收发票明细-------------------------------------------------
// const { TabPane } = Tabs;
// const confirm = Modal.confirm
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =(props)=> {
    const [agencyCode,setAgencyCode] = useState([])
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [tableDatas,setTableDatas] = useState([])//表格数据
    const [vatFlag,setVatFlag] = useState({})//是否含税价
    const [verifyStatus,setVerifyStatus] = useState({})//状态
    const [yfListCode,setYfListCode] = useState({})//发票号码
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [spinflag,setSpinflag] = useState(false)
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "agencyName": null,
        "agreementCode": null,
        "agreementStatus": null,
        "companyCode":null,
        "queryType": "PRE_AGMT",
        "soCompanyCode": null,
        "soCompanyCodeReadOnly": true
    });
    const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
        // console.log(queryForm.getFieldValue())
    }
    const {
        isModalVisible,
        setIsModalVisible,
        costKey,//费用大类
        subclassAll,//费用小类
        yfListUuid,
        setYfListUuid
    }=props.detail

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode)//代理编码
        acquireSelectDatas('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDatas('AFCM.ER.RECEIPT.STATUS',setVerifyStatus,$apiUrl);//状态
        acquireSelectDatas('AGMT.VAT.FLAG',setVatFlag,$apiUrl);//是否含税价
        yfListUuid===''?null:pageChange(page)
    console.log(yfListUuid)

    },[yfListUuid])
    
  
    
      const handleCancel = () => {
        Toast('', '', '', 5000, false);
        setIsModalVisible(false);
        setTableDatas([])
        setTableData([])
        setYfListUuid('')
        queryForm.resetFields()
      };

    //查询应收发票表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.state" />,//状态
            dataType:verifyStatus.values,
            dataIndex: 'verifyStatus',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.argue.bizDate" />,//业务日期
            dataType: 'dateTime',
            dataIndex: 'activityDate',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.generation-date" />,//生成日期
            // dataType: 'dateTime',
            dataIndex: 'generateDate',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataType:costKey,
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataType:subclassAll,
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Trade-line" />,//贸易线
            dataIndex: 'tradeLaneCode',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.SVVD" />,//svvd
            dataIndex: 'svvdId',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,//是否含税价
            dataType:vatFlag.values,
            dataIndex: 'vatFlag',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,//协议币税金(参考)
            dataIndex: 'vatAmount',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,//协议币调整税金(参考)
            dataIndex: 'vatReviseAmount',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,//应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'paymentAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.AP-outlets" />,//应付网点
            dataIndex: 'customerSapId',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Agency-net-income" />,//代理净收入
            dataType: 'dataAmount',
            dataIndex: 'recAmount',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种
            dataIndex: 'agencyCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmount2',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,//本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmountInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,//本位币税金(参考)
            dataIndex: 'vatAmountInAgency',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,//本位币调整税金(参考)
            dataIndex: 'reviseVatAmountInAgency',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataType: 'dataAmount',
            dataIndex: 'totalAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'reviseAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金(参考)
            dataIndex: 'vatAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'reviseVatAmountInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE'
        }
    ]
    
    const columnss= [
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'rateCurrency',
            sorter: false,
            width: 120,
            align:'left',  
            key:'AGENCY_DESC'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE',
           
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-adjustment-amount" />,//协议币调整金额
            dataType: 'dataAmount',
            dataIndex: 'rateSumReviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE',
           
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-tax-reference" />,//协议币税金参考
            dataIndex: 'sumVatAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-agreement-currency-reference" />,//协议币调整税金(参考)
            dataIndex: 'sumVatReviseAmt',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE'
        }
        ,
        {
            title: <FormattedMessage id="lbl.Amount-payable-to-outlets" />,//应付网点金额
            dataType: 'dataAmount',
            dataIndex: 'sumPaymentAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Agency-net-income" />,//代理净收入
            dataType: 'dataAmount',
            dataIndex: 'sumRecAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'FM_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.make" />,//向谁开票
            dataIndex: 'yfSide',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Standard-currency" />,//本位币种
            dataIndex: 'agencyCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Amount-in-base-currency" />,//本位币金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Adjustment-amount-in-base-currency" />,//本位币调整金额
            dataType: 'dataAmount',
            dataIndex: 'agencySumReviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-in-local-currency" />,//本位币税金(参考)
            dataIndex: 'sumVatAmtInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Tax-adjustment-in-base-currency" />,//本位币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInAgency',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.settlement-currency" />,//结算币种
            dataIndex: 'clearingCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.amount-of-settlement-currency" />,//结算币金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.adjustment-amount-in-settlement-currency" />,//结算币调整金额
            dataType: 'dataAmount',
            dataIndex: 'clearingSumReviseAmount',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE',
            
        },
        {
            title: <FormattedMessage id="lbl.tax-in-settlement-currency" />,//结算币税金(参考)
            dataIndex: 'sumVatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE'
        },
        {
            title: <FormattedMessage id="lbl.tax-adjustment-in-settlement-currency" />,//结算币调整税金(参考)
            dataIndex: 'sumReviseVatAmtInClearing',
            sorter: false,
            width: 120,
            align:'right',
            key:'TO_DTE'
        }
    ]
    
    const pageChange = async (pagination,options,search) => {
        setTableData([])
        setTableDatas([])
        Toast('', '', '', 5000, false);
        const localsearch = await request($apiUrl.AG_FEE_AR_SEARCH_AR_RECEIPT_DETAIL,{
            method:"POST",
            data:{
                "page": pagination,
                "params": {
                    "arReceiptUUID": yfListUuid + '',
                    
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data = localsearch.data
            if(data){
                let datas = data ? data.resultList : null
                let datass = data ? data.summaryList : null
                let quer = data ? data.agencyYfList : null
                datas.map((v,i)=>{
                    v['id'] = i
                })
                datass.map((v,i)=>{
                    v['id'] = i
                })
                data ? setTabTotal(data.totalCount) : null
                datas ? setTableData([...datas]) : null
                if(pagination.pageSize!=page.pageSize){
                    pagination.current=1
                }
                setPage({...pagination})
                datass ? setTableDatas([...datass]) : null
                setYfListCode([quer.yfListCode])
                quer?queryForm.setFieldsValue({
                    ...quer,
                    'generateUser':quer.generateUser?quer.generateUser.toUpperCase():null,
                    'pkgProcessId':quer.pkgProcessId?quer.pkgProcessId:'0',
                    'generateMonth':quer.generateDate?moment(quer.generateDate) : '', 
                }):null
            }
           
        }else{
            setTableData([])
            setTableDatas([])
            Toast('',localsearch.errorMessage, 'alert-error', 5000, false);
        }
        
    }
   const downlod = async()=>{
    Toast('','', '', 5000, false)
    const query = queryForm.getFieldsValue()
    let tddata = {}
    columns.map((v, i) => {
        tddata[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
    })
    let tdSum = {}
    columnss.map((v, i) => {
        tdSum[v.dataIndex] = intl.formatMessage({id: v.title.props.id})
    })
    setSpinflag(true)
    let downData = await request($apiUrl.AG_FEE_AR_EXP_AR_RECEIPT_DETAIL,{
        method:"POST",
        data:{
            'page':{
                current: 0,
                pageSize: 0
            },
            "params":{
                "arReceiptUUID": yfListUuid + '',
            },
            'excelFileName':yfListCode+intl.formatMessage({id:'lbl.afcm-0032'}),
            sheetList: [
                {//sheetList列表
                    dataCol: {//列表字段
                        companyCode: intl.formatMessage({id:"lbl.company" }),
                        agencyCode: intl.formatMessage({id:"lbl.agency" }),
                        yfListCode: intl.formatMessage({id:"lbl.Invoice-number" }),
                        generateMonth: intl.formatMessage({id:"lbl.argue.invDate" }),
                        generateUser: intl.formatMessage({id:"lbl.Personnel-of-make-out-an-invoice" }),
                        pkgProcessId: intl.formatMessage({id:"lbl.Packet-batch" }),

                    },
                    sumCol: {},
                'sheetName':intl.formatMessage({id:'lbl.Head-info'}),
                },
                {//sheetList列表
                    // dataCol: tddata,
                    dataCol: {
                        ...tddata,
                        // totalAmount:intl.formatMessage({id:'lbl.amount-of-settlement-currency'}),
                        // totalAmount:intl.formatMessage({id:'lbl.Agreement-currency-amount'}),
                    },
                    sumCol: {},
                'sheetName':intl.formatMessage({id:'lbl.afcm-0066'}),
                },
                {//sheetList列表
                    dataCol:tdSum,
                    sumCol:{} ,
                'sheetName':intl.formatMessage({id:'lbl.Total-info'}),
                },
            ]
        },
        responseType: 'blob',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
    })
    console.log(downData)
    if(downData.size<1){
        setSpinflag(false)
        Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
        return
    }else{
        setSpinflag(false)
        let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
        if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
            navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.inq-inv-rec'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
        } else {
            let downloadElement = document.createElement('a');  //创建元素节点
            let href = window.URL.createObjectURL(blob); // 创建下载的链接
            downloadElement.href = href;
            downloadElement.download = intl.formatMessage({id: 'menu.afcm.agfee-stl.acc-chrg.inq-inv-rec'}) + '.xlsx'; // 下载后文件名
            document.body.appendChild(downloadElement); //添加元素
            downloadElement.click(); // 点击下载
            document.body.removeChild(downloadElement); // 下载完成移除元素
            window.URL.revokeObjectURL(href); // 释放掉blob对象
        }
    }
   }
   const printFun = async () => {
        // Toast('', '', '', 5000, false);
        // 通过id选择需要打印的区域
        // window.document.body.innerHTML = window.document.getElementById('footer-table').innerHTML;
        // 调用打印
        // window.print();
        // 刷新页面
        // window.location.reload();
        // const el = document.getElementById('parent-box');
        // const iframe = document.createElement('IFRAME');
        // let doc = null;
        // iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:500px;top:500px;');
        // document.body.appendChild(iframe);
        // doc = iframe.contentWindow.document;
        // // 引入打印的专有CSS样式，根据实际修改
        // // doc.write('<LINK rel="stylesheet" type="text/css" href="css/print.css">');
        // doc.write(el.innerHTML);
        // doc.close();
        // // 获取iframe的焦点，从iframe开始打印
        // iframe.contentWindow.focus();
        // iframe.contentWindow.print();
        // if (navigator.userAgent.indexOf("MSIE") > 0)
        // {
        //     document.body.removeChild(iframe);
        // }
}
    return (
        <div className='parent-box' >
            <CosModal  cbsTitle={yfListCode+intl.formatMessage({id:'lbl.afcm-0032'})} cbsVisible={isModalVisible} cbsFun={handleCancel} cbsWidth='70%'  height='100%'>
                <div id="parent-box" style={{height: 'auto'}}>
                <div className='header-from' style={{marginTop:'10px'}}>
                    <Form 
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery}
                    >
                        <Row>
                            {/* 公司 */}
                            <InputText name='companyCode' disabled label={<FormattedMessage id='lbl.company'/>}   span={6}/>  
                            {/* 代理编码 */}
                            <InputText name='agencyCode' disabled showSearch={true} label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />  
                            {/* 发票号码 */}
                            <InputText name='yfListCode' disabled flag={true}  label={<FormattedMessage id='lbl.Invoice-number'/>}  span={6} options={companysData} />
                            {/* 开票日期 */}
                            <DatePicker span={6}  disabled={[true, true]} name='generateMonth' label={<FormattedMessage id='lbl.argue.invDate'/>}/>
                            {/* 开票人员 */}
                            <InputText name='generateUser' disabled label={<FormattedMessage id='lbl.Personnel-of-make-out-an-invoice'/>} span={6}/>  
                            {/* 数据包批次 */}
                            <InputText name='pkgProcessId' disabled label={<FormattedMessage id='lbl.Packet-batch'/>}   span={6}/>  
                        </Row>
                    </Form>
                    {/* 查询条件 */}
                    <div className='query-condition' style={{backgroundColor:'white'}}><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
                </div>
                <div className='footer-table' style={{marginTop:'10px'}}>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='id'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTabTotal}
					rowSelection={null}
                />
            </div>
                <div className='footer-table' style={{marginTop:'10px'}}>
                    {/* 表格 */}
                    <PaginationTable
                    dataSource={tableDatas}
                    columns={columnss}
                    rowKey='uuid'
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    rowSelection={null}
                    pagination={false}
                    />
                </div>
                <div className='main-button'>
                    <div className='button-left'>
                    
                    </div>
                    <div className='button-right'>
                        {/* 关闭按钮 */}
                        <Button onClick={handleCancel}><CloseOutlined/> <FormattedMessage id='lbl.close'/></Button>
                        {/* 下载按钮 */}
                        <Button onClick={downlod}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                        {/* 打印按钮 */}
                        <Button onClick={() => printFun()}><PrinterOutlined/> <FormattedMessage id='lbl.Printing'/></Button>
                    </div>
                </div>
            <Loading spinning={spinflag}/>
                </div>
                
            </CosModal>
        </div>
    )
}
export default LocalChargeComputationProtocol