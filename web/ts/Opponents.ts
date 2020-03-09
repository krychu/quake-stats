import { state } from "./State";
import { OpponentData } from "./Data";
import {
    html_name_cell,
    html_bar_cell,
    html_cmp_cell_100percent,
    html_cmp_cell_clamped_frac,
    html_header_name_cell,
    html_header_bar_cell,
    html_header_cmp_cell,
    SortDirection
} from "./Utils";
import { rec_sort_duel_player_opponents } from "./Recipes";
import * as cmd from "./Cmd";
import * as log from "./Log";

type ColumnName = "opponent" | "games" | "winrate" | "frags" | "dmg" | "lg acc" | "fq map";

export interface Opponents {
    html_root: HTMLElement | null;
    sort_column_name: ColumnName;
    sort_direction: SortDirection;
};

const commands: [string, cmd.Cmd][] = [
    [ "opponents_create_html_root",      cmd_opponents_create_html_root ],
    [ "opponents_attach_html_root",      cmd_opponents_attach_html_root ],
    [ "opponents_render_data",           cmd_opponents_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    const substate: Opponents = {
        html_root: null,
        sort_column_name: "winrate",
        sort_direction: "desc"
    };
    state.duel_player.opponents = substate;
    log.log("Opponents module initialized");
}

export function shutdown() {
}

function cmd_opponents_create_html_root(): Promise<void> {
    if (!state.duel_player.opponents) {
        log.log("Opponents.ts - cmd_opponents_create_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
    html_root.addEventListener("click", (e) => { _on_click(e); });
    html_root.className = "m11-opponents";
    state.duel_player.opponents.html_root = html_root;
    return Promise.resolve();
}

function cmd_opponents_attach_html_root(): Promise<any> {
  if (!state.duel_player.opponents || !state.duel_player.opponents.html_root || !state.html_main) {
    log.log("Opponents.ts - cmd_opponents_attach_html_root - wrong state");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_player.opponents.html_root);
  return Promise.resolve();
}

function cmd_opponents_render_data(): Promise<any> {
    if (!state.duel_player.player || !state.duel_player.opponents || !state.duel_player.opponents.html_root || !state.duel_player.data || !state.duel_player.data.games) {
    log.log("Opponents.ts - cmd_opponents_render_data - wrong state");
    return Promise.reject();
  }

  _html_remove_opponents(state.duel_player.opponents.html_root);
  _html_render_opponents(state.duel_player.player, state.duel_player.data.opponents, state.duel_player.opponents.html_root);

  return Promise.resolve();
}

function _html_remove_opponents(element: HTMLElement) {
    element.innerHTML = "";
}

function _html_render_opponents(player: string, data: OpponentData[], element: HTMLElement) {
    if (!data.length || !state.duel_player.opponents) {
        return;
    }

    const sort_column_name = state.duel_player.opponents.sort_column_name;
    const sort_direction = state.duel_player.opponents.sort_direction;

  const title = _html_render_title();
    let rows = _html_render_opponents_header(player, sort_column_name, sort_direction);
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
<div class="section_title">
Opponents
</div>
`;
}

function _html_render_opponents_header(player: string, c: ColumnName, d: SortDirection): string {
  return `
<div class="table__header-row">
  <!--<div class="m11-opponents__player-a-cell m11-opponents__cell--header"><div>${player}</div></div>-->
  <!--<div class="m11-opponents__vs-cell m11-opponents__cell--header">vs</div>-->
  ${html_header_name_cell("opponent", "table__name-cell--huge table__cell--first-column", c === "opponent" ? d : null)}
  ${html_header_bar_cell("games", "", c === "games" ? d : null)}
  ${html_header_cmp_cell("winrate", "", c === "winrate" ? d : null)}
  ${html_header_cmp_cell("frags", "", c === "frags" ? d : null)}
  ${html_header_cmp_cell("dmg", "", c === "dmg" ? d : null)}
  ${html_header_cmp_cell("lg acc", "", c === "lg acc" ? d : null)}
  ${html_header_name_cell("fq map", "", c === "fq map" ? d : null)}
</div>
`;
}

function _html_render_opponent_row(player: string, d: OpponentData, max_game_cnt: number): string {
  return `
<div class="table__row">
  <!--<div class="m11-opponents__player-a-cell m11-opponents__cell--opponent"><div>${player}</div></div>-->
  <!--<div class="m11-opponents__vs-cell">vs</div>-->

  ${html_name_cell(d.name, "table__name-cell--huge table__cell--first-column")}
  ${html_bar_cell(d.game_cnt, max_game_cnt, 8)}
  ${html_cmp_cell_100percent(d.a_win_percent, d.b_win_percent)}
  ${html_cmp_cell_100percent(d.a_avg_frag_percent, d.b_avg_frag_percent)}
  ${html_cmp_cell_100percent(d.a_avg_dmg_percent, d.b_avg_dmg_percent)}
  ${html_cmp_cell_clamped_frac(d.a_avg_lg_acc_percent, d.b_avg_lg_acc_percent, true)}
  ${html_name_cell(d.most_frequent_map)}
</div>
`;
}

function _on_click(e: any): void {
    for (let i = 0; i < e.path.length; i++) {
        if  (e.path[i].classList && e.path[i].classList.contains("table__cell--header")) {
            return _on_table_header_cell_click(e.path[i]);
        }
    }
}

function _on_table_header_cell_click(cell: HTMLElement): void {
    if (!state.duel_player.opponents) {
        return;
    }

    const column_name: ColumnName = (cell.querySelector(".table__cell__header-name") as HTMLElement).innerText.toLowerCase().trim() as ColumnName;

    let sort_direction: SortDirection = "desc";
    if (state.duel_player.opponents.sort_column_name === column_name && state.duel_player.opponents.sort_direction === "desc") {
        sort_direction = "asc";
    }

    state.duel_player.opponents.sort_column_name = column_name;
    state.duel_player.opponents.sort_direction = sort_direction;

    rec_sort_duel_player_opponents();
}
