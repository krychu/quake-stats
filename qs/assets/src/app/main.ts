import { state } from "./State";
import * as cmd from "./Cmd";
import * as games from "./Games";
import * as games_chart from "./GamesChart";

export function main() {
  const modules = [
    cmd,
    games,
    games_chart
  ];

  modules.forEach((m) => {
    m.init();
  });

  state.player = SRV_PLAYER;

  cmd.schedule_cmd("games_find_html_root").then((html_root) => {
    cmd.schedule_cmd("state_set_games_html_root", html_root);
    //cmd.schedule_cmd("games_attach_html_root", "duel-games");
  });

  cmd.schedule_cmd("gchart_find_html_root").then(html_root => {
    cmd.schedule_cmd("state_set_gchart_html_root", html_root);
  })

  cmd.schedule_cmd("games_fetch_data").then((data) => {
    cmd.schedule_cmd("state_set_games_data", data);
    cmd.schedule_cmd("games_render_data");
    cmd.schedule_cmd("gchart_render_data");
  });
}
