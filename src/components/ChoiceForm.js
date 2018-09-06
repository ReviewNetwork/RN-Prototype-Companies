import React from 'react';
import { inject, observer } from 'mobx-react';
import nanoid from 'nanoid';

@inject('store')
@observer
class ChoiceForm extends React.Component {
  state = {
    choices: [],
    choiceValue: '',
  };

  initProps = {
    text: '',
    type: 'choice',
    choices: [],
  };

  store = this.props.store.survey;

  componentDidMount() {
    const question = this.store.questions.find(
      question => question.id === this.props.id,
    );

    for (let prop in this.initProps) {
      if (!question[prop]) {
        question[prop] = this.initProps[prop];
      }
    }
  }

  handleInputChange = (e, stateProp) => {
    this.props.touch();
    if (stateProp === 'text') {
      const { value } = e.target;

      const question = this.store.questions.find(
        question => question.id === this.props.id,
      );

      question[stateProp] = value;
    } else {
      this.setState({ choiceValue: e.target.value });
    }
  };

  handleAddOption = e => {
    this.props.touch();
    if (e.key === 'Enter') {
      const value = e.target.value.trim();
      if (!value) {
        return;
      }

      if (this.state.choices.indexOf(value) !== -1) {
        return;
      }

      this.setState(
        ({ choices }) => ({
          choices: choices.concat([value]),
          choiceValue: '',
        }),
        () => {
          const question = this.store.questions.find(
            question => question.id === this.props.id,
          );
          question['choices'] = this.state.choices;
        },
      );
    }
  };

  handleOptionRemoval = choiceToRemove => {
    this.setState(
      ({ choices }) => ({
        choices: choices.filter(choice => choice !== choiceToRemove),
      }),
      () => {
        const question = this.store.questions.find(
          question => question.id === this.props.id,
        );
        question['choices'] = this.state.choices;
      },
    );
  };

  render() {
    return (
      <div className="choice-form">
        <div className="form-group">
          <input
            required="required"
            onChange={e => this.handleInputChange(e, 'text')}
            type="text"
            value={this.props.text || ''}
          />
          <label htmlFor="input" className="control-label">
            Question
          </label>
          <i className="bar" />
        </div>

        <div className="form-group">
          <input
            required="required"
            onChange={e => this.handleInputChange(e, 'choiceValue')}
            onKeyPress={this.handleAddOption}
            type="text"
            value={this.state.choiceValue}
          />
          <label htmlFor="input" className="control-label">
            Add choice
          </label>
          <i className="bar" />
        </div>

        <ul className="choice-list">
          {this.props.choices &&
            this.props.choices.map(choice => (
              <li className="choice-item" key={nanoid()}>
                <span className="choice-left">
                  <span className="choice-item-circle">
                    <i className="material-icons">trip_origin</i>
                  </span>
                  <span className="choice-text">{choice}</span>
                </span>
                <i
                  onClick={() => this.handleOptionRemoval(choice)}
                  className="material-icons clear-button"
                >
                  clear
                </i>
              </li>
            ))}
        </ul>
      </div>
    );
  }
}

export default ChoiceForm;
