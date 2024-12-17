FROM postgres:latest

COPY .pg_service.conf /etc/postgresql/postgresql.conf

COPY init.sql /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432