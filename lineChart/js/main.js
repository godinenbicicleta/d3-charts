//global variables
let formattedData=new Map();
let lineChart;


//----------coin-select----------//

document.getElementById("coin-select")
  .addEventListener("change", function(){
  lineChart.wrangleData();
    });


//----------var-select----------//

document.getElementById("var-select")
  .addEventListener("change", function(){
  lineChart.wrangleData();
});


//------- date slider ------//

function sliderEnded(h){
  lineChart.wrangleData();
  }

function sliderStarted(h){
    lineChart.wrangleData();
  }

// constructor(_parentElement, _startDate, _endDate){
slider1 = new DateSlider("#date-slider","12/05/2013", "31/10/2017" );

//load data
d3.json("data/coins.json")
  .then(main)
  .catch(error=>console.log(error));

//main function
function main(data){
  let parseTime = d3.timeParse("%d/%m/%Y");
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

  lineChart = new LineChart("#chart-area");
}


