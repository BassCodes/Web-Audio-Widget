// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2026-10-01
// modified : 2026-10-21

import * as Icons from "./icons";
import { IAudioTrack, TRACK_STATUS } from "./player";
import {
	el,
	formatDuration,
	setDisplay,
	setInert,
	WINDOW_ADD_EVENT_LISTENER,
	WINDOW_REMOVE_EVENT_LISTENER,
} from "./util";

let getStatusIcon = (s: TRACK_STATUS): SVGElement =>
	[Icons.pauseButton(), Icons.playButton(), Icons.errorButton()][s];

interface ITrackCard {
	title_el: HTMLElement;
	timer_el: HTMLElement;
	timer_duration_el: HTMLElement;
	button_el: HTMLElement;
	status_msg_el: HTMLElement;
}

export interface IPlayerUi {
	tree: HTMLElement;
	bind_ui_events: (
		active_seek: (percent: number) => void,
		active_toggle: () => void,
		track_toggle: (track_no: number) => void,
		next_track: () => void,
		prev_track: () => void
	) => void;
	add_track_card: (tracks: IAudioTrack) => void;
	set_track: (track_no: number, meta: IAudioTrack) => void;
	set_track_status: (track_no: number, status: TRACK_STATUS) => void;
	set_track_duration: (track_no: number, duration: number) => void;
	set_active_track: (track: IAudioTrack) => void;
	set_active_time: (time: number) => void;
	set_active_duration: (duration: number) => void;
	set_active_percentage: (percentage: number) => void;
	set_active_status: (status: TRACK_STATUS) => void;
	set_next_usable: (usable: boolean) => void;
	set_prev_usable: (usable: boolean) => void;
	set_next_prev_shown: (shown: boolean) => void;
	set_track_list_shown: (shown: boolean) => void;
	set_active_status_msg: (status_msg: string | undefined) => void;
	set_track_status_msg: (track_no: number, status_msg: string | undefined) => void;
}

