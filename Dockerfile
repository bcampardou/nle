FROM node:0.10

# make sure apt is up to date
RUN apt-get update


# add source files
COPY . /srv

# set the working directory to run commands from
WORKDIR /srv

# install express
RUN npm install -g express
# install the dependencies
RUN npm install

# expose the port so host can have access
EXPOSE 3000

# run this after the container has been instantiated
CMD ["npm", "start"]