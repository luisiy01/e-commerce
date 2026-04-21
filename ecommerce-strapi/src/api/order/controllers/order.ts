/**
 * order controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async paymentOrder(ctx) {
      ctx.body = "pago generado correctamente";
    },
  }),
);
