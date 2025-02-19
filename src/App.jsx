import {Amplify} from 'aws-amplify';
import {
  signIn,
  confirmSignIn,
  fetchAuthSession,
  signOut,
  fetchUserAttributes,
  setUpTOTP,
  verifyTOTPSetup,
  updateMFAPreference,
} from 'aws-amplify/auth';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import {useEffect, useState} from 'react';

Amplify.configure(outputs);

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [enforceTotp, setEnforceTotp] = useState(false);
  const [totpSetupUri, setTotpSetupUri] = useState(null);
  const [flow, setFlow] = useState('null');

  useEffect(() => {
    const getUserState = async () => {
      const session = await fetchAuthSession();
      if (
        session &&
        session.tokens &&
        session.tokens.idToken &&
        session.tokens.idToken.payload
      ) {
        setUserSession(session);
        checkUserAttributes();
      }
      setLoading(false);
    };
    getUserState();
  }, []);

  async function handleSignOut() {
    await signOut();
    setUserSession(null);
  }

  // use QRLib to generate a qr code and show it in react screen

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
        const otpCode = prompt("What is OTP code on your App?")
        await confirmSignIn({
          challengeResponse: otpCode,
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
        console.log(nextStep.totpSetupDetails.getSetupUri('demo'));
        // present nextStep.totpSetupDetails.getSetupUri() to user
        setTotpSetupUri(nextStep.totpSetupDetails.getSetupUri('demo'));
        setFlow('signIn');
        // const otpCode = prompt(
        //   'Please use the uri to create new TOTP and input the code showing\n' +
        //     nextStep.totpSetupDetails.getSetupUri('demo')
        // );
        // // collect OTP from user
        // await confirmSignIn({
        //   code: otpCode,
        // });
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

  if (flow === 'totpSetup' || flow === 'signIn') {
    return (
      <div>
        <div>
          <h1>Please use the link below to setup TOTP:</h1>
          <p>{totpSetupUri.href}</p>
          <br />
          <label htmlFor='otpCode'>OTP Code:</label>
          <input type='text' id='otpCode' name='otpCode' />
          <br />
          <br />
          <button 
            onClick={async () => {
              const otpCode = document.getElementById('otpCode').value;
              if (flow === 'totpSetup') {
                await verifyTOTPSetup({
                  code: otpCode,
                }).then(() => {
                  updateMFAPreference({
                    sms: 'DISABLED',
                    totp: 'PREFERRED',
                  }).then(() => {
                    setFlow('null');
                    alert(
                      'TOTP updated, you can sign out and resign-in with new TOTP now'
                    );
                  });
                });
              } else if (flow === 'signIn') {
                await confirmSignIn({
                  challengeResponse: otpCode,
                }).then(() => {
                  setFlow('null');
                  alert('OTP code verified');
                });
              }
            }}
          >
            Submit
          </button>
        </div>
      </div>
    );
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
            <button
              onClick={() => {
                setUpTOTP().then((response) => {
                  console.log(response.getSetupUri('demo'));
                  setFlow('totpSetup');
                  setTotpSetupUri(response.getSetupUri('demo'));

                  // collect OTP from user
                  // verifyTOTPSetup({
                  //   code: otpCode,
                  // }).then(() => {
                  //   updateMFAPreference({
                  //     sms: 'DISABLED',
                  //     totp: 'PREFERRED',
                  //   }).then(() => {
                  //     alert(
                  //       'TOTP updated, you can sign out and resign-in with new TOTP now'
                  //     );
                  //   });
                  // });
                });
              }}
            >
              Setup TOTP
            </button>
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
        <br />
        <input
          type='text'
          id='email'
          name='email'
          placeholder='test@email.com'
        />
        <br />
        <br />
        <label htmlFor='password'>Password: (HelloWorld0101!)</label>
        <br />
        <input type='password' id='password' name='password' />
        <br />
        <br />
        <button type='submit'> Login </button>
      </form>
    );
  }
}
