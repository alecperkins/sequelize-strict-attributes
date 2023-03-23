
import sequelizeStrictAttributes from "sequelize-strict-attributes";

import("./_base.cjs").then(({ default: factory }) => {
  factory("ecma", sequelizeStrictAttributes);
});
