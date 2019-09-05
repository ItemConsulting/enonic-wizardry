import * as fs from "fs";
import * as path from "path";
import * as xmldom from "xmldom";
const xpath = require("xpath");

/**
 * iface describes a TypeScript interface
 */
interface iface {
  name: string;
  fields: field[];
}

/**
 * field describes an object property
 */
interface field {
  name: string;
  type: string;
  comment?: string;
  optional: boolean;

  subfields?: field[];
}

/**
 * ifaceToTs formats an iface as a TypeScript interface
 * @param iface
 */
function ifaceToTs(iface: iface): string {
  return `export interface ${iface.name} {
${iface.fields.map(f => fieldfmt(f)).join("\n")}
};
`;
}

function fieldfmt(f: field, padding: string = "  "): string {
  const optional = f.optional ? "?" : "";
  const comment = f.comment ? ` // ${f.comment}` : "";
  const subfields =
    f.subfields && f.subfields.length > 0
      ? `<{
${f.subfields.map(f => fieldfmt(f, padding + "  ")).join("\n")}
${padding}}>`
      : "";
  return `${padding}${f.name}${optional}: ${f.type}${subfields}${comment}`;
}

/**
 * xmlToIface parses an xml-file and returns an iface
 * @param name the name of the interface
 * @param xml
 */
function xmlToIface(name: string, xml: string): iface {
  const iface: iface = {
    name,
    fields: []
  };
  const doc = new xmldom.DOMParser().parseFromString(xml);
  const form = xpath
    .evaluate("//form", doc, null, xpath.XPathResult.ANY_TYPE, null)
    .iterateNext();
  iface.fields.push(...getInputFields(form));
  iface.fields.push(...getFieldSetItems(form));
  iface.fields.push(...getItemSetFields(form));
  return iface;
}

function getInputFields(node): field[] {
  const fields = [];
  const inputs = xpath.evaluate(
    "./input",
    node,
    null,
    xpath.XPathResult.ANY_TYPE,
    null
  );
  let input: XPathResult = null;
  while ((input = inputs.iterateNext())) {
    fields.push(createFieldFromInput(input));
  }
  return fields;
}

// FieldSet is a flat structure with no nesting.
function getFieldSetItems(node): field[] {
  const fields = [];
  const fieldSets = xpath.evaluate(
    "./field-set",
    node,
    null,
    xpath.XPathResult.ANY_TYPE,
    null
  );

  let fieldSet = null;
  while ((fieldSet = fieldSets.iterateNext())) {
    const items = xpath
      .evaluate("./items", fieldSet, null, xpath.XPathResult.ANY_TYPE, null)
      .iterateNext();
    const inputs = xpath.evaluate(
      "./input",
      items,
      null,
      xpath.XPathResult.ANY_TYPE,
      null
    );

    let input = null;
    while ((input = inputs.iterateNext())) {
      fields.push(createFieldFromInput(input));
    }
  }
  return fields;
}

// ItemSet is a nested structure.
function getItemSetFields(node): field[] {
  const fields = [];
  const itemSets = xpath.evaluate(
    "./item-set",
    node,
    null,
    xpath.XPathResult.ANY_TYPE,
    null
  );

  let itemSet = null;
  while ((itemSet = itemSets.iterateNext())) {
    const name = xpath.select1("@name", itemSet).value;
    const optional =
      xpath.select1("./occurrences/@minimum", itemSet).value == 0;

    const items = xpath
      .evaluate("./items", itemSet, null, xpath.XPathResult.ANY_TYPE, null)
      .iterateNext();
    const subfields = [
      ...getInputFields(items),
      ...getFieldSetItems(items),
      ...getItemSetFields(items)
    ];

    fields.push({ name, type: "Array", optional, subfields });
  }
  return fields;
}

/**
 * Create a field from an <input> node.
 * @param input an xpath input node
 */
function createFieldFromInput(input): field {
  const name = xpath.select1("@name", input).value;
  const comment = xpath.select1("string(./label)", input);
  const optional = xpath.select1("./occurrences/@minimum", input).value == 0;
  const type = "string";
  return { name, type, comment, optional };
}

/**
 * xmlToTs reads an xml file and returns a typescript-string.
 * @param filename
 */
function xmlToTs(filename: string): string {
  filename = path.basename(filename);
  const xml = fs.readFileSync(filename, "utf-8");
  const ifaceName = toPascalCase(
    filename.substring(0, filename.lastIndexOf("."))
  );
  const iface = xmlToIface(ifaceName, xml);
  return ifaceToTs(iface);
}

/**
 * toPascalCase converts a string to PascalCase.
 */
function toPascalCase(str: string): string {
  return str
    .replace(/_/g, "-") // Prevent \w from matching _
    .replace(/(\w)(\w*)/g, (...args) => args[1].toUpperCase() + args[2])
    .replace(/[- ]/g, "");
}

function openTsFile(filename: string, flags: string): number {
  filename = filename.substring(0, filename.lastIndexOf(".")) + ".ts";
  return fs.openSync(filename, flags);
}

// checks params for flag and mutates argv
function shouldWriteToFile(argv: string[]): boolean {
  const writeToFile = argv.indexOf("--write-to-file");
  if (writeToFile < 1) {
    return false;
  }
  argv.splice(writeToFile, 1);
  return true;
}

// show help if flag is set
function showHelp(argv: string[]) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(usage());
    process.exit(1);
  }
}

function command(argv: string[]) {
  showHelp(argv);
  const writeToFile = shouldWriteToFile(argv);

  if (argv.length < 3) {
    console.error(usage());
    process.exit(1);
  }

  for (const filename of argv.slice(2)) {
    const ts = xmlToTs(filename);
    let buf = Buffer.from(ts, "utf8");

    let output = !writeToFile ? 1 : openTsFile(filename, "w+"); // Write to stdout by default.
    fs.writeSync(output, buf);
    if (writeToFile) {
      fs.closeSync(output);
    }
  }
}

function usage() {
  return `Usage: cmd [flags] xmlfile ...

Flags:
  --write-to-file     write the file to a .ts file of the same name
`;
}

command(process.argv);
