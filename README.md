# README #

This Repository contains everything related to my Master Thesis.

### What is this repository for? ###

This project tries to build distributive system for advanced big data pattern recognision applied on DNA sequence analysis. It is based on NodeJS and ExpressJS framework.

### How do I get set up? ###
1. install nodejs -- www.nodejs.org
1. install postgresql database -- http://www.postgresql.org/
1. run: npm install sequelize-cli -g
1. clone repository: git clone git@bitbucket.org:KandoSVK/diplomka.git
1. go inside project folder: cd Diplomka
1. run: npm install
1. run: bower install (if command not exists install it with: npm install bower -g and after call bower install)
1. create database and set config/config.json
1. run: sequelize db:migrate
1. run: grunt createData
1. run: grunt fetchEnsemblData:100
1. run: sudo grunt
1. open browser on localhost:3000
1. Login with credentials:

| Login  | Password    | Role   |
| ------ | ----------- | ------ |
| admin  | admin       | admin  |
| client | client      | client |
| node   | node        | node   |

###Various tasks###
Various grunt tasks are created for testing and helping manipulation with data.

1. grunt createData -- create default accounts
1. grunt purgeData:table_name -- removing all data from table
1. grunt fetchEnsemblData:countToFetch -- crawl genome browser for pattern genes
1. grunt generateSample:username:pattern_ids -- create sample for user defined by username with sequence positive for patterns in pattern_ids
1. grunt createTestPattern:chromosome:data:sequenceStart:name:description -- create pattern with provided required params chromosome and data, other params are optional
1. grunt generateRandomSamples:N:M -- Generates N random samples with random M positive and negative patterns each
1. grunt generateDNA:path -- Generate complete sequence of human DNA, output file defined by path is cca 2.9GB

### TODO ###

1. change reading & writing files from UTF-8 into ASCII
1. notify Node when FE is actually computing
1. read sample by chunks (createReadStream instead readFile)
1. compile data to regular expression on fetching pattern
1. on uploading sample convert it to upper case
1. responsive design for half macbook screen
1. update client's front-end during analyze
1. normalize pattern during fetching for notForwardStrand
1. fix mocha tests so it will succeed

### Contact ###

Please feel free to contact me on twitter __@jCobbSK__ or email __kubo.kanitra@gmail.com__