//////References
//https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php
//http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
//https://www.d3-graph-gallery.com/graph/choropleth_basic.html
//http://using-d3js.com/04_05_sequential_scales.html
//http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
//https://docs.mapbox.com/help/tutorials/markers-js/
// https://github.com/d3/d3-3.x-api-reference/blob/master/Geo-Paths.md
//https://docs.mapbox.com/help/tutorials/choropleth-studio-gl-pt-2/
//https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/

let objects

// Loading geojson countries       
d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
  .then((geojson) => {
    // Asynchronous JavaScript waiting for data promise to complete before moving on to .then() 
    if (geojson.features) {
      console.log('Number of features:', geojson.features.length)
      objects = geojson
    }
    //access token
    mapboxgl.accessToken = 'pk.eyJ1IjoicmVhZHlsZXRzZ28iLCJhIjoiY2t0dTR2aGNjMXd3bDJubWgwcWwzcWJzMyJ9.4Qpfc2HBPT14KIrBhX0XGQ'

    // https://www.mapbox.com/mapbox-gl-js/api/#map
    let map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: [10, 25], // long, lat
      zoom: 1.55
    })

    /*** load data all earthquakes ***/
    async function loadData() {
      const earthquakeAll = await d3.csv('all_week.csv');
      // add markers to map
      earthquakeAll.forEach(function(d) {

        const width = d.mag * 5;
        const height = d.mag * 5;

        // create a HTML element for each feature
        var all = document.createElement('div');
        all.className = 'markerAll';
        all.style.width = `${width}px`;
        all.style.height = `${height}px`;


        // make a marker for each feature and add to the map
        new mapboxgl.Marker(all)
          .setLngLat([d.longitude, d.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<h2>' + 'Place: ' + d.place + '</h2>' + '</br>' + '<h3>' + 'Magnitude: ' + d.mag + '</h3>' + '</br>' + '<h3>' + 'Time: ' + d.time + '</h3>'))
          .addTo(map);

      });
    }

    loadData();


    // select mapbox container 
    let container = map.getCanvasContainer()

    //add svg
    let svg = d3.select(container).append('svg')

    function projectPoint(lon, lat) {
      let point = map.project(new mapboxgl.LngLat(lon, lat))
      this.stream.point(point.x, point.y)
    }

    var myColor = d3.scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(d3.schemeGreens[7]);


    let transform = d3.geoTransform({ point: projectPoint })
    let path = d3.geoPath().projection(transform)

    let featureElement = svg
      .selectAll('path')
      .data(geojson.features)
      // d3 data joins https://observablehq.com/@d3/selection-join
      .join('path')
      .attr('d', d3.geoPath().projection(transform))
      .attr('stroke', 'none')
      .attr("fill", function(d) {
        return myColor(d.properties.pop_est)
      })
      .attr('fill-opacity', 0.5)
      .on('mouseover', function(d) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/srcElement
        console.log(d.srcElement.__data__)
        d3.select(this).attr('fill', 'PowderBlue')
        //add hover to name
        d3.select('#hover')
          .text(d.srcElement.__data__.properties.name + ' has a population of ' + (d.srcElement.__data__.properties.pop_est / 1000000).toFixed(1) + ' M')
        d3.select('#hover').attr('fill-opacity', 1)
      })
      .on('mouseout', function(d) {
        d3.select(this).attr("fill", function(d) {
          return myColor(d.properties.pop_est)
        })
        d3.select('#hover').attr('fill-opacity', 0)
      })
      .on('mousemove', (d) => {

        d3.select('#hover')
          .attr('x', () => { return d3.pointer(d)[0] + 20 })
          .attr('y', () => { return d3.pointer(d)[1] + 10 })
      })

    // add hover label text        
    svg.append('text')
      .attr('id', 'hover')

    // sync map views and scales on reset
    let update = () => {
      featureElement.attr('d', path)
    }

    // manage layer visibility during map interactions
    map.on('viewreset', update)

    map.on('movestart', () => {
      svg.classed('hidden', true)
    })

    map.on('rotate', () => {
      svg.classed('hidden', true)
    })

    map.on('moveend', () => {
      update()
      svg.classed('hidden', false)
    })
  })

/////create a legend/////////////////////////////////////////


// define layer names
const layers = [
  'less than 1M',
  '1M-10M',
  '10M-30M',
  '30M-100M',
  '100M-500M',
  '500M+'
];
const colors = [
  '#edf8e9',
  '#c7e9c0',
  '#a1d99b',
  '#74c476',
  '#31a354',
  '#006d2c'
];

// create legend
const legend = document.getElementById('legend');

layers.forEach((layer, i) => {
  const color = colors[i];
  const item = document.createElement('div');
  const key = document.createElement('span');
  key.className = 'legend-key';
  key.style.backgroundColor = color;

  const value = document.createElement('span');
  value.innerHTML = `${layer}`;
  item.appendChild(key);
  item.appendChild(value);
  legend.appendChild(item);
});

map.getCanvas().style.cursor = 'default';
