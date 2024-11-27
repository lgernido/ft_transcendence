
all help:
	@echo "\nCOMMANDES DISPONIBLES :"
	@echo "  start              : Démarre les containers avec build"
	@echo "  stop               : Arrête et supprime les containers"
	@echo "  restart            : Redémarre les containers"
	@echo "  makemigrations     : Crée de nouvelles migrations pour les modifications de modèle"
	@echo "  migrate            : Applique les migrations"
	@echo "  createsuperuser    : Crée un super utilisateur Django"
	@echo "  shell              : Ouvre un shell Django"

start:
	docker compose up --build

stop:
	docker compose down 

restart:
	@$(MAKE) stop
	@$(MAKE) start

makemigrations:
	docker compose exec backend python src/manage.py makemigrations

migrate:
	docker compose exec backend python src/manage.py migrate

createsuperuser:
	docker compose exec backend python src/manage.py createsuperuser

shell:
	docker compose exec backend python src/manage.py shell

