class ColumnChartData {
  /**
   * Group data by biome, year and description
   *
   * @param {Array} arr group data to organize
   */
  static preProcessOneBiome(arr) {
    const yearSet = new Set();
    const descriptionSet = new Set();
    const data = {};
    arr.forEach(
      ({
        value_description: description,
        year,
        indicator_value: value,
        id_biome: biomeId,
      }) => {
        yearSet.add(year);
        descriptionSet.add(description);
        if (!data[biomeId]) data[biomeId] = {};
        if (!data[biomeId][year]) data[biomeId][year] = {};
        data[biomeId][year][description] = parseFloat(value);
      },
    );
    return {
      years: yearSet,
      descriptions: descriptionSet,
      groupData: data,
    };
  }

  /**
   * Construct an array to be inserted in the final graph data
   *
   * @param {Array} years
   * @param {Array} descriptions
   * @param {Object} data
   */
  static constructOneBiome(years, descriptions, data) {
    const row = [];
    years.forEach((year) => {
      descriptions.forEach((desc) => {
        if (!data[year]) row.push(0);
        else row.push(data[year][desc] ? data[year][desc] : 0);
      });
    });
    return row;
  }

  /**
   * Construct the array of headers for the graph
   * @param {Array} years
   * @param {Array} descriptions
   */
  static headers(years, descriptions) {
    const headers = ['Bioma'];
    years.forEach((year) => {
      descriptions.forEach((desc) => {
        headers.push(descriptions.length === 1 ? `${year}` : `${year} - ${desc}`);
      });
    });
    return headers;
  }

  /**
   * Transform data to a format accepted by google charts to construct a column chart graph
   *
   * @param {Object} rawData object data to be transformed
   */
  static prepareData(rawData, order) {
    if (Array.isArray(rawData)) {
      const {
        years: yearSet,
        descriptions: descriptionSet,
        groupData,
      } = ColumnChartData.preProcessOneBiome(rawData);
      const data = Object.values(groupData)[0];

      const years = Array.from(yearSet).sort();
      const descriptions = Array.from(descriptionSet).sort();
      const results = [ColumnChartData.headers(years, descriptions)];
      results.push([
        rawData[0].name_biome,
        ...ColumnChartData.constructOneBiome(years, descriptions, data),
      ]);
      return { results, groups: descriptionSet.size };
    }
    let yearSet = new Set();
    let descriptionSet = new Set();
    let data = {};
    Object.values(rawData).forEach((arr) => {
      const { years, descriptions, groupData } = ColumnChartData.preProcessOneBiome(arr);
      yearSet = new Set([...yearSet, ...years]);
      descriptionSet = new Set([...descriptionSet, ...descriptions]);
      data = { ...data, ...groupData };
    });

    const years = Array.from(yearSet).sort();
    const descriptions = Array.from(descriptionSet).sort();
    const results = [ColumnChartData.headers(years, descriptions)];

    order.forEach(({ id: biomeId }) => {
      results.push([
        rawData[biomeId][0].name_biome,
        ...ColumnChartData.constructOneBiome(years, descriptions, data[biomeId]),
      ]);
    });

    return { results, groups: descriptionSet.size };
  }
}

export default ColumnChartData;
