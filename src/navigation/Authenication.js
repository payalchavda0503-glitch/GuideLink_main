import React, { Suspense, lazy, useEffect } from 'react';
import SplashScreen from '../screen/SplshScreen/Index';
const Router = lazy(() => {
  //inernet check

  return new Promise(resolve => {
    setTimeout(() => resolve(import('./Routes')), 0);
  });
});

const Authenication = () => {
  return (
    <Suspense >
      <Router />
    </Suspense>
  );
};

export default Authenication;
