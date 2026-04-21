/**
 * order controller
 */

import { factories } from "@strapi/strapi";
import Stripe from "stripe";

const calcDiscountPrice = (price, discount) => {
  const discountAmount = (price * discount) / 100;
  const result = price - discountAmount;
  return result.toFixed(2);
};

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async paymentOrder(ctx) {
      const { token, products, idUser, addressShipping } = ctx.request.body;

      let totalPayment = 0;
      products.forEach((product) => {
        const priceDiscount = calcDiscountPrice(
          product.price,
          product.discount,
        );
        totalPayment += Number(priceDiscount) * product.quantity;
      });

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-03-25.dahlia",
      });

      const paymentIntent = await stripe.charges.create({
        amount: Math.round(totalPayment * 100),
        currency: "usd",
        source: token.id,
        description: `User Id: ${idUser}`,
      });

      const data = {
        products,
        user: idUser,
        totalPayment,
        idPayment: paymentIntent.id,
        addressShipping,
      };

      const model = strapi.contentType("api::order.order");
      const validData = await strapi.entityValidator.validateEntityCreation(
        model,
        data as any,
      );

      const entry = await strapi.db
        .query("api::order.order")
        .create({ data: validData });

      return entry;
    },
  }),
);
