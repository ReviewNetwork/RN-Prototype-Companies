import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class RangeForm extends React.Component {
  state = {
    text: '',
    type: 'range',
    from: '1',
    to: '5',
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

  handleInputChange = (e, stateProp) => {
    this.props.touch()
    const question = this.store.questions.find(
      question => question.id === this.props.id,
    );
    if (stateProp === 'from' || stateProp === 'to') {
      question[stateProp] = Number(e.target.value);
    } else {
      question[stateProp] = e.target.value;
    }
  };

  render() {
    return (
      <div className="range-form">
        <div className="form-group">
          <input
            required="required"
            onChange={e => this.handleInputChange(e, 'text')}
            type="text"
            value={this.props.text || this.state.text}
          />
          <label htmlFor="input" className="control-label">Question</label><i className="bar"></i>
        </div>

        <input
          className="select-question select-range"
          onChange={e => this.handleInputChange(e, 'from')}
          type="number"
          placeholder="0"
          value={this.props.from || this.state.from}
        />
        <span className="range-to">to</span>
        <input
          className="select-question select-range"
          onChange={e => this.handleInputChange(e, 'to')}
          type="number"
          placeholder="0"
          value={this.props.to || this.state.to}
        />
      </div>
    );
  }
}

export default RangeForm;
