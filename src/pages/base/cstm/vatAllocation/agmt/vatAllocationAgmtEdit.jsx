import React, { useState,useEffect,$apiUrl,useContext} from 'react'
import {FormattedMessage} from 'umi'
import { Form,Modal, Button ,Row,Table, Input, Select,Tooltip,InputNumber } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireCompanyData,acquireSelectData,momentFormat } from '@/utils/commonDataInterface';
import moment from 'moment';
import request from '@/utils/request';
import Selects from '@/components/Common/Select'
import SelectVal from '@/components/Common/Select';
import InputText from '@/components/Common/InputText'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import {
    PlusOutlined,//新增item
    FormOutlined,//编辑
    CloseCircleOutlined,//删除
    SaveOutlined,//保存
    FileProtectOutlined,//保存并提交审核
    ImportOutlined,//协议退回
} from '@ant-design/icons'

//------------ ---新增+保存 弹框--- ----------------
const confirm = Modal.confirm
const AddModifcation =(params)=> {
//-------------------------------------新增保存--------------------------------------
    const [acquireData, setAcquireData] = useState([]); // 船东
    const [companysData, setCompanysData] = useState([]);   // 公司
    const [agreementType,setAgreementType] = useState([]);    //协议类型
    const [outBoundInboundIndicator,setOutBoundInboundIndicator] = useState ([]) //进出口标志
    const [lastCondition, setLastCondition] = useState({
        "shipownerCompanyCode": null,
        "companyCode": null,
        "agencyCode": null,
        "agreementType": null,
        "commissionAgreementCode":null,
        // "Date": null,
    });
    const [dataSource,setDataSource]=useState([])//新增表格数据
    const [formDatas,setFromDatas] = useState([])
    const {
        isModalVisible,
        setIsModalVisible,
    } = params.addData
    //初始化下拉框数据
    useEffect( () => {
        acquireSelectData('CB0068',setAcquireData, $apiUrl);// 船东
        acquireCompanyData(setCompanysData, $apiUrl);// 公司
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.INOUTBOUND', setOutBoundInboundIndicator, $apiUrl);// 协议类型
    } , [] )

    //新增表格文本
    const columns = [
        {
            title: <FormattedMessage id="lbl.operate" />,
            dataIndex: 'operate',
            sorter: false,
            width: '80px',
            fixed: true,
            align:'center',
            render:(text,record,index) => {
                return <div className='operation'>
                    {/* 删除 */}
                        <Tooltip  title={<FormattedMessage id='btn.delete' />}><a ><CloseCircleOutlined  /></a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a ><FormOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司代码
            dataIndex: 'commissionAgreementCode',
            key:'COMM_AGMT_CDE',
            sorter: true,
            // sortDirections:[store],
            align:'center',
            width: '120px',
        },
        {
            title:<FormattedMessage id="lbl.agency" />,//代理编码
            dataIndex: 'companyCode',
            key:'COMPANY_CDE',
            sorter: true,
            align:'center',
            width: '100px',
            
        },
        {
            title:<FormattedMessage id="lbl.office" />,//OFFICE
            dataIndex: 'commpanyNameAbbr',
            sorter: true,
            key:'COMPANY_NME_ABBR',
            width: '120px',
            align:'center',
            
        },
        {
            title: <FormattedMessage id="lbl.Tax-types" />,//税率类型
            dataIndex: 'agencyCode',
            sorter: true,
            key:'AGENCY_CDE',
            width: '120px',
            align:'center',
            
        },
        {
            title: <FormattedMessage id="lbl.start-date" />,//开始日期
            dataIndex: 'agreementStatus',
            sorter: true,
            key:'AGMT_STATUS',
            width: '80px',
            align:'center', 
        },
        {
            title: <FormattedMessage id="lbl.over-date" />,//结束日期
            dataIndex: 'fromDate',
            sorter: true,
            key:'FM_DTE',
            width: '120px',
            align:'center', 
        },
        {
            title:<FormattedMessage id="lbl.value-added-tax-rate" /> ,//增值税税率
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: '120px',
            align:'center', 
        },
        {
            title:<FormattedMessage id="lbl.servicing-time" /> ,//维护时间
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: '120px',
            align:'center', 
        },
        {
            title:<FormattedMessage id="lbl.maintenance-man" /> ,//维护人
            dataIndex: 'toDate',
            sorter: true,
            key:'TO_DTE',
            width: '120px',
            align:'center', 
        }
    ]

    //保存
    const [queryForm] = Form.useForm();
    const handleQuery = async (operate) => {
    }

    
   
    //删除item项
    const deleteItem = async(record,index) => {
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: '删除',
            content: '是否确认删除',
            okText: '确定',
            okType: 'danger',
            closable:true,
            cancelText:'',
            onOk() {
                confirmModal.destroy()     
            }
        })

        console.log(1)
        console.log(record)
        if(flag){
            
        }
        
    } 
      //关闭弹框
    const handleCancel = () =>{
        setIsModalVisible(false)
       
    }

    return (
            <Modal title="新建" visible={isModalVisible} maskClosable={false}  onCancel={handleCancel} width='70%' height='100%' >
                <div className='add'>
                    <div className='add-header-from-searchGroup'>
                        <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 公司 */}
                                <SelectVal span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.company'/>}  />
                                {/* 代理编码 */}
                                <SelectVal span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.agency'/>}  />
                                {/* OFFICE */}
                                <Selects name='companyCode' label={<FormattedMessage id='lbl.office'/>}   span={6} />
                                {/* 税率类型 */}
                                <InputText name='agencyCode' label={<FormattedMessage id='lbl.Tax-types'/>}   span={6}/>  
                                {/* 开始日期 */}
                                <Selects name='agreementType' label={<FormattedMessage id='lbl.start-date'/>}   span={6} />
                                {/* 结束日期 */}
                                <InputText name='commissionAgreementCode' label={<FormattedMessage id='lbl.over-date'/>}  span={6} />
                                {/* 增值税税率 */}
                                <InputText name='commissionAgreementCode' label={<FormattedMessage id='lbl.value-added-tax-rate'/>}  span={6} />
                               
                            </Row>
                        </Form> 
                    </div> 
                    <div className='add-main-button'>
                        {/* 保存按钮 */}
                        <Button onClick={()=> handleQuery('SAVE')} ><SaveOutlined /> <FormattedMessage id='btn.save'/></Button>
                    </div>
                    
                    <div className='add-footer-table'>
                        <div className='add-footer-table-button'>
                            {/* 新增item项   */}
                            <Button onClick={()=>handleTable()}  ><PlusOutlined /> </Button>
                        </div>
                            <PaginationTable
                                dataSource={dataSource}
                                columns={columns}
                                rowKey='lcrAgreementHeadUuid'
                                rowSelection={null}
                                scrollHeightMinus={200}
                                // setSelectedRows={setSelectedRows}
                            />
                    </div>
                </div>
            </Modal>
    )
}
export default AddModifcation