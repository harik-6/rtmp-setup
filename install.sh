red=`tput setaf 1`;
green=`tput setaf 2`;
reset=`tput sgr0`;
echo "=======================================================================================";
echo "=======================================================================================";
echo "Updating ubuntu pacakges";
sudo apt update -y
sudo apt upgrade -y
echo "Starting setup process";
echo "Installing dependancies.";
sudo apt-get install build-essential libpcre3 libpcre3-dev libssl-dev zlib1g zlib1g-dev nload wondershaper -y
echo "Intalling dependancie complete.";
echo "Downloading rtmp module and files.";
git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git
wget http://nginx.org/download/nginx-1.18.0.tar.gz
curl -o- https://raw.githubusercontent.com/harik-6/rtmpsetup/main/nginx.conf > nginx.conf;
curl -o- https://raw.githubusercontent.com/harik-6/rtmpsetup/main/nginx.service > nginx.service;
curl -o- https://raw.githubusercontent.com/harik-6/rtmpsetup/main/stat.xsl > stat.xsl;
echo "${green} Download complete. ${reset}";
tar -xf nginx-1.18.0.tar.gz
rm -rf nginx-1.18.0.tar.gz
echo "Unziped and deleted arhive.";
echo "Configuration rtmp.This might take some time...";
cd nginx-1.18.0 && ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module
echo "Configuration rtmp done.OK";
echo "Running install....."
sudo make
sudo make install
cd ..
echo "Nginx-Rtmp setup complete.";
echo "Renaming existing conf file and creating new conf"
mv /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/original.nginx.conf
mv nginx.conf /usr/local/nginx/conf/;
mv stat.xsl /usr/local/nginx/html/;
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
echo "Start configuring ssl"; 
echo "Using let's encrypt to add ssl certificate"; 
cd ~;
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
echo "=======================================================================================";
echo "=======================================================================================";
echo "Installing node environment";
cd ~;
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh > nvminstall.sh;
sleep 5s;
chmod +x nvminstall.sh
sh nvminstall.sh
sleep 5s;
export NVM_DIR="$HOME/.nvm";
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh";
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion";
echo "Installing node v14.17.5";
nvm install v14.17.5;
rm nvminstall.sh
echo "${green} Installing done.OK ${reset}";
echo "Setting up load job".;
echo "Downloading git repo.";
git clone https://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@github.com/harik-6/rtmpload.git;
sleep 10s;
echo "${green} Git repo download success.OK ${reset}";
echo "Installing node modules.";
cd rtmpload;
npm install;
echo "${green} Node modules installation done.OK ${reset}";
echo "Adding pm2 to start up"
npm install pm2 -g;
pm2 startup;
echo "${green} Server setup done.OK ${reset}";
cd rtmpload && pm2 start load.js --name=loadjob
echo "=======================================================================================";
echo "=======================================================================================";
