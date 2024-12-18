-- Vérifie si la base de données existe et la crée si nécessaire
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'superpongdb') THEN
      CREATE DATABASE superpongdb;
   END IF;
END
$$;