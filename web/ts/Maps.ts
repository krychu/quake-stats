import { state } from "./State";
import { MapData } from "./Data";
import {
    html_name_cell,
    html_bar_cell,
    html_cmp_cell_100percent,
    html_cmp_cell_clamped_ratio,
    html_header_name_cell,
    html_header_bar_cell,
    html_header_cmp_cell,
    SortDirection
} from "./Utils";
import { rec_sort_duel_player_maps } from "./Recipes";
import * as cmd from "./Cmd";
import * as log from "./Log";

type ColumnName = "map" | "games" | "opponents" | "winrate" | "frags" | "dmg" | "dmg/min";

export interface Maps {
    html_root: HTMLElement | null;
    sort_column_name: ColumnName;
    sort_direction: SortDirection;
};

const commands: [string, cmd.Cmd][] = [
    [ "maps_create_html_root",      cmd_maps_create_html_root ],
    [ "maps_attach_html_root",      cmd_maps_attach_html_root ],
    [ "maps_render_data",           cmd_maps_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    const substate: Maps = {
        html_root: null,
        sort_column_name: "games",
        sort_direction: "desc"
    };
    state.duel_player.maps = substate;
    log.log("Maps module initialized");
}

export function shutdown() {
}

function cmd_maps_create_html_root(): Promise<void> {
    if (!state.duel_player.maps) {
        log.log("Maps.ts - cmd_maps_create_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
    html_root.addEventListener("click", (e) => { _on_click(e); });
    html_root.className = "m11-maps";
    state.duel_player.maps.html_root = html_root;
    return Promise.resolve();
}

function cmd_maps_attach_html_root(): Promise<any> {
  if (!state.duel_player.maps || !state.duel_player.maps.html_root || !state.html_main) {
    log.log("Maps.ts - cmd_maps_attach_html_root - wrong state");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_player.maps.html_root);
  return Promise.resolve();
}

function cmd_maps_render_data(): Promise<any> {
  if (!state.duel_player.maps || !state.duel_player.player || !state.duel_player.maps.html_root || !state.duel_player.data || !state.duel_player.data.maps) {
    log.log("Maps.ts - cmd_maps_render_data - wrong state");
    return Promise.reject();
  }

  _html_remove_maps(state.duel_player.maps.html_root);
  _html_render_maps(state.duel_player.player, state.duel_player.data.maps, state.duel_player.maps.html_root);

  return Promise.resolve();
}

function _html_remove_maps(element: HTMLElement) {
    element.innerHTML = "";
}

function _html_render_maps(player: string, data: MapData[], element: HTMLElement) {
    if (!data.length || !state.duel_player.maps) {
        return;
    }

    const sort_column_name = state.duel_player.maps.sort_column_name;
    const sort_direction = state.duel_player.maps.sort_direction;

  const title = _html_render_title();
    let rows = _html_render_maps_header(player, sort_column_name, sort_direction);
    const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);
    const max_opponent_cnt = data.reduce((acc, cur) => (cur.opponent_cnt > acc) ? cur.opponent_cnt : acc, 0);
    rows += data.map((map) => _html_render_map_row(player, map, max_game_cnt, max_opponent_cnt)).join("");
  const html = `
${title}
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _html_render_title(): string {
  return `
<div class="section_title">
Maps
</div>
`;
}

function _html_render_maps_header(player: string, c: ColumnName, d: SortDirection): string {
  return `
<div class="table__header-row">
  <!--<div class="m11-maps__player-a-cell m11-maps__cell--header"><div>${player}</div></div>-->
  <!--<div class="m11-maps__vs-cell m11-maps__cell--header">vs</div>-->
  <!--<div class="m11-maps__player-b-cell m11-maps__cell--header">opponent</div>-->
  ${html_header_name_cell("map", "table__name-cell--huge table__cell--first-column", c === "map" ? d : null)}
  ${html_header_bar_cell("games", "", c === "games" ? d : null)}
  ${html_header_bar_cell("opponents", "", c === "opponents" ? d : null)}
  ${html_header_cmp_cell("winrate", "", c === "winrate" ? d : null)}
  ${html_header_cmp_cell("frags", "", c === "frags" ? d : null)}
  ${html_header_cmp_cell("dmg", "", c === "dmg" ? d : null)}
  ${html_header_cmp_cell("dmg/min", "", c === "dmg/min" ? d : null)}
</div>
`;
}

function _html_render_map_row(player: string, d: MapData, max_game_cnt: number, max_opponent_cnt: number): string {
  return `
<div class="table__row">
  <!--<div class="m11-maps__player-a-cell m11-maps__cell--map"><div>${player}</div></div>-->
  <!--<div class="m11-maps__vs-cell m11-maps__cell--map">vs</div>-->
  <!--<div class="m11-maps__player-b-cell m11-maps__cell--map">opponent</div>-->

  ${html_name_cell(d.map, "table__name-cell--huge table__cell--first-column")}
  ${html_bar_cell(d.game_cnt, max_game_cnt, 8)}
  ${html_bar_cell(d.opponent_cnt, max_opponent_cnt, 8)}
  ${html_cmp_cell_100percent(d.a_win_percent, d.b_win_percent)}
  ${html_cmp_cell_100percent(d.a_avg_frag_percent, d.b_avg_frag_percent)}
  ${html_cmp_cell_100percent(d.a_avg_dmg_percent, d.b_avg_dmg_percent)}
  ${html_cmp_cell_clamped_ratio(d.a_avg_dmg_minute, d.b_avg_dmg_minute)}
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
    if (!state.duel_player.maps) {
        return;
    }

    const column_name: ColumnName = (cell.querySelector(".table__cell__header-name") as HTMLElement).innerText.toLowerCase().trim() as ColumnName;

    let sort_direction: SortDirection = "desc";
    if (state.duel_player.maps.sort_column_name === column_name && state.duel_player.maps.sort_direction === "desc") {
        sort_direction = "asc";
    }

    state.duel_player.maps.sort_column_name = column_name;
    state.duel_player.maps.sort_direction = sort_direction;

    rec_sort_duel_player_maps();
}
