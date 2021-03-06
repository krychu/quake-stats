package Configuration;

use strict;
use warnings;
use lib '../src';
use Configuration qw($cfg);
use File::Basename;
use File::Spec::Functions;
require Exporter;
our @ISA = qw(Exporter);
our @EXPORT_OK = qw($cfg);

# my $prod_config = {
#     postgresql_host => '148.251.151.152',
#     postgresql_port => 14432,
#     postgresql_user => 'postgres',
#     postgresql_dbname => 'steam',

#     web_host => 'localhost',
#     web_port => 3000,

#     log_job_apps => ['File', 'log/job_apps.log'],
#     log_job_details => ['File', 'log/job_details.log'],
#     log_job_reviews => ['File', 'log/job_reviews.log'],

#     # How long before a started but non-finished detail job is retried
#     empty_detail_job_interval => '4 hours',

#     # How long before a started but non-finished review job is retried
#     empty_review_job_interval => '4 hours',

#     # How long before a finished review job is picked again
#     nonempty_review_job_interval => '10 minutes', # 4 hours
# };

my $dev_config = {
    #$prod_config->%*,

    postgresql_host         => '127.0.0.1',#'192.168.1.112', # '10.195.20.6',
    postgresql_port         => 5432,
    postgresql_user         => 'postgres',
    postgresql_password     => '',
    postgresql_dbname       => 'quakestats',

    postgresql_schema       => catfile(dirname(__FILE__), '..', 'sql', 'schema.sql'),

    sample_data             => catdir(dirname(__FILE__), '..', 'sampledata', 'games'),

    data_qtv                => catdir(dirname(__FILE__), '..', 'data', 'qtv'),
    data_badplace           => catdir(dirname(__FILE__), '..', 'data', 'badplace'),
    data_quake1pl           => catdir(dirname(__FILE__), '..', 'data', 'quake1pl'),

    scrape_delay            => 15 * 60, # secs, delay before scraping new stats from qtv
    ingest_delay            => 60, # secs, delay before checking and ingesting new stats

    fetch_file_delay        => 3, # secs, delay before fetching files

    log_ingest              => ['Stderr'],
    log_scrape_qtv          => ['Stderr'],
    log_scrape_badplace     => ['Stderr'],
    log_scrape_quake1pl     => ['Stderr'],
};

our $cfg = $dev_config;

1;
