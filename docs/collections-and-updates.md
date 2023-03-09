# Collections and Updates

## Add collections first

You have to first add collections before you can create views. Use the addCollection method:

```ts
addCollection(name: string, idProperty: string, data?: any[]): void
```

Note that you have to pass the idProperty which uniquely identifies each of the objects in the collection.

example:

```js
// example data structure:
// const orders = [
//   {
//     id: "97gr8zxur06",
//     customer: "customer1",
//     status: "InProgress",
//     total: 25.6,
//   },
//   ...
// ];

const orders = await fetchOrders();

const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .by("customer", "status")
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
```

## Add data later

You don't have to add data when using addCollection. You can first define your collections and views and insert your initial data later through the update method:

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id");

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .by("customer", "status")
  .get();

const orders = await fetchOrders();
cruncher.update([{ collection: "orders", data: orders }]);

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
```

## Update data

You can update one or multiple collections with one update call. You can update your collections as often as you want to. Your views will automatically return updated data when called. If the objects have not changed in value, the returned array will be **reference equal** to the previously returned array. That makes it perfect for use with React to help avoid unnecessary rerenders.

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);
cruncher.addCollection("customers", "id", customers);

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .by("customer", "status")
  .get();

const customersByCountryStateMembership = cruncher
  .view("customers")
  .by("country", "state", "membership")
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
const premiumCustomers = customersByCountryStateMembership(
  "USA",
  "Washington",
  "premium"
);

const ordersUpdate = await fetchOrders();
const customerUpdate = await fetchCustomers();

cruncher.update([
  { collection: "orders", data: ordersUpdate },
  { collection: "customers", data: customerUpdate },
]);

const newFullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
const newPremiumCustomers = customersByCountryStateMembership(
  "USA",
  "Washington",
  "premium"
);
```

The data you pass into the update method for each collection replaces the data for that collection completely. So if some objects are missing in the data passed to update, they will be treated as deleted.
