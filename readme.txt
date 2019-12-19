QuakeWorld stats

Development Environment
--------------------------------------------------------------------------------
docker run -it -p 3000:3000 -v /path/to/quake-stats:/quake-stats --name quake-stats-1 ubuntu /bin/bash
docker exit
docker start quake-stats-1
docker exec -it quake-stats-1 bash
... then follow steps in docker/install

Docs
--------------------------------------------------------------------------------
See [Top-level Player Questions](docs/Questions.md) (currently duel mode only) which guide the design.
