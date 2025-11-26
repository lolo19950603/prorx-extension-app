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
  VytaProgramList
} from "../data/BillingNumbers.jsx";

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
    if (option === "Others") {
      setSelectedProgramOption(option)
      setProgramName("")
      setBillingNumber("")
      setSelectedBilling("")
      setSubProgramName("")
    }
    else if (option === "Bayshore Consumable") {
      setProgramName("Bayshore")
      setBillingNumber("Consumable")
      setSelectedProgramOption(option)
    }
    else {
      setSelectedProgramOption(option)
      setProgramName(option)
      setBillingNumber("")
      setSelectedBilling("")
      setSubProgramName("")
    }
  };

  const handleSubProgramChange = (option) => {
    if (option !== subProgramName) {
      setSubProgramName(option)
      setBillingNumber("")
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
      {selectedProgramOption === "Others" && (
        <>
          <TextField
          label="Program Name"
          name="Program Name"
          onChange={(value) => setProgramName(value)}
          value={programName}
          />
          <TextField
          label="Billing Number"
          name="Billing Number"
          onChange={(value) => setBillingNumber(value)}
          valuvalue={billingNumber}
          />
        </>
      )}
    </BlockStack>
  );

  function handleBillingChange(value) {
    setSelectedBilling(value);
    if (subProgramName !== "") {
      setBillingNumber(subProgramName+" "+value)
    }
    else {
      setBillingNumber(value)
    }
  }
}