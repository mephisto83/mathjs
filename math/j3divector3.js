
export class J3DIVector3 {
    constructor(x, y, z) {
        this.load(x, y, z);
    }
    load(x, y, z) {
        if (typeof x == 'object' && "length" in x) {
            this[0] = x[0];
            this[1] = x[1];
            this[2] = x[2];
        }
        else if (typeof x == 'number') {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        else {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
        }
    }
    getAsArray() {
        return [this[0], this[1], this[2]];
    }
    getAsFloat32Array() {
        return new Float32Array(this.getAsArray());
    }

    getAsFloat32Array() {
        return new Float32Array(this.getAsArray());
    }

    vectorLength() {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
    }

    divide(divisor) {
        this[0] /= divisor; 
        this[1] /= divisor; 
        this[2] /= divisor;
    }

    cross(v) {
        this[0] = this[1] * v[2] - this[2] * v[1];
        this[1] = -this[0] * v[2] + this[2] * v[0];
        this[2] = this[0] * v[1] - this[1] * v[0];
    }


    dot(v) {
        return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
    }

    combine(v, ascl, bscl) {
        this[0] = (ascl * this[0]) + (bscl * v[0]);
        this[1] = (ascl * this[1]) + (bscl * v[1]);
        this[2] = (ascl * this[2]) + (bscl * v[2]);
    }

    multVecMatrix(matrix) {
        var x = this[0];
        var y = this[1];
        var z = this[2];

        this[0] = matrix.$matrix.m41 + x * matrix.$matrix.m11 + y * matrix.$matrix.m21 + z * matrix.$matrix.m31;
        this[1] = matrix.$matrix.m42 + x * matrix.$matrix.m12 + y * matrix.$matrix.m22 + z * matrix.$matrix.m32;
        this[2] = matrix.$matrix.m43 + x * matrix.$matrix.m13 + y * matrix.$matrix.m23 + z * matrix.$matrix.m33;
        var w = matrix.$matrix.m44 + x * matrix.$matrix.m14 + y * matrix.$matrix.m24 + z * matrix.$matrix.m34;
        if (w != 1 && w != 0) {
            this[0] /= w;
            this[1] /= w;
            this[2] /= w;
        }
    }

    toString() {
        return "[" + this[0] + "," + this[1] + "," + this[2] + "]";
    }
}