// 浏览器更好的支持es5, fetch,  promise等标准
require('es5-shim');
require('es5-shim/es5-sham');
require('console-polyfill');
require('es6-promise').polyfill();
require('whatwg-fetch');
// end 支持

const React = require('react');
const ReactDOM = require('react-dom');
const ReactRouterDom = require('react-router-dom');
const remoteActionMiddleware = require('shared/utils/lib/remote_action_middleware');
const appActions = require('shared/actions/app');
const combineReducers = require('redux').combineReducers;
const Provider = require('react-redux').Provider;
const prodConfig = require('./config/axc2.5');
const renderRouterConfig = require('shared/components/Organism/RouterConfig');

const HashRouter = ReactRouterDom.HashRouter;
const mountNode = document.getElementById('app');

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

// 引入产品配置
const renderApp = () => {
  // 主渲染入口
  ReactDOM.render(
    <Provider store={stores}>
      <HashRouter>
        {renderRouterConfig(prodConfig.routes)}
      </HashRouter>
    </Provider>,
    mountNode,
  );
};

renderApp();
