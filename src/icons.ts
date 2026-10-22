// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2024
// modified : 2026-09-30

import { el } from "./util";

// Originally, each individual namespaced svg element and attribute was added to create the play and pause buttons.
// This took up a considerable amount of the file size, so they have been condensed into a few hacky hand-optimized lines.
//
// More traditionally, one might have these icons requested over the network, but that's a point of failure, and is much more hassle.

// Detect whether the client is in dark mode. The color scheme of the player is pretty good in most configurations, except for the play and pause icons.
// The `dark` constant is used to make the icons lighter when dark mode is on.

let svgPre = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1 1" width="20"><`;
let svgPost = " /></svg>";
// The slimmest way of creating unique svg objects from a string I could find.
// Unique objects are required to prevent extra characters being used to clone a reference each time an icon is used.
let svgFromText = (input: string): SVGElement => {
	let svgCreationContainer = el("div").fin();
	// The input must be valid svg or else this code is unsafe.
	svgCreationContainer.innerHTML = svgPre + input + svgPost;
	return svgCreationContainer.firstChild as SVGElement;
};

export let playButton = (): SVGElement => svgFromText(`polygon points="0,0 0,1 1,0.5"`);

export let pauseButton = (): SVGElement =>
	svgFromText(`rect width="0.4" height="1" /><rect width="0.4" x="0.60" height="1"`);
export let nextTrack = (): SVGElement =>
	svgFromText(`polygon points="0,0.1 0,0.9 0.5,0.5 0.5,0.9 1,0.5 0.5,0.1 0.5,0.5"`);
export let previousTrack = (): SVGElement =>
	svgFromText(`polygon points="1,0.1 1,0.9 0.5,0.5 0.5,0.9 0,0.5 0.5,0.1 0.5,0.5"`);
export let errorButton = (): SVGElement =>
	svgFromText(
		`rect width="0.3" height="0.2" x="0.35" y="0.8" /><rect width="0.3" x="0.35" height="0.6"`
	);
