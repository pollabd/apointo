import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body('appointmentId') appointmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.createPaymentIntent(appointmentId, user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Body('paymentIntentId') paymentIntentId: string) {
    return this.paymentService.verifyPayment(paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleWebhook(signature, request.rawBody);
  }
}
