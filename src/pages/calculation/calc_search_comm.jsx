{/* 测算差异查询佣金 */}
import React, { useState, useEffect, $apiUrl } from 'react';
import { Form, Button, Row, } from 'antd'
import { FormattedMessage, formatMessage, connect } from 'umi'
import { CosInputText, CosSelect, CosPaginationTable, CosLoading, CosDoubleDatePicker } from '@/components/Common/index'
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import { trackingAgencyList, momentFormat, acquireSelectDataExtend,allCompany } from '@/utils/commonDataInterface';
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
} from '@ant-design/icons'

const CalcSearchComm = (props) => {
    const [queryForm] = Form.useForm();
    const [loading,setLoading] = useState(false)
    const [companysData,setCompanysData] = useState([])//公司
    const [agencyCode,setAgencyCode] = useState([])
    const [prepareType,setPrepareType] = useState({
        searchAllCommType:[]
    })
    const [crList,setCrList] = useState([])
    const [tabTotalCr,setTabTotalCr] = useState(0)
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [pageCr, setPageCr]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    useEffect(()=>{
        // getComPany()
        searchAllType('PRECALC_SEARHALLCOMMTYPE','searchAllCommType')
        trackingAgencyList({apiUrl:$apiUrl,companyCode:2000}, setAgencyCode);     // 代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        if(window.exception){
            queryForm.setFieldsValue({
                search:{...window.exception}
            })
            pageChangeCr(pageCr,null,'search')
        }
        allCompany(setCompanysData,$apiUrl)
    },[])
    // const getComPany = async() => {
    //     const result=await request($apiUrl.PRECALC_GETCBSCOMPANYS,{
    //         method:"POST",
    //         data:{}
    //     })
    //     if(result.success){
    //         var data = result.data||[];
    //         data.map((val, idx)=> {
    //             val['value'] = val.companyCode;
    //             val['label'] = val.companyCode + '-' + val.companyName;
    //         })
    //         setCompanysData(data)
    //     }
    // }
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
            width: 50,
        },
        {
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            width: 60,
        },{
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'agencyCode',
            width: 80,
        },{
            title: <FormattedMessage id="lbl.Commission-type" />,//佣金类型
            dataIndex: 'commissionType',
            width: 80,
            dataType: prepareType.searchAllCommType,
        },{
            title: <FormattedMessage id="lbl.calculation.CalcResults" />,//测算结果
            children:[
                {
                    title: <FormattedMessage id='lbl.Agreement-currency' />,   // 税额币种 -- 协议币种
                    dataIndex: 'prepareRateCurrencyCode',
                    width: 60,
                },{
                    title: <FormattedMessage id='lbl.calculation.ttlatm' />,   // 预测总金额
                    dataIndex: 'prepareTotalAmount',
                    align:'right',
                    width: 80,
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'prepareClearingCurrencyCode',
                    width: 60,
                },{
                    title: <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
                    width: 80,
                    dataIndex: 'prepareTotalAmountInClearing',
                    align:'right',
                },{
                    title: <FormattedMessage id='lbl.calculation.agenyccy' />,   // 代理币种
                    width: 60,
                    dataIndex: 'prepareAgencyCurrencyCode',
                },{
                    title: <FormattedMessage id='lbl.calculation.atmageny' />,   // 代理总金额
                    width: 80,
                    dataIndex: 'prepareTotalAmountInAgency',
                    align:'right',
                },
            ]
        },{
            title: <FormattedMessage id="lbl.calculation.proResults" />,//生产结果
            children:[
                {
                    title: <FormattedMessage id='lbl.Agreement-currency' />,   // 税额币种 -- 协议币种
                    dataIndex: 'actualRateCurrencyCode',
                    width: 60,
                },{
                    title: <FormattedMessage id='lbl.calculation.ttlatm' />,   // 预测总金额
                    dataIndex: 'actualTotalAmount',
                    width: 80,
                    align:'right',
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'actualClearingCurrencyCode',
                    width: 60,
                },{
                    title: <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
                    width: 80,
                    dataIndex: 'actualTotalAmountInClearing',
                    align:'right',
                },{
                    title: <FormattedMessage id='lbl.calculation.agenyccy' />,   // 代理币种
                    width: 60,
                    dataIndex: 'actualAgencyCurrencyCode',
                },{
                    title: <FormattedMessage id='lbl.calculation.atmageny' />,   // 代理总金额
                    width: 80,
                    dataIndex: 'actualTotalAmountInAgency',
                    align:'right',
                },
            ]
        },
    ]
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
                    shipownerCompanyCode: params.shipownerCompanyCode,
                    companyCode: params.companyCode,
                    agencyCode: params.agencyCode,
                    commissionType: params.commissionType,
                    prepareName: params.prepareName,
                    startMonthDate:params.monthDate&&momentFormat(params.monthDate[0]),
                    endMonthDate:params.monthDate&&momentFormat(params.monthDate[1]),
                    // preId:window.exception&&window.exception.prepareId
                },
            }
        })
        if(result.success) {
            const dataCR = result.data.CR
            let datas = dataCR.resultList
            if(datas!=null){
                datas.map((v,i)=>{
                    if(companysData!=null){
                        companysData.map((val, i) => {
                            if(val.value == v.companyCode) {
                                v.companyCode =  val.label 
                            }
                        })
                    }
                })
            }
            dataCR.resultList&&setCrList(dataCR.resultList)
            setTabTotalCr(dataCR.totalCount)
            setPageCr({...pagination})
            setLoading(false)
        }else{
            setCrList([])
            Toast('', result.errorMessage, 'alert-error', 5000, false);
            setLoading(false)
        }
    } 
    const selectChangeBtn = (value, all) => {
		trackingAgencyList({apiUrl:$apiUrl,companyCode:value.split('-')[0]}, setAgencyCode);     // 代理编码
    }
    return <div className='parent-box'>
        <div className='header-from'>
            <Form form={queryForm} name='func'>
                <Row>
                    {/* 船东 */}
                    <CosSelect  name={['search','shipownerCompanyCode']} label={<FormattedMessage id='lbl.carrier'/>} options={acquireData.values} flag={true}/>
                    {/*代理公司 */}
                    <CosSelect name={['search','companyCode']} selectChange={selectChangeBtn} flag={true} showSearch={true} disabled={props.currentUser.companyCode != 2000?true:false} label={<FormattedMessage id='lbl.company'/>} options={companysData}/>
                    {/* 代理编码 */}
                    {/* <CosSelect name={['search','agencyCode']} showSearch={true} flag={true} label={<FormattedMessage id='lbl.agency'/>} options={agencyCode}/> */}
                    {/* 佣金费用类型 */}
                    <CosSelect name={['search','commissionType']} flag={true} showSearch={true} label={<FormattedMessage id='lbl.Commission-type'/>} options={prepareType.searchAllCommType}/>
                    {/* 测算名称 */}
                    <CosInputText name={['search', 'prepareName']} label={<FormattedMessage id='lbl.calculation.name'/>} capitalized={false}/>
                    {/* 年月 */}
                    <CosDoubleDatePicker name={['search', 'monthDate']} picker="month" label={<FormattedMessage id='lbl.calculation.monthDate' />} />
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
                }} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                {/* 查询按钮 */}
                <Button onClick={() => { 
                    pageChangeCr(pageCr,null,'search') 
                }} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
            </div>
        </div>
        <div className="footer-table budget-tracking">
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
        </div>
        <CosLoading spinning={loading} />
    </div>
}
export default connect(({user})=>({
    currentUser: user.currentUser,
}))(CalcSearchComm)