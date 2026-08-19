import {
  Heading,
  Select,
  InlineStack,
  TextField,
  reactExtension,
  Banner,
  Checkbox,
  BlockStack,
  BlockSpacer,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";

// import local dara
import {
  ProgramTypeList,  
  IcsProgramList,
  IcsSubProgramList,
  ParamedProgramList,
  VytaProgramList,
  ThornbrookHomecareProgramList,
  CarecorProgramList,
  ConsumableLocationList,
  ConsumableProgramList,
} from "../data/BillingNumbers.jsx";

const boldLocationLabel = (label) =>
  label
    .replace(/Markham/g, "𝗠𝗮𝗿𝗸𝗵𝗮𝗺")
    .replace(/Kitchener/g, "𝗞𝗶𝘁𝗰𝗵𝗲𝗻𝗲𝗿");

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  const [selectedProgramOption, setSelectedProgramOption] = useState("");
  const [subProgramName, setSubProgramName] = useState("");
  const [selectedBilling, setSelectedBilling] = useState("");
  const [billingNumber, setBillingNumber] = useState("");
  const [programName, setProgramName] = useState("");

    // This useEffect runs every time selectedProgram changes
    useEffect(() => {
      if (billingNumber !== "") {
        applyAttributeChange({
          key: "Program Info",
          type: "updateAttribute",
          value: programName + " " + billingNumber,
        });
      }
      else if (billingNumber === "") {
        applyAttributeChange({
          key: "Program Info",
          type: "updateAttribute",
          value: "",
        });
      }
    }, [billingNumber]);


  const handleCheckboxChange = (option) => {
    setSelectedProgramOption(option)
    setProgramName(option)
    setBillingNumber("")
    setSelectedBilling("")
    setSubProgramName("")
  };

  const handleSubProgramChange = (option) => {
    if (option !== subProgramName) {
      setBillingNumber("")
      setSelectedBilling("")
    }
    setSubProgramName(option)
  };
  // 3. Render a UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Heading level={1}>Billing</Heading>
      {/* display check boxes */}
      <Select
          label="Select Program"
          options={Object.entries(ProgramTypeList).map(
            ([key, value]) => ({
              label: value,
              value: value,
            })
          )}
          value={selectedProgramOption}
          onChange={handleCheckboxChange}
          />
      {/* display program detail section */}
      {selectedProgramOption === "ICS" && (
        <>
          <Select
          label="Select Program"
          options={Object.entries(IcsProgramList).map(
            ([key, value]) => ({
              label: value,
              value: value,
            })
          )}
          value={subProgramName}
          onChange={handleSubProgramChange}
          />
          {subProgramName && (
            <Select
            label="Select Program"
            options={Object.entries(IcsSubProgramList[subProgramName]).map(
              ([key, value]) => ({
                label: value,
                value: value,
              })
            )}
            value={selectedBilling}
            onChange={handleBillingChange}
            />
          )}
        </>
      )}
      {selectedProgramOption === "Paramed" && (
        <Select
        label="Select Program"
        options={Object.entries(ParamedProgramList).map(
          ([key, value]) => ({
            label: value,
            value: value,
          })
        )}
        value={selectedBilling}
        onChange={handleBillingChange}
        />
      )}
      {selectedProgramOption === "WSIB" && (
        <>
          <TextField
          label={`${selectedProgramOption} Billing Number`}
          name={`${selectedProgramOption} Billing Number`}
          onChange={(value) => setBillingNumber(value)}
          valuvalue={billingNumber}
          />
        </>
      )}
      {selectedProgramOption === "Vyta" && (
        <Select
        label="Select Program"
        options={Object.entries(VytaProgramList).map(
          ([key, value]) => ({
            label: value,
            value: value,
          })
        )}
        value={selectedBilling}
        onChange={handleBillingChange}
        />
      )}
      {selectedProgramOption === "Thornbrook Homecare" && (
        <Select
        label="Select Program"
        options={Object.entries(ThornbrookHomecareProgramList).map(
          ([key, value]) => ({
            label: value,
            value: value,
          })
        )}
        value={selectedBilling}
        onChange={handleBillingChange}
        />
      )}
      {selectedProgramOption === "Carecor" && (
        <Select
        label="Select Program"
        options={Object.entries(CarecorProgramList).map(
          ([key, value]) => ({
            label: value,
            value: value,
          })
        )}
        value={selectedBilling}
        onChange={handleBillingChange}
        />
      )}
      {selectedProgramOption === "Bayshore Consumable" && (
        <>
          <Select
          label="Select Location"
          options={Object.entries(ConsumableLocationList).map(
            ([key, value]) => ({
              label: value,
              value: value,
            })
          )}
          value={subProgramName}
          onChange={handleSubProgramChange}
          />
          {subProgramName && ConsumableProgramList[subProgramName] && (
            <Select
            label="Select Program"
            options={Object.entries(ConsumableProgramList[subProgramName]).map(
              ([key, value]) => ({
                label: boldLocationLabel(value),
                value: value,
              })
            )}
            value={selectedBilling}
            onChange={handleBillingChange}
            />
          )}
        </>
      )}
      {selectedProgramOption === "Bayshore Branch" && (
        <>
          <TextField
          label={`${selectedProgramOption} Billing Number`}
          name={`${selectedProgramOption} Billing Number`}
          onChange={(value) => setBillingNumber(value)}
          valuvalue={billingNumber}
          />
        </>
      )}
    </BlockStack>
  );

  function handleBillingChange(value) {
    setSelectedBilling(value);
    if (subProgramName !== "" && selectedProgramOption === "ICS") {
      setBillingNumber(subProgramName+" "+value)
    }
    else {
      setBillingNumber(value)
    }
  }
}