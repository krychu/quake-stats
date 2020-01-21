-- Game counts per day.
--

SELECT
  COUNT(*) AS game_cnt,
  date_trunc('day', date) AS day_bucket,
  to_char(max(date), 'Dy') AS day_name
FROM games
WHERE
  mode = 'duel'
  AND dm = 3
  AND date > NOW() AT TIME ZONE 'utc' - interval '2 months'
GROUP BY day_bucket
ORDER BY day_bucket DESC;
