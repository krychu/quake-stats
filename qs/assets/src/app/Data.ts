import { state, Cmd, Duel } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
  [ "data_fetch_game_cnts",             cmd_data_fetch_game_cnts ],
  [ "data_fetch_games",                 cmd_data_fetch_games ],
  [ "data_fetch_win_probabilities",     cmd_data_fetch_win_probabilities ],

  [ "state_set_game_cnts",              cmd_state_set_game_cnts ],
  [ "state_set_games",                  cmd_state_set_games ],
  [ "state_set_win_probabilities",      cmd_state_set_win_probabilities ]
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
function cmd_data_fetch_game_cnts(): Promise<any> {
  const { player } = state;
  if (player == null) {
    log.log("Data::cmd_data_fetch_game_cnt - player is null");
    return Promise.reject();
  }

  return fetch(_api_url_game_cnts(player))
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
}

function cmd_data_fetch_games(): Promise<any> {
  const { player, data } = state;
  if (player == null) {
    log.log("Data::cmd_data_fetch_games - player is null");
    return Promise.reject();
  }

  return fetch(_api_url_games(player, data.game_cnt))
    .then((response) => response.json())
    .then((json) => {
      //cmd.schedule_cmd("state_set_games_data", json);
      return json;
      //return true;
      //cmd.schedule_cmd("games_render_data");
    });
}

function cmd_data_fetch_win_probabilities(): Promise<any> {
  const { player } = state;
  if (player == null) {
    log.log("Data::cmd_data_fetch_win_probabilities - player is null");
    return Promise.reject();
  }

  return fetch(_api_url_win_probabilities(player))
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
}

function cmd_state_set_game_cnts(data: [string, number][]): Promise<any> {
  state.data.game_cnts = data;
  return Promise.resolve();
}

function cmd_state_set_games(data: Duel[]): Promise<any> {
  state.data.games = data;
  return Promise.resolve();
}

function cmd_state_set_win_probabilities(data: any[]): Promise<any> {
  state.data.win_probabilities = data;
  return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _api_url_game_cnts(player: string): string {
  return `/api/duel/${player}/game_cnts`;
}

function _api_url_games(player: string, game_cnt: number): string {
  return `/api/duel/${player}/games/${game_cnt}`;
}

function _api_url_win_probabilities(player: string): string {
  return `/api/duel/${player}/win_probabilities`;
}

