import asyncio
import aiohttp
import time

# 配置你的接口列表, 只要填写url即可
URL_LIST = [
    "http://127.0.0.1:8000/myapp/index/home/section",
    # 继续添加url
]

CONCURRENCY = 20  # 并发数（每个接口）
TOTAL_REQUESTS = 200  # 每个接口总请求数


async def fetch(session, sem, url):
    start = time.time()
    try:
        async with sem:
            async with session.get(url, timeout=10) as response:
                status = response.status
                text = await response.text()
                print('text----', str(text))
                elapsed = time.time() - start
                print('status----', str(status), '---diff-----',str(elapsed))
                return {"status": response.status, "elapsed": elapsed}
    except Exception as e:
        elapsed = time.time() - start
        return {"status": -1, "elapsed": elapsed, "error": str(e)}


async def test_url(url):
    sem = asyncio.Semaphore(CONCURRENCY)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, sem, url) for _ in range(TOTAL_REQUESTS)]
        results = await asyncio.gather(*tasks)

    success = sum(1 for r in results if r["status"] == 200)
    failed = TOTAL_REQUESTS - success
    avg_time = sum(r["elapsed"] for r in results) / TOTAL_REQUESTS

    print(f"\n接口: {url}")
    print(f"  总请求: {TOTAL_REQUESTS}")
    print(f"  成功: {success}")
    print(f"  失败: {failed}")
    print(f"  平均响应时间: {avg_time:.3f}秒")
    # 可选：输出失败原因
    # for r in results:
    #     if r["status"] != 200:
    #         print("  错误:", r.get("error"))


async def main():
    start = time.time()
    await asyncio.gather(*(test_url(url) for url in URL_LIST))
    print(f"\n全部接口测试完毕，总耗时: {time.time() - start:.2f}秒")


if __name__ == "__main__":
    asyncio.run(main())