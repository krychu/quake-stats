import { state, Cmd, MapData } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "maps_create_html_root",      cmd_maps_create_html_root ],
    [ "maps_attach_html_root",      cmd_maps_attach_html_root ],
    [ "maps_render_data",           cmd_maps_render_data ],
];

// cmd_state_set_game_data
// cmd_state_set_game_html_root

export function init() {
    cmd.add_cmds(commands);
    log.log("Maps module initialized");
    // cmd.schedule_cmd("games_create_html_root");
    // cmd.schedule_cmd("games_attach_html_root");
}

export function shutdown() {
}

function cmd_maps_create_html_root(): Promise<any> {
  const html_root = document.createElement("div");
  html_root.className = "m11-maps";
  return Promise.resolve(html_root);
}

function cmd_maps_attach_html_root(): Promise<any> {
  if (state.duel_player.maps.html_root == null || state.html_main == null) {
    log.log("Maps:cmd_opponents_attach_html_root - state doesn't contain required data");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_player.maps.html_root);
  return Promise.resolve();
}

function cmd_maps_render_data(): Promise<any> {
  if (state.duel_player.maps.html_root == null || state.duel_player.data.maps == null) {
    log.log("Opponents::cmd_opponents_render_data - state doesn't contain required data");
    return Promise.reject();
  }

  _html_remove_maps(state.duel_player.maps.html_root);
  _html_render_maps(state.duel_player.data.maps, state.duel_player.maps.html_root);

  return Promise.resolve();
}

function _html_remove_maps(element: HTMLElement) {
  console.log(element);
  log.log("IMPLEMENT ME: _html_remove_opponents");
}

function _html_render_maps(data: MapData[], element: HTMLElement) {
  let rows = _html_render_maps_header();
  rows += data.map((map) => _html_render_map_row(map)).join("");
  const html = `
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_maps_header(): string {
  return `
<div class="m11-maps__row m11-maps__row--header">
  <div class="m11-maps__cell m11-maps__cell--header m11-maps__cell--name">name</div>
  <div class="m11-maps__cell m11-maps__cell--header">games</div>
  <div class="m11-maps__cell m11-maps__cell--header">opponents</div>
  <div class="m11-maps__cell m11-maps__cell--header">win rate</div>
  <div class="m11-maps__cell m11-maps__cell--header">frag %</div>
  <div class="m11-maps__cell m11-maps__cell--header">dmg %</div>
  <div class="m11-maps__cell m11-maps__cell--header">dmg/min</div>
</div>
`;
}

function _html_render_map_row(map: MapData): string {
  return `
<div class="m11-maps__row m11-maps__row--map">
  <div class="m11-maps__cell m11-maps__cell--map m11-maps__cell--name">${map.map}</div>
  <div class="m11-maps__cell m11-maps__cell--map">${map.game_cnt}</div>
  <div class="m11-maps__cell m11-maps__cell--map">${map.opponent_cnt}</div>
  <div class="m11-maps__cell m11-maps__cell--map">${map.avg_avg_win_probability}</div>
  <div class="m11-maps__cell m11-maps__cell--map">${map.avg_avg_frag_proportion}</div>
  <div class="m11-maps__cell m11-maps__cell--map">${map.avg_avg_dmg_proportion}</div>
  <div class="m11-maps__cell m11-maps__cell--map">${map.avg_avg_dmg_per_minute}</div>
</div>
`;
}
