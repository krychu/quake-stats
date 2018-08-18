defmodule Mix.Tasks.Qwstats.ImportData do
  use Mix.Task

  @shortdoc "Import sample json data into Postgres"
  def run( data_path ) do
    System.cmd( "" )
    IO.puts( data_path )
  end
end
