/**
 * @class Factor
 * A utility class for factors.
 *
 **/
import Util from '../util';
import Expression from '../expression';
export default class Factor {

    constructor(exp, count) {
        var me = this;
        me.exp = exp;
        me.count = count;
    }
    copy() {
        var me = this;
        return new Factor(me.exp, me.count);
    } 
    /**
     * Gets factors from the expression.
     * @param {MEPH.math.Expression} expression
     * @return {Array}
     **/
    static getFactors(expression) {
        
        switch (expression.type) {
            case Expression.type.integral:
            case Expression.type.variable:
                return Factor.getVariableFactors(expression);
            case Expression.type.power:
                return Factor.getPowerFactors(expression);
            case Expression.type.multiplication:
                return Factor.getMultiplicationFactors(expression);
            default:
                throw new Error('unhandle case ? getFactors -> Factor.js ');
        }
    }
    /**
     * Get the first numerical expression with a matching factor.
     * @param {Number} num
     * @param {Expression} expression
     * @return {Object}
     **/
    static getFirstNumericalPartWithMatchingFactor(num, expression) {
        
        var factorVal, part = expression.getParts().first(function (part) {
            var val = Factor.getNumerical(part.val);
            if (typeof val === 'number') {
                var factors = Util.factor(val);
                factorVal = factors.find(function (x) { return num === x; })
                return factorVal;
            }
            else {
                return false;
            }
        });

        return part ? { factorVal: factorVal, exp: part.val } : false;
    }
    /**
     * Divides the expression by a value.
     * @param {MEPH.math.Expression} expression
     * @param {Number} num
     **/
    static divideFactor(expression, num) {
        
        var expNum = Factor.getNumerical(expression);
        var result = MEPH.math.expression.Evaluator.evaluate(Expression.division(expression.copy(), num));
        return result;
    }
    /**
     * Removes factors from an expression
     * @param {MEPH.math.Expression} expression
     * @param {Array} of factors
     * @return {MEPH.math.Expression}
     ***/
    static removeFactors(expression, factors) {
        
        var $factors = factors.select(function (x) { return x.copy(); })

        $factors.foreach(function (factor) {
            if (factor.count) {
                var toremove;
                var num;
                if (typeof (num = Factor.getNumerical(factor.exp)) === 'number') {
                    var val = Factor.getFirstNumericalPartWithMatchingFactor(num, expression);
                    if (val) {
                        var newexp = Factor.divideFactor(val.exp, val.factorVal);
                        Expression.SwapPart(val.exp, newexp);
                        Factor.reduceFactorCount(factor, 1);
                    }
                }
                else {
                    toremove = expression.getParts().where(function (part) {
                        return Factor.getExp(part.val).equals(factor.exp, { exact: true });
                    });

                    toremove.foreach(function (part) {
                        var count = Factor.getCount(part.val);
                        Factor.reduceFactorCount(factor, count);

                        expression.remove(part.val);
                    });
                }
            }
        });
        if (expression.parts.length === 1) {
            switch (expression.type) {
                case Expression.type.multiplication:
                    expression = expression.getParts().first().val;
                    break;
            }
        }
        else {
            switch (expression.type) {
                case Expression.type.multiplication:
                    expression = Expression.removeOne(expression);
            }
        }
        return expression;
    }
    /**
     * Reduces factor count.
     * @param {Factor} factor
     * @param {Object} count
     **/
    static reduceFactorCount(factor, count) {
        if (isNaN(factor.count) || isNaN(count)) {
            var sub = Expression.subtraction(factor.count, count);
            factor.count = MEPH.math.expression.Evaluator.evaluate(sub);
        } else
            factor.count -= count;
    }
    /**
     * Gets the number of factors it accounts for.
     * @param {MEPH.math.Expression} expression
     * @return {Number}
     **/
    static getCount(expression) {
        switch (expression.type) {
            case Expression.type.power:
                return expression.partOrDefault(Expression['function'].power);
            default:
                return 1;
        }
    }
    /**
     * Get expression.
     * @param {MEPH.math.Expression} expression
     * @return {MEPH.math.Expression}
     */
    static getExp(expression) {
        switch (expression.type) {
            case Expression.type.power:
                return expression.partOrDefault(Expression['function'].base);
            default:
                return expression;
        }
    }
    /**
     * Gets the multiplication factors.
     * @param {MEPH.math.Expression} expression
     * @return {Array} of Factors
     **/
    static getMultiplicationFactors(expression) {
        
        var factors = [],
            result = expression.getParts().select(function (x) {
                return Factor.getFactors(x.val);
            }).concatFluentReverse(function (x) {
                return x;
            });

        result.foreach(function (x) {
            var f = factors.first(function (y) { return y.exp.equals(x.exp, { exact: true }); });
            if (f) {
                if (!isNaN(f.count) && !isNaN(x.count)) {
                    f.count += x.count;
                }
                else {
                    var t = typeof f.count === 'object' ? f.count : Expression.variable(f.count);
                    f.count = Expression.addition(Expression.variable(x.count), t);
                }
            }
            else {
                factors.push(x);
            }
        });

        return factors;
    }
    /**
     * Gets variable factors.
     * @param {MEPH.math.Expression} expression
     * @return {Array}
     **/
    static getVariableFactors(expression) {
        
        var numerical = Factor.getNumerical(expression);
        if (!isNaN(numerical)) {
            var t = Util.factor(numerical).where(function (x) {
                return x !== 1;
            });

            if (t.length !== 1) {
                return t.where(function (x) { return x !== numerical; }).select(function (x) {
                    return new Factor(Expression.variable(x), 1);
                });
            }
        }
        var factor = new Factor(expression, 1);
        return [factor];
    }
    /**
     * Gets power factors.
     * @param {MEPH.math.Expression} expression
     * @return {Array}
     **/
    static getPowerFactors(expression) {
        
        var copy = expression.copy();
        var flattenedCopy = Expression.FlattenPower(copy);
        var power = flattenedCopy.partOrDefault(Expression['function'].power);
        var num = Factor.getNumerical(power)
        var factor = new Factor(flattenedCopy.partOrDefault(Expression['function'].base), num);
        return [factor];
    }
    /**
     * Gets a numerical value or string or expression.
     * @param {Object} obj
     * @param {Boolean} prefferVal
     * @return {Object/Number/String}
     **/
    static getNumerical(obj, prefferVal) {
        var result;
        if (typeof obj === 'object') {
            if (obj.type === Expression.type.variable) {
                result = obj.partOrDefault(Expression.type.variable);
                result = isNaN(result) ? (prefferVal ? result : obj) : parseFloat(result);
            }
            else result = obj;
        }
        else if (typeof obj === 'number') {
            result = obj;
        }
        else if (typeof obj === 'string') {

            result = isNaN(obj) ? obj : parseFloat(obj);
        }
        return result;
    }
    /**
     * Returns true if the expression is representing a number.
     * @param {MEPH.math.Expression} exp;
     * @return {Boolean}
     **/
    static isNumerical(exp) {
        var result = Factor.getNumerical(exp);
        return !isNaN(result);
    }

}
