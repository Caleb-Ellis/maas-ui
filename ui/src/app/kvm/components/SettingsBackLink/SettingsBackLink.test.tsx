import { mount } from "enzyme";
import * as ReactRouterDOM from "react-router-dom";
import { MemoryRouter } from "react-router-dom";

import SettingsBackLink from "./SettingsBackLink";

const mockUseLocation = {
  hash: "",
  pathname: "/some/url",
  search: "",
  state: undefined,
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

describe("SettingsBackLink", () => {
  it("does not render if location state is undefined", () => {
    jest
      .spyOn(ReactRouterDOM, "useLocation")
      .mockReturnValue({ ...mockUseLocation, state: undefined });
    const wrapper = mount(
      <MemoryRouter>
        <SettingsBackLink />
      </MemoryRouter>
    );

    expect(wrapper.find("Link").exists()).toBe(false);
  });

  it("does not render if location state does not include returnURL", () => {
    jest
      .spyOn(ReactRouterDOM, "useLocation")
      .mockReturnValue({ ...mockUseLocation, state: { returnURL: "" } });
    const wrapper = mount(
      <MemoryRouter>
        <SettingsBackLink />
      </MemoryRouter>
    );

    expect(wrapper.find("Link").exists()).toBe(false);
  });

  it("renders if location state includes returnURL", () => {
    const returnURL = "/some/other/url";
    jest
      .spyOn(ReactRouterDOM, "useLocation")
      .mockReturnValue({ ...mockUseLocation, state: { returnURL } });
    const wrapper = mount(
      <MemoryRouter>
        <SettingsBackLink />
      </MemoryRouter>
    );

    expect(wrapper.find("Link").exists()).toBe(true);
    expect(wrapper.find("Link").prop("to")).toBe(returnURL);
  });
});
