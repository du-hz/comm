{/*箱扣比例*/}
import React, { useEffect, useState, $apiUrl } from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import { Button, Form, Row, Tooltip,Modal } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { momentFormat } from '@/utils/commonDataInterface';
import {Toast} from '@/utils/Toast'
import DatePicker from '@/components/Common/DatePicker'
import moment from 'moment';
import IptNumber from '@/components/Common/IptNumber';
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    DeleteOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    FileAddOutlined,//新增
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SaveOutlined, //保存
} from '@ant-design/icons'
const confirm = Modal.confirm

const discount =()=> {
    const [companysData, setCompanysData] = useState([]);    // 公司
    const [tabTotal,setTabTotal] = useState([]);//表格的数据
    const [isModalVisible, setIsModalVisible] = useState(false);  // 弹窗控制
    const [writeRead,setWriteRead] = useState(false);//区别新增编辑查看详情
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [tableData, setTableData] = useState([]);     // table数据
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [txt, setTxt] = useState(''); //弹窗标题
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const [backFlag3,setBackFlag3] = useState(true);//背景颜色
    const [backFlag4,setBackFlag4] = useState(true);//背景颜色
    const [backFlag5,setBackFlag5] = useState(true);//背景颜色
    const [backFlag6,setBackFlag6] = useState(true);//背景颜色
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [infoTips, setInfoTips] = useState({});   //message info
	const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
	const [lastCondition, setLastCondition] = useState({
        "porCountryCode": null,
        "fndCountryCode": null,
    });

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
        setTableData([]);
        setBackFlag1(true);
        setBackFlag2(true);
        setBackFlag3(true);
        setBackFlag4(true);
        setBackFlag5(true);
        setBackFlag6(true);
        setChecked([]);
        setCheckedRow([]);
    }
	{/*初始化*/}
	useEffect(()=>{
        searchCompanyCode($apiUrl,setCompanysData)  //公司代码
    },[])
    {/* 公司代码 */}
    const searchCompanyCode = async(apiUrl,setCompanysData)=>{
        const result = await request(apiUrl.COMMON_COMPANY_CURRENTUSER,{
            method:"POST",
        })
        if(result.success){
            let companyCodeData =result.data.companyCode
            setCompanysData(companyCodeData)
        }
    }
	{/*表格文本*/}
	const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'center',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 编辑 */}
                     {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addView(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                     <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-001-B04' onClick={() => {addView(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addView(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.company-code" />,//公司编码
            dataIndex: 'companyCode',
            sorter: false,
            width: 60,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.porcountry-region" />,//POR国家/地区
            dataIndex: 'porCountryCode',
            sorter: false,
            width: 90,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.fdncountry-region" />,//FND国家/地区
            dataIndex: 'fndCountryCode',
            sorter: false,
            width: 90,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.teu-rate" />,//标准箱费率
            dataIndex: 'teuRate',
            sorter: false,
            width: 80,
            align:'right', 
        },
		{
            title: <FormattedMessage id="lbl.currency" />,//货币
            dataIndex: 'currencyCode',
            sorter: false,
            width: 60,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.effective-date" />,//生效日期
            dataIndex: 'fromDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.effective-date-id" />,//生效日期ID
            dataIndex: 'fromDateId',
            sorter: false,
            width: 80,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.expiration-date" />,//失效日期
            dataIndex: 'toDate',
            sorter: false,
            width: 80,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.expiration-date-id" />,//失效日期ID
            dataIndex: 'toDateId',
            sorter: false,
            width: 80,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.update-date" />,//录用日期
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 80,
            align:'left', 
        },
		{
            title: <FormattedMessage id="lbl.update-people" />,//录用人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 80,
            align:'left', 
        },
    ]

    {/*删除*/}
    const deleteBtn = async() => {      
        Toast('', '', '', 5000, false);
        if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Select-record'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return {containerDiscountRateUuid:item.containerDiscountRateUuid, }
            })
            const confirmModal = confirm({
                title: intl.formatMessage({id:'lbl.afcm-delete'}),
                content: intl.formatMessage({id:'lbl.delete.select.content'}),
                okText: intl.formatMessage({id:'lbl.affirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    const deleteData = await request($apiUrl.COMM_MODULE_DELETE_BOX_BUCKLE_UUID,{
                        method:'POST',
                        data:{
                            paramsList:params
                        } 
                    })
                    if(deleteData.success) {
                        setSpinflag(false);
                        pageChange(page);
                        Toast('',deleteData.message, 'alert-success', 5000, false)
                        setCheckedRow([])
                    } else{
                        setSpinflag(false);
                        Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                    }  
                }
            })
        }       
    }
    {/* 编辑/查看明细 */}
    const addView = async(record, flag) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        // 查看详情为true，编辑为false
        const result = await request($apiUrl.COMM_MODULE_SEARCH_PRE_HEAD_DETAIL,       
            {
                method:'POST',
                data: {
                    "params": {
                        "entryCode":"AFCM_B_CNTR_DISCNT_RATE"
                    },
                    uuid: record.containerDiscountRateUuid
                }
            }
        )
        if(result.success) {
            setSpinflag(false);
            setCommonFlag(flag);
            setWriteRead(true);
            setButtonFlag(flag)
            let data = result.data;
            queryForm.setFieldsValue({
                popData:{
                    companyCode: data.companyCode,
                    porCountryCode: data.porCountryCode,
                    fndCountryCode: data.fndCountryCode,
                    teuRate: data.teuRate,
                    currencyCode: data.currencyCode,
                    toDate: moment(data.toDate),
                    fromDate: moment(data.fromDate),
                    containerDiscountRateUuid: data.containerDiscountRateUuid
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id: 'lbl.ViewDetails'}));
            // } else {
            //     setTxt(intl.formatMessage({id: 'lbl.edit'}));
            // }
            setTxt(intl.formatMessage({id: 'menu.afcm.base.cntr.discount'})); 
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }

    {/*  新建 */}
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id: 'menu.afcm.base.cntr.discount'})); 
        setWriteRead(false);  //区别新增编辑查看详情 
        setCommonFlag(false);  //控制读写
        setButtonFlag(false);
        setCompanysData(companysData);
        queryForm.setFieldsValue({
            popData: {
                porCountryCode: null,
                fndCountryCode: null,
                teuRate: null,
                currencyCode: null,
                fromDate: moment(tableData.fromDate),
                toDate: moment("9999-12-31"),
            }
        })
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }

    {/*查询表格数据*/}
    const pageChange = async (pagination,search) =>{
        setSpinflag(true);
        Toast('', '', '', 5000, false);  
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
            const result = await request($apiUrl.AGENCY_FEE_ACCOUNT_CHECK_MONITOR_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        "paramEntity":{
                            // ...queryForm.getFieldValue(),
                            porCountryCode: queryForm.getFieldValue().porCountryCode,
                            fndCountryCode: queryForm.getFieldValue().fndCountryCode,
                            companyCode: companysData
                        },
                        "entryCode": "AFCM_B_CNTR_DISCNT_RATE"
                    }
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                if(datas!=null){
                    datas.map((v,i)=>{
                        v.fromDate ? v["fromDate"] = v.fromDate.substring(0, 10) : null;
                        v.toDate ? v["toDate"] = v.toDate.substring(0, 10) : null;
                        // v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
                    })
                }
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setSelectedRowKeys([...datas])
                if(datas.length==0){
                    setTableData([])
                    Toast('', intl.formatMessage({id: 'lbl.query-warn'}), 'alert-error', 5000, false);
                }
            }else {
                setSpinflag(false);
                setTableData([])
                Toast('', result.errorMessage, 'alert-error', 5000, false);
            }
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.porCountryCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.fndCountryCode){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.teuRate){setBackFlag3(false)}else{setBackFlag3(true)}
        if(!queryData.currencyCode){setBackFlag4(false)}else{setBackFlag4(true)}
        if(!queryData.fromDate){setBackFlag5(false)}else{setBackFlag5(true)}
        if(!queryData.toDate){setBackFlag6(false)}else{setBackFlag6(true)}
        if(/^[\u4e00-\u9fa5]+$/i.test(queryData.porCountryCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.fndCountryCode) || /^[\u4e00-\u9fa5]+$/i.test(queryData.currencyCode)){//检测输入的中文汉字
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});
            return
        }else if(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.porCountryCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.fndCountryCode) || 
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/.test(queryData.currencyCode)){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.chinese-character'})});//检测输入的中文符号
            return
        }
        if(queryData.porCountryCode){
            if(queryData.porCountryCode.length>3){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.porcountry-region'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.fndCountryCode){
            if(queryData.fndCountryCode.length>3){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.fdncountry-region'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(queryData.currencyCode){
            if(queryData.currencyCode.length>3){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.currency'})+intl.formatMessage({id: 'lbl.comm-input'})});
                return
            }
        }
        if(!queryData.porCountryCode || !queryData.fndCountryCode || !queryData.teuRate ||
             !queryData.currencyCode || !queryData.fromDate || !queryData.toDate){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.discount-warn'})});
            return;
        }else if(queryData.fromDate>queryData.toDate){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.discount-date-warn'})});
            return
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.COMM_MODULE_BOX_BUCKLE_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        companyCode: companysData,
                        porCountryCode: queryData.porCountryCode,
                        fndCountryCode: queryData.fndCountryCode,
                        teuRate: queryData.teuRate,
                        currencyCode: queryData.currencyCode,
                        fromDate: momentFormat(queryData.fromDate),
                        toDate: momentFormat(queryData.toDate),
                        containerDiscountRateUuid: queryData.containerDiscountRateUuid
                    }
                }
            })
            if(save.success) {
                setSpinflag(false);
                // queryForm.resetFields();
                setIsModalVisible(false)
                pageChange(page)
                Toast('', save.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
        }
    }
    {/* 取消 */}
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
        setBackFlag5(true);
        setBackFlag6(true);
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_B_CNTR_DISCNT_RATE",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                        companyCode: companysData
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.cntr.discount'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        companyCode: intl.formatMessage({id: "lbl.company-code"}),
                        porCountryCode: intl.formatMessage({id: "lbl.porcountry-region"}),
                        fndCountryCode: intl.formatMessage({id: "lbl.fdncountry-region"}),
                        teuRate: intl.formatMessage({id: "lbl.teu-rate"}),
                        currencyCode: intl.formatMessage({id: "lbl.currency"}),
                        fromDate: intl.formatMessage({id: "lbl.effective-date"}),
                        fromDateId: intl.formatMessage({id: "lbl.effective-date-id"}),
                        toDate: intl.formatMessage({id: "lbl.expiration-date"}),
                        toDateId: intl.formatMessage({id: "lbl.expiration-date-id"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.employment-date"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.employment-person"}),
                        
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.cntr.discount'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.cntr.discount'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.cntr.discount'})+ '.xlsx'; // 下载后文件名
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
                        {/* POR国家/地区 */}
						<InputText name='porCountryCode' label={<FormattedMessage id='lbl.porcountry-region'/>} span={6}/> 
                        {/* FND国家/地区 */}
                        <InputText name='fndCountryCode' label={<FormattedMessage id='lbl.fdncountry-region'/>} span={6}/> 
                    </Row>
                </Form>
                {/*查询条件*/}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className="main-button">
                <div className="button-left">
					{/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CMS-001-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-BASE-CMS-001-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
					{/* 下载 */}
                    <CosButton  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className="button-right">
                    <CosButton onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></CosButton>
                    <CosButton onClick={() => pageChange(page,search)}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className="footer-table">
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='containerDiscountRateUuid'
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    selectedRowKeys = {selectedRowKeys}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setCheckedRow(row);
                        }
                    }}
                />
            </div>
            {/* 弹窗 */}
            {/* <Modal title={txt} visible={isModalVisible} footer={null} width="50%" height="50%" onCancel={() => handleCancel()} maskClosable={false}> */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/>    
                <div className='modalContent' style={{minWidth: '300px'}}>    
                        <Form form={queryForm} name='add' onFinish={handleSave}>
                            <Row>
                                {/* POR国家/地区 */}
                                <InputText disabled={writeRead} name={['popData','porCountryCode']} styleFlag={backFlag1} label={<FormattedMessage id='lbl.porcountry-region'/>}  span={12} maxLength={3} isSpan={true}/> 
                                {/* FND国家/地区 */}
                                <InputText disabled={writeRead} name={['popData','fndCountryCode']} styleFlag={backFlag2} label={<FormattedMessage id='lbl.fdncountry-region'/>}  span={12} maxLength={3} isSpan={true}/> 
                                {/* 标准箱费率 */}
                                <IptNumber disabled={commonFlag} name={['popData','teuRate']} styleFlag={backFlag3} label={<FormattedMessage id='lbl.teu-rate'/>}  span={12} min={0} isSpan={true}/> 
                                {/* 货币 */}
                                <InputText disabled={commonFlag} name={['popData','currencyCode']} styleFlag={backFlag4} label={<FormattedMessage id='lbl.currency'/>}  span={12} maxLength={3} isSpan={true}/> 
                                {/* 生效日期 */}
                                <DatePicker disabled={commonFlag} name={['popData','fromDate']} styleFlag={backFlag5} label={<FormattedMessage id="lbl.effective-date" />} span={12} isSpan={true}/>
                                {/* 失效日期 */}
                                <DatePicker disabled={commonFlag} name={['popData','toDate']} styleFlag={backFlag6} label={<FormattedMessage id="lbl.expiration-date" />} span={12} isSpan={true}/>                               
                            </Row>
                        </Form>
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={() => handleSave()} auth='AFCM-BASE-CMS-001-B03'><FormattedMessage id='lbl.save' /></CosButton>
                                {/* 取消 */}
                                <CosButton onClick={() => handleCancel()}><FormattedMessage id='lbl.cancel' /></CosButton>
                            </div>
                    </div>
                </div>
            </CosModal>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default discount;