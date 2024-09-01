const dataStatistic = [
  {
    id: '0',
    name: 'Video Game Sales',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
    description: 'Top 100 Most Solid Video Games Grouped by Platform'
  },
  {
    id: '1',
    name: 'Movie Sales',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
    description: 'Top 100 Highest Grossing Movies Grouped By Genre'
  },
  {
    id: '2',
    name: 'Kickstarter Campaigns',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
    description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'
  },
]
// work with links 
const links = document.querySelectorAll('.link');
links.forEach((link, i) => {
  link.addEventListener('mouseover', function () {
    this.href = `?query=${i}`;
  })
  link.addEventListener('mouseout', function () { this.href = '#' });
});

// get query from link 
let urlParams = new URLSearchParams(window.location.search);
const dataSet = dataStatistic.find(item => item.id === urlParams.get('query')) || dataStatistic[0];

const padding = 20;
const w = 960;
const h = 700;

// title
const map = d3.select('.map');
const titleMain = map.append('h1').attr('id', 'title');
const descr = map.append('h3').attr('id', 'description');


const svg = map
  .append('svg')
  .attr('width', w + padding * 2)
  .attr('height', h)
  .append('g')
  .attr('transform', 'translate(40, 0)');

const legend = map
  .append('svg')
  .attr('id', 'legend')
  .attr('width', w).attr('height', 100)
  .attr('transform', 'translate(40, 50)');

const tooltip = map
  .append('div')
  .attr('id', 'tooltip')
  .attr('style', 'opacity: 0;');

// get data
d3.json(dataSet.url)
  .then(res => {
    createTreeMap(res);
    titleMain.text(dataSet.name);
    descr.text(dataSet.description)
  }).catch((e) => console.log(e))

// create Map
function createTreeMap(data) {

  const hierarchy = d3
    .hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  const treemap = d3.treemap().size([w, h]);
  const root = treemap(hierarchy);

  const colors = ['#4e409b', '#9E999D', '#F2259C', '#347EB4',
    '#08ACB6', '#91BB91', '#BCD32F', '#75EDB8',
    "#89EE4B", '#AD4FE8', '#D5AB61', '#BC3B3A',
    '#F6A1F9', '#87ABBB', '#5156f0', '#56B870',
    '#FDAB41', '#d6c421'];


  const categories = data.children.map(d => d.name);
  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(colors);


  const cell = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('class', 'group')
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
    .on('mouseover', function (e, d) {
      tooltip
        .attr('data-value', d.data.value)
        .style('opacity', 0.9)
        .style('left', `${e.pageX - 40}px`)
        .style('top', `${e.pageY - 100}px`)
        // .style('transform', `translate(${e.pageX - 40}px, ${e.pageY - 100}px)`)
        .html(`
          <p>Name:  <span>${d.data.name} </span></p> 
          <p>Category:  <span>${d.data.category} </span></p> 
          <p> Value:  <span>${d.data.value} </span></p> 
      `)
    })
    .on('mouseout', () => tooltip.style('opacity', 0));
  // till 
  cell.append('rect')
    .attr('class', 'tile')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('fill', d =>
      d3.interpolateRgb(colorScale(d.data.category), '#fff')(0.5)) // make lightness color
    .attr('stroke', '#ffffff78');

  cell.append('text')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .selectAll('tspan')
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append('tspan')
    .attr('x', 4)
    .attr('y', (_, i) => (i * 10) + 15)
    .text((d, i) => d)
    .attr("style", "font:10px sans-serif;");

  // legend item
  const rect_w = 20;
  const rect_h = 20;
  const space = 5;

  const legendItem =
    legend
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => createCoord(i));

  legendItem.append('rect')
    .attr('class', 'legend-item')
    .attr('width', rect_w)
    .attr('height', rect_h)
    .attr('fill', d =>
      d3.interpolateRgb(colorScale(d), '#fff')(0.5));

  legendItem.append('text')
    .attr('x', rect_w + space)
    .attr('y', rect_h - space)
    .text(d => d)
    .attr("style", "font:12px sans-serif;");

  function createCoord(i) {
    const legendWidth = +legend.attr('width');
    const legendPer = Math.floor(legendWidth / 150);
    const x = i % legendPer * 150;
    const y = Math.floor(i / legendPer) * (rect_h + space);
    return `translate(${x}, ${y})`;
  };

}

