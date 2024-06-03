import { Elysia } from "elysia";
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

  .post("/order", async () => {
    
  })

  .listen(3000);



console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
