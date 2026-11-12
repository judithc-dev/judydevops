const STORE = {
  id: "petal-paper",
  name: "Petal & Paper",
  theme: "petal",
  headline: "Little things. Lovely moments.",
  intro: "Stationery, thoughtful gifts, and little details for your everyday desk.",
  collectionTitle: "The stationery collection",
  cartTitle: "Your little bag",
  heroImage: "https://images.unsplash.com/photo-1611079830811-865ff4428d17?w=1200&q=85",
  heroAlt: "A white spiral notebook and pen on a soft gray surface",
  giftWrapPrice: 49,
  compare: false,
  products: [
    {
      id: "journal",
      name: "Everyday Spiral Notebook",
      category: "Journals",
      spec: "Spiral binding · Everyday notes",
      price: 349,
      image: "https://images.unsplash.com/photo-1611079830811-865ff4428d17?w=640&q=80"
    },
    {
      id: "pen",
      name: "Studio Writing Pen",
      category: "Writing",
      spec: "Slim profile · Black ink",
      price: 199,
      image: "https://images.unsplash.com/photo-1669139660221-19454e55751e?w=640&q=80"
    },
    {
      id: "gift",
      name: "Ribbon Gift Box",
      category: "Gifts",
      spec: "Ribbon finish · Ready to gift",
      price: 749,
      image: "https://images.unsplash.com/photo-1545844568-98bb15133ec0?w=640&q=80"
    },
    {
      id: "cards",
      name: "Everyday Note Cards",
      category: "Writing",
      spec: "Blank cards · Matching envelopes",
      price: 249,
      image: "https://images.unsplash.com/photo-1645377976224-883672f187c4?w=640&q=80"
    },
    {
      id: "tray",
      name: "Woodland Desk Tray",
      category: "Desk",
      spec: "Warm wood finish · Keeps small items together",
      price: 649,
      image: "https://images.unsplash.com/photo-1657036238304-4c902cd7c171?w=640&q=80"
    },
    {
      id: "pouch",
      name: "Studio Stationery Pouch",
      category: "Desk",
      spec: "Zip closure · Room for pens and markers",
      price: 449,
      image: "https://images.unsplash.com/photo-1632822300275-9867abf24bbe?w=640&q=80"
    }
  ]
};
if (typeof module !== "undefined" && module.exports) {
  module.exports = STORE;
}