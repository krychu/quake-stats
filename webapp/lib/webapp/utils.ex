defmodule Utils do
  def round_to_string( n, p ) do
    n |> Decimal.new() |> Decimal.round( p ) |> Decimal.to_string() #Float.round( n, p )
  end

  def round_to_percentage_string( nil, p ) do
    round_to_string( 0, p )
  end

  def round_to_percentage_string( n, p ) do
    round_to_string( n * 100, p )
  end
end

