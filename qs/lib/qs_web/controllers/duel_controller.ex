defmodule QsWeb.DuelController do
  use QsWeb, :controller

  def player(conn, %{"player" => player}) do
    #game_cnts = Queries.get_game_cnts(player)
    render(conn, "main.html", player: player)
  end
end
