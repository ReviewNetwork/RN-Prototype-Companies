import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class YesNoForm extends React.Component {
  state = {
    text: '',
    type: 'yesno',
  };

  store = this.props.store.survey;

  componentDidMount() {
    const question = this.store.questions.find(
      question => question.id === this.props.id,
    );

    for (let prop in this.state) {
      if (!question[prop]) {
        question[prop] = this.state[prop];
      }
    }
  }

  handleInputChange = e => {
    this.props.touch()
    const question = this.store.questions.find(
      question => question.id === this.props.id,
    );

    question['text'] = e.target.value;
  };

  render() {
    return (
      <div className="yes-no-form">
        <div className="form-group">
          <input
            required="required"
            onChange={e => this.handleInputChange(e)}
            type="text"
            value={this.props.text || this.state.text}
          />
          <label htmlFor="input" className="control-label">Question</label><i className="bar"></i>
        </div>
      </div>
    );
  }
}

export default YesNoForm;
