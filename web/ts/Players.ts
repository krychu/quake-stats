import { state, DPS_PlayerData, Cmd } from "./State";
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
  html_root.className = "duel-players";
  html_root.addEventListener("click", (e) => { _on_click(e); });
  return Promise.resolve(html_root);
}

function cmd_duel_players_attach_root_html(): Promise<void> {
  if (state.duel_players.players.html_root == null || state.html_main == null) {
    log.log("Players::cmd_duel_players_attach_root_html - state doesn't contain required data");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_players.players.html_root);
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
<div class="duel-players__header">
  <div class="duel-players__header__name-cell">name</div>
  <div class="duel-players__header__cell">games</div>
</div>
`;
}

function _html_render_players_row(p: DPS_PlayerData): string {
  return `
<div class="duel-players__player">
  <div class="duel-players__player__name-cell">${p.name}</div>
  <div class="duel-players__player__cell">${p.game_cnt}</div>
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
    if (e.path[i].classList.contains("duel-players__player")) {
      ee = e.path[i];
      break;
    }
  }

  if (ee != null) {
    const name = ee.getElementsByClassName("duel-players__player__name-cell")[0].innerText;
    location.href = `/1vs1/${name}`;
  }
}
