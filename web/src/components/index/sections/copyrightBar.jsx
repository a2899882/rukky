export default function CopyrightBar({siteName='', classStyle=''}) {
    const year = new Date().getFullYear();
    return (
        <div className={classStyle}>
            Copyright © {year} • &nbsp;
            <a href="/" className="hover:text-mainColorNormal transition-colors">
                {siteName}
            </a>
            &nbsp;•&nbsp;
            Powered by
            &nbsp;
            <a target="_black" href="https://fktool.com/" className="hover:text-mainColorNormal transition-colors">
                FK
            </a>
        </div>
    )
}