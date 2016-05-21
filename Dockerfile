FROM node:5-onbuild

# make sure apt is up to date
RUN apt-get update



# set the working directory to run commands from
WORKDIR /srv

# add source files
RUN wget https://github.com/BaobabCoder/node-log-engine/archive/beta3.tar.gz
RUN tar -xvzf node-log-engine-1_0_0.tar.gz node-log-engine-1_0_0
RUN rm -rf ./node_modules
RUN rm -rf node-log-engine-1_0_0.tar.gz

# install express
RUN npm install -g express
# install the dependencies
RUN npm install

# expose the port so host can have access
EXPOSE 3000

# run this after the container has been instantiated
CMD ["npm", "start"]