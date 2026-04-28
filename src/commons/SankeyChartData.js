class SankeyChartData {
  /**
   * Validate indicator to extract only values
   *
   * @param {Integer} idIndicator id indicator to be validated
   */
  static validateIndicator(idIndicator) {
    const indicatorMap = {
      3: true,
      4: true,
      5: true,
      6: false,
      7: false,
      8: false,
      9: false,
      10: false,
      11: false,
    };
    return indicatorMap[idIndicator] || false;
  }

  static prepareData(rawData) {
    const results = [];
    results.push(['From', 'To', 'Superficie en hectáreas del área protegida']);

    Object.keys(rawData).forEach((item) => {
      Object.values(rawData[item]).forEach((element) => {
        if (SankeyChartData.validateIndicator(element.id_indicator)) {
          const from = element.value_description;
          const to = item;
          const value = Number(parseFloat(element.indicator_value).toFixed(2));
          results.push([from, to, value]);
        }
      });
    });

    return { results, groups: 1 };
  }
}

export default SankeyChartData;
