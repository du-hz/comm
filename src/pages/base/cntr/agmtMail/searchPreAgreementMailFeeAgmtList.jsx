{/* 协议邮件接收配置 */}
import React, { useState,useEffect, $apiUrl,  } from 'react'
import {FormattedMessage,useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import InputText from '@/components/Common/InputText'
import {Form,Button,Row,Tooltip,Modal} from 'antd'
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import Select from '@/components/Common/Select';
import { acquireSelectDataExtend, agencyCodeData} from '@/utils/commonDataInterface';
import CosButton from '@/components/Common/CosButton'
import CosModal from '@/components/Common/CosModal'

import {
    DeleteOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情
    SearchOutlined,//日志
    FileAddOutlined,//新增
    CloudDownloadOutlined,//日志
    ReloadOutlined, //重置
    SaveOutlined, //保存
} from '@ant-design/icons'

const confirm = Modal.confirm

const searchPreAgreementMailFeeAgmtList =()=> {
    const [tableData,setTableData] = useState([])//表格数据
    const [tabTotal,setTabTotal] = useState([]); // table条数
    const [isModalVisible,setIsModalVisible] = useState(false)//控制弹框开关
    const [txt, setTxt] = useState('');
    const [commonFlag, setCommonFlag] = useState(false);     // 控制读写
    const [buttonFlag,setButtonFlag] = useState(true)//保存按钮是否禁用
    const [writeFlag,setWriteFlag] = useState(false);  //编辑修改权限
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const [backFlag1,setBackFlag1] = useState(true);//背景颜色
    const [backFlag2,setBackFlag2] = useState(true);//背景颜色
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [infoTips, setInfoTips] = useState({});   //message info
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [companyData, setCompanyData] = useState('')
    const [lastCondition, setLastCondition] = useState({
        "mailGroupDescription": null,
    });

    
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })

    const [queryForm] = Form.useForm();
    const handleQuery = () => {
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
    const formlayouts = {
        labelCol: { span: 5 },
        wrapperCol: { span:30 },
    };

    //初始化数据
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl,setAgencyCode,setCompany);     // 代理编码
        // LoginCompany()
    },[]) 
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
    }, [company, acquireData])

    // const LoginCompany = async()=>{
    //     //获取当前登录公司
    //     let company = await request($apiUrl.CURRENTUSER,{
    //         method:"POST",
    //         data:{}
    //     })
    //     if(company.success){
    //         setCompanyData(company.data.companyCode)
    //     }
    // }

    //协议邮件接收配置表格文本
    const columns=[
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align:'center',
            fixed: false,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 编辑 */}
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>addView(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-007-B04' onClick={() => {addView(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>addView(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id= 'lbl.carrier' />,//船东
            dataIndex: 'shipownerCompanyCode',
            // dataType: acquireData.values,
            sorter: false,
            align:'left',
            width: 60,
        },
        {
            title:<FormattedMessage id="lbl.the-mail-group" />,//邮件组
            dataIndex: 'mailGroup',
            sorter: false,
            align:'left',
            width: 100,
        },
        {
            title:<FormattedMessage id="lbl.Mail-Group-Description" />,//邮件组描述
            dataIndex: 'mailGroupDescription',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.LVL-1-MALL" />,//LVL_1_MALL
            dataIndex: 'level1Mail',
            sorter: false,
            width: 120,
            align:'left',
        },
        {
            title: <FormattedMessage id="lbl.LVL-2-MALL" />,//LVL_2_MALL
            dataIndex: 'level2Mail',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.LVL-3-MALL" />,//LVL_3_MALL
            dataIndex: 'level3Mail',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.update-date" /> ,//录入日期
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.update-people" />,//录入人
            dataIndex: 'recordUpdateUser',
            sorter: false,
            width: 60,
            align:'left',
        }
    ]

    //表格数据
    const pageChange= async(pagination,search) =>{
        Toast('', '', '', 5000, false);  
        setSpinflag(true);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
            const result = await request($apiUrl.BASE_CNTR_AG_MAIL_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        // ...queryForm.getFieldValue(),
                        shipownerCompanyCode: queryForm.getFieldValue().shipownerCompanyCode,
                        mailGroup: queryForm.getFieldValue().mailGroup,
                        // 'shipownerCompanyCode':companyData
                    }
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                if(datas!=null){
                    // datas.map((v,i)=>{
                    //     v.recordUpdateDatetime ? v["recordUpdateDatetime"] = v.recordUpdateDatetime.substring(0, 10) : null;
                    // })
                    datas.map((v, i) => {
                        v.uid=i
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
    {/* 删除 */}
    const deleteBtn = async() => {      
        Toast('', '', '', 5000, false);
        if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Select-record'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return {shipownerCompanyCode:item.shipownerCompanyCode, mailGroup:item.mailGroup}
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
                    const deleteData = await request($apiUrl.BASE_CNTR_AG_MAIL_DELETE_UUID,{
                        method:'POST',
                        data:{
                            paramsList:params
                        } 
                    })
                    if(deleteData.success) {
                        setSpinflag(false);
                        pageChange(page);
                        setCheckedRow([]);
                        setChecked([]);
                        Toast('',deleteData.message, 'alert-success', 5000, false)
                    }else{
                        setSpinflag(false);
                        Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                    }   
                }
            })
        }       
    }

    {/*  新建 */}
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'menu.afcm.base.cntr.agmtMail'})); 
        setCommonFlag(false);  //控制读写
        setButtonFlag(false); //保存按钮是否禁用
        setWriteFlag(false); //编辑修改权限
        queryForm.setFieldsValue({
            popData: {
                mailGroup: null,
                level1Mail: null,
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                level2Mail: null,
                mailGroupDescription: null,
                level3Mail: null,
            }
        })
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const addView = async(record, flag)=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_CNTR_AG_MAIL_SEARCH_LIST,{
            method:'POST',
            data: {
                params:{
                    shipownerCompanyCode:record.shipownerCompanyCode, 
                    mailGroup:record.mailGroup
                }
            }
        })
        if(result.success) {
            setSpinflag(false);
            setCommonFlag(flag); //控制读写
            setButtonFlag(flag); //保存按钮是否禁用
            setWriteFlag(true); //编辑修改权限
            let data = result.data;
            let datas = data.resultList[0]
            queryForm.setFieldsValue({
                popData:{
                    mailGroup: datas.mailGroup,
                    level1Mail: datas.level1Mail,
                    shipownerCompanyCode: datas.shipownerCompanyCode,
                    level2Mail: datas.level2Mail,
                    mailGroupDescription: datas.mailGroupDescription,
                    level3Mail: datas.level3Mail,
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));  
            // } else {
            //     setTxt(intl.formatMessage({id:'lbl.edit'}));
            // }
            setTxt(intl.formatMessage({id:'menu.afcm.base.cntr.agmtMail'})); 
            setIsModalVisible(true);
        } else {
            setSpinflag(false);
            Toast('', result.errorMessage, 'alert-error', 5000, false);
        }
    }
    {/* 保存 */}
    const handleSave = async() => {
        setInfoTips({});
        let queryData = queryForm.getFieldValue().popData
        if(!queryData.shipownerCompanyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.mailGroup){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.shipownerCompanyCode || !queryData.mailGroup){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.base-mail-warn'})});
           return;
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.BASE_CNTR_AG_MAIL_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        ...queryForm.getFieldValue().popData,
                    },
                }
            })
            if(save.success) {
                setSpinflag(false);
                setIsModalVisible(false)
                pageChange(page)
                Toast('', save.message, 'alert-success', 5000, false)
            }else{
                setSpinflag(false);
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
        }
    }
    {/* 关闭弹框 */}
    const handleCancel = () =>{
        setInfoTips({});
        queryForm.setFieldsValue({
            popData: null
        })
        setBackFlag1(true);
        setBackFlag2(true);
        setIsModalVisible(false)
    }
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        setBackFlag1(true);
        setBackFlag2(true);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
        })
        setTableData([]);
        setChecked([]);
        setCheckedRow([]);
    }
    {/* 下载 */} 
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_B_AGMT_MAIL",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.cntr.agmtMail'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                        mailGroup: intl.formatMessage({id: "lbl.the-mail-group"}),
                        mailGroupDescription: intl.formatMessage({id: "lbl.Mail-Group-Description"}),
                        level1Mail: intl.formatMessage({id: "lbl.LVL-1-MALL"}),
                        level2Mail: intl.formatMessage({id: "lbl.LVL-2-MALL"}),
                        level3Mail: intl.formatMessage({id: "lbl.LVL-3-MALL"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.Date-of-entry"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.data-entry-clerk"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.cntr.agmtMail'}),//sheet名称
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
            let blob = new Blob([result], { type: "application/x-xls" });
            // let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                setSpinflag(false);
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.cntr.agmtMail'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.cntr.agmtMail'}) + '.xlsx'; // 下载后文件名
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
                        <Select  name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} disabled={company.companyType == 0 ? true : false} span={6}/>
                        {/* 邮件组 */}
                        <InputText name='mailGroup' label={<FormattedMessage id='lbl.the-mail-group'/>} span={6}/> 
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CMS-007-B01'><FileAddOutlined /><FormattedMessage id='lbl.add'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-BASE-CMS-007-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
                    {/* 下载 */}
                    <CosButton  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <CosButton onClick={clearBtn}><ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                     <CosButton  onClick={()=>pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey='uid'
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
            {/* <Modal title={txt} visible={isModalVisible} maskClosable={false}  onCancel={handleCancel} width='50%' height='100%' > */}
            <CosModal cbsWidth={550} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/> 
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleSave}
                        >
                            <Row>
                                {/* 船东 */}
                                <Select name={['popData','shipownerCompanyCode']}  disabled={writeFlag} disabled={company.companyType == 0 ? true : false}  style={{background:backFlag1?'white':'yellow'}} label={<FormattedMessage id= 'lbl.carrier'/>}  span={12}  flag={true} isSpan={true} options={acquireData.values}/>
                                {/* 邮件组 */}
                                <InputText name={['popData','mailGroup']} disabled={writeFlag} styleFlag={backFlag2} label={<FormattedMessage id='lbl.the-mail-group'/>}  span={12} isSpan={true}/>
                                {/* 邮件组描述 */}
                                <InputText name={['popData','mailGroupDescription']} disabled={commonFlag}  label={<FormattedMessage id='lbl.Mail-Group-Description'/>}   span={12} isSpan={true} capitalized={false}/>
                                {/* LVL_1_MALL */}
                                <InputText name={['popData','level1Mail']} disabled={commonFlag}  label={<FormattedMessage id='lbl.LVL-1-MALL'/>}   span={24} isSpan={true} formlayouts={formlayouts} capitalized={false}/>  
                                {/* LVL_2_MALL */}
                                <InputText name={['popData','level2Mail']} disabled={commonFlag}  label={<FormattedMessage id='lbl.LVL-2-MALL'/>}   span={24} isSpan={true} formlayouts={formlayouts} capitalized={false}/>
                                {/* LVL_3_MALL */}
                                <InputText name={['popData','level3Mail']} disabled={commonFlag}  label={<FormattedMessage id='lbl.LVL-3-MALL'/>}  span={24} isSpan={true} formlayouts={formlayouts} capitalized={false}/>
                            </Row>
                        </Form> 
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存按钮 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={()=> handleSave()} auth='AFCM-BASE-CMS-007-B03'> <FormattedMessage id='btn.save'/></CosButton>
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

export default searchPreAgreementMailFeeAgmtList;