/*
 * @Author: Du hongzheng
 * @Date: 2021-11-05 14:20:31
 * @LastEditors: Du hongzheng
 * @LastEditTime: 2022-03-05 15:26:11
 * @Description: 查看详情、编辑、新增
 * @FilePath: /afcm-web/src/pages/commissions/agmt/commissionAgmtEdit.jsx
 */
// 查看详情、编辑、新增
import React, { useEffect, useState, $apiUrl } from 'react';
import { Modal, Button, Input, Form, Row, Col, Transfer, Tabs, Select, Tooltip, InputNumber } from 'antd';
import { FormattedMessage, formatMessage } from 'umi';
import request from '@/utils/request';
import InputText from '@/components/Common/InputText';
import IptNumber from '@/components/Common/IptNumber';
import SelectVal from '@/components/Common/Select';
import DoubleDatePicker from '@/components/Common/DoubleDatePicker'
import { momentFormat, acquireSelectData, companyAgency } from '@/utils/commonDataInterface';
import PaginationTable from "@/components/Common/PaginationTable";
import moment from 'moment';
import CosButton from '@/components/Common/CosButton'
import { Toast } from '@/utils/Toast'
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
import Loading from '@/components/Common/Loading'
import { CosToast } from '@/components/Common/index'

// 弹出窗口需要
const confirm = Modal.confirm
// tab切换
const { TabPane } = Tabs;

