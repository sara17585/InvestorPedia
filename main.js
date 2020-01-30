/**
 * For this file we didn't use any specific library
 * we only used online tutorials mentioned below to do it ourselves
 * https://www.youtube.com/watch?v=M2s2jowLkUo
 * //https://blog.risingstack.com/d3-js-tutorial-bar-charts-with-javascript/
 * */



var _data;
var _investors;

/**
 * Do the following when the browser window loads
 */
window.onload = function(){

    //This part is for Carousel and investor search part
    $('#list').hide();
    $('.bar-chart').hide();
    $('#searchbar').keyup(search_investor);
    $(document).on('click', function(event) {
        $('#list').hide();
    });
    //Loading the data for all charts
    loadData("investors.json")
};

function loadData(path) {

    d3version4.json(path).then(function(data) {
        _data = data;
        _investors = Object.keys(data).sort(function(a, b) {
            if (a < b) return -1;
            if (b < a) return 1;
            return 0;
        });
        //manipulating the html to add the search bar
        let html = '';
        let searchBarHtml = '';
        for (let investor of _investors) {
            html += `
               <div>
                <div class="investor">${investor}</div>
              </div> `;
            searchBarHtml += `
                <div onclick="select_investor('${investor}')" class="search-option">${investor}</div> 
            `;
        }
        $('#list').html(searchBarHtml);
        //adding carousel and calling the charts for the corresponding investor
        $('.carousel').html(html);
        $('.carousel').on('beforeChange', function(event, slick, currentSlide, nextSlide){
            const investor = _investors[nextSlide];
            $('.bar-chart').hide();
            d3version4.selectAll(".bar-chart>*").remove();
            d3version3.selectAll("#canvas-svg>*").remove();
            // d3version3.selectAll("#canvas-svg-overall>*").remove();
            drawScatterPlot(_data[investor],_data, investor==='...All Investors...');
            drawMap(investor, "investorMap.json");


        });
        $('.carousel').slick({
            centerMode: true,
            slidesToShow: 3,
            slidesToScroll: 4,
            swipeToSlide: true,
            focusOnSelect: true
        });

        const investor = _investors[0];
        d3version4.selectAll(".bar-chart>*").remove();
        d3version3.selectAll("#canvas-svg>*").remove();
        drawScatterPlot(_data[investor],_data,investor==='...All Investors...');
        drawMap(investor, "investorMap.json");
    });
}

function search_investor(e) {
    $('#list').css({top: e.target.offsetTop + 28, left: e.target.offsetLeft + 8, position: 'absolute'})
    $('#list').show();
    let input = document.getElementById('searchbar').value
    input=input.toLowerCase();
    let x = document.getElementsByClassName('search-option');

    for (i = 0; i < x.length; i++) {
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].style.display="none";
        }
        else {
            x[i].style.display="block";
        }
    }
}

function select_investor(investor) {
    $('#searchbar').val(investor);
    const index = _investors.indexOf(investor);
    $('.carousel').slick('slickGoTo', index);

}

