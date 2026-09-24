// authors  : Alexander Bass
// created  : 2024
// modified : 2026-09-24

// Format a number to the form of `MM:SS` .
// Does not support hours as lengths, though that could be nice for longer audio files
let formatDuration = (time: number): string => {
	let toStringPadZerosToStart = (n: number): string =>
		(n || 0).toString().padStart(2, "0");
	let seconds = Math.floor(time % 60);
	let minutes = Math.floor(time / 60) % 60;

	return `${toStringPadZerosToStart(minutes)}:${toStringPadZerosToStart(seconds)}`;
};

let audioMetadataLoad = (audio: HTMLAudioElement, callback: () => void): void => {
	// I'm unsure of the validity of this method as it seems like it wouldn't catch all cases
	// but it seems to work.
	if (audio.duration) {
		callback();
	} else {
		audio.addEventListener(
			"loadedmetadata",
			() => {
				callback();
			},
			{ once: true }
		);
	}
};

import * as Icons from "./icons";
import el from "./elementMaker.js";

// Typescript enums automatically include code for formatting them to strings which is unneeded and takes up extra space
export const STATUS_PLAYING = 0;
export const STATUS_PAUSED = 1;
export const STATUS_ERROR = 2;

export type TRACK_STATUS = 0 | 1 | 2;

export interface AudioTrack {
	readonly a: HTMLAudioElement;
	readonly title: string;
}

export class AudioPlayer {
	/** Active Track Object */
	at: AudioTrack;
	/** Index of active track */
	activeNo: number;
	/** Status of active track */
	status: TRACK_STATUS;
	/** List of tracks */
	readonly tracks: Array<AudioTrack>;

	// UI Elements
	/** Title box containing name of active track */
	activeTitle: HTMLElement;
	/** Container for all controller UI elements */
	UI: HTMLElement;
	// Big play/pause button
	button: HTMLElement;
	// Time Elapsed out of total time
	timer: HTMLElement;
	/** Contains progress bar and in the multitrack player Next/Prev buttons */
	bottomBox: HTMLElement;
	// A progress bar container
	progressBox: HTMLElement;
	// Actual current progress
	progressBar: HTMLElement;

	previousTrackButton?: HTMLButtonElement;
	nextTrackButton?: HTMLButtonElement;
	trackListElement?: HTMLElement;

	constructor(tracks: Array<AudioTrack>) {
		this.activeNo = 0;
		this.tracks = tracks;
		this.at = tracks[0];
		this.status = STATUS_PAUSED;

		this.timer = el("div").id("RSCtimer").fin();
		this.progressBar = el("div").id("RSCprogress").fin();
		this.progressBox = el("div").id("RSCprogressBox").ch(this.progressBar).fin();
		this.bottomBox = el("div").id("RSCbottom").ch(this.progressBox).fin();

		this.button = el("button")
			.cl("RSCbutton", "RSCbigButton", "RSCplaypause")
			.at("aria-label", "Play/Pause")
			.ch(Icons.playButton())
			.fin();

		this.activeTitle = el("div").tx(this.at.title).fin();
		let top = el("div").id("RSCtop").ch(this.activeTitle).ch(this.timer).fin();

		let rightBox = el("div").ch(top).ch(this.bottomBox).fin();
		this.UI = el("div").id("RSCui").ch(this.button).ch(rightBox).fin();

		// Only display length of track once it is loaded
		audioMetadataLoad(this.at.a, this.updateDuration.bind(this));

		this.button.onclick = this.togglePlaying.bind(this);

		this.progressBox.addEventListener("mousedown", (e) => {
			let track_duration = this.at.a.duration || 0.1;

			let percentage = e.offsetX / this.progressBox.scrollWidth;
			this.at.a.currentTime = track_duration * percentage;

			this.progressBox.onmousemove = (e2): void => {
				let current_percentage = (this.at.a.currentTime || 0) / track_duration;
				let new_percentage = e2.offsetX / this.progressBox.scrollWidth;
				// Fast seek is not implemented in Chrome
				if (this.at.a.fastSeek) {
					this.at.a.fastSeek(track_duration * new_percentage);
				} else if (Math.abs(current_percentage - new_percentage) > 0.01) {
					// alternative implementation:
					// Check if percent difference between current time and
					// seeked time is at least 1%. Then set time manually.
					// It's still a bit jittery but better than nothing
					this.at.a.currentTime = track_duration * new_percentage;
				}
			};
		});
		this.progressBox.onmouseleave = (): void => {
			this.progressBox.onmousemove = null;
		};
		this.progressBox.onmouseup = (): void => {
			this.progressBox.onmousemove = null;
		};
		this.switchTrack(0);

		if (this.tracks.length > 1) {
			this.trackListElement = el("ol").cl("audioGroup").fin();
			this.previousTrackButton = el("button")
				.at("aria-label", "Previous track")
				.at("inter", "")
				.cl("RSCbutton", "RSCskipbutton")
				.ch(Icons.previousTrack())
				.fin();

			this.nextTrackButton = el("button")
				.at("aria-label", "Next Track")
				.cl("RSCbutton", "RSCskipbutton")
				.ch(Icons.nextTrack())
				.fin();

			this.previousTrackButton.onclick = this.prev.bind(this);

			this.nextTrackButton.onclick = (): void => {
				this.next();
			};
			this.bottomBox.appendChild(this.previousTrackButton);
			this.bottomBox.appendChild(this.nextTrackButton);
			for (const [i, track] of this.tracks.entries()) {
				let trackCard = this.setupTrackCard(i, track);
				this.trackListElement.appendChild(trackCard);
			}
		}
	}

