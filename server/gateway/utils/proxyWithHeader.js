import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl, options = {}) => {
  return proxy(serviceUrl, {
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
  });
};
