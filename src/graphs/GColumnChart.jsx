import React from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';

class GColumnChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      chart: null,
    };
  }

  componentDidUpdate() {
    const { loaded } = this.state;
    if (loaded) this.draw();
  }

  draw = () => {
    const { google, chart } = this.state;
    const {
      data,
      width,
      height,
      padding,
      options,
      withTooltip,
      dataGroups,
    } = this.props;
    // eslint-disable-next-line new-cap
    const chartData = new google.visualization.arrayToDataTable(data);

    const isStacked = dataGroups > 1;
    const series = {};
    if (dataGroups > 1) {
      let index = 0;
      for (let target = 0; target <= dataGroups; target += 1) {
        for (let i = 0; i < dataGroups; i += 1) {
          series[index] = { targetAxisIndex: target };
          index += 1;
        }
      }
    }

    const fullOptions = {
      width: width - (padding * 2),
      height: height - (padding * 2),
      isStacked,
      tooltip: { trigger: 'none' },
      vAxes: {
        0: { title: dataGroups > 1 ? 'Hectáreas' : 'Índice' },
        1: {
          gridlines: { color: 'transparent', count: 0 },
          textStyle: { color: 'transparent' },
        },
        2: {
          gridlines: { color: 'transparent', count: 0 },
          textStyle: { color: 'transparent' },
        },
      },
      series,
      ...options,
    };
    if (withTooltip) {
      fullOptions.hAxis = { textStyle: { fontSize: 0 }, titleTextStyle: { fontSize: 12 } };
    }
    chart.draw(chartData, google.charts.Bar.convertOptions(fullOptions));
    google.visualization.events.addListener(chart, 'error', (err) => {
      google.visualization.errors.removeError(err.id);
    });
    google.visualization.events.addListener(chart, 'onmouseover', () => {
      if (!withTooltip) {
        // eslint-disable-next-line no-undef
        document.querySelectorAll('[id^=chart] g:last-of-type').forEach((elem) => {
          // eslint-disable-next-line no-param-reassign
          elem.style.display = 'none';
        });
      }
    });
  }

  render = () => {
    const { loaded } = this.state;
    const { padding, loader, title } = this.props;
    let html = null;
    if (!loaded) {
      html = (
        <Script
          url="https://www.gstatic.com/charts/loader.js"
          onLoad={() => {
            // eslint-disable-next-line no-undef
            const { google } = window;
            google.charts.load('current', { packages: ['corechart', 'bar'] });
            google.charts.setOnLoadCallback(() => {
              this.setState({
                loaded: true,
                google,
                // eslint-disable-next-line no-undef
                chart: new google.charts.Bar(document.getElementById(`chart-${title}`)),
              });
            });
          }}
        />
      );
    }
    return (
      <div>
        {html}
        <div id={`chart-${title}`} style={{ padding }}>{loader}</div>
      </div>
    );
  }
}


GColumnChart.propTypes = {
  data: PropTypes.any.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  padding: PropTypes.number,
  loader: PropTypes.element,
  options: PropTypes.object,
  withTooltip: PropTypes.bool,
  dataGroups: PropTypes.number,
  title: PropTypes.string,
};

GColumnChart.defaultProps = {
  width: null,
  height: null,
  padding: 0,
  loader: 'Cargando...',
  options: {},
  withTooltip: true,
  dataGroups: 1,
  title: Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5),
};

export default GColumnChart;