	private setupTrackCard(i: number, track: AudioTrack): HTMLElement {
		const title = el("span").id("RSCtitle").tx(track.title).fin();
		const duration = el("span").id("RSCtimer").fin();
		const trackNumber = el("span")
			.id("RSCord")
			.tx(`${i + 1}.`)
			.fin();

		const button = el("button")
			.cl("RSCbutton", "RSCsmallButton", "RSCplaypause")
			.at("aria-label", "Play/Pause")
			.ch(Icons.playButton())
			.fin();

		const audioCard = el("li")
			.id("RSCcard")
			.at("role", "listitem")
			.ch(button)
			.ch(trackNumber)
			.ch(title)
			.fin();

		// If metadata is already loaded, format duration
		// Else, wait for metadata load event and then format duration
		audioMetadataLoad(track.a, () => {
			duration.textContent = `${formatDuration(track.a.duration)}`;
			audioCard.appendChild(duration);
		});

		if (track.a.error) {
			button.classList.add("errored");
			button.replaceChildren(Icons.errorButton());
			duration.textContent = "track could not be loaded";
		}

		button.onclick = (): void => {
			if (this.at != track) {
				this.switchTrack(i);
				this.activeNo = i;
				this.play();
			} else {
				this.togglePlaying();
			}
		};

		track.a.onplay = (): void => {
			if (this.at != track) {
				this.switchTrack(i);
			}
			button.replaceChildren(Icons.pauseButton());
			title.style.fontWeight = "bold";
		};

		track.a.onpause = (): void => {
			// If the active track is paused, then the big button at the top will also need to be set as the play button
			if (this.at == track) {
				this.setStatus(STATUS_PAUSED);
			}
			button.replaceChildren(Icons.playButton());
			title.style.fontWeight = "";
		};

		track.a.onended = (): void => {
			this.next();
			button.replaceChildren(Icons.playButton());
			if (this.at == track) this.setStatus(STATUS_PAUSED);
		};

		track.a.onerror = (e): void => {
			console.log(e);
			duration.textContent = "error";
		};
		return audioCard;
	}

	switchTrack(trackno: number): void {
		// Clean up previous active track
		this.at.a.pause();
		this.at.a.currentTime = 0;
		this.at.a.ontimeupdate = null;

		// Set new active track
		this.at = this.tracks[trackno];
		this.at.a.ontimeupdate = (): void => {
			this.updateDuration();
		};
		this.activeTitle.textContent = this.at.title;
		this.activeNo = trackno;
		if (this.isFirstTrack()) {
			this?.previousTrackButton?.setAttribute("inert", "");
		} else {
			this?.previousTrackButton?.removeAttribute("inert");
		}
		if (this.isLastTrack()) {
			this?.nextTrackButton?.setAttribute("inert", "");
		} else {
			this?.nextTrackButton?.removeAttribute("inert");
		}
	}

	next(): void {
		if (!this.isLastTrack()) {
			this.switchTrack(this.activeNo + 1);
			this.play();
		}
	}

	prev(): void {
		if (!this.isFirstTrack()) {
			this.switchTrack(this.activeNo - 1);
			this.play();
		}
	}

	isLastTrack(): boolean {
		return this.activeNo >= this.tracks.length - 1;
	}

	isFirstTrack(): boolean {
		return this.activeNo < 1;
	}

	updateDuration(): void {
		let current_track = this.at.a;

		let totalDuration = formatDuration(current_track.duration);
		let currentTime = formatDuration(current_track.currentTime);
		this.timer.textContent = `${currentTime} / ${totalDuration}`;
		this.progressBar.style.width = `${
			100 * (current_track.currentTime / current_track.duration || 0)
		}%`;
	}

	togglePlaying(): void {
		this.at.a.paused ? this.play() : this.pause();
	}

	play(): void {
		this.UI.dispatchEvent(new Event("RSCaudioStart"));
		let promise = this.at.a.play();
		// Older browsers might not support the promise
		if (!promise) return;
		promise
			.then(() => {
				this.setStatus(STATUS_PLAYING);
			})
			.catch((e) => {
				this.setStatus(STATUS_ERROR);
				if (!this.isLastTrack()) {
					this.next();
				}
				console.log(e, this.at.a.error);
			});
	}

	pause(): void {
		this.at.a.pause();
		this.setStatus(STATUS_PAUSED);
	}

	setStatus(s: TRACK_STATUS): void {
		let b;
		if (s === STATUS_PLAYING) {
			b = Icons.pauseButton();
		}
		if (s === STATUS_PAUSED) {
			b = Icons.playButton();
		}
		if (s === STATUS_ERROR) {
			b = Icons.errorButton();
		}

		this.button.replaceChildren(b as SVGElement);
		this.status = s;
	}
}
