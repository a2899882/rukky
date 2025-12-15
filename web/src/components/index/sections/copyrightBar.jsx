export default function CopyrightBar({siteName='', classStyle=''}) {
    const year = new Date().getFullYear();
    return (
        <div className={classStyle}>
            Copyright {year} • &nbsp;
            <a href="/" className="hover:text-mainColorNormal transition-colors">
                {siteName}
            </a>
        </div>
    )
}