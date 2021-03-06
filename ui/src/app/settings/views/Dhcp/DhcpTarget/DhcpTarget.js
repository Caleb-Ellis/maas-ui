import { Link, Spinner } from "@canonical/react-components";
import PropTypes from "prop-types";
import React from "react";

import { useDhcpTarget } from "app/settings/hooks";

const generateURL = (url) =>
  `${process.env.REACT_APP_BASENAME}${process.env.REACT_APP_ANGULAR_BASENAME}${url}`;

const DhcpTarget = ({ nodeId, subnetId }) => {
  const { loading, loaded, target, type } = useDhcpTarget(nodeId, subnetId);

  if (loading || !loaded) {
    return <Spinner inline className="u-no-margin u-no-padding" />;
  }

  const name = subnetId ? (
    target.name
  ) : (
    <>
      {target.hostname}
      <small>.{target.domain.name}</small>
    </>
  );
  const url = generateURL(`/${type}/${nodeId || subnetId}`);
  return <Link href={url}>{name}</Link>;
};

DhcpTarget.propTypes = {
  nodeId: PropTypes.string,
  subnetId: PropTypes.number,
};

export default DhcpTarget;
