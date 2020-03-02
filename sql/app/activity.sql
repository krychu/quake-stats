-- Game counts per day.
--

WITH days AS (
  SELECT to_char(NOW() AT TIME ZONE 'UTC' - (INTERVAL '1 day' * generate_series(0, 50)), 'YYYY-MM-DD') AS day_bucket,
  NOW() AT TIME ZONE 'UTC' - (INTERVAL '1 day' * generate_series(0, 50)) AS date
), game_cnts AS (
  SELECT
    COUNT(*) AS game_cnt,
    to_char(date_trunc('day', date), 'YYYY-MM-DD') AS day_bucket
    --to_char(max(date), 'Dy') AS day_name
  FROM games
  WHERE
    mode = 'duel'
    AND dm = 3
    AND date > NOW() AT TIME ZONE 'utc' - interval '2 months'
  GROUP BY day_bucket
  --ORDER BY day_bucket DESC
)
SELECT
  days.day_bucket,
  to_char(days.date, 'Dy') AS day_name,
  COALESCE(game_cnt, 0) as game_cnt
FROM days LEFT OUTER JOIN game_cnts ON days.day_bucket = game_cnts.day_bucket
ORDER BY day_bucket DESC;
