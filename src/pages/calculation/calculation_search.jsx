import React, { useState, useEffect, $apiUrl } from 'react';
import { Form, Button, Row, Tabs, Modal } from 'antd'
import { FormattedMessage, formatMessage, connect } from 'umi'
import { CosInputText, CosSelect, CosButton, CosPaginationTable, CosLoading, CosDoubleDatePicker } from '@/components/Common/index'
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import { trackingAgencyList, momentFormat } from '@/utils/commonDataInterface';
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
} from '@ant-design/icons'
const { TabPane } = Tabs;
const confirm = Modal.confirm
const CalculationSearch = (props) => {
    const [queryForm] = Form.useForm();
    const [loading,setLoading] = useState(false)
    const [companysData,setCompanysData] = useState([])//公司
    const [agencyCode,setAgencyCode] = useState([])
    const [prepareType,setPrepareType] = useState({
        searchAllAgType:[],
        searchAllCommType:[]
    })
    const [defaultKey,setDefaultKey] = useState('1')
    const [crList,setCrList] = useState([])
    const [agList,setAgList] = useState([])
    const [tabTotalAg,setTabTotalAg] = useState(0)
    const [tabTotalCr,setTabTotalCr] = useState(0)
    const [pageAg, setPageAg]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    const [pageCr, setPageCr]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    useEffect(()=>{
        getComPany()
        searchAllType('PRECALC_SEARCHALLAGTYPE','searchAllAgType')
        searchAllType('PRECALC_SEARHALLCOMMTYPE','searchAllCommType')
        trackingAgencyList({apiUrl:$apiUrl,companyCode:2000}, setAgencyCode);     // 代理编码
        
        if(window.exception){
            queryForm.setFieldsValue({
                search:{...window.exception}
            })
            pageChangeCr(pageCr,null,'search')
            pageChangeAg(pageAg,null,'search')
        }
    },[])
    const getComPany = async() => {
        const result=await request($apiUrl.PRECALC_GETCBSCOMPANYS,{
            method:"POST",
            data:{}
        })
        if(result.success){
            var data = result.data||[];
            data.map((val, idx)=> {
                val['value'] = val.companyCode;
                val['label'] = val.companyCode + '-' + val.companyName;
            })
            setCompanysData(data)
        }
    }
    const searchAllType = async(url,name) => {
        const result=await request($apiUrl[url],{
            method:"POST",
            data:{}
        })
        if(result.success){
            var data = result.data||[];
            console.log(data)
            prepareType[name] = data
            setPrepareType({...prepareType})
        }
    }
    const crColumns = [
        {
            title: <FormattedMessage id="lbl.calculation.monthDate" />,//年月
            dataIndex: 'monthDate',
            dataType:'dateTime',
            width: 80,

        },{
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            width: 150,
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'agencyCode',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'commissionType',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.calculation.CalcResults" />,//测算结果
            children:[
                {
                    title: <FormattedMessage id='lbl.Agreement-currency' />,   // 税额币种 -- 协议币种
                    dataIndex: 'prepareRateCurrencyCode',
                    width: 120,
                },{
                    title: <FormattedMessage id='lbl.calculation.ttlatm' />,   // 预测总金额
                    dataIndex: 'prepareTotalAmount',
                    width: 100,
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'prepareClearingCurrencyCode',
                    width: 150,
                },{
                    title: <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
                    width: 160,
                    dataIndex: 'prepareTotalAmountInClearing',
                },{
                    title: <FormattedMessage id='lbl.calculation.agenyccy' />,   // 代理币种
                    width: 150,
                    dataIndex: 'prepareAgencyCurrencyCode',
                },{
                    title: <FormattedMessage id='lbl.calculation.atmageny' />,   // 代理总金额
                    width: 150,
                    dataIndex: 'prepareTotalAmountInAgency',
                },
            ]
        },{
            title: <FormattedMessage id="lbl.calculation.proResults" />,//生产结果
            children:[
                {
                    title: <FormattedMessage id='lbl.Agreement-currency' />,   // 税额币种 -- 协议币种
                    dataIndex: 'actualRateCurrencyCode',
                    width: 120,
                },{
                    title: <FormattedMessage id='lbl.calculation.ttlatm' />,   // 预测总金额
                    dataIndex: 'actualTotalAmount',
                    width: 100,
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'actualClearingCurrencyCode',
                    width: 150,
                },{
                    title: <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
                    width: 160,
                    dataIndex: 'actualTotalAmountInClearing',
                },{
                    title: <FormattedMessage id='lbl.calculation.agenyccy' />,   // 代理币种
                    width: 150,
                    dataIndex: 'actualAgencyCurrencyCode',
                },{
                    title: <FormattedMessage id='lbl.calculation.atmageny' />,   // 代理总金额
                    width: 150,
                    dataIndex: 'actualTotalAmountInAgency',
                },
            ]
        },
    ]
    const agColumns = [
        {
            title: <FormattedMessage id="lbl.calculation.monthDate" />,//年月
            dataIndex: 'monthDate',
            dataType:'dateTime',
            width: 80,
        },{
            title: 'SVVD',//SVVD
            dataIndex: 'svvdId',
            width: 120,
        },{
            title: <FormattedMessage id='lbl.calculation.port'/>,//口岸
            dataIndex: 'portCode',
            width: 150,
        },{
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            width: 150,
        },{
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'agencyCode',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'feeType',
            width: 120,
        },{
            title: <FormattedMessage id="lbl.calculation.CalcResults" />,//测算结果
            children:[
                {
                    title: <FormattedMessage id='lbl.Agreement-currency' />,   // 税额币种 -- 协议币种
                    dataIndex: 'prepareRateCurrencyCode',
                    width: 120,
                },{
                    title: <FormattedMessage id='lbl.calculation.ttlatm' />,   // 预测总金额
                    dataIndex: 'prepareTotalAmount',
                    width: 100,
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'prepareClearingCurrencyCode',
                    width: 150,
                },{
                    title: <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
                    width: 160,
                    dataIndex: 'prepareTotalAmountInClearing',
                },{
                    title: <FormattedMessage id='lbl.calculation.agenyccy' />,   // 代理币种
                    width: 150,
                    dataIndex: 'prepareAgencyCurrencyCode',
                },{
                    title: <FormattedMessage id='lbl.calculation.atmageny' />,   // 代理总金额
                    width: 150,
                    dataIndex: 'prepareTotalAmountInAgency',
                },{
                    title: <FormattedMessage id="lbl.Container-capacity" />,   // 箱量
                    width: 100,
                    dataIndex: 'prepareContainerCount',
                }
            ]
        },{
            title: <FormattedMessage id="lbl.calculation.proResults" />,//生产结果
            children:[
                {
                    title: <FormattedMessage id='lbl.Agreement-currency' />,   // 税额币种 -- 协议币种
                    dataIndex: 'actualRateCurrencyCode',
                    width: 120,
                },{
                    title: <FormattedMessage id='lbl.calculation.ttlatm' />,   // 预测总金额
                    dataIndex: 'actualTotalAmount',
                    width: 100,
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'actualClearingCurrencyCode',
                    width: 150,
                },{
                    title:  <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
                    width: 160,
                    dataIndex: 'actualTotalAmountInClearing',
                },{
                    title: <FormattedMessage id='lbl.calculation.agenyccy' />,   // 代理币种
                    width: 150,
                    dataIndex: 'actualAgencyCurrencyCode',
                },{
                    title: <FormattedMessage id='lbl.calculation.atmageny' />,   // 代理总金额
                    width: 150,
                    dataIndex: 'actualTotalAmountInAgency',
                },{
                    title: <FormattedMessage id="lbl.Container-capacity" />,   // 箱量
                    width: 100,
                    dataIndex: 'actualContainerCount',
                }
            ]
        },
    ]
    const pageChangeAg = async(pagination, options, search) => {
        Toast('','', '', 5000, false)
        setLoading(true)
        const params = queryForm.getFieldsValue().search
        if(search){
            pagination.current=1
        }
        if(pagination.pageSize!=pageAg.pageSize){
            pagination.current=1
        }
        if(options&&options.sorter.order){
            sorter={
                "field": options.sorter.columnKey,
                "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
            }
        }
        let result = await request($apiUrl.PRECALC_SEARCHPRECALCAGRESULT,{
            method:"POST",
            data:{
                page:pagination,
                params:{
                    ...params,
                    companyCode:params.effectCompanyCode,
                    startMonthDate:params.monthDate&&momentFormat(params.monthDate[0]),
                    endMonthDate:params.monthDate&&momentFormat(params.monthDate[1]),
                    monthDate:undefined,
                    preId:window.exception&&window.exception.prepareId
                },
            }
        })
        if(result.success) {
            const dataAG = result.data.AG
            dataAG.resultList&&setAgList(dataAG.resultList)
            setTabTotalAg(dataAG.totalCount)
            setPageAg({...pagination})
            setLoading(false)
        }else{
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    }
    const pageChangeCr = async(pagination, options, search) => {
        Toast('','', '', 5000, false)
        setLoading(true)
        const params = queryForm.getFieldsValue().search
        if(search){
            pagination.current=1
        }
        if(pagination.pageSize!=pageCr.pageSize){
            pagination.current=1
        }
        if(options&&options.sorter.order){
            sorter={
                "field": options.sorter.columnKey,
                "order":options.sorter.order==="ascend"? 'DESC' :options.sorter.order==="descend"?'ASC':undefined
            }
        }
        let result = await request($apiUrl.PRECALC_SEARCHPRECALCCRRESULT,{
            method:"POST",
            data:{
                page:pagination,
                params:{
                    ...params,
                    companyCode:params.effectCompanyCode,
                    startMonthDate:params.monthDate&&momentFormat(params.monthDate[0]),
                    endMonthDate:params.monthDate&&momentFormat(params.monthDate[1]),
                    monthDate:undefined,
                    preId:window.exception&&window.exception.prepareId
                },
            }
        })
        if(result.success) {
            const dataCR = result.data.CR
            dataCR.resultList&&setCrList(dataCR.resultList)
            setTabTotalCr(dataCR.totalCount)
            setPageCr({...pagination})
            setLoading(false)
        }else{
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    } 
    const selectChangeBtn = (value, all) => {
		trackingAgencyList({apiUrl:$apiUrl,companyCode:value.split('-')[0]}, setAgencyCode);     // 代理编码
    }
    const tabsChange = (activeKey) => {
        setDefaultKey(activeKey)

    }
    return <div className='parent-box'>
        <div className='header-from'>
            <Form form={queryForm} name='func'>
                <Row>
                    {/*代理公司 */}
                    <CosSelect name={['search','effectCompanyCode']} selectChange={selectChangeBtn} flag={true} showSearch={true} disabled={props.currentUser.companyCode != 2000?true:false} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
                    {/* 代理编码 */}
                    <CosSelect name={['search','agencyCode']} showSearch={true} flag={true} label={<FormattedMessage id='lbl.agency'/>} options={agencyCode}/>
                    {/* 佣金费用类型 */}
                    {defaultKey=='1'?<CosSelect name={['search','feeType']} flag={true} showSearch={true} label={<FormattedMessage id='lbl.Commission-type'/>} options={prepareType.searchAllAgType}/>:null}
                    {/* 代理费用类型 */}
                    {defaultKey=='2'?<CosSelect name={['search','feeType']} flag={true} showSearch={true} label={<FormattedMessage id='lbl.calculation.commType'/>} options={prepareType.searchAllCommType}/>:null}
                    {/* 测算名称 */}
                    <CosInputText name={['search', 'prepareName']} label={<FormattedMessage id='lbl.calculation.name' capitalized={false}/>} />
                    {/* 年月 */}
                    <CosDoubleDatePicker name={['search', 'monthDate']} label={<FormattedMessage id='lbl.calculation.monthDate' />} />
                </Row>
            </Form>
            {/* 查询条件 */}
            <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
        </div>
        <div className='main-button'>
            <div className='button-left'/>
            <div className='button-right'>
                {/* 重置 */}
                <Button onClick={() => {
                    Toast('','', '', 5000, false)
                    queryForm.resetFields()
                    setCrList([])
                    setAgList([])
                }} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                {/* 查询按钮 */}
                <Button onClick={() => { 
                    pageChangeCr(pageCr,null,'search') 
                    pageChangeAg(pageAg,null,'search') 
                }} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
            </div>
        </div>
        <div className="footer-table budget-tracking">
            <Tabs type="card" activeKey={defaultKey} onChange={(activeKey) => {tabsChange(activeKey)}}>
                <TabPane tab={<FormattedMessage id='lbl.budgetTracking.cr' />} key="1">
                    <CosPaginationTable
                        columns={crColumns}
                        dataSource={crList}
                        rowKey='itemUuid'
                        pageSize={pageCr.pageSize}
                        current={pageCr.current}
                        pageChange={pageChangeCr}
                        total={tabTotalCr}
                        scrollHeightMinus={300}
                        rowSelection={null}
                    />
                </TabPane>
                <TabPane tab={<FormattedMessage id='lbl.budgetTracking.ag' />} key="2">
                    <CosPaginationTable
                        columns={agColumns}
                        dataSource={agList}
                        rowKey='itemUuid'
                        pageSize={pageAg.pageSize}
                        current={pageAg.current}
                        pageChange={pageChangeAg}
                        total={tabTotalAg}
                        scrollHeightMinus={300}
                        rowSelection={null}
                    />
                </TabPane>
            </Tabs>
        </div>
        <CosLoading spinning={loading} />
    </div>
}
export default connect(({user})=>({
    currentUser: user.currentUser,
}))(CalculationSearch)