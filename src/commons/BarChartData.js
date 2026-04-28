class BarChartData {
  /**
   * Validate behavior of graph according to id indicator
   *
   * @param {Integer} idIndicator id indicator to be validated
   */
  static validateIndicator(idIndicator) {
    let validIndicator = false;
    let indicatorNamePositive = 'No definido';
    let indicatorNameNegative = 'No definido';

    switch (idIndicator) {
      case 12:
        validIndicator = true;
        indicatorNamePositive = 'Área protegida dentro del bloque (ha)';
        indicatorNameNegative = 'Área protegida fuera del bloque (ha)';
        break;
      case 18:
        validIndicator = true;
        indicatorNamePositive = 'Área de reserva de ley 2da de 1959 dentro del bloque (ha)';
        indicatorNameNegative = 'Área de reserva de ley 2da de 1959 fuera del bloque (ha)';
        break;
      case 20:
        validIndicator = true;
        indicatorNamePositive = 'Área del territorio étnico dentro del bloque (ha)';
        indicatorNameNegative = 'Área del territorio étnico fuera del bloque (ha)';
        break;
      case 22:
        validIndicator = true;
        indicatorNamePositive = 'Área de la ZRC dentro del bloque (ha)';
        indicatorNameNegative = 'Área de la ZRC fuera del bloque (ha)';
        break;
      case 24:
        validIndicator = true;
        indicatorNamePositive = 'Área del ecosistema estrategico dentro del bloque (ha)';
        indicatorNameNegative = 'Área del ecosistema estrategico fuera del bloque (ha)';
        break;
      default:
        validIndicator = false;
        break;
    }

    return { validIndicator, indicatorNamePositive, indicatorNameNegative };
  }

  /**
   * Validate if an indicator is a percentage
   *
   * @param {Integer} idIndicator id indicator to be validated
   */
  static validateValuePercentage(idIndicator) {
    const indicatorMap = {
      12: true,
      18: true,
      20: true,
      22: true,
      24: true,
      13: false,
      19: false,
      21: false,
      23: false,
      25: false,
    };
    return indicatorMap[idIndicator] || false;
  }

  /**
   * Construct an array to be inserted in the transformed graph data
   *
   * @param {Array} rawData
   * @param {String} valueDescription
   */
  static processOneRow(rawData, valueDescription) {
    const row = {
      description: valueDescription,
      value: 0,
      perc: 0,
    };
    const rowComputed = [];
    rawData.forEach((item) => {
      if (item.value_description === valueDescription) {
        if (BarChartData.validateValuePercentage(item.id_indicator)) {
          row.value = Number(parseFloat(item.indicator_value, 10).toFixed(2));
        } else {
          row.perc = Number(parseFloat(item.indicator_value, 10).toFixed(2));
        }
      }
    });
    const desc = row.description;
    const { value, perc } = row;
    let valueTransf = Number(-(((100 - perc) * value) / perc).toFixed(2));
    valueTransf = valueTransf > 0 ? valueTransf : 0;
    rowComputed.push(desc, value, valueTransf);
    return rowComputed;
  }

  /**
   * Transform data to a format accepted by google charts to construct a bar chart graph
   *
   * @param {Object} rawData object data to be transformed
   */
  static prepareData(rawData) {
    const results = [];
    if (Array.isArray(rawData)) {
      rawData.forEach((item) => {
        const {
          indicatorNamePositive,
          validIndicator,
          indicatorNameNegative,
        } = BarChartData.validateIndicator(item.id_indicator);
        if (validIndicator) {
          const row = BarChartData.processOneRow(rawData, item.value_description);
          results.push(['', indicatorNamePositive, indicatorNameNegative]);
          results.push(row);
        }
      });
    }
    return { results, groups: 1 };
  }
}

export default BarChartData;
