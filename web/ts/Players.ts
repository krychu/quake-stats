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
  rows += data.map((player) => _html_render_players_row(player)).join("");
  const html = `${rows}`;

  element.insertAdjacentHTML("beforeend", html);
  // element.getElementsByClassName("duel-players__player").map((e) => {

  // });
}

function _html_render_players_header(): string {
  return `
<div class="m11-players__header">
  <div class="m11-players__header__name-cell">name</div>
  <div class="m11-players__header__cmp-cell">win%</div>
  <div class="m11-players__header__cell">games</div>
  <div class="m11-players__header__cell">last game</div>
</div>
`;
}

function _html_render_players_row(p: DPS_PlayerData): string {
  return `
<div class="m11-players__player">
  <div class="m11-players__name-cell"><div>${p.name}</div></div>
  ${_cmp_avg_win_rate(p)}
  <div class="m11-players__cell">${p.game_cnt}</div>
  <div class="m11-players__cell">${time_ago(p.last_game_date)}</div>
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

function _cmp_avg_win_rate(d: Pick<DPS_PlayerData, "a_win_percent" | "b_win_percent">): string {
    const a = d.a_win_percent;
    const b = d.b_win_percent;
    if (a == null || b == null) {
        return _cmp_na();
    }
    const bar = (50 - a) / 50.0;
    return _cmp(a.toString(), b.toString(), bar, undefined, undefined);
}

function _cmp(a: string, b: string, bar: number, mul = 40, is_percent = false): string {
    //const mul = 32;
    const bar_width = Math.abs(bar) * mul;
    let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
    if (bar >= 0) {
        bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
    }
    let percent_span = "";
    if (is_percent) {
        percent_span = `<span class="m11-players__cell__percent">%</span>`;
    }

    return `
<div class="m11-players__cmp-cell">
  <div class="m11-players__cmp-cell__a">${a}${percent_span}</div>
  <div class="m11-players__cmp-cell__separator"></div>
  <div class="m11-players__cmp-cell__b">${b}${percent_span}</div>
  <div class="m11-players__cmp-cell__bar ${bar <= 0 ? "m11-players__cmp-cell__bar--better" : "m11-players__cmp-cell__bar--worse"}" style="${bar_style}"></div>
</div>
`;
}

function _cmp_na(): string {
    return `<div class="m11-players__cmp-cell m11-players__cmp-cell--na">n/a</div>`;
}
