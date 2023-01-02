let channel = 9;

function create_cc_divs(all_cc_names) {
  let section_divs = d3
    .select("#main_div")
    .selectAll("div")
    .data(all_cc_names)
    .join("div")
    .attr("id", d => `section_${d[0].replaceAll(" ", "_")}`)
    .attr("style", "clear:both")
    .attr("class","section_div");

  let cc_knob_divs = section_divs
    .selectAll("div")
    .data((d) => {
      return d3.group(d[1], (d) => d.CC_NAME);
    })
    .join("div")
    .attr("style", "float:left")
    .attr("class", d => d[1][0].KNOB.toLowerCase());

  cc_knob_divs.append("div").text((d) => {
    return d[1][0].VAL_NAME;
  });

  cc_knob_divs
    .append("input")
    .attr("type", "range")
    .attr("class", (d) =>
      d[1][0].KNOB == "SLIDER" ? "input-slider" : "input-knob"
    )
    .attr("min", (d) => d[1][0].VAL_MIN)
    .attr("max", (d) => d[1][0].VAL_MAX)
    .attr("step", (d) => d[1][0].VAL_STEP)
    .attr("value", (d) => d[1][0].VAL_DEFAULT)
    .attr("data-bgcolor", "#111")
    .attr("data-fgcolor", "#029b33")
    .attr("data-width", (d) => (d[1][0].KNOB == "SLIDER" ? 15 : ""))
    .attr("data-height", (d) => (d[1][0].KNOB == "SLIDER" ? 100 : ""))
    .attr("oninput", (d) => {
        // console.log(typeof(d[1][0].NAMES))
        // if (d[1][0].NAMES == "-") {
        //     console.log("-" + d[1][0].NAMES)
        // } else {
        //     console.log(JSON.parse(d[1][0].NAMES.replaceAll("'","\"")))
        // }
        //? "-" : JSON.parse(d[1][0].NAMES.replaceAll("\"","`").replaceAll("'","\"")))
        //console.log(d[1][0].NAMES == "-" ? "-" : JSON.parse(d[1][0].NAMES.replaceAll("'","\"")))
        let names_list = d[1][0].NAMES == "-" ? "-" : d[1][0].NAMES.replaceAll("'","\"")
        //let names_list = [1,2,3,4]
        return `cc_val_change(${d[1][0].CC_NUM},${d[1][0].CC_MIN},${d[1][0].CC_MAX},${d[1][0].VAL_MIN},${d[1][0].VAL_MAX},${d[1][0].VAL_STEP},this.value,${channel},this.id,\`${names_list}\`)`
    })
    .attr("id", (d) => {
      return `knob_${d[1][0].VAL_NAME.replaceAll(" ", "_")}_${d[1][0].TYPE}_${d[1][0].SYNC}`;
    });

  cc_knob_divs
    .append("div")
    .attr("id", (d) => {
      //console.log(d[1][0].VAL_NAME + "_" + d[1][0].TYPE + "_" + d[1][0].SYNC)
      //return d[1][0].
      return `val_${d[1][0].VAL_NAME.replaceAll(" ", "_")}_${d[1][0].TYPE}_${d[1][0].SYNC}`
    })
    .text((d) => {
      return d[1][0].VAL_DEFAULT;
    });

  section_divs.insert("div", "div").text((d) => {
    return d[0];
  })
  .attr("class","section_header");
}

let data;
let names_temp;
d3.dsv(
  ",",
  "https://docs.google.com/spreadsheets/d/1bjHyeFA21qd2ytvMo8Zo4X4e7A6cmajUBeerextgFPE/gviz/tq?tqx=out:csv"
)
  //typhon_cc_data.csv")
  .then(function (d) {
    data = d;
    used_data = d3.filter(d, (d) => d.USED == 1);
    //grouped_data = d3.group(used_data, d => d.CC_NAME);
    create_cc_divs(d3.group(used_data, (d) => d.SECTION)); //grouped_data)
  })
  .catch((error) => {
    console.error(error);
  });

function cc_val_change(cc_num, cc_min, cc_max, val_min, val_max, val_step, knob_val, channel_num, val_id,names) {
  val_to_update = val_id.replace("knob_", "val_");
  console.log(names)
  console.log(`cc_min = ${cc_min}, cc_max = ${cc_max}, val_min = ${val_min}, val_max = ${val_max}, val_step = ${val_step}, knob_val = ${knob_val}`)
  if (names=="-") {
    d3.select("#" + val_to_update).text(knob_val);
  } else {
    let names_temp = JSON.parse(names);
    d3.select("#" + val_to_update).text(names_temp[Math.round(knob_val/val_step)]);
  }

  scaled_midi_val = d3.scaleLinear()
  .domain([val_min, val_max])
  .rangeRound([cc_min, cc_max]).clamp(true);
  
  d3.select("#midi_cc_num").text("MIDI CC NUM: " + cc_num);
  d3.select("#midi_cc_val").text("MIDI CC VAL: " + scaled_midi_val(knob_val));
  d3.select("#midi_cc_chan").text("MIDI CC CHAN: " + channel_num);

  //WebMidi.getOutputByName('Typhon').channels[channel_num].sendControlChange(cc_num, cc_val);
}
