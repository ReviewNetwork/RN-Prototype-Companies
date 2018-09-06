import React from 'react';
import { inject, observer } from 'mobx-react';
import RangeForm from './RangeForm';
import YesNoForm from './YesNoForm';
import ChoiceForm from './ChoiceForm';
import { toJS } from 'mobx';

@inject('store')
@observer
class QuestionEditor extends React.Component {
  state = {
    choiceType: 'Range',
  };

  store = this.props.store.survey;

  componentDidMount() {
    const { question } = this.props;
    question.type && this.setState({ choiceType: question.type });
  }

  handleChange = e => {
    this.props.touch();
    this.setState({ choiceType: e.target.value });
    const question = this.store.questions.find(
      question => question.id === this.props.question.id,
    );
    for (let prop in question) {
      if (question.hasOwnProperty(prop) && prop !== 'id') {
        delete question[prop];
      }
    }
  };

  handleRemoval = () => {
    const { id } = this.props.question;
    this.store.removeQuestion(id);
  };

  isQuestionOnTop = () => {
    const question = this.store.questions.find(
      question => question.id === this.props.question.id,
    );

    const currentIndex = this.store.questions.indexOf(question);
    if (currentIndex <= 0) {
      return true;
    }
    return false;
  };

  moveQuestionUp = () => {
    const question = this.store.questions.find(
      question => question.id === this.props.question.id,
    );

    const currentIndex = this.store.questions.indexOf(question);
    if (currentIndex <= 0) {
      return;
    }

    const tmp = this.store.questions[currentIndex];
    this.store.questions[currentIndex] = this.store.questions[currentIndex - 1];
    this.store.questions[currentIndex - 1] = tmp;
  };

  isQuestionOnBottom = () => {
    const question = this.store.questions.find(
      question => question.id === this.props.question.id,
    );

    const currentIndex = this.store.questions.indexOf(question);
    if (currentIndex >= this.store.questions.length - 1) {
      return true;
    }
    return false;
  };

  moveQuestionDown = () => {
    const question = this.store.questions.find(
      question => question.id === this.props.question.id,
    );

    const currentIndex = this.store.questions.indexOf(question);
    if (currentIndex >= this.store.questions.length - 1) {
      return;
    }

    const tmp = this.store.questions[currentIndex];
    this.store.questions[currentIndex] = this.store.questions[currentIndex + 1];
    this.store.questions[currentIndex + 1] = tmp;
  };

  render() {
    const { choiceType } = this.state;
    const { question, hasError } = this.props;

    return (
      <div
        className={`question-editor card ${
          hasError ? 'question-editor--error' : ''
        }`}
      >
        <div className="select-close">
          <div className="select-wrap">
            <select className="select-question" onChange={this.handleChange}>
              <option>Range</option>
              <option>YesNo</option>
              <option>Choice</option>
            </select>
          </div>

          <div className="close-wrap">
            {!this.isQuestionOnTop() && (
              <button
                className="close-question-btn"
                onClick={this.moveQuestionUp}
              >
                <i className="material-icons">arrow_upward</i>
              </button>
            )}
            {!this.isQuestionOnBottom() && (
              <button
                className="close-question-btn"
                onClick={this.moveQuestionDown}
              >
                <i className="material-icons">arrow_downward</i>
              </button>
            )}
            <button className="close-question-btn" onClick={this.handleRemoval}>
              <i className="material-icons">delete</i>
            </button>
          </div>
        </div>
        <div className="question-wrap">
          {choiceType === 'Range' && (
            <RangeForm {...question} touch={this.props.touch} />
          )}
          {choiceType === 'YesNo' && (
            <YesNoForm {...question} touch={this.props.touch} />
          )}
          {choiceType === 'Choice' && (
            <ChoiceForm {...question} touch={this.props.touch} />
          )}
        </div>
      </div>
    );
  }
}

export default QuestionEditor;
