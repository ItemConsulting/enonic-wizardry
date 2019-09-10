import { pascalCase } from "change-case";
import * as commander from "commander";
import * as fs from "fs";
import * as path from "path";
import * as xmltools from "./src/xmltools";

const STDOUT_FILENO = 1; // standard output file descriptor

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

// XML-files in these directories will generate TypeScript interfaces when
// using the --enonic-xml flag.
const directories = [
  "./src/main/resources/site/site.xml",
  "./src/main/resources/site/content-types",
  "./src/main/resources/site/parts",
  "./src/main/resources/site/pages"
];

function getEnonicXmlFiles() {
  const files = [];
  for (let dir of directories) {
    dir = path.resolve(dir);
    if (!fs.existsSync(dir)) {
      continue;
    }

    const stat = fs.statSync(dir);
    if (stat.isFile()) {
      files.push(dir);
    } else if (stat.isDirectory()) {
      files.push(...fs.readdirSync(dir).map(filename => dir + filename));
    }
  }
  return files;
}

function exit(message: string) {
  console.error(message);
  process.exit(1);
}

function command(argv: string[]) {
  const cmd = new commander.Command();

  cmd
    .option("--enonic-xml", "Use the default Enonic XML-files")
    .option("--write-to-file", "Write to .ts files instead of to stdout")
    .command("<cmd> [options] [files...]");

  cmd.parse(argv);

  const writeToFile = cmd.writeToFile === true;

  const files = cmd.enonicXml ? getEnonicXmlFiles() : cmd.args;
  if (files.length === 0) {
    exit("No files");
  }

  const notFiles = files.filter(f => !fs.existsSync(f));
  if (notFiles.length > 0) {
    const fileList = notFiles.map(f => `  - ${f}`).join("\n");
    exit(`Files do not exist: \n${fileList}`);
  }

  for (const filename of files) {
    try {
      const ts = generateInterface(filename);
      const buf = Buffer.from(ts, "utf8");

      const output = !writeToFile ? STDOUT_FILENO : openTsFile(filename, "w+");
      fs.writeSync(output, buf);
      if (writeToFile) {
        fs.closeSync(output);
      }
    } catch (err) {
      if (err === xmltools.MissingFieldNameError) {
        exit(`${filename}: ${err}`);
      }
      throw err;
    }
  }
}

command(process.argv);
