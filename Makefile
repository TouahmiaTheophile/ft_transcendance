# ══════════════════════════════════════════════════════════════════════════════
#  Makefile — project management
#  Usage: make <target>
# ══════════════════════════════════════════════════════════════════════════════

# Load .env if it exists (for COMPOSE_PROJECT_NAME etc.)
ifneq (,$(wildcard .env))
  include .env
  export
endif

DC      := docker compose
DC_DEV  := docker compose -f docker-compose.yml -f docker-compose.override.yml
DC_PROD := docker compose -f docker-compose.yml

# Container names
BACKEND_CONTAINER  := $(COMPOSE_PROJECT_NAME)-backend-dev
FRONTEND_CONTAINER := $(COMPOSE_PROJECT_NAME)-frontend-dev

.DEFAULT_GOAL := help

# ─── Help ─────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@echo ""
	@echo "  \033[1mUsage:\033[0m make \033[36m<target>\033[0m"
	@echo ""
	@echo "  \033[1mDev\033[0m"
	@grep -E '^(dev|stop|restart|logs|shell|fresh).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[1mProd\033[0m"
	@grep -E '^(prod|prod-stop|prod-logs).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[1mDatabase\033[0m"
	@grep -E '^(db-.*).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[1mDependencies\033[0m"
	@grep -E '^(deps-.*).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[1mUtilities\033[0m"
	@grep -E '^(build|clean|nuke|ps|init).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Init ─────────────────────────────────────────────────────────────────────
.PHONY: init
init: ## First-time setup: copy .env.example → .env
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅  .env created from .env.example — edit it before continuing"; \
	else \
		echo "ℹ️   .env already exists, skipping"; \
	fi

# ─── Dev ──────────────────────────────────────────────────────────────────────
.PHONY: dev
dev: ## Start all services in dev mode (hot reload)
	$(DC_DEV) up --build

.PHONY: dev-d
dev-d: ## Start all services in dev mode (detached)
	$(DC_DEV) up --build -d

.PHONY: stop
stop: ## Stop dev services
	$(DC_DEV) down

.PHONY: restart
restart: ## Restart a service in dev (usage: make restart s=backend)
	$(DC_DEV) restart $(s)

.PHONY: logs
logs: ## Follow logs (usage: make logs s=backend, or all: make logs)
	$(DC_DEV) logs -f $(s)

.PHONY: shell
shell: ## Open a shell in a container (usage: make shell s=backend)
	$(DC_DEV) exec $(s) sh

.PHONY: fresh
fresh: ## Full clean restart in dev (remove volumes, rebuild everything)
	$(DC_DEV) down -v --remove-orphans
	$(DC_DEV) up --build

# ─── Prod ─────────────────────────────────────────────────────────────────────
.PHONY: prod
prod: ## Build and start all services in production mode
	$(DC_PROD) up --build -d

.PHONY: prod-stop
prod-stop: ## Stop production services
	$(DC_PROD) down

.PHONY: prod-logs
prod-logs: ## Follow production logs
	$(DC_PROD) logs -f $(s)

# ─── Build ────────────────────────────────────────────────────────────────────
.PHONY: build
build: ## Build Docker images (dev)
	$(DC_DEV) build

.PHONY: build-prod
build-prod: ## Build Docker images (prod)
	$(DC_PROD) build

.PHONY: build-no-cache
build-no-cache: ## Force rebuild without cache (dev)
	$(DC_DEV) build --no-cache

# ─── Database ─────────────────────────────────────────────────────────────────
.PHONY: db-push
db-push: ## Run prisma db push inside backend container
	$(DC_DEV) exec backend sh -c "npx prisma db push --accept-data-loss"

.PHONY: db-studio
db-studio: ## Open Prisma Studio (runs locally, not in Docker)
	cd backend && npx prisma studio

.PHONY: db-seed
db-seed: ## Run prisma seed inside backend container
	$(DC_DEV) exec backend sh -c "npx prisma db seed"

.PHONY: db-reset
db-reset: ## Drop and recreate the database (WARNING: data loss)
	$(DC_DEV) down -v
	$(DC_DEV) up -d mariadb
	@echo "⏳  Waiting for MariaDB to be ready..."
	@sleep 5
	$(DC_DEV) up --build -d backend

# ─── Dependencies — run inside containers to avoid permission issues ──────────
.PHONY: deps-add-back
deps-add-back: ## Add a backend dependency (usage: make deps-add-back p="@nestjs/jwt")
	docker exec $(BACKEND_CONTAINER) sh -c "cd /app/backend && npm install $(p)"

.PHONY: deps-add-back-dev
deps-add-back-dev: ## Add a backend dev dependency (usage: make deps-add-back-dev p="@types/passport")
	docker exec $(BACKEND_CONTAINER) sh -c "cd /app/backend && npm install --save-dev $(p)"

.PHONY: deps-add-front
deps-add-front: ## Add a frontend dependency (usage: make deps-add-front p="axios")
	docker exec $(FRONTEND_CONTAINER) sh -c "cd /app/frontend && npm install $(p)"

.PHONY: deps-add-front-dev
deps-add-front-dev: ## Add a frontend dev dependency (usage: make deps-add-front-dev p="@types/some-lib")
	docker exec $(FRONTEND_CONTAINER) sh -c "cd /app/frontend && npm install --save-dev $(p)"

.PHONY: deps-add-shared
deps-add-shared: ## Add a shared dependency (usage: make deps-add-shared p="zod")
	docker exec $(BACKEND_CONTAINER) sh -c "cd /app/shared && npm install $(p)"

.PHONY: deps-install
deps-install: ## npm install in all packages inside containers
	docker exec $(BACKEND_CONTAINER)  sh -c "cd /app/shared   && npm install"
	docker exec $(BACKEND_CONTAINER)  sh -c "cd /app/backend  && npm install"
	docker exec $(FRONTEND_CONTAINER) sh -c "cd /app/frontend && npm install"

.PHONY: deps-update
deps-update: ## Update all dependencies interactively (requires npm-check-updates)
	docker exec $(BACKEND_CONTAINER)  sh -c "cd /app/backend  && npx npm-check-updates -i"
	docker exec $(FRONTEND_CONTAINER) sh -c "cd /app/frontend && npx npm-check-updates -i"
	docker exec $(BACKEND_CONTAINER)  sh -c "cd /app/shared   && npx npm-check-updates -i"

# ─── Status ───────────────────────────────────────────────────────────────────
.PHONY: ps
ps: ## Show running containers
	$(DC_DEV) ps

# ─── Clean ────────────────────────────────────────────────────────────────────
.PHONY: clean
clean: ## Stop and remove containers (keep volumes and images)
	$(DC_DEV) down --remove-orphans

.PHONY: nuke
nuke: ## ⚠️  Remove EVERYTHING: containers, volumes, images for this project
	$(DC_DEV) down -v --remove-orphans --rmi local
	@echo "💥  All containers, volumes and local images removed"