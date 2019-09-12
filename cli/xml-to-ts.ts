import * as commander from "commander";
import { flatten } from "fp-ts/lib/Array";
import * as fs from "fs";
import * as path from "path";
import * as xmltools from "./src/xmltools";

const STDOUT_FILENO = 1; // standard output file descriptor

function generateInterface(xmlFilename: string, tsFilename: string) {
  const interfaceName = xmltools.generateInterfaceName(tsFilename);
  const xml = fs.readFileSync(xmlFilename, "utf-8");
  return xmltools.createInterface(interfaceName, xml);
}

// map<directory, suffix>
const directorySuffix : {[key: string]: string} = {
  parts: "-part-config",
  pages: "-page-config",
  site: "-config"
};

// tries to avoid conflicting filenames
function getTsFilename(filename: string): string {
  const dirname = path.dirname(filename);
  const basename = path.basename(filename, path.extname(filename));

  const closestDir = path
    .dirname(filename)
    .split(path.sep)
    .reverse()
    .slice(0, 2)
    .find(p => directorySuffix[p]);
  const suffix = directorySuffix[closestDir] || "";

  return `${dirname}/${basename}${suffix}.ts`;
}

// XML-files in these directories will generate TypeScript interfaces when
// using the --enonic-xml flag.
const directories = [
  "src/main/resources/site/site.xml",
  "src/main/resources/site/content-types",
  "src/main/resources/site/parts",
  "src/main/resources/site/pages"
];

function getEnonicXmlFiles(projectRootDir: string): string[] {
  const files = [];
  const dirs = directories.map(dir => path.join(projectRootDir, dir));
  for (let dir of dirs) {
    dir = path.resolve(dir);
    if (!fs.existsSync(dir)) {
      continue;
    }

    const stat = fs.statSync(dir);
    if (stat.isFile()) {
      files.push(dir);
    } else if (stat.isDirectory()) {
      files.push(...listXmlFiles(dir));
    }
  }
  return files;
}

function listXmlFiles(dir: string): string[] {
  return listFiles(dir).filter(f => path.extname(f) === ".xml");
}

function listFiles(dir: string): string[] {
  const dirContents = fs.readdirSync(dir);
  const files = dirContents
    .map(f => path.join(dir, f))
    .filter(f => fs.statSync(f).isFile());
  const subdirFiles = dirContents
    .map(f => path.join(dir, f))
    .filter(f => fs.statSync(f).isDirectory())
    .map(listFiles);
  return [...files, ...flatten(subdirFiles)];
}

function exit(message: string) {
  console.error(message);
  process.exit(1);
}

function command(argv: string[]) {
  const cmd = new commander.Command();

  cmd
    .option(
      "--project <dir>",
      "Generate all xml files for the specified Enonic project"
    )
    .option("--write-to-file", "Write to .ts files instead of to stdout")
    .option("-v|--verbose")
    .command("<cmd> [options] [files...]");

  cmd.parse(argv);

  const writeToFile = cmd.writeToFile === true;

  const files = cmd.project ? getEnonicXmlFiles(cmd.project) : cmd.args;
  if (files.length === 0) {
    exit("No files");
  }

  const notFiles = files.filter(f => !fs.existsSync(f));
  if (notFiles.length > 0) {
    const fileList = notFiles.map(f => `  - ${f}`).join("\n");
    exit(`Files do not exist: \n${fileList}`);
  }

  for (const xmlFilename of files) {
    if (cmd.verbose) {
      console.error(xmlFilename);
    }
    try {
      const tsFilename = cmd.project
        ? getTsFilename(xmlFilename)
        : path.basename(xmlFilename, path.extname(xmlFilename)) + ".ts";

      const ts = generateInterface(xmlFilename, tsFilename);
      const buf = Buffer.from(ts, "utf8");

      const output = !writeToFile
        ? STDOUT_FILENO
        : fs.openSync(tsFilename, "w+");
      fs.writeSync(output, buf);
      if (writeToFile) {
        fs.closeSync(output);
      }
    } catch (err) {
      if (err === xmltools.MissingFieldNameError) {
        exit(`${xmlFilename}: ${err}`);
      }
      throw err;
    }
  }
}

command(process.argv);
