// Pairs: [percentage, area]
const firstLevel = [17, 28];
const secondLevel = [16, 27];
const thirdLevel = [15, 14];

// Label to name the graph
const title = 'Ecosistemas en lista roja dentro del área de interés';
const noEndanger = 'Área sin amenaza identificada';

// Label to first area in the graph
const firstLevelLabel = 'Área con amenaza';

const redListColors = [
  { name: 'CR', value: 10, label: 'CR: Critically Endangered' }, // value: '#b3433b'
  { name: 'EN', value: 15, label: 'EN: Endangered' }, // value: '#FB6A2A'
  { name: 'VU', value: 20, label: 'VU: Vulnerable' }, // value: '#dea857'
];

const getColor = (name) => redListColors.find((c) => name.includes(c.name)).value;

const formatData = (data) => {
  // Adding column titles
  data.unshift(['Indicador', 'Padre', 'Area', 'Color']);
  // Guarantee order with "empty" elements. Minimum value: 0.00001
  redListColors.forEach((color) => {
    if (!data.find((item) => item[3] === color.value)) {
      data.push(
        [
          color.name,
          firstLevelLabel,
          0.00001,
          color.value,
        ],
      );
    }
  });
  return data;
};

const TreeMapChartData = (rawData, totalArea) => {
  /* First level */
  const focusedArea = Number(rawData[firstLevel[1]][0].indicator_value);
  const dataTransformed = [
    [{ v: title, f: title }, null, focusedArea, 0],
    [{ v: noEndanger, f: noEndanger }, title, totalArea - focusedArea, 0],
    [{ v: firstLevelLabel, f: firstLevelLabel }, title, focusedArea, 0],
  ];
  /* Second level */
  const threatAreas = rawData[secondLevel[1]].map((item) => ({
    name: item.value_description,
    value: item.indicator_value,
  }));
  threatAreas.forEach((data) => {
    const id = redListColors.find((c) => c.name === data.name);
    dataTransformed.push([
      { v: data.name, f: id.label },
      firstLevelLabel,
      Number(data.value),
      getColor(data.name),
    ]);
  });
  /* Third level */
  rawData[thirdLevel[1]].map((item) => {
    redListColors.forEach((color) => {
      if (item.value_description.includes(`${color.name}:`)) {
        dataTransformed.push(
          [
            { v: item.value_description, f: item.value_description },
            dataTransformed.find((element) => element[0].v.includes(color.name))[0],
            Number(item.indicator_value),
            color.value,
          ],
        );
      }
    });
    return true;
  });

  const response = formatData(dataTransformed);
  return { results: response, groups: 1 };
};

export default TreeMapChartData;
