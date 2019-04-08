defmodule QsWeb.Router do
  use QsWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", QsWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/duel/:player", DuelController, :player
  end

  # Other scopes may use custom stacks.
  scope "/api", QsWeb do
    pipe_through :api

    get "/duel/:player/game_cnts", APIDuelController, :game_cnts
    get "/duel/:player/games/:cnt", APIDuelController, :games
    get "/duel/:player/win_probabilities", APIDuelController, :win_probabilities
  end
end
