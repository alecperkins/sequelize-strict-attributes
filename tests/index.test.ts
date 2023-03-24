
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
      attributes: ["id", "alpha"],
      rejectOnEmpty: true,
    });
    
    expect(() => result.bravo).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result.get("bravo")).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result.bravo += 1).toThrow("Cannot access attribute bravo on Foo omitted from attributes");

    expect(result.alpha).toEqual("abc");
    expect(result.get("alpha")).toEqual("abc");
    expect(() => result.bravo = 1).not.toThrow();
    await result.save();
    expect((await Foo.findOne({
      where: { id: result.id },
      rejectOnEmpty: true,
    })).bravo).toEqual(1);

    expect(() => result.set("bravo", 2)).not.toThrow();
    await result.save();
    expect((await Foo.findOne({
      where: { id: result.id },
      rejectOnEmpty: true,
    })).bravo).toEqual(2);
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

  test("guards against use of excluded attributes after findAll", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);

    const [result] = await Foo.findAll({
      attributes: { exclude: ["bravo"], },
    });

    expect(() => result!.bravo).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result!.get("bravo")).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(() => result!.bravo += 1).toThrow("Cannot access attribute bravo on Foo omitted from attributes");

    expect(result!.alpha).toEqual("abc");
    expect(result!.get("alpha")).toEqual("abc");
    expect(() => result!.bravo = 1).not.toThrow();
    expect(() => result!.set("bravo", 1)).not.toThrow();
  });

  test("has no effect when attributes not specified", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);

    const result = await Foo.findOne({
      where: { alpha: "abc" },
      rejectOnEmpty: true,
    });

    expect(result.alpha).toEqual("abc");
    expect(result.get("alpha")).toEqual("abc");
    expect(result.bravo).toEqual(4);
    expect(result.get("bravo")).toEqual(4);
    expect(() => result.bravo = 1).not.toThrow();
    expect(() => result.set("bravo", 1)).not.toThrow();
  });

  test("does not interfere with .get()", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);

    const result = await Foo.findOne({
      attributes: ['alpha'],
      rejectOnEmpty: true,
    });

    expect(result.get("alpha")).toEqual("abc");
    expect(() => result.get("bravo")).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(result.get()).toEqual({
      alpha: "abc",
    });
  });

  test("has no effect on empty results", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);

    const result = await Foo.findOne({
      where: { alpha: "nonexistent" },
      attributes: ["alpha"],
      raw: true,
    });

    expect(result).toEqual(null);
  });

  test("has no effect after a raw findOne", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    expect((await Foo.count())).toBe(1);

    const result = await Foo.findOne({
      where: { alpha: "abc" },
      attributes: ["alpha"],
      raw: true,
      rejectOnEmpty: true,
    });

    expect(result.alpha).toEqual('abc');
    expect(result.bravo).toEqual(undefined);
    expect(() => result.bravo = 1).not.toThrow();
  });

  test("guards against use of unselected attributes in an included model", async () => {
    const { sequelize, Foo, Bar } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    const result = await Foo.findOne({
      include: {
        model: Bar,
        attributes: ["alpha"],
        required: true,
      },
      attributes: ["alpha"],
      rejectOnEmpty: true,
    });

    expect(result.alpha).toEqual("abc");
    expect(() => result.bravo).toThrow();
    expect(result.Bar!.alpha).toEqual("abc");
    expect(() => result.Bar!.bravo).toThrow();
  });

  test("has no effect on included model without explicit attributes", async () => {
    const { sequelize, Foo, Bar } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    const result = await Foo.findOne({
      include: {
        model: Bar,
      },
      attributes: ["alpha"],
      rejectOnEmpty: true,
    });

    expect(result.alpha).toEqual("abc");
    expect(() => result.bravo).toThrow("Cannot access attribute bravo on Foo omitted from attributes");
    expect(result.Bar!.alpha).toEqual("abc");
    expect(result.Bar!.bravo).toEqual(4);
  });

  test("does not prevent associations from being fetched", async () => {
    const { sequelize, Foo } = await sharedSetup();
    sequelizeStrictAttributes(sequelize);
    const result = await Foo.findOne({
      rejectOnEmpty: true,
    });
    const bar = await result.getBar();

    expect(result.alpha).toEqual("abc");
    expect(bar.alpha).toEqual("abc");
  });

});


async function sharedSetup () {
  const sequelize = new Sequelize('sqlite::memory:');
  await sequelize.authenticate();
  class Foo extends Model {
    id: number;
    alpha: string;
    bravo: number;
    Bar?: Bar;
    getBar: BelongsToGetAssociationMixin<Bar>;
  }
  class Bar extends Model {
    id: number;
    alpha: string;
    bravo: number;
  }
  Foo.init({
    alpha: DataTypes.STRING,
    bravo: DataTypes.INTEGER,
  }, {
    sequelize,
  });
  Bar.init({
    alpha: DataTypes.STRING,
    bravo: DataTypes.INTEGER,
  }, {
    sequelize,
  });
  Foo.belongsTo(Bar);

  await sequelize.sync({ force: true });

  const bar = await Bar.create({
    alpha: "abc",
    bravo: 4,
  });
  const foo = await Foo.create({
    alpha: "abc",
    bravo: 4,
    BarId: bar.id,
  });

  return {
    sequelize,
    Foo,
    Bar,
  };
}

