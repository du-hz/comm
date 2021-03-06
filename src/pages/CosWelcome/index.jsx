import React, {useEffect,useState} from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Typography, Alert, Form, Button, Row, Modal,Spin,Input, Table} from 'antd';
import styles from '../Welcome.less';
import {FormattedMessage,formatMessage,useIntl} from "umi";
import {momentFormat} from '@/utils/commonDataInterface';
import moment from 'moment'
import Select from '@/components/Common/Select';
import InputText from '@/components/Common/InputText';
import DatePicker from '@/components/Common/DatePicker';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker';
import PaginationTable from '@/components/Common/PaginationTable'
import InputArea from '@/components/Common/InputArea'
import {CosLoading} from '@/components/Common/index'
// import PcmPaginationTable from '@/components/Common/CosPaginationTable'
import {CosSelectSearch,CosToast,CosUpload} from '@/components/Common/index'
import {Toast} from '@/utils/Toast'
import check from '@/components/Authorized/CheckPermissions';
import CosButton from '@/components/Common/CosButton'
import { CossPaginationTable } from '@/components/Common/index'
import CosModal from '@/components/Common/CosModal'

// import CosModal from '@/components/Common/CosModal'
const confirm = Modal.confirm
const CodePreview = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);
const PcmWelcome = () => {
  const formRef = React.createRef()
  const [one,setOne] = useState({
    // quan:143432,
    // du:moment('2020-02-02 00:00:00'),
    // hongStart:moment('2020-02-02'),
    // hongEnd:moment('2020-02-03')
  })
  const [statusLoad,setStatusLoad] = useState(false)
  const [checked,setChecked] = useState([])
  let [selectList,setSelectList] = useState([])
  const [isModalVisiblePortBounced,setisModalVisiblePortBounced] = useState(false)
    const [focusFlag,setfocusFlag] = useState(true);//13
    const handleDelete = (index) => {
    
  }
  
  
  const columns=[
    {
      title:'??????',
      width:'15%',
      render:(text,record,index) => {
        return <a onClick={() => formRef.current.submit()}>??????</a>//handleDelete(index)
      }
    },
    {
      title: 'value',
      dataIndex: 'value',
      render: text => {
        return <InputText name='one' placeholder='one' required={false} span={24}/>
      },
      width: 350,
    },
    {
      title: 'label',
      dataIndex: 'label',
      // render: text => <a>{text}</a>,
      width: 350,
    },
    {
      title: 'sapCustomerCode',
      dataIndex: 'sapCustomerCode',
      // render: text => <a>{text}</a>,
      width: 350,
    },
  ]
  const columnss = [
    { 
      title: '?????????????????????',
      dataIndex: 'customerName',
      sorter: false,
      fixed: true,
      // width: '10%'
    },{
      title: <FormattedMessage id='lbl.carrier' />,//??????
      // dataType: acquireData.values,
      dataIndex: 'shipownerCompanyCode',
      align: 'left',
      sorter: true,
      key: 'SO_COMPANY_CDE',
      // width: '2%'
  }, {
      title: <FormattedMessage id="lbl.company" />,//??????
      dataIndex: 'companyCode',
      align: 'left',
      sorter: true,
      key: 'COMPANY_CDE',
      width: '15%'
  }, {
      title: <FormattedMessage id="lbl.agency" />,//????????????
      dataIndex: 'agencyCode',
      align: 'left',
      sorter: true,
      key: 'AGENCY_CDE',
      width: 120
  }, {
      title: <FormattedMessage id="lbl.company-abbreviation" />,//????????????
      dataIndex: 'commpanyNameAbbr',
      sorter: true,
      key: 'COMPANY_NME_ABBR',
      width: 120
  }, {
      title: <FormattedMessage id="lbl.ProtocolState" />,//????????????
      dataIndex: 'status',
      align: 'left',
      sorter: true,
      key: 'STATUS',
      width: 120,
  },
  ]
  const [queryForm] = Form.useForm();
  
  const handleQuery = () => {
      // selectList.push({label:'??????',value:'1',sapCustomerCode:'123',content:'r43423'})
      // selectList.push({label:'?????????',value:'3',sapCustomerCode:'1234',content:'r43423'})
      // selectList.push({label:'?????????',value:'2',sapCustomerCode:'12345',content:'r43423'})
      selectList=[{label:<FormattedMessage id="menu.welcome" />,value:'2',sapCustomerCode:'12345',content:<FormattedMessage id="menu.welcome" />}]
      setSelectList([...selectList])
      checked.push('1234')
      setChecked([...checked])
    // console.log(
    //   queryForm.getFieldValue()
    // )
  }
  useEffect(() => {
    // queryForm.setFieldsValue(one)
    // document.onkeydown=(ev) =>{
    // ?????????var ev=ev||window.event
    // ?????????console.log(ev.keyCode)
    //     if(ev.keyCode==13){
    //       setivisiblePortBounced(true)
    //     }
        
    //   }
  },[isModalVisiblePortBounced])
  const portBouncedHandleCancel = () => {
    setisModalVisiblePortBounced(false)
  }
  const handleclick = () => {
    setStatusLoad(true)
    setTimeout(() =>{
      setStatusLoad(false)
    },1000)
    // let data = selectList.map((item,idx) => {
    //   return item.sapCustomerCode
    // })
    // setChecked([...data])
    console.log(queryForm.getFieldsValue())
    return
    selectList.push({label:'666',value:'3',sapCustomerCode:'45435'})
    setSelectList([...selectList])
    console.log(selectList)
    // queryForm.setFieldsValue(one)
  }
  const setSelectedRows = (val) => {
    console.log(val)
  } 
  const setSelectedRowsKey = (val) => {
    console.log(val)
    setChecked([val])
  }
  const selectChange = (value,option) => {
    queryForm.setFieldsValue({
      quan:option.linkage.sapCustomerCode
    })
  }
  const handlePageChange = (pagination) => {
    console.log(pagination)
    setSelectList([{label:'666',value:'3',sapCustomerCode:'45435'}])
  }
  const handleFrom = () => {
    
    const confirmModal = confirm({
      title: '??????',
      content: '??????????????????????????????',
      okText: '??????',
      okType: 'danger',
      closable:true,
      cancelText:'',
      onOk() {
        confirmModal.destroy()
        console.log(
          formRef.current.getFieldValue()
        )
      }
    })
  }
  const getCheckboxProps = (record) => {
    // return record.value === '1'||record.value === '2' // Column configuration not to be checked
    // name: record.label,
  } 
  const finalColumns = [];
  for (let i = 0; i < columnss.length; i += 1) {
    finalColumns.push({
      ellipsis: true,
      ...columnss[i],
    })
  }
  return (<><Card title={<FormattedMessage id="menu.welcome" />}>
    <Modal title={<FormattedMessage id='lbl.Port-query' />} style={{position:'relative'}} visible={false} width={600} onCancel={() => portBouncedHandleCancel()}>
      <Spin spinning={false} style={{
      position: 'absolute',
      width: '80px',
      top: '50%',
      left: '50%',
      transform: 'translate(50%,50%)',
      zIndex: '999',
      fontSize: '34px'
      }} ></Spin>
      <Table columns={finalColumns} dataSource={selectList} />
    </Modal>
    <CosLoading spinning={statusLoad} label={<FormattedMessage id="menu.welcome" />}/>
      <CosToast alertStatus='alert-success' toast={{message:'222'}}/>
      <CosToast alertStatus='alert-warning' toast={{message:['1323','456']}}/>
      {/* <CosToast alertStatus='alert-error' message={'?????????????????????????????????????????????????????????43'}/> */}
      <Form layout='horizontal' form={queryForm} name='func' onFinish={handleQuery}>
        <Row>
          <Select
            name='teng'
            selectChange={selectChange}
            label='teng'
            placeholder='teng'
            disabled
            required={false}
            options={selectList}
            
            // linkage='quan,sapCustomerCode'
            // queryForm={queryForm}
            span={6}/> 
          <InputText name='quan' label='quan' placeholder='quan' required={false} span={6}/>
          <Select name='zheng' label='zheng' placeholder='zheng' disabled={false} options={selectList} span={6}/>
          <DatePicker name='du' label='du' placeholder='du' showTime={false} required={false} span={6} />
          <DoubleDatePicker name='hong' label='hong' placeholder='hong' showTime={false} disabled={false} span={6}/>
          <InputArea name='xue' label='yang' placeholder='yang' disabled={false} required={false} span={6} rows={1}/>
          <CosSelectSearch queryForm={queryForm} setfocusFlag={setfocusFlag} label='??????' span={6} name={['666','fsdfsf']}/>
        </Row>
        <Input className='colWidth' maxLength={2}  />
        {/* <CosModal/> */}
        </Form>
      <Input maxLength={2} />
      <Button type='primary' onClick={() => queryForm.submit()}>??????</Button>
      <Button type='primary' onClick={() => handleclick()}>??????</Button>
      <CosButton type='primary' auth='AFCM-AG-AR-001-B01' onClick={()=>{handleclick()}}><FormattedMessage id="menu.welcome" /></CosButton>
      <CosUpload/>
      <Form layout='horizontal' name='yang' onFinish={handleFrom} ref={formRef}>
        <PaginationTable
          dataSource={selectList}
          columns={columns}
          rowKey='sapCustomerCode'
          selectionType='radio'
          // checked={checked}
          // scrollHeightMinus={500}
          selectWithClickRow={true}
          handleDoubleClickRow={handleFrom}
          
          rowSelection={{
            selectedRowKeys:checked,
            onChange:(selectedRowKeys, selectedRows)=>{
              console.log(selectedRowKeys)
              setChecked(selectedRowKeys)
              console.log(4234234234234)
                for(let i=0;i<selectList.length;i++){
                  selectList[i].label='333333'
                }
                for(let j=0;j<selectedRows.length;j++){
                  selectedRows[j].label='444444'
                }
            }
          }}
          setSelectedRows={setSelectedRows}
          setSelectedRowsKey={setSelectedRowsKey}
          pageChange={handlePageChange}
          scroll={{y:200}}
          // pagination={false}
        />
        {/* <PcmPaginationTable
          columns={columns}
          scrollHeightMinus={200}
        /> */}
      </Form>
      <Table columns={finalColumns} dataSource={selectList} />
      <CosModal title={<FormattedMessage id='lbl.Port-query' />} visible={false} width={600} onCancel={() => portBouncedHandleCancel()}>
      <CossPaginationTable
        columns={columnss}
        // rowKey='customerUuid'
        defaultCondition={selectList}
        // setSelectedRowsKey={setSelectedRowsKey}
        // setSelectedRows={setSelectedRows}
        // onTableChange={handlePageChange}
        // queryOnLoad={false}
        // scrollHeightMinus={150}
      />
      </CosModal>

      {/* <Alert
        message="???????????????????????????"
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Typography.Text strong>
        2020???10???19??????antd?????????????????????4.7.0????????????install?????????
      </Typography.Text>
      <CodePreview> npm install </CodePreview>
      <Typography.Text strong>
        ???????????????????????????svn?????????????????????????????????????????????????????????????????????????????????????????????
      </Typography.Text>
      <CodePreview> src/layouts/BasicLayout.jsx 118??? menuRender={false} </CodePreview>
      <Typography.Text strong>
        2020???8???3??????antd?????????????????????4.5.2????????????install?????????
      </Typography.Text>
      <CodePreview> npm install </CodePreview>
      <Typography.Text strong>
        2020???8???3???????????????????????????daiyh???????????????fengwsh?????????????????????????????????????????????????????????????????????
      </Typography.Text>
      <CodePreview> PcmApiFilter.tryMockAuthIfNotExists </CodePreview>
      <Typography.Text strong>
        2020???7???27?????????????????????????????????????????????????????????????????????
      </Typography.Text>
      <CodePreview>
        <ul>
          <li>./task-manage/TaskExclude  // ?????????????????????</li>
          <li>./task-manage/TaskRule  // ???????????????????????????????????????</li>
          <li>./task-manage/TaskTodo  // ????????????????????????????????????</li>
        </ul>
        <ul>
          <li>./components/PCM/PcmPaginationTable // ????????????table</li>
          <li>./components/PCM/PcmSearchGroup // ??????????????????????????????????????????????????????????????????????????????</li>
          <li>./components/BusinessComponents/AutoCompleteUser // ??????????????????</li>
          <li>./components/BusinessComponents/SelectCust // ?????????????????????</li>
        </ul>
      </CodePreview>
      <Typography.Text strong>
        2020???6???23????????????????????????excel???????????????????????????install
      </Typography.Text>
      <CodePreview> npm install </CodePreview> */}
    </Card></>
)};
export default PcmWelcome