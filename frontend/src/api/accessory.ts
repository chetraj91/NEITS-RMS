import api from "./axios";

// Get all accessories
export const getAccessories = () =>
  api.get("/accessories");

// Get active accessories
export const getActiveAccessories = () =>
  api.get("/accessories/active");

// Get accessories assigned to a device type
export const getAccessoriesByDeviceType = (
  deviceTypeId: string
) =>
  api.get(`/accessories/device-type/${deviceTypeId}`);

// Get complete accessory configuration for a device type
export const getDeviceTypeAccessoryConfiguration = (
  deviceTypeId: string
) =>
  api.get(
    `/accessories/device-type/${deviceTypeId}`
  );

// Create accessory
export const createAccessory = (data: {
  name: string;
  displayOrder?: number;
}) =>
  api.post("/accessories", data);

// Update accessory
export const updateAccessory = (
  id: string,
  data: {
    name?: string;
    active?: boolean;
    displayOrder?: number;
  }
) =>
  api.put(`/accessories/${id}`, data);

// Delete accessory
export const deleteAccessory = (id: string) =>
  api.delete(`/accessories/${id}`);

// Add accessory to device type
export const addAccessoryToDeviceType = (
  deviceTypeId: string,
  data: {
    accessoryId: string;
    visible?: boolean;
    required?: boolean;
    displayOrder?: number;
  }
) =>
  api.post(
    `/accessories/device-type/${deviceTypeId}`,
    data
  );

// Remove accessory from device type
export const removeAccessoryFromDeviceType = (
  deviceTypeId: string,
  accessoryId: string
) =>
  api.delete(
    `/accessories/device-type/${deviceTypeId}/${accessoryId}`
  );

// Update device-type accessory configuration
export const updateDeviceTypeAccessory = (
  deviceTypeId: string,
  accessoryId: string,
  data: {
    visible?: boolean;
    required?: boolean;
    displayOrder?: number;
  }
) =>
  api.put(
    `/accessories/device-type/${deviceTypeId}/${accessoryId}`,
    data
  );

  // Save complete accessory configuration for a device type
export const saveDeviceTypeAccessories = (
  deviceTypeId: string,
  accessories: {
    accessoryId: string;
    visible?: boolean;
    required?: boolean;
    displayOrder?: number;
  }[]
) =>
  api.put(
    `/accessories/device-type/${deviceTypeId}`,
    {
      accessories,
    }
  );

