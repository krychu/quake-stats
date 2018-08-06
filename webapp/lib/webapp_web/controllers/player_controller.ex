defmodule WebappWeb.PlayerController do
  use WebappWeb, :controller

  def player(conn, %{"player" => player}) do
    {:ok, pg_pid} = PG.get_pg()

    recent_games = PG.get_recent_games( pg_pid, player, 40 )
    render conn, "player.html", player: player, recent_games: recent_games
  end
end
