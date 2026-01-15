PYTHON ?= python3

.PHONY: data site serve

data:
	$(PYTHON) -m netflix_leaving --output data

site:
	npm run build

serve: site
	$(PYTHON) -m http.server 4173 --directory dist
