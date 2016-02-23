FROM node:5.6

# make sure apt is up to date
RUN apt-get update



# set the working directory to run commands from
WORKDIR /srv

# add source files
RUN git clone https://github.com/BaobabCoder/node-log-engine.git
RUN cp -a node-log-engine/. .
RUN rm -rf node-log-engine

# install express
RUN npm install -g express
# install the dependencies
RUN npm install

# expose the port so host can have access
EXPOSE 3000

# run this after the container has been instantiated
CMD ["npm", "start"]