import { pascalCase } from "change-case";
import * as path from "path";
import * as xmldom from "xmldom";
import { evaluate, flatmapXpathResult, mapXpathResult } from "./xpathutils";
const xpath = require("xpath");

export const MissingFieldNameError = "A field is missing a name attribute";

/**
 * createInterface parses an xml string and generates code for a TypeScript interface.
 */
export function createInterface(interfaceName: string, xml: string): string {
  return formatInterface(parseXML(interfaceName, xml));
}

/**
 * generateInterfaceName generates a name for a TypeScript interface from a filename.
 * @param filename
 */
export function generateInterfaceName(filename: string): string {
  return pascalCase(path.basename(filename, path.extname(filename)));
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

function formatInterface(iface: GeneratedInterface): string {
  const fields = iface.fields.map(f => formatField(f)).join("\n\n");
  return `export interface ${iface.name} {\n${fields}\n};\n`;
}

function formatField(
  field: GeneratedField,
  indentation: string = "  "
): string {
  const optional = field.optional ? "?" : "";
  const comment = field.comment
    ? formatComment(field.comment, indentation)
    : "";
  const subfields =
    field.subfields && field.subfields.length > 0
      ? `<{
${field.subfields.map(f => formatField(f, indentation + "  ")).join("\n\n")}
${indentation}}>`
      : "";
  return `${comment}${indentation}${field.name}${optional}: ${field.type}${subfields}`;
}

function formatComment(comment: string, indentation: string): string {
  comment = comment.replace("\n", `\n${indentation} * `);
  return (
    `${indentation}/**\n` +
    `${indentation} * ${comment}\n` +
    `${indentation} */\n`
  );
}

export function parseXML(name: string, xml: string): GeneratedInterface {
  const doc = new xmldom.DOMParser().parseFromString(xml);
  const form: Node = evaluate("//form", doc).iterateNext();
  return { name, fields: parseForm(form) };
}

function parseForm(form: Node): GeneratedField[] {
  if (!form) {
    return [];
  }
  return [
    ...getInputFields(form),
    ...getFieldSetItems(form),
    ...getItemSetFields(form)
  ];
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

      const name = nameAttr.value;
      const type = "Array";
      const optional = minimumOccurrencesAttr
        ? minimumOccurrencesAttr.value === "0"
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
  if (!nameAttr) {
    throw MissingFieldNameError;
  }

  const minimumOccurrencesAttr = xpath.select1("./occurrences/@minimum", input);

  const name = nameAttr.value;
  const comment = xpath.select1("string(./label)", input);
  const optional = minimumOccurrencesAttr
    ? minimumOccurrencesAttr.value === "0"
    : true;
  const type = "string";
  return { name, type, comment, optional };
}
