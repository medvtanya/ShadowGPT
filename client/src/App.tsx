import { RouterProvider } from 'react-router';
import Router from './app/router/Router.jsx';

function App() {
  const router = Router();
  return <RouterProvider router={router} />;
}

export default App;
