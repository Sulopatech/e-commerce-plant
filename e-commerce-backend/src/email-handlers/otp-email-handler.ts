import { 
    AccountRegistrationEvent,
    NativeAuthenticationMethod,
    Injector,
    TransactionalConnection,
    RequestContext,
} from '@vendure/core';
import { passwordResetHandler, EventWithContext,emailAddressChangeHandler,orderConfirmationHandler,EmailEventListener,EmailEventHandler } from '@vendure/email-plugin';
export const otpEmailVerificationHandler = new EmailEventListener('email-verification')
    .on(AccountRegistrationEvent)
    .filter(event => {
        const nativeAuthMethod = event.user.authenticationMethods.find(m => m instanceof NativeAuthenticationMethod);
        return (nativeAuthMethod && !!nativeAuthMethod.user) || false;
    })
    .loadData(async ({ event, injector }) => {
        const otp = generateOTP();
        await storeOTP(event.ctx, event.user.identifier, otp, injector);
        return { otp };
    })
    .setRecipient(event => event.user.identifier)
    .setFrom('rishikumar@sulopa.com')
    .setSubject('Verify your email address, well if you want')
    .setTemplateVars(event => ({
        otp: event.data.otp,
    }));

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function storeOTP(ctx: RequestContext, userId: string, otp: string, injector: Injector): Promise<void> {
    const connection = injector.get(TransactionalConnection);
    await connection.getRepository(ctx, NativeAuthenticationMethod).update(
        { user: { id: userId } },
        { verificationToken: otp }
    );
}

