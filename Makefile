# ══════════════════════════════════════════════════════════════════════════════
#  Makefile — project management
#  Usage: make <target>
# ══════════════════════════════════════════════════════════════════════════════

# Load .env if it exists
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

# HTTPS certificates
CERT_DIR := .docker/nginx/certs
CERT_CRT := $(CERT_DIR)/localhost.crt
CERT_KEY := $(CERT_DIR)/localhost.key


LOCAL_GENERATED_DIRS := \
	backend/node_modules \
	frontend/node_modules \
	shared/node_modules \
	frontend/.next \
	frontend/out \
	backend/dist \
	shared/dist \
	backend/coverage \
	frontend/coverage \
	shared/coverage \
	.turbo \
	.cache




.DEFAULT_GOAL := help

# ─── Help ─────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@echo ""
	@echo "  \033[1mUsage:\033[0m make \033[36m<target>\033[0m"
	@echo ""
	@echo "  \033[1mSetup\033[0m"
	@grep -E '^(init|certs|certs-clean).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[1mDev\033[0m"
	@grep -E '^(dev|dev-d|stop|restart|logs|shell|fresh).*:.*##' $(MAKEFILE_LIST) \
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
	@grep -E '^(build|build-prod|build-no-cache|clean|nuke|nuke-all|ps).*:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "    \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Init ─────────────────────────────────────────────────────────────────────
.PHONY: init
init: certs ## First-time setup: copy .env.example → .env and create HTTPS certs
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅  .env created from .env.example — edit it before continuing"; \
	else \
		echo "ℹ️   .env already exists, skipping"; \
	fi

# ─── HTTPS certificates ───────────────────────────────────────────────────────
.PHONY: certs
certs: ## Create local self-signed HTTPS certificates if missing
	@mkdir -p $(CERT_DIR)
	@if [ ! -f "$(CERT_CRT)" ] || [ ! -f "$(CERT_KEY)" ]; then \
		echo "🔐  Creating local self-signed HTTPS certificate..."; \
		openssl req -x509 -nodes -days 365 \
			-newkey rsa:2048 \
			-keyout "$(CERT_KEY)" \
			-out "$(CERT_CRT)" \
			-subj "/CN=localhost"; \
		echo "✅  HTTPS certificates created in $(CERT_DIR)"; \
	else \
		echo "ℹ️   HTTPS certificates already exist"; \
	fi

.PHONY: certs-clean
certs-clean: ## Remove local HTTPS certificates
	rm -f "$(CERT_CRT)" "$(CERT_KEY)"
	@echo "🧹  Local HTTPS certificates removed"

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
logs: ## Follow logs in dev (usage: make logs s=backend, or all: make logs)
	$(DC_DEV) logs -f $(s)

.PHONY: shell
shell: ## Open a shell in a dev container (usage: make shell s=backend)
	$(DC_DEV) exec $(s) sh

.PHONY: fresh
fresh: ## Full clean restart in dev (remove volumes, rebuild everything)
	$(DC_DEV) down -v --remove-orphans
	$(DC_DEV) up --build

# ─── Prod ─────────────────────────────────────────────────────────────────────
.PHONY: prod
prod: certs ## Build and start all services in production mode with HTTPS
	$(DC_PROD) up --build -d

.PHONY: prod-stop
prod-stop: ## Stop production services
	$(DC_PROD) down

.PHONY: prod-logs
prod-logs: ## Follow production logs
	$(DC_PROD) logs -f $(s)

.PHONY: prod-users
prod-users: ## Seed 20 demo users into a running prod stack (run 'make prod' first) — for testing search filters/sorting
	@RUNNING=$$(docker inspect -f '{{.State.Running}}' $(COMPOSE_PROJECT_NAME)-backend 2>/dev/null); \
	if [ "$$RUNNING" != "true" ]; then \
		echo "❌  The production backend container ('$(COMPOSE_PROJECT_NAME)-backend') is not running."; \
		echo "    Run 'make prod' first, then retry 'make prod-users'."; \
		exit 1; \
	fi
	$(DC_PROD) exec backend node dist/backend/src/scripts/seed-users.js

# ─── Build ────────────────────────────────────────────────────────────────────
.PHONY: build
build: ## Build Docker images in dev
	$(DC_DEV) build

.PHONY: build-prod
build-prod: certs ## Build Docker images in production mode
	$(DC_PROD) build

.PHONY: build-no-cache
build-no-cache: ## Force rebuild without cache in dev
	$(DC_DEV) build --no-cache

.PHONY: build-prod-no-cache
build-prod-no-cache: certs ## Force rebuild without cache in production mode
	$(DC_PROD) build --no-cache

# ─── Database ─────────────────────────────────────────────────────────────────
.PHONY: db-push
db-push: ## Run prisma db push inside backend container
	$(DC_DEV) exec backend sh -c "npx prisma db push --accept-data-loss"

.PHONY: db-studio
db-studio: ## Open Prisma Studio locally
	cd backend && npx prisma studio

.PHONY: db-seed
db-seed: ## Run prisma seed inside backend container
	$(DC_DEV) exec backend sh -c "npx prisma db seed"

.PHONY: db-reset
db-reset: ## Drop and recreate the database in dev (WARNING: data loss)
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
deps-update: ## Update all dependencies interactively
	docker exec $(BACKEND_CONTAINER)  sh -c "cd /app/backend  && npx npm-check-updates -i"
	docker exec $(FRONTEND_CONTAINER) sh -c "cd /app/frontend && npx npm-check-updates -i"
	docker exec $(BACKEND_CONTAINER)  sh -c "cd /app/shared   && npx npm-check-updates -i"

# ─── Status ───────────────────────────────────────────────────────────────────
.PHONY: ps
ps: ## Show dev containers
	$(DC_DEV) ps

.PHONY: ps-prod
ps-prod: ## Show production containers
	$(DC_PROD) ps

# ─── Clean ────────────────────────────────────────────────────────────────────

.PHONY: local-clean
local-clean: ## Remove local generated folders: node_modules, .next, dist, cache
	@echo "🧹  Removing local generated folders..."
	@rm -rf $(LOCAL_GENERATED_DIRS) 2>/dev/null || { \
		echo "⚠️   Some generated files are owned by root. Retrying with sudo..."; \
		sudo rm -rf $(LOCAL_GENERATED_DIRS); \
	}
	@echo "✅  Local generated folders removed"

.PHONY: clean
clean: ## Stop and remove dev containers, keep volumes and images
	$(DC_DEV) down --remove-orphans

.PHONY: clean-prod
clean-prod: ## Stop and remove production containers, keep volumes and images
	$(DC_PROD) down --remove-orphans

.PHONY: nuke
nuke: ## ⚠️ Remove Docker containers, volumes and local images, keep HTTPS certs
	$(DC_DEV) down -v --remove-orphans --rmi local
	$(DC_PROD) down -v --remove-orphans --rmi local
	@echo "💥  Docker containers, volumes and local images removed"
	@echo "ℹ️   HTTPS certificates kept. Use 'make certs-clean' to remove them or nuke-all."

.PHONY: nuke-all
nuke-all: nuke certs-clean local-clean ## ⚠️ Remove Docker resources, certs and generated local folders
	@echo "💥  Full local cleanup done, including Docker, certs and generated local folders"