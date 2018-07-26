FROM postgres:latest

# Copy over quakestats schema which is used in the script below
COPY sql/schema.sql /

# Copy over script that PostgreSQL will run automatically and which creates quakestats database
COPY docker/postgresql/init.sh /docker-entrypoint-initdb.d/
