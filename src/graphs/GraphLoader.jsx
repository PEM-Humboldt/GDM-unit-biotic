import React from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import SmallBarStackGraph from './SmallBarStackGraph';
import GColumnChart from './GColumnChart';

const tooltipGen = (data) => (row, size) => `
    <div class='tm_tooltip'>
      ${data[row][0].v}
      <br />
      <b>${Number(size).toFixed(2)}</b>
    </div>
  `;

/**
 * Allow to select one of the available graphs
 *
 * @param {string}  graphType graph types name,
 *  this param validates which graph to render

  * @param {object}  data values to render,
  * @param {string}  labelX information showed in the graph label X,
  * @param {string}  labelY information showed in the graph label Y,
  * @param {string}  graphType Type of graph to render,
  * @param {boolean} showHelper allow render graph with helper text,
  * @param {string}  title title to render if the selected graph allows it,
  * @param {string}  subtitle subtitle to render if the selected graph allows it,
  * @param {array}   colors color palette to sort elements inside the graph
  * @param {string}  units information showed in the graph,
  * @param {number}  width dynamic width sent by parent component,
  * @param {number}  height dynamic height sent by parent component,
  * @param {number}  padding to determine chart padding
  * @param {number}  options object with extra options to pass to graph
  * @param {boolean} withTooltip boolean to determine if tooltip should be shown
 */
const GraphLoader = ({
  data,
  labelX,
  labelY,
  graphType,
  title,
  subtitle,
  colors,
  units,
  width,
  height,
  padding,
  options,
  withTooltip,
  dataGroups,
  showHelper,
}) => {
  let graph = ('');
  switch (graphType) {
    case 'SmallBarStackGraph':
      graph = (
        <SmallBarStackGraph
          dataJSON={data}
          colors={colors}
          title={title}
          subtitle={subtitle}
          labelX={labelX}
          labelY={labelY}
          width={width}
          height="150"
          units={units}
        />
      );
      break;
    case 'ColumnChart':
      graph = (
        <GColumnChart
          data={data}
          width={width}
          height={height}
          loader={<div>Cargando...</div>}
          labelY={labelY}
          padding={padding}
          options={{
            ...options,
            colors,
          }}
          withTooltip={withTooltip}
          dataGroups={dataGroups}
          title={title}
        />
      );
      break;
    case 'BarChart':
      graph = (
        <Chart
          width={width}
          height={height}
          chartType="BarChart"
          loader={<div>Loading Chart</div>}
          data={data}
          options={{
            legend: { position: 'bottom', maxLines: 5 },
            chartArea: { width: '70%' },
            isStacked: true,
            colors,
          }}
          // For tests
          rootProps={{ 'data-testid': '3' }}
        />
      );
      break;
    case 'Sankey':
      graph = (
        <Chart
          className="p30"
          width={width}
          height={height}
          chartType="Sankey"
          loader={<div>Loading Chart</div>}
          data={data}
          options={{
            sankey: {
              node: { colors },
            },
            chartArea: { width: '70%' },
            chart: {
              title,
              subtitle,
            },
          }}
          rootProps={{ 'data-testid': '1' }}
        />
      );
      break;
    case 'TreeMap': {
      const tooltipData = Array.from(data);
      tooltipData.shift();
      graph = (
        <div>
          <Chart
            className="p30"
            width={width}
            height={height}
            chartType="TreeMap"
            loader={<div>Loading Chart</div>}
            data={data}
            options={{
              minColor: '#d1c6c5',
              midColor: '#b3433b',
              maxColor: '#dea857',
              headerHeight: 15,
              fontColor: '#302a23',
              showScale: false,
              showTooltips: true,
              generateTooltip: tooltipGen(tooltipData),
            }}
            rootProps={{ 'data-testid': '1' }}
          />
          {showHelper ? (
            <p className="p10">
            Haz click derecho para disminuir el zoom
            </p>
          ) : ''}
        </div>
      );
      break;
    }
    default:
      break;
  }
  return (
    <div className="graph">
      {graph}
    </div>
  );
};

GraphLoader.propTypes = {
  colors: PropTypes.array,
  // Array or object, depending on graphType
  data: PropTypes.any.isRequired,
  dataGroups: PropTypes.number,
  graphType: PropTypes.string.isRequired,
  height: PropTypes.number,
  showHelper: PropTypes.bool,
  labelX: PropTypes.string,
  labelY: PropTypes.string,
  options: PropTypes.object,
  padding: PropTypes.number,
  subtitle: PropTypes.string,
  title: PropTypes.string,
  units: PropTypes.string,
  width: PropTypes.number,
  withTooltip: PropTypes.bool,
};

GraphLoader.defaultProps = {
  colors: [
    '#003d59', '#5a1d44', '#902130', '#6d819c', '#db9d6b', '#fb9334', '#fe6625', '#ab5727',
    '#44857d', '#167070',
  ],
  dataGroups: 1,
  height: null,
  showHelper: false,
  labelX: '',
  labelY: '',
  options: {},
  padding: 0,
  subtitle: '',
  title: '',
  units: 'ha',
  width: null,
  withTooltip: true,
};

export default GraphLoader;
