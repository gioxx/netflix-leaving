PYTHON ?= python3

.PHONY: data

data:
	$(PYTHON) -m netflix_leaving --output data
