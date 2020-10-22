# QuakeStats

Player statistics for the legendary game of Quake.

TBD

## Tooling

See ./ctrl.pl

## Development Environment

./ctrl.pl webapp-dev
./ctrl.pl webapp

### Docker TBD

docker run -it -p 3000:3000 -v /path/to/quake-stats:/quake-stats --name quake-stats-1 ubuntu /bin/bash
docker exit
docker start quake-stats-1
docker exec -it quake-stats-1 bash
... then follow steps in docker/install

## Useful links

- https://gist.github.com/meag/a7ef2140813c33eeefc1802cc9575e1c#why-is-it-authenticating-to-badplaceeu-and-not-quakeworldnu
- https://github.com/meag/qwscores
