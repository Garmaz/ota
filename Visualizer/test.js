getTooltipContent = function (d) {
    return `<b>${d.civilization}</b>
    <br/>
    <b style="color:${d.color.darker()}">${d.region}</b>
    <br/>
    ${formatDate(d.start)} - ${formatDate(d.end)}
    `
}

height = 1000

y = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0, height - margin.bottom - margin.top])
    .padding(0.2)

x = d3.scaleLinear()
    .domain([d3.min(data, d => d.start), d3.max(data, d => d.end)])
    .range([0, width - margin.left - margin.right])

margin = ({
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
})

createTooltip = function (el) {
    el
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("top", 0)
        .style("opacity", 0)
        .style("background", "white")
        .style("border-radius", "5px")
        .style("box-shadow", "0 0 10px rgba(0,0,0,.25)")
        .style("padding", "10px")
        .style("line-height", "1.3")
        .style("font", "11px sans-serif")
}

getRect = function (d) {
    const el = d3.select(this);
    const sx = x(d.start);
    const w = x(d.end) - x(d.start);
    const isLabelRight = (sx > width / 2 ? sx + w < width : sx - w > 0);

    el.style("cursor", "pointer")

    el
        .append("rect")
        .attr("x", sx)
        .attr("height", y.bandwidth())
        .attr("width", w)
        .attr("fill", d.color);

    el
        .append("text")
        .text(d.civilization)
        .attr("x", isLabelRight ? sx - 5 : sx + w + 5)
        .attr("y", 2.5)
        .attr("fill", "black")
        .style("text-anchor", isLabelRight ? "end" : "start")
        .style("dominant-baseline", "hanging");
}

dataByTimeline = d3.nest().key(d=>d.timeline).entries(data);

dataByRegion = d3.nest().key(d=>d.region).entries(data);

axisBottom = d3.axisBottom(x)
    .tickPadding(2)
    .tickFormat(formatDate)

axisTop = d3.axisTop(x)
    .tickPadding(2)
    .tickFormat(formatDate)

formatDate = d=> d < 0 ? `${-d}BC` : `${d}AD`

d3 = require("d3@5")

csv = d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vT30mOr0t5_Q0BIqjlCus9PS2uB_IS7OKvltMaY83euoFiTUFLas7uDiSohYU4oiO05SQqU6IeBAJlN/pub?gid=2137611021&single=true&output=csv")

data = csv.map(d=>{
    return {
      ...d,
      start: +d.start,
      end: +d.end
    }
    }).sort((a,b)=>  a.start-b.start);

    regions = d3.nest().key(d=>d.region).entries(data).map(d=>d.key)

timelines = dataByTimeline.map(d=>d.key)

color = d3.scaleOrdinal(d3.schemeSet2).domain(regions)

import {checkbox, select} from "@jashkenas/inputs"