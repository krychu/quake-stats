defmodule ScriptsTest do
  use ExUnit.Case
  doctest Scripts

  test "greets the world" do
    assert Scripts.hello() == :world
  end
end
