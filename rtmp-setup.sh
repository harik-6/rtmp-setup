echo "Updating pacakges";
sudo apt update -y
sudo apt upgrade -y
echo "Starting setup process";
echo "Downloading rtmp module.";
git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git
echo "Download complete.";
echo "==================================================================================";
echo "Installing dependancies.";
sudo apt-get install build-essential libpcre3 libpcre3-dev libssl-dev zlib1g zlib1g-dev -y nload
echo "Intalling dependancie complete.";
echo "==================================================================================";
echo "Downloading nginx.";
wget http://nginx.org/download/nginx-1.18.0.tar.gz
echo "Download complete.";
echo "==================================================================================";
tar -xf nginx-1.18.0.tar.gz
echo "Unziped and deleted arhive.";
rm -rf nginx-1.18.0.tar.gz
echo "Configuration rtmp.This might take some time...";
cd nginx-1.18.0 && ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module
echo "Configuration rtmp done.OK";
echo "==================================================================================";
echo "Running install....."
sudo make
sudo make install
cd ..
echo "Nginx-Rtmp setup complete.";
echo "==================================================================================";
echo "Renaming existing conf file and creating new conf"
mv /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/original.nginx.conf
mv nginx.conf /usr/local/nginx/conf/;
echo "Creating hls drirectory and adding root access";
cd /usr/local/nginx/conf && sudo mkdir /nginx
sudo mkdir /nginx/hls
sudo chown -R www-data:www-data /nginx
cd ~
echo "==================================================================================";
echo "Adding nginx to startup";
mv nginx.service /lib/systemd/system/nginx.service
systemctl enable nginx
systemctl daemon-reload
echo "==================================================================================";
echo "Setup completed.OK";
