let time;
let formattedData = new Map();
let coin = document.getElementById("coin-select").value;
let variable;


let margin = { left:80, right:100, top:50, bottom:100 };
let height = 500 - margin.top - margin.bottom;
let width = 800 - margin.left-margin.right;

//set an svg in our vis-#container
let svg = d3.select("#chart-area").append("svg")
  .attr("width", width + margin.left+margin.right)
  .attr("height", height+margin.top+margin.bottom);

//set our g element
let g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//time parse for x-scale
let parseTime = d3.timeParse("%d/%m/%Y");


//format yticks
let formatSi = d3.format(".2s")

//for tooltip
let bisectDate = d3.bisector(d=>d.date).left;

//scales
let x = d3.scaleTime().range([0,width]);
let y = d3.scaleLinear().range([height,0]);

//axis generators
let xAxisCall = d3.axisBottom()
let yAxisCall = d3.axisLeft()
  .ticks(6)
  .tickFormat(d=>`${formatSi(d)}`);

//Axis groups
let xAxis = g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`);

let yAxis = g.append("g")
  .attr("class", "y axis")

//Y-Axis label
let yAxisLabel = yAxis.append("text")
  .attr("class", "axes-title")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .attr("fill", "#5D6971");

let yAxisOptions = new Map()
  .set("price_usd", "Price in dollars ($)")
  .set("market_cap", "Market Capitaslization ($)")
  .set("24h_vol", "24 hour trading volume ($)");

//Line path generator

let myline =  g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px")

//load data
d3.json("data/coins.json")
  .then(main)
  .catch(error=>console.log(error));


function main(data){
  console.log(data);
  
  for (let [coin, arr] of Object.entries(data)){
    console.log(arr);
    formattedData.set(coin,
      arr.filter(d=>([d["24h_vol"] , d.price_usd, d.market_cap].every(x=>x) ))
      .map(d=>{
        d["date"]= parseTime(d["date"])
        d["24h_vol"]=+d["24h_vol"];
        d["price_usd"]=+d["price_usd"];
        d["market_cap"]=+d["market_cap"];
        return d;
        })
    );
    
  };

  console.log(formattedData);


  update(formattedData.get(coin));
}

function update(data){

  variable = document.getElementById("var-select").value;
  yAxisLabel.text(yAxisOptions.get(variable));
  //set scale domains
  x.domain(d3.extent(data, d=>d.date));
  y.domain([
    0,
    d3.max(data, d=> d[variable])*1.005
  ]);

  //generate axes once scales have been set
  xAxis.call(xAxisCall.scale(x));
  yAxis.call(yAxisCall.scale(y));

  console.log(variable);
  let line = d3.line()
    .x(d=>x(d.date))
    .y(d=>y(d[variable]));
  //Add line to chart
  myline.transition()
    .ease(d3.easeLinear)
    .duration(500)
    .attr("d", line(data));

g.append("rect")
  .attr("class", "overlay")
  .attr("width", width)
  .attr("height", height)
  .on("mouseover",function(){focus.style("display", null);})
  .on("mouseout", function(){focus.style("display", "none");})
  .on("mousemove", mousemove);

function mousemove(){
  let x0 = x.invert(d3.mouse(this)[0]);
  let i = bisectDate(data, x0, 1);
  let d0 = data[i-1];
  let d1 = data[i];
  let d = x0-d0.date >d1.date-x0 ? d1 : d0;
  focus.attr("transform", `translate(${x(d.date)}, ${y(d[variable])})`);
  focus.select("text").text(formatSi(d[variable]));
  focus.select(".x-hover-line").attr("y2", height-y(d[variable]));
  focus.select(".y-hover-line").attr("x2", -x(d.date));
  }

}
//------------ tooltip code --------------------------//

let focus = g.append("g")
  .attr("class", "focus")
  .style("display", "none");

focus.append("line")
  .attr("class", "x-hover-line hover-line")
  .attr("y1", 0)
  .attr("y2", height);

focus.append("line")
  .attr("class", "y-hover-line hover-line")
  .attr("x1", 0)
  .attr("x2", width);

focus.append("circle")
  .attr("r", 7.5);

focus.append("text")
  .attr("x", 15)
  .attr("dy", ".31em");


//----------coin-select----------//

document.getElementById("coin-select")
  .addEventListener("change", function(){
    coin = this.value;
    update(formattedData.get(coin));
    });


//----------var-select----------//

document.getElementById("var-select")
  .addEventListener("change", function(){
    update(formattedData.get(coin));
});


