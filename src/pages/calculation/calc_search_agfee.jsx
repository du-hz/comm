{/* 测算差异查询代理费 */}
import React, { useState, useEffect, $apiUrl } from 'react';
import { Form, Button, Row, } from 'antd'
import { FormattedMessage, formatMessage, connect } from 'umi'
import { CosInputText, CosSelect, CosButton, CosPaginationTable, CosLoading, CosDoubleDatePicker } from '@/components/Common/index'
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import { trackingAgencyList, momentFormat,acquireSelectDataExtend,allCompany } from '@/utils/commonDataInterface';
import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
} from '@ant-design/icons'
const CalcSearchAgfee = (props) => {
    const [queryForm] = Form.useForm();
    const [loading,setLoading] = useState(false)
    const [acquireData, setAcquireData] = useState({}); // 船东
    const [companysData,setCompanysData] = useState([])//公司
    const [agencyCode,setAgencyCode] = useState([])
    const [prepareType,setPrepareType] = useState({
        searchAllAgType:[],
    })
    const [agList,setAgList] = useState([])
    const [tabTotalAg,setTabTotalAg] = useState(0)
    const [pageAg, setPageAg]=useState({    //分页
        current: 1,
        pageSize: 10
    })
    useEffect(()=>{
        // getComPany()
        searchAllType('PRECALC_SEARCHALLAGTYPE','searchAllAgType')
        trackingAgencyList({apiUrl:$apiUrl,companyCode:2000}, setAgencyCode);     // 代理编码
        acquireSelectDataExtend('COMMON_DICT_ITEM', 'CB0068',setAcquireData, $apiUrl);// 船东
        
        if(window.exception){
            queryForm.setFieldsValue({
                search:{...window.exception}
            })
            pageChangeAg(pageAg,null,'search')
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
    const agColumns = [
        {
            title: <FormattedMessage id="lbl.calculation.monthDate" />,//年月
            dataIndex: 'monthDate',
            dataType:'dateTime',
            width: 80,
        },{
            title: 'SVVD',//SVVD
            dataIndex: 'svvdId',
            width: 60,
        },{
            title: <FormattedMessage id='lbl.calculation.port'/>,//口岸
            dataIndex: 'portCode',
            width: 50,
        },{
            title: <FormattedMessage id="lbl.carrier" />,//船东
            dataIndex: 'shipownerCompanyCode',
            width: 50,
        },{
            title: <FormattedMessage id="lbl.company" />,//公司
            dataIndex: 'companyCode',
            width: 50,
        },{
            title: <FormattedMessage id="lbl.carrier.loc" />,//代理
            dataIndex: 'agencyCode',
            width: 60,
        },{
            title: <FormattedMessage id="lbl.ac.invoice.fee-type" />,//费用类型
            dataIndex: 'feeType',
            width: 80,
            dataType: prepareType.searchAllAgType,
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
                    width: 80,
                    align:'right',
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
                },{
                    title: <FormattedMessage id="lbl.Container-capacity" />,   // 箱量
                    width: 40,
                    dataIndex: 'prepareContainerCount',
                }
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
                    align:'right',
                    width: 80,
                },{
                    title: <FormattedMessage id='lbl.settlement-currency' />,    // 结算币种
                    dataIndex: 'actualClearingCurrencyCode',
                    width: 60,
                },{
                    title:  <FormattedMessage id='lbl.calculation.amtclearing' />,  // 结算总金额
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
                },{
                    title: <FormattedMessage id="lbl.Container-capacity" />,   // 箱量
                    width: 40,
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
                    shipownerCompanyCode: params.shipownerCompanyCode,
                    companyCode:params.companyCode,
                    feeType: params.feeType,
                    prepareName: params.prepareName,
                    startMonthDate:params.monthDate&&momentFormat(params.monthDate[0]),
                    endMonthDate:params.monthDate&&momentFormat(params.monthDate[1]),
                    // monthDate:undefined,
                    // preId:window.exception&&window.exception.prepareId
                },
            }
        })
        if(result.success) {
            const dataAG = result.data.AG
            let datas = dataAG.resultList
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
            dataAG.resultList&&setAgList(dataAG.resultList)
            setTabTotalAg(dataAG.totalCount)
            setPageAg({...pagination})
            setLoading(false)
        }else{
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
                    {/* 代理费用类型 */}
                    <CosSelect name={['search','feeType']} flag={true} showSearch={true} label={<FormattedMessage id='lbl.calculation.commType'/>} options={prepareType.searchAllAgType}/>
                    {/* 测算名称 */}
                    <CosInputText name={['search', 'prepareName']} label={<FormattedMessage id='lbl.calculation.name'/>}  capitalized={false}/>
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
                    setAgList([])
                }} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                {/* 查询按钮 */}
                <Button onClick={() => { 
                    pageChangeAg(pageAg,null,'search') 
                }} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
            </div>
        </div>
        <div className="footer-table budget-tracking">
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
        </div>
        <CosLoading spinning={loading} />
    </div>
}
export default connect(({user})=>({
    currentUser: user.currentUser,
}))(CalcSearchAgfee)