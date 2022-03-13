from imdb import Cinemagoer
import base64
import json
import os

exportlist_txt = "mylist-export.txt"
exportlist_jsn = "mylist-export.json"

def imdb_get(movietitle):
    ia = Cinemagoer()
    moviesearch = ia.search_movie(movietitle)
    movieid = moviesearch[0].movieID
    return movieid

netflixlist = open(exportlist_txt, 'r') # https://www.geeksforgeeks.org/read-a-file-line-by-line-in-python/
titles = netflixlist.readlines()
count = 0
json_list = []
for title in titles:
    count += 1
    imdbinfo = "tt" + imdb_get(title.strip())
    print("Title {}: {} ({})".format(count, title.strip(), imdbinfo))
    json_add = {
        "title": title.strip(),
        "imdbid": imdbinfo
    }
    json_list.append(json_add)

if count > 0:
    with open(exportlist_jsn, "w") as outfile:
        json.dump(json_list, outfile) # https://www.geeksforgeeks.org/reading-and-writing-json-to-a-file-in-python/
