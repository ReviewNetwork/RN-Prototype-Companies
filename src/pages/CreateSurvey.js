import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import EthCrypto from 'eth-crypto';
import nanoid from 'nanoid';
import getWeb3 from '../services/web3';
import Protected from '../components/Protected';
import wallet from '../services/wallet';
import _ from 'lodash';

import QuestionEditor from '../components/QuestionEditor';

@inject('store')
@Protected
@observer
export default class CreateSurvey extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.survey;
    this.state = {
      title: '',
      description: '',
      rewardPerSurvey: 0,
      maxAnswers: 0,
      publicKey: '',
      isTitleInvalid: false,
      isDescriptionInvalid: false,
      isMaxAnswersInvalid: false,
      isRewardPerAnswerInvalid: false,
      fields: ['title', 'description', 'maxAnswers', 'rewardPerSurvey'],
      fieldTouched: {
        title: false,
        description: false,
        maxAnswers: false,
        rewardPerSurvey: false,
      },
      questionTouched: {},
    };
  }

  componentDidMount() {
    this.store.reset();

    this.addQuestion({
      id: nanoid(),
    });

    getWeb3().then(web3 => {
      this.setState({
        publicKey: EthCrypto.publicKeyByPrivateKey(wallet.getMyPrivateKey()),
      });
    });
  }

  componentWillUnmount() {
    this.store.reset();
  }

  touchQuestion(question) {
    this.setState({
      questionTouched: {
        ...this.state.questionTouched,
        [question.id]: true,
      },
    });
  }

  fieldHasError(field) {
    let validationMethod = this.getValidationMethodName(field);
    return this[validationMethod](this.state[field]);
  }

  questionHasError(question) {
    let textEmpty = !question.text || question.text.trim().length === 0;
    let idEmpty = !question.id || question.id.length === 0;
    let questionHasError = textEmpty || idEmpty;

    let duplicateText = _.some(
      this.store.questions,
      q => q.id !== question.id && q.text === question.text,
    );
    questionHasError = questionHasError || duplicateText;

    if (question.type === 'range') {
      questionHasError =
        questionHasError ||
        (question.from.toString() === '0' || question.to.toString() === '0');
      questionHasError =
        questionHasError ||
        parseInt(question.from, 10) >= parseInt(question.to, 10);
    }

    if (question.type === 'choice') {
      if (question.choices.length > 0) {
        questionHasError =
          questionHasError ||
          _.some(question.choices, choice => choice.length === 0);
      } else {
        questionHasError = true;
      }
    }

    return questionHasError;
  }

  questionsHaveErrors() {
    return _.some(toJS(this.store.questions), question =>
      this.questionHasError(question),
    );
  }

  formHasErrors() {
    let mainFormHasErrors = _.some(this.state.fields, field =>
      this.fieldHasError(field),
    );
    let questionsHaveErrors = this.questionsHaveErrors();
    return mainFormHasErrors || questionsHaveErrors;
  }

  isFieldTouched(field) {
    return this.state.fieldTouched[field];
  }

  validateTitle(val) {
    return val.length === 0;
  }

  validateDescription(val) {
    return false;
  }

  validateMaxAnswers(value) {
    if (value === 0) {
      return true;
    }

    return parseInt(value, 10) !== parseFloat(value, 10);
  }

  validateRewardPerSurvey(value) {
    if (value === 0) {
      return true;
    }

    return parseInt(value, 10) !== parseFloat(value, 10);
  }

  getValidationMethodName(field) {
    return `validate${field[0].toUpperCase()}${field.substring(1)}`;
  }

  getErrorFieldName(field) {
    return `is${field[0].toUpperCase()}${field.substring(1)}Invalid`;
  }

  showFieldError(field) {
    return this.fieldHasError(field) && this.isFieldTouched(field);
  }

  updateFieldValue(name, value) {
    let validationMethod = this.getValidationMethodName(name);

    this.setState({
      [this.getErrorFieldName(name)]: this[validationMethod](value),
      fieldTouched: {
        ...this.state.fieldTouched,
        [name]: true,
      },
      [name]: value,
    });
  }

  touchAllFields() {
    this.setState({
      fieldTouched: {
        title: true,
        description: true,
        maxAnswers: true,
        rewardPerSurvey: true,
      },

      questionTouched: this.store.questions.reduce((acc, q) => {
        acc[q.id] = true;
        return acc;
      }, {}),

      ts: new Date().valueOf(),
    });
  }

  createSurvey = async () => {
    if (this.formHasErrors()) {
      this.touchAllFields();
      return;
    }

    const balance = await wallet.getMyBalance();
    if (balance < this.state.rewardPerSurvey * this.state.maxAnswers) {
      alert('Not enough funds!');
      return;
    }

    this.props.store.ux.changeLoadingText(
      'Creating the survey... Please wait, this might take a few minutes...',
    );
    this.props.store.ux.changeLoadingTo(true);

    try {
      await this.store.createSurvey({
        title: this.state.title,
        publicKey: this.state.publicKey,
        rewardPerSurvey: this.state.rewardPerSurvey,
        maxAnswers: this.state.maxAnswers,
        description: this.state.description,
      });

      this.props.store.ux.changeLoadingText('');
      this.props.store.ux.changeLoadingTo(false);
      this.store.reset();

      this.setState({
        title: '',
        description: '',
        rewardPerSurvey: 0,
        maxAnswers: 0,
      });

      this.props.history.push('/');
    } catch (ex) {
      this.props.store.ux.changeLoadingText('');
      this.props.store.ux.changeLoadingTo(false);
      this.store.reset();

      this.setState({
        title: '',
        description: '',
        rewardPerSurvey: 0,
        maxAnswers: 0,
      });

      if (ex.toString().indexOf('insufficient funds') !== -1) {
        this.props.history.push('/wallet');
      } else {
        this.props.history.push('/');
      }
    }
  };

  addQuestion(question) {
    this.store.addQuestion(question);
  }

  render() {
    console.log({ questions: toJS(this.store.questions) });

    return (
      <div
        className={`create-survey ${
          this.formHasErrors() ? 'create-survey--invalid' : ''
        }`}
      >
        <div>
          <div className="card card-dark">
            <h3 className="create-survey-title">Create new research</h3>

            <div>
              <div
                className={`form-group dark ${
                  this.showFieldError('title') ? 'form-group--invalid' : ''
                }`}
              >
                <input
                  required="required"
                  type="text"
                  onChange={e => this.updateFieldValue('title', e.target.value)}
                  value={this.state.title}
                />
                <label htmlFor="input" className="control-label">
                  Survey title
                </label>
                <i className="bar" />
              </div>

              <div
                className={`form-group dark ${
                  this.showFieldError('description')
                    ? 'form-group--invalid'
                    : ''
                }`}
              >
                <input
                  required="required"
                  type="text"
                  onChange={e =>
                    this.updateFieldValue('description', e.target.value)
                  }
                  value={this.state.description}
                />
                <label htmlFor="input" className="control-label">
                  Description
                </label>
                <i className="bar" />
              </div>

              <div className="group-half-wrap dark">
                <div className="group-half">
                  <div
                    className={`form-group dark ${
                      this.showFieldError('maxAnswers')
                        ? 'form-group--invalid'
                        : ''
                    }`}
                  >
                    <input
                      required="required"
                      type="number"
                      onChange={e =>
                        this.updateFieldValue('maxAnswers', e.target.value)
                      }
                      value={this.state.maxAnswers}
                    />
                    <label htmlFor="input" className="control-label">
                      Number of participants
                    </label>
                    <i className="bar" />
                  </div>
                </div>

                <div className="group-half">
                  <div
                    className={`form-group dark ${
                      this.showFieldError('rewardPerSurvey')
                        ? 'form-group--invalid'
                        : ''
                    }`}
                  >
                    <input
                      required="required"
                      type="number"
                      onChange={e =>
                        this.updateFieldValue('rewardPerSurvey', e.target.value)
                      }
                      value={this.state.rewardPerSurvey}
                    />
                    <label htmlFor="input" className="control-label">
                      Reward Per Answer
                    </label>
                    <i className="bar" />
                  </div>
                </div>
              </div>

              <div className="group-half-wrap flex-end">
                <div className="group-half">
                  <p className="total-label">Total</p>
                  <p className="total">
                    <span className="total-rew">
                      {(
                        this.state.rewardPerSurvey * this.state.maxAnswers
                      ).toLocaleString()}{' '}
                      REW
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            {toJS(this.store.questions).map(question => (
              <QuestionEditor
                key={question.id}
                question={question}
                hasError={
                  this.questionHasError(question) &&
                  this.state.questionTouched[question.id]
                }
                touch={() => {}}
              />
            ))}
          </div>

          <div className="card card-btn-wrap add-question">
            <button
              className="card-btn"
              onClick={() => this.addQuestion({ id: nanoid() })}
            >
              Add question
            </button>
          </div>
        </div>

        <div className="card group-half-wrap create-survey-actions">
          <div className="group-half card-btn-wrap">
            <Link to="/" className="card card-btn card-btn-grey">
              Cancel
            </Link>
          </div>

          <div className="group-half card-btn-wrap">
            <button
              className="card card-btn card-btn-linear"
              onClick={this.createSurvey}
            >
              Save and publish
            </button>
          </div>
        </div>
      </div>
    );
  }
}
