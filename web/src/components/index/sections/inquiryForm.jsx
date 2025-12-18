'use client'
import React from 'react';
import api from "@/utils/axiosApi";
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";


const InquiryForm = () => {
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        tel: '',
        company: '',
        country: '',
        quantity: '',
        preferred_contact: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        description: '',
        variant: 'default' // 'default' or 'destructive'
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const showAlert = (title, description, variant = 'default') => {
        setAlertState({
            open: true,
            title,
            description,
            variant
        });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, open: false }));
    };

    useEffect(() => {
        try {
            const product = searchParams?.get('inquiryProduct') || '';
            const productId = searchParams?.get('inquiryProductId') || '';
            const sku = searchParams?.get('inquirySku') || '';
            const url = searchParams?.get('inquiryUrl') || '';
            const orderNo = searchParams?.get('inquiryOrderNo') || '';
            const token = searchParams?.get('inquiryToken') || '';

            const parts = [];
            if (product || sku || url) {
                parts.push(`Hi, I'm interested in: ${product || ''}${productId ? ` (ID: ${productId})` : ''}`);
                if (sku) parts.push(`SKU/Variant: ${sku}`);
                if (url) parts.push(`Product URL: ${url}`);
            }
            if (orderNo || token) {
                parts.push('---');
                if (orderNo) parts.push(`Order No: ${orderNo}`);
                if (token) parts.push(`Query Token: ${token}`);
            }

            const prefill = parts.join('\n');
            if (prefill) {
                setFormData((prev) => {
                    if (prev.message && String(prev.message).trim()) return prev;
                    return { ...prev, message: prefill };
                });
            }
        } catch (e) {
        }
    }, [searchParams]);

    const sendInquiryData = async (e) => {
        e.preventDefault();

        // 基本验证
        if (!formData.name || !formData.email || !formData.message) {
            showAlert('Validation Failed', 'Please fill in all required fields (Name, Email, and Message)', 'destructive');
            return;
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert('Validation Failed', 'Please enter a valid email address', 'destructive');
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('tel', formData.tel);
            submitData.append('company', formData.company);
            submitData.append('country', formData.country);
            submitData.append('quantity', formData.quantity);
            submitData.append('preferred_contact', formData.preferred_contact);
            submitData.append('message', formData.message);

            const { code, msg } = await api.post('/myapp/index/inquiry/create', submitData);

            if (code === 0) {
                showAlert('Submission Successful', 'Thanks! We will contact you within 1-2 business days.', 'default');
                // 重置表单
                setFormData({
                    name: '',
                    email: '',
                    tel: '',
                    company: '',
                    country: '',
                    quantity: '',
                    preferred_contact: '',
                    message: ''
                });
            } else {
                showAlert('Submission Failed', msg || 'Please try again later', 'destructive');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('Submission Failed', 'Please check your network connection', 'destructive');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AlertDialog open={alertState.open} onOpenChange={closeAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {alertState.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertState.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="bg-mainColorNormal hover:bg-mainColorDeep text-white" onClick={closeAlert}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="transform transition duration-300 hover:translate-y-[-5px]">
                <h2 className="text-xl font-bold mb-6 border-b border-gray-200 pb-2">Inquiry Form</h2>
                <form className="space-y-4" onSubmit={sendInquiryData}>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="name">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Your Name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="email">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Your Email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="tel">
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="tel"
                            value={formData.tel}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Your Phone (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="company">
                            Company
                        </label>
                        <input
                            type="text"
                            id="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Your Company (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="country">
                            Country/Region
                        </label>
                        <input
                            type="text"
                            id="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Your Country (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="quantity">
                            Quantity
                        </label>
                        <input
                            type="text"
                            id="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Expected Quantity (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="preferred_contact">
                            Preferred Contact
                        </label>
                        <select
                            id="preferred_contact"
                            value={formData.preferred_contact}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                        >
                            <option value="">No preference</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="wechat">WeChat</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-gray-600" htmlFor="message">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 transition focus:outline-none"
                            placeholder="Your Message"
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-mainColorNormal hover:bg-mainColorDeep text-white py-2 rounded-md transition duration-300 transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default InquiryForm;