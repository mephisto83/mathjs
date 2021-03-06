/**
 * @class Matrix
 * In mathematics, a matrix (plural matrices) is a rectangular array[1] of numbers, 
 * symbols, or expressions, arranged in rows and columns.[2][3] 
 * http://en.wikipedia.org/wiki/Matrix_(mathematics)
 */
import Vector from './vector';

export default class Matrix {
    columns = 0;
    rows = 0;
    matrix = null;
    constructor(rows, cols) {
        var me = this;
        me.columns = cols || me.columns;
        me.rows = rows || me.rows;
        me.matrix = [].interpolate(0, me.rows * me.columns, function () { return 0; });
    }
    set(array) {
        var me = this;
        array.map(function (x, index) {
            me.matrix[index] = x;
        });
    }
    get(row, col) {
        var me = this;
        return me.matrix[(row * me.columns + col)];
    }
    setCell(row, col, value) {
        var me = this;
        me.matrix[(row * me.columns + col)] = value;
    }
    /**
     * Set the rows values.
     */
    setRow(ith, vector) {
        var me = this;
        vector.vector.map(function (x, index) {
            me.matrix[(ith * me.columns) + index] = vector.getIndex(index);
        });
    }
    row(ith) {
        var me = this;
        return new Vector(me.matrix.subset(ith * me.columns, (ith + 1) * me.columns));
    }
    column(ith) {
        var me = this;
        return new Vector([].interpolate(0, me.rows, function (x) {
            return me.matrix[x * me.columns + ith];
        }));
    }

    addRow(vector) {
        var me = this;
        if (me.columns === 0 && me.rows === 0) {
            vector.vector.map(function (x) {
                me.matrix.push(x);
            });
            me.columns = vector.dimensions();
            me.rows++;
        }
        else if (me.rows > 0 && me.columns === vector.dimensions()) {
            vector.vector.map(function (x) {
                me.matrix.push(x);
            });
            me.rows++;
        }
    }

    add(matrix) {
        var me = this;
        var res = me.matrix.map(function (x, index) {
            return x + matrix.matrix[index];
        });

        var result = new Matrix(me.rows, me.columns);
        result.set(res);
        return result;
    }
    mul(scalar) {
        var me = this,
            result;

        if (typeof (scalar) === 'number') {
            result = me.scalarMul(scalar);
        }
        else {
            result = me.matMul(scalar);
        }
        return result;
    }
    matMul(that) {
        var me = this,
            result;

        if (me.columns === that.rows) {
            result = new Matrix(me.rows, that.columns);
            for (var i = me.rows; i--;) {
                var row = me.row(i);
                for (var j = that.columns; j--;) {
                    var col = that.column(j);
                    result.setCell(i, j, row.dot(col));
                }
            }
        }
        else {
            throw new Error('not a valid matrix multiplication');
        }
        return result;
    }
    scalarMul(scalar) {
        var me = this;
        var res = me.matrix.map(function (x, index) {
            return x * scalar;
        });

        var result = new Matrix(me.rows, me.columns);
        result.set(res);
        return result;
    }
    transpose() {
        var me = this;

        var result = new Matrix(me.columns, me.rows);
        for (var i = 0; i < me.columns; i++) {
            for (var j = 0; j < me.rows; j++) {
                result.setCell(i, j, me.get(j, i));
            }
        }
        return result;
    }
    /**
     * Switch rows in matrix
     * @param {Number} r1
     * @param {Number} r2
     **/
    switchRow(r1, r2) {
        var me = this;
        var row1 = me.row(r1);
        var row2 = me.row(r2);
        me.setRow(r1, row2);
        me.setRow(r2, row1);
        return me;
    }
    rref() {
        var me = this;
        var firstcolumn = me.column(0);
        var firstindex = firstcolumn.firstNonZeroIndex();
        if (firstindex !== 0) {
            me.switchRow(0, firstindex);
        }
        // For each column reduce the row
        for (var i = 0; i < me.rows; i++) {
            me.reduceColumn(i);
            console.log(me.printMatrix());
        }
    }
    /**
     * Gets the row multiple to use in rref.
     * @param {Number} ith
     * @param {Number} jth
     */
    getMultiple(ith, jth) {
        var me = this;
        var r1 = me.row(ith);
        var r2 = me.row(jth);
        var index = r1.firstNonZeroIndex();
        if (index !== null || index !== undefined) {
            var r1v = r1.getIndex(index);
            var r2v = r2.getIndex(index);
            if (r2v === 0) {
                return 0;
            }
            else {
                return -r2v / r1v;
            }
        }
        return 0;
    }
    /**
     * Reduces the matrix by column and row.
     * @param {Number} col
     * @param {Number} row
     */
    reduceColumn(ithRow) {
        var me = this;
        me.reduceRow(ithRow);
        var row = me.row(ithRow);
        [].interpolate(0, me.rows, function (x) {
            return x;
        })
            .where(function (x) {
                return x !== ithRow;
            }).map(function (jthRow) {
                var multiple = me.getMultiple(ithRow, jthRow);
                var r1 = me.row(ithRow);
                var r2 = me.row(jthRow);
                r1 = r1.multiply(multiple);
                r2 = r2.add(r1);
                if (r2.isZero()) {
                    me.setRow(jthRow, Vector.ZeroVector(r2.dimensions()));
                }
                else {
                    me.setRow(jthRow, r2);
                }
            });
    }
    /**
     * Reduces the row.
     * @param {Number} ith
     */
    reduceRow(ith) {
        var me = this;
        var r1 = me.row(ith);
        var index = r1.firstNonZeroIndex();
        if (index !== null && index !== undefined) {
            var r1v = r1.getIndex(index);
            r1 = r1.multiply(1 / r1v);
            r1.vector[index] = 1;
            me.setRow(ith, r1);
        }
    }
    printMatrix() {
        var me = this;
        var newline = '\r\n';
        var result = '[' + newline;
        for (var j = 0; j < me.rows; j++) {

            for (var i = 0; i < me.columns; i++) {
                result += me.get(j, i) + ','
            }
            result += newline;
        }
        result += ']';

        return result;
    }
}
