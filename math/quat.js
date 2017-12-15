import $Vector from './vector';
export default class Quat {
    constructor(n, a) {
        // a will be our theta.
        // We must convert degrees to radians. (This step wasn't shown in the video.)
        // 360 degrees == 2pi radians
        if (n && a !== undefined) {
            var me = this;
            me.v = $Vector.Quick.Create(n);
            var v = me.v;
            me.w = Math.cos(a / 2);

            me.v = me.v.multiply(Math.sin(a / 2));

        }
    }

    invert() {
        var q = new Quat();
        q.w = this.w;
        q.v = this.v.multiply(-1);
        return q;
    }
    multiply(q) {
        var me = this;
        var r = new Quat();

        r.w = me.w * q.w + me.v.dot(q.v);
        r.v = me.v.multiply(q.w).add(q.v.multiply(me.w)).add(me.v.cross(q.v));

        return r;
    }
    rotate(vect) {
        var me = this;
        var p = new Quat();
        p.w = 0;
        p.v = $Vector.Quick.Create(vect);

        // Could do it this way:
        /*
        const Quaternion& q = (*this);
        return (q * p * q.Inverted()).v;
        */

        // But let's optimize it a bit instead.
        var vcV = me.v.cross(p.v);
        return p.v.add(vcV.multiply(2 * me.w).add(me.v.cross(vcV).multiply(2)));
    }
}