'use client';
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import { adminPath, adminLoginPath } from "@/utils/adminPath";

export default function Page() {

    const router = useRouter();

    useEffect(() => {
        let admintoken = localStorage.getItem('admintoken');
        if(!admintoken){
            router.push(adminLoginPath());
        }else {
            router.push(adminPath('/main'));
        }
    }, []);

    return (
        <div>

        </div>
    )
}