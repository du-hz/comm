import React, {Component} from 'react'
import {Button} from "antd";
class CosUpload extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }
    componentDidMount(){
        
    }
    handlechang(e){
        const file = document.getElementById('file').files[0]
        if(!file) return
        console.log(document.getElementById('file').files)
        let reader = new FileReader();
        // reader.readAsBinaryString(file)//二进制
        reader.readAsText(file);//文本
        // reader.readAsDataURL(file);//将文件以Data URL形式读入页面
        reader.onload=function(f){
            const result = document.getElementById("result")
            console.log(this)
            result.innerHTML=this.result
            // result.innerHTML='<img class="seeUpload" src="' + this.result +'" alt="" />';
        }
    }
    render(){
        return <div>
            <Button>
                <input type="file" id="file" onChange={(e) => {this.handlechang(e)}}/>
            </Button>
            <div id="result" name="result"></div>
        </div>
        
    }
}
export default CosUpload