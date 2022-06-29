import React, { Component, useEffect, useState, $apiUrl, $menuRender } from 'react';
import { Form, Button, Input, Col, Modal, Row } from "antd";
import { FormattedMessage } from "umi";
import { formlayout, formlayout5 } from "@/utils/commonLayoutSetting";
import { CosPaginationTable, CosInputText, CosButton, CosLoading, CosToast } from './index'
import request from '@/utils/request';
import $ from '@/utils/jquery.min.js'
import { stretch, drag } from '@/utils/drag'
import radioImg from '../../assets/WechatIMG179.png'
import CosModal from '@/components/Common/CosModal'
const { Search } = Input;
// name, 字符串，表单的属性名称
// label, 字符串或者umi多语言对象，表单label显示名
// required, 是否为必填项 true / false
// disabled, 是否禁用
// placeholder, 默认填充文本
// message, required 为 true 时的报错信息
// layout 控制 label 与 内容的 width
// options, 下拉框数据
// span, 设置在24份中占几份
// selectChange(value,option), value:获取选中的key  option:获取选中的所有数据
class SearchSelect extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isModalVisiblePortBounced: false,
            tableData: [],
            tabTotal: 0,
            page: { current: 1, pageSize: 10 },
            loading: false,
            flag: true,
            message: {}
        }
    }
    componentDidMount() {

    }
    componentDidUpdate(prevProps, prevState) {
        const { isModalVisiblePortBounced, flag } = this.state
        if (flag) {
            $(function () {
                stretch('.modal-drag', '.drag-move')
                drag('.ant-modal-header', '.modal-drag')
            })
        }
    }
    handleInpueChange = (value) => {
        this.handlePressEnter()
        this.setState({
            isModalVisiblePortBounced: true
        })
        // setfocusFlag(true)
    }
    handlePressEnter = (e) => {
        const { name, queryForm, setfocusFlag } = this.props
        const search = queryForm.getFieldsValue()
        setfocusFlag(true)
        // alert(1)
        // console.log(1)
        let str = ''
        if (Array.isArray(name)) {
            str = search[name[0]][name[1]]
        } else {
            str = search[name]
        }
        queryForm.setFieldsValue({
            port: {
                odsPortCode: str
            }
        })
        this.setState({
            isModalVisiblePortBounced: str ? true : false
        })
    }
    portBouncedHandleCancel = () => {
        this.setState({
            isModalVisiblePortBounced: false,
            flag: false
        })
        this.reset()
    }
    pageChange = async (pagination,chax) => {
        const { queryForm } = this.props
        const search = queryForm.getFieldsValue().port
        this.setState({
            loading: true,
            flag: false,
            message: null
        })
        chax?pagination.current = 1:''
        let res = await request($apiUrl.COMP_GSPPORT_QUERY, {
            method: "POST",
            data: {
                "page": pagination,
                "params": {
                    portName: search.portName || '',
                    odsPortCode: search.odsPortCode || ''
                }
            }
        })
        if (res.success) {
            const data = res.data || {}
            this.setState({
                tableData: data.resultList,
                tabTotal: data.totalCount,
                page: { ...pagination },
                loading: false
            })
        } else {
            this.setState({
                loading: false,
                message: { message: res.errorMessage, alertStatus: 'alert-error' }
            })
        }
    }
    reset = () => {
        const { queryForm } = this.props
        this.setState({
            tableData: []
        })
        queryForm.setFieldsValue({
            port: {
                odsPortCode: '',
                portName: ''
            }
        })
    }
    setSelectedRows = (row) => {
        const { name, queryForm } = this.props
        if (Array.isArray(name)) {
            queryForm.setFieldsValue({
                [name[0]]: {
                    [name[1]]: row && row.odsPortCode || ''
                }
            })
        } else {
            queryForm.setFieldsValue({
                [name]: row && row.odsPortCode || ''
            })
        }
        this.setState({
            isModalVisiblePortBounced: false
        })
    }
    portBouncedColums = [
        {
            width: 30,
            align: 'left',
            render: (record) => {
                return <img src={radioImg} onClick={() => {
                    this.setSelectedRows(record)
                }} width={15} />
            }
        },
        {
            title: <FormattedMessage id="lbl.The-port-code" />,//港口代码  
            dataIndex: 'odsPortCode',
            sorter: false,
            width: 120,
            align: 'left',
        },
        {
            title: <FormattedMessage id="lbl.The-name-of-the-port" />,//港口名称
            dataIndex: 'portName',
            sorter: true,
            align: 'left',
            width: 120,
        },
    ]
    render() {
        let { name, label, required, disabled, placeholder, message, span = 6, queryForm, linkage, isSpan = false, offset = 0, formlayouts = formlayout, setfocusFlag } = this.props
        const rules = [
            {
                required: required,
                message: message
            }
        ]
        return <Col span={isSpan ? span : $menuRender.menuRender ? span : null} className={isSpan ? '' : $menuRender.menuRender ? '' : 'colWidth'} offset={offset}>
            <Form.Item name={name} label={label} {...formlayouts} rules={rules}>
                <Search placeholder="input search text" onSearch={(e) => this.handleInpueChange(e)} onPressEnter={(e) => this.handlePressEnter(e)} onkeydown={event ? event.keyCode == '13' ? setfocusFlag(true) : '' : ''} />
            </Form.Item>
            {/* 港口查询 */}
            <CosModal id='modal-drag' className='modal-drag' cbsTitle={<FormattedMessage id='lbl.Port-query' />} maskClosable={false} cbsWidth="60%"  cbsVisible={this.state.isModalVisiblePortBounced} footer={null} width={600} cbsFun={() => this.portBouncedHandleCancel()}>
                <CosToast toast={this.state.message} />
                <div className='header-from' style={{ borderRadius: ' 5px ', minWidth: '500px' }}>
                    <Form
                        form={queryForm}
                        name='func'>
                        <Row>
                            {/* 港口代码 */}
                            <CosInputText name={['port', 'odsPortCode']} isSpan={true} label={<FormattedMessage id='lbl.The-port-code' />} span={8} />
                            {/* 港口名称 */}
                            <CosInputText showSearch={true} isSpan={true} name={['port', 'portName']} flag={true} label={<FormattedMessage id='lbl.The-name-of-the-port' />} span={8} />
                        </Row>
                    </Form>
                </div>
                <div className='main-button' style={{ minWidth: '500px' }}>
                    <div className='button-left'></div>
                    <div className='button-right'>
                        {/* 清空 */}
                        <Button onClick={() => { this.reset() }}><FormattedMessage id='lbl.empty' /></Button>
                        {/* 查询 */}
                        <Button onClick={() => this.pageChange(this.state.page,'search')}><FormattedMessage id='btn.search' /></Button>
                    </div>
                </div>
                <div className='footer-table' style={{ borderRadius: '5px', minWidth: '600px' }}>
                    <CosPaginationTable
                        dataSource={this.state.tableData}
                        columns={this.portBouncedColums}
                        rowKey='portUuid'
                        pageChange={this.pageChange}
                        pageSize={this.state.page.pageSize}
                        current={this.state.page.current}
                        scrollHeightMinus={400}
                        selectionType='radio'
                        total={this.state.tabTotal}
                        handleDoubleClickRow={this.setSelectedRows}
                        selectWithClickRow={true}
                        rowSelection={null}
                    />
                </div>
                <div className='drag-move'></div>
            </CosModal>
            <CosLoading spinning={this.state.loading} />
        </Col>
    }
}
export default SearchSelect