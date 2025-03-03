// pages/_app.js

import Navbar from "../components/Navbar";  // Adjusted to the components folder path
import "../styles/globals.css";
import { UserProvider } from "../UserContext";  // Import UserProvider from the UserContext file

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider> {/* Wrap your app with UserProvider */}
      <Navbar />
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
