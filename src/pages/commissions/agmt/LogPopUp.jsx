import React, { useState, useEffect, $apiUrl } from 'react';
import { Modal } from 'antd';
import { FormattedMessage } from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import CosModal from '@/components/Common/CosModal'

const LogPopUp = (props) => {
    const {
        isModalVisibleLog,      // 弹出框显示隐藏
        setIsModalVisibleLog,   // 关闭弹窗
        journalData,    // 日志数据
        // parentColumns,
        key
    } = props.logData;
    const handleCancel = () => {
        setIsModalVisibleLog(false);   // 关闭弹窗 
    }
    const columns = [
        {
            title: <FormattedMessage id="lbl.operation-description" />,// 操作描述
            dataIndex: 'operationContent',
            align: 'center',
            sorter: false,
            key: 'COMM_AGMT_CDE',
            width: 120
        }, {
            title: <FormattedMessage id='lbl.operation-context' />,// 操作内容
            dataIndex: 'operationDescription',
            align: 'center',
            sorter: false,
            key: 'SO_COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.operator" />,// 操作人
            dataIndex: 'recordUpdateUser',
            align: 'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        }, {
            title: <FormattedMessage id="lbl.operation-date" />,// 操作时间
            dataIndex: 'recordUpdateDatetime',
            align: 'center',
            sorter: false,
            key: 'COMPANY_CDE',
            width: 120
        }
    ]


    return (<div>
        {/* <Modal title={<FormattedMessage id='lbl.log' />} visible={isModalVisibleLog} footer={null} width="50%" onCancel={() => handleCancel()}> */}
        <CosModal cbsDragCls='modal-drags' cbsMoveCls='drag-moves' cbsWidth={550} cbsVisible={isModalVisibleLog} cbsTitle={<FormattedMessage id='lbl.log' />} cbsFun={() => handleCancel()}>
            <div style={{ minWidth: '300px' }}>
                <PaginationTable
                    dataSource={journalData}
                    columns={columns}
                    // columns={parentColumns||columns}
                    rowKey={key || 'operationLogUuid'}
                    scrollHeightMinus={200}
                    pagination={false}
                    rowSelection={null}
                />
            </div>
        </CosModal>
    </div>)
}
export default LogPopUp