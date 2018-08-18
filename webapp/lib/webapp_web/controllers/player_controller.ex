defmodule WebappWeb.PlayerController do
  use WebappWeb, :controller

  def player(conn, %{"player" => player}) do
    {:ok, pg_pid} = PG.get_pg()

    recent_games = PG.get_recent_games( pg_pid, player, 40 )
    #game_cnt_timeline = PG.get_game_cnt_timeline( pg_pid, player )
    win_probability_timeline = PG.get_win_probability_timeline( pg_pid, player )
    frags_proportion_timeline = PG.get_frags_proportion_timeline( pg_pid, player )
    lg_accuracy_timeline = PG.get_lg_accuracy_timeline( pg_pid, player )
    opponents = PG.get_opponents( pg_pid, player )
    maps = PG.get_maps( pg_pid, player )
    render( conn, "player.html",
      player: player,
      recent_games: recent_games,
      #game_cnt_timeline: game_cnt_timeline,
      win_probability_timeline: win_probability_timeline,
      frags_proportion_timeline: frags_proportion_timeline,
      lg_accuracy_timeline: lg_accuracy_timeline,
      opponents: opponents,
      maps: maps )
  end
end
