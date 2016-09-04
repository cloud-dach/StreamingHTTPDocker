# FROM registry.eu-gb.bluemix.net/ibmnode:latest
FROM alpine:3.4

RUN mkdir /myapp/ && mkdir /myapp/client && mkdir /myapp/views && mkdir /var/www

VOLUME /var/www/

COPY ./client /myapp/client
COPY ./views /myapp/views
COPY .bowerrc /myapp/
COPY ./app.js /myapp/
COPY ./bower.json /myapp/
COPY ./package.json /myapp/
COPY ./routes.js /myapp/

WORKDIR /myapp
# sqeeze to 32 MByte
RUN apk add --update nodejs git && npm install && npm install -g bower && bower install && rm -rf /usr/lib/node_modules && apk del git && rm -rf /root
EXPOSE 8000

CMD ["node", "/myapp/app.js"]
