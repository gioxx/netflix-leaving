import os
from dataclasses import dataclass

from dotenv import load_dotenv, find_dotenv


@dataclass
class Settings:
    api_key: str
    api_host: str = "unogsng.p.rapidapi.com"
    country: str = "269"  # Italy by default
    max_detail_requests: int = 50

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv(find_dotenv())
        api_key = os.environ.get("XRAPIDAPIKEY")
        if not api_key:
            raise RuntimeError("Missing XRAPIDAPIKEY environment variable.")

        api_host = os.environ.get("XRAPIDAPIHOST") or cls.api_host
        country = os.environ.get("NETFLIX_COUNTRY", cls.country)
        try:
            max_detail = int(os.environ.get("NETFLIX_MAX_DETAIL", cls.max_detail_requests))
        except ValueError:
            max_detail = cls.max_detail_requests

        return cls(api_key=api_key, api_host=api_host, country=country, max_detail_requests=max_detail)
