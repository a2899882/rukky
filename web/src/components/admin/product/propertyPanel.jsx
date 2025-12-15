
import React, {useState, useEffect, forwardRef, useImperativeHandle} from 'react'
import {Button, Input} from "antd";


const PropertyPanel = React.forwardRef(({ properties, handlePropertyChange}, ref) => {

    const [items, setItems] = useState( []);

    useEffect (() => {
        if(properties && properties.length>0){
            setItems(JSON.parse(properties))
        }else {
            setItems([])
        }
    },[properties])

    const handleAddItem = () => {
        setItems([...items, { name: '', value: '' }]);
    };

    const handleInputChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
        console.log(newItems)
        handlePropertyChange(newItems)
    };
    const handleCheckSubmit = () => {
        for (const item of items) {
            if (!item.name || !item.value) {
                // setError('属性名和属性值都不能为空！');
                return false;
            }
        }
        return true
    };

    useImperativeHandle(ref, () => ({
        handleCheckSubmit
    }));

    const handleDeleteItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        handlePropertyChange(newItems)
    };


    return (
        <div>
            <ul>
                {items?.map((item, index) => (
                    <li key={index} style={{marginBottom:'16px'}}>
                        <Input
                            type="text"
                            placeholder="属性名"
                            style={{width: '200px'}}
                            value={item.name}
                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                        /> &nbsp; : &nbsp;
                        <Input
                            type="text"
                            placeholder="属性值"
                            style={{width: '200px'}}

                            value={item.value}
                            onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                        />
                        <a className="text-adminPrimaryColor" onClick={() => handleDeleteItem(index)} style={{width: '80px',lineHeight:'32px',textAlign:'center', marginLeft:'16px'}}>删除</a>
                    </li>
                ))}
            </ul>
            <Button onClick={handleAddItem}>添加属性</Button>
        </div>
    );
});

PropertyPanel.displayName = 'PropertyPanel'; // 设置 displayName

export default PropertyPanel
