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
  if (state.duel_player.player == null || state.duel_player.maps.html_root == null || state.duel_player.data.maps == null) {
    log.log("Opponents::cmd_opponents_render_data - state doesn't contain required data");
    return Promise.reject();
  }

  _html_remove_maps(state.duel_player.maps.html_root);
  _html_render_maps(state.duel_player.player, state.duel_player.data.maps, state.duel_player.maps.html_root);

  return Promise.resolve();
}

function _html_remove_maps(element: HTMLElement) {
  console.log(element);
  log.log("IMPLEMENT ME: _html_remove_opponents");
}

function _html_render_maps(player: string, data: MapData[], element: HTMLElement) {
  const title = _html_render_title();
  let rows = _html_render_maps_header(player);
  rows += data.map((map) => _html_render_map_row(player, map)).join("");
  const html = `
${title}
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_title(): string {
  return `
<div class="m11-maps__title">
Maps
</div>
`;
}

function _html_render_maps_header(player: string): string {
  return `
<div class="m11-maps__row m11-maps__row--header">
  <div class="m11-maps__player-a-cell m11-maps__cell--header"><div>${player}</div></div>
  <div class="m11-maps__vs-cell m11-maps__cell--header">vs</div>
  <div class="m11-maps__player-b-cell m11-maps__cell--header">opponent</div>
  <div class="m11-maps__cell m11-maps__cell--header m11-maps__cell--name">map</div>
  <div class="m11-maps__cell m11-maps__cell--header">games</div>
  <div class="m11-maps__cell m11-maps__cell--header">opponents</div>
  <div class="m11-maps__cmp-cell m11-maps__cell--header">win rate</div>
  <div class="m11-maps__cmp-cell m11-maps__cell--header">frag %</div>
  <div class="m11-maps__cmp-cell m11-maps__cell--header">dmg %</div>
  <div class="m11-maps__cmp-cell m11-maps__cell--header">dmg/min</div>
</div>
`;
}

function _html_render_map_row(player: string, map: MapData): string {
  return `
<div class="m11-maps__row m11-maps__row--map">
  <div class="m11-maps__player-a-cell m11-maps__cell--map"><div>${player}</div></div>
  <div class="m11-maps__vs-cell m11-maps__cell--map">vs</div>
  <div class="m11-maps__player-b-cell m11-maps__cell--map">opponent</div>
  <div class="m11-maps__cell m11-maps__cell--map m11-maps__cell--name">${map.map}</div>
  ${_game_cnts(map)}
  <div class="m11-maps__cell m11-maps__cell--map">${map.opponent_cnt}</div>
  ${_cmp_avg_avg_win_probability(map)}
  ${_cmp_avg_avg_frag_proportion(map)}
  ${_cmp_avg_avg_dmg_proportion(map)}
  ${_cmp_avg_avg_dmg_per_minute(map)}
</div>
`;
}

function _game_cnts(map: MapData): string {
  const val = map.game_cnt;
  const bar = map.game_cnt / map.max_game_cnt;
  return _val_with_bar(val.toString(), bar, 80);
}

function _cmp_avg_avg_win_probability(map: Pick<MapData, "avg_avg_win_probability" | "avg_avg_win_probability_b">): string {
  const a = map.avg_avg_win_probability;
  const b = map.avg_avg_win_probability_b;
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp_avg_avg_frag_proportion(map: Pick<MapData, "avg_avg_frag_proportion" | "avg_avg_frag_proportion_b">): string {
  const a = map.avg_avg_frag_proportion;
  const b = map.avg_avg_frag_proportion_b;
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp_avg_avg_dmg_proportion(map: Pick<MapData, "avg_avg_dmg_proportion" | "avg_avg_dmg_proportion_b">): string {
  const a = map.avg_avg_dmg_proportion;
  const b = map.avg_avg_dmg_proportion_b;
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp_avg_avg_dmg_per_minute(map: Pick<MapData, "avg_avg_dmg_per_minute" | "avg_avg_dmg_per_minute_b">): string {
  const a = map.avg_avg_dmg_per_minute;
  const b = map.avg_avg_dmg_per_minute_b;
  let bar = 0;
  if (a > b) {
    bar = Math.max(1.0 - a / b, -1.0);
  } else if (b > a) {
    bar = Math.min(b / a - 1.0, 1.0);
  }
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp(a: string, b: string, bar: number, mul = 40): string {
  //const mul = 32;
  const bar_width = Math.abs(bar) * mul;
  let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
  if (bar >= 0) {
    bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
  }

  return `
<div class="m11-maps__cmp-cell">
  <div class="m11-maps__cmp-cell__a">${a}</div>
  <div class="m11-maps__cmp-cell__separator"></div>
  <div class="m11-maps__cmp-cell__b">${b}</div>
  <div class="m11-maps__cmp-cell__bar ${bar <= 0 ? "m11-maps__cmp-cell__bar--better" : "m11-maps__cmp-cell__bar--worse"}" style="${bar_style}"></div>
</div>
`;
}

function _val_with_bar(a: string, bar: number, mul: number = 32): string {
  const bar_width = Math.abs(bar) * mul;
  const bar_style = `width: ${bar_width}px;`;
  return `
<div class="m11-maps__bar-cell">
  <div class="m11-maps__bar-cell__value">${a}</div>
  <div class="m11-maps__bar-cell__bar" style="${bar_style}"></div>
</div>
`;
}

//  <div class="m11-maps__cell m11-maps__cell--map m11-maps__cell--name">${map.map}</div>

