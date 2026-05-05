import { mountMarketAutoRefresh } from "./market-data.js";

mountMarketAutoRefresh({
  scope: document,
  intervalMs: 30000,
  metaSelector: "#tickerMeta"
});
