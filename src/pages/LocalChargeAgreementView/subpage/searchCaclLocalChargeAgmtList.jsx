import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage,formatMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, agencyCodeData, acquireSelectDataExtend, momentFormat, TimesFun} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import Select from '@/components/Common/Select'
import InputText from '@/components/Common/InputText'
import {Form, Button, Row, Tooltip} from 'antd'
import {Toast} from '@/utils/Toast'
import SelectVal from '@/components/Common/Select';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    InfoCircleOutlined
} from '@ant-design/icons'

const LocalChargeComputationProtocol =()=> {
    const [agencyCode,setAgencyCode] = useState([]);//代理编码
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState({}); // 协议状态
    const [spinflag,setSpinflag] = useState(false)
    const titTooltip = <span style={{color:'#000'}}><FormattedMessage id='lbl.afcm-0089' /></span>
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    })
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "shipperOwner": null,
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
            ...query
        })
        console.log(query)
    }

    useEffect(()=>{
        agencyCodeData($apiUrl,setAgencyCode,setCompany)//代理编码
        acquireSelectData('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
        acquireSelectDataExtend('COMMON_DICT_ITEM','CB0068',setAcquireData, $apiUrl);// 船东
        companys()
    },[])
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [companyData, setCompanyData] = useState('')
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            companyCode:companyData,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData,companyData])
      //公司
      const companys = async() =>{
        await request.post($apiUrl.LCR_AGMT_SEARCH_INIT)
        .then((resul) => {
            if(!resul.data)return
            var data = resul.data.companys;
            // console.log(data)
            data.map((val, idx)=> {
                val['value'] = val.companyCode 
                val['label'] = val.companyCode + '-' + val.companyName;
                // console.log(val['value'])

            })
            setCompanysData(data);
        })
        let company = await request($apiUrl.CURRENTUSER,{
            method:"POST",
            data:{}
        })
        if(company.success){
            setCompanyData(company.data.companyCode)
        }
    }

   
    //localcharge表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.protocol" />,//协议号
            dataIndex: 'commissionAgreementCode',
            key:'COMM_AGMT_CDE',
            sorter: true,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.company-code" />,//公司代码
            dataIndex: 'companyCode',
            key:'COMPANY_CDE',
            sorter: true,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            key:'AGENCY_CDE',
            sorter: true,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataType: 'dateTime',
            dataIndex: 'fromDate',
            key:'FM_DTE',
            sorter: true,
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataType: 'dateTime',
            dataIndex: 'toDate',
            key:'TO_DTE',
            sorter: true,
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.CGO_TRADE_LANE_CDE" />,//CGO_TRADE_LANE_CDE
            dataIndex:'cargoTradeLaneCode',
            key:'CGO_TRADE_LANE_CDE',
            sorter: true,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.charge-cde" />,//CHARGE CDE
            dataIndex: 'chargeCode',
            key:'CHRG_CDE',
            sorter: true,
            align:'left',
            width: 120,
        },
        {
            title: <FormattedMessage id="lbl.bound-sign" />,//进出口标志
            dataIndex: 'outBoundInboundIndicator',
            key:'OB_IB_IND',
            sorter: true,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.office-code" />,//Office Code
            dataIndex:'officeCode',
            key:'OFCE_CDE',
            sorter: true,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.return-the-proportion" />,//返回比例
            dataIndex: 'refundRate',
            key:'REFUND_RATE',
            sorter: true,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.modification-date" />,//修改日期
            // dataType: 'dateTime',
            dataIndex: 'recordUpdateDatetime',
            key:'REC_UPD_DT',
            sorter: true,
            width: 120,
            align:'left'
        },
        {
            title: <FormattedMessage id="lbl.modifier" />,//修改人
            dataIndex: 'recordUpdateUser',
            key:'REC_UPD_USR',
            sorter: true,
            width: 120,
            align:'left',
            
        },
    ]
    
    const pageChange= async (pagination,options,search) => {
        Toast('', '', '', 5000, false);
        console.log(options)
        const query = queryForm.getFieldsValue()
        if(search){
            pagination.current=1
        }
        let sorter
        console.log(pagination)
        console.log(query)
            if(options){
                console.log(options)
                if(options&&options.sorter.order){
                    sorter={
                        "field": options.sorter.columnKey,
                        "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
                    }
                }   
            }
                setSpinflag(true)
                // let str = query ? query.companyCode : '';
                // let we = str ? str.substring(0, str.indexOf('-')) : null;
                const localsearch=await request($apiUrl.LCR_AGMT_SEARCH_CALC_AGMT_LIST,{
                    method:"POST",
                    data:{
                        "page": pagination,
                        "params": {
                            ...query,
                            Date:undefined,
                            'fromDate':query.Date?momentFormat(query.Date[0]):null,
                            'toDate':query.Date?momentFormat(query.Date[1]):null,
                            // "companyCode": we
                        },
                        'sorter':sorter
                    }
                })
                if(localsearch.success){
                    let data=localsearch.data
                    let datas=localsearch.data.resultList
                    datas.map((v,i)=>{
                        v['id'] = i
                    })
                    setTabTotal(data.totalCount)
                    setTableData([...datas])
                    if(pagination.pageSize!=page.pageSize){
                        pagination.current=1
                    }
                    setPage({...pagination})
                    setSpinflag(false)
                }else{
                    setSpinflag(false)
                    setTableData([])
                    Toast('',localsearch.errorMessage, 'alert-error', 5000, false)
                }
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        setTableData([])
        queryForm.resetFields();
        queryForm.setFieldsValue({
            companyCode:companyData,
            shipperOwner: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
       
    }
    //下载
    const downlod = async () =>{
        Toast('','', '', 5000, false)
        const query = queryForm.getFieldsValue()
        let str = query ? query.companyCode : '';
        let we = str ? str.substring(0, str.indexOf('-')) : null;
        let downData = await request($apiUrl.LCR_AGMT_EXP_CALC_AGMT_LIST,{
            method:"POST",
            data:{
                "params":{
                    ...query,
                    Date:undefined,
                    'fromDate':query.Date?momentFormat(query.Date[0]):null,
                    'toDate':query.Date?momentFormat(query.Date[1]):null,
                    // companyCode: we
                },
                'excelFileName':formatMessage({id:'menu.afcm.agreement.local-charge.local-charge-computation-protocol'}),
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        commissionAgreementCode: formatMessage({id:"lbl.protocol" }),
                        companyCode: formatMessage({id:"lbl.company-code" }),
                        agencyCode: formatMessage({id:"lbl.agency" }),
                        fromDate: formatMessage({id:"lbl.start-date" }),
                        toDate: formatMessage({id:"lbl.over-date" }),
                        cargoTradeLaneCode: formatMessage({id:"lbl.CGO_TRADE_LANE_CDE" }),
                        chargeCode: formatMessage({id:"lbl.charge-cde" }),
                        outBoundInboundIndicator: formatMessage({id:"lbl.bound-sign" }),
                        officeCode: formatMessage({id:"lbl.office-code" }),
                        refundRate: formatMessage({id:"lbl.return-the-proportion" }),
                        recordUpdateDatetime: formatMessage({id:"lbl.modification-date" }),
                        recordUpdateUser: formatMessage({id:"lbl.modifier" }),
                    },
                    sumCol: {//汇总字段
                    },
                'sheetName':formatMessage({id:'menu.afcm.agreement.local-charge.local-charge-computation-protocol'}),
                }]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.size<1){
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            let blob = new Blob([downData], { type: 'application/x-xls' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'menu.afcm.agreement.local-charge.local-charge-computation-protocol'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'menu.afcm.agreement.local-charge.local-charge-computation-protocol'}) + '/'+ TimesFun() + '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    return (
        <div className='parent-box'>
            <div className='header-from'>
                <Form 
                    form={queryForm}
                    name='func'
                    onFinish={handleQuery}
                >
                    <Row>
                        {/* 船东 */}
                        <Select name='shipperOwner' disabled={company.companyType == 0 ? true : false} span={6} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} />
                        {/* 公司 */}
                        <Select span={6} showSearch={true}  name='companyCode' flag={true} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
                        <a style={{color:'orange'}}><Tooltip color='#e6f7ff' style={{color:'#000'}} className="tipsContent" title={titTooltip}><InfoCircleOutlined /></Tooltip></a>
                        {/* 代理编码 */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select flag={true} showSearch={true} name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        }
                        {/* 船东 */}
                        {/* <SelectVal span={6} name='shipperOwner' flag={true} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values}/> */}
                        {/* 公司 */}
                        {/* <Select showSearch={true} name='companyCode' flag={true} label={<FormattedMessage id='lbl.company'/>}  span={6} options={companysData} /> */}
                        {/* 代理编码 */}
                        {/* <Select name='agencyCode' label={<FormattedMessage id='lbl.agency'/>}   span={6} options={agencyCode} />   */}
                        {/* 协议代码 */}
                        <InputText span={6} name='agreementCode' label={<FormattedMessage id='lbl.agreement'/>}/>
                        {/* 代理描述 */}
                        <InputText name='agencyName' capitalized={false} label={<FormattedMessage id='lbl.agent-described'/>} span={6}/>  
                        {/* 有效日期 */}
                        <DoubleDatePicker span={6} disabled={[false, false]} name='Date' label={<FormattedMessage id='lbl.valid-date'/>}   />          
                    </Row>
                </Form>
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button onClick={downlod}><CloudDownloadOutlined/> <FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></Button>
                </div>
                </div>
            <div className='footer-table'>
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
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default LocalChargeComputationProtocol