FROM elixir:latest

# Install Phoenix (https://hexdocs.pm/phoenix/installation.html#content)
RUN mix local.hex
RUN mix archive.install https://github.com/phoenixframework/archives/raw/master/1.4-dev/phx_new.ez

# Node.js
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

# Rest
RUN apt-get install -y inotify-tools

