FROM node:onbuild

# make sure apt is up to date
RUN apt-get update

# add source files
ADD . /srv

# set the working directory to run commands from
WORKDIR /srv

CMD ["ls"]

RUN rm -rf ./node_modules
# install express
RUN npm install -g express
RUN npm install -g forever
# install the dependencies
RUN npm install

# expose the port so host can have access
EXPOSE 3000

# run this after the container has been instantiated
CMD ["forever", "start"]