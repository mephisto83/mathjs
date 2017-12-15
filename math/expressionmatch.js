import Expression from './expression';
export default class ExpressionMatch {

    static getMatch(expression) {
        var result = [];
        switch (expression.type) {
            case Expression.type.integral:
                //Integral of a constant
                var respectTo = expression.part(Expression['function'].respectTo).val;
                var integral = Expression.integral(Expression.variable('#C'), respectTo);
                var v = expression.part(Expression['function'].input);
                var dx = expression.part(Expression['function'].respectTo);
                var variable = Expression.variable(v.val);
                if (expression.equals(integral)) {
                    result.push(Expression.addition(Expression.multiplication(variable, Expression.variable(dx)), Expression.variable('c')));
                }
                //var multiplication = Expression.integral(Expression.multiplication(Expression.variable('#C'), Expression.anything()), respectTo);
                //if (expression.equals(multiplication)) {
                //    result.push(Expression.integral(Expression.multiplication(Expression.variable('#C'), Expression.anything()), respectTo))
                //}
                break;
        }
        return result;
    }
    static funcEnums() {

    }
    static integrate(expression) {
        switch (expression.type) {
            case Expression.type.integral:
                return ExpressionMatch.getMatch(expression).first();
        }
    }
}
