//LineChart Class
class LineChart{
  constructor(_parentElement){
    this.parentElement = _parentElement;
    this.initVis();
    }

  initVis(){
    let vis = this;

    vis.formattedData = new Map();


    vis.margin = { left:80, right:100, top:50, bottom:100 };
    vis.height = 500 - vis.margin.top - vis.margin.bottom;
    vis.width = 800 - vis.margin.left-vis.margin.right;

    //set an svg in our vis-#container
    vis.svg = d3.select(vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left+vis.margin.right)
      .attr("height", vis.height+vis.margin.top+vis.margin.bottom);

    //set our g element
    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

    //time parse for x-scale
    vis.parseTime = d3.timeParse("%d/%m/%Y");

    vis.firstDate  = vis.parseTime("12/05/2013");
    vis.lastDate = vis.parseTime("31/10/2017");

    //format yticks
    vis.formatSi = d3.format(".2s")

    //for tooltip
    vis.bisectDate = d3.bisector(d=>d.date).left;

    //scales
    vis.x = d3.scaleTime().range([0,vis.width]);
    vis.y = d3.scaleLinear().range([vis.height,0]);

    //axis generators
    vis.xAxisCall = d3.axisBottom()
    vis.yAxisCall = d3.axisLeft()
      .ticks(6)
      .tickFormat(d=>`${vis.formatSi(d)}`);

    //Axis groups
    vis.xAxis = vis.g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${vis.height})`);

    vis.yAxis = vis.g.append("g")
      .attr("class", "y axis")

    //Y-Axis label
    vis.yAxisLabel = vis.yAxis.append("text")
      .attr("class", "axes-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("fill", "#5D6971");

    vis.yAxisOptions = new Map()
      .set("price_usd", "Price in dollars ($)")
      .set("market_cap", "Market Capitaslization ($)")
      .set("24h_vol", "24 hour trading volume ($)");

    //Line path generator

    vis.myline =  vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "3px")

  //---tooltip--//
    vis.focus = vis.g.append("g")
      .attr("class", "focus")
      .style("display", "none");

    vis.focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", vis.height);

    vis.focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", vis.width);

    vis.focus.append("circle")
      .attr("r", 7.5);

    vis.focus.append("text")
      .attr("x", 15)
      .attr("dy", ".31em");


    vis.wrangleData();
      }
  
  wrangleData(){
    let vis = this;

    vis.coin = document.getElementById("coin-select").value;
    vis.variable = document.getElementById("var-select").value;
    vis.yAxisLabel.text(vis.yAxisOptions.get(vis.variable));

    vis.firstDate = vis.parseTime(document.getElementById("dateLabel1").innerText);
    vis.lastDate = vis.parseTime(document.getElementById("dateLabel2").innerText);

    vis.data = formattedData.get(vis.coin).filter(d=>{
      return (d.date>=vis.firstDate)&(d.date<=vis.lastDate);
    })


    vis.updateVis();
    }

  updateVis(){
    let vis = this;
    
    //set scale domains
    vis.x.domain(d3.extent(vis.data, d=>d.date));
    vis.y.domain([
      0,
      d3.max(vis.data, d=> d[vis.variable])*1.005
    ]);

    //generate axes once scales have been set
    vis.xAxis.call(vis.xAxisCall.scale(vis.x));
    vis.yAxis.call(vis.yAxisCall.scale(vis.y));

    vis.line = d3.line()
      .x(d=>vis.x(d.date))
      .y(d=>vis.y(d[vis.variable]));
    //Add line to chart
    vis.myline.transition()
      .ease(d3.easeLinear)
      .duration(200)
      .attr("d", vis.line(vis.data));

    vis.g.append("rect")
      .attr("class", "overlay")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .on("mouseover",function(){vis.focus.style("display", null);})
      .on("mouseout", function(){vis.focus.style("display", "none");})
      .on("mousemove", mousemove);

    function mousemove(){
      let x0 = vis.x.invert(d3.mouse(this)[0]);
      let i = vis.bisectDate(vis.data, x0, 1);
      let d0 = vis.data[i-1];
      let d1 = vis.data[i];
      let d = x0-d0.date >d1.date-x0 ? d1 : d0;
      vis.focus.attr("transform", `translate(${vis.x(d.date)}, ${vis.y(d[vis.variable])})`);
      vis.focus.select("text").text(vis.formatSi(d[vis.variable]));
      vis.focus.select(".x-hover-line").attr("y2", vis.height-vis.y(d[vis.variable]));
      vis.focus.select(".y-hover-line").attr("x2", -vis.x(d.date));
      }

    }
  
}




