import { Col, Row, Spinner } from "@canonical/react-components";
import { useSelector } from "react-redux";

import VaultSettings from "./VaultSettings";

import { useFetchActions, useWindowTitle } from "app/base/hooks";
import { actions as generalActions } from "app/store/general";
import { vaultEnabled as vaultEnabledSelectors } from "app/store/general/selectors";

const SecretStorage = (): JSX.Element => {
  const vaultEnabledLoaded = useSelector(vaultEnabledSelectors.loaded);
  useWindowTitle("Secret storage");

  useFetchActions([generalActions.fetchVaultEnabled]);

  if (!vaultEnabledLoaded) {
    return <Spinner text="Loading..." />;
  }

  return (
    <>
      <Row>
        <Col size={12}>
          <VaultSettings />
        </Col>
      </Row>
    </>
  );
};

export default SecretStorage;
