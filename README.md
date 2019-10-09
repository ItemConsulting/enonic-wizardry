# Enonic Wizardry

[![npm version](https://badge.fury.io/js/enonic-wizardry.svg)](https://badge.fury.io/js/enonic-wizardry)

Functional utility library for Enonic XP

## CLI

`xml-to-ts.js` is a command line utility that can generate TypeScript interfaces
for Sites, ContentTypes, Parts, and Pages from XML-files.

- Build it: `npm run build` or `npm run build:cli`
- Run it from the command line: `node bin/xml-to-ts.js my-xml-file.xml`

### Gradle

`xml-to-ts.js` can be run automatically as part of the`enonic project deploy`
process. First, add the dependency with `npm install enonic-wizardry`, and then
add a task to `build.gradle`, for example:

```groovy
task generateTypeScriptInterfaces( type: NodeTask, dependsOn: npmInstall ) {
    description = 'Generate TypeScript interfaces'
    environment = [ 'NODE_ENV': nodeEnvironment() ]
    args = [ '--project', '.', '--write-to-file' ]
    script = file( 'node_modules/enonic-wizardry/bin/xml-to-ts.js' )
}
```

To run the task as part of the deploy process, add it to the `jar` block:

```
jar {
  // ... other dependencies

  dependsOn += generateTypeScriptInterfaces

  // ...
}
```
