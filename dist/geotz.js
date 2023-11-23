(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GeoTZ = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invariant_1 = require("@turf/invariant");
// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
/**
 * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point
 * resides inside the polygon. The polygon can be convex or concave. The function accounts for holes.
 *
 * @name booleanPointInPolygon
 * @param {Coord} point input point
 * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if
 * the point is inside the polygon otherwise false.
 * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
 * @example
 * var pt = turf.point([-77, 44]);
 * var poly = turf.polygon([[
 *   [-81, 41],
 *   [-81, 47],
 *   [-72, 47],
 *   [-72, 41],
 *   [-81, 41]
 * ]]);
 *
 * turf.booleanPointInPolygon(pt, poly);
 * //= true
 */
function booleanPointInPolygon(point, polygon, options) {
    if (options === void 0) { options = {}; }
    // validation
    if (!point) {
        throw new Error("point is required");
    }
    if (!polygon) {
        throw new Error("polygon is required");
    }
    var pt = invariant_1.getCoord(point);
    var geom = invariant_1.getGeom(polygon);
    var type = geom.type;
    var bbox = polygon.bbox;
    var polys = geom.coordinates;
    // Quick elimination if point is not inside bbox
    if (bbox && inBBox(pt, bbox) === false) {
        return false;
    }
    // normalize to multipolygon
    if (type === "Polygon") {
        polys = [polys];
    }
    var insidePoly = false;
    for (var i = 0; i < polys.length && !insidePoly; i++) {
        // check if it is in the outer ring first
        if (inRing(pt, polys[i][0], options.ignoreBoundary)) {
            var inHole = false;
            var k = 1;
            // check for the point in any of the holes
            while (k < polys[i].length && !inHole) {
                if (inRing(pt, polys[i][k], !options.ignoreBoundary)) {
                    inHole = true;
                }
                k++;
            }
            if (!inHole) {
                insidePoly = true;
            }
        }
    }
    return insidePoly;
}
exports.default = booleanPointInPolygon;
/**
 * inRing
 *
 * @private
 * @param {Array<number>} pt [x,y]
 * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
 * @param {boolean} ignoreBoundary ignoreBoundary
 * @returns {boolean} inRing
 */
function inRing(pt, ring, ignoreBoundary) {
    var isInside = false;
    if (ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]) {
        ring = ring.slice(0, ring.length - 1);
    }
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0];
        var yi = ring[i][1];
        var xj = ring[j][0];
        var yj = ring[j][1];
        var onBoundary = pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0 &&
            (xi - pt[0]) * (xj - pt[0]) <= 0 &&
            (yi - pt[1]) * (yj - pt[1]) <= 0;
        if (onBoundary) {
            return !ignoreBoundary;
        }
        var intersect = yi > pt[1] !== yj > pt[1] &&
            pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}
/**
 * inBBox
 *
 * @private
 * @param {Position} pt point [x,y]
 * @param {BBox} bbox BBox [west, south, east, north]
 * @returns {boolean} true/false if point is inside BBox
 */
function inBBox(pt, bbox) {
    return (bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1]);
}

},{"@turf/invariant":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module helpers
 */
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 *
 * @memberof helpers
 * @type {number}
 */
exports.earthRadius = 6371008.8;
/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.factors = {
    centimeters: exports.earthRadius * 100,
    centimetres: exports.earthRadius * 100,
    degrees: exports.earthRadius / 111325,
    feet: exports.earthRadius * 3.28084,
    inches: exports.earthRadius * 39.37,
    kilometers: exports.earthRadius / 1000,
    kilometres: exports.earthRadius / 1000,
    meters: exports.earthRadius,
    metres: exports.earthRadius,
    miles: exports.earthRadius / 1609.344,
    millimeters: exports.earthRadius * 1000,
    millimetres: exports.earthRadius * 1000,
    nauticalmiles: exports.earthRadius / 1852,
    radians: 1,
    yards: exports.earthRadius * 1.0936,
};
/**
 * Units of measurement factors based on 1 meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.unitsFactors = {
    centimeters: 100,
    centimetres: 100,
    degrees: 1 / 111325,
    feet: 3.28084,
    inches: 39.37,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    meters: 1,
    metres: 1,
    miles: 1 / 1609.344,
    millimeters: 1000,
    millimetres: 1000,
    nauticalmiles: 1 / 1852,
    radians: 1 / exports.earthRadius,
    yards: 1.0936133,
};
/**
 * Area of measurement factors based on 1 square meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.areaFactors = {
    acres: 0.000247105,
    centimeters: 10000,
    centimetres: 10000,
    feet: 10.763910417,
    hectares: 0.0001,
    inches: 1550.003100006,
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    miles: 3.86e-7,
    millimeters: 1000000,
    millimetres: 1000000,
    yards: 1.195990046,
};
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geom, properties, options) {
    if (options === void 0) { options = {}; }
    var feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
        feat.id = options.id;
    }
    if (options.bbox) {
        feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
}
exports.feature = feature;
/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<any>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = "Point";
 * var coordinates = [110, 50];
 * var geometry = turf.geometry(type, coordinates);
 * // => geometry
 */
function geometry(type, coordinates, _options) {
    if (_options === void 0) { _options = {}; }
    switch (type) {
        case "Point":
            return point(coordinates).geometry;
        case "LineString":
            return lineString(coordinates).geometry;
        case "Polygon":
            return polygon(coordinates).geometry;
        case "MultiPoint":
            return multiPoint(coordinates).geometry;
        case "MultiLineString":
            return multiLineString(coordinates).geometry;
        case "MultiPolygon":
            return multiPolygon(coordinates).geometry;
        default:
            throw new Error(type + " is invalid");
    }
}
exports.geometry = geometry;
/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (!coordinates) {
        throw new Error("coordinates is required");
    }
    if (!Array.isArray(coordinates)) {
        throw new Error("coordinates must be an Array");
    }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be at least 2 numbers long");
    }
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
        throw new Error("coordinates must contain numbers");
    }
    var geom = {
        type: "Point",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.point = point;
/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
function points(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return point(coords, properties);
    }), options);
}
exports.points = points;
/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
function polygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
        var ring = coordinates_1[_i];
        if (ring.length < 4) {
            throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error("First and last Position are not equivalent.");
            }
        }
    }
    var geom = {
        type: "Polygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.polygon = polygon;
/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * var polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
function polygons(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return polygon(coords, properties);
    }), options);
}
exports.polygons = polygons;
/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
function lineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be an array of two or more positions");
    }
    var geom = {
        type: "LineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.lineString = lineString;
/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
function lineStrings(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return lineString(coords, properties);
    }), options);
}
exports.lineStrings = lineStrings;
/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
function featureCollection(features, options) {
    if (options === void 0) { options = {}; }
    var fc = { type: "FeatureCollection" };
    if (options.id) {
        fc.id = options.id;
    }
    if (options.bbox) {
        fc.bbox = options.bbox;
    }
    fc.features = features;
    return fc;
}
exports.featureCollection = featureCollection;
/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiLineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiLineString = multiLineString;
/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPoint",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPoint = multiPoint;
/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPolygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPolygon = multiPolygon;
/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = turf.geometry("Point", [100, 0]);
 * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
 * var collection = turf.geometryCollection([pt, line]);
 *
 * // => collection
 */
function geometryCollection(geometries, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "GeometryCollection",
        geometries: geometries,
    };
    return feature(geom, properties, options);
}
exports.geometryCollection = geometryCollection;
/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (precision === void 0) { precision = 0; }
    if (precision && !(precision >= 0)) {
        throw new Error("precision must be a positive number");
    }
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}
exports.round = round;
/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return radians * factor;
}
exports.radiansToLength = radiansToLength;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name lengthToRadians
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} radians
 */
function lengthToRadians(distance, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return distance / factor;
}
exports.lengthToRadians = lengthToRadians;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name lengthToDegrees
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function lengthToDegrees(distance, units) {
    return radiansToDegrees(lengthToRadians(distance, units));
}
exports.lengthToDegrees = lengthToDegrees;
/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAzimuth
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAzimuth(bearing) {
    var angle = bearing % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
exports.bearingToAzimuth = bearingToAzimuth;
/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    var degrees = radians % (2 * Math.PI);
    return (degrees * 180) / Math.PI;
}
exports.radiansToDegrees = radiansToDegrees;
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    var radians = degrees % 360;
    return (radians * Math.PI) / 180;
}
exports.degreesToRadians = degreesToRadians;
/**
 * Converts a length to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} length to be converted
 * @param {Units} [originalUnit="kilometers"] of the length
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted length
 */
function convertLength(length, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "kilometers"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(length >= 0)) {
        throw new Error("length must be a positive number");
    }
    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
}
exports.convertLength = convertLength;
/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches, hectares
 * @param {number} area to be converted
 * @param {Units} [originalUnit="meters"] of the distance
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted area
 */
function convertArea(area, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "meters"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(area >= 0)) {
        throw new Error("area must be a positive number");
    }
    var startFactor = exports.areaFactors[originalUnit];
    if (!startFactor) {
        throw new Error("invalid original units");
    }
    var finalFactor = exports.areaFactors[finalUnit];
    if (!finalFactor) {
        throw new Error("invalid final units");
    }
    return (area / startFactor) * finalFactor;
}
exports.convertArea = convertArea;
/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}
exports.isNumber = isNumber;
/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return !!input && input.constructor === Object;
}
exports.isObject = isObject;
/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
function validateBBox(bbox) {
    if (!bbox) {
        throw new Error("bbox is required");
    }
    if (!Array.isArray(bbox)) {
        throw new Error("bbox must be an Array");
    }
    if (bbox.length !== 4 && bbox.length !== 6) {
        throw new Error("bbox must be an Array of 4 or 6 numbers");
    }
    bbox.forEach(function (num) {
        if (!isNumber(num)) {
            throw new Error("bbox must only contain numbers");
        }
    });
}
exports.validateBBox = validateBBox;
/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
function validateId(id) {
    if (!id) {
        throw new Error("id is required");
    }
    if (["string", "number"].indexOf(typeof id) === -1) {
        throw new Error("id must be a number or a string");
    }
}
exports.validateId = validateId;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("@turf/helpers");
/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" &&
            coord.geometry !== null &&
            coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) &&
        coord.length >= 2 &&
        !Array.isArray(coord[0]) &&
        !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
exports.getCoord = getCoord;
/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array
 *
 * @name getCoords
 * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
 * @returns {Array<any>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coords = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(coords) {
    if (Array.isArray(coords)) {
        return coords;
    }
    // Feature
    if (coords.type === "Feature") {
        if (coords.geometry !== null) {
            return coords.geometry.coordinates;
        }
    }
    else {
        // Geometry
        if (coords.coordinates) {
            return coords.coordinates;
        }
    }
    throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
}
exports.getCoords = getCoords;
/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        helpers_1.isNumber(coordinates[0]) &&
        helpers_1.isNumber(coordinates[1])) {
        return true;
    }
    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error("coordinates must only contain numbers");
}
exports.containsNumber = containsNumber;
/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) {
        throw new Error("type and name required");
    }
    if (!value || value.type !== type) {
        throw new Error("Invalid input to " +
            name +
            ": must be a " +
            type +
            ", given " +
            value.type);
    }
}
exports.geojsonType = geojsonType;
/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) {
        throw new Error("No feature passed");
    }
    if (!name) {
        throw new Error(".featureOf() requires a name");
    }
    if (!feature || feature.type !== "Feature" || !feature.geometry) {
        throw new Error("Invalid input to " + name + ", Feature with geometry required");
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error("Invalid input to " +
            name +
            ": must be a " +
            type +
            ", given " +
            feature.geometry.type);
    }
}
exports.featureOf = featureOf;
/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) {
        throw new Error("No featureCollection passed");
    }
    if (!name) {
        throw new Error(".collectionOf() requires a name");
    }
    if (!featureCollection || featureCollection.type !== "FeatureCollection") {
        throw new Error("Invalid input to " + name + ", FeatureCollection required");
    }
    for (var _i = 0, _a = featureCollection.features; _i < _a.length; _i++) {
        var feature = _a[_i];
        if (!feature || feature.type !== "Feature" || !feature.geometry) {
            throw new Error("Invalid input to " + name + ", Feature with geometry required");
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error("Invalid input to " +
                name +
                ": must be a " +
                type +
                ", given " +
                feature.geometry.type);
        }
    }
}
exports.collectionOf = collectionOf;
/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (geojson.type === "Feature") {
        return geojson.geometry;
    }
    return geojson;
}
exports.getGeom = getGeom;
/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name="geojson"] name of the variable to display in error message (unused)
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, _name) {
    if (geojson.type === "FeatureCollection") {
        return "FeatureCollection";
    }
    if (geojson.type === "GeometryCollection") {
        return "GeometryCollection";
    }
    if (geojson.type === "Feature" && geojson.geometry !== null) {
        return geojson.geometry.type;
    }
    return geojson.type;
}
exports.getType = getType;

},{"@turf/helpers":2}],4:[function(require,module,exports){
'use strict';

module.exports = decode;

var keys, values, lengths, dim, e;

var geometryTypes = [
    'Point', 'MultiPoint', 'LineString', 'MultiLineString',
    'Polygon', 'MultiPolygon', 'GeometryCollection'];

function decode(pbf) {
    dim = 2;
    e = Math.pow(10, 6);
    lengths = null;

    keys = [];
    values = [];
    var obj = pbf.readFields(readDataField, {});
    keys = null;

    return obj;
}

function readDataField(tag, obj, pbf) {
    if (tag === 1) keys.push(pbf.readString());
    else if (tag === 2) dim = pbf.readVarint();
    else if (tag === 3) e = Math.pow(10, pbf.readVarint());

    else if (tag === 4) readFeatureCollection(pbf, obj);
    else if (tag === 5) readFeature(pbf, obj);
    else if (tag === 6) readGeometry(pbf, obj);
}

function readFeatureCollection(pbf, obj) {
    obj.type = 'FeatureCollection';
    obj.features = [];
    return pbf.readMessage(readFeatureCollectionField, obj);
}

function readFeature(pbf, feature) {
    feature.type = 'Feature';
    var f = pbf.readMessage(readFeatureField, feature);
    if (!('geometry' in f)) f.geometry = null;
    return f;
}

function readGeometry(pbf, geom) {
    geom.type = 'Point';
    return pbf.readMessage(readGeometryField, geom);
}

function readFeatureCollectionField(tag, obj, pbf) {
    if (tag === 1) obj.features.push(readFeature(pbf, {}));

    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 15) readProps(pbf, obj);
}

function readFeatureField(tag, feature, pbf) {
    if (tag === 1) feature.geometry = readGeometry(pbf, {});

    else if (tag === 11) feature.id = pbf.readString();
    else if (tag === 12) feature.id = pbf.readSVarint();

    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 14) feature.properties = readProps(pbf, {});
    else if (tag === 15) readProps(pbf, feature);
}

function readGeometryField(tag, geom, pbf) {
    if (tag === 1) geom.type = geometryTypes[pbf.readVarint()];

    else if (tag === 2) lengths = pbf.readPackedVarint();
    else if (tag === 3) readCoords(geom, pbf, geom.type);
    else if (tag === 4) {
        geom.geometries = geom.geometries || [];
        geom.geometries.push(readGeometry(pbf, {}));
    }
    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 15) readProps(pbf, geom);
}

function readCoords(geom, pbf, type) {
    if (type === 'Point') geom.coordinates = readPoint(pbf);
    else if (type === 'MultiPoint') geom.coordinates = readLine(pbf, true);
    else if (type === 'LineString') geom.coordinates = readLine(pbf);
    else if (type === 'MultiLineString') geom.coordinates = readMultiLine(pbf);
    else if (type === 'Polygon') geom.coordinates = readMultiLine(pbf, true);
    else if (type === 'MultiPolygon') geom.coordinates = readMultiPolygon(pbf);
}

function readValue(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        value = null;

    while (pbf.pos < end) {
        var val = pbf.readVarint(),
            tag = val >> 3;

        if (tag === 1) value = pbf.readString();
        else if (tag === 2) value = pbf.readDouble();
        else if (tag === 3) value = pbf.readVarint();
        else if (tag === 4) value = -pbf.readVarint();
        else if (tag === 5) value = pbf.readBoolean();
        else if (tag === 6) value = JSON.parse(pbf.readString());
    }
    return value;
}

function readProps(pbf, props) {
    var end = pbf.readVarint() + pbf.pos;
    while (pbf.pos < end) props[keys[pbf.readVarint()]] = values[pbf.readVarint()];
    values = [];
    return props;
}

function readPoint(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        coords = [];
    while (pbf.pos < end) coords.push(pbf.readSVarint() / e);
    return coords;
}

function readLinePart(pbf, end, len, closed) {
    var i = 0,
        coords = [],
        p, d;

    var prevP = [];
    for (d = 0; d < dim; d++) prevP[d] = 0;

    while (len ? i < len : pbf.pos < end) {
        p = [];
        for (d = 0; d < dim; d++) {
            prevP[d] += pbf.readSVarint();
            p[d] = prevP[d] / e;
        }
        coords.push(p);
        i++;
    }
    if (closed) coords.push(coords[0]);

    return coords;
}

function readLine(pbf) {
    return readLinePart(pbf, pbf.readVarint() + pbf.pos);
}

function readMultiLine(pbf, closed) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [readLinePart(pbf, end, null, closed)];

    var coords = [];
    for (var i = 0; i < lengths.length; i++) coords.push(readLinePart(pbf, end, lengths[i], closed));
    lengths = null;
    return coords;
}

function readMultiPolygon(pbf) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [[readLinePart(pbf, end, null, true)]];

    var coords = [];
    var j = 1;
    for (var i = 0; i < lengths[0]; i++) {
        var rings = [];
        for (var k = 0; k < lengths[j]; k++) rings.push(readLinePart(pbf, end, lengths[j + 1 + k], true));
        j += lengths[j] + 1;
        coords.push(rings);
    }
    lengths = null;
    return coords;
}

},{}],5:[function(require,module,exports){
'use strict';

module.exports = encode;

var keys, keysNum, keysArr, dim, e,
    maxPrecision = 1e6;

var geometryTypes = {
    'Point': 0,
    'MultiPoint': 1,
    'LineString': 2,
    'MultiLineString': 3,
    'Polygon': 4,
    'MultiPolygon': 5,
    'GeometryCollection': 6
};

function encode(obj, pbf) {
    keys = {};
    keysArr = [];
    keysNum = 0;
    dim = 0;
    e = 1;

    analyze(obj);

    e = Math.min(e, maxPrecision);
    var precision = Math.ceil(Math.log(e) / Math.LN10);

    for (var i = 0; i < keysArr.length; i++) pbf.writeStringField(1, keysArr[i]);
    if (dim !== 2) pbf.writeVarintField(2, dim);
    if (precision !== 6) pbf.writeVarintField(3, precision);

    if (obj.type === 'FeatureCollection') pbf.writeMessage(4, writeFeatureCollection, obj);
    else if (obj.type === 'Feature') pbf.writeMessage(5, writeFeature, obj);
    else pbf.writeMessage(6, writeGeometry, obj);

    keys = null;

    return pbf.finish();
}

function analyze(obj) {
    var i, key;

    if (obj.type === 'FeatureCollection') {
        for (i = 0; i < obj.features.length; i++) analyze(obj.features[i]);

    } else if (obj.type === 'Feature') {
        if (obj.geometry !== null) analyze(obj.geometry);
        for (key in obj.properties) saveKey(key);

    } else if (obj.type === 'Point') analyzePoint(obj.coordinates);
    else if (obj.type === 'MultiPoint') analyzePoints(obj.coordinates);
    else if (obj.type === 'GeometryCollection') {
        for (i = 0; i < obj.geometries.length; i++) analyze(obj.geometries[i]);
    }
    else if (obj.type === 'LineString') analyzePoints(obj.coordinates);
    else if (obj.type === 'Polygon' || obj.type === 'MultiLineString') analyzeMultiLine(obj.coordinates);
    else if (obj.type === 'MultiPolygon') {
        for (i = 0; i < obj.coordinates.length; i++) analyzeMultiLine(obj.coordinates[i]);
    }

    for (key in obj) {
        if (!isSpecialKey(key, obj.type)) saveKey(key);
    }
}

function analyzeMultiLine(coords) {
    for (var i = 0; i < coords.length; i++) analyzePoints(coords[i]);
}

function analyzePoints(coords) {
    for (var i = 0; i < coords.length; i++) analyzePoint(coords[i]);
}

function analyzePoint(point) {
    dim = Math.max(dim, point.length);

    // find max precision
    for (var i = 0; i < point.length; i++) {
        while (Math.round(point[i] * e) / e !== point[i] && e < maxPrecision) e *= 10;
    }
}

function saveKey(key) {
    if (keys[key] === undefined) {
        keysArr.push(key);
        keys[key] = keysNum++;
    }
}

function writeFeatureCollection(obj, pbf) {
    for (var i = 0; i < obj.features.length; i++) {
        pbf.writeMessage(1, writeFeature, obj.features[i]);
    }
    writeProps(obj, pbf, true);
}

function writeFeature(feature, pbf) {
    if (feature.geometry !== null) pbf.writeMessage(1, writeGeometry, feature.geometry);

    if (feature.id !== undefined) {
        if (typeof feature.id === 'number' && feature.id % 1 === 0) pbf.writeSVarintField(12, feature.id);
        else pbf.writeStringField(11, feature.id);
    }

    if (feature.properties) writeProps(feature.properties, pbf);
    writeProps(feature, pbf, true);
}

function writeGeometry(geom, pbf) {
    pbf.writeVarintField(1, geometryTypes[geom.type]);

    var coords = geom.coordinates;

    if (geom.type === 'Point') writePoint(coords, pbf);
    else if (geom.type === 'MultiPoint') writeLine(coords, pbf, true);
    else if (geom.type === 'LineString') writeLine(coords, pbf);
    else if (geom.type === 'MultiLineString') writeMultiLine(coords, pbf);
    else if (geom.type === 'Polygon') writeMultiLine(coords, pbf, true);
    else if (geom.type === 'MultiPolygon') writeMultiPolygon(coords, pbf);
    else if (geom.type === 'GeometryCollection') {
        for (var i = 0; i < geom.geometries.length; i++) pbf.writeMessage(4, writeGeometry, geom.geometries[i]);
    }

    writeProps(geom, pbf, true);
}

function writeProps(props, pbf, isCustom) {
    var indexes = [],
        valueIndex = 0;

    for (var key in props) {
        if (isCustom && isSpecialKey(key, props.type)) {
            continue;
        }
        pbf.writeMessage(13, writeValue, props[key]);
        indexes.push(keys[key]);
        indexes.push(valueIndex++);
    }
    pbf.writePackedVarint(isCustom ? 15 : 14, indexes);
}

function writeValue(value, pbf) {
    if (value === null) return;

    var type = typeof value;

    if (type === 'string') pbf.writeStringField(1, value);
    else if (type === 'boolean') pbf.writeBooleanField(5, value);
    else if (type === 'object') pbf.writeStringField(6, JSON.stringify(value));
    else if (type === 'number') {
        if (value % 1 !== 0) pbf.writeDoubleField(2, value);
        else if (value >= 0) pbf.writeVarintField(3, value);
        else pbf.writeVarintField(4, -value);
    }
}

function writePoint(point, pbf) {
    var coords = [];
    for (var i = 0; i < dim; i++) coords.push(Math.round(point[i] * e));
    pbf.writePackedSVarint(3, coords);
}

function writeLine(line, pbf) {
    var coords = [];
    populateLine(coords, line);
    pbf.writePackedSVarint(3, coords);
}

function writeMultiLine(lines, pbf, closed) {
    var len = lines.length,
        i;
    if (len !== 1) {
        var lengths = [];
        for (i = 0; i < len; i++) lengths.push(lines[i].length - (closed ? 1 : 0));
        pbf.writePackedVarint(2, lengths);
        // TODO faster with custom writeMessage?
    }
    var coords = [];
    for (i = 0; i < len; i++) populateLine(coords, lines[i], closed);
    pbf.writePackedSVarint(3, coords);
}

function writeMultiPolygon(polygons, pbf) {
    var len = polygons.length,
        i, j;
    if (len !== 1 || polygons[0].length !== 1) {
        var lengths = [len];
        for (i = 0; i < len; i++) {
            lengths.push(polygons[i].length);
            for (j = 0; j < polygons[i].length; j++) lengths.push(polygons[i][j].length - 1);
        }
        pbf.writePackedVarint(2, lengths);
    }

    var coords = [];
    for (i = 0; i < len; i++) {
        for (j = 0; j < polygons[i].length; j++) populateLine(coords, polygons[i][j], true);
    }
    pbf.writePackedSVarint(3, coords);
}

function populateLine(coords, line, closed) {
    var i, j,
        len = line.length - (closed ? 1 : 0),
        sum = new Array(dim);
    for (j = 0; j < dim; j++) sum[j] = 0;
    for (i = 0; i < len; i++) {
        for (j = 0; j < dim; j++) {
            var n = Math.round(line[i][j] * e) - sum[j];
            coords.push(n);
            sum[j] += n;
        }
    }
}

function isSpecialKey(key, type) {
    if (key === 'type') return true;
    else if (type === 'FeatureCollection') {
        if (key === 'features') return true;
    } else if (type === 'Feature') {
        if (key === 'id' || key === 'properties' || key === 'geometry') return true;
    } else if (type === 'GeometryCollection') {
        if (key === 'geometries') return true;
    } else if (key === 'coordinates') return true;
    return false;
}

},{}],6:[function(require,module,exports){
'use strict';

exports.encode = require('./encode');
exports.decode = require('./decode');

},{"./decode":4,"./encode":5}],7:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports){
'use strict';

module.exports = Pbf;

var ieee754 = require('ieee754');

function Pbf(buf) {
    this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
}

Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
    SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

// Threshold chosen based on both benchmarking and knowledge about browser string
// data structures (which currently switch structure types at 12 bytes or more)
var TEXT_DECODER_MIN_LENGTH = 12;
var utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf8');

Pbf.prototype = {

    destroy: function() {
        this.buf = null;
    },

    // === READING =================================================================

    readFields: function(readField, result, end) {
        end = end || this.length;

        while (this.pos < end) {
            var val = this.readVarint(),
                tag = val >> 3,
                startPos = this.pos;

            this.type = val & 0x7;
            readField(tag, result, this);

            if (this.pos === startPos) this.skip(val);
        }
        return result;
    },

    readMessage: function(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    },

    readFixed32: function() {
        var val = readUInt32(this.buf, this.pos);
        this.pos += 4;
        return val;
    },

    readSFixed32: function() {
        var val = readInt32(this.buf, this.pos);
        this.pos += 4;
        return val;
    },

    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

    readFixed64: function() {
        var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readSFixed64: function() {
        var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readFloat: function() {
        var val = ieee754.read(this.buf, this.pos, true, 23, 4);
        this.pos += 4;
        return val;
    },

    readDouble: function() {
        var val = ieee754.read(this.buf, this.pos, true, 52, 8);
        this.pos += 8;
        return val;
    },

    readVarint: function(isSigned) {
        var buf = this.buf,
            val, b;

        b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;
        b = buf[this.pos];   val |= (b & 0x0f) << 28;

        return readVarintRemainder(val, isSigned, this);
    },

    readVarint64: function() { // for compatibility with v2.0.1
        return this.readVarint(true);
    },

    readSVarint: function() {
        var num = this.readVarint();
        return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
    },

    readBoolean: function() {
        return Boolean(this.readVarint());
    },

    readString: function() {
        var end = this.readVarint() + this.pos;
        var pos = this.pos;
        this.pos = end;

        if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
            // longer strings are fast with the built-in browser TextDecoder API
            return readUtf8TextDecoder(this.buf, pos, end);
        }
        // short strings are fast with our custom implementation
        return readUtf8(this.buf, pos, end);
    },

    readBytes: function() {
        var end = this.readVarint() + this.pos,
            buffer = this.buf.subarray(this.pos, end);
        this.pos = end;
        return buffer;
    },

    // verbose for performance reasons; doesn't affect gzipped size

    readPackedVarint: function(arr, isSigned) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readVarint(isSigned));
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readVarint(isSigned));
        return arr;
    },
    readPackedSVarint: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readSVarint());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    },
    readPackedBoolean: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readBoolean());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    },
    readPackedFloat: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readFloat());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    },
    readPackedDouble: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readDouble());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    },
    readPackedFixed32: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readFixed32());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    },
    readPackedSFixed32: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed32());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    },
    readPackedFixed64: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readFixed64());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    },
    readPackedSFixed64: function(arr) {
        if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed64());
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    },

    skip: function(val) {
        var type = val & 0x7;
        if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
        else if (type === Pbf.Fixed32) this.pos += 4;
        else if (type === Pbf.Fixed64) this.pos += 8;
        else throw new Error('Unimplemented type: ' + type);
    },

    // === WRITING =================================================================

    writeTag: function(tag, type) {
        this.writeVarint((tag << 3) | type);
    },

    realloc: function(min) {
        var length = this.length || 16;

        while (length < this.pos + min) length *= 2;

        if (length !== this.length) {
            var buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.length = length;
        }
    },

    finish: function() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.subarray(0, this.length);
    },

    writeFixed32: function(val) {
        this.realloc(4);
        writeInt32(this.buf, val, this.pos);
        this.pos += 4;
    },

    writeSFixed32: function(val) {
        this.realloc(4);
        writeInt32(this.buf, val, this.pos);
        this.pos += 4;
    },

    writeFixed64: function(val) {
        this.realloc(8);
        writeInt32(this.buf, val & -1, this.pos);
        writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeSFixed64: function(val) {
        this.realloc(8);
        writeInt32(this.buf, val & -1, this.pos);
        writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeVarint: function(val) {
        val = +val || 0;

        if (val > 0xfffffff || val < 0) {
            writeBigVarint(val, this);
            return;
        }

        this.realloc(4);

        this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] =   (val >>> 7) & 0x7f;
    },

    writeSVarint: function(val) {
        this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
    },

    writeBoolean: function(val) {
        this.writeVarint(Boolean(val));
    },

    writeString: function(str) {
        str = String(str);
        this.realloc(str.length * 4);

        this.pos++; // reserve 1 byte for short string length

        var startPos = this.pos;
        // write the string directly to the buffer and see how much was written
        this.pos = writeUtf8(this.buf, str, this.pos);
        var len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeFloat: function(val) {
        this.realloc(4);
        ieee754.write(this.buf, val, this.pos, true, 23, 4);
        this.pos += 4;
    },

    writeDouble: function(val) {
        this.realloc(8);
        ieee754.write(this.buf, val, this.pos, true, 52, 8);
        this.pos += 8;
    },

    writeBytes: function(buffer) {
        var len = buffer.length;
        this.writeVarint(len);
        this.realloc(len);
        for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
    },

    writeRawMessage: function(fn, obj) {
        this.pos++; // reserve 1 byte for short message length

        // write the message directly to the buffer and see how much was written
        var startPos = this.pos;
        fn(obj, this);
        var len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeMessage: function(tag, fn, obj) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeRawMessage(fn, obj);
    },

    writePackedVarint:   function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedVarint, arr);   },
    writePackedSVarint:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);  },
    writePackedBoolean:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);  },
    writePackedFloat:    function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFloat, arr);    },
    writePackedDouble:   function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedDouble, arr);   },
    writePackedFixed32:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);  },
    writePackedSFixed32: function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr); },
    writePackedFixed64:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);  },
    writePackedSFixed64: function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr); },

    writeBytesField: function(tag, buffer) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeBytes(buffer);
    },
    writeFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFixed32(val);
    },
    writeSFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeSFixed32(val);
    },
    writeFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeFixed64(val);
    },
    writeSFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeSFixed64(val);
    },
    writeVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeVarint(val);
    },
    writeSVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeSVarint(val);
    },
    writeStringField: function(tag, str) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeString(str);
    },
    writeFloatField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFloat(val);
    },
    writeDoubleField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeDouble(val);
    },
    writeBooleanField: function(tag, val) {
        this.writeVarintField(tag, Boolean(val));
    }
};

