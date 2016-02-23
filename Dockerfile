FROM node:0.10

# make sure apt is up to date
RUN apt-get update



# set the working directory to run commands from
WORKDIR /srv

# add source files
RUN wget "https://github.com/BaobabCoder/node-log-engine/archive/beta2.tar.gz"
RUN tar -xzf beta2.tar.gz
RUN cp -a node-log-engine-beta2/. .
RUN rm -rf beta2.tar.gz
RUN rm -rf node-log-engine-beta2

# install express
RUN npm install -g express
# install the dependencies
RUN npm install

# expose the port so host can have access
EXPOSE 3000

# run this after the container has been instantiated
CMD ["npm", "start"]