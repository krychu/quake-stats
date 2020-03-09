import * as cmd from "./Cmd";
import { SortDirection } from "./Utils";

// Can be used after the duel players page was created
export function rec_refresh_duel_players_page() {
    cmd.schedule(`
      || data_fetch_duel_players
      || data_fetch_activity
      --
      || main_insufficient_data
      || activity_render_data
      || duel_players_render_data
    `);
}

export function rec_refresh_duel_player_page() {
    cmd.schedule(`
      || data_fetch_toplevel
      || data_fetch_games
      || data_fetch_opponents
      || data_fetch_maps
      --
      || main_insufficient_data
      || toplevel_render_data
      || gchart_render_data
      || games_render_data
      || opponents_render_data
      || maps_render_data
    `);
}

export function rec_sort_duel_players() {
    cmd.schedule(`
      | data_fetch_duel_players
      | duel_players_render_data
    `);
}

export function rec_sort_duel_player_games() {
    cmd.schedule(`
      | data_fetch_games
      | games_render_data
    `);
}

export function rec_sort_duel_player_opponents() {
    cmd.schedule(`
      | data_fetch_opponents
      | opponents_render_data
    `);
}

export function rec_sort_duel_player_maps() {
    cmd.schedule(`
      | data_fetch_maps
      | maps_render_data
`);
}
