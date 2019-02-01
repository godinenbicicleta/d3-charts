//D3 margin convention
let margin = {top:20, right:10, bottom:150, left:100};

let width = 960 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let svg = d3.select("#vis-container")
  .append("svg")
  .attr( "width", width + margin.left + margin.right )
  .attr( "height", height + margin.top + margin.bottom )

let g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

let gLabels = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

d3.json("data/buildings.json")
  .then(main)
  .catch(error=>{console.log(error);});

function main(data){
  console.log(data);
  for (let d of data){
    d.height = +d.height;
    }

  let maxH = d3.max(data, d=>{return d.height;})

  //set x scale:

  let x = d3.scaleBand()
    .domain(data.map(d=>{return d.name;}))
    .range([0,width])
    .paddingInner(0.3)
    .paddingOuter(0.3);

  let y = d3.scaleLinear()
    .domain([0,maxH])
    .range([height,0])

  let color = d3.scaleSequential()
    .domain(d3.extent(data, d=>{return d.height;}))
    .interpolator(d3.interpolatePurples)

  let rects = g.selectAll("rect")
    .data(data)

  let leftAxis = d3.axisLeft(y)
    .ticks(3)
    .tickFormat(d=>{return `${d}m`});

  let bottomAxis = d3.axisBottom(x);


  //call to left axis
  g.append("g")
    .attr("class", "left axis")
    .call(leftAxis);

  //call to bottom axis
  g.append("g")
    .attr("class", "bottom axis")
    .attr("transform", `translate(0,${height})`)
    .call(bottomAxis)
    .selectAll("text")
      .attr("y", "10")
      .attr("x","-5")
      .attr("text-anchor","end")
      .attr("transform", "rotate(-40)");

  //label bottom axis
  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width/2)
    .attr("y", height+140)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("World's tallest buildings");

  //label left axis
  g.append("text")
    .attr("class", "y axis-label")
    .attr("x",-(height/2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("transform", "rotate(-90)")
    .text("Height (m)");

  rects.enter()
    .append("rect")
    .attr("x", d=>{return x(d.name);})
    .attr("y", d=>{return y(d.height);})
    .attr("width", d=>{return x.bandwidth();})
    .attr("height", d=>{return height-y(d.height);})
    .attr("fill", d=> {return color(d.height);})
    .attr("stroke", "black");

  //add labels to the bars
  let labels = gLabels.selectAll("text")
    .data(data)

  labels.enter()
    .append("text")
    .attr("class", "value-label")
    .attr("y", d=>{return y(d.height) + 20;})
    .attr("x", d=>{return x(d.name)+x.bandwidth()/2;})
    .text(d=>{return d.height;})
    .attr("fill", "black")
    .attr("text-anchor", "middle");
}
