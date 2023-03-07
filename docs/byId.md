# byId

If you want to query single objects by id use byId:

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersById = cruncher.byId("orders").get();

// Returns the order or undefined if no order with given id exists
const specificOrder1 = ordersById("ar3k2s1l206");
const specificOrder2 = ordersById("bihg9b0ayn8");

cruncher.update([{ collection: "orders", data: ordersUpdate }]);

const updatedSpecificOrder1 = ordersById("ar3k2s1l206");
const updatedSpecificOrder2 = ordersById("bihg9b0ayn8");
```

the returned objects will keep **reference equality** if their values have not changed through an update.

byId also works with joins and transformations, just like views:

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersById = cruncher
  .byId("orders")
  .join("customers", "customer")
  .join("products", "products")
  .transform((order) => ({
    ...order,
    customer: order.customer?.name,
    products: order.products.map((product) => product.title),
  }))
  .get();

const specificOrder = ordersById("ar3k2s1l206");
```
