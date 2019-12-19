QuakeWorld stats

## Development

cd docker/
docker build --no-cache -t quake-stats .

## Development
docker run -it -p 3000:3000 --name quake-stats-1 ubuntu /bin/bash
docker exit
docker start quake-stats-1
docker exec -it quake-stats-1 bash

## Docs
See [Top-level Player Questions](docs/Questions.md) (currently duel mode only) which guide the design.
