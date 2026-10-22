// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2024-05-12
// modified : 2026-10-21

// Extract audio album & track metadata from document and inject custom player in their places.

let LOG_UNABLE_TO_READ = "Waw: Unable to read";
let STR_AUDIO = "<AUDIO>";
import {
	IAudioTrack,
	IAudioPlayer,
	newAudioPlayer,
	IAlbumMeta,
	ITrackMeta,
} from "./player";
import { CONSOLE_ERROR, CONSOLE_WARN, GET_ATTRIBUTE } from "./util";

let readAlbumTrack = (figure: HTMLElement, li: HTMLElement): undefined | IAudioTrack => {
	let adjacent_text: string = "";
	let audio: HTMLAudioElement | null = null;

	for (let ch of li.childNodes) {
		let node_name = ch.nodeName;
		if (node_name === "#text") {
			adjacent_text = (adjacent_text ?? "") + ch.textContent?.trim();
		} else if (node_name === "#comment") {
			continue;
		} else if (node_name === "AUDIO") {
			if (audio !== null) {
				CONSOLE_ERROR(
					LOG_UNABLE_TO_READ,
					" album",
					figure,
					`multiple ${STR_AUDIO} inside a <LI>`,
					li
				);
				return;
			}
			audio = ch as HTMLAudioElement;
		} else {
			CONSOLE_ERROR(
				LOG_UNABLE_TO_READ,
				" album",
				figure,
				"Unknown element: ",
				ch,
				`Expected ${STR_AUDIO} or #text`
			);
			return;
		}
	}

	if (!audio) {
		CONSOLE_ERROR(
			LOG_UNABLE_TO_READ,
			" album",
			figure,
			"list item <LI>",
			li,
			"is missing ${STR_AUDIO}"
		);
		return;
	}
	if (audio.src === "") {
		CONSOLE_ERROR(
			LOG_UNABLE_TO_READ,
			" album ",
			figure,
			`${STR_AUDIO} has no 'src=...' attribute`,
			audio
		);
		return;
	}
	if (GET_ATTRIBUTE(audio, "controls") === null) {
		CONSOLE_ERROR(
			LOG_UNABLE_TO_READ,
			" album ",
			figure,
			`${STR_AUDIO} has no 'controls' attribute`,
			audio
		);
		return;
	}

	let title = adjacent_text;

	if (title === "") {
		CONSOLE_WARN(
			"Waw: Audio track ",
			audio,
			" does not have an accompanying adjacent '#text' node title. Using filename instead."
		);
		title = audio.src;
	}

	let album = GET_ATTRIBUTE(figure, "data-waw-album") ?? undefined;
	let artist = GET_ATTRIBUTE(figure, "data-waw-artist") ?? undefined;

	return { a: audio, meta: { title, album, artist } };
};

let readAlbumList = (
	figure: HTMLElement,
	ol: HTMLElement
): undefined | Array<IAudioTrack> => {
	let lis: Array<HTMLElement> = [];
	for (let ch of ol.childNodes) {
		let node_name = ch.nodeName;
		if (node_name === "LI") {
			lis.push(ch as HTMLElement);
		} else if (
			node_name === "#comment" ||
			(node_name === "#text" && ch.textContent?.trim() === "")
		) {
			continue;
		} else {
			CONSOLE_ERROR(
				LOG_UNABLE_TO_READ,
				" album ",
				figure,
				" track list <OL> contained element other than <LI>. Got:",
				ch
			);
			return;
		}
	}
	if (lis.length === 0) {
		CONSOLE_ERROR(
			LOG_UNABLE_TO_READ,
			" album ",
			figure,
			" track list <OL> contains no <LI>s",
			ol
		);
		return;
	}
	let tracks: Array<IAudioTrack> = [];

	for (let li of lis) {
		let tr = readAlbumTrack(figure, li);
		if (tr) {
			tracks.push(tr);
		} else {
			return;
		}
	}

	return tracks;
};

