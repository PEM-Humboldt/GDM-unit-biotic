/** eslint verified */
import React from 'react';
import PropTypes from 'prop-types';
import { withParentSize } from '@vx/responsive';
import GraphLoader from './GraphLoader';

/**
   * Set the Parent size to render a graph
   *
   * @param {any} data Graph data, it can be null (data hasn't loaded), false (data not available)
   *  or an Object with the data.
   * @param {string} labelX axis X label
   * @param {string} labelY axis Y label
   * @param {string} graph graph type
   * @param {string} title graph title
   * @param {string} subtitle graph title
   * @param {array} colors color palette to sort elements inside the graph
   * @param {string} units to show in axis X
   * @param {number}  width dynamic width sent by parent component,
   * @param {number}  height dynamic height sent by parent component,
   * @param {number}  padding to determine chart padding
   * @param {number}  parentWidth parent width according to vx class
   * @param {number}  parentHeight parent height according to vx class
   * @param {boolean} showHelper used in TreeMapChart, show a helper
   */
const RenderGraph = ({
  data,
  labelX,
  labelY,
  graph,
  title,
  subtitle,
  colors,
  units,
  width,
  height,
  padding,
  parentWidth,
  parentHeight,
  options,
  showHelper,
  withTooltip,
  dataGroups,
}) => {
  // While data is being retrieved
  let errorMessage = null;
  // (data === null) while waiting for response
  if (data === null) errorMessage = 'Cargando información...';
  // (!data) there is not data available
  else if (!data) errorMessage = `Información${title ? ` de ${title}` : ''} no disponible`;
  // (data.length <= 0) if data in not object
  else if (data.length <= 0) errorMessage = 'Información no disponible';
  if (errorMessage) {
    // TODO: ask Cesar to make this message work with his own style
    return (
      <div className="errorData">
        {errorMessage}
      </div>
    );
  }

  return (
    <GraphLoader
      data={data}
      labelX={labelX}
      labelY={labelY}
      graphType={graph}
      title={title}
      subtitle={subtitle}
      colors={colors}
      units={units}
      width={width || parentWidth}
      height={height || parentHeight}
      padding={padding}
      options={options}
      withTooltip={withTooltip}
      dataGroups={dataGroups}
      showHelper={showHelper}
    />
  );
};

RenderGraph.propTypes = {
  labelX: PropTypes.string,
  labelY: PropTypes.string,
  graph: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  colors: PropTypes.array,
  units: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  parentWidth: PropTypes.number.isRequired,
  parentHeight: PropTypes.number.isRequired,
  // Array or object, depending on graphType
  data: PropTypes.any.isRequired,
  padding: PropTypes.number,
  options: PropTypes.object,
  showHelper: PropTypes.bool,
  withTooltip: PropTypes.bool,
  dataGroups: PropTypes.number,
};

RenderGraph.defaultProps = {
  title: '',
  subtitle: '',
  colors: [
    '#003d59', '#5a1d44', '#902130', '#6d819c', '#db9d6b', '#fb9334', '#fe6625', '#ab5727',
    '#44857d', '#167070',
  ],
  labelX: '',
  labelY: '',
  units: 'ha',
  width: null,
  height: null,
  padding: 0,
  options: {},
  showHelper: false,
  withTooltip: true,
  dataGroups: 1,
};

export default withParentSize(RenderGraph);
