const NODE_ENV = process.env.NODE_ENV || 'dev';

interface IConfig {
  [key: string]: any;
}

let cfg: IConfig = {};

// Load env config
try {
  const envConfig = require(`../config/${NODE_ENV}.json`);
  mergeDeep(cfg, envConfig);
} catch (err) {
  console.log('Could not load environment config');
}

// Load local config
try {
  const localConfig = require(`../config/local.json`);
  mergeDeep(cfg, localConfig);
} catch (err) {
  console.log('Could not load local config');
}

deepFreeze(cfg);

(global as any).config = cfg;

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target: any, ...sources: object[]): object {
  if (!sources.length) {
    return target;
  }
  const source: any = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function deepFreeze(o: any) {
  Object.freeze(o);

  Object.getOwnPropertyNames(o).forEach(prop => {
    if (
      o.hasOwnProperty(prop) &&
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });

  return o;
}
