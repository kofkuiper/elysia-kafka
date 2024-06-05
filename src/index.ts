import { Elysia, t } from "elysia";
import prisma from "./db";

const app = new Elysia()

  .get("/", () => "Hello Elysia")
  .get("/db.migrate", async () => {
    const counts = await prisma.product.count()
    if (counts === 0) {
      const products = [
        { name: "T-Shirt", amount: 100 },
        { name: "Skirt", amount: 100 },
        { name: "Computer (PC)", amount: 500 },
        { name: "iPad", amount: 20 },
        { name: "iPhone", amount: 200 },
      ]

      await prisma.product.createMany({ data: products })

    }

    const products = await prisma.product.findMany()
    return { success: true, products }
  })
  .get("products", async ({ set }) => {
    try {
      const products = await prisma.product.findMany()
      set.status = 200
      return { success: true, products }
    } catch (error) {
      set.status = 500
      return { success: false, message: error }
    }
  })
  .post("/order", async ({ body, set }) => {
    try {
      const { userLineId, productId } = body

      const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } })
      if (product.amount <= 0) {
        set.status = 404
        return { success: false, message: "out of stock" }
      }

      return await prisma.$transaction(async (tx) => {

        // decrease product amount
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            amount: product.amount - 1
          }
        })
        if (updatedProduct.amount < 0) throw "out of stock"

        // create order
        const order = await tx.order.create({
          data: {
            userLineId,
            productId,
            type: 'pending'
          }
        })
        console.log(order);

        set.status = 201
        return { success: true, message: "create product successful" }
      })

    } catch (error) {
      set.status = 500
      return { success: false, message: error }
    }
  },
    {
      body: t.Object({
        userLineId: t.String(),
        productId: t.String()
      })
    },
  )

  .listen(3000);



console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
