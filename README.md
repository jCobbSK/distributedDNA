### Intro ###

How many CPUs do you have? You may have PC, laptop, tablet, smartphone all has significant computational power and almost every device is connected to network and still probably most of the time it is idle, not doing anything. Why shouldn't we use that power and therefore reduce ecologic and economic fallout of increasing computational power for specific purposes like big-data analysis?

Almost all devices, even x-box, ps3 can open website and therefore run JavaScript which is rapidly evolving language of 21st century. Why shouldn't we provide computational power of that device simply by opening website?

This project tries that, the purpose is to create distributive system with running browsers as peers. Simple enough?

### What is this project for? ###

This project builds distributive system for advanced big data pattern recognition applied on DNA sequence analysis. It is build so javascript distributive module is separate from application logic, so if you are interested in distributive communication between peers and server go ahead and lookup JDSM folder, if you want to see logic behind fetching, parsing and analyzing DNA sequence go to DNAAnalysis folder.

### Technology stack ###

Application is based on __NodeJS__ with __ExpressJS__ framework. __PostgreSQL__ is used for database layer together with __sequlizejs__ ORM library. __Socket.io__ is used for communication between peers and main server.

### How do I get set up? ###
1. install nodejs -- http://www.nodejs.org
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

### Contact ###

Please feel free to contact me on twitter __@jCobbSK__ or email __kubo.kanitra@gmail.com__
