#!/bin/sh

cd "$(dirname "$0")/../qs"
mix phx.server

# iex -S mix phx.server
