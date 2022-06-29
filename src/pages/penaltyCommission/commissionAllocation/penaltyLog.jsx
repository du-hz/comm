import React, {useState,useEffect,$apiUrl} from 'react';
import { Modal,Tooltip } from 'antd';
import {FormattedMessage} from 'umi'
import PaginationTable from "@/components/Common/PaginationTable";
import CosToast from '@/components/Common/CosToast'
import CosModal from '@/components/Common/CosModal'

const LogPopUp = (props) => {
    const {
		isModalVisibleLog,      // 弹出框显示隐藏
		setIsModalVisibleLog,   // 关闭弹窗
        dataLog,    // 日志数据
        messageData,
        setMessageData
    } = props.logData;
    const handleCancel = () => {
        setIsModalVisibleLog(false);   // 关闭弹窗 
        setMessageData({})
    }
    const columns=[
        {
            title: <FormattedMessage id="lbl.Association-number" />,// 关联号
            dataIndex: 'referenceUuid',
            align:'center',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id='lbl.Operation-description'/>,// 操作简述
            dataIndex: 'operationDescription',
            align:'center',
            sorter: false,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
        },
        {
            title: <FormattedMessage id="lbl.operation-context" />,// 操作内容
            dataIndex: 'operationContent',
            align:'center',
            sorter: false,
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: address => (
            <Tooltip placement="topLeft" title={address}>
                {address}
            </Tooltip>
            ),
        },
        {
            title: <FormattedMessage id="lbl.operation-date" />,// 操作时间
            dataIndex: 'recordUpdateDatetime',
            align:'center',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.operator" />,// 操作人
            dataIndex: 'recordUpdateUser',
            align:'center',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.Identification-1" />,// 标识1
            dataIndex: 'mark1',
            align:'center',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.Identification-2" />,// 标识2
            dataIndex: 'mark2',
            align:'center',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.Identification-3" />,// 标识3
            dataIndex: 'mark3',
            align:'center',
            sorter: false,
            width: 120
        },
        {
            title: <FormattedMessage id="lbl.Identification-4" />,// 标识4
            dataIndex: 'mark4',
            align:'center',
            sorter: false,
            width: 120
        }
    ]

    
    return (<div>
        <CosModal cbsWidth="60%" cbsVisible={isModalVisibleLog} cbsTitle={<FormattedMessage id='lbl.log' />} cbsFun={() => handleCancel()}>
            <CosToast toast={messageData} />
            <PaginationTable
                dataSource={dataLog}
                columns={columns}
                rowKey='id'
                scroll={{x:'100%'}}
                scrollHeightMinus={200}
                pagination={false} 
                rowSelection={null}
            />
        </CosModal>
    </div>)
}
export default LogPopUp