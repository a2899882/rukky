from playwright.sync_api import sync_playwright

url = "http://mytest.com"  # 替换为你想访问的网址

with sync_playwright() as p:
    # browser = p.chromium.launch(headless=False)  # headless=False 即为有头模式
    browser = p.firefox.launch(headless=False)  # headless=False 即为有头模式
    # browser = p.webkit.launch(headless=False)  # headless=False 即为有头模式
    page = browser.new_page()
    page.goto(url)
    print(f"已打开 {url}，当前页面标题为 {page.title()}")
    input("按回车键关闭浏览器...")
    browser.close()