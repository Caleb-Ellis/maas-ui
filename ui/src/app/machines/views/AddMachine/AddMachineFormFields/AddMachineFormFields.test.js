import { act } from "react-dom/test-utils";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { Provider } from "react-redux";

import AddMachineForm from "../AddMachineForm";

const mockStore = configureStore();

describe("AddMachineFormFields", () => {
  let initialState;
  beforeEach(() => {
    initialState = {
      config: {
        items: [{ name: "maas_name", value: "MAAS" }],
      },
      domain: {
        items: [
          {
            id: 0,
            name: "maas",
          },
        ],
        loaded: true,
      },
      general: {
        architectures: {
          data: ["amd64/generic"],
          loaded: true,
        },
        defaultMinHweKernel: {
          data: "ga-16.04",
          loaded: true,
        },
        hweKernels: {
          data: [
            ["ga-16.04", "xenial (ga-16.04)"],
            ["ga-18.04", "bionic (ga-18.04)"],
          ],
          loaded: true,
        },
        powerTypes: {
          data: [
            {
              name: "manual",
              description: "Manual",
              fields: [],
            },
          ],
          loaded: true,
        },
      },
      machine: {
        saved: false,
        saving: false,
      },
      resourcepool: {
        items: [
          {
            id: 0,
            name: "default",
          },
        ],
        loaded: true,
      },
      zone: {
        items: [
          {
            id: 0,
            name: "default",
          },
        ],
        loaded: true,
      },
    };
  });

  it("correctly sets minimum kernel to default", () => {
    const state = { ...initialState };
    state.general.defaultMinHweKernel.data = "ga-18.04";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Select[name='min_hwe_kernel']").props().value).toBe(
      "ga-18.04"
    );
  });

  it("can add extra mac address fields", async () => {
    const state = { ...initialState };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='extra-macs-0']").exists()).toBe(false);
    expect(wrapper.find("[data-test='extra-macs-1']").exists()).toBe(false);
    await act(async () => {
      wrapper.find("[data-test='add-extra-mac'] button").simulate("click");
    });
    wrapper.update();
    expect(wrapper.find("[data-test='extra-macs-0']").exists()).toBe(true);
    expect(wrapper.find("[data-test='extra-macs-1']").exists()).toBe(false);
    await act(async () => {
      wrapper.find("[data-test='add-extra-mac'] button").simulate("click");
    });
    wrapper.update();
    expect(wrapper.find("[data-test='extra-macs-0']").exists()).toBe(true);
    expect(wrapper.find("[data-test='extra-macs-1']").exists()).toBe(true);
  });

  it("can remove extra mac address fields", async () => {
    const state = { ...initialState };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );
    await act(async () => {
      wrapper.find("[data-test='add-extra-mac'] button").simulate("click");
    });
    wrapper.update();
    expect(wrapper.find("[data-test='extra-macs-0']").exists()).toBe(true);
    await act(async () => {
      wrapper.find("[data-test='extra-macs-0'] button").simulate("click");
    });
    wrapper.update();
    expect(wrapper.find("[data-test='extra-macs-0']").exists()).toBe(false);
  });
});
