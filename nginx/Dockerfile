FROM nginx:1.26.2

RUN apt-get update
RUN apt-get install openssl -y

# Générer les certificats SSL
RUN mkdir -p /etc/ssl/certs /etc/ssl/private \
    && openssl req -x509 -newkey rsa:4096 -days 365 -nodes \
    -out /etc/ssl/private/superpong.fr_cert.pem -sha256 \
    -keyout /etc/ssl/private/superpong.fr_key.pem \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/CN=superpong.fr"

RUN chmod 644 /etc/ssl/private/superpong.fr_cert.pem
RUN chmod 600 /etc/ssl/private/superpong.fr_key.pem

RUN mkdir -p /var/run/nginx

COPY nginx.conf /etc/nginx/nginx.conf

# EXPOSE 8000
