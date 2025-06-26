import { UserController } from 'controllers';
import { StateManagement } from 'lib';
import { AuthUser } from 'types';

export const refreshAccessToken = async () => {
  const { tokens, user } = StateManagement.store.getState().auth;

  if (!tokens?.refreshToken || !user) return;

  try {
    const response = await UserController.refreshToken(tokens.refreshToken);

    if (response.success && response.data) {
      const newData: AuthUser = {
        user,
        tokens: response.data.tokens,
        isAuthenticated: true
      };

      console.log(response);

      StateManagement.store.dispatch(
        StateManagement.AuthReducer.login(newData)
      );
    }
  } catch (error) {
    console.error('Failed to refresh token', error);
  }
};
