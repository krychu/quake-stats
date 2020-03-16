import { state } from "./State";
import { GameData } from "./Data";
import {
    html_time_cell,
    html_header_time_cell,
    html_cmp_cell_clamped_frac,
    html_cmp_cell_100percent,
    html_cmp_cell_clamped_ratio,
    html_header_cmp_cell,
    html_header_name_cell,
    html_separator_cell,
    SortDirection
} from "./Utils";
import * as cmd from "./Cmd";
import * as log from "./Log";
import { rec_sort_duel_player_games } from "./Recipes";

type ColumnName = "ago" | "frags" | "opponent" | "map" | "dmg" | "rl/min" | "lg/min" | "lg acc" | "ra" | "ya" | "mh";

export interface Games {
    show_game_cnt: number;
    html_root: HTMLElement | null;
    sort_column_name: ColumnName;
    sort_direction: SortDirection;
}

const commands: [string, cmd.Cmd][] = [
    [ "games_create_html_root",      cmd_games_create_html_root ],
    [ "games_attach_html_root",      cmd_games_attach_html_root ],
    [ "games_render_data",           cmd_games_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    const substate: Games = {
        show_game_cnt: 20,
        html_root: null,
        sort_column_name: "ago",
        sort_direction: "desc"
    };
    state.duel_player.games = substate;
    log.log("Games module initialized");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------

function cmd_games_create_html_root(): Promise<void> {
    if (!state.duel_player.games) {
        log.log("Games.ts - cmd_games_crate_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
    html_root.addEventListener("click", (e) => { _on_click(e); });
    //html_root.setAttribute("id", "duel-games");
    html_root.className = "m11-games";
    state.duel_player.games.html_root = html_root;
    return Promise.resolve();
}

function cmd_games_attach_html_root(): Promise<any> {
    if (!state.duel_player.games || !state.duel_player.games.html_root || !state.html_main) {
        log.log("Games.ts - cmd_games_attach_html_root - wrong state");
        return Promise.reject();
    }

    state.html_main.appendChild(state.duel_player.games.html_root);
    return Promise.resolve();
}

function cmd_games_render_data(): Promise<any> {
    if (!state.duel_player.games || !state.duel_player.games.html_root || !state.duel_player.data) {
        log.log("Games.ts - cmd_games_render_data - wrong state");
        return Promise.reject();
    }

    _html_remove_games(state.duel_player.games.html_root);
    _html_render_games(state.duel_player.data.games.slice(0, state.duel_player.games.show_game_cnt), state.duel_player.games.html_root);

    return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _html_remove_games(element: HTMLElement) {
    element.innerHTML = "";
}

function _html_render_games(data: GameData[], element: HTMLElement) {
    if (!data.length || !state.duel_player.games) {
        return;
    }

    const sort_column_name = state.duel_player.games.sort_column_name;
    const sort_direction = state.duel_player.games.sort_direction;

    let rows = _html_render_games_header(data[0], sort_column_name, sort_direction);
  //rows += data.map(([a, b]) => _html_render_games_row(data)).join("");
  rows += data.map((g) => _html_render_games_row(g)).join("");
  const html = `
${rows}
`;

    element.insertAdjacentHTML("beforeend", html);
}

function _html_render_games_header(g: GameData, c: ColumnName, d: SortDirection): string {
    return `
<div class="table__header-row">
    <!--<div class="m11-games__header__player-a-cell"><div>${g.a_name}</div></div>-->
    ${html_header_cmp_cell("frags", "table__cell--first-column", c === "frags" ? d : null)}
    ${html_header_name_cell("opponent", "table__cell--big", c === "opponent" ? d : null)}
    ${html_header_name_cell("map", "", c === "map" ? d : null)}

    ${html_separator_cell()}

    <!--<div class="duel-games__header__cmp-cell">dmg%</div>-->
    <!--<div class="m11-games__header__cmp-cell">frags %</div>-->
    <!--<div class="m11-games__header__cmp-cell m11-games__cell">FPM</div>-->
    <!--<div class="m11-games__header__cmp-cell m11-games__cell">K/D</div>-->

    ${html_header_cmp_cell("dmg", "table__cell--small", c === "dmg" ? d : null)}
    <!--<div class="m11-games__header__cmp-cell">dmg/min</div>-->
    ${html_header_cmp_cell("rl/min", "", c === "rl/min" ? d : null)}
    ${html_header_cmp_cell("lg/min", "", c === "lg/min" ? d : null)}
    ${html_header_cmp_cell("lg acc", "", c === "lg acc" ? d : null)}

    ${html_separator_cell()}

    ${html_header_cmp_cell("ra", "table__cell--small", c === "ra" ? d : null)}
    ${html_header_cmp_cell("ya", "table__cell--small", c === "ya" ? d : null)}
    ${html_header_cmp_cell("mh", "table__cell--small", c === "mh" ? d : null)}
    ${html_header_time_cell("ago", "", c === "ago" ? d : null)}

    <!--<div class="m11-games__header__cmp-cell">speed</div>-->
    <!--<div class="m11-games__header__single-cmp-cell">speed</div>-->
</div>
`;
}

function _html_render_games_row(g: GameData): string {
    return `
<div class="table__row ${g.a_frags > g.b_frags && "m11-games__game--win"}">
    <!--<div class="m11-games__game__player-a-cell"><div>${g.a_name}</div></div>-->

    ${html_cmp_cell_clamped_frac(g.a_frags, g.b_frags, false, "table__cell--first-column")}
    ${html_name(g.b_name, "table__cell--big")}
    ${html_name(g.map)}

    ${html_separator_cell()}

    <!--${html_cmp_cell_100percent(g.a_frag_percent, g.b_frag_percent, "table__cell--small")} -->

    ${html_cmp_cell_100percent(g.a_dmg_percent, g.b_dmg_percent, "table__cell--small")}
    ${html_cmp_cell_clamped_ratio(g.a_rl_dmg_minute, g.b_rl_dmg_minute)}
    ${html_cmp_cell_clamped_ratio(g.a_lg_dmg_minute, g.b_lg_dmg_minute)}
    ${html_cmp_cell_clamped_frac(g.a_lg_acc_percent, g.b_lg_acc_percent, true)}

    ${html_separator_cell()}

    ${html_cmp_cell_clamped_frac(g.a_ra, g.b_ra, false, "table__cell--small")}
    ${html_cmp_cell_clamped_frac(g.a_ya, g.b_ya, false, "table__cell--small")}
    ${html_cmp_cell_clamped_frac(g.a_mh, g.b_mh, false, "table__cell--small")}

    ${html_time_cell(g.minutes_ago)}

</div>
`;
}

function html_name(name: string, extra_classes: string = ""): string {
    return `<div class="table__name-cell ${extra_classes}"><div>${name}</div></div>`;
}

function _on_click(e: any): void {
    for (let i = 0; i < e.path.length; i++) {
        if  (e.path[i].classList && e.path[i].classList.contains("table__cell--header")) {
            return _on_table_header_cell_click(e.path[i]);
        }
    }
}

function _on_table_header_cell_click(cell: HTMLElement): void {
    if (!state.duel_player.games) {
        return;
    }

    const column_name: ColumnName = (cell.querySelector(".table__cell__header-name") as HTMLElement).innerText.toLowerCase().trim() as ColumnName;

    let sort_direction: SortDirection = "desc";
    if (state.duel_player.games.sort_column_name === column_name && state.duel_player.games.sort_direction === "desc") {
        sort_direction = "asc";
    }

    state.duel_player.games.sort_column_name = column_name;
    state.duel_player.games.sort_direction = sort_direction;

    rec_sort_duel_player_games();
}
