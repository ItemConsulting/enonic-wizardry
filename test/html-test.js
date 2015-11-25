var assert = require('assert');
var R = require('ramda');
var html = require('../lib/html');

describe('html', function() {
    var model = {
        a: 1,
        b: 2
    };

    describe('#tag()', function () {
        it('should generate a tag with config as attributes', function () {
            var fooTag = html.tag('foo', ['a', 'b']);
            assert.equal('<foo a="1" b="2"></foo>', fooTag(model).$body);
        });

        it('should combine tags with compose', function () {
            var fooTag = html.tag('foo', ['a']);
            var barTag = html.tag('bar', ['b']);
            var foobar = R.compose(barTag, fooTag);

            assert.equal('<bar b="2"><foo a="1"></foo></bar>', foobar(model).$body);
        });
    });
});