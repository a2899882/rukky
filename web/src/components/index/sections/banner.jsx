import Image from "next/image";



const imageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&h=1000&q=80";
export default function Banner({title, bannerData}) {

    let imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${bannerData}`

    return (
        <div className="relative w-full h-full bg-gray-300">
            {
                bannerData?.length>0 && (
                    <Image 
                        src={imageUrl} 
                        alt="Banner Image" 
                        className="object-cover" 
                        fill
                        sizes="100vw"
                        priority
                    />
                )
            }
            {/*蒙层*/}
            <div className="absolute w-full h-full  inset-0 bg-black/50"></div>
            {/*文字 - 使用更兼容的居中方案 */}
            <div className="absolute w-full h-full inset-0 flex items-center justify-center">
                <div className="text-center w-full">
                    <h1 className="text-white text-4xl font-bold inline-block">
                        {title}
                    </h1>
                </div>
            </div>

        </div>
    )
}