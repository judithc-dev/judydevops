const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const app = require("./server.cjs");


let server;
let baseUrl;


before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = "http://127.0.0.1:" + server.address().port;
});


after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => {
      if (error) reject(error);
      else resolve();
    });
  });
});


test("health endpoint identifies Judith's store", async () => {
  const response = await fetch(baseUrl + "/health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    store: "petal-paper"
  });
});


test("product endpoint returns Judith's six products", async () => {
  const response = await fetch(baseUrl + "/api/products");
  assert.equal(response.status, 200);


  const products = await response.json();
  assert.equal(products.length, 6);
  assert.deepEqual(
    products.map(product => product.id).sort(),
    ["cards", "gift", "journal", "pen", "pouch", "tray"]
  );


  for (const product of products) {
    assert.equal(typeof product.name, "string");
    assert.ok(Number.isFinite(product.price) && product.price > 0);
  }
});


test("storefront and separate cart page are available", async () => {
  const shop = await fetch(baseUrl + "/");
  assert.equal(shop.status, 200);
  assert.ok((await shop.text()).includes('href="cart.html"'));


  const cart = await fetch(baseUrl + "/cart.html");
  assert.equal(cart.status, 200);
  assert.ok((await cart.text()).includes('id="cart-items"'));
});