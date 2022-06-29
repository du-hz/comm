{/* 测算-测算头信息日志 */}
import React, {useState,useEffect,$apiUrl} from 'react';
import { Modal,Tooltip } from 'antd';
import {FormattedMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import { acquireSelectDatas} from '@/utils/commonDataInterface';
import CosModal from '@/components/Common/CosModal'

const LogPopUp = (props) => {
    const {
		calcLogModal,      // 弹出框显示隐藏
		setCalcLogMoadl,   // 关闭弹窗
        calcData,    // 日志数据
	} = props.calcLogData;
    const handleCancel = () => {
        setCalcLogMoadl(false);   // 关闭弹窗 
    }

    const parentColumns = [//日志
        {
            title: <FormattedMessage id="lbl.operation-description" />,// 执行描述
            dataIndex: 'runStatusDescription',
            align:'left',
            width: 140,
            ellipsis: {
                showTitle: false,
              },
              render: runStatusDescription => (
                <Tooltip placement="topLeft" title={runStatusDescription}>
                  {runStatusDescription}
                </Tooltip>
              ),
        },{
            title: <FormattedMessage id="lbl.calculation.name" />,// 测算名称
            dataIndex: 'prepareName',
            align:'left',
            width: 120
        },{
            title: <FormattedMessage id="lbl.calculation.status" />,// 测算状态
            dataIndex: 'runStatus',
            align:'left',
            width: 120
        },{
            title: <FormattedMessage id="lbl.calculation.calucStartTime" />,// 计算开始时间
            dataIndex: 'runStart',
            align:'left',
            width: 120
        },{
            title: <FormattedMessage id="lbl.calculation.finishTime" />,// 计算完成时间
            dataIndex: 'runEnd',
            align:'left',
            width: 120
        },{
            title: <FormattedMessage id="lbl.operator" />,// 操作人
            dataIndex: 'recordUpdateUser',
            align:'left',
            width: 120
        }
    ]

    
    return (<div>
        {/* <Modal title={<FormattedMessage id='lbl.log' />} visible={calcLogModal} footer={null} width="50%" onCancel={() => handleCancel()}> */}
        <CosModal cbsWidth={550} cbsVisible={calcLogModal} cbsTitle={<FormattedMessage id='lbl.log' />} cbsFun={() => handleCancel()}>
            <div style={{minWidth: '300px'}}>
                <PaginationTable
                    dataSource={calcData}
                    columns={parentColumns}
                    scroll={{x:'100%'}}
                    rowKey='logId'
                    scrollHeightMinus={200}
                    pagination={false} 
                    rowSelection={null}
                />
            </div>
        </CosModal>
    </div>)
}
export default LogPopUp