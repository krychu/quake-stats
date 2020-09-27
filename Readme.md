# QuakeStats

Player statistics for the legendary game of Quake.

TBD

## Tooling

- Scraping data
  - ./run_scrape_quake1pl.pl
  - ./run_scrape_qtv.pl
  - ./run_scrape_badplace.pl
- ./run_ingest.pl
- TDB

## Development Environment

- cd web; npx webpack --watch
- ./run_webapp.pl


### Docker TBD

docker run -it -p 3000:3000 -v /path/to/quake-stats:/quake-stats --name quake-stats-1 ubuntu /bin/bash
docker exit
docker start quake-stats-1
docker exec -it quake-stats-1 bash
... then follow steps in docker/install

