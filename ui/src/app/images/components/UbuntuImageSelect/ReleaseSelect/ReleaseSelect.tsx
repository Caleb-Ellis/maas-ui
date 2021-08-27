import { Col, Icon, Input, Row, Tooltip } from "@canonical/react-components";
import { useSelector } from "react-redux";

import type { NormalisedUbuntuRelease } from "app/store/bootresource/types";
import configSelectors from "app/store/config/selectors";
import { simpleSortByKey } from "app/utils";

type Props = {
  handleReleaseChange: (release: NormalisedUbuntuRelease) => void;
  releases: NormalisedUbuntuRelease[];
  selectedReleases: NormalisedUbuntuRelease[];
};

const ReleaseSelect = ({
  handleReleaseChange,
  releases,
  selectedReleases,
}: Props): JSX.Element => {
  const commissioningReleaseName = useSelector(
    configSelectors.commissioningDistroSeries
  );
  const [ltsReleases, nonLtsReleases] = releases.reduce<Props["releases"][]>(
    ([lts, nonLts], release, i) => {
      if (release.title.includes("LTS")) {
        lts.push(release);
      } else {
        nonLts.push(release);
      }
      if (i === releases.length - 1) {
        lts.sort(simpleSortByKey("title", { reverse: true }));
        nonLts.sort(simpleSortByKey("title", { reverse: true }));
      }
      return [lts, nonLts];
    },
    [[], []]
  );

  const renderListItem = (release: NormalisedUbuntuRelease) => {
    const isSelected = selectedReleases.some(
      (selected) => selected.name === release.name
    );
    const isCommissioningRelease = release.name === commissioningReleaseName;
    const isDisabled = isSelected && isCommissioningRelease;
    return (
      <li className="p-list__item u-sv1" key={release.name}>
        <Input
          checked={isSelected}
          disabled={isDisabled}
          id={`release-${release.name}`}
          label={
            <>
              <span>{release.title}</span>
              {isCommissioningRelease && (
                <Tooltip
                  className="u-nudge-right--small"
                  data-test="is-commissioning-release-tooltip"
                  message="The default commissioning release must be selected."
                >
                  <Icon name="help" />
                </Tooltip>
              )}
            </>
          }
          onChange={() => handleReleaseChange(release)}
          type="checkbox"
        />
      </li>
    );
  };

  return (
    <Col className="p-divider__block" size={6}>
      <h4>Ubuntu releases</h4>
      <Row>
        <Col size={3}>
          <ul className="p-list" data-test="lts-releases">
            {ltsReleases.map((release) => renderListItem(release))}
          </ul>
        </Col>
        <Col size={3}>
          <ul className="p-list" data-test="non-lts-releases">
            {nonLtsReleases.map((release) => renderListItem(release))}
          </ul>
        </Col>
      </Row>
    </Col>
  );
};

export default ReleaseSelect;
