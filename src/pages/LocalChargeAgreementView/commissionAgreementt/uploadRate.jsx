import React, {useState,useEffect,$apiUrl} from 'react';
import { Modal , Button, Upload, message} from 'antd';
import {FormattedMessage,formatMessage} from 'umi'
import request from '@/utils/request';
import PaginationTable from "@/components/Common/PaginationTable";
import { Toast } from '@/utils/Toast'
import CosToast from '@/components/Common/CosToast'
import Loading from '@/components/Common/Loading'
import CosModal from '@/components/Common/CosModal'
import {
    CaretDownOutlined,//导出
    SelectOutlined,//选择
    UploadOutlined,//上传
} from '@ant-design/icons'

import { createFromIconfontCN } from '@ant-design/icons';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_shs40uc9p39.js', // 在 iconfont.cn 上生成
});
// -----------------------------上载费率-----------------------------------------------------------
const UploadRate = (props) => {
    const {
        isModalVisibleviewUploadRate,
        setIsModalVisibleViewUploadRate,
        messageData,
        tableDataUploadRate,
        setMessageData,
        tabTotalUploadRate,
        setTableDataUploadRate,
        setTabTotalUploadRate
    } = props.uploadRateData;
    const [data,setData] = useState([])//
    const [spinflag,setSpinflag] = useState(false)
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    
    useEffect(()=>{
   
        console.log(data)
    },[data])
    const handleCancel = () => {
        setMessageData({})
        // Toast('', '', '', 5000, false);
        setIsModalVisibleViewUploadRate(false);   // 关闭弹窗 
        setTableDataUploadRate([])
        setData([])
    }
    const columns=[
        {
            title: <FormattedMessage id="lbl.carrier" />,// 船东
            dataIndex: 'shipownerCompanyCode',
            align:'center',
            sorter: false,
            key: 'COMM_AGMT_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.argue.chargeCode" />,// 费用代码
            dataIndex: 'chargeCode',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id='lbl.Storage-area0-code'/>,// 堆场代码
            dataIndex: 'facilityCode',
            align:'center',
            sorter: false,
            key: 'SO_COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.port" />,// 港口
            dataIndex: 'portCode',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.Export-Agreement-Terms" />,// 出口协议条款
            dataIndex: 'termsFrom',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.Import-Agreement-Terms" />,// 进口协议条款
            dataIndex: 'termsTo',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.route" />,// 航线
            dataIndex: 'cargoTradeLaneCode',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.office" />,// Office
            dataIndex: 'officeCode',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.start-date" />,// 起始日期
            dataType:'dateTime',
            dataIndex: 'fromDate',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.over-date" />,// 结束日期
            dataType:'dateTime',
            dataIndex: 'toDate',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.Box-size-group" />,// 箱型尺寸组
            dataIndex: 'containerSizeTypeGroup',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.budgetTracking.agreement-rate" />,// 协议费率
            dataIndex: 'unitPrice',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        },{
            title: <FormattedMessage id="lbl.result" />,// 结果
            dataIndex: 'canUpload',
            align:'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        }
    ]

     //上载费率
     const pageChange = async(pagination) => {
        console.log(pagination)
        setMessageData({})
        setIsModalVisibleViewUploadRate(true)
        setSpinflag(true)
        let localsearch=await request($apiUrl.AGENCY_FEE_ACCOUNT_CHECK_MONITOR_SEARCH_LIST,{
            method:"POST",
            data:{
                "page": pagination,
                "params":{
                    "entryCode":"IBS_AGMT_TMP_ROUTE",
                },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            setSpinflag(false)
            let data=localsearch.data
            let datas=localsearch.data.resultList
            datas?datas.map((v,i)=>{
                v['id'] = i
            }):null
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            localsearch.message?setMessageData(localsearch.message):null
            setPage({...pagination})
            setTableDataUploadRate([...datas])
            setTabTotalUploadRate(data.totalCount)
            setSpinflag(false)
        }else{
            setSpinflag(false)
            localsearch.errorMessage?setMessageData({alertStatus:'alert-error',message:localsearch.errorMessage}):null
            setTableDataUploadRate([])
            setSpinflag(false)
        } 
    }

    const handlechang = () =>{
        const file = document.getElementById('file').files[0]
        console.log(document.getElementById('file').files)
        console.log(file)
        setData(file)
        const result = document.getElementById("result")
        let reader = new FileReader();
        reader.readAsBinaryString(file)
        console.log(reader.result)
        reader.onload=function(f){
        console.log(result)
        //   result.innerHTML=this.result
        }
    }
    //上传
    const uploadbuton = async() =>{
        setMessageData({})
        console.log(data)
        if(data.length<1){
            setMessageData({alertStatus:'alert-error',message:formatMessage({id: 'lbl.afcm-0076'}) })
        }else{
            let fd = new FormData()
            fd.append('file',data)
            fd.append('name',data.name)
            fd.append('type',data.type)
            setSpinflag(true)
            let result = await request($apiUrl.IBS_UPLOAD_RATE,{
                method:'POST',
                data: fd,
                requestType:'form',
            })
            if(result.success){
                setSpinflag(false)
                setData([])
                let datas = result.data
                datas?datas.map((v,i)=>{
                    v.canUpload = v.canUpload.toString()
                }):null
                setTableDataUploadRate([...datas])
                result.message?setMessageData({alertStatus:'alert-success',message:result.message}):null
            }else{
                setSpinflag(false)
                setData([])
                result.errorMessage?setMessageData({alertStatus:'alert-error',message:result.errorMessage}):null
            }
        }
        
    }

    const downlod = async()=>{
        setMessageData({})
        setSpinflag(true)
        let downData = await request($apiUrl.CONFIG_DOWNLOADTEMP,{
            method:"POST",
            data:{
                "excelFileName":"importBlTemplate-1.xlsx",
                // 'excelFileName':formatMessage({id:'lbl.uploadRate'}),
                // sheetList: [
                //     {//sheetList列表
                //         dataCol: {//列表字段
                //             shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                //             chargeCode: formatMessage({id:"lbl.argue.chargeCode" }),
                //             facilityCode: formatMessage({id:"lbl.Storage-area0-code" }),
                //             portCode: formatMessage({id:"lbl.port" }),
                //             termsFrom: formatMessage({id:"lbl.Export-Agreement-Terms" }),
                //             termsTo: formatMessage({id:"lbl.Import-Agreement-Terms" }),
                //             cargoTradeLaneCode: formatMessage({id:"lbl.route" }),
                //             officeCode: formatMessage({id:"lbl.office" }),
                //             fromDate: formatMessage({id:"lbl.start-date" }),
                //             toDate: formatMessage({id:"lbl.over-date" }),
                //             containerSizeTypeGroup: formatMessage({id:"lbl.Box-size-group" }),
                //             unitPrice: formatMessage({id:"lbl.budgetTracking.agreement-rate" }),
                //             canUpload: formatMessage({id:"lbl.result" }),
                //         },
                //     'sheetName':formatMessage({id:'lbl.uploadRate'}),
                // },
            // ]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        // if(downData.success){
            if(downData.size<1){
                setSpinflag(false)
                Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
                return
            }else{
                setSpinflag(false)
                let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
                console.log(blob)
                if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                    navigator.msSaveBlob(blob, formatMessage({id: 'lbl.afcm-0029'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
                } else {
                    let downloadElement = document.createElement('a');  //创建元素节点
                    let href = window.URL.createObjectURL(blob); // 创建下载的链接
                    console.log(href)
                    downloadElement.href = href;
                    downloadElement.download = formatMessage({id: 'lbl.afcm-0029'}); // 下载后文件名
                    document.body.appendChild(downloadElement); //添加元素
                    console.log(downloadElement)
                    downloadElement.click(); // 点击下载
                    document.body.removeChild(downloadElement); // 下载完成移除元素
                    window.URL.revokeObjectURL(href); // 释放掉blob对象
                }
            }
        // }else{

        // }
        
    }
    const cancel  = ()=>{
        setData([])
    }

    const save = async() =>{
        setMessageData({})
        setSpinflag(true)
        let a = []
        tableDataUploadRate.length>0?tableDataUploadRate.map((v,i)=>{
            if(v.canUpload == 'true' ){
                return a.push(v)
            }
        }):[]
        let saveData = await request($apiUrl.SAVE_UPDATE_AGMT,{
            method:"POST",
            data:{
                paramsList:[...a]
            }
        })
        console.log(saveData)
        if(saveData.success) {
            setSpinflag(false)
            // saveData.message?setMessageData({alertStatus:'alert-success',message:saveData.message}):null
            // setMessageData({alertStatus:'alert-success',message:saveData.message})
            Toast('',saveData.message,'' , 5000, false)
            handleCancel()
        }else{
            setSpinflag(false)
            saveData.errorMessage?setMessageData({alertStatus:'alert-error',message:saveData.errorMessage}):null
        }
    }
    //导出上载结果
    const derive = async()=>{
        setMessageData({})
        setSpinflag(true)
        let downData = await request($apiUrl.EXP_UPLOAD_RATE_LIST,{
            method:"POST",
            data:{
                'excelFileName':formatMessage({id:'lbl.uploadRate'}),
                sheetList: [
                    {//sheetList列表
                        dataCol: {//列表字段
                            shipownerCompanyCode: formatMessage({id:"lbl.carrier" }),
                            chargeCode: formatMessage({id:"lbl.argue.chargeCode" }),
                            facilityCode: formatMessage({id:"lbl.Storage-area0-code" }),
                            portCode: formatMessage({id:"lbl.port" }),
                            termsFrom: formatMessage({id:"lbl.Export-Agreement-Terms" }),
                            termsTo: formatMessage({id:"lbl.Import-Agreement-Terms" }),
                            cargoTradeLaneCode: formatMessage({id:"lbl.route" }),
                            officeCode: formatMessage({id:"lbl.office" }),
                            fromDate: formatMessage({id:"lbl.start-date" }),
                            toDate: formatMessage({id:"lbl.over-date" }),
                            containerSizeTypeGroup: formatMessage({id:"lbl.Box-size-group" }),
                            unitPrice: formatMessage({id:"lbl.budgetTracking.agreement-rate" }),
                            canUpload: formatMessage({id:"lbl.result" }),
                        },
                    'sheetName':formatMessage({id:'lbl.uploadRate'}),
                },
            ],
                paramsList:[...tableDataUploadRate]
            },
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
        })
        console.log(downData)
        if(downData.size<1){
            setSpinflag(false)
            Toast('', formatMessage({id: 'lbl.Unclock-agFee-download'}), 'alert-error', 5000, false);
            return
        }else{
            setSpinflag(false)
            let blob = new Blob([downData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); //xlsx的类型
            console.log(blob)
            if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
                navigator.msSaveBlob(blob, formatMessage({id: 'lbl.afcm-0029'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                console.log(href)
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'lbl.afcm-0029'}); // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                console.log(downloadElement)
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
        }
    }
    return (<div className='uploadRate'>
        <CosModal cbsDragCls='modal-drag-loc' style={{overflow:'none'}} cbsMoveCls='drag-move-loc' cbsTitle={<FormattedMessage id='lbl.uploadRate' />} cbsVisible={isModalVisibleviewUploadRate} footer={null} cbsWidth="70%" cbsFun={() => handleCancel()}>
            <CosToast toast={messageData}/>
            <div className='uploadRate-button'  style={{minWidth:'500px'}}>
                <div className='uploadRate-button-left'>
                    <div className='uploadRate-button-left-top'>
                        {/* 选择 */}
                        <Button className='filebutton'><SelectOutlined /> <input type="file" id="file"  onChange={() =>handlechang()}/> <FormattedMessage id='lbl.select' /></Button>
                        {/* 上传 */}
                        <Button onClick={uploadbuton}><UploadOutlined /><FormattedMessage id='lbl.upload' /></Button>
                        {/* 取消 */}
                        <Button onClick={cancel}><MyIcon type="icon-quxiao" /><FormattedMessage id='lbl.cancel' /></Button>
                    </div>
                    <div className='uploadRate-button-left-bottom'>
                        {data.name}
                    </div>
                </div>
                <div>
                    {/* 下载上载模板 */}
                    <Button onClick={downlod}><FormattedMessage id='lbl.Download-upload-Template' /></Button>
                    {/* 导出上载结果 */}
                    <Button onClick={derive} disabled={tableDataUploadRate.length>0?false:true}><CaretDownOutlined /><FormattedMessage id='lbl.Exporting-upload-Result' /></Button>
                    {/* 保存并生效 */}
                    <Button onClick={save} disabled={tableDataUploadRate.length>0?false:true}><FormattedMessage id='lbl.Save-and-take-effect' /></Button>
                </div>
               
            </div>
            <div className='footer-table'  style={{minWidth:'500px'}}>
                <PaginationTable
                    dataSource={tableDataUploadRate}
                    columns={columns}
                    rowKey='id'
                    scrollHeightMinus={200}
                    // pageSize={page.pageSize}
                    // current={page.current}
                    // pagination={false} 
                    pageChange={pageChange}
                    rowSelection={null}
                    pagination={false}
                    // total={tabTotalUploadRate}
                />
            </div>
            <Loading spinning={spinflag}/>
        </CosModal>
    </div>)
}
export default UploadRate