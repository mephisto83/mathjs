/**
 * @class Vector
 *  Euclidean vector, a geometric entity endowed with magnitude and direction as well as 
 *  a positive-definite inner product; an element of a Euclidean vector space. In physics,
 *  euclidean vectors are used to represent physical quantities that have both magnitude and
 *  direction, such as force, in contrast to scalar quantities, which have no direction.
 *  http://en.wikipedia.org/wiki/Vector_(mathematics_and_physics)
 *
 */
import * as _array from './array';
import J3DIVector3 from './j3divector3';
export default class Vector {
    vector = null;
    $shortcuts = null;
    $defaultValue = 0;

    static Zero = new Vector(0, 0, 0);
    constructor(x, y, z, useBinaryHeap, skipDefine) {
        if (useBinaryHeap)
            this._id = Vector.Id++;
        var me = this;
        if (Array.isArray(x)) {
            me.vector = x.select(function (x) { return x; });
        }
        else if (arguments.length > 0) {
            me.vector = [x, y, z];
        }
        else me.vector = [];
        me.skipDefine = skipDefine;
        if (!skipDefine && !Vector.skipDefine)
            me.defineVectorShortcuts();

    }

    static Id = 0;
    static ZeroLength = Math.pow(1, -15);

    static Quick = {
        ZeroVector: (dim) => {
            return new Vector([].interpolate(0, dim || 4, function () { return 0; }), false, false, false, true);
        },
        Create: (obj) => {
            if (obj instanceof J3DIVector3) {
                return new Vector(obj[0], obj[1], obj[2], false, true);
            }
            else if (Array.isArray(obj)) {
                return new Vector(obj, false, false, false, true);
            }
            return new Vector(obj.x || 0, obj.y || 0, obj.z || 0, false, true);
        }
    }
    static Create = function (obj) {
        if (obj instanceof J3DIVector3) {
            return new Vector(obj[0], obj[1], obj[2]);
        }
        else if (Array.isArray(obj)) {
            return new Vector(obj);
        }
        return new Vector(obj.x || 0, obj.y || 0, obj.z || 0);
    }
    static ZeroVector = function (dim) {
        return new Vector([].interpolate(0, dim || 4, function () { return 0; }));
    };

    static CenterOfGravity = function (vectors) {
        var result = Vector.ZeroVector(vectors.first().dimensions());
        vectors.forEach(function (vect) {
            result = result.add(vect);
        });
        return result.divide(vectors.length)
    };
    static Slope = function (p1, p2) {

        var p21 = p2.subtract(p1)
        return p21.y / p21.x;
    };
    static Line = function (p1, p2) {
        var slope = Vector.Slope(p1, p2);
        return {
            p1: new Vector(0, 0),
            p2: new Vector(1, slope)
        }
    }

    /**
     * Linear Interpolation between to numbers.
     * @param {Number} thrustAmount
     * @param {Number} to
     * @param {Number} percentage
     **/
    static lerp = function (thrustAmount, to, percentage) {
        return thrustAmount + (to - thrustAmount) * percentage;
    };
    /**
     * Linear Interpolation between to vectors of the same dimensions.
     * @param {Number} thrustAmount
     * @param {Number} to
     * @param {Number} percentage
     **/
    static Lerp = function (vect1, vect2, percentage) {
        return Vector.Lerp2D(vect1, vect2, percentage);
    };
    static Lerp2D = function (vect1, vect2, percentage) {
        if (vect1.dimensions() === vect2.dimensions()) {
            var res = new Vector(vect1.vector.select(function (x, index) {
                return Vector.lerp(vect1.getIndex(index), vect2.getIndex(index), percentage)
            }));
            return res;
        }
        throw new Error('Vectors must have the same dimensions');
        //return new Vector(Vector.Lerp(vect1._x, vect2._x, percentage), Vector.Lerp(vect1._y, vect2._y, percentage))
    }
    static Lerp3D = function (vect1, vect2, percentage) {
        return Vector.Lerp2D(vect1, vect2, percentage);
    }
    defineVectorShortcuts() {
        var me = this;
        me.$shortcuts = 'xyzwefglmnopqrstuv';
        var abcd = 'abcd';
        me.$shortcuts.split('').foreach(function (prop, index) {
            if (me[prop] === undefined) {
                Object.defineProperty(me, prop, {
                    get: ((prop, index) => {
                        return me.vector[index] || me.$defaultValue;
                    }).bind(me, prop, index),
                    set: ((prop, index, value) => {
                        me.vector[index] = value;
                    }).bind(me, prop, index)
                });
            }
        });
        abcd.split('').foreach(function (prop, index) {
            if (me[prop] === undefined) {
                Object.defineProperty(me, prop, {
                    get: ((prop, index) => {
                        return me.vector[index] || me.$defaultValue;
                    }).bind(me, prop, index),
                    set: ((prop, index, value) => {
                        me.vector[index] = value;
                    }).bind(me, prop, index)
                });
            }
        });
    }
    ToDebug() { return "x : " + this._x + "y : " + this._y + "z : " + this._z }
    /**
     * Returns true if that equals this.
     * @param {Vector} that
     * @return {Boolean}
     */
    equals(that) {
        return that.dimensions() === this.dimensions() && this.vector.all(function (x, i) {
            return x === that.getIndex(i);
        });
    }
    firstNonZeroIndex() {
        var me = this;
        return me.vector.indexWhere(function (x) { return x; }).first();
    }
    /**
     * Gets the index of the vector.
     * @param {Number} index
     */
    getIndex(index) {
        var me = this;
        return me.vector[index] || 0;
    }
    equals3d(that) {
        return this.equals(that);
    }

