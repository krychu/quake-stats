import * as state from "./State";
import * as log from "./Log";
import * as cmd from "./Cmd";
import * as data from "./Data";
import * as games from "./Games";
import * as gamesshort from "./GamesShort";
import * as opponents from "./Opponents";
import * as maps from "./Maps";
import * as games_chart from "./GamesChart";
import * as activity from "./Activity";
import * as header from "./Header";
import * as players from "./Players";

declare const SV_PLAYER: string;
declare const PAGE: string;

const commands: [string, state.Cmd][] = [
    [ "main_find_html_root",          cmd_main_find_html_root ],
    [ "main_2cols_find_html_root",    cmd_main_2cols_find_html_root ],
    [ "main_find_activity_html_root", cmd_main_find_activity_html_root ]
];

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
    gamesshort,
    players,
    header
  ];

  modules.forEach((m) => {
    m.init();
  });

  cmd.add_cmds(commands);

  // html: find
  // cmd.schedule_cmd("main_find_html_root").then((html_root) => {
  //   cmd.schedule_cmd("state_set_main_html_root", html_root);
    // });

    cmd.schedule(`
      main_find_html_root
      main_2cols_find_html_root
      main_find_activity_html_root
    `);

    // cmd.schedule_cmd("main_find_activity_html_root").then((e) => {
    //     cmd.schedule_cmd("state_set_activity_html_root", e);
    // });

  // cmd.schedule_cmd("main_2cols_find_html_root").then((html_root) => {
  //   cmd.schedule_cmd("state_set_main_2cols_html_root", html_root);
  // });

  // html: create
  // cmd.schedule_cmd("activity_create_html_root").then((html_roots) => {
  //   cmd.schedule_cmd("state_set_activity_html_root", html_roots);
  //   // since above is immediate we don't need to .then the one below
  //   cmd.schedule_cmd("activity_attach_html_root");
  // });

  cmd.schedule_cmd("duel_players_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_duel_players_html_root", html_root);
    // since above is immediate we don't need to .then the one below
    cmd.schedule_cmd("duel_players_attach_html_root");
  });

  cmd.schedule_cmd("gamesshort_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_gamesshort_html_root", html_root);
    cmd.schedule_cmd("gamesshort_attach_html_root");
  });

   cmd.schedule(`
      header_create_html_root
      header_attach_html_root
   `);

  // fetch and render data
  cmd.schedule_cmd("data_fetch_activity").then((data) => {
    cmd.schedule_cmd("state_set_activity", data);
    cmd.schedule_cmd("activity_render_data");
  });

  cmd.schedule_cmd("data_fetch_duel_players").then((data) => {
    cmd.schedule_cmd("state_set_duel_players", data);
    cmd.schedule_cmd("duel_players_render_data");
  });

  cmd.schedule_cmd("data_fetch_gamesshort").then((data) => {
    cmd.schedule_cmd("state_set_gamesshort", data);
    cmd.schedule_cmd("gamesshort_render_data");
  });
}

function main_duel_player() {
  const modules = [
    state, // state needs to go first since cmd module accessess stuff in state
    cmd,
    data,
    games,
    opponents,
    maps,
    games_chart
  ];

  modules.forEach((m) => {
    m.init();
  });

  cmd.add_cmds(commands);

  state.state.duel_player.player = SV_PLAYER;

  cmd.schedule_cmd("main_find_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_main_html_root", html_root);
  });

  // Create and store games chart html root
  cmd.schedule_cmd("gchart_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_gchart_html_root", html_root);
    cmd.schedule_cmd("gchart_attach_html_root");
  });

  // Create and store recent games html root
  cmd.schedule_cmd("games_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_games_html_root", html_root);
    // we know above is immediate
    cmd.schedule_cmd("games_attach_html_root");
    //cmd.schedule_cmd("games_attach_html_root", "duel-games");
  });

  // Create and store opponents html root
  cmd.schedule_cmd("opponents_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_opponents_html_root", html_root);
    // we know above is immediate
    cmd.schedule_cmd("opponents_attach_html_root");
  });

  // Create and store maps html root
  cmd.schedule_cmd("maps_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_maps_html_root", html_root);
    // we know above is immediate
    cmd.schedule_cmd("maps_attach_html_root");
  });

  // cmd.schedule_cmd("gchart_find_html_root").then(html_root => {
  //   cmd.schedule_cmd("state_set_gchart_html_root", html_root);
  // })

  // Request, store and render recent games
  cmd.schedule_cmd("data_fetch_games").then((data) => {
    cmd.schedule_cmd("state_set_games", data);
    cmd.schedule_cmd("games_render_data");
    cmd.schedule_cmd("gchart_render_data");
  });

  // Request, store and render opponents
  cmd.schedule_cmd("data_fetch_opponents").then((data) => {
    cmd.schedule_cmd("state_set_opponents", data);
    cmd.schedule_cmd("opponents_render_data");
  });

  // Request, store and render maps
  cmd.schedule_cmd("data_fetch_maps").then((data) => {
    cmd.schedule_cmd("state_set_maps", data);
    cmd.schedule_cmd("maps_render_data");
  });

  cmd.schedule_cmd("data_fetch_game_cnts").then((data) => {
    cmd.schedule_cmd("state_set_game_cnts", data);
  });

  cmd.schedule_cmd("data_fetch_win_probabilities").then((data) => {
    cmd.schedule_cmd("state_set_win_probabilities", data);
  });
}

async function cmd_main_find_html_root(): Promise<void> {
    //return find_element("main");
    state.state.html_main = document.getElementById("main");
    return Promise.resolve();
  // const html_root = document.getElementById("main");

  // if (!html_root) {
  //   log.log("main::cmd_main_find_html_root - can't find the main html root");
  //   Promise.reject();
  // }

  // return Promise.resolve(html_root);
}

// function cmd_main_find_activity_html_root(): Promise<HTMLElement|null> {
//     return find_element("main__activity");
// }

async function cmd_main_find_activity_html_root(): Promise<void> {
    state.state.duel_players.activity.html_root = document.getElementById("main__activity");
    return Promise.resolve();
}

async function cmd_main_2cols_find_html_root(): Promise<void> {
    state.state.html_main_2cols = document.getElementById("main__2cols");
    return Promise.resolve();
  // const html_root = document.getElementById("main__2cols");

  // if (!html_root) {
  //   log.log("main::cmd_main_2cols_find_html_root - can't find the main 2cols html root");
  //   Promise.reject();
  // }

  // return Promise.resolve(html_root);
}

function find_element(id: string): Promise<HTMLElement|null> {
    const e = document.getElementById(id);

    if (!e) {
        log.log(`app::find_element - can't find element with id = ${id}`);
        return Promise.reject();
    }

    return Promise.resolve(e);
}
