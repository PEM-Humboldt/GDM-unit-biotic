/** eslint verified */
import React from 'react';
import { BarStackHorizontal } from '@vx/shape';
import { Group } from '@vx/group';
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';
import { withTooltip, TooltipWithBounds } from '@vx/tooltip';
import { localPoint } from '@vx/event';

const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/**
 * Function to render tooltip inside the graph
 *
 * @param {string} event event on graph
 * @param {string} datum value to show inside tooltip
 * @param {function} showTooltip parameters to locate tooltip box. See withTooltip for more docs.
 */
const handleMouseOver = (event, datum, showTooltip) => {
  const coords = localPoint(event.target.ownerSVGElement, event);
  showTooltip({
    tooltipLeft: coords.x,
    tooltipTop: coords.y,
    tooltipData: datum,
  });
};

export default withTooltip(
  ({
    colors,
    dataJSON,
    subtitle,
    width,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
    units,
    margin = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  }) => {
    if (width < 10) return null;
    // accessors
    const y = () => 1;

    const colorsCodes = scaleOrdinal({
      domain: Object.keys(dataJSON),
      range: colors,
    });

    const prepareData = (data) => {
      const transformedData = {};
      data.forEach((item) => {
        transformedData[item.name] = `${item.area || item.percentage}`;
      });
      return transformedData;
    };

    const data = [prepareData(dataJSON)];
    const keys = Object.values(dataJSON).map((item) => item.name);
    const totals = dataJSON.reduce((total, current) => total
      + parseFloat(current.area || current.percentage), 0);
    const userColors = colorsCodes || dataJSON.map((item) => item.color);

    // bounds
    const xMax = width - margin.left - margin.right;
    const yMax = 25;

    // scales
    const xScale = scaleLinear({
      rangeRound: [0, xMax],
      domain: [0, totals], // TODO: Cambiar "0" por funcion min de d3-array
      nice: false,
    });
    const yScale = scaleBand({
      rangeRound: [yMax, 0],
      domain: data.map(y),
      padding: 0.1,
    });

    let tooltipTimeout;

    return (
      <div>
        <div className="smgraphtitle">
          {subtitle}
        </div>
        <svg width={width - 15} height={25}>
          <Group top={margin.top} left={margin.left}>
            {`${Number((0.20 * 100).toFixed(2))} % `}
            <BarStackHorizontal
              color={userColors}
              data={data}
              keys={keys}
              width={xMax}
              height={yMax}
              y={y}
              xScale={xScale}
              yScale={yScale}
              // TODO: onClick should highlight area selected on the map
              onMouseLeave={() => () => {
                tooltipTimeout = setTimeout(() => {
                  hideTooltip();
                }, 300);
              }}
              onMouseMove={(dataSelected) => (e) => {
                const value = Object.values(dataJSON)
                  .filter((item) => (item.key || item.type) === dataSelected.key);
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                handleMouseOver(e, value, showTooltip);
              }}
            />
          </Group>
        </svg>
        {tooltipOpen && (tooltipData[0].key !== '' || tooltipData[0].type) && (
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              minWidth: 60,
              backgroundColor: 'rgba(42,42,42,0.9)',
              color: 'white',
              padding: 5,
              lineHeight: '1.5',
            }}
          >
            <div style={{ color: '#e84a5f' }}>
              <strong>
                {tooltipData[0].key || tooltipData[0].type}
              </strong>
            </div>
            <div>
              {`${numberWithCommas(Number(tooltipData[0].area).toFixed(2))} ha`}
              <br />
              {`${numberWithCommas(Number(tooltipData[0].percentage * 100).toFixed(2))} ${units}`}
            </div>
          </TooltipWithBounds>
        )}
      </div>
    );
  },
);
