# Changelog

## [1.0.1](https://github.com/alecperkins/sequelize-strict-attributes/compare/v1.0.0...v1.0.1) (2023-03-24)


### Bug Fixes

* Allow .get() without key ([970eba6](https://github.com/alecperkins/sequelize-strict-attributes/commit/970eba669c620639ffba81451f936cfd6c4e6ee7))
* Allow .toJSON() to work normally ([5225a2c](https://github.com/alecperkins/sequelize-strict-attributes/commit/5225a2c90f409de43e17ef48bea356e711aa7af3))

## 1.0.0 (2023-03-24)


### Features

* Avoid guarding raw queries ([4ae4652](https://github.com/alecperkins/sequelize-strict-attributes/commit/4ae4652a0d170d4b5a68adb27cd13d29c913c79b))
* Guard against .get access ([28939a3](https://github.com/alecperkins/sequelize-strict-attributes/commit/28939a35619874d168a6ee089b25125b8d24c619))
* Guard against access on included models ([d08482a](https://github.com/alecperkins/sequelize-strict-attributes/commit/d08482a2d27299824de7b748579f3b5acce86863))
* Guard against attribute access after findAll ([a16c587](https://github.com/alecperkins/sequelize-strict-attributes/commit/a16c587d01c001370e169c887bdf1c4cfa2ed1cd))
* Guard against omitted attributes in findOne ([3267537](https://github.com/alecperkins/sequelize-strict-attributes/commit/3267537adec153bb138fde9d18e70adef5d9dc5a))
