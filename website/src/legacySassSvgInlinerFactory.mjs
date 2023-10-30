// Adapted from https://gist.github.com/eastside/adcdf0d189c7470be241a851c5add350
// Also see https://github.com/palantir/blueprint/issues/6051#issuecomment-1619731942

// This is a workaround for an outstanding issue in Blueprint as of 5/8/23.
// Issue is here: https://github.com/palantir/blueprint/issues/6051
//
// Basically, there's an issue where Sass-loader in webpack can't use Sass' new API for creating custom functions in Sass.
// Blueprint.js needs to register a custom function to render some svg icons.
// However, I guess the build process in Blueprint doesn't actually use webpack at all (lucky them), so we get to modify Blueprint's nice svg loader code to work with the old API.
// In our webpack.config.mjs file, we import legacySassSvgInlinerFactory and use it instead of sassSvgInlinerFactory.
//

// Taken from https://github.com/palantir/blueprint/blob/develop/packages/node-build-scripts/src/svg/svgOptimizer.mjs
/**
 * Copyright 2023 Palantir Technologies, Inc. All rights reserved.
 */

// Note: we had issues with this approach using svgo v2.x, so for now we stick with v1.x
// With v2.x, some shapes within the icon SVGs would not get converted to paths correctly,
// resulting in invalid d="..." attributes rendered by the <Icon> component.
// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// const svgOptimizer = new SVGO({ plugins: [{ convertShapeToPath: { convertArcs: true } }] });

// Taken from https://github.com/palantir/blueprint/blob/develop/packages/node-build-scripts/src/sass/sassSvgInliner.mjs
/*
 * (c) Copyright 2023 Palantir Technologies Inc. All rights reserved.
 */

/**
 * @fileoverview adapted from a fork of sass-inline-svg which implements dart-sass support
 * @see https://github.com/Liquid-JS/sass-inline-svg/blob/958bd0e27782d46349da7d8a831467257d4130d1/index.js
 */

// @ts-check

import selectAll,{ selectOne } from 'css-select';
import serialize from 'dom-serializer';
import { parseDocument } from 'htmlparser2';
import { OrderedMap } from 'immutable';
import svgToDataUri from 'mini-svg-data-uri';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as sass from 'sass';

/**
 * @param {sass.LegacyValue} value
 * @returns {sass.SassString | sass.SassNumber | sass.SassBoolean | sass.SassColor | sass.SassList | sass.SassMap}
 */
