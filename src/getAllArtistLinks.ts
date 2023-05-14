import { Dataset, PlaywrightCrawler, RequestQueue } from "crawlee";
import { BASE_URL } from "./constants";

export const getAllArtistLinks = async () => {
  const requestQueue = await RequestQueue.open();
  const alphabets = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "-",
  ];

  for (const alphabet of alphabets) {
    requestQueue.addRequest({
      url: `${BASE_URL}/category/artist?tab=az&pr=${alphabet}`,
      uniqueKey: `artists_${alphabet}`,
    });
  }

  const crawler = new PlaywrightCrawler({
    requestQueue,
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    async requestHandler({ page, request, log }) {
      // Extract <title> text with Cheerio.
      // See Cheerio documentation for API docs.
      const ctxLog = log.child({
        prefix: `${request.uniqueKey} - ${request.id}`,
      });
      ctxLog.info(`URL is "${request.url}".`);
      const ds = await Dataset.open(request.uniqueKey);

      let prevLength = -1;
      let currLength = await page
        .locator("#tab_az > div > div > div > ul.sGe3x > li > a")
        .count();

      while (prevLength !== currLength) {
        ctxLog.info(`Loaded ${currLength} links`);
        page.mouse.wheel(0, 15000);
        await page.waitForTimeout(1000);

        prevLength = currLength;
        currLength = await page
          .locator("#tab_az > div > div > div > ul.sGe3x > li > a")
          .count();
      }

      const allLis = await page
        .locator("#tab_az > div > div > div > ul.sGe3x > li > a")
        .all();
      ctxLog.info(`Found ${allLis.length} links`);
      for (const li of allLis) {
        const artistUrl = await li.getAttribute("href");
        const artistName = await li
          .locator("span > span > span.lR1tHf")
          .innerText();

        ds.pushData({
          artistName,
          artistUrl,
        });
      }

      await ds.exportToCSV(request.uniqueKey, {});
      ctxLog.info(`Exported ${request.uniqueKey}.json`);
    },
    requestHandlerTimeoutSecs: 3600,
    //   headless: false,
    autoscaledPoolOptions: {
      // desiredConcurrency: 4,
    },
  });

  await crawler.run();
};
