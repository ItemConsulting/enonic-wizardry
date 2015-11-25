var core = require('./core');

var panelTemplate = core.template('<div class="panel panel-default" id="{{id}}">' +
    '<div class="panel-heading"><h3 class="panel-title">{{title}}</h3></div>' +
    '<div class="panel-body">{{$body}}</div>' +
'</div>');

exports.panel = core.applyTemplate(panelTemplate);