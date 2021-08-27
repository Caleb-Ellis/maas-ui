import { useState } from "react";

import { Icon, MainTable, Spinner } from "@canonical/react-components";
import classNames from "classnames";

import DeleteImageConfirm from "./DeleteImageConfirm";

import DoubleRow from "app/base/components/DoubleRow";
import TableActions from "app/base/components/TableActions";
import type { ImageValue } from "app/images/types";
import type {
  BootResource,
  NormalisedUbuntuRelease,
} from "app/store/bootresource/types";
import { splitResourceName } from "app/store/bootresource/utils";

type Props = {
  images: ImageValue[];
  releases?: NormalisedUbuntuRelease[];
  resources: BootResource[];
};

/**
 * Check whether a given resource matches a form image value.
 * @param resource - the resource to check.
 * @param image - the form image value to check against.
 * @returns resource matches form image value.
 */
const resourceMatchesImage = (
  resource: BootResource,
  image: ImageValue
): boolean => {
  const { os, release } = splitResourceName(resource.name);
  return (
    image.os === os && image.release === release && image.arch === resource.arch
  );
};

/**
 * Generates a row based on a form image value.
 * @param image - the image value from which to generate the row.
 * @returns row generated from form image value.
 */
const generateImageRow = (image: ImageValue) => {
  return {
    columns: [
      {
        content: image.title,
        className: "release-col",
        "data-test": "new-image-title",
      },
      { content: image.arch, className: "arch-col" },
      { content: "—", className: "size-col" },
      {
        content: (
          <DoubleRow
            data-test="new-image-status"
            icon={<Icon name="pending" />}
            primary="Selected for download"
          />
        ),
        className: "status-col",
      },
      {
        content: "",
        className: "actions-col u-align--right",
      },
    ],
    key: `${image.os}-${image.release}-${image.arch}`,
    sortData: {
      title: image.title,
      arch: image.arch,
    },
  };
};
/**
 * Generates a row based on a resource.
 * @param resource - the resource from which to generate the row.
 * @param releases - the list of releases relevant to the images table.
 * @param expanded - the resource id of the expanded row.
 * @param setExpanded - function to expand the row of a resource.
 * @param unchecked - whether the resource checkbox is unchecked.
 * @returns row generated from resource.
 */
const generateResourceRow = (
  resource: BootResource,
  releases: NormalisedUbuntuRelease[],
  expanded: BootResource["id"] | null,
  setExpanded: (id: BootResource["id"] | null) => void,
  unchecked = false
) => {
  let canBeDeleted = false;
  const release = releases.find(
    (r) => r.name === splitResourceName(resource.name).release
  );
  if (release) {
    canBeDeleted = release.deleted;
  }
  const isExpanded = expanded === resource.id;
  let statusIcon = <Spinner />;
  let statusText = resource.status;

  if (unchecked) {
    statusIcon = <Icon name="error" />;
    statusText = "Will be deleted";
  } else if (resource.complete) {
    statusIcon = <Icon name="success" />;
  }

  return {
    className: classNames("p-table__row", {
      "is-active": isExpanded,
    }),
    columns: [
      { content: resource.title, className: "release-col" },
      { content: resource.arch, className: "arch-col" },
      { content: resource.size, className: "size-col" },
      {
        content: (
          <DoubleRow
            data-test="resource-status"
            icon={statusIcon}
            primary={statusText}
          />
        ),
        className: "status-col",
      },
      {
        content: (
          <TableActions
            data-test="image-actions"
            deleteDisabled={!canBeDeleted}
            onDelete={() => setExpanded(resource.id)}
          />
        ),
        className: "actions-col u-align--right",
      },
    ],
    expanded: isExpanded,
    expandedContent: isExpanded ? (
      <DeleteImageConfirm
        closeForm={() => setExpanded(null)}
        resource={resource}
      />
    ) : null,
    key: `resource-${resource.id}`,
    sortData: {
      title: resource.title,
      arch: resource.arch,
      size: resource.size,
      status: resource.status,
    },
  };
};

const ImagesTable = ({
  images,
  releases = [],
  resources,
}: Props): JSX.Element => {
  const [expanded, setExpanded] = useState<BootResource["id"] | null>(null);
  // Resources set for deletion are those that exist in the database, but do not
  // exist in the form's images value, i.e. the checkbox was unchecked.
  const uncheckedResources = resources.filter((resource) =>
    images.every((image) => !resourceMatchesImage(resource, image))
  );
  const rows = images
    .map((image) => {
      const resource = resources.find((resource) =>
        resourceMatchesImage(resource, image)
      );
      if (resource) {
        return generateResourceRow(
          resource,
          releases,
          expanded,
          setExpanded,
          false
        );
      } else {
        return generateImageRow(image);
      }
    })
    .concat(
      uncheckedResources.map((resource) =>
        generateResourceRow(resource, releases, expanded, setExpanded, true)
      )
    );

  return (
    <MainTable
      className="images-table p-table-expanding--light"
      defaultSort="title"
      defaultSortDirection="descending"
      emptyStateMsg="No images have been selected."
      expanding
      headers={[
        { content: "Release", className: "release-col", sortKey: "title" },
        { content: "Architecture", className: "arch-col", sortKey: "arch" },
        { content: "Size", className: "size-col", sortKey: "size" },
        {
          content: <span className="u-nudge-right--large">Status</span>,
          className: "status-col",
          sortKey: "status",
        },
        { content: "Actions", className: "actions-col u-align--right" },
      ]}
      rows={rows}
      sortable
    />
  );
};

export default ImagesTable;
