// authors  : Alexander Bass
// license  : LGPL 3.0
// created  : 2023-08-30
// modified : 2026-10-21

// DOM parsing logic defined in `injector.ts`
// Audio player logic defined in `player.ts`
// Player UI defined in `ui.ts`
//
// SVG icons defined in `icons.ts`
// Various utility functions in `util.ts` Of particular note is `el(element_name)`

import { orc_add_player, orchestrator } from "./orchestrator";
import { getPlayers as injectPlayers } from "./injector";
import { el, SET_MEDIA_ACTION_HANDLER, WINDOW_ADD_EVENT_LISTENER } from "./util";

const STYLESHEET = "TEMPLATE REPLACED IN BUILD";
let setup = (): void => {
	// Attempt to prevent the browser from loading all tracks fully instantly
	document.querySelectorAll("figure[data-waw] > audio[src]").forEach((a) => {
		(a as HTMLAudioElement).preload = "metadata";
		a.setAttribute("loading", "lazy");
	});

	el("style").tx(STYLESHEET).appendTo(document.head);

	// Orchestrator handles media events and ensures only one player can be playing at a time

	SET_MEDIA_ACTION_HANDLER("pause", (): void => {
		orchestrator.activePlayer?.pause();
	});
	SET_MEDIA_ACTION_HANDLER("play", (): void => {
		orchestrator.activePlayer?.play();
	});
	SET_MEDIA_ACTION_HANDLER("stop", (): void => {
		orchestrator.activePlayer?.pause();
	});

	// Extract info from page and inject players
	// Add players to orchestrator
	for (let p of injectPlayers()) {
		orc_add_player(orchestrator, p);
	}

	console.info(`Rucksack: Watching ${orchestrator.players.length} players`);
};

WINDOW_ADD_EVENT_LISTENER("DOMContentLoaded", setup);
