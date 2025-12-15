import styles from './htmlPanel.module.css'

export default function HtmlPanel({htmlText}) {


    return (
        <div id="editor-content-view" className={styles['editor-content-view']}
             dangerouslySetInnerHTML={{__html: htmlText}}></div>
    )
}