red=`tput setaf 1`;
green=`tput setaf 2`;
reset=`tput sgr0`;
echo "=======================================================================================";
echo "=======================================================================================";
echo "Updating ubuntu pacakges";
sudo apt update -y
sudo apt upgrade -y
echo "Starting setup process";
echo "Downloading rtmp module.";
cd ~ && git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git
echo "${green} Download complete. ${reset}";
echo "Installing dependancies.";
sudo apt-get install build-essential libpcre3 libpcre3-dev libssl-dev zlib1g zlib1g-dev -y nload
echo "${green} Intalling dependancie complete. ${reset}";
echo "Downloading nginx.";
cd ~ && wget http://nginx.org/download/nginx-1.18.0.tar.gz
echo "Download complete.";
tar -xf nginx-1.18.0.tar.gz
echo "Unziped and deleted arhive.";
rm -rf nginx-1.18.0.tar.gz
echo "Configuration rtmp.This might take some time...";
cd ~/nginx-1.18.0 && ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module
echo "${green} Configuration rtmp done.OK ${reset}";
echo "Running install....."
sudo cd ~/nginx-1.18.0 && make;
sudo cd ~/nginx-1.18.0 && make install;
echo "${green} Nginx-Rtmp setup complete. ${reset}";
echo "Renaming existing conf file and creating new conf"
mv /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/original.nginx.conf
mv nginx.conf /usr/local/nginx/conf/;
echo "Creating hls drirectory and adding root access";
cd /usr/local/nginx/conf && sudo mkdir /nginx
sudo mkdir /nginx/hls
sudo chown -R www-data:www-data /nginx
cd ~
echo "Adding nginx to startup";
mv nginx.service /lib/systemd/system/nginx.service
systemctl enable nginx
systemctl daemon-reload
echo "${green} Setup completed.OK ${reset}";
echo "=======================================================================================";
echo "=======================================================================================";
echo "Installing node environment";
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh;
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash;
sudo source ~/.bashrc;
nvm install v14.17.5;
echo "${green}Installing done.OK";
echo "Setting up load job";
cd ~/ && git clone https://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@github.com/harik-6/rtmpload.git;
cd ~/rtmpload && npm install;
echo "${green} Node modules installation done.OK";
echo "Adding pm2 to start up"
cd ~/rtmpload && npm install pm2 -g;
cd ~/rtmpload && pm2 startup;
echo "${green} Server setup done.OK";
echo "Start running server by running following commands";
echo "1)cd ~/rtmpload";
echo "2)pm2 start load.js --name=loadjob";
echo "=======================================================================================";
echo "=======================================================================================";
echo "Start configuring ssl"; 
echo "Using let's encrypt to add ssl certificate"; 
snap install core
snap refresh core
snap install --classic certbot
echo "${green} Installed cert bot.OK ${reset}"; 
ln -s /snap/bin/certbot /usr/bin/certbot
echo "Enter the domain you wanted to add ssl";
read domainname;
certbot certonly --standalone -d $domainname;
echo "${green} Completed adding ssl.OK ${reset}";
echo "Listing all certificates";
ls -l /etc/letsencrypt/live/$domainname;
echo "RTMP Setup completed.Start streaminggggg!!!!";
echo "=======================================================================================";
echo "=======================================================================================";