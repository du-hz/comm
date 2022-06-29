import React, { useState,useEffect,$apiUrl,useContext} from 'react'
import {FormattedMessage, formatMessage,useIntl} from 'umi'
import { Form,Modal, Button ,Row,Table, Input, Select,Tooltip,InputNumber ,Tabs,DatePicker,Space ,Col } from 'antd';
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectData,momentFormat } from '@/utils/commonDataInterface';
import moment from 'moment';
import request from '@/utils/request';
import Selects from '@/components/Common/Select'
import SelectVal from '@/components/Common/Select';
import InputText from '@/components/Common/InputText'
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { Toast } from '@/utils/Toast'
import {CosToast}  from '@/components/Common/index'
import Loading from '@/components/Common/Loading'
// import InputNumber from '@/components/Common/IptNumber'
import CosModal from '@/components/Common/CosModal'
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
    EditOutlined,
    RightCircleOutlined,
    UnlockOutlined
} from '@ant-design/icons'
import { result, stubFalse } from 'lodash';


const confirm = Modal.confirm
const AgEdit = (props) => {

    const [acquireData, setAcquireData] = useState({}); // 船东
    const [agreementType,setAgreementType] = useState([]);    //协议类型
    const [outBoundInboundIndicator,setOutBoundInboundIndicator] = useState ([]) //进出口标志
    const intl = useIntl();  //用于处理使用formatMessagei拼接字段导致的warning 
    const [lastCondition, setLastCondition] = useState({
        "shipownerCompanyCode": null,
        "companyCode": null,
        "agencyCode": null,
        "feeAgreementCode": null,
        'agencyDescription':null,
        "prdIndicator":'',
        "postCalculationFlag":null,
        "postMode":null,
        "ygSide":null,
        "yfSide":null,
        "sfSide":null,
        "isYt":null,
        "isBill":null,
        'fromDate':null,
        'toDate':null,
    });
	const [btnsFlag, setBtnsFlag] = useState([]);
    const [dataSource,setDataSource] = useState ([])//新增表格数据
    const [tally,setTally] = useState ({}) //预提是否记账
    const [whether,setWhether] = useState ({})//通用的是否
    const [production,setProduction] = useState ({})//是否生产性
    const [way,setWay] = useState ({})//记账方式
    const [arithmetic,seArithmetic] = useState ({})//记账算法

    const [disFlag, setDisFlag] = useState(false);  // 箱量计算方法明细显示隐藏
    const [dateFlag, setDateFlag] = useState(false);  // 时间(DATE)计算方法明细
    const [callFlag, setCallFlag] = useState(false);  // CALL/CALL2/MCALL/VOY/VOY2 计算方法明细
    const [vshpFlag, setVshpFlag] = useState(false);  // 船舶吨位法(VSHP)计算方法明细
    const [vteuFlag, setVteuFlag] = useState(false);  // VTEU计算方法明细
    const [blFlag, setBlFlag] = useState(false);  // 提单法(BL)计算方法明细
    const [aggFlag, setAggFlag] = useState(false);  // 北美箱量累进(AGG)计算方法明细
    
    const [compareDisFlag, setCompareDisFlag] = useState(false);  // 箱量计算方法明细显示隐藏
    const [compareDateFlag, setCompareDateFlag] = useState(false);  // 时间(DATE)计算方法明细
    const [compareCallFlag, setCompareCallFlag] = useState(false);  // CALL/CALL2/MCALL/VOY/VOY2 计算方法明细
    const [compareVshpFlag, setCompareVshpFlag] = useState(false);  // 船舶吨位法(VSHP)计算方法明细
    const [compareVteuFlag, setCompareVteuFlag] = useState(false);  // VTEU计算方法明细
    const [compareBlFlag, setCompareBlFlag] = useState(false);  // 提单法(BL)计算方法明细
    const [compareAggFlag, setCompareAggFlag] = useState(false);  // 北美箱量累进(AGG)计算方法明细
    const [operandSaveFlag,setOperandSaveFlag] = useState(true);//箱量计算方法保存是否禁用
    const [computingMethod,setComputingMethod] = useState(true);//call计算方法是否禁用
    const [vshpShow,setVshpShow] = useState(true);//vshp计算方法是否禁用
    const [vteuShow,setVteuShow] = useState(true);//vteu计算方法是否禁用
    const [blShow,setBlShow] = useState(true);//bl计算方法是否禁用
    const [aggShow,setAggShow] = useState(true);//agg计算方法是否禁用
    const [dateShow,setDateShow] = useState(true)
    const [comparecalculationMethod, setCompareCalculationMethod] = useState('')//择大计算方法
    const [computingMethodData,setComputingMethodData] = useState([])//箱量表格数据
    const [dateData,setDateData] = useState([])//时间(DATE)计算方法表格数据
    const [callData,setCallData] = useState([])//ALL/CALL2/MCALL/VOY/VOY2 计算方法表格数据
    const [vshpData,setVshpData] = useState([])//船舶吨位法(VSHP)计算法表格数据
    const [vshpDataTow, setVshpDataTow] = useState([])//船舶吨位法(VSHP)计算法表格数据
    const [vteuData,setVteuData] = useState([])//VTEU计算法表格数据
    const [blData, setBlData] = useState([]);  // 提单法(BL)计算方法表格数据
    const [aggData, setAggData] = useState([]);  // 北美箱量累进(AGG)计算方法表格数据
    const [rateData, setRateData] = useState([]);  // 特殊费率
    const [rateFlag, setRateFlag] = useState(false);  // 特殊费率
    const [maxFlag, setMaxFlag] = useState(true);  // 择大收取计算方法是否禁用
    const [vvData,setVvData] = useState([]);///
    const [airlineData,setairlineData] = useState([])//新增航线组数据
    const [airlineCode,setAirlineCode] =useState([])//航线代码

    const [groupInit, setGroupInit] = useState([]);//箱型尺寸数据
    // 箱型尺寸详细-数据
	const [sizeDetailedTable, setSizeDetailedTable] = useState([]);
	const [newSizeDetailedTable, setNewSizeDetailedTable] = useState([]);
    
    
    const [allWhether,setAllWhether] = useState ({})//通用的是否
    const [codeType,setCodeType] = useState ({})//参考代码类型
    const [selfOwnedVessels,setSelfOwnedVessels] = useState ({})//是否自有船
    const [countMethod ,setCountMethod ] = useState ({})//代理费计算方法
    const [chooseBigCharge,setChooseBigCharge] = useState ({})//择大收取计算方法

    const [costKey,setCostKey] = useState ([])//费用大类
    const [subclass,setSubclass] = useState ([])//费用小类

    const [emptyFullIndicator,setEmptyFullIndicator] = useState({})//空重箱标志
    const [transmitIndicator,setTransmitIndicator] = useState({})//进/出/中转
    const [feeCurrencyCode,setFeeCurrencyCode] = useState({})//币种
    const [socIndicator,setSocIndicator] = useState({})//SOC
    const [unitPriceType,setUnitPriceType] = useState({})//单价类型
    const [cargoProperty,setCargoProperty] = useState({})//内贸/外贸
    const [groupCode,setGroupCode] = useState({})//分组号码
    const [containerSizeTypeGroup,setContainerSizeTypeGroup] = useState([])//箱型尺寸组
    const [calculationPeriod,setCalculationPeriod] = useState({})//日期周期
    const [deletValue,setDeletValue] = useState([])//计算方法的value

    const [agreementHeadUuid,setAgreementHeadUuid] = useState('')//head头部的uuid
    const [feeAgreementCode,setFeeAgreementCode] =useState('')//协议代码

    const [computingMethodName,setComputingMethodName] = useState([])//计算方法表格头部
    const [commissionAgmtCntrSizeTypeGroups, setCommissionAgmtCntrSizeTypeGroups] = useState([])
    const [isEditBoxSize,setIsEditBoxSize] = useState('NEW')
    const [defaultKey, setDefaultKey] = useState('1');
    const [agreementItemUuid,setAgreementItemUuid] = useState('')//item的uuid
    const [agFeeServiceGroupList,setagFeeServiceGroupList] = useState('')//航线组的uuid
    const [recordVal,setRecordVal] = useState({})//选择item中的radio
    const [infoTips, setInfoTips] = useState({});   //message info
    const [itemIndex,setItemIndex] = useState('')//获取id
    const [calculationMethod,setCalculationMethod] = useState('')//计算方法
    const [subClassAll,setSubClassAll] = useState ([])//费用小类
    const [cal, setCal] = useState({})//是否含税价
    const [modifyFlagSele,setModifyFlagSele] = useState('')
    const [compareComputingMethodName, setCompareComputingMethodName] = useState([])//择大计算方法表格头部
    const [calculationMethodRadio, setCalculationMethodRadio] = useState('')//计算方法
    const [comparecalculationMethodRadio, setCompareCalculationMethodRadio] = useState('')//择大计算方法
    const [modifyFlagRadio,setModifyFlagRadio] = useState('')//是否阶梯费率
    const [compareIndicatorRadio,setCompareIndicatorRadio] = useState(' ')//是否择大选取
    const [tsIndicator,setTsIndicator] = useState('') //特殊费率
    const [moId, setMoId] = useState('')
    const [spinflag, setSpinflag] = useState(false);     // 加载
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
        btnIndex, 
        companysData,//公司
    }=props.addEdit;

    const [queryForm] = Form.useForm();

    useEffect( () => {
        acquireSelectData('CB0068',setAcquireData, $apiUrl);// 船东
        acquireSelectData('AFCM.AGMT.TYPE', setAgreementType, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.YT.BUSINESS', setTally, $apiUrl);//预提是否记账
        acquireSelectData('COMM.SOC.EMPTY.IND',setProduction,$apiUrl);//是否生产性
        acquireSelectData('AFCM.AGMT.POST.CALC.MODE',setWay,$apiUrl);//记账方式
        acquireSelectData('AFCM.AGMT.POST.CALC.FLAG',seArithmetic,$apiUrl);//记账算法
        acquireSelectData('AFCM.AGMT.INOUTBOUND', setOutBoundInboundIndicator, $apiUrl);// 协议类型
        acquireSelectData('AFCM.AGMT.YF.BUSINESS',setWhether,$apiUrl);//应付实付是否记账

        acquireSelectData('COMM0001',setAllWhether,$apiUrl)//通用是否
        acquireSelectData('AFCM.AGMT.HERY.TYPES',setCodeType,$apiUrl)//参考代码类型
        acquireSelectData('COMM.SOC.EMPTY.IND',setSelfOwnedVessels,$apiUrl)//是否自有船
        acquireSelectData('AFCM.AGMT.CALC.MODES.BYCNT',setCountMethod,$apiUrl)//代理费计算方法
        // acquireSelectData('AFCM.AGMT.CALC.MODES',setChooseBigCharge,$apiUrl)//择大收取计算方法
        acquireSelectData('AFCM.AGMT.CALC.MODES.CALCMODES',setChooseBigCharge,$apiUrl)//择大收取计算方法
        acquireSelectData('COMM.SOC.EMPTY.IND',setEmptyFullIndicator,$apiUrl)//空重箱标志
        acquireSelectData('AGMT.AG.FEE.TRANSMIT',setTransmitIndicator,$apiUrl)//进/出/中转
        acquireSelectData('AFCM.AGMT.COMM.CURR.CODE',setFeeCurrencyCode,$apiUrl)//币种
        acquireSelectData('AGMT.AG.FEE.SOCIND',setSocIndicator,$apiUrl)//SOC
        acquireSelectData('AGMT.AG.FEE.UNITPRICE.TYPE',setUnitPriceType,$apiUrl)//单价类型
        acquireSelectData('AGMT.AG.FEE.CARGOPROP',setCargoProperty,$apiUrl)//内贸/外贸
        acquireSelectData('AGMT.AG.FEE.GROUPCODE',setGroupCode,$apiUrl)//分组号码
        acquireSelectData('AGMT.AG.FEE.DATEPERIOD',setCalculationPeriod,$apiUrl)//日期周期
        acquireSelectData('AFCM.AGMT.CARGO.NATURE.CODE', setNatureCode, $apiUrl);// 货类
        acquireSelectData('AGMT.VAT.FLAG', setCal, $apiUrl)//是否含税价
        getData()
        dataSource==undefined?[]:[]
        AIsModalVisible?stateFlag():null
        AIsModalVisible?subcalss():''
    } , [btnData,AIsModalVisible] )

    useEffect (()=>{
        setRateFlag(false); // 特殊费率初始化弹出窗隐藏
        addData?queryForm.setFieldsValue({
            postCalculationFlag:'0',//记账算法
            postMode:'0',//记账方式
            isYt:'0',//预提是否记账
            isBill:'0',//应付实付是否记账
            prdIndicator:'*',//是否生产性
            Date: ['',moment(toDate)],
        }):null
    },[toDate,addData])
    useEffect(() => {
        compileData?compile():null; 
    }, [compileData])
    // 小类
    const subcalss = ()=>{
        setSubClassAll([])
        if(costKey.length>0){
            setSubClassAll([])
            costKey.map((value,index)=>{
                let feeTypes = value.listAgTypeToClass
                feeTypes.map((v,i)=>{
                    v['value']=v.feeCode
                    v['label']=v.feeCode+'(' + v.feeName +')';
                    subClassAll.push(v)
                })
                setSubClassAll([...subClassAll])
            })
        }
    }
    //编辑传过来的数据
   const compile = () =>{
        if(compileData){
            if(compileData.prdIndicator=='null'){
                compileData.prdIndicator='*'
            }
        }
        queryForm.setFieldsValue({
            ...compileData,
            Date: [moment(compileData.fromDate),moment(compileData.toDate)],
        })
       let  agFeeAgreementItemList = compileData.afcmpreAgFeeAgreementItems
       setAgreementHeadUuid(compileData.agreementHeadUuid)
       setFeeAgreementCode(compileData.feeAgreementCode)
       agFeeAgreementItemList?setDataSource(agFeeAgreementItemList):[]
       agFeeAgreementItemList? agFeeAgreementItemList.map((v,i)=>{
            setCallData(v.afcmpreAgFeeCallDetails)  //ALL/CALL2/MCALL/VOY/VOY2 计算方法表格数据
            setComputingMethodData(v.afcmpreAgFeeContainerPrices)  //箱量法(CNT/CNT2)计算方法明细 
            setDateData(v.afcmpreAgFeeDateDetails)  //时间(DATE)计算方法表格数据
            // setVshpData(v.afcmpreAgFeeDetailPans)   //船舶吨位法(VSHP)计算法表格数据
            setVshpData(v.afcmpreAgFeeVesselTeuDetails)   //船舶吨位法(VSHP)计算法表格数据
            setVteuData(v.afcmpreAgFeeVesselTeuDetails)  //VTEU计算法表格数据
            setBlData(v.afcmpreAgFeeRateDetails)   //提单法(BL)计算方法表格数据
            setAggData(v.afcmpreAgFeeNaGroupDetails)  //北美箱量累进(AGG)计算方法表格数据
            setRateData(v.afcmpreAgFeeDetailPans)
        }):null;
        let agFeeServiceGroupList = compileData.afcmpreAgFeeServiceGroups
        agFeeServiceGroupList?setairlineData([...agFeeServiceGroupList]):[]
        let agContainerSizeTypeGroupList=compileData.agContainerSizeTypeGroupList
        agContainerSizeTypeGroupList?setCommissionAgmtCntrSizeTypeGroups(agContainerSizeTypeGroupList):null  
   }

   const btnData = [
    {
        icon:<SaveOutlined />,
        label:<FormattedMessage id='lbl.save' />,
    },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.submit-audit' />,
    // },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.pmd-audit' />,
    // },
    // {
    //     icon:<UnlockOutlined />,
    //     label:<FormattedMessage id='lbl.pmd-unlock' />,
    // },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.port-audit' />,
    // },
    // {
    //     icon:<UnlockOutlined />,
    //     label:<FormattedMessage id='lbl.port-unlock' />,
    // },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.branch-audit' />,
    // },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.branch-unlock' />,
    // },
    // {
    //     icon:<UnlockOutlined />,
    //     label:<FormattedMessage id='lbl.share-audit' />,
    // },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.share-unlock' />,
    // },
    // {
    //     icon:<FileProtectOutlined />,
    //     label:<FormattedMessage id='lbl.fad-audit' />,
    // },
    // {
    //     icon:<UnlockOutlined />,
    //     label:<FormattedMessage id='lbl.fad-unlock' />,
    // },
    // {
    //     icon:<ImportOutlined />,
    //     label:<FormattedMessage id='lbl.agreement-send-back' />
    // }
];

   const allBtn = (idx) => {
    Toast('', '', '', 5000, false);
    switch (true) {
        case idx == 0:	// 保存
            handleQuery('SAVE');
            break;
        // case idx == 1:	// 提交审核
        //     handleQuery('SUBMIT');	
        //     break;	
        // case idx == 2:	// PMD审核
        //     audit('PMD_APPROVE');
        //     break;
        // case idx == 3:	// PMD解锁
        //     unlock('PMD_UNLOCK');
        //     break;
        // case idx == 4:	// 口岸审核
        //     audit('KA_APPROVE');
        //     break;
        // case idx == 5:	// 口岸解锁
        //     unlock('KA_UNLOCK');
        //     break;
        // case idx == 6:	// 网点审核
        //     audit('WD_APPROVE');
        //     break;
        // case idx == 7:	// 网点解锁
        //     unlock('WD_UNLOCK');
        //     break;
        // case idx == 8:	// 共享审核
        //     audit('FAD_APPROVE');
        //     break;
        // case idx == 9:	// 共享解锁
        //     unlock('FAD_UNLOCK');
        //     break;
        // case idx == 10:	// FAD审核
        //     audit('FAD_APPROVE');
        //     break;
        // case idx == 11:	// FAD解锁
        //     unlock('FAD_UNLOCK');
        //     break;
        // case idx == 12:	// 协议退回
        //     agreementBack('CANCEL');
        //     break;
    }
}
   const stateFlag = () =>{
       {/* 保存, 提交审核, PMD审核, PMD解锁, 口岸审核, 口岸解锁, 网点审核, 网点解锁, 共享审核, 共享解锁, FAD审核, FAD解锁, 协议退回 */ }
		// authSave				保存
		// authSubmit				保存并提交审核
		// authPMDCheck			PMD审核
		// authKACheck				口岸审核
		// authWDCheck				网点审核
		// authFADCheck			FAD审核
		// authShareCenterCheck	共享中心审核
		// authCancel				协议退回
		// authPMDUnlock			PMD解锁
		// authFADUnlock			FAD解锁
        // authAgencyUnlock		代理解锁
        let flagD = [];
        if(buttonFlag){
            if(btnIndex == '0' || btnIndex == '1') {//口岸
                flagD = [true, true, true, true, true, true, 'none', 'none', 'none', 'none', true, true, true];
            } else if(btnIndex == '2' || btnIndex == '3'){//网点
                flagD = [true, true, 'none', 'none', 'none', 'none', true, true, true, true, 'none', 'none', true ];
            }
        }else{	
            if(btnIndex == '0' || btnIndex == '1') {
                if(compileData.length == 0) {	// 新建
                    flagD = [false, false, true, true, true, true, 'none', 'none', 'none', 'none', true, true, true ];
                } else if(compileData.agreementStatus == "D" || compileData.agreementStatus == "W" || compileData.agreementStatus == "U") {	// 待处理		
                    flagD = [!compileData.authSave, !compileData.authSubmit, !compileData.authPMDCheck, !compileData.authPMDUnlock, !compileData.authKACheck, !compileData.authAgencyUnlock, 'none', 'none', 'none', 'none', !compileData.authFADCheck, !compileData.authFADUnlock, !compileData.authCancel];
                }
            } else if(btnIndex == '2' || btnIndex == '3'){
                if(compileData.length == 0) {	// 新建
                    flagD = [false, false, 'none', 'none', 'none', 'none', true, true, true, true, 'none', 'none', true ];
                } else if(compileData.agreementStatus == "D" || compileData.agreementStatus == "W" || compileData.agreementStatus == "U") {	// 待处理	
                    flagD = [!compileData.authSave, !compileData.authSubmit, 'none', 'none', 'none', 'none', !compileData.authWDCheck, true, !compileData.authShareCenterCheck, true, 'none', 'none', !compileData.authCancel];
                }
            }
        }
        setBtnsFlag([...flagD])
   }

    // tab切换
    const { TabPane } = Tabs;
    const callback = (key) => {
        setInfoTips({})
		Toast('', '', '', 5000, false);
        setDefaultKey(key);
        setChecked([])
        setAgreementItemUuid("")
        setShowFlag(true);  
    }
     //公司和代理编码的联动
     const  companyIncident = async (value,all) => {
        queryForm.setFieldsValue({
            agencyCode:all.linkage.sapCustomerCode,
        })
        let agencyCode = queryForm.getFieldsValue().agencyCode
        let descript = await request($apiUrl.COMMON_SEARCH_AGENCY_DESCRIPTION,{
            method:'POST',
            data:{
                params:all.linkage.companyCode
            }
        })
        if(descript.success){
            queryForm.setFieldsValue({
                agencyDescription:descript.message,
           })
        }
     }
     //关闭弹框
    const handleCancel= () =>{
        Toast('','', '', 5000, false)
        setInfoTips({})
        setAIsModalVisible(false)
        setDefaultKey('1');
        queryForm.setFieldsValue({
            ...lastCondition,
            fromDate:'',
            toDate:moment(toDate),
            containerSizeTypeGroup: null,
            cargoNatureCode: null,
        })
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
        setAgreementHeadUuid('')
        setFeeAgreementCode('')
        setCompileData([])
        setButtonFlag(false)
        setCommissionAgmtCntrSizeTypeGroups([])
        setDisFlag(false)
        setDateFlag(false)
        setCallFlag(false)
        setVshpFlag(false)
        setRateFlag(false)
        setVteuFlag(false)
        setBlFlag(false)
        setAggFlag(false)
        setAddData([])
        setChecked([])  //清除勾选项
        setCheckedRow([])   //清除勾选数据
        setSizeDetailedTable([])  //清除箱型尺寸详细
        setAgreementItemUuid("")  //清除item勾选记录
        setShowFlag(true);  //箱量明细显示控制
        setSubClassAll([])
        setCompareDateFlag(false)
        setCompareCallFlag(false)
        setCompareVshpFlag(false)
        setCompareVteuFlag(false)
        setCompareBlFlag(false)
        setCompareAggFlag(false)
        setCompareDisFlag(false)
    }
    //全部保存
    const handleQuery = async(operat) =>{
        setInfoTips({});
        Toast('', '', '', 5000, false);
        const query = queryForm.getFieldsValue()
        setSpinflag(true)
        // console.log(dataSource)
        // if(addData.length==0){
        //     compileData.agencyCode=query.agencyCode
        //     compileData.companyCode=query.companyCode
        //     compileData.shipownerCompanyCode=query.shipownerCompanyCode
        //     compileData.postCalculationFlag=query.postCalculationFlag
        //     compileData.isBill=query.isBill
        //     compileData.isYt=query.isYt
        //     compileData.postMode=query.postMode
        //     compileData.prdIndicator=query.prdIndicator
        //     compileData.sfSide=query.sfSide
        //     compileData.yfSide=query.yfSide
        //     compileData.ygSide=query.ygSide
        //     compileData.toDate=query.Date?momentFormat(query.Date[0]):null
        //     compileData.fromDate=query.Date?momentFormat(query.Date[1]):null
        //     compileData.feeAgreementCode=feeAgreementCode
        //     compileData.agreementHeadUuid=agreementHeadUuid
        //     compileData.agencyDescription=query.agencyDescription
        // }else{
        //     addData.agencyCode=query.agencyCode
        //     addData.companyCode=query.companyCode
        //     addData.shipownerCompanyCode=query.shipownerCompanyCode
        //     addData.postCalculationFlag=query.postCalculationFlag
        //     addData.isBill=query.isBill
        //     addData.isYt=query.isYt
        //     addData.postMode=query.postMode
        //     addData.prdIndicator=query.prdIndicator
        //     addData.sfSide=query.sfSide
        //     addData.yfSide=query.yfSide
        //     addData.ygSide=query.ygSide
        //     addData.toDate=momentFormat(query.toDate)
        //     addData.fromDate=momentFormat(query.fromDate)
        //     addData.feeAgreementCode=feeAgreementCode
        //     addData.agreementHeadUuid=agreementHeadUuid
        //     addData.agencyDescription=query.agencyDescription
        // }
    //    if(!vshpData){
    //     setVvData(vteuData)
    //    }else if(!vteuData){
    //     setVvData(vshpData)
    //    }
       if(!query.agencyCode||!query.ygSide ||!query.yfSide||!query.sfSide){
            //代理编码,开始日期,向谁预估,向谁开票,向谁报账不能为空   
            setSpinflag(false) 
            Toast('',intl.formatMessage({id:'lbl.agencyCode-fromDate-ygSide-yfSide-sfSide'}) , 'alert-warning', 5000, false)
       }else{
        // let str = query.companyCode ? query.companyCode : '';
        // let ind = str.indexOf('-');
        // let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
        // addData.companyCode=we
        // compileData.companyCode=we
        // let compileDatas=compileData?compileData:null
        //  dataSource.map((v,i)=>{
        //      v.afcmpreAgFeeVesselTeuDetails=vvData
        //      v.afcmpreAgFeeContainerPrices=computingMethodData
        //      v.afcmpreAgFeeCallDetails=callData
        //      v.afcmpreAgFeeNaGroupDetails=aggData
        //      v.afcmpreAgFeeDateDetails=dateData
        //      v.afcmpreAgFeeRateDetails=blData
        //      v.afcmpreAgFeeDetailPans=vteuData
        //  })
        //  ======
        let str = query.companyCode ? query.companyCode : '';
        let ind = str.indexOf('-');
        let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
        addData.companyCode=we
        compileData.companyCode=we
        let compileDatas=compileData?compileData:null
        console.log(dataSource[itemdataIndex])
        if(itemIndex){
            // console.log(itemdataIndex,calculationMethod)
            if(dataSource[itemdataIndex]){
                dataSource[itemdataIndex].afcmpreAgFeeCallDetails=(calculationMethod=='CALL'||calculationMethod=='CALL2'||calculationMethod=='MCALL'||calculationMethod=='VOY'||calculationMethod=='VOY2') || (comparecalculationMethod=='CALL'||comparecalculationMethod=='CALL2'||comparecalculationMethod=='MCALL'||comparecalculationMethod=='VOY'||comparecalculationMethod=='VOY2') ?[...callData]:[]
                dataSource[itemdataIndex].afcmpreAgFeeContainerPrices=(calculationMethod=='CNT1'||calculationMethod=='CNT2') || (comparecalculationMethod=='CNT') ?[...computingMethodData]:[]
                dataSource[itemdataIndex].afcmpreAgFeeDateDetails=(calculationMethod=='DATE') || (comparecalculationMethod=='DATE') ? [...dateData]:[]
                dataSource[itemdataIndex].afcmpreAgFeeNaGroupDetails=(calculationMethod=='AGG') || (comparecalculationMethod=='AGG') ? [...aggData]:[]
                dataSource[itemdataIndex].afcmpreAgFeeRateDetails=(calculationMethod=='BL') || (comparecalculationMethod=='BL') ?[...blData]:[]
                // dataSource[itemdataIndex].afcmpreAgFeeVesselTeuDetails=calculationMethod=='VSHP'?[...vshpData]:[]
                dataSource[itemdataIndex].afcmpreAgFeeVesselTeuDetails=(calculationMethod=='VTEU') || (comparecalculationMethod=='VTEU') ?[...vteuData]:[]
                // 修改1.10
                // dataSource[itemdataIndex].afcmpreAgFeeDetailPans = tsIndicator == 'Y' ? [...rateData] : null
                if(tsIndicator == 'Y'){
                    dataSource[itemdataIndex].afcmpreAgFeeDetailPans=[...rateData]
                }
                (calculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'N')||(comparecalculationMethod == 'VSHP')  ? dataSource[itemdataIndex].afcmpreAgFeeRateDetails = [...vshpDataTow] : (calculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'Y') ? dataSource[itemdataIndex].afcmpreAgFeeVesselTeuDetails =  [...vshpData] : ''
                dataSource[itemdataIndex].saveShowHide = false
                
                // setCallData([...callData]);
                // setComputingMethodData([...computingMethodData]);
                // setDateData([...dateData]);
                // setAggData([...aggData]);
                // setBlData([...blData]);
                // setVshpData([...vshpData]);
                // setVteuData([...vteuData]);
                // dataSource[itemdataIndex].agFeeVesselTeuDetailList=calculationMethod=='VTEU'?[...vteuData]:calculationMethod=='VSHP'?[...vshpData]:[]
            }
        }
        newSizeDetailedTable.length>0?newSizeDetailedTable.map((v,i)=>{
            v['feeAgreementCode'] = query.feeAgreementCode
            v['agreementHeadUuid'] = agreementHeadUuid
        }):null
        //箱型尺寸组明细数据
        let newData = [{
            'agContainerSizeTypeGroupList':newSizeDetailedTable.length>0?newSizeDetailedTable:undefined,
            'agreementHeadUuid':query.containerSizeTypeGroup?agreementHeadUuid:undefined,
            'containerSizeTypeGroup':query.containerSizeTypeGroup?query.containerSizeTypeGroup:undefined,
            'feeAgreementCode':query.containerSizeTypeGroup?query.feeAgreementCode:undefined
        }]
        //航线组
        airlineData?airlineData.map((v,i)=>{
            v['agreementHeadUuid'] = agreementHeadUuid
            v['feeAgreementCode'] = query.feeAgreementCode
            v.fromDate = v.fromDate?momentFormat(v.fromDate):''
            v.toDate = v.toDate?momentFormat(v.toDate):''
        }):null
        // 
         let save =  await request($apiUrl.PRECALC_AGENCY_PER_SAVE_STBMIT,{
             method:"POST",
             data:{
                 'params':{
                     ...addData,
                    //  'agFeeAgreementItemList':dataSource?[...dataSource]:[],
                    //  'agFeeServiceGroupList':airlineData?[...airlineData]:[],
                    //  'agContainerSizeTypeGroupList':commissionAgmtCntrSizeTypeGroups?[...commissionAgmtCntrSizeTypeGroups]:[],
                    modifyFlag: undefined,
                    agencyCode: query.agencyCode,
                    companyCode: we,
                    shipownerCompanyCode: query.shipownerCompanyCode,
                    postCalculationFlag: query.postCalculationFlag,
                    isBill: query.isBill,
                    isYt: query.isYt,
                    postMode: query.postMode,
                    prdIndicator: query.prdIndicator,
                    sfSide: query.sfSide,
                    yfSide: query.yfSide,
                    ygSide: query.ygSide,
                    subAgencyCode: query.subAgencyCode,
                    toDate: query.Date?momentFormat(query.Date[1]): null,
                    fromDate: query.Date?momentFormat(query.Date[0]): null,
                    feeAgreementCode: feeAgreementCode,
                    agreementHeadUuid: agreementHeadUuid,
                    agencyDescription: query.agencyDescription,
                    afcmpreAgFeeAgreementItems: dataSource?[...dataSource]:[],
                    afcmpreAgFeeServiceGroups: airlineData,
                    afcmpreAgContainerSizeTypeGroups: query.containerSizeTypeGroup?[...newData]:null,
                    //  ...compileDatas,
                    agHeadUuid: compileData.agHeadUid,
                    id: compileData.id,
                    preId: compileData.preId
                },
                operateType:operat
            }
        })
        // console.log(compileDatas)
        // console.log(addData)
        if(save.success){
            setSpinflag(false)
            //  Toast('',formatMessage({id:'lbl.save-successfully'}) , 'alert-success', 5000, false)
            setItemFlag(true)
            setairlineFlag(true)
            let data=save.data
            let datas =  data.afcmpreAgFeeAgreementItems
            let groupData = data.agContainerSizeTypeGroupList
            let serviceData = data.afcmpreAgFeeServiceGroups
            setDataSource(datas);
            setCommissionAgmtCntrSizeTypeGroups(groupData);
            setairlineData(serviceData);
            if(data){
                queryForm.setFieldsValue({
                    "feeAgreementCode": data.feeAgreementCode,
                })
                setAgreementHeadUuid(data.agreementHeadUuid)
                setFeeAgreementCode(data.feeAgreementCode)
                    data.afcmpreAgFeeServiceGroups.length>0?setairlineData([...data.afcmpreAgFeeServiceGroups]):null
                    data.agContainerSizeTypeGroupList?setCommissionAgmtCntrSizeTypeGroups(data.agContainerSizeTypeGroupList):null  
                    if(dataSource){
                        dataSource.map((v,i)=>{
                            v.saveShowHide=false
                        })
                        data.afcmpreAgFeeAgreementItems?setDataSource([...data.afcmpreAgFeeAgreementItems]):null
                        let dataitem = data.afcmpreAgFeeAgreementItems
                        dataitem.map((value,i)=>{
                            if(value.id == itemIndex){
                                if(value.afcmpreAgFeeContainerPrices.length>0){
                                    //箱量计算法
                                    let PriceDatas = value.afcmpreAgFeeContainerPrices
                                    PriceDatas.map((v,i)=>{
                                        v.saveShowHide = false
                                    })
                                    setComputingMethodData([...PriceDatas])
                                
                                }else if(value.afcmpreAgFeeDateDetails.length>0){
                                    //Date时间法
                                    let DateDatas = value.afcmpreAgFeeDateDetails
                                    DateDatas.map((v,i)=>{
                                        v.saveShowHide = false
                                        v.feePrice = v.feePrice+''
                                    })
                                    setDateData([...DateDatas])
                                }else if(value.afcmpreAgFeeCallDetails.length>0){
                                    //CAlL计算明细
                                    let CallDatas = value.afcmpreAgFeeCallDetails 
                                    CallDatas.map((v,i)=>{
                                        v.saveShowHide = false
                                    })
                                    setCallData([...CallDatas])
                                }else if(value.afcmpreAgFeeNaGroupDetails.length>0){
                                    //北美箱量累进(AGG)计算方法明细 afcmpreAgFeeNaGroupDetails
                                    let GroupDatas = value.afcmpreAgFeeNaGroupDetails 
                                    GroupDatas.map((v,i)=>{
                                        v.saveShowHide = false
                                    })
                                    setAggData([...GroupDatas])
                                }else if(value.afcmpreAgFeeVesselTeuDetails.length>0){
                                     //船舶吨位法(VSHP)计算方法明细//VTEU计算方法明细
                                    let TeuDatas = value.afcmpreAgFeeVesselTeuDetails
                                    console.log(TeuDatas)
                                    if (TeuDatas) {
                                        TeuDatas.map((v, i) => {
                                            v.saveShowHide = false
                                        })
                                        calculationMethod == 'VTEU' ? setVteuData([...TeuDatas]) : []
                                        value.modifyFlag == 'Y' && calculationMethod == 'VSHP' ? setVshpData([...TeuDatas]) : []
                                    }
                                }else if(value.afcmpreAgFeeRateDetails.length>0){
                                    //提单法(BL)计算方法明细
                                    if (calculationMethod == 'VSHP') {  //修改1.10
                                        if (value.modifyFlag == 'N') {
                                            let feeDatas = value.afcmpreAgFeeRateDetails
                                            feeDatas.map((v, i) => {
                                                v.saveShowHide = false
                                            })
                                            setVshpDataTow([...feeDatas])
                                        }
                                    }else{
                                        let DetailDatas = value.afcmpreAgFeeRateDetails
                                        DetailDatas?DetailDatas.map((v,i)=>{
                                            v.saveShowHide = false
                                        }):null
                                        DetailDatas?setBlData([...DetailDatas]):null
                                    }
                                } 
                            }
                        })
                    }
            }
                setInfoTips({alertStatus: 'alert-success', message: save.message});
            }else{
                setSpinflag(false)
                setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
            }
            
        }
       
    }

    //协议退回
    const agreementBack = async() =>{
        Toast('','', '', 5000, false)
        let back= await request($apiUrl.COMM_AGMT_AGMT_CANCEL,{
            method:"POST",
            data:{
                'uuid':agreementHeadUuid,
                'operateType':'CANCEL'
            }
        })
        if(back.success){
            //协议退回成功！！！！
            Toast('',intl.formatMessage({id:'lbl.Agreement-returned-successfully'}) , 'alert-success', 5000, false)
        }
    }
    useEffect(() => {
        costKe()
        airline()
    }, [])

    const costKe = async()=>{
        let itemAdd = await request($apiUrl.PRECALC_AGENCY_PER_NEW_ITEM_INIT,{
            method:"POST",
        })
        let itemAdds=itemAdd.data
        if(itemAdds!=null){
            let costs=itemAdds.listAgTypeToClass
            costs.map((v,i)=>{
                v['value']=v.feeCode
                v['label']=v.feeCode + '(' + v.feeName +')';
                if(costKey.length==costs){ 
                }else{
                    costKey.push(v)
                }
            })
            setCostKey([...costKey])
        }
    }
    

    const airline = async()=>{
        let airlines = await request($apiUrl.PRECALC_AGENCY_GROUP_INIT,{
            method:"POST",
            data:{
                uuid:agreementHeadUuid
            }
        })
        let airlineCodes=airlines.data
        setAirlineCode(airlineCodes)
    }

    //新增item
    const addItem = async() =>{
        setInfoTips({});	
        setShowFlag(true)
        setAgreementItemUuid("")
        let length = dataSource ? dataSource.length : 0
        if(length == 0){
            setDataSource([])
            addItemFlags()
        }else{
            let index = length-1
            setItemDataIndex(index)
            let itemid = dataSource[length - 1].id
            itemid?addItemFlags():setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id:'lbl.save-add-item'}) })

        }
    }
    const addItemFlags = async () => {
        setInfoTips({})
        setSpinflag(true)
        let itemAdd = await request($apiUrl.PRECALC_AGENCY_PER_NEW_ITEM_INIT,{
            method:"POST",
        })
        if(itemAdd.success){
            setSpinflag(false)
            let itemAdds=itemAdd.data
            itemAdds.uid=dataSource?dataSource.length+1:''
            itemAdds.saveShowHide=true
            itemAdds.modifyFlag = 'N'        //是否阶梯费率
            itemAdds.heryType = 'Agency'     //参考代码类型
            itemAdds.vatFlag = 'Y'           //是否含税价
            itemAdds.tsIndicator = 'N'       //是否特殊费率
            itemAdds.compareIndicator = 'N'  //是否择大选取
            itemAdds.feeClass = 'AGF'        //费用大类
            itemAdds.feeType = 'AGF'         //费用小类
            itemAdds.vesselIndicator = 'Y'   //是否自由船
            itemAdds.calculationMethod = 'DATE'  //计算方法
            costKey.map((v,i)=>{
                if(itemAdds.feeClass==v.feeCode){
                   let list=v.listAgTypeToClass
                   list.map((v,i)=>{
                       v['value']=v.feeCode
                       v['label']=v.feeCode+'(' + v.feeName +')';
                   })
                   if(v.listAgTypeToClass.length==list.length){
                       setSubclass('')
                       setSubclass(list)
                   }
               }
            })
            dataSource.push(itemAdds)
            setDataSource([...dataSource])
        }else{
            setSpinflag(false)
            setInfoTips({alertStatus: 'alert-error', message: itemAdd.errorMessage});
        }
    }

    const [openBoxSizedetailIndex, setOpenBoxSizedetailIndex] = useState()
	const boxSizeref = React.useRef()
	//展开左侧箱型尺寸详情
	const openBoxSizedetail = (index) => {
        setInfoTips({})
		setOpenBoxSizedetailIndex(index)
		if (openBoxSizedetailIndex == index) {
			setOpenBoxSizedetailIndex()
		}
		boxSizeref.current.scrollTo(0, index * 20)
    }
    
    //表格的下拉框onchange事件
   const getCommonSelectVal = (e,record,name,index) =>{
        record[name]=e
        console.log(e)
        if (name == 'compareIndicator') {
            if (record.compareIndicator == 'Y') {
                // setMaxFlag(false);
                acquireSelectData('AFCM.AGMT.CALC.MODES.CALCMODES', setChooseBigCharge, $apiUrl)
            } else {
                // setChooseBigCharge({ values: [] });
                // setMaxFlag(true);
                record.compareCalculationMethod = ''
            }
            if (index == itemdataIndex) {
                emptyCalculationMethod()
                setChecked([])
            }
        } else if (name == 'tsIndicator') {
            // record.tsIndicator == 'Y' ? setRateFlag(true) : setRateFlag(false);
            if (index == itemdataIndex) {
                emptyCalculationMethod()
                setChecked([])
            }
        }
        //费用大类和费用小类联动
        if (name == 'feeClass') {
            costKey.map((v,i)=>{
                if(e==v.feeCode){
                   let list=v.listAgTypeToClass
                   list.map((v,i)=>{
                       v['value']=v.feeCode
                       v['label']=v.feeCode+'(' + v.feeName +')';
                   })
                   if(v.listAgTypeToClass.length==list.length){
                       name == 'feeClass' ? record['feeType'] = null : record[name] = e
                       setSubclass('')
                       setSubclass(list)
                   }else{
                       
                   }
                   
               }
           })
        }
        //选中的计算方法是VSHP并且修改是否阶梯费率的时候更改VSHP这个计算表格
        if (record.calculationMethod == 'VSHP' && record.id == itemIndex) {  //修改1.10
            if (name == 'modifyFlag') {
                setVshpFlag(false)
                setVshpShow(false)
                setChecked([])
                emptyCalculationMethod()
            }
        }
        //择大计算方法
        if(name == 'compareCalculationMethod'){
            // if(index == itemdataIndex){
            //     if (record.compareCalculationMethod != comparecalculationMethod) {
            //         setChecked([])
            //         emptyCalculationMethod()
            //     }
            // }
            setCompareCalculationMethod(record.compareCalculationMethod)
        }
   }
   //计算方法的onchange事件
   const getCommonSelectVals = (e,record,name,index) =>{
    //  setItemIndex(record.id)
     record[name]=e
    //  setItemDataIndex(index)
    if(index==itemdataIndex){
        if(calculationMethod){
            if(record.calculationMethod != calculationMethod ){
                setChecked([])
                setDateFlag(false)
                setCallFlag(false)
                setVshpFlag(false)
                setVteuFlag(false)
                setBlFlag(false)
                setAggFlag(false)
                setDisFlag(false) 
                //计算表格禁止新增数据
                setOperandSaveFlag(false)
                setComputingMethod(false)
                setVshpShow(false)
                setVteuShow(false)
                setBlShow(false)
                setAggShow(false)
            }
        }
    }
     setCalculationMethod(record.calculationMethod)
   }
   //input框的onchange事件
   const getCommonInputVal = (e,record,name) => {
    //    record[name]=e.target.value
        e?e.target?record[name]=e.target.value:record[name]=e:record[name]=e
        name == 'tsIndicator'?setTsIndicator(e.target.value):''
   }
   //时间选择框的onchange事件
   const getCommonDateVal = (record,e,name) =>{
        // console.log(record)
        // console.log(e)
        // if(e){
        //     let checkDate=e._d?momentFormat(e._d):null
        //     record[name]=checkDate
        // }
        if(e){
            let da=e._d?momentFormat(e._d):null
             record[name]=da
        }else{
             record[name]=null
        }
   }
   //箱型量法新增item
   const addItemDetailed = async() => {
        setInfoTips({})
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        let length = computingMethodData ? computingMethodData.length : 0
        if(length == 0){
            let itemAdd = await request($apiUrl.PRECALC_AGENCY_PER_NEW_CNT_INIT,{
                method:"POST",
                data:{
                    params:{
                        // "uuid":agreementHeadUuid,
                        agreementHeadUuid: recordVal.agreementHeadUuid,
                        preId: recordVal.preId
                    }
                }
            })
            if(itemAdd.success){
                setSpinflag(false)
                let datas=itemAdd.data
                datas.saveShowHide=true
                if(datas.containerSizeTypeGroupListBean){
                    let data = datas.containerSizeTypeGroupListBean
                    data.map((v,i)=>{
                        v['value']=v.containerSizeTypeGroup
                        v['label']=v.containerSizeTypeGroup 
                    })
                    setContainerSizeTypeGroup(data)
                }
                computingMethodData.push(datas)
                setComputingMethodData([...computingMethodData])
                if(!computingMethodData.containerSizeTypeGroup&&!containerSizeTypeGroup.containerSizeTypeGroupList&&!containerSizeTypeGroup.emptyFullIndicator){
                    setOperandSaveFlag(true)
                } 
            }else{
                setSpinflag(false)
                setInfoTips({alertStatus: 'alert-error', message: itemAdd.errorMessage});
            }
        }else{
            let index = length-1
            // setItemDataIndex(index)
            let itemid = computingMethodData[length - 1].id
            if(itemid){
                let itemAdd = await request($apiUrl.PRECALC_AGENCY_PER_NEW_CNT_INIT,{
                    method:"POST",
                    data:{
                        params:{
                            // "uuid": agreementHeadUuid,
                            agreementHeadUuid: recordVal.agreementHeadUuid,
                            preId: recordVal.preId
                        }
                    }
                })
                if(itemAdd.success){
                    setSpinflag(false)
                    let datas=itemAdd.data
                    if(datas.containerSizeTypeGroupListBean){
                        let data = datas.containerSizeTypeGroupListBean
                        data.unshift({
                            containerSizeTypeGroup: '*',
                        })
                        data.map((v,i)=>{
                            v['value']=v.containerSizeTypeGroup
                            v['label']=v.containerSizeTypeGroup 
                        })
                        setContainerSizeTypeGroup(data)
                    }
                    computingMethodData.push(datas)
                    datas.saveShowHide = true
                    setComputingMethodData([...computingMethodData])
                    
                }else{
                    setSpinflag(false)
                    setInfoTips({alertStatus:'alert-error',message:itemAdd.errorMessage })
                }
            }else{
                setSpinflag(false)
                setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id:'lbl.save-add-data'}) })
            }
        }
   }

   //新增表格保存
   const itemSave = async(record,index) =>{
		Toast('', '', '', 5000, false);
        setInfoTips({})
        setSpinflag(true)
        setCalculationMethod(record.calculationMethod)
        record.agreementHeadUuid=agreementHeadUuid
        record.feeAgreementCode=queryForm.getFieldValue().feeAgreementCode
        record.saveShowHide=false
        if(!record.vesselIndicator){
            record.vesselIndicator='*'
        }
        if (!record.id || record.calculationMethod != calculationMethod) {  //修改1.10
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
            // let afcmpreAgFeeVesselTeuDetails=[]
            // if(!vshpData){
            //     afcmpreAgFeeVesselTeuDetails=vteuData
            // }else if(!vteuData){
            //     afcmpreAgFeeVesselTeuDetails=vteuData
            // }
            // if (itemIndex) {
            //     if (dataSource[itemdataIndex]) {
            //         dataSource[itemdataIndex].afcmpreAgFeeCallDetails = (calculationMethod == 'CALL' || calculationMethod == 'CALL2' || calculationMethod == 'MCALL' || calculationMethod == 'VOY' || calculationMethod == 'VOY2')||( comparecalculationMethod == 'CALL' || comparecalculationMethod == 'CALL2' || comparecalculationMethod == 'MCALL' || comparecalculationMethod == 'VOY' || comparecalculationMethod == 'VOY2' ) ? [...callData] : []
            //         dataSource[itemdataIndex].afcmpreAgFeeContainerPrices = (calculationMethod == 'CNT1' || calculationMethod == 'CNT2' )||(comparecalculationMethod == 'CNT')? [...computingMethodData] : []
            //         dataSource[itemdataIndex].afcmpreAgFeeDateDetails = (calculationMethod == 'DATE')||(comparecalculationMethod == 'DATE')  ? [...dateData] : []
            //         dataSource[itemdataIndex].afcmpreAgFeeNaGroupDetails = (calculationMethod == 'AGG')||(comparecalculationMethod == 'AGG')  ? [...aggData] : []
            //         dataSource[itemdataIndex].afcmpreAgFeeRateDetails = (calculationMethod == 'BL')||(comparecalculationMethod == 'BL') ? [...blData] : []
            //         dataSource[itemdataIndex].afcmpreAgFeeDetailPans =  record.tsIndicator=='Y' ? [...rateData] : []
            //         if(calculationMethod == 'VTEU' || comparecalculationMethod == 'VTEU'){
            //             dataSource[itemdataIndex].afcmpreAgFeeVesselTeuDetails=[...vteuData]
            //         }
            //         (calculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag != 'Y')||(comparecalculationMethod == 'VSHP')  ? dataSource[itemdataIndex].afcmpreAgFeeRateDetails = [...vshpDataTow] : (calculationMethod == 'VSHP' && dataSource[itemdataIndex].modifyFlag == 'Y') ? dataSource[itemdataIndex].afcmpreAgFeeVesselTeuDetails =  [...vshpData] : ''
            //         tsIndicator == 'Y'? dataSource[itemdataIndex].afcmpreAgFeeDetailPans = [...rateData]:dataSource[itemdataIndex].afcmpreAgFeeDetailPans = []
            //         dataSource[itemdataIndex].saveShowHide = false
            //     }
            // }
            let blLists = []
            if((record.calculationMethod=='BL') || (record.compareCalculationMethod=='BL')){
                blLists = blLists ? [...blData] : []
            }else if((record.calculationMethod=='VSHP' && record.modifyFlag != 'Y') || (record.compareCalculationMethod=='VSHP' && record.calculationMethod!='VSHP')){
                blLists = blLists ? [...vshpDataTow] : []
            }
            let vteuLists = []
            if((record.calculationMethod=='VTEU') || (record.compareCalculationMethod=='VTEU')){
                vteuLists = vteuLists ? [...vteuData] : []
            }else if(record.calculationMethod == 'VSHP' && record.modifyFlag == 'Y'){
                vteuLists = vteuLists ? [...vshpData] : []
            }
            let callItemData = []
            let cntItemData = []
            let dateItemData = []
            let aggItemData = []
            let blItemData = []
            let vteuItemData = []
            let rateItemData = []
            if(checked.length==0){//未勾选item情况下
                callItemData = record.afcmpreAgFeeCallDetails
                cntItemData  = record.afcmpreAgFeeContainerPrices
                dateItemData  = record.afcmpreAgFeeDateDetails
                aggItemData  = record.afcmpreAgFeeNaGroupDetails
                blItemData  = record.afcmpreAgFeeRateDetails
                vteuItemData  = record.afcmpreAgFeeVesselTeuDetails
                rateItemData  = record.afcmpreAgFeeDetailPans
            }else{
                callItemData = [...callData]
                cntItemData  = [...computingMethodData]
                dateItemData  = [...dateData]
                aggItemData  = [...aggData]
                blItemData  = blLists
                vteuItemData  = [...rateData]
                rateItemData  = vteuLists
            }
            const saveItem =  await request($apiUrl.PRECALC_AGENCY_SAVE_ITEM,{
                method:'POST',
                data:{
                    'params':{
                        "agreementHeadUuid":record.agreementHeadUuid,
                        'feeAgreementCode':record.feeAgreementCode,
                        'heryCode':record.heryCode,
                        'heryType':record.heryType,
                        'feeType':record.feeType,
                        'vesselIndicator':record.vesselIndicator,
                        'calculationMethod':record.calculationMethod,
                        'compareIndicator':record.compareIndicator,
                        'compareCalculationMethod':record.compareCalculationMethod,
                        'tsIndicator':record.tsIndicator,
                        'vatFlag':record.vatFlag,
                        'modifyFlag':record.modifyFlag,
                        'agreementItemUuid':record.agreementItemUuid?record.agreementItemUuid:'',
                        saveShowHide:false,
                        preId: compileData.preId,
                        id: record.id,
                        headUuid: compileData.id,
                        // afcmpreAgFeeCallDetails: [...callData],  //计算方法
                        // afcmpreAgFeeContainerPrices: [...computingMethodData],  //箱量法
                        // afcmpreAgFeeDateDetails: [...dateData],  //时间计算法
                        // afcmpreAgFeeDetailPans: [...vteuData], //特殊的出口箱量
                        // afcmpreAgFeeRateDetails: [...blData], //提单法/ BL
                        // afcmpreAgFeeVesselTeuDetails: [...vshpData], //船舶箱位法 VSL 
                        // afcmpreAgFeeNaGroupDetails: [...aggData], //北美箱量累进

                        afcmpreAgFeeCallDetails: (record.calculationMethod=='CALL'||record.calculationMethod=='CALL2'||record.calculationMethod=='MCALL'||record.calculationMethod=='VOY'||record.calculationMethod=='VOY2') || (record.compareCalculationMethod=='CALL'||record.compareCalculationMethod=='CALL2'||record.compareCalculationMethod=='MCALL'||record.compareCalculationMethod=='VOY'||record.compareCalculationMethod=='VOY2') ? callItemData : [],
                        afcmpreAgFeeContainerPrices: (record.calculationMethod=='CNT1'||record.calculationMethod=='CNT2') || (record.compareCalculationMethod=='CNT') ? cntItemData : [],
                        afcmpreAgFeeDateDetails: (record.calculationMethod=='DATE') || (record.compareCalculationMethod=='DATE') ? dateItemData : [],
                        afcmpreAgFeeNaGroupDetails: record.calculationMethod=='AGG'|| record.compareCalculationMethod=='AGG' ? aggItemData : [],
                        afcmpreAgFeeRateDetails: blItemData,
                        afcmpreAgFeeDetailPans: record.tsIndicator=='Y' ? rateItemData : [],  //修改1.10
                        afcmpreAgFeeVesselTeuDetails: vteuItemData,
                    },
                    // 'params': dataSource[index],
                    operateType: 'SAVE'
                }
            })
            if(saveItem.message){
                setSpinflag(false)
                // Toast('', formatMessage({id:'lbl.save-successfully'}), '', 5000, false);
                setItemFlag(true)
                let datas = saveItem.data
                dataSource[index] = saveItem.data
                datas.feeClass = record.feeClass+''
                datas.feeType = record.feeType+''
                datas.tsIndicator = datas.tsIndicator == null ? null : datas.tsIndicator + ''
                datas.compareIndicator = datas.compareIndicator + ''
                // datas.modifyFlag = datas.modifyFlag + ''
                datas.modifyFlag = datas.modifyFlag == null ? null : datas.modifyFlag + ''  //修改1.10
                datas.vatFlag = datas.vatFlag + ''  
                datas.calculationMethod = datas.calculationMethod + ''  
                // datas.compareCalculationMethod = datas.compareCalculationMethod + ''
                datas.compareCalculationMethod = datas.compareCalculationMethod==null ? null: datas.compareCalculationMethod + ''  
                dataSource[index] = datas  
                setDataSource([...dataSource])
                setShowFlag(true);  
                setAgreementItemUuid("")
                setChecked([])
                setModifyFlagSele(dataSource[index].modifyFlag)//保存成功后存储最新的是否阶梯费率
                emptyCalculationMethod()
                if(!dataSource[index].id){
                    setOperandSaveFlag(true)
                    // seyDateShow(true)
                    setComputingMethod(true)
                    setVshpShow(true)
                    setVteuShow(true)
                    setBlShow(true)
                    setAggShow(true)
                }else{
                    // if(record.calculationMethod=='CNT1'||record.calculationMethod=='CNT2'){
                    //     setOperandSaveFlag(dataSource[index].saveShowHide)
                    // }else if(record.calculationMethod=='DATE'){//时间(DATE)计算方法明细
                    //     setDateShow(dataSource[index].saveShowHide)
                    // }else if(record.calculationMethod=='CALL'||record.calculationMethod=='CALL2'||record.calculationMethod=='MCALL'||record.calculationMethod=='VOY'||record.calculationMethod=='VOY2'){//CALL/CALL2/MCALL/VOY/VOY2 计算方法明细
                    //    setComputingMethod(dataSource[index].saveShowHide)
                    // }else if(record.calculationMethod=='VSHP'){//船舶吨位法(VSHP)计算方法明细
                    //    setVshpShow(dataSource[index].saveShowHide)
                    // }else if(record.calculationMethod=='VTEU'){//VTEU计算方法明细
                    //    setVteuShow(dataSource[index].saveShowHide)
                    // }else if(record.calculationMethod=='BL'){//提单法(BL)计算方法明细
                    //    setBlShow(dataSource[index].saveShowHide)
                    // }else if(record.calculationMethod=='AGG'){//北美箱量累进(AGG)计算方法明细
                    //     setAggShow(dataSource[index].saveShowHide)
                    // }
                    setRateFlag(false);
                    if(record.calculationMethod=='CNT1'||record.calculationMethod=='CNT2'){
                        setOperandSaveFlag(!dataSource[index].saveShowHide)
                        let feeDatas = datas.afcmpreAgFeeContainerPrices
                        feeDatas.map((v,i)=>{
                            v.saveShowHide = false
                        })
                        setComputingMethodData([...feeDatas])
                    }else if(record.calculationMethod=='DATE'){//时间(DATE)计算方法明细
                        setDateShow(!dataSource[index].saveShowHide)
                        let feeDatas = datas.afcmpreAgFeeDateDetails
                        feeDatas.map((v,i)=>{
                            v.saveShowHide = false
                        })
                        setDateData([...feeDatas])
                    }else if(record.calculationMethod=='CALL'||record.calculationMethod=='CALL2'||record.calculationMethod=='MCALL'||record.calculationMethod=='VOY'||record.calculationMethod=='VOY2'){//CALL/CALL2/MCALL/VOY/VOY2 计算方法明细
                        setComputingMethod(!dataSource[index].saveShowHide)
                        let feeDatas = datas.afcmpreAgFeeCallDetails
                        feeDatas.map((v,i)=>{
                            v.saveShowHide = false
                        })
                        setCallData([...feeDatas])
                    }else if(record.calculationMethod=='VSHP'){//船舶吨位法(VSHP)计算方法明细
                        setVshpShow(!dataSource[index].saveShowHide)
                        // let feeDatas = datas.afcmpreAgFeeDetailPans
                        // feeDatas.map((v,i)=>{
                        //     v.saveShowHide = false
                        // })
                        // setVshpData([...feeDatas])
                        if (record.modifyFlag == 'Y') {  //修改1.10
                            let feeDatas = datas.afcmpreAgFeeVesselTeuDetails
                            feeDatas.map((v, i) => {
                                v.saveShowHide = false
                            })
                            setVshpData([...feeDatas])
                        } else {
                            let feeDatas = datas.afcmpreAgFeeRateDetails
                            feeDatas.map((v, i) => {
                                v.saveShowHide = false
                            })
                            setVshpDataTow([...feeDatas])
                        }
                    }else if(record.calculationMethod=='VTEU'){//VTEU计算方法明细  
                        setVteuShow(!dataSource[index].saveShowHide)
                        let feeDatas = datas.afcmpreAgFeeVesselTeuDetails
                        feeDatas.map((v,i)=>{
                            v.saveShowHide = false
                        })
                        setVteuData([...feeDatas])
                    }else if(record.calculationMethod=='BL'){//提单法(BL)计算方法明细
                        setBlShow(!dataSource[index].saveShowHide)
                        let feeDatas = datas.afcmpreAgFeeRateDetails
                        feeDatas.map((v,i)=>{
                            v.saveShowHide = false
                        })
                        setBlData([...feeDatas])
                    }else if(record.calculationMethod=='AGG'){//北美箱量累进(AGG)计算方法明细
                        setAggShow(!dataSource[index].saveShowHide)
                        let feeDatas = datas.afcmpreAgFeeNaGroupDetails
                        feeDatas.map((v,i)=>{
                            v.saveShowHide = false
                        })
                        setAggData([...feeDatas])
                    }

                }
                
                // subclass.map((item,indexs)=>{
                //     costKey.map((v,i)=>{
                //         if(dataSource[index].feeType==item.value){
                //             dataSource[index].feeClass=v.value
                //         }
                //     })
                // })   
                setInfoTips({alertStatus: 'alert-success', message: saveItem.message});
            }else{
                setSpinflag(false)
                dataSource[index].saveShowHide=true
                setInfoTips({alertStatus: 'alert-error', message: saveItem.errorMessage});
            }
            // if(computingMethodData){
            //     computingMethodData.map((item,indexs)=>{
            //         dataSource[index].agreementItemUuid?dataSource[index].agreementItemUuid=item.agreementItemUuid:null
                   
            //     }) 
            // }
   }

    //   修改1.10
    const calculateSaves = async (index, record, property) => {
        console.log(dataSource[itemdataIndex].modifyFlag)
        setSpinflag(true)
        let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
            'method':"POST",
            'data':{
                'params':{
                    'afcmpreAgFeeVesselTeuDetails': [{
                        'agreementHeadUuid':agreementHeadUuid,
                        'agreementItemUuid':record.agreementItemUuid,
                        'feeAgreementCode':feeAgreementCode,
                        'agreementVesselTeuDetailUuid':record.agreementVesselTeuDetailUuid,
                        'startTeu':record.startTeu,
                        'endTeu':record.endTeu,
                        'feeCurrencyCode':record.feeCurrencyCode,
                        'feePrice':record.feePrice,
                        id: record.id,
                    }],
                    'agreementHeadUuid':agreementHeadUuid,
                    id: recordVal.id,
                    preId: recordVal.preId,
                    calculationMethod: recordVal.calculationMethod,
                    feeAgreementCode: feeAgreementCode,
                    agreementItemUuid: recordVal.agreementItemUuid,
                }
            }
        })
        if(save.success){
            setSpinflag(false)
            let data = save.data.afcmpreAgFeeVesselTeuDetails[0]
            vshpData[index].saveShowHide=false
            recordVal.afcmpreAgFeeVesselTeuDetails = vshpData
            vshpData.splice(index, 1, data);
            setVshpData([...vshpData])
            setInfoTips({alertStatus: 'alert-success', message: save.message});
        }else{
            setSpinflag(false)
            setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
        }
    } 
    const calculateSaveAshp = async (index, record, property) => {
        setSpinflag(true)
        let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
            'method':"POST",
            'data':{
                'params':{
                    'afcmpreAgFeeRateDetails': [{
                        'agreementHeadUuid':agreementHeadUuid,
                        'agreementItemUuid':record.agreementItemUuid,
                        'feeAgreementCode':feeAgreementCode,
                        // 'agreementVesselTeuDetailUuid':record.agreementVesselTeuDetailUuid,
                        'agreementRateDetailUuid':record.agreementRateDetailUuid,
                        'feeCurrencyCode':record.feeCurrencyCode,
                        'feePrice':record.feePrice,
                        id: record.id,
                    }],
                    'agreementHeadUuid':agreementHeadUuid,
                    id: recordVal.id,
                    preId: recordVal.preId,
                    calculationMethod: recordVal.calculationMethod,
                    feeAgreementCode: feeAgreementCode,
                    agreementItemUuid: recordVal.agreementItemUuid,
                }
            }
        })
        if(save.success){
            setSpinflag(false)
            let data = save.data.afcmpreAgFeeRateDetails[0]
            vshpDataTow[index].saveShowHide=false
            recordVal.afcmpreAgFeeRateDetails = vshpDataTow
            vshpDataTow.splice(index, 1, data);
            setVshpDataTow([...vshpDataTow])
            setInfoTips({alertStatus: 'alert-success', message: save.message});
        }else{
            setSpinflag(false)
            setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
        }
    } 

   //计算方法表格保存
   const calculateSave= async(index,record,property) =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        setSpinflag(true)
        console.log(property)
        if(property=='operand'){
            if(!record.emptyFullIndicator||!record.transmitIndicator||!record.containerSizeTypeGroup){
                setSpinflag(false)
                //空重箱标志/进口|出口|中转/ 箱型尺寸组 都不能为空
                Toast('',intl.formatMessage({id:'lbl.empty-cator-container-must-enter'}), 'alert-warning', 5000, false);
            }else{
                let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
                    'method':"POST",
                    'data':{
                        "operateType": 'SAVE',
                        'params':{
                            'agreementHeadUuid':agreementHeadUuid,
                            id: recordVal.id,
                            preId: recordVal.preId,
                            calculationMethod: recordVal.calculationMethod,
                            feeAgreementCode: feeAgreementCode,
                            // agreementItemUuid: agreementItemUuid,
                            agreementItemUuid: recordVal.agreementItemUuid,
                            'afcmpreAgFeeContainerPrices':[{
                                'feeAgreementCode':feeAgreementCode,
                                'agreementHeadUuid':agreementHeadUuid,
                                'agreementItemUuid':record.agreementItemUuid,
                                'emptyFullIndicator':record.emptyFullIndicator,
                                'transmitIndicator':record.transmitIndicator,
                                'containerSizeTypeGroup':record.containerSizeTypeGroup,
                                'feeCurrencyCode':record.feeCurrencyCode,
                                'socIndicator':record.socIndicator,
                                'unitPrice':record.unitPrice,
                                'unitPriceType':record.unitPriceType,
                                'cargoProperty':record.cargoProperty,
                                id: record.id,
                            }],
                        } 
                    }
                })
                if(save.success){
                    setSpinflag(false)
                    let data = save.data.afcmpreAgFeeContainerPrices[0]
                    computingMethodData[index].saveShowHide=false
                    recordVal.afcmpreAgFeeContainerPrices = computingMethodData
                    computingMethodData.splice(index, 1, data);
                    setComputingMethodData([...computingMethodData])
                    setOperandSaveFlag(false)
                    setInfoTips({alertStatus: 'alert-success', message: save.message});
                }else{
                    setSpinflag(false)
                    setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
                }
            }
        }else if(property==='VSHP'){        
                if (dataSource[itemdataIndex].modifyFlag == 'Y') {  //修改1.10
                    if (record.startTeu == null || record.endTeu == null || record.feePrice == null) {
                        //船舶吨位起算点，船舶吨位截止点，单价不能为空
                        setSpinflag(false)
                        setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.startTeu-Cant-empty' }) })
                    } else {
                        calculateSaves(index, record, property)
                    }
                } else {
                    if (record.feePrice == null) {
                        setSpinflag(false)
                        //单价不能为空
                        setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0039' }) })
                    } else {
                        calculateSaveAshp(index, record, property)
                    }
                }
            }else if(property==='VTEU'){
                if(!record.startTeu){
                    //船舶吨位起算点不能为空
                    setSpinflag(false)
                    Toast('',intl.formatMessage({id:'lbl.startTeu-Cant-empty'}) , 'alert-warning', 5000, false);
                }else{
                    let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
                        'method':"POST",
                        'data':{
                            'params':{
                                'afcmpreAgFeeVesselTeuDetails':[{
                                    'agreementHeadUuid':agreementHeadUuid,
                                    'agreementItemUuid':record.agreementItemUuid,
                                    'feeAgreementCode':feeAgreementCode,
                                    'agreementVesselTeuDetailUuid':record.agreementVesselTeuDetailUuid,
                                    'startTeu':record.startTeu,
                                    'endTeu':record.endTeu,
                                    'feeCurrencyCode':record.feeCurrencyCode,
                                    'feePrice':record.feePrice,
                                    id: record.id,
                                }],
                                'agreementHeadUuid':agreementHeadUuid,
                                id: recordVal.id,
                                preId: recordVal.preId,
                                calculationMethod: recordVal.calculationMethod,
                                feeAgreementCode: feeAgreementCode,
                                agreementItemUuid: recordVal.agreementItemUuid,
                            }
                            
                        }
                    })
                    if(save.success){
                        setSpinflag(false)
                        let data = save.data.afcmpreAgFeeVesselTeuDetails[0]
                        vteuData[index].saveShowHide=false
                        recordVal.afcmpreAgFeeVesselTeuDetails = vteuData
                        vteuData.splice(index, 1, data);
                        setVteuData([...vteuData])
                        setInfoTips({alertStatus: 'alert-success', message: save.message});
                    }else{
                        setSpinflag(false)
                        setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
                    }
            }
            }else if(property=='CALL/CALL2/MCALL/VOY/VOY2'){
                if(!record.callNumber){
                    setSpinflag(false)
                    //挂港次数不能为空！！！！
                    setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id:'lbl.Port-number-cannot-be-empty'})});
                    // Toast('', intl.formatMessage({id:'lbl.Port-number-cannot-be-empty'}), 'alert-warning', 5000, false);
                }else{
                let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
                    'method':"POST",
                    'data':{
                        'params':{
                            'afcmpreAgFeeCallDetails':[{
                                'agreementHeadUuid':agreementHeadUuid,
                                'agreementItemUuid':record.agreementItemUuid,
                                'feeAgreementCode':feeAgreementCode,
                                'agreementCallDetailUuid':record.agreementCallDetailUuid,
                                'callNumber':record.callNumber,
                                'feePrice':record.feePrice,
                                'feeCurrencyCode':record.feeCurrencyCode,
                                id: record.id,
                            }],
                            'agreementHeadUuid':agreementHeadUuid,
                            id: recordVal.id,
                            preId: recordVal.preId,
                            calculationMethod: recordVal.calculationMethod,
                            feeAgreementCode: feeAgreementCode,
                            agreementItemUuid: recordVal.agreementItemUuid,
                        }
                        
                    }
                })
                if(save.success){
                    setSpinflag(false)
                    let data = save.data.afcmpreAgFeeCallDetails[0]
                    callData[index].saveShowHide=false
                    recordVal.afcmpreAgFeeCallDetails = callData
                    callData.splice(index, 1, data);
                    setCallData([...callData])
                    setInfoTips({alertStatus: 'alert-success', message: save.message});
                }else{
                    setSpinflag(false)
                    setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
                }
            }

            }else if(property=='AGG'){
                if(!record.groupCode||!record.startTeu||!record.fromDate){
                    setSpinflag(false)
                    //分组号码/箱量起算点/箱量累进起始日期/不能为空
                    Toast('',  intl.formatMessage({id:'lbl.groupCode-startTeu-fromDate'}), 'alert-warning', 5000, false);
                }else{
                        let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
                        'method':"POST",
                        'data':{
                            'params':{
                                'afcmpreAgFeeNaGroupDetails':[{
                                    'agreementHeadUuid':agreementHeadUuid,
                                    'agreementItemUuid':record.agreementItemUuid,
                                    'feeAgreementCode':feeAgreementCode,
                                    'groupCode':record.groupCode,
                                    'startTeu':record.startTeu,
                                    'endTeu':record.endTeu,
                                    'fromDate':momentFormat(record.fromDate),
                                    'toDate':momentFormat(record.toDate),
                                    'unitPrice':record.unitPrice,
                                    'feeCurrencyCode':record.feeCurrencyCode,
                                    'unitPriceType':record.unitPriceType,
                                    id: record.id,
                                }],
                                    'agreementHeadUuid':agreementHeadUuid,
                                    id: recordVal.id,
                                    preId: recordVal.preId,
                                    calculationMethod: recordVal.calculationMethod,
                                    feeAgreementCode: feeAgreementCode,
                                    agreementItemUuid: recordVal.agreementItemUuid,
                            }
                                
                        }
                    })
                        if(save.success){
                            setSpinflag(false)
                            let data = save.data.afcmpreAgFeeNaGroupDetails[0]
                            aggData[index].saveShowHide=false
                            recordVal.afcmpreAgFeeNaGroupDetails = aggData
                            aggData.splice(index, 1, data);
                            setAggData([...aggData])
                            setInfoTips({alertStatus: 'alert-success', message: save.message});
                        }else{
                            setSpinflag(false)
                            setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
                        }
                }
            

            }else if(property=='DATE'){
                if(!record.calculationPeriod){
                    setSpinflag(false)
                    //时间周期不能为空
                    Toast('', intl.formatMessage({id:'lbl.calculation-sThe-time-period'}), 'alert-warning', 5000, false)
                }else{
                let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
                    'method':"POST",
                    'data':{
                        'params':{
                            'afcmpreAgFeeDateDetails':[{
                            'agreementHeadUuid':agreementHeadUuid,
                            'agreementItemUuid':record.agreementItemUuid,
                            'feeAgreementCode':feeAgreementCode,
                            'agreementDateDetailUuid':record.agreementDateDetailUuid,
                            'calculationPeriod':record.calculationPeriod,
                            'feeCurrencyCode':record.feeCurrencyCode,
                            'feePrice':record.feePrice,
                            id: record.id,
                            }],
                            'agreementHeadUuid':agreementHeadUuid,
                            id: recordVal.id,
                            preId: recordVal.preId,
                            calculationMethod: recordVal.calculationMethod,
                            feeAgreementCode: feeAgreementCode,
                            agreementItemUuid: recordVal.agreementItemUuid,
                        } 
                    }
                })
                if(save.success){
                    setSpinflag(false)
                    let data = save.data.afcmpreAgFeeDateDetails[0]
                    dateData[index].saveShowHide=false
                    recordVal.afcmpreAgFeeDateDetails = dateData
                    dateData.splice(index, 1, data);
                    setDateData([...dateData])
                    setInfoTips({alertStatus: 'alert-success', message: save.message});
                }else{
                    setSpinflag(false)
                    setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
                }
            }
            }else if(property=='BL'){
                let save= await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD,{
                    'method':"POST",
                    'data':{
                        'params':{
                            'afcmpreAgFeeRateDetails':[{
                            'agreementHeadUuid':agreementHeadUuid,
                            'agreementItemUuid':record.agreementItemUuid,
                            'feeAgreementCode':feeAgreementCode,
                            'agreementRateDetailUuid':record.agreementRateDetailUuid,
                            'feePrice':record.feePrice,
                            'feeCurrencyCode':record.feeCurrencyCode,
                            id: record.id,
                            }],
                            'agreementHeadUuid':agreementHeadUuid,
                            id: recordVal.id,
                            preId: recordVal.preId,
                            calculationMethod: recordVal.calculationMethod,
                            feeAgreementCode: feeAgreementCode,
                            agreementItemUuid: recordVal.agreementItemUuid,
                        }
                    }
                })
                if(save.success){
                    setSpinflag(false)
                    let data = save.data.afcmpreAgFeeRateDetails[0]
                    blData[index].saveShowHide=false
                    recordVal.afcmpreAgFeeRateDetails = blData
                    blData.splice(index, 1, data);
                    setBlData([...blData]);
                    setInfoTips({alertStatus: 'alert-success', message: save.message});
                }else{
                    setSpinflag(false)
                    setInfoTips({alertStatus: 'alert-error', message: save.errorMessage});
                }

        }
   }

   //时间(DATE)计算方法新增item
   const dateaddItem = () =>{
        setInfoTips({})
        let length = dateData ? dateData.length : 0
        if(length == 0){
            setDateData([])
            let data={
                'calculationPeriod':'',
                'feeCurrencyCode':'',
                'feePrice':'',
                'saveShowHide':true
            }
            dateData.push(data)
            setDateData([...dateData])
        }else{
            let itemid = dateData[length - 1].id
            if(itemid){
                let data={
                    'calculationPeriod':'',
                    'feeCurrencyCode':'',
                    'feePrice':'',
                    'saveShowHide':true
                }
                dateData.push(data)
                setDateData([...dateData])
            }else{
                setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'}) })
            }
        }
   }

    //CALL/CALL2/MCALL/VOY/VOY2 计算方法新增item 
    const calladdItem = () =>{
        setInfoTips({})
        let length = callData ? callData.length : 0
        if(length == 0){
            setCallData([])
            let data={
                'callNumber':'',
                'feeCurrencyCode':'',
                'feePrice':'',
                'saveShowHide':true
            }
            callData.push(data)
            setCallData([...callData])
        }else{
            let itemid = callData[length - 1].id
            // console.log(itemid)
            if(itemid){
                let data={
                    'callNumber':'',
                    'feeCurrencyCode':'',
                    'feePrice':'',
                    'saveShowHide':true
                }
                callData.push(data)
                setCallData([...callData])
            }else{
                setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'}) })
            }
        }
    }

    //船舶吨位法(VSHP)计算方法新增item 
    const vshpaddItem = () =>{
        setInfoTips({})
        console.log(dataSource[itemdataIndex].modifyFlag)
        if (dataSource[itemdataIndex].modifyFlag == 'Y') {  //修改1.10
            let length = vshpData ? vshpData.length : 0
            if(length == 0){
                setVshpData([])
                let data={
                    'startTeu': '0',
                    'endTeu': '0',
                    'feeCurrencyCode': '',
                    'feePrice': '0.0',
                    'saveShowHide': true
                }
                vshpData.push(data)
                setVshpData([...vshpData])
            }else{
                let itemid = vshpData[length - 1].id
                if(itemid){
                    let data={
                        'startTeu': '0',
                        'endTeu': '0',
                        'feeCurrencyCode': '',
                        'feePrice': '0.0',
                        'saveShowHide': true
                    }
                    vshpData.push(data)
                    setVshpData([...vshpData])
                }else{
                    setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'}) })
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
                vshpDataTow.push(data)
                setVshpDataTow([...vshpDataTow])
            } else {
                let itemid = vshpDataTow[length - 1].id
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
                    setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })

                }
            }
        }
    } 

    //VTEU计算方法新增item 
    const vteuaddItem = () =>{
        setInfoTips({})
        let length = vteuData ? vteuData.length : 0
        if(length == 0){
            setVteuData([])
            let data={
                'startTeu':'',
                'endTeu':'',
                'feeCurrencyCode':'',
                'feePrice':'',
                'saveShowHide':true
            }
            vteuData.push(data)
            setVteuData([...vteuData])
        }else{
            let itemid = vteuData[length - 1].id
            if(itemid){
                let data={
                    'startTeu':'',
                    'endTeu':'',
                    'feeCurrencyCode':'',
                    'feePrice':'',
                    'saveShowHide':true
                }
                vteuData.push(data)
                setVteuData([...vteuData])
            }else{
                setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'}) })
            }
        }
    }

    //提单法(BL)计算方法新增item 
    const bladdItem = () =>{
        setInfoTips({})
        let length = blData ? blData.length : 0
        if(length == 0){
            setBlData([])
            let data={
                'feeCurrencyCode':'',
                'feePrice':'',
                'saveShowHide':true
            }
            blData.push(data)
            setBlData([...blData])
        }else{
            let itemid = blData[length - 1].id
            if(itemid){
                let data={
                    'feeCurrencyCode':'',
                    'feePrice':'',
                    'saveShowHide':true
                }
                blData.push(data)
                setBlData([...blData])
            }else{
                setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'}) })
            }
        }
    }

   //北美新增item
   const aggaddItem = () =>{
        setInfoTips({})
        let length = aggData ? aggData.length : 0
        if(length == 0){
            setAggData([])
            let data={
                'groupCode':'',
                'startTeu':'',
                'endTeu':'',
                'fromDate':'',
                'toDate':'',
                'unitPrice':'',
                'feeCurrencyCode':'',
                'unitPriceType':'',
                'saveShowHide':true
            }
            aggData.push(data)
            setAggData([...aggData])
        }else{
            let itemid = aggData[length - 1].id
            if(itemid){
                let data={
                    'groupCode':'',
                    'startTeu':'',
                    'endTeu':'',
                    'fromDate':'',
                    'toDate':'',
                    'unitPrice':'',
                    'feeCurrencyCode':'',
                    'unitPriceType':'',
                    'saveShowHide':true
                }
                aggData.push(data)
                setAggData([...aggData])
            }else{
                setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'}) })
            }
        }
   }

   //新增表格删除
   const itemDelete = (record,index) =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setSpinflag(true)
                confirmModal.destroy()
                // if(record.agreementItemUuid){
                if(record.agreementHeadUuid){
                    let deletes = await request($apiUrl.PRECALC_AGENCY_DELETE_ITEM_UUID,{
                         method:"POST",
                         data:{
                            params:{
                                // preId: record.preId,
                                // agreementHeadUuid: record.agreementHeadUuid,
                                id: record.id,
                            }
                             
                         }
                     })
                     if(deletes.success){
                        setSpinflag(false)
                        // Toast('', formatMessage({id:'lbl.successfully-delete'}), 'alert-success', 5000, false);
                        setInfoTips({alertStatus: 'alert-success', message: deletes.message});
                        dataSource.splice(index, 1)
						setDataSource([...dataSource])
                        setCallData([])  //ALL/CALL2/MCALL/VOY/VOY2 计算方法表格数据
                        setComputingMethodData([])  //箱量法(CNT/CNT2)计算方法明细 
                        setDateData([])  //时间(DATE)计算方法表格数据
                        setVshpData([])   //船舶吨位法(VSHP)计算法表格数据
                        setVteuData([])  //VTEU计算法表格数据
                        setBlData([])   //提单法(BL)计算方法表格数据
                        setAggData([])  //北美箱量累进(AGG)计算方法表格数据
                        setAgreementItemUuid("")
                        setChecked([])
                        emptyCalculationMethod()
                        setShowFlag(true)
                     }else{
                        setSpinflag(false)
                        setInfoTips({alertStatus: 'alert-error', message: deletes.errorMessage});
                     }
                }else{
                    setSpinflag(false)
                     dataSource.splice(index,1)
                     setDataSource([...dataSource])
                }
            }
        })
   }
    //计算表格删除
   const itemTableDelete = (record,index,name) =>{
    setInfoTips({})
    console.log(name)
    Toast('', '', '', 5000, false);
    var vshpName
    if(name=='VSHP'){
        if((recordVal.calculationMethod=='VSHP' && recordVal.modifyFlag=='N') || recordVal.calculationMethod!='VSHP' && recordVal.compareCalculationMethod=='VSHP'){//compareCalculationMethod
            vshpName = 'N'
        }else if(recordVal.calculationMethod=='VSHP' && recordVal.modifyFlag=='Y'){
            vshpName = 'Y'
        }
    }else{
        vshpName = ''
    }
    console.log(vshpName)
    const confirmModal = confirm({
        title: intl.formatMessage({id:'lbl.delete'}),
        content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
        okText: intl.formatMessage({id: 'lbl.affirm'}),
        okType: 'danger',
        closable:true,
        cancelText:'',
        async onOk() {
            setSpinflag(true)
            confirmModal.destroy()
            console.log(vshpName)
            if(record.id){
                let deletes = await request($apiUrl.PRECALC_AGENCY_DELETE_METHOD_UUID,{
                     method:"POST",
                     data:{
                         'params':{
                            // 'agreementHeadUuid':record.agreementHeadUuid,
                            // 'calculationMethod':recordVal.calculationMethod,
                            'calculationMethod':name,
                            'methodUuid':record.id,
                            preId: record.preId,
                            modifyFlag: vshpName,
                         },
                         operateType: 'DEL'
                     }
                 })
                 if(deletes.success){
                    console.log(vshpName)
                    setSpinflag(false)
                    // Toast('',  formatMessage({id:'lbl.successfully-delete'}), 'alert-success', 5000, false);
                    setInfoTips({alertStatus: 'alert-success', message: deletes.message});
                    if(name=='VSHP'){ ////船舶吨位法(VSHP)计算法表格数据
                        // vshpData.splice(index,1)
                        // setVshpData([...vshpData])
                        if (dataSource[itemdataIndex].modifyFlag == 'Y') {  //修改1.10
                            vshpData.splice(index, 1)
                            setVshpData([...vshpData])
                        } else {
                            vshpDataTow.splice(index, 1)
                            setVshpDataTow([...vshpDataTow])
                        }
                    }else if(name=='CNT1'||name=='CNT2'){ ////箱量表格数据
                    // }else if(name=='computingMethod'){ ////箱量表格数据
                        computingMethodData.splice(index,1)
                        setComputingMethodData([...computingMethodData])  
                    }else if(name=='CALL'||name=='CALL2'||name=='MCALL'||name=='VOY'||name=='VOY2'){ //ALL/CALL2/MCALL/VOY/VOY2 计算方法表格数据
                        callData.splice(index,1)
                        setCallData([...callData])   
                    }else if(name=='DATE'){  ////时间(DATE)计算方法表格数据
                        dateData.splice(index,1)
                        setDateData([...dateData])
                    }else if(name=='BL'){   // 提单法(BL)计算方法表格数据
                        blData.splice(index,1)
                        setBlData([...blData])
                    }else if(name=='VTEU'){  ////VTEU计算法表格数据
                        vteuData.splice(index,1)
                        setVteuData([...vteuData])
                    }else if(name=='AGG'){   //// 北美箱量累进(AGG)计算方法表格数据
                        aggData.splice(index,1)
                        setAggData([...aggData])
                    }
                }else{
                    setSpinflag(false)
                    setInfoTips({alertStatus: 'alert-error', message: deletes.errorMessage});
                }
            }else{
                setSpinflag(false)
                // dataSource.splice(index,1)
                // setDataSource([...dataSource])
                // setInfoTips({alertStatus: 'alert-error', message: deletes.errorMessage});
                 if(name=='VSHP'){
                    // vshpData.splice(index,1)
                    // setVshpData([...vshpData])
                    if (dataSource[itemdataIndex].modifyFlag == 'Y') {  //修改1.10
                        vshpData.splice(index, 1)
                        setVshpData([...vshpData])
                    } else {
                        vshpDataTow.splice(index, 1)
                        setVshpDataTow([...vshpDataTow])
                    }
                 }else if(name=='CNT1'||name=='CNT2'){
                    computingMethodData.splice(index,1)
                    setComputingMethodData([...computingMethodData])
                 }else if(name=='CALL'||name=='CALL2'||name=='MCALL'||name=='VOY'||name=='VOY2'){//CALL/CALL2/MCALL/VOY/VOY2
                    callData.splice(index,1)
                    setCallData([...callData])
                 }else if(name=='DATE'){
                    dateData.splice(index,1)
                    setDateData([...dateData])
                 }else if(name=='BL'){
                    blData.splice(index,1)
                    setBlData([...blData])
                 }else if(name=='VTEU'){
                    vteuData.splice(index,1)
                    setVteuData([...vteuData])
                 }else if(name=='AGG'){
                    aggData.splice(index,1)
                    setAggData([...aggData])
                 }
                 setInfoTips({alertStatus:'alert-success',message:formatMessage({id: 'lbl.successfully-delete'}) })
            }
        }
    })
}

   //新增表格编辑
   const newTableCompile = (record,index) =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        setItemIndex(record.id)
        setModifyFlagSele(record.modifyFlag)
        setCalculationMethod(record.calculationMethod)
        setCompareCalculationMethod(record.compareCalculationMethod)
        setItemDataIndex(index)
        setMoId(record.id)
        setCalculationMethodRadio(record.calculationMethod)
        setCompareCalculationMethodRadio(record.compareCalculationMethod)
        setModifyFlagRadio(record.modifyFlag)
        setCompareIndicatorRadio(record.compareIndicator)
        setTsIndicator(record.tsIndicator)
        // record.saveShowHide=true
        costKey.map((v,i)=>{
            if(record.feeClass==v.feeCode){
               let list=v.listAgTypeToClass
               list.map((v,i)=>{
                   v['value']=v.feeCode
                   v['label']=v.feeCode+'(' + v.feeName +')';
               })
               if(v.listAgTypeToClass.length==list.length){
                   setSubclass('')
                   setSubclass(list)
               }
           }
       })
        if (record.compareIndicator == 'Y') {
            acquireSelectData('AFCM.AGMT.CALC.MODES.CALCMODES', setChooseBigCharge, $apiUrl)
        } else {
            dataSource[index].compareCalculationMethod = ''
        }
       if(record.saveShowHide==false){
            dataSource[index].saveShowHide=true
            setDataSource([...dataSource])
        }
   }
    //新增表格文本
    const addColumns = [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a disabled={flag?true:false} style={{ color: flag ? '#ccc' : 'red' }} onClick={()=>{itemDelete(record,index)}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false}  onClick={()=>{newTableCompile(record,index)}}><FormOutlined /></a>&nbsp;</Tooltip>
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}} disabled={flag?true:false} onClick={()=>{itemSave(record,index)}}><SaveOutlined /></a></Tooltip>&nbsp;&nbsp;
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Reference-code-class" />,//参考代码类型
            dataIndex: 'heryType',
            sorter: false,
            width: 100,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'heryType')} options={codeType.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.identifying-code" />,//参考代码
            dataIndex: 'heryCode',
            sorter: false,
            width: 100,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Input  defaultValue={text} maxLength={10}  onChange={(e)=>getCommonInputVal(e,record,'heryCode')} />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Big-class-fee" />,//费用大类
            dataIndex: 'feeClass',
            sorter: false,
            width: 120,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                    { record.saveShowHide? <Select defaultValue={record.feeClass} onChange={(e)=>getCommonSelectVal(e,record,'feeClass')} options={costKey}  />:costKey.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Small-class-fee" />,//费用小类
            dataIndex: 'feeType',
            sorter: false,
            width: 120,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Select defaultValue={record.feeType} onChange={(e)=>getCommonSelectVal(e,record,'feeType')} options={subclass}  />:text} */}
                   { record.saveShowHide?<Select defaultValue={record.feeType} onChange={(e)=>getCommonSelectVal(e,record,'feeType')} options={subclass}  />:subClassAll.length>0?subClassAll.map((v, i) => {
                        return record.feeType == v.value ? <span>{v.label}</span> : ''
                    }):record.feeType}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-or-not-their-own" />,//是否自有船
            dataIndex: 'vesselIndicator',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.vesselIndicator} onChange={(e)=>getCommonSelectVal(e,record,'vesselIndicator')} options={selfOwnedVessels.values}  />:selfOwnedVessels.values.map((v, i) => {
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
            align:'left',
            render:(text,record,index) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.calculationMethod} onChange={(e)=>getCommonSelectVals(e,record,'calculationMethod',index)} options={countMethod.values} ></Select> :countMethod.values.map((v, i) => {
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
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select  defaultValue={record.compareIndicator} onChange={(e)=>getCommonSelectVal(e,record,'compareIndicator')} options={allWhether.values}  />:allWhether.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Choose-a-large-calculation-method" />,//择大计算方法
            dataIndex: 'compareCalculationMethod',
            sorter: false,
            width: 120,
            align:'left',
            render:(text,record,index) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide&&record.compareIndicator == 'Y' ?<Select defaultValue={record.compareCalculationMethod}  disabled={maxFlag} onChange={(e)=>getCommonSelectVal(e,record,'compareCalculationMethod',index)} options={chooseBigCharge.values}  />:chooseBigCharge.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })} */}
                    {record.saveShowHide&&record.compareIndicator == 'Y' ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'compareCalculationMethod',index)} options={chooseBigCharge} /> : chooseBigCharge.length>0?chooseBigCharge.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    }):text}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Is-it-a-special-rate" />,//是否特殊费率
            dataIndex: 'tsIndicator',
            sorter: false,
            width: 85,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.tsIndicator} onChange={(e)=>getCommonSelectVal(e,record,'tsIndicator')} options={allWhether.values}  />:allWhether.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-or-not-tiered-rates" />,//是否阶梯费率
            dataIndex: 'modifyFlag',
            sorter: false,
            width: 85,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.modifyFlag} onChange={(e)=>getCommonSelectVal(e,record,'modifyFlag',index)} options={allWhether.values}  />:allWhether.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        },
        {
            title: <FormattedMessage id="lbl.Whether-the-price-includes-tax" />,//是否含税价
            dataIndex: 'vatFlag',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Select defaultValue={record.vatFlag} onChange={(e)=>getCommonSelectVal(e,record,'vatFlag')} options={cal.values}  />:cal.values.map((v, i) => {
                        return text == v.value ? <span>{v.label}</span> : ''
                    })}
                </div>
            }
        }
    ]
    //计算表格编辑
   const computingCompile = (record,index,name) =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        if(record.saveShowHide==false){
        if(name=='computingMethod'){
                computingMethodData[index].saveShowHide=true
                setComputingMethodData([...computingMethodData])
            }else if(name=='BL'){
                blData[index].saveShowHide=true
                setBlData([...blData])
            }else if(name=='vteu'){
                vteuData[index].saveShowHide=true
                setVteuData([...vteuData])
            }else if(name=='vshp'){
                // vshpData[index].saveShowHide=true
                // setVshpData([...vshpData])
                if (dataSource[itemdataIndex].modifyFlag == 'Y') {  //修改1.10
                    vshpData[index].saveShowHide = true
                    setVshpData([...vshpData])
                } else {
                    vshpDataTow[index].saveShowHide = true
                    setVshpDataTow([...vshpDataTow])
                }
            }else if(name=='call'){
                callData[index].saveShowHide=true
                setCallData([...callData])
            }else if(name=='date'){
                dateData[index].saveShowHide=true
                setDateData([...dateData])
            }else if(name=='agg'){
                aggData[index].saveShowHide=true
                aggData[index].fromDate=moment(aggData[index]?.fromDate, 'YYYY-MM-DD')
                aggData[index].toDate=moment(aggData[index]?.toDate, 'YYYY-MM-DD')
                setAggData([...aggData])
            }else if (name == 'rate') {
                rateData[index].saveShowHide = true
                setRateData([...rateData])
            }
       }
    }

    //箱量计算法表格文本
    const computingMethodColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: itemFlag ? 'red' : '#ccc' }} disabled={itemFlag?false:true} onClick={()=>{itemTableDelete(record,index,'CNT1', 'computingMethod')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={itemFlag?false:true} onClick={()=>{computingCompile(record,index,'computingMethod')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip  title={<FormattedMessage id='btn.save' />} onClick={()=>{calculateSave(index,record,'operand')}}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={itemFlag?false:true}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.empty-container-mark' />,//空重箱标志
            dataIndex: 'emptyFullIndicator',
            sorter: false,
            width: 70,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'emptyFullIndicator')} options={emptyFullIndicator.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.lnward-outward-transit' />,//进/出/中转
            dataIndex: 'transmitIndicator',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'transmitIndicator')} options={transmitIndicator.values}  />:text}
                </div>
            }
        },{
            title: <FormattedMessage id='lbl.Box-size-group' />,//箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            sorter: false,
            width: 70,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'containerSizeTypeGroup')} options={containerSizeTypeGroup}  />:text}
                </div>
            }
        },{
            title: <FormattedMessage id='lbl.empty-box-mark' />,//SOC
            dataIndex: 'socIndicator',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'socIndicator')} options={socIndicator.values}  />:text}
                </div>
            }
        },{
            title: <FormattedMessage id='lbl.Domestic-trade-foreign-trade' />,//内贸/外贸
            dataIndex: 'cargoProperty',
            sorter: false,
            width: 70,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'cargoProperty')} options={cargoProperty.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'unitPrice',
            sorter: false,
            width: 80,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'unitPrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber precision={1} maxLength={10}  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'unitPrice')}}  span={24}/>:text}
                </div>                  
            }
            
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 60,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price-type' />,//单价类型
            dataIndex: 'unitPriceType',
            sorter: false,
            width: 70,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'unitPriceType')} options={unitPriceType.values}  />:text}
                </div>
            }
        }
    ]
    //提单法(BL)计算方法表格文本
    const BLColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{itemTableDelete(record,index,'BL')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{computingCompile(record,index,'BL')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={()=>{calculateSave(index,record,'BL')}}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 60,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber precision={4}  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 60,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        }
    ]

    //VTEU计算方法表格文本
    const VTEUColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 90,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{itemTableDelete(record,index,'VTEU')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{computingCompile(record,index,'vteu')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false}  onClick={()=> {calculateSave(index,record,'VTEU')}}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Starting-point-tonnage' />,//船舶吨位起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 90,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'startTeu')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  defaultValue={text} min={0} onChange={(e)=> {getCommonInputVal(e,record,'startTeu')}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Tonnage-cut-off-point' />,//船舶吨位截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 90,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'endTeu')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  defaultValue={text}  min={0} onChange={(e)=> {getCommonInputVal(e,record,'endTeu')}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 90,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 90,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  precision={4}   defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text}
                </div>
            }
        }
    ]

    //船舶吨位法(VSHP)计算方法表格文本
    const VSHPColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 120,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{itemTableDelete(record,index,'VSHP')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{computingCompile(record,index,'vshp')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} ><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false} onClick={()=>{calculateSave(index,record,'VSHP')} }><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        recordVal ? (recordVal.modifyFlag == 'Y' && recordVal.calculationMethod == 'VSHP') ? {
            title: <FormattedMessage id='lbl.Starting-point-tonnage' />,//船舶吨位起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 120,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'startTeu')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  min={0} defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'startTeu')}}  span={24}/>:text}
                </div>
            }
        } : null : null,
        recordVal ? (recordVal.modifyFlag == 'Y' && recordVal.calculationMethod == 'VSHP') ? {
            title: <FormattedMessage id='lbl.Tonnage-cut-off-point' />,//船舶吨位截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 120,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'endTeu')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  min={0} defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'endTeu')}}  span={24}/>:text}
                </div>
            }
        } : null : null,
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 120,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price'/>,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 120,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  precision={2}  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text}
                </div>
            }
        }
    ]

    //CALL/CALL2/MCALL/VOY/VOY2 计算方法表格文本
    const CALLColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{itemTableDelete(record,index,'CALL')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{computingCompile(record,index,'call')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}  onClick={()=>{calculateSave(index,record,'CALL/CALL2/MCALL/VOY/VOY2')}}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Port-number' />,//挂港次数
            dataIndex: 'callNumber',
            sorter: false,
            width: 50,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Input type='number'  min={0} defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'callNumber')}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 50,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 60,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber maxLength={10}  precision={2}  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text}
                </div>
            }
        }
    ]

    //时间(DATE)计算方法表格文本
    const DATEColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{itemTableDelete(record,index,'DATE')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{computingCompile(record,index,'date')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={()=>{calculateSave(index,record,'DATE')}}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Date-of-the-period' />,//日期周期
            dataIndex: 'calculationPeriod',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                   {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text}  onChange={(e)=>getCommonSelectVal(e,record,'calculationPeriod')} options={calculationPeriod.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 50,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price' />,//单价
            dataIndex: 'feePrice',
            sorter: false,
            width: 50,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber precision={2} maxLength={10} defaultValue={text} onChange={(e)=> {getCommonInputVal(e,record,'feePrice')}}  span={24}/>:text  }
                </div>
            }
        }
        
    ]

    //北美箱量累进(AGG)计算方法表格文本
    const AGGColumns= [
        {
            title: <FormattedMessage id="lbl.operate" />,//操作
            dataIndex: 'operate',
            sorter: false,
            width: 60,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{itemTableDelete(record,index,'AGG')}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{computingCompile(record,index,'agg')}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={()=>{calculateSave(index,record,'AGG')}}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Group-number' />,//分组号码
            dataIndex: 'groupCode',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                    { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'groupCode')} options={groupCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.volume-point' />,//箱量起算点
            dataIndex: 'startTeu',
            sorter: false,
            width: 65,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'startTeu')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber precision={1} maxLength={10}  min={0} defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'startTeu')}}  span={24}/>:text}
                </div>
            }
        },{
            title: <FormattedMessage id='lbl.Volume-as-point' />,//箱量截止点
            dataIndex: 'endTeu',
            sorter: false,
            width: 65,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'endTeu')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber precision={1} maxLength={10} min={0} defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'endTeu')}}  span={24}/>:text}
                </div>
            }
        },{
            title: <FormattedMessage id='lbl.Start-date-Carton-quantity' />,//箱量累进起始日期
            dataIndex: 'fromDate',
            sorter: false,
            width: 75,
            align:'left',
            render:(text,record) => {
                return <div>
                     <Space direction="vertical">
                        {/* 修改框 */}
                        {/* { record.saveShowHide?<DatePicker defaultValue={text}  onChange={(e)=>{getCommonDateVal(record,e,'fromDate')}}  />:text} */}
                        { record.saveShowHide?<DatePicker defaultValue={text}  onChange={(e)=>{getCommonDateVal(record,e,'fromDate')}}  />:text?text.length>10?text.split(' ')[0]:text:text}
                     </Space>
                   
                </div>
            }
        },{
            title: <FormattedMessage id='lbl.Container-volume-deadline' />,//箱量累进截止日期
            dataIndex: 'toDate',
            sorter: false,
            width: 75,
            align:'left',
            render:(text,record) => {
                return <div>
                     <Space direction="vertical">
                        {/* 修改框 */}
                        {/* { record.saveShowHide?<DatePicker defaultValue={text}  onChange={(e)=>{getCommonDateVal(record,e,'toDate')}}   />:text} */}
                        { record.saveShowHide?<DatePicker defaultValue={text}  onChange={(e)=>{getCommonDateVal(record,e,'toDate')}}   />:text.length>10?text.split(' ')[0]:text}
                     </Space>
                    
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.teu-price' />,//TEU单价
            dataIndex: 'unitPrice',
            sorter: false,
            width: 70,
            align:'right',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   {/* { record.saveShowHide?<Input type='number'  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'unitPrice')}}  span={24}/>:text} */}
                   { record.saveShowHide?<InputNumber precision={1} maxLength={10}  defaultValue={text}  onChange={(e)=> {getCommonInputVal(e,record,'unitPrice')}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.ccy' />,//币种
            dataIndex: 'feeCurrencyCode',
            sorter: false,
            width: 60,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'feeCurrencyCode')} options={feeCurrencyCode.values}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.price-type' />,//单价类型
            dataIndex: 'unitPriceType',
            sorter: false,
            width: 60,
            align:'left',
            render:(text,record) => {
                return <div>
                    { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'unitPriceType')} options={unitPriceType.values}  />:text}
                </div>
            }
        }
    ]
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
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={() => { rateTableDelete(record, index, deletValue) }}><CloseCircleOutlined /> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={flag?true:false} onClick={() => { computingCompile(record, index, 'rate') }}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />} onClick={() => { rateSave(index, record) }}><a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={flag?true:false}><SaveOutlined /></a></Tooltip>
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
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} min={0} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'startTeu') }} span={24} /> : text}
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
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} min={0} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'endTeu') }} span={24} /> : text}
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
            width: 60,
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
                    {record.saveShowHide ? <InputNumber precision={1} maxLength={10} defaultValue={text} onChange={(e) => { getCommonInputVal(e, record, 'percentage') }} span={24} /> : text}
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
            width: 120,
            align:'left',
            fixed: true,
            render:(text,record,index) => {
                return <div className='operation' >
                    {/* 删除 */}
                    <Tooltip title={<FormattedMessage id='btn.delete' />}><a style={{ color: flag ? '#ccc' : 'red' }} disabled={flag?true:false} onClick={()=>{deleteairline(record,index)}}><CloseCircleOutlined/> </a> &nbsp;</Tooltip>
                    {/* 编辑 */}
                    <Tooltip title={<FormattedMessage id='btn.edit' />}><a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={flag?true:false} onClick={()=>{editairline(record,index)}}><FormOutlined /></a>&nbsp;</Tooltip>&nbsp;&nbsp;
                    {/* 保存 */}
                    <Tooltip title={<FormattedMessage id='btn.save' />}  onClick={()=>{saveairline(record,index)}}><a style={{display: record.saveShowHide ? 'inline-block' : 'none'}}  disabled={flag?true:false}><SaveOutlined /></a></Tooltip>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.Airline-code' />,//航线代码
            dataIndex: 'serviceLoopCode',
            sorter: false,
            width: 80,
            align:'left',
            render:(text,record) => {
                return <div>
                    { record.saveShowHide? <Select defaultValue={text} onChange={(e)=>getCommonSelectVal(e,record,'serviceLoopCode')} options={airlineCode}  />:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.start-date' />,//开始日期
            dataIndex: 'fromDate',
            sorter: false,
            width: 100,
            align:'left',
            render:(text,record) => {
                return <div style={{width:'100px'}}>
                     <Space direction="vertical">
                        {/* 修改框 */}
                        {/* { record.saveShowHide?<DatePicker defaultValue={record.fromDate}  onChange={(e)=>{getCommonDateVal(record,e,'fromDate')}}   />:text} */}
                        { record.saveShowHide?<DatePicker span={24} defaultValue={record.fromDate}  onChange={(e)=>{getCommonDateVal(record,e,'fromDate')}}  isSpan={true} />:text.length>10?text.split(' ')[0]:text}
                     </Space>
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.over-date' />,//结束日期
            dataIndex: 'toDate',
            sorter: false,
            width: 100,
            align:'left',
            render:(text,record) => {
                return <div style={{width:'100%'}}>
                     <Space direction="vertical">
                        {/* 修改框 */}
                        {/* { record.saveShowHide?<DatePicker defaultValue={record.toDate}  onChange={(e)=>{getCommonDateVal(record,e,'toDate')}}   />:text} */}
                        { record.saveShowHide?<DatePicker span={24} defaultValue={record.toDate}  onChange={(e)=>{getCommonDateVal(record,e,'toDate')}}   />:text.length>10?text.split(' ')[0]:text}
                     </Space>
                    
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.airlines-group' />,//航线组
            dataIndex: 'serviceGroupCode',
            sorter: false,
            width: 100,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Input  defaultValue={text}  maxLength={5}  onChange={(e)=> {getCommonInputVal(e,record,'serviceGroupCode')}}  span={24}/>:text}
                </div>
            }
        },
        {
            title: <FormattedMessage id='lbl.route-group-description' />,//航线组描述
            dataIndex: 'groupDescription',
            sorter: false,
            width: 120,
            align:'left',
            render:(text,record) => {
                return <div>
                    {/* 修改框 */}
                   { record.saveShowHide?<Input  defaultValue={text}  maxLength={10}  onChange={(e)=> {getCommonInputVal(e,record,'groupDescription')}}  span={24}/>:text}
                </div>
            }
        }
    ]

    // 箱型尺寸详细-表头
	const sizeDetailedColumns = [
		// {
		// 	title: <FormattedMessage id='lbl.Box-size-name' />,      // 箱型组尺寸名字
		// 	dataIndex: 'containerSizeTypeGroup',
		// 	sorter: false,
		// 	width: 120,
		// 	render: (text, record) => {
		// 		return <div>
		// 			{text}
		// 		</div>
		// 	}
		// }, 
        {
			title: <FormattedMessage id='lbl.Box-size' />,      // 箱型尺寸
			dataIndex: 'containerSizeType',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{text}
				</div>
			}
		},     {
			title: <FormattedMessage id='lbl.cargo-class' />,      // 货类
			dataIndex: 'cargoNatureCode',
			sorter: false,
			width: 80,
			render: (text, record) => {
				return <div>
					{text}
				</div>
			}
		}
	]

    // 新增箱型尺寸组始化
	const getData = async () => {
        Toast('','', '', 5000, false)

		await request.post($apiUrl.COMM_AGMT_NEW_TYPE_GROUP_INIT)
			.then((result) => {
				if(result.success) {
					let data = result.data;
					setGroupInit(data);
				} else {
					Toast('', '', '', 5000, false);
				}
			})
    }
    // 点击增加class类
	const [currentIndex, setCurrentIndex] = useState();
    const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
    // const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [natureCode, setNatureCode] = useState({});  // 货类
    const [showFlag, setShowFlag] = useState(true);   //箱量计算方法明细显示
    const [itemdataIndex,setItemDataIndex] = useState('')
	const changeIdx = (idx) => {
		setCurrentIndex(idx)
	}
	let isSizeBoxAddflag

    //添加指定箱型尺寸信息
   const rightBtn = () =>{
    Toast('','', '', 5000, false)
    setInfoTips({})
    let data = queryForm.getFieldValue();
		let idx = newSizeDetailedTable.length;
        // if(!groupInit[currentIndex]||!data.cargoNatureCode){
        //     // Toast('', formatMessage({id:'lbl.Box-size-Name-and-box-size-mandatory'}), 'alert-warning', 5000, false)
        //     setInfoTips({alertStatus: 'alert-error', message: formatMessage({id:'lbl.Box-size-Name-and-box-size-mandatory'})});
        // }
        if(data.cargoNatureCode){
            if(groupInit[currentIndex]==undefined){
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.banlie-box-size'})});
                return
            }
            isSizeBoxAddflag =  true
            sizeDetailedTable.map((item) => {
                if ((data.cargoNatureCode == item.cargoNatureCode && groupInit[currentIndex] == item.containerSizeType) || idx == item.id) {
                    isSizeBoxAddflag = false
                }
            })
            if (!isSizeBoxAddflag) {
                return
            }
            let json = {
                containerSizeTypeGroup: data.containerSizeTypeGroup,//箱型尺寸组名字
                cargoNatureCode: data.cargoNatureCode,//货类
                containerSizeType: groupInit[currentIndex],//箱型尺寸
                id: idx++
            }
            sizeDetailedTable.push(json);
            newSizeDetailedTable.push(json);
            setSizeDetailedTable([...sizeDetailedTable])
            setNewSizeDetailedTable([...newSizeDetailedTable])
        } else {
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Goods-category-required'})});
		}
   }
   //添加全部箱型尺寸
   const addAllBoxDetail = ( ) =>{
        Toast('','', '', 5000, false)
        setInfoTips({})
        setCheckedRow([])
        setChecked([])
        const newGroupInit = []
		let data = queryForm.getFieldValue();
		let idx = newSizeDetailedTable.length;
        // if(!data.cargoNatureCode){
        //     // Toast('', formatMessage({id:'lbl.Box-size-group-name-is-required'}), 'alert-warning', 5000, false)
        //     setInfoTips({alertStatus: 'alert-error', message: formatMessage({id:'lbl.Goods-category-required'})});
        // }
        if(data.cargoNatureCode) {
            isSizeBoxAddflag = true
            for (let i = 0; i < sizeDetailedTable.length; i++) {
                for (let j = 0; j < groupInit.length; j++) {if ((data.cargoNatureCode == sizeDetailedTable[i].cargoNatureCode && groupInit[j] == sizeDetailedTable[i].containerSizeType) || idx == sizeDetailedTable[i].id) {
                        isSizeBoxAddflag = false
                    }
                }
            }
            if (!isSizeBoxAddflag) {
                return
            }

            groupInit.map((item) => {
                newGroupInit.push({
                    containerSizeTypeGroup: data.containerSizeTypeGroup,
                    cargoNatureCode: data.cargoNatureCode,
                    containerSizeType: item,
                    id: idx++
                })
            })
            let sizeDetailedTableAll = sizeDetailedTable.concat(newGroupInit)
            setSizeDetailedTable([...sizeDetailedTableAll])
            setNewSizeDetailedTable([...sizeDetailedTableAll])
        } else {
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Goods-category-required'})});
		}
   }
   //删除指定箱型尺寸
   const deleteBoxSize = ( ) =>{
        setInfoTips({})
        if(checkedRow.length==0){
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Unclock-tips'})});
        }
        if(checkedRow){
            if (checkedRow.length == sizeDetailedTable.length) {
                setSizeDetailedTable([])
                setCheckedRow([])
                setChecked([])
            }
            let newSizeDetailedTable3 = sizeDetailedTable;
            let sizeDetailedSelectedRows3 = [...checkedRow];
            for (var i = 0; i < checkedRow.length; i++) {
                for (var j = 0; j < sizeDetailedTable.length; j++) {
                    if (checkedRow[i].id == sizeDetailedTable[j].id) {
                        newSizeDetailedTable3.splice(j, 1)
                        sizeDetailedSelectedRows3.splice(i, 1)
                    }
                }
            }
            setSizeDetailedTable([...newSizeDetailedTable3])
            setCheckedRow([...sizeDetailedSelectedRows3])
        }
    }
    //删除全部箱型尺寸
    const deleteAllBoxDetail = ( ) =>{
        setInfoTips({})
        setSizeDetailedTable([])
		setCheckedRow([])
        setChecked([])
    }
    //保存全部箱型尺寸
    const saveBoxSize = async() =>{
        setInfoTips({})
        setSpinflag(true)
        // console.log(commissionAgmtCntrSizeTypeGroups)
        // console.log(checkedRow)
        // console.log(sizeDetailedTable)
        Toast('', '', '', 5000, false);
		let data = queryForm.getFieldValue();
		if(data.containerSizeTypeGroup) {
            if(checked.length==0){
                setSpinflag(false)
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.save-group-warn'})});
                return;
            }
            if(data.containerSizeTypeGroup.length>5){
                setSpinflag(false)
                setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.banlie-box-size-group'})});
                return
            }
            let tengquan = [...sizeDetailedTable]
			tengquan = tengquan.map((item) => {
				// item.agreementHeadUuid = agreementHeadUuid;
				item.feeAgreementCode = feeAgreementCode;
				item.containerSizeTypeGroup = data.containerSizeTypeGroup
				delete item.id
				return item
            })

            let groupSizeData = []
            checkedRow.map((v, i) => { 
                groupSizeData.push({
                    // containerSizeTypeGroup: v.containerSizeTypeGroup,
                    containerSizeTypeGroup: queryForm.getFieldValue().containerSizeTypeGroup,
                    containerSizeType: v.containerSizeType,
                    cargoNatureCode: v.cargoNatureCode,
                    agreementHeadUuid: compileData.agreementHeadUuid,
                    preId: compileData.preId,
                    feeAgreementCode:feeAgreementCode,
                })
            })
			await request($apiUrl.PRECALC_AGENCY_SAVE_CNTR_GROUP, {
				method: 'POST',
				data: {
                    operateType:isEditBoxSize,
                    params:{
                        agreementHeadUuid: compileData.agreementHeadUuid,
                        feeAgreementCode:feeAgreementCode,
                        containerSizeTypeGroup:data.containerSizeTypeGroup,//箱型尺寸组名称
                        preId: compileData.preId
                    },
                    paramsList: groupSizeData
                    // paramsList: tengquan
                    // paramsList:tengquan
                    // paramsList:{
                    //     // agreementHeadUuid:agreementHeadUuid,

                    // }
				}
			})
			.then((res) => {
				if(res.success) {
                    setSpinflag(false)
                    const resData = res.data || []
					setSizeDetailedTable([])
					setCheckedRow([])
                    setChecked([])
					setNewSizeDetailedTable([])
					setCommissionAgmtCntrSizeTypeGroups(resData)
					setIsEditBoxSize('NEW')
					queryForm.setFieldsValue({
						containerSizeTypeGroup: ''
                    })
                    //保存成功!
					// Toast('',formatMessage({id:'lbl.save-successfully'}), 'alert-success', 5000, false)
                    setInfoTips({alertStatus: 'alert-success', message: res.message});
				}else{
                    setSpinflag(false)
                    setInfoTips({alertStatus: 'alert-error', message: res.errorMessage});
                }
			})
		}else {
            setSpinflag(false)
            //箱型尺寸组是必填项！
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id:'lbl.Box-size-group-name-is-required'})});
        }
       
    }
    //选中要删除的数据
    const getSelectedRows = (val) =>{
		setCheckedRow(val)
    }
    //重置箱型尺寸
	const resetBoxSize = () => {
        setInfoTips({})
        Toast('', '', '', 5000, false);
		setSizeDetailedTable([])
        setCheckedRow([])
        queryForm.setFieldsValue({
            containerSizeTypeGroup: null,
            cargoNatureCode: null,
        })
    }
    
    //删除左侧箱型尺寸组
	const deleteAddSuccessBoxSize = (item) => {
        setInfoTips({})
        // console.log(item)
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
                setSpinflag(true)
                confirmModal.destroy()
                let uuid=[]
                item.afcmpreAgContainerSizeTypeGroups.map((v,i)=>{
                    uuid.push(v.id)
                })
                await request($apiUrl.PRECALC_AGENCY_DELETE_CNTR_GROUP, {
                    method: 'POST',
                    data: {
                        // operateType:'UPD',
                        // uuids:[...uuid],
                        // uuid:agreementHeadUuid
                        params:{
                            preId: compileData.preId,
                            agmtHeadUuid: compileData.agreementHeadUuid,
                        },
                        // uuids: item.containerSizeTypeGroupUuid,
                        uuids: uuid,

                    }
                })
                .then((res) => {
                    if(res.success){
                        setSpinflag(false)
                        const resData = res.data || []
                        setCommissionAgmtCntrSizeTypeGroups([...resData])
                        // Toast(res.message, '', 'alert-success', 5000, false)
                        setInfoTips({alertStatus: 'alert-success', message: res.message});
                    }else{
                        setSpinflag(false)
                        setInfoTips({alertStatus: 'alert-error', message: res.errorMessage});
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
        setInfoTips({})
        console.log(item)
		Toast('', '', '', 5000, false);
        let idx = newSizeDetailedTable.length;
		item.afcmpreAgContainerSizeTypeGroups.map((item) => {  //agContainerSizeTypeGroupList
			item.id = idx++
		})
		queryForm.setFieldsValue({
			containerSizeTypeGroup: item.containerSizeTypeGroup
        })
		setIsEditBoxSize('UPD')
		setSizeDetailedTable([...item.afcmpreAgContainerSizeTypeGroups])
		setNewSizeDetailedTable([...item.afcmpreAgContainerSizeTypeGroups])
    }
    //新增航线组
    const groupaddItem = async() =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        let data={
            'serviceLoopCode':'',
            'serviceGroupCode':'',
            'groupDescription':'',
            'fromDate':'',
            'toDate':'',
            'saveShowHide':true
        }
        airlineData.push(data)
        setairlineData([...airlineData])
        setairlineFlag(false)
    }
    //保存航线组
    const saveairline = async(record,index) =>{
        setInfoTips({})
        setSpinflag(true)
        // console.log(record)
        Toast('', '', '', 5000, false);
        let fromDate
        let toDate
        if(record.fromDate._i&&record.toDate._i){
            fromDate=record.fromDate._i
            toDate=record.toDate._i
        }else if(record.fromDate._i){
            fromDate=record.fromDate._i
            toDate=record.toDate
        }else if(record.toDate._i){
            fromDate=record.fromDate
            toDate=record.toDate._i
        }else{
            fromDate=record.fromDate
            toDate=record.toDate
        }
       
        if(!record.serviceLoopCode && !record.fromDate && !record.toDate && !record.groupDescription && !record.serviceGroupCode){
            setSpinflag(false)
            setInfoTips({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.calculation-save-line-group'})});
            return
        }
        let group = await request($apiUrl.PRECALC_AGENCY_SAVE_SVC_GROUP,{
            method:"POST",
            data:{
                "operateType": 'SAVE',
                params:{
                    'agreementHeadUuid':agreementHeadUuid,
                    'feeAgreementCode':feeAgreementCode,
                    'serviceLoopCode':record.serviceLoopCode,
                    'serviceGroupCode':record.serviceGroupCode,
                    'groupDescription':record.groupDescription,
                    'fromDate':fromDate,
                    'toDate':toDate,
                    'agreementServiceGroupUuid':record.agreementServiceGroupUuid?record.agreementServiceGroupUuid:null,
                    'versionId':record.versionId?null:record.versionId,
                    preId: compileData.preId,
                    id: record.id
                }
            }
        })
        if(group.success){
            setSpinflag(false)
            setairlineFlag(true)
            let agFeeServiceGroupList
            let b= await request($apiUrl.PRECALC_AGENCY_SEARCH_PRE_HEAD_DETAIL,{
                method:"POST",
                data:{
                    'uuid':agreementHeadUuid,
                }
            })
            airlineData[index].saveShowHide=false
            // airlineData.map((v,i)=>{
            //     if(v.fromDate._i&&v.toDate._i){
            //         v.fromDate=v.fromDate._i
            //         v.toDate=v.toDate._i
            //     }
            // })
            // setairlineData([...airlineData])
            if(b.success){
                let compliedata = b.data
                agFeeServiceGroupList=compliedata.agFeeServiceGroupList
            }
            airlineData.splice(index, 1, group.data);
            setairlineData([...airlineData])
            // Toast('',formatMessage({id:'lbl.save-successfully'}), 'alert-success', 5000, false)
            setInfoTips({alertStatus: 'alert-success', message: group.message});
        }else{
            setSpinflag(false)
            setInfoTips({alertStatus: 'alert-error', message: group.errorMessage});
        }  

    }
    //编辑航线组
    const editairline = (record,index) =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        console.log(record)
        // if(record.saveShowHide==false){
            airlineData[index].saveShowHide=true
            airlineData[index].fromDate=moment(airlineData[index]?.fromDate, 'YYYY-MM-DD')
            airlineData[index].toDate=moment(airlineData[index]?.toDate, 'YYYY-MM-DD')
            setairlineData([...airlineData])
        // }
   }

   //删除航线组 
   const deleteairline = (record,index) =>{
        setInfoTips({})
        Toast('', '', '', 5000, false);
        const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id: 'lbl.Confirm-deletion'}),
            okText: intl.formatMessage({id: 'lbl.affirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async  onOk() {
                setSpinflag(true)
                confirmModal.destroy()
                if(record.id){
                    let dele= await request($apiUrl.PRECALC_AGENCY_DELETE_SVC_GROUP,{
                        method:"POST",
                        data:{
                            params:{
                                id: record.id,
                                preId: record.preId ? record.preId:record.prepareId,
                            }
                        }
                    })
                    if(dele.success){
                        setSpinflag(false)
                        // Toast('',formatMessage({id:'lbl.successfully-delete'}), 'alert-success', 5000, false)
                        // let b= await request($apiUrl.PRECALC_AGENCY_SEARCH_PRE_HEAD_DETAIL,{
                        //     method:"POST",
                        //     data:{
                        //         'uuid':agreementHeadUuid,
                        //     }
                        // })
                        // let data=b.data
                        // let agFeeServiceGroupList=data.agFeeServiceGroupList
                        // let saveShowHide
                        // airlineData.map((v,i)=>{
                        //     saveShowHide = v.saveShowHide
                        // })
                        // agFeeServiceGroupList.map((v,i)=>{
                        //     v.saveShowHide = saveShowHide
                        // })
                        // agFeeServiceGroupList?setairlineData([...agFeeServiceGroupList]):[]
                        airlineData.splice(index,1)
                        setairlineData([...airlineData])
                        setInfoTips({alertStatus: 'alert-success', message: dele.message});
                    }else{
                        setSpinflag(false)
                        setInfoTips({alertStatus: 'alert-error', message: dele.errorMessage});
                    }
                }else{
                    setSpinflag(false)
                    airlineData.splice(index, 1)
                    setairlineData([...airlineData])
                    setairlineFlag(true)
                }
            }
        })
   }

    //审核协议
    const audit = async(operate) =>{
        Toast('', '', '', 5000, false);
        let vdata=[]
        if(vshpData){
            vdata=vshpData
        }else if(vteuData){
            vdata=vteuData
        }
        let audits = await request($apiUrl.COMM_AGMT_AGMT_PRE_APPROVE,{
            method:'POST',
            data:{
                params:{
                    ...queryForm.getFieldValue(),
                    "fromDate": momentFormat(queryForm.getFieldValue().fromDate),//fromDate.slice(1,11)+' 00:00:00',
                    "toDate":momentFormat(queryForm.getFieldValue().toDate),
                    'agFeeAgreementItemList':[...dataSource],
                    'afcmpreAgFeeContainerPrices':[...computingMethodData],
                    'afcmpreAgFeeDateDetails':[...dateData],
                    'afcmpreAgFeeCallDetails':[...callData],
                    'afcmpreAgFeeVesselTeuDetails':[...vshpData],
                    'afcmpreAgFeeRateDetails':[...blData],
                    'afcmpreAgFeeNaGroupDetails':[...aggData],
                },
                'operateType':operate
            }
        })
        if(audits.success){
            Toast('',intl.formatMessage({id:'lbl.Audit-successful'}), 'alert-success', 5000, false)
        }
    }

    //解锁
    const unlock = async (operate) =>{
        Toast('', '', '', 5000, false);
        let unlocks = await request($apiUrl.AFMT_PRE_UNLOCK,{
            method:'POST',
            data:{
                params:{
                    ...queryForm.getFieldValue(),
                    "fromDate": momentFormat(queryForm.getFieldValue().fromDate),//fromDate.slice(1,11)+' 00:00:00',
                    "toDate":momentFormat(queryForm.getFieldValue().toDate),
                    'agFeeAgreementItemList':[...dataSource],
                    'afcmpreAgFeeContainerPrices':[...computingMethodData],
                    'afcmpreAgFeeDateDetails':[...dateData],
                    'afcmpreAgFeeCallDetails':[...callData],
                    'afcmpreAgFeeVesselTeuDetails':vdata,
                    'afcmpreAgFeeRateDetails':[...blData],
                    'afcmpreAgFeeNaGroupDetails':[...aggData],
                },
                'operateType':operate
            }
        })
        if(unlocks.success){
            //解锁成功
            Toast('',intl.formatMessage({id:'lbl.unlocked'}), 'alert-success', 5000, false)
        }
    }

    //item表格的单选按钮
    const setSelectedRows = (value,uuid) =>{
        setInfoTips({});
        console.log(uuid)
        let val =value[0]
        console.log(val)
        setRecordVal(val)
        Toast('', '', '', 5000, false);
        for(var i=0;i<dataSource.length;i++){
            if(dataSource[i].id == uuid){
                setItemDataIndex(i)
            }
        }
        setItemIndex(uuid)
        setDeletValue(val.calculationMethod)
        setCalculationMethod(val.calculationMethod)
        setCompareCalculationMethod(val.compareCalculationMethod)
        setTsIndicator(val.tsIndicator)
        // if(!val.agreementItemUuid){
        // if(!val.agreementHeadUuid){
        //     setAgreementItemUuid("")
        //     setShowFlag(true)
        //     setInfoTips({alertStatus:'alert-error',message:intl.formatMessage({id:'lbl.calculation-choose-item'})})
        // }
        if(uuid[0]){
            if(val.saveShowHide==true&&(comparecalculationMethodRadio!=val.compareCalculationMethod||calculationMethodRadio!=val.calculationMethod||modifyFlagRadio!=val.modifyFlag||compareIndicatorRadio!=val.compareIndicator)){
                setChecked([])
                emptyCalculationMethod()
                setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0054' }) })
            }else{
                if (val.tsIndicator == 'Y') {
                    setRateFlag(true);
                    val.afcmpreAgFeeDetailPans.map((v, i) => {
                        v.saveShowHide = false
                    })
                    setRateData(val.afcmpreAgFeeDetailPans)
                } else {
                    setRateFlag(false);
                    setRateData([])
                }
                switch(val.calculationMethod){
                    case 'CNT1': 
                    if(val.compareCalculationMethod=='CNT'){
                        setChecked([])
                        emptyCalculationMethod()
                        setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0082' }) })
                    }else{
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false) 
                        setDisFlag(true)  
                        setShowFlag(false)
                        setComputingMethodName('lbl.CNT1-particulars')
                            val.afcmpreAgFeeContainerPrices?setComputingMethodData(val.afcmpreAgFeeContainerPrices):null
                            setAgreementItemUuid(val.id)
                            if(!val.id){
                                setOperandSaveFlag(true)  
                            }else{
                                setOperandSaveFlag(false)
                        };break;
                    }
                        
                    case 'CNT2': 
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setDisFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.CNT2-particulars')
                        val.afcmpreAgFeeContainerPrices?setComputingMethodData(val.afcmpreAgFeeContainerPrices):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                                setOperandSaveFlag(true)  
                            }else{
                                setOperandSaveFlag(false)
                    };break;
                    case 'DATE': 
                        setDisFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setDateFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.DATE-particulars')
                        val.afcmpreAgFeeDateDetails?setDateData(val.afcmpreAgFeeDateDetails):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                            setDateShow(true)
                        }else{
                            setDateShow(false)
                        };break;
                    case 'CALL': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.CALL-particulars')
                        val.afcmpreAgFeeCallDetails?setCallData(val.afcmpreAgFeeCallDetails):null
                            setAgreementItemUuid(val.id)
                            if(!val.id){
                            setComputingMethod(true)
                        }else{
                            setComputingMethod(false)
                        };break;
                    case 'CALL2': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.CALL2-particulars')
                    val.afcmpreAgFeeCallDetails?setCallData(val.afcmpreAgFeeCallDetails):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                            setComputingMethod(true)
                        }else{
                            setComputingMethod(false)
                        };break;
                    case 'MCALL': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.MCALL-particulars')
                        val.afcmpreAgFeeCallDetails?setCallData(val.afcmpreAgFeeCallDetails):null
                            setAgreementItemUuid(val.id)
                            if(!val.id){
                                setComputingMethod(true)
                            }else{
                                setComputingMethod(false)
                            };break;
                    case 'VOY': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.VOY-particulars')
                        val.afcmpreAgFeeCallDetails?setCallData(val.afcmpreAgFeeCallDetails):null
                            setAgreementItemUuid(val.id)
                            if(!val.id){
                                setComputingMethod(true)
                            }else{
                                setComputingMethod(false)
                            };break;
                    case 'VOY2': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setCallFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.VOY2-particulars')
                        val.afcmpreAgFeeCallDetails?setCallData(val.afcmpreAgFeeCallDetails):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                                setComputingMethod(true)
                            }else{
                                setComputingMethod(false)
                            };break;
                    case 'VSHP': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setVshpFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.VSHP-particulars')
                        // val.afcmpreAgFeeDetailPans?setVshpData(val.afcmpreAgFeeDetailPans):null
                        setAgreementItemUuid(val.id)
                        if(val.modifyFlag == 'Y'){
                            val.afcmpreAgFeeVesselTeuDetails?setVshpData(val.afcmpreAgFeeVesselTeuDetails):null
                        }else{
                            val.afcmpreAgFeeRateDetails?setVshpDataTow(val.afcmpreAgFeeRateDetails):null
                        }
                        if(!val.id){
                                setVshpShow(true)
                            }else{
                                setVshpShow(false)
                            };break;
                    case 'VTEU': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setBlFlag(false)
                        setAggFlag(false)
                        setVteuFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.VTEU-particulars')
                        val.afcmpreAgFeeVesselTeuDetails?setVteuData(val.afcmpreAgFeeVesselTeuDetails):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                                setVteuShow(true)
                            }else{
                                setVteuShow(false)
                            };break;
                    case 'BL': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setAggFlag(false)
                        setBlFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.BL-particulars')
                        val.afcmpreAgFeeRateDetails?setBlData(val.afcmpreAgFeeRateDetails):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                                setBlShow(true)
                            }else{
                                setBlShow(false)
                            };break;
                    case 'AGG': 
                        setDisFlag(false)
                        setDateFlag(false)
                        setCallFlag(false)
                        setVshpFlag(false)
                        setVteuFlag(false)
                        setBlFlag(false)
                        setAggFlag(true)
                        setShowFlag(false)
                        setComputingMethodName('lbl.AGG-particulars')
                        val.afcmpreAgFeeNaGroupDetails?setAggData(val.afcmpreAgFeeNaGroupDetails):null
                        setAgreementItemUuid(val.id)
                        if(!val.id){
                            setAggShow(true)
                        }else{
                            setAggShow(false)
                        };break;
                    } 
                    // ============================================择大计算方法===========================================
                    if(val.compareIndicator=='Y'){  //择大选取
                        switch (val.compareCalculationMethod) {
                            case 'CNT':
                                if(val.calculationMethod=='CNT1'||val.calculationMethod=='CNT2'){
                                    setChecked([])
                                    emptyCalculationMethod()
                                    setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0082' }) })
                                }else{
                                    setCompareDateFlag(false)
                                    setCompareCallFlag(false)
                                    setCompareVshpFlag(false)
                                    setCompareVteuFlag(false)
                                    setCompareBlFlag(false)
                                    setCompareAggFlag(false)
                                    setCompareDisFlag(true)
                                    setCompareComputingMethodName('lbl.afcm-0080')
                                    val.afcmpreAgFeeContainerPrices ? setComputingMethodData(val.afcmpreAgFeeContainerPrices) : null
                                    val.afcmpreAgFeeContainerPrices.length>0?val.afcmpreAgFeeContainerPrices.map((v,i)=>{
                                        if(!v.id){
                                            computingMethodData.splice(i, 1)
                                            setComputingMethodData([...computingMethodData])
                                        }else{
                                            v.saveShowHide = false
                                            setComputingMethodData(val.afcmpreAgFeeContainerPrices)
                                        }
                                    }):null
                                    setAgreementItemUuid(val.id)
                                    if (!val.id || itemFlag == false) {
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
                                setCompareComputingMethodName('lbl.DATE-particulars')
                                val.afcmpreAgFeeDateDetails ? setDateData(val.afcmpreAgFeeDateDetails) : setDateData([])
                                val.afcmpreAgFeeDateDetails.length>0?val.afcmpreAgFeeDateDetails.map((v,i)=>{
                                    if(!v.id){
                                         dateData.splice(i, 1)
                                         setDateData([...dateData])
                                    }else{
                                        v.saveShowHide = false
                                        setDateData(val.afcmpreAgFeeDateDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeCallDetails ? setCallData(val.afcmpreAgFeeCallDetails) : null
                                val.afcmpreAgFeeCallDetails.length>0?val.afcmpreAgFeeCallDetails.map((v,i)=>{
                                    if(!v.id){
                                        callData.splice(i, 1)
                                        setCallData([...callData])
                                    }else{
                                        v.saveShowHide = false
                                        setCallData(val.afcmpreAgFeeCallDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeCallDetails ? setCallData(val.afcmpreAgFeeCallDetails) : null
                                val.afcmpreAgFeeCallDetails.length>0?val.afcmpreAgFeeCallDetails.map((v,i)=>{
                                    if(!v.id){
                                        callData.splice(i, 1)
                                        setCallData([...callData])
                                    }else{
                                        v.saveShowHide = false
                                        setCallData(val.afcmpreAgFeeCallDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeCallDetails ? setCallData(val.afcmpreAgFeeCallDetails) : null
                                val.afcmpreAgFeeCallDetails.length>0?val.afcmpreAgFeeCallDetails.map((v,i)=>{
                                    if(!v.id){
                                        callData.splice(i, 1)
                                        setCallData([...callData])
                                    }else{
                                        v.saveShowHide = false
                                        setCallData(val.afcmpreAgFeeCallDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeCallDetails ? setCallData(val.afcmpreAgFeeCallDetails) : null
                                val.afcmpreAgFeeCallDetails.length>0?val.afcmpreAgFeeCallDetails.map((v,i)=>{
                                    if(!v.id){
                                        callData.splice(i, 1)
                                        setCallData([...callData])
                                    }else{
                                        v.saveShowHide = false
                                        setCallData(val.afcmpreAgFeeCallDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeCallDetails ? setCallData(val.afcmpreAgFeeCallDetails) : null
                                val.afcmpreAgFeeCallDetails.length>0?val.afcmpreAgFeeCallDetails.map((v,i)=>{
                                    if(!v.id){
                                        callData.splice(i, 1)
                                        setCallData([...callData])
                                    }else{
                                        v.saveShowHide = false
                                        setCallData(val.afcmpreAgFeeCallDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
                                    setComputingMethod(false)
                                } else {
                                    setComputingMethod(true)
                                }; break;
                            case 'VSHP':
                                if (modifyFlagSele && val.id == moId) { //modifyFlagSele阶梯费率
                                    if (modifyFlagSele != val.modifyFlag) {
                                        setChecked([])
                                        setVshpShow(false)
                                        setVshpFlag(false)
                                        //保存成功后才能使用
                                        setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.afcm-0075' }) })
                                    } else {
                                        setCompareDateFlag(false)
                                        setCompareCallFlag(false)
                                        setCompareVshpFlag(true)
                                        setCompareVteuFlag(false)
                                        setCompareBlFlag(false)
                                        setCompareAggFlag(false)
                                        setCompareDisFlag(false)
                                        setCompareComputingMethodName('lbl.VSHP-particulars')
                                        if (val.modifyFlag == 'Y') {
                                            val.afcmpreAgFeeVesselTeuDetails ? setVshpData(val.afcmpreAgFeeVesselTeuDetails) : null
                                            val.afcmpreAgFeeVesselTeuDetails.length>0?val.afcmpreAgFeeVesselTeuDetails.map((v,i)=>{
                                                if(!v.id){
                                                    vshpData.splice(i, 1)
                                                    setVshpData([...vshpData])
                                                }else{
                                                    v.saveShowHide = false
                                                    setVshpData(val.afcmpreAgFeeVesselTeuDetails)
                                                }
                                             }):null
                                        } else {
                                            val.afcmpreAgFeeRateDetails ? setVshpDataTow(val.afcmpreAgFeeRateDetails) : null
                                            val.afcmpreAgFeeRateDetails.length>0?val.afcmpreAgFeeRateDetails.map((v,i)=>{
                                                if(!v.id){
                                                    vshpDataTow.splice(i, 1)
                                                    setVshpDataTow([...vshpDataTow])
                                                }else{
                                                    v.saveShowHide = false
                                                    setVshpDataTow(val.afcmpreAgFeeRateDetails)
                                                }
                                             }):null
                                        }
                                        setAgreementItemUuid(val.id)
                                        if (!val.id || itemFlag == false) {
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
                                    if (val.modifyFlag == 'Y') {
                                        val.afcmpreAgFeeVesselTeuDetails ? setVshpData(val.afcmpreAgFeeVesselTeuDetails) : null
                                        val.afcmpreAgFeeVesselTeuDetails.length>0?val.afcmpreAgFeeVesselTeuDetails.map((v,i)=>{
                                            if(!v.id){
                                                vshpData.splice(i, 1)
                                                setVshpData([...vshpData])
                                            }else{
                                                v.saveShowHide = false
                                                setVshpData(val.afcmpreAgFeeVesselTeuDetails)
                                            }
                                         }):null
                                    } else {
                                        val.afcmpreAgFeeRateDetails ? setVshpDataTow(val.afcmpreAgFeeRateDetails) : null
                                        val.afcmpreAgFeeRateDetails.length>0?val.afcmpreAgFeeRateDetails.map((v,i)=>{
                                            if(!v.id){
                                                vshpDataTow.splice(i, 1)
                                                setVshpDataTow([...vshpDataTow])
                                            }else{
                                                v.saveShowHide = false
                                                setVshpDataTow(val.afcmpreAgFeeRateDetails)
                                            }
                                         }):null
                                    }
                                    setAgreementItemUuid(val.id)
                                    if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeVesselTeuDetails ? setVteuData(val.afcmpreAgFeeVesselTeuDetails) : null
                                val.afcmpreAgFeeVesselTeuDetails.length>0?val.afcmpreAgFeeVesselTeuDetails.map((v,i)=>{
                                    if(!v.id){
                                        vteuData.splice(i, 1)
                                        setVteuData([...vteuData])
                                    }else{
                                        v.saveShowHide = false
                                        setVteuData(val.afcmpreAgFeeVesselTeuDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                val.afcmpreAgFeeRateDetails ? setBlData(val.afcmpreAgFeeRateDetails) : null
                                val.afcmpreAgFeeRateDetails.length>0?val.afcmpreAgFeeRateDetails.map((v,i)=>{
                                    if(!v.id){
                                        blData.splice(i, 1)
                                        setBlData([...blData])
                                    }else{
                                        v.saveShowHide = false
                                        setBlData(val.afcmpreAgFeeRateDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
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
                                if (val.afcmpreAgFeeNaGroupDetails) {
                                    val.afcmpreAgFeeNaGroupDetails.map((v, i) => {
                                        v.saveShowHide = false
                                    })
                                    setAggData([...val.afcmpreAgFeeNaGroupDetails])
                                }
                                val.afcmpreAgFeeNaGroupDetails.length>0?val.afcmpreAgFeeNaGroupDetails.map((v,i)=>{
                                    if(!v.id){
                                        aggData.splice(i, 1)
                                        setAggData([...aggData])
                                    }else{
                                        v.saveShowHide = false
                                        setAggData(val.afcmpreAgFeeNaGroupDetails)
                                    }
                                 }):null
                                setAgreementItemUuid(val.id)
                                if (!val.id || itemFlag == false) {
                                    setAggShow(false)
                                } else {
                                    setAggShow(true)
                                }; break;
                        }
                    }else{
                        setCompareDateFlag(false)
                        setCompareCallFlag(false)
                        setCompareVshpFlag(false)
                        setCompareVteuFlag(false)
                        setCompareBlFlag(false)
                        setCompareAggFlag(false)
                        setCompareDisFlag(false)
                        
                    }
                    // ========================================================================================================  
            }
        }else{
            setChecked([])
            emptyCalculationMethod()
            setInfoTips({alertStatus:'alert-error',message:formatMessage({id:'lbl.afcm-0054'})})
        }
    }
    const emptyCalculationMethod = () =>{
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
    // 特殊费率
    const rateaddItem = () => {
        setInfoTips({})
        let length = rateData ? rateData.length : 0
        if (length == 0) {
            setRateData([])
            let data = {
                'startTeu': '0.0',
                'endTeu': '0.0',
                'feePrice': '',
                'feeCurrencyCode': '',
                'percentage': '',
                'saveShowHide': true
            }
            rateData.push(data)
            setRateData([...rateData])
        } else {
            let itemid = rateData[length - 1].id
            if (itemid) {
                let data = {
                    'startTeu': '0.0',
                    'endTeu': '0.0',
                    'feePrice': '',
                    'feeCurrencyCode': '',
                    'percentage': '',
                    'saveShowHide': true
                }
                rateData.push(data)
                setRateData([...rateData])
            } else {
                setInfoTips({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) })
            }
        }
    }
      // 特殊费率删除
    const rateTableDelete = (record, index, name) => {
        setInfoTips({})
        const confirmModal = confirm({
            title: intl.formatMessage({ id: 'lbl.delete' }),
            content: intl.formatMessage({ id: 'lbl.Confirm-deletion' }),
            okText: intl.formatMessage({ id: 'lbl.affirm' }),
            okType: 'danger',
            closable: true,
            cancelText: '',
            async onOk() {
                setSpinflag(true)
                confirmModal.destroy()
                if (record.id) {
                    let deletes = await request($apiUrl.PRECALC_AGENCY_DELETE_METHOD_UUID, {
                        method: "POST",
                        data: {
                            'params':{
                                'calculationMethod':recordVal.calculationMethod,
                                'methodUuid':record.id,
                                preId: record.preId,
                                tsIndicator: 'Y',
                             },
                             operateType: 'DEL'
                        }
                    })
                    if (deletes.success) {
                        setSpinflag(false)
                        setInfoTips({ alertStatus: 'alert-success', message: deletes.message })
                        rateData.splice(index, 1);
                        setRateData([...rateData]);
                    } else {
                        setSpinflag(false)
                        setInfoTips({ alertStatus: 'alert-error', message: deletes.errorMessage })
                    }
                } else {
                    setSpinflag(false)
                    setInfoTips({ alertStatus: 'alert-success', message: formatMessage({ id: 'lbl.successfully-delete' }) })
                }
            }
        })
    }
    //特殊费率保存
    const rateSave = async (index, record) => {
        setSpinflag(true)
        let result = await request($apiUrl.PRECALC_AGENCY_SAVE_METHOD, {
            method: "POST",
            data: {
                params: {
                    'afcmpreAgFeeDetailPans':[{
                        'agreementHeadUuid':agreementHeadUuid,
                        'agreementItemUuid':record.agreementItemUuid,
                        'feeAgreementCode':feeAgreementCode,
                        'agreementPanDetailUuid':record.agreementPanDetailUuid,
                        'startTeu':record.startTeu,
                        'endTeu':record.endTeu,
                        'feeCurrencyCode':record.feeCurrencyCode,
                        'feePrice':record.feePrice,
                        'percentage': record.percentage,
                        id: record.id,
                    }],
                    'agreementHeadUuid':agreementHeadUuid,
                    id: recordVal.id,
                    preId: recordVal.preId,
                    calculationMethod: recordVal.calculationMethod,
                    feeAgreementCode: feeAgreementCode,
                    agreementItemUuid: recordVal.agreementItemUuid,
                }
            }
        })
        if (result.success) {
            setSpinflag(false)
            let data = result.data.afcmpreAgFeeDetailPans[0].id
            rateData[index].id = data
            rateData[index].saveShowHide = false
            // rateData.splice(index, 1, data);
            // rateData[index].saveShowHide = false
            // setRateData([...rateData])
            setInfoTips({ alertStatus: 'alert-success', message: result.message })
        } else {
            setSpinflag(false)
            setInfoTips({ alertStatus: 'alert-error', message: result.errorMessage })
        }
    }
    return (
        // <Modal title={<FormattedMessage id='lbl.add'/>} maskClosable={false}  visible={AIsModalVisible} onOk={handleCancel} onCancel={handleCancel} width='100%' height='100%' >
        <CosModal cbsVisible={AIsModalVisible} cbsTitle={<FormattedMessage id='lbl.add'/>} cbsFun={() => handleCancel()}>
        <CosToast toast={infoTips}/> 
            <div className='add'>
                <div className='topBox'>
                         <Form 
                            form={queryForm}
                            name='func'
                            onFinish={handleQuery}
                        >
                            <Row>
                                {/* 船东 */}
                                <SelectVal span={6} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier'/>} disabled={detailsFlag}  options={acquireData.values}/>
                                {/* 公司 */}
                                <Selects name='companyCode' label={<FormattedMessage id='lbl.company'/>} disabled={detailsFlag}  span={6} options={companysData} selectChange={companyIncident}/>
                                {/* 代理编码 */}
                                <InputText name='agencyCode' label={<FormattedMessage id='lbl.agency'/>}  disabled span={6} capitalized={false}/>  
                                {/* 代理描述 */}
                                <InputText name='agencyDescription' label={<FormattedMessage id='lbl.agent-described'/>} disabled span={6} capitalized={false}/>  
                                {/* 协议代码 */}
                                <InputText name='feeAgreementCode' label={<FormattedMessage id='lbl.agreement'/>} disabled  span={6} capitalized={false}/>
                                {/* 有效日期 */}
                                <DoubleDatePicker name='Date' label={<FormattedMessage id='lbl.valid-date'/>} disabled={detailsFlag} />
                                {/* 是否生产性 */}
                                <SelectVal name='prdIndicator' label={<FormattedMessage id='lbl.productbility'/>} disabled={detailsFlag} options={production.values} span={6}/>  
                                {/* 记账算法 */}
                                <SelectVal name='postCalculationFlag' label={<FormattedMessage id='lbl.arithmetic'/>} disabled={detailsFlag} options={arithmetic.values} span={6}/>  
                                {/* 记账方式 */}
                                <SelectVal name='postMode' label={<FormattedMessage id='lbl.bookkeeping'/>} disabled={detailsFlag} options={way.values} span={6}/>  
                                {/* 向谁预估 */}
                                <InputText name='ygSide' label={<FormattedMessage id='lbl.estimate'/>} disabled={detailsFlag} span={6} capitalized={false}/>  
                                {/* 向谁开票 */}
                                <InputText name='yfSide' label={<FormattedMessage id='lbl.make'/>} disabled={detailsFlag} span={6} capitalized={false}/>  
                                {/* 向谁报账 */}
                                <InputText name='sfSide' label={<FormattedMessage id='lbl.submitanexpenseaccount'/>} disabled={detailsFlag} span={6} capitalized={false}/>  
                                {/* 预提是否记账 */}
                                <SelectVal name='isYt' label={<FormattedMessage id='lbl.withholding'/>} options={tally.values} disabled={detailsFlag} span={6}/>  
                                {/* 应付实付是否记账 */}
                                <SelectVal name='isBill' label={<FormattedMessage id='lbl.actually'/>} options={whether.values} disabled={detailsFlag} span={6} />
                            </Row>
                         </Form>  
                </div> 
                <div className='add-main-button'>
                    {
                        btnData.map((val, idx) => {
                        // return <Button style={{display:btnsFlag[idx]}} disabled={btnsFlag[idx]} onClick={() => { allBtn(idx) }} key={idx}>{val.icon}{val.label}</Button>
                        return <Button style={{display:btnsFlag[idx]}} disabled={detailsFlag} onClick={() => { allBtn(idx) }} key={idx}>{val.icon}{val.label}</Button>
						})
                    }
                    </div> 
                <div className='groupBox'>
                     <Tabs onChange={callback} type="card" activeKey={defaultKey}>
                        {/* 协议item */}
						<TabPane tab={<FormattedMessage id='lbl.agreement-item' />} key="1">
                            {/*新增item按钮*/}
							{/* <Button  disabled={itemFlag?false:true} style={{ margin: '0 0 5px 10px' }} onClick={addItem}><PlusOutlined /></Button> */}
                            <Button  disabled={detailsFlag} style={{ margin: '0 0 5px 10px' }} onClick={addItem}><PlusOutlined /></Button>
                            {/* item表格 */}
                            <div className="table">
                                <PaginationTable
									dataSource={dataSource}
									columns={addColumns}
									rowKey='id'
									setSelectedRows={setSelectedRows}
                                    // rowSelection={{selectedRowKeys: [agreementItemUuid]}}
                                    rowSelection={{
                                        selectedRowKeys: checked,
                                        onChange:(key, row)=>{
                                            setChecked(key);
                                            setSelectedRows(row,key);
                                        }
                                    }}
									pagination={false}
									selectionType='radio'
									scrollHeightMinus={200}
								/>
							</div>
                            {/* 箱量法(CNT/CNT2)计算方法明细 */}
							{disFlag ? <div hidden={showFlag} style={{width:'70%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                    </div>
								{/* disabled={btnFlag} */}
                                {/* <Button disabled={operandSaveFlag?true:false} style={{ margin: '0 0 10px 10px' }}  onClick={addItemDetailed}><PlusOutlined /></Button> */}
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }}  onClick={addItemDetailed}><PlusOutlined /></Button>
                                <PaginationTable
									dataSource={computingMethodData}
									columns={computingMethodColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 时间(DATE)计算方法明细 */}
                            {dateFlag ? <div hidden={showFlag} style={{width:'40%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
								{/*  */}
                                {/* <Button disabled={dateShow?true:false} style={{ margin: '0 0 10px 10px' }} onClick={dateaddItem}><PlusOutlined /></Button> */}
                                <Button  disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={dateaddItem}><PlusOutlined /></Button>
                                <PaginationTable
									dataSource={dateData}
									columns={DATEColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* CALL/CALL2/MCALL/VOY/VOY2 计算方法明细 */}
                            {callFlag ? <div hidden={showFlag} style={{width:'40%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
								{/* disabled={btnFlag}*/}
                                {/* <Button  disabled={computingMethod?true:false}  style={{ margin: '0 0 10px 10px' }} onClick={calladdItem}><PlusOutlined /></Button> */}
                                <Button  disabled={detailsFlag}  style={{ margin: '0 0 10px 10px' }} onClick={calladdItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={callData}
									columns={CALLColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 船舶吨位法(VSHP)计算方法明细 */}
                            {vshpFlag ? <div hidden={showFlag} style={{width:'50%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
								{/*  */}
                                {/* <Button disabled={vshpShow?true:false} style={{ margin: '0 0 10px 10px' }} onClick={vshpaddItem}><PlusOutlined /></Button> */}
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={vshpaddItem}><PlusOutlined /></Button>
								<PaginationTable
                                    dataSource={(recordVal.modifyFlag == 'Y' && recordVal.calculationMethod == 'VSHP') ? vshpData : vshpDataTow}  //修改1.10
									// dataSource={vshpData}
									columns={VSHPColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* VTEU计算方法明细 */}
                            {vteuFlag ? <div hidden={showFlag} style={{width:'50%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
								{/* disabled={btnFlag}  */}
                                {/* <Button disabled={vteuShow?true:false} style={{ margin: '0 0 10px 10px' }} onClick={vteuaddItem}><PlusOutlined /></Button> */}
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={vteuaddItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={vteuData}
									columns={VTEUColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 提单法(BL)计算方法明细 */}
                            {blFlag ? <div hidden={showFlag} style={{width:'30%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
								{/* disabled={btnFlag} */}
                                {/* <Button disabled={blShow?true:false} style={{ margin: '0 0 10px 10px' }} onClick={bladdItem}><PlusOutlined /></Button> */}
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={bladdItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={blData}
									columns={BLColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 北美箱量累进(AGG)计算方法明细 */}
                            {aggFlag ? <div hidden={showFlag} style={{width:'70%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={computingMethodName} />
                                </div>
								{/* disabled={btnFlag} */}
                                {/* <Button disabled={aggShow?true:false}  style={{ margin: '0 0 10px 10px' }} onClick={aggaddItem}><PlusOutlined /></Button> */}
                                <Button disabled={detailsFlag}  style={{ margin: '0 0 10px 10px' }} onClick={aggaddItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={aggData}
									columns={AGGColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* -------------------------------择大计算方法----------------------------------- */}
                            {/* 箱量法(CNT/CNT2)计算方法明细 */}
							{compareDisFlag ? <div style={{width:'70%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                    </div>
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }}  onClick={addItemDetailed}><PlusOutlined /></Button>
                                <PaginationTable
									dataSource={computingMethodData}
									columns={computingMethodColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 时间(DATE)计算方法明细 */}
                            {compareDateFlag ? <div style={{width:'40%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
								{/*  */}
                                <Button  disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={dateaddItem}><PlusOutlined /></Button>
                                <PaginationTable
									dataSource={dateData}
									columns={DATEColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* CALL/CALL2/MCALL/VOY/VOY2 计算方法明细 */}
                            {compareCallFlag ? <div style={{width:'40%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                <Button  disabled={detailsFlag}  style={{ margin: '0 0 10px 10px' }} onClick={calladdItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={callData}
									columns={CALLColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 船舶吨位法(VSHP)计算方法明细 */}
                            {compareVshpFlag ? <div style={{width:'50%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
								{/*  */}
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={vshpaddItem}><PlusOutlined /></Button>
								<PaginationTable
                                    dataSource={(recordVal.modifyFlag == 'Y' && recordVal.calculationMethod == 'VSHP') ? vshpData : vshpDataTow}  //修改1.10
									// dataSource={vshpData}
									columns={VSHPColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* VTEU计算方法明细 */}
                            {compareVteuFlag ? <div style={{width:'50%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={vteuaddItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={vteuData}
									columns={VTEUColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 提单法(BL)计算方法明细 */}
                            {compareBlFlag ? <div style={{width:'30%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={bladdItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={blData}
									columns={BLColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
                            {/* 北美箱量累进(AGG)计算方法明细 */}
                            {compareAggFlag ? <div hidden={showFlag} style={{width:'70%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}>
                                    <FormattedMessage id={compareComputingMethodName} />
                                </div>
                                <Button disabled={detailsFlag}  style={{ margin: '0 0 10px 10px' }} onClick={aggaddItem}><PlusOutlined /></Button>
								<PaginationTable
									dataSource={aggData}
									columns={AGGColumns}
									pagination={false}
									rowKey="id"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}

                            {/* ------------------------------------------------------------------ */}
                            {/* 特殊费率 */}
                            {
                                rateFlag ? <div style={{width:'70%'}}>
                                    <div style={{ padding: '10px 0px 10px 10px' }}><FormattedMessage id='lbl.afcm-0079' /></div>
                                    <Button disabled={detailsFlag} style={{ margin: '0 0 10px 10px' }} onClick={rateaddItem}><PlusOutlined /></Button>
                                    <PaginationTable
                                        dataSource={rateData}
                                        columns={rateColumns}
                                        pagination={false}
                                        rowKey="commissionContainerPriceUuid"
                                        rowSelection={null}
                                        scrollHeightMinus={200}
                                    />
                                </div> : null
                            }
                        </TabPane>
						{/* 箱型尺寸组明细 */}
                        <TabPane tab={<FormattedMessage id='lbl.box-size-group-details' />} key="2">
							<div style={{ width: '40%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
								<div><FormattedMessage id='lbl.box-size-information' />  </div><br />
								 <ul className="list" ref={boxSizeref}>
									<li style={{ height: 20 }}>
                                        {/* 操作 */}
										<div><FormattedMessage id='lbl.operate' /> </div>
                                        {/* 详情 */}
										<div><FormattedMessage id='lbl.particulars' /> </div>
                                        {/* 详情尺寸组 */}
										<div>
                                            <FormattedMessage id='lbl.Details-Dimensions-Section' /> 
										</div>
									</li>
									{commissionAgmtCntrSizeTypeGroups.map((item, index) => {
										return <li key={index}>
											<div>
                                                {/* disabled={btnFlag} disabled={btnFlag}  */}
                                                {/* 编辑左侧详情尺寸组 */}
												<a  disabled={flag?true:false} onClick={() => editAddSuccessBoxSize(item)}><EditOutlined /></a>
                                                {/* 删除左侧箱型尺寸组 */}
												<a disabled={flag?true:false} onClick={() => deleteAddSuccessBoxSize(item)}><CloseCircleOutlined style={{ color: flag ? '#ccc' : 'red' }} /></a>
											</div>
                                            
											 <div><RightCircleOutlined className={openBoxSizedetailIndex == index ? "is-open-boxsize" : ""}  onClick={() => openBoxSizedetail(index)} /></div>
											<div><RightCircleOutlined style={{ visibility: 'hidden' }} />{item && item.containerSizeTypeGroup || <small>&nbsp;</small>}</div>
											 <ul style={{ display: openBoxSizedetailIndex === index ? 'block' : 'none' }}>
											    <li style={{ height: 20 }}>
													<span></span>
                                                    {/* 箱型尺寸组名字 */}
													{/* <div style={{ background: '#95B3D7' }}> <FormattedMessage id='lbl.Box-size-name' /> </div> */}
                                                    {/* 箱型尺寸组 */}
													<div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.Box-size' /> </div>
                                                    {/* 货类 */}
                                                    <div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.cargo-class' /></div>
												</li>
                                               	
												 {item && item.afcmpreAgContainerSizeTypeGroups.map((val, idx) => {
													return <li key={idx}>
														<span></span>
														{/* <div>{val.containerSizeTypeGroup}</div> */}
														<div>{val.containerSizeType}</div>
                                                        <div>{val.cargoNatureCode}</div>
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
                                            {/* 箱型尺寸组 */}
											<InputText disabled={flag?true:false} span={10}   isSpan={true} maxLength={5} name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Box-size-group' />} />
                                            <SelectVal disabled={flag?true:false} span={10} isSpan={true} name='cargoNatureCode' label={<FormattedMessage id='lbl.cargo-class' />} options={natureCode.values}/>
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
												<Button disabled={flag?true:false} onClick={rightBtn}><RightOutlined /></Button>
                                                {/* 添加全部箱型尺寸 */}
												<Button disabled={flag?true:false} onClick={addAllBoxDetail}><DoubleRightOutlined /></Button>
                                                {/* 删除指定箱型尺寸 */}
												<Button disabled={flag?true:false} onClick={deleteBoxSize}><LeftOutlined /></Button>
                                                {/* 删除全部箱型尺寸 */}
												<Button disabled={flag?true:false} onClick={deleteAllBoxDetail}><DoubleLeftOutlined /></Button>
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
													setSelectedRows={getSelectedRows}
													pagination={false}
													scroll={{ y: 230 }}
                                                    // selectedRowKeys = {selectedRowKeys}
                                                    rowSelection={{
                                                        selectedRowKeys:checked,
                                                        onChange:(key, row)=>{
                                                            setChecked(key);
                                                            setCheckedRow(row);
                                                        }
                                                    }}
												/>
											</div>
										</Row>
										<Row style={{ margin: '15px 0', float: 'right', marginRight: '10px' }}>
                                            {/* 保存全部箱型尺寸 */}
											<Col style={{ marginRight: '15px' }}><Button disabled={flag?true:false}  onClick={()=>{saveBoxSize('UPD')}}><FormattedMessage id='lbl.preservation-box-size' /></Button></Col>
                                            {/* 重置箱型尺寸 */}
											<Col><Button  disabled={flag?true:false} onClick={resetBoxSize}><FormattedMessage id='lbl.reset-box-size' /></Button></Col>
										</Row>
									 </Form> 
								</div>
							</div>
						</TabPane>
						{/* 航线组明细 */}
						<TabPane tab={<FormattedMessage id='lbl.airline-group-details' />} key="3">
                            <div style={{width:'50%'}}>
                                <Button disabled={airlineFlag?false:true}  style={{ margin: '0 0 10px 10px' }} onClick={groupaddItem}><PlusOutlined /></Button>
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
export default AgEdit

