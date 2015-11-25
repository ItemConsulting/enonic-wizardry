var _ = require('lodash');
var core = require('./core');

/* ----- TAG -------*/
var collapseToAttributes = _.partialRight(_.reduce, function(result, val, key){
    return result + ' ' + key + '="' + val + '"';
}, '');

var elementTemplate =  _.template('<${$elementName}${$attrs}>${$body}</${$elementName}>');

var elementModel = _.curry(function(elementName, elementAttrs, model){
    return _.assign({}, model, {
        '$body': model.$body,
        '$elementName': elementName,
        '$attrs': collapseToAttributes(_.pick(model, elementAttrs))
    });
});

var tag = function(elementName, elementAttrs){
    var modelMapper = elementModel(elementName, elementAttrs); // model -> model
    var tpl = _.compose(elementTemplate, modelMapper); // model -> string
    return core.applyTemplate(tpl);
};

exports.tag = tag;