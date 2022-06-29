import React, { useState, useEffect } from 'react';
import { Table, Pagination, Row, Col, Button, Tag, Space } from "antd";
import { Resizable } from 'react-resizable';
import { formatCurrencyNew } from '@/utils/commonDataInterface';
import { FormattedMessage, formatMessage, useIntl } from 'umi'

/**
 * @param props
 * columns Array required 列配置
 * rowKey string或者返回string的func 识别数据唯一性的key字段，默认uuid
 * current number 当前显示页，默认为1
 * pageSize number 每页显示数，默认为10
 * rowSelection 行选择的配置，参考antd.Table API，默认checkbox多选，并记录选中的行
 * setSelectedRowsKey func, 外部提供，当表格进行行勾选变化时传递key值数组，和setSelectedRows一起，至少要给一个
 * setSelectedRows func, 外部提供，当表格进行行勾选变化时传递对象数组，和setSelectedRowsKey一起，至少要给一个
 * scroll 滚动条设置，参考antd.Table API
 * scrollHeightMinus 滚动高度减去的值，如果提供了scroll这个就不要了，表格上部其他控件大致占据的高度
 * selectionType 默认多选，可以填写radio切换到单选模式
 *
 * @returns {*}
 * @constructor
 */
const ResizeableTitle = (props) => {
    let resizing = false
    const { onResize, width, onClick, ...restProps } = props;
    if (!width || isNaN(width)) {
        return <th {...restProps} />
    }
    return (
        <Resizable width={width} height={0}
            handle={
                <span className='react-resizable-handle' onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                />
            }
            onResizeStart={() => {
                resizing = true
            }}
            onResizeStop={() => {
                resizing = false;
            }}
            onResize={onResize}>
            <th {...restProps} onClick={(...args) => {
                if (!resizing && onClick) {
                    onClick(...args);
                }
            }} />
        </ Resizable >
    )
}

