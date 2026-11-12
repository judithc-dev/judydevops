async function startStore() {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error("Product API returned HTTP " + response.status);
  }


  const products = await response.json();
  if (!Array.isArray(products)) {
    throw new Error("The product API did not return a catalog.");
  }


  const get = id => document.getElementById(id);
  const cartKey = STORE.id + "-cart";
  const giftKey = STORE.id + "-gift-wrap";
  const giftPrice = STORE.giftWrapPrice || 0;
  const isCartPage = document.body.dataset.page === "cart";


  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });
  const money = amount => currency.format(amount);


  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || "{}") || {};
      const items = {};
      for (const product of products) {
        const quantity = saved[product.id];
        if (Number.isSafeInteger(quantity) && quantity > 0) {
          items[product.id] = quantity;
        }
      }
      return items;
    } catch {
      return {};
    }
  }


  let cart = readCart();


  function updateQuantity(id, quantity) {
    if (quantity > 0) {
      cart[id] = quantity;
    } else {
      delete cart[id];
    }


    localStorage.setItem(cartKey, JSON.stringify(cart));
    if (Object.keys(cart).length === 0) {
      localStorage.removeItem(giftKey);
    }
    updateCount();
  }


  function updateCount() {
    const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach(badge => {
      badge.textContent = count;
    });
    return count;
  }


  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }


  function button(label, className, action, accessibleLabel) {
    const node = element("button", className, label);
    node.type = "button";
    if (accessibleLabel) node.setAttribute("aria-label", accessibleLabel);
    node.addEventListener("click", action);
    return node;
  }


  function photo(product, alt) {
    const image = element("img");
    image.src = product.image;
    image.alt = alt;
    image.loading = "lazy";
    return image;
  }


  function initShop() {
    get("headline").textContent = STORE.headline;
    get("intro").textContent = STORE.intro;
    get("hero-image").src = STORE.heroImage;
    get("hero-image").alt = STORE.heroAlt;
    get("collection-title").textContent = STORE.collectionTitle;


    const search = get("search");
    const category = get("category");
    const notice = get("notice");
    let noticeTimer;


    category.add(new Option("All categories", ""));
    for (const name of new Set(products.map(product => product.category))) {
      category.add(new Option(name, name));
    }


    function renderProducts() {
      const query = search.value.trim().toLowerCase();
      const matches = products.filter(product => {
        const text = [product.name, product.category, product.spec]
          .join(" ")
          .toLowerCase();


        return text.includes(query)
          && (!category.value || product.category === category.value);
      });


      get("results").textContent = matches.length
        ? matches.length + (matches.length === 1 ? " product" : " products")
        : "No products match your search.";


      get("products").replaceChildren(...matches.map(product => {
        const card = element("article", "product");
        const details = element("div", "product-details");
        const row = element("div", "row");


        const add = button("Add to cart", "button", () => {
          clearTimeout(noticeTimer);
          try {
            updateQuantity(product.id, (cart[product.id] || 0) + 1);
            notice.textContent = product.name + " added to your bag.";
          } catch {
            cart = readCart();
            updateCount();
            notice.textContent = "Your browser could not save the cart.";
          }
          noticeTimer = setTimeout(() => {
            notice.textContent = "";
          }, 3000);
        }, "Add " + product.name + " to cart");


        row.append(element("strong", "", money(product.price)), add);
        details.append(
          element("small", "muted", product.category),
          element("h3", "", product.name),
          element("p", "muted", product.spec),
          row
        );
        card.append(photo(product, product.name), details);
        return card;
      }));
    }


    search.addEventListener("input", renderProducts);
    category.addEventListener("change", renderProducts);
    renderProducts();


    window.addEventListener("pageshow", () => {
      cart = readCart();
      updateCount();
    });
  }


  function initCart() {
    const giftWrap = get("gift-wrap");
    const cartItems = get("cart-items");


    get("cart-title").textContent = STORE.cartTitle;
    get("gift-option-price").textContent = money(giftPrice);


    function renderCart() {
      const items = products.filter(product => cart[product.id] > 0);
      const count = updateCount();
      const subtotal = items.reduce(
        (sum, product) => sum + product.price * cart[product.id], 0
      );


      const canWrap = giftPrice > 0 && count > 0;
      giftWrap.checked = canWrap && localStorage.getItem(giftKey) === "true";
      const giftFee = giftWrap.checked ? giftPrice : 0;


      get("cart-count").textContent = count + (count === 1 ? " item" : " items");
      get("gift-option").hidden = !canWrap;
      get("gift-row").hidden = giftFee === 0;
      get("gift-price").textContent = money(giftFee);
      get("subtotal").textContent = money(subtotal);
      get("total").textContent = money(subtotal + giftFee);


      if (items.length === 0) {
        const empty = element("div", "empty-cart");
        const link = element("a", "button", "Browse products");
        link.href = "index.html#collection";
        empty.append(element("h2", "", "Your cart is empty"), link);
        cartItems.replaceChildren(empty);
        return;
      }


      cartItems.replaceChildren(...items.map(product => {
        const quantity = cart[product.id];
        const item = element("article", "cart-item");
        const details = element("div");
        const actions = element("div", "cart-actions");
        const controls = element("div", "quantity");


        function quantityButton(label, action, next, accessibleLabel) {
          const control = button(label, action === "remove" ? "text-button" : "", () => {
            updateQuantity(product.id, next);
            renderCart();


            const replacement = Array.from(cartItems.querySelectorAll("button"))
              .find(candidate =>
                candidate.dataset.id === product.id && candidate.dataset.action === action
              );
            (replacement || get("cart-title")).focus({ preventScroll: true });
          }, accessibleLabel);
          control.dataset.id = product.id;
          control.dataset.action = action;
          return control;
        }


        controls.append(
          quantityButton("−", "minus", quantity - 1, "Remove one " + product.name),
          element("span", "", quantity),
          quantityButton("+", "plus", quantity + 1, "Add one " + product.name)
        );
        actions.append(
          controls,
          quantityButton("Remove", "remove", 0, "Remove " + product.name + " from cart")
        );
        details.append(
          element("h3", "", product.name),
          element("p", "muted", money(product.price) + " each"),
          actions
        );
        item.append(
          photo(product, ""),
          details,
          element("strong", "line-total", money(product.price * quantity))
        );
        return item;
      }));
    }


    giftWrap.addEventListener("change", () => {
      localStorage.setItem(giftKey, String(giftWrap.checked));
      renderCart();
    });


    window.addEventListener("pageshow", () => {
      cart = readCart();
      renderCart();
    });


    renderCart();
  }


  document.documentElement.dataset.theme = STORE.theme;
  document.querySelectorAll("[data-brand]").forEach(brand => {
    brand.textContent = STORE.name;
  });
  document.title = isCartPage ? STORE.cartTitle + " | " + STORE.name : STORE.name;


  updateCount();
  if (isCartPage) {
    initCart();
  } else {
    initShop();
  }
}


startStore().catch(error => {
  console.error(error);
  const message = document.createElement("p");
  message.className = "panel";
  message.setAttribute("role", "alert");
  message.textContent =
    "The store could not load. Start it with npm.cmd start and open its local address.";
  document.querySelector("main").prepend(message);
});