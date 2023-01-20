# FIRST Robotics Challenge (FRC) Season Map

_Updated for 2023_

[CLICK HERE TO VIEW ON frcmap.com](http://frcmap.com)

This map shows all FRC teams and events registered for the current season.

Here is the code I use to fetch all the required data from The Blue Alliance (thanks!).
It basically feteches all teams and all events for the desired year and outputs it as a simple JSON that's used by the front end.

A Google Maps API key is required to get geolocations from the teams' addresses.
A TBA api key is required to get team data.

### Placement Errors
If a team is misplaced or missing and you have the correct location info please submit an issue with the correct data. (and preferably some statement of affiliation to corroborate the info)

You can also submit a pull request adding your team's correct location in `locations/teams.toml`. 

### Contribution
I'm open to suggestions and contributions! Let me know if you have any ideas to make this better.

### Setup
To use the data collector, create the file `api_keys.py` and save it with the contents:
```python
tba_key = '<YOUR KEY HERE>'
gmaps_key = '<YOUR KEY HERE>'
```

### Running
To run just execute: `make_map.py`

This will:

1. Run the script that looks up teams' locations. The script will look for manial overrides, then for archived location data, finally will try to get it from google maps.
2. Fetch data for all teams.
3. Fetch data for all events.
4. Filter teams, leaving only those registered for events in the current year.
5. Cross reference teams and events.
6. Export `docs/data/season_<year>.json`