// For the scatter plot we didn't use a specific library we just used the tutorial below to draw it ourselves
//https://www.youtube.com/watch?v=M2s2jowLkUo
function drawScatterPlot(investorData,data,all) {
    var fundingList=[]
    const rankingList=[]
    const stateNames=[]
    const investors = d3version4.keys(data);
    investors.forEach(investor =>{
        d3version4.values(data[investor]).forEach(state =>{
            fundingList.push(state.total_funding);
            rankingList.push(state.average_ranking);

        });
    });
//extracting funding and ranking from the dataset
    const stateList = []
    const states = d3version4.keys(investorData);
    states.forEach(state => {
        stateList.push({
            stateName: state,
            aveRanking: investorData[state].average_ranking,
            totalFunding: investorData[state].total_funding,
        });

    });

//creating scatter plot window
    const svgWidth = 700;
    const svgHeight = 400;
    d3version4.selectAll('.scatterplot > *').remove();

    const margin = {top: 60, right: 40, bottom: 60, left: 80};
    const innerWidth = svgWidth - margin.left - margin.right;
    const innerHeight = svgHeight - margin.top - margin.bottom;
    const xValue= d => d.aveRanking;
    const yValue= d => d.totalFunding;
    const xAxisLabel = 'Average Ranking';
    const yAxisLabel= 'Total Funding';
    const circleradius= 10;
    const yPadding = (d3version4.max(fundingList) - d3version4.min(fundingList))*3/100;
    const xPadding = (d3version4.max(rankingList) - d3version4.min(rankingList))*3/100 ;
    var brush = d3version4.brush().extent([[0, 0], [innerWidth, innerHeight]]).on("end", brushended),
        idleTimeout,
        idleDelay = 700;

    const svg = d3version4.select('.scatterplot')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

//defining a clip for brushing and zooming
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", innerWidth )
        .attr("height", innerHeight )
        .attr("x", 0)
        .attr("y", 0);

    var scatter = svg.append("g")
        .attr("id", "scatterplot")
        .attr("clip-path", "url(#clip)")
//defining y and x scale
    var xScale = d3version4.scaleLinear()
        .domain([d3version4.min(rankingList) - xPadding,d3version4.max(rankingList)+ xPadding])
        .range([0, innerWidth])
        .nice();
    var yScale = d3version4.scaleLinear()
        .domain([d3version4.min(fundingList) - yPadding , d3version4.max(fundingList)+ yPadding])

        .range([innerHeight, 0])
        .nice();

    const yAxis = d3version4.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);
    const xAxis = d3version4.axisBottom(xScale).tickSize(-innerHeight  ).tickPadding(10);
    const xAxisTickFormat = number => d3version4.format('.2s')(number).replace('G', 'B');



    const xAxisG = svg.append('g').attr("class", "x axis").attr('id', "axis--x").call(xAxis.tickFormat(xAxisTickFormat))
        .attr('transform', `translate(0,${innerHeight})`);
    const yAxisG = svg.append('g').attr('id', "axis--y").call(yAxis.tickFormat(xAxisTickFormat))

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 50)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);

    yAxisG.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor','middle' )
        .attr('class', 'axis-label')
        .attr('y',-60)
        .attr('x',-innerHeight/2)
        .attr('fill','black')
        .text(yAxisLabel);

    svg.append('text')
        .attr('class', 'title')
        .attr('y', -16)
        .attr('x', 160)
        .text('Funding vs Average Ranking')

    scatter.append("g")
        .attr("class", "brush")
        .call(brush);

    var stateList2= []
    var count =0

    //drawing the data on the scatter plot and adding interaction of selecting data and showing the corresponding barchart
    scatter.selectAll('circle')
        .data(stateList)
        .enter().append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx',d => xScale(xValue(d)))
        .attr('r',circleradius)
        .on("click", function(d,i) {
            count++
            if (count <= 2) {
                if (count == 1) {
                    d3version4.selectAll('circle')
                        .style("fill", "steelblue")
                    d3version4.select(this)
                        .style("fill", "red")
                } else
                {
                    d3version4.select(this)
                        .style("fill", "blue")
                }}
            stateList2.push(d.stateName)


            if (count == 2) {
                drawBarChart(investorData, stateList2, all)
                stateList2 = []
                count=0
            }

        });

//adding state names to circles on scatter plot
    const text =scatter.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("text")
        .data(stateList)
        .enter().append("text")
        .attr("x", d => xScale(xValue(d))- 20)
        .attr("y", d => yScale(yValue(d)))
        .attr('fill', 'black')
        .text(d => d.stateName)




//brush function for zooming and adjusting axis scales and data distribution according to the brushed area
    function brushended() {

        var s = d3version4.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            xScale.domain([d3version4.min(rankingList) - xPadding,d3version4.max(rankingList)+ xPadding]).nice()
            yScale.domain([d3version4.min(fundingList) - yPadding , d3version4.max(fundingList)+ yPadding]).nice()
        } else {
            xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale)).nice();
            yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale)).nice();
            scatter.select('.brush').call(brush.move, null);
        }
        zoom();
    }

    function idled() {
        idleTimeout = null;
    }

    function zoom() {

        var t = scatter.transition().duration(1000);
        xAxisG.transition(t).call(xAxis);
        yAxisG.transition(t).call(yAxis);
        scatter.selectAll("circle").transition(t)
            .attr("cx", function (d) { return xScale(xValue(d)); })
            .attr("cy", function (d) { return yScale(yValue(d)); });
        text.data(stateList).transition(t)
            .attr("x", d => xScale(xValue(d))- 20)
            .attr("y", d => yScale(yValue(d)))
            .attr('fill', 'black')
            .text(d => d.stateName)

    }



}

