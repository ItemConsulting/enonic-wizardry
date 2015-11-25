var _ = require('lodash');

/* ---------- UTILS ----------- */
var newObjectWithAttribute = _.curry(function(key, value){
    return _.set({}, key, value)
});

var applyAndAssign = _.curry(function(f, model){
    return _.assign({}, model, f(model));
});

var applyTemplate = function(f){
    var mapper = _.compose(newObjectWithAttribute('$body'), f);
    return applyAndAssign(mapper);
};

var mapper = _.curry(function(mapping, model){
    return _.map(mapping, function(path){
        return _.get(model, path);
    });
});

/* -------- RETURN AS --------- */
var as = _.curry(function(contentType, body){
    return {
        contentType: contentType,
        body: body
    }
});

var extractBody = function(model){
    if(_.has(model, '$body')){
        return _.get(model, '$body');
    } else {
        return model;
    }
};

exports.applyTemplate = applyTemplate;
exports.mapper = mapper;
exports.asHtml = _.compose(as('text/html'), extractBody);
exports.asJson = as('application/json');
