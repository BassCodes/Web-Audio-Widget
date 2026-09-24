# Development

- [General Description](#general-description)
- [Build System](#build-system)

## General Description

The project is written in TypeScript. Typescript modules are compiled and bundled using [Rollup](https://rollupjs.org/). A custom build script (build.mjs) is used to minify CSS and inject it into the compiled bundle. As a final step [Terser](https://terser.org/) is used to reduce bundle size even further.

Many choices in this project have been to reduce the bundle size. In the current year of 2024, it truly doesn't matter (in most cases) if your page is 2MiB or 2KiB, it loads just the same. Consider the practices listed in this document an exercise in creating a small script.

The other goals are as follows

- Graceful degradation when script fails to load (blocked, error, etc.)
- Clean simple interface
- Semantic Markup
- Accessible (need help with this one)

## Build System

The build system found within **build.mjs** is in essence very similar to a UNIX makefile; it contains a simple sequence of steps.

The build system has three stages:

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
