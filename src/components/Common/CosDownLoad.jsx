import React, { Component, $apiUrl } from 'react';
// import {Button} from "antd";
import request from '@/utils/request';
class CosDownLoad extends Component {
    constructor(props) {
        super(props)
        this.state = {
            display: true
        }
    }
    componentDidMount() {
        const { auth, disabled } = this.props
        if (auth) {
            request($apiUrl.PAGE_BUTTOB_CHECKOUT, {
                method: "POST",
                data: {
                    authCode: auth
                }
            }).then((res) => {
                this.setState({
                    display: res.data
                })
            })
        }
    }
    render() {
        const { type = 'primary', loading, size, icon, disabled = false, children, block = false, danger, ghost, href, onClick, style } = this.props
        // return <div style={{display:'inline-block',...style}}>
        return <>
            {this.state.display ? <a
                style={{ ...style }}
                type={type}
                block={block}
                danger={danger}
                ghost={ghost}
                href={href}
                loading={loading}
                size={size}
                icon={icon}
                onClick={() => onClick && onClick()}
                disabled={disabled}>
                {children}
            </a> : null}
        </>
        // </div>
    }
}
export default CosDownLoad