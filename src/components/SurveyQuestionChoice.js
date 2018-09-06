import React from 'react';
import PieChart from 'react-minimal-pie-chart';

const chartColors = ['#c821bb', '#ab48cd', '#8c5ed7', '#6c6edb', '#4d79d8'];
const unansweredColor = '#D2D4DB';

class SurveyDetails extends React.Component {
  render() {
    let { question, maxAnswers, responseCount } = this.props;

    let keys = Object.keys(question.result);
    let data = keys.map((key, i) => ({
      title: key,
      value: parseInt(question.result[key], 10),
      color: chartColors[i % chartColors.length],
    }));

    if (!responseCount) {
      data.push({
        title: 'Not answered',
        value: parseInt(maxAnswers, 10) - parseInt(responseCount, 10),
        color: unansweredColor,
      });
    }

    console.log('chart data', data);

    return (
      <div className="question question--choice">
        <div className="question__legend">
          {keys.map((key, i) => (
            <div className="question__legend-item" key={key}>
              <div
                className="question__legend-item__point"
                style={{ backgroundColor: chartColors[i % chartColors.length] }}
              />
              {key} -{' '}
              {data[i].value === 0
                ? 0
                : Math.round((data[i].value / responseCount) * 100)}{' '}
              %
            </div>
          ))}
          {!responseCount && (
            <div className="question__legend-item" key={'not-answered'}>
              <div
                className="question__legend-item__point"
                style={{ backgroundColor: unansweredColor }}
              />
              Not answered - 100%
            </div>
          )}
        </div>
        <div className="question__chart">
          <PieChart
            data={data}
            totalValue={
              responseCount
                ? parseInt(responseCount, 10)
                : parseInt(maxAnswers, 10)
            }
          />
        </div>
      </div>
    );
  }
}

export default SurveyDetails;
