import ColumnChartData from './ColumnChartData';
import TreeMapChartData from './TreeMapChartData';
import BarChartData from './BarChartData';
import SankeyChartData from './SankeyChartData';

class GraphData {
  static prepareData(code, rawData, order, totalArea) {
    switch (code) {
      case 1:
        return ColumnChartData.prepareData(rawData, order);
      case 2:
        return SankeyChartData.prepareData(rawData);
      case 3:
        return TreeMapChartData(rawData, totalArea);
      case 4:
        return BarChartData.prepareData(rawData);
      default:
        return { results: rawData, groups: 1 };
    }
  }

  /**
   * Return correct graph type based on card code
   *
   * @param {string} code Indicator card code to find graph type
   */
  static validGraphType = (code) => {
    let validGraphType = null;
    switch (code) {
      case 1:
        validGraphType = 'ColumnChart';
        break;
      case 2:
        validGraphType = 'Sankey';
        break;
      case 3:
        validGraphType = 'TreeMap';
        break;
      case 4:
        validGraphType = 'BarChart';
        break;
      default:
        validGraphType = 'BarChart';
        break;
    }
    return { validGraphType };
  };
}

export default GraphData;
