{/* 错误类型 */}
import React, { useState,useEffect,$apiUrl } from 'react'
import { FormattedMessage, useIntl} from 'umi';
import { Button, Form, Row, Tabs, Modal} from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, } from '@/utils/commonDataInterface';
import InputText from '@/components/Common/InputText'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast';
import Selects from '@/components/Common/Select';
import Loading from '@/components/Common/Loading';
import IptNumber from '@/components/Common/IptNumber';
import CosButton from '@/components/Common/CosButton'

import {
    FileAddOutlined, //新增
    DeleteOutlined, //删除
    SaveOutlined, //保存
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
} from '@ant-design/icons'

const confirm = Modal.confirm
{/* tab切换 */}
const { TabPane } = Tabs;
const errType =()=> {
    const [tableData, setTableData] = useState([]);     // 表格的数据
    const [tabTotal,setTabTotal] = useState([]); // table条数
    const [errorType, setTrrorType] = useState({});  //错误类型
    const [errorLevel, setErrorLevel] = useState({});  //错误级别
    const [needMailNotice, setNeedMailNotice] = useState({});  //Mail通知 
    const [needSmsNotice, setNeedSmsNotice] = useState({});  //SMS通知
    const [defaultKey, setDefaultKey] = useState('1');  //Tab key
    const [operType,setOperType] = useState('NEW')  //保存传的操作类型
    const [queryDataCode, setQueryDataCode] = useState([]);   // 代码标记
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [spinflag,setSpinflag] = useState(false);     // 加载
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [backFlag,setBackFlag] = useState(true);//背景颜色
    const [page,setPage]=useState({
        current: 1,
        pageSize: 10
    });
  
    const [lastCondition, setLastCondition] = useState({
        "errorCde": null,
    });
    {/*查询*/}
	const [queryForm] = Form.useForm();
    const handleQuery=()=>{
        setLastCondition({
            ...lastCondition,
            ...queryForm.getFieldValue()
        })
    }
     {/* 初始化 */}
     useEffect(()=>{
        acquireSelectData('ERROR.TYPE',setTrrorType, $apiUrl); //错误类型
        acquireSelectData('ERROR.EVEL',setErrorLevel, $apiUrl); //错误级别
        // acquireSelectData('MAIL.NOTICE',setNeedMailNotice, $apiUrl); //Mail通知
        // acquireSelectData('SMS.NOTICE',setNeedSmsNotice, $apiUrl); //SMS通知
        mailInt()
        smsInt()
    },[])
    useEffect(() => {
        queryForm.setFieldsValue({
            errorType: 'I',
            errorLevel: '1',
            needMailNotice: 'Y',
            needSmsNotice: 'Y',
        })
    }, [])
    const mailInt = async()=>{
        let mail = "MAIL.NOTICE"
        const result = await request($apiUrl.COMMON_DICT_ITEM + '?key=' + mail,   
            {
                method:'POST',
            }
        )
        if(result.success) {
            let data = result.data.values
            if(data!=null){
                data.map((v,i)=>{
                    v['value']=v.value;
                    v['label']=v.label.replace('Needn&#39;t','Needn not');
                })
            }
            setNeedMailNotice(data)
        }
    }
    const smsInt = async()=>{
        let sms = "SMS.NOTICE"
        const result = await request($apiUrl.COMMON_DICT_ITEM + '?key=' + sms,   
            {
                method:'POST',
            }
        )
        if(result.success) {
            let data = result.data.values
            if(data!=null){
                data.map((v,i)=>{
                    v['value']=v.value;
                    v['label']=v.label.replace('Needn&#39;t','Needn not');
                })
            }
            setNeedSmsNotice(data)
        }
    }
    {/* 错误查询列表 */}
    const column=[
        {
            title: <FormattedMessage id='lbl.error-code'/>,//错误编码
            dataIndex: 'errorCode',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id= 'lbl.Error-description'/>,//错误描述
            dataIndex: 'errorDescription',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Error-type'/>,//错误类型
            dataIndex: 'errorType',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.The-error-level'/>,//错误级别
            dataIndex: 'errorLevel',
            align:'left', 
            sorter: false,
            width: 80,
        },
        {
            title: <FormattedMessage id='lbl.Error-responsible-team'/>,//错误负责Team
            dataIndex: 'errorResponseTeam',
            align:'left', 
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.Solution-description'/>,//解决方法描述
            dataIndex: 'settleMethod',
            align:'left', 
            sorter: false,
            width: 100,
        },
        {
            title: <FormattedMessage id='lbl.Params-number'/>,//参数个数
            dataIndex: 'parameterNumber',
            align:'left', 
            sorter: false,
            width: 80,
        },
    ]
    {/* 重置 */}
    const resetBtn = () => {
        Toast('', '', '', 5000, false);
        queryForm.resetFields();
        setBackFlag(true);
        page.current=1;
        setTableData([]);
        setChecked([]);
        setCheckedRow([]);
        queryForm.setFieldsValue({
            errorType: 'I',
            errorLevel: '1',
            needMailNotice: 'Y',
            needSmsNotice: 'Y',
        })
    }
    {/* 清空 */}
    const clearBtn = () => {
        Toast('', '', '', 5000, false);
        setBackFlag(true)
        queryForm.resetFields();
        queryForm.setFieldsValue({
            errorType: 'I',
            errorLevel: '1',
            needMailNotice: 'Y',
            needSmsNotice: 'Y',
        })
    }
    {/* 删除 */}
    const deleteBtn = async() => {     
        Toast('', '', '', 5000, false);
        if(checkedRow.length<1){
            Toast('', intl.formatMessage({id: 'lbl.Select-record'}), 'alert-error', 5000, false);
            return
        }else{
            let params = checkedRow.map((item,index)=>{
                return item.errorCode
            })
            const confirmModal = confirm({
                title: intl.formatMessage({id:'lbl.delete'}),
                content: intl.formatMessage({id:'lbl.delete.select.content'}),
                okText: intl.formatMessage({id:'lbl.confirm'}),
                okType: 'danger',
                closable:true,
                cancelText:'',
                async onOk() {
                    confirmModal.destroy()
                    setSpinflag(true);
                    const deleteData = await request($apiUrl.ERROR_SEARCH_ERR_TYPE_DELETE_UUID,{
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
                    }else{
                        setSpinflag(false);
                        Toast('', deleteData.errorMessage, 'alert-error', 5000, false);
                    }
                }
            })   
        } 
    }
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
            const result = await request($apiUrl.ERROR_SEARCH_ERR_TYPE_SEARCH_LIST,{
                method:"POST",
                data:{
                    "page": pagination,
                    "params": {
                        errorCde: queryForm.getFieldValue().errorCde,
                    }
                }
            })
            let data=result.data
            if(result.success){
                setSpinflag(false);
                let datas=result.data.resultList
                setPage({...pagination})
                setTabTotal(data.totalCount)
                setTableData([...datas])
                setSelectedRowKeys([...datas])
            }else {
                setSpinflag(false);
                setTableData([])
                Toast('',result.errorMessage, 'alert-error', 5000, false)
            }
    }
    {/* 保存 */}
    const saveBtn = async() => {
        Toast('', '', '', 5000, false);
        if(!queryForm.getFieldValue().errorCode){
            Toast('', intl.formatMessage({id:'lbl.Err-save-warn'}), 'alert-error', 5000, false)
            setBackFlag(false)
            return;
        }else{
            setBackFlag(true)
            setSpinflag(true);
            const save = await request($apiUrl.ERROR_SEARCH_ERR_TYPE_SAVE_LIST,{
                method:"POST",
                data:{
                    "params": {
                        ...queryForm.getFieldValue(),
                        tmpErrorCode: queryDataCode.errorCode,
                    },
                    operateType:operType,   
                }
            })
            if(save.success) {
                setSpinflag(false);
                queryForm.resetFields();
                pageChange(page)
                Toast('', save.message, 'alert-success', 5000, false)
                setDefaultKey('1')
                queryForm.setFieldsValue({
                    errorType: 'I',
                    errorLevel: '1',
                    needMailNotice: 'Y',
                    needSmsNotice: 'Y',
                })
            }else{
                setSpinflag(false);
                Toast('', save.errorMessage, 'alert-error', 5000, false);
            }
        }
    }
    {/* 查询错误明细 */}
    const searchDetail = async(record) => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result =await request($apiUrl.ERROR_SEARCH_ERR_TYPE_SEARCH_DETAIL_LIST,{
            method:"POST",
            data:{
                params:record.errorCode,
            },
        })
        let data=result.data
        if(result.success) {
            setSpinflag(false);
            let datas=data.resultList[0]
            if(errorLevel.values!=null){
                errorLevel.values.map((v, i) => {
                    datas.errorLevel == v.value ? datas.errorLevel = v.value : '!Error';
                })
            }
            queryForm.setFieldsValue(data.resultList[0])
            setQueryDataCode(datas);
            setDefaultKey('2')
            setOperType('UPD')
        } else {
            setSpinflag(false);
            Toast('',result.errorMessage, 'alert-error', 5000, false)
        }
    }
    {/* 回调 */}
    const callback = (key) => {
		Toast('', '', '', 5000, false);
		setDefaultKey(key);
	}
    {/* 双击传参 */}
    const handleDoubleClickRow=(parameter)=>{
        Toast('', '', '', 5000, false);
        setBackFlag(true);
        searchDetail(parameter);
    }
    {/* 新增 */}
    const addBtn =()=>{
        Toast('', '', '', 5000, false);
        setDefaultKey('2')
        setOperType('NEW')
        queryForm.resetFields();
        queryForm.setFieldsValue({
            errorType: 'I',
            errorLevel: '1',
            needMailNotice: 'Y',
            needSmsNotice: 'Y',
        })
    }
    {/* 下载 */}
    const downloadBtn = async() => {
        Toast('', '', '', 5000, false);
        setSpinflag(true);
        const result = await request($apiUrl.BASE_COMM_CONFIG_DOWNLOAD,{
            method:"POST",
            data:{
                params: {
                    entryCode:"AFCM_B_ERR_CDE",
                    paramEntity:{
                        errorCode: queryForm.getFieldValue().errorCde,
                    }
                },
                excelFileName: intl.formatMessage({id: 'menu.afcm.errQuery.errType'}), //文件名
                sheetList: [{//sheetList列表
                    dataCol: {//列表字段
                        errorCode: intl.formatMessage({id: "lbl.error-code"}),
                        errorDescription: intl.formatMessage({id: "lbl.Error-description"}),
                        errorType: intl.formatMessage({id: "lbl.Error-type"}),
                        errorLevel: intl.formatMessage({id: "lbl.The-error-level"}),
                        errorResponseTeam: intl.formatMessage({id: "lbl.Error-responsible-team"}),
                        settleMethod: intl.formatMessage({id: "lbl.Solution-description"}),
                        parameterNumber: intl.formatMessage({id: "lbl.Params-number"}),
                    },
                    sumCol: { },  //汇总字段
                    sheetName: intl.formatMessage({id: 'menu.afcm.errQuery.errType'}),//sheet名称
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
                navigator.msSaveBlob(blob, intl.formatMessage({id: 'menu.afcm.errQuery.errType'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                setSpinflag(false);
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = intl.formatMessage({id: 'menu.afcm.errQuery.errType'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    const formlayouts = {
        labelCol: { span: 5 },
        wrapperCol: { span:30 },
    };
    return (
        <div className='parent-box'>
            <Tabs type="card" activeKey={defaultKey} onChange={callback}>
                <TabPane tab={<FormattedMessage id='lbl.Error-type' />} key="1">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 错误代码 */}
                                <InputText name='errorCde' label={<FormattedMessage id='lbl.error-code'/>} span={6}/>   
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='menu.afcm.errQuery'/></Button> </div>
                    </div>
                    <div className='main-button'>
                        <div className='button-left'>
                            {/* 新增 */}
                            <CosButton onClick={addBtn} auth='AFCM-ERR-QUERY-001-B01'><FileAddOutlined /><FormattedMessage id='lbl.new-btn'/></CosButton>
                            {/* 删除 */}
                            <CosButton  onClick={deleteBtn} auth='AFCM-ERR-QUERY-001-B02'><DeleteOutlined /><FormattedMessage id='lbl.delete'/></CosButton>
                            {/* 下载 */}
                            <Button  onClick={downloadBtn}><CloudDownloadOutlined /><FormattedMessage id='lbl.download'/></Button>
                        </div>
                        <div className='button-right'>
                            {/* 重置 */}
                            <Button onClick={resetBtn}>< ReloadOutlined/> <FormattedMessage id='btn.reset' /></Button>
                            {/* 查询 */}
                            <Button onClick={() => pageChange(page,'search')}><SearchOutlined /><FormattedMessage id='btn.search'/></Button>
                        </div>
                    </div>
                    <div className='footer-table'>
                        <PaginationTable
                            dataSource={tableData}
                            columns={column}
                            rowKey='errorCode'
                            pageChange={pageChange}
                            pageSize={page.pageSize}
                            current={page.current}
                            scrollHeightMinus={200}
                            total={tabTotal}
                            selectWithClickRow={true}
                            handleDoubleClickRow={handleDoubleClickRow}
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
                </TabPane>
                <TabPane  tab={<FormattedMessage id='lbl.Error-details'/>} key="2">
                    <div className='header-from' style={{marginTop:'15px'}}>
                        <Form form={queryForm}  name='func'>
                            <Row>
                                {/* 错误代码 */}
                                <InputText name='errorCode' label={<FormattedMessage id='lbl.error-code'/>} styleFlag={backFlag} span={12} isSpan={true}/>  
                                {/* 错误描述 */}
                                <InputText name='errorDescription' label={<FormattedMessage id='lbl.Error-description'/>}  span={24} isSpan={true} capitalized={false} formlayouts={formlayouts}/>
                                {/* 错误类型 */}
                                <Selects name='errorType' options={errorType.values} label={<FormattedMessage id= 'lbl.Error-type'/>} span={12} isSpan={true}/>  
                                {/* 错误级别 */}
                                <Selects name='errorLevel' options={errorLevel.values} label={<FormattedMessage id= 'lbl.The-error-level'/>} span={12} isSpan={true}/> 
                                {/* 错误负责Team */}
                                <InputText name='errorResponseTeam' label={<FormattedMessage id= 'lbl.Error-responsible-team'/>} span={12} isSpan={true}/> 
                                {/* Mail通知 */}
                                <Selects name='needMailNotice' options={needMailNotice} label={<FormattedMessage id= 'lbl.Mail-notice'/>} span={12} isSpan={true}/> 
                                {/* SMS通知 */}
                                <Selects name='needSmsNotice' options={needSmsNotice} label={<FormattedMessage id= 'lbl.SMS-number'/>} span={12} isSpan={true}/> 
                                {/* 解决方法描述 */}
                                <InputText name='settleMethod' label={<FormattedMessage id= 'lbl.Solution-description'/>} span={12} isSpan={true} capitalized={false}/> 
                                {/* 参数个数 */}
                                <IptNumber name='parameterNumber' label={<FormattedMessage id=  'lbl.Params-number'/>} span={12} isSpan={true}/> 
                                {/* 参数A */}
                                <InputText name='parameter1Name' label={<FormattedMessage id= 'lbl.Params-A'/>} span={12} isSpan={true}/> 
                                {/* 参数B */}
                                <InputText name='parameter2Name' label={<FormattedMessage id= 'lbl.Params-B'/>} span={12} isSpan={true}/> 
                                {/* 参数C */}
                                <InputText name='parameter3Name' label={<FormattedMessage id= 'lbl.Params-C'/>} span={12} isSpan={true}/> 
                                {/* 参数D */}
                                <InputText name='parameter4Name' label={<FormattedMessage id= 'lbl.Params-D'/>} span={12} isSpan={true}/> 
                                {/* 参数E */}
                                <InputText name='parameter5Name' label={<FormattedMessage id= 'lbl.Params-E'/>} span={12} isSpan={true}/> 
                                {/* 参数F */}
                                <InputText name='parameter6Name' label={<FormattedMessage id= 'lbl.Params-F'/>} span={12} isSpan={true}/> 
                                {/* 参数G */}
                                <InputText name='parameter7Name' label={<FormattedMessage id= 'lbl.Params-G'/>} span={12} isSpan={true}/> 
                                {/* 参数H */}
                                <InputText name='parameter8Name' label={<FormattedMessage id= 'lbl.Params-H'/>} span={12} isSpan={true}/> 
                                {/* 参数I */}
                                <InputText name='parameter9Name' label={<FormattedMessage id= 'lbl.Params-I'/>} span={12} isSpan={true}/> 
                                {/* 参数J */}
                                <InputText name='parameter10Name' label={<FormattedMessage id= 'lbl.Params-J'/>} span={12} isSpan={true}/> 
                                {/* Leave 1 Number Threshhold */}
                                <IptNumber name='level1NumberThreshhold' label={<FormattedMessage id=  'lbl.Leave-1-number-threshhold'/>} span={12} isSpan={true}/> 
                                {/* Leave 1 Date Threshhold  */}
                                <IptNumber name='level1DateThreshhold' label={<FormattedMessage id= 'lbl.Leave-1-date-threshhold'/>} span={12} isSpan={true}/> 
                                {/* Leave 2 Number Threshhold  */}
                                <IptNumber name='level2NumberThreshhold' label={<FormattedMessage id=  'lbl.Leave-2-number-threshhold'/>} span={12} isSpan={true}/> 
                                {/* Leave 2 Date Threshhold  */}
                                <IptNumber name='level2DateThreshhold' label={<FormattedMessage id= 'lbl.Leave-2-date-threshhold'/>} span={12} isSpan={true}/> 
                                {/* Leave 3 Number Threshhold  */}
                                <IptNumber name='level3NumberThreshhold' label={<FormattedMessage id=  'lbl.Leave-3-number-threshhold'/>} span={12} isSpan={true}/> 
                                {/* Leave 3 Date Threshhold  */}
                                <IptNumber name='level3DateThreshhold' label={<FormattedMessage id= 'lbl.Leave-3-date-threshhold'/>} span={12} isSpan={true}/>  
                            </Row>
                        </Form>
                        <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.Error-details' /></Button> </div>
                    </div>
                    <div className='add-main-button'> 
                        {/* 保存 */}
                        <CosButton onClick={() => saveBtn()} auth='AFCM-ERR-QUERY-001-B03'><SaveOutlined/><FormattedMessage id='lbl.save' /></CosButton>
                        {/* 清空 */}
                        <Button onClick={clearBtn}>< ReloadOutlined/> <FormattedMessage id='lbl.empty' /></Button>
                    </div>
                </TabPane>
            </Tabs>
            <Loading spinning={spinflag}/>
        </div>
    )
}
export default errType