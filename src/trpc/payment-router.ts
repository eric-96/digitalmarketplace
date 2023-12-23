import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

export const paymentRouter = router({
    createSession: privateProcedure.input(z.object({productsIds: z.array(z.string())}))
    .mutation(async ({input, ctx}) => {
    const { user } = ctx
    let { productsIds } = input

    if(productsIds.length === 0) {
        throw new TRPCError ({code: 'BAD_REQUEST'})
    }

    const payload = await getPayloadClient()

    const {docs: products} = await payload.find({
    collection: 'products',
    where: {
        id: {
            in: productsIds,
        },
        approvedForSale: {
            equals: 'approved',
        },
    },
    })

    const filteredProducts = products.filter((prod) => Boolean(prod.priceId))

    const order = await payload.create({
        collection: 'orders',
        data: {
            _isPaid: false,
            user: user.id,
            products: filteredProducts.map((prod) => prod.id)
        },
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    filteredProducts.forEach((prod) => {
        line_items.push({
            price: prod.priceId!,
            quantity: 1,
            adjustable_quantity: {
                enabled: false,
            },
        })
    })

    line_items.push({
        price: 'price_1OQX61I3xnwtNZ2RjJ4ud4FD',
        quantity: 1,
        adjustable_quantity: {
            enabled: false,
        },
    })

    try {
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
            payment_method_types: ['card', 'paypal'],
            mode: 'payment',
            metadata: {
                userId: user.id,
                orderId: order.id,
            },
            line_items,
    })

    return {url: stripeSession.url}
} catch (err) {
    console.log(err)

    return {url: null}
}

}),

pollOrderStatus: privateProcedure.input(z.object({orderId: z.string()})).query(async({input}) => {
    const {orderId} = input

    const payload = await getPayloadClient()

    const {docs: orders} = await payload.find({
        collection: 'orders',
        where: {
            id: {
                equals: orderId,
            },
        },
    })
    if(!orders.length) {
        throw new TRPCError({code: 'NOT_FOUND'})
    }

    const [order] = orders

    return { isPaid: order._isPaid }
})
})