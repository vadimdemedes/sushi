default:
	@echo "No default task"

test:
	@./node_modules/.bin/ava

lint:
	@./node_modules/.bin/xo --env=node

.PHONY: test lint
