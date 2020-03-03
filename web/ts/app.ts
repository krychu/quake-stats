import * as state from "./State";
import * as log from "./Log";
import * as cmd from "./Cmd";
import * as data from "./Data";
import * as games from "./Games";
import * as opponents from "./Opponents";
import * as maps from "./Maps";
import * as games_chart from "./GamesChart";
import * as activity from "./Activity";
import * as header from "./Header";
import * as players from "./Players";
import * as toplevel from "./TopLevel";
import { html_insufficient_data } from "./Utils";

declare const SV_PLAYER: string;
declare const PAGE: string;

const commands: [string, cmd.Cmd][] = [
    [ "main_find_html_root",          cmd_main_find_html_root ],
    [ "main_find_activity_html_root", cmd_main_find_activity_html_root ],
    [ "main_insufficient_data",       cmd_main_insufficient_data ]
];

state.state.page = PAGE as "duel_player" | "duel_players";
main();

export function main() {
  switch (PAGE) {
    case "duel_players":
      return main_duel_players();
    case "duel_player":
      return main_duel_player();
    default:
      console.log("ERROR: unknown page (" + PAGE + ")");
  }
}

function main_duel_players() {
  const modules = [
    state, // state needs to go first since cmd module accessess stuff in state
    cmd,
    data,
    activity,
    players,
    header
  ];

  modules.forEach((m) => {
    m.init();
  });

  cmd.add_cmds(commands);

    cmd.schedule(`
      || data_fetch_duel_players
      || data_fetch_activity
      || main_find_html_root
      || main_find_activity_html_root
       | header_create_html_root
       | header_attach_html_root
       | duel_players_create_html_root
       | duel_players_attach_html_root
      --
      || main_insufficient_data
      || activity_render_data
      || duel_players_render_data
    `);
}

function main_duel_player() {
  const modules = [
    state, // state needs to go first since cmd module accessess stuff in state
    cmd,
      data,
      toplevel,
    games,
    opponents,
    maps,
      games_chart,
      header
  ];

  modules.forEach((m) => {
    m.init();
  });

  cmd.add_cmds(commands);

  state.state.duel_player.player = SV_PLAYER;

    cmd.schedule(`
          // fetch data

      || data_fetch_toplevel
      || data_fetch_games
      || data_fetch_opponents
      || data_fetch_maps

          // create html

      || main_find_html_root
      || header_create_html_root
      || toplevel_create_html_root
      || gchart_create_html_root
      || games_create_html_root
      || opponents_create_html_root
      || maps_create_html_root

      --

      || header_attach_html_root
      || toplevel_attach_html_root
      || gchart_attach_html_root
      || games_attach_html_root
      || opponents_attach_html_root
      || maps_attach_html_root

          // render data
      || main_insufficient_data
      || toplevel_render_data
      || gchart_render_data
      || games_render_data
      || opponents_render_data
      || maps_render_data
    `);
}

async function cmd_main_find_html_root(): Promise<void> {
    state.state.html_main = document.getElementById("main");
    return Promise.resolve();
}

async function cmd_main_find_activity_html_root(): Promise<void> {
    if (!state.state.duel_players.activity) {
        log.log("app.ts - cmd_main_find_activity_html_root - wrong state");
        return Promise.reject();
    }
    state.state.duel_players.activity.html_root = document.getElementById("main__activity");
    return Promise.resolve();
}

async function cmd_main_insufficient_data(): Promise<void> {
    if (!state.state.html_main) {
        log.log("app.ts - cmd_main_insufficient_data - wrong state");
        return Promise.reject();
    }

    const e = state.state.html_main.querySelector(".insufficient-data");
    if (e) {
        state.state.html_main.removeChild(e);
    }

    if (
        (state.state.page === "duel_player" && (!state.state.duel_player.data || !state.state.duel_player.data.games.length))
            || (state.state.page === "duel_players" && (!state.state.duel_players.data || !state.state.duel_players.data.players.length))) {
        //state.html_main.appendChild(html_insufficient)
        state.state.html_main.insertAdjacentHTML("beforeend", html_insufficient_data());
    }
}
