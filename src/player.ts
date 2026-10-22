// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2024
// modified : 2026-10-22
import { audioMetadataLoad, CONSOLE_ERROR } from "./util";
import { createPlayerUI } from "./ui";

export type TRACK_STATUS = 0 | 1 | 2;
export let STATUS_PLAYING: TRACK_STATUS = 0;
export let STATUS_PAUSED: TRACK_STATUS = 1;
export let STATUS_ERROR: TRACK_STATUS = 2;

export interface IAlbumMeta {
	album?: string;
	artist?: string;
}

export interface ITrackMeta {
	title: string;
	album?: string;
	artist?: string;
}

export interface IAudioTrack {
	readonly a: HTMLAudioElement;
	readonly meta: ITrackMeta;
	errored?: boolean;
	duration?: number;
}

export interface IAudioPlayer {
	active_track: IAudioTrack;
	tracks: Array<IAudioTrack>;
	active_no: number;
	ui: HTMLElement;
	album_meta?: IAlbumMeta;

	pause: () => void;
	play: () => void;
	toggle_playing: () => void;
	seek: (percentage: number) => void;

	// Multitrack methods
	next: () => void;
	prev: () => void;
	set_track: (track_no: number) => void;
	is_first_track: () => boolean;
	is_last_track: () => boolean;

	// Media Session
	getMediaMetadata: () => MediaMetadataInit;
}

export let newAudioPlayer = (
	_tracks: Array<IAudioTrack>,
	album_meta: IAlbumMeta | undefined = undefined
): IAudioPlayer => {
	let ui = createPlayerUI();

	let set_status = (
		p: IAudioPlayer,
		status: TRACK_STATUS,
		track_no: number,
		small_only: boolean = false
	) => {
		let track = p.tracks[track_no];
		if (track.errored || status === STATUS_ERROR) {
			status = STATUS_ERROR;
			track.errored = true;
			ui.set_track_status_msg(track_no, "Error");
			ui.set_track_status(track_no, status);
			if (track === p.active_track) {
				ui.set_active_status_msg("Error");
				ui.set_active_status(STATUS_ERROR);
			}
			return;
		}

		if (track === p.active_track && !small_only) {
			ui.set_active_status(status);
			ui.set_active_status_msg(undefined);
		}
		ui.set_track_status(track_no, status);
	};

	let player: IAudioPlayer = {
		active_track: _tracks[0],
		tracks: _tracks,
		active_no: 0,
		ui: ui.tree,
		album_meta,
		play: () => {
			ui.tree.dispatchEvent(new Event("WAWplay"));
			player.active_track.a.play();
			set_status(player, STATUS_PLAYING, player.active_no);
		},
		pause: () => {
			player.active_track.a.pause();
			set_status(player, STATUS_PAUSED, player.active_no);
		},
		toggle_playing: () => {
			player.active_track.a.paused ? player.play() : player.pause();
		},
		next: () => {
			if (player.is_last_track()) return;

			player.active_track.a.pause();
			set_status(player, STATUS_PAUSED, player.active_no, true);
			player.set_track(player.active_no + 1);
			player.play();
		},
		prev: () => {
			if (player.is_first_track()) return;

			player.active_track.a.pause();
			set_status(player, STATUS_PAUSED, player.active_no, true);
			player.set_track(player.active_no - 1);
			player.play();
		},
		seek: (percentage: number) => {
			let track_duration = player.active_track.a.duration || 0.1;
			let new_time = track_duration * percentage;
			player.active_track.a.currentTime = new_time;
			ui.set_active_time(new_time);
			ui.set_active_percentage(percentage);
		},
		set_track: (track_no: number) => {
			if (track_no >= player.tracks.length) return;

			let track = player.tracks[track_no];
			player.active_track.a.pause();
			player.active_track.a.ontimeupdate = null;
			player.active_track.a.currentTime = 0;
			player.active_track = track;
			player.active_no = track_no;

			ui.set_prev_usable(!player.is_first_track());
			ui.set_next_usable(!player.is_last_track());

			player.active_track.a.ontimeupdate = () => {
				let at = player.active_track.a;
				ui.set_active_time(at.currentTime);
				ui.set_active_percentage((at.currentTime ?? 0) / (at.duration ?? 1));
			};

			ui.set_active_track(track);
			ui.set_active_percentage(0);
		},
		is_first_track: (): boolean => player.active_no == 0,
		is_last_track: (): boolean => player.active_no == player.tracks.length - 1,
		getMediaMetadata: (): MediaMetadataInit => {
			// Take metadata from track first,
			// If track has no metadata, get from album.
			// This allows for albums with single tracks with different artists.
			let tm = player.active_track.meta;
			let title = tm.title;
			let album = tm.album ?? player.album_meta?.album;
			let artist = tm.artist ?? player.album_meta?.artist;

			return { title, album, artist };
		},
	};

	let on_ui_active_toggle = player.toggle_playing;
	let on_ui_active_seek = player.seek;
	let on_ui_next_track = player.next;
	let on_ui_prev_track = player.prev;

	let on_ui_track_toggle = (track_no: number) => {
		if (track_no == player.active_no) {
			player.toggle_playing();
		} else {
			set_status(player, STATUS_PAUSED, player.active_no, true);
			player.set_track(track_no);
			player.play();
		}
	};

	ui.bind_ui_events(
		on_ui_active_seek,
		on_ui_active_toggle,
		on_ui_track_toggle,
		on_ui_next_track,
		on_ui_prev_track
	);

	ui.set_active_status_msg("loading");
	for (let [i, track] of player.tracks.entries()) {
		ui.add_track_card(track);
		// todo. when loading on throttled connection, this "loading" does not show.
		ui.set_track_status_msg(i, "loading");

		audioMetadataLoad(
			track.a,
			() => {
				track.duration = track.a.duration;
				ui.set_track_status_msg(i, undefined);
				ui.set_track_duration(i, track.duration);
				if (i === player.active_no) {
					ui.set_active_track(track);
					ui.set_active_duration(track.duration);
					ui.set_active_status_msg(undefined);
				}
			},
			(e) => {
				CONSOLE_ERROR("error", e);
				set_status(player, STATUS_ERROR, i);
			}
		);

		track.a.onended = () => player.next();
		track.a.onplay = () => {
			ui.tree.dispatchEvent(new Event("WAWplay"));

			if (player.active_track.a != track.a) {
				player.set_track(i);
			}
			set_status(player, STATUS_PLAYING, player.active_no);
		};
	}

	if (player.tracks.length > 1) {
		ui.set_next_prev_shown(true);
		ui.set_track_list_shown(true);
	}

	player.set_track(0);

	return player;
};
