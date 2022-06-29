import React, { useState, useEffect, $apiUrl, useContext } from 'react'
import { FormattedMessage, formatMessage } from 'umi'
import { Form, Modal, Button, Row, InputNumber, Input, Select, Tooltip, Tabs, DatePicker, Space, Col } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData, momentFormat, companyAgency } from '@/utils/commonDataInterface';
import moment from 'moment';
import request from '@/utils/request';
import Selects from '@/components/Common/Select'
import SelectVal from '@/components/Common/Select';
import InputText from '@/components/Common/InputText'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import Loading from '@/components/Common/Loading'
import CosButton from '@/components/Common/CosButton'
import CosToast from '@/components/Common/CosToast'
import { Toast } from '@/utils/Toast'
import CosIcon from '@/components/Common/CosIcon'
import CosModal from '@/components/Common/CosModal'
// import InputNumber from '@/components/Common/IptNumber'
import {
    PlusOutlined,//新增item
    FormOutlined,//编辑
    CloseCircleOutlined,//删除
    SaveOutlined,//保存
    FileProtectOutlined,//保存并提交审核
    ImportOutlined,//协议退回
    RightOutlined,//右箭头
    DoubleRightOutlined,
    LeftOutlined,//左箭头
    DoubleLeftOutlined,
    RightCircleOutlined,
    UnlockOutlined
} from '@ant-design/icons'

