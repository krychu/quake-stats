defmodule QsWeb.PageController do
  use QsWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
