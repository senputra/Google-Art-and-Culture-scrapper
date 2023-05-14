import { PlaywrightCrawler, RequestQueue } from "crawlee";
import { BASE_URL } from "./constants";
import { writeFile, writeFileSync } from "fs";

const requestQueue = await RequestQueue.open();
requestQueue.addRequest({
  url: "https://artsandculture.google.com/entity/claude-monet/m01xnj",
});

const crawler = new PlaywrightCrawler({
  requestQueue,

  requestHandler: async ({ page, log }) => {
    await page.waitForLoadState("domcontentloaded");
    const nextButton = page.locator(
      "#exp_tab_popular > div > div > div.bYeTje.CMCEae.BcYSHe "
    );
    const tileSelector = "div.wcg9yf > div > a";

    const allItemCount = parseInt(
      (
        await page
          .locator("div.fGDKld.qR3Mzb > div > div.mrslJ.ZjAUM.IfFPle > h3")
          .innerText()
      ).split(" ")[0],
      10
    );
    log.info(`allItemCount: ${allItemCount}`);
    let currentCount = 0;

    while (currentCount < allItemCount) {
      await nextButton.click();
      await page.waitForTimeout(500);
      currentCount = await page.locator(tileSelector).count();
      log.info(`currentVount: ${currentCount}`);
    }

    const allImageLinks = await page.locator(tileSelector).all();

    const links = [];
    for (const link of allImageLinks) {
      const imageLink = await link.getAttribute("href");
      links.push(`${BASE_URL}${imageLink}`);
    }

    log.info("Writing links to file");
    writeFileSync("links.txt", links.join("\n"));
  },
  //   headless: false,
  navigationTimeoutSecs: 3600,
});

await crawler.run();
