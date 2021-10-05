#Arguments
ARG NGINX_VERSION=1.21.0

FROM alpine:3.13

#Update packages
RUN apt update -y
RUN apt upgrade -y

#Install dependancies
RUN apt-get install build-essential zlib1g zlib1g-dev -y
RUN apt-get libpcre3 libpcre3-dev libssl-dev -y
RUN apt-get crul -y

#Install node
ENV NODE_VERSION=14.17.5
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

#Install certbot
RUN snap install core
RUN snap refresh core
RUN snap install --classic certbot
RUN ln -s /snap/bin/certbot /usr/bin/certbot

#Download files
ARG NGINX_VERSION
RUN git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git
RUN http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
RUN -o- https://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@raw.githubusercontent.com/harik-6/rtmpsetup/main/nginx.conf > nginx.conf;
RUN -o- https://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@raw.githubusercontent.com/harik-6/rtmpsetup/main/nginx.service > nginx.service;
RUN -o- https://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@raw.githubusercontent.com/harik-6/rtmpsetup/main/stat.xsl > stat.xsl;

#Install nginx module
RUN tar -xf ${NGINX_VERSION}.tar.gz
RUN rm -rf ${NGINX_VERSION}.tar.gz
RUN cd ${NGINX_VERSION} && ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module
RUN make
RUN make install
RUN cd ..  

#Move config files
RUN mv /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/original.nginx.conf
RUN mv nginx.conf /usr/local/nginx/conf/;
RUN mv stat.xsl /usr/local/nginx/html/;
RUN mv nginx.service /lib/systemd/system/nginx.service

#Create root dir
RUN cd /usr/local/nginx/conf && sudo mkdir /nginx
RUN mkdir /nginx/hls
RUN chown -R www-data:www-data /nginx
RUN cd ~
RUN systemctl enable nginx
RUN systemctl daemon-reload