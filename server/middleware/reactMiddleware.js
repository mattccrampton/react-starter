import Helmet from 'react-helmet';
import React from 'react';
import {RouterContext, match} from 'react-router';
import {createLocation} from 'history/LocationUtils';
import {renderToStaticMarkup, renderToString} from 'react-dom/server';

import Html from '../../client/components/Html';
import NotFound from '../../client/routes/NotFound';
import Root from '../../client/components/Root';
import configureStore from '../../client/configureStore';
import routes from '../../client/routes';

const renderApp = (renderProps) => {
  const assets = require('../../build/assets.json'); // eslint-disable-line global-require, import/newline-after-import
  const store = configureStore();
  const initialState = store.getState();
  const content = renderToString(
    <Root store={store}>
      <RouterContext {...renderProps} />
    </Root>
  );
  const head = Helmet.rewind();

  return renderToStaticMarkup(
    <Html
      assets={assets}
      content={content}
      head={head}
      initialState={initialState}
    />
  );
};

export default ({url}, res) => {
  const location = createLocation(url);

  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (error) {
      return res.status(500).send(error.message);
    } else if (redirectLocation) {
      return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (!renderProps) {
      return res.status(404).send('Not Found');
    }

    const isNotFound = renderProps.components.indexOf(NotFound) !== -1;

    return res
      .status(isNotFound ? 404 : 200)
      .send(`<!doctype html>${renderApp(renderProps)}`);
  });
};
