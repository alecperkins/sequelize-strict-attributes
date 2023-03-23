const { Sequelize, DataTypes, InstanceError } = require("sequelize");
module.exports = function (name, sequelizeStrictAttributes) {

  const sequelize = new Sequelize("sqlite::memory:", {
    logging: false,
  });
  sequelizeStrictAttributes(sequelize);

  const MyModel = sequelize.define("MyModel", {
    someattr: DataTypes.INTEGER,
  }, {
    sequelize,
  });

  (async function () {
    await sequelize.sync();
    await MyModel.create({ someattr: 4 });
    const result = await MyModel.findOne({
      attributes: ["id"],
    });
    try {
      result.someattr;
    } catch (error) {
      if (error instanceof InstanceError && error.message.includes('Cannot access attribute someattr on MyModel omitted from attributes')) {
        console.log(`${ name } ✔️`);
      } else {
        throw error;
      }
    }
  })().catch(error => {
    throw error;
  });
}




