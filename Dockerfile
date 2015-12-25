FROM registry.ng.bluemix.net/ibmnode:latest
RUN mkdir /var/www
VOLUME /var/www/
RUN mkdir /myapp
COPY ./* /myapp/
WORKDIR /myapp
RUN npm install
EXPOSE 8000
CMD ["./start.sh"]
