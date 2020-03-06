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

export function rec_sort_duel_players(column_name: string, sort_direction: SortDirection) {
    console.log(column_name);
    console.log(sort_direction);
    cmd.schedule(`
      | data_fetch_duel_players
      | duel_players_render_data
    `);
    //console.log(column_name + ", " + direction);
    // name
    // game_cnt
    // opponent_cnt
    // a_win_percent
    // avg_frag_percent
    // avg_lg_acc_percent
    // last_game_date
}
