import React, { useState,useEffect,$apiUrl } from 'react'
import {FormattedMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas} from '@/utils/commonDataInterface';
import request from '@/utils/request';
import {Form,Button} from 'antd'
import { Toast } from '@/utils/Toast'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'


//---------------------------------------------- 周报航次代理费查询-------------------------------------------------
let formlayouts={
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
}
const LocalChargeComputationProtocol =()=> {
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [tableData,setTableData] = useState([])//
    const [tabTabTotal,setTabTotal ] = useState([])//
    const [protocolStateData, setProtocolStateData] = useState([]); // 协议状态
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
   
    useEffect(()=>{
        acquireSelectDatas('AFCM.AGMT.STATUS', setProtocolStateData, $apiUrl);// 协议状态
    },[])
     
    //localcharge表格文本 
    const columns=[
        {
            title: <FormattedMessage id="lbl.SVVD" />,//SVVD
            dataIndex: 'svvd',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.port" />,//港口
            dataIndex: 'portCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'AGENCY_CDE'
            
        },
        {
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            key:'FM_DTE'
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            align:'left',
            width: 120,
            key:'COMPANY_CDE'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency" />,//协议币种
            dataIndex: 'currencyCode',
            sorter: false,
            width: 120,
            align:'left',
            key:'PRD_IND'
        },
        {
            title: <FormattedMessage id="lbl.Agreement-currency-amount" />,//协议币金额
            dataIndex: 'totalAmount',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_CALC_FLAG'
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//计算方法 
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120,
            align:'left',
            key:'POST_MODE'
        },
        {
            title: <FormattedMessage id="lbl.subject"/>,//科目
            dataIndex: 'subject',
            sorter: false,
            width: 120,
            align:'left',
            key:'YG_SIDE'
        },
        {
            title: <FormattedMessage id="lbl.The-standard-currency-of-accounting" />,//记账本位币种
            dataIndex: 'standCurrencyCode',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
        {
            title: <FormattedMessage id="lbl.The-standard-currency-of-accounting" />,//记账本位币种
            dataIndex: 'currencyTotalAmt',
            sorter: false,
            align:'left',
            width: 120,
            key:'FEE_AGMT_CDE'
        },
    ]
    
    const pageChange= async (pagination,options,search) => {
        // const localsearch=await request($apiUrl.AG_FEE_AGMT_SEARCH_CALC_LIST,{
        //     method:"POST",
        //     data:{
        //         "page": pagination,
        //         "params": queryForm.getFieldValue(),
        //         'sorter':sorter
        //     }
        // })
        // console.log(localsearch)
        // if(localsearch.success){
        //     let data=localsearch.data
        //     let datas=localsearch.data.resultList
        //     setTabTotal(data.totalCount)
        //     setTableData([...datas])
        //     setPage({...pagination})
        // }
        
    }
    //重置
    const reset = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
       setTableData([])
    }
    return (
        <div className='parent-box'>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 下载按钮 */}
                    <Button><CloudDownloadOutlined/><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <Button  onClick={reset}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></Button>
                    {/* 上载查询按钮 */}
                    <Button onClick={()=> pageChange(page,null,'search')}> <SearchOutlined /><FormattedMessage id='lbl.Upload-the-query' /></Button>
                </div>
                </div>
            <div className='footer-table'>
                {/* 表格 */}
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='lcrAgreementHeadUuid'
                    // pageChange={pageChange}
                    // pageSize={page.pageSize}
                    // current={page.current}
                    scrollHeightMinus={200}
                    // total={tabTabTotal}
                    rowSelection={null}
                />
            </div>
        </div>
    )
}
export default LocalChargeComputationProtocol