# Development

General overview:

- A custom build script `build.mjs` builds the project
- Source code is written in TypeScript
- TS is Compiled and bundled with Rollup
- Styles are written in plain CSS
- CSS is minified and injected into the output bundle during build
- Bundle is minified aggressively with Terser

Stylistically the code is designed to reduce file size:

- The code avoids classes, instead opting for simple objects. This allows better minification and space savings from not using `this`
- The code occasionally aliases builtin objects and methods, e.g. `window.addeventlistener`, `console.log`, etc.
- Prefer `let` over `const`
- Prefer arrow functions

## Usage

To build the project, first install all dev-dependencies:

```
npm install
```

The build system is found within **build.mjs**. It has three stages:

1. Compile Typescript and bundle modules
2. Minify CSS and inject into bundle
3. Minify bundle

After each stage is completed, a resulting file is outputted to the build directory.

The build system accepts the following commands

```shell
# Build stage 1, stage 2, and stage 3
npm run build
# Build stage 1, and stage 2
npm run build-dev
# Clean build directory
npm run clean
```
