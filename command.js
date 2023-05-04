import {formatDate, addTime} from './util.js';

export function createEMLCommand(channelId, eventId, start, duration) {
  return {
    "ChannelId": channelId,
    "Creates": {
      "ScheduleActions": [
        {
          "ActionName": `splice_insert-${Date.now()}`,
          "ScheduleActionSettings": {
            "Scte35SpliceInsertSettings": {
              "SpliceEventId": eventId,
              "Duration": duration * 90_000,
            },
          },
          "ScheduleActionStartSettings": {
            "FixedModeScheduleActionStartSettings": {
              "Time": formatDate(start),
            },
          },
        },
      ],
    },
  };
}

export function createEMTCommand(originId, eventId, retrievalStart, retrievalEnd, consumptionStart, consumptionEnd, streamId, {retrievalParams = {}, matchingCriteria = []}) {
  const extra = streamId ? {"StreamId": `${streamId}`} : {};
  const dynamicVars = Object.assign({'scte.event_id': `${eventId}`}, retrievalParams);
  const availMatchingCriteria = [
    {
      "DynamicVariable": "scte.event_id",
      "Operator": "EQUALS",
    },
    ...matchingCriteria,
  ];

  return Object.assign({
    "Name": `prefetch-schedule-${retrievalStart.getTime()}`,
    "PlaybackConfigurationName": originId,
    "Retrieval": {
      "StartTime": addTime(retrievalStart, -1),
      "EndTime": addTime(retrievalEnd, 1),
      "DynamicVariables": dynamicVars,
    },
    "Consumption": {
      "StartTime": addTime(consumptionStart, -1),
      "EndTime": addTime(consumptionEnd, 1),
      "AvailMatchingCriteria": availMatchingCriteria,
    },
  }, extra);
}
