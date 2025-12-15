import lang from "@/locales";
import Image from "next/image";

export default function ContactUs({contactData}) {
    return (
        <div className="relative h-[300px] md:h-[600px] w-full">
            {/* 背景图片 */}
            <div className="absolute w-full h-full top-0 left-0 inset-0">
                <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${contactData}`}
                    alt="contact us"
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover"
                />
                {/* 深色遮罩 */}
                <div className="absolute w-full h-full top-0 left-0 inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
            </div>

            {/* 内容区域 */}
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
                <h2 className="text-2xl md:text-4xl font-bold mb-6">{lang.ContactUs}</h2>
                <p className="text-base md:text-xl mb-4 max-w-2xl">
                    {lang.ContactUsTip1}
                </p>
                <p className="text-base md:text-xl mb-8 max-w-2xl">
                    {lang.ContactUsTip2}
                </p>
                <a
                    href="/contact"
                    className="inline-block bg-transparent hover:bg-white border-2 border-white hover:border-white text-white hover:text-gray-800 px-8 py-3 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    {lang.GetAQuote}
                </a>
            </div>
        </div>
    );
}