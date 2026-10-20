import { ImpersonationController } from './impersonation.controller';
import { ImpersonationService } from './impersonation.service';

describe('ImpersonationController.impersonateUser', () => {
  it("answers the impersonated user's id, mail and name only", async () => {
    const service = {
      initiateImpersonation: jest.fn().mockResolvedValue({
        token: 'tok',
        user: {
          id: 7,
          mail: 'someone@example.org',
          name: 'Someone',
          password: 'the-stored-hash',
          resetToken: 'a-pending-token',
        },
      }),
    };
    const controller = new ImpersonationController(
      service as unknown as ImpersonationService,
    );
    const res = { json: jest.fn() };

    await controller.impersonateUser(7, { user: { sub: 1 } }, res);

    expect(res.json).toHaveBeenCalledWith({
      redirectUrl: expect.any(String),
      user: { id: 7, mail: 'someone@example.org', name: 'Someone' },
    });
  });
});