const CommissionAgmtEdit = (props) => {
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
		setStateFlag,
		agencyCodeDRF,		// 默认代理编码
		companyCodeDEF,		// 默认公司
		setUploadPageChange,    // 调用重新查询
		setUploadEdit = false,  // 调用重新编辑
		setCommMess,	// 添加外层提示
		setEditRecord,
	} = props.initData;
	const [natureCode, setNatureCode] = useState({});  // 货类
	const [calculationType, setCalculationType] = useState({}); // 计算类型
	const [commissionAgmtCntrSizeTypeGroups, setCommissionAgmtCntrSizeTypeGroups] = useState([])
	// const [btnsFlag, setBtnsFlag] = useState([]);
	const [boxData, setBoxData] = useState([])	// 维护NA组信息
	const [defaultKey, setDefaultKey] = useState('1');
	const [radioData, setRadioData] = useState({});		// 单选数据
	const [dataSource, setDataSource] = useState([]);
	const [spinflag, setSpinflag] = useState(false);     // 加载
	const [groupFlag, setGroupFlag] = useState(false);	// 仅供编辑group信息箱型尺寸组编辑修改尺寸组用
	const [objMessage, setObjMessage] = useState({});   // 提示信息对象
	const [checked, setChecked] = useState([]);		// 维护NA组多选数据的uuid

	const [proxyCode, setProxyCode] = useState(undefined);  //  代理编码
	const [selectAgencyCode, setSelectAgencyCode] = useState(true);  //  代理编码--解决保存后代理编码恢复初始值使用
	const [checkedGroup, setCheckedGroup] = useState([]);	// group多选

	// const [commAuthSave, setCommAuthSave] = useState(false);	// 资源编码控制是否页面可编辑
	//	--------------------------------------------------------------------------------------
	// this.setState({ mockData, targetKeys });

	// 佣金类型
	const [commissionType, setCommissionType] = useState([]);
	const [queryForm] = Form.useForm();

	useEffect(() => {
		// 新增时默认值
		isModalVisible && !writeRead ? getCommType() : undefined;
		if (isModalVisible && writeRead) {
			queryForm.setFieldsValue({
				agencyCode: agencyCodeDRF.agencyCode,	// 代理编码
				companyCode: companyCodeDEF,			// 公司
				shipownerCompanyCode: agencyCodeDRF.companyType == 0 ? agencyCodeDRF.companyCode : acquireData.defaultValue		// 船东
			})
			selectAgencyCode ? selectChangeBtn('', '', companyCodeDEF) : undefined;
		}

		var day2 = new Date();
		day2.setTime(day2.getTime());
		var s2 = day2.getFullYear() + "-" + (day2.getMonth() + 1) + "-" + day2.getDate();
		acquireSelectData('AFCM.AGMT.CARGO.NATURE.CODE', setNatureCode, $apiUrl);// 货类
		acquireSelectData('CB0046', setCalculationType, $apiUrl);// 计算类型
		addFlag ? setBtnFlag(true) : setBtnFlag(false);   // 是否禁用新增item
		let data = tableData.commissionAgmtItems;
		setDataSource(data);
		setCommissionAgreementCodeTxt(tableData.commissionAgreementCode);     // 协议代码
		tableData.commissionAgmtCntrSizeTypeGroups ? setCommissionAgmtCntrSizeTypeGroups(tableData.commissionAgmtCntrSizeTypeGroups) : []
		setUuid(tableData.agreementHeadUuid);
		setDisFlag(false);
		tableData.commissionAgmtNAGroups ? setBoxData(tableData.commissionAgmtNAGroups) : setBoxData([]);

		writeRead ? queryForm.setFieldsValue({
			Date: [moment(s2), moment(dateEnd)],
			// fromDate: '',
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
				Date: [moment(tableData.fromDate), moment(tableData.toDate)],
			})
		getData();
		// stateFlag();
		getNaData(headerUuid);
		setNaMockData();
		// tableData.agreementHeadUuid ? addItemFlag() : '';
	}, [dateEnd, tableData, addFlag, btnData, flag, headerUuid, commonFlag, btnIdx, isModalVisible, authState])
	const [saveFlag, setSaveFlag] = useState(true); // 保存编辑table数据
	const [btnFlag, setBtnFlag] = useState(true); // 是否禁用新增item
	const [commissionAgreementCodeTxt, setCommissionAgreementCodeTxt] = useState(''); // 协议代码
	const [uuid, setUuid] = useState(); // uuid
	const [groupInit, setGroupInit] = useState([]);
	const [targetKeys, settargetKeys] = useState([]);
	const [mockData, setmockData] = useState([]);
	const filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;

	// 贸易线数据
	const setNaMockData = () => {
		boxData.map((val, idx) => {
			mockData.map((v, i) => {
				if (mockData[i].title == boxData[idx].tradeLane) {
					mockData.splice(i, 1)
				}
			})
		})
		// console.log(mockData)
		setmockData([...mockData])
	}

	// 请求是为了佣金类型数据
	const getCommType = async () => {
		// console.log('测试为什么报错', uuid, '---', tableData.agreementHeadUuid);
		let newitem = await request($apiUrl.COMM_AGMT_NEW_ITEM_INIT, {
			method: "POST",
			data: {
				uuid: tableData.agreementHeadUuid
				// uuid
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

	const callback = (key) => {
		setObjMessage({});	// 清除弹窗
		setDefaultKey(key);
	}

	// 维护NA组信息
	const getNaData = async (id) => {
		setSpinflag(true)
		await request.post($apiUrl.COMM_AGMT_NEW_TYPE_NA_GROUP_INIT, {
			method: 'POST',
			data: {
				uuid: id
			}
		})
			.then((result) => {
				if (result.success) {
					setSpinflag(false)
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
					setSpinflag(false)
					setObjMessage({});	// 清除弹窗
				}
			})
	}

	const handleChange = targetKeys => {
		// this.setState({ targetKeys });
		settargetKeys([...targetKeys])
	};

	const handleSearch = (dir, value) => {
		value = value.toUpperCase();
		console.log('search:', dir, value.toUpperCase());
	};

	const [naData, setNaData] = useState([]);
	const saveNaData = () => {
		let dataIpt = queryForm.getFieldValue();
		mockData.map((val, idx) => {
			targetKeys.map((v, i) => {
				if (val.key == v) {
					naData.push({
						"agreementHeadUuid": tableData.agreementHeadUuid,
						"commissionAgreementCode": tableData.commissionAgreementCode,
						"groupCode": dataIpt.groupCodeData,
						"tradeLane": val.tradeLaneCode
					});
				}
			})
		})
		setNaData([...naData]);
	}

	const saveMockData = async () => {
		setObjMessage({});	// 清除弹窗
		let data = queryForm.getFieldValue().groupCodeData;
		setNaData([]);
		if (data ? data.length > 10 : false) {
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.comm-input' }) })
			return
		}
		if (data) {
			saveNaData();
			setSpinflag(true)
			let result = await request($apiUrl.COMM_AGMT_SAVE_NA_GROUP, {
				method: 'POST',
				data: {
					"paramsList": naData
				}
			})
			if (result.success) {
				setSpinflag(false)
				getNaData(headerUuid);
				let data = result.data;
				setBoxData([...data]);
				settargetKeys([]);
				setNaData([]);
				queryForm.setFieldsValue({
					groupCodeData: ''
				})
				// Toast('',formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false);
				setObjMessage({ alertStatus: 'alert-success', message: result.message });
			} else {
				setSpinflag(false)
				setNaData([]);
				setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
			}
		} else {
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Group-is-required' }) });
			// Toast('',formatMessage({id: 'lbl.Group-is-required'}), 'alert-error', 5000, false);
		}

	}

	// 状态
	// const stateFlag = () => {	
	// 	let flagD = [];
	// 	if(commonFlag) {
	// 		if(btnIdx == '0' || btnIdx == '1') {
	// 			flagD = [true, true, true, true, true, true, 'none', 'none', 'none', 'none', true, true, true];
	// 		} else if(btnIdx == '2' || btnIdx == '3'){
	// 			flagD = [true, true, 'none', 'none', 'none', 'none', true, true, true, true, 'none', 'none', true ];
	// 		}
	// 	} else {
	// 		if(btnIdx == '0' || btnIdx == '1') {
	// 			// console.log(tableData);
	// 			if(tableData.length == 0 || tableData.length) {	// 新建
	// 				flagD = [false, false, true, true, true, true, 'none', 'none', 'none', 'none', true, true, true ];
	// 			} else if(tableData.status == "D" || tableData.status == "W" || tableData.status == "U") {	// 待处理		
	// 				flagD = [!tableData.authSave, !tableData.authSubmit, !tableData.authPMDCheck, !tableData.authPMDUnlock, !tableData.authKACheck, !tableData.authAgencyUnlock, 'none', 'none', 'none', 'none', !tableData.authFADCheck, !tableData.authFADUnlock, !tableData.authCancel];
	// 			}
	// 		} else if(btnIdx == '2' || btnIdx == '3'){
	// 			if(tableData.length == 0) {	// 新建
	// 				flagD = [false, false, 'none', 'none', 'none', 'none', true, true, true, true, 'none', 'none', true ];
	// 			} else if(tableData.status == "D" || tableData.status == "W" || tableData.status == "U") {	// 待处理		
	// 				flagD = [!tableData.authSave, !tableData.authSubmit, 'none', 'none', 'none', 'none', !tableData.authWDCheck, true, !tableData.authShareCenterCheck, true, 'none', 'none', !tableData.authCancel];
	// 			}
	// 		}
	// 	}
	// 	setBtnsFlag([...flagD])
	// }

	// 新增箱型尺寸组始化
	const getData = async () => {
		await request.post($apiUrl.COMM_AGMT_NEW_TYPE_GROUP_INIT)
			.then((result) => {
				if (result.success) {
					let data = result.data;
					setGroupInit(data);
				} else {
					// setObjMessage({});	// 清除弹窗
					setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
				}
			})
	}

	// 公司与代理编码联动
	const selectChangeBtn = async (value, all, defData) => {
		setProxyCode([]);
		// queryForm.setFieldsValue({
		// 	agencyCode: undefined
		// 	// agencyCode: all.linkage.sapCustomerCode
		// })
		// console.log(all, all.linkage, all.linkage.sapCustomerCode)
		// companyAgency($apiUrl, )
		let data = [];
		defData ? data = defData : (data = all.linkage ? all.linkage.companyCode : []);
		// console.log(data)
		// await request.post(apiUrl[url] + '?key=' + key)
		await request.post($apiUrl.COMMON_COMPANY_QUERY_COMM + '?companyCode=' + data)
			.then((result) => {
				if (result.success) {
					result.data ? setProxyCode(result.data) : undefined;
					queryForm.setFieldsValue({
						agencyCode: result.data ? result.data[0].value : undefined
					})
				}
			})
	}

	{/* 保存, 提交审核, PMD审核, PMD解锁, 口岸审核, 口岸解锁, 网点审核, 网点解锁, 共享审核, 共享解锁, FAD审核, FAD解锁, 协议退回 */ }
	// authSave					保存
	// authSubmit				保存并提交审核
	// authPMDCheck				PMD审核
	// authPMDUnlock			PMD解锁
	// authKACheck				口岸审核
	// authAgencyUnlock			代理解锁--口岸解锁
	// authWDCheck				网点审核
	// authWDUnlock				网点解锁
	// authShareCenterCheck		共享中心审核
	// authShareCenterUnlock	共享解锁
	// authFADCheck				FAD审核
	// authFADUnlock			FAD解锁
	// authCancel				协议退回
	// const authData =[];
	const authData = [
		'AFCM_AGMT_COMM_001_B17',	// 保存
		'AFCM_AGMT_COMM_001_B18',	// 保存并提交审核
		'AFCM_AGMT_COMM_001_B06',	// PMD审核
		'AFCM_AGMT_COMM_001_B07',	// PMD解锁
		'AFCM_AGMT_COMM_001_B16',	// PMD协议退回
		'AFCM_AGMT_COMM_001_B08',	// 口岸审核
		'AFCM_AGMT_COMM_001_B09',	// 口岸解锁
		'AFCM_AGMT_COMM_001_B19',	// 口岸协议退回
		'AFCM_AGMT_COMM_001_B010',	// 网点审核
		'AFCM_AGMT_COMM_001_B11',	// 网点解锁
		'AFCM_AGMT_COMM_001_B20',	// 网点协议退回
		'AFCM_AGMT_COMM_001_B12',	// 共享审核
		'AFCM_AGMT_COMM_001_B13',	// 共享解锁
		'AFCM_AGMT_COMM_001_B21',	// 共享协议退回
		'AFCM_AGMT_COMM_001_B14',	// FAD审核
		'AFCM_AGMT_COMM_001_B15',	// FAD解锁
		'AFCM_AGMT_COMM_001_B22',	// FAD协议退回

	];
	const authState = [tableData.authSave, tableData.authSubmit, tableData.authPMDCheck, tableData.authPMDUnlock, tableData.authCancel,
	tableData.authKACheck, tableData.authAgencyUnlock, tableData.authKaCancel, tableData.authWDCheck, tableData.authWDUnlock, tableData.authWdCancel,
	tableData.authShareCenterCheck, tableData.authShareCenterUnlock, tableData.authGxCancel, tableData.authFADCheck, tableData.authFADUnlock, tableData.authFadCancel]
	const btnData = [
		[
			<SaveOutlined />,
			<FormattedMessage id='lbl.save' />,		// 保存	authSave
		], [
			<FileProtectOutlined />,
			<FormattedMessage id='btn.save-and-submit-for-review' />,	// 保存并提交审核	authSubmit
		], [
			<FileProtectOutlined />,
			<FormattedMessage id='lbl.pmd-audit' />,	// PMD审核
		], [
			<UnlockOutlined />,
			<FormattedMessage id='lbl.pmd-unlock' />,	// PMD解锁
		], [
			<ImportOutlined />,
			<FormattedMessage id='lbl.comm-pmd-back' />	// PMD协议退回
		], [
			<FileProtectOutlined />,
			<FormattedMessage id='lbl.port-audit' />,	// 口岸审核
		], [
			<UnlockOutlined />,
			<FormattedMessage id='lbl.port-unlock' />,	// 口岸解锁
		], [
			<ImportOutlined />,
			<FormattedMessage id='lbl.comm-port-back' />	// 口岸协议退回
		], [
			<FileProtectOutlined />,
			<FormattedMessage id='lbl.branch-audit' />,		// 网点审核
		], [
			<UnlockOutlined />,
			<FormattedMessage id='lbl.branch-unlock' />,	// 网点解锁
		], [
			<ImportOutlined />,
			<FormattedMessage id='lbl.comm-branch-back' />	// 网点协议退回
		], [
			<FileProtectOutlined />,
			<FormattedMessage id='lbl.share-audit' />,		// 共享审核
		], [
			<UnlockOutlined />,
			<FormattedMessage id='lbl.share-unlock' />,		// 共享解锁
		], [
			<ImportOutlined />,
			<FormattedMessage id='lbl.comm-share-back' />	// 共享协议退回
		], [
			<FileProtectOutlined />,
			<FormattedMessage id='lbl.fad-audit' />,		// FAD审核
		], [
			<UnlockOutlined />,
			<FormattedMessage id='lbl.fad-unlock' />,		// FAD解锁
		], [
			<ImportOutlined />,
			<FormattedMessage id='lbl.comm-fad-back' />	// FAD协议退回
		]
	];

	// const [dateEnd, setDateEnd] = useState('');
	{/* 保存, 保存并提交审核, PMD审核, PMD解锁, PMD协议退回, 口岸审核, 口岸解锁, 口岸协议退回, 网点审核, 网点解锁, 网点协议退回, 共享审核, 共享解锁, 共享协议退回, FAD审核, FAD解锁, FAD协议退回, 协议退回 */ }
	// PMD协议退回    PMD_CANCEL
	// 口岸协议退回     KA_CANCEL 
	// FAD协议退回     FAD_CANCEL
	// 网点协议退回     WD_CANCEL
	// 共享协议退回     GX_CANCEL  
	// 通过下标判断button
	const allBtn = (idx) => {
		let data = queryForm.getFieldValue();
		setObjMessage({});	// 清除弹窗
		switch (idx) {
			case 0:	// 保存
				handleQuery(data, 'SAVE', 'COMM_AGMT_PRE_SAVE_SUBMIT');
				break;
			case 1:	// 保存并提交审核
				handleQuery(data, 'SUBMIT', 'COMM_AGMT_PRE_SAVE_SUBMIT');
				break;
			case 2:	// PMD审核
				commonBtns(data, 'PMD_APPROVE', 'COMM_AGMT_APPROVE');
				break;
			case 3:	// PMD解锁
				commonBtns(data, 'PMD_UNLOCK', 'COMM_AGMT_UNLOCK', 'COMMISSION');
				break;
			case 4:	// PMD协议退回
				commonBtns(data, 'PMD_CANCEL', 'COMM_AGMT_CANCEL');
				break;
			case 5:	// 口岸审核
				commonBtns(data, 'KA_APPROVE', 'COMM_AGMT_APPROVE');
				break;
			case 6:	// 口岸解锁
				commonBtns(data, 'KA_UNLOCK', 'COMM_AGMT_UNLOCK', 'COMMISSION');
				break;
			case 7:	// 口岸协议退回
				commonBtns(data, 'KA_CANCEL', 'COMM_AGMT_CANCEL');
				break;
			case 8:	// 网点审核
				commonBtns(data, 'WD_APPROVE', 'COMM_AGMT_APPROVE');
				break;
			case 9:	// 网点解锁
				commonBtns(data, 'WD_UNLOCK', 'COMM_AGMT_UNLOCK', 'COMMISSION');
				break;
			case 10:	// 网点协议退回
				commonBtns(data, 'WD_CANCEL', 'COMM_AGMT_CANCEL');
				break;
			case 11:	// 共享审核
				commonBtns(data, 'FAD_APPROVE', 'COMM_AGMT_APPROVE');
				break;
			case 12:	// 共享解锁
				commonBtns(data, 'FAD_UNLOCK', 'COMM_AGMT_UNLOCK', 'COMMISSION');
				break;
			case 13:	// 共享协议退回
				commonBtns(data, 'GX_CANCEL', 'COMM_AGMT_CANCEL');
				break;
			case 14:	// FAD审核
				commonBtns(data, 'FAD_APPROVE', 'COMM_AGMT_APPROVE');
				break;
			case 15:	// FAD解锁
				commonBtns(data, 'FAD_UNLOCK', 'COMM_AGMT_UNLOCK', 'COMMISSION');
				break;
			case 16:	// FAD协议退回
				commonBtns(data, 'FAD_CANCEL', 'COMM_AGMT_CANCEL');
				break;
		}
	}
	// 审核btn 解锁btn 协议退回
	const commonBtns = async (val, key, url, unlock) => {
		setSpinflag(true)
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
					commissionAgreementCode: tableData.commissionAgreementCode,
					agreementType: unlock ? unlock : undefined,
				}
			}
		})
		if (result.success) {
			// Toast('',result.message, 'alert-success', 5000, false)
			setSpinflag(false)
			// setObjMessage({alertStatus: 'alert-success', message: result.message});
			setIsModalVisible(false); // 关闭弹窗
			if (setUploadPageChange) {
				setUploadPageChange(true); 	// 调用查询
				setCommMess(result.message);	// 外层提示信息
			} else {
				Toast(result.message, '', 'alert-success', 5000, false)
			}
		} else {
			setSpinflag(false)
			setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
			// setObjMessage({});	// 清除弹窗
		}
	}

	// 新增item调用
	const addItemFlag = async () => {
		setObjMessage({});	// 清除弹窗
		let uuids = radioData.commissionTypeItemUuid;
		if (itemUuidFlag == uuids && radioData.calculationMethod == "CNT") {
			// 	record.calculationMethod == "CNT" ? setDisFlag(true) : setDisFlag(false);
			setDisFlag(true);
			FunBtnFlag(radioData);
			// alert(1)
		} else if (itemUuidFlag == uuids && radioData.calculationMethod == "PCT") {
			// alert(2)
			setDisFlag(false);
		}
		let newitem = await request($apiUrl.COMM_AGMT_NEW_ITEM_INIT, {
			method: "POST",
			data: {
				uuid: tableData.agreementHeadUuid
			}
		})
		if (newitem.success) {
			// setItemUuidFlag('');
			let data = newitem.data;
			let commission = data.chargeCodeData.values || [];
			commission.map((val, idx) => {
				val.value = val.value;
				val.label = val.value + '(' + val.label + ')';
			})
			setCommissionType(commission);
			data.saveShowHide = true
			dataSource.push(data);
			setDataSource([...dataSource]);
		} else {
			setObjMessage({});	// 清除弹窗
		}
	}
	// 新增Item
	const addItem = () => {
		setObjMessage({});	// 清除弹窗
		// console.log(stateFlags)
		let len = dataSource ? dataSource.length : 0;
		if (len == 0) {
			setDataSource([]);
			console.log(dataSource);
			addItemFlag();
		} else {
			setObjMessage({});	// 清除弹窗
			let itemid = dataSource[len - 1].commissionTypeItemUuid;
			// itemid ? addItemFlag() : Toast('',formatMessage({id: 'lbl.save-add-item'}), 'alert-error', 5000, false);
			itemid ? addItemFlag() : setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item' }) });
		}
	}

	// item保存
	const tableSave = async (record, index) => {
		setObjMessage({});	// 清除弹窗
		console.log(record.calculationMethod);
		let DataFlag;
		// record.calculationMethod == 'PCT' ? DataFlag = (!record.porCountry || !record.fndCountry || !record.officeType || !record.officeCode || !record.oftPc || !record.commissionType || !record.socEmptyIndicator || !record.percentage) : DataFlag = (!record.porCountry || !record.fndCountry || !record.officeType || !record.officeCode || !record.oftPc || !record.commissionType || !record.socEmptyIndicator);
		console.log(DataFlag)
		if (DataFlag) {
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: record.calculationMethod == 'PCT' ? 'lbl.comm-item' : 'lbl.Please-enter-required-options' }) });
			// Toast('',formatMessage({id: record.calculationMethod == 'PCT' ? 'lbl.comm-item' : 'lbl.Please-enter-required-options'}), 'alert-error', 5000, false)
		} else {
			let len = computingMethodData.length - 1;
			if (computingMethodData[len]) {
				if (computingMethodData[len].commissionContainerPriceUuid ? false : true) {
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
			setSpinflag(true)
			await request($apiUrl.COMM_AGMT_SAVE_ITEM, {
				method: 'POST',
				data: {
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
						commissionAgmtCntrPrices: computingMethodData,
						saveShowHide: false,
					},
				}
			}).then((result) => {
				if (result.success) {
					setSpinflag(false)
					let data = result.data;
					setItemUuidFlag('');
					setComputingMethodData(data.commissionAgmtCntrPrices);
					// dataSource[index].saveShowHide = false;
					dataSource.splice(index, 1, data);
					setDataSource([...dataSource]);
					console.log(data, dataSource, index, computingMethodData);
					setDisFlag(false);
					// Toast('',formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false)
					setUploadEdit ? setUploadEdit(true) : undefined;
					setItemUuidFlag('');
					setObjMessage({ alertStatus: 'alert-success', message: result.message });
				} else {
					setSpinflag(false)
					setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
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
	//   let data=result.data.commissionAgmtItems
	//   // data.map((v,i)=>{
	//   //     v.saveShowHide=true
	//   // })
	//   setDataSource([...data])
	// }

	//删除item项
	const deleteItem = async (text, record, index) => {
		setObjMessage({});	// 清除弹窗
		const confirmModal = confirm({
			title: formatMessage({ id: 'lbl.delete-item' }),
			content: formatMessage({ id: 'lbl.Confirm-deletion' }),
			okText: formatMessage({ id: 'lbl.confirm' }),
			okType: 'danger',
			closable: true,
			cancelText: '',
			onOk() {
				confirmModal.destroy()
				setSpinflag(true);
				if (!record.agreementHeadUuid) {
					setSpinflag(false);
					dataSource.splice(index, 1)
					setDataSource([...dataSource])
				} else {
					deleteItemFun(record, index)
				}
				setDisFlag(false);
				setItemUuidFlag('');
			}
		})
	}
	const deleteItemFun = async (record, index) => {
		let deletes = await request($apiUrl.COMM_AGMT_DELETE_ITEM_UUID, {
			method: "POST",
			data: {
				'uuid': record.commissionTypeItemUuid
			}
		})
		if (deletes.success) {
			setSpinflag(false);
			dataSource.splice(index, 1)
			setDataSource([...dataSource])
			// if(record.commissionTypeItemUuid == itemUuidFlag) {
			// 	setDisFlag(false);
			// }
			setObjMessage({ alertStatus: 'alert-success', message: deletes.message });
		} else {
			setSpinflag(false);
			setObjMessage({ alertStatus: 'alert-error', message: deletes.errorMessage });
		}
	}

	// 编辑item
	const compileBtn = (text, record, index) => {
		setObjMessage({});	// 清除弹窗
		let data = dataSource;
		console.log(data);
		data[index].saveShowHide = true;
		setDataSource([...data]);
		console.log(text, record, index, tableData);
	}


	// 编辑箱量计算方法
	const boxCompileBtn = (text, record, index) => {
		setObjMessage({});	// 清除弹窗
		let data = computingMethodData;
		data[index].saveShowHide = true;
		setComputingMethodData([...data]);
		console.log(record.saveShowHide, tableData, index);
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
						<a disabled={!stateFlags || !tableData.authSave} onClick={() => deleteItem(text, record, index)}><CloseCircleOutlined style={{ color: !stateFlags || !tableData.authSave ? '#ccc' : 'red' }} /></a>&nbsp;
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.save' />}>
						{/* 保存 commonFlag */}
						<a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={!stateFlags || !tableData.authSave} onClick={() => tableSave(record, index)}><FileDoneOutlined /></a>
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.edit' />}>
						{/* 编辑 */}
						<a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={!stateFlags || !tableData.authSave} onClick={() => compileBtn(text, record, index)}><FormOutlined /></a>&nbsp;
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
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'oftPc')} name='oftPc' options={toPayInAdvance} /> : (toPayInAdvance.map((v, i) => {
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
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionType')} name='commissionType' options={commissionType} /> : commissionType.map((v, i) => {
						return text == v.value ? <span>{v.label}</span> : undefined
					})}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.The-Commission' />,      // 佣金模式
			dataIndex: 'commissionMode',
			sorter: false,
			width: 120,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionMode')} name='commissionBasedModel' options={[{ label: '', value: '' }, ...commissionBasedModel]} /> : text}
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
			align: 'right',
			width: 120,
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
					{record.saveShowHide ? <Select flag={true} defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'commissionCurrencyCode')} name='currCode' options={[{ label: '', value: '' }, ...currCode]} /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Cross-Booking-adjustment-rate' />,     // Cross Booking调整比率
			dataIndex: 'crossBookingAdjustment',
			sorter: false,
			align: 'right',
			width: 200,
			render: (text, record) => {
				return <div>
					{record.saveShowHide ? <InputNumber defaultValue={text} precision={6} min={0} max={999999} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'crossBookingAdjustment', true)} name='payElsewherePercent' /> : text}
				</div>
			}
		}, {
			title: <FormattedMessage id='lbl.Freight-tax' />,      // 运输税
			dataIndex: 'oftTaxPercent',
			sorter: false,
			align: 'right',
			width: 120,
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
					{record.saveShowHide ? <Select defaultValue={text} onChange={(e) => getCommonSelectVal(e, record, 'vatFlag')} name='vatFlag' options={[{ label: '', value: '' }, ...vatFlag]} /> : vatFlag.map((v, i) => {
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
						<a disabled={!stateFlags || !tableData.authSave} onClick={() => deleteBoxCalculationDetailed(text, record, index)}><CloseCircleOutlined style={{ color: !stateFlags || !tableData.authSave ? '#ccc' : 'red' }} /></a>&nbsp;
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.save' />}>
						<a style={{ display: record.saveShowHide ? 'inline-block' : 'none' }} disabled={!stateFlags || !tableData.authSave} onClick={() => boxTableSave(record, index)}><FileDoneOutlined /></a>
					</Tooltip>&nbsp;
					<Tooltip title={<FormattedMessage id='btn.edit' />}>
						<a style={{ display: record.saveShowHide ? 'none' : 'inline-block' }} disabled={!stateFlags || !tableData.authSave} onClick={() => boxCompileBtn(text, record, index)}><FormOutlined /></a>&nbsp;
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
			render: (text, record) => {
				return <div>
					{/* {record.saveShowHide ? <Input defaultValue={record.unitPrice} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'unitPrice')} name='unitPrice' /> : text} */}
					{record.saveShowHide ? <InputNumber min={0} defaultValue={record.unitPrice} autoComplete="off" onChange={(e) => getCommonIptVal(e, record, 'unitPrice', true)} name='unitPrice' /> : text}
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
		setObjMessage({});	// 清除弹窗
		if (!record.containerSizeTypeGroup.trim()) {
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Please-enter-required-options' }) });
			// Toast('', formatMessage({id: 'lbl.Please-enter-required-options'}), 'alert-error', 5000, false)
		} else {
			// console.log('来个判断吧', itemUuidFlag);
			if (itemUuidFlag) {
				let json = {
					agreementHeadUuid: uuid,
					commissionTypeItemUuid: itemUuidFlag,
					commissionAgreementCode: commissionAgreementCodeTxt,
					containerSizeTypeGroup: record.containerSizeTypeGroup,  // 箱型尺寸组
					commissionCurrencyCode: record.commissionCurrencyCode,  // 币种
					unitPrice: record.unitPrice,  // 计算价格
					unitPriceType: record.unitPriceType,  // 计算类型
					commissionContainerPriceUuid: record.commissionContainerPriceUuid,
					porCountry: itemRecord.porCountry,	// POR国家/地区
					fndCountry: itemRecord.fndCountry,	// FND国家/地区
					officeType: itemRecord.officeType,	// office类型
					officeCode: itemRecord.officeCode,	// office
					oftPc: itemRecord.oftPc,	// 预到付
					commissionType: itemRecord.commissionType,	// 用尽类型
					socEmptyIndicator: itemRecord.socEmptyIndicator,	// SOC空箱标记
					saveShowHide: false
				};
				setSpinflag(true)
				const result = await request($apiUrl.COMM_AGMT_SAVE_CNTR_PRICE, {
					method: 'POST',
					data: {
						params: json
					}
				})
				// commonBtn(itemUuid)
				if (result.success) {
					setSpinflag(false)
					let data = result.data;
					computingMethodData.splice(index, 1, data);
					radioData.commissionAgmtCntrPrices = computingMethodData;
					// computingMethodData.push(data);
					// computingMethodData[index].saveShowHide = false;
					console.log('splice', computingMethodData)
					setComputingMethodData([...computingMethodData]);

					// Toast('',formatMessage({id: 'lbl.save-successfully'}), 'alert-success', 5000, false)
					setObjMessage({ alertStatus: 'alert-success', message: result.message });
				} else {
					setSpinflag(false)
					setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
				}
			} else {
				setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-item-box-detailed' }) });
				// Toast('', formatMessage({id: 'lbl.save-add-item-box-detailed'}), 'alert-error', 5000, false)
			}
			// console.log(result, '箱量保存');
			// console.log(record, index, json, '数据对比');
		}
	}

	// 箱量计算方法明细-数据
	const [computingMethodData, setComputingMethodData] = useState([]);
	// item的uuid用来判断箱量计算方法明细
	const [itemUuidFlag, setItemUuidFlag] = useState('');

	// table select
	const getCommonSelectVal = (e, record, name, flag) => {
		// setItemUuid(val.agreementHeadUuid);  // 
		console.log('对比', record);
		record[name] = e;
		console.log(flag, 'calculationMethod');
		let uuids = record.commissionTypeItemUuid;  // item的uuid
		if (flag) {
			// setItemUuidFlag(uuids);  // item的uuid
			// if(!flag && itemUuidFlag == uuids){
			// console.log(itemUuidFlag,uuids,itemUuidFlag == uuids && record.calculationMethod == "CNT",itemUuidFlag == uuids && record.calculationMethod == "PCT")
			if (itemUuidFlag == uuids && record.calculationMethod == "CNT") {
				// 	record.calculationMethod == "CNT" ? setDisFlag(true) : setDisFlag(false);
				setDisFlag(true);
				FunBtnFlag(record);
			} else if (itemUuidFlag == uuids && record.calculationMethod == "PCT") {
				setDisFlag(false);
			}
		}
	}
	// value={this.state.value}
	const [valueIpt, setValueIpt] = useState();
	// table input
	const getCommonIptVal = (e, record, name, flag) => {
		flag ? record[name] = e : record[name] = e.target.value;
		console.log(e, record)
	}

	// 删除成功后重新调用编辑
	// const commonBtn = async(uuid, index) => {
	//   const result = await request($apiUrl.COMM_SEARCH_PRE_HEAD_DETAIL,       
	//       {
	//           method:'POST',
	//           data: {
	//               uuid: uuid
	//           }
	//       }
	//     )
	//     // let data=result.data.commissionAgmtItems;
	//     // setDataSource([...data])
	//     let dataArr = result.data.commissionAgmtItems[0].commissionAgmtCntrPrices;
	//     // dataArr.map((v, i) => {
	//     //   v.saveShowHide = true;
	//     // })
	//     setComputingMethodData(dataArr);  // item箱量计算方法明细的data
	//   }
	const deleteBoxDetailedFun = async (record, index) => {
		setSpinflag(true)
		await request.post($apiUrl.COMM_AGMT_DELETE_CNTR_PRICE_UUID, {
			method: 'POST',
			data: {
				uuid: record.commissionContainerPriceUuid
			}
		})
			.then((result) => {
				let data = result;
				if (data.success) {
					setSpinflag(false)
					console.log(data);
					computingMethodData.splice(index, 1)
					radioData.commissionAgmtCntrPrices = computingMethodData;
					setComputingMethodData([...computingMethodData])
					setObjMessage({ alertStatus: 'alert-success', message: result.message });
				} else {
					setSpinflag(false)
					// setObjMessage({});	// 清除弹窗
					setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
				}
			})
	}

	// 删除箱量计算方法明细数据
	const deleteBoxCalculationDetailed = async (text, record, index) => {
		// console.log(record)
		setObjMessage({});	// 清除弹窗
		const confirmModal = confirm({
			title: formatMessage({ id: 'lbl.delete-box-detailed' }),
			content: formatMessage({ id: 'lbl.delete-box-size' }) + record.containerSizeTypeGroup + formatMessage({ id: 'lbl.de-data' }),
			okText: formatMessage({ id: 'lbl.confirm' }),
			okType: 'danger',
			closable: true,
			cancelText: '',
			onOk() {
				confirmModal.destroy()
				if (!record.commissionContainerPriceUuid) {
					computingMethodData.splice(index, 1)
					setComputingMethodData([...computingMethodData])
				} else {
					deleteBoxDetailedFun(record, index)
				}
			}
		})
	}

	const [disFlag, setDisFlag] = useState(false);  // 箱量计算方法明细显示隐藏
	const [itemUuid, setItemUuid] = useState('');   // 箱量计算方法明细初始化的id
	const [detailedSize, setDetailedSize] = useState([]);  // 箱型尺寸组数据

	const FunBtnFlag = (val, flag) => {
		console.log(val);
		// val.agreementHeadUuid ? setBtnFlag(false) : setBtnFlag(true);
		let dataArr = val.commissionAgmtCntrPrices;

		let len = dataArr.length - 1;
		if (dataArr[len]) {
			if (!dataArr[len].commissionContainerPriceUuid) {
				dataArr.splice(len, 1);
			}
		}
		dataArr.map((v, i) => {
			v.saveShowHide = false;
		})
		console.log(dataArr)
		setComputingMethodData([...dataArr]);  // item箱量计算方法明细的data
		console.log('splice', computingMethodData)

	}
	const [itemRecord, setItemRecord] = useState([]);
	// 协议item的单选
	const setSelectedRows = async (val) => {
		setObjMessage({});	// 清除弹窗
		console.log('单选', val, val.calculationMethod, val.commissionTypeItemUuid)
		setRadioData(val);
		// console.log(val);
		if (val.calculationMethod == "CNT") {  // 判断item是否是计算方法  and  select数据
			setDisFlag(true)
		} else {
			setDisFlag(false);
		}
		setItemUuidFlag(val.commissionTypeItemUuid);  // item的uuid
		// setItemUuid(tableData.agreementHeadUuid);  // 
		console.log(val.commissionTypeItemUuid, itemUuidFlag)
		setItemRecord(val);
		// console.log('测试3', val)
		btnFlag ? FunBtnFlag(val, false) : FunBtnFlag(val, true)
		await request.post($apiUrl.COMM_AGMT_NEW_TYPE_CONT_PRICE_INIT, {
			method: 'POST',
			data: {
				uuid: tableData.agreementHeadUuid
			}
		})
			.then((result) => {
				if (result.success) {
					let data = result.data;
					setDetailedSize(data);
				} else {
					setObjMessage({});	// 清除弹窗
				}
			})
	}

	// const [dataArr, setDataArr] = useState([]);   // 箱量计算方法明细数据
	// 箱量计算方法明细-添加
	const commonPrice = async () => {
		setObjMessage({});	// 清除弹窗
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
			commissionContainerPriceUuid: ''
		}

		computingMethodData.push(json);
		setComputingMethodData([...computingMethodData]);
		console.log(computingMethodData);
	}

	// 新建箱量计算方法明细
	const addItemDetailed = async () => {
		setObjMessage({});	// 清除弹窗
		let len = computingMethodData.length;
		if (len == 0) {
			commonPrice();
		} else {
			computingMethodData[len - 1].commissionContainerPriceUuid ? commonPrice() : setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.save-add-data' }) });
			// computingMethodData[len - 1].commissionContainerPriceUuid ? commonPrice() : Toast('', formatMessage({id: 'lbl.save-add-data'}), 'alert-error', 5000, false);
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
		setObjMessage({});	// 清除弹窗
		// setSaveFlag(false);
		// console.log(val.toDate,val.fromDate)val.companyCode
		console.log(val.Date[0] ? momentFormat(val.Date[0]) : undefined)
		console.log((val.Date[0] ? momentFormat(val.Date[0]) : undefined) == undefined)
		console.log(val?.ygSide?.length > 10)
		console.log(val?.yfSide?.length > 10)
		console.log(val?.sfSide?.length > 10)
		if ((val.Date[0] ? momentFormat(val.Date[0]) : undefined) == undefined || val?.ygSide?.length > 10 || val?.yfSide?.length > 10 || val?.sfSide?.length > 10) {
			let messages;
			switch (true) {
				case (val.Date[0] ? momentFormat(val.Date[0]) : undefined) == undefined: messages = 'lbl.afcm-comm-save-mes-1'; break;
				case val?.ygSide?.length > 10 || val?.yfSide?.length > 10 || val?.sfSide?.length > 10: messages = 'lbl.afcm-comm-save-mes-2'; break;
			}
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: messages }) });
			// if(!val.shipownerCompanyCode || !val.fromDate || !val.toDate || !val.postCalculationFlag || !val.postMode || !val.isYt || !val.isBill) {
			// 	Toast('', formatMessage({id: 'lbl.Please-enter-required-options'}), 'alert-error', 5000, false)
			// 	console.log(!val.shipownerCompanyCode || !val.fromDate || !val.toDate || !val.postCalculationFlag || !val.postMode || !val.isYt || !val.isBill);
			// 	console.log(val.shipownerCompanyCode, momentFormat(val.fromDate), momentFormat(val.toDate), val.postCalculationFlag, val.postMode, val.isYt, val.isBill)
		} else {
			let data = dataSource;
			let tengkui = [...sizeDetailedTable];
			let GroupLen = queryForm.getFieldValue();
			let TypeGroup = GroupLen.containerSizeTypeGroup ? GroupLen.containerSizeTypeGroup.trim() : undefined;
			if (tengkui.length ? (TypeGroup == undefined || TypeGroup.length > 5) : false) {
				setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.box-size-Goods-category-required' }) });
			} else {
				// ----------------注释导致保存不成功
				if (data) {
					dataSource.map((v, i) => {
						if (v.commissionTypeItemUuid == itemUuidFlag) {
							v.commissionAgmtCntrPrices = computingMethodData
						}
					})

					data.map((val, idx) => {
						val.commissionAgmtCntrPrices.map((v, i) => {
							let len = val.commissionAgmtCntrPrices.length - 1;
							if (val.commissionAgmtCntrPrices[len].commissionContainerPriceUuid ? false : true) {
								val.commissionAgmtCntrPrices[len].porCountry = val.porCountry;
								val.commissionAgmtCntrPrices[len].fndCountry = val.fndCountry;
								val.commissionAgmtCntrPrices[len].officeType = val.officeType;
								val.commissionAgmtCntrPrices[len].officeCode = val.officeCode;
								val.commissionAgmtCntrPrices[len].oftPc = val.oftPc;
								val.commissionAgmtCntrPrices[len].commissionType = val.commissionType;
								val.commissionAgmtCntrPrices[len].socEmptyIndicator = val.socEmptyIndicator;
								// val.commissionAgmtCntrPrices[len].saveShowHide = false
								// setComputingMethodData([...computingMethodData]);
								// console.log('成功', computingMethodData);
							}
							// data.
							// console.log(val.commissionAgmtCntrPrices[len].commissionContainerPriceUuid)
							// console.log(val.commissionAgmtCntrPrices[len].commissionContainerPriceUuid? false : true, len)
						})
					})
					setDataSource([...data]);
				}

				// if (data != undefined) {
				// 	data.map((v, i) => {
				// 		v.saveShowHide = false;
				// 	})
				// 	setDataSource(data);
				// }

				// -----------------containerSizeTypeGroup
				tengkui = tengkui.map((item) => {
					item['agreementHeadUuid'] = uuid
					item['commissionAgreementCode'] = commissionAgreementCodeTxt
					item['containerSizeTypeGroup'] = val.containerSizeTypeGroup
					// delete item.id
					console.log(item)
					return item

				})
				saveNaData();
				setNaMockData();
				let we = val ? val.companyCode : '';
				// let ind = str.indexOf('-');
				// let we = str ? str.substring(0, (ind == -1 ? 4 : ind)) : null;
				// console.log(str,'---', we)
				setSpinflag(true);
				console.log(val.Date, val.Date[0])
				await request($apiUrl[url], {
					method: 'POST',
					data: {
						operateType: key,
						page: {
							current: 0,
							pageSize: 0
						},
						paramsList: [{
							fromDate: val.Date[0] ? momentFormat(val.Date[0]) : undefined,
							toDate: momentFormat(val.Date[1]),
							commissionAgmtItems: dataSource,
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
							commissionAgmtCntrSizeTypeGroups: tengkui,
							commissionAgmtNAGroups: naData,
							groupAgreementCode: val.groupAgreementCode
						}]
					}
				}).then((result) => {
					if (result.success) {
						setSelectAgencyCode(false);	// 	代理编码--解决保存后代理编码恢复初始值使用
						if (data) {
							dataSource.map((v, i) => {
								if (v.commissionTypeItemUuid == itemUuidFlag) {
									v.commissionAgmtCntrPrices = computingMethodData
								}
							})

							data.map((val, idx) => {
								val.commissionAgmtCntrPrices.map((v, i) => {
									let len = val.commissionAgmtCntrPrices.length - 1;
									if (val.commissionAgmtCntrPrices[len].commissionContainerPriceUuid ? false : true) {
										val.commissionAgmtCntrPrices[len].porCountry = val.porCountry;
										val.commissionAgmtCntrPrices[len].fndCountry = val.fndCountry;
										val.commissionAgmtCntrPrices[len].officeType = val.officeType;
										val.commissionAgmtCntrPrices[len].officeCode = val.officeCode;
										val.commissionAgmtCntrPrices[len].oftPc = val.oftPc;
										val.commissionAgmtCntrPrices[len].commissionType = val.commissionType;
										val.commissionAgmtCntrPrices[len].socEmptyIndicator = val.socEmptyIndicator;
										val.commissionAgmtCntrPrices[len].saveShowHide = false
										// setComputingMethodData([...computingMethodData]);
										// console.log('成功', computingMethodData);
									}
									// data.
									console.log(val.commissionAgmtCntrPrices[len].commissionContainerPriceUuid)
									console.log(val.commissionAgmtCntrPrices[len].commissionContainerPriceUuid ? false : true, len)
								})
							})
							setDataSource([...data]);
						}

						setStateFlag(true);
						setItemUuidFlag('');
						setSpinflag(false);
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
						setTableData(data);
						data.commissionAgmtItems == null ? setDataSource([]) : '';
						setSizeDetailedTable([])
						setSizeDetailedSelectedRows([])
						setNewSizeDetailedTable([])
						settargetKeys([]);
						setNaData([]);
						getNaData(headerUuid);
						setGroupFlag(false)
						setObjMessage({ alertStatus: 'alert-success', message: result.message });
						// queryForm.setFieldsValue({
						// 	...data,
						// 	fromDate: moment(data.fromDate),
						// 	toDate: moment(data.toDate),
						// })
						// console.log(data.fromDate)
						// console.log('确认有无数据', dataSource);
						queryForm.setFieldsValue({
							containerSizeTypeGroup: '',
							yfBusiness: ''
						})
						setEditRecord(data);
						if (key == 'SUBMIT') {
							setIsModalVisible(false); // 关闭弹窗
							setUploadPageChange ? setUploadPageChange(true) : Toast(result.message, '', 'alert-success', 5000, false);
							setCommMess(result.message);	// 外层提示信息
						}
					} else {
						setNaData([]);
						setSpinflag(false);
						setObjMessage({ alertStatus: 'alert-error', message: result.errorMessage });
					}
				})
			}
		}
	}

	// 维护NA组
	const columns = [
		// {
		// 	title: <FormattedMessage id="lbl.operate" />,//操作
		// 	dataIndex: 'operation',
		// 	sorter: false,
		// 	width: 100,
		// 	align: 'center',
		// 	fixed: true,
		// 	render: (text, record, index) => {
		// 		return <div>
		// 			<Tooltip title={<FormattedMessage id='btn.delete' />}>
		// 				<a disabled={!stateFlags} onClick={() => deleteNA(text, record, index)}><CloseCircleOutlined style={{ color: !stateFlags ? '#ccc' : 'red' }} /></a>&nbsp;
		// 			</Tooltip>&nbsp;
		// 		</div>
		// 	}
		// },
		{
			title: <FormattedMessage id='lbl.Trade-line' />,	// 贸易线
			dataIndex: 'tradeLane',
			key: 'tradeLane',
			align: "center"
		},
		{
			title: <FormattedMessage id='lbl.group' />,	// 组
			dataIndex: 'groupCode',
			key: 'groupCode',
			align: "center"
		}]

	// 维护NA组删除
	const deleteNA = async (text, record, index) => {
		setObjMessage({});	// 清除弹窗
		const confirmModal = confirm({
			title: formatMessage({ id: 'lbl.afcm_comm_na_delete' }),
			content: formatMessage({ id: 'lbl.afcm_comm_na_delete_txt' }),
			okText: formatMessage({ id: 'lbl.confirm' }),
			okType: 'danger',
			closable: true,
			cancelText: '',
			async onOk() {
				confirmModal.destroy()
				setSpinflag(true)
				await request($apiUrl.COMM_AGMT_DELETE_TYPE_NA_GROUP_INIT, {
					method: 'POST',
					data: {
						uuids: checked
					}
				}).then((res) => {
					if (res.success) {
						setChecked([]);
						setSpinflag(false);
						setUploadEdit ? setUploadEdit(true) : undefined;
						setItemUuidFlag('');
						setObjMessage({ alertStatus: 'alert-success', message: res.message });
					} else {
						setSpinflag(false);
						setObjMessage({ alertStatus: 'alert-error', message: res.errorMessage });
					}
				})
			}
		})
	}

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
		resetBoxSize();	// 调用Group信息重置功能
		setChecked([]);		// 维护NA组uuid
		setObjMessage({});	// 清除弹窗
		setItemUuidFlag('');
		setIsModalVisible(false); // 关闭弹窗
		setDefaultKey('1');
		setCommissionAgmtCntrSizeTypeGroups([]);

		setDataSource([]);
		setSizeDetailedTable([])
		setTableData([]);
		queryForm.resetFields();
		queryForm.setFieldsValue({ // 数据清空                                  
			toDate: moment(dateEnd),
			// fromDate: '',
			// shipownerCompanyCode: '',
			// companyCode: '',
			// agencyCode: '',
			// commissionAgreementCode: '',
			// agreementType: '',
			// crossBookingPercent: '',
			// crossBookingIndicator: '',
			// crossBookingMode: '',
			// payElsewhereMode: '',
			// allInRate: '',
			// payElsewherePercent: '',
			// postCalculationFlag: '',
			// postMode: '',
			// ygSide: '',
			// yfSide: '',
			// sfSide: '',
			// isYt: '',
			// isBill: '',
		})
	}

	// 点击增加class类
	const [currentIndex, setCurrentIndex] = useState();
	const [sizeDetailedSelectedRows, setSizeDetailedSelectedRows] = useState()
	const changeIdx = (idx) => {
		setCurrentIndex(idx);
		console.log(currentIndex);
	}
	let isSizeBoxAddflag
	// 添加指定箱型尺寸信息 
	const rightBtn = () => {
		setObjMessage({});	// 清除弹窗
		let data = queryForm.getFieldValue();
		if (data.yfBusiness) {
			let idx = newSizeDetailedTable.length;
			isSizeBoxAddflag = true
			sizeDetailedTable.map((item, idx) => {
				item.id = idx;	// 跟下面息息相关
				// if ((data.yfBusiness == item.cargoNatureCode && groupInit[currentIndex] == item.containerSizeType) || idx == item.id) {
				if (data.yfBusiness == item.cargoNatureCode && (groupInit[currentIndex] == item.containerSizeType)) {
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
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Goods-category-required' }) });
		}
	}

	// 删除箱型尺寸信息
	// 协议item的单选
	// const getSelectedRows = async (val) => {
	// val.calculationMethod == "CNT" ? setDisFlag(true) : setDisFlag(false);  // 判断item是否是计算方法
	// setItemUuidFlag(val.commissionTypeItemUuid);  // item的uuid
	// setItemUuid(val.agreementHeadUuid);  // 

	// let dataArr = val.commissionAgmtCntrPrices;
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
	// 	setSizeDetailedSelectedRows(val)
	// }
	//删除指定箱型尺寸
	const deleteBoxSize = () => {
		setObjMessage({});	// 清除弹窗
		let newGroupData = [];
		if (sizeDetailedTable.length) {
			// for (let i = 0; i < checkedGroup.length; i++) {
			// 	newGroupData = [];
			// 	for (let j = 0; j < sizeDetailedTable.length; j++) {
			// 		console.log(checkedGroup[i], sizeDetailedTable[j].id);
			// 		if (checkedGroup[i] == sizeDetailedTable[j].id) {
			// 			console.log('成功');
			// 			continue;
			// 		}
			// 		newGroupData.push(sizeDetailedTable[j])
			// 	}
			// }
			checkedGroup.map((v, i) => {
				delete sizeDetailedTable[v]
			})
			let idx = 0;
			sizeDetailedTable.map((v, i) => {
				if (v) {
					v.id = idx++;
					newGroupData.push(v);
				}
			})
			setCheckedGroup([]);
			setSizeDetailedTable([...newGroupData])
		}

		// if (sizeDetailedSelectedRows) {
		// 	if (sizeDetailedSelectedRows.length == sizeDetailedTable.length) {
		// 		setSizeDetailedTable([])
		// 		setSizeDetailedSelectedRows([])
		// 	}
		// 	let newSizeDetailedTable3 = sizeDetailedTable;
		// 	let sizeDetailedSelectedRows3 = [...sizeDetailedSelectedRows];
		// 	for (var i = 0; i < sizeDetailedSelectedRows.length; i++) {
		// 		for (var j = 0; j < sizeDetailedTable.length; j++) {
		// 			if (sizeDetailedSelectedRows[i].id == sizeDetailedTable[j].id) {
		// 				newSizeDetailedTable3.splice(j, 1)
		// 				sizeDetailedSelectedRows3.splice(i, 1)
		// 			}
		// 		}
		// 	}
		// 	setSizeDetailedTable([...newSizeDetailedTable3])
		// 	setSizeDetailedSelectedRows([...sizeDetailedSelectedRows3])
		// }
	}
	//删除全部箱型尺寸
	const deleteAllBoxDetail = () => {
		setObjMessage({});	// 清除弹窗
		setSizeDetailedTable([])
		setSizeDetailedSelectedRows([])
	}
	//添加全部箱型尺寸
	const addAllBoxDetail = () => {
		setSizeDetailedTable([])
		setSizeDetailedSelectedRows([])
		setNewSizeDetailedTable([])
		setObjMessage({});	// 清除弹窗
		const newGroupInit = []
		let data = queryForm.getFieldValue();
		console.log(data.yfBusiness)
		if (data.yfBusiness) {
			let idx = newSizeDetailedTable.length;
			console.log(idx)
			isSizeBoxAddflag = true
			// for (let i = 0; i < sizeDetailedTable.length; i++) {
			// 	for (let j = 0; j < groupInit.length; j++) {
			// 		console.log(111)
			// 		console.log(data.yfBusiness == sizeDetailedTable[i].cargoNatureCode, groupInit[j] == sizeDetailedTable[i].containerSizeType)
			// 		if ((data.yfBusiness == sizeDetailedTable[i].cargoNatureCode && groupInit[j] == sizeDetailedTable[i].containerSizeType) || idx == sizeDetailedTable[i].id) {
			// 			isSizeBoxAddflag = false
			// 		}
			// 	}
			// }
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
			let sizeDetailedTableAll = newGroupInit
			// let sizeDetailedTableAll = sizeDetailedTable.concat(newGroupInit)
			setSizeDetailedTable([...sizeDetailedTableAll])
			setNewSizeDetailedTable([...sizeDetailedTableAll])
		} else {
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.Goods-category-required' }) });
			// Toast('', formatMessage({id: 'lbl.Goods-category-required'}), 'alert-error', 5000, false)
		}
	}
	const [isEditBoxSize, setIsEditBoxSize] = useState('NEW')
	//保存全部箱型尺寸
	const saveBoxSize = async () => {
		setObjMessage({});	// 清除弹窗
		let data = queryForm.getFieldValue();
		let TypeGroup = data.containerSizeTypeGroup ? data.containerSizeTypeGroup.trim() : undefined;
		if (TypeGroup && TypeGroup.length < 5) {
			if (sizeDetailedTable.length > 0) {
				// console.log('查看', sizeDetailedTable);
				let tengquan = [...sizeDetailedTable]
				tengquan = tengquan.map((item) => {
					item.agreementHeadUuid = uuid;
					item.commissionAgreementCode = commissionAgreementCodeTxt;
					item.containerSizeTypeGroup = TypeGroup
					// item.id
					return item
				})
				setSpinflag(true)
				await request($apiUrl.COMM_AGMT_SAVE_CNTR_GROUP, {
					method: 'POST',
					data: {
						operateType: isEditBoxSize ? 'NEW' : undefined,
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
							setCommissionAgmtCntrSizeTypeGroups([...resData])
							queryForm.setFieldsValue({
								containerSizeTypeGroup: '',
								yfBusiness: ''
							})
							setIsEditBoxSize('NEW')
							radioData.commissionTypeItemUuid ? setSelectedRows(radioData) : null;
							setGroupFlag(false)
							setObjMessage({ alertStatus: 'alert-success', message: res.message });
							setCheckedGroup([]);
						} else {
							setSpinflag(false)
							setObjMessage({ alertStatus: 'alert-error', message: res.errorMessage });
						}
					})
			} else {
				setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.box-size-Goods-add-table' }) });
			}
		} else {
			setObjMessage({ alertStatus: 'alert-error', message: formatMessage({ id: 'lbl.box-size-Goods-category-required' }) });
		}
	}
	// console.log(commissionAgmtCntrSizeTypeGroups)
	//重置箱型尺寸
	const resetBoxSize = () => {
		setObjMessage({});	// 清除弹窗
		setCheckedGroup([]);
		setIsEditBoxSize('NEW')
		// containerSizeTypeGroup，yfBusiness
		setGroupFlag(false)
		queryForm.setFieldsValue({
			containerSizeTypeGroup: '',
			yfBusiness: ''
		})
		setSizeDetailedTable([])
		setSizeDetailedSelectedRows([])
	}
	const [openBoxSizedetailIndex, setOpenBoxSizedetailIndex] = useState()
	const boxSizeref = React.useRef()
	//展开左侧箱型尺寸详情
	const openBoxSizedetail = (index) => {
		setObjMessage({});	// 清除弹窗
		setOpenBoxSizedetailIndex(index)
		if (openBoxSizedetailIndex == index) {
			setOpenBoxSizedetailIndex()
		}
		boxSizeref.current.scrollTo(0, index * 20)
	}
	//删除左侧箱型尺寸组
	const deleteAddSuccessBoxSize = async (item) => {
		setObjMessage({});	// 清除弹窗
		const confirmModal = confirm({
			title: formatMessage({ id: 'lbl.delete-box-size-true' }),
			content: formatMessage({ id: 'lbl.delete-box-size-false' }),
			okText: formatMessage({ id: 'lbl.affirm' }),
			okType: 'danger',
			closable: true,
			cancelText: '',
			async onOk() {
				confirmModal.destroy()
				setSpinflag(true)
				await request($apiUrl.COMM_AGMT_DELETE_CNTR_GROUP, {
					method: 'POST',
					data: {
						params: {
							agreementHeadUuid: uuid,
							containerSizeTypeGroup: item.containerSizeTypeGroup
						}
					}
				})
					.then((res) => {
						if (res.success) {
							setSpinflag(false)
							const resData = res.data || []
							// setCommissionAgmtCntrSizeTypeGroups([...resData])
							// Toast(res.message, '', 'alert-success', 5000, false)
							setUploadEdit ? setUploadEdit(true) : undefined;
							setItemUuidFlag('');
							setObjMessage({ alertStatus: 'alert-success', message: res.message });
						} else {
							setSpinflag(false)
							setObjMessage({ alertStatus: 'alert-error', message: res.errorMessage });
						}
					})
					.catch((err) => {
						setSpinflag(false)
						setObjMessage({ alertStatus: 'alert-error', message: res.errorMessage });
						// Toast(err.errorMessage, '', 'alert-success', 5000, false)
					})
			}
		})
	}
	//编辑左侧详情尺寸组
	const editAddSuccessBoxSize = (item) => {
		setCheckedGroup([]);
		setObjMessage({});	// 清除弹窗
		setGroupFlag(true);
		// let idx = newSizeDetailedTable.length;
		let idx = 0;
		item.containerCargoDetails.map((item) => {
			item.id = idx++
		})
		queryForm.setFieldsValue({
			containerSizeTypeGroup: item.containerSizeTypeGroup,
			yfBusiness: item.yfBusiness
		})
		setIsEditBoxSize('')
		console.log(item.containerCargoDetails)
		setSizeDetailedTable([...item.containerCargoDetails])
		setNewSizeDetailedTable([...item.containerCargoDetails])
	}

	// 重置 维护NA组
	const resetNa = () => {
		setObjMessage({});	// 清除弹窗
		settargetKeys([]);
		setNaData([]);
		queryForm.setFieldsValue({
			groupCodeData: ''
		})
	}
	return (
		<>
			<CosModal cbsDragCls='modal-drag-comm' cbsMoveCls='drag-move-comm' cbsVisible={isModalVisible} cbsTitle={title} cbsFun={() => handleCancel()}>
				<CosToast toast={objMessage} />
				<div className="topBox" style={{ minWidth: '850px' }}>
					<Form onFinish={handleQuery} form={queryForm}>
						<Row>
							{/* commissionAgreementCode: shipownerCompanyCode,
							crossBookingPercent: crossBookingPercent,
							crossBookingIndicator:crossBookingIndicator,
							crossBookingMode: crossBookingMode,
							payElsewherePercent: payElsewherePercent,
							payElsewhereMode: payElsewhereMode,
							modifyIndicator:  */}
							{/* 船东 */}
							<SelectVal span={6} disabled={commonFlag || agencyCodeDRF.companyType == 0 ? true : false || !writeRead} name='shipownerCompanyCode' label={<FormattedMessage id='lbl.carrier' />} required options={acquireData.values} />
							{/* 公司 */}
							<SelectVal showSearch={true} span={6} disabled={commonFlag || !writeRead} selectChange={selectChangeBtn} name='companyCode' label={<FormattedMessage id='lbl.company' />} required options={companysData} />
							{/* 代理编码 */}
							{/* <InputText span={6} disabled name='agencyCode' label={<FormattedMessage id='lbl.agency' />} /> */}
							<SelectVal showSearch={true} span={6} disabled={commonFlag || !writeRead} name='agencyCode' label={<FormattedMessage id='lbl.agency' />} required options={proxyCode} />
							{/* 协议代码 */}
							<InputText span={6} disabled name='commissionAgreementCode' label={<FormattedMessage id='lbl.agreement' />} />
							{/* 开始日期 || !commAuthSave  !tableData.authSave || tableData.groupAgreementCode */}
							<DoubleDatePicker disabled={commonFlag || !writeRead ? [true, true] : [false, true]} span={6} name='Date' label={<FormattedMessage id="lbl.start-date" />} required />
							{/* 协议类型 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='agreementType' label={<FormattedMessage id='lbl.protocol-type' />} options={agreement} required />
							{/* Cross Booking */}
							{/* <InputText disabled={commonFlag} maxLength={12} span={6} name='crossBookingPercent' label={<FormattedMessage id='lbl.cross' />} /> */}
							<IptNumber defaultValue={0.0000} disabled={commonFlag || !tableData.authSave} precision={6} max={999999} name='crossBookingPercent' label={<FormattedMessage id='lbl.cross' />} />
							{/* 收取Cross Booking佣金 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='crossBookingIndicator' label={<FormattedMessage id='lbl.crosscommission' />} options={commission} required />
							{/* Cross Booking模式 */}
							<SelectVal flag={true} disabled={commonFlag || !tableData.authSave} span={6} name='crossBookingMode' label={<FormattedMessage id='lbl.crosstype' />} options={pattern} />
							{/* 第三地佣金付费模式 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='payElsewhereMode' label={<FormattedMessage id='lbl.third' />} options={paidCommissionModel} required />
							{/* All in Rate */}
							{/* <InputText disabled={commonFlag} maxLength={12} span={6} name='allInRate' label={<FormattedMessage id='lbl.rate' />} /> */}
							<IptNumber defaultValue={0.0000} disabled={commonFlag || !tableData.authSave} precision={4} max={99999999} name='allInRate' label={<FormattedMessage id='lbl.rate' />} />
							{/* 异地支付 */}
							{/* <InputText disabled={commonFlag} maxLength={12} span={6} name='payElsewherePercent' label={<FormattedMessage id='lbl.payment' />} /> */}
							<IptNumber defaultValue={0.0000} disabled={commonFlag || !tableData.authSave} precision={6} max={999999} name='payElsewherePercent' label={<FormattedMessage id='lbl.payment' />} />
							{/* 记账算法 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='postCalculationFlag' label={<FormattedMessage id='lbl.arithmetic' />} required options={accountsArithmetic} />
							{/* 记账方式 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='postMode' label={<FormattedMessage id='lbl.bookkeeping' />} required options={accountsWay} />
							{/* 向谁预估 */}
							<InputText disabled={commonFlag || !tableData.authSave} maxLength={10} span={6} name='ygSide' label={<FormattedMessage id='lbl.estimate' />} />
							{/* 向谁开票 */}
							<InputText disabled={commonFlag || !tableData.authSave} maxLength={10} span={6} name='yfSide' label={<FormattedMessage id='lbl.make' />} />
							{/* 向谁报账 */}
							<InputText disabled={commonFlag || !tableData.authSave} maxLength={10} span={6} name='sfSide' label={<FormattedMessage id='lbl.submitanexpenseaccount' />} />
							{/* 预提是否记账 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='isYt' label={<FormattedMessage id='lbl.withholding' />} required options={ytBusiness} />
							{/* 应付实付是否记账 */}
							<SelectVal disabled={commonFlag || !tableData.authSave} span={6} name='isBill' label={<FormattedMessage id='lbl.actually' />} required options={yfBusiness} />
						</Row>
					</Form>
				</div>
				<div className="add-main-button" style={{ display: cssNone ? 'block' : 'none', minWidth: '850px' }}>
					{
						btnData.map((val, idx) => {
							// auth={authData[idx]}style={{ display: authState[idx] ? 'inline-block' : 'none' }}
							// return <CosButton setCommAuthSave={setCommAuthSave} auth={authData[idx]} style={{ display: authState[idx] ? 'inline-block' : 'none' }} disabled={flag} onClick={() => { allBtn(idx) }}>{val}</CosButton>
							return <CosButton auth={authData[idx]} style={{ display: authState[idx] ? 'inline-block' : 'none' }} disabled={flag} onClick={() => { allBtn(idx) }}>{val}</CosButton>
						})
					}
				</div>
				<div className="groupBox" style={{ minWidth: '850px' }}>
					<Tabs onChange={callback} type="card" activeKey={defaultKey}>
						<TabPane tab={<FormattedMessage id='lbl.agreement-item' />} key="1">
							<CosButton disabled={!stateFlags || !tableData.authSave} style={{ marginLeft: '10px', display: cssNone ? 'block' : 'none' }} onClick={addItem}><PlusOutlined /></CosButton>
							<div className="table">
								<PaginationTable
									dataSource={dataSource}
									columns={addColumns}
									rowKey='commissionTypeItemUuid'
									setSelectedRows={setSelectedRows}
									rowSelection={{ selectedRowKeys: [itemUuidFlag] }}
									pagination={false}
									selectionType='radio'
									scrollHeightMinus={200}
								/>
							</div>
							{disFlag ? <div style={{ width: '50%' }}>
								<div style={{ padding: '10px 0px 10px 10px' }}><FormattedMessage id='lbl.box-calculation-detailed' /></div>
								<CosButton disabled={!stateFlags || !tableData.authSave} style={{ margin: '0 0 10px 10px', display: cssNone ? 'block' : 'none' }} onClick={addItemDetailed}><PlusOutlined /></CosButton>
								<PaginationTable
									dataSource={computingMethodData}
									columns={computingMethodColumns}
									pagination={false}
									rowKey="commissionContainerPriceUuid"
									rowSelection={null}
									scrollHeightMinus={200}
								/>
							</div> : null}
						</TabPane>
						{/* 箱型尺寸组 */}
						<TabPane tab={<FormattedMessage id='lbl.group-message' />} key="2">
							<div style={{ width: '40%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
								<div><FormattedMessage id='lbl.maintain-group-message' /></div><br />
								<ul className="list" ref={boxSizeref}>
									<li style={{ height: 20 }}>
										<div><FormattedMessage id='lbl.operate' /></div>
										<div><FormattedMessage id='lbl.detailed' /></div>
										<div><FormattedMessage id='lbl.Box-size-group' /></div>
									</li>
									{commissionAgmtCntrSizeTypeGroups.map((item, index) => {
										return <li key={index}>
											<div>
												{/* 编辑 */}
												<a disabled={!stateFlags || !tableData.authSave} onClick={() => editAddSuccessBoxSize(item)}><FormOutlined /></a>
												{/* 删除 */}
												<a disabled={!stateFlags || !tableData.authSave} onClick={() => deleteAddSuccessBoxSize(item)}><CloseCircleOutlined style={{ color: !stateFlags || !tableData.authSave ? '#ccc' : 'red' }} /></a>		{/* commonFlag */}
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
								{/* className='box-size-group-top' */}
								<div><FormattedMessage id='lbl.box-size-add-frame' /></div>
								<div className='box-size-group-main'>
									<Form form={queryForm}>
										<Row className='box-size-group-main-input'>
											<InputText span={10} isSpan={true} disabled={!stateFlags || groupFlag} maxLength="4" name='containerSizeTypeGroup' label={<FormattedMessage id='lbl.Box-size-group' />} />
											<SelectVal span={10} isSpan={true} disabled={!stateFlags} name='yfBusiness' label={<FormattedMessage id='lbl.cargo-class' />} options={natureCode.values} />
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
												<CosButton disabled={!stateFlags || !tableData.authSave} onClick={rightBtn}><RightOutlined /></CosButton>
												<CosButton disabled={!stateFlags || !tableData.authSave} onClick={addAllBoxDetail}><DoubleRightOutlined /></CosButton>
												<CosButton disabled={!stateFlags || !tableData.authSave} onClick={deleteBoxSize}><LeftOutlined /></CosButton>
												<CosButton disabled={!stateFlags || !tableData.authSave} onClick={deleteAllBoxDetail}><DoubleLeftOutlined /></CosButton>
											</div>
											<div className="box-size-group-main-input-bottom" >
												<div className='box-size-detail'><FormattedMessage id='lbl.Box-size-detailed' /></div>
												<PaginationTable
													dataSource={sizeDetailedTable}
													columns={sizeDetailedColumns}
													rowKey='id'
													// setSelectedRows={getSelectedRows}
													pagination={false}
													scroll={{ y: 230 }}
													rowSelection={{
														selectedRowKeys: checkedGroup,
														onChange: (key, row) => {
															setCheckedGroup(key);
														}
													}}
												/>
											</div>
										</Row>
										<Row style={{ margin: '15px 0', float: 'right', marginRight: '10px' }}>
											<Col style={{ marginRight: '15px' }}><CosButton disabled={!stateFlags || !tableData.authSave} onClick={saveBoxSize}><FormattedMessage id='lbl.preservation-box-size' /></CosButton></Col>
											<Col><CosButton disabled={!stateFlags || !tableData.authSave} onClick={resetBoxSize}><FormattedMessage id='lbl.reset-box-size' /></CosButton></Col>
										</Row>
									</Form>
								</div>
							</div>
						</TabPane>
						{/* 维护NA组 */}
						<TabPane tab={<FormattedMessage id='lbl.maintain-na' />} key="3">
							<div style={{ width: '40%', border: '1px solid #aaaaaa', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
								<div><FormattedMessage id="lbl.maintain-na-message" /></div>
								{/* disabled={checked.length > 0 ? false : true} */}
								<CosButton style={{ float: 'left' }} disabled={(!stateFlags || !tableData.authSave) ? true : (checked.length > 0 ? false : true)} onClick={deleteNA} ><FormattedMessage id='lbl.delete' /></CosButton>
								<PaginationTable
									rowKey="commissionNAGroupUuid"
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
									{/* <Row style={{ margin: '15px 0' }}>
										<Col style={{ textAlign: 'right', marginRight: '10px' }} span={4}><FormattedMessage id="lbl.Trade-line" /></Col>
										<Col span={14}><Input></Input></Col>
									</Row> */}
									<Row style={{ margin: '15px 0' }}>
										{/* <Col style={{ textAlign: 'right', marginRight: '10px' }} span={4}><FormattedMessage id="lbl.group" /></Col> */}
										<InputText span={10} maxLength={10} disabled={!stateFlags} name='groupCodeData' label={<FormattedMessage id='lbl.group' />} />
									</Row>
									<Transfer
										dataSource={mockData}
										showSearch
										filterOption={filterOption}
										targetKeys={targetKeys}
										onChange={handleChange}
										onSearch={handleSearch}
										render={item => item.title}
										disabled={!stateFlags || !tableData.authSave}
									/>
									<Row style={{ margin: '15px 0', float: 'right', marginRight: '10px' }}>
										<Col style={{ marginRight: '15px' }}><CosButton disabled={!stateFlags || !tableData.authSave} onClick={saveMockData}><FormattedMessage id='lbl.save' /></CosButton></Col>
										<Col><CosButton onClick={resetNa} disabled={!stateFlags || !tableData.authSave}><FormattedMessage id='lbl.reset' /></CosButton></Col>
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
export default CommissionAgmtEdit
