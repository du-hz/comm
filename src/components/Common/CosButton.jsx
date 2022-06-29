import React, { Component, $apiUrl } from 'react';
import { Button } from "antd";
import request from '@/utils/request';
class CosButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            display: true
        }
    }
    componentDidMount() {
        const { auth, disabled, setCommAuthSave } = this.props
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
                // auth == "AFCM_AGMT_COMM_001_B17" ? setCommAuthSave(true) : undefined;
                // console.log(auth == "AFCM_AGMT_COMM_001_B17", res.data)
            })
        }
    }
    render() {
        const { type = 'primary', loading, size, icon, disabled = false, children, block = false, danger, ghost, href, onClick, style } = this.props
        // return <div style={{display:'inline-block',...style}}>
        return <>
            {this.state.display ? <Button
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
            </Button> : null}
        </>
        // </div>
    }
}
export default CosButton