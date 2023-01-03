let channel = 9;
function create_cc_divs(all_cc_names) {
  let section_divs = d3
    .select("#main_div")
    .selectAll("div")
    .data(all_cc_names)
    .join("div")
    .attr("id", (d) => `section_${d[0].replaceAll(" ", "_")}`)
    .attr("style", "clear:both")
    .attr("class", "section_div");

  let cc_knob_divs = section_divs
    .selectAll("div")
    .data((d) => {
      return d3.group(d[1], (d) => d.CC_NAME);
    })
    .join("div")
    .attr("style", "float:left")
    .attr("class", (d) => d[1][0].KNOB.toLowerCase())
    .attr("id", (d) => {
      return `knob_div_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
      //return `knob_div_${d[1][0].VAL_NAME.replaceAll(" ", "_")}_${d[1][0].TYPE.replaceAll(" ", "_")}_${d[1][0].SYNC}`
    });

  cc_knob_divs
    .append("div")
    .attr("class", "knob_header")
    .attr("id", (d) => {
      return `knob_header_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
      //return `knob_header_${d[1][0].VAL_NAME.replaceAll(" ", "_")}_${d[1][0].TYPE.replaceAll(" ", "_")}_${d[1][0].SYNC}`
    })
    .text((d) => {
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
    .attr("data-bgcolor", "#eee")
    .attr("data-fgcolor", "#111")
    .attr("data-width", (d) => (d[1][0].KNOB == "SLIDER" ? 15 : ""))
    .attr("data-height", (d) => (d[1][0].KNOB == "SLIDER" ? 100 : ""))
    .attr("oninput", (d) => {
      let names_list =
        d[1][0].NAMES == "-" ? "-" : d[1][0].NAMES.replaceAll("'", '"');
      return `cc_val_change(${d[1][0].CC_NUM},${d[1][0].CC_MIN},${d[1][0].CC_MAX},${d[1][0].VAL_MIN},${d[1][0].VAL_MAX},${d[1][0].VAL_STEP},this.value,${channel},this.id,\`${names_list}\`,'${d[1][0].SECTION}','${d[1][0].CC_NAME}')`;
    })
    .attr("id", (d) => {
      return `knob_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
      //return `knob_${d[1][0].VAL_NAME.replaceAll(" ", "_")}_${d[1][0].TYPE}_${d[1][0].SYNC}`;
    });

  cc_knob_divs
    .append("div")
    .attr("id", (d) => {
      return `val_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
      //return `val_${d[1][0].VAL_NAME.replaceAll(" ", "_")}_${d[1][0].TYPE}_${d[1][0].SYNC}`;
    })
    .attr("class", "knob_val")
    .text((d) => {
      if (d[1][0].NAMES == "-") {
        return d[1][0].VAL_DEFAULT;
      } else {
        item_index = Math.round(d[1][0].VAL_DEFAULT / d[1][0].VAL_STEP);
        return JSON.parse(d[1][0].NAMES.replaceAll("'", '"'))[item_index];
      }
    });

  section_divs
    .insert("div", "div")
    .text((d) => {
      return d[0];
    })
    .attr("class", "section_header")
    .attr("id", (d) => {
      return "section_header_" + d[0];
    });
}

// The hard coded things
function set_fx_mod_headers() {
  //FX1
  d3.select("#section_header_FX1").text(
    d3.select("#section_header_FX1").text().split(" ")[0] +
      " - " +
      d3.select("#val_FX1_TYPE").text()
  );
  d3.select("#section_header_FX2").text(
    d3.select("#section_header_FX2").text().split(" ")[0] +
      " - " +
      d3.select("#val_FX2_TYPE").text()
  );
  d3.select("#section_header_FX3").text(
    d3.select("#section_header_FX3").text().split(" ")[0] +
      " - " +
      d3.select("#val_FX3_TYPE").text()
  );
  d3.select("#section_header_M1").text(
    d3.select("#section_header_M1").text().split(" ")[0] +
      " - " +
      d3.select("#val_M1_MODE").text()
  );
  d3.select("#section_header_M2").text(
    d3.select("#section_header_M2").text().split(" ")[0] +
      " - " +
      d3.select("#val_M2_MODE").text()
  );
  d3.select("#section_header_M3").text(
    d3.select("#section_header_M3").text().split(" ")[0] +
      " - " +
      d3.select("#val_M3_MODE").text()
  );
}

function update_knob(selector) {}
let data;
// let names_temp;
d3.dsv(
  ",",
  "https://docs.google.com/spreadsheets/d/1bjHyeFA21qd2ytvMo8Zo4X4e7A6cmajUBeerextgFPE/gviz/tq?tqx=out:csv"
)
  .then(function (d) {
    data = d;
    used_data = d3.filter(d, (d) => d.USED == 1);
    //grouped_data = d3.group(used_data, d => d.CC_NAME);
    create_cc_divs(d3.group(used_data, (d) => d.SECTION)); //grouped_data)

    // The hard coded things
    set_fx_mod_headers();
  })
  .catch((error) => {
    console.error(error);
  });

const type_knob_ids = [
  "knob_FX1_TYPE",
  "knob_FX2_TYPE",
  "knob_FX3_TYPE",
  "knob_M1_MODE",
  "knob_M2_MODE",
  "knob_M3_MODE",
];

function cc_val_change(
  cc_num,
  cc_min,
  cc_max,
  val_min,
  val_max,
  val_step,
  knob_val,
  channel_num,
  val_id,
  names,
  section,
  cc_name
) {
  val_to_update = val_id.replace("knob_", "val_");
  //   console.log(`cc_min = ${cc_min}, cc_max = ${cc_max}, val_min = ${val_min}, val_max = ${val_max}, val_step = ${val_step}, knob_val = ${knob_val}`)
  if (names == "-") {
    d3.select("#" + val_to_update).text(knob_val);
  } else {
    let names_temp = JSON.parse(names);
    d3.select("#" + val_to_update).text(
      names_temp[Math.round(knob_val / val_step)]
    );
  }

  scaled_midi_val = d3
    .scaleLinear()
    .domain([val_min, val_max])
    .rangeRound([cc_min, cc_max])
    .clamp(true);

  d3.select("#midi_cc_num").text("MIDI CC NUM: " + cc_num);
  d3.select("#midi_cc_val").text("MIDI CC VAL: " + scaled_midi_val(knob_val));
  d3.select("#midi_cc_chan").text("MIDI CC CHAN: " + channel_num);

  // Send MIDI CCs

  //WebMidi.getOutputByName('Typhon').channels[channel_num].sendControlChange(cc_num, cc_val);

  set_fx_mod_headers();

  if (type_knob_ids.includes(val_id)) {
    let fx_param_count = {
      FX1: [1, 2],
      FX2: [1, 2, 3],
      FX3: [1, 2, 4],
      M1: [1, 2, 3],
      M2: [1, 2, 3],
      M3: [1, 2, 3],
    };
    fx_param_count[section].forEach((e) => {
      // Create new data for knob
      new_knob_data = d3.filter(
        data,
        (d) =>
          (d.TYPE == d3.select("#" + val_to_update).text()) &
          (d.CC_NAME == section + " PARAMETER " + e)
      );

      //Update Knob heading
      d3.select("#knob_header_" + section + "_PARAMETER_" + e).text(
        new_knob_data[0].VAL_NAME
      );

      //Update Knob
      d3.select("#knob_" + section + "_PARAMETER_" + e)
        .attr("min", new_knob_data[0].VAL_MIN)
        .attr("max", new_knob_data[0].VAL_MAX)
        .attr("step", new_knob_data[0].VAL_STEP)
        .attr("value", new_knob_data[0].VAL_DEFAULT)
        .attr("oninput", (d) => {
            let names_list =
            new_knob_data[0].NAMES == "-" ? "-" : new_knob_data[0].NAMES.replaceAll("'", '"');
            return `cc_val_change(${new_knob_data[0].CC_NUM},${new_knob_data[0].CC_MIN},${new_knob_data[0].CC_MAX},${new_knob_data[0].VAL_MIN},${new_knob_data[0].VAL_MAX},${new_knob_data[0].VAL_STEP},this.value,${channel},this.id,\`${names_list}\`,'${new_knob_data[0].SECTION}','${new_knob_data[0].CC_NAME}')`;
          })

    d3.select("#val_" + section + "_PARAMETER_" + e).text((d) => {
            if (new_knob_data[0].NAMES == "-") {
              return new_knob_data[0].VAL_DEFAULT;
            } else {
              item_index = Math.round(new_knob_data[0].VAL_DEFAULT / new_knob_data[0].VAL_STEP);
              return JSON.parse(new_knob_data[0].NAMES.replaceAll("'", '"'))[item_index];
            }
          })  
      //console.log(d3.select("#knob_header_" + section + "_PARAMETER_" + e))
    });
  }
}