const PaginationTable = (props) => {
    const { dataSource = [], columns, rowKey, scroll, bordered = true, selectionType = 'checkbox', scrollHeightMinus,
        setSelectedRowsKey, setSelectedRows, current = 1, pageSize = 10, total = 0, pageSizeOptions = [10, 20, 50, 100, 200, 300, 500, 1000, 2000],
        pageChange, pagination = true, rowSelection, selectWithClickRow = false, handleDoubleClickRow } = props;
    const finalColumns = [];

    for (let i = 0; i < columns.length; i++) {
        if(!columns[i]){
            continue;
        }
        if(!columns[i].title){
            continue;
        }
        if (columns[i].title.props == undefined) {
            continue;
        }
        var patternCn = new RegExp("[\u4E00-\u9FA5]+");  //验证是否是中文
        var patternEn = new RegExp("[A-Za-z]+");  //验证是否是英文
        if (patternCn.test(formatMessage({ id: columns[i].title.props.id }))) {  //中文字符长度
            if (formatMessage({ id: columns[i].title.props.id }).length == 2) {
                columns[i].width = 50
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 3) {
                columns[i].width = 60
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 4) {
                columns[i].width = 70
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 5) {
                columns[i].width = 80
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 6) {
                columns[i].width = 90
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 7) {
                columns[i].width = 100
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 8) {
                columns[i].width = 110
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 9) {
                columns[i].width = 120
            }
        } else if (patternEn.test(formatMessage({ id: columns[i].title.props.id }))) {  //英文字符长度
            if (formatMessage({ id: columns[i].title.props.id }).length == 2) {
                columns[i].width = 40
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 3) {
                columns[i].width = 50
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 4) {
                columns[i].width = 55
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 5) {
                columns[i].width = 60
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 6) {
                columns[i].width = 65
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 7) {
                columns[i].width = 70
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 8) {
                columns[i].width = 75
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 9) {
                columns[i].width = 85
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 10) {
                columns[i].width = 85
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 11) {
                columns[i].width = 90
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 12) {
                columns[i].width = 95
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 13) {
                columns[i].width = 100
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 14) {
                columns[i].width = 105
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 15) {
                columns[i].width = 110
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 16) {
                columns[i].width = 120
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 17) {
                columns[i].width = 125
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 18) {
                columns[i].width = 125
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 19) {
                columns[i].width = 130
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 20) {
                columns[i].width = 135
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 21) {
                columns[i].width = 140
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 22) {
                columns[i].width = 145
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 23) {
                columns[i].width = 150
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 24) {
                columns[i].width = 155
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 25) {
                columns[i].width = 160
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 26) {
                columns[i].width = 165
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 27) {
                columns[i].width = 180
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 28) {
                columns[i].width = 180
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 29) {
                columns[i].width = 190
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 30) {
                columns[i].width = 190
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 31) {
                columns[i].width = 190
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 32) {
                columns[i].width = 195
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 33) {
                columns[i].width = 200
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 34) {
                columns[i].width = 205
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 35) {
                columns[i].width = 210
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 36) {
                columns[i].width = 215
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 37) {
                columns[i].width = 220
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 38) {
                columns[i].width = 240
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 39) {
                columns[i].width = 240
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 40) {
                columns[i].width = 240
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 41) {
                columns[i].width = 240
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 42) {
                columns[i].width = 245
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 43) {
                columns[i].width = 250
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 44) {
                columns[i].width = 255
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 45) {
                columns[i].width = 260
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 46) {
                columns[i].width = 265
            } else if (formatMessage({ id: columns[i].title.props.id }).length == 47) { //目前暂未发现大于47字符的英文名称
                columns[i].width = 270
            }
        }
    }


    for (let i = 0; i < columns.length; i += 1) {
        if (columns[i]) {
            if (columns[i].dataType && Array.isArray(columns[i].dataType)) {
                columns[i].render = (text, record) => {
                    let tq
                    var patt1 = new RegExp(/\s+/g)
                    columns[i].dataType.map((item, ind) => {
                        // console.log(item.value,text)
                        // item.value = ' '
                        if (item.value == text) {
                            tq = item.label
                        }
                    })
                    return tq || (patt1.test(text) ? '' :text? ('!Error ' + text):'' ) ;
                }
            } else if (columns[i].dataType && columns[i].dataType == 'dateTime') {
                columns[i].render = (text, record) => {
                    return text && text.split(' ')[0] || '';
                }
            } else if (columns[i].dataType && columns[i].dataType == 'dataAmount') {
                columns[i].render = (text, record) => {
                    return text ? formatCurrencyNew(text) : formatCurrencyNew(0);
                }
            }
            finalColumns.push({
                ellipsis: true,
                ...columns[i],
            })
        }

    }
    const [tengCol, setTengCol] = useState([])
    const [rowKeys, setRowKeys] = useState([]);
    const [rowObjects, setRowObjects] = useState([]);
    const [page, setPage] = useState({ current: 0, pageSize: 0 });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        page.current = current
        page.pageSize = pageSize
        setPage(page)
    })
    useEffect(() => {
        setTengCol(finalColumns)
    }, [columns])
    // 选中某行，外部接口回调返回相关数据
    const handleSelectRowChange = (selectedRowKeys, selectedRows) => {
        setRowKeys(selectedRowKeys);
        setRowObjects(selectedRows);
        // 多行选择时

        if (selectionType === 'checkbox') {
            if (setSelectedRowsKey) {
                setSelectedRowsKey(selectedRowKeys);
            }
            if (setSelectedRows) {
                setSelectedRows(selectedRows);
            }
        }
        if (selectionType === 'radio') {
            if (setSelectedRowsKey) {
                if (selectedRowKeys && Array.isArray(selectedRowKeys)) {
                    console.log(selectedRowKeys)
                    setSelectedRowsKey(selectedRowKeys[0]);

                } else {
                    setSelectedRowsKey(null);
                }
            }
            if (setSelectedRows) {
                if (selectedRows && Array.isArray(selectedRows)) {
                    setSelectedRows(selectedRows[0]);
                } else {
                    setSelectedRows(null);
                }
            }
        }
    };

    const rs = rowSelection || rowSelection === undefined ? {
        type: selectionType,
        selectedRowKeys: rowKeys,
        columnWidth: 55,
        onChange: handleSelectRowChange,
        getCheckboxProps: (record) => {
            return {
                // disabled: record.value === '1'||record.value === '2', // Column configuration not to be checked
                // name: record.label,
            }
        },
        fixed: true,
        ...rowSelection,
    } : rowSelection;
    // 分页控件触发
    const handlePageChange = async (p, ps) => {
        if (ps != page.pageSize) return
        if (pageChange) {
            const pagination = {
                current: p,
                pageSize: ps,
            };
            setPage({ ...pagination });
            setLoading(true);
            setRowKeys([]);
            if (setSelectedRowsKey) {
                setSelectedRowsKey([]);
            }
            if (setSelectedRows) {
                setSelectedRows([]);
            }
            await pageChange(pagination)
            setLoading(false);
            // setFlag(true)
        }
    };
    const handlePageSizeChange = async (p, ps) => {
        if (pageChange) {
            const pagination = {
                current: p,
                pageSize: ps,
            };
            setPage({ ...pagination });
            setLoading(true);
            setRowKeys([]);
            if (setSelectedRowsKey) {
                setSelectedRowsKey([]);
            }
            if (setSelectedRows) {
                setSelectedRows([]);
            }
            console.log(pagination)
            await pageChange(pagination)
            setLoading(false);
        }
    };
    const actScroll = {
        x: 'max-content',
        scrollToFirstRowOnChange: true,
        ...scroll,
    };
    if (scrollHeightMinus) {
        actScroll.y = `${window.innerHeight - scrollHeightMinus}px`;
    }
    const handleTableChange = (pagination, filters, sorter) => {
        setRowKeys([]);
        pageChange && pageChange(page, { filters, sorter })
    }
    const handleClickRow = (record, event) => {

        const selectedKey = [...rowKeys];
        const selectedObject = [...rowObjects];
        const idx = selectedKey.findIndex(item => item === record[rowKey]);
        const objIdx = selectedObject.findIndex(item => item[rowKey] === record[rowKey]);
        if (selectionType === 'checkbox') {
            if (idx >= 0) {
                selectedKey.splice(idx, 1);
                selectedObject.splice(objIdx, 1);
                handleSelectRowChange(selectedKey, selectedObject);
            } else {
                handleSelectRowChange([record[rowKey], ...selectedKey], [record, ...selectedObject]);
            }
        }
        if (selectionType === 'radio') {
            console.log([record[rowKey]])
            if (idx >= 0) {
                handleSelectRowChange([], []);
            } else {
                handleSelectRowChange([record[rowKey]], [record]);
            }
        }
    }

    const components = {
        header: {
            cell: ResizeableTitle,
        },
    }

    const handleResize = index => (e, { size }) => {
        const nextColumns = [...tengCol]
        nextColumns[index] = {
            ...nextColumns[index],
            width: size?.width,
        };
        setTengCol(nextColumns)
    }
    const newtColumns = tengCol.map((col, index) => ({
        ...col,
        onHeaderCell: column => ({
            width: col?.width, // 100 没有设置宽度可以在此写死 例如100试下
            onResize: handleResize(index),
        }),
    }));
    return (<>
        {pagination && dataSource.length ? <Row>
            <Col span={24} style={{ textAlign: 'center' }}>
                <Space size='small'>
                    <Pagination
                        total={total}
                        showTotal={(total, range) => `（${page.current} / ${Math.ceil(total / page.pageSize)}） [TotalCount: ${total}]`}
                        pageSize={page.pageSize}
                        current={page.current}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageSizeChange}
                        pageSizeOptions={pageSizeOptions}
                        showSizeChanger
                        style={{ width: '100%' }}
                    />
                </Space>
            </Col>
        </Row> : null}
        <Row>
            <Col span={24}>
                <Table
                    columns={newtColumns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey={rowKey}
                    rowSelection={rs}
                    components={components}
                    onChange={handleTableChange}
                    loading={loading}
                    scroll={actScroll}
                    bordered={bordered}
                    // summary={ pageData => {
                    //     return (
                    //       <>
                    //         {dataSource.length<=1?<Table.Summary.Row>
                    //             <Table.Summary.Cell index={2} colSpan={1}></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={2} colSpan={100} fixed='left'>
                    //                 23121
                    //             </Table.Summary.Cell>
                    //         </Table.Summary.Row>:null}
                    //     </>
                    //     )
                    // }}
                    onRow={
                        selectWithClickRow ?
                            (record, index) => {
                                return {
                                    onClick: (e) => {
                                        !handleDoubleClickRow && handleClickRow(record, e)
                                    },
                                    onDoubleClick: (e) => {
                                        handleDoubleClickRow && handleDoubleClickRow(record, e)
                                    },
                                };
                            } : undefined
                    }
                    sticky
                />
            </Col>
        </Row>
    </>)
}
export default PaginationTable;