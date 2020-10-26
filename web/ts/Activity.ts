import { state } from "./State";
import { DayActivityData } from "./Data";
import * as cmd from "./Cmd";
import * as log from "./Log";
import * as SVG from "svg.js";

export interface DayActivity {
    show_day_cnt: number;
    html_root: HTMLElement | null;
};

const commands: [string, cmd.Cmd][] = [
  [ "activity_attach_html_root",      cmd_activity_attach_html_root ],
  [ "activity_render_data",           cmd_activity_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    const substate: DayActivity = {
        show_day_cnt: 40,
        html_root: null,
    }
    state.duel_players.activity = substate;
    log.log("Activity module initialized");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
function cmd_activity_attach_html_root(): Promise<any> {
    if (!state.duel_players.activity || !state.duel_players.activity.html_root || !state.html_main) {
        log.log("Activity.ts - cmd_activity_attach_html_root - wrong state");
        return Promise.reject();
    }

    state.html_main.appendChild(state.duel_players.activity.html_root);
    return Promise.resolve();
}

function cmd_activity_render_data(): Promise<void> {
    if (!state.duel_players.activity || !state.duel_players.activity.html_root || !state.duel_players.data || !state.duel_players.data.activity) {
        log.log("Activity.ts - cmd_activity_render_data - wrong state");
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
    element.innerHTML = "";
}

function _html_render_activity(data: DayActivityData[], element: HTMLElement) {
    if (!state.html_main || !state.duel_players.activity || !state.duel_players.activity.html_root) {
        log.log("Activity.ts - _html_render_activity - wrong state");
        return;
    }

    element.insertAdjacentHTML("afterbegin", `<div class="main__activity__header">Daily Games Chart</div>`);

    const svg_width = (state.duel_players.activity.html_root as HTMLElement).offsetWidth;
  const svg_height = (state.duel_players.activity.html_root as HTMLElement).offsetHeight;

  const draw = SVG(element);

  for (let i=0; i<data.length; i++) {
    //data[i].game_cnt = Math.round(Math.random() * 380);

      const max_game_cnt = data.reduce((acc, cur) => (cur.game_cnt > acc) ? cur.game_cnt : acc, 0);
      const game_divider = Math.max(max_game_cnt, 100);
      const max_bar_height = 50; // in pixels

      const bar_width = 17;
      const bar_gap = 11;
      const bar_y_offset = 30;
      const chart_x_offset = 10;
      const x = (bar_width + bar_gap) * i + chart_x_offset;
      const bar_height = Math.max( Math.round((data[i].game_cnt / game_divider) * max_bar_height), 2);
      const bar_y = max_bar_height - bar_height + bar_y_offset;

      const text_y = max_bar_height + bar_y_offset + 2;

      const games = draw.text("Games").style("opacity", "0").addClass("main__activity__games").move(x - 8, bar_y - 28);
      const date_parts = data[i].day_bucket.split("-");
      const date_str = `${date_parts[2]}/${date_parts[1]}`.replace(/0/g, '');
      const date = draw.text(date_str).style("opacity", "0").addClass("main__activity__date").move(x - 1 - (date_str.length - 3) * 3, bar_y_offset + max_bar_height + 15);
      let day_name: svgjs.Text;
      if (i==0) {
          day_name = draw.text("Today").move(x - 9, text_y);
      } else {
          day_name = draw.text(data[i].day_name).move(x - 1, text_y);
      }
      const game_cnt_str = "" + data[i].game_cnt;
      const game_cnt = draw.text(game_cnt_str).move(x + (7 - game_cnt_str.length * 3), bar_y - 15);
      const bar = draw.rect(bar_width, bar_height).move(x, bar_y).mouseover(() => {
          [games, date].forEach((e) => e.style("opacity", "1"));
          [day_name, game_cnt, bar].forEach((e) => e.addClass("hovered"));
      }).mouseout(() => {
          [games, date].forEach((e) => e.style("opacity", "0"));
          [day_name, game_cnt, bar].forEach((e) => e.removeClass("hovered"));
      });
  }
}
