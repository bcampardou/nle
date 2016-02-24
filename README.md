# node-log-engine
A nodejs application to store logs of multiple applications. Uses redis and elasticsearch.

# Get started

You can use this project with docker. Use the following command lines to run redis, elasticsearch and Node log engine :

    docker run -d -p 6379:6379 --name=redis redis:latest
    docker run -d -p 9200:9200 -p 9300:9300 --name=elasticsearch elasticsearch
    docker run -i -t --name=nle -p 3000:3000 beranger/nodelog-docker:dev

You can take a look at the available tags here : https://hub.docker.com/r/beranger/nodelog-docker/tags/

If it is the first time you run node-log-engine, the project should ask you 'Do you wan't to create a administration api key ?'
Answer 'y' and write the api key somewhere.
