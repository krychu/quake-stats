import { state, Cmd, OpponentData } from "./State";
import {
    html_name_cell,
    html_bar_cell,
    html_cmp_cell_100percent
} from "./Utils";
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
  const title = _html_render_title();
  let rows = _html_render_opponents_header(player);
  //rows += _html_render_avg_top5_row(player, data, "avg (top 5)");
  const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);

  //rows += _html_render_avg_row(player, data, "avg (all)");
  rows += data.map((opponent) => _html_render_opponent_row(player, opponent, max_game_cnt)).join("");
  const html = `
${title}
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_title(): string {
  return `
<div class="m11-opponents__title">
Opponents
</div>
`;
}

function _html_render_opponents_header(player: string): string {
  return `
<div class="m11-opponents__row m11-opponents__row--header">
  <!--<div class="m11-opponents__player-a-cell m11-opponents__cell--header"><div>${player}</div></div>-->
  <!--<div class="m11-opponents__vs-cell m11-opponents__cell--header">vs</div>-->
  <div class="m11-opponents__player-b-cell m11-opponents__cell--header">opponent</div>
  <div class="m11-opponents__cell m11-opponents__cell--header">games</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">win rate</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">frag %</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">dmg %</div>
  <div class="m11-opponents__cmp-cell m11-opponents__cell--header">lg acc</div>
  <div class="m11-opponents__cell m11-opponents__cell--header m11-opponents__cell--map">fq map</div>
</div>
`;
}

function _html_render_opponent_row(player: string, d: OpponentData, max_game_cnt: number): string {
  return `
<div class="m11-opponents__row m11-opponents__row--opponent">
  <!--<div class="m11-opponents__player-a-cell m11-opponents__cell--opponent"><div>${player}</div></div>-->
  <!--<div class="m11-opponents__vs-cell">vs</div>-->

  ${html_name_cell(d.name, "table__name-cell--huge-left")}
  ${html_bar_cell(d.game_cnt, max_game_cnt)}
  ${html_cmp_cell_100percent(d.a_win_percent, d.b_win_percent)}
  ${html_cmp_cell_100percent(d.a_avg_frag_percent, d.b_avg_frag_percent)}
  ${html_cmp_cell_100percent(d.a_avg_dmg_percent, d.b_avg_dmg_percent)}
  ${_cmp_avg_dmg_percent(d)}
  ${_cmp_avg_lg_acc_percent(d)}
  <div class="m11-opponents__cell m11-opponents__cell--opponent m11-opponents__cell--map">${d.most_frequent_map}</div>
</div>
`;
}

function _game_cnts(d: Pick<OpponentData, "game_cnt">, max_game_cnt: number): string {
  const val = d.game_cnt;
  const bar = d.game_cnt / max_game_cnt;
  return _val_with_bar(val.toString(), bar, 80);
}

function _cmp_avg_win_rate(d: Pick<OpponentData, "a_win_percent" | "b_win_percent">): string {
  const a = d.a_win_percent;
  const b = d.b_win_percent;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined);
}

function _cmp_avg_frag_percent(d: Pick<OpponentData, "a_avg_frag_percent" | "b_avg_frag_percent">): string {
  const a = d.a_avg_frag_percent;
  const b = d.b_avg_frag_percent;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined);
}

function _cmp_avg_dmg_percent(d: Pick<OpponentData, "a_avg_dmg_percent" | "b_avg_dmg_percent">): string {
  const a = d.a_avg_dmg_percent;
  const b = d.b_avg_dmg_percent;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = (50 - a) / 50.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined);
}

function _cmp_avg_lg_acc_percent(d: Pick<OpponentData, "a_avg_lg_acc_percent" | "b_avg_lg_acc_percent">): string {
  const a = d.a_avg_lg_acc_percent;
  const b = d.b_avg_lg_acc_percent;
  if (a == null || b == null) {
    return _cmp_na();
  }
  const bar = 2.0 * b / (a + b) - 1.0;
  return _cmp(a.toString(), b.toString(), bar, undefined, undefined);
}

/*
 * avg indicates if we're rendering an row with averages.
 */
function _cmp(a: string, b: string, bar: number, mul = 40, is_percent = false): string {
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

function _cmp_na(): string {
  return `<div class="m11-opponents__cmp-cell m11-opponents__cmp-cell--na">n/a</div>`;
}
