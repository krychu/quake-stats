*Note: The ideas described below are early stage. At some point this info will be moved to a separate doc.*

# QuakeWorld Player Stats and Boards

The idea of quake stats has two components:

## 1. Player Profile
**Key Questions**
1. What's my current performance? How good is it?
2. Am I improving over time? What should I work on?
3. How do I compare to other players?

*Goal: self improvement, understanding where you are, what your strengths and weaknesses are, and getting feedback loop as you work on improving.*

## 2. Leaderboards
**Key Questions**
1. Who's better / worse? Who's on the top?
2. Where am I in the global ranking?
3. How do I compare to my neigbours and top players?

*Note: Profile and leaderboards could be expanded to teams and clans.*

*Note: There's also idea of seasons (e.g., a month or quarter, everyone starts with a clean slate) which is somewhat related to leaderboards.*

# Design
## 1. Player Profile
**1. What's my current performance? Is it good?**
   1. Top-level stats
      1. Number of all games played, games per mode, frags, deaths, frag / death ratio
      2. Active?, Last seen
      3. Preferred maps and servers
      4. Each stat compared to:
          - Previous week or month

   2. FFA
      1. Frags / minute / number of players
      2. Number of games played, won, top3, win / no-win ratio
      3. Weapon stats (RL/GL/LG/Axe frags (incl. %), deaths, avg damage, direct hits, accuracy) and pickups stats
      4. Each stat compared to:
          - Personal average (rolling)
          - Community average
          - Show percentile
      5. List of better and worse players (only those I played against)

   3. 1on1, 2on2, 4on4
      1. Number of games played, won, lost, win / loss ratio
      2. Weapon and pickups stats
      3. List of better and worse players (only those I played against)
        
   4. Table with the recent games (separate table for each mode and a global table?)
      1. Place
      2. Weapon and pickups stats
      3. Each game metric compared to:
         - Personal average from the last N games
         - Community average
         - Show percentile

   5. Achievements
      1. Torunament medals
      2. Axer of the week
      3. Quad lunatic
      4. Telefragem'
      5. Water assasin
      6. Weak legs (death by fall)
      7. Welder man
      8. Invisible stalker

**2. Am I improving over time? What should I work on?**
   1. See 1.4
   2. Chart with core metrics (e..g, Weapon stats, win/loss ratio) over time.
   3. Charts could include reference line with:
      - Personal average
      - Community average
   4. List of recommendations of what to improve
      - e.g., Your LG seems to be much lower than those of players that typically win with you etc.

**3. How do I compare to other players?**
   1. See 1.2.iv, 1.2.v, 1.3.iii, 1.4.iii
   2. Ability to view profiles of other players
   3. Pick a player and have all your stats compared to theirs

## Leaderboards
- TBD
- Leaderboards will require an iterative ranking system that takes opponent skill into account.  Potentially some Bayesian model, or even page-rank approach. Candidates include:
  - TrueSkill developed by Microsoft and used in XBox. It's unfortunately patented. Python implementation is available [here](http://trueskill.org/)). Paper is [here](https://www.microsoft.com/en-us/research/publication/trueskilltm-a-bayesian-skill-rating-system/).
  - [Ree](https://rankade.com/ree) - there seems to be hosted option.
- Other papers:
   - [Iterative Ranking from Pair-wise Comparisons](https://devavrat.mit.edu/wp-content/uploads/2017/11/Iterative-ranking-from-pair-wise-comparisons.pdf)

### Issues (collected from #dev-corner discord discussion)
- Global ranking could give people incentive to play for stats (their public persona) which might impact community in a number of ways, including playing fewer and less diverse games. This apparently happened in QuakeLive. And perhaps could be especially harmful to a small community.
- Ranking defines what's important about the game. This can be misaligned with personal goals (e.g., playing casually for fun) makeing one feel like it's not the right game / community. Personal anecdote: SC2 ranking always made me feel like I can't afford the time required to climb to the top, and so there's no point of playing. Rankings made me ponder the subject and took the focus away from fun.
- Ranking could be especially discouraging to beginners. Is quake community somewhat more proficient than others? Lots of old school players.
- The above fears may not be justified. Rankings could benefit more people than they impact. They could bring extra excitement, incentive to improve, and give a unified view (across different divisions) of who's where.
- There's a risk that small community and lack of matching system would not provide enough data to build reliable ranking. Think of clusters of players that never play outside their circles. How do you stack rank them?
- Among other things, a good ranking system should to take player skill into account. Winning against a good player is worth more than winning against a poor player.
- Ranking can't be based on a basic stat such as win/loss. It needs to be a synthetic, derived metric that takes multiple factors into account (who you won against, number of different maps played etc.).
- The need for synthetic metric creates a risk that players wouldn't understand how it works and thus not trust it.

### Ideas
- Opt in / out. You can say "I don't want to be part of this, thanks".
- Ranked / unranked matches. Ability to pick which of your matches should contribute to the global ranking.
- Global ranking could be refreshed every week or month to prevent obsessing over it.

