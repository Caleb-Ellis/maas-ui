import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import pluralize from "pluralize";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import {
  machine as machineActions,
  resourcepool as resourcePoolActions,
} from "app/base/actions";
import {
  machine as machineSelectors,
  resourcepool as resourcePoolSelectors,
} from "app/base/selectors";
import { useMachinesProcessing } from "app/machines/components/HeaderStrip/hooks";
import FormikForm from "app/base/components/FormikForm";
import FormCardButtons from "app/base/components/FormCardButtons";
import SetPoolFormFields from "./SetPoolFormFields";

const SetPoolSchema = Yup.object().shape({
  description: Yup.string(),
  name: Yup.string().required("Resource pool required"),
  poolSelection: Yup.string().oneOf(["create", "select"]).required(),
});

export const SetPoolForm = ({
  processing,
  setProcessing,
  setSelectedAction,
}) => {
  const dispatch = useDispatch();
  const [initialValues, setInitialValues] = useState({
    poolSelection: "select",
    description: "",
    name: "",
  });
  const selectedMachines = useSelector(machineSelectors.selected);
  const saved = useSelector(machineSelectors.saved);
  const machineErrors = useSelector(machineSelectors.errors);
  const poolErrors = useSelector(resourcePoolSelectors.errors);
  const resourcePools = useSelector(resourcePoolSelectors.all);
  const settingPoolSelected = useSelector(machineSelectors.settingPoolSelected);
  const errors =
    Object.keys(machineErrors).length > 0 ? machineErrors : poolErrors;

  useEffect(
    () => () => {
      dispatch(machineActions.cleanup());
      dispatch(resourcePoolActions.cleanup());
    },
    [dispatch]
  );

  useMachinesProcessing(
    processing,
    settingPoolSelected,
    setProcessing,
    setSelectedAction,
    "set-pool",
    Object.keys(errors).length > 0
  );

  return (
    <FormikForm
      buttons={FormCardButtons}
      buttonsBordered={false}
      errors={errors}
      initialValues={initialValues}
      submitLabel={`Set resource pool of ${selectedMachines.length} ${pluralize(
        "machine",
        selectedMachines.length
      )}`}
      onCancel={() => setSelectedAction(null, true)}
      onSaveAnalytics={{
        action: "Set resource pool",
        category: "Take action menu",
        label: "Set resource pool of selected machines",
      }}
      onSubmit={(values) => {
        if (values.poolSelection === "create") {
          const machineIDs = selectedMachines.map(({ system_id }) => system_id);
          dispatch(resourcePoolActions.createWithMachines(values, machineIDs));
        } else {
          const pool = resourcePools.find((pool) => pool.name === values.name);
          if (pool) {
            selectedMachines.forEach((machine) => {
              dispatch(machineActions.setPool(machine.system_id, pool.id));
            });
          }
        }
        // Store the values in case there are errors and the form needs to be
        // displayed again.
        setInitialValues(values);
        setProcessing(true);
      }}
      saving={processing}
      saved={saved}
      validationSchema={SetPoolSchema}
    >
      <SetPoolFormFields />
    </FormikForm>
  );
};

SetPoolForm.propTypes = {
  processing: PropTypes.bool,
  setProcessing: PropTypes.func.isRequired,
  setSelectedAction: PropTypes.func.isRequired,
};

export default SetPoolForm;
