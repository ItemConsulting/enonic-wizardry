var R = require('./ramda');


/* -------- RETURN AS --------- */
var as = R.curry(function(contentType, body){
    return {
        contentType: contentType,
        body: body
    }
});

var extractBody = function(model){
    if(R.has('$body', model)){
        return R.prop('$body', model);
    } else {
        return model;
    }
};

/* -------- TEMPLATING --------- */
var left = function (len, input){ return input.substr(0, len); };
var rest = function (pos, input){ return input.substr(pos); };

var template = R.curry(function (tpl, model) {
    // format is {{ name }}
    var re = /\{\{\s*(.+?)\s*\}\}/;
    var output = tpl;
    var result = re.exec(output);

    while(result) {
        var len = result[0].length; // length of match found
        var pos = result.index; // where the match is found
        var name = result[1]; // matched property name

        // replace matched string with value of property from data
        output = left(pos, output) + ((name && model[name]) || '') + rest(pos + len, output);

        // search again
        result = re.exec(output);
    }

    return output;
});

var applyAndAssign = R.curry(function(f, model){
    return R.merge(model, f(model));
});

var applyTemplate = function(f){
    var mapper = R.compose(R.objOf('$body'), f);
    return applyAndAssign(mapper);
};

var mapper = R.curry(function(mapping, model){
    return R.map(mapping, function(path){
        var arr = R.isArrayLike(path) ? path : path.split('/');
        return R.path(arr, model); // path
    });
});

exports.template = template;
exports.applyTemplate = applyTemplate;
exports.mapper = mapper;
exports.asHtml = R.compose(as('text/html'), extractBody);
exports.asJson = as('application/json');
