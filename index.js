import {MediaLiveClient, BatchUpdateScheduleCommand} from "@aws-sdk/client-medialive";
import {MediaTailorClient, CreatePrefetchScheduleCommand} from "@aws-sdk/client-mediatailor";
import {createEMLCommand, createEMTCommand} from './command.js';
import {formatDate, addTime} from './util.js';

export async function schedulePrefetch({currentTime, dryRun, eventId, consumptionStartTime, duration}, {region, channelId, originId, streamIdList = [], prefetchParams = {}}) {
  if (consumptionStartTime.getTime() < currentTime.getTime() + 300_000) {
    return console.log('Consumption window needs to start no sooner than 5 minutes');
  }

  if (consumptionStartTime.getTime() - currentTime.getTime() > 86_400_000) {
    return console.log('Consumption window needs to start no later than 24 hours');
  }

  const retrievalWindowInterval = (consumptionStartTime.getTime() - currentTime.getTime()) / 1000 / (streamIdList.length > 0 ? streamIdList.length : 1);
  if (retrievalWindowInterval < 10) {
    return console.log(`Reduce the number of prefetch groups or postpone the consumption start time. retrievalWindowInterval=${retrievalWindowInterval}`);
  }

  // MediaLive: Schedule a SCTE35 splice_insert() event
  const input = createEMLCommand(channelId, eventId, consumptionStartTime, duration);
  console.log(`${formatDate(new Date())} --- MediaLive: BatchUpdateScheduleCommand ---`);
  if (dryRun) {
    console.log(JSON.stringify(input, null, 2));
  } else {
    const command = new BatchUpdateScheduleCommand(input);
    try {
      const client = new MediaLiveClient({region});
      const response = await client.send(command);
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      return console.error(e.stack);
    }
  }

  // MediaTailor: Schedule prefetch events
  const client = new MediaTailorClient({region});
  let retrievalStart = currentTime;
  for (const streamId of streamIdList) {
    const retrievalEnd = addTime(retrievalStart, retrievalWindowInterval);
    const input = createEMTCommand(originId, eventId, retrievalStart, retrievalEnd, consumptionStartTime, addTime(consumptionStartTime, duration), streamId, prefetchParams);
    console.log(`${formatDate(new Date())} --- MediaTailor: CreatePrefetchScheduleCommand ---`);
    if (dryRun) {
      console.log(JSON.stringify(input, null, 2));
    } else {
      const command = new CreatePrefetchScheduleCommand(input);
      try {
        const response = await client.send(command);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        return console.error(e.stack);
      }
    }
    retrievalStart = retrievalEnd;
  }
}