let readTrackAudioMeta = (
	figure: HTMLElement,
	audio: HTMLAudioElement,
	caption: undefined | string
): ITrackMeta | undefined => {
	let title = caption;
	if (title === undefined) {
		CONSOLE_WARN(
			"Waw: Audio track ",
			audio,
			" does not have an accompanying <FIGCAPTION> title. Using filename instead."
		);
		title = audio.src;
	}
	if (audio.src === "") {
		CONSOLE_ERROR(
			LOG_UNABLE_TO_READ,
			" album",
			figure,
			`${STR_AUDIO} has no 'src=...' attribute`,
			audio
		);
		return;
	}
	if (GET_ATTRIBUTE(audio, "controls") === null) {
		CONSOLE_ERROR(
			LOG_UNABLE_TO_READ,
			" album",
			figure,
			"${STR_AUDIO} has no 'controls' attribute",
			audio
		);
		return;
	}
	let album = GET_ATTRIBUTE(audio, "data-waw-album") ?? undefined;
	let artist = GET_ATTRIBUTE(audio, "data-waw-artist") ?? undefined;

	return { title, album, artist };
};

let readFigure = (figure: HTMLElement): IAudioPlayer | undefined => {
	let caption = null;
	let ol = null;
	let audio: HTMLAudioElement | null = null;
	for (let ch of figure.childNodes) {
		let node_name = ch.nodeName;
		if (
			node_name === "#comment" ||
			(node_name === "#text" && ch.textContent?.trim() === "")
		) {
			continue;
		}
		if (node_name === "FIGCAPTION") {
			if (caption != null) {
				CONSOLE_ERROR(
					LOG_UNABLE_TO_READ,
					figure,
					". Got both list <OL> (",
					ol,
					`), and ${STR_AUDIO} (`,
					ch,
					") in one figure."
				);
				return;
			}
			caption = ch;
		} else if (node_name === "AUDIO") {
			if (ol !== null) {
				CONSOLE_ERROR(
					LOG_UNABLE_TO_READ,
					" album",
					figure,
					". Got both list <OL> (",
					ol,
					`), and ${STR_AUDIO} (`,
					ch,
					") in one figure."
				);
				return;
			}
			if (audio !== null) {
				CONSOLE_ERROR(
					LOG_UNABLE_TO_READ,
					" single track",
					figure,
					`. Got multiple ${STR_AUDIO} elements: (`,
					audio,
					"), and (",
					ch,
					") in one figure."
				);
				return;
			}

			audio = ch as HTMLAudioElement;
		} else if (node_name === "OL") {
			if (audio !== null) {
				CONSOLE_ERROR(
					LOG_UNABLE_TO_READ,
					" single track",
					figure,
					`. Got both ${STR_AUDIO} (`,
					audio,
					"), and <OL> (",
					ch,
					") inside of figure."
				);
				return;
			}
			if (ol !== null) {
				CONSOLE_ERROR(
					LOG_UNABLE_TO_READ,
					" single track",
					figure,
					". Got multiple <ol> elements: (",
					ol,
					"), and (",
					ch,
					") in one figure."
				);
				return;
			}
			ol = ch;
		} else {
			CONSOLE_ERROR(
				LOG_UNABLE_TO_READ,
				figure,
				". Unexpected element: ",
				ch,
				"Expected: figcaption, audio, ol"
			);
			return;
		}
	}

	let artist = GET_ATTRIBUTE(figure, "data-waw-artist") ?? undefined;
	let album = GET_ATTRIBUTE(figure, "data-waw-album") ?? undefined;
	let album_meta: IAlbumMeta = { album, artist };
	if (ol) {
		let tracks = readAlbumList(figure, ol as HTMLElement);
		if (!tracks) {
			return;
		}
		let player = newAudioPlayer(tracks, album_meta);
		figure.replaceWith(player.ui);
		return player;
	} else if (audio) {
		// todo, I dislike how caption is passed into this
		let meta = readTrackAudioMeta(figure, audio, caption?.textContent ?? "");
		if (!meta) {
			return;
		}
		let player = newAudioPlayer([{ a: audio, meta }], album_meta);
		figure.replaceWith(player.ui);
		return player;
	}
};

export let getPlayers = (): Array<IAudioPlayer> => {
	return Array.from(document.querySelectorAll("figure[data-waw]"))
		.map((f) => readFigure(f as HTMLElement))
		.filter((p) => p !== undefined);
};
