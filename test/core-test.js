var assert = require('assert');
var R = require('ramda');
var html = require('../lib/html');
var core = require('../lib/core');

describe('core', function() {
    describe('#as()', function () {
        it('should return of type text/html with correct body', function () {
            var model = {};
            var fooTag = html.tag('foo', []);
            var fooMapper = R.compose(core.asHtml, fooTag);
            var result = fooMapper(model);

            assert.equal('text/html', result.contentType);
            assert.equal('<foo></foo>', result.body);
        });
    });

    describe('#mapper()', function () {
        it('map old model to flat new model', function () {
            var mapping = {
                foo: 'component.model.foo',
                bar: 'component.test.bar'
            };

            var model = {
                component: {
                    config: {
                        foo: 'foo'
                    }
                }
            };

            var fooMapper = core.mapper()(mapping);
            var simpleModel = fooMapper(model);
            assert('foo', simpleModel.foo);
            assert(simpleModel.bar === undefined);
        });
    });
});