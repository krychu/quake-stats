defmodule PG do
  def get_pg() do
    Postgrex.start_link(hostname: "192.168.1.106", port: 32768, username: "postgres", database: "quakestats")
  end
end
