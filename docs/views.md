# Views

## basics

views are functions that return arrays of the data you search for.

To create a view you have to specify the collection and keys to some properties. Say you have data on orders that look like this:

```js
const orders = [
  {
    id: "97gr8zxur06",
    customer: "customer1",
    status: "InProgress",
    shipment: "standard",
    total: 45.6,
    premium: false,
  },
  ...
];
```

You can create views on these objects. You can specify all keys of properties which have string, number or boolean values (in this example: customer, status, shipment, total, premium):

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersByCustomerStatusPremium = cruncher
  .view("orders")
  .keys("customer", "status", "premium")
  .get();

const myOrders = ordersByCustomerStatusPremium(
  "customer1",
  "InProgress",
  false
);
```

Keep your views and share them throughout your app wherever they are needed. Your views can have up to ten keys.
It's ok if some of the keys of your view are optional. If any objects in the collection have null or undefined values for those keys they are simply ignored by the view.

You cannot use an id as a key. If you want to query objects by id use [byId](./byId.md) instead.

## Joins

If some of your collections reference other collections you can create joins.
Say your collections look like this:

```js
const orders = [
  {
    id: "97gr8zxur06",
    customer: "customer1",
    status: "InProgress",
    shipment: "standard",
  },
  ...
];

const customers = [
  {
    id: "customer1",
    name: "Mario",
    country: "Italy",
  },
  ...
];
```

you can create a join by passing in the collection name you have used when adding the collection and the key to the reference:

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);
cruncher.addCollection("customers", "id", customers);

const ordersByCustomerStatusShipment = cruncher
  .view("orders")
  .keys("customer", "status", "shipment")
  .join("customers", "customer")
  .get();

const myOrders = ordersByCustomerStatusShipment(
  "customer1",
  "InProgress",
  "standard"
);

// myOrders will look like this:
// [
//   {
//     id: "97gr8zxur06",
//     customer: {
//       id: "customer1",
//       name: "Mario",
//       country: "Italy",
//     },
//     status: "InProgress",
//     shipment: "standard",
//   },
//   ...
// ];
```

You can also create joins when your objects reference multiple other objects in arrays:

```js
const orders = [
  {
    id: "97gr8zxur06",
    customer: "customer1",
    status: "InProgress",
    shipment: "standard",
    products: ["product1", "product42"]
  },
  ...
];

const products = [
  {
    id: "product1",
    title: "Video game",
    price: 12.5,
  },
  ...
];
```

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);
cruncher.addCollection("customers", "id", customers);
cruncher.addCollection("products", "id", products);

const ordersByCustomerStatusShipment = cruncher
  .view("orders")
  .keys("customer", "status", "shipment")
  .join("customers", "customer")
  .join("products", "products")
  .get();
```

## Transformations

You can add transformations to your views. Pass in a transformation function that:

- accepts as a parameter the original object including any joined in data from joins
- is a pure function (always returns the same output for the same input)
- returns an object (not just a primitive value)

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);
cruncher.addCollection("customers", "id", customers);

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .keys("customer", "status")
  .join("customers", "customer")
  .transform((order) => ({ ...order, customer: order.customer?.name }))
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
```

Transformations will always feed the id into the resulting object, even if your transformation function returns an object without the id.

If your transformation function throws an error creating the view or performing updates might fail and the error will be thrown.

## Groupings

You can group keys of your views. Hand in the name of the key you want to group and a grouping function that:

- accepts the objects value for the key
- is a pure function (always returns the same output for the same input)
- returns a string, number or boolean

```js
const cruncher = new Cruncher();
cruncher.addCollection("players", "id", players);

const scoreToGroups = (score) => {
  if (score <= 20) {
    return "low";
  }
  if (score <= 50) {
    return "mid-level";
  }
  return "high";
};

const playersByLeagueAndScoreGroup = cruncher
  .view("players")
  .keys("league", "score")
  .group("score", scoreToGroups)
  .get();

const midLevelRegionalPlayers = playersByLeagueAndScoreGroup(
  "regional",
  "mid-level"
);
```

If you want to query your objects by the original value instead of the group value but still get grouped results pass in false as the third parameter of group:

```js
const playersByLeagueAndScoreGroup = cruncher
  .view("players")
  .keys("league", "score")
  .group("score", scoreToGroups, false)
  .get();

const midLevelRegionalPlayers = playersByLeagueAndScoreGroup("regional", 30);
```

If your grouping function throws an error creating the view or performing updates might fail and the error will be thrown.
