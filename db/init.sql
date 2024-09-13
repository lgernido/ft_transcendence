CREATE DATABASE superpongdb;
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'superpong') THEN
        CREATE ROLE superpong LOGIN PASSWORD 'gnoprepus';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE superpongdb TO superpong;