import requests
import urllib.request
import base64
import json
from datetime import date
import os

today = date.today()
day = today.strftime("%d")
month = today.strftime("%m")
year = today.strftime("%Y")
exportlist_jsn = "mylist-export.json"
exportlist_leaving = "mylist-leaving.json"
exportlist_html = "mylist-leaving.html"

def get_json(path):
    with open(path, 'r') as f:
        response = json.load(f)
    return response

def make_webpage(json):
    pre = post = ""
    with open(os.path.join("include","body-pre")) as fp:
        pre = fp.read()
    with open(os.path.join("include","body-post")) as fp:
        post = fp.read()
    response = pre + "	$.getJSON('" + json + "', function(data) {" + "\n" + post
    return response

todayjson = os.path.join(year,year+month+day+".json")
ntflxList = get_json(todayjson)
mylist = get_json(exportlist_jsn)
print("Today JSON entries: {}".format(len(ntflxList["ITEMS"])))
print("My List JSON entries: {}".format(len(mylist)))

count = 0
json_list = []
for vod in ntflxList["ITEMS"]: # https://www.w3schools.com/python/python_for_loops.asp
    for check in mylist:
        if(vod["imdbid"] == check["imdbid"]):
            print("Found {} (Netflix ID {})".format(vod["title"], vod["netflixid"]))
            json_list.append(vod)
            count += 1

if count > 0:
    with open(exportlist_leaving, "w") as outfile:
        json.dump(json_list, outfile)
    html = make_webpage(exportlist_leaving)
    with open (exportlist_html, 'w') as fp:
        fp.write(html)
else:
    print("No titles from your list are leaving Netflix")
