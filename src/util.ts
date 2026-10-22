// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2026-10-01
// modified : 2026-10-21

export let SET_MEDIA_ACTION_HANDLER = (
	a: MediaSessionAction,
	b: null | (() => void)
): void => navigator?.mediaSession?.setActionHandler?.(a, b);

// Format a number to the form of `MM:SS` .
// Does not support hours as lengths, though that could be nice for longer audio files
export let formatDuration = (time: number): string => {
	let toStringPadZerosToStart = (n: number): string =>
		(n || 0).toString().padStart(2, "0");
	let seconds = Math.floor(time % 60);
	let minutes = Math.floor(time / 60) % 60;

	return `${toStringPadZerosToStart(minutes)}:${toStringPadZerosToStart(seconds)}`;
};

export let audioMetadataLoad = (
	audio: HTMLAudioElement,
	callback: () => void,
	error: (e: string | Event) => void
) => {
	// I'm unsure of the validity of this method as it seems like it wouldn't catch all cases
	// but it seems to work.
	if (audio.duration) {
		callback();
	} else {
		audio.onloadedmetadata = () => {
			callback();
			audio.onloadedmetadata = null;
			audio.onerror = null;
		};
		audio.onerror = (e) => {
			error(e);
			audio.onloadedmetadata = null;
			audio.onerror = null;
		};
	}
};

export let setDisplay = (el: HTMLElement, shown: boolean) => {
	el.style.display = shown ? "" : "none";
};
export let setInert = (el: HTMLElement, usable: boolean) => {
	usable ? el.removeAttribute("inert") : el.setAttribute("inert", "1");
};

// Create HTML element by chaining function calls.
export interface IElementInProgress {
	e: HTMLElement;
	at: (name: string, value: string) => IElementInProgress;
	cl: (...class_name: string[]) => IElementInProgress;
	ch: (child: HTMLElement | SVGElement) => IElementInProgress;
	tx: (text_contents: string) => IElementInProgress;
	st: (name: string, value: string) => IElementInProgress;
	fin: () => HTMLElement;
	appendTo: (parent: HTMLElement) => HTMLElement;
}

export let el = (name: string): IElementInProgress => {
	let e = document.createElement(name);

	let obj = {
		e: e,
		at: (name: string, value: string): IElementInProgress => {
			e.setAttribute(name, value);
			return obj;
		},
		cl: (...class_name: string[]): IElementInProgress => {
			class_name.forEach((cl) => e.classList.add(cl));
			return obj;
		},
		ch: (child: HTMLElement | SVGElement): IElementInProgress => {
			e.appendChild(child);
			return obj;
		},
		tx: (text_contents: string): IElementInProgress => {
			e.textContent = text_contents;
			return obj;
		},
		st: (name: string, value: string): IElementInProgress => {
			e.style.setProperty(name, value);
			return obj;
		},
		fin: (): HTMLElement => {
			return e;
		},
		appendTo: (parent: HTMLElement): HTMLElement => {
			parent.appendChild(e);
			return e;
		},
	};

	return obj;
};

export let WINDOW_ADD_EVENT_LISTENER = window.addEventListener;
export let WINDOW_REMOVE_EVENT_LISTENER = window.removeEventListener;

export let GET_ATTRIBUTE = (e: HTMLElement, attr: string): string | null => {
	return e.getAttribute(attr);
};

let cns = console;
export let CONSOLE_ERROR = (...msg: unknown[]) => {
	cns.error(...msg);
};
export let CONSOLE_WARN = (...msg: unknown[]) => {
	cns.warn(...msg);
};
export let CONSOLE_LOG = (...msg: unknown[]) => {
	cns.log(...msg);
};
