defmodule WebappWeb.PerformanceView do
  use WebappWeb, :view

  @svg_width     800
  @svg_height    130
  @chart_padding 30
  @chart_width   @svg_width - 2 * @chart_padding
  @chart_height  @svg_height - 2 * @chart_padding

  def timeline_chart_data( list, map_field ) do
    points = chart_points( list, map_field )
    %{
      points: points,
      points_str: chart_str_points( points ),
      svg_width: @svg_width,
      svg_height: @svg_height,
      chart_width: @chart_width,
      chart_height: @chart_height,
      chart_padding: @chart_padding
    }
  end

  defp chart_x_step( list ) do
    @chart_width / ( length( list ) - 1 )
  end

  defp chart_points( list, map_field ) do
    x_step = chart_x_step( list )

    list
    |> Enum.map( fn(item) -> item[ map_field ] end )
    |> Enum.map( fn(v) -> if is_nil( v ), do: 0, else: v end )
    |> Enum.map( fn(v) -> @svg_height - @chart_padding - v * @chart_height end )
    |> Enum.with_index
    |> Enum.map( fn({y, index}) -> {@chart_padding + index * x_step, y} end )
  end

  defp chart_str_points( points ) do
    points
    |> Enum.map( fn({index, y}) -> "#{index},#{y}" end )
    |> Enum.join( " " )
  end
end
