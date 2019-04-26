import * as state from "./State";
import * as log from "./Log";
import * as cmd from "./Cmd";
import * as data from "./Data";
import * as games from "./Games";
import * as games_chart from "./GamesChart";

declare const SV_PLAYER: string;
declare const PAGE: string;

const commands: [string, state.Cmd][] = [
  [ "main_find_html_root",        cmd_main_find_html_root ]
];

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
    games,
    games_chart
  ];

  modules.forEach((m) => {
    m.init();
  });

  cmd.add_cmds(commands);
}

function main_duel_player() {
  const modules = [
    state, // state needs to go first since cmd module accessess stuff in state
    cmd,
    data,
    games,
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

  cmd.schedule_cmd("games_create_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_games_html_root", html_root);
    // we know above is immediate
    cmd.schedule_cmd("games_attach_html_root");
    //cmd.schedule_cmd("games_attach_html_root", "duel-games");
  });

  cmd.schedule_cmd("gchart_find_html_root").then(html_root => {
    cmd.schedule_cmd("state_set_gchart_html_root", html_root);
  })

  cmd.schedule_cmd("data_fetch_games").then((data) => {
    cmd.schedule_cmd("state_set_games", data);
    cmd.schedule_cmd("games_render_data");
    cmd.schedule_cmd("gchart_render_data");
  });

  cmd.schedule_cmd("data_fetch_game_cnts").then((data) => {
    cmd.schedule_cmd("state_set_game_cnts", data);
  });

  cmd.schedule_cmd("data_fetch_win_probabilities").then((data) => {
    cmd.schedule_cmd("state_set_win_probabilities", data);
  });
}

function cmd_main_find_html_root(): Promise<any> {
  const html_root = document.getElementById("main");

  if (!html_root) {
    log.log("main::cmd_main_find_html_root - can't find the main html root");
    Promise.reject();
  }

  return Promise.resolve(html_root);
}