let formlayouts = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 }
}
const confirm = Modal.confirm
const agencyFeeAgmtEdit = (props) => {

    // const [acquireData, setAcquireData] = useState({}); // 船东
    const [agencyCode, setAgencyCode] = useState([]);//代理编码
    const [agreementType, setAgreementType] = useState({});    //协议类型
    const [outBoundInboundIndicator, setOutBoundInboundIndicator] = useState({}) //进出口标志
    const [spinflag, setSpinflag] = useState(false)
    const [lastCondition, setLastCondition] = useState({
        "shipownerCompanyCode": null,
        "companyCode": null,
        "agencyCode": null,
        "feeAgreementCode": null,
        'agencyDescription': null,
        "prdIndicator": '',
        "postCalculationFlag": null,
        "postMode": null,
        "ygSide": null,
        "yfSide": null,
        "sfSide": null,
        "isYt": null,
        "isBill": null,
        'fromDate': null,
        'toDate': null,
    });
    const [messageData, setMessageData] = useState({});
    const [dataSource, setDataSource] = useState([])//新增表格数据
    const [tally, setTally] = useState({}) //预提是否记账
    const [whether, setWhether] = useState({})//通用的是否
    const [production, setProduction] = useState({})//是否生产性
    const [way, setWay] = useState({})//记账方式
    const [arithmetic, seArithmetic] = useState({})//记账算法

    const [disFlag, setDisFlag] = useState(false);  // 箱量计算方法明细显示隐藏
    const [dateFlag, setDateFlag] = useState(false);  // 时间(DATE)计算方法明细
    const [callFlag, setCallFlag] = useState(false);  // CALL/CALL2/MCALL/VOY/VOY2 计算方法明细
    const [vshpFlag, setVshpFlag] = useState(false);  // 船舶吨位法(VSHP)计算方法明细
    const [vteuFlag, setVteuFlag] = useState(false);  // VTEU计算方法明细
    const [blFlag, setBlFlag] = useState(false);  // 提单法(BL)计算方法明细
    const [aggFlag, setAggFlag] = useState(false);  // 北美箱量累进(AGG)计算方法明细
    const [rateFlag, setRateFlag] = useState(false);  // 特殊费率
    const [operandSaveFlag, setOperandSaveFlag] = useState(true);//箱量计算方法新增是否禁用
    const [computingMethod, setComputingMethod] = useState(true);//call计算方法是否禁用
    const [vshpShow, setVshpShow] = useState(true);//vshp计算方法是否禁用
    const [vteuShow, setVteuShow] = useState(true);//vteu计算方法是否禁用
    const [blShow, setBlShow] = useState(true);//bl计算方法是否禁用
    const [aggShow, setAggShow] = useState(true);//agg计算方法是否禁用
    const [dateShow, setDateShow] = useState(true)

    //计算方法表格
    const [computingMethodData, setComputingMethodData] = useState([])//箱量表格数据
    const [dateData, setDateData] = useState([])//时间(DATE)计算方法表格数据
    const [callData, setCallData] = useState([])//ALL/CALL2/MCALL/VOY/VOY2 计算方法表格数据
    const [vshpData, setVshpData] = useState([])//船舶吨位法(VSHP)计算法表格数据
    const [vshpDataTow, setVshpDataTow] = useState([])//船舶吨位法(VSHP)计算法表格数据
    const [vteuData, setVteuData] = useState([])//VTEU计算法表格数据
    const [blData, setBlData] = useState([]);  // 提单法(BL)计算方法表格数据
    const [aggData, setAggData] = useState([]);  // 北美箱量累进(AGG)计算方法表格数据
    const [rateData, setRateData] = useState([]);  // 特殊费率
    const [vvData, setVvData] = useState([]);///
    const [airlineData, setairlineData] = useState([])//新增航线组数据
    const [airlineCode, setAirlineCode] = useState([])//航线代码

    //择大计算方法表格
    const [compareComputingMethodData, setCompareComputingMethodData] = useState([])//箱量表格数据
    const [compareDateData, setCompareDateData] = useState([])//时间(DATE)计算方法表格数据
    const [compareCallData, setCompareCallData] = useState([])//ALL/CALL2/MCALL/VOY/VOY2 计算方法表格数据
    const [compareVshpData, setCompareVshpData] = useState([])//船舶吨位法(VSHP)计算法表格数据
    const [compareVshpDataTow, setCompareVshpDataTow] = useState([])//船舶吨位法(VSHP)计算法表格数据
    const [compareVteuData, setCompareVteuData] = useState([])//VTEU计算法表格数据
    const [compareBlData, setCompareBlData] = useState([]);  // 提单法(BL)计算方法表格数据
    const [compareAggData, setCompareAggData] = useState([]);  // 北美箱量累进(AGG)计算方法表格数据
    const [compareDisFlag, setCompareDisFlag] = useState(false);  // 箱量计算方法明细显示隐藏
    const [compareDateFlag, setCompareDateFlag] = useState(false);  // 时间(DATE)计算方法明细
    const [compareCallFlag, setCompareCallFlag] = useState(false);  // CALL/CALL2/MCALL/VOY/VOY2 计算方法明细
    const [compareVshpFlag, setCompareVshpFlag] = useState(false);  // 船舶吨位法(VSHP)计算方法明细
    const [compareVteuFlag, setCompareVteuFlag] = useState(false);  // VTEU计算方法明细
    const [compareBlFlag, setCompareBlFlag] = useState(false);  // 提单法(BL)计算方法明细
    const [compareAggFlag, setCompareAggFlag] = useState(false);  // 北美箱量累进(AGG)计算方法明细
    const [compareRateFlag, setCompareRateFlag] = useState(false);  // 特殊费率
    const [compareOperandSaveFlag, setCompareOperandSaveFlag] = useState(true);//箱量计算方法新增是否禁用
    const [compareComputingMethod, setCompareComputingMethod] = useState(true);//call计算方法是否禁用
    const [compareVshpShow, setCompareVshpShow] = useState(true);//vshp计算方法是否禁用
    const [compareVteuShow, setCompareVteuShow] = useState(true);//vteu计算方法是否禁用
    const [compareBlShow, setCompareBlShow] = useState(true);//bl计算方法是否禁用
    const [compareAggShow, setCompareAggShow] = useState(true);//agg计算方法是否禁用
    const [compareDateShow, setCompareDateShow] = useState(true)
    const [rateDataShow, setRateDataShow] = useState(true)//特殊费率新增是否禁用

    const [groupInit, setGroupInit] = useState([]);//箱型尺寸数据
    // 箱型尺寸详细-数据
    const [sizeDetailedTable, setSizeDetailedTable] = useState([]);
    const [newSizeDetailedTable, setNewSizeDetailedTable] = useState([]);


    const [allWhether, setAllWhether] = useState({})//通用的是否
    const [codeType, setCodeType] = useState({})//参考代码类型
    const [selfOwnedVessels, setSelfOwnedVessels] = useState({})//是否自有船
    const [countMethod, setCountMethod] = useState({})//代理费计算方法
    const [chooseBigCharge, setChooseBigCharge] = useState({})//择大收取计算方法
    const [maxFlag, setMaxFlag] = useState(true);  // 择大收取计算方法是否禁用

    const [costKey, setCostKey] = useState([])//费用大类
    const [subclass, setSubclass] = useState([])//费用小类
    const [subClassAll, setSubClassAll] = useState([])//费用小类

    const [emptyFullIndicator, setEmptyFullIndicator] = useState({})//空重箱标志
    const [transmitIndicator, setTransmitIndicator] = useState({})//进/出/中转
    const [feeCurrencyCode, setFeeCurrencyCode] = useState({})//币种
    const [socIndicator, setSocIndicator] = useState({})//SOC
    const [unitPriceType, setUnitPriceType] = useState({})//单价类型
    const [cargoProperty, setCargoProperty] = useState({})//内贸/外贸
    const [groupCode, setGroupCode] = useState({})//分组号码
    const [containerSizeTypeGroup, setContainerSizeTypeGroup] = useState([])//箱型尺寸组
    const [calculationPeriod, setCalculationPeriod] = useState({})//日期周期
    const [deletValue, setDeletValue] = useState([])//计算方法的value

    const [agreementHeadUuid, setAgreementHeadUuid] = useState(null)//head头部的uuid
    const [feeAgreementCode, setFeeAgreementCode] = useState(null)//协议代码
    // const [agreementItemUuid,setAgreementItemUuid]

    const [computingMethodName, setComputingMethodName] = useState([])//计算方法表格头部
    const [compareComputingMethodName, setCompareComputingMethodName] = useState([])//择大计算方法表格头部

    const [commissionAgmtCntrSizeTypeGroups, setCommissionAgmtCntrSizeTypeGroups] = useState([])
    const [isEditBoxSize, setIsEditBoxSize] = useState('NEW')
    const [defaultKey, setDefaultKey] = useState('1');
    const [agreementItemUuid, setAgreementItemUuid] = useState('')//item的uuid
    const [agFeeServiceGroupList, setagFeeServiceGroupList] = useState('')//航线组的uuid
    // const [itemUuidFlag, setItemUuidFlag] = useState('');// item的uuid用来判断箱量计算方法明细
    const [checked, setChecked] = useState([]);
    const [checkedGroup, setCheckedGroup] = useState([])
    const [uuid, setUuid] = useState([])//uuid
    const [cal, setCal] = useState({})//是否含税价
    const [calculationMethod, setCalculationMethod] = useState('')//计算方法
    const [comparecalculationMethod, setCompareCalculationMethod] = useState('')//择大计算方法
    const [tsIndicator, setTsIndicator] = useState('') //特殊费率
    const [itemIndex, setItemIndex] = useState('')//获取id
    const [itemdataIndex, setItemDataIndex] = useState('')//获取下标
    const [checkedRow, setCheckedRow] = useState([]); //选择行
    const [recordCreateUser, setRecordCreateUser] = useState('');//创建人
    const [recordCreateDate, setRecordCreateDate] = useState('');//创建时间
    //
    const [calculationMethodRadio, setCalculationMethodRadio] = useState('')//计算方法
    const [calculationMethodeid, setCalculationMethodeid] = useState('')//计算方法
    const [comparecalculationMethodRadio, setCompareCalculationMethodRadio] = useState('')//择大计算方法
    const [modifyFlagRadio, setModifyFlagRadio] = useState('')//是否阶梯费率
    const [compareIndicatorRadio, setCompareIndicatorRadio] = useState(' ')//是否择大选取
    const [indexRadio, setIndexRadio] = useState('')//单击的下标
    const [editFeeClass, setEditFeeClass] = useState('')//编辑时的费用大类
    const [feeTypeFlag, setFeeTypeFlag] = useState(true)//编辑时的费用大类
    const [saveSuccess, setSaveSuccess] = useState(true)
    const [operat, setOperat] = useState('')
    const [dataItem, setDataItem] = useState([])
    const {
        AIsModalVisible,//弹框显示
        setAIsModalVisible,//弹框显示
        toDate,//结束时间
        itemFlag,//是否显示item按钮
        setItemFlag,//是否显示item按钮
        addData,//新增数据
        setAddData,
        //编辑传过来的数据
        compileData,
        setCompileData,
        //查看详情禁用
        detailsFlag,
        flag,//表格删除保存新增是否禁用
        airlineFlag,//航线组新增按钮是否禁用
        setairlineFlag,//航线组新增按钮是否禁用
        buttonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        setButtonFlag,//新增、编辑、查看详情的弹框按钮是否禁用
        companysData,//公司
        title,
        permissionsButton,
        groupFlag,
        setGroupFlag,
        companyData,//公司默认值
        company,//船东禁用
        acquireData,//船东默认值
        shipperFlag,//船东禁用
        setUnlockAuditFlag,
        setShipperFlag,
        compyFlag,
        setCompyFlag
    } = props.addEdit;

    const [queryForm] = Form.useForm();

    useEffect(() => {
        // acquireSelectData('CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.YT.BUSINESS', setTally, $apiUrl);//预提是否记账
        acquireSelectData('COMM.SOC.EMPTY.IND', setProduction, $apiUrl);//是否生产性
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE', setWay, $apiUrl);//记账方式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG', seArithmetic, $apiUrl);//记账算法
        acquireSelectData('AFCM.AGMT.INOUTBOUND', setOutBoundInboundIndicator, $apiUrl);// 进出口标识
        acquireSelectData('AFCM.AGMT.YF.BUSINESS', setWhether, $apiUrl);//应付实付是否记账

        acquireSelectData('COMM0001', setAllWhether, $apiUrl)//通用是否
        acquireSelectData('AGMT.VAT.FLAG', setCal, $apiUrl)//是否含税价
        acquireSelectData('AFCM.AGMT.HERY.TYPES', setCodeType, $apiUrl)//参考代码类型
        acquireSelectData('COMM.SOC.EMPTY.IND', setSelfOwnedVessels, $apiUrl)//是否自有船
        acquireSelectData('AFCM.AGMT.CALC.MODES.BYCNT', setCountMethod, $apiUrl)//代理费计算方法
        acquireSelectData('AFCM.AGMT.CALC.MODES.CALCMODES', setChooseBigCharge, $apiUrl)//择大收取计算方法
        // acquireSelectData('AFCM.AGMT.CALC.MODES', setChooseBigCharge, $apiUrl)//择大收取计算方法

        acquireSelectData('COMM.SOC.EMPTY.IND', setEmptyFullIndicator, $apiUrl)//空重箱标志
        acquireSelectData('AGMT.AG.FEE.TRANSMIT', setTransmitIndicator, $apiUrl)//进/出/中转
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE', setFeeCurrencyCode, $apiUrl)//币种
        acquireSelectData('AGMT.AG.FEE.SOCIND', setSocIndicator, $apiUrl)//SOC
        acquireSelectData('AGMT.AG.FEE.UNITPRICE.TYPE', setUnitPriceType, $apiUrl)//单价类型
        acquireSelectData('AGMT.AG.FEE.CARGOPROP', setCargoProperty, $apiUrl)//内贸/外贸
        acquireSelectData('AGMT.AG.FEE.GROUPCODE', setGroupCode, $apiUrl)//分组号码
        acquireSelectData('AGMT.AG.FEE.DATEPERIOD', setCalculationPeriod, $apiUrl)//日期周期
        getData()
        dataSource == undefined ? [] : []

    }, [AIsModalVisible])



    useEffect(() => {
        setRateFlag(false); // 特殊费率初始化弹出窗隐藏
        var day2 = new Date();
        day2.setTime(day2.getTime());
        var fromDate = day2.getFullYear() + "-" + (day2.getMonth() + 1) + "-" + day2.getDate();
        queryForm.setFieldsValue({
            shipownerCompanyCode: company.companyType == 0 ? company.companyCode : acquireData.defaultValue,//船东默认
            companyCode: companyData,//公司默认值
            agencyCode: company.agencyCode,
            Date: [moment(fromDate), toDate ? moment(toDate) : ''],
        })
        companyData ? companyAgency($apiUrl, companyData, setAgencyCode) : null
        companyData ? agencyPtion() : null
        addData ? queryForm.setFieldsValue({
            postCalculationFlag: '0',//记账算法
            postMode: '0',//记账方式
            isYt: '0',//预提是否记账
            isBill: '0',//应付实付是否记账
            prdIndicator: '*',//是否生产性
            Date: [moment(fromDate), toDate ? moment(toDate) : ''],
        }) : null
        // console.log('新增初始化数据', addData, '结束时间', toDate, queryForm.getFieldValue().Date)
    }, [toDate, addData, companyData, acquireData])
    useEffect(() => {
        if (!itemFlag) {
            setOperandSaveFlag(true)
            setComputingMethod(true)
            setVshpShow(true)
            setVteuShow(true)
            setBlShow(true)
            setAggShow(true)
            setDateShow(true)
        }
        AIsModalVisible ? costKe() : costKe()
        let addTit = <FormattedMessage id='btn.add' />
        title ? title.props.id != addTit.props.id ? compile() : null : null
    }, [compileData, itemFlag, subClassAll, AIsModalVisible, title])
    useEffect(() => {
        //&&dataItem.length>0,
        console.log(!saveSuccess, operat, dataItem.length > 0, dataItem)
        if (!saveSuccess && operat && dataItem.length > 0) {
            handleQuery(operat)
            console.log(1)
        }
    }, [saveSuccess, operat, dataItem])

    useEffect(() => {
        console.log(dataSource)
    }, [dataSource])

    const agencyPtion = async () => {
        let descript = await request($apiUrl.COMMON_SEARCH_AGENCY_DESCRIPTION, {
            method: 'POST',
            data: {
                params: companyData
            }
        })
        if (descript.success) {
            queryForm.setFieldsValue({
                agencyDescription: descript.message,
            })
        }
    }

    //编辑传过来的数据
    const compile = () => {
        // console.log(compileData)
        let companyCodes
        if (compileData) {
            if (compileData.prdIndicator == 'null') {
                compileData.prdIndicator = '*'
            }
            companysData.map((v, i) => {
                if (compileData.companyCode == v.companyCode) {
                    companyCodes = v.label
                }
            })
        }
        companyAgency($apiUrl, compileData.companyCode, setAgencyCode)
        queryForm.setFieldsValue({
            ...compileData,
            'companyCode': companyCodes,
            Date: [compileData.fromDate ? moment(compileData.fromDate) : '', compileData.toDate ? moment(compileData.toDate) : ''],
            'recordCreateUser': compileData.recordCreateUser ? compileData.recordCreateUser : '',
            'recordCreateDate': compileData.recordCreateDate ? compileData.recordCreateDate : '',
        })
        setRecordCreateDate(compileData.recordCreateDate)
        setRecordCreateUser(compileData.recordCreateUser)
        let agFeeAgreementItemList = compileData.agFeeAgreementItemList
        setAgreementHeadUuid(compileData.agreementHeadUuid)
        setFeeAgreementCode(compileData.feeAgreementCode)
        agFeeAgreementItemList ? setDataSource(agFeeAgreementItemList) : null
        agFeeAgreementItemList ? setDataItem(agFeeAgreementItemList) : null
        agFeeAgreementItemList ? agFeeAgreementItemList.map((v, i) => {
            setComputingMethodData(v.agFeeContainerPriceList)
            setDateData(v.agFeeDateDetailList)
            setCallData(v.agFeeCallDetailList)
            setVshpData(v.agFeeVesselTeuDetailList)
            setVteuData(v.agFeeVesselTeuDetailList)
            setBlData(v.agFeeRateDetailList)
            setAggData(v.agFeeNaGroupDetailList)
        }) : null;
        let agFeeServiceGroupList = compileData.agFeeServiceGroupList
        agFeeServiceGroupList ? setairlineData([...agFeeServiceGroupList]) : []
        let agContainerSizeTypeGroupList = compileData.agContainerSizeTypeGroupList
        agContainerSizeTypeGroupList ? setCommissionAgmtCntrSizeTypeGroups(agContainerSizeTypeGroupList) : null
    }
    // tab切换
    const { TabPane } = Tabs;
    const callback = (key) => {
        setMessageData({})
        setDefaultKey(key);
    }
    //公司和代理编码的联动
    const companyIncident = async (value, all) => {
        queryForm.setFieldsValue({
            agencyCode: all.linkage.sapCustomerCode,
            subAgencyCode: all.linkage.sapCustomerCode,
        })
        let data = all.linkage.companyCode
        companyAgency($apiUrl, data, setAgencyCode)
        // console.log(all.linkage.companyCode, all.linkage, all.linkage.sapCustomerCode)
        let descript = await request($apiUrl.COMMON_SEARCH_AGENCY_DESCRIPTION, {
            method: 'POST',
            data: {
                params: all.linkage.companyCode
            }
        })
        if (descript.success) {
            queryForm.setFieldsValue({
                agencyDescription: descript.message,
            })
        }
    }

    //关闭弹框
    const handleCancel = () => {
        setMessageData({})
        setSizeDetailedTable([])
        setAIsModalVisible(false)
        // setItemUuidFlag('');
        setDefaultKey('1');
        queryForm.resetFields()
        queryForm.setFieldsValue({
            ...lastCondition,
            Date: [, moment(toDate)]
        })
        setChecked([])
        setSizeDetailedTable([])
        setDataSource([])
        setComputingMethodData([])
        setDateData([])
        setCallData([])
        setVshpData([])
        setVshpDataTow([])
        setVteuData([])
        setBlData([])
        setAggData([])
        setairlineData([])
        setAgreementHeadUuid(null)
        setFeeAgreementCode(null)
        setCompileData({})
        setButtonFlag(false)
        setCommissionAgmtCntrSizeTypeGroups([])
        setDisFlag(false)
        setDateFlag(false)
        setCallFlag(false)
        setVshpFlag(false)
        setVteuFlag(false)
        setBlFlag(false)
        setAggFlag(false)
        setAddData ? setAddData([]) : ''
        setMessageData({})
        setSubClassAll([])
        setCostKey([])
        setCompareDateFlag(false)
        setCompareCallFlag(false)
        setCompareVshpFlag(false)
        setCompareVteuFlag(false)
        setCompareBlFlag(false)
        setCompareAggFlag(false)
        setCompareDisFlag(false)
    }
    // console.log(saveSuccess)
    //全部保存
    const handleQuery = async (operat) => {
        setMessageData({})
        setSaveSuccess(false)
        setOperat(operat)
        // console.log(saveSuccess)
        const query = queryForm.getFieldsValue()
        if (!query.agencyCode || !query.subAgencyCode || !query.ygSide || !query.yfSide || !query.sfSide || !query.shipownerCompanyCode) {
            //船东，代理编码,开始日期,向谁预估,向谁开票,向谁报账不能为空   
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.agencyCode-fromDate-ygSide-yfSide-sfSide' }) })
        } else {
            if (query.ygSide.length > 10 || query.yfSide.length > 10 || query.sfSide.length > 10) {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-comm-save-mes-2' }) })
            } else {
                aggData.length > 0 ? aggData.map((v, i) => {
                    v.fromDate = v.fromDate ? momentFormat(v.fromDate) : null
                    v.toDate = v.toDate ? momentFormat(v.toDate) : null
                }) : null
                if (itemIndex) {
                    if (dataSource[itemdataIndex]) {
                        dataSource[itemdataIndex].agFeeCallDetailList = (calculationMethod == 'CALL' || calculationMethod == 'CALL2' || calculationMethod == 'MCALL' || calculationMethod == 'VOY' || calculationMethod == 'VOY2') || (comparecalculationMethod == 'CALL' || comparecalculationMethod == 'CALL2' || comparecalculationMethod == 'MCALL' || comparecalculationMethod == 'VOY' || comparecalculationMethod == 'VOY2') ? [...callData] : []
                        dataSource[itemdataIndex].agFeeContainerPriceList = (calculationMethod == 'CNT1' || calculationMethod == 'CNT2') || (comparecalculationMethod == 'CNT') ? [...computingMethodData] : []
                        dataSource[itemdataIndex].agFeeDateDetailList = (calculationMethod == 'DATE') || (comparecalculationMethod == 'DATE') ? [...dateData] : []
                        dataSource[itemdataIndex].agFeeNaGroupDetailList = (calculationMethod == 'AGG') || (comparecalculationMethod == 'AGG') ? [...aggData] : []
                        dataSource[itemdataIndex].agFeeRateDetailList = (calculationMethod == 'BL') || (comparecalculationMethod == 'BL') ? [...blData] : []
                        if (calculationMethod == 'VTEU' || compareComputingMethod == 'VTEU') {
                            dataSource[itemdataIndex].agFeeVesselTeuDetailList = [...vteuData]
                        }
                        (calculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'N') || (comparecalculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'N') ? dataSource[itemdataIndex].agFeeRateDetailList = [...vshpDataTow] : (calculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'Y') || (comparecalculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'Y') ? dataSource[itemdataIndex].agFeeVesselTeuDetailList = [...vshpData] : ''
                        tsIndicator == 'Y' ? dataSource[itemdataIndex].agFeeDetailPanList = [...rateData] : dataSource[itemdataIndex].agFeeDetailPanList = []
                        // dataSource[itemdataIndex].saveShowHide = false
                    }
                }
                newSizeDetailedTable.length > 0 ? newSizeDetailedTable.map((v, i) => {
                    v['feeAgreementCode'] = query.feeAgreementCode
                    v['agreementHeadUuid'] = agreementHeadUuid
                }) : null
                //箱型尺寸组明细数据
                let newData = [{
                    'agContainerSizeTypeGroupList': newSizeDetailedTable.length > 0 ? newSizeDetailedTable : undefined,
                    'agreementHeadUuid': query.containerSizeTypeGroup ? agreementHeadUuid : undefined,
                    'containerSizeTypeGroup': query.containerSizeTypeGroup ? query.containerSizeTypeGroup : undefined,
                    'feeAgreementCode': query.containerSizeTypeGroup ? query.feeAgreementCode : undefined
                }]
                //航线组
                if (airlineData.length > 0) {
                    for (let i = 0; i < airlineData.length; i++) {
                        airlineData[i]['agreementHeadUuid'] = agreementHeadUuid
                        airlineData[i]['feeAgreementCode'] = query.feeAgreementCode
                        airlineData[i].fromDate = airlineData[i].fromDate ? momentFormat(airlineData[i].fromDate) : ''
                        airlineData[i].toDate = airlineData[i].toDate ? momentFormat(airlineData[i].toDate) : ''
                        var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
                        var pa = /[\u4E00-\u9FA5]/g
                        console.log(pa.test(airlineData[i].serviceGroupCode), airlineData[i].serviceGroupCode)
                        if (patrn.test(airlineData[i].groupDescription) && patrn.test(airlineData[i].serviceGroupCode) || pa.test(airlineData[i].serviceGroupCode)) {// 如果包含特殊字符返回
                            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) + ',' + formatMessage({ id: 'lbl.afcm-00103' }) })
                            // if (patrn.test(airlineData[i].groupDescription) && patrn.test(airlineData[i].serviceGroupCode)) {// 如果包含特殊字符返回
                            //     setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) })
                        } else {
                            if (query.containerSizeTypeGroup) {
                                // setSaveSuccess(false)
                                for (let val = 0; val < newData.length; val++) {
                                    if (newData[val].containerSizeTypeGroup.length > 5) {
                                        setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0077' }) });
                                        return
                                    } else {
                                        // console.log(val)
                                        if (!saveSuccess) {
                                            baoc(operat, newData)
                                            break;
                                        }
                                    }
                                }
                            } else {
                                if (!saveSuccess) {
                                    baoc(operat, newData)
                                    break;
                                }
                            }
                        }
                    }
                    // airlineData.map((v, i) => {
                    //     v['agreementHeadUuid'] = agreementHeadUuid
                    //     v['feeAgreementCode'] = query.feeAgreementCode
                    //     v.fromDate = v.fromDate ? momentFormat(v.fromDate) : ''
                    //     v.toDate = v.toDate ? momentFormat(v.toDate) : ''
                    //     var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
                    //     if (patrn.test(v.groupDescription) && patrn.test(v.serviceGroupCode)) {// 如果包含特殊字符返回
                    //         setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) })
                    //     } else {
                    //         if(query.containerSizeTypeGroup){
                    //             setSaveSuccess(false)
                    //             for(let val=0;val<newData.length;val++){
                    //                 if (newData[val].containerSizeTypeGroup.length > 5) {
                    //                     setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0077' }) });
                    //                     return
                    //                 } else {
                    // console.log(val)
                    //                     if(!saveSuccess){
                    //                         baoc(operat, newData)
                    //                         break; 
                    //                     }
                    //                 }
                    //             }
                    //         }else{
                    //             if(!saveSuccess){
                    //                 baoc(operat, newData)
                    //                 break; 
                    //             }
                    //         }
                    //     }
                    // }) 
                } else if (dataSource.length > 0) {
                    for (let i = 0; i < dataSource.length; i++) {
                        dataSource[i].listAgTypeToClass = []
                        var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
                        if (patrn.test(i.heryCode)) {// 如果包含特殊字符返回
                            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) })
                        } else {
                            if (query.containerSizeTypeGroup) {
                                for (let val = 0; val < newData.length; val++) {
                                    if (newData[val].containerSizeTypeGroup.length > 5) {
                                        setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0077' }) });
                                        return
                                    } else {
                                        if (!saveSuccess) {
                                            baoc(operat, newData)
                                            break;
                                        }
                                    }
                                }
                            } else {
                                if (!saveSuccess) {
                                    baoc(operat, newData)
                                    break;
                                }
                            }
                        }
                    }
                } else if (query.containerSizeTypeGroup) {
                    for (let val = 0; val < newData.length; val++) {
                        if (newData[val].containerSizeTypeGroup.length > 5) {
                            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0077' }) });
                            return
                        } else {
                            if (!saveSuccess) {
                                baoc(operat, newData)
                                break;
                            }
                        }
                    }
                } else {
                    baoc(operat, newData)
                }
            }
        }
    }
    const baoc = async (operat, newData) => {
        // console.log(dataSource[itemdataIndex].saveShowHide)
        const query = queryForm.getFieldsValue()
        let str = query.companyCode ? query.companyCode : '';
        let ind = str.indexOf('-');
        let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
        addData.companyCode = we
        compileData.companyCode = we
        let compileDatas = compileData ? compileData : null
        setSpinflag(true)

        let save = await request($apiUrl.AG_FEE_AGMT_PRE_SAVE_SUBMIT, {
            method: "POST",
            data: {
                'paramsList': [{
                    ...addData,
                    ...compileDatas,
                    'companys': undefined,
                    'modifyFlag': undefined,
                    'agencyCode': query.agencyCode,
                    'companyCode': we,
                    'shipownerCompanyCode': query.shipownerCompanyCode,
                    'postCalculationFlag': query.postCalculationFlag,
                    'isBill': query.isBill,
                    'isYt': query.isYt,
                    'postMode': query.postMode,
                    'prdIndicator': query.prdIndicator,
                    'sfSide': query.sfSide,
                    'yfSide': query.yfSide,
                    'ygSide': query.ygSide,
                    'subAgencyCode': query.subAgencyCode,
                    'toDate': query.Date ? momentFormat(query.Date[1]) : null,
                    'fromDate': query.Date ? momentFormat(query.Date[0]) : null,
                    'recordCreateUser': recordCreateUser ? recordCreateUser : '',
                    'recordCreateDate': recordCreateDate ? recordCreateDate : '',
                    'feeAgreementCode': feeAgreementCode ? feeAgreementCode : undefined,
                    'agreementHeadUuid': agreementHeadUuid ? agreementHeadUuid : undefined,
                    'agencyDescription': query.agencyDescription,
                    'agFeeAgreementItemList': dataSource ? [...dataSource] : [],
                    'agFeeServiceGroupList': airlineData,
                    'agContainerSizeTypeGroupList': query.containerSizeTypeGroup ? [...newData] : null,
                }],
                operateType: operat
            }
        })

        setSaveSuccess(save.success)
        if (save.success) {
            setOperat(null)
            setNewSizeDetailedTable([])
            if (operat == 'SUBMIT') {
                setUnlockAuditFlag ? setUnlockAuditFlag(true) : ''
                Toast('', save.message, 'alert-error', 5000, false)
                handleCancel()
            } else {
                setShipperFlag(true)
                setCompyFlag ? setCompyFlag(false) : ''
                setMessageData({ alertStatus: 'alert-success', message: save.message })
                setSpinflag(false)
                setGroupFlag ? setGroupFlag(true) : null
                setItemFlag(true)
                setairlineFlag(true)
                let data = save.data
                resetBoxSize()
                if (data) {
                    queryForm.setFieldsValue({
                        "feeAgreementCode": data.feeAgreementCode,
                        Date: [moment(data.fromDate), moment(data.toDate)],
                    })
                    setRecordCreateDate(data.recordCreateDate)
                    setRecordCreateUser(data.recordCreateUser)
                    // console.log(queryForm.getFieldValue())
                    setAgreementHeadUuid(data.agreementHeadUuid)
                    setFeeAgreementCode(data.feeAgreementCode)
                    data.agFeeServiceGroupList.length > 0 ? setairlineData([...data.agFeeServiceGroupList]) : null
                    data.agContainerSizeTypeGroupList ? setCommissionAgmtCntrSizeTypeGroups(data.agContainerSizeTypeGroupList) : null
                    // console.log(dataSource)
                    if (dataSource) {
                        dataSource.map((v, i) => {
                            v.saveShowHide = false
                        })
                        data.agFeeAgreementItemList ? setDataSource([...data.agFeeAgreementItemList]) : null
                        data.agFeeAgreementItemList ? setDataItem([...data.agFeeAgreementItemList]) : null
                        // console.log(itemIndex, data)
                        let dataitem = data.agFeeAgreementItemList
                        // console.log(dataitem)
                        setChecked([])
                        emptyCalculationMethod()
                    }
                }
            }
        } else {
            setSpinflag(false)
            if (dataSource.length > 0) {
                let length = dataSource ? dataSource.length : 0
                let index = length - 1
                // console.log(dataSource[itemdataIndex].saveShowHide)
                if (dataSource[index].agreementItemUuid) {
                    if (itemdataIndex !== '' && itemdataIndex !== null && itemdataIndex !== undefined) {
                        dataSource[itemdataIndex].saveShowHide ? dataSource[itemdataIndex].saveShowHide = true : null
                    }
                }
            }
            setMessageData({ alertStatus: 'alert-error', message: save.errorMessage })
        }
    }
    //协议退回
    const agreementBack = async (operat) => {
        setMessageData({})
        setSpinflag(true)
        let back = await request($apiUrl.COMM_AGMT_AGMT_CANCEL, {
            method: "POST",
            data: {
                'uuid': agreementHeadUuid,
                'operateType': operat
            }
        })
        if (back.success) {
            //协议退回成功！！！！
            setAIsModalVisible(false)
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-success', message: back.message })
            setUnlockAuditFlag ? setUnlockAuditFlag(true) : ''
            handleCancel()
        } else {
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-error', message: back.errorMessage })
        }
    }
    useEffect(() => {
        airline()
        AIsModalVisible ? subcalss() : ''
    }, [AIsModalVisible])

    const costKe = async () => {
        setCostKey([])
        let itemAdd = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_ITEM_INIT, {
            method: "POST",
        })
        let itemAdds = itemAdd.data
        if (itemAdds) {
            let costs = itemAdds.listAgTypeToClass
            costs.map((v, i) => {
                v['value'] = v.feeCode
                v['label'] = v.feeCode + '(' + v.feeName + ')';
                // console.log(costKey,costs,costKey.length,costKey.length==costs.length)
                if (costKey.length < costs.length) {
                    costKey.push(v)
                }
            })
            setCostKey([...costKey])
        }

    }
    //全部费用小类
    const subcalss = () => {
        setSubClassAll([])
        if (costKey.length > 0) {
            setSubClassAll([])
            costKey.map((value, index) => {
                let xiaolei = value.listAgTypeToClass
                let a
                xiaolei.map((v, i) => {
                    v['value'] = v.feeCode
                    v['label'] = v.feeCode + '(' + v.feeName + ')';
                    subClassAll.push(v)
                })
                setSubClassAll([...subClassAll])
            })
        }
    }
    const airline = async () => {
        let airlines = await request($apiUrl.AG_FEE_AGMT_GROUP_INIT, {
            method: "POST",
            data: {
                uuid: agreementHeadUuid
            }
        })
        let airlineCodes = airlines.data
        setAirlineCode(airlineCodes)
    }


    //新增item
    const addItem = () => {
        setMessageData({})
        let length = dataSource ? dataSource.length : 0
        // console.log(length)
        if (length == 0) {
            setDataSource([])
            addItemFlags()
        } else {
            let index = length - 1
            // console.log('新增item', index)
            // setItemDataIndex(index)
            let itemid = dataSource[length - 1].agreementItemUuid
            // console.log(dataSource)
            // console.log(dataSource[length - 1])
            // console.log(itemid)
            itemid ? addItemFlags() : setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

        }

    }
    const addItemFlags = async () => {
        setSpinflag(true)
        let itemAdd = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_ITEM_INIT, {
            method: "POST",
        })
        if (itemAdd.success) {
            setSpinflag(false)
            // setSaveSuccess(false)
            let itemAdds = itemAdd.data
            itemAdds.id = dataSource ? dataSource.length + 1 : ''
            itemAdds.saveShowHide = true
            itemAdds.modifyFlag = 'Y'
            itemAdds.heryType = 'Agency'
            itemAdds.vatFlag = 'Y'
            itemAdds.tsIndicator = 'N'
            itemAdds.compareIndicator = 'N'
            itemAdds.feeClass = 'CGF'
            itemAdds.feeType = 'CGFE'
            itemAdds.listAgTypeToClass = []
            costKey.map((v, i) => {
                if (itemAdds.feeClass == v.feeCode) {
                    let list = v.listAgTypeToClass
                    list.map((v, i) => {
                        v['value'] = v.feeCode
                        v['label'] = v.feeCode + '(' + v.feeName + ')';
                    })
                    if (v.listAgTypeToClass.length == list.length) {
                        //    name=='feeClass'?record['feeType']='':record[name]=e
                        //    console.log(name,record[name],record.feeType,name=='feeClass'?record.feeType='':record[name]=e)
                        setSubclass('')
                        setSubclass(list)
                    } else {

                    }

                }
            })
            setMaxFlag(true);
            dataSource.push(itemAdds)
            // console.log(dataSource)
            setDataSource([...dataSource])
            setDataItem([...dataSource])
        } else {
            setSpinflag(false)
        }

    }
    //获取箱型尺寸
    const boxSizeGroup = async () => {
        let itemAdd = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_CNT_INIT, {
            method: "POST",
            data: {
                "uuid": agreementHeadUuid
            }
        })
        if (itemAdd.success) {
            let datas = itemAdd.data
            if (datas.containerSizeTypeGroupListBean) {
                let data = datas.containerSizeTypeGroupListBean
                // console.log(data)
                data.unshift({
                    containerSizeTypeGroup: '*',
                })
                data.map((v, i) => {
                    v['value'] = v.containerSizeTypeGroup
                    v['label'] = v.containerSizeTypeGroup
                })
                setContainerSizeTypeGroup(data)
            }
        } else {
            let data = [{
                value: '*',
                label: '*',
            }]
            setContainerSizeTypeGroup(data)
        }
    }

    const [openBoxSizedetailIndex, setOpenBoxSizedetailIndex] = useState()
    const boxSizeref = React.useRef()
    //展开左侧箱型尺寸详情
    const openBoxSizedetail = (index) => {
        setOpenBoxSizedetailIndex(index)
        if (openBoxSizedetailIndex == index) {
            setOpenBoxSizedetailIndex()
        }
        boxSizeref.current.scrollTo(0, index * 20)
    }

    //表格的下拉框onchange事件
    const [modifyFlagSele, setModifyFlagSele] = useState('')
    const getCommonSelectVal = (e, record, name, index) => {
        record[name] = e
        // console.log(name, e)
        if (name == 'compareIndicator') {
            if (record.compareIndicator == 'Y') {
                setMaxFlag(false);
                acquireSelectData('AFCM.AGMT.CALC.MODES.CALCMODES', setChooseBigCharge, $apiUrl)
            } else {
                setMaxFlag(true);
                record.compareCalculationMethod = ''
                dataSource[index].compareCalculationMethod = ''
            }
            if (index == indexRadio) {
                emptyCalculationMethod()
                setChecked([])
            }
        } else if (name == 'tsIndicator') {
            if (index == indexRadio) {
                // if(record.tsIndicator == 'N'){
                //     setChecked([])
                //     setCompareDateFlag(false)
                //     setCompareCallFlag(false)
                //     setCompareVshpFlag(false)
                //     setCompareVteuFlag(false)
                //     setCompareBlFlag(false)
                //     setCompareAggFlag(false)
                //     setCompareDisFlag(false)
                //     //计算方法
                //     setDateFlag(false)
                //     setCallFlag(false)
                //     setVshpFlag(false)
                //     setVteuFlag(false)
                //     setBlFlag(false)
                //     setAggFlag(false)
                //     setDisFlag(false)
                //     //特殊费率
                //     setRateFlag(false)
                // }
                emptyCalculationMethod()
                setChecked([])
            }
        }

        // name == 'compareIndicator'
        //费用大类和费用小类联动
        if (name == 'feeClass') {
            // record['feeType'] = ''
            // if(index == indexRadio) {
            costKey.map((v, i) => {
                if (e == v.feeCode) {
                    let list = v.listAgTypeToClass
                    list.map((v, i) => {
                        v['value'] = v.feeCode
                        v['label'] = v.feeCode + '(' + v.feeName + ')';
                    })
                    if (v.listAgTypeToClass.length == list.length) {
                        // console.log(name,record[name],record.feeType,name=='feeClass'?record.feeType=null:record[name]=e)
                        setSubclass('')
                        setSubclass(list)
                    } else {

                    }

                }
            })
            // if(editFeeClass!=record.feeCalss){
            //     setFeeTypeFlag(false)
            // }
            // }

        }
        // console.log(record.calculationMethod == 'VSHP' , index == indexRadio,index ,indexRadio)

        //选中的计算方法是VSHP并且修改是否阶梯费率的时候更改VSHP这个计算表格
        if (record.calculationMethod == 'VSHP' && index == indexRadio) {
            if (name == 'modifyFlag') {
                // alert(1)
                emptyCalculationMethod()
                setChecked([])
            }
        }
        //择大计算方法
        if (name == 'compareCalculationMethod') {
            // console.log(index ,itemdataIndex,index == itemdataIndex)
            // 
            if (index == indexRadio) {
                // 
                if (record.compareCalculationMethod != comparecalculationMethod) {
                    // 
                    setChecked([])
                    emptyCalculationMethod()
                }

            }
            setCompareCalculationMethod(record.compareCalculationMethod)
        }
    }
    // console.log('择大计算方法',comparecalculationMethod)
    //计算方法的onchange事件
    const getCommonSelectVals = (e, record, name, index) => {
        record[name] = e
        // console.log(index, itemdataIndex,record)
        // setItemDataIndex(index)
        // setItemIndex(record.agreementItemUuid)
        if (index == indexRadio) {
            if (calculationMethod) {
                if (record.calculationMethod != calculationMethod) {
                    setChecked([])
                    emptyCalculationMethod()
                }
                if (calculationMethodRadio == 'VTEU' && record.calculationMethod == 'VTEU') {
                    record.agFeeVesselTeuDetailList.length > 0 ? setVteuData(record.agFeeVesselTeuDetailList) : null
                } else {
                    setVteuData([])
                }
                // console.log(calculationMethodRadio,record.calculationMethod)
                if (calculationMethodRadio == 'VSHP' && record.calculationMethod == 'VSHP') {
                    if (modifyFlagSele) {
                        if (modifyFlagSele != record.modifyFlag) {
                            setVshpData([])
                            setVshpDataTow([])
                        } else {
                            if (record.modifyFlag == 'Y') {
                                record.agFeeVesselTeuDetailList.length > 0 ? setVshpData(record.agFeeVesselTeuDetailList) : null
                            } else {
                                record.agFeeRateDetailList.length > 0 ? setVshpDataTow(record.agFeeRateDetailList) : null

                            }
                        }
                    } else {
                        if (record.modifyFlag == 'Y') {
                            record.agFeeVesselTeuDetailList.length > 0 ? setVshpData(record.agFeeVesselTeuDetailList) : null
                        } else {
                            record.agFeeRateDetailList.length > 0 ? setVshpDataTow(record.agFeeRateDetailList) : null
                        }
                    }
                }
            }
        }
        setCalculationMethod(record.calculationMethod)
        // console.log(dataSource[index])
    }
    //input框的onchange事件
    const getCommonInputVal = (e, record, name) => {
        e ? e.target ? record[name] = e.target.value : record[name] = e : record[name] = e
        name == 'tsIndicator' ? setTsIndicator(e.target.value) : ''

    }
    //时间选择框的onchange事件
    const getCommonDateVal = (record, e, name) => {
        // console.log(e)
        if (e) {
            let da = e._d ? momentFormat(e._d) : null
            record[name] = da
        } else {
            record[name] = null
        }

    }
    //箱型量法新增item
    const addItemDetailed = async (compare) => {
        setMessageData({})
        let length = computingMethodData ? computingMethodData.length : 0
        // console.log(length)
        if (length == 0) {
            setComputingMethodData([])
            setSpinflag(true)
            let itemAdd = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_CNT_INIT, {
                method: "POST",
                data: {
                    "uuid": agreementHeadUuid
                }
            })
            if (itemAdd.success) {
                let datas = itemAdd.data
                setSpinflag(false)
                // setSaveSuccess(false)
                if (datas.containerSizeTypeGroupListBean) {
                    let data = datas.containerSizeTypeGroupListBean
                    data.unshift({
                        containerSizeTypeGroup: '*',
                    })
                    data.map((v, i) => {
                        v['value'] = v.containerSizeTypeGroup
                        v['label'] = v.containerSizeTypeGroup
                    })
                    setContainerSizeTypeGroup(data)
                } else {
                    let data = [{
                        value: '*',
                        label: '*',
                    }]
                    setContainerSizeTypeGroup(data)
                }
                datas.unitPrice = '0.0'
                datas.containerSizeTypeGroup = '*'
                datas.transmitIndicator = '*'
                datas.emptyFullIndicator = '*'
                // if(compare){
                //     compareComputingMethodData.push(datas)
                //     datas.saveShowHide = true
                //     setCompareComputingMethodData([...compareComputingMethodData])
                // }else{
                computingMethodData.push(datas)
                datas.saveShowHide = true
                setComputingMethodData([...computingMethodData])
                // }
                // if(!computingMethodData.containerSizeTypeGroup&&!containerSizeTypeGroup.containerSizeTypeGroupList&&!containerSizeTypeGroup.emptyFullIndicator){
                //     setOperandSaveFlag(true)
                // } 
            } else {
                setSpinflag(false)
                setMessageData({ alertStatus: 'alert-error', message: itemAdd.errorMessage })
            }
        } else {
            let index = length - 1
            // console.log('箱型量法新增item', index)
            // setItemDataIndex(index)
            let itemid = computingMethodData[length - 1].agreementItemUuid
            if (itemid) {
                setSpinflag(true)
                let itemAdd = await request($apiUrl.AG_FEE_AGMT_PRE_NEW_CNT_INIT, {
                    method: "POST",
                    data: {
                        "uuid": agreementHeadUuid
                    }
                })
                if (itemAdd.success) {
                    setSpinflag(false)
                    // setSaveSuccess(false)
                    let datas = itemAdd.data
                    if (datas.containerSizeTypeGroupListBean) {
                        let data = datas.containerSizeTypeGroupListBean
                        data.unshift({
                            containerSizeTypeGroup: '*',
                        })
                        data.map((v, i) => {
                            v['value'] = v.containerSizeTypeGroup
                            v['label'] = v.containerSizeTypeGroup
                        })
                        setContainerSizeTypeGroup(data)
                    } else {
                        let data = [{
                            value: '*',
                            label: '*',
                        }]
                        setContainerSizeTypeGroup(data)
                    }
                    datas.unitPrice = '0.0'
                    datas.containerSizeTypeGroup = '*'
                    datas.transmitIndicator = '*'
                    datas.emptyFullIndicator = '*'
                    // if(compare){
                    //     compareComputingMethodData.push(datas)
                    //     datas.saveShowHide = true
                    //     setCompareComputingMethodData([...compareComputingMethodData])
                    // }else{
                    computingMethodData.push(datas)
                    datas.saveShowHide = true
                    setComputingMethodData([...computingMethodData])
                    // }
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: itemAdd.errorMessage })
                }
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })
            }


        }

    }
    //新增表格保存
    const itemSave = async (record, index) => {
        setMessageData({})
        record.agreementHeadUuid = agreementHeadUuid
        record.feeAgreementCode = queryForm.getFieldValue().feeAgreementCode
        if (!record.vesselIndicator) {
            record.vesselIndicator = '*'
        }
        if (!record.agreementItemUuid || record.calculationMethod != calculationMethod) {
            setComputingMethodData([])
            setDateData([])
            setCallData([])
            setVshpData([])
            setVshpDataTow([])
            setVteuData([])
            setBlData([])
            setAggData([])
        } else if (record.modifyFlag == 'Y') {
            setVshpDataTow([])
        } else if (record.modifyFlag == 'N') {
            setVshpData([])
        }

        if (itemIndex) {
            if (dataSource[index]) {
                dataSource[index].agFeeCallDetailList = (calculationMethod == 'CALL' || calculationMethod == 'CALL2' || calculationMethod == 'MCALL' || calculationMethod == 'VOY' || calculationMethod == 'VOY2') || (comparecalculationMethod == 'CALL' || comparecalculationMethod == 'CALL2' || comparecalculationMethod == 'MCALL' || comparecalculationMethod == 'VOY' || comparecalculationMethod == 'VOY2') ? [...callData] : []
                dataSource[index].agFeeContainerPriceList = (calculationMethod == 'CNT1' || calculationMethod == 'CNT2') || (comparecalculationMethod == 'CNT') ? [...computingMethodData] : []
                dataSource[index].agFeeDateDetailList = (calculationMethod == 'DATE') || (comparecalculationMethod == 'DATE') ? [...dateData] : []
                dataSource[index].agFeeNaGroupDetailList = (calculationMethod == 'AGG') || (comparecalculationMethod == 'AGG') ? [...aggData] : []
                dataSource[index].agFeeRateDetailList = (calculationMethod == 'BL') || (comparecalculationMethod == 'BL') ? [...blData] : []
                if (calculationMethod == 'VTEU' || compareComputingMethod == 'VTEU') {
                    dataSource[index].agFeeVesselTeuDetailList = [...vteuData]
                }
                (calculationMethod == 'VSHP' && record.modifyFlag == 'N') || (comparecalculationMethod == 'VSHP' && record.modifyFlag == 'N') ? dataSource[index].agFeeRateDetailList = [...vshpDataTow] : (calculationMethod == 'VSHP' && record.modifyFlag == 'Y') || (comparecalculationMethod == 'VSHP' && record.modifyFlag == 'Y') ? dataSource[index].agFeeVesselTeuDetailList = [...vshpData] : ''
                tsIndicator == 'Y' ? dataSource[index].agFeeDetailPanList = [...rateData] : dataSource[index].agFeeDetailPanList = []
                dataSource[index].saveShowHide = false
                // agFeeAgreementItemList
            }
        }
        var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
        if (patrn.test(dataSource[index].heryCode)) {// 如果包含特殊字符返回
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) })
        } else {
            setSpinflag(true)
            const dataaddItem = await request($apiUrl.AG_FEE_AGMT_SAVE_ITEM, {
                method: 'POST',
                data: {
                    'params': dataSource[index],
                    // 'params':{
                    //     "agreementHeadUuid":record.agreementHeadUuid,
                    //     'feeAgreementCode':record.feeAgreementCode,
                    //     'heryCode':record.heryCode,
                    //     'heryType':record.heryType,
                    //     'feeType':record.feeType,
                    //     'vesselIndicator':record.vesselIndicator,
                    //     'calculationMethod':record.calculationMethod,
                    //     'compareIndicator':record.compareIndicator,
                    //     'compareCalculationMethod':record.compareCalculationMethod,
                    //     'tsIndicator':record.tsIndicator,
                    //     'vatFlag':record.vatFlag,
                    //     'modifyFlag':record.modifyFlag,
                    //     'agFeeCallDetailList':record.calculationMethod=='CALL'||record.calculationMethod=='CALL2'||record.calculationMethod=='MCALL'||record.calculationMethod=='VOY'||record.calculationMethod=='VOY2'?[...callData]:[],
                    //     'agFeeContainerPriceList':record.calculationMethod=='CNT1'||record.calculationMethod=='CNT2'?[...computingMethodData]:[],
                    //     'agFeeDateDetailList':record.calculationMethod=='DATE'?[...dateData]:[],
                    //     'agFeeNaGroupDetailList':record.calculationMethod=='AGG'?[...aggData]:[],
                    //     'agFeeRateDetailList':record.calculationMethod=='BL'?[...blData]:[],
                    //     'agFeeVesselTeuDetailList':agFeeVesselTeuDetailList,
                    //     'agreementItemUuid':record.agreementItemUuid?record.agreementItemUuid:'',
                    //     saveShowHide:false
                    // }
                }
            })
            if (dataaddItem.success) {
                setSpinflag(false)
                setMessageData({ alertStatus: 'alert-success', message: dataaddItem.message })
                setItemFlag(true)
                console.log(dataSource)
                dataSource[index].saveShowHide = false
                let datas = dataaddItem.data.data
                dataSource[index] = datas
                datas.tsIndicator = datas.tsIndicator == null ? null : datas.tsIndicator + ''
                datas.compareIndicator = datas.compareIndicator == null ? null : datas.compareIndicator + ''
                datas.modifyFlag = datas.modifyFlag == null ? null : datas.modifyFlag + ''
                datas.vatFlag = datas.vatFlag == null ? null : datas.vatFlag + ''
                datas.calculationMethod = datas.calculationMethod + ''
                datas.compareCalculationMethod = datas.compareCalculationMethod == null ? null : datas.compareCalculationMethod + ''
                datas.feeClass = record.feeClass + ''
                datas.feeType = record.feeType + ''
                datas.saveShowHide = false
                dataSource[index].agreementItemUuid = datas.agreementItemUuid
                // console.log(dataSource[index],dataSource[index].tsIndicator)
                console.log(dataSource)
                setDataSource([...dataSource])
                console.log(dataSource, index)
                setModifyFlagSele(dataSource[index].modifyFlag)//保存成功后存储最新的是否阶梯费率
                emptyCalculationMethod()
                setChecked([])
            } else {
                setSpinflag(false)
                dataSource[index].saveShowHide = true
                setMessageData({ alertStatus: 'alert-error', message: dataaddItem.errorMessage })
            }
        }
    }

    //计算方法表格保存
    const calculateSave = async (index, record, property) => {
        setMessageData({})
        if (property == 'operand') {
            if (!record.emptyFullIndicator || !record.transmitIndicator || !record.containerSizeTypeGroup || record.unitPrice == null) {
                //空重箱标志/进口|出口|中转/ 箱型尺寸组 都不能为空
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.empty-cator-container-must-enter' }) })
            } else {
                setSpinflag(true)
                let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                    'method': "POST",
                    'data': {
                        'params': {
                            // 'agreementHeadUuid':agreementHeadUuid,
                            'agreementHeadUuid': agreementHeadUuid,
                            'agreementItemUuid': agreementItemUuid,
                            'feeAgreementCode': feeAgreementCode,
                            'agFeeContainerPriceList': [{
                                'feeAgreementCode': feeAgreementCode,
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': agreementItemUuid,
                                'emptyFullIndicator': record.emptyFullIndicator,
                                'transmitIndicator': record.transmitIndicator,
                                'containerSizeTypeGroup': record.containerSizeTypeGroup,
                                'feeCurrencyCode': record.feeCurrencyCode,
                                'socIndicator': record.socIndicator,
                                'unitPrice': record.unitPrice,
                                'unitPriceType': record.unitPriceType,
                                'cargoProperty': record.cargoProperty,
                                'agreementContainerPriceUuid': record.agreementContainerPriceUuid,
                                'versionId': record.versionId
                            }],
                        }
                    }
                })
                if (countData.success) {
                    setSpinflag(false)
                    let data = countData.data.data.agFeeContainerPriceList
                    // computingMethodData[index].methodUuid = data[0].agreementContainerPriceUuid
                    // computingMethodData[index].agreementContainerPriceUuid = data[0].agreementContainerPriceUuid
                    computingMethodData[index] = data[0]
                    computingMethodData[index].saveShowHide = false
                    setMessageData({ alertStatus: 'alert-success', message: countData.message })
                    dataSource.map((v, i) => {
                        v.agFeeContainerPriceList = computingMethodData
                    })
                    setComputingMethodData([...computingMethodData])
                    // setOperandSaveFlag(false)
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })
                }
            }
        } else if (property === 'VSHP') {
            if (dataSource[itemdataIndex].modifyFlag == 'Y') {
                if (record.startTeu == null || record.endTeu == null || record.feePrice == null) {
                    //船舶吨位起算点，船舶吨位截止点，单价不能为空
                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.startTeu-Cant-empty' }) })
                } else {
                    calculateSaves(index, record, property)
                }
            } else {
                if (record.feePrice == null) {
                    //单价不能为空
                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0039' }) })
                } else {
                    calculateSaves(index, record, property)
                }
            }
        } else if (property === 'VTEU') {
            if (record.startTeu == null || record.endTeu == null || record.feePrice == null) {
                //船舶吨位起算点，船舶吨位截止点，单价不能为空
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.startTeu-Cant-empty' }) })
            } else {
                setSpinflag(true)
                let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                    'method': "POST",
                    'data': {
                        'params': {
                            'agreementHeadUuid': agreementHeadUuid,
                            'agreementItemUuid': agreementItemUuid,
                            'feeAgreementCode': feeAgreementCode,
                            'agFeeVesselTeuDetailList': [{
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': agreementItemUuid,
                                'feeAgreementCode': feeAgreementCode,
                                'agreementVesselTeuDetailUuid': record.agreementVesselTeuDetailUuid,
                                'startTeu': record.startTeu,
                                'endTeu': record.endTeu,
                                'feeCurrencyCode': record.feeCurrencyCode,
                                'feePrice': record.feePrice,
                                'versionId': record.agreementVesselTeuDetailUuid ? record.versionId : '0'
                            }],
                            // 'agreementHeadUuid':agreementHeadUuid,
                        }
                    }
                })
                if (countData.success) {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-success', message: countData.message })
                    let data = countData.data.data.agFeeVesselTeuDetailList
                    vteuData[index] = data[0]
                    // vteuData[index].saveShowHide=false
                    dataSource.map((v, i) => {
                        v.agFeeVesselTeuDetailList = vteuData
                    })
                    setVteuData([...vteuData])
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })
                }
            }
        } else if (property == 'CALL/CALL2/MCALL/VOY/VOY2') {
            if (record.callNumber == null || record.feePrice == null) {
                //挂港次数，单价不能为空！！！！
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Port-number-cannot-be-empty' }) })
            } else {
                setSpinflag(true)
                let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                    'method': "POST",
                    'data': {
                        'params': {
                            'agreementHeadUuid': agreementHeadUuid,
                            'agreementItemUuid': agreementItemUuid,
                            'feeAgreementCode': feeAgreementCode,
                            'agFeeCallDetailList': [{
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': agreementItemUuid,
                                'feeAgreementCode': feeAgreementCode,
                                'agreementCallDetailUuid': record.agreementCallDetailUuid,
                                'callNumber': record.callNumber,
                                'feePrice': record.feePrice,
                                'feeCurrencyCode': record.feeCurrencyCode,
                            }],
                            // 'agreementHeadUuid':agreementHeadUuid,
                        }

                    }
                })
                if (countData.success) {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-success', message: countData.message })
                    let data = countData.data.data
                    let affcallData = data.agFeeCallDetailList
                    callData[index] = affcallData[0]
                    dataSource.map((v, i) => {
                        v.agFeeCallDetailList = callData
                    })
                    setCallData([...callData])
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })
                }
            }

        } else if (property == 'AGG') {
            if (!record.groupCode || record.startTeu == null || !record.fromDate || !record.toDate || record.endTeu == null || record.unitPrice == null) {
                //分组号码/箱量起算点/箱量累进起始日期，箱量截止点，TEU单价/不能为空
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.groupCode-startTeu-fromDate' }) })
            } else {
                setSpinflag(true)
                let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                    'method': "POST",
                    'data': {
                        'params': {
                            'agreementHeadUuid': agreementHeadUuid,
                            'agreementItemUuid': agreementItemUuid,
                            'feeAgreementCode': feeAgreementCode,
                            'agFeeNaGroupDetailList': [{
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': agreementItemUuid,
                                'feeAgreementCode': feeAgreementCode,
                                'groupCode': record.groupCode,
                                'startTeu': record.startTeu,
                                'endTeu': record.endTeu,
                                'fromDate': record.fromDate ? momentFormat(record.fromDate) : null,
                                'toDate': record.toDate ? momentFormat(record.toDate) : null,
                                'unitPrice': record.unitPrice,
                                'feeCurrencyCode': record.feeCurrencyCode,
                                'unitPriceType': record.unitPriceType,
                                'agreementNaGroupDetailUuid': record.agreementNaGroupDetailUuid,
                                'versionId': record.versionId
                            }],
                            //     'agreementHeadUuid':agreementHeadUuid,
                        }
                    }
                })
                if (countData.success) {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-success', message: countData.message })
                    let data = countData.data.data.agFeeNaGroupDetailList
                    // data?data.map((v,i)=>{
                    //     v.fromDate = moment(v.fromDate)
                    //     v.toDate = moment(v.toDate)
                    // }):null
                    aggData[index] = data[0]
                    dataSource.map((v, i) => {
                        v.agFeeNaGroupDetailList = aggData
                    })
                    setAggData([...aggData])
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })
                }
            }
        } else if (property == 'DATE') {
            if (!record.calculationPeriod || record.feePrice == null) {
                //时间周期，单价不能为空
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.The-time-period-cannot-be-empty' }) })
            } else {
                setSpinflag(true)
                let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                    'method': "POST",
                    'data': {
                        'params': {
                            'agreementHeadUuid': agreementHeadUuid,
                            'agreementItemUuid': agreementItemUuid,
                            'feeAgreementCode': feeAgreementCode,
                            'agFeeDateDetailList': [{
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': agreementItemUuid,
                                'feeAgreementCode': feeAgreementCode,
                                'agreementDateDetailUuid': record.agreementDateDetailUuid,
                                'calculationPeriod': record.calculationPeriod,
                                'feeCurrencyCode': record.feeCurrencyCode,
                                'feePrice': record.feePrice,

                            }],
                            // 'agreementHeadUuid':agreementHeadUuid,
                        }
                    }
                })
                if (countData.success) {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-success', message: countData.message })
                    let data = countData.data.data.agFeeDateDetailList
                    data ? data.map((v, i) => {
                        v.feePrice = v.feePrice == '0' ? v.feePrice + '.00' : v.feePrice
                    }) : ''
                    dateData[index] = data[0]
                    dataSource.map((v, i) => {
                        v.agFeeDateDetailList = dateData
                    })
                    setDateData([...dateData])
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })

                }
            }
        } else if (property == 'BL') {
            if (record.feePrice == null) {
                //单价不能为空
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0039' }) })
            } else {
                setSpinflag(true)
                let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                    'method': "POST",
                    'data': {
                        'params': {
                            'agreementHeadUuid': agreementHeadUuid,
                            'agreementItemUuid': agreementItemUuid,
                            'feeAgreementCode': feeAgreementCode,
                            'agFeeRateDetailList': [{
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': agreementItemUuid,
                                'feeAgreementCode': feeAgreementCode,
                                'agreementRateDetailUuid': record.agreementRateDetailUuid,
                                'feePrice': record.feePrice,
                                'feeCurrencyCode': record.feeCurrencyCode,

                            }],
                            // 'agreementHeadUuid':agreementHeadUuid,
                        }
                    }
                })
                if (countData.success) {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-success', message: countData.message })
                    let data = countData.data.data.agFeeRateDetailList
                    blData[index] = data[0]
                    dataSource.map((v, i) => {
                        v.agFeeRateDetailList = blData
                    })
                    setBlData([...blData])
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })
                }
            }
        }
    }
    //
    const calculateSaves = async (index, record, property) => {
        setSpinflag(true)
        let countData = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
            'method': "POST",
            'data': {
                'params': {
                    'agreementHeadUuid': agreementHeadUuid,
                    'agreementItemUuid': agreementItemUuid,
                    'feeAgreementCode': feeAgreementCode,
                    'agFeeVesselTeuDetailList': dataSource[itemdataIndex].modifyFlag == 'Y' && property == 'VSHP' ? [{
                        'agreementHeadUuid': agreementHeadUuid,
                        'agreementItemUuid': agreementItemUuid,
                        'feeAgreementCode': feeAgreementCode,
                        'agreementVesselTeuDetailUuid': record.agreementVesselTeuDetailUuid,
                        'startTeu': record.startTeu,
                        'endTeu': record.endTeu,
                        'feeCurrencyCode': record.feeCurrencyCode,
                        'feePrice': record.feePrice,
                        'versionId': record.agreementVesselTeuDetailUuid ? record.versionId : '0'
                    }] : [],
                    'agFeeRateDetailList': dataSource[itemdataIndex].modifyFlag == 'N' && property == 'VSHP' ? [{
                        'agreementHeadUuid': agreementHeadUuid,
                        'agreementItemUuid': agreementItemUuid,
                        'feeAgreementCode': feeAgreementCode,
                        'agreementRateDetailUuid': record.agreementRateDetailUuid,
                        'feePrice': record.feePrice,
                        'feeCurrencyCode': record.feeCurrencyCode,
                        'versionId': record.agreementVesselTeuDetailUuid ? record.versionId : '0'
                    }] : []
                }
            }
        })
        if (countData.success) {
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-success', message: countData.message })
            if (dataSource[itemdataIndex].modifyFlag == 'Y') {
                let data = countData.data.data.agFeeVesselTeuDetailList
                vshpData[index] = data[0]
                vshpData[index].saveShowHide = false
                // console.log(vshpData)
                dataSource.map((v, i) => {
                    v.agFeeVesselTeuDetailList = vshpData
                })
                setVshpData([...vshpData])
            } else {
                let data = countData.data.data.agFeeRateDetailList
                // console.log(data)
                vshpDataTow[index] = data[0]
                // vshpDataTow[index].saveShowHide=false
                // console.log(vshpDataTow)
                dataSource.map((v, i) => {
                    v.agFeeRateDetailList = vshpDataTow
                })
                setVshpDataTow([...vshpDataTow])
            }
        } else {
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-error', message: countData.errorMessage })

        }
    }

    //时间(DATE)计算方法新增item
    const dateaddItem = (compare) => {
        setMessageData({})
        // setSaveSuccess(false)
        let length = dateData ? dateData.length : 0
        // console.log(length)
        if (length == 0) {
            setDateData([])
            let data = {
                'calculationPeriod': null,
                'feeCurrencyCode': null,
                'feePrice': '0.0',
                'saveShowHide': true
            }
            dateData.push(data)
            setDateData([...dateData])
        } else {
            let itemid = dateData[length - 1].methodUuid
            // console.log(itemid)
            if (itemid) {
                let data = {
                    'calculationPeriod': null,
                    'feeCurrencyCode': null,
                    'feePrice': '0.0',
                    'saveShowHide': true
                }
                dateData.push(data)
                setDateData([...dateData])
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })
            }
        }
    }

    //CALL/CALL2/MCALL/VOY/VOY2 计算方法新增item 
    const calladdItem = (compare) => {
        setMessageData({})
        // setSaveSuccess(false)
        let length = callData ? callData.length : 0
        if (length == 0) {
            setCallData([])
            let data = {
                'callNumber': '0',
                'feeCurrencyCode': '',
                'feePrice': '0.0',
                'saveShowHide': true
            }
            callData.push(data)
            setCallData([...callData])


        } else {
            let itemid = callData[length - 1].methodUuid
            // console.log(itemid)
            if (itemid) {
                let data = {
                    'callNumber': '0',
                    'feeCurrencyCode': '',
                    'feePrice': '0.0',
                    'saveShowHide': true
                }
                callData.push(data)
                setCallData([...callData])
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

            }
        }

    }
    //船舶吨位法(VSHP)计算方法新增item 
    const vshpaddItem = (compare) => {
        setMessageData({})
        // setSaveSuccess(false)
        // console.log(dataSource[itemdataIndex].modifyFlag)
        if (dataSource[itemdataIndex].modifyFlag == 'Y') {
            let length = vshpData ? vshpData.length : 0
            if (length == 0) {
                setVshpData([])
                let data = {
                    'startTeu': '0',
                    'endTeu': '0',
                    'feeCurrencyCode': '',
                    'feePrice': '0.0',
                    'saveShowHide': true
                }
                // console.log(vteuData)
                let datas = []
                datas.push(data)
                setVshpData([...datas])
                // console.log(vteuData)
            } else {
                let itemid = vshpData[length - 1].methodUuid
                if (itemid) {
                    let data = {
                        'startTeu': '0',
                        'endTeu': '0',
                        'feeCurrencyCode': '',
                        'feePrice': '0.0',
                        'saveShowHide': true
                    }
                    vshpData.push(data)
                    setVshpData([...vshpData])
                } else {
                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

                }
            }
        } else {
            let length = vshpDataTow ? vshpDataTow.length : 0
            if (length == 0) {
                setVshpDataTow([])
                let data = {
                    'startTeu': '0',
                    'endTeu': '0',
                    'feeCurrencyCode': '',
                    'feePrice': '0.0',
                    'saveShowHide': true
                }
                // console.log(vteuDataTow)
                let datas = []
                datas.push(data)
                setVshpDataTow([...datas])
                // console.log(vteuDataTow)
            } else {
                let itemid = vshpDataTow[length - 1].methodUuid
                if (itemid) {
                    let data = {
                        'startTeu': '0',
                        'endTeu': '0',
                        'feeCurrencyCode': '',
                        'feePrice': '0.0',
                        'saveShowHide': true
                    }
                    vshpDataTow.push(data)
                    setVshpDataTow([...vshpDataTow])
                } else {
                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

                }
            }
        }

    }

    //VTEU计算方法新增item 
    const vteuaddItem = (compare) => {
        setMessageData({})
        // setSaveSuccess(false)
        let length = vteuData ? vteuData.length : 0
        if (length == 0) {
            setVteuData([])
            let data = {
                'startTeu': '0',
                'endTeu': '0',
                'feeCurrencyCode': '',
                'feePrice': '0.0',
                'saveShowHide': true
            }
            vteuData.push(data)
            setVteuData([...vteuData])

        } else {
            let itemid = vteuData[length - 1].methodUuid
            if (itemid) {
                let data = {
                    'startTeu': '0',
                    'endTeu': '0',
                    'feeCurrencyCode': '',
                    'feePrice': '0.0',
                    'saveShowHide': true
                }
                vteuData.push(data)
                setVteuData([...vteuData])
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

            }
        }


    }

    //提单法(BL)计算方法新增item 
    const bladdItem = (compare) => {
        setMessageData({})
        // setSaveSuccess(false)
        let length = blData ? blData.length : 0
        if (length == 0) {
            setBlData([])
            let data = {
                'feeCurrencyCode': '',
                'feePrice': '0.0000',
                'saveShowHide': true
            }
            blData.push(data)
            setBlData([...blData])
        } else {
            let itemid = blData[length - 1].methodUuid
            // console.log(itemid)
            if (itemid) {
                let data = {
                    'feeCurrencyCode': '',
                    'feePrice': '0.0000',
                    'saveShowHide': true
                }
                blData.push(data)
                setBlData([...blData])
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

            }
        }


    }

    //北美新增item
    const aggaddItem = (compare) => {
        setMessageData({})
        // setSaveSuccess(false)
        let length = aggData ? aggData.length : 0
        if (length == 0) {
            setAggData([])
            let data = {
                'groupCode': '',
                'startTeu': '0.0',
                'endTeu': '0.0',
                'fromDate': '',
                'toDate': '',
                'unitPrice': '0.0',
                'feeCurrencyCode': '',
                'unitPriceType': '',
                'saveShowHide': true
            }
            aggData.push(data)
            setAggData([...aggData])

        } else {
            let itemid = aggData[length - 1].methodUuid
            // console.log(itemid)
            if (itemid) {
                let data = {
                    'groupCode': '',
                    'startTeu': '0.0',
                    'endTeu': '0.0',
                    'fromDate': '',
                    'toDate': '',
                    'unitPrice': '0.0',
                    'feeCurrencyCode': '',
                    'unitPriceType': '',
                    'saveShowHide': true
                }
                aggData.push(data)
                setAggData([...aggData])
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

            }
        }


    }

    // 特殊费率新增
    const rateaddItem = () => {
        setMessageData({})
        // setSaveSuccess(false)
        let length = rateData ? rateData.length : 0
        if (length == 0) {
            setRateData([])
            let data = {
                'startTeu': '0',
                'endTeu': '0',
                'feePrice': '0.0',
                'feeCurrencyCode': '',
                'percentage': '0.0',
                'saveShowHide': true
            }
            rateData.push(data)
            setRateData([...rateData])
        } else {
            let itemid = rateData[length - 1].methodUuid
            if (itemid) {
                let data = {
                    'startTeu': '0',
                    'endTeu': '0',
                    'feePrice': '0.0',
                    'feeCurrencyCode': '',
                    'percentage': '0.0',
                    'saveShowHide': true
                }
                rateData.push(data)
                setRateData([...rateData])
            } else {
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

            }
        }
    }

    //新增表格删除
    const newTableDelete = (record, index) => {
        setMessageData({})
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                if (record.agreementItemUuid) {
                    setSpinflag(true)
                    let deleteItem = await request($apiUrl.AG_FEE_AGMT_DELETE_ITEM_UUID, {
                        method: "POST",
                        data: {
                            'uuid': record.agreementItemUuid
                        }
                    })
                    // console.log(deleteItem)
                    if (deleteItem.success) {
                        setSpinflag(false)
                        setMessageData({ alertStatus: 'alert-success', message: deleteItem.message })
                        dataSource.splice(index, 1)
                        setDataSource([...dataSource])
                        setChecked([])
                        emptyCalculationMethod()
                    } else {
                        setSpinflag(false)
                        setMessageData({ alertStatus: 'alert-error', message: deleteItem.errorMessage })
                    }
                } else {
                    dataSource.splice(index, 1)
                    setDataSource([...dataSource])
                    emptyCalculationMethod()
                    setMessageData({ alertStatus: 'alert-success', message: formatMessage({ id: 'lbl.successfully-delete' }) })
                    setChecked([]);
                }
            }
        })
    }
    //计算表格删除
    const itemTableDelete = (record, index, name) => {
        setMessageData({})
        // console.log(record,name)
        // console.log(computingMethodData)
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true)
                if (record.methodUuid) {
                    let deletes = await request($apiUrl.AG_FEE_AGMT_DELETE_METHOD_UUID, {
                        method: "POST",
                        data: {
                            'params': {
                                'agreementHeadUuid': agreementHeadUuid,
                                'agreementItemUuid': itemIndex[0],
                                'calculationMethod': name,
                                'methodUuid': record.methodUuid
                            }
                        }
                    })
                    if (deletes.success) {

                        setSpinflag(false)
                        setMessageData({ alertStatus: 'alert-success', message: deletes.message })
                        if (name == 'VSHP') {
                            if (dataSource[itemdataIndex].modifyFlag == 'Y') {
                                dataSource[itemdataIndex].agFeeVesselTeuDetailList.splice(index, 1)
                                setDataSource(dataSource)
                                vshpData.splice(index, 1)
                                setVshpData([...vshpData])
                            } else {
                                dataSource[itemdataIndex].agFeeRateDetailList.splice(index, 1)
                                setDataSource(dataSource)
                                vshpDataTow.splice(index, 1)
                                setVshpDataTow([...vshpDataTow])
                            }
                        } else if (name == 'CNT1' || name == 'CNT2') {
                            dataSource[itemdataIndex].agFeeContainerPriceList.splice(index, 1)
                            setDataSource(dataSource)
                            computingMethodData.splice(index, 1)
                            setComputingMethodData([...computingMethodData])
                        } else if (name == 'CALL' || name == 'CALL2' || name == 'MCALL' || name == 'VOY' || name == 'VOY2') {//CALL/CALL2/MCALL/VOY/VOY2
                            dataSource[itemdataIndex].agFeeCallDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            callData.splice(index, 1)
                            setCallData([...callData])
                        } else if (name == 'DATE') {
                            dataSource[itemdataIndex].agFeeDateDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            dateData.splice(index, 1)
                            setDateData([...dateData])
                        } else if (name == 'BL') {
                            dataSource[itemdataIndex].agFeeRateDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            blData.splice(index, 1)
                            setBlData([...blData])
                        } else if (name == 'VTEU') {
                            dataSource[itemdataIndex].agFeeVesselTeuDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            vteuData.splice(index, 1)
                            setVteuData([...vteuData])
                        } else if (name == 'AGG') {
                            dataSource[itemdataIndex].agFeeNaGroupDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            aggData.splice(index, 1)
                            setAggData([...aggData])
                        }
                    } else {
                        setMessageData({ alertStatus: 'alert-error', message: deletes.errorMessage })
                    }
                } else {
                    setSpinflag(false)
                    if (name == 'VSHP') {
                        if (dataSource[itemdataIndex].modifyFlag == 'Y') {
                            dataSource[itemdataIndex].agFeeVesselTeuDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            vshpData.splice(index, 1)
                            setVshpData([...vshpData])
                        } else {
                            dataSource[itemdataIndex].agFeeRateDetailList.splice(index, 1)
                            setDataSource(dataSource)
                            vshpDataTow.splice(index, 1)
                            setVshpDataTow([...vshpDataTow])
                        }
                    } else if (name == 'CNT1' || name == 'CNT2') {
                        dataSource[itemdataIndex].agFeeContainerPriceList.splice(index, 1)
                        setDataSource(dataSource)
                        computingMethodData.splice(index, 1)
                        setComputingMethodData([...computingMethodData])
                    } else if (name == 'CALL' || name == 'CALL2' || name == 'MCALL' || name == 'VOY' || name == 'VOY2') {//CALL/CALL2/MCALL/VOY/VOY2
                        dataSource[itemdataIndex].agFeeCallDetailList.splice(index, 1)
                        setDataSource(dataSource)
                        callData.splice(index, 1)
                        setCallData([...callData])
                    } else if (name == 'DATE') {
                        dataSource[itemdataIndex].agFeeDateDetailList.splice(index, 1)
                        setDataSource(dataSource)
                        dateData.splice(index, 1)
                        setDateData([...dateData])
                    } else if (name == 'BL') {
                        dataSource[itemdataIndex].agFeeRateDetailList.splice(index, 1)
                        setDataSource(dataSource)
                        blData.splice(index, 1)
                        setBlData([...blData])
                    } else if (name == 'VTEU') {
                        dataSource[itemdataIndex].agFeeVesselTeuDetailList.splice(index, 1)
                        setDataSource(dataSource)
                        vteuData.splice(index, 1)
                        setVteuData([...vteuData])
                    } else if (name == 'AGG') {
                        dataSource[itemdataIndex].agFeeNaGroupDetailList.splice(index, 1)
                        setDataSource(dataSource)
                        aggData.splice(index, 1)
                        setAggData([...aggData])
                    }
                    setMessageData({ alertStatus: 'alert-success', message: formatMessage({ id: 'lbl.successfully-delete' }) })
                }
            }
        })
    }
    const [moId, setMoId] = useState('')
    //新增表格编辑
    const newTableCompile = (record, index) => {
        // 
        // setSaveSuccess(false)
        setMessageData({})
        // record.saveShowHide=true
        // console.log(index)
        setModifyFlagSele(record.modifyFlag)
        //费用大类和费用小类联动
        costKey.map((v, i) => {
            if (record.feeClass == v.feeCode) {
                let list = v.listAgTypeToClass
                list.map((v, i) => {
                    v['value'] = v.feeCode
                    v['label'] = v.feeCode + '(' + v.feeName + ')';
                })
                if (v.listAgTypeToClass.length == list.length) {
                    setSubclass('')
                    setSubclass(list)
                } else {

                }

            }
        })
        // console.log(record)
        setMoId(record.agreementItemUuid)
        setItemIndex(record.agreementItemUuid)
        // console.log('新增表格编辑', index)
        setItemDataIndex(index)
        setCalculationMethod(record.calculationMethod)
        setCompareCalculationMethod(record.compareCalculationMethod)
        setCalculationMethodRadio(record.calculationMethod)
        setCompareCalculationMethodRadio(record.compareCalculationMethod)
        setEditFeeClass(record.feeCalss)
        setModifyFlagRadio(record.modifyFlag)
        setCompareIndicatorRadio(record.compareIndicator)
        setTsIndicator(record.tsIndicator)
        if (record.compareIndicator == 'Y') {
            setMaxFlag(false);
            acquireSelectData('AFCM.AGMT.CALC.MODES.CALCMODES', setChooseBigCharge, $apiUrl)
        } else {
            setMaxFlag(true);
            // compareCalculationMethod
            // setChooseBigCharge({ values: [] });
            dataSource[index].compareCalculationMethod = ''
        }
        if (record.saveShowHide == false) {
            dataSource[index].saveShowHide = true
            setDataSource([...dataSource])
        }
    }
    //新增表格文本
    const addColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a disabled={itemFlag && permissionsButton.authSave ? false : true} style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} onClick={() => { newTableDelete(record, index) }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { newTableCompile(record, index) }}><FormOutlined /></a>&nbsp;</Tooltip>
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemSave(record, index) }}><SaveOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Reference-code-class" />,//参考代码类型
            dataIndex: 'heryType',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'heryType')} options={codeType.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.identifying-code" />,//参考代码
            dataIndex: 'heryCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Input defaultValue={text} maxLength={10} onChange={(e) => getCommonInputVal(e, record, 'heryCode')} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.feeClass} onChange={(e) => getCommonSelectVal(e, record, 'feeClass')} options={costKey} /> : costKey.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.feeType} onChange={(e) => getCommonSelectVal(e, record, 'feeType')} options={subclass} /> : subClassAll.length > 0 ? subClassAll.map((v, i) => {
                        return record.feeType == v.value ? <span>{v.label}</span> : ''
                    }) : record.feeType}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-or-not-their-own" />,//是否自有船
            dataIndex: 'vesselIndicator',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.vesselIndicator} onChange={(e) => getCommonSelectVal(e, record, 'vesselIndicator')} options={selfOwnedVessels.values} /> : selfOwnedVessels.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Computing-method" />,//代理费计算方法
            dataIndex: 'calculationMethod',
            sorter: false,
            width: 120,
            align: 'left',
            render: (text, record, index) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.calculationMethod} onChange={(e) => getCommonSelectVals(e, record, 'calculationMethod', index)} options={countMethod.values} ></Select> : countMethod.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-to-vote-for-an-election" />,//是否择大选取
            dataIndex: 'compareIndicator',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record, index) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'compareIndicator', index)} options={allWhether.values} /> : allWhether.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Choose-a-large-calculation-method" />,//择大计算方法
            dataIndex: 'compareCalculationMethod',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record, index) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide && record.compareIndicator == 'Y' ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'compareCalculationMethod', index)} options={chooseBigCharge} /> : chooseBigCharge.length > 0 ? chooseBigCharge.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    }) : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Is-it-a-special-rate" />,//是否特殊费率
            dataIndex: 'tsIndicator',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record, index) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.tsIndicator} onChange={(e) => getCommonSelectVal(e, record, 'tsIndicator', index)} options={allWhether.values} /> : allWhether.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-or-not-tiered-rates" />,//是否阶梯费率
            dataIndex: 'modifyFlag',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record, index) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.modifyFlag} onChange={(e) => getCommonSelectVal(e, record, 'modifyFlag', index)} options={allWhether.values} /> : allWhether.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,//是否含税价
            dataIndex: 'vatFlag',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={record.vatFlag} onChange={(e) => getCommonSelectVal(e, record, 'vatFlag')} options={cal.values} /> : cal.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        }
    ]
    //计算表格编辑
    const computingCompile = (record, index, name) => {
        setMessageData({})
        // console.log(record, index)
        // setSaveSuccess(false)
        if (record.saveShowHide == false) {
            if (name == 'computingMethod') {
                computingMethodData[index].saveShowHide = true
                setComputingMethodData([...computingMethodData])
            } else if (name == 'BL') {
                blData[index].saveShowHide = true
                setBlData([...blData])
            } else if (name == 'vteu') {
                vteuData[index].saveShowHide = true
                setVteuData([...vteuData])
            } else if (name == 'vshp') {
                if (dataSource[itemdataIndex].modifyFlag == 'Y') {
                    vshpData[index].saveShowHide = true
                    setVshpData([...vshpData])
                } else {
                    vshpDataTow[index].saveShowHide = true
                    setVshpDataTow([...vshpDataTow])
                }
            } else if (name == 'call') {
                callData[index].saveShowHide = true
                setCallData([...callData])
            } else if (name == 'date') {
                dateData[index].saveShowHide = true
                // console.log(dateData)
                setDateData([...dateData])
            } else if (name == 'agg') {
                // aggData[index].saveShowHide=true
                // if(record.saveShowHide==false){
                aggData[index].saveShowHide = true
                aggData[index].fromDate = moment(aggData[index]?.fromDate, 'YYYY-MM-DD')
                aggData[index].toDate = moment(aggData[index]?.toDate, 'YYYY-MM-DD')
                // console.log(aggData[index])
                setAggData([...aggData])
                // }
                // setAggData([...aggData])
            } else if (name == 'rate') {
                rateData[index].saveShowHide = true
                setRateData([...rateData])
            }

        }
    }

    //箱量计算法表格文本
    const computingMethodColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'CNT1', 'computingMethod') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'computingMethod') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { calculateSave(index, record, 'operand') }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.empty-container-mark' />,//空重箱标志
            dataIndex: 'emptyFullIndicator',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'emptyFullIndicator')} options={emptyFullIndicator.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.lnward-outward-transit' />,//进/出/中转
            dataIndex: 'transmitIndicator',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'transmitIndicator')} options={transmitIndicator.values} /> : transmitIndicator.values ? transmitIndicator.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    }) : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Box-size-group' />,//箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'containerSizeTypeGroup')} options={containerSizeTypeGroup} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.empty-box-mark' />,//SOC
            dataIndex: 'socIndicator',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'socIndicator')} options={socIndicator.values} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Domestic-trade-foreign-trade' />,//内贸/外贸
            dataIndex: 'cargoProperty',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'cargoProperty')} options={cargoProperty.values} /> : cargoProperty.values ? cargoProperty.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    }) : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'unitPrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={2} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'unitPrice') }} span={24} /> : text}
                </div>
            }

        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price-type' />,//单价类型
            dataIndex: 'unitPriceType',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'unitPriceType')} options={unitPriceType.values} /> : text}
                </div>
            }
        }
    ]
    //提单法(BL)计算方法表格文本
    const BLColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'BL') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'BL') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { calculateSave(index, record, 'BL') }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={1} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'feePrice') }} span={24} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        }
    ]

    //VTEU计算方法表格文本
    const VTEUColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'VTEU') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'vteu') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { calculateSave(index, record, 'VTEU') }}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Starting-point-tonnage' />,//船舶吨位起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Input type='number' maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'startTeu') }} span={24} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Tonnage-cut-off-point' />,//船舶吨位截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Input type='number' maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'endTeu') }} span={24} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} precision={4} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'feePrice') }} span={24} /> : text}
                </div>
            }
        }
    ]

    //船舶吨位法(VSHP)计算方法表格文本
    const VSHPColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'VSHP') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'vshp') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} ><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { calculateSave(index, record, 'VSHP') }}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        dataSource[itemdataIndex] ? dataSource[itemdataIndex].modifyFlag == 'Y' ? {
            title: <FormattedMessage id='lbl.Starting-point-tonnage' />,//船舶吨位起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'startTeu') }} span={24} /> : text}
                </div>
            }
        } : null : null,
        dataSource[itemdataIndex] ? dataSource[itemdataIndex].modifyFlag == 'Y' ? {
            title: <FormattedMessage id='lbl.Tonnage-cut-off-point' />,//船舶吨位截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'endTeu') }} span={24} /> : text}
                </div>
            }
        } : null : null,
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} precision={2} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'feePrice') }} span={24} /> : text}
                </div>
            }
        }
    ]

    //CALL/CALL2/MCALL/VOY/VOY2 计算方法表格文本
    const CALLColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'CALL') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'call') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { calculateSave(index, record, 'CALL/CALL2/MCALL/VOY/VOY2') }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Port-number' />,//挂港次数
            dataIndex: 'callNumber',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber defaultValue={text} maxLength={10} onChange={(e) => { getCommonInputVal(e, record, 'callNumber') }} span={24} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'feePrice') }} span={24} /> : text}
                </div>
            }
        }
    ]

    //时间(DATE)计算方法表格文本
    const DATEColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 20,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'DATE') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'date') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { calculateSave(index, record, 'DATE') }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Date-of-the-period' />,//日期周期
            dataIndex: 'calculationPeriod',
            sorter: false,
            width: 20,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'calculationPeriod')} options={calculationPeriod.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 20,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 20,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={2} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'feePrice') }} span={24} /> : text}
                </div>
            }
        }

    ]

    //北美箱量累进(AGG)计算方法表格文本
    const AGGColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { itemTableDelete(record, index, 'AGG') }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'agg') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { calculateSave(index, record, 'AGG') }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Group-number' />,//分组号码
            dataIndex: 'groupCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'groupCode')} options={groupCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.volume-point' />,//箱量起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'startTeu') }} span={24} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Volume-as-point' />,//箱量截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'endTeu') }} span={24} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Start-date-Carton-quantity' />,//箱量累进起始日期
            dataIndex: 'fromDate',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    <Space direction="vertical">
                        {/* 修改框 ? */}
                        {record.saveShowHide ? <DatePicker defaultValue={text} onChange={(e) => { getCommonDateVal(record, e, 'fromDate') }} /> : text ? text.length > 10 ? text.split(' ')[0] : text : text}
                    </Space>

                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Container-volume-deadline' />,//箱量累进截止日期
            dataIndex: 'toDate',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    <Space direction="vertical">
                        {/* 修改框 */}
                        {record.saveShowHide ? <DatePicker defaultValue={text} onChange={(e) => { getCommonDateVal(record, e, 'toDate') }} /> : text ? text.length > 10 ? text.split(' ')[0] : text : text}
                        {/* { record.saveShowHide?<DatePicker defaultValue={record.fromDate}  onChange={(e)=>{getCommonDateVal(record,e,'fromDate')}}   />:text.length>10?text.split(' ')[0]:text} */}
                    </Space>

                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.teu-price' />,//TEU单价
            dataIndex: 'unitPrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'unitPrice') }} span={24} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price-type' />,//单价类型
            dataIndex: 'unitPriceType',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'unitPriceType')} options={unitPriceType.values} /> : text}
                </div>
            }
        }
    ]

    // 特殊费率删除
    const rateTableDelete = (record, index, name) => {
        setMessageData({})
        console.log(record)
        // console.log(computingMethodData)
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                setSpinflag(true)
                console.log(record.methodUuid)
                if (record.methodUuid) {
                    let deletes = await request($apiUrl.AG_FEE_AGMT_DELETE_METHOD_UUID, {
                        method: "POST",
                        data: {
                            params: {
                                agreementHeadUuid: record.agreementHeadUuid,
                                agreementItemUuid: record.agreementItemUuid,
                                // calculationMethod: name,
                                agreementPanDetailUuid: record.agreementPanDetailUuid,
                                methodUuid: record.methodUuid,
                                tsIndicator: 'Y',
                            }
                        }
                    })
                    if (deletes.success) {
                        setSpinflag(false)
                        setMessageData({ alertStatus: 'alert-success', message: deletes.message })
                        dataSource[itemdataIndex].agFeeDetailPanList.splice(index, 1)
                        setDataSource(dataSource)
                        rateData.splice(index, 1);
                        setRateData([...rateData]);
                        // if (name == 'VSHP') {
                        //     if (dataSource[itemdataIndex].modifyFlag == 'Y') {
                        //         vshpData.splice(index, 1)
                        //         setVshpData([...vshpData])
                        //     } else {
                        //         vshpDataTow.splice(index, 1)
                        // console.log(vshpDataTow)
                        //         setVshpDataTow([...vshpDataTow])
                        //     }
                        // }
                    } else {
                        setSpinflag(false)
                        setMessageData({ alertStatus: 'alert-error', message: deletes.errorMessage })
                    }
                } else {
                    setSpinflag(false)
                    rateData.splice(index, 1);
                    setRateData([...rateData]);
                    setMessageData({ alertStatus: 'alert-success', message: formatMessage({ id: 'lbl.successfully-delete' }) })
                }
            }
        })
    }

    // 特殊费率保存
    const rateSave = async (index, record) => {
        if (record.startTeu == null) {
            //箱量起算点不能为空  formatMessage({ id: 'lbl.afcm-0081' }) 
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0081' }) })
        } else {
            let result = await request($apiUrl.AG_FEE_AGMT_SAVE_METHOD, {
                method: "POST",
                data: {
                    params: {
                        agreementHeadUuid: agreementHeadUuid,
                        agreementItemUuid: agreementItemUuid,
                        feeAgreementCode: feeAgreementCode,
                        agFeeDetailPanList: [{
                            startTeu: record.startTeu,
                            endTeu: record.endTeu,
                            feePrice: record.feePrice,
                            feeCurrencyCode: record.feeCurrencyCode,
                            percentage: record.percentage,
                        }],
                    }
                }
            })
            if (result.success) {
                let datas = result.data.data
                let data = result.data.data.agFeeDetailPanList[0].methodUuid;
                rateData[index].methodUuid = data
                rateData[index].agreementItemUuid = datas.agreementItemUuid
                rateData[index].agreementHeadUuid = datas.agreementHeadUuid
                rateData[index].saveShowHide = false
                setMessageData({ alertStatus: 'alert-success', message: result.message })
            } else {
                setMessageData({ alertStatus: 'alert-error', message: result.errorMessage })
            }
        }

    }

    // 特殊费率
    const rateColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { rateTableDelete(record, index, deletValue) }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { computingCompile(record, index, 'rate') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { rateSave(index, record) }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.volume-point-special' />,//箱量起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'startTeu') }} span={24} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Volume-as-point-special' />,//箱量截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'endTeu') }} span={24} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.teu-price' />,// TEU单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'feePrice') }} span={24} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.ccy' />,// 币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'feeCurrencyCode')} options={feeCurrencyCode.values} /> : text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.percentage' />,// 百分比
            dataIndex: 'percentage',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <InputNumber maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'percentage') }} span={24} /> : text}
                </div>
            }
        }
    ];

    //航线组明细表格文本
    const AirlinesGroup = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align: 'left',
            fixed: true,
            render: (text, record, index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { deleteairline(record, index) }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { editairline(record, index) }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { saveairline(record, index) }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={itemFlag && permissionsButton.authSave ? false : true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Airline-code' />,//航线代码
            dataIndex: 'serviceLoopCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'serviceLoopCode')} options={airlineCode} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.start-date' />,//开始日期
            // dataType: 'dateTime',
            dataIndex: 'fromDate',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    <Space direction="vertical">
                        {/* 修改框 */}
                        {record.saveShowHide ? <DatePicker defaultValue={record.fromDate} onChange={(e) => { getCommonDateVal(record, e, 'fromDate') }} /> : text.length > 10 ? text.split(' ')[0] : text}
                    </Space>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.over-date' />,//结束日期
            // dataType: 'dateTime',
            dataIndex: 'toDate',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div style={{ width: '100%' }}>
                    <Space direction="vertical">
                        {/* 修改框 */}
                        {record.saveShowHide ? <DatePicker span={24} defaultValue={record.toDate} onChange={(e) => { getCommonDateVal(record, e, 'toDate') }} /> : text.length > 10 ? text.split(' ')[0] : text}
                        {/* {text} */}
                    </Space>

                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.airlines-group' />,//航线组
            dataIndex: 'serviceGroupCode',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Input maxLength={10} style={{ imeMode: "disabled" }} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'serviceGroupCode') }} span={24} /> : text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.route-group-description' />,//航线组描述
            dataIndex: 'groupDescription',
            sorter: false,
            width: 90,
            align: 'left',
            render: (text, record) => {
                return <div>
                    {/* 修改框 */}
                    {record.saveShowHide ? <Input maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'groupDescription') }} span={24} /> : text}
                </div>
            }
        }
    ]

    // 箱型尺寸详细-表头
    const sizeDetailedColumns = [
        {
            title: <FormattedMessage id='lbl.Box-size-name' />,      // 箱型组尺寸名字
            dataIndex: 'containerSizeTypeGroup',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {text}
                </div>
            }
        }, {
            title: <FormattedMessage id='lbl.Box-size' />,      // 箱型尺寸
            dataIndex: 'containerSizeType',
            sorter: false,
            width: 120,
            render: (text, record) => {
                return <div>
                    {text}
                </div>
            }
        }
    ]

    // 新增箱型尺寸组始化
    const getData = async () => {
        setMessageData({})
        setSpinflag(true)
        await request.post($apiUrl.COMM_AGMT_NEW_TYPE_GROUP_INIT)
            .then((result) => {
                if (result.success) {
                    setSpinflag(false)
                    let data = result.data;
                    setGroupInit(data);
                } else {
                    setSpinflag(false)
                    setMessageData({ alertStatus: 'alert-error', message: result.errorMessage })
                }
            })
    }
    // 点击增加class类
    const [currentIndex, setCurrentIndex] = useState();
    const [sizeDetailedSelectedRows, setSizeDetailedSelectedRows] = useState([])
    const changeIdx = (idx) => {
        setCurrentIndex(idx)
    }
    let isSizeBoxAddflag

    //添加指定箱型尺寸信息
    const rightBtn = () => {
        setMessageData({})

        let data = queryForm.getFieldValue();
        let idx = newSizeDetailedTable.length;
        isSizeBoxAddflag = true
        // let res = /^[^\s]*$/
        // if(res.test(data.containerSizeTypeGroup)){

        // }
        if (!groupInit[currentIndex] || !data.containerSizeTypeGroup) {
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Box-size-Name-and-box-size-mandatory' }) })
        } else {
            sizeDetailedTable.map((item) => {
                // if ((data.containerSizeTypeGroup == item.containerSizeTypeGroup && groupInit[currentIndex] == item.containerSizeType) || idx == item.id) {
                //     isSizeBoxAddflag = false
                // }
                if (data.containerSizeTypeGroup == item.containerSizeTypeGroup) {
                    if (groupInit[currentIndex] == item.containerSizeType || idx == item.id) {
                        isSizeBoxAddflag = false
                    }
                } else if (data.containerSizeTypeGroup != item.containerSizeTypeGroup) {
                    isSizeBoxAddflag = false
                }
            })
            if (!isSizeBoxAddflag) {
                return
            }
            let json = {
                containerSizeTypeGroup: data.containerSizeTypeGroup,//箱型尺寸组名字
                containerSizeType: groupInit[currentIndex],//箱型尺寸
                id: idx++
            }
            sizeDetailedTable.push(json);
            newSizeDetailedTable.push(json);
            setSizeDetailedTable([...sizeDetailedTable])
            setNewSizeDetailedTable([...newSizeDetailedTable])
        }
    }
    //添加全部箱型尺寸
    const addAllBoxDetail = () => {
        setMessageData({})
        setSizeDetailedTable([])
        setNewSizeDetailedTable([])
        const newGroupInit = []
        const newArr = []
        let data = queryForm.getFieldValue();
        let idx = newSizeDetailedTable.length;
        isSizeBoxAddflag = true
        if (!data.containerSizeTypeGroup) {
            //箱型尺寸组名称是必填项！
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Box-size-group-name-is-required' }) })
        } else {
            // for (let i = 0; i < sizeDetailedTable.length; i++) {
            //     for (let j = 0; j < groupInit.length; j++) {
            //         if ((data.containerSizeTypeGroup == sizeDetailedTable[i].containerSizeTypeGroup && groupInit[j] == sizeDetailedTable[i].containerSizeType) || idx == sizeDetailedTable[i].id) {
            //             // alert(1)
            //             isSizeBoxAddflag = false
            //         }
            //     }
            // }
            // if (!isSizeBoxAddflag) {
            //     return
            // }
            // console.log(newGroupInit, sizeDetailedTable)
            groupInit.map((item) => {
                newGroupInit.push({
                    containerSizeTypeGroup: data.containerSizeTypeGroup,
                    containerSizeType: item,
                    id: idx++
                })
            })
            // if(sizeDetailedTable.length==0){
            //     for(var i = 0; i < newGroupInit.length; i++){
            //         newArr.push(newGroupInit[i])
            //     }
            // }else{
            //     if(sizeDetailedTable.length<newGroupInit.length){
            //         for(var i = 0; i < newGroupInit.length; i++){
            //             for(var j = 0; j < sizeDetailedTable.length; j++){
            // console.log(newGroupInit[i].containerSizeType!=sizeDetailedTable[j].containerSizeType)
            //                 if(newGroupInit[i].containerSizeType!=sizeDetailedTable[j].containerSizeType){
            //                     newArr.push(newGroupInit[i])
            //                 }
            //             }
            //         }
            //     }
            // }
            let sizeDetailedTableAll = newGroupInit
            // let sizeDetailedTableAll = sizeDetailedTable.concat(newGroupInit)
            setSizeDetailedTable([...sizeDetailedTableAll])
            setNewSizeDetailedTable([...sizeDetailedTableAll])
        }
    }
    //删除指定箱型尺寸
    const deleteBoxSize = () => {
        setMessageData({})
        // setChecked([])
        // console.log(checkedGroup)
        let newGroupData = [];
        if (sizeDetailedTable.length) {
            // for (let i = 0; i < checkedGroup.length; i++) {
            // 	newGroupData = [];
            // 	for (let j = 0; j < sizeDetailedTable.length; j++) {
            // console.log(checkedGroup[i], sizeDetailedTable[j].id);
            // 		if (checkedGroup[i] == sizeDetailedTable[j].id) {
            // console.log('成功');
            // 			continue;
            // 		}
            // 		newGroupData.push(sizeDetailedTable[j])
            // 	}
            // }
            sizeDetailedSelectedRows.map((v, i) => {
                // console.log(v.id)
                delete sizeDetailedTable[v.id]
            })
            let idx = 0;
            sizeDetailedTable.map((v, i) => {
                if (v) {
                    v.id = idx++;
                    newGroupData.push(v);
                }
            })
            setCheckedGroup([]);
            setSizeDetailedSelectedRows([])
            setSizeDetailedTable([...newGroupData])
        }
        //     if(sizeDetailedSelectedRows){
        //         if (sizeDetailedSelectedRows.length == sizeDetailedTable.length) {
        //             setSizeDetailedTable([])
        //             setSizeDetailedSelectedRows([])
        //         }
        //         let newSizeDetailedTable3 = sizeDetailedTable;
        //         let sizeDetailedSelectedRows3 = [...sizeDetailedSelectedRows];
        //         for (var i = 0; i < sizeDetailedSelectedRows.length; i++) {
        //             for (var j = 0; j < sizeDetailedTable.length; j++) {
        //                 if (sizeDetailedSelectedRows[i].id == sizeDetailedTable[j].id) {
        //                     newSizeDetailedTable3.splice(j, 1)
        //                     sizeDetailedSelectedRows3.splice(i, 1)
        //                 }
        //             }
        //         }
        //         setSizeDetailedTable([...newSizeDetailedTable3])
        //         setNewSizeDetailedTable([])
        //         setSizeDetailedSelectedRows([...sizeDetailedSelectedRows3])
        //    }

    }
    //删除全部箱型尺寸
    const deleteAllBoxDetail = () => {
        setMessageData({})
        setCheckedGroup([]);
        setSizeDetailedTable([])
        setSizeDetailedSelectedRows([])
    }
    //保存全部箱型尺寸
    const saveBoxSize = async () => {
        // console.log(isEditBoxSize)
        setMessageData({})
        // setSpinflag(true)
        let data = queryForm.getFieldValue();
        if (data.containerSizeTypeGroup) {
            var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
            if (patrn.test(data.containerSizeTypeGroup)) {// 如果包含特殊字符返回
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) })
            } else {
                if (data.containerSizeTypeGroup.length > 5) {
                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0077' }) });
                    return
                }
                setSpinflag(true)
                let tengquan = [...sizeDetailedTable]
                // console.log(tengquan)
                if (tengquan.length >= 1) {
                    tengquan = tengquan.map((item) => {
                        item.agreementHeadUuid = agreementHeadUuid;
                        item.feeAgreementCode = feeAgreementCode;
                        item.containerSizeTypeGroup = data.containerSizeTypeGroup
                        delete item.id
                        return item
                    })
                    await request($apiUrl.AG_FEE_AGMT_SAVE_CNTR_GROUP, {
                        method: 'POST',
                        data: {
                            operateType: isEditBoxSize,
                            params: {
                                agreementHeadUuid: agreementHeadUuid,
                                feeAgreementCode: feeAgreementCode,
                                containerSizeTypeGroup: data.containerSizeTypeGroup,//箱型尺寸组名称
                            },
                            paramsList: tengquan
                        }
                    })
                        .then((res) => {
                            if (res.success) {
                                setSpinflag(false)
                                const resData = res.data || []
                                setSizeDetailedTable([])
                                setSizeDetailedSelectedRows([])
                                setNewSizeDetailedTable([])
                                setCommissionAgmtCntrSizeTypeGroups(resData)
                                setIsEditBoxSize('NEW')
                                queryForm.setFieldsValue({
                                    containerSizeTypeGroup: ''
                                })
                                setGroupFlag(true)
                                boxSizeGroup()
                                //保存成功!
                                setMessageData({ alertStatus: 'alert-success', message: res.message })
                            } else {
                                setSpinflag(false)
                                setMessageData({ alertStatus: 'alert-error', message: res.errorMessage })
                            }
                        })
                } else {
                    setSpinflag(false)
                    //箱型尺寸详细必须输入
                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Box-size-details-entered' }) })
                }
            }

        } else {
            //箱型尺寸组是必填项！
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Box-size-group-name-is-required' }) })
            setSpinflag(false)
        }

    }
    //选中要删除的数据
    const getSelectedRows = (val) => {
        console.log(val)
        setSizeDetailedSelectedRows(val)
    }
    //重置箱型尺寸
    const resetBoxSize = () => {
        setMessageData({})
        setSizeDetailedTable([])
        setGroupFlag ? setGroupFlag(true) : null
        setIsEditBoxSize('NEW')
        setCheckedGroup([]);
        setSizeDetailedSelectedRows([])
        queryForm.setFieldsValue({
            'containerSizeTypeGroup': ''
        })
    }

    //删除左侧箱型尺寸组
    const deleteAddSuccessBoxSize = (item) => {
        setMessageData({})
        // console.log(item.containerSizeTypeGroup)
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                let uuid = []
                let containerSizeTypeGroup = item.containerSizeTypeGroup
                item.agContainerSizeTypeGroupList.map((v, i) => {
                    uuid.push(v.containerSizeTypeGroupUuid)
                })
                setSpinflag(true)
                await request($apiUrl.AG_FEE_AGMT_DELETE_CNTR_GROUP, {
                    method: 'POST',
                    data: {
                        operateType: 'UPD',
                        uuids: [...uuid],
                        uuid: agreementHeadUuid
                    }
                })
                    .then((res) => {
                        if (res.success) {
                            setSpinflag(false)
                            const resData = res.data || []
                            //判断表格里面箱型尺寸名字和右侧输入的是否相同
                            containerSizeTypeGroup == queryForm.getFieldValue().containerSizeTypeGroup ? resetBoxSize() : null
                            setCommissionAgmtCntrSizeTypeGroups([...resData])
                            setMessageData({ alertStatus: 'alert-success', message: res.message })
                            boxSizeGroup()
                        } else {
                            setSpinflag(false)
                            setMessageData({ alertStatus: 'alert-error', message: res.errorMessage })
                        }

                    })
            }
        })
        // .catch((err) => {
        // Toast(err.errorMessage, '', 'alert-success', 5000, false)
        // })
    }
    //编辑左侧详情尺寸组
    const editAddSuccessBoxSize = (item) => {
        setMessageData({})
        setGroupFlag(false)
        let idx = newSizeDetailedTable.length;
        item.agContainerSizeTypeGroupList.map((item) => {
            item.id = idx++
        })
        // console.log(item)
        queryForm.setFieldsValue({
            containerSizeTypeGroup: item.containerSizeTypeGroup
        })
        setIsEditBoxSize('UPD')
        setSizeDetailedTable([...item.agContainerSizeTypeGroupList])
        setNewSizeDetailedTable([...item.agContainerSizeTypeGroupList])
    }
    //新增航线组
    const groupaddItem = () => {

        setMessageData({})
        let length = airlineData ? airlineData.length : 0
        // console.log(length)
        if (length == 0) {
            setairlineData([])
            groupaddItemFlags()
        } else {
            let itemid = airlineData[length - 1].agreementServiceGroupUuid
            // console.log(itemid)
            itemid ? groupaddItemFlags() : setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })
            // setSaveSuccess(false)
        }
    }
    const groupaddItemFlags = () => {
        setMessageData({})
        let data = {
            'serviceLoopCode': '',
            'serviceGroupCode': '',
            'groupDescription': '',
            'fromDate': '',
            'toDate': '',
            'saveShowHide': true
        }
        airlineData.push(data)
        setairlineData([...airlineData])
        // setairlineFlag(false)

    }
    //保存航线组
    const saveairline = async (record, index) => {
        setMessageData({})
        // console.log(record)
        let fromDate
        let toDate
        if (record.fromDate && record.toDate) {
            if (record.fromDate._i && record.toDate._i) {
                fromDate = record.fromDate._i
                toDate = record.toDate._i
            } else if (record.fromDate._i) {
                fromDate = record.fromDate._i
                toDate = record.toDate
            } else if (record.toDate._i) {
                fromDate = record.fromDate
                toDate = record.toDate._i
            } else {
                fromDate = record.fromDate
                toDate = record.toDate
            }
        }

        if (record.serviceGroupCode) {

        }


        var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
        var pa = /[\u4E00-\u9FA5]/g
        console.log(pa.test(record.serviceGroupCode), record.serviceGroupCode)
        if (patrn.test(record.groupDescription) && patrn.test(record.serviceGroupCode) || pa.test(record.serviceGroupCode)) {// 如果包含特殊字符返回
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0074' }) + ',' + formatMessage({ id: 'lbl.afcm-00103' }) })
        } else {
            setSpinflag(true)
            let group = await request($apiUrl.COMM_AGMT_AGMT_SAVE_SVC_GROUP, {
                method: "POST",
                data: {
                    params: {
                        'agreementHeadUuid': agreementHeadUuid,
                        'feeAgreementCode': feeAgreementCode,
                        'serviceLoopCode': record.serviceLoopCode,
                        // 'serviceGroupCode':temp,
                        'serviceGroupCode': record.serviceGroupCode,
                        'groupDescription': record.groupDescription,
                        'fromDate': fromDate,
                        'toDate': toDate,
                        'agreementServiceGroupUuid': record.agreementServiceGroupUuid ? record.agreementServiceGroupUuid : null,
                        'versionId': record.versionId ? null : record.versionId,
                    },
                    operateType: record.agreementServiceGroupUuid ? 'UPD' : 'NEW',
                }
            })
            if (group.success) {
                setSpinflag(false)
                setMessageData({ alertStatus: 'alert-success', message: group.message })
                setairlineFlag(true)
                let agFeeServiceGroupList
                let b = await request($apiUrl.AG_FEE_AGMT_PRE_HEAD_DETAIL, {
                    method: "POST",
                    data: {
                        'uuid': agreementHeadUuid,
                    }
                })
                airlineData[index].saveShowHide = false
                if (b.success) {
                    // setMessageData({alertStatus:'alert-success',message:b.message})
                    let compliedata = b.data
                    agFeeServiceGroupList = compliedata.agFeeServiceGroupList
                } else {
                    // setMessageData({alertStatus:'alert-error',message:b.errorMessage})
                }
                airlineData[index] = agFeeServiceGroupList[index]
                setairlineData([...airlineData])
            } else {
                setSpinflag(false)
                setMessageData({ alertStatus: 'alert-error', message: group.errorMessage })
            }
        }

    }
    //编辑航线组
    const editairline = (record, index) => {
        setMessageData({})
        if (record.saveShowHide == false) {
            airlineData[index].saveShowHide = true
            airlineData[index].fromDate = moment(airlineData[index]?.fromDate, 'YYYY-MM-DD')
            airlineData[index].toDate = moment(airlineData[index]?.toDate, 'YYYY-MM-DD')
            setairlineData([...airlineData])
        }
    }

    //删除航线组 
    const deleteairline = (record, index) => {
        setMessageData({})
        setSpinflag(true)
        const confirmModal = confirm({
            title: formatMessage({ id: 'lbl.delete' }),
            content: formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                confirmModal.destroy()
                if (record.agreementServiceGroupUuid) {
                    let dele = await request($apiUrl.AG_FEE_AGMT_DELETE_SVC_GROUP, {
                        method: "POST",
                        data: {
                            'uuid': record.agreementServiceGroupUuid
                        }
                    })
                    if (dele.success) {
                        setSpinflag(false)
                        setMessageData({ alertStatus: 'alert-success', message: dele.message })
                        let b = await request($apiUrl.AG_FEE_AGMT_PRE_HEAD_DETAIL, {
                            method: "POST",
                            data: {
                                'uuid': agreementHeadUuid,
                            }
                        })
                        let data = b.data
                        let agFeeServiceGroupList = data.agFeeServiceGroupList
                        let saveShowHide
                        airlineData.map((v, i) => {
                            saveShowHide = v.saveShowHide
                        })
                        agFeeServiceGroupList.map((v, i) => {
                            v.saveShowHide = saveShowHide
                        })
                        agFeeServiceGroupList ? setairlineData([...agFeeServiceGroupList]) : []
                    } else {
                        setMessageData({ alertStatus: 'alert-error', message: dele.message })
                    }
                } else {
                    setSpinflag(false)
                    airlineData.splice(index, 1)
                    setairlineData([...airlineData])
                    setMessageData({ alertStatus: 'alert-error', message: dele.errorMessage })

                }


            }
        })
    }

    //审核协议
    const audit = async (operate) => {
        setMessageData({})
        setSpinflag(true)
        let vdata = []
        if (vshpData) {
            vdata = vshpData
        } else if (vteuData) {
            vdata = vteuData
        }
        let audits = await request($apiUrl.COMM_AGMT_AGMT_PRE_APPROVE, {
            method: 'POST',
            data: {
                params: {
                    ...queryForm.getFieldValue(),
                    "fromDate": queryForm.getFieldValue().Date ? momentFormat(queryForm.getFieldValue().Date[0]) : null,//fromDate.slice(1,11)+' 00:00:00',
                    "toDate": queryForm.getFieldValue().Date ? momentFormat(queryForm.getFieldValue().Date[1]) : null,
                    'agFeeAgreementItemList': [...dataSource],
                    'agFeeContainerPriceList': [...computingMethodData],
                    'agFeeDateDetailList': [...dateData],
                    'agFeeCallDetailList': [...callData],
                    'agFeeVesselTeuDetailList': vdata,
                    'agFeeRateDetailList': [...blData],
                    'agFeeNaGroupDetailList': [...aggData],
                },
                'operateType': operate
            }
        })
        if (audits.success) {
            setAIsModalVisible(false)
            setUnlockAuditFlag ? setUnlockAuditFlag(true) : ''
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-success', message: audits.message })
            handleCancel()
        } else {
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-error', message: audits.errorMessage })
        }
    }

    //解锁
    const unlock = async (operate) => {
        setMessageData({})
        setSpinflag(true)
        let vdata = []
        if (vshpData) {
            vdata = vshpData
        } else if (vteuData) {
            vdata = vteuData
        }
        let query = queryForm.getFieldValue()
        let str = query.companyCode ? query.companyCode : '';
        let ind = str.indexOf('-');
        let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
        query.companyCode = we
        let unlocks = await request($apiUrl.AFMT_PRE_UNLOCK, {
            method: 'POST',
            data: {
                params: {
                    // ...query,
                    // 'Date':undefined,
                    // "fromDate": queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().Date[0]):null,//fromDate.slice(1,11)+' 00:00:00',
                    // "toDate":queryForm.getFieldValue().Date?momentFormat(queryForm.getFieldValue().Date[1]):null,
                    // 'agFeeAgreementItemList':[...dataSource],
                    // 'agFeeContainerPriceList':[...computingMethodData],
                    // 'agFeeDateDetailList':[...dateData],
                    // 'agFeeCallDetailList':[...callData],
                    // 'agFeeVesselTeuDetailList':vdata?vdata:null,
                    // 'agFeeRateDetailList':[...blData],
                    // 'agFeeNaGroupDetailList':[...aggData],
                    'agmtHeadUuid': agreementHeadUuid,
                    'agreementType': 'AGENCY_FEE',
                },
                'operateType': operate,
            }
        })
        if (unlocks.success) {
            //解锁成功
            setAIsModalVisible(false)
            setUnlockAuditFlag ? setUnlockAuditFlag(true) : ''
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-success', message: unlocks.message })
            handleCancel()
        } else {
            setSpinflag(false)
            setMessageData({ alertStatus: 'alert-error', message: unlocks.errorMessage })
        }
    }
    //item表格的单选按钮
    const setSelectedRows = (value, uuid) => {
        setMessageData({})
        console.log(value)
        let val = value[0]
        setItemIndex(uuid)
        setDeletValue(val.calculationMethod)
        setCalculationMethod(val.calculationMethod)
        setCompareCalculationMethod(val.compareCalculationMethod)
        setTsIndicator(val.tsIndicator)
        let indexLength
        for (var i = 0; i < dataSource.length; i++) {
            // v.agFeeRateDetailList
            if (dataSource[i].agreementItemUuid == uuid) {
                indexLength = i
                setItemDataIndex(i)
                setIndexRadio(i)
            }
        }
        val = dataSource[indexLength]
        if (uuid[0]) {
            if (val.saveShowHide == true && (comparecalculationMethodRadio != val.compareCalculationMethod || calculationMethodRadio != val.calculationMethod || modifyFlagRadio != val.modifyFlag || compareIndicatorRadio != val.compareIndicator)) {
                setChecked([])
                emptyCalculationMethod()
                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0054' }) })
            } else {
                if (val.tsIndicator == 'Y') {
                    setRateFlag(true);
                    val.agFeeDetailPanList.map((v, i) => {
                        v.saveShowHide = false
                    })
                    setRateData(val.agFeeDetailPanList)
                } else {
                    setRateFlag(false);
                    setRateData([])
                }
                //计算方法
                switch (val.calculationMethod) {
                    case 'CNT1':
                        if (val.compareCalculationMethod == 'CNT') {
                            setChecked([])
                            emptyCalculationMethod()
                            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0082' }) })
                        } else {
                            setDateFlag(false)
                            setCallFlag(false)
                            setVshpFlag(false)
                            setVteuFlag(false)
                            setBlFlag(false)
                            setAggFlag(false)
                            setDisFlag(true)
                            let mentData = val.agFeeContainerPriceList
                            setComputingMethodName('lbl.CNT1-particulars')
                            setComputingMethodData(val.agFeeContainerPriceList)
                            val.agFeeContainerPriceList.length ? val.agFeeContainerPriceList.map((v, i) => {
                                if (!v.methodUuid) {
                                    // if(computingMethodData.length>0){
                                    //     computingMethodData.splice(i, 1)
                                    //     setComputingMethodData([...computingMethodData])
                                    // }else{
                                    mentData.splice(i, 1)
                                    setComputingMethodData([...mentData])
                                    // }
                                } else {
                                    v.saveShowHide = false
                                    setComputingMethodData(val.agFeeContainerPriceList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setOperandSaveFlag(false)
                            } else {
                                setOperandSaveFlag(true)
                            }
                        }; break;
                    case 'CNT2':
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setDisFlag(true)
                        setComputingMethodName('lbl.CNT2-particulars')
                        if (val.agFeeContainerPriceList.length > 0) {
                            setComputingMethodData([...val.agFeeContainerPriceList])
                        }
                        let mentData = val.agFeeContainerPriceList
                        val.agFeeContainerPriceList.length > 0 ? setComputingMethodData(val.agFeeContainerPriceList) : null
                        val.agFeeContainerPriceList.length > 0 ? val.agFeeContainerPriceList.map((v, i) => {
                            if (!v.methodUuid) {
                                mentData.splice(i, 1)
                                setComputingMethodData([...mentData])
                                // computingMethodData.splice(i, 1)
                                // setComputingMethodData([...computingMethodData])
                            } else if (v.saveShowHide) {
                                v.saveShowHide = false
                                setComputingMethodData([...val.agFeeContainerPriceList])
                            } else {
                                setComputingMethodData(val.agFeeContainerPriceList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setOperandSaveFlag(false)
                        } else {
                            setOperandSaveFlag(true)
                        }; break;
                    case 'DATE':
                        setDisFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setDateFlag(true)
                        setComputingMethodName('lbl.DATE-particulars')
                        setDateData(val.agFeeDateDetailList)
                        let mentDateData = val.agFeeDateDetailList ? val.agFeeDateDetailList : ''
                        val.agFeeDateDetailList.length > 0 ? val.agFeeDateDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // dateData.splice(i, 1)
                                // setDateData([...dateData])
                                mentDateData.splice(i, 1)
                                setDateData([...mentDateData])
                            } else if (v.saveShowHide) {
                                v.saveShowHide = false
                                // console.log()
                                setDateData(val.agFeeDateDetailList)
                            } else {
                                setDateData(val.agFeeDateDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setDateShow(false)
                        } else {
                            setDateShow(true)
                        }; break;
                    case 'CALL':
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setComputingMethodName('lbl.CALL-particulars')
                        let mentDataCall = val.agFeeCallDetailList
                        val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                        val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // callData.splice(i, 1)
                                // setCallData([...callData])
                                mentDataCall.splice(i, 1)
                                setCallData([...mentDataCall])
                            } else {
                                v.saveShowHide = false
                                setCallData(val.agFeeCallDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setComputingMethod(false)
                        } else {
                            setComputingMethod(true)
                        }; break;
                    case 'CALL2':
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setComputingMethodName('lbl.CALL2-particulars')
                        let mentDataCall2 = val.agFeeCallDetailList
                        val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                        val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // callData.splice(i, 1)
                                // setCallData([...callData])
                                mentDataCall2.splice(i, 1)
                                setCallData([...mentDataCall2])
                            } else {
                                v.saveShowHide = false
                                setCallData(val.agFeeCallDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setComputingMethod(false)
                        } else {
                            setComputingMethod(true)
                        }; break;
                    case 'MCALL':
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setComputingMethodName('lbl.MCALL-particulars')
                        let mentDataMcall = val.agFeeCallDetailList
                        val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                        val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // callData.splice(i, 1)
                                // setCallData([...callData])
                                mentDataMcall.splice(i, 1)
                                setCallData([...mentDataMcall])
                            } else {
                                v.saveShowHide = false
                                setCallData(val.agFeeCallDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setComputingMethod(false)
                        } else {
                            setComputingMethod(true)
                        }; break;
                    case 'VOY':
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setComputingMethodName('lbl.VOY-particulars')
                        let mentDataVOY = val.agFeeCallDetailList
                        val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                        val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // callData.splice(i, 1)
                                // setCallData([...callData])
                                mentDataVOY.splice(i, 1)
                                setCallData([...mentDataVOY])
                            } else {
                                v.saveShowHide = false
                                setCallData(val.agFeeCallDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setComputingMethod(false)
                        } else {
                            setComputingMethod(true)
                        }; break;
                    case 'VOY2':
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setComputingMethodName('lbl.VOY2-particulars')
                        let mentDataVOY2 = val.agFeeCallDetailList
                        val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                        val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // callData.splice(i, 1)
                                // setCallData([...callData])
                                mentDataVOY2.splice(i, 1)
                                setCallData([...mentDataVOY2])
                            } else {
                                v.saveShowHide = false
                                setCallData(val.agFeeCallDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setComputingMethod(false)
                        } else {
                            setComputingMethod(true)
                        }; break;
                    case 'VSHP':
                        let mentDataVshp
                        if (modifyFlagSele && val.agreementItemUuid == moId) {
                            if (modifyFlagSele != val.modifyFlag) {
                                setChecked([])
                                setVshpShow(false)
                                setVshpFlag(false)
                                //保存成功后才能使用
                                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0075' }) })
                            } else {
                                setDisFlag(false)
                                setDateFlag(false)
                                setCallFlag(false)
                                setVteuFlag(false)
                                setBlFlag(false)
                                setAggFlag(false)
                                setVshpFlag(true)
                                setComputingMethodName('lbl.VSHP-particulars')
                                // console.log(val.agFeeVesselTeuDetailList, val.agFeeRateDetailList)

                                if (val.modifyFlag == 'Y') {
                                    mentDataVshp = val.agFeeVesselTeuDetailList
                                    val.agFeeVesselTeuDetailList ? setVshpData(val.agFeeVesselTeuDetailList) : null
                                    val.agFeeVesselTeuDetailList.length > 0 ? val.agFeeVesselTeuDetailList.map((v, i) => {
                                        v.saveShowHide = false
                                        if (!v.methodUuid) {
                                            // vshpData.splice(i, 1)
                                            // setVshpData([...vshpData])
                                            mentDataVshp.splice(i, 1)
                                            setVshpData([...mentDataVshp])
                                        } else {
                                            v.saveShowHide = false
                                            setVshpData(val.agFeeVesselTeuDetailList)
                                        }
                                    }) : null
                                } else {
                                    mentDataVshp = val.agFeeRateDetailList
                                    val.agFeeRateDetailList ? setVshpDataTow(val.agFeeRateDetailList) : null
                                    val.agFeeRateDetailList.length > 0 ? val.agFeeRateDetailList.map((v, i) => {
                                        if (!v.methodUuid) {
                                            // vshpDataTow.splice(i, 1)
                                            // setVshpDataTow([...vshpDataTow])
                                            mentDataVshp.splice(i, 1)
                                            setVshpDataTow([...mentDataVshp])
                                        } else {
                                            v.saveShowHide = false
                                            setVshpDataTow(val.agFeeRateDetailList)
                                        }
                                    }) : null
                                }
                                setAgreementItemUuid(val.agreementItemUuid)
                                if (!val.agreementItemUuid || itemFlag == false) {
                                    setVshpShow(false)
                                } else {
                                    setVshpShow(true)
                                }
                            }
                        } else {
                            setDisFlag(false)
                            setDateFlag(false)
                            setCallFlag(false)
                            setVteuFlag(false)
                            setBlFlag(false)
                            setAggFlag(false)
                            setVshpFlag(true)
                            setComputingMethodName('lbl.VSHP-particulars')
                            // console.log(val.agFeeVesselTeuDetailList, val.agFeeRateDetailList)
                            if (val.modifyFlag == 'Y') {
                                mentDataVshp = val.agFeeVesselTeuDetailList
                                val.agFeeVesselTeuDetailList ? setVshpData(val.agFeeVesselTeuDetailList) : null
                                val.agFeeVesselTeuDetailList.length > 0 ? val.agFeeVesselTeuDetailList.map((v, i) => {
                                    if (!v.methodUuid) {
                                        // vshpData.splice(i, 1)
                                        // setVshpData([...vshpData])
                                        mentDataVshp.splice(i, 1)
                                        setVshpData([...mentDataVshp])
                                    } else {
                                        v.saveShowHide = false
                                        setVshpData(val.agFeeVesselTeuDetailList)
                                    }
                                }) : null
                            } else {
                                mentDataVshp = val.agFeeRateDetailList
                                val.agFeeRateDetailList ? setVshpDataTow(val.agFeeRateDetailList) : null
                                val.agFeeRateDetailList.length > 0 ? val.agFeeRateDetailList.map((v, i) => {
                                    if (!v.methodUuid) {
                                        // vshpDataTow.splice(i, 1)
                                        // setVshpDataTow([...vshpDataTow])
                                        mentDataVshp.splice(i, 1)
                                        setVshpDataTow([...mentDataVshp])
                                    } else {
                                        v.saveShowHide = false
                                        setVshpDataTow(val.agFeeRateDetailList)
                                    }
                                }) : null
                            }
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setVshpShow(false)
                            } else {
                                setVshpShow(true)
                            }
                        }
                        ; break;
                    case 'VTEU':
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setVteuFlag(true)
                        setComputingMethodName('lbl.VTEU-particulars')
                        let mentDataVteu = val.agFeeVesselTeuDetailList
                        val.agFeeVesselTeuDetailList ? setVteuData(val.agFeeVesselTeuDetailList) : null
                        val.agFeeVesselTeuDetailList.length > 0 ? val.agFeeVesselTeuDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                if (vteuData.length > 0) {
                                    vteuData.splice(i, 1)
                                    setVteuData([...vteuData])
                                } else {
                                    mentDataVteu.splice(i, 1)
                                    setVteuData([...mentDataVteu])
                                }
                            } else {
                                v.saveShowHide = false
                                setVteuData(val.agFeeVesselTeuDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setVteuShow(false)
                        } else {
                            setVteuShow(true)
                        }; break;
                    case 'BL':
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setAggFlag(false)
                        setBlFlag(true)
                        let mentDataBl = val.agFeeRateDetailList
                        setComputingMethodName('lbl.BL-particulars')
                        val.agFeeRateDetailList ? setBlData(val.agFeeRateDetailList) : null
                        val.agFeeRateDetailList.length > 0 ? val.agFeeRateDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // blData.splice(i, 1)
                                // setBlData([...blData])
                                mentDataBl.splice(i, 1)
                                setBlData([...mentDataBl])
                            } else {
                                v.saveShowHide = false
                                setBlData(val.agFeeRateDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setBlShow(false)
                        } else {
                            setBlShow(true)
                        }; break;
                    case 'AGG':
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(true)
                        setComputingMethodName('lbl.AGG-particulars')
                        if (val.agFeeNaGroupDetailList) {
                            val.agFeeNaGroupDetailList.map((v, i) => {
                                v.saveShowHide = false
                            })
                            setAggData([...val.agFeeNaGroupDetailList])
                        }
                        let mentDataAgg = val.agFeeNaGroupDetailList
                        val.agFeeNaGroupDetailList.length > 0 ? val.agFeeNaGroupDetailList.map((v, i) => {
                            if (!v.methodUuid) {
                                // aggData.splice(i, 1)
                                // setAggData([...aggData])
                                mentDataAgg.splice(i, 1)
                                setAggData([...mentDataAgg])
                            } else {
                                v.saveShowHide = false
                                setAggData(val.agFeeNaGroupDetailList)
                            }
                        }) : null
                        setAgreementItemUuid(val.agreementItemUuid)
                        if (!val.agreementItemUuid || itemFlag == false) {
                            setAggShow(false)
                        } else {
                            setAggShow(true)
                        }; break;
                }
                //择大计算方法
                if (val.compareIndicator == 'Y') {
                    switch (val.compareCalculationMethod) {
                        case 'CNT':
                            if (val.calculationMethod == 'CNT1' || val.calculationMethod == 'CNT2') {
                                setChecked([])
                                emptyCalculationMethod()
                                setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0082' }) })
                            } else {
                                setCompareDateFlag(false)
                                setCompareCallFlag(false)
                                setCompareVshpFlag(false)
                                setCompareVteuFlag(false)
                                setCompareBlFlag(false)
                                setCompareAggFlag(false)
                                setCompareDisFlag(true)
                                let mentDataCnt = val.agFeeContainerPriceList
                                setCompareComputingMethodName('lbl.afcm-0080')
                                val.agFeeContainerPriceList ? setCompareComputingMethodData(val.agFeeContainerPriceList) : null
                                val.agFeeContainerPriceList.length > 0 ? val.agFeeContainerPriceList.map((v, i) => {
                                    if (!v.methodUuid) {
                                        mentDataCnt.splice(i, 1)
                                        setComputingMethodData([...mentDataCnt])
                                    } else {
                                        v.saveShowHide = false
                                        // console.log(val.agFeeContainerPriceList)
                                        setComputingMethodData(val.agFeeContainerPriceList)
                                    }
                                }) : null
                                setAgreementItemUuid(val.agreementItemUuid)
                                if (!val.agreementItemUuid || itemFlag == false) {
                                    setOperandSaveFlag(false)
                                } else {
                                    setOperandSaveFlag(true)
                                }
                            }; break;
                        case 'DATE':
                            setCompareDateFlag(true)
                            setCompareCallFlag(false)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            let mentDataDate = val.agFeeDateDetailList
                            setCompareComputingMethodName('lbl.DATE-particulars')
                            val.agFeeDateDetailList ? setDateData(val.agFeeDateDetailList) : setDateData([])
                            val.agFeeDateDetailList.length > 0 ? val.agFeeDateDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataDate.splice(i, 1)
                                    setDateData([...mentDataDate])
                                } else {
                                    v.saveShowHide = false
                                    setDateData(val.agFeeDateDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setDateShow(false)
                            } else {
                                setDateShow(true)
                            }; break;
                        case 'CALL':
                            setCompareDateFlag(false)
                            setCompareCallFlag(true)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.CALL-particulars')
                            let mentDataCall = val.agFeeCallDetailList
                            val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                            val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataCall.splice(i, 1)
                                    setCallData([...mentDataCall])
                                } else {
                                    v.saveShowHide = false
                                    setCallData(val.agFeeCallDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setComputingMethod(false)
                            } else {
                                setComputingMethod(true)
                            }; break;
                        case 'CALL2':
                            setCompareDateFlag(false)
                            setCompareCallFlag(true)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.CALL2-particulars')
                            let mentDataCall2 = val.agFeeCallDetailList
                            val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                            val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataCall2.splice(i, 1)
                                    setCallData([...mentDataCall2])
                                } else {
                                    v.saveShowHide = false
                                    setCallData(val.agFeeCallDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setComputingMethod(false)
                            } else {
                                setComputingMethod(true)
                            }; break;
                        case 'MCALL':
                            setCompareDateFlag(false)
                            setCompareCallFlag(true)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.MCALL-particulars')
                            let mentDataMCall = val.agFeeCallDetailList
                            val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                            val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataMCall.splice(i, 1)
                                    setCallData([...mentDataMCall])
                                } else {
                                    v.saveShowHide = false
                                    setCallData(val.agFeeCallDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setComputingMethod(false)
                            } else {
                                setComputingMethod(true)
                            }; break;
                        case 'VOY':
                            setCompareDateFlag(false)
                            setCompareCallFlag(true)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.VOY-particulars')
                            let mentDataVoy = val.agFeeCallDetailList
                            val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                            val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataVoy.splice(i, 1)
                                    setCallData([...mentDataVoy])
                                } else {
                                    v.saveShowHide = false
                                    setCallData(val.agFeeCallDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setComputingMethod(false)
                            } else {
                                setComputingMethod(true)
                            }; break;
                        case 'VOY2':
                            setCompareDateFlag(false)
                            setCompareCallFlag(true)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.VOY2-particulars')
                            let mentDataVoy2 = val.agFeeCallDetailList
                            val.agFeeCallDetailList ? setCallData(val.agFeeCallDetailList) : null
                            val.agFeeCallDetailList.length > 0 ? val.agFeeCallDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataVoy2.splice(i, 1)
                                    setCallData([...mentDataVoy2])
                                } else {
                                    v.saveShowHide = false
                                    setCallData(val.agFeeCallDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setComputingMethod(false)
                            } else {
                                setComputingMethod(true)
                            }; break;
                        case 'VSHP':
                            let mentDataVshp
                            if (modifyFlagSele && val.agreementItemUuid == moId) {
                                if (modifyFlagSele != val.modifyFlag) {
                                    setChecked([])
                                    setVshpShow(false)
                                    setVshpFlag(false)
                                    //保存成功后才能使用
                                    setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0075' }) })
                                } else {
                                    setCompareDateFlag(false)
                                    setCompareCallFlag(false)
                                    setCompareVshpFlag(true)
                                    setCompareVteuFlag(false)
                                    setCompareBlFlag(false)
                                    setCompareAggFlag(false)
                                    setCompareDisFlag(false)
                                    setCompareComputingMethodName('lbl.VSHP-particulars')
                                    // console.log(val.agFeeVesselTeuDetailList, val.agFeeRateDetailList)
                                    if (val.modifyFlag == 'Y') {
                                        mentDataVshp = val.agFeeVesselTeuDetailList
                                        val.agFeeVesselTeuDetailList ? setVshpData(val.agFeeVesselTeuDetailList) : null
                                        val.agFeeVesselTeuDetailList.length > 0 ? val.agFeeVesselTeuDetailList.map((v, i) => {
                                            if (!v.methodUuid) {
                                                mentDataVshp.splice(i, 1)
                                                setVshpData([...mentDataVshp])
                                            } else {
                                                v.saveShowHide = false
                                                setVshpData(val.agFeeVesselTeuDetailList)
                                            }
                                        }) : null
                                    } else {
                                        mentDataVshp = val.agFeeRateDetailList
                                        val.agFeeRateDetailList ? setVshpDataTow(val.agFeeRateDetailList) : null
                                        val.agFeeRateDetailList.length > 0 ? val.agFeeRateDetailList.map((v, i) => {
                                            if (!v.methodUuid) {
                                                mentDataVshp.splice(i, 1)
                                                setVshpDataTow([...mentDataVshp])
                                            } else {
                                                v.saveShowHide = false
                                                setVshpDataTow(val.agFeeRateDetailList)
                                            }
                                        }) : null
                                    }
                                    setAgreementItemUuid(val.agreementItemUuid)
                                    if (!val.agreementItemUuid || itemFlag == false) {
                                        setVshpShow(false)
                                    } else {
                                        setVshpShow(true)
                                    }
                                }
                            } else {
                                setCompareDateFlag(false)
                                setCompareCallFlag(false)
                                setCompareVshpFlag(true)
                                setCompareVteuFlag(false)
                                setCompareBlFlag(false)
                                setCompareAggFlag(false)
                                setCompareDisFlag(false)
                                setCompareComputingMethodName('lbl.VSHP-particulars')
                                // console.log(val.agFeeVesselTeuDetailList, val.agFeeRateDetailList)
                                if (val.modifyFlag == 'Y') {
                                    mentDataVshp = val.agFeeVesselTeuDetailList
                                    val.agFeeVesselTeuDetailList ? setVshpData(val.agFeeVesselTeuDetailList) : null
                                    val.agFeeVesselTeuDetailList.length > 0 ? val.agFeeVesselTeuDetailList.map((v, i) => {
                                        if (!v.methodUuid) {
                                            mentDataVshp.splice(i, 1)
                                            setVshpData([...mentDataVshp])
                                        } else {
                                            v.saveShowHide = false
                                            setVshpData(val.agFeeVesselTeuDetailList)
                                        }
                                    }) : null
                                } else {
                                    mentDataVshp = val.agFeeRateDetailList
                                    val.agFeeRateDetailList ? setVshpDataTow(val.agFeeRateDetailList) : null
                                    val.agFeeRateDetailList.length > 0 ? val.agFeeRateDetailList.map((v, i) => {
                                        if (!v.methodUuid) {
                                            mentDataVshp.splice(i, 1)
                                            setVshpDataTow([...mentDataVshp])
                                        } else {
                                            v.saveShowHide = false
                                            setVshpDataTow(val.agFeeRateDetailList)
                                        }
                                    }) : null
                                }
                                setAgreementItemUuid(val.agreementItemUuid)
                                if (!val.agreementItemUuid || itemFlag == false) {
                                    setVshpShow(false)
                                } else {
                                    setVshpShow(true)
                                }
                            }

                            break;
                        case 'VTEU':
                            setCompareDateFlag(false)
                            setCompareCallFlag(false)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(true)
                            setCompareBlFlag(false)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.VTEU-particulars')
                            let mentDataVteu = val.agFeeVesselTeuDetailList
                            val.agFeeVesselTeuDetailList ? setVteuData(val.agFeeVesselTeuDetailList) : null
                            val.agFeeVesselTeuDetailList.length > 0 ? val.agFeeVesselTeuDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataVteu.splice(i, 1)
                                    setVteuData([...mentDataVteu])
                                } else {
                                    v.saveShowHide = false
                                    setVteuData(val.agFeeVesselTeuDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setVteuShow(false)
                            } else {
                                setVteuShow(true)
                            }; break;
                        case 'BL':
                            setCompareDateFlag(false)
                            setCompareCallFlag(false)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(true)
                            setCompareAggFlag(false)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.BL-particulars')
                            let mentDataBl = val.agFeeRateDetailList
                            val.agFeeRateDetailList ? setBlData(val.agFeeRateDetailList) : null
                            val.agFeeRateDetailList.length > 0 ? val.agFeeRateDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataBl.splice(i, 1)
                                    setBlData([...mentDataBl])
                                } else {
                                    v.saveShowHide = false
                                    setBlData(val.agFeeRateDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setBlShow(false)
                            } else {
                                setBlShow(true)
                            }; break;
                        case 'AGG':
                            setCompareDateFlag(false)
                            setCompareCallFlag(false)
                            setCompareVshpFlag(false)
                            setCompareVteuFlag(false)
                            setCompareBlFlag(false)
                            setCompareAggFlag(true)
                            setCompareDisFlag(false)
                            setCompareComputingMethodName('lbl.AGG-particulars')
                            let mentDataAgg = val.agFeeNaGroupDetailList
                            if (val.agFeeNaGroupDetailList) {
                                val.agFeeNaGroupDetailList.map((v, i) => {
                                    v.saveShowHide = false
                                })
                                // console.log(val.agFeeNaGroupDetailList)
                                setAggData([...val.agFeeNaGroupDetailList])
                            }
                            val.agFeeNaGroupDetailList.length > 0 ? val.agFeeNaGroupDetailList.map((v, i) => {
                                if (!v.methodUuid) {
                                    mentDataAgg.splice(i, 1)
                                    setAggData([...mentDataAgg])
                                } else {
                                    v.saveShowHide = false
                                    setAggData(val.agFeeNaGroupDetailList)
                                }
                            }) : null
                            setAgreementItemUuid(val.agreementItemUuid)
                            if (!val.agreementItemUuid || itemFlag == false) {
                                setAggShow(false)
                            } else {
                                setAggShow(true)
                            }; break;
                    }
                } else {
                    setCompareDateFlag(false)
                    setCompareCallFlag(false)
                    setCompareVshpFlag(false)
                    setCompareVteuFlag(false)
                    setCompareBlFlag(false)
                    setCompareAggFlag(false)
                    setCompareDisFlag(false)
                }
            }
        } else {
            setChecked([])
            emptyCalculationMethod()
            setMessageData({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0054' }) })
        }
        // console.log(computingMethodData)
        // console.log('新增禁用',operandSaveFlag,itemFlag,permissionsButton.authSave,'判断',itemFlag &&operandSaveFlag && permissionsButton.authSave ? false : true)

    }
    const emptyCalculationMethod = () => {
        setDateFlag(false)
        setCallFlag(false)
        setVshpFlag(false)
        setVteuFlag(false)
        setBlFlag(false)
        setAggFlag(false)
        setDisFlag(false)
        setRateFlag(false);
        setCompareDateFlag(false)
        setCompareCallFlag(false)
        setCompareVshpFlag(false)
        setCompareVteuFlag(false)
        setCompareBlFlag(false)
        setCompareAggFlag(false)
        setCompareDisFlag(false)
        //计算表格禁止新增数据
        setOperandSaveFlag(false)
        setComputingMethod(false)
        setVshpShow(false)
        setVteuShow(false)
        setBlShow(false)
        setAggShow(false)
    }
    return (
        <CosModal cbsDragCls='modal-drag-agg' cbsMoveCls='drag-move-agg' cbsTitle={title} cbsVisible={AIsModalVisible} cbsFun={handleCancel} width='100%' >
            {/* <div className='add'> */}
            <CosToast toast={messageData} />
            <div style={{ minWidth: '800px' }}>
                <div className='topBox'>
                    <Form
                        form={queryForm}
                        name='func'
                        onFinish={handleQuery}
                    >
                        <Row>
                            {/* 船东 */}
                            <SelectVal name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} disabled={shipperFlag} span={6} options={acquireData.values} />
                            {/* 公司 */}
                            <Selects name='companyCode' showSearch={true} label={<FormattedMessage id='lbl.company' />} disabled={detailsFlag && permissionsButton.authSave && compyFlag ? false : true} span={6} options={companysData} selectChange={companyIncident} />
                            {/* 代理编码 */}
                            <SelectVal name='agencyCode' label={<FormattedMessage id='lbl.agency' />} span={6} disabled={detailsFlag && permissionsButton.authSave && compyFlag ? false : true} options={agencyCode} />
                            {/* 子代理编码 */}
                            <SelectVal name='subAgencyCode' label={<FormattedMessage id='lbl.Son-agency-code' />} span={6} disabled={detailsFlag && permissionsButton.authSave ? false : true} options={agencyCode} />
                            {/* 代理描述 */}
                            <InputText name='agencyDescription' label={<FormattedMessage id='lbl.agent-described' />} disabled span={6} />
                            {/* 协议代码 */}
                            <InputText name='feeAgreementCode' label={<FormattedMessage id='lbl.agreement' />} disabled span={6} />
                            {/* 有效日期 */}
                            <DoubleDatePicker name='Date' label={<FormattedMessage id='lbl.valid-date' />} disabled={detailsFlag && permissionsButton.authSave && compyFlag ? [false, true] : [true, true]} />
                            {/* 是否生产性 */}
                            <SelectVal name='prdIndicator' label={<FormattedMessage id='lbl.productbility' />} disabled={detailsFlag && permissionsButton.authSave ? false : true} options={production.values} span={6} />
                            {/* 记账算法 */}
                            <SelectVal name='postCalculationFlag' label={<FormattedMessage id='lbl.arithmetic' />} disabled={detailsFlag && permissionsButton.authSave ? false : true} options={arithmetic.values} span={6} />
                            {/* 记账方式 */}
                            <SelectVal name='postMode' label={<FormattedMessage id='lbl.bookkeeping' />} disabled={detailsFlag && permissionsButton.authSave ? false : true} options={way.values} span={6} />
                            {/* 向谁预估 */}
                            <InputText name='ygSide' maxLength={10} label={<FormattedMessage id='lbl.estimate' />} disabled={detailsFlag && permissionsButton.authSave ? false : true} span={6} />
                            {/* 向谁开票 */}
                            <InputText name='yfSide' maxLength={10} label={<FormattedMessage id='lbl.make' />} disabled={detailsFlag && permissionsButton.authSave ? false : true} span={6} />
                            {/* 向谁报账 */}
                            <InputText name='sfSide' maxLength={10} label={<FormattedMessage id='lbl.submitanexpenseaccount' />} disabled={detailsFlag && permissionsButton.authSave ? false : true} span={6} />
                            {/* 预提是否记账 */}
                            <SelectVal name='isYt' label={<FormattedMessage id='lbl.withholding' />} options={tally.values} disabled={detailsFlag && permissionsButton.authSave ? false : true} span={6} />
                            {/* 应付实付是否记账 */}
                            <SelectVal name='isBill' label={<FormattedMessage id='lbl.actually' />} options={whether.values} disabled={detailsFlag && permissionsButton.authSave ? false : true} span={6} />
                        </Row>
                    </Form>
                </div>
                <div className='add-main-button'>
                    {/* 保存按钮 */}
                    <CosButton onClick={() => handleQuery('SAVE')} auth='AFCM_AGMT_AG_001_B06' style={{ display: permissionsButton.authSave ? 'inline-block' : 'none' }} disabled={buttonFlag} ><SaveOutlined /> <FormattedMessage id='btn.save' /></CosButton>
                    {/* 保存并提交审核按钮 */}
                    <CosButton onClick={() => handleQuery('SUBMIT')} auth='AFCM_AGMT_AG_001_B07' style={{ display: permissionsButton.authSubmit ? 'inline-block' : 'none' }} disabled={buttonFlag} ><FileProtectOutlined /><FormattedMessage id='btn.save-and-submit-for-review' /></CosButton>
                    {/* 口岸审核按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B08' style={{ display: permissionsButton.authKACheck ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => audit('KA_APPROVE')} ><FileProtectOutlined /><FormattedMessage id='lbl.port-audit' /></CosButton>
                    {/* 口岸解锁按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B09' style={{ display: permissionsButton.authAgencyUnlock ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => unlock('KA_UNLOCK')} ><UnlockOutlined /><FormattedMessage id='lbl.port-unlock' /></CosButton>
                    {/* 口岸协议退回按钮 '*/}
                    <CosButton auth='AFCM_AGMT_AG_001_B019' style={{ display: permissionsButton.authKaCancel ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => agreementBack('KA_CANCEL')} ><ImportOutlined /><FormattedMessage id='lbl.comm-port-back' /></CosButton>
                    {/* pmd审核按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B010' style={{ display: permissionsButton.authPMDCheck ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => audit('PMD_APPROVE')} ><FileProtectOutlined /><FormattedMessage id='lbl.pmd-audit' /></CosButton>
                    {/* pmd解锁按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B011' style={{ display: permissionsButton.authPMDUnlock ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => unlock('PMD_UNLOCK')} ><UnlockOutlined /><FormattedMessage id='lbl.pmd-unlock' /></CosButton>
                    {/* PMD协议退回按钮 '*/}
                    <CosButton auth='AFCM_AGMT_AG_001_B018' style={{ display: permissionsButton.authCancel ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => agreementBack('PMD_CANCEL')} ><ImportOutlined /><FormattedMessage id='lbl.comm-pmd-back' /></CosButton>
                    {/* 网点审核按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B012' style={{ display: permissionsButton.authWDCheck ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => audit('WD_APPROVE')} ><FileProtectOutlined /><FormattedMessage id='lbl.branch-audit' /></CosButton>
                    {/* 网点解锁按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B013' style={{ display: permissionsButton.authWDUnlock ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => unlock('WD_UNLOCK')} ><UnlockOutlined /><FormattedMessage id='lbl.branch-unlock' /></CosButton>
                    {/* 网点协议退回按钮 '*/}
                    <CosButton auth='AFCM_AGMT_AG_001_B020' style={{ display: permissionsButton.authWdCancel ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => agreementBack('WD_CANCEL')} ><ImportOutlined /><FormattedMessage id='lbl.comm-branch-back' /></CosButton>
                    {/* 共享审核按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B014' style={{ display: permissionsButton.authShareCenterCheck ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => audit('GX_APPROVE')} ><FileProtectOutlined /><FormattedMessage id='lbl.share-audit' /></CosButton>
                    {/* 共享解锁按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B015' style={{ display: permissionsButton.authShareCenterUnlock ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => unlock('GX_UNLOCK')} ><UnlockOutlined /><FormattedMessage id='lbl.share-unlock' /></CosButton>
                    {/* 共享协议退回按钮 '*/}
                    <CosButton auth='AFCM_AGMT_AG_001_B021' style={{ display: permissionsButton.authGxCancel ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => agreementBack('GX_CANCEL')} ><ImportOutlined /><FormattedMessage id='lbl.comm-share-back' /></CosButton>
                    {/* FAD审核按钮  */}
                    <CosButton auth='AFCM_AGMT_AG_001_B016' style={{ display: permissionsButton.authFADCheck ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => audit('FAD_APPROVE')} ><FileProtectOutlined /><FormattedMessage id='btn.fad-audit' /></CosButton>
                    {/* FAD解锁按钮 */}
                    <CosButton auth='AFCM_AGMT_AG_001_B017' style={{ display: permissionsButton.authFADUnlock ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => unlock('FAD_UNLOCK')} ><UnlockOutlined /><FormattedMessage id='lbl.fad-unlock' /></CosButton>
                    {/* FAD协议退回按钮 '*/}
                    <CosButton auth='AFCM_AGMT_AG_001_B022' style={{ display: permissionsButton.authFadCancel ? 'inline-block' : 'none' }} disabled={buttonFlag} onClick={() => agreementBack('FAD_CANCEL')} ><ImportOutlined /><FormattedMessage id='lbl.comm-fad-back' /></CosButton>
                </div>
                <div className='groupBox'>
                    <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                        {/* 协议item */}
                        <TabPane tab={<FormattedMessage id='lbl.agreement-item' />} key="1">
                            {/*新增item按钮*/}
                            <Button disabled={itemFlag && permissionsButton.authSave ? false : true} style={{ margin: '0 0 5px 10px' }} onClick={addItem}><PlusOutlined /></Button>
                            {/* item表格 */}
                            <div className="table">
                                <PaginationTable
                                    dataSource={dataSource}
                                    columns={addColumns}
                                    //agreementItemUuid
                                    rowKey='agreementItemUuid'
                                    rowSelection={{
                                        selectedRowKeys: checked,
                                        onChange: (key, row) => {
                                            setChecked(key);
                                            setUuid(row);
                                            setSelectedRows(row, key);
                                        }
                                    }}
                                    pagination={false}
                                    selectionType='radio'
                                    scrollHeightMinus={200}
                                />
                            </div>
                            {/* ----------------计算方法---------------- */}
                            {/* 箱量法(CNT/CNT2)计算方法明细 */}
                            {disFlag ? <div>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/* disabled={btnFlag} */}
                                <Button disabled={itemFlag && operandSaveFlag && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={addItemDetailed}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={computingMethodData}
                                    columns={computingMethodColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 时间(DATE)计算方法明细 */}
                            {dateFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/*  */}
                                <Button disabled={itemFlag && dateShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={dateaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={dateData}
                                    columns={DATEColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* CALL/CALL2/MCALL/VOY/VOY2 计算方法明细 */}
                            {callFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/* disabled={btnFlag}*/}
                                <Button disabled={itemFlag && computingMethod && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={calladdItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={callData}
                                    columns={CALLColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 船舶吨位法(VSHP)计算方法明细 */}
                            {vshpFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/*  */}
                                <Button disabled={itemFlag && vshpShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={vshpaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={dataSource[itemdataIndex] ? dataSource[itemdataIndex].modifyFlag == 'Y' ? vshpData : vshpDataTow : []}
                                    columns={VSHPColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* VTEU计算方法明细 */}
                            {vteuFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/* disabled={btnFlag}  */}
                                <Button disabled={itemFlag && vteuShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={vteuaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={vteuData}
                                    columns={VTEUColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 提单法(BL)计算方法明细 */}
                            {blFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/* disabled={btnFlag} */}
                                <Button disabled={itemFlag && blShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={bladdItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={blData}
                                    columns={BLColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 北美箱量累进(AGG)计算方法明细 */}
                            {aggFlag ? <div>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
                                {/* disabled={btnFlag} */}
                                <Button disabled={itemFlag && aggShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={aggaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={aggData}
                                    columns={AGGColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}

                            {/* -------------------------------择大计算方法----------------------------------- */}
                            {/* 箱量法(CNT)计算方法明细 */}
                            {compareDisFlag ? <div>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/* disabled={btnFlag} */}
                                <Button disabled={itemFlag && operandSaveFlag && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={addItemDetailed}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={computingMethodData}
                                    columns={computingMethodColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 时间(DATE)计算方法明细 */}
                            {compareDateFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/*  */}
                                <Button disabled={itemFlag && dateShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={dateaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={dateData}
                                    columns={DATEColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* CALL/CALL2/MCALL/VOY/VOY2 计算方法明细 */}
                            {compareCallFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/* disabled={btnFlag}*/}
                                <Button disabled={itemFlag && computingMethod && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={calladdItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={callData}
                                    columns={CALLColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 船舶吨位法(VSHP)计算方法明细 */}
                            {compareVshpFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/*  */}
                                <Button disabled={itemFlag && vshpShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={vshpaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={dataSource[itemdataIndex].modifyFlag == 'Y' ? vshpData : vshpDataTow}
                                    columns={VSHPColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* VTEU计算方法明细 */}
                            {compareVteuFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/* disabled={btnFlag}  */}
                                <Button disabled={itemFlag && vteuShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={vteuaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={vteuData}
                                    columns={VTEUColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 提单法(BL)计算方法明细 */}
                            {compareBlFlag ? <div style={{ width: '50%' }}>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/* disabled={btnFlag} */}
                                <Button disabled={itemFlag && blShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={bladdItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={blData}
                                    columns={BLColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}
                            {/* 北美箱量累进(AGG)计算方法明细 */}
                            {compareAggFlag ? <div>
                                <div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                {/* disabled={btnFlag} */}
                                <Button disabled={itemFlag && aggShow && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={aggaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={aggData}
                                    columns={AGGColumns}
                                    pagination={false}
                                    rowKey="methodUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />
                            </div> : null}

                            {/* ------------------------------------------------------------------ */}

                            {/* 特殊费率 */}
                            {
                                rateFlag ? <div style={{ width: '50%' }}>
                                    <div style={{ padding: '10px 0px 10px 10px' }}><FormattedMessage id='lbl.afcm-0079' /></div>
                                    <Button disabled={itemFlag ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={rateaddItem}><PlusOutlined /></Button>
                                    <PaginationTable
                                        dataSource={rateData}
                                        columns={rateColumns}
                                        pagination={false}
                                        rowKey="agreementPanDetailUuid"
                                        rowSelection={null}
                                        scrollHeightMinus={200}
                                    />
                                </div> : null
                            }
                        </TabPane>
                        {/* 箱型尺寸组明细 */}
                        <TabPane tab={<FormattedMessage id='lbl.box-size-group-details' />} key="2">
                            <div style={{ width: '40%', border: '1px solid #countDatacountData', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
                                <div><FormattedMessage id='lbl.box-size-information' />  </div><br />
                                <ul className="list" ref={boxSizeref}>
                                    <li style={{ height: 20 }}>
                                        {/* 操作 */}
                                        <div><FormattedMessage id='lbl.operate' /> </div>
                                        {/* 详情 */}
                                        <div><FormattedMessage id='lbl.particulars' /> </div>
                                        {/* 详情尺寸组 */}
                                        <div>
                                            <FormattedMessage id='lbl.Box-size-group' />
                                        </div>
                                    </li>
                                    {commissionAgmtCntrSizeTypeGroups.map((item, index) => {
                                        return <li key={index}>
                                            <div>
                                                {/* disabled={btnFlag} disabled={btnFlag}  */}
                                                {/* 编辑左侧详情尺寸组 */}
                                                <a disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => editAddSuccessBoxSize(item)}><FormOutlined /></a>
                                                {/* 删除左侧箱型尺寸组 */}
                                                <a disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => deleteAddSuccessBoxSize(item)}><CloseCircleOutlined style={{ color: itemFlag && permissionsButton.authSave ? 'red' : '#ccc' }} /></a>
                                            </div>

                                            <div><RightCircleOutlined className={openBoxSizedetailIndex == index ? "is-open-boxsize" : ""} onClick={() => openBoxSizedetail(index)} /></div>
                                            <div><RightCircleOutlined style={{ visibility: 'hidden' }} />{item && item.containerSizeTypeGroup || <small>&nbsp;</small>}</div>
                                            <ul style={{ display: openBoxSizedetailIndex === index ? 'block' : 'none' }}>
                                                <li style={{ height: 20 }}>
                                                    <span></span>
                                                    {/* 箱型尺寸组名字 */}
                                                    <div style={{ background: '#95B3D7' }}> <FormattedMessage id='lbl.Box-size-name' /> </div>
                                                    {/* 箱型尺寸组 */}
                                                    <div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.Box-size' /> </div>
                                                </li>

                                                {item && item.agContainerSizeTypeGroupList.map((val, idx) => {
                                                    return <li key={idx}>
                                                        <span></span>
                                                        <div>{val.containerSizeTypeGroup}</div>
                                                        <div>{val.containerSizeType}</div>
                                                    </li>
                                                })}
                                            </ul>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            <div className='box-size-group' >
                                {/*  className='box-size-group-top'  */}
                                {/* 箱型尺寸组新增画面 */}
                                <div><FormattedMessage id='lbl.box-size-add-frame' /></div>
                                <div className='box-size-group-main'>
                                    <Form form={queryForm}>
                                        {/* 头部的箱型尺寸组输入框 */}
                                        <Row className='box-size-group-main-input'>
                                            {/* 箱型尺寸名字 */}
                                            <InputText maxLength={5} disabled={groupFlag && permissionsButton.authSave ? false : true} isSpan={true} span={10} name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Box-size-name' />} />
                                        </Row>
                                        <Row className='box-size-group-main-input'>
                                        </Row>
                                        <Row className='box-size-group-main-input'>
                                            <div className='box-size-group-main-input-left'>
                                                <div className='box-size'>
                                                    {/* 箱型尺寸 */}
                                                    <FormattedMessage id='lbl.Box-size' />
                                                </div>
                                                <ul className='box-size-ul'>
                                                    {
                                                        groupInit ? groupInit.map((v, i) => {
                                                            return <li onClick={() => changeIdx(i)} className={currentIndex == i ? 'current' : ''} key={i} style={{ height: '25px', lineHeight: '25px', cursor: 'pointer' }}><span>{v}</span></li>
                                                        }) : ""
                                                    }
                                                </ul>
                                            </div>
                                            <div className="box-size-group-main-input-center-button">
                                                {/* 添加指定箱型尺寸信息 */}
                                                <Button disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={rightBtn}><RightOutlined /></Button>
                                                {/* 添加全部箱型尺寸 */}
                                                <Button disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={addAllBoxDetail}><DoubleRightOutlined /></Button>
                                                {/* 删除指定箱型尺寸 */}
                                                <Button disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={deleteBoxSize}><LeftOutlined /></Button>
                                                {/* 删除全部箱型尺寸 */}
                                                <Button disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={deleteAllBoxDetail}><DoubleLeftOutlined /></Button>
                                            </div>
                                            <div className="box-size-group-main-input-bottom" >
                                                <div className='box-size-detail'>
                                                    {/* 箱型尺寸详细 */}
                                                    <FormattedMessage id='lbl.Box-size-detailed' />
                                                </div>
                                                <PaginationTable
                                                    dataSource={sizeDetailedTable}
                                                    columns={sizeDetailedColumns}
                                                    rowKey='id'
                                                    scroll={{ y: 100 }}
                                                    // setSelectedRows={getSelectedRows}
                                                    rowSelection={{
                                                        selectedRowKeys: checkedGroup,
                                                        onChange: (key, row) => {
                                                            setCheckedGroup(key);
                                                            setCheckedRow(row);
                                                            getSelectedRows(row);
                                                        }
                                                    }}
                                                    pagination={false}
                                                    scroll={{ y: 230 }}
                                                />
                                            </div>
                                        </Row>
                                        <Row style={{ margin: '15px 0', float: 'right', marginRight: '10px' }}>
                                            {/* 保存全部箱型尺寸 */}
                                            <Col style={{ marginRight: '15px' }}><Button disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={() => { saveBoxSize('UPD') }}><FormattedMessage id='lbl.preservation-box-size' /></Button></Col>
                                            {/* 重置箱型尺寸 */}
                                            <Col><Button disabled={itemFlag && permissionsButton.authSave ? false : true} onClick={resetBoxSize}><FormattedMessage id='lbl.reset-box-size' /></Button></Col>
                                        </Row>
                                    </Form>
                                </div>
                            </div>
                        </TabPane>
                        {/* 航线组明细 */}
                        <TabPane tab={<FormattedMessage id='lbl.airline-group-details' />} key="3">
                            <div style={{ width: '38%' }}>
                                <Button disabled={airlineFlag && permissionsButton.authSave ? false : true} style={{ margin: '0 0 10px 10px' }} onClick={groupaddItem}><PlusOutlined /></Button>
                                <PaginationTable
                                    dataSource={airlineData}
                                    columns={AirlinesGroup}
                                    pagination={false}
                                    rowKey="agreementServiceGroupUuid"
                                    rowSelection={null}
                                    scrollHeightMinus={200}
                                />

                            </div>
                        </TabPane>
                    </Tabs>
                </div>

            </div>

            <Loading spinning={spinflag} />
        </CosModal>
    )
}
export default agencyFeeAgmtEdit

