import { state, DayActivity, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";
import * as SVG from "svg.js";

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

// function cmd_state_set_activity_html_root(roots: HTMLElement[]): Promise<void> {
//   state.duel_players.activity.html_root = roots[0];
//   state.duel_players.activity.html_chart_root = roots[1];
//   return Promise.resolve();
// }

function cmd_activity_create_html_root(): Promise<any> {
  const html_root = document.createElement("div");
  html_root.className = "m11-activity";

  const html_chart_root = document.createElement("div");
  html_chart_root.className = "m11-activity-chart";

  //html_root.insertAdjacentHTML("beforeend", _html_render_title());
  html_root.appendChild(html_chart_root);

  return Promise.resolve([html_root, html_chart_root]);
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
  const svg_width = (state.duel_players.activity.html_chart_root as HTMLElement).offsetWidth;
  const svg_height = (state.duel_players.activity.html_chart_root as HTMLElement).offsetHeight;

  const game_cnt = state.duel_players.activity.show_day_cnt;

  const draw = SVG(element);

  for (let i=0; i<data.length; i++) {
    draw.rect(10, 20).x(15*i);
  }

  console.log(data);
  console.log(element);
  console.log("IMPLEMENT ME");
}
