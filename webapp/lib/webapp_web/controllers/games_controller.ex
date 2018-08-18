defmodule WebappWeb.GamesController do
  use WebappWeb, :controller

  def games(conn, %{"player" => player, "cnt" => cnt} = params ) do
    {:ok, pg_pid} = PG.get_pg()

    format = params |> Map.get( "format", "json" )

    r = PG.get_recent_games( pg_pid, player, String.to_integer(cnt) )
    case format do
      "json" -> json( conn, r )
      "html" -> html( conn, Phoenix.View.render_to_string( WebappWeb.GamesView, "games.html", games: r ) )
    end
  end

  def games_chart( conn, %{"player" => player, "cnt" => cnt} = params ) do
    {:ok, pg_pid} = PG.get_pg()

    recent_games = PG.get_recent_games( pg_pid, player, String.to_integer( cnt ) )
    render( "games_chart.html", games: recent_games )
  end
end
