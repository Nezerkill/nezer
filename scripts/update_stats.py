#!/usr/bin/env python3
"""Collect profile statistics for the bio page into stats.json."""

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

USERNAME = "Nezerkill"
API = "https://api.github.com"
OUT = Path(__file__).resolve().parent.parent / "stats.json"
ACTIVITY_DAYS = 30


def token() -> str:
    value = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if value:
        return value
    config = Path.home() / ".config" / "gh" / "hosts.yml"
    match = re.search(r"oauth_token:\s*(\S+)", config.read_text()) if config.exists() else None
    if match:
        return match.group(1)
    return ""


def request(url: str, data: dict | None = None) -> tuple:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "bio-site-stats-updater",
    }
    if token():
        headers["Authorization"] = f"Bearer {token()}"
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response), response.headers


def last_page(link_header: str | None) -> int | None:
    if not link_header:
        return None
    match = re.search(r'[?&]page=(\d+)>; rel="last"', link_header)
    return int(match.group(1)) if match else None


def commit_count(repo: str, since: str) -> int:
    url = (
        f"{API}/repos/{USERNAME}/{repo}/commits"
        f"?author={USERNAME}&since={urllib.parse.quote(since)}&per_page=1"
    )
    commits, headers = request(url)
    page = last_page(headers.get("Link"))
    if page is not None:
        return page
    return len(commits) if isinstance(commits, list) else 0


def contribution_days(days: int) -> list[dict]:
    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
    """
    payload, _ = request(f"{API}/graphql", {"query": query, "variables": {"login": USERNAME}})
    weeks = payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]
    calendar = [day for week in weeks for day in week["contributionDays"]]
    today = datetime.now(timezone.utc).date().isoformat()
    calendar = [day for day in calendar if day["date"] <= today]
    return [
        {"date": day["date"], "count": day["contributionCount"]}
        for day in calendar[-days:]
    ]


def main() -> None:
    since = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    profile, _ = request(f"{API}/users/{USERNAME}")
    repos, _ = request(f"{API}/users/{USERNAME}/repos?per_page=100&type=owner")

    payload = {
        "stars": sum(int(repo.get("stargazers_count") or 0) for repo in repos),
        "commits_last_month": sum(commit_count(repo["name"], since) for repo in repos),
        "followers": int(profile.get("followers") or 0),
    }

    try:
        payload["contribution_days"] = contribution_days(ACTIVITY_DAYS)
    except (urllib.error.URLError, KeyError, TypeError, ValueError):
        payload["contribution_days"] = []

    payload["updated_at"] = datetime.now(timezone.utc).isoformat()

    with OUT.open("w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)
        file.write("\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
