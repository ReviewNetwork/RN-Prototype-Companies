import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import surveyService from '../services/survey';
import wallet from '../services/wallet';
import Protected from '../components/Protected';
import SurveyDetails from '../components/SurveyDetails';

@Protected
@observer
@inject('store')
export default class MarketResearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      surveys: [],
      selectedSurvey: null,
    };
    this.store = this.props.store.ux;
  }

  componentDidMount() {
    this.store.changeLoadingTo(true);
    const eventsOptions = {
      ownOnly: true,
      reflectState: true,
      currentOnly: false,
    };
    surveyService
      .getEvents('LogSurveyAdded', eventsOptions)
      .then(async events => {
        console.log({ events });
        this.setState(
          {
            surveys: events.map(e => ({
              ...e.returnValues,
              blockNumber: e.blockNumber,
              status: e.status,
            })),
          },
          () => {
            this.store.changeLoadingTo(false);
          },
        );
      });
  }

  changeDetailsLoading(val) {
    this.setState({ detailsLoading: val });
  }

  selectSurvey = survey => {
    this.setState({ selectedSurvey: null });
    setTimeout(async () => {
      let rewardPerSurveyFormatted = await wallet.getTokenAmountFormatted(survey.rewardPerSurvey);
      this.setState({ selectedSurvey: { ...survey, rewardPerSurveyFormatted } });
    });
  };

  isSelectedSurvey(survey) {
    if (!this.state.selectedSurvey) {
      return false;
    }

    return this.state.selectedSurvey.surveyJsonHash === survey.surveyJsonHash;
  }

  render() {
    console.log(this.state.selectedSurvey);
    return (
      <div className="research-container">
        <div className="research">
          <div className="research__list">
            <div className="research__list-items">
              {this.state.surveys.map(s => (
                <div
                  className={`
                    research__list-item
                    ${
                      this.isSelectedSurvey(s)
                        ? 'research__list-item--active'
                        : ''
                    }
                  `}
                  key={`${s.surveyJsonHash}-${s.title}-${s.blockNumber}`}
                  onClick={() => this.selectSurvey(s)}
                >
                  {s.title}
                </div>
              ))}
            </div>
            {(this.state.surveys.length > 0) && (
              <hr className="research__separator" />
            )}
            <Link className="button-action" to="/create">
              <i className="material-icons">playlist_add</i> New Research
            </Link>
          </div>
          <div className="research__details">
            {this.state.selectedSurvey ? (
              <SurveyDetails survey={this.state.selectedSurvey} />
            ) : (
              <div className="research__nothing-selected">
                {(this.state.surveys.length > 0) && (
                  `Select a survey to see its details.`
                )}

                {(this.state.surveys.length === 0) && (
                  `You don't have any surveys yet.`
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
