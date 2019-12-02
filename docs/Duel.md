# Performance metrics

The goal is to have a performance metric that:
1. Can be used for per-game reporting
2. Can be used for per-game per-weapon (RL and LG) reporting
3. Can be averaged across games to represent the overall performance

Such metric should be relatively stable to small fluctuations in values involved, maps, varying number of games with different opponents. For 3 we would like to calculate the metric for a period of time and present development of the metric over time.

Ultimately, this number should be a good reflection of performance, not an indication of a few anomalous games, and allowing comparison across different games, on different maps, against different opponents.

Below a review of few options. Remember that each metric has to work for 1, 2, and 3. That is, total, per weapon, and avg across games.

1. Kills / Deaths

   This might seem like a good metric. Unconditionally you want to kill more than die. It's also easy to interpret, for example:
   * Score above 1 means you killed more than died
   * Score of 2 means you killed twice for every death
   
   There are two problems:
   1. The metric is sensitive to low scores. 12 to 1 = 12, one frag more for the opponent, 12 to 2 and we have 6. Small differences in scores can impact the average.
   2. Unclear what to do for deaths = 0.
   
2. Damage Given / Damage Taken

   Similar situation to Kills / Deaths.

3. Damage Given / Total Damage Given (Player A + B)

   This metric says how much damage you caused of all damage given during the game. Again, something you always want to increase. This metric doesn't suffer from the sensitivity problem. It always produces a normalized, 0 to 1, value. Opponent's 0 score doesn't present a problem. Only interpretation could be considered a bit harder. For example when used for RL: 0.21 would mean that 21% of all damage during the game was caused by your usage of RL.

4. Damage Given / (Damage Given + Damage Taken)

   Similar story to 3 but takes into account you hurting yourself. So you want to increase damage and decrease both damage taken and damaging yourself.

