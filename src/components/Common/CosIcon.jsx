import React, {$menuRender} from 'react';
import { createFromIconfontCN } from '@ant-design/icons';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2485864_edw99rwpotw.js', // 在 iconfont.cn 上生成
}); 

const CosIcon = (props) =>{
        let {type,style} = props

    return <>
        <MyIcon type={type} style={style} />
    </>
}


export default CosIcon