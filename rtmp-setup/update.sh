cd rtmp-setup
pm2 stop rtmp-util
pm2 flush rtmp-util
git pull -f
pm2 start rtmp-util
pm2 log rtmp-util