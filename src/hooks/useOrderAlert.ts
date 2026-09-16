import { useEffect, useRef } from 'react';
import { useOrderSyncStore } from '@/store/orderSyncStore';
import { useToastStore } from '@/store/toastStore';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const AudioContextConstructor = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext = new AudioContextConstructor();
  return audioContext;
};

const unlockAudio = () => {
  const context = getAudioContext();
  if (context?.state === 'suspended') void context.resume().catch(() => {});
};

const playOrderAlert = () => {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
  gain.connect(context.destination);

  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(start + index * 0.12);
    oscillator.stop(start + 0.55);
  });
};

interface OrderAlertOptions {
  repeatUntilAccepted?: boolean;
}

export function useOrderAlertSound({ repeatUntilAccepted = false }: OrderAlertOptions = {}) {
  const lastEvent = useOrderSyncStore((state) => state.lastEvent);
  const showToast = useToastStore((state) => state.showToast);
  const alertInterval = useRef<number | null>(null);

  const stopRepeatingAlert = () => {
    if (alertInterval.current !== null) {
      window.clearInterval(alertInterval.current);
      alertInterval.current = null;
    }
  };

  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (lastEvent?.type === 'create' && (!lastEvent.resource || lastEvent.resource === 'order')) {
      stopRepeatingAlert();
      playOrderAlert();
      if (repeatUntilAccepted) {
        alertInterval.current = window.setInterval(playOrderAlert, 3000);
      }
      showToast(
        lastEvent.orderId ? `New order received: #${lastEvent.orderId.slice(-6).toUpperCase()}` : 'New order received',
        'info',
        5000,
      );
      return;
    }

    if (repeatUntilAccepted && lastEvent?.type === 'update' && lastEvent.status !== 'new' && lastEvent.status !== 'pending') {
      stopRepeatingAlert();
    }
  }, [lastEvent, repeatUntilAccepted, showToast]);

  useEffect(() => stopRepeatingAlert, []);
}