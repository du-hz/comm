import React, { useState } from 'react'
import { Form, Button, Row } from 'antd'
import { FormattedMessage } from 'umi'
import { CosInputText, CosButton, CosPaginationTable, CosLoading } from '@/components/Common/index'
import ExportJsonExcel from 'js-export-excel'
import zh_CN from '@/locales/zh-CN'
import en_US from '@/locales/en-US'
import el_GR from '@/locales/el-GR'
import uk_UA from '@/locales/uk-UA'

import {
    SearchOutlined,//查询
    ReloadOutlined,//重置
    CloudDownloadOutlined,//下载
    SaveOutlined,//保存
} from '@ant-design/icons'
let formlayouts = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
}

const lang = []
console.log('23', lang)
for (let key in zh_CN) {
    // key.indexOf('lbl.')>-1
    // key.indexOf('menu.')>-1
    // key.indexOf('layout.')>-1
    // key.indexOf('component.')>-1
    // key.indexOf('afcm.svc')>-1
    // key.indexOf('btn.')>-1
    // key.indexOf('warn.')>-1
    // key.indexOf('app.')>-1
    // if(key.indexOf('app.')>-1||key.indexOf('lbl.')>-1||key.indexOf('menu.')>-1||key.indexOf('component.')>-1||key.indexOf('afcm.svc')>-1||key.indexOf('warn.')>-1
    // ||key.indexOf('btn.')>-1){
    lang.push({
        ID: key,
        ZH_KEY: key,//中文ID
        EN_KEY: key,//英文ID

        UK_KEY: key,//乌克兰ID
        EL_KEY: key,//希腊ID
        ZH_VAL: zh_CN[key],//中文翻译
        EN_VAL: en_US[key] || '',//英文翻译
        UK_VAL: uk_UA[key] || '',//乌克兰翻译
        EL_VAL: el_GR[key] || '',//希腊翻译
    })
    // }
    // else{
    //     lang.push({
    //         ID:key,
    //         ZH_KEY:key,//中文ID
    //         EN_KEY:key,//英文ID
    //         UK_KEY:key,//乌克兰ID
    //         EL_KEY:key,//希腊ID
    //         ZH_VAL:zh_CN[key],//中文翻译
    //         EN_VAL:en_US[key]||'',//英文翻译
    //         UK_VAL:uk_UA[key]||'',//乌克兰翻译
    //         EL_VAL:el_GR[key]||'',//希腊翻译
    //     })
    // }
}
console.log('62', lang)

