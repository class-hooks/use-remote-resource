import axios, { AxiosResponse } from 'axios';
import { useState, useLifecycle } from 'class-hooks';

export interface UseRemoteResourceClassHook<T> {
  data(): T;
  status(): RemoteResourcePollingStatus;
  poll(): void;
}

export interface UseRemoteResourceClassHookOpts {
  pollOnMount: boolean;
  autoPollInterval: number;
  headers: any;
}

export type RemoteResourcePollingStatus = 'loading' | 'success' | 'failed';

export const useRemoteResource = <T = any>(target, url: string, { pollOnMount = true, autoPollInterval, headers = {} }: Partial<UseRemoteResourceClassHookOpts> = {}): UseRemoteResourceClassHook<T> => {
  const currentResponse = useState<AxiosResponse<T>>(target, null);
  const currentStatus = useState<RemoteResourcePollingStatus>(target, 'loading');

  let autoPollIntervalId: ReturnType<typeof setInterval>;
  let latestPollId: number = 0;

  useLifecycle(target, 'componentDidMount', () => {
    if (pollOnMount) {
      poll();
    }

    if (typeof autoPollInterval === 'number') {
      autoPollIntervalId = setInterval(poll, autoPollInterval);
    }
  });

  useLifecycle(target, 'componentWillUnmount', () => {
    if (autoPollIntervalId) {
      clearInterval(autoPollIntervalId);
    }
  });

  const poll = async () => {
    latestPollId += 1;
    const myPollId = latestPollId;

    currentStatus.setState('loading');

    try {
      const res = await axios.get(url, { headers });

      if (myPollId === latestPollId) {
        currentResponse.setState(res);
        currentStatus.setState('success');
      }
    } catch (err) {
      if (myPollId === latestPollId) {
        currentResponse.setState(null);
        currentStatus.setState('failed');
      }
    }
  };

  const data = () =>
    currentResponse.getState()?.data;

  const status = () =>
    currentStatus.getState();

  return {
    poll,
    data,
    status
  };
};
