# Netflix Titles Leaving: My list
[![My list - Genererate JSON file](https://github.com/gioxx/netflix-leaving/actions/workflows/mylist-json.yml/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/mylist-json.yml) [![My List - Check titles expiring on Netflix](https://github.com/gioxx/netflix-leaving/actions/workflows/mylist-checkexpiration.yml/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/mylist-checkexpiration.yml)

This script is the "add-on" part of this project. The automations are powered by [GitHub Actions](https://docs.github.com/en/actions) and:
 - executes automatically when I update "_my-list_" (the list of titles saved as favorites on Netflix) as defined in the [mylist-json.yaml](/.github/workflows/mylist-json.yaml).
 - executes a daily check if "_my-list_" contains titles are leaving Netflix, as defined in the [mylist-checkexpiration.yaml](/.github/workflows/mylist-checkexpiration.yaml).

---

### (1) Download your Netflix favorites list
1. Install "**Netflix List Exporter**" for [Firefox](https://addons.mozilla.org/firefox/addon/netflix-list-exporter/) or [Chrome](https://chrome.google.com/webstore/detail/netflix-list-exporter/mkhmjimpmgfjejbemjbimepeifijlagc) (other browsers: [check the official repository on GitHub](https://github.com/daltonmenezes/netflix-list-exporter)).
2. Navigate to [netflix.com/browse/my-list](https://www.netflix.com/browse/my-list).
3. Click on "**Copy this list**" button and paste your clipboard content to "_mylist-export.txt_" (```CTRL+V``` on Windows or ```CMD+V``` on macOS).

### (2) Extra libraries needed
Use the package manager [pip](https://pip.pypa.io/en/stable/) to install all of the required libraries. You could use this with a [virtual environment](https://docs.python.org/3/library/venv.html) if required.
```bash
$ pip install -r requirements.txt
```

### (3) Manual Execution via GitHub Actions
1. Go to Actions in your forked repo.
2. Click on "**My list - Genererate JSON file**"
3. Click on "**Run workflow**" which will bring up a drop down menu.
4. Click on "**My List - Check titles expiring on Netflix**"
5. Click on "**Run workflow**" which will bring up a drop down menu.

Any execution errors can be found from within the actions tab of your forked repo.

---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](/LICENSE)
