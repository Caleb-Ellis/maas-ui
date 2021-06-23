import type { PayloadAction } from "@reduxjs/toolkit";
import { call } from "redux-saga/effects";
import type { SagaGenerator } from "typed-redux-saga";

import type { WebSocketClient } from "../../../websocket-client";

import { actions as domainActions } from "app/store/domain";
import type { UpdateRecordParams } from "app/store/domain/types";
import { isAddressRecord } from "app/store/domain/utils";
import { actions as machineActions } from "app/store/machine";
import type { Machine } from "app/store/machine/types";
import { actions as resourcePoolActions } from "app/store/resourcepool";
import type {
  CreateWithMachinesParams,
  ResourcePool,
} from "app/store/resourcepool/types";

export type MessageHandler = {
  action: string;
  method: (...args: unknown[]) => unknown;
};

/**
 * Generate functions that will use the response to create the dispatchable
 * action to set the pool for each machine.
 * @param machineIDs - A list of machine ids.
 * @returns The list of action creator functions.
 */
export const generateMachinePoolActionCreators = (
  machineIDs: Machine["system_id"][]
) =>
  machineIDs.map(
    (machineID) => (result: ResourcePool) =>
      machineActions.setPool({ systemId: machineID, poolId: result.id })
  );

/**
 * Handle creating a pool and then attaching machines to that pool.
 * @param socketClient - The websocket client instance.
 * @param sendMessage - The saga that handles sending websocket messages.
 * @param action - The redux action with pool and machine data.
 */
export function* createPoolWithMachines(
  socketClient: WebSocketClient,
  sendMessage,
  action: PayloadAction<{ params: CreateWithMachinesParams }>
): SagaGenerator<void> {
  const { machineIDs, pool } = action.payload.params;
  const actionCreators = yield call(
    generateMachinePoolActionCreators,
    machineIDs
  );
  // Send the initial action via the websocket.
  yield call(
    sendMessage,
    socketClient,
    resourcePoolActions.create(pool),
    actionCreators
  );
}

/**
 * Handle updating a domain's DNS resource, then updating the DNS data.
 * @param socketClient - The websocket client instance.
 * @param sendMessage - The saga that handles sending websocket messages.
 * @param action - The redux action with updated record data.
 */
export function* updateDomainRecord(
  socketClient: WebSocketClient,
  sendMessage,
  action: PayloadAction<{ params: UpdateRecordParams }>
): SagaGenerator<void> {
  const { domain, name, resource, rrdata, ttl } = action.payload.params;
  const initialAction = domainActions.updateDNSResource({
    dnsresource_id: resource.dnsresource_id,
    domain,
    name,
  });
  const nextAction = isAddressRecord(resource.rrtype)
    ? domainActions.updateAddressRecord({
        address_ttl: ttl,
        domain,
        ip_addresses: rrdata.split(/[ ,]+/),
        name,
        previous_name: resource.name,
        previous_rrdata: resource.rrdata,
      })
    : domainActions.updateDNSData({
        dnsdata_id: resource.dnsdata_id,
        dnsresource_id: resource.dnsresource_id,
        domain,
        rrdata,
        ttl,
      });
  yield call(sendMessage, socketClient, initialAction, [() => nextAction]);
}

// Sagas to be handled by the websocket channel.
const handlers = [
  {
    action: "domain/updateRecord",
    method: updateDomainRecord,
  },
  {
    action: "resourcepool/createWithMachines",
    method: createPoolWithMachines,
  },
];

export default handlers;
