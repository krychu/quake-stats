import { state } from "./State";
import { TopLevelData } from "./Data";
import { html_insufficient_data } from "./Utils";
import * as cmd from "./Cmd";
import * as log from "./Log";

export interface TopLevel {
    html_root: HTMLElement | null;
};

const commands: [string, cmd.Cmd][] = [
    [ "toplevel_create_html_root",      cmd_toplevel_create_html_root ],
    [ "toplevel_attach_html_root",      cmd_toplevel_attach_html_root ],
    [ "toplevel_render_data",           cmd_toplevel_render_data ]
];

export function init() {
    cmd.add_cmds(commands);
    const substate: TopLevel = {
        html_root: null
    };
    state.duel_player.top_level = substate;
    log.log("TopLevel module initialized");
}

export function shutdown() {
}

function cmd_toplevel_create_html_root(): Promise<void> {
    if (!state.duel_player || !state.duel_player.top_level) {
        log.log("TopLevel.ts - cmd_toplevel_create_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
    html_root.className = "m11-toplevel";
    state.duel_player.top_level.html_root = html_root;
    return Promise.resolve();
}

function cmd_toplevel_attach_html_root(): Promise<void> {
    if (!state.duel_player || !state.duel_player.top_level || !state.duel_player.top_level.html_root || !state.html_main) {
        log.log("TopLevel.ts - cmd_toplevel_attach_html_root - wrong state");
        return Promise.reject();
    }

    state.html_main.appendChild(state.duel_player.top_level.html_root);
    return Promise.resolve();
}

function cmd_toplevel_render_data(): Promise<void> {
    if (!state.duel_player || !state.duel_player.data || !state.duel_player.data.top_level || !state.duel_player.top_level || !state.duel_player.top_level.html_root) {
        log.log("TopLevel.ts - cmd_toplevel_render_data - wrong state");
        return Promise.reject();
    }

    _html_remove_toplevel(state.duel_player.top_level.html_root);
    _html_render_toplevel(state.duel_player.data.top_level, state.duel_player.top_level.html_root);

    return Promise.resolve();
}

function _html_remove_toplevel(element: HTMLElement) {
    element.innerHTML = "";
}

function _html_render_toplevel(data: TopLevelData, element: HTMLElement) {
    if (!data.game_cnt) {
        return
    }

    const html = `
<div class="m11-toplevel__item">
  <div class="m11-toplevel__item__stat">${data.game_cnt}</div>
  <div class="m11-toplevel__item__label">Games</div>
</div>

<div class="m11-toplevel__item">
  <div class="m11-toplevel__item__stat">${data.opponent_cnt}</div>
  <div class="m11-toplevel__item__label">Opponents</div>
</div>

<div class="m11-toplevel__item">
  <div class="m11-toplevel__item__stat">${data.win_percent}%</div>
  <div class="m11-toplevel__item__label">Winrate</div>
</div>

<div class="m11-toplevel__item">
  <div class="m11-toplevel__item__stat">${data.avg_frag_percent}%</div>
  <div class="m11-toplevel__item__label">FPG</div>
</div>

<div class="m11-toplevel__item">
  <div class="m11-toplevel__item__stat">${data.avg_lg_acc_percent}%</div>
  <div class="m11-toplevel__item__label">LG ACC</div>
</div>

<div class="m11-toplevel__item">
  <div class="m11-toplevel__item__stat m11-toplevel__item--left-aligned">${data.most_frequent_map}</div>
  <div class="m11-toplevel__item__label m11-toplevel__item--left-aligned">Most played map</div>
</div>
`;

    element.insertAdjacentHTML("beforeend", html);
}