export let createPlayerUI = (): IPlayerUi => {
	let tree_el = el("div").cl("WAWui").fin();

	let controls_el = el("div").cl("WAWctrls").appendTo(tree_el);

	let button_el = el("button")
		.cl("WAWbutton", "WAWbigButton", "WAWplaypause")
		.at("aria-label", "Play/Pause")
		.ch(Icons.playButton())
		.appendTo(controls_el);

	let rightBox_el = el("div").cl("WAWstack").appendTo(controls_el);

	let top_el = el("div").cl("WAWtop").appendTo(rightBox_el);
	let active_title_el = el("div").cl("WAWtitle").tx("N/A").appendTo(top_el);

	let timer_el = el("div").cl("WAWtimer").appendTo(top_el);
	let timer_time_el = el("span").cl("WAWminutes").appendTo(timer_el);
	el("span").tx(" / ").appendTo(timer_el);
	let timer_duration_el = el("span").cl("WAWminutes").appendTo(timer_el);
	let active_status_msg_el = el("span")
		.cl("WAWstatus")
		.st("display", "none")
		.appendTo(timer_el);

	let bottom_box_el = el("div").cl("WAWbottom").appendTo(rightBox_el);
	let progress_box_el = el("div").cl("WAWprogressBox").appendTo(bottom_box_el);
	let progressBar_el = el("div").cl("WAWprogress").appendTo(progress_box_el);

	let prev_track_button_el = el("button")
		.at("aria-label", "Previous track")
		.st("display", "none")
		.cl("WAWbutton", "WAWskipbutton")
		.ch(Icons.previousTrack())
		.appendTo(bottom_box_el);

	let next_track_button_el = el("button")
		.at("aria-label", "Next Track")
		.cl("WAWbutton", "WAWskipbutton")
		.st("display", "none")
		.ch(Icons.nextTrack())
		.appendTo(bottom_box_el);

	let track_list_el = el("ol").cl("WAWlist").st("display", "none").appendTo(tree_el);
	let track_cards: Array<ITrackCard> = [];

	let seek_action: (p: number) => void;
	let active_toggle_action: () => void;
	let track_toggle_action: (t: number) => void;
	let prev_action: () => void;
	let next_action: () => void;

	let ui: IPlayerUi = {
		tree: tree_el,
		bind_ui_events: (
			active_seek,
			active_toggle,
			track_toggle,
			next_track,
			prev_track
		) => {
			seek_action = active_seek;
			active_toggle_action = active_toggle;
			track_toggle_action = track_toggle;
			next_action = next_track;
			prev_action = prev_track;
		},
		add_track_card: (track: IAudioTrack) => {
			let no = track_cards.length;

			let card_el = el("li").cl("WAWcard").fin();

			let card_button_el = el("button")
				.cl("WAWbutton", "WAWsmallButton", "WAWplaypause")
				.at("aria-label", "Play/Pause")
				.ch(Icons.playButton())
				.appendTo(card_el);
			el("span")
				.cl("WAWord")
				.tx(`${no + 1}.`)
				.appendTo(card_el);
			let card_title_el = el("span").cl("WAWtitle").appendTo(card_el);

			let card_timer_el = el("span").cl("WAWtimer").appendTo(card_el);
			let card_timer_duration_el = el("span").appendTo(card_timer_el);
			let card_status_msg_el = el("span").cl("WAWstatus").appendTo(card_timer_el);
			track_list_el.appendChild(card_el);

			track_cards.push({
				title_el: card_title_el,
				timer_el: card_timer_el,
				timer_duration_el: card_timer_duration_el,
				status_msg_el: card_status_msg_el,
				button_el: card_button_el,
			});
			ui.set_track(no, track);

			card_button_el.onclick = () => {
				track_toggle_action(no);
			};
		},
		set_track: (track_no: number, track: IAudioTrack) => {
			let card = track_cards[track_no];
			if (track.duration) {
				ui.set_track_duration(track_no, track.duration);
			}
			card.title_el.textContent = track.meta.title;
		},
		set_track_status: (track_no: number, s: TRACK_STATUS) => {
			let card = track_cards[track_no];
			card.button_el.replaceChildren(getStatusIcon(s));
		},
		set_track_duration: (track_no: number, duration: number) => {
			let card = track_cards[track_no];
			card.timer_duration_el.textContent = formatDuration(duration);
		},
		set_active_track: (track: IAudioTrack) => {
			active_title_el.textContent = track.meta.title;
			ui.set_active_time(0);
			if (track.duration) {
				ui.set_active_duration(track.duration);
			}
		},
		set_active_time: (time: number) => {
			timer_time_el.textContent = formatDuration(time);
		},
		set_active_duration: (duration: number) => {
			timer_duration_el.textContent = formatDuration(duration);
		},
		set_active_percentage: (p: number) => {
			progressBar_el.style.width = `${100 * p}%`;
		},
		set_active_status: (s: TRACK_STATUS) => {
			button_el.replaceChildren(getStatusIcon(s));
		},
		set_next_usable: (usable: boolean) => {
			setInert(next_track_button_el, usable);
		},
		set_prev_usable: (usable: boolean) => {
			setInert(prev_track_button_el, usable);
		},
		set_next_prev_shown: (shown: boolean) => {
			setDisplay(next_track_button_el, shown);
			setDisplay(prev_track_button_el, shown);
		},
		set_track_list_shown: (shown: boolean) => {
			setDisplay(track_list_el, shown);
		},
		set_active_status_msg: (status_msg: string | undefined) => {
			let status = status_msg === undefined;
			let width = timer_el.getBoundingClientRect().width;
			Array.from(timer_el.children).forEach((c) => setDisplay(c as HTMLElement, status));
			// Hiding the timer elements changes the box width. this is a bit jarring.
			// Fix status message to be at least as wide as timer
			active_status_msg_el.style.minWidth = `${width}px`;
			active_status_msg_el.textContent = status_msg ?? "";
			setDisplay(active_status_msg_el, !status);
		},
		set_track_status_msg: (track_no: number, status_msg: string | undefined) => {
			let card = track_cards[track_no];
			setDisplay(card.timer_duration_el, status_msg === undefined);
			card.status_msg_el.textContent = status_msg ?? "";
		},
	};

	button_el.onclick = () => {
		active_toggle_action();
	};
	prev_track_button_el.onclick = () => {
		prev_action();
	};
	next_track_button_el.onclick = () => {
		next_action();
	};

	let prevent_default = (e: Event) => e.preventDefault();

	let move_handler = (e2: MouseEvent) => {
		let rect = progress_box_el.getBoundingClientRect();
		let new_percentage = (e2.pageX - rect.left) / rect.width;
		if (new_percentage >= 1) {
			new_percentage = 0.995;
		}
		if (new_percentage < 0) {
			new_percentage = 0;
		}
		seek_action(new_percentage);
	};
	let mouseup = () => {
		WINDOW_REMOVE_EVENT_LISTENER("selectstart", prevent_default);
		WINDOW_REMOVE_EVENT_LISTENER("mousemove", move_handler);
		WINDOW_REMOVE_EVENT_LISTENER("mouseup", mouseup);
		WINDOW_REMOVE_EVENT_LISTENER("mouseleave", mouseup);
		WINDOW_REMOVE_EVENT_LISTENER("blur", mouseup);
	};
	progress_box_el.onmousedown = (e) => {
		let percentage = e.offsetX / progress_box_el.scrollWidth;
		seek_action(percentage);

		WINDOW_ADD_EVENT_LISTENER("mousemove", move_handler);
		WINDOW_ADD_EVENT_LISTENER("selectstart", prevent_default);
		WINDOW_ADD_EVENT_LISTENER("mouseup", mouseup);
		WINDOW_ADD_EVENT_LISTENER("mouseleave", mouseup);
		WINDOW_ADD_EVENT_LISTENER("blur", mouseup);
	};

	return ui;
};
