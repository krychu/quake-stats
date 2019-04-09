defmodule QsWeb.APIDuelController do
  use QsWeb, :controller

  def game_cnts(conn, %{"player" => player}) do
    game_cnts = Queries.Games.get_game_cnts(player)
    #IO.inspect game_cnts
    json(conn, game_cnts)
  end

  def games(conn, %{"player" => player, "cnt" => cnt}) do
    #game_cnts = Queries.get_game_cnts(player)
    #render(conn, "main.html")
    games = Queries.Games.get_games(player, String.to_integer(cnt))
    json(conn, games)
  end

  def win_probabilities(conn, %{"player" => player}) do
    win_probabilities = Queries.get_win_probabilities(player)
    json(conn, win_probabilities)
  end
end
