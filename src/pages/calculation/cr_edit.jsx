// 查看详情、编辑、新增
import React, { useEffect, useState, $apiUrl } from 'react';
import { Modal, Button, Input, Form, Row, Col, Transfer, Tabs, Select, Tooltip, InputNumber } from 'antd';
import { FormattedMessage, formatMessage,useIntl } from 'umi';
import request from '@/utils/request';
import {CosButton,CosInputText,CosIptNumber,CosSelect,CosDoubleDatePicker,CosPaginationTable,CosToast} from '@/components/Common/index'
import { momentFormat, acquireSelectData } from '@/utils/commonDataInterface';
import moment from 'moment';
import { Toast } from '@/utils/Toast'
import Loading from '@/components/Common/Loading';
import CosModal from '@/components/Common/CosModal'
import {
	EditOutlined,
	RightCircleOutlined,
	PlusOutlined,//新增item
	CloseCircleOutlined,//删除
	FormOutlined,//编辑
	FileDoneOutlined,//保存
	RightOutlined,//右箭头
	DoubleRightOutlined,
	LeftOutlined,//左箭头
	DoubleLeftOutlined,
	SaveOutlined,//保存
	FileProtectOutlined,//保存并提交审核
	ImportOutlined,//协议退回
	UnlockOutlined,//解锁
} from '@ant-design/icons'

const confirm = Modal.confirm
// tab切换
const { TabPane } = Tabs;

