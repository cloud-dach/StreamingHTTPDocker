# Streaming Node.js HTTP Down- and Upload Example in Docker Container
A simple Node.js HTTP multipart scalable download/upload file server, running in a Docker Container or on IBM Bluemix Container Service using Docker volumes.<br />
I added a Angular Webapplication to list files and test the upload and download from the Browser as well, this is based on the following examples and articles:   
http://thejackalofjavascript.com/file-browser-with-jstree-angularjs-and-expressjs/   
http://stackoverflow.com/questions/26009452/uploading-files-using-angularjs   
https://jsfiddle.net/JeJenny/ZG9re/   

## Local Test
clone repo and build and test the Docker Image locally  
```bash
git clone https://github.com/cloud-dach/StreamingHTTPDocker.git
cd StreamingHTTPDocker
docker build -t "streaminghttpdocker" .  
docker run -d -p 8000 -v /var/www:/var/www streaminghttpdocker  
```
test the multipart upload with curl  
```bash
curl -i -X POST -H "Content-Type: multipart/form-data" -F "data=@filename" http://localhost:8000/upload  
```
test the multipart download with wget  
```bash
wget http://localhost:8000/download/filename  
```
## Accessing the Webapplication in the Browser
```
http://localhost:8000/
```

## Running it on IBM Bluemix using Container Scalabale Group
do a cf login and cf ic init
```bash
cf login  ... 
cf ic init ...
```
tag local image in your remote registry on Bluemix  
```bash
docker tag streaminghttpdocker registry.ng.bluemix.net/[YOURBLUEMIXNAMESPACE]/streaminghttpdocker
```
push the image to Bluemix  
```bash
docker push registry.ng.bluemix.net/[YOURBLUEMIXNAMESPACE]/streaminghttpdocker
```
now create a docker volume for storing files  
```bash
cf ic volume create [YOURVOLUME]
```
Now we create a scalabale group with 2 instances and bind it to on URL. The exposed port in the container of 8000 will be accessible on HTTPS 443 and your chosen URL. In that case you don't need to assign a public IP like for a single container.  
https://www.ng.bluemix.net/docs/containers/container_cli_reference_cfic.html  
This example will start 2 instances a 256MB bind a volume to the container path given in Dockerfile and has autorecovery on and will have an URL of https://[YOURHOSTNAME].eu-gb.bluemix.net.  
Please adopt your Bluemix region domains!  
```bash
cf ic group create -p 8000 -m 256 -v [YOURVOLUME]:/var/www  --min 2 --auto --hostname [YOURHOST] -d eu-gb.mybluemix.net --name mygroup registry.eu-gb.bluemix.net/[YOURBLUEMIXNAMESPACE]/streaminghttpdocker:latest
```
Now you can test the multipart upload with curl on Bluemix 
```bash
curl -i -X POST -H "Content-Type: multipart/form-data" -F "data=@filename" https://[YOURHOST].eu-gb.mybluemix.net/upload  
```
Test the multipart download with wget  
```bash
wget https://[YOURHOST].eu-gb.mybluemix.net/download/filename  
```
Now you can store and retrieve files in sclabale way using Docker and Node.js.

