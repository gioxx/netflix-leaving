from dotenv import load_dotenv, find_dotenv
from datetime import date
import requests
import urllib.request
import base64
import json
import os

load_dotenv(find_dotenv())
XRAPIDAPIHOST = os.environ.get("XRAPIDAPIHOST")
XRAPIDAPIKEY = os.environ.get("XRAPIDAPIKEY")

today = date.today()
day = today.strftime("%d")
month = today.strftime("%m")
year = today.strftime("%Y")

def get_titles():
    url = "https://%s/aaapi.cgi" % XRAPIDAPIHOST
    headers = {
       "x-rapidapi-host": "unogs-unogs-v1.p.rapidapi.com",
       "x-rapidapi-key": "%s" % XRAPIDAPIKEY
    }
    querystring = {
		"q":"get:exp:IT",
		"t":"ns",
		"st":"adv",
		"p":"1"
	}
    response = requests.request("GET", url, headers=headers, params=querystring)
    return response.json()

def downloadposter(posterurl, folder, filename):
    fullpath = os.path.join(folder,filename)
    response = urllib.request.urlretrieve(posterurl, fullpath)
    return response

def makewebpage(json):
    pre = post = ""
    with open(os.path.join("include","body-pre")) as fp:
        pre = fp.read()
    with open(os.path.join("include","body-post")) as fp:
        post = fp.read()
    response = pre + "	$.getJSON('" + json + "', function(data) {" + "\n" + post
    return response

def main():
    if XRAPIDAPIHOST is None or XRAPIDAPIKEY is None:
        print("Environment variables have not been loaded!")
        return

    # Get JSON
    leavingtitles =  get_titles()

    if not os.path.exists(year):
        os.makedirs(year)
    if not os.path.exists(os.path.join(year,month)):
        os.makedirs(os.path.join(year,month))

    if "COUNT" in leavingtitles:
        print("Title list: OK")
        # Backup JSON file
        with open(os.path.join(year,year+month+day+".json"), 'w') as f:
            json.dump(leavingtitles, f)

        """
        # Download Posters
        posterfolder = os.path.join(year,month)
        for item in leavingtitles['ITEMS']:
            poster = "%s.jpg" % item['netflixid']
            print("Downloading", poster)
            downloadposter(item['image'],posterfolder,poster)
        """

        # Make Daily
        print("Make Daily")
        jsonfile = os.path.join(year+month+day+".json")
        html = makewebpage(jsonfile)
        with open (os.path.join(year,month+day+".html"), 'w') as fp:
            fp.write(html)

    else:
        print(leavingtitles)

main()
