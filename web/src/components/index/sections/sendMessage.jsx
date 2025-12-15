'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, MessageSquareText, X, ChevronDown, ChevronUp } from 'lucide-react'
import api from "@/utils/axios";
import lang from '@/locales';

export default function SendMessage() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setStatus({ type: '', message: '' });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 基本验证
        if (!formData.name || !formData.email || !formData.message) {
            setStatus({
                type: 'error',
                message: lang.FillRequiredFields
            });
            return;
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setStatus({
                type: 'error',
                message: lang.EnterValidEmail
            });
            return;
        }

        try {
            setLoading(true);
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('tel', formData.phone);
            submitData.append('message', formData.message);

            const { code, msg } = await api.post('/myapp/index/inquiry/create', submitData);

            if (code === 0) {
                setStatus({
                    type: 'success',
                    message: lang.WillContactSoon
                });
                // 重置表单
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    message: ''
                });
            } else {
                setStatus({
                    type: 'error',
                    message: msg || lang.TryAgainLater
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus({
                type: 'error',
                message: lang.CheckConnection
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed right-6 bottom-6 z-50">
            {/* 聊天按钮 */}
            <button
                onClick={toggleChat}
                aria-label="Send Message"
                className="flex items-center justify-center size-10 md:size-12 bg-mainColorNormal text-white rounded-full shadow-lg hover:bg-mainColorDeep transition-colors"
            >
                {isOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <MessageSquareText className="w-5 h-5" />
                )}
            </button>

            {/* 聊天对话框 */}
            <div 
                className={`absolute bottom-14 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out transform origin-bottom-right ${
                    isOpen ? 'scale-100 ' : 'scale-0'
                } `}
                
                style={{
                    maxHeight: 'calc(100vh - 8rem)',
                    overflowY: 'auto'
                }}
            >
                <div className="p-4 bg-mainColorNormal text-white rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{lang.SendUsAMessage}</h3>
                    <button 
                        onClick={toggleChat}
                        className="text-white hover:text-gray-200 focus:outline-none"
                    >
                        {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`p-4 space-y-4`}>
                    {status.message && (
                        <div 
                            className={`p-2 text-sm rounded ${
                                status.type === 'error' 
                                    ? 'bg-red-50 text-red-600' 
                                    : 'bg-green-50 text-green-600'
                            }`}
                        >
                            {status.message}
                        </div>
                    )}
                    
                    <div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={lang.YourName}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-mainColorNormal focus:border-mainColorNormal"
                            required
                        />
                    </div>
                    
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={lang.YourEmail}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-mainColorNormal focus:border-mainColorNormal"
                            required
                        />
                    </div>
                    
                    <div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder={lang.PhoneNumber}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-mainColorNormal focus:border-mainColorNormal"
                        />
                    </div>
                    
                    <div>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={lang.YourMessage}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-mainColorNormal focus:border-mainColorNormal"
                            required
                        ></textarea>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-mainColorNormal hover:bg-mainColorDeep text-white font-medium py-2 rounded-sm text-sm transition-colors disabled:opacity-70"
                    >
                        {loading ? lang.SendingMessage : lang.SendMessage}
                    </button>
                </form>
            </div>
        </div>
    )
}