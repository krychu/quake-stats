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
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">win rate</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">frag %</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">dmg %</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">lg %</div>
  <div class="m11-opponents__cell m11-opponents__cell--header m11-opponents__cell--name">fq map</div>
</div>
`;
}

function _html_render_opponent_row(opponent: OpponentData): string {
  return `
<div class="m11-opponents__row m11-opponents__row--opponent">
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.name_b}</div>
  ${_game_cnts(opponent)}
  ${_cmp_avg_win_probability(opponent)}
  ${_cmp_avg_frag_proportion(opponent)}
  ${_cmp_avg_dmg_proportion(opponent)}
  ${_cmp_avg_lg_accuracy(opponent)}
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--name">${opponent.most_frequent_map}</div>
</div>
`;
}

function _game_cnts(d: OpponentData): string {
  const val = d.game_cnt;
  const bar = d.game_cnt / d.max_game_cnt;
  return _val_with_bar(val.toString(), bar, 80);
}

function _cmp_avg_win_probability(d: OpponentData): string {
  const a = d.avg_win_probability;
  const b = d.avg_win_probability_b;
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp_avg_frag_proportion(d: OpponentData): string {
  const a = d.avg_frag_proportion;
  const b = d.avg_frag_proportion_b;
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp_avg_dmg_proportion(d: OpponentData): string {
  const a = d.avg_dmg_proportion;
  const b = d.avg_dmg_proportion_b;
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp_avg_lg_accuracy(d: OpponentData): string {
  const a = d.avg_lg_accuracy;
  const b = d.avg_lg_accuracy_b;
  const bar = 2.0 * b / (a + b) - 1.0;
  return _cmp(a.toString(), b.toString(), bar);
}

function _cmp(a: string, b: string, bar: number, mul: number = 40, is_percent: boolean = false): string {
  //const mul = 32;
  const bar_width = Math.abs(bar) * mul;
  let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
  if (bar >= 0) {
    bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
  }
  let percent_span = "";
  if (is_percent) {
    percent_span = `<span class="m11-opponents__cell__percent">%</span>`;
  }
  return `
<div class="m11-opponents__cmp-cell m11-opponents__cell--opponent">
  <div class="m11-opponents__cmp-cell__a">${a}${percent_span}</div>
  <div class="m11-opponents__cmp-cell__separator"></div>
  <div class="m11-opponents__cmp-cell__b">${b}${percent_span}</div>
  <div class="m11-opponents__cmp-cell__bar ${bar <= 0 ? "m11-opponents__cmp-cell__bar--better" : "m11-opponents__cmp-cell__bar--worse"}" style="${bar_style}"></div>
</div>
`;
}

function _val_with_bar(a: string, bar: number, mul: number = 32): string {
  const bar_width = Math.abs(bar) * mul;
  const bar_style = `width: ${bar_width}px;`;
  return `
<div class="m11-opponents__bar-cell">
  <div class="m11-opponents__bar-cell__value">${a}</div>
  <div class="m11-opponents__bar-cell__bar" style="${bar_style}"></div>
</div>
`;
}
