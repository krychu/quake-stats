-- Insert a game
--
-- Placeholders
-- ------------
-- See insert query below.
--
-- Returning
-- ---------
-- id of the inserted row.
--

INSERT INTO games (
       version,
       date,
       map,
       hostname,
       ip,
       port,
       mode,
       tl,
       dm,
       duration,
       demo,
       file
)
VALUES($1,$2::timestamptz,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
RETURNING id;
