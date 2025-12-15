import Image from "next/image";
import Link from "next/link";

export default function BannerB({title, titleLink, bannerData}) {

    let imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${bannerData}`
    let hasImage = bannerData?.length > 0;

    return (
        <div className="relative w-full h-[200px] md:h-[220px] bg-mainColorLight">
            {
                hasImage && (
                    <>
                        <Image
                            src={imageUrl}
                            alt="Banner Image"
                            className="object-cover"
                            fill
                            quality={90}
                            sizes="100vw"
                            priority
                        />
                        {/*蒙层*/}
                        <div className="absolute w-full h-full inset-0 bg-mainColorNormalAlpha-20"></div>
                    </>
                )
            }

            {/*文字区域*/}
            <div className="absolute w-full h-full inset-0 flex flex-col space-y-4 items-center justify-center">
                {/*标题*/}
                <span className={`${hasImage? 'text-white':'text-gray-900'} text-3xl font-bold`}>{title}</span>
                {/*面包屑*/}
                <div className={`text-sm font-semibold mt-2 ${hasImage? 'text-white':'text-gray-500'}`}>
                    <Link href="/" className="hover:text-mainColorNormal transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href={titleLink} className="hover:text-mainColorNormal transition-colors">{title}</Link>
                </div>
            </div>
        </div>
    )
}