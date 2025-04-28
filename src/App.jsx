import { Amplify } from 'aws-amplify';
import {
  signIn,
  confirmSignIn,
  fetchAuthSession,
  signOut,
  fetchUserAttributes,
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference,
  signInWithRedirect,
  getCurrentUser,
} from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import { useEffect, useState } from 'react';
import { configs } from './consts';

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    const getUserState = async () => {
      const config = localStorage.getItem('userpoolconfig') ? JSON.parse(localStorage.getItem('userpoolconfig')) : null;
      if (config) Amplify.configure(config);
      const session = await fetchAuthSession();
      if (
        session &&
        session.tokens &&
        session.tokens.idToken &&
        session.tokens.idToken.payload
      ) {
        setUserSession(session);
      }
      setLoading(false);
    };
    getUserState();
  }, []);

  async function handleSignOut() {
    await signOut();
    setUserSession(null);
    localStorage.removeItem('userpoolconfig');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = form.elements.email.value;

    if (!username || username.trim().length === 0) {
      alert("Please enter a username");
      return;
    }

    // test whether username is google email address
    if (username.includes('@gmail.com')) {
      Amplify.configure(configs[2]);
      localStorage.setItem("userpoolconfig", JSON.stringify(configs[2]));
      signInWithRedirect({ provider: "Google" })
      return;
    }

    switch (username) {
      case 'user1@test.com':
        Amplify.configure(configs[0]);
        localStorage.setItem("userpoolconfig", JSON.stringify(configs[0]));
        signInWithRedirect({ provider: { custom: "azureall" } });
        break;
      case 'user2@test.com':
        Amplify.configure(configs[1]);
        localStorage.setItem("userpoolconfig", JSON.stringify(configs[1]));
        signInWithRedirect()
        break;
      default:
        alert('Invalid username');
        break;
    }
  };

  console.log('userSession', userSession);

  if (isLoading) {
    return <div>Loading...</div>;
  }


  if (
    userSession &&
    userSession.tokens &&
    userSession.tokens.idToken &&
    userSession.tokens.idToken.payload
  ) {
    return (
      <div>
        <h1>Hello, {userSession.tokens.idToken.payload.email}</h1>
        <p>userSession: {JSON.stringify(userSession)}</p>
        <p>
          userSession.tokens.idToken.payload:{" "}
          {JSON.stringify(userSession.tokens.idToken.payload)}
        </p>
        <p>
          UserpoolID:{" "}
          {JSON.stringify(userSession.tokens.idToken.payload.iss)
            .split("/")
            .pop()}
        </p>
        <p>Userpool Appclient:{" "}{JSON.stringify(userSession.tokens.idToken.payload.aud)}</p>
        <p>
          userSession.tokens.idToken.payload.identities:{" "}
          {JSON.stringify(userSession.tokens.idToken.payload.identities)}
        </p>

        <button type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  } else {
    return (
      <div>
        user1@test.com - userpool1 oidc provider <br />
        user2@test.com / user2test - userpool1 native Login <br />
        {"email address ends with @gmail.com"} - userpool2 google login <br />
        <br />
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>&nbsp;
          <input
            type="text"
            id="email"
            name="email"
            placeholder="user1@test.com"
          />
          <br />
          <br />
          {/* <label htmlFor='password'>Password: (HelloWorld0101!)</label>
        <br />
        <input type='password' id='password' name='password' />
        <br /> */}
          <br />
          <button type="submit"> Login </button>
        </form>
      </div>
    );
  }
}
