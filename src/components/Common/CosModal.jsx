import React, { useEffect, useState, $apiUrl } from 'react'
import { FormattedMessage, formatMessage, useIntl } from 'umi'
import { Form, Button, Input, Col, Modal, Row } from "antd";
import { stretch, drag } from '@/utils/drag'
// import $ from '@/utils/jquery.min.js'

// children        固定不改变
// cbsWidth        宽度
// cbsVisible      控制弹窗显示隐藏
// cbsTitle        弹窗头部标题
// cbsFun          调用关闭
// cbsDragCls
// cbsMoveCls            

const CosModal = (props) => {
    const { children, cbsWidth = "100%", cbsVisible = false, cbsTitle, cbsFun, cbsDragCls = 'modal-drag', cbsMoveCls = 'drag-move' } = props
    useEffect(() => {
        if (cbsVisible) {
            // $(function () {
            stretch(`.${cbsDragCls}`, `.${cbsMoveCls}`)
            drag('.ant-modal-header', `.${cbsDragCls}`)
            // })
        }
    }, [cbsVisible])

    const handleCancel = () => {
        cbsFun()
    }

    return (<>
        <Modal
            // style={{ height: '100%', overflow: 'hidden', cursor: 'move', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
            id={cbsDragCls}
            className={cbsDragCls}
            title={cbsTitle}
            visible={cbsVisible}
            footer={null}
            width={cbsWidth}
            onCancel={() => handleCancel()}
            maskClosable={false}>
            {children}
            <div className={cbsMoveCls}></div>
        </Modal>
    </>)
}
export default CosModal