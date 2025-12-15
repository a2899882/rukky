"use client";

import * as React from "react";
import {useTheme} from "next-themes";


export function ModeToggle() {
    const {setTheme} = useTheme();

    return (
        <div className=" flex flex-col items-center justify-center gap-y-2 border rounded p-4 ">
            <span>Theme</span>
            <button className="btn" onClick={() => setTheme("light")}>light</button>
            <button className="btn" onClick={() => setTheme("dark")}>dark</button>
        </div>
    );

}
