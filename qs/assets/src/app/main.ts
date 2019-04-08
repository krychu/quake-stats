import { state } from "./State";
import * as cmd from "./Cmd";
import * as data from "./Data";
import * as games from "./Games";
import * as games_chart from "./GamesChart";

declare const SV_PLAYER: string;

export function main() {
  const modules = [
    cmd,
    data,
    games,
    games_chart
  ];

  modules.forEach((m) => {
    m.init();
  });

  state.player = SV_PLAYER;

  cmd.schedule_cmd("games_find_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_games_html_root", html_root);
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
