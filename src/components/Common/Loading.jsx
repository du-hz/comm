import React from 'react'
import {Spin} from "antd";
const Loading = (props) => {
    const { spinning=false,label } = props
    return (<div className="example" style={{display:spinning?'block':'none'}}>
        <Spin spinning={spinning} tip={label}/>
    </div>)
}
export default Loading
 