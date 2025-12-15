import lang from "@/locales";


export default function DownloadList({downloadData}) {
  // 根据文件扩展名确定图标和颜色
  const getFileIconByType = (filename) => {
    const extension = filename ? filename.split('.').pop().toLowerCase() : '';
    
    // 图标和颜色配置
    const fileTypes = {
      'pdf': {
        color: 'text-red-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.5 18C8.32843 18 9 17.3284 9 16.5C9 15.6716 8.32843 15 7.5 15C6.67157 15 6 15.6716 6 16.5C6 17.3284 6.67157 18 7.5 18Z" />
            <path d="M14.5 13.5C14.5 14.3284 15.1716 15 16 15C16.8284 15 17.5 14.3284 17.5 13.5C17.5 12.6716 16.8284 12 16 12C15.1716 12 14.5 12.6716 14.5 13.5Z" />
            <path d="M7.5 10.5C7.5 11.3284 8.17157 12 9 12C9.82843 12 10.5 11.3284 10.5 10.5C10.5 9.67157 9.82843 9 9 9C8.17157 9 7.5 9.67157 7.5 10.5Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V7C20 5.34315 18.6569 4 17 4Z" />
          </svg>
        )
      },
      'xlsx': {
        color: 'text-green-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10.5H5V9H7V10.5Z" />
            <path d="M7 13.5H5V12H7V13.5Z" />
            <path d="M7 16.5H5V15H7V16.5Z" />
            <path d="M13 10.5H11V9H13V10.5Z" />
            <path d="M13 13.5H11V12H13V13.5Z" />
            <path d="M13 16.5H11V15H13V16.5Z" />
            <path d="M19 10.5H17V9H19V10.5Z" />
            <path d="M19 13.5H17V12H19V13.5Z" />
            <path d="M19 16.5H17V15H19V16.5Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V7C20 5.34315 18.6569 4 17 4Z" />
          </svg>
        )
      },
      'doc': {
        color: 'text-blue-600',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 9.5H12V11H7V9.5Z" />
            <path d="M12 13H7V14.5H12V13Z" />
            <path d="M7 16.5H12V18H7V16.5Z" />
            <path d="M17 9.5H14.5V11H17V9.5Z" />
            <path d="M14.5 13H17V14.5H14.5V13Z" />
            <path d="M17 16.5H14.5V18H17V16.5Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V7C20 5.34315 18.6569 4 17 4Z" />
          </svg>
        )
      },
      'default': {
        color: 'text-gray-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M5.625 1.5C4.58947 1.5 3.75 2.33947 3.75 3.375V20.625C3.75 21.6605 4.58947 22.5 5.625 22.5H18.375C19.4105 22.5 20.25 21.6605 20.25 20.625V8.37868C20.25 7.86577 20.0393 7.37362 19.6642 7.01256L14.4874 1.86574C14.1294 1.50969 13.6456 1.5 13.125 1.5H5.625ZM5.25 3.375C5.25 3.16789 5.41789 3 5.625 3H12.75V6.375C12.75 7.41053 13.5895 8.25 14.625 8.25H18V20.625C18 20.8321 17.8321 21 17.625 21H6.375C6.16789 21 6 20.8321 6 20.625V3.375C6 3.16789 6.16789 3 6.375 3H5.625C5.41789 3 5.25 3.16789 5.25 3.375ZM17.8787 6.75L14.25 3.12132V6.375C14.25 6.58211 14.4179 6.75 14.625 6.75H17.8787Z" />
          </svg>
        )
      }
    };

    // 如果找不到特定扩展名配置，则使用默认
    return fileTypes[extension] || fileTypes['default'];
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* File list */}
        <div className="max-w-4xl mx-auto">
          <ul className="space-y-4">
            {downloadData.map((file) => {
              const fileIcon = getFileIconByType(file.title);

              return (
                <li
                  key={file.id}
                  className="bg-gray-50 border border-gray-100 rounded-lg hover:shadow-md transition-all p-6"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    {/* File icon */}
                    <div className={`flex-shrink-0 mr-4 mb-4 md:mb-0 ${fileIcon.color}`}>
                      {fileIcon.icon}
                    </div>

                    {/* File information */}
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{file.title}</h3>
                      <p className="text-gray-600 mb-2">{file.summary}</p>
                    </div>

                    {/* Download link */}
                    <div className="mt-4 md:mt-0">
                      <a
                        href={file.link || `${process.env.NEXT_PUBLIC_BASE_URL}/upload/file/${file.raw}`}
                        target="_blank"
                        download
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mainColorNormal hover:bg-mainColorDeep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColorNormal transition-colors"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                          {lang.Download}
                      </a>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}