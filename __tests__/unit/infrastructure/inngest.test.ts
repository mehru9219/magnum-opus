import { describe, it, expect } from 'vitest';

describe('Inngest Infrastructure', () => {
  it('should export Inngest client', async () => {
    const { inngest } = await import('@/lib/inngest/client');
    expect(inngest).toBeDefined();
    expect(inngest).toHaveProperty('id');
    expect(inngest.id).toBe('magnum-opus');
  });
});