function readVarintRemainder(l, s, p) {
    var buf = p.buf,
        h, b;

    b = buf[p.pos++]; h  = (b & 0x70) >> 4;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 3;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 10; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 17; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 24; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x01) << 31; if (b < 0x80) return toNum(l, h, s);

    throw new Error('Expected varint not more than 10 bytes');
}

function readPackedEnd(pbf) {
    return pbf.type === Pbf.Bytes ?
        pbf.readVarint() + pbf.pos : pbf.pos + 1;
}

function toNum(low, high, isSigned) {
    if (isSigned) {
        return high * 0x100000000 + (low >>> 0);
    }

    return ((high >>> 0) * 0x100000000) + (low >>> 0);
}

function writeBigVarint(val, pbf) {
    var low, high;

    if (val >= 0) {
        low  = (val % 0x100000000) | 0;
        high = (val / 0x100000000) | 0;
    } else {
        low  = ~(-val % 0x100000000);
        high = ~(-val / 0x100000000);

        if (low ^ 0xffffffff) {
            low = (low + 1) | 0;
        } else {
            low = 0;
            high = (high + 1) | 0;
        }
    }

    if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
        throw new Error('Given varint doesn\'t fit into 10 bytes');
    }

    pbf.realloc(10);

    writeBigVarintLow(low, high, pbf);
    writeBigVarintHigh(high, pbf);
}

function writeBigVarintLow(low, high, pbf) {
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos]   = low & 0x7f;
}

function writeBigVarintHigh(high, pbf) {
    var lsb = (high & 0x07) << 4;

    pbf.buf[pbf.pos++] |= lsb         | ((high >>>= 3) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f;
}

function makeRoomForExtraLength(startPos, len, pbf) {
    var extraLen =
        len <= 0x3fff ? 1 :
        len <= 0x1fffff ? 2 :
        len <= 0xfffffff ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));

    // if 1 byte isn't enough for encoding message length, shift the data to the right
    pbf.realloc(extraLen);
    for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}

function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

// Buffer code below from https://github.com/feross/buffer, MIT-licensed

function readUInt32(buf, pos) {
    return ((buf[pos]) |
        (buf[pos + 1] << 8) |
        (buf[pos + 2] << 16)) +
        (buf[pos + 3] * 0x1000000);
}

function writeInt32(buf, val, pos) {
    buf[pos] = val;
    buf[pos + 1] = (val >>> 8);
    buf[pos + 2] = (val >>> 16);
    buf[pos + 3] = (val >>> 24);
}

function readInt32(buf, pos) {
    return ((buf[pos]) |
        (buf[pos + 1] << 8) |
        (buf[pos + 2] << 16)) +
        (buf[pos + 3] << 24);
}

function readUtf8(buf, pos, end) {
    var str = '';
    var i = pos;

    while (i < end) {
        var b0 = buf[i];
        var c = null; // codepoint
        var bytesPerSequence =
            b0 > 0xEF ? 4 :
            b0 > 0xDF ? 3 :
            b0 > 0xBF ? 2 : 1;

        if (i + bytesPerSequence > end) break;

        var b1, b2, b3;

        if (bytesPerSequence === 1) {
            if (b0 < 0x80) {
                c = b0;
            }
        } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 0xC0) === 0x80) {
                c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                if (c <= 0x7F) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                if (c <= 0xFFFF || c >= 0x110000) {
                    c = null;
                }
            }
        }

        if (c === null) {
            c = 0xFFFD;
            bytesPerSequence = 1;

        } else if (c > 0xFFFF) {
            c -= 0x10000;
            str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
            c = 0xDC00 | c & 0x3FF;
        }

        str += String.fromCharCode(c);
        i += bytesPerSequence;
    }

    return str;
}

function readUtf8TextDecoder(buf, pos, end) {
    return utf8TextDecoder.decode(buf.subarray(pos, end));
}

