
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider, useMutation } from '@apollo/client';
import client from './apolloClient';
import { REQUEST_PASSWORD_RESET, RESET_PASSWORD } from './mutations';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [requestPasswordReset, { data: requestData, loading: requestLoading, error: requestError }] = useMutation(REQUEST_PASSWORD_RESET);
  const [resetPassword, { data: resetData, loading: resetLoading, error: resetError }] = useMutation(RESET_PASSWORD);

  const handleRequestPasswordReset = async () => {
    try {
      const response = await requestPasswordReset({ variables: { emailAddress: email } });
      const { requestPasswordReset } = response.data;
      if (requestPasswordReset.__typename === 'Success') {
        console.log('Password reset request successful.');
      } else {
        console.error(`Error: ${requestPasswordReset.errorCode} - ${requestPasswordReset.message}`);
      }
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await resetPassword({ variables: { token, password: newPassword } });
      const { resetPassword } = response.data;
      if (resetPassword.__typename === 'CurrentUser') {
        console.log('Password reset successful.');
      } else {
        console.error(`Error: ${resetPassword.errorCode} - ${resetPassword.message}`);
      }
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  return (
    <div>
      <div>
        <h2>Request Password Reset</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <button onClick={handleRequestPasswordReset}>Request Password Reset</button>
        {requestLoading && <p>Loading...</p>}
        {requestError && <p>Error: {requestError.message}</p>}
        {requestData && requestData.requestPasswordReset.__typename === 'Success' && <p>Password reset request successful.</p>}
        {requestData && requestData.requestPasswordReset.__typename === 'ErrorResult' && (
          <p>Error: {requestData.requestPasswordReset.errorCode} - {requestData.requestPasswordReset.message}</p>
        )}
      </div>
      <div>
        <h2>Reset Password</h2>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter the token"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
        <button onClick={handleResetPassword}>Reset Password</button>
        {resetLoading && <p>Loading...</p>}
        {resetError && <p>Error: {resetError.message}</p>}
        {resetData && resetData.resetPassword.__typename === 'CurrentUser' && <p>Password reset successful.</p>}
        {resetData && resetData.resetPassword.__typename === 'ErrorResult' && (
          <p>Error: {resetData.resetPassword.errorCode} - {resetData.resetPassword.message}</p>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(
  <ApolloProvider client={client}>
    <PasswordReset />
  </ApolloProvider>,
  document.getElementById('root')
);
