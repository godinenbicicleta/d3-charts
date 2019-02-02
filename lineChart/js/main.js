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


let firstDate  = parseTime("12/05/2013");
let lastDate = parseTime("31/10/2017");

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
  data = data.filter(d=>{
    return (d.date>=firstDate)&(d.date<=lastDate);
    
    })
  //set scale domains
  x.domain(d3.extent(data, d=>d.date));
  y.domain([
    0,
    d3.max(data, d=> d[variable])*1.005
  ]);

  //generate axes once scales have been set
  xAxis.call(xAxisCall.scale(x));
  yAxis.call(yAxisCall.scale(y));

  let line = d3.line()
    .x(d=>x(d.date))
    .y(d=>y(d[variable]));
  //Add line to chart
  myline.transition()
    .ease(d3.easeLinear)
    .duration(200)
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


//------- date slider ------//

let sliderWidth = 300;
let sliderMargin = {top:10, left:30, right:30, bottom:10};

let sh = 50;
let sw = sliderWidth-sliderMargin.right-sliderMargin.left;



let startDate = parseTime("12/05/2013");
let endDate = parseTime("31/10/2017");

console.log(startDate);
let tScale = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, sw])
    .clamp(true);


let sliderSvg = d3.select("#date-slider")
  .append("svg")
  .attr("class","slider")
  .attr("height",sh)
  .attr("width",sliderWidth)



let slider = sliderSvg.append("g")
  .attr("class", "slider")
  .attr("transform", `translate(${sliderMargin.left},${sh/2})`);

slider.append("line")
  .attr("class", "track")
  .attr("x1", tScale.range()[0])
  .attr("x2", tScale.range()[1]);
/*  .select(function(){return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class", "track-inset")
  .select(function(){return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class", "track-overlay");
    .call(d3.drag()
      .on("start.interrupt", function(){slider.interrupt();})
      .on("start drag", function(){hue(tScale.invert(d3.event.x));}));*/



/*slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", `translate(0,18)`);
  .selectAll("text")
    .data(tScale.ticks(5))
    .enter()
    .append("text")
    .attr("x", tScale)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { console.log(d);return d3.timeFormat("%d/%m/%Y")(d) ; })*/

/*let label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(d3.timeFormat("%d/%m/%Y")(startDate))
    .attr("x",tScale(startDate))
    .attr("transform", "translate(0," + (-15) + ")")*/

let overLine = slider.append("line")
  .attr("class", "track-range")
  .attr("x1", tScale.range()[0])
  .attr("x2", tScale.range()[1]);

let handleStart = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .attr("cx", tScale(startDate))
    .call(d3.drag()
      .on("start.interrupt", function(){handleStart.interrupt();})
      .on("start drag", function(){hueStart(tScale.invert(d3.event.x));})  
    );

let handleEnd = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .attr("cx", tScale(endDate))
    .call(d3.drag()
      .on("start.interrupt", function(){handleEnd.interrupt();})
      .on("start drag", function(){hueEnd(tScale.invert(d3.event.x));})  
    );



function hueStart(h){
    handleStart.attr("cx", tScale(h));

    overLine.attr("x1", tScale(h));

    firstDate = h;
    document.getElementById("dateLabel1").innerText = d3.timeFormat("%d/%m/%Y")(h);
    update(formattedData.get(coin));
  }
function hueEnd(h){
    handleEnd.attr("cx", tScale(h));
    overLine.attr("x2", tScale(h));
    lastDate = h;
    document.getElementById("dateLabel2").innerText = d3.timeFormat("%d/%m/%Y")(h);
    update(formattedData.get(coin));
  }
