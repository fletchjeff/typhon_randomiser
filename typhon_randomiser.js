// let cc_range = d3.range(1,100,1)

// d3.select("#cc_val")
//     .selectAll("option")
//     .data(cc_range)
//     .join("option") // the join method
//         .attr("value",(d) => d)
//         .text((d) => d)

let channel = 9;

function create_cc_divs(all_cc_names) {
    d3.select("#main_div")
        .selectAll("div")
        .data(all_cc_names)
        .join("div")
            .attr("id",(d) => {
                return "section_" + d[0].replace(" ","_")
            })
            .text((d) => {
                return d[0]
            })
            .append("input")
            .attr("type","range")
            .attr("class","input-slider")
            .attr("min",0)
            .attr("max",127)
            .attr("oninput", (d) => {
                return 'cc_val_change(' + d[1][0].CC_NUM + ',this.value,' + channel + ')'
            })
            .attr("id", (d) => {
                return "knob_" + d[0].replace(" ","_")
            })
          // d.keys()
        
}

let data;
d3.dsv(",", "typhon_cc_data.csv")
    .then(function(d) {
        data = d;
        used_data = d3.filter(d, d => d.USED==1)
        grouped_data = d3.group(used_data, d => d.CC_NAME);
        create_cc_divs(grouped_data)
    })
    .catch(error => {
        console.error(error);
    })

function cc_val_change(cc_num,cc_val,channel_num) {
    // console.log(cc_val);
    // d3.select("#current_val").text(cc_val)
    WebMidi.getOutputByName('Typhon').channels[channel_num].sendControlChange(cc_num, cc_val);
}