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
  html_root.className = "m11-opponents";
  return Promise.resolve(html_root);
}

function cmd_opponents_attach_html_root(): Promise<any> {
  if (state.duel_player.opponents.html_root == null || state.html_main == null) {
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
  let rows = _html_render_opponents_header();
  rows += data.map((opponent) => _html_render_opponent_row(opponent)).join("");
  const html = `
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_opponents_header(): string {
  return `
<div class="m11-opponents__row m11-opponents__row--header">
  <div class="m11-opponents__cell m11-opponents__cell--header m11-opponents__cell--name">name</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">games</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">win rate</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">frag %</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">dmg %</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">fq map</div>
</div>
`;
}

function _html_render_opponent_row(opponent: OpponentData): string {
  return `
<div class="m11-opponents__row m11-opponents__row--opponent">
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.name_b}</div>
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.game_cnt}</div>
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.avg_win_probability}</div>
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.avg_frag_proportion}</div>
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.avg_dmg_proportion}</div>
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.most_frequent_map}</div>
</div>
`;
}
