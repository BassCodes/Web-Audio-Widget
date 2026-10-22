# Web Audio Widget (Waw)

A lightweight web widget to replace the standard `<audio>`. Gracefully degrades when used without JavaScript.

Features:

- Self contained single script file. No stylesheets or media needed.
- Single-track and Multi-track player variants.
- Themeable with simple CSS variables
- Keyboard/OS media actions support (next track, previous track, etc.)
- Designed to be easy to setup for anyone with basic HTML knowledge. No JavaScript wizardry needed.
- Small filesize, ~10KiB
- Works without javascript. Following [progressive enhancement](https://www.gov.uk/service-manual/technology/using-progressive-enhancement)

## Usage

To add the player to your pages, it's as simple as downloading the script to a folder on your site called "scripts", then adding the following to your HTML head:

```HTML
<head>
<!-- ... -->
<script src="waw.min.js"></script>
<!-- ... -->
</head>
```

## Single Tracks

To make a player for a single audio track, the following HTML is used:

```HTML
<figure data-waw>
    <figcaption>Song 1</figcaption>
    <audio controls src="track.mp3"></audio>
</figure>
```

Notice the following requirements:

- It is all contained in a \<figure>
- The figure has the custom `data-waw` attribute
- The track's title is within the \<figcaption>
- The audio element has the `controls` attribute

Failing any of these requirements, the player will not show up. Helpful error messages are outputted to the developer console (Press F12) to help diagnose issues.

Additionally, additional metadata can be added to the HTML:

- The figure can have the custom `data-waw-album="Album Name"` attribute.
- The figure can have the custom `data-waw-artist="Artist name"` attribute.

This metadata is not shown on the page itself, but given to the Operating System and web browser.

## Multi Track Albums

To make a player for a multiple tracks (an album), the following HTML is used:

```HTML
<figure data-waw>
	<ol>
		<li>
			Track Title
			<audio controls src="track1.mp3"></audio>
		</li>
		<li>
			Second Track Title
			<audio controls src="track2.mp3"></audio>
		</li>
		<li>
			Third Track Title
			<audio controls src="track3.mp3"></audio>
		</li>
	</ol>
</figure>
```

Notice the following requirements:

- It is all contained in a `<figure>`
- The figure has the custom `data-waw` attribute
- The figure contains an `<ol>` which, in turn, contains many `<li>`
- Each `<li>` represents a track and contains text (title) and an `<audio>` element
- The audio element has the `controls` attribute

Additionally, additional metadata can be added to the HTML:

- The figure can have the custom `data-waw-album="Album Name"` attribute.
- The figure can have the custom `data-waw-artist="Artist name"` attribute.
- Each individual `<audio>` element can have both `data-waw-album` and `data-waw-artist`

This metadata is not shown on the page itself, but given to the Operating System and web browser.

When an individual track's `<audio>` element has metadata specified for it, the track's metadata will override the album's.

## Styling

To change the appearance of the player it's as simple as adding a bit more the document head.

For example, if I wanted a hotdog themed player:

- brown borders,
- red progress bar foreground color,
- yellow progress bar background color, and
- Times new roman font

It's as simple as updating the document as follows

```html
<head>
	<!-- ... -->
	<script src="waw.min.js"></script>
	<style>
		:root {
			--waw-font: "Times";
			--waw-color-text-primary: black;
			--waw-color-text-secondary: gray;
			--waw-color-play-bar-foreground: red;
			--waw-color-play-bar-background: yellow;
			--waw-color-border: brown;
			--waw-color-button: red;
			--waw-color-button-background: yellow;
			--waw-color-button-hover: orange;
		}
	</style>
	<!-- ... -->
</head>
```

All default values are shown below:

```css
:root {
	--waw-font: "sans-serif";
	/* Font size for timer, falls back to "--waw-font" if not set. */
	--waw-font-timer: "sans-serif";
	/* Minimum and maximum for track title */
	--waw-width-text-min: 30ch;
	--waw-width-text-max: 50ch;
	/* Text color for track titles */
	--waw-color-text-primary: black;
	/* Text color for timer & status */
	--waw-color-text-secondary: gray;
	--waw-color-play-bar-foreground: gray;
	--waw-color-play-bar-background: #d3d3d3;
	--waw-color-border: lightgray;
	--waw-color-button: black;
	--waw-color-button-background: unset;
	--waw-color-button-hover: #d0d0d04d;
}
```

2.0
