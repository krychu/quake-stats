import { state, DPS_PlayerData, Cmd } from "./State";
import { time_ago } from "./Utils";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
  [ "duel_players_create_html_root",    cmd_duel_players_create_html_root ],
  [ "duel_players_attach_html_root",    cmd_duel_players_attach_root_html ],
  [ "duel_players_render_data",         cmd_duel_players_render_data ]
];

export function init() {
  cmd.add_cmds(commands);
  log.log("DuelPlayers module initialized");
}

export function shutdown() {

}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
function cmd_duel_players_create_html_root(): Promise<any> {
  const html_root = document.createElement("div");
  html_root.className = "m11-players";
  html_root.addEventListener("click", (e) => { _on_click(e); });
  return Promise.resolve(html_root);
}

function cmd_duel_players_attach_root_html(): Promise<void> {
  if (state.duel_players.players.html_root == null || state.html_main_2cols == null) {
    log.log("Players::cmd_duel_players_attach_root_html - state doesn't contain required data");
    return Promise.reject();
  }

  state.html_main_2cols.appendChild(state.duel_players.players.html_root);
  return Promise.resolve();
}

function cmd_duel_players_render_data(): Promise<void> {
  if (state.duel_players.players.html_root == null || state.duel_players.data.players == null) {
    log.log("Players::cmd_duel_players_render_data - state doesn't contain required data");
    return Promise.reject();
  }

  _html_remove_players(state.duel_players.players.html_root);
  _html_render_players(state.duel_players.data.players, state.duel_players.players.html_root);

  return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _html_remove_players(element: HTMLElement) {
  console.log(element);
  log.log("IMPLEMENT ME: _html_remove_players");
}

function _html_render_players(data: DPS_PlayerData[], element: HTMLElement) {
    let rows = _html_render_players_header();
    const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);
    rows += data.map((player) => _html_render_players_row(player, max_game_cnt)).join("");
  const html = `${rows}`;

  element.insertAdjacentHTML("beforeend", html);
  // element.getElementsByClassName("duel-players__player").map((e) => {

  // });
}

function _html_render_players_header(): string {
  return `
<div class="table__header-row">
  <div class="m11-players__header__name-cell">name</div>
  <div class="table__header-cell table__cell--small">games</div>
  <div class="table__header-cell table__cell--center-align">win%</div>
  <div class="table__header-cell table__cell--center-align">FPG%</div>
  <div class="table__header-cell table__cell--center-align table__cell--lg-header">LG acc</div>
  <div class="table__header-cell table__cell--tiny table__cell--right-align">last</div>
</div>
`;
}

function _html_render_players_row(p: DPS_PlayerData, max_game_cnt: number): string {
  return `
<div class="m11-players__player">
  <div class="m11-players__name-cell"><div>${p.name}</div></div>
  ${_game_cnts(p.game_cnt, max_game_cnt)}
  <div class="table__cell table__cell--center-right-align">${p.a_win_percent}%</div>
  <div class="table__cell table__cell--center-right-align">${p.avg_frag_percent}%</div>
  <div class="table__cell table__cell--center-right-align">${p.avg_lg_acc_percent}%</div>
  <div class="table__cell table__cell--tiny table__cell--right-align">${time_ago(p.last_game_date)}</div>
</div>
`;
}

/**
 * This is a click handler installed on a parent item so it has to deal with
 * clicks on parent and all children items.
 */
function _on_click(e: any): void {
  let ee = null;
  for (let i = 0; i < e.path.length; i++) {
    if (e.path[i].classList.contains("m11-players__player")) {
      ee = e.path[i];
      break;
    }
  }

  if (ee != null) {
    const name = ee.getElementsByClassName("m11-players__name-cell")[0].innerText;
    location.href = `/1vs1/${name}`;
  }
}

function _game_cnts(game_cnt: number, max_game_cnt: number): string {
    const divider = Math.max(max_game_cnt, 30);
    return _val_with_bar(game_cnt.toString(), game_cnt / divider, 70);
}

function _val_with_bar(a: string, bar: number, mul: number = 32): string {
    const bar_width = Math.abs(bar) * mul;
    const bar_style = `width: ${bar_width}px;`;
    return `
<div class="table__bar-cell table__cell--small">
  <div class="table__bar-cell__value">${a}</div>
  <div class="table__bar-cell__bar" style="${bar_style}"></div>
</div>
`;
}

// function _cmp_avg_win_rate(d: Pick<DPS_PlayerData, "a_win_percent" | "b_win_percent">): string {
//     const a = d.a_win_percent;
//     const b = d.b_win_percent;
//     if (a == null || b == null) {
//         return _cmp_na();
//     }
//     const bar = (50 - a) / 50.0;
//     return _cmp(a.toString(), b.toString(), bar, undefined, undefined);
// }

// function _cmp(a: string, b: string, bar: number, mul = 40, is_percent = false): string {
//     //const mul = 32;
//     const bar_width = Math.abs(bar) * mul;
//     let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
//     if (bar >= 0) {
//         bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
//     }
//     let percent_span = "";
//     if (is_percent) {
//         percent_span = `<span class="m11-players__cell__percent">%</span>`;
//     }

//     return `
// <div class="m11-players__cmp-cell">
//   <div class="m11-players__cmp-cell__a">${a}${percent_span}</div>
//   <div class="m11-players__cmp-cell__separator"></div>
//   <div class="m11-players__cmp-cell__b">${b}${percent_span}</div>
//   <div class="m11-players__cmp-cell__bar ${bar <= 0 ? "m11-players__cmp-cell__bar--better" : "m11-players__cmp-cell__bar--worse"}" style="${bar_style}"></div>
// </div>
// `;
// }

// function _cmp_na(): string {
//     return `<div class="m11-players__cmp-cell m11-players__cmp-cell--na">n/a</div>`;
// }
