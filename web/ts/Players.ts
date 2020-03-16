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
    html_header_center_right_align_cell,
    SortDirection
} from "./Utils";
import * as cmd from "./Cmd";
import * as log from "./Log";
import { rec_sort_duel_players } from "./Recipes";

type ColumnName = "player" | "games" | "opponents" | "winrate" | "frags" | "lg hits" | "ago";

export interface Players {
    html_root: HTMLElement | null;
    sort_column_name: ColumnName;
    sort_direction: SortDirection;
};

const commands: [string, cmd.Cmd][] = [
  [ "duel_players_create_html_root",    cmd_duel_players_create_html_root ],
  [ "duel_players_attach_html_root",    cmd_duel_players_attach_root_html ],
  [ "duel_players_render_data",         cmd_duel_players_render_data ]
];

export function init() {
  cmd.add_cmds(commands);
    const substate: Players = {
        html_root: null,
        sort_column_name: "games",
        sort_direction: "desc"
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
    if (!data.length || !state.duel_players.players) {
        return;
    }

    const sort_column_name = state.duel_players.players.sort_column_name;
    const sort_direction = state.duel_players.players.sort_direction;

    let rows = _html_render_players_header(sort_column_name, sort_direction);
    const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);
    const max_opponent_cnt = data.reduce((acc, cur) => (cur.opponent_cnt > acc) ? cur.opponent_cnt : acc, 0);
    rows += data.map((player) => _html_render_players_row(player, max_game_cnt, max_opponent_cnt)).join("");
  const html = `${rows}`;

    element.insertAdjacentHTML("beforeend", html);
}

function _html_render_players_header(c: ColumnName, d: SortDirection): string {
    return `
<div class="table__header-row">
  ${html_header_name_cell("player", "table__name-cell--huge table__cell--first-column", c === "player" ? d : null)}
  ${html_header_bar_cell("games", "", c === "games" ? d : null)}
  ${html_header_bar_cell("opponents", "", c === "opponents" ? d : null)}
  ${html_header_center_right_align_cell("winrate", 0, "table__cell--small", c === "winrate" ? d : null)}
  ${html_header_center_right_align_cell("frags", 0, "table__cell--small", c === "frags" ? d : null)}
  ${html_header_center_right_align_cell("lg hits", 11, "table__cell--small", c === "lg hits" ? d : null)}
  ${html_header_time_cell("ago", "", c === "ago" ? d : null)}
</div>
`;
}

function _html_render_players_row(p: PlayerData, max_game_cnt: number, max_opponent_cnt: number): string {
  return `
<div class="table__row">
  ${html_name_cell(p.name, "table__name-cell--huge table__cell--first-column")}
  ${html_bar_cell(p.game_cnt, max_game_cnt)}
  ${html_bar_cell(p.opponent_cnt, max_opponent_cnt, 10)}
  ${html_center_right_align_cell(p.a_win_percent, "table__cell--small", true)}
  ${html_center_right_align_cell(p.avg_frag_percent, "table__cell--small", true)}
  ${html_center_right_align_cell(p.avg_lg_acc_percent, "table__cell--small", true)}
  ${html_time_cell(p.last_game_minutes_ago)}
</div>
`;
}

/**
 * This is a click handler installed on a parent item so it has to deal with
 * clicks on parent and all children items.
 */
function _on_click(e: any): void {
    for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].classList && e.path[i].classList.contains("table__row")) {
            return _on_table_row_click(e.path[i]);
        } else if  (e.path[i].classList.contains("table__cell--header")) {
            return _on_table_header_cell_click(e.path[i]);
        }
    }
}

function _on_table_row_click(table_row: HTMLElement): void {
    const name = (table_row.getElementsByClassName("table__name-cell")[0] as HTMLElement).innerText;
    location.href = `/1vs1/${name}`;
}

function _on_table_header_cell_click(header_cell: HTMLElement): void {
    if (!state.duel_players.players) {
        return;
    }

    const column_name: ColumnName = (header_cell.querySelector(".table__cell__header-name") as HTMLElement).innerText.toLowerCase().trim() as ColumnName;

    let sort_direction: SortDirection = "desc";
    if (state.duel_players.players.sort_column_name === column_name && state.duel_players.players.sort_direction === "desc") {
        sort_direction = "asc";
    }

    state.duel_players.players.sort_column_name = column_name;
    state.duel_players.players.sort_direction = sort_direction;

    rec_sort_duel_players();
}
