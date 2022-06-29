import React, { useEffect, useState, $apiUrl } from 'react'
import { Form, Button, Row, Tabs, Tooltip, Modal } from 'antd'
import { FormattedMessage, useIntl } from 'umi'
import { CosInputText, CosSelect, CosDatePicker, CosButton, CosPaginationTable, CosLoading, CosToast, CosDoubleDatePicker } from '@/components/Common/index'
import { acquireSelectDataExtend, agencyCodeData, momentFormat } from '@/utils/commonDataInterface'
import { formlayout5 } from '@/utils/commonLayoutSetting'
import request from '@/utils/request';
import moment from 'moment';
import CosModal from '@/components/Common/CosModal'
import {
    FileAddOutlined,//新增
    CloudUploadOutlined,//上载
    CloseCircleOutlined,//删除
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SaveOutlined,//保存
    FormOutlined//编辑
} from '@ant-design/icons'
const { TabPane } = Tabs;
const confirm = Modal.confirm
const unconvertedRate = () => {
    const [queryForm] = Form.useForm();
    const [queryForms] = Form.useForm();
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [defaultKey, setDefaultKey] = useState('1')
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [company, setCompany] = useState([]); // 代理编码默认companyType and companyCode
    const [agencyCode, setAgencyCode] = useState([]);    // 代理编码
    const [loading, setLoading] = useState(false)
    const [objMessage,setObjMessage] = useState({})
    const [tableDatas, setTableDatas] = useState([])
    const [page, setPage] = useState({ pageSize: 20, current: 1 })
    const [tabTotal, setTabTotal] = useState(0)
    const [isModalVisible,setIsModalVisible] = useState(false)
    const [data,setData] = useState([])//导入数据
	const [messageData, setMessageData] = useState({});
    const [checked, setChecked] = useState([]); //勾选项
    const [title,setTitle] = useState('')
    const [checkUuid,setCheckUuid] = useState([])//表格选中的数据
    
    useEffect(() => {
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068', setAcquireData, $apiUrl);// 船东
        agencyCodeData($apiUrl, setAgencyCode, setCompany);     // 代理编码
    }, [])
    useEffect(() => {   // 默认值
        queryForm.setFieldsValue({
            search: {
                sapid: company.agencyCode,
                carrierCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue
            }
        })
    }, [company])
    const tabsChange = (key) => {
        setDefaultKey(key)
    }
    const setFormItem = () => {
        return defaultKey == 1 ? 'unColumn' : 'column'
    }
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'center',
            fixed: false,
            render: (text, record, index) => {
                return <div>
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}>
                        <a onClick={() => { deleteItem(record, index, '1') }}><CloseCircleOutlined style={{ color: 'red', fontSize: '15px' }} /></a>&nbsp;
                    </Tooltip>&nbsp;
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}>
                        <a onClick={() => { editItem(text, record, index) }}><FormOutlined /></a>&nbsp;
                    </Tooltip>&nbsp;
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.BL_COMPANY_CDE' />,//货流所属船东
            dataIndex: 'billCompanyCode',
            align: 'left',
            width: 100,
        }, {
            title: <FormattedMessage id='lbl.POR_OFFICE_CDE' />,//装货地
            dataIndex: 'porOfficeCode',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.FND_OFFICE_CDE' />,//卸货地
            dataIndex: 'fndOfficeCode',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.carrier' />,//Carrier(船东)
            dataIndex: 'carrierCode',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.cargo-trade-code' />,//Cargo Trade Lane Code
            dataIndex: 'cargoTradeLaneCode',
            align: 'left',
            width: 130,
        }, {
            title: <FormattedMessage id='lbl.Charge-CODE' />,//Charge Code
            dataIndex: 'chargeCode',
            align: 'left',
            width: 80,
        }, {
            title: <FormattedMessage id='lbl.office-code' />,//Office Code
            dataIndex: 'officeCode',
            align: 'left',
            width: 80,
        }, {
            title: <FormattedMessage id='lbl.CUST_SAP_ID' />,//SAPID
            dataIndex: 'sapid',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.return-the-proportion' />,//返还比例
            dataIndex: 'refundRate',
            align: 'left',
            width: 60,
        }, {
            title: <FormattedMessage id='lbl.afcm-0051'/>,//IB/OB
            dataIndex: 'outBoundInboundIndicator',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.Agreement-currency' />,//协议币种
            dataIndex: 'rateCurrencyCode',
            align: 'left',
            width: 60,
        }, {
            title: <FormattedMessage id='lbl.afcm-0052'/>,//DOC Rate
            dataIndex: 'documentRate',
            align: 'left',
            width: 60,
        }, {
            title: <FormattedMessage id='lbl.effective-start-date' />,//有效开始日期
            dataIndex: 'fromDate',
            align: 'left',
            width: 90,
        }, {
            title: <FormattedMessage id='lbl.effective-end-date' />,//有效结束日期
            dataIndex: 'toDate',
            align: 'left',
            width: 90,
        }, {
            title: <FormattedMessage id='lbl.Bill-of-lading' />,//提单
            dataIndex: 'basisBill',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.Container-capacity' />,//箱量
            dataIndex: 'basisUnit',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.TEU' />,//TEU
            dataIndex: 'basisTeu',
            align: 'left',
            width: 50,
        }, {
            title: <FormattedMessage id='lbl.BASIS_20_CNTR_GROUP' />,//20尺组
            dataIndex: 'basis20ContainerGroup',
            align: 'left',
            width: 60,
        }, {
            title: <FormattedMessage id='lbl.BASIS_40_CNTR_GROUP' />,//40尺组
            dataIndex: 'basis40ContainerGroup',
            align: 'left',
            width: 60,
        }, {
            title: <FormattedMessage id='lbl.SOC_IND' />,//SOC自主箱
            dataIndex: 'socIndicator',
            align: 'left',
            width: 80,
        }, {
            title: <FormattedMessage id='lbl.CNTR_TYPE_CDE' />,//箱型尺寸类型
            dataIndex: 'containerTypeCode',
            align: 'left',
            width: 90,
        }, {
            title: <FormattedMessage id='lbl.DG_IND' />,//危险品标识
            dataIndex: 'dgIndicator',
            align: 'left',
            width: 90,
        }, {
            title: <FormattedMessage id='lbl.Update-users' />,//更新用户
            dataIndex: 'recordUpdateUser',
            align: 'left',
            width: 60,
        }, {
            title: <FormattedMessage id='lbl.update-date' />,//更新时间
            dataIndex: 'recordUpdateDatetime',
            align: 'left',
            width: 60,
        },
    ]
    const pageChange = async(pagination, options) => {
        let search = queryForm.getFieldsValue().search
        setChecked([])
        setLoading(true)
        setObjMessage(null)
        let url = defaultKey==1 ? $apiUrl : $apiUrl
        const result =  await request($apiUrl.LOCAL_CHARGE_REPORT_SEARCH_LIST,{
            method:'POST',
            data:{
                'page':{
                    ...pagination
                },
                'params':{
                    ...search,
                    fromDate:search.fromDate?momentFormat(search.fromDate[0]):null,
                    toDate:search.fromDate?momentFormat(search.fromDate[1]):null,
                }
            }
        })
        console.log(result)
        if(result.success){
            setPage(pagination)
            let data = result.data
            console.log(data)
            setTableDatas(data.resultList)
            setTabTotal(data.totalCount)
            setLoading(false)
        }else{
            setLoading(false)
            setObjMessage({alertStatus: 'alert-error', message: result.errorMessage})
        }
    }
    const addItem = () => {//新增
        setLoading(false)
        setIsModalVisible(true);
        setTitle(<FormattedMessage id='btn.add' />);
    }
    const unSetSelectedRows = (row) => {

    }
    //表格多选
    const setSelectedRows = (row) => {
        setCheckUuid(row)
    }
    const deleteItem = (record, index,flag) => {//删除Item
        setObjMessage(null)
        console.log(record)
        let deteUuid 
        if(flag=='2'){
            checkUuid.length>=1?deteUuid = checkUuid.map((v,i)=>{
                return {uuid:v.uuid}
            }):''
        }else{
            deteUuid = [
                { uuid:record.uuid}
            ]
        }
        console.log(deteUuid)
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                confirmModal.destroy()
                setLoading(true)
                const result =  await request($apiUrl.LOCAL_CHARGE_REPORT_DELETE,{
                    method:'POST',
                    data:{
                        paramsList:deteUuid
                    }
                })
                if(result.success){
                    // setTableDatas(result.data)
                    // return 
                    pageChange(page)
                    setLoading(false)
                    setObjMessage({alertStatus: 'alert-success', message: result.message})
                    setCheckUuid([])
                }else{
                    setObjMessage({alertStatus: 'alert-error', message: result.errorMessage})
                }
            }
        })
    }
    //保存
    const save=async()=>{
        let query = queryForms.getFieldValue()
        setLoading(true)
        // console.log(query,query.search.fromDate)
        const result =  await request($apiUrl.LOCAL_CHARGE_REPORT_SAVE_OR_UPDATE,{
            method:'POST',
            data:{
                'params':{
                    ...query,
                    'fromDate':query.fromDate?momentFormat(query.fromDate[0]):'',
                    'toDate':query.fromDate?momentFormat(query.fromDate[1]):'',
                }
            }
        })
        if(result.success){
            pageChange(page,'','',result.message)
            handleCancel()
            setLoading(false)
        }else{
            setLoading(false)
            setMessageData({alertStatus: 'alert-error', message: result.errorMessage})
        }
    }
    const editItem = async(text, record, index) => {//编辑Item
        setMessageData({})
        setObjMessage({})
        setIsModalVisible(true);
        setTitle(<FormattedMessage id='lbl.edit' />)
        setLoading(true)
        const result =  await request($apiUrl.YET_LOCAL_CHARGE_REPORT_DETAIL,{
            method:'POST',
            data:{
                'uuid':record.uuid
            }
        })
        if(result.success){
            setLoading(false)
            let data = result.data
            console.log(data.fromDate,data.toDate)
            queryForms.setFieldsValue({
                ...data,
                fromDate:[moment(data.fromDate),moment(data.toDate)]
            })
        }else{
            setLoading(false)
            setMessageData({alertStatus: 'alert-error', message: result.errorMessage})
        }
        
     }
     const resetSearch = () => {
         queryForm.resetFields()
         setTableDatas([])
     }

     const handleOk = () => {
        // setMessageData({})
        setIsModalVisible(false);
        // queryForm.resetFields()
    };
    const handleCancel = () => {
        // Toast('', '', '', 5000, false);
        setIsModalVisible(false);
        queryForms.resetFields()
        setMessageData({})
    };
    const handlechang = () =>{
        const file = document.getElementById('file').files[0]
        console.log(document.getElementById('file').files)
        console.log(file)
        setData([file])
        const result = document.getElementById("result")
        let reader = new FileReader();
        reader.readAsBinaryString(file)
        console.log(reader.result)
        reader.onload=function(f){
        console.log(result)
        //   result.innerHTML=this.result
        }
        daor(file)
    }
    const daor = async(file)=>{//导入
        setObjMessage(null)
        console.log(data)
        if(file){
            let fd = new FormData()
            fd.append('file',file)
            fd.append('name',file.name)
            fd.append('type',file.type)
            setLoading(true)
            let reuls = await request($apiUrl.YET_LOCAL_CHARGE_REPORT_UPLOAD_CSO,{
                method:'POST',
                data:fd,
                requestType:'form',
            })
            console.log(reuls)
            if(reuls.success){
                setLoading(false)
                let data = reuls.data
                setTableDatas([...data])
                setTabTotal(data.totalCount)
                setData([])
            }else{
                setLoading(false)
                setObjMessage({alertStatus: 'alert-error', message: reuls.errorMessage})
            }
        }
    }
    return <div className='parent-box'>
        <CosToast toast={objMessage} style={{marginTop:'-20px'}}/>
        <div className='header-from'>
            <Form form={queryForm} name='func'>
                <Row>
                    {/* 船东 */}
                    <CosSelect name={['search', 'carrierCode']} span={6} label={<FormattedMessage id='lbl.carrier' />} options={acquireData.values} isSpan={false} />
                    {/*SAPID */}
                    <CosInputText name={['search', 'sapid']} label={<FormattedMessage id='lbl.sapid' />} span={6} capitalized={false} isSpan={false} />
                    {/*货流所属船东 */}
                    <CosInputText name={['search', 'billCompanyCode']} label={<FormattedMessage id='lbl.BL_COMPANY_CDE' />} span={6} capitalized={false} isSpan={false} />
                    {/*装货地 */}
                    <CosInputText name={['search', 'porOfficeCode']} label={<FormattedMessage id='lbl.POR_OFFICE_CDE' />} span={6} capitalized={false} isSpan={false} />
                    {/*装货地 */}
                    <CosInputText name={['search', 'fndOfficeCode']} label={<FormattedMessage id='lbl.FND_OFFICE_CDE' />} span={6} capitalized={false} isSpan={false} />
                    {/* 有效日期 */}
                    <CosDoubleDatePicker name={['search', 'fromDate']} label={<FormattedMessage id="lbl.valid-date" />} span={6} isSpan={false} />
                    {/* 有效结束日期 */}
                    {/* <CosDatePicker name={['search', 'TO_DTE']} label={<FormattedMessage id="lbl.effective-end-date" />} span={6} isSpan={false} /> */}
                </Row>
            </Form>
            {/* 查询条件 */}
            <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
        </div>
        <div className="main-button">
            <div className="button-left">
                {/* 新增 */}
                <CosButton onClick={() => { addItem() }}><FileAddOutlined /><FormattedMessage id='btn.add' /></CosButton>
                {/* 删除 */}
                <CosButton onClick={()=>{deleteItem(null,null,'2')}} disabled={checkUuid.length<1} ><CloseCircleOutlined /><FormattedMessage id='btn.delete' /></CosButton>
                {/* 导出 */}
                <CosButton><CloudDownloadOutlined /> <FormattedMessage id='btn.export' /></CosButton>
                {/* 导入 */}
                <Button  className='filebutton'><CloudUploadOutlined /><FormattedMessage id='btn.import' /> <input type="file" id="file"  onChange={() =>handlechang()}/></Button>
            </div>
            <div className="button-right">
                <CosButton onClick={() => {resetSearch()}}>< ReloadOutlined /> <FormattedMessage id='btn.reset' /></CosButton>
                <CosButton onClick={() => { pageChange(page) }}><SearchOutlined /><FormattedMessage id='btn.search' /></CosButton>
            </div>
        </div>
        <div className="footer-table budget-tracking">
            <Form form={queryForm} name='func'>
                <CosPaginationTable
                    dataSource={tableDatas}
                    columns={columns}
                    rowKey='uuid'
                    pageSize={page.pageSize}
                    current={page.current}
                    pageChange={pageChange}
                    scrollHeightMinus={200}
                    total={tabTotal}
                    // setSelectedRows={setSelectedRows}
                    rowSelection={{
                        selectedRowKeys:checked,
                        onChange:(key, row)=>{
                            setChecked(key);
                            setSelectedRows(row);
                        }
                    }}
                />
            </Form>
        </div>
        <CosLoading spinning={loading} />
        <CosModal cbsTitle={title} cbsVisible={isModalVisible} cbsFun={handleCancel} cbsWidth='70%'  height='100%'>
            {/* <CosToast toast={messageData} /> */}
             <div className='add-header'>
                    <Form 
                        form={queryForms}
                        name='func'
                    >
                       <Row>
                            {/* 货流所属船东 */}
                            <CosInputText  isSpan={true}  span={6} name='billCompanyCode'  label={<FormattedMessage id='lbl.BL_COMPANY_CDE'/>} />
                            {/* 装货地 */}
                            <CosInputText  isSpan={true}  name='porOfficeCode' label={<FormattedMessage id='lbl.POR_OFFICE_CDE'/>}   span={6} />
                            {/* 卸货地 */}
                            <CosInputText  isSpan={true}  name='fndOfficeCode' label={<FormattedMessage id='lbl.FND_OFFICE_CDE'/>}   span={6} />
                            {/* Carrier(船东) */}
                            <CosSelect  isSpan={true} options={acquireData.values} name='carrierCode' label={<FormattedMessage id='lbl.carrier'/>}   span={6} />
                            {/* cargo trade code */}
                            <CosInputText  isSpan={true}  name='cargoTradeLaneCode' label={<FormattedMessage id='lbl.cargo-trade-code'/>}   span={6} />
                            {/* Charge code */}
                            <CosInputText  isSpan={true}  name='chargeCode' label={<FormattedMessage id='lbl.Charge-CODE'/>}   span={6} />
                            {/* Office Code */}
                            <CosInputText  isSpan={true}  name='officeCode' label={<FormattedMessage id='lbl.office-code'/>}   span={6} />
                            {/* SAPID */}
                            <CosInputText  isSpan={true}  name='sapid' label={<FormattedMessage id='lbl.sapid'/>}   span={6} />
                            {/* 返还比例 */}
                            <CosInputText  isSpan={true}  name='refundRate' label={<FormattedMessage id='lbl.return-the-proportion'/>}   span={6} />
                            {/* IB/OB */}
                            <CosInputText  isSpan={true}  name='outBoundInboundIndicator' label={<FormattedMessage id='lbl.afcm-0051'/>}   span={6} />
                            {/* 协议币种 */}
                            <CosInputText  isSpan={true}  name='rateCurrencyCode' label={<FormattedMessage id='lbl.Agreement-currency'/>}   span={6} />
                            {/* DOC Rate */}
                            <CosInputText  isSpan={true}  name='documentRate' label={<FormattedMessage id='lbl.afcm-0052'/>}   span={6} />
                            {/* 有效日期 */}
                            <CosDoubleDatePicker isSpan={true}  name={'fromDate'} label={<FormattedMessage id="lbl.valid-date" />} span={6} />
                            {/* 提单 */}
                            <CosInputText  isSpan={true}  name='basisBill' label={<FormattedMessage id='lbl.Bill-of-lading'/>}   span={6} />
                            {/* 箱量 */}
                            <CosInputText  isSpan={true}  name='basisUnit' label={<FormattedMessage id='lbl.Container-capacity'/>}   span={6} />
                            {/* TEU */}
                            <CosInputText  isSpan={true}  name='basisTeu' label={<FormattedMessage id='lbl.TEU'/>}   span={6} />
                            {/* 20尺组 */}
                            <CosInputText  isSpan={true}  name='basis20ContainerGroup' label={<FormattedMessage id='lbl.BASIS_20_CNTR_GROUP'/>}   span={6} />
                            {/* 40尺组 */}
                            <CosInputText  isSpan={true}  name='basis40ContainerGroup' label={<FormattedMessage id='lbl.BASIS_40_CNTR_GROUP'/>}   span={6} />
                            {/* SOC自主箱 */}
                            <CosInputText  isSpan={true}  name='socIndicator' label={<FormattedMessage id='lbl.SOC_IND'/>}   span={6} />
                            {/* 箱型尺寸类型 */}
                            <CosInputText  isSpan={true}  name='containerTypeCode' label={<FormattedMessage id='lbl.CNTR_TYPE_CDE'/>}   span={6} />
                            {/* 危险标识 */}
                            <CosInputText  isSpan={true}  name='dgIndicator' label={<FormattedMessage id='lbl.DG_IND'/>}   span={6} />
                        </Row>
                   </Form> 
                    <div className="add-main-button" style={{float:'right'}}>
                        {/* 保存按钮 */}
                        <Button onClick={save}  ><SaveOutlined /><FormattedMessage id='btn.save'/></Button>
                    </div>
                </div>
            </CosModal>
        
    </div>
}
export default unconvertedRate