import { state, DayActivity, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";
import * as SVG from "svg.js";

const commands: [string, Cmd][] = [
  //[ "activity_create_html_root",      cmd_activity_create_html_root ],
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

// function cmd_state_set_activity_html_root(roots: HTMLElement[]): Promise<void> {
//   state.duel_players.activity.html_root = roots[0];
//   state.duel_players.activity.html_chart_root = roots[1];
//   return Promise.resolve();
// }

// function cmd_activity_create_html_root(): Promise<any> {
//   const html_root = document.createElement("div");
//   html_root.className = "m11-activity";

//   const html_chart_root = document.createElement("div");
//   html_chart_root.className = "m11-activity-chart";

//   //html_root.insertAdjacentHTML("beforeend", _html_render_title());
//   html_root.appendChild(html_chart_root);

//   return Promise.resolve([html_root, html_chart_root]);
// }

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
  const svg_width = (state.duel_players.activity.html_root as HTMLElement).offsetWidth;
  const svg_height = (state.duel_players.activity.html_root as HTMLElement).offsetHeight;

  const draw = SVG(element);

  for (let i=0; i<data.length; i++) {
    data[i].game_cnt = Math.round(Math.random() * 380);

    const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);
    const game_divider = Math.max(max_game_cnt, 100);
    const max_bar_height = 50; // in pixels

    const bar_width = 15;
    const bar_gap = 10;
    const x = (bar_width + bar_gap) * i;
    const bar_height = Math.round((data[i].game_cnt / game_divider) * max_bar_height);
    const bar_y = max_bar_height - bar_height;

    const text_y = max_bar_height + 2;

    draw.rect(bar_width, bar_height).move(x, bar_y);
    draw.text(data[i].day_name).move(x, text_y);
  }
}
