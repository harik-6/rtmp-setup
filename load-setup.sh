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