defmodule WebappWeb.PlayerController do
  use WebappWeb, :controller

  def player(conn, %{"player" => player}) do
    render conn, "player.html", player: player
  end
end
