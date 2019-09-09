import * as xmldom from "xmldom";
import { evaluate, mapXpathResult, flatmapXpathResult } from "./xpathutils";
const xpath = require("xpath");

/**
 * createInterface parses an xml string and generates code for a TypeScript interface.
 */
export function createInterface(interfaceName: string, xml: string): string {
  return interfacefmt(parseXML(interfaceName, xml));
}

export interface GeneratedInterface {
  name: string;
  fields: GeneratedField[];
}

export interface GeneratedField {
  name: string;
  type: string;
  comment?: string;
  optional: boolean;

  subfields?: GeneratedField[];
}

function interfacefmt(iface: GeneratedInterface): string {
  const fields = iface.fields.map(f => fieldfmt(f)).join("\n");
  return `export interface ${iface.name} {\n${fields}\n};\n`;
}

function fieldfmt(f: GeneratedField, indentation: string = "  "): string {
  const optional = f.optional ? "?" : "";
  const comment = f.comment ? commentfmt(f.comment, indentation) : "";
  const subfields =
    f.subfields && f.subfields.length > 0
      ? `<{
${f.subfields.map(f => fieldfmt(f, indentation + "  ")).join("\n")}
${indentation}}>`
      : "";
  return `${comment}${indentation}${f.name}${optional}: ${f.type}${subfields}`;
}

function commentfmt(comment: string, indentation: string): string {
  comment = comment.replace("\n", `\n${indentation} * `);
  return (
    `\n` +
    `${indentation}/**\n` +
    `${indentation} * ${comment}\n` +
    `${indentation} */\n`
  );
}

export function parseXML(name: string, xml: string): GeneratedInterface {
  const doc = new xmldom.DOMParser().parseFromString(xml);
  const form: Node = evaluate("//form", doc).iterateNext();
  return {
    name,
    fields: [
      ...getInputFields(form),
      ...getFieldSetItems(form),
      ...getItemSetFields(form)
    ]
  };
}

function getInputFields(node: Node): GeneratedField[] {
  const inputs = evaluate("./input", node);
  return mapXpathResult(inputs, createFieldFromInput);
}

// FieldSet is a flat structure with no nesting.
function getFieldSetItems(node: Node): GeneratedField[] {
  const fieldSets = evaluate("./field-set", node);
  return flatmapXpathResult(fieldSets, (node: Node): GeneratedField[] =>
    mapXpathResult(evaluate("./items/input", node), createFieldFromInput)
  );
}

// ItemSet is a nested structure.
function getItemSetFields(node: Node): GeneratedField[] {
  const itemSets = evaluate("./item-set", node);

  return mapXpathResult(
    itemSets,
    (node: Node): GeneratedField => {
      const nameAttr = xpath.select1("@name", node);
      const minimumOccurrencesAttr = xpath.select1(
        "./occurrences/@minimum",
        node
      );

      const name = nameAttr ? nameAttr.value : "invalidName";
      const type = "Array";
      const optional = minimumOccurrencesAttr
        ? minimumOccurrencesAttr.value == 0
        : true;

      const items = evaluate("./items", node).iterateNext();
      const subfields = [
        ...getInputFields(items),
        ...getFieldSetItems(items),
        ...getItemSetFields(items)
      ];

      return { name, type, optional, subfields };
    }
  );
}

function createFieldFromInput(input: Node): GeneratedField {
  const nameAttr = xpath.select1("@name", input);
  const minimumOccurrencesAttr = xpath.select1("./occurrences/@minimum", input);

  const name = nameAttr ? nameAttr.value : "invalidName";
  const comment = xpath.select1("string(./label)", input);
  const optional = minimumOccurrencesAttr
    ? minimumOccurrencesAttr.value == 0
    : true;
  const type = "string";
  return { name, type, comment, optional };
}