const crAgmtEdit = (props) => {
	const intl = useIntl();
	// 父组件拿到的数据
	const {
		acquireData,         // 船东
		companysData,        // 协议状态
		agreement,           // 协议类型
		commission,          // 收取Cross Booking佣金
		pattern,             // Cross Booking模式
		paidCommissionModel, // setPaidCommissionModel第三地付费佣金模式
		accountsArithmetic,  // 记账算法
		accountsWay,         // 记账方式
		ytBusiness,          // 预提是否记账  
		yfBusiness,          // 应付实付是否记账  

		officeType,          // office类型
		toPayInAdvance,      // 预到付
		commissionBasedModel,// 佣金模式
		calcMthd,            // 佣金计算方法
		socEmptyInd,         // SOC空箱标记
		vatFlag,             // 是否含税价 
		currCode,            // 币种  

		isModalVisible,      // 弹出框显示隐藏
		setIsModalVisible,   // 关闭弹窗
		tableData,           // 编辑详细数据
		commonFlag,          // 控制读写
		dateEnd = null,      // 结束时间
		addFlag = true,      // 判断新增或者编辑查看详情
		setAddFlag,          // 是否禁用新增item
		setTableData,		// 编辑查看详情数据
		writeRead,			// 区别新增编辑查看详情
		setWriteRead,		// 区别新增编辑查看详情
		flag,				// 弹窗顶部button控制    
		setHeaderUuid,		// 头uuid
		headerUuid,			// 头uuid
		title,				// 弹窗标题
		cssNone = true,		// button控制
		btnIdx,				// button状态
		stateFlags,			// 根据状态设置
		setUploadEdit=false,  // 调用重新编辑
	} = props.initData;
	const [natureCode, setNatureCode] = useState({});  // 货类
	const [calculationType, setCalculationType] = useState({}); // 计算类型
	const [commissionAgmtCntrSizeTypeGroups, setCommissionAgmtCntrSizeTypeGroups] = useState([])
	const [btnsFlag, setBtnsFlag] = useState([]);
	const [boxData, setBoxData] = useState([])	// 维护NA组信息
	const [defaultKey, setDefaultKey] = useState('1');
	const [radioData, setRadioData] = useState({});		// 单选数据
	const [dataSource, setDataSource] = useState([]);
	const [toast,setToast] = useState({})
	const [checked, setChecked] = useState([]); //勾选项
    const [checkedRow, setCheckedRow] = useState([]);  //选择行
	const [showFlag, setShowFlag] = useState(true);   //箱量计算方法明细显示
	const [spinflag, setSpinflag] = useState(false);     // 加载
	//	--------------------------------------------------------------------------------------
    // this.setState({ mockData, targetKeys });

	useEffect(() => {
		isModalVisible && !writeRead ? getCommType() : undefined;
		acquireSelectData('AFCM.AGMT.CARGO.NATURE.CODE', setNatureCode, $apiUrl);// 货类
		acquireSelectData('CB0046', setCalculationType, $apiUrl);// 计算类型
		addFlag ? setBtnFlag(true) : setBtnFlag(false);   // 是否禁用新增item
		let data = tableData.afcmpreCommissionAgmtItems;
		setDataSource(data);
		setCommissionAgreementCodeTxt(tableData.commissionAgreementCode);     // 协议代码
		tableData.afcmpreCommissionAgmtCntrSizeTypeGroups?setCommissionAgmtCntrSizeTypeGroups(tableData.afcmpreCommissionAgmtCntrSizeTypeGroups):[]
		setUuid(tableData.agreementHeadUuid);
		// setDisFlag(false);
		tableData.afcmpreCommissionAgmtNAGroups ? setBoxData(tableData.afcmpreCommissionAgmtNAGroups) : setBoxData([]);
			
		writeRead ? queryForm.setFieldsValue({
			toDate: moment(dateEnd),
			fromDate: '',
			crossBookingPercent: '0.0000',
			payElsewherePercent: '0.0000',
			allInRate: '0.0000',
			agreementType: 'N',
			isBill: '0',
			isYt: '0',
			postMode: '0',
			payElsewhereMode: 'Cargo',
			crossBookingIndicator: 'Y',
			postCalculationFlag: '0'
		}) :
		queryForm.setFieldsValue({
			...tableData,
			Date: [moment(tableData.fromDate) ,moment(tableData.toDate)],
		})
		getData();
		// stateFlag();
		getNaData(headerUuid);
		setNaMockData();
		// tableData.agreementHeadUuid ? addItemFlag() : '';
	}, [dateEnd, tableData, addFlag, btnData, flag, headerUuid, commonFlag, btnIdx, isModalVisible])
	const [saveFlag, setSaveFlag] = useState(true); // 保存编辑table数据
	const [btnFlag, setBtnFlag] = useState(true); // 是否禁用新增item
	const [commissionAgreementCodeTxt, setCommissionAgreementCodeTxt] = useState(''); // 协议代码
	const [uuid, setUuid] = useState(); // uuid
	const [groupInit, setGroupInit] = useState([]);
	const [targetKeys, settargetKeys] = useState([]);
	const [mockData, setmockData] = useState([]);
	const [groupFlag, setGroupFlag] = useState(false);	// 仅供编辑group信息箱型尺寸组编辑修改尺寸组用
	const filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;

	// 贸易线数据
	const setNaMockData = () => {
		boxData.map((val,idx) => {
			mockData.map((v, i) => {
				if(mockData[i].title == boxData[idx].tradeLane){
					mockData.splice(i,1)
				}
			})
		})
		// console.log(mockData)
		setmockData([...mockData])
	}

	const callback = (key) => {
		Toast('', '', '', 5000, false);
		// console.log(key);
		setDefaultKey(key);
		setItemUuidFlag("")
		setShowFlag(true)
	}

	// 维护NA组信息
	const getNaData = async (id) => {
		await request.post($apiUrl.COMM_AGMT_NEW_TYPE_NA_GROUP_INIT, {
			method: 'POST',
			data: {
				uuid: id
			}
		})
		.then((result) => {
			if(result.success) {
				let data = result.data;
				
				// console.log(boxData);
				data.map((v, i) => {
					v['title'] = v.tradeLaneCode;
					v['description'] = v.tradeCode;
					v['key'] = i;
				})

				// boxData.map((val,idx) => {
				// 	data.map((v, i) => {
				// 		if(data[i].title == boxData[idx].tradeLane){
				// 			data.splice(i,1)
				// 		}
				// 	})
				// })
				// console.log(data)
				// setmockData([...mockData])
				setmockData([...data]);
				// console.log('维护NA组', data)
			} else {
				Toast('', '', '', 5000, false);
			}
		})
	}

	const handleChange = targetKeys => {
		// this.setState({ targetKeys });
		settargetKeys([...targetKeys])
	};

	const handleSearch = (dir, value) => {
		value = value.toUpperCase();
		// console.log('search:', dir, value.toUpperCase());
	};

	const [naData, setNaData] = useState([]);
	const saveNaData = () => {
		let dataIpt = queryForm.getFieldValue();
		let data = [];
		mockData.map((val, idx) => {
			targetKeys.map((v, i) => {
				// (val.key == v);
				if(val.key == v) {
					naData.push({
						"agreementHeadUuid": tableData.agreementHeadUuid,
					  	"commissionAgreementCode": tableData.commissionAgreementCode,
					  	"groupCode": dataIpt.groupCodeData,
						"tradeLane": val.tradeLaneCode,
						"preId": tableData.preId
					});
				}
			})
		})
		setNaData([...naData]);
	}

	const saveMockData = async() => {
		Toast('', '', '', 5000, false);
		let data = queryForm.getFieldValue().groupCodeData;
		setSpinflag(true)
		if (data ? data.length > 10 : false) {
			setSpinflag(false)
			setToast({ alertStatus: 'alert-error', message: intl.formatMessage({ id: 'lbl.comm-input' }) })
			return
		}
		if(data) {
			saveNaData();
			setSpinflag(true)
			// let result = await request($apiUrl.COMM_AGMT_SAVE_NA_GROUP, {
				let result = await request($apiUrl.CALC_COMM_AGMT_SAVE_NA_GROUP, {
				method: 'POST',
				data: {
					"operateType": 'SAVE',
					"paramsList": naData
				}
			})
			if(result.success) {
				setSpinflag(false)
				getNaData(headerUuid);
				let data = result.data;
				setBoxData([...data]);
				settargetKeys([]);
				setNaData([]);
				queryForm.setFieldsValue({
					groupCodeData: ''
				})
				setToast({alertStatus:'alert-success',message:result.message})
				// Toast('',formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false);
			}else{
				setSpinflag(false)
				setNaData([]);
				setToast({alertStatus:'alert-error',message:result.errorMessage})
			}
		}else {
			setSpinflag(false)
			setToast({alertStatus:'alert-error',message: intl.formatMessage({id: 'lbl.Group-is-required'})})
			// Toast('',intl.formatMessage({id: 'lbl.Group-is-required'}), 'alert-error', 5000, false);
		}
		
	}

	// 状态
	const authState = [tableData.authSave, tableData.authSubmit, tableData.authPMDUnlock, tableData.authPMDCheck, 
		tableData.authKACheck, tableData.authAgencyUnlock, tableData.authWDCheck, tableData.authWDUnlock, 
		tableData.authShareCenterUnlock, tableData.authShareCenterCheck, tableData.authFADUnlock, tableData.authFADCheck, tableData.authCancel]

	// 新增箱型尺寸组始化
	const getData = async () => {
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

	// 公司与代理编码联动
	const selectChangeBtn = (value, all) => {
		queryForm.setFieldsValue({
			agencyCode: all.linkage.sapCustomerCode
		})
	}
	// 获取佣金类型下拉数据
	const getCommType = async () => {
		let newitem = await request($apiUrl.COMM_AGMT_NEW_ITEM_INIT, {
			method: "POST",
			data: {
				uuid: tableData.agreementHeadUuid
			}
		})
		if (newitem.success) {
			let data = newitem.data;
			if (data) {
				let commission = data.chargeCodeData.values || [];
				commission.map((val, idx) => {
					val.value = val.value;
					val.label = val.value + `(${val.label})`;
				})
				setCommissionType(commission);
			}
			return
		}
	}

	// button集合
	{/* 保存, 提交审核, PMD审核, PMD解锁, 口岸审核, 口岸解锁, 网点审核, 网点解锁, 共享审核, 共享解锁, FAD审核, FAD解锁, 协议退回 */ }
	const btnData = [
		{
			icon:<SaveOutlined />,//保存
			label:<FormattedMessage id='lbl.save' />,

		},
		// {
		// 	icon:<FileProtectOutlined />,//提交审核
		// 	label:<FormattedMessage id='lbl.submit-audit' />,
		// },
		// {
		// 	icon:<FileProtectOutlined />,//PMD审核
		// 	label:<FormattedMessage id='lbl.pmd-audit' />,
		// },
		// {
		// 	icon:<UnlockOutlined />,//PMD解锁
		// 	label:<FormattedMessage id='lbl.pmd-unlock' />,
		// },
		// {
		// 	icon:<FileProtectOutlined />,//口岸审核
		// 	label:<FormattedMessage id='lbl.port-audit' />,
		// },
		// {
		// 	icon:<UnlockOutlined />,//口岸解锁
		// 	label:<FormattedMessage id='lbl.port-unlock' />,
		// },
		// {
		// 	icon:<FileProtectOutlined />,//网点审核
		// 	label:<FormattedMessage id='lbl.branch-audit' />,
		// },
		// {
		// 	icon:<FileProtectOutlined />,//网点解锁
		// 	label:<FormattedMessage id='lbl.branch-unlock' />,
		// },
		// {
		// 	icon:<UnlockOutlined />,//共享审核
		// 	label:<FormattedMessage id='lbl.share-audit' />,
		// },
		// {
		// 	icon:<FileProtectOutlined />,//共享解锁
		// 	label:<FormattedMessage id='lbl.share-unlock' />,
		// },
		// {
		// 	icon:<FileProtectOutlined />,//FAD审核
		// 	label:<FormattedMessage id='lbl.fad-audit' />,
		// },
		// {
		// 	icon:<UnlockOutlined />,//FAD解锁
		// 	label:<FormattedMessage id='lbl.fad-unlock' />,
		// },
		// {
		// 	icon:<ImportOutlined />,//协议退回
		// 	label:<FormattedMessage id='lbl.agreement-send-back' />
		// }
	];

	// 佣金类型
	const [commissionType, setCommissionType] = useState([]);
	const [queryForm] = Form.useForm();

	// const [dateEnd, setDateEnd] = useState('');
	{/* 保存, 提交审核, PMD审核, PMD解锁, 口岸审核, 口岸解锁, 网点审核, 网点解锁, 共享审核, 共享解锁, FAD审核, FAD解锁, 协议退回 */ }
	// 通过下标判断button
	const allBtn = (idx) => {
		let data = queryForm.getFieldValue();
		Toast('', '', '', 5000, false);
		switch (true) {
			case idx == 0:	// 保存
				handleQuery(data, 'SAVE', 'PRECALC_AGMT_PRE_SAVE_SUBMIT');
				break;
			// case idx == 1:	// 提交审核
			// 	handleQuery(data, 'SUBMIT', 'PRECALC_AGMT_PRE_SAVE_SUBMIT');	
			// 	break;	
			// case idx == 2:	// PMD审核
			// 	commonBtns(data, 'PMD_APPROVE', 'COMM_AGMT_APPROVE');
			// 	break;
			// case idx == 3:	// PMD解锁
			// 	commonBtns(data, 'PMD_UNLOCK', 'COMM_AGMT_UNLOCK');
			// 	break;
			// case idx == 4:	// 口岸审核
			// 	commonBtns(data, 'KA_APPROVE', 'COMM_AGMT_APPROVE');
			// 	break;
			// case idx == 5:	// 口岸解锁
			// 	commonBtns(data, 'KA_UNLOCK', 'COMM_AGMT_UNLOCK');
			// 	break;
			// case idx == 6:	// 网点审核
			// 	commonBtns(data, 'WD_APPROVE', 'COMM_AGMT_APPROVE');
			// 	break;
			// case idx == 7:	// 网点解锁
			// 	commonBtns(data, 'WD_UNLOCK', 'COMM_AGMT_UNLOCK');
			// 	break;
			// case idx == 8:	// 共享审核
			// 	commonBtns(data, 'FAD_APPROVE', 'COMM_AGMT_APPROVE');
			// 	break;
			// case idx == 9:	// 共享解锁
			// 	commonBtns(data, 'FAD_UNLOCK', 'COMM_AGMT_UNLOCK');
			// 	break;
			// case idx == 10:	// FAD审核
			// 	commonBtns(data, 'FAD_APPROVE', 'COMM_AGMT_APPROVE');
			// 	break;
			// case idx == 11:	// FAD解锁
			// 	commonBtns(data, 'FAD_UNLOCK', 'COMM_AGMT_UNLOCK');
			// 	break;
			// case idx == 12:	// 协议退回
			// 	commonBtns(data, 'CANCEL', 'COMM_AGMT_CANCEL');
			// 	break;
		}
	}
	// 审核btn 解锁btn 协议退回
	const commonBtns = async (val, key, url, ) => {
		let result = await request($apiUrl[url], {
			method: 'POST',
			data: {
				"operateType": key,
				params: {
					shipownerCompanyCode: val.shipownerCompanyCode,
					companyCode: val.companyCode,
					agencyCode: val.agencyCode,
					status: tableData.status,
					checkPmdStatus: tableData.checkPmdStatus,
					checkAgencyStatus: tableData.checkAgencyStatus,
					checkFadStatus: tableData.checkFadStatus,
					agreementHeadUuid: tableData.agreementHeadUuid,
					// uuid: tableData.agreementHeadUuid,
					commissionAgreementCode: tableData.commissionAgreementCode
				}
			}
		})
		if(result.success) {
			Toast('',result.message, 'alert-success', 5000, false)
		} else {
			Toast('', '', '', 5000, false);
		}
	}

	const addItemFlag = async () => {
		Toast('', '', '', 5000, false);
		setToast({})
		setSpinflag(false)
		let uuids = radioData.id;
		if (itemUuidFlag == uuids && radioData.calculationMethod == "CNT") {
			setShowFlag(false);
			FunBtnFlag(radioData);
		} else if(itemUuidFlag == uuids && radioData.calculationMethod == "PCT"){
			setShowFlag(true);
		}
		let newitem = await request($apiUrl.COMM_AGMT_NEW_ITEM_INIT, {
			method: "POST",
			data: {
				uuid: tableData.agreementHeadUuid
			}
		})
		if(newitem.success) {
			let data = newitem.data;
			let commission = data.chargeCodeData.values || [];
			commission.map((val, idx)=> {
				val.value = val.value;
				val.label = val.value + '(' + val.label + ')';
			})
			setCommissionType(commission);
			data.saveShowHide = true
			dataSource.push(data);
			setDataSource([...dataSource]);
			// setDisFlag(false);
			setToast({alertStatus:'alert-success',message:newitem.message});
		} else {
			// Toast('', '', '', 5000, false);
			setToast({alertStatus:'alert-error',message:newitem.errorMessage});
		}
	}
	// 新增Item
	const addItem = () => {
		Toast('', '', '', 5000, false);
		// console.log(stateFlags)
		setSpinflag(true)
		let len = dataSource ? dataSource.length : 0;
		if (len == 0) {
			setSpinflag(false)
			setDataSource([]);
			// console.log(dataSource);
			addItemFlag();
		} else {
			setSpinflag(false)
			Toast('', '', '', 5000, false);
			let itemid = dataSource[len - 1].id;
			// itemid ? addItemFlag() : Toast('',intl.formatMessage({id: 'lbl.save-add-item'}), 'alert-error', 5000, false);
			itemid ? addItemFlag() : setToast({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.save-add-item'})});
			// itemid ? addItemFlag() : alert('请先保存新增item');
		}
	}

	// item保存
	const tableSave = async (record, index) => {
		// console.log(record)
		Toast('', '', '', 5000, false);
		setToast({})
		setSpinflag(true)
		// console.log(record.calculationMethod);
		let DataFlag;
		record.calculationMethod == 'PCT' ? DataFlag = (!record.porCountry || !record.fndCountry || !record.officeType || !record.officeCode || !record.oftPc || !record.commissionType || !record.socEmptyIndicator || !record.percentage) : DataFlag = (!record.porCountry || !record.fndCountry || !record.officeType || !record.officeCode || !record.oftPc || !record.commissionType || !record.socEmptyIndicator);
		// console.log(DataFlag)
		// POR/FDN/Office类型/office code/预到付/佣金类型/SOC空箱标记/百分比
		if(DataFlag) {
			setSpinflag(false)
			// Toast('',formatMessage({id: 'lbl.calculation-cr-save-item'}), 'alert-error', 5000, false)
			setToast({alertStatus:'alert-error',message:intl.formatMessage({id: 'lbl.calculation-cr-save-item'})})
		} else {
			// var reg = new RegExp(/^[A-Z]*[*]?$/)
			// 	var por = record.porCountry
			// 	var fnd = record.fndCountry
			// if(!reg.test(por) || !reg.test(fnd)){
			// 	setToast({alertStatus:'alert-error',message: intl.formatMessage({id: 'lbl.calculation-save-por-fdn'})})
			// 	return
			// }
			setSpinflag(false)
			let len = computingMethodData.length - 1;
			if(computingMethodData[len]) {
				if(computingMethodData[len].commissionContainerPriceUuid ? false : true) {
					// computingMethodData[len].agreementHeadUuid = uuid;
					computingMethodData[len].porCountry = record.porCountry;
					computingMethodData[len].fndCountry = record.fndCountry;
					computingMethodData[len].officeType = record.officeType;
					computingMethodData[len].officeCode = record.officeCode;
					computingMethodData[len].oftPc = record.oftPc;
					computingMethodData[len].commissionType = record.commissionType;
					computingMethodData[len].socEmptyIndicator = record.socEmptyIndicator;
					computingMethodData[len].saveShowHide = false
					setComputingMethodData([...computingMethodData]);
					// console.log('成功', computingMethodData);
				}
			}
			// await request($apiUrl.COMM_AGMT_SAVE_ITEM, {
				await request($apiUrl.CALC_COMM_AGMT_NEW_ITEM_INIT, {
				method: 'POST',
				data: {
					"operateType": 'SAVE',
					params: {
						agreementHeadUuid: uuid,
						commissionAgreementCode: commissionAgreementCodeTxt,
						commissionTypeItemUuid: record.commissionTypeItemUuid,
						porCountry: record.porCountry,
						fndCountry: record.fndCountry,
						officeType: record.officeType,
						officeCode: record.officeCode,
						oftPc: record.oftPc,
						commissionType: record.commissionType,
						commissionMode: record.commissionMode,
						calculationMethod: record.calculationMethod,
						socEmptyIndicator: record.socEmptyIndicator,
						percentage: record.percentage,
						commissionCurrencyCode: record.commissionCurrencyCode,
						crossBookingAdjustment: record.crossBookingAdjustment,
						oftTaxPercent: record.oftTaxPercent,
						vatFlag: record.vatFlag,
						// afcmpreCommissionAgmtContainerPrices: computingMethodData,
						saveShowHide: false,
						headUuid: tableData.id,
						preId: tableData.preId,
						id: record.id,
						afcmpreCommissionAgmtContainerPrices: [...computingMethodData]
					},
				}
			}).then((result) => {
				if(result.success){
					setSpinflag(false)
					let data = result.data[0];
					setItemUuidFlag("")
					setComputingMethodData(data.afcmpreCommissionAgmtContainerPrices);
					dataSource.splice(index, 1, data);
					setDataSource([...dataSource]);
					// dataSource[index].saveShowHide = false;
					// console.log(data, dataSource, index, computingMethodData);
					// setDisFlag(false);
					setShowFlag(true);  
					setUploadEdit ? setUploadEdit(true) : undefined;
					setItemUuidFlag('');
					// Toast('',formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false)
					setToast({alertStatus:'alert-success',message:result.message})
				}else{
					setSpinflag(false)
					setToast({alertStatus:'alert-error',message:result.errorMessage})
				}
			})
		}
	}

	// const commonFun = async() => {
	//   const result = await request($apiUrl.COMM_SEARCH_PRE_HEAD_DETAIL,
	//     {
	//         method:'POST',
	//         data: {
	//             uuid: uuid
	//         }
	//     }
	//   )
	//   let data=result.data.afcmpreCommissionAgmtItems
	//   // data.map((v,i)=>{
	//   //     v.saveShowHide=true
	//   // })
	//   setDataSource([...data])
	// }
	const deleteItemFun = async(record, index) => {
		setSpinflag(true)
		let deletes = await request($apiUrl.PRECALC_AGMT_DELETE_ITEM_UUID, {
			method: "POST",
			data: {
				params:{
					id: record.id,
					preId: record.preId,
					agreementItemUuid: record.commissionTypeItemUuid
				}
			}
		})
		if (deletes.success) {
			setSpinflag(false)
			dataSource.splice(index, 1)
			setDataSource([...dataSource])
			// setShowFlag(true);
			setToast({alertStatus:'alert-success',message:deletes.message})
		} else {
			setSpinflag(false)
			setToast({alertStatus:'alert-error',message:deletes.errorMessage})
		}
	}


	//删除item项
	const deleteItem = async (text, record, index) => {
		setToast({})
		Toast('', '', '', 5000, false);
		const confirmModal = confirm({
			title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id:'lbl.delete.select.content'}),
            okText: intl.formatMessage({id:'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            onOk() {
				setSpinflag(true)
                confirmModal.destroy()
				if (!record.agreementHeadUuid) {
					setSpinflag(false)
					dataSource.splice(index, 1)
					setDataSource([...dataSource])
				} else {
					deleteItemFun(record, index)
				}
            }	
        })

		// console.log(record)
		
	}

	// 编辑item
	const compileBtn = (text, record, index) => {
		setToast({})
		Toast('', '', '', 5000, false);
		let data = dataSource;
		// console.log(data);
		data[index].saveShowHide = true;
		setDataSource([...data]);
		// console.log(text, record, index, tableData);
	}


	// 编辑箱量计算方法
	const boxCompileBtn = (text, record, index) => {
		setToast({})
		Toast('', '', '', 5000, false);
		let data = computingMethodData;
		data[index].saveShowHide = true;
		setComputingMethodData([...data]);
		// console.log(record.saveShowHide, tableData, index);
	}

	//协议表格
	const addColumns = [
		{
			title: <FormattedMessage id="lbl.operate" />,//操作
			dataIndex: 'operation',
			sorter: false,
			width: 100,
			align: 'center',
			fixed: true,
			render: (text, record, index) => {
				return <div>
					<Tooltip title={<FormattedMessage id='btn.delete' />}>		
						{/* 删除 */}
						<a disabled={commonFlag} onClick={() => deleteItem(text, record, index)}><CloseCircleOutlined style={{ color: commonFlag ? '#ccc' : 'red' }} /></a>&nbsp;
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.save' />}>
						{/* 保存 */}
						<a style={{display: record.saveShowHide ? 'inline-block' : 'none'}} disabled={commonFlag} onClick={() => tableSave(record, index)}><SaveOutlined /></a>
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.edit' />}>
						{/* 编辑 */}
						<a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={commonFlag} onClick={() => compileBtn(text, record, index)}><FormOutlined /></a>&nbsp;
					</Tooltip>&nbsp;
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.porcountry-region' />,     // POR国家/地区
			dataIndex: 'porCountry',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Input maxLength={3} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'porCountry')} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.fdncountry-region' />,     // FND国家/地区
			dataIndex: 'fndCountry',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Input maxLength={3} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'fndCountry')} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.office-type' />,     // Office类型
			dataIndex: 'officeType',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'officeType')} name='officeType' options={officeType} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.office' />,      // Office
			dataIndex: 'officeCode',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Input maxLength={10} defaultValue={text} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'officeCode')} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.To-pay-in-advance' />,     // 预到付
			dataIndex: 'oftPc',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'oftPc')} name='oftPc' options={toPayInAdvance} /> : (text == 'N' ? <span>{'CB0044.' + text}</span> : toPayInAdvance.map((v, i) => {
						return text == v.value ? <span>{v.label}</span> : ''
					}))}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Commission-type' />,     // 佣金类型
			dataIndex: 'commissionType',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionType')} name='commissionType' options={commissionType} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.The-Commission' />,      // 佣金模式
			dataIndex: 'commissionMode',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionMode')} name='commissionBasedModel' options={commissionBasedModel} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Computing-method' />,      // 计算方法
			dataIndex: 'calculationMethod',
			sorter: false,
			width: 120,
			render: (text, record, index) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'calculationMethod', true)} name='calcMthd' options={calcMthd} /> : calcMthd.map((v, i) => {
						return text == v.value ? <span>{v.label}</span> : '';
					})}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.empty-box-mark' />,      // SOC空箱标记
			dataIndex: 'socEmptyIndicator',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'socEmptyIndicator')} name='socEmptyInd' options={socEmptyInd} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.percentage' />,     // 百分比
			dataIndex: 'percentage',
			sorter: false,
			width: 120,
			align:'right',
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <InputNumber defaultValue={text} precision={6} autoComplete="off" min={0} max={100} onChange={(e) => getCommonIptVal(e, record, 'percentage', true)} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.ccy' />,      // 币种
			dataIndex: 'commissionCurrencyCode',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionCurrencyCode')} name='currCode' options={currCode} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Cross-Booking-adjustment-rate' />,     // Cross Booking调整比率
			dataIndex: 'crossBookingAdjustment',
			sorter: false,
			width: 200,
			align:'right',
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <InputNumber defaultValue={text} precision={6} min={0} max={999999} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'crossBookingAdjustment', true)} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Freight-tax' />,      // 运输税
			dataIndex: 'oftTaxPercent',
			sorter: false,
			width: 120,
			align:'right',
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <InputNumber defaultValue={text} precision={6} min={0} max={999999} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'oftTaxPercent', true)} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Whether-the-price-includes-tax' />,      // 是否含税价 
			dataIndex: 'vatFlag',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'vatFlag')} name='vatFlag' options={vatFlag} /> : vatFlag.map((v, i) => {
						return text == v.value ? <span>{v.label}</span> : ''
					})}
				</div>
			}
		}
	]

	// 箱量计算方法明细-表头
	const computingMethodColumns = [
		{
			title: <FormattedMessage id="lbl.operate" />,//操作
			dataIndex: 'operation',
			sorter: false,
			width: 100,
			align: 'center',
			fixed: true,
			render: (text, record, index) => {
				return <div>
					<Tooltip title={<FormattedMessage id='btn.delete' />}>
						<a disabled={commonFlag} onClick={() => deleteBoxCalculationDetailed(text, record, index)}><CloseCircleOutlined style={{ color: commonFlag ? '#ccc' : 'red' }} /></a>&nbsp;
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.save' />}>
						<a style={{display: record.saveShowHide ? 'inline-block' : 'none'}} disabled={commonFlag} onClick={() => boxTableSave(record, index)}><SaveOutlined /></a>
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.edit' />}>
						<a style={{display: record.saveShowHide ? 'none' : 'inline-block'}} disabled={commonFlag} onClick={() => boxCompileBtn(text, record, index)}><FormOutlined /></a>&nbsp;
					</Tooltip>&nbsp;
        		</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Box-size-group' />,     // 箱型尺寸组
			dataIndex: 'containerSizeTypeGroup',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={record.containerSizeTypeGroup} onChange={(e) => getCommonSelectVal(e, record, 'containerSizeTypeGroup')} name='containerSizeTypeGroup' options={detailedSize} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.ccy' />,      // 币种
			dataIndex: 'commissionCurrencyCode',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={record.commissionCurrencyCode} onChange={(e) => getCommonSelectVal(e, record, 'commissionCurrencyCode')} name='commissionCurrencyCode' options={currCode} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.imputed-price' />,      // 计算价格
			dataIndex: 'unitPrice',
			sorter: false,
			width: 120,
			align:'right',
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <InputNumber precision={2} defaultValue={record.unitPrice} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'unitPrice',true)} name='unitPrice' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.imputed-type' />,      // 计算类型
			dataIndex: 'unitPriceType',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={record.unitPriceType} onChange={(e) => getCommonSelectVal(e, record, 'unitPriceType')} name='unitPriceType' options={calculationType.values} /> : text}
				</div>
			}
		}
	]

	// 箱量计算方法明细-保存
	const boxTableSave = async (record, index) => {
		Toast('', '', '', 5000, false);
		setSpinflag(true)
		if(!record.containerSizeTypeGroup) {
			setSpinflag(false)
			Toast('', intl.formatMessage({id: 'lbl.Please-enter-required-options'}), 'alert-error', 5000, false)
		} else {
			setSpinflag(true)
			// console.log('来个判断吧', itemUuidFlag);
			if(itemUuidFlag){
				let json = {
					agreementHeadUuid: uuid,
					commissionTypeItemUuid: itemUuidFlag,
					commissionAgreementCode: commissionAgreementCodeTxt,
					containerSizeTypeGroup: record.containerSizeTypeGroup,  // 箱型尺寸组
					commissionCurrencyCode: record.commissionCurrencyCode,  // 币种
					unitPrice: record.unitPrice,  // 计算价格
					unitPriceType: record.unitPriceType,  // 计算类型
					commissionContainerPriceUuid: record.commissionContainerPriceUuid,
					porCountry: radioData.porCountry,	// POR国家/地区
					fndCountry: radioData.fndCountry,	// FND国家/地区
					officeType: radioData.officeType,	// office类型
					officeCode: radioData.officeCode,	// office
					oftPc: radioData.oftPc,	// 预到付
					commissionType: radioData.commissionType,	// 佣金类型
					socEmptyIndicator: radioData.socEmptyIndicator,	// SOC空箱标记
					saveShowHide: false,
					itemUuid: radioData.id,
					id: record.id
				};
				// const result = await request($apiUrl.COMM_AGMT_SAVE_CNTR_PRICE, {
				const result = await request($apiUrl.CALC_COMM_AGMT_SAVE_CNTR_PRICE, {
					method: 'POST',
					data: {
						"operateType": 'SAVE',
						params: json
					}
				})
				// commonBtn(itemUuid)
				if(result.success){
					setSpinflag(false)
					let data = result.data[0];
					computingMethodData.splice(index, 1, data);
					// computingMethodData[index].saveShowHide = false;
					setComputingMethodData([...computingMethodData]);
					// Toast('',formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false)
					setToast({alertStatus: 'alert-success', message: result.message});
				}else{
					setSpinflag(false)
					setToast({alertStatus: 'alert-error', message: result.errorMessage});
				}
			} else {
				setSpinflag(false)
				// Toast('', formatMessage({id: 'lbl.save-add-item-box-detailed'}), 'alert-error', 5000, false)
				setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.save-add-item-box-detailed'})});
			}
			// console.log(result, '箱量保存');
			// console.log(record, index, json, '数据对比');
		}
	}

	// 箱量计算方法明细-数据
	const [computingMethodData, setComputingMethodData] = useState([]);
	// item的uuid用来判断箱量计算方法明细
	const [itemUuidFlag, setItemUuidFlag] = useState("");

	// table select
	const getCommonSelectVal = (e, record, name, flag) => {
		// setItemUuid(val.agreementHeadUuid);  // 
		// console.log('对比', record);
		record[name] = e;
		let uuids = record.commissionTypeItemUuid;  // item的uuid
		if(flag && uuids) {
			setItemUuidFlag(uuids);  // item的uuid
		// if(!flag && itemUuidFlag == uuids){
			if (radioData.agreementHeadUuid == uuids && record.calculationMethod == "CNT") {
			// 	record.calculationMethod == "CNT" ? setDisFlag(true) : setDisFlag(false);
				// setDisFlag(true);
				FunBtnFlag(record);
			} else if(radioData.agreementHeadUuid == uuids && record.calculationMethod == "PCT"){
				// setDisFlag(false);
			}
		}
	}
	// value={this.state.value}
	const [valueIpt, setValueIpt] = useState();
	// table input
	const getCommonIptVal = (e, record, name, flag) => {
		flag ? record[name] = e : record[name] = e.target.value;
	}
	const deleteBoxDetailedFun = async(record, index) => {
		setSpinflag(true)
		await request.post($apiUrl.PRECALC_AGMT_DELETE_CNTR_PRICE_UUID,{
			method:'POST',
			data: {
			//   uuid: record.commissionContainerPriceUuid
				params:{
					id: record.id,
					preId: record.preId,
				}
			}
		})
		.then((result) => {
			let data = result;
			if(data.success) {
				setSpinflag(false)
				computingMethodData.splice(index,1)
				setComputingMethodData([...computingMethodData])
				setToast({alertStatus:'alert-success',message:result.message})
			} else {
				setSpinflag(false)
				// Toast('', '', '', 5000, false);
				setToast({alertStatus:'alert-error',message:result.errorMessage})
			}
		})
	}

	// 删除箱量计算方法明细数据
	const deleteBoxCalculationDetailed = async (text, record, index) => {
		// console.log(record)
		setToast({})
		Toast('', '', '', 5000, false);
		const confirmModal = confirm({
            title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id:'lbl.delete.select.content'}),
            okText: intl.formatMessage({id:'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            onOk() {
				setSpinflag(true)
                confirmModal.destroy()
                if(!record.id){
					setSpinflag(false)
					computingMethodData.splice(index,1)
					setComputingMethodData([...computingMethodData])
				} else {
					setSpinflag(false)
					deleteBoxDetailedFun(record, index)
				}
            }
        })
	}

	const [disFlag, setDisFlag] = useState(false);  // 箱量计算方法明细显示隐藏
	const [itemUuid, setItemUuid] = useState('');   // 箱量计算方法明细初始化的id
	const [detailedSize, setDetailedSize] = useState([]);  // 箱型尺寸组数据

	const FunBtnFlag = (val, flag) => {
		// console.log(val);
		// val.agreementHeadUuid ? setBtnFlag(false) : setBtnFlag(true);
		let dataArr = val.afcmpreCommissionAgmtContainerPrices ? val.afcmpreCommissionAgmtContainerPrices : [];
		// console.log(dataArr);

		let len = dataArr.length-1;
		if(dataArr[len]) {
			if(!dataArr[len].commissionContainerPriceUuid) {
				dataArr.splice(len, 1);
			}
		}
		dataArr.map((v, i) => {
			v.saveShowHide = false;
		})
		// console.log(dataArr)
		setComputingMethodData([...dataArr]);  // item箱量计算方法明细的data
	}
	// 协议item的单选
	const setSelectedRows = async (val) => {
		Toast('', '', '', 5000, false);
		setToast({})
		setRadioData(val);
		// console.log(val);
		if (val.calculationMethod == "CNT") {  // 判断item是否是计算方法  and  select数据
			// setDisFlag(true)
			setShowFlag(false);
		} else {
			// setDisFlag(false);
			setShowFlag(true);
		}
		setItemUuidFlag(val.id);  // item的uuid
		// setItemUuid(tableData.agreementHeadUuid);  // 
		btnFlag ? FunBtnFlag(val, false) : FunBtnFlag(val, true)
		// await request.post($apiUrl.COMM_AGMT_NEW_TYPE_CONT_PRICE_INIT, {
		await request.post($apiUrl.CALC_COMM_AGMT_NEW_TYPE_CONT_PRICE_INIT, {
			method: 'POST',
			data: {
				params:{
					agreementHeadUuid: tableData.agreementHeadUuid,
					preId: val.preId
				}
			}
		})
		.then((result) => {
			if(result.success) {
				let data = result.data;
				setDetailedSize(data);
			} else {
				Toast('', '', '', 5000, false);
				setToast({alertStatus: 'alert-error', message: result.errorMessage});
			}
		})
	}

	// const [dataArr, setDataArr] = useState([]);   // 箱量计算方法明细数据
	// 箱量计算方法明细-添加
	const commonPrice = async () => {
		Toast('', '', '', 5000, false);
		setToast({})
		// await request.post($apiUrl.COMM_AGMT_NEW_TYPE_CONT_PRICE_INIT,{
		//   method:'POST',
		//   data: {
		//     uuid: itemUuid
		//   }
		// })
		// .then((result) => {
		//     let data = result.data;
		//     setDetailedSize(data);
		//     console.log(data, detailedSize, 'select数据')
		// })

		let json = {
			commissionCurrencyCode: '',
			containerSizeTypeGroup: '',
			unitPrice: '',
			unitPriceType: '',
			saveShowHide: true,
			id: ''
		}

		computingMethodData.push(json);
		setComputingMethodData([...computingMethodData]);
		// console.log(computingMethodData);
	}

	const addItemDetailed = async () => {
		Toast('', '', '', 5000, false);
		let len = computingMethodData.length;
		if (len == 0) {
			commonPrice();
		} else {
			// computingMethodData[len - 1].commissionContainerPriceUuid ? commonPrice() : alert('请先保存新增数据');
			computingMethodData[len - 1].id ? commonPrice() : setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.save-add-data'})});
		}

	}

	// 箱型尺寸详细-表头
	const sizeDetailedColumns = [
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
		}, {
			title: <FormattedMessage id='lbl.cargo-class' />,      // 货类
			dataIndex: 'cargoNatureCode',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{text}
				</div>
			}
		}
	]
	// 箱型尺寸详细-数据
	const [sizeDetailedTable, setSizeDetailedTable] = useState([]);
	const [newSizeDetailedTable, setNewSizeDetailedTable] = useState([]);

	// 保存全部数据
	const handleQuery = async (val, key, url) => {
		setToast(null)
		// setSaveFlag(false);
		// console.log(val.toDate,val.fromDate)val.companyCode
		setSpinflag(true)
		if(!val.shipownerCompanyCode || !val.fromDate || !val.toDate || !val.postCalculationFlag || !val.postMode || !val.isYt || !val.isBill) {
			setSpinflag(false)
			setToast({alertStatus:'alert-error',message:intl.formatMessage({id:'lbl.Please-enter-required-options'})})
			// console.log(val.shipownerCompanyCode, momentFormat(val.fromDate), momentFormat(val.toDate), val.postCalculationFlag, val.postMode, val.isYt, val.isBill)
		} else {
			let data = dataSource;
			// let tengkui = [...sizeDetailedTable];

			// if(data){
			// 	data.map((val, idx) => {
			// 		val.afcmpreCommissionAgmtContainerPrices.map((v, i) => {
			// 			if(v.commissionContainerPriceUuid? false : true) {
			// 				v.porCountry = val.porCountry;
			// 				v.fndCountry = val.fndCountry;
			// 				v.officeType = val.officeType;
			// 				v.officeCode = val.officeCode;
			// 				v.oftPc = val.oftPc;
			// 				v.commissionType = val.commissionType;
			// 				v.socEmptyIndicator = val.socEmptyIndicator;
			// 				v.saveShowHide = false
			// 				// setComputingMethodData([...computingMethodData]);
			// 				// console.log('成功', computingMethodData);
			// 			}
			// 		})
			// 	})
			// 	setDataSource([...data]);
			// }
			let groupSizeData = []
            checkedRow.map((v, i) => { 
                groupSizeData.push({
                    containerSizeTypeGroup: queryForm.getFieldValue().containerSizeTypeGroup,
                    containerSizeType: v.containerSizeType,
                    cargoNatureCode: v.cargoNatureCode,
                    agreementHeadUuid: tableData.agreementHeadUuid,
                    preId: tableData.preId,
                    commissionAgreementCode: tableData.commissionAgreementCode,
                })
            })

			if(data){
				dataSource.map((v, i) => {
					if(v.id == itemUuidFlag) {
						v.afcmpreCommissionAgmtContainerPrices = computingMethodData
					}
				})
				data.map((val, idx) => {
					val.afcmpreCommissionAgmtContainerPrices.map((v, i) => {
						let len = val.afcmpreCommissionAgmtContainerPrices.length - 1;
						if(val.afcmpreCommissionAgmtContainerPrices[len].commissionContainerPriceUuid? false : true) {
							val.afcmpreCommissionAgmtContainerPrices[len].porCountry = val.porCountry;
							val.afcmpreCommissionAgmtContainerPrices[len].fndCountry = val.fndCountry;
							val.afcmpreCommissionAgmtContainerPrices[len].officeType = val.officeType;
							val.afcmpreCommissionAgmtContainerPrices[len].officeCode = val.officeCode;
							val.afcmpreCommissionAgmtContainerPrices[len].oftPc = val.oftPc;
							val.afcmpreCommissionAgmtContainerPrices[len].commissionType = val.commissionType;
							val.afcmpreCommissionAgmtContainerPrices[len].socEmptyIndicator = val.socEmptyIndicator;
							val.afcmpreCommissionAgmtContainerPrices[len].saveShowHide = false
						}
					})
				})
				setDataSource([...data]);
			}
			if (data != undefined) {
				data.map((v, i) => {
					v.saveShowHide = false;
				})
				setDataSource(data);
			}
			// tengkui = tengkui.map((item) => {
			// 	item['agreementHeadUuid'] = uuid
			// 	item['commissionAgreementCode'] = commissionAgreementCodeTxt
			// 	item['containerSizeTypeGroup'] = val.containerSizeTypeGroup
			// 	// delete item.id
			// 	console.log(item)
			// 	return item
				
			// })
			saveNaData();
			setNaMockData();
			let str = val ? val.companyCode : '';
			let ind = str.indexOf('-');
        	let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
			// console.log(str,'---', we)
			setSpinflag(false)
			await request($apiUrl[url], {
				method: 'POST',
				data: {
					"operateType": 'SAVE',
					"page": {
						"current": 0,
						"pageSize": 0
					},
					params: {
						fromDate: momentFormat(val.fromDate),
						toDate: momentFormat(val.toDate),
						afcmpreCommissionAgmtItems: dataSource,
						shipownerCompanyCode: val.shipownerCompanyCode,
						companyCode: we,
						// companyCode: val.companyCode,
						agencyCode: val.agencyCode,
						commissionAgreementCode: val.commissionAgreementCode,
						agreementType: val.agreementType,
						crossBookingPercent: val.crossBookingPercent,
						crossBookingIndicator: val.crossBookingIndicator,
						crossBookingMode: val.crossBookingMode,
						payElsewhereMode: val.payElsewhereMode,
						allInRate: val.allInRate,
						payElsewherePercent: val.payElsewherePercent,
						postCalculationFlag: val.postCalculationFlag,
						postMode: val.postMode,
						ygSide: val.ygSide,
						yfSide: val.yfSide,
						sfSide: val.sfSide,
						isYt: val.isYt,
						isBill: val.isBill,
						agreementHeadUuid: tableData.agreementHeadUuid,
						// afcmpreCommissionAgmtCntrSizeTypeGroups:tengkui,
						afcmpreCommissionAgmtCntrSizeTypeGroups:groupSizeData,
						afcmpreCommissionAgmtNAGroups: naData,
						groupAgreementCode: val.groupAgreementCode,
						preId: val.preId,
						id:val.id,
						// afcmpreCommissionAgmtItems: dataSource?[...dataSource]:[],
					},
				}
			}).then((result) => {
				if (result.success) {
					setSpinflag(false)
					let data = result.data;
					data.postCalculationFlag = data.postCalculationFlag + '';
					data.postMode = data.postMode + '';
					data.isYt = data.isYt + '';
					data.isBill = data.isBill + '';
					setHeaderUuid(data.agreementHeadUuid);
				
					setWriteRead(false);
					setCommissionAgreementCodeTxt(data.commissionAgreementCode); // 协议代码
					setAddFlag(false);
					// data.commissionAgreementCode ? setBtnFlag(true) : setBtnFlag(false); // 是否禁用新增item
					setUuid(data.agreementHeadUuid); // 设置uuid
					// setTableData(data);
					// data.afcmpreCommissionAgmtItems == null ? setDataSource([]) : '';
					let datas =  data.afcmpreCommissionAgmtItems
					let groupData = data.afcmpreCommissionAgmtCntrSizeTypeGroups
					let naData = data.afcmpreCommissionAgmtNAGroups
					setDataSource(datas);
					setCommissionAgmtCntrSizeTypeGroups(groupData)
					setmockData(naData)
					setSizeDetailedTable([])
					setNewSizeDetailedTable([])
					settargetKeys([]);
					setNaData([]);
					getNaData(headerUuid);
					// setToast({alertStatus:'alert-success',message:intl.formatMessage({id:'lbl.save-successfully'})})
					setToast({alertStatus: 'alert-success', message: result.message});
					queryForm.setFieldsValue({
						...data,
						fromDate: moment(data.fromDate),
						toDate: moment(data.toDate),
					})
					// console.log(data.fromDate)
					// console.log('确认有无数据', dataSource);
					setItemUuidFlag("")
					setGroupFlag(false)
					setShowFlag(true); 
				}else{
					setSpinflag(false)
					setToast({alertStatus:'alert-error',message:result.errorMessage})
				}
			})
		}
	}

	// 维护NA组
	const columns = [{
		title: <FormattedMessage id='lbl.Trade-line' />,
		dataIndex: 'tradeLane',
		key: 'tradeLane',
		align: "center"
	},
	{
		title:  <FormattedMessage id='lbl.group' />,
		dataIndex: 'groupCode',
		key: 'groupCode',
		align: "center"
	}]

	// useEffect(() => {
	// queryForm.setFieldsValue({
	//   ...tableData,
	//   toDate: moment(tableData.toDate),
	//   fromDate: moment(tableData.fromDate),
	// })
	// console.log(tableData)
	// }, [])
	// formatMessage({id: 'lbl.Please-enter-required-options'})
	const handleCancel = () => {
		Toast('', '', '', 5000, false);
		setToast(null)
		setIsModalVisible(false); // 关闭弹窗
		setDefaultKey('1');
		setCommissionAgmtCntrSizeTypeGroups([]);
		setItemUuidFlag("")
		setDataSource([]);
		setTableData([]);
		setChecked([])  //清除勾选项
        setCheckedRow([])   //清除勾选数据
		setShowFlag(true); 
		queryForm.setFieldsValue({ // 数据清空                                  
			toDate: moment(dateEnd),
			fromDate: '',
			shipownerCompanyCode: '',
			companyCode: '',
			agencyCode: '',
			commissionAgreementCode: '',
			agreementType: '',
			crossBookingPercent: '',
			crossBookingIndicator: '',
			crossBookingMode: '',
			payElsewhereMode: '',
			allInRate: '',
			payElsewherePercent: '',
			postCalculationFlag: '',
			postMode: '',
			ygSide: '',
			yfSide: '',
			sfSide: '',
			isYt: '',
			isBill: '',
		})
		queryForm.setFieldsValue({
			containerSizeTypeGroup: '',
			yfBusiness: ''
		})
		setSizeDetailedTable([])
		settargetKeys([]);
		setNaData([]);
		queryForm.setFieldsValue({
			groupCodeData: ''
		})
	}

	// 点击增加class类
	const [currentIndex, setCurrentIndex] = useState();
	const changeIdx = (idx) => {
		setCurrentIndex(idx);
		// console.log(currentIndex);
	}
	let isSizeBoxAddflag
	// 添加指定箱型尺寸信息 
	const rightBtn = () => {
		setToast({})
		Toast('', '', '', 5000, false);
		let data = queryForm.getFieldValue();
		// console.log(data.yfBusiness)
		if(data.yfBusiness) {
			if(groupInit[currentIndex]==undefined){
                setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.banlie-box-size'})});
                return
            }
			let idx = newSizeDetailedTable.length;
			isSizeBoxAddflag =  true
			sizeDetailedTable.map((item) => {
				if ((data.yfBusiness == item.cargoNatureCode && groupInit[currentIndex] == item.containerSizeType) || idx == item.id) {
					isSizeBoxAddflag = false
				}
			})
			if (!isSizeBoxAddflag) {
				return
			}
			let json = {
				containerSizeTypeGroup: data.containerSizeTypeGroup,
				containerSizeType: groupInit[currentIndex],
				cargoNatureCode: data.yfBusiness,
				id: idx++
			}
			sizeDetailedTable.push(json);
			newSizeDetailedTable.push(json);
			setSizeDetailedTable([...sizeDetailedTable])
			setNewSizeDetailedTable([...newSizeDetailedTable])
			// console.log(sizeDetailedTable)
		} else {
			// Toast('', formatMessage({id: 'lbl.Goods-category-required'}), 'alert-error', 5000, false)
			setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Goods-category-required'})});
		}
	}

	// 删除箱型尺寸信息
	// 协议item的单选
	const getSelectedRows = async (val) => {
		// val.calculationMethod == "CNT" ? setDisFlag(true) : setDisFlag(false);  // 判断item是否是计算方法
		// setItemUuidFlag(val.commissionTypeItemUuid);  // item的uuid
		// setItemUuid(val.agreementHeadUuid);  // 

		// let dataArr = val.afcmpreCommissionAgmtContainerPrices;
		// // dataArr.map((v, i) => {
		// //   v.saveShowHide = true;
		// // })
		// setComputingMethodData(dataArr);  // item箱量计算方法明细的data

		// await request.post($apiUrl.COMM_AGMT_NEW_TYPE_CONT_PRICE_INIT,{
		// 	method:'POST',
		// 	data: {
		// 		uuid: itemUuid
		// 	}
		// })
		// .then((result) => {
		// 	let data = result.data;
		// 	setDetailedSize(data);
		// })
		// // const idData = [];
		// // val.map((v, i) => {
		// //   let id = v.id;
		// //   idData.push(id);
		// //   sizeDetailedTable.splice(id, 1);
		// // })
		// setSizeDetailedTable([...sizeDetailedTable])
		// console.log('箱型尺寸信息', val, sizeDetailedTable,computingMethodData);
		setCheckedRow(val)
	}
	//删除指定箱型尺寸
	const deleteBoxSize = () => {
		setToast({})
		Toast('', '', '', 5000, false);
		if(checkedRow.length==0){
            setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Unclock-tips'})});
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
	const deleteAllBoxDetail = () => {
		setToast({})
		Toast('', '', '', 5000, false);
		setSizeDetailedTable([])
		setCheckedRow([])
        setChecked([])
	}
	//添加全部箱型尺寸
	const addAllBoxDetail = () => {
		setToast({})
		Toast('', '', '', 5000, false);
		const newGroupInit = []
		setCheckedRow([])
        setChecked([])
		let data = queryForm.getFieldValue();
		// console.log(data.yfBusiness)
		if(data.yfBusiness) {
			let idx = newSizeDetailedTable.length;
			// console.log(idx)
			isSizeBoxAddflag = true
			for (let i = 0; i < sizeDetailedTable.length; i++) {
				for (let j = 0; j < groupInit.length; j++) {
					// console.log(data.yfBusiness == sizeDetailedTable[i].cargoNatureCode, groupInit[j] == sizeDetailedTable[i].containerSizeType)
					if ((data.yfBusiness == sizeDetailedTable[i].cargoNatureCode && groupInit[j] == sizeDetailedTable[i].containerSizeType) || idx == sizeDetailedTable[i].id) {
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
					containerSizeType: item,
					cargoNatureCode: data.yfBusiness,
					id: idx++
				})
			})
			let sizeDetailedTableAll = sizeDetailedTable.concat(newGroupInit)
			setSizeDetailedTable([...sizeDetailedTableAll])
			setNewSizeDetailedTable([...sizeDetailedTableAll])
		} else {
			// Toast('', formatMessage({id: 'lbl.Goods-category-required'}), 'alert-error', 5000, false)
			setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.Goods-category-required'})});
		}
	}
	const [isEditBoxSize,setIsEditBoxSize] = useState('SAVE')
	//保存全部箱型尺寸
	const saveBoxSize = async () => {
		Toast('', '', '', 5000, false);
		setToast({})
		setSpinflag(true)
		let data = queryForm.getFieldValue();
		// console.log(data.yfBusiness)
		// if(data.yfBusiness) {

		// }
		// containerSizeTypeGroup
		// 							yfBusiness
		// console.log(data, $apiUrl.COMM_AGMT_SAVE_CNTR_GROUP)
		if(data.containerSizeTypeGroup && data.yfBusiness) {
			if(checked.length==0){
				setSpinflag(false)
				setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.save-group-warn'})});
				return;
			}
			if(data.containerSizeTypeGroup.length>4){
				setSpinflag(false)
                setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.banlie-box-size-group'})});
                return
            }
			// let tengquan = [...sizeDetailedTable]
			// tengquan = tengquan.map((item) => {
			// 	item.agreementHeadUuid = uuid;
			// 	item.commissionAgreementCode = commissionAgreementCodeTxt;
			// 	item.containerSizeTypeGroup = data.containerSizeTypeGroup
			// 	delete item.id
			// 	return item
			// })
			let groupSizeData = []
            checkedRow.map((v, i) => { 
                groupSizeData.push({
                    // containerSizeTypeGroup: v.containerSizeTypeGroup,
                    containerSizeTypeGroup: queryForm.getFieldValue().containerSizeTypeGroup,
                    containerSizeType: v.containerSizeType,
                    cargoNatureCode: v.cargoNatureCode,
                    agreementHeadUuid: tableData.agreementHeadUuid,
                    preId: tableData.preId,
                    commissionAgreementCode: tableData.commissionAgreementCode,
                })
            })
			// await request($apiUrl.COMM_AGMT_SAVE_CNTR_GROUP, {
				await request($apiUrl.CALC_COMM_AGMT_SAVE_CNTR_GROUP, {
				method: 'POST',
				data: {
					operateType:isEditBoxSize,
					// paramsList: tengquan
					params:{
						agreementHeadUuid: tableData.agreementHeadUuid,
                        commissionAgreementCode:tableData.commissionAgreementCode,
                        containerSizeTypeGroup:data.containerSizeTypeGroup,//箱型尺寸组名称
                        preId: tableData.preId
					},
					paramsList: groupSizeData
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
					setCommissionAgmtCntrSizeTypeGroups([...resData])
					setIsEditBoxSize('SAVE')
					setGroupFlag(false)
					queryForm.setFieldsValue({
						containerSizeTypeGroup: '',
						yfBusiness: ''
					})
					// setSelectedRows(radioData);
					radioData.commissionTypeItemUuid ? setSelectedRows(radioData) : null;
					// Toast('', formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false)
					setToast({alertStatus:'alert-success',message:res.message})
				}else{
					setToast({alertStatus:'alert-error',message:res.errorMessage})
				}
			})
		} else {
			setSpinflag(false)
			// Toast('', formatMessage({id: 'lbl.box-size-Goods-category-required'}), 'alert-error', 5000, false)
			setToast({alertStatus: 'alert-error', message: intl.formatMessage({id: 'lbl.box-size-Goods-category-required'})});
		}
	}
	// console.log(commissionAgmtCntrSizeTypeGroups)
	//重置箱型尺寸
	const resetBoxSize = () => {
		setToast({})
		Toast('', '', '', 5000, false);
		// containerSizeTypeGroup，yfBusiness
		setGroupFlag(false)
		queryForm.setFieldsValue({
			containerSizeTypeGroup: '',
			yfBusiness: ''
		})
		setSizeDetailedTable([])
		setCheckedRow([])
	}
	const [openBoxSizedetailIndex, setOpenBoxSizedetailIndex] = useState()
	const boxSizeref = React.useRef()
	//展开左侧箱型尺寸详情
	const openBoxSizedetail = (index) => {
		setToast({})
		Toast('', '', '', 5000, false);
		setOpenBoxSizedetailIndex(index)
		if (openBoxSizedetailIndex == index) {
			setOpenBoxSizedetailIndex()
		}
		boxSizeref.current.scrollTo(0, index * 20)
	}
	//删除左侧箱型尺寸组
	const deleteAddSuccessBoxSize = async (item) => {
		Toast('', '', '', 5000, false);
		setToast({})
		const confirmModal = confirm({
			title: intl.formatMessage({id:'lbl.delete'}),
            content: intl.formatMessage({id:'lbl.delete.select.content'}),
            okText: intl.formatMessage({id:'lbl.confirm'}),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
				setSpinflag(true)
                confirmModal.destroy()
				await request($apiUrl.PRECALC_AGMT_DELETE_CNTR_GROUP_UUID, {
					method: 'POST',
					data: {
						params: {
							agreementHeadUuid: uuid,
							containerSizeTypeGroup: item.containerSizeTypeGroup,
							preId: tableData.preId
						}
					}
				})
				.then((res) => {
					if(res.success){
						setSpinflag(false)
						const data = res.data || []
						const resData = data.afcmpreCommissionAgmtCntrSizeTypeGroups
						setCommissionAgmtCntrSizeTypeGroups([...resData])
						// Toast(res.message, '', 'alert-success', 5000, false)
						setToast({alertStatus:'alert-success',message:res.message})
					}else{
						setSpinflag(false)
						setToast({alertStatus:'alert-error',message:res.errorMessage})
					}
				})
				.catch((err) => {
					setSpinflag(false)
					Toast(err.errorMessage, '', 'alert-error', 5000, false)
				})		
            }	
        })
	}
	//编辑左侧详情尺寸组
	const editAddSuccessBoxSize = (item) => {
		setToast({})
		Toast('', '', '', 5000, false);
		setGroupFlag(true);
		let idx = newSizeDetailedTable.length;
		item.containerCargoDetails.map((item) => {
			item.id = idx++
		})
		queryForm.setFieldsValue({
			containerSizeTypeGroup: item.containerSizeTypeGroup
		})
		setIsEditBoxSize('UPD')
		// console.log(item)
		setSizeDetailedTable([...item.containerCargoDetails])
		setNewSizeDetailedTable([...item.containerCargoDetails])
	}

	// 重置 维护NA组
	const resetNa = () => {
		setToast({})
		Toast('', '', '', 5000, false);
		settargetKeys([]);
		setNaData([]);
		setChecked([]);
		queryForm.setFieldsValue({
			groupCodeData: ''
		})
	}
	// 维护NA组删除
	const deleteNA = () => {
        Toast('', '', '', 5000, false);
		setToast({});	
        const confirmModal = confirm({
			title: intl.formatMessage({ id: 'lbl.afcm_comm_na_delete' }),
			content: intl.formatMessage({ id: 'lbl.afcm_comm_na_delete_txt' }),
			okText: intl.formatMessage({ id: 'lbl.confirm' }),
            okType: 'danger',
            closable:true,
            cancelText:'',
            async onOk() {
				setSpinflag(true)
                confirmModal.destroy()
                const deleteData = await request($apiUrl.CALC_COMM_AGMT_DELETE_NA_GROUP,{
                    method:'POST',
                    data:{
						uuids: checked
                    } 
                })
                if(deleteData.success) {
					setSpinflag(false)
					setChecked([]);
					setUploadEdit ? setUploadEdit(true) : undefined;
					setToast({ alertStatus: 'alert-success', message: deleteData.message });
                } else {
					setSpinflag(false)
					setToast({ alertStatus: 'alert-error', message: deleteData.errorMessage });
                }
            }
        })   
    }
	return (
		<>
			{/* <Modal title={title} visible={isModalVisible} footer={null} width="100%" height="100%" onCancel={() => handleCancel()} maskClosable={false}> */}
			<CosModal cbsVisible={isModalVisible} cbsTitle={title} cbsFun={() => handleCancel()}>
				<CosToast toast={toast} />
				<div className="topBox" style={{ minWidth: '850px' }}>
					<Form onFinish={handleQuery} form={queryForm}>
						<Row>
							{/* 船东 */}
							<CosSelect span={6} disabled={commonFlag} name='shipownerCompanyCode' label={<div><span style={{color: 'red'}}>*</span><FormattedMessage id='lbl.carrier' /></div>} options={acquireData.values} />
							{/* 公司 */}
							<CosSelect showSearch={true} span={6} disabled={commonFlag} selectChange={selectChangeBtn} name='companyCode' label={<FormattedMessage id='lbl.company' />} options={companysData} />
							{/* 代理编码 */}
							<CosInputText capitalized={false} span={6} disabled name='agencyCode' label={<FormattedMessage id='lbl.agency' />} />
							{/* 协议代码 */}
							<CosInputText capitalized={false} span={6} disabled name='commissionAgreementCode' label={<FormattedMessage id='lbl.agreement' />} />
							{/* 开始日期 */}
							<CosDoubleDatePicker disabled={commonFlag ? [true, true] : [false, true]} span={6} name='Date' label={<div><span style={{color: 'red'}}>*</span><FormattedMessage id="lbl.start-date" /></div>} />
							{/* 协议类型 */}
							<CosSelect disabled={commonFlag} span={6} name='agreementType' label={<FormattedMessage id='lbl.protocol-type' />} options={agreement.values} />
							{/* Cross Booking */}
							<CosIptNumber defaultValue={0.0000} disabled={commonFlag} precision={6} max={999999} name='crossBookingPercent' label={<FormattedMessage id='lbl.cross' />}/>
							{/* 收取Cross Booking佣金 */}
							<CosSelect disabled={commonFlag} span={6} name='crossBookingIndicator' label={<FormattedMessage id='lbl.crosscommission' />} options={commission.values} />
							{/* Cross Booking模式 */}
							<CosSelect disabled={commonFlag} span={6} name='crossBookingMode' label={<FormattedMessage id='lbl.crosstype' />} options={pattern.values} />
							{/* 第三地佣金付费模式 */}
							<CosSelect disabled={commonFlag} span={6} name='payElsewhereMode' label={<FormattedMessage id='lbl.third' />} options={paidCommissionModel.values} />
							{/* All in Rate */}
							<CosIptNumber defaultValue={0.0000} disabled={commonFlag} precision={4} max={99999999} name='allInRate' label={<FormattedMessage id='lbl.rate' />}/>
							{/* 异地支付 */}
							<CosIptNumber defaultValue={0.0000} disabled={commonFlag} precision={6} max={999999} name='payElsewherePercent' label={<FormattedMessage id='lbl.payment' />}/>
							{/* 记账算法 */}
							<CosSelect disabled={commonFlag} span={6} name='postCalculationFlag' label={<div><span style={{color: 'red'}}>*</span><FormattedMessage id='lbl.arithmetic' /></div>} options={accountsArithmetic.values} />
							{/* 记账方式 */}
							<CosSelect disabled={commonFlag} span={6} name='postMode' label={<div><span style={{color: 'red'}}>*</span><FormattedMessage id='lbl.bookkeeping' /></div>} options={accountsWay.values} />
							{/* 向谁预估 */}
							<CosInputText capitalized={false} disabled={commonFlag} maxLength={10} span={6} name='ygSide' label={<FormattedMessage id='lbl.estimate' />} />
							{/* 向谁开票 */}
							<CosInputText capitalized={false} disabled={commonFlag} maxLength={10} span={6} name='yfSide' label={<FormattedMessage id='lbl.make' />} />
							{/* 向谁报账 */}
							<CosInputText capitalized={false} disabled={commonFlag} maxLength={10} span={6} name='sfSide' label={<FormattedMessage id='lbl.submitanexpenseaccount' />} />
							{/* 预提是否记账 */}
							<CosSelect disabled={commonFlag} span={6} name='isYt' label={<div><span style={{color: 'red'}}>*</span><FormattedMessage id='lbl.withholding' /></div>} options={ytBusiness.values} />
							{/* 应付实付是否记账 */}
							<CosSelect disabled={commonFlag} span={6} name='isBill' label={<div><span style={{color: 'red'}}>*</span><FormattedMessage id='lbl.actually' /></div>} options={yfBusiness.values} />
						</Row>
					</Form>
				</div>
				<div className="more-btn" style={{display: cssNone ? 'block' : 'none'}}>
					{
						btnData.map((val, idx) => {
							// return <CosButton style={{display: authState[idx]?'inline-block':'none'}} disabled={flag} onClick={() => {allBtn(idx)}} key={idx}>{val.icon}{val.label}</CosButton>
							return <CosButton disabled={flag} onClick={() => {allBtn(idx)}} key={idx}>{val.icon}{val.label}</CosButton>
						})
					}
				</div>
				<div className="groupBox budget-tracking">
					<Tabs onChange={callback} type="card" activeKey={defaultKey}>
						<TabPane tab={<FormattedMessage id='lbl.agreement-item' />} key="1">
							{/* <Button disabled={!stateFlags} style={{ marginLeft: '10px',display: cssNone ? 'block' : 'none' }} onClick={addItem}><PlusOutlined /></Button> */}
							<Button  style={{ margin: '0 0 5px 10px' }} onClick={addItem} disabled={!stateFlags}><PlusOutlined /></Button>
							<div className="table">
								<CosPaginationTable
									dataSource={dataSource}
									columns={addColumns}
									rowKey='id'
									setSelectedRows={setSelectedRows}
									rowSelection={{selectedRowKeys: [itemUuidFlag]}}
									pagination={false}
									selectionType='radio'
									scrollHeightMinus={200}
								/>
							</div>
							<div  hidden={showFlag} style={{width:'50%'}}>
								<div style={{ padding: '10px 0px 10px 10px' }}><FormattedMessage id='lbl.box-calculation-detailed' /></div>
								<Button disabled={!stateFlags} style={{ margin: '0 0 10px 10px',display: cssNone ? 'block' : 'none' }} onClick={addItemDetailed}><PlusOutlined /></Button>
								<CosPaginationTable
									dataSource={computingMethodData}
									columns={computingMethodColumns}
									pagination={false}
									rowKey="commissionContainerPriceUuid"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div>
						</TabPane>
						{/* 箱型尺寸组 */}
						<TabPane tab={<FormattedMessage id='lbl.group-message' />} key="2">
							<div style={{ width: '40%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
								<div><FormattedMessage id='lbl.maintain-group-message' /></div><br />
								<ul className="list" ref={boxSizeref}>
									<li style={{ height: 20 }}>
										<div><FormattedMessage id='lbl.operate'/></div>
										<div><FormattedMessage id='lbl.detailed'/></div>
										<div><FormattedMessage id='lbl.Box-size-group'/></div>
									</li>
									{commissionAgmtCntrSizeTypeGroups.map((item, index) => {
										return <li key={index}>
											<div>
												<a disabled={!stateFlags} onClick={() => editAddSuccessBoxSize(item)}><EditOutlined /></a>
												<a disabled={!stateFlags} onClick={() => deleteAddSuccessBoxSize(item)}><CloseCircleOutlined /></a>
												{/* <a disabled={!stateFlags} onClick={() => deleteAddSuccessBoxSize(item)}><CloseCircleOutlined  style={{ color: commonFlag ? '#ccc' : 'red' }} /></a> */}
											</div>
											<div><RightCircleOutlined className={openBoxSizedetailIndex == index ? "is-open-boxsize" : ""} onClick={() => openBoxSizedetail(index)} /></div>
											<div><RightCircleOutlined style={{ visibility: 'hidden' }} />{item && item.containerSizeTypeGroup || <small>&nbsp;</small>}</div>
											<ul style={{ display: openBoxSizedetailIndex === index ? 'block' : 'none' }}>
												<li style={{ height: 20 }}>
													<span></span>
													<div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.Box-size' /></div>
													<div style={{ background: '#95B3D7' }}><FormattedMessage id='lbl.cargo-class' /></div>
												</li>
												{item && item.containerCargoDetails.map((val, idx) => {
													return <li key={idx}>
														<span></span>
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
								<div><FormattedMessage id='lbl.box-size-add-frame' /></div>
								<div className='box-size-group-main'>
									<Form form={queryForm}>
										<Row className='box-size-group-main-input'>
											{/* <CosInputText span={10} disabled={!stateFlags} name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Box-size-group' />} />
											<CosSelect span={10} disabled={!stateFlags} name='yfBusiness' label={<FormattedMessage id='lbl.cargo-class' />} options={natureCode.values} /> */}
											<CosInputText span={10}  name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Box-size-group' />} disabled={!stateFlags || groupFlag}  isSpan={true} maxLength={4}/>
											<CosSelect span={10}  name='yfBusiness' label={<FormattedMessage id='lbl.cargo-class' />} options={natureCode.values} disabled={!stateFlags}  isSpan={true}/>
										</Row>
										<Row className='box-size-group-main-input'>

										</Row>
										<Row className='box-size-group-main-input'>
											<div className='box-size-group-main-input-left'>
												<div className='box-size'><FormattedMessage id='lbl.Box-size' /></div>
												<ul className='box-size-ul'>
													{
														groupInit ? groupInit.map((v, i) => {
															return <li onClick={() => changeIdx(i)} className={currentIndex == i ? 'current' : ''} key={i} style={{ height: '25px', lineHeight: '25px', cursor: 'pointer' }}><span>{v}</span></li>
														}) : ""
													}
												</ul>
											</div>
											<div className="box-size-group-main-input-center-button">
												<Button disabled={!stateFlags} onClick={rightBtn}><RightOutlined /></Button>
												<Button disabled={!stateFlags} onClick={addAllBoxDetail}><DoubleRightOutlined /></Button>
												<Button disabled={!stateFlags} onClick={deleteBoxSize}><LeftOutlined /></Button>
												<Button disabled={!stateFlags} onClick={deleteAllBoxDetail}><DoubleLeftOutlined /></Button>
												{/* <Button  onClick={rightBtn}><RightOutlined /></Button>
												<Button  onClick={addAllBoxDetail}><DoubleRightOutlined /></Button>
												<Button  onClick={deleteBoxSize}><LeftOutlined /></Button>
												<Button  onClick={deleteAllBoxDetail}><DoubleLeftOutlined /></Button> */}
											</div>
											<div className="box-size-group-main-input-bottom" >
												<div className='box-size-detail'><FormattedMessage id='lbl.Box-size-detailed' /></div>
												<CosPaginationTable
													dataSource={sizeDetailedTable}
													columns={sizeDetailedColumns}
													rowKey='id'
													scroll={{ y: 100 }}
													// setSelectedRows={getSelectedRows}
													pagination={false}
													scroll={{ y: 230 }}
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
											{/* <Col style={{ marginRight: '15px' }}><Button disabled={!stateFlags} onClick={saveBoxSize}><FormattedMessage id='lbl.preservation-box-size' /></Button></Col>
											<Col><Button disabled={!stateFlags} onClick={resetBoxSize}><FormattedMessage id='lbl.reset-box-size' /></Button></Col> */}
											<Col style={{ marginRight: '15px' }}><Button  onClick={saveBoxSize} disabled={!stateFlags}><FormattedMessage id='lbl.preservation-box-size' /></Button></Col>
											<Col><Button  onClick={resetBoxSize} disabled={!stateFlags}><FormattedMessage id='lbl.reset-box-size' /></Button></Col>
										</Row>
									</Form>
								</div>
							</div>
						</TabPane>
						{/* 维护NA组 */}
						<TabPane tab={<FormattedMessage id='lbl.maintain-na' />} key="3">
							<div style={{ width: '40%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
								<div><FormattedMessage id="lbl.maintain-na-message" /></div>
								<CosButton style={{ float: 'left' }} disabled={!stateFlags || !tableData.authSave} onClick={deleteNA} disabled={checked.length > 0 ? false : true}><FormattedMessage id='lbl.delete' /></CosButton>
								<CosPaginationTable
									rowKey="id"
									columns={columns}
									dataSource={boxData}
									pagination={false}
									scrollHeightMinus={200}
									rowSelection={{
										selectedRowKeys: checked,
										onChange: (key, row) => {
											setChecked(key);
										}
									}}
								/>
							</div>
							<div style={{ width: '58%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', verticalAlign: 'top', marginLeft: '2%', borderRadius: '10px' }}>
								<div><FormattedMessage id='lbl.maintain-na-add-frame' /></div>
								<Form form={queryForm}>
									<Row style={{ margin: '15px 0' }}>
										<CosInputText span={10} disabled={!stateFlags} name='groupCodeData' label={<FormattedMessage id='lbl.group' />} />
									</Row>
									 <Transfer
										dataSource={mockData}
										showSearch
										filterOption={filterOption}
										targetKeys={targetKeys}
										onChange={handleChange}
										onSearch={handleSearch}
										render={item => item.title}
										disabled={!stateFlags}
									/>
									<Row style={{ margin: '15px 0', float: 'right', marginRight: '10px' }}>
										<Col style={{ marginRight: '15px' }}><Button disabled={!stateFlags} onClick={saveMockData}><FormattedMessage id='lbl.save' /></Button></Col>
										<Col><Button onClick={resetNa} disabled={!stateFlags}><FormattedMessage id='lbl.reset' /></Button></Col>
									</Row>
								</Form>
							</div>
						</TabPane>
					</Tabs>
				</div>
			</CosModal>
			<Loading spinning={spinflag} />
		</>
	)
}
export default crAgmtEdit
