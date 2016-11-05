// Importing select library from the d3 package.

import { select, scaleLinear, scaleBand, axisBottom, axisLeft } from 'd3'
require('./../stylesheets/styles.scss');
// Define the SVG dimensions.
const margin = {
  top: 25,
  right: 75,
  bottom: 25,
  left: 25
}
const height = 310;
const width = 650;
// Use the select library to transform the DOM by selecting our node and appending a new SVG one with certain modifications
const svg = select('#grouped-bar') // Using the id of the div in our html template
    .append('svg')
    .attr('class', 'grouped-bars-svg')
    .attr('height', height)
    .attr('width', width)
    .style('background', '#fff');
// Create an object with the color mappings rating_key => color
const colors = {
  all: '#CFDFA9',
  top: '#F2DA8E',
  audience: '#EA9485'
}
// Append a g element into our SVG
const main = svg.append('g')
  .attr('class', 'grouped-bars-main-group')
  .attr('transform', `translate(${margin.left},${margin.top})`);
// Make a request to obtain our dataset
fetch('https://s3-us-west-2.amazonaws.com/data.kryptophsky.com/01-grouped-bar-charts-d3/movies.json')
  .then(res => { return res.json() })
  .then(renderGraph)
  .catch(err => { console.log('Error...', err) });

function renderGraph(data) {
  const xDomain = data.map(movie => { return movie.key });
  const xScale = scaleBand().domain(xDomain);
  xScale.range([0, width - margin.left - margin.right]);
  const yScale = scaleLinear().domain([0, 100]);
  yScale.range([height - margin.top - margin.bottom, 0]);
  const ratingsScale = scaleBand().domain(['all', 'top', 'audience']);
  ratingsScale.range([0, xScale.bandwidth()]);
  ratingsScale.round(true).paddingInner(0.15).paddingOuter(0.95);

  const xAxis = axisBottom(xScale);
  const yAxis = axisLeft(yScale);
  const yGrid = axisLeft(yScale).tickSize(-width + margin.left + margin.right);

  main.append('g')
    .attr('class', 'grouped-bar-chart grid y-grid')
    .attr('transform', `translate(0, 0)`)
    .call(yGrid)
    .selectAll('text')
    .remove();

  main.append('g')
    .attr('class', 'grouped-bar-chart axis x-axis')
    .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
    .call(xAxis);

  main.append('g')
    .attr('class', 'grouped-bar-chart axis y-axis')
    .attr('transform', `translate(0, 0)`)
    .call(yAxis);

  const labelsArr = [
    { key: 'all', name: 'All Critics' },
    { key: 'top', name: 'Top Critics' },
    { key: 'audience', name: 'Audience' }
  ];

  const labels = main.append('g')
    .attr('class', 'grouped-bar-chart labels-container')
    .attr('transform', `translate(${width - margin.left - margin.right}, 0)`)
    .selectAll('.label-container')
    .data(labelsArr)
    .enter()
    .append('g')
    .attr('class', label => { return `label-container label-container--${dasherize(label.key)}`})

  labels.append('rect')
    .attr('fill', label => { return colors[label.key]; })
    .attr('width', 10)
    .attr('height', 10)
    .attr('transform', (label, index) => {
      return `translate(5, ${index * 20})`
    })

  labels.append('text')
    .attr('transform', (label, index) => {
      return `translate(18, ${index * 20})`
    })
    .attr('dy', '.75em')
    .attr('font-size', '12px')
    .text(label => { return label.name })


  const dataContainer = main.append('g')
    .attr('class', 'grouped-bar-chart data-container');

  const movies = dataContainer.selectAll('.movie-container')
    .data(data)
    .enter()
    .append('g')
    .attr('class', movie => {
      return `movie-container movie-container--${dasherize(movie.key)}`
    })
    .attr('transform', movie => {
      const offset = xScale(movie.key);
      return `translate(${offset}, 0)`;
    });

  const ratings = movies.selectAll('.rating-container')
    .data(movie => { return movie.values; })
    .enter()
    .append('g')
    .attr('class', movie => { return `rating-container rating-container--${dasherize(movie.key)}`})
    .append('rect')
    .attr('height', rating => {
      const h = height - margin.top - margin.bottom;
      return h - yScale(rating.value);
    })
    .attr('width', ratingsScale.bandwidth())
    .attr('transform', rating => {
      const offset = ratingsScale(rating.key);
      return `translate(${offset}, ${yScale(rating.value)})`;
    })
    .attr('fill', rating => { return colors[rating.key] });

  const interaction = movies.selectAll('.rating-interaction')
    .data(movie => { return [movie] })
    .enter()
    .append('g')
    .attr('class', movie => { return `rating-interaction rating-interaction--${dasherize(movie.key)}`})
    .append('rect')
    .attr('height', rating => {
      return height - margin.top - margin.bottom;
    })
    .attr('width', xScale.bandwidth())
    .attr('fill', 'rgba(0,0,0,0)');
}

function dasherize(str) {
  return str.trim().replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
};
