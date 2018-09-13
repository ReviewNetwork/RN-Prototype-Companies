import { store } from 'rfx-core';
import { observable, action, toJS } from 'mobx';
import ipfs from '../services/ipfs';
import surveyService from '../services/survey';
import wallet from '../services/wallet';

export default class Survey {
  @observable description;
  @observable questions;

  constructor() {
    this.rootStore = store.get()
    this.questions = [];
  }

  @action
  reset() {
    this.questions.replace([]);
    this.description = '';
  }

  @action
  addQuestion(question) {
    this.questions.push(question);
  }

  @action
  removeQuestion(id) {
    const questions = this.questions.filter(question => question.id !== id);
    this.questions.replace(questions);
  }

  @action
  async createSurvey({
    title,
    publicKey,
    rewardPerSurvey,
    maxAnswers,
    description,
  }) {
    try {
      const survey = {
        description,
        questions: toJS(this.questions),
      };

      console.log('creating survey...', arguments[0]);

      const totalFunds = maxAnswers * rewardPerSurvey;

      console.log('Starting approving!!!');
      this.rootStore.ux.changeLoadingText('Approving REW for the survey...');
      const approval = await wallet.approveREWs(totalFunds);
      console.log({ approval });

      this.rootStore.ux.changeLoadingText('Uploading survey to decentralized storage...');
      let surveyJsonHash
      try {
        surveyJsonHash = await ipfs.store(survey);
      } catch (ex) {
        console.log('ipfs error', ex)
      }

      console.log('Starting creating!!!');
      this.rootStore.ux.changeLoadingText('Creating the survey on the blockchain...');
      const creation = await surveyService.create(
        publicKey,
        title,
        surveyJsonHash,
        rewardPerSurvey,
        maxAnswers,
      );
      console.log({ creation });

      // console.log('Starting funding!!!');
      // this.rootStore.ux.changeLoadingText('Transferring funds to the survey...');
      // const funding = await surveyService.fund(surveyJsonHash, totalFunds);
      // console.log({ funding });

      // console.log('Starting survey!!!');
      // this.rootStore.ux.changeLoadingText('Starting the survey...');
      // const starting = await surveyService.start(surveyJsonHash);
      // console.log({ starting });
    } catch (ex) {
      console.log('Welp, error', ex);
      if(ex.toString().indexOf('insufficient funds') !== -1) {
        alert('Error - Insufficient funds. Please request some test ETH and REW on the Wallet page before creating a survey.');
        throw Error('insufficient funds');
      }
    }
  }
}