function writeUtf8(buf, str, pos) {
    for (var i = 0, c, lead; i < str.length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {
            if (lead) {
                if (c < 0xDC00) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                    lead = c;
                    continue;
                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }
            } else {
                if (c > 0xDBFF || (i + 1 === str.length)) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                } else {
                    lead = c;
                }
                continue;
            }
        } else if (lead) {
            buf[pos++] = 0xEF;
            buf[pos++] = 0xBF;
            buf[pos++] = 0xBD;
            lead = null;
        }

        if (c < 0x80) {
            buf[pos++] = c;
        } else {
            if (c < 0x800) {
                buf[pos++] = c >> 0x6 | 0xC0;
            } else {
                if (c < 0x10000) {
                    buf[pos++] = c >> 0xC | 0xE0;
                } else {
                    buf[pos++] = c >> 0x12 | 0xF0;
                    buf[pos++] = c >> 0xC & 0x3F | 0x80;
                }
                buf[pos++] = c >> 0x6 & 0x3F | 0x80;
            }
            buf[pos++] = c & 0x3F | 0x80;
        }
    }
    return pos;
}

},{"ieee754":7}],9:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.toOffset = exports.find = void 0;
var geobuf_1 = require("geobuf");
var boolean_point_in_polygon_1 = __importDefault(require("@turf/boolean-point-in-polygon"));
var helpers_1 = require("@turf/helpers");
var pbf_1 = __importDefault(require("pbf"));
var oceanUtils_1 = require("./oceanUtils");
function geoData(start, end, config) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = (config === null || config === void 0 ? void 0 : config.geoTZDataURL) || "https://cdn.jsdelivr.net/npm/geo-tz@latest/data/geo.dat";
                    return [4 /*yield*/, fetch(url, {
                            headers: { Range: "bytes=".concat(start, "-").concat(end) }
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function tzData(config) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = (config === null || config === void 0 ? void 0 : config.geoTZLookupURL) || "https://cdn.jsdelivr.net/npm/geo-tz@latest/data/index.json";
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var tzDataPromise = null;
/**
 * Find the timezone ID(s) at the given GPS coordinates.
 *
 * @param lat latitude (must be >= -90 and <=90)
 * @param lon longitue (must be >= -180 and <=180)
 * @returns An array of string of TZIDs at the given coordinate.
 */
function find(lat, lon, config) {
    return __awaiter(this, void 0, void 0, function () {
        var originalLon, err, pt, quadData, quadPos, curTzData, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalLon = lon;
                    // validate latitude
                    if (isNaN(lat) || lat > 90 || lat < -90) {
                        err = new Error("Invalid latitude: " + lat);
                        throw err;
                    }
                    // validate longitude
                    if (isNaN(lon) || lon > 180 || lon < -180) {
                        err = new Error("Invalid longitude: " + lon);
                        throw err;
                    }
                    // North Pole should return all ocean zones
                    if (lat === 90) {
                        return [2 /*return*/, oceanUtils_1.oceanZones.map(function (zone) { return zone.tzid; })];
                    }
                    // fix edges of the world
                    if (lat >= 89.9999) {
                        lat = 89.9999;
                    }
                    else if (lat <= -89.9999) {
                        lat = -89.9999;
                    }
                    if (lon >= 179.9999) {
                        lon = 179.9999;
                    }
                    else if (lon <= -179.9999) {
                        lon = -179.9999;
                    }
                    pt = (0, helpers_1.point)([lon, lat]);
                    quadData = {
                        top: 89.9999,
                        bottom: -89.9999,
                        left: -179.9999,
                        right: 179.9999,
                        midLat: 0,
                        midLon: 0
                    };
                    quadPos = "";
                    if (!tzDataPromise) {
                        tzDataPromise = tzData(config);
                    }
                    return [4 /*yield*/, tzDataPromise];
                case 1:
                    curTzData = (_a.sent()).lookup;
                    _loop_1 = function () {
                        var nextQuad, bufSlice, geoJson, timezonesContainingPoint, i, timezones_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    nextQuad = void 0;
                                    if (lat >= quadData.midLat && lon >= quadData.midLon) {
                                        nextQuad = "a";
                                        quadData.bottom = quadData.midLat;
                                        quadData.left = quadData.midLon;
                                    }
                                    else if (lat >= quadData.midLat && lon < quadData.midLon) {
                                        nextQuad = "b";
                                        quadData.bottom = quadData.midLat;
                                        quadData.right = quadData.midLon;
                                    }
                                    else if (lat < quadData.midLat && lon < quadData.midLon) {
                                        nextQuad = "c";
                                        quadData.top = quadData.midLat;
                                        quadData.right = quadData.midLon;
                                    }
                                    else {
                                        nextQuad = "d";
                                        quadData.top = quadData.midLat;
                                        quadData.left = quadData.midLon;
                                    }
                                    // console.log(nextQuad)
                                    curTzData = curTzData[nextQuad];
                                    // console.log()
                                    quadPos += nextQuad;
                                    if (!!curTzData) return [3 /*break*/, 1];
                                    return [2 /*return*/, { value: (0, oceanUtils_1.getTimezoneAtSea)(originalLon) }];
                                case 1:
                                    if (!(curTzData.pos >= 0 && curTzData.len)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, geoData(curTzData.pos, curTzData.pos + curTzData.len - 1, config)];
                                case 2:
                                    bufSlice = _b.sent();
                                    geoJson = (0, geobuf_1.decode)(new pbf_1["default"](bufSlice));
                                    timezonesContainingPoint = [];
                                    if (geoJson.type === "FeatureCollection") {
                                        for (i = 0; i < geoJson.features.length; i++) {
                                            if ((0, boolean_point_in_polygon_1["default"])(pt, geoJson.features[i])) {
                                                timezonesContainingPoint.push(geoJson.features[i].properties.tzid);
                                            }
                                        }
                                    }
                                    else if (geoJson.type === "Feature") {
                                        if ((0, boolean_point_in_polygon_1["default"])(pt, geoJson)) {
                                            timezonesContainingPoint.push(geoJson.properties.tzid);
                                        }
                                    }
                                    return [2 /*return*/, { value: timezonesContainingPoint.length > 0
                                                ? timezonesContainingPoint
                                                : (0, oceanUtils_1.getTimezoneAtSea)(originalLon) }];
                                case 3:
                                    if (!(curTzData.length > 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, tzDataPromise];
                                case 4:
                                    timezones_1 = (_b.sent()).timezones;
                                    return [2 /*return*/, { value: curTzData.map(function (idx) { return timezones_1[idx]; }) }];
                                case 5:
                                    if (typeof curTzData !== "object") {
                                        // not another nested quad index, throw error
                                        err = new Error("Unexpected data type");
                                        throw err;
                                    }
                                    _b.label = 6;
                                case 6:
                                    // calculate next quadtree depth data
                                    quadData.midLat = (quadData.top + quadData.bottom) / 2;
                                    quadData.midLon = (quadData.left + quadData.right) / 2;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.find = find;
function toOffset(timeZone) {
    var date = new Date();
    var utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    var tzDate = new Date(date.toLocaleString("en-US", { timeZone: timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4;
}
exports.toOffset = toOffset;

},{"./oceanUtils":10,"@turf/boolean-point-in-polygon":1,"@turf/helpers":2,"geobuf":6,"pbf":8}],10:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.getTimezoneAtSea = exports.oceanZones = void 0;
exports.oceanZones = [
    { tzid: 'Etc/GMT-12', left: 172.5, right: 180 },
    { tzid: 'Etc/GMT-11', left: 157.5, right: 172.5 },
    { tzid: 'Etc/GMT-10', left: 142.5, right: 157.5 },
    { tzid: 'Etc/GMT-9', left: 127.5, right: 142.5 },
    { tzid: 'Etc/GMT-8', left: 112.5, right: 127.5 },
    { tzid: 'Etc/GMT-7', left: 97.5, right: 112.5 },
    { tzid: 'Etc/GMT-6', left: 82.5, right: 97.5 },
    { tzid: 'Etc/GMT-5', left: 67.5, right: 82.5 },
    { tzid: 'Etc/GMT-4', left: 52.5, right: 67.5 },
    { tzid: 'Etc/GMT-3', left: 37.5, right: 52.5 },
    { tzid: 'Etc/GMT-2', left: 22.5, right: 37.5 },
    { tzid: 'Etc/GMT-1', left: 7.5, right: 22.5 },
    { tzid: 'Etc/GMT', left: -7.5, right: 7.5 },
    { tzid: 'Etc/GMT+1', left: -22.5, right: -7.5 },
    { tzid: 'Etc/GMT+2', left: -37.5, right: -22.5 },
    { tzid: 'Etc/GMT+3', left: -52.5, right: -37.5 },
    { tzid: 'Etc/GMT+4', left: -67.5, right: -52.5 },
    { tzid: 'Etc/GMT+5', left: -82.5, right: -67.5 },
    { tzid: 'Etc/GMT+6', left: -97.5, right: -82.5 },
    { tzid: 'Etc/GMT+7', left: -112.5, right: -97.5 },
    { tzid: 'Etc/GMT+8', left: -127.5, right: -112.5 },
    { tzid: 'Etc/GMT+9', left: -142.5, right: -127.5 },
    { tzid: 'Etc/GMT+10', left: -157.5, right: -142.5 },
    { tzid: 'Etc/GMT+11', left: -172.5, right: -157.5 },
    { tzid: 'Etc/GMT+12', left: -180, right: -172.5 },
];
/**
 * Find the Etc/GMT* timezone name(s) corresponding to the given longitue.
 *
 * @param lon The longitude to analyze
 * @returns An array of strings of TZIDs
 */
function getTimezoneAtSea(lon) {
    // coordinates along the 180 longitude should return two zones
    if (lon === -180 || lon === 180) {
        return ['Etc/GMT+12', 'Etc/GMT-12'];
    }
    var tzs = [];
    for (var i = 0; i < exports.oceanZones.length; i++) {
        var z = exports.oceanZones[i];
        if (z.left <= lon && z.right >= lon) {
            tzs.push(z.tzid);
        }
        else if (z.right < lon) {
            break;
        }
    }
    return tzs;
}
exports.getTimezoneAtSea = getTimezoneAtSea;

},{}]},{},[9])(9)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQHR1cmYvYm9vbGVhbi1wb2ludC1pbi1wb2x5Z29uL2Rpc3QvanMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQHR1cmYvaGVscGVycy9kaXN0L2pzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0B0dXJmL2ludmFyaWFudC9kaXN0L2pzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dlb2J1Zi9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvZ2VvYnVmL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9nZW9idWYvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYmYvaW5kZXguanMiLCJzcmMvZmluZC50cyIsInNyYy9vY2VhblV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbG9CQSxpQ0FBZ0M7QUFDaEMsNEZBQW9EO0FBQ3BELHlDQUFzQztBQUN0Qyw0Q0FBc0I7QUFFdEIsMkNBQTREO0FBTzVELFNBQWUsT0FBTyxDQUFDLEtBQWEsRUFBRSxHQUFXLEVBQUUsTUFBZTs7Ozs7O29CQUMxRCxHQUFHLEdBQUcsQ0FBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsWUFBWSxLQUFJLHlEQUF5RCxDQUFDO29CQUM3RSxxQkFBTSxLQUFLLENBQzFCLEdBQUcsRUFDSDs0QkFDRSxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsZ0JBQVMsS0FBSyxjQUFJLEdBQUcsQ0FBRSxFQUFFO3lCQUM1QyxDQUNGLEVBQUE7O29CQUxLLFFBQVEsR0FBRyxTQUtoQjtvQkFDTSxxQkFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUE7d0JBQW5DLHNCQUFPLFNBQTRCLEVBQUM7Ozs7Q0FDckM7QUFFRCxTQUFlLE1BQU0sQ0FBQyxNQUFlOzs7Ozs7b0JBQzdCLEdBQUcsR0FBRyxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxjQUFjLEtBQUksNERBQTRELENBQUM7b0JBQ2xGLHFCQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQTs7b0JBQTNCLFFBQVEsR0FBRyxTQUFnQjtvQkFDMUIscUJBQU0sUUFBUSxDQUFDLElBQUksRUFBRSxFQUFBO3dCQUE1QixzQkFBTyxTQUFxQixFQUFDOzs7O0NBQzlCO0FBRUQsSUFBSSxhQUFhLEdBQXdCLElBQUksQ0FBQztBQUU5Qzs7Ozs7O0dBTUc7QUFDSCxTQUFzQixJQUFJLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxNQUFlOzs7Ozs7b0JBQzVELFdBQVcsR0FBRyxHQUFHLENBQUM7b0JBSXhCLG9CQUFvQjtvQkFDcEIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUU7d0JBQ3ZDLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLENBQUMsQ0FBQzt3QkFDNUMsTUFBTSxHQUFHLENBQUM7cUJBQ1g7b0JBRUQscUJBQXFCO29CQUNyQixJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRTt3QkFDekMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLHFCQUFxQixHQUFHLEdBQUcsQ0FBQyxDQUFDO3dCQUM3QyxNQUFNLEdBQUcsQ0FBQztxQkFDWDtvQkFFRCwyQ0FBMkM7b0JBQzNDLElBQUksR0FBRyxLQUFLLEVBQUUsRUFBRTt3QkFDZCxzQkFBTyx1QkFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxJQUFJLEVBQVQsQ0FBUyxDQUFDLEVBQUM7cUJBQzVDO29CQUVELHlCQUF5QjtvQkFDekIsSUFBSSxHQUFHLElBQUksT0FBTyxFQUFFO3dCQUNsQixHQUFHLEdBQUcsT0FBTyxDQUFDO3FCQUNmO3lCQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUMxQixHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7cUJBQ2hCO29CQUVELElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTt3QkFDbkIsR0FBRyxHQUFHLFFBQVEsQ0FBQztxQkFDaEI7eUJBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQzNCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztxQkFDakI7b0JBRUssRUFBRSxHQUFHLElBQUEsZUFBSyxFQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBR3ZCLFFBQVEsR0FBRzt3QkFDZixHQUFHLEVBQUUsT0FBTzt3QkFDWixNQUFNLEVBQUUsQ0FBQyxPQUFPO3dCQUNoQixJQUFJLEVBQUUsQ0FBQyxRQUFRO3dCQUNmLEtBQUssRUFBRSxRQUFRO3dCQUNmLE1BQU0sRUFBRSxDQUFDO3dCQUNULE1BQU0sRUFBRSxDQUFDO3FCQUNWLENBQUM7b0JBQ0UsT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxDQUFDLGFBQWEsRUFBRTt3QkFDbEIsYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDaEM7b0JBRWdCLHFCQUFNLGFBQWEsRUFBQTs7b0JBQWhDLFNBQVMsR0FBRyxDQUFDLFNBQW1CLENBQUMsQ0FBQyxNQUFNOzs7Ozs7b0NBSXRDLFFBQVEsU0FBQSxDQUFDO29DQUNiLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0NBQ3BELFFBQVEsR0FBRyxHQUFHLENBQUM7d0NBQ2YsUUFBUSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO3dDQUNsQyxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7cUNBQ2pDO3lDQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0NBQzFELFFBQVEsR0FBRyxHQUFHLENBQUM7d0NBQ2YsUUFBUSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO3dDQUNsQyxRQUFRLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7cUNBQ2xDO3lDQUFNLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0NBQ3pELFFBQVEsR0FBRyxHQUFHLENBQUM7d0NBQ2YsUUFBUSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO3dDQUMvQixRQUFRLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7cUNBQ2xDO3lDQUFNO3dDQUNMLFFBQVEsR0FBRyxHQUFHLENBQUM7d0NBQ2YsUUFBUSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO3dDQUMvQixRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7cUNBQ2pDO29DQUVELHdCQUF3QjtvQ0FDeEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQ0FDaEMsZ0JBQWdCO29DQUNoQixPQUFPLElBQUksUUFBUSxDQUFDO3lDQUdoQixDQUFDLFNBQVMsRUFBVix3QkFBVTttRUFFTCxJQUFBLDZCQUFnQixFQUFDLFdBQVcsQ0FBQzs7eUNBQzNCLENBQUEsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQSxFQUFuQyx3QkFBbUM7b0NBRTNCLHFCQUFNLE9BQU8sQ0FDNUIsU0FBUyxDQUFDLEdBQUcsRUFDYixTQUFTLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUNqQyxNQUFNLENBQ1AsRUFBQTs7b0NBSkssUUFBUSxHQUFHLFNBSWhCO29DQUNLLE9BQU8sR0FBRyxJQUFBLGVBQU0sRUFBQyxJQUFJLGdCQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQ0FFcEMsd0JBQXdCLEdBQUcsRUFBRSxDQUFDO29DQUVwQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssbUJBQW1CLEVBQUU7d0NBQ3hDLEtBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NENBQ2hELElBQUksSUFBQSxxQ0FBTSxFQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBUSxDQUFDLEVBQUU7Z0RBQzFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs2Q0FDcEU7eUNBQ0Y7cUNBQ0Y7eUNBQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTt3Q0FDckMsSUFBSSxJQUFBLHFDQUFNLEVBQUMsRUFBRSxFQUFFLE9BQWMsQ0FBQyxFQUFFOzRDQUM5Qix3QkFBd0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzt5Q0FDeEQ7cUNBQ0Y7bUVBSU0sd0JBQXdCLENBQUMsTUFBTSxHQUFHLENBQUM7Z0RBQ3hDLENBQUMsQ0FBQyx3QkFBd0I7Z0RBQzFCLENBQUMsQ0FBQyxJQUFBLDZCQUFnQixFQUFDLFdBQVcsQ0FBQzs7eUNBQ3hCLENBQUEsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUEsRUFBcEIsd0JBQW9CO29DQUVWLHFCQUFNLGFBQWEsRUFBQTs7b0NBQWhDLGNBQVksQ0FBQyxTQUFtQixDQUFDLENBQUMsU0FBUzttRUFDMUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLFdBQVMsQ0FBQyxHQUFHLENBQUMsRUFBZCxDQUFjLENBQUM7O29DQUN4QyxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTt3Q0FDeEMsNkNBQTZDO3dDQUM3QyxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQzt3Q0FDeEMsTUFBTSxHQUFHLENBQUM7cUNBQ1g7OztvQ0FFRCxxQ0FBcUM7b0NBQ3JDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0NBQ3ZELFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7eUJBdEVsRCxJQUFJOzs7Ozs7Ozs7OztDQXdFWjtBQTdIRCxvQkE2SEM7QUFFRCxTQUFnQixRQUFRLENBQUMsUUFBZ0I7SUFDdkMsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN4QixJQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUUsSUFBTSxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN0RCxDQUFDO0FBTEQsNEJBS0M7Ozs7OztBQ3BLWSxRQUFBLFVBQVUsR0FBZ0I7SUFDckMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtJQUMvQyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0lBQ2pELEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7SUFDakQsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtJQUNoRCxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7SUFDL0MsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUM5QyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQzlDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDOUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUM5QyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQzlDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDN0MsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO0lBQzNDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQy9DLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ2pELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFO0lBQ2xELEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFO0lBQ2xELEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFO0lBQ25ELEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFO0lBQ25ELEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFO0NBQ2xELENBQUE7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEdBQVc7SUFDMUMsOERBQThEO0lBQzlELElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7UUFDL0IsT0FBTyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQTtLQUNwQztJQUNELElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtJQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQyxJQUFNLENBQUMsR0FBRyxrQkFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLEVBQUU7WUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDakI7YUFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ3hCLE1BQUs7U0FDTjtLQUNGO0lBQ0QsT0FBTyxHQUFHLENBQUE7QUFDWixDQUFDO0FBZkQsNENBZUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBpbnZhcmlhbnRfMSA9IHJlcXVpcmUoXCJAdHVyZi9pbnZhcmlhbnRcIik7XG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0V2ZW4lRTIlODAlOTNvZGRfcnVsZVxuLy8gbW9kaWZpZWQgZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL3BvaW50LWluLXBvbHlnb24vYmxvYi9tYXN0ZXIvaW5kZXguanNcbi8vIHdoaWNoIHdhcyBtb2RpZmllZCBmcm9tIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWxcbi8qKlxuICogVGFrZXMgYSB7QGxpbmsgUG9pbnR9IGFuZCBhIHtAbGluayBQb2x5Z29ufSBvciB7QGxpbmsgTXVsdGlQb2x5Z29ufSBhbmQgZGV0ZXJtaW5lcyBpZiB0aGUgcG9pbnRcbiAqIHJlc2lkZXMgaW5zaWRlIHRoZSBwb2x5Z29uLiBUaGUgcG9seWdvbiBjYW4gYmUgY29udmV4IG9yIGNvbmNhdmUuIFRoZSBmdW5jdGlvbiBhY2NvdW50cyBmb3IgaG9sZXMuXG4gKlxuICogQG5hbWUgYm9vbGVhblBvaW50SW5Qb2x5Z29uXG4gKiBAcGFyYW0ge0Nvb3JkfSBwb2ludCBpbnB1dCBwb2ludFxuICogQHBhcmFtIHtGZWF0dXJlPFBvbHlnb258TXVsdGlQb2x5Z29uPn0gcG9seWdvbiBpbnB1dCBwb2x5Z29uIG9yIG11bHRpcG9seWdvblxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25hbCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmlnbm9yZUJvdW5kYXJ5PWZhbHNlXSBUcnVlIGlmIHBvbHlnb24gYm91bmRhcnkgc2hvdWxkIGJlIGlnbm9yZWQgd2hlbiBkZXRlcm1pbmluZyBpZlxuICogdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcG9seWdvbiBvdGhlcndpc2UgZmFsc2UuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gYHRydWVgIGlmIHRoZSBQb2ludCBpcyBpbnNpZGUgdGhlIFBvbHlnb247IGBmYWxzZWAgaWYgdGhlIFBvaW50IGlzIG5vdCBpbnNpZGUgdGhlIFBvbHlnb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgcHQgPSB0dXJmLnBvaW50KFstNzcsIDQ0XSk7XG4gKiB2YXIgcG9seSA9IHR1cmYucG9seWdvbihbW1xuICogICBbLTgxLCA0MV0sXG4gKiAgIFstODEsIDQ3XSxcbiAqICAgWy03MiwgNDddLFxuICogICBbLTcyLCA0MV0sXG4gKiAgIFstODEsIDQxXVxuICogXV0pO1xuICpcbiAqIHR1cmYuYm9vbGVhblBvaW50SW5Qb2x5Z29uKHB0LCBwb2x5KTtcbiAqIC8vPSB0cnVlXG4gKi9cbmZ1bmN0aW9uIGJvb2xlYW5Qb2ludEluUG9seWdvbihwb2ludCwgcG9seWdvbiwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgLy8gdmFsaWRhdGlvblxuICAgIGlmICghcG9pbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicG9pbnQgaXMgcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGlmICghcG9seWdvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwb2x5Z29uIGlzIHJlcXVpcmVkXCIpO1xuICAgIH1cbiAgICB2YXIgcHQgPSBpbnZhcmlhbnRfMS5nZXRDb29yZChwb2ludCk7XG4gICAgdmFyIGdlb20gPSBpbnZhcmlhbnRfMS5nZXRHZW9tKHBvbHlnb24pO1xuICAgIHZhciB0eXBlID0gZ2VvbS50eXBlO1xuICAgIHZhciBiYm94ID0gcG9seWdvbi5iYm94O1xuICAgIHZhciBwb2x5cyA9IGdlb20uY29vcmRpbmF0ZXM7XG4gICAgLy8gUXVpY2sgZWxpbWluYXRpb24gaWYgcG9pbnQgaXMgbm90IGluc2lkZSBiYm94XG4gICAgaWYgKGJib3ggJiYgaW5CQm94KHB0LCBiYm94KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBub3JtYWxpemUgdG8gbXVsdGlwb2x5Z29uXG4gICAgaWYgKHR5cGUgPT09IFwiUG9seWdvblwiKSB7XG4gICAgICAgIHBvbHlzID0gW3BvbHlzXTtcbiAgICB9XG4gICAgdmFyIGluc2lkZVBvbHkgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvbHlzLmxlbmd0aCAmJiAhaW5zaWRlUG9seTsgaSsrKSB7XG4gICAgICAgIC8vIGNoZWNrIGlmIGl0IGlzIGluIHRoZSBvdXRlciByaW5nIGZpcnN0XG4gICAgICAgIGlmIChpblJpbmcocHQsIHBvbHlzW2ldWzBdLCBvcHRpb25zLmlnbm9yZUJvdW5kYXJ5KSkge1xuICAgICAgICAgICAgdmFyIGluSG9sZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGsgPSAxO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHRoZSBwb2ludCBpbiBhbnkgb2YgdGhlIGhvbGVzXG4gICAgICAgICAgICB3aGlsZSAoayA8IHBvbHlzW2ldLmxlbmd0aCAmJiAhaW5Ib2xlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluUmluZyhwdCwgcG9seXNbaV1ba10sICFvcHRpb25zLmlnbm9yZUJvdW5kYXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBpbkhvbGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWluSG9sZSkge1xuICAgICAgICAgICAgICAgIGluc2lkZVBvbHkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbnNpZGVQb2x5O1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gYm9vbGVhblBvaW50SW5Qb2x5Z29uO1xuLyoqXG4gKiBpblJpbmdcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBwdCBbeCx5XVxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gcmluZyBbW3gseV0sIFt4LHldLC4uXVxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVCb3VuZGFyeSBpZ25vcmVCb3VuZGFyeVxuICogQHJldHVybnMge2Jvb2xlYW59IGluUmluZ1xuICovXG5mdW5jdGlvbiBpblJpbmcocHQsIHJpbmcsIGlnbm9yZUJvdW5kYXJ5KSB7XG4gICAgdmFyIGlzSW5zaWRlID0gZmFsc2U7XG4gICAgaWYgKHJpbmdbMF1bMF0gPT09IHJpbmdbcmluZy5sZW5ndGggLSAxXVswXSAmJlxuICAgICAgICByaW5nWzBdWzFdID09PSByaW5nW3JpbmcubGVuZ3RoIC0gMV1bMV0pIHtcbiAgICAgICAgcmluZyA9IHJpbmcuc2xpY2UoMCwgcmluZy5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSByaW5nLmxlbmd0aCAtIDE7IGkgPCByaW5nLmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICB2YXIgeGkgPSByaW5nW2ldWzBdO1xuICAgICAgICB2YXIgeWkgPSByaW5nW2ldWzFdO1xuICAgICAgICB2YXIgeGogPSByaW5nW2pdWzBdO1xuICAgICAgICB2YXIgeWogPSByaW5nW2pdWzFdO1xuICAgICAgICB2YXIgb25Cb3VuZGFyeSA9IHB0WzFdICogKHhpIC0geGopICsgeWkgKiAoeGogLSBwdFswXSkgKyB5aiAqIChwdFswXSAtIHhpKSA9PT0gMCAmJlxuICAgICAgICAgICAgKHhpIC0gcHRbMF0pICogKHhqIC0gcHRbMF0pIDw9IDAgJiZcbiAgICAgICAgICAgICh5aSAtIHB0WzFdKSAqICh5aiAtIHB0WzFdKSA8PSAwO1xuICAgICAgICBpZiAob25Cb3VuZGFyeSkge1xuICAgICAgICAgICAgcmV0dXJuICFpZ25vcmVCb3VuZGFyeTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW50ZXJzZWN0ID0geWkgPiBwdFsxXSAhPT0geWogPiBwdFsxXSAmJlxuICAgICAgICAgICAgcHRbMF0gPCAoKHhqIC0geGkpICogKHB0WzFdIC0geWkpKSAvICh5aiAtIHlpKSArIHhpO1xuICAgICAgICBpZiAoaW50ZXJzZWN0KSB7XG4gICAgICAgICAgICBpc0luc2lkZSA9ICFpc0luc2lkZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXNJbnNpZGU7XG59XG4vKipcbiAqIGluQkJveFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1Bvc2l0aW9ufSBwdCBwb2ludCBbeCx5XVxuICogQHBhcmFtIHtCQm94fSBiYm94IEJCb3ggW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF1cbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlL2ZhbHNlIGlmIHBvaW50IGlzIGluc2lkZSBCQm94XG4gKi9cbmZ1bmN0aW9uIGluQkJveChwdCwgYmJveCkge1xuICAgIHJldHVybiAoYmJveFswXSA8PSBwdFswXSAmJiBiYm94WzFdIDw9IHB0WzFdICYmIGJib3hbMl0gPj0gcHRbMF0gJiYgYmJveFszXSA+PSBwdFsxXSk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qKlxuICogQG1vZHVsZSBoZWxwZXJzXG4gKi9cbi8qKlxuICogRWFydGggUmFkaXVzIHVzZWQgd2l0aCB0aGUgSGFydmVzaW5lIGZvcm11bGEgYW5kIGFwcHJveGltYXRlcyB1c2luZyBhIHNwaGVyaWNhbCAobm9uLWVsbGlwc29pZCkgRWFydGguXG4gKlxuICogQG1lbWJlcm9mIGhlbHBlcnNcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmV4cG9ydHMuZWFydGhSYWRpdXMgPSA2MzcxMDA4Ljg7XG4vKipcbiAqIFVuaXQgb2YgbWVhc3VyZW1lbnQgZmFjdG9ycyB1c2luZyBhIHNwaGVyaWNhbCAobm9uLWVsbGlwc29pZCkgZWFydGggcmFkaXVzLlxuICpcbiAqIEBtZW1iZXJvZiBoZWxwZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLmZhY3RvcnMgPSB7XG4gICAgY2VudGltZXRlcnM6IGV4cG9ydHMuZWFydGhSYWRpdXMgKiAxMDAsXG4gICAgY2VudGltZXRyZXM6IGV4cG9ydHMuZWFydGhSYWRpdXMgKiAxMDAsXG4gICAgZGVncmVlczogZXhwb3J0cy5lYXJ0aFJhZGl1cyAvIDExMTMyNSxcbiAgICBmZWV0OiBleHBvcnRzLmVhcnRoUmFkaXVzICogMy4yODA4NCxcbiAgICBpbmNoZXM6IGV4cG9ydHMuZWFydGhSYWRpdXMgKiAzOS4zNyxcbiAgICBraWxvbWV0ZXJzOiBleHBvcnRzLmVhcnRoUmFkaXVzIC8gMTAwMCxcbiAgICBraWxvbWV0cmVzOiBleHBvcnRzLmVhcnRoUmFkaXVzIC8gMTAwMCxcbiAgICBtZXRlcnM6IGV4cG9ydHMuZWFydGhSYWRpdXMsXG4gICAgbWV0cmVzOiBleHBvcnRzLmVhcnRoUmFkaXVzLFxuICAgIG1pbGVzOiBleHBvcnRzLmVhcnRoUmFkaXVzIC8gMTYwOS4zNDQsXG4gICAgbWlsbGltZXRlcnM6IGV4cG9ydHMuZWFydGhSYWRpdXMgKiAxMDAwLFxuICAgIG1pbGxpbWV0cmVzOiBleHBvcnRzLmVhcnRoUmFkaXVzICogMTAwMCxcbiAgICBuYXV0aWNhbG1pbGVzOiBleHBvcnRzLmVhcnRoUmFkaXVzIC8gMTg1MixcbiAgICByYWRpYW5zOiAxLFxuICAgIHlhcmRzOiBleHBvcnRzLmVhcnRoUmFkaXVzICogMS4wOTM2LFxufTtcbi8qKlxuICogVW5pdHMgb2YgbWVhc3VyZW1lbnQgZmFjdG9ycyBiYXNlZCBvbiAxIG1ldGVyLlxuICpcbiAqIEBtZW1iZXJvZiBoZWxwZXJzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLnVuaXRzRmFjdG9ycyA9IHtcbiAgICBjZW50aW1ldGVyczogMTAwLFxuICAgIGNlbnRpbWV0cmVzOiAxMDAsXG4gICAgZGVncmVlczogMSAvIDExMTMyNSxcbiAgICBmZWV0OiAzLjI4MDg0LFxuICAgIGluY2hlczogMzkuMzcsXG4gICAga2lsb21ldGVyczogMSAvIDEwMDAsXG4gICAga2lsb21ldHJlczogMSAvIDEwMDAsXG4gICAgbWV0ZXJzOiAxLFxuICAgIG1ldHJlczogMSxcbiAgICBtaWxlczogMSAvIDE2MDkuMzQ0LFxuICAgIG1pbGxpbWV0ZXJzOiAxMDAwLFxuICAgIG1pbGxpbWV0cmVzOiAxMDAwLFxuICAgIG5hdXRpY2FsbWlsZXM6IDEgLyAxODUyLFxuICAgIHJhZGlhbnM6IDEgLyBleHBvcnRzLmVhcnRoUmFkaXVzLFxuICAgIHlhcmRzOiAxLjA5MzYxMzMsXG59O1xuLyoqXG4gKiBBcmVhIG9mIG1lYXN1cmVtZW50IGZhY3RvcnMgYmFzZWQgb24gMSBzcXVhcmUgbWV0ZXIuXG4gKlxuICogQG1lbWJlcm9mIGhlbHBlcnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuYXJlYUZhY3RvcnMgPSB7XG4gICAgYWNyZXM6IDAuMDAwMjQ3MTA1LFxuICAgIGNlbnRpbWV0ZXJzOiAxMDAwMCxcbiAgICBjZW50aW1ldHJlczogMTAwMDAsXG4gICAgZmVldDogMTAuNzYzOTEwNDE3LFxuICAgIGhlY3RhcmVzOiAwLjAwMDEsXG4gICAgaW5jaGVzOiAxNTUwLjAwMzEwMDAwNixcbiAgICBraWxvbWV0ZXJzOiAwLjAwMDAwMSxcbiAgICBraWxvbWV0cmVzOiAwLjAwMDAwMSxcbiAgICBtZXRlcnM6IDEsXG4gICAgbWV0cmVzOiAxLFxuICAgIG1pbGVzOiAzLjg2ZS03LFxuICAgIG1pbGxpbWV0ZXJzOiAxMDAwMDAwLFxuICAgIG1pbGxpbWV0cmVzOiAxMDAwMDAwLFxuICAgIHlhcmRzOiAxLjE5NTk5MDA0Nixcbn07XG4vKipcbiAqIFdyYXBzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGluIGEgR2VvSlNPTiB7QGxpbmsgRmVhdHVyZX0uXG4gKlxuICogQG5hbWUgZmVhdHVyZVxuICogQHBhcmFtIHtHZW9tZXRyeX0gZ2VvbWV0cnkgaW5wdXQgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV0gYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25hbCBQYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtvcHRpb25zLmJib3hdIEJvdW5kaW5nIEJveCBBcnJheSBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXSBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW29wdGlvbnMuaWRdIElkZW50aWZpZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBGZWF0dXJlXG4gKiBAcmV0dXJucyB7RmVhdHVyZX0gYSBHZW9KU09OIEZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgZ2VvbWV0cnkgPSB7XG4gKiAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gKiAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNTBdXG4gKiB9O1xuICpcbiAqIHZhciBmZWF0dXJlID0gdHVyZi5mZWF0dXJlKGdlb21ldHJ5KTtcbiAqXG4gKiAvLz1mZWF0dXJlXG4gKi9cbmZ1bmN0aW9uIGZlYXR1cmUoZ2VvbSwgcHJvcGVydGllcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgdmFyIGZlYXQgPSB7IHR5cGU6IFwiRmVhdHVyZVwiIH07XG4gICAgaWYgKG9wdGlvbnMuaWQgPT09IDAgfHwgb3B0aW9ucy5pZCkge1xuICAgICAgICBmZWF0LmlkID0gb3B0aW9ucy5pZDtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuYmJveCkge1xuICAgICAgICBmZWF0LmJib3ggPSBvcHRpb25zLmJib3g7XG4gICAgfVxuICAgIGZlYXQucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgZmVhdC5nZW9tZXRyeSA9IGdlb207XG4gICAgcmV0dXJuIGZlYXQ7XG59XG5leHBvcnRzLmZlYXR1cmUgPSBmZWF0dXJlO1xuLyoqXG4gKiBDcmVhdGVzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGZyb20gYSBHZW9tZXRyeSBzdHJpbmcgdHlwZSAmIGNvb3JkaW5hdGVzLlxuICogRm9yIEdlb21ldHJ5Q29sbGVjdGlvbiB0eXBlIHVzZSBgaGVscGVycy5nZW9tZXRyeUNvbGxlY3Rpb25gXG4gKlxuICogQG5hbWUgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEdlb21ldHJ5IFR5cGVcbiAqIEBwYXJhbSB7QXJyYXk8YW55Pn0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9uYWwgUGFyYW1ldGVyc1xuICogQHJldHVybnMge0dlb21ldHJ5fSBhIEdlb0pTT04gR2VvbWV0cnlcbiAqIEBleGFtcGxlXG4gKiB2YXIgdHlwZSA9IFwiUG9pbnRcIjtcbiAqIHZhciBjb29yZGluYXRlcyA9IFsxMTAsIDUwXTtcbiAqIHZhciBnZW9tZXRyeSA9IHR1cmYuZ2VvbWV0cnkodHlwZSwgY29vcmRpbmF0ZXMpO1xuICogLy8gPT4gZ2VvbWV0cnlcbiAqL1xuZnVuY3Rpb24gZ2VvbWV0cnkodHlwZSwgY29vcmRpbmF0ZXMsIF9vcHRpb25zKSB7XG4gICAgaWYgKF9vcHRpb25zID09PSB2b2lkIDApIHsgX29wdGlvbnMgPSB7fTsgfVxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwiUG9pbnRcIjpcbiAgICAgICAgICAgIHJldHVybiBwb2ludChjb29yZGluYXRlcykuZ2VvbWV0cnk7XG4gICAgICAgIGNhc2UgXCJMaW5lU3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gbGluZVN0cmluZyhjb29yZGluYXRlcykuZ2VvbWV0cnk7XG4gICAgICAgIGNhc2UgXCJQb2x5Z29uXCI6XG4gICAgICAgICAgICByZXR1cm4gcG9seWdvbihjb29yZGluYXRlcykuZ2VvbWV0cnk7XG4gICAgICAgIGNhc2UgXCJNdWx0aVBvaW50XCI6XG4gICAgICAgICAgICByZXR1cm4gbXVsdGlQb2ludChjb29yZGluYXRlcykuZ2VvbWV0cnk7XG4gICAgICAgIGNhc2UgXCJNdWx0aUxpbmVTdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBtdWx0aUxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpLmdlb21ldHJ5O1xuICAgICAgICBjYXNlIFwiTXVsdGlQb2x5Z29uXCI6XG4gICAgICAgICAgICByZXR1cm4gbXVsdGlQb2x5Z29uKGNvb3JkaW5hdGVzKS5nZW9tZXRyeTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlICsgXCIgaXMgaW52YWxpZFwiKTtcbiAgICB9XG59XG5leHBvcnRzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUG9pbnR9IHtAbGluayBGZWF0dXJlfSBmcm9tIGEgUG9zaXRpb24uXG4gKlxuICogQG5hbWUgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gY29vcmRpbmF0ZXMgbG9uZ2l0dWRlLCBsYXRpdHVkZSBwb3NpdGlvbiAoZWFjaCBpbiBkZWNpbWFsIGRlZ3JlZXMpXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9uYWwgUGFyYW1ldGVyc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbb3B0aW9ucy5iYm94XSBCb3VuZGluZyBCb3ggQXJyYXkgW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0gYXNzb2NpYXRlZCB3aXRoIHRoZSBGZWF0dXJlXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtvcHRpb25zLmlkXSBJZGVudGlmaWVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHJldHVybnMge0ZlYXR1cmU8UG9pbnQ+fSBhIFBvaW50IGZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdKTtcbiAqXG4gKiAvLz1wb2ludFxuICovXG5mdW5jdGlvbiBwb2ludChjb29yZGluYXRlcywgcHJvcGVydGllcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgaWYgKCFjb29yZGluYXRlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb29yZGluYXRlcyBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb29yZGluYXRlcyBtdXN0IGJlIGFuIEFycmF5XCIpO1xuICAgIH1cbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb29yZGluYXRlcyBtdXN0IGJlIGF0IGxlYXN0IDIgbnVtYmVycyBsb25nXCIpO1xuICAgIH1cbiAgICBpZiAoIWlzTnVtYmVyKGNvb3JkaW5hdGVzWzBdKSB8fCAhaXNOdW1iZXIoY29vcmRpbmF0ZXNbMV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNvb3JkaW5hdGVzIG11c3QgY29udGFpbiBudW1iZXJzXCIpO1xuICAgIH1cbiAgICB2YXIgZ2VvbSA9IHtcbiAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXMsXG4gICAgfTtcbiAgICByZXR1cm4gZmVhdHVyZShnZW9tLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMucG9pbnQgPSBwb2ludDtcbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQb2ludH0ge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufSBmcm9tIGFuIEFycmF5IG9mIFBvaW50IGNvb3JkaW5hdGVzLlxuICpcbiAqIEBuYW1lIHBvaW50c1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9pbnRzXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIFRyYW5zbGF0ZSB0aGVzZSBwcm9wZXJ0aWVzIHRvIGVhY2ggRmVhdHVyZVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25hbCBQYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtvcHRpb25zLmJib3hdIEJvdW5kaW5nIEJveCBBcnJheSBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXVxuICogYXNzb2NpYXRlZCB3aXRoIHRoZSBGZWF0dXJlQ29sbGVjdGlvblxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVDb2xsZWN0aW9uXG4gKiBAcmV0dXJucyB7RmVhdHVyZUNvbGxlY3Rpb248UG9pbnQ+fSBQb2ludCBGZWF0dXJlXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50cyA9IHR1cmYucG9pbnRzKFtcbiAqICAgWy03NSwgMzldLFxuICogICBbLTgwLCA0NV0sXG4gKiAgIFstNzgsIDUwXVxuICogXSk7XG4gKlxuICogLy89cG9pbnRzXG4gKi9cbmZ1bmN0aW9uIHBvaW50cyhjb29yZGluYXRlcywgcHJvcGVydGllcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgcmV0dXJuIGZlYXR1cmVDb2xsZWN0aW9uKGNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRzKSB7XG4gICAgICAgIHJldHVybiBwb2ludChjb29yZHMsIHByb3BlcnRpZXMpO1xuICAgIH0pLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMucG9pbnRzID0gcG9pbnRzO1xuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIFBvbHlnb259IHtAbGluayBGZWF0dXJlfSBmcm9tIGFuIEFycmF5IG9mIExpbmVhclJpbmdzLlxuICpcbiAqIEBuYW1lIHBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvbHlnb24+fSBQb2x5Z29uIEZlYXR1cmVcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seWdvbiA9IHR1cmYucG9seWdvbihbW1stNSwgNTJdLCBbLTQsIDU2XSwgWy0yLCA1MV0sIFstNywgNTRdLCBbLTUsIDUyXV1dLCB7IG5hbWU6ICdwb2x5MScgfSk7XG4gKlxuICogLy89cG9seWdvblxuICovXG5mdW5jdGlvbiBwb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICBmb3IgKHZhciBfaSA9IDAsIGNvb3JkaW5hdGVzXzEgPSBjb29yZGluYXRlczsgX2kgPCBjb29yZGluYXRlc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgcmluZyA9IGNvb3JkaW5hdGVzXzFbX2ldO1xuICAgICAgICBpZiAocmluZy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFYWNoIExpbmVhclJpbmcgb2YgYSBQb2x5Z29uIG11c3QgaGF2ZSA0IG9yIG1vcmUgUG9zaXRpb25zLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJpbmdbcmluZy5sZW5ndGggLSAxXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZmlyc3QgcG9pbnQgb2YgUG9seWdvbiBjb250YWlucyB0d28gbnVtYmVyc1xuICAgICAgICAgICAgaWYgKHJpbmdbcmluZy5sZW5ndGggLSAxXVtqXSAhPT0gcmluZ1swXVtqXSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZpcnN0IGFuZCBsYXN0IFBvc2l0aW9uIGFyZSBub3QgZXF1aXZhbGVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGdlb20gPSB7XG4gICAgICAgIHR5cGU6IFwiUG9seWdvblwiLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXMsXG4gICAgfTtcbiAgICByZXR1cm4gZmVhdHVyZShnZW9tLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMucG9seWdvbiA9IHBvbHlnb247XG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUG9seWdvbn0ge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufSBmcm9tIGFuIEFycmF5IG9mIFBvbHlnb24gY29vcmRpbmF0ZXMuXG4gKlxuICogQG5hbWUgcG9seWdvbnNcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9seWdvbiBjb29yZGluYXRlc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVDb2xsZWN0aW9uXG4gKiBAcmV0dXJucyB7RmVhdHVyZUNvbGxlY3Rpb248UG9seWdvbj59IFBvbHlnb24gRmVhdHVyZUNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seWdvbnMgPSB0dXJmLnBvbHlnb25zKFtcbiAqICAgW1tbLTUsIDUyXSwgWy00LCA1Nl0sIFstMiwgNTFdLCBbLTcsIDU0XSwgWy01LCA1Ml1dXSxcbiAqICAgW1tbLTE1LCA0Ml0sIFstMTQsIDQ2XSwgWy0xMiwgNDFdLCBbLTE3LCA0NF0sIFstMTUsIDQyXV1dLFxuICogXSk7XG4gKlxuICogLy89cG9seWdvbnNcbiAqL1xuZnVuY3Rpb24gcG9seWdvbnMoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxuICAgIHJldHVybiBmZWF0dXJlQ29sbGVjdGlvbihjb29yZGluYXRlcy5tYXAoZnVuY3Rpb24gKGNvb3Jkcykge1xuICAgICAgICByZXR1cm4gcG9seWdvbihjb29yZHMsIHByb3BlcnRpZXMpO1xuICAgIH0pLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMucG9seWdvbnMgPSBwb2x5Z29ucztcbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBMaW5lU3RyaW5nfSB7QGxpbmsgRmVhdHVyZX0gZnJvbSBhbiBBcnJheSBvZiBQb3NpdGlvbnMuXG4gKlxuICogQG5hbWUgbGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9zaXRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9uYWwgUGFyYW1ldGVyc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBbb3B0aW9ucy5iYm94XSBCb3VuZGluZyBCb3ggQXJyYXkgW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0gYXNzb2NpYXRlZCB3aXRoIHRoZSBGZWF0dXJlXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtvcHRpb25zLmlkXSBJZGVudGlmaWVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHJldHVybnMge0ZlYXR1cmU8TGluZVN0cmluZz59IExpbmVTdHJpbmcgRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBsaW5lc3RyaW5nMSA9IHR1cmYubGluZVN0cmluZyhbWy0yNCwgNjNdLCBbLTIzLCA2MF0sIFstMjUsIDY1XSwgWy0yMCwgNjldXSwge25hbWU6ICdsaW5lIDEnfSk7XG4gKiB2YXIgbGluZXN0cmluZzIgPSB0dXJmLmxpbmVTdHJpbmcoW1stMTQsIDQzXSwgWy0xMywgNDBdLCBbLTE1LCA0NV0sIFstMTAsIDQ5XV0sIHtuYW1lOiAnbGluZSAyJ30pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmcxXG4gKiAvLz1saW5lc3RyaW5nMlxuICovXG5mdW5jdGlvbiBsaW5lU3RyaW5nKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb29yZGluYXRlcyBtdXN0IGJlIGFuIGFycmF5IG9mIHR3byBvciBtb3JlIHBvc2l0aW9uc1wiKTtcbiAgICB9XG4gICAgdmFyIGdlb20gPSB7XG4gICAgICAgIHR5cGU6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXMsXG4gICAgfTtcbiAgICByZXR1cm4gZmVhdHVyZShnZW9tLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMubGluZVN0cmluZyA9IGxpbmVTdHJpbmc7XG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgTGluZVN0cmluZ30ge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufSBmcm9tIGFuIEFycmF5IG9mIExpbmVTdHJpbmcgY29vcmRpbmF0ZXMuXG4gKlxuICogQG5hbWUgbGluZVN0cmluZ3NcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdXG4gKiBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtvcHRpb25zLmlkXSBJZGVudGlmaWVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZUNvbGxlY3Rpb25cbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbjxMaW5lU3RyaW5nPn0gTGluZVN0cmluZyBGZWF0dXJlQ29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqIHZhciBsaW5lc3RyaW5ncyA9IHR1cmYubGluZVN0cmluZ3MoW1xuICogICBbWy0yNCwgNjNdLCBbLTIzLCA2MF0sIFstMjUsIDY1XSwgWy0yMCwgNjldXSxcbiAqICAgW1stMTQsIDQzXSwgWy0xMywgNDBdLCBbLTE1LCA0NV0sIFstMTAsIDQ5XV1cbiAqIF0pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmdzXG4gKi9cbmZ1bmN0aW9uIGxpbmVTdHJpbmdzKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICByZXR1cm4gZmVhdHVyZUNvbGxlY3Rpb24oY29vcmRpbmF0ZXMubWFwKGZ1bmN0aW9uIChjb29yZHMpIHtcbiAgICAgICAgcmV0dXJuIGxpbmVTdHJpbmcoY29vcmRzLCBwcm9wZXJ0aWVzKTtcbiAgICB9KSwgb3B0aW9ucyk7XG59XG5leHBvcnRzLmxpbmVTdHJpbmdzID0gbGluZVN0cmluZ3M7XG4vKipcbiAqIFRha2VzIG9uZSBvciBtb3JlIHtAbGluayBGZWF0dXJlfEZlYXR1cmVzfSBhbmQgY3JlYXRlcyBhIHtAbGluayBGZWF0dXJlQ29sbGVjdGlvbn0uXG4gKlxuICogQG5hbWUgZmVhdHVyZUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RmVhdHVyZVtdfSBmZWF0dXJlcyBpbnB1dCBmZWF0dXJlc1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25hbCBQYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IFtvcHRpb25zLmJib3hdIEJvdW5kaW5nIEJveCBBcnJheSBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXSBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW29wdGlvbnMuaWRdIElkZW50aWZpZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBGZWF0dXJlXG4gKiBAcmV0dXJucyB7RmVhdHVyZUNvbGxlY3Rpb259IEZlYXR1cmVDb2xsZWN0aW9uIG9mIEZlYXR1cmVzXG4gKiBAZXhhbXBsZVxuICogdmFyIGxvY2F0aW9uQSA9IHR1cmYucG9pbnQoWy03NS4zNDMsIDM5Ljk4NF0sIHtuYW1lOiAnTG9jYXRpb24gQSd9KTtcbiAqIHZhciBsb2NhdGlvbkIgPSB0dXJmLnBvaW50KFstNzUuODMzLCAzOS4yODRdLCB7bmFtZTogJ0xvY2F0aW9uIEInfSk7XG4gKiB2YXIgbG9jYXRpb25DID0gdHVyZi5wb2ludChbLTc1LjUzNCwgMzkuMTIzXSwge25hbWU6ICdMb2NhdGlvbiBDJ30pO1xuICpcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5mZWF0dXJlQ29sbGVjdGlvbihbXG4gKiAgIGxvY2F0aW9uQSxcbiAqICAgbG9jYXRpb25CLFxuICogICBsb2NhdGlvbkNcbiAqIF0pO1xuICpcbiAqIC8vPWNvbGxlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZmVhdHVyZUNvbGxlY3Rpb24oZmVhdHVyZXMsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxuICAgIHZhciBmYyA9IHsgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiIH07XG4gICAgaWYgKG9wdGlvbnMuaWQpIHtcbiAgICAgICAgZmMuaWQgPSBvcHRpb25zLmlkO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5iYm94KSB7XG4gICAgICAgIGZjLmJib3ggPSBvcHRpb25zLmJib3g7XG4gICAgfVxuICAgIGZjLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgcmV0dXJuIGZjO1xufVxuZXhwb3J0cy5mZWF0dXJlQ29sbGVjdGlvbiA9IGZlYXR1cmVDb2xsZWN0aW9uO1xuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlMaW5lU3RyaW5nPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aUxpbmVTdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBMaW5lU3RyaW5nc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpTGluZVN0cmluZz59IGEgTXVsdGlMaW5lU3RyaW5nIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpTGluZSA9IHR1cmYubXVsdGlMaW5lU3RyaW5nKFtbWzAsMF0sWzEwLDEwXV1dKTtcbiAqXG4gKiAvLz1tdWx0aUxpbmVcbiAqL1xuZnVuY3Rpb24gbXVsdGlMaW5lU3RyaW5nKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICB2YXIgZ2VvbSA9IHtcbiAgICAgICAgdHlwZTogXCJNdWx0aUxpbmVTdHJpbmdcIixcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzLFxuICAgIH07XG4gICAgcmV0dXJuIGZlYXR1cmUoZ2VvbSwgcHJvcGVydGllcywgb3B0aW9ucyk7XG59XG5leHBvcnRzLm11bHRpTGluZVN0cmluZyA9IG11bHRpTGluZVN0cmluZztcbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpUG9pbnQ+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9pbnRcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvc2l0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9pbnQ+fSBhIE11bHRpUG9pbnQgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQdCA9IHR1cmYubXVsdGlQb2ludChbWzAsMF0sWzEwLDEwXV0pO1xuICpcbiAqIC8vPW11bHRpUHRcbiAqL1xuZnVuY3Rpb24gbXVsdGlQb2ludChjb29yZGluYXRlcywgcHJvcGVydGllcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgdmFyIGdlb20gPSB7XG4gICAgICAgIHR5cGU6IFwiTXVsdGlQb2ludFwiLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXMsXG4gICAgfTtcbiAgICByZXR1cm4gZmVhdHVyZShnZW9tLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMubXVsdGlQb2ludCA9IG11bHRpUG9pbnQ7XG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aVBvbHlnb24+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9seWdvblxuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb2x5Z29uc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9seWdvbj59IGEgbXVsdGlwb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIG11bHRpUG9seSA9IHR1cmYubXVsdGlQb2x5Z29uKFtbW1swLDBdLFswLDEwXSxbMTAsMTBdLFsxMCwwXSxbMCwwXV1dXSk7XG4gKlxuICogLy89bXVsdGlQb2x5XG4gKlxuICovXG5mdW5jdGlvbiBtdWx0aVBvbHlnb24oY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxuICAgIHZhciBnZW9tID0ge1xuICAgICAgICB0eXBlOiBcIk11bHRpUG9seWdvblwiLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXMsXG4gICAgfTtcbiAgICByZXR1cm4gZmVhdHVyZShnZW9tLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMubXVsdGlQb2x5Z29uID0gbXVsdGlQb2x5Z29uO1xuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBnZW9tZXRyeUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8R2VvbWV0cnk+fSBnZW9tZXRyaWVzIGFuIGFycmF5IG9mIEdlb0pTT04gR2VvbWV0cmllc1xuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XSBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbmFsIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gW29wdGlvbnMuYmJveF0gQm91bmRpbmcgQm94IEFycmF5IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIGFzc29jaWF0ZWQgd2l0aCB0aGUgRmVhdHVyZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbb3B0aW9ucy5pZF0gSWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhlIEZlYXR1cmVcbiAqIEByZXR1cm5zIHtGZWF0dXJlPEdlb21ldHJ5Q29sbGVjdGlvbj59IGEgR2VvSlNPTiBHZW9tZXRyeUNvbGxlY3Rpb24gRmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwdCA9IHR1cmYuZ2VvbWV0cnkoXCJQb2ludFwiLCBbMTAwLCAwXSk7XG4gKiB2YXIgbGluZSA9IHR1cmYuZ2VvbWV0cnkoXCJMaW5lU3RyaW5nXCIsIFtbMTAxLCAwXSwgWzEwMiwgMV1dKTtcbiAqIHZhciBjb2xsZWN0aW9uID0gdHVyZi5nZW9tZXRyeUNvbGxlY3Rpb24oW3B0LCBsaW5lXSk7XG4gKlxuICogLy8gPT4gY29sbGVjdGlvblxuICovXG5mdW5jdGlvbiBnZW9tZXRyeUNvbGxlY3Rpb24oZ2VvbWV0cmllcywgcHJvcGVydGllcywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgdmFyIGdlb20gPSB7XG4gICAgICAgIHR5cGU6IFwiR2VvbWV0cnlDb2xsZWN0aW9uXCIsXG4gICAgICAgIGdlb21ldHJpZXM6IGdlb21ldHJpZXMsXG4gICAgfTtcbiAgICByZXR1cm4gZmVhdHVyZShnZW9tLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbn1cbmV4cG9ydHMuZ2VvbWV0cnlDb2xsZWN0aW9uID0gZ2VvbWV0cnlDb2xsZWN0aW9uO1xuLyoqXG4gKiBSb3VuZCBudW1iZXIgdG8gcHJlY2lzaW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG51bSBOdW1iZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbcHJlY2lzaW9uPTBdIFByZWNpc2lvblxuICogQHJldHVybnMge251bWJlcn0gcm91bmRlZCBudW1iZXJcbiAqIEBleGFtcGxlXG4gKiB0dXJmLnJvdW5kKDEyMC40MzIxKVxuICogLy89MTIwXG4gKlxuICogdHVyZi5yb3VuZCgxMjAuNDMyMSwgMilcbiAqIC8vPTEyMC40M1xuICovXG5mdW5jdGlvbiByb3VuZChudW0sIHByZWNpc2lvbikge1xuICAgIGlmIChwcmVjaXNpb24gPT09IHZvaWQgMCkgeyBwcmVjaXNpb24gPSAwOyB9XG4gICAgaWYgKHByZWNpc2lvbiAmJiAhKHByZWNpc2lvbiA+PSAwKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwcmVjaXNpb24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlclwiKTtcbiAgICB9XG4gICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnBvdygxMCwgcHJlY2lzaW9uIHx8IDApO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllcjtcbn1cbmV4cG9ydHMucm91bmQgPSByb3VuZDtcbi8qKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IChhc3N1bWluZyBhIHNwaGVyaWNhbCBFYXJ0aCkgZnJvbSByYWRpYW5zIHRvIGEgbW9yZSBmcmllbmRseSB1bml0LlxuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywga2lsb21ldGVycywgY2VudGltZXRlcnMsIGZlZXRcbiAqXG4gKiBAbmFtZSByYWRpYW5zVG9MZW5ndGhcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGluIHJhZGlhbnMgYWNyb3NzIHRoZSBzcGhlcmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9XCJraWxvbWV0ZXJzXCJdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0cmVzLFxuICogbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gZGlzdGFuY2VcbiAqL1xuZnVuY3Rpb24gcmFkaWFuc1RvTGVuZ3RoKHJhZGlhbnMsIHVuaXRzKSB7XG4gICAgaWYgKHVuaXRzID09PSB2b2lkIDApIHsgdW5pdHMgPSBcImtpbG9tZXRlcnNcIjsgfVxuICAgIHZhciBmYWN0b3IgPSBleHBvcnRzLmZhY3RvcnNbdW5pdHNdO1xuICAgIGlmICghZmFjdG9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih1bml0cyArIFwiIHVuaXRzIGlzIGludmFsaWRcIik7XG4gICAgfVxuICAgIHJldHVybiByYWRpYW5zICogZmFjdG9yO1xufVxuZXhwb3J0cy5yYWRpYW5zVG9MZW5ndGggPSByYWRpYW5zVG9MZW5ndGg7XG4vKipcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCAoYXNzdW1pbmcgYSBzcGhlcmljYWwgRWFydGgpIGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byByYWRpYW5zXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBuYW1lIGxlbmd0aFRvUmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGluIHJlYWwgdW5pdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdW5pdHM9XCJraWxvbWV0ZXJzXCJdIGNhbiBiZSBkZWdyZWVzLCByYWRpYW5zLCBtaWxlcywgaW5jaGVzLCB5YXJkcywgbWV0cmVzLFxuICogbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gcmFkaWFuc1xuICovXG5mdW5jdGlvbiBsZW5ndGhUb1JhZGlhbnMoZGlzdGFuY2UsIHVuaXRzKSB7XG4gICAgaWYgKHVuaXRzID09PSB2b2lkIDApIHsgdW5pdHMgPSBcImtpbG9tZXRlcnNcIjsgfVxuICAgIHZhciBmYWN0b3IgPSBleHBvcnRzLmZhY3RvcnNbdW5pdHNdO1xuICAgIGlmICghZmFjdG9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih1bml0cyArIFwiIHVuaXRzIGlzIGludmFsaWRcIik7XG4gICAgfVxuICAgIHJldHVybiBkaXN0YW5jZSAvIGZhY3Rvcjtcbn1cbmV4cG9ydHMubGVuZ3RoVG9SYWRpYW5zID0gbGVuZ3RoVG9SYWRpYW5zO1xuLyoqXG4gKiBDb252ZXJ0IGEgZGlzdGFuY2UgbWVhc3VyZW1lbnQgKGFzc3VtaW5nIGEgc3BoZXJpY2FsIEVhcnRoKSBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gZGVncmVlc1xuICogVmFsaWQgdW5pdHM6IG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBpbmNoZXMsIHlhcmRzLCBtZXRlcnMsIG1ldHJlcywgY2VudGltZXRlcnMsIGtpbG9tZXRyZXMsIGZlZXRcbiAqXG4gKiBAbmFtZSBsZW5ndGhUb0RlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByZWFsIHVuaXRzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VuaXRzPVwia2lsb21ldGVyc1wiXSBjYW4gYmUgZGVncmVlcywgcmFkaWFucywgbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldHJlcyxcbiAqIG1ldGVycywga2lsb21ldHJlcywga2lsb21ldGVycy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXNcbiAqL1xuZnVuY3Rpb24gbGVuZ3RoVG9EZWdyZWVzKGRpc3RhbmNlLCB1bml0cykge1xuICAgIHJldHVybiByYWRpYW5zVG9EZWdyZWVzKGxlbmd0aFRvUmFkaWFucyhkaXN0YW5jZSwgdW5pdHMpKTtcbn1cbmV4cG9ydHMubGVuZ3RoVG9EZWdyZWVzID0gbGVuZ3RoVG9EZWdyZWVzO1xuLyoqXG4gKiBDb252ZXJ0cyBhbnkgYmVhcmluZyBhbmdsZSBmcm9tIHRoZSBub3J0aCBsaW5lIGRpcmVjdGlvbiAocG9zaXRpdmUgY2xvY2t3aXNlKVxuICogYW5kIHJldHVybnMgYW4gYW5nbGUgYmV0d2VlbiAwLTM2MCBkZWdyZWVzIChwb3NpdGl2ZSBjbG9ja3dpc2UpLCAwIGJlaW5nIHRoZSBub3J0aCBsaW5lXG4gKlxuICogQG5hbWUgYmVhcmluZ1RvQXppbXV0aFxuICogQHBhcmFtIHtudW1iZXJ9IGJlYXJpbmcgYW5nbGUsIGJldHdlZW4gLTE4MCBhbmQgKzE4MCBkZWdyZWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBhbmdsZSBiZXR3ZWVuIDAgYW5kIDM2MCBkZWdyZWVzXG4gKi9cbmZ1bmN0aW9uIGJlYXJpbmdUb0F6aW11dGgoYmVhcmluZykge1xuICAgIHZhciBhbmdsZSA9IGJlYXJpbmcgJSAzNjA7XG4gICAgaWYgKGFuZ2xlIDwgMCkge1xuICAgICAgICBhbmdsZSArPSAzNjA7XG4gICAgfVxuICAgIHJldHVybiBhbmdsZTtcbn1cbmV4cG9ydHMuYmVhcmluZ1RvQXppbXV0aCA9IGJlYXJpbmdUb0F6aW11dGg7XG4vKipcbiAqIENvbnZlcnRzIGFuIGFuZ2xlIGluIHJhZGlhbnMgdG8gZGVncmVlc1xuICpcbiAqIEBuYW1lIHJhZGlhbnNUb0RlZ3JlZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYW5zIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGRlZ3JlZXMgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICovXG5mdW5jdGlvbiByYWRpYW5zVG9EZWdyZWVzKHJhZGlhbnMpIHtcbiAgICB2YXIgZGVncmVlcyA9IHJhZGlhbnMgJSAoMiAqIE1hdGguUEkpO1xuICAgIHJldHVybiAoZGVncmVlcyAqIDE4MCkgLyBNYXRoLlBJO1xufVxuZXhwb3J0cy5yYWRpYW5zVG9EZWdyZWVzID0gcmFkaWFuc1RvRGVncmVlcztcbi8qKlxuICogQ29udmVydHMgYW4gYW5nbGUgaW4gZGVncmVlcyB0byByYWRpYW5zXG4gKlxuICogQG5hbWUgZGVncmVlc1RvUmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZXMgYW5nbGUgYmV0d2VlbiAwIGFuZCAzNjAgZGVncmVlc1xuICogQHJldHVybnMge251bWJlcn0gYW5nbGUgaW4gcmFkaWFuc1xuICovXG5mdW5jdGlvbiBkZWdyZWVzVG9SYWRpYW5zKGRlZ3JlZXMpIHtcbiAgICB2YXIgcmFkaWFucyA9IGRlZ3JlZXMgJSAzNjA7XG4gICAgcmV0dXJuIChyYWRpYW5zICogTWF0aC5QSSkgLyAxODA7XG59XG5leHBvcnRzLmRlZ3JlZXNUb1JhZGlhbnMgPSBkZWdyZWVzVG9SYWRpYW5zO1xuLyoqXG4gKiBDb252ZXJ0cyBhIGxlbmd0aCB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czogbWlsZXMsIG5hdXRpY2FsbWlsZXMsIGluY2hlcywgeWFyZHMsIG1ldGVycywgbWV0cmVzLCBraWxvbWV0ZXJzLCBjZW50aW1ldGVycywgZmVldFxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0ge1VuaXRzfSBbb3JpZ2luYWxVbml0PVwia2lsb21ldGVyc1wiXSBvZiB0aGUgbGVuZ3RoXG4gKiBAcGFyYW0ge1VuaXRzfSBbZmluYWxVbml0PVwia2lsb21ldGVyc1wiXSByZXR1cm5lZCB1bml0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY29udmVydGVkIGxlbmd0aFxuICovXG5mdW5jdGlvbiBjb252ZXJ0TGVuZ3RoKGxlbmd0aCwgb3JpZ2luYWxVbml0LCBmaW5hbFVuaXQpIHtcbiAgICBpZiAob3JpZ2luYWxVbml0ID09PSB2b2lkIDApIHsgb3JpZ2luYWxVbml0ID0gXCJraWxvbWV0ZXJzXCI7IH1cbiAgICBpZiAoZmluYWxVbml0ID09PSB2b2lkIDApIHsgZmluYWxVbml0ID0gXCJraWxvbWV0ZXJzXCI7IH1cbiAgICBpZiAoIShsZW5ndGggPj0gMCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibGVuZ3RoIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXJcIik7XG4gICAgfVxuICAgIHJldHVybiByYWRpYW5zVG9MZW5ndGgobGVuZ3RoVG9SYWRpYW5zKGxlbmd0aCwgb3JpZ2luYWxVbml0KSwgZmluYWxVbml0KTtcbn1cbmV4cG9ydHMuY29udmVydExlbmd0aCA9IGNvbnZlcnRMZW5ndGg7XG4vKipcbiAqIENvbnZlcnRzIGEgYXJlYSB0byB0aGUgcmVxdWVzdGVkIHVuaXQuXG4gKiBWYWxpZCB1bml0czoga2lsb21ldGVycywga2lsb21ldHJlcywgbWV0ZXJzLCBtZXRyZXMsIGNlbnRpbWV0cmVzLCBtaWxsaW1ldGVycywgYWNyZXMsIG1pbGVzLCB5YXJkcywgZmVldCwgaW5jaGVzLCBoZWN0YXJlc1xuICogQHBhcmFtIHtudW1iZXJ9IGFyZWEgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0ge1VuaXRzfSBbb3JpZ2luYWxVbml0PVwibWV0ZXJzXCJdIG9mIHRoZSBkaXN0YW5jZVxuICogQHBhcmFtIHtVbml0c30gW2ZpbmFsVW5pdD1cImtpbG9tZXRlcnNcIl0gcmV0dXJuZWQgdW5pdFxuICogQHJldHVybnMge251bWJlcn0gdGhlIGNvbnZlcnRlZCBhcmVhXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBcmVhKGFyZWEsIG9yaWdpbmFsVW5pdCwgZmluYWxVbml0KSB7XG4gICAgaWYgKG9yaWdpbmFsVW5pdCA9PT0gdm9pZCAwKSB7IG9yaWdpbmFsVW5pdCA9IFwibWV0ZXJzXCI7IH1cbiAgICBpZiAoZmluYWxVbml0ID09PSB2b2lkIDApIHsgZmluYWxVbml0ID0gXCJraWxvbWV0ZXJzXCI7IH1cbiAgICBpZiAoIShhcmVhID49IDApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZWEgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlclwiKTtcbiAgICB9XG4gICAgdmFyIHN0YXJ0RmFjdG9yID0gZXhwb3J0cy5hcmVhRmFjdG9yc1tvcmlnaW5hbFVuaXRdO1xuICAgIGlmICghc3RhcnRGYWN0b3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBvcmlnaW5hbCB1bml0c1wiKTtcbiAgICB9XG4gICAgdmFyIGZpbmFsRmFjdG9yID0gZXhwb3J0cy5hcmVhRmFjdG9yc1tmaW5hbFVuaXRdO1xuICAgIGlmICghZmluYWxGYWN0b3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBmaW5hbCB1bml0c1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIChhcmVhIC8gc3RhcnRGYWN0b3IpICogZmluYWxGYWN0b3I7XG59XG5leHBvcnRzLmNvbnZlcnRBcmVhID0gY29udmVydEFyZWE7XG4vKipcbiAqIGlzTnVtYmVyXG4gKlxuICogQHBhcmFtIHsqfSBudW0gTnVtYmVyIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZVxuICogQGV4YW1wbGVcbiAqIHR1cmYuaXNOdW1iZXIoMTIzKVxuICogLy89dHJ1ZVxuICogdHVyZi5pc051bWJlcignZm9vJylcbiAqIC8vPWZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKG51bSkge1xuICAgIHJldHVybiAhaXNOYU4obnVtKSAmJiBudW0gIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkobnVtKTtcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcbi8qKlxuICogaXNPYmplY3RcbiAqXG4gKiBAcGFyYW0geyp9IGlucHV0IHZhcmlhYmxlIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZS9mYWxzZVxuICogQGV4YW1wbGVcbiAqIHR1cmYuaXNPYmplY3Qoe2VsZXZhdGlvbjogMTB9KVxuICogLy89dHJ1ZVxuICogdHVyZi5pc09iamVjdCgnZm9vJylcbiAqIC8vPWZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KGlucHV0KSB7XG4gICAgcmV0dXJuICEhaW5wdXQgJiYgaW5wdXQuY29uc3RydWN0b3IgPT09IE9iamVjdDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcbi8qKlxuICogVmFsaWRhdGUgQkJveFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGJib3ggQkJveCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge3ZvaWR9XG4gKiBAdGhyb3dzIEVycm9yIGlmIEJCb3ggaXMgbm90IHZhbGlkXG4gKiBAZXhhbXBsZVxuICogdmFsaWRhdGVCQm94KFstMTgwLCAtNDAsIDExMCwgNTBdKVxuICogLy89T0tcbiAqIHZhbGlkYXRlQkJveChbLTE4MCwgLTQwXSlcbiAqIC8vPUVycm9yXG4gKiB2YWxpZGF0ZUJCb3goJ0ZvbycpXG4gKiAvLz1FcnJvclxuICogdmFsaWRhdGVCQm94KDUpXG4gKiAvLz1FcnJvclxuICogdmFsaWRhdGVCQm94KG51bGwpXG4gKiAvLz1FcnJvclxuICogdmFsaWRhdGVCQm94KHVuZGVmaW5lZClcbiAqIC8vPUVycm9yXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQkJveChiYm94KSB7XG4gICAgaWYgKCFiYm94KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImJib3ggaXMgcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShiYm94KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYm94IG11c3QgYmUgYW4gQXJyYXlcIik7XG4gICAgfVxuICAgIGlmIChiYm94Lmxlbmd0aCAhPT0gNCAmJiBiYm94Lmxlbmd0aCAhPT0gNikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYm94IG11c3QgYmUgYW4gQXJyYXkgb2YgNCBvciA2IG51bWJlcnNcIik7XG4gICAgfVxuICAgIGJib3guZm9yRWFjaChmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGlmICghaXNOdW1iZXIobnVtKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmJveCBtdXN0IG9ubHkgY29udGFpbiBudW1iZXJzXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnRzLnZhbGlkYXRlQkJveCA9IHZhbGlkYXRlQkJveDtcbi8qKlxuICogVmFsaWRhdGUgSWRcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBpZCBJZCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge3ZvaWR9XG4gKiBAdGhyb3dzIEVycm9yIGlmIElkIGlzIG5vdCB2YWxpZFxuICogQGV4YW1wbGVcbiAqIHZhbGlkYXRlSWQoWy0xODAsIC00MCwgMTEwLCA1MF0pXG4gKiAvLz1FcnJvclxuICogdmFsaWRhdGVJZChbLTE4MCwgLTQwXSlcbiAqIC8vPUVycm9yXG4gKiB2YWxpZGF0ZUlkKCdGb28nKVxuICogLy89T0tcbiAqIHZhbGlkYXRlSWQoNSlcbiAqIC8vPU9LXG4gKiB2YWxpZGF0ZUlkKG51bGwpXG4gKiAvLz1FcnJvclxuICogdmFsaWRhdGVJZCh1bmRlZmluZWQpXG4gKiAvLz1FcnJvclxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUlkKGlkKSB7XG4gICAgaWYgKCFpZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpZCBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKFtcInN0cmluZ1wiLCBcIm51bWJlclwiXS5pbmRleE9mKHR5cGVvZiBpZCkgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImlkIG11c3QgYmUgYSBudW1iZXIgb3IgYSBzdHJpbmdcIik7XG4gICAgfVxufVxuZXhwb3J0cy52YWxpZGF0ZUlkID0gdmFsaWRhdGVJZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhlbHBlcnNfMSA9IHJlcXVpcmUoXCJAdHVyZi9oZWxwZXJzXCIpO1xuLyoqXG4gKiBVbndyYXAgYSBjb29yZGluYXRlIGZyb20gYSBQb2ludCBGZWF0dXJlLCBHZW9tZXRyeSBvciBhIHNpbmdsZSBjb29yZGluYXRlLlxuICpcbiAqIEBuYW1lIGdldENvb3JkXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj58R2VvbWV0cnk8UG9pbnQ+fEZlYXR1cmU8UG9pbnQ+fSBjb29yZCBHZW9KU09OIFBvaW50IG9yIGFuIEFycmF5IG9mIG51bWJlcnNcbiAqIEByZXR1cm5zIHtBcnJheTxudW1iZXI+fSBjb29yZGluYXRlc1xuICogQGV4YW1wbGVcbiAqIHZhciBwdCA9IHR1cmYucG9pbnQoWzEwLCAxMF0pO1xuICpcbiAqIHZhciBjb29yZCA9IHR1cmYuZ2V0Q29vcmQocHQpO1xuICogLy89IFsxMCwgMTBdXG4gKi9cbmZ1bmN0aW9uIGdldENvb3JkKGNvb3JkKSB7XG4gICAgaWYgKCFjb29yZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb29yZCBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvb3JkKSkge1xuICAgICAgICBpZiAoY29vcmQudHlwZSA9PT0gXCJGZWF0dXJlXCIgJiZcbiAgICAgICAgICAgIGNvb3JkLmdlb21ldHJ5ICE9PSBudWxsICYmXG4gICAgICAgICAgICBjb29yZC5nZW9tZXRyeS50eXBlID09PSBcIlBvaW50XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZC5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29vcmQudHlwZSA9PT0gXCJQb2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gY29vcmQuY29vcmRpbmF0ZXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29vcmQpICYmXG4gICAgICAgIGNvb3JkLmxlbmd0aCA+PSAyICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNvb3JkWzBdKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShjb29yZFsxXSkpIHtcbiAgICAgICAgcmV0dXJuIGNvb3JkO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb29yZCBtdXN0IGJlIEdlb0pTT04gUG9pbnQgb3IgYW4gQXJyYXkgb2YgbnVtYmVyc1wiKTtcbn1cbmV4cG9ydHMuZ2V0Q29vcmQgPSBnZXRDb29yZDtcbi8qKlxuICogVW53cmFwIGNvb3JkaW5hdGVzIGZyb20gYSBGZWF0dXJlLCBHZW9tZXRyeSBPYmplY3Qgb3IgYW4gQXJyYXlcbiAqXG4gKiBAbmFtZSBnZXRDb29yZHNcbiAqIEBwYXJhbSB7QXJyYXk8YW55PnxHZW9tZXRyeXxGZWF0dXJlfSBjb29yZHMgRmVhdHVyZSwgR2VvbWV0cnkgT2JqZWN0IG9yIGFuIEFycmF5XG4gKiBAcmV0dXJucyB7QXJyYXk8YW55Pn0gY29vcmRpbmF0ZXNcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9seSA9IHR1cmYucG9seWdvbihbW1sxMTkuMzIsIC04LjddLCBbMTE5LjU1LCAtOC42OV0sIFsxMTkuNTEsIC04LjU0XSwgWzExOS4zMiwgLTguN11dXSk7XG4gKlxuICogdmFyIGNvb3JkcyA9IHR1cmYuZ2V0Q29vcmRzKHBvbHkpO1xuICogLy89IFtbWzExOS4zMiwgLTguN10sIFsxMTkuNTUsIC04LjY5XSwgWzExOS41MSwgLTguNTRdLCBbMTE5LjMyLCAtOC43XV1dXG4gKi9cbmZ1bmN0aW9uIGdldENvb3Jkcyhjb29yZHMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShjb29yZHMpKSB7XG4gICAgICAgIHJldHVybiBjb29yZHM7XG4gICAgfVxuICAgIC8vIEZlYXR1cmVcbiAgICBpZiAoY29vcmRzLnR5cGUgPT09IFwiRmVhdHVyZVwiKSB7XG4gICAgICAgIGlmIChjb29yZHMuZ2VvbWV0cnkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZHMuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIEdlb21ldHJ5XG4gICAgICAgIGlmIChjb29yZHMuY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZHMuY29vcmRpbmF0ZXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY29vcmRzIG11c3QgYmUgR2VvSlNPTiBGZWF0dXJlLCBHZW9tZXRyeSBPYmplY3Qgb3IgYW4gQXJyYXlcIik7XG59XG5leHBvcnRzLmdldENvb3JkcyA9IGdldENvb3Jkcztcbi8qKlxuICogQ2hlY2tzIGlmIGNvb3JkaW5hdGVzIGNvbnRhaW5zIGEgbnVtYmVyXG4gKlxuICogQG5hbWUgY29udGFpbnNOdW1iZXJcbiAqIEBwYXJhbSB7QXJyYXk8YW55Pn0gY29vcmRpbmF0ZXMgR2VvSlNPTiBDb29yZGluYXRlc1xuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgQXJyYXkgY29udGFpbnMgYSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gY29udGFpbnNOdW1iZXIoY29vcmRpbmF0ZXMpIHtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID4gMSAmJlxuICAgICAgICBoZWxwZXJzXzEuaXNOdW1iZXIoY29vcmRpbmF0ZXNbMF0pICYmXG4gICAgICAgIGhlbHBlcnNfMS5pc051bWJlcihjb29yZGluYXRlc1sxXSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvb3JkaW5hdGVzWzBdKSAmJiBjb29yZGluYXRlc1swXS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5zTnVtYmVyKGNvb3JkaW5hdGVzWzBdKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY29vcmRpbmF0ZXMgbXVzdCBvbmx5IGNvbnRhaW4gbnVtYmVyc1wiKTtcbn1cbmV4cG9ydHMuY29udGFpbnNOdW1iZXIgPSBjb250YWluc051bWJlcjtcbi8qKlxuICogRW5mb3JjZSBleHBlY3RhdGlvbnMgYWJvdXQgdHlwZXMgb2YgR2VvSlNPTiBvYmplY3RzIGZvciBUdXJmLlxuICpcbiAqIEBuYW1lIGdlb2pzb25UeXBlXG4gKiBAcGFyYW0ge0dlb0pTT059IHZhbHVlIGFueSBHZW9KU09OIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGdlb2pzb25UeXBlKHZhbHVlLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCF0eXBlIHx8ICFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInR5cGUgYW5kIG5hbWUgcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGlmICghdmFsdWUgfHwgdmFsdWUudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGlucHV0IHRvIFwiICtcbiAgICAgICAgICAgIG5hbWUgK1xuICAgICAgICAgICAgXCI6IG11c3QgYmUgYSBcIiArXG4gICAgICAgICAgICB0eXBlICtcbiAgICAgICAgICAgIFwiLCBnaXZlbiBcIiArXG4gICAgICAgICAgICB2YWx1ZS50eXBlKTtcbiAgICB9XG59XG5leHBvcnRzLmdlb2pzb25UeXBlID0gZ2VvanNvblR5cGU7XG4vKipcbiAqIEVuZm9yY2UgZXhwZWN0YXRpb25zIGFib3V0IHR5cGVzIG9mIHtAbGluayBGZWF0dXJlfSBpbnB1dHMgZm9yIFR1cmYuXG4gKiBJbnRlcm5hbGx5IHRoaXMgdXNlcyB7QGxpbmsgZ2VvanNvblR5cGV9IHRvIGp1ZGdlIGdlb21ldHJ5IHR5cGVzLlxuICpcbiAqIEBuYW1lIGZlYXR1cmVPZlxuICogQHBhcmFtIHtGZWF0dXJlfSBmZWF0dXJlIGEgZmVhdHVyZSB3aXRoIGFuIGV4cGVjdGVkIGdlb21ldHJ5IHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGV4cGVjdGVkIEdlb0pTT04gdHlwZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiBjYWxsaW5nIGZ1bmN0aW9uXG4gKiBAdGhyb3dzIHtFcnJvcn0gZXJyb3IgaWYgdmFsdWUgaXMgbm90IHRoZSBleHBlY3RlZCB0eXBlLlxuICovXG5mdW5jdGlvbiBmZWF0dXJlT2YoZmVhdHVyZSwgdHlwZSwgbmFtZSkge1xuICAgIGlmICghZmVhdHVyZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBmZWF0dXJlIHBhc3NlZFwiKTtcbiAgICB9XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIi5mZWF0dXJlT2YoKSByZXF1aXJlcyBhIG5hbWVcIik7XG4gICAgfVxuICAgIGlmICghZmVhdHVyZSB8fCBmZWF0dXJlLnR5cGUgIT09IFwiRmVhdHVyZVwiIHx8ICFmZWF0dXJlLmdlb21ldHJ5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgdG8gXCIgKyBuYW1lICsgXCIsIEZlYXR1cmUgd2l0aCBnZW9tZXRyeSByZXF1aXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKCFmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZ2VvbWV0cnkudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGlucHV0IHRvIFwiICtcbiAgICAgICAgICAgIG5hbWUgK1xuICAgICAgICAgICAgXCI6IG11c3QgYmUgYSBcIiArXG4gICAgICAgICAgICB0eXBlICtcbiAgICAgICAgICAgIFwiLCBnaXZlbiBcIiArXG4gICAgICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUpO1xuICAgIH1cbn1cbmV4cG9ydHMuZmVhdHVyZU9mID0gZmVhdHVyZU9mO1xuLyoqXG4gKiBFbmZvcmNlIGV4cGVjdGF0aW9ucyBhYm91dCB0eXBlcyBvZiB7QGxpbmsgRmVhdHVyZUNvbGxlY3Rpb259IGlucHV0cyBmb3IgVHVyZi5cbiAqIEludGVybmFsbHkgdGhpcyB1c2VzIHtAbGluayBnZW9qc29uVHlwZX0gdG8ganVkZ2UgZ2VvbWV0cnkgdHlwZXMuXG4gKlxuICogQG5hbWUgY29sbGVjdGlvbk9mXG4gKiBAcGFyYW0ge0ZlYXR1cmVDb2xsZWN0aW9ufSBmZWF0dXJlQ29sbGVjdGlvbiBhIEZlYXR1cmVDb2xsZWN0aW9uIGZvciB3aGljaCBmZWF0dXJlcyB3aWxsIGJlIGp1ZGdlZFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3Rpb25PZihmZWF0dXJlQ29sbGVjdGlvbiwgdHlwZSwgbmFtZSkge1xuICAgIGlmICghZmVhdHVyZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmVhdHVyZUNvbGxlY3Rpb24gcGFzc2VkXCIpO1xuICAgIH1cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLmNvbGxlY3Rpb25PZigpIHJlcXVpcmVzIGEgbmFtZVwiKTtcbiAgICB9XG4gICAgaWYgKCFmZWF0dXJlQ29sbGVjdGlvbiB8fCBmZWF0dXJlQ29sbGVjdGlvbi50eXBlICE9PSBcIkZlYXR1cmVDb2xsZWN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnB1dCB0byBcIiArIG5hbWUgKyBcIiwgRmVhdHVyZUNvbGxlY3Rpb24gcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBmZWF0dXJlQ29sbGVjdGlvbi5mZWF0dXJlczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIGZlYXR1cmUgPSBfYVtfaV07XG4gICAgICAgIGlmICghZmVhdHVyZSB8fCBmZWF0dXJlLnR5cGUgIT09IFwiRmVhdHVyZVwiIHx8ICFmZWF0dXJlLmdlb21ldHJ5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGlucHV0IHRvIFwiICsgbmFtZSArIFwiLCBGZWF0dXJlIHdpdGggZ2VvbWV0cnkgcmVxdWlyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZ2VvbWV0cnkudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnB1dCB0byBcIiArXG4gICAgICAgICAgICAgICAgbmFtZSArXG4gICAgICAgICAgICAgICAgXCI6IG11c3QgYmUgYSBcIiArXG4gICAgICAgICAgICAgICAgdHlwZSArXG4gICAgICAgICAgICAgICAgXCIsIGdpdmVuIFwiICtcbiAgICAgICAgICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnR5cGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jb2xsZWN0aW9uT2YgPSBjb2xsZWN0aW9uT2Y7XG4vKipcbiAqIEdldCBHZW9tZXRyeSBmcm9tIEZlYXR1cmUgb3IgR2VvbWV0cnkgT2JqZWN0XG4gKlxuICogQHBhcmFtIHtGZWF0dXJlfEdlb21ldHJ5fSBnZW9qc29uIEdlb0pTT04gRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqIEByZXR1cm5zIHtHZW9tZXRyeXxudWxsfSBHZW9KU09OIEdlb21ldHJ5IE9iamVjdFxuICogQHRocm93cyB7RXJyb3J9IGlmIGdlb2pzb24gaXMgbm90IGEgRmVhdHVyZSBvciBHZW9tZXRyeSBPYmplY3RcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAqICAgXCJwcm9wZXJ0aWVzXCI6IHt9LFxuICogICBcImdlb21ldHJ5XCI6IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdXG4gKiAgIH1cbiAqIH1cbiAqIHZhciBnZW9tID0gdHVyZi5nZXRHZW9tKHBvaW50KVxuICogLy89e1widHlwZVwiOiBcIlBvaW50XCIsIFwiY29vcmRpbmF0ZXNcIjogWzExMCwgNDBdfVxuICovXG5mdW5jdGlvbiBnZXRHZW9tKGdlb2pzb24pIHtcbiAgICBpZiAoZ2VvanNvbi50eXBlID09PSBcIkZlYXR1cmVcIikge1xuICAgICAgICByZXR1cm4gZ2VvanNvbi5nZW9tZXRyeTtcbiAgICB9XG4gICAgcmV0dXJuIGdlb2pzb247XG59XG5leHBvcnRzLmdldEdlb20gPSBnZXRHZW9tO1xuLyoqXG4gKiBHZXQgR2VvSlNPTiBvYmplY3QncyB0eXBlLCBHZW9tZXRyeSB0eXBlIGlzIHByaW9yaXRpemUuXG4gKlxuICogQHBhcmFtIHtHZW9KU09OfSBnZW9qc29uIEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9XCJnZW9qc29uXCJdIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIGRpc3BsYXkgaW4gZXJyb3IgbWVzc2FnZSAodW51c2VkKVxuICogQHJldHVybnMge3N0cmluZ30gR2VvSlNPTiB0eXBlXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0ge1xuICogICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gKiAgIFwicHJvcGVydGllc1wiOiB7fSxcbiAqICAgXCJnZW9tZXRyeVwiOiB7XG4gKiAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgICBcImNvb3JkaW5hdGVzXCI6IFsxMTAsIDQwXVxuICogICB9XG4gKiB9XG4gKiB2YXIgZ2VvbSA9IHR1cmYuZ2V0VHlwZShwb2ludClcbiAqIC8vPVwiUG9pbnRcIlxuICovXG5mdW5jdGlvbiBnZXRUeXBlKGdlb2pzb24sIF9uYW1lKSB7XG4gICAgaWYgKGdlb2pzb24udHlwZSA9PT0gXCJGZWF0dXJlQ29sbGVjdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBcIkZlYXR1cmVDb2xsZWN0aW9uXCI7XG4gICAgfVxuICAgIGlmIChnZW9qc29uLnR5cGUgPT09IFwiR2VvbWV0cnlDb2xsZWN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiR2VvbWV0cnlDb2xsZWN0aW9uXCI7XG4gICAgfVxuICAgIGlmIChnZW9qc29uLnR5cGUgPT09IFwiRmVhdHVyZVwiICYmIGdlb2pzb24uZ2VvbWV0cnkgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGdlb2pzb24uZ2VvbWV0cnkudHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGdlb2pzb24udHlwZTtcbn1cbmV4cG9ydHMuZ2V0VHlwZSA9IGdldFR5cGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlO1xuXG52YXIga2V5cywgdmFsdWVzLCBsZW5ndGhzLCBkaW0sIGU7XG5cbnZhciBnZW9tZXRyeVR5cGVzID0gW1xuICAgICdQb2ludCcsICdNdWx0aVBvaW50JywgJ0xpbmVTdHJpbmcnLCAnTXVsdGlMaW5lU3RyaW5nJyxcbiAgICAnUG9seWdvbicsICdNdWx0aVBvbHlnb24nLCAnR2VvbWV0cnlDb2xsZWN0aW9uJ107XG5cbmZ1bmN0aW9uIGRlY29kZShwYmYpIHtcbiAgICBkaW0gPSAyO1xuICAgIGUgPSBNYXRoLnBvdygxMCwgNik7XG4gICAgbGVuZ3RocyA9IG51bGw7XG5cbiAgICBrZXlzID0gW107XG4gICAgdmFsdWVzID0gW107XG4gICAgdmFyIG9iaiA9IHBiZi5yZWFkRmllbGRzKHJlYWREYXRhRmllbGQsIHt9KTtcbiAgICBrZXlzID0gbnVsbDtcblxuICAgIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHJlYWREYXRhRmllbGQodGFnLCBvYmosIHBiZikge1xuICAgIGlmICh0YWcgPT09IDEpIGtleXMucHVzaChwYmYucmVhZFN0cmluZygpKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDIpIGRpbSA9IHBiZi5yZWFkVmFyaW50KCk7XG4gICAgZWxzZSBpZiAodGFnID09PSAzKSBlID0gTWF0aC5wb3coMTAsIHBiZi5yZWFkVmFyaW50KCkpO1xuXG4gICAgZWxzZSBpZiAodGFnID09PSA0KSByZWFkRmVhdHVyZUNvbGxlY3Rpb24ocGJmLCBvYmopO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gNSkgcmVhZEZlYXR1cmUocGJmLCBvYmopO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gNikgcmVhZEdlb21ldHJ5KHBiZiwgb2JqKTtcbn1cblxuZnVuY3Rpb24gcmVhZEZlYXR1cmVDb2xsZWN0aW9uKHBiZiwgb2JqKSB7XG4gICAgb2JqLnR5cGUgPSAnRmVhdHVyZUNvbGxlY3Rpb24nO1xuICAgIG9iai5mZWF0dXJlcyA9IFtdO1xuICAgIHJldHVybiBwYmYucmVhZE1lc3NhZ2UocmVhZEZlYXR1cmVDb2xsZWN0aW9uRmllbGQsIG9iaik7XG59XG5cbmZ1bmN0aW9uIHJlYWRGZWF0dXJlKHBiZiwgZmVhdHVyZSkge1xuICAgIGZlYXR1cmUudHlwZSA9ICdGZWF0dXJlJztcbiAgICB2YXIgZiA9IHBiZi5yZWFkTWVzc2FnZShyZWFkRmVhdHVyZUZpZWxkLCBmZWF0dXJlKTtcbiAgICBpZiAoISgnZ2VvbWV0cnknIGluIGYpKSBmLmdlb21ldHJ5ID0gbnVsbDtcbiAgICByZXR1cm4gZjtcbn1cblxuZnVuY3Rpb24gcmVhZEdlb21ldHJ5KHBiZiwgZ2VvbSkge1xuICAgIGdlb20udHlwZSA9ICdQb2ludCc7XG4gICAgcmV0dXJuIHBiZi5yZWFkTWVzc2FnZShyZWFkR2VvbWV0cnlGaWVsZCwgZ2VvbSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRGZWF0dXJlQ29sbGVjdGlvbkZpZWxkKHRhZywgb2JqLCBwYmYpIHtcbiAgICBpZiAodGFnID09PSAxKSBvYmouZmVhdHVyZXMucHVzaChyZWFkRmVhdHVyZShwYmYsIHt9KSk7XG5cbiAgICBlbHNlIGlmICh0YWcgPT09IDEzKSB2YWx1ZXMucHVzaChyZWFkVmFsdWUocGJmKSk7XG4gICAgZWxzZSBpZiAodGFnID09PSAxNSkgcmVhZFByb3BzKHBiZiwgb2JqKTtcbn1cblxuZnVuY3Rpb24gcmVhZEZlYXR1cmVGaWVsZCh0YWcsIGZlYXR1cmUsIHBiZikge1xuICAgIGlmICh0YWcgPT09IDEpIGZlYXR1cmUuZ2VvbWV0cnkgPSByZWFkR2VvbWV0cnkocGJmLCB7fSk7XG5cbiAgICBlbHNlIGlmICh0YWcgPT09IDExKSBmZWF0dXJlLmlkID0gcGJmLnJlYWRTdHJpbmcoKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDEyKSBmZWF0dXJlLmlkID0gcGJmLnJlYWRTVmFyaW50KCk7XG5cbiAgICBlbHNlIGlmICh0YWcgPT09IDEzKSB2YWx1ZXMucHVzaChyZWFkVmFsdWUocGJmKSk7XG4gICAgZWxzZSBpZiAodGFnID09PSAxNCkgZmVhdHVyZS5wcm9wZXJ0aWVzID0gcmVhZFByb3BzKHBiZiwge30pO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTUpIHJlYWRQcm9wcyhwYmYsIGZlYXR1cmUpO1xufVxuXG5mdW5jdGlvbiByZWFkR2VvbWV0cnlGaWVsZCh0YWcsIGdlb20sIHBiZikge1xuICAgIGlmICh0YWcgPT09IDEpIGdlb20udHlwZSA9IGdlb21ldHJ5VHlwZXNbcGJmLnJlYWRWYXJpbnQoKV07XG5cbiAgICBlbHNlIGlmICh0YWcgPT09IDIpIGxlbmd0aHMgPSBwYmYucmVhZFBhY2tlZFZhcmludCgpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMykgcmVhZENvb3JkcyhnZW9tLCBwYmYsIGdlb20udHlwZSk7XG4gICAgZWxzZSBpZiAodGFnID09PSA0KSB7XG4gICAgICAgIGdlb20uZ2VvbWV0cmllcyA9IGdlb20uZ2VvbWV0cmllcyB8fCBbXTtcbiAgICAgICAgZ2VvbS5nZW9tZXRyaWVzLnB1c2gocmVhZEdlb21ldHJ5KHBiZiwge30pKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGFnID09PSAxMykgdmFsdWVzLnB1c2gocmVhZFZhbHVlKHBiZikpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTUpIHJlYWRQcm9wcyhwYmYsIGdlb20pO1xufVxuXG5mdW5jdGlvbiByZWFkQ29vcmRzKGdlb20sIHBiZiwgdHlwZSkge1xuICAgIGlmICh0eXBlID09PSAnUG9pbnQnKSBnZW9tLmNvb3JkaW5hdGVzID0gcmVhZFBvaW50KHBiZik7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpUG9pbnQnKSBnZW9tLmNvb3JkaW5hdGVzID0gcmVhZExpbmUocGJmLCB0cnVlKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnTGluZVN0cmluZycpIGdlb20uY29vcmRpbmF0ZXMgPSByZWFkTGluZShwYmYpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aUxpbmVTdHJpbmcnKSBnZW9tLmNvb3JkaW5hdGVzID0gcmVhZE11bHRpTGluZShwYmYpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdQb2x5Z29uJykgZ2VvbS5jb29yZGluYXRlcyA9IHJlYWRNdWx0aUxpbmUocGJmLCB0cnVlKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlQb2x5Z29uJykgZ2VvbS5jb29yZGluYXRlcyA9IHJlYWRNdWx0aVBvbHlnb24ocGJmKTtcbn1cblxuZnVuY3Rpb24gcmVhZFZhbHVlKHBiZikge1xuICAgIHZhciBlbmQgPSBwYmYucmVhZFZhcmludCgpICsgcGJmLnBvcyxcbiAgICAgICAgdmFsdWUgPSBudWxsO1xuXG4gICAgd2hpbGUgKHBiZi5wb3MgPCBlbmQpIHtcbiAgICAgICAgdmFyIHZhbCA9IHBiZi5yZWFkVmFyaW50KCksXG4gICAgICAgICAgICB0YWcgPSB2YWwgPj4gMztcblxuICAgICAgICBpZiAodGFnID09PSAxKSB2YWx1ZSA9IHBiZi5yZWFkU3RyaW5nKCk7XG4gICAgICAgIGVsc2UgaWYgKHRhZyA9PT0gMikgdmFsdWUgPSBwYmYucmVhZERvdWJsZSgpO1xuICAgICAgICBlbHNlIGlmICh0YWcgPT09IDMpIHZhbHVlID0gcGJmLnJlYWRWYXJpbnQoKTtcbiAgICAgICAgZWxzZSBpZiAodGFnID09PSA0KSB2YWx1ZSA9IC1wYmYucmVhZFZhcmludCgpO1xuICAgICAgICBlbHNlIGlmICh0YWcgPT09IDUpIHZhbHVlID0gcGJmLnJlYWRCb29sZWFuKCk7XG4gICAgICAgIGVsc2UgaWYgKHRhZyA9PT0gNikgdmFsdWUgPSBKU09OLnBhcnNlKHBiZi5yZWFkU3RyaW5nKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIHJlYWRQcm9wcyhwYmYsIHByb3BzKSB7XG4gICAgdmFyIGVuZCA9IHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zO1xuICAgIHdoaWxlIChwYmYucG9zIDwgZW5kKSBwcm9wc1trZXlzW3BiZi5yZWFkVmFyaW50KCldXSA9IHZhbHVlc1twYmYucmVhZFZhcmludCgpXTtcbiAgICB2YWx1ZXMgPSBbXTtcbiAgICByZXR1cm4gcHJvcHM7XG59XG5cbmZ1bmN0aW9uIHJlYWRQb2ludChwYmYpIHtcbiAgICB2YXIgZW5kID0gcGJmLnJlYWRWYXJpbnQoKSArIHBiZi5wb3MsXG4gICAgICAgIGNvb3JkcyA9IFtdO1xuICAgIHdoaWxlIChwYmYucG9zIDwgZW5kKSBjb29yZHMucHVzaChwYmYucmVhZFNWYXJpbnQoKSAvIGUpO1xuICAgIHJldHVybiBjb29yZHM7XG59XG5cbmZ1bmN0aW9uIHJlYWRMaW5lUGFydChwYmYsIGVuZCwgbGVuLCBjbG9zZWQpIHtcbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIGNvb3JkcyA9IFtdLFxuICAgICAgICBwLCBkO1xuXG4gICAgdmFyIHByZXZQID0gW107XG4gICAgZm9yIChkID0gMDsgZCA8IGRpbTsgZCsrKSBwcmV2UFtkXSA9IDA7XG5cbiAgICB3aGlsZSAobGVuID8gaSA8IGxlbiA6IHBiZi5wb3MgPCBlbmQpIHtcbiAgICAgICAgcCA9IFtdO1xuICAgICAgICBmb3IgKGQgPSAwOyBkIDwgZGltOyBkKyspIHtcbiAgICAgICAgICAgIHByZXZQW2RdICs9IHBiZi5yZWFkU1ZhcmludCgpO1xuICAgICAgICAgICAgcFtkXSA9IHByZXZQW2RdIC8gZTtcbiAgICAgICAgfVxuICAgICAgICBjb29yZHMucHVzaChwKTtcbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICBpZiAoY2xvc2VkKSBjb29yZHMucHVzaChjb29yZHNbMF0pO1xuXG4gICAgcmV0dXJuIGNvb3Jkcztcbn1cblxuZnVuY3Rpb24gcmVhZExpbmUocGJmKSB7XG4gICAgcmV0dXJuIHJlYWRMaW5lUGFydChwYmYsIHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zKTtcbn1cblxuZnVuY3Rpb24gcmVhZE11bHRpTGluZShwYmYsIGNsb3NlZCkge1xuICAgIHZhciBlbmQgPSBwYmYucmVhZFZhcmludCgpICsgcGJmLnBvcztcbiAgICBpZiAoIWxlbmd0aHMpIHJldHVybiBbcmVhZExpbmVQYXJ0KHBiZiwgZW5kLCBudWxsLCBjbG9zZWQpXTtcblxuICAgIHZhciBjb29yZHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aHMubGVuZ3RoOyBpKyspIGNvb3Jkcy5wdXNoKHJlYWRMaW5lUGFydChwYmYsIGVuZCwgbGVuZ3Roc1tpXSwgY2xvc2VkKSk7XG4gICAgbGVuZ3RocyA9IG51bGw7XG4gICAgcmV0dXJuIGNvb3Jkcztcbn1cblxuZnVuY3Rpb24gcmVhZE11bHRpUG9seWdvbihwYmYpIHtcbiAgICB2YXIgZW5kID0gcGJmLnJlYWRWYXJpbnQoKSArIHBiZi5wb3M7XG4gICAgaWYgKCFsZW5ndGhzKSByZXR1cm4gW1tyZWFkTGluZVBhcnQocGJmLCBlbmQsIG51bGwsIHRydWUpXV07XG5cbiAgICB2YXIgY29vcmRzID0gW107XG4gICAgdmFyIGogPSAxO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3Roc1swXTsgaSsrKSB7XG4gICAgICAgIHZhciByaW5ncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGxlbmd0aHNbal07IGsrKykgcmluZ3MucHVzaChyZWFkTGluZVBhcnQocGJmLCBlbmQsIGxlbmd0aHNbaiArIDEgKyBrXSwgdHJ1ZSkpO1xuICAgICAgICBqICs9IGxlbmd0aHNbal0gKyAxO1xuICAgICAgICBjb29yZHMucHVzaChyaW5ncyk7XG4gICAgfVxuICAgIGxlbmd0aHMgPSBudWxsO1xuICAgIHJldHVybiBjb29yZHM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZW5jb2RlO1xuXG52YXIga2V5cywga2V5c051bSwga2V5c0FyciwgZGltLCBlLFxuICAgIG1heFByZWNpc2lvbiA9IDFlNjtcblxudmFyIGdlb21ldHJ5VHlwZXMgPSB7XG4gICAgJ1BvaW50JzogMCxcbiAgICAnTXVsdGlQb2ludCc6IDEsXG4gICAgJ0xpbmVTdHJpbmcnOiAyLFxuICAgICdNdWx0aUxpbmVTdHJpbmcnOiAzLFxuICAgICdQb2x5Z29uJzogNCxcbiAgICAnTXVsdGlQb2x5Z29uJzogNSxcbiAgICAnR2VvbWV0cnlDb2xsZWN0aW9uJzogNlxufTtcblxuZnVuY3Rpb24gZW5jb2RlKG9iaiwgcGJmKSB7XG4gICAga2V5cyA9IHt9O1xuICAgIGtleXNBcnIgPSBbXTtcbiAgICBrZXlzTnVtID0gMDtcbiAgICBkaW0gPSAwO1xuICAgIGUgPSAxO1xuXG4gICAgYW5hbHl6ZShvYmopO1xuXG4gICAgZSA9IE1hdGgubWluKGUsIG1heFByZWNpc2lvbik7XG4gICAgdmFyIHByZWNpc2lvbiA9IE1hdGguY2VpbChNYXRoLmxvZyhlKSAvIE1hdGguTE4xMCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXNBcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZVN0cmluZ0ZpZWxkKDEsIGtleXNBcnJbaV0pO1xuICAgIGlmIChkaW0gIT09IDIpIHBiZi53cml0ZVZhcmludEZpZWxkKDIsIGRpbSk7XG4gICAgaWYgKHByZWNpc2lvbiAhPT0gNikgcGJmLndyaXRlVmFyaW50RmllbGQoMywgcHJlY2lzaW9uKTtcblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJykgcGJmLndyaXRlTWVzc2FnZSg0LCB3cml0ZUZlYXR1cmVDb2xsZWN0aW9uLCBvYmopO1xuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnRmVhdHVyZScpIHBiZi53cml0ZU1lc3NhZ2UoNSwgd3JpdGVGZWF0dXJlLCBvYmopO1xuICAgIGVsc2UgcGJmLndyaXRlTWVzc2FnZSg2LCB3cml0ZUdlb21ldHJ5LCBvYmopO1xuXG4gICAga2V5cyA9IG51bGw7XG5cbiAgICByZXR1cm4gcGJmLmZpbmlzaCgpO1xufVxuXG5mdW5jdGlvbiBhbmFseXplKG9iaikge1xuICAgIHZhciBpLCBrZXk7XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iai5mZWF0dXJlcy5sZW5ndGg7IGkrKykgYW5hbHl6ZShvYmouZmVhdHVyZXNbaV0pO1xuXG4gICAgfSBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICAgIGlmIChvYmouZ2VvbWV0cnkgIT09IG51bGwpIGFuYWx5emUob2JqLmdlb21ldHJ5KTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqLnByb3BlcnRpZXMpIHNhdmVLZXkoa2V5KTtcblxuICAgIH0gZWxzZSBpZiAob2JqLnR5cGUgPT09ICdQb2ludCcpIGFuYWx5emVQb2ludChvYmouY29vcmRpbmF0ZXMpO1xuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnTXVsdGlQb2ludCcpIGFuYWx5emVQb2ludHMob2JqLmNvb3JkaW5hdGVzKTtcbiAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbicpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iai5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSBhbmFseXplKG9iai5nZW9tZXRyaWVzW2ldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAob2JqLnR5cGUgPT09ICdMaW5lU3RyaW5nJykgYW5hbHl6ZVBvaW50cyhvYmouY29vcmRpbmF0ZXMpO1xuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnUG9seWdvbicgfHwgb2JqLnR5cGUgPT09ICdNdWx0aUxpbmVTdHJpbmcnKSBhbmFseXplTXVsdGlMaW5lKG9iai5jb29yZGluYXRlcyk7XG4gICAgZWxzZSBpZiAob2JqLnR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmouY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspIGFuYWx5emVNdWx0aUxpbmUob2JqLmNvb3JkaW5hdGVzW2ldKTtcbiAgICB9XG5cbiAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKCFpc1NwZWNpYWxLZXkoa2V5LCBvYmoudHlwZSkpIHNhdmVLZXkoa2V5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFuYWx5emVNdWx0aUxpbmUoY29vcmRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIGFuYWx5emVQb2ludHMoY29vcmRzW2ldKTtcbn1cblxuZnVuY3Rpb24gYW5hbHl6ZVBvaW50cyhjb29yZHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykgYW5hbHl6ZVBvaW50KGNvb3Jkc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGFuYWx5emVQb2ludChwb2ludCkge1xuICAgIGRpbSA9IE1hdGgubWF4KGRpbSwgcG9pbnQubGVuZ3RoKTtcblxuICAgIC8vIGZpbmQgbWF4IHByZWNpc2lvblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgd2hpbGUgKE1hdGgucm91bmQocG9pbnRbaV0gKiBlKSAvIGUgIT09IHBvaW50W2ldICYmIGUgPCBtYXhQcmVjaXNpb24pIGUgKj0gMTA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzYXZlS2V5KGtleSkge1xuICAgIGlmIChrZXlzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlzQXJyLnB1c2goa2V5KTtcbiAgICAgICAga2V5c1trZXldID0ga2V5c051bSsrO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVGZWF0dXJlQ29sbGVjdGlvbihvYmosIHBiZikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBiZi53cml0ZU1lc3NhZ2UoMSwgd3JpdGVGZWF0dXJlLCBvYmouZmVhdHVyZXNbaV0pO1xuICAgIH1cbiAgICB3cml0ZVByb3BzKG9iaiwgcGJmLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVGZWF0dXJlKGZlYXR1cmUsIHBiZikge1xuICAgIGlmIChmZWF0dXJlLmdlb21ldHJ5ICE9PSBudWxsKSBwYmYud3JpdGVNZXNzYWdlKDEsIHdyaXRlR2VvbWV0cnksIGZlYXR1cmUuZ2VvbWV0cnkpO1xuXG4gICAgaWYgKGZlYXR1cmUuaWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodHlwZW9mIGZlYXR1cmUuaWQgPT09ICdudW1iZXInICYmIGZlYXR1cmUuaWQgJSAxID09PSAwKSBwYmYud3JpdGVTVmFyaW50RmllbGQoMTIsIGZlYXR1cmUuaWQpO1xuICAgICAgICBlbHNlIHBiZi53cml0ZVN0cmluZ0ZpZWxkKDExLCBmZWF0dXJlLmlkKTtcbiAgICB9XG5cbiAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzKSB3cml0ZVByb3BzKGZlYXR1cmUucHJvcGVydGllcywgcGJmKTtcbiAgICB3cml0ZVByb3BzKGZlYXR1cmUsIHBiZiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlR2VvbWV0cnkoZ2VvbSwgcGJmKSB7XG4gICAgcGJmLndyaXRlVmFyaW50RmllbGQoMSwgZ2VvbWV0cnlUeXBlc1tnZW9tLnR5cGVdKTtcblxuICAgIHZhciBjb29yZHMgPSBnZW9tLmNvb3JkaW5hdGVzO1xuXG4gICAgaWYgKGdlb20udHlwZSA9PT0gJ1BvaW50Jykgd3JpdGVQb2ludChjb29yZHMsIHBiZik7XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09PSAnTXVsdGlQb2ludCcpIHdyaXRlTGluZShjb29yZHMsIHBiZiwgdHJ1ZSk7XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09PSAnTGluZVN0cmluZycpIHdyaXRlTGluZShjb29yZHMsIHBiZik7XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09PSAnTXVsdGlMaW5lU3RyaW5nJykgd3JpdGVNdWx0aUxpbmUoY29vcmRzLCBwYmYpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ1BvbHlnb24nKSB3cml0ZU11bHRpTGluZShjb29yZHMsIHBiZiwgdHJ1ZSk7XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09PSAnTXVsdGlQb2x5Z29uJykgd3JpdGVNdWx0aVBvbHlnb24oY29vcmRzLCBwYmYpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbicpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnZW9tLmdlb21ldHJpZXMubGVuZ3RoOyBpKyspIHBiZi53cml0ZU1lc3NhZ2UoNCwgd3JpdGVHZW9tZXRyeSwgZ2VvbS5nZW9tZXRyaWVzW2ldKTtcbiAgICB9XG5cbiAgICB3cml0ZVByb3BzKGdlb20sIHBiZiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlUHJvcHMocHJvcHMsIHBiZiwgaXNDdXN0b20pIHtcbiAgICB2YXIgaW5kZXhlcyA9IFtdLFxuICAgICAgICB2YWx1ZUluZGV4ID0gMDtcblxuICAgIGZvciAodmFyIGtleSBpbiBwcm9wcykge1xuICAgICAgICBpZiAoaXNDdXN0b20gJiYgaXNTcGVjaWFsS2V5KGtleSwgcHJvcHMudHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHBiZi53cml0ZU1lc3NhZ2UoMTMsIHdyaXRlVmFsdWUsIHByb3BzW2tleV0pO1xuICAgICAgICBpbmRleGVzLnB1c2goa2V5c1trZXldKTtcbiAgICAgICAgaW5kZXhlcy5wdXNoKHZhbHVlSW5kZXgrKyk7XG4gICAgfVxuICAgIHBiZi53cml0ZVBhY2tlZFZhcmludChpc0N1c3RvbSA/IDE1IDogMTQsIGluZGV4ZXMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVZhbHVlKHZhbHVlLCBwYmYpIHtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHJldHVybjtcblxuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSBwYmYud3JpdGVTdHJpbmdGaWVsZCgxLCB2YWx1ZSk7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nKSBwYmYud3JpdGVCb29sZWFuRmllbGQoNSwgdmFsdWUpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSBwYmYud3JpdGVTdHJpbmdGaWVsZCg2LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmICh2YWx1ZSAlIDEgIT09IDApIHBiZi53cml0ZURvdWJsZUZpZWxkKDIsIHZhbHVlKTtcbiAgICAgICAgZWxzZSBpZiAodmFsdWUgPj0gMCkgcGJmLndyaXRlVmFyaW50RmllbGQoMywgdmFsdWUpO1xuICAgICAgICBlbHNlIHBiZi53cml0ZVZhcmludEZpZWxkKDQsIC12YWx1ZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB3cml0ZVBvaW50KHBvaW50LCBwYmYpIHtcbiAgICB2YXIgY29vcmRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaW07IGkrKykgY29vcmRzLnB1c2goTWF0aC5yb3VuZChwb2ludFtpXSAqIGUpKTtcbiAgICBwYmYud3JpdGVQYWNrZWRTVmFyaW50KDMsIGNvb3Jkcyk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlTGluZShsaW5lLCBwYmYpIHtcbiAgICB2YXIgY29vcmRzID0gW107XG4gICAgcG9wdWxhdGVMaW5lKGNvb3JkcywgbGluZSk7XG4gICAgcGJmLndyaXRlUGFja2VkU1ZhcmludCgzLCBjb29yZHMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZU11bHRpTGluZShsaW5lcywgcGJmLCBjbG9zZWQpIHtcbiAgICB2YXIgbGVuID0gbGluZXMubGVuZ3RoLFxuICAgICAgICBpO1xuICAgIGlmIChsZW4gIT09IDEpIHtcbiAgICAgICAgdmFyIGxlbmd0aHMgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSBsZW5ndGhzLnB1c2gobGluZXNbaV0ubGVuZ3RoIC0gKGNsb3NlZCA/IDEgOiAwKSk7XG4gICAgICAgIHBiZi53cml0ZVBhY2tlZFZhcmludCgyLCBsZW5ndGhzKTtcbiAgICAgICAgLy8gVE9ETyBmYXN0ZXIgd2l0aCBjdXN0b20gd3JpdGVNZXNzYWdlP1xuICAgIH1cbiAgICB2YXIgY29vcmRzID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSBwb3B1bGF0ZUxpbmUoY29vcmRzLCBsaW5lc1tpXSwgY2xvc2VkKTtcbiAgICBwYmYud3JpdGVQYWNrZWRTVmFyaW50KDMsIGNvb3Jkcyk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlTXVsdGlQb2x5Z29uKHBvbHlnb25zLCBwYmYpIHtcbiAgICB2YXIgbGVuID0gcG9seWdvbnMubGVuZ3RoLFxuICAgICAgICBpLCBqO1xuICAgIGlmIChsZW4gIT09IDEgfHwgcG9seWdvbnNbMF0ubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIHZhciBsZW5ndGhzID0gW2xlbl07XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGVuZ3Rocy5wdXNoKHBvbHlnb25zW2ldLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgcG9seWdvbnNbaV0ubGVuZ3RoOyBqKyspIGxlbmd0aHMucHVzaChwb2x5Z29uc1tpXVtqXS5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICBwYmYud3JpdGVQYWNrZWRWYXJpbnQoMiwgbGVuZ3Rocyk7XG4gICAgfVxuXG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcG9seWdvbnNbaV0ubGVuZ3RoOyBqKyspIHBvcHVsYXRlTGluZShjb29yZHMsIHBvbHlnb25zW2ldW2pdLCB0cnVlKTtcbiAgICB9XG4gICAgcGJmLndyaXRlUGFja2VkU1ZhcmludCgzLCBjb29yZHMpO1xufVxuXG5mdW5jdGlvbiBwb3B1bGF0ZUxpbmUoY29vcmRzLCBsaW5lLCBjbG9zZWQpIHtcbiAgICB2YXIgaSwgaixcbiAgICAgICAgbGVuID0gbGluZS5sZW5ndGggLSAoY2xvc2VkID8gMSA6IDApLFxuICAgICAgICBzdW0gPSBuZXcgQXJyYXkoZGltKTtcbiAgICBmb3IgKGogPSAwOyBqIDwgZGltOyBqKyspIHN1bVtqXSA9IDA7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBkaW07IGorKykge1xuICAgICAgICAgICAgdmFyIG4gPSBNYXRoLnJvdW5kKGxpbmVbaV1bal0gKiBlKSAtIHN1bVtqXTtcbiAgICAgICAgICAgIGNvb3Jkcy5wdXNoKG4pO1xuICAgICAgICAgICAgc3VtW2pdICs9IG47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzU3BlY2lhbEtleShrZXksIHR5cGUpIHtcbiAgICBpZiAoa2V5ID09PSAndHlwZScpIHJldHVybiB0cnVlO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2ZlYXR1cmVzJykgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnRmVhdHVyZScpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2lkJyB8fCBrZXkgPT09ICdwcm9wZXJ0aWVzJyB8fCBrZXkgPT09ICdnZW9tZXRyeScpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbicpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2dlb21ldHJpZXMnKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2Nvb3JkaW5hdGVzJykgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmVuY29kZSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG5leHBvcnRzLmRlY29kZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG4iLCIvKiEgaWVlZTc1NC4gQlNELTMtQ2xhdXNlIExpY2Vuc2UuIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZy9vcGVuc291cmNlPiAqL1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSAoZSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSAobSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICgodmFsdWUgKiBjKSAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBiZjtcblxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0Jyk7XG5cbmZ1bmN0aW9uIFBiZihidWYpIHtcbiAgICB0aGlzLmJ1ZiA9IEFycmF5QnVmZmVyLmlzVmlldyAmJiBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IGJ1ZiA6IG5ldyBVaW50OEFycmF5KGJ1ZiB8fCAwKTtcbiAgICB0aGlzLnBvcyA9IDA7XG4gICAgdGhpcy50eXBlID0gMDtcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuYnVmLmxlbmd0aDtcbn1cblxuUGJmLlZhcmludCAgPSAwOyAvLyB2YXJpbnQ6IGludDMyLCBpbnQ2NCwgdWludDMyLCB1aW50NjQsIHNpbnQzMiwgc2ludDY0LCBib29sLCBlbnVtXG5QYmYuRml4ZWQ2NCA9IDE7IC8vIDY0LWJpdDogZG91YmxlLCBmaXhlZDY0LCBzZml4ZWQ2NFxuUGJmLkJ5dGVzICAgPSAyOyAvLyBsZW5ndGgtZGVsaW1pdGVkOiBzdHJpbmcsIGJ5dGVzLCBlbWJlZGRlZCBtZXNzYWdlcywgcGFja2VkIHJlcGVhdGVkIGZpZWxkc1xuUGJmLkZpeGVkMzIgPSA1OyAvLyAzMi1iaXQ6IGZsb2F0LCBmaXhlZDMyLCBzZml4ZWQzMlxuXG52YXIgU0hJRlRfTEVGVF8zMiA9ICgxIDw8IDE2KSAqICgxIDw8IDE2KSxcbiAgICBTSElGVF9SSUdIVF8zMiA9IDEgLyBTSElGVF9MRUZUXzMyO1xuXG4vLyBUaHJlc2hvbGQgY2hvc2VuIGJhc2VkIG9uIGJvdGggYmVuY2htYXJraW5nIGFuZCBrbm93bGVkZ2UgYWJvdXQgYnJvd3NlciBzdHJpbmdcbi8vIGRhdGEgc3RydWN0dXJlcyAod2hpY2ggY3VycmVudGx5IHN3aXRjaCBzdHJ1Y3R1cmUgdHlwZXMgYXQgMTIgYnl0ZXMgb3IgbW9yZSlcbnZhciBURVhUX0RFQ09ERVJfTUlOX0xFTkdUSCA9IDEyO1xudmFyIHV0ZjhUZXh0RGVjb2RlciA9IHR5cGVvZiBUZXh0RGVjb2RlciA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogbmV3IFRleHREZWNvZGVyKCd1dGY4Jyk7XG5cblBiZi5wcm90b3R5cGUgPSB7XG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5idWYgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvLyA9PT0gUkVBRElORyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgcmVhZEZpZWxkczogZnVuY3Rpb24ocmVhZEZpZWxkLCByZXN1bHQsIGVuZCkge1xuICAgICAgICBlbmQgPSBlbmQgfHwgdGhpcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKHRoaXMucG9zIDwgZW5kKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gdGhpcy5yZWFkVmFyaW50KCksXG4gICAgICAgICAgICAgICAgdGFnID0gdmFsID4+IDMsXG4gICAgICAgICAgICAgICAgc3RhcnRQb3MgPSB0aGlzLnBvcztcblxuICAgICAgICAgICAgdGhpcy50eXBlID0gdmFsICYgMHg3O1xuICAgICAgICAgICAgcmVhZEZpZWxkKHRhZywgcmVzdWx0LCB0aGlzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucG9zID09PSBzdGFydFBvcykgdGhpcy5za2lwKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgcmVhZE1lc3NhZ2U6IGZ1bmN0aW9uKHJlYWRGaWVsZCwgcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRGaWVsZHMocmVhZEZpZWxkLCByZXN1bHQsIHRoaXMucmVhZFZhcmludCgpICsgdGhpcy5wb3MpO1xuICAgIH0sXG5cbiAgICByZWFkRml4ZWQzMjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSByZWFkVUludDMyKHRoaXMuYnVmLCB0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSxcblxuICAgIHJlYWRTRml4ZWQzMjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSByZWFkSW50MzIodGhpcy5idWYsIHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9LFxuXG4gICAgLy8gNjQtYml0IGludCBoYW5kbGluZyBpcyBiYXNlZCBvbiBnaXRodWIuY29tL2Rwdy9ub2RlLWJ1ZmZlci1tb3JlLWludHMgKE1JVC1saWNlbnNlZClcblxuICAgIHJlYWRGaXhlZDY0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbCA9IHJlYWRVSW50MzIodGhpcy5idWYsIHRoaXMucG9zKSArIHJlYWRVSW50MzIodGhpcy5idWYsIHRoaXMucG9zICsgNCkgKiBTSElGVF9MRUZUXzMyO1xuICAgICAgICB0aGlzLnBvcyArPSA4O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH0sXG5cbiAgICByZWFkU0ZpeGVkNjQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsID0gcmVhZFVJbnQzMih0aGlzLmJ1ZiwgdGhpcy5wb3MpICsgcmVhZEludDMyKHRoaXMuYnVmLCB0aGlzLnBvcyArIDQpICogU0hJRlRfTEVGVF8zMjtcbiAgICAgICAgdGhpcy5wb3MgKz0gODtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9LFxuXG4gICAgcmVhZEZsb2F0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbCA9IGllZWU3NTQucmVhZCh0aGlzLmJ1ZiwgdGhpcy5wb3MsIHRydWUsIDIzLCA0KTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9LFxuXG4gICAgcmVhZERvdWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSBpZWVlNzU0LnJlYWQodGhpcy5idWYsIHRoaXMucG9zLCB0cnVlLCA1MiwgOCk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSxcblxuICAgIHJlYWRWYXJpbnQ6IGZ1bmN0aW9uKGlzU2lnbmVkKSB7XG4gICAgICAgIHZhciBidWYgPSB0aGlzLmJ1ZixcbiAgICAgICAgICAgIHZhbCwgYjtcblxuICAgICAgICBiID0gYnVmW3RoaXMucG9zKytdOyB2YWwgID0gIGIgJiAweDdmOyAgICAgICAgaWYgKGIgPCAweDgwKSByZXR1cm4gdmFsO1xuICAgICAgICBiID0gYnVmW3RoaXMucG9zKytdOyB2YWwgfD0gKGIgJiAweDdmKSA8PCA3OyAgaWYgKGIgPCAweDgwKSByZXR1cm4gdmFsO1xuICAgICAgICBiID0gYnVmW3RoaXMucG9zKytdOyB2YWwgfD0gKGIgJiAweDdmKSA8PCAxNDsgaWYgKGIgPCAweDgwKSByZXR1cm4gdmFsO1xuICAgICAgICBiID0gYnVmW3RoaXMucG9zKytdOyB2YWwgfD0gKGIgJiAweDdmKSA8PCAyMTsgaWYgKGIgPCAweDgwKSByZXR1cm4gdmFsO1xuICAgICAgICBiID0gYnVmW3RoaXMucG9zXTsgICB2YWwgfD0gKGIgJiAweDBmKSA8PCAyODtcblxuICAgICAgICByZXR1cm4gcmVhZFZhcmludFJlbWFpbmRlcih2YWwsIGlzU2lnbmVkLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgcmVhZFZhcmludDY0OiBmdW5jdGlvbigpIHsgLy8gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCB2Mi4wLjFcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFZhcmludCh0cnVlKTtcbiAgICB9LFxuXG4gICAgcmVhZFNWYXJpbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbnVtID0gdGhpcy5yZWFkVmFyaW50KCk7XG4gICAgICAgIHJldHVybiBudW0gJSAyID09PSAxID8gKG51bSArIDEpIC8gLTIgOiBudW0gLyAyOyAvLyB6aWd6YWcgZW5jb2RpbmdcbiAgICB9LFxuXG4gICAgcmVhZEJvb2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQm9vbGVhbih0aGlzLnJlYWRWYXJpbnQoKSk7XG4gICAgfSxcblxuICAgIHJlYWRTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZW5kID0gdGhpcy5yZWFkVmFyaW50KCkgKyB0aGlzLnBvcztcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMucG9zO1xuICAgICAgICB0aGlzLnBvcyA9IGVuZDtcblxuICAgICAgICBpZiAoZW5kIC0gcG9zID49IFRFWFRfREVDT0RFUl9NSU5fTEVOR1RIICYmIHV0ZjhUZXh0RGVjb2Rlcikge1xuICAgICAgICAgICAgLy8gbG9uZ2VyIHN0cmluZ3MgYXJlIGZhc3Qgd2l0aCB0aGUgYnVpbHQtaW4gYnJvd3NlciBUZXh0RGVjb2RlciBBUElcbiAgICAgICAgICAgIHJldHVybiByZWFkVXRmOFRleHREZWNvZGVyKHRoaXMuYnVmLCBwb3MsIGVuZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2hvcnQgc3RyaW5ncyBhcmUgZmFzdCB3aXRoIG91ciBjdXN0b20gaW1wbGVtZW50YXRpb25cbiAgICAgICAgcmV0dXJuIHJlYWRVdGY4KHRoaXMuYnVmLCBwb3MsIGVuZCk7XG4gICAgfSxcblxuICAgIHJlYWRCeXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbmQgPSB0aGlzLnJlYWRWYXJpbnQoKSArIHRoaXMucG9zLFxuICAgICAgICAgICAgYnVmZmVyID0gdGhpcy5idWYuc3ViYXJyYXkodGhpcy5wb3MsIGVuZCk7XG4gICAgICAgIHRoaXMucG9zID0gZW5kO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH0sXG5cbiAgICAvLyB2ZXJib3NlIGZvciBwZXJmb3JtYW5jZSByZWFzb25zOyBkb2Vzbid0IGFmZmVjdCBnemlwcGVkIHNpemVcblxuICAgIHJlYWRQYWNrZWRWYXJpbnQ6IGZ1bmN0aW9uKGFyciwgaXNTaWduZWQpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gUGJmLkJ5dGVzKSByZXR1cm4gYXJyLnB1c2godGhpcy5yZWFkVmFyaW50KGlzU2lnbmVkKSk7XG4gICAgICAgIHZhciBlbmQgPSByZWFkUGFja2VkRW5kKHRoaXMpO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHdoaWxlICh0aGlzLnBvcyA8IGVuZCkgYXJyLnB1c2godGhpcy5yZWFkVmFyaW50KGlzU2lnbmVkKSk7XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfSxcbiAgICByZWFkUGFja2VkU1ZhcmludDogZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09IFBiZi5CeXRlcykgcmV0dXJuIGFyci5wdXNoKHRoaXMucmVhZFNWYXJpbnQoKSk7XG4gICAgICAgIHZhciBlbmQgPSByZWFkUGFja2VkRW5kKHRoaXMpO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHdoaWxlICh0aGlzLnBvcyA8IGVuZCkgYXJyLnB1c2godGhpcy5yZWFkU1ZhcmludCgpKTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9LFxuICAgIHJlYWRQYWNrZWRCb29sZWFuOiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gUGJmLkJ5dGVzKSByZXR1cm4gYXJyLnB1c2godGhpcy5yZWFkQm9vbGVhbigpKTtcbiAgICAgICAgdmFyIGVuZCA9IHJlYWRQYWNrZWRFbmQodGhpcyk7XG4gICAgICAgIGFyciA9IGFyciB8fCBbXTtcbiAgICAgICAgd2hpbGUgKHRoaXMucG9zIDwgZW5kKSBhcnIucHVzaCh0aGlzLnJlYWRCb29sZWFuKCkpO1xuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH0sXG4gICAgcmVhZFBhY2tlZEZsb2F0OiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gUGJmLkJ5dGVzKSByZXR1cm4gYXJyLnB1c2godGhpcy5yZWFkRmxvYXQoKSk7XG4gICAgICAgIHZhciBlbmQgPSByZWFkUGFja2VkRW5kKHRoaXMpO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHdoaWxlICh0aGlzLnBvcyA8IGVuZCkgYXJyLnB1c2godGhpcy5yZWFkRmxvYXQoKSk7XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfSxcbiAgICByZWFkUGFja2VkRG91YmxlOiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gUGJmLkJ5dGVzKSByZXR1cm4gYXJyLnB1c2godGhpcy5yZWFkRG91YmxlKCkpO1xuICAgICAgICB2YXIgZW5kID0gcmVhZFBhY2tlZEVuZCh0aGlzKTtcbiAgICAgICAgYXJyID0gYXJyIHx8IFtdO1xuICAgICAgICB3aGlsZSAodGhpcy5wb3MgPCBlbmQpIGFyci5wdXNoKHRoaXMucmVhZERvdWJsZSgpKTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9LFxuICAgIHJlYWRQYWNrZWRGaXhlZDMyOiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gUGJmLkJ5dGVzKSByZXR1cm4gYXJyLnB1c2godGhpcy5yZWFkRml4ZWQzMigpKTtcbiAgICAgICAgdmFyIGVuZCA9IHJlYWRQYWNrZWRFbmQodGhpcyk7XG4gICAgICAgIGFyciA9IGFyciB8fCBbXTtcbiAgICAgICAgd2hpbGUgKHRoaXMucG9zIDwgZW5kKSBhcnIucHVzaCh0aGlzLnJlYWRGaXhlZDMyKCkpO1xuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH0sXG4gICAgcmVhZFBhY2tlZFNGaXhlZDMyOiBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gUGJmLkJ5dGVzKSByZXR1cm4gYXJyLnB1c2godGhpcy5yZWFkU0ZpeGVkMzIoKSk7XG4gICAgICAgIHZhciBlbmQgPSByZWFkUGFja2VkRW5kKHRoaXMpO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHdoaWxlICh0aGlzLnBvcyA8IGVuZCkgYXJyLnB1c2godGhpcy5yZWFkU0ZpeGVkMzIoKSk7XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfSxcbiAgICByZWFkUGFja2VkRml4ZWQ2NDogZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09IFBiZi5CeXRlcykgcmV0dXJuIGFyci5wdXNoKHRoaXMucmVhZEZpeGVkNjQoKSk7XG4gICAgICAgIHZhciBlbmQgPSByZWFkUGFja2VkRW5kKHRoaXMpO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHdoaWxlICh0aGlzLnBvcyA8IGVuZCkgYXJyLnB1c2godGhpcy5yZWFkRml4ZWQ2NCgpKTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9LFxuICAgIHJlYWRQYWNrZWRTRml4ZWQ2NDogZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09IFBiZi5CeXRlcykgcmV0dXJuIGFyci5wdXNoKHRoaXMucmVhZFNGaXhlZDY0KCkpO1xuICAgICAgICB2YXIgZW5kID0gcmVhZFBhY2tlZEVuZCh0aGlzKTtcbiAgICAgICAgYXJyID0gYXJyIHx8IFtdO1xuICAgICAgICB3aGlsZSAodGhpcy5wb3MgPCBlbmQpIGFyci5wdXNoKHRoaXMucmVhZFNGaXhlZDY0KCkpO1xuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH0sXG5cbiAgICBza2lwOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB2YWwgJiAweDc7XG4gICAgICAgIGlmICh0eXBlID09PSBQYmYuVmFyaW50KSB3aGlsZSAodGhpcy5idWZbdGhpcy5wb3MrK10gPiAweDdmKSB7fVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSBQYmYuQnl0ZXMpIHRoaXMucG9zID0gdGhpcy5yZWFkVmFyaW50KCkgKyB0aGlzLnBvcztcbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gUGJmLkZpeGVkMzIpIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09IFBiZi5GaXhlZDY0KSB0aGlzLnBvcyArPSA4O1xuICAgICAgICBlbHNlIHRocm93IG5ldyBFcnJvcignVW5pbXBsZW1lbnRlZCB0eXBlOiAnICsgdHlwZSk7XG4gICAgfSxcblxuICAgIC8vID09PSBXUklUSU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICB3cml0ZVRhZzogZnVuY3Rpb24odGFnLCB0eXBlKSB7XG4gICAgICAgIHRoaXMud3JpdGVWYXJpbnQoKHRhZyA8PCAzKSB8IHR5cGUpO1xuICAgIH0sXG5cbiAgICByZWFsbG9jOiBmdW5jdGlvbihtaW4pIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDE2O1xuXG4gICAgICAgIHdoaWxlIChsZW5ndGggPCB0aGlzLnBvcyArIG1pbikgbGVuZ3RoICo9IDI7XG5cbiAgICAgICAgaWYgKGxlbmd0aCAhPT0gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgYnVmLnNldCh0aGlzLmJ1Zik7XG4gICAgICAgICAgICB0aGlzLmJ1ZiA9IGJ1ZjtcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5wb3M7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmLnN1YmFycmF5KDAsIHRoaXMubGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgd3JpdGVGaXhlZDMyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgdGhpcy5yZWFsbG9jKDQpO1xuICAgICAgICB3cml0ZUludDMyKHRoaXMuYnVmLCB2YWwsIHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICB9LFxuXG4gICAgd3JpdGVTRml4ZWQzMjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHRoaXMucmVhbGxvYyg0KTtcbiAgICAgICAgd3JpdGVJbnQzMih0aGlzLmJ1ZiwgdmFsLCB0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgfSxcblxuICAgIHdyaXRlRml4ZWQ2NDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHRoaXMucmVhbGxvYyg4KTtcbiAgICAgICAgd3JpdGVJbnQzMih0aGlzLmJ1ZiwgdmFsICYgLTEsIHRoaXMucG9zKTtcbiAgICAgICAgd3JpdGVJbnQzMih0aGlzLmJ1ZiwgTWF0aC5mbG9vcih2YWwgKiBTSElGVF9SSUdIVF8zMiksIHRoaXMucG9zICsgNCk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgfSxcblxuICAgIHdyaXRlU0ZpeGVkNjQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICB0aGlzLnJlYWxsb2MoOCk7XG4gICAgICAgIHdyaXRlSW50MzIodGhpcy5idWYsIHZhbCAmIC0xLCB0aGlzLnBvcyk7XG4gICAgICAgIHdyaXRlSW50MzIodGhpcy5idWYsIE1hdGguZmxvb3IodmFsICogU0hJRlRfUklHSFRfMzIpLCB0aGlzLnBvcyArIDQpO1xuICAgICAgICB0aGlzLnBvcyArPSA4O1xuICAgIH0sXG5cbiAgICB3cml0ZVZhcmludDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHZhbCA9ICt2YWwgfHwgMDtcblxuICAgICAgICBpZiAodmFsID4gMHhmZmZmZmZmIHx8IHZhbCA8IDApIHtcbiAgICAgICAgICAgIHdyaXRlQmlnVmFyaW50KHZhbCwgdGhpcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlYWxsb2MoNCk7XG5cbiAgICAgICAgdGhpcy5idWZbdGhpcy5wb3MrK10gPSAgICAgICAgICAgdmFsICYgMHg3ZiAgfCAodmFsID4gMHg3ZiA/IDB4ODAgOiAwKTsgaWYgKHZhbCA8PSAweDdmKSByZXR1cm47XG4gICAgICAgIHRoaXMuYnVmW3RoaXMucG9zKytdID0gKCh2YWwgPj4+PSA3KSAmIDB4N2YpIHwgKHZhbCA+IDB4N2YgPyAweDgwIDogMCk7IGlmICh2YWwgPD0gMHg3ZikgcmV0dXJuO1xuICAgICAgICB0aGlzLmJ1Zlt0aGlzLnBvcysrXSA9ICgodmFsID4+Pj0gNykgJiAweDdmKSB8ICh2YWwgPiAweDdmID8gMHg4MCA6IDApOyBpZiAodmFsIDw9IDB4N2YpIHJldHVybjtcbiAgICAgICAgdGhpcy5idWZbdGhpcy5wb3MrK10gPSAgICh2YWwgPj4+IDcpICYgMHg3ZjtcbiAgICB9LFxuXG4gICAgd3JpdGVTVmFyaW50OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgdGhpcy53cml0ZVZhcmludCh2YWwgPCAwID8gLXZhbCAqIDIgLSAxIDogdmFsICogMik7XG4gICAgfSxcblxuICAgIHdyaXRlQm9vbGVhbjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHRoaXMud3JpdGVWYXJpbnQoQm9vbGVhbih2YWwpKTtcbiAgICB9LFxuXG4gICAgd3JpdGVTdHJpbmc6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgICAgICAgdGhpcy5yZWFsbG9jKHN0ci5sZW5ndGggKiA0KTtcblxuICAgICAgICB0aGlzLnBvcysrOyAvLyByZXNlcnZlIDEgYnl0ZSBmb3Igc2hvcnQgc3RyaW5nIGxlbmd0aFxuXG4gICAgICAgIHZhciBzdGFydFBvcyA9IHRoaXMucG9zO1xuICAgICAgICAvLyB3cml0ZSB0aGUgc3RyaW5nIGRpcmVjdGx5IHRvIHRoZSBidWZmZXIgYW5kIHNlZSBob3cgbXVjaCB3YXMgd3JpdHRlblxuICAgICAgICB0aGlzLnBvcyA9IHdyaXRlVXRmOCh0aGlzLmJ1Ziwgc3RyLCB0aGlzLnBvcyk7XG4gICAgICAgIHZhciBsZW4gPSB0aGlzLnBvcyAtIHN0YXJ0UG9zO1xuXG4gICAgICAgIGlmIChsZW4gPj0gMHg4MCkgbWFrZVJvb21Gb3JFeHRyYUxlbmd0aChzdGFydFBvcywgbGVuLCB0aGlzKTtcblxuICAgICAgICAvLyBmaW5hbGx5LCB3cml0ZSB0aGUgbWVzc2FnZSBsZW5ndGggaW4gdGhlIHJlc2VydmVkIHBsYWNlIGFuZCByZXN0b3JlIHRoZSBwb3NpdGlvblxuICAgICAgICB0aGlzLnBvcyA9IHN0YXJ0UG9zIC0gMTtcbiAgICAgICAgdGhpcy53cml0ZVZhcmludChsZW4pO1xuICAgICAgICB0aGlzLnBvcyArPSBsZW47XG4gICAgfSxcblxuICAgIHdyaXRlRmxvYXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICB0aGlzLnJlYWxsb2MoNCk7XG4gICAgICAgIGllZWU3NTQud3JpdGUodGhpcy5idWYsIHZhbCwgdGhpcy5wb3MsIHRydWUsIDIzLCA0KTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICB9LFxuXG4gICAgd3JpdGVEb3VibGU6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICB0aGlzLnJlYWxsb2MoOCk7XG4gICAgICAgIGllZWU3NTQud3JpdGUodGhpcy5idWYsIHZhbCwgdGhpcy5wb3MsIHRydWUsIDUyLCA4KTtcbiAgICAgICAgdGhpcy5wb3MgKz0gODtcbiAgICB9LFxuXG4gICAgd3JpdGVCeXRlczogZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICAgIHZhciBsZW4gPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICB0aGlzLndyaXRlVmFyaW50KGxlbik7XG4gICAgICAgIHRoaXMucmVhbGxvYyhsZW4pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB0aGlzLmJ1Zlt0aGlzLnBvcysrXSA9IGJ1ZmZlcltpXTtcbiAgICB9LFxuXG4gICAgd3JpdGVSYXdNZXNzYWdlOiBmdW5jdGlvbihmbiwgb2JqKSB7XG4gICAgICAgIHRoaXMucG9zKys7IC8vIHJlc2VydmUgMSBieXRlIGZvciBzaG9ydCBtZXNzYWdlIGxlbmd0aFxuXG4gICAgICAgIC8vIHdyaXRlIHRoZSBtZXNzYWdlIGRpcmVjdGx5IHRvIHRoZSBidWZmZXIgYW5kIHNlZSBob3cgbXVjaCB3YXMgd3JpdHRlblxuICAgICAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnBvcztcbiAgICAgICAgZm4ob2JqLCB0aGlzKTtcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMucG9zIC0gc3RhcnRQb3M7XG5cbiAgICAgICAgaWYgKGxlbiA+PSAweDgwKSBtYWtlUm9vbUZvckV4dHJhTGVuZ3RoKHN0YXJ0UG9zLCBsZW4sIHRoaXMpO1xuXG4gICAgICAgIC8vIGZpbmFsbHksIHdyaXRlIHRoZSBtZXNzYWdlIGxlbmd0aCBpbiB0aGUgcmVzZXJ2ZWQgcGxhY2UgYW5kIHJlc3RvcmUgdGhlIHBvc2l0aW9uXG4gICAgICAgIHRoaXMucG9zID0gc3RhcnRQb3MgLSAxO1xuICAgICAgICB0aGlzLndyaXRlVmFyaW50KGxlbik7XG4gICAgICAgIHRoaXMucG9zICs9IGxlbjtcbiAgICB9LFxuXG4gICAgd3JpdGVNZXNzYWdlOiBmdW5jdGlvbih0YWcsIGZuLCBvYmopIHtcbiAgICAgICAgdGhpcy53cml0ZVRhZyh0YWcsIFBiZi5CeXRlcyk7XG4gICAgICAgIHRoaXMud3JpdGVSYXdNZXNzYWdlKGZuLCBvYmopO1xuICAgIH0sXG5cbiAgICB3cml0ZVBhY2tlZFZhcmludDogICBmdW5jdGlvbih0YWcsIGFycikgeyBpZiAoYXJyLmxlbmd0aCkgdGhpcy53cml0ZU1lc3NhZ2UodGFnLCB3cml0ZVBhY2tlZFZhcmludCwgYXJyKTsgICB9LFxuICAgIHdyaXRlUGFja2VkU1ZhcmludDogIGZ1bmN0aW9uKHRhZywgYXJyKSB7IGlmIChhcnIubGVuZ3RoKSB0aGlzLndyaXRlTWVzc2FnZSh0YWcsIHdyaXRlUGFja2VkU1ZhcmludCwgYXJyKTsgIH0sXG4gICAgd3JpdGVQYWNrZWRCb29sZWFuOiAgZnVuY3Rpb24odGFnLCBhcnIpIHsgaWYgKGFyci5sZW5ndGgpIHRoaXMud3JpdGVNZXNzYWdlKHRhZywgd3JpdGVQYWNrZWRCb29sZWFuLCBhcnIpOyAgfSxcbiAgICB3cml0ZVBhY2tlZEZsb2F0OiAgICBmdW5jdGlvbih0YWcsIGFycikgeyBpZiAoYXJyLmxlbmd0aCkgdGhpcy53cml0ZU1lc3NhZ2UodGFnLCB3cml0ZVBhY2tlZEZsb2F0LCBhcnIpOyAgICB9LFxuICAgIHdyaXRlUGFja2VkRG91YmxlOiAgIGZ1bmN0aW9uKHRhZywgYXJyKSB7IGlmIChhcnIubGVuZ3RoKSB0aGlzLndyaXRlTWVzc2FnZSh0YWcsIHdyaXRlUGFja2VkRG91YmxlLCBhcnIpOyAgIH0sXG4gICAgd3JpdGVQYWNrZWRGaXhlZDMyOiAgZnVuY3Rpb24odGFnLCBhcnIpIHsgaWYgKGFyci5sZW5ndGgpIHRoaXMud3JpdGVNZXNzYWdlKHRhZywgd3JpdGVQYWNrZWRGaXhlZDMyLCBhcnIpOyAgfSxcbiAgICB3cml0ZVBhY2tlZFNGaXhlZDMyOiBmdW5jdGlvbih0YWcsIGFycikgeyBpZiAoYXJyLmxlbmd0aCkgdGhpcy53cml0ZU1lc3NhZ2UodGFnLCB3cml0ZVBhY2tlZFNGaXhlZDMyLCBhcnIpOyB9LFxuICAgIHdyaXRlUGFja2VkRml4ZWQ2NDogIGZ1bmN0aW9uKHRhZywgYXJyKSB7IGlmIChhcnIubGVuZ3RoKSB0aGlzLndyaXRlTWVzc2FnZSh0YWcsIHdyaXRlUGFja2VkRml4ZWQ2NCwgYXJyKTsgIH0sXG4gICAgd3JpdGVQYWNrZWRTRml4ZWQ2NDogZnVuY3Rpb24odGFnLCBhcnIpIHsgaWYgKGFyci5sZW5ndGgpIHRoaXMud3JpdGVNZXNzYWdlKHRhZywgd3JpdGVQYWNrZWRTRml4ZWQ2NCwgYXJyKTsgfSxcblxuICAgIHdyaXRlQnl0ZXNGaWVsZDogZnVuY3Rpb24odGFnLCBidWZmZXIpIHtcbiAgICAgICAgdGhpcy53cml0ZVRhZyh0YWcsIFBiZi5CeXRlcyk7XG4gICAgICAgIHRoaXMud3JpdGVCeXRlcyhidWZmZXIpO1xuICAgIH0sXG4gICAgd3JpdGVGaXhlZDMyRmllbGQ6IGZ1bmN0aW9uKHRhZywgdmFsKSB7XG4gICAgICAgIHRoaXMud3JpdGVUYWcodGFnLCBQYmYuRml4ZWQzMik7XG4gICAgICAgIHRoaXMud3JpdGVGaXhlZDMyKHZhbCk7XG4gICAgfSxcbiAgICB3cml0ZVNGaXhlZDMyRmllbGQ6IGZ1bmN0aW9uKHRhZywgdmFsKSB7XG4gICAgICAgIHRoaXMud3JpdGVUYWcodGFnLCBQYmYuRml4ZWQzMik7XG4gICAgICAgIHRoaXMud3JpdGVTRml4ZWQzMih2YWwpO1xuICAgIH0sXG4gICAgd3JpdGVGaXhlZDY0RmllbGQ6IGZ1bmN0aW9uKHRhZywgdmFsKSB7XG4gICAgICAgIHRoaXMud3JpdGVUYWcodGFnLCBQYmYuRml4ZWQ2NCk7XG4gICAgICAgIHRoaXMud3JpdGVGaXhlZDY0KHZhbCk7XG4gICAgfSxcbiAgICB3cml0ZVNGaXhlZDY0RmllbGQ6IGZ1bmN0aW9uKHRhZywgdmFsKSB7XG4gICAgICAgIHRoaXMud3JpdGVUYWcodGFnLCBQYmYuRml4ZWQ2NCk7XG4gICAgICAgIHRoaXMud3JpdGVTRml4ZWQ2NCh2YWwpO1xuICAgIH0sXG4gICAgd3JpdGVWYXJpbnRGaWVsZDogZnVuY3Rpb24odGFnLCB2YWwpIHtcbiAgICAgICAgdGhpcy53cml0ZVRhZyh0YWcsIFBiZi5WYXJpbnQpO1xuICAgICAgICB0aGlzLndyaXRlVmFyaW50KHZhbCk7XG4gICAgfSxcbiAgICB3cml0ZVNWYXJpbnRGaWVsZDogZnVuY3Rpb24odGFnLCB2YWwpIHtcbiAgICAgICAgdGhpcy53cml0ZVRhZyh0YWcsIFBiZi5WYXJpbnQpO1xuICAgICAgICB0aGlzLndyaXRlU1ZhcmludCh2YWwpO1xuICAgIH0sXG4gICAgd3JpdGVTdHJpbmdGaWVsZDogZnVuY3Rpb24odGFnLCBzdHIpIHtcbiAgICAgICAgdGhpcy53cml0ZVRhZyh0YWcsIFBiZi5CeXRlcyk7XG4gICAgICAgIHRoaXMud3JpdGVTdHJpbmcoc3RyKTtcbiAgICB9LFxuICAgIHdyaXRlRmxvYXRGaWVsZDogZnVuY3Rpb24odGFnLCB2YWwpIHtcbiAgICAgICAgdGhpcy53cml0ZVRhZyh0YWcsIFBiZi5GaXhlZDMyKTtcbiAgICAgICAgdGhpcy53cml0ZUZsb2F0KHZhbCk7XG4gICAgfSxcbiAgICB3cml0ZURvdWJsZUZpZWxkOiBmdW5jdGlvbih0YWcsIHZhbCkge1xuICAgICAgICB0aGlzLndyaXRlVGFnKHRhZywgUGJmLkZpeGVkNjQpO1xuICAgICAgICB0aGlzLndyaXRlRG91YmxlKHZhbCk7XG4gICAgfSxcbiAgICB3cml0ZUJvb2xlYW5GaWVsZDogZnVuY3Rpb24odGFnLCB2YWwpIHtcbiAgICAgICAgdGhpcy53cml0ZVZhcmludEZpZWxkKHRhZywgQm9vbGVhbih2YWwpKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiByZWFkVmFyaW50UmVtYWluZGVyKGwsIHMsIHApIHtcbiAgICB2YXIgYnVmID0gcC5idWYsXG4gICAgICAgIGgsIGI7XG5cbiAgICBiID0gYnVmW3AucG9zKytdOyBoICA9IChiICYgMHg3MCkgPj4gNDsgIGlmIChiIDwgMHg4MCkgcmV0dXJuIHRvTnVtKGwsIGgsIHMpO1xuICAgIGIgPSBidWZbcC5wb3MrK107IGggfD0gKGIgJiAweDdmKSA8PCAzOyAgaWYgKGIgPCAweDgwKSByZXR1cm4gdG9OdW0obCwgaCwgcyk7XG4gICAgYiA9IGJ1ZltwLnBvcysrXTsgaCB8PSAoYiAmIDB4N2YpIDw8IDEwOyBpZiAoYiA8IDB4ODApIHJldHVybiB0b051bShsLCBoLCBzKTtcbiAgICBiID0gYnVmW3AucG9zKytdOyBoIHw9IChiICYgMHg3ZikgPDwgMTc7IGlmIChiIDwgMHg4MCkgcmV0dXJuIHRvTnVtKGwsIGgsIHMpO1xuICAgIGIgPSBidWZbcC5wb3MrK107IGggfD0gKGIgJiAweDdmKSA8PCAyNDsgaWYgKGIgPCAweDgwKSByZXR1cm4gdG9OdW0obCwgaCwgcyk7XG4gICAgYiA9IGJ1ZltwLnBvcysrXTsgaCB8PSAoYiAmIDB4MDEpIDw8IDMxOyBpZiAoYiA8IDB4ODApIHJldHVybiB0b051bShsLCBoLCBzKTtcblxuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdmFyaW50IG5vdCBtb3JlIHRoYW4gMTAgYnl0ZXMnKTtcbn1cblxuZnVuY3Rpb24gcmVhZFBhY2tlZEVuZChwYmYpIHtcbiAgICByZXR1cm4gcGJmLnR5cGUgPT09IFBiZi5CeXRlcyA/XG4gICAgICAgIHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zIDogcGJmLnBvcyArIDE7XG59XG5cbmZ1bmN0aW9uIHRvTnVtKGxvdywgaGlnaCwgaXNTaWduZWQpIHtcbiAgICBpZiAoaXNTaWduZWQpIHtcbiAgICAgICAgcmV0dXJuIGhpZ2ggKiAweDEwMDAwMDAwMCArIChsb3cgPj4+IDApO1xuICAgIH1cblxuICAgIHJldHVybiAoKGhpZ2ggPj4+IDApICogMHgxMDAwMDAwMDApICsgKGxvdyA+Pj4gMCk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlQmlnVmFyaW50KHZhbCwgcGJmKSB7XG4gICAgdmFyIGxvdywgaGlnaDtcblxuICAgIGlmICh2YWwgPj0gMCkge1xuICAgICAgICBsb3cgID0gKHZhbCAlIDB4MTAwMDAwMDAwKSB8IDA7XG4gICAgICAgIGhpZ2ggPSAodmFsIC8gMHgxMDAwMDAwMDApIHwgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb3cgID0gfigtdmFsICUgMHgxMDAwMDAwMDApO1xuICAgICAgICBoaWdoID0gfigtdmFsIC8gMHgxMDAwMDAwMDApO1xuXG4gICAgICAgIGlmIChsb3cgXiAweGZmZmZmZmZmKSB7XG4gICAgICAgICAgICBsb3cgPSAobG93ICsgMSkgfCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG93ID0gMDtcbiAgICAgICAgICAgIGhpZ2ggPSAoaGlnaCArIDEpIHwgMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2YWwgPj0gMHgxMDAwMDAwMDAwMDAwMDAwMCB8fCB2YWwgPCAtMHgxMDAwMDAwMDAwMDAwMDAwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dpdmVuIHZhcmludCBkb2VzblxcJ3QgZml0IGludG8gMTAgYnl0ZXMnKTtcbiAgICB9XG5cbiAgICBwYmYucmVhbGxvYygxMCk7XG5cbiAgICB3cml0ZUJpZ1ZhcmludExvdyhsb3csIGhpZ2gsIHBiZik7XG4gICAgd3JpdGVCaWdWYXJpbnRIaWdoKGhpZ2gsIHBiZik7XG59XG5cbmZ1bmN0aW9uIHdyaXRlQmlnVmFyaW50TG93KGxvdywgaGlnaCwgcGJmKSB7XG4gICAgcGJmLmJ1ZltwYmYucG9zKytdID0gbG93ICYgMHg3ZiB8IDB4ODA7IGxvdyA+Pj49IDc7XG4gICAgcGJmLmJ1ZltwYmYucG9zKytdID0gbG93ICYgMHg3ZiB8IDB4ODA7IGxvdyA+Pj49IDc7XG4gICAgcGJmLmJ1ZltwYmYucG9zKytdID0gbG93ICYgMHg3ZiB8IDB4ODA7IGxvdyA+Pj49IDc7XG4gICAgcGJmLmJ1ZltwYmYucG9zKytdID0gbG93ICYgMHg3ZiB8IDB4ODA7IGxvdyA+Pj49IDc7XG4gICAgcGJmLmJ1ZltwYmYucG9zXSAgID0gbG93ICYgMHg3Zjtcbn1cblxuZnVuY3Rpb24gd3JpdGVCaWdWYXJpbnRIaWdoKGhpZ2gsIHBiZikge1xuICAgIHZhciBsc2IgPSAoaGlnaCAmIDB4MDcpIDw8IDQ7XG5cbiAgICBwYmYuYnVmW3BiZi5wb3MrK10gfD0gbHNiICAgICAgICAgfCAoKGhpZ2ggPj4+PSAzKSA/IDB4ODAgOiAwKTsgaWYgKCFoaWdoKSByZXR1cm47XG4gICAgcGJmLmJ1ZltwYmYucG9zKytdICA9IGhpZ2ggJiAweDdmIHwgKChoaWdoID4+Pj0gNykgPyAweDgwIDogMCk7IGlmICghaGlnaCkgcmV0dXJuO1xuICAgIHBiZi5idWZbcGJmLnBvcysrXSAgPSBoaWdoICYgMHg3ZiB8ICgoaGlnaCA+Pj49IDcpID8gMHg4MCA6IDApOyBpZiAoIWhpZ2gpIHJldHVybjtcbiAgICBwYmYuYnVmW3BiZi5wb3MrK10gID0gaGlnaCAmIDB4N2YgfCAoKGhpZ2ggPj4+PSA3KSA/IDB4ODAgOiAwKTsgaWYgKCFoaWdoKSByZXR1cm47XG4gICAgcGJmLmJ1ZltwYmYucG9zKytdICA9IGhpZ2ggJiAweDdmIHwgKChoaWdoID4+Pj0gNykgPyAweDgwIDogMCk7IGlmICghaGlnaCkgcmV0dXJuO1xuICAgIHBiZi5idWZbcGJmLnBvcysrXSAgPSBoaWdoICYgMHg3Zjtcbn1cblxuZnVuY3Rpb24gbWFrZVJvb21Gb3JFeHRyYUxlbmd0aChzdGFydFBvcywgbGVuLCBwYmYpIHtcbiAgICB2YXIgZXh0cmFMZW4gPVxuICAgICAgICBsZW4gPD0gMHgzZmZmID8gMSA6XG4gICAgICAgIGxlbiA8PSAweDFmZmZmZiA/IDIgOlxuICAgICAgICBsZW4gPD0gMHhmZmZmZmZmID8gMyA6IE1hdGguZmxvb3IoTWF0aC5sb2cobGVuKSAvIChNYXRoLkxOMiAqIDcpKTtcblxuICAgIC8vIGlmIDEgYnl0ZSBpc24ndCBlbm91Z2ggZm9yIGVuY29kaW5nIG1lc3NhZ2UgbGVuZ3RoLCBzaGlmdCB0aGUgZGF0YSB0byB0aGUgcmlnaHRcbiAgICBwYmYucmVhbGxvYyhleHRyYUxlbik7XG4gICAgZm9yICh2YXIgaSA9IHBiZi5wb3MgLSAxOyBpID49IHN0YXJ0UG9zOyBpLS0pIHBiZi5idWZbaSArIGV4dHJhTGVuXSA9IHBiZi5idWZbaV07XG59XG5cbmZ1bmN0aW9uIHdyaXRlUGFja2VkVmFyaW50KGFyciwgcGJmKSAgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZVZhcmludChhcnJbaV0pOyAgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkU1ZhcmludChhcnIsIHBiZikgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZVNWYXJpbnQoYXJyW2ldKTsgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkRmxvYXQoYXJyLCBwYmYpICAgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZUZsb2F0KGFycltpXSk7ICAgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkRG91YmxlKGFyciwgcGJmKSAgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZURvdWJsZShhcnJbaV0pOyAgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkQm9vbGVhbihhcnIsIHBiZikgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZUJvb2xlYW4oYXJyW2ldKTsgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkRml4ZWQzMihhcnIsIHBiZikgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZUZpeGVkMzIoYXJyW2ldKTsgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkU0ZpeGVkMzIoYXJyLCBwYmYpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZVNGaXhlZDMyKGFycltpXSk7IH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkRml4ZWQ2NChhcnIsIHBiZikgIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZUZpeGVkNjQoYXJyW2ldKTsgIH1cbmZ1bmN0aW9uIHdyaXRlUGFja2VkU0ZpeGVkNjQoYXJyLCBwYmYpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHBiZi53cml0ZVNGaXhlZDY0KGFycltpXSk7IH1cblxuLy8gQnVmZmVyIGNvZGUgYmVsb3cgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlciwgTUlULWxpY2Vuc2VkXG5cbmZ1bmN0aW9uIHJlYWRVSW50MzIoYnVmLCBwb3MpIHtcbiAgICByZXR1cm4gKChidWZbcG9zXSkgfFxuICAgICAgICAoYnVmW3BvcyArIDFdIDw8IDgpIHxcbiAgICAgICAgKGJ1Zltwb3MgKyAyXSA8PCAxNikpICtcbiAgICAgICAgKGJ1Zltwb3MgKyAzXSAqIDB4MTAwMDAwMCk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlSW50MzIoYnVmLCB2YWwsIHBvcykge1xuICAgIGJ1Zltwb3NdID0gdmFsO1xuICAgIGJ1Zltwb3MgKyAxXSA9ICh2YWwgPj4+IDgpO1xuICAgIGJ1Zltwb3MgKyAyXSA9ICh2YWwgPj4+IDE2KTtcbiAgICBidWZbcG9zICsgM10gPSAodmFsID4+PiAyNCk7XG59XG5cbmZ1bmN0aW9uIHJlYWRJbnQzMihidWYsIHBvcykge1xuICAgIHJldHVybiAoKGJ1Zltwb3NdKSB8XG4gICAgICAgIChidWZbcG9zICsgMV0gPDwgOCkgfFxuICAgICAgICAoYnVmW3BvcyArIDJdIDw8IDE2KSkgK1xuICAgICAgICAoYnVmW3BvcyArIDNdIDw8IDI0KTtcbn1cblxuZnVuY3Rpb24gcmVhZFV0ZjgoYnVmLCBwb3MsIGVuZCkge1xuICAgIHZhciBzdHIgPSAnJztcbiAgICB2YXIgaSA9IHBvcztcblxuICAgIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgICAgIHZhciBiMCA9IGJ1ZltpXTtcbiAgICAgICAgdmFyIGMgPSBudWxsOyAvLyBjb2RlcG9pbnRcbiAgICAgICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPVxuICAgICAgICAgICAgYjAgPiAweEVGID8gNCA6XG4gICAgICAgICAgICBiMCA+IDB4REYgPyAzIDpcbiAgICAgICAgICAgIGIwID4gMHhCRiA/IDIgOiAxO1xuXG4gICAgICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA+IGVuZCkgYnJlYWs7XG5cbiAgICAgICAgdmFyIGIxLCBiMiwgYjM7XG5cbiAgICAgICAgaWYgKGJ5dGVzUGVyU2VxdWVuY2UgPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChiMCA8IDB4ODApIHtcbiAgICAgICAgICAgICAgICBjID0gYjA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYnl0ZXNQZXJTZXF1ZW5jZSA9PT0gMikge1xuICAgICAgICAgICAgYjEgPSBidWZbaSArIDFdO1xuICAgICAgICAgICAgaWYgKChiMSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICAgICAgYyA9IChiMCAmIDB4MUYpIDw8IDB4NiB8IChiMSAmIDB4M0YpO1xuICAgICAgICAgICAgICAgIGlmIChjIDw9IDB4N0YpIHtcbiAgICAgICAgICAgICAgICAgICAgYyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGJ5dGVzUGVyU2VxdWVuY2UgPT09IDMpIHtcbiAgICAgICAgICAgIGIxID0gYnVmW2kgKyAxXTtcbiAgICAgICAgICAgIGIyID0gYnVmW2kgKyAyXTtcbiAgICAgICAgICAgIGlmICgoYjEgJiAweEMwKSA9PT0gMHg4MCAmJiAoYjIgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgICAgIGMgPSAoYjAgJiAweEYpIDw8IDB4QyB8IChiMSAmIDB4M0YpIDw8IDB4NiB8IChiMiAmIDB4M0YpO1xuICAgICAgICAgICAgICAgIGlmIChjIDw9IDB4N0ZGIHx8IChjID49IDB4RDgwMCAmJiBjIDw9IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgICAgICAgYyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGJ5dGVzUGVyU2VxdWVuY2UgPT09IDQpIHtcbiAgICAgICAgICAgIGIxID0gYnVmW2kgKyAxXTtcbiAgICAgICAgICAgIGIyID0gYnVmW2kgKyAyXTtcbiAgICAgICAgICAgIGIzID0gYnVmW2kgKyAzXTtcbiAgICAgICAgICAgIGlmICgoYjEgJiAweEMwKSA9PT0gMHg4MCAmJiAoYjIgJiAweEMwKSA9PT0gMHg4MCAmJiAoYjMgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgICAgIGMgPSAoYjAgJiAweEYpIDw8IDB4MTIgfCAoYjEgJiAweDNGKSA8PCAweEMgfCAoYjIgJiAweDNGKSA8PCAweDYgfCAoYjMgJiAweDNGKTtcbiAgICAgICAgICAgICAgICBpZiAoYyA8PSAweEZGRkYgfHwgYyA+PSAweDExMDAwMCkge1xuICAgICAgICAgICAgICAgICAgICBjID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYyA9IDB4RkZGRDtcbiAgICAgICAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYyA+IDB4RkZGRikge1xuICAgICAgICAgICAgYyAtPSAweDEwMDAwO1xuICAgICAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG4gICAgICAgICAgICBjID0gMHhEQzAwIHwgYyAmIDB4M0ZGO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiByZWFkVXRmOFRleHREZWNvZGVyKGJ1ZiwgcG9zLCBlbmQpIHtcbiAgICByZXR1cm4gdXRmOFRleHREZWNvZGVyLmRlY29kZShidWYuc3ViYXJyYXkocG9zLCBlbmQpKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVVdGY4KGJ1Ziwgc3RyLCBwb3MpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYywgbGVhZDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSk7IC8vIGNvZGUgcG9pbnRcblxuICAgICAgICBpZiAoYyA+IDB4RDdGRiAmJiBjIDwgMHhFMDAwKSB7XG4gICAgICAgICAgICBpZiAobGVhZCkge1xuICAgICAgICAgICAgICAgIGlmIChjIDwgMHhEQzAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1Zltwb3MrK10gPSAweEVGO1xuICAgICAgICAgICAgICAgICAgICBidWZbcG9zKytdID0gMHhCRjtcbiAgICAgICAgICAgICAgICAgICAgYnVmW3BvcysrXSA9IDB4QkQ7XG4gICAgICAgICAgICAgICAgICAgIGxlYWQgPSBjO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjID0gbGVhZCAtIDB4RDgwMCA8PCAxMCB8IGMgLSAweERDMDAgfCAweDEwMDAwO1xuICAgICAgICAgICAgICAgICAgICBsZWFkID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjID4gMHhEQkZGIHx8IChpICsgMSA9PT0gc3RyLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnVmW3BvcysrXSA9IDB4RUY7XG4gICAgICAgICAgICAgICAgICAgIGJ1Zltwb3MrK10gPSAweEJGO1xuICAgICAgICAgICAgICAgICAgICBidWZbcG9zKytdID0gMHhCRDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZWFkID0gYztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobGVhZCkge1xuICAgICAgICAgICAgYnVmW3BvcysrXSA9IDB4RUY7XG4gICAgICAgICAgICBidWZbcG9zKytdID0gMHhCRjtcbiAgICAgICAgICAgIGJ1Zltwb3MrK10gPSAweEJEO1xuICAgICAgICAgICAgbGVhZCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYyA8IDB4ODApIHtcbiAgICAgICAgICAgIGJ1Zltwb3MrK10gPSBjO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGMgPCAweDgwMCkge1xuICAgICAgICAgICAgICAgIGJ1Zltwb3MrK10gPSBjID4+IDB4NiB8IDB4QzA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjIDwgMHgxMDAwMCkge1xuICAgICAgICAgICAgICAgICAgICBidWZbcG9zKytdID0gYyA+PiAweEMgfCAweEUwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1Zltwb3MrK10gPSBjID4+IDB4MTIgfCAweEYwO1xuICAgICAgICAgICAgICAgICAgICBidWZbcG9zKytdID0gYyA+PiAweEMgJiAweDNGIHwgMHg4MDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnVmW3BvcysrXSA9IGMgPj4gMHg2ICYgMHgzRiB8IDB4ODA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidWZbcG9zKytdID0gYyAmIDB4M0YgfCAweDgwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwb3M7XG59XG4iLCJpbXBvcnQgeyBkZWNvZGUgfSBmcm9tIFwiZ2VvYnVmXCI7XG5pbXBvcnQgaW5zaWRlIGZyb20gXCJAdHVyZi9ib29sZWFuLXBvaW50LWluLXBvbHlnb25cIjtcbmltcG9ydCB7IHBvaW50IH0gZnJvbSBcIkB0dXJmL2hlbHBlcnNcIjtcbmltcG9ydCBQYmYgZnJvbSBcInBiZlwiO1xuXG5pbXBvcnQgeyBnZXRUaW1lem9uZUF0U2VhLCBvY2VhblpvbmVzIH0gZnJvbSBcIi4vb2NlYW5VdGlsc1wiO1xuXG5leHBvcnQgdHlwZSBDb25maWcgPSB7XG4gIGdlb1RaTG9va3VwVVJMPzogc3RyaW5nO1xuICBnZW9UWkRhdGFVUkw/OiBzdHJpbmc7XG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZW9EYXRhKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCBjb25maWc/OiBDb25maWcpIHtcbiAgY29uc3QgdXJsID0gY29uZmlnPy5nZW9UWkRhdGFVUkwgfHwgXCJodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2dlby10ekBsYXRlc3QvZGF0YS9nZW8uZGF0XCI7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgdXJsLFxuICAgIHtcbiAgICAgIGhlYWRlcnM6IHsgUmFuZ2U6IGBieXRlcz0ke3N0YXJ0fS0ke2VuZH1gIH0sXG4gICAgfVxuICApO1xuICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdHpEYXRhKGNvbmZpZz86IENvbmZpZykge1xuICBjb25zdCB1cmwgPSBjb25maWc/Lmdlb1RaTG9va3VwVVJMIHx8IFwiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9nZW8tdHpAbGF0ZXN0L2RhdGEvaW5kZXguanNvblwiO1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XG4gIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG59XG5cbmxldCB0ekRhdGFQcm9taXNlOiBQcm9taXNlPGFueT4gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBGaW5kIHRoZSB0aW1lem9uZSBJRChzKSBhdCB0aGUgZ2l2ZW4gR1BTIGNvb3JkaW5hdGVzLlxuICpcbiAqIEBwYXJhbSBsYXQgbGF0aXR1ZGUgKG11c3QgYmUgPj0gLTkwIGFuZCA8PTkwKVxuICogQHBhcmFtIGxvbiBsb25naXR1ZSAobXVzdCBiZSA+PSAtMTgwIGFuZCA8PTE4MClcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0cmluZyBvZiBUWklEcyBhdCB0aGUgZ2l2ZW4gY29vcmRpbmF0ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmQobGF0OiBudW1iZXIsIGxvbjogbnVtYmVyLCBjb25maWc/OiBDb25maWcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IG9yaWdpbmFsTG9uID0gbG9uO1xuXG4gIGxldCBlcnI7XG5cbiAgLy8gdmFsaWRhdGUgbGF0aXR1ZGVcbiAgaWYgKGlzTmFOKGxhdCkgfHwgbGF0ID4gOTAgfHwgbGF0IDwgLTkwKSB7XG4gICAgZXJyID0gbmV3IEVycm9yKFwiSW52YWxpZCBsYXRpdHVkZTogXCIgKyBsYXQpO1xuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIC8vIHZhbGlkYXRlIGxvbmdpdHVkZVxuICBpZiAoaXNOYU4obG9uKSB8fCBsb24gPiAxODAgfHwgbG9uIDwgLTE4MCkge1xuICAgIGVyciA9IG5ldyBFcnJvcihcIkludmFsaWQgbG9uZ2l0dWRlOiBcIiArIGxvbik7XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgLy8gTm9ydGggUG9sZSBzaG91bGQgcmV0dXJuIGFsbCBvY2VhbiB6b25lc1xuICBpZiAobGF0ID09PSA5MCkge1xuICAgIHJldHVybiBvY2VhblpvbmVzLm1hcCgoem9uZSkgPT4gem9uZS50emlkKTtcbiAgfVxuXG4gIC8vIGZpeCBlZGdlcyBvZiB0aGUgd29ybGRcbiAgaWYgKGxhdCA+PSA4OS45OTk5KSB7XG4gICAgbGF0ID0gODkuOTk5OTtcbiAgfSBlbHNlIGlmIChsYXQgPD0gLTg5Ljk5OTkpIHtcbiAgICBsYXQgPSAtODkuOTk5OTtcbiAgfVxuXG4gIGlmIChsb24gPj0gMTc5Ljk5OTkpIHtcbiAgICBsb24gPSAxNzkuOTk5OTtcbiAgfSBlbHNlIGlmIChsb24gPD0gLTE3OS45OTk5KSB7XG4gICAgbG9uID0gLTE3OS45OTk5O1xuICB9XG5cbiAgY29uc3QgcHQgPSBwb2ludChbbG9uLCBsYXRdKTtcblxuICAvLyBnZXQgZXhhY3QgYm91bmRhcmllc1xuICBjb25zdCBxdWFkRGF0YSA9IHtcbiAgICB0b3A6IDg5Ljk5OTksXG4gICAgYm90dG9tOiAtODkuOTk5OSxcbiAgICBsZWZ0OiAtMTc5Ljk5OTksXG4gICAgcmlnaHQ6IDE3OS45OTk5LFxuICAgIG1pZExhdDogMCxcbiAgICBtaWRMb246IDAsXG4gIH07XG4gIGxldCBxdWFkUG9zID0gXCJcIjtcbiAgaWYgKCF0ekRhdGFQcm9taXNlKSB7XG4gICAgdHpEYXRhUHJvbWlzZSA9IHR6RGF0YShjb25maWcpO1xuICB9XG5cbiAgbGV0IGN1clR6RGF0YSA9IChhd2FpdCB0ekRhdGFQcm9taXNlKS5sb29rdXA7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICAvLyBjYWxjdWxhdGUgbmV4dCBxdWFkdHJlZSBwb3NpdGlvblxuICAgIGxldCBuZXh0UXVhZDtcbiAgICBpZiAobGF0ID49IHF1YWREYXRhLm1pZExhdCAmJiBsb24gPj0gcXVhZERhdGEubWlkTG9uKSB7XG4gICAgICBuZXh0UXVhZCA9IFwiYVwiO1xuICAgICAgcXVhZERhdGEuYm90dG9tID0gcXVhZERhdGEubWlkTGF0O1xuICAgICAgcXVhZERhdGEubGVmdCA9IHF1YWREYXRhLm1pZExvbjtcbiAgICB9IGVsc2UgaWYgKGxhdCA+PSBxdWFkRGF0YS5taWRMYXQgJiYgbG9uIDwgcXVhZERhdGEubWlkTG9uKSB7XG4gICAgICBuZXh0UXVhZCA9IFwiYlwiO1xuICAgICAgcXVhZERhdGEuYm90dG9tID0gcXVhZERhdGEubWlkTGF0O1xuICAgICAgcXVhZERhdGEucmlnaHQgPSBxdWFkRGF0YS5taWRMb247XG4gICAgfSBlbHNlIGlmIChsYXQgPCBxdWFkRGF0YS5taWRMYXQgJiYgbG9uIDwgcXVhZERhdGEubWlkTG9uKSB7XG4gICAgICBuZXh0UXVhZCA9IFwiY1wiO1xuICAgICAgcXVhZERhdGEudG9wID0gcXVhZERhdGEubWlkTGF0O1xuICAgICAgcXVhZERhdGEucmlnaHQgPSBxdWFkRGF0YS5taWRMb247XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRRdWFkID0gXCJkXCI7XG4gICAgICBxdWFkRGF0YS50b3AgPSBxdWFkRGF0YS5taWRMYXQ7XG4gICAgICBxdWFkRGF0YS5sZWZ0ID0gcXVhZERhdGEubWlkTG9uO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKG5leHRRdWFkKVxuICAgIGN1clR6RGF0YSA9IGN1clR6RGF0YVtuZXh0UXVhZF07XG4gICAgLy8gY29uc29sZS5sb2coKVxuICAgIHF1YWRQb3MgKz0gbmV4dFF1YWQ7XG5cbiAgICAvLyBhbmFseXplIHJlc3VsdCBvZiBjdXJyZW50IGRlcHRoXG4gICAgaWYgKCFjdXJUekRhdGEpIHtcbiAgICAgIC8vIG5vIHRpbWV6b25lIGluIHRoaXMgcXVhZCwgdGhlcmVmb3JlIG11c3QgYmUgdGltZXpvbmUgYXQgc2VhXG4gICAgICByZXR1cm4gZ2V0VGltZXpvbmVBdFNlYShvcmlnaW5hbExvbik7XG4gICAgfSBlbHNlIGlmIChjdXJUekRhdGEucG9zID49IDAgJiYgY3VyVHpEYXRhLmxlbikge1xuICAgICAgLy8gZ2V0IGV4YWN0IGJvdW5kYXJpZXNcbiAgICAgIGNvbnN0IGJ1ZlNsaWNlID0gYXdhaXQgZ2VvRGF0YShcbiAgICAgICAgY3VyVHpEYXRhLnBvcyxcbiAgICAgICAgY3VyVHpEYXRhLnBvcyArIGN1clR6RGF0YS5sZW4gLSAxLFxuICAgICAgICBjb25maWcsXG4gICAgICApO1xuICAgICAgY29uc3QgZ2VvSnNvbiA9IGRlY29kZShuZXcgUGJmKGJ1ZlNsaWNlKSk7XG5cbiAgICAgIGNvbnN0IHRpbWV6b25lc0NvbnRhaW5pbmdQb2ludCA9IFtdO1xuXG4gICAgICBpZiAoZ2VvSnNvbi50eXBlID09PSBcIkZlYXR1cmVDb2xsZWN0aW9uXCIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnZW9Kc29uLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGluc2lkZShwdCwgZ2VvSnNvbi5mZWF0dXJlc1tpXSBhcyBhbnkpKSB7XG4gICAgICAgICAgICB0aW1lem9uZXNDb250YWluaW5nUG9pbnQucHVzaChnZW9Kc29uLmZlYXR1cmVzW2ldLnByb3BlcnRpZXMudHppZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGdlb0pzb24udHlwZSA9PT0gXCJGZWF0dXJlXCIpIHtcbiAgICAgICAgaWYgKGluc2lkZShwdCwgZ2VvSnNvbiBhcyBhbnkpKSB7XG4gICAgICAgICAgdGltZXpvbmVzQ29udGFpbmluZ1BvaW50LnB1c2goZ2VvSnNvbi5wcm9wZXJ0aWVzLnR6aWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGF0IGxlYXN0IG9uZSB0aW1lem9uZSBjb250YWluZWQgdGhlIHBvaW50LCByZXR1cm4gdGhvc2UgdGltZXpvbmVzLFxuICAgICAgLy8gb3RoZXJ3aXNlIG11c3QgYmUgdGltZXpvbmUgYXQgc2VhXG4gICAgICByZXR1cm4gdGltZXpvbmVzQ29udGFpbmluZ1BvaW50Lmxlbmd0aCA+IDBcbiAgICAgICAgPyB0aW1lem9uZXNDb250YWluaW5nUG9pbnRcbiAgICAgICAgOiBnZXRUaW1lem9uZUF0U2VhKG9yaWdpbmFsTG9uKTtcbiAgICB9IGVsc2UgaWYgKGN1clR6RGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBleGFjdCBtYXRjaCBmb3VuZFxuICAgICAgY29uc3QgdGltZXpvbmVzID0gKGF3YWl0IHR6RGF0YVByb21pc2UpLnRpbWV6b25lcztcbiAgICAgIHJldHVybiBjdXJUekRhdGEubWFwKChpZHgpID0+IHRpbWV6b25lc1tpZHhdKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjdXJUekRhdGEgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgIC8vIG5vdCBhbm90aGVyIG5lc3RlZCBxdWFkIGluZGV4LCB0aHJvdyBlcnJvclxuICAgICAgZXJyID0gbmV3IEVycm9yKFwiVW5leHBlY3RlZCBkYXRhIHR5cGVcIik7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuXG4gICAgLy8gY2FsY3VsYXRlIG5leHQgcXVhZHRyZWUgZGVwdGggZGF0YVxuICAgIHF1YWREYXRhLm1pZExhdCA9IChxdWFkRGF0YS50b3AgKyBxdWFkRGF0YS5ib3R0b20pIC8gMjtcbiAgICBxdWFkRGF0YS5taWRMb24gPSAocXVhZERhdGEubGVmdCArIHF1YWREYXRhLnJpZ2h0KSAvIDI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvT2Zmc2V0KHRpbWVab25lOiBzdHJpbmcpIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IHV0Y0RhdGUgPSBuZXcgRGF0ZShkYXRlLnRvTG9jYWxlU3RyaW5nKFwiZW4tVVNcIiwgeyB0aW1lWm9uZTogXCJVVENcIiB9KSk7XG4gIGNvbnN0IHR6RGF0ZSA9IG5ldyBEYXRlKGRhdGUudG9Mb2NhbGVTdHJpbmcoXCJlbi1VU1wiLCB7IHRpbWVab25lIH0pKTtcbiAgcmV0dXJuICh0ekRhdGUuZ2V0VGltZSgpIC0gdXRjRGF0ZS5nZXRUaW1lKCkpIC8gNmU0O1xufVxuIiwidHlwZSBPY2VhblpvbmUgPSB7XG4gIGxlZnQ6IG51bWJlclxuICByaWdodDogbnVtYmVyXG4gIHR6aWQ6IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3Qgb2NlYW5ab25lczogT2NlYW5ab25lW10gPSBbXG4gIHsgdHppZDogJ0V0Yy9HTVQtMTInLCBsZWZ0OiAxNzIuNSwgcmlnaHQ6IDE4MCB9LFxuICB7IHR6aWQ6ICdFdGMvR01ULTExJywgbGVmdDogMTU3LjUsIHJpZ2h0OiAxNzIuNSB9LFxuICB7IHR6aWQ6ICdFdGMvR01ULTEwJywgbGVmdDogMTQyLjUsIHJpZ2h0OiAxNTcuNSB9LFxuICB7IHR6aWQ6ICdFdGMvR01ULTknLCBsZWZ0OiAxMjcuNSwgcmlnaHQ6IDE0Mi41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtOCcsIGxlZnQ6IDExMi41LCByaWdodDogMTI3LjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVC03JywgbGVmdDogOTcuNSwgcmlnaHQ6IDExMi41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtNicsIGxlZnQ6IDgyLjUsIHJpZ2h0OiA5Ny41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtNScsIGxlZnQ6IDY3LjUsIHJpZ2h0OiA4Mi41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtNCcsIGxlZnQ6IDUyLjUsIHJpZ2h0OiA2Ny41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtMycsIGxlZnQ6IDM3LjUsIHJpZ2h0OiA1Mi41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtMicsIGxlZnQ6IDIyLjUsIHJpZ2h0OiAzNy41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQtMScsIGxlZnQ6IDcuNSwgcmlnaHQ6IDIyLjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVCcsIGxlZnQ6IC03LjUsIHJpZ2h0OiA3LjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVCsxJywgbGVmdDogLTIyLjUsIHJpZ2h0OiAtNy41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQrMicsIGxlZnQ6IC0zNy41LCByaWdodDogLTIyLjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVCszJywgbGVmdDogLTUyLjUsIHJpZ2h0OiAtMzcuNSB9LFxuICB7IHR6aWQ6ICdFdGMvR01UKzQnLCBsZWZ0OiAtNjcuNSwgcmlnaHQ6IC01Mi41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQrNScsIGxlZnQ6IC04Mi41LCByaWdodDogLTY3LjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVCs2JywgbGVmdDogLTk3LjUsIHJpZ2h0OiAtODIuNSB9LFxuICB7IHR6aWQ6ICdFdGMvR01UKzcnLCBsZWZ0OiAtMTEyLjUsIHJpZ2h0OiAtOTcuNSB9LFxuICB7IHR6aWQ6ICdFdGMvR01UKzgnLCBsZWZ0OiAtMTI3LjUsIHJpZ2h0OiAtMTEyLjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVCs5JywgbGVmdDogLTE0Mi41LCByaWdodDogLTEyNy41IH0sXG4gIHsgdHppZDogJ0V0Yy9HTVQrMTAnLCBsZWZ0OiAtMTU3LjUsIHJpZ2h0OiAtMTQyLjUgfSxcbiAgeyB0emlkOiAnRXRjL0dNVCsxMScsIGxlZnQ6IC0xNzIuNSwgcmlnaHQ6IC0xNTcuNSB9LFxuICB7IHR6aWQ6ICdFdGMvR01UKzEyJywgbGVmdDogLTE4MCwgcmlnaHQ6IC0xNzIuNSB9LFxuXVxuXG4vKipcbiAqIEZpbmQgdGhlIEV0Yy9HTVQqIHRpbWV6b25lIG5hbWUocykgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gbG9uZ2l0dWUuXG4gKlxuICogQHBhcmFtIGxvbiBUaGUgbG9uZ2l0dWRlIHRvIGFuYWx5emVcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0cmluZ3Mgb2YgVFpJRHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRpbWV6b25lQXRTZWEobG9uOiBudW1iZXIpOiBzdHJpbmdbXSB7XG4gIC8vIGNvb3JkaW5hdGVzIGFsb25nIHRoZSAxODAgbG9uZ2l0dWRlIHNob3VsZCByZXR1cm4gdHdvIHpvbmVzXG4gIGlmIChsb24gPT09IC0xODAgfHwgbG9uID09PSAxODApIHtcbiAgICByZXR1cm4gWydFdGMvR01UKzEyJywgJ0V0Yy9HTVQtMTInXVxuICB9XG4gIGNvbnN0IHR6cyA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb2NlYW5ab25lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHogPSBvY2VhblpvbmVzW2ldXG4gICAgaWYgKHoubGVmdCA8PSBsb24gJiYgei5yaWdodCA+PSBsb24pIHtcbiAgICAgIHR6cy5wdXNoKHoudHppZClcbiAgICB9IGVsc2UgaWYgKHoucmlnaHQgPCBsb24pIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiB0enNcbn1cbiJdfQ==
