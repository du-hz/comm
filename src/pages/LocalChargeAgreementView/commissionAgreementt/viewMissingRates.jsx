import React, {useState,useEffect,$apiUrl} from 'react';
import { Modal , Button} from 'antd';
import {FormattedMessage,formatMessage } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import request from '@/utils/request';
import { Toast } from '@/utils/Toast'
import CosToast from '@/components/Common/CosToast'
import CosModal from '@/components/Common/CosModal'
import Loading from '@/components/Common/Loading'
import {
    CaretDownOutlined,//导出
} from '@ant-design/icons'
// ---------------------------------查看缺失费率--------------------------------
const ViewMissingRates = (props) => {
    const [spinflag,setSpinflag] = useState(false)
    const {
        isModalVisibleviewMissingRates,
        setIsModalVisibleViewMissingRates,
        tableDataViewMissing,
        tabTotalViewMissing,
        setTableDataViewMissing,
        setTabTotalViewMissing,
        messageData,
        setMessageData,
        setfocusFlag
    } = props.viewMissingRatesdata;
    // console.log(tableDataViewMissing)
    const [page,setPage]= useState({
        current: 1,
        pageSize: 10
    })
    useEffect(()=>{
        pageChange(page)
    },[])
    const handleCancel = () => {
        setMessageData({})
        setIsModalVisibleViewMissingRates(false);   // 关闭弹窗 
        setTableDataViewMissing([])
        setfocusFlag(false)
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
            title: <FormattedMessage id='lbl.Storage-area0-code'/>,// 堆场代码
            dataIndex: 'destinationFacility',
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
            title: <FormattedMessage id="lbl.Import-Agreement-Terms" />,// 进口协议条款
            dataIndex: 'inboundTrafficTerm',
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
        }
    ]

    //
    const pageChange = async(pagination)=>{
        setMessageData({})
        let localsearch=await request($apiUrl.IBS_SEARCH_ERRORLOG,{
            method:"POST",
            data:{
                "page": pagination,
                // "params":{
                //     "entryCode":"AFCM_COMM_CALC_ERR_LOG",
                //     "errorCode":"IBS",
                //     "note":"未匹配到IBS箱量法协议"
                // },
            }
        })
        console.log(localsearch)
        if(localsearch.success){
            let data=localsearch.data
            let datas=localsearch.data.resultList
            datas.map((v,i)=>{
                v['id'] = i
            })
            if(pagination.pageSize!=page.pageSize){
                pagination.current=1
            }
            setPage({...pagination})
            setTableDataViewMissing([...datas])
            setTabTotalViewMissing(data.totalCount)
            localsearch.errorMessage?setMessageData({alertStatus:'alert-success',message:localsearch.message}):null
            // setSpinflag(false)
        }else{
            setTableDataViewMissing([])
            localsearch.errorMessage?setMessageData({alertStatus:'alert-error',message:localsearch.errorMessage}):null
            // setSpinflag(false)
        }  
    }
    const downlod = async()=>{
        setMessageData({})
        let tddata = {}
        columns.map((v, i) => {
            tddata[v.dataIndex] = formatMessage({id: v.title.props.id})
        })
        setSpinflag(true)
        let downData = await request($apiUrl.IBS_SEARCH_ERRORlOG_EXP,{
            method:"POST",
            data:{
                "excelFileName":formatMessage({id:"lbl.Missing-agreement-rate"}),
                page:{
                    current: 0,
                    pageSize: 0
                },
                sheetList: [
                    {//sheetList列表
                        dataCol: tddata,
                    'sheetName':formatMessage({id:'lbl.Missing-agreement-rate'}),
                },
            ]
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
                navigator.msSaveBlob(blob, formatMessage({id: 'lbl.Missing-agreement-rate'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            } else {
                let downloadElement = document.createElement('a');  //创建元素节点
                let href = window.URL.createObjectURL(blob); // 创建下载的链接
                downloadElement.href = href;
                downloadElement.download = formatMessage({id: 'lbl.Missing-agreement-rate'})+ '.xlsx'; // 下载后文件名
                document.body.appendChild(downloadElement); //添加元素
                downloadElement.click(); // 点击下载
                document.body.removeChild(downloadElement); // 下载完成移除元素
                window.URL.revokeObjectURL(href); // 释放掉blob对象
            }
            // if (window.navigator.msSaveOrOpenBlob) { //msSaveOrOpenBlob 提供保存和打开按钮
            //     navigator.msSaveBlob(blob, formatMessage({id: 'lbl.Missing-agreement-rate'}))  //msSaveBlob 只提供一个保存按钮 存储以本地方式保存文件
            // } else {
            //     let downloadElement = document.createElement('a');  //创建元素节点
            //     let href = window.URL.createObjectURL(blob); // 创建下载的链接
            //     console.log(href)
            //     downloadElement.href = href;
            //     downloadElement.download = formatMessage({id: 'lbl.Missing-agreement-rate'}) // 下载后文件名
            //     document.body.appendChild(downloadElement); //添加元素
            //     console.log(downloadElement)
            //     downloadElement.click(); // 点击下载
            //     document.body.removeChild(downloadElement); // 下载完成移除元素
            //     window.URL.revokeObjectURL(href); // 释放掉blob对象
            // }
        }
    }
    return (
    <div className='viewMissingRates'>
        <CosModal cbsDragCls='modal-drag-comm' cbsMoveCls='drag-move-comm' cbsTitle={<FormattedMessage id='lbl.Missing-agreement-rate' />} zIndex='999' cbsVisible={isModalVisibleviewMissingRates} footer={null} cbsWidth="60%" cbsFun={() => handleCancel()}>
            <CosToast toast={messageData}/>
            <div style={{padding:'10px'}} style={{width:'800px'}}>
                {/* 导出Excel ,background:'#eeeeee'bodyStyle={{color:'#e69700 !important'}} */}
                <Button onClick={downlod}><CaretDownOutlined /><FormattedMessage id='lbl.derive-Excel' /></Button>
            </div>
            <div className='footer-table' style={{width:'70%',minWidth:'500px'}}>
                <PaginationTable
                    dataSource={tableDataViewMissing}
                    columns={columns}
                    rowKey={'id'}
                    scrollHeightMinus={200}
                    // pagination={false} 
                    pageChange={pageChange}
                    pageSize={page.pageSize}
                    current={page.current}
                    total={tabTotalViewMissing}
                    rowSelection={null}
                />
            </div>
            
            <Loading spinning={spinflag}/>
        </CosModal>

        
    </div>)
}
export default ViewMissingRates