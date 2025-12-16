'use client';
import {Montserrat} from 'next/font/google';
import "@/styles/globals.css";
import SideBar from "@/components/admin/sidebar";
import Header from "@/components/admin/header";
import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {adminLoginPath, adminPath} from "@/utils/adminPath";


const font = Montserrat({subsets: ["latin"], weight: "400"})


export default function AdminLayout({children}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('admintoken');
        if (!token) {
            router.push(adminLoginPath());
            return;
        }

        const mustChange = localStorage.getItem('admin_must_change_password');
        const target = adminPath('/forceChangePassword');
        if (mustChange === '1' && pathname !== target) {
            router.push(target);
        }
    }, [pathname, router]);


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
