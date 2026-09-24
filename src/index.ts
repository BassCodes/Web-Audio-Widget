// authors  : Alexander Bass
// created  : 2023-08-30
// modified : 2026-09-24

import { orc_add_player, orchestrator } from "./orchestrator";
import { getMultiPlayers, getSinglePlayers } from "./injector";
import el from "./elementMaker.js";

export let SET_MEDIA_ACTION_HANDLER = (a: MediaSessionAction, b: () => void): void =>
	navigator?.mediaSession?.setActionHandler?.(a, b);

const setup = (): void => {
	el("style").tx("TEMPLATE REPLACED IN BUILD").appendTo(document.head);

	// Orchestrator handles media events and ensures only one player can be playing at a time
	SET_MEDIA_ACTION_HANDLER("previoustrack", (): void => {
		orchestrator.activePlayer?.prev();
	});
	SET_MEDIA_ACTION_HANDLER("nexttrack", (): void => {
		orchestrator.activePlayer?.next();
	});
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
	for (const p of getSinglePlayers()) {
		orc_add_player(orchestrator, p);
	}
	for (const p of getMultiPlayers()) {
		orc_add_player(orchestrator, p);
	}

	// TODO: change this to count number of tracks too
	console.info(`Rucksack: Watching ${orchestrator.players.length} players`);
};

addEventListener("DOMContentLoaded", setup);
