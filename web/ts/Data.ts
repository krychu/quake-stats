import { state, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
  // duel player
  [ "data_fetch_game_cnts",             cmd_data_fetch_game_cnts ],
  [ "data_fetch_games",                 cmd_data_fetch_games ],
  [ "data_fetch_win_probabilities",     cmd_data_fetch_win_probabilities ],

  // duel players
  [ "data_fetch_duel_players",          cmd_data_fetch_duel_players ]
];

export function init() {
  cmd.add_cmds(commands);
  log.log("Data module initialized");
}

export function shutdown() {

}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
/**
 * Duel Player
 */
function cmd_data_fetch_game_cnts(): Promise<any> {
  if (state.duel_player.player == null) {
    log.log("Data::cmd_data_fetch_game_cnt - player is null");
    return Promise.reject();
  }

  return fetch(_api_url_game_cnts(state.duel_player.player))
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
}

function cmd_data_fetch_games(): Promise<any> {
  //const { player, data } = state;
  if (state.duel_player.player == null) {
    log.log("Data::cmd_data_fetch_games - player is null");
    return Promise.reject();
  }

  return fetch(_api_url_games(state.duel_player.player, state.duel_player.data.game_cnt))
    .then((response) => response.json())
    .then((json) => {
      //cmd.schedule_cmd("state_set_games_data", json);
      return json;
      //return true;
      //cmd.schedule_cmd("games_render_data");
    });
}

function cmd_data_fetch_win_probabilities(): Promise<any> {
  //const { player } = state;
  if (state.duel_player.player == null) {
    log.log("Data::cmd_data_fetch_win_probabilities - player is null");
    return Promise.reject();
  }

  return fetch(_api_url_win_probabilities(state.duel_player.player))
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
}

/**
 * Duel Players
 */
function cmd_data_fetch_duel_players(): Promise<any> {
  return fetch(_api_url_duel_players())
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _api_url_game_cnts(player: string): string {
  return `/api/1vs1/${player}/game_cnts`;
}

function _api_url_games(player: string, game_cnt: number): string {
  return `/api/1vs1/${player}/games/${game_cnt}`;
}

function _api_url_win_probabilities(player: string): string {
  return `/api/1vs1/${player}/win_probabilities`;
}

function _api_url_duel_players(): string {
  return `/api/1vs1/players`;
}
