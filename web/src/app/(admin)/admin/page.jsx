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
            const mustChange = localStorage.getItem('admin_must_change_password');
            if (mustChange === '1') {
                router.push(adminPath('/forceChangePassword'));
            } else {
                router.push(adminPath('/main'));
            }
        }
    }, []);

    return (
        <div>

        </div>
    )
}