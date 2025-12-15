import React from 'react';

const HeadLabel = ({title, required}) => {

    return (
        <span className="bg-gray-100 text-[13px] w-full text-gray-700 px-3 h-[36px] leading-[36px] flex flex-row items-center">
            <div>{title}</div>
            <div className="flex flex-col items-center mx-1">
                {required ? <span className="text-red-500 font-bold text-[14px] ">*</span> : null}
            </div>
        </span>
    );
};
export default HeadLabel;