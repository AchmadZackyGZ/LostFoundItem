FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
CMD sh -c "php artisan migrate --force && php artisan db:seed --class=Database\\\\Seeders\\\\AdminAccountSeeder --force && php artisan serve --host=0.0.0.0 --port=8000"