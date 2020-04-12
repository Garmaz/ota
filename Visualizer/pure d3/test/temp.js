var x, y, gX, gY, xAxis, yAxis;
var idList = 1
var color = d3.scaleOrdinal(d3.schemeCategory10);
var mainData = null;
var line;
var settings = {
    targets: [],
    detail: {
        type: "line"
    }
};
d3.json("data.json", function (data) {

    if (data[0].metric.WIDGET_SETTINGS != "") {
        var wid = JSON.parse(data[0].metric.WIDGET_SETTINGS);
        if (wid != null && typeof wid.line != 'undefined') {
            $.extend(settings, wid.line);
        }
        if (wid != null) {
            $.extend(settings, wid);
        }
    }

    mainData = data;
    var svg = d3.select("svg");

    d3.select("#area")
        .insert("div", "svg").html(data[0].metric.AREA_NAME + "<BR>" + data[0].metric.IND_NAME +
            "<BR>" + data[0].metric.NAME);

    var limits = {
        maxY: null,
        minY: null,
        maxX: null,
        minX: null
    };
    var padding = {
        top: 20,
        bottom: 150,
        left: 100,
        right: 20
    };

    var width = +svg.attr("width");
    var height = +svg.attr("height");

    var canvasHeight = height - padding.top - padding.bottom;
    var canvasWidth = width - padding.left - padding.right;

    data.forEach(function (e, i) {
        var eMaxY = d3.max(e.data, function (d) {
            return +d.VALUE_NUMERIC;
        });
        var eMinY = d3.min(e.data, function (d) {
            return +d.VALUE_NUMERIC;
        });
        var eMaxX = d3.max(e.data, function (d) {
            return new Date(d.DATA_DATE);
        });
        var eMinX = d3.min(e.data, function (d) {
            return new Date(d.DATA_DATE);
        });

        if (limits.maxX == null) {
            limits.maxX = eMaxX;
        } else {
            if (eMaxX > limits.maxX) {
                limits.maxX = eMaxX;
            }
        }

        if (limits.minX == null) {
            limits.minX = eMinX;
        } else {
            if (eMinX < limits.minX) {
                limits.minX = eMinX;
            }
        }

        if (limits.maxY == null) {
            limits.maxY = eMaxY;
        } else {
            if (eMaxY > limits.maxY) {
                limits.maxY = eMaxY;
            }
        }

        if (limits.minY == null) {
            limits.minY = eMinY;
        } else {
            if (eMinY < limits.minY) {
                limits.minY = eMinY;
            }
        }
    });

    settings.targets.forEach(function (d) {
        if (limits.maxY < d.value) {
            limits.maxY = d.value;
        }
        if (limits.minY > d.value) {
            limits.minY = d.value;
        }
    });


    var canvas = svg.append("g")
        .attr("id", "canvas")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");


    x = d3.scaleTime()
        .domain([limits.minX, limits.maxX])
        .range([0, +canvas.attr("width")]);
    y = d3.scaleLinear()
        .domain([limits.maxY * 1.1, limits.minY - (limits.minY * 0.1)])
        .range([0, +canvas.attr("height")]);

    line = d3.line()
        .x(function (d) {
            return x(new Date(d.DATA_DATE));
        })
        .y(function (d) {
            return y(+d.VALUE_NUMERIC);
        });

    var zoom = d3.zoom().on("zoom", zoomed);

    xAxis = d3.axisBottom(x);
    yAxis = d3.axisLeft(y);

    canvas.selectAll(".targets")
        .data(settings.targets)
        .enter()
        .append("line")
        .classed("targets", true)
        .style("stroke", function (d) {
            return d.color;
        })
        .style("stroke-width", 1)
        .attr("x1", x(limits.minX))
        .attr("x2", x(limits.maxX))
        .attr("y1", function (d) {
            return y(+d.value);
        })
        .attr("y2", function (d) {
            return y(+d.value);
        });

    var clip = canvas.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight);

    gX = canvas.append("g")
        .attr("transform", "translate(0," + (+canvas.attr("height")) + ")")
        .attr("class", "axis axis--x")
        .call(xAxis);

    gY = canvas.append("g").attr("class", "axis axis--y").call(yAxis);

    d3.selectAll(".axis--y > g.tick > line").attr("x2", canvasWidth).style("stroke", "lightgrey");

    if (settings.detail.type == "line") {
        var lines = canvas.selectAll("path.line")
            .data(data)
            .enter()
            .append("path")
            .attr("clip-path", "url(#clip)")
            .classed("line", true)
            .style("stroke", function (d) {
                return color(d.metric.METRIC_ID)
            })
            .attr("d", function (d) {
                return line(d.data);
            });
    } else if (settings.detail.type == "bar") {
        barWidth = (x(new Date("2016-01-02")) - x(new Date("2016-01-01")));
        var barLines = canvas.selectAll("rect.bar")
            .data(data[0].data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("clip-path", "url(#clip)")
            .attr("x", function (d) {
                return x(new Date(d.DATA_DATE)) - barWidth * 0.5;
            })
            .attr("width", barWidth)
            .attr("height", function (d) {
                return canvasHeight - y(d.VALUE_NUMERIC);
            })
            .attr("y", function (d) {
                return y(d.VALUE_NUMERIC);
            })
            .style("fill", "steelblue")
            .style("stroke", "blue")
            .style("stroke-width", "1px");
    }


    canvas.append("g")
        .attr("transform", "translate(" + (-40) + "," +
            (+canvas.attr("height")) / 2 +
            ") rotate(270)")
        .append("text")
        .attr("text-anchor", "middle")
        .text(data[0].metric.Y_AXIS_NAME);

    svg.call(zoom);
});

function zoomed() {
    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    var new_x = d3.event.transform.rescaleX(x);

    if (settings.detail.type == "line") {
        line.x(function (d) {
            return new_x(new Date(d.DATA_DATE));
        })
        d3.select("#canvas").selectAll("path.line")
            .data(mainData)
            .attr("d", function (d) {
                return line(d.data);
            });
    } else if (settings.detail.type == "bar") {
        barWidth = new_x(new Date("2016-01-02")) - new_x(new Date("2016-01-01"));
        d3.select("#canvas").selectAll("rect.bar")
            .data(mainData[0].data)
            .attr("x", function (d) {
                return new_x(new Date(d.DATA_DATE)) - barWidth * 0.5;
            })
            .attr("width", barWidth);
    }
}