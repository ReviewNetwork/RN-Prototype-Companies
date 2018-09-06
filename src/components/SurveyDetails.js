import React from 'react';
import ecies from 'eth-ecies';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import surveyService from '../services/survey';
import wallet from '../services/wallet';
import ipfs from '../services/ipfs';
import getWeb3 from '../services/web3';
import SurveyQuestionRange from './SurveyQuestionRange';
import SurveyQuestionChoice from './SurveyQuestionChoice';
import { withRouter } from 'react-router';
import reviewNetwork from '../services/contracts/review-network';

@withRouter
@observer
@inject('store')
class SurveyDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
    };
    this.store = this.props.store.ux;
  }

  _isMounted = false;
  async componentDidMount() {
    this._isMounted = true;
    await this.init(true);
    const rn = await reviewNetwork.contract;
    rn.events
      .LogSurveyAnswered({
        filter: {},
        fromBlock: 'latest',
      })
      .on('data', async event => {
        console.log(event); // same results as the optional callback above
        if (
          event.returnValues.surveyJsonHash ===
            this.props.survey.surveyJsonHash &&
          this._isMounted
        ) {
          console.log('updating....');
          await this.init(false);
        }
      })
      .on('error', console.error);
  }

  async componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.survey) !== JSON.stringify(this.props.survey)
    ) {
      await this.init(true);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async init(showLoader) {
    function decrypt(privateKey, encryptedData) {
      let userPrivateKey = new Buffer(privateKey, 'hex');
      let bufferEncryptedData = new Buffer(encryptedData, 'base64');

      let decryptedData = ecies.decrypt(userPrivateKey, bufferEncryptedData);

      return decryptedData.toString('utf8');
    }

    if (showLoader) {
      this.store.changeLoadingTo(true);
    }

    const web3 = await getWeb3();
    const block = await web3.eth.getBlock(this.props.survey.blockNumber);
    const date = moment.unix(block.timestamp);
    const createdAgo = moment(date).fromNow();

    let privateKey = wallet.getMyPrivateKey();
    privateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const hash = this.props.survey.surveyJsonHash;
    surveyService.getEvents('LogSurveyAnswered').then(events => {
      const answersHashes = events
        .filter(e => e.returnValues.surveyJsonHash === hash)
        .map(e => e.returnValues.answersJsonHash);
      console.log({ answersHashes });
      Promise.all(answersHashes.map(hash => ipfs.get(hash)))
        .then(encryptedAnswers => {
          if (this._isMounted) {
            return encryptedAnswers.map(answer =>
              JSON.parse(decrypt(privateKey, answer)),
            );
          }
        })
        .then(decryptedAnswers => {
          if (this._isMounted) {
            this.extractSurveyData(decryptedAnswers)
              .then(results => {
                console.log({ results });
                if (showLoader) {
                  this.store.changeLoadingTo(false);
                }
                this.setState({
                  results,
                  createdAgo,
                  responseCount: answersHashes.length,
                });
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));
    });
  }

  extractSurveyData(answers) {
    const {
      survey: { surveyJsonHash },
    } = this.props;

    return ipfs.get(surveyJsonHash).then(survey => {
      const { questions } = survey;

      const withResults = {};
      questions.forEach(question => {
        const result = {};
        if (question.type === 'range') {
          for (let i = question.from; i <= question.to; i++) {
            result[i] = 0;
          }
        } else if (question.type === 'yesno') {
          result.yes = 0;
          result.no = 0;
        } else if (question.type === 'choice') {
          question.choices.forEach(choice => (result[choice] = 0));
        }
        withResults[question.text] = { ...question, result };
      });

      answers.forEach(answer => {
        for (let prop in answer) {
          withResults[prop].result[answer[prop]]++;
        }
      });

      return Object.values(withResults);
    });
  }

  render() {
    const { results, createdAgo, responseCount } = this.state;
    console.log({ results, createdAgo, responseCount });
    console.log(this.props.history);
    const { survey } = this.props;
    const toFund = Number(survey.maxAnswers) * Number(survey.rewardPerSurvey);
    return (
      <div className="survey-details">
        <div className="box">
          <div className="box__action">
            {survey.status === 'IDLE' && (
              <button
                className="button-action"
                onClick={async () => {
                  this.props.store.ux.changeLoadingText(
                    'Funding the survey...',
                  );
                  this.props.store.ux.changeLoadingTo(true);
                  await surveyService.fund(survey.surveyJsonHash, toFund);
                  this.props.store.ux.changeLoadingText('');
                  this.props.store.ux.changeLoadingTo(false);
                  window.location.reload();
                }}
              >
                Fund
              </button>
            )}

            {survey.status === 'FUNDED' && (
              <button
                className="button-action"
                onClick={async () => {
                  this.props.store.ux.changeLoadingText(
                    'Starting the survey...',
                  );
                  this.props.store.ux.changeLoadingTo(true);
                  await surveyService.start(survey.surveyJsonHash, toFund);
                  this.props.store.ux.changeLoadingText('');
                  this.props.store.ux.changeLoadingTo(false);
                  window.location.reload();
                }}
              >
                Start
              </button>
            )}

            {survey.status === 'IN_PROGRESS' && (
              <button
                className="button-action"
                onClick={async () => {
                  this.props.store.ux.changeLoadingText(
                    'Completing the survey...',
                  );
                  this.props.store.ux.changeLoadingTo(true);
                  await surveyService.complete(survey.surveyJsonHash);
                  this.props.store.ux.changeLoadingText('');
                  this.props.store.ux.changeLoadingTo(false);
                  window.location.reload();
                }}
              >
                Complete
              </button>
            )}
          </div>

          <h2 className="box__title box__title--large">{survey.title}</h2>
        </div>
        {results ? (
          <div>
            <div className="box-container">
              <div className="box">
                <div className="box__title">Number of responses</div>

                <div className="survey-details-bar-info-box">
                  <div className="survey-details__bar-info survey-details__bar-info--right">
                    {(responseCount / survey.maxAnswers) * 100}%
                  </div>

                  <div className="survey-details__bar-info">
                    {responseCount} / {survey.maxAnswers}
                  </div>
                </div>

                <div className="progress">
                  <div
                    className="progress__bar"
                    style={{
                      width: `${(responseCount / survey.maxAnswers) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="box">
                <div className="box__title">Info</div>
                <div className="box__content">
                  {this.props.survey.status === 'COMPLETED'
                    ? 'Completed'
                    : 'Created'}{' '}
                  {createdAgo}
                </div>
                <div className="box__content">
                  Price per answer {survey.rewardPerSurveyFormatted} REW
                </div>
              </div>
            </div>

            {results.map((result, i) => (
              <div className="box box--compact" key={result.id}>
                <div className="box__title box__title--large">
                  {i + 1}. {result.text}
                </div>
                <div className="survey-details__question">
                  {result.type === 'range' && (
                    <SurveyQuestionRange
                      question={result}
                      maxAnswers={survey.maxAnswers}
                      responseCount={responseCount}
                    />
                  )}
                  {result.type === 'yesno' && (
                    <SurveyQuestionRange
                      question={result}
                      maxAnswers={survey.maxAnswers}
                      responseCount={responseCount}
                    />
                  )}
                  {result.type === 'choice' && (
                    <SurveyQuestionChoice
                      question={result}
                      responseCount={responseCount}
                      maxAnswers={survey.maxAnswers}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }
}

export default SurveyDetails;
