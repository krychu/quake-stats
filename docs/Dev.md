# Setup
- Install [elixir](https://elixir-lang.org/install.html)
- Install PostgreSQL and add CLI tools, such as `createdb`, to your `$PATH`.
  - For mac users: [PostgreSQL app](https://postgresapp.com/) is a good option.
    [Here](https://postgresapp.com/documentation/cli-tools.html) is how to add
    CLI tools to `$PATH`.
- Get project dependencies
  ```sh
  cd qs
  mix deps.get
  cd assets
  npm install
  ```
- Setup quakestats db
  ```sh
  # in qs
  ./scripts/pg_create_db.sh
  ./scripts/pg_load_schema_file.sh
  ```
- Get sampledata, unpack and update `SAMPLEDATA_PATH` in `./scripts/config.sh`.
  This data is not currently in the repo.
  ```sh
  ./scripts/pg_import_data.sh
  ```
- Start quakestats
  ```sh
  cd qs
  mix phx.server
  ```
- Access quakestats at `http://localhost:4000/duel/bps`

