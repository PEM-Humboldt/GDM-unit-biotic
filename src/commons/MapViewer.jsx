/** eslint verified */
import React from 'react';
import PropTypes from 'prop-types';
// Leaflet imports
import 'leaflet/dist/leaflet.css';
import { Map, TileLayer } from 'react-leaflet';


const config = {};
config.params = {
  center: [4.4159, -72.1598], // Location: Mariquita-Tolima
};

class MapViewer extends React.Component {
  /**
   * Construct an object with just one value corresponding to a desired attribute
   *
   * @param {object} layers layers from props,
   *  this param is to make the function callable from getDerivedStateFromProps
   * @param {string} key attribute to choose,
   *  see attributes of layers inner objects in Search and Compensation.
   */
  static infoFromLayers = (layers, key) => {
    const responseObj = {};
    Object.keys(layers).forEach((layerKey) => {
      responseObj[layerKey] = layers[layerKey][key];
    });

    return responseObj;
  }

  constructor(props) {
    super(props);
    this.state = {
      layers: {},
      activeLayers: [],
      update: false,
    };

    this.mapRef = React.createRef();
  }

  componentDidUpdate() {
    const { layers, activeLayers, update } = this.state;
    const { padding } = this.props;
    if (update) {
      Object.keys(layers).forEach((layerName) => {
        if (activeLayers.includes(layerName)) this.showLayer(layers[layerName], true, padding);
        else this.showLayer(layers[layerName], false);
      });
    }
    const countActiveLayers = Object.values(activeLayers).filter(Boolean).length;
    if (countActiveLayers === 0) {
      this.mapRef.current.leafletElement.setView(config.params.center, 5);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let newActiveLayers = MapViewer.infoFromLayers(nextProps.layers, 'active');
    newActiveLayers = Object.keys(newActiveLayers).filter((name) => newActiveLayers[name]);
    const { layers: oldLayers, activeLayers } = prevState;
    if (newActiveLayers.join() === activeLayers.join()) {
      return { update: false };
    }

    const layers = MapViewer.infoFromLayers(nextProps.layers, 'layer');
    Object.keys(oldLayers).forEach((name) => {
      if (layers[name] !== oldLayers[name]) {
        oldLayers[name].remove();
      }
    });
    return { layers, activeLayers: newActiveLayers, update: true };
  }

  /**
   *  Defines what layer to show and actions derivate from the selection
   *
   * @param {Object} layer receives leaflet object and e.target as the layer
   * @param {Boolean} state if it's false, then the layer should be hidden
   */
  showLayer = (layer, state, padding) => {
    if (state === false) {
      this.mapRef.current.leafletElement.removeLayer(layer);
    } else {
      this.mapRef.current.leafletElement.addLayer(layer);
      this.mapRef.current.leafletElement.fitBounds(layer.getBounds(), padding);
    }
  }

  render() {
    const { controls } = this.props;
    return (
      <Map
        ref={this.mapRef}
        center={config.params.center}
        zoom={11}
        onClick={this.onMapClick}
        attributionControl={controls}
        zoomControl={controls}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
      </Map>
    );
  }
}

MapViewer.propTypes = {
  layers: PropTypes.object,
  controls: PropTypes.bool,
  padding: PropTypes.object,
};

MapViewer.defaultProps = {
  layers: {},
  controls: true,
  padding: {},
};

export default MapViewer;
