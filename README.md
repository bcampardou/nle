# node-log-engine

[![Join the chat at https://gitter.im/BaobabCoder/node-log-engine](https://badges.gitter.im/BaobabCoder/node-log-engine.svg)](https://gitter.im/BaobabCoder/node-log-engine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A nodejs application to store logs of multiple applications. Uses redis and elasticsearch.

Branch | Build Status 
------ | :----------- 
dev | [![Build Status](https://travis-ci.org/BaobabCoder/node-log-engine.svg?branch=dev)](https://travis-ci.org/BaobabCoder/node-log-engine)
master | [![Build Status](https://travis-ci.org/BaobabCoder/node-log-engine.svg?branch=master)](https://travis-ci.org/BaobabCoder/node-log-engine)


# Get started

You can use this project with docker. Use the following command lines to run redis, elasticsearch and Node log engine :

    docker run -d -p 6379:6379 --name=redis redis:latest
    docker run -d -p 9200:9200 -p 9300:9300 --name=elasticsearch elasticsearch
    docker run -i -t --name=nle -p 3000:3000 beranger/nodelog-docker:1

You can take a look at the available tags here : https://hub.docker.com/r/beranger/nodelog-docker/tags/

If it is the first time you run node-log-engine, the project should ask you 'Do you wan't to create a administration api key ?'
Answer 'y' and write the api key somewhere.

# Routes

NLE use method-override. You can set a request parameter '_method=PUT' to send a PUT request.

## hostname parameter

The hostname parameter has to match the following regex :        

    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/

It allows domain names so you can use your application's domain name. This let you use NLE for multiple applications.

## The LOG route

Insert logs : 
    PUT /log/:hostname?key=YOUR_APP_API_KEY
The body of the request is the document that will be stored. You can define your own body with the properties you need.

Get logs :
    GET /log/:hostname?key=YOUR_APP_API_KEY
    
## The ADMIN route

Coming soon... Take a look at the code ;)
