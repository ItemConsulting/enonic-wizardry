import * as fs from "fs";
import { pascalCase } from "change-case";
import * as path from "path";
import * as xmltools from "./src/xmltools";

export function generateInterface(filename: string): string {
  const interfaceName = path.basename(
    pascalCase(filename.substring(0, filename.lastIndexOf(".")))
  );
  const xml = fs.readFileSync(filename, "utf-8");
  return xmltools.createInterface(interfaceName, xml);
}

function openTsFile(filename: string, flags: string): number {
  filename = filename.substring(0, filename.lastIndexOf(".")) + ".ts";
  return fs.openSync(filename, flags);
}

// checks params for flag and mutates argv
function shouldWriteToFile(argv: string[]): boolean {
  const argIndex = argv.indexOf("--write-to-file");
  if (argIndex === -1) {
    return false;
  }
  argv.splice(argIndex, 1);
  return true;
}

// show help if flag is set
function showHelp(argv: string[]) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.error(usage);
    process.exit(1);
  }
}

function command(argv: string[]) {
  showHelp(argv);
  const writeToFile = shouldWriteToFile(argv);

  if (argv.length < 3) {
    console.error(usage);
    process.exit(1);
  }

  for (const filename of argv.slice(2)) {
    const ts = generateInterface(filename);
    let buf = Buffer.from(ts, "utf8");

    let output = !writeToFile ? 1 : openTsFile(filename, "w+"); // Write to stdout by default.
    fs.writeSync(output, buf);
    if (writeToFile) {
      fs.closeSync(output);
    }
  }
}

const usage = `Usage: cmd [flags] xmlfile ...

Flags:
  --write-to-file     write the file to a .ts file of the same name
`;

command(process.argv);
