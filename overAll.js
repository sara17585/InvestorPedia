// window.onload = function() {
//     loadData("population.csv")
// }


var overAll = function (path,investor) {
    // d3version3.select("#canvas-svg>*").remove();
    d3version3.json(path, function (err, data) {
        const stateList = []
        const states = d3version3.keys(data);
        states.forEach(state => {
            stateList.push({
                stateName: state,
                numCompany : data[state].num_companies,
                aveRanking: data[state].average_ranking,
                totalFunding: data[state].total_funding,
            });

        })


        console.log(stateList)

        // var config = {
        //     // "color1": "#FFFFFF",
        //     "color1" : "#d3e5ff",
        //     "color2": "#08306B",
        //     "stateDataColumn": "stateName",
        //     "fundingDataColumn": "totalFunding"
        // }




        // console.log(data)






        var config = {
            // "color1": "#ffffff",
            // "color1" : "#d3e5ff",
            // "color1" : "#e1e9f5",
            "color1": "#e3eeff",
            "color2": "#08306B",
            "stateDataColumn": "stateName",
            "fundingDataColumn": "totalFunding",
            "rankingDataColumn" : "aveRanking",
            "numDataColumn" : "numCompany"
        }






        var WIDTH = 700, HEIGHT = 400;

        var COLOR_COUNTS = 100;

        var SCALE = 0.8;


        var COLOR_FIRST = config.color1, COLOR_LAST = config.color2;

        var rgb = hexToRgb(COLOR_FIRST);

        var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);


        rgb = hexToRgb(COLOR_LAST);
        var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

        var MAP_STATE = config.stateDataColumn;
        var MAP_VALUE = config.fundingDataColumn;
        var MAP_RANK = config.rankingDataColumn;
        var MAP_NUM = config.numDataColumn;

        var width = WIDTH,
            height = HEIGHT;

        var fundingById = d3version3.map(),rankById = d3version3.map(),numById = d3version3.map();


        var startColors = COLOR_START.getColors(),
            endColors = COLOR_END.getColors();
        var colors = [];

        for (var i = 0; i < COLOR_COUNTS; i++) {
            var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
            var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
            var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
            colors.push(new Color(r, g, b));
        }
        // colors.forEach(color=> console.log(color.getColors()))
        var quantize = d3version3.scale.quantize()
            .domain([0, 1.0])
            .range(d3version3.range(COLOR_COUNTS).map(function (i) {
                return i
            }));
        // console.log(d3version3.range(COLOR_COUNTS).map(function (i) {
        //     return i
        // }))
        var path = d3version3.geo.path();

        var svg = d3version3.select("#canvas-svg-overall").append("svg")
            .attr("width", width)
            .attr("height", height);

        d3version3.tsv("https://s3-us-west-2.amazonaws.com/vida-public/geo/us-state-names.tsv", function (error, names) {

            name_id_map = {};
            id_name_map = {};

            for (var i = 0; i < names.length; i++) {

                name_id_map[names[i].name] = names[i].id;
                id_name_map[names[i].id] = names[i].name;
            }


            stateList.forEach(function (d) {
                var id = name_id_map[d[MAP_STATE]];
                fundingById.set(id, +d[MAP_VALUE]);
                rankById.set(id, +d[MAP_RANK]);
                numById.set(id, +d[MAP_NUM]);
            });
            console.log(rankById)
            console.log(numById)
            quantize.domain([d3version3.min(stateList, function (d) {
                return +d[MAP_NUM]
            })-1,
                d3version3.max(stateList, function (d) {
                    return +d[MAP_NUM]
                })]);

            d3version3.json("https://s3-us-west-2.amazonaws.com/vida-public/geo/us.json", function (error, us) {
                svg.append("g")
                    .attr("class", "states-choropleth")
                    .selectAll("path")
                    .data(topojson.feature(us, us.objects.states).features)
                    .enter().append("path")
                    .attr("transform", "scale(" + SCALE + ")")
                    .style("stroke", '#8c8e91')
                    .style("fill", function (d) {
                        if (numById.get(d.id)) {
                            console.log(numById.get(d.id))
                            // console.log(topojson.feature(us, us.objects.states).features)
                            var i = quantize(numById.get(d.id));
                            var color = colors[i].getColors();
                            return "rgb(" + color.r + "," + color.g +
                                "," + color.b + ")";
                        } else {
                            return "";
                        }
                    })
                    .attr("d", path)
                    .on("mousemove", function (d) {
                        var html = "";
                        if (numById.get(d.id)) {


                            html += "<div class=\"tooltip_kv\">";
                            html += "<span class=\"tooltip_key\">";
                            html += id_name_map[d.id] + "<br/>" + "</span>"
                            html += "<span class=\"tooltip_key\">" + "Total Funding" + "</span>" + "<span class=\"tooltip_value\">" + (fundingById.get(d.id) ? "$" + valueFormat(fundingById.get(d.id)) : "") + "</span>" + "<br/>"
                            html += "<span class=\"tooltip_key\">" + "Ave Ranking" + "</span>" + "<span class=\"tooltip_value\">" + (rankById.get(d.id) ? valueFormat(rankById.get(d.id)) : "") + "</span>" + "<br/>"
                            html += "<span class=\"tooltip_key\">" + "Number of Companies" + "</span>" + "<span class=\"tooltip_value\">" + (numById.get(d.id) ? valueFormat(numById.get(d.id)) : "") + "</span>" + "<br/>"
                            html += "</span>";
                            html += "<span class=\"tooltip_value\">";
                            // html += (fundingById.get(d.id) ? valueFormat(fundingById.get(d.id)) : "")+"<br/>";
                            // html += (rankById.get(d.id) ? valueFormat(rankById.get(d.id)) : "");
                            // html += (numById.get(d.id) ? valueFormat(numById.get(d.id)) : "");
                            html += "</span>";
                            html += "</div>";
                        }else{

                            html += "<div class=\"tooltip_kv\">";
                            html += "<span class=\"tooltip_key\">";
                            html += id_name_map[d.id] + "</span>"
                            html += "</div>";

                        }

                        $("#tooltip-container").html(html);
                        $(this).attr("fill-opacity", "0.8");
                        $("#tooltip-container").show();

                        var coordinates = d3version3.mouse(this);

                        var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;

                        if (d3version3.event.layerX < map_width / 2) {
                            d3version3.select("#tooltip-container")
                                .style("top", (d3version3.event.layerY + 15) + "px")
                                .style("left", (d3version3.event.layerX + 15) + "px");
                        } else {
                            var tooltip_width = $("#tooltip-container").width();
                            d3version3.select("#tooltip-container")
                                .style("top", (d3version3.event.layerY + 15) + "px")
                                .style("left", (d3version3.event.layerX - tooltip_width - 30) + "px");
                        }

                    })
                    // .on("click", function (d) {
                    //     d3version3.select("#canvas-svg-overall>*").remove();
                    //     drawMap(investor,"investorMap.json");
                    //
                    //
                    // })

                    .on("mouseout", function () {
                        $(this).attr("fill-opacity", "1.0");
                        $("#tooltip-container").hide();
                    });

                svg.append("path")
                    .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                        return a !== b;
                    }))
                    .attr("class", "states")
                    .attr("transform", "scale(" + SCALE + ")")
                    .attr("d", path);
            });

        });
    });

}

function Interpolate(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function Color(_r, _g, _b) {
    var r, g, b;
    var setColors = function (_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function () {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function valueFormat(d) {
    if (d > 1000000000) {
        return Math.round(d / 1000000000 * 10) / 10 + "B";
    } else if (d > 1000000) {
        return Math.round(d / 1000000 * 10) / 10 + "M";
    } else if (d > 1000) {
        return Math.round(d / 1000 * 10) / 10 + "K";
    } else {
        return d;
    }
}
