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
  useAppMetafields,
  useBuyerJourneyIntercept,
  useCustomer,
  useInstructions,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect, useMemo } from "react";

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

const PROGRAM_TYPES = Object.values(ProgramTypeList);
const PROGRAM_TAGS_NAMESPACE = "custom";
const PROGRAM_TAGS_KEY = "program_tags";
const UNAUTHORIZED_MESSAGE =
  "You're not authorized to complete the checkout. Please email prorx@bayshore.ca";
const INCOMPLETE_MESSAGE =
  "Please complete all billing fields before completing checkout.";

function parseProgramTags(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    // Fall through to comma-separated values.
  }

  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  const customer = useCustomer();
  const appMetafields = useAppMetafields();
  const [selectedProgramOption, setSelectedProgramOption] = useState("");
  const [subProgramName, setSubProgramName] = useState("");
  const [selectedBilling, setSelectedBilling] = useState("");
  const [billingNumber, setBillingNumber] = useState("");
  const [programName, setProgramName] = useState("");

  const allowedPrograms = useMemo(() => {
    const programTagsEntry = appMetafields.find(
      (entry) =>
        entry.target.type === "customer" &&
        entry.metafield.namespace === PROGRAM_TAGS_NAMESPACE &&
        entry.metafield.key === PROGRAM_TAGS_KEY
    );
    const customerTags = parseProgramTags(programTagsEntry?.metafield.value);

    return PROGRAM_TYPES.filter((program) =>
      customerTags.some((tag) => tag.toLowerCase() === program.toLowerCase())
    );
  }, [appMetafields]);

  const isAuthorized = Boolean(customer) && allowedPrograms.length > 0;
  const isBillingComplete = Boolean(
    selectedProgramOption && billingNumber.trim()
  );

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

  useEffect(() => {
    if (allowedPrograms.length === 1) {
      const onlyProgram = allowedPrograms[0];
      if (selectedProgramOption !== onlyProgram) {
        setSelectedProgramOption(onlyProgram);
        setProgramName(onlyProgram);
        setBillingNumber("");
        setSelectedBilling("");
        setSubProgramName("");
      }
      return;
    }

    if (
      selectedProgramOption &&
      !allowedPrograms.includes(selectedProgramOption)
    ) {
      setSelectedProgramOption("");
      setProgramName("");
      setBillingNumber("");
      setSelectedBilling("");
      setSubProgramName("");
    }
  }, [allowedPrograms, selectedProgramOption]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (!canBlockProgress) {
      return { behavior: "allow" };
    }

    if (!isAuthorized) {
      return {
        behavior: "block",
        reason: UNAUTHORIZED_MESSAGE,
        errors: [{ message: UNAUTHORIZED_MESSAGE }],
      };
    }

    if (!isBillingComplete) {
      return {
        behavior: "block",
        reason: INCOMPLETE_MESSAGE,
        errors: [{ message: INCOMPLETE_MESSAGE }],
      };
    }

    return { behavior: "allow" };
  });

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
      {!isAuthorized ? (
        <Banner status="critical">{UNAUTHORIZED_MESSAGE}</Banner>
      ) : (
        <>
          {!isBillingComplete && (
            <Banner status="warning">{INCOMPLETE_MESSAGE}</Banner>
          )}
          <Select
              label="Select Program"
              options={allowedPrograms.map((value) => ({
                label: value,
                value: value,
              }))}
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
              value={billingNumber}
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
          {selectedProgramOption === "Consumable" && (
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
              value={billingNumber}
              />
            </>
          )}
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
