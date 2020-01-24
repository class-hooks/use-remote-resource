import React from 'react';
import nock from 'nock';
import eventually from 'wix-eventually';
import { Chance } from 'chance';
import { render, fireEvent } from '@testing-library/react';
import { useRemoteResource } from '../src';

describe('use-remote-resource', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('basic api', () => {
    describe('given a url, it automatically fetches the data upon mount and', () => {
      it('should hold the body of the response', async () => {
        const url = Chance().url();
        const sentence = Chance().sentence();

        nock(url)
          .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
          .get(/.*/)
          .reply(200, sentence);

        class ComponentWithRemoteResource extends React.Component {
          resource = useRemoteResource(this, url);

          render() {
            return <span data-testid='result-label'>{this.resource.data()}</span>;
          }
        }

        const dom = render(<ComponentWithRemoteResource />);

        await eventually(() =>
          expect(dom.getByTestId('result-label').textContent).toEqual(sentence));
      });

      it('should indicate that the request was successful, by having a "success" status', async () => {
        const url = Chance().url();
        const sentence = Chance().sentence();

        nock(url)
          .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
          .get(/.*/)
          .reply(200, sentence);

        class ComponentWithRemoteResource extends React.Component {
          resource = useRemoteResource(this, url);

          render() {
            return <span data-testid='result-label'>{this.resource.status()}</span>;
          }
        }

        const dom = render(<ComponentWithRemoteResource />);

        await eventually(() =>
          expect(dom.getByTestId('result-label').textContent).toEqual('success'));
      });
    });

    describe('polling mechanism', () => {
      describe('the "poll" function', () => {
        it('should poll the server for new data, where can be retrieved from "data" method', async () => {
          const url = Chance().url();
          const sentence = Chance().sentence();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200, sentence);

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url, { pollOnMount: false });

            render() {
              return <>
                <span data-testid='result-label'>{this.resource.data()}</span>
                <button onClick={() => this.resource.poll()} data-testid='poll-button'>Poll</button>
              </>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);
          fireEvent.click(dom.getByTestId('poll-button'));

          await eventually(() =>
            expect(dom.getByTestId('result-label').textContent).toEqual(sentence));
        });
      });

      describe('automatically polling when component mounts', () => {
        it('should occur by default', async () => {
          const url = Chance().url();
          const wasServerCalled = jest.fn();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200, () => wasServerCalled());

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url);

            render() {
              return <span data-testid='result-label'>{this.resource.data()}</span>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);

          await eventually(() =>
            expect(wasServerCalled).toHaveBeenCalled());
        });

        it('should occur if the "pollOnMount" option is "true"', async () => {
          const url = Chance().url();
          const wasServerCalled = jest.fn();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200, () => wasServerCalled());

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url, { pollOnMount: true });

            render() {
              return <span data-testid='result-label'>{this.resource.data()}</span>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);

          await eventually(() =>
            expect(wasServerCalled).toHaveBeenCalled());
        });

        it('should not occur if the "pollOnMount" option is "false"', async () => {
          const url = Chance().url();
          const wasServerCalled = jest.fn();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200, () => wasServerCalled());

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url, { pollOnMount: false });

            render() {
              return <span data-testid='result-label'>{this.resource.data()}</span>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);

          const reasonableAmountOfTime = 3000;
          await new Promise(res => setTimeout(res, reasonableAmountOfTime));

          expect(wasServerCalled).not.toHaveBeenCalled();
        });
      });

      describe('the status while polling', () => {
        it('should be "loading" while data has yet to arrive', () => {
          const url = Chance().url();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200);

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url, { pollOnMount: false });

            render() {
              return <>
                <span data-testid='result-label'>{this.resource.status()}</span>
                <button onClick={() => this.resource.poll()} data-testid='poll-button'>Poll</button>
              </>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);
          fireEvent.click(dom.getByTestId('poll-button'));

          expect(dom.getByTestId('result-label').textContent).toEqual('loading');
        });

        it('should be "success" if data arrives successfully', async () => {
          const url = Chance().url();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200);

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url, { pollOnMount: false });

            render() {
              return <>
                <span data-testid='result-label'>{this.resource.status()}</span>
                <button onClick={() => this.resource.poll()} data-testid='poll-button'>Poll</button>
              </>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);
          fireEvent.click(dom.getByTestId('poll-button'));

          await eventually(() =>
            expect(dom.getByTestId('result-label').textContent).toEqual('success'));
        });

        it('should be "failed" if data did not arrive successfully', async () => {
          const url = Chance().url();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(404);

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url, { pollOnMount: false });

            render() {
              return <>
                <span data-testid='result-label'>{this.resource.status()}</span>
                <button onClick={() => this.resource.poll()} data-testid='poll-button'>Poll</button>
              </>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);
          fireEvent.click(dom.getByTestId('poll-button'));

          await eventually(() =>
            expect(dom.getByTestId('result-label').textContent).toEqual('failed'));
        });
      });

      describe('multiple polls', () => {
        it('should update the "data" to the latest value', async () => {
          const url = Chance().url();
          const sentence1 = Chance().sentence();
          const sentence2 = Chance().sentence();

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200, sentence1);

          nock(url)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get(/.*/)
            .reply(200, sentence2);

          class ComponentWithRemoteResource extends React.Component {
            resource = useRemoteResource(this, url);

            render() {
              return <>
                <span data-testid='result-label'>{this.resource.data()}</span>
                <button onClick={() => this.resource.poll()} data-testid='poll-button'>Poll</button>
              </>;
            }
          }

          const dom = render(<ComponentWithRemoteResource />);
          fireEvent.click(dom.getByTestId('poll-button'));

          await eventually(() =>
            expect(dom.getByTestId('result-label').textContent).toEqual(sentence2));
        });
      });
    });
  });

  describe('periodic polling', () => {
    it('should poll the server for data every given milliseconds, since mounting', async () => {
      const url = Chance().url();
      const wasServerCalled = jest.fn();
      const autoPollInterval = Chance().integer({ min: 10, max: 500 });

      nock(url)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(/.*/)
        .reply(200, () => wasServerCalled())
        .persist();

      class ComponentWithRemoteResource extends React.Component {
        resource = useRemoteResource(this, url, { autoPollInterval });

        render() {
          return <span data-testid='result-label'>{this.resource.data()}</span>;
        }
      }

      const dom = render(<ComponentWithRemoteResource />);

      const timeForAdditionalPolls = autoPollInterval * 3;
      await new Promise(res => setTimeout(res, timeForAdditionalPolls));

      expect(wasServerCalled).toHaveBeenCalledTimes(3);
    });

    it('should stop polling once the component was unmounted', async () => {
      const url = Chance().url();
      const wasServerCalled = jest.fn();
      const autoPollInterval = Chance().integer({ min: 10, max: 500 });

      nock(url)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(/.*/)
        .reply(200, () => wasServerCalled())
        .persist();

      class ComponentWithRemoteResource extends React.Component {
        resource = useRemoteResource(this, url, { autoPollInterval });

        render() {
          return <span data-testid='result-label'>{this.resource.data()}</span>;
        }
      }

      const dom = render(<ComponentWithRemoteResource />);

      await new Promise(res => setTimeout(res, autoPollInterval - 100));

      dom.unmount();

      await new Promise(res => setTimeout(res, autoPollInterval + 200));

      expect(wasServerCalled).toHaveBeenCalledTimes(1);
    });
  });

  describe('passing headers', () => {
    it('should pass given headers with polls', async () => {
      const url = 'http://localhost';
      const wasServerCalled = jest.fn();
      const [headerName, headerValue] = [Chance().word(), Chance().word()];

      nock(url)
        .get(/.*/)
        .matchHeader(headerName, headerValue)
        .reply(200, () => wasServerCalled());

      class ComponentWithRemoteResource extends React.Component {
        resource = useRemoteResource(this, url, { headers: { [headerName]: headerValue } });

        render() {
          return <span data-testid='result-label'>{this.resource.data()}</span>;
        }
      }

      const dom = render(<ComponentWithRemoteResource />);

      await eventually(() =>
        expect(wasServerCalled).toHaveBeenCalled());
    });
  });
});