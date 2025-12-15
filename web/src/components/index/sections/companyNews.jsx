import Link from 'next/link';
import Image from 'next/image';
import {formatDate} from "@/utils/tools";
import lang from "@/locales";


export default function CompanyNews({newsData}) {
  return (
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {lang.CompanyNews}
              </h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                  {lang.CompanyNewsTip}
              </p>
          </div>
          <div className="mx-auto w-full mt-16 grid grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-3">
              {newsData.map((post) => (
                  <div
                      key={post.id}
                      className="relative isolate flex flex-col justify-end overflow-hidden rounded-xl bg-gray-900 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                      style={{ paddingBottom: '100%' }}
                  >
                      <div className="absolute w-full h-full top-0 left-0 inset-0 -z-10 overflow-hidden">
                          <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/img/${post.cover}`}
                              alt={post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                              className="object-cover transition-transform duration-500 hover:scale-105" 
                              priority={newsData.indexOf(post) < 3}
                          />
                      </div>
                      
                      <div className="absolute w-full h-full top-0 left-0 inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                      <div className="absolute w-full h-full top-0 left-0 inset-0 -z-10 rounded-xl ring-1 ring-inset ring-gray-900/10" />

                      <div className="absolute bottom-14 left-0 right-0 flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300 px-6">
                          <time dateTime={post.create_time} className="mr-8">
                              {formatDate(post.create_time.slice(0,10))}
                          </time>
                      </div>
                      <h3 className="absolute bottom-0 left-0 right-0 mt-3 text-lg leading-6 font-semibold text-white px-6 pb-6">
                          <Link href={'/news/'+post.id}>
                              <span className="absolute inset-0" />
                              <span className="block truncate">{post.title}</span>
                          </Link>
                      </h3>
                  </div>
              ))}
          </div>
      </div>
  )
}
