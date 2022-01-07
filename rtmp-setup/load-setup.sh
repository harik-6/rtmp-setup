echo "Installing node environment";
cd ~;
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh > nvminstall.sh;
sleep 5s;
chmod +x nvminstall.sh
sh nvminstall.sh
sleep 5s;
source ~/.bashrc;
sleep 5s;
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
echo "Start running server by running following commands";
echo "1)cd ~/rtmpload";
echo "2)pm2 start load.js --name=loadjob";