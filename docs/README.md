fivem-3d-text / [Exports](modules.md)

# Fivem 3D Text

A Javascript based package for 3D text helpers roughly based on the Lua package [motiontext](https://github.com/ThatZiv/motiontext).

In addition to the functions implemented this package implements a rudimentary [exponential backoff algorithm](https://en.wikipedia.org/wiki/Exponential_backoff) so that the client does not needlessly perform the distance logic over and over. It will instead try to update the retry interval based on the distance from the text coordinates. This should result in better performance by *only checking distance frequently when the player is close to the text coordinates* and otherwise increasing the retry interval when we are further away.

There may be some edge cases with very large or very small radii in which this has unexpected results.

# Installation

`npm install --save fivem-3d-text`

# Documentation

This package is developed in TypeScript. [Please see the full documentation here](./docs/index.html).

# Development

Prerequisites for development are node LTS.

To watch the code and reload file changes run `npm run watch`.

To build the final package with optimizations run `npm run build`.
