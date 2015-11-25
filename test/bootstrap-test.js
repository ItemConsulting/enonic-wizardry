var assert = require('assert');
var bootstrap = require('../wizardry').bootstrap;

describe('bootstrap', function() {
    describe('#panel()', function () {
        it('should generate a panel based on a model', function () {
            var result = bootstrap.panel({
                id: 'myId',
                title: 'myTitle',
                $body: '<h2>testing</h2>'
            });

            assert.equal('<div class="panel panel-default" id="myId"><div class="panel-heading"><h3 class="panel-title">myTitle</h3></div><div class="panel-body"><h2>testing</h2></div></div>', result.$body);
        });
    });
});