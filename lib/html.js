var core = require('./core');
var R = require('./ramda');

/* ----- TAG -------*/
var collapseToAttribute = function(result, pair){ return result + ' ' + pair[0] + '="' + pair[1] + '"'; };
var collapseToAttributes = R.compose(R.reduce(collapseToAttribute, ''), R.toPairs);

var elementTemplate = core.template('<{{$elementName}}{{$attrs}}>{{$body}}</{{$elementName}}>');

var elementModel = R.curry(function(elementName, elementAttrs, model){
    return R.merge(model, {
        '$body': model.$body,
        '$elementName': elementName,
        '$attrs': collapseToAttributes(R.pickAll(elementAttrs, model))
    });
});

var tag = function(elementName, elementAttrs){
    var modelMapper = elementModel(elementName, elementAttrs); // model -> model
    var tpl = R.compose(elementTemplate, modelMapper); // model -> string
    return core.applyTemplate(tpl);
};

exports.tag = tag;