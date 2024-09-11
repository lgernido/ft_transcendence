FROM nginx 

RUN apt-get update && apt-get -y install openssl

RUN openssl req -x509 -newkey -rsa:4096 -days 365 -nodes \
    -keyout /etc/ssl/private/superpong.fr_key.pem \
    -out /etc/ssl/certs/superpong.fr_cert.pem -sha256 \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/CN=superpong.fr"

COPY nginx.conf /etc/nginx/nginx.conf