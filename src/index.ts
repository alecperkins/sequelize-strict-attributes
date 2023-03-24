import { InstanceError } from "sequelize";
import type { Sequelize } from "sequelize";

/**
 * Wrap all instances resulting from a findOne or findAll with
 * guards that throw when trying to access attributes omitted from
 * include or explicitly excluded from the select.
 * 
 * @example
 *    const sequelize = new Sequelize(…conn…);
 *    sequelizeStrictAttributes(sequelize);
 * 
 * @param sequelize - an active Sequelize instance
 */
export default function sequelizeStrictAttributes (sequelize: Sequelize) {
  sequelize.addHook('afterFind', (result) => {
    if (result instanceof Array) {
      result.forEach(guardAttributes);
    } else if (result) { // Make sure it's not an empty result from a findOne
      guardAttributes(result);
    }
  });
}

function guardAttributes (instance) {
  if (!instance._options || !instance._options.attributes) {
    // Raw results aren't full instances and can't be reliably restricted.
    return;
  }

  const included_models = (instance._options.includeNames ?? []);

  const loaded_attrs = new Set([
    ...instance._options.attributes,
    ...included_models, // Let associations through
  ]);

  // Guard the includes
  included_models.forEach(name => {
    guardAttributes(instance[name]);
  });

  // Block direct dot-notation access of the attributes.
  Object.keys(instance.constructor.rawAttributes).forEach(key => {
    if (!loaded_attrs.has(key)) {
      Object.defineProperty(instance, key, {
        ...instance.constructor._attributeManipulation[key], // Keep set() and the rest in place
        get () {
          throw new InstanceError(`Cannot access attribute ${ key } on ${ instance.constructor.name } omitted from attributes`);
        },
      });
    }
  });

  // Intercept indirect .get access of the attributes.
  const actualGet = instance.get.bind(instance);
  function get (key_or_options?: string | object, options?: unknown) {
    // Model::get has several signatures, so make sure we're only guarding the .get('key') call.
    const key = key_or_options && typeof key_or_options === "string" ? key_or_options : null;
    if (key && !loaded_attrs.has(key)) {
      throw new InstanceError(`Cannot access attribute ${ key } on ${ instance.constructor.name } omitted from attributes`);
    }
    return actualGet(key_or_options, options);
  }
  instance.get = get.bind(instance);

}
