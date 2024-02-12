import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import FlashMessage from 'react-native-flash-message';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';

import Navigator from './src/navigations';
import configureStore from './src/store';
import { getItem } from './src/helpers/secureStore';
import StartSplash from './src/components/StartSplash';
import { screenSet } from './src/store/Modules/screens';

import { bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import { userLogintoken, locationView } from './src/store/Modules/auth/auth';
import { STRIPE_API_KEY } from './src/config';

const navigationRef = React.createRef();

export const navigate = (stackName, name, params) => {
  navigationRef.current &&
    navigationRef.current.navigate(stackName, {
      screen: name,
      params: params,
    });
};

const store = configureStore();

// axios.defaults.baseURL = API_URL;

axios.defaults.timeout = 30000;
axios.interceptors.request.use(request => {
  // eslint-disable-next-line no-undef
  request.ts = performance.now(); // to find the performance
  if (
    request.data &&
    request.headers['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    // eslint-disable-next-line no-undef
    request.data = qs.stringify(request.data);
  }
  return request;
});

axios.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const { response } = error;

    return Promise.reject(response);
  },
);

const IndexApp = props => {
  return props.children;
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

const mapStateToProps = state => {
  return state;
};

let AppWrapper = connect(mapStateToProps, mapDispatchToProps)(IndexApp);

const App = () => {
  const [viewSplash, setSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      setSplash(false);
    }, 1);
    loadData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setSplash(false);
    }, 4000);
  }, []);

  const loadData = async () => {
    const userToken = await getItem('token');
    if (userToken) {
      store.dispatch(locationView());
      store.dispatch(userLogintoken());
    } else {
      store.dispatch(locationView());
    }
  };

  let currentRouteName =
    navigationRef.current != null
      ? navigationRef.current.getCurrentRoute().name
      : null;
  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey={STRIPE_API_KEY}
        merchantIdentifier="merchant.com.circleiq">
        <StartSplash />
        {!viewSplash && (
          <AppWrapper>
            <NavigationContainer
              ref={navigationRef}
              onStateChange={() => {
                currentRouteName =
                  navigationRef.current != null
                    ? navigationRef.current.getCurrentRoute().name
                    : null;
                store.dispatch(screenSet(currentRouteName));
              }}>
              <Navigator />
              <FlashMessage
                hideStatusBar={false}
                statusBarHeight={StatusBar.currentHeight}
                position="top"
              />
            </NavigationContainer>
          </AppWrapper>
        )}
      </StripeProvider>
    </Provider>
  );
};

export default App;
