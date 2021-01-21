const puppeteer = require("puppeteer");
const fs = require("fs");
const codes = require("./codes");

(async function () {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75"
  );

  const items = [];

  for (const code of codes) {
    for (const item of code.products) {
      items.push(item);
    }
  }

  for (const item of items) {
    if (!fs.existsSync(`./products/${item}.html`)) {
      await sleep(2000);

      await page.goto(`https://pokupki.market.yandex.ru/product/${item}`);
      // Full access to the browser environment.
      await page.evaluate(() => {});

      const html = await page.content();

      if (html.length < 600000) {
        await browser.close();
        await sleep(1.8e6);
        browser = await puppeteer.launch();
        page = await browser.newPage();
        page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75"
        );
      } else {
        fs.writeFileSync(`./products/${item}.html`, html);
      }
    }
  }
  await browser.close();
})();
