import React, {$menuRender} from 'react';
import { createFromIconfontCN } from '@ant-design/icons';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_edw99rwpotw.js', // ε¨ iconfont.cn δΈηζ
}); 

const CosIcon = (props) =>{
        let {type,style} = props

    return <>
        <MyIcon type={type} style={style} />
    </>
}


export default CosIcon