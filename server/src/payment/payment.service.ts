import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey && stripeKey !== 'sk_test_your_stripe_secret_key') {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.patientId !== userId) {
      throw new Error('Unauthorized');
    }

    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(appointment.paymentAmount) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        appointmentId: appointment.id,
        patientId: userId,
        doctorId: appointment.doctorId,
      },
    });

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async verifyPayment(paymentIntentId: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const appointment = await this.prisma.appointment.findFirst({
        where: { paymentIntentId },
      });

      if (appointment) {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: 'CONFIRMED',
          },
        });
      }

      return { success: true, status: 'paid' };
    }

    return { success: false, status: paymentIntent.status };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.verifyPayment(paymentIntent.id);
      }

      return { received: true };
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}
