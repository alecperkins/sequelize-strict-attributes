
# sequelize-strict-attributes

[![npm package](https://img.shields.io/npm/v/sequelize-strict-attributes)](https://www.npmjs.com/package/sequelize-strict-attributes) [![typescript](https://img.shields.io/npm/types/sequelize-strict-attributes)](https://github.com/alecperkins/sequelize-strict-attributes) [![MIT license](https://img.shields.io/npm/l/sequelize-strict-attributes)](https://github.com/alecperkins/sequelize-strict-attributes/blob/main/LICENSE) [![test status](https://github.com/alecperkins/sequelize-strict-attributes/actions/workflows/test.yml/badge.svg)](https://github.com/alecperkins/sequelize-strict-attributes/actions/workflows/test.yml)

`sequelize-strict-attributes` is a plugin for [Sequelize](https://sequelize.org) that adds stricter treatment of attribute access after [specifying attributes](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#specifying-attributes-for-select-queries) in a query. This way, attempts to access instance attributes omitted from the query using `attributes` will throw rather than silently failing by returning undefined. This is especially useful for scenarios where the column is expected to sometimes be null so a fallback value is provided for calculations.

_Note: this is a runtime check. Types are included for the plugin itself, but the types of the returned instances will not be changed. To type checking, the instances will appear to still have omitted attributes._


## Installation

`npm install sequelize-strict-attributes`

and include as a JavaScript or TypeScript module (types included):

```typescript
import sequelizeStrictAttributes from 'sequelize-strict-attributes';
```

…or a CommonJS module:

```javascript
const sequelizeStrictAttributes = require('sequelize-strict-attributes');
```

Supports the latest stable Sequelize, version 6.


## Usage

Call the plugin with the active Sequelize instance immediately after it's instantiated.

```javascript
const sequelize = new Sequelize(…);
sequelizeStrictAttributes(sequelize);
```

From this point on, any `Model.findAll` or `Model.findOne` query that specifies `attributes:`—and does not use `raw: true`—will throw if you try to access an attribute not included in the select list.

For example, given a model that looks something like this:

```javascript
const MyCustomer = sequelize.define('MyModel', {
  name: DataTypes.STRING,
  money: DataTypes.INTEGER,
});
```

And an instance fetched like this:

```javascript
const result = await MyCustomer.findOne({
  attributes: ["name"],
});
```

When accessing the omitted attribute, the program will throw:

```javascript
if (!result.money) { // <-- Throws here
  console.log("Out of money!"); // <-- because this is potentially incorrect since `money` was omitted.
}
```

```javascript
if (!result.get("money")) { // <-- Also throws
  …
}
```

Included models will similarly be restricted. Setting the attribute directly or using `Model::set` will still work, though shortcuts like addition assignment will throw.


## Motivation

Disallowing access of attributes that were excluded from a select is a common feature of other ORMs (eg Prisma, ActiveRecord, Django) for good reason. However, the Sequelize authors [declined to support it](https://github.com/sequelize/sequelize/issues/12108) in the core library. After Sequelize’s behavior bit me pretty severely, I decided to put this together to more reliably avoid this hazard in the future.


## Author

Alec Perkins, https://alecperkins.net


## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).

See `./LICENSE` for more information.
