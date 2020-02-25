import { state, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "toplevel_create_html_root",      cmd_toplevel_create_html_root ],
    [ "toplevel_attach_html_root",      cmd_toplevel_attach_html_root ],
    [ "toplevel_render_data",           cmd_toplevel_render_data ]
];

export function init() {
    cmd.add_cmds(commands);
    log.log("TopLevel module initialized");

    state.duel_player.top_level = {
        html_root: null
    };
}

export function shutdown() {
}

function cmd_toplevel_create_html_root(): Promise<void> {
    const html_root = document.createElement("div");
    html_root.className = "m11-toplevel";
    state.duel_player.top_level.html_root = html_root;
    return Promise.resolve();
}

function cmd_toplevel_attach_html_root(): Promise<void> {
    if (!state.duel_player.top_level.html_root || !state.html_main) {
        log.log("Header:cmd_header_attach_html_root - state doesn't contain required data");
        return Promise.reject();
    }

    state.html_main.appendChild(state.duel_player.top_level.html_root);
    return Promise.resolve();
}

function cmd_toplevel_render_data(): Promise<void> {
    if (!state.duel_player.data.top_level || !state.duel_player.top_level.html_root) {
        log.log("TopLevel::cmd_toplevel_render_data - state doesn't contain required data");
        return Promise.reject();
    }

    _html_remove_toplevel(state.duel_player.top_level.html_root);
    _html_render_toplevel(state.duel_player.data.top_level, state.duel_player.top_level.html_root);

    return Promise.resolve();
}

function _html_remove_toplevel(element: HTMLElement) {
    console.log(element);
    log.log("IMPLEMENT ME: _html_remove_toplevel");
}

function _html_render_toplevel(data: any, element: HTMLElement) {
    console.log(data);
    console.log(element);
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
