# data-cruncher

Blazingly fast views and transformations of your data.

```bash
npm install data-cruncher
```

## Add your data and create a view

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .by("customer", "status")
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
```

Add a collection first, then you can create views on that collection. A view is just a function that will return an array of the data you searched for.<br>
[docs on collections and updates](./docs/collections-and-updates.md)<br>
[docs on views](./docs/views.md)

## Update your data

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .by("customer", "status")
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");

cruncher.update([{ collection: "orders", data: ordersV2 }]);

const fullFilledV2 = ordersByCustomerAndStatus("customer1", "FullFilled");
```

Use the update method and pass it the updated collection data. The view will return a **reference equal** array if the returned data has not changed.
It's perfect for use with React, since the **reference equality** helps avoid unnecessary rerenders.<br>
[docs on collections and updates](./docs/collections-and-updates.md#update-data)

## Use nested properties and custom functions to create views

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

[docs on nested properties and custom functions](./docs/views.md#nested-properties-and-custom-functions)

## Add joins

```js
const cruncher = new Cruncher();
cruncher.addCollection("orders", "id", orders);
cruncher.addCollection("customers", "id", customers);

const ordersByCustomerAndStatus = cruncher
  .view("orders")
  .by("customer", "status")
  .join("customers", "customer")
  .get();

const fullFilled = ordersByCustomerAndStatus("customer1", "FullFilled");
```

The returned Objects will contain the full referenced object instead of just its id.<br>
[docs on joins](./docs/views.md#joins)

## Add transformations

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

Your returned objects will be transformed. You can use full objects from your joins for your transformation.<br>
[docs on transformations](./docs/views.md#transformations)

## Query Objects by Id

You can query objects by id and use joins and transformations just like with views.
[docs on byId](./docs/byId.md)

## Supported data types

data-cruncher can be used for JavaScript objects (including deeply nested objects) with properties of primitives and arrays out of the box. These are the kind of objects you usually get after deserializing objects from a database or from network calls.

example:

```js
const serializableObject = {
  id: "qe2bmylvcmc",
  name: "Mario",
  address: {
    street: "magic street 42",
    zipCode: "12345T",
    city: "magic island"
  }
  score: 26.7,
  isFunny: true,
  hobbies: [
    { title: "playing guitar", category: "music" },
    { title: "playing guitar", category: "music" },
  ],
};
```

data-cruncher will detect these objects equality by value equality. This means that two objects with different references but identical values will be treated as equal.
Feeding data-cruncher with objects that contain es6 + newer data structures (like Maps, Sets) can result in objects equality not being detected correctly.

## License

[MIT](./LICENSE)