function legacyToSass(value) {
  if (value instanceof sass.types.String) {
    let s = value.getValue();
    return new sass.SassString(s, { quotes: false });
  } else if (value instanceof sass.types.Number) {
    return new sass.SassNumber(value.getValue());
  } else if (value instanceof sass.types.Boolean) {
    if (value.getValue() === true) {
      return sass.sassTrue;
    } else {
      return sass.sassFalse;
    }
  } else if (value instanceof sass.types.Color) {
    return new sass.SassColor({
      red: value.getR(),
      green: value.getG(),
      blue: value.getB(),
      alpha: value.getA(),
    });
  } else if (value instanceof sass.types.List) {
    let out = [];
    for (let i = 0; i < value.getLength(); i++) {
      let v = value.getValue(i);
      if (v != undefined) {
        out.push(legacyToSass(v));
      }
    }
    return new sass.SassList(out);
  } else if (value instanceof sass.types.Map) {
    // Iterable<[sass.value, sass.Value]>
    let out = [];
    for (let i = 0; i < value.getLength(); i++) {
      let k = value.getKey(i);
      let v = value.getValue(i);
      if (k == undefined || v == undefined) {
        throw `undefined key or value: k: ${k}, v: ${v}`;
      }
      if (!(k instanceof sass.types.String)) {
        throw `key is not a string: ${k}`;
      }
      k = new sass.SassString(k.getValue(), { quotes: false });
      v = legacyToSass(v);
      out.push([k, v]);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore   Typescript isn't quite smart enough to figure out that the ordered map type is correct.
    return new sass.SassMap(OrderedMap(out));
    // } else if (value instanceof sass.types.Number) {
    //     return new sass.SassNumber(value.getValue());
  }
  throw `unable to convert legacy value: ${value}`;
}

/**
 * This is the same as below, an SVG inline function, except it can work with the legacy Sass render API.
 * This was created to work with Webpack's sass-loader module, which as of writing only works with the legacy API.
 *
 * See: https://github.com/webpack-contrib/sass-loader/issues/1137#issuecomment-1537240206
 */
export function legacySassSvgInlinerFactory(base, opts) {
  const { _optimize = false, encodingFormat = 'base64' } = opts;

  /**
   * @param {sass.types.String} path
   * @param {sass.types.Map} selectors
   * @returns {sass.SassString}
   */
  return function (path, selectors) {
    const resolvedPath = resolve(base, path.getValue());
    try {
      let svgContents = readFileSync(resolvedPath, { encoding: 'utf8' });

      if (selectors !== undefined && selectors.getLength() > 0) {
        let selectorsMap = legacyToSass(selectors);
        if (selectorsMap instanceof sass.SassMap) {
          svgContents = changeStyle(svgContents, selectorsMap);
        } else {
          throw `selectors should be a map, but was't. Was: ${selectorsMap}`;
        }
      }

      // sass legacy can't work with promises... for some reason

      let out = encode(svgContents, { encodingFormat });
      return out;
    } catch (err) {
      console.error('[node-build-scripts]', err);
      return new sass.SassString('');
    }
  };
}

// /**
//  * The SVG inliner function.
//  * This is a factory that expects a base path and returns the actual function.
//  *
//  * @param {string} base
//  * @param {{optimize: boolean, encodingFormat: string}} opts
//  * @returns {sass.CustomFunction<"async">}
//  */
// export function sassSvgInlinerFactory(base, opts) {
//   const { optimize = false, encodingFormat = 'base64' } = opts;

//   /**
//    * @param {sass.Value[]} args
//    * @returns {Promise<sass.SassString>}
//    */
//   return async function (args) {
//     const path = /** @type {sass.SassString} */ (args[0]);
//     const selectors = /** @type {sass.SassMap | undefined} */ (args[1]);
//     const resolvedPath = resolve(base, path.text);
//     try {
//       let svgContents = readFileSync(resolvedPath, { encoding: 'utf8' });

//       if (selectors !== undefined && selectors.asList.size > 0) {
//         svgContents = changeStyle(svgContents, selectors);
//       }

//       if (optimize) {
//         svgContents = (await svgOptimizer.optimize(svgContents, { path: resolvedPath })).data;
//       }

//       return encode(svgContents, { encodingFormat });
//     } catch (err) {
//       console.error('[node-build-scripts]', err);
//       return new sass.SassString('');
//     }
//   };
// }

/**
 * Encode a JS string as a Sass string.
 *
 * @param {any} content
 * @param {any} opts
 * @returns {sass.SassString}
 */
function encode(content, opts) {
  let buff = Buffer.from(content);

  if (opts.encodingFormat === 'uri') {
    return new sass.SassString(`url("${svgToDataUri(buff.toString('utf8'))}")`, { quotes: false });
  }

  if (opts.encodingFormat === 'base64') {
    return new sass.SassString(`url("data:image/svg+xml;base64,${buff.toString('base64')}")`, {
      quotes: false,
    });
  }

  throw new Error(`[node-build-scripts] encodingFormat ${opts.encodingFormat} is not supported`);
}
/**
 * Change the style attributes of an SVG string.
 *
 * @param {string} source
 * @param {sass.SassMap} selectorsMap
 * @returns {*}
 */
function changeStyle(source, selectorsMap) {
  const document = parseDocument(source, {
    xmlMode: true,
  });
  const svg = document ? selectOne('svg', document.childNodes) : null;

  const selectors = mapToObj(selectorsMap);

  if (!svg) {
    throw Error('[node-build-scripts] Invalid svg file');
  }

  Object.keys(selectors).forEach(function (selector) {
    const elements = selectAll(selector, svg);
    const newAttributes = selectors[selector];

    elements.forEach(function (element) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore -- attribs property does exist
      Object.assign(element.attribs, newAttributes);
    });
  });

  return serialize(document);
}

/**
 * Recursively transforms a Sass map into a JS object.
 *
 * @param {sass.SassMap} sassMap
 * @returns {Record<any, any>}
 */
function mapToObj(sassMap) {
  const obj = Object.create(null);
  const map = sassMap.contents.toJS();

  for (const [key, value] of /** @type {[string, sass.Value][]} */ (Object.entries(map))) {
    obj[key] = value instanceof sass.SassMap ? mapToObj(value) : value.toString();
  }

  return obj;
}
