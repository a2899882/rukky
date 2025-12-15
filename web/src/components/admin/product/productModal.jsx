'use client';
import React, {useEffect, useRef, useState} from 'react';
import {
    Button, Cascader,
    Divider,
    Input,
    message, Modal, Select, Table, TreeSelect,
} from 'antd';
import LabelPanel from "@/components/admin/labelPanel";
import FormLabel from "@/components/admin/formLabel";
import axiosInstance from "@/utils/axios";
import ImageUpload from "@/components/admin/imageUpload";
import TextArea from "antd/es/input/TextArea";
import {Space} from "antd";
import dynamic from 'next/dynamic'
import PropertyPanel from "@/components/admin/product/propertyPanel";
import { Checkbox } from 'antd';
import MediaPickerModal from '@/components/admin/mediaPickerModal';
const CheckboxGroup = Checkbox.Group;

const WangEditor = dynamic(
    () => import('/src/components/admin/wangEditor.jsx'),
    {ssr: false}
)

const ProductModal = ({isOpen, onRequestClose, initialItem}) => {

    const [currentItem, setCurrentItem] = useState(initialItem || {})

    const [loading, setLoading] = useState(false);

    const divRef = React.useRef(null);

    const [categoryOptions, setCategoryOptions] = useState([]);

    // 为了制造Upload而用
    const [imageList, setImageList] = useState([]);

    const [mediaOpen, setMediaOpen] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);

    const [skuCoverOpen, setSkuCoverOpen] = useState(false);
    const [skuEditingKey, setSkuEditingKey] = useState(null);

    const [bulkSkuCoverOpen, setBulkSkuCoverOpen] = useState(false);
    const [selectedSkuRowKeys, setSelectedSkuRowKeys] = useState([]);
    const [bulkPatch, setBulkPatch] = useState({ price: '', stock: '', status: '', cover: '' });

    const propertyRef = useRef(null);

    // 维度多选
    const plainOptions = [
        { label: '推荐', value: 'Recommend' },
        { label: '精选', value: 'Feature' },
    ];
    const [checkedList, setCheckedList] = useState([]);
    const handleCheckboxChanged = (name,value) => {
        setCheckedList(value);
        let valueText = value.join(",")
        setCurrentItem((prev) => ({...prev, [name]: valueText}));
    };

    const fetchCategoryData = async () => {
        try {
            const {code, msg, data} = await axiosInstance.get('/myapp/admin/category/list');
            if (code === 0) {
                setCategoryOptions(data);
            } else {
                message.error(msg || '网络异常')
            }
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {

        const handler = setTimeout(() => {

            // 制造适合Upload的数据格式
            if (initialItem?.cover?.length > 0) {
                setImageList(initialItem?.cover?.split("#").map((item) => ({
                    success: true,
                    name: item,
                    status: 'done',
                    url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
                })));
            } else {
                setImageList([]);
            }

            // 制造dimension的checkList
            if (initialItem?.dimension?.length > 0) {
                setCheckedList(initialItem?.dimension?.split(","));
            } else {
                setCheckedList([]);
            }

            // 初始化currentItem
            const baseItem = initialItem || {};

            const parseAttrsPairs = (attrs) => {
                if (!attrs) return [];
                if (typeof attrs === 'string') {
                    try {
                        const parsed = JSON.parse(attrs);
                        return parseAttrsPairs(parsed);
                    } catch (e) {
                        return [];
                    }
                }
                if (Array.isArray(attrs)) {
                    return attrs.map((v, idx) => ({ k: String(idx), v: String(v ?? '') }));
                }
                if (typeof attrs === 'object') {
                    return Object.entries(attrs).map(([k, v]) => ({ k: String(k), v: String(v ?? '') }));
                }
                return [];
            }

            const pairsToAttrsText = (pairs) => {
                const obj = {};
                (Array.isArray(pairs) ? pairs : []).forEach((p) => {
                    const k = (p?.k ?? '').trim();
                    if (!k) return;
                    obj[k] = (p?.v ?? '').trim();
                });
                return JSON.stringify(obj);
            }

            // 将后端返回的 skus 结构转换为本地表格数据
            let skuRows = [];
            if (Array.isArray(baseItem.skus)) {
                skuRows = baseItem.skus.map((s) => ({
                    _key: String(s.id || Math.random()),
                    id: s.id,
                    attrsPairs: parseAttrsPairs(s.attrs),
                    attrsText: s.attrs ? JSON.stringify(s.attrs) : '',
                    price: s.price || '',
                    stock: (s.stock ?? 0),
                    cover: s.cover || '',
                    status: s.status || '0',
                }));
            } else if (typeof baseItem.skus === 'string' && baseItem.skus.trim()) {
                try {
                    const parsed = JSON.parse(baseItem.skus);
                    if (Array.isArray(parsed)) {
                        skuRows = parsed.map((s) => ({
                            _key: String(s.id || Math.random()),
                            id: s.id,
                            attrsPairs: parseAttrsPairs(s.attrs),
                            attrsText: s.attrs ? JSON.stringify(s.attrs) : '',
                            price: s.price || '',
                            stock: (s.stock ?? 0),
                            cover: s.cover || '',
                            status: s.status || '0',
                        }));
                    }
                } catch (e) {
                    skuRows = [];
                }
            }

            skuRows = skuRows.map((r) => {
                const pairs = Array.isArray(r.attrsPairs) ? r.attrsPairs : [];
                const nextText = (r.attrsText || '').trim() ? r.attrsText : pairsToAttrsText(pairs);
                const nextLabel = (Array.isArray(pairs) ? pairs : [])
                    .filter((p) => (p?.k ?? '').trim())
                    .map((p) => `${String(p.k).trim()}:${String(p.v ?? '').trim()}`)
                    .join(' / ');
                return { ...r, attrsPairs: pairs, attrsText: nextText, label: nextLabel };
            });

            const inferDimsFromRows = (rows) => {
                const dimsMap = new Map();
                (Array.isArray(rows) ? rows : []).forEach((r) => {
                    (Array.isArray(r?.attrsPairs) ? r.attrsPairs : []).forEach((p) => {
                        const k = String(p?.k ?? '').trim();
                        const v = String(p?.v ?? '').trim();
                        if (!k || !v) return;
                        if (!dimsMap.has(k)) dimsMap.set(k, new Set());
                        dimsMap.get(k).add(v);
                    });
                });
                const dims = Array.from(dimsMap.entries()).map(([k, set]) => ({
                    k,
                    valuesText: Array.from(set).join(',')
                }));
                return dims.length ? dims : [{ k: 'Color', valuesText: '' }, { k: 'Size', valuesText: '' }];
            };

            setCurrentItem({ ...baseItem, skuRows, skuDims: inferDimsFromRows(skuRows) })
            if (divRef.current) {
                divRef.current.scrollTop = 0; // 滚动到 0
            }
            fetchCategoryData()
        }, 100); // 100ms延迟防抖

        // 清除实现防抖
        return () => {
            clearTimeout(handler);
        };
    }, [initialItem])

    const commit = () => {
        console.log("commit-->", currentItem);
        // todo 参数检查
        handleSave()
    }

    const handleSave = async () => {

        if (!currentItem.title) {
            message.error("请输入名称");
            return;
        }
        if (!currentItem.category) {
            message.error("请选择分类");
            return;
        }
        if (!currentItem.cover) {
            message.error("请上传图片");
            return;
        }

        if (!propertyRef.current.handleCheckSubmit()) {
            message.error("参数不能留空");
            return;
        }

        // SKU validation
        const skuRowsForCheck = Array.isArray(currentItem.skuRows) ? currentItem.skuRows : [];
        const seen = new Set();
        for (const r of skuRowsForCheck) {
            const pairs = Array.isArray(r?.attrsPairs) ? r.attrsPairs : [];
            const cleanPairs = pairs
                .map((p) => ({ k: String(p?.k ?? '').trim(), v: String(p?.v ?? '').trim() }))
                .filter((p) => p.k || p.v);

            if (!cleanPairs.length) continue;

            const keySet = new Set();
            for (const p of cleanPairs) {
                if (!p.k) {
                    message.error('SKU 属性 Key 不能为空');
                    return;
                }
                if (keySet.has(p.k)) {
                    message.error(`SKU 属性 Key 重复：${p.k}`);
                    return;
                }
                keySet.add(p.k);
            }

            const attrsText = skuPairsToAttrsText(cleanPairs);
            try {
                JSON.parse(attrsText);
            } catch (e) {
                message.error('SKU attrs 生成的 JSON 非法');
                return;
            }

            if (seen.has(attrsText)) {
                message.error('SKU 属性组合重复（同一组 attrs 出现多次）');
                return;
            }
            seen.add(attrsText);
        }
        try {
            setLoading(true);
            const post_url = currentItem.id ? '/myapp/admin/thing/update' : '/myapp/admin/thing/create';
            const formData = new FormData();
            if (currentItem.id) {
                formData.append('id', currentItem.id);
            }
            formData.append('title', currentItem.title || '');
            formData.append('category', currentItem.category);
            formData.append('summary', currentItem.summary || '');
            formData.append('price', currentItem.price || '');
            formData.append('track_stock', currentItem.track_stock || '2');
            formData.append('stock', String(currentItem.stock ?? 0));
            formData.append('dimension', currentItem.dimension || '');
            formData.append('cover', currentItem.cover || '');
            formData.append('video', currentItem.video || '');
            formData.append('description', currentItem.description || '');
            formData.append('seo_title', currentItem.seo_title || '');
            formData.append('seo_description', currentItem.seo_description || '');
            formData.append('seo_keywords', currentItem.seo_keywords || '');
            formData.append('properties', currentItem.properties || '');

            // SKU rows -> JSON payload
            const skuRows = Array.isArray(currentItem.skuRows) ? currentItem.skuRows : [];
            const skuPayload = skuRows
                .filter((r) => (r.attrsText || '').trim().length > 0)
                .map((r) => {
                    let attrs = null;
                    try {
                        attrs = JSON.parse(r.attrsText);
                    } catch (e) {
                        attrs = r.attrsText;
                    }
                    const row = {
                        attrs,
                        price: r.price,
                        stock: Number(r.stock || 0),
                        cover: r.cover,
                        status: r.status || '0',
                    };
                    if (r.id) row.id = r.id;
                    return row;
                });
            formData.append('skus', JSON.stringify(skuPayload));
            formData.append('status', currentItem.status || '0');

            const {code, msg, data} = await axiosInstance.post(post_url, formData);
            if (code === 0) {
                message.success("操作成功")
                onRequestClose(true)
            } else {
                message.error(msg || '网络异常')
            }
            setLoading(false);
        } catch (err) {
            console.log(err)
            setLoading(false)
        }
    };


    // 更新子组件传来的值
    const handleInputChange = (name, value) => {
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    const setSkuRows = (updater) => {
        setCurrentItem((prev) => {
            const prevRows = Array.isArray(prev?.skuRows) ? prev.skuRows : [];
            const nextRows = typeof updater === 'function' ? updater(prevRows) : updater;
            return { ...prev, skuRows: nextRows };
        });
    }

    const skuPairsToAttrsText = (pairs) => {
        const obj = {};
        (Array.isArray(pairs) ? pairs : []).forEach((p) => {
            const k = (p?.k ?? '').trim();
            if (!k) return;
            obj[k] = (p?.v ?? '').trim();
        });
        return JSON.stringify(obj);
    }

    const skuPairsToLabel = (pairs) => {
        return (Array.isArray(pairs) ? pairs : [])
            .filter((p) => (p?.k ?? '').trim())
            .map((p) => `${String(p.k).trim()}:${String(p.v ?? '').trim()}`)
            .join(' / ');
    }

    const addSkuRow = () => {
        const dims = Array.isArray(currentItem?.skuDims) ? currentItem.skuDims : [];
        const attrsPairs = (dims.length ? dims : [{ k: 'Color' }, { k: 'Size' }]).map((d) => ({ k: d?.k || '', v: '' }));
        setSkuRows((rows) => ([
            ...rows,
            {
                _key: `tmp_${Date.now()}_${Math.random()}`,
                id: null,
                attrsPairs,
                attrsText: skuPairsToAttrsText(attrsPairs),
                label: skuPairsToLabel(attrsPairs),
                price: '',
                stock: 0,
                cover: '',
                status: '0',
            }
        ]));
    }

    const removeSkuRow = (_key) => {
        setSkuRows((rows) => rows.filter((r) => r._key !== _key));
    }

    const updateSkuRow = (_key, patch) => {
        setSkuRows((rows) => rows.map((r) => (r._key === _key ? { ...r, ...patch } : r)));
    }

    const updateSkuAttrsPairs = (_key, nextPairs) => {
        const pairs = Array.isArray(nextPairs) ? nextPairs : [];
        updateSkuRow(_key, {
            attrsPairs: pairs,
            attrsText: skuPairsToAttrsText(pairs),
            label: skuPairsToLabel(pairs),
        });
    }

    const setSkuDims = (updater) => {
        setCurrentItem((prev) => {
            const prevDims = Array.isArray(prev?.skuDims) ? prev.skuDims : [];
            const nextDims = typeof updater === 'function' ? updater(prevDims) : updater;
            return { ...prev, skuDims: nextDims };
        });
    }

    const cartesian = (arrays) => {
        if (!arrays.length) return [[]];
        return arrays.reduce((acc, cur) => {
            const res = [];
            acc.forEach((a) => {
                cur.forEach((c) => res.push([...a, c]));
            });
            return res;
        }, [[]]);
    }

    const normalizePairs = (pairs) => {
        const list = (Array.isArray(pairs) ? pairs : [])
            .map((p) => ({ k: String(p?.k ?? '').trim(), v: String(p?.v ?? '').trim() }))
            .filter((p) => p.k);
        list.sort((a, b) => a.k.localeCompare(b.k));
        return list;
    }

    const generateSkuCombinations = () => {
        const dims = Array.isArray(currentItem?.skuDims) ? currentItem.skuDims : [];
        const normalizedDims = dims
            .map((d) => ({
                k: String(d?.k ?? '').trim(),
                values: String(d?.valuesText ?? '')
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
            }))
            .filter((d) => d.k);

        if (!normalizedDims.length) {
            message.error('请先填写 SKU 维度');
            return;
        }
        if (normalizedDims.some((d) => !d.values.length)) {
            message.error('请为每个维度填写至少一个值（逗号分隔）');
            return;
        }

        const existing = Array.isArray(currentItem?.skuRows) ? currentItem.skuRows : [];
        const existingMap = new Map();
        existing.forEach((r) => {
            const key = skuPairsToAttrsText(normalizePairs(r?.attrsPairs));
            if (!key || key === '{}') return;
            existingMap.set(key, r);
        });

        const combos = cartesian(normalizedDims.map((d) => d.values));
        const nextRows = combos.map((combo) => {
            const attrsPairs = normalizedDims.map((d, idx) => ({ k: d.k, v: combo[idx] }));
            const normPairs = normalizePairs(attrsPairs);
            const attrsText = skuPairsToAttrsText(normPairs);
            const label = skuPairsToLabel(normPairs);
            const old = existingMap.get(attrsText);
            if (old) {
                return {
                    ...old,
                    attrsPairs: normPairs,
                    attrsText,
                    label,
                };
            }
            return {
                _key: `gen_${Date.now()}_${Math.random()}`,
                id: null,
                attrsPairs: normPairs,
                attrsText,
                label,
                price: '',
                stock: 0,
                cover: '',
                status: '0',
            };
        });

        setSkuRows(nextRows);
        setSelectedSkuRowKeys([]);
        message.success(`已生成 ${nextRows.length} 个 SKU`);
    }

    const applyBulkPatch = () => {
        const patch = {};
        if ((bulkPatch.price ?? '') !== '') patch.price = bulkPatch.price;
        if ((bulkPatch.stock ?? '') !== '') patch.stock = bulkPatch.stock;
        if ((bulkPatch.status ?? '') !== '') patch.status = bulkPatch.status;
        if ((bulkPatch.cover ?? '') !== '') patch.cover = bulkPatch.cover;

        const rows = Array.isArray(currentItem?.skuRows) ? currentItem.skuRows : [];
        if (!rows.length) return;

        const useSelected = Array.isArray(selectedSkuRowKeys) && selectedSkuRowKeys.length;
        setSkuRows((prev) => prev.map((r) => {
            if (useSelected && !selectedSkuRowKeys.includes(r._key)) return r;
            return { ...r, ...patch };
        }));
        message.success(useSelected ? '已批量应用到选中 SKU' : '已批量应用到全部 SKU');
    }

    const pickSkuCover = (_key) => {
        setSkuEditingKey(_key);
        setSkuCoverOpen(true);
    }

    const handleSelectChange = (name, value) => {
        console.log('value----', value)
        setCurrentItem((prev) => ({...prev, [name]: value}));
    };

    const handleTreeSelectChange = (name, value) => {
        setCurrentItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUploadChange = (imageUrlList) => {
        let cover = (imageUrlList && imageUrlList.length > 0) ? imageUrlList.join("#") : null;
        setCurrentItem((prev) => ({...prev, cover: cover}));
    };

    const applyVideoName = (names) => {
        const list = Array.isArray(names) ? names : [];
        const first = list[0];
        if (!first) return;
        setCurrentItem((prev) => ({ ...prev, video: first }));
    }

    const applyMediaNames = (names) => {
        const list = Array.isArray(names) ? names : [];
        if (!list.length) return;

        const existing = (currentItem.cover || '').split('#').filter(Boolean);
        const merged = [...new Set([...existing, ...list])];
        setCurrentItem((prev) => ({ ...prev, cover: merged.join('#') }));

        setImageList(
            merged.map((item) => ({
                success: true,
                name: item,
                status: 'done',
                url: process.env.NEXT_PUBLIC_BASE_URL + '/upload/img/' + item,
            }))
        );
    }

    const handleHtmlChange = (value) => {
        setCurrentItem((prev) => ({...prev, description: value}));
    };

    const handlePropertyChange = (value) => {
        setCurrentItem((prev) => ({...prev, properties: JSON.stringify(value || [])}));
    };

    const modalStyles = {
        mask: {
            backdropFilter: 'blur(10px)',
        },
    };

    console.log('currentItem----------->', currentItem)

    return (
        <>
        <Modal
            title={currentItem.id ? '编辑' : '新增'}
            centered
            open={isOpen}
            onCancel={() => onRequestClose(false)}
            footer={null}
            width={1100}
            styles={{
                mask: {
                    backdropFilter: 'blur(10px)',
                },
            }}
        >
            <div className="flex flex-col">
                <div>
                    <div ref={divRef} className="max-h-[75vh] overflow-y-auto">
                        <LabelPanel title="基本信息"></LabelPanel>
                        <div className="flex flex-col gap-6 px-2 py-2">
                            <div className="flex flex-row gap-4">
                                <FormLabel title="名称" required={true}></FormLabel>
                                <Input placeholder="请输入产品名称" value={currentItem.title}
                                       onChange={(e) => handleInputChange("title", e.target.value)}
                                       maxLength={100}
                                       style={{width: 300}}/>
                            </div>

                            <div className="flex flex-row gap-4">
                                <FormLabel title="分类" required={true}></FormLabel>
                                <TreeSelect
                                    dropdownStyle={{maxHeight: 300, overflow: 'auto', minWidth: 300}}
                                    style={{
                                        width: 300,
                                    }}
                                    placeholder="请选择"
                                    value={currentItem.category}
                                    placement='bottomLeft'
                                    allowClear
                                    fieldNames={{label: 'title', value: 'id', children: 'children'}}
                                    onChange={(value) => handleTreeSelectChange("category", value)}
                                    treeData={categoryOptions}
                                />
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <FormLabel title="产品维度"></FormLabel>
                                <CheckboxGroup options={plainOptions} value={checkedList} onChange={(value)=>handleCheckboxChanged("dimension",value)} />
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <FormLabel title="价格"></FormLabel>
                                <Input placeholder="选填" value={currentItem.price}
                                       onChange={(e) => handleInputChange("price", e.target.value)}
                                       style={{width: 300}}/>
                            </div>

                            <div className="flex flex-row gap-4">
                                <FormLabel title="库存管理"></FormLabel>
                                <Select
                                    placeholder="是否启用库存"
                                    value={currentItem.track_stock || '2'}
                                    style={{ width: 300 }}
                                    onChange={(value)=>handleSelectChange('track_stock', value)}
                                    options={[
                                        { value: '2', label: '关闭（不校验库存）' },
                                        { value: '1', label: '开启（下单校验库存）' },
                                    ]}
                                />
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <FormLabel title="库存数量"></FormLabel>
                                <Input
                                    placeholder="0"
                                    value={currentItem.stock}
                                    onChange={(e) => handleInputChange('stock', e.target.value)}
                                    style={{width: 300}}
                                />
                            </div>
                            <div className="flex flex-row gap-4">
                                <FormLabel title="摘要" required={true}></FormLabel>
                                <TextArea
                                    placeholder="请输入产品摘要"
                                    autoSize={{
                                        minRows: 3,
                                        maxRows: 6,
                                    }}
                                    showCount
                                    maxLength={500}
                                    value={currentItem.summary}
                                    onChange={(e) => handleInputChange("summary", e.target.value)}
                                    style={{width: 600}}
                                />
                            </div>
                            <div className="flex flex-row gap-4 min-h-[100px]">
                                <FormLabel title="图片" required={true}></FormLabel>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Button onClick={() => setMediaOpen(true)}>从媒体库选择</Button>
                                    </div>
                                    <ImageUpload maxCount={5}
                                                 maxSize={5}
                                                 accept="image/*"
                                                 imageList={imageList}
                                                 onImageUploadChange={handleImageUploadChange}/>
                                </div>
                            </div>

                            <div className="flex flex-row gap-4 items-center">
                                <FormLabel title="主视频"></FormLabel>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2 items-center">
                                        <Button onClick={() => setVideoOpen(true)}>从媒体库选择视频</Button>
                                        <div className="text-xs text-gray-500">{currentItem.video || '未选择'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row gap-4">
                                <FormLabel title="是否启用"></FormLabel>
                                <Select
                                    defaultValue="0"
                                    placeholder="请选择状态"
                                    value={currentItem.status}
                                    style={{ width: 400 }}
                                    onChange={(value)=>handleSelectChange('status', value)}
                                    options={[
                                        { value: '0', label: '是' },
                                        { value: '1', label: '否' },
                                    ]}
                                />
                            </div>
                        </div>
                        <Divider/>

                        <LabelPanel title="产品详情"></LabelPanel>
                        <div className="flex flex-col gap-4 px-2 py-2">
                            <WangEditor htmlText={currentItem.description} onHtmlResult={handleHtmlChange}/>
                        </div>

                        <Divider/>

                        <LabelPanel title="产品参数"></LabelPanel>
                        <div className="flex flex-col gap-4 px-2 py-2">
                            <PropertyPanel ref={propertyRef} properties={currentItem.properties}
                                           handlePropertyChange={handlePropertyChange}/>
                        </div>

                        <Divider/>

                        <LabelPanel title="SKU 变体"></LabelPanel>
                        <div className="flex flex-col gap-3 px-2 py-2">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        维度配置：Key + 值（逗号分隔），用于一键生成组合 SKU。
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="small" onClick={() => setSkuDims((dims) => ([...dims, { k: '', valuesText: '' }]))}>+ 维度</Button>
                                        <Button size="small" type="primary" onClick={generateSkuCombinations}>一键生成SKU组合</Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {(Array.isArray(currentItem?.skuDims) ? currentItem.skuDims : []).map((d, idx) => (
                                        <div key={`dim_${idx}`} className="flex items-center gap-2">
                                            <Input
                                                value={d?.k}
                                                placeholder="维度Key（如 Color / Size）"
                                                style={{ width: 180 }}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setSkuDims((dims) => dims.map((x, i) => i === idx ? { ...x, k: v } : x));
                                                }}
                                            />
                                            <Input
                                                value={d?.valuesText}
                                                placeholder="值（逗号分隔，如 Red,Blue）"
                                                style={{ width: 360 }}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setSkuDims((dims) => dims.map((x, i) => i === idx ? { ...x, valuesText: v } : x));
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                danger
                                                onClick={() => setSkuDims((dims) => dims.filter((_, i) => i !== idx))}
                                            >
                                                删除
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border border-gray-200 rounded px-2 py-2">
                                <div className="text-xs text-gray-500">
                                    批量编辑：默认作用于全部 SKU；如果你在表格里选中了行，则只作用于选中行。
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Input
                                        value={bulkPatch.price}
                                        placeholder="批量价格"
                                        style={{ width: 140 }}
                                        onChange={(e) => setBulkPatch((p) => ({ ...p, price: e.target.value }))}
                                    />
                                    <Input
                                        value={bulkPatch.stock}
                                        placeholder="批量库存"
                                        style={{ width: 120 }}
                                        onChange={(e) => setBulkPatch((p) => ({ ...p, stock: e.target.value }))}
                                    />
                                    <Select
                                        allowClear
                                        value={bulkPatch.status || undefined}
                                        placeholder="批量状态"
                                        style={{ width: 140 }}
                                        onChange={(value) => setBulkPatch((p) => ({ ...p, status: value || '' }))}
                                        options={[
                                            { value: '0', label: '上架' },
                                            { value: '1', label: '下架' },
                                        ]}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={bulkPatch.cover}
                                            placeholder="批量封面（可选）"
                                            style={{ width: 200 }}
                                            onChange={(e) => setBulkPatch((p) => ({ ...p, cover: e.target.value }))}
                                        />
                                        <Button size="small" onClick={() => setBulkSkuCoverOpen(true)}>从媒体库选</Button>
                                    </div>
                                    <Button type="primary" onClick={applyBulkPatch}>应用</Button>
                                    <Button onClick={() => setBulkPatch({ price: '', stock: '', status: '', cover: '' })}>清空</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    说明：每行一个 SKU，属性用键值方式维护，会自动生成 label。
                                </div>
                                <Button onClick={addSkuRow}>新增SKU</Button>
                            </div>

                            <Table
                                rowKey={(r) => r._key}
                                dataSource={Array.isArray(currentItem.skuRows) ? currentItem.skuRows : []}
                                rowSelection={{
                                    selectedRowKeys: selectedSkuRowKeys,
                                    onChange: (keys) => setSelectedSkuRowKeys(keys),
                                }}
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Attrs',
                                        dataIndex: 'attrsPairs',
                                        key: 'attrsPairs',
                                        render: (v, row) => {
                                            const pairs = Array.isArray(row.attrsPairs) ? row.attrsPairs : [];
                                            return (
                                                <div className="flex flex-col gap-2">
                                                    {pairs.map((p, idx) => (
                                                        <div key={`${row._key}_${idx}`} className="flex items-center gap-2">
                                                            <Input
                                                                value={p?.k}
                                                                placeholder="Key"
                                                                style={{ width: 120 }}
                                                                onChange={(e) => {
                                                                    const next = pairs.map((x, i) => (i === idx ? { ...x, k: e.target.value } : x));
                                                                    updateSkuAttrsPairs(row._key, next);
                                                                }}
                                                            />
                                                            <Input
                                                                value={p?.v}
                                                                placeholder="Value"
                                                                style={{ width: 140 }}
                                                                onChange={(e) => {
                                                                    const next = pairs.map((x, i) => (i === idx ? { ...x, v: e.target.value } : x));
                                                                    updateSkuAttrsPairs(row._key, next);
                                                                }}
                                                            />
                                                            <Button
                                                                size="small"
                                                                danger
                                                                onClick={() => {
                                                                    const next = pairs.filter((_, i) => i !== idx);
                                                                    updateSkuAttrsPairs(row._key, next);
                                                                }}
                                                            >
                                                                删除
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                const next = [...pairs, { k: '', v: '' }];
                                                                updateSkuAttrsPairs(row._key, next);
                                                            }}
                                                        >
                                                            + 属性
                                                        </Button>
                                                        <div className="text-xs text-gray-500 truncate max-w-[260px]">
                                                            {row.label || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    },
                                    {
                                        title: 'Price',
                                        dataIndex: 'price',
                                        key: 'price',
                                        width: 140,
                                        render: (v, row) => (
                                            <Input
                                                value={v}
                                                placeholder="" 
                                                onChange={(e) => updateSkuRow(row._key, { price: e.target.value })}
                                            />
                                        )
                                    },
                                    {
                                        title: 'Stock',
                                        dataIndex: 'stock',
                                        key: 'stock',
                                        width: 120,
                                        render: (v, row) => (
                                            <Input
                                                value={v}
                                                placeholder="0"
                                                onChange={(e) => updateSkuRow(row._key, { stock: e.target.value })}
                                            />
                                        )
                                    },
                                    {
                                        title: 'Cover',
                                        dataIndex: 'cover',
                                        key: 'cover',
                                        width: 220,
                                        render: (v, row) => (
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs text-gray-500 truncate max-w-[120px]">{v || '未选择'}</div>
                                                <Button size="small" onClick={() => pickSkuCover(row._key)}>选择</Button>
                                            </div>
                                        )
                                    },
                                    {
                                        title: 'Status',
                                        dataIndex: 'status',
                                        key: 'status',
                                        width: 140,
                                        render: (v, row) => (
                                            <Select
                                                value={v || '0'}
                                                style={{ width: 120 }}
                                                onChange={(value) => updateSkuRow(row._key, { status: value })}
                                                options={[
                                                    { value: '0', label: '上架' },
                                                    { value: '1', label: '下架' },
                                                ]}
                                            />
                                        )
                                    },
                                    {
                                        title: '操作',
                                        key: 'action',
                                        width: 90,
                                        render: (_, row) => (
                                            <Button danger size="small" onClick={() => removeSkuRow(row._key)}>删除</Button>
                                        )
                                    }
                                ]}
                            />
                        </div>

                        <LabelPanel title="SEO优化"></LabelPanel>
                        <div className="flex flex-col gap-4 px-2 py-2">
                            <div className="flex flex-row gap-4">
                                <FormLabel title="SEO标题"></FormLabel>
                                <Input placeholder="请输入SEO标题" value={currentItem.seo_title}
                                       onChange={(e) => handleInputChange("seo_title", e.target.value)}
                                       style={{width: 600}}/>
                            </div>
                            <div className="flex flex-row gap-4">
                                <FormLabel title="SEO关键词"></FormLabel>
                                <Input placeholder="请输入SEO关键词" value={currentItem.seo_keywords}
                                       onChange={(e) => handleInputChange("seo_keywords", e.target.value)}
                                       style={{width: 600}}/>
                            </div>
                            <div className="flex flex-row gap-4">
                                <FormLabel title="SEO描述"></FormLabel>
                                <TextArea
                                    placeholder="请输入SEO描述"
                                    autoSize={{
                                        minRows: 3,
                                        maxRows: 6,
                                    }}
                                    showCount
                                    maxLength={200}
                                    value={currentItem.seo_description}
                                    onChange={(e) => handleInputChange("seo_description", e.target.value)}
                                    style={{width: 600}}
                                />
                            </div>
                        </div>

                    </div>
                </div>
                <Divider/>

                <div className="flex flex-row gap-4">
                    <Button loading={loading} type="primary" onClick={() => commit()}>提交</Button>
                    <Button onClick={() => onRequestClose(false)}>取消</Button>
                </div>
            </div>
        </Modal>

        <MediaPickerModal
            open={mediaOpen}
            onCancel={() => setMediaOpen(false)}
            onOk={(names) => {
                setMediaOpen(false);
                applyMediaNames(names);
            }}
            multiple={true}
            initialDir="img"
            initialType="image"
        />

        <MediaPickerModal
            open={videoOpen}
            onCancel={() => setVideoOpen(false)}
            onOk={(names) => {
                setVideoOpen(false);
                applyVideoName(names);
            }}
            multiple={false}
            initialDir="file"
            initialType="video"
        />

        <MediaPickerModal
            open={bulkSkuCoverOpen}
            onCancel={() => setBulkSkuCoverOpen(false)}
            onOk={(names) => {
                const list = Array.isArray(names) ? names : [];
                const first = list[0];
                setBulkSkuCoverOpen(false);
                if (first) {
                    setBulkPatch((p) => ({ ...p, cover: first }));
                }
            }}
            multiple={false}
            initialDir="img"
            initialType="image"
        />

        <MediaPickerModal
            open={skuCoverOpen}
            onCancel={() => setSkuCoverOpen(false)}
            onOk={(names) => {
                const list = Array.isArray(names) ? names : [];
                const first = list[0];
                setSkuCoverOpen(false);
                if (skuEditingKey && first) {
                    updateSkuRow(skuEditingKey, { cover: first });
                }
                setSkuEditingKey(null);
            }}
            multiple={false}
            initialDir="img"
            initialType="image"
        />
    </>
);
};
export default ProductModal;