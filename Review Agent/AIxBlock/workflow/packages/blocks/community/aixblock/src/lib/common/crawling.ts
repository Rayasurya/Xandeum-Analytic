import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { Page } from 'playwright';

export async function crawlWebsite(url: string, timeout: number, proxies: string[] = []): Promise<string> {
    let data = '';

    const crawler = new PlaywrightCrawler({
        proxyConfiguration: proxies.length
            ? new ProxyConfiguration({
                  proxyUrls: proxies,
              })
            : undefined,
        launchContext: {
            launchOptions: {
                channel: 'chromium',
            },
        },

        async requestHandler({ page, request }) {
            try {
                await page.goto(request.url, {
                    timeout,
                    waitUntil: 'domcontentloaded',
                });

                await scrollToBottom(page);

                data = await page.content();
            } catch (error) {
                console.error(`Error processing ${request.url}:`, error);
                throw error;
            }
        },

        failedRequestHandler({ request }) {
            console.log(`Request ${request.url} failed after ${timeout}ms`);
        },
    });

    await crawler.run([url]);
    return data;
}

export async function scrollToBottom(page: Page) {
    await page.evaluate(async () => {
        let lastScroll = 0;
        let currentScroll = 0;

        do {
            lastScroll = currentScroll;
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise((resolve) => setTimeout(resolve, 500));
            currentScroll = window.scrollY || document.documentElement.scrollTop;
        } while (currentScroll > lastScroll);
    });
}

export const getProxies = (proxies: string): string[] => {
    if (proxies) {
        return proxies.split(',').map((proxy) => proxy.trim());
    }
    return [];
};
