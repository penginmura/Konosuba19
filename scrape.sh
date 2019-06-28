#!/bin/bash -e

cd ./scraper

# setup
pip3 install -r requirements.txt

# scrape
python3 cfp_scraping.py

# move to /web/assets
mv -f proposals.json ../web/assets/