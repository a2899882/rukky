import React from 'react';

const FormLabel = ({title, required, labelWidth=80}) => {


    return (
        <span
            className={`text-[14px] text-[#777] h-[30px] leading-[30px] flex flex-row items-center`}
            style={{ width: `${labelWidth}px` }}
           >
            <div>{title} </div>
            <div className="flex flex-col items-center mx-1">
                {required ? <span className="text-red-500 font-bold text-[14px] ">*</span> : null}
            </div>
        </span>
    );
};
export default FormLabel;