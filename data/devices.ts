// Smartwatches shown on the Devices page. PREVIEW ONLY: pairing is simulated and
// nothing syncs yet. Real syncing would go through each brand's official API/app.
export const DEVICES: { id: string; name: string; app: string }[] = [
  { id: "garmin", name: "Garmin", app: "Garmin Connect" },
  { id: "apple", name: "Apple Watch", app: "Apple Health" },
  { id: "coros", name: "COROS", app: "COROS app" },
  { id: "polar", name: "Polar", app: "Polar Flow" },
  { id: "suunto", name: "Suunto", app: "Suunto app" },
  { id: "samsung", name: "Samsung Galaxy Watch", app: "Samsung Health" },
  { id: "huawei", name: "Huawei Watch", app: "Huawei Health" },
  { id: "amazfit", name: "Amazfit", app: "Zepp" },
  { id: "fitbit", name: "Fitbit", app: "Fitbit app" },
];
