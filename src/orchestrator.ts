// authors  : Alexander Bass
// created  : 2024
// modified : 2026-09-24

import { AudioPlayer } from "./audioPlayer";

interface Orchestrator {
	players: AudioPlayer[];
	activePlayer: null | AudioPlayer;
}

export function orc_add_player(orc: Orchestrator, player: AudioPlayer): void {
	orc.players.push(player);

	player.UI.addEventListener("RSCaudioStart", () => {
		orc.activePlayer = player;
		for (const pr of orc.players) {
			if (player == pr) continue;
			pr.pause();
		}
	});
}

export let orchestrator: Orchestrator = {
	players: [],
	activePlayer: null,
};
