import { state, DayActivity, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "activity_create_html_root",      cmd_activity_create_html_root ],
    [ "activity_attach_html_root",      cmd_activity_attach_html_root ],
    [ "activity_render_data",           cmd_activity_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    log.log("Activity module initialized");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------

function cmd_activity_create_html_root(): Promise<any> {
    const html_root = document.createElement("div");
    html_root.className = "m11-activity";
    return Promise.resolve(html_root);
}

function cmd_activity_attach_html_root(): Promise<any> {
    if (state.duel_players.activity.html_root == null || state.html_main == null) {
        log.log("Games::cmd_activity_attach_html_root - state doesn't contain required data");
        return Promise.reject();
    }

    state.html_main.appendChild(state.duel_players.activity.html_root);
    return Promise.resolve();
}

function cmd_activity_render_data(): Promise<any> {
    //const { data, games } = state;

    if (state.duel_players.activity.html_root == null || state.duel_players.data.activity == null) {
        log.log("Games::cmd_activity_render_data - state doesn't contain required data");
        return Promise.reject();
    }

    _html_remove_activity(state.duel_players.activity.html_root);
    _html_render_activity(state.duel_players.data.activity.slice(0, state.duel_players.activity.show_day_cnt), state.duel_players.activity.html_root);

    return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _html_remove_activity(element: HTMLElement) {
    console.log(element);
    log.log("IMPLEMENT ME: _html_remove_activity");
}

function _html_render_activity(data: DayActivity[], element: HTMLElement) {
  console.log(data);
  console.log(element);
  console.log("IMPLEMENT ME");
}
