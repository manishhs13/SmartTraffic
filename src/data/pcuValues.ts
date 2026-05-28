/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VehicleType } from '../types';

export const VECHICLE_TYPES: VehicleType[] = [
  { id: 'bicycle', name: 'Bicycle', pcuValue: 0.5, category: 'other' },
  { id: 'bike', name: 'Bike (Motorcycle)', pcuValue: 0.5, category: 'two_wheeler' },
  { id: 'scooter', name: 'Scooter', pcuValue: 0.5, category: 'two_wheeler' },
  { id: 'auto_rickshaw', name: 'Auto-rickshaw', pcuValue: 0.75, category: 'three_wheeler' },
  { id: 'car', name: 'Car', pcuValue: 1.0, category: 'four_wheeler' },
  { id: 'jeep', name: 'Jeep', pcuValue: 1.0, category: 'four_wheeler' },
  { id: 'van', name: 'Van', pcuValue: 1.0, category: 'four_wheeler' },
  { id: 'mini_bus', name: 'Mini Bus', pcuValue: 1.5, category: 'heavy' },
  { id: 'bus', name: 'Bus', pcuValue: 3.0, category: 'heavy' },
  { id: 'truck', name: 'Truck', pcuValue: 3.0, category: 'heavy' },
  { id: 'tractor', name: 'Tractor', pcuValue: 4.0, category: 'other' },
  { id: 'lcv', name: 'LCV (Light Comm. Veh.)', pcuValue: 1.5, category: 'four_wheeler' },
  { id: 'heavy_vehicle', name: 'Heavy Vehicle', pcuValue: 3.0, category: 'heavy' },
  { id: 'multi_axle', name: 'Multi Axle Vehicle', pcuValue: 4.5, category: 'heavy' },
];

export const getVehicleById = (id: string): VehicleType | undefined => {
  return VECHICLE_TYPES.find(v => v.id === id);
};
