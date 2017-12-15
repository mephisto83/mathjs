/**
 * @class Util
 * Describes mathematical expressions.
 *
 **/
import array from './array'
export default class Util {
    static clamp(max, min, val) {
        return Math.min(max, Math.max(min, val));
    }
    static random(min, max) {
        return min + (Math.random() * (max - min));
    };
    static dimensionClamp(h, w, max) {
        var size = Math.max(h, w, max);
        if (size > max) {
            var ratio = Math.max(w / max, h / max);
            h = h / ratio;
            w = w / ratio;
        }
        return {
            height: h,
            width: w
        }
    }
    static distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    static cachedPrimes = null;

    static polar(x, y) {
        return {
            radius: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
            theta: Math.atan2(y, x)
        }
    }
    static rectangular(theta, radius) {
        return {
            x: radius * Math.cos(theta),
            y: radius * Math.sin(theta)
        }
    }
    /**
     * Generate the main lobe of a sinc function (Dirichlet kernel)
     * @param {Array} x 
     * Array of indices to compute.
     * @param {Number} N
     * Size of FFT to simulate.
     * @return {Array} 
     * Samples of the main lobe of a sinc function
     ***/
    static sinc(x, N) {
        return [].interpolate(0, N, function (t) {
            var res = Math.sin(N * x[t] / 2) / Math.sin(x[t] / 2);
            if (isNaN(res)) {
                return N;
            }
            return res;
        });
    }
    static sec(num) {
        return 1 / Math.cos(num);
    }
    static csc(num) {
        return 1 / Math.sin(num);
    }
    static cot(num) {
        return 1 / Math.tan(num);
    }
    static sinh(num) {
        return (Math.exp(num) - Math.exp(-num)) / 2;
    }
    static cosh(num) {
        return (Math.exp(num) + Math.exp(-num)) / 2;
    }
    static tanh(x) {
        return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
    }
    static sech(num) {
        return 1 / Util.cosh(num);
    }
    static coth(num) {
        return 1 / Util.tanh(num);
    }
    static csch(num) {
        return 1 / Util.sinh(num);
    }
    /**
     * n mathematics, the factorial of a non-negative integer n, denoted by n!, is the product of all positive integers less than or equal to n.
     * http://en.wikipedia.org/wiki/Factorial
     * Calculates the factorial of num.
     **/
    static factorial(num) {
        var result = 1;
        [].interpolate(1, num + 1, function (x) {
            result = result * x;
        });
        return result;
    }
    /**
     * Returns the primes up to the passed value.
     * @param {Number} val
     **/
    static primes(val) {
        Util.cachedPrimes = Util.cachedPrimes || [2, 3];
        var cachedPrimes = Util.cachedPrimes;
        var last = Util.cachedPrimes.last();
        if (last >= val) {
            return Util.cachedPrimes.where(function (x) { return val >= x; });
        }
        for (var i = last + 2; i <= (val); i = i + 2) {
            if (cachedPrimes.all(function (x) { return i % x !== 0; })) {
                cachedPrimes.push(i);
            }
        }
        return cachedPrimes;
    }
    /**
     * Factors an integer into its basic parts.
     * @param {Number} val
     * @returns {Array}
     **/
    static factor(val) {
        var result = [1];
        var primes = Util.primes(val);
        var v = val;
        while (!primes.some(function (x) { return x === v; }) && v % 1 == 0) {
            var prime = primes.find(function (x) { return v % x === 0; });
            result.push(prime);
            v /= prime;
        }
        result.push(v);
        return result;
    }
    /**
     * Generates the main lobe of a Blackman-Harris window
     * @param {Array} x
     * Bin positions to compute.
     * @param {Number} fftsize
     * @return {Array}
     * Main lob as spectrum of a Blackman-Harris window
     ***/
    static getBhLobe(x, fftsize) {
        var N = fftsize || 512;
        var f = x.map(function (t) {
            return t * Math.PI * 2 / N;
        });
        var df = Math.PI * 2 / N;
        var array = new Array(12);
        var y = [].interpolate(0, x.length, function () {
            return 0;
        });

        var consts = [0.35875, 0.48829, 0.14128, 0.01168];
        [].interpolate(0, consts.length, function (m) {
            var sincs1 = Util.sinc(f.map(function (ft) { return ft - df * m }), N);
            var sincs2 = Util.sinc(f.map(function (ft) { return ft + df * m; }), N);
            y = y.map(function (y, y0) {
                return y + (consts[m] / 2) * (sincs1[y0] + sincs2[y0]);
            });
        });
        y = y.map(function (t) { return t / N / consts[0]; });
        return y;
    }
    static window = {

        Triangle: (plus, index, end) => {
            var L = end + plus;
            var v = 1 - Math.abs(((index - ((end - 1) / 2)) / (L / 2)));
            return v;
        },
        Triang: (n, N) => {
            var sym = true;
            if (N < 1)
                return [];
            if (N === 1) {
                return [1];
            }
            var odd = N % 2;
            if (!sym && !odd) {
                N += 1;
            }
            var ns = [].interpolate(1, Math.floor((N + 1) / 2) + 1, function (t) {
                return t;
            });
            var w;
            if (N % 2 === 0) {
                w = ns.map(function (n) {
                    return ((n * 2) - 1) / N;
                });
                w = w.map().concat(w.map().reverse());
            }
            else {
                w = ns.map(function (t) {
                    return (2 * t) / (N + 1);
                });

                w = w.map().concat(w.map().reverse());
            }
            return w;
        },
        Rect: (n, N) => {
            var t = Math.abs(n / N);
            if (t > 0.5) {
                return 0;
            }
            else if (t === .5) {
                return .5
            }
            else if (t < .5) {
                return 1;
            }
        },
        Rectangle: (index, end) => {
            return 1;
        },
        Welch: (n, N) => {
            return 1 - Math.pow(((n - ((N - 1) / 2)) / ((N + 1) / 2)), 2);
        },
        Hann: (a, b, n, N) => {
            return a - (b * Math.cos((2 * Math.PI * n) / (N - 1)));
        },
        Hamming: (n, N) => {
            return Util.window.Hann(.54, .46, n, N);
        },
        Blackman: (n, N) => {
            var a0 = 0.42;
            var a1 = .5;
            var a2 = 0.08;
            return a0 -
                (a1 * Math.cos((2 * Math.PI * n) / (N - 1))) +
                (a2 * Math.cos((4 * Math.PI * n) / (N - 1)));
        },
        BlackmanHarris: (n, N) => {
            var a0 = 0.35875;
            var a1 = 0.48829;
            var a2 = 0.14128;
            var a3 = 0.01168;
            return a0 -
                (a1 * Math.cos((2 * Math.PI * n) / (N - 1))) +
                (a2 * Math.cos((4 * Math.PI * n) / (N - 1))) +
                (a3 * Math.cos((6 * Math.PI * n) / (N - 1)));
        }
    }
}
(function (x) {
    if (!Math.sec) {
        Math.sec = Util.sec;
    }
    if (!Math.csc) {
        Math.csc = Util.csc;
    }
    if (!Math.cot) {
        Math.cot = Util.cot;
    }
    if (!Math.sinh) {
        Math.sinh = Util.sinh;
    }
    if (!Math.cosh) {
        Math.cosh = Util.cosh;
    }
    if (!Math.sech) {
        Math.sech = Util.sech;
    }
    if (!Math.csch) {
        Math.csch = Util.csch;
    }
    if (!Math.coth) {
        Math.coth = Util.coth;
    }
    if (!Math.tanh) {
        Math.tanh = Util.tanh;
    }
})();