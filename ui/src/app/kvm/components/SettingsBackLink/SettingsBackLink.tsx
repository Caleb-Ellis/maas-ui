import { Icon } from "@canonical/react-components";
import { Link, useLocation } from "react-router-dom";

import type { AnyObject, WithReturnURL } from "app/base/types";

const SettingsBackLink = (): JSX.Element | null => {
  const location = useLocation();

  // Instead of using the WithReturnURL generic in useLocation(), we explicitly
  // check the existence and type of location.state because it can be defined
  // from anywhere and can take any shape.
  if (!location?.state) {
    return null;
  }
  const { state } = location;
  if (typeof state === "object" && !(state as AnyObject).returnURL) {
    return null;
  }
  return (
    <div className="settings-back-link">
      <Link
        className="settings-back-link__link"
        to={(state as WithReturnURL).returnURL}
      >
        <Icon className="u-rotate-right u-no-margin--left" name="chevron-up" />
        <span>Back</span>
      </Link>
      <hr className="settings-back-link__divider" />
    </div>
  );
};

export default SettingsBackLink;
