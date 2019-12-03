import { state, Cmd, OpponentData } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "opponents_create_html_root",      cmd_opponents_create_html_root ],
    [ "opponents_attach_html_root",      cmd_opponents_attach_html_root ],
    [ "opponents_render_data",           cmd_opponents_render_data ],
];

// cmd_state_set_game_data
// cmd_state_set_game_html_root

export function init() {
    cmd.add_cmds(commands);
    log.log("Opponents module initialized");
    // cmd.schedule_cmd("games_create_html_root");
    // cmd.schedule_cmd("games_attach_html_root");
}

export function shutdown() {
}

function cmd_opponents_create_html_root(): Promise<any> {
  const html_root = document.createElement("div");
  html_root.className = "m1vs1-opponents";
  return Promise.resolve(html_root);
}

function cmd_opponents_attach_html_root(): Promise<any> {
  if (state.duel_player.games.html_root == null || state.html_main == null) {
    log.log("Opponents:cmd_opponents_attach_html_root - state doesn't contain required data");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_player.opponents.html_root);
  return Promise.resolve();
}

function cmd_opponents_render_data(): Promise<any> {
  if (state.duel_player.opponents.html_root == null || state.duel_player.data.games == null) {
    log.log("Opponents::cmd_opponents_render_data - state doesn't contain required data");
    return Promise.reject();
  }

  _html_remove_opponents(state.duel_player.opponents.html_root);
  _html_render_opponents(state.duel_player.data.opponents, state.duel_player.opponents.html_root);

  return Promise.resolve();
}

function _html_remove_opponents(element: HTMLElement) {
  console.log(element);
  log.log("IMPLEMENT ME: _html_remove_opponents");
}

function _html_render_opponents(data: OpponentData[], element: HTMLElement) {
  console.log(element);
  console.log(data);
}
