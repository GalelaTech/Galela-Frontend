import requests

data = requests.get('https://ipinfo.io/json').json()
print(f"IP:      {data.get('ip')}")
print(f"City:    {data.get('city')}")
print(f"Region:  {data.get('region')}")
print(f"Country: {data.get('country')}")
print(f"ISP:     {data.get('org')}")
print(f"Loc:     {data.get('loc')}")