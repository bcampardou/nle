# NLE - Node Log Engine [![Gitter](https://badges.gitter.im/BaobabCoder/node-log-engine.svg)](https://gitter.im/BaobabCoder/node-log-engine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
A nodejs application to store logs of multiple applications. Uses redis and elasticsearch.

Branch | Build Status 
------ | :----------- 
dev | [![Build Status](https://travis-ci.org/BaobabCoder/nle.svg?branch=dev)](https://travis-ci.org/BaobabCoder/nle)
master | [![Build Status](https://travis-ci.org/BaobabCoder/nle.svg?branch=master)](https://travis-ci.org/BaobabCoder/nle)


# Get started

You can run this project on Docker. Use the following command lines to run redis, elasticsearch and Node log engine :

    docker run --name some-redis -d -p 6379:6379 redis redis-server --appendonly yes
    docker run -d -p 9200:9200 -p 9300:9300 --name some-elasticsearch elasticsearch

To run NLE, you can download the sources from the releases section or using the command :

    git clone https://github.com/BaobabCoder/node-log-engine.git

Once the sources are pasted, you are able to build the Docker image :

    docker build -t nle .
    docker run -it --name some-nle -p 3000:3000 my-nle-image-name

You can use the latest docker image :

    docker run -i -t --name some-nle -p 3000:3000 beranger/nle:latest

You can take a look at the available tags here : https://hub.docker.com/r/beranger/nodelog-docker/tags/

If it is the first time you run node-log-engine, the app will register an administration API key.
When running as a daemon in docker, you can see the key with the command :

    docker logs some-nle



# Routes

NLE use method-override. You can set a request parameter '_method=PUT' to send a PUT request.

## hostname parameter

The hostname parameter has to match the following regex :        

    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/

It allows domain names so you can use your application's domain name. This let you use NLE for multiple applications.

## The LOG route

Insert logs : 
    PUT /log/:hostname?key=YOUR_APP_API_KEY
    
Use the request body to log. You can define your own body with the properties you need.

Get logs :
    GET /log/:hostname?key=YOUR_APP_API_KEY
    
Get log structure (properties) :
    GET /log/:hostname/structure?key=YOUR_APP_API_KEY
    
## The ADMIN route

Coming soon... Take a look at the code ;)
