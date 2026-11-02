import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
import {
  useAppMetafields,
  useBuyerJourneyIntercept,
  useCustomer,
} from "@shopify/ui-extensions/checkout/preact";

// import local dara
import {
  ProgramTypeList,  
  IcsProgramList,
  IcsSubProgramList,
  ParamedProgramList,
  VytaProgramList,
  ThornbrookHomecareProgramList,
  CarecorProgramList,
  SilverSpecialtyRxList,
  ConsumableLocationList,
  ConsumableProgramList,
  BayshoreBranchProvinceList,
  BayshoreBranchProgramList,
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
const WSIB_ORDER_LABEL = "WSIB(#1000102)";

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

function formatProgramInfo(program, billingNumber) {
  if (program === "WSIB") {
    return `${WSIB_ORDER_LABEL} ${billingNumber}`;
  }
  return `${program} ${billingNumber}`;
}

function ProgramSelect({ label, options, value, onChange, formatLabel }) {
  return (
    <s-select
      label={label}
      placeholder="Select an option"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      {options.map((option) => (
        <s-option key={option} value={option}>
          {formatLabel ? formatLabel(option) : option}
        </s-option>
      ))}
    </s-select>
  );
}

// 1. Render the extension (target is set in shopify.extension.toml)
export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
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
        shopify.applyAttributeChange({
          key: "Program Info",
          type: "updateAttribute",
          value: formatProgramInfo(programName, billingNumber),
        });
      }
      else if (billingNumber === "") {
        shopify.applyAttributeChange({
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
    <s-box border="base base dotted" padding="small">
      <s-stack gap="base">
        <s-heading>Billing</s-heading>
        {!isAuthorized ? (
          <s-banner tone="critical">{UNAUTHORIZED_MESSAGE}</s-banner>
        ) : (
          <>
            {!isBillingComplete && (
              <s-banner tone="warning">{INCOMPLETE_MESSAGE}</s-banner>
            )}
            <ProgramSelect
              label="Select Program"
              options={allowedPrograms}
              value={selectedProgramOption}
              onChange={handleCheckboxChange}
            />
            {/* display program detail section */}
            {selectedProgramOption === "ICS" && (
              <>
                <ProgramSelect
                  label="Select Program"
                  options={Object.values(IcsProgramList)}
                  value={subProgramName}
                  onChange={handleSubProgramChange}
                />
                {subProgramName && (
                  <ProgramSelect
                    label="Select Program"
                    options={Object.values(IcsSubProgramList[subProgramName])}
                    value={selectedBilling}
                    onChange={handleBillingChange}
                  />
                )}
              </>
            )}
            {selectedProgramOption === "Paramed" && (
              <ProgramSelect
                label="Select Program"
                options={Object.values(ParamedProgramList)}
                value={selectedBilling}
                onChange={handleBillingChange}
              />
            )}
            {selectedProgramOption === "WSIB" && (
              <s-text-field
                label={`${selectedProgramOption} Billing Number`}
                name={`${selectedProgramOption} Billing Number`}
                onChange={(event) => setBillingNumber(event.currentTarget.value)}
                value={billingNumber}
              />
            )}
            {selectedProgramOption === "Vyta" && (
              <ProgramSelect
                label="Select Program"
                options={Object.values(VytaProgramList)}
                value={selectedBilling}
                onChange={handleBillingChange}
              />
            )}
            {selectedProgramOption === "Thornbrook Homecare" && (
              <ProgramSelect
                label="Select Program"
                options={Object.values(ThornbrookHomecareProgramList)}
                value={selectedBilling}
                onChange={handleBillingChange}
              />
            )}
            {selectedProgramOption === "Carecor" && (
              <ProgramSelect
                label="Select Program"
                options={Object.values(CarecorProgramList)}
                value={selectedBilling}
                onChange={handleBillingChange}
              />
            )}
            {selectedProgramOption === "Silver Specialty Rx" && (
              <ProgramSelect
                label="Select Program"
                options={Object.values(SilverSpecialtyRxList)}
                value={selectedBilling}
                onChange={handleBillingChange}
              />
            )}
            {selectedProgramOption === "Consumable" && (
              <>
                <ProgramSelect
                  label="Select Location"
                  options={Object.values(ConsumableLocationList)}
                  value={subProgramName}
                  onChange={handleSubProgramChange}
                />
                {subProgramName && ConsumableProgramList[subProgramName] && (
                  <ProgramSelect
                    label="Select Program"
                    options={Object.values(ConsumableProgramList[subProgramName])}
                    value={selectedBilling}
                    onChange={handleBillingChange}
                    formatLabel={boldLocationLabel}
                  />
                )}
              </>
            )}
            {selectedProgramOption === "Bayshore Branch" && (
              <>
                <ProgramSelect
                  label="Select Province"
                  options={Object.values(BayshoreBranchProvinceList)}
                  value={subProgramName}
                  onChange={handleSubProgramChange}
                />
                {subProgramName && BayshoreBranchProgramList[subProgramName] && (
                  <ProgramSelect
                    label="Select Branch"
                    options={Object.values(BayshoreBranchProgramList[subProgramName])}
                    value={selectedBilling}
                    onChange={handleBillingChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </s-stack>
    </s-box>
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
