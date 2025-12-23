//@ts-ignore
import { CurrencyResult, DictionaryResult, KnowledgePanelResult, OrganicResult, searchWithPages, TimeResult } from 'google-sr';

import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { createAction, PieceAuth, Property } from 'workflow-blocks-framework';
import { getProxies, scrollToBottom } from '../../common/crawling';

export const crawlingWithTiktok = createAction({
    name: 'crawling-with-google',
    displayName: 'Crawling with google',
    auth: PieceAuth.None(),
    requireAuth: false,
    description: 'Crawl text and image from google without API',
    props: {
        query: Property.LongText({
            displayName: 'Query',
            required: true,
        }),
        timeout: Property.Number({
            displayName: 'Timeout (ms)',
            required: true,
            defaultValue: 60000,
        }),
        proxy: Property.LongText({
            displayName: 'Proxy',
            required: false,
            description: 'Can add a comma separated list of proxies.',
        }),
        crawlType: Property.StaticDropdown({
            displayName: 'Crawl type',
            required: true,
            options: {
                options: [
                    { label: 'Text', value: 'text' },
                    { label: 'Image', value: 'image' },
                    { label: 'Audio', value: 'audio' },
                    { label: 'Video', value: 'video' },
                    { label: 'Documents', value: 'documents' },
                ],
            },
        }),
        maxPage: Property.Number({
            displayName: 'Max pages',
            required: true,
            description: 'Number of page want to crawl',
            defaultValue: 2,
        }),
        hostLanguage: Property.ShortText({
            displayName: 'Host language (hl)',
            required: true,
            defaultValue: 'en',
        }),
        country: Property.ShortText({
            displayName: 'Country (geolocation)',
            required: true,
            defaultValue: 'us',
        }),
    },
    async run(context) {
        const { query, maxPage, timeout, crawlType, hostLanguage, country, proxy } = context.propsValue;

        const proxies = getProxies(proxy || '');

        if (crawlType === 'image') {
            const images = await googleImageSearch(query, hostLanguage, country, maxPage, Number(timeout), proxies);
            return images;
        }
        if (crawlType === 'audio') {
            const images = await googleImageSearch(query, hostLanguage, country, maxPage, Number(timeout), proxies);
            return images;
        }
        if (crawlType === 'video') {
            const images = await googleImageSearch(query, hostLanguage, country, maxPage, Number(timeout), proxies);
            return images;
        }
        if (crawlType === 'documents') {
            const images = await googleImageSearch(query, hostLanguage, country, maxPage, Number(timeout), proxies);
            return images;
        }

        const text = await googleTextSearch(query, hostLanguage, country, maxPage, Number(timeout));
        return text;
    },
});

async function googleTextSearch(query: string, hostLanguage: string, country: string, maxPages: number = 2, timeout: number = 60000) {
    const result = await searchWithPages({
        query: query,
        resultTypes: [OrganicResult, DictionaryResult, TimeResult, CurrencyResult, KnowledgePanelResult],
        pages: maxPages,
        delay: timeout,
        requestConfig: {
            params: {
                hl: hostLanguage,
                gl: country,
            },
        },
    });

    return result;
}

async function googleImageSearch(
    query: string,
    hostLanguage: string,
    country: string,
    maxPages: number = 2,
    timeout: number = 60000,
    proxies: string[] = []
) {
    console.log('### Running crawl google image');

    // Google Image Search URL
    const baseURL = `https://www.google.com/search?hl=${hostLanguage}&gl=${country}&tbm=isch&q=${encodeURIComponent(query)}`;

    const allImageUrls = new Set<string>();

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
                    waitUntil: 'domcontentloaded',
                    timeout: timeout,
                });
                await scrollToBottom(page);

                const imageUrls = await page.$$eval('img', (imgs) => imgs.map((img: any) => img.src).filter((src: string) => src.startsWith('http')));
                function getImageSizeFromUrl(url: string): Promise<{ width: number, height: number }> {
                    return new Promise((resolve, reject) => {
                      const img = new Image();
                      img.onload = () => {
                        resolve({ width: img.naturalWidth, height: img.naturalHeight });
                      };
                      img.onerror = (err) => {
                        reject(new Error(`Failed to load image from ${url}`));
                      };
                      img.src = url;
                    });
                }
                imageUrls.forEach((url) => {
                    getImageSizeFromUrl(url)
                      .then(({ width, height }) => {
                        console.log(`Image at ${url} is ${width}x${height}`);
                        if(width > 480 && height > 480) {
                            allImageUrls.add(url);
                        }
                        
                      })
                      .catch((err) => {
                        console.error(`Error loading image at ${url}:`, err.message);
                      });
                  });
                
                await page.waitForTimeout(1000);
            } catch (error) {
                console.error(`Error processing ${request.url}:`, error);
                throw error;
            }
        },

        failedRequestHandler({ request }) {
            console.log(`Request ${request.url} failed after ${timeout}ms`);
        },
    });
    for (let i = 0; i < maxPages; i++) {
        const pageURL = `${baseURL}&start=${i * 20}`;
        console.log('pageURL', pageURL);
        await crawler.run([pageURL]);
    }

    return Array.from(allImageUrls);
}
