# mediatailor-prefetch-scheduler
A CLI for scheduling MediaLive's schedule action (SCTE-35 Splice Insert) and MediaTailor's prefetch requests at the same time

## Install
Assuming you have git and Node.js installed
```
$ git clone https://github.com/kuu/mediatailor-prefetch-scheduler.git
$ cd mediatailor-prefetch-scheduler
$ npm install
```

## Configure
Edit `config.json` according to your needs:
* `region`: Region where your MediaLive channel and MediaTailor SSAI configuration are running
* `channelId`: MediaLive channel ID
* `originId`: MediaTailor configuration name
* `streamIdList`: Stream IDs specified when initializing the playback sessions (See [doc](https://docs.aws.amazon.com/mediatailor/latest/ug/prefetching-ads.html))
* `prefetchParams.retrievalParams`: Dynamic variables to be included in the prefetch requests (`scte.event_id'` and `session.avail_duration` are included by default. See [doc](https://docs.aws.amazon.com/mediatailor/latest/ug/variables.html))
* `prefetchParams.matchingCriteria`: Criteria used when MediaTailor matches the prefetched ads to sessions
```
{
    "region": "ap-northeast-1",
    "channelId": "4563483",
    "originId": "prefetch-test",
    "streamIdList": [
        "group-1",
        "group-2",
        "group-3"
    ],
    "prefetchParams": {
        "retrievalParams": {
            "scte.unique_program_id": "128"
        },
        "matchingCriteria": [
            {
                "DynamicVariable": "player_params.device_type",
                "Operator": "EQUALS"
            }
        ]
    }
}
```

## Usage

### Insert a 30-second ad avail after 10 minutes
```
$ npm run prefetch -- --avail-start 10m --avail-duration 30
```

### Insert a 3-minute ad avail at the exact time
```
$ npm run prefetch -- --avail-start 2023-05-01T09:30:00Z --avail-duration 180
```

### Insert an ad avail with specifying splice_event_id (default value: 0)
```
$ npm run prefetch -- --avail-start 10m --avail-duration 30  --avail-id 128
```

### Just print the parameters without making actual API calls
```
$ npm run prefetch -- --dry-run --avail-start 10m --avail-duration 30
```
