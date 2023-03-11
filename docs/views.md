# Views

## basics

views are functions that return arrays of the data you search for.

To create a view you have to specify the collection and the properties you want to query them by. Say you have data on orders that look like this:

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

You can create views on these objects. You can pass all properties which have string, number or boolean values to the by method (in this example: customer, status, shipment, total, premium):

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersByCustomerStatusPremium = cruncher
  .view("orders")
  .by("customer", "status", "premium")
  .get();

const myOrders = ordersByCustomerStatusPremium(
  "customer1",
  "InProgress",
  false
);
```

Keep your views and share them throughout your app wherever they are needed. You can specify up to ten properties when calling the by method.
It's ok if some of the properties of your view are optional. If any objects in the collection have null or undefined values for those properties they are simply ignored by the view.

You cannot use an id as a property with the by method. If you want to query objects by id use [byId](./byId.md) instead.

## Nested Properties and custom functions

You can use nested (and deeply nested) properties and functions to create views. Use the dot notation like in the example below to indicate nested properties. The function you pass to the by method:

- receives whole objects of your collection
- has to return a string, number or boolean
- has to be a pure function (always returns the same output for the same input)

```js
const cruncher = new Cruncher();
cruncher.addCollection("students", "id", students);

const studentsBySchoolAndGroup = cruncher
  .view("students")
  .by("school", (student) => (student.age > 21 ? "senior" : "junior"))
  .get();

const seniors = studentsBySchoolAndGroup("school1", "senior");

const studentsByCityAndAge = cruncher
  .view("students")
  .by("address.city", "age")
  .get();

const newYorkers = studentsByCityAndAge("New York City", 20);
```

If the function you pass into the by method throws an error this error might be thrown when creating the view or performing updates.

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

you can create a join by passing in the collection name you have used when adding the collection and the property with the reference:

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);
cruncher.addCollection("customers", "id", customers);

const ordersByCustomerStatusShipment = cruncher
  .view("orders")
  .by("customer", "status", "shipment")
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
  .by("customer", "status", "shipment")
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
  .by("customer", "status")
  .join("customers", "customer")
  .transform((order) => ({ ...order, customer: order.customer?.name }))
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
```

Transformations will always feed the id into the resulting object, even if your transformation function returns an object without the id.

If your transformation function throws an error this error might be thrown when creating the view or performing updates.
