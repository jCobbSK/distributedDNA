# README #

This Repository contains everything related to my Master Thesis.

### What is this repository for? ###

This project tries to build distributive system for advanced big data pattern recognision applied on DNA sequence analysis. It is based on NodeJS and ExpressJS framework.

### How do I get set up? ###
1. install nodejs -- www.nodejs.org
2. install postgresql database -- http://www.postgresql.org/
3. run: npm install sequelize-cli -g
4. run: npm install
5. run: bower install (if command not exists install it with: npm install bower -g and after call bower install)
6. create database and set config/config.json
7. run: sequelize db:migrate
8. run: grunt createData
9. run: grunt fetchEnsemblData:100
10. run: grunt
11. open browser on localhost:3000

###Various tasks###
1. grunt createData -- create default accounts
2. grunt purgeData:table_name -- removing all data from table
3. grunt fetchEnsemblData:countToFetch -- crawl genome browser for pattern genes
4. grunt generateSample:username:pattern_ids -- create sample for user defined by username with sequence positive for patterns in pattern_ids

### Tasks TODO
1. normalize sample data
2. normalize ensembl sequences
3. setup socket connections
4. design distributive system interfaces
5. implement DS interfaces


### Who do I talk to? ###

* Please feel free to contact me on twitter @jCobbSK