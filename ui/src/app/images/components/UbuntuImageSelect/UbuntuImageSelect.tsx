import { useEffect, useState } from "react";

import { Row } from "@canonical/react-components";
import { useFormikContext } from "formik";

import ArchSelect from "./ArchSelect";
import ReleaseSelect from "./ReleaseSelect";

import ImagesTable from "app/images/components/ImagesTable";
import type { ImageValue } from "app/images/types";
import type {
  BootResource,
  BootResourceUbuntuArch,
  NormalisedUbuntuRelease,
} from "app/store/bootresource/types";
import { archUnsupported } from "app/store/bootresource/utils";

type Props = {
  arches: BootResourceUbuntuArch[];
  releases: NormalisedUbuntuRelease[];
  resources: BootResource[];
};

const UbuntuImageSelect = ({
  arches,
  releases,
  resources,
}: Props): JSX.Element => {
  const { setFieldValue, values } =
    useFormikContext<{ images: ImageValue[] }>();
  const { images } = values;
  const availableArches = arches.filter((arch) => !arch.deleted);
  const availableReleases = releases.filter((release) => !release.deleted);
  const initialArches = arches.filter((arch) =>
    images.some((image) => image.arch === arch.name)
  );
  const initialReleases = releases.filter((release) =>
    images.some((image) => image.release === release.name)
  );
  const [selectedArches, setSelectedArches] = useState(initialArches);
  const [selectedReleases, setSelectedReleases] = useState(initialReleases);

  const handleReleaseChange = (release: NormalisedUbuntuRelease) => {
    let newReleases: NormalisedUbuntuRelease[] = [];
    if (selectedReleases.some((selected) => selected.name === release.name)) {
      newReleases = selectedReleases.filter(
        (selected) => selected.name !== release.name
      );
    } else {
      newReleases = [...selectedReleases, release];
    }
    // Remove arches that are not supported by all the newly selected releases.
    const newArches = selectedArches.filter((arch) =>
      newReleases.some((release) => !archUnsupported(release, arch.name))
    );
    setSelectedArches(newArches);
    setSelectedReleases(newReleases);
  };

  const handleArchChange = (arch: BootResourceUbuntuArch) => {
    let newArches: BootResourceUbuntuArch[] = [];
    if (selectedArches.some((selected) => selected.name === arch.name)) {
      newArches = selectedArches.filter(
        (selected) => selected.name !== arch.name
      );
    } else {
      newArches = [...selectedArches, arch];
    }
    setSelectedArches(newArches);
  };

  useEffect(() => {
    // Construct the images list based on changes to the selected arches/releases.
    const newImages: ImageValue[] = [];
    selectedReleases.forEach((release) => {
      selectedArches.forEach((arch) => {
        if (!archUnsupported(release, arch.name)) {
          newImages.push({
            arch: arch.name,
            release: release.name,
            os: "ubuntu",
            title: release.title,
          });
        }
      });
    });
    setFieldValue("images", newImages);
  }, [selectedArches, selectedReleases, setFieldValue]);

  return (
    <>
      <Row className="p-divider">
        <ReleaseSelect
          handleReleaseChange={handleReleaseChange}
          releases={availableReleases}
          selectedReleases={selectedReleases}
        />
        <ArchSelect
          arches={availableArches}
          handleArchChange={handleArchChange}
          selectedArches={selectedArches}
          selectedReleases={selectedReleases}
        />
      </Row>
      <div className="u-sv2"></div>
      <ImagesTable images={images} releases={releases} resources={resources} />
    </>
  );
};

export default UbuntuImageSelect;
