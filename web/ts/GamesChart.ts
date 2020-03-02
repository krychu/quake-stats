import { state }from "./State";
import { GameData } from "./Data";
import * as cmd from "./Cmd";
import * as log from "./Log";
import * as SVG from "svg.js";

export interface GamesChart {
    game_cnt: number;
    html_root_id: string; // Can be removed
    html_root: HTMLElement | null;
    html_chart_root: HTMLElement | null;
    // svg_width: number;
    // svg_height: number;
}

const commands: [string, cmd.Cmd][] = [
  //[ "gchart_find_html_root",            cmd_gchart_find_html_root ],
  [ "gchart_create_html_root",          cmd_gchart_create_html_root ],
  [ "gchart_attach_html_root",          cmd_gchart_attach_html_root ],
  [ "gchart_render_data",               cmd_gchart_render_data ]
];

const CHART_PADDING_X = 40;
const CHART_PADDING_Y = 20;
const CHART_CIRCLE_RADIUS = 2;
const CHART_STEP_Y = 5;

export function init() {
    cmd.add_cmds(commands);
    const substate = {
        game_cnt: 20,
        html_root_id: "1vs1-games-chart", // Can be removed
        html_root: null,
        html_chart_root: null
    };
    state.duel_player.games_chart = substate;

  log.log("Games Chart module initialized");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
async function cmd_gchart_create_html_root(): Promise<void> {
    if (!state.duel_player.games_chart) {
        log.log("GamesChart.ts - cmd_gchart_create_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
  //html_root.className = "m11-games-chart";

  const html_chart_root = document.createElement("div");
  html_chart_root.className = "m11-games-chart";

  html_root.insertAdjacentHTML("beforeend", _html_render_title());
  html_root.appendChild(html_chart_root);

    state.duel_player.games_chart.html_root = html_root;
    state.duel_player.games_chart.html_chart_root = html_chart_root;

    return Promise.resolve();
}

function _html_render_title(): string {
  return `
<div class="section_title--games-chart">
Last games
</div>
`;
}

function cmd_gchart_attach_html_root(): Promise<any> {
  if (!state.duel_player.games_chart || state.duel_player.games_chart.html_root == null || state.html_main == null) {
    log.log("GamesChart.ts - cmd_gchart_attach_html_root - wrong state");
    return Promise.reject();
  }

  state.html_main.appendChild(state.duel_player.games_chart.html_root);
  return Promise.resolve();
}

function cmd_gchart_render_data(): Promise<any> {
  if (!state.duel_player.data || !state.duel_player.data.games || !state.duel_player.games_chart || !state.duel_player.games_chart.html_chart_root) {
    log.log("GamesCharts - cmd_gchart_render_data - wrong state");
    return Promise.reject();
  }

  const svg_width = state.duel_player.games_chart.html_chart_root.offsetWidth;
  const svg_height = state.duel_player.games_chart.html_chart_root.offsetHeight;

  const diffs = _games_chart_diffs(state.duel_player.data.games);
  const max_y = _games_chart_max_y(diffs);
  const points = _games_chart_points(diffs, max_y, svg_width, svg_height);

  _games_chart_draw(state.duel_player.games_chart.html_chart_root, points, max_y, svg_width, svg_height);

  return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _games_chart_diffs(games: GameData[]): number[] {
  return games.map((g) => g.a_frags - g.b_frags);
}

function _games_chart_max_y(diffs: number[]): number {
  const diffs_abs = diffs.map(x => Math.abs(x));
  const max = Math.max(...diffs_abs);
  if (max % CHART_STEP_Y === 0) {
    return max;
  }
  else {
    return Math.floor((max + CHART_STEP_Y) / CHART_STEP_Y) * CHART_STEP_Y;
  }
}

function _games_chart_points(diffs: number[], max: number, width: number, height: number): [number, number][] {
  const min = -max;
  const padding_x = CHART_PADDING_X / width;
  const padding_y = CHART_PADDING_Y / height;

  console.log(height);
  // console.log(max);

  // 1. Calculate [x, y] pairs in the range of [0, 1]
  return diffs.map((d, i) => {
    const p = i / (diffs.length - 1);
    const y = 1.0 - (d - min) / (max - min);
    return [p, y];
  // 2. Add padding but keep the pairs within [0, 1]
  }).map(([xp, yp]) => {
    const content_x = 1.0 - 2.0 * padding_x;
    const content_y = 1.0 - 2.0 * padding_y;
    console.log(padding_y);
    //console.log(yp * content_y);
    return [padding_x + xp * content_x, padding_y + yp * content_y];
  // 3. Turn xs and ys into [0, 100] range
  }).map(([xp, yp]) => {
    return ([xp * width, yp * height]);
  }) as [number, number][];
}

function _games_chart_draw(html_root: HTMLElement, points: [number, number][], max_y: number, svg_width: number, svg_height: number): void {
  const draw = SVG(html_root);

  // x axis
  draw.line(CHART_PADDING_X, svg_height / 2.0, svg_width - CHART_PADDING_X, svg_height / 2.0).addClass("x-axis");

  // y ticks
  draw.line(CHART_PADDING_X - 10, CHART_PADDING_Y, CHART_PADDING_X - 5, CHART_PADDING_Y).addClass("y-tick");
  draw.line(CHART_PADDING_X - 4, CHART_PADDING_Y, svg_width - CHART_PADDING_X, CHART_PADDING_Y).addClass("y-tick-long");
  draw.plain(max_y.toString()).move(5, CHART_PADDING_Y - 12).addClass("y-tick-text");

  draw.line(CHART_PADDING_X - 10, svg_height / 2, CHART_PADDING_X - 5, svg_height / 2).addClass("y-tick");
  draw.plain("0").move(11, svg_height / 2 - 12).addClass("y-tick-text");

  draw.line(CHART_PADDING_X - 10, svg_height - CHART_PADDING_Y, CHART_PADDING_X - 5, svg_height - CHART_PADDING_Y).addClass("y-tick");
  draw.line(CHART_PADDING_X - 4, svg_height - CHART_PADDING_Y, svg_width - CHART_PADDING_X, svg_height - CHART_PADDING_Y).addClass("y-tick-long");
  draw.plain("-" + max_y.toString()).move(1, svg_height - CHART_PADDING_Y - 12).addClass("y-tick-text");

  // line chart
  draw.polyline(points).addClass("lines");

  // circles
  points.forEach(([x, y]) => {
    draw.circle().radius(CHART_CIRCLE_RADIUS).attr({cx: x, cy: y}).addClass("dots");//.on("mouseover", () => {alert(1);});
  });
}
