// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2024
// modified : 2026-10-20

import { IAudioPlayer } from "./player";
import { SET_MEDIA_ACTION_HANDLER } from "./util";

interface Orchestrator {
	players: IAudioPlayer[];
	activePlayer: null | IAudioPlayer;
	enabled: { next: boolean; prev: boolean };
}

let orc_set_enable = (
	orc: Orchestrator,
	enable: boolean,
	act: "next" | "prev",
	media_action: "nexttrack" | "previoustrack"
) => {
	if (orc.enabled[act] != enable) {
		SET_MEDIA_ACTION_HANDLER(
			media_action,
			enable ? (): void => orc.activePlayer?.[act]() : null
		);
	}
	orc.enabled[act] = enable;
};

export let orc_add_player = (orc: Orchestrator, player: IAudioPlayer) => {
	orc.players.push(player);

	player.ui.addEventListener("WAWplay", () => {
		orc.activePlayer = player;
		for (let pr of orc.players) {
			if (player == pr) continue;
			pr.pause();
		}

		if ("mediaSession" in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata(player.getMediaMetadata());
		}
		orc_set_enable(orc, !player.is_last_track(), "next", "nexttrack");
		orc_set_enable(orc, !player.is_first_track(), "prev", "previoustrack");
	});
};

export let orchestrator: Orchestrator = {
	players: [],
	activePlayer: null,
	enabled: { next: false, prev: false },
};
