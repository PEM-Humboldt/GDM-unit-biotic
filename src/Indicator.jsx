import React from 'react';
import L from 'leaflet';
import PropTypes from 'prop-types';

import CloseIcon from '@material-ui/icons/Close';
import Modal from '@material-ui/core/Modal';

import Select from 'react-select';
import Layout from './Layout';
import MapViewer from './commons/MapViewer';
import RenderGraph from './graphs/RenderGraph';
import GraphData from './commons/GraphData';
import RestAPI from './commons/RestAPI';

class Indicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: null,
      biomesList: [],
      geometries: {},
      connError: false,
      data: null,
      dataGroups: 1,
      fullData: null,
      code: 4,
      groupName: '',
      graphSize: { width: 0, height: 0 },
      graphHeaderHeight: 0,
      metadata: '',
    };
  }

  componentDidMount() {
    const {
      activeArea, areaName, setActiveArea,
    } = this.props;
    if (!activeArea) {
      setActiveArea(areaName);
    }
  }

  componentDidUpdate() {
    const { data } = this.state;
    const {
      activeArea, areaName, indicatorIds, setActiveArea,
    } = this.props;
    if (!activeArea) {
      setActiveArea(areaName);
    } else if (data === null) {
      this.loadData(areaName, indicatorIds, activeArea);
      this.loadAreaGeometry(areaName);
      this.loadMetadata(indicatorIds[0]);
    }
  }

  loadAreaGeometry = (areaName) => {
    RestAPI.requestGeometryByArea(areaName)
      .then((res) => {
        this.setState({
          geometries: {
            areaBorder: {
              displayName: areaName,
              id: 1,
              active: true,
              layer: L.geoJSON(res, {
                style: {
                  color: '#8B7765',
                  stroke: true,
                  fillColor: 'transparent',
                  fillOpacity: 0.5,
                },
              }),
            },
          },
        });
      })
      .catch(() => {
        this.reportConnError();
      });
  }


  /**
   * Load geometry for the incoming indicator
   *
   * @param {string} gids indicator ids for a selected area
  */
  loadIndicatorGeometry = (code, gids) => {
    const bufferColorsByIdIndicator = {
      3: 'black',
      4: 'black',
      5: 'black',
      6: 'red',
      7: '#f4b400',
      8: 'green',
    };
    const coverageColorsByCoverage = { 1: '#f4b400', 2: '#fada80' };
    const ecosystemsRedListColorsByThreat = { CR: '#EF0928', EN: '#FB6A2A', VU: '#DF9735' };
    const gidsQuery = gids.map((gid) => `ids=${gid}`).join('&');
    RestAPI.requestGeometryByGid(gidsQuery)
      .then((res) => {
        if (res.features) {
          if (code === 1) {
            const temp = {
              area: {
                displayName: 'Foo',
                id: 2,
                active: true,
                layer: L.geoJSON(res.features[0].geometry, {
                  style: {
                    color: '#f4b400',
                    stroke: false,
                    fillColor: coverageColorsByCoverage[res.features[0].properties.id_indicator],
                    fillOpacity: 0.7,
                  },
                }),
              },
            };
            this.setState((prevState) => ({ geometries: { ...prevState.geometries, ...temp } }));
          }
          if (code === 2) {
            res.features.forEach((i) => {
              const geom = {
                [i.properties.gid]: {
                  displayName: `buff_+${i.properties.gid}`,
                  id: i.properties.gid,
                  active: true,
                  layer: L.geoJSON(i.geometry, {
                    style: {
                      stroke: false,
                      fillColor: bufferColorsByIdIndicator[i.properties.id_indicator],
                      fillOpacity: (i.properties.id_indicator <= 5 ? 0.5 : 0.1),
                    },
                  }),
                },
              };
              this.setState((prevState) => ({ geometries: { ...prevState.geometries, ...geom } }));
            });
          }
          if (code === 3) {
            res.features.forEach((i) => {
              const geom = {
                [i.properties.gid]: {
                  displayName: `lre_+${i.properties.gid}`,
                  id: i.properties.gid,
                  active: true,
                  layer: L.geoJSON(i.geometry, {
                    style: {
                      stroke: false,
                      fillColor: ecosystemsRedListColorsByThreat[
                        i.properties.value_description.substring(0, 2)],
                      fillOpacity: 0.5,
                    },
                  }),
                },
              };
              this.setState((prevState) => ({ geometries: { ...prevState.geometries, ...geom } }));
            });
          }
          if (code === 4) {
            res.features.forEach((i) => {
              const geom = {
                [i.properties.gid]: {
                  displayName: `lre_+${i.properties.gid}`,
                  id: i.properties.gid,
                  active: true,
                  layer: L.geoJSON(i.geometry, {
                    style: {
                      color: 'blue',
                      weight: 2,
                      stroke: true,
                      dashArray: '3',
                      fillColor: 'blue',
                      fillOpacity: 0.5,
                    },
                  }),
                },
              };
              this.setState((prevState) => ({ geometries: { ...prevState.geometries, ...geom } }));
            });
          }
        }
      })
      .catch(() => {
        this.reportConnError();
      });
  }

  /**
   * Load indicators data for selected area from RestAPI and specified ids
   *
   * @param {string} name area name for selected area
   * @param {string} ids indicator ids for selected area
   */
  loadData = (name, ids, activeArea) => {
    const idsQuery = ids.map((id) => `ids=${id}`).join('&');
    RestAPI.requestIndicatorsByArea(name, idsQuery)
      .then((res) => {
        const state = {};
        if (res.biomes) {
          state.biomesList = res.biomes.map((item) => ({ value: item.id, label: item.name }));
        }
        let geoIds = [];
        if (res.values && res.code) {
          let x = [];

          // Putting the response on an Array to allow filtering and sorting functions
          if (!Array.isArray(res.values)) {
            Object.values(res.values).forEach((obj) => {
              obj.forEach((i) => {
                x.push(i);
              });
            });
          } else {
            x = res.values;
          }

          if (res.code === 1) {
            // Picking the biggest area for the last year
            if (x[0].id_indicator !== 26) {
              geoIds = [
                x.filter((f) => f.year === Math.max(...x.map((o) => o.year)))
                  .sort((a, b) => (
                    parseFloat(a.indicator_value) < parseFloat(b.indicator_value)
                  ))[0].id,
              ];
            }
          }
          if (res.code === 2) {
            // Picking all the geometries
            geoIds = x
              .filter((f) => f.id_indicator !== 9 && f.id_indicator !== 10 && f.id_indicator !== 11)
              .map((o) => o.id);
          }
          if (res.code === 3) {
            // Picking geometries by ecosystem only
            geoIds = x
              .filter((f) => f.id_indicator === 14)
              .map((o) => o.id);
          }
          if (res.code === 4) {
            // Picking geometries by ecosystem only
            geoIds = x
              .filter((f) => f.id_indicator === 12 || f.id_indicator === 18
                          || f.id_indicator === 20 || f.id_indicator === 22
                          || f.id_indicator === 24)
              .map((o) => o.id);
          }
        }
        if (geoIds.length > 0) {
          // geometries = GeometryMapper.loadIndicatorGeometry(res.code, geoIds, state.geometries);
          this.loadIndicatorGeometry(res.code, geoIds);
        }
        if (!activeArea) return null;
        const { results, groups } = GraphData.prepareData(
          res.code, res.values, res.biomes, activeArea.area,
        );
        state.data = results;
        state.dataGroups = groups;
        state.fullData = state.data;
        state.code = res.code;
        state.groupName = res.group_name;
        this.setState(state);
      })
      .catch(() => {
        this.reportConnError();
      });
  }

  /**
   * Set state with the metadata to show in this component
   *
   * @param {Number} id indicator id
   */
  loadMetadata = (id) => {
    RestAPI.requestMetadataById(id)
      .then((res) => {
        this.setState({ metadata: res.metadata });
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
   * Behavior when a biome option is selected
   */
  handleBiomesSelect = (selectedOption) => {
    this.setState({ selectedOption });
    const { fullData } = this.state;
    const state = {};
    if (selectedOption) {
      const data = fullData.filter((row) => row[0] === 'Bioma' || row[0] === selectedOption.label);
      const dumb = [' '].concat(data[0].slice(1).map(() => null));
      state.data = [data[0], dumb, data[1], dumb];
    } else {
      state.data = fullData;
    }
    this.setState(state);
  };

  /**
   * Close a given modal
   *
   * @param {String} state state value that controls the modal you want to close
   */
  handleCloseModal = (state) => () => {
    this.setState({ [state]: false });
  };

  setGraphWidth = (domElem) => {
    if (domElem) {
      this.setState((prevState) => ({
        graphSize: {
          height: prevState.graphSize.height,
          width: domElem.offsetWidth,
        },
      }));
    }
  }

  setGraphHeight = (domElem) => {
    if (domElem) {
      this.setState((prevState) => ({
        graphSize: {
          height: domElem.offsetHeight,
          width: prevState.graphSize.width,
        },
      }));
    }
  }

  setGraphHeaderHeight = (domElem) => {
    if (domElem) this.setState({ graphHeaderHeight: domElem.offsetHeight });
  }

  render() {
    const {
      selectedOption,
      biomesList,
      connError,
      data,
      dataGroups,
      code,
      groupName,
      graphSize: { height: graphHeight, width: graphWidth },
      graphHeaderHeight,
      geometries,
      metadata,
    } = this.state;
    const { activeArea } = this.props;

    let biomesSelect = null;
    if (biomesList.length > 0) {
      biomesSelect = (
        <Select
          value={selectedOption}
          onChange={this.handleBiomesSelect}
          options={biomesList}
          placeholder="Seleccione un bioma"
          isSearchable="true"
          isClearable="true"
        />
      );
    }

    const graphHeader = (
      <div ref={this.setGraphHeaderHeight}>
        <div className="graphtitle2">
          {groupName}
        </div>
        {biomesSelect}
      </div>
    );

    let graph = null;
    if (data && graphHeight !== 0 && graphWidth !== 0) {
      graph = (
        <div className="indicator">
          {graphHeader}
          <RenderGraph
            data={data}
            graph={GraphData.validGraphType(code).validGraphType}
            title={groupName}
            width={graphWidth}
            height={graphHeight - graphHeaderHeight}
            padding={20}
            dataGroups={dataGroups}
            showHelper
          />
        </div>
      );
    }

    return (
      <Layout
        activeArea={activeArea}
        activateHome
        activateIndicators
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
        <section className="sectionintern sectintresp" ref={this.setGraphHeight}>
          <div className="internheader" />
          <div className="sheet" ref={this.setGraphWidth}>
            {graph || 'cargando...'}
          </div>
          <div className="blockdata bdresponsive">
            <h1>¿Cómo leer esta cifra en el área?</h1>
            <div className="line" />
            <br />
            {/* eslint-disable-next-line react/no-danger */}
            <div dangerouslySetInnerHTML={{ __html: metadata }} />
            <br />
            {geometries
              && (
              <div id="miniMap" className="smallMap">
                <MapViewer
                  layers={geometries}
                  controls={false}
                />
              </div>
              )}
          </div>
        </section>
      </Layout>
    );
  }
}

Indicator.propTypes = {
  activeArea: PropTypes.object,
  indicatorIds: PropTypes.array,
  areaName: PropTypes.string.isRequired,
  setActiveArea: PropTypes.func,
};

Indicator.defaultProps = {
  activeArea: {},
  indicatorIds: null,
  setActiveArea: () => {},
};

export default Indicator;
