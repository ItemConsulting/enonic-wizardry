"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var xmldom = require("xmldom");
var xpath = require("xpath");
/**
 * createInterface parses an xml string and generates code for a TypeScript interface.
 */
function createInterface(interfaceName, xml) {
    // TODO: Catch exceptions or just let it throw?
    return interfacefmt(parseXML(interfaceName, xml));
}
exports.createInterface = createInterface;
function interfacefmt(iface) {
    var fields = iface.fields.map(function (f) { return fieldfmt(f); }).join("\n");
    return "export interface " + iface.name + " {\n" + fields + "\n};\n";
}
function fieldfmt(f, indentation) {
    if (indentation === void 0) { indentation = "  "; }
    var optional = f.optional ? "?" : "";
    var comment = f.comment ? " // " + f.comment : "";
    var subfields = f.subfields && f.subfields.length > 0
        ? "<{\n" + f.subfields.map(function (f) { return fieldfmt(f, indentation + "  "); }).join("\n") + "\n" + indentation + "}>"
        : "";
    return "" + indentation + f.name + optional + ": " + f.type + subfields + comment;
}
function evaluate(xpathExpression, contextNode) {
    return xpath.evaluate(xpathExpression, contextNode, null, xpath.XPathResult.ANY_TYPE, null);
}
function parseXML(name, xml) {
    var doc = new xmldom.DOMParser().parseFromString(xml);
    var form = evaluate("//form", doc).iterateNext();
    return {
        name: name,
        fields: __spreadArrays(getInputFields(form), getFieldSetItems(form), getItemSetFields(form))
    };
}
function getInputFields(node) {
    var fields = [];
    var inputs = evaluate("./input", node);
    var input = null;
    while ((input = inputs.iterateNext())) {
        fields.push(createFieldFromInput(input));
    }
    return fields;
}
// FieldSet is a flat structure with no nesting.
function getFieldSetItems(node) {
    var fields = [];
    var fieldSets = evaluate("./field-set", node);
    var fieldSet = null;
    while ((fieldSet = fieldSets.iterateNext())) {
        var items = evaluate("./items", fieldSet).iterateNext();
        var inputs = xpath.evaluate("./input", items);
        var input = null;
        while ((input = inputs.iterateNext())) {
            fields.push(createFieldFromInput(input));
        }
    }
    return fields;
}
// ItemSet is a nested structure.
function getItemSetFields(node) {
    var fields = [];
    var itemSets = evaluate("./item-set", node);
    var itemSet = null;
    while ((itemSet = itemSets.iterateNext())) {
        var name_1 = xpath.select1("@name", itemSet).value;
        var optional = xpath.select1("./occurrences/@minimum", itemSet).value == 0;
        var items = evaluate("./items", itemSet).iterateNext();
        var subfields = __spreadArrays(getInputFields(items), getFieldSetItems(items), getItemSetFields(items));
        fields.push({ name: name_1, type: "Array", optional: optional, subfields: subfields });
    }
    return fields;
}
function createFieldFromInput(input) {
    var name = xpath.select1("@name", input).value;
    var comment = xpath.select1("string(./label)", input);
    var optional = xpath.select1("./occurrences/@minimum", input).value == 0;
    var type = "string";
    return { name: name, type: type, comment: comment, optional: optional };
}
