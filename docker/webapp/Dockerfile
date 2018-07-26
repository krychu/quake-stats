# Requires that volume with the app is mounted at /quake-stats

FROM elixir:latest

# Install Phoenix (https://hexdocs.pm/phoenix/installation.html#content)
RUN mix local.hex --force
RUN mix archive.install --force https://github.com/phoenixframework/archives/raw/master/1.4-dev/phx_new.ez

# Node.js and other packages
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get update && apt-get install -y \
    nodejs \
    inotify-tools

WORKDIR /quake-stats/webapp

# We have app source mounted only when container is run, so only now we can install all dependencies
CMD mix local.rebar --force && mix deps.get && cd assets && npm install && cd .. && mix phx.server

