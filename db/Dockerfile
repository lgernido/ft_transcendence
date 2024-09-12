FROM postgres:latest

COPY .pg_service.conf /etc/postgresql/postgresql.conf

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432