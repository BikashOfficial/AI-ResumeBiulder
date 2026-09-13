import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl, options = {}) => {
  const cleanUrl = (serviceUrl || "").replace(/\/$/, "");

  return proxy(cleanUrl, {
    timeout: 60000,
    ...options,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (options.proxyReqOptDecorator) {
        proxyReqOpts = options.proxyReqOptDecorator(proxyReqOpts, srcReq);
      }
      // Overwrite x-user-id with authenticated user's ID from Redis session
      if (srcReq.user?.userId) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }
      return proxyReqOpts;
    },
    proxyErrorHandler: (err, res, next) => {
      console.error(`❌ [Gateway Proxy Error] Target: ${cleanUrl} - ${err.code || err.message}`);
      return res.status(502).json({
        message: `Bad Gateway: Could not reach downstream service at ${cleanUrl}. It may be spinning up or sleeping on Render.`,
        target: cleanUrl,
        code: err.code || "SERVICE_UNAVAILABLE",
        error: err.message,
      });
    },
  });
};
