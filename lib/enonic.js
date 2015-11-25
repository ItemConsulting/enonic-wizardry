// Don't have access to portal code from test environment
try {
    require.resolve("/lib/xp/portal");
} catch(e) {
    console.log(e.code, "/lib/xp/portal");
    return;
}

var portal = require('/lib/xp/portal');
var R = require('./ramda');

var component = function(){
    return {
        then: R.curry(function(mapper, request){
            return mapper(portal.getComponent().config);
        })
    }
};

exports.component = component;