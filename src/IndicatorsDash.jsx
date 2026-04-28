/** eslint verified */
import React from 'react';
import PropTypes from 'prop-types';

import CloseIcon from '@material-ui/icons/Close';
import Modal from '@material-ui/core/Modal';

import Masonry from 'react-masonry-component';
import Layout from './Layout';
import IndicatorCard from './IndicatorCard';

import RestAPI from './commons/RestAPI';

const masonryOptions = {
  transitionDuration: '0.5s',
};

class IndicatorsDash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connError: false,
      data: [],
      tabs: [],
      activeTab: 'Todas',
    };
  }

  componentDidMount() {
    const { areaName } = this.props;
    this.loadIndicators(areaName);
  }

  componentDidUpdate() {
    const { activeArea, areaName, setActiveArea } = this.props;
    if (!activeArea) {
      setActiveArea(areaName);
    }
  }

  /**
   * Load indicators and topics list for selected area from RestAPI
   *
   * @param {string} areaName id for selected area
   */
  loadIndicators = (areaName) => {
    RestAPI.requestIndicatorsByArea(areaName)
      .then((res) => {
        res.topics.unshift('Todas');
        this.setState({
          data: res.indicators,
          tabs: res.topics,
        });
      })
      .catch(() => {
        this.reportConnError();
      });
  }

  /**
   * Report a connection error from one of the child components
   */
  reportConnError = () => {
    this.setState({
      connError: true,
    });
  }

  /**
   * Close a given modal
   *
   * @param {String} state state value that controls the modal you want to close
   */
  handleCloseModal = (state) => () => {
    this.setState({ [state]: false });
  };

  render() {
    const {
      connError,
      data,
      activeTab,
      tabs,
    } = this.state;
    const { activeArea, areaName } = this.props;

    if (!activeArea) return null;

    const masonryComp = (
      <Masonry
        options={masonryOptions}
      >
        {data.filter((post) => activeTab === 'Todas' || post.topics.includes(activeTab)).map((item) => (
          <IndicatorCard
            key={item.name}
            code={item.code}
            size={item.size}
            name={item.name}
            values={item.values}
            totalArea={activeArea.area}
            areaName={areaName}
            indicatorIds={item.ids.map((ind) => ind.id)}
          />
        ))}
      </Masonry>
    );

    return (
      <Layout
        activeArea={activeArea}
        activateHome
        activateSummary
      >
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={connError}
          onClose={this.handleCloseModal('connError')}
          disableAutoFocus
        >
          <div className="generalAlarm">
            <h2>
              <b>Sin conexión al servidor</b>
              <br />
              Intenta de nuevo en unos minutos.
            </h2>
            <button
              type="button"
              className="closebtn"
              onClick={this.handleCloseModal('connError')}
              data-tooltip
              title="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        </Modal>
        <section className="sectionintern">
          <div className="internheader" />
          <div className="filtros">
            {tabs.map((tabKey) => (
              <a
                key={tabKey}
                href={`#${tabKey}`}
                className={(tabKey === activeTab && 'filteron') || ''}
                onClick={() => this.setState({ activeTab: tabKey })}
              >
                {tabKey}
              </a>
            ))}
          </div>
          <div className="boxeswrapper">
            {masonryComp}
          </div>
        </section>
      </Layout>
    );
  }
}

IndicatorsDash.propTypes = {
  activeArea: PropTypes.object,
  areaName: PropTypes.string.isRequired,
  setActiveArea: PropTypes.func,
};

IndicatorsDash.defaultProps = {
  activeArea: {},
  setActiveArea: () => {},
};

export default IndicatorsDash;
