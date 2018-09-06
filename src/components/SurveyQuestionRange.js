import React from 'react';

class SurveyDetails extends React.Component {
  render() {
    let { question, responseCount } = this.props;

    let keys = Object.keys(question.result);
    let options = keys.map(key => ({
      key,
      percentage:
        question.result[key] === 0
          ? 0
          : Math.round(
              (parseInt(question.result[key], 10) / responseCount) * 100,
            ),
    }));

    return (
      <div className="question question--range">
        {options.map(option => (
          <div className="question__option" key={option.key}>
            <div className="question__label" title={`${option.key}`}>{option.key}</div>
            <div className="question__progress">
              <div className="question-progress">
                <div
                  className="question-progress__inner"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
            <div className="question__stats" title={`${question.result[option.key]} (${`${option.percentage}%`})`}>
              {question.result[option.key].toLocaleString()} ({`${option.percentage}%`})
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default SurveyDetails;
