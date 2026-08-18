import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { razorpay } from "@/lib/razorpay";
import Report from "@/models/Report";

export async function POST(request) {

    try {

        await dbConnect();

        const body =
            await request.json();

        const {
            userId,
            city,
            deliveryEmail
        } = body;

        /*
         * AirSense AI is currently using
         * Razorpay TEST mode.
         *
         * Amount is deliberately fixed here
         * so the frontend cannot change it.
         */
        const amount = 1;

        /*
         * Only allow Razorpay TEST keys.
         *
         * A live key starts with:
         * rzp_live_
         *
         * A test key starts with:
         * rzp_test_
         */
        if (
            !process.env.RAZORPAY_KEY_ID?.startsWith(
                "rzp_test_"
            )
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Payments are disabled unless a Razorpay test key is configured.",
                },
                {
                    status: 503
                }
            );
        }

        if (
            !userId ||
            !city ||
            !deliveryEmail
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "userId, city and deliveryEmail are required",
                },
                {
                    status: 400
                }
            );
        }

        /*
         * Razorpay expects the amount
         * in paise.
         *
         * ₹1 = 100 paise.
         */
        const order =
            await razorpay.orders.create({

                amount:
                    amount * 100,

                currency:
                    "INR",

                receipt:
                    `receipt_${Date.now()}`,

            });

        /*
         * Save the report/order information
         * for this particular user.
         */
        const report =
            await Report.create({

                userId,

                city,

                deliveryEmail,

                amount,

                status:
                    "Pending",

                orderId:
                    order.id,

            });

        return NextResponse.json({

            success: true,

            data: {

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                reportId:
                    report._id,

            },

        });

    } catch (err) {

        console.error(
            "POST /api/payment/create-order error:",
            err
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Failed to create order",
            },
            {
                status: 500
            }
        );
    }
}
