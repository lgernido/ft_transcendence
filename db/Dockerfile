FROM postgres:13.4

COPY .pg_service.conf /etc/postgresql/postgresql.conf

COPY init.sql /docker-entrypoint-initdb.d/

RUN chmod 644 /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432