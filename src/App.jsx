/** eslint verified */
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Home from './Home';
import Summary from './Summary';
import IndicatorsDash from './IndicatorsDash';
import Indicator from './Indicator';
import RestAPI from './commons/RestAPI';
import './assets/main.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeArea: null,
      sedimentaryList: [],
    };
  }

  async componentDidMount() {
    try {
      const sedimentary = await RestAPI.requestSedimentaryBasins();
      this.setState({
        sedimentaryList: sedimentary,
      });
    } catch (error) {
      // TODO: Set state in a error (handling error)
    }
  }

  setActiveArea = async (name) => {
    const { sedimentaryList } = this.state;
    try {
      const area = await RestAPI.requestAreaSelected(name);
      this.setState({
        activeArea: {
          sedimentary_name: sedimentaryList.find((item) => (
            item.code === area.sedimentary_code
          )).name,
          ...area,
        },
      });
    } catch (error) {
      // TODO: What to do with the error?
    }
  }

  loadComponentWithArea = (loadFunc) => (props) => {
    const { match } = props;
    if (!match.params.name) return (<Redirect to="/" />);
    return loadFunc(props);
  }

  loadHome = () => {
    const { sedimentaryList } = this.state;
    return (
      <Home
        setActiveArea={this.setActiveArea}
        sedimentaryList={sedimentaryList}
      />
    );
  }

  loadIndicatorsDash = ({ match }) => {
    const { activeArea } = this.state;
    return (
      <IndicatorsDash
        activeArea={activeArea}
        areaName={match.params.name}
        setActiveArea={this.setActiveArea}
      />
    );
  }

  loadIndicator = ({ match, location }) => {
    const { activeArea } = this.state;
    const searchParams = new URLSearchParams(location.search);
    return (
      <Indicator
        activeArea={activeArea}
        areaName={match.params.name}
        indicatorIds={searchParams.getAll('ids')}
        setActiveArea={this.setActiveArea}
      />
    );
  }

  loadSummary = ({ match }) => {
    const { activeArea } = this.state;
    return (
      <Summary
        activeArea={activeArea}
        areaName={match.params.name}
        setActiveArea={this.setActiveArea}
      />
    );
  }

  render() {
    return (
      <main>
        <Switch>
          <Route exact path="/" render={this.loadHome} />
          <Route exact path="/indicatorsDash/:name?" render={this.loadComponentWithArea(this.loadIndicatorsDash)} />
          <Route exact path="/indicator/:name?" render={this.loadComponentWithArea(this.loadIndicator)} />
          <Route path="/summary/:name?" render={this.loadComponentWithArea(this.loadSummary)} />
        </Switch>
      </main>
    );
  }
}

export default App;
