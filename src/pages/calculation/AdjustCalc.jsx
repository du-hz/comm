import React,{useState, useEffect, $apiUrl} from 'react';
import { Form, Button, Row,Col, Tabs, Modal,Tooltip,InputNumber,Upload  } from 'antd'
import {FormattedMessage, useIntl,connect} from 'umi'
import {CosDatePicker, CosInputText, CosSelect, CosButton, CosToast, CosLoading, CosRadio} from '@/components/Common/index'
import request from '@/utils/request';
import {Toast} from '@/utils/Toast'
import {formLabel} from '@/utils/commonLayoutSetting'
import { acquireCompanyData, trackingAgencyList, momentFormat,acquireSelectData,acquireSelectDataExtend } from '@/utils/commonDataInterface';
import CalcuationEdit from './calculation_edits';
import moment from 'moment';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import Loading from '@/components/Common/Loading'
import CosModal from '@/components/Common/CosModal'
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    FileAddOutlined,//新增预算
    FileSearchOutlined,
    DownOutlined,
    UpOutlined,
    SaveOutlined,//保存
    CloseCircleOutlined, //删除
    CloudUploadOutlined, //上载
    SelectOutlined,//选择
    UploadOutlined,//上传
    createFromIconfontCN,
    ConsoleSqlOutlined,
} from '@ant-design/icons'
const formlayout2 = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  const confirm = Modal.confirm
const AdJustCalc = (props) => {
    const intl = useIntl();
    const [queryForm] = Form.useForm();
    const {
        title,
        adSPVisible,
        setAdSPVisible,
        record,//数据详情
        page,
        setLoading,
        companysData,//公司
        pageChange,//在弹框中执行父级查询
        prepareData,//测算模块算法调整模式
    } = props.adJustData
    const adType = props.adType=='adJust'
    const [headerData,setHeaderData] = useState({})
    const [calcType,setCalcType] = useState({})  //测算类型
    const [toast,setToast] = useState({})
    const [timeFlag,seTtimeFlag] = useState(false)
    const [chooseRadio,setChooseRadio] = useState("")  //选择的数据准备
    const [calcModal, setCalcModal] = useState(false);//上载弹框开关
    const [spinflag,setSpinflag] = useState(false)
    const [data,setData] = useState({})
    const [messageData,setMessageData] = useState({})
    // const [agentCompany,setAgentCompany] = useState([]) //代理公司
    useEffect(()=>{
        acquireSelectData('BANLIE.SVC.HRCHY.TYPES',setCalcType, $apiUrl);// 测算类型
        if(adType){
            seTtimeFlag(true)
            console.log(record)
            let companys = []
            if(record.effectCompanies!=null){
                record.effectCompanies.map((v,i)=>{
                    companys.push(v.effectCompanyCode )
                })
            }
            console.log(companys)
            record.prepareType = String(record.prepareType)
            let prepareStartDate = ''
            let prepareEndDate = ''
            if(record.prepareStartDate==null || record.prepareEndDate==null){
                prepareStartDate = null
                prepareEndDate = null
            }else{
                prepareStartDate = moment(record.prepareStartDate)
                prepareEndDate = moment(record.prepareEndDate)
            }
            queryForm.setFieldsValue({
                calc:{
                    ...record,
                    calcDate:[prepareStartDate,prepareEndDate],
                    effectCompanyCode: companys
                }
            })
        }else{
            setChooseRadio("")
            seTtimeFlag(false)
            queryForm.resetFields()
        }
    },[adSPVisible])
    const handleCancel = () => {
        setToast(null)
        seTtimeFlag(false)
        setAdSPVisible(false)
    }
    const headerSubmit = async(url,message) => {//提交头信息
        setToast(null)
        setLoading(true)
        const result=await request(url,{
            method:"POST",
            data:{
                uuid: record.prepareId
            }
        })
        if(result.success){
            setLoading(false)
            if(message){
                setToast({alertStatus:'alert-success',message:intl.formatMessage({id:'lbl.calculation.inPLater'})})
                return
            }
            setToast({alertStatus:'alert-success',message:result.message||intl.formatMessage({id:'lbl.operate-success'})})
            pageChange(page)
        }else{
            setToast({alertStatus:'alert-error',message:result.errorMessage})
            setLoading(false)
        }
    }
    {/* 保存 */}
    const headerSave = async() => { //保存修改
        const params = queryForm.getFieldsValue().calc
		setToast(null)
		setLoading(true)
		let url = $apiUrl.PRECALC_CREATE_POST
        if(params.effectCompanyCode!=null){
            var companys = params.effectCompanyCode.map((item,index)=>{
                console.log(item)
                return {effectCompanyCode: item, }
            })
            console.log(companys)
            // setAgentCompany(companys)
        }
        if(chooseRadio=='2'){
            if(!params.prepareName  || !params.hierarchyType || !params.prepareType){
                setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.calculation-upload-save'})});
                setLoading(false)
                return
            }
        }else{
            if(!params.prepareName || !params.hierarchyType || !params.prepareType || !params.calcDate){
                setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.calculation-save'})});
                setLoading(false)
                return
            }
        }

        const result = await request(url,       
            {
                method:'POST',
                data: {
                    params: {
						// ...params,
                        prepareName: params.prepareName,
                        hierarchyType: params.hierarchyType,
                        prepareType: params.prepareType,
                        effectAllData: params.effectAllData,
                        prepareStartDate: params.calcDate?momentFormat(params.calcDate[0]):undefined,
                        prepareEndDate: params.calcDate?momentFormat(params.calcDate[1]):undefined,
                        // effectCompanyCode:params.effectCompanyCode&&params.effectCompanyCode.split('-')[0],
                        effectCompanies:  companys
					},
                }
            }
        )
        if(result.success) {
			setHeaderData(result.data)
            setLoading(false)
            // setAdSPVisible(false)
            pageChange(page)
            setToast({alertStatus:'alert-success',message:result.message||intl.formatMessage({id:'lbl.operate-success'})})
        }else{
            setToast({alertStatus:'alert-error',message:result.errorMessage})
            setLoading(false)
        }
    }
    const deleteSubmit = async(url) => {//放弃头信息
        setToast(null)
        const confirmModal = confirm({
            title: intl.formatMessage({id: 'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Are-you-delete'}),
            okText: intl.formatMessage({id: 'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setLoading(true)
                confirmModal.destroy()
                let result = await request(url,{
                        method:'POST',
                        data: {
                            uuid: record.prepareId
                        }
                    })
                if(result.success) {
                    const wpage = window.page
                    const wOptions = window.options
                    pageChange(page)
                    setAdSPVisible(false)
                    // setToast({alertStatus:'alert-success',message:result.message||intl.formatMessage({id:'lbl.operate-success'})})
                    Toast('',result.message, 'alert-success', 5000, false)
                } else {
                    setToast({alertStatus:'alert-error',message:result.errorMessage})
                    setLoading(false)
                }
            }
        })
    }
    const radioClick = (e) => {//单选框是否选中
        const event = e.target.value
        const search = queryForm.getFieldsValue().calc
        setChooseRadio(event)
        console.log(event)
        if(event=='2'){
            seTtimeFlag(true)
        }else{
            seTtimeFlag(false)
        }
        if(search&&search.effectAllData){
            queryForm.setFieldsValue({
                calc:{
                    effectAllData:undefined
                }
            })
            return
        }
        queryForm.setFieldsValue({
            calc:{
                effectAllData:event
            }
        })
    }
    {/* 数据准备完成 */}
    const readySubmit = async(url,message) => {//提交头信息
        setMessageData({})
        setToast(null)
        const params = queryForm.getFieldsValue().calc
        let uploadData = new FormData()
        uploadData.append('uuid',record.prepareId)
        uploadData.append('file',data)
        if(params.effectAllData=='2'){
            setCalcModal(true)
        }else{
            setLoading(true)
            const result=await request(url,{
                method:"POST",
                data: uploadData,
                requestType:'application/form-data',
            })
            if(result.success){
                setLoading(false)
                if(message){
                    setToast({alertStatus:'alert-success',message:intl.formatMessage({id:'lbl.calculation.inPLater'})})
                    return
                }
                setToast({alertStatus:'alert-success',message:result.message||intl.formatMessage({id:'lbl.operate-success'})})
                pageChange(page)
            }else{
                setToast({alertStatus:'alert-error',message:result.errorMessage})
                setLoading(false)
            }
        }
    }
    const cancelBtn = ()=>{
        setCalcModal(false)
    }
    {/* 选择 */}
    const changeBtn = ()=>{
        setMessageData({})
        const file = document.getElementById('file').files[0]
        if(file){
            setData(file)
            // const result = document.getElementById("result")
            let reader = new FileReader();
            reader.readAsBinaryString(file)
            reader.onload=function(){
            }
            console.log(file)
        }
    }
    {/* 上传 */}
    const uploadbuton = async()=>{
        setMessageData({})
        let uploadData = new FormData()
        uploadData.append('uuid',record.prepareId)
        uploadData.append('file',data)
        console.log(uploadData)
        let result = await request($apiUrl.PRECALC_SUBMITPREDATA,{
            method:'POST',
            data: uploadData,
            requestType:'application/form-data',
        })
      if(result.success){
        setData([])
        result.message?setMessageData({alertStatus:'alert-success',message:result.message}):null
      }else{
        setData([])
        result.errorMessage?setMessageData({alertStatus:'alert-error',message:result.errorMessage}):null
      }
    }
    const cancel = ()=>{
        setToast(null)
        setMessageData({})
        setData([])
        setCalcModal(false)
    }
    {/* 下载 */}
    const downlod = async()=>{
        setMessageData({})
        const result = await request($apiUrl.PRECALC_CALC_DONWLOAD,{
            method:"POST",
            data:{
                excelFileName: 'uploadPrepareData.xls', //文件名
            },
            responseType: 'blob',
        })
        console.log(result)
        if(result.type=="application/json" || result.size==0){  
            Toast('', intl.formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            let blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, uploadPrepareData)  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = 'uploadPrepareData'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    return <>
    {/* 参数调整弹窗 */}
        {/* <Modal title={title} visible={adSPVisible} footer={null} width={600} height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
        <CosModal cbsWidth={600} cbsVisible={adSPVisible} cbsTitle={title} cbsFun={() => handleCancel()}>
        	<CosToast toast={toast} />
            <div className='modalContent' style={{minWidth: '300px'}}>
                <Form form={queryForm}>
                    <Row>
                        {/* 测算名称 */}
                        <CosInputText name={['calc','prepareName']} disabled={adType} capitalized={false} label={<FormattedMessage id='lbl.calculation.name'/>} span={23} placeholder={intl.formatMessage({id:'lbl.calculation.name'})} isSpan={true} formlayouts={formlayout2} />
                        {/* 测算类型 */}
                        <CosSelect name={['calc','hierarchyType']} disabled={adType} label={<FormattedMessage id='lbl.calculation.type'/>} span={23} options={calcType.values} isSpan={true} placeholder={intl.formatMessage({id:'lbl.calculation.type'})} formlayouts={formlayout2} />
                        {/* 测算调整模式 */}
                        <CosSelect name={['calc','prepareType']} disabled={adType} label={<FormattedMessage id='lbl.calculation.model'/>} span={23} options={prepareData} isSpan={true} placeholder={intl.formatMessage({id:'lbl.calculation.model'})} formlayouts={formlayout2} />
                        {/* 数据准备 */}
                        <CosRadio  className='calc-radio' onClick={radioClick} isSpan={true}  name={['calc','effectAllData']} label={<FormattedMessage id="lbl.calculation.dataPreparation" />} span={23} options={[{value:1,label:intl.formatMessage({id: 'lbl.calculation-choose-radio'}),disabled:adType},{value:2,label:intl.formatMessage({id: 'lbl.calculation-upload-data'}),disabled:adType}]} />
                        {/* 测算数据开始时间 */}
                        {/* <CosDatePicker name={['calc','prepareStartDate']} disabled={adType} label={<FormattedMessage id="lbl.calculation.startTime" />} span={23} isSpan={true} formlayouts={formlayout2} /> */}
                        {/* 测算数据结束时间 */}
                        {/* <CosDatePicker name={['calc','prepareEndDate']} disabled={adType} label={<FormattedMessage id="lbl.calculation.endTime" />} span={23} isSpan={true} formlayouts={formlayout2} /> */}
                        <DoubleDatePicker flag={false} disabled={adType} name={['calc','calcDate']} label={<FormattedMessage id='lbl.calculation.time'/>} span={23} isSpan={true} formlayouts={formlayout2}  disabled={timeFlag} /> 
                        {/* 代理公司 */}
                        <CosSelect showSearch={true} name={['calc','effectCompanyCode']} disabled={adType} mode="multiple" label={<FormattedMessage id='lbl.budgetTracking.companyCode'/>} span={23} options={companysData} isSpan={true} placeholder={intl.formatMessage({id:'lbl.budgetTracking.companyCode'})} formlayouts={formlayout2}/>
                    </Row>
                </Form>
                <Row>
                    {props.adType=='adJust'?<Col offset={3} className='more-btn'> {/*算法调整*/}
                        {/* 算法准备完成 */}
                        <CosButton  onClick={() => headerSubmit($apiUrl.PRECALC_LOGIC_FINSH)} icon={<FileAddOutlined />}><FormattedMessage id='lbl.calculation.agReady'/></CosButton>
                        {/* 逻辑准备完成 */}
                        <CosButton onClick={() => headerSubmit($apiUrl.PRECALC_SUBMITALGO)} icon={<FileAddOutlined />}><FormattedMessage id='lbl.calculation.logic'/></CosButton>
                        {/* 数据准备完成 */}
                        <CosButton onClick={ () => readySubmit($apiUrl.PRECALC_SUBMITPREDATA) } icon={<FileAddOutlined />}><FormattedMessage id='lbl.calculation.dataReady'/></CosButton>
                        {/* 开始测算 */}
                        <CosButton onClick={() => headerSubmit($apiUrl.PRECALC_STARTPRECALC,'lbl.calculation.inPLater')} icon={<SearchOutlined />}><FormattedMessage id='lbl.calculation.startCalc'/></CosButton>
                        {/* 放弃 */}
                        <CosButton onClick={() => deleteSubmit($apiUrl.PRECALC_DELETE)} icon={<CloseCircleOutlined />}><FormattedMessage id='lbl.calculation.giveUp' /></CosButton>
                    </Col>:
                    <Col offset={10} className='more-btn'>{/*新增*/}
                        {/* 保存修改 */}
                        <CosButton onClick={() => headerSave()} icon={<FileAddOutlined />}><FormattedMessage id='btn.calculation.add' /></CosButton>
                    </Col>}
                </Row>
            </div>
        </CosModal>
        {/* <Modal title={<FormattedMessage id='lbl.upload' />} maskClosable={false}  visible={calcModal} footer={null} width="28%" onCancel={() => cancelBtn()}> */}
        <CosModal cbsWidth={400} cbsVisible={calcModal} cbsTitle={<FormattedMessage id='lbl.upload' />} cbsFun={() => cancelBtn()}> 
            <CosToast toast={messageData}/>
            <div className='uploadRate-button' style={{marginLeft:'10px',minWidth: '300px'}}>
                <div className='uploadRate-button-left'>
                    <div className='uploadRate-button-left-top'>
                        {/* 选择 */}
                        <Button className='filebutton'><SelectOutlined /> <input type="file" id="file"  onChange={() =>changeBtn()}/> <FormattedMessage id='lbl.select' /></Button>
                        {/* 上传 */}
                        <Button onClick={uploadbuton}><UploadOutlined /><FormattedMessage id='lbl.upload' /></Button>
                        {/* 取消 */}
                        <Button onClick={cancel}><ReloadOutlined type="icon-quxiao" /><FormattedMessage id='lbl.cancel' /></Button>
                    </div>
                    <div className='uploadRate-button-left-bottom'>
                        {data.name}
                    </div>
                </div>
                <div>
                    {/* 下载上载模板 */}
                    <Button onClick={downlod}><CloudDownloadOutlined/><FormattedMessage id='lbl.download' /></Button>
                </div>
               
            </div>
            <Loading spinning={spinflag}/>
        </CosModal>
    </>
}
export default AdJustCalc