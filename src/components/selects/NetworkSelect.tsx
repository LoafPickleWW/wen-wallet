import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import { ChangeEvent } from "react";
import useConnectionStore from "../../store/connectionStore";

export default function NetworkSelect() {
  const { setNetworkType, networkType } = useConnectionStore((state) => state);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNetworkType(event.target.checked ? "mainnet" : "testnet");
  };

  return (
    <FormGroup sx={{ justifyContent: "center" }}>
      <FormControlLabel
        label={
          <span className="font-sans text-primary-gray">
            {networkType.charAt(0).toUpperCase() + networkType.slice(1)}
          </span>
        }
        checked={networkType === "mainnet"}
        control={
          <Switch
            checked={networkType === "mainnet"}
            onChange={handleChange}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: "#f57b14",
              },
              "& .MuiSwitch-track": {
                backgroundColor: "#fff",
              },
              "& .Mui-checked": {
                color: "#f57b14",
              },
            }}
            style={{ color: "#f57b14" }}
          />
        }
        classes={{ label: "text-white" }}
      />
    </FormGroup>
  );
}
