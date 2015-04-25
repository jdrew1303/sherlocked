sherlocked
==========

Agnostic visual regression testing service with Sauce Labs and TravisCI.

## Setup

To use Sherlocked in your project, install the Node library, get a Sauce Labs
API key, write a Sherlocked test script, and hook it into your Travis build.

```
npm install sherlocked --save
```

### 1. Setting up Sauce Labs

You must create a Sauce Labs account and generate an API key.

To let Sauce Labs through a firewall, use [Sauce
Connect](https://docs.saucelabs.com/reference/sauce-connect/). You download
the binary, and then run it in the background with your sauce username and
sauce key:

```
bin/sc -u my-sauce-username -k my-sauce-key
```

Keep the API key because we will need it for later.

### 2. Writing a Sherlocked Test Script

A Sherlocked test script specifies ```environments``` and ```captures```:

- *environments*: list of configurations of what environments we want to take
  captures of, in the form of Selenium's [desiredCapabilities]
  (https://code.google.com/p/selenium/wiki/DesiredCapabilities)
- *captures*: a list of functions that take a Webdriver client and executes
  to reach a desired state for a screen capture. Returns the client.

```
module.exports = {
    environments: [
        {
            browserName: 'firefox',
            version: '40',
            platform: 'OS X 10.9',
        },
        {
            browserName: 'chrome',
            platform: 'OS X 10.9',
        }
    ],
    captures: [
        function(client) {
            return client.init()
                         .setViewportSize({
                            width: 320,
                            height: 480,
                         })
                         .url('localhost/some-page')
                         .waitFor('.some-element');
        },
    ]
};
```

### 3. Setting up Sherlocked with TravisCI

First, you will want to encrypt your Sauce Labs API key and set it as an
environment variable in TravisCI.

```
gem install travis
travis encrypt SAUCE_KEY=my-sauce-key
travis encrypt SAUCE_USERNAME=my-sauce-username
```

Place the output into your ```.travis.yml``` file.

Lastly, all you need to do is to call your Sherlocked test script in your
TravisCI build.

```
node my-sherlocked-script.js
```
