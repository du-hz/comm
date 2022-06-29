{/*未报账数据查询*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,useIntl,formatMessage} from 'umi';
import request from '@/utils/request';
import { Button, Form, Row, Tabs, } from 'antd';
import Select from '@/components/Common/Select';
import { momentFormat,acquireSelectDataExtend,acquireSelectData,agencyCodeData} from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import {Toast} from '@/utils/Toast';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading';
import InputText from '@/components/Common/InputText';

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const { TabPane } = Tabs;
let formlayouts={
    labelCol: { span: 9 },
    wrapperCol: { span: 15 }
}

const unreportedQuery =()=> {
    const [agGridList,setAgGridListt] = useState([]);    //代理费清单
    const [agSumGridList,setAgSumGridList] = useState([]);    //代理费汇总
    const [crGridList,setCrGridListmList] = useState([]);    //佣金清单
    const [crSumGridList,setCrSumGridListy] = useState([]);    //佣金汇总
    const [defaultKey, setDefaultKey] = useState('1');
    const [spinflag,setSpinflag] = useState(false);     // 加载
    // const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [varType, setVarType] = useState({}); // 版本
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [company, setCompany,] = useState([]); // 代理编码默认companyType and companyCode
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    {/* 初始化 */}
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.VARTYPE',setVarType, $apiUrl);// 版本
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码

    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    const [queryForm] = Form.useForm();
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
        "activityDate": null,
    });
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }

    {/* 代理费清单 */}
    const agGridColumn = [
        {
            title: <FormattedMessage id='lbl.versions'/>,// 版本
            dataIndex: 'varType',
            dataType: varType.values,
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.Svvd-id'/>,// SVVD_ID
            dataIndex: 'svvdId',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.Port-cde'/>,// PORT_CDE
            dataIndex: 'portCode',
            align:'left',
            sorter: false,
            width: 70,
        },   {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type'/>,// 费用类型
            dataIndex: 'feeType',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'soCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.argue.bizDate'/>,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.current-state'/>,// 当前状态
            dataIndex: 'currStatus',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.Cny-money'/>,// CNY金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 60,
        },
    ]
    {/* 代理费汇总 */}
    const agSumGridColumn = [
        {
            title: <FormattedMessage id='lbl.versions'/>,// 版本
            dataIndex: 'varType',
            dataType: varType.values,
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type'/>,// 费用类型
            dataIndex: 'feeType',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'soCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.Cny-money'/>,// CNY金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 50,
        },
    ]
    {/* 佣金清单 */}
    const crGridColumn = [
        {
            title: <FormattedMessage id='lbl.versions'/>,// 版本
            dataIndex: 'varType',
            dataType: varType.values,
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.Bill-of-lading'/>,// 提单
            dataIndex: 'billReferenceCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type'/>,// 费用类型
            dataIndex: 'commType',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'soCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.argue.bizDate'/>,// 业务日期
            dataIndex: 'activityDate',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.current-state'/>,// 当前状态
            dataIndex: 'currStatus',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.Cny-money'/>,// CNY金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 60,
        },
    ]
    {/* 佣金汇总 */}
    const crSumGridColumn = [
        {
            title: <FormattedMessage id='lbl.versions'/>,// 版本
            dataIndex: 'varType',
            dataType: varType.values,
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.carrier.loc'/>,// 代理
            dataIndex: 'agencyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.ac.invoice.fee-type'/>,// 费用类型
            dataIndex: 'commType',
            align:'left',
            sorter: false,
            width: 60,
        },   {
            title: <FormattedMessage id='lbl.carrier'/>,// 船东
            dataIndex: 'soCompanyCode',
            align:'left',
            sorter: false,
            width: 40,
        },   {
            title: <FormattedMessage id='lbl.Cny-money'/>,// CNY金额
            dataIndex: 'totalAmountInCny',
            dataType: 'dataAmount',
            align:'right',
            sorter: false,
            width: 60,
        },
    ]

    {/* 下载 */}
    const downloadBtn =async () => {
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        // if(!queryData.soCompanyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.activityDate){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.soCompanyCode || !queryData.activityDate){
            Toast('', intl.formatMessage({id:'lbl.unreported-query-warn'}), 'alert-error', 5000, false)
            return;
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_UNREPORTED_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    soCompanyCode: queryData.soCompanyCode,
                    activeDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activeDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.reportForm.unreportedQuery'}), //文件名
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            varType: intl.formatMessage({id: "lbl.versions"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            svvdId: intl.formatMessage({id: "lbl.Svvd-id"}),
                            portCode: intl.formatMessage({id: "lbl.Port-cde"}),
                            feeType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            soCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            currStatus: intl.formatMessage({id: "lbl.current-state"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Cny-money"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Agfee-list'}),//代理费清单
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            varType: intl.formatMessage({id: "lbl.versions"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            feeType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            soCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Cny-money"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Agfee-summary'}),//代理费汇总
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            varType: intl.formatMessage({id: "lbl.versions"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            billReferenceCode: intl.formatMessage({id: "lbl.Bill-of-lading"}),
                            commType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            soCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            activityDate: intl.formatMessage({id: "lbl.argue.bizDate"}),
                            currStatus: intl.formatMessage({id: "lbl.current-state"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Cny-money"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Comm-list'}),//佣金清单
                    },
                    {//sheetList列表
                        dataCol: {//列表字段
                            varType: intl.formatMessage({id: "lbl.versions"}),
                            agencyCode: intl.formatMessage({id: "lbl.carrier.loc"}),
                            commType: intl.formatMessage({id: "lbl.ac.invoice.fee-type"}),
                            soCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                            totalAmountInCny: intl.formatMessage({id: "lbl.Cny-money"}),
                        },
                        sumCol: { },  //汇总字段
                        sheetName: intl.formatMessage({id: 'lbl.Comm-summary'}),//佣金汇总
                    },
                ],
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        if(result.size<=0){  //若无数据，则不下载
            setSpinflag(false);
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false);
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.reportForm.unreportedQuery'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.reportForm.unreportedQuery'}); // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    {/* 重置 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields()
        setAgGridListt([]); 
        setAgSumGridList([]); 
        setCrGridListmList([]); 
        setCrSumGridListy([]); 
        // setBackFlag1(true)
        setBackFlag2(true)
        queryForm.setFieldsValue({
            // agencyCode: company.agencyCode,
            soCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }

    {/* 查询表格数据 */}
    const pageChange = async () =>{
        Toast('', '', '', 5000, false);
        let queryData = queryForm.getFieldValue();
        // if(!queryData.soCompanyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.activityDate){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.soCompanyCode || !queryData.activityDate){
            Toast('', intl.formatMessage({id:'lbl.unreported-query-warn'}), 'alert-error', 5000, false)
            return;
        }
        setSpinflag(true);
        const result = await request($apiUrl.REPORT_FORM_UNREPORTED_SEARCH_LIST,{
            method:"POST",
            data:{
                "params": {
                    soCompanyCode: queryData.soCompanyCode,
                    activeDateFrom: queryData.activityDate?momentFormat(queryData.activityDate[0]):null,
                    activeDateTo: queryData.activityDate?momentFormat(queryData.activityDate[1]):null,
                },
            }
        })
        let data=result.data
        if(result.success){
            setSpinflag(false);
            if(data.agGridList!=null){
                data.agGridList.map((v,i)=>{
                    v.uid=i
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            if(data.agSumGridList!=null){
                data.agSumGridList.map((v,i)=>{
                    v.uid=i
                })
            }
            if(data.crGridList!=null){
                data.crGridList.map((v,i)=>{
                    v.uid=i
                    v.activityDate ? v["activityDate"] = v.activityDate.substring(0, 10) : null;
                })
            }
            if(data.crSumGridList!=null){
                data.crSumGridList.map((v,i)=>{
                    v.uid=i
                })
            }
            setAgGridListt(data.agGridList); 
            setAgSumGridList(data.agSumGridList); 
            setCrGridListmList(data.crGridList); 
            setCrSumGridListy(data.crSumGridList); 
        }else{
            setSpinflag(false);
            setAgGridListt([])
            setAgSumGridList([])
            setCrGridListmList([])
            setCrSumGridListy([])
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* tab页点击 */}
    const callback = (key) => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setDefaultKey(key);
        if(key==1 && agGridList.length==0){
            setSpinflag(false);
        }else if(key==2 && agSumGridList.length==0){
            setSpinflag(false);
        }else if(key==3 && crGridList.length==0){
            setSpinflag(false);
        }else if(key==4 && crSumGridList.length==0){
            setSpinflag(false);
        }else{ 
            setTimeout(()=>{
                setSpinflag(false);
            } ,1000);
        }
    }

    return (
        <div className='parent-box'>
            <div className="header-from">
                <Form form={queryForm} name='search' onFinish={handleQuery}>
                    <Row>
                        {/* 船东 */}
                        {/* <Select name='soCompanyCode' disabled={company.companyType == 0 ? true : false} style={{background:backFlag1?'white':'yellow'}} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} span={6}/> */}
                        <Select name='soCompanyCode' disabled={company.companyType == 0 ? true : false} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} span={6}/>
                        {/* 代理编码 */}
                        {/* {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6} /> : <Select showSearch={true}  name='agencyCode' options={agencyCode} label={<FormattedMessage id='lbl.agency'/>}  span={6} />
                        } */}
                        {/* 业务日期 */}
                        <DoubleDatePicker name='activityDate' style={{background:backFlag2?'white':'yellow'}} label={<FormattedMessage id="lbl.argue.bizDate" />} span={6}  formlayouts={formlayouts}/>
                    </Row>
                </Form>
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
                    {/* 下载 */}
                    <Button onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                </div>
                <div className="button-right">
                    {/* 重置 */}
                    <Button onClick={clearBtn}><ReloadOutlined/><FormattedMessage id='btn.reset' /></Button>
                    {/* 查询 */}
                    <Button onClick={pageChange}><SearchOutlined /><FormattedMessage id='btn.search'/></Button>
                </div>
            </div>
            <div className="groupBox">
                <Tabs onChange={callback} activeKey={defaultKey} type="card" defaultActiveKey="1">
                    {/* 代理费清单 */}
                    <TabPane tab={<FormattedMessage id='lbl.Agfee-list'/>} key="1">
                        <div className="table" style={{width: '70%'}}>
                            <PaginationTable
                                dataSource={agGridList}
                                columns={agGridColumn}
                                rowKey='uid'  //billBasicUuid
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* 代理费汇总 */}
                    <TabPane tab={<FormattedMessage id='lbl.Agfee-summary'/>} key="2">
                        <div className="table" style={{width: '50%'}}>
                            <PaginationTable
                                dataSource={agSumGridList}
                                columns={agSumGridColumn}
                                rowKey='uid'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* 佣金清单 */}
                    <TabPane tab={<FormattedMessage id='lbl.Comm-list'/>} key="3">
                        <div className="table" style={{width: '70%'}}>
                            <PaginationTable
                                dataSource={crGridList}
                                columns={crGridColumn}
                                rowKey='uid'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                    {/* 佣金汇总 */}
                    <TabPane tab={<FormattedMessage id='lbl.Comm-summary'/>} key="4">
                        <div className="table" style={{width: '50%'}}>
                            <PaginationTable
                                dataSource={crSumGridList}
                                columns={crSumGridColumn}
                                rowKey='uid'
                                pagination={false}
                                scrollHeightMinus={200}
                                rowSelection={null}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </div>
            <Loading spinning={spinflag}/>
        </div>
    )
}

export default unreportedQuery