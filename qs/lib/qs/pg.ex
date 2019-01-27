defmodule PG do
  use GenServer

  @postgresql_host "127.0.0.1"
  @postgresql_port 5432
  @postgresql_user "postgres"
  @postgresql_database "quakestats"

  # ------------------------------------------------------------
  # External API
  # ------------------------------------------------------------

  # initial state from application.ex is passed here and via start_link to init
  def start_link(state) do
    GenServer.start_link(__MODULE__, state, name: __MODULE__)
  end

  @spec query(String.t, [String.t | number]) :: {}
  def query(q, q_args \\ []) when is_list(q_args) do
    GenServer.call __MODULE__, {:query, q, q_args}
  end

  # ------------------------------------------------------------
  # GenServer Implementation (callbacks)
  # ------------------------------------------------------------

  def init(state) do
    {:ok, pg_pid} = Postgrex.start_link(hostname: @postgresql_host,
      port: @postgresql_port,
      username: @postgresql_user,
      database: @postgresql_database)

    # pg_pid becomes state available in handle_call / terminate
    {:ok, pg_pid}
  end

  def handle_call({:query, q, q_args}, _from, pg_pid) do
    reply = Postgrex.query!(pg_pid, q, q_args)
    {:reply, reply, pg_pid}
  end

  def terminate(_reason, _pg_pid) do
    # Postgrex.stop(pg_pid)
  end
end
