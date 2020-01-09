-- Insert a game player
--
-- Placeholders
-- ------------
-- See insert query below.
--

INSERT INTO game_players(
       game_id,
       top_color,
       bottom_color,
       ping,
       name,

       frags,
       deaths,
       spawn_frags,
       kills,
       suicides,

       damage_taken,
       damage_given,
       damage_self,

       spree_max,
       spree_quad,
       control,
       speed_max,
       speed_avg,

       health_15,
       health_25,
       health_100,
       ga,
       ya,
       ra,
       q,
       q_time,

       sg_attacks,
       sg_direct_hits,
       sg_kills,
       sg_deaths,
       sg_damage,

       gl_attacks,
       gl_direct_hits,
       gl_effective_hits,
       gl_kills,
       gl_deaths,
       gl_picked,
       gl_damage,

       rl_attacks,
       rl_direct_hits,
       rl_effective_hits,
       rl_kills,
       rl_deaths,
       rl_picked,
       rl_damage,

       lg_attacks,
       lg_direct_hits,
       lg_kills,
       lg_deaths,
       lg_picked,
       lg_damage
)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51);
