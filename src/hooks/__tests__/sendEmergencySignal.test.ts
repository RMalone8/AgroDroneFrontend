import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted lets us reference the mock object inside the vi.mock factory
// (which is hoisted above imports by Vitest, so normal variable declarations
// would be undefined at that point).
const { mockClient } = vi.hoisted(() => {
  const mockClient = {
    connected: false,
    publish: vi.fn(),
    once: vi.fn(),
    on: vi.fn(),
  };
  return { mockClient };
});

vi.mock('mqtt', () => ({
  default: { connect: vi.fn(() => mockClient) },
}));

import { sendEmergencySignal } from '../sendEmergencySignal';

describe('sendEmergencySignal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.connected = false;
  });

  describe('when the MQTT client is already connected', () => {
    it('publishes immediately without waiting for a connect event', () => {
      mockClient.connected = true;
      sendEmergencySignal('ABORT');
      expect(mockClient.publish).toHaveBeenCalledTimes(1);
      expect(mockClient.once).not.toHaveBeenCalled();
    });

    it('publishes to the "emergency" topic', () => {
      mockClient.connected = true;
      sendEmergencySignal('ABORT');
      expect(mockClient.publish).toHaveBeenCalledWith('emergency', 'ABORT');
    });

    it('publishes the LAND message verbatim', () => {
      mockClient.connected = true;
      sendEmergencySignal('LAND');
      expect(mockClient.publish).toHaveBeenCalledWith('emergency', 'LAND');
    });
  });

  describe('when the MQTT client is not yet connected', () => {
    it('does not publish immediately', () => {
      sendEmergencySignal('ABORT');
      expect(mockClient.publish).not.toHaveBeenCalled();
    });

    it('registers a one-time connect listener', () => {
      sendEmergencySignal('ABORT');
      expect(mockClient.once).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('publishes to "emergency" once the connect event fires', () => {
      sendEmergencySignal('ABORT');
      const [, connectCallback] = mockClient.once.mock.calls[0] as [string, () => void];
      connectCallback();
      expect(mockClient.publish).toHaveBeenCalledWith('emergency', 'ABORT');
    });

    it('publishes the LAND message once the connect event fires', () => {
      sendEmergencySignal('LAND');
      const [, connectCallback] = mockClient.once.mock.calls[0] as [string, () => void];
      connectCallback();
      expect(mockClient.publish).toHaveBeenCalledWith('emergency', 'LAND');
    });
  });
});
