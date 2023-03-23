
import { describe, expect, test } from "vitest";
import { Sequelize, DataTypes, Model, BelongsToGetAssociationMixin} from 'sequelize';

import sequelizeStrictAttributes from '../src';

describe("sequelizeStrictAttributes", () => {

  test("guards against use of omitted attributes after findOne", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);
    
    const result = await Foo.findOne({
      where: { alpha: "abc" },
      attributes: ["alpha"],
      rejectOnEmpty: true,
    });
    
    expect(() => result.bravo).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result.get("bravo")).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result.bravo += 1).toThrow("Cannot access attribute bravo on Foo omitted from attributes");

    expect(result.alpha).toEqual("abc");
    expect(result.get("alpha")).toEqual("abc");
    expect(() => result.bravo = 1).not.toThrow();
    expect(() => result.set("bravo", 1)).not.toThrow();
  });

  test("guards against use of omitted attributes after findAll", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);

    const [result] = await Foo.findAll({
      attributes: ["alpha"],
    });

    expect(() => result!.bravo).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result!.get("bravo")).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result!.bravo += 1).toThrow("Cannot access attribute bravo on Foo omitted from attributes");

    expect(result!.alpha).toEqual("abc");
    expect(result!.get("alpha")).toEqual("abc");
    expect(() => result!.bravo = 1).not.toThrow();
    expect(() => result!.set("bravo", 1)).not.toThrow();
  });
  });
});


async function sharedSetup () {
  const sequelize = new Sequelize('sqlite::memory:');
  await sequelize.authenticate();
  class Foo extends Model {
  }
    alpha: string;
    bravo: number;
  Foo.init({
    alpha: DataTypes.STRING,
    bravo: DataTypes.INTEGER,
  }, {
    sequelize,
  });
  await sequelize.sync({ force: true });

  const foo = await Foo.create({
    alpha: "abc",
    bravo: 4,
  });

  return {
    sequelize,
    Foo,
  };
}

