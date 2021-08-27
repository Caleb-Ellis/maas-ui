import { Col, Icon, Input, Tooltip } from "@canonical/react-components";

import type {
  BootResourceUbuntuArch,
  NormalisedUbuntuRelease,
} from "app/store/bootresource/types";
import { archUnsupported } from "app/store/bootresource/utils";

type Props = {
  arches: BootResourceUbuntuArch[];
  handleArchChange: (arch: BootResourceUbuntuArch) => void;
  selectedReleases: NormalisedUbuntuRelease[];
  selectedArches: BootResourceUbuntuArch[];
};

const ArchSelect = ({
  arches,
  handleArchChange,
  selectedArches,
  selectedReleases,
}: Props): JSX.Element => {
  return (
    <Col className="p-divider__block" size={6}>
      <h4>Architectures</h4>
      <ul className="p-list">
        {arches.map((arch) => {
          const unsupportedReleaseTitles = selectedReleases
            .filter((release) => archUnsupported(release, arch.name))
            .map((release) => release.title)
            .sort();
          const isSelected = selectedArches.some(
            (selected) => selected.name === arch.name
          );
          const isLastArch = isSelected && selectedArches.length === 1;
          const isDisabled =
            isLastArch ||
            selectedReleases.every((release) =>
              archUnsupported(release, arch.name)
            );
          const showUnsupportedWarning =
            !isDisabled && unsupportedReleaseTitles.length > 0;

          return (
            <li className="p-list__item u-sv1" key={arch.name}>
              <Input
                checked={isSelected}
                disabled={isDisabled}
                id={`arch-${arch.name}`}
                label={
                  <>
                    <span>{arch.name}</span>
                    {(isLastArch || showUnsupportedWarning) && (
                      <Tooltip
                        className="u-nudge-right--small"
                        data-test="unsupported-tooltip"
                        message={
                          isLastArch
                            ? "At least one architecture must be selected."
                            : `Not supported on ${unsupportedReleaseTitles.join(
                                ", "
                              )}.`
                        }
                      >
                        {isLastArch ? (
                          <Icon name="help" />
                        ) : (
                          <>
                            <Icon name="warning" />
                            <span className="u-nudge-right--small">
                              This architecture is not supported on all selected
                              releases.
                            </span>
                          </>
                        )}
                      </Tooltip>
                    )}
                  </>
                }
                onChange={() => handleArchChange(arch)}
                type="checkbox"
              />
            </li>
          );
        })}
      </ul>
    </Col>
  );
};

export default ArchSelect;
