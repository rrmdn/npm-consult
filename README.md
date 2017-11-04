# NPM Consult

Want to update your package's dependency but too tired to check the availability?

![npm consult demo](https://github.com/rromadhoni/npm-consult/raw/master/consult-demo.gif "npm consult demo")

## Running NPM Consult

Clone this project and then `cd` to the cloned directory. 

Run:

    $ npm install
    $ npm run dev

### Interactively

Run:

    $ npm start

### Using Arguments

Run:

    $ npm start -- update <package>@<version> [-p [package='package.json']]

*For testing, you can specify the package.json file for NPM Consult to
analyze the dependency graph, you can use the `-p <package-file>` options
for the `update` command, otherwise it will use the `package.json` file on 
the current active directory.

    $ npm start -- update react@15.6.0 -p example/package-example.json

## Contributing

You can contribute to this project by writing unit tests and extend the
feature of this project.

You can edit files inside the [src](src) directory, then compile using
`npm run dev`, or you can use watcher by running `npm run watch`.

