import { groupBy, maxBy } from 'lodash';
import reviewNetwork from './contracts/review-network';
import wallet from './wallet';

class Survey {
  async create(publicKey, title, surveyJsonHash, rewardPerSurvey, maxAnswers) {
    const rn = await reviewNetwork.contract;
    let rewardPerSurveyFormatted = await wallet.getTotalTokenAmount(rewardPerSurvey);

    return reviewNetwork.sendSigned(
      rn.methods.createSurvey(
        publicKey,
        title,
        surveyJsonHash,
        rewardPerSurveyFormatted,
        maxAnswers,
      ),
    );
  }

  async fund(surveyJsonHash, amount) {
    const rn = await reviewNetwork.contract;
    let totalAmount = await wallet.getTotalTokenAmount(amount);

    return reviewNetwork.sendSigned(
      rn.methods.fundSurvey(surveyJsonHash, totalAmount),
    );
  }

  async start(surveyJsonHash) {
    const rn = await reviewNetwork.contract;
    return reviewNetwork.sendSigned(rn.methods.startSurvey(surveyJsonHash));
  }

  async complete(surveyJsonHash) {
    const rn = await reviewNetwork.contract;
    return reviewNetwork.sendSigned(rn.methods.completeSurvey(surveyJsonHash));
  }

  async getEvents(event, options = {}) {
    const { ownOnly, reflectState, currentOnly } = options;

    // events that depend on each other
    // one cannot be emmited before another
    const dependentEvents = [
      'LogSurveyAdded',
      'LogSurveyFunded',
      'LogSurveyStarted',
      'LogSurveyCompleted',
    ];

    // map statuses by events:
    const status = {
      LogSurveyAdded: 'IDLE',
      LogSurveyFunded: 'FUNDED',
      LogSurveyStarted: 'IN_PROGRESS',
      LogSurveyCompleted: 'COMPLETED',
    };

    async function getEvent(event, ownOnly) {
      const filter = ownOnly ? { creator: wallet.getMyAddress() } : {};
      const rn = await reviewNetwork.contract;
      return rn.getPastEvents(event, {
        fromBlock: 0,
        filter,
      });
    }

    if (reflectState) {
      // start slicing events from the desired event:
      const eventsToFetch = dependentEvents.slice(
        dependentEvents.indexOf(event),
      );

      // fetch all required events:
      return Promise.all(
        eventsToFetch.map(event =>
          getEvent(event, ownOnly).then(receivedEvents => {
            return receivedEvents.map(receivedEvent => ({
              ...receivedEvent,
              status: status[event],
            }));
          }),
        ),
      ).then(result => {
        const allEventsMerged = Array.prototype.concat.apply([], result);

        console.log({ allEventsMerged });

        const dividedByHash = groupBy(
          allEventsMerged,
          'returnValues.surveyJsonHash',
        );

        console.log({ dividedByHash });

        const eventsToReturn = Object.values(dividedByHash).map(val =>
          maxBy(val, i => i.blockNumber),
        );

        if (currentOnly) {
          return eventsToReturn.filter(e => e.event === event);
        }
        return eventsToReturn;
      });
    }
    // just fetch all events and return them:
    return getEvent(event, ownOnly).then(events => {
      return events.map(e => ({ ...e, status: status[event] }));
    });
  }
}

export default new Survey();
