
/*
//scaleBand:


let x = d3.scaleBand()
  .domain(["Africa", "N. America", "Europe", "S. America", 
  "Asia", "Australia"])
  .range([0,400])
  .paddingInner(0.3)
  .paddingOuter(0.2);

  console.log(x("S. America"));
  console.log(x("Africa"));
  console.log(x("Australia"));
  console.log(x("N. America"));

  console.log(x.bandwidth());

*/

d3.json("data/buildings.json")
  .then(main)
  .catch(error=>{console.log(error);});

let w = 400;
let h = 400;

let svg = d3.select("#vis-container")
  .append("svg")
  .attr("width", 400)
  .attr("height", 400);


function main(data){
  console.log(data);
  
  for(let d of data){
    d.height = +d.height;
    }

  let maxH = d3.max(data, d=>{return d.height;});
  let domi = data.map(d=>{return d.name;})

  // domi = d3.extent(data, d=>{d.height;})
  console.log(d3.extent(data,d=>{return d.height;}));

  let x = d3.scaleBand()
    .domain(domi)
    .range([0,400])
    .paddingInner(0.5)
    .paddingOuter(0.2);

  let y = d3.scaleLinear()
    .domain([0,maxH])
    .range([0,400]);

  let color = d3.scaleSequential()
    .domain([0,maxH])
    .interpolator(d3.interpolateBlues)

  let rects = svg.selectAll("rect")
    .data(data);

  rects.enter()
    .append("rect")
    .attr("y", d=>{return h-y(d.height);} )
    .attr("x", d=>{return x(d.name);})
    .attr("width", d=>{return x.bandwidth();})
    .attr("height", d=>{return y(d.height);})
    .attr("fill", d=>{return color(d.height);});

}
