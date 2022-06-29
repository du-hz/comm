{/* 代理区域配置 */}
import React, { useState,useEffect, $apiUrl,} from 'react'
import {FormattedMessage,  useIntl} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import {Toast} from '@/utils/Toast'
import {Form,Button,Row,Tooltip,Modal} from 'antd'
import InputText from '@/components/Common/InputText'
import Loading from '@/components/Common/Loading';
import {CosToast}  from '@/components/Common/index'
import Select from '@/components/Common/Select'
import { acquireSelectDataExtend,agencyCodeData } from '@/utils/commonDataInterface';
import CosButton from '@/components/Common/CosButton'
import Selects from '@/components/Common/Select';
import CosModal from '@/components/Common/CosModal'

import {
    DeleteOutlined,//删除
    FormOutlined,//编辑
    FileSearchOutlined,//查看详情 
    SearchOutlined,//日志
    FileAddOutlined,//新增
    CloudDownloadOutlined,//日志
    SaveOutlined, //保存
    ReloadOutlined, //清除
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
    const [companyData, setCompanyData] = useState('')
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [lastCondition, setLastCondition] = useState({
        "agencyCode": null,
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

    //初始化下拉框数据
    useEffect(()=>{
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
        // LoginCompany()
    },[])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
            agencyCode: company.agencyCode
        })
    }, [company,acquireData])

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
        
    //代理区域配置表格文本
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
                    {/* <Tooltip title={<FormattedMessage id='btn.edit' />}><a onClick={()=>editView(record,false)}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp; */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a><CosButton auth='AFCM-BASE-CMS-008-B04' onClick={() => {editView(record, false)}} ><FormOutlined style={{color:'#1890ff',fontSize: '15px'}}/></CosButton> </a>
                    </Tooltip>&nbsp;
                    {/* 查看明细 */}
                    <Tooltip title={<FormattedMessage id='btn.ac.show-inv-dtl' />}><a onClick={()=>editView(record,true)}><FileSearchOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.carrier' />,//船东
            dataIndex: 'shipownerCompanyCode',
            // dataType: acquireData.values,
            sorter: false,
            align:'left',
            width: 60,
        },
        {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'agencyCode',
            sorter: false,
            align:'left',
            width: 80,
            
        },
        {
            title:<FormattedMessage id="lbl.Agent-name" />,//代理名称
            dataIndex: 'agencyName',
            sorter: false,
            width: 120,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.area" />,//区域
            dataIndex: 'area',
            sorter: false,
            width: 100,
            align:'left',
            
        },
        {
            title: <FormattedMessage id="lbl.PMD-Message-group-to-be-reviewed" />,//PMD待审核邮件组
            dataIndex: 'pmdMailGroup',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title: <FormattedMessage id="lbl.FAD-Message-group-to-be-reviewed" />,//FAD待审核邮件组
            dataIndex: 'fadMailGroup',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.AGENCY-Message-group-to-be-reviewed" /> ,//AGENCY待审核邮件组
            dataIndex: 'agencyMailGroup',
            sorter: false,
            width: 140,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.Summarize-protocol-mail-groups" /> ,//汇总协议邮件组
            dataIndex: 'sumMailGroup',
            sorter: false,
            width: 120,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.abbreviation" /> ,//缩写
            dataIndex: 'shorthand',
            sorter: false,
            width: 100,
            align:'left', 
        },
        {
            title:<FormattedMessage id="lbl.update-date" /> ,//录入日期
            dataIndex: 'recordUpdateDatetime',
            sorter: false,
            width: 100,
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

    {/* 查询表格数据 */}
    const pageChange = async (pagination,search) =>{
        Toast('', '', '', 5000, false);  
        setSpinflag(true);
        if(search){
            pagination.current=1
            pagination.pageSize=10
        }
        if(pagination.pageSize!=page.pageSize){
            pagination.current=1
        }
            const result = await request($apiUrl.BASE_CNTR_AG_AREA_CONFIG_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        // ...queryForm.getFieldValue(),
                        shipownerCompanyCode: queryForm.getFieldValue().shipownerCompanyCode,
                        agencyCode: queryForm.getFieldValue().agencyCode,
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
    {/*  新建 */}
    const addBtn = () => {
        setSpinflag(true);
        Toast('', '', '', 5000, false);
        setTxt(intl.formatMessage({id:'menu.afcm.base.cntr.agtAreaConf'})); 
        setCommonFlag(false);  //控制读写
        setButtonFlag(false); //保存按钮是否禁用
        setWriteFlag(false); //编辑修改权限
        queryForm.setFieldsValue({
            popData: {
                agencyCode: company.agencyCode,
                shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
                agencyName: null,
                area: null,
                pmdMailGroup: null,
                fadMailGroup: null,
                agencyMailGroup: null,
                sumMailGroup: null,
                shorthand: null,
            }
        })
        setTimeout(()=>{
            setSpinflag(false);
            setIsModalVisible(true);
        } ,500);
    }
    {/* 编辑/查看明细 */}
    const editView = async(record, flag)=>{
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_CNTR_AG_AREA_CONFIG_SEARCH_LIST,{
            method:'POST',
            data: {
                params:{
                    shipownerCompanyCode:record.shipownerCompanyCode, 
                    agencyCode:record.agencyCode
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
                    agencyCode: datas.agencyCode,
                    shipownerCompanyCode: datas.shipownerCompanyCode,
                    agencyName: datas.agencyName,
                    area: datas.area,
                    pmdMailGroup: datas.pmdMailGroup,
                    fadMailGroup: datas.fadMailGroup,
                    agencyMailGroup: datas.agencyMailGroup,
                    sumMailGroup: datas.sumMailGroup,
                    shorthand: datas.shorthand,
                }
            })
            // if(flag) {
            //     setTxt(intl.formatMessage({id:'lbl.ViewDetails'}));    
            // } else {
            //     setTxt(intl.formatMessage({id:'lbl.edit'})); 
            // }
            setTxt(intl.formatMessage({id:'menu.afcm.base.cntr.agtAreaConf'})); 
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
        if(!queryData.agencyCode){setBackFlag1(false)}else{setBackFlag1(true)}
        if(!queryData.shipownerCompanyCode){setBackFlag2(false)}else{setBackFlag2(true)}
        if(!queryData.agencyCode || !queryData.shipownerCompanyCode){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.base-area-warn'})});
           return;
        }else{
            setSpinflag(true);
            const save = await request($apiUrl.BASE_CNTR_AG_AREA_CONFIG_SAVE_SUBMIT,{
                method:"POST",
                data:{
                    "params": {
                        ...queryForm.getFieldValue().popData
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
    {/* 删除 */}
    const deleteBtn = async() => {       
        Toast('', '', '', 5000, false);
        if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Select-record'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return {shipownerCompanyCode:item.shipownerCompanyCode, agencyCode:item.agencyCode } 
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
                    const deleteData = await request($apiUrl.BASE_CNTR_AG_AREA_CONFIG_DELETE_UUID,{
                        method:'POST',
                        data:{
                            paramsList:params
                        } 
                    })
                    if(deleteData.success) {
                        setSpinflag(false);
                        pageChange(page);
                        Toast('',deleteData.message, 'alert-success', 5000, false)
                        setCheckedRow([]);
                        setChecked([]);
                    } else{
                        setSpinflag(false);
                        Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                    }  
                }
            })
        }       
    }

    {/* 关闭弹框 */}
    const handleCancel = () =>{
        setInfoTips({});
        queryForm.setFieldsValue({
            popData: null
        })
        setIsModalVisible(false)
        setBackFlag1(true);
        setBackFlag2(true);
    }
    {/*清空*/}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        setBackFlag1(true);
        setBackFlag2(true);
        queryForm.resetFields();
        queryForm.setFieldsValue({
            agencyCode: company.agencyCode,
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,
        }, [company,acquireData])
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
                    entryCode:"AFCM_B_AGENCY_AREA",
                    paramEntity:{
                        ...queryForm.getFieldValue(),
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.base.cntr.agtAreaConf'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        shipownerCompanyCode: intl.formatMessage({id: "lbl.carrier"}),
                        agencyCode: intl.formatMessage({id: "lbl.agency"}),
                        agencyName: intl.formatMessage({id: "lbl.Agent-name"}),
                        area: intl.formatMessage({id: "lbl.area"}),
                        pmdMailGroup: intl.formatMessage({id: "lbl.PMD-Message-group-to-be-reviewed"}),
                        fadMailGroup: intl.formatMessage({id: "lbl.FAD-Message-group-to-be-reviewed"}),
                        agencyMailGroup: intl.formatMessage({id: "lbl.AGENCY-Message-group-to-be-reviewed"}),
                        sumMailGroup: intl.formatMessage({id: "lbl.Summarize-protocol-mail-groups"}),
                        shorthand: intl.formatMessage({id: "lbl.abbreviation"}),
                        recordUpdateDatetime: intl.formatMessage({id: "lbl.Date-of-entry"}),
                        recordUpdateUser: intl.formatMessage({id: "lbl.data-entry-clerk"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.base.cntr.agtAreaConf'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.base.cntr.agtAreaConf'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.base.cntr.agtAreaConf'}) + '.xlsx'; // 下载后文件名
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
                        {/* 代理编码 */}
                        {/* <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>} span={6}/>  */}
                        {
                            company.companyType == 0 ? <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency' />} /> : <Selects showSearch={true} flag={true} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} options={agencyCode} />
                        }
                    </Row>
                </Form> 
                {/* 查询条件 */}
                <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms'/></Button> </div>
            </div>
            <div className='main-button'>
                <div className='button-left'>
                    {/* 新增 */}
                    <CosButton onClick={addBtn} auth='AFCM-BASE-CMS-008-B01'><FileAddOutlined /><FormattedMessage id='lbl.add'/></CosButton>
                    {/* 删除 */}
                    <CosButton  onClick={deleteBtn} auth='AFCM-BASE-CMS-008-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
                    {/* 下载 */}
                    <CosButton  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></CosButton>
                </div>
                <div className='button-right'>
                    {/* 重置 */}
                    <CosButton onClick={clearBtn} ><ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                    {/* 查询按钮 */}
                     <CosButton  onClick={() => pageChange(page,'search')}> <SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
                </div>
            </div>
            <div className='footer-table'>
                <PaginationTable
                    dataSource={tableData}
                    columns={columns}
                    rowKey="uid"
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
            <CosModal cbsWidth={670} cbsVisible={isModalVisible} cbsTitle={txt} cbsFun={() => handleCancel()}>
            <CosToast toast={infoTips}/>    
                <div className='modalContent' style={{minWidth: '300px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleSave}
                        >
                            <Row>
                                {/* 船东 */}
                                <Select span={12} name={['popData','shipownerCompanyCode']}  disabled={writeFlag} disabled={company.companyType == 0 ? true : false} style={{background:backFlag2?'white':'yellow'}} label={<FormattedMessage id= 'lbl.carrier'/>}  options={acquireData.values} flag={true} isSpan={true}/>
                                {/* 代理编码 */}
                                <InputText span={12} name={['popData','agencyCode']} disabled={writeFlag}  styleFlag={backFlag1} label={<FormattedMessage id='lbl.agency'/>}   maxLength={10} isSpan={true}/>
                                {/* 代理名称 */}
                                <InputText name={['popData','agencyName']} disabled={commonFlag} label={<FormattedMessage id='lbl.Agent-name'/>}   span={12} isSpan={true} capitalized={false}/>
                                {/* 区域 */}
                                <InputText name={['popData','area']} disabled={commonFlag} label={<FormattedMessage id='lbl.area'/>}   span={12} isSpan={true} capitalized={false}/>  
                                {/* PMD待审核邮件组 */}
                                <InputText name={['popData','pmdMailGroup']} disabled={commonFlag} label={<FormattedMessage id='lbl.PMD-Message-group-to-be-reviewed'/>}   span={12} isSpan={true} capitalized={false}/>
                                {/* FAD待审核邮件组 */}
                                <InputText name={['popData','fadMailGroup']} disabled={commonFlag} label={<FormattedMessage id='lbl.FAD-Message-group-to-be-reviewed'/>}  span={12} isSpan={true} capitalized={false}/>
                                {/* AGENCY待审核邮件组 */}
                                <InputText name={['popData','agencyMailGroup']} disabled={commonFlag} label={<FormattedMessage id='lbl.AGENCY-Message-group-to-be-reviewed'/>}  span={12} isSpan={true} capitalized={false}/>
                                {/* 汇总协议邮件组 */}
                                <InputText name={['popData','sumMailGroup']} disabled={writeFlag} label={<FormattedMessage id='lbl.Summarize-protocol-mail-groups'/>}  span={12} isSpan={true} capitalized={false}/>
                                {/* 缩写 */}
                                <InputText name={['popData','shorthand']} disabled={commonFlag} label={<FormattedMessage id='lbl.abbreviation'/>}  span={12} isSpan={true} capitalized={false}/>
                            </Row>
                        </Form> 
                        <div className='main-button'>
                            <div className='button-left'></div>
                            <div className='button-right'>
                                {/* 保存 */}
                                <CosButton disabled={buttonFlag?true:false} onClick={()=> handleSave()} auth='AFCM-BASE-CMS-008-B03'><FormattedMessage id='btn.save'/></CosButton>
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