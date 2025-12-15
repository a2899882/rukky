'use client';
import {Montserrat} from 'next/font/google';
import "@/styles/globals.css";
import SideBar from "@/components/admin/sidebar";
import Header from "@/components/admin/header";


const font = Montserrat({subsets: ["latin"], weight: "400"})


export default function AdminLayout({children}) {


    return (
        <div className="flex flex-row min-w-[768px] h-screen max-h-screen">
            <SideBar></SideBar>
            <div className=" flex-1 flex flex-col  h-screen max-h-screen">
                <Header></Header>
                <div className="flex-1 overflow-y-auto bg-gray-100">{children}</div>
            </div>
        </div>
    );
}
