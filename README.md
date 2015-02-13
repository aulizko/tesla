# Установка на сервер

Нам понадобится монга:

```
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
apt-get update
apt-get install -y mongodb-org
service mongod start
```

Еще нам понадобятся следующие пакеты:

```
apt-get install git-core build-essential libgraphicsmagick1-dev
```

Устанавливаем менеджер ноды:

```
curl https://raw.githubusercontent.com/creationix/nvm/v0.23.3/install.sh | bash
```

Устанавливаем ноду:

```
nvm install 0.12
nvm alias default 0.12
nvm use default
```

Качаем проект:

```
git clone git@bitbucket.org:aulizko/tesla.git
```

Создаем папку для логов:

```
mkdir /var/log/tesla
chmod 777 /var/log/tesla
```

Создадим папку для картинок и прочих загрузок

```
mkdir tesla/public/upload
```

Устанавливаем все зависимости:

```
cd tesla
npm i
```

Устанавливаем сборщик проектов:

```
npm i gulp -g
```

Устанавливаем всякие клиентские библиотеки и собираем css+js:

```
gulp bower
gulp
```

Устанавливаем runner для node-проектов:

```
npm i -g forever
```

Запускаем проект на порту 61337:

```
NODE_ENV=production NODE_PATH=./config:./app/controllers PORT=61337 MONGO_URL=mongodb://localhost/tesla SITE_TITLE="Tesla" SITE_DOMAIN=tc-tesla.com forever start -l /var/log/tesla/forever.log -a -o /var/log/tesla/access.log -e /var/log/tesla/error.log -c 'node --harmony' server.js
```

Делаем конфигурацию для nginx:

```
upstream region_app {
	server 127.0.0.1:61337;
}

server {
    server_name www.tc-tesla.com;
    rewrite ^(.*) http://tc-tesla.com$1 permanent;
}

server {
    server_name tc-tesla.com;
    root /var/www/tesla/public;

    gzip on;
    gzip_comp_level 6;
    gzip_vary on;
    gzip_min_length  1000;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/x-font;
    gzip_buffers 16 8k;

    # Clientside Optimization
    location ~* \.(jp?g|gif|png|css|js|swf|flv|mp3|zip|txt|ttf|html|txt|woff|ttf|otf|svg|eot)$ {
            access_log off;
            add_header  Cache-Control public;
            expires max;

            # Путь до статики
            root /var/www/tesla/public;
    }


    location ~ /(less|app|config|lib)/ {
        deny all;
    }

    # не позволять nginx отдавать файлы, начинающиеся с точки (.htaccess, .svn, .git и прочие)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://region_app/;
        proxy_redirect off;
    }
}
```