# Netflix Titles Leaving
[![Titles expiring on Netflix](https://github.com/gioxx/netflix-leaving/actions/workflows/daily.yml/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/daily.yml) [![pages-build-deployment](https://github.com/gioxx/netflix-leaving/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/gioxx/netflix-leaving/actions/workflows/pages/pages-build-deployment)

This script automatically saves titles expiring on Netflix every day, in JSON format that you can use as you see fit. The automation is powered by [GitHub Actions](https://docs.github.com/en/actions) and executes automatically everyday as defined in the [daily.yaml](/.github/workflows/daily.yaml).

## Initial Set Up (approx: 10 minutes)
You should not need to make any commits back to the repo. You need to obtain an API token for  uNoGS (from RapidAPI) and setting up the environment variables in GitHub secrets in order to allow `ntflx-leaving.py` to execute properly. You need to fork this repo in order to have your own instance of GitHub Actions.

### (1) Create a Fork
Start off with simple fork by clicking on the "Fork" button. Once you've done that, you can use your favorite git client to clone your repo or use the command line:
```bash
# Clone your fork to your local machine
$ git clone https://github.com/<your-username>/netflix-leaving.git
```

### (2) Libraries
Use the package manager [pip](https://pip.pypa.io/en/stable/) to install all of the required libraries. You could use this with a [virtual environment](https://docs.python.org/3/library/venv.html) if required.
```bash
$ pip install -r requirements.txt
```

### (3) uNoGS API Credentials
1. Open the `.sample.env` file from the root folder on your local machine.
2. Subscribe to [RapidAPI uNoGS Basic Plan](https://rapidapi.com/unogs/api/unogs/) and create a new application. The Basic Plan permits 100 requests/day for $0.00/month (see [Pricing table](https://rapidapi.com/unogs/api/unogs/pricing)).
3. Fill out the env file with XRAPIDAPIHOST and XRAPIDAPIKEY obtained from RapidAPI and save this file as `.env`. **Do not post these details anywhere publically.**

Example:
```
XRAPIDAPIHOST=unogs-unogs-v1.p.rapidapi.com
XRAPIDAPIKEY=thisisasecret
```

### (4) GitHub Actions
1. Go to the settings of your forked repo and click on Secrets.
2. You will need to create the following secrets:
  *  **XRAPIDAPIHOST** - Use the same XRAPIDAPIHOST from your `.env`.
  *  **XRAPIDAPIKEY** - Use the same XRAPIDAPIKEY from your `.env`

---

## Manual Execution via GitHub Actions
1. Go to Actions in your forked repo.
2. Click on "**Titles expiring on Netflix**"
3. Click on "**Run workflow**" which will bring up a drop down menu.

Any execution errors can be found from within the actions tab of your forked repo.

## Local Execution
Alternatively, you can store the **XRAPIDAPIHOST**, **XRAPIDAPIKEY** back into your `.env` file and execute `ntflx-leaving.py` on your machine when required, maybe manually or using a task scheduler. Make sure to have the `.env` and `ntflx-leaving.py` files in the same directory for this.

 ```
$python ntflx-leaving.py
```
---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](/LICENSE)

## Credits
https://stackoverflow.com/a/12091134  
https://stackoverflow.com/a/8024259
