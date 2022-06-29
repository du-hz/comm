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
      title:'操作',
      width:'15%',
      render:(text,record,index) => {
        return <a onClick={() => formRef.current.submit()}>删除</a>//handleDelete(index)
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
      title: '可以自适应宽度',
      dataIndex: 'customerName',
      sorter: false,
      fixed: true,
      // width: '10%'
    },{
      title: <FormattedMessage id='lbl.carrier' />,//船东
      // dataType: acquireData.values,
      dataIndex: 'shipownerCompanyCode',
      align: 'left',
      sorter: true,
      key: 'SO_COMPANY_CDE',
      // width: '2%'
  }, {
      title: <FormattedMessage id="lbl.company" />,//公司
      dataIndex: 'companyCode',
      align: 'left',
      sorter: true,
      key: 'COMPANY_CDE',
      width: '15%'
  }, {
      title: <FormattedMessage id="lbl.agency" />,//代理编码
      dataIndex: 'agencyCode',
      align: 'left',
      sorter: true,
      key: 'AGENCY_CDE',
      width: 120
  }, {
      title: <FormattedMessage id="lbl.company-abbreviation" />,//公司简称
      dataIndex: 'commpanyNameAbbr',
      sorter: true,
      key: 'COMPANY_NME_ABBR',
      width: 120
  }, {
      title: <FormattedMessage id="lbl.ProtocolState" />,//协议状态
      dataIndex: 'status',
      align: 'left',
      sorter: true,
      key: 'STATUS',
      width: 120,
  },
  ]
  const [queryForm] = Form.useForm();
  
  const handleQuery = () => {
      // selectList.push({label:'滕荃',value:'1',sapCustomerCode:'123',content:'r43423'})
      // selectList.push({label:'杨老板',value:'3',sapCustomerCode:'1234',content:'r43423'})
      // selectList.push({label:'杜洪征',value:'2',sapCustomerCode:'12345',content:'r43423'})
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
    // 　　　var ev=ev||window.event
    // 　　　console.log(ev.keyCode)
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
      title: '删除',
      content: '删除之后此级不再显示',
      okText: '确定',
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
      {/* <CosToast alertStatus='alert-error' message={'华康师傅喝口水东方航空回复几十块付货款43'}/> */}
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
          <CosSelectSearch queryForm={queryForm} setfocusFlag={setfocusFlag} label='港口' span={6} name={['666','fsdfsf']}/>
        </Row>
        <Input className='colWidth' maxLength={2}  />
        {/* <CosModal/> */}
        </Form>
      <Input maxLength={2} />
      <Button type='primary' onClick={() => queryForm.submit()}>提交</Button>
      <Button type='primary' onClick={() => handleclick()}>赋值</Button>
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
        message="请随时关注开发公告"
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Typography.Text strong>
        2020年10月19日，antd版本已经升级到4.7.0，执行下install后生效
      </Typography.Text>
      <CodePreview> npm install </CodePreview>
      <Typography.Text strong>
        左侧菜单是否显示，svn上请保持不要菜单的形式，本机开发需要可以注释掉这句，但不要提交
      </Typography.Text>
      <CodePreview> src/layouts/BasicLayout.jsx 118行 menuRender={false} </CodePreview>
      <Typography.Text strong>
        2020年8月3日，antd版本已经升级到4.5.2，执行下install后生效
      </Typography.Text>
      <CodePreview> npm install </CodePreview>
      <Typography.Text strong>
        2020年8月3日，默认登录的账号daiyh，新修改为fengwsh，如有希望手动指定默认登录用户的，请在后台修改
      </Typography.Text>
      <CodePreview> PcmApiFilter.tryMockAuthIfNotExists </CodePreview>
      <Typography.Text strong>
        2020年7月27日，请尽量参考样板界面实现，有不清楚的及时沟通
      </Typography.Text>
      <CodePreview>
        <ul>
          <li>./task-manage/TaskExclude  // 简单的增删改查</li>
          <li>./task-manage/TaskRule  // 略复杂，编辑界面有联动控件</li>
          <li>./task-manage/TaskTodo  // 复杂界面，目前正在开发中</li>
        </ul>
        <ul>
          <li>./components/PCM/PcmPaginationTable // 通用分页table</li>
          <li>./components/PCM/PcmSearchGroup // 通用查询组件（自动排列），有特别复杂要求的可以不使用</li>
          <li>./components/BusinessComponents/AutoCompleteUser // 用户选择控件</li>
          <li>./components/BusinessComponents/SelectCust // 公司层客户控件</li>
        </ul>
      </CodePreview>
      <Typography.Text strong>
        2020年6月23日，项目新引入了excel导出包，请执行一次install
      </Typography.Text>
      <CodePreview> npm install </CodePreview> */}
    </Card></>
)};
export default PcmWelcome