import { createRoot } from 'react-dom/client'
 import QueryProvider from './providers/QueryProvider.jsx'
import "./index.css"
import App from './App.jsx'
import { ApolloProvider } from '@apollo/client'
import client from './api/apolloClient.js'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Suspense } from 'react'
import LogoLoader from './pages/LogoLoader.jsx'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
createRoot(document.getElementById('root')).render(
  <Suspense fallback={<LogoLoader/>}>
  <GoogleOAuthProvider clientId={googleClientId}>
   <QueryProvider>
  <ApolloProvider client={client}>
    <App />
  
  </ApolloProvider>
  </QueryProvider> 
  </GoogleOAuthProvider>
  </Suspense>
)
