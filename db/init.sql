-- Check if the database exists
\l superpongdb


-- If the database doesn't exist, create it
\if ! \echo '\l | grep -q superpongdb'
    CREATE DATABASE superpongdb;
\endif