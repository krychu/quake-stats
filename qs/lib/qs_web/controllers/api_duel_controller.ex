defmodule QsWeb.APIDuelController do
  use QsWeb, :controller

  def games(conn, %{"player" => player, "cnt" => cnt}) do
    #game_cnts = Queries.get_game_cnts(player)
    #render(conn, "main.html")
    games = Queries.get_games(player, String.to_integer(cnt))
    json(conn, games)
  end
end