// let teng = lang.slice(0,100)
const language = () => {
    const [queryForm] = Form.useForm();
    const [zhList, setZhList] = useState(lang.slice(0, 100))
    const [total, setTotal] = useState(lang.length)
    const [page, setPage] = useState({
        pageSize: 100,
        current: 1
    })
    const [loading, setLoading] = useState(false)
    const zhColumns = [
        {
            title: 'KEY',
            width: 100,
            dataIndex: 'ID',
        }, {
            title: <FormattedMessage id='lbl.chinese' />,
            width: 100,
            dataIndex: 'ZH_KEY',
            render(text, record) {
                return record.ZH_VAL
            }
        }, {
            title: <FormattedMessage id='lbl.english' />,
            dataIndex: 'EN_KEY',
            width: 100,
            render(text, record) {
                if (escape(record.EN_VAL).indexOf("%u") < 0) {
                    return record.EN_VAL || record.ZH_VAL + ' [en]' //没有包含中文
                }

                return record.ZH_VAL + ' [en]'//包含中文
            }
        }, {
            title: <FormattedMessage id='lbl.uk' />,
            dataIndex: 'UK_KEY',
            width: 100,
            render(text, record) {
                if (escape(record.UK_VAL).indexOf("%u") < 0) {
                    return record.UK_VAL || record.ZH_VAL + ' [uk]' //没有包含中文
                }
                return record.ZH_VAL + ' [uk]' //包含中文
            }
        }, {
            title: <FormattedMessage id='lbl.el' />,
            dataIndex: 'EL_KEY',
            width: 100,
            render(text, record) {
                if (escape(record.EL_VAL).indexOf("%u") < 0) {
                    return record.EL_VAL || record.ZH_VAL + ' [el]' //没有包含中文
                }
                return record.ZH_VAL + ' [el]' //包含中文
            }
        }
    ]

    const pageChange = (pagination) => {
        setLoading(true)
        const search = queryForm.getFieldsValue().search
        const searchList = []
        if (search.zh_cn || search.en_us || search.uk_ua || search.el_gr) {
            lang.map((item, index) => {
                const enUpperFlage = search.en_us && item.EN_VAL.toUpperCase().indexOf(search.en_us.toUpperCase())
                const zhUpperFlage = search.zh_cn && item.ZH_VAL.indexOf(search.zh_cn)
                const enLowerFlage = search.en_us && item.EN_VAL.indexOf(search.en_us)
                const ukLowerFlage = search.uk_ua && item.EN_VAL.indexOf(search.uk_ua)
                const elLowerFlage = search.el_gr && item.EN_VAL.indexOf(search.el_gr)
                if (zhUpperFlage > -1 || enLowerFlage > -1 || ukLowerFlage > -1 || elLowerFlage > -1 || enUpperFlage > -1) {
                    searchList.push(item)
                }
            })
            setZhList([...searchList])
            setTotal(searchList.length)
            setPage({ ...pagination })
            setLoading(false)
            return
        }
        const first = (pagination.current - 1) * pagination.pageSize
        const teng = lang.slice(first, first + pagination.pageSize)
        setZhList([...teng])
        setPage({ ...pagination })
        setTotal(lang.length)
        setLoading(false)
    }
    const handle = (name, zhName, languageType) => {
        if (escape(name).indexOf("%u") < 0) {
            return name || zhName + languageType //没有包含中文
        }
        return zhName + languageType
    }
    const downloadExcel = () => {
        // lang 是列表数据
        var option = {};
        var dataTable = [];
        if (lang) {
            for (let i in lang) {
                if (lang) {
                    let obj = {
                        'KEY': lang[i].ID,
                        '中文': lang[i].ZH_VAL,
                        '英文': handle(lang[i].EN_VAL, lang[i].ZH_VAL, '[en]'),
                        '乌克兰文': handle(lang[i].UK_VAL, lang[i].ZH_VAL, '[uk]'),
                        '希腊文': handle(lang[i].EL_VAL, lang[i].ZH_VAL, '[el]'),
                    };
                    dataTable.push(obj);
                }
            }
        }
        option.fileName = '国际化';
        option.datas = [
            {
                sheetData: dataTable,
                sheetName: 'sheet',
                sheetFilter: ['KEY', '中文', '英文', '乌克兰文', '希腊文'],
                sheetHeader: ['KEY', '中文', '英文', '乌克兰文', '希腊文'],
                columnWidths: [14, 16, 20, 20, 20],
                frozenRowCount: 1
            },
        ];
        console.log(option)

        const toExcel = new ExportJsonExcel(option); // new
        toExcel.saveExcel();
    };
    const downloadZHExcel = (params) => {
        // lang 是列表数据
        var option = {};
        var dataTable = [];
        if (lang) {
            for (let i in lang) {
                if (lang) {
                    let obj = {
                        'KEY': lang[i].ID,
                        '中文': !params.EN_VAL && !params.UK_VAL && !params.EL_VAL ? lang[i].ZH_VAL : undefined,
                        '英文': params.EN_VAL ? handle(lang[i][params.EN_VAL], lang[i].ZH_VAL, '[en]') : undefined,
                        '乌克兰文': params.UK_VAL ? handle(lang[i][params.UK_VAL], lang[i].ZH_VAL, '[uk]') : undefined,
                        '希腊文': params.EL_VAL ? handle(lang[i][params.EL_VAL], lang[i].ZH_VAL, '[el]') : undefined,
                    };
                    dataTable.push(obj);
                }
            }
        }
        option.fileName = '国际化' + params.language;
        option.datas = [
            {
                sheetData: dataTable,
                sheetName: 'sheet',
                sheetFilter: ['KEY', params.language],
                sheetHeader: ['KEY', params.language],
                columnWidths: [16, 20]
            },
        ];
        const toExcel = new ExportJsonExcel(option); // new
        toExcel.saveExcel();
    }
    return <div className='parent-box'>
        <div className='header-from'>
            <Form form={queryForm} name='func'>
                <Row>
                    {/*中文 */}
                    <CosInputText name={['search', 'zh_cn']} label={<FormattedMessage id='lbl.chinese' />} span={6} formlayouts={formlayouts} capitalized={false} />
                    {/*英文 */}
                    <CosInputText name={['search', 'en_us']} label={<FormattedMessage id='lbl.english' />} span={6} formlayouts={formlayouts} capitalized={false} />
                    {/*乌克兰文 */}
                    <CosInputText name={['search', 'uk_ua']} label={<FormattedMessage id='lbl.uk' />} span={6} formlayouts={formlayouts} capitalized={false} />
                    {/*希腊文 */}
                    <CosInputText name={['search', 'el_gr']} label={<FormattedMessage id='lbl.el' />} span={6} formlayouts={formlayouts} capitalized={false} />
                </Row>
            </Form>
            {/* 查询条件 */}
            <div className='query-condition'><Button type="primary"><FormattedMessage id='lbl.search-terms' /></Button> </div>
        </div>
        <div className='main-button'>
            <div className='button-left'>
                {/* 保存 */}
                {/* <CosButton icon={<SaveOutlined/>}><FormattedMessage id='btn.save'/></CosButton> */}
                {/* 下载 */}
                <Button onClick={() => downloadExcel()} icon={<CloudDownloadOutlined />}>下载全部</Button>
                {/* <CosButton onClick={() => downloadExcel()} icon={<CloudDownloadOutlined />}><FormattedMessage id='btn.downloadAll' /></CosButton> */}
                {/* 下载中文 */}
                <Button onClick={() => downloadZHExcel({ language: '中文' })} icon={<CloudDownloadOutlined />}>中文</Button>
                {/* <CosButton onClick={() => downloadZHExcel({ language: '中文' })} icon={<CloudDownloadOutlined />}><FormattedMessage id='btn.downloadZH' /></CosButton> */}
                {/* 下载英文 */}
                <Button onClick={() => downloadZHExcel({ EN_VAL: 'EN_VAL', language: '英文' })} icon={<CloudDownloadOutlined />}>英文</Button>
                {/* <CosButton onClick={() => downloadZHExcel({ EN_VAL: 'EN_VAL', language: '英文' })} icon={<CloudDownloadOutlined />}><FormattedMessage id='btn.downloadEN' /></CosButton> */}
                {/* 下载乌克兰文 */}
                <Button onClick={() => downloadZHExcel({ UK_VAL: 'UK_VAL', language: '乌克兰文' })} icon={<CloudDownloadOutlined />}>乌克兰文</Button>
                {/* <CosButton onClick={() => downloadZHExcel({ UK_VAL: 'UK_VAL', language: '乌克兰文' })} icon={<CloudDownloadOutlined />}><FormattedMessage id='btn.downloadUK' /></CosButton> */}
                {/* 希腊文 */}
                <Button onClick={() => downloadZHExcel({ EL_VAL: 'EL_VAL', language: '希腊文' })} icon={<CloudDownloadOutlined />}>希腊文</Button>
                {/* <CosButton onClick={() => downloadZHExcel({ EL_VAL: 'EL_VAL', language: '希腊文' })} icon={<CloudDownloadOutlined />}><FormattedMessage id='btn.downloadEL' /></CosButton> */}
            </div>
            <div className='button-right'>
                {/* 重置 */}
                <Button onClick={() => queryForm.resetFields()} icon={<ReloadOutlined />}><FormattedMessage id='btn.reset' /></Button>
                {/* 查询按钮 */}
                <Button onClick={() => pageChange(page)} icon={<SearchOutlined />}><FormattedMessage id='btn.search' /></Button>
            </div>
        </div>
        <div className="footer-table budget-tracking">
            <CosPaginationTable
                columns={zhColumns}
                dataSource={zhList}
                rowSelection={null}
                rowKey='ID'
                pageSize={page.pageSize}
                current={page.current}
                pageChange={pageChange}
                total={total}
                scrollHeightMinus={200} />
        </div>
        <CosLoading spinning={loading} />
    </div>
}
export default language