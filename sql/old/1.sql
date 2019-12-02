with recent_games as (
	select *
	from games inner join game_players on games.id = game_players.game_id
	where name = 'meag'
	order by date desc
), duels as (
	select *
	from recent_games inner join game_players on recent_games.game_id = game_players.game_id
	where game_players.name != recent_games.name
)
select * from duels;