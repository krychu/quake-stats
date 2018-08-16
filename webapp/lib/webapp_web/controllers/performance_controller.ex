defmodule WebappWeb.PerformanceController do
  use WebappWeb, :controller

  # def game_cnt( conn, %{"player" => player} = params ) do
  #   {:ok, pg_pid} = PG.get_pg()

  #   format = params |> Map.get( "format", "json" )
  #   r = PG.get_game_cnt_timeline( pg_pid, player )
  #   case format do
  #     "json" -> json( conn, r )
  #     "html" -> html( conn, Phoenix.View.render_to_string( WebappWeb.PerformanceView, "performance.html", game_cnt: r ) )
  #   end
  # end
end
