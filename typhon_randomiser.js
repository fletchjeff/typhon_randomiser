let channel = 9;
let midi_device = "Typhon";
let state_data = [];
let data;

// Creates the UI
function create_cc_divs(all_cc_names) {
    let section_divs = d3
        .select("#main_div")
        .selectAll("div")
        .data(all_cc_names)
        .join("div")
        .attr("id", (d) => `section_${d[0].replaceAll(" ", "_")}`)
        .attr("style", "float:left")
        .attr("class", "section_div");

    let cc_knob_divs = section_divs
        .selectAll("div")
        .data((d) => {
            return d3.group(d[1], (d) => d.CC_NAME);
        })
        .join("div")
        .attr("class", "knob")
        .attr("id", (d) => {
            return `knob_div_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
        });

    cc_knob_divs
        .append("div")
        .attr("class", "knob_header")
        .attr("id", (d) => {
            return `knob_header_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
        })
        .text((d) => {
            return d[1][0].VAL_NAME;
        });

    cc_knob_divs
        .append("div")
        .attr("id", (d) => {
            return `val_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
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

    cc_knob_divs
        .append("input")
        .attr("type", "range")
        .attr("class", "range_slider")
        .attr("min", (d) => d[1][0].VAL_MIN)
        .attr("max", (d) => d[1][0].VAL_MAX)
        .attr("step", (d) => d[1][0].VAL_STEP)
        .attr("value", (d) => d[1][0].VAL_DEFAULT)
        .attr("id", (d) => {
            // This creates the state_data Array. Not a great implementation but this isn't a web editor, its a randomiser!
            state_data.push({
                cc_num: parseInt(d[1][0].CC_NUM),
                cc_min: d[1][0].CC_MIN,
                cc_max: d[1][0].CC_MAX,
                val_min: d[1][0].VAL_MIN,
                val_max: d[1][0].VAL_MAX,
                val_step: d[1][0].VAL_STEP,
                knob_val: d[1][0].VAL_DEFAULT,
                section: d[1][0].SECTION,
                cc_name: d[1][0].CC_NAME,
                names: d[1][0].NAMES.replaceAll("'", '"'),
                val_id: `knob_${d[1][0].CC_NAME.replaceAll(" ", "_")}`,
            });

            return `knob_${d[1][0].CC_NAME.replaceAll(" ", "_")}`;
        })
        .on("input", (e, d) => {
            let names_list = d[1][0].NAMES == "-" ? "-" : d[1][0].NAMES.replaceAll("'", '"');
            return knob_val_change(d[1][0].CC_NUM, d[1][0].CC_MIN, d[1][0].CC_MAX, d[1][0].VAL_MIN, d[1][0].VAL_MAX, d[1][0].VAL_STEP, e.srcElement.value, channel, e.srcElement.id, names_list, d[1][0].SECTION, d[1][0].CC_NAME, false);
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
    d3.select("#section_header_FX1").text(d3.select("#section_header_FX1").text().split(" ")[0] + " - " + d3.select("#val_FX1_TYPE").text());
    d3.select("#section_header_FX2").text(d3.select("#section_header_FX2").text().split(" ")[0] + " - " + d3.select("#val_FX2_TYPE").text());
    d3.select("#section_header_FX3").text(d3.select("#section_header_FX3").text().split(" ")[0] + " - " + d3.select("#val_FX3_TYPE").text());
    d3.select("#section_header_M1").text(d3.select("#section_header_M1").text().split(" ")[0] + " - " + d3.select("#val_M1_MODE").text());
    d3.select("#section_header_M2").text(d3.select("#section_header_M2").text().split(" ")[0] + " - " + d3.select("#val_M2_MODE").text());
    d3.select("#section_header_M3").text(d3.select("#section_header_M3").text().split(" ")[0] + " - " + d3.select("#val_M3_MODE").text());
}

d3.csv("https://docs.google.com/spreadsheets/d/1bjHyeFA21qd2ytvMo8Zo4X4e7A6cmajUBeerextgFPE/gviz/tq?tqx=out:csv")
    .then(function (d) {
        data = d;

        //filter out usused items
        used_data = d3.filter(d, (d) => d.USED == 1);

        //create the UI
        create_cc_divs(d3.group(used_data, (d) => d.SECTION)); 

        // Do the hard coded UI things
        set_fx_mod_headers();
    })
    .catch((error) => {
        console.error(error);
    });

// This runs on a knob update
function knob_val_change(cc_num, cc_min, cc_max, val_min, val_max, val_step, knob_val, channel, val_id, names, section, cc_name, from_random) {
    // Update state_data
    val_to_update = val_id.replace("knob_", "val_");
    state_data[state_data.indexOf(d3.filter(state_data, (d) => d.cc_num == cc_num)[0])] = {
        cc_num: cc_num,
        cc_min: cc_min,
        cc_max: cc_max,
        val_min: val_min,
        val_max: val_max,
        val_step: val_step,
        knob_val: knob_val,
        section: section,
        cc_name: cc_name,
        names: names,
        val_id: val_id,
    };
    //   console.log(`cc_min = ${cc_min}, cc_max = ${cc_max}, val_min = ${val_min}, val_max = ${val_max}, val_step = ${val_step}, knob_val = ${knob_val}`)
    if (names == "-") {
        d3.select("#" + val_to_update).text(Math.round(knob_val));
    } else {
        let names_temp = JSON.parse(names);
        d3.select("#" + val_to_update).text(names_temp[Math.round(knob_val / val_step)]);
    }

    //Scales the Midi CC val to the knob input ranges
    scaled_midi_val = d3.scaleLinear().domain([val_min, val_max]).rangeRound([cc_min, cc_max]).clamp(true);

    d3.select("#midi_cc_num").text("MIDI CC NUM: " + cc_num);
    d3.select("#midi_cc_val").text("MIDI CC VAL: " + scaled_midi_val(knob_val));
    d3.select("#midi_cc_chan").text("MIDI CC CHAN: " + channel);

    // Send MIDI CCs

    //WebMidi.getOutputByName('Typhon').channels[channel].sendControlChange(cc_num, cc_val);

    set_fx_mod_headers();

    if (from_random) {
        d3.select("#" + val_id).attr("value", knob_val);
        d3.select("#" + val_id).property("value", knob_val);
    }

    //Update the FX and MOD knob if TYPE changes
    const type_knob_ids = ["knob_FX1_TYPE", "knob_FX2_TYPE", "knob_FX3_TYPE", "knob_M1_MODE", "knob_M2_MODE", "knob_M3_MODE"];
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
            new_knob_data = d3.filter(data, (d) => (d.TYPE == d3.select("#" + val_to_update).text()) & (d.CC_NAME == section + " PARAMETER " + e));

            //Update Knob heading
            d3.select("#knob_header_" + section + "_PARAMETER_" + e).text(new_knob_data[0].VAL_NAME);

            //Update Knob
            d3.select("#knob_" + section + "_PARAMETER_" + e)
                .attr("min", new_knob_data[0].VAL_MIN)
                .attr("max", new_knob_data[0].VAL_MAX)
                .attr("step", new_knob_data[0].VAL_STEP)
                .attr("value", new_knob_data[0].VAL_DEFAULT)
                .on("input", (e, d) => {
                    let names_list = d[1][0].NAMES == "-" ? "-" : d[1][0].NAMES.replaceAll("'", '"');
                    return knob_val_change(
                        d[1][0].CC_NUM,
                        d[1][0].CC_MIN,
                        d[1][0].CC_MAX,
                        d[1][0].VAL_MIN,
                        d[1][0].VAL_MAX,
                        d[1][0].VAL_STEP,
                        e.srcElement.value,
                        channel,
                        e.srcElement.id,
                        names_list,
                        d[1][0].SECTION,
                        d[1][0].CC_NAME,
                        false
                    );
                });

            d3.select("#val_" + section + "_PARAMETER_" + e).text((d) => {
                if (new_knob_data[0].NAMES == "-") {
                    return new_knob_data[0].VAL_DEFAULT;
                } else {
                    item_index = Math.round(new_knob_data[0].VAL_DEFAULT / new_knob_data[0].VAL_STEP);
                    return JSON.parse(new_knob_data[0].NAMES.replaceAll("'", '"'))[item_index];
                }
            });
        });
    }
}

function randomizer(local_state_data, section) {
    // Iterate through each state item.
    if (section) {
        section_data = d3.filter(local_state_data, (d) => d.section == section);
    } else {
        section_data = local_state_data;
    }
    section_data.forEach((d) => {
        scaled_midi_val = d3.scaleLinear().domain([d.val_min, d.val_max]).rangeRound([d.cc_min, d.cc_max]).clamp(true);
        let rand_val = d3.randomUniform(d.val_min, d.val_max)();
        knob_val_change(d.cc_num, d.cc_min, d.cc_max, d.val_min, d.val_max, d.val_step, rand_val, channel, d.val_id, d.names, d.section, d.cc_name, true);

        //TODO
        //Add the STEP option randmiser
    });
}
