import type {
  BootResource,
  BootResourceUbuntuArch,
  NormalisedUbuntuRelease,
} from "./types";

export const archUnsupported = (
  release: NormalisedUbuntuRelease,
  archName: BootResourceUbuntuArch["name"]
): boolean =>
  "unsupported_arches" in release &&
  release.unsupported_arches.includes(archName);

export const splitResourceName = (
  name: BootResource["name"]
): { os: string; release: string } => {
  const split = name.split("/");
  return split.length === 2
    ? { os: split[0], release: split[1] }
    : { os: "", release: "" };
};

export const splitImageName = (
  name: string
): { os: string; arch: string; subArch: string; release: string } => {
  const split = name.split("/");
  return split.length === 4
    ? { os: split[0], arch: split[1], subArch: split[2], release: split[3] }
    : { os: "", arch: "", subArch: "", release: "" };
};
