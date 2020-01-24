# use-remote-resource
> Stay up to date with your server using one line

[![Travis](https://img.shields.io/travis/class-hooks/use-remote-resource.svg?style=flat-square)](https://travis-ci.org/class-hooks/use-remote-resource/)
[![npm](https://img.shields.io/npm/v/@class-hooks/use-remote-resource.svg?style=flat-square)
](https://www.npmjs.com/package/@class-hooks/use-remote-resource)

## General
The `use-remote-resource` lib is a [class hook](https://github.com/class-hooks/class-hooks/) for simple polling of remote information. It has a simple API for easily creating applications which display remote data, with only a single line of code.

**Example**: 14-Liner Nano-Reddit App

```jsx
class App extends React.Component {
  reddit = useRemoteResource('https://www.reddit.com/r/reactjs.json');

  render() {
    return (
      <ul>
        {
          this.reddit.status() === 'success' &&
            this.reddit.data().data.children.map((child, i) =>
              <li key={i}>{child.data.title}</li>)
        }
      </ul>
    );
  }
}
```

## Usage
### Requirements
This library requires `class-hooks` as a peer dependency.

### Install
Install by running:

```bash
npm install @class-hooks/use-remote-resource
```

or if you prefer yarn:

```bash
yarn add @class-hooks/use-remote-resource
```

Once installed, you can import the hook from the package:

```js
import { useRemoteResource } from '@class-hooks/use-remote-resource';
```

### API
#### Basic
The most simple implementation only requires the url of the data to fetch:

```jsx
class MyComponent extends React.Component {
  resource = useRemoteResource('http://...');

  render() {
    <span>
      data: {this.resource.data()}
      status: {this.resource.status()}
      <button onClick={this.resource.poll}>Refresh</button>
    </span>
  }
} 
```

It will start loading the resource as soon as the component mounts, and will re-render when the data arrives.

As you can see in the example above, the the hook returns two getters:
- `data(): T`: returns the body of the response, if arrived successfully, or null otherwise.
- `status(): RemoteResourcePollingStatus`: returns the status of the current poll: "loading", "success", or "failed"

In addition, it returns a method called `poll`, which invokes fetching the data.

#### Periodic Polling
In case you want to write a "realtime" application such as a chat, and use a polling mechanism, you can use the `autoPollInterval` option. Consider the following app:

```jsx
class ChatApp extends React.Component {
  chatHistory = useRemoteResource('http://...', { autoPollInterval: 1000 });

  render() {
    <ul>
      {
        chatHistory.data() &&
          chatHistory.data().messages.map(...)
      }
    </ul>
  }
} 
```

The resulting component will display the up-to-date messages and will refresh them every second.

#### Additional Options
##### Send Headers
In some cases, you might want to pass headers with the request (such as authorization headers). In order to do so, pass a headers map over with the `headers` option:

```jsx
const headers = { Authorization: 'Bearer QW1hemluZyBjb2RlciBzbGFzaCBnZW5pdXM=' }
class MyComponent extends React.Component {
  resource = useRemoteResource('http://...', { headers });

  render() {
    <span>
      data: {this.resource.data()}
      status: {this.resource.status()}
      <button onClick={this.resource.poll}>Refresh</button>
    </span>
  }
} 
```

##### On Mount Behavior
By default, the remote resource will be polled as soon as the component mounts. This behavior, however, can be overridden by passing the `pollOnMount` option:

```jsx
class MyComponent extends React.Component {
  resource = useRemoteResource('http://...', { pollOnMount: false });

  render() {
    <span>
      data: {this.resource.data()}
      status: {this.resource.status()}
      <button onClick={this.resource.poll}>Click to load</button>
    </span>
  }
} 
```
