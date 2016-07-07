FROM registry.eu-gb.bluemix.net/ibmnode:latest
RUN mkdir /var/www
VOLUME /var/www/

RUN mkdir /myapp/
RUN mkdir /myapp/client
RUN mkdir /myapp/views

COPY ./client /myapp/client
COPY ./views /myapp/views

COPY .bowerrc /myapp/
COPY ./app.js /myapp/
COPY ./bower.json /myapp/
COPY ./package.json /myapp/
COPY ./routes.js /myapp/
COPY ./start.sh /myapp/

WORKDIR /myapp
RUN npm install
RUN npm install -g bower
RUN bower install
EXPOSE 8000
CMD ["./start.sh"]
