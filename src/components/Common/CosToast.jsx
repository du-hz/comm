import React, {useEffect,useState,$apiUrl} from 'react';
import {FormattedMessage} from "umi";
import {
    CloseOutlined 
} from '@ant-design/icons'

const CosToast = (props) => {
    const {toast,style} = props
    const {alertStatus='alert-success',message=''} = toast||{}
    //alertStatus String   弹框样式  
            // alert-success 成功框
            // alert-warning 警告框
            // alert-error 报错框
    // message  弹框数据    
            // Array[String] 
            // Array[{label:'',content:''}] 
            // Object{label:',content:'}  
            // String  

    const [dataNode,setDataNode] = useState([])
    let Hnode = []
    
    useEffect(() => {
        if(message && message instanceof Object && !Array.isArray(message)){
            if(typeof message.$$typeof == 'symbol'){
                Hnode.push(<span key={message} className='alert-item'>{message}</span>)
            }else{
                for(let key in message){
                    if(key !== 'label' || key !== 'content'){
                        Hnode.push(<span key={key} className='alert-item'>{key}: {message[key]}</span>)
                    }else{
                        Hnode.push(<span key={key} className='alert-item'>{message.label}: {message.content}</span>)
                    }
                }
            }
        }
        if(message && typeof message == 'string'){
            Hnode.push(<span key={message} className='alert-item'>{message}</span>)
        }
        if(message && Array.isArray(message)){
            for(let key in message){
                if(message[key] instanceof Object && !Array.isArray(message[key])){
                    Hnode.push(<span key={message[key].label||''} className='alert-item'>{message[key].label||''}:{message[key].content||''}</span>)
                }else{
                    Hnode.push(<span key={key} className='alert-item'>{message[key]}</span>)
                }
            }
        }
        setDataNode(Hnode)
    },[toast])
    const closeToast = () => {
        Hnode = []
        setDataNode([])
    }
    return <>
        {dataNode.length>0?<div className={`alert ${alertStatus}`} style={style}>
            <div className='toast-it'>
                <div className='close-toast' onClick={() => {closeToast()}}><CloseOutlined/></div>
                <div className='alert-content'>{dataNode}</div>
            </div>
        </div>:null}
    </>
}
export default CosToast