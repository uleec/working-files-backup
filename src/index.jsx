require('shared/shim');

const React = require('react');
const ReactDOM = require('react-dom');
const ReactRouterDom = require('react-router-dom');
const appActions = require('shared/containers/app/actions');
const redux = require('redux');
const { RouteSwitches } = require('shared/components/Organism/RouterConfig');

const thunkMiddleware = require('redux-thunk').default;
const { Provider } = require('react-redux');
const { AppContainer } = require('react-hot-loader');
const prodConfig = require('./config/axc4.0').default;

const { combineReducers, applyMiddleware, createStore } = redux;
const { HashRouter } = ReactRouterDom;
const mountNode = document.getElementById('app');

const remoteActionMiddleware = applyMiddleware(thunkMiddleware)(createStore);

// Store
const stores = remoteActionMiddleware(
  combineReducers({
    ...prodConfig.reducers,
  }),

  // 支持 chrome 插件 Redux DevTools
  window.devToolsExtension ? window.devToolsExtension() : f => f,
);

// 初始化 App Config
if (prodConfig.appConfig) {
  stores.dispatch(appActions.initAppConfig(prodConfig.appConfig));
}

function renderApp(renderRoutes) {
  // 主渲染入口
  ReactDOM.render(
    <AppContainer>
      <Provider store={stores}>
        <HashRouter>
          <RouteSwitches
            routes={renderRoutes}
          />
        </HashRouter>
      </Provider>
    </AppContainer>,
    mountNode,
  );
}
window.onload = () => {
  renderApp(prodConfig.routes);
};

// Enable hot reload by react-hot-loader
if (module.hot) {
  module.hot.accept('./config/axc4.0', () => {
    /* eslint-disable global-require */
    const nextConfig = require('./config/axc4.0').default;

    stores.replaceReducer(combineReducers({
      ...nextConfig.reducers,
    }));
    // 主渲染入口
    renderApp(nextConfig.routes);
  });
}

// if (process.env.NODE_ENV !== 'production' && window.dev) {
//   const { whyDidYouUpdate } = require('why-did-you-update');
//   whyDidYouUpdate(React);
// }