//this part is not from a library but we used this tutorial to draw our own bar chart
//https://blog.risingstack.com/d3-js-tutorial-bar-charts-with-javascript/
function drawBarChart(investorData, states, all) {
    $('.bar-chart').show();
    d3version4.selectAll('.bar-chart>*').remove();


    // set up height and width
    var svgWidth = 700;
    var svgHeight = 400;
    const margin = {top: 60, right: 40, bottom: 60, left: 80};
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;


    // Find the x values in the bar chart
    var roundCountMap = {};
    for (let state of states) {
        const roundCounts = investorData[state];
        for (let round of Object.keys(roundCounts)) {
            if (round.startsWith('Series')) {
                if (roundCountMap[round] === undefined) roundCountMap[round] = roundCounts[round];
                else roundCountMap[round] = Math.max(roundCountMap[round], roundCounts[round]);
            }
        }
    }

    const funding_state_one = investorData[states[0]]
    const funding_state_two = investorData[states[1]]
    const funding_states = [funding_state_one, funding_state_two];
    const data = [];
    for (let i = 0; i < funding_states.length; i++) {
        const stateData = funding_states[i];
        for (let round of Object.keys(stateData)) {
            if (roundCountMap[round] > 0) {
                data.push({
                    round: round,
                    count: stateData[round],
                    state: states[i]
                });
            }
        }
    }

    var max_x_length = 7;// Object.keys(roundCountMap).filter(round => roundCountMap[round] > 0).length
    var barWidth = (chartWidth / max_x_length);
    var tooltip = d3version4.select("body").append("div").attr("class", "toolTip");

    // define bar chart
    var svg = d3version4.select('.bar-chart')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr('x',0)
        .attr('y',0)
        .on("click", d=>{

            d3version4.selectAll('.bar-chart>*').remove();
        });;

    const chart = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // setup d3version4 Scales
    var xScale = d3version4.scaleBand()
        .domain([
            // Object.keys(roundCountMap)
            //     .filter(round => roundCountMap[round] > 0)
            //     .sort((round1, round2) => round1 < round2 ? -1 : 1)
            'Series A',
            'Series B',
            'Series C',
            'Series D',
            'Series E',
            'Series F',
            'Series H',
            'Series G'
        ])
        .range([0, chartWidth])
        .padding(0.2);

    // add y axis
    if (!all) {
        var yScale = d3version4.scaleLinear()
            .domain([0, 34])
            .range([chartHeight, 0])
            .nice();
        chart.append('g').call(d3version4.axisLeft(yScale).ticks(d3version4.max(Object.values(roundCountMap))));

        chart.append('g')
            .attr('class', 'grid')
            .call(d3version4.axisLeft()
                .scale(yScale)
                .tickSize(-chartWidth, 0, 0)
                .ticks(30)
                .tickFormat(''))

        svg.append('text')
            .attr('x', -(chartHeight / 2) - margin.left)
            .attr('y', margin.top / 2.4)
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .text('Counts')
    } else {
        var yScale = d3version4.scaleLinear()
            .domain([0, d3version4.max(Object.values(roundCountMap))])
            .range([chartHeight, 0])
            .nice();
    }

    chart
        .append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .attr('class', 'series-label')
        .call(d3version4.axisBottom(xScale));


    svg.append('text')
        .attr('class', 'title')
        .attr('y', 54)
        .attr('x',chartWidth/2)
        .text('Funding rounds')

    const x1 = d3version4.scaleBand().rangeRound([0, xScale.bandwidth()]);
    x1.domain(data.map(d => d.state));
//drawing data on the barchart and adding interactions on th chart
    var barChart = chart.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return xScale(d.round) + x1(d.state);
        })
        .attr("y", function(d) {
            return yScale(d.count);
        })
        .attr("height", function(d) {
            return chartHeight - yScale(d.count);
        })
        .attr("width", function(d){
            return states[1]==states[0] ? x1.bandwidth()/2: x1.bandwidth();
        })
        .attr("fill", function(d) {
            return d.state === states[1] ? 'blue' : 'red';
        })
        .attr("opacity", 0.5)
        .on("mousemove", function(d) {
            tooltip
                .style("left", d3version4.event.pageX - 50 + "px")
                .style("top", d3version4.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html(d.count);
        })
        .on("mouseout", function(d){ tooltip.style("display", "none");});
}