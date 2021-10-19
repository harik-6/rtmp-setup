FROM ubuntu:trusty

ENV DEBIAN_FRONTEND noninteractive
ENV PATH $PATH:/usr/local/nginx/sbin

# create directory
RUN mkdir /src

# update and upgrade packages
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y build-essential zlib1g zlib1g-dev 
RUN apt-get install -y libpcre3 libpcre3-dev libssl-dev
RUN apt-get install -y curl wget git

# get nginx source
WORKDIR /src
RUN wget http://nginx.org/download/nginx-1.21.0.tar.gz && \
  tar zxf nginx-1.21.0.tar.gz && \
  rm nginx-1.21.0.tar.gz && \
# get nginx-rtmp module
  git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git

# compile nginx
WORKDIR /src/nginx-1.21.0
RUN ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module && \
  make && \
  make install

# creating hls directory
WORKDIR /usr/local/nginx/conf
RUN mkdir /nginx
RUN mkdir /nginx/hls
RUN chown -R www-data:www-data /nginx

# installing node v14
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y --force-yes nodejs 

# installing load application
WORKDIR /src
RUN git clone https://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@github.com/harik-6/rtmpload.git;
WORKDIR /src/rtmpload
RUN npm install
RUN npm install pm2 -g

# exposing ports
EXPOSE 1935
EXPOSE 80
EXPOSE 443

# adding nginx.conf file, should be last step
WORKDIR /
RUN mv /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/original.nginx.conf
ADD nginx.conf /usr/local/nginx/conf/nginx.conf
RUN echo "daemon off;" >> /usr/local/nginx/conf/nginx.conf

WORKDIR /
CMD ["nginx"]
