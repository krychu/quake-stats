defmodule WebappWeb.GamesView do
  use WebappWeb, :view

  @svg_width     800
  @svg_height    130
  @chart_padding 30
  @chart_width   @svg_width - 2 * @chart_padding
  @chart_height  @svg_height - 2 * @chart_padding
  @chart_y_step  20

  def games_chart_data( games ) do
    diffs = games_chart_diffs( games )
    max_y = games_chart_max_y( diffs )
    points = games_chart_points( diffs, chart_x_step( games ), max_y )
    %{
      points: points,
      points_str: games_chart_str_points( points ),
      max_y: max_y,
      svg_width: @svg_width,
      svg_height: @svg_height,
      chart_width: @chart_width,
      chart_height: @chart_height,
      chart_padding: @chart_padding
    }
  end

  defp chart_x_step( games ) do
    @chart_width / ( length( games ) - 1 )
  end

  defp games_chart_diffs( games ) do
    games |> Enum.map( fn([a, b]) -> a.frags - b.frags end )
  end

  defp games_chart_max_y( ys ) do
    max = ys |> Enum.min_max |> Tuple.to_list |> Enum.map( fn(v) -> abs(v) end ) |> Enum.max
    max = case rem( max, @chart_y_step ) do
            0 -> max
            _ -> div( max + @chart_y_step, @chart_y_step ) * @chart_y_step
          end
    max
  end

  defp games_chart_points( ys, x_step, max_y ) do
    max = max_y
    min = -max

    ys
    |> Enum.map( fn(diff) -> ( 1.0 - ((diff - min) / (max - min)) ) * @chart_height + @chart_padding end)
    |> Enum.with_index
    |> Enum.map( fn({y, index}) -> {@chart_padding + index * x_step, y} end)
  end

  defp games_chart_str_points( points ) do
    points
    |> Enum.map( fn({index, y}) -> "#{index},#{y}" end )
    |> Enum.join( " " )
  end
end