    get_id() {
        return this._id;
    }
    /**
     * Copies the vector into a new instance.
     * @returns {Vector}
     */
    copy() {
        return new Vector(this.vector);
    }

    /**
     * Gets the length of a vector.
     */
    length() {
        return Math.sqrt(this.dot(this));
    }
    /**
     * Calculates the distance from this to that.
     * @param {Vector} that
     **/
    distance(that) {
        var res = this.subtract(that);
        return res.length();
    }

    /**
     * Takes the dot product between this and that.
     * @param {Vector} that
     **/
    dot(that) {
        return this.vector.sum(function (x, index) {
            return x * that.getIndex(index);
        })
    }
    /**
     * Cross product (this x that)
     * @param {Vector} that
     * @return {Vector}
     **/
    cross(that) {
        var me = this, dim = me.dimensions();
        if (that.dimensions() === dim) {
            var index = dim;
            if (dim === 2) {
                return new Vector([this.getIndex(0) * that.getIndex(1) - this.getIndex(1) * that.getIndex(0)], false, false, false, true);
            }
            var result = [].interpolate(0, dim, function (i) {

                var u2 = me.getIndex((i + 1) % dim);
                index = (index - 1);
                if (index < 0) {
                    index = index + dim;
                }
                var v3 = that.getIndex(index);

                index = (index - 1);
                if (index < 0) {
                    index = index + dim;
                }

                var u3 = me.getIndex((i + 2) % dim);
                var v2 = that.getIndex(index);

                var res = (u2 * v3) - (u3 * v2);
                return res;
            });
            return new Vector(result, false, false, false, true);
        }
        else {
            throw new Error('Vector: cross product requires same dimensions');
        }
    }
    /**
     * Creates a unit vector.
     * @returns {Vector}
     */
    unit() {
        return this.divide(this.length());
    }
    /**
     * Creates a vector of length "length".
     * @returns {Vector}
     */
    getVectorOfLength(length) {
        return this.divide(this.length() / length);
    }
    unitEquals() {
        this.divideEquals(this.length());

        return this;
    }
    /**
     * Adds a vector.
     * @param {Vector} that
     */
    add(that) {
        return new Vector(this.vector.select(function (x, index) {
            return x + that.getIndex(index);
        }), false, false, false, this.skipDefine);
    }
    isZero() {
        var me = this;
        return me.length() < Vector.ZeroLength;
    }
    /**
     * Subtracts a vector.
     * @param {Vector} that
     */
    subtract(that) {
        return new Vector(this.vector.select(function (x, index) {
            return x - that.getIndex(index);
        }), false, false, false, this.skipDefine);
    }
    /**
     * Gets the dimensions of the vector.
     * @returns {Vector}
     */
    dimensions() {
        var me = this;
        return me.vector.length;
    }

    mapdivide(that) {
        return new Vector(this._x / that._x, this._y / that._y);
    }
    mapmultiply(that) {
        return new Vector(this._x * that._x, this._y * that._y);
    }
    square() {
        return this._x * this._x + this._y * this._y;
    }
    /**
     * Multiplies a scalar value across a vector.
     * @param {Number} scalar
     **/
    multiply(scalar) {
        var me = this;
        return new Vector([].interpolate(0, this.dimensions(), function (x) {
            return me.getIndex(x) * scalar;
        }), false, false, false, this.skipDefine);
    }
    multiplyEquals(scalar) {
        this._x *= scalar;
        this._y *= scalar;
        return this;
    }
    /**
     * Divides a scalar value across a vector.
     * @param {Number} scalar
     **/
    divide(scalar) {
        var me = this;
        if (scalar == 0) {
            return new Vector([].interpolate(0, this.dimensions(), function (x) { return 0; }), false, false, false, this.skipDefine);
        }
        return new Vector([].interpolate(0, this.dimensions(), function (x) {
            return me.getIndex(x) / scalar;
        }), false, false, false, this.skipDefine);
    }
    divideEquals(scalar) {
        this._x /= scalar;
        this._y /= scalar;
        return this;
    }
    perp() {
        return new Vector(-this._y, this._x);
    }
    perpendicular(that) {
        return this.subtract(this.project(that));
    }
    /**
     * Projects that on to this.
     * @param {Vector} that
     * @return {Vector}
     */
    project(that) {
        var percent = this.dot(that) / that.dot(that);
        return that.multiply(percent);
    }
    /**
     * Rejection that from this.
     * @param {Vector} that
     * @return {Vector}
     */
    reject(that) {
        var a1 = this.project(that);
        return this.subtract(a1);
    }
    toString() {
        return this.vector.join();
        // return this._x + "," + this._y;
    }
    fromPoints(p1, p2) {
        return new Vector2D(
            p2.x - p1.x,
            p2.y - p1.y);
    }
    angleBetween(that) {
        return Math.acos(this.dot(that) / (this.length() * that.length()));
    }
    /**
     * Rotates by angle(2d)
     * @param {Number} angle
     * @return {Vector}
     **/
    rotate(angle) {
        var ca = Math.cos(angle);
        var sa = Math.sin(angle);
        var rx = this.vector[0] * ca - this.vector[1] * sa;
        var ry = this.vector[0] * sa + this.vector[1] * ca;
        return new Vector(rx, ry, 0, false, this.skipDefine);
    }
    /**
     * Creates a radom vector.
     * @return {Vector}
     **/
    random() {
        return new Vector(2 * (Math.random() - .5), 2 * (Math.random() - .5));
    }
}

// MEPH.define('Vector', {
//     alternateNames: '$Vector',
//     requires: ['J3DIVector3'],
//     properties: {
//     }

// }).then(function () {

//     $v2 = Vector;
// });