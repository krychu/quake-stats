import { state } from "./State";
import { PlayerData } from "./Data";
import {
    html_bar_cell,
    html_header_bar_cell,
    html_time_cell,
    html_header_time_cell,
    html_name_cell,
    html_header_name_cell,
    html_center_right_align_cell,
    html_header_center_right_align_cell
} from "./Utils";
import * as cmd from "./Cmd";
import * as log from "./Log";

export interface Players {
    html_root: HTMLElement | null;
};

const commands: [string, cmd.Cmd][] = [
  [ "duel_players_create_html_root",    cmd_duel_players_create_html_root ],
  [ "duel_players_attach_html_root",    cmd_duel_players_attach_root_html ],
  [ "duel_players_render_data",         cmd_duel_players_render_data ]
];

export function init() {
  cmd.add_cmds(commands);
    const substate: Players = {
        html_root: null
    };
    state.duel_players.players = substate;
    log.log("DuelPlayers module initialized");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
function cmd_duel_players_create_html_root(): Promise<void> {
    if (!state.duel_players.players) {
        log.log("Players.ts - cmd_duel_players_create_html_root - wrong state");
        return Promise.reject();
    }
  const html_root = document.createElement("div");
    html_root.addEventListener("click", (e) => { _on_click(e); });
    state.duel_players.players.html_root = html_root;
  return Promise.resolve();
}

function cmd_duel_players_attach_root_html(): Promise<void> {
  if (!state.duel_players.players || !state.duel_players.players.html_root || !state.html_main) {
    log.log("Players.ts - cmd_duel_players_attach_root_html - wrong state");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_players.players.html_root);
  return Promise.resolve();
}

function cmd_duel_players_render_data(): Promise<void> {
  if (!state.duel_players.players || !state.duel_players.players.html_root || !state.duel_players.data) {
    log.log("Players.ts - cmd_duel_players_render_data - wrong state");
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
    element.innerHTML = "";
}

function _html_render_players(data: PlayerData[], element: HTMLElement) {
    if (!data.length) {
        return;
    }

    let rows = _html_render_players_header();
    const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);
    const max_opponent_cnt = data.reduce((acc, cur) => (cur.opponent_cnt > acc) ? cur.opponent_cnt : acc, 0);
    rows += data.map((player) => _html_render_players_row(player, max_game_cnt, max_opponent_cnt)).join("");
  const html = `${rows}`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_players_header(): string {
  return `
<div class="table__header-row">
  ${html_header_name_cell("name", "table__name-cell--huge table__cell--first-column")}
  ${html_header_bar_cell("games")}
  ${html_header_bar_cell("opponents")}
  ${html_header_center_right_align_cell("winrate", 18)}
  ${html_header_center_right_align_cell("fpg", 18)}
  ${html_header_center_right_align_cell("LG acc", 33)}
  ${html_header_time_cell("last")}
</div>
`;
}

function _html_render_players_row(p: PlayerData, max_game_cnt: number, max_opponent_cnt: number): string {
  return `
<div class="table__row">
  ${html_name_cell(p.name, "table__name-cell--huge table__cell--first-column")}
  ${html_bar_cell(p.game_cnt, max_game_cnt)}
  ${html_bar_cell(p.opponent_cnt, max_opponent_cnt, 10)}
  ${html_center_right_align_cell(p.a_win_percent, "", true)}
  ${html_center_right_align_cell(p.avg_frag_percent, "", true)}
  ${html_center_right_align_cell(p.avg_lg_acc_percent, "", true)}
  ${html_time_cell(p.last_game_date)}
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
    if (e.path[i].classList.contains("table__row")) {
      ee = e.path[i];
      break;
    }
  }

  if (ee != null) {
    const name = ee.getElementsByClassName("table__name-cell")[0].innerText;
    location.href = `/1vs1/${name}`;
  }
}
