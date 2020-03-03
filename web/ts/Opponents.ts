import { state } from "./State";
import { OpponentData } from "./Data";
import {
    html_name_cell,
    html_bar_cell,
    html_cmp_cell_100percent,
    html_cmp_cell_clamped_frac,
    html_header_name_cell,
    html_header_bar_cell,
    html_header_cmp_cell
} from "./Utils";
import * as cmd from "./Cmd";
import * as log from "./Log";

export interface Opponents {
    html_root: HTMLElement | null;
};

const commands: [string, cmd.Cmd][] = [
    [ "opponents_create_html_root",      cmd_opponents_create_html_root ],
    [ "opponents_attach_html_root",      cmd_opponents_attach_html_root ],
    [ "opponents_render_data",           cmd_opponents_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    const substate = {
        html_root: null
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
    if (!data.length) {
        return;
    }

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
<div class="section_title">
Opponents
</div>
`;
}

function _html_render_opponents_header(player: string): string {
  return `
<div class="table__header-row">
  <!--<div class="m11-opponents__player-a-cell m11-opponents__cell--header"><div>${player}</div></div>-->
  <!--<div class="m11-opponents__vs-cell m11-opponents__cell--header">vs</div>-->
  ${html_header_name_cell("opponent", "table__name-cell--huge table__cell--first-column")}
  ${html_header_bar_cell("games")}
  ${html_header_cmp_cell("win")}
  ${html_header_cmp_cell("frags")}
  ${html_header_cmp_cell("dmg")}
  ${html_header_cmp_cell("lg acc")}
  ${html_header_name_cell("fq map")}
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
