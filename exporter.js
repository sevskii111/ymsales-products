const fs = require("fs-extra");
const codes = require("./codes");

const products = new Set([
  ...fs.readdirSync("./products").map((filename) => filename.split(".")[0]),
  ...fs.readdirSync("./_products").map((filename) => filename.split(".")[0]),
]);

let result = [];
let categories = {};

function parseProduct(product, code) {
  let productPath = fs.existsSync(`./products/${product}.html`)
    ? `./products/${product}.html`
    : `./_products/${product}.html`;
  const productPage = fs.readFileSync(productPath, "utf-8");
  const fileStats = fs.statSync(productPath);

  const created = fileStats.ctime;

  const imgRegexp = /avatars\.mds\.yandex\.net\/get-mpic\/(?:[^"]+)/m;
  const nameRegexp = /<h1[^>]+>([^<]+)/m;
  const categoryRegexp = /\d"><meta itemprop="item" id="([^"]+)/m;
  const categoryLinkRegexp = /\d"><meta itemprop="item" id="[^"]+" content="([^"]+)/m;

  const dataPos = productPage.indexOf(
    `data-zone-data="{&quot;productId&quot;:${product}`
  );
  const pricePos = productPage.indexOf("price", dataPos);
  let price = -1;
  if (pricePos - dataPos < 10000 && pricePos !== -1) {
    price = parseInt(productPage.substr(pricePos, 30).match(/\d+/)[0]);
  }
  //const priceRegexp = /data-auto="price"(?:[^>]+>){3}([^<]+)/m;

  const img = productPage.match(imgRegexp)[0];
  const name = productPage.match(nameRegexp)[1];
  const category = productPage.match(categoryRegexp)[1];
  const categoryLink = productPage.match(categoryLinkRegexp)[1];
  //const priceRaw = productPage.match(priceRegexp);
  // const price =
  //   priceRaw && productPage.indexOf("К сожалению, товар разобрали") === -1
  //     ? parseInt(priceRaw[1].replace(/\s/g, ""))
  //     : -1;

  categories[category] = JSON.parse(JSON.stringify(categoryLink));
  if (price !== -1) {
    return {
      id: product.split().join(""),
      code: code.code.split().join(""),
      category: category.split().join(""),
      img: `https://${img}`.split().join("").replace("/orig", "/1hq"),
      name: name.split().join(""),
      old_price: price,
      price: price - Math.ceil(price * code.discount),
      created,
    };
  } else {
    return null;
  }
}

for (const code of codes) {
  console.log(code.code);
  for (const product of code.products) {
    //console.log(categories);
    //    console.log(result.length);
    if (products.has(product)) {
      try {
        const productObj = parseProduct(product, code);
        if (productObj !== null) {
          result.push(JSON.parse(JSON.stringify(productObj)));
        }
      } catch (e) {
        console.log(product);
        console.log(e);
      }
    }
  }
}

fs.writeFileSync("products.json", JSON.stringify(result));
fs.writeFileSync("categories.json", JSON.stringify(categories));

// for (const product of products) {
//   const productPage = fs.readFileSync(`./products/${product}`, "utf-8");

//   const dom = new JSDOM(productPage);
//   const document = dom.window.document;
//   const name = document.querySelector("h1").textContent;
//   const categroy = document.querySelector("div[data-auto='breadcrumb-item-2']")
//     .textContent;
//   const priceEl = document.querySelector("div[data-auto='price']");
//   const price = priceEl ? parseInt(priceEl.textContent.replace(/\s/g, "")) : -1;
//   const img = document.querySelector("div[data-zone-name='image'] img").src;

//   console.log(categroy, img, name, price);
//   return;
// }
