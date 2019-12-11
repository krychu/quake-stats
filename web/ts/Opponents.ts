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
  if (state.duel_player.player == null || state.duel_player.opponents.html_root == null || state.duel_player.data.games == null) {
    log.log("Opponents::cmd_opponents_render_data - state doesn't contain required data");
    return Promise.reject();
  }

  _html_remove_opponents(state.duel_player.opponents.html_root);
  _html_render_opponents(state.duel_player.player, state.duel_player.data.opponents, state.duel_player.opponents.html_root);

  return Promise.resolve();
}

function _html_remove_opponents(element: HTMLElement) {
  console.log(element);
  log.log("IMPLEMENT ME: _html_remove_opponents");
}

function _html_render_opponents(player: string, data: OpponentData[], element: HTMLElement) {
  let rows = _html_render_opponents_header();
  rows += _html_render_avg_top5_row(player, data, "avg (top 5)");
  rows += _html_render_avg_row(player, data, "avg (all)");
  rows += data.map((opponent) => _html_render_opponent_row(player, opponent)).join("");
  const html = `
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_opponents_header(): string {
  return `
<div class="m11-opponents__row m11-opponents__row--header">
  <div class="m11-opponents__cell m11-opponents__cell--header m11-opponents__cell--name-a"></div>
  <div class="m11-opponents__cell m11-opponents__cell--header m11-opponents__cell--name-b">opponent</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">games</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">win rate</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">frag %</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">dmg %</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">lg %</div>
  <div class="m11-opponents__cell m11-opponents__cell--header m11-opponents__cell--map">fq map</div>
</div>
`;
}

function _html_render_opponent_row(player: string, opponent: OpponentData): string {
  return `
<div class="m11-opponents__row m11-opponents__row--opponent">
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name-a">${player} vs</div>
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name-b">${opponent.name_b}</div>
  ${_game_cnts(opponent)}
  ${_cmp_avg_win_probability(opponent)}
  ${_cmp_avg_frag_proportion(opponent)}
  ${_cmp_avg_dmg_proportion(opponent)}
  ${_cmp_avg_lg_accuracy(opponent)}
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--map">${opponent.most_frequent_map}</div>
</div>
`;
}

function _html_render_avg_row(player: string, data: OpponentData[], name = "avg"): string {
  // These are averages of averages but the names are don't reflect it so that
  // they can be used as names of object properties.
  const avg_win_probability = Math.round(data.reduce((a, d) => a + d.avg_win_probability, 0) / data.length);
  const avg_win_probability_b = 100 - avg_win_probability;
  const avg_frag_proportion = Math.round(data.reduce((a, d) => a + d.avg_frag_proportion, 0) / data.length);
  const avg_frag_proportion_b = 100 - avg_frag_proportion;
  const avg_dmg_proportion = Math.round(data.reduce((a, d) => a + d.avg_dmg_proportion, 0) / data.length);
  const avg_dmg_proportion_b = 100 - avg_dmg_proportion;
  const avg_lg_accuracy = Math.round(data.reduce((a, d) => a + d.avg_lg_accuracy, 0) / data.length);
  const avg_lg_accuracy_b = Math.round(data.reduce((a, d) => a + d.avg_lg_accuracy_b, 0) / data.length);

  return `
 <div class="m11-opponents__row m11-opponents__row--avg">
   <div class="m11-opponents__cell m11-opponents__cell--name-a m11-opponents__cell--avg">${player} vs</div>
   <div class="m11-opponents__cell m11-opponents__cell--name-b m11-opponents__cell--avg">${name}</div>
   ${_game_cnts({game_cnt: 0, max_game_cnt: 1}, true)}
   ${_cmp_avg_win_probability({avg_win_probability, avg_win_probability_b}, true)}
   ${_cmp_avg_frag_proportion({avg_frag_proportion, avg_frag_proportion_b}, true)}
   ${_cmp_avg_dmg_proportion({avg_dmg_proportion, avg_dmg_proportion_b}, true)}
   ${_cmp_avg_lg_accuracy({avg_lg_accuracy, avg_lg_accuracy_b}, true)}
   <div class="m11-opponents__cell m11-opponents__cell--map m11-opponents__cell--avg"></div>
 </div>
`;
}

function _html_render_avg_top5_row(player: string, data: OpponentData[], name = "avg top5"): string {
  return _html_render_avg_row(player, data.slice(0, 5), name);
}

function _game_cnts(d: Pick<OpponentData, "game_cnt" | "max_game_cnt">, avg = false): string {
  if (avg) {
    return _val_with_bar("", 0, undefined, avg);
  }
  const val = d.game_cnt;
  const bar = d.game_cnt / d.max_game_cnt;
  return _val_with_bar(val.toString(), bar, 80, avg);
}

function _cmp_avg_win_probability(d: Pick<OpponentData, "avg_win_probability" | "avg_win_probability_b">, avg = false): string {
  const a = d.avg_win_probability;
  const b = d.avg_win_probability_b;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined, avg);
}

function _cmp_avg_frag_proportion(d: Pick<OpponentData, "avg_frag_proportion" | "avg_frag_proportion_b">, avg = false): string {
  const a = d.avg_frag_proportion;
  const b = d.avg_frag_proportion_b;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined, avg);
}

function _cmp_avg_dmg_proportion(d: Pick<OpponentData, "avg_dmg_proportion" | "avg_dmg_proportion_b">, avg = false): string {
  const a = d.avg_dmg_proportion;
  const b = d.avg_dmg_proportion_b;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined, avg);
}

function _cmp_avg_lg_accuracy(d: Pick<OpponentData, "avg_lg_accuracy" | "avg_lg_accuracy_b">, avg = false): string {
  const a = d.avg_lg_accuracy;
  const b = d.avg_lg_accuracy_b;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = 2.0 * b / (a + b) - 1.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined, avg);
}

/*
 * avg indicates if we're rendering an row with averages.
 */
function _cmp(a: string, b: string, bar: number, mul = 40, is_percent = false, avg = false): string {
  //const mul = 32;
  const bar_width = Math.abs(bar) * mul;
  let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
  if (bar >= 0) {
    bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
  }
  let percent_span = "";
  if (is_percent) {
    percent_span = `<span class="m11-opponents__cell__percent ${avg ? "m11-opponents__cell__percent--avg" : ""}">%</span>`;
  }

  return `
<div class="m11-opponents__cmp-cell m11-opponents__cell--opponent ${avg ? "m11-opponents__cmp-cell--avg" : ""}">
  <div class="m11-opponents__cmp-cell__a ${avg ? "m11-opponents__cmp-cell__a--avg" : ""}">${a}${percent_span}</div>
  <div class="m11-opponents__cmp-cell__separator ${avg ? "m11-opponents__cmp-cell__separator--avg" : ""}"></div>
  <div class="m11-opponents__cmp-cell__b ${avg ? "m11-opponents__cmp-cell__b--avg" : ""}">${b}${percent_span}</div>
  <div class="m11-opponents__cmp-cell__bar ${bar <= 0 ? "m11-opponents__cmp-cell__bar--better" : "m11-opponents__cmp-cell__bar--worse"} ${avg ? "m11-opponents__cmp-cell__bar--avg" : ""}" style="${bar_style}"></div>
</div>
`;
}

function _val_with_bar(a: string, bar: number, mul: number = 32, avg = false): string {
  const bar_width = Math.abs(bar) * mul;
  const bar_style = `width: ${bar_width}px;`;
  return `
<div class="m11-opponents__bar-cell ${avg ? "m11-opponents__bar-cell--avg" : ""}">
  <div class="m11-opponents__bar-cell__value ${avg ? "m11-opponents__bar-cell__value--avg" : ""}">${a}</div>
  <div class="m11-opponents__bar-cell__bar ${avg ? "m11-opponents__bar-cell__bar--avg" : ""}" style="${bar_style}"></div>
</div>
`;
}

function _cmp_na(): string {
  return `<div class="m11-opponents__cmp-cell m11-opponents__cmp-cell--na">n/a</div>`;
}
