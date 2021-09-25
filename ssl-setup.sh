echo "Start configuring ssl"; 
echo "Using let's encrypt to add ssl certificate"; 
echo "==================================================================================";
snap install core
snap refresh core
snap install --classic certbot
echo "Installed cert bot.OK"; 
echo "==================================================================================";
ln -s /snap/bin/certbot /usr/bin/certbot
echo "Enter the domain you wanted to add ssl";
read domainname;
certbot certonly --standalone -d $domainname;
echo "Completed adding ssl.OK";
echo "==================================================================================";
echo "Listing all certificates";
ls -l /etc/letsencrypt/live/$domainname;
echo "==================================================================================";
