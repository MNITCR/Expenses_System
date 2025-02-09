import React from "react";
import {
    Dropdown,
    Radio,
    Label,
  } from "flowbite-react";
const Dropdowns = ({ options, label, onChange, selectedOption }) => {
  return (
    <div>
      <Dropdown theme={{ floating: { target: "w-full md:w-full" }}} color="gray" label={label} dismissOnClick={false} style={{padding: "0px", background: ""}}>
        <Dropdown.Item>
          <fieldset className="flex max-w-md flex-col gap-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Radio
                  id={option.value}
                  name="day"
                  value={option.value}
                  onChange={() => onChange(option.value)}
                  checked={selectedOption === option.value}
                />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </fieldset>
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};

export default Dropdowns;
