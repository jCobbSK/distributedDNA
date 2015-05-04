# README #

This Repository contains everything related to my Master Thesis.

### What is this repository for? ###

This project tries to build distributive system for advanced big data pattern recognision applied on DNA sequence analysis. It is based on NodeJS and ExpressJS framework.

### How do I get set up? ###
1. install nodejs -- www.nodejs.org
1. install postgresql database -- http://www.postgresql.org/
1. run: npm install sequelize-cli -g
1. run: npm install
1. run: bower install (if command not exists install it with: npm install bower -g and after call bower install)
1. create database and set config/config.json
1. run: sequelize db:migrate
1. run: grunt createData
1. run: grunt fetchEnsemblData:100
1. run: grunt
1. open browser on localhost:3000
1. Login with credentials:
Login | Password | Role
------|----------|------
admin | admin    | admin
client| client   | client
node  | node     | node

###Various tasks###
1. grunt createData -- create default accounts
1. grunt purgeData:table_name -- removing all data from table
1. grunt fetchEnsemblData:countToFetch -- crawl genome browser for pattern genes
1. grunt generateSample:username:pattern_ids -- create sample for user defined by username with sequence positive for patterns in pattern_ids
1. grunt createTestPattern:chromosome:data:sequenceStart:name:description -- create pattern with provided required params chromosome and data, other params are optional

### Tasks TODO
1. normalize sample data
1. normalize ensembl sequences
1. setup socket connections
1. design distributive system interfaces
1. implement DS interfaces


### Who do I talk to? ###

Please feel free to contact me on twitter @jCobbSK or email kubo.kanitra@gmail.com