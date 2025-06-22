import React, { useMemo } from 'react';
import { QueryClientProvider } from 'react-query';
import Layout from 'layout/Layout';
import RouteIdentifier from 'routing/components/RouteIdentifier';
import { getRoutes } from 'routing/helper';
import routesAndMenuItems from 'routes';
import Loading from 'components/loading/Loading';
import 'react-toastify/dist/ReactToastify.css';
import 'react-dropzone-uploader/dist/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useToken } from 'utils/auth';
import queryClient from 'utils/query-client';
import { useSelector } from 'react-redux';

const App = () => {
  // const { currentUser, isLogin } = useSelector((state) => state.auth);
  const { token, isLoading } = useToken();
  const { currentUser } = useSelector((state) => state.auth);
  const isLogin = !!token;
  const routes = useMemo(() => getRoutes({ data: routesAndMenuItems, isLogin, userRole: currentUser.role }), [currentUser.role, isLogin]);
  const fallback = useMemo(() => <Loading />, []);
  if (routes) {
    return (
      <QueryClientProvider client={queryClient}>
        <Layout>{isLoading ? fallback : <RouteIdentifier routes={routes} fallback={fallback} />}</Layout>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    );
  }
  return <></>;
};

export default App;
