import {Amplify} from 'aws-amplify';
import {
  signIn,
  confirmSignIn,
  fetchAuthSession,
  signOut,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import {useEffect, useState} from 'react';

Amplify.configure(outputs);

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [enforceTotp, setEnforceTotp] = useState(false);

  useEffect(() => {
    const getUserState = async () => {
      const session = await fetchAuthSession();
      setUserSession(session);
      checkUserAttributes();
      setLoading(false);
    };
    getUserState();
  }, []);

  async function handleSignOut() {
    await signOut();
    setUserSession(null);
  }

  const checkUserAttributes = async () => {
    const userAttributes = await fetchUserAttributes();
    setEnforceTotp(userAttributes['custom:enforceTotp']);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const {nextStep} = await signIn({
        username: form.elements.email.value,
        password: form.elements.password.value,
      });

      console.log('signIn nextStep', nextStep);
      if (
        nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE' ||
        nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE' ||
        nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE'
      ) {
        // collect OTP from user
        await confirmSignIn({
          challengeResponse: '123456',
        });
      }

      if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION') {
        // present nextStep.allowedMFATypes to user
        // collect user selection
        await confirmSignIn({
          challengeResponse: 'TOTP', // 'EMAIL', 'SMS', or 'TOTP'
        });
      }

      if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION') {
        // present nextStep.allowedMFATypes to user
        // collect user selection
        await confirmSignIn({
          challengeResponse: 'TOTP', // 'EMAIL' or 'TOTP'
        });
      }

      if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP') {
        // present nextStep.totpSetupDetails.getSetupUri() to user
        // collect OTP from user
        await confirmSignIn({
          challengeResponse: '123456',
        });
      }

      if (nextStep.signInStep === 'DONE') {
        const session = await fetchAuthSession();
        console.log('session', session);
        setUserSession(session);

        checkUserAttributes();
      }
    } catch (error) {
      console.log('error signing in', error);
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
    if (enforceTotp === 'true') {
      return (
        <div>
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '16px',
              fontSize: '18px',
            }}
          >
            <button type='button' onClick={handleSignOut}>
              Sign out
            </button>
          </div>
          <div>
            <h1>Hello, {userSession.tokens.idToken.payload.email}</h1>

            <p>Your account is required to setup a new TOTP</p>
            <p>Please use the link below:</p>
            <a href='https://demourl.com'>demourl</a>
          </div>
        </div>
      );
    }
    return (
      <div>
        <h1>Hello, {userSession.tokens.idToken.payload.email}</h1>

        <button type='button' onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  } else {
    return (
      <form onSubmit={handleSubmit}>
        <label htmlFor='email'>Email:</label>
        <input type='text' id='email' name='email' />
        <br />
        <br />
        <label htmlFor='password'>Password:</label>
        <input type='password' id='password' name='password' />
        <br />
        <br />
        <button type='submit'> Login </button>
      </form>
    );
  }
}
